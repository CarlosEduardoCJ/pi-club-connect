
-- Add is_teacher flag to profiles, derived from institutional email domain
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_teacher boolean NOT NULL DEFAULT false;

-- Update handle_new_user to also set is_teacher
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _email text;
  _school text;
  _is_dev boolean;
  _is_teacher boolean;
BEGIN
  _email := lower(NEW.email);
  _is_dev := COALESCE((NEW.raw_app_meta_data->>'is_developer')::boolean, false)
          OR COALESCE((NEW.raw_user_meta_data->>'is_developer')::boolean, false)
          OR COALESCE((NEW.raw_user_meta_data->>'developer')::boolean, false);

  IF NOT _is_dev THEN
    IF _email IS NULL OR (
      _email NOT LIKE '%@aluno.edu.pi.gov.br'
      AND _email NOT LIKE '%@professor.edu.pi.gov.br'
    ) THEN
      RAISE EXCEPTION 'Apenas e-mails institucionais da Seduc-PI são permitidos.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  _school := COALESCE(NULLIF(NEW.raw_user_meta_data->>'school', ''), 'CETI MANOEL RICARDO');
  _is_teacher := _email LIKE '%@professor.edu.pi.gov.br';

  INSERT INTO public.profiles (id, user_id, name, username, school, developer, is_teacher)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    _school,
    _is_dev,
    _is_teacher
  );

  IF _is_dev THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'developer'::app_role)
    ON CONFLICT DO NOTHING;
  ELSIF _is_teacher THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Backfill existing teacher profiles
UPDATE public.profiles p
SET is_teacher = true
FROM auth.users u
WHERE p.user_id = u.id
  AND lower(u.email) LIKE '%@professor.edu.pi.gov.br'
  AND p.is_teacher = false;
