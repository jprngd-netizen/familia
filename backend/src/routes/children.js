import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../models/database.js';

const router = express.Router();

// Get all children
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const children = db.prepare(`
      SELECT
        id, name, avatar, role, birthday, pin,
        points, unlocked_hours, has_tv_access,
        current_streak, longest_streak, last_streak_date,
        theme_preference, created_at, updated_at
      FROM children
      ORDER BY role DESC, name ASC
    `).all();

    // Get tasks for each child
    const childrenWithTasks = children.map(child => {
      const tasks = db.prepare('SELECT * FROM tasks WHERE child_id = ? ORDER BY created_at DESC').all(child.id);
      const punishments = db.prepare('SELECT * FROM punishments WHERE child_id = ? ORDER BY created_at DESC').all(child.id);
      
      return {
        ...child,
        hasTVAccess: Boolean(child.has_tv_access),
        unlockedHours: child.unlocked_hours,
        currentStreak: child.current_streak || 0,
        longestStreak: child.longest_streak || 0,
        themePreference: child.theme_preference || 'system',
        tasks: tasks.map(t => ({
          ...t,
          completed: Boolean(t.completed),
          schedule: {
            start: t.schedule_start,
            end: t.schedule_end
          }
        })),
        punishments
      };
    });

    res.json(childrenWithTasks);
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// Get single child
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const child = db.prepare('SELECT * FROM children WHERE id = ?').get(req.params.id);
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const tasks = db.prepare('SELECT * FROM tasks WHERE child_id = ?').all(child.id);
    const punishments = db.prepare('SELECT * FROM punishments WHERE child_id = ?').all(child.id);

    res.json({
      ...child,
      hasTVAccess: Boolean(child.has_tv_access),
      tasks,
      punishments
    });
  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

// Create new child
router.post('/', (req, res) => {
  try {
    const { name, avatar, role, birthday, pin } = req.body;
    
    if (!name || !avatar || !role || !birthday || !pin) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO children (id, name, avatar, role, birthday, pin, points, unlocked_hours, has_tv_access)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0)
    `);
    
    stmt.run(id, name, avatar, role, birthday, pin);
    
    const newChild = db.prepare('SELECT * FROM children WHERE id = ?').get(id);
    
    res.status(201).json({ 
      ...newChild, 
      hasTVAccess: false,
      tasks: [],
      punishments: []
    });
  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({ error: 'Failed to create child' });
  }
});

// Update child
router.put('/:id', (req, res) => {
  try {
    const { name, avatar, role, birthday, pin, points, unlockedHours, hasTVAccess, themePreference } = req.body;
    const db = getDatabase();

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (birthday !== undefined) { updates.push('birthday = ?'); values.push(birthday); }
    if (pin !== undefined) { updates.push('pin = ?'); values.push(pin); }
    if (points !== undefined) { updates.push('points = ?'); values.push(points); }
    if (unlockedHours !== undefined) { updates.push('unlocked_hours = ?'); values.push(unlockedHours); }
    if (hasTVAccess !== undefined) { updates.push('has_tv_access = ?'); values.push(hasTVAccess ? 1 : 0); }
    if (themePreference !== undefined) { updates.push('theme_preference = ?'); values.push(themePreference); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    const stmt = db.prepare(`UPDATE children SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    const updated = db.prepare('SELECT * FROM children WHERE id = ?').get(req.params.id);
    res.json({ ...updated, themePreference: updated.theme_preference || 'system' });
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({ error: 'Failed to update child' });
  }
});

// Delete child
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM children WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    res.json({ success: true, message: 'Child deleted' });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({ error: 'Failed to delete child' });
  }
});

// Adjust points
router.post('/:id/adjust-points', (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const db = getDatabase();
    const child = db.prepare('SELECT * FROM children WHERE id = ?').get(req.params.id);
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const newPoints = Math.max(0, child.points + amount);
    db.prepare('UPDATE children SET points = ? WHERE id = ?').run(newPoints, req.params.id);
    
    // Log the action
    const logId = uuidv4();
    db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(logId, child.id, child.name, reason || `Pontos ajustados: ${amount > 0 ? '+' : ''}${amount}`, amount > 0 ? 'success' : 'warning');
    
    res.json({ success: true, newPoints });
  } catch (error) {
    console.error('Adjust points error:', error);
    res.status(500).json({ error: 'Failed to adjust points' });
  }
});

// Quick unlock (add unlocked hours)
router.post('/:id/quick-unlock', (req, res) => {
  try {
    const { hours = 1 } = req.body;
    const db = getDatabase();
    
    const child = db.prepare('SELECT * FROM children WHERE id = ?').get(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const newHours = child.unlocked_hours + hours;
    db.prepare('UPDATE children SET unlocked_hours = ? WHERE id = ?').run(newHours, req.params.id);
    
    // Log the action
    const logId = uuidv4();
    db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(logId, child.id, child.name, `Desbloqueio rápido: +${hours}h`, 'info');
    
    res.json({ success: true, unlockedHours: newHours });
  } catch (error) {
    console.error('Quick unlock error:', error);
    res.status(500).json({ error: 'Failed to unlock' });
  }
});

// Toggle TV access
router.post('/:id/toggle-tv', (req, res) => {
  try {
    const db = getDatabase();
    const child = db.prepare('SELECT * FROM children WHERE id = ?').get(req.params.id);
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const newTVAccess = child.has_tv_access ? 0 : 1;
    db.prepare('UPDATE children SET has_tv_access = ? WHERE id = ?').run(newTVAccess, req.params.id);
    
    res.json({ success: true, hasTVAccess: Boolean(newTVAccess) });
  } catch (error) {
    console.error('Toggle TV error:', error);
    res.status(500).json({ error: 'Failed to toggle TV access' });
  }
});

export default router;
