
import React, { useState } from 'react';
import { Home, Users, Tv, Settings, ShieldAlert, Calendar, LayoutDashboard, ShoppingBag, LogOut, Lock, Cake, PartyPopper, Menu, X, Info, FileText, Sun, Moon, Monitor, Shield, Palette } from 'lucide-react';
import { Child, VisualTheme } from '../types';
import { APP_VERSION, CHANGELOG } from '../version';
import { THEMES, ThemeId } from '../themes';
import { useKeywords } from '../ThemeContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  currentUser: Child | null;
  isReadOnly: boolean;
  upcomingBirthdays?: Child[];
  isOpen: boolean;
  onToggle: () => void;
  currentTheme?: 'light' | 'dark';
  onChangeTheme?: (theme: 'light' | 'dark' | 'system') => void;
  currentVisualTheme?: VisualTheme;
  onChangeVisualTheme?: (theme: VisualTheme) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout, currentUser, isReadOnly, upcomingBirthdays = [], isOpen, onToggle, currentTheme, onChangeTheme, currentVisualTheme, onChangeVisualTheme }) => {
  const [showChangelog, setShowChangelog] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const userThemePref = currentUser?.themePreference || 'system';
  const keywords = useKeywords();

  const menuItems = [
    { id: 'parent-dashboard', label: keywords.dashboard, icon: LayoutDashboard, adminOnly: true },
    { id: 'kids-portal', label: keywords.tasks, icon: Users, adminOnly: false },
    { id: 'store', label: keywords.store, icon: ShoppingBag, adminOnly: false },
    { id: 'tv-mode', label: 'TV', icon: Tv, adminOnly: false },
    { id: 'calendar', label: 'Calendário', icon: Calendar, adminOnly: false },
    { id: 'settings', label: 'Config', icon: Settings, adminOnly: true },
  ];

  const themeOptions: ThemeId[] = ['norton', 'pokemon', 'space', 'onepiece'];

  const filteredItems = menuItems.filter(item => {
    if (item.adminOnly && currentUser?.role !== 'Adulto') return false;
    if (item.adminOnly && isReadOnly) return false;
    return true;
  });

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-theme-dark border border-theme-primary/30 text-theme-primary rounded-xl shadow-lg shadow-black/50"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-theme-darker text-theme-text flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-theme-border
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header with Logo */}
        <div className="p-5 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-theme-primary rounded-xl flex items-center justify-center shadow-lg shadow-theme-primary/20">
              <span className="text-xl">{THEMES[currentVisualTheme || 'norton'].icon}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-theme-text tracking-tight">{keywords.appName}</h1>
              <p className="text-[10px] text-theme-primary font-semibold uppercase tracking-widest">{keywords.appTagline}</p>
            </div>
          </div>
          {isReadOnly && (
            <div className="mt-3 flex items-center gap-2 text-theme-primary text-[10px] font-bold uppercase tracking-widest bg-theme-primary/10 p-2 rounded-lg border border-theme-primary/20">
              <Lock size={12} /> Modo Leitura
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Birthday Widget */}
          {upcomingBirthdays.length > 0 && (
            <div className="mb-5 bg-gradient-to-br from-theme-card to-theme-dark p-4 rounded-xl border border-theme-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-theme-primary mb-3 flex items-center gap-2">
                <Cake size={12} /> Aniversários
              </p>
              <div className="space-y-2">
                {upcomingBirthdays.map(child => {
                  const today = new Date();
                  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const [y, m, d] = child.birthday.split('-').map(Number);
                  const bDate = new Date(todayLocal.getFullYear(), m - 1, d);
                  if (bDate < todayLocal) bDate.setFullYear(todayLocal.getFullYear() + 1);
                  const isToday = todayLocal.getDate() === bDate.getDate() && todayLocal.getMonth() === bDate.getMonth();

                  return (
                    <div key={child.id} className="flex items-center gap-2">
                      <img src={child.avatar} className="w-7 h-7 rounded-full border border-theme-primary/30" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-theme-textMuted">{child.name}</p>
                        <p className={`text-[10px] ${isToday ? 'text-theme-success font-bold' : 'text-theme-muted'}`}>
                          {isToday ? '🎂 HOJE!' : bDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-theme-primary text-theme-dark font-bold shadow-lg shadow-theme-primary/20'
                        : 'text-theme-muted hover:bg-theme-card hover:text-theme-text'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border space-y-3">
          {/* User Info */}
          {currentUser && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-theme-card">
              <img src={currentUser.avatar} className="w-9 h-9 rounded-full border-2 border-theme-primary/30" alt="" />
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold truncate text-theme-text">{currentUser.name}</p>
                <p className="text-[10px] text-theme-primary uppercase font-bold">{currentUser.role}</p>
              </div>
            </div>
          )}

          {/* Visual Theme Selector */}
          {onChangeVisualTheme && (
            <div className="bg-theme-card rounded-xl p-2">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-theme-cardHover transition"
              >
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-theme-primary" />
                  <span className="text-xs text-theme-muted font-medium">Estilo Visual</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg">{THEMES[currentVisualTheme || 'norton'].icon}</span>
                  <span className="text-xs text-theme-text font-bold">{THEMES[currentVisualTheme || 'norton'].name}</span>
                </div>
              </button>

              {showThemeSelector && (
                <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-theme-border">
                  {themeOptions.map((themeId) => {
                    const theme = THEMES[themeId];
                    const isSelected = currentVisualTheme === themeId;
                    return (
                      <button
                        key={themeId}
                        onClick={() => {
                          onChangeVisualTheme(themeId);
                          setShowThemeSelector(false);
                        }}
                        className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-theme-primary/20 border border-theme-primary'
                            : 'bg-theme-dark hover:bg-theme-cardHover border border-transparent'
                        }`}
                      >
                        <span className="text-xl">{theme.icon}</span>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-theme-primary' : 'text-theme-muted'}`}>
                          {theme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Light/Dark Theme Toggle */}
          {onChangeTheme && (
            <div className="flex items-center justify-between bg-theme-card rounded-xl p-2">
              <span className="text-xs text-theme-muted font-medium pl-2">Brilho</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onChangeTheme('light')}
                  className={`p-2 rounded-lg transition ${userThemePref === 'light' ? 'bg-theme-primary text-theme-dark' : 'text-theme-muted hover:text-theme-text hover:bg-theme-cardHover'}`}
                  title="Claro"
                >
                  <Sun size={14} />
                </button>
                <button
                  onClick={() => onChangeTheme('dark')}
                  className={`p-2 rounded-lg transition ${userThemePref === 'dark' ? 'bg-theme-primary text-theme-dark' : 'text-theme-muted hover:text-theme-text hover:bg-theme-cardHover'}`}
                  title="Escuro"
                >
                  <Moon size={14} />
                </button>
                <button
                  onClick={() => onChangeTheme('system')}
                  className={`p-2 rounded-lg transition ${userThemePref === 'system' ? 'bg-theme-primary text-theme-dark' : 'text-theme-muted hover:text-theme-text hover:bg-theme-cardHover'}`}
                  title="Sistema"
                >
                  <Monitor size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-theme-muted hover:bg-theme-danger/10 hover:text-theme-danger transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            <span>{isReadOnly ? 'Voltar' : 'Sair'}</span>
          </button>

          {/* Version Footer */}
          <button
            onClick={() => setShowChangelog(true)}
            className="w-full flex items-center justify-center gap-2 text-theme-muted hover:text-theme-primary transition text-xs py-2"
          >
            <Info size={11} />
            <span className="font-medium">v{APP_VERSION}</span>
          </button>
        </div>
      </div>

      {/* Changelog Modal */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowChangelog(false)}>
          <div
            className="bg-theme-dark border border-theme-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-theme-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-theme-primary/10 border border-theme-primary/20 rounded-xl">
                  <FileText size={20} className="text-theme-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-theme-text">Changelog</h2>
                  <p className="text-xs text-theme-muted">Versão {APP_VERSION}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="p-2 hover:bg-theme-card rounded-xl transition"
              >
                <X size={20} className="text-theme-muted" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-theme-textMuted text-sm space-y-4">
                {CHANGELOG.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-2xl font-black text-theme-text mt-0">{line.replace('# ', '')}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-bold text-theme-primary mt-6 mb-2 border-b border-theme-border pb-2">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-sm font-bold text-theme-textMuted mt-4 mb-1">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('- **')) {
                    const match = line.match(/- \*\*(.+?)\*\*(.*)/);
                    if (match) {
                      return <p key={i} className="ml-2 my-1"><span className="font-bold text-theme-text">{match[1]}</span>{match[2]}</p>;
                    }
                  }
                  if (line.startsWith('  - ')) {
                    return <p key={i} className="ml-6 text-theme-muted my-0.5 text-xs">{line.replace('  - ', '• ')}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return <p key={i} className="ml-2 text-theme-textMuted my-0.5">{line.replace('- ', '• ')}</p>;
                  }
                  if (line.trim()) {
                    return <p key={i} className="text-theme-muted my-1">{line}</p>;
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
