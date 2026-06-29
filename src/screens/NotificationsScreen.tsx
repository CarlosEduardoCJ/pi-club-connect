import { useNotifications } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MessageCircle, CalendarDays, UserPlus, AtSign } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  event: CalendarDays,
  join: UserPlus,
  mention: AtSign,
};

const colorMap: Record<string, string> = {
  like: 'text-accent bg-accent/10',
  comment: 'text-primary bg-primary/10',
  event: 'text-secondary bg-secondary/10',
  join: 'text-secondary bg-secondary/10',
  mention: 'text-accent bg-accent/10',
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const NotificationsScreen = () => {
  const { profileId } = useAuth();
  const { data: notifications, isLoading } = useNotifications(profileId || '');
  const unreadCount = (notifications || []).filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">Notificações</h1>
          {unreadCount > 0 && (
            <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Carregando...</div>
        ) : (
          (notifications || []).map((notif, i) => {
            const Icon = iconMap[notif.type] || Heart;
            const colorClass = colorMap[notif.type] || 'text-accent bg-accent/10';
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className={`flex items-start gap-3 px-4 py-3.5 border-b border-border transition-colors ${
                  !notif.is_read ? 'bg-accent/5' : ''
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-bold">{notif.from_user}</span>{' '}
                    <span className="text-muted-foreground">{notif.message}</span>
                  </p>
                  <span className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.created_at)}</span>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                )}
              </motion.div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default NotificationsScreen;
