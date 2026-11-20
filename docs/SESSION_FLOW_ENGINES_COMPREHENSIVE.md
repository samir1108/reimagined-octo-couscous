# Session Flow Engines — Comprehensive Reference

**Product context:** ConsciousOS (HOPE / sat-yug), repo `D:\final\sat-yug`
**Subject:** Session flow engines — what they are, the pattern catalog, the framework landscape, and a deep-dive case study of this codebase's session system.
**Status:** Volume 1 (foundation). See §13 — Roadmap to the full 10k-line reference.

---

## Table of Contents

- **PART 1 — Foundations**
  - 1.1 What a session flow engine is
  - 1.2 Core concepts
  - 1.3 Why session flow is a distinct problem
  - 1.4 The session lifecycle
- **PART 2 — Pattern Catalog**
  - 2.1 Linear / scripted
  - 2.2 Branching / conditional
  - 2.3 State-machine driven
  - 2.4 Generative / cursor-based (AI-composed)
  - 2.5 Conversational / streaming turn-based
  - 2.6 Block-based / adaptive-journey
  - 2.7 Cinematic / scripted-narration
  - 2.8 Comparison matrix and selection guidance
- **PART 3 — Framework Landscape**
  - 3.1 State-machine & orchestration frameworks
  - 3.2 AI agent / graph frameworks
  - 3.3 Cloud workflow engines
  - 3.4 Comparison matrix
  - 3.5 Build-vs-buy decision
- **PART 4 — Case Study: sat-yug / ConsciousOS Session System**
  - 4.1 The four generations (G1–G4)
  - 4.2 G1 — Orb heuristics & deterministic orchestrator
  - 4.3 G2 — Chat sessions (`sessionMachine` + streaming)
  - 4.4 G3 — Generative step sessions (session-shell, Sankalpa / compose-session-v3)
  - 4.5 G4 — Cinematic practice runs
  - 4.6 The 11 XState machines
  - 4.7 Cross-cutting: getUserContext, adaptive engine, memory, loop detector
  - 4.8 End-to-end trace: orb tap → spine score
- **PART 5 — Architecture & Design**
  - 5.1 State model
  - 5.2 Persistence & resumability
  - 5.3 Concurrency & sessions
  - 5.4 Timeouts, retries, and compensation
  - 5.5 Versioning & migration of in-flight sessions
  - 5.6 Security & input boundaries
- **PART 6 — Implementation Guide**
  - 6.1 Step 1: Define the session contract
  - 6.2 Step 2: Choose the pattern
  - 6.3 Step 3: Model the state machine
  - 6.4 Step 4: Wire persistence
  - 6.5 Step 5: Add adaptation / AI hooks
  - 6.6 Step 6: Observability
- **PART 7 — Observability, Testing, Operations**
  - 7.1 Metrics
  - 7.2 Tracing
  - 7.3 Testing strategies
  - 7.4 Operational runbook
- **PART 8 — Anti-Patterns & Risks**
- **PART 9 — Glossary**
- **PART 13 — Roadmap to the full reference**

---

## PART 1 — FOUNDATIONS

### 1.1 What a session flow engine is

A **session flow engine** is the runtime that orchestrates a multi-step, stateful interaction between a user (or system actor) and an application over the course of a single "session." Unlike a stateless request/response API, a session flow engine must remember where the user is, what has already happened, what comes next, and how to adapt when signals change mid-flight.

Typical responsibilities:

| Responsibility | Description |
|---|---|
| State persistence | Durably store the session cursor, completed steps, and user inputs |
| Step sequencing | Decide which step/node executes next based on rules, AI, or a static graph |
| Guard evaluation | Allow or block transitions (gates, preconditions, entitlements, crisis checks) |
| Time/budget enforcement | Session length, per-step time limits, daily cadence caps |
| Adaptation | Re-plan the remaining flow based on live signals (mood, loop detection, biometrics) |
| Resumption | Rehydrate an in-flight session after disconnect, tab close, or device switch |
| Completion & side effects | Score the session, write memories, update dimensions, trigger billing/credits |

A session flow engine sits between the **interface layer** (UI/voice/cinematic) and the **intelligence layer** (consciousness model, adaptive engine, composer). It is the deterministic spine that keeps an otherwise generative, AI-driven product predictable and safe.

### 1.2 Core concepts

| Concept | Meaning |
|---|---|
| Session | A bounded interaction with a start, a sequence of steps, and an end (complete/abort/timeout). |
| Step / Node | A unit of work within a session: render content, ask a question, run a practice, invoke an AI call, wait for input. |
| Cursor | The pointer to the current step; advances as steps complete. |
| Context / Payload | The data carried through the session: user identity, band/V-Level, loops, energy, gate, time budget, answers so far. |
| Transition | A rule that moves the cursor from step A to step B, possibly conditional on context. |
| Guard | A precondition that must hold before a transition fires (e.g., "emotion band ≥ 2", "crisis gate not triggered"). |
| Adaptation point | A place in the flow where the remaining plan may be re-computed based on new signals. |
| Spine | The canonical record of what actually happened in a completed session (steps, timings, scores, outcomes). |
| Resumption token | An opaque identifier that lets a client rehydrate an in-flight session. |

### 1.3 Why session flow is a distinct problem

Session flow differs from ordinary business logic in four ways:

1. **It is long-lived relative to a request.** A session may span minutes to days, with idle gaps, disconnects, and multi-device use.
2. **It is partially AI-driven.** The "next step" may be statically known or LLM-generated at runtime, requiring a hybrid deterministic + generative model.
3. **It is signal-responsive.** Bio, chat, loop-detection, and wearables signals can force mid-session re-planning — not just pre-session planning.
4. **It has safety boundaries.** Crisis gates, bypassing detection, and band-appropriate vocab gating must be able to halt or redirect the flow at any point.

### 1.4 The session lifecycle

```
[Create] → [Initialize context] → [Step 1: render + wait]
     ↳ (signal arrives) ──► [Adapt: recompute remaining plan]
     ↳ (user input) ───────► [Guard check] ──► [Transition] ──► [Step N]
     ↳ (idle/timeout) ─────► [Suspend / persist cursor]
     ↳ (resume) ───────────► [Rehydrate] ──► [Continue at cursor]
     ↳ (end condition) ────► [Complete] ──► [Score spine] ──► [Write memory + update dimensions]
```

---

## PART 2 — PATTERN CATALOG

### 2.1 Linear / scripted

A fixed sequence of steps A → B → C → … → End. No branching. Every user gets the same order; content within steps may still be personalized.

| | |
|---|---|
| Best for | Onboarding, foundation courses, ceremonial sequences, time-boxed practices |
| Pros | Trivially testable, fully auditable, deterministic, easy to reason about |
| Cons | No personalization of order, cannot recover from a "wrong" user state |
| Example | A 7-day foundation course where day N must precede day N+1 |

### 2.2 Branching / conditional

A directed graph where transitions depend on context predicates. `if energy == low → micro-archetype else → practice_deep`.

| | |
|---|---|
| Best for | Gated content, skip-logic assessments, "choose your path" flows |
| Pros | Personalized order without AI; deterministic and inspectable |
| Cons | Combinatorial explosion as branches multiply; hard to maintain beyond ~20 nodes |
| Example | The sat-yug archetype selector (§3.5.1) — `selectArchetype(ctx)` is a priority-ordered if/else cascade |

### 2.3 State-machine driven

The flow is an explicit statechart: states, events, transitions, guards, actions, and entry/exit activities. XState, SCXML, and statecharts fit here.

| | |
|---|---|
| Best for | Complex UI wizards, multi-device session resumption, voice turn-taking, practice lifecycle |
| Pros | Formal semantics, visualizable, testable via model-based testing, explicit concurrency |
| Cons | Higher upfront modeling cost; verbose for simple flows |
| Example | `src/machines/sessionMachine.ts`, `sessionPlayerMachine`, `appEntry`, `dailyCycle`, `voice` (11 machines in this repo) |

### 2.4 Generative / cursor-based (AI-composed)

An LLM (or council of LLMs) composes the remaining step plan at runtime; a lightweight shell executes it cursor-by-cursor. The plan is data, not code.

| | |
|---|---|
| Best for | "Every session is unique" products, adaptive coaching, open-ended conversations |
| Pros | Maximum personalization, infinite variation, content assembled per-user per-session |
| Cons | Non-deterministic, harder to test/audit, needs strict output schemas + safety guards, token cost |
| Example | `compose-session-v3` Sankalpa Engine (§4.4), `src/lib/session-shell/*` |

### 2.5 Conversational / streaming turn-based

The flow is a chat loop: user message → guard/adaptive directive → LLM stream → user message → … Session state lives in the conversation history plus a sidecar context object.

| | |
|---|---|
| Best for | Guide chat, master chat, mirror sessions, therapeutic dialogue |
| Pros | Natural UX, adaptive per-turn, low friction |
| Cons | No inherent step structure; easy to lose the "point" of the session; streaming backpressure and interruption handling are non-trivial |
| Example | `guide-chat` edge fn, `sessionMachine` chat sessions (§4.3), `useGuideChat` |

### 2.6 Block-based / adaptive-journey

The journey is divided into blocks (days/weeks). Each block has a developmental focus; `adapt-next-block` decides the next block based on current-block outcomes. Sessions inside a block may use any other pattern.

| | |
|---|---|
| Best for | Multi-week programs, curricula, progression systems where "what's next" depends on mastery |
| Pros | Long-horizon planning, mastery-gated advancement, anti-guilt regression policies |
| Cons | Slower feedback loop; requires outcome scoring before advancing |
| Example | Adaptive Journey Engine (§3.6), `adapt-next-block`, `evaluate-practice-level` |

### 2.7 Cinematic / scripted-narration

A authored script (kriya, pranayama, witness) drives timed narration, 3D visuals, audio cues, and transitions. Level-adaptive: the same script plays with different depth/voice/pacing per band.

| | |
|---|---|
| Best for | Guided practices, breathwork, meditation, temple-mode experiences |
| Pros | High production value, precise timing, immersive |
| Expensive to author; least flexible mid-flight |
| Example | `src/lib/cinematic/*`, `PracticeRunControllerContext`, `sessionPlayerMachine` (§4.5) |

### 2.8 Comparison matrix and selection guidance

| Pattern | Determinism | Personalization | Authoring effort | Testability | Mid-flight adaptation |
|---|---|---|---|---|---|
| Linear | High | Low | Low | High | None |
| Branching | High | Medium | Medium | Medium | Rule-based |
| State-machine | High | Medium | Medium | High | Event-driven |
| Generative | Low | High | Medium | Low | Full (LLM re-plan) |
| Conversational | Low | High | Low | Low | Per-turn |
| Block-based | High | Medium | High | Medium | Block boundaries |
| Cinematic | High | Low/Med | High | Medium | Limited |

**Selection guidance:**
- Need auditability + safety first → state-machine or linear.
- Need "unique every session" + coaching → generative + a deterministic shell (this repo's G3).
- Need dialogue → conversational streaming with guards.
- Need multi-week progression → block-based wrapped around any intra-block pattern.
- Need guided practice with timing → cinematic.

Most production products combine patterns: this repo runs all four generations in parallel (§4.1).

---

## PART 3 — FRAMEWORK LANDSCAPE

### 3.1 State-machine & orchestration frameworks

| Framework | Language | Paradigm | Strengths | Weaknesses |
|---|---|---|---|---|
| XState v5 | TS/JS | Statecharts (actors, invoke, guards, delayed transitions) | Visualizable, model-based testing, React bindings, actor model for concurrency | Verbose for simple flows; learning curve |
| SCXML | XML (+ JS impls) | W3C statecharts | Standard, battle-tested, long-term stability | Heavy XML; less idiomatic JS ecosystem |
| Robot (legacy XState v4) | TS/JS | Finite state machines | Simpler than v5 | Legacy; v5 supersedes |
| AWS Step Functions | JSON/ASL | Cloud state machine | Managed, durable, retries, service integration | Vendor lock-in, cost per transition, cold-start latency |
| Temporal | Go/TS/Java/etc. | Durable execution (workflows as code) | Incredible for long-running, retries, versioning, saga/compensation | Operational overhead (server), different mental model |
| Durable Objects (Cloudflare) | TS | Durable actors | Co-located state + compute, good for per-session state | Cloudflare-specific |
| Machina.js / Robot3 | JS | Finite state machines | Lightweight | Less feature-rich than XState |

### 3.2 AI agent / graph frameworks

| Framework | Language | Paradigm | Strengths | Weaknesses |
|---|---|---|---|---|
| LangGraph | Python/JS | Cyclic graph of agents | Human-in-the-loop, persistence/checkpointing, multi-agent | Python-first; JS support secondary |
| AutoGen | Python/.NET | Agent conversation | Multi-agent orchestration, code execution | Heavy; less suited to bounded user sessions |
| CrewAI | Python | Role-based agents | Easy agent composition | Python-only; opinionated |
| Semantic Kernel | .NET/JS/Python | Skills + planners | Enterprise integration, memory, planning | Heavier than needed for simple session flow |
| LangChain Expression Language (LCEL) | JS/Python | Runnable chains | Composability, streaming, tracing | Chains ≠ full session state machine; state is manual |
| DSPy | Python | Programmatic prompting | Optimization, compilation | Not a session engine |

### 3.3 Cloud workflow engines

| Engine | Best for |
|---|---|
| AWS Step Functions | Long-running, service-orchestrated workflows in AWS |
| Temporal | Complex durable business processes with compensation/sagas |
| Azure Durable Functions | Durable orchestration in Azure |
| Google Workflows | Serverless workflow in GCP |
| Camunda / Zeebe | BPMN, human-task workflows, enterprise process |

### 3.4 Comparison matrix

| Dimension | XState | LangGraph | Step Functions | Temporal |
|---|---|---|---|---|
| Determinism | High | Medium | High | High (as code) |
| AI-native | No | Yes | No | No |
| Durable execution | No (client) | Checkpoints | Yes | Yes |
| Human-in-the-loop | Limited | Strong | Callbacks | Strong |
| Self-hostable | Yes (lib) | Yes | No | Yes |
| Visual debugger | XState Inspector | LangGraph Studio | Console UI | Temporal UI |
| Best fit | UI/session wizards | Agent graphs | Cloud glue | Durable business flows |

### 3.5 Build-vs-buy decision

**Buy/use a framework when:**
- You need multi-step durability across service outages (Temporal/Step Functions).
- You have multi-agent collaboration (LangGraph).
- You need BPMN/human task management (Camunda).

**Build when:**
- The flow is UI-driven and session-scoped (minutes, not days) → XState or a lightweight custom state machine.
- The flow is AI-composed per-session → a thin deterministic shell + LLM planner (this repo's G3).
- You need tight coupling to a proprietary domain model (consciousness bands, loops, crisis gates) → custom.

This repo's choice: **custom session engines + XState for UI state**, because the domain model (bands, loops, crisis gate, bypassing) is too specific for off-the-shelf workflow engines, and sessions are client-scoped, not cross-service.

---

## PART 4 — CASE STUDY: SAT-YUG / CONSCIOUSOS SESSION SYSTEM

This repo runs **four parallel session-engine generations** that evolved over time (see §12.1 of SYSTEM-ARCHITECTURE-COMPLETE.md for the archaeology). All four coexist; none was fully retired.

### 4.1 The four generations (G1–G4)

| Generation | Files | Nature | AI? |
|---|---|---|---|
| G1 — Orb heuristics | `src/lib/sessionEngine.ts`, `src/lib/sessionOrchestrator.ts` | Deterministic if/else cascade; localStorage "orb-sessions"; "session N of today" planner | No |
| G2 — Chat sessions | `src/lib/sessionFlow.ts`, `src/lib/promptDirector.ts`, `src/machines/sessionMachine.ts`, `useSessionFlow`, `useGuideChat`, `guide-chat` edge fn | Streaming chat with per-turn adaptive directives | Yes (per-turn) |
| G3 — Generative step sessions | `src/lib/session-shell/*`, `generate-session-agenda` (legacy), `compose-session-v3` (Sankalpa), `session-complete`, `score-session-spine` | AI-composed step plans executed by a cursor-based shell | Yes (plan) + deterministic (exec) |
| G4 — Cinematic runs | `src/lib/cinematic/*`, `PracticeRunControllerContext`, `sessionPlayerMachine` | Level-adaptive scripted narration layers (kriya, pranayama, witness) | Partially (voice/TTS) |

### 4.2 G1 — Orb heuristics & deterministic orchestrator

**Files:** `src/lib/sessionEngine.ts` (master-recommendation if/else cascade), `src/lib/sessionOrchestrator.ts` (deterministic "session N of today" planner, localStorage `"orb-sessions"`).

G1 is pure, local, no AI. The press-and-hold orb opens the app; `sessionEngine.ts` recommends which master/practice to launch based on time-of-day, gap days, and band. `sessionOrchestrator.ts` tracks "session N of today" locally so the user can't start more sessions than the gate allows. Persistence is localStorage, so G1 sessions do not survive a device switch.

Role today: legacy fast-path for the orb tap; superseded by G2/G3 but retained for zero-latency local recommendations.

### 4.3 G2 — Chat sessions (`sessionMachine` + streaming)

**Files:** `src/machines/sessionMachine.ts` (XState), `src/lib/sessionFlow.ts` + `src/lib/promptDirector.ts` (client surface), `useSessionFlow.ts`, `useGuideChat.ts`, `guide-chat` edge function.

G2 is the streaming conversational session:

1. User sends a message (text or voice via Deepgram STT).
2. Client builds a **high-level surface directive** via `buildSessionSystemPrompt()` (`sessionFlow.ts`) — but explicitly defers "the final word" to the edge function's adaptive engine.
3. Edge function `guide-chat` calls `getUserContext()` → adaptive engine (per-turn directive: hidden stage 0–7, agent routing, insight depth, reveal level) → LLM stream (Groq fast / OpenAI premium) → ElevenLabs TTS → streamed back to client.
4. `sessionMachine` (XState) drives the chat lifecycle: idle → listening → processing → speaking → idle, handling interruption and backpressure.

**Key design point:** The client emits only a surface directive; the authoritative per-turn AI directive is generated server-side by the Adaptive Engine (§3.3 of SYSTEM-ARCHITECTURE-COMPLETE.md). This keeps the client thin and the safety/gating logic server-controlled.

### 4.4 G3 — Generative step sessions (session-shell, Sankalpa / compose-session-v3)

**Files:** `src/lib/session-shell/*` (generative-session runtime: api, context, types), `compose-session-v3` edge function (677 lines, the Sankalpa Engine), `generate-session-agenda` (legacy), `session-complete`, `score-session-spine`.

G3 is the most architecturally significant: an LLM composes a step plan at runtime; a lightweight cursor-based shell executes it step-by-step.

**Contract:** request `{ timeBudgetMin?, energy?, gate?, intent? }` (auth required); response:
```
{ ok, plan: { id, intent, intro, steps[] }, spineId, council, chakraFocus, whyForYouCount, novelty[], memoryCallback, whisperConsumed, nextWhisper, themeId, elapsedMs, aiMode }
```

**Step model:**
```
StepKind = "wisdom-read" | "breathwork" | "journal" | "micro-act" | "reflection" | "silence"
```

**Pipeline shape:**
```
Parallel reader → 3-LLM Council (fast) → Composer (main) → Safety + write session_spine
```

- Honors `identity.aiMode` ('fast' Groq vs 'premium' OpenAI) via `aiGatewayFetch`.
- Client wiring is behind the `sankalpaV3` feature flag (`localStorage.sankalpaV3 === '1'`) with silent fallback to `generate-session-agenda` — "zero breakage."
- `compose-session-v3` reads `getUserContext()` in parallel (reader stage), runs a 3-LLM council, then the main Composer writes a `session_spine` record.

**Session-shell runtime:** The client shell consumes the plan, advances a cursor through `steps[]`, renders each step kind via the cinematic/session UI, and handles completion → `session-complete` → `score-session-spine` (karma + spine scoring).

### 4.5 G4 — Cinematic practice runs

**Files:** `src/lib/cinematic/*` (script registry + authored scripts: `kriya-energetic`, `pranayama`, `witness`), `PracticeRunControllerContext`, `sessionPlayerMachine` (XState).

G4 layers level-adaptive scripted narration over timed 3D visuals/audio. Three authored scripts. The same script plays with different depth, voice, and pacing per band (band vocab/avoid lists constrain copy). Driven by `sessionPlayerMachine` XState machine for precise timing and transitions.

### 4.6 The 11 XState machines

| Machine | Role |
|---|---|
| appEntry | Onboarding + auth entry |
| dailyCycle | Morning / midday / evening / night gate transitions |
| home | Home screen experience |
| insights | Analytics / insights navigation |
| journal | Journaling flow |
| journey | Program / adaptive journey |
| notifications | Push / local notification handling |
| practice | Active practice session lifecycle |
| session | Generic session orchestration |
| sessionPlayer | Cinematic practice player variant |
| settings | Settings management |
| voice | Voice interaction (listening/processing/speaking) |

All 11 in `src/machines/*`; built with XState v5 `setup().createMachine()`.

### 4.7 Cross-cutting consumers

Every session path touches these shared services:

- **`getUserContext()`** (`supabase/functions/_shared/user-context.ts`, 553 lines) — "The Brain": identity, band, vLevel, dimensionBands, loops, gate, energy, theme, engineSignals, foundation, program, spiritual DNA, behavior (7–30d stats).
- **Adaptive Engine** (`_shared/adaptive-engine.ts`, `promptDirector.ts`, `consciousness/agents/*`) — per-turn directive: hidden stage 0–7, agent routing, insight depth, reveal level.
- **Composer** (`src/lib/composer/*`) — deterministic 3-layer composer: archetypes → ingredients → composer; weights `{loopMatch:3, practiceLevelFit:2, gateAlignment:2, freshness:1.5, energyFit:1, bandFit:1, slotBias:2.5, repetitionPenalty:-4}`.
- **Memory System** — extract → embed → consolidate → recall → sacred moments.
- **Loop Detector** — local keywords → live-detect AI → pattern-window cron → instant-pulse cron.
- **Guide / Master Roster** — 89+ entries, 4 selectors + crisis gate + guest summon protocol.

### 4.8 End-to-end trace: orb tap → spine score

1. User press-and-holds the orb (G1 local heuristic recommends a master/practice instantly).
2. Client invokes an edge function (auth + credits) → `getUserContext()` builds the full snapshot.
3. Composer / Sankalpa (`compose-session-v3`) produces a `plan` + `spineId`; or G2 starts a chat stream.
4. Session shell / sessionPlayer runs the steps, monitoring live signals (typing cadence, pauses, emotional language, biometrics).
5. Mid-session adaptation (`adapt-next-block`, `session-adapter`) can re-plan remaining steps if a loop or crisis signal fires.
6. Completion → `session-complete` → `score-session-spine` (karma + spine score).
7. Memory extract → embed → consolidate; dimensions/V-Level update via consciousness engine; next `getUserContext()` reflects the new state — the loop closes.

---

## PART 5 — ARCHITECTURE & DESIGN

### 5.1 State model

A minimal session state machine:

```ts
type SessionStatus = "created" | "started" | "paused" | "resumed" | "completed" | "aborted" | "timeout";

interface SessionContext {
  sessionId: string;
  userId: string;
  status: SessionStatus;
  cursor: number;               // index into steps[]
  steps: Step[];                // the plan (may be re-computed)
  completed: StepResult[];      // what has happened so far
  userInputs: Record<string, unknown>;
  signals: SessionSignal[];     // live signals observed during session
  gate: Gate; energy: Energy; timeBudgetMin: number;
  startedAt: string; updatedAt: string; completedAt?: string;
  spineId?: string;             // links to scored spine record
  adaptationCount: number;      // how many times the plan was re-computed
  guardsTriggered: string[];    // safety/crisis gates that fired
}
```

Transitions are guarded: e.g., `started → paused` only if `status == started`; `paused → resumed` requires a valid resumption token and a fresh `getUserContext()` re-read (state may have changed while idle).

### 5.2 Persistence & resumability

- **In-flight persistence:** Persist the context after every step completion and after every signal-driven adaptation. Use an append-only event log (`session_events`) so the cursor can be reconstructed even if the latest snapshot is corrupt.
- **Resumption token:** An opaque, signed token = `{sessionId, cursor, issuedAt, signature}`. On resume, validate signature, rehydrate context from the event log, re-read `getUserContext()` (because band/loops/gate may have changed during the gap), then continue at `cursor`.
- **Idle TTL:** Abort sessions idle > N minutes (default 30); on return, offer "resume where you left off" or "start fresh" — with anti-guilt framing (no penalty for gaps).
- **Offline:** Client caches the current plan in IndexedDB (TanStack Query persistence); on reconnect, reconcile with server state; prefer server as source of truth.

### 5.3 Concurrency & sessions

- **One active session per user at a time** (gate enforcement): `sessionOrchestrator`-style check before creating a new session; reject or offer to abandon the in-flight one.
- **Multi-device:** Session state lives server-side; the client is a thin renderer. The resumption token lets a user switch from mobile to web mid-session.
- **Actor model (optional):** If using XState actors or Durable Objects, one actor instance per session isolates state and serializes events — eliminates race conditions on concurrent inputs.

### 5.4 Timeouts, retries, and compensation

| Concern | Handling |
|---|---|
| Step timeout | Per-step `timeoutMs`; on timeout, fire `step.timeout` event → fallback step or abort with graceful message. |
| LLM failure | Retry with exponential backoff; degrade to cached/fallback content; never crash the session. |
| TTS/STT failure | Fall back to text-only mode; continue session without voice. |
| Compensation | If a step had side effects (e.g., wrote a journal entry) and a later step fails, log the saga; do not auto-delete user-created content. Mark session `aborted` and let the user resume. |
| Crisis gate | Any crisis keyword aborts the generative plan immediately and routes to crisis resources; overrides all other transitions. |

### 5.5 Versioning & migration of in-flight sessions

- **Plan versioning:** Each `plan` carries a `schemaVersion`. Older plans are executed by a compatibility adapter that maps old step kinds to new ones.
- **In-flight migration:** Do not mutate completed steps. When deploying a new planner version, new sessions use the new planner; in-flight sessions finish under the planner that created them. Optionally offer "re-compose with new version" as a user choice.
- **Spine immutability:** The scored `session_spine` is write-once; used as the ground truth for V-Level, memory, and analytics.

### 5.6 Security & input boundaries

- **Auth on every edge-function invocation** (JWT via Supabase); RLS enforces user-scoped data access. Most edge functions disable JWT verification internally and rely on RLS — document this explicitly.
- **Input sanitization:** All user-facing text (journal answers, chat messages) sanitized before LLM prompts to prevent prompt injection; crisis keywords scanned *first* (before any adaptive/generative call).
- **Output schema validation:** LLM-generated plans validated against a strict Zod/JSON-schema before the shell renders them; reject malformed plans and fall back to a safe default archetype.
- **No secrets in client:** API keys never shipped to the browser; all AI calls go through edge functions behind the AI Gateway (`_shared/ai-config.ts`).

---

## PART 6 — IMPLEMENTATION GUIDE

### 6.1 Step 1: Define the session contract

Decide: session duration model (fixed time budget vs. open-ended), step kinds, who authors content (static vs. AI-composed), and which safety gates apply (crisis, bypassing, band vocab). Write the contract as a TypeScript interface first — this becomes the boundary between client shell and planner.

### 6.2 Step 2: Choose the pattern

Use the §2.8 matrix:
- UI wizard / onboarding → state-machine (XState) or linear.
- Coaching with "unique every session" → generative shell + LLM planner.
- Dialogue → conversational streaming with guards.
- Multi-week curriculum → block-based around any intra-block pattern.
- Guided timed practice → cinematic/scripted.

### 6.3 Step 3: Model the state machine

Define states, events, transitions, guards, actions. For XState v5:

```ts
import { createMachine, assign } from "xstate";

const sessionMachine = createMachine({
  types: {} as { context: SessionContext; events: SessionEvent },
  initial: "created",
  context: { ...initialContext },
  states: {
    created: { on: { START: "started" } },
    started: {
      on: {
        STEP_COMPLETE: { actions: "advanceCursor" },
        ADAPT: { actions: "recomputePlan" },
        PAUSE: "paused",
        ABORT: "aborted",
      },
    },
    paused: { on: { RESUME: "started" } },
    completed: { type: "final" },
    aborted: { type: "final" },
  },
});
```

### 6.4 Step 4: Wire persistence

Persist context after each action; use an append-only event log; expose a `rehydrate(sessionId, token)` function that rebuilds context from the log + latest `getUserContext()`.

### 6.5 Step 5: Add adaptation / AI hooks

Insert adaptation points at: session start (re-read context), after each user input (conversational), and at block boundaries (block-based). Route through an adaptive-engine equivalent that returns a directive object, not raw text, so the shell can apply it deterministically.

### 6.6 Step 6: Observability

Emit events: `session.created`, `session.started`, `step.started`, `step.completed`, `session.adapted`, `session.completed`, `session.aborted`, `guard.triggered`. Correlate by `sessionId`; trace step-level LLM latency and token cost.

---

## PART 7 — OBSERVABILITY, TESTING, OPERATIONS

### 7.1 Metrics

| Metric | Why |
|---|---|
| Session completion rate | Flow health; drop-off points |
| Steps per session | Depth vs. time budget |
| Adaptations per session | How often the plan had to change |
| Guard triggers | Safety events (crisis, bypassing) |
| LLM latency / tokens per session | Cost and UX |
| Resumption rate | Session durability in practice |
| Time-to-first-step | Orb-to-content latency |

### 7.2 Tracing

Distributed trace per session: `sessionId` → span per step → child spans for LLM/TTS/STT calls. Use the trace ID in logs so a support engineer can replay a session end-to-end.

### 7.3 Testing strategies

- **Unit:** Pure transition functions (guard evaluation, cursor advancement, archetype selection).
- **Machine-based:** XState model-based testing — simulate every event sequence and assert no invalid state.
- **Snapshot:** LLM plans are non-deterministic; snapshot the *schema* and assert invariants (every step has a kind + duration; total minutes == time budget after renormalization).
- **End-to-end:** Playwright screen-capture for the orb → session → completion path.

### 7.4 Operational runbook

- Session stuck in `paused` → resume token expired → offer fresh session.
- LLM rate-limit → degrade to static fallback archetype (zero breakage).
- Crisis gate firing repeatedly → escalate to human review queue; do not automate crisis resolution.
- Spine scoring failing → queue for async re-score; do not block session completion UX.

---

## PART 8 — ANTI-PATTERNS & RISKS

1. **Storing AI-generated plans as code.** Plans should be data (JSON), versioned and schema-validated, never eval'd.
2. **No resumability.** A session that dies on tab close is a broken product for mobile/web.
3. **Skipping the crisis gate.** Safety checks must run *before* any generative call, not after.
4. **Client as source of truth.** Session state must be server-persisted; clients are renderers.
5. **Unbounded step count.** Cap steps per session and minutes per session; renormalize to time budget (as the Composer does).
6. **Ignoring adaptation.** A plan computed at session start that never changes, despite live signals, is a static PDF dressed as AI.
7. **Gamifying progress.** Anti-guilt design: no streak loss, no shaming on regression; level drops carry no penalty (this repo's policy).

---

## PART 9 — GLOSSARY

- **Cursor:** Pointer to the current step in a session plan.
- **Spine:** Canonical record of a completed session (steps, timings, scores).
- **Sankalpa Engine:** This repo's `compose-session-v3` — LLM-composed step plan + deterministic shell.
- **Archetype:** High-level session shape (opening, inquiry, teaching, practice_deep, integration, release, micro).
- **Ingredient:** Fillable unit dropped into an archetype slot (practice/knowledge/reflection/micro_action).
- **Guard:** Precondition that must hold before a transition.
- **Adaptation point:** Where the remaining plan may be re-computed from live signals.
- **Resumption token:** Opaque token to rehydrate an in-flight session.
- **G1–G4:** The four session-engine generations coexisting in this repo.

---

## PART 13 — ROADMAP TO THE FULL 10K-LINE REFERENCE

This document is Volume 1 (foundation). Planned follow-up volumes:

| Volume | Content | Approx. lines |
|---|---|---|
| Vol 1 (this) | Foundations, pattern catalog, framework landscape, case study, architecture, implementation, ops | ~2,000 |
| Vol 2 | Framework deep-dives: XState v5 recipes, LangGraph session graphs, Temporal durable sessions, Step Functions templates (working code) | ~3,000 |
| Vol 3 | Building a generative session shell end-to-end (planner schema, cursor runtime, adaptation engine, safety guards) with reference implementation | ~2,500 |
| Vol 4 | Observability & testing: tracing schema, metric definitions, test suites, chaos/resilience testing for sessions | ~1,500 |
| Vol 5 | Production runbooks, migration strategies, multi-tenant session isolation, billing/credit integration per session | ~1,000 |

Total target ≈ 10,000 lines across Volumes 1–5.

**To continue:** Tell me which volume to write next, or which section you want expanded first (e.g., working XState session machine, the generative shell runtime, or the framework comparison with code).
