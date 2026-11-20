# Scale Plan — 100M+ Sessions and Steps

> Status: plan only, nothing implemented.
> Audience: CTO, data/platform engineer, or an AI agent consuming this as context.
> Scope: make every existing metrics engine truthful, cheap, and queryable when the
> system holds **100M sessions → ~1B step events** (plus the decision, engagement,
> guide, cost and signal rows those sittings produce).
> Rule for implementers: **wrap and preserve engine semantics; do not rewrite them.**

---

## 1. How to read this document

| Section | Use it for |
|---|---|
| §2 Engine audit | Know exactly what exists today, where it writes, where it reads, and why it fails at volume. |
| §3 Load model | Row counts, bytes, QPS. Use to size infra and to set budgets. |
| §4 Event contract | The one interface every producer must converge on. |
| §5 Target architecture | The six layers and what each layer owns. |
| §6 Metric catalog | Canonical formulas + the table/view that is the source of truth for each. |
| §7 Phased plan | Ordered, independently shippable phases with exit criteria. |
| §8 SLOs and capacity | Acceptance targets and rough cost. |
| §9 Scale lab | How to generate 100M+ synthetic sittings with ground truth, so the metrics engines can be *validated*, not just exercised. |
| §10 AI guardrails | What an AI may change, what it must not touch, which signatures are frozen. |

---

## 2. Engine audit — everything that measures something today

### 2.1 Write-side engines (producers)

| # | Engine | Code | Store | Cadence today | Breaks at scale because |
|---|---|---|---|---|---|
| W1 | Unified session completion | `src/lib/session/completion.ts:58` | `sessions`, `session_states`, `daily_session_logs`, `user_session_streaks` | 1 write burst per sitting | `daily_session_logs.sessions` is a JSONB map mutated read-modify-write (`completion.ts:104-127`) → lost updates and unbounded per-user-day rows |
| W2 | Step telemetry | `src/lib/telemetry/engineTelemetry.ts:149` | `session_step_events` | **one PostgREST INSERT per step action** | 1B inserts × RLS check + 6 index updates each; no idempotency key, so offline replay duplicates |
| W3 | Engine decision log | `src/lib/telemetry/engineTelemetry.ts:54` | `engine_decisions` | one row per composition | 100M rows of JSONB `chosen`/`alternatives`; no partitioning; alternatives duplicated per row |
| W4 | Crisis log | `src/lib/telemetry/engineTelemetry.ts:95` | `crisis_events` | rare, but safety-critical | Small volume; the failure is that it is in the same DB hot path as analytics |
| W5 | Session provenance stamp | `src/lib/telemetry/engineTelemetry.ts:119` | UPDATE `sessions` | per session | Second write to the same row right after start; contention with completion |
| W6 | Engagement events | `src/lib/telemetry/engagementTelemetry.ts:44` | `engagement_events` | per tap/view | Same per-row insert problem; highest-frequency table after step events |
| W7 | App context events | `src/lib/telemetry/appContextTelemetry.ts:43` | `app_context_events` | per app open | One auth round-trip + one insert per open; no batching |
| W8 | Composer ingredient writeback | `supabase/functions/session-complete/index.ts:743` | `session_ingredients` | per ingredient per session | ~10 rows/session; the learning migration then UPDATEs them → double write amplification + unique index |
| W9 | Session spine scoring | `supabase/functions/score-session-spine/index.ts` | `session_spine` (UPDATE `quality_score`) | **1 LLM call per sitting** | 100M LLM calls; mutating an otherwise immutable record prevents late re-scoring and destroys auditability |
| W10 | Outcome correlation | `supabase/functions/correlate-session-outcome/index.ts:70` | `session_outcomes`, `consciousness_fingerprint` | per completion | `consciousness_fingerprint` is read-modify-write JSONB with a 90-entry curve array → serialization/deadlock, lost updates at concurrency |
| W11 | Daily dimension rollup | `supabase/functions/aggregate-daily-dimensions/index.ts:63` | `daily_dimension_summary` | on demand | Scans `consciousness_signals` by half-open timestamp range with no BRIN/partition; per-user per-day aggregation done one user at a time |
| W12 | Edge function metrics | `supabase/functions/_shared/observability.ts:31` | `edge_function_metrics` | buffer 100 rows / 30s / instance | Per-instance buffers mean N× row loss on cold starts; no aggregation, one row per call |
| W13 | AI usage / cost | `supabase/migrations/20260308171540_*.sql` (`ai_usage_log`) | `ai_usage_log` | per AI call | Unpartitioned cost ledger; every dashboard scan touches all history |
| W14 | Observation ladder runs | `supabase/migrations/20261114000000_observation_runs.sql` | `observation_runs` | per 100-ladder sitting | Fine at current volume; grows with the same profile as step events |
| W15 | Human model ledger | `src/lib/humanModel/ledger.ts:44` → `snapshot.ts:66` | `human_model_snapshots` | per sitting | Upserts a whole JSONB model per sit (read → apply → write); no event history, so trends cannot be recomputed |
| W16 | Session state cursor | `src/lib/session/offlineQueue.ts` + `session_states` | `session_states` | per step | Local queue capped at 20 completions (`offlineQueue.ts:12`); step-level state is not queued at all |
| W17 | Local observability buffer | `src/lib/observability/index.ts:71` | memory ring buffer (200) | continuous | 200-event cap and no default sink ⇒ product-event history is not a dataset |
| W18 | Event bus | `supabase/migrations/20260923000000_unified_session_system.sql:58` | `session_events`, `karma_events` | per event | Append-only but unpartitioned, untyped payload, no retention policy |

### 2.2 Read-side engines (consumers)

| # | Engine | Code | Shape | Breaks at scale because |
|---|---|---|---|---|
| R1 | Practice composer | `src/lib/practice/metricsEngine.ts:81` | pure client scoring over recipes | Not a storage problem — but it re-derives weights that are never persisted as a calibrated artifact. Needs a versioned weights snapshot to be measurable. |
| R2 | Session funnel | `v_session_funnel` (`20261116070000_analytics_views.sql:12`) | `GROUP BY user_id, day` over `sessions` | `security_invoker` ⇒ every dashboard query scans all rows visible to the caller; no date predicate |
| R3 | Step funnel | `v_step_funnel` (`:30`) | `GROUP BY user, kind, step_index` over `session_step_events` | Full 1B-row scan + hash aggregate per query |
| R4 | Content performance | `v_content_performance` (`:50`) | join `session_ingredients` × `content_ingredients` | Full scan on both sides; `LEFT JOIN` prevents index-only path |
| R5 | Weekly retention | `v_retention_weekly` (`:69`) | self-join of distinct user/week | `DISTINCT` over `engagement_events` twice, no time window |
| R6 | Archetype bandit | `v_archetype_quality` (`:89`) | `avg/stddev/UCB` over `session_spine` | `stddev_samp` + `ln` over 100M rows; recomputed on every read instead of hourly |
| R7 | Crisis daily | `v_crisis_daily` (`:106`) | counts by day/surface/severity | Small, but shares the same unindexed read path |
| R8 | Cost daily | `v_cost_daily` (`:117`) | sums over `ai_usage_log` | Full ledger scan per dashboard load |
| R9 | Ops dashboard | `src/hooks/useOpsMetrics.ts:96` | loads **all seven views**, `limit(200)`, no filters | 7 parallel unbounded scans; `limit` truncates after the database already aggregated everything |
| R10 | User state snapshot | `supabase/functions/user-state-snapshot/index.ts:15` | 60s in-memory cache per edge instance; `user_state_snapshot` table TTL 10 min | Cold starts re-aggregate ~13 tables per user; instance-local cache has near-zero hit rate at fleet scale |
| R11 | Human model read | `src/lib/humanModel/read.ts` | snapshot read | No time series ⇒ cannot answer "did the model improve?" |
| R12 | Personalization store | `src/lib/personalizationEngine/store.ts` | threads, experiments, events | Per-user queries are fine; the aggregate questions (which experiment wins?) have no rollup |

### 2.3 Structural facts confirmed in the repo

- **No partitioning anywhere.** No `PARTITION BY`, no `pg_partman`.
- **No materialized views, no cron.** Two migrations explicitly note `pg_cron` is not enabled (`20260424061349_*.sql:1`, `20260508121745_*.sql:1`). Every `v_*` is a live view.
- **All analytics views are `security_invoker = true`**, so an admin dashboard runs with the caller's RLS predicates.
- **~91 tables** in `20260926000003_recreate_all_missing_tables.sql` alone; 200+ migrations total. There is no separate `analytics` schema.
- **Client writes directly to Postgres** through PostgREST for all telemetry (`engineTelemetry.ts`, `engagementTelemetry.ts`, `appContextTelemetry.ts`).
- **Policy versioning exists but is not enforced**: `DECISION_POLICY_VERSION` (`src/lib/brain/policy.ts:6`) is stamped on decisions, yet nothing reads old versions to compare outcomes.

---

## 3. Load model

Assumptions: 100M sessions, ~10 steps each, 4 action rows per step (shown/started/completed/skipped
in the worst case, ~2.4 effective), 100M decisions, 300M engagement events.

| Table | Rows | Avg bytes/row | Raw size | Notes |
|---|---|---|---|---|
| `sessions` | 100M | ~220 | ~22 GB | + indexes |
| `session_step_events` | 0.24–1.0B | ~320 (JSONB payload) | 75–320 GB | dominant table |
| `engine_decisions` | 100M | ~700 (`chosen` + `alternatives`) | ~70 GB | alternatives dominate |
| `session_ingredients` | 1B | ~180 | ~180 GB | one per ingredient per session |
| `engagement_events` | 300M | ~200 | ~60 GB | |
| `session_events` / `karma_events` | 500M | ~150 | ~75 GB | |
| `ai_usage_log` | 200M+ | ~150 | ~30 GB | grows with every AI call |
| `guide_turns` | 50M | ~120 | ~6 GB | |
| `app_context_events` | 150M | ~160 | ~24 GB | |
| `edge_function_metrics` | 1B+ | ~200 | ~200 GB | per-call rows; worst offender per byte of value |

**Write rate.** 100M sessions over 3 years ≈ 91K sessions/day ≈ 1.1/s average, but daily peaks
(6–10×) plus step traffic ⇒ **~50–120 step-event writes/s**, ~200–500 PostgREST requests/s if batched
poorly. Today each is a separate HTTP request with its own RLS evaluation.

**Read rate.** A single ops dashboard load today = 7 full-table aggregates. Two concurrent admins
at 1B rows is already an outage-shaped event.

**Implication.** The problem is not storage. It is (a) per-row client inserts, (b) aggregate-on-read
over unpartitioned raw tables, and (c) mutable JSONB blobs that should be append-only ledgers.

---

## 4. Event contract (the one interface to converge on)

All producers emit a single envelope. Typed columns for the fields analytics filters on; JSONB for
the long tail; a client-generated idempotency key; both clocks.

```ts
export interface MetricEvent {
  event_id: string;        // client UUID v7 — idempotency key, PRIMARY KEY component
  schema_version: 1;       // bump on breaking payload change
  type:
    | "session.start" | "session.complete" | "session.abandon"
    | "step.shown" | "step.started" | "step.complete" | "step.skip"
    | "decision" | "crisis" | "engagement" | "app.context"
    | "guide.turn" | "ai.usage" | "observation.run" | "score";
  occurred_at: string;     // client clock (ISO)
  received_at: string;     // server clock, set by ingest, never trusted from client
  user_id: string;
  session_id: string | null;
  device_id: string | null;
  app_version: string | null;
  session_day: string;     // generated: date_trunc('day', occurred_at at user tz) — partition key
  step_index: number | null;
  step_kind: string | null;
  atom_ref: string | null;
  action: "shown" | "started" | "completed" | "skipped" | null;
  duration_ms: number | null;
  quality_score: number | null;
  policy_version: string | null;
  payload: Record<string, unknown>;   // scrubbed, ≤2KB, no journal text
}
```

Rules:

1. **`event_id` is required and unique.** Ingest uses `ON CONFLICT (event_id) DO NOTHING`, so
   retries and offline replay are free.
2. **No PII in `payload`.** Reuse `scrubProps` (`src/lib/observability/index.ts:132`); strip
   `final_user_sentence`, journal text, and anything matched by the `PII_KEYS` regex before send.
3. **`received_at` is authoritative for ordering**, `occurred_at` for user-time analysis. Never
   overwrite one with the other.
4. **Scores are append-only.** A score is a new row in `session_scores`, never an UPDATE of the
   thing being scored.
5. **Deletion is a new event** (`type: "session.abandon"`, `payload.reason`), not a DELETE.

Existing writers keep their public signatures and become thin adapters over this envelope:

- `logStepEvent(input)` → one `step.*` event
- `logEngineDecision(input)` → one `decision` event
- `logEngagement(input)` → one `engagement` event
- `logAppContext(input)` → one `app.context` event

Batch adapters: buffer 500 events or 5s (whichever first), POST to a single `ingest` edge function,
retry with exponential backoff, persist the unsent batch in IndexedDB (extend the pattern already
in `src/lib/session/offlineQueue.ts` from 20 completions to a bounded event log).

---

## 5. Target architecture

```
┌─ L0  Client buffer ────────────────────────────────────────────────┐
│  metricEvent queue: IndexedDB, 5s/500 batching, idempotent retry  │
└───────────────────────────────┬────────────────────────────────────┘
                                │ one POST /ingest (batched)
┌─ L1  Ingest (edge fn) ────────▼────────────────────────────────────┐
│  zod validate → scrub PII → stamp received_at → COPY/insert into  │
│  partitioned landing tables (ON CONFLICT event_id DO NOTHING)     │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌─ L2  Hot OLTP (public schema) ▼────────────────────────────────────┐
│  metrics_events / sessions / engine_decisions … RANGE by month     │
│  BRIN(created_at), hash(user_id) subpartition for hot tables       │
│  RLS unchanged. Raw retention 90 days.                            │
└───────────────────────────────┬────────────────────────────────────┘
                                │ incremental, watermark-driven SQL
┌─ L3  Rollups (analytics schema) ▼──────────────────────────────────┐
│  metrics_daily · metrics_user_daily · step_funnel_daily            │
│  archetype_quality_hourly · cost_daily · retention_cohort          │
│  + metrics_watermark. service_role only, no RLS on marts.          │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌─ L4  Serving ─────────────────▼────────────────────────────────────┐
│  dashboards → rollups (ms). user-facing → per-user rollup views.   │
│  Heavy v_* views deleted or redefined over rollups.                │
└───────────────────────────────┬────────────────────────────────────┘
                                │ logical replication / CDC
┌─ L5  Warehouse (ClickHouse/BQ) ▼───────────────────────────────────┐
│  ad-hoc + cohorts over 1B+ rows; Parquet cold archive in Storage. │
└───────────────────────────────┬────────────────────────────────────┘
                                │ sampled write-back
┌─ L6  Learning loop ───────────▼────────────────────────────────────┐
│  heuristic score for 100%, LLM score for 1–5% sample;             │
│  bandit weights published as versioned policy artifacts.           │
└────────────────────────────────────────────────────────────────────┘
```

Non-negotiables:

- **Raw is immutable and partitioned. Rollups are disposable and rebuildable.**
- **Dashboards never read raw.** If a panel cannot be served from L3, it needs a new rollup, not a
  bigger query.
- **User-facing reads stay RLS-scoped and small.** Admin/serving reads use `service_role` in the
  `analytics` schema, never `security_invoker` over raw.
- **One writer per fact.** `quality_score` lives in `session_scores` only; `consciousness_fingerprint`
  becomes a derive-only projection, not a mutable blob.

---

## 6. Metric catalog (canonical definitions)

Every metric gets: owner, formula, source of truth, refresh, and retention. Ambiguity here is what
makes dashboards disagree.

