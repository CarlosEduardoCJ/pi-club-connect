
-- posts INSERT: author must belong to the caller
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
CREATE POLICY "Users can create their own posts"
ON public.posts
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = posts.author_id AND p.user_id = auth.uid()
  )
);

-- chat_rooms INSERT: direct rooms allowed for anyone signed-in; club rooms only for members
DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON public.chat_rooms;
CREATE POLICY "Users can create allowed chat rooms"
ON public.chat_rooms
FOR INSERT TO authenticated
WITH CHECK (
  type = 'direct'
  OR (
    club_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.club_members cm
      JOIN public.profiles p ON p.id = cm.profile_id
      WHERE cm.club_id = chat_rooms.club_id AND p.user_id = auth.uid()
    )
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'developer'::app_role)
);
