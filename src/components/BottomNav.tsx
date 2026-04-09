import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Search, MessageCircle, CalendarDays, User } from 'lucide-react';

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
