
import React, { useState, useEffect } from 'react';
import {
  Users, Monitor, Settings, Plus, Edit2, Trash2, Moon, Sun, X,
  RefreshCw, Key, ShieldCheck, Send, Bell, Bot, Lock, Check,
  AlertCircle, MessageSquare, Smartphone, Zap, Calendar, ExternalLink,
  CheckCircle2, XCircle, Loader2, Shield, Globe
} from 'lucide-react';
import { Child, MemberRole, Device, DeviceType, SystemSettings, WhitelistDomain } from '../types';
import { calendarAPI, settingsAPI, devicesAPI } from '../services/apiService';

interface SettingsViewProps {
  children: Child[];
  devices: Device[];
  systemSettings: SystemSettings;
  onAddChild: (name: string, avatar: string, role: MemberRole, birthday: string, pin: string) => void;
  onUpdateChild: (child: Child) => void;
  onDeleteChild: (childId: string) => void;
  onAddDevice: (device: Omit<Device, 'id' | 'status' | 'ip'>) => void;
  onUpdateDevice: (device: Device) => void;
  onDeleteDevice: (deviceId: string) => void;
  onToggleDeviceBlock: (deviceId: string) => void;
  onToggleDeviceWhitelist?: (deviceId: string) => void;
  onUpdateSystemSettings: (settings: SystemSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  children, devices, systemSettings, onAddChild, onUpdateChild, onDeleteChild,
  onAddDevice, onUpdateDevice, onDeleteDevice, onToggleDeviceBlock, onToggleDeviceWhitelist, onUpdateSystemSettings
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'devices' | 'system'>('members');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinChallenge, setPinChallenge] = useState('');
  const [pinError, setPinError] = useState(false);

  // Estados locais para formulários de Preferências (Telegram/Notificações)
  const [localSettings, setLocalSettings] = useState<SystemSettings>(systemSettings);

  // Member Management State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Child | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberAvatar, setMemberAvatar] = useState('');
  const [memberRole, setMemberRole] = useState<MemberRole>('Criança');
  const [memberBirthday, setMemberBirthday] = useState('2010-01-01');
  const [memberPin, setMemberPin] = useState('');

  // Device Management State
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('smartphone');
  const [deviceMac, setDeviceMac] = useState('');
  const [deviceIsBlocked, setDeviceIsBlocked] = useState(false);
  const [deviceAssignedTo, setDeviceAssignedTo] = useState<string | null>(null);

  const roles: MemberRole[] = ['Criança', 'Adulto', 'Visitante', 'Empregado(a)', 'Outros'];

  // Google Calendar State
  const [calendarStatus, setCalendarStatus] = useState<{ configured: boolean; connected: boolean; loading: boolean }>({
    configured: false,
    connected: false,
    loading: true
  });

  // Telegram test state
  const [telegramTestStatus, setTelegramTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [telegramTestMessage, setTelegramTestMessage] = useState('');

  // Whitelist domains state
  const [whitelistDomains, setWhitelistDomains] = useState<WhitelistDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newDomainDesc, setNewDomainDesc] = useState('');
  const [domainLoading, setDomainLoading] = useState(false);

