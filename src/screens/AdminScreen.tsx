import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Users, BookOpen, CalendarDays, Shield, FileText, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useClubs, useEvents, usePosts } from '@/hooks/useSupabaseData';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Tab = 'clubs' | 'events' | 'posts' | 'users';

const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('clubs');
  const queryClient = useQueryClient();

  const tabs = [
    { key: 'clubs' as const, label: 'Clubes', icon: BookOpen },
    { key: 'events' as const, label: 'Eventos', icon: CalendarDays },
    { key: 'posts' as const, label: 'Posts', icon: FileText },
    { key: 'users' as const, label: 'Usuários', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/profile" className="hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Shield className="w-5 h-5" />
          <h1 className="text-xl font-extrabold tracking-tight">Painel Admin</h1>
        </div>
      </header>

      <div className="flex border-b border-border bg-card sticky top-[57px] z-10">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === tab.key
                ? 'text-accent border-accent'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <main className="max-w-lg mx-auto p-4">
        {activeTab === 'clubs' && <AdminClubs />}
        {activeTab === 'events' && <AdminEvents />}
        {activeTab === 'posts' && <AdminPosts />}
        {activeTab === 'users' && <AdminUsers />}
      </main>
    </div>
  );
};

const AdminClubs = () => {
  const { data: clubs, isLoading } = useClubs();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('BookOpen');

  const handleCreate = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from('clubs').insert({ name, description, icon });
    if (error) { toast.error('Erro ao criar clube'); return; }
    toast.success('Clube criado!');
    setOpen(false);
    setName(''); setDescription(''); setIcon('BookOpen');
    queryClient.invalidateQueries({ queryKey: ['clubs'] });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('clubs').delete().eq('id', id);
    if (error) { toast.error('Erro ao deletar clube'); return; }
    toast.success('Clube deletado');
    queryClient.invalidateQueries({ queryKey: ['clubs'] });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Clubes ({(clubs || []).length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Clube</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Clube</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-3">
              <Input placeholder="Nome do clube" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
              <Input placeholder="Ícone (ex: BookOpen, Code, Music)" value={icon} onChange={e => setIcon(e.target.value)} />
              <Button onClick={handleCreate}>Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        (clubs || []).map((club, i) => (
          <motion.div
            key={club.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-[var(--radius)] p-3 flex items-center justify-between"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div>
              <p className="text-sm font-bold text-foreground">{club.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{club.description}</p>
            </div>
            <button onClick={() => handleDelete(club.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))
      )}
    </div>
  );
};

const AdminEvents = () => {
  const { data: events, isLoading } = useEvents();
  const { data: clubs } = useClubs();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [clubId, setClubId] = useState('');

  const handleCreate = async () => {
    if (!title.trim() || !clubId || !date || !time || !location) { toast.error('Preencha todos os campos'); return; }
    const { error } = await supabase.from('events').insert({ title, description, date, time, location, club_id: clubId });
    if (error) { toast.error('Erro ao criar evento'); return; }
    toast.success('Evento criado!');
    setOpen(false);
    setTitle(''); setDescription(''); setDate(''); setTime(''); setLocation(''); setClubId('');
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) { toast.error('Erro ao deletar evento'); return; }
    toast.success('Evento deletado');
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Eventos ({(events || []).length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Evento</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-3">
              <Input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
              <Input placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
              <select
                value={clubId}
                onChange={e => setClubId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um clube</option>
                {(clubs || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              <Input placeholder="Horário (ex: 14:00)" value={time} onChange={e => setTime(e.target.value)} />
              <Input placeholder="Local" value={location} onChange={e => setLocation(e.target.value)} />
              <Button onClick={handleCreate}>Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        (events || []).map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-[var(--radius)] p-3 flex items-center justify-between"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div>
              <p className="text-sm font-bold text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.date} • {event.location}</p>
            </div>
            <button onClick={() => handleDelete(event.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))
      )}
    </div>
  );
};

const AdminPosts = () => {
  const { data: posts, isLoading } = usePosts();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) { toast.error('Erro ao deletar post'); return; }
    toast.success('Post deletado');
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-bold text-foreground">Posts ({(posts || []).length})</h2>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        (posts || []).map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-[var(--radius)] p-3 flex items-center justify-between"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{post.profiles?.name || 'Anônimo'}</p>
              <p className="text-xs text-muted-foreground truncate">{post.content}</p>
            </div>
            <button onClick={() => handleDelete(post.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))
      )}
    </div>
  );
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data;
    },
  });

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    if (!userId) return;
    if (currentlyAdmin) {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      if (error) { toast.error('Erro ao remover admin'); return; }
      toast.success('Admin removido');
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      if (error) { toast.error('Erro ao promover admin'); return; }
      toast.success('Promovido a admin!');
    }
    queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
  };

  const isUserAdmin = (userId: string | null) =>
    !!userId && (roles || []).some(r => r.user_id === userId && r.role === 'admin');

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-bold text-foreground">Usuários ({(profiles || []).length})</h2>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : (
        (profiles || []).map((profile, i) => {
          const admin = isUserAdmin(profile.user_id);
          return (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-[var(--radius)] p-3 flex items-center gap-3"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary">{profile.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
              </div>
              {admin && (
                <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">ADMIN</span>
              )}
              <button
                onClick={() => toggleAdmin(profile.user_id, admin)}
                disabled={!profile.user_id}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  admin
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                    : 'bg-accent/10 text-accent hover:bg-accent/20'
                }`}
              >
                {admin ? 'Remover' : 'Promover'}
              </button>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default AdminScreen;
