
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Tv, ShieldCheck, Clock, Calendar, Star, Bell, CheckCircle2, Circle, Quote,
  Trophy, Maximize, Minimize, PartyPopper, Cake, Crown, Medal
} from 'lucide-react';
import { Child } from '../types';
import { DAILY_ACTIVITIES, MOTIVATIONAL_QUOTES } from '../constants';
import { calendarAPI } from '../services/apiService';

interface TVModeProps {
  children: Child[];
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

const TVMode: React.FC<TVModeProps> = ({ children }) => {
  const [time, setTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScreenSaver, setIsScreenSaver] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter only children (not adults) for display
  const childrenOnly = children.filter(c => c.role === 'Criança');

  // Check for birthdays
  const today = new Date();
  const birthdayChildren = childrenOnly.filter(child => {
    if (!child.birthday) return false;
    const bday = new Date(child.birthday);
    return bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate();
  });
  const hasBirthday = birthdayChildren.length > 0;

  // Generate confetti for birthday
  useEffect(() => {
    if (hasBirthday) {
      const pieces: ConfettiPiece[] = [];
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 5,
          duration: 3 + Math.random() * 2
        });
      }
      setConfetti(pieces);
    }
  }, [hasBirthday]);

  // Time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  // Fetch calendar events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await calendarAPI.getEvents();
        setCalendarEvents(events || []);
      } catch (error) {
        console.log('Calendar not configured or error fetching events');
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Screen saver - dim after 2 minutes of inactivity
  const resetInactivityTimer = useCallback(() => {
    setIsScreenSaver(false);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      setIsScreenSaver(true);
    }, 120000); // 2 minutes
  }, []);

  useEffect(() => {
    resetInactivityTimer();
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetInactivityTimer));
    return () => {
      events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcut for fullscreen (F11 or F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F' || e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  // Calculate countdown for next activity
  const getNextActivity = () => {
    const now = time;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const activity of DAILY_ACTIVITIES) {
      const [hours, minutes] = activity.time.split(':').map(Number);
      const activityMinutes = hours * 60 + minutes;

      if (activityMinutes > currentMinutes) {
        const diff = activityMinutes - currentMinutes;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return { activity, countdown: h > 0 ? `${h}h ${m}m` : `${m}m` };
      }
    }
    return null;
  };

  const nextActivity = getNextActivity();

  // Points leaderboard - sort children by points
  const leaderboard = [...childrenOnly].sort((a, b) => b.points - a.points);

  const formattedTime = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div
      ref={containerRef}
      className={`h-screen bg-slate-950 text-white overflow-hidden p-8 flex flex-col font-kids transition-all duration-1000 ${
        isScreenSaver ? 'opacity-30 cursor-none' : 'opacity-100'
      } ${isFullscreen ? 'cursor-none' : ''}`}
      style={{ cursor: isFullscreen ? 'none' : 'default' }}
    >
      {/* Confetti for birthdays */}
      {hasBirthday && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {confetti.map(piece => (
            <div
              key={piece.id}
              className="absolute w-3 h-3 rounded-sm animate-confetti"
              style={{
                left: `${piece.x}%`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Birthday Banner */}
      {hasBirthday && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 py-4 px-8 flex items-center justify-center gap-4 z-40 animate-pulse">
          <Cake size={32} className="text-yellow-300" />
          <span className="text-2xl font-black">
            🎉 Feliz Aniversário, {birthdayChildren.map(c => c.name).join(' e ')}! 🎉
          </span>
          <PartyPopper size={32} className="text-yellow-300" />
        </div>
      )}

      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className={`absolute top-4 right-4 p-3 bg-slate-800/50 rounded-full hover:bg-slate-700 transition-all z-50 ${
          isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      {/* Top Header Bar */}
      <div className={`flex justify-between items-center mb-8 ${hasBirthday ? 'mt-16' : ''}`}>
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-3xl shadow-lg ${hasBirthday ? 'bg-gradient-to-br from-pink-500 to-purple-600 animate-bounce' : 'bg-indigo-600 shadow-indigo-900/40'}`}>
            {hasBirthday ? <PartyPopper size={48} className="text-white" /> : <Tv size={48} className="text-white" />}
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {hasBirthday ? '🎂 Dia Especial! 🎂' : 'Portal Família HUD'}
            </h1>
            <p className="text-emerald-400 text-xl font-bold flex items-center gap-2">
              <ShieldCheck size={20} /> Sistema de Gestão Ativo
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-7xl font-black tracking-tighter tabular-nums leading-none mb-2">{formattedTime}</div>
          <div className="text-xl text-slate-500 font-bold flex items-center justify-end gap-2">
            <Calendar size={20} /> {formattedDate}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">

        {/* Left Section: Children Status */}
        <div className="col-span-5 grid grid-rows-2 gap-6">
          {childrenOnly.slice(0, 2).map((child, index) => {
            const completed = child.tasks.filter(t => t.completed).length;
            const total = child.tasks.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isBirthday = birthdayChildren.some(b => b.id === child.id);
            const isLeader = leaderboard[0]?.id === child.id;

            return (
              <div
                key={child.id}
                className={`bg-slate-900/60 border rounded-[2.5rem] p-6 flex flex-col shadow-2xl relative overflow-hidden ${
                  isBirthday ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-slate-800'
                }`}
              >
                {isBirthday && (
                  <div className="absolute top-3 right-3">
                    <Cake size={24} className="text-pink-400 animate-bounce" />
                  </div>
                )}
                {isLeader && !isBirthday && (
                  <div className="absolute top-3 right-3">
                    <Crown size={24} className="text-yellow-400" />
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={child.avatar}
                      className={`w-16 h-16 rounded-full border-4 shadow-xl object-cover ${
                        isBirthday ? 'border-pink-500' : 'border-slate-800'
                      }`}
                      alt=""
                    />
                    {percent === 100 && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 p-1 rounded-full ring-2 ring-slate-900">
                        <Star size={12} fill="white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black">{child.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">{child.points.toLocaleString()} pts</span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${percent === 100 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {percent === 100 ? '✓ Completo' : `${percent}%`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {child.tasks.slice(0, 4).map(task => (
                    <div key={task.id} className="flex items-center gap-2">
                      {task.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-slate-700 shrink-0" />
                      )}
                      <span className={`text-sm font-medium truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        percent === 100 ? 'bg-emerald-500' : isBirthday ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle Section: Leaderboard & Next Activity */}
        <div className="col-span-3 flex flex-col gap-6">

          {/* Points Leaderboard */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-6 flex-1">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-yellow-400">
              <Trophy size={24} /> Ranking Semanal
            </h3>
            <div className="space-y-3">
              {leaderboard.map((child, index) => (
                <div
                  key={child.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl ${
                    index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-slate-800/40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-slate-400 text-black' :
                    'bg-amber-700 text-white'
                  }`}>
                    {index === 0 ? <Crown size={16} /> : index + 1}
                  </div>
                  <img src={child.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div className="flex-1">
                    <div className="font-bold text-sm">{child.name}</div>
                    <div className="text-yellow-400 text-xs font-bold">{child.points.toLocaleString()} pts</div>
                  </div>
                  {index === 0 && <Medal size={20} className="text-yellow-400" />}
                </div>
              ))}
            </div>
          </div>

          {/* Next Activity Countdown */}
          {nextActivity && (
            <div className="bg-gradient-to-br from-amber-900/40 to-slate-900/60 border border-amber-500/20 rounded-[2.5rem] p-6">
              <h3 className="text-lg font-black mb-3 flex items-center gap-2 text-amber-400">
                <Clock size={20} /> Próxima Atividade
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{nextActivity.activity.icon}</div>
                <div>
                  <div className="text-xl font-bold text-white">{nextActivity.activity.title}</div>
                  <div className="text-amber-400 font-black text-2xl">{nextActivity.countdown}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Schedule & Calendar */}
        <div className="col-span-4 flex flex-col gap-6">

          {/* Daily Schedule */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-6">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-amber-400">
              <Bell size={24} /> Agenda do Dia
            </h3>
            <div className="space-y-3">
              {DAILY_ACTIVITIES.map((act, i) => {
                const [hours, minutes] = act.time.split(':').map(Number);
                const activityTime = hours * 60 + minutes;
                const currentTime = time.getHours() * 60 + time.getMinutes();
                const isPast = currentTime > activityTime;
                const isNow = Math.abs(currentTime - activityTime) < 30;

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      isNow ? 'bg-amber-500/20 border-amber-500/50 animate-pulse' :
                      isPast ? 'bg-slate-800/20 border-slate-700/30 opacity-50' :
                      'bg-slate-800/40 border-slate-700/50'
                    }`}
                  >
                    <div className="text-3xl">{act.icon}</div>
                    <div className="flex-1">
                      <div className={`font-bold ${isPast ? 'text-slate-500' : 'text-slate-100'}`}>{act.title}</div>
                      <div className={`text-sm font-bold ${isNow ? 'text-amber-400' : 'text-slate-500'}`}>{act.time}</div>
                    </div>
                    {isPast && <CheckCircle2 size={20} className="text-emerald-500" />}
                    {isNow && <Clock size={20} className="text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Google Calendar Events */}
          {calendarEvents.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-6 flex-1">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-blue-400">
                <Calendar size={24} /> Google Calendar
              </h3>
              <div className="space-y-3">
                {calendarEvents.slice(0, 4).map((event) => {
                  const eventTime = event.start.dateTime
                    ? new Date(event.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : 'Dia todo';
                  return (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-2xl">
                      <div className="w-2 h-10 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-100 truncate">{event.summary}</div>
                        <div className="text-blue-400 text-xs font-bold">{eventTime}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Motivational Quote (if no calendar) */}
          {calendarEvents.length === 0 && (
            <div className="flex-1 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-500/20 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <Quote className="absolute top-4 left-4 text-indigo-500/20" size={60} />
              <div className="relative z-10" key={quoteIndex}>
                <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] mb-4">Mensagem do Dia</h4>
                <p className="text-xl font-medium italic text-slate-100 leading-relaxed">
                  "{MOTIVATIONAL_QUOTES[quoteIndex]}"
                </p>
              </div>
              <div className="absolute bottom-4 flex gap-1.5">
                {MOTIVATIONAL_QUOTES.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === quoteIndex ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700'}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-center">
        <div className="bg-slate-900/80 px-6 py-2 rounded-full border border-slate-800 text-slate-500 font-bold text-sm flex items-center gap-3">
          <ShieldCheck className="text-indigo-500" size={18} />
          {hasBirthday ? '🎉 Modo Festa Ativo' : 'Prioridade Parental Ativa'}
          <span className="text-slate-600">•</span>
          <span className="text-xs">Pressione F para tela cheia</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Screen saver overlay */}
      {isScreenSaver && (
        <div
          className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center cursor-none"
          onClick={resetInactivityTimer}
        >
          <div className="text-center animate-pulse">
            <div className="text-8xl font-black mb-4">{formattedTime}</div>
            <div className="text-2xl text-slate-500">Mova o mouse para continuar</div>
          </div>
        </div>
      )}

      {/* Confetti animation styles */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TVMode;
