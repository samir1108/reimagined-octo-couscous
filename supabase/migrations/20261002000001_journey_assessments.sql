-- journey_assessments: stores results of the 30-60 min cinematic personalisation journey
-- Run this migration after the core schema is deployed.

create table if not exists public.journey_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  overall_band numeric(4,2) not null default 0,
  dimension_bands jsonb not null default '{}'::jsonb,
  v_level_baseline numeric(4,2) not null default 0,
  v_level_current numeric(4,2) not null default 0,
  v_level_delta numeric(4,2) not null default 0,
  integration_score numeric(4,2) not null default 0,
  witness_gap numeric(4,2) not null default 0,
  witness_stability numeric(4,2) not null default 0,
  witness_depth numeric(4,2) not null default 0,
  dominant_brain text not null default 'head',
  path_scores jsonb not null default '{}'::jsonb,
  primary_path text not null default 'dhyana',
  secondary_path text not null default 'bhakti',
  archetype_primary text not null default 'seeker',
  archetype_shadow text not null default 'warrior',
  top_loops text[] not null default '{}',
  loop_families text[] not null default '{}',
  belief_level text not null default 'mixed',
  attachment_style text not null default 'mixed',
  circadian_peak text not null default 'evening',
  emotion_maturity numeric(4,2) not null default 5,
  somatic_awareness numeric(4,2) not null default 5,
  purpose_clarity numeric(4,2) not null default 5,
  critic_volume numeric(4,2) not null default 5,
  shadow_owned numeric(4,2) not null default 3,
  chitta_vritti numeric(4,2) not null default 4,
  app_relationship text not null default 'new',
  h_capacities jsonb not null default '{}'::jsonb,
  raw_answers jsonb not null default '[]'::jsonb,
  question_count int not null default 0
);

create index if not exists journey_assessments_user_id_idx
  on public.journey_assessments (user_id);

create index if not exists journey_assessments_completed_at_idx
  on public.journey_assessments (completed_at desc);

alter table public.journey_assessments enable row level security;

create policy "Users view own journey"
  on public.journey_assessments for select
  using (auth.uid() = user_id);

create policy "Users insert own journey"
  on public.journey_assessments for insert
  with check (auth.uid() = user_id);

create policy "Users update own journey"
  on public.journey_assessments for update
  using (auth.uid() = user_id);
