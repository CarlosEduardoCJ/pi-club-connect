import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UnreadContextType {
  notifications: number;
  dmsTotal: number;
  dmsBySender: Record<string, number>;
  markNotificationsRead: () => Promise<void>;
  markDmsRead: (senderId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextType>({
  notifications: 0,
  dmsTotal: 0,
  dmsBySender: {},
  markNotificationsRead: async () => {},
  markDmsRead: async () => {},
  refresh: async () => {},
});

export const useUnreadCounts = () => useContext(UnreadContext);

export const UnreadCountsProvider = ({ children }: { children: ReactNode }) => {
  const { profileId } = useAuth();
  const [notifications, setNotifications] = useState(0);
  const [dmsBySender, setDmsBySender] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    if (!profileId) {
      setNotifications(0);
      setDmsBySender({});
      return;
    }
    const [{ count: nCount }, { data: dmRows }] = await Promise.all([
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .eq('is_read', false),
      supabase
        .from('direct_messages')
        .select('sender_id')
        .eq('recipient_id', profileId)
        .is('read_at', null)
        .eq('deleted', false),
    ]);
    setNotifications(nCount ?? 0);
    const map: Record<string, number> = {};
    (dmRows || []).forEach((r: any) => {
      map[r.sender_id] = (map[r.sender_id] || 0) + 1;
    });
    setDmsBySender(map);
  }, [profileId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!profileId) return;
    const ch = supabase
      .channel(`unread:${profileId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profileId}` },
        () => refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${profileId}` },
        () => refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_messages', filter: `sender_id=eq.${profileId}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [profileId, refresh]);

  const markNotificationsRead = useCallback(async () => {
    if (!profileId) return;
    setNotifications(0);
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('profile_id', profileId)
      .eq('is_read', false);
  }, [profileId]);

  const markDmsRead = useCallback(
    async (senderId: string) => {
      if (!profileId) return;
      setDmsBySender((prev) => {
        const next = { ...prev };
        delete next[senderId];
        return next;
      });
      await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', profileId)
        .eq('sender_id', senderId)
        .is('read_at', null);
    },
    [profileId],
  );

  const dmsTotal = Object.values(dmsBySender).reduce((a, b) => a + b, 0);

  return (
    <UnreadContext.Provider
      value={{ notifications, dmsTotal, dmsBySender, markNotificationsRead, markDmsRead, refresh }}
    >
      {children}
    </UnreadContext.Provider>
  );
};