| Metric | Formula | Source of truth | Refresh |
|---|---|---|---|
| `sessions_started` | count(`session.start`) | `metrics_daily` | 5 min |
| `sessions_completed` | count(`session.complete`) | `metrics_daily` | 5 min |
| `completion_rate` | completed / started | `metrics_daily` | 5 min |
| `step_show_rate` | `step.shown` / sessions started | `step_funnel_daily` | 5 min |
| `step_completion_rate` | `step.complete` / `step.shown` (per kind, per index) | `step_funnel_daily` | 5 min |
| `median_step_seconds` | `percentile_cont(0.5)` on `duration_ms/1000` | `step_funnel_daily` | 5 min |
| `drop_off_index` | argmax over step_index of (shown − completed) | `step_funnel_daily` | 5 min |
| `session_quality` | latest `session_scores.value` for session | `session_scores` → `metrics_user_daily` | 15 min |
| `archetype_ucb` | `avg(q) + 0.2 * sqrt(ln(n+1)/n)` (same as `v_archetype_quality:89`) | `archetype_quality_hourly` | hourly |
| `loop_touch_rate` | sessions touching loop / sessions | `metrics_user_daily` | 15 min |
| `vlevel_delta_7d` | vlevel(now) − vlevel(−7d) | `metrics_user_daily` | daily |
| `retention_d1/d7/d30` | distinct user active on day N / cohort day 0 | `retention_cohort` | daily |
| `cost_per_session_paise` | `sum(charged_paise) / count(sessions)` | `cost_daily` | 15 min |
| `crisis_rate` | crisis events / sessions | `metrics_daily` | 5 min |
| `decision_accept_rate` | later sessions whose choice ∈ earlier `alternatives` | `decision_outcomes` | daily |
| `guide_depth` | median assistant_chars / median user_chars, per master | `metrics_daily` | daily |
| `experiment_lift` | treated conversion − control conversion (per `manage-experiment`) | `experiments_daily` | daily |

**One metric, one owner.** If `useOpsMetrics` needs a new panel, it consumes a rollup row; it never
computes a formula in React.

---

## 7. Phased plan

Each phase ships independently and leaves the app working. Exit criteria are measurable.

### Phase 0 — Instrument the contract (week 1)

- Add `MetricEvent` types + zod schema in `src/lib/telemetry/contract.ts`.
- Add `event_id` (UUID v7) to all five client writers; keep their signatures.
- Implement client batching + IndexedDB queue; reuse `offlineQueue` patterns.
- Add `ingest` edge function: validate, scrub, `ON CONFLICT DO NOTHING`, land in existing tables
  (no partitioning yet) via the new envelope expanded to current columns.
- Add `ingest_dedupe` telemetry: count accepted / duplicate / rejected.

**Exit:** one sitting produces a single batched POST; replaying the same batch twice adds zero rows;
`session_step_events` row count per session matches the UI's step count.

### Phase 1 — Partition + index discipline (weeks 2–3)

- Enable `pg_partman` (or `pg_cron` + native declarative partitioning) on: `session_step_events`,
  `engagement_events`, `app_context_events`, `guide_turns`, `engine_decisions`, `ai_usage_log`,
  `session_events`, `karma_events`, `edge_function_metrics`, `observation_runs`.
- Monthly RANGE on `created_at`; add `BRIN(created_at)`; keep the few btree indexes that serve
  point lookups; drop redundant ones (e.g. `session_step_events_action_idx` is superseded by
  `(session_id, step_index, action)`).
- Set raw retention: 90 days hot, 13 months warm, then archive to Storage as Parquet.

**Exit:** insert p95 < 20ms at 5k rows/s synthetic; dropping a month partition is O(1); no query
plan touches a partition outside its predicate.

### Phase 2 — Incremental rollups (weeks 3–5)

- Create `analytics` schema + `metrics_watermark(entity, last_ts)`.
- Build `metrics_daily`, `metrics_user_daily`, `step_funnel_daily`, `archetype_quality_hourly`,
  `cost_daily`, `retention_cohort` as tables populated by idempotent `INSERT … SELECT` from the
  watermark forward (a materialized view is acceptable only where `REFRESH … CONCURRENTLY` with a
  unique index is possible).
- Reprocess path: `metrics_watermark` reset + replay = same output (assert in tests).
- Rewrite `useOpsMetrics` to query rollups with an explicit `from`/`to`, and reduce its default load
  to "last 28 days, one row per day".

**Exit:** dashboard p95 < 500ms at 100M-session fixture data; a full rebuild of one month completes
in < 10 min.

### Phase 3 — Serving boundary (week 5)

- Redefine `v_session_funnel`, `v_step_funnel`, `v_content_performance`, `v_retention_weekly`,
  `v_archetype_quality`, `v_crisis_daily`, `v_cost_daily` over rollups (or delete them and update
  callers).
