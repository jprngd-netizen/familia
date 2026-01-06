# Portal Família - Complete Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Installation](#installation)
4. [Firewall Integration Setup](#firewall-integration-setup)
5. [Production Deployment](#production-deployment)
6. [Systemd Services](#systemd-services)
7. [Nginx Reverse Proxy](#nginx-reverse-proxy)
8. [Security Hardening](#security-hardening)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware Requirements
- Ubuntu Server 20.04 LTS or newer
- Minimum 1GB RAM
- 10GB free disk space
- Network interface connected to your LAN

### Software Requirements
- Node.js v18 or higher
- npm v9 or higher
- sudo/root access (for firewall integration)
- Git (optional, for version control)

---

## Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Required System Packages

```bash
sudo apt install -y build-essential python3 git sqlite3
```

---

## Installation

### 1. Clone or Copy the Project

```bash
# If using git
git clone <repository-url> /opt/portal-familia
cd /opt/portal-familia

# Or if you have a zip file
unzip portal_familia.zip -d /opt/portal-familia
cd /opt/portal-familia
```

### 2. Install Backend Dependencies

```bash
cd /opt/portal-familia/backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd /opt/portal-familia
npm install
```

### 4. Configure Environment Variables

**Backend Configuration:**

```bash
cd /opt/portal-familia/backend
cp .env.example .env
nano .env
```

Update the following values:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://your-server-ip:3000

DB_PATH=./database/portal_familia.db

# Generate secure random strings for these:
JWT_SECRET=your_very_secure_jwt_secret_here
SESSION_SECRET=your_very_secure_session_secret_here

# Firewall Integration
ENABLE_FIREWALL=true
FIREWALL_TYPE=iptables  # or 'ufw'
NETWORK_INTERFACE=eth0  # Your network interface (check with 'ip addr')
LOCAL_SUBNET=192.168.1.0/24  # Your local network subnet
```

**Frontend Configuration:**

```bash
cd /opt/portal-familia
cp .env.example .env.local
nano .env.local
```

Update:

```env
VITE_API_URL=http://your-server-ip:5000/api
```

### 5. Initialize Database

```bash
cd /opt/portal-familia/backend
npm run init-db
```

This will create the database and seed it with initial demo data.

---

## Firewall Integration Setup

The Portal Família can control internet access for family members' devices using iptables or ufw.

### Option 1: Using iptables (Recommended)

#### Step 1: Enable IP Forwarding

```bash
# Temporarily enable
sudo sysctl -w net.ipv4.ip_forward=1

# Permanently enable
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Step 2: Configure iptables

```bash
# Allow forwarding by default
sudo iptables -P FORWARD ACCEPT

# Allow established connections
sudo iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT

# Save rules
sudo apt install iptables-persistent
sudo netfilter-persistent save
```

#### Step 3: Grant sudo Permissions for Firewall Commands

Create a sudoers file for the Portal Família:

```bash
sudo visudo -f /etc/sudoers.d/portal-familia
```

Add the following content (replace `ubuntu` with your username):

```
# Portal Família firewall control
ubuntu ALL=(ALL) NOPASSWD: /usr/sbin/iptables
ubuntu ALL=(ALL) NOPASSWD: /usr/sbin/sysctl
```

Save and exit. Test with:

```bash
sudo -l | grep iptables
```

### Option 2: Using UFW

#### Step 1: Enable UFW

```bash
sudo ufw enable
sudo ufw default allow routed
```

#### Step 2: Grant sudo Permissions

```bash
sudo visudo -f /etc/sudoers.d/portal-familia
```

Add:

```
# Portal Família firewall control
ubuntu ALL=(ALL) NOPASSWD: /usr/sbin/ufw
```

**Note:** UFW requires IP addresses for device blocking. MAC-based filtering is not supported directly with UFW.

### Firewall Configuration in .env

Update your `backend/.env`:

```env
ENABLE_FIREWALL=true
FIREWALL_TYPE=iptables  # or 'ufw'
NETWORK_INTERFACE=eth0  # Check with: ip addr
LOCAL_SUBNET=192.168.1.0/24
```

### Finding Your Network Interface

```bash
# List all network interfaces
ip addr show

# Common interface names:
# - eth0, enp0s3: Ethernet
# - wlan0, wlp3s0: WiFi
# - br0: Bridge
```

### Finding Your Local Subnet

```bash
# Show routing table
ip route show

# Look for line like: 192.168.1.0/24 dev eth0
```

### Testing Firewall Integration

1. Start the backend server
2. Use the API or web interface to block a device
3. Verify with:

```bash
# For iptables
sudo iptables -L FORWARD -v -n

# For ufw
sudo ufw status numbered
```

---

## Production Deployment

### Build Frontend for Production

```bash
cd /opt/portal-familia
npm run build
```

This creates an optimized production build in the `dist` folder.

---

## Systemd Services

Create systemd services to run the application automatically.

### Backend Service

Create `/etc/systemd/system/portal-familia-backend.service`:

```ini
[Unit]
Description=Portal Família Backend Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/portal-familia/backend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/portal-familia-backend.log
StandardError=append:/var/log/portal-familia-backend.log

[Install]
WantedBy=multi-user.target
```

### Frontend Service

Create `/etc/systemd/system/portal-familia-frontend.service`:

```ini
[Unit]
Description=Portal Família Frontend Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/portal-familia
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
StandardOutput=append:/var/log/portal-familia-frontend.log
StandardError=append:/var/log/portal-familia-frontend.log

[Install]
WantedBy=multi-user.target
```

### Enable and Start Services

```bash
# Create log files
sudo touch /var/log/portal-familia-backend.log
sudo touch /var/log/portal-familia-frontend.log
sudo chown ubuntu:ubuntu /var/log/portal-familia-*.log

# Reload systemd
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable portal-familia-backend
sudo systemctl enable portal-familia-frontend

# Start services
sudo systemctl start portal-familia-backend
sudo systemctl start portal-familia-frontend

# Check status
sudo systemctl status portal-familia-backend
sudo systemctl status portal-familia-frontend
```

### View Logs

```bash
# Backend logs
sudo journalctl -u portal-familia-backend -f

# Frontend logs
sudo journalctl -u portal-familia-frontend -f

# Or direct log files
tail -f /var/log/portal-familia-backend.log
tail -f /var/log/portal-familia-frontend.log
```

---

## Nginx Reverse Proxy (Optional but Recommended)

For production, use Nginx as a reverse proxy:

### 1. Install Nginx

```bash
sudo apt install nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/portal-familia`:

```nginx
server {
    listen 80;
    server_name portal-familia.local your-server-ip;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/portal-familia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Now access the app at: `http://your-server-ip/`

---

## Security Hardening

### 1. Firewall Rules

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application ports (if not using Nginx)
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp

# Enable firewall
sudo ufw enable
```

### 2. Change Default Credentials

⚠️ **IMPORTANT:** Change the default admin password immediately!

Default login:
- Username: Papai/Mamãe (or parent name)
- PIN: 0000

Change it in the Settings > Family Members section.

### 3. Database Backups

Create automated backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-portal-familia.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/opt/portal-familia/backups"
DB_PATH="/opt/portal-familia/backend/database/portal_familia.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/portal_familia_$DATE.db

# Keep only last 7 days of backups
find $BACKUP_DIR -name "portal_familia_*.db" -mtime +7 -delete
```

Make executable and schedule:

```bash
sudo chmod +x /usr/local/bin/backup-portal-familia.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-portal-familia.sh
```

### 4. SSL/HTTPS (Recommended)

Use Let's Encrypt for free SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Troubleshooting

### Backend Won't Start

1. Check logs:
   ```bash
   sudo journalctl -u portal-familia-backend -n 50
   ```

2. Verify Node.js version:
   ```bash
   node --version  # Should be v18+
   ```

3. Check port availability:
   ```bash
   sudo lsof -i :5000
   ```

4. Verify environment variables:
   ```bash
   cat /opt/portal-familia/backend/.env
   ```

### Frontend Won't Start

1. Check logs:
   ```bash
   sudo journalctl -u portal-familia-frontend -n 50
   ```

2. Rebuild:
   ```bash
   cd /opt/portal-familia
   rm -rf node_modules
   npm install
   npm run build
   ```

### Firewall Not Working

1. Verify IP forwarding:
   ```bash
   cat /proc/sys/net/ipv4/ip_forward  # Should output: 1
   ```

2. Check iptables rules:
   ```bash
   sudo iptables -L FORWARD -v -n
   ```

3. Verify sudo permissions:
   ```bash
   sudo -l | grep iptables
   ```

4. Check backend logs for firewall errors:
   ```bash
   tail -f /var/log/portal-familia-backend.log | grep -i firewall
   ```

5. Test manually:
   ```bash
   # Block a device
   sudo iptables -A FORWARD -m mac --mac-source AA:BB:CC:DD:EE:FF -j DROP
   
   # Check rule was added
   sudo iptables -L FORWARD -v -n
   
   # Remove test rule
   sudo iptables -D FORWARD -m mac --mac-source AA:BB:CC:DD:EE:FF -j DROP
   ```

### Cannot Connect to API

1. Verify backend is running:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Check firewall rules:
   ```bash
   sudo ufw status
   ```

3. Verify CORS settings in `backend/.env`:
   ```env
   FRONTEND_URL=http://your-server-ip:3000
   ```

### Database Issues

1. Reinitialize database:
   ```bash
   cd /opt/portal-familia/backend
   rm -f database/*.db*
   npm run init-db
   ```

2. Check database permissions:
   ```bash
   ls -l /opt/portal-familia/backend/database/
   # Owner should match the service user
   ```

---

## Network Configuration Tips

### Setting Up as Gateway/Router

If you want the Ubuntu server to act as a gateway for the family network:

1. **Configure NAT:**
   ```bash
   # Get your WAN interface (connected to internet)
   WAN_IF="enp0s3"  # Replace with your WAN interface
   LAN_IF="eth0"     # Your LAN interface
   
   # Enable NAT
   sudo iptables -t nat -A POSTROUTING -o $WAN_IF -j MASQUERADE
   sudo iptables -A FORWARD -i $LAN_IF -o $WAN_IF -j ACCEPT
   sudo iptables -A FORWARD -i $WAN_IF -o $LAN_IF -m state --state RELATED,ESTABLISHED -j ACCEPT
   
   # Save rules
   sudo netfilter-persistent save
   ```

2. **Configure DHCP (optional):**
   ```bash
   sudo apt install isc-dhcp-server
   # Edit /etc/dhcp/dhcpd.conf to configure your network
   ```

### Finding Device MAC Addresses

```bash
# Scan local network
sudo apt install arp-scan
sudo arp-scan --localnet

# Or use arp
arp -a

# Or check router admin panel
```

---

## Default Credentials

**Admin Access:**
- Name: Papai/Mamãe
- PIN: 0000

**Demo Children:**
- Henrique: PIN 1234
- Beatriz: PIN 4321

⚠️ **Change these immediately after first login!**

---

## Support and Updates

### Updating the Application

```bash
cd /opt/portal-familia

# Backup database first
cp backend/database/portal_familia.db backend/database/portal_familia.db.backup

# Pull updates (if using git)
git pull

# Update dependencies
npm install
cd backend && npm install && cd ..

# Restart services
sudo systemctl restart portal-familia-backend
sudo systemctl restart portal-familia-frontend
```

### Getting Help

- Check logs for errors
- Review this guide thoroughly
- Verify all prerequisites are met
- Test each component individually

---

## Performance Optimization

### For Raspberry Pi / Low-Power Devices

1. **Reduce log retention:**
   ```bash
   # In backend, set up log rotation
   sudo nano /etc/logrotate.d/portal-familia
   ```

2. **Use PM2 instead of systemd (optional):**
   ```bash
   sudo npm install -g pm2
   pm2 start backend/src/server.js --name portal-backend
   pm2 start "npm run dev" --name portal-frontend
   pm2 save
   pm2 startup
   ```

3. **Enable database WAL mode** (already enabled by default)

---

**Deployment Guide Complete!**

For any issues not covered here, check the application logs and ensure all prerequisites are properly configured.
