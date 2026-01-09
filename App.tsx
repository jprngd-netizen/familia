
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ParentsDashboard from './views/ParentsDashboard';
import KidsPortal from './views/KidsPortal';
import TVMode from './views/TVMode';
import SettingsView from './views/SettingsView';
import ChildDetailView from './views/ChildDetailView';
import StoreView from './views/StoreView';
import LoginView from './views/LoginView';
import CalendarView from './views/CalendarView';
import { Child, Task, ActivityLog, Punishment, Reward, MemberRole, Device, SystemSettings, RewardRequest } from './types';
import API from './services/apiService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('login');
  const [authenticatedMember, setAuthenticatedMember] = useState<Child | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  
  const [children, setChildren] = useState<Child[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [rewardRequests, setRewardRequests] = useState<RewardRequest[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    theme: 'light',
    notifications: { taskCompleted: true, rewardRedeemed: true, punishmentApplied: true },
    telegram: { botToken: '', chatId: '', enabled: false }
  });

  const [isFestiveMode, setIsFestiveMode] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function (reusable)
  const fetchData = async () => {
    try {
      setLoading(true);
      const [childrenData, rewardsData, logsData, devicesData, settingsData, requestsData] = await Promise.all([
        API.children.getAll(),
        API.rewards.getAll(),
        API.logs.getRecent(50),
        API.devices.getAll(),
        API.settings.get(),
        API.rewards.getPendingRequests()
      ]);

      setChildren(childrenData);
      setRewards(rewardsData);
      setLogs(logsData);
      setDevices(devicesData);
      setSystemSettings(settingsData);
      setRewardRequests(requestsData);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch initial data:', err);
      setError(err.message || 'Failed to connect to server');
      setLoading(false);
    }
  };

  // Fetch initial data from API
  useEffect(() => {
    fetchData();
  }, []);

  // Apply theme
  useEffect(() => {
    const html = document.documentElement;
    if (systemSettings.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [systemSettings.theme]);

  useEffect(() => {
    const html = document.documentElement;
    if (isFestiveMode) html.classList.add('festive-mode');
    else html.classList.remove('festive-mode');
  }, [isFestiveMode]);

  // Check for upcoming birthdays
  useEffect(() => {
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 30);

    const upcoming = children.filter(c => {
      if (!c.birthday) return false;
      const b = new Date(c.birthday);
      const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < now) next.setFullYear(now.getFullYear() + 1);
      return next <= soon;
    });

    setUpcomingBirthdays(upcoming);
  }, [children]);

  // Reward redemption logic
  const handleRedeemReward = async (childId: string, rewardId: string) => {
    const child = children.find(c => c.id === childId);
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!child || !reward || child.points < reward.cost) {
      alert("Pontos insuficientes!");
      return;
    }

    try {
      const result = await API.rewards.redeem(rewardId, childId);
      
      // Refresh data after redemption
      const [updatedChildren, updatedLogs, updatedRequests] = await Promise.all([
        API.children.getAll(),
        API.logs.getRecent(50),
        API.rewards.getPendingRequests()
      ]);
      
      setChildren(updatedChildren);
      setLogs(updatedLogs);
      setRewardRequests(updatedRequests);
      
      if (result.requiresApproval) {
        alert(`Pedido enviado! Como custa mais de 1000 pontos, o Papai ou a Mamãe precisam aprovar primeiro.`);
      } else {
        alert(`Parabéns! Você resgatou "${reward.title}".`);
      }
    } catch (err: any) {
      alert(`Erro ao resgatar recompensa: ${err.message}`);
    }
  };

  const handleProcessRewardRequest = async (requestId: string, approve: boolean) => {
    try {
      await API.rewards.processRequest(requestId, approve);
      
      // Refresh data
      const [updatedChildren, updatedLogs, updatedRequests] = await Promise.all([
        API.children.getAll(),
        API.logs.getRecent(50),
        API.rewards.getPendingRequests()
      ]);
      
      setChildren(updatedChildren);
      setLogs(updatedLogs);
      setRewardRequests(updatedRequests);
    } catch (err: any) {
      alert(`Erro ao processar pedido: ${err.message}`);
    }
  };

  const handleLogin = async (member: Child, readOnly: boolean) => {
    setAuthenticatedMember(member);
    setIsReadOnly(readOnly);
    setActiveView(member.role === 'Adulto' && !readOnly ? 'parent-dashboard' : 'kids-portal');
  };

  const handleLogout = () => {
    setAuthenticatedMember(null);
    setIsReadOnly(false);
    setActiveView('login');
  };

  const handleAddTask = async (childId: string, task: Omit<Task, 'id' | 'completed'>) => {
    try {
      await API.tasks.create({
        childId,
        title: task.title,
        points: task.points,
        category: task.category,
        recurrence: task.recurrence,
        schedule: task.schedule
      });
      
      const updatedChildren = await API.children.getAll();
      setChildren(updatedChildren);
    } catch (err: any) {
      alert(`Erro ao criar tarefa: ${err.message}`);
    }
  };

  const handleToggleTask = async (childId: string, taskId: string) => {
    if (isReadOnly) return;
    
    try {
      await API.tasks.toggle(taskId);
      
      // Refresh children and logs
      const [updatedChildren, updatedLogs] = await Promise.all([
        API.children.getAll(),
        API.logs.getRecent(50)
      ]);
      
      setChildren(updatedChildren);
      setLogs(updatedLogs);
    } catch (err: any) {
      alert(`Erro ao atualizar tarefa: ${err.message}`);
    }
  };

  const handleAdjustPoints = async (childId: string, amount: number, reason: string) => {
    try {
      await API.children.adjustPoints(childId, amount, reason);
      
      const [updatedChildren, updatedLogs] = await Promise.all([
        API.children.getAll(),
        API.logs.getRecent(50)
      ]);
      
      setChildren(updatedChildren);
      setLogs(updatedLogs);
    } catch (err: any) {
      alert(`Erro ao ajustar pontos: ${err.message}`);
    }
  };

  const handleQuickUnlock = async (childId: string) => {
    try {
      await API.children.quickUnlock(childId, 1);
      
      const updatedChildren = await API.children.getAll();
      setChildren(updatedChildren);
    } catch (err: any) {
      alert(`Erro ao desbloquear: ${err.message}`);
    }
  };

  const handleToggleTV = async (childId: string) => {
    try {
      await API.children.toggleTV(childId);
      
      const updatedChildren = await API.children.getAll();
      setChildren(updatedChildren);
    } catch (err: any) {
      alert(`Erro ao alternar TV: ${err.message}`);
    }
  };

  const handleUpdateSystemSettings = async (newSettings: SystemSettings) => {
    try {
      await API.settings.update(newSettings);
      setSystemSettings(newSettings);
    } catch (err: any) {
      alert(`Erro ao atualizar configurações: ${err.message}`);
    }
  };

  const handleCreateReward = async (reward: Omit<Reward, 'id'>) => {
    try {
      await API.rewards.create(reward);
      const updatedRewards = await API.rewards.getAll();
      setRewards(updatedRewards);
    } catch (err: any) {
      alert(`Erro ao criar recompensa: ${err.message}`);
    }
  };

  const handleUpdateReward = async (reward: Reward) => {
    try {
      await API.rewards.update(reward.id, reward);
      const updatedRewards = await API.rewards.getAll();
      setRewards(updatedRewards);
    } catch (err: any) {
      alert(`Erro ao atualizar recompensa: ${err.message}`);
    }
  };

  const handleDeleteReward = async (id: string) => {
    try {
      await API.rewards.delete(id);
      const updatedRewards = await API.rewards.getAll();
      setRewards(updatedRewards);
    } catch (err: any) {
      alert(`Erro ao deletar recompensa: ${err.message}`);
    }
  };

  const handleAddChild = async (name: string, avatar: string, role: MemberRole, birthday: string, pin: string) => {
    try {
      await API.children.create({ name, avatar, role, birthday, pin });
      const updatedChildren = await API.children.getAll();
      setChildren(updatedChildren);
    } catch (err: any) {
      alert(`Erro ao adicionar membro: ${err.message}`);
    }
  };

  const handleUpdateChild = async (child: Child) => {
    try {
      await API.children.update(child.id, child);
      const updatedChildren = await API.children.getAll();
      setChildren(updatedChildren);
    } catch (err: any) {
      alert(`Erro ao atualizar membro: ${err.message}`);
    }
  };

  const handleDeleteChild = async (id: string) => {
    try {
      await API.children.delete(id);
      const updatedChildren = await API.children.getAll();
      setChildren(updatedChildren);
    } catch (err: any) {
      alert(`Erro ao deletar membro: ${err.message}`);
    }
  };

  const handleAddDevice = async (device: Omit<Device, 'id' | 'status' | 'ip'>) => {
    try {
      await API.devices.create({
        name: device.name,
        type: device.type,
        mac: device.mac,
        assignedTo: (device as any).assignedTo
      });
      const updatedDevices = await API.devices.getAll();
      setDevices(updatedDevices);
    } catch (err: any) {
      alert(`Erro ao adicionar dispositivo: ${err.message}`);
    }
  };

  const handleUpdateDevice = async (device: Device) => {
    try {
      await API.devices.update(device.id, device);
      const updatedDevices = await API.devices.getAll();
      setDevices(updatedDevices);
    } catch (err: any) {
      alert(`Erro ao atualizar dispositivo: ${err.message}`);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      await API.devices.delete(id);
      const updatedDevices = await API.devices.getAll();
      setDevices(updatedDevices);
    } catch (err: any) {
      alert(`Erro ao deletar dispositivo: ${err.message}`);
    }
  };

  const handleToggleDeviceBlock = async (id: string) => {
    try {
      await API.devices.toggleBlock(id);
      const updatedDevices = await API.devices.getAll();
      setDevices(updatedDevices);
    } catch (err: any) {
      alert(`Erro ao bloquear/desbloquear dispositivo: ${err.message}`);
    }
  };

  const renderContent = () => {
    if (loading && activeView === 'login') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Carregando Portal Família...</p>
          </div>
        </div>
      );
    }

    if (error && activeView === 'login') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md p-8 bg-red-50 dark:bg-red-900/20 rounded-3xl">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">Erro de Conexão</h2>
            <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    if (activeView === 'login') return <LoginView children={children} onLogin={handleLogin} onSetupComplete={fetchData} />;

    switch (activeView) {
      case 'parent-dashboard':
        return <ParentsDashboard 
          children={children} 
          logs={logs} 
          rewards={rewards} 
          rewardRequests={rewardRequests}
          onProcessRequest={handleProcessRewardRequest}
          onApplyPunishment={() => {}} 
          onCreateReward={handleCreateReward} 
          onAdjustPoints={handleAdjustPoints} 
          onResetAllowance={() => {}} 
          onChildClick={(id) => { setSelectedChildId(id); setActiveView('child-detail'); }} 
          onQuickUnlock={handleQuickUnlock} 
          onToggleTV={handleToggleTV} 
        />;
      case 'kids-portal':
        return <KidsPortal 
          children={children} 
          rewards={rewards} 
          onToggleTask={handleToggleTask} 
          onRedeemReward={handleRedeemReward} 
          isReadOnly={isReadOnly} 
          initialSelectedId={authenticatedMember?.id} 
          onAddTask={handleAddTask} 
        />;
      case 'store':
        return <StoreView 
          rewards={rewards} 
          onCreateReward={handleCreateReward} 
          onUpdateReward={handleUpdateReward} 
          onDeleteReward={handleDeleteReward} 
        />;
      case 'settings':
        return <SettingsView 
          children={children} 
          devices={devices} 
          onAddChild={handleAddChild} 
          onUpdateChild={handleUpdateChild} 
          onDeleteChild={handleDeleteChild} 
          onAddDevice={handleAddDevice} 
          onUpdateDevice={handleUpdateDevice} 
          onDeleteDevice={handleDeleteDevice} 
          onToggleDeviceBlock={handleToggleDeviceBlock} 
          systemSettings={systemSettings} 
          onUpdateSystemSettings={handleUpdateSystemSettings} 
        />;
      case 'child-detail':
        const child = children.find(c => c.id === selectedChildId);
        return child ? (
          <ChildDetailView
            child={child}
            onBack={() => setActiveView('parent-dashboard')}
            onAdjustPoints={handleAdjustPoints}
            onToggleTask={handleToggleTask}
            onUnlock={handleQuickUnlock}
            onAddTask={handleAddTask}
            onUpdateTask={() => {}}
            onDeleteChild={handleDeleteChild}
          />
        ) : null;
      case 'tv-mode':
        return <TVMode children={children} />;
      case 'calendar':
        return <CalendarView children={children} />;
      default:
        return <div className="p-10">Página em construção...</div>;
    }
  };

  return (
    <div className={`flex min-h-screen ${systemSettings.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      {activeView !== 'login' && (
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          onLogout={handleLogout} 
          currentUser={authenticatedMember} 
          isReadOnly={isReadOnly} 
          upcomingBirthdays={upcomingBirthdays}
        />
      )}
      <main className={`flex-1 ${activeView !== 'login' ? 'ml-64' : ''} min-h-screen`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
