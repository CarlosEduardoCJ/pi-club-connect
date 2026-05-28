
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _email text;
BEGIN
  _email := lower(NEW.email);

  IF _email IS NULL OR (
    _email NOT LIKE '%@aluno.edu.pi.gov.br'
    AND _email NOT LIKE '%@professor.edu.pi.gov.br'
  ) THEN
    RAISE EXCEPTION 'Apenas e-mails institucionais da Seduc-PI são permitidos.'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.profiles (id, user_id, name, username)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );

  IF _email LIKE '%@professor.edu.pi.gov.br' THEN
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
