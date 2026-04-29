import { useState } from 'react';
import { Plus, CalendarDays } from 'lucide-react';
import { useEvents, useClubs } from '@/hooks/useSupabaseData';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const EventsScreen = () => {
  const { data: events, isLoading } = useEvents();
  const { data: clubs } = useClubs();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [clubId, setClubId] = useState('');

  const handleCreate = async () => {
    if (!title.trim() || !clubId || !date || !time || !location) {
      toast.error('Preencha todos os campos');
      return;
    }
    const { error } = await supabase.from('events').insert({
      title,
      description,
      date,
      time,
      location,
      club_id: clubId,
    });
    if (error) {
      toast.error('Erro ao criar evento');
      return;
    }
    toast.success('Evento criado!');
    setOpen(false);
    setTitle(''); setDescription(''); setDate(''); setTime(''); setLocation(''); setClubId('');
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const total = (events || []).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold tracking-tight">Eventos</h1>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" className="gap-1.5 h-8">
                  <Plus className="w-4 h-4" /> Novo
                </Button>
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
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{total} {total === 1 ? 'evento' : 'eventos'}</span>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Carregando eventos...</div>
        ) : total === 0 ? (
          <div className="text-center text-muted-foreground py-12 text-sm">Nenhum evento ainda.</div>
        ) : (
          (events || []).map((event, i) => (
            <EventCard
              key={event.id}
              event={{
                id: event.id,
                clubId: event.club_id,
                clubName: event.clubs?.name || '',
                clubIcon: event.clubs?.icon || 'Circle',
                title: event.title,
                description: event.description,
                date: event.date,
                time: event.time,
                location: event.location,
                attendeesCount: event.attendees_count || 0,
                isAttending: false,
              }}
              index={i}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default EventsScreen;
