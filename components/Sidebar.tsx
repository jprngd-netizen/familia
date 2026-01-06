
import React from 'react';
import { Home, Users, Tv, Settings, ShieldAlert, Calendar, LayoutDashboard, ShoppingBag, LogOut, Lock, Cake, PartyPopper } from 'lucide-react';
import { Child } from '../types';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  currentUser: Child | null;
  isReadOnly: boolean;
  upcomingBirthdays?: Child[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout, currentUser, isReadOnly, upcomingBirthdays = [] }) => {
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

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-white text-indigo-900 p-1 rounded-lg">PF</span>
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
                  onClick={() => onViewChange(item.id)}
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
      </div>
    </div>
  );
};

export default Sidebar;
