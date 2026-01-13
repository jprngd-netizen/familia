
import React, { useState } from 'react';
import {
  ArrowLeft, Zap, Clock, TrendingUp, Plus, Trash2,
  CheckCircle2, AlertTriangle, ShieldCheck, Lock, Unlock,
  Coins, Gift, History, Repeat, CalendarDays, Edit, Save,
  Flame, Trophy
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
  onDeleteTask?: (childId: string, taskId: string) => void;
  onDeleteChild?: (childId: string) => void;
}

// Helper to check if task deadline is approaching
const getDeadlineStatus = (task: Task): { status: 'ok' | 'warning' | 'urgent' | 'overdue'; message: string } | null => {
  if (task.completed || !task.schedule?.end) return null;

  const now = new Date();
  const [hours, minutes] = task.schedule.end.split(':').map(Number);
  const deadline = new Date();
  deadline.setHours(hours, minutes, 0, 0);

  const diffMs = deadline.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 0) {
    return { status: 'overdue', message: 'Atrasado!' };
  } else if (diffMins <= 15) {
    return { status: 'urgent', message: `${diffMins} min restantes` };
  } else if (diffMins <= 60) {
    return { status: 'warning', message: `${diffMins} min restantes` };
  }
  return null;
};

const ChildDetailView: React.FC<ChildDetailViewProps> = ({
  child, onBack, onAdjustPoints, onToggleTask, onUnlock, onAddTask, onUpdateTask, onDeleteTask, onDeleteChild
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
      case 'daily': return 'Diario';
      case 'weekdays': return 'Seg-Sex';
      case 'weekends': return 'Fim de Semana';
      case 'weekly': return 'Semanal';
      default: return 'Uma vez';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={onBack} className="p-2 hover:bg-theme-cardHover rounded-full transition text-gray-400">
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <img src={child.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-theme-border shadow-md" alt="" />
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Gestao: {child.name}</h2>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">Configuracoes individuais e metricas</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => onDeleteChild && onDeleteChild(child.id)}
            className="flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 bg-theme-danger/20 text-theme-danger hover:bg-theme-danger/30 transition-all border border-theme-danger/30 text-sm sm:text-base"
          >
            <Trash2 size={16} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Excluir Perfil</span><span className="sm:hidden">Excluir</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${isAdding ? 'bg-theme-cardHover text-gray-400 border border-theme-border' : 'bg-theme-primary text-theme-dark shadow-lg shadow-theme-primary/20 hover:bg-theme-secondary'}`}
          >
            {isAdding ? 'Cancelar' : <><Plus size={16} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Nova Missao</span><span className="sm:hidden">Nova</span></>}
          </button>
        </div>
      </header>

      {isAdding && (
        <div className="bg-theme-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] border-2 border-theme-primary/30 shadow-xl animate-in zoom-in duration-300">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <Zap className="text-theme-primary" size={20} /> Configurar Nova Missao
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="sm:col-span-2 xl:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">O que deve ser feito?</label>
              <input
                type="text"
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                placeholder="Ex: Arrumar a mochila escolar"
                className="w-full bg-theme-dark border border-theme-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none focus:border-theme-primary transition text-white text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Recompensa (Pontos)</label>
              <input
                type="number"
                value={newTask.points}
                onChange={e => setNewTask({...newTask, points: parseInt(e.target.value)})}
                className="w-full bg-theme-dark border border-theme-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none focus:border-theme-primary transition text-white text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Frequencia</label>
              <select
                value={newTask.recurrence}
                onChange={e => setNewTask({...newTask, recurrence: e.target.value as any})}
                className="w-full bg-theme-dark border border-theme-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none appearance-none cursor-pointer text-white text-sm sm:text-base"
              >
                <option value="none">Uma vez</option>
                <option value="daily">Todos os dias (Diario)</option>
                <option value="weekdays">Segunda a Sexta</option>
                <option value="weekends">Fim de Semana</option>
                <option value="weekly">Uma vez por semana</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Horario Inicio (Opcional)</label>
              <input
                type="time"
                value={newTask.startTime}
                onChange={e => setNewTask({...newTask, startTime: e.target.value})}
                className="w-full bg-theme-dark border border-theme-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none text-white text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Horario Limite (Prazo)</label>
              <input
                type="time"
                value={newTask.endTime}
                onChange={e => setNewTask({...newTask, endTime: e.target.value})}
                className="w-full bg-theme-dark border border-theme-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none text-white text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="mt-6 sm:mt-8 flex justify-end">
            <button
              onClick={handleAddTaskSubmit}
              className="w-full sm:w-auto bg-theme-primary text-theme-dark px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-lg hover:bg-theme-secondary transition active:scale-95 uppercase tracking-widest text-xs sm:text-sm"
            >
              Confirmar Missao
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Status cards - horizontal on mobile/tablet, vertical on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4 sm:gap-6">
          <div className="bg-theme-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-theme-border">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">Status de Acesso</h3>
            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 flex flex-col items-center justify-center text-center border-2 transition-all ${child.unlockedHours > 0 ? 'bg-theme-success/10 border-theme-success/30' : 'bg-theme-danger/10 border-theme-danger/30'}`}>
              <div className={`p-3 sm:p-4 rounded-full mb-3 sm:mb-4 ${child.unlockedHours > 0 ? 'bg-theme-success text-white' : 'bg-theme-danger text-white'}`}>
                {child.unlockedHours > 0 ? <Unlock size={24} className="sm:w-8 sm:h-8" /> : <Lock size={24} className="sm:w-8 sm:h-8" />}
              </div>
              <p className={`text-lg sm:text-2xl font-black ${child.unlockedHours > 0 ? 'text-theme-success' : 'text-theme-danger'}`}>
                {child.unlockedHours > 0 ? `${child.unlockedHours}h Liberadas` : 'Bloqueado'}
              </p>
              <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">Controle de Firewall</p>
            </div>

            <button
              onClick={() => onUnlock(child.id)}
              className="w-full bg-theme-primary text-theme-dark py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-theme-secondary shadow-lg shadow-theme-primary/20 transition active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Zap size={16} className="sm:w-[18px] sm:h-[18px]" /> +1h de Desbloqueio
            </button>
          </div>

          <div className="bg-gradient-to-br from-theme-dark to-theme-darker p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] text-white shadow-xl border border-theme-border">
             <div className="flex justify-between items-start mb-4 sm:mb-6">
                <Coins size={24} className="sm:w-8 sm:h-8 text-theme-primary" />
                <span className="bg-theme-primary/10 border border-theme-primary/20 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-theme-primary">Cofrinho</span>
             </div>
             <p className="text-xs sm:text-sm font-bold text-gray-400 mb-1">Saldo Atual</p>
             <h4 className="text-2xl sm:text-4xl font-black mb-4 sm:mb-6">{child.points} <span className="text-sm sm:text-lg font-medium opacity-60">pts</span></h4>
             <div className="p-3 sm:p-4 bg-theme-card rounded-xl sm:rounded-2xl border border-theme-border">
                <p className="text-[10px] sm:text-xs font-medium text-gray-400">Equivalente:</p>
                <p className="text-lg sm:text-xl font-bold text-theme-primary">{(child.points / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
             </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] text-white shadow-xl border border-orange-500/30">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <Flame size={24} className="sm:w-8 sm:h-8 text-orange-400" />
              <span className="bg-orange-500/20 border border-orange-500/30 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-orange-400">Sequencia</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-orange-300 mb-1">Dias Consecutivos</p>
            <h4 className="text-2xl sm:text-4xl font-black mb-4 sm:mb-6">
              {child.currentStreak || 0} <span className="text-sm sm:text-lg font-medium opacity-60">dias</span>
            </h4>
            <div className="p-3 sm:p-4 bg-theme-card rounded-xl sm:rounded-2xl border border-orange-500/20 flex items-center gap-3">
              <Trophy size={18} className="sm:w-5 sm:h-5 text-amber-400" />
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-orange-300">Recorde:</p>
                <p className="text-base sm:text-lg font-bold text-orange-400">{child.longestStreak || 0} dias</p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          <div className="bg-theme-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-theme-border">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Rotina Ativa</h3>
                  <p className="text-xs text-gray-500">Progresso do dia: {progress}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">{completedTasks}/{totalTasks}</span>
                  <div className="w-24 sm:w-32 h-2 bg-theme-border rounded-full overflow-hidden">
                    <div className="bg-theme-primary h-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
             </div>

             <div className="space-y-3 sm:space-y-4">
                {child.tasks.map(task => (
                  <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all gap-3 ${task.completed ? 'bg-theme-dark/50 border-theme-border opacity-60' : 'bg-theme-dark border-theme-border hover:border-theme-primary/30 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleTask(child.id, task.id)}
                        className={`p-1 rounded-lg transition flex-shrink-0 ${task.completed ? 'text-theme-success' : 'text-gray-600 hover:text-theme-primary'}`}
                      >
                        <CheckCircle2 size={28} className="sm:w-8 sm:h-8" fill={task.completed ? 'currentColor' : 'none'} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm sm:text-base font-bold truncate ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</p>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                          {task.recurrence && task.recurrence !== 'none' && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-theme-primary bg-theme-primary/10 px-2 py-0.5 rounded-full">
                              <Repeat size={10} /> {getRecurrenceLabel(task.recurrence)}
                            </span>
                          )}
                          {task.schedule?.end && !task.completed && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-500 bg-theme-border px-2 py-0.5 rounded-full">
                              <Clock size={10} /> ate {task.schedule.end}
                            </span>
                          )}
                          {(() => {
                            const deadline = getDeadlineStatus(task);
                            if (!deadline) return null;
                            const colors: Record<string, string> = {
                              overdue: 'text-theme-danger bg-theme-danger/20 animate-pulse',
                              urgent: 'text-theme-danger bg-theme-danger/20',
                              warning: 'text-theme-secondary bg-theme-secondary/20'
                            };
                            return (
                              <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${colors[deadline.status]}`}>
                                <AlertTriangle size={10} /> {deadline.message}
                              </span>
                            );
                          })()}
                          {task.points === 0 && !task.completed && (
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-theme-secondary bg-theme-secondary/20 px-2 py-0.5 rounded-full">
                              <AlertTriangle size={10} /> Sem Pontos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
                      {editingTaskId === task.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editPoints}
                            onChange={e => setEditPoints(parseInt(e.target.value))}
                            className="w-16 sm:w-20 bg-theme-dark border border-theme-border rounded-lg px-2 py-1 font-bold text-theme-primary text-sm"
                          />
                          <button onClick={savePoints} className="text-theme-success hover:bg-theme-success/20 p-1 rounded-lg transition">
                            <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className={`text-xs sm:text-sm font-black ${task.points === 0 ? 'text-theme-secondary animate-pulse' : 'text-theme-primary'}`}>
                            {task.points > 0 ? `+${task.points}` : 'Definir'}
                          </span>
                          <button onClick={() => startEditingPoints(task)} className="text-gray-600 hover:text-theme-primary transition p-1">
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => onDeleteTask && onDeleteTask(child.id, task.id)}
                        className="text-gray-600 hover:text-theme-danger transition p-1"
                      >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  </div>
                ))}

                {child.tasks.length === 0 && (
                  <div className="py-8 sm:py-12 text-center opacity-30">
                    <CalendarDays size={40} className="sm:w-12 sm:h-12 mx-auto mb-2 text-gray-600" />
                    <p className="font-bold text-sm sm:text-base text-gray-500">Nenhuma missao configurada.</p>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-theme-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-theme-border">
             <h3 className="font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base">
                <History size={16} className="sm:w-[18px] sm:h-[18px] text-gray-500" /> Atividades Recentes
             </h3>
             <div className="space-y-3 sm:space-y-4">
                {[
                  { time: '14:30', action: 'Dever de casa concluido', type: 'success' },
                  { time: '12:00', action: 'Almoco validado pelos pais', type: 'info' },
                  { time: '08:15', action: 'Arrumar a cama concluido', type: 'success' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-theme-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">{item.action}</p>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hoje • {item.time}</p>
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
