import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../models/database.js';

const router = express.Router();

// Get recent activity logs
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const db = getDatabase();
    
    const logs = db.prepare(`
      SELECT * FROM activity_logs 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);
    
    res.json(logs.map(log => ({
      ...log,
      timestamp: new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    })));
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get logs for specific child
router.get('/child/:childId', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const db = getDatabase();
    
    const logs = db.prepare(`
      SELECT * FROM activity_logs 
      WHERE child_id = ?
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(req.params.childId, limit);
    
    res.json(logs.map(log => ({
      ...log,
      timestamp: new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    })));
  } catch (error) {
    console.error('Get child logs error:', error);
    res.status(500).json({ error: 'Failed to fetch child logs' });
  }
});

// Create new log entry
router.post('/', (req, res) => {
  try {
    const { childId, childName, action, type = 'info' } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const db = getDatabase();
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, childId || null, childName || null, action, type);
    
    const newLog = db.prepare('SELECT * FROM activity_logs WHERE id = ?').get(id);
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// Clear old logs (keep last N days)
router.delete('/cleanup', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const db = getDatabase();
    
    const stmt = db.prepare(`
      DELETE FROM activity_logs 
      WHERE created_at < datetime('now', '-' || ? || ' days')
    `);
    
    const result = stmt.run(days);
    
    res.json({ 
      success: true, 
      deleted: result.changes,
      message: `Deleted logs older than ${days} days` 
    });
  } catch (error) {
    console.error('Cleanup logs error:', error);
    res.status(500).json({ error: 'Failed to cleanup logs' });
  }
});

export default router;
