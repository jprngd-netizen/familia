
import express from 'express';
import { getDatabase } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Helper to convert DB row to API format
function formatNotice(row) {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorRole: row.author_role,
    content: row.content,
    hiddenByAuthor: !!row.hidden_by_author,
    deletedByParent: !!row.deleted_by_parent,
    createdAt: row.created_at
  };
}

// GET /api/notices - Get all notices
// Query params: ?viewerRole=Adulto|Criança&viewerId=xxx
router.get('/', (req, res) => {
  const db = getDatabase();
  const { viewerRole, viewerId } = req.query;

  let notices;

  if (viewerRole === 'Adulto') {
    // Adults see everything except permanently deleted notices
    notices = db.prepare(`
      SELECT * FROM notices
      WHERE deleted_by_parent = 0
      ORDER BY created_at DESC
    `).all();
  } else {
    // Children see:
    // - All notices not hidden by their author AND not deleted
    // - Their own notices (even if hidden by them)
    notices = db.prepare(`
      SELECT * FROM notices
      WHERE deleted_by_parent = 0
        AND (hidden_by_author = 0 OR author_id = ?)
      ORDER BY created_at DESC
    `).all(viewerId || '');
  }

  res.json(notices.map(formatNotice));
});

// POST /api/notices - Create a notice
router.post('/', (req, res) => {
  const db = getDatabase();
  const { authorId, authorName, authorRole, content } = req.body;

  if (!authorId || !content) {
    return res.status(400).json({ error: 'authorId and content are required' });
  }

  const id = uuidv4();

  try {
    db.prepare(`
      INSERT INTO notices (id, author_id, author_name, author_role, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, authorId, authorName || 'Anônimo', authorRole || 'Outros', content);

    const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(id);

    // Log the action
    db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), authorId, authorName, `📌 Adicionou aviso no mural`, 'info');

    res.status(201).json(formatNotice(notice));
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// PUT /api/notices/:id/hide - Hide notice (author only - children)
router.put('/:id/hide', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { authorId } = req.body;

  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(id);

  if (!notice) {
    return res.status(404).json({ error: 'Notice not found' });
  }

  // Only the author can hide their own notice
  if (notice.author_id !== authorId) {
    return res.status(403).json({ error: 'Only the author can hide this notice' });
  }

  try {
    db.prepare('UPDATE notices SET hidden_by_author = 1 WHERE id = ?').run(id);

    // Log the action
    db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), notice.author_id, notice.author_name, `🙈 Ocultou seu aviso do mural`, 'info');

    res.json({ success: true, message: 'Notice hidden' });
  } catch (error) {
    console.error('Error hiding notice:', error);
    res.status(500).json({ error: 'Failed to hide notice' });
  }
});

// PUT /api/notices/:id/unhide - Unhide notice (author only)
router.put('/:id/unhide', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { authorId } = req.body;

  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(id);

  if (!notice) {
    return res.status(404).json({ error: 'Notice not found' });
  }

  if (notice.author_id !== authorId) {
    return res.status(403).json({ error: 'Only the author can unhide this notice' });
  }

  try {
    db.prepare('UPDATE notices SET hidden_by_author = 0 WHERE id = ?').run(id);
    res.json({ success: true, message: 'Notice visible again' });
  } catch (error) {
    console.error('Error unhiding notice:', error);
    res.status(500).json({ error: 'Failed to unhide notice' });
  }
});

// DELETE /api/notices/:id - Delete notice (parents only can permanently delete)
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { requesterRole, requesterId } = req.query;

  const notice = db.prepare('SELECT * FROM notices WHERE id = ?').get(id);

  if (!notice) {
    return res.status(404).json({ error: 'Notice not found' });
  }

  // Only adults can permanently delete
  if (requesterRole !== 'Adulto') {
    return res.status(403).json({ error: 'Only adults can permanently delete notices' });
  }

  try {
    db.prepare('UPDATE notices SET deleted_by_parent = 1 WHERE id = ?').run(id);

    // Log the action
    const requester = db.prepare('SELECT name FROM children WHERE id = ?').get(requesterId);
    db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), requesterId, requester?.name || 'Admin', `🗑️ Removeu aviso do mural: "${notice.content.substring(0, 30)}..."`, 'warning');

    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

export default router;
