
import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus,
  Globe, Mail, Clock, MapPin, Users, Info,
  CheckCircle2, AlertCircle, ExternalLink, RefreshCw, X, Cake
} from 'lucide-react';
import { Child, CalendarEvent } from '../types';
import apiService from '../services/apiService'; // Import the apiService

interface CalendarViewProps {
  children: Child[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New event form state
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id' | 'source'>>({
    title: '',
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    category: 'Escola',
    attendees: []
  });

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEvents = await apiService.calendar.getEvents();
      setEvents(fetchedEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events. Please try again.');
    }
    setIsLoading(false);
  };

  const handleAuthenticate = () => {
    // Open the authentication URL - uses same origin as the app
    window.open('/api/calendar/auth', '_blank');
  };
  
  const handleSync = async () => {
    setIsSyncing(true);
    await fetchEvents();
    setIsSyncing(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const totalDays = getDaysInMonth(currentMonth);

  // Generate birthday events from children
  const birthdayEvents = useMemo((): CalendarEvent[] => {
    const currentYear = currentMonth.getFullYear();
    return children
      .filter(child => child.birthday)
      .map(child => {
        // Parse birthday string (YYYY-MM-DD) to avoid timezone issues
        const [year, month, day] = child.birthday.split('-').map(Number);
        const birthdayThisYear = new Date(currentYear, month - 1, day, 12, 0, 0); // noon to avoid timezone shifts
        return {
          id: `birthday-${child.id}-${currentYear}`,
          title: `🎂 Aniversário: ${child.name}`,
          start: birthdayThisYear.toISOString(),
          end: birthdayThisYear.toISOString(),
          category: 'Aniversário' as const,
          attendees: [child.id],
          source: 'birthday' as const
        };
      });
  }, [children, currentMonth]);

  // Combine regular events with birthday events
  const allEvents = useMemo(() => {
    return [...events, ...birthdayEvents];
  }, [events, birthdayEvents]);

  // Filtra eventos para o dia selecionado
  const dayEvents = useMemo(() => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [allEvents, selectedDate]);

  const handleAddEvent = async () => {
    if (!newEvent.title) return;
    // Note: The backend doesn't support adding events yet.
    // This will be a local add for now.
    const event: CalendarEvent = {
      ...newEvent,
      id: Math.random().toString(),
      source: 'local'
    };
    setEvents(prev => [...prev, event]);
    setShowAddModal(false);
    setNewEvent({
      title: '',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      category: 'Escola',
      attendees: []
    });
  };

  const toggleAttendee = (childId: string) => {
    setNewEvent(prev => ({
      ...prev,
      attendees: prev.attendees.includes(childId)
        ? prev.attendees.filter(id => id !== childId)
        : [...prev.attendees, childId]
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Agenda Familiar</h2>
          <p className="text-slate-500 font-medium">Sincronize compromissos e planeje a harmonia da casa</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAuthenticate}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:shadow-lg transition-all active:scale-95"
          >
            <Globe className="text-blue-500" size={18} />
            <span>Connect Google Calendar</span>
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`text-green-500 ${isSyncing ? 'animate-spin' : ''}`} size={18} />
            <span>Sync Now</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendário Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white capitalize">
                  {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                {isLoading && <RefreshCw size={18} className="text-indigo-500 animate-spin" />}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square opacity-0"></div>
              ))}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
                
                const hasEvents = allEvents.some(e => {
                  const d = new Date(e.start);
                  return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
                });
                
                return (
                  <button 
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-1 transition-all relative border-2 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : isToday
                          ? 'border-indigo-100 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-lg">{day}</span>
                    {hasEvents && (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white flex flex-col sm:flex-row items-center justify-between shadow-xl gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-indigo-600 p-4 rounded-3xl shrink-0">
                <Info size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold">Agenda Hoje</h4>
                <p className="text-indigo-300 text-sm">
                  {dayEvents.length === 0 
                    ? 'Nenhum compromisso marcado para este dia.' 
                    : `Você tem ${dayEvents.length} compromisso(s) para o dia selecionado.`}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-white text-indigo-900 px-6 py-3 rounded-2xl font-bold text-sm transition hover:bg-indigo-50 shrink-0 w-full sm:w-auto"
            >
              Adicionar Evento
            </button>
          </div>
        </div>

        {/* Detalhes do Dia Selecionado */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-slate-400 font-medium">Eventos do dia</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl hover:bg-indigo-100 transition"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {dayEvents.map(event => (
                <div key={event.id} className="group relative animate-in slide-in-from-right-4">
                  <div className={`p-6 rounded-[2rem] border-l-8 transition-all hover:shadow-md ${
                    event.category === 'Aniversário' ? 'border-pink-400 bg-pink-50/20 dark:bg-pink-900/20' :
                    event.category === 'Escola' ? 'border-amber-400 bg-amber-50/20' :
                    event.category === 'Médico' ? 'border-rose-400 bg-rose-50/20' :
                    'border-indigo-400 bg-indigo-50/20'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1">
                        {event.category === 'Aniversário' && <Cake size={12} />}
                        {event.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {event.source === 'google' && <Globe size={12} className="text-blue-500" />}
                        {event.source === 'microsoft' && <Mail size={12} className="text-sky-500" />}
                        {event.source === 'birthday' && <Cake size={12} className="text-pink-500" />}
                        {event.source !== 'birthday' && (
                          <button
                            onClick={() => setEvents(prev => prev.filter(e => e.id !== event.id))}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-4">{event.title}</h4>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Clock size={14} />
                        {new Date(event.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(event.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {event.attendees.map(id => {
                            const c = children.find(child => child.id === id);
                            return (
                              <img key={id} src={c?.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900" title={c?.name} alt="" />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {dayEvents.length === 0 && !isLoading && (
                <div className="py-20 text-center opacity-30 flex flex-col items-center justify-center h-full">
                  <CalendarIcon size={48} className="mb-4" />
                  <p className="font-bold">Nada planejado para hoje.</p>
                  <p className="text-xs mt-1">Aproveite o tempo em família!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Evento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Novo Compromisso</h3>
            <div className="space-y-6 mb-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Título do Evento</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500" 
                  placeholder="Ex: Treino de Futebol" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Início</label>
                  <input 
                    type="time" 
                    onChange={e => {
                      const [h, m] = e.target.value.split(':');
                      const date = new Date(selectedDate);
                      date.setHours(parseInt(h), parseInt(m));
                      setNewEvent({...newEvent, start: date.toISOString()});
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Fim</label>
                  <input 
                    type="time" 
                    onChange={e => {
                      const [h, m] = e.target.value.split(':');
                      const date = new Date(selectedDate);
                      date.setHours(parseInt(h), parseInt(m));
                      setNewEvent({...newEvent, end: date.toISOString()});
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Categoria</label>
                <select 
                  value={newEvent.category}
                  onChange={e => setNewEvent({...newEvent, category: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none"
                >
                  <option value="Escola">Escola</option>
                  <option value="Médico">Médico</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Extra">Extra</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Participantes</label>
                <div className="flex gap-2 flex-wrap">
                  {children.map(child => (
                    <button 
                      key={child.id}
                      onClick={() => toggleAttendee(child.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                        newEvent.attendees.includes(child.id)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-100 dark:border-slate-800 bg-transparent text-slate-400'
                      }`}
                    >
                      <img src={child.avatar} className="w-6 h-6 rounded-full" alt="" />
                      <span className="text-xs font-bold">{child.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddEvent}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition uppercase tracking-widest text-sm"
              >
                Salvar Evento
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-full py-2 text-slate-400 font-bold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
