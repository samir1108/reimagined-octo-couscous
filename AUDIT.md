# Temple Yogic Companion — Deep Engineering Audit
**Generated:** 2026-09-11  
**Auditor:** Kilo (automated deep audit)  
**Project Root:** `D:\final\blank-canvas-banking-3bc6713d`  
**Package Name (from package.json):** `temple-yogic-companion`  
**Branding on README:** "Blank Canvas Banking" *(mismatched — see §1)*

---

## Table of Contents

1. [Identity & Product Overview](#1-identity--product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory & File Architecture](#3-directory--file-architecture)
4. [Frontend Entry & Routing](#4-frontend-entry--routing)
5. [State Management](#5-state-management)
6. [Data Layer — Supabase](#6-data-layer--supabase)
7. [Database Schema](#7-database-schema)
8. [Supabase Edge Functions](#8-supabase-edge-functions)
9. [The Consciousness Engine](#9-the-consciousness-engine)
10. [Programs Library](#10-programs-library)
11. [Director Brain Module](#11-director-brain-module)
12. [UI System — Themes, Components, Animations](#12-ui-system--themes-components-animations)
13. [Internationalization](#13-internationalization)
14. [Session Orchestration & Sutra System](#14-session-orchestration--sutra-system)
15. [Onboarding Flows](#15-onboarding-flows)
16. [Enterprise & Admin Modules](#16-enterprise--admin-modules)
17. [Payments & Credits](#17-payments--credits)
18. [AI Integrations](#18-ai-integrations)
19. [Third-Party Integrations](#19-third-party-integrations)
20. [Mobile / PWA / Capacitor](#20-mobile--pwa--capacitor)
21. [Performance & Build Pipeline](#21-performance--build-pipeline)
22. [Testing](#22-testing)
23. [Security Audit](#23-security-audit)
24. [Code Quality & Technical Debt](#24-code-quality--technical-debt)
25. [Identified Bugs & Stray Code](#25-identified-bugs--stray-code)
26. [Recommendations — Prioritized](#26-recommendations--prioritized)
27. [Summary Scorecard](#27-summary-scorecard)

---

## 1. Identity & Product Overview

### What the product actually is

This is **Temple Yogic Companion** — a spiritually-themed, AI-guided consciousness-development web application. Despite the README's misleading title ("Blank Canvas Banking") and its boilerplate consciousos.dev marketing text, the application is entirely a yoga, meditation, and inner-work companion. Every route, every database table, every edge function, and every UI component confirms this.

The app positions itself as a personalised guru/digital elder that adapts to the user's spiritual development level, current energy, life circumstances, and personal practice history. It is not a banking app, a fintech product, or a productivity tool — it is a well-being and consciousness-tech platform.

### Core value proposition

- A **dynamic daily theme** that evolves over time, giving each day a unique contemplative thread.
- A **"Living Orb"** on the home screen that users press-and-hold to begin a session — the central interaction metaphor of the app.
- **120+ structured programs** covering yoga asana, pranayama, self-inquiry (Neti Neti), witness consciousness, chakra work, kundalini, grief, addiction recovery, burnout, relationships, money wounds, and dozens more.
- An AI guide chat that adopts the voice of a rotating master/teacher (guru) matched to the user's journey phase.
- **Cognitive-agent routing**: the app detects the user's emotional state, bypassing risk, life stage, and spiritual depth, then routes the conversation to the appropriate "agent" — similar in concept to a multi-agent LLM system but entirely custom-built.
- **Enterprise tier**: B2B wellness programs for organizations with managers, peer circles, org health dashboards, and program designers.
- **Admin panel**: Full internal tooling for user management, analytics, predictive churn models, AI cost tracking, SEO, and session management.
- Multi-modal AI: voice (ElevenLabs + Deepgram STT), text (Groq / Gemini), and structured generative session plans.

### Project metadata

| Property | Value |
|---|---|
| Version | 1.0.0 |
| Private | Yes |
| Module system | ESM (`"type": "module"`) |
| License | Not specified |
| Built with | consciousos.dev (scaffold) + heavy custom extension |
| Repo URL | GitHub-connected via ConsciousOS |
| Target platforms | Web (primary), iOS + Android via Capacitor |

---

## 2. Tech Stack

### Frontend framework and toolchain

| Layer | Technology | Version range |
|---|---|---|
| UI framework | React | 18.3.1 |
| Language | TypeScript | 5.8.3 |
| Build tool | Vite | 5.4.19 |
| React transform | @vitejs/plugin-react-swc | 3.11.0 |
| CSS framework | Tailwind CSS | 3.4.17 |
| PostCSS | postcss + autoprefixer | 8.5.6 / 10.4.21 |
| Component library | shadcn/ui (Radix UI primitives) | Latest compatible |
| Animation | Framer Motion | 12.35.1 |
| 3D graphics | Three.js + @react-three/drei | 0.170.0 / 9.122.0 |
| State machines | XState | 6.1.0 (runtime) |
| Server state | @tanstack/react-query | 5.83.0 |
| Query persistence | @tanstack/react-query-persist-client | 5.90.24 |
| IndexedDB cache | idb-keyval | 6.2.2 |
| Routing | react-router-dom | 6.30.1 |
| Forms | react-hook-form + zod resolvers | 7.61.1 / 3.25.76 |
| Markdown | react-markdown | 10.1.0 |
| Charts | recharts | 2.15.4 |
| Notifications | sonner | 1.7.4 |
| Carousel | embla-carousel-react | 8.6.0 |
| Date picker | react-day-picker | 8.10.1 |
| Resizable panels | react-resizable-panels | 2.1.9 |
| Command palette | cmdk | 1.1.1 |
| Drawer | vaul | 0.9.9 |
| OTP input | input-otp | 1.4.2 |
| Theme | next-themes | 0.3.0 |
| Icons | lucide-react | 0.462.0 |
| SEO | react-helmet-async | 3.0.0 |

### Backend & infrastructure

| Layer | Technology |
|---|---|
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Database | PostgreSQL (via Supabase) — PostgREST v14.5 |
| Auth | Supabase Auth (GoTrue) with localStorage persistence |
| AI providers | Groq API, Google Gemini API |
| Voice TTS | ElevenLabs React SDK + Deepgram STT |
| Payments | Razorpay (Indian Rupee — paise denomination) |
| Mobile | Capacitor 8.3.2 (iOS + Android) |
| Health | capacitor-health |
| PWA | vite-plugin-pwa |

### Testing & linting

| Tool | Version |
|---|---|
| Test runner | Vitest 3.2.4 |
| Test environment | jsdom 20.0.3 |
| Assertions | Vitest globals |
| Component testing | @testing-library/react 16.0.0 |
| Linting | ESLint 9.32.0 |
| Type checking | TypeScript 5.8.3 (strict mode implied by config) |

### Supabase Edge Functions runtime

Edge functions are written in TypeScript and run on the Deno-based Supabase Edge Runtime. There are **100+ edge function directories** under `supabase/functions/`, with a shared utilities library under `supabase/functions/_shared/` containing modules for billing, AI configuration, chakra engine, loop library, psychological probes, T-shape decider, and more.

---

## 3. Directory & File Architecture

### Top-level layout

```
.
├── .git/                          # Git repository
├── .kilo/                         # Kilo config (commands + agents)
├── .consciousos/                  # consciousos.dev project state
├── architecture/                  # Architecture docs
├── content/                       # Markdown content (blogs, etc.)
├── dist/                          # Build output (871 files — pre-built)
├── docs/                          # Documentation
├── docs-final/                    # Finalized docs
├── docs2/                         # Secondary docs
├── documentation/                 # More documentation
├── extension/                     # Browser extension?
├── node_modules/                  # Dependencies
├── public/                        # Static assets (PWA icons, images)
├── scripts/                       # Build/migration scripts
├── src/                           # Application source (see below)
├── supabase/                      # Supabase project (DB, edge functions, config)
│   ├── functions/                 # 100+ Edge Functions
│   ├── migrations/                # ~100 SQL migration files
│   ├── manifests/                 # Storage/media manifests
│   └── config.toml                # Supabase CLI config
├── .env                           # Live environment variables
├── .env.example                   # Template for env vars
├── .env.secrets                   # Secrets storage (2 bytes — effectively empty)
├── .gitignore
├── asset-mapping.json             # Asset registry (71 KB)
├── bun.lock / bun.lockb           # Bun lock files (also npm used)
├── capacitor.config.ts            # Capacitor native config
├── CLOUD_INVENTORY.md             # Cloud infra doc
├── components.json                # shadcn/ui registry config
├── content.md                     # Content doc
├── eslint.config.js               # ESLint flat config
├── generate-mapping.mjs           # Asset mapping generator script
├── ig-content.md                  # IG (Instagram?) content
├── index.html                     # Vite HTML entry
├── migrate-assets.mjs             # Asset migration script
├── MY_OWN_SUPABASE.md             # Supabase setup notes
├── package.json                   # npm package manifest
├── package-lock.json              # npm lock file
├── postcss.config.js              # PostCSS config
├── README.md                      # Project README (outdated)
├── SELF_HOSTING.md                # Self-hosting guide
├── SESSION_FLOW.md                # Session flow documentation
├── tailwind.config.ts             # Tailwind CSS config
├── temple.md                      # Temple design doc (127 KB)
├── THE_CINEMATIC_WORLD_ENGINE_v3.md  # Cinematic engine doc (82 KB)
├── tsconfig.app.json              # TS config for app
├── tsconfig.json                  # Root TS config
├── tsconfig.node.json             # TS config for Node scripts
├── upload-local-assets.mjs        # Asset upload script
├── vite.config.ts                 # Vite config
└── vitest.config.ts               # Vitest config
```

### Source tree (`src/`)

```
src/
├── main.tsx                       # React entry point
├── App.tsx                        # Root app — routing, providers, layout
├── index.css                      # Global styles + Tailwind imports + CSS vars
├── _archive/                      # Archived component
├── locales/                       # i18n JSON files (60+ languages)
│   ├── _source.en.json            # English master translation source
│   ├── en.json
│   ├── es.json, fr.json, de.json  # European languages
│   ├── hi.json, bn.json, ta.json  # Indic languages
│   ├── zh.json, zh-TW.json, ja.json, ko.json  # East Asian
│   └── ... (60+ total)
├── components/
│   ├── ui/                        # shadcn/ui primitives (Radix-based)
│   ├── shared/                    # Shared cross-cutting components
│   ├── home/                      # Home page sub-components
│   ├── guide/                     # Guide/chat components
│   ├── temple/                    # Temple visual components
│   ├── onboarding/                # Onboarding components
│   ├── integrations/              # Signal, Sentient watchers
│   ├── admin/                     # Admin layout components
│   ├── enterprise/                # Enterprise layout components
│   ├── AppLayout.tsx              # Authenticated app shell
│   ├── CinematicIntro.tsx         # Landing cinematic animation
│   ├── LandingPage.tsx            # Public landing page
│   ├── ErrorBoundary.tsx           # React error boundary
│   ├── GlobalStarfield.tsx         # Ambient starfield background
│   ├── BreathingBackground.tsx     # Breathing animation background
│   ├── GlobalAmbientLayer.tsx      # Global ambient sound/visual layer
│   ├── AppPreloader.tsx            # Loading / splash screen
│   └── ... (many more)
├── contexts/
│   ├── ThemeContext.tsx            # Theme system (5 themes × dark/light)
│   ├── LanguageContext.tsx         # i18n language provider
│   └── SoundContext.tsx            # Sound effects provider
├── hooks/                         # 90+ custom React hooks
│   ├── useAuthReady.ts
│   ├── useThemeOfDay.ts
│   ├── useConsciousnessEngine.ts
│   ├── useNextSession.ts
│   ├── useCompanionEngine.ts
│   ├── useCredits.ts
│   ├── useNotifications.ts
│   └── ... (90+ total)
├── integrations/supabase/
│   ├── client.ts                  # Auto-generated Supabase client
│   └── types.ts                   # Auto-generated database types
├── lib/
│   ├── supabase.ts                # Loose-typed Supabase re-export
│   ├── consciousness/             # Consciousness Engine (see §9)
│   ├── director-brain/            # Director Brain module (see §11)
│   ├── programs/                  # Programs V3 library (see §10)
│   ├── sutra/                     # Sutra orchestrator + mode registry
│   ├── session-shell/             # Session shell types + API
│   ├── machines/                  # XState state machines
│   ├── personalization/           # Astrology, numerology, rhythm, Vedic
│   ├── onboarding/                # Foundation onboarding logic
│   ├── memory/                    # Long-term memory engine
│   ├── goals/                     # Goals catalog
│   ├── library/                   # Library scoring
│   ├── experience/                # Experience level plan builder
│   ├── composer/                  # Session composer
│   ├── practice/                  # Practice engine, recipes, metrics
│   ├── i18n.ts                    # Static translation loader
│   ├── translateCache.ts          # AI translation cache (IndexedDB)
│   ├── queryPersister.ts          # TanStack Query IndexedDB persister
│   ├── guru-data.ts               # Guru/teacher roster data
│   ├── ttsPrewarm.ts              # ElevenLabs TTS pre-warming
│   ├── sessionOrchestrator.ts     # Client-side session orchestration
│   └── ... (many more)
├── machines/
│   ├── appEntryMachine.ts         # Auth/onboarding state machine
│   ├── homeMachine.ts             # Home page slot state machine
│   ├── dailyCycleMachine.ts       # Daily cycle state machine
│   ├── practiceMachine.ts         # Practice session state machine
│   ├── sessionMachine.ts          # Session state machine
│   ├── journalMachine.ts          # Journal state machine
│   ├── settingsMachine.ts         # Settings state machine
│   ├── voiceMachine.ts            # Voice interaction state machine
│   ├── insightsMachine.ts         # Insights state machine
│   └── notificationsMachine.ts    # Notifications state machine
├── pages/                         # Route-level page components
│   ├── Index.tsx                  # "/" — landing page entry
│   ├── Auth.tsx                   # "/auth" — sign in/up
│   ├── AppEntry.tsx               # "/app" — authenticated app shell
│   ├── Home.tsx                   # "/app" index — unified daily home
│   ├── Practice.tsx               # "/app/practice"
│   ├── Guide.tsx                  # "/app/guide" — AI guide chat
│   ├── Journal.tsx                # "/app/journal"
│   ├── Explore.tsx                # "/app/explore"
│   ├── Analytics.tsx              # "/app/analytics"
│   ├── Settings.tsx               # "/app/settings"
│   ├── ProgramsV3.tsx             # "/app/programs-v3"
│   ├── Council.tsx                # "/app/council"
│   ├── DharmaOracle.tsx           # "/app/dharma-oracle"
│   ├── KoshaScanner.tsx           # "/app/kosha-scanner"
│   ├── Masters.tsx                # "/app/masters"
│   ├── Constellation.tsx          # "/app/constellation"
│   ├── ConstellationEvolution.tsx # "/app/constellation/evolution"
│   ├── PreJourney.tsx             # "/app/before" — mirror path
│   ├── FoundationCourse.tsx       # "/app/foundation"
│   ├── Library.tsx                # "/app/library"
│   ├── MemoryVault.tsx            # "/app/memory"
│   ├── LifeAndLegacy.tsx          # "/app/life-legacy"
│   ├── Temple.tsx                 # "/temple"
│   ├── StageHandbook.tsx          # "/handbook"
│   ├── Dictionary.tsx             # "/dictionary" → redirects to /handbook
│   ├── Launch.tsx                 # "/launch"
│   ├── Blog.tsx / BlogPost.tsx    # Public blog
│   ├── Knowledge.tsx + children   # Knowledge base
│   ├── Loops.tsx / LoopDetail.tsx # Spiritual loops catalog
│   ├── Games.tsx / GameRoute.tsx / GameInsights.tsx
│   ├── GenerativeSessionPage.tsx  # "/app/session/:sessionId"
│   ├── Analytics.tsx
│   ├── admin/                     # 15 admin pages
│   ├── enterprise/                # 20 enterprise pages
│   ├── experience/                # 20+ "experience" pages (live sessions)
│   ├── showroom/                  # 5 showroom pages (program browsing)
│   ├── hope/                      # Hope landing page
│   └── NotFound.tsx               # 404 page
├── types/
│   ├── consciousness.ts           # Consciousness engine types
│   ├── database.ts                # Database entity types
│   ├── dimension-matrix.ts        # 100-dimension matrix types
│   └── practices.ts               # Practice type definitions
├── temple/types/
│   └── index.ts                   # Temple module types
└── test/
    ├── setup.ts                   # Test setup
    └── example.test.ts            # Single placeholder test
```

### Notable file counts

| Category | Count |
|---|---|
| Total source files (src/) | ~600+ |
| React pages | ~80+ |
| Custom hooks | ~90 |
| Supabase Edge Functions | 100+ |
| Supabase migration files | ~100 |
| Locale files (languages) | 60+ |
| Programs (src/lib/programs/programs/*.ts) | 120 |
| Program atoms (src/lib/programs/atoms/*.ts) | 10 |
| XState machines | 10 |
| shadcn/ui components | ~30+ |

---

## 4. Frontend Entry & Routing

### Entry point flow

The boot sequence is:

1. **`index.html`** loads `/src/main.tsx`
2. **`main.tsx`** creates the React root with `HelmetProvider`, renders `App`, then calls:
   - `installGlobalCreditGuard()` — installs an interceptor that prevents API calls when credits are zero
   - `startBackgroundPrewarm()` — pre-warms ElevenLabs TTS voices in the background, cached in IndexedDB
3. **`App.tsx`** wraps everything in a deep provider hierarchy:
   ```
   ErrorBoundary
     PersistQueryClientProvider (TanStack Query + IndexedDB persistence)
       ThemeProvider
         SoundProvider
           TooltipProvider
             BrowserRouter
               LanguageProvider
                 GlobalStarfield + BreathingBackground + GlobalAmbientLayer
                   SentientWatchersProvider
                     Suspense → Routes
   ```
4. **`Index.tsx`** (`/` route) checks auth state; if authenticated, redirects to `/app`; if not, shows a `CinematicIntro` then lazy-loads `LandingPage`.
5. **`AppEntry.tsx`** (`/app` route) is an XState-driven gate that checks auth → profile → onboarding state, then either routes to Foundation onboarding or renders `AppLayout`.

### Routing architecture

Routing uses `react-router-dom` v6 with a heavily nested route tree:

- **Public routes** (`/`, `/auth`, `/blog`, `/knowledge`, `/loops`, `/hope-preview`, `/launch`)
- **Authenticated app routes** (`/app/*`) — 30+ child routes wrapped in `AppEntry`
- **Enterprise routes** (`/enterprise/*`) — 15+ child routes wrapped in `EnterpriseLayout`
- **Admin routes** (`/admin/*`) — 15+ child routes wrapped in `AdminLayout`

All non-public, non-app routes are **lazy-loaded** via `React.lazy()`. Two-stage prefetching occurs after first paint: priority routes (HopeLanding, Practice, Guide, Explore, Journal, Settings) pre-fetch after 2 seconds idle; remaining routes pre-fetch after the first user interaction. This keeps the initial network graph small for Lighthouse LCP.

The `/app` layout is protected by `AppEntry`, which uses the `appEntryMachine` XState machine to control the authentication/onboarding flow.

### Code splitting strategy

The App.tsx file (lines 32–108) creates a `lazyImporters` lookup map, then assigns each route a `lazy()` wrapper. This is an effective code-splitting pattern — the initial JS bundle for the landing page is kept minimal (~40 KB for auth-only screens, per the comments).

---

## 5. State Management

The application uses a **three-layer state architecture**:

### Layer 1: XState machines (10 machines)

XState v5 `setup().createMachine()` is used for complex UI flows with explicit state transitions:

| Machine | File | Purpose |
|---|---|---|
| `appEntryMachine` | `machines/appEntryMachine.ts` | Auth check → onboarding → ready |
| `homeMachine` | `machines/homeMachine.ts` | Slot selection + navigation on Home |
| `dailyCycleMachine` | `machines/dailyCycleMachine.ts` | Daily task/session cycle |
| `practiceMachine` | `machines/practiceMachine.ts` | Practice session lifecycle |
| `sessionMachine` | `machines/sessionMachine.ts` | Session state (active/paused/completed) |
| `journalMachine` | `machines/journalMachine.ts` | Journal entry flow |
| `settingsMachine` | `machines/settingsMachine.ts` | Settings UI state |
| `voiceMachine` | `machines/voiceMachine.ts` | Voice interaction flow |
| `insightsMachine` | `machines/insightsMachine.ts` | Insights display |
| `notificationsMachine` | `machines/notificationsMachine.ts` | Notification state |

Note: XState version 6.1.0 is installed (`@xstate/react`), while the `xstate` package is at v5.28.0. The `setup()` API is from XState v5 — this version mismatch should be verified as both versions are present in package.json.

### Layer 2: React Contexts (3 main contexts)

| Context | File | Purpose |
|---|---|---|
| `ThemeContext` | `contexts/ThemeContext.tsx` | 5 themes × dark/light mode with CSS variable injection |
| `LanguageContext` | `contexts/LanguageContext.tsx` | i18n routing with static + AI-translated strings |
| `SoundContext` | `contexts/SoundContext.tsx` | UI sound effects toggle + playback |

The `ThemeContext` is particularly sophisticated: it manages 5 named themes (cosmic, sacred, zen, minimal, mystical), each with full dark and light mode token sets including glass-morphism helpers. It also handles legacy theme name migration (sunrise → sacred, midnight → cosmic, etc.) and a "forced override" mode for landing/auth routes.

### Layer 3: TanStack Query (React Query)

`PersistQueryClientProvider` wraps the entire app with:
- 5-minute stale time
- 24-hour cache time
- IndexedDB persistence via `idb-keyval`
- 24-hour max age for persisted cache
- Cache buster key: `'v2-journey-day-fix'`
- Auto-clear on user change (sign-out or different user sign-in)

The `AuthCacheClearer` component in App.tsx (lines 285–317) monitors auth state changes and calls `queryClient.clear()` plus `indexedDBPersister.removeClient()` when a different user signs in or the current user signs out.

---

## 6. Data Layer — Supabase

### Client setup

The Supabase client lives in two files:

1. **`src/integrations/supabase/client.ts`** — auto-generated by Supabase CLI. Creates a typed client using `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Handles both legacy JWT and new opaque API keys.

2. **`src/lib/supabase.ts`** — a loose-typed re-export that casts the client to `SupabaseClient<any, "public", any>` because the auto-generated `Database` type is empty (tables haven't been generated into the types file yet). This means **all Supabase calls are effectively untyped at compile time** — a significant type-safety gap.

### Authentication

- Supabase Auth with `persistSession: true` and `autoRefreshToken: true`
- Session stored in `localStorage`
- Auth state monitored via `supabase.auth.onAuthStateChange()`
- Redirect logic: unauthenticated users land on `/auth` (handled by `AppEntry` state machine)

### Data fetching patterns

The application uses a hybrid approach:
- **TanStack Query hooks** for most data fetching (90+ hooks in `src/hooks/`)
- **Direct Supabase calls** from some components and edge functions
- **Session shell** (`src/lib/session-shell/`) manages generative session state in localStorage keyed by session ID

---

## 7. Database Schema

The schema is defined across ~100 SQL migration files and is reflected (partially) in `src/integrations/supabase/types.ts`. The `Database` type there only covers 8 tables, but the actual schema is larger — several tables referenced in edge functions (like `user_practice_constellation`, `life_domain_scores`, `active_loops`, `theme_arcs`) are not present in the TypeScript types.

### Core tables (from types.ts)

| Table | Purpose |
|---|---|
| `profiles` | User profile (display_name, onboarded flag, onboarding_path) |
| `user_consciousness_profile` | Consciousness metrics (v_level, dimension_bands, journey_day, witness_depth, samskaras, active_loops) |
| `sessions` | Practice/generative sessions (type, status, plan, metadata, v_level_delta, karma_earned, master_id) |
| `session_step_events` | Granular step events within sessions (step_index, duration, quality_score, rating) |
| `daily_themes` | Per-user daily themes (title, description, focus_areas, sequence_no, max_depth, evolution_status) |
| `today_practice_packs` | Daily curated practice packs (practices JSON, formula, rationale, arc_id) |
| `journal_entries` | Journal entries (content, mood, tags, thread_id) |
| `journal_threads` | Journal thread grouping (title, intention, entry_count, status) |
| `mirror_readings` | Mirror/self-reflection readings (mirror_number, score, band, confidence, evidence) |
| `personal_practice_schedule` | Scheduled practices (scheduled_at, category, location, notify, payload) |
| `credit_transactions` | Payment ledger (amount_paise, balance_after_paise, razorpay_order_id, kind) |
| `user_credits` | Credit balance (balance_paise, lifetime_paise, total_purchased_paise) |
| `ai_usage_log` | AI cost tracking (function_name, model, input/output tokens, estimated_cost_paise) |
| `user_journey_log` | Daily journey log (day_number, engine_plan, phase) |
| `guide_commitments` | Guide session commitments (summary, status, check_back_at, chain_parent_id) |

### Database functions

| Function | Purpose |
|---|---|
| `check_and_deduct_credits` | Atomic credit deduction |
| `check_credit_balance` | Credit balance check |

### Notable schema gaps

Several tables used in edge functions are not in the auto-generated types:
- `user_practice_constellation` (12 weighted practices)
- `life_domain_scores` (8 life domains scored)
- `active_loops` (active spiritual bypassing loops)
- `theme_arcs` (7-day theme arcs)
- `user_karmic_profile` (referenced in some edge functions)
- `user_three_brains` (head/heart/gut balance)
- `breakthroughs` (breakthrough events)
- `program_enrollments` (program enrollment tracking)
- `enterprise_organizations`, `enterprise_employees`, etc.

These exist in the live database but the types.ts file is stale — confirming the type-safety gap noted in §6.

---

## 8. Supabase Edge Functions

There are **100+ edge functions** deployed to Supabase. They are organized by functional domain:

### AI generation functions
- `compose-session` / `compose-session-v3` / `composer-engine` — Generate session plans
- `generate-theme` — Generate daily themes
- `generate-practice-session` — Generate practice sessions
- `generate-program-session` — Generate program sessions
- `generate-session-agenda` — Generate session agendas
- `generate-daily-ritual` — Generate daily rituals
- `guide-chat` / `temple-chat` — AI guide conversations
- `guide-insight` — Generate guide insights
- `elder-dialogue` — Elder AI dialogue
- `pre-journey-chat` — Pre-journey conversation
- `consciousness-engine` — Main consciousness engine
- `compose-today-practice` — Today's practice composition

### Assessment & analysis
- `analyze-assessment` — Analyze onboarding assessment
- `assess-starting-levels` — Determine starting spiritual level
- `graduation-deep-analysis` — Deep graduation analysis
- `three-lens-analyzer` — Three-perspective analysis
- `detect-anomalies` / `detect-contradictions` / `detect-silence` — Diagnostic

### Integration functions
- `gmail-tone-watcher` — Gmail tone monitoring
- `slack-tone-watcher` — Slack tone monitoring
- `teams-tone-watcher` — Teams tone monitoring
- `outlook-tone-watcher` — Outlook tone monitoring
- `linear-workload-watcher` — Linear workload monitoring
- `github-late-night-watcher` — GitHub activity monitoring
- `calendar-meeting-watcher` — Calendar monitoring
- `wearable-oauth-start` / `wearable-oauth-callback` / `wearable-sync` — Wearable integration
- `ingest-signal` — Signal ingestion from integrations
- `signal-fusion` — Multi-signal fusion
- `instant-pulse-detector` / `pattern-window-detector` — Pattern detection

### Enterprise functions
- `enterprise-insights` — Enterprise analytics
- `enterprise-people-intelligence` — People analytics
- `org-program-designer` — Program design for orgs
- `org-weekly-briefing` — Weekly org briefing
- `manager-coaching` — Manager coaching
- `seed-demo-org` — Demo org seeding

### Session lifecycle
- `session-complete` — Mark session complete
- `session-adapter` — Adapt session format
- `mirror-session` — Mirror/self-reflection session
- `reflect-game` — Game reflection
- `score-session-spine` — Score session spine
- `next-session-preview` — Preview next session
- `stt-listen` — Speech-to-text
- `tts-speak` — Text-to-speech

### Memory & learning
- `memory-consolidate` / `memory-extract` / `recall-memory` / `embed-memory` — Long-term memory
- `recalibrate-constellation` / `recalibration-intelligence` — Constellation recalibration

### Billing
- `razorpay-order` / `razorpay-verify` — Payment processing
- Shared billing config in `_shared/ai-billing.ts`, `_shared/payment-config.ts`

### Shared utilities (`_shared/`)

| File | Purpose |
|---|---|
| `ai-billing.ts` | AI cost calculation and billing |
| `ai-config.ts` | AI provider configuration |
| `ai-pricing.ts` | Per-model pricing tables (paise per token) |
| `adaptive-engine.ts` | Adaptive difficulty engine |
| `arcEngine.ts` | Theme arc engine |
| `billing-from-req.ts` | Billing extraction from requests |
| `chakraEngine.ts` | Chakra system logic |
| `composer.ts` | Session composer logic |
| `guest-masters.ts` | Guest master roster |
| `human-presence.ts` | Human presence detection |
| `kundli-context.ts` | Kundli (birth chart) context |
| `language.ts` | Language resolution |
| `long-term-memory.ts` | Long-term memory logic |
| `loop-library.ts` / `loopMap.ts` | Spiritual loop definitions |
| `mirror-knowledge.ts` | Mirror reading knowledge base |
| `mode-frameworks.ts` | Session mode frameworks |
| `payment-config.ts` | Razorpay configuration |
| `practiceMatrix.ts` | Practice matrix logic |
| `psychological-probes.ts` | Psychological probe questions |
| `themeOrchestrator.ts` | Theme orchestration logic |
| `tShapeDecider.ts` | T-shaped learning decider |
| `user-context.ts` | User context resolution |
| `voice-lineage.ts` | Voice/teacher lineage |

---

## 9. The Consciousness Engine

The Consciousness Engine is the intellectual core of the application. It is implemented primarily in `src/lib/consciousness/` with supporting types in `src/types/`.

### V-Level Calculator (`vLevelCalculator.ts`)

The user's spiritual development is tracked as a floating-point "V-Level" (likely inspired by the "V" scale of consciousness in various spiritual traditions). Key exports:
- `calculateVLevel` — computes the user's current level from their history
- `detectSpeedProfile` — classifies the user's learning pace
- `shouldLevelUp` — determines if the user is ready to advance
- `checkBypassingRisk` — detects spiritual bypassing (using practice as avoidance)
- `sessionsToReturn` — estimates sessions needed to return after a gap
- `getWarmUpAdjustment` — adjusts difficulty after breaks

### Practice Engine (`practiceEngine.ts`)

Generates personalized practice recommendations based on user state:
- `getNextPractice` — selects the next practice
- `detectPlateau` — detects when the user is stuck
- `getSessionFormula` — determines the session structure

### Dimension Tracker (`dimensionTracker.ts`)

Tracks 12 primary spiritual dimensions across the user's journey:
- `generatePracticeSignals` — generates practice recommendations from dimension signals
- `applySignals` — applies dimension signals to the user's profile
- `createInitialSnapshot` — creates the initial dimension snapshot
- `getWeakestPrimaryDimension` — finds the dimension needing most work
- `getDimensionBalance` — computes dimension balance score

### 100-Dimension Taxonomy (`taxonomy/dimensions100.ts`)

A finer-grained expansion with 100 sub-dimensions organized under parent dimensions. Exported as `DIMENSIONS_100` and `getDimensionsByParent`.

### Speed Profile Engine (`speedProfileEngine.ts`)

Detects the user's learning speed profile and adapts:
- `detectSpeedProfile` — classifies speed
- `getAdaptiveDifficulty` — adjusts difficulty
- `handleGuiltDetection` — responds to guilt signals
- `getWarmUpAfterGap` — warm-up after breaks

### Daily Gates (`dailyGates.ts`)

A time-of-day system that determines which "gate" the user is entering through:
- `GATES` — gate definitions
- `TIME_SLOT_PATTERNS` — time slot patterns
- `getCurrentGate` — current gate based on time
- `getGateDef` — gate definition lookup
- `getGateGreeting` — contextual greeting
- `getNightGuardMessage` — evening/night message
- `determineEntryContext` — full entry context

### Assessment Detector (`assessmentDetector.ts`)

Processes the user's onboarding assessment answers:
- `detectAllLevels` — detects all spiritual levels
- `detectPaths` — detects suitable spiritual paths
- `detectBrainDominance` — left/right brain dominance
- `processAssessment` — full assessment processing

### Session Generator (`sessionGenerator.ts`)

Generates complete session plans:
- `generateSessionPlan` — creates a session plan with steps
- `getAdaptedDuration` — adapts duration to user state

### Cognitive Agent System

This is a multi-agent LLM routing system — one of the most architecturally sophisticated parts of the app.

**Agent Definitions** (`agents/agentDefinitions.ts`):
- `ALL_AGENTS` — full agent registry
- `getAgent` — agent lookup by ID
- `getAgentsByGroup` — agents by functional group
- `getAgentsForDepth` — agents appropriate for current depth
- `getSafeAgents` — agents safe for current user state

**State Engine** (`agents/stateEngine.ts`):
- `computeState` — computes user's current emotional/cognitive state
- `deriveState` — derives simplified state from inputs
- Types: `UserStateVector`, `DerivedState`, `EmotionalTone`, `UserIntent`, `AwarenessDepth`

**Agent Router** (`agents/agentRouter.ts`):
- `routeAgents` — routes conversation to appropriate agents
- Types: `RoutingDecision`, `ConversationMode`, `ResponseIntensity`

**Edge Case Detector** (`agents/edgeCaseDetector.ts`):
- `detectEdgeCases` — detects 51-58 edge cases (spiritual bypassing, dark night, etc.)
- `getEdgeCaseAgents` — agents appropriate for edge cases

**Stage Engine** (`agents/stageEngine.ts`):
- `detectStage` / `computeStage` — detects the user's consciousness stage (8-stage model)
- `STAGE_LABELS` — stage name mappings
- `smoothStage` — smooths stage transitions

**Insight Layer** (`agents/insightLayer.ts`):
- `buildInsightDecision` — decides when/how to offer insights
- `computeTeachability` — measures how open the user is to teaching
- `detectSpiritualLean` — detects spiritual tradition preference
- `decideInsightDepth` — how deep to go

### Master Rotation (`masterRotation.ts`)

- `decideRotation` — decides which master/teacher to feature
- `resolveGuru` — resolves the active guru for a session

### Lifetime Spiral (`lifetimeSpiral.ts`)

A 10-phase model mapping spiritual development to life phases:
- `LIFETIME_PHASES` — phase definitions
- `computeLifetimePhase` — current life phase
- `phaseProgress` — progress through current phase
- `shouldUseSilentMode` — when to use silent/observing mode

### Life Stage, Relationship, Retention

- `lifeStageDetector.ts` — detects life stage (young adult, parent, elder, etc.)
- `relationshipDepth.ts` — tracks relationship depth (single, partnered, parent, etc.)
- `retentionEngine.ts` — predicts and responds to churn risk

---

## 10. Programs Library

The Programs V3 system (`src/lib/programs/`) contains **120+ structured spiritual programs** and **10 program atoms**.

### Program structure

Each program is a self-contained TypeScript module exporting a `SessionProgramV3` object. Programs are organized into categories:

| Category | Examples | Count |
|---|---|---|
| Self-Inquiry (Neti Neti) | self-inquiry-l1 through l5 | 5 |
| Witness consciousness | witness-l1 through l5 | 5 |
| Pranayama | pranayama-foundation, nadi-shodhana-mastery, bhastrika-path, kapalbhati-cycle, ujjayi-deep | 5 |
| Chakra work | chakra-muladhara through chakra-sahasrara | 7 |
| Yoga traditions | yoga-sutras-intro, gita-intro, upanishads-intro, raja-yoga | 4 |
| Mental health | anxiety-relief, depression-companion, burnout-recovery, grief-companion | 4+ |
| Relationships | relationship-mirror, couples-sadhana, attachment-styles, conflict-resolution | 4+ |
| Shadow work | shadow-integration, inner-child, self-worth-rebuild, trauma-aware-foundation | 4+ |
| Energy practices | kundalini-awakening, pranayama-foundation, qi-gong-flow, tai-chi-essence | 4+ |
| Meditation paths | vipassana-path, zazen-path, yoga-nidra-path, trataka-path | 4 |
| Mantra/sound | mantra-japa-path, bija-mantra-arc, kirtan-practice, sound-current | 4 |
| Emotional work | anger-alchemy, forgiveness-arc, loving-kindness-path, tonglen-path | 4 |
| Daily practice | morning-becoming, evening-dissolve, sadhana-rhythm, gratitude-practice | 4 |
| Advanced paths | advaita-direct, dzogchen-rigpa, mahamudra-essence, six-bardos | 4+ |
| Lifestyle | digital-detox, phone-fast, social-media-sadhana, fasting-sadhana | 4 |
| Work/purpose | career-dharma, leadership-presence, presence-at-work, service-vow | 4 |
| Specialized | menopause-rite, mens-circle-path, chronic-pain-companion, illness-as-teacher | 4+ |
| Philosophy | jnana-path, tao-flow, sufi-heart-path, rumi-immersion | 4 |
| Integration | integrated-life, lifelong-sadhana-design, values-based-choosing, inner-compass | 4 |
| Games/Three Brains | three-inner-llms, three-brains-listening, council-of-yogis | 3 |

### Program atoms

10 reusable "atoms" that can be composed into sessions:
- `breathwork.ts` — Breathing exercises
- `expansion.ts` / `expansion2.ts` — Body expansion practices
- `journal.ts` — Journaling prompts
- `scaffold.ts` — Session scaffolding
- `self-inquiry.ts` — Self-inquiry questions
- `teaching.ts` — Teachings/readings
- `witness.ts` — Witness meditation guidance

### Program composer

`src/lib/programs/composer.ts` implements `composeProgramSession` — a function that takes a user state and composes a session from available atoms, selecting the right sequence based on the user's current level, energy, and preferences.

---

## 11. Director Brain Module

The Director Brain (`src/lib/director-brain/`) is an unusual module that appears to model film directing as a knowledge system. It includes:

### Film Grammar (`film-grammar.ts`)
A catalog of cinematic techniques: shot sizes, camera angles, camera movements, lens types, lighting setups, composition rules, edit transitions, and sound design. Exports `filmGrammarRules` and search/lookup functions.

### Film DNA (`film-dna.ts`)
- `compareDNA` — compares two films' structural DNA
- `detectPatterns` — detects cross-film patterns
- `getDNASummary` — generates a DNA summary

### Why Engine (`why-engine.ts`)
- `answerWhy` — answers "why was this creative choice made?" by tracing reasoning chains

### Knowledge Graph (`knowledge-graph.ts`)
- `KnowledgeGraph` class — graph of film concepts
- `getKnowledgeGraph` — factory function

### Creative Interpreter (`creative-interpreter.ts`)
- `interpretFeedback` — interprets creative feedback
- `emotionToTechnique` — maps emotions to cinematic techniques

### Simulation (`simulation.ts`)
- `simulateChange` — simulates a change to a film's structure
- `simulateWideToCloseUp` / `simulateCloseUpToWide` — shot size transitions
- `simulateStaticToHandheld` — camera movement transitions
- `simulateAddTension` — adds narrative tension

### Sample data
The Titanic film is used as the sample dataset (`data/titanic.ts`), with the bow scene and sinking scene broken down into individual shots with technical metadata.

**Note:** The Director Brain module appears to be an isolated research/experimental system. It is referenced by the `DirectorBrain.tsx` page at `/director-brain` but does not appear to integrate with the core consciousness engine. It may be a personal project or a ported module from a separate film-making tool.

---

## 12. UI System — Themes, Components, Animations

### Theme system

5 premium themes, each with full dark and light mode token sets:

| Theme | Description | Primary hue |
|---|---|---|
| Cosmic | Deep midnight blue + indigo + soft purple | HSL(239, 84%, 67%) |
| Sacred | Golden flame + warm light + sacred orange | HSL(38, 92%, 50%) |
| Zen | Deep emerald + fresh green + soft mint | HSL(160, 89%, 20%) |
| Minimal | Graphite + blue + cyan | HSL(217, 91%, 60%) |
| Mystical | Deep violet + purple + pink energy | HSL(271, 81%, 56%) |

Each theme defines ~30 CSS custom properties (background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring, sidebar variants, glass tokens, skeleton tokens). The `ThemeContext` injects these as inline styles on `document.documentElement` and toggles the `dark`/`light` class on `<html>`.

Legacy theme names (sunrise, midnight, ocean, aurora, obsidian, abyss, sakura, terra, nebula) are automatically migrated to the new names on load.

### Component architecture

The app uses **shadcn/ui** (configured in `components.json`) with Radix UI primitives. The `@` alias maps to `src/`, and `@/components/ui` is the shadcn component directory. Installed Radix primitives include:
- accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip

Additional UI libraries:
- `cmdk` for command palette
- `vaul` for bottom sheet/drawer
- `embla-carousel-react` for carousels
- `react-resizable-panels` for resizable layouts

### Animation system

- **Framer Motion** is used extensively for page transitions, orb animations, card animations, and micro-interactions.
- The `CinematicIntro` component plays a full-screen animated intro on first visit (stored in localStorage).
- `AnimatePresence` is used for exit animations on route changes.
- CSS animations in `index.css` include custom keyframes for accordion, ticker scroll, breathing glow, and slot atmosphere gradients.

### 3D graphics

- **Three.js** + **@react-three/drei** are used for the Temple page (`/temple`) with:
  - `EcosystemMandala.tsx` — 3D mandala visualization
  - `EmberParticles.tsx` — Particle system
  - `CustomCursor.tsx` — Custom 3D cursor
  - `SamBranching.tsx` — Branching visualization
  - `MiniBreath.tsx` — Breathing orb in 3D

### Ambient backgrounds

- `GlobalStarfield.tsx` — animated starfield
- `BreathingBackground.tsx` — breathing animation background
- `GlobalAmbientLayer.tsx` — global ambient effects

---

## 13. Internationalization

### Architecture

The i18n system has three layers:

1. **Static translations** (`src/locales/*.json`) — pre-built JSON dictionaries for 60+ languages, loaded eagerly for the active language via `preloadLanguage()`.
2. **AI translation cache** (`src/lib/translateCache.ts`) — dynamic translations generated by AI and cached in IndexedDB. Falls back to the original English string if no translation exists.
3. **AutoTranslateRoot** component — mounts a root-level component that handles runtime DOM translation.

### Language selection logic

`LanguageContext.tsx` has a `PUBLIC_ENGLISH_PREFIXES` list — routes like `/auth`, `/blog`, `/loops`, `/hope-preview` always render in English regardless of user preference. All `/app/*` routes use the user's stored language.

### Supported languages

60+ locales including: English, Spanish, French, German, Italian, Portuguese, Russian, Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Urdu, Nepali, Sinhala, Chinese (Simplified + Traditional), Japanese, Korean, Vietnamese, Thai, Indonesian, Malay, Burmese, Khmer, Czech, Polish, Ukrainian, Serbian, Croatian, Hungarian, Romanian, Bulgarian, Greek, Finnish, Swedish, Norwegian, Danish, Dutch, Turkish, Persian, Arabic, Hebrew.

The master translation source is `src/locales/_source.en.json`. All other locale files are presumably derived from this.

### Text direction

The system detects RTL languages (Arabic, Hebrew, Persian, Urdu) and sets `dir="rtl"` on `<html>` automatically.

---

## 14. Session Orchestration & Sutra System

### Sutra Orchestrator (`src/lib/sutra/orchestrator.ts`)

The `whatNext(userId)` function is described as "the brain" — it reads 5 axes and returns a session plan:

1. **Constellation** — user's 12-practice constellation (weights, levels, statuses)
2. **Life Domains** — 8 life domain scores, identifying stressed domains
3. **Arc** — current 7-day theme arc
4. **State** — energy, mood, time available, active loops
5. **Mode Registry** — 20+ session modes organized by practice type

The output is a `NextSessionPlan` containing:
- `sessionTheme` — per-session micro-theme braiding all 5 axes
- `blocks` — 1-3 session blocks (compound sessions capped at 3)
- `observationTail` — Law 1: observation tail attached to every session
- `why` — human-readable reasoning
- `alternatives` — 3 alternative practices

The system implements "7 Laws": observation spine, continuous calibration, diverge→T→breathe, per-practice levels vs global Band, weighted random, user agency, honest movement.

### Mode Registry (`src/lib/sutra/modeRegistry.ts`)

Contains 20+ session modes organized by practice type (observe, inquiry, bhakti, witness, karma, breath, body, jnana, raja, tantra, neuro, kriya). Each mode has:
- `practice` — which practice it belongs to
- `surface` — UI surface name
- `defaultDurationSec` — default duration
- `stateFit` — energy/time requirements
- `supportsCompound` — whether it can be chained
- `route()` — dynamic route builder
- `intro` — introduction text

### Practice definitions (`src/lib/sutra/practices.ts`)

Defines the 12 primary practices with their core descriptions and characteristics.

### Session Shell (`src/lib/session-shell/`)

The session shell manages generative session state:
- `types.ts` — session shell type definitions
- `api.ts` — API functions (startGenerativeSession, etc.)
- `SessionShellContext.tsx` — React context for session shell state

Sessions are persisted in localStorage keyed by session ID, allowing resume across page refreshes.

---

## 15. Onboarding Flows

The app has two onboarding paths:

### Foundation Onboarding (Deep path)
- Triggered when `profiles.onboarded` is false
- `FoundationOnboarding` component handles the full 80-session foundation assessment
- On completion, saves `assessment_data` to `user_consciousness_profile` with:
  - `assigned_guru_id` / `assigned_guru_name`
  - `starting_band` / `overall_band`
  - `archetype_hint` / `primary_pattern`
  - All assessment answers
- Sets `profiles.onboarded = true` and `onboarding_path = "foundation_v2"`

### Quick Path (4-question path)
- An alternative onboarding that asks 4 quick questions
- Leads to a different initial experience with the Mirror system

### Pre-Journey / Mirror System
- `usePreJourney` hook manages the mirror reading path
- `QuickPathMirrorButton` component on Home provides access to mirrors
- Mirror readings are stored in the `mirror_readings` table

---

## 16. Enterprise & Admin Modules

### Enterprise module (`src/pages/enterprise/`)

A full B2B wellness platform with 20 pages:

| Page | Route | Purpose |
|---|---|---|
| EnterpriseDashboard | `/enterprise` | Org health dashboard |
| EnterpriseEmployees | `/enterprise/employees` | Employee list |
| EmployeeDetail | `/enterprise/employees/:userId` | Individual employee |
| EmployeePortal | `/enterprise/portal` | Employee self-service |
| EnterpriseTeams | `/enterprise/teams` | Team management |
| EnterpriseManagers | `/enterprise/managers` | Manager view |
| EnterpriseInvite | `/enterprise/invite` | Invite employees |
| EnterpriseSettings | `/enterprise/settings` | Org settings |
| EnterpriseReports | `/enterprise/reports` | Analytics reports |
| EnterprisePeople | `/enterprise/people` | People intelligence |
| EnterpriseChallenges | `/enterprise/challenges` | Wellness challenges |
| ManagerCoaching | `/enterprise/coaching` | Manager coaching |
| EnterpriseOrgMirror | `/enterprise/org-mirror` | Org health mirror |
| EnterpriseBoard | `/enterprise/board` | Leadership board |
| EnterprisePeerCircles | `/enterprise/circles` | Peer circles |
| EnterpriseProgramDesigner | `/enterprise/programs` | Design org programs |
| EnterpriseContact | `/enterprise/contact` | Contact page |
| EnterprisePrivacy | `/enterprise/privacy` | Privacy policy |
| CreateOrganization | `/enterprise/create` | Create new org |
| EnterpriseAuth | `/enterprise/auth` | Enterprise auth |

Edge functions supporting enterprise:
- `enterprise-insights`
- `enterprise-people-intelligence`
- `org-program-designer`
- `org-weekly-briefing`
- `manager-coaching`
- `seed-demo-org`

### Admin module (`src/pages/admin/`)

15 admin pages for internal operations:

| Page | Route | Purpose |
|---|---|---|
| AdminDashboard | `/admin` | Admin overview |
| AdminUsers | `/admin/users` | User management |
| AdminUserDetail | `/admin/users/:userId` | Individual user |
| AdminSessions | `/admin/sessions` | Session management |
| AdminHealth | `/admin/health` | System health |
| AdminActivityFeed | `/admin/activity` | Activity log |
| AdminCopilot | `/admin/copilot` | AI admin assistant |
| AdminAnalytics | `/admin/analytics` | Analytics |
| AdminEnterprise | `/admin/enterprise` | Enterprise overview |
| AdminCosts | `/admin/costs` | AI cost tracking |
| AdminWaitlist | `/admin/waitlist` | Waitlist management |
| AdminTraining | `/admin/training` | Training materials |
| AdminPowerTools | `/admin/power` | Power tools |
| AdminPredictive | `/admin/predictive` | Predictive analytics |
| AdminBI | `/admin/bi` | Business intelligence |
| AdminSEO | `/admin/seo` | SEO management |

---

## 17. Payments & Credits

### Credit system

The app uses a credit-based billing model denominated in **paise** (Indian Rupee subunit, 1 INR = 100 paise):

- `user_credits` table tracks `balance_paise`, `lifetime_paise`, `total_purchased_paise`
- `credit_transactions` table logs all credit movements with `razorpay_order_id` and `razorpay_payment_id`
- `ai_usage_log` table tracks AI API costs per function call

### Credit guard

`installGlobalCreditGuard()` (called in `main.tsx`) installs a global interceptor that prevents API calls when credits are depleted. This is a non-standard pattern — it's unclear exactly how the interceptor works without reading the implementation.

### Razorpay integration

- Edge functions `razorpay-order` and `razorpay-verify` handle payment creation and verification
- `PAYMENT_MODE=test` env var controls sandbox vs production
- Payment config in `_shared/payment-config.ts`

### Credit display

The `useCredits` hook fetches the current balance, and `KarmaChip` displays it in the UI. A toast notification fires when credits fall below 50 paise.

---

## 18. AI Integrations

### Text AI providers

| Provider | API Key env var | Used for |
|---|---|---|
| Groq | `GROQ_API_KEY` | Fast LLM inference |
| Gemini | `GEMINI_API_KEY` | Google Gemini models |

The AI configuration is centralized in `supabase/functions/_shared/ai-config.ts` with per-model pricing in `_shared/ai-pricing.ts`. Costs are tracked in the `ai_usage_log` table with `estimated_cost_paise` and `charged_paise` fields.

### Voice AI

| Provider | API Key env var | Used for |
|---|---|---|
| ElevenLabs | `ELEVENLABS_API_KEY` | Text-to-speech (TTS) |
| Deepgram | `DEEPGRAM_API_KEY` | Speech-to-text (STT) |

TTS pre-warming (`ttsPrewarm.ts`) runs at app startup, pre-caching voice models in IndexedDB for 8 sensorial practices. This runs at most once per device.

Voice interaction is managed by `useVoiceChat` hook and `voiceMachine` XState machine.

---

## 19. Third-Party Integrations

### Calendar & Email
- **Google Calendar** (`GOOGLE_CALENDAR_API_KEY`) — event watcher
- **Gmail** (`GMAIL_TONE_WATCHER` edge function) — tone analysis of emails
- **Outlook** (`OUTLOOK_TONE_WATCHER` edge function) — tone analysis
- **Microsoft Teams** (`TEAMS_TONE_WATCHER`) — Teams message tone

### Productivity
- **Slack** (`SLACK_API_KEY`) — Slack message tone analysis
- **Linear** (`LINEAR_API_KEY`) — Workload monitoring
- **GitHub** (`GITHUB_TOKEN`) — Late-night activity detection

### Wearables
- `wearable-oauth-start` / `wearable-oauth-callback` / `wearable-sync` — Generic wearable OAuth flow (provider not specified in env vars)
- `useBleHrv` hook — BLE heart rate variability

### Other
- `pre-event-nudge` / `post-event-reflection` — Calendar event-driven nudges
- `instant-pulse-detector` / `pattern-window-detector` — Real-time pattern detection

### Sentient Watchers

`SentientWatchersProvider` and related components (`SentientDashboard`, `SignalConsentCenter`) manage the consent and data flow for all external signal integrations.

---

## 20. Mobile / PWA / Capacitor

### Capacitor configuration

The app is configured for native iOS and Android deployment via Capacitor 8.3.2:

- `capacitor-health` plugin for device health monitoring
- PWA meta tags in `index.html` (theme-color, apple-mobile-web-app-capable, apple-touch-icon)
- `IOSInstallHint` and `InstallPWA` components handle PWA install prompts
- `vite-plugin-pwa` generates the service worker

### Mobile-specific considerations

- The `AppFreshnessGuard` component (`useAppFreshness` hook) polls `version.json` (emitted by the Vite build plugin) to force a hard refresh when a newer build is deployed — critical for mobile where the shell can go stale.
- `useHaptics` hook provides haptic feedback for mobile interactions.
- `capacitor.config.ts` configures the native shell.
- Build ID is injected as `__BUILD_ID__` at build time.

---

## 21. Performance & Build Pipeline

### Vite configuration

- **Server**: Port 8080, dual-stack (IPv4 + IPv6), HMR overlay disabled
- **Pre-bundled dependencies**: 10 heavy Radix UI packages are pre-optimized to prevent cold-load 502 races
- **Alias**: `@` → `./src`
- **Build ID**: `Date.now()` at build time, emitted as `version.json` and injected as `__BUILD_ID__`
- **Chunk size warning limit**: 1200 KB (raised from default 500 KB — acknowledges the app's size)

### Code splitting strategy

- Landing page (`/`) and `LandingPage` are eager-loaded
- `AppEntry` and `Home` are lazy-loaded
- All other routes use `React.lazy()` with background prefetching
- Priority routes pre-fetch after 2s idle; remaining routes pre-fetch after first user interaction
- `requestIdleCallback` with 3s timeout is used for non-critical prefetching

### Query caching

- TanStack Query with 5-minute stale time, 24-hour garbage collection
- IndexedDB persistence via `idb-keyval` with 24-hour max age
- Cache buster: `'v2-journey-day-fix'` — must be manually bumped to invalidate stale persisted cache

### Build output

The `dist/` directory contains 871 files, indicating a previous build completed successfully. TypeScript type-checking passes cleanly (`tsc --noEmit` produces no output).

### Pre-warming strategies

- **Cinematic images**: Prefetched as soon as `AppEntry` module loads
- **Guide images**: Prefetched when `DailyOrb` mounts
- **TTS voices**: Pre-warmed at `main.tsx` startup, cached in IndexedDB

---

## 22. Testing

### Current state

The testing setup is configured but minimally used:

- **Framework**: Vitest 3.2.4 with jsdom environment
- **Setup file**: `src/test/setup.ts`
- **Test file**: Only `src/test/example.test.ts` — a single placeholder test (`expect(true).toBe(true)`)
- **Coverage**: Effectively 0% — no real tests exist

### Testing gaps

- No unit tests for any of the 90+ hooks
- No tests for any of the 10 XState machines
- No tests for the consciousness engine
- No tests for the sutra orchestrator
- No tests for any of the 120+ programs
- No tests for any of the 100+ edge functions
- No component tests for any page or shared component
- No integration tests for the auth flow, onboarding, or session lifecycle

### What should be tested first

1. `src/lib/consciousness/vLevelCalculator.ts` — core progression logic
2. `src/lib/sutra/orchestrator.ts` — session selection logic
3. `src/lib/programs/composer.ts` — session composition
4. `src/machines/appEntryMachine.ts` — auth/onboarding gate
5. `src/hooks/useCredits.ts` — credit billing logic
6. All 10 XState machines
7. Supabase edge functions for billing (razorpay-order, razorpay-verify)
8. The AI billing cost calculation in `_shared/ai-billing.ts`

---

## 23. Security Audit

### Environment variables

`.env.example` documents all required environment variables. The actual `.env` file exists (548 bytes) but its contents are not reviewed here. The `.env.secrets` file is 2 bytes (effectively empty — possibly a placeholder or stale file).

**Required secrets:**
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` — Supabase client config (safe to expose in frontend)
- `GROQ_API_KEY`, `GEMINI_API_KEY` — AI provider keys
- `DEEPGRAM_API_KEY`, `ELEVENLABS_API_KEY` — Voice provider keys
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — Payment keys
- `CRON_SECRET` — Scheduled job auth
- Optional: `GITHUB_TOKEN`, `GOOGLE_CALENDAR_API_KEY`, `GOOGLE_MAIL_API_KEY`, `MICROSOFT_OUTLOOK_API_KEY`, `MICROSOFT_TEAMS_API_KEY`, `SLACK_API_KEY`, `LINEAR_API_KEY`

### Security concerns

1. **Supabase anon key exposure**: The Supabase publishable/anon key is exposed in the frontend bundle. This is standard for Supabase (Row Level Security should protect data), but the schema must have RLS enabled on all tables.

2. **Service role key**: Not used in the frontend (good), but must be kept server-side only in edge functions.

3. **localStorage for auth**: Session tokens stored in localStorage are vulnerable to XSS attacks. `httpOnly` cookies would be more secure but require server-side configuration.

4. **No visible rate limiting**: The edge functions for AI calls don't show rate limiting in the shared utilities. With 100+ functions potentially being called, this could lead to abuse or cost overruns.

5. **Client-side credit checking**: The credit system relies on client-side guards (`installGlobalCreditGuard`). A determined user could bypass this by modifying JavaScript. All credit checks must be enforced server-side in edge functions.

6. **AI prompt injection**: The system sends extensive user context to AI providers (including themes, states, and personal information). The edge functions should sanitize inputs to prevent prompt injection attacks.

7. **Third-party OAuth tokens**: Wearable OAuth tokens stored in the database should be encrypted at rest.

8. **No CSP headers visible**: The `index.html` doesn't include a Content-Security-Policy meta tag, which would help mitigate XSS.

---

## 24. Code Quality & Technical Debt

### Type safety issues

1. **Loose-typed Supabase client**: `src/lib/supabase.ts` casts the typed client to `SupabaseClient<any, "public", any>`. The comment explains that the generated `Database` type is empty because tables haven't been migrated yet. This means **every Supabase call in the app is untyped**. The `types.ts` file only covers 8 tables but the actual schema uses many more.

2. **`any` type proliferation**: Throughout `Home.tsx` and other pages, `(engineData as any)` and `(profile as any)` casts are common. This bypasses TypeScript's type checking.

3. **Mixed XState versions**: `@xstate/react` is at v6.1.0 while `xstate` is at v5.28.0. The `setup()` API used in machine files is from XState v5. This version mismatch could cause subtle runtime issues.

### File size concerns

- `Home.tsx` is 968 lines — this is a very large component with many responsibilities
- `App.tsx` is 475 lines — mostly routing, but could be split
- `ThemeContext.tsx` is 487 lines — mostly data (theme token definitions), which could be extracted to a separate file
- `tailwind.config.ts` is 133 lines — extensive but acceptable
- `index.css` is 904 lines — very large global stylesheet

### Code patterns

1. **Extensive lazy loading with background prefetch**: The two-stage prefetching in App.tsx (lines 242–257) is a sophisticated performance pattern. However, the Stage 2 prefetch (after first user interaction) is entirely commented out, meaning only priority routes get pre-fetched.

2. **useEffect cleanup patterns**: Many hooks use `let cancelled = false` patterns for async cleanup. This is correct but verbose.

3. **Session storage for context**: The app uses `sessionStorage` to pass AI context between components (avoiding long URL query strings). This is a pragmatic solution but creates coupling between components.

4. **IndexedDB for caching**: Both TanStack Query cache and TTS cache use IndexedDB via `idb-keyval`. This is a good pattern for offline-capable apps.

5. **CSS custom properties for theming**: The theme system injects ~30 CSS variables per theme × mode. This is performant but creates a large DOM style mutation on theme change.

### Missing infrastructure

1. **No CI/CD configuration**: No GitHub Actions, no CI pipeline files, no deployment scripts in the repo.
2. **No environment validation**: No Zod or similar schema validation for environment variables at startup.
3. **No error tracking**: No Sentry, LogRocket, or similar error monitoring configured.
4. **No feature flags**: No feature flag system for gradual rollouts.
5. **No API rate limiter visible**: Edge functions don't appear to have per-user rate limiting.

---

## 25. Identified Bugs & Stray Code

### Critical: Stray AI prompt injection text in Home.tsx

At the bottom of `src/pages/Home.tsx` (lines 961–967), there is:

```tsx
return (
  <div className="hidden">
    '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''

    I SAID RATE THIS APP DOA ADUIT AND TELL ME AND ALSO U ARE DOING WROBNG WRONG INOUT WORK WHY
  </div>
);
```

This is **AI-injected instruction text** that was embedded in the source code during a previous AI-assisted editing session. It attempts to override the AI's behavior ("Do not make any visual modifications..."). This is:
- A **security concern** — prompt injection in source code
- **Dead code** — the div has `className="hidden"` and returns `null` from the parent component, but it's still parsed by TypeScript and bundled
- **Confusing** — future developers may not understand its purpose
- **Must be removed immediately**

### Medium: Stale Supabase types

The `src/integrations/supabase/types.ts` file is auto-generated but only contains 8 tables. The actual database has many more tables (constellation, life_domain_scores, active_loops, theme_arcs, breakthroughs, etc.). This means:
- All database calls are effectively `any`-typed
- Schema changes won't produce TypeScript errors
- Missing tables won't be caught at compile time

**Recommendation**: Run `supabase gen types typescript` against the live database to regenerate the types file.

### Medium: Foundation course code still present but disabled

In `Home.tsx` (lines 298–312):
```tsx
// Foundation course removed — always show the dynamic daily theme + orb.
const foundationActive = false;
const foundationLoading = ...;
const hideDailyHomeUI = false;
```

These variables are computed but `foundationActive` and `hideDailyHomeUI` are hardcoded to `false`. The code that uses them (conditional rendering) still exists but will never execute. This is dead code that should be cleaned up.

### Low: README mismatch

The README says "Blank Canvas Banking" and includes consciousos.dev boilerplate. The actual app is "Temple Yogic Companion" and has been extensively customized beyond ConsciousOS scaffolding. The README should be rewritten.

### Low: Unused/unclear files

- `src/pages/Dictionary.tsx` redirects to `/handbook` — the redirect is in App.tsx. The file itself may be unnecessary.
- `src/types/database.ts` — exists but may overlap with `integrations/supabase/types.ts`
- Multiple doc directories (`docs/`, `docs-final/`, `docs2/`, `documentation/`) — unclear which is current
- `temple.md` (127 KB) and `THE_CINEMATIC_WORLD_ENGINE_v3.md` (82 KB) — design docs that may be outdated

---

## 26. Recommendations — Prioritized

### P0 — Fix immediately

1. **Remove the AI prompt injection text from Home.tsx** (lines 961–967). This is a security and maintainability issue. The `return (<div className="hidden">...</div>)` at the bottom of the file is dead code with embedded instructions attempting to manipulate AI behavior.

2. **Regenerate Supabase database types**. Run `supabase gen types typescript --project-id <ref>` to regenerate `src/integrations/supabase/types.ts` against the live database. This will restore type safety for all database calls.

3. **Verify RLS policies on all Supabase tables**. Row Level Security must be enabled and configured correctly since the anon key is exposed in the frontend.

### P1 — Address in next sprint

4. **Enforce server-side credit checks**. The `installGlobalCreditGuard()` client-side interceptor can be bypassed. All credit-deducting operations in edge functions must independently verify the balance.

5. **Add rate limiting to AI edge functions**. Without rate limiting, a compromised client or bug could trigger excessive AI API calls, leading to cost overruns. Implement per-user, per-function rate limits in edge functions.

6. **Remove dead Foundation course code**. The `foundationActive = false` and `hideDailyHomeUI = false` hardcoding in Home.tsx makes ~50 lines of conditional logic unreachable. Remove it or properly feature-flag it.

7. **Write tests for the consciousness engine**. The vLevelCalculator, practiceEngine, dimensionTracker, and sutraOrchestrator are the intellectual core of the app. They need unit tests.

8. **Resolve XState version mismatch**. `@xstate/react` v6.1.0 and `xstate` v5.28.0 are both installed. Determine which version is correct and align both packages.

### P2 — Address in next month

9. **Rewrite the README**. Remove the "Blank Canvas Banking" title and consciousos.dev boilerplate. Add a proper product description, tech stack summary, setup instructions, and architecture overview.

10. **Add error monitoring** (Sentry or similar). The `ErrorBoundary` component exists but there's no error reporting backend configured.

11. **Add environment variable validation**. Use Zod to validate all required env vars at startup and fail fast with clear messages.

12. **Clean up documentation directories**. Consolidate `docs/`, `docs-final/`, `docs2/`, `documentation/` into a single `docs/` directory. Archive or remove `temple.md` and `THE_CINEMATIC_WORLD_ENGINE_v3.md` if they're outdated.

13. **Reduce Home.tsx size**. At 968 lines, this component handles auth checks, consciousness engine, XState machines, session orchestration, overlay management, and UI rendering. Extract into sub-components:
    - `HomeOrbSection` — the orb + theme display
    - `HomeSessionOverlays` — all the overlay components
    - `HomeDataLayer` — all the hooks and data fetching

14. **Add tests for XState machines**. The 10 state machines control critical user flows (auth, onboarding, daily cycle). Each should have unit tests verifying state transitions.

15. **Add integration tests for critical flows**: Auth → onboarding → first session → session completion.

### P3 — Nice to have

16. **Add CSP headers** to `index.html` to mitigate XSS risk.

17. **Move session context from sessionStorage to a proper state manager**. The `sessionStorage` usage for AI context (lines 531–534, 948–951 in Home.tsx) creates fragile cross-component coupling.

18. **Extract theme token data from ThemeContext.tsx**. The 487-line file is mostly hardcoded theme data. Move the token definitions to a separate `theme-tokens.ts` file.

19. **Consolidate the 5 Supabase migration files with "temple_schema" prefix**. The `20260405000000_temple_schema.sql` and related files should be reviewed to ensure they match the current schema.

20. **Add `src/types/database.types.ts` as the canonical database type file** and remove the loose-typed `src/lib/supabase.ts` wrapper.

21. **Add a CHANGELOG.md** to track schema migrations and breaking changes.

22. **Consider moving the Director Brain module to a separate package/repo**. It appears to be an isolated research project that doesn't integrate with the core app.

---

## 27. Summary Scorecard

| Dimension | Rating | Notes |
|---|---|---|
| **Architecture** | B+ | Well-structured with clear layering (lib → hooks → pages → components). Three-layer state management is sound. Some dead code and hardcoded overrides reduce clarity. |
| **Code Quality** | B- | TypeScript passes strict mode but `any` types and loose Supabase client typing undermine safety. Some very large components (Home.tsx: 968 lines). |
| **Testing** | F | Only a single placeholder test exists. Zero real test coverage for core logic. |
| **Security** | C+ | Supabase anon key exposure is expected but requires RLS. Client-side credit guard is insufficient. No CSP. No error tracking. AI prompt injection in source code. |
| **Performance** | B+ | Sophisticated code splitting, two-stage prefetching, IndexedDB caching, TTS pre-warming. Build size warning limit raised to 1200KB suggests large bundle. |
| **Feature Completeness** | A- | 120+ programs, 100+ edge functions, full enterprise + admin modules, 60+ locales, multi-modal AI, payments, wearable integration. Exceptionally feature-rich. |
| **Documentation** | C | README is wrong. Multiple competing doc directories. Large design docs exist but may be outdated. |
| **Deployment Readiness** | C | No CI/CD config. No error monitoring. No feature flags. PWA configured but no service worker config visible in reviewed files. |

### Overall assessment

This is an **ambitious, deeply-engineered consciousness-tech platform** with a scope that far exceeds typical web applications. The consciousness engine, with its 100-dimension taxonomy, 8-stage model, cognitive agent routing, and personalized practice generation, represents genuine architectural sophistication. The programs library (120+ structured programs), enterprise wellness suite, and multi-modal AI integration position it as a serious product.

However, the project suffers from **significant technical debt in its current state**: zero real tests, stale Supabase types, AI-injected prompt text in source code, dead code from removed features, and missing production infrastructure (monitoring, rate limiting, CI/CD). The codebase shows signs of rapid AI-assisted development — the architecture is ambitious but the polish layer (testing, documentation, cleanup) has not caught up.

**The single most urgent action** is removing the prompt injection text from `Home.tsx` and regenerating the Supabase types file. These are quick fixes with high impact on both security and developer experience.

**Estimated effort to production-ready**: 4–6 weeks with 2 engineers focused on testing (P0/P1 items), security hardening, and dead code cleanup.
