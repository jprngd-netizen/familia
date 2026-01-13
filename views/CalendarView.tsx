
import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus,
  Globe, Mail, Clock, MapPin, Users, Info,
  CheckCircle2, AlertCircle, ExternalLink, RefreshCw, X, Cake
} from 'lucide-react';
import { Child, CalendarEvent } from '../types';
import apiService from '../services/apiService';

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

  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id' | 'source'>>({
    title: '',
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    category: 'Escola',
    attendees: []
  });

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

  const birthdayEvents = useMemo((): CalendarEvent[] => {
    const currentYear = currentMonth.getFullYear();
    return children
      .filter(child => child.birthday)
      .map(child => {
        const [year, month, day] = child.birthday.split('-').map(Number);
        const birthdayThisYear = new Date(currentYear, month - 1, day, 12, 0, 0);
        return {
          id: `birthday-${child.id}-${currentYear}`,
          title: `🎂 Aniversario: ${child.name}`,
          start: birthdayThisYear.toISOString(),
          end: birthdayThisYear.toISOString(),
          category: 'Aniversario' as const,
          attendees: [child.id],
          source: 'birthday' as const
        };
      });
  }, [children, currentMonth]);

  const allEvents = useMemo(() => {
    return [...events, ...birthdayEvents];
  }, [events, birthdayEvents]);

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Agenda Familiar</h2>
          <p className="text-gray-400 font-medium text-sm sm:text-base">Sincronize compromissos e planeje a harmonia da casa</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleAuthenticate}
            className="flex items-center justify-center gap-2 bg-norton-card border border-norton-border px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-norton-cardHover transition-all active:scale-95 text-gray-300"
          >
            <Globe className="text-blue-400" size={18} />
            <span className="hidden sm:inline">Connect Google Calendar</span>
            <span className="sm:hidden">Google Calendar</span>
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 bg-norton-card border border-norton-border px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-norton-cardHover transition-all active:scale-95 disabled:opacity-50 text-gray-300"
          >
            <RefreshCw className={`text-norton-success ${isSyncing ? 'animate-spin' : ''}`} size={18} />
            <span>Sincronizar</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-norton-danger/20 border-l-4 border-norton-danger text-norton-danger p-4 rounded-md text-sm" role="alert">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-norton-card rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-sm border border-norton-border">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white capitalize">
                  {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                {isLoading && <RefreshCw size={16} className="text-norton-yellow animate-spin" />}
              </div>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 sm:p-3 hover:bg-norton-cardHover rounded-xl sm:rounded-2xl text-gray-400 transition"
                >
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 sm:p-3 hover:bg-norton-cardHover rounded-xl sm:rounded-2xl text-gray-400 transition"
                >
                  <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4 mb-2 sm:mb-4">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-center text-[9px] sm:text-[10px] font-black uppercase text-gray-500 tracking-widest">
                  <span className="sm:hidden">{day}</span>
                  <span className="hidden sm:inline">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][i]}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4">
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
                    className={`aspect-square rounded-xl sm:rounded-2xl lg:rounded-3xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all relative border-2 text-sm sm:text-base lg:text-lg ${
                      isSelected
                        ? 'border-norton-yellow bg-norton-yellow text-norton-dark shadow-lg shadow-norton-yellow/20'
                        : isToday
                          ? 'border-norton-yellow/30 bg-norton-yellow/10 text-norton-yellow'
                          : 'border-transparent hover:bg-norton-cardHover text-gray-400'
                    }`}
                  >
                    <span className="font-bold">{day}</span>
                    {hasEvents && (
                      <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isSelected ? 'bg-norton-dark' : 'bg-norton-yellow'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Event Banner */}
          <div className="bg-gradient-to-br from-norton-dark to-norton-darker p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-xl gap-4 border border-norton-border">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="bg-norton-yellow/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shrink-0 hidden sm:block border border-norton-yellow/20">
                <Info size={24} className="sm:w-8 sm:h-8 text-norton-yellow" />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold">Agenda do Dia</h4>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {dayEvents.length === 0
                    ? 'Nenhum compromisso marcado.'
                    : `${dayEvents.length} compromisso(s) para o dia.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-norton-yellow text-norton-dark px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm transition hover:bg-norton-gold w-full sm:w-auto"
            >
              Adicionar Evento
            </button>
          </div>
        </div>

        {/* Day Events Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-norton-card rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-sm border border-norton-border flex flex-col min-h-[400px] lg:min-h-[500px]">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Eventos do dia</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="p-2 bg-norton-yellow/10 border border-norton-yellow/20 text-norton-yellow rounded-xl hover:bg-norton-yellow/20 transition"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto max-h-[400px] lg:max-h-[500px] pr-1">
              {dayEvents.map(event => (
                <div key={event.id} className="group relative animate-in slide-in-from-right-4">
                  <div className={`p-4 sm:p-5 rounded-xl sm:rounded-[1.5rem] border-l-4 sm:border-l-8 transition-all hover:bg-norton-cardHover ${
                    event.category === 'Aniversario' ? 'border-pink-400 bg-pink-500/10' :
                    event.category === 'Escola' ? 'border-norton-yellow bg-norton-yellow/10' :
                    event.category === 'Medico' ? 'border-norton-danger bg-norton-danger/10' :
                    'border-norton-yellow bg-norton-yellow/10'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                        {event.category === 'Aniversario' && <Cake size={10} className="sm:w-3 sm:h-3" />}
                        {event.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {event.source === 'google' && <Globe size={10} className="sm:w-3 sm:h-3 text-blue-400" />}
                        {event.source === 'birthday' && <Cake size={10} className="sm:w-3 sm:h-3 text-pink-400" />}
                        {event.source !== 'birthday' && (
                          <button
                            onClick={() => setEvents(prev => prev.filter(e => e.id !== event.id))}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-norton-danger transition"
                          >
                            <X size={12} className="sm:w-[14px] sm:h-[14px]" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-bold text-white mb-2 sm:mb-3 text-sm sm:text-base">{event.title}</h4>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-gray-500">
                        <Clock size={12} className="sm:w-[14px] sm:h-[14px]" />
                        {new Date(event.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(event.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {event.attendees.map(id => {
                            const c = children.find(child => child.id === id);
                            return (
                              <img key={id} src={c?.avatar} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-norton-card" title={c?.name} alt="" />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {dayEvents.length === 0 && !isLoading && (
                <div className="py-12 sm:py-16 text-center opacity-30 flex flex-col items-center justify-center h-full">
                  <CalendarIcon size={36} className="sm:w-12 sm:h-12 mb-3 sm:mb-4 text-gray-600" />
                  <p className="font-bold text-sm sm:text-base text-gray-500">Nada planejado.</p>
                  <p className="text-[10px] sm:text-xs mt-1 text-gray-600">Aproveite o tempo em familia!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-norton-darker/95 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-norton-card border border-norton-border rounded-t-3xl sm:rounded-[3rem] p-6 sm:p-10 w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Novo Compromisso</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-norton-cardHover rounded-xl transition sm:hidden">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Titulo do Evento</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-norton-dark border border-norton-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none focus:border-norton-yellow text-white text-sm sm:text-base"
                  placeholder="Ex: Treino de Futebol"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Inicio</label>
                  <input
                    type="time"
                    onChange={e => {
                      const [h, m] = e.target.value.split(':');
                      const date = new Date(selectedDate);
                      date.setHours(parseInt(h), parseInt(m));
                      setNewEvent({...newEvent, start: date.toISOString()});
                    }}
                    className="w-full bg-norton-dark border border-norton-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none text-white text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Fim</label>
                  <input
                    type="time"
                    onChange={e => {
                      const [h, m] = e.target.value.split(':');
                      const date = new Date(selectedDate);
                      date.setHours(parseInt(h), parseInt(m));
                      setNewEvent({...newEvent, end: date.toISOString()});
                    }}
                    className="w-full bg-norton-dark border border-norton-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none text-white text-sm sm:text-base"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Categoria</label>
                <select
                  value={newEvent.category}
                  onChange={e => setNewEvent({...newEvent, category: e.target.value as any})}
                  className="w-full bg-norton-dark border border-norton-border rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none text-white text-sm sm:text-base"
                >
                  <option value="Escola">Escola</option>
                  <option value="Medico">Medico</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Extra">Extra</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Participantes</label>
                <div className="flex gap-2 flex-wrap">
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => toggleAttendee(child.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-xs sm:text-sm ${
                        newEvent.attendees.includes(child.id)
                          ? 'border-norton-yellow bg-norton-yellow/10 text-norton-yellow'
                          : 'border-norton-border bg-transparent text-gray-500'
                      }`}
                    >
                      <img src={child.avatar} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" alt="" />
                      <span className="font-bold">{child.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddEvent}
                className="w-full py-3 sm:py-4 bg-norton-yellow text-norton-dark font-black rounded-xl sm:rounded-2xl shadow-xl hover:bg-norton-gold transition uppercase tracking-widest text-xs sm:text-sm"
              >
                Salvar Evento
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full py-2 text-gray-500 font-bold hidden sm:block"
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
