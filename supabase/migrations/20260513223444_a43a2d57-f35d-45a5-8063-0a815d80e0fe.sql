CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IS NULL OR lower(NEW.email) NOT LIKE '%@aluno.edu.pi.gov.br' THEN
    RAISE EXCEPTION 'Apenas e-mails institucionais @aluno.edu.pi.gov.br são permitidos.'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.profiles (id, user_id, name, username)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$function$;