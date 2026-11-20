# 3. Routing & Pages

### 3.1 Route map (`src/App.tsx`)

The app is a single `BrowserRouter` (`App.tsx:321`) with **three route trees**: a small eager-loaded core, a large lazily-loaded public/marketing surface, an authenticated `/app/*` tree behind `AppEntry`, and two more nested trees for `/enterprise/*` and `/admin/*`.

**Eager imports** (`App.tsx:23-27`): `Index`, `Auth`, `AppEntry`, `Home`, `NotFound` — chosen because they're the entry path virtually every visitor hits first (landing → auth → app shell → home), so they ship in the main bundle instead of a lazy chunk.

**Everything else** is wrapped in a `lazyImporters` map (`App.tsx:31-105`) of `() => import(...)` thunks, turned into `lazy()` components (`:107-215`). This indirection exists so the app can **prefetch by key** later without duplicating import paths.

**Background prefetch strategy** (`App.tsx:223-247`): a two-stage idle-prefetch —
- Stage 1, after 2s: `idle(() => lazyImporters[k]())` for a `PRIORITY_KEYS` shortlist (`HopeLanding, Practice, Guide, Explore, Journal, Settings`) — the pages a freshly-landed user is statistically most likely to hit next.
- Stage 2 is explicitly *not* implemented for "warm everything" in preview environments, per an inline comment warning that mass-prefetching starved Vite's dev-server compile queue and produced a blank iframe (`:244-247`) — a real debugging scar left in the code as a comment.

**Full public route table** (`:330-370`):
| Path | Component | Notes |
|---|---|---|
| `/` | `Index` | Marketing landing (renders `LandingPage.tsx`) |
| `/blog`, `/blog/:slug` | `Blog`, `BlogPost` | SEO content marketing |
| `/knowledge`, `/knowledge/:category`, `/knowledge/:category/:slug` | `Knowledge*` | SEO knowledge-base (essays) |
| `/loops`, `/loops/:slug` | `Loops`, `LoopDetail` | Public Loop Library — see §1.4 |
| `/hope-preview` | `HopeLanding` | Alternate landing variant, unlinked |
| `/experience/*` (14+ routes) | `Showroom*`, `Experience*` | A **public, no-login "try it" showroom** — self-inquiry, neti-neti, pranayama, mantra, observation "live sessions," a glossary, a "loops atlas," "bridges," prerequisites, wisdom/lineage pages. This is the pre-signup taste-test funnel. |
| `/temple` | `Temple` | Public entry to the Temple mythos (§4.3) |
| `/dictionary` → redirect | `Navigate to="/handbook"` | Legacy alias |
| `/handbook` | `StageHandbook` | Public "stage handbook" reference |
| `/auth` | `Auth` | Sign in/up |
| `/journey` | `JourneyProgressOutside` | Standalone journey-progress view (usable without the full app shell) |
| `/inner-llms` | `InnerLLMsLanding` | A marketing page framed around "your inner LLMs" (persona metaphor) |

**Authenticated tree** — a single parent route `<Route path="/app" element={<AppEntry />}>` (`:372`) with children rendered via `<Outlet/>` inside `AppLayout` (see §3.2). Children (`:373-401`): `index→Home`, `practice`, `guide`, `journal`, `explore`, `analytics`, `settings`, `credits`, `council`, `masters`, `before`/`pre-journey` (both → `PreJourney`), `foundation` (legacy 118-day curriculum, "kept reachable but not linked" per comment `:386`), `library`, `memory` (→ `MemoryVault`), `life-legacy`, `library/result/:id`, `library/:slug`, `constellation`, `constellation/evolution`, `integrations` (Signal Consent Center), `sentient` (Sentient Dashboard), `games` (redirects to `/app/library?tab=games` — Games tab was folded into Library), `games/:gameId`, `games-insights`, `session/:sessionId` (Generative Session), `programs-v3`.

**Enterprise tree** (`:405-426`): `/enterprise/auth`, `/enterprise/create`, `/enterprise/contact`, `/enterprise/privacy` standalone, then `/enterprise` (`EnterpriseLayout`) with children: dashboard, employees(+detail), teams, managers, invite, settings, reports, people, challenges, coaching, org-mirror, board, circles, programs, portal.

**Admin tree** (`:427-444`): `/admin` (`AdminLayout`) with children: dashboard, users(+detail), sessions, health, activity, copilot, analytics, enterprise, costs, waitlist, training, power, predictive, bi, seo.

**Catch-all**: `<Route path="*" element={<NotFound/>} />` (`:445`).

