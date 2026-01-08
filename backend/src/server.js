
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase, resetDailyTasks, syncAllBlockStatus } from './models/database.js';
import childrenRoutes from './routes/children.js';
import tasksRoutes from './routes/tasks.js';
import rewardsRoutes from './routes/rewards.js';
import devicesRoutes from './routes/devices.js';
import settingsRoutes from './routes/settings.js';
import logsRoutes from './routes/logs.js';
import authRoutes from './routes/auth.js';
import calendarRoutes from './routes/calendar.js'; // Import calendar routes
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

// Initialize database
try {
  initDatabase();
  console.log('✅ Database initialized successfully');

  // Reset recurring tasks on startup
  const resetCount = resetDailyTasks();
  if (resetCount > 0) {
    console.log(`🔄 Reset ${resetCount} recurring tasks`);
  }

  // Sync device block status based on task completion (async)
  if (process.env.ENABLE_FIREWALL === 'true') {
    syncAllBlockStatus().then(results => {
      const blockedCount = results.filter(r => r.devicesUpdated.some(d => d.action === 'blocked')).length;
      const unblockedCount = results.filter(r => r.devicesUpdated.some(d => d.action === 'unblocked')).length;
      if (blockedCount > 0 || unblockedCount > 0) {
        console.log(`🔒 Firewall sync: ${blockedCount} children blocked, ${unblockedCount} unblocked`);
      }
    }).catch(err => {
      console.error('⚠️ Failed to sync block status:', err.message);
    });
  }
} catch (error) {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/calendar', calendarRoutes); // Add calendar routes

// Error handling for API routes
app.use('/api', errorHandler);

// Serve static frontend files in production
const distPath = join(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
  console.log(`📂 Serving static files from: ${distPath}`);
} else {
  // 404 handler when no frontend built
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found. Frontend not built - run npm run build in root.' });
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Portal Família Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Frontend CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔥 Firewall integration: ${process.env.ENABLE_FIREWALL === 'true' ? 'ENABLED' : 'DISABLED'}`);
});

export default app;
