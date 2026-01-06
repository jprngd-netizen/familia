
import React, { useState } from 'react';
import { 
  ArrowLeft, Zap, Clock, TrendingUp, Plus, Trash2, 
  CheckCircle2, AlertTriangle, ShieldCheck, Lock, Unlock,
  Coins, Gift, History, Repeat, CalendarDays, Edit, Save
} from 'lucide-react';
import { Child, Task } from '../types';

interface ChildDetailViewProps {
  child: Child;
  onBack: () => void;
  onAdjustPoints: (childId: string, amount: number, reason: string) => void;
  onToggleTask: (childId: string, taskId: string) => void;
  onUnlock: (childId: string) => void;
  onAddTask?: (childId: string, task: Omit<Task, 'id' | 'completed'>) => void;
  onUpdateTask?: (childId: string, taskId: string, updates: Partial<Task>) => void;
  // Fix: Added missing onDeleteChild property to the interface as it is being passed from App.tsx
  onDeleteChild?: (childId: string) => void;
}

const ChildDetailView: React.FC<ChildDetailViewProps> = ({ 
  child, onBack, onAdjustPoints, onToggleTask, onUnlock, onAddTask, onUpdateTask, onDeleteChild 
}) => {
  const [newTask, setNewTask] = useState<{
    title: string;
    points: number;
    category: Task['category'];
    recurrence: Task['recurrence'];
    startTime: string;
    endTime: string;
  }>({
    title: '',
    points: 200,
    category: 'Chores',
    recurrence: 'daily',
    startTime: '',
    endTime: ''
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState<number>(0);

  const completedTasks = child.tasks.filter(t => t.completed).length;
  const totalTasks = child.tasks.length;
  const progress = Math.round((completedTasks / totalTasks) * 100) || 0;

  const handleAddTaskSubmit = () => {
    if (!newTask.title || !onAddTask) return;
    onAddTask(child.id, {
      title: newTask.title,
      points: newTask.points,
      category: newTask.category,
      recurrence: newTask.recurrence,
      schedule: newTask.startTime || newTask.endTime ? { start: newTask.startTime, end: newTask.endTime } : undefined
    });
    setNewTask({ title: '', points: 200, category: 'Chores', recurrence: 'daily', startTime: '', endTime: '' });
    setIsAdding(false);
  };

  const startEditingPoints = (task: Task) => {
    setEditingTaskId(task.id);
    setEditPoints(task.points);
  };

  const savePoints = () => {
    if (editingTaskId && onUpdateTask) {
      onUpdateTask(child.id, editingTaskId, { points: editPoints });
      setEditingTaskId(null);
    }
  };

  const getRecurrenceLabel = (rec: Task['recurrence']) => {
    switch(rec) {
      case 'daily': return 'Diário';
      case 'weekdays': return 'Seg-Sex';
      case 'weekends': return 'Fim de Semana';
      case 'weekly': return 'Semanal';
      default: return 'Uma vez';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-4">
            <img src={child.avatar} className="w-16 h-16 rounded-2xl border-4 border-white shadow-md" alt="" />
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Gestão: {child.name}</h2>
              <p className="text-slate-500 text-sm font-medium">Configurações individuais e métricas</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          {/* Fix: Integrated the profile deletion action provided by the parent component */}
          <button 
            onClick={() => onDeleteChild && onDeleteChild(child.id)}
            className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border border-rose-100"
          >
            <Trash2 size={20} /> Excluir Perfil
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${isAdding ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'}`}
          >
            {isAdding ? 'Cancelar' : <><Plus size={20} /> Nova Missão</>}
          </button>
        </div>
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-xl animate-in zoom-in duration-300">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Zap className="text-amber-500" /> Configurar Nova Missão Inteligente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">O que deve ser feito?</label>
              <input 
                type="text" 
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                placeholder="Ex: Arrumar a mochila escolar" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Recompensa (Pontos)</label>
              <input 
                type="number" 
                value={newTask.points}
                onChange={e => setNewTask({...newTask, points: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Frequência</label>
              <select 
                value={newTask.recurrence}
                onChange={e => setNewTask({...newTask, recurrence: e.target.value as any})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none appearance-none cursor-pointer"
              >
                <option value="none">Uma vez</option>
                <option value="daily">Todos os dias (Diário)</option>
                <option value="weekdays">Segunda a Sexta</option>
                <option value="weekends">Fim de Semana</option>
                <option value="weekly">Uma vez por semana</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Horário Início (Opcional)</label>
              <input 
                type="time" 
                value={newTask.startTime}
                onChange={e => setNewTask({...newTask, startTime: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Horário Limite (Prazo)</label>
              <input 
                type="time" 
                value={newTask.endTime}
                onChange={e => setNewTask({...newTask, endTime: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleAddTaskSubmit}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition active:scale-95 uppercase tracking-widest text-sm"
            >
              Confirmar Missão
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Status de Acesso</h3>
            <div className={`p-6 rounded-3xl mb-6 flex flex-col items-center justify-center text-center border-2 transition-all ${child.unlockedHours > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className={`p-4 rounded-full mb-4 ${child.unlockedHours > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {child.unlockedHours > 0 ? <Unlock size={32} /> : <Lock size={32} />}
              </div>
              <p className={`text-2xl font-black ${child.unlockedHours > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {child.unlockedHours > 0 ? `${child.unlockedHours}h Liberadas` : 'Acesso Bloqueado'}
              </p>
              <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">Controle de Firewall</p>
            </div>
            
            <button 
              onClick={() => onUnlock(child.id)}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap size={18} /> +1h de Desbloqueio
            </button>
          </div>

          <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl">
             <div className="flex justify-between items-start mb-6">
                <Coins size={32} className="text-indigo-300" />
                <span className="bg-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Cofrinho Ativo</span>
             </div>
             <p className="text-sm font-bold text-indigo-300 mb-1">Saldo Atual</p>
             <h4 className="text-4xl font-black mb-6">{child.points} <span className="text-lg font-medium opacity-60">pts</span></h4>
             <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-xs font-medium text-indigo-100">Equivalente financeiro:</p>
                <p className="text-xl font-bold">{(child.points / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Rotina Ativa</h3>
                  <p className="text-xs text-slate-400">Progresso do dia: {progress}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{completedTasks}/{totalTasks}</span>
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
             </div>

             <div className="space-y-4">
                {child.tasks.map(task => (
                  <div key={task.id} className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <button 
                        onClick={() => onToggleTask(child.id, task.id)}
                        className={`p-1 rounded-lg transition ${task.completed ? 'text-emerald-500' : 'text-slate-200 hover:text-indigo-500'}`}
                      >
                        <CheckCircle2 size={32} fill={task.completed ? 'currentColor' : 'none'} />
                      </button>
                      <div>
                        <p className={`text-base font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {task.recurrence && task.recurrence !== 'none' && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                              <Repeat size={10} /> {getRecurrenceLabel(task.recurrence)}
                            </span>
                          )}
                          {task.points === 0 && !task.completed && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              <AlertTriangle size={10} /> Sem Pontos Atribuídos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {editingTaskId === task.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={editPoints}
                            onChange={e => setEditPoints(parseInt(e.target.value))}
                            className="w-20 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 font-bold text-indigo-600 text-sm"
                          />
                          <button onClick={savePoints} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded-lg transition">
                            <Save size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${task.points === 0 ? 'text-amber-500 animate-pulse' : 'text-indigo-600'}`}>
                            {task.points > 0 ? `+${task.points}` : 'Definir'}
                          </span>
                          <button onClick={() => startEditingPoints(task)} className="text-slate-300 hover:text-indigo-500 transition p-1">
                            <Edit size={16} />
                          </button>
                        </div>
                      )}
                      <button className="text-slate-200 hover:text-rose-500 transition p-1"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                
                {child.tasks.length === 0 && (
                  <div className="py-12 text-center opacity-30">
                    <CalendarDays size={48} className="mx-auto mb-2" />
                    <p className="font-bold">Nenhuma missão configurada.</p>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <History size={18} className="text-slate-400" /> Atividades Recentes
             </h3>
             <div className="space-y-4">
                {[
                  { time: '14:30', action: 'Dever de casa concluído', type: 'success' },
                  { time: '12:00', action: 'Almoço validado pelos pais', type: 'info' },
                  { time: '08:15', action: 'Arrumar a cama concluído', type: 'success' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-200" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{item.action}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoje • {item.time}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDetailView;
