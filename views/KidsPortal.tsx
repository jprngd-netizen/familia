
import React, { useState } from 'react';
import {
  CheckCircle2, Circle, Trophy, Zap, ShoppingBag, PiggyBank, Heart, Repeat, Plus, Coins, X
} from 'lucide-react';
import { Child, Task, Reward } from '../types';

interface KidsPortalProps {
  children: Child[];
  rewards: Reward[];
  onToggleTask: (childId: string, taskId: string) => void;
  onRedeemReward: (childId: string, rewardId: string) => void;
  isReadOnly?: boolean;
  initialSelectedId?: string;
  onAddTask?: (childId: string, task: Omit<Task, 'id' | 'completed'>) => void;
}

const KidsPortal: React.FC<KidsPortalProps> = ({
  children, rewards, onToggleTask, onRedeemReward, isReadOnly = false, initialSelectedId, onAddTask
}) => {
  const [selectedChildId, setSelectedChildId] = useState(initialSelectedId || children[0].id);
  const [showStore, setShowStore] = useState(false);

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];
  const progressPercent = Math.round((selectedChild.tasks.filter(t => t.completed).length / selectedChild.tasks.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-indigo-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-kids pb-24 relative overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 lg:mb-12 gap-4 sm:gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-slate-800 dark:text-white mb-1 sm:mb-2 tracking-tight">
            {isReadOnly ? `Monitorando: ${selectedChild.name}` : `Boa jornada, ${selectedChild.name}!`}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base lg:text-lg font-medium">
            Você tem <span className="text-indigo-600 font-bold">{selectedChild.points}</span> pontos para usar.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setShowStore(true)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold sm:font-black flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:bg-indigo-700 transition active:scale-95 uppercase tracking-wider text-xs sm:text-sm"
          >
            <ShoppingBag size={18} className="sm:w-6 sm:h-6" /> Ir para a Loja
          </button>
        )}
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl lg:rounded-[3rem] p-4 sm:p-6 lg:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-black mb-4 sm:mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3 dark:text-white">
              <Zap className="text-amber-500" size={20} /> Missões de Hoje
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {selectedChild.tasks.map(task => (
                <button
                  key={task.id}
                  disabled={isReadOnly}
                  onClick={() => onToggleTask(selectedChild.id, task.id)}
                  className={`w-full flex items-center justify-between p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] border-2 transition-all active:scale-[0.98] group ${
                    task.completed
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 min-w-0 flex-1">
                    {task.completed
                      ? <CheckCircle2 size={24} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-emerald-500 flex-shrink-0" />
                      : <Circle size={24} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-slate-200 dark:text-slate-700 flex-shrink-0" />
                    }
                    <div className="text-left min-w-0">
                      <p className={`text-sm sm:text-base lg:text-2xl font-bold sm:font-black truncate ${
                        task.completed
                          ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-50'
                          : 'text-slate-700 dark:text-white'
                      }`}>
                        {task.title}
                      </p>
                      <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold sm:font-black text-sm sm:text-base lg:text-xl flex-shrink-0 ml-2 ${
                    task.completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    +{task.points}
                  </div>
                </button>
              ))}

              {selectedChild.tasks.length === 0 && (
                <div className="text-center py-8 sm:py-12 opacity-50">
                  <Trophy size={32} className="sm:w-12 sm:h-12 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-400 text-sm sm:text-base">Nenhuma missão para hoje!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl sm:rounded-3xl lg:rounded-[3rem] p-4 sm:p-6 lg:p-10 text-white shadow-xl">
            <PiggyBank size={32} className="sm:w-12 sm:h-12 lg:w-16 lg:h-16 mb-3 sm:mb-4 lg:mb-6 opacity-40" />
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-indigo-200 mb-1">Meu Cofrinho</p>
            <h4 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 lg:mb-8">
              {selectedChild.points} <span className="text-base sm:text-lg lg:text-xl opacity-60 font-medium">pts</span>
            </h4>
            <div className="bg-white/10 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl backdrop-blur-md">
              <div className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2">
                <span>Progresso do Dia</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all" style={{width: `${progressPercent}%`}} />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-slate-100 dark:border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-emerald-500">
                {selectedChild.tasks.filter(t => t.completed).length}
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Completas</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-slate-100 dark:border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-slate-600 dark:text-slate-300">
                {selectedChild.tasks.filter(t => !t.completed).length}
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Modal */}
      {showStore && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl lg:rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 lg:p-10 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black dark:text-white">Catálogo de Prêmios</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-base">
                  Você tem <span className="text-indigo-600">{selectedChild.points}</span> pontos disponíveis.
                </p>
              </div>
              <button
                onClick={() => setShowStore(false)}
                className="p-2 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/30 transition"
              >
                <X size={20} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 lg:p-10 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {rewards.map(reward => (
                  <div
                    key={reward.id}
                    className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex gap-3 sm:gap-4 lg:gap-6 items-center group transition-all hover:scale-[1.02]"
                  >
                    <div className="text-3xl sm:text-4xl lg:text-5xl flex-shrink-0">{reward.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg lg:text-xl font-black dark:text-white truncate">{reward.title}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-bold mb-2 sm:mb-3 lg:mb-4 line-clamp-2">{reward.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs sm:text-sm font-black flex items-center gap-1 ${
                          selectedChild.points >= reward.cost ? 'text-indigo-600' : 'text-rose-400'
                        }`}>
                          <Coins size={12} className="sm:w-[14px] sm:h-[14px]" /> {reward.cost} pts
                        </span>
                        <button
                          disabled={selectedChild.points < reward.cost}
                          onClick={() => onRedeemReward(selectedChild.id, reward.id)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-all ${
                            selectedChild.points >= reward.cost
                              ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Resgatar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {rewards.length === 0 && (
                <div className="text-center py-12 opacity-50">
                  <ShoppingBag size={48} className="mx-auto mb-3 text-slate-300" />
                  <p className="font-bold text-slate-400">Nenhuma recompensa disponível ainda.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 lg:p-8 bg-amber-50 dark:bg-amber-900/20 text-center">
              <p className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-wider sm:tracking-widest">
                Prêmios acima de 1000 pontos precisam ser aprovados pelos pais!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidsPortal;
