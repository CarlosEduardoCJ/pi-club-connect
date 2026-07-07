ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type = ANY (ARRAY['like','comment','event','join','mention','message','follow','competition','announcement','report']));
DELETE FROM public.direct_messages WHERE content='__test_dm__';