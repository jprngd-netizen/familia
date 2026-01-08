#!/bin/bash

# Familia Server Setup Script
# Run this on your production Ubuntu mini PC

set -e

echo "=== Familia Server Setup ==="
echo ""

# Get current user and path
CURRENT_USER=$(whoami)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Detected user: $CURRENT_USER"
echo "Detected path: $SCRIPT_DIR"
echo ""
read -p "Is this correct? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    read -p "Enter username: " CURRENT_USER
    read -p "Enter full path to familia folder: " SCRIPT_DIR
fi

# 1. Install Node.js if not present
echo ""
echo "=== Checking Node.js ==="
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# 2. Install dependencies
echo ""
echo "=== Installing dependencies ==="
cd "$SCRIPT_DIR/backend"
npm install --production

# 3. Setup environment file if not exists
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    echo ""
    echo "=== Creating .env file ==="
    cp "$SCRIPT_DIR/backend/.env.example" "$SCRIPT_DIR/backend/.env" 2>/dev/null || {
        echo "PORT=3001" > "$SCRIPT_DIR/backend/.env"
        echo "NODE_ENV=production" >> "$SCRIPT_DIR/backend/.env"
    }
    echo "Created .env file - edit it later if needed: $SCRIPT_DIR/backend/.env"
fi

# 4. Create systemd service
echo ""
echo "=== Creating systemd service ==="
sudo tee /etc/systemd/system/familia.service > /dev/null <<EOF
[Unit]
Description=Familia App
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$SCRIPT_DIR/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 5. Enable and start service
echo ""
echo "=== Enabling service ==="
sudo systemctl daemon-reload
sudo systemctl enable familia
sudo systemctl start familia

# 6. Setup auto-reboot (optional)
echo ""
read -p "Setup weekly auto-reboot on Sunday 4AM? (y/n): " setup_reboot
if [ "$setup_reboot" = "y" ]; then
    (sudo crontab -l 2>/dev/null | grep -v "/sbin/reboot"; echo "0 4 * * 0 /sbin/reboot") | sudo crontab -
    echo "Weekly reboot scheduled"
fi

# 7. Setup SSH (if not already)
echo ""
echo "=== Ensuring SSH is enabled ==="
sudo apt-get install -y openssh-server
sudo systemctl enable ssh
sudo systemctl start ssh

# 8. Show status
echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Service status:"
sudo systemctl status familia --no-pager
echo ""
echo "Your server IP:"
hostname -I
echo ""
echo "Useful commands:"
echo "  sudo systemctl status familia  - Check status"
echo "  sudo systemctl restart familia - Restart app"
echo "  sudo journalctl -u familia -f  - View logs"
echo ""
echo "Connect remotely with: ssh $CURRENT_USER@$(hostname -I | awk '{print $1}')"
