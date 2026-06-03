
-- 1. Add school to clubs
ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS school text NOT NULL DEFAULT 'CETI Manoel Ricardo';

-- 2. Helper: current user's school
CREATE OR REPLACE FUNCTION public.current_user_school()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 3. Trigger: on club insert, default school to creator's school
CREATE OR REPLACE FUNCTION public.set_club_school()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _school text;
BEGIN
  _school := public.current_user_school();
  IF _school IS NOT NULL THEN
    NEW.school := _school;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_club_school ON public.clubs;
CREATE TRIGGER trg_set_club_school
  BEFORE INSERT ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.set_club_school();

-- 4. Tighten RLS: admins can only manage clubs of their school
DROP POLICY IF EXISTS "Admins can update clubs" ON public.clubs;
CREATE POLICY "Admins can update clubs"
  ON public.clubs FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) AND school = public.current_user_school());

DROP POLICY IF EXISTS "Admins can delete clubs" ON public.clubs;
CREATE POLICY "Admins can delete clubs"
  ON public.clubs FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) AND school = public.current_user_school());

-- 5. Events: admins can only manage events of clubs in their school
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = events.club_id AND c.school = public.current_user_school())
  );

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = events.club_id AND c.school = public.current_user_school())
  );

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = events.club_id AND c.school = public.current_user_school())
  );

-- 6. Posts: admins can only delete posts whose club is in their school
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
CREATE POLICY "Admins can delete posts"
  ON public.posts FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = posts.club_id AND c.school = public.current_user_school())
  );

DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = posts.club_id AND c.school = public.current_user_school())
  );

-- 7. Scope user management RPCs to same school
CREATE OR REPLACE FUNCTION public.ban_user_by_admin(target_user_id uuid)
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
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem suspender usuários.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode suspender sua própria conta.'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT school INTO _admin_school FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  SELECT school INTO _target_school FROM public.profiles WHERE user_id = target_user_id LIMIT 1;

  IF _admin_school IS NULL OR _target_school IS NULL OR _admin_school <> _target_school THEN
    RAISE EXCEPTION 'Você só pode gerenciar usuários da sua própria escola.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  UPDATE auth.users
  SET banned_until = now() + interval '100 years',
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('banned', true)
  WHERE id = target_user_id;
END;
$$;

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

  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
