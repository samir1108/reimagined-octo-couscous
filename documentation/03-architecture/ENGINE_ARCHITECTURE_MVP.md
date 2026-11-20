# ConsciousOS — Engine Architecture (MVP Deep Dive)

> **Audience:** Smartest minds in the room. CTOs, ML researchers, founders.
> **Thesis:** We are not a prompt over an LLM. We are a **closed-loop inference pipeline over a longitudinal human state**. The LLM is one layer in a 9-layer system. This document explains, end-to-end, what the MVP is, how every engine works, how they cooperate, and why this is structurally different from any wellness/AI app on the market.

---

## TL;DR — The 30-second pitch

1. We **ingest 12 channels of human signal** (chat, voice, typing biometrics, session telemetry, biometrics, work signals, device, geo, games, mood pulses, journals, dreams).
2. We **fuse them into a canonical, cached object** called `user-state-snapshot` (L3) — the residual stream of the system.
3. Every product surface (day plan, session, nudge, master reply, journal prompt, council consensus) is **composed by specialist engines** (103 edge functions, each one an "attention head") that read from the snapshot.
4. Every session is **scored 0–1**, which writes back into the user's state. Tomorrow's snapshot is therefore **a function of yesterday's quality**, not yesterday's existence.
5. This loop, run daily for years, **converges** the user toward a measured higher V-Level across 100 dimensions of human development.

ChatGPT generates an answer. We generate **a person, over a lifetime**.

---

## Part I — The Transformer Analogy

A transformer is a closed-loop function over a residual stream. So are we.

| Transformer concept       | ConsciousOS equivalent                                  | Where it lives                                    |
| ------------------------- | ------------------------------------------------------- | ------------------------------------------------- |
| Tokens                    | 12 signal channels (chat, biometric, typing, etc.)      | `ingest-signal`, `wearable-sync`, watchers        |
| Embeddings                | 650-ID Loop Library + 100-Dimension Map                 | `src/data/handbook/`, `taxonomy/dimensions100`    |
| Positional encoding       | Time-of-day gate + life-stage + lifetime phase          | `dailyGates.ts`, `lifeStageDetector`, `lifetimeSpiral` |
| Residual stream           | `user-state-snapshot`                                   | `supabase/functions/user-state-snapshot/`         |
| Attention heads           | 103 specialist edge functions                           | `supabase/functions/*`                            |
| FFN / mixing              | `signal-fusion`, `memory-consolidate`                   | `signal-fusion/`, `memory-consolidate/`           |
| Output head               | `compose-session-v3`, `generate-daily-ritual`, etc.     | composition layer                                 |
| Loss / gradient           | `score-session-spine` → quality score 0–1               | `score-session-spine/`                            |
| Backprop                  | `verify-breakthrough` → V-Level + dimension nudges      | feedback loop                                     |
| Training corpus           | The user's own lifetime of sessions                     | `consciousness_signals`, `sessions`, `memories`   |

Transformers learn from internet text. We learn **the user**.

---

## Part II — The 9 Layers (The Pipeline)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ L8  Admin / Enterprise / Privacy floor (n≥5 aggregators)             │
├──────────────────────────────────────────────────────────────────────┤
│ L7  Surfaces: Home, Temple, Guide, Session, Journal, Games           │
├──────────────────────────────────────────────────────────────────────┤
│ L6  Feedback loop: score-session-spine → verify-breakthrough →       │
│     regression-events → cross-pollination → karma                    │
├──────────────────────────────────────────────────────────────────────┤
│ L5  Composition: compose-session-v3, generate-daily-ritual,          │
│     generate-personal-program, suggest-next-program, council         │
├──────────────────────────────────────────────────────────────────────┤
│ L4  Specialists (103 engines): consciousness-engine, curiosity,      │
│     three-lens-analyzer, detect-bypassing, pattern-window-detector,  │
│     master-journey-review, council-consensus, recalibration, ...     │
├──────────────────────────────────────────────────────────────────────┤
│ L3  Canonical state: user-state-snapshot (60s TTL cache)             │
├──────────────────────────────────────────────────────────────────────┤
│ L2  Fusion + memory: signal-fusion, embed-memory (pgvector),         │
│     memory-consolidate, synthesize-daily-memory, pattern-window      │
├──────────────────────────────────────────────────────────────────────┤
│ L1  Domain taxonomy: 650-ID Loop Library, 100-Dim Map, 8-Stage       │
│     model, 11-band Spiral, 3-layer Practice Matrix                   │
├──────────────────────────────────────────────────────────────────────┤
│ L0  Ingestion: chat, voice, typing biometrics, sessions, bio, work,  │
│     device, geo, games, mood pulses, journals, dreams                │
└──────────────────────────────────────────────────────────────────────┘
```

Every arrow is **read from L3, write back to L1/L2/L3 via L6**. That is the loop.

---

## Part III — Layer-by-Layer

### L0 — Ingestion (the senses)

12 channels. Each one normalized to a typed event:

| Channel              | Source                                | Edge function / table        |
| -------------------- | ------------------------------------- | ---------------------------- |
| Chat turns           | Guide, Temple, Council                | `guide-chat`, `temple-chat`  |
| Voice                | STT → text + prosody                  | `stt-listen`, `tts-speak`    |
| Typing biometrics    | Keystroke cadence, hesitation         | client → `ingest-signal`     |
| Session telemetry    | Step completion, dwell, drop          | `session-complete`           |
| Biometrics           | HRV, RHR, sleep, steps (wearables)    | `wearable-sync`, `bio_signals` |
| Work signals         | Slack/Teams/Outlook/Gmail/Linear/GH   | `*-tone-watcher`, `*-workload-watcher`, `work_signals` |
| Device signals       | Phone pickups, app jitter             | `device_signals`             |
| Geo                  | Sacred anchors, commute               | client → `ingest-signal`     |
| Games                | Faculty performance, attention span   | `reflect-game`, `logGameSession` |
| Mood pulses          | 5-second emoji check-ins              | `ingest-signal`              |
| Journals             | Free-text, voice notes                | `journal-reflect`            |
| Dreams               | Morning capture                       | `decode-dream`               |

Every event lands in a typed table with `user_id, occurred_at, kind, value, meta`. **Nothing is lost.** This is the corpus.

### L1 — Domain Taxonomy (the embeddings)

This is the IP no competitor can replicate in a quarter:

- **650-ID Loop Library** — behavioral patterns with stable IDs (`VAL001`, `EMO012`, `BIO005`, …). When the engine says "this user is in REC001", it means the same thing forever. This is our vocabulary.
- **100-Dimension Human Map** — 12 parent capacities × ~8 sub-dimensions each. Awareness, stillness, presence, inquiry, somatic, relational, ethical, vital, etc. Every signal, practice, and outcome maps here.
- **11-Band Spiral (V-Levels 0–10)** with micro-levels and 3 speed profiles (Fast/Steady/Deep).
- **3-Layer Practice Matrix** — Core (foundational), Path (chosen lineage), Specialty (advanced). 9 skills, 5–7 levels each, with cross-pollination edges.
- **8-Stage Consciousness Model** — hidden inference target for `stageEngine`.
- **Loop families** — meta-clusters for narrative.

The taxonomy is the **shared symbolic interface** between every engine. No engine speaks raw text to another engine.

### L2 — Fusion + Memory (the mixing layer)

| Engine                    | What it does                                                                 |
| ------------------------- | ---------------------------------------------------------------------------- |
| `signal-fusion`           | Every 5 min cron: 30-min window of bio/work/device → stress/focus/burnout norms in `[0,1]`, detected loops, recommended action. **One row to `fused_signals`.** |
| `instant-pulse-detector`  | If `burnout_risk > 0.75` or acute spike → queues a nudge.                    |
| `embed-memory`            | Salient turns → pgvector embeddings for retrieval.                           |
| `memory-extract`          | Pulls structured facts (preferences, relationships, history) from chat.      |
| `memory-consolidate`      | Hourly: merges duplicates, decays stale, promotes patterns.                  |
| `synthesize-daily-memory` | **Sleep-like consolidation.** Nightly cron compresses the day into a narrative summary the next day's snapshot reads first. |
| `pattern-window-detector` | Rolling-window detection of repeating behaviors (e.g. "third late-night Slack burst this week"). |
| `aggregate-daily-dimensions` | Rolls per-event dimension nudges into a daily snapshot.                   |

Why this matters: an LLM has no memory across calls. We have a **memory hierarchy** (episodic → semantic → consolidated → vectorized) maintained by background jobs.

### L3 — `user-state-snapshot` (the residual stream)

**The most important file in the codebase.**

```text
supabase/functions/user-state-snapshot/index.ts
```

- Single canonical object that answers: *"Who is this user right now, in this gate, at this energy, with this much time?"*
- Cached **60 seconds per `(user_id × runtime context)`** in-process, 500-entry LRU.
- Reads: V-Level, dimension bands, latest fused signal, active loops, life stage, lifetime phase, relationship depth, retention risk, current program, last session score, recent memories, time-slot pattern.
- **Every engine reads from here. No engine queries raw tables for state.**
- Service-role bypass: internal engines pass `{ userId, runtime }`; clients pass JWT.

This is the architectural moat. A prompt-based app has *no equivalent*. Every request to ChatGPT starts from zero. Every request to us starts from **the full user**.

### L4 — Specialists (the attention heads)

103 engines. Each one narrow, fast, composable. A non-exhaustive map by role:

**Diagnostic / inference**
`consciousness-engine`, `infer-three-brain`, `detect-bypassing`, `detect-contradictions`, `detect-anomalies`, `detect-silence`, `detect-cross-pollination`, `pattern-window-detector`, `three-lens-analyzer`, `evaluate-practice-level`, `assess-starting-levels`, `analyze-assessment`, `compute-companion-state`, `compute-constellation`, `compute-kundli`.

**Composition / planning**
`compose-session-v3`, `compose-session`, `compose-today-practice`, `generate-daily-ritual`, `generate-session-agenda`, `generate-program-session`, `generate-personal-program`, `generate-personal-rhythm`, `for-you-practices`, `get-next-practice`, `suggest-next-program`, `adapt-next-block`, `session-adapter`, `assign-curriculum-arc`, `generate-theme`, `evolve-theme`.

**Conversational / master**
`guide-chat`, `temple-chat`, `elder-dialogue`, `master-journey-review`, `generate-master-next-step`, `generate-master-theme-teaching`, `council-consensus`, `discovery-session`, `pre-journey-chat`, `mirror-session`, `guru-practice-session`.

**Reflective / integration**
`journal-reflect`, `guide-insight`, `post-event-reflection`, `pre-event-nudge`, `decode-dream`, `extract-sacred-moments`, `integrate-human-map`, `reflect-game`.

**Predictive / lifetime**
`predict-churn`, `predictive-insights`, `next-session-preview`, `generate-journey-nudge`, `generate-higher-self-letter`, `curiosity-engine`, `recalibration-intelligence`, `recalibrate-constellation`, `graduation-deep-analysis`.

**Feedback / scoring (L6)**
`score-session-spine`, `verify-breakthrough`, `session-complete`, `complete-task`.

**Watchers (background)**
`slack-tone-watcher`, `teams-tone-watcher`, `outlook-tone-watcher`, `gmail-tone-watcher`, `linear-workload-watcher`, `github-late-night-watcher`, `calendar-meeting-watcher`, `wearable-sync`.

**Enterprise / admin / infra**
`enterprise-insights`, `enterprise-people-intelligence`, `manager-coaching`, `org-program-designer`, `org-weekly-briefing`, `admin-ai-insights`, `admin-broadcast`, `admin-copilot`, `seed-demo-org`, `razorpay-order`, `razorpay-verify`, `translate-ui`, `always-open-prompts`, `activate-specialty`, `live-detect`, `recall-memory`.

**Contract for every engine:**

```text
input  : { snapshot, params }      // never raw tables
output : { decisions, signals, dimension_nudges, loops_touched, meta }
side-effect : writes to consciousness_signals + its own domain table
```

This contract is what makes the system **composable like a transformer**. Any engine can call any other engine via the snapshot, and the snapshot stays canonical because the 60s cache + write-through to L1/L2 guarantees consistency.

### L5 — Composition (the output head)

The product surfaces (Home day plan, Generative Session, Master reply, Council ruling) are not single LLM calls. They are **composed**:

1. `user-state-snapshot` → snapshot.
2. Composer (e.g. `compose-session-v3`) selects archetype, tone words, intent, why-for-you sentence — each tied to a `signalRef` (a loop ID, dimension, chakra, or level).
3. Composer assembles a `SessionPlan` of typed `SessionStep[]` (`wisdom-read`, `breathwork`, `journal`, `micro-act`, `reflection`, `guide-chat`, `practice`, `temple-chat`, `witness`).
4. Each step carries `whyForYou` (one concrete sentence referencing the signal that justified it). **Explainability is structural, not bolted on.**
5. Language-refiner pass adapts tone to V-Level band + life stage.
6. Plan is returned to client. State machine (`sessionMachine.ts`, XState) drives execution.

A user opening their morning session at 06:42 with low energy, weak `presence-2` band, active `REC002` (late-night) loop, and Steady speed profile gets a *different* plan than the same user at 19:10 after a high-charged Slack day. Same person, different snapshot, different composition, same engines.

### L6 — Feedback Loop (the training signal)

This is where most "AI wellness" apps stop. It's where we start.

```text
session-complete
   → score-session-spine        (0..1 quality score from telemetry + reflection)
   → verify-breakthrough        (V-Level delta? dimension nudges?)
   → regression-events          (drop detected → 6-step regression protocol)
   → cross-pollination          (plateau on practice A → boost from practice B?)
   → karma                      (economy / streak / credits)
   → writes back to L1 (taxonomy state) + L2 (memory) + L3 (snapshot invalidation)
```

The next snapshot the user generates **is not the same snapshot**. The system has updated its belief about who they are. Over 1000 days, this is convergence.

### L7 — Surfaces

React + Vite + XState client. Surfaces:

- **Home** — slot-aware (`SlotAtmosphere`, `SlotHeroCard`, `SlotSignature`), shows day plan from composer.
- **Temple** — borderless cinematic master sanctuary, 118 masters across 11 categories, `temple-chat` per master.
- **Guide** — warm "wise sibling" persona, hybrid live loop detection, continuity engine.
- **Generative Session** — universal session shell, XState driven.
- **Journal** — mirrors Guide history from `consciousness_signals`.
- **Games** — faculty training (attention, breath, regulation), feeds L0.
- **Council** — multi-master consensus via `council-consensus`.

Surfaces are **dumb renderers of engine output**. All intelligence is server-side.

### L8 — Admin / Enterprise / Privacy

- Privacy floor: `n≥5` SECURITY DEFINER aggregators. No individual ever exposed.
- Dual-context pulses (personal vs work).
- Weekly AI briefing per org.
- Admin Copilot for support.

---

## Part IV — One Real Request, End to End

User opens the app at **06:42**, taps "Begin morning".

```text
1. Client → user-state-snapshot ({ runtime: { gate: "morning", energy: "low", timeBudgetMin: 10 } })
   Returns snapshot in <80ms (cache HIT after first call of the morning).

2. Client → startGenerativeSession()
   - ensureCreditsForSession() (paise check, redirect if 0)
   - compose-session-v3({ snapshot })
     ↳ reads V-Level=2.4 (Steady), weakest dim = stillness-3
     ↳ reads latest fused_signal: stress_norm=0.71, REC002 active
     ↳ reads last 3 session scores: 0.62, 0.58, 0.41 (declining)
     ↳ calls detect-bypassing → false
     ↳ calls curiosity-engine → suggests "boundary-breath" specialty
     ↳ composes 4-step plan:
        [breathwork:boundary-breath 3m, witness:thought-counter 3m,
         journal:one-line 2m, reflection:why-now 2m]
     ↳ whyForYou per step references REC002 / stillness-3 / score trend
   - Plan returned, XState machine boots.

3. User completes steps. Telemetry streams to session-complete on finish.

4. session-complete
   → score-session-spine returns 0.74 (recovery)
   → verify-breakthrough: stillness-3 +0.08, no V-Level change
   → karma: +28 credits, streak preserved
   → invalidates snapshot cache for user
   → synthesize-daily-memory queued for 02:00

5. Tomorrow 06:42: new snapshot reflects 0.74 score, stillness-3 lift, REC002
   downgraded. Composer picks a different plan. Loop continues.
```

This loop, **run for 1000 days**, is the product.

---

## Part V — Why This Is Structurally Different

10 falsifiable claims. Any one of them, a competitor can verify is hard.

1. **Canonical state object** with sub-100ms cached reads across 103 engines. Prompt apps have no L3.
2. **650-ID stable taxonomy**. "REC002" means the same thing across every engine, forever.
3. **Multi-channel fusion** (`signal-fusion`) reducing 12 raw channels into normalized `[0,1]` stress/focus/burnout every 5 min.
4. **Daily memory consolidation** (`synthesize-daily-memory`) — sleep-like compression. We re-read our own day.
5. **Quality-scored closed loop** — every session produces a 0–1 gradient that mutates the next snapshot.
6. **Engine plurality** — 103 specialists, each <200 lines, composed at runtime. LLM is a subroutine, not the product.
7. **Lifetime adaptation** — 10-phase lifetime spiral, life-stage detector, relationship-depth engine, retention engine.
8. **Council consensus** — multi-master deliberation as a primitive, not a UI trick.
9. **Privacy floor** — `n≥5` aggregators enforced at the SQL layer. Enterprise-grade by construction.
10. **The loop IS the moat.** Day 1 we look like a wellness app. Day 365 we are a model of a specific human being that no one else has and cannot reproduce without our 365 days.

---

## Part VI — MVP Scope vs Vision

**MVP (shipped):** L0–L7 working end-to-end. 103 edge functions live. Fusion cron every 5 min. Snapshot cached. Compose-session-v3 generating personalized sessions with `whyForYou`. Score-session-spine closing the loop. Karma + credits + Razorpay. Temple with 118 masters. Guide + Journal + Games.

**Vision (next):** Deeper L8 (enterprise heat maps), full 10-phase lifetime predictor, council of yogis as default mode, geo-anchors as practice triggers, on-device biometric ingestion via Capacitor, generative session engine v4 (multi-modal narration), dream weaver as a first-class surface.

---

## Part VII — One-Liner for the Meeting

> "ChatGPT runs **one forward pass** per request. We run **a 9-layer pipeline over a 1000-day residual stream**, scored at every step, with 103 specialist heads and a 650-symbol vocabulary. The LLM is our final layer, not our product."

End of document.
