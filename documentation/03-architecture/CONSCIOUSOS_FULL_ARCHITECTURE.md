# ConsciousOS — The Full Architecture

> A closed-loop inference pipeline over a longitudinal human state.
> Not a prompt wrapper. Not a chatbot. An operating system for consciousness.

**Audience:** The smartest mind in the room. An investor, a researcher, a competitor's CTO. Someone who will say *'so it's just GPT with a prompt?'* in the first 30 seconds. This file is the answer.

**Length target:** exhaustive. Every layer, every engine, every table, every loop family, every yogic band, every game, every feedback edge. If a system exists in the codebase, it is described here with its inputs, outputs, and why it cannot be reproduced by prompting an LLM.

**Reading order:** Part I gives the 60-second pitch. Part II gives the transformer analogy. Part III walks the 9 layers. Part IV documents every one of the 103 edge functions. Part V documents every domain model (loops, bands, yoga levels, dimensions, gates, games, lifetime spiral). Part VI is the 10 falsifiable moat claims. Part VII is the meeting script.

---

# Part I — The 60-Second Pitch

Every consumer AI app today is the same shape:

```
user input  →  prompt template  →  LLM  →  response
```
They differ in prompt cleverness and UI. The model is the product. Switch the model and the company evaporates.

ConsciousOS is a different shape:

```
12 signal channels                      (multi-modal ingest)
        ↓
650-ID Loop Library + Detectors         (typed pattern grammar)
        ↓
Fusion + Vector Memory + Daily Sleep    (longitudinal compression)
        ↓
user-state-snapshot  ← THE MAINSPRING   (single canonical state)
        ↓
103 specialist engines in parallel      (LLM = subroutine, not product)
        ↓
Day plan / Session / Nudge / Master reply
        ↓
session-complete → score → verify-breakthrough → karma → regression
        ↑__________________________________________________________|
                       writes back into state — closed loop
```
The LLM is **one cell** in row 5. Remove it and replace it with another LLM, the system still works. The product is the **state**, the **loop library**, the **fusion**, and the **closed feedback loop**. None of those are prompts.

---

# Part II — The Transformer Analogy (for the AI literate)

If a transformer is your mental model, here is the exact mapping.

| Transformer concept | ConsciousOS concept | Where it lives |
|---|---|---|
| Tokens | Raw signals (chat msg, HRV tick, late-night commit, etc.) | `L0` ingest fns, `bio_signals`, `work_signals`, `device_signals` |
| Token embeddings | Loop IDs from the 650-entry Loop Library | `live-detect`, `pattern-window-detector`, `loop_attributions` |
| Positional encoding | Daily gate + life-stage + lifetime-phase + kundli context | `dailyGates.ts`, `lifetimeSpiral.ts`, `user_kundli` |
| Attention layer | An edge function reading state + scoring an output | Any `L4` engine |
| Multi-head attention | 103 specialist engines running in parallel | All of `supabase/functions/*` |
| Residual stream | `user-state-snapshot` — the canonical state every engine reads | `user-state-snapshot/index.ts` |
| Layer norm | `signal-fusion` normalizing stress/focus/burnout to [0,1] | `signal-fusion/index.ts` |
| Feed-forward block | LLM call inside an engine (Groq llama-3.3-70b) | `_shared/ai-gateway.ts` |
| Output head | Day plan, session steps, nudge text, master reply | `compose-session-v3`, `guide-chat`, `temple-chat`, `nudge_queue` |
| Backprop / training | `session-complete` → `score-session-spine` → `verify-breakthrough` → writes to `karma_events`, `regression_events`, `cross_pollination_log` | `L6` |
| Pre-training corpus | 650 loops, 118 masters, 100 dimensions, 11 bands, 80+ programs — encoded as typed data, not prose | `src/data/*`, `src/lib/consciousness/*` |
| Long-context memory | pgvector embeddings + daily memory synthesis (sleep-like consolidation) | `embed-memory`, `synthesize-daily-memory`, `user_memory_vectors` |
| RLHF | Quality score 0-1 per session + breakthrough verification + karma economy | `score-session-spine`, `verify-breakthrough`, `user_karma` |

**Implication.** A prompt-based competitor is the equivalent of a single untrained transformer block calling a pretrained model. We are the whole stack: tokens, embeddings, attention, residual stream, output head, and — most importantly — the **training loop that writes back into the state**.

---

# Part III — The 9 Layers, Walked End-to-End

## L0 — Ingestion

The system accepts ~12 channels of input. Each is normalized into a typed row
in one of three signal tables (`bio_signals`, `work_signals`, `device_signals`)
or into a domain table (`mood_pulses`, `session_messages`, `journal_entries`,
`practice_voice_recordings`, `dream_entries`).

| Channel | Source | Edge fn | Table |
|---|---|---|---|
| Text chat | Guide/Temple UI | `guide-chat`, `temple-chat` | `session_messages`, `temple_ai_conversations` |
| Voice | Browser mic → Whisper | `stt-listen` | `practice_voice_recordings` |
| Typing biometrics | `useTypingCadence` hook | `ingest-signal` | `device_signals` |
| Phone pickups | `usePhonePickups` (Android usage / iOS Screen Time) | `ingest-signal` | `device_signals` |
| HRV / RHR / Sleep | Wearable OAuth (Oura/Whoop/Fitbit/AppleHealth) | `wearable-sync` | `bio_signals` |
| Calendar / meetings | Google/Outlook calendar | `calendar-meeting-watcher` | `meeting_nudges`, `work_signals` |
| Email tone | Gmail / Outlook | `gmail-tone-watcher`, `outlook-tone-watcher` | `work_signals` |
| Chat tone | Slack / Teams | `slack-tone-watcher`, `teams-tone-watcher` | `work_signals` |
| Code patterns | GitHub late-night, Linear workload | `github-late-night-watcher`, `linear-workload-watcher` | `work_signals` |
| Game telemetry | `ConsciousGameShell` (breath, face-cam, mic, haptics) | `reflect-game` | `consciousness_signals` |
| Mood pulses | One-tap UI | (direct insert) | `mood_pulses` |
| Geo anchors | Browser geolocation | (direct insert) | `geo_anchors`, `geo_practice_anchors` |

Consent is enforced per-channel via `signal_consents` table and the
`SentientWatchersProvider` component — a watcher cannot mount without an
opted-in consent row.

## L1 — Detection — raw → typed pattern

This is where ConsciousOS stops looking like a normal app. Every signal that
enters is examined for membership in the **650-ID Loop Library** — a typed
grammar of human psychological patterns (e.g. `VAL001` = value-action conflict,
`RES003` = sympathetic restlessness, `EMO012` = suppression-spike, `BUR001` =
burnout vector, `BIO005` = low-HRV chronic stress, `REC001` = sleep deficit).

Detector functions:

- **`live-detect`** — runs on every chat message and journal entry. Hybrid
  approach: deterministic regex/heuristics first, then LLM fallback for
  ambiguous text. Writes `loop_attributions` rows with confidence scores.
- **`detect-bypassing`** — spiritual bypassing detector. Looks for
  "I'm fine / blessed / grateful" patterns *after* a stress-signal spike.
- **`detect-anomalies`** — z-score against the user's own 30-day baseline.
- **`detect-contradictions`** — compares declared values (from onboarding,
  Sankalpa, journal) against revealed behavior in `consciousness_signals`.
- **`detect-cross-pollination`** — when a Witness practice gain shows up as
  a HRV improvement two days later, this records the causal edge.
- **`detect-silence`** — absence detector. Long silence ≠ peace; sometimes
  it is avoidance. Differentiates by surrounding signals.
- **`pattern-window-detector`** — sliding-window aggregator across N days.
- **`evaluate-practice-level`** — quality score for a single practice rep.
- **`infer-three-brain`** — Head / Heart / Gut dominance inference per turn.
- **`instant-pulse-detector`** — sub-minute acute spike detector, queues
  immediate nudges into `nudge_queue`.

