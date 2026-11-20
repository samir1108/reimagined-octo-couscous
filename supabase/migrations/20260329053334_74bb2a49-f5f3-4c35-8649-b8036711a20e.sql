INSERT INTO storage.buckets (id, name, public)
VALUES ('affirmation-audio', 'affirmation-audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read affirmation audio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'affirmation-audio');

CREATE POLICY "Service inserts affirmation audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'affirmation-audio');