# 2. Session Engine (sessionEngine / sessionOrchestrator / sessionFlow / session-shell / machines)

**Files:**
- `src/lib/sessionEngine.ts` — AI-directed master→user recommendation heuristics
- `src/lib/sessionOrchestrator.ts` — per-session-of-the-day structural planner (client-side, deterministic)
- `src/lib/sessionFlow.ts` — thin delegator to `promptDirector` for chat system prompts
- `src/lib/session-shell/{types.ts,api.ts,SessionShellContext.tsx}` — the generic runtime shell for AI-composed sessions
- `src/machines/sessionMachine.ts`, `src/machines/practiceMachine.ts` — XState machines for chat-session and practice-tab UI state

This "Session Engine" area is really **three parallel layers that evolved over time** and are
not a single call chain:

### 2.1 `sessionEngine.ts` — pattern-based master recommendation (per temple.md §29)

Exports `SessionRecommendation` (masterId/Name/Image, sessionTitle, sessionType
`"practice"|"journey"|"program"|"guidance"`, durationMinutes, `reason`, `timeOfDay`, `whyThis:
string[]`, `urgency: "gentle"|"normal"|"important"`). `detectPatterns(profile: UserProfile)`
keyword-scans `profile.recentReflections` for restlessness/calm/anger/sadness/clarity, plus
time-of-day performance flags. `generateSessionRecommendation(profile, masterName, masterImage)`
is a long if/else cascade: restlessness+struggling → gentle 10-min breathwork; anger pattern →
15-min "Observing Resistance"; `missedDays > 5` → 5-min "Just Sit"; thriving+clarity → 35-min
deep self-inquiry; otherwise falls through to **time-of-day defaults** (morning=Breathwork &
Activation 15min, afternoon=Midday Reset 5min, evening=Self-Inquiry & Reflection 30min,
night=Yoga Nidra 20min). `generateMissedDayOutreach(profile, ...)` produces reach-out copy for
3-5 vs 5+ missed days. This module is pure/no I/O; it's a rules engine consumed by whichever
caller has a `UserProfile` (imported from `adaptiveJourneyEngine.ts`, §3).

### 2.2 `sessionOrchestrator.ts` — "session N of today" structural planner

Purely deterministic, no AI, no I/O (localStorage-only persistence helpers at the bottom). Given
an `OrchestratorContext` (hour, sessionsToday, lastSessionToday, lastTheme, daysSinceLastSession,
userName, guruName/Style, bandLevel, activeLoops, weakestDimension, energy, mood, todayTheme,
language), `orchestrateSession(ctx)` produces a `SessionPlan`:

```ts
export type SessionMode = "teach" | "practice" | "inquiry" | "reflect" | "blend";
export type PracticeKind = "witness" | "breath" | "body" | "mantra-jap" | "self-inquiry"
  | "loving-kindness" | "open-awareness" | "free-form";

export interface PracticeBlock {
  kind: PracticeKind; durationSec: number; allowMidPrompts: boolean;
  intentionPrompt: string; midPrompts: string[]; closingPrompt: string;
  visual: "orb-pulse" | "orb-still" | "candle" | "horizon";
}
export interface SessionPlan {
  id: string; sessionNumber: number; gate: GateId; mode: SessionMode; title: string;
  rationale: string; greeting: string; theme: { title, intention };
  knowledge?: { heading, body }[]; practice?: PracticeBlock;
  closing: { feedbackPrompt, prediction?, nextHint? }; estimatedMinutes: number;
}
```

Internal helpers: `pickPractice()` (gate/dimension/loop/rotation-driven kind selection —
night→breath/loving-kindness, midday→breath, dimension-led if a weakest dimension exists, loop-led
alternation between self-inquiry/witness, else a 7-item rotation keyed by session number),
`pickMode()` (night=reflect, midday=practice, first session=blend, else a mode rotation),
`pickDuration()` (base minutes per PracticeKind × energy multiplier × gate multiplier, e.g. midday
gateMult=0.4), `buildGreeting()` (context-aware opener referencing gap days / continuation of last
session), `buildKnowledge()` (static per-PracticeKind teaching blurbs, prefixed with a theme block
if present), `buildPractice()` (intention/closing prompt maps per kind; only `self-inquiry` and
`free-form` get `allowMidPrompts`), `buildClosing()` (canned "what shifted" prompt + a `prediction`
line for practice/inquiry modes + a `nextHint` teaser keyed by gate). `orchestrateSession()`
assembles all of the above and computes `estimatedMinutes` from practice + knowledge blocks + 1
reflection minute. Bottom of file: localStorage helpers `loadTodaysSessions/appendTodaysSession`
(keyed `orb-sessions-YYYY-M-D`) and `rememberLastTheme/loadLastTheme` (single key
`orb-last-theme`) — this whole module appears tied to an "Orb Session" runtime (ids prefixed
`orb-...`), a separate/older UI surface from the `session-shell` generative shell below.

### 2.3 `sessionFlow.ts` — chat prompt delegator

Documents its own history: *"Replaced the old rigid Morning 9-step / Evening 8-step / Night PHASE
1-5 scripts with a context + state driven directive... The actual cognitive routing happens inside
the edge functions via `_shared/adaptive-engine.ts`. Here we only emit a HIGH-LEVEL surface
directive."* Exports `SessionType` (morning/evening/night), `SessionPhase` enum (unused directly
by exported functions but kept for typing), `ThemeContext`, `UserProfile` (shadow-named, distinct
from `adaptiveJourneyEngine`'s `UserProfile`), `MorningSessionResult`, `DayActivity`,
`MasterContext`, and the umbrella `SessionFlowContext`. Public API:
`buildSessionSystemPrompt(ctx)` / `buildSessionFirstMessage(ctx)` (and back-compat aliases
`generateSystemPrompt`/`generateFirstMessage`) both just call `buildDirectorPrompt()` from
`./promptDirector` after mapping `SessionFlowContext` → `DirectorContext` via `toDirectorCtx()`.
Two unused-looking internal builders (`buildBasePrompt`, `buildAdaptiveSurface`) remain in the file
as legacy/reference material — `buildAdaptiveSurface` explicitly ends with a comment telling the
edge function's adaptive engine to have "the final word," i.e. this module only frames intent; the
edge function (`_shared/adaptive-engine.ts`, not deep-dived here) does the heavy per-turn routing.
Also exports the small pure helper `getSessionTypeFromTime(hour)`.

### 2.4 `session-shell/*` — the generic runtime shell for AI-composed sessions

This is the **actual UI-facing consumer of composed session plans** (both `generate-session-agenda`
and `compose-session-v3`).

`types.ts` mirrors the edge-function payload shapes 1:1: `StepKind` (same 9-way union as v3's
`StepKind`), `SessionStep` (kind, title, prompt?, params?, optional?, est_minutes, whyForYou?,
signalRef?), `SessionPlanMeta` (vLevelStart, dimensionBandsStart, composedBy,
languageRefinedBy, archetype, archetypeReason, toneWords, whyThisSession), `SessionPlan` (id,
intent, intro, steps, `_meta?`), `CompletedStepRecord`, `DimensionNudge`, and
`SessionCompleteResult` (ok, sessionId, completedStepCount, durationMs, loopsTouched, karmaEarned,
shiftSummary?, nextTeaser?, vLevelDelta?, dimensionNudges?, alreadyCompleted?, qualityScore?,
primaryPractice?).

`api.ts` is the client-side API surface:
- `startGenerativeSession({intent?, slot?, themeId?, timeBudgetMin?, energy?})` — first calls
  `ensureCreditsForSession()` (checks `user_credits.balance_paise >= 50`, else redirects via
  `triggerInsufficientCredits()`). **(Verified 2026-11-14: the `sankalpaV3Enabled()` localStorage
  flag no longer exists.)** It invokes `compose-session-v3` unconditionally and, on success, returns
  `{ sessionId: data.spineId ?? data.plan.id, plan: data.plan }` — this is the literal wiring point
  connecting compose-session-v3 (§1.5) into the session-shell runtime. On failure it falls through
  to the in-process `ConsciousnessOrchestrator` (`@/lib/consciousness/orchestrator`), records the
  reason on `_meta.fallbackReason`, and emits a `session_degraded` console event. A credits (402)
  failure never downgrades: it rethrows so the paywall is not bypassed.
- `startGenerativeSessionLocalFallback(...)` — third tier: a purely local, deterministic 4-step
  plan used only if the orchestrator path also throws. Its `_meta.composedBy` is `local-fallback`;
  `_meta.fallbackReason` carries the reason string and the intro card shows a short notice.
- `loadGenerativeSession(sessionId)` — rehydrates a plan from `sessions.summary` (JSON-encoded).
- `completeGenerativeSession({sessionId, completedSteps, skippedSteps, totalSeconds})` — invokes
  `session-complete` edge function, then fire-and-forget awards karma via RPC
  `award_karma_event` with a base score derived from step count + reflective-step bonus.
- `scoreSessionSpine({spineId, finalUserSentence?, stepCompletions?, durationSec?, mood?})` —
  invokes `score-session-spine` edge function (Sankalpa T5), safe/fire-and-forget, used to close
  the loop on `session_spine` quality scoring that feeds v3's "adaptive history" block.

`SessionShellContext.tsx` is a React context/provider (`SessionShellProvider`) that drives the
step-by-step UI: `cursor` semantics are `-1 = agenda card`, `0..N-1 = step index`,
`N = ready-to-complete`. It **persists progress to localStorage** (`session-shell:{sessionId}` key)
on every state change so an interrupted session resumes exactly where left off — `readPersistedShell`
/`clearPersistedShell` are exported for external surfaces (e.g. Home) to peek at in-progress state.
Core actions: `beginFromAgenda()` (cursor -1→0), `goToNext(payload?)` (records the current step's
duration + payload into `completedSteps`, advances cursor), `skipCurrent()` (records into
`skippedSteps` instead, advances). `useSessionShell()` hook throws if used outside the provider.

### 2.5 XState machines: `sessionMachine.ts` and `practiceMachine.ts`

`sessionMachine.ts` (`src/machines/sessionMachine.ts`) models a **chat-based** session lifecycle
(distinct again from session-shell's step-based model) — states `idle → starting → active →
ending → completed → (RESET) idle`. Context: `{ sessionId, timeSlot, themeId, themeName,
messages: {role,content}[], error, isStreaming }`. Events include `START_SESSION`,
`SESSION_CREATED`, `ADD_USER_MESSAGE`, `START_STREAMING`/`STREAM_DELTA`/`STREAM_DONE` (streaming
assistant text token-by-token into the last message), `END_SESSION`/`SESSION_ENDED`, `ERROR`,
`RESET`. This machine is consumed in `src/pages/Guide.tsx` (`useMachine(sessionMachine)` — see §4)
to drive the chat UI's request/stream/complete cycle, so it is the state layer under Guide's chat,
not under session-shell.

`practiceMachine.ts` models the simpler **Practice tab** UI: states `idle → completing → idle`,
context `{ activeTab: 'observation'|'daily', completingTaskId, reflection, error }`. Guard
`hasReflection` requires non-empty reflection text before `SUBMIT_OBSERVATION` can transition;
`COMPLETE_DAILY_TASK` transitions unconditionally. Events: `SWITCH_TAB`, `SET_REFLECTION`,
`SUBMIT_OBSERVATION`, `COMPLETE_DAILY_TASK`, `TASK_COMPLETED`, `TASK_ERROR`, `DISMISS_ERROR`.

### 2.6 How the pieces actually chain

```
Guide.tsx (chat UI)
  └─ sessionMachine (xstate)  — idle/starting/active/ending lifecycle for the chat itself
  └─ useSessionFlow() hook    — likely wraps sessionFlow.ts's buildSessionSystemPrompt/FirstMessage
        └─ promptDirector.ts  — actual prompt assembly (not deep-dived)
        └─ edge function's adaptive-engine.ts — per-turn state routing (not deep-dived)

startGenerativeSession() (session-shell/api.ts)
  └─ [flag off] generate-session-agenda edge fn  (legacy, not deep-dived)
  └─ [flag on]  compose-session-v3 edge fn (§1.5) → SessionPlan
        └─ SessionShellProvider (session-shell/SessionShellContext.tsx) drives step cursor UI
        └─ completeGenerativeSession() → session-complete edge fn + karma RPC
        └─ scoreSessionSpine() → score-session-spine edge fn → session_spine.quality_score
                                   (read back into compose-session-v3's "adaptive history" next time)

sessionOrchestrator.ts / sessionEngine.ts
  — separate, older/parallel deterministic planners (localStorage-backed "Orb Session" and
    master-recommendation heuristics respectively); not directly wired into session-shell, and
    likely represent an earlier architecture iteration or a different UI surface still in use
    elsewhere in the app (not confirmed by direct import-graph tracing in this pass).
```


### 2.7 Wired reality (verified 2026-11-14)

```
SessionStart (Home / Guide)
  └─ startGenerativeSession()                     src/lib/session-shell/api.ts
       ├─ 1. compose-session-v3  (server AI)      supabase/functions/compose-session-v3
       ├─ 2. ConsciousnessOrchestrator (client)   src/lib/consciousness/orchestrator
       │      └─ _shared engines via src/supabase/_shared/* re-exports (canonical Deno code)
       └─ 3. startGenerativeSessionLocalFallback  (deterministic, no AI)
```

Two corrections to the earlier sections:

- `src/supabase/_shared/{adaptive-engine,arcEngine,chakraEngine,composer,loopMap,practiceMatrix,themeOrchestrator,voice-lineage}.ts`
  used to be small **no-op stubs** (`composeSession` returned an empty plan, `detectBlockedChakra`
  returned `null`, `buildPracticeMatrixSignal` returned `[]`). They are now one-line re-exports of
  the canonical `supabase/functions/_shared/*` implementations, so the client orchestrator and the
  edge functions run the same logic. `long-term-memory.ts` re-exports the client memory helpers
  (`embedText` now produces real embeddings instead of a zero vector).
- `ConsciousnessOrchestrator` is typed against those canonical APIs (AdaptiveContext.stage,
  StageInput.message, RotationContext.userId, composer `ComposerContext`, `ArchetypeId`,
  `ChakraSignal.primary`, `PracticeMatrixSignal.mostStressedDomain`), so a failure now means an
  actual runtime error rather than a silently empty signal.

---

