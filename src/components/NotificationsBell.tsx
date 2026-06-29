import { useEffect, useState } from 'react';
import { Bell, Heart, UserPlus, MessageCircle, Trophy, CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import { motion, AnimatePresence } from 'framer-motion';

interface Notif {
  id: string;
  type: string;
  message: string;
  from_user: string;
  from_avatar: string | null;
  is_read: boolean | null;
  created_at: string;
}

const iconFor = (type: string) => {
  switch (type) {
    case 'like': return Heart;
    case 'follow': return UserPlus;
    case 'message': return MessageCircle;
    case 'competition': return Trophy;
    case 'event': return CalendarDays;
    default: return Bell;
  }
};

const colorFor = (type: string) => {
  switch (type) {
    case 'like': return 'text-accent bg-accent/10';
    case 'follow': return 'text-secondary bg-secondary/10';
    case 'message': return 'text-primary bg-primary/10';
    case 'competition': return 'text-accent bg-accent/10';
    case 'event': return 'text-secondary bg-secondary/10';
    default: return 'text-primary bg-primary/10';
  }
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
};

export default function NotificationsBell({ tone = 'on-primary' }: { tone?: 'on-primary' | 'on-surface' }) {
  const { profileId } = useAuth();
  const { notifications, markNotificationsRead } = useUnreadCounts();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !profileId) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(50);
      setItems((data as Notif[]) || []);
      setLoading(false);
      // mark as read once the list is shown
      markNotificationsRead();
    })();
  }, [open, profileId, markNotificationsRead]);

  const btnColor =
    tone === 'on-primary'
      ? 'text-primary-foreground hover:bg-primary-foreground/10'
      : 'text-foreground hover:bg-muted';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notificações"
          className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${btnColor}`}
        >
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {notifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-primary"
                style={tone === 'on-surface' ? { borderColor: 'hsl(var(--background))' } : {}}
              >
                {notifications > 99 ? '99+' : notifications}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[340px] max-h-[420px] overflow-y-auto p-0">
        <div className="px-4 py-3 border-b border-border sticky top-0 bg-popover z-10">
          <p className="text-sm font-bold text-foreground">Notificações</p>
        </div>
        {loading ? (
          <p className="text-center text-xs text-muted-foreground py-8">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">Sem notificações por aqui.</p>
        ) : (
          <ul>
            {items.map((n) => {
              const Icon = iconFor(n.type);
              const cls = colorFor(n.type);
              return (
                <li
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 border-b border-border/60 last:border-b-0"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">
                      <span className="font-bold">{n.from_user}</span>{' '}
                      <span className="text-muted-foreground">{n.message}</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
