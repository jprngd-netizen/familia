
import React, { useState, useEffect } from 'react';
import {
  Users, Monitor, Settings, Plus, Edit2, Trash2, Moon, Sun, X,
  RefreshCw, Key, ShieldCheck, Send, Bell, Bot, Lock, Check,
  AlertCircle, MessageSquare, Smartphone, Zap, Calendar, ExternalLink,
  CheckCircle2, XCircle, Loader2, Shield, Globe, Cake, Eye, EyeOff
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
  const [unlockedUser, setUnlockedUser] = useState<Child | null>(null);
  const [pinChallenge, setPinChallenge] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinFor, setShowPinFor] = useState<string | null>(null);
  const [changingPinFor, setChangingPinFor] = useState<Child | null>(null);
  const [newPinValue, setNewPinValue] = useState('');
  const [confirmPinValue, setConfirmPinValue] = useState('');

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
    setTimeout(() => {
      setTelegramTestStatus('idle');
      setTelegramTestMessage('');
    }, 5000);
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const adminUser = children.find(c => c.role === 'Adulto' && c.pin === pinChallenge);
    if (adminUser) {
      setIsUnlocked(true);
      setUnlockedUser(adminUser);
      setPinError(false);
    } else {
      setPinError(true);
      setPinChallenge('');
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const canViewPin = (member: Child): boolean => {
    if (!unlockedUser) return false;
    // Adults can see children's PINs
    if (unlockedUser.role === 'Adulto' && member.role === 'Criança') return true;
    // Users can see their own PIN
    if (unlockedUser.id === member.id) return true;
    return false;
  };

  const canChangePin = (member: Child): boolean => {
    if (!unlockedUser) return false;
    // Adults can change anyone's PIN
    if (unlockedUser.role === 'Adulto') return true;
    // Users can change their own PIN
    if (unlockedUser.id === member.id) return true;
    return false;
  };

  const handleChangePinSubmit = () => {
    if (!changingPinFor || newPinValue.length !== 4 || newPinValue !== confirmPinValue) return;
    onUpdateChild({ ...changingPinFor, pin: newPinValue });
    setChangingPinFor(null);
    setNewPinValue('');
    setConfirmPinValue('');
  };

  const handleSavePreferences = () => {
    onUpdateSystemSettings(localSettings);
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

  // PIN Lock Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500">
        <div className={`w-full max-w-md p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-2xl text-center ${systemSettings.theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner">
            <Lock size={32} className="sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-2 dark:text-white">Acesso Restrito</h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 font-medium">Digite o PIN de um Adulto para acessar.</p>

          <form onSubmit={handlePinSubmit} className="space-y-4 sm:space-y-6">
            <div className="flex justify-center">
              <input
                type="password"
                maxLength={4}
                value={pinChallenge}
                onChange={e => setPinChallenge(e.target.value.replace(/\D/g, ''))}
                autoFocus
                placeholder="****"
                className={`w-32 sm:w-40 text-center text-3xl sm:text-4xl font-black tracking-[0.3em] sm:tracking-[0.5em] py-3 sm:py-4 rounded-xl sm:rounded-2xl outline-none border-2 transition-all ${
                  pinError ? 'border-rose-500 bg-rose-50 text-rose-600 animate-shake' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white focus:border-indigo-500'
                }`}
              />
            </div>
            {pinError && <p className="text-rose-500 text-xs font-black uppercase tracking-widest animate-bounce">PIN incorreto!</p>}
            <button
              type="submit"
              className="w-full py-3 sm:py-4 bg-indigo-600 text-white font-black rounded-xl sm:rounded-2xl shadow-xl hover:bg-indigo-700 transition uppercase tracking-widest text-xs sm:text-sm"
            >
              Desbloquear
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${systemSettings.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Configurações</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Controle de segurança da família.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">
          <ShieldCheck size={14} className="sm:w-4 sm:h-4 text-indigo-600" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase text-indigo-600 tracking-widest">Desbloqueado</span>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden overflow-x-auto -mx-4 px-4 mb-6">
        <div className="flex gap-2 min-w-max">
          <button onClick={() => setActiveTab('members')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'members' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <Users size={16} /> Membros
          </button>
          <button onClick={() => setActiveTab('devices')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'devices' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <Monitor size={16} /> Dispositivos
          </button>
          <button onClick={() => setActiveTab('system')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'system' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <Settings size={16} /> Sistema
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 space-y-2 flex-shrink-0">
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

        {/* Content Area */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[3rem] border shadow-sm animate-in slide-in-from-right-4 duration-300 ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold dark:text-white">Controle de Perfis</h3>
                <button onClick={handleOpenAddMemberModal} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 transition shadow-sm border border-emerald-100 dark:border-emerald-800">
                  <Plus size={18} /> Novo Perfil
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {children.map(child => (
                  <div key={child.id} className={`p-4 sm:p-6 border rounded-xl sm:rounded-[2rem] transition-all ${systemSettings.theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500' : 'bg-slate-50/30 border-slate-50 hover:border-indigo-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <img src={child.avatar} className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-white shadow-sm flex-shrink-0" alt="" />
                        <div className="min-w-0">
                          <p className="font-bold dark:text-white truncate text-sm sm:text-base">{child.name}</p>
                          <p className="text-[9px] sm:text-[10px] font-black uppercase text-indigo-400">
                            {child.role} • {formatBirthdayDisplay(child.birthday)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleOpenEditMemberModal(child)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                        <button onClick={() => onDeleteChild(child.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                      </div>
                    </div>
                    {/* PIN Section */}
                    <div className={`flex items-center justify-between p-3 rounded-xl ${systemSettings.theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-100/50'}`}>
                      <div className="flex items-center gap-2">
                        <Key size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">PIN:</span>
                        {canViewPin(child) ? (
                          <span className="text-sm font-mono font-bold dark:text-white">
                            {showPinFor === child.id ? child.pin : '••••'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">oculto</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {canViewPin(child) && (
                          <button
                            onClick={() => setShowPinFor(showPinFor === child.id ? null : child.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                            title={showPinFor === child.id ? 'Ocultar PIN' : 'Mostrar PIN'}
                          >
                            {showPinFor === child.id ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                        {canChangePin(child) && (
                          <button
                            onClick={() => { setChangingPinFor(child); setNewPinValue(''); setConfirmPinValue(''); }}
                            className="px-2 py-1 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
                          >
                            Alterar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold dark:text-white">Rede Familiar</h3>
                  <button onClick={handleOpenAddDeviceModal} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition shadow-sm border border-indigo-100 dark:border-indigo-800">
                    <Plus size={18} /> Adicionar Device
                  </button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {devices.map(device => {
                    const assignedChild = children.find(c => c.id === device.assignedTo);
                    return (
                      <div key={device.id} className={`p-4 sm:p-6 border rounded-xl sm:rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all group ${device.isWhitelisted ? 'border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-900/10' : systemSettings.theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500' : 'bg-slate-50/30 border-slate-50 hover:border-indigo-200'}`}>
                        <div className="flex items-center gap-3 sm:gap-5 min-w-0 w-full sm:w-auto">
                          <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex-shrink-0 ${device.isWhitelisted ? 'bg-amber-100 text-amber-600' : device.isBlocked ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {device.isWhitelisted ? <Shield size={20} className="sm:w-6 sm:h-6" /> : <Smartphone size={20} className="sm:w-6 sm:h-6" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold dark:text-white truncate text-sm sm:text-base">{device.name}</p>
                              {device.isWhitelisted && (
                                <span className="text-[8px] font-black uppercase bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Whitelist</span>
                              )}
                            </div>
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{device.mac}</p>
                            {assignedChild && (
                              <p className="text-[9px] sm:text-[10px] font-bold text-indigo-500 mt-1 flex items-center gap-1">
                                <Users size={10} /> {assignedChild.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {!device.isWhitelisted && (
                            <button onClick={() => onToggleDeviceBlock(device.id)} className={`px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${device.isBlocked ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              {device.isBlocked ? 'Bloqueado' : 'Liberado'}
                            </button>
                          )}
                          <button onClick={() => onToggleDeviceWhitelist?.(device.id)} title={device.isWhitelisted ? 'Remover da lista branca' : 'Adicionar à lista branca'} className={`p-2 rounded-xl transition-all ${device.isWhitelisted ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}>
                            <Shield size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                          <button onClick={() => handleOpenEditDeviceModal(device)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                          <button onClick={() => onDeleteDevice(device.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Domain Whitelist */}
              <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold dark:text-white flex items-center gap-3"><Globe className="text-amber-500" /> Sites Sempre Permitidos</h3>
                  <p className="text-xs text-slate-500 mt-1">Sites acessíveis mesmo com dispositivo bloqueado</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <input type="text" value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="ex: escola.edu.br" className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-500" />
                  <input type="text" value={newDomainDesc} onChange={e => setNewDomainDesc(e.target.value)} placeholder="Descrição" className="sm:w-40 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500" />
                  <button onClick={handleAddDomain} disabled={domainLoading || !newDomain.trim()} className="bg-amber-500 text-white px-4 sm:px-5 py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {domainLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Adicionar
                  </button>
                </div>

                <div className="space-y-2">
                  {whitelistDomains.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Nenhum site na lista branca.</p>
                  ) : (
                    whitelistDomains.map(domain => (
                      <div key={domain.id} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl ${systemSettings.theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <Globe size={16} className="sm:w-[18px] sm:h-[18px] text-amber-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold dark:text-white truncate text-sm">{domain.domain}</p>
                            {domain.description && <p className="text-xs text-slate-400 truncate">{domain.description}</p>}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteDomain(domain.id)} className="p-2 text-slate-400 hover:text-rose-500 flex-shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-24 sm:pb-20">
              {/* Theme */}
              <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-8 flex items-center gap-3 dark:text-white"><Sun className="text-amber-500" /> Interface</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button onClick={() => setLocalSettings({...localSettings, theme: 'light'})} className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all flex items-center gap-3 sm:gap-4 ${localSettings.theme === 'light' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${localSettings.theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}`}><Sun size={20} className="sm:w-6 sm:h-6" /></div>
                    <div className="text-left">
                      <p className={`font-bold text-sm sm:text-base ${localSettings.theme === 'light' ? 'text-indigo-900' : 'text-slate-400'}`}>Modo Dia</p>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400">Padrão</p>
                    </div>
                    {localSettings.theme === 'light' && <Check size={18} className="sm:w-5 sm:h-5 ml-auto text-indigo-600" />}
                  </button>
                  <button onClick={() => setLocalSettings({...localSettings, theme: 'dark'})} className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all flex items-center gap-3 sm:gap-4 ${localSettings.theme === 'dark' ? 'border-indigo-600 bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${localSettings.theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}`}><Moon size={20} className="sm:w-6 sm:h-6" /></div>
                    <div className="text-left">
                      <p className={`font-bold text-sm sm:text-base ${localSettings.theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Modo Noite</p>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400">Escuro</p>
                    </div>
                    {localSettings.theme === 'dark' && <Check size={18} className="sm:w-5 sm:h-5 ml-auto text-indigo-600" />}
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-8 flex items-center gap-3 dark:text-white"><Bell className="text-indigo-500" /> Notificações</h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { key: 'taskCompleted', label: 'Conclusão de Missões', desc: 'Alertar quando tarefa for concluída.' },
                    { key: 'rewardRedeemed', label: 'Resgate de Prêmios', desc: 'Avisar quando pontos forem usados.' },
                    { key: 'punishmentApplied', label: 'Aplicação de Punições', desc: 'Notificar quando regra for quebrada.' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl gap-4">
                      <div className="min-w-0">
                        <p className="font-bold dark:text-white text-sm sm:text-base">{item.label}</p>
                        <p className="text-xs text-slate-500 hidden sm:block">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleToggleNotification(item.key as any)}
                        className={`w-11 sm:w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${localSettings.notifications[item.key as keyof SystemSettings['notifications']] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localSettings.notifications[item.key as keyof SystemSettings['notifications']] ? 'left-6 sm:left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telegram Integration */}
              <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 flex items-center gap-3 dark:text-white">
                  <MessageSquare className="text-blue-500" /> Telegram
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                  Receba notificações no Telegram quando tarefas forem concluídas ou prêmios resgatados.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Bot Token</label>
                    <input
                      type="text"
                      value={localSettings.telegram?.botToken || ''}
                      onChange={e => setLocalSettings({...localSettings, telegram: { ...localSettings.telegram, botToken: e.target.value }})}
                      placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Chat ID</label>
                    <input
                      type="text"
                      value={localSettings.telegram?.chatId || ''}
                      onChange={e => setLocalSettings({...localSettings, telegram: { ...localSettings.telegram, chatId: e.target.value }})}
                      placeholder="123456789"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSendTelegramTest}
                      disabled={telegramTestStatus === 'loading' || !localSettings.telegram?.botToken || !localSettings.telegram?.chatId}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {telegramTestStatus === 'loading' ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : telegramTestStatus === 'success' ? (
                        <CheckCircle2 size={16} />
                      ) : telegramTestStatus === 'error' ? (
                        <XCircle size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                      Enviar Teste
                    </button>
                  </div>
                  {telegramTestMessage && (
                    <p className={`text-xs font-bold ${telegramTestStatus === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {telegramTestMessage}
                    </p>
                  )}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">
                      <strong>Como configurar:</strong><br/>
                      1. No Telegram, fale com @BotFather e crie um bot<br/>
                      2. Copie o token do bot<br/>
                      3. Inicie conversa com seu bot e envie uma mensagem<br/>
                      4. Acesse: api.telegram.org/bot[TOKEN]/getUpdates<br/>
                      5. Copie o chat.id do resultado
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Calendar */}
              <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[3rem] border shadow-sm ${systemSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 flex items-center gap-3 dark:text-white">
                  <Calendar className="text-green-500" /> Google Calendar
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
                  Sincronize eventos da família com o Google Calendar.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {calendarStatus.loading ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">Verificando...</span>
                    </div>
                  ) : calendarStatus.connected ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-bold">Conectado</span>
                      </div>
                      <button
                        onClick={handleDisconnectCalendar}
                        className="text-sm text-rose-500 font-bold hover:underline"
                      >
                        Desconectar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleConnectCalendar}
                      className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-100 transition"
                    >
                      <ExternalLink size={16} />
                      Conectar Google Calendar
                    </button>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-[60]">
                <button onClick={handleSavePreferences} className="bg-indigo-600 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition active:scale-95 flex items-center gap-2 sm:gap-3 uppercase tracking-widest text-xs sm:text-sm">
                  <ShieldCheck size={20} className="sm:w-6 sm:h-6" /> Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className={`rounded-t-3xl sm:rounded-[3rem] p-6 sm:p-10 w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-200 max-h-[90vh] overflow-y-auto ${systemSettings.theme === 'dark' ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold">{editingMember ? 'Editar Perfil' : 'Novo Perfil'}</h3>
              <button onClick={() => setShowMemberModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition sm:hidden">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <img src={memberAvatar} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-indigo-50 shadow-lg" alt="" />
                <button onClick={() => setMemberAvatar(`https://picsum.photos/seed/${Math.random()}/200`)} className="text-xs font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2"><RefreshCw size={12} /> Trocar Avatar</button>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Nome</label>
                <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none focus:border-indigo-500 text-sm sm:text-base" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Papel</label>
                  <select value={memberRole} onChange={e => setMemberRole(e.target.value as MemberRole)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 font-bold outline-none text-sm">
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest flex items-center gap-1"><Key size={10} /> PIN</label>
                  <input type="text" maxLength={4} value={memberPin} onChange={e => setMemberPin(e.target.value.replace(/\D/g,''))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none focus:border-indigo-500 text-center tracking-[0.3em] sm:tracking-[0.5em] text-sm sm:text-base" placeholder="0000" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest flex items-center gap-1"><Cake size={10} /> Nascimento</label>
                <input type="date" value={memberBirthday} onChange={e => setMemberBirthday(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none focus:border-indigo-500 text-sm sm:text-base" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleSaveMember} className="w-full py-3 sm:py-4 bg-indigo-600 text-white font-black rounded-xl sm:rounded-2xl shadow-xl hover:bg-indigo-700 transition uppercase tracking-widest text-xs sm:text-sm">Salvar</button>
              <button onClick={() => setShowMemberModal(false)} className="w-full py-2 text-slate-400 font-bold hidden sm:block">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Device Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className={`rounded-t-3xl sm:rounded-[3rem] p-6 sm:p-10 w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-200 max-h-[90vh] overflow-y-auto ${systemSettings.theme === 'dark' ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold">{editingDevice ? 'Editar Dispositivo' : 'Novo Dispositivo'}</h3>
              <button onClick={() => setShowDeviceModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition sm:hidden">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Nome</label>
                <input type="text" value={deviceName} onChange={e => setDeviceName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none focus:border-indigo-500 text-sm sm:text-base" placeholder="Ex: iPad do Henrique" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Endereço MAC</label>
                <input type="text" value={deviceMac} onChange={e => setDeviceMac(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none focus:border-indigo-500 text-sm sm:text-base" placeholder="00:00:00:00:00:00" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest flex items-center gap-1"><Users size={10} /> Atribuir a</label>
                <select value={deviceAssignedTo || ''} onChange={e => setDeviceAssignedTo(e.target.value || null)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold outline-none focus:border-indigo-500 text-sm sm:text-base">
                  <option value="">Nenhum</option>
                  {children.filter(c => c.role === 'Criança').map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleSaveDevice} className="w-full py-3 sm:py-4 bg-indigo-600 text-white font-black rounded-xl sm:rounded-2xl shadow-xl hover:bg-indigo-700 transition uppercase tracking-widest text-xs sm:text-sm">{editingDevice ? 'Salvar' : 'Cadastrar'}</button>
              <button onClick={() => setShowDeviceModal(false)} className="w-full py-2 text-slate-400 font-bold hidden sm:block">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {changingPinFor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className={`rounded-t-3xl sm:rounded-[3rem] p-6 sm:p-10 w-full sm:max-w-sm shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-200 ${systemSettings.theme === 'dark' ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold">Alterar PIN</h3>
              <button onClick={() => setChangingPinFor(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition sm:hidden">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <img src={changingPinFor.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
              <div>
                <p className="font-bold dark:text-white">{changingPinFor.name}</p>
                <p className="text-[10px] font-black uppercase text-indigo-400">{changingPinFor.role}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Novo PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPinValue}
                  onChange={e => setNewPinValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none focus:border-indigo-500 text-center tracking-[0.5em] text-lg"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Confirmar PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPinValue}
                  onChange={e => setConfirmPinValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3 font-bold outline-none text-center tracking-[0.5em] text-lg ${
                    confirmPinValue && confirmPinValue !== newPinValue
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-100 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
                {confirmPinValue && confirmPinValue !== newPinValue && (
                  <p className="text-rose-500 text-xs font-bold mt-2">PINs não coincidem</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleChangePinSubmit}
                disabled={newPinValue.length !== 4 || newPinValue !== confirmPinValue}
                className="w-full py-3 sm:py-4 bg-indigo-600 text-white font-black rounded-xl sm:rounded-2xl shadow-xl hover:bg-indigo-700 transition uppercase tracking-widest text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Alterar PIN
              </button>
              <button onClick={() => setChangingPinFor(null)} className="w-full py-2 text-slate-400 font-bold hidden sm:block">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
