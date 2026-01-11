
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
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Loja de Recompensas</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Gestão de prêmios e catálogo familiar</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition active:scale-95 text-sm sm:text-base"
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
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
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
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 sticky top-8">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Tag size={18} className="text-indigo-500" /> Categorias
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setFilter('Todos')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  filter === 'Todos'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-800">
            <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
              <Star size={18} /> Dica de Gestor
            </h3>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70 leading-relaxed font-medium">
              Mantenha prêmios de baixo custo para recompensas diárias e metas grandes para conquistas mensais.
            </p>
          </div>
        </aside>

        {/* Rewards Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filteredRewards.map(reward => (
              <div
                key={reward.id}
                className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex gap-4 sm:gap-5"
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-2xl sm:text-4xl shadow-inner border border-slate-100 dark:border-slate-700 flex-shrink-0 group-hover:scale-110 transition-transform">
                  {reward.icon}
                </div>
                <div className="flex-1 flex flex-col justify-between overflow-hidden min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white truncate text-sm sm:text-base" title={reward.title}>
                        {reward.title}
                      </h4>
                      <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => handleOpenEdit(reward)}
                          className="text-slate-300 hover:text-indigo-500 p-1"
                        >
                          <Edit2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteReward(reward.id)}
                          className="text-slate-300 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">
                      {reward.category}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 font-medium leading-relaxed hidden sm:block">
                      {reward.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50 dark:border-slate-800">
                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                      <Coins size={10} className="sm:w-3 sm:h-3" />
                      {reward.cost} PTS
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredRewards.length === 0 && (
              <div className="col-span-full py-12 sm:py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                <ShoppingBag size={36} className="sm:w-12 sm:h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold text-sm sm:text-base">Nenhum item nesta categoria ainda.</p>
                <button onClick={handleOpenAdd} className="mt-4 text-indigo-600 font-bold hover:underline text-sm sm:text-base">
                  Adicionar primeiro item
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-[3rem] p-6 sm:p-10 w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold dark:text-white">
                {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition sm:hidden"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Nome do Prêmio</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none focus:border-indigo-500 text-sm sm:text-base"
                  placeholder="Ex: Cinema com Pipoca"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Descrição Curta</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none focus:border-indigo-500 h-20 sm:h-24 resize-none text-sm sm:text-base"
                  placeholder="Explique o que é este prêmio..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Categoria</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Custo (Pts)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Emoji</label>
                  <select
                    value={formData.icon}
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-base"
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
                className="w-full py-3 sm:py-4 bg-indigo-600 text-white font-bold rounded-xl sm:rounded-2xl shadow-xl hover:bg-indigo-700 transition text-sm sm:text-base"
              >
                {editingReward ? 'Atualizar Alterações' : 'Salvar Recompensa'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition text-sm sm:text-base hidden sm:block"
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
