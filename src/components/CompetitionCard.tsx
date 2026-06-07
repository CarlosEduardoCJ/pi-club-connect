import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, MapPin, Users, Clock, Trophy, MoreVertical, Pencil, Trash2, ToggleLeft } from 'lucide-react';
import { format, parseISO, differenceInDays, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Competition {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: string;
  registration_deadline: string | null;
  registrants_count: number;
  scope?: string | null;
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'open': return { text: 'Inscrições Abertas', color: 'bg-secondary text-secondary-foreground' };
    case 'closed': return { text: 'Inscrições Encerradas', color: 'bg-muted text-muted-foreground' };
    case 'finished': return { text: 'Finalizada', color: 'bg-muted text-muted-foreground' };
    default: return { text: status, color: 'bg-muted text-muted-foreground' };
  }
};

export const scopeLabel = (scope?: string | null) => {
  switch (scope) {
    case 'global': return { text: 'Global', color: 'bg-primary text-primary-foreground' };
    case 'nacional': return { text: 'Nacional', color: 'bg-accent text-accent-foreground' };
    case 'estadual_pi': return { text: 'Estadual — Piauí', color: 'bg-secondary text-secondary-foreground' };
    default: return null;
  }
};

const useCountdown = (target: string | null) => {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!target) return;
    const update = () => {
      const targetDate = parseISO(target);
      const now = new Date();
      if (targetDate <= now) { setText('Encerrado'); return; }
      const days = differenceInDays(targetDate, now);
      if (days > 0) { setText(`${days} ${days === 1 ? 'dia' : 'dias'} restantes`); return; }
      const hours = differenceInHours(targetDate, now);
      setText(`${hours}h restantes`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [target]);
  return text;
};

interface CompetitionCardProps {
  competition: Competition;
  index: number;
  isAdmin?: boolean;
  onRefresh?: () => void;
}

const CompetitionCard = ({ competition, index, isAdmin, onRefresh }: CompetitionCardProps) => {
  const { profileId } = useAuth();
  const [registered, setRegistered] = useState(false);
  const [count, setCount] = useState(competition.registrants_count);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const countdown = useCountdown(competition.registration_deadline);
  const status = statusLabel(competition.status);
  const isOnline = competition.location.toLowerCase() === 'online';

  // Edit form state
  const [editName, setEditName] = useState(competition.name);
  const [editDesc, setEditDesc] = useState(competition.description);
  const [editDate, setEditDate] = useState(competition.date);
  const [editTime, setEditTime] = useState(competition.time);
  const [editLocation, setEditLocation] = useState(competition.location);
  const [editDeadline, setEditDeadline] = useState(
    competition.registration_deadline ? competition.registration_deadline.slice(0, 16) : ''
  );

  useEffect(() => {
    if (!profileId) return;
    supabase
      .from('competition_registrations')
      .select('id')
      .eq('competition_id', competition.id)
      .eq('profile_id', profileId)
      .maybeSingle()
      .then(({ data }) => setRegistered(!!data));
  }, [profileId, competition.id]);

  useEffect(() => { setCount(competition.registrants_count); }, [competition.registrants_count]);

  const toggle = async () => {
    if (!profileId || loading) return;
    setLoading(true);
    if (registered) {
      const { error } = await supabase
        .from('competition_registrations')
        .delete()
        .eq('competition_id', competition.id)
        .eq('profile_id', profileId);
      if (error) toast.error('Erro ao cancelar inscrição');
      else { setRegistered(false); setCount(c => Math.max(0, c - 1)); toast.success('Inscrição cancelada'); }
    } else {
      const { error } = await supabase
        .from('competition_registrations')
        .insert({ competition_id: competition.id, profile_id: profileId });
      if (error) toast.error('Erro ao se inscrever');
      else { setRegistered(true); setCount(c => c + 1); toast.success('Inscrição confirmada!'); }
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta competição?')) return;
    const { error } = await supabase.from('competitions').delete().eq('id', competition.id);
    if (error) toast.error('Erro ao excluir');
    else { toast.success('Competição excluída'); onRefresh?.(); }
  };

  const cycleStatus = async () => {
    const order = ['open', 'closed', 'finished'];
    const next = order[(order.indexOf(competition.status) + 1) % order.length];
    const { error } = await supabase.from('competitions').update({ status: next }).eq('id', competition.id);
    if (error) toast.error('Erro ao alterar status');
    else { toast.success(`Status alterado para: ${statusLabel(next).text}`); onRefresh?.(); }
  };

  const handleEdit = async () => {
    if (!editName.trim() || !editDate) { toast.error('Preencha nome e data'); return; }
    const { error } = await supabase.from('competitions').update({
      name: editName, description: editDesc, date: editDate, time: editTime,
      location: editLocation || 'Online',
      registration_deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
    }).eq('id', competition.id);
    if (error) toast.error('Erro ao editar');
    else { toast.success('Competição atualizada!'); setEditOpen(false); onRefresh?.(); }
  };

  const dateFormatted = format(parseISO(competition.date), "dd 'de' MMM, yyyy", { locale: ptBR });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.06 }}
        className="bg-card rounded-[var(--radius)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="h-1.5 bg-accent" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="text-xs font-semibold text-accent">Competição Acadêmica</span>
              {scopeLabel(competition.scope) && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scopeLabel(competition.scope)!.color}`}>
                  {scopeLabel(competition.scope)!.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${status.color}`}>
                {status.text}
              </span>
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-muted transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={cycleStatus}>
                      <ToggleLeft className="w-3.5 h-3.5 mr-2" /> Alterar status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <h3 className="text-base font-bold text-foreground mb-2">{competition.name}</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{competition.description}</p>

          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{dateFormatted} {competition.time && `às ${competition.time}`}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className={isOnline ? 'text-accent font-semibold' : ''}>{competition.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{count} {count === 1 ? 'inscrito' : 'inscritos'}</span>
            </div>
            {countdown && competition.status === 'open' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
                <Clock className="w-3.5 h-3.5" />
                <span>{countdown}</span>
              </div>
            )}
          </div>

          <button
            onClick={toggle}
            disabled={loading || !profileId || competition.status !== 'open'}
            className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-60 ${
              registered
                ? 'bg-secondary/10 text-secondary border border-secondary/30'
                : 'bg-accent text-accent-foreground hover:bg-accent/90'
            }`}
          >
            {registered ? '✓ Inscrito' : competition.status === 'open' ? 'Inscrever-se' : 'Indisponível'}
          </button>
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Competição</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3">
            <Input placeholder="Nome" value={editName} onChange={e => setEditName(e.target.value)} />
            <Input placeholder="Descrição" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
            <Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
            <Input placeholder="Horário (ex: 14:00)" value={editTime} onChange={e => setEditTime(e.target.value)} />
            <Input placeholder="Local (ou Online)" value={editLocation} onChange={e => setEditLocation(e.target.value)} />
            <label className="text-xs text-muted-foreground">Prazo de inscrição</label>
            <Input type="datetime-local" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} />
            <Button onClick={handleEdit}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompetitionCard;
