import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../models/database.js';

const router = express.Router();

// Check if this is first run (no profiles exist)
router.get('/first-run', (req, res) => {
  try {
    const db = getDatabase();
    const count = db.prepare('SELECT COUNT(*) as count FROM children').get();
    res.json({ isFirstRun: count.count === 0 });
  } catch (error) {
    console.error('First run check error:', error);
    res.status(500).json({ error: 'Failed to check first run status' });
  }
});

// Setup first admin profile
router.post('/setup', (req, res) => {
  try {
    const db = getDatabase();

    // Check if profiles already exist
    const count = db.prepare('SELECT COUNT(*) as count FROM children').get();
    if (count.count > 0) {
      return res.status(400).json({ error: 'Setup already completed. Use settings to add more profiles.' });
    }

    const { name, pin } = req.body;

    if (!name || !pin || pin.length !== 4) {
      return res.status(400).json({ error: 'Name and 4-digit PIN are required' });
    }

    const id = uuidv4();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    db.prepare(`
      INSERT INTO children (id, name, avatar, role, pin, points, has_tv_access, unlocked_hours)
      VALUES (?, ?, ?, 'Adulto', ?, 0, 1, 24)
    `).run(id, name, avatar, pin);

    const member = db.prepare('SELECT id, name, avatar, role, points FROM children WHERE id = ?').get(id);

    res.json({ success: true, member });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Failed to create admin profile' });
  }
});

// Verify PIN for login
router.post('/verify-pin', (req, res) => {
  const { memberId, pin } = req.body;
  
  if (!memberId || !pin) {
    return res.status(400).json({ error: 'Member ID and PIN are required' });
  }
  
  try {
    const db = getDatabase();
    const member = db.prepare('SELECT * FROM children WHERE id = ?').get(memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Simple PIN comparison (in production, use bcrypt)
    if (member.pin === pin) {
      // Remove sensitive data
      delete member.pin;
      return res.json({ success: true, member });
    } else {
      return res.status(401).json({ error: 'Invalid PIN' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Check if user is admin
router.get('/check-admin/:memberId', (req, res) => {
  try {
    const db = getDatabase();
    const member = db.prepare('SELECT role FROM children WHERE id = ?').get(req.params.memberId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ isAdmin: member.role === 'Adulto' });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

export default router;
