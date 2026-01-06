
import React, { useEffect, useState } from 'react';
import { Tv, ShieldCheck, Clock, Calendar, Star, Bell, CheckCircle2, Circle, Quote } from 'lucide-react';
import { Child } from '../types';
import { DAILY_ACTIVITIES, MOTIVATIONAL_QUOTES } from '../constants';

interface TVModeProps {
  children: Child[];
}

const TVMode: React.FC<TVModeProps> = ({ children }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    
    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  return (
    <div className="h-screen bg-slate-950 text-white overflow-hidden p-10 flex flex-col font-kids">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-6">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-lg shadow-indigo-900/40">
            <Tv size={48} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Portal Família HUD</h1>
            <p className="text-emerald-400 text-xl font-bold flex items-center gap-2">
              <ShieldCheck size={20} /> Sistema de Gestão Ativo
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-7xl font-black tracking-tighter tabular-nums leading-none mb-2">{time}</div>
          <div className="text-xl text-slate-500 font-bold flex items-center justify-end gap-2">
            <Calendar size={20} /> {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1">
        
        {/* Left Section: Children Status */}
        <div className="col-span-8 grid grid-cols-2 gap-8">
          {children.map(child => {
            const completed = child.tasks.filter(t => t.completed).length;
            const total = child.tasks.length;
            const percent = Math.round((completed / total) * 100);
            
            return (
              <div key={child.id} className="bg-slate-900/60 border border-slate-800 rounded-[3.5rem] p-8 flex flex-col shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <img src={child.avatar} className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-xl" alt="" />
                    {percent === 100 && (
                      <div className="absolute -top-2 -right-2 bg-emerald-500 p-1.5 rounded-full ring-4 ring-slate-900">
                        <Star size={16} fill="white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">{child.name}</h2>
                    <span className={`text-sm font-black uppercase tracking-widest ${percent === 100 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {percent === 100 ? 'Qualidade Total' : `${percent}% do Dia`}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  {child.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3">
                      {task.completed ? (
                        <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={24} className="text-slate-700 shrink-0" />
                      )}
                      <span className={`text-lg font-bold truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden shadow-inner p-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${percent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Section: Alerts and Motivation */}
        <div className="col-span-4 flex flex-col gap-8">
          
          {/* Daily Reminders Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-[3.5rem] p-8 flex flex-col shadow-2xl">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-amber-400">
              <Bell size={28} /> Agenda da Família
            </h3>
            
            <div className="space-y-6">
              {DAILY_ACTIVITIES.length > 0 ? (
                DAILY_ACTIVITIES.map((act, i) => (
                  <div key={i} className="flex items-center gap-5 p-5 bg-slate-800/40 rounded-3xl border border-slate-700/50 group">
                    <div className="text-4xl group-hover:scale-110 transition-transform">{act.icon}</div>
                    <div>
                      <div className="text-amber-500 font-black text-sm tracking-widest mb-1">{act.time}</div>
                      <div className="text-xl font-bold text-slate-100">{act.title}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                   <Calendar size={64} className="mb-4" />
                   <p className="font-bold">Sem avisos programados</p>
                </div>
              )}
            </div>
          </div>

          {/* Motivational Phrase Section */}
          <div className="flex-1 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-500/20 rounded-[3.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <Quote className="absolute top-8 left-8 text-indigo-500/20" size={80} />
            <div className="relative z-10 animate-in fade-in duration-1000" key={quoteIndex}>
              <h4 className="text-slate-400 font-black text-sm uppercase tracking-[0.4em] mb-6">Mensagem do Dia</h4>
              <p className="text-2xl md:text-3xl font-medium italic text-slate-100 leading-relaxed px-4">
                "{MOTIVATIONAL_QUOTES[quoteIndex]}"
              </p>
            </div>
            <div className="absolute bottom-10 flex gap-2">
               {MOTIVATIONAL_QUOTES.map((_, i) => (
                 <div key={i} className={`h-1.5 rounded-full transition-all ${i === quoteIndex ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'}`} />
               ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 flex justify-center">
        <div className="bg-slate-900/80 px-8 py-3 rounded-full border border-slate-800 text-slate-500 font-bold text-lg flex items-center gap-4">
          <ShieldCheck className="text-indigo-500" />
          Prioridade Parental Ativa • Ambiente em Harmonia
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default TVMode;
