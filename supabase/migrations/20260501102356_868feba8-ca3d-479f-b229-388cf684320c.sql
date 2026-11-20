-- Sales inquiries from companies interested in the enterprise product
CREATE TABLE public.sales_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  company_size TEXT,
  role TEXT,
  message TEXT,
  inquiry_type TEXT NOT NULL DEFAULT 'sales' CHECK (inquiry_type IN ('pilot','demo','sales')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed')),
  source TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_inquiries_status ON public.sales_inquiries(status, created_at DESC);

ALTER TABLE public.sales_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can submit an inquiry
CREATE POLICY "Anyone can submit sales inquiry"
  ON public.sales_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only platform admins can view inquiries (uses existing has_role function)
CREATE POLICY "Admins can view sales inquiries"
  ON public.sales_inquiries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sales inquiries"
  ON public.sales_inquiries FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
CREATE TRIGGER update_sales_inquiries_updated_at
  BEFORE UPDATE ON public.sales_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();