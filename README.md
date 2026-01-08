# Portal Família - Family Task & Internet Management System

A comprehensive family portal application for managing chores, tasks, rewards, and internet access control through firewall integration.

## Features

- 🏠 **Family Dashboard**: Centralized view of all family members and their activities
- ✅ **Task Management**: Create, assign, and track tasks for children with scheduling and recurrence
- 🎁 **Reward Store**: Parents can create rewards that children can redeem with earned points
- 🔒 **Internet Access Control**: Integrated firewall control to block/unblock internet access based on task completion
- 👨‍👩‍👧‍👦 **Multi-Child Support**: Manage multiple children with individual profiles and devices
- 📊 **Activity Logs**: Track all family activities and task completions
- 🎮 **Gamification**: Points-based system to motivate children
- 📺 **TV Mode**: Full-screen kiosk display with leaderboard, countdown timers, and birthday celebrations
- 🔥 **Streak Tracking**: Track consecutive days of task completion per child
- 📅 **Google Calendar**: Optional integration to display family events on TV Mode
- ⏰ **Deadline Warnings**: Visual alerts for tasks approaching their scheduled end time
- 🔄 **Auto-Reset Tasks**: Recurring tasks automatically reset daily, weekly, or on specific days

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Firewall**: iptables/ufw integration for internet access control

## Prerequisites

- Node.js (v18 or higher)
- Ubuntu Server (for firewall integration)
- Root/sudo access (for firewall commands)

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment files:

**Frontend:**
```bash
cp .env.example .env.local
```

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit the `.env` files with your specific configuration.

### 3. Initialize Database

```bash
cd backend
npm run init-db
```

### 4. Start the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Firewall Integration

The app can control internet access for family members' devices using iptables or ufw.

### Setup

1. Ensure the backend runs on your Ubuntu router/gateway
2. Configure `ENABLE_FIREWALL=true` in backend/.env
3. Set the correct `NETWORK_INTERFACE` (e.g., eth0, wlan0)
4. Grant sudo permissions for firewall commands (see DEPLOYMENT_GUIDE.md)

### How It Works

- Parents can block/unblock devices by MAC address or IP
- Children earn internet access by completing tasks
- Temporary unlocks can be scheduled
- All firewall changes are logged

## Default Login

- **Username**: admin
- **Password**: admin123

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## Project Structure

```
.
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utilities (firewall, etc.)
│   │   ├── middleware/      # Express middleware
│   │   └── server.js        # Main server file
│   └── database/            # SQLite database
├── views/                   # React components (views)
├── components/              # Reusable React components
├── services/                # API services
└── types.ts                 # TypeScript types

```

## Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed production deployment instructions including:
- SystemD service setup
- Firewall configuration
- Security hardening
- Nginx reverse proxy setup

## Development

**Run tests:**
```bash
npm test
```

**Build for production:**
```bash
npm run build
```

## License

MIT

## Support

For issues and questions, please check the DEPLOYMENT_GUIDE.md or create an issue in the repository.
