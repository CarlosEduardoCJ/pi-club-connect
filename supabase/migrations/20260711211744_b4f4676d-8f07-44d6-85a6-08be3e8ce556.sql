
-- Revoke EXECUTE from PUBLIC/anon/authenticated on trigger-only and internal SECURITY DEFINER functions
DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.update_profile_posts_count()',
    'public.update_event_attendees_count()',
    'public.update_competition_registrants_count()',
    'public.update_post_likes_count()',
    'public.update_post_comments_count()',
    'public.update_follow_counts()',
    'public.handle_new_user()',
    'public.notify_new_dm()',
    'public.notify_new_competition()',
    'public.notify_new_follower()',
    'public.notify_post_like()',
    'public.notify_new_event()',
    'public.set_post_school()',
    'public.set_club_school()',
    'public.set_event_school()',
    'public.prevent_manual_developer_profile_changes()'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', fn);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', fn);
  END LOOP;
END $$;
