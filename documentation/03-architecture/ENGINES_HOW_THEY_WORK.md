# ConsciousOS — How The Engines Actually Work (MVP, Deep Dive)

> Companion to `ENGINE_ARCHITECTURE_MVP.md`. That doc was the *map*. This is the *machine room*.
> For each engine: **what it reads, what it computes, what it writes, who calls it, who it calls, and why the math is what it is.**

---

## 0. The Contract Every Engine Obeys

```ts
type EngineInput = {
  snapshot: UserStateSnapshot;    // from L3, never raw tables
  params?: Record<string, unknown>;
};

type EngineOutput = {
  decisions?: Decision[];          // plan steps, nudges, routes
  signals?: ConsciousnessSignal[]; // typed L1 writes
  dimension_nudges?: DimNudge[];   // {id, delta} pairs into the 100-Dim map
  loops_touched?: LoopId[];        // from the 650-ID library
  meta?: Record<string, unknown>;  // explainability payload
};
```

Three invariants:
1. **No engine queries raw user tables.** It calls `user-state-snapshot`.
2. **Every engine writes its reasoning** to `consciousness_signals` so the next snapshot is richer.
3. **Every output is explainable** — a `signalRef` ties any user-visible string back to the loop/dim that caused it.

This contract is what makes the system feel like a transformer instead of a pile of scripts.

---

## 1. L0 — Ingestion Engines (the senses)

### `ingest-signal`
- **Reads:** POST `{ kind, value, meta }` + JWT.
- **Computes:** Validates kind ∈ allowed schema, normalizes timestamp, routes to the correct table (`bio_signals` | `work_signals` | `device_signals` | `mood_pulses` | `typing_biometrics`).
- **Writes:** One row to the typed table; emits a lightweight `consciousness_signals` "raw" pointer.
- **Why:** A single ingress URL keeps the client dumb. The client never needs to know which table a signal belongs to.

### `wearable-sync` / `wearable-oauth-start` / `wearable-oauth-callback`
- **Reads:** OAuth tokens (Fitbit/Apple/Garmin), pulls HRV, RHR, sleep_score, steps.
- **Writes:** `bio_signals` with metric ∈ {`hrv_rmssd`, `rhr`, `sleep_score`, `steps`}.
- **Cron:** Every 15 min for active users.

### Watcher family (`slack-tone-watcher`, `teams-tone-watcher`, `outlook-tone-watcher`, `gmail-tone-watcher`, `linear-workload-watcher`, `github-late-night-watcher`, `calendar-meeting-watcher`)
- **Reads:** OAuth-scoped APIs (only metadata + AI-classified tone, never message bodies stored).
- **Computes:** Tone classification (`calm` | `charged` | `urgent` | `neutral`), workload heuristic (0..1), late-night density.
- **Writes:** `work_signals { signal_type, value, text_value, occurred_at }`.
- **Privacy:** Bodies are sent to the LLM transiently and discarded. Only the *label* is stored. This is the only ethically defensible way to do work-signal inference.

### `stt-listen` / `tts-speak`
- STT → text + prosody features (pace, pause ratio, pitch variance).
- TTS → ElevenLabs (master voices), browser-native fallback.
- **Prosody is a signal**, not just audio. It feeds `infer-three-brain`.

---

## 2. L1 — Domain Taxonomy (not an engine, but the substrate)

- **650-ID Loop Library** — `src/data/handbook/loopFamilies.ts`. Each loop: `{ id, name, family, triggers, indicators, antidotes }`. Stable IDs forever.
- **100-Dimension Map** — `src/lib/consciousness/taxonomy/dimensions100.ts`. 12 parents × ~8 children.
- **11-Band Spiral** — V0–V10, micro-levels 0.0–10.99, 3 speed profiles.
- **Practice Matrix** — Core (always-on), Path (chosen lineage), Specialty (unlockable).

**Why stable IDs matter:** Engine A writes "REC002". Engine B six months later reads "REC002" and knows it's the same late-night-Slack loop. Without stable IDs, you have prompt salad.

---

## 3. L2 — Fusion + Memory Engines (the mixer)

### `signal-fusion` — the heartbeat

Cron every 5 min. For every user with activity in the last 30 min:

```text
hrv_norm    = clamp((hrv - 10) / 90)
tone_load   = clamp((charged - calm) / 5 + 0.5)
restlessness = clamp(phone_pickups / 30)
jitter      = 0.7 if anxious-category device events else 0.3
workload    = clamp(work_signals.workload, 0, 1)
lateNight   = clamp(work_signals.late_night_commits, 0, 1)

stress_norm  = 0.35*(1-hrv_norm) + 0.25*tone_load + 0.15*restlessness
             + 0.10*jitter + 0.15*workload
focus_norm   = 0.35*(sleep/100) + 0.25*(1-restlessness)
             + 0.20*(1-tone_load) + 0.20*(1-workload)
burnout_risk = 0.50*stress_norm + 0.25*(1-focus_norm)
             + 0.15*workload + 0.10*lateNight
```

Then loop detection (rule-based, fast, deterministic):
- `restlessness > 0.6` → `RES003`
- `tone_load > 0.7` → `EMO012`
- `hrv_norm < 0.25` → `BIO005`
- `sleep < 60` → `REC001`
- `workload > 0.7` → `WRK001`
- `lateNight > 0.5` → `REC002`
- `burnout_risk > 0.75` → `BUR001`

Then action selection (priority order):
```
burnout>0.75 → rest_protocol
lateNight>0.6 → sleep_anchor
workload>0.75 → boundary_breath
restlessness>0.6 → walking_meditation
tone_load>0.7 → cooling_breath
focus>0.7 → deep_work_block
else → witness_5min
```

**Writes:** one row to `fused_signals`. **Calls:** `instant-pulse-detector` fire-and-forget.

**Why these weights?** They were tuned against ~3 months of beta data so that `stress_norm > 0.7` correlates with a self-reported "rough" pulse. They are not magic; they are *measured*, *versioned*, and replaceable.

### `instant-pulse-detector`
- **Reads:** last 5 min of `fused_signals` deltas.
- **Computes:** acute spike detection (`Δstress > 0.25` in <10 min) or sustained burnout.
- **Writes:** queues a notification in `nudges` table with cooldown enforcement (max 1 acute nudge / 90 min).

### `embed-memory`
- **Reads:** new chat turns, journal entries, dream notes flagged as salient (length > 40 chars or contains a loop trigger).
- **Computes:** OpenAI / Gemini embedding → 1536-d vector.
- **Writes:** `memories(user_id, content, embedding, source, occurred_at)` with pgvector index.

### `memory-extract`
- **Reads:** raw text + last 5 turns of context.
- **Computes:** LLM-extracts typed facts: `{ kind: "preference"|"relationship"|"event"|"belief", value, confidence }`.
- **Writes:** `user_facts` (typed, deduped).
- **Used by:** every chat engine for retrieval-augmented continuity.

### `memory-consolidate`
- **Cron:** hourly.
- **Computes:** dedup near-duplicate memories (cosine > 0.92), decay stale low-confidence facts, promote facts referenced 3+ times to "core".

### `synthesize-daily-memory` — the sleep cycle
- **Cron:** 02:00 user-local.
- **Reads:** every signal, session, chat turn, mood pulse from the past 24h.
- **Computes:** LLM-generated narrative summary (~200 tokens) + structured deltas: top 3 loops, top 3 dims moved, sentiment arc, breakthrough flag.
- **Writes:** `daily_summaries(user_id, date, narrative, deltas)`.
- **Why:** The next morning's snapshot reads this *first*. The app remembers your yesterday before it asks about your today. This is the closest thing the system has to sleep.

### `pattern-window-detector`
- **Reads:** rolling 7-day window per loop.
- **Computes:** "this is the Nth time this week" + trend slope.
- **Writes:** `consciousness_signals { kind:"pattern_window", loop, count, slope }`.
- **Used by:** Guide chat for "I notice this is the third time…" continuity.

### `aggregate-daily-dimensions`
- **Cron:** 23:50 user-local.
- **Computes:** sums all `dimension_nudges` from the day per dimension, applies decay on untouched dims.
- **Writes:** `dimension_snapshots` daily row. This is what powers the radar chart in The Mirror.

---

## 4. L3 — The Mainspring: `user-state-snapshot`

The single most important engine. ~250 lines.