- Add per-user rollups (`v_user_daily`, `v_user_step_funnel`) for in-app insights, still
  `security_invoker`.
- Move admin/serving reads behind an edge function using `service_role`; verify RLS still protects
  every user-facing path.

**Exit:** no view references a raw event table; `EXPLAIN` on each panel shows a rollup scan; a
non-admin user cannot read another user's rollup.

### Phase 4 — Correct the learning loop (weeks 5–6)

- `score-session-spine`: split scoring out. Deterministic heuristic runs for 100% of sessions and
  writes `session_scores(source='heuristic')`. LLM scoring runs on a deterministic 1–5% sample and
  writes `session_scores(source='llm')`. Never UPDATE `session_spine.quality_score`.
- Rebuild `v_archetype_quality` over `archetype_quality_hourly`; add `policy_version` dimension so
  bandit weights are comparable across policy changes.
- Replace `consciousness_fingerprint` read-modify-write with: append `fingerprint_deltas` rows, and a
  scheduled job that recomputes the projection. Consumers keep reading the projection.
- Publish composer weights (`practice/metricsEngine` inputs) as a versioned artifact row so every
  plan can be reproduced; store `policy_version` + `weights_hash` on decisions (extend the existing
  `policy_version` / `input_hash`).

**Exit:** cost of scoring per 100M sessions drops ~20–100×; two concurrent completions for one user
produce no lost fingerprint deltas; replaying a decision reproduces the same plan from
`policy_version` + `weights_hash` + `input_hash`.

### Phase 5 — Warehouse + cold path (weeks 6–8)

- Stream `metrics_events` via logical replication to ClickHouse (or BigQuery), partitioned by month,
  ordered by `(user_id, occurred_at)`.
- Export closed months to Parquet in Storage with a manifest; delete from hot.
- Add cohort/ad-hoc queries there; keep Postgres for product reads only.

**Exit:** a 1B-row cohort query returns in < 5s; hot Postgres holds ≤ 90 days of raw.

### Phase 6 — Scale lab (parallel from week 1)

See §9. Ships as `scripts/scale-lab/` with a deterministic seed so results are reproducible.

---

## 8. SLOs and capacity

| Path | Target |
|---|---|
| Client event → durable row | p95 < 2s end-to-end, p99 < 10s |
| Ingest acceptance | p95 < 150ms, ≥ 5k events/s sustained |
| Dashboard panel | p95 < 500ms from rollups |
| User in-app insight | p95 < 150ms from per-user rollup |
| Rollup freshness | ≤ 5 min (daily metrics), ≤ 1h (bandit) |
| Rebuild one month of rollups | < 10 min |
| Duplicate rows from replay | 0 |
| Raw retention | 90d hot / 13mo warm / archive forever |

**Rough monthly cost at 100M sessions** (order of magnitude, managed Postgres + object storage):

- Hot OLTP with partitioning: the same CPU can serve it; partitioning + batching is the win, not a
  bigger instance.
- Rollups: ~2–5 GB total — negligible.
- Warehouse: 300–800 GB compressed depending on retention of `payload`.
- LLM scoring at 2% sampling instead of 100%: ~50× cost reduction on that line item.

The dominant cost driver is **`payload` JSONB cardinality**, not session count. Cap it at 2KB,
version it, and never put free text in it.

---

## 9. Scale lab — generating 100M+ sessions with ground truth

Purpose: prove the metrics engines are *mathematically right* at volume, not just fast. A generator
that produces known-true rates lets every rollup be validated against labels.

### 9.1 Generator design (`scripts/scale-lab/`)

- **Deterministic.** `seed = f(cohort_id, month)`; xorshift/PCG PRNG. Same seed ⇒ same corpus.
- **Population model.** N users with archetype, band, loop set, energy curve, timezone, tenure.
- **Behaviour model.** Hazard of starting per gate (morning/midday/evening/night), per-step drop-off
  hazard that depends on `step_kind` and user band, hazard of abandoning mid-session, probability of
  a crisis event (rare, tagged).
- **Emit.** Exactly the `MetricEvent` envelope, in Parquet or JSONL shards of ~5M events.
- **Scale modes.** `--sessions 1000` (CI), `--sessions 1000000` (perf), `--sessions 100000000`
  (full; run on warehouse, not laptop).