**Provider stack** wrapping the router (`App.tsx:309-455`): `ErrorBoundary → PersistQueryClientProvider (IndexedDB-persisted React Query) → AppFreshnessGuard/AuthCacheClearer (side-effect-only) → ThemeProvider → SoundProvider → TooltipProvider → Toaster/Sonner → IOSInstallHint/InstallPWA → BrowserRouter → LanguageProvider → GlobalErrorRedirect/GlobalStarfield/BreathingBackground/GlobalAmbientLayer/SentientWatchersProvider (always-mounted ambient/PWA/i18n layers) → Suspense(RouteFallback=AppPreloader) → Routes`.

`AuthCacheClearer` (`:275-307`) is a notable piece of defensive engineering: it listens to `supabase.auth.onAuthStateChange` and wipes the entire React Query cache + IndexedDB persister + a theme localStorage key whenever the signed-in user changes or signs out — preventing account-B from seeing account-A's cached queries on a shared device.

### 3.2 `AppLayout` (`src/components/AppLayout.tsx`)

`AppLayout` is the shell rendered once `appEntryMachine` reaches `ready` (`AppEntry.tsx:197`). It:

1. Wraps everything in three nested providers (`:300-313`): `SessionOrchestratorProvider → CinematicSessionProvider → PracticeRunControllerProvider`, then renders `AppLayoutInner` plus three **globally-mounted overlay components** that sit outside normal routing: `<StepOrbTransition/>`, `<PracticeRunMoreMenu/>`, `<PracticeRunFullScreen/>` — these are full-screen takeovers (cinematic transitions, practice run UI) that any page can trigger via context, without needing their own route.
2. `AppLayoutInner` branches on `useIsMobile()` into two structurally different layouts (`:335-403`):
   - **Mobile**: sticky top header (back button, brand, daily-suggestions button, notification bell, sacred-exit button, settings) + scrollable `<main>` + `<FloatingNav/>` bottom tab bar (`:337-378`).
   - **Desktop**: fixed `<DesktopHeader/>` top bar (brand, breadcrumb, same action cluster, theme/sound toggles, sign-out) + centered `max-w-[1600px]` `<main>` + the *same* `<FloatingNav/>` bottom bar even on desktop (a deliberate consistency choice) (`:383-403`).
   - Both layouts render `<AmbientBackground/>` and `<ConsciousnessBusListener/>` (a Supabase Realtime listener — §5.5) behind the content, and a `<SpiralStepBanner/>` above the `<Outlet/>`.
   - A **double-tap-anywhere-empty gesture** (`useDoubleTapGames`, `:278-293`) opens `/app/library?tab=games` — an Easter-egg-style shortcut that ignores taps on interactive elements via `closest("a,button,input,...")`.
3. `<FloatingNav/>` (`:120-168`) renders 4 tabs — **Home, Practice, Guide, Journal, Analytics** (Library/Games are intentionally hidden from the tab bar per an inline comment, `:43-46`, reachable only via deep link since "Home is now the adaptive program surface"), using a shared `layoutId="activeNavTab"` Framer Motion element so the active-tab highlight *slides* between tabs rather than popping.
4. Side effects wired at layout-mount time: `usePushNotifications(pushUserId)`, `useIdleNudge(pushUserId)`, `useJourneyNudge(pushUserId)` (`:331-333`) — background hooks that fire re-engagement nudges regardless of which `/app/*` page is active.

### 3.3 Auth gating

Gating is **not** done via a `<ProtectedRoute>` wrapper component; instead `AppEntry` *is* the gate — `/app` and all its children are mounted only after `appEntryMachine` resolves to `ready`, and `unauthenticated` triggers an imperative `navigate("/auth")` (`AppEntry.tsx:168-172`). `/admin` and `/enterprise` do not appear to share this same gate at the router level (no visible wrapping `AppEntry`-equivalent in `App.tsx`); their access control instead happens **inside** `AdminLayout`/`EnterpriseLayout` (not inspected in this pass) presumably checking `user_roles`/`org_members` and redirecting client-side, backed ultimately by the DB-level RLS regardless of what the client renders.

### 3.4 Onboarding flow

The onboarding funnel spans four cooperating pieces:

