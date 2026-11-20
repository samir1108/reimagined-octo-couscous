# ConsciousOS: The Architecture
### How user data becomes a personalized inner-development pipeline (not a prompt wrapper)

> **One-line claim:** We are not a chat-with-an-LLM app. We are a **multi-stage inference pipeline over a longitudinal user state** — closer in spirit to a recommendation system + a transformer's residual stream than to a "GPT wrapper." LLMs are just one of the layers. The intelligence lives in the **state, the engines, and the loop between them.**

---

## 0. The Mental Model (the 30-second pitch)

Think of a transformer:
`tokens → embeddings → attention layers (×N) → residual stream → output head`

ConsciousOS is the same shape, but for a **human being over years**:

```
raw signals  →  normalized signals  →  fused user state  →  engines (×N)
   →  daily plan / session / nudge  →  user acts  →  feedback signals
   →  state updates  →  loop forever
```

The **"residual stream"** of our system is one canonical object: the **UserStateSnapshot**.
Every engine reads from it, writes back into it, and the next engine reads the updated version. That's how a 30-second mood pulse on Tuesday morning can change what a Guru says to you on Friday evening.

That residual stream is what no prompt-based competitor has. They have **a chat**. We have **a state**.

---

## 1. Layer-by-Layer (the actual pipeline)

```text
┌─────────────────────────────────────────────────────────────────────┐
│  L0  INGESTION                                                       │
│   journal · chat · voice · session events · biometrics · wearables  │
│   calendar · slack/gmail/teams tone · device · geo · games          │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  L1  NORMALIZATION                                                  │
│   ingest-signal · live-detect · loop library (650+ IDs)             │
│   typing biometrics · voice prosody · 3-brain inference             │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  L2  FUSION + MEMORY                                                │
│   signal-fusion · embed-memory (pgvector) · memory-consolidate      │
│   synthesize-daily-memory · pattern-window-detector                 │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  L3  THE RESIDUAL STREAM — user-state-snapshot (Mainspring)         │
│   single canonical "who is this user RIGHT NOW" object               │
│   cached 60s · every engine reads from here, never raw tables       │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  L4  ENGINES (parallel, like attention heads — each a specialist)   │
│   consciousness-engine  · arc/theme engines · curiosity-engine      │
│   compose-session-v3    · adapt-next-block  · suggest-next-program  │
│   companion-engine      · recalibration-intelligence                │
│   predictive-insights   · detect-bypassing · detect-contradictions  │
│   council-consensus (multi-master) · three-lens-analyzer            │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  L5  OUTPUT HEAD                                                    │
│   daily plan · session spine · nudge · master reply · ritual        │
│   evening reflection · higher-self letter · graduation report       │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  L6  FEEDBACK                                                       │
│   session-complete · score-session-spine · verify-breakthrough      │
│   regression-events · cross-pollination · karma                     │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ writes back into L1/L2/L3
                            └────────────► (the loop)
```

103 edge functions, ~150 Postgres tables, one canonical state object. That's the system.

---

## 2. L0 — Ingestion: where data comes from

Every interaction produces a signal. We don't only capture "what the user typed in chat" like a normal AI app — we capture the **how** as well:

| Channel | What we capture |
|---|---|
| Journal / chat | text, length, edit pauses, retries, deletions |
| Voice | prosody, pace, pitch variance, breath |
| Typing | latency between keystrokes, burstiness, deletion rate (→ anxiety signal) |
| Session | which step, time-on-step, skip vs complete, quality score |
| Biometric / wearable | HRV, sleep, breath when connected |
| Work signals (opt-in) | calendar density, late-night github, slack tone, gmail tone, teams tone |
| Device | dark patterns: doomscroll bursts, app-switch frenzy |
| Geo | anchor points (home/temple/office) for context |
| Games | reaction time, focus, breath-mic, face-cam attention |
| Mood pulse | 5-second emotional checkpoint |

Each is dropped into `consciousness_signals`, `bio_signals`, `work_signals`, `device_signals`, etc., with consent gates (`signal_consents`).

This is the **token stream**. A prompt-based app has one channel: chat. We have ~12.

---

## 3. L1 — Normalization: signals → meaning

Raw signals are useless until they become **named patterns**. This is our equivalent of tokenization + embedding.

Two key components:

**a) Loop Library (650+ IDs)** — a curated taxonomy of recurring inner patterns (e.g. `VAL001` = validation-seeking, `ABA014` = abandonment-anticipation, `COMP032` = comparison-doomscroll). Every signal is tagged against this library by `live-detect` and `instant-pulse-detector`. These IDs are the **vocabulary** of the inner world. They aren't generated by an LLM each time — they are stable identifiers, like word-piece tokens.

**b) Inference modules:**
- `infer-three-brain` — which center (head/heart/gut) is dominant right now
- typing-biometrics v2 — anxiety vs flow vs collapse
- voice prosody — emotional weather from voice
- `detect-bypassing`, `detect-contradictions`, `detect-silence`, `detect-cross-pollination`, `detect-anomalies`

After L1, a stream of "user did X" becomes "user is in pattern P with intensity I in dimension D."

---

## 4. L2 — Fusion + Memory: building the long view

A single signal is noise. A pattern across signals across days is signal.

- **`signal-fusion`** merges multi-channel signals into `fused_signals` (e.g. low HRV + frantic typing + late-night slack = burnout vector, not just "tired").
- **`embed-memory`** writes every meaningful utterance to `user_memory_vectors` (pgvector). This is our **long-term memory**, semantically searchable.
- **`memory-consolidate`** + **`synthesize-daily-memory`** runs daily — like sleep — compressing 50 raw events into one synthesis paragraph + key themes + loops touched. Stored in `daily_memory_synthesis`.
- **`pattern-window-detector`** finds rhythms (e.g. "comparison loop fires every Sunday evening for the last 4 weeks").

The output: instead of "the user typed this message," the system knows **"this is the 7th time in 60 days this user has touched abandonment, usually after a work-Slack spike, usually before sleep."** That sentence is the difference between a chatbot and a doctor.

---

## 5. L3 — The Residual Stream: `user-state-snapshot`

This is the **single most important architectural decision** in the system, and the thing to emphasize in a smart-person meeting.

**Every engine reads from `user-state-snapshot`. Nothing reads raw tables.**

It is an edge function that returns one canonical object describing the user *right now*:
- identity / archetype / V-level / band
- 12 horizontal capacities + 9 life domains scores
- active loops + intensities
- 3-brain dominance
- current arc / theme / phase in journey
- speed profile (Fast / Steady / Deep)
- recent regression events
- credits, gate state, time-of-day, energy, mood
- semantic recall of relevant past memories

It is cached 60s per user × runtime context. Per-instance map, 500-entry cap, opportunistic eviction.

Architecturally this is the **residual stream of a transformer**: a fixed-shape vector every downstream layer can read and update. Without it, every engine would query different subsets of 150 tables and reach different conclusions about the same user. That's how most AI apps end up incoherent. We refuse to be incoherent because everything reads from one place.

---

## 6. L4 — Engines: the "attention heads"

Each engine is a specialist that takes the snapshot + a goal and produces a structured decision. They run independently (parallel in spirit) and can compose. A non-exhaustive map:

| Engine | What it does |
|---|---|
| `consciousness-engine` | maintains V-level, dimension bands, regression flags |
| `compose-session-v3` (Sankalpa) | builds a session **spine** (intent → steps → close) for *this* user *this* moment |
| `adapt-next-block` | mid-session adaptation if the user collapses/skips |
| `suggest-next-program` | master-of-masters: picks/composes a multi-day program |
| `curiosity-engine` | generates the "what is the system curious about you?" question — drives progressive profiling |
| `recalibration-intelligence` | handles regression / dark-night protocols |
| `companion-engine` | the always-on relationship layer (mood, absence, inside jokes) |
| `predictive-insights` | forecasts burnout / churn / breakthrough windows |
| `council-consensus` | runs multi-master deliberation for hard moments |
| `three-lens-analyzer` | head/heart/gut perspectives on the same event |
| `detect-bypassing` / `detect-contradictions` | catch spiritual-bypass + self-deception (this is the doctor part — most apps will *never* call you out; we do) |
| `arc/theme` engines | maintain the *daily theme that evolves session-by-session* |
| `pattern-window-detector` | rhythmic pattern surfacing |

LLM calls happen **inside** these engines, scoped to a narrow job, with a structured input (the snapshot) and a structured output (a plan, a score, a decision). The LLM is a **subroutine**, not the product.

This is the deepest answer to "are you a prompt wrapper?": **the prompts are an implementation detail of individual engines; the architecture is the engines, the state, and the loop between them.**

---

## 7. L5 — Output Head: what the user sees

The engines feed a small set of output objects:

- **Day plan** (`daily_engine_plans`, `today_practice_packs`) — 2–6 chained tasks for the day
- **Session spine** (`session_spine`) — the in-session sequence with adaptable steps
- **Nudge** (`nudge_queue`) — micro-intervention with timing/channel
- **Master reply** (Temple) — answered through the master's persona and the user's full state
- **Evening reflection** — closes the day with what the system *noticed*
- **Higher-self letter / graduation report** — long-horizon outputs

Every output carries `loop_attributions` so we can later measure: *did this output actually move this loop?*

---

## 8. L6 — Feedback: closing the loop (this is where most AI apps die)

Most AI apps are open-loop: model speaks, user reads, done. We are closed-loop.

- `session-complete` records what was completed / skipped / time / mood
- `score-session-spine` produces a **quality score** (0–1). Not vanity metrics — actual movement.
- `verify-breakthrough` — confirms claimed shifts against subsequent behavior
- `regression-events` / `recalibration-events` — caught and routed
- `cross-pollination` — when growth in one practice moves a different dimension
- `karma` — long-horizon contribution-to-self score

Every feedback event writes back into L1/L2/L3, which means the next snapshot is different, which means the next engine decisions are different. **That feedback loop is the moat.** It compounds per user over months and years.

---

## 9. The "Long-Time User" Trajectory (Day 1 → Day 1000+)

A prompt-based app feels the same on Day 1 and Day 500. Ours doesn't. Why:

- **Lifetime Spiral (10 phases)** — Day 1 / 7 / 30 / 90 / 365 / … each phase changes which engines dominate, which masters rotate in, what depth of question is allowed.
- **Adaptive Level System** — level-ups are **quality-gated**, not time-gated. Three speed profiles (Fast / Steady / Deep). Regression is real, supported, and credited.
- **Cross-pollination map** — plateau in practice A → boost via practice B.
- **App-relationship depth** (`app_relationship_depth`) — 7 phases of how the system relates to *you* (curious stranger → witness → mirror → companion → coach → guru-in-pocket).
- **Progressive profiling via curiosity-engine** — the system never asks a full survey; it asks one well-placed question per week, for years.
- **Memory consolidation runs daily** — so on Day 400 the system can say *"this is the 6th October you've hit this loop; the last three times you got out via the Witness practice. Want that again, or a new doorway?"* No prompt-based app can do that line.

The architecture is explicitly designed so **time makes the product better for the individual user, not just for the model.**

---

## 10. Why this is not a "prompt wrapper" — the falsifiable claims

If a competitor wanted to copy us with prompts alone, they'd fail on each of these:

1. **State, not chat.** Show them `user-state-snapshot` returning a 40-field object. A chat app has no equivalent.
2. **650-ID loop vocabulary.** Stable identifiers across the entire system, mapped to a doctor-grade taxonomy, attributable per output.
3. **Multi-channel ingestion + fusion.** Typing biometrics + voice + wearable + work signals + geo, fused. Chat apps see ~5% of the signal we see.
4. **Daily memory consolidation (sleep).** `synthesize-daily-memory` runs nightly per user. Long-term memory is in pgvector, not in a context window.
5. **Quality-scored closed loop.** `score-session-spine` + `verify-breakthrough` close the loop. No prompt app measures whether its output actually worked.
6. **Engine plurality.** 103 edge functions, each scoped. The orchestration *between* them is the product.
7. **Lifetime adaptation.** 10-phase spiral, speed profiles, regression credits, cross-pollination. None of this is a prompt — it's a state machine over time.
8. **Council consensus.** Multi-master deliberation pattern (not single-LLM answer).
9. **Privacy floor for enterprise.** SECURITY DEFINER aggregators with n≥5 — architectural, not promised.
10. **The loop is the moat.** Even if a competitor replicated every prompt, they'd still be on Day 1; we are on Day N with the user's state.

---

## 11. One-slide version (for the meeting)

```text
            INPUT                  STATE                 OUTPUT
   ┌──────────────────┐   ┌──────────────────────┐   ┌─────────────────┐
   │ 12 signal types  │──▶│ user-state-snapshot  │──▶│ plan / session  │
   │ loops vocabulary │   │ (the residual stream)│   │ nudge / reply   │
   │ daily synthesis  │   │  fed by L1/L2,       │   │ reflection      │
   │ pgvector memory  │   │  read by L4 engines  │   │ master answer   │
   └──────────────────┘   └─────────┬────────────┘   └────────┬────────┘
                                    ▲                         │
                                    │      feedback loop      │
                                    └──── score / verify ◀────┘
                                  (this is the part nobody else has)
```

**Tagline for the meeting:**
> "Most AI apps are a prompt over a model. We are a **closed-loop inference pipeline over a longitudinal human state**. The LLM is one of our layers. The product is the state, the engines, and the loop."
