
import React, { useState } from 'react';
import { Shield, KeyRound, Eye, LogIn, X, ChevronRight } from 'lucide-react';
import { Child } from '../types';

interface LoginViewProps {
  children: Child[];
  onLogin: (member: Child, readOnly: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ children, onLogin }) => {
  const [selectedProfile, setSelectedProfile] = useState<Child | null>(null);
  const [mode, setMode] = useState<'selection' | 'pin'>('selection');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleProfileClick = (child: Child) => {
    setSelectedProfile(child);
    setMode('pin');
    setPin('');
    setError(false);
  };

  const handlePinClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const verifyPin = (currentPin: string) => {
    if (selectedProfile && currentPin === selectedProfile.pin) {
      onLogin(selectedProfile, false);
    } else {
      setError(true);
      setTimeout(() => setPin(''), 1000);
    }
  };

  const handleQuickView = (child: Child) => {
    onLogin(child, true);
  };

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-6 font-kids overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full mb-6 border border-white/10">
            <Shield className="text-emerald-400" size={24} />
            <span className="text-white font-black tracking-widest uppercase text-sm">Residência Protegida</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4">Portal Família</h1>
          <p className="text-indigo-200 text-xl font-medium">Selecione seu perfil para continuar</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {children.map((child) => (
            <div key={child.id} className="group relative">
               <button
                onClick={() => handleProfileClick(child)}
                className="w-full bg-white/5 border border-white/10 rounded-[3rem] p-6 transition-all hover:bg-white/10 hover:border-indigo-400/50 hover:-translate-y-2 flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <img src={child.avatar} className="w-24 h-24 rounded-full border-4 border-white/10 shadow-2xl" alt="" />
                  <div className={`absolute -bottom-1 -right-1 p-2 rounded-full border-2 border-indigo-950 shadow-lg ${child.role === 'Adulto' ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                    <KeyRound size={14} className="text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{child.name}</p>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{child.role}</p>
                </div>
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); handleQuickView(child); }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-white text-indigo-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-xl hover:scale-105"
              >
                Ver Status
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PIN Modal */}
      {mode === 'pin' && selectedProfile && (
        <div className="fixed inset-0 bg-indigo-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] p-12 max-w-sm w-full shadow-2xl text-center relative">
            <button 
              onClick={() => setMode('selection')}
              className="absolute top-8 right-8 text-slate-400 hover:bg-slate-100 p-2 rounded-full transition"
            >
              <X size={28} />
            </button>

            <img src={selectedProfile.avatar} className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-xl mx-auto mb-6" alt="" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">Olá, {selectedProfile.name}!</h2>
            <p className="text-slate-400 font-bold text-sm mb-10">Digite seu PIN de 4 dígitos</p>

            <div className="flex justify-center gap-4 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                    pin.length > i ? (error ? 'bg-rose-500 border-rose-500 scale-125' : 'bg-indigo-600 border-indigo-600 scale-125') : 'border-slate-200'
                  }`} 
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((val, i) => (
                <button
                  key={i}
                  disabled={val === ''}
                  onClick={() => val === '⌫' ? setPin(pin.slice(0, -1)) : handlePinClick(val)}
                  className={`h-16 rounded-2xl flex items-center justify-center text-2xl font-black transition active:scale-90 ${
                    val === '' ? 'opacity-0' : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            {error && <p className="text-rose-500 font-bold mt-6 animate-bounce">PIN Incorreto!</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;
