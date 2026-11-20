
-- 1. community_observations
CREATE TABLE public.community_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  display_mode text NOT NULL DEFAULT 'anonymous',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated reads observations"
  ON public.community_observations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users insert own observations"
  ON public.community_observations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own observations"
  ON public.community_observations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 2. community_reactions
CREATE TABLE public.community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL REFERENCES public.community_observations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL DEFAULT 'acknowledged',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(observation_id, user_id, reaction_type)
);

ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated reads reactions"
  ON public.community_reactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users insert own reactions"
  ON public.community_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own reactions"
  ON public.community_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 3. journey_groups
CREATE TABLE public.journey_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'awareness_challenge',
  max_members integer NOT NULL DEFAULT 30,
  duration_days integer NOT NULL DEFAULT 30,
  starts_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journey_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated reads groups"
  ON public.journey_groups FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users create groups"
  ON public.journey_groups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 4. journey_group_members
CREATE TABLE public.journey_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.journey_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.journey_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view group members"
  ON public.journey_group_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users join groups"
  ON public.journey_group_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users leave groups"
  ON public.journey_group_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. witness_circles
CREATE TABLE public.witness_circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  max_members integer NOT NULL DEFAULT 10,
  schedule jsonb NOT NULL DEFAULT '{}'::jsonb,
  next_session_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.witness_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated reads circles"
  ON public.witness_circles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users create circles"
  ON public.witness_circles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 6. witness_circle_members
CREATE TABLE public.witness_circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.witness_circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

ALTER TABLE public.witness_circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated reads circle members"
  ON public.witness_circle_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users join circles"
  ON public.witness_circle_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users leave circles"
  ON public.witness_circle_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 7. collective_meditations
CREATE TABLE public.collective_meditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'silent_sit',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'upcoming',
  participant_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collective_meditations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated reads meditations"
  ON public.collective_meditations FOR SELECT TO authenticated
  USING (true);

-- 8. collective_meditation_participants
CREATE TABLE public.collective_meditation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meditation_id uuid NOT NULL REFERENCES public.collective_meditations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(meditation_id, user_id)
);

ALTER TABLE public.collective_meditation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated reads participants"
  ON public.collective_meditation_participants FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users join meditations"
  ON public.collective_meditation_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users leave meditations"
  ON public.collective_meditation_participants FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for awareness wall
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_observations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reactions;
