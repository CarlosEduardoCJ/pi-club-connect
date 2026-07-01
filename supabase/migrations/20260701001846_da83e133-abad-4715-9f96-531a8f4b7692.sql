
ALTER TABLE public.posts ALTER COLUMN club_id DROP NOT NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS school TEXT;

-- Backfill school for existing posts based on the club's school
UPDATE public.posts p
SET school = c.school
FROM public.clubs c
WHERE p.club_id = c.id AND p.school IS NULL;

-- Trigger to auto-fill school on insert
CREATE OR REPLACE FUNCTION public.set_post_school()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.school IS NULL THEN
    IF NEW.club_id IS NOT NULL THEN
      SELECT school INTO NEW.school FROM public.clubs WHERE id = NEW.club_id;
    END IF;
    IF NEW.school IS NULL THEN
      SELECT school INTO NEW.school FROM public.profiles WHERE id = NEW.author_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_post_school ON public.posts;
CREATE TRIGGER trg_set_post_school
BEFORE INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.set_post_school();

-- Update admin RLS policies to also cover school-wide posts (club_id null)
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
CREATE POLICY "Admins can delete posts" ON public.posts
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    (club_id IS NOT NULL AND EXISTS (SELECT 1 FROM clubs c WHERE c.id = posts.club_id AND c.school = current_user_school()))
    OR (club_id IS NULL AND posts.school = current_user_school())
  )
);

DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
CREATE POLICY "Admins can update posts" ON public.posts
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    (club_id IS NOT NULL AND EXISTS (SELECT 1 FROM clubs c WHERE c.id = posts.club_id AND c.school = current_user_school()))
    OR (club_id IS NULL AND posts.school = current_user_school())
  )
);
