
-- Add club_id to chat_rooms
ALTER TABLE public.chat_rooms ADD COLUMN club_id uuid REFERENCES public.clubs(id);

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Chat rooms viewable by everyone" ON public.chat_rooms;

-- Create new policy: users see rooms for clubs they are members of, or direct rooms
CREATE POLICY "Users see their chat rooms"
  ON public.chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    type = 'direct'
    OR EXISTS (
      SELECT 1 FROM public.club_members cm
      JOIN public.profiles p ON p.id = cm.profile_id
      WHERE cm.club_id = chat_rooms.club_id
      AND p.user_id = auth.uid()
    )
  );

-- Also restrict chat_messages SELECT to rooms the user can see
DROP POLICY IF EXISTS "Chat messages viewable by everyone" ON public.chat_messages;

CREATE POLICY "Users see messages in their rooms"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = chat_messages.room_id
      AND (
        cr.type = 'direct'
        OR EXISTS (
          SELECT 1 FROM public.club_members cm
          JOIN public.profiles p ON p.id = cm.profile_id
          WHERE cm.club_id = cr.club_id
          AND p.user_id = auth.uid()
        )
      )
    )
  );
