
-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, name, username)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow authenticated users to insert chat messages
CREATE POLICY "Authenticated users can insert chat messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update chat rooms (last_message)
CREATE POLICY "Authenticated users can update chat rooms"
  ON public.chat_rooms FOR UPDATE TO authenticated
  USING (true);

-- Allow authenticated users to insert posts
CREATE POLICY "Authenticated users can insert posts"
  ON public.posts FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to join clubs
CREATE POLICY "Authenticated users can join clubs"
  ON public.club_members FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to leave clubs
CREATE POLICY "Authenticated users can delete own membership"
  ON public.club_members FOR DELETE TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
