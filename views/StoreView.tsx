
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Tag, Gift, Trash2, Edit2, Star, CheckCircle2, Clock, Smartphone, Coffee, Map, PartyPopper } from 'lucide-react';
import { Reward } from '../types';

interface StoreViewProps {
  rewards: Reward[];
  onCreateReward: (reward: Omit<Reward, 'id'>) => void;
  onUpdateReward: (reward: Reward) => void;
  onDeleteReward: (rewardId: string) => void;
}

const StoreView: React.FC<StoreViewProps> = ({ rewards, onCreateReward, onUpdateReward, onDeleteReward }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>('Todos');
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  
  const [formData, setFormData] = useState<Omit<Reward, 'id'>>({ 
    title: '', 
    description: '', 
    cost: 100, 
    icon: '🎁', 
    category: 'Digital' 
  });

  const categories = ['Digital', 'Lazer', 'Guloseimas', 'Eventos'];

  const filteredRewards = filter === 'Todos' 
    ? rewards 
    : rewards.filter(r => r.category === filter);

  const handleOpenAdd = () => {
    setEditingReward(null);
    setFormData({ title: '', description: '', cost: 100, icon: '🎁', category: 'Digital' });
    setShowModal(true);
  };

  const handleOpenEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({ 
      title: reward.title, 
      description: reward.description, 
      cost: reward.cost, 
      icon: reward.icon, 
      category: reward.category 
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.title) return;

    if (editingReward) {
      onUpdateReward({ ...formData, id: editingReward.id });
    } else {
      onCreateReward(formData);
    }
    
    setShowModal(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Digital': return <Smartphone size={16} />;
      case 'Guloseimas': return <Coffee size={16} />;
      case 'Lazer': return <Map size={16} />;
      case 'Eventos': return <PartyPopper size={16} />;
      default: return <Tag size={16} />;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Loja de Recompensas</h2>
          <p className="text-slate-500 font-medium">Gestão de prêmios e catálogo familiar</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition active:scale-95"
        >
          <Plus size={20} /> Adicionar Recompensa
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Categorias */}
        <aside className="space-y-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 sticky top-8">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-indigo-500" /> Categorias
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setFilter('Todos')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${filter === 'Todos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Todos os Itens
              </button>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilter(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${filter === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {getCategoryIcon(cat)}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
             <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <Star size={18} /> Dica de Gestor
             </h3>
             <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
               Mantenha prêmios de baixo custo para recompensas diárias e metas grandes para conquistas mensais.
             </p>
          </div>
        </aside>

        {/* Grade de Produtos */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRewards.map(reward => (
              <div key={reward.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:border-indigo-300 transition-all flex gap-5">
                <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner border border-slate-100 flex-shrink-0 group-hover:scale-110 transition-transform">
                  {reward.icon}
                </div>
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 truncate pr-2" title={reward.title}>{reward.title}</h4>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <button 
                          onClick={() => handleOpenEdit(reward)}
                          className="text-slate-300 hover:text-indigo-500 p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteReward(reward.id)}
                          className="text-slate-300 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">{reward.category}</p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 font-medium leading-relaxed">{reward.description}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">
                      {reward.cost} PONTOS
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredRewards.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold">Nenhum item nesta categoria ainda.</p>
                <button onClick={handleOpenAdd} className="mt-4 text-indigo-600 font-bold hover:underline">Adicionar primeiro item</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Adição / Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-8">{editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}</h3>
            <div className="space-y-5 mb-10">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Nome do Prêmio</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500" 
                  placeholder="Ex: Cinema com Pipoca" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Descrição Curta</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 h-24 resize-none" 
                  placeholder="Explique o que é este prêmio..." 
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Categoria</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Custo (Pts)</label>
                  <input 
                    type="number" 
                    value={formData.cost} 
                    onChange={e => setFormData({...formData, cost: parseInt(e.target.value)})} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Emoji Icon</label>
                  <select 
                    value={formData.icon} 
                    onChange={e => setFormData({...formData, icon: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none"
                  >
                    <option>🎮</option><option>🍿</option><option>🌳</option><option>🍦</option><option>🎁</option>
                    <option>🎢</option><option>🚲</option><option>🌙</option><option>⛺</option><option>🛍️</option>
                    <option>🍕</option><option>🍔</option><option>⚽</option><option>🎭</option><option>🎈</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSubmit} 
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition"
              >
                {editingReward ? 'Atualizar Alterações' : 'Salvar Recompensa'}
              </button>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition"
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

export default StoreView;
