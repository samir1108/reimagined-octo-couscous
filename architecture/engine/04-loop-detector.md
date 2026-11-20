# §4. Loop Detector: local-first, AI-fallback, cron-cadence pattern surfacing

The loop/pattern-detection stack has three distinct cadences layered on top of one shared
"loop library" concept (a 400+ entry catalog of named behavioral/cognitive/emotional loops
identified by short codes like `VAL001`, `MEN012`, `REL014`): (1) **instant, client-local**
keyword matching during live chat, (2) **near-real-time server AI** as a fallback/confirmer,
and (3) **scheduled cron windows** (15-min "instant pulse" and 30-min "pattern window")
that mine cross-source behavioral/biometric signal tables for slower-forming patterns.

### 4.1 The loop library itself

`src/lib/localLoopDetector.ts` (386 lines) hard-codes a `LOOP_ENTRIES: LoopEntry[]` array
(`localLoopDetector.ts:21-`) where each entry has an `id` (e.g. `VAL001`), a `name`
(e.g. "People-Pleasing"), a `keywords[]` list (single words/short phrases, lower
confidence), and a `phrases[]` list (longer distinctive phrases, higher confidence). It
spans ~20 categories by id prefix: `VAL` (validation/worth), `CTL` (control/worry), `AVD`
(avoidance), `SRV` (survival: fight/flight/freeze), `BOD` (body/somatic), `ENR` (energy/
burnout), `EMO` (emotional), `MEN` (mental/cognitive), `BHV` (behavioral), `HAB` (habits),
`SOC` (social), `REL` (relationship), `IDN` (identity), `EGO`, `BLF` (core beliefs), `PUR`
(purpose), `SPR` (spiritual bypassing/awakening addiction), `PRD` (productivity), `COG`
(cognitive bias), `MOT` (motivation) — roughly 100+ distinct patterns visible in the file
(the docstring claims 400+; the loaded excerpt shows the curated subset actually wired into
keyword scoring). A parallel, user-facing subset lives in
`src/lib/loopLibraryCatalog.ts` (`LOOP_CATALOG`, `LOOP_CATEGORIES` — 20 categories with
emoji + one-line blurbs, `loopLibraryCatalog.ts:20-41`), used to power the Mirror app's
"Loop Mapping" self-selection questionnaire rather than automated detection — each entry
there has a short plain-English `hint` instead of keyword lists. The server-side mirror of
the library is `supabase/functions/_shared/loop-library.ts` (`LOOP_REFERENCE`, injected into
the `live-detect` system prompt so the AI is constrained to real ids) and
`supabase/functions/_shared/loopMap.ts` (`LOOP_NAMES`, a plain id→display-name lookup used
by the cron detectors).

### 4.2 Local detection — `detectLocally()` (zero cost, instant)

`detectLocally()` (`localLoopDetector.ts:319-386`) takes the last 5 user messages, joins
them into one text blob, and for every `LoopEntry` calls `scoreLoop()` (not shown in the
excerpt but referenced) to get a `confidence` + `evidence` snippet — presumably weighting
phrase matches higher than bare keyword matches. Loops below `confidence >= 0.3` are
dropped (`:346`), the rest sorted descending and capped to the top 3. In parallel,
`SOURCE_ENTRIES` are scored for 7 "speaking sources" (`mind`, `heart`, `gut`, `body`,
`identity`, `fear`, `witness`) at a lower `strength >= 0.15` threshold, also capped to 3,
each carrying a canned `SOURCE_INSIGHTS[type]` line (`:297-305`, e.g. "Your analytical mind
is leading... some truths require feeling, not thinking"). An `overall_insight` sentence is
synthesized only when both a top loop and top source exist (`:373-378`, e.g. "A
People-Pleasing pattern appears to be active, primarily expressed through your heart.").

**Ambiguity gating** (`:364-370`) decides whether to escalate to AI: ambiguous if (a) the
combined text is >100 chars but *no* loop matched at all, or (b) the top loop matched but
weakly (`0 < confidence < 0.4`). This is the local/server handoff contract — local detection
runs unconditionally and for free; AI is only called when local is inconclusive.

### 4.3 Client orchestration — `useLiveDetection()` hook + cadence

`src/hooks/useLiveDetection.ts` owns the actual trigger cadence inside a chat session.
`trackMessage()` (`useLiveDetection.ts:128-143`) increments a `userMessageCountRef` on every
user message and fires `runDetection()` **every 3rd user message** — the `>=3 &&
current-last>=3` check debounces so it never re-fires on messages 4 or 5, only again at
message 6, 9, etc. `runDetection()` (`:93-126`) always runs `detectLocally()` synchronously
first (`Step 1`, `:102-113`) and pushes any hits straight into `detections` state at ₹0
cost; only if `localResult.isAmbiguous` **and** the AI fallback hasn't already fired 3 times
this session (`aiFallbackCountRef.current < 3`, `:116-120`) does it call `runAIDetection()`,
which POSTs the full message history to the `live-detect` edge function
(`:61-90`) and appends its result to the same `detections` array when it resolves. This caps
AI-detection cost per session at 3 calls regardless of conversation length. `resetDetections()`
(`:145-150`) clears all counters when a chat/session restarts.

### 4.4 `live-detect` edge function — the AI fallback + signal absorption

`live-detect` (`supabase/functions/live-detect/index.ts`) does a credit pre-check (25 paise
minimum balance, `:40-48`), then sends the last conversation messages plus the full
`LOOP_REFERENCE` id catalog to `tier:fast` with a JSON-only response contract
(loops with confidence≥0.6, max 3; sources sorted by strength, max 3; one `overall_insight`,
`:57-89`). The interesting part is what happens *after* the AI responds
(`:127-232`, explicitly commented "PHASE 4"): every detected loop above 0.6 confidence is
turned into **two** `engine_signals` rows — one `active_loop` signal and one
`loop_detected` signal (the latter exists specifically so `ConsciousnessBusListener` can
fire a toast + haptic client-side, `:159-167`). A 6-hour dedupe window
(`loop_attributions` lookback, `:137-143`) prevents the same loop from re-persisting/
re-notifying repeatedly; loops seen within that window still get an `engine_signals` row
(so the adaptive engine still reacts) but skip the `loop_attributions` insert and the
push-style `notifications` row. Confidence≥0.7 loops additionally queue a `notifications`
row ("A loop surfaced: X"). The top detected *source* (mind/heart/gut/etc.) at strength≥0.7
is separately mapped to a `needs_practice`/`needs_inquiry`/`breakthrough` engine signal with
a specific `practice_id` (`fear`→breath, `heart`→emotional-healing, `mind`→self-inquiry,
`gut`→body, `identity`→jnana, `witness`→breakthrough, `:206-224`) — this is the bridge from
loop/source detection into the adaptive practice-recommendation engine described in §3.
Credits are deducted at a flat 10 paise for this lightweight analysis call.

### 4.5 UI surfacing — `LiveDetectionChips.tsx`

Detection results render as small pill/chip buttons under the chat, one per loop
(destructive-tinted, `RefreshCw` icon, name + confidence%) and one per source (primary-
tinted, source emoji, label + strength%), plus an "Insight" chip if `overall_insight` was
generated (`LiveDetectionChips.tsx:20-80`). Tapping a chip opens a bottom `Sheet` with a
detail view: for loops, a confidence progress bar, the quoted `evidence`, a `why` explanation,
and a fixed "What to notice" nudge encouraging non-identified observation (`:165-201`); for
sources, a strength bar, evidence quote, `insight` text, and a source-specific Socratic
inquiry question hard-coded per source type (`:204-244`, e.g. gut → "What is your body's
wisdom telling you beneath the impulse?"). If no specific chip is selected, the sheet shows
the aggregate `overall_insight` plus lists of all detected loops/sources as tappable rows
(`:113-156`).

### 4.6 Cron-cadence cross-source detectors (separate from chat-time detection)

Four edge functions run on schedules independent of any chat session, mining `work_signals`
(tone/channel signals from Slack/Gmail/GitHub/etc. watchers), `bio_signals` (wearables:
HRV, sleep), and `device_signals`:

- **`instant-pulse-detector`** — designed to run every ~15 min (or be called directly after
  `ingest-signal`/`signal-fusion`) per user, scanning only the trailing 15-minute window
  (`instant-pulse-detector/index.ts:28`). Two hard-coded acute triggers: **3+ "charged"-tone
  messages** in 15 min → a `nudge_queue` row suggesting a 60s Witness practice
  (`:48-64`), and **HRV < 25** → a 90s box-breath nudge (`:66-82`). Nudges are `kind: "instant"`,
  priority 70–75, deduped via a `dedupe_key` bucketed to the current 30-min or 60-min
  window and auto-expire in 30–60 min.
- **`pattern-window-detector`** — a 30-minute cron that reads both a 3-hour and a 7-day
  lookback (`pattern-window-detector/index.ts:32-46`) and applies a fixed "integration→loop"
  ruleset: **3h window** — if ≥5 toned work-signals and >40% are "charged", attribute
  `VAL003` (validation-seeking) with confidence scaled by the charged ratio (`:58-74`).
  **7d window** — ≥3 late-night-commit events + avg HRV <35 → `REC002` (recovery-debt
  pattern, `:76-92`); ≥3 short-sleep nights → `REC003` (`:94-107`); ≥30 meetings/week →
  `EGO005` ("performative pattern", `:109-121`); sustained avg HRV <30 across 5+ readings →
  `REC001` (`:123-134`). All attributions are deduped per `(user, loop, window)` keeping the
  highest confidence (`:138-144`), written to `loop_attributions`, and the single highest-
  confidence loop per user is queued as a `kind: "pattern"` nudge with a 12-hour expiry
  (`:149-174`).
- **`detect-anomalies`** — admin-only (requires the `admin` role, `detect-anomalies/
  index.ts:23-25`), a platform-health heuristic (not user-facing loop detection): flags a
  signup-rate drop (today <40% of trailing-7-day average, needing avg>2) and an AI cost
  spike (today's spend >2× the trailing-7-day daily average, needing prevAvg>100 paise),
  deduped by kind+unacknowledged within 7 days.
- **`detect-bypassing`** — implements the "3 Golden Rules" gate check
  (`detect-bypassing/index.ts:7-16`): Foundation First (core practices must reach L2 before
  path practices advance), Heart > Head (emotion dimension can't lag thought by 2+ bands),
  Integration Lock (Kriya locked until Body & Emotion ≥ Band 2), plus the generic
  skill>state-by-2+ grounding-practice rule reused from `vLevelCalculator.checkBypassingRisk`.
- **`detect-contradictions`** — compares a user's latest 5 utterances against "stated
  positions" ≥7 days old using pgvector similarity search plus a fast LLM judgment call
  (`detect-contradictions/index.ts:1-60`), inserting a `contradiction`-typed `engine_signal`
  on a genuine contradiction so the Consciousness Bus can surface it gently — explicitly
  idempotent and safe for both ad-hoc and nightly-cron invocation.
- **`detect-cross-pollination`** — the server twin of the client `getCrossPollinationSuggestion`
  logic: a fixed `CROSS_MAP` (`detect-cross-pollination/index.ts:15-24`) routes plateaued
  practices to a complementary one (observation→bhakti, self_inquiry→body, bhakti→jnana,
  karma→witnessing, breath→self_inquiry, witnessing→karma, jnana→bhakti, body→breath,
  raja→observation), each with a human-readable `reason` string, and tracks per-user
  effectiveness of the suggestion over time.
- **`detect-silence`** (not read in depth but present in the roster) rounds out the
  detector family, presumably flagging prolonged practice/session inactivity.


---
