import { useChatRooms } from '@/hooks/useSupabaseData';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Users, User, MessageCirclePlus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const formatTime = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 172800000) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const ChatListScreen = () => {
  const { data: rooms, isLoading } = useChatRooms();
  const clubRooms = (rooms || []).filter(r => r.type === 'club');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">Mensagens</h1>
          <Link to="/dm" className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors" aria-label="Nova conversa">
            <MessageCirclePlus className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 flex flex-col gap-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Clubes</h2>
          </div>
          <div className="flex flex-col gap-1">
            {clubRooms.map((room, i) => {
              const Icon = (Icons as unknown as Record<string, LucideIcon>)[room.icon || 'Circle'] || Icons.Circle;
              return (
                <motion.div key={room.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link
                    to={`/chat/${room.id}`}
                    className="flex items-center gap-3 p-3 rounded-[var(--radius)] bg-card hover:bg-muted/50 transition-colors"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                  >
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground truncate">{room.name}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{formatTime(room.last_message_time)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{room.last_message}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-bold text-foreground">Conversas diretas</h2>
          </div>
          <Link
            to="/dm"
            className="flex items-center gap-3 p-4 rounded-[var(--radius)] bg-gradient-to-br from-accent/15 to-primary/10 hover:from-accent/25 transition-colors border border-border"
          >
            <div className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Iniciar chat ao vivo</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Conversas em tempo real com usuários da sua escola. Sem histórico — mensagens somem ao sair.
              </p>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default ChatListScreen;
