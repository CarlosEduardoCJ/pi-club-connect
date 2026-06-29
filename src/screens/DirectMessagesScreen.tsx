import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Search, MessageCircle } from "lucide-react";
import TeacherBadge from "@/components/TeacherBadge";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { motion } from "framer-motion";

interface SchoolProfile {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  is_teacher: boolean;
}

const getInitials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export default function DirectMessagesScreen() {
  const { profileId } = useAuth();
  const { dmsBySender } = useUnreadCounts();
  const navigate = useNavigate();
  const [mySchool, setMySchool] = useState<string | null>(null);
  const [users, setUsers] = useState<SchoolProfile[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    (async () => {
      setLoading(true);
      const { data: me } = await supabase
        .from("profiles")
        .select("school")
        .eq("id", profileId)
        .maybeSingle();
      const school = me?.school ?? null;
      setMySchool(school);
      if (!school) {
        setUsers([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id, name, username, avatar, is_teacher")
        .eq("school", school)
        .is("deleted_at", null)
        .neq("id", profileId)
        .order("is_teacher", { ascending: false })
        .order("name");
      setUsers((data as SchoolProfile[]) || []);
      setLoading(false);
    })();
  }, [profileId]);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-3 px-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/chat" className="hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-bold flex-1">Nova conversa</h1>
        </div>
        <div className="max-w-lg mx-auto mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuários da sua escola..."
            className="w-full pl-9 pr-3 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 text-sm outline-none"
          />
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {mySchool && (
          <p className="text-[11px] text-muted-foreground mb-3">
            Mostrando usuários de <span className="font-semibold text-foreground">{mySchool}</span>
          </p>
        )}

        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-12">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">Nenhum usuário encontrado.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((u, i) => (
              <motion.button
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => navigate(`/dm/${u.id}`)}
                className="flex items-center gap-3 p-3 rounded-[var(--radius)] bg-card hover:bg-muted/50 transition-colors text-left"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {u.avatar && !u.avatar.startsWith("preset:") ? (
                    <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary">{getInitials(u.name)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{u.name}</p>
                    {u.is_teacher && <TeacherBadge />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                </div>
                {dmsBySender[u.id] ? (
                  <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {dmsBySender[u.id] > 99 ? '99+' : dmsBySender[u.id]}
                  </span>
                ) : (
                  <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
