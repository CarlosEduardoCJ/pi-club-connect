import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClubs = () =>
  useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clubs').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

export const useClubById = (id: string | undefined) =>
  useQuery({
    queryKey: ['club', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('clubs').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

export const useClubMembers = (clubId: string | undefined) =>
  useQuery({
    queryKey: ['club-members', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('club_members')
        .select('*, profiles(*)')
        .eq('club_id', clubId!);
      if (error) throw error;
      return data;
    },
    enabled: !!clubId,
  });

export const usePosts = (clubId?: string) =>
  useQuery({
    queryKey: ['posts', clubId],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*, profiles!posts_author_id_fkey(name, username, avatar), clubs!posts_club_id_fkey(name)')
        .order('created_at', { ascending: false });
      if (clubId) query = query.eq('club_id', clubId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useEvents = () =>
  useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, clubs!events_club_id_fkey(name, icon)')
        .order('date');
      if (error) throw error;
      return data;
    },
  });

export const useNotifications = (profileId: string) =>
  useQuery({
    queryKey: ['notifications', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

export const useProfile = (profileId: string) =>
  useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

export const useProfileClubs = (profileId: string) =>
  useQuery({
    queryKey: ['profile-clubs', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('club_members')
        .select('*, clubs(*)')
        .eq('profile_id', profileId);
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

export const useChatRooms = () =>
  useQuery({
    queryKey: ['chat-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*, clubs(name, icon)')
        .order('last_message_time', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useChatMessages = (roomId: string | undefined) =>
  useQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, profiles!chat_messages_sender_id_fkey(name, avatar)')
        .eq('room_id', roomId!)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!roomId,
  });

// Default mock profile ID for demo (Ana Beatriz)
export const DEMO_PROFILE_ID = 'a1000001-0000-4000-8000-000000000001';
