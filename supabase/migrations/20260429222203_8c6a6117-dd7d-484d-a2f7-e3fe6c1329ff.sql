-- Tabela de competições acadêmicas
CREATE TABLE public.competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT 'Online',
  status TEXT NOT NULL DEFAULT 'open',
  registration_deadline TIMESTAMP WITH TIME ZONE,
  registrants_count INTEGER NOT NULL DEFAULT 0,
  club_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Competitions viewable by everyone" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Admins can insert competitions" ON public.competitions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update competitions" ON public.competitions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete competitions" ON public.competitions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Inscrições em competições
CREATE TABLE public.competition_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (competition_id, profile_id)
);

ALTER TABLE public.competition_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registrations viewable by everyone" ON public.competition_registrations FOR SELECT USING (true);
CREATE POLICY "Users can register" ON public.competition_registrations FOR INSERT TO authenticated WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can cancel own registration" ON public.competition_registrations FOR DELETE TO authenticated USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Trigger de contagem
CREATE OR REPLACE FUNCTION public.update_competition_registrants_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE competitions SET registrants_count = (SELECT count(*) FROM competition_registrations WHERE competition_id = NEW.competition_id) WHERE id = NEW.competition_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE competitions SET registrants_count = (SELECT count(*) FROM competition_registrations WHERE competition_id = OLD.competition_id) WHERE id = OLD.competition_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER competition_registrations_count_trigger
AFTER INSERT OR DELETE ON public.competition_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_competition_registrants_count();

-- Dados de exemplo
INSERT INTO public.competitions (name, description, date, time, location, status, registration_deadline) VALUES
('OBMEP 2026', 'Olimpíada Brasileira de Matemática das Escolas Públicas. Prove seu talento matemático!', '2026-06-04', '09:00', 'Auditório Principal', 'open', '2026-05-15 23:59:00+00'),
('Olimpíada Brasileira de Física', 'Competição nacional para estudantes do ensino médio interessados em física.', '2026-05-20', '14:00', 'Online', 'open', '2026-05-01 23:59:00+00'),
('OBA - Astronomia', 'Olimpíada Brasileira de Astronomia e Astronáutica.', '2026-05-15', '08:00', 'Sala 12', 'open', '2026-04-30 23:59:00+00'),
('Olimpíada de Química', 'Desafios químicos para alunos do ensino médio.', '2026-07-10', '10:00', 'Laboratório de Química', 'open', '2026-06-20 23:59:00+00'),
('Olimpíada Nacional de Ciências', 'Biologia, Física e Química em uma única competição.', '2026-08-05', '13:00', 'Online', 'open', '2026-07-15 23:59:00+00');