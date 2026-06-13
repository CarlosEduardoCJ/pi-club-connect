import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Monitor, Bell, Shield, HelpCircle, Info, ChevronRight, LogOut } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { motion } from 'framer-motion';

const themeOptions = [
  { value: 'light' as const, label: 'Claro', icon: Sun },
  { value: 'dark' as const, label: 'Escuro', icon: Moon },
  { value: 'system' as const, label: 'Sistema', icon: Monitor },
];

const SettingsScreen = () => {
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/profile" className="hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight">Configurações</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        {/* Theme */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-[var(--radius)] p-4"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <h2 className="text-sm font-bold text-foreground mb-3">Aparência</h2>
          <div className="flex gap-2">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all ${
                  theme === opt.value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                <opt.icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* General settings */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card rounded-[var(--radius)] overflow-hidden"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <h2 className="text-sm font-bold text-foreground px-4 pt-4 pb-2">Geral</h2>
          <SettingsItem icon={Bell} label="Notificações" description="Gerenciar alertas e sons" />
          <SettingsItem icon={Shield} label="Privacidade" description="Controle quem vê seu perfil" />
          <SettingsItem icon={HelpCircle} label="Ajuda e Suporte" description="Central de ajuda e FAQ" />
          <Link to="/about" className="contents">
            <SettingsItem icon={Info} label="Sobre o App" description="Versão 1.0.0" last />
          </Link>
        </motion.section>

        {/* Admin Panel */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Link
              to="/admin"
              className="w-full bg-card rounded-[var(--radius)] p-4 flex items-center gap-3 text-accent hover:bg-accent/5 transition-colors"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm font-bold">Painel Admin</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Link>
          </motion.div>
        )}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: isAdmin ? 0.3 : 0.2 }}
        >
          <button
            onClick={signOut}
            className="w-full bg-card rounded-[var(--radius)] p-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Sair da conta</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
};

const SettingsItem = ({
  icon: Icon,
  label,
  description,
  last,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  last?: boolean;
}) => (
  <button
    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
      !last ? 'border-b border-border' : ''
    }`}
  >
    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </button>
);

export default SettingsScreen;
