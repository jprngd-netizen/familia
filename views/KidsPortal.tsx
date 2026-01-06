
import React, { useState } from 'react';
/* Added missing 'X' icon to the imports from lucide-react */
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
    <div className="min-h-screen bg-indigo-50/50 dark:bg-slate-950 p-8 font-kids pb-24 relative overflow-y-auto">
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            {isReadOnly ? `Monitorando: ${selectedChild.name}` : `Boa jornada, ${selectedChild.name}! ✨`}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Você tem {selectedChild.points} pontos para usar.</p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => setShowStore(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition active:scale-95 uppercase tracking-widest text-sm"
          >
            <ShoppingBag size={24} /> Ir para a Loja
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3 dark:text-white"><Zap className="text-amber-500" /> Missões de Hoje</h3>
              <div className="space-y-4">
                 {selectedChild.tasks.map(task => (
                   <button 
                    key={task.id}
                    disabled={isReadOnly}
                    onClick={() => onToggleTask(selectedChild.id, task.id)}
                    className={`w-full flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all active:scale-95 group ${task.completed ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 hover:border-indigo-200'}`}
                   >
                      <div className="flex items-center gap-5">
                         {task.completed ? <CheckCircle2 size={40} className="text-emerald-500" /> : <Circle size={40} className="text-slate-200 dark:text-slate-700" />}
                         <div className="text-left">
                            <p className={`text-2xl font-black ${task.completed ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-50' : 'text-slate-700 dark:text-white'}`}>{task.title}</p>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{task.category}</span>
                         </div>
                      </div>
                      <div className={`px-5 py-2 rounded-2xl font-black text-xl ${task.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                         +{task.points}
                      </div>
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-10 text-white shadow-2xl">
              <PiggyBank size={64} className="mb-6 opacity-40" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">Meu Cofrinho</p>
              <h4 className="text-5xl font-black mb-8">{selectedChild.points} <span className="text-xl opacity-60 font-medium">pts</span></h4>
              <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>Progresso do Dia</span>
                    <span>{progressPercent}%</span>
                 </div>
                 <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white" style={{width: `${progressPercent}%`}} />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Mini Loja Modal */}
      {showStore && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-10 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                 <div>
                    <h3 className="text-3xl font-black dark:text-white">Catálogo de Prêmios</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Você tem {selectedChild.points} pontos disponíveis.</p>
                 </div>
                 <button onClick={() => setShowStore(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-rose-100 transition"><X size={32} /></button>
              </div>
              <div className="p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                 {rewards.map(reward => (
                   <div key={reward.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex gap-6 items-center group transition-all hover:scale-[1.02]">
                      <div className="text-5xl">{reward.icon}</div>
                      <div className="flex-1">
                         <h4 className="text-xl font-black dark:text-white">{reward.title}</h4>
                         <p className="text-xs text-slate-400 font-bold mb-4">{reward.description}</p>
                         <div className="flex items-center justify-between">
                            <span className={`text-sm font-black flex items-center gap-1 ${selectedChild.points >= reward.cost ? 'text-indigo-600' : 'text-rose-400'}`}>
                               <Coins size={14} /> {reward.cost} pts
                            </span>
                            <button 
                              disabled={selectedChild.points < reward.cost}
                              onClick={() => onRedeemReward(selectedChild.id, reward.id)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedChild.points >= reward.cost ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                            >
                               Resgatar
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-8 bg-amber-50 dark:bg-amber-900/20 text-center">
                 <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Atenção: Prêmios acima de 1000 pontos precisam ser aprovados pelos pais!</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KidsPortal;
