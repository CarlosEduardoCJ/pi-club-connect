-- Tabela de presença em eventos
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, profile_id)
);

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendees viewable by everyone"
ON public.event_attendees FOR SELECT
USING (true);

CREATE POLICY "Users can confirm attendance"
ON public.event_attendees FOR INSERT TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can cancel own attendance"
ON public.event_attendees FOR DELETE TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Trigger para manter events.attendees_count em sincronia
CREATE OR REPLACE FUNCTION public.update_event_attendees_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events SET attendees_count = (
      SELECT count(*) FROM event_attendees WHERE event_id = NEW.event_id
    ) WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events SET attendees_count = (
      SELECT count(*) FROM event_attendees WHERE event_id = OLD.event_id
    ) WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER event_attendees_count_trigger
AFTER INSERT OR DELETE ON public.event_attendees
FOR EACH ROW EXECUTE FUNCTION public.update_event_attendees_count();