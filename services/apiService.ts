
// API Service for Portal Família
// This service handles all communication with the backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return handleResponse<T>(response);
}

// ==================== AUTH ====================

export const authAPI = {
  verifyPin: async (memberId: string, pin: string) => {
    return apiRequest<{ success: boolean; member: any }>('/auth/verify-pin', 'POST', { memberId, pin });
  },
  
  checkAdmin: async (memberId: string) => {
    return apiRequest<{ isAdmin: boolean }>(`/auth/check-admin/${memberId}`);
  },
};

// ==================== CHILDREN ====================

export const childrenAPI = {
  getAll: async () => {
    return apiRequest<any[]>('/children');
  },
  
  getById: async (id: string) => {
    return apiRequest<any>(`/children/${id}`);
  },
  
  create: async (data: { name: string; avatar: string; role: string; birthday: string; pin: string }) => {
    return apiRequest<any>('/children', 'POST', data);
  },
  
  update: async (id: string, data: any) => {
    return apiRequest<any>(`/children/${id}`, 'PUT', data);
  },
  
  delete: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/children/${id}`, 'DELETE');
  },
  
  adjustPoints: async (id: string, amount: number, reason: string) => {
    return apiRequest<{ success: boolean; newPoints: number }>(`/children/${id}/adjust-points`, 'POST', { amount, reason });
  },
  
  quickUnlock: async (id: string, hours = 1) => {
    return apiRequest<{ success: boolean; unlockedHours: number }>(`/children/${id}/quick-unlock`, 'POST', { hours });
  },
  
  toggleTV: async (id: string) => {
    return apiRequest<{ success: boolean; hasTVAccess: boolean }>(`/children/${id}/toggle-tv`, 'POST');
  },
};

// ==================== TASKS ====================

export const tasksAPI = {
  getByChild: async (childId: string) => {
    return apiRequest<any[]>(`/tasks/child/${childId}`);
  },
  
  create: async (data: { childId: string; title: string; points: number; category: string; recurrence?: string; schedule?: any }) => {
    return apiRequest<any>('/tasks', 'POST', data);
  },
  
  toggle: async (id: string) => {
    return apiRequest<{ success: boolean; completed: boolean; newPoints: number }>(`/tasks/${id}/toggle`, 'POST');
  },
  
  update: async (id: string, data: any) => {
    return apiRequest<any>(`/tasks/${id}`, 'PUT', data);
  },
  
  delete: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/tasks/${id}`, 'DELETE');
  },
};

// ==================== REWARDS ====================

export const rewardsAPI = {
  getAll: async () => {
    return apiRequest<any[]>('/rewards');
  },
  
  create: async (data: { title: string; description: string; cost: number; icon?: string; category?: string }) => {
    return apiRequest<any>('/rewards', 'POST', data);
  },
  
  update: async (id: string, data: any) => {
    return apiRequest<any>(`/rewards/${id}`, 'PUT', data);
  },
  
  delete: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/rewards/${id}`, 'DELETE');
  },
  
  redeem: async (id: string, childId: string) => {
    return apiRequest<{ success: boolean; requiresApproval: boolean; message: string; newPoints?: number; requestId?: string }>(`/rewards/${id}/redeem`, 'POST', { childId });
  },
  
  getPendingRequests: async () => {
    return apiRequest<any[]>('/rewards/requests/pending');
  },
  
  processRequest: async (id: string, approve: boolean) => {
    return apiRequest<{ success: boolean; approved: boolean }>(`/rewards/requests/${id}/process`, 'POST', { approve });
  },
};

// ==================== DEVICES ====================

export const devicesAPI = {
  getAll: async () => {
    return apiRequest<any[]>('/devices');
  },
  
  create: async (data: { name: string; type: string; mac: string; assignedTo?: string }) => {
    return apiRequest<any>('/devices', 'POST', data);
  },
  
  update: async (id: string, data: any) => {
    return apiRequest<any>(`/devices/${id}`, 'PUT', data);
  },
  
  delete: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/devices/${id}`, 'DELETE');
  },
  
  toggleBlock: async (id: string) => {
    return apiRequest<{ success: boolean; isBlocked: boolean; message: string }>(`/devices/${id}/toggle-block`, 'POST');
  },
  
  temporaryUnblock: async (id: string, minutes: number) => {
    return apiRequest<{ success: boolean; message: string; expiresAt: string }>(`/devices/${id}/temporary-unblock`, 'POST', { minutes });
  },
  
  getFirewallStatus: async () => {
    return apiRequest<any>('/devices/firewall/status');
  },
};

// ==================== LOGS ====================

export const logsAPI = {
  getRecent: async (limit = 50) => {
    return apiRequest<any[]>(`/logs?limit=${limit}`);
  },
  
  getByChild: async (childId: string, limit = 50) => {
    return apiRequest<any[]>(`/logs/child/${childId}?limit=${limit}`);
  },
  
  create: async (data: { childId?: string; childName?: string; action: string; type?: string }) => {
    return apiRequest<any>('/logs', 'POST', data);
  },
  
  cleanup: async (days = 30) => {
    return apiRequest<{ success: boolean; deleted: number }>(`/logs/cleanup?days=${days}`, 'DELETE');
  },
};

// ==================== SETTINGS ====================

export const settingsAPI = {
  get: async () => {
    return apiRequest<any>('/settings');
  },
  
  update: async (data: any) => {
    return apiRequest<any>('/settings', 'PUT', data);
  },
};

// ==================== CALENDAR ====================

export const calendarAPI = {
  getEvents: async () => {
    return apiRequest<any[]>('/calendar/events');
  },
};

// ==================== HEALTH CHECK ====================

export const healthAPI = {
  check: async () => {
    return apiRequest<{ status: string; timestamp: string; version: string }>('/health');
  },
};

export default {
  auth: authAPI,
  children: childrenAPI,
  tasks: tasksAPI,
  rewards: rewardsAPI,
  devices: devicesAPI,
  logs: logsAPI,
  settings: settingsAPI,
  calendar: calendarAPI, // Add calendar module
  health: healthAPI,
};