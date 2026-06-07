import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X } from "lucide-react";

const DISMISS_KEY = "dismissed_announcements";

const getDismissed = (): string[] => {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]"); } catch { return []; }
};

export default function GlobalAnnouncementBanner() {
  const [dismissed, setDismissed] = useState<string[]>(getDismissed());

  const { data } = useQuery({
    queryKey: ["global-announcements-active"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("global_announcements")
        .select("*")
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const items = (data ?? []).filter((a) => !dismissed.includes(a.id));
  if (!items.length) return null;

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((a) => (
        <div key={a.id} className="rounded-lg border border-accent/40 bg-accent/10 p-3 flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{a.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{a.message}</p>
          </div>
          <button
            onClick={() => dismiss(a.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar anúncio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
