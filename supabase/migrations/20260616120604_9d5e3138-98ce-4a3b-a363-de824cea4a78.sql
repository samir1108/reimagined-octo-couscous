
-- 1. Affirmation audio: restrict INSERT to service_role
DROP POLICY IF EXISTS "Service inserts affirmation audio" ON storage.objects;
CREATE POLICY "Service inserts affirmation audio"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'affirmation-audio');

-- 2. org_members: remove self-bootstrap NOT EXISTS bypass
DROP POLICY IF EXISTS "Admins can insert members" ON public.org_members;
CREATE POLICY "Admins can insert members"
ON public.org_members FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin(auth.uid(), org_id));

-- 3. feature_flags: only admins read
DROP POLICY IF EXISTS "Anyone reads flags" ON public.feature_flags;

-- 4. org-logos: scope admin write ops to their own org via path
DROP POLICY IF EXISTS "Admins upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete logos" ON storage.objects;

CREATE POLICY "Admins upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'org-logos'
  AND EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
      AND om.status = 'active'
      AND om.org_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Admins manage logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'org-logos'
  AND EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
      AND om.status = 'active'
      AND om.org_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Admins delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'org-logos'
  AND EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
      AND om.status = 'active'
      AND om.org_id::text = (storage.foldername(name))[1]
  )
);
