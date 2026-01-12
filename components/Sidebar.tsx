
import React, { useState } from 'react';
import { Home, Users, Tv, Settings, ShieldAlert, Calendar, LayoutDashboard, ShoppingBag, LogOut, Lock, Cake, PartyPopper, Menu, X, Info, FileText } from 'lucide-react';
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
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout, currentUser, isReadOnly, upcomingBirthdays = [], isOpen, onToggle }) => {
  const [showChangelog, setShowChangelog] = useState(false);

  const menuItems = [
    { id: 'parent-dashboard', label: 'Dashboard Pais', icon: LayoutDashboard, adminOnly: true },
    { id: 'kids-portal', label: 'Minhas Missões', icon: Users, adminOnly: false },
    { id: 'store', label: 'Loja Familiar', icon: ShoppingBag, adminOnly: false },
    { id: 'tv-mode', label: 'Modo TV', icon: Tv, adminOnly: false },
    { id: 'calendar', label: 'Calendário', icon: Calendar, adminOnly: false },
    { id: 'settings', label: 'Configurações', icon: Settings, adminOnly: true },
  ];

  const filteredItems = menuItems.filter(item => {
    if (item.adminOnly && currentUser?.role !== 'Adulto') return false;
    if (item.adminOnly && isReadOnly) return false;
    return true;
  });

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-900 text-white rounded-xl shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-indigo-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
            <span className="bg-white text-indigo-900 p-1 rounded-lg text-sm lg:text-base">PF</span>
            Portal Família
          </h1>
          {isReadOnly && (
            <div className="mt-4 flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest bg-white/5 p-2 rounded-lg">
              <Lock size={12} /> Somente Leitura
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
          {/* Widget de Aniversário */}
          {upcomingBirthdays.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-rose-500/20 to-indigo-500/20 p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300 mb-3 flex items-center gap-2">
                <Cake size={12} /> Próximas Festas
              </p>
              <div className="space-y-3">
                {upcomingBirthdays.map(child => {
                  const today = new Date();
                  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  const [y, m, d] = child.birthday.split('-').map(Number);
                  const bDate = new Date(todayLocal.getFullYear(), m - 1, d);

                  if (bDate < todayLocal) {
                    bDate.setFullYear(todayLocal.getFullYear() + 1);
                  }

                  const isToday = todayLocal.getDate() === bDate.getDate() && todayLocal.getMonth() === bDate.getMonth();

                  return (
                    <div key={child.id} className="flex items-center gap-3">
                      <img src={child.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{child.name}</p>
                        <p className={`text-[10px] font-medium ${isToday ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                          {isToday ? 'É HOJE! 🎂' : bDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50'
                        : 'hover:bg-indigo-800/50 text-indigo-200'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-indigo-800 space-y-2">
          {currentUser && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-white/20" alt="" />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                <p className="text-[10px] text-indigo-300 uppercase font-black">{currentUser.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-300 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            <span>{isReadOnly ? 'Voltar ao Início' : 'Sair do Perfil'}</span>
          </button>

          {/* Version Footer */}
          <div className="pt-3 border-t border-indigo-800/50 mt-3">
            <button
              onClick={() => setShowChangelog(true)}
              className="w-full flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-200 transition text-xs py-2"
            >
              <Info size={12} />
              <span className="font-medium">Portal Família v{APP_VERSION}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Changelog Modal */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowChangelog(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <FileText size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Changelog</h2>
                  <p className="text-xs text-slate-500">Versão atual: {APP_VERSION}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] prose prose-sm dark:prose-invert prose-indigo">
              <div className="text-slate-700 dark:text-slate-300 text-sm space-y-4 whitespace-pre-wrap font-mono">
                {CHANGELOG.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-2xl font-black text-slate-900 dark:text-white mt-0">{line.replace('# ', '')}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-4 mb-1">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('- **')) {
                    const match = line.match(/- \*\*(.+?)\*\*(.*)/);
                    if (match) {
                      return <p key={i} className="ml-2 my-1"><span className="font-bold text-slate-900 dark:text-white">{match[1]}</span>{match[2]}</p>;
                    }
                  }
                  if (line.startsWith('  - ')) {
                    return <p key={i} className="ml-6 text-slate-600 dark:text-slate-400 my-0.5 text-xs">{line.replace('  - ', '• ')}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return <p key={i} className="ml-2 text-slate-600 dark:text-slate-400 my-0.5">{line.replace('- ', '• ')}</p>;
                  }
                  if (line.trim()) {
                    return <p key={i} className="text-slate-600 dark:text-slate-400 my-1">{line}</p>;
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
