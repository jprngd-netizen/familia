// Telegram Bot Integration for Family Notifications

import { getDatabase } from '../models/database.js';

// Get Telegram settings from database
function getTelegramSettings() {
  const db = getDatabase();
  const settings = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();

  if (!settings) {
    return { enabled: false, botToken: null, chatId: null };
  }

  return {
    enabled: Boolean(settings.telegram_enabled),
    botToken: settings.telegram_bot_token,
    chatId: settings.telegram_chat_id,
    notifications: {
      taskCompleted: Boolean(settings.notify_task_completed),
      rewardRedeemed: Boolean(settings.notify_reward_redeemed),
      punishmentApplied: Boolean(settings.notify_punishment_applied)
    }
  };
}

// Send a message via Telegram Bot API
async function sendTelegramMessage(message, options = {}) {
  const settings = getTelegramSettings();

  if (!settings.enabled || !settings.botToken || !settings.chatId) {
    return { success: false, error: 'Telegram not configured or disabled' };
  }

  const url = `https://api.telegram.org/bot${settings.botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text: message,
        parse_mode: 'HTML',
        ...options
      })
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data.description);
      return { success: false, error: data.description };
    }

    return { success: true, messageId: data.result.message_id };
  } catch (error) {
    console.error('Failed to send Telegram message:', error.message);
    return { success: false, error: error.message };
  }
}

// Send test message
export async function sendTestMessage() {
  const message = `🧪 <b>Teste de Conexão</b>\n\nO bot Familia está funcionando corretamente!\n\n✅ Notificações ativas`;
  return sendTelegramMessage(message);
}

// Notify when a task is completed
export async function notifyTaskCompleted(childName, taskTitle, points, newTotal) {
  const settings = getTelegramSettings();

  if (!settings.notifications.taskCompleted) {
    return { success: false, error: 'Task notifications disabled' };
  }

  const message = `✅ <b>Tarefa Concluída!</b>\n\n👤 <b>${childName}</b> completou:\n📋 ${taskTitle}\n\n💰 +${points} pontos\n🏆 Total: ${newTotal} pontos`;
  return sendTelegramMessage(message);
}

// Notify when a task is uncompleted
export async function notifyTaskUncompleted(childName, taskTitle) {
  const settings = getTelegramSettings();

  if (!settings.notifications.taskCompleted) {
    return { success: false, error: 'Task notifications disabled' };
  }

  const message = `⚠️ <b>Tarefa Desmarcada</b>\n\n👤 <b>${childName}</b> desmarcou:\n📋 ${taskTitle}`;
  return sendTelegramMessage(message);
}

// Notify when a reward is redeemed
export async function notifyRewardRedeemed(childName, rewardTitle, cost, remainingPoints) {
  const settings = getTelegramSettings();

  if (!settings.notifications.rewardRedeemed) {
    return { success: false, error: 'Reward notifications disabled' };
  }

  const message = `🎁 <b>Prêmio Resgatado!</b>\n\n👤 <b>${childName}</b> trocou:\n🎯 ${rewardTitle}\n\n💸 -${cost} pontos\n💰 Saldo: ${remainingPoints} pontos`;
  return sendTelegramMessage(message);
}

// Notify when a reward request is made (pending approval)
export async function notifyRewardRequest(childName, rewardTitle, cost) {
  const settings = getTelegramSettings();

  if (!settings.notifications.rewardRedeemed) {
    return { success: false, error: 'Reward notifications disabled' };
  }

  const message = `🙋 <b>Pedido de Prêmio</b>\n\n👤 <b>${childName}</b> quer resgatar:\n🎯 ${rewardTitle}\n💰 Custo: ${cost} pontos\n\n⏳ Aguardando aprovação dos pais`;
  return sendTelegramMessage(message);
}

// Notify when a punishment is applied
export async function notifyPunishmentApplied(childName, punishmentType, reason, duration) {
  const settings = getTelegramSettings();

  if (!settings.notifications.punishmentApplied) {
    return { success: false, error: 'Punishment notifications disabled' };
  }

  let typeEmoji = punishmentType === 'Block' ? '🚫' : '📉';
  let typeText = punishmentType === 'Block' ? 'Bloqueio de Internet' : 'Perda de Pontos';
  let durationText = duration ? `\n⏱️ Duração: ${duration} minutos` : '';

  const message = `${typeEmoji} <b>Punição Aplicada</b>\n\n👤 <b>${childName}</b>\n📋 Tipo: ${typeText}${durationText}\n\n📝 Motivo: ${reason}`;
  return sendTelegramMessage(message);
}

// Notify when internet is blocked/unblocked automatically
export async function notifyInternetStatus(childName, isBlocked, reason) {
  const settings = getTelegramSettings();

  if (!settings.enabled) {
    return { success: false, error: 'Telegram disabled' };
  }

  const emoji = isBlocked ? '🔒' : '🔓';
  const status = isBlocked ? 'BLOQUEADA' : 'LIBERADA';

  const message = `${emoji} <b>Internet ${status}</b>\n\n👤 <b>${childName}</b>\n📝 ${reason}`;
  return sendTelegramMessage(message);
}

export default {
  sendTestMessage,
  notifyTaskCompleted,
  notifyTaskUncompleted,
  notifyRewardRedeemed,
  notifyRewardRequest,
  notifyPunishmentApplied,
  notifyInternetStatus
};
