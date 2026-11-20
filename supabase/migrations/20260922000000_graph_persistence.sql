-- Graph persistence tables
-- Multi-user graph overlay + node/edge provenance

create table if not exists public.graph_nodes (
  id text primary key,
  type text not null,
  label text not null,
  uri text not null,
  data jsonb not null default '{}'::jsonb,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.graph_edges (
  id text primary key,
  type text not null,
  "from" text not null references public.graph_nodes(id) on delete cascade,
  "to" text not null references public.graph_nodes(id) on delete cascade,
  weight double precision not null default 1.0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_graph_overlay (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  overlay_type text not null,
  node_id text references public.graph_nodes(id) on delete cascade,
  edge_id text references public.graph_edges(id) on delete cascade,
  weight double precision not null default 1.0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_graph_edges_from on public.graph_edges("from");
create index if not exists idx_graph_edges_to on public.graph_edges("to");
create index if not exists idx_graph_edges_type on public.graph_edges(type);
create index if not exists idx_user_graph_overlay_user on public.user_graph_overlay(user_id);
create index if not exists idx_user_graph_overlay_node on public.user_graph_overlay(node_id);

alter table public.graph_nodes enable row level security;
alter table public.graph_edges enable row level security;
alter table public.user_graph_overlay enable row level security;

create policy "graph_nodes_select_public" on public.graph_nodes
  for select using (true);

create policy "graph_edges_select_public" on public.graph_edges
  for select using (true);

create policy "user_graph_overlay_self" on public.user_graph_overlay
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select on public.graph_nodes to anon, authenticated;
grant select on public.graph_edges to anon, authenticated;
grant all on public.user_graph_overlay to authenticated;
