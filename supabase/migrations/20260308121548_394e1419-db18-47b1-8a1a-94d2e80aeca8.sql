
-- Enterprise notifications table
CREATE TABLE public.enterprise_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid, -- target user (admin/manager who should see it)
  type text NOT NULL DEFAULT 'milestone',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  severity text NOT NULL DEFAULT 'info',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enterprise_notifications ENABLE ROW LEVEL SECURITY;

-- Policies: org admins/managers can view their org's notifications
CREATE POLICY "Org admins view enterprise notifications"
  ON public.enterprise_notifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.org_id = enterprise_notifications.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Org admins update enterprise notifications"
  ON public.enterprise_notifications FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.org_id = enterprise_notifications.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Service inserts enterprise notifications"
  ON public.enterprise_notifications FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.org_id = enterprise_notifications.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'manager')
        AND om.status = 'active'
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.enterprise_notifications;

-- Index for fast org lookups
CREATE INDEX idx_enterprise_notifications_org ON public.enterprise_notifications(org_id, created_at DESC);
CREATE INDEX idx_enterprise_notifications_read ON public.enterprise_notifications(org_id, read) WHERE read = false;
