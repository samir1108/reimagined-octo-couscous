# ConsciousOS — Invention & IP Disclosure Dossier

**Document type:** Internal invention disclosure / patentability assessment / IP inventory
**Product:** ConsciousOS (`consciousos`, v1.0.0)
**Repository:** `D:\final\sat-yug`
**Prepared:** 2026-11-17
**Status:** Draft for counsel review — NOT legal advice

> This document identifies technical subject matter in the codebase that may be
> patentable, registrable, or protectable as a trade secret. It is an engineering
> inventory with claim-style drafts, not a legal opinion. A registered patent
> attorney must perform a prior-art search and decide claim scope before filing.

---

## 0. How to read this dossier

Each entry below follows the same structure:

| Field | Meaning |
|---|---|
| **Problem** | The technical problem being solved |
| **Mechanism** | How the code solves it (with file references) |
| **Novelty signal** | What is believed to be non-obvious |
| **Protection route** | Patent / trade secret / copyright / trademark |
| **Claim sketch** | Draft language to hand to counsel |
| **Prior-art risk** | Nearest known field and the distinguishing feature |

The strongest patent candidates are **1, 2, 3, 4, 5, 6, 7**. The strongest
trade-secret candidates are **8, 9, 10**. Content-heavy items (**11–15**) are
better protected by copyright and database rights than by patents.

---

## 1. Executive summary

ConsciousOS is a deterministic personalization and safety architecture layered
on top of a generative language model. The model writes prose; it does **not**
choose the practice, the dose, the ordering, or the safety verdict. That split —
**deterministic engines decide, the LLM only narrates** — is the recurring
inventive core across the system.

### 1.1 Top patent candidates

| # | Invention | Primary code | Confidence |
|---|---|---|---|
| 1 | Multi-axis deterministic session-selection engine ("whatNext") | `src/lib/sutra/orchestrator.ts` | High |
| 2 | Divisibility metric ("V-Level") with geometric/harmonic blending and time-decay caps | `src/lib/shared/vLevel.ts`, `supabase/functions/_shared/vLevel.ts` | High |
| 3 | Prerequisite-aware "next honest step" detector with redirect | `src/lib/needEngine/detect.ts`, `src/lib/sessionGraph/*` | High |
| 4 | Safety-gated adaptive dose prescription | `src/lib/prescription/{suitability,dose,prescribe}.ts` | High |
| 5 | Confidence-gated adaptive psychometric instrument (mirror planner) | `src/lib/mirrors/adaptiveEngine.ts` | High |
| 6 | Multi-signal fusion into a fused stress/focus/burnout state + action | `supabase/functions/signal-fusion/index.ts` | Medium-High |
| 7 | Per-turn generative directive composition (5-layer prompt director) | `src/lib/promptDirector.ts` | Medium-High |
| 8 | "Graceful disappearance" attenuation curve | `src/lib/shared/vLevel.ts`, onboarding engines | Medium (design/utility) |

### 1.2 Trade-secret candidates

| # | Asset | Why secret |
|---|---|---|
| 9 | Calibration constants (thresholds, weights, caps) | Reverse-engineerable from a shipped client; keep server-side |
| 10 | 300+ loop taxonomy with root-wound/chakra/dissolution mappings | Curation cost is the moat |
| 11 | 11-band stage handbook and band vocabulary gating | Deep domain curation |
| 12 | The 120 edge-function orchestration topology and prompt library | Operational know-how |

### 1.3 Copyright / trademark

- Source code, UI copy, program text, game implementations, and artwork:
  copyright (automatic).
- "ConsciousOS", "Sutra", "The First Eleven", "The Living Sitting",
  "Consciousness Loom": trademark candidates (clearance required).
- Database rights in the practice/loop/program catalogs (jurisdiction-dependent).

---

## 2. Invention 1 — Multi-axis deterministic session-selection engine

**Code:** `src/lib/sutra/orchestrator.ts` (`whatNext`, lines 351–541)

### Problem
Generative wellness apps either (a) show a static catalog, or (b) let an LLM
improvise a session. Option (b) is non-deterministic, unsafe, and cannot be
audited. There is no technical mechanism that fuses a user's long-term profile,
current physiological/emotional state, active behavioral patterns, and available
time into a single reproducible session plan.

### Mechanism
`whatNext(userId)` reads **five axes plus a sixth need axis** in parallel
(`Promise.all`, lines 355–363):

1. **Constellation** — 12 weighted practices with per-practice levels and
   statuses (`getConstellation`, lines 100–117).
2. **Life domains** — scored domains; any score < 5 is treated as "stressed"
   (`getStressedDomains`, lines 119–126).
3. **Arc** — active 7-day theme with day counter (`getCurrentArc`, lines 138–149).
4. **State** — derived energy from local hour, mood from loop count, time budget
   (`deriveState`, lines 194–206).
5. **Mode registry** — 20+ session "doors" filtered by `stateFit.minTimeSec`
   and `stateFit.energy` (`pickModeForPractice`, lines 242–254).
6. **Need** — deterministic concept gap detector (see Invention 3).

The engine then:

- chooses an agenda length 1–3 from theme depth, arc day, energy and time
  (`decideAgendaLength`, lines 178–190);
- applies **weighted random** selection across practices with state-conditioned
  multipliers (lines 220–240, 256–262);
- attaches a mandatory **observation tail** to every session
  (`buildObservationTail`, lines 264–280, Law 1);
- synthesizes a per-session theme by priority-ordered signal braiding
  (`buildSessionTheme`, lines 291–328);
- emits `alternatives`, `why`, `need`, `prescription`, and `graphSpec` for
  transparency (lines 494–540).

### Novelty signal
The combination of (i) a six-axis concurrent state read, (ii) deterministic
agenda-length and dose caps, (iii) a graph-scored practice pick with a weighted
fallback, and (iv) an always-attached observation step, producing an auditable
plan object with per-axis provenance.

### Claim sketch
> **Claim 1 (method).** A computer-implemented method for generating a
> personalized contemplative session, comprising: concurrently retrieving, for a
> user identifier, a practice-weight vector, a domain-stress vector, an active
> behavioral-loop set, a multi-day theme arc, and a capability band;
> deriving a real-time state vector from a device clock and the loop set;
> computing a session agenda length as a function of theme depth, arc day,
> energy level, and a time budget, capped at three steps; selecting a primary
> practice by (a) walking a knowledge graph from active loops and stressed
> domains to dissolution practices and (b) falling back to a weighted random
> draw over the practice-weight vector; filtering a mode registry by the state
> vector to select a delivery mode; and emitting a session plan object
> comprising the selected practice, mode, duration, a mandatory observation
> prompt, and a human-readable rationale referencing each contributing axis.

> **Dependent.** Wherein the plan object further comprises a safety
> prescription and a graph-derived step specification, and wherein selection of
> the primary practice is overridden to a grounding practice when a safety
> verdict is one of rest-only, hold, or refer.

### Prior-art risk
Recommender systems and adaptive learning paths are crowded. The distinguishing
features to emphasize: deterministic agenda-length decision, mandatory
observation tail, and the safety override of the recommender.

---

## 3. Invention 2 — Divisibility metric with blended means and decay caps

**Code:** `src/lib/shared/vLevel.ts` (`calculateVLevel`, lines 137–222);
server copy at `supabase/functions/_shared/vLevel.ts`

### Problem
Single-scale "level" scores are gameable and reward one strong dimension while
ignoring weak ones. Wellness progression needs a score that is structurally
punished by imbalance, cannot spike early, and decays without practice.

### Mechanism
For four primary dimensions `t, e, b, a`:

```
geometricMean = (Π(v_i + ε))^(1/4) − ε
harmonicMean  = 4 / Σ 1/max(0.01, v_i)        (0 if any v_i = 0)
blended       = 0.40·geometricMean
              + 0.30·harmonicMean
              + 0.20·min(v)
              + 0.10·max(v)
```

Then modulated (`lines 188–197`):

```
witnessQuality  = 0.40·gap + 0.35·stability + 0.25·depth
witnessModifier = 0.70 + 0.30·witnessQuality
loopPenalty     = max(0.50, 1 − 0.05·acuteLoops − 0.02·activeLoops)
integration     = 0.30·peakProximity + 0.25·testingDepth
                + 0.25·consistencyRatio + 0.20·balanceScore
V = blended · witnessModifier · loopPenalty · (1 + 0.10·integration)
```

Guards:

- **Time decay** — `1% per day`, capped at 50 days (`applyTimeDecay`, lines 119–131).
- **Journey-day ceiling** — score cannot exceed a cap that rises with tenure,
  1.5 at day 0 up to 8.0 at day 730 (`DIMENSION_MAX_BY_DAY`, lines 17–36).
- **Calibration clamp** — first N days capped at 3.5 (line 156).
- **Micro-level** — fractional part mapped to entering/deepening/mastery
  (lines 206–210).
- **Bypassing detector** — `skill − state ≥ 2` triggers grounding prescription
  (lines 263–276).

### Novelty signal
The specific four-way blend (geometric + harmonic + min + max) is deliberately
non-compensatory: a single low dimension drags the geometric and harmonic terms
down, while `min` provides a hard floor penalty. Combined with a tenure-based
ceiling that prevents early score inflation and an explicit bypassing test, this
is a concrete scoring architecture, not a mental process.

### Claim sketch
> **Claim 1 (system).** A system for computing a development index, comprising:
> a scoring module that receives four normalized dimension scores and computes
> a blended index as a weighted sum of a geometric mean, a harmonic mean, a
> minimum, and a maximum of the four scores; a modulation module that multiplies
> the blended index by (i) a witness-quality factor derived from gap, stability
> and depth inputs, (ii) a loop-severity penalty that decreases with counts of
> acute and active behavioral loops, and (iii) an integration bonus derived from
> peak proximity, stress-testing depth, practice consistency and dimension
> balance; and a clamp module that caps the index at a tenure-dependent ceiling
> and applies a per-day decay when no session has been recorded.

> **Dependent.** Wherein a difference between a skill level and a state band
> exceeding a threshold emits a grounding-practice prescription.

### Prior-art risk
Composite indices exist. Distinguish on the non-compensatory blend plus
tenure ceiling plus decay plus bypassing trigger used to *control a downstream
recommender*, which supplies a technical effect.

---

## 4. Invention 3 — Prerequisite-aware "next honest step" detector

**Code:** `src/lib/needEngine/detect.ts` (`detectNeed`), `familiarity.ts`,
`src/lib/sessionGraph/generate.ts` (`generateSession`), `graph.ts`

### Problem
Users ask for advanced practices they are not prepared for (e.g. "neti-neti"
before observation). Naive personalization either refuses or complies. Both are
wrong. The system needs to detect the *actual* next step and redirect through
the prerequisite, deterministically.

### Mechanism

**Familiarity is deliberately conservative** (`familiarity.ts`):

```
familiarity = 0.45·min(1, exposure/3)
            + 0.35·min(1, practice/3)
            + 0.20·selfReport
```

Seeing a concept in chat is not the same as having sat with it.

**Candidate scoring** (`detectNeed`):

```
score = 0.40·(1 − familiarity)
      + 0.30·relevance
      + 0.20·readiness
      + 0.10·(1 − recency)
      − 0.25·recentlyUsed
      + 0.18·requestedBoost
```

- `relevance` fuses loop-family hits, weakest-dimension hits, and domain stress.
- `readiness = 0.55·(capability/5) + 0.45·(band/10)`.
- Intent is chosen by an ordered ladder:
  `orient → first_contact → train → integrate`.
- If a requested concept's prerequisites are unmet, the engine **redirects to
  the first missing prerequisite** and reports the gap ("neti-neti without
  observation" guard).

**Session graph walk** (`graph.ts` → `generate.ts`): a namespaced graph
(`concept:`, `cap:`, `practice:`, `loop:`, `domain:`, `arc:`, `claim:`) is built
from existing catalogs, gaps are found, `prerequisitePath` returns an ordered
path, and `generateSession` emits a step spec whose order, concept, and dose are
immutable to the LLM.

### Novelty signal
The redirect rule — replacing a user's requested concept with the first
unmastered prerequisite and explaining the substitution — plus the conservative
familiarity blend and deterministic intent ladder.

### Claim sketch
> **Claim 1 (method).** A method for sequencing contemplative instruction,
> comprising: maintaining, per user and per concept, an evidence record
> spanning exposure count, completed-practice count, and self-report; computing
> a familiarity value as a weighted combination thereof; computing a candidate
> score for each concept from a gap term, a relevance term derived from active
> loops and a weakest dimension, a readiness term, a recency term, and a
> repetition penalty; determining an instruction intent from the familiarity
> value and readiness; and, when a user-requested concept has an unmet
> prerequisite, substituting the first unmet prerequisite as the selected
> concept and generating a session specification along a prerequisite path in a
> knowledge graph, wherein a generative model is permitted to rewrite prose of
> the specification but not its concept, order, or dose.

### Prior-art risk
Adaptive learning and prerequisite graphs are known (e.g. knowledge-space
theory). Distinguish on the *contemplative-concept* evidence model, the
"exposure ≠ practice" familiarity split, and the redirect-with-explanation
behavior that gates a generative model.

---

## 5. Invention 4 — Safety-gated adaptive dose prescription

**Code:** `src/lib/prescription/suitability.ts` (`decideSuitability`),
`dose.ts` (`computeDose`), `prescribe.ts` (`prescribe`)

### Problem
Meditation, breath retention, and closed-eye practice are contraindicated for
panic, dissociation, psychosis history, low sleep, pain, pregnancy, recent
surgery, substance use, and minors. Consumer apps rarely gate dose on
physiological/clinical state.

### Mechanism
A **strictly ordered** decision cascade where crisis and psychosis outrank all
else (`suitability.ts`):

```
crisis            → hold      (grounding only, max 3 min)
psychosis history → refer     (no meditation)
panic / intensity≥8 → adapt   (eyes open, no retention, max 8 min)
dissociation      → adapt     (sensory orientation, no closed eyes)
energy sign stop  → hold
energy sign check → adapt
sleep <5h or q≤2  → rest_only
pain ≥6           → adapt     (max 6 min)
pregnancy/surgery/substance → adapt
teen              → adapt     (max 10 min)
default           → clear
```

`computeDose` then computes minutes, depth (`taste/guided/deep/rest`),
intensity, teach ratio, weekly frequency, and review interval, **clamped first
by safety, then by familiarity and capability, never by enthusiasm**:

```
minutes = clamp(min(intentMinutes, min(budget, suitability.maxMinutes)), 3, 30)
```

`prescribe` additionally caps inquiry/witness work below capability level 3
("energy readiness") and attaches resolved knowledge claims and a next-step
preview.

### Novelty signal
The ordered safety cascade producing a structured verdict object
(`allowMeditation`, `allowBreathRetention`, `allowClosedEyes`, `allowLongSit`,
`maxMinutes`, `recommendedProtocol`) that *controls the generative and timing
layers downstream*, rather than merely displaying a warning.

### Claim sketch
> **Claim 1 (method).** A method for controlling delivery of a contemplative
> session, comprising: receiving a safety input vector comprising crisis,
> psychosis-history, panic, dissociation, energy-sign, sleep, pain, pregnancy,
> surgery, substance, and age-band fields; evaluating the fields in a fixed
> precedence order to produce a verdict selected from clear, adapt, rest-only,
> hold, and refer; deriving a session dose comprising duration, depth,
> intensity, and teach-to-practice ratio; clamping the duration by both the
> verdict's maximum duration and a user time budget; and disabling at least one
> of closed-eye practice, breath retention, and long-sit delivery in a session
> runtime when the verdict so indicates.

### Prior-art risk
Clinical triage rules exist. The novelty is the application to a *generative
session runtime* with explicit capability flags and dose clamping, plus energy
phenomena signals as a first-class safety input.

---

## 6. Invention 5 — Confidence-gated adaptive psychometric instrument

**Code:** `src/lib/mirrors/adaptiveEngine.ts` (`planMirror`, `chooseTier`,
`scoreMirror`)

### Problem
Static questionnaires re-ask saturated questions, waste user time, and cannot
escalate depth as evidence accumulates. Fixed forms also cannot distinguish
"preliminary" from "read" results.

### Mechanism
Constants (`ADAPTIVE`, lines 58–73):

```
MIN_QUESTIONS        = 5
SATURATION_SAMPLES   = 3
SATURATION_CEILING   = 82
DEEP_THRESHOLD       = 0.34
CORE_THRESHOLD       = 0.66
ESCALATION_ATTEMPTS  = 2
ESCALATION_AGREEMENT = 0.9
```

- **Tier selection** (`chooseTier`): cumulative confidence and repeated
  agreement unlock `surface → deep → core`. Agreement, not attempt count alone,
  earns depth.
- **Question pruning** (`planMirror`): a dimension answered to ceiling ≥82%
  three or more times is "saturated"; its questions are dropped, but never below
  `MIN_QUESTIONS`. Savings are re-spent on the least-covered dimensions.
- **Confidence model**: `0.28 + depthBonus + coverageBonus + min(cumConf,0.4)`.
- **Band assignment** (`bandFor`): `preliminary / inferred / read / locked`
  from confidence, history length, and pruning count.
- **Scoring** (`scoreMirror`): weighted option totals, normalized percentages,
  completion fraction, and **silent dimensions** (zero signal) reported as data.

### Novelty signal
The pruning-and-reallocation loop coupled to an agreement-based escalation
gate, plus treating unanswered dimensions ("silence") as an informative signal
rather than missing data.

### Claim sketch
> **Claim 1 (method).** A method for administering an adaptive assessment,
> comprising: storing, for a subject, a history of prior assessment attempts
> with per-dimension percentage scores and confidence values; identifying a
> dimension as saturated when it has been measured at least a threshold number
> of times at or above a ceiling value; removing items measuring saturated
> dimensions from an item bank while retaining a minimum item count; ordering
> retained items by least-covered dimension; selecting a depth tier as a
> function of cumulative confidence and cross-attempt agreement, wherein
> agreement across repeated attempts unlocks a deeper tier; and outputting a
> plan comprising the selected items, the depth tier, a pruning record, a
> confidence value, and a reliability band.

### Prior-art risk
Computerized adaptive testing (IRT/CAT) is well known. Distinguish on the
agreement-based escalation rule, the saturation-pruning with minimum floor, and
the silence-as-signal scoring.

---

## 7. Invention 6 — Multi-signal fusion into an actionable state

**Code:** `supabase/functions/signal-fusion/index.ts`

### Problem
Wearable, work, and device signals are siloed. Each vendor produces its own
score; none produce a single normalized state that a practice engine can act on
every few minutes.

### Mechanism
Pulls the last 30 minutes of three signal layers, normalizes to `[0,1]`, and
computes:

```
hrv_norm     = clamp((hrv_rmssd − 10) / 90)
tone_load    = clamp((charged − calm)/5 + 0.5)
restlessness = clamp(phone_pickups / 30)
stress_norm  = 0.35·(1 − hrv_norm) + 0.25·tone_load
             + 0.15·restlessness + 0.10·jitter + 0.15·workload
focus_norm   = 0.35·sleep/100 + 0.25·(1 − restlessness)
             + 0.20·(1 − tone_load) + 0.20·(1 − workload)
burnout_risk = 0.50·stress_norm + 0.25·(1 − focus_norm)
             + 0.15·workload + 0.10·late_night
```

Thresholds map to loop IDs (`RES003`, `EMO012`, `BIO005`, `REC001`, `WRK001`,
`REC002`, `BUR001`) and to a recommended action chosen by a precedence ladder
(`rest_protocol`, `sleep_anchor`, `boundary_breath`, `walking_meditation`,
`cooling_breath`, `deep_work_block`, `witness_5min`). One fused row is written
per user per run for downstream engines.

### Novelty signal
Late-binding fusion of physiological, communication-tone, workload, and device
signals into a single normalized triple plus a deterministic action ladder
designed to run on a 5-minute schedule.

### Claim sketch
> **Claim 1 (system).** A system comprising: adapters for at least three signal
> layers including a physiological layer, a workplace-communication layer, and a
> device-usage layer; a normalizer converting each signal to a bounded scale; a
> fusion module computing a stress value, a focus value, and a burnout-risk
> value as fixed weighted combinations of the normalized signals; a classifier
> mapping the fused values to a set of behavioral-loop identifiers; and a
> selector mapping the fused values to a recommended intervention by a
> precedence ladder, wherein the fused values and recommendation are persisted
> as a single record consumable by a session-selection engine.

### Prior-art risk
Sensor fusion is crowded (activity recognition, driver monitoring). Distinguish
on the specific cross-domain combination and the direct binding to a
contemplative session recommender.

---

## 8. Invention 7 — Per-turn generative directive composition

**Code:** `src/lib/promptDirector.ts` (5-layer composition)

### Problem
A single fixed system prompt makes an AI companion feel static and can cause
tone failures (too advanced for a beginner, too soft for an advanced user,
ignoring safety state). Constructing a fresh directive per turn is non-trivial.

### Mechanism
Composes a system prompt and opener from five ordered layers:

1. **Arc layer** — lifetime phase (Foundation ≤60d, Practitioner ≤180d,
   Integrator ≤540d, Steward, Elder) with a voice specification.
2. **Session layer** — today's foundation day or theme.
3. **Mode layer** — guide mode framework (self-inquiry, gratitude, shadow, …).
4. **State layer** — streak, missed days, mood, band, dominant brain, last
   insight, and **unknown concepts that must be defined before use**.
5. **Persona layer** — optional master overlay.

It returns `systemPrompt`, `opener`, `agenda`, `arcLabel`, `modeLabel`, and
supports a `DirectorPlan` step contract with ±30% timing slack.

### Novelty signal
The **unknown-concept predefinition constraint** (the model must define a
concept in one plain sentence before using it) and the explicit five-layer
precedence that binds developmental phase, session content, mode, live state,
and persona into one per-turn directive.

### Claim sketch
> **Claim 1 (method).** A method for conditioning a generative language model
> during an interactive session, comprising: assembling a system directive at
> runtime from a developmental-phase layer, a session-content layer, a
> conversational-mode layer, a live-state layer, and an optional persona layer;
> including in the live-state layer a set of concepts for which the user's
> measured familiarity is below a threshold and a constraint requiring the model
> to define each such concept before using it; and supplying the assembled
> directive and an opener line to the model for a single turn.

### Prior-art risk
Prompt engineering is widely practiced and may face §101/obviousness
challenges. Best framed as a concrete runtime system with measured familiarity
inputs and a hard output constraint.

---

## 9. Invention 8 — Graceful disappearance (attenuation by maturity)

**Code:** Band vocab/avoid lists in `src/lib/shared/vLevel.ts` (lines 39–56);
band archetype `engineApproach` in `src/types/consciousness.ts` (lines 65–140)

### Problem
Engagement-maximizing apps increase intervention as usage grows. The stated
design goal here is the inverse: reduce AI presence as the user matures, and
change vocabulary so advanced terms are withheld from beginners.

### Mechanism
- Bands 0–6 define per-band `vocab` allow-lists and `avoid` lists that gate
  language.
- Band archetypes define `engineApproach`, from "stabilize nervous system" at
  band 0 to "silent presence" at band 8 and "beyond app scope" at 9–10.
- Higher bands reduce teaching, increase silence tolerance, and shift the model
  from instruction to peer exploration.

### Novelty signal
An explicit, computed attenuation policy that *decreases* system-initiated
interaction and vocabulary complexity as a measured maturity score rises,
including defined terminal states where the system stops intervening.

### Claim sketch
> **Claim 1 (method).** A method for operating a digital companion, comprising:
> computing a maturity score for a user; mapping the score to a band; selecting,
> from a per-band policy, an intervention frequency, a vocabulary allow-list and
> an avoid-list, and an interaction style; and reducing at least one of
> notification frequency, teaching content, and model verbosity as the maturity
> score increases, including a terminal band at which system-initiated
> intervention is disabled.

### Prior-art risk
Adaptive difficulty is known. The counter-directional attenuation (less help as
competence grows) and the vocabulary gating are the distinguishing features;
utility-patent viability is uncertain, so consider design/trade-secret treatment.

---

## 10. Supporting mechanisms (secondary inventions)

### 10.1 Deterministic micro-session compiler
`src/lib/needEngine/detect.ts` (`shapeForIntent`, `stepsFor`) and
`src/lib/sessionGraph/generate.ts` (`stepsFor`): intent-specific step weight
vectors (e.g. orient `[1.5,1,2,1,0.5]`, train `[1,9,2,0.5]`) convert a time
budget into per-step minutes. Claimable as a "budget-to-step allocation" method.

### 10.2 Form-driven observation flow
`src/lib/practice/observationFlow.ts`: a seed's `form` (`vigil`, `threshold`,
`return`, …) determines which stages exist and their order; beat durations are
allocated by relative weight. Distinguishing feature: **no universal session
skeleton** — the flow is derived from the practice form.

### 10.3 Adaptive sitting planner (The First Eleven)
`src/lib/onboarding/firstElevenEngine.ts` (`planSession`): fills fixed question
slots by scoring candidates `+3` weakest dimension, `+2` active-loop hit,
`-2` in-sitting dimension repetition, plus a deterministic per-user hash
tiebreak. Produces different sittings for different users without an LLM.

### 10.4 Compiler from content plan to runtime shell
`src/lib/onboarding/composeSittingPlan.ts`: maps semantic step kinds
(`teaching`, `question`, `silence`, `breath`, `act`) to canonical runtime step
kinds while carrying bank identity in params so answers can be reconstructed.
Claimable as a "lossless content-to-runtime compilation" method.

### 10.5 Dual-layer personal knowledge graph
`src/lib/knowledgeGraph/personalGraph.ts`: user nodes/edges/observations with
`provenance` (`reported`, `inferred`, …) and confidence, kept separate from the
global knowledge graph. Claimable as provenance-weighted personalization memory.

### 10.6 Calibration-period guards
`src/lib/shared/vLevel.ts` (`getDimensionCap`, lines 29–36): dimension scores
are capped by journey day, preventing early score inflation and front-loaded
progression.

---

## 11. What is *not* patentable as-is (and how to reframe)

| Raw subject matter | Problem | Reframe as |
|---|---|---|
| Spiritual/meditation methods | Mental processes; abstract | A computer system that **controls device output** (audio timing, eye-open/closed, session length) based on measured state |
| Questionnaires | Abstract data collection | Adaptive instrument with pruning/escalation and a reliability band that changes item delivery |
| Content libraries (games, programs, texts) | Copyright, not patent | Copyright + database rights + trade secret |
| "AI that talks like a guru" | Abstract / mental process | Per-turn directive assembly with measured inputs and hard constraints (Invention 7) |
| Scoring formulas alone | Mathematical methods | Score **controls a downstream recommender/runtime** (technical effect) |

For each filing, the specification should emphasize: (a) a concrete technical
problem, (b) a specific machine implementation, (c) a technical effect
(deterministic control of a generative model, safety gating of device output,
reduced compute by pruning, auditable provenance), and (d) an enabling
flowchart with the actual constants.

---

## 12. Protection strategy

### 12.1 Patent vs trade secret

| Asset | Recommended | Reason |
|---|---|---|
| Session-selection engine | **Patent** (method + system) | Client-visible logic; easy to detect infringement |
| V-Level computation | **Patent** + keep server canonical copy secret | Formula partly shipped to client |
| Need/prerequisite redirect | **Patent** | Distinctive behavior, observable |
| Safety dose gate | **Patent** (strong §101 story: device control) | Clear technical effect |
| Adaptive mirror planner | **Patent** | Observable item delivery |
| Signal fusion | **Patent** + secret weights | Weights are the moat |
| Prompt director | **Trade secret** (primary) | Hard to detect; easy to design around |
| Loop taxonomy / handbook / calibration constants | **Trade secret** | Curation cost; not observable |
| Code, UI, content | **Copyright** | Automatic |

### 12.2 Filing sequence (cost-aware)

1. **Provisional applications** for Inventions 1, 2, 3, 4 (one combined
   provisional is possible if the specification ties them as one inventive
   system; separate provisionals give cleaner priority).
2. Within 12 months, convert the strongest 2–3 to PCT/non-provisional.
3. Keep 7–12 as trade secrets; document them in an internal secrecy register.
4. File trademarks for the product and named systems after clearance.
5. Record invention assignments from every contributor **before** any public
   disclosure or funding round.

### 12.3 Prior-art search terms

- "adaptive meditation recommendation system"
- "contraindication meditation breath retention"
- "computerized adaptive testing item pruning saturation"
- "multi-sensor stress fusion wearable calendar email"
- "knowledge graph prerequisite learning path recommendation"
- "non-compensatory composite index geometric harmonic mean"
- "LLM prompt composition user state adaptive"
- CPC classes: `G16H 20/70`, `G16H 50/30`, `G09B 5/00`, `G09B 7/00`,
  `G06N 5/02`, `G06N 20/00`, `A61B 5/16`, `A61M 21/00`.

### 12.4 Evidence to preserve now

- Git history and commit timestamps for each engine file.
- This dossier plus design docs (`PLATFORM_OVERVIEW.md`,
  `THE_LIVING_SITTING_v4.md`, `THE_FIRST_ELEVEN_v2.md`).
- Screenshots/demos showing the deterministic rationale and safety verdicts.
- A signed inventor declaration listing contributors per invention.
- Server-side constants kept out of the public client bundle where feasible.

---

## 13. Inventor disclosure checklist

For each invention above, counsel will need:

- [ ] Inventor name(s) and contribution percentage
- [ ] Date of conception (earliest commit / design doc)
- [ ] Date of first disclosure (demo, investor deck, public deploy)
- [ ] Whether any public disclosure occurred >12 months ago (statutory bar risk)
- [ ] Closest known products/papers
- [ ] Whether the feature is shipped, planned, or dormant
- [ ] Assignment status (employment/PIIA signed?)
- [ ] Jurisdictions of interest (US, IN, EP, PCT)

---

## 14. One-paragraph summary for counsel

> ConsciousOS implements a deterministic personalization and safety layer for
> contemplative practice. Its patentable core is a pipeline in which (1) a
> multi-signal state model, (2) a prerequisite-aware concept graph, (3) an
> ordered clinical/energy safety cascade, and (4) a non-compensatory development
> index jointly select a practice, a dose, an order, and a delivery mode, while
> a generative language model is restricted to narrating the already-made
> decision. Additional candidates include a confidence-gated adaptive
> assessment instrument, a multi-source signal fusion engine producing a fused
> stress/focus/burnout state, and a per-turn directive composer with mandatory
> predefinition of unfamiliar concepts. Content libraries and curation
> taxonomies are best protected by copyright and trade secret rather than
> patent.

---

*End of dossier. This is an engineering disclosure, not a legal opinion. Engage
qualified patent counsel before filing or disclosing.*
