-- Personalization Engine foundation tables (Phase 1-4 of the ConsciousOS personalization vision).
-- All tables are per-user, RLS-protected. IDs are client-generated (uuid-ish) text.

create table if not exists public.user_goals (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  goal text not null,
  life_domain text,
  source text not null default 'user_shared',
  confidence numeric not null default 0.5,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_goals enable row level security;
drop policy if exists "own user_goals read" on public.user_goals;
drop policy if exists "own user_goals write" on public.user_goals;
create policy "own user_goals read" on public.user_goals for select using (auth.uid() = user_id);
create policy "own user_goals write" on public.user_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists user_goals_user_idx on public.user_goals (user_id, updated_at desc);

create table if not exists public.user_patterns (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  trigger text not null,
  reaction text not null,
  underlying_concern text,
  typical_response text,
  desired_response text,
  evidence_count integer not null default 1,
  source text not null default 'tentative_inference',
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_patterns enable row level security;
drop policy if exists "own user_patterns read" on public.user_patterns;
drop policy if exists "own user_patterns write" on public.user_patterns;
create policy "own user_patterns read" on public.user_patterns for select using (auth.uid() = user_id);
create policy "own user_patterns write" on public.user_patterns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists user_patterns_user_idx on public.user_patterns (user_id, updated_at desc);

create table if not exists public.open_threads (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  origin_goal_id text,
  origin_observation_id text,
  status text not null default 'open',
  depth_mode text not null default 'arrive',
  sessions_count integer not null default 0,
  last_explored_at timestamptz,
  resolution_note text,
  source text not null default 'tentative_inference',
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.open_threads enable row level security;
drop policy if exists "own open_threads read" on public.open_threads;
drop policy if exists "own open_threads write" on public.open_threads;
create policy "own open_threads read" on public.open_threads for select using (auth.uid() = user_id);
create policy "own open_threads write" on public.open_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists open_threads_user_idx on public.open_threads (user_id, updated_at desc);

create table if not exists public.session_observations (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id text,
  thread_id text,
  observation text not null,
  confirmed boolean not null default false,
  source text not null default 'tentative_inference',
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now()
);
alter table public.session_observations enable row level security;
drop policy if exists "own session_observations read" on public.session_observations;
drop policy if exists "own session_observations write" on public.session_observations;
create policy "own session_observations read" on public.session_observations for select using (auth.uid() = user_id);
create policy "own session_observations write" on public.session_observations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists session_observations_user_idx on public.session_observations (user_id, created_at desc);

create table if not exists public.session_feedback (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id text,
  relevant boolean not null default true,
  helpful boolean not null default true,
  difficult boolean not null default false,
  unwanted boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);
alter table public.session_feedback enable row level security;
drop policy if exists "own session_feedback read" on public.session_feedback;
drop policy if exists "own session_feedback write" on public.session_feedback;
create policy "own session_feedback read" on public.session_feedback for select using (auth.uid() = user_id);
create policy "own session_feedback write" on public.session_feedback for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists session_feedback_user_idx on public.session_feedback (user_id, created_at desc);

create table if not exists public.living_experiments (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  thread_id text,
  session_id text,
  action text not null,
  observation_prompt text not null,
  outcome text not null default 'unknown',
  outcome_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.living_experiments enable row level security;
drop policy if exists "own living_experiments read" on public.living_experiments;
drop policy if exists "own living_experiments write" on public.living_experiments;
create policy "own living_experiments read" on public.living_experiments for select using (auth.uid() = user_id);
create policy "own living_experiments write" on public.living_experiments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists living_experiments_user_idx on public.living_experiments (user_id, created_at desc);

create table if not exists public.personalization_events (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.personalization_events enable row level security;
drop policy if exists "own personalization_events read" on public.personalization_events;
drop policy if exists "own personalization_events write" on public.personalization_events;
create policy "own personalization_events read" on public.personalization_events for select using (auth.uid() = user_id);
create policy "own personalization_events write" on public.personalization_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists personalization_events_user_idx on public.personalization_events (user_id, created_at desc);
\n\n-- Increment thread exploration count\ncreate or replace function public.increment_thread_exploration(p_thread_id text)\nreturns void\nlanguage plpgsql\nsecurity definer\nas \$\$\nbegin\n  update public.open_threads\n  set sessions_count = coalesce(sessions_count, 0) + 1,\n      last_explored_at = now(),\n      updated_at = now()\n  where id = p_thread_id;\nend;\n\$\$;\ngrant execute on function public.increment_thread_exploration(text) to authenticated, service_role;
