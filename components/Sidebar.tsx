
import React, { useState } from 'react';
import { Home, Users, Tv, Settings, ShieldAlert, Calendar, LayoutDashboard, ShoppingBag, LogOut, Lock, Cake, PartyPopper, Menu, X, Info, FileText, Sun, Moon, Monitor, Shield } from 'lucide-react';
import { Child } from '../types';
import { APP_VERSION, CHANGELOG } from '../version';

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
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout, currentUser, isReadOnly, upcomingBirthdays = [], isOpen, onToggle, currentTheme, onChangeTheme }) => {
  const [showChangelog, setShowChangelog] = useState(false);
  const userThemePref = currentUser?.themePreference || 'system';

  const menuItems = [
    { id: 'parent-dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
    { id: 'kids-portal', label: 'Missões', icon: Users, adminOnly: false },
    { id: 'store', label: 'Loja', icon: ShoppingBag, adminOnly: false },
    { id: 'tv-mode', label: 'TV', icon: Tv, adminOnly: false },
    { id: 'calendar', label: 'Calendário', icon: Calendar, adminOnly: false },
    { id: 'settings', label: 'Config', icon: Settings, adminOnly: true },
  ];

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
      {/* Mobile menu button - Norton Style */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-norton-dark border border-norton-yellow/30 text-norton-yellow rounded-xl shadow-lg shadow-black/50"
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

      {/* Sidebar - Norton Dark Theme */}
      <div className={`
        w-64 bg-norton-darker text-white flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-norton-border
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header with Logo */}
        <div className="p-5 border-b border-norton-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-norton-yellow rounded-xl flex items-center justify-center shadow-lg shadow-norton-yellow/20">
              <Shield size={22} className="text-norton-dark" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Portal Família</h1>
              <p className="text-[10px] text-norton-yellow font-semibold uppercase tracking-widest">Proteção Familiar</p>
            </div>
          </div>
          {isReadOnly && (
            <div className="mt-3 flex items-center gap-2 text-norton-yellow text-[10px] font-bold uppercase tracking-widest bg-norton-yellow/10 p-2 rounded-lg border border-norton-yellow/20">
              <Lock size={12} /> Modo Leitura
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Birthday Widget - Norton Style */}
          {upcomingBirthdays.length > 0 && (
            <div className="mb-5 bg-gradient-to-br from-norton-card to-norton-dark p-4 rounded-xl border border-norton-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-norton-yellow mb-3 flex items-center gap-2">
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
                      <img src={child.avatar} className="w-7 h-7 rounded-full border border-norton-yellow/30" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-gray-300">{child.name}</p>
                        <p className={`text-[10px] ${isToday ? 'text-norton-success font-bold' : 'text-gray-500'}`}>
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
                        ? 'bg-norton-yellow text-norton-dark font-bold shadow-lg shadow-norton-yellow/20'
                        : 'text-gray-400 hover:bg-norton-card hover:text-white'
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
        <div className="p-4 border-t border-norton-border space-y-3">
          {/* User Info */}
          {currentUser && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-norton-card">
              <img src={currentUser.avatar} className="w-9 h-9 rounded-full border-2 border-norton-yellow/30" alt="" />
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold truncate text-white">{currentUser.name}</p>
                <p className="text-[10px] text-norton-yellow uppercase font-bold">{currentUser.role}</p>
              </div>
            </div>
          )}

          {/* Theme Toggle - Norton Style */}
          {onChangeTheme && (
            <div className="flex items-center justify-between bg-norton-card rounded-xl p-2">
              <span className="text-xs text-gray-500 font-medium pl-2">Tema</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onChangeTheme('light')}
                  className={`p-2 rounded-lg transition ${userThemePref === 'light' ? 'bg-norton-yellow text-norton-dark' : 'text-gray-500 hover:text-white hover:bg-norton-cardHover'}`}
                  title="Claro"
                >
                  <Sun size={14} />
                </button>
                <button
                  onClick={() => onChangeTheme('dark')}
                  className={`p-2 rounded-lg transition ${userThemePref === 'dark' ? 'bg-norton-yellow text-norton-dark' : 'text-gray-500 hover:text-white hover:bg-norton-cardHover'}`}
                  title="Escuro"
                >
                  <Moon size={14} />
                </button>
                <button
                  onClick={() => onChangeTheme('system')}
                  className={`p-2 rounded-lg transition ${userThemePref === 'system' ? 'bg-norton-yellow text-norton-dark' : 'text-gray-500 hover:text-white hover:bg-norton-cardHover'}`}
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
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-norton-danger/10 hover:text-norton-danger transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            <span>{isReadOnly ? 'Voltar' : 'Sair'}</span>
          </button>

          {/* Version Footer */}
          <button
            onClick={() => setShowChangelog(true)}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-norton-yellow transition text-xs py-2"
          >
            <Info size={11} />
            <span className="font-medium">v{APP_VERSION}</span>
          </button>
        </div>
      </div>

      {/* Changelog Modal - Norton Style */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowChangelog(false)}>
          <div
            className="bg-norton-dark border border-norton-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-norton-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-norton-yellow/10 border border-norton-yellow/20 rounded-xl">
                  <FileText size={20} className="text-norton-yellow" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Changelog</h2>
                  <p className="text-xs text-gray-500">Versão {APP_VERSION}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="p-2 hover:bg-norton-card rounded-xl transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-gray-400 text-sm space-y-4">
                {CHANGELOG.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-2xl font-black text-white mt-0">{line.replace('# ', '')}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-bold text-norton-yellow mt-6 mb-2 border-b border-norton-border pb-2">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-sm font-bold text-gray-300 mt-4 mb-1">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('- **')) {
                    const match = line.match(/- \*\*(.+?)\*\*(.*)/);
                    if (match) {
                      return <p key={i} className="ml-2 my-1"><span className="font-bold text-white">{match[1]}</span>{match[2]}</p>;
                    }
                  }
                  if (line.startsWith('  - ')) {
                    return <p key={i} className="ml-6 text-gray-500 my-0.5 text-xs">{line.replace('  - ', '• ')}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return <p key={i} className="ml-2 text-gray-400 my-0.5">{line.replace('- ', '• ')}</p>;
                  }
                  if (line.trim()) {
                    return <p key={i} className="text-gray-500 my-1">{line}</p>;
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
