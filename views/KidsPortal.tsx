
import React, { useState } from 'react';
import {
  CheckCircle2, Circle, Trophy, Zap, ShoppingBag, PiggyBank, Heart, Repeat, Plus, Coins, X, Shield
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
    <div className="min-h-screen bg-norton-darker p-4 sm:p-6 lg:p-8 font-kids pb-24 relative overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 lg:mb-12 gap-4 sm:gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-white mb-1 sm:mb-2 tracking-tight">
            {isReadOnly ? `Monitorando: ${selectedChild.name}` : `Boa jornada, ${selectedChild.name}!`}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg font-medium">
            Voce tem <span className="text-norton-yellow font-bold">{selectedChild.points}</span> pontos para usar.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setShowStore(true)}
            className="w-full sm:w-auto bg-norton-yellow text-norton-dark px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold sm:font-black flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-norton-yellow/20 hover:bg-norton-gold transition active:scale-95 uppercase tracking-wider text-xs sm:text-sm"
          >
            <ShoppingBag size={18} className="sm:w-6 sm:h-6" /> Ir para a Loja
          </button>
        )}
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="bg-norton-card rounded-2xl sm:rounded-3xl lg:rounded-[3rem] p-4 sm:p-6 lg:p-10 shadow-sm border border-norton-border">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-black mb-4 sm:mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3 text-white">
              <Zap className="text-norton-yellow" size={20} /> Missoes de Hoje
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {selectedChild.tasks.map(task => (
                <button
                  key={task.id}
                  disabled={isReadOnly}
                  onClick={() => onToggleTask(selectedChild.id, task.id)}
                  className={`w-full flex items-center justify-between p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] border-2 transition-all active:scale-[0.98] group ${
                    task.completed
                      ? 'bg-norton-success/10 border-norton-success/30'
                      : 'bg-norton-dark border-norton-border hover:border-norton-yellow/50'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 min-w-0 flex-1">
                    {task.completed
                      ? <CheckCircle2 size={24} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-norton-success flex-shrink-0" />
                      : <Circle size={24} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-600 flex-shrink-0" />
                    }
                    <div className="text-left min-w-0">
                      <p className={`text-sm sm:text-base lg:text-2xl font-bold sm:font-black truncate ${
                        task.completed
                          ? 'text-norton-success line-through opacity-50'
                          : 'text-white'
                      }`}>
                        {task.title}
                      </p>
                      <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold sm:font-black text-sm sm:text-base lg:text-xl flex-shrink-0 ml-2 ${
                    task.completed
                      ? 'bg-norton-success text-white'
                      : 'bg-norton-dark border border-norton-border text-gray-400'
                  }`}>
                    +{task.points}
                  </div>
                </button>
              ))}

              {selectedChild.tasks.length === 0 && (
                <div className="text-center py-8 sm:py-12 opacity-50">
                  <Trophy size={32} className="sm:w-12 sm:h-12 mx-auto mb-2 text-gray-600" />
                  <p className="font-bold text-gray-500 text-sm sm:text-base">Nenhuma missao para hoje!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="bg-gradient-to-br from-norton-dark to-norton-darker rounded-2xl sm:rounded-3xl lg:rounded-[3rem] p-4 sm:p-6 lg:p-10 text-white shadow-xl border border-norton-border">
            <PiggyBank size={32} className="sm:w-12 sm:h-12 lg:w-16 lg:h-16 mb-3 sm:mb-4 lg:mb-6 text-norton-yellow opacity-40" />
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-norton-yellow mb-1">Meu Cofrinho</p>
            <h4 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 lg:mb-8">
              {selectedChild.points} <span className="text-base sm:text-lg lg:text-xl opacity-60 font-medium">pts</span>
            </h4>
            <div className="bg-norton-card p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border border-norton-border">
              <div className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2">
                <span className="text-gray-400">Progresso do Dia</span>
                <span className="text-norton-yellow">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 sm:h-3 bg-norton-border rounded-full overflow-hidden">
                <div className="h-full bg-norton-yellow transition-all" style={{width: `${progressPercent}%`}} />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-norton-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-norton-border">
              <p className="text-2xl sm:text-3xl font-black text-norton-success">
                {selectedChild.tasks.filter(t => t.completed).length}
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Completas</p>
            </div>
            <div className="bg-norton-card rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-norton-border">
              <p className="text-2xl sm:text-3xl font-black text-gray-400">
                {selectedChild.tasks.filter(t => !t.completed).length}
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Modal */}
      {showStore && (
        <div className="fixed inset-0 bg-norton-darker/95 backdrop-blur-md z-[200] flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-300">
          <div className="bg-norton-card border border-norton-border rounded-2xl sm:rounded-3xl lg:rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 lg:p-10 flex justify-between items-center border-b border-norton-border">
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">Catalogo de Premios</h3>
                <p className="text-gray-400 font-bold text-sm sm:text-base">
                  Voce tem <span className="text-norton-yellow">{selectedChild.points}</span> pontos disponiveis.
                </p>
              </div>
              <button
                onClick={() => setShowStore(false)}
                className="p-2 sm:p-3 bg-norton-dark border border-norton-border rounded-full hover:bg-norton-cardHover transition"
              >
                <X size={20} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 lg:p-10 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {rewards.map(reward => (
                  <div
                    key={reward.id}
                    className="bg-norton-dark p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] border border-norton-border flex gap-3 sm:gap-4 lg:gap-6 items-center group transition-all hover:border-norton-yellow/30 hover:scale-[1.02]"
                  >
                    <div className="text-3xl sm:text-4xl lg:text-5xl flex-shrink-0">{reward.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg lg:text-xl font-black text-white truncate">{reward.title}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-bold mb-2 sm:mb-3 lg:mb-4 line-clamp-2">{reward.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs sm:text-sm font-black flex items-center gap-1 ${
                          selectedChild.points >= reward.cost ? 'text-norton-yellow' : 'text-norton-danger'
                        }`}>
                          <Coins size={12} className="sm:w-[14px] sm:h-[14px]" /> {reward.cost} pts
                        </span>
                        <button
                          disabled={selectedChild.points < reward.cost}
                          onClick={() => onRedeemReward(selectedChild.id, reward.id)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-all ${
                            selectedChild.points >= reward.cost
                              ? 'bg-norton-yellow text-norton-dark shadow-lg shadow-norton-yellow/20 hover:bg-norton-gold'
                              : 'bg-norton-border text-gray-500 cursor-not-allowed'
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
                  <ShoppingBag size={48} className="mx-auto mb-3 text-gray-600" />
                  <p className="font-bold text-gray-500">Nenhuma recompensa disponivel ainda.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 lg:p-8 bg-norton-yellow/10 border-t border-norton-yellow/20 text-center">
              <p className="text-[9px] sm:text-[10px] font-black text-norton-yellow uppercase tracking-wider sm:tracking-widest">
                Premios acima de 1000 pontos precisam ser aprovados pelos pais!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidsPortal;
