
-- 1. Create org_activity_log table for activity feed
CREATE TABLE public.org_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id uuid,
  event_type text NOT NULL DEFAULT 'milestone',
  title text NOT NULL,
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.org_activity_log ENABLE ROW LEVEL SECURITY;

-- Org members can view activity for their org
CREATE POLICY "Org members view activity" ON public.org_activity_log
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM org_members om
    WHERE om.org_id = org_activity_log.org_id
    AND om.user_id = auth.uid()
    AND om.status = 'active'
  ));

-- Admins/managers can insert activity
CREATE POLICY "Admins insert activity" ON public.org_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM org_members om
    WHERE om.org_id = org_activity_log.org_id
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'manager')
    AND om.status = 'active'
  ));

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.org_activity_log;

-- 2. Create function to auto-accept invites on user signup
CREATE OR REPLACE FUNCTION public.handle_invite_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Find pending org_members rows matching this user's email and activate them
  UPDATE public.org_members
  SET user_id = NEW.id,
      status = 'active',
      joined_at = now()
  WHERE email = NEW.email
    AND status = 'invited'
    AND user_id IS NULL;

  -- Mark matching invites as accepted
  UPDATE public.org_invites
  SET accepted_at = now()
  WHERE email = NEW.email
    AND accepted_at IS NULL;

  RETURN NEW;
END;
$$;

-- 3. Create storage bucket for org logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-logos', 'org-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: anyone can view public logos
CREATE POLICY "Public logo access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'org-logos');

-- Admins can upload logos for their org
CREATE POLICY "Admins upload logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'org-logos'
    AND EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
      AND om.status = 'active'
    )
  );

-- Admins can update/delete logos
CREATE POLICY "Admins manage logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'org-logos'
    AND EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
      AND om.status = 'active'
    )
  );

CREATE POLICY "Admins delete logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'org-logos'
    AND EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.user_id = auth.uid()
      AND om.role = 'admin'
      AND om.status = 'active'
    )
  );
