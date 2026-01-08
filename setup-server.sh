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

# 0. Check disk space first
echo ""
echo "=== Checking disk space ==="
AVAILABLE_SPACE=$(df -BM / | tail -1 | awk '{print $4}' | sed 's/M//')
echo "Available disk space: ${AVAILABLE_SPACE}MB"
if [ "$AVAILABLE_SPACE" -lt 500 ]; then
    echo ""
    echo "WARNING: Less than 500MB free space!"
    echo "Consider cleaning up with:"
    echo "  sudo apt clean"
    echo "  sudo journalctl --vacuum-size=100M"
    echo "  docker system prune -a  (if using Docker)"
    echo ""
    read -p "Continue anyway? (y/n): " continue_low_space
    if [ "$continue_low_space" != "y" ]; then
        echo "Aborting. Please free up disk space first."
        exit 1
    fi
fi

# 1. Install or upgrade Node.js (requires v18+)
echo ""
echo "=== Checking Node.js ==="
NEED_NODE_INSTALL=false

if ! command -v node &> /dev/null; then
    echo "Node.js not found. Will install v20 LTS..."
    NEED_NODE_INSTALL=true
else
    NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
    echo "Current Node.js version: v$NODE_VERSION"
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "Node.js v18+ required. Will upgrade to v20 LTS..."
        NEED_NODE_INSTALL=true
    else
        echo "Node.js version OK!"
    fi
fi

if [ "$NEED_NODE_INSTALL" = true ]; then
    echo ""
    echo "Installing Node.js v20 LTS..."
    # Remove old nodejs if present
    sudo apt-get remove -y nodejs npm 2>/dev/null || true
    # Install NodeSource repo and Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "Node.js installed: $(node --version)"
fi

# 2. Install backend dependencies
echo ""
echo "=== Installing backend dependencies ==="
cd "$SCRIPT_DIR/backend"
npm install --production

# 3. Build frontend (frontend is in root directory)
echo ""
echo "=== Building frontend ==="
cd "$SCRIPT_DIR"

# Create .env.local for frontend build (API on same server)
cat > "$SCRIPT_DIR/.env.local" <<ENVEOF
VITE_API_URL=/api
ENVEOF

npm install
npm run build

# 4. Setup environment file if not exists
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    echo ""
    echo "=== Creating .env file ==="
    cat > "$SCRIPT_DIR/backend/.env" <<ENVEOF
PORT=3001
NODE_ENV=production
ENABLE_FIREWALL=false
ENVEOF
    echo "Created .env file at: $SCRIPT_DIR/backend/.env"
fi

# 5. Setup firewall for device blocking (optional)
echo ""
read -p "Enable internet blocking for devices? (requires iptables) (y/n): " setup_firewall
if [ "$setup_firewall" = "y" ]; then
    echo ""
    echo "=== Setting up firewall ==="

    # Install iptables-persistent to save rules across reboots
    sudo apt-get install -y iptables-persistent

    # Allow the app user to run iptables without password
    echo ""
    echo "Setting up passwordless iptables for $CURRENT_USER..."
    sudo tee /etc/sudoers.d/familia-iptables > /dev/null <<SUDOEOF
# Allow familia app to manage iptables for device blocking
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/sbin/iptables
SUDOEOF
    sudo chmod 440 /etc/sudoers.d/familia-iptables

    # Enable firewall in .env
    sed -i 's/ENABLE_FIREWALL=false/ENABLE_FIREWALL=true/' "$SCRIPT_DIR/backend/.env"

    echo "Firewall setup complete!"
    echo "Note: Blocked devices will persist across reboots"
fi

# 6. Configure UFW (Ubuntu Firewall)
echo ""
read -p "Configure UFW to allow app access from local network? (y/n): " setup_ufw
if [ "$setup_ufw" = "y" ]; then
    echo ""
    echo "=== Configuring UFW ==="
    sudo apt-get install -y ufw

    # Allow SSH (important - don't lock yourself out!)
    sudo ufw allow ssh

    # Allow the app port from local network
    sudo ufw allow from 192.168.0.0/16 to any port 3001

    # Allow HTTP/HTTPS if needed
    sudo ufw allow from 192.168.0.0/16 to any port 80
    sudo ufw allow from 192.168.0.0/16 to any port 443

    # Enable UFW
    sudo ufw --force enable

    echo "UFW configured and enabled"
fi

# 7. Setup static IP (optional)
echo ""
read -p "Setup static IP address? (recommended for servers) (y/n): " setup_static_ip
if [ "$setup_static_ip" = "y" ]; then
    echo ""
    echo "=== Setting up static IP ==="

    # Get current network info
    CURRENT_IP=$(hostname -I | awk '{print $1}')
    GATEWAY=$(ip route | grep default | awk '{print $3}')
    INTERFACE=$(ip route | grep default | awk '{print $5}')

    echo "Current IP: $CURRENT_IP"
    echo "Gateway: $GATEWAY"
    echo "Interface: $INTERFACE"
    echo ""
    read -p "Use $CURRENT_IP as static IP? (y/n): " use_current

    if [ "$use_current" = "y" ]; then
        STATIC_IP=$CURRENT_IP
    else
        read -p "Enter desired static IP (e.g., 192.168.1.100): " STATIC_IP
    fi

    # Create netplan config
    sudo tee /etc/netplan/99-static-ip.yaml > /dev/null <<NETPLANEOF
network:
  version: 2
  ethernets:
    $INTERFACE:
      dhcp4: no
      addresses:
        - $STATIC_IP/24
      routes:
        - to: default
          via: $GATEWAY
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4, 1.1.1.1]
NETPLANEOF

    echo "Static IP configured: $STATIC_IP"
    echo "Will take effect after reboot or 'sudo netplan apply'"
fi

# 8. Create systemd service
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

# 9. Enable and start service
echo ""
echo "=== Enabling service ==="
sudo systemctl daemon-reload
sudo systemctl enable familia
sudo systemctl start familia

# 10. Setup auto-reboot (optional)
echo ""
read -p "Setup weekly auto-reboot on Sunday 4AM? (y/n): " setup_reboot
if [ "$setup_reboot" = "y" ]; then
    (sudo crontab -l 2>/dev/null | grep -v "/sbin/reboot"; echo "0 4 * * 0 /sbin/reboot") | sudo crontab -
    echo "Weekly reboot scheduled"
fi

# 11. Setup SSH (if not already)
echo ""
echo "=== Ensuring SSH is enabled ==="
sudo apt-get install -y openssh-server
sudo systemctl enable ssh
sudo systemctl start ssh

# 12. Show status and summary
echo ""
echo "========================================"
echo "=== Setup Complete! ==="
echo "========================================"
echo ""
echo "Service status:"
sudo systemctl status familia --no-pager || true
echo ""
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "========================================"
echo "Your server is ready!"
echo "========================================"
echo ""
echo "Access the app at: http://$SERVER_IP:3001"
echo ""
echo "Connect via SSH: ssh $CURRENT_USER@$SERVER_IP"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status familia   - Check app status"
echo "  sudo systemctl restart familia  - Restart app"
echo "  sudo journalctl -u familia -f   - View live logs"
echo "  sudo iptables -L -n             - View firewall rules"
echo ""
if [ "$setup_firewall" = "y" ]; then
    echo "Internet blocking: ENABLED"
    echo "  - Kids' devices will be blocked until tasks are complete"
    echo "  - Rules persist across reboots"
else
    echo "Internet blocking: DISABLED"
    echo "  - Enable later by setting ENABLE_FIREWALL=true in backend/.env"
fi
echo ""
echo "========================================"