Output of L1 is always a typed row referencing a Loop ID or a Dimension.
**A prompt-based system cannot do this** because it has no library of types
to detect against. It can describe what it sees in prose; it cannot say
"this is `RES003` at confidence 0.82, the user's 4th occurrence this week,
correlating with `WRK001` workload spike."

## L2 — Fusion & Memory — many signals → one state

L1 produces a *firehose* of typed events. L2 compresses them.

**Fusion (`signal-fusion`)** runs on a 5-minute pg_cron. Reads the last
30 minutes of `bio_signals`, `work_signals`, `device_signals` per user.
Normalizes everything to [0,1]. Computes three scalars:

- `stress_norm` = f(1−HRV, tone_load, restlessness, jitter, workload)
- `focus_norm`  = f(sleep, 1−restlessness, 1−tone_load, 1−workload)
- `burnout_risk` = f(stress, 1−focus, workload, late_night)

Then maps to a **recommended action** (witness_5min, rest_protocol,
sleep_anchor, boundary_breath, walking_meditation, cooling_breath,
deep_work_block). Writes one row to `fused_signals`.

**Vector memory (`embed-memory`, `recall-memory`)** — important moments
from sessions, journals, breakthroughs are embedded with a sentence-transformer
and stored in `user_memory_vectors` (pgvector). Recall is semantic — at
session-compose time we pull the 5 most relevant past moments.

**Daily memory synthesis (`synthesize-daily-memory`)** — once per day,
sleep-like consolidation: yesterday's signals, sessions, and journal entries
are summarized by an LLM into a single `daily_memory_synthesis` row with
themes, breakthroughs, and a one-line "what today taught you." This is the
analogue of biological memory consolidation during sleep.

**Pattern + dimension aggregation** — `aggregate-daily-dimensions` rolls up
per-dimension signal deltas into `daily_dimension_summary`. `extract-sacred-moments`
finds moments of unusual quality (high HRV + low tone-load + reflective journal)
and writes `sacred_moments`. `compute-constellation` and `recalibrate-constellation`
maintain `user_practice_constellation` — the 43-column matrix of where the user
is on every practice path.

**Companion + identity** — `compute-companion-state`, `compute-kundli`,
`integrate-human-map` enrich the state with relational/astrological/typological
context.

## L3 — Mainspring — `user-state-snapshot`

This is the architectural keystone. Without it, the system is 103 functions
duplicating queries. With it, the system has a single canonical "who is this
user right now" object that every engine reads from.

- Lives in `supabase/functions/user-state-snapshot/index.ts`.
- Wraps `_shared/user-context.ts::getUserContext()`.
- Per-user, per-runtime-context 60s in-memory cache, capped at 500 entries.
- Cache key includes `gate`, `energy`, `timeBudgetMin`, `mood` so morning-low-energy
  ≠ evening-high-energy.
- Accepts both JWT (client diagnostics) and service-role (internal engine calls).

A snapshot contains, at minimum:

- Identity: id, profile, kundli, life stage, lifetime phase, relationship depth.
- Spiritual DNA: V-level, dimension bands (12 dims), brain dominance, paths.
- Active state: today's gate, today's theme arc, today's sankalpa, today's
  practice pack, recent regression flag, plateau flag.
- Behavioral: last 7 days quality scores, recent loops, recent dimension deltas,
  fused stress/focus/burnout, recent karma events.
- Memory: top-K semantic memory snippets, daily synthesis, sacred moments,
  inside jokes, future-self letters.

**Why this layer is the moat.** Every decision engine reads this object, not
raw tables. That means the decision functions are *stateless and swappable*.
You can rewrite `compose-session-v3` tomorrow and it still works, because
the contract is "given a snapshot, return a session plan." This is the same
discipline as the residual stream in a transformer.

## L4 — Decision Engines — 103 specialist heads

This is the layer competitors call "the AI". For us it is one layer of many,
and the LLM is a subroutine inside it, not the product. Engines fall into
six functional clusters:

**4.1 Session composition** — `compose-session`, `compose-session-v3`,
`compose-today-practice`, `generate-session-agenda`, `generate-program-session`.
Given a snapshot, build a typed `SessionPlan` (intent, intro, steps[]).
Each step has a `whyForYou` sentence referencing the signal that justified it
(the Sankalpa Engine T1 contract). Templates differ in which practice type
they bias toward and how they interpret recent quality.

**4.2 Personalization / next-step** — `get-next-practice`, `for-you-practices`,
`suggest-next-program`, `next-session-preview`, `adapt-next-block`,
`session-adapter`, `generate-personal-program`, `generate-personal-rhythm`,
`generate-daily-ritual`.

**4.3 Theme + wisdom + master** — `generate-theme`, `evolve-theme`,
`generate-wisdom`, `generate-master-theme-teaching`, `generate-master-next-step`,
`generate-journey-nudge`, `generate-higher-self-letter`.

**4.4 Council / deliberation** — `consciousness-engine`, `council-consensus`,
`three-lens-analyzer`, `curiosity-engine`. The Council Consensus pattern is
particularly important: when a decision is high-stakes (e.g. a master reply
to a user in dark-night-of-the-soul), three masters draft replies and a
consensus head picks/synthesizes. This is the Mixture-of-Experts pattern
implemented at the *spiritual* level.

**4.5 Prediction / risk** — `predictive-insights`, `predict-churn`,
`recalibration-intelligence`. Project the user's trajectory N days forward.

**4.6 Assessment + activation** — `analyze-assessment`, `assess-starting-levels`,
`assign-curriculum-arc`, `activate-specialty`, `always-open-prompts`,
`pre-event-nudge`, `post-event-reflection`.

## L5 — Conversation & Delivery

The user-facing surface. Every conversation channel is its own engine because
the persona, safety rails, and memory scope differ:

- **`guide-chat`** — the warm "wise sibling" persona, default daily companion.
  Auto-injects kundli context, continuity-engine memory, and three-brain
  inference into the system prompt.
- **`temple-chat`** — guru-shishya persistent dialogue with 1 of 118 masters.
  Persona file per master, voice cloning via ElevenLabs, language mirroring,
  safety layer for fragile states.
- **`elder-dialogue`** — late-life-stage persona, used during graduation phase.
- **`discovery-session`** / **`mirror-session`** — the 4-phase cinematic
  diagnostic from the landing page. Cold-start consciousness assessment.
- **`pre-journey-chat`** — onboarding conversation that produces Spiritual DNA.
- **`journal-reflect`** — manual "go deeper" prompt after a typing pause.
- **`guru-practice-session`** / **`master-journey-review`** — credit-gated
  high-context analyses by a chosen master.
- **`graduation-deep-analysis`** — at end of an arc, produces a 33-column
  `graduation_reports` row.
- **`decode-dream`** — symbolic interpretation of `dream_entries`.
- **`tts-speak`** — ElevenLabs TTS with browser-native fallback (silent in
  meditative contexts so a network failure never breaks the meditation).

## L6 — Feedback Loop — the closed circuit

This is the layer that converts ConsciousOS from "an app with AI" into
"a system that learns the specific human." Three functions form the circuit:

1. **`session-complete`** — fires when the user finishes any session.
   Writes `sessions` row, marks `daily_sessions`, decrements credits,
   triggers downstream.
2. **`score-session-spine`** — assigns a 0-1 quality score by looking at:
   step-completion ratio, time-on-step variance, journal depth (LLM scored),
   biometric coherence during the session (HRV trend), self-report rating,
   and whether the practice actually moved the targeted loop/dimension.
   Writes `session_spine`.
3. **`verify-breakthrough`** — if the score and signals exceed thresholds
   AND the user reports an "aha", records a verified breakthrough event,
   awards karma, and *promotes the user's V-level* on the relevant dimension.

Side effects fan out:

- `karma_events` + `user_karma` — gamified progress, not vanity points; karma
  is the substrate for the credit economy and for level-up thresholds.
- `regression_events` — quality drop triggers softening of next session and
  optional dark-night support (`recalibration-intelligence`).
