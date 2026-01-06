import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../models/database.js';

const router = express.Router();

// Get all tasks for a child
router.get('/child/:childId', (req, res) => {
  try {
    const db = getDatabase();
    const tasks = db.prepare('SELECT * FROM tasks WHERE child_id = ? ORDER BY created_at DESC').all(req.params.childId);
    
    res.json(tasks.map(t => ({
      ...t,
      completed: Boolean(t.completed),
      schedule: {
        start: t.schedule_start,
        end: t.schedule_end
      }
    })));
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create new task
router.post('/', (req, res) => {
  try {
    const { childId, title, points, category, recurrence, schedule } = req.body;
    
    if (!childId || !title || points === undefined || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO tasks (id, child_id, title, points, completed, category, recurrence, schedule_start, schedule_end)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, 
      childId, 
      title, 
      points, 
      category, 
      recurrence || 'none',
      schedule?.start || null,
      schedule?.end || null
    );
    
    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    
    // Log the action
    const child = db.prepare('SELECT name FROM children WHERE id = ?').get(childId);
    const logId = uuidv4();
    db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(logId, childId, child.name, `Nova tarefa criada: "${title}"`, 'info');
    
    res.status(201).json({
      ...newTask,
      completed: false,
      schedule: {
        start: newTask.schedule_start,
        end: newTask.schedule_end
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Toggle task completion
router.post('/:id/toggle', (req, res) => {
  try {
    const db = getDatabase();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newCompleted = task.completed ? 0 : 1;
    db.prepare('UPDATE tasks SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newCompleted, req.params.id);
    
    // Update child points
    const child = db.prepare('SELECT * FROM children WHERE id = ?').get(task.child_id);
    const pointsChange = newCompleted ? task.points : -task.points;
    const newPoints = Math.max(0, child.points + pointsChange);
    
    db.prepare('UPDATE children SET points = ? WHERE id = ?').run(newPoints, child.id);
    
    // Log the action
    const logId = uuidv4();
    const action = newCompleted ? `Completou "${task.title}" (+${task.points} pontos)` : `Desmarcou "${task.title}" (-${task.points} pontos)`;
    db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(logId, child.id, child.name, action, newCompleted ? 'success' : 'warning');
    
    res.json({ success: true, completed: Boolean(newCompleted), newPoints });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

// Update task
router.put('/:id', (req, res) => {
  try {
    const { title, points, category, recurrence, schedule } = req.body;
    const db = getDatabase();
    
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (points !== undefined) { updates.push('points = ?'); values.push(points); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (recurrence !== undefined) { updates.push('recurrence = ?'); values.push(recurrence); }
    if (schedule?.start !== undefined) { updates.push('schedule_start = ?'); values.push(schedule.start); }
    if (schedule?.end !== undefined) { updates.push('schedule_end = ?'); values.push(schedule.end); }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);
    
    const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
