import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, LogOut, ArrowLeft, Terminal } from "lucide-react";
import { toast } from "sonner";

export default function DevPanelScreen() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isDev, setIsDev] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/dev-login", { replace: true });
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "developer")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          toast.error("Acesso restrito a desenvolvedores.");
          navigate("/dev-login", { replace: true });
        } else {
          setIsDev(true);
        }
      });
  }, [user, authLoading, navigate]);

  const { data: schools } = useQuery({
    queryKey: ["dev-schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("*").order("name");
      if (error) throw error;
      return data;
    },
    enabled: isDev === true,
  });

  const filteredSchools = useMemo(() => {
    if (!schools) return [];
    const q = search.toLowerCase().trim();
    return q ? schools.filter((s) => s.name.toLowerCase().includes(q)) : schools;
  }, [schools, search]);

  const selectedNames = useMemo(() => {
    if (!schools) return [];
    return schools.filter((s) => selected.has(s.id)).map((s) => s.name);
  }, [schools, selected]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (!filteredSchools.length) return;
    const allSelected = filteredSchools.every((s) => selected.has(s.id));
    const next = new Set(selected);
    filteredSchools.forEach((s) => (allSelected ? next.delete(s.id) : next.add(s.id)));
    setSelected(next);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/dev-login", { replace: true });
  };

  if (authLoading || isDev === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  if (!confirmed) {
    return (
      <div className="min-h-screen bg-background p-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold">Painel Desenvolvedor</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-3">Selecione as escolas que deseja visualizar.</p>

        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar escola..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="flex items-center justify-between mb-3 text-sm">
          <Button variant="outline" size="sm" onClick={toggleAll}>
            {filteredSchools.length && filteredSchools.every((s) => selected.has(s.id)) ? "Desmarcar visíveis" : "Selecionar visíveis"}
          </Button>
          <span className="text-muted-foreground">{selected.size} selecionada(s)</span>
        </div>

        <ScrollArea className="h-[55vh] rounded-md border">
          <div className="p-2 space-y-1">
            {filteredSchools.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer"
              >
                <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
            {!filteredSchools.length && (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhuma escola encontrada.</p>
            )}
          </div>
        </ScrollArea>

        <Button
          className="w-full mt-4"
          disabled={selected.size === 0}
          onClick={() => setConfirmed(true)}
        >
          Confirmar ({selected.size})
        </Button>
      </div>
    );
  }

  return <DevDataView schoolNames={selectedNames} onBack={() => setConfirmed(false)} onLogout={handleLogout} />;
}

function DevDataView({ schoolNames, onBack, onLogout }: { schoolNames: string[]; onBack: () => void; onLogout: () => void }) {
  const { data: users } = useQuery({
    queryKey: ["dev-users", schoolNames],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").in("school", schoolNames).order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: clubs } = useQuery({
    queryKey: ["dev-clubs", schoolNames],
    queryFn: async () => {
      const { data, error } = await supabase.from("clubs").select("*").in("school", schoolNames).order("name");
      if (error) throw error;
      return data;
    },
  });

  const clubIds = useMemo(() => (clubs ?? []).map((c) => c.id), [clubs]);

  const { data: events } = useQuery({
    queryKey: ["dev-events", clubIds],
    enabled: clubIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, clubs!events_club_id_fkey(name, school)")
        .in("club_id", clubIds)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["dev-posts", clubIds],
    enabled: clubIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles!posts_author_id_fkey(name, username), clubs!posts_club_id_fkey(name, school)")
        .in("club_id", clubIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Escolas
        </Button>
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h1 className="text-base font-semibold">Dev Panel</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-1" /> Sair
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {schoolNames.map((n) => (
          <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="users">Usuários ({users?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="clubs">Clubes ({clubs?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="events">Eventos ({events?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="posts">Posts ({posts?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-2 mt-4">
          {users?.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </div>
                <Badge variant="outline" className="text-xs">{u.school}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="clubs" className="space-y-2 mt-4">
          {clubs?.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">{c.school}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-2 mt-4">
          {events?.map((e: any) => (
            <Card key={e.id}>
              <CardContent className="p-3">
                <div className="flex justify-between">
                  <p className="font-medium text-sm">{e.title}</p>
                  <Badge variant="outline" className="text-xs">{e.clubs?.school}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{e.clubs?.name} · {new Date(e.date).toLocaleDateString("pt-BR")}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="posts" className="space-y-2 mt-4">
          {posts?.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-3">
                <div className="flex justify-between">
                  <p className="text-xs text-muted-foreground">@{p.profiles?.username} · {p.clubs?.name}</p>
                  <Badge variant="outline" className="text-xs">{p.clubs?.school}</Badge>
                </div>
                <p className="text-sm mt-1 line-clamp-2">{p.content}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
