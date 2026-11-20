# 5. Network Layer

### 5.1 Edge function invocation patterns

The backend is **~115 Supabase Edge Functions** under `supabase/functions/*` (Deno runtime, `serve()` from `std/http/server.ts`). The canonical pattern, illustrated by `guide-chat/index.ts`:

1. **CORS preflight** handling (`OPTIONS` → empty 204-ish response with `corsHeaders`).
2. **Auth extraction**: read `Authorization: Bearer <token>` header, construct a **user-scoped** Supabase client (`createClient(url, ANON_KEY, {global:{headers:{Authorization: authHeader}}})`) so RLS applies to any query made with it, then call `supabase.auth.getUser()` to resolve `user.id` — reject with 401 if missing/invalid (`guide-chat/index.ts:29-45`).
3. A **second, service-role client** (`admin = createClient(url, SERVICE_ROLE_KEY)`) is created for privileged operations that must bypass RLS (crediting/debiting, cross-user writes) — e.g. the atomic credit check `admin.rpc("check_credit_balance", {p_user_id, p_min_balance: 50})` (`:52`), returning HTTP `402 insufficient_credits` if the user can't afford the call. This **RPC-gated pre-check pattern** is presumably repeated across every AI-calling function (composed session, journal-reflect, decode-dream, etc.) given the shared `_shared/ai-pricing.ts` and `_shared/billing-from-req.ts` helpers imported project-wide.
4. **Function-to-function composition**: `guide-chat` itself calls **`session-adapter`** via an internal `fetch()` to `${supabaseUrl}/functions/v1/session-adapter` on the first message of a session (`:66-77`), forwarding the caller's own `Authorization` header — i.e. edge functions call each other over HTTP rather than importing shared logic directly for this particular concern, likely so `session-adapter`'s decision (master/mode/practice adaptation) can be logged/audited/reused independently and evolve on its own release cadence.
5. **Shared modules** (`supabase/functions/_shared/*.ts`) factor out cross-cutting concerns: `ai-config.ts` (`aiGatewayFetchWithLang` — a wrapper presumably routing to whatever LLM gateway + injecting language), `ai-pricing.ts` (`computeChargedPaise`), `voice-lineage.ts` (`buildElderVoice`, `buildMasterVoice`, `MASTER_DOSSIERS`, `VOICE_TAIL_REMINDER` — the per-master persona/prompt-engineering data), `adaptive-engine.ts` (`buildAdaptiveDecision`), `guest-masters.ts` (`buildCouncilBriefing` — for multi-master "council" sessions), `billing-from-req.ts`, `human-presence.ts` (`HUMAN_PRESENCE_PROMPT` — a shared system-prompt fragment nudging the AI to sound human rather than robotic), `long-term-memory.ts` (`buildLongTermMemoryBlock`, `embedUtterance` — RAG memory injection), `kundli-context.ts` (astrology context block).

### 5.2 React Query usage

`QueryClient` is configured once in `App.tsx:249-258` with product-tuned defaults: `retry: 2`, `staleTime: 5 min`, `gcTime: 24h`, `refetchOnWindowFocus: false`. It's wrapped in `PersistQueryClientProvider` (`@tanstack/react-query-persist-client`) with a **custom IndexedDB persister** (`src/lib/queryPersister.ts`, `indexedDBPersister`) and a manually-bumped `buster: 'v2-journey-day-fix'` string (`App.tsx:264`) — i.e. cache invalidation across app deploys is done by **hand-editing a version string in code**, a lightweight-but-manual alternative to content-hash busting. Every domain has a dedicated `use<Domain>()` hook (`useThemeOfDay`, `useCredits`, `useConsciousnessEngine`, `useNotifications`, `useInsights`, `usePreJourney`, `useFoundationCourse`, `useActiveGuruProgram`, `useNextSession`, `useOrientation`, `useKarma`, etc.) that wraps a Supabase `select`/RPC or an edge-function `fetch` in `useQuery`, and mutation hooks (`useRegenerateTheme`, `useAwardKarmaEvent`, journal save/delete) wrap `useMutation`, feeding results back into the local XState machine via `send()` as described in §2.

### 5.3 Streaming (`STREAM_DELTA`)

`useGuideChat.ts` (`src/hooks/useGuideChat.ts`) is the client-side counterpart to `guide-chat`'s SSE output. Rather than pushing raw network chunks straight into React state (which would look "bursty" — large chunks arriving in irregular jumps), it implements a **typewriter smoothing queue** (`:31-59` and beyond, header comment: *"smooth bursty SSE chunks into a steady character stream so users see a ChatGPT-like progressive reveal even when the gateway flushes large chunks at once"*):
- Incoming SSE text is appended to a `pending` buffer.
- A `setInterval`-driven flush timer releases `CHARS_PER_TICK = 2` characters every `TICK_MS = 18` ms (~110 chars/sec) regardless of how the underlying chunks actually arrived.
- A separate **tag parser** strips/holds `[GUEST:masterId]...[/GUEST]` control sequences the model may emit mid-stream to signal a "guest master" speaking inside a Council session, buffering partial bracket sequences (`tagBuffer`) so a tag split across two network chunks doesn't leak literal `[GUEST:` text onto screen, and fires `onSpeakerChange(speakerId|null)` when a guest starts/stops speaking.
- Only the **visible, tag-stripped** text is fed to `onDelta`, which the page (`Guide.tsx`) forwards straight into `send({type:'STREAM_DELTA', content: text})` on the `sessionMachine` (§2.5), whose reducer appends it onto the last assistant message in `context.messages`.
- `onDone`/`onError` map to `STREAM_DONE`/`ERROR` machine events, and karma is awarded (`useAwardKarmaEvent`) as part of the same hook.

### 5.4 TTS / STT

Two dedicated edge functions, `tts-speak` and `stt-listen`, back the voice loop modeled by `voiceMachine` (§2.6): the `useVoiceChat.ts` hook records via the browser `MediaRecorder`, uploads/POSTs the audio blob to `stt-listen` for transcription (driving `START_RECORDING → STOP_RECORDING → transcribing → TRANSCRIPTION_DONE/ERROR`), and separately posts assistant text to `tts-speak` to receive synthesized audio for playback (`SPEAK → speaking → SPEAK_DONE/ERROR`), with `STOP_SPEAKING`/interrupt-to-`START_RECORDING` handling barge-in.

### 5.5 Realtime

Supabase Realtime channels are used sparingly and specifically for **live, server-pushed events** rather than as a general data-sync mechanism (most data still flows through React Query polling/refetch):
- `useConsciousnessBus.ts:54` — subscribes to `channel('consciousness-bus:${userId}')`, presumably broadcasting engine-side events (new insight computed, theme evolved, companion noticed something) so the UI can react without polling; consumed ambiently by `ConsciousnessBusListener` mounted in `AppLayout`.
- `useNotifications.ts:43` — subscribes on a per-user channel to receive new `notifications` rows in real time and dispatch `NEW_NOTIFICATION` into `notificationsMachine` (§2.9), making the bell icon update live.
- `useNudgeQueue.ts:52` — similarly subscribes to the `nudge_queue` table for live re-engagement nudges.
- `src/components/temple/sensorial/PracticeInteractiveLayer.tsx` and `src/pages/admin/AdminActivityFeed.tsx` — Temple sensory-feedback and Admin live activity feed also use channels, for a "live sensor room" effect and an operational live-tail view respectively.

### 5.6 Billing/credit gate as a network-layer pattern

Because virtually every "intelligent" edge function costs money to run, the credit-check RPC (§1.11, §5.1) functions as a de facto **network-layer middleware** — every AI call effectively does `getUser() → check_credit_balance() → do work → computeChargedPaise() → insert credit_transactions/ai_usage_log` — even though there's no literal middleware framework; the pattern is copy-implemented per function via the shared `_shared/billing-from-req.ts`/`_shared/ai-pricing.ts` helpers.

---
