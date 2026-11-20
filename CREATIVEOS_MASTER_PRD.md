# CREATIVEOS — MASTER PRODUCT REQUIREMENTS DOCUMENT

**Document ID:** COS-PRD-MASTER
**Version:** 1.0.0
**Status:** Build-ready specification
**Supersedes:** `CREATIVEOS_PRD.md` (summary edition, 96 lines) — that file remains the executive summary.
**Audience:** AI coding agents, human engineers, designers, product owners.

> This is the single source of truth an AI agent must follow to build CreativeOS.
> Every requirement in this document is normative unless marked `[FUTURE]` or `[OPTIONAL]`.
> Where this document and any other project document disagree, this document wins.

---

## 0. HOW AN AI AGENT MUST USE THIS DOCUMENT

0.1 Read Sections 1–10 before writing any code.
0.2 Read Section 11 (data model) before creating any table, type, or migration.
0.3 Read Section 12 (studio registry) before creating any studio, route, or capability.
0.4 Implement in the phase order of Section 18. Never skip a phase gate.
0.5 A feature is "done" only when it satisfies Section 19 (Definition of Done) and its row in Section 18.
0.6 Never invent a new core entity. Extend `creative_artifacts` or `assets` instead.
0.7 Never hardcode a model provider. All generation goes through the provider abstraction in Section 14.
0.8 Never let one studio mutate another studio's approved artifact. Writes are scoped and versioned (Section 13.6).
0.9 If a requirement is ambiguous, prefer the interpretation that (a) keeps the project graph canonical, (b) keeps providers replaceable, (c) keeps every artifact versioned and attributable.
0.10 Every UI surface must degrade gracefully when a provider, asset, or agent is unavailable.

---

## 1. PRODUCT VISION

1.1 CreativeOS is an **operating system for cinematic creation**, not an AI video generator.
1.2 The user enters with an idea and exits with a finished film, series, or universe — plus trailer, poster, subtitles, and deliverables.
1.3 The product must feel like **entering a studio complex**, where each discipline has its own room, tools, references, workflow, and specialist AI workforce.
1.4 The core belief: **one creative project graph, many studios**. All studios read from and write to the same versioned project data.
1.5 The three dimensions of the product:
   - **Creative Universe** — everything the user creates (worlds, stories, characters, assets, IP).
   - **Professional Studio System** — every filmmaking discipline as a first-class workspace.
   - **AI Workforce** — specialized agents that research, draft, plan, review, coordinate, and execute.
1.6 Success statement: a first-time filmmaker can produce a 12-minute cinematic sequence with consistent characters, coherent continuity, mixed audio, and a distribution-ready master, without learning a single prompt-engineering trick.

---

## 2. PRODUCT PRINCIPLES

2.1 **Intention over tooling.** The user states an intention; CreativeOS activates studios and agents.
2.2 **One graph, many views.** No duplicated truth. Every screen is a projection of the project graph.
2.3 **Everything is an artifact.** Any creative output is addressable, versioned, attributable, and reviewable.
2.4 **Continuity is a feature, not a QA afterthought.** Identity, wardrobe, lighting, geography, and timeline are enforced by the system.
2.5 **Provider independence.** Image, video, voice, music, and LLM providers are swappable adapters.
2.6 **Human approval gates.** Consequential changes require explicit approval; approvals are recorded.
2.7 **Reversible by default.** Versioning, branching, and restore exist for every artifact class.
2.8 **Cost transparency.** Every generation shows estimated and actual cost before and after execution.
2.9 **Progressive depth.** A beginner sees three buttons; a professional sees the full department.
2.10 **Composable studios.** Studios are registered modules with a shared contract; adding a studio must not require touching core.
2.11 **Accessibility and localization** are built in (captions, keyboard paths, RTL-safe layouts, i18n keys).
2.12 **No dark patterns.** No forced upsells inside creative flow; credits are visible, never hidden.

---

## 3. PERSONAS

3.1 **Solo Creator (primary).** Has an idea, no crew, limited budget. Needs guided end-to-end flow and consistency guarantees.
3.2 **Independent Filmmaker.** Has a script and a vision. Needs previs, shot plans, and generation control.
3.3 **Studio Professional.** Works inside a department. Needs depth, granular controls, exports, review cycles.
3.4 **Writer / Showrunner.** Needs story architecture, continuity across episodes, and canon management.
3.5 **Animator / VFX Artist.** Needs rigs, simulation planning, compositing review, and version comparison.
3.6 **Educator / Student.** Needs the Academy, mentor feedback, and practice studios.
3.7 **Producer.** Needs budget, schedule, approvals, and deliverables tracking.
3.8 **Brand / Agency.** Needs short-form output at volume with brand-locked assets and rights tracking.

---

## 4. PRIMARY USER JOURNEYS

4.1 **Idea → Film (golden path).**
Idea capture → Concept directions → Logline → Treatment → Screenplay → Scene breakdown → Characters → World → Visual language → Shot plan → Storyboards → Previs → Asset generation → Voice/music/SFX → Edit → Color → QC → Master → Trailer/poster → Deliverables.

4.2 **Script → Production plan.**
Upload/paste screenplay → parse scenes → extract elements → cast characters → design locations → build shot list → estimate cost/schedule.

4.3 **Existing IP → Franchise.**
Create universe → import canon → register characters/locations → link projects → enforce canon on new works.

4.4 **Shot repair.**
Select a failing shot → inspect continuity report → regenerate with locked references → compare versions → approve.

4.5 **Learn → Practice.**
Enter Academy → pick track → complete an exercise → submit to AI mentor → receive critique → apply to project.

4.6 **Deliver.**
Picture lock → conform → export masters → platform presets → QC report → delivery package.

---

## 5. PRODUCT SURFACES

5.1 **Hub** — project list, universe graph, recent activity, active jobs, credits.
5.2 **Studio Shell** — universal container for every studio (Section 13.5).
5.3 **Project Graph Explorer** — visual and list navigation of entities and dependencies.
5.4 **Asset Universe** — searchable, filterable library across all projects the user can access.
5.5 **Agent Console** — chat with agents, inspect plans, approve steps, view tool traces.
5.6 **Job Center** — generation queue, progress, retries, costs.
5.7 **Review Room** — side-by-side version comparison, annotations, approvals.
5.8 **Academy** — courses, exercises, mentor feedback.
5.9 **Settings** — providers, keys, team, billing, permissions, exports.
5.10 **Mobile companion** `[OPTIONAL]` — review, approve, monitor jobs.

---

## 6. INFORMATION ARCHITECTURE / ROUTING

```
/                                   Hub (project list)
/u/:universeId                      Universe overview + franchise tree
/u/:universeId/timeline             Universe timeline
/u/:universeId/lore                 Lore index
/p/:projectId                       Project overview (dashboard)
/p/:projectId/development           Development studio
/p/:projectId/research              Research studio
/p/:projectId/story                 Story architecture
/p/:projectId/screenplay            Screenplay editor
/p/:projectId/breakdown             Script breakdown
/p/:projectId/world                 World architect
/p/:projectId/characters            Character studio
/p/:projectId/characters/:id        Character detail
/p/:projectId/direction             Director + visual direction
/p/:projectId/cinematography        DP / camera / lens / lighting
/p/:projectId/design                Production design, sets, props, costume
/p/:projectId/storyboard            Storyboard + previs + animatic
/p/:projectId/shots                 Shot list / shot detail
/p/:projectId/generation            Image & video generation
/p/:projectId/vfx                   VFX department
/p/:projectId/animation             Animation department
/p/:projectId/sound                 Sound design
/p/:projectId/voice                 Voice / ADR / dubbing
/p/:projectId/music                 Music & composition
/p/:projectId/edit                  Editing timeline
/p/:projectId/color                 Color grading
/p/:projectId/continuity            Continuity + QC
/p/:projectId/delivery              Finishing + distribution
/p/:projectId/marketing             Trailer / poster / campaign
/p/:projectId/production            Producer / budget / schedule
/p/:projectId/academy               Project-scoped learning
/a/:projectId/:artifactId           Artifact viewer (universal)
/jobs                               Job center
/agents                             Agent console
/settings/*                         Settings
```

6.1 Route segments are stable identifiers used by agents for deep links.
6.2 Every route must support `?panel=` and `?artifactId=` deep-link state.
6.3 Every route must render a skeleton within 150 ms and real content within 1 s on a warm cache.

---

## 7. DESIGN SYSTEM REQUIREMENTS

7.1 Dark-first, cinematic palette; light theme supported. No pure black backgrounds (#000) — use `#07080B`.
7.2 Type scale: 12 / 14 / 16 / 20 / 26 / 34 / 46 / 62 px. Display face for studio titles only.
7.3 Layout grid: 12-column desktop, 8-column tablet, 4-column mobile. Studio shell uses left rail + command bar + canvas.
7.4 Motion: 120–240 ms easing; no animation longer than 400 ms except explicit cinematic previews.
7.5 Every destructive action requires confirm + undo window (10 s) unless irreversible by nature.
7.6 Every list supports keyboard navigation, `j/k`, `/` search, and `Enter` open.
7.7 Command palette (`Ctrl/Cmd+K`) exposes: navigation, agents, studio actions, asset search.
7.8 Status colors: draft=muted, in-review=amber, approved=green, locked=blue, failed=red, generating=pulsing.
7.9 All interactive elements must meet WCAG 2.2 AA contrast.
7.10 i18n: all strings via keys; no concatenated sentence fragments.

---

## 8. TECHNICAL ARCHITECTURE

8.1 **Frontend:** React + TypeScript + Vite; routing via React Router; server-state via TanStack Query; local UI state via Zustand; complex flows via XState.
8.2 **Styling:** Tailwind + component primitives (shadcn-style), no bespoke CSS-in-JS.
8.3 **Backend:** Supabase (Postgres + Auth + Storage + Realtime + Edge Functions), or self-hosted equivalent exposing the same contract.
8.4 **Database:** Postgres 15+, RLS enabled on every tenant table, migrations checked into `supabase/migrations`.
8.5 **Long jobs:** queue table + worker (Edge Function or Node worker). Jobs must be idempotent and resumable.
8.6 **AI layer:** `IntelligenceEngine` service that composes context from the project graph and dispatches to provider adapters.
8.7 **Provider adapters:** `LLMProvider`, `ImageProvider`, `VideoProvider`, `VoiceProvider`, `MusicProvider`, `SFXProvider`, `EmbeddingProvider`.
8.8 **Storage:** content-addressed objects; bucket layout in Section 11.9.
8.9 **Realtime:** Postgres changes → client subscriptions for job status, approvals, presence.
8.10 **Observability:** structured logs, per-run traces, error budget dashboards, generation cost ledger.
8.11 **Security:** least-privilege RLS, signed URLs, per-project roles, audit trail, no secrets in client bundle.
8.12 **Deployment:** web on Vercel/Netlify; workers on container host; DB on managed Postgres. Mobile shell optional via Capacitor.

---

## 9. NON-FUNCTIONAL REQUIREMENTS

9.1 **Latency:** route transitions < 200 ms warm; artifact list p95 < 400 ms; project graph query p95 < 700 ms.
9.2 **Scale:** 1M projects, 50M artifacts, 500M asset versions; per-query ≤ 200 ms at p95 with indexes.
9.3 **Availability:** 99.9% API; degraded mode when providers are down (queue + notify).
9.4 **Durability:** no loss of approved artifacts; object storage versioning on.
9.5 **Cost:** every generation records estimated and actual cost; hard monthly cap per workspace with soft warnings at 80%.
9.6 **Privacy:** user content never used to train third-party models without explicit opt-in; per-project data export and deletion within 30 days.
9.7 **Rights:** every asset stores rights metadata; consent/likeness gates block generation without authorization.
9.8 **Moderation:** content policy checks on generation input and output; fictional violence allowed within policy; real-person likeness requires consent record.
9.9 **Reliability of jobs:** exponential backoff, max 3 retries, dead-letter state visible in Job Center.
9.10 **Accessibility:** full keyboard paths, captions on all video previews, screen-reader labels on all icons.

---

## 10. GLOSSARY

- **Universe** — top-level container of canon and franchises.
- **Franchise** — a set of connected productions inside a universe.
- **Project** — one production (film, series, short, ad, game cinematic).
- **Studio** — a disciplinary workspace module registered in the studio registry.
- **Capability** — a single atomic action a studio exposes; the smallest buildable unit.
- **Artifact** — a versioned creative object produced by a studio (treatment, scene, shot plan, cue, cut).
- **Asset** — a file-backed or generated object (image, video, audio, model) with metadata and rights.
- **Agent** — a configured AI worker with a role, tools, and scope.
- **Run** — one execution of a model call with inputs, outputs, cost, and trace.
- **Gate** — a human approval checkpoint that blocks downstream work until resolved.
- **Canon** — approved, locked truth for a universe (character facts, world rules, timeline).
- **Continuity Lock** — a set of references and constraints that must hold across shots.
- **Deliverable** — a packaged output for a destination (festival, platform, client).

---

## 11. CANONICAL DATA MODEL

11.1 **Conventions (mandatory for every table).**
```
id            uuid primary key default gen_random_uuid()
created_at    timestamptz not null default now()
updated_at    timestamptz not null default now()
created_by    uuid references auth.users(id)
workspace_id  uuid not null references workspaces(id) on delete cascade
deleted_at    timestamptz null            -- soft delete only
```
11.2 All tenant tables carry `workspace_id` and an RLS policy keyed to membership.
11.3 All enums live in schema `public` with prefix `cos_`. Enum values are append-only.
11.4 No table may store generation prompts inline; prompts live in `model_runs.input_payload`.
11.5 Every `updated_at` is maintained by trigger `cos_touch_updated_at()`.

11.6 **Core enum set** (extend by migration only).
```sql
create type cos_project_type as enum (
  'social_reel','short_video','short_film','medium_film','feature_film',
  'documentary','music_video','advertisement','animated_short','animated_feature',
  'web_series','tv_series','mini_series','franchise','game_cinematic',
  'interactive_film','experimental_film');

create type cos_artifact_status as enum (
  'draft','in_review','changes_requested','approved','locked','archived');

create type cos_job_status as enum (
  'queued','running','succeeded','failed','cancelled','dead_letter','awaiting_approval');

create type cos_approval_status as enum ('pending','approved','rejected','expired');

create type cos_asset_kind as enum (
  'image','video','audio','music','voice','model3d','document','storyboard','timeline','lut','subtitle','package');

create type cos_studio_family as enum (
  'development','story','world','character','direction','cinematography','design',
  'storyboard','vfx','animation','generation','sound','voice','music','editing',
  'color','continuity','marketing','documentary','interactive','production',
  'academy','platform');

create type cos_role as enum ('owner','admin','producer','supervisor','artist','reviewer','viewer');
```

11.7 **Identity & tenancy.**
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  locale text not null default 'en',
  timezone text not null default 'UTC',
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free',
  credit_balance numeric(14,2) not null default 0,
  monthly_credit_cap numeric(14,2),
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role cos_role not null default 'artist',
  invited_by uuid references auth.users(id),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
```

11.8 **Universe graph.**
```sql
create table universes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  logline text,
  premise text,
  genre text[] not null default '{}',
  tone text,
  audience text,
  canon_status text not null default 'draft',
  cover_asset_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table franchises (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  universe_id uuid not null references universes(id) on delete cascade,
  title text not null,
  order_index int not null default 0,
  canon_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  universe_id uuid references universes(id) on delete set null,
  franchise_id uuid references franchises(id) on delete set null,
  title text not null,
  project_type cos_project_type not null default 'short_film',
  logline text,
  synopsis text,
  target_runtime_seconds int,
  aspect_ratio text not null default '2.39:1',
  language text not null default 'en',
  stage text not null default 'development',
  status text not null default 'active',
  canon_mode text not null default 'soft',
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table seasons (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  number int not null,
  title text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, number)
);

create table episodes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  season_id uuid not null references seasons(id) on delete cascade,
  number int not null,
  title text,
  runtime_seconds int,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, number)
);
```

11.9 **Production structure (scenes and shots are first-class).**
```sql
create table scenes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  episode_id uuid references episodes(id) on delete cascade,
  number text not null,                -- '12A' style slug allowed
  slug text,                           -- INT. ARCHIVE - NIGHT
  synopsis text,
  objective text,
  emotional_turn text,
  location_artifact_id uuid,
  time_of_day text,
  duration_seconds int,
  order_index int not null default 0,
  status cos_artifact_status not null default 'draft',
  body jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table shots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  scene_id uuid not null references scenes(id) on delete cascade,
  code text not null,                  -- 'SC012-SH03'
  order_index int not null default 0,
  shot_size text,                      -- ECU/CU/MCU/MS/WS/EWS
  camera_angle text,
  camera_movement text,
  lens_mm int,
  aperture text,
  frame_rate int,
  duration_seconds numeric(6,2),
  action text,
  dialogue_excerpt text,
  emotional_intent text,
  lighting_intent text,
  composition_notes text,
  status cos_artifact_status not null default 'draft',
  spec jsonb not null default '{}'::jsonb,   -- full shot spec per Section 12.7.6
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (scene_id, code)
);

