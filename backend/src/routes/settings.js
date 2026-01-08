import express from 'express';
import { getDatabase } from '../models/database.js';
import { sendTestMessage } from '../utils/telegram.js';

const router = express.Router();

// Get system settings
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const settings = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    
    if (!settings) {
      // Create default settings if not exists
      db.prepare('INSERT INTO system_settings (id) VALUES (1)').run();
      const newSettings = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
      return res.json(formatSettings(newSettings));
    }
    
    res.json(formatSettings(settings));
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update system settings
router.put('/', (req, res) => {
  try {
    const { 
      theme, 
      notifications, 
      telegram 
    } = req.body;
    
    const db = getDatabase();
    const updates = [];
    const values = [];
    
    if (theme !== undefined) { 
      updates.push('theme = ?'); 
      values.push(theme); 
    }
    
    if (notifications) {
      if (notifications.taskCompleted !== undefined) {
        updates.push('notify_task_completed = ?');
        values.push(notifications.taskCompleted ? 1 : 0);
      }
      if (notifications.rewardRedeemed !== undefined) {
        updates.push('notify_reward_redeemed = ?');
        values.push(notifications.rewardRedeemed ? 1 : 0);
      }
      if (notifications.punishmentApplied !== undefined) {
        updates.push('notify_punishment_applied = ?');
        values.push(notifications.punishmentApplied ? 1 : 0);
      }
    }
    
    if (telegram) {
      if (telegram.botToken !== undefined) {
        updates.push('telegram_bot_token = ?');
        values.push(telegram.botToken);
      }
      if (telegram.chatId !== undefined) {
        updates.push('telegram_chat_id = ?');
        values.push(telegram.chatId);
      }
      if (telegram.enabled !== undefined) {
        updates.push('telegram_enabled = ?');
        values.push(telegram.enabled ? 1 : 0);
      }
    }
    
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(1); // id = 1
      
      const stmt = db.prepare(`UPDATE system_settings SET ${updates.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
    
    const updated = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    res.json(formatSettings(updated));
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Helper function to format settings
function formatSettings(settings) {
  return {
    theme: settings.theme,
    notifications: {
      taskCompleted: Boolean(settings.notify_task_completed),
      rewardRedeemed: Boolean(settings.notify_reward_redeemed),
      punishmentApplied: Boolean(settings.notify_punishment_applied)
    },
    telegram: {
      botToken: settings.telegram_bot_token || '',
      chatId: settings.telegram_chat_id || '',
      enabled: Boolean(settings.telegram_enabled)
    }
  };
}

// Send test Telegram message
router.post('/telegram/test', async (req, res) => {
  try {
    const result = await sendTestMessage();

    if (result.success) {
      res.json({ success: true, message: 'Mensagem de teste enviada com sucesso!' });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Test message error:', error);
    res.status(500).json({ success: false, error: 'Falha ao enviar mensagem de teste' });
  }
});

export default router;
