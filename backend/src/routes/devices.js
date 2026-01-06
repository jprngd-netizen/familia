import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../models/database.js';
import { blockDevice, unblockDevice, getFirewallStatus, scheduleTemporaryUnblock } from '../utils/firewall.js';

const router = express.Router();

// Get all devices
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const devices = db.prepare('SELECT * FROM devices ORDER BY name ASC').all();
    
    res.json(devices.map(d => ({
      ...d,
      isBlocked: Boolean(d.is_blocked)
    })));
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Create new device
router.post('/', (req, res) => {
  try {
    const { name, type, mac, assignedTo } = req.body;
    
    if (!name || !type || !mac) {
      return res.status(400).json({ error: 'Name, type, and MAC address are required' });
    }

    // Validate MAC address format
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(mac)) {
      return res.status(400).json({ error: 'Invalid MAC address format' });
    }

    const db = getDatabase();
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO devices (id, name, type, mac, ip, status, is_blocked, assigned_to)
      VALUES (?, ?, ?, ?, NULL, 'offline', 0, ?)
    `);
    
    stmt.run(id, name, type, mac.toUpperCase(), assignedTo || null);
    
    const newDevice = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
    res.status(201).json({
      ...newDevice,
      isBlocked: false
    });
  } catch (error) {
    console.error('Create device error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Device with this MAC address already exists' });
    }
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Update device
router.put('/:id', (req, res) => {
  try {
    const { name, type, mac, ip, status, assignedTo } = req.body;
    const db = getDatabase();
    
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (mac !== undefined) { 
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(mac)) {
        return res.status(400).json({ error: 'Invalid MAC address format' });
      }
      updates.push('mac = ?'); 
      values.push(mac.toUpperCase()); 
    }
    if (ip !== undefined) { updates.push('ip = ?'); values.push(ip); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (assignedTo !== undefined) { updates.push('assigned_to = ?'); values.push(assignedTo); }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);
    
    const stmt = db.prepare(`UPDATE devices SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    const updated = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Delete device
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase();
    
    // First, unblock the device if it's blocked
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    if (device && device.is_blocked) {
      unblockDevice(device.mac, device.ip);
    }
    
    const stmt = db.prepare('DELETE FROM devices WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json({ success: true, message: 'Device deleted' });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

// Toggle device block (firewall integration)
router.post('/:id/toggle-block', async (req, res) => {
  try {
    const db = getDatabase();
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const newBlockedState = device.is_blocked ? 0 : 1;
    
    // Apply firewall rule
    let firewallResult;
    if (newBlockedState) {
      firewallResult = await blockDevice(device.mac, device.ip);
    } else {
      firewallResult = await unblockDevice(device.mac, device.ip);
    }
    
    if (!firewallResult.success && process.env.ENABLE_FIREWALL === 'true') {
      return res.status(500).json({ 
        error: 'Failed to apply firewall rule', 
        details: firewallResult.error 
      });
    }
    
    // Update database
    db.prepare('UPDATE devices SET is_blocked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newBlockedState, req.params.id);
    
    // Log the action
    if (device.assigned_to) {
      const child = db.prepare('SELECT name FROM children WHERE id = ?').get(device.assigned_to);
      if (child) {
        const logId = uuidv4();
        const action = newBlockedState 
          ? `Dispositivo "${device.name}" bloqueado` 
          : `Dispositivo "${device.name}" desbloqueado`;
        
        db.prepare(`
          INSERT INTO activity_logs (id, child_id, child_name, action, type)
          VALUES (?, ?, ?, ?, ?)
        `).run(logId, device.assigned_to, child.name, action, newBlockedState ? 'warning' : 'success');
      }
    }
    
    res.json({ 
      success: true, 
      isBlocked: Boolean(newBlockedState),
      firewallApplied: firewallResult.success,
      message: firewallResult.message
    });
  } catch (error) {
    console.error('Toggle block error:', error);
    res.status(500).json({ error: 'Failed to toggle device block' });
  }
});

// Temporary unblock (for unlocked hours)
router.post('/:id/temporary-unblock', async (req, res) => {
  try {
    const { minutes = 60 } = req.body;
    
    const db = getDatabase();
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const result = await scheduleTemporaryUnblock(device.mac, device.ip, minutes);
    
    res.json(result);
  } catch (error) {
    console.error('Temporary unblock error:', error);
    res.status(500).json({ error: 'Failed to temporarily unblock device' });
  }
});

// Get firewall status
router.get('/firewall/status', async (req, res) => {
  try {
    const status = await getFirewallStatus();
    res.json({
      enabled: process.env.ENABLE_FIREWALL === 'true',
      type: process.env.FIREWALL_TYPE || 'iptables',
      ...status
    });
  } catch (error) {
    console.error('Get firewall status error:', error);
    res.status(500).json({ error: 'Failed to get firewall status' });
  }
});

export default router;