- `cross_pollination_log` — when a practice in one tradition produces gains
  in another dimension (e.g. Vipassana Witness practice improving HRV),
  the causal edge is recorded and *fed into future composition decisions*.
- `daily_engine_plans` — tomorrow's plan is pre-computed from today's outcome.

**This is the loop.** Tomorrow's snapshot is a function of today's score.
Tomorrow's engines therefore make different decisions. The user's experience
on day 30 is unrecognizable from day 1, not because the prompts got better,
but because the *state they operate on* is unrecognizable.

## L7 — Org / Enterprise

A standalone surface that does NOT compromise individual privacy. Hard floor:
no manager sees anything unless `n >= 5` aggregation. Implemented via
SECURITY DEFINER functions that refuse to return rows under the threshold.

- `enterprise-insights`, `enterprise-people-intelligence` — aggregated team
  heat maps.
- `manager-coaching` — coaching prompts derived from aggregate trends, not
  individuals.
- `org-program-designer`, `org-weekly-briefing` — org-level program building.
- `seed-demo-org` — demo data for sales.

## L8 — Admin / Ops / Economy

- `admin-ai-insights`, `admin-broadcast`, `admin-copilot` — operator surfaces.
- `complete-task` — daily task lifecycle.
- `translate-ui` — runtime i18n.
- `razorpay-order`, `razorpay-verify` — credit purchase, atomic deduction.
- Credits gate every AI feature; `ensureCreditsForSession()` redirects to
  `/app/credits` before a session is composed so no free sessions leak.

---

# Part IV — Every Edge Function, Documented

The system ships **102 edge functions** today. They are grouped by layer below. Each entry lists: purpose, inputs (what state/tables it reads), outputs (what it writes), and the LLM dependency (if any).

## L0 — Ingestion (data in)

#### `ingest-signal`

_bio_

- **Source:** `supabase/functions/ingest-signal/index.ts` (~160 lines)

#### `stt-listen`

_Unified STT (batch / short utterances): Deepgram Nova-3 (primary) -> ElevenLabs Scribe (fallback) -> instructs client to use Web Speech API. Accepts multipart/form-data with field "audio" OR JSON { audioBase64, mimeType }._

- **Source:** `supabase/functions/stt-listen/index.ts` (~130 lines)

#### `wearable-sync`

_Daily wearable sync (cron). For each (user, provider) row in wearable_tokens, pulls the last 24h of HRV, sleep score, and RHR, then inserts into bio_signals. This function is intentionally tolerant: per-provider failures are logged and skipped so one bad token never blocks the whole sweep. /_

- **Source:** `supabase/functions/wearable-sync/index.ts` (~131 lines)

#### `wearable-oauth-start`

_Generic wearable OAuth start. Builds the provider auth URL with the user's id encoded in `state` so the callback can persist tokens to the right user. Required secrets per provider (only the ones the user actually enables): OURA_CLIENT_ID / OURA_CLIENT_SECRET FITBIT_CLIENT_ID / FITBIT_CLIENT_SECRET WHOOP_CLIENT_ID / WHOOP_CLIENT_SECRET /_

- **Source:** `supabase/functions/wearable-oauth-start/index.ts` (~79 lines)

#### `wearable-oauth-callback`

_Wearable OAuth callback. Exchanges code → tokens against the provider, then stores into wearable_tokens. The user is redirected back to /app/integrations. /_

- **Source:** `supabase/functions/wearable-oauth-callback/index.ts` (~92 lines)

#### `calendar-meeting-watcher`

_Calendar meeting watcher (cron, every 5 min). For each user with the google_calendar / outlook connector linked, look at the next ~2h of events and create one "pre" nudge 90s before each meeting and a "post" nudge ~3 min after each meeting ends. We dedupe via UNIQUE (user_id, external_event_id, kind) on meeting_nudges. Reads Google Calendar via the ConsciousOS connector gateway. Outlook is a stub for _

- **Source:** `supabase/functions/calendar-meeting-watcher/index.ts` (~85 lines)

#### `gmail-tone-watcher`

_gmail-tone-watcher Pulls last 15 min of Gmail inbox subjects/snippets via the Gmail gateway, scores tone (charged / neutral / calm) and writes one work_signals row per consenting user. Run from pg_cron every 15 min. /_

- **Source:** `supabase/functions/gmail-tone-watcher/index.ts` (~110 lines)

#### `outlook-tone-watcher`

_outlook-tone-watcher Pulls last 15 min of inbox messages via Microsoft Outlook gateway, scores subject+preview tone, writes one work_signals row per user. /_

- **Source:** `supabase/functions/outlook-tone-watcher/index.ts` (~90 lines)

#### `slack-tone-watcher`

_slack-tone-watcher Pulls recent messages from a Slack channel via the Slack gateway, scores collective tone (charged / neutral / calm) using lightweight lexicon, and writes a `work_signals` row per channel/window. Triggered every 15 min by cron. Per-user; iterates users with slack consent. /_

- **Source:** `supabase/functions/slack-tone-watcher/index.ts` (~133 lines)

#### `teams-tone-watcher`

_teams-tone-watcher Pulls recent Teams chat messages via Microsoft Teams gateway, scores tone, writes work_signals per user. /_

- **Source:** `supabase/functions/teams-tone-watcher/index.ts` (~92 lines)

#### `github-late-night-watcher`

_github-late-night-watcher Scans last 24h of authored commits per consenting user and counts those made between 22:00 and 05:00 local-ish time (UTC-shifted by user_time_profile if available, else UTC). Writes a single work_signals row per user with a 'late_night_commits' signal_type and a normalized intensity value [0..1]. Requires a GITHUB_TOKEN secret (classic PAT or fine-grained, repo:read scope_

- **Source:** `supabase/functions/github-late-night-watcher/index.ts` (~96 lines)

#### `linear-workload-watcher`

_linear-workload-watcher Reads open issues assigned to current user via Linear GraphQL gateway, computes workload (open count, urgent count, due-soon count) and writes work_signals per user. Late-night activity → burnout signal. /_

- **Source:** `supabase/functions/linear-workload-watcher/index.ts` (~91 lines)

#### `reflect-game`

- **Source:** `supabase/functions/reflect-game/index.ts` (~87 lines)

## L1 — Detection (raw → signal)

#### `live-detect`

_Credit check_

- **Source:** `supabase/functions/live-detect/index.ts` (~264 lines)

#### `detect-bypassing`

_/_

- **Source:** `supabase/functions/detect-bypassing/index.ts` (~143 lines)

#### `detect-anomalies`

_Tier 4: Anomaly detection — heuristic, runs in O(s) time on small windows._

- **Source:** `supabase/functions/detect-anomalies/index.ts` (~70 lines)

#### `detect-contradictions`

_detect-contradictions Compares the user's latest 5 utterances (journal/chat) with older "stated positions" from >=7 days ago, finds topic-similar pairs via pgvector, and asks a fast LLM whether the new statement contradicts the older one. On contradiction, inserts an engine_signal of type='contradiction' so the Consciousness Bus surfaces it gently in the UI. Idempotent. Safe to call ad-hoc or from_

- **Source:** `supabase/functions/detect-contradictions/index.ts` (~211 lines)

#### `detect-cross-pollination`

_/_

- **Source:** `supabase/functions/detect-cross-pollination/index.ts` (~140 lines)

#### `detect-silence`

_detect-silence What the user AVOIDS shows the unconscious. This engine finds: 1) Step kinds repeatedly skipped in the last 14 days (>= 3 skips, < 1 completion of same kind) 2) Loop IDs that were active and then went silent without resolution (no mention in journal/chat in the last 14 days, but mentioned in days 15–45 — i.e. "you stopped talking about X") 3) Domains in `engine_signals` that have un_

- **Source:** `supabase/functions/detect-silence/index.ts` (~200 lines)

#### `pattern-window-detector`

_pattern-window-detector Cron every 30 min. Reads last 3h + 7d of signals, applies the integration→loop ruleset, writes loop_attributions and queues 'pattern' nudges. /_

- **Source:** `supabase/functions/pattern-window-detector/index.ts` (~182 lines)

#### `evaluate-practice-level`

_/_

- **Source:** `supabase/functions/evaluate-practice-level/index.ts` (~209 lines)

#### `infer-three-brain`

_3-Brain Inference — head/heart/gut weekly snapshot from last 30d signals + journal._

- **Source:** `supabase/functions/infer-three-brain/index.ts` (~104 lines)

#### `instant-pulse-detector`

_instant-pulse-detector Called by signal-fusion (or directly after ingest-signal) for a specific user. Detects acute spikes in the last 15 min and queues an 'instant' nudge. /_

- **Source:** `supabase/functions/instant-pulse-detector/index.ts` (~93 lines)

## L2 — Fusion & Memory

#### `signal-fusion`

_The Fusion Engine. Pulls the last 30 min of bio/work/device signals for every user, normalizes them to [0..1], scores stress/focus/burnout-risk, picks a recommended action, and writes one row to fused_signals. Designed to run from pg_cron every 5 minutes. /_

- **Source:** `supabase/functions/signal-fusion/index.ts` (~133 lines)

#### `embed-memory`

_Embed-memory: take a user utterance, embed it via Gemini text-embedding-004, and store it in user_memory_vectors so it can be semantically recalled later._

- **Source:** `supabase/functions/embed-memory/index.ts` (~98 lines)

#### `memory-extract`

_Auth_

- **Source:** `supabase/functions/memory-extract/index.ts` (~228 lines)

#### `memory-consolidate`

_─── Atomic Credit Pre-Check ───_

- **Source:** `supabase/functions/memory-consolidate/index.ts` (~266 lines)

#### `recall-memory`

_Recall-memory: semantic search over user_memory_vectors. Returns top matches with `days_ago` and, if a loop_id is provided, an occurrence count over the past N days (so the AI can say "this is the 7th time you've touched abandonment in 60 days")._

- **Source:** `supabase/functions/recall-memory/index.ts` (~105 lines)

#### `synthesize-daily-memory`

_Synthesize-daily-memory: produces one 3-sentence "who this user became today" doc per user per day. Reads today's chats, journals, reflections, and pulses, feeds them to Groq, stores the summary in daily_memory_synthesis, and embeds it into user_memory_vectors so tomorrow morning's session can recall it. Invocation: POST {} with user auth → synthesizes for that user, today (or body.date) POST {} w_

- **Source:** `supabase/functions/synthesize-daily-memory/index.ts` (~257 lines)

#### `aggregate-daily-dimensions`

_aggregate-daily-dimensions Called at end of day (or after evening session) to roll up all consciousness_signals into a single daily_dimension_summary row. This captures: - Average thought/emotion/body/awareness scores from all signals that day - Signal count and confidence - Whether this was a calibration day If no signals exist for the day, the summary uses the current profile dimensions (no chan_

- **Source:** `supabase/functions/aggregate-daily-dimensions/index.ts` (~159 lines)

#### `extract-sacred-moments`

_Extract sacred moments from recent journal entries / sessions / signals. Auto-fills the Memory Vault with breakthroughs, tears, laughs, realizations._

- **Source:** `supabase/functions/extract-sacred-moments/index.ts` (~215 lines)

#### `compute-constellation`

_compute-constellation: derives a user's 12-practice spiritual fingerprint from existing assessments, practice_effectiveness, life_domain_scores, and loops. Always returns 12 weights summing to ~1.0, never zero (min 0.01)._

- **Source:** `supabase/functions/compute-constellation/index.ts` (~207 lines)

#### `recalibrate-constellation`

_recalibrate-constellation Cron-callable edge function. Recomputes a user's constellation by re-running the same logic as compute-constellation, but BLENDS new signal with the existing weights so the user's history is preserved (Law 2 — continuous calibration). Modes: • minor (weekly): blend = 0.85 * current + 0.15 * fresh • major (monthly): blend = 0.60 * current + 0.40 * fresh Can be invoked: • F_

- **Source:** `supabase/functions/recalibrate-constellation/index.ts` (~186 lines)

#### `compute-companion-state`

_Pillar 2 + 4: Companion Inner Life + Deepening Relationship Computes today's companion mood, evolving language register, trust phase, and surfaces an inside joke when relevant._

- **Source:** `supabase/functions/compute-companion-state/index.ts` (~259 lines)

#### `compute-kundli`

_Compute Vedic kundli (sidereal) from dob/time/place. Sun & Moon use Meeus low-precision; Mars/Mercury/Jupiter/Venus/Saturn use mean elements. Sufficient for sign placement, Nakshatra (Moon), Yoni/Gana/Nadi/Varna, Tithi, Karana, Yoga, Vimshottari Mahadasha, Lagna._

- **Source:** `supabase/functions/compute-kundli/index.ts` (~353 lines)

#### `integrate-human-map`

_Integrate Human Map: reads recent mirror answers + sessions, asks Groq to score dimensions, upserts human_map_dimensions, resets the integration counter._

- **Source:** `supabase/functions/integrate-human-map/index.ts` (~181 lines)

## L3 — Mainspring (single source of truth)

#### `user-state-snapshot`

_USER STATE SNAPSHOT — The Mainspring ------------------------------------------------------------ Single source of truth for "who is this user right now". Wraps the shared getUserContext() with per-user 60s caching. Every engine should call THIS instead of querying raw tables. Clients can also call it for diagnostics / "my state" views._

- **Source:** `supabase/functions/user-state-snapshot/index.ts` (~118 lines)

## L4 — Decision Engines (attention heads)

#### `consciousness-engine`

_═══════════════════════════════════════════ V-LEVEL BAND DEFINITIONS ═══════════════════════════════════════════_

- **Source:** `supabase/functions/consciousness-engine/index.ts` (~2039 lines)

#### `compose-session`

_COMPOSE-SESSION: Returns the full user-context snapshot + composer input. Thin wrapper around getUserContext() — the single source of truth._

- **Source:** `supabase/functions/compose-session/index.ts` (~69 lines)

#### `compose-session-v3`

_compose-session-v3 — SANKALPA ENGINE (T1 foundation) ------------------------------------------------------------ Parallel reader  →  3-LLM Council (fast)  →  Composer (main) →  Safety + write session_spine Honors user.identity.aiMode ('fast' Groq | 'premium' OpenAI 5.5) for EVERY AI call inside this function via aiGatewayFetch. Returns: { ok, sessionId?, plan: {id, intent, intro, steps[]}, spineI_

- **Source:** `supabase/functions/compose-session-v3/index.ts` (~678 lines)

#### `compose-today-practice`

_COMPOSE-TODAY-PRACTICE Builds today's practice mix using 30/50/20 formula + theme/arc awareness. Caches result in today_practice_packs (one per user per day)._

- **Source:** `supabase/functions/compose-today-practice/index.ts` (~467 lines)

#### `generate-session-agenda`

_generate-session-agenda Composes a multi-step session "plan" using AI personalization pulled from the user's real consciousness state. Returns: { sessionId, plan: { id, intent, intro, steps[] } } Side-effect: inserts a row into public.sessions type='generative', status='active', summary=JSON.stringify(plan)_

- **Source:** `supabase/functions/generate-session-agenda/index.ts` (~450 lines)

#### `generate-program-session`

_generate-program-session ───────────────────────────────────────────────────────────── Adaptive session-by-session generator for an active program. Philosophy: Programs are NOT pre-baked 30-day plans. Each session is composed JUST-IN-TIME by reading past completed sessions in the program + the user's current state, then asking the AI to design the next single session. INPUT  : { programId: uuid, s_

- **Source:** `supabase/functions/generate-program-session/index.ts` (~320 lines)

#### `generate-personal-program`

_AI PERSONALIZED PROGRAM GENERATOR Takes questionnaire results → generates custom 30-day program "30 Days to Fix Your [Pattern] — Developed by AI + [Guide Name]" /_

- **Source:** `supabase/functions/generate-personal-program/index.ts` (~171 lines)

#### `generate-personal-rhythm`

_Generates today's personal practice rhythm from kundli + lifestyle slots + Vedic windows. Mixes in-app cues (open Witness, breath) with off-app micro-practices (sip water, sun-gaze 30s, mantra, gratitude). Anchored to user's wake/lunch/sunset/sleep + planet of day._

- **Source:** `supabase/functions/generate-personal-rhythm/index.ts` (~285 lines)

#### `generate-daily-ritual`

_Generate Daily Ritual — Morning Whisper + Evening Witness + Sunday Stillness One sacred line per gate, tuned to the user's current state and journey._

- **Source:** `supabase/functions/generate-daily-ritual/index.ts` (~222 lines)

#### `generate-theme`

_═══════════════════════════════════════════ V-LEVEL BAND SYSTEM (8 Bands × 24 sub-levels) ═══════════════════════════════════════════_

- **Source:** `supabase/functions/generate-theme/index.ts` (~2276 lines)

#### `evolve-theme`

_evolve-theme — runs after each session to deepen, hold, or close today's theme. Reads session messages, asks AI to decide the next micro-shift, persists deepened Explore / Wisdom / Reasoning / Recommended Practice for the rest of the day. /_

- **Source:** `supabase/functions/evolve-theme/index.ts` (~271 lines)

#### `generate-wisdom`

_Generate a single rich wisdom paragraph drawn from a vast pool of traditions: Vedas, Upanishads, Puranas, Shastras, Bhagavad Gita, Yoga Sutras, Ramayana, Mahabharata, Buddhist suttas, Zen, Sufi, Tao, Stoicism, modern psychology, neuroscience, somatic science, contemplative observation, self-inquiry. Returns: { source, tradition, paragraph, study_seed } study_seed is the conversation opener passed _

- **Source:** `supabase/functions/generate-wisdom/index.ts` (~212 lines)

#### `generate-master-theme-teaching`

_Generates a Master's personalized voice on the user's daily theme. Cached per (user, theme_date, master_id) to bound costs._

- **Source:** `supabase/functions/generate-master-theme-teaching/index.ts` (~175 lines)

#### `generate-master-next-step`

_Generates a Master-flavored "next micro-step" after a session completes. Stores the result as a notification so it surfaces in the user's existing inbox._

- **Source:** `supabase/functions/generate-master-next-step/index.ts` (~156 lines)

#### `generate-journey-nudge`

_Get user from token_

- **Source:** `supabase/functions/generate-journey-nudge/index.ts` (~295 lines)

#### `generate-higher-self-letter`

_generate-higher-self-letter Once per week (Sunday morning), this composes a poetic, second-person letter from the user's future/higher self, woven from the past 7 days of engine_signals, loop activity, journal/chat memory snippets, and band shifts. Persists to public.higher_self_letters (UNIQUE per week_start). Modes: - cron (x-cron-secret) → process all recently-active users - user (JWT) → proces_

- **Source:** `supabase/functions/generate-higher-self-letter/index.ts` (~195 lines)

#### `for-you-practices`

_supabase/functions/for-you-practices/index.ts Generates a personalized daily list of micro-practices for the user based on their chosen practice domains + life goals. Cached per user per day in for_you_cache table (created on first run)._

- **Source:** `supabase/functions/for-you-practices/index.ts` (~141 lines)

#### `get-next-practice`

_/_

- **Source:** `supabase/functions/get-next-practice/index.ts` (~302 lines)

#### `suggest-next-program`

_suggest-next-program ---------------------------------------------------------------- The "Master-of-Masters" router for Home. Reads user state (sessions, loops, dimensions, foundation progress, engine_signals from Guide-chat) and returns ONE recommendation: kind = 'continue' | 'template' | 'composed' | 'single' - continue : resume an active personalized_program / foundation - template : start an _

- **Source:** `supabase/functions/suggest-next-program/index.ts` (~431 lines)

#### `next-session-preview`

_next-session-preview One API call → returns the next slot's theme, assigned guru, wisdom, reasoning ("why this for you now"), explore prompts, and a list of alternate yogis the user can switch to before starting the session._

- **Source:** `supabase/functions/next-session-preview/index.ts` (~350 lines)

#### `adapt-next-block`

_adapt-next-block ---------------------------------------------------------------- Mid-session adaptive injection. Called from the SessionOrchestrator when a user finishes block N before navigating to block N+1. Reads fresh engine_signals (last ~10min) plus the active plan and returns: { action: 'keep' }                         → no change, advance { action: 'replace', block: SessionBlock } → swap _

- **Source:** `supabase/functions/adapt-next-block/index.ts` (~198 lines)

#### `session-adapter`

_session-adapter ───────────────────────────────────────────────────────────── Runs ONCE on session entry. Takes the pre-made session (assigned master, mode, micro-practice from program template) and ADAPTS it to the user's current state at this exact moment: - swap master if state demands it (crisis → Rumi, identity Q → Ramana, etc.) - swap/keep mode based on signals - substitute micro-practice if_

- **Source:** `supabase/functions/session-adapter/index.ts` (~353 lines)

#### `curiosity-engine`

_/_

- **Source:** `supabase/functions/curiosity-engine/index.ts` (~332 lines)

#### `council-consensus`

_Council of Yogis — fan-out to N relevant masters, then synthesize consensus + dissents._

- **Source:** `supabase/functions/council-consensus/index.ts` (~101 lines)

#### `three-lens-analyzer`

- **Source:** `supabase/functions/three-lens-analyzer/index.ts` (~251 lines)

#### `companion-engine`

_COMPANION ENGINE — The "true AI companion" brain Runs for a user (triggered by app open or cron) and: 1. Proactive Initiation — detects patterns worth reaching out about 2. Emotional Memory — builds emotional timeline for callbacks 3. Cross-Pattern Insights — synthesizes journals + sessions + loops 4. "It Gets Me" moments — finds connections user hasn't seen 5. Contextual Awareness — time, streak,_

- **Source:** `supabase/functions/companion-engine/index.ts` (~358 lines)

#### `predictive-insights`

_═══════════════════════════════════════════ PREDICTIVE INSIGHTS — Trend + Prediction Engine ═══════════════════════════════════════════_

- **Source:** `supabase/functions/predictive-insights/index.ts` (~390 lines)

#### `predict-churn`

_Tier 4: Churn predictor — replays health scores into churn probability table._

- **Source:** `supabase/functions/predict-churn/index.ts` (~51 lines)

#### `recalibration-intelligence`

_recalibration-intelligence The "brain" that decides WHEN, WHAT MAGNITUDE, and WHY to recalibrate. Reads multi-source signals → computes drift score → picks decision → optionally invokes recalibrate-constellation, and always logs to recalibration_events for audit + UI surfacing. Modes: POST { user_id }              → decide for one user POST { all: true }            → decide for all active users (c_

- **Source:** `supabase/functions/recalibration-intelligence/index.ts` (~296 lines)

#### `activate-specialty`

_/_

- **Source:** `supabase/functions/activate-specialty/index.ts` (~171 lines)

#### `assess-starting-levels`

_/_

- **Source:** `supabase/functions/assess-starting-levels/index.ts` (~269 lines)

#### `analyze-assessment`

_analyze-assessment — generates AI deep analysis for a user_assessment_result and wires the result into engine signals (consciousness_signals + dimension_map_scores)._

- **Source:** `supabase/functions/analyze-assessment/index.ts` (~236 lines)

#### `assign-curriculum-arc`

_Master Curriculum Director Picks the right arc_template for a user based on DNA + lifetime phase + life stage + recent arc history, instantiates a theme_arcs row, and logs reasoning. Triggered: (a) lazily by generate-theme when no active arc exists (b) explicitly after onboarding completion (c) when an arc nears completion (current_day >= duration_days - 1) (d) by cron sweep for stalled users_

- **Source:** `supabase/functions/assign-curriculum-arc/index.ts` (~334 lines)

#### `always-open-prompts`

_ALWAYS-OPEN PROMPTS — v2 (30+ modes, journey-aware) Off-rhythm engine: when no session is being pushed, we still offer 3 contextual "doors". Now scores across 30+ modes using: - consciousness band + state + streak + journey_day - app relationship phase (newcomer / explorer / committed / deep / sage) - today's mood/energy + last evening reflection - active loops (severity + count) - recent regressi_

- **Source:** `supabase/functions/always-open-prompts/index.ts` (~814 lines)

#### `pre-event-nudge`

_pre-event-nudge Cron every 5 min. Reads next 30 min of calendar events from work_signals (signal_type='calendar_event'), cross-refs active loop_attributions, queues a 'pre_event' nudge ~10 min before each event. /_

- **Source:** `supabase/functions/pre-event-nudge/index.ts` (~87 lines)

#### `post-event-reflection`

_post-event-reflection Cron every 5 min. Finds calendar events that ended in the last 5–15 min, queues a 'post_event' reflection card seeded with context. /_

- **Source:** `supabase/functions/post-event-reflection/index.ts` (~63 lines)

## L5 — Conversation & Delivery

#### `guide-chat`

- **Source:** `supabase/functions/guide-chat/index.ts` (~1769 lines)

#### `guide-insight`

_guide-insight Returns a "curious mirror" insight for the user's last message in a Guide conversation: why they may be saying it, loops they're likely living, past echoes from their journey, and a possible next move. Additive — completely separate from guide-chat streaming. Client calls this after each assistant reply to render an optional "Why am I saying this?" card. /_

- **Source:** `supabase/functions/guide-insight/index.ts` (~184 lines)

#### `temple-chat`

_TEMPLE CHAT - Edge Function Handles streaming chat with Temple Guides + Witness Practice Uses ConsciousOS AI Gateway, detects loops, guides with wisdom Now with full user context for real guru-shishya interactions /_

- **Source:** `supabase/functions/temple-chat/index.ts` (~305 lines)

#### `elder-dialogue`

_elder-dialogue — generates the next turn (or final reading) for the 15–30 minute onboarding dialogue between user and Elder. Input: { name, history: Turn[], reading: PartialReading, action: 'next' | 'finalize' } Output (action='next'): { elderText, choices: [{id,label,signal}], arc: 1-6, arcName, arcProgress: 0-1, done: boolean } Output (action='finalize'): { bands, archetype, headHeartGut, topLoo_

- **Source:** `supabase/functions/elder-dialogue/index.ts` (~529 lines)

#### `discovery-session`

- **Source:** `supabase/functions/discovery-session/index.ts` (~262 lines)

#### `mirror-session`

_Mirror Session — free AI loop diagnostic. Takes 5-8 Q&A pairs from a stranger and returns 3 detected mental loops plus a one-paragraph mirror insight + archetype._

- **Source:** `supabase/functions/mirror-session/index.ts` (~77 lines)

#### `pre-journey-chat`

_PRE-JOURNEY CHAT — Adaptive conversational delivery for the 60 Foundation sessions. Replaces one-way "read teaching → micro-practice → reflection" with a back-and-forth dialogue. The guru holds the session's teaching as private context, opens with a hook, asks, listens, deepens, and closes with a reflection question. When the guru judges the session is complete, it emits the literal token  [SESSIO_

- **Source:** `supabase/functions/pre-journey-chat/index.ts` (~141 lines)

#### `journal-reflect`

_─── Auth + Credit Gate ───_

- **Source:** `supabase/functions/journal-reflect/index.ts` (~140 lines)

#### `guru-practice-session`

- **Source:** `supabase/functions/guru-practice-session/index.ts` (~168 lines)

#### `master-journey-review`

_MASTER JOURNEY REVIEW - Edge Function Master reviews user's journey and generates personalized wisdom, practice, and growth observation /_

- **Source:** `supabase/functions/master-journey-review/index.ts` (~213 lines)

#### `graduation-deep-analysis`

_Graduation Deep Analysis — fuses 32 mirrors + 60 sessions + journals + loops + memory + consciousness profile into ONE deep "Who You Are" report via ConsciousOS AI (Gemini 2.5 Pro). Caches in `graduation_reports` (one row per user). Idempotent — returns cached if exists unless ?force=1._

- **Source:** `supabase/functions/graduation-deep-analysis/index.ts` (~469 lines)

#### `decode-dream`

_/_

- **Source:** `supabase/functions/decode-dream/index.ts` (~122 lines)

#### `tts-speak`

_Unified TTS: Deepgram Aura-2 (primary) -> ElevenLabs (fallback) -> client browser fallback Returns raw audio/mpeg bytes. If both providers fail, returns 502 with { fallback: 'browser' } so the client can speak via SpeechSynthesis without breaking the meditative flow._

- **Source:** `supabase/functions/tts-speak/index.ts` (~133 lines)

## L6 — Feedback Loop (the moat)

#### `session-complete`

_session-complete Closes a generative session row, fires downstream signals, computes V-level delta + AI shift summary + next-session teaser, and returns a rich payload for the SessionCompleteScreen._

- **Source:** `supabase/functions/session-complete/index.ts` (~341 lines)

#### `score-session-spine`

_score-session-spine — SANKALPA T5 ------------------------------------------------------------ Input:  { spineId, finalUserSentence?, stepCompletions?: Array<{index, completed, timeSpentSec?, rating?}>, durationSec?, mood? } Action: LLM scores quality 0..1 from signals + user sentence; writes session_spine.quality_score + final_user_sentence. Feeds the adaptive composer (which reads archetype qual_

- **Source:** `supabase/functions/score-session-spine/index.ts` (~160 lines)

#### `verify-breakthrough`

_Sacred Karma — server-side breakthrough verifier. Reads user text + context, asks ConsciousOS AI to judge whether a *real* consciousness shift occurred, and (only if YES) awards karma via the strict award_karma RPC. Caps and cooldowns are enforced by the RPC. This replaces the old client-side keyword scanner._

- **Source:** `supabase/functions/verify-breakthrough/index.ts` (~225 lines)

## L7 — Org / Enterprise

#### `enterprise-insights`

_Build a compact data summary for the AI_

- **Source:** `supabase/functions/enterprise-insights/index.ts` (~180 lines)

#### `enterprise-people-intelligence`

_Verify caller is admin/manager of this org_

- **Source:** `supabase/functions/enterprise-people-intelligence/index.ts` (~197 lines)

#### `manager-coaching`

- **Source:** `supabase/functions/manager-coaching/index.ts` (~115 lines)

#### `org-program-designer`

- **Source:** `supabase/functions/org-program-designer/index.ts` (~92 lines)

#### `org-weekly-briefing`

_Generate a weekly AI briefing for an org/team using Groq. Privacy: only operates on aggregated data (n>=5). Never includes individual data._

- **Source:** `supabase/functions/org-weekly-briefing/index.ts` (~132 lines)

#### `seed-demo-org`

_Seeds a fully populated demo organization for sales demos. Creates: org + 5 teams + 50 employees + 30 days of mood pulses + 2 challenges. The current user becomes admin of the demo org._

- **Source:** `supabase/functions/seed-demo-org/index.ts` (~134 lines)

## L8 — Admin / Ops

#### `admin-ai-insights`

_Fetch user data with service role_

- **Source:** `supabase/functions/admin-ai-insights/index.ts` (~108 lines)

#### `admin-broadcast`

_Resolve segment to user_ids_

- **Source:** `supabase/functions/admin-broadcast/index.ts` (~66 lines)

#### `admin-copilot`

_Verify admin_

- **Source:** `supabase/functions/admin-copilot/index.ts` (~121 lines)

#### `complete-task`

_Verify auth_

- **Source:** `supabase/functions/complete-task/index.ts` (~213 lines)

#### `translate-ui`

_translate-ui: Batch-translate an array of English UI strings into a target language using Groq. Returns translations in the same order/length so the client can swap them in place._

- **Source:** `supabase/functions/translate-ui/index.ts` (~96 lines)

#### `razorpay-order`

_─── Auth ───_

- **Source:** `supabase/functions/razorpay-order/index.ts` (~167 lines)

#### `razorpay-verify`

_HMAC-SHA256 signature verification (Razorpay standard) /_

- **Source:** `supabase/functions/razorpay-verify/index.ts` (~273 lines)

---

# Part V — The Domain Models (the IP)

This is the part competitors can't speedrun. The engines are *implementations*; these models are the *substrate*. They took years of synthesis between yogic tradition and computational psychology.

## V.1 — The 650-ID Loop Library

A typed grammar of human psychological/behavioral patterns. Every loop has:

- A 6-character ID (e.g. `VAL001`, `RES003`, `EMO012`).
- A family (Values, Restlessness, Emotion, Burnout, Biology, Recovery, Work, Identity, Relational, Existential, ...).
- A human-readable name (`getLoopName(id)` everywhere in UI).
- A severity band and a recommended intervention class.
- Detection rules — deterministic where possible, LLM-assisted where not.

Loop families (illustrative IDs):

| Family | Domain | Example |
|---|---|---|
| `VAL` | Value-Action Conflicts | Said-vs-did gaps. `VAL001` = stated value contradicted within 72h. |
| `RES` | Restlessness / Sympathetic Drive | `RES003` = sympathetic restlessness, ≥20 phone pickups/h. |
| `EMO` | Emotion Suppression / Spike | `EMO012` = suppression then 'I'm fine' bypass. |
| `BUR` | Burnout Trajectory | `BUR001` = composite burnout vector >0.75. |
| `BIO` | Biological Stress | `BIO005` = chronic low HRV across rolling 7d. |
| `REC` | Recovery / Sleep | `REC001` = sleep score <60. `REC002` = late-night work signals. |
| `WRK` | Work / Overload | `WRK001` = workload >0.7 sustained. |
| `IDN` | Identity Confusion | self-concept vs revealed-behavior contradictions. |
| `REL` | Relational Patterns | trigger loops with specific named contacts. |
| `EXI` | Existential Drift | purpose gaps, meaning collapse, dark night. |
| `SPI` | Spiritual Bypass | premature transcendence patterns. |
| `ATT` | Attachment / Aversion | classic yogic kleshas, instrumented. |

Loops are stored in `src/data/handbook/loopFamilies.ts` and attributions in `loop_attributions`. The CRITICAL rule (project memory): code MUST use exact IDs and resolve to human-readable names via `getLoopName` — no placeholder strings, no LLM-invented IDs. This is how we keep the grammar typed.

## V.2 — The 11-Band Spiral Journey

Consciousness is not linear. We model it as 11 bands (0..10), each with micro-levels, 6 dimensions of progress, and 3 speed profiles. Bands describe *what the user can perceive and metabolize*, not how 'good' they are.

| Band | Name | Capacity |
|---|---|---|
| 0 | Survival | Crisis stabilization, basic safety. Witness 1-2 min only. |
| 1 | Routine | Anchor habits, sleep, breath baseline. |
| 2 | Awareness | First observation of loops. Naming what was invisible. |
| 3 | Inquiry | Self-inquiry threads, journaling depth. |
| 4 | Practice | Daily formal practice locked. Programs make sense. |
| 5 | Discrimination | Viveka — distinguishing self from thought. |
| 6 | Integration | Cross-pollination across dimensions becomes visible. |
| 7 | Stability | Equanimity under provocation, sustained. |
| 8 | Transmission | User can teach. Inside-jokes with masters mature. |
| 9 | Embodiment | Practice becomes background field, not foreground task. |
| 10 | Service | Identity reorients to contribution. Elder mode unlocks. |

Bands gate which **practice level** of which **practice** the user is offered. A Band-2 user offered Band-8 practice will quit. A Band-8 user offered Band-2 practice will quit. The matching is the engine's job.

Speed profiles: **Fast / Steady / Deep**. Detected from `speed_profile_history` by quality-score velocity. The same user can be Fast on Pranayama and Deep on Self-Inquiry — speed is per-practice.

Regression: a sustained quality drop or a life-event spike drops the user one band on the affected dimension, with restoration credits so it never feels punitive. See `regression_events` and `recalibration-intelligence`.

## V.3 — The 12 Dimensions (and the 100-sub map)

The 12 primary dimensions tracked in every snapshot:

- **Body / Soma**
- **Breath / Prana**
- **Mind / Manas**
- **Emotion / Chitta**
- **Intellect / Buddhi**
- **Identity / Ahamkara**
- **Relational / Sangha**
- **Work / Karma**
- **Ethics / Yama-Niyama**
- **Energy / Kundalini**
- **Devotion / Bhakti**
- **Witness / Sakshi**

Each primary dimension expands into ~8 sub-dimensions, totaling the **100-Dimension Human Map** (`src/lib/consciousness/taxonomy/dimensions100.ts`, table `human_map_dimensions`). The Mirror analytics surface visualizes movement across all 100, but the engines decide primarily on the 12 to keep latency low.

## V.4 — The 3-Layer Practice Matrix (Core / Path / Specialty)

Every practice in the library belongs to exactly one of three layers, and has 5-7 levels. The composition formula is **30/50/20**: 30% Core, 50% Path, 20% Specialty in any week.

- **Core (30%)** — universal practices that every human benefits from regardless of path: Witness, Breath, Body scan, Journal, Sleep anchor.
- **Path (50%)** — practices specific to the user's chosen tradition: Jnana (inquiry), Bhakti (devotion), Karma (action), Raja (8-limb), Tantra (energetics), Vipassana, Zen, etc.
- **Specialty (20%)** — situational and earned practices: dream yoga, kriya, mantra, council of yogis, deep-rest protocols.

Practice levels are quality-gated, not time-gated. You don't level up because 14 days passed; you level up because your last 3 reps scored ≥0.75 AND a verified breakthrough fired AND the relevant dimension band moved. See `get-next-practice`, `evaluate-practice-level`, `user_practice_levels`, `user_practice_constellation`.

**Cross-pollination** is first-class. If Witness gains light up in HRV, the system can plateau-break Pranayama by deepening Witness instead of grinding more Pranayama. The mapping is learned per-user and stored in `cross_pollination_log` → consumed by `compose-session-v3`.

## V.5 — The 4 Daily Gates

The day is structured as 4 gates the user can pass through, mapped to 6 time-slot patterns (Morning Only, All 4, Morning+Evening, Night Only, Irregular, Weekday/Weekend). The system never guilts a missed gate; it adapts.

1. **Arrival** — first contact of the day. Sets intention (Sankalpa).
2. **Practice** — the main formal session.
3. **Integration** — micro-practices through the working day.
4. **Closing** — evening reflection / Yoga-Nidra-style closing.

Each gate has its own UI atmosphere (`SlotAtmosphere`, `SlotHeroCard`, `SlotSignature`) driven by per-slot design tokens in `src/lib/slotDesign.ts`. See `dailyGates.ts`, `user_daily_gates`, `daily-flow-4gates` memory.

## V.6 — The Conscious Games (faculty training)

Games are not gamification. Games are *faculty calibrators* — short, embodied exercises that measure and train a specific cognitive/somatic faculty using the device's sensors. Output of every game is a signal row, not a score.

- **Shell:** `src/games/shell/ConsciousGameShell.tsx`, with hooks `useBreathMic`, `useFaceCam`, `useMicLevel`, `useHaptics`, `useTranscribe`, `useGuruVoice`.
- **Permissions:** `PermissionsGate` — no game runs without explicit per-sensor consent.
- **Telemetry:** `logGameSession` writes a row consumed by `reflect-game`, which produces a `consciousness_signals` row and may trigger `live-detect`.
- **Faculties covered:** breath coherence, attentional dwell, somatic interoception, vocal prosody, reaction inhibition, equanimity-under-distraction (sound-reactive Witness training).
## V.7 — The 10-Phase Lifetime Spiral

A 10,000-day arc. The app is not a 30-day product. The Lifetime Spiral (`src/lib/consciousness/lifetimeSpiral.ts`, `app_relationship_depth`) models the *relationship between user and app* across 7 depth phases, and the user's life-stage adaptation (student → professional → parent → elder) across 10 spiritual phases. Guru rotation, curiosity engine, fractal integration, predictive engine, and the 100-dimension map all draw from this layer to ensure day-1 simplicity and day-3000 depth from the same codebase.

## V.8 — The 118 Masters

11 thematic categories. Each master is a typed persona file (voice, language, lineage, safety rails, signature practices) — not a prompt. Used by `temple-chat`, `master-journey-review`, `guru-practice-session`, `council-consensus`, `generate-master-theme-teaching`, `generate-master-next-step`. Stored in `guru_memory`, `guru_rotations`, `guru_shishya_relationships`.

## V.9 — The 80+ Structured Programs

Programs are *templated arcs* (`src/data/programs/v2/engine.ts`). Each template knows: how many phases, which practice type to bias, how to interpret quality, how to estimate sessions-remaining. The Adaptive Program Surface (`suggest-next-program`) picks or composes programs from the matrix of *masters × modes × practices* using `engine_signals` and `personalized_programs`. The user never browses a library; the right program meets them.

## V.10 — Karma + Credits (the economy)

Two ledgers, kept separate by design.

- **Credits** (Razorpay-backed, real money) gate AI compute. Pre-checked via `ensureCreditsForSession()` before any session is composed; atomic deduction on completion.
- **Karma** (`karma_events`, `user_karma`) is the internal currency of verified depth. Karma is earned via `verify-breakthrough`, sustained quality, integration events, and contribution. Karma unlocks specialty practices and certain master access; it cannot be bought.
## V.11 — Privacy Floor

Every public table has RLS. Every aggregation crossing user boundaries goes through SECURITY DEFINER functions with n≥5 floors. Voice + biometric raw data are time-decayed; only derived signals persist. Wearable tokens are encrypted at rest. Enterprise managers see only aggregates, never individuals.

---

# Part VI — Ten Falsifiable Moat Claims

Each claim below is testable. A competitor either has it or does not.

### 1. State, not prompt

We maintain a single canonical `user-state-snapshot` per (user × runtime). Every decision engine is stateless against it. No GPT wrapper has this; they re-derive state on every request from chat history.

### 2. Typed loop grammar

650 typed loop IDs with detectors. A prompt cannot reliably emit `RES003 @ 0.82` on its 7th occurrence this week. We can.

### 3. Multi-channel fusion

12 ingest channels normalized into one stress/focus/burnout vector every 5 minutes. A chatbot has one channel: text.

### 4. Daily memory consolidation

Sleep-analog: nightly summarization writes a `daily_memory_synthesis` row that becomes the next day's context. Chatbots have transcript; we have *memory*.

### 5. Quality-scored closed loop

Every session is scored 0-1, breakthroughs are verified, and the score writes back into V-level, regression, cross-pollination. The system learns the *specific human*, not the population.

### 6. Engine plurality

103 specialist engines, including a Council Consensus (Mixture-of-Experts for high-stakes replies). A prompt-app has one engine: the prompt.

### 7. Lifetime adaptation

10-phase spiral × 7 relationship-depth phases × life-stage detection. The app is a different product on day 1 and day 3000.

### 8. Cross-pollination causal map

When practice A in tradition X moves dimension Y, we record the edge and use it to plateau-break. No one else tracks this.

### 9. Privacy floor as architecture

n≥5 SECURITY DEFINER aggregators are *non-negotiable* for the enterprise surface. This is a structural feature, not a policy.

### 10. The loop is the moat

Even if every engine were replaced with the same model a competitor uses, our outputs would still differ — because our outputs are functions of a state they cannot reconstruct.

---

# Part VII — The Meeting Script

Use these lines verbatim if helpful.

> **"We are not a prompt over an LLM. We are a closed-loop inference pipeline over a longitudinal human state. The LLM is one of our layers."**

> **"Think of a transformer. We have all of it. Tokens are signals from 12 channels. Embeddings are 650 typed loop IDs. The residual stream is `user-state-snapshot`. Attention heads are 103 specialist edge functions. The output head is a session plan, a master reply, a nudge. And the training loop — the part everyone forgets — is `score-session-spine` writing back into the state every time the user finishes a session."**

> **"A competitor can copy our UI in a weekend. They can copy our prompts in an hour. They cannot copy a 90-day longitudinal state of a specific human. That state is the product."**

> **"Show me a GPT wrapper that can tell me: you hit RES003 at 2pm because your last 4 Slack messages went tone-load 0.78 right after a no-sleep night; your Witness practice has plateaued at L3 for 9 days; cross-pollination data says deepening your breath ratio will unblock it; here is a 7-minute session, here is why each step is there, and here is the score we will measure it against. That is one snapshot read and four engines deep. That is us."**
---

# Appendix A — Database Tables (high-signal subset)

The full schema has ~150 tables. The ones below are the load-bearing ones for the pipeline narrative above:

```
user-state-snapshot inputs:
  profiles, user_kundli, user_spiritual_dna, user_consciousness_profile,
  user_practice_constellation, user_practice_levels, user_speed_profile,
  user_life_stage, app_relationship_depth, user_karma, user_credits.

Signal ingest:
  bio_signals, work_signals, device_signals, mood_pulses,
  practice_voice_recordings, dream_entries, consciousness_signals,
  signal_consents, wearable_tokens.

Detection / fusion / memory:
  loop_attributions, fused_signals, anomalies,
  user_memory_vectors, daily_memory_synthesis, sacred_moments,
  pattern-window outputs in engine_signals, daily_dimension_summary,
  three_brain_inferences, cross_pollination_log.

Decision / plan:
  daily_engine_plans, daily_themes, theme_arcs, theme_evolution_log,
  daily_sankalpa, today_practice_packs, personalized_programs,
  session_program_enrollments, session_program_progress, nudge_queue,
  curiosity_queue, predictive_signals, churn_predictions.

Delivery:
  sessions, daily_sessions, session_messages, session_spine,
  session_ingredients, session_adaptations, evening_reflections,
  guide_chat history (consciousness_signals), temple_ai_conversations,
  guru_memory, guru_shishya_relationships, master_theme_teachings.

Feedback:
  karma_events, user_karma, karma_verification_log,
  regression_events, recalibration_events, graduation_reports,
  practice_effectiveness, journey_harvest.

Org / privacy:
  organizations, org_members, org_consciousness_snapshots,
  org_weekly_briefings, enterprise_notifications.
```
---

# Appendix B — Frontend Architecture (one paragraph)

React 18 + Vite + Tailwind + shadcn. State is split: **XState** for client-only flows (cinematic session shell, machines in `src/machines/`), **TanStack Query** for everything server-derived. The `useFusedSignals`, `useAuthReady`, `useSignalConsents` hooks are the thin client-side view into the L2/L3 layers. The Temple is borderless and immersive; utility areas are clean and `max-w-2xl`. Floating 🪔 button is the only exit from sub-routes. Dark-first 'Satyayuga UX'.

---

# Appendix C — Why this cannot be built in 6 months by a well-funded clone

Three reasons.

1. **The loop library.** 650 typed IDs, each with a detector. This is the artifact of years of synthesis between yogic tradition and behavioral instrumentation. A clone can fake 50 in a weekend; they cannot fake 650.
2. **The closed feedback loop.** Even with infinite engineers, you cannot fast-forward 90 days of longitudinal state for a real human. The product literally has to age with the user.
3. **The architectural discipline.** `user-state-snapshot` as residual stream is a one-line idea that took us 18 months to enforce across 103 engines. Most teams reach for raw queries. We don't, and we will not.

— end —
