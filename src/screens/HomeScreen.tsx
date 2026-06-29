import { useClubs } from '@/hooks/useSupabaseData';
import { useSchoolView } from '@/hooks/useSchoolView';
import ClubCard from '@/components/ClubCard';
import DevSchoolSelector from '@/components/DevSchoolSelector';
import { Search, Trophy, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const HomeScreen = () => {
  const [search, setSearch] = useState('');
  const { data: clubs, isLoading } = useClubs();
  const { selectedSchool } = useSchoolView();

  const filteredClubs = (clubs || [])
    .filter(c => !selectedSchool || c.school === selectedSchool)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="w-9" />
          <h1 className="text-xl font-extrabold text-center tracking-tight">PI_Club</h1>
          <NotificationsBell />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <DevSchoolSelector />

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar clubes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card rounded-[var(--radius)] pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent/30 transition-shadow"
            style={{ boxShadow: 'var(--shadow-card)' }}
          />
        </div>

        <Link
          to="/competitions"
          className="flex items-center gap-3 bg-card rounded-[var(--radius)] p-4 mb-6 hover:bg-accent/5 transition-colors"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Competições Acadêmicas</p>
            <p className="text-xs text-muted-foreground">Olimpíadas e desafios — inscreva-se</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </Link>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Carregando clubes...</div>
        ) : filteredClubs.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Nenhum clube encontrado{selectedSchool ? ` em ${selectedSchool}` : ''}.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredClubs.map((club, i) => (
              <ClubCard key={club.id} club={club} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomeScreen;
