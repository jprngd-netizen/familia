
import React, { useState } from 'react';
import { ShoppingBag, Plus, Tag, Gift, Trash2, Edit2, Star, Smartphone, Coffee, Map, PartyPopper, X, Coins } from 'lucide-react';
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
      case 'Digital': return <Smartphone size={14} className="sm:w-4 sm:h-4" />;
      case 'Guloseimas': return <Coffee size={14} className="sm:w-4 sm:h-4" />;
      case 'Lazer': return <Map size={14} className="sm:w-4 sm:h-4" />;
      case 'Eventos': return <PartyPopper size={14} className="sm:w-4 sm:h-4" />;
      default: return <Tag size={14} className="sm:w-4 sm:h-4" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Loja de Recompensas</h2>
          <p className="text-gray-400 font-medium text-sm sm:text-base">Gestao de premios e catalogo familiar</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-norton-yellow text-norton-dark px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-norton-gold shadow-lg shadow-norton-yellow/20 transition active:scale-95 text-sm sm:text-base"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" /> Adicionar Recompensa
        </button>
      </header>

      {/* Mobile Filter Tabs */}
      <div className="lg:hidden overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setFilter('Todos')}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              filter === 'Todos'
                ? 'bg-norton-yellow text-norton-dark shadow-md'
                : 'bg-norton-card border border-norton-border text-gray-400'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                filter === cat
                  ? 'bg-norton-yellow text-norton-dark shadow-md'
                  : 'bg-norton-card border border-norton-border text-gray-400'
              }`}
            >
              {getCategoryIcon(cat)}
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block space-y-4">
          <div className="bg-norton-card p-6 rounded-[2rem] shadow-sm border border-norton-border sticky top-8">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Tag size={18} className="text-norton-yellow" /> Categorias
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setFilter('Todos')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  filter === 'Todos'
                    ? 'bg-norton-yellow text-norton-dark shadow-md'
                    : 'text-gray-400 hover:bg-norton-cardHover'
                }`}
              >
                Todos os Itens
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    filter === cat
                      ? 'bg-norton-yellow text-norton-dark shadow-md'
                      : 'text-gray-400 hover:bg-norton-cardHover'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-norton-yellow/10 p-6 rounded-[2rem] border border-norton-yellow/20">
            <h3 className="font-bold text-norton-yellow mb-2 flex items-center gap-2">
              <Star size={18} /> Dica de Gestor
            </h3>
            <p className="text-xs text-norton-gold/80 leading-relaxed font-medium">
              Mantenha premios de baixo custo para recompensas diarias e metas grandes para conquistas mensais.
            </p>
          </div>
        </aside>

        {/* Rewards Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filteredRewards.map(reward => (
              <div
                key={reward.id}
                className="bg-norton-card p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-norton-border group hover:border-norton-yellow/30 transition-all flex gap-4 sm:gap-5"
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-norton-dark rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-2xl sm:text-4xl shadow-inner border border-norton-border flex-shrink-0 group-hover:scale-110 transition-transform">
                  {reward.icon}
                </div>
                <div className="flex-1 flex flex-col justify-between overflow-hidden min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-white truncate text-sm sm:text-base" title={reward.title}>
                        {reward.title}
                      </h4>
                      <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => handleOpenEdit(reward)}
                          className="text-gray-500 hover:text-norton-yellow p-1"
                        >
                          <Edit2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteReward(reward.id)}
                          className="text-gray-500 hover:text-norton-danger p-1"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-norton-yellow uppercase tracking-widest mt-0.5">
                      {reward.category}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 font-medium leading-relaxed hidden sm:block">
                      {reward.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-norton-border">
                    <span className="bg-norton-yellow/10 text-norton-yellow px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                      <Coins size={10} className="sm:w-3 sm:h-3" />
                      {reward.cost} PTS
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredRewards.length === 0 && (
              <div className="col-span-full py-12 sm:py-20 text-center bg-norton-dark rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-norton-border">
                <ShoppingBag size={36} className="sm:w-12 sm:h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500 font-bold text-sm sm:text-base">Nenhum item nesta categoria ainda.</p>
                <button onClick={handleOpenAdd} className="mt-4 text-norton-yellow font-bold hover:underline text-sm sm:text-base">
                  Adicionar primeiro item
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-norton-darker/95 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-norton-card border border-norton-border rounded-t-3xl sm:rounded-[3rem] p-6 sm:p-10 w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-norton-cardHover rounded-xl transition sm:hidden"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Nome do Premio</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-norton-dark border border-norton-border rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none focus:border-norton-yellow text-white text-sm sm:text-base"
                  placeholder="Ex: Cinema com Pipoca"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Descricao Curta</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-norton-dark border border-norton-border rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none focus:border-norton-yellow h-20 sm:h-24 resize-none text-white text-sm sm:text-base"
                  placeholder="Explique o que e este premio..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Categoria</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full bg-norton-dark border border-norton-border rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-white text-sm sm:text-base"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Custo (Pts)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: parseInt(e.target.value)})}
                    className="w-full bg-norton-dark border border-norton-border rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-white text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Emoji</label>
                  <select
                    value={formData.icon}
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    className="w-full bg-norton-dark border border-norton-border rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-white text-sm sm:text-base"
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
                className="w-full py-3 sm:py-4 bg-norton-yellow text-norton-dark font-bold rounded-xl sm:rounded-2xl shadow-xl hover:bg-norton-gold transition text-sm sm:text-base"
              >
                {editingReward ? 'Atualizar Alteracoes' : 'Salvar Recompensa'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-gray-500 font-bold hover:text-gray-300 transition text-sm sm:text-base hidden sm:block"
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
