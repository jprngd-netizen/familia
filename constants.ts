
import { Child, ActivityLog, Reward, Device } from './types';

export const MOCK_DEVICES: Device[] = [
  { id: 'd1', name: 'iPad Pro - Henrique', type: 'tablet', mac: '00:1A:2B:3C:4D:5E', status: 'online', ip: '192.168.1.15', isBlocked: false },
  { id: 'd2', name: 'Nintendo Switch', type: 'console', mac: 'AA:BB:CC:DD:EE:FF', status: 'online', ip: '192.168.1.22', isBlocked: false },
  { id: 'd3', name: 'MacBook Beatriz', type: 'laptop', mac: '11:22:33:44:55:66', status: 'offline', ip: '192.168.1.18', isBlocked: false },
  { id: 'd4', name: 'Smart TV LG 55"', type: 'tv', mac: '99:88:77:66:55:44', status: 'online', ip: '192.168.1.5', isBlocked: true },
];

// Pegando data de hoje para testar a funcionalidade de aniversário no Henrique
const today = new Date();
const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

export const MOCK_CHILDREN: Child[] = [
  {
    id: 'c1',
    name: 'Henrique',
    avatar: 'https://picsum.photos/seed/boy1/200',
    role: 'Criança',
    birthday: todayString, // HOJE é aniversário dele para teste!
    pin: '1234',
    points: 12500,
    unlockedHours: 4,
    hasTVAccess: false,
    tasks: [
      { id: 't1', title: 'Arrumar a cama', points: 200, completed: false, category: 'Chores', recurrence: 'daily', schedule: { end: '08:30' } },
      { id: 't2', title: 'Dever de casa', points: 1000, completed: false, category: 'School', recurrence: 'weekdays', schedule: { start: '14:00', end: '16:00' } },
    ],
    punishments: []
  },
  {
    id: 'c2',
    name: 'Beatriz',
    avatar: 'https://picsum.photos/seed/girl1/200',
    role: 'Criança',
    birthday: '2015-05-12',
    pin: '4321',
    points: 8500,
    unlockedHours: 2,
    hasTVAccess: false,
    tasks: [
      { id: 't5', title: 'Praticar Piano', points: 1500, completed: false, category: 'Personal', recurrence: 'weekly', schedule: { start: '10:00', end: '11:00' } },
    ],
    punishments: []
  },
  {
    id: 'p1',
    name: 'Papai/Mamãe',
    avatar: 'https://picsum.photos/seed/parents/200',
    role: 'Adulto',
    birthday: '1985-10-20',
    pin: '0000',
    points: 0,
    unlockedHours: 24,
    hasTVAccess: true,
    tasks: [],
    punishments: []
  }
];

export const DAILY_ACTIVITIES = [
  { time: '18:30', title: 'Banho e Organização', icon: '🛁' },
  { time: '19:30', title: 'Jantar em Família', icon: '🍽️' },
  { time: '21:00', title: 'Momento de Leitura', icon: '📖' }
];

export const MOTIVATIONAL_QUOTES = [
  "A harmonia em casa vale mais que qualquer tela.",
  "Qualidade é fazer certo mesmo quando ninguém está olhando.",
  "Família unida, tarefas concluídas com alegria!",
  "O respeito é a base de toda grande equipe familiar.",
  "Pequenas ações diárias geram grandes sorrisos.",
  "Um ambiente organizado traz paz para o coração."
];

export const MOCK_REWARDS: Reward[] = [
  { id: 'r1', title: '30 min de Game', description: 'Tempo extra liberado no console ou tablet.', cost: 500, icon: '🎮', category: 'Digital' },
  { id: 'r5', title: 'Skin ou App Novo', description: 'Crédito para compra de item cosmético (Aprox. R$ 25).', cost: 2500, icon: '📱', category: 'Digital' },
  { id: 'r4', title: 'Dormir 1h mais tarde', description: 'Válido para sexta ou sábado.', cost: 1000, icon: '🌙', category: 'Digital' },
  { id: 'r2', title: 'Escolher o Jantar (Pizza)', description: 'Uma pizza grande com entrega inclusa (Aprox. R$ 85).', cost: 8500, icon: '🍕', category: 'Guloseimas' },
  { id: 'r3', title: 'Passeio ao Parque', description: 'Entrada no parque e lanche (Aprox. R$ 120).', cost: 12000, icon: '🌳', category: 'Lazer' },
];

export const MOCK_LOGS: ActivityLog[] = [
  { id: 'l1', childId: 'c1', childName: 'Henrique', action: 'Completou "Dever de casa"', timestamp: '10:15', type: 'success' },
  { id: 'l2', childId: 'c2', childName: 'Beatriz', action: 'Completou "Escovar os dentes"', timestamp: '08:30', type: 'success' },
];

export const WEEKLY_CHART_DATA = [
  { day: 'Seg', henrique: 2000, beatriz: 1500 },
  { day: 'Ter', henrique: 3000, beatriz: 2500 },
  { day: 'Qua', henrique: 2500, beatriz: 4000 },
  { day: 'Qui', henrique: 4000, beatriz: 3000 },
  { day: 'Sex', henrique: 3500, beatriz: 3500 },
  { day: 'Sab', henrique: 5000, beatriz: 4500 },
  { day: 'Dom', henrique: 4500, beatriz: 5000 },
];
