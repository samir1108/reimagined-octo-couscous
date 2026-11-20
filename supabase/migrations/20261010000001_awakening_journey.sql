-- THE AWAKENING JOURNEY — progress table
-- One row per user: local-first draft in the client, synced here.
-- The eleven sessions of the first journey, in the user's personal order.
create table if not exists public.awakening_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_session_id text not null default 'meet_the_observer',
  completed_session_ids text[] not null default '{}',
  answers jsonb not null default '[]'::jsonb,
  vows jsonb not null default '{}'::jsonb,
  vow_results jsonb not null default '{}'::jsonb,
  carry_seeds jsonb not null default '{}'::jsonb,
  session_order text[] not null default '{}',
  goal text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.awakening_progress enable row level security;

drop policy if exists "own awakening progress read" on public.awakening_progress;
drop policy if exists "own awakening progress write" on public.awakening_progress;
create policy "own awakening progress read" on public.awakening_progress
  for select using (auth.uid() = user_id);
create policy "own awakening progress write" on public.awakening_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists awakening_progress_updated_idx
  on public.awakening_progress (updated_at desc);
