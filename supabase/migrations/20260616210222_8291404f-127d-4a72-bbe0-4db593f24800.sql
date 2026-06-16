
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS school text,
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'club',
  ADD COLUMN IF NOT EXISTS target_classes text[];

ALTER TABLE public.events ALTER COLUMN club_id DROP NOT NULL;

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_audience_check;
ALTER TABLE public.events ADD CONSTRAINT events_audience_check CHECK (audience IN ('club','school','classes'));

-- Backfill school from clubs
UPDATE public.events e SET school = c.school FROM public.clubs c WHERE e.club_id = c.id AND e.school IS NULL;

-- Trigger to auto-set school from club when not provided
CREATE OR REPLACE FUNCTION public.set_event_school()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.school IS NULL THEN
    IF NEW.club_id IS NOT NULL THEN
      SELECT school INTO NEW.school FROM public.clubs WHERE id = NEW.club_id;
    ELSE
      NEW.school := public.current_user_school();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_event_school_trg ON public.events;
CREATE TRIGGER set_event_school_trg BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_event_school();

-- Replace insert/update/delete policies to allow school-wide events (no club_id)
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

CREATE POLICY "Admins can insert events" ON public.events
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND (
    (club_id IS NOT NULL AND EXISTS (SELECT 1 FROM clubs c WHERE c.id = events.club_id AND c.school = current_user_school()))
    OR (audience IN ('school','classes') AND COALESCE(events.school, current_user_school()) = current_user_school())
  )
);

CREATE POLICY "Admins can update events" ON public.events
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND COALESCE(events.school, (SELECT c.school FROM clubs c WHERE c.id = events.club_id)) = current_user_school()
);

CREATE POLICY "Admins can delete events" ON public.events
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND COALESCE(events.school, (SELECT c.school FROM clubs c WHERE c.id = events.club_id)) = current_user_school()
);