### 9.2 Ground-truth labels (the point of the exercise)

For each (cohort, day, step_kind) the generator knows:

- true started / completed / skipped counts,
- true completion probability and its confidence interval,
- true median duration distribution,
- true archetype ranking (so the bandit's ordering can be scored, e.g. Kendall τ),
- injected anomalies (a deliberate drop at step 4 in one cohort) that a good funnel must surface.

### 9.3 Validation suite

1. **Parity:** `metrics_daily` vs generator labels — exact match on counts, ≤1% relative error on
   rates.
2. **Idempotency:** replay 10% of the corpus; row counts unchanged; rollups unchanged.
3. **Latency:** all panels within §8 SLOs at 100M fixture.
4. **Bandit sanity:** UCB ordering correlates with true ranking (τ ≥ 0.7).
5. **Crisis integrity:** injected crisis events appear in `crisis_daily` exactly, never sampled away.
6. **Retention math:** D1/D7/D30 from `retention_cohort` matches the generator's cohort survival
   curve.

Any metric engine that cannot pass parity against ground truth is either mis-defined or
mis-implemented — fix the definition (§6) before optimizing the query.

---

## 10. Guardrails for an AI consuming this plan

### 10.1 Frozen interfaces (do not change without a migration note)

- `logStepEvent(StepEventInput)` — `src/lib/telemetry/engineTelemetry.ts:149`
- `logEngineDecision(EngineDecisionInput)` — same file, `:54`
- `logCrisisEvent(CrisisEventInput)` — same file, `:95`
- `logEngagement(EngagementInput)` — `src/lib/telemetry/engagementTelemetry.ts:38`
- `logAppContext(AppContextInput)` — `src/lib/telemetry/appContextTelemetry.ts:9`
- `useOpsMetrics()` return shape — `src/hooks/useOpsMetrics.ts:70`
- `completeSession()` / `completeUnifiedSession()` contracts — `src/lib/session/completion.ts:39`
- `whatNext()` return shape — `src/lib/sutra/orchestrator.ts:351`
- `DECISION_POLICY_VERSION` semantics — `src/lib/brain/policy.ts:6`

Adapters change internals; callers must not need edits.

### 10.2 Must not do

- Do not put journal text, `final_user_sentence`, emails, tokens or free-form chat into
  `payload` or any rollup.
- Do not weaken RLS on user-facing tables to make analytics cheaper. Move the query to the
  `analytics` schema behind `service_role` instead.
- Do not DELETE crisis, safety or scoring rows for retention; archive them.
- Do not UPDATE a scored row. Append a new score.
- Do not let dashboards aggregate raw tables "just this once".
- Do not change a metric formula without bumping its definition version and recording the cutover
  day in `metrics_watermark`.

### 10.3 Safe adaptation points

- Sampling rate and model for `score-session-spine` (Phase 4).
- Rollup granularity per metric (hourly vs daily) as long as the SLO holds.
- Warehouse choice (ClickHouse vs BigQuery) — the event contract is the boundary.
- Partition interval (monthly vs weekly) — driven by measured table size.
- Batching thresholds in the client queue (500/5s is a starting point, not a law).

### 10.4 How to use this document as context

- Treat §2 as the **inventory of record**; grep the cited `file:line` before assuming something
  changed.
- Treat §6 as the **definition of record**; if code and this table disagree, this table wins until
  deliberately amended.
- Implement **one phase per change set**, in order. Phases 0–2 are prerequisites for everything
  else; Phase 6 can run in parallel from day one.
- Every PR should name the phase and the SLO it moves.

---

## 11. Open decisions (need a human)

1. **Warehouse:** ClickHouse (cheapest at this volume, self-hosted) vs BigQuery (no ops, per-query
   cost). Both work behind the contract.
2. **Retention:** is 90 days of raw enough for debugging, or does a safety review need 13 months hot?
3. **Score sampling:** 1% vs 5% LLM sampling — trades bandit freshness against cost.
4. **Storage engine for rollups:** tables + watermark (rebuildable, flexible) vs materialized views
   (simpler, coarser). Recommendation: tables.
5. **Mobile offline:** how many days of unsent events must a device retain before dropping?
   Suggested: 7 days or 50k events.
