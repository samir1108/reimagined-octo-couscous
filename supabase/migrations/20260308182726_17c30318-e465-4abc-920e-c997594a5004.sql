
CREATE TABLE public.waitlist_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text NOT NULL DEFAULT 'enterprise',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email, source)
);

ALTER TABLE public.waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Anyone can submit their email (public insert)
CREATE POLICY "Anyone can submit waitlist email"
  ON public.waitlist_emails FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins view waitlist"
  ON public.waitlist_emails FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- Only admins can delete
CREATE POLICY "Admins delete waitlist"
  ON public.waitlist_emails FOR DELETE
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));
