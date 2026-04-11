import { useState, useEffect } from 'react';
import { Search, UserPlus, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

interface ProfileResult {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  grade: string | null;
  bio: string | null;
}

const SearchScreen = () => {
  const { profileId } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Load who I follow
  useEffect(() => {
    if (!profileId) return;
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', profileId)
      .then(({ data }) => {
        if (data) setFollowingIds(new Set(data.map(d => d.following_id)));
      });
  }, [profileId]);

  // Search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, name, username, avatar, grade, bio')
        .or(`name.ilike.%${trimmed}%,username.ilike.%${trimmed}%`)
        .neq('id', profileId || '')
        .limit(20);
      setResults((data as ProfileResult[]) || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, profileId]);

  const toggleFollow = async (targetId: string) => {
    if (!profileId || togglingId) return;
    setTogglingId(targetId);

    const isFollowing = followingIds.has(targetId);

    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', profileId)
        .eq('following_id', targetId);
      if (!error) {
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
        toast.success('Deixou de seguir');
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: profileId, following_id: targetId });
      if (!error) {
        setFollowingIds(prev => new Set(prev).add(targetId));
        toast.success('Seguindo!');
      } else {
        toast.error('Erro ao seguir');
      }
    }
    setTogglingId(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-extrabold tracking-tight mb-3">Pesquisar</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/50" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nome ou @usuário..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 text-sm outline-none focus:bg-primary-foreground/20 transition-colors"
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {loading && (
          <p className="text-center text-muted-foreground py-8 text-sm">Buscando...</p>
        )}

        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">Nenhum usuário encontrado.</p>
        )}

        {!loading && query.trim().length < 2 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Digite pelo menos 2 caracteres para buscar</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {results.map((user, i) => {
            const isFollowing = followingIds.has(user.id);
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-[var(--radius)] p-4 flex items-center gap-3"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary">{getInitials(user.name)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  {user.grade && (
                    <p className="text-xs text-accent font-semibold">{user.grade}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleFollow(user.id)}
                  disabled={togglingId === user.id}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    isFollowing
                      ? 'bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                      : 'bg-accent text-accent-foreground hover:bg-accent/90'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Seguindo
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Seguir
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default SearchScreen;