1. **`AppEntry.tsx`** decides *whether* onboarding is needed (`profiles.onboarded` flag) and renders `<Onboarding userId=... onComplete=...>` — note the import is `QuickOnboarding.tsx` aliased as `Onboarding` (`AppEntry.tsx:7`), i.e. the *actual* file `src/components/Onboarding.tsx` (older/deeper flow) has been superseded by `QuickOnboarding.tsx` as the live default, while the old file is kept in the tree (dead-code risk, or still referenced by a legacy path/test).
2. **`QuickOnboarding.tsx`** — the "4-questions" fast path referenced by the comment in `Home.tsx:208-212`: *"Both onboarding paths (Quick 4-questions + Deep 80-sessions) share this same Home UI... quick-path users get the floating Mirror button to take mirrors at will."* This confirms two onboarding depths exist by design, converging on the same `Home.tsx`.
3. **`PreJourney.tsx`** (`/app/before` and `/app/pre-journey`) — the "Deep 80-session" (actually surfaced as up to 60 sessions + 32 mirrors, per in-code comments) Foundation path. It:
   - Uses `usePreJourney()` to load `{enrolled, currentSession, pendingMirror, revealReady, revealSeen, graduated, completedIds, mirrorsCompleted, totalMirrors, totalSessions}`.
   - **Auto-enrolls** any authenticated user with no enrollment yet on a `'balanced'` pace / 30 daily minutes / 08:00 notify time (`:30-34`) — i.e. Foundation enrollment is opt-out, not opt-in, though its *UI surfacing on Home* is separately disabled (`Home.tsx:309`: `const foundationActive = false;` with a comment "Foundation course is deprecated on Home").
   - Shows first-time **welcome cards** (`FoundationWelcomeCards`) gated by a `localStorage['pj_welcome_seen']` flag (`:37-48`).
   - Central interaction is a **`CosmicOrb`** (same visual family as Home's orb) that opens a `SessionAgendaCard` bottom sheet offering **Talk** (`PreJourneyConversation`, voice-first) or **Read** (`PreJourneySessionPlayer`, text-first) modes for the day's session (`:74-97, 187-216`).
   - Every other session triggers a **Mirror checkpoint** (`session.number % 2 === 0`, `:92`) — a `MirrorCheckpointPlayer` reflective check-in — and once all 60 sessions + 32 mirrors are done, a **`CinematicReveal`** full-screen moment fires (`:59-61`), followed by a permanent "Foundation complete" graduated state (`:64-72`).
   - A pinned `LifetimeSessionsStrip` (`:123-127`) always shows overall progress regardless of which sub-screen is open.
4. **`FirstSessionWithGuru.tsx`** (imported in `AppEntry.tsx:9` but explicitly **disabled**: *"First-session-with-guru intro removed — go straight to app home"* (`AppEntry.tsx:193`) with the component/context (`firstSessionCtx`, `readFirstSessionDone`) left wired up but unused in the render path — another instance of an in-progress feature retired in place rather than deleted, gated behind a `localStorage['first_session_done_' + userId]` flag that never gets checked anymore.

A **cinematic intro** (`CinematicIntro.tsx`, imported `AppEntry.tsx:8`) and a `cinematic_intro_done` localStorage flag (`:50-53`) also exist in the same file but with no visible call site in the current render tree excerpt — likely gated behind a state branch not shown in the reviewed portion, consistent with the overall pattern of *many onboarding variants coexisting, with feature flags/localStorage toggles deciding which one is actually live*.

### 3.5 Home (`src/pages/Home.tsx`, 942 lines)

The single largest page in the app, described in its own header comment as: *"Unified Daily Home — One flow, one orb, one theme per day. No slot patterns. No Pulse. Just pure daily consciousness practice."* (`:1-4`) — itself a comment documenting a **pivot away from an older "time-slot grid" design** (the `homeMachine`/`AdaptiveSlotGrid` machinery from §2.3 still exists and is still wired in, but the header comment suggests the product direction has since moved toward a single always-available orb).

Key composition: `useThemeOfDay()` (today's theme+sessions+tasks), `useConsciousnessEngine(currentSlot)` (engine's plan + guru assignment), `useActiveGuruProgram()`, `useCredits()`, `useCompanionEngine()`, `useDetectBypassing()` (silent background mutation on mount, `:292-299`), `useFoundationCourse()`/`usePreJourney()` (both consulted but Foundation UI is force-disabled, `:309-318`), `useNextSession()`, `useOrientation()`, `useStreakGrace()`, `useNotifications()` (drives a `BreakthroughCelebration` full-screen modal triggered by unread `milestone`-type notifications containing a `breakthroughId`, matched within a 60-minute freshness window, `:355-386`), plus the two XState machines (`homeMachine`, `dailyCycleMachine`) for slot-navigation and gate-tracking respectively.

The central `<DailyOrb/>` component (`:94-199`) implements a **press-and-hold-to-begin** interaction: `onMouseDown/onTouchStart` starts a 1.5s progress-ring animation (`:99-117`), releasing early cancels it, and reaching 100% fires `onActivate()` — deliberately friction-adding (vs. a simple tap) so starting a session feels intentional/ritualistic rather than accidental.

---
