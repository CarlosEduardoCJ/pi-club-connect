import { useEvents } from '@/hooks/useSupabaseData';
import EventCard from '@/components/EventCard';

const EventsScreen = () => {
  const { data: events, isLoading } = useEvents();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <h1 className="text-xl font-extrabold tracking-tight text-center">Eventos</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Carregando eventos...</div>
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
