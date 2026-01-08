import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, '../../database/portal_familia.db');

// Ensure database directory exists
const dbDir = dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

export function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDatabase() {
  const db = getDatabase();

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Criança', 'Adulto', 'Visitante', 'Empregado(a)', 'Outros')),
      birthday TEXT NOT NULL,
      pin TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      unlocked_hours INTEGER DEFAULT 0,
      has_tv_access INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_streak_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      title TEXT NOT NULL,
      points INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      category TEXT NOT NULL CHECK(category IN ('School', 'Chores', 'Health', 'Personal')),
      recurrence TEXT CHECK(recurrence IN ('none', 'daily', 'weekdays', 'weekends', 'weekly')),
      schedule_start TEXT,
      schedule_end TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      cost INTEGER NOT NULL,
      icon TEXT,
      category TEXT CHECK(category IN ('Digital', 'Lazer', 'Guloseimas', 'Eventos')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reward_requests (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      child_name TEXT NOT NULL,
      reward_id TEXT NOT NULL,
      reward_title TEXT NOT NULL,
      cost INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'denied')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS punishments (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Block', 'PointLoss')),
      duration INTEGER,
      reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('tablet', 'console', 'laptop', 'tv', 'smartphone')),
      mac TEXT NOT NULL UNIQUE,
      ip TEXT,
      status TEXT DEFAULT 'offline' CHECK(status IN ('online', 'offline')),
      is_blocked INTEGER DEFAULT 0,
      assigned_to TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES children(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      child_id TEXT,
      child_name TEXT,
      action TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('success', 'warning', 'info', 'error')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      theme TEXT DEFAULT 'light' CHECK(theme IN ('light', 'dark')),
      notify_task_completed INTEGER DEFAULT 1,
      notify_reward_redeemed INTEGER DEFAULT 1,
      notify_punishment_applied INTEGER DEFAULT 1,
      telegram_bot_token TEXT,
      telegram_chat_id TEXT,
      telegram_enabled INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      category TEXT CHECK(category IN ('Escola', 'Lazer', 'Médico', 'Extra')),
      attendees TEXT,
      source TEXT DEFAULT 'local' CHECK(source IN ('local', 'google', 'microsoft')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_tasks_child_id ON tasks(child_id);
    CREATE INDEX IF NOT EXISTS idx_devices_mac ON devices(mac);
    CREATE INDEX IF NOT EXISTS idx_logs_child_id ON activity_logs(child_id);
    CREATE INDEX IF NOT EXISTS idx_logs_created_at ON activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_reward_requests_status ON reward_requests(status);

    -- Insert default settings if not exists
    INSERT OR IGNORE INTO system_settings (id) VALUES (1);
  `);

  // Run migrations for existing databases
    try {
      // Add streak columns to children if they don't exist
      const childrenInfo = db.prepare("PRAGMA table_info(children)").all();
      const childrenCols = childrenInfo.map(c => c.name);

      if (!childrenCols.includes('current_streak')) {
        db.exec('ALTER TABLE children ADD COLUMN current_streak INTEGER DEFAULT 0');
      }
      if (!childrenCols.includes('longest_streak')) {
        db.exec('ALTER TABLE children ADD COLUMN longest_streak INTEGER DEFAULT 0');
      }
      if (!childrenCols.includes('last_streak_date')) {
        db.exec('ALTER TABLE children ADD COLUMN last_streak_date TEXT');
      }

      // Add completed_at to tasks if it doesn't exist
      const tasksInfo = db.prepare("PRAGMA table_info(tasks)").all();
      const tasksCols = tasksInfo.map(c => c.name);

      if (!tasksCols.includes('completed_at')) {
        db.exec('ALTER TABLE tasks ADD COLUMN completed_at TEXT');
      }
    } catch (error) {
      // Columns might already exist, ignore errors
    }

  console.log('✅ Database schema created successfully');
  return db;
}

// Reset daily/recurring tasks at midnight
export function resetDailyTasks() {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Get tasks that need to be reset
  const tasksToReset = db.prepare(`
    SELECT id, recurrence, completed_at FROM tasks
    WHERE completed = 1
    AND recurrence != 'none'
    AND (completed_at IS NULL OR date(completed_at) < date(?))
  `).all(today);

  let resetCount = 0;

  for (const task of tasksToReset) {
    let shouldReset = false;

    switch (task.recurrence) {
      case 'daily':
        shouldReset = true;
        break;
      case 'weekdays':
        shouldReset = isWeekday;
        break;
      case 'weekends':
        shouldReset = isWeekend;
        break;
      case 'weekly':
        // Reset if completed more than 7 days ago
        if (task.completed_at) {
          const completedDate = new Date(task.completed_at);
          const daysSince = Math.floor((Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
          shouldReset = daysSince >= 7;
        } else {
          shouldReset = true;
        }
        break;
    }

    if (shouldReset) {
      db.prepare('UPDATE tasks SET completed = 0, completed_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(task.id);
      resetCount++;
    }
  }

  if (resetCount > 0) {
    console.log(`🔄 Reset ${resetCount} recurring tasks`);
  }

  return resetCount;
}

// Update streak for a child
export function updateStreak(childId) {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const child = db.prepare('SELECT current_streak, longest_streak, last_streak_date FROM children WHERE id = ?').get(childId);
  if (!child) return null;

  let newStreak = child.current_streak || 0;
  let longestStreak = child.longest_streak || 0;

  if (child.last_streak_date) {
    const lastDate = new Date(child.last_streak_date);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change
      return { currentStreak: newStreak, longestStreak };
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStreak++;
    } else {
      // Missed a day, reset streak
      newStreak = 1;
    }
  } else {
    // First task ever
    newStreak = 1;
  }

  // Update longest streak if needed
  if (newStreak > longestStreak) {
    longestStreak = newStreak;
  }

  // Save to database
  db.prepare(`
    UPDATE children
    SET current_streak = ?, longest_streak = ?, last_streak_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newStreak, longestStreak, today, childId);

  return { currentStreak: newStreak, longestStreak };
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

export default { getDatabase, initDatabase, closeDatabase };
