
export type ThemeId = 'norton' | 'pokemon' | 'space' | 'onepiece';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  darker: string;
  card: string;
  cardHover: string;
  border: string;
  success: string;
  danger: string;
  muted: string;
  text: string;
  textMuted: string;
}

export interface ThemeKeywords {
  // App terminology
  appName: string;
  appTagline: string;

  // Points/Currency
  points: string;
  pointsAbbrev: string;

  // Tasks/Missions
  tasks: string;
  taskSingular: string;
  completeTask: string;

  // Store
  store: string;
  rewards: string;
  rewardSingular: string;
  redeem: string;

  // Dashboard
  dashboard: string;
  protection: string;

  // Status
  unlocked: string;
  blocked: string;

  // Roles
  child: string;
  adult: string;

  // Actions
  save: string;
  cancel: string;

  // Greetings
  greeting: string;
  celebration: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  icon: string;
  description: string;
  colors: ThemeColors;
  keywords: ThemeKeywords;
}

export const THEMES: Record<ThemeId, Theme> = {
  norton: {
    id: 'norton',
    name: 'Norton',
    icon: '🛡️',
    description: 'Proteção familiar segura',
    colors: {
      primary: '#FFE600',
      secondary: '#FFD000',
      accent: '#FFE600',
      dark: '#0F0F0F',
      darker: '#0A0A0A',
      card: '#1A1A1A',
      cardHover: '#252525',
      border: '#2D2D2D',
      success: '#00D26A',
      danger: '#FF4757',
      muted: '#6B7280',
      text: '#FFFFFF',
      textMuted: '#9CA3AF',
    },
    keywords: {
      appName: 'Portal Família',
      appTagline: 'Proteção Familiar',
      points: 'Pontos',
      pointsAbbrev: 'pts',
      tasks: 'Missões',
      taskSingular: 'Missão',
      completeTask: 'Missão Completa!',
      store: 'Loja',
      rewards: 'Recompensas',
      rewardSingular: 'Recompensa',
      redeem: 'Resgatar',
      dashboard: 'Dashboard',
      protection: 'Proteção',
      unlocked: 'Desbloqueado',
      blocked: 'Bloqueado',
      child: 'Criança',
      adult: 'Adulto',
      save: 'Salvar',
      cancel: 'Cancelar',
      greeting: 'Bem-vindo!',
      celebration: 'Parabéns!',
    },
  },

  pokemon: {
    id: 'pokemon',
    name: 'Pokémon',
    icon: '⚡',
    description: 'Gotta catch em all!',
    colors: {
      primary: '#FFCB05',
      secondary: '#3B4CCA',
      accent: '#FF0000',
      dark: '#1A1A2E',
      darker: '#0F0F1A',
      card: '#2A2A4A',
      cardHover: '#3A3A5A',
      border: '#4A4A6A',
      success: '#78C850',
      danger: '#F08030',
      muted: '#A0A0C0',
      text: '#FFFFFF',
      textMuted: '#B0B0D0',
    },
    keywords: {
      appName: 'PokéFamília',
      appTagline: 'Treine sua Equipe!',
      points: 'PokéCoins',
      pointsAbbrev: 'PC',
      tasks: 'Treinamentos',
      taskSingular: 'Treinamento',
      completeTask: 'Treinamento Concluído!',
      store: 'PokéMart',
      rewards: 'Itens',
      rewardSingular: 'Item',
      redeem: 'Capturar',
      dashboard: 'Centro Pokémon',
      protection: 'Proteção',
      unlocked: 'Liberado',
      blocked: 'Em Pokébola',
      child: 'Treinador Jr.',
      adult: 'Mestre Pokémon',
      save: 'Salvar Jogo',
      cancel: 'Fugir',
      greeting: 'Olá, Treinador!',
      celebration: 'É super efetivo!',
    },
  },

  space: {
    id: 'space',
    name: 'Espaço',
    icon: '🚀',
    description: 'Explore o universo!',
    colors: {
      primary: '#00D4FF',
      secondary: '#7B2FFF',
      accent: '#FF6B35',
      dark: '#0B0B1A',
      darker: '#050510',
      card: '#151530',
      cardHover: '#202050',
      border: '#2A2A5A',
      success: '#00FF88',
      danger: '#FF3366',
      muted: '#6B7DB3',
      text: '#E0E8FF',
      textMuted: '#8090C0',
    },
    keywords: {
      appName: 'Estação Família',
      appTagline: 'Comando Espacial',
      points: 'Créditos Estelares',
      pointsAbbrev: 'CE',
      tasks: 'Missões Espaciais',
      taskSingular: 'Missão',
      completeTask: 'Missão Cumprida, Astronauta!',
      store: 'Base Estelar',
      rewards: 'Equipamentos',
      rewardSingular: 'Equipamento',
      redeem: 'Adquirir',
      dashboard: 'Centro de Comando',
      protection: 'Escudo',
      unlocked: 'Órbita Livre',
      blocked: 'Em Quarentena',
      child: 'Cadete',
      adult: 'Comandante',
      save: 'Transmitir',
      cancel: 'Abortar',
      greeting: 'Saudações, Astronauta!',
      celebration: 'Para o infinito e além!',
    },
  },

  onepiece: {
    id: 'onepiece',
    name: 'One Piece',
    icon: '🏴‍☠️',
    description: 'Em busca do tesouro!',
    colors: {
      primary: '#E31B23',
      secondary: '#FFCC00',
      accent: '#1E90FF',
      dark: '#1A0A0A',
      darker: '#0F0505',
      card: '#2A1515',
      cardHover: '#3A2020',
      border: '#4A2A2A',
      success: '#32CD32',
      danger: '#FF4500',
      muted: '#8B7355',
      text: '#FFF8DC',
      textMuted: '#D4C4A8',
    },
    keywords: {
      appName: 'Navio Família',
      appTagline: 'Rumo ao One Piece!',
      points: 'Berries',
      pointsAbbrev: 'B',
      tasks: 'Aventuras',
      taskSingular: 'Aventura',
      completeTask: 'Aventura Concluída, Nakama!',
      store: 'Porto do Tesouro',
      rewards: 'Tesouros',
      rewardSingular: 'Tesouro',
      redeem: 'Conquistar',
      dashboard: 'Convés',
      protection: 'Defesa',
      unlocked: 'Mar Aberto',
      blocked: 'Ancorado',
      child: 'Grumete',
      adult: 'Capitão',
      save: 'Ancorar',
      cancel: 'Recuar',
      greeting: 'Yohoho, Nakama!',
      celebration: 'Isso é o que significa ser pirata!',
    },
  },
};

export const DEFAULT_THEME: ThemeId = 'norton';

export const getTheme = (themeId: ThemeId | undefined): Theme => {
  return THEMES[themeId || DEFAULT_THEME] || THEMES[DEFAULT_THEME];
};

export const getThemeClass = (themeId: ThemeId | undefined): string => {
  return `theme-${themeId || DEFAULT_THEME}`;
};
