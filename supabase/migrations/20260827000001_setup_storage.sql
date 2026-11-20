-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('affirmation-audio', 'affirmation-audio', true),
  ('org-logos', 'org-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop and recreate storage policies for affirmation-audio
DROP POLICY IF EXISTS "Public read affirmation audio" ON storage.objects;
CREATE POLICY "Public read affirmation audio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'affirmation-audio');

DROP POLICY IF EXISTS "Service inserts affirmation audio" ON storage.objects;
CREATE POLICY "Service inserts affirmation audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'affirmation-audio');

-- Drop and recreate storage policies for org-logos
DROP POLICY IF EXISTS "Public logo access" ON storage.objects;
CREATE POLICY "Public logo access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'org-logos');

DROP POLICY IF EXISTS "Admins upload logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'org-logos');
