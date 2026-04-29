// Componente de card de evento.
import { ClubEvent } from '@/models/social';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MapPin, Users, CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const EventCard = ({ event, index }: { event: ClubEvent; index: number }) => {
  const { profileId } = useAuth();
  const [attending, setAttending] = useState(false);
  const [attendees, setAttendees] = useState(event.attendeesCount);
  const [loading, setLoading] = useState(false);
  const ClubIcon = (Icons as unknown as Record<string, LucideIcon>)[event.clubIcon] || Icons.Circle;

  // Carrega o estado real de presença do banco
  useEffect(() => {
    if (!profileId) return;
    supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', event.id)
      .eq('profile_id', profileId)
      .maybeSingle()
      .then(({ data }) => setAttending(!!data));
  }, [profileId, event.id]);

  // Mantém contador sincronizado se o prop mudar
  useEffect(() => {
    setAttendees(event.attendeesCount);
  }, [event.attendeesCount]);

  const toggleAttend = async () => {
    if (!profileId || loading) return;
    setLoading(true);

    if (attending) {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', event.id)
        .eq('profile_id', profileId);
      if (error) {
        toast.error('Erro ao cancelar presença');
      } else {
        setAttending(false);
        setAttendees(prev => Math.max(0, prev - 1));
      }
    } else {
      const { error } = await supabase
        .from('event_attendees')
        .insert({ event_id: event.id, profile_id: profileId });
      if (error) {
        toast.error('Erro ao confirmar presença');
      } else {
        setAttending(true);
        setAttendees(prev => prev + 1);
      }
    }
    setLoading(false);
  };

  const dateFormatted = format(parseISO(event.date), "dd 'de' MMM", { locale: ptBR });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="bg-card rounded-[var(--radius)] overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Color stripe */}
      <div className="h-1.5 bg-accent" />

      <div className="p-4">
        {/* Club badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
            <ClubIcon className="w-3.5 h-3.5 text-accent" />
          </div>
          <span className="text-xs font-semibold text-accent">{event.clubName}</span>
        </div>

        <h3 className="text-base font-bold text-foreground mb-2">{event.title}</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{event.description}</p>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{dateFormatted} às {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{attendees} confirmados</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={toggleAttend}
          disabled={loading || !profileId}
          className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-60 ${
            attending
              ? 'bg-secondary/10 text-secondary border border-secondary/30'
              : 'bg-accent text-accent-foreground hover:bg-accent/90'
          }`}
        >
          {attending ? '✓ Confirmado' : 'Participar'}
        </button>
      </div>
    </motion.div>
  );
};

export default EventCard;