create table shot_continuity (
  shot_id uuid primary key references shots(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  character_locks jsonb not null default '[]'::jsonb,
  wardrobe_locks jsonb not null default '[]'::jsonb,
  prop_locks jsonb not null default '[]'::jsonb,
  location_lock uuid,
  lighting_lock jsonb not null default '{}'::jsonb,
  screen_direction text,
  continuity_notes text,
  updated_at timestamptz not null default now()
);
```

11.10 **Asset system.**
```sql
create table assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  universe_id uuid references universes(id) on delete set null,
  kind cos_asset_kind not null,
  name text not null,
  description text,
  department text,
  status cos_artifact_status not null default 'draft',
  current_version_id uuid,
  parent_asset_id uuid references assets(id) on delete set null,
  tags text[] not null default '{}',
  rights_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table asset_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  version_no int not null,
  storage_path text not null,
  mime_type text,
  bytes bigint,
  checksum text,
  width int, height int, duration_ms int, sample_rate int,
  source text not null default 'upload',   -- upload|generated|derived|import
  run_id uuid,
  technical jsonb not null default '{}'::jsonb,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (asset_id, version_no)
);

create table asset_dependencies (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  dependent_asset_id uuid not null references assets(id) on delete cascade,
  dependency_asset_id uuid not null references assets(id) on delete cascade,
  relation text not null default 'uses',  -- uses|derived_from|references|replaces
  primary key (dependent_asset_id, dependency_asset_id, relation)
);

create table asset_usage (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  entity_type text not null,            -- scene|shot|artifact|episode|project
  entity_id uuid not null,
  field text,
  primary key (asset_id, entity_type, entity_id, field)
);

create table references_library (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  title text,
  source_url text,
  asset_id uuid references assets(id) on delete set null,
  category text,                        -- cinematography|color|costume|architecture|...
  notes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table rights_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  subject_type text not null,           -- voice|likeness|music|footage|model
  subject_ref text,
  holder text,
  license_type text,
  territory text[] not null default '{}',
  valid_from date, valid_until date,
  consent_document_path text,
  restrictions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

11.11 **Artifacts (every studio output).**
```sql
create table creative_artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  universe_id uuid references universes(id) on delete cascade,
  studio_key text not null,             -- registry key from Section 12
  capability_key text not null,
  artifact_type text not null,          -- treatment|scene|shot_plan|storyboard_panel|cue|cut|...
  title text not null,
  status cos_artifact_status not null default 'draft',
  current_version_id uuid,
  owner_user_id uuid references auth.users(id),
  owner_agent_key text,
  parent_artifact_id uuid references creative_artifacts(id) on delete set null,
  canonical boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table artifact_versions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  artifact_id uuid not null references creative_artifacts(id) on delete cascade,
  version_no int not null,
  body jsonb not null default '{}'::jsonb,   -- structured content (never binary)
  body_text text,                            -- rendered plain text for search
  summary text,
  provenance jsonb not null default '{}'::jsonb, -- agent, run_ids, inputs
  created_by uuid references auth.users(id),
  created_by_agent text,
  created_at timestamptz not null default now(),
  unique (artifact_id, version_no)
);

create table artifact_links (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  from_artifact_id uuid not null references creative_artifacts(id) on delete cascade,
  to_artifact_id uuid not null references creative_artifacts(id) on delete cascade,
  relation text not null,               -- derives_from|informs|supersedes|implements
  primary key (from_artifact_id, to_artifact_id, relation)
);
```

11.12 **Workflow, tasks, approvals.**
```sql
create table workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  key text not null,                    -- 'idea_to_first_cut'
  name text not null,
  definition jsonb not null,            -- nodes/edges machine spec
  version int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table workflow_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  workflow_id uuid not null references workflows(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  node_key text not null,
  title text not null,
  task_type text not null,              -- agent|human|generation|system
  assignee_agent text,
  assignee_user uuid references auth.users(id),
  status text not null default 'pending', -- pending|ready|running|blocked|done|failed
  depends_on uuid[] not null default '{}',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  artifact_id uuid references creative_artifacts(id) on delete set null,
  started_at timestamptz, finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  subject_type text not null,           -- artifact|asset|shot|episode|deliverable
  subject_id uuid not null,
  gate text not null,                   -- e.g. 'visual_direction_lock'
  status cos_approval_status not null default 'pending',
  requested_by uuid references auth.users(id),
  requested_by_agent text,
  decided_by uuid references auth.users(id),
  decision_note text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
```

11.13 **Generation, providers, cost.**
```sql
create table provider_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  provider_key text not null,           -- 'openai'|'anthropic'|'replicate'|'elevenlabs'|...
  capability text not null,             -- llm|image|video|voice|music|sfx|embedding
  display_name text,
  credential_ref text,                  -- pointer to secret store, never raw key
  config jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider_key, capability)
);

create table generation_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  capability text not null,             -- image|video|voice|music|sfx|llm|upscale
  provider_connection_id uuid references provider_connections(id),
  studio_key text,
  shot_id uuid references shots(id) on delete set null,
  artifact_id uuid references creative_artifacts(id) on delete set null,
  status cos_job_status not null default 'queued',
  priority int not null default 100,
  input jsonb not null,
  output jsonb,
  progress numeric(5,2) not null default 0,
  attempts int not null default 0,
  max_attempts int not null default 3,
  idempotency_key text unique,
  error_code text, error_message text,
  estimated_cost numeric(12,4), actual_cost numeric(12,4),
  queued_at timestamptz not null default now(),
  started_at timestamptz, finished_at timestamptz,
  created_by uuid references auth.users(id)
);

create table model_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  job_id uuid references generation_jobs(id) on delete cascade,
  provider_key text not null,
  model_key text not null,
  capability text not null,
  input_payload jsonb not null,
  output_payload jsonb,
  input_tokens int, output_tokens int,
  latency_ms int,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

create table cost_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  job_id uuid references generation_jobs(id) on delete set null,
  provider_key text,
  capability text,
  credits numeric(12,4) not null default 0,
  usd numeric(12,4) not null default 0,
  created_at timestamptz not null default now()
);
```

11.14 **Quality, continuity, collaboration.**
```sql
create table continuity_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  scope text not null,                  -- project|universe|scene|shot
  scope_id uuid,
  rule_type text not null,              -- wardrobe|prop|lighting|geography|timeline|world_rule
  expression jsonb not null,
  severity text not null default 'warn', -- info|warn|block
  created_at timestamptz not null default now()
);

create table quality_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  checker text not null,                -- continuity|narrative|visual|audio|delivery
  score numeric(5,2),
  findings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  body text not null,
  anchor jsonb,                         -- timecode, region, node path
  resolved boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_events (
  id bigserial primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  actor_agent text,
  action text not null,                 -- artifact.approved, asset.deleted, ...
  subject_type text,
  subject_id uuid,
  before jsonb, after jsonb,
  ip inet, user_agent text,
  created_at timestamptz not null default now()
);
```

11.15 **Studio registry tables.**
```sql
create table studios (
  key text primary key,
  family cos_studio_family not null,
  name text not null,
  purpose text not null,
  phase int not null,
  route text not null,
  icon text,
  sort_order int not null default 0,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb
);

create table studio_capabilities (
  id uuid primary key default gen_random_uuid(),
  studio_key text not null references studios(key) on delete cascade,
  key text not null,
  name text not null,
  description text,
  inputs jsonb not null default '[]'::jsonb,
  outputs jsonb not null default '[]'::jsonb,
  requires_capability text[] not null default '{}',  -- llm|image|video|voice|music|sfx
  agent_key text,
  workflow_key text,
  enabled boolean not null default true,
  unique (studio_key, key)
);

create table studio_settings (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  studio_key text not null,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, project_id, studio_key)
);
```

11.16 **Academy.**
```sql
create table courses (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  discipline text not null,
  level int not null default 1,
  description text,
  metadata jsonb not null default '{}'::jsonb
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  order_index int not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  exercise jsonb,
  unique (course_id, order_index)
);

create table lesson_progress (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status text not null default 'not_started',
  score numeric(5,2),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
```

11.17 **Mandatory indexes.**
```sql
create index on projects (workspace_id, updated_at desc) where deleted_at is null;
create index on creative_artifacts (project_id, studio_key, status);
create index on creative_artifacts using gin (to_tsvector('simple', title));
create index on artifact_versions using gin (to_tsvector('simple', coalesce(body_text,'')));
create index on assets (workspace_id, kind, updated_at desc) where deleted_at is null;
create index on assets using gin (tags);
create index on generation_jobs (status, priority, queued_at);
create index on generation_jobs (project_id, created_at desc);
create index on shots (scene_id, order_index);
create index on workflow_tasks (workflow_id, status);
create index on audit_events (workspace_id, created_at desc);
```

11.18 **RLS policy template (apply to every tenant table).**
```sql
alter table <t> enable row level security;

create policy <t>_member_read on <t> for select
using (exists (
  select 1 from workspace_members m
  where m.workspace_id = <t>.workspace_id and m.user_id = auth.uid()
));

create policy <t>_writer on <t> for all
using (exists (
  select 1 from workspace_members m
  where m.workspace_id = <t>.workspace_id
    and m.user_id = auth.uid()
    and m.role in ('owner','admin','producer','supervisor','artist')
))
with check (true);
```
11.19 Billing, audit, and provider secrets are service-role only; never readable by clients.

11.20 **Storage layout.**
```
w/{workspaceId}/p/{projectId}/{assetKind}/{assetId}/v{n}/{filename}
w/{workspaceId}/u/{universeId}/canon/{assetId}/v{n}/{filename}
w/{workspaceId}/exports/{deliverableId}/{preset}/{filename}
```
11.21 Objects are written once per version; deletion is soft (metadata) and object deletion is a scheduled job after 30 days.
11.22 All uploads go through signed URLs; max 2 GB per object; chunked upload above 100 MB.

11.23 **ID scheme for humans.** Display IDs are `PRJ-0001`, `SC-012`, `SH-012-03`, `CH-0004`, `AST-0931`. Stored in `metadata.display_id`; generation of display IDs is a per-workspace sequence.

---

## 12. STUDIO REGISTRY (NORMATIVE)

12.0 **Rules for every studio.**
- Every studio has a stable `key`, a `family`, a `phase`, a `route`, and a `purpose`.
- Every studio implements the shell contract in Section 13.5.
- Every capability is atomic, addressable as `studioKey.capabilityKey`, and callable by agents.
- Capability tags: `[llm]` language model, `[image]`, `[video]`, `[voice]`, `[music]`, `[sfx]`, `[none]` deterministic.
- If a capability produces creative content it must create an `artifact_versions` row plus a `model_runs` row when a provider was used.
- `[FUTURE]` studios ship disabled with a "Preview" badge and must never block Phase 1–4 delivery.
- A studio may depend on other studios' artifacts, but only through `artifact_links`. Never by direct table writes.

12.1 **FAMILY: DEVELOPMENT** — phase 1 — route prefix `/p/:projectId/development`

```
studio: development.idea
purpose: Turn incomplete thoughts into developed, comparable creative concepts.
capabilities:
  idea.capture              [none]  Capture text, voice note, URL, image, or video inspiration
  idea.voice_to_idea        [voice] Transcribe a spoken idea into a structured brief
  idea.text_to_concept      [llm]   Expand a sentence into structured concept options
  idea.image_to_concept     [llm]   Analyze an uploaded image into concept directions
  idea.video_to_concept     [llm]   Analyze a video reference into tone/genre/visual notes
  idea.explore_directions   [llm]   Generate 3-5 divergent creative directions
  idea.genre_discovery      [llm]   Propose genre frames and hybrids with positioning
  idea.originality_check    [llm]   Compare concept against known works (similarity, not verdict)
  idea.refine               [llm]   Iteratively tighten premise, hook, stakes, and promise
  idea.brainstorm           [llm]   Structured brainstorming with constraints
  idea.story_potential      [llm]   Score narrative potential with rationale
  idea.audience_potential   [llm]   Score audience fit with rationale
  idea.compare              [none]  Side-by-side comparison matrix of concepts
  idea.branch               [none]  Fork a concept into parallel variants
  idea.promote_to_project   [none]  Convert approved concept into a project record
outputs: artifact:idea_brief, artifact:concept_direction, project
agent: idea_agent
```

```
studio: development.research
purpose: Build a credible, citable research base for the story.
capabilities:
  research.historical       [llm]  Period research with timeline
  research.scientific       [llm]  Domain science grounding and plausibility notes
  research.cultural         [llm]  Customs, etiquette, material culture
  research.geographic       [llm]  Terrain, climate, travel times
  research.political        [llm]  Power structures relevant to the story
  research.psychological    [llm]  Behavior and motivation research (fiction-facing)
  research.architectural    [llm]  Built environment references
  research.military_tech    [llm]  Fictional and historical systems
  research.mythology        [llm]  Myth cycles and structural motifs
  research.folklore         [llm]  Regional folklore and taboos
  research.collect_reference[none] Save references into references_library
  research.verify_sources   [llm]  Flag unverifiable claims; require citation
  research.fact_check       [llm]  Check draft claims against collected sources
  research.timeline         [none] Assemble chronological research timeline
  research.integrate        [llm]  Propose story integration points per scene
outputs: artifact:research_dossier, references
agent: research_agent
guardrail: every factual claim carries source or an "unverified" flag
```

```
studio: development.creative
purpose: Shape the project's creative identity and commercial position.
capabilities:
  dev.logline               [llm]
  dev.premise               [llm]
  dev.theme                 [llm]
  dev.genre_selection       [llm]
  dev.positioning           [llm]
  dev.audience_definition   [llm]
  dev.emotional_promise     [llm]
  dev.differentiation       [llm]
  dev.comparable_analysis   [llm]
  dev.feasibility           [llm]
  dev.franchise_potential   [llm]
  dev.pitch                 [llm]
  dev.development_doc       [llm]
outputs: artifact:logline, artifact:treatment, artifact:development_doc
agent: development_agent
```

```
studio: development.packaging
purpose: Produce everything needed to pitch and package the project.
capabilities:
  package.overview          [llm]
  package.pitch_deck        [llm]   Slide-structured JSON (title, problem, vision, comps, team, ask)
  package.synopsis          [llm]
  package.treatment         [llm]
  package.director_statement[llm]
  package.producer_statement[llm]
  package.production_concept[llm]
  package.investor_deck     [llm]
  package.feasibility       [llm]
  package.render_pdf        [none]  Deterministic export with brand theme
outputs: artifact:pitch_deck, artifact:treatment, export:pdf
agent: packaging_agent
gate: pitch_deck_lock (human approval before sharing)
```

12.2 **FAMILY: STORY** — phase 1 — route prefix `/p/:projectId/story`

```
studio: story.architecture
purpose: Choose and enforce the narrative skeleton.
capabilities:
  story.three_act        [llm] Beat sheet with turning points
  story.five_act         [llm]
  story.hero_journey     [llm]
  story.save_the_cat     [llm]
  story.kishotenketsu    [llm]
  story.nonlinear        [llm] Reorder with causal integrity checks
  story.multi_timeline   [llm] Parallel timelines with sync points
  story.parallel_narrative[llm]
  story.anthology        [llm] Segment architecture + connective tissue
  story.mystery_arch     [llm] Clue ledger, red herrings, reveal schedule
  story.thriller_arch    [llm] Pressure curve and escalation map
  story.episodic         [llm] Episode arcs + season spine
  story.season_arch      [llm] Multi-season engine and long arcs
  story.branching        [llm] Decision tree with convergence points
  story.experimental     [llm] Custom structure with explicit rules
outputs: artifact:beat_sheet, artifact:structure_map
agent: story_agent
```

```
studio: story.screenplay
purpose: Write and revise the screenplay with craft controls.
capabilities:
  script.write_scene        [llm]
  script.write_sequence     [llm]
  script.write_dialogue     [llm]
  script.write_action       [llm]
  script.transitions        [llm]
  script.format_standard    [none] Fountain/FDX-compliant formatting
  script.voice_consistency  [llm] Per-character linguistic fingerprint check
  script.scene_objective    [llm] Objective/obstacle/outcome per scene
  script.emotional_progression[llm] Emotion curve per scene and act
  script.subtext_analysis   [llm] Flag on-the-nose dialogue
  script.pacing_analysis    [llm] Page-time and beat density
  script.rewrite            [llm] Scoped rewrite (scene|sequence|act|pass)
  script.compare_versions   [none] Structural diff of two versions
  script.lock               [none] Lock version; downstream reads become read-only
outputs: artifact:scene, artifact:screenplay
editor_requirements: Fountain import/export, scene navigator, character autocomplete, revision colors
agent: screenwriter_agent
```

```
studio: story.narrative_intelligence
purpose: Maintain coherence and tension across the whole narrative.
capabilities:
  nar.plot_development      [llm]
  nar.subplot_management    [llm] Thread tracker with open/close state
  nar.tension_curve         [llm] Numeric per-scene tension series
  nar.conflict_architecture [llm]
  nar.stakes                [llm] Escalation ladder
  nar.suspense              [llm]
  nar.mystery               [llm] Information asymmetry map
  nar.foreshadow            [llm] Plant registry
  nar.payoff_tracking       [llm] Match plants to payoffs; flag orphans
  nar.dramatic_irony        [llm]
  nar.emotional_arcs        [llm] Per-character arc state by scene
  nar.coherence             [llm]
  nar.plot_hole_detection   [llm] Returns findings with scene refs and severity
  nar.logic_validation      [llm]
  nar.expectation_analysis  [llm]
outputs: artifact:narrative_report, artifact:thread_map
agent: narrative_intelligence_agent
```

```
studio: story.dialogue
purpose: Character-true dialogue across languages and periods.
capabilities:
  dlg.character_voice   [llm]
  dlg.natural_conversation[llm]
  dlg.subtext           [llm]
  dlg.monologue         [llm]
  dlg.argument          [llm]
  dlg.emotional_scene    [llm]
  dlg.comedy            [llm]
  dlg.regional          [llm] Dialect guidance delivered as direction notes
  dlg.multilingual      [llm]
  dlg.period_language   [llm]
  dlg.voice_differentiation[llm] Pairwise distinctiveness score
  dlg.polish            [llm]
  dlg.performance_notes [llm]
outputs: artifact:dialogue_pass, artifact:performance_notes
agent: dialogue_agent
```

```
studio: story.breakdown
purpose: Convert the screenplay into structured, production-ready elements.
capabilities:
  bd.parse_screenplay   [llm+none] Deterministic scene parse, LLM disambiguation
  bd.extract_elements   [llm] Characters, locations, props, costumes, vehicles, animals, extras
  bd.extract_fx         [llm] SFX/VFX/stunts/weather/time-of-day flags
  bd.estimate_duration  [none] Page-eighths model with configurable factor
  bd.complexity_score   [llm] Per-scene production complexity 1-5
  bd.generate_breakdown [none] Assembled breakdown sheet per scene
  bd.export_csv         [none]
outputs: artifact:breakdown_sheet, assets:element_candidates
agent: breakdown_agent
accuracy_target: >= 90% element recall on a 20-scene benchmark script
```

12.3 **FAMILY: WORLD** — phase 1 — route prefix `/p/:projectId/world`

```
studio: world.architect
purpose: Create internally consistent fictional worlds.
capabilities:
  world.create            [llm]
  world.rules             [llm] Physics/social/magic constraints as testable statements
  world.geography         [llm+image]
  world.regions           [llm]
  world.cities            [llm+image]
  world.civilizations     [llm]
  world.politics          [llm]
  world.economy           [llm]
  world.religion          [llm]
  world.social_structure  [llm]
  world.languages         [llm] Phonology, lexicon seed, naming rules
  world.technology        [llm]
  world.magic_system      [llm] Cost, limit, and failure mode are mandatory
  world.science           [llm]
  world.ecology           [llm]
  world.history           [llm]
  world.culture           [llm]
outputs: artifact:world_bible, asset:map, artifact:world_rules
agent: world_agent
validation: every world rule must be machine-checkable (subject, predicate, constraint)
```

```
studio: world.timeline
purpose: Keep history and chronology consistent.
capabilities:
  tl.create          [llm]
  tl.ancient         [llm]
  tl.civilizational  [llm]
  tl.character_history[llm]
  tl.wars            [llm]
  tl.political       [llm]
  tl.technological   [llm]
  tl.milestones      [llm]
  tl.parallel        [llm]
  tl.alternate       [llm]
  tl.visualize       [none]
  tl.contradiction_check[llm] Returns conflicting event pairs with dates
outputs: artifact:timeline, artifact:world_history
agent: timeline_agent
```

```
studio: world.lore
purpose: Deep canon material that makes the world feel lived-in.
capabilities:
  lore.mythology        [llm]
  lore.legends          [llm]
  lore.texts            [llm] In-world document generation
  lore.prophecies       [llm]
  lore.secret_orgs      [llm]
  lore.mysteries        [llm]
  lore.traditions       [llm]
  lore.symbols          [llm+image]
  lore.rituals          [llm]
  lore.objects          [llm+image]
  lore.entities         [llm]
  lore.terminology      [llm] Glossary with usage rules
  lore.document         [none]
outputs: artifact:lore_entry, artifact:glossary
agent: lore_agent
```

```
studio: world.franchise
purpose: Manage canon and expansion across many productions.
capabilities:
  ip.universe_manage     [none]
  ip.link_projects       [none]
  ip.series_spinoff      [llm]
  ip.prequel_sequel      [llm]
  ip.origin_story        [llm]
  ip.crossover           [llm]
  ip.character_appearances[none]
  ip.shared_locations    [none]
  ip.universe_events     [llm]
  ip.canon_management    [llm] Canon entries with lock levels
  ip.alternate_universes [llm]
  ip.expansion_plan      [llm]
  ip.continuity_audit    [llm]
outputs: artifact:canon_entry, artifact:slate_plan
agent: franchise_agent
gate: canon_lock (human approval; locked canon blocks conflicting writes)
```

```
studio: world.simulation                    [FUTURE]
purpose: Simulate how a world evolves under pressure.
capabilities:
  sim.political  [llm]  sim.war [llm]  sim.economy [llm]  sim.technology [llm]
  sim.environment[llm]  sim.character_decisions [llm]  sim.social_change [llm]
outputs: artifact:simulation_run
```

12.4 **FAMILY: CHARACTER** — phase 1 — route prefix `/p/:projectId/characters`

```
studio: character.architect
purpose: Build complete characters, not descriptions.
capabilities:
  ch.create         [llm]
  ch.profile        [llm]
  ch.biography      [llm]
  ch.motivation     [llm]  ch.desire [llm]  ch.fear [llm]
  ch.weakness       [llm]  ch.strength [llm]  ch.contradiction [llm]  ch.secret [llm]
  ch.relationships  [none] Uses relationship graph
  ch.history        [llm]
  ch.objective      [llm]  ch.transformation [llm]
outputs: artifact:character_profile
agent: character_agent
required_fields: want, need, wound, lie, truth, voice_id, face_asset_id
```

```
studio: character.psychology
purpose: Depth and behavioral consistency for fictional characters.
capabilities:
  psy.personality      [llm]
  psy.behavior_patterns[llm]
  psy.emotional_tendency[llm]
  psy.decision_pattern [llm]
  psy.internal_conflict[llm]
  psy.attachment_style [llm]
  psy.moral_philosophy [llm]
  psy.values           [llm]
  psy.defense_mechanisms[llm]
  psy.triggers         [llm]
  psy.consistency_check[llm] Flags out-of-character beats with evidence
outputs: artifact:psych_profile
agent: psychology_agent
disclaimer: fictional character development only; never presented as diagnosis
```

```
studio: character.appearance
purpose: Lock a character's visual identity across the production.
capabilities:
  look.face            [image]
  look.body            [image]
  look.age_variants    [image]
  look.skin_hair       [image]
  look.expressions     [image] Expression sheet: neutral, joy, anger, fear, grief, resolve
  look.ref_sheet       [none]  Assemble front/side/back turnaround
  look.full_body       [image]
  look.wardrobe_ref    [image]
  look.identity_lock   [none] Create character_locks entry (embedding + reference set)
  look.evolution       [image] Age/injury/story-state variants
outputs: asset:character_reference_set, asset:expression_sheet
agent: appearance_agent
consistency: identity_lock stores reference asset IDs + descriptors; every generation of this character must include the lock
```

```
studio: character.performance
purpose: Direct how a character moves and emotes.
capabilities:
  perf.facial          [video]
  perf.body_language   [video]
  perf.eye_movement    [llm]
  perf.walk_style      [llm]
  perf.gestures        [llm]
  perf.emotional_expr  [video]
  perf.acting_reference[none]
  perf.direction       [llm]
  perf.delivery        [voice]
  perf.scene_perf      [video]
  perf.variations      [video]
outputs: artifact:performance_plan, asset:performance_take
agent: performance_agent
```

```
studio: character.relationship
purpose: Model the social fabric of the story.
capabilities:
  rel.family_tree       [none]
  rel.romantic          [llm]
  rel.friendship        [llm]
  rel.rivalry           [llm]
  rel.alliance          [llm]
  rel.mentorship        [llm]
  rel.betrayal          [llm]
  rel.power_dynamics    [llm]
  rel.timeline          [none]
  rel.emotional_map     [none] Graph view with valence and intensity
outputs: artifact:relationship_map
agent: relationship_agent
```

```
studio: character.casting
purpose: Define casting and voice requirements; support consent-aware likeness.
capabilities:
  cast.character_concept[llm]
  cast.actor_references [none]
  cast.performance_req  [llm]
  cast.voice_req        [llm]
  cast.age_range        [llm]
  cast.breakdown        [llm]
  cast.role_comparison  [llm]
  cast.audition_material[llm]
outputs: artifact:casting_breakdown
guardrail: real-person likeness or voice requires a rights_records entry with consent document
```

```
studio: character.continuity
purpose: Guarantee a character looks and behaves the same across scenes.
capabilities:
  cont.track_face       [none]
  cont.track_hair       [none]
  cont.track_wardrobe   [none]
  cont.track_age        [none]
  cont.track_physical   [none]  cont.track_injuries [none]
  cont.track_accessories[none]
  cont.track_state      [none]  Emotional/physical state per scene
  cont.scene_to_scene   [llm]   Ordered continuity report with violations
outputs: artifact:continuity_report
agent: continuity_agent
```

12.5 **FAMILY: DIRECTION** — phase 1 (director) / phase 2 (visual) — route prefix `/p/:projectId/direction`

```
studio: direction.director
purpose: Define and hold the creative vision.
capabilities:
  dir.vision             [llm]
  dir.interpretation     [llm]
  dir.creative_direction [llm]
  dir.scene_direction    [llm] Per scene: intent, obstacle, reveal, end beat
  dir.emotional_intent   [llm]
  dir.performance_dir    [llm]
  dir.visual_storytelling[llm]
  dir.pacing             [llm]
  dir.blocking           [llm]
  dir.cinematic_language [llm]
  dir.notes              [none]
  dir.treatment          [llm]
outputs: artifact:directors_treatment, artifact:scene_direction
agent: director_agent
gate: vision_lock
```

```
studio: direction.visual
purpose: Establish the film's visual grammar.
capabilities:
  vis.identity          [llm+image]
  vis.references        [none]
  vis.atmosphere        [llm+image]
  vis.color_language    [llm]   Palette with hex values and usage rules
  vis.texture_language  [llm]
  vis.lighting_philosophy[llm]
  vis.composition_philosophy[llm]
  vis.camera_philosophy [llm]
  vis.motifs            [llm]
  vis.symbolism         [llm]
  vis.shot_consistency  [none] Enforced via look bible
outputs: artifact:look_bible, asset:moodboard
agent: visual_direction_agent
```

```
studio: direction.scene
purpose: Answer the eight questions for every scene.
capabilities:
  scn.what_happens   [llm]
  scn.character_wants[llm]
  scn.conflict       [llm]
  scn.audience_feel  [llm]
  scn.reveal         [llm]
  scn.conceal        [llm]
  scn.visual_intent  [llm]
  scn.end_beat       [llm]
outputs: artifact:scene_analysis
```

```
studio: direction.performance_direction
purpose: Convert intent into playable instruction.
capabilities:
  pd.actor_instructions [llm]
  pd.emotional_beats    [llm]
  pd.character_intention[llm]
  pd.scene_rhythm       [llm]
  pd.delivery           [llm]
  pd.physical_performance[llm]
  pd.blocking_instructions[llm]
  pd.alternatives       [llm]
outputs: artifact:performance_direction
```

12.6 **FAMILY: CINEMATOGRAPHY** — phase 2 — route prefix `/p/:projectId/cinematography`

```
studio: cine.dp
purpose: Translate vision into photographic decisions.
capabilities:
  dp.vision          [llm]
  dp.references      [none]
  dp.scene_cine      [llm]
  dp.lighting_approach[llm]
  dp.lens_selection  [llm]
  dp.camera_selection[llm]
  dp.composition     [llm]
  dp.exposure        [none]  EV/f-stop/ISO planning math
  dp.movement_strategy[llm]
  dp.continuity      [none]
outputs: artifact:cinematography_plan
agent: dp_agent
```

```
studio: cine.camera
purpose: Configure capture technically.
capabilities:
  cam.body        [none] Camera body catalog (ARRI/RED/Sony/etc. metadata only)
  cam.config      [none]
  cam.sensor      [none] Format, crop factor, resolution
  cam.frame_rate  [none]
  cam.resolution  [none]
  cam.aspect      [none]
  cam.recording   [none]
  cam.rig         [none]
  cam.movement    [llm]
  cam.stabilization[none]
  cam.focus_plan  [none] Depth-of-field and focus pull plan
outputs: artifact:camera_plan
```

```
studio: cine.lens
purpose: Control perspective and optical character.
capabilities:
  lens.prime       [none]  lens.zoom [none]  lens.focal_selection [llm]
  lens.characteristics[llm]  lens.dof [none]  lens.perspective [none]
  lens.distortion  [none]  lens.closeup_plan [llm]  lens.wide_plan [llm]
  lens.anamorphic  [none]  lens.compare [none]
outputs: artifact:lens_plan
```

```
studio: cine.composition
purpose: Frame with intent.
capabilities:
  comp.thirds [none]  comp.symmetry [none]  comp.leading_lines [none]
  comp.negative_space [none]  comp.frame_in_frame [none]  comp.fg_bg [none]
  comp.depth [none]  comp.subject_placement [none]  comp.balance [none]
  comp.hierarchy [none]
outputs: artifact:composition_notes
```

```
studio: cine.movement
purpose: Plan and preview camera motion.
capabilities:
  mv.static [none]  mv.dolly [none]  mv.tracking [none]  mv.crane [none]
  mv.jib [none]  mv.pan [none]  mv.tilt [none]  mv.zoom [none]
  mv.handheld [none]  mv.steadicam [none]  mv.gimbal [none]  mv.drone [none]
  mv.orbit [none]  mv.push_in [none]  mv.pull_out [none]  mv.whip_pan [none]
  mv.complex [llm]  mv.preview [video]  Render a motion test
outputs: artifact:movement_plan, asset:motion_test
```

```
studio: cine.shot_design
purpose: Produce a complete, generation-ready shot specification.
capabilities:
  sd.create_spec   [llm]
  sd.validate_spec [none]  Required-field validation
  sd.generate_prompt[llm] Build prompt from structured spec (never freeform only)
  sd.link_continuity[none] Attach shot_continuity locks
outputs: artifact:shot_spec
required_fields: [shot_id, scene, shot_size, camera, lens, position, movement, subject,
                  composition, lighting, focus, duration, action, performance,
                  emotional_intent, visual_reference, generation_prompt, continuity]
```

```
studio: cine.lighting
purpose: Design light with continuity.
capabilities:
  lt.natural [llm]  lt.studio [llm]  lt.three_point [llm]  lt.motivated [llm]
  lt.hard [llm]  lt.soft [llm]  lt.practical [llm]  lt.volumetric [llm]
  lt.atmospheric [llm]  lt.daylight_sim [llm]  lt.night [llm]
  lt.interior [llm]  lt.exterior [llm]  lt.diagram [image]  lt.source_continuity [none]
outputs: artifact:lighting_plan, asset:lighting_diagram
```

12.7 **FAMILY: DESIGN** — phase 2 — route prefix `/p/:projectId/design`

```
studio: design.production
capabilities:
  dsg.concept [llm+image]  dsg.environments [llm+image]  dsg.architecture [llm]
  dsg.historical_accuracy [llm]  dsg.cultural_refs [llm]  dsg.materials [llm]
  dsg.textures [llm+image]  dsg.environmental_storytelling [llm]
outputs: artifact:design_bible
studio: design.set
capabilities:
  set.interior [llm+image]  set.exterior [llm+image]  set.layout [none]
  set.construction_ref [image]  set.spatial_plan [none]  set.furniture [llm]
  set.details [llm]  set.continuity [none]
studio: design.location
capabilities:
  loc.discover [llm]  loc.references [none]  loc.design [llm+image]
  loc.virtual [image]  loc.match_int_ext [none]  loc.geography [none]  loc.continuity [none]
studio: design.props
capabilities:
  prop.create [llm]  prop.hero [image]  prop.everyday [image]  prop.historical [image]
  prop.tech [image]  prop.symbolic [image]  prop.ref_sheet [none]  prop.continuity [none]
studio: design.costume
capabilities:
  cst.concept [llm+image]  cst.wardrobe [image]  cst.character_clothing [none]
  cst.historical [llm]  cst.cultural [llm]  cst.fabric [llm]  cst.color_coordination [llm]
  cst.evolution [image]  cst.wardrobe_continuity [none]
studio: design.makeup
capabilities:
  mk.design [llm+image]  mk.aging [image]  mk.transformation [image]  mk.wounds [image]
  mk.prosthetics [llm]  mk.creature [llm]  mk.period [llm]  mk.continuity [none]
outputs: assets per element + artifact:design_bible
```

12.8 **FAMILY: STORYBOARD** — phase 2 — route prefix `/p/:projectId/storyboard`

```
studio: sb.board
capabilities:
  sb.from_script [llm+image]  sb.from_text [image]  sb.from_image [image]
  sb.panel [image]  sb.framing [none]  sb.blocking [none]  sb.action_continuity [none]
  sb.annotate [none]  sb.variations [image]  sb.revise [none]
outputs: asset:storyboard_panel per shot; artifact:storyboard_sequence
studio: sb.previs
capabilities:
  pv.2d [image]  pv.3d [none]  pv.blocking [llm]  pv.camera_sim [none]
  pv.character_placement [none]  pv.environment_placement [none]
  pv.camera_move_preview [video]  pv.timing [none]  pv.scene_viz [video]
studio: sb.animatic
capabilities:
  an.from_board [none]  an.shot_timing [none]  an.temp_dialogue [voice]
  an.temp_music [music]  an.transitions [none]  an.sequence_timing [none]  an.rough_cut [none]
studio: sb.sequence
capabilities:
  sq.ordering [none]  sq.continuity [none]  sq.coverage_plan [llm]
  sq.master_shots [none]  sq.closeups [none]  sq.reactions [none]  sq.inserts [none]
  sq.establishing [none]  sq.alternative_coverage [llm]
```

12.9 **FAMILY: VFX** — phase 3 — route prefix `/p/:projectId/vfx`

```
studio: vfx.development
capabilities:
  vfx.concept [llm]  vfx.references [none]  vfx.effect_breakdown [llm]
  vfx.scene_plan [llm]  vfx.shot_plan [llm]  vfx.complexity [llm]  vfx.pipeline_plan [llm]
outputs: artifact:vfx_plan
studio: vfx.simulation
capabilities:
  sim.fire [video]  sim.smoke [video]  sim.water [video]  sim.rain [video]
  sim.snow [video]  sim.dust [video]  sim.explosion [video]  sim.wind [video]
  sim.cloth [video]  sim.hair [video]  sim.particles [video]  sim.destruction [video]
  sim.debris [video]  sim.fluid [video]  sim.atmosphere [video]
guardrail: fictional-effect planning only; no operational weaponization detail
studio: vfx.compositing
capabilities:
  cmp.layers [none]  cmp.greenscreen [none]  cmp.bluescreen [none]
  cmp.bg_replacement [image]  cmp.matte_extraction [none]  cmp.roto [none]
  cmp.masking [none]  cmp.keying [none]  cmp.depth_integration [none]
  cmp.light_integration [none]  cmp.shadow_integration [none]  cmp.plate_cleanup [none]
studio: vfx.environment
capabilities:
  env.extend [image]  env.landscape [image]  env.city [image]  env.architecture [image]
  env.matte_painting [image]  env.sky_replacement [image]  env.bg_generation [image]
  env.reconstruction [none]
studio: vfx.advanced                      [FUTURE]
capabilities:
  adv.camera_tracking [none]  adv.object_tracking [none]  adv.matchmove [none]
  adv.mocap_integration [none]  adv.3d_reconstruction [none]  adv.gaussian_splat [none]
  adv.neural_rendering [video]  adv.digital_double [video]  adv.scene_reconstruction [none]
studio: vfx.review
capabilities:
  rv.shot_review [none]  rv.version_compare [none]  rv.technical_validation [none]
  rv.compositing_feedback [llm]  rv.artifact_detection [llm]  rv.edge_matte_inspection [none]
  rv.approval_tracking [none]
```

12.10 **FAMILY: ANIMATION** — phase 3 — route prefix `/p/:projectId/animation`

```
studio: anim.2d
capabilities: a2.frame_by_frame [video]  a2.character [video]  a2.motion_graphics [video]
             a2.cutout [video]  a2.background [image]  a2.stylized [video]
studio: anim.3d
capabilities: a3.rigging [none]  a3.character [video]  a3.object [video]
             a3.environment [video]  a3.camera [none]  a3.scene [video]  a3.physics [video]
studio: anim.mocap
capabilities: moc.import [none]  moc.body_track [none]  moc.facial [none]
             moc.performance_capture [none]  moc.retarget [none]  moc.cleanup [none]
studio: anim.creature
capabilities: cr.design [llm+image]  cr.anatomy [llm]  cr.locomotion [llm]
             cr.facial [video]  cr.behavior_refs [llm]  cr.performance [video]
studio: anim.motion_graphics
capabilities: mg.titles [video]  mg.credits [video]  mg.typography [video]
             mg.infographics [video]  mg.transitions [video]  mg.ui_graphics [video]
             mg.logo [video]  mg.data_viz [video]
```

12.11 **FAMILY: GENERATION** — phase 2 — route prefix `/p/:projectId/generation`

> This is the rendering layer, not the product. Every capability here must call the provider abstraction
> (Section 14) and must persist to `generation_jobs` + `model_runs` + `asset_versions`.

```
studio: gen.image
capabilities:
  im.text_to_image [image]  im.image_to_image [image]  im.reference [image]
  im.character [image]      im.location [image]        im.prop [image]
  im.costume [image]        im.storyboard [image]      im.concept_art [image]
  im.key_art [image]        im.edit [none]             im.inpaint [image]
  im.outpaint [image]       im.variations [image]      im.upscale [image]
studio: gen.video
capabilities:
  vd.text_to_video [video]  vd.image_to_video [video]  vd.video_to_video [video]
  vd.first_last_frame [video]  vd.reference_video [video]  vd.shot [video]
  vd.camera_motion [video]  vd.character_motion [video]  vd.scene_extension [video]
  vd.continuation [video]   vd.transformation [video]    vd.variations [video]
  vd.upscale [video]
studio: gen.control
capabilities:
  gc.prompt_builder [llm]  gc.negative_constraints [llm]  gc.reference_management [none]
  gc.seed [none]           gc.aspect [none]                 gc.duration [none]
  gc.resolution [none]     gc.frame_rate [none]             gc.model_select [none]
  gc.settings [none]       gc.version_compare [none]        gc.history [none]
  gc.queue [none]          gc.cost_tracking [none]
studio: gen.consistency
capabilities:
  kc.character [none]  kc.location [none]  kc.wardrobe [none]  kc.prop [none]
  kc.camera [none]     kc.lighting [none]  kc.style [none]     kc.scene [none]
enforcement: every capability in gen.consistency reads shot_continuity and refuses to run
             when a required lock is missing; the UI then offers "create lock" as the fix
```

12.12 **FAMILY: SOUND** — phase 4 — route prefix `/p/:projectId/sound`

```
studio: snd.design
capabilities:
  sd.concept [llm]  sd.scene_plan [llm]  sd.environmental [sfx]  sd.atmospheric [sfx]
  sd.foley [sfx]    sd.impacts [sfx]     sd.movement [sfx]       sd.objects [sfx]
  sd.mechanical [sfx]  sd.creature [sfx] sd.cinematic [sfx]      sd.library [none]
  sd.layering [none]
studio: snd.foley
capabilities:
  fy.footsteps [sfx]  fy.clothing [sfx]  fy.handling [sfx]  fy.doors [sfx]
  fy.interactions [sfx]  fy.environmental [sfx]  fy.record [none]  fy.sync [none]
studio: snd.ambient
capabilities:
  am.forest [sfx]  am.urban [sfx]  am.interior [sfx]  am.nature [sfx]
  am.space [sfx]   am.historical [sfx]  am.fictional [sfx]  am.beds [sfx]
studio: snd.edit
capabilities:
  ae.trim [none]  ae.layer [none]  ae.sync [none]  ae.denoise [none]
  ae.cleanup [none]  ae.eq [none]  ae.compress [none]  ae.spatial [none]
  ae.volume [none]  ae.transitions [none]
studio: snd.spatial
capabilities:
  sp.stereo [none]  sp.surround [none]  sp.5_1 [none]  sp.7_1 [none]
  sp.atmos [none]   sp.object_based [none]  sp.binaural [none]  sp.3d_position [none]
  sp.review [none]
studio: snd.continuity
capabilities: sc.track [none]  sc.shot [none]  sc.scene [none]  sc.location [none]
              sc.movement [none]  sc.environment [none]  sc.perspective [none]  sc.transitions [none]
```

12.13 **FAMILY: VOICE** — phase 4 — route prefix `/p/:projectId/voice`

```
studio: voice.studio
capabilities:
  vo.casting [llm+voice]  vo.generate [voice]  vo.record [none]  vo.profile [none]
  vo.character_voice [voice]  vo.performance [voice]  vo.emotion [voice]
  vo.multilingual [voice]  vo.direction [llm]  vo.consistency [none]
guardrail: only authorized voice models; every generated voice links to a rights_records row
studio: voice.acting
capabilities:
  va.delivery [voice]  va.emotional [voice]  va.variations [voice]  va.timing [none]
  va.pronunciation [voice]  va.accent [voice]  va.compare [none]  va.retakes [voice]
studio: voice.adr
capabilities:
  adr.replace [voice]  adr.lipsync [none]  adr.manage [none]  adr.match [none]
  adr.performance_match [none]  adr.notes [none]  adr.take_select [none]
studio: voice.dubbing
capabilities:
  db.adapt [llm]  db.translate [llm]  db.localize [llm]  db.script [llm]
  db.cast [none]  db.timing [none]  db.lipsync [none]  db.qc [none]
studio: voice.subtitle
capabilities:
  st.generate [llm]  st.edit [none]  st.timecode [none]  st.speaker_id [llm]
  st.multi_lang [llm]  st.format [none]  st.accessibility [none]
```

12.14 **FAMILY: MUSIC** — phase 4 — route prefix `/p/:projectId/music`

```
studio: mus.direction
capabilities:
  md.identity [llm]  md.score_direction [llm]  md.genre [llm]  md.emotional_map [llm]
  md.themes [llm]    md.instruments [llm]      md.references [none]  md.scene_direction [llm]
studio: mus.composition
capabilities:
  mc.original [music]  mc.score [music]  mc.character_theme [music]  mc.main_theme [music]
  mc.motif [music]     mc.action [music]  mc.suspense [music]  mc.romantic [music]
  mc.ambient [music]   mc.transition [music]
studio: mus.orchestration
capabilities:
  or.arrange [music]  or.instrumentation [none]  or.layering [none]
  or.harmony [llm]    or.melody [llm]  or.rhythm [llm]  or.dynamics [llm]
studio: mus.production
capabilities:
  mp.midi [none]  mp.arrangement [none]  mp.record_integration [none]
  mp.mix [none]   mp.master [none]       mp.stems [none]  mp.version_compare [none]
studio: mus.sync
capabilities:
  ms.to_picture [none]  ms.beat_map [none]  ms.scene_timing [none]
  ms.emotional_transitions [none]  ms.hit_points [none]  ms.cue_sheet [none]  ms.cue_revision [none]
studio: mus.rights
capabilities:
  mr.ownership [none]  mr.license [none]  mr.restrictions [none]  mr.attribution [none]
  mr.expiration [none]  mr.commercial_check [none]
```

12.15 **FAMILY: EDITING** — phase 4 — route prefix `/p/:projectId/edit`

```
studio: edit.timeline
capabilities:
  ed.timeline [none]  ed.multitrack [none]  ed.trim [none]  ed.arrange [none]
  ed.sequence [none]  ed.assemble [none]    ed.transitions [none]  ed.audio_tracks [none]
  ed.layers [none]    ed.proxy [none]       ed.multicam [none]  ed.shortcuts [none]
studio: edit.ai
capabilities:
  ai.script_to_edit [llm]  ai.auto_assemble [none]  ai.dialogue_edit [llm]
  ai.best_take [llm]       ai.shot_recommend [llm]  ai.pacing [llm]
  ai.silence_removal [none]  ai.scene_summary [llm]  ai.rough_cut [none]
  ai.alternative_cuts [none]  ai.highlights [llm]
studio: edit.assistant
capabilities:
  as.media_org [none]  as.metadata [none]  as.labels [none]  as.scene_group [none]
  as.take_org [none]   as.sync [none]      as.proxy_mgmt [none]  as.timeline_prep [none]
studio: edit.color
capabilities:
  cg.correct [none]  cg.grade [none]  cg.exposure [none]  cg.white_balance [none]
  cg.contrast [none]  cg.saturation [none]  cg.skin_tone [none]  cg.look_dev [none]
  cg.shot_match [none]  cg.scene_match [none]  cg.lut [none]  cg.continuity [none]
studio: edit.finishing
capabilities:
  fn.picture_lock [none]  fn.conform [none]  fn.online [none]  fn.audio_sync [none]
  fn.titles [none]        fn.credits [none]  fn.export_prep [none]  fn.master [none]
```

12.16 **FAMILY: CONTINUITY** (QC) — phase 4 — route prefix `/p/:projectId/continuity`

```
studio: qc.continuity
checks: appearance, clothing, hair, props, location, lighting, weather, time_of_day,
        positions, screen_direction, dialogue, timeline, world_rules
capabilities: cq.run_check [llm]  cq.explain [llm]  cq.fix_suggestion [llm]  cq.report [none]
studio: qc.narrative
checks: plot_holes, motivation, behavior_consistency, missing_info, setup_payoff,
        unresolved_threads, timeline_conflicts, scene_logic
studio: qc.visual
checks: artifacts, identity_drift, anatomy, object_duplication, unnatural_motion,
        lighting_mismatch, composition, frame_instability
studio: qc.audio
checks: intelligibility, clipping, noise, sync, loudness, channels, missing_audio, continuity
studio: qc.delivery
checks: resolution, frame_rate, aspect, audio_format, subtitle_sync, file_integrity, specs, deliverables
finding_schema: { code, severity: info|warn|block, subject, timecode?, evidence, suggestion }
```

12.17 **FAMILY: MARKETING** — phase 5 — route prefix `/p/:projectId/marketing`

```
studio: mkt.trailer
capabilities:
  tr.concept [llm]  tr.structure [llm]  tr.highlights [llm]  tr.emotional_progression [llm]
  tr.music [music]  tr.sound_design [sfx]  tr.edit [none]  tr.teaser [video]
  tr.multi_version [none]  tr.platform_cuts [none]
studio: mkt.poster
capabilities:
  po.movie [image]  po.character [image]  po.ensemble [image]  po.teaser [image]
  po.international [image]  po.key_art [image]  po.promo [image]  po.typography [none]
studio: mkt.campaign
capabilities:
  cm.plan [llm]  cm.segments [llm]  cm.positioning [llm]  cm.strategy [llm]
  cm.social [llm]  cm.launch [llm]  cm.bts [llm]  cm.press_kit [none]  cm.promo_video [video]
studio: mkt.distribution
capabilities:
  di.plan [llm]  di.platform_reqs [none]  di.deliverables [none]  di.calendar [none]
  di.territory [none]  di.festivals [llm]  di.docs [none]  di.performance [none]
```

12.18 **FAMILY: DOCUMENTARY** — phase 5 — route prefix `/p/:projectId/development/doc`

```
studio: doc.production
capabilities: dc.concept [llm]  dc.research [llm]  dc.interview_plan [llm]
              dc.transcribe [llm+voice]  dc.structure [llm]  dc.archive [none]
              dc.fact_check [llm]  dc.edit [none]
studio: doc.interview
capabilities: iv.questions [llm]  iv.structures [llm]  iv.guest_research [llm]
              iv.recording [none]  iv.transcript_analysis [llm]  iv.highlights [llm]
studio: doc.educational
capabilities: ed.explainer [llm]  ed.educational_doc [llm]  ed.instructional [llm]
              ed.scientific_viz [video]  ed.historical_recon [video]  ed.learning_seq [llm]
studio: doc.news
capabilities: nw.structure [llm]  nw.field_org [none]  nw.interviews [none]
              nw.evidence [none]  nw.attribution [llm]  nw.editorial_review [llm]
```

12.19 **FAMILY: INTERACTIVE** — phase 5 — route prefix `/p/:projectId/interactive`

```
studio: int.animated
capabilities: af.short [video]  af.feature [video]  af.series [video]
              af.anime_inspired [video]  af.experimental [video]  af.mixed_media [video]
studio: int.game_cinematics
capabilities: gc.opening [video]  gc.cutscene [video]  gc.character_intro [video]
              gc.dialogue_seq [video]  gc.in_game_scene [video]  gc.transitions [video]  gc.trailer [video]
studio: int.story
capabilities: is.branching [llm]  is.decision_tree [none]  is.multiple_endings [llm]
              is.characters [llm]  is.state_management [none]  is.player_scenes [llm]
              is.interactive_dialogue [llm]  is.simulation [none]
studio: int.virtual_production
capabilities: vp.environments [none]  vp.realtime_preview [none]  vp.camera_viz [none]
              vp.locations [none]  vp.led_wall_plan [llm]  vp.realtime_comp [none]
              vp.asset_integration [none]
```

12.20 **FAMILY: PRODUCTION** — phase 3 — route prefix `/p/:projectId/production`

```
studio: prod.producer
capabilities: pr.plan [llm]  pr.strategy [llm]  pr.scope [none]  pr.coordination [none]
              pr.approvals [none]  pr.deliverable_tracking [none]
studio: prod.budget
capabilities: bg.create [none]  bg.department [none]  bg.asset_costs [none]
              bg.generation_costs [none]  bg.estimate [none]  bg.track [none]
              bg.scenarios [none]  bg.optimize [llm]
studio: prod.schedule
capabilities: sc.create [none]  sc.scene_sched [none]  sc.resources [none]
              sc.dependencies [none]  sc.delivery [none]  sc.milestones [none]  sc.deadlines [none]
studio: prod.coordination
capabilities: co.tasks [none]  co.team [none]  co.departments [none]  co.notes [none]
              co.reviews [none]  co.approvals [none]  co.status [none]
studio: prod.assets
capabilities: am.library [none]  am.metadata [none]  am.versioning [none]
              am.references [none]  am.usage [none]  am.dependencies [none]
              am.permissions [none]  am.reuse [none]
```

12.21 **FAMILY: ACADEMY** — phase 5 — route prefix `/academy`

```
studio: acad.craft
tracks: storytelling, screenwriting, directing, cinematography, lighting, editing,
        sound_design, music_composition, vfx, animation, production, film_business
capabilities: ac.track [none]  ac.lesson [llm]  ac.quiz [llm]  ac.certificate [none]
studio: acad.mentor
capabilities: mn.explain_decision [llm]  mn.review_work [llm]  mn.teach_cine [llm]
              mn.explain_composition [llm]  mn.teach_structure [llm]
              mn.analyze_scene [llm]  mn.exercises [llm]  mn.progress [none]
guardrail: mentor critiques the artifact, never the person; no medical/clinical framing
studio: acad.practice
capabilities: px.recreate_shot [none]  px.write_scene [none]  px.design_character [none]
              px.storyboard [none]  px.direct_scene [none]  px.soundscape [none]  px.edit_sequence [none]
studio: acad.analysis
capabilities: an.scene [llm]  an.shot [llm]  an.movement [llm]  an.lighting [llm]
              an.editing [llm]  an.sound [llm]  an.narrative [llm]  an.visual_storytelling [llm]
```

12.22 **FAMILY: PLATFORM** — phase 1 — always enabled

```
studio: platform.hub
capabilities: hb.create_project [none]  hb.templates [none]  hb.recent [none]
              hb.search [none]  hb.notifications [none]  hb.credits [none]
studio: platform.graph
capabilities: gr.explore [none]  gr.impact_analysis [none]  gr.dependency_view [none]
              gr.orphan_detection [none]
studio: platform.assets
capabilities: au.search [none]  au.filter [none]  au.preview [none]  au.reuse [none]
              au.rights [none]  au.bulk_ops [none]
studio: platform.jobs
capabilities: jb.queue_view [none]  jb.retry [none]  jb.cancel [none]  jb.costs [none]
              jb.dead_letter [none]
studio: platform.agents
capabilities: ag.chat [llm]  ag.plan_review [none]  ag.approve_step [none]  ag.trace [none]
studio: platform.review
capabilities: rv.compare [none]  rv.annotate [none]  rv.approve [none]  rv.request_changes [none]
```

12.23 **Registry totals.** 111 studios across 22 registry family groups (mapping to the 38 named department
families in the summary edition), with 960+ capability declarations. Counts are enforced by
`tests/registry.spec.ts`: every studio in this section must exist in the `studios` table seed, and every
capability must exist in `studio_capabilities` with matching keys and capability tags.

---

## 13. STUDIO CONTRACT & CROSS-STUDIO PROPAGATION

13.1 **Universal shell.** Every studio route renders the same shell:
```
<StudioShell studioKey phase>
  <StudioHeader/>        name, status pill, gate state, quick actions
  <StudioTabs/>          Overview | Workspace | Assets | Tools | Agents | References | Workflow | Tasks | Versions | Reviews | Approvals | History | Export
  <StudioCanvas/>        the discipline-specific surface
  <StudioRail/>          context: linked artifacts, continuity warnings, cost meter
</StudioShell>
```
13.2 Tabs are declared per studio in `studios.config` and may be hidden. Tabs must never be invented in a component; they come from config.
13.3 **Every studio must implement**: save (autosave 2 s debounce), version list, restore, export, history, and empty state with a primary action.
13.4 Empty states must teach: one sentence of purpose, one primary action, one example.
13.5 **Capability invocation contract.**
```ts
type CapabilityCall = {
  capability: string;                 // 'story.screenplay.script.write_scene'
  projectId: string;
  input: Record<string, unknown>;      // validated against studio_capabilities.inputs
  refs?: { artifactIds?: string[]; assetIds?: string[]; sceneId?: string; shotId?: string };
  options?: { async?: boolean; providerKey?: string; maxCostCredits?: number; dryRun?: boolean };
};
type CapabilityResult = {
  artifactId?: string; versionId?: string; assetIds?: string[];
  jobId?: string; text?: string; data?: unknown;
  cost?: { credits: number; usd: number }; warnings?: Finding[];
};
```
13.6 **Write scoping.** A studio may write only to `creative_artifacts` it owns (matching `studio_key`) and to its own `studio_settings`. To change another studio's artifact it must create an artifact with `relation = 'derives_from'` and request a merge via an approval gate.
13.7 **Approved/locked artifacts are immutable.** Any attempt returns `409 ARTIFACT_LOCKED` with the owning studio and the gate that locked it.
13.8 **Propagation example (normative).** A scene edit in `story.screenplay` produces a change event that:
   1. marks dependent `shot_spec` artifacts stale (`stale = true` in metadata),
   2. creates `workflow_tasks` for scene analysis, breakdown, shot plan refresh,
   3. adds a continuity check job,
   4. notifies owners of downstream studios,
   5. does **not** auto-overwrite any approved artifact.
13.9 **Staleness rule.** If an upstream artifact version changes and downstream metadata `derivedFromVersion` differs, the downstream artifact shows a stale badge and blocks final export until refreshed or explicitly waived (waiver recorded in `audit_events`).
13.10 **Gate catalog** (minimum): `concept_lock`, `vision_lock`, `visual_direction_lock`, `screenplay_lock`, `shot_plan_lock`, `character_lock`, `world_rule_lock`, `canon_lock`, `cut_lock`, `picture_lock`, `delivery_lock`, `pitch_deck_lock`, `rights_clearance`.
13.11 A gate blocks the dependent capability until `approvals.status = 'approved'`.
13.12 Gates are per project and per phase; the Hub shows a readiness checklist derived from gate state.

---

## 14. INTELLIGENCE ENGINE & AI WORKFORCE

14.1 **Architecture.**
```
User intent
  -> Intent Router (classify: studio, capability, entities, constraints)
  -> Context Assembler (project graph slice + canon + locks + prior artifacts + references)
  -> Planner (produces an ordered plan of capability calls with gates)
  -> Executor (calls capabilities; may be async)
  -> Critic (validates output against constraints, continuity, and craft rubrics)
  -> Persister (artifact_versions + provenance + model_runs)
  -> Presenter (UI summary, diff, next actions)
```
14.2 **Context assembly budget.** Default 12k tokens of context; priority order: locked canon > active scene > character profiles in scene > world rules in scene > style bible > references > history summary. Never exceed budget silently — log truncations in `provenance`.
14.3 **Intent router output contract.**
```json
{ "intent": "write_scene", "studioKey": "story.screenplay", "capability": "script.write_scene",
  "entities": {"projectId":"...","sceneId":"..."}, "constraints": ["no on-the-nose dialogue"],
  "confidence": 0.86, "clarificationNeeded": false }
```
14.4 If `confidence < 0.65` and the action is consequential, the router must ask exactly one clarifying question with 2–4 options.
14.5 **Agent roster (minimum viable, phase 1–2).**

| agent_key | role | scope | tools |
|---|---|---|---|
| `idea_agent` | Concept developer | development | llm, artifacts.read, references.read |
| `research_agent` | Researcher | development | llm, web (policy-gated), references.write |
| `development_agent` | Story developer | development/story | llm, artifacts.read |
| `story_agent` | Structural editor | story | llm, scenes.read/write |
| `screenwriter_agent` | Screenwriter | story | llm, scenes.write, characters.read |
| `narrative_intelligence_agent` | Continuity of story logic | story | llm, full graph read |
| `dialogue_agent` | Dialogue doctor | story | llm, character voice profiles |
| `breakdown_agent` | Script supervisor | story/production | llm, parser, elements.write |
| `world_agent` | Worldbuilder | world | llm, canon.read/write(draft) |
| `timeline_agent` | Chronologist | world | llm, timeline.read/write |
| `lore_agent` | Lore keeper | world | llm, canon.read |
| `franchise_agent` | Canon manager | world | llm, canon.lock(request) |
| `character_agent` | Character designer | character | llm, characters.write |
| `psychology_agent` | Behavior analyst | character | llm |
| `appearance_agent` | Visual identity | character | image, identity locks |
| `performance_agent` | Performance director | character | video, voice |
| `director_agent` | Director | direction | llm, scene.read |
| `visual_direction_agent` | Look developer | direction | llm, image |
| `dp_agent` | Cinematographer | cinematography | llm, shot specs |
| `design_agent` | Production designer | design | llm, image |
| `storyboard_agent` | Storyboard artist | storyboard | image |
| `vfx_supervisor_agent` | VFX planning | vfx | llm, shot specs |
| `generation_agent` | Render operator | generation | provider abstraction |
| `sound_agent` | Sound designer | sound | sfx |
| `voice_agent` | Voice director | voice | voice |
| `composer_agent` | Composer | music | music |
| `editor_agent` | Editor | editing | llm, timeline |
| `continuity_agent` | Continuity supervisor | continuity | llm, graph read |
| `qc_agent` | QA | continuity | checks |
| `trailer_agent` | Trailer editor | marketing | llm, media |
| `producer_agent` | Producer | production | llm, budget, schedule |
| `mentor_agent` | Teacher | academy | llm, artifacts.read |

14.6 **Agent definition contract.**
```ts
type AgentDef = {
  key: string; name: string; role: string;
  systemPrompt: string;               // versioned, stored in repo not DB
  capabilityScopes: string[];         // prefix allowlist e.g. ['story.*','character.read']
  tools: string[];                    // registry tool ids
  contextPolicy: { maxTokens: number; required: string[]; prefer: string[] };
  outputSchema?: JSONSchema;          // when structured output required
  guardrails: string[];               // e.g. 'no_real_person_likeness','cite_sources'
  modelPolicy: { capability: 'llm'; tier: 'fast'|'balanced'|'deep' };
};
```
14.7 **Every agent output must include `assumptions` and `openQuestions`.** No silent invention of canon.
14.8 **Critic pass.** For any artifact marked `canonical`, a second model call with a rubric checks: constraint adherence, continuity, craft, and factual flags. Failures return as warnings, never silent rewrites.
14.9 **Tool registry (minimum).** `graph.read`, `graph.write`, `artifact.read/write/version`, `asset.read/write`, `scenes.read/write`, `shots.read/write`, `characters.read/write`, `canon.read/write`, `references.read/write`, `search.all`, `provider.invoke`, `jobs.enqueue/status`, `approvals.request`, `notify.user`, `export.render`.
14.10 Tools enforce permissions server-side; an agent cannot exceed the requesting user's role (Section 17).
14.11 **Determinism policy.** Any capability with a deterministic implementation (`[none]`) must not call an LLM. This keeps cost low and output stable.
14.12 **Trace.** Each agent run stores `{steps, toolCalls, tokens, cost, modelRuns[]}` and is viewable in the Agent Console.

---

## 15. PROVIDER ABSTRACTION & JOB LIFECYCLE

15.1 **Interface (all providers).**
```ts
interface ProviderAdapter<I, O> {
  key: string; capability: 'llm'|'image'|'video'|'voice'|'music'|'sfx'|'embedding'|'upscale';
  models(): ModelInfo[];                     // id, context, modalities, price
  estimate(input: I): { credits: number; usd: number };
  invoke(input: I, signal: AbortSignal): Promise<{ output: O; run: RunMeta }>;
  poll?(jobHandle: string): Promise<{ status: JobStatus; output?: O; run?: RunMeta }>;
  cancel?(jobHandle: string): Promise<void>;
}
```
15.2 **Model routing.** `modelPolicy.tier` maps to a provider model via workspace config: `fast` for UI-time helpers, `balanced` for drafting, `deep` for canonical artifacts. Fallback chain: default provider → secondary → error with actionable message.
15.3 **Prompt construction.** Structured spec → prompt builder (`gen.control.prompt_builder`). Prompts are composed of: subject, action, environment, lighting, lens, style, continuity locks, negatives. Freeform user prompt is appended, never replaces the structured block.
15.4 **Job lifecycle.**
```
queued -> running -> (succeeded | failed) -> [retry x3] -> dead_letter
queued -> awaiting_approval (cost over threshold or moderation flag) -> running
any -> cancelled (user action, refund by policy)
```
15.5 **Idempotency.** `generation_jobs.idempotency_key = sha256(projectId|capability|canonicalInput)`. Duplicate submits return the existing job.
15.6 **Progress.** Providers that support progress update `progress`; otherwise progress is time-estimated and marked `estimated: true`.
15.7 **Cost accounting.** On success: `actual_cost` from provider usage; always write `cost_records`. On failure: write estimated cost as 0 unless the provider bills on failure (adapter flag).
15.8 **Credits.** Balance decremented at `queued` (hold) and settled at terminal state (release difference). Insufficient credits block queueing with an explicit top-up action.
15.9 **Moderation.** Input and output pass policy check. Blocked generations write a `quality_reports` row of type `policy` and are never stored as assets.
15.10 **Retention.** Generated assets retained per plan; Jobs keep metadata permanently, binaries subject to workspace retention.
15.11 **Offline/degraded mode.** If all providers for a capability are down, the UI shows capability-specific fallback (e.g. write the shot spec, defer render) and queues nothing silently.

---

## 16. API & EVENT CONTRACT

16.1 **API style.** Typed RPC-style endpoints under `/api/v1` plus Supabase direct reads for lists. All mutations go through endpoints (no direct table writes from client).
16.2 **Core endpoints (minimum set).**
```
POST   /api/v1/projects
GET    /api/v1/projects?workspaceId&cursor
GET    /api/v1/projects/:id/graph?depth=2
POST   /api/v1/projects/:id/capabilities/:capabilityKey
GET    /api/v1/artifacts/:id
GET    /api/v1/artifacts/:id/versions
POST   /api/v1/artifacts/:id/versions
POST   /api/v1/artifacts/:id/approve
POST   /api/v1/artifacts/:id/request-changes
GET    /api/v1/assets?kind&tags&q&cursor
POST   /api/v1/assets/upload-url
POST   /api/v1/assets/:id/versions
GET    /api/v1/jobs?status&projectId
POST   /api/v1/jobs/:id/retry
POST   /api/v1/jobs/:id/cancel
GET    /api/v1/approvals?status=pending
POST   /api/v1/approvals/:id/decide
GET    /api/v1/search?q&scope
POST   /api/v1/agents/:key/run
GET    /api/v1/agents/runs/:runId
POST   /api/v1/exports
GET    /api/v1/usage?from&to
```
16.3 **Envelope.**
```json
{ "ok": true, "data": {}, "meta": { "cursor": "...", "cost": {"credits":0,"usd":0} },
  "warnings": [], "error": null }
```
16.4 Errors use stable codes: `AUTH_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION`, `ARTIFACT_LOCKED`,
`GATE_PENDING`, `INSUFFICIENT_CREDITS`, `PROVIDER_UNAVAILABLE`, `RATE_LIMITED`, `CONFLICT`, `POLICY_BLOCKED`.
16.5 **Events (outbox table + realtime broadcast).**
```
artifact.created | artifact.updated | artifact.approved | artifact.locked | artifact.stale
asset.created | asset.version.created | asset.rights.missing
job.queued | job.progress | job.succeeded | job.failed | job.dead_letter
gate.requested | gate.decided
scene.updated | shot.updated | shot.continuity.changed
cost.recorded | credits.low | budget.threshold
agent.run.started | agent.run.finished
```
16.6 Event payload: `{ id, type, workspaceId, projectId?, subjectType, subjectId, actor, at, data }`.
16.7 At-least-once delivery; consumers must be idempotent by `event.id`.
16.8 Realtime channels: `ws:{workspaceId}`, `proj:{projectId}`, `job:{jobId}`. Presence only on project channel.
16.9 **Search.** Unified search across artifacts (title + body_text), assets (name + tags), scenes (slug + synopsis), characters (name + bio), references. Postgres FTS + trigram; embeddings optional `[FUTURE]`.
16.10 Rate limits: 60 capability calls/min/user, 10 concurrent jobs/project, 300 asset uploads/min/workspace.

---

## 17. PERMISSIONS & SECURITY

17.1 **Role capability matrix.**

| action | owner | admin | producer | supervisor | artist | reviewer | viewer |
|---|---|---|---|---|---|---|---|
| invite members | Y | Y | N | N | N | N | N |
| manage billing | Y | Y | N | N | N | N | N |
| manage providers | Y | Y | N | N | N | N | N |
| create project | Y | Y | Y | N | N | N | N |
| delete project | Y | Y | N | N | N | N | N |
| approve gate | Y | Y | Y | Y | N | N | N |
| lock artifact | Y | Y | Y | Y | N | N | N |
| edit artifact | Y | Y | Y | Y | Y (own studio) | N | N |
| run generation | Y | Y | Y | Y | Y | N | N |
| comment | Y | Y | Y | Y | Y | Y | Y |
| view assets | Y | Y | Y | Y | Y | Y | Y |
| export master | Y | Y | Y | N | N | N | N |

17.2 Server enforces the matrix; the UI hides but never substitutes for enforcement.
17.3 **Secrets.** Provider keys stored in a secret manager and referenced by `credential_ref`; never returned to clients; rotated without redeploy.
17.4 **Signed URLs** expire in 10 minutes; downloads for delivery use 24-hour links scoped to the deliverable.
17.5 **Audit.** Every mutation writes `audit_events` with before/after for the changed fields.
17.6 **Data export/delete.** Workspace export produces a ZIP with JSON graph + assets; deletion is a 30-day soft workflow with owner confirmation.
17.7 **Rights enforcement.** Generation involving a real person's voice or likeness requires an active `rights_records` entry; otherwise `POLICY_BLOCKED`.
17.8 **Content policy.** No generation of operational harm instructions, sexual content involving minors, or non-consensual likeness. Fictional violence and mature themes allowed with a content rating field on the project.
17.9 **PII.** Free-text project fields may contain PII; enforce retention, redaction on export when requested, and no PII in logs.
17.10 **Abuse.** Per-workspace and per-IP throttles; repeated policy blocks escalate to manual review queue.

---

## 18. IMPLEMENTATION PHASES (EXECUTION ORDER)

> Rule: a phase is complete only when every listed acceptance criterion is verified by a test or a
> recorded manual check. Do not start phase N+1 while phase N has open `block` findings.

### Phase 0 — Foundation (must precede everything)

Deliverables
```
[ ] Repo scaffolding: src/app, src/features, src/studios, src/lib, src/api, supabase/, tests/, scripts/
[ ] Design tokens + theme + StudioShell + CommandPalette + Toast + Dialog + EmptyState
[ ] Auth: signup, login, magic link, session persistence, workspace bootstrap on first login
[ ] Workspaces + members + invitations + role guards
[ ] Migrations 0001..0010 from Section 11 with RLS and triggers
[ ] Seed: studios, studio_capabilities, capability tags, gate catalog, role matrix
[ ] API envelope, error codes, auth middleware, rate limiting
[ ] Job table + worker skeleton + realtime status channel
[ ] Provider adapter interface + one LLM adapter + mock adapter for tests
[ ] CI: typecheck, lint, unit, e2e smoke, migration integrity, registry integrity
```
Acceptance
```
A0.1 New user signs up, lands in Hub, creates a project in <= 60 s.
A0.2 Registry seed matches Section 12 exactly (count + keys) via test.
A0.3 Every tenant table has RLS; test proves cross-workspace read returns zero rows.
A0.4 A queued job reaches `succeeded` via mock provider and streams status to the client.
A0.5 CI green on a clean clone with no manual steps beyond env vars.
```

### Phase 1 — Creative Foundation

Studios: `development.idea`, `development.research`, `development.creative`, `development.packaging`,
`story.architecture`, `story.screenplay`, `story.narrative_intelligence`, `story.dialogue`,
`story.breakdown`, `world.*` (architect, timeline, lore, franchise), `character.*`, `direction.director`,
`platform.*`.

Deliverables
```
[ ] Idea Studio with capture, directions, compare, promote-to-project
[ ] Research Studio with dossier + citations + reference library
[ ] Story Architecture with 8+ structural templates and beat sheet editor
[ ] Screenplay editor: Fountain import/export, scene navigator, revision colors, lock
[ ] Narrative Intelligence: thread map, tension curve, plot-hole report
[ ] Dialogue pass with character voice fingerprints
[ ] Breakdown: parse -> elements -> per-scene sheet -> CSV export
[ ] World bible: rules, geography, culture, timeline with contradiction check
[ ] Character studio: profile, psychology, relationships, identity lock
[ ] Director: treatment + per-scene direction with 8 questions
[ ] Canon system: canon entries, lock levels, conflict detection
[ ] Project graph explorer with impact analysis
```
Acceptance
```
A1.1 From a one-sentence idea, a user produces: logline, treatment, 5-page scene, 3 characters,
     1 location, and a beat sheet, all stored as versioned artifacts, in under 20 minutes.
A1.2 Screenplay round-trips Fountain without loss (byte-normalized comparison on a fixture).
A1.3 Breakdown on the fixture script achieves >= 90% element recall and <= 5% false positives.
A1.4 Plot-hole check returns findings referencing valid scene IDs and severities.
A1.5 Character identity lock blocks image generation without the lock present.
A1.6 Locking the screenplay makes downstream scene writes return ARTIFACT_LOCKED.
A1.7 Canon conflict test: two contradictory world rules raise a `block` finding.
A1.8 Every Phase 1 studio has: empty state, autosave, version list, restore, export.
```

### Phase 2 — Visual Development

Studios: `direction.visual`, `cine.*`, `design.*`, `sb.*`, `gen.image`, `gen.video`, `gen.control`,
`gen.consistency`.

Deliverables
```
[ ] Look bible with palette hex codes, texture, lighting and composition philosophies
[ ] Shot designer producing the 18-field shot spec with validation
[ ] Camera/lens/composition/movement studios feeding the spec
[ ] Lighting plan with diagram generation and source continuity
[ ] Production design, sets, locations, props, costume, makeup with reference sheets
[ ] Storyboard panels generated per shot with annotation and revision
[ ] Animatic assembly from panels with temp voice and temp music
[ ] Image generation with reference locking, inpaint/outpaint, upscale
[ ] Video generation with first/last frame, camera motion, continuation
[ ] Consistency engine enforcing character/location/wardrobe/prop/camera/lighting/style locks
[ ] Cost estimate shown before every generation; actual recorded after
```
Acceptance
```
A2.1 A 10-shot sequence generates with >= 90% character identity stability measured by
     descriptor similarity plus human spot-check on a 20-image sample.
A2.2 Shot spec validation rejects incomplete specs with field-level messages.
A2.3 Generation without a required lock is refused with a one-click "create lock" path.
A2.4 Storyboard for a 5-page scene produces one panel per shot and plays as an animatic.
A2.5 Switching providers for the same capability requires config only, no code change.
A2.6 Estimated vs actual cost variance reported per job; ledger totals reconcile to credits.
A2.7 Video continuation extends a shot with continuous motion and matching grade on 3/3 fixtures.
```

### Phase 3 — Production

Studios: `prod.*`, `cine.shot_design` (shot management), `anim.*`, `vfx.*`, `int.virtual_production`,
`platform.assets`, `platform.jobs`.

Deliverables
```
[ ] Producer dashboard: scope, gates, deliverables, risks
[ ] Budget with department lines, generation cost projections, scenarios, tracking
[ ] Schedule with scene days, dependencies, milestones, deadline alerts
[ ] Coordination: task assignment, review requests, approvals, status board
[ ] Asset management: versions, dependency graph, reuse across projects, permissions
[ ] Shot management board: status per shot, coverage, missing elements
[ ] Animation studios (2D/3D/mocap/creature/motion graphics) with take management
[ ] VFX planning, simulation planning, compositing review with version compare
[ ] Virtual production planning surface (LED wall, realtime preview plan)
```
Acceptance
```
A3.1 Budget auto-derives from breakdown + shot list and reconciles within 5% of actuals on a test project.
A3.2 Schedule detects circular dependencies and blocks save.
A3.3 Asset reuse across two projects preserves rights metadata and records usage in both.
A3.4 Coverage report flags scenes with no master or no reaction coverage.
A3.5 VFX review compares two versions with synchronized scrubbing and per-region zoom.
A3.6 Deleting an asset in use requires reassignment or explicit cascade confirmation.
```

### Phase 4 — Audio & Post

Studios: `snd.*`, `voice.*`, `mus.*`, `edit.*`, `qc.*`.

Deliverables
```
[ ] Sound design plan per scene; foley/ambience/SFX libraries and layering
[ ] Spatial audio configuration (stereo → Atmos-compatible metadata)
[ ] Voice studio with authorized voice profiles, performance direction, consistency
[ ] ADR and dubbing workflows with lip-sync alignment
[ ] Subtitle generation, editing, timecode sync, accessibility captions
[ ] Music direction, composition, orchestration, stem management
[ ] Music sync with beat mapping and cue sheets; rights/clearance register
[ ] Editing timeline with multitrack, proxies, multicam, transitions
[ ] AI editing: script-to-edit, best take, silence removal, rough cut, alternative cuts
[ ] Color: correction, grading, shot matching, LUTs, look dev
[ ] Finishing: conform, titles, credits, master export
[ ] All five QC checkers with finding schema and report export
```
Acceptance
```
A4.1 A 3-minute cut assembles from approved shots with audio sync drift < 1 frame.
A4.2 Loudness target met (-14 LUFS web, -23 LUFS broadcast) with a report per master.
A4.3 Subtitle timing drift < 100 ms against the master on a 5-minute fixture.
A4.4 Continuity report catches 3 planted errors in a fixture sequence (wardrobe, prop, time-of-day).
A4.5 Visual QA flags identity drift above threshold with shot-level evidence.
A4.6 Picture lock prevents further timeline edits until unlocked by an authorized role.
A4.7 Export produces a master + subtitles + QC report in one deliverable package.
```

### Phase 5 — Commercial & Expansion

Studios: `mkt.*`, `doc.*`, `int.*`, `acad.*`.

Deliverables
```
[ ] Trailer studio: concept, structure, highlights, music, cut, platform versions
[ ] Poster/key art studio with typography integration
[ ] Marketing campaign planning and social asset generation
[ ] Distribution: platform specs, deliverable matrix, calendar, festival list, tracking
[ ] Documentary, interview, educational, news studios
[ ] Animated film, game cinematics, interactive story, virtual production execution
[ ] Academy: 12 tracks, lessons, exercises, mentor critique, progress
[ ] Localization end-to-end (dub + sub + poster variants)
```
Acceptance
```
A5.1 A 60-second trailer is produced from an approved cut with music and sound design in one session.
A5.2 Poster set (teaser, character, ensemble) generated with consistent typography and title treatment.
A5.3 Delivery matrix validates a master against a chosen platform spec and lists exact failures.
A5.4 Interactive story exports a playable branching JSON with 3 endings and state validation.
A5.5 Mentor critique references specific timestamps and craft terms from the rubric.
A5.6 Course completion updates progress and unlocks the next exercise.
```

---

## 19. DEFINITION OF DONE (APPLIES TO EVERY CAPABILITY)

```
D1  Capability is registered in `studio_capabilities` with inputs, outputs, and capability tags.
D2  Server validates input against the declared schema; invalid input returns VALIDATION with field paths.
D3  Permission check runs server-side and matches Section 17.
D4  Result persists as an artifact version with provenance (agent, run ids, model).
D5  Cost is estimated before execution and recorded after; UI shows both.
D6  Failure returns an actionable message and a retry path; no silent failure.
D7  UI has: loading, empty, error, success states; keyboard reachable; labelled controls.
D8  Unit tests cover happy path + 2 edge cases; integration test covers permission + persistence.
D9  No console errors; no unhandled promise rejection; no layout shift > 0.1 CLS.
D10 Strings are i18n keys; no hardcoded copy in components.
D11 Works on 1280px and 390px widths without horizontal scroll.
D12 Feature flag exists if the capability is `[FUTURE]` or provider-dependent.
D13 Documentation entry added to `docs/studios/{studioKey}.md`.
D14 Telemetry event emitted: `capability_invoked`, `capability_succeeded`, `capability_failed`.
```

---

## 20. CONTINUITY & QUALITY RULES ENGINE

20.1 **Rule expression format.**
```json
{ "type": "wardrobe", "subject": "character:CH-0004", "scope": "scene:SC-012..SC-018",
  "assert": "outfit_id == 'OUT-03'", "severity": "block",
  "evidence": ["asset:AST-1203"], "message": "Mira wears the field coat until SC-019." }
```
20.2 Supported rule types: `wardrobe`, `prop`, `lighting`, `geography`, `timeline`, `world_rule`, `identity`, `audio_perspective`, `screen_direction`.
20.3 `block` prevents export and generation; `warn` shows a badge; `info` is informational.
20.4 Checks run: on artifact approval, on shot generation, on timeline save, and on demand.
20.5 **Narrative checks** are LLM-based but must cite scene IDs and quote the offending line.
20.6 **Visual checks** compare identity descriptors against the identity lock and report a similarity score with threshold 0.85 default (configurable).
20.7 **Audio checks** compute loudness, true peak, clipping count, and sync offset; all numeric findings include the measured value.
20.8 **Delivery checks** validate against a platform preset table (`platform_specs` seed) with exact field-level pass/fail.
20.9 Every report is stored in `quality_reports` and linked to the subject; reports are immutable once created.
20.10 False-positive feedback is captured (`finding_feedback`) and used to tune thresholds per workspace.

---

## 21. TESTING STRATEGY

21.1 **Unit** (Vitest): pure logic — validation, formatting, cost math, rule evaluation, diffing.
21.2 **Integration**: capability call → DB persistence → event emission, using a local Postgres and mock providers.
21.3 **Contract**: every provider adapter passes a shared suite (estimate, invoke, poll, cancel, error mapping).
21.4 **Registry**: seed equals Section 12; no orphan capability; every capability has a doc file.
21.5 **RLS**: matrix test per table per role — allowed and denied paths.
21.6 **E2E** (Playwright): the five journeys in Section 4, at least one per phase.
21.7 **Visual regression** on StudioShell, editor, timeline, and review room.
21.8 **Performance**: budgets from Section 9 asserted in CI with seeded 10k-artifact project.
21.9 **Accessibility**: axe on every route; keyboard-only path test for the golden path.
21.10 **Fixtures**: one 5-page Fountain script, one 20-scene breakdown fixture, 20 reference images, 3 video clips, 5 audio beds, 1 character sheet.
21.11 **Golden outputs**: canonical prompts snapshot-tested so prompt changes are intentional.
21.12 Test data never calls real paid providers in CI; a `mock` adapter covers all capabilities.

---

## 22. REPOSITORY & FILE MAP (NORMATIVE)

```
src/
  app/
    router.tsx                 route table from Section 6
    providers.tsx              query client, auth, theme, toasts
    layout/                    Shell, LeftRail, TopBar, CommandPalette
  features/
    hub/  projects/  graph/  assets/  jobs/  agents/  review/  academy/  settings/
  studios/
    registry.ts                generated from Section 12 seed
    shells/StudioShell.tsx
    shared/                    ArtifactEditor, VersionBar, GateBanner, EmptyState, CostMeter
    development/{idea,research,creative,packaging}/
    story/{architecture,screenplay,narrative,dialogue,breakdown}/
    world/{architect,timeline,lore,franchise}/
    character/{architect,psychology,appearance,performance,relationship,casting,continuity}/
    direction/{director,visual,scene,performance}/
    cine/{dp,camera,lens,composition,movement,shot,lighting}/
    design/{production,set,location,props,costume,makeup}/
    storyboard/{board,previs,animatic,sequence}/
    vfx/{development,simulation,compositing,environment,review}/
    animation/{2d,3d,mocap,creature,motion}/
    generation/{image,video,control,consistency}/
    sound/{design,foley,ambient,edit,spatial,continuity}/
    voice/{studio,acting,adr,dubbing,subtitle}/
    music/{direction,composition,orchestration,production,sync,rights}/
    editing/{timeline,ai,assistant,color,finishing}/
    qc/{continuity,narrative,visual,audio,delivery}/
    marketing/{trailer,poster,campaign,distribution}/
    documentary/{production,interview,educational,news}/
    interactive/{animated,game,story,virtual}/
    production/{producer,budget,schedule,coordination,assets}/
    academy/{craft,mentor,practice,analysis}/
  lib/
    api/                       client + typed endpoints + error codes
    graph/                     project graph queries + impact analysis
    continuity/                rule evaluation + lock resolution
    cost/                      estimation + ledger
    i18n/                      keys + locale files
  server/
    api/                       route handlers per resource
    capabilities/              one module per studio capability group
    agents/                    agent defs + planner + critic
    providers/                 adapters: llm, image, video, voice, music, sfx, mock
    jobs/                      queue, worker, retry, dead letter
    moderation/                policy checks
    search/                    FTS queries
supabase/
  migrations/                  0001_init ... NNNN_
  seed/                        studios.json, capabilities.json, gates.json, platform_specs.json
tests/
  unit/ integration/ contract/ rls/ e2e/ fixtures/ registry.spec.ts
docs/
  studios/{studioKey}.md       one per studio, generated stub + hand notes
  api/ agents/ workflows/
```

22.1 `src/studios/registry.ts` is generated by `scripts/generate-registry.ts` from `supabase/seed/studios.json` + `capabilities.json`. Never hand-edit it.
22.2 Adding a studio = seed rows + folder + route + doc file. No core edits.
22.3 Feature flags live in `src/lib/flags.ts` keyed by `studioKey` and `phase`.

---

## 23. BUILD PROTOCOL FOR AI AGENTS

23.1 Work in vertical slices: DB → server capability → UI → test → doc. One capability per slice.
23.2 Never start a new studio until the previous studio passes D1–D14 for at least its first three capabilities.
23.3 At the start of every slice, output a 5-line plan: capability, inputs, outputs, persistence, test.
23.4 At the end of every slice, run: `npm run typecheck`, `npm run lint`, `npm run test`, and confirm registry test passes.
23.5 Prefer deterministic implementations for anything enumerable (breakdown parsing, formatting, cost math, rule evaluation).
23.6 When a provider is unavailable in the environment, use the mock adapter and mark the capability `providerDependent: true`.
23.7 Keep prompts in `src/server/agents/prompts/{agentKey}.ts`, versioned with a `PROMPT_VERSION` constant; changes require a snapshot update.
23.8 Any new enum value, table, or event requires a PRD update in the same change.
23.9 Never remove a capability from the registry; deprecate with `enabled: false` and a `deprecation` note.
23.10 Do not build the full graph UI before Phase 1 capabilities produce real data.
23.11 Prefer composition: a capability reuses existing artifacts rather than regenerating them.
23.12 If a requirement conflicts with an existing implementation, stop and report the conflict with both sides; do not silently pick one.
23.13 File naming: components `PascalCase.tsx`, logic `camelCase.ts`, seeds `kebab-case.json`, migrations `NNNN_snake_case.sql`.
23.14 No comments in code. JSDoc only on exported library functions.
23.15 Every PR-sized change must keep the app runnable; no half-migrated states.

---

## 24. RISK REGISTER

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | Provider API drift breaks generation | High | Adapter contract tests + version pinning + mock in CI |
| R2 | Identity drift across shots | High | Continuity locks + descriptor scoring + threshold gates |
| R3 | Cost overrun for users | High | Pre-estimate, caps, holds, ledger reconciliation |
| R4 | Rights/likeness misuse | Critical | rights_records gate + policy checks + audit |
| R5 | Studio sprawl slows delivery | Medium | Phase gates, capability budget per phase, registry test |
| R6 | Graph queries slow at scale | Medium | Indexes, pagination, materialized views for impact analysis |
| R7 | Artifact inconsistency across studios | High | Single graph, staleness flags, merge via gates |
| R8 | Timeline/editor complexity | Medium | Start with assembly + trim; advanced NLE parity later |
| R9 | Prompt regressions | Medium | Snapshot tests + prompt versioning |
| R10 | Moderation false positives | Low | Explainable block reasons + appeal path |
| R11 | Audio sync drift | Medium | Frame-accurate conform checks + QC numeric assertions |
| R12 | Mobile scope creep | Low | Read/approve only until Phase 5 completes |

---

## 25. SUCCESS METRICS

25.1 **Activation:** % of new users who complete idea → beat sheet within first session (target 40%).
25.2 **Time to first cut:** median hours from project creation to first assembled sequence (target < 6 h).
25.3 **Consistency rate:** % of generated shots passing continuity without re-generation (target 85%).
25.4 **Rework rate:** % of artifacts regenerated within 24 h (target < 30%).
25.5 **Cost per finished minute** by project type; published in usage dashboard.
25.6 **Studio adoption:** studios used per active project (target 6+ by week 4).
25.7 **Gate throughput:** median time a gate stays pending (target < 12 h).
25.8 **Quality:** QC `block` findings per finished minute (trend down).
25.9 **Retention:** week-4 return rate of creators with an active project (target 45%).
25.10 **Reliability:** job success rate (target 97% excluding policy blocks).

---

## 26. APPENDICES

### 26.1 Seed example — one studio row
```json
{
  "key": "story.screenplay",
  "family": "story",
  "name": "Screenplay Studio",
  "purpose": "Write and revise the screenplay with craft controls.",
  "phase": 1,
  "route": "/p/:projectId/screenplay",
  "icon": "pen-line",
  "sort_order": 22,
  "enabled": true,
  "config": {
    "tabs": ["overview","workspace","assets","tools","agents","references","versions","reviews","export"],
    "editor": "fountain",
    "autosaveMs": 2000,
    "gates": ["screenplay_lock"]
  }
}
```

### 26.2 Seed example — one capability row
```json
{
  "studio_key": "story.screenplay",
  "key": "script.write_scene",
  "name": "Write scene",
  "description": "Draft a scene from an objective, conflict, and end beat.",
  "inputs": [
    {"name":"sceneId","type":"uuid","required":true},
    {"name":"objective","type":"string","required":true},
    {"name":"endBeat","type":"string","required":true},
    {"name":"tone","type":"string","required":false}
  ],
  "outputs": [{"name":"artifactVersionId","type":"uuid"}],
  "requires_capability": ["llm"],
  "agent_key": "screenwriter_agent",
  "workflow_key": null,
  "enabled": true
}
```

### 26.3 Structured prompt template (all generation)
```
[SUBJECT]        {character locks, wardrobe, prop}
[ACTION]         {beat-level action}
[ENVIRONMENT]    {location lock, time of day, weather}
[LIGHTING]       {lighting plan reference, source, quality}
[OPTICS]         {lens mm, aperture, shot size, angle, movement}
[STYLE]          {look bible palette, texture, grade}
[CONTINUITY]     {identity ids, previous shot, screen direction}
[NEGATIVES]      {artifacts to avoid, policy constraints}
[OUTPUT]         {aspect, duration, fps, resolution}
```
Rule: `[SUBJECT]`, `[ENVIRONMENT]`, `[CONTINUITY]` are assembled from locks, never typed by the user.

### 26.4 Gate readiness checklist shown in Hub
```
Concept lock ....... approved
World rules ........ approved
Screenplay ......... in review
Shot plan .......... 12/40 shots specified
Identity locks ..... 3/5 characters
Look bible ......... approved
Rights ............. 2 missing
Cut ................ not started
Picture lock ....... blocked by 4 continuity findings
```

### 26.5 Example project settings JSON
```json
{
  "contentRating": "PG-13",
  "defaultProviderTier": "balanced",
  "generation": { "maxCostPerJobCredits": 40, "requireEstimateConfirm": true },
  "continuity": { "identityThreshold": 0.85, "blockOnMissingLock": true },
  "export": { "defaultPreset": "web-1080p", "burnSubtitles": false }
}
```

### 26.6 Change log policy
Every PRD change must bump `Version` at the top and add a line to this section stating what changed and which sections are affected.

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-11-19 | Initial master specification: vision, architecture, data model, studio registry (111 studios / 960+ capability declarations), intelligence engine, provider abstraction, API, permissions, phases, DoD, QA rules, testing, build protocol, risks, metrics. |

---

## 27. FINAL PRINCIPLE

CreativeOS is not a generator with a story tab. It is a studio complex where every discipline has a room,
every room speaks to the same project graph, and an AI workforce carries work from idea to deliverable —
with the human holding the locks that matter.


