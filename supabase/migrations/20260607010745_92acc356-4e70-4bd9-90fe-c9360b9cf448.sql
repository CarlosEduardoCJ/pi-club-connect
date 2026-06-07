
-- 1) Competitions: scope column + developer policies
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'local';

ALTER TABLE public.competitions
  DROP CONSTRAINT IF EXISTS competitions_scope_check;
ALTER TABLE public.competitions
  ADD CONSTRAINT competitions_scope_check CHECK (scope IN ('local','nacional','global','estadual_pi'));

DROP POLICY IF EXISTS "Developers manage all competitions (insert)" ON public.competitions;
DROP POLICY IF EXISTS "Developers manage all competitions (update)" ON public.competitions;
DROP POLICY IF EXISTS "Developers manage all competitions (delete)" ON public.competitions;
CREATE POLICY "Developers manage all competitions (insert)" ON public.competitions
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'developer'::app_role));
CREATE POLICY "Developers manage all competitions (update)" ON public.competitions
  FOR UPDATE USING (public.has_role(auth.uid(), 'developer'::app_role));
CREATE POLICY "Developers manage all competitions (delete)" ON public.competitions
  FOR DELETE USING (public.has_role(auth.uid(), 'developer'::app_role));

-- 2) Profiles: soft-delete columns + dev visibility
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Active profiles viewable by everyone" ON public.profiles
  FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Developers view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(),'developer'::app_role));
CREATE POLICY "Users view own profile always" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- 3) Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('post','message')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','ignored')),
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can create reports" ON public.reports;
CREATE POLICY "Authenticated can create reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Developers view all reports" ON public.reports;
CREATE POLICY "Developers view all reports" ON public.reports
  FOR SELECT USING (public.has_role(auth.uid(),'developer'::app_role));

DROP POLICY IF EXISTS "Reporters view own reports" ON public.reports;
CREATE POLICY "Reporters view own reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Developers update reports" ON public.reports;
CREATE POLICY "Developers update reports" ON public.reports
  FOR UPDATE USING (public.has_role(auth.uid(),'developer'::app_role));

DROP POLICY IF EXISTS "Developers delete reports" ON public.reports;
CREATE POLICY "Developers delete reports" ON public.reports
  FOR DELETE USING (public.has_role(auth.uid(),'developer'::app_role));

-- 4) Global announcements
CREATE TABLE IF NOT EXISTS public.global_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.global_announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.global_announcements TO authenticated;
GRANT ALL ON public.global_announcements TO service_role;

ALTER TABLE public.global_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads announcements" ON public.global_announcements;
CREATE POLICY "Anyone reads announcements" ON public.global_announcements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Developers manage announcements (insert)" ON public.global_announcements;
CREATE POLICY "Developers manage announcements (insert)" ON public.global_announcements
  FOR INSERT WITH CHECK (public.has_role(auth.uid(),'developer'::app_role));

DROP POLICY IF EXISTS "Developers manage announcements (update)" ON public.global_announcements;
CREATE POLICY "Developers manage announcements (update)" ON public.global_announcements
  FOR UPDATE USING (public.has_role(auth.uid(),'developer'::app_role));

DROP POLICY IF EXISTS "Developers manage announcements (delete)" ON public.global_announcements;
CREATE POLICY "Developers manage announcements (delete)" ON public.global_announcements
  FOR DELETE USING (public.has_role(auth.uid(),'developer'::app_role));

-- 5) Notifications: developers can read/delete cross-school
DROP POLICY IF EXISTS "Developers view all notifications" ON public.notifications;
CREATE POLICY "Developers view all notifications" ON public.notifications
  FOR SELECT USING (public.has_role(auth.uid(),'developer'::app_role));
DROP POLICY IF EXISTS "Developers insert notifications" ON public.notifications;
CREATE POLICY "Developers insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.has_role(auth.uid(),'developer'::app_role));

-- 6) User roles: developer can manage admin role
DROP POLICY IF EXISTS "Developers manage roles (insert)" ON public.user_roles;
CREATE POLICY "Developers manage roles (insert)" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(),'developer'::app_role));
DROP POLICY IF EXISTS "Developers manage roles (delete)" ON public.user_roles;
CREATE POLICY "Developers manage roles (delete)" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(),'developer'::app_role));

-- 7) Replace admin delete with SOFT delete (so dev can restore)
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_school text;
  _target_school text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir usuários.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode excluir sua própria conta.'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT school INTO _admin_school FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  SELECT school INTO _target_school FROM public.profiles WHERE user_id = target_user_id LIMIT 1;
  IF _admin_school IS NULL OR _target_school IS NULL OR _admin_school <> _target_school THEN
    RAISE EXCEPTION 'Você só pode gerenciar usuários da sua própria escola.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  UPDATE public.profiles
    SET deleted_at = now(), deleted_by = auth.uid()
  WHERE user_id = target_user_id AND deleted_at IS NULL;

  UPDATE auth.users
  SET banned_until = now() + interval '100 years',
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('banned', true, 'soft_deleted', true)
  WHERE id = target_user_id;
END;
$$;

-- 8) Developer: hard delete
CREATE OR REPLACE FUNCTION public.hard_delete_user_by_dev(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'developer'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado: apenas desenvolvedores.' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode excluir sua própria conta.' USING ERRCODE = 'check_violation';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- 9) Developer: restore soft-deleted user
CREATE OR REPLACE FUNCTION public.restore_user_by_dev(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'developer'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado: apenas desenvolvedores.' USING ERRCODE = 'insufficient_privilege';
  END IF;

  UPDATE public.profiles
    SET deleted_at = NULL, deleted_by = NULL
  WHERE user_id = target_user_id;

  UPDATE auth.users
  SET banned_until = NULL,
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) - 'banned' - 'soft_deleted'
  WHERE id = target_user_id;
END;
$$;

-- 10) Developer: temporary ban (X days)
CREATE OR REPLACE FUNCTION public.ban_user_temp_by_dev(target_user_id uuid, days int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'developer'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado: apenas desenvolvedores.' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode banir sua própria conta.' USING ERRCODE = 'check_violation';
  END IF;
  IF days IS NULL OR days < 1 THEN
    RAISE EXCEPTION 'Quantidade de dias inválida.' USING ERRCODE = 'check_violation';
  END IF;

  UPDATE auth.users
  SET banned_until = now() + make_interval(days => days),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('banned', true)
  WHERE id = target_user_id;
END;
$$;

-- 11) Developer: set/unset admin role for a user
CREATE OR REPLACE FUNCTION public.set_admin_role_by_dev(target_user_id uuid, make_admin boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'developer'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado: apenas desenvolvedores.' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF make_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::app_role)
    ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin'::app_role;
  END IF;
END;
$$;

-- 12) Developer: broadcast global announcement + per-user notifications
CREATE OR REPLACE FUNCTION public.broadcast_global_announcement(
  _title text,
  _message text,
  _expires_at timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'developer'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado: apenas desenvolvedores.' USING ERRCODE='insufficient_privilege';
  END IF;

  INSERT INTO public.global_announcements (title, message, expires_at, created_by)
  VALUES (_title, _message, _expires_at, auth.uid())
  RETURNING id INTO _id;

  INSERT INTO public.notifications (profile_id, type, message, from_user, from_avatar, is_read)
  SELECT p.id, 'announcement', _title || ' — ' || _message, 'Pi Club', '', false
  FROM public.profiles p
  WHERE p.deleted_at IS NULL;

  RETURN _id;
END;
$$;
