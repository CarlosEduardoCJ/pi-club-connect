import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Search, MessageCircle, CalendarDays, User } from 'lucide-react';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';

const tabs = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/feed', icon: Newspaper, label: 'Feed' },
  { path: '/search', icon: Search, label: 'Buscar' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/events', icon: CalendarDays, label: 'Eventos' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

const BottomNav = () => {
  const location = useLocation();
  const { dmsTotal } = useUnreadCounts();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/chat'
              ? location.pathname.startsWith('/chat') || location.pathname.startsWith('/dm')
              : location.pathname === tab.path;
          const showBadge = tab.path === '/chat' && dmsTotal > 0;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border border-card">
                    {dmsTotal > 99 ? '99+' : dmsTotal}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
