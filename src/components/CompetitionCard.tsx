import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, MapPin, Users, Clock, Trophy } from 'lucide-react';
import { format, parseISO, differenceInDays, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'open': return { text: 'Inscrições Abertas', color: 'bg-secondary text-secondary-foreground' };
    case 'closed': return { text: 'Inscrições Encerradas', color: 'bg-muted text-muted-foreground' };
    case 'finished': return { text: 'Finalizada', color: 'bg-muted text-muted-foreground' };
    default: return { text: status, color: 'bg-muted text-muted-foreground' };
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

const CompetitionCard = ({ competition, index }: { competition: Competition; index: number }) => {
  const { profileId } = useAuth();
  const [registered, setRegistered] = useState(false);
  const [count, setCount] = useState(competition.registrants_count);
  const [loading, setLoading] = useState(false);
  const countdown = useCountdown(competition.registration_deadline);
  const status = statusLabel(competition.status);
  const isOnline = competition.location.toLowerCase() === 'online';

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

  const dateFormatted = format(parseISO(competition.date), "dd 'de' MMM, yyyy", { locale: ptBR });

  return (
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
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-xs font-semibold text-accent">Competição Acadêmica</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${status.color}`}>
            {status.text}
          </span>
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
  );
};

export default CompetitionCard;
