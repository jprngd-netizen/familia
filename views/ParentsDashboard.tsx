
import React, { useState } from 'react';
import {
  TrendingUp, Activity, ShieldAlert, Plus, CheckCircle2, X, AlertTriangle, Coins, Clock, Check, Ban, Shield
} from 'lucide-react';
import { Child, ActivityLog, Reward, RewardRequest } from '../types';

interface ParentsDashboardProps {
  children: Child[];
  logs: ActivityLog[];
  rewards: Reward[];
  rewardRequests: RewardRequest[];
  onProcessRequest: (requestId: string, approve: boolean) => void;
  onApplyPunishment: (childId: string, reason: string, type: 'Block' | 'PointLoss', amount?: number) => void;
  onCreateReward: (reward: Omit<Reward, 'id'>) => void;
  onAdjustPoints: (childId: string, amount: number, reason: string) => void;
  onResetAllowance: (childId: string) => void;
  onChildClick: (id: string) => void;
  onQuickUnlock: (id: string) => void;
  onToggleTV: (childId: string) => void;
}

const ParentsDashboard: React.FC<ParentsDashboardProps> = ({
  children, logs, rewardRequests, onProcessRequest, onAdjustPoints, onChildClick, onQuickUnlock, onToggleTV
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Dashboard Parental</h2>
          <p className="text-sm sm:text-base text-gray-400 font-medium">Gestao inteligente e gamificada da familia.</p>
        </div>
      </header>

      {/* Central de Aprovacao */}
      {rewardRequests.length > 0 && (
        <div className="bg-norton-yellow/10 border-2 border-norton-yellow/30 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 animate-in zoom-in duration-300">
           <h3 className="text-lg sm:text-xl font-black text-norton-yellow mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Clock size={20} className="sm:w-6 sm:h-6" /> Central de Aprovacao ({rewardRequests.length})
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {rewardRequests.map(req => (
                <div key={req.id} className="bg-norton-card p-6 rounded-3xl shadow-sm border border-norton-border flex flex-col justify-between">
                   <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                         <span className="bg-norton-yellow/20 text-norton-yellow px-2 py-1 rounded-lg text-[10px] font-black uppercase">Solicitacao Pendente</span>
                         <span className="text-[10px] text-gray-500 font-bold ml-auto">{req.timestamp}</span>
                      </div>
                      <p className="text-lg font-bold text-white">{req.childName} quer resgatar:</p>
                      <p className="text-norton-yellow font-black text-xl mb-2">{req.rewardTitle}</p>
                      <p className="text-sm font-bold text-gray-400 flex items-center gap-1">
                         <Coins size={14} /> Custo: {req.cost} pontos
                      </p>
                   </div>
                   <div className="flex gap-2">
                      <button
                        onClick={() => onProcessRequest(req.id, true)}
                        className="flex-1 bg-norton-success text-white py-3 rounded-2xl font-black text-sm hover:brightness-110 transition flex items-center justify-center gap-2"
                      >
                         <Check size={18} /> Aprovar
                      </button>
                      <button
                        onClick={() => onProcessRequest(req.id, false)}
                        className="flex-1 bg-norton-danger/20 text-norton-danger py-3 rounded-2xl font-black text-sm hover:bg-norton-danger/30 transition flex items-center justify-center gap-2"
                      >
                         <X size={18} /> Negar
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          {/* Card de Membros */}
          <div className="bg-norton-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-norton-border">
             <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Status da Familia</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {children.map(child => (
                   <div key={child.id} className="p-4 rounded-3xl border border-norton-border bg-norton-dark flex items-center justify-between group hover:border-norton-yellow/30 transition-all">
                      <button onClick={() => onChildClick(child.id)} className="flex items-center gap-3 text-left">
                         <img src={child.avatar} className="w-12 h-12 rounded-2xl border-2 border-norton-border" alt="" />
                         <div>
                            <p className="font-bold text-white">{child.name}</p>
                            <p className="text-xs font-bold text-norton-yellow">{child.points} pts</p>
                         </div>
                      </button>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                         <button onClick={() => onToggleTV(child.id)} className={`p-2 rounded-xl transition ${child.hasTVAccess ? 'bg-norton-yellow text-norton-dark' : 'bg-norton-dark border border-norton-border text-gray-400'}`}><ShieldAlert size={16} /></button>
                         <button onClick={() => onQuickUnlock(child.id)} className="p-2 bg-norton-dark border border-norton-border text-norton-yellow rounded-xl hover:bg-norton-cardHover"><Plus size={16} /></button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Logs Rapidos */}
          <div className="bg-norton-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-norton-border">
             <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Atividade Recente</h3>
             <div className="space-y-4">
                {logs.slice(0, 5).map(log => (
                   <div key={log.id} className="flex gap-4 items-start">
                      <div className={`w-2 h-2 mt-2 rounded-full ${log.type === 'success' ? 'bg-norton-success' : log.type === 'warning' ? 'bg-norton-danger' : 'bg-norton-yellow'}`} />
                      <div>
                         <p className="text-sm font-bold text-white">{log.action}</p>
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{log.childName} • {log.timestamp}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
           <div className="bg-gradient-to-br from-norton-dark to-norton-darker p-6 sm:p-8 rounded-2xl sm:rounded-[3rem] text-white shadow-xl border border-norton-border flex flex-col items-center text-center">
              <Activity size={40} className="sm:w-12 sm:h-12 text-norton-yellow mb-4 sm:mb-6" />
              <h4 className="text-xl sm:text-2xl font-black mb-2">Engajamento Semanal</h4>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">As criancas estao completando 85% das missoes dentro do prazo esperado.</p>
              <div className="w-full h-2 sm:h-3 bg-norton-border rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-norton-yellow" style={{width: '85%'}} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-norton-yellow">Meta: 90%</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ParentsDashboard;
