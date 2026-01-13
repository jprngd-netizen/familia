
import React, { useState } from 'react';
import { Notice, Child } from '../types';
import { MessageSquare, Send, Trash2, Eye, EyeOff, User, Clock, AlertCircle } from 'lucide-react';
import { useKeywords } from '../ThemeContext';

interface NoticeBoardProps {
  notices: Notice[];
  currentUser: Child | null;
  onCreateNotice: (content: string) => Promise<void>;
  onHideNotice: (noticeId: string) => Promise<void>;
  onUnhideNotice: (noticeId: string) => Promise<void>;
  onDeleteNotice: (noticeId: string) => Promise<void>;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({
  notices,
  currentUser,
  onCreateNotice,
  onHideNotice,
  onUnhideNotice,
  onDeleteNotice
}) => {
  const [newNotice, setNewNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const keywords = useKeywords();

  const isAdult = currentUser?.role === 'Adulto';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateNotice(newNotice.trim());
      setNewNotice('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Adulto':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Criança':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-theme-card rounded-2xl p-4 md:p-6 border border-theme-border">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-theme-primary/20">
          <MessageSquare className="w-5 h-5 text-theme-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-theme-text">Mural de Avisos</h3>
          <p className="text-sm text-theme-muted">
            {notices.length} {notices.length === 1 ? 'aviso' : 'avisos'}
          </p>
        </div>
      </div>

      {/* New notice form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newNotice}
            onChange={(e) => setNewNotice(e.target.value)}
            placeholder="Escreva um aviso para a família..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-theme-border bg-theme-darker text-theme-text placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newNotice.trim() || isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-theme-primary text-theme-dark font-semibold hover:bg-theme-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Publicar</span>
          </button>
        </div>
      </form>

      {/* Notices list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {notices.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-theme-muted mx-auto mb-2 opacity-50" />
            <p className="text-theme-muted">Nenhum aviso ainda</p>
            <p className="text-sm text-theme-muted mt-1">Seja o primeiro a deixar uma mensagem!</p>
          </div>
        ) : (
          notices.map((notice) => {
            const isOwnNotice = notice.authorId === currentUser?.id;
            const isHidden = notice.hiddenByAuthor;

            return (
              <div
                key={notice.id}
                className={`p-4 rounded-xl border transition-all ${
                  isHidden
                    ? 'border-dashed border-theme-border/50 bg-theme-darker/50 opacity-60'
                    : 'border-theme-border bg-theme-darker hover:border-theme-primary/30'
                }`}
              >
                {/* Notice header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-theme-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-theme-primary" />
                    </div>
                    <span className="font-semibold text-theme-text">{notice.authorName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(notice.authorRole)}`}>
                      {notice.authorRole}
                    </span>
                    {isHidden && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Oculto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-theme-muted">
                    <Clock className="w-3 h-3" />
                    {formatDate(notice.createdAt)}
                  </div>
                </div>

                {/* Notice content */}
                <p className="text-theme-text mb-3 whitespace-pre-wrap break-words">
                  {notice.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end">
                  {/* Own notice: hide/unhide */}
                  {isOwnNotice && (
                    <button
                      onClick={() => isHidden ? onUnhideNotice(notice.id) : onHideNotice(notice.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-theme-card border border-theme-border hover:border-theme-primary/50 text-theme-muted hover:text-theme-text transition-colors"
                    >
                      {isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Mostrar
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Ocultar
                        </>
                      )}
                    </button>
                  )}

                  {/* Adults: delete permanently */}
                  {isAdult && (
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este aviso permanentemente?')) {
                          onDeleteNotice(notice.id);
                        }
                      }}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  )}
                </div>

                {/* Info for adults about hidden notices */}
                {isAdult && isHidden && !isOwnNotice && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="w-3 h-3" />
                    Este aviso foi ocultado pelo autor, mas você ainda pode vê-lo.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
