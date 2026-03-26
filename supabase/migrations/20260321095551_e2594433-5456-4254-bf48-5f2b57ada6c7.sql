
CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, profile_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes viewable by everyone" ON public.post_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.post_likes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can unlike own likes" ON public.post_likes FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
