
import React, { useState } from 'react';
import { Shield, KeyRound, Eye, LogIn, X, ChevronRight, UserPlus } from 'lucide-react';
import { Child } from '../types';
import API from '../services/apiService';

interface LoginViewProps {
  children: Child[];
  onLogin: (member: Child, readOnly: boolean) => void;
  onSetupComplete: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ children, onLogin, onSetupComplete }) => {
  const [selectedProfile, setSelectedProfile] = useState<Child | null>(null);
  const [mode, setMode] = useState<'selection' | 'pin' | 'setup'>('selection');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  const showSetup = children.length === 0;

  const handleSetup = async () => {
    if (!setupName.trim()) {
      setSetupError('Digite seu nome');
      return;
    }
    if (setupPin.length !== 4) {
      setSetupError('PIN deve ter 4 dígitos');
      return;
    }
    if (setupPin !== setupConfirmPin) {
      setSetupError('PINs não conferem');
      return;
    }

    setSetupLoading(true);
    setSetupError('');

    try {
      await API.auth.setup(setupName.trim(), setupPin);
      onSetupComplete();
    } catch (err: any) {
      setSetupError(err.message || 'Erro ao criar perfil');
    } finally {
      setSetupLoading(false);
    }
  };

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

  // Setup screen - Norton Style
  if (showSetup) {
    return (
      <div className="min-h-screen bg-theme-darker flex items-center justify-center p-4 sm:p-6 font-kids overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 sm:w-64 h-32 sm:h-64 bg-theme-primary rounded-full blur-[100px] sm:blur-[150px]" />
          <div className="absolute bottom-10 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-theme-secondary rounded-full blur-[120px] sm:blur-[180px]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-theme-primary/10 border border-theme-primary/30 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6">
              <Shield className="text-theme-primary" size={20} />
              <span className="text-theme-primary font-black tracking-widest uppercase text-xs sm:text-sm">Configuração Inicial</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-3 sm:mb-4">Portal Família</h1>
            <p className="text-gray-400 text-base sm:text-lg font-medium">Crie seu perfil de administrador</p>
          </div>

          <div className="bg-theme-card border border-theme-border rounded-2xl sm:rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-theme-primary/10 border border-theme-primary/20 rounded-xl">
                <UserPlus className="text-theme-primary" size={24} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Primeiro Acesso</h2>
                <p className="text-gray-500 text-sm">Configure o administrador da família</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm font-bold block mb-2">Seu Nome</label>
                <input
                  type="text"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder="Ex: João"
                  className="w-full bg-theme-dark border border-theme-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-theme-primary transition"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm font-bold block mb-2">PIN (4 dígitos)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={setupPin}
                  onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-theme-dark border border-theme-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-theme-primary text-center text-2xl tracking-[0.5em] transition"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm font-bold block mb-2">Confirmar PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={setupConfirmPin}
                  onChange={(e) => setSetupConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-theme-dark border border-theme-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-theme-primary text-center text-2xl tracking-[0.5em] transition"
                />
              </div>

              {setupError && (
                <p className="text-theme-danger text-sm font-bold text-center">{setupError}</p>
              )}

              <button
                onClick={handleSetup}
                disabled={setupLoading}
                className="w-full bg-theme-primary hover:bg-theme-secondary disabled:opacity-50 text-theme-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-theme-primary/20"
              >
                {setupLoading ? 'Criando...' : 'Criar Perfil de Admin'}
                {!setupLoading && <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-darker flex items-center justify-center p-4 sm:p-6 font-kids overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-15 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 sm:w-64 h-32 sm:h-64 bg-theme-primary rounded-full blur-[100px] sm:blur-[150px]" />
        <div className="absolute bottom-10 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-theme-secondary rounded-full blur-[120px] sm:blur-[180px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-theme-primary/10 border border-theme-primary/30 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6">
            <Shield className="text-theme-primary" size={20} />
            <span className="text-theme-primary font-black tracking-widest uppercase text-xs sm:text-sm">Proteção Familiar</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-3 sm:mb-4">Portal Família</h1>
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl font-medium">Selecione seu perfil para continuar</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {children.map((child) => (
            <div key={child.id} className="group relative">
              <button
                onClick={() => handleProfileClick(child)}
                className="w-full bg-theme-card border border-theme-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all hover:bg-theme-cardHover hover:border-theme-primary/50 hover:-translate-y-2 flex flex-col items-center gap-3 sm:gap-4"
              >
                <div className="relative">
                  <img src={child.avatar} className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-2 sm:border-4 border-theme-border shadow-2xl" alt="" />
                  <div className={`absolute -bottom-1 -right-1 p-1.5 sm:p-2 rounded-full border-2 border-theme-dark shadow-lg ${child.role === 'Adulto' ? 'bg-theme-primary' : 'bg-gray-600'}`}>
                    <KeyRound size={12} className={`sm:w-[14px] sm:h-[14px] ${child.role === 'Adulto' ? 'text-theme-dark' : 'text-white'}`} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-base sm:text-lg lg:text-xl">{child.name}</p>
                  <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${child.role === 'Adulto' ? 'text-theme-primary' : 'text-gray-500'}`}>{child.role}</p>
                </div>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleQuickView(child); }}
                className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-theme-primary text-theme-dark px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase shadow-xl hover:scale-105"
              >
                Ver Status
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PIN Modal - Norton Style */}
      {mode === 'pin' && selectedProfile && (
        <div className="fixed inset-0 bg-theme-darker/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-theme-card border border-theme-border rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 lg:p-12 max-w-sm w-full shadow-2xl text-center relative">
            <button
              onClick={() => setMode('selection')}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 text-gray-500 hover:text-white hover:bg-theme-cardHover p-2 rounded-full transition"
            >
              <X size={24} className="sm:w-7 sm:h-7" />
            </button>

            <img src={selectedProfile.avatar} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-theme-primary/30 shadow-xl mx-auto mb-4 sm:mb-6" alt="" />
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Olá, {selectedProfile.name}!</h2>
            <p className="text-gray-500 font-bold text-xs sm:text-sm mb-6 sm:mb-10">Digite seu PIN de 4 dígitos</p>

            <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all duration-300 ${
                    pin.length > i ? (error ? 'bg-theme-danger border-theme-danger scale-125' : 'bg-theme-primary border-theme-primary scale-125') : 'border-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((val, i) => (
                <button
                  key={i}
                  disabled={val === ''}
                  onClick={() => val === '⌫' ? setPin(pin.slice(0, -1)) : handlePinClick(val)}
                  className={`h-12 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold transition active:scale-90 ${
                    val === '' ? 'opacity-0' : 'bg-theme-dark border border-theme-border text-white hover:bg-theme-cardHover hover:border-theme-primary/50'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            {error && <p className="text-theme-danger font-bold mt-4 sm:mt-6 animate-bounce text-sm sm:text-base">PIN Incorreto!</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;
