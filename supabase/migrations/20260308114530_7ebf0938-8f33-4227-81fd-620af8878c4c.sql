
-- Organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Org members table (role-based)
CREATE TABLE public.org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  email TEXT,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'deactivated')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(org_id, user_id),
  UNIQUE(org_id, email)
);

-- Enterprise invite tokens
CREATE TABLE public.org_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their org"
  ON public.organizations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

CREATE POLICY "Admins can update their org"
  ON public.organizations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
        AND om.status = 'active'
    )
  );

CREATE POLICY "Authenticated users can create orgs"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view teams"
  ON public.teams FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = teams.org_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

CREATE POLICY "Admins and managers can manage teams"
  ON public.teams FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = teams.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Admins can update teams"
  ON public.teams FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = teams.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Admins can delete teams"
  ON public.teams FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = teams.org_id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
        AND om.status = 'active'
    )
  );

-- RLS on org_members
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view other members"
  ON public.org_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om2
      WHERE om2.org_id = org_members.org_id
        AND om2.user_id = auth.uid()
        AND om2.status = 'active'
    )
  );

CREATE POLICY "Admins can insert members"
  ON public.org_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = org_members.org_id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
        AND om.status = 'active'
    )
    OR NOT EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = org_members.org_id
    )
  );

CREATE POLICY "Admins can update members"
  ON public.org_members FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = org_members.org_id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
        AND om.status = 'active'
    )
  );

CREATE POLICY "Admins can delete members"
  ON public.org_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = org_members.org_id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
        AND om.status = 'active'
    )
  );

-- RLS on org_invites
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invites"
  ON public.org_invites FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = org_invites.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'manager')
        AND om.status = 'active'
    )
  );

CREATE POLICY "Admins can create invites"
  ON public.org_invites FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id = org_invites.org_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'manager')
        AND om.status = 'active'
    )
  );

-- Updated at trigger for organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
