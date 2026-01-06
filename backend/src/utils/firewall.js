import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const FIREWALL_TYPE = process.env.FIREWALL_TYPE || 'iptables';
const ENABLE_FIREWALL = process.env.ENABLE_FIREWALL === 'true';
const NETWORK_INTERFACE = process.env.NETWORK_INTERFACE || 'eth0';

/**
 * Execute firewall command with proper error handling
 */
async function executeFirewallCommand(command) {
  if (!ENABLE_FIREWALL) {
    console.log('🛡️  Firewall integration is DISABLED. Command would be:', command);
    return { success: true, message: 'Firewall disabled - simulation mode' };
  }

  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(`✅ Firewall command executed: ${command}`);
    if (stderr) console.warn('Stderr:', stderr);
    return { success: true, output: stdout, stderr };
  } catch (error) {
    console.error(`❌ Firewall command failed: ${command}`);
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Block internet access for a device by MAC address
 */
export async function blockDevice(mac, ip = null) {
  console.log(`🚫 Blocking device: ${mac} ${ip ? `(IP: ${ip})` : ''}`);
  
  const commands = [];
  
  if (FIREWALL_TYPE === 'iptables') {
    // Block by MAC address (more reliable)
    commands.push(`sudo iptables -A FORWARD -m mac --mac-source ${mac} -j DROP`);
    
    // Also block by IP if provided
    if (ip) {
      commands.push(`sudo iptables -A FORWARD -s ${ip} -j DROP`);
    }
  } else if (FIREWALL_TYPE === 'ufw') {
    // UFW doesn't support MAC filtering directly, use IP
    if (ip) {
      commands.push(`sudo ufw deny from ${ip}`);
    } else {
      console.warn('⚠️  UFW requires IP address. MAC-only blocking not supported.');
      return { success: false, error: 'UFW requires IP address' };
    }
  }

  const results = [];
  for (const cmd of commands) {
    results.push(await executeFirewallCommand(cmd));
  }

  return results.every(r => r.success) 
    ? { success: true, message: `Device ${mac} blocked successfully` }
    : { success: false, error: 'Some firewall commands failed' };
}

/**
 * Unblock internet access for a device by MAC address
 */
export async function unblockDevice(mac, ip = null) {
  console.log(`✅ Unblocking device: ${mac} ${ip ? `(IP: ${ip})` : ''}`);
  
  const commands = [];
  
  if (FIREWALL_TYPE === 'iptables') {
    // Remove block rules by MAC
    commands.push(`sudo iptables -D FORWARD -m mac --mac-source ${mac} -j DROP 2>/dev/null || true`);
    
    // Remove block by IP if provided
    if (ip) {
      commands.push(`sudo iptables -D FORWARD -s ${ip} -j DROP 2>/dev/null || true`);
    }
  } else if (FIREWALL_TYPE === 'ufw') {
    if (ip) {
      commands.push(`sudo ufw delete deny from ${ip}`);
    }
  }

  const results = [];
  for (const cmd of commands) {
    results.push(await executeFirewallCommand(cmd));
  }

  return { success: true, message: `Device ${mac} unblocked successfully` };
}

/**
 * Get current firewall status
 */
export async function getFirewallStatus() {
  let command = '';
  
  if (FIREWALL_TYPE === 'iptables') {
    command = 'sudo iptables -L FORWARD -n -v';
  } else if (FIREWALL_TYPE === 'ufw') {
    command = 'sudo ufw status numbered';
  }

  const result = await executeFirewallCommand(command);
  return result;
}

/**
 * Initialize firewall rules (run once at startup)
 */
export async function initializeFirewall() {
  console.log('🔥 Initializing firewall rules...');
  
  if (!ENABLE_FIREWALL) {
    console.log('⚠️  Firewall integration is DISABLED');
    return { success: true, message: 'Firewall disabled' };
  }

  const commands = [];
  
  if (FIREWALL_TYPE === 'iptables') {
    // Ensure FORWARD chain accepts by default (we'll add specific DROP rules)
    commands.push('sudo iptables -P FORWARD ACCEPT');
    
    // Enable IP forwarding if not already enabled
    commands.push('sudo sysctl -w net.ipv4.ip_forward=1');
    commands.push('echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf');
  } else if (FIREWALL_TYPE === 'ufw') {
    // Enable UFW if not already enabled
    commands.push('sudo ufw --force enable');
  }

  const results = [];
  for (const cmd of commands) {
    results.push(await executeFirewallCommand(cmd));
  }

  console.log('✅ Firewall initialization complete');
  return { success: true, message: 'Firewall initialized' };
}

/**
 * Clear all Portal Família firewall rules
 */
export async function clearAllRules() {
  console.log('🧼 Clearing all Portal Família firewall rules...');
  
  if (FIREWALL_TYPE === 'iptables') {
    // This will remove all FORWARD rules - be careful!
    await executeFirewallCommand('sudo iptables -F FORWARD');
  } else if (FIREWALL_TYPE === 'ufw') {
    await executeFirewallCommand('sudo ufw --force reset');
  }

  return { success: true, message: 'All rules cleared' };
}

/**
 * Schedule temporary unblock (for unlocked hours)
 */
export async function scheduleTemporaryUnblock(mac, ip, durationMinutes) {
  console.log(`⏰ Scheduling ${durationMinutes} minute unblock for ${mac}`);
  
  await unblockDevice(mac, ip);
  
  // Set timeout to re-block
  setTimeout(async () => {
    console.log(`⏰ Temporary unblock expired for ${mac}`);
    await blockDevice(mac, ip);
  }, durationMinutes * 60 * 1000);
  
  return { 
    success: true, 
    message: `Device unblocked for ${durationMinutes} minutes`,
    expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000)
  };
}

export default {
  blockDevice,
  unblockDevice,
  getFirewallStatus,
  initializeFirewall,
  clearAllRules,
  scheduleTemporaryUnblock
};
