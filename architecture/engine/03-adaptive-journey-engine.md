# §3. Adaptive Journey Engine

The "engine" that decides what a user does next is not one module but a layered stack: a
pure-client heuristic engine (`adaptiveJourneyEngine.ts`), a much larger typed
"consciousness" library (`src/lib/consciousness/*`, ~19 files re-exported through
`src/lib/consciousness/index.ts`), and a set of Deno edge functions that do the
authoritative, DB-backed computation (`consciousness-engine`, `adapt-next-block`,
`evaluate-practice-level`, `assess-starting-levels`, `session-adapter`,
`recalibration-intelligence`, `recalibrate-constellation`). They overlap in
responsibility — several appear to be different generations of the same idea (client
heuristic → typed lib → server RPC) — and a full trace of which one is live in the
current UI would require following call sites, but each is independently coherent and
worth documenting on its own terms.

### 3.1 `src/lib/adaptiveJourneyEngine.ts` — the 100-day journey heuristic

This is a pure, side-effect-free TS module (`adaptiveJourneyEngine.ts:1-324`) built around a
`UserProfile` (`adaptiveJourneyEngine.ts:17-33`) carrying `currentDay`, `missedDays`,
`avgPracticeMinutes`, `avgRating`, `engagementLevel`, `preferredTime`, `streakDays`,
`lastJournalSentiment`, and `recentReflections`.

- **Sentiment** (`analyzeSentiment`, `adaptiveJourneyEngine.ts:48-69`) is a simple bag-of-words
  scorer (English + a few Hinglish tokens like "nhi ho", "dar", "gussa") that nets
  negative/positive word hits into `negative | neutral | positive`.
- **Struggling / thriving classifiers** (`isStruggling`/`isThriving`,
  `adaptiveJourneyEngine.ts:74-94`): struggling = negative last-journal sentiment OR
  `missedDays > 3` OR `avgRating < 2.5` OR `engagementLevel === "low"` OR
  `streakDays === 0`. Thriving = positive sentiment AND `avgRating >= 4` AND
  `engagementLevel === "high"` AND `streakDays >= 7`.
- **Day-type selection** (`getAdaptiveDayType`, `adaptiveJourneyEngine.ts:99-118`): struggling
  users get `reflection` (if `missedDays > 5`) or `regular` — testing days are skipped
  entirely for them. Thriving users can get `testing` days every 25th day. Otherwise fixed
  rhythm: every 10th day is `silence`, every 20th is `reflection`, else `regular`.
- **Teaching generation** (`generateTeaching`, `adaptiveJourneyEngine.ts:123-174`) branches on
  the struggling/thriving state first (with hand-written empathetic copy for "away a
  while", "negative journal", "low ratings", "thriving — go deeper"), then falls back to a
  20-day rotating theme table (`themes[((day-1)%20)+1]`, e.g. Beginnings→Breath→Body→...→
  Reflection) combined with a `timeGreeting` keyed on `preferredTime` and an optional
  reference to the user's most recent stated `struggle`.
- **Practice generation** (`generatePractice`, `adaptiveJourneyEngine.ts:179-204`): silence/
  testing/reflection day types get fixed instructions; struggling users get a 15-minute
  "just sit, no technique" instruction; `streakDays >= 21` extends by 5 minutes; otherwise a
  default breath-observation instruction.
- **Duration** (`generateAdaptiveDay`, `adaptiveJourneyEngine.ts:234-258`): 15 min if
  struggling & `missedDays > 3`, 35 min if thriving, 30 min if `streakDays >= 21`, else 30
  min default.
- **`updateUserProfile`** (`adaptiveJourneyEngine.ts:263-324`) is the feedback-writer: on a
  practiced day it updates `streakDays`/`missedDays` from the gap since `lastPracticedAt`,
  recomputes running `avgPracticeMinutes`/`avgRating`, re-derives `lastJournalSentiment` and
  prepends to `recentReflections` (capped at 5), and recomputes `engagementLevel` from a
  weighted score (`practiceMinutes/30 * 0.4 + rating/5 * 0.3 + min(chatMessages/10,1) * 0.3`,
  thresholds 0.7/0.4). On a missed day it just increments `missedDays` and resets
  `streakDays` to 0. This looks like an early, fully local (no DB) version of the journey
  logic — likely superseded by the server-side `consciousness-engine`/`session-adapter`
  pair below, but still present and presumably wired into some journey UI.

### 3.2 `src/lib/consciousness/*` — the typed engine library

`src/lib/consciousness/index.ts` re-exports the whole surface; the key modules:

- **`vLevelCalculator.ts`** — `calculateVLevel()` (`vLevelCalculator.ts:14-53`) computes a
  geometric mean of the 4 primary dimension scores (`PRIMARY_DIMENSIONS`), multiplies by an
  "integration multiplier" (0.9–1.1) derived from the 2 integration dimensions
  (Action & Connection), and clamps the result to Band 1.0 for the first 30 days
  (`CALIBRATION.durationDays`/`maxBandDuringCalibration`). The result is rounded to 1dp,
  floored to an integer `band`, and the fractional remainder maps to a `microLevel`
  (`entering` <0.3, `deepening` <0.7, else `mastery`). Also here: `detectSpeedProfile()`
  (avg sessions-per-level + quality → fast/steady/deep, `vLevelCalculator.ts:58-69`),
  `shouldLevelUp()` (3-tier quality/consistency/session-count thresholds →
  fast/normal/slow track, `:74-89`), `checkBypassingRisk()` (skill − state gap ≥2 →
  recommend grounding practice, `:94-107`), `sessionsToReturn()` (post-gap credit logic,
  `:112-120`), and `getWarmUpAdjustment()` (>3-day gap → 0.5 band drop + "ease in gently"
  message, `:125-138`).
- **`quickBandDetector.ts`** — the 4-question onboarding diagnostic
  (`quickBandDetector.ts:129-180`, `detectQuickBand`). Weighted blend of belief (35%),
  emotion_response (30%), practice_history (20%), intent (15%), each 0–3 scaled ×2, clamped
  to 0.0–6.9 (Bands 7+ are reserved for actual practice, not self-report). Practice history
  can *bump* the micro-level up even if belief-band computes low. Maps `bandFloor` (0–6) to
  a name (`Sleeper`→`Channel`), a micro-name, a `phase` (1–7, via `PHASES` table), and a
  `guruId`/`guruWhy` via `CORE_GURU_BY_BAND` (Aarav→Veer→Patanjali→Buddha→Krishna→
  Shankaracharya→Ramana).
- **`practiceEngine.ts`** — `getNextPractice(ctx: EngineContext)`
  (`practiceEngine.ts:55-141`) is the most literal "what's next" decision function. It scores
  every candidate practice via additive weighted rules
  (`ENGINE_PRIORITY_WEIGHTS` from `dimension-matrix.ts`): weakest core practice, the user's
  anchor path, growth path (only if anchor is plateauing), each active loop's mapped
  practice, each life-domain-stress mapped practice, cross-pollination suggestions for
  plateaued practices, and a boost for practices that target the weakest dimension (impact
  ≥3 in `DIMENSION_IMPACT_MATRIX`). `filterByActivation()` (`:185-219`) then removes
  specialty practices whose gating conditions aren't met (e.g. `kriya` needs raja L4 + body
  L3; `tantra` needs band ≥3 + jnana L3; `emotional-healing` needs emotion score <3). The
  highest-scoring surviving candidate wins; `observation` L1 is the hard fallback.
  `detectPlateau()` (`:230-237`) flags 5+ sessions of low-variance, stalled (0.4–0.75)
  quality. `getSessionFormula()` (`:243-253`) is the fixed 30/50/20 teaching/practice/
  reflection time split.
- **`dimensionTracker.ts`** — turns completed practices into `DimensionSignal`s
  (`generatePracticeSignals`, `dimensionTracker.ts:56-88`: delta = impact/4 × quality ×
  duration-factor (capped 1.5×) × level-factor × 0.1) and folds them into a
  `DimensionSnapshot` via confidence-weighted EMA (`applySignals`, `:94-125`), tracking a
  rising/stable/falling `trend` per dimension. `getWeakestPrimaryDimension` and
  `getDimensionBalance` (`:130-169`) feed the practice engine's dimension-targeting rule and
  a "focus on X, it's N bands behind" recommendation string.
- Other named modules re-exported: `speedProfileEngine.ts` (adaptive difficulty + guilt
  detection + post-gap warm-up), `dailyGates.ts` (time-of-day gating & greetings),
  `assessmentDetector.ts` (onboarding → all levels), `sessionGenerator.ts`
  (`generateSessionPlan`), the agent subsystem (`agents/agentDefinitions.ts`,
  `agents/stateEngine.ts`, `agents/agentRouter.ts`, `agents/edgeCaseDetector.ts`,
  `agents/stageEngine.ts`, `agents/insightLayer.ts` — an 8-stage hidden consciousness model
  with teachability scoring and reveal-depth gating), `masterRotation.ts`
  (`decideRotation`/`resolveGuru`, see §5), `lifetimeSpiral.ts` (10-phase lifetime model),
  `lifeStageDetector.ts`, `relationshipDepth.ts`, `retentionEngine.ts`.

### 3.3 `consciousness-engine` edge function — the authoritative V-Level + state computer

At 2038 lines this is the largest single decision surface in the codebase (only the first
~330 lines were read in depth here). Highlights from what was inspected:

- **`BANDS`** (`consciousness-engine/index.ts:12-21`): 8 named bands (Sleeper→Source) each
  carrying a `vocab`/`avoid` word list used to keep AI copy tonally appropriate to the
  user's band (e.g. Band 0 avoids "consciousness"/"witness"/"ego"; Band 6 avoids "effort").
- **`DIMENSION_MAX_BY_DAY`** (`:24-41`) — a *per-dimension* band cap ramp keyed on
  `journeyDay` (1.5 at day 0 → 2.5 @7d → 3.5 @14d → 4.5 @30d → 5.5 @60d → 6.5 @90d → 7.0
  @180d), separate from the 30-day calibration cap used elsewhere — during calibration the
  cap is fixed at 3.5 regardless of day count (`getDimensionCap`, `:34-41`).
- **`LOOP_CLUSTER_MAP`** (`:46-74`) maps ~24 loop ids to a `root_wound` (separation,
  unworthiness, unsafety, powerlessness, abandonment, identity_fixation, inner_void,
  disconnection) and a chakra list — the substrate for `computeChakras()` (`:199-213`),
  which derives all 7 chakra scores from weighted dimension-band combinations, discounted
  15% when a related loop is active/acute.
- **V-Level v2** (`computeVLevel`, `:91-129`) is materially different from the client-side
  `vLevelCalculator.ts` formula: instead of a pure geometric mean it blends **40% geometric
  mean + 30% harmonic mean + 20% min + 10% max** of the 4 dimension values, then multiplies
  by a `witnessModifier` (0.70 + 0.30×`computeWitnessQuality`, itself a 0.4/0.35/0.25 blend
  of witness gap/stability/depth, `:79-84`), a `loopPenalty` (down to 0.50 floor, −0.05 per
  acute loop, −0.02 per active loop), and an `integrationBonus` (1 + 0.10×integration
  score). Result clamped to [0, 7.0].
- **Integration Score v2** (`computeIntegrationScoreV2`, `:136-176`) explicitly fixes an
  earlier bug ("never tested" used to score a perfect 1.0) by blending 4 components: peak-
  baseline proximity (30%), "testing depth" — dark-night recovery history scores *higher*
  than never having been tested (25%), session consistency vs. expected cadence (25%), and
  cross-dimension balance (20%).
- **Time decay** (`applyTimeDecay`, `:181-194`) subtracts `0.01 × min(daysSince, 50)` from
  every dimension once a user has been away >1 day.
- **Archetype detection** (`detectArchetype`, `:218-229`): intellectualizer / feeler /
  athlete / dissociator / sleeper / adept / balanced / seeker, from simple dimension
  threshold comparisons.
- **Bypassing risk** (`computeBypassingRisk`, `:234-249`) sums 5 independent risk
  contributions (thought≫emotion by 2+; low emotion + long streak + high thought; peak
  V-Level >4 within first 30 days; thought+awareness≫body+emotion by 1.5+; active
  worth/safety loop combined with high compassion capacity — i.e. "using compassion talk to
  bypass one's own wound").
- **State detection** (`detectState`, `:254-268`): `dark_night` if current V-Level dropped
  >0.5 below baseline; `bypassing` if risk >0.4; `plateau` if journey day exceeds
  2×`expectedDays` for the current band with no band movement; `breakthrough` if current
  exceeds baseline by >0.3; else `normal`.
- **Circadian profile** (`updateCircadianProfile`/`getCircadianDimensionBoost`, `:271-317`)
  tracks per-time-slot session counts, infers `morning_person`/`evening_person`/`flexible`,
  a `consistency_score`, and applies small chronobiology-informed dimension boosts per time
  slot (e.g. thought +0.02 in the morning, emotion +0.02 in the evening).

### 3.4 `adapt-next-block` — mid-session block swapping

Called from the session orchestrator between blocks (`adapt-next-block/index.ts:1-14`).
Pulls `engine_signals` from the last 15 minutes (`:79-96`); if none, fast-paths to `keep`
with zero AI cost. Otherwise it hands the AI a strict tool-call
(`decide_adaptation`, `:128-156`) with three possible actions — `keep` (default),
`replace` the next block, or `inject` a short (60–240s) bridge step before it — constrained
to a fixed practice vocabulary (`PRACTICE_ROUTE`, `:38-47`: observation, breath, witness,
body, self-inquiry, bhakti, jnana, journal) so the AI cannot hallucinate an unroutable
practice. The system prompt explicitly biases toward `keep` and forbids injecting more than
one extra step.

### 3.5 `evaluate-practice-level` — quality-based level-up

Reads the user's `user_practice_levels` row, `user_speed_profile`, last 15 sessions from
the unified `sessions` table (filtered by `type_payload->>practice_type`), and consciousness
profile streak (`evaluate-practice-level/index.ts:51-65`), then applies the same 3-track
level-up thresholds as the client `vLevelCalculator.shouldLevelUp()` but server-side and
DB-persisted: **fast** (avgQuality≥0.8, consistency≥5, sessionsAtLevel≥5 → +1, or +2 if also
"mastered"), **normal** (≥0.6/≥3/≥8 → +1), **slow** (≥0.4/≥1/≥15 → +1), else if
avgQuality<0.3 with 3+ sessions at level, flags `difficultyAdjustment: "gentler"`
(`:91-120`). Separately, a rolling 3-session micro-adjustment
(`:122-134`) sets `harder`/`gentler`/`stabilize` from the most recent 3 quality scores
regardless of level-up eligibility. `detectSpeedType()` (`:187-191`) re-derives the
fast/deep/steady speed profile from the same session batch and persists it, alongside a
hand-written "anti-guilt" message (`getAntiGuiltMessage`, `:193-201`) that explicitly frames
low quality or slow pace as valid rather than a failure.

### 3.6 `assess-starting-levels` — onboarding-driven initial levels

Not everyone starts at Level 0: keyword-matched detector functions
(`detectObservationLevel`, `detectSelfInquiryLevel`, `detectBreathLevel`, `detectBhaktiLevel`,
`detectKarmaLevel`, `detectWitnessingLevel`, `detectBodyLevel`, all
`assess-starting-levels/index.ts:37-112`) scan free-text onboarding answers for
experience-signaling phrases (e.g. "pranayama"/"advanced"/"retention" → breath level 4;
"witness"/"observer"/"detached" → witnessing level 4) and assign 0–4 starting levels per
practice. `detectBrainDominance()` and `detectLifeStage()` (`:114-135`) similarly keyword-
match decision-making style and life context (student/parent/retiree/elder/professional).
The handler (`:137-254`) then computes `anchorPath`/`growthPath` (highest/lowest of the 4
path practices: bhakti, karma, jnana, raja), an initial speed-profile guess from the average
detected level, upserts a row per practice into `user_practice_levels`, seeds
`user_spiritual_dna`, `user_speed_profile`, 6 `life_domain_scores` rows at a neutral 5.0, and
a `curiosity_queue` row — all gated by the hard 30-day calibration cap on the reported band
(`Math.min(body.band || 0, 1.0)`, `:153`).

### 3.7 `session-adapter` — single-shot entry-time adaptation

Runs once when a session is entered, adapting a program-assigned `{master, mode, practice}`
triple to the user's *right-now* state (`session-adapter/index.ts:1-14`). Decision order for
master swaps (`:192-230`): (1) `dark_night` state forces a soft-holding master (Rumi,
Anandamayi, Milarepa via `STATE_MASTER_RULES`), (2) an urgent (`urgency≥0.7`) unconsumed
`engine_signals` loop maps to a specialist master (`LOOP_MASTER_RULES`, e.g.
`spiritual_bypassing`→Kabir, `perfectionism`→Krishna, `shame`/`grief`→Rumi), (3) the user's
top active loop by severity (if severity≥4 or no master was pre-assigned), (4) a dominant
life-domain hint (`DOMAIN_MASTER_RULES`: money/work→Krishna, relationship/family/grief→Rumi,
meaning→Vivekananda, health→Patanjali), (5) state-based fallback for breakthrough/plateau
states when no master was assigned at all. Mode is then re-aligned to the new master's
lineage affinity (`MASTER_MODE_AFFINITY`) unless a crisis/dark-night forces `therapy` mode
outright. Practice substitution (`:248-282`) swaps deep inquiry for `observation` if band <2,
swaps breath for `therapy` in dark-night states (avoiding hyperventilation risk while
fragile), and rotates within a practice family (`PRACTICE_FAMILIES`: somatic/breath/
inquiry/reflection/emotional) if the same practice was used 2+ times in the last 3
sessions. Pacing (`short|medium|deep`) is set from state + recent-session-fatigue
(`:284-287`). Every decision — original vs adapted for all three fields, reasons, and the
raw signal snapshot — is logged to `session_adaptations` for the feedback loop (`:308-327`),
and any urgent signals consumed are marked `consumed_at` (`:330-339`).

### 3.8 `recalibration-intelligence` + `recalibrate-constellation` — drift-triggered rebalancing

`recalibration-intelligence` is the meta-decision layer that decides **when** a user's whole
practice constellation needs to be recomputed. It gathers 7 weighted drift signals
(`recalibration-intelligence/index.ts:29-50`, `WEIGHTS`): dimension variance vs. baseline
(18%), witness-gap delta (14%), bypassing-risk spike (14%), regression delta (18%), plateau
score — no speed-profile-history row in 21 days despite 10+ total sessions (12%), predictive
risk from `predictive_signals` (12%), and practice-effectiveness drop on the user's dominant
path (12%). `decide()` (`:189-210`) short-circuits to `dark_night` if a regression-based
dark-night flag is active; otherwise it sums the weighted drift score and maps it to
`none` (<0.20), `minor` (<0.50, blend 0.85 current/0.15 fresh), `major` (<0.80, blend
0.60/0.40), or `reassess` (≥0.80 — a user-facing prompt, never auto-applied). A 3-day
cooldown suppresses repeat recalibration unless drift is severe (≥0.7). `minor`/`major`
decisions are auto-applied by invoking `recalibrate-constellation`; `reassess` and
`dark_night` are logged but never auto-mutate the user's path (`:212-246`). Every decision —
applied or not — is written to `recalibration_events` for audit + UI surfacing. It supports
three modes: single user, `force: true` (user-triggered "recalibrate me now" — coerces
`none`→`minor`), and `all: true` (cron path over all users active in the last 30 days).

`recalibrate-constellation` does the actual blend: it re-derives a "fresh" 12-practice
weight vector from `practice_effectiveness` over the last 30 (minor) or 90 (major) days,
boosts `observe`/`witness` if active loops exist, normalizes it (floor `MIN_WEIGHT=0.005`,
sum-to-1), and blends it with the *existing* stored weights at 85/15 (minor) or 60/40
(major) so history is never wiped out in one shot (`recalibrate-constellation/index.ts:45-
137`, "Law 2 — continuous calibration"). Weight thresholds classify each practice as
`primary` (≥0.15), `secondary` (≥0.06), or `dormant`; `observe` is protected from ever going
fully dormant. The count of `primary` practices determines a coarse `phase`: `t-shape`
(≤3 primaries) → `breathe` (≤5) → `integrate` (6+). Every recalibration writes both the
current `user_practice_constellation` row and an append-only
`user_practice_constellation_history` snapshot.


---
