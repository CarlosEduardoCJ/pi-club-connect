import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Plus } from 'lucide-react';
import { useCompetitions } from '@/hooks/useCompetitions';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CompetitionCard from '@/components/CompetitionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

type Tab = 'about' | 'competitions' | 'members' | 'posts';

const CompetitionsScreen = () => {
  const { data: competitions, isLoading } = useCompetitions();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('competitions');

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');

  const list = competitions || [];
  const openCount = list.filter(c => c.status === 'open').length;

  const handleCreate = async () => {
    if (!name.trim() || !date) { toast.error('Preencha nome e data'); return; }
    const { error } = await supabase.from('competitions').insert({
      name, description, date, time, location: location || 'Online',
      registration_deadline: deadline ? new Date(deadline).toISOString() : null,
      status: 'open',
    });
    if (error) { toast.error('Erro ao criar competição'); return; }
    toast.success('Competição criada!');
    setOpen(false);
    setName(''); setDescription(''); setDate(''); setTime(''); setLocation(''); setDeadline('');
    queryClient.invalidateQueries({ queryKey: ['competitions'] });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'about', label: 'Sobre' },
    { key: 'competitions', label: `Competições (${list.length})` },
    { key: 'members', label: 'Membros' },
    { key: 'posts', label: 'Posts' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-background border-b border-border py-4 px-6 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/" className="text-foreground hover:text-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Competições Acadêmicas</h1>
      </header>

      <main className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center py-8 bg-card"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground">Calendário de Competições</h2>
          <p className="text-sm text-muted-foreground mt-1 px-6 text-center">
            Olimpíadas, torneios e desafios acadêmicos
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs font-semibold text-secondary">
              {openCount} {openCount === 1 ? 'inscrição aberta' : 'inscrições abertas'}
            </span>
          </div>
        </motion.div>

        <div className="flex border-b border-border bg-card sticky top-[57px] z-10 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-fit px-3 py-3 text-xs font-bold text-center transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-accent border-accent'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'about' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <h3 className="text-base font-bold text-foreground mb-3">Sobre as Competições</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Acompanhe aqui todas as competições acadêmicas em que nossa escola participa: olimpíadas de matemática, física, química, astronomia, ciências e muito mais.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                Inscreva-se nas competições do seu interesse e receba lembretes sobre datas e prazos.
              </p>
            </motion.div>
          )}

          {activeTab === 'competitions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
              {isAdmin && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 self-end" size="sm">
                      <Plus className="w-4 h-4" /> Nova competição
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Criar Competição</DialogTitle></DialogHeader>
                    <div className="flex flex-col gap-3">
                      <Input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
                      <Input placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
                      <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                      <Input placeholder="Horário (ex: 14:00)" value={time} onChange={e => setTime(e.target.value)} />
                      <Input placeholder="Local (ou Online)" value={location} onChange={e => setLocation(e.target.value)} />
                      <label className="text-xs text-muted-foreground">Prazo de inscrição</label>
                      <Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
                      <Button onClick={handleCreate}>Criar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
              ) : list.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma competição cadastrada ainda.</p>
              ) : (() => {
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const isEnded = (c: typeof list[number]) => {
                  if (c.status === 'finished' || c.status === 'closed') return true;
                  return new Date(c.date) < today;
                };
                const active = list.filter(c => !isEnded(c));
                const ended = list.filter(isEnded);
                const refresh = () => queryClient.invalidateQueries({ queryKey: ['competitions'] });
                return (
                  <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="active">Ativas ({active.length})</TabsTrigger>
                      <TabsTrigger value="ended">Encerradas ({ended.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="flex flex-col gap-4 mt-4">
                      {active.length === 0
                        ? <p className="text-sm text-muted-foreground text-center py-8">Nenhuma competição ativa.</p>
                        : active.map((c, i) => <CompetitionCard key={c.id} competition={c} index={i} isAdmin={isAdmin} onRefresh={refresh} />)}
                    </TabsContent>
                    <TabsContent value="ended" className="flex flex-col gap-4 mt-4">
                      {ended.length === 0
                        ? <p className="text-sm text-muted-foreground text-center py-8">Nenhuma competição encerrada.</p>
                        : ended.map((c, i) => <CompetitionCard key={c.id} competition={c} index={i} isAdmin={isAdmin} onRefresh={refresh} />)}
                    </TabsContent>
                  </Tabs>
                );
              })()}
            </motion.div>
          )}

          {activeTab === 'members' && (
            <p className="text-sm text-muted-foreground text-center py-8">Em breve: ranking de participantes.</p>
          )}
          {activeTab === 'posts' && (
            <p className="text-sm text-muted-foreground text-center py-8">Em breve: novidades sobre competições.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompetitionsScreen;