  // Fetch whitelist domains
  useEffect(() => {
    if (isUnlocked) {
      devicesAPI.getWhitelistDomains().then(setWhitelistDomains).catch(console.error);
    }
  }, [isUnlocked]);

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    setDomainLoading(true);
    try {
      const added = await devicesAPI.addWhitelistDomain(newDomain, newDomainDesc);
      setWhitelistDomains(prev => [...prev, added]);
      setNewDomain('');
      setNewDomainDesc('');
    } catch (error: any) {
      alert(error.message || 'Erro ao adicionar domínio');
    }
    setDomainLoading(false);
  };

  const handleDeleteDomain = async (id: string) => {
    try {
      await devicesAPI.deleteWhitelistDomain(id);
      setWhitelistDomains(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting domain:', error);
    }
  };

  // Fetch calendar status on mount
  useEffect(() => {
    const fetchCalendarStatus = async () => {
      try {
        const status = await calendarAPI.getStatus();
        setCalendarStatus({ ...status, loading: false });
      } catch (error) {
        setCalendarStatus({ configured: false, connected: false, loading: false });
      }
    };
    if (isUnlocked) {
      fetchCalendarStatus();
    }
  }, [isUnlocked]);

  const handleConnectCalendar = () => {
    // Open in same window - will redirect back after auth
    window.location.href = calendarAPI.getAuthUrl();
  };

  const handleDisconnectCalendar = async () => {
    try {
      await calendarAPI.disconnect();
      setCalendarStatus(prev => ({ ...prev, connected: false }));
    } catch (error) {
      console.error('Failed to disconnect calendar:', error);
    }
  };

  const handleSendTelegramTest = async () => {
    setTelegramTestStatus('loading');
    setTelegramTestMessage('');
    try {
      const result = await settingsAPI.sendTelegramTest();
      if (result.success) {
        setTelegramTestStatus('success');
        setTelegramTestMessage('Mensagem enviada! Verifique seu Telegram.');
      } else {
        setTelegramTestStatus('error');
        setTelegramTestMessage(result.error || 'Falha ao enviar mensagem');
      }
    } catch (error: any) {
      setTelegramTestStatus('error');
      setTelegramTestMessage(error.message || 'Erro de conexão');
    }
    // Reset status after 5 seconds
    setTimeout(() => {
      setTelegramTestStatus('idle');
      setTelegramTestMessage('');
    }, 5000);
  };

  // Verificar PIN de administrador
  const handlePinSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const isAdminPin = children.some(c => c.role === 'Adulto' && c.pin === pinChallenge);
    if (isAdminPin) {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinChallenge('');
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const handleSavePreferences = () => {
    onUpdateSystemSettings(localSettings);
    // Feedback visual opcional aqui
  };

  const handleToggleNotification = (key: keyof SystemSettings['notifications']) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleOpenAddMemberModal = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberAvatar(`https://picsum.photos/seed/${Math.random()}/200`);
    setMemberRole('Criança');
    setMemberBirthday('2010-01-01');
    setMemberPin('');
    setShowMemberModal(true);
  };

  const handleOpenEditMemberModal = (child: Child) => {
    setEditingMember(child);
    setMemberName(child.name);
    setMemberAvatar(child.avatar);
    setMemberRole(child.role);
    setMemberBirthday(child.birthday);
    setMemberPin(child.pin);
    setShowMemberModal(true);
  };

  const handleSaveMember = () => {
    if (!memberName.trim() || memberPin.length !== 4) return;
    if (editingMember) {
      onUpdateChild({ ...editingMember, name: memberName, avatar: memberAvatar, role: memberRole, birthday: memberBirthday, pin: memberPin });
    } else {
      onAddChild(memberName, memberAvatar, memberRole, memberBirthday, memberPin);
    }
    setShowMemberModal(false);
  };

  const handleOpenAddDeviceModal = () => {
    setEditingDevice(null);
    setDeviceName('');
    setDeviceType('smartphone');
    setDeviceMac('');
    setDeviceIsBlocked(false);
    setDeviceAssignedTo(null);
    setShowDeviceModal(true);
  };

  const handleOpenEditDeviceModal = (device: Device) => {
    setEditingDevice(device);
    setDeviceName(device.name);
    setDeviceType(device.type);
    setDeviceMac(device.mac);
    setDeviceIsBlocked(device.isBlocked);
    setDeviceAssignedTo(device.assignedTo || null);
    setShowDeviceModal(true);
  };

  const handleSaveDevice = () => {
    if (!deviceName.trim() || !deviceMac.trim()) return;
    if (editingDevice) {
      onUpdateDevice({ ...editingDevice, name: deviceName, type: deviceType, mac: deviceMac, isBlocked: deviceIsBlocked, assignedTo: deviceAssignedTo || undefined });
    } else {
      onAddDevice({ name: deviceName, type: deviceType, mac: deviceMac, isBlocked: deviceIsBlocked, assignedTo: deviceAssignedTo || undefined });
    }
    setShowDeviceModal(false);
  };

  const formatBirthdayDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className={`w-full max-w-md p-10 rounded-[3rem] shadow-2xl text-center ${systemSettings.theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2 dark:text-white">Acesso Restrito</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">Digite o PIN de um Adulto Administrador para gerenciar as configurações da família.</p>
          
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              <input 
                type="password" 
                maxLength={4}
                value={pinChallenge}
                onChange={e => setPinChallenge(e.target.value.replace(/\D/g, ''))}
                autoFocus
                placeholder="****"
                className={`w-40 text-center text-4xl font-black tracking-[0.5em] py-4 rounded-2xl outline-none border-2 transition-all ${
                  pinError ? 'border-rose-500 bg-rose-50 text-rose-600 animate-shake' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white focus:border-indigo-500'
                }`}
              />
            </div>
            {pinError && <p className="text-rose-500 text-xs font-black uppercase tracking-widest animate-bounce">PIN de administrador incorreto!</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition uppercase tracking-widest text-sm"
            >
              Desbloquear Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className={`text-4xl font-black tracking-tight ${systemSettings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Configurações</h2>
          <p className="text-slate-500 font-medium">Controle de infraestrutura e segurança da família.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">
          <ShieldCheck size={16} className="text-indigo-600" />
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Painel Desbloqueado</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-2">
          <button onClick={() => setActiveTab('members')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'members' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
            <Users size={20} /> Membros
          </button>
          <button onClick={() => setActiveTab('devices')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'devices' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
            <Monitor size={20} /> Dispositivos
          </button>
          <button onClick={() => setActiveTab('system')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'system' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
            <Settings size={20} /> Preferências
          </button>
        </aside>

        <div className="flex-1 space-y-6">
          {activeTab === 'members' && (
            <div className={`p-8 rounded-[3rem] border shadow-sm animate-in slide-in-from-right-4 duration-300 ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold dark:text-white">Controle de Perfis</h3>
                <button onClick={handleOpenAddMemberModal} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 transition shadow-sm border border-emerald-100"><Plus size={18} /> Novo Perfil</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children.map(child => (
                  <div key={child.id} className={`p-6 border rounded-[2rem] flex items-center justify-between group transition-all ${systemSettings.theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500' : 'bg-slate-50/30 border-slate-50 hover:border-indigo-200'}`}>
                    <div className="flex items-center gap-4">
                      <img src={child.avatar} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt="" />
                      <div>
                        <p className="font-bold dark:text-white">{child.name}</p>
                        <p className="text-[10px] font-black uppercase text-indigo-400">
                          {child.role} • {formatBirthdayDisplay(child.birthday)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => handleOpenEditMemberModal(child)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={18} /></button>
                      <button onClick={() => onDeleteChild(child.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Devices Section */}
              <div className={`p-8 rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold dark:text-white">Rede Familiar</h3>
                  <button onClick={handleOpenAddDeviceModal} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition shadow-sm border border-indigo-100"><Plus size={18} /> Adicionar Device</button>
                </div>
                <div className="space-y-4">
                  {devices.map(device => {
                    const assignedChild = children.find(c => c.id === device.assignedTo);
                    return (
                    <div key={device.id} className={`p-6 border rounded-[2rem] flex items-center justify-between transition-all group ${device.isWhitelisted ? 'border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-900/10' : systemSettings.theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500' : 'bg-slate-50/30 border-slate-50 hover:border-indigo-200'}`}>
                      <div className="flex items-center gap-5">
                         <div className={`p-4 rounded-2xl ${device.isWhitelisted ? 'bg-amber-100 text-amber-600' : device.isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {device.isWhitelisted ? <Shield size={24} /> : <Smartphone size={24} />}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold dark:text-white">{device.name}</p>
                              {device.isWhitelisted && (
                                <span className="text-[8px] font-black uppercase bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Lista Branca</span>
                              )}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{device.mac}</p>
                            {assignedChild && (
                              <p className="text-[10px] font-bold text-indigo-500 mt-1 flex items-center gap-1">
                                <Users size={10} /> {assignedChild.name}
                              </p>
                            )}
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!device.isWhitelisted && (
                          <button onClick={() => onToggleDeviceBlock(device.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${device.isBlocked ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {device.isBlocked ? 'Bloqueado' : 'Liberado'}
                          </button>
                        )}
                        <button
                          onClick={() => onToggleDeviceWhitelist?.(device.id)}
                          title={device.isWhitelisted ? 'Remover da lista branca' : 'Adicionar à lista branca (nunca bloquear)'}
                          className={`p-2 rounded-xl transition-all ${device.isWhitelisted ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                        >
                          <Shield size={18} />
                        </button>
                        <button onClick={() => handleOpenEditDeviceModal(device)} className="p-2 text-slate-400 hover:text-indigo-600 opacity-100 sm:opacity-0 group-hover:opacity-100 transition"><Edit2 size={18} /></button>
                        <button onClick={() => onDeleteDevice(device.id)} className="p-2 text-slate-400 hover:text-rose-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition"><Trash2 size={18} /></button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Domain Whitelist Section */}
              <div className={`p-8 rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-3"><Globe className="text-amber-500" /> Sites Sempre Permitidos</h3>
                    <p className="text-xs text-slate-500 mt-1">Estes sites ficam acessíveis mesmo quando o dispositivo está bloqueado</p>
                  </div>
                </div>

                {/* Add domain form */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={newDomain}
                    onChange={e => setNewDomain(e.target.value)}
                    placeholder="ex: escola.edu.br"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={newDomainDesc}
                    onChange={e => setNewDomainDesc(e.target.value)}
                    placeholder="Descrição (opcional)"
                    className="w-48 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleAddDomain}
                    disabled={domainLoading || !newDomain.trim()}
                    className="bg-amber-500 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {domainLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Adicionar
                  </button>
                </div>

                {/* Domain list */}
                <div className="space-y-2">
                  {whitelistDomains.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Nenhum site na lista branca. Adicione domínios acima.</p>
                  ) : (
                    whitelistDomains.map(domain => (
                      <div key={domain.id} className={`flex items-center justify-between p-4 rounded-xl ${systemSettings.theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                          <Globe size={18} className="text-amber-500" />
                          <div>
                            <p className="font-bold dark:text-white">{domain.domain}</p>
                            {domain.description && <p className="text-xs text-slate-400">{domain.description}</p>}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteDomain(domain.id)} className="p-2 text-slate-400 hover:text-rose-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <p className="text-[10px] text-slate-400 mt-4">
                  Exemplos: escola.edu.br, Khan Academy, Google Classroom, etc.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-20">
              {/* Tema Section */}
              <div className={`p-8 rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white"><Sun className="text-amber-500" /> Interface do Sistema</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => setLocalSettings({...localSettings, theme: 'light'})} className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${localSettings.theme === 'light' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className={`p-4 rounded-2xl ${localSettings.theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}`}><Sun size={24} /></div>
                    <div className="text-left">
                      <p className={`font-bold ${localSettings.theme === 'light' ? 'text-indigo-900' : 'text-slate-400'}`}>Modo Dia</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Padrão família</p>
                    </div>
                    {localSettings.theme === 'light' && <Check size={20} className="ml-auto text-indigo-600" />}
                  </button>
                  <button onClick={() => setLocalSettings({...localSettings, theme: 'dark'})} className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 ${localSettings.theme === 'dark' ? 'border-indigo-600 bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className={`p-4 rounded-2xl ${localSettings.theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}`}><Moon size={24} /></div>
                    <div className="text-left">
                      <p className={`font-bold ${localSettings.theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Modo Noite</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Proteção ocular</p>
                    </div>
                    {localSettings.theme === 'dark' && <Check size={20} className="ml-auto text-indigo-600" />}
                  </button>
                </div>
              </div>

              {/* Notificações Section */}
              <div className={`p-8 rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white"><Bell className="text-indigo-500" /> Eventos de Notificação</h3>
                <div className="space-y-4">
                  {[
                    { key: 'taskCompleted', label: 'Conclusão de Missões', desc: 'Alertar quando uma criança marcar uma tarefa como feita.' },
                    { key: 'rewardRedeemed', label: 'Resgate de Prêmios', desc: 'Avisar quando pontos forem trocados na loja.' },
                    { key: 'punishmentApplied', label: 'Aplicação de Punições', desc: 'Notificar quando uma regra for quebrada e punida.' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                       <div>
                         <p className="font-bold dark:text-white">{item.label}</p>
                         <p className="text-xs text-slate-500">{item.desc}</p>
                       </div>
                       <button 
                        onClick={() => handleToggleNotification(item.key as any)}
                        className={`w-12 h-6 rounded-full transition-all relative ${localSettings.notifications[item.key as keyof SystemSettings['notifications']] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                       >
                         <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localSettings.notifications[item.key as keyof SystemSettings['notifications']] ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Calendar Section */}
              <div className={`p-8 rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black flex items-center gap-3 dark:text-white"><Calendar className="text-blue-500" /> Google Calendar</h3>
                  {calendarStatus.loading ? (
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  ) : calendarStatus.connected ? (
                    <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                      <CheckCircle2 size={16} /> Conectado
                    </span>
                  ) : calendarStatus.configured ? (
                    <span className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                      <AlertCircle size={16} /> Não Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                      <XCircle size={16} /> Não Configurado
                    </span>
                  )}
                </div>

                {calendarStatus.connected ? (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-800">
                      <p className="font-bold text-emerald-900 dark:text-emerald-300 mb-2">Calendário Conectado!</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400/70">
                        Seus eventos do Google Calendar aparecerão automaticamente no Modo TV.
                      </p>
                    </div>
                    <button
                      onClick={handleDisconnectCalendar}
                      className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm hover:underline"
                    >
                      <XCircle size={16} /> Desconectar Google Calendar
                    </button>
                  </div>
                ) : calendarStatus.configured ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-800">
                      <p className="font-bold text-blue-900 dark:text-blue-300 mb-2">Pronto para Conectar</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400/70">
                        Clique no botão abaixo para autorizar o acesso ao seu Google Calendar.
                      </p>
                    </div>
                    <button
                      onClick={handleConnectCalendar}
                      className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition"
                    >
                      <Calendar size={20} /> Conectar Google Calendar <ExternalLink size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-800">
                      <p className="font-bold text-amber-900 dark:text-amber-300 mb-2">Configuração Necessária</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400/70 leading-relaxed">
                        Para usar o Google Calendar, adicione as credenciais OAuth no arquivo <code className="bg-amber-100 dark:bg-amber-800 px-2 py-0.5 rounded">backend/.env</code>:
                      </p>
                      <pre className="mt-4 text-xs bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto">
{`GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth2callback`}
                      </pre>
                    </div>
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline"
                    >
                      <ExternalLink size={16} /> Criar credenciais no Google Cloud Console
                    </a>
                  </div>
                )}
              </div>

              {/* Telegram Section */}
              <div className={`p-8 rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black flex items-center gap-3 dark:text-white"><Bot className="text-sky-500" /> Integração Telegram</h3>
                  <button
                    onClick={() => setLocalSettings({...localSettings, telegram: {...localSettings.telegram, enabled: !localSettings.telegram.enabled}})}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localSettings.telegram.enabled ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    {localSettings.telegram.enabled ? 'Integração Ativa' : 'Integração Inativa'}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Quick Setup Guide */}
                  <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 p-6 rounded-[2rem] border border-sky-100 dark:border-sky-800">
                    <p className="font-black text-sky-900 dark:text-sky-300 mb-4 flex items-center gap-2"><Zap size={18} /> Configuração Rápida</p>
                    <ol className="text-sm text-sky-800 dark:text-sky-300/80 space-y-3 list-decimal list-inside">
                      <li>Abra o Telegram e pesquise por <code className="bg-sky-100 dark:bg-sky-800 px-2 py-0.5 rounded font-bold">@BotFather</code></li>
                      <li>Envie <code className="bg-sky-100 dark:bg-sky-800 px-2 py-0.5 rounded font-bold">/newbot</code> e siga as instruções para criar seu bot</li>
                      <li>Copie o <strong>Token da API</strong> (formato: <code className="text-xs">123456789:ABCdef...</code>)</li>
                      <li>Crie um grupo no Telegram e adicione o bot como membro</li>
                      <li>Adicione o bot <code className="bg-sky-100 dark:bg-sky-800 px-2 py-0.5 rounded font-bold">@userinfobot</code> ao grupo e ele mostrará o <strong>Chat ID</strong></li>
                      <li>Cole as informações abaixo, ative a integração e clique em <strong>Salvar</strong></li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Bot API Token</label>
                      <input
                        type="text"
                        value={localSettings.telegram.botToken}
                        onChange={e => setLocalSettings({...localSettings, telegram: {...localSettings.telegram, botToken: e.target.value}})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-sky-500 dark:text-white"
                        placeholder="123456789:ABCdefGHI..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Chat ID (Grupo)</label>
                      <input
                        type="text"
                        value={localSettings.telegram.chatId}
                        onChange={e => setLocalSettings({...localSettings, telegram: {...localSettings.telegram, chatId: e.target.value}})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-sky-500 dark:text-white"
                        placeholder="-1001234567890"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSendTelegramTest}
                      disabled={telegramTestStatus === 'loading' || !localSettings.telegram.botToken || !localSettings.telegram.chatId}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                        telegramTestStatus === 'success' ? 'bg-emerald-500 text-white' :
                        telegramTestStatus === 'error' ? 'bg-rose-500 text-white' :
                        telegramTestStatus === 'loading' ? 'bg-sky-400 text-white' :
                        'bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {telegramTestStatus === 'loading' ? (
                        <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                      ) : telegramTestStatus === 'success' ? (
                        <><CheckCircle2 size={16} /> Enviado!</>
                      ) : telegramTestStatus === 'error' ? (
                        <><XCircle size={16} /> Erro</>
                      ) : (
                        <><Send size={16} /> Enviar Teste</>
                      )}
                    </button>
                    {telegramTestMessage && (
                      <span className={`text-sm font-medium ${telegramTestStatus === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {telegramTestMessage}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    Notificações: Conclusão de tarefas, resgates de prêmios, mudanças no acesso à internet.
                  </p>
                </div>
              </div>

              {/* Save Button Floating */}
              <div className="fixed bottom-8 right-8 z-[60]">
                 <button 
                  onClick={handleSavePreferences}
                  className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition active:scale-95 flex items-center gap-3 uppercase tracking-widest"
                 >
                   <ShieldCheck size={24} /> Salvar Alterações
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className={`rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 ${systemSettings.theme === 'dark' ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-800'}`}>
            <h3 className="text-2xl font-bold mb-8">{editingMember ? 'Editar Perfil' : 'Novo Perfil'}</h3>
            <div className="space-y-6 mb-10">
              <div className="flex flex-col items-center gap-4">
                 <img src={memberAvatar} className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-lg" alt="" />
                 <button onClick={() => setMemberAvatar(`https://picsum.photos/seed/${Math.random()}/200`)} className="text-xs font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2"><RefreshCw size={12} /> Trocar Avatar</button>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Nome do Membro</label>
                <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Papel</label>
                  <select value={memberRole} onChange={e => setMemberRole(e.target.value as MemberRole)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none">
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest flex items-center gap-2"><Key size={12}/> PIN (4 dígitos)</label>
                  <input type="text" maxLength={4} value={memberPin} onChange={e => setMemberPin(e.target.value.replace(/\D/g,''))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500 text-center tracking-[0.5em]" placeholder="0000" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleSaveMember} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition uppercase tracking-widest text-sm">Salvar Perfil</button>
              <button onClick={() => setShowMemberModal(false)} className="w-full py-2 text-slate-400 font-bold">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Device Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className={`rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 ${systemSettings.theme === 'dark' ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-800'}`}>
            <h3 className="text-2xl font-bold mb-8">{editingDevice ? 'Editar Dispositivo' : 'Novo Dispositivo'}</h3>
            <div className="space-y-6 mb-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Nome amigável</label>
                <input type="text" value={deviceName} onChange={e => setDeviceName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500" placeholder="Ex: iPad do Henrique" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Endereço MAC</label>
                <input type="text" value={deviceMac} onChange={e => setDeviceMac(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500" placeholder="00:00:00:00:00:00" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest flex items-center gap-2"><Users size={12} /> Atribuir a</label>
                <select
                  value={deviceAssignedTo || ''}
                  onChange={e => setDeviceAssignedTo(e.target.value || null)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500"
                >
                  <option value="">Nenhum (dispositivo compartilhado)</option>
                  {children.filter(c => c.role === 'Criança').map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-2">Dispositivos atribuídos a crianças serão bloqueados automaticamente até que todas as tarefas sejam concluídas.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleSaveDevice} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition uppercase tracking-widest text-sm">{editingDevice ? 'Salvar Alterações' : 'Cadastrar Dispositivo'}</button>
              <button onClick={() => setShowDeviceModal(false)} className="w-full py-2 text-slate-400 font-bold">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
