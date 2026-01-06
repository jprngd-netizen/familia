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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      title TEXT NOT NULL,
      points INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
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

  console.log('✅ Database schema created successfully');
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

export default { getDatabase, initDatabase, closeDatabase };
