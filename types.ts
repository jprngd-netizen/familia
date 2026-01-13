
export interface Task {
  id: string;
  title: string;
  points: number;
  completed: boolean;
  category: 'School' | 'Chores' | 'Health' | 'Personal';
  recurrence?: 'none' | 'daily' | 'weekdays' | 'weekends' | 'weekly';
  schedule?: {
    start?: string;
    end?: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO String
  end: string;
  category: 'Escola' | 'Lazer' | 'Médico' | 'Extra' | 'Aniversário';
  attendees: string[]; // IDs das crianças
  source: 'local' | 'google' | 'microsoft' | 'birthday';
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  category: 'Digital' | 'Lazer' | 'Guloseimas' | 'Eventos';
}

export interface RewardRequest {
  id: string;
  childId: string;
  childName: string;
  rewardId: string;
  rewardTitle: string;
  cost: number;
  status: 'pending' | 'approved' | 'denied';
  timestamp: string;
}

export type MemberRole = 'Criança' | 'Adulto' | 'Visitante' | 'Empregado(a)' | 'Outros';
export type DeviceType = 'tablet' | 'console' | 'laptop' | 'tv' | 'smartphone';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  mac: string;
  status: 'online' | 'offline';
  ip: string;
  isBlocked: boolean;
  isWhitelisted: boolean;
  assignedTo?: string; // Child ID for automatic blocking
}

export interface WhitelistDomain {
  id: string;
  domain: string;
  description: string;
  created_at: string;
}

export interface SystemSettings {
  theme: 'light' | 'dark';
  notifications: {
    taskCompleted: boolean;
    rewardRedeemed: boolean;
    punishmentApplied: boolean;
  };
  telegram: {
    botToken: string;
    chatId: string;
    enabled: boolean;
  };
}

export type VisualTheme = 'norton' | 'pokemon' | 'space' | 'onepiece';

export interface Child {
  id: string;
  name: string;
  avatar: string;
  role: MemberRole;
  birthday: string; // Formato YYYY-MM-DD
  pin: string;
  tasks: Task[];
  points: number;
  unlockedHours: number;
  hasTVAccess: boolean;
  punishments: Punishment[];
  currentStreak?: number;
  longestStreak?: number;
  themePreference?: 'light' | 'dark' | 'system';
  visualTheme?: VisualTheme;
}

export interface Punishment {
  id: string;
  type: 'Block' | 'PointLoss';
  duration?: number;
  reason: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  childId: string;
  childName: string;
  action: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info';
}

export interface Notice {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: MemberRole;
  content: string;
  createdAt: string;
  hiddenByAuthor: boolean; // Se o autor (filho) ocultou
  deletedByParent: boolean; // Se foi permanentemente deletado por adulto
}
