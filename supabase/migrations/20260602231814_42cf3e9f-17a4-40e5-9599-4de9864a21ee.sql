-- Schools table
CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.schools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schools are viewable by everyone"
  ON public.schools FOR SELECT USING (true);

CREATE POLICY "Admins can insert schools"
  ON public.schools FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update schools"
  ON public.schools FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete schools"
  ON public.schools FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.schools (name) VALUES ('CETI Manoel Ricardo');

-- Profiles: school field
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school text NOT NULL DEFAULT 'CETI Manoel Ricardo';

UPDATE public.profiles SET school = 'CETI Manoel Ricardo' WHERE school IS NULL OR school = '';

-- Update handle_new_user to capture school
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _email text;
  _school text;
BEGIN
  _email := lower(NEW.email);

  IF _email IS NULL OR (
    _email NOT LIKE '%@aluno.edu.pi.gov.br'
    AND _email NOT LIKE '%@professor.edu.pi.gov.br'
  ) THEN
    RAISE EXCEPTION 'Apenas e-mails institucionais da Seduc-PI são permitidos.'
      USING ERRCODE = 'check_violation';
  END IF;

  _school := COALESCE(NULLIF(NEW.raw_user_meta_data->>'school', ''), 'CETI Manoel Ricardo');

  INSERT INTO public.profiles (id, user_id, name, username, school)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    _school
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