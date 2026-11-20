# 1. Database Schema

The project ships **125 SQL migration files** under `supabase/migrations/`, timestamped from `20260307160609_*` through `20260712042158_*`. Reading them in order tells the story of the product: it started as a simple "daily guide + journal" app (March 2026), grew a consciousness-engine/loops/memory layer (April), then a full **Temple** mythos (early April), an **enterprise** B2B wellness product (March–May), and finally a **karma/games/constellation** gamification layer (May–July).

Across all migrations there are **~200+ distinct tables** (some names are re-declared with `CREATE TABLE IF NOT EXISTS` across files as the schema was iterated). Below they are grouped by domain, each with representative column definitions and RLS excerpts pulled directly from the migration SQL.

### 1.1 Auth / Profile domain

**`profiles`** — `supabase/migrations/20260307160609_f95df296-e321-4160-b1f5-44624cc494d9.sql:2`
```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```
RLS (`:16-18`):
- `"Profiles are viewable by everyone"` — `FOR SELECT USING (true)` (world-readable — used for community/leaderboard features)
- `"Users can insert their own profile"` — `WITH CHECK (auth.uid() = user_id)`
- `"Users can update their own profile"` — `USING (auth.uid() = user_id)`

A `handle_new_user()` trigger (`:21-36`) auto-inserts a profile row on `auth.users` INSERT, seeding `display_name`/`avatar_url` from OAuth metadata (`raw_user_meta_data->>'full_name'`, `->>'picture'`, etc). A generic `update_updated_at_column()` trigger function (`:39-45`) is reused by nearly every table in the codebase for `updated_at` bookkeeping — this same function is **redefined per-migration file** (e.g. again in `20260405000000_temple_schema.sql:366`), which is a mild schema-drift smell but harmless since `CREATE OR REPLACE FUNCTION` is idempotent.

Later migrations extend the identity layer with:
- `user_roles` (`20260308163534*`) — role-based access (`admin`, `enterprise_admin`, etc.), consumed by a `has_role()` SECURITY DEFINER function used throughout admin RLS policies to avoid recursive-RLS problems.
- `admin_activity_log`, `impersonation_logs`, `security_audit_log` — admin auditing.
- `user_consciousness_profile` (`20260307204907*`) — the "core" personalization record: `overall_band`, `streak_current`, `journey_day`, `assessment_data` (jsonb with `assigned_guru_id`, `archetype_hint`, etc.) — this is the row `AppEntry.tsx` and `Home.tsx` read to bootstrap the whole app (see §3, §6).
- `user_journey_log` — append-only journey/audit trail.
- `user_psyche_profile` (`20260308093104*`) — deeper personality/psyche scoring.
- `user_life_stage`, `app_relationship_depth`, `retention_signals` (`20260418045325*`) — lifecycle/retention modeling (new/casual/committed/lapsing), each `IF NOT EXISTS` guarded with owner-only RLS.
- `feature_flags`, `data_export_requests` — compliance/ops.

**Pattern used everywhere**: virtually every user-owned table follows the same 3–4 policy shape:
```sql
ALTER TABLE public.<t> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own X"   ON public.<t> FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own X" ON public.<t> FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own X" ON public.<t> FOR UPDATE USING (auth.uid() = user_id);
```
Delete policies are added selectively (journal, bookmarks, downloads) where user-initiated deletion makes sense.

### 1.2 Sessions / Guide domain

`supabase/migrations/20260307170903_19882ed6-601a-4097-a861-84415b21b235.sql` is the "core loop" migration — it creates, in one file:

- **`daily_themes`** (`:3`) — one row per calendar day (`theme_date UNIQUE DEFAULT CURRENT_DATE`), `title`, `description`, `focus_areas jsonb`, `affirmation`. Readable by *any authenticated user* (`FOR SELECT TO authenticated USING (true)`) since themes aren't per-user in this early version (later, personalization moves the "theme of the day" into per-user tables like `daily_engine_plans`).
- **`sessions`** (`:17`) — `user_id`, `session_date`, `time_slot` (`morning|midday|evening|night`), `type` (`guide|generative|...`), `status` (`active|completed`), `theme_id → daily_themes`, `started_at/ended_at`, `summary`. Owner-scoped SELECT/INSERT/UPDATE.
- **`session_messages`** (`:36`) — chat transcript, `session_id → sessions(id) ON DELETE CASCADE`, `role`, `content`. RLS is **relational** rather than a direct `user_id` column — it EXISTS-joins back to `sessions`:
  ```sql
  CREATE POLICY "Users view own messages" ON public.session_messages FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_messages.session_id AND s.user_id = auth.uid())
  );
  ```
- **`observation_tasks`** (`:52`) — chainable practice tasks (`chain_order`, `parent_task_id` self-FK) with `domain`, `status`, `reflection`.
- **`daily_tasks`** (`:71`) — time-slotted daily to-dos (`task_date`, `time_slot`, `domain`, `status`).
- **`journal_entries`** (`:89`) — `session_id → sessions` (nullable), `title`, `content`, `mood`, `tags jsonb`. Full CRUD RLS including DELETE (`:104`).
- **`evening_reflections`** (`:107`) — one-per-day (`UNIQUE(user_id, reflection_date)`), `mood int`, `energy int`, `gratitudes jsonb`, `highlights/challenges/lessons` text fields — the data model behind the evening Guide flow.

Later additions to this domain:
- `chat_sessions` / `chat_messages`, `guide_messages` — alternate/legacy chat-history tables used by different Guide UI iterations.
- `session_adaptations`, `session_ingredients`, `session_spine`, `session_program_enrollments`, `session_program_progress` — the "Session Composer v3" architecture (`compose-session-v3` edge function) that assembles a session from reusable "ingredients" scored against a "spine."
- `practice_sessions_v2`, `practice_runs`, `practice_history`, `practice_insights`, `practice_effectiveness`, `practice_teachings` — practice-specific session tracking (breathwork, kriya, etc.), feeding the constellation/level system (§1.6).
- `scheduled_sessions`, `daily_sessions`, `adaptive_days`, `day_chains`, `day_feedback` — scheduling/adaptive-day-planning tables for the "Foundation" and "Adaptive Program" systems.
- `next_session_preview`/`generate-session-agenda` (edge functions) read/write these to precompute "what's next" cards shown on Home (`NextSessionCard`).

### 1.3 Journal / Memory domain

- **`journal_entries`** — see §1.2.
- **`sacred_moments`** — powers the **Memory Vault** page (`src/pages/MemoryVault.tsx`). Columns inferred from the UI's `Moment` type (`MemoryVault.tsx:14-24`): `id`, `moment_type` (`breakthrough|realization|tear|laugh|vow|gratitude|grief|first_vulnerability|milestone|life_event|other`), `title`, `user_words`, `emotional_tone`, `importance`, `occurred_at`, `source_type`, `metadata jsonb`. Populated by the `extract-sacred-moments` edge function which scans session transcripts for emotionally significant lines.
- **`memory_patterns`** (`20260308065229*`) — recurring behavioral/emotional patterns detected across sessions (consumed by `detect-contradictions`, `detect-anomalies` edge functions).
- **`guru_memory`** (`20260308064352*`) — per-guru long-term memory of a specific user (inside-joke callbacks, prior commitments) — read by `_shared/long-term-memory.ts` in `guide-chat`.
- **`user_memory_vectors`** — pgvector-backed embeddings table, written by `embed-memory` / `memory-extract` edge functions, queried by `recall-memory` for RAG-style context injection into Guide conversations.
- **`daily_memory_synthesis`** — nightly rollup ("what happened today") produced by `synthesize-daily-memory`.
- **`inside_jokes`**, **`future_self_whispers`**, **`higher_self_letters`** — narrative-memory features: inside jokes the AI references back, "whispers from your future self," and full generated letters (`generate-higher-self-letter`).
- **`dream_entries`** (`20260415205105*`) — dream journal entries decoded by `decode-dream` edge function.
- **`legacy_vault`, `legacy_guardians`, `life_events`** — the **Life & Legacy** feature (`src/pages/LifeAndLegacy.tsx`) — a longer-horizon "who inherits your reflections" vault with named guardians.

### 1.4 Loops domain

- **`user_loops`** (`20260308062132*:3`) — the user's personal instance of a "loop" (behavioral pattern) from the static `LOOPS` catalog (`src/data/loops.ts`), with `status`, detection metadata.
- **`user_samskaras`** (`:25`) — deeper karmic-imprint tracking, same migration.
- **`regression_events`** (`:44`) — logs when a user regresses into an old loop after progress.
- **`active_loops`**, **`loop_attributions`** — later refinement: which loop is "live" right now, and what evidence (session/journal excerpt) attributes it.
- Static content: `src/data/loops.ts` defines `LOOPS`/`LOOP_CATEGORIES` — the **Loop Library** shown at `/loops` and `/loops/:slug` (public marketing/SEO pages, not gated behind auth — see §3).
- `cross_pollination_log`, `detect-cross-pollination` edge function — detects when working on one loop bleeds into progress on another domain (physical/relational/etc.).

### 1.5 Consciousness engine domain

This is the largest and most bespoke subsystem — the "engine" that decides *what theme, what guru, what practice* to show a user right now.

- **`consciousness_signals`** (`20260308061449*:33`) — raw signal ingestion (mood pulses, text sentiment, device signals).
- **`daily_engine_plans`** (`:58`) — the *computed* daily plan (today's theme id, guru id, recommended practice) — this is what `useThemeOfDay()` / `useConsciousnessEngine()` read on Home.
- **`engine_signals`, `engine_logs`, `fused_signals`, `signal_fusion`** (edge fn) — signal aggregation pipeline feeding the plan.
- **`three_brain_inferences`** — "reptilian / limbic / neocortex" three-brain model inference results (`infer-three-brain` edge function).
- **`predictive_signals`, `churn_predictions`, `anomalies`, `detect-anomalies`, `pattern_insights`, `pattern-window-detector`** — predictive analytics (used heavily by Admin's `AdminPredictive`/`AdminBI` pages).
- **`spiral_phase_predictions`, `theme_evolution_log`, `theme_arcs`, `arc_templates`, `arc_chapters`, `arc_echoes`, `arc_pair_invites`** (`20260421164602*`) — the "Living Theme Engine": a theme is not static, it evolves through **arcs** (multi-day narrative chapters) with "echoes" (callbacks) and even "pair invites" (2-person theme arcs, likely for accountability partners).
- **`fractal_patterns`, `curiosity_queue`, `curiosity_cooldowns`, `curiosity-engine`** — a "curiosity" subsystem that proactively surfaces open questions.
- **`life_domain_scores`, `dimension_map_scores`, `dimension_scores`, `human_map_dimensions`, `life_domains`, `domains`, `pillars`** — the "Human Map" — a multi-dimensional life-scoring model (career, relationships, body, etc.) rendered by `DimensionHumanMap.tsx`.
- **`user_daily_gates`, `daily_sankalpa`, `journey_harvest`** (`20260423214020*`) — "gates" the user must pass each day and daily intention-setting (sankalpa).
- **`companion_engine` domain**: `companion_mood`, `compute-companion-state` edge fn — models the AI companion's own simulated "mood/presence" so it doesn't feel like a stateless chatbot (see `useCompanionEngine` hook used in `Home.tsx:392`).
- **`user_speed_profile`, `speed_profile_history`** — models how fast/slow a user likes to move through content, personalizing pacing.
- **`karma_events`, `user_karma`, `karma_verification_log`, `xp_transactions`** (`20260422122914*`) — gamified karma/XP layer (see `KarmaChip.tsx`, `useKarma.ts`, `useAwardKarmaEvent` used in `AppEntry.tsx:46`).
- **`bio_signals`, `device_signals`, `wearable_tokens`, `wearable-oauth-start/-callback`, `wearable-sync`** — wearable integration (HRV/sleep) feeding the engine.
- **`work_signals`, `workplace_loop_logs`, `meeting_nudges`, `calendar-meeting-watcher`, `gmail-tone-watcher`, `slack-tone-watcher`, `outlook-tone-watcher`, `teams-tone-watcher`, `linear-workload-watcher`, `github-late-night-watcher`** — an entire **ambient workplace-signal ingestion** layer (`ingest-signal`, `signal-fusion`, `signal_consents`) for the Enterprise product — watchers plug into calendar/email/Slack/Teams/GitHub/Linear to detect burnout patterns, gated by `signal_consents` (explicit opt-in per integration, surfaced in `SignalConsentCenter.tsx`).

### 1.6 Constellation / Practice-level domain

- **`user_practice_constellation`** (`20260424013621*`) — per-practice mastery levels (e.g. `pranayama_level`, `witness_level` columns), read directly by the cinematic script picker: `src/lib/cinematic/registry.ts:56-63` does `supabase.from("user_practice_constellation").select("*").eq("user_id", userId)` then reads `data[`${practice}_level`]` dynamically.
- **`user_practice_constellation_history`, `practice_level_events`, `v_level_history`** (view) — level-up event log.
- **`compute-constellation`, `recalibrate-constellation`, `recalibration-intelligence`, `evaluate-practice-level`** edge functions — recompute levels after each session; `recalibration_events` logs recalibration triggers.
- Rendered by `/app/constellation` (`Constellation.tsx`) and `/app/constellation/evolution` (`ConstellationEvolution.tsx`).

### 1.7 Spiritual DNA / Assessment domain

- **`user_spiritual_dna`, `spiritual_dna`, `spiritual_dna_assessments`, `spiritual_dna_confidence`** (`20260415195517*:12`) — a "spiritual DNA" profile computed from onboarding assessments + ongoing behavior, with a `_confidence` companion table tracking how sure the engine is about each trait.
- **`assessment_definitions`, `user_assessment_results`** (`20260423225918*`) — generic assessment engine backing `/app/library/:slug` (`AssessmentRunner.tsx`) and `/app/library/result/:id` (`AssessmentResult.tsx`); `analyze-assessment`, `assess-starting-levels` edge functions score submissions.
- **`user_kundli`, `compute-kundli`** edge fn — Vedic astrology birth-chart computation (`BirthInsightsChip.tsx` in Home surfaces this).
- **`geo_practice_anchors`, `geo_anchors`, `GeoSpiritualAnchors.tsx`** — location-anchored practice suggestions.

### 1.8 Temple domain

`supabase/migrations/20260405000000_temple_schema.sql` is a single, self-contained "Temple feature" migration (explicitly cross-referenced to an external spec: *"Per temple.md Section 22"*). It defines 12 tables + 2 views in one file:

| Table | Purpose | Key columns |
|---|---|---|
| `temple_journeys` (`:8`) | 100-day journey with a chosen master | `master_id`, `current_day`, `total_days=100`, `streak_days`, `engagement_level` (`low/medium/high`), `last_journal_sentiment`, `struggles text[]`, `strengths text[]` |
| `temple_programs` (`:56`) | Shorter structured programs | `program_id`, `master_id`, `signal_logs jsonb` |
| `temple_journal` (`:91`) | **Encrypted** practice journal | `is_encrypted BOOLEAN DEFAULT TRUE`, `encrypted_data TEXT` (future E2E), `tags text[]` (`#breakthrough`, `#resistance`, `#calm`) |
| `user_text_reads` (`:131`) | Sacred-text reading progress | `text_id`, `last_verse`, `read_count`, `UNIQUE(user_id,text_id)` |
| `user_text_bookmarks` (`:158`) | Verse bookmarks | `text_id`, `verse_id`, `note` |
| `user_text_annotations` (`:184`) | Verse annotations | `annotation` |
| `temple_guidance` (`:209`) | Guidance-request log | `is_crisis BOOLEAN`, `matched_master`, `response_summary` — **note**: `user_id UUID NOT NULL REFERENCES auth.uid()` (`:211`) is a copy-paste bug (`auth.uid()` is a function, not a table — this FK almost certainly fails to apply/should reference `auth.users(id)`; likely tolerated because Postgres would error unless this line was actually skipped/fixed in a later migration) |
| `temple_presences` (`:235`) | Which masters are "witnessing" the user | `presence_type` (`active/elder/future`) |
| `temple_calendar_events` (`:265`) | Personal + global sacred calendar | `event_type` (`full-moon/new-moon/personal-milestone/traditional-observance/global-sangha`), `is_global`, `participant_count` |
| `temple_downloads` (`:293`) | Offline content downloads | `content_type` (`journey/text/practice/program`) |
| `temple_mastery` (`:314`) | Overall mastery tier | `level` (`novice/initiate/practitioner/teacher`) |
| `temple_user_state` (`:336`) | First-entry + settings | `has_entered_temple`, `tradition_preference` (`hindu/buddhist/universal/all`), `reduced_motion` |

Views: `temple_weekly_review` (`:393`) aggregates `temple_journal` into a 7-day rollup (days practiced, total minutes = `rating*10`, array-agg'd insights); `temple_active_journeys` (`:407`) joins journeys to a masters table for in-progress display.

Companion migrations: `20260405000001_witness_sessions.sql` (`witness_sessions` — live guided-witnessing sessions), `20260405000002_personalized_programs.sql` (`personalized_programs`), `20260405151416_*` (`user_journeys`), `20260405151458_*` (`practice_journal`, `user_programs`, plus a **second, overlapping** definition of `user_text_reads`/`user_text_bookmarks` — schema drift between the "Temple" and "Programs" subsystems that were evidently built by different iterations and later reconciled at the application layer).

Temple UI lives at `src/pages/Temple.tsx` + `src/pages/temple/*` (`EcosystemMandala.tsx`, `WorldDeepDive.tsx`, `SamBranching.tsx`, `EmberParticles.tsx`, `MiniBreath.tsx`, `CustomCursor.tsx`, `worldData.ts`) — see §4.3 for the visual language.

### 1.9 Community / Witness domain

- **`witness_circles`, `witness_circle_members`** (`20260308193622*:99,122`) — small-group accountability circles.
- **`collective_meditations`, `collective_meditation_participants`** (`:145,164`) — scheduled group meditation sessions.
- **`community_observations`, `community_reactions`** (`:3,27`) — a lightweight social feed of shared observations with emoji-style reactions.
- **`journey_groups`, `journey_group_members`** (`:51,75`) — cohort grouping (e.g. "started the same week").
- **`peer_circles`, `peer_circle_members`, `peer_circle_messages`** — enterprise equivalent (`EnterprisePeerCircles.tsx`).
- **`witness_distraction_logs`, `live-detect`, `detect-silence`, `detect-bypassing`** — real-time session-quality signals (is the user distracted / silent / spiritually bypassing) captured during live sessions.

### 1.10 Enterprise domain

`supabase/migrations/20260308114530_7ebf0938-8f33-4227-81fd-620af8878c4c.sql` establishes the multi-tenant core:

- **`organizations`** (`:3`), **`teams`** (`:16`), **`org_members`** (`:25`), **`org_invites`** (`:41`) — standard multi-tenant org/team/member/invite model.
- **`org_activity_log`** (`20260308120624*`) — audit trail.
- **`enterprise_notifications`** (`20260308121548*`).
- **`wellness_challenges`, `challenge_participants`, `mood_pulses`, `manager_coaching_notes`, `org_quarterly_reports`** (`20260308123104*`) — the manager-facing wellness product: org-wide challenges, anonymized mood pulses, 1:1 coaching notes, and generated quarterly reports (`org-weekly-briefing`, `enterprise-insights`, `enterprise-people-intelligence`, `manager-coaching` edge functions).
- **`org_consciousness_snapshots`, `org_programs`, `org_program_participants`** — org-wide aggregate "consciousness state" and assignable programs (`org-program-designer` edge fn → `EnterpriseProgramDesigner.tsx`).
- **`org_members_directory`** view with explicit grant: `GRANT SELECT ON public.org_members_directory TO authenticated;` (`20260504081440*:89`) — one of the few tables exposed via a view+grant rather than pure RLS, likely to let managers browse a directory without each row needing its own owner-scoped policy.
- Access-control note: enterprise RLS generally checks org-membership via `EXISTS (SELECT 1 FROM org_members WHERE org_id = ... AND user_id = auth.uid() AND role IN ('admin','manager'))`-style predicates rather than simple `auth.uid() = user_id`, since managers must see their reports' data.

### 1.11 Billing / Credits domain

- **`user_credits`** (`20260308165915*:3`) — balance in **paise** (`balance_paise`), consumed on every AI call.
- **`credit_transactions`** (`:14`) — ledger of grants/spends (`bonus`, `purchase`, `spend`), e.g. `admin_grant_credits()` RPC (`20260511064508*:213`) inserts `('bonus', 0, p_paise, ...)`.
- **`ai_usage_log`** (`20260308171540*`), **`ai_cost_logs`** — per-call cost tracking (input/output tokens × model price), read by `AdminCosts.tsx`.
- **`razorpay-order`, `razorpay-verify`** edge functions — Razorpay payment integration (India-first billing) that top up `user_credits`.
- A migration backfills free credits: *"grant 11 free credits (1100 paise) to any existing user who doesn't have a credits row yet"* (`20260419140401*:1`).
- Every AI-calling edge function (e.g. `guide-chat/index.ts:49-53`) does an **atomic pre-check** via an RPC:
  ```ts
  const { data: creditCheck } = await admin.rpc("check_credit_balance", { p_user_id: user.id, p_min_balance: 50 });
  if (!creditCheck?.sufficient) return 402 insufficient_credits;
  ```
  and computes actual charge post-hoc via `computeChargedPaise()` (`_shared/ai-pricing.ts`).

### 1.12 Admin / Ops domain

- `admin_activity_log`, `impersonation_logs`, `security_audit_log`, `rate_limits`, `feature_flags`, `waitlist_emails`, `sales_inquiries`, `broadcasts`, `notification_logs`, `push_subscriptions`, `offline_sync_queue`, `data_export_requests`.
- `prompt_versions`, `prompt_evals`, `training_examples` — an internal prompt-engineering harness (A/B testing system prompts, storing eval results) — backs `AdminTraining.tsx` and `AdminCopilot.tsx`.
- `user_roles` + `has_role()` SECURITY DEFINER function gate all `/admin` RLS (`FOR SELECT USING (has_role(auth.uid(), 'admin'))` pattern), avoiding the classic "RLS policy queries the same table it's protecting" infinite-recursion trap.
- Founder auto-grant: a trigger `on_auth_user_grant_founder` (`20260511064508*:21-25`) automatically inserts an `admin` role row whenever a user signs up with a specific hardcoded founder email — a common "bootstrap the first admin" pattern.

### 1.13 Games domain

- `src/games/games/*.tsx` — **~30 standalone "consciousness games"** (`WitnessRoom`, `RedDoor`, `TwoChairs`, `MirrorRealm`, `NonDualDoor`, `TheApology`, `SlowTap`, `QuestionNoAnswer`, `SubtractYourself`, etc.), each a short interactive/reflective exercise. `reflect-game` edge function scores the user's free-text response; results likely persist into `journal_entries`/`sacred_moments`-style rows and feed `xp_transactions`/`karma_events`. Routed at `/app/games/:gameId` (`GameRoute.tsx`) and surfaced via `GameInsights.tsx` and `SuggestedGamesCard.tsx` on Home.

### 1.14 ER-style relationship summary

```
auth.users (Supabase managed)
  └─1:1─ profiles
  └─1:1─ user_consciousness_profile
  └─1:1─ user_psyche_profile, user_spiritual_dna, temple_mastery, temple_user_state, user_credits
  └─1:N─ sessions ──1:N── session_messages
  │                 └──── journal_entries (session_id nullable FK)
  └─1:N─ journal_entries, evening_reflections, observation_tasks, daily_tasks
  └─1:N─ user_loops, active_loops, regression_events
  └─1:N─ temple_journeys ──(master_id)── (static master catalog, not a DB table — see src/lib/guru-data.ts)
  └─1:N─ temple_journal, temple_presences, temple_calendar_events, temple_downloads
  └─1:N─ user_practice_constellation (1:1-ish, one row w/ many *_level columns)
  └─1:N─ credit_transactions ──aggregates──> user_credits.balance_paise
  └─1:N─ notifications, nudge_queue
  └─N:M─ org_members ──> organizations ──1:N── teams, org_invites, wellness_challenges
  └─N:M─ witness_circle_members ──> witness_circles
  └─N:M─ journey_group_members ──> journey_groups
  └─1:N─ dream_entries, sacred_moments, user_memory_vectors, guru_memory
daily_themes ──1:N── sessions (theme_id)
assessment_definitions ──1:N── user_assessment_results
arc_templates ──1:N── theme_arcs ──1:N── arc_chapters, arc_echoes
```

Almost every table follows **owner-isolation via `auth.uid() = user_id`**, with three notable exception patterns: (a) globally-readable reference/content tables (`profiles` SELECT, `daily_themes` SELECT, `assessment_definitions`), (b) relational RLS via `EXISTS` sub-selects for child tables lacking their own `user_id` (`session_messages`), and (c) role-gated tables for admin/enterprise cross-user visibility via `has_role()`/org-membership checks.

---
