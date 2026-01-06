import express from 'express';
import bcrypt from 'bcrypt';
import { getDatabase } from '../models/database.js';

const router = express.Router();

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