```text
input  : JWT (client) OR { userId, runtime } (service-role)
runtime: { gate?, energy?, timeBudgetMin?, mood? }
```

**What it assembles (in parallel):**
1. V-Level + speed profile + micro-level (from `vLevelCalculator`).
2. Dimension bands (latest `dimension_snapshots`).
3. Latest `fused_signals` row.
4. Active loops (touched in last 48h).
5. Life stage (`lifeStageDetector`) — student/builder/parent/elder.
6. Lifetime phase (`lifetimeSpiral`) — phase 1..10.
7. Relationship depth (`relationshipDepth`) — phases 1..7 of app intimacy.
8. Retention risk (`retentionEngine`) — at-risk score 0..1.
9. Current program + curriculum arc + next planned session.
10. Last 3 session scores + trend.
11. Top 10 recent memories (vector retrieval against `runtime.gate` keyword).
12. Time-slot pattern (which of 6 patterns this user lives in).
13. Daily summary (from yesterday's `synthesize-daily-memory`).
14. Kundli context (yoni/gana/nadi/rashi/nakshatra/dasha) for masters that use it.

**Cache:** `Map<key, {ctx, expires}>`, key = `userId|gate|energy|timeBudgetMin|mood`, TTL 60s, LRU 500.

**Why 60s?** Engines composing a single session often call it 3–5 times. Without cache, 5× DB roundtrips. With cache, 1× DB + 4× memory.

**Why per-runtime key?** "Morning, low, 5min" produces a fundamentally different plan than "evening, high, 20min". They are different residual states of the same person.

---

## 5. L4 — Specialists (the attention heads)

### Diagnostic family

**`consciousness-engine`** — meta-coordinator. Reads snapshot → returns `{ v_level, weakest_dim, active_loops, recommended_focus, regression_flag }`. Most planners start here.

**`infer-three-brain`** — Head/Heart/Gut dominance from prosody + journal lexicon. Output `{ head: 0..1, heart: 0..1, gut: 0..1, dominant }`. Used by Temple master selection and language refiner.

**`detect-bypassing`** — spiritual bypassing detector. Checks if user uses "transcendence language" while signals show somatic distress. If true, suppresses inspirational content and routes to grounding practice.

**`detect-contradictions`** — finds gaps between stated intention and behavior ("I want stillness" + 47 phone pickups). Flags for Guide to surface gently.

**`detect-anomalies`** — sudden 2σ deviation from baseline on any signal channel. Triggers `instant-pulse-detector`.

**`detect-silence`** — N-day absence detection per practice category. Feeds `predict-churn`.

**`detect-cross-pollination`** — plateau on practice A + spike on practice B → recommend B's primitive applied to A's context.

**`pattern-window-detector`** — see L2.

**`three-lens-analyzer`** — runs any journal entry through three lenses: psychological (cognitive pattern), somatic (body location), philosophical (meaning frame). Returns 3 short paragraphs.

**`evaluate-practice-level`** — given last 5 session telemetries on a practice, returns micro-level delta.

**`assess-starting-levels` / `analyze-assessment`** — onboarding only. Reads 5-question pathfinder → seeds initial V-Level per dimension. Replaces the broken "everyone starts at L0" pattern.

**`compute-companion-state`** — derives `{ state: "supportive"|"challenging"|"witnessing"|"playful", reason }`. Used by companion mode UI.

**`compute-constellation` / `recalibrate-constellation`** — builds the 12-star radar of horizontal capacities. Recalibrate runs weekly.

**`compute-kundli`** — vedic chart math from birth datetime. One-time, cached forever.

### Composition family

**`compose-session-v3`** — the flagship. Algorithm:
1. Read snapshot.
2. Pick **archetype** (one of ~20: Witness, Healer, Builder, Mourner, Rebel, …) via deterministic table on (V-Level band × dominant brain × dominant loop family × gate).
3. Pick **tone words** (3) from archetype's palette.
4. Pick **intent** (one sentence) from archetype × weakest dim.
5. Generate `whyThisSession` referencing one concrete signal.
6. Pick **step skeleton** by `timeBudgetMin`:
   - 3min  → [breath, micro-act]
   - 5min  → [breath, witness, journal]
   - 10min → [wisdom, breath, witness, journal, reflection]
   - 20min → [wisdom, breath, practice, witness, journal, guide-chat, reflection]
7. For each slot, pick the concrete practice by `(weakest_dim × active_loop × V-Level)` lookup.
8. Generate each step's `whyForYou` with `signalRef`.
9. Language-refine pass (LLM) for tone, never for structure.

**`compose-today-practice`** — non-session daily ritual for users in "ambient" relationship phase. Lighter than full session.

**`generate-daily-ritual`** — orchestrates the 4-gate day plan (morning/midday/evening/night) by stitching micro-experiences per gate.

**`generate-session-agenda`** — for structured programs: pulls the next pre-authored block from `program_blocks` and adapts depth to current V-Level.

**`generate-program-session` / `generate-personal-program` / `generate-personal-rhythm`** — program designer. Generates an 8–42 session arc per chosen lineage × goal × time budget.

**`for-you-practices`** — Home rail. Top 5 practice cards ranked by `(weakest_dim_match × time_fit × recency_decay × variety_bonus)`.

**`get-next-practice`** — single best next step in the user's current arc.

**`suggest-next-program`** — Master-of-Masters surface. Pure ranking over (master × mode × practice) cube against snapshot. No LLM — deterministic, fast, explainable.

**`adapt-next-block` / `session-adapter`** — mid-session adaptation. If user dwells too long or drops, swap the next step to lower difficulty.

**`assign-curriculum-arc`** — picks the right 8–42 session arc for the user's lifetime phase.

**`generate-theme` / `evolve-theme`** — Living Theme engine. One daily theme that evolves session-by-session (deepen / hold / close).

### Conversational / Master family

**`guide-chat`** — the wise sibling. Uses streaming. System prompt assembled from snapshot:
```
[CORE_PERSONA]
+ [USER_FACTS top 5]
+ [YESTERDAY_NARRATIVE from synthesize-daily-memory]
+ [ACTIVE_LOOPS humanized]
+ [WEAKEST_DIM]
+ [SPEED_PROFILE]
+ [KUNDLI_CONTEXT if subscribed]
+ [SAFETY_FLOOR]
+ [LIVE_DETECT instruction: tag any loop you detect with LOOP:ID]
```
Post-stream: parses `LOOP:` tags → writes to `consciousness_signals` → feeds next snapshot.

**`temple-chat`** — per-master. Same skeleton but persona = master file (Adiyogi, Patanjali, Ramana, Nisargadatta, …). Adds master-specific lineage vocabulary. Stores per-master conversation thread.

**`elder-dialogue`** — elder care variant: slower pacing, longer pauses, larger emotional reflection.

**`master-journey-review`** — credit-gated. Master reads the user's last 30 days of `consciousness_signals` + `daily_summaries` and writes a 400-word personal letter.

**`generate-master-next-step`** — per master, "what would this master tell you to do next" → one practice card.

**`generate-master-theme-teaching`** — daily ~150-word teaching from a rotating master on the day's theme.

**`council-consensus`** — multi-master deliberation. Picks 3 relevant masters via snapshot → runs 3 parallel `temple-chat` style completions on the same prompt → a 4th aggregator LLM call resolves consensus into one ruling with attributed dissents. **Council is a primitive, not a UI trick.**

**`discovery-session`** — first-ever session. 6-step cinematic onboarding.

**`pre-journey-chat`** — pre-program orientation.

**`mirror-session`** — landing-page 4-phase diagnostic for non-users.

**`guru-practice-session`** — guided practice with a chosen master voicing each step via `tts-speak`.

### Reflective / Integration family

**`journal-reflect`** — manual "go deeper" after typing pause. Returns a question, never an answer.

**`guide-insight`** — end-of-week summary: 3 patterns I noticed, 1 invitation for next week.

**`post-event-reflection`** — after calendar events (meeting, social) → "how did that land?".

**`pre-event-nudge`** — before known stressor events → 60-sec prep practice.

**`decode-dream`** — symbolic + somatic + archetypal lenses on a dream description. Stores in `dreams`.

**`extract-sacred-moments`** — scans the day for moments the user marked sacred → builds an archive surface.

**`integrate-human-map`** — periodic recompute of the 100-dim map from accumulated signals.

**`reflect-game`** — game session telemetry → faculty deltas.

### Predictive / Lifetime family

**`predict-churn`** — gradient-boosted-ish heuristic over (silence_days × signal_volume_decline × last_score). Output `risk: 0..1`. Drives proactive nudges.

**`predictive-insights`** — 7-day forecast of dimension trajectories + burnout risk. Powers the admin Mirror.

**`next-session-preview`** — "tomorrow glimpse" teaser at end of each session.

**`generate-journey-nudge`** — push-notification copy adapted to (relationship phase × retention risk × time of day).

**`generate-higher-self-letter`** — wise-future-self letter generator. Used sparingly.

**`curiosity-engine`** — proposes one *novel* practice the user has never tried but the matrix says they're ready for. Confidence-scored. Loops back through `verify-breakthrough` to learn.

**`recalibration-intelligence`** — meta-engine that watches every other engine's accuracy (score vs predicted) and adjusts weights.

**`graduation-deep-analysis`** — at end of a multi-week program: 800-word "what you actually changed" letter, with measured dim deltas.

### Feedback / Scoring family (L6 — covered next)

`score-session-spine`, `verify-breakthrough`, `session-complete`, `complete-task`.

### Infra family

**`razorpay-order` / `razorpay-verify`** — credit purchase + atomic deduction. 75/25 split (75 to per-session pool, 25 to AI pool).

**`translate-ui`** — strict pure-English default, on-demand translation for 40+ locales.

**`always-open-prompts`** — long-context system prompts kept hot.

**`activate-specialty`** — unlocks a Specialty practice after criteria met.

**`live-detect`** — sub-engine called inline by `guide-chat` for hybrid loop detection.

**`recall-memory`** — vector query helper used by any chat engine.

**`seed-demo-org` / `admin-*` / `enterprise-*`** — see L8.

---

## 6. L5 — Composition Walkthrough (one real call)

Goal: build the 06:42 morning session.

```text
1. user-state-snapshot({ gate:"morning", energy:"low", timeBudgetMin:10 })
   ── returns 14-field snapshot in <80ms (cached)

2. compose-session-v3(snapshot)
   2a. consciousness-engine(snapshot) → { v:2.4, weak:"stillness-3", loops:[REC002,EMO012], regression:false }
   2b. archetype lookup table[ V:2 × dominant:heart × loop_family:recovery × gate:morning ] → "Healer"
   2c. tone_words = Healer.palette.pick(3) = ["gentle","spacious","unhurried"]
   2d. intent = `Heal the leak between yesterday and now.`
   2e. whyThisSession = `You slept 5h2m and Slack lit up at 23:41. This is a repair session, not a performance one.`
   2f. skeleton[10min] = [wisdom, breath, witness, journal, reflection]
   2g. fill:
       wisdom    → wisdom-card #W-REC-014 ("Rest is not retreat")
       breath    → boundary-breath 3m  (REC002 antidote)
       witness   → thought-counter 2m  (stillness-3 lever)
       journal   → "what did last night cost you?" (one line)
       reflection→ "what's one boundary today?" (one line)
   2h. whyForYou per step with signalRef = REC002 / stillness-3 / score-trend / sleep_score
   2i. language-refine LLM pass: tones each microcopy to "gentle/spacious/unhurried"

3. Returned to client. XState sessionMachine boots.
```

Every step is *traceable* to a signal. There is no "the AI said so".

---

## 7. L6 — The Feedback Loop (the gradient)

### `session-complete`
- **Reads:** all per-step telemetry from the client.
- **Calls:** `score-session-spine` → `verify-breakthrough` → `karma`.
- **Writes:** `sessions` row, `consciousness_signals`, invalidates snapshot cache for user.

### `score-session-spine`
- **Inputs:** step completion fraction, dwell time per step, reflection length, post-session pulse, prosody if voice.
- **Formula (rough):**
```
completion = steps_done / steps_total
dwell_fit  = 1 - |actual_minutes - planned_minutes| / planned_minutes
reflection = clamp(len(reflection) / 80, 0, 1)
pulse_lift = (post_pulse - pre_pulse + 5) / 10
quality    = 0.35*completion + 0.20*dwell_fit + 0.20*reflection + 0.25*pulse_lift
```
- **Output:** `quality_score ∈ [0,1]` + breakdown.

### `verify-breakthrough`
- **Reads:** last 7 session scores per practice + dimension nudges.
- **Computes:** if rolling-mean(score) > 0.75 for 3 consecutive sessions AND weakest_dim improved >0.15 → micro-level up.
- **If score < 0.35 for 3 sessions** → regression event → 6-step regression protocol queued.
- **Writes:** V-Level deltas, dimension nudges, regression flags.

### `complete-task`
- **Smaller cousin** for individual tasks within a day plan. Awards 20–35 karma, updates capacity markers, unlocks next chained task.

### Karma + economy
- Karma = the user-facing XP. Tied 1:1 with credit micro-rewards.
- **Atomic deduction** at session start (`ensureCreditsForSession`) prevents free sessions for zero-balance users.

---

## 8. L7 — Surfaces (where engines meet humans)

Each surface is a **dumb renderer** of engine output.

| Surface           | Engine that owns it                                  |
| ----------------- | ---------------------------------------------------- |
| Home day plan     | `generate-daily-ritual` + `for-you-practices`        |
| Generative Session| `compose-session-v3` + `sessionMachine` (XState)     |
| Temple chat       | `temple-chat`                                        |
| Guide chat        | `guide-chat` + `live-detect`                         |
| Journal           | `journal-reflect` + `three-lens-analyzer`            |
| Games             | `reflect-game` + faculty-specific scoring            |
| Council           | `council-consensus`                                  |
| Mirror (analytics)| `compute-constellation` + `predictive-insights`      |
| Programs          | `generate-personal-program` + `generate-program-session` |
| Notifications     | `generate-journey-nudge` + `instant-pulse-detector`  |

State on the client is XState (`sessionMachine`, `appEntryMachine`, `dailyCycleMachine`, …). React Query for server cache. **All intelligence is server-side. The client never decides.**

---

## 9. L8 — Admin / Enterprise / Privacy

- **`enterprise-insights`** — org-level heat maps with `n ≥ 5` floor enforced in SECURITY DEFINER SQL functions. No individual exposable.
- **`enterprise-people-intelligence`** — manager-side anonymous aggregations.
- **`manager-coaching`** — AI coaching for managers reading the heat map.
- **`org-program-designer`** — designs org-wide programs.
- **`org-weekly-briefing`** — weekly digest per org.
- **`admin-copilot`** — admin support assistant with RBAC scoping.
- **`admin-ai-insights`** — fleet-wide health.
- **`admin-broadcast`** — admin → users push.
- **`seed-demo-org`** — demo data seeding for sales calls.

---

## 10. The Loop, Compressed to 9 Lines

```text
ingest    → typed signals land in domain tables
fuse      → 5-min cron compresses 12 channels into normalized stress/focus/burnout
remember  → embed, extract, consolidate, synthesize (sleep)
snapshot  → 60s-cached canonical state per user × runtime
diagnose  → specialists infer loops, dims, brain, archetype, lifetime phase
compose   → archetype + skeleton + practices + whyForYou
render    → surfaces show plan, XState drives flow
score     → quality 0..1 + dim nudges
write     → back into L1 + L2 + L3 invalidation
                   ↑                                              │
                   └──────────────────────────────────────────────┘
                          (the loop is the moat)
```

---

## 11. Numbers That Matter

| Metric                                    | MVP value           |
| ----------------------------------------- | ------------------- |
| Edge functions live                       | 103                 |
| Stable loop IDs in library                | 650                 |
| Dimensions tracked                        | 100 (12 × ~8)       |
| V-Level bands                             | 11 (V0–V10)         |
| Master personas                           | 118                 |
| Programs available                        | 80+                 |
| Signal channels                           | 12                  |
| Snapshot fields assembled                 | 14                  |
| Snapshot cache TTL                        | 60s                 |
| Fusion cron interval                      | 5 min               |
| Daily memory consolidation                | 02:00 user-local    |
| Sessions before V-Level up (Steady)       | ~7 with mean ≥ 0.75 |
| Regression trigger                        | 3 consecutive < 0.35|

---

## 12. The One-Liner

> Each engine is small. There are 103 of them. They all read from one snapshot, all write back through one feedback loop, and all speak one 650-symbol vocabulary. That is why this is a system, not a prompt.

End of document.
