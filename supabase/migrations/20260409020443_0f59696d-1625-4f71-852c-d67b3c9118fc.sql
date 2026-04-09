
-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- Allow authenticated users to create chat rooms
CREATE POLICY "Authenticated users can create chat rooms"
  ON public.chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
