#!/bin/bash

# Portal Família - Firewall Setup Script
# This script configures the Ubuntu server to act as a network gateway
# with parental control capabilities

set -e

echo "========================================"
echo "Portal Família - Firewall Setup"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

echo "✅ Running as root"

# Detect network interface
echo ""
echo "Available network interfaces:"
ip link show | grep -E '^[0-9]+:' | awk '{print $2}' | sed 's/://'
echo ""
read -p "Enter your primary network interface (e.g., eth0, wlan0): " INTERFACE

if [ -z "$INTERFACE" ]; then
  echo "❌ No interface specified"
  exit 1
fi

echo "✅ Using interface: $INTERFACE"

# Enable IP forwarding
echo ""
echo "Enabling IP forwarding..."
sysctl -w net.ipv4.ip_forward=1
grep -q "net.ipv4.ip_forward=1" /etc/sysctl.conf || echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
echo "✅ IP forwarding enabled"

# Install iptables if not present
echo ""
echo "Checking iptables installation..."
if ! command -v iptables &> /dev/null; then
  echo "Installing iptables..."
  apt-get update
  apt-get install -y iptables iptables-persistent
else
  echo "✅ iptables already installed"
fi

# Configure iptables for NAT (if this server is the gateway)
echo ""
read -p "Is this server the network gateway/router? (y/n): " IS_GATEWAY

if [ "$IS_GATEWAY" = "y" ] || [ "$IS_GATEWAY" = "Y" ]; then
  echo "Configuring NAT..."
  iptables -t nat -A POSTROUTING -o $INTERFACE -j MASQUERADE
  iptables -A FORWARD -i $INTERFACE -o $INTERFACE -m state --state RELATED,ESTABLISHED -j ACCEPT
  iptables -A FORWARD -i $INTERFACE -o $INTERFACE -j ACCEPT
  echo "✅ NAT configured"
fi

# Save iptables rules
echo ""
echo "Saving iptables rules..."
if command -v netfilter-persistent &> /dev/null; then
  netfilter-persistent save
else
  iptables-save > /etc/iptables/rules.v4
fi
echo "✅ iptables rules saved"

# Create sudoers entry for Node.js to run firewall commands
echo ""
echo "Configuring sudo permissions for Portal Família..."
USER=$(logname 2>/dev/null || echo $SUDO_USER)
if [ -z "$USER" ]; then
  read -p "Enter the username that will run Portal Família: " USER
fi

SUDOERS_FILE="/etc/sudoers.d/portal-familia"
cat > $SUDOERS_FILE << EOF
# Portal Família firewall control
# Allow Node.js backend to manage iptables/ufw without password
$USER ALL=(ALL) NOPASSWD: /usr/sbin/iptables
$USER ALL=(ALL) NOPASSWD: /usr/sbin/ip6tables
$USER ALL=(ALL) NOPASSWD: /usr/sbin/ufw
$USER ALL=(ALL) NOPASSWD: /usr/sbin/sysctl
EOF

chmod 0440 $SUDOERS_FILE
echo "✅ Sudo permissions configured for user: $USER"

# Test sudo access
echo ""
echo "Testing sudo access..."
su - $USER -c "sudo iptables -L -n >/dev/null 2>&1" && echo "✅ Sudo access test passed" || echo "❌ Sudo access test failed"

echo ""
echo "========================================"
echo "✅ Firewall setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with NETWORK_INTERFACE=$INTERFACE"
echo "2. Start the Portal Família backend"
echo "3. Configure device MAC addresses in the web interface"
echo ""
echo "To test firewall control:"
echo "  sudo iptables -L FORWARD -n -v"
echo ""
