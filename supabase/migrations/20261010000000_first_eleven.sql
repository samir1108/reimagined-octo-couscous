-- The First Eleven (Gate 2) — progress table
-- One row per user: local-first draft in the client, synced here.
create table if not exists public.first_eleven_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_session int not null default 1 check (current_session between 1 and 11),
  completed_sessions int[] not null default '{}',
  answers jsonb not null default '[]'::jsonb,
  carry_seeds jsonb not null default '{}'::jsonb,
  skipped boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.first_eleven_progress enable row level security;

drop policy if exists "own first eleven progress read" on public.first_eleven_progress;
drop policy if exists "own first eleven progress write" on public.first_eleven_progress;
create policy "own first eleven progress read" on public.first_eleven_progress
  for select using (auth.uid() = user_id);
create policy "own first eleven progress write" on public.first_eleven_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists first_eleven_progress_updated_idx
  on public.first_eleven_progress (updated_at desc);
