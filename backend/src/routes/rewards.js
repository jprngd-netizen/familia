import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../models/database.js';

const router = express.Router();

// Get all rewards
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const rewards = db.prepare('SELECT * FROM rewards ORDER BY cost ASC').all();
    res.json(rewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// Create new reward
router.post('/', (req, res) => {
  try {
    const { title, description, cost, icon, category } = req.body;
    
    if (!title || cost === undefined) {
      return res.status(400).json({ error: 'Title and cost are required' });
    }

    const db = getDatabase();
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO rewards (id, title, description, cost, icon, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, title, description || '', cost, icon || '🎁', category || 'Digital');
    
    const newReward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);
    res.status(201).json(newReward);
  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// Update reward
router.put('/:id', (req, res) => {
  try {
    const { title, description, cost, icon, category } = req.body;
    const db = getDatabase();
    
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (cost !== undefined) { updates.push('cost = ?'); values.push(cost); }
    if (icon !== undefined) { updates.push('icon = ?'); values.push(icon); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    
    values.push(req.params.id);
    
    const stmt = db.prepare(`UPDATE rewards SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    const updated = db.prepare('SELECT * FROM rewards WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update reward error:', error);
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

// Delete reward
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM rewards WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    res.json({ success: true, message: 'Reward deleted' });
  } catch (error) {
    console.error('Delete reward error:', error);
    res.status(500).json({ error: 'Failed to delete reward' });
  }
});

// Redeem reward
router.post('/:id/redeem', (req, res) => {
  try {
    const { childId } = req.body;
    
    if (!childId) {
      return res.status(400).json({ error: 'Child ID is required' });
    }

    const db = getDatabase();
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(req.params.id);
    const child = db.prepare('SELECT * FROM children WHERE id = ?').get(childId);
    
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    if (child.points < reward.cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Check if reward requires approval (>1000 points)
    if (reward.cost > 1000) {
      // Create reward request
      const requestId = uuidv4();
      db.prepare(`
        INSERT INTO reward_requests (id, child_id, child_name, reward_id, reward_title, cost, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `).run(requestId, child.id, child.name, reward.id, reward.title, reward.cost);
      
      // Deduct points (will be returned if denied)
      const newPoints = child.points - reward.cost;
      db.prepare('UPDATE children SET points = ? WHERE id = ?').run(newPoints, child.id);
      
      // Log the action
      const logId = uuidv4();
      db.prepare(`
        INSERT INTO activity_logs (id, child_id, child_name, action, type)
        VALUES (?, ?, ?, ?, ?)
      `).run(logId, child.id, child.name, `Solicitou "${reward.title}" - Aguardando aprovação`, 'info');
      
      return res.json({ 
        success: true, 
        requiresApproval: true, 
        requestId,
        message: 'Pedido enviado para aprovação' 
      });
    }
    
    // Immediate redemption
    const newPoints = child.points - reward.cost;
    db.prepare('UPDATE children SET points = ? WHERE id = ?').run(newPoints, child.id);
    
    // Log the action
    const logId = uuidv4();
    db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(logId, child.id, child.name, `Resgatou "${reward.title}"`, 'success');
    
    res.json({ 
      success: true, 
      requiresApproval: false,
      newPoints,
      message: 'Recompensa resgatada com sucesso!' 
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

// Get pending reward requests
router.get('/requests/pending', (req, res) => {
  try {
    const db = getDatabase();
    const requests = db.prepare(`
      SELECT * FROM reward_requests 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `).all();
    
    res.json(requests.map(r => ({
      ...r,
      timestamp: new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    })));
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Process reward request (approve/deny)
router.post('/requests/:id/process', (req, res) => {
  try {
    const { approve } = req.body;
    
    if (approve === undefined) {
      return res.status(400).json({ error: 'Approve status is required' });
    }

    const db = getDatabase();
    const request = db.prepare('SELECT * FROM reward_requests WHERE id = ?').get(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (approve) {
      // Approve - just update status
      db.prepare('UPDATE reward_requests SET status = ? WHERE id = ?').run('approved', req.params.id);
      
      // Log approval
      const logId = uuidv4();
      db.prepare(`
        INSERT INTO activity_logs (id, child_id, child_name, action, type)
        VALUES (?, ?, ?, ?, ?)
      `).run(logId, request.child_id, request.child_name, `Aprovado: Resgate de "${request.reward_title}"`, 'success');
    } else {
      // Deny - return points
      const child = db.prepare('SELECT * FROM children WHERE id = ?').get(request.child_id);
      const newPoints = child.points + request.cost;
      db.prepare('UPDATE children SET points = ? WHERE id = ?').run(newPoints, request.child_id);
      
      db.prepare('UPDATE reward_requests SET status = ? WHERE id = ?').run('denied', req.params.id);
      
      // Log denial
      const logId = uuidv4();
      db.prepare(`
        INSERT INTO activity_logs (id, child_id, child_name, action, type)
        VALUES (?, ?, ?, ?, ?)
      `).run(logId, request.child_id, request.child_name, `Negado: Resgate de "${request.reward_title}". Pontos devolvidos.`, 'warning');
    }
    
    res.json({ success: true, approved: approve });
  } catch (error) {
    console.error('Process request error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

export default router;
