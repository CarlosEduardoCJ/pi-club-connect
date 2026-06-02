-- Suspender (soft ban) usuário por 100 anos
CREATE OR REPLACE FUNCTION public.ban_user_by_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem suspender usuários.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode suspender sua própria conta.'
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE auth.users
  SET banned_until = now() + interval '100 years',
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('banned', true)
  WHERE id = target_user_id;
END;
$$;

-- Remover suspensão
CREATE OR REPLACE FUNCTION public.unban_user_by_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem reativar usuários.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  UPDATE auth.users
  SET banned_until = NULL,
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) - 'banned'
  WHERE id = target_user_id;
END;
$$;

-- Excluir permanentemente o usuário
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir usuários.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode excluir sua própria conta.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Remove dados públicos relacionados
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE user_id = target_user_id;

  -- Remove usuário do auth (cascateia o que faltar via FK)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ban_user_by_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.unban_user_by_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_user_by_admin(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.ban_user_by_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unban_user_by_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(uuid) TO authenticated;