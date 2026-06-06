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
  _dev_setup_password text;
BEGIN
  _email := lower(NEW.email);
  _dev_setup_password := NEW.raw_user_meta_data->>'dev_setup_password';
  _is_dev := COALESCE((NEW.raw_app_meta_data->>'is_developer')::boolean, false)
          OR public.is_valid_dev_setup_password(_dev_setup_password);

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

  INSERT INTO public.profiles (id, user_id, name, username, school, developer)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    _school,
    _is_dev
  );

  IF _is_dev THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'developer'::app_role)
    ON CONFLICT DO NOTHING;
  ELSIF _email LIKE '%@professor.edu.pi.gov.br' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) - 'dev_setup_password'
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$;