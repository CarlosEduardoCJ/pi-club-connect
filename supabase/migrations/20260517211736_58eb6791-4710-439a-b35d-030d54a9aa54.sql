-- Drop custom storage policies referencing the avatars bucket
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (policyname ILIKE '%avatar%' OR qual::text ILIKE '%avatars%' OR with_check::text ILIKE '%avatars%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Reset avatar fields that still point to an uploaded image URL
UPDATE public.profiles
SET avatar = NULL
WHERE avatar IS NOT NULL AND avatar ~* '^https?://';
