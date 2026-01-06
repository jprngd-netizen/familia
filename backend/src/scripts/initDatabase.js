import { initDatabase, getDatabase } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

// Initialize database with mock data
function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');
  
  const db = getDatabase();
  
  // Get today's date for birthday test
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  try {
    // Check if data already exists
    const existingChildren = db.prepare('SELECT COUNT(*) as count FROM children').get();
    if (existingChildren.count > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      return;
    }
    
    // Insert children
    const children = [
      {
        id: 'c1',
        name: 'Henrique',
        avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Avatar_Aang.png/250px-Avatar_Aang.png',
        role: 'Criança',
        birthday: todayString,
        pin: '1234',
        points: 12500,
        unlocked_hours: 4,
        has_tv_access: 0
      },
      {
        id: 'c2',
        name: 'Beatriz',
        avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Web_Summit_2018_-_Forum_-_Day_2%2C_November_7_DSC_4716_%2845765938231%29_%28cropped%29.jpg/1006px-Web_Summit_2018_-_Forum_-_Day_2%2C_November_7_DSC_4716_%2845765938231%29_%28cropped%29.jpg',
        role: 'Criança',
        birthday: '2015-05-12',
        pin: '4321',
        points: 8500,
        unlocked_hours: 2,
        has_tv_access: 0
      },
      {
        id: 'p1',
        name: 'Papai/Mamãe',
        avatar: 'https://thumbs.dreamstime.com/b/black-family-icon-minimalistic-silhouette-two-parents-one-child-simple-flat-design-pictogram-representing-parenthood-395044144.jpg',
        role: 'Adulto',
        birthday: '1985-10-20',
        pin: '0000',
        points: 0,
        unlocked_hours: 24,
        has_tv_access: 1
      }
    ];
    
    const childStmt = db.prepare(`
      INSERT INTO children (id, name, avatar, role, birthday, pin, points, unlocked_hours, has_tv_access)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const child of children) {
      childStmt.run(
        child.id, child.name, child.avatar, child.role, child.birthday,
        child.pin, child.points, child.unlocked_hours, child.has_tv_access
      );
      console.log(`  ✅ Created child: ${child.name}`);
    }
    
    // Insert tasks
    const tasks = [
      { id: 't1', child_id: 'c1', title: 'Arrumar a cama', points: 200, category: 'Chores', recurrence: 'daily', schedule_end: '08:30' },
      { id: 't2', child_id: 'c1', title: 'Dever de casa', points: 1000, category: 'School', recurrence: 'weekdays', schedule_start: '14:00', schedule_end: '16:00' },
      { id: 't5', child_id: 'c2', title: 'Praticar Piano', points: 1500, category: 'Personal', recurrence: 'weekly', schedule_start: '10:00', schedule_end: '11:00' }
    ];
    
    const taskStmt = db.prepare(`
      INSERT INTO tasks (id, child_id, title, points, completed, category, recurrence, schedule_start, schedule_end)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
    `);
    
    for (const task of tasks) {
      taskStmt.run(
        task.id, task.child_id, task.title, task.points, task.category,
        task.recurrence || 'none', task.schedule_start || null, task.schedule_end || null
      );
      console.log(`  ✅ Created task: ${task.title}`);
    }
    
    // Insert rewards
    const rewards = [
      { id: 'r1', title: '30 min de Game', description: 'Tempo extra liberado no console ou tablet.', cost: 500, icon: '🎮', category: 'Digital' },
      { id: 'r5', title: 'Skin ou App Novo', description: 'Crédito para compra de item cosmético (Aprox. R$ 25).', cost: 2500, icon: '📱', category: 'Digital' },
      { id: 'r4', title: 'Dormir 1h mais tarde', description: 'Válido para sexta ou sábado.', cost: 1000, icon: '🌙', category: 'Digital' },
      { id: 'r2', title: 'Escolher o Jantar (Pizza)', description: 'Uma pizza grande com entrega inclusa (Aprox. R$ 85).', cost: 8500, icon: '🍕', category: 'Guloseimas' },
      { id: 'r3', title: 'Passeio ao Parque', description: 'Entrada no parque e lanche (Aprox. R$ 120).', cost: 12000, icon: '🌳', category: 'Lazer' }
    ];
    
    const rewardStmt = db.prepare(`
      INSERT INTO rewards (id, title, description, cost, icon, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const reward of rewards) {
      rewardStmt.run(reward.id, reward.title, reward.description, reward.cost, reward.icon, reward.category);
      console.log(`  ✅ Created reward: ${reward.title}`);
    }
    
    // Insert devices
    const devices = [
      { id: 'd1', name: 'iPad Pro - Henrique', type: 'tablet', mac: '00:1A:2B:3C:4D:5E', ip: '192.168.1.15', status: 'online', is_blocked: 0, assigned_to: 'c1' },
      { id: 'd2', name: 'Nintendo Switch', type: 'console', mac: 'AA:BB:CC:DD:EE:FF', ip: '192.168.1.22', status: 'online', is_blocked: 0, assigned_to: 'c1' },
      { id: 'd3', name: 'MacBook Beatriz', type: 'laptop', mac: '11:22:33:44:55:66', ip: '192.168.1.18', status: 'offline', is_blocked: 0, assigned_to: 'c2' },
      { id: 'd4', name: 'Smart TV LG 55"', type: 'tv', mac: '99:88:77:66:55:44', ip: '192.168.1.5', status: 'online', is_blocked: 1, assigned_to: null }
    ];
    
    const deviceStmt = db.prepare(`
      INSERT INTO devices (id, name, type, mac, ip, status, is_blocked, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const device of devices) {
      deviceStmt.run(
        device.id, device.name, device.type, device.mac, device.ip,
        device.status, device.is_blocked, device.assigned_to
      );
      console.log(`  ✅ Created device: ${device.name}`);
    }
    
    // Insert activity logs
    const logs = [
      { id: 'l1', child_id: 'c1', child_name: 'Henrique', action: 'Completou "Dever de casa"', type: 'success' },
      { id: 'l2', child_id: 'c2', child_name: 'Beatriz', action: 'Completou "Escovar os dentes"', type: 'success' }
    ];
    
    const logStmt = db.prepare(`
      INSERT INTO activity_logs (id, child_id, child_name, action, type)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const log of logs) {
      logStmt.run(log.id, log.child_id, log.child_name, log.action, log.type);
      console.log(`  ✅ Created log: ${log.action}`);
    }
    
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run initialization
try {
  console.log('🚀 Initializing database...');
  initDatabase();
  seedDatabase();
  console.log('✅ Database initialization complete!');
  process.exit(0);
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}
