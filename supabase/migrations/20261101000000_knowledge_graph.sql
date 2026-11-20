-- ConsciousOS Knowledge Graph schema
-- Canonical knowledge + personal knowledge + sources/claims + temporal history

create extension if not exists vector;
create extension if not exists pg_trgm;

create table if not exists public.knowledge_domains (
  id text primary key,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_nodes (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  node_type text not null,
  domain text not null references public.knowledge_domains(id),
  aliases text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768),
  source_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_edges (
  id text primary key,
  source_node_id text not null references public.knowledge_nodes(id) on delete cascade,
  target_node_id text not null references public.knowledge_nodes(id) on delete cascade,
  relationship_type text not null,
  weight double precision not null default 1.0,
  confidence double precision not null default 1.0,
  metadata jsonb not null default '{}'::jsonb,
  source_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_sources (
  id text primary key,
  title text not null,
  author text,
  tradition text,
  source_type text not null,
  url text,
  publication_year integer,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_claims (
  id text primary key,
  subject_node_id text not null references public.knowledge_nodes(id) on delete cascade,
  predicate text not null,
  object_node_id text not null references public.knowledge_nodes(id) on delete cascade,
  source_id text references public.knowledge_sources(id) on delete set null,
  evidence_type text not null,
  confidence double precision not null default 1.0,
  created_at timestamptz not null default now()
);

-- Personal graph (user-specific), with temporal history preserved
create table if not exists public.user_knowledge_nodes (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  knowledge_node_id text references public.knowledge_nodes(id) on delete set null,
  node_type text not null,
  label text not null,
  provenance text not null default 'inferred',
  confidence double precision not null default 0.5,
  state jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  first_observed_at timestamptz not null default now(),
  last_observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_knowledge_edges (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_node_id uuid not null references public.user_knowledge_nodes(id) on delete cascade,
  target_node_id uuid not null references public.user_knowledge_nodes(id) on delete cascade,
  relationship_type text not null,
  provenance text not null default 'inferred',
  confidence double precision not null default 0.5,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Temporal history of personal observations (never overwrite)
create table if not exists public.user_knowledge_observations (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_node_id uuid references public.user_knowledge_nodes(id) on delete cascade,
  knowledge_node_id text references public.knowledge_nodes(id) on delete set null,
  observation_type text not null,
  value jsonb not null default '{}'::jsonb,
  provenance text not null default 'reported',
  confidence double precision not null default 0.5,
  observed_at timestamptz not null default now()
);

create index if not exists idx_knowledge_nodes_domain on public.knowledge_nodes(domain);
create index if not exists idx_knowledge_nodes_type on public.knowledge_nodes(node_type);
create index if not exists idx_knowledge_nodes_name_trgm on public.knowledge_nodes using gin (name gin_trgm_ops);
create index if not exists idx_knowledge_edges_source on public.knowledge_edges(source_node_id);
create index if not exists idx_knowledge_edges_target on public.knowledge_edges(target_node_id);
create index if not exists idx_knowledge_edges_type on public.knowledge_edges(relationship_type);
create index if not exists idx_user_knowledge_nodes_user on public.user_knowledge_nodes(user_id);
create index if not exists idx_user_knowledge_nodes_knowledge on public.user_knowledge_nodes(knowledge_node_id);
create index if not exists idx_user_knowledge_edges_user on public.user_knowledge_edges(user_id);
create index if not exists idx_user_knowledge_obs_user on public.user_knowledge_observations(user_id);
create index if not exists idx_user_knowledge_obs_node on public.user_knowledge_observations(knowledge_node_id);

alter table public.knowledge_domains enable row level security;
alter table public.knowledge_nodes enable row level security;
alter table public.knowledge_edges enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_claims enable row level security;
alter table public.user_knowledge_nodes enable row level security;
alter table public.user_knowledge_edges enable row level security;
alter table public.user_knowledge_observations enable row level security;

create policy "knowledge_domains_public_read" on public.knowledge_domains for select using (true);
create policy "knowledge_nodes_public_read" on public.knowledge_nodes for select using (true);
create policy "knowledge_edges_public_read" on public.knowledge_edges for select using (true);
create policy "knowledge_sources_public_read" on public.knowledge_sources for select using (true);
create policy "knowledge_claims_public_read" on public.knowledge_claims for select using (true);

create policy "user_knowledge_nodes_self" on public.user_knowledge_nodes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_knowledge_edges_self" on public.user_knowledge_edges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_knowledge_obs_self" on public.user_knowledge_observations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select on public.knowledge_domains to anon, authenticated;
grant select on public.knowledge_nodes to anon, authenticated;
grant select on public.knowledge_edges to anon, authenticated;
grant select on public.knowledge_sources to anon, authenticated;
grant select on public.knowledge_claims to anon, authenticated;
grant all on public.user_knowledge_nodes to authenticated;
grant all on public.user_knowledge_edges to authenticated;
grant all on public.user_knowledge_observations to authenticated;

-- Admin write policies for canonical knowledge (adjust role check as needed)
create policy "knowledge_nodes_admin_write" on public.knowledge_nodes for all using (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
);
create policy "knowledge_edges_admin_write" on public.knowledge_edges for all using (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
);
