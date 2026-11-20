# 2. XState Machines

`src/machines/*.ts` contains **10 machines**, all written with XState v5's `setup({...}).createMachine({...})` builder API (except `notificationsMachine`, which still uses the older `createMachine` call directly — a small inconsistency, `notificationsMachine.ts:28`). None use actors/spawned children or invoked services — every machine is a **pure UI/state-shape reducer**; actual async work (Supabase calls, edge-function fetches) happens in the React components that drive `send()`, with results fed back in as events. This is a deliberate "thin machine, fat component" style — the machines model *transitions*, not side effects.

### 2.1 `appEntryMachine.ts` (98 lines)

**Purpose**: gate the `/app` shell — decide whether to show the loader, onboarding, or the app.

- **Context**: `{ userId: string|null, onboarded: boolean }`
- **States**: `checking → { unauthenticated | onboarding | ready }`
- **Events**: `AUTH_FOUND {userId, onboarded}`, `AUTH_NOT_FOUND`, `AUTH_LOST`, `ONBOARDING_COMPLETE`
- **Guards**: inline (`!event.onboarded`) branches `AUTH_FOUND` into `onboarding` vs `ready` — appears twice, once from `checking` and once from `unauthenticated` (so a session that resolves *late*, e.g. slow `getSession()` or HMR, can still recover the user into the right state instead of stranding them on `/auth`).
- **Actions**: `assign` of `userId`/`onboarded` on every transition.
- **Notable resilience feature**: `ready` state accepts `AUTH_LOST → unauthenticated` (so a mid-session sign-out kicks the user back out) and re-accepts `AUTH_FOUND` without changing state, just refreshing context (handles auth-token refresh events firing repeatedly).
- **Used in**: `src/pages/AppEntry.tsx:36` — `useMachine(appEntryMachine)`. The component:
  1. Waits for `useAuthReady()` (`AppEntry.tsx:37`).
  2. On resolve, fetches `profiles.onboarded` (`fetchProfile`, `:55-68`) and sends `AUTH_FOUND`/`AUTH_NOT_FOUND`.
  3. Renders `<Onboarding>` (imported from `QuickOnboarding.tsx`) while `state.matches("onboarding")` (`:183-190`).
  4. Renders `<AppLayout/>` (the whole authenticated app shell) while `state.matches("ready")` (`:192-200`).
  5. A 6-second safety timeout (`:145-165`) force-resolves the `checking` state if Supabase's `getSession()` hangs, re-querying `auth.getSession()` directly as a fallback — defensive coding against auth race conditions.

### 2.2 `dailyCycleMachine.ts` (90 lines)

**Purpose**: track the four daily "gates" (morning/midday/evening/night) and today's task/streak counters, independent of navigation.

- **Context**: `{ currentGate: GatePhase, morningCompleted, middayCheckedIn, eveningReflected, nightClosed, tasksCompleted, totalTasks, streak }`
- **`GatePhase`**: `'morning_gate' | 'midday_pulse' | 'evening_sandhya' | 'night_sanctuary'` — note the Sanskrit-flavored naming (*sandhya* = twilight ritual, *sanctuary* for night) consistent with the temple aesthetic (§4).
- **Single state `active`** (this machine is really a context-accumulator, not a true state machine with meaningful state changes) with events: `TIME_CHECK` (recomputes gate from wall-clock via `getGateFromTimeSlot(getCurrentTimeSlot())`), `MORNING_DONE`, `MIDDAY_CHECKIN`, `EVENING_REFLECTED`, `NIGHT_CLOSED`, `TASK_COMPLETED` (increments counter), `SET_DATA` (bulk-hydrate from a query result).
- **Used in**: `src/pages/Home.tsx:286,402-409` — hydrated from the `useThemeOfDay()` query result (counts completed morning/evening sessions and daily tasks) to drive UI badges/progress indicators.

### 2.3 `homeMachine.ts` (55 lines)

**Purpose**: model the tap-to-navigate interaction on Home's time-slot grid.

- **Context**: `{ selectedSlot: TimeSlot|null, navigateTo: string|null }`
- **States**: `browsing ⇄ navigating`
- **Guard `isClickable`**: rejects `SELECT_SLOT` events where `status` is `'locked'` or `'completed'`.
- **On success**: computes `navigateTo = /app/guide?slot=${slot}&themeId=${themeId}` and moves to `navigating`; `NAVIGATED` event resets back to `browsing`.
- **Used in**: `src/components/home/AdaptiveSlotGrid.tsx` — the grid of morning/midday/evening/night cards on Home routes taps through this machine before calling `navigate()`, keeping the "is this slot clickable" logic out of JSX conditionals.

### 2.4 `journalMachine.ts` (95 lines)

**Purpose**: the compose/save/delete flow for `/app/journal`.

- **Context**: `{ title, content, mood, deletingId, error }`
- **States**: `viewing → composing → saving → viewing`, plus a parallel `viewing → deleting → viewing` path.
- **Guard `hasContent`**: blocks `SUBMIT` unless `content.trim().length > 0`.
- **Events**: `OPEN_FORM/CLOSE_FORM`, `SET_TITLE/SET_CONTENT`, `TOGGLE_MOOD` (toggles off if same mood tapped twice — `context.mood === event.mood ? '' : event.mood`), `SUBMIT`, `ENTRY_SAVED/ERROR`, `DELETE_ENTRY{id}/ENTRY_DELETED`.
- **Used in**: `src/pages/Journal.tsx` — the mutation functions (`useMutation` from React Query) call `send({type:'ENTRY_SAVED'})`/`send({type:'ERROR', message})` from their `onSuccess`/`onError` callbacks, i.e. the machine is a **derived UI-state layer on top of** React Query's own request state.

### 2.5 `sessionMachine.ts` (139 lines) — the largest/most important machine

**Purpose**: model a live Guide chat session end-to-end, including **token-by-token streaming**.

- **Context**: `{ sessionId, timeSlot, themeId, themeName, messages: {role,content}[], error, isStreaming }`
- **States**: `idle → starting → active → ending → completed → (RESET) → idle`
- **Events**: `START_SESSION{timeSlot,themeId,themeName}`, `SESSION_CREATED{sessionId}`, `ADD_USER_MESSAGE{content}`, `START_STREAMING` (pushes an empty assistant message placeholder), **`STREAM_DELTA{content}`** (appends `content` onto the last assistant message — this is the crux of the whole streaming UX; see §5), `STREAM_DONE`, `END_SESSION → SESSION_ENDED`, `ERROR{message}`, `RESET`.
- **`STREAM_DELTA` action** (`:89-100`) is worth reproducing since it's the canonical "smooth streaming" reducer pattern used across the app:
  ```ts
  STREAM_DELTA: {
    actions: assign({
      messages: ({ context, event }) => {
        const msgs = [...context.messages];
        const last = msgs[msgs.length - 1];
        if (last?.role === 'assistant') {
          msgs[msgs.length - 1] = { ...last, content: last.content + event.content };
        }
        return msgs;
      },
    }),
  },
  ```
- **Used in**: `src/pages/Guide.tsx` (3 call sites at `:323, 437, 671`) — `send({ type: "STREAM_DELTA", content: sessionFlow.firstMessage })` for a scripted opener, and again inside the `useGuideChat().streamChat({ onDelta: (text) => send({type:'STREAM_DELTA', content:text}) })` callback for live AI responses (see §5.3 for the underlying typewriter/SSE mechanics).

### 2.6 `voiceMachine.ts` (86 lines)

**Purpose**: coordinate mic-recording ⇄ transcription ⇄ TTS playback, independent of session state.

- **Context**: `{ voiceEnabled: boolean, error: string|null }`
- **Top-level `on: { TOGGLE_VOICE }`** (declared outside `states`, so it works from any state) flips `voiceEnabled` globally.
- **States**: `idle ⇄ recording ⇄ transcribing → idle`, and `idle ⇄ speaking → idle`; `speaking` can also transition directly into `recording` (`START_RECORDING` — i.e. barge-in / interrupt-while-speaking is a first-class transition, not an edge case).
- **Events**: `START_RECORDING/STOP_RECORDING`, `TRANSCRIPTION_DONE/TRANSCRIPTION_ERROR{error}`, `SPEAK/SPEAK_DONE/SPEAK_ERROR/STOP_SPEAKING`, `MIC_ERROR{error}`.
- **Used in**: `src/hooks/useVoiceChat.ts` — wraps this machine together with actual `MediaRecorder`/edge-function calls to `stt-listen` and `tts-speak` (see §5.4).

### 2.7 `practiceMachine.ts` (72 lines)

**Purpose**: `/app/practice` tab-switch + task-completion flow.

- **Context**: `{ activeTab: 'observation'|'daily', completingTaskId, reflection, error }`
- **States**: `idle ⇄ completing`
- **Guard `hasReflection`**: `SUBMIT_OBSERVATION` requires non-empty reflection text; `COMPLETE_DAILY_TASK` has no such guard (daily tasks can be marked done without writing anything).
- **Used in**: not directly found wired into a page component in this pass (no `practiceMachine` import outside `src/machines/`), suggesting it may be a **planned/legacy machine** superseded by the newer `session-shell`/`PracticeRunControllerContext` imperative flow (`src/contexts/PracticeRunControllerContext.tsx`, mounted in `AppLayout.tsx:20,304`) that drives the full-screen `PracticeRunFullScreen` overlay outside of XState.

### 2.8 `settingsMachine.ts` (118 lines)

**Purpose**: `/app/settings` pause-account / sign-out flow.

- **Context**: `{ isPaused, pausedAt, pauseReason, pauseDays, error }`
- **`calcPauseDays()`** helper (`:25-29`) derives days-since-pause from `pausedAt` on every `PROFILE_LOADED`/`PAUSE_SUCCESS` event — pure derived state kept in context rather than recomputed in the component.
- **States**: `idle → ready ⇄ {pausing, resuming, signingOut}`
- **Used in**: `src/pages/Settings.tsx` — "Pause practice" (a soft-delete-like feature letting users temporarily stop notifications/streak pressure without deleting their account) and sign-out both round-trip through this machine so the UI can show a `pausing`/`resuming`/`signingOut` spinner state distinct from a generic `isLoading` boolean.

### 2.9 `notificationsMachine.ts` (108 lines)

**Purpose**: in-app notification bell state (`src/components/NotificationBell.tsx`) and the settings history list (`src/components/settings/NotificationHistory.tsx`).

- Written with plain `createMachine` (not `setup()`), typed via `types: {} as {context; events}`.
- **Context**: `{ notifications: Notification[], unreadCount, error }` — `Notification` type mirrors the `notifications` table (`type: insight|streak|milestone|system|prediction|checkin|task_followup`).
- **States**: `idle ⇄ loaded ⇄ error`, all three accepting `LOADED` to re-hydrate.
- **`unreadCount` is recomputed from the notifications array on every `LOADED`/`NEW_NOTIFICATION`**, and *decremented* precisely in `MARK_READ` by checking whether the target was actually unread before flipping it (`:75-78`) — avoids double-decrement bugs.
- **`NEW_NOTIFICATION`** is fed by a **Supabase Realtime subscription** — see §5.5 — prepending the new row and bumping the counter live.
- **Used in**: `src/hooks/useNotifications.ts`.

### 2.10 `insightsMachine.ts` (72 lines)

**Purpose**: `/app/analytics` timeframe selector + fetch lifecycle.

- **Context**: `{ timeframe: 7|14|30, error }`
- **Top-level `on: { SET_TIMEFRAME }`** (again declared outside `states`, so switching timeframe works no matter what fetch state you're in).
- **States**: `idle → loading ⇄ {ready, error}`, all re-enterable via `REFRESH`/`FETCH_START`.
- **Used in**: `src/hooks/useInsights.ts` and `src/components/analytics/InsightsLayer.tsx` — the timeframe buttons (7/14/30 days) drive React Query's `queryKey`, with this machine tracking the *loading chrome* independently.

### 2.11 Cross-cutting observations

- **Games use machines heavily too**: the grep for machine usage turned up ~28 files under `src/games/games/*.tsx` importing from `src/machines/` (mostly `notificationsMachine`/`insightsMachine` indirectly via shared hooks, or possibly their own local per-game machines not enumerated in `src/machines/` — each game likely defines an inline `setup().createMachine()` for its own multi-step interaction, following the same idiom as the shared machines).
- None of the machines use `invoke` for actors or promises — all async side effects are performed in the calling component/hook and reported back via plain events (`ERROR`, `*_DONE`, `*_SUCCESS`). This keeps the machines synchronous, trivially testable, and framework-agnostic, at the cost of components needing to carefully sequence `send()` calls around their own `async/await`/`useMutation` callbacks.
- Every machine is mounted via `@xstate/react`'s `useMachine()` **locally inside a single page/component** — there is no global/App-level XState "root machine"; each page owns its own machine instance, and cross-page state instead flows through React Query cache + Supabase, not through XState context.

---
