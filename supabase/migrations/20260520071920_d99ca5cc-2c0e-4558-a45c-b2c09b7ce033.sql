
-- Storage bucket for practice voice recordings (private)
insert into storage.buckets (id, name, public)
values ('practice-recordings', 'practice-recordings', false)
on conflict (id) do nothing;

-- Users can read/write only their own folder ({user_id}/...)
create policy "users read own practice recordings"
on storage.objects for select to authenticated
using (bucket_id = 'practice-recordings' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users upload own practice recordings"
on storage.objects for insert to authenticated
with check (bucket_id = 'practice-recordings' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users delete own practice recordings"
on storage.objects for delete to authenticated
using (bucket_id = 'practice-recordings' and auth.uid()::text = (storage.foldername(name))[1]);

-- Table that stores transcript + pointer to the audio file
create table public.practice_voice_recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  practice_id text not null,
  guru_id text,
  step_idx int,
  transcript text,
  audio_path text not null,
  duration_ms int,
  provider text default 'deepgram',
  created_at timestamptz not null default now()
);

alter table public.practice_voice_recordings enable row level security;

create policy "users view own voice recordings"
on public.practice_voice_recordings for select
using (auth.uid() = user_id);

create policy "users insert own voice recordings"
on public.practice_voice_recordings for insert
with check (auth.uid() = user_id);

create policy "users delete own voice recordings"
on public.practice_voice_recordings for delete
using (auth.uid() = user_id);

create index idx_practice_voice_user on public.practice_voice_recordings(user_id, created_at desc);
