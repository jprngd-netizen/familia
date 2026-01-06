# Portal Família - Quick Start Guide

Get the Portal Família up and running in 5 minutes!

## Prerequisites

- Node.js v18 or higher
- npm
- Ubuntu Server (for firewall features)

## 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

## 2. Initialize Database

```bash
cd backend
npm run init-db
```

This creates the database with demo data:
- **Admin**: PIN `0000`
- **Henrique** (child): PIN `1234`
- **Beatriz** (child): PIN `4321`

## 3. Start Backend Server

```bash
# In the backend directory
cd backend
npm start
```

The backend will start on `http://localhost:5000`

## 4. Start Frontend (New Terminal)

```bash
# In the root directory
npm run dev
```

The frontend will start on `http://localhost:3000`

## 5. Access the Application

Open your browser and navigate to: **http://localhost:3000**

### Login

- Click on **Papai/Mamãe** (parent) and enter PIN: `0000`
- Or click on **Henrique** or **Beatriz** for child view

## Default Features Ready

✅ **Task Management** - Create and assign tasks to children  
✅ **Points System** - Children earn points for completing tasks  
✅ **Reward Store** - Children can redeem rewards with points  
✅ **Reward Approval** - Rewards >1000 points require parent approval  
✅ **Activity Logs** - Track all family activities  
✅ **Device Management** - Add and manage family devices  
✅ **Settings** - Configure theme, notifications, and system settings

## Firewall Integration (Optional)

Firewall features are **disabled by default** for testing.

To enable internet access control:

1. Edit `backend/.env`:
   ```env
   ENABLE_FIREWALL=true
   FIREWALL_TYPE=iptables
   NETWORK_INTERFACE=eth0  # Your network interface
   ```

2. Grant sudo permissions (see DEPLOYMENT_GUIDE.md for details)

3. Restart backend server

## What's Working

- ✅ Complete frontend-backend integration
- ✅ API-driven architecture
- ✅ SQLite database with WAL mode
- ✅ Real-time data updates
- ✅ Error handling and loading states
- ✅ Firewall integration (iptables/ufw)
- ✅ Points and rewards system
- ✅ Task completion tracking
- ✅ Device management
- ✅ Activity logging

## Development Commands

### Backend

```bash
cd backend

# Start server
npm start

# Start with auto-reload
npm run dev

# Reinitialize database
npm run init-db
```

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## API Endpoints

The backend API is available at `http://localhost:5000/api`

### Test the API

```bash
# Health check
curl http://localhost:5000/api/health

# Get all children
curl http://localhost:5000/api/children

# Get all rewards
curl http://localhost:5000/api/rewards

# Get activity logs
curl http://localhost:5000/api/logs

# Get devices
curl http://localhost:5000/api/devices
```

## Project Structure

```
.
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   ├── utils/          # Utilities (firewall, etc.)
│   │   ├── middleware/     # Express middleware
│   │   └── server.js       # Main server
│   └── database/           # SQLite database
├── views/                  # React views (pages)
├── components/             # Reusable components
├── services/               # API client
├── App.tsx                 # Main React app
└── types.ts                # TypeScript types
```

## Common Issues

### Port Already in Use

If you get `EADDRINUSE` error:

```bash
# Kill process using port 5000
pkill -f "node.*server.js"

# Or kill process using port 3000
pkill -f "vite"
```

### Cannot Connect to Backend

1. Verify backend is running:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Check backend logs

3. Verify `.env.local` has correct API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Database Errors

Reset the database:

```bash
cd backend
rm -f database/*.db*
npm run init-db
```

## Next Steps

1. **Change default passwords** immediately!
2. Add your family members in Settings
3. Create custom tasks and rewards
4. Set up firewall integration (see DEPLOYMENT_GUIDE.md)
5. Deploy to production Ubuntu server (see DEPLOYMENT_GUIDE.md)

## Need Help?

- Check **DEPLOYMENT_GUIDE.md** for detailed deployment instructions
- Check **README.md** for feature overview
- Review backend logs for errors
- Verify all prerequisites are installed

## Security Notes

⚠️ **Important:**
- Change default PINs immediately
- Never commit `.env` files to version control
- Use strong secrets in production
- Run on HTTPS in production

---

**You're all set! Enjoy managing your family with Portal Família! 🎉**
