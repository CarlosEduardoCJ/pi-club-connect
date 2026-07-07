
-- ============= chat_messages: enforce sender ownership + room membership =============
DROP POLICY IF EXISTS "Authenticated users can insert chat messages" ON public.chat_messages;
CREATE POLICY "Users can send messages in their rooms"
ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = chat_messages.sender_id AND p.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = chat_messages.room_id
      AND (
        cr.type = 'direct'
        OR EXISTS (
          SELECT 1 FROM public.club_members cm
          JOIN public.profiles p2 ON p2.id = cm.profile_id
          WHERE cm.club_id = cr.club_id AND p2.user_id = auth.uid()
        )
      )
  )
);

-- ============= chat_rooms: restrict UPDATE to members / admins =============
DROP POLICY IF EXISTS "Authenticated users can update chat rooms" ON public.chat_rooms;
CREATE POLICY "Members can update their chat rooms"
ON public.chat_rooms
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'developer'::app_role)
  OR (
    club_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.club_members cm
      JOIN public.profiles p ON p.id = cm.profile_id
      WHERE cm.club_id = chat_rooms.club_id AND p.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'developer'::app_role)
  OR (
    club_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.club_members cm
      JOIN public.profiles p ON p.id = cm.profile_id
      WHERE cm.club_id = chat_rooms.club_id AND p.user_id = auth.uid()
    )
  )
);

-- ============= club_members: only join yourself =============
DROP POLICY IF EXISTS "Authenticated users can join clubs" ON public.club_members;
CREATE POLICY "Users can join clubs themselves"
ON public.club_members
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = club_members.profile_id AND p.user_id = auth.uid()
  )
);

-- ============= notifications: only own notifications =============
DROP POLICY IF EXISTS "Notifications viewable by everyone" ON public.notifications;
CREATE POLICY "Users see their own notifications"
ON public.notifications
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = notifications.profile_id AND p.user_id = auth.uid()
  )
);
-- Users can mark their own notifications as read (needed for update: is_read)
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = notifications.profile_id AND p.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = notifications.profile_id AND p.user_id = auth.uid())
);

-- ============= post_likes: only like as yourself =============
DROP POLICY IF EXISTS "Authenticated users can like" ON public.post_likes;
CREATE POLICY "Users can like as themselves"
ON public.post_likes
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = post_likes.profile_id AND p.user_id = auth.uid()
  )
);

-- ============= user_roles: only own role visible =============
DROP POLICY IF EXISTS "Roles viewable by authenticated users" ON public.user_roles;
CREATE POLICY "Users see their own role"
ON public.user_roles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'developer'::app_role)
);

-- ============= storage.objects: policies for avatars bucket =============
DROP POLICY IF EXISTS "Avatars: owner can read" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: owner can upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: owner can update" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: owner can delete" ON storage.objects;

CREATE POLICY "Avatars: owner can read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Avatars: owner can upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid() AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatars: owner can update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid())
WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Avatars: owner can delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

-- ============= Revoke EXECUTE on SECURITY DEFINER functions =============
-- Trigger-only functions: no client should call them
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'update_event_attendees_count()',
    'update_profile_posts_count()',
    'update_competition_registrants_count()',
    'update_post_likes_count()',
    'update_post_comments_count()',
    'notify_new_follower()',
    'notify_new_dm()',
    'notify_new_competition()',
    'notify_post_like()',
    'set_post_school()',
    'set_club_school()',
    'update_follow_counts()',
    'notify_new_event()',
    'set_event_school()',
    'prevent_manual_developer_profile_changes()',
    'handle_new_user()'
  ]
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;

-- Admin/developer RPCs: only signed-in users may call (role is re-checked inside)
REVOKE ALL ON FUNCTION public.broadcast_global_announcement(text, text, timestamptz) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.unban_user_by_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ban_user_by_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ban_user_temp_by_dev(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_admin_role_by_dev(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.restore_user_by_dev(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.hard_delete_user_by_dev(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_user_by_admin(uuid) FROM PUBLIC, anon;

-- RLS helper functions: keep executable by authenticated (used inside policies)
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.profile_belongs_to_auth(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.profile_belongs_to_auth(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.current_user_school() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_school() TO authenticated;
