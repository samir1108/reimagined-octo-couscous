  # ConsciousOS (HOPE / sat-yug) — The Complete System Architecture

  > One consolidated reference for the entire platform: the consciousness model, every engine,
  > the session system end-to-end, the backend (Supabase + 102 edge functions), the database
  > (173 migrations), the frontend platform, content libraries, enterprise/admin, and
  > infrastructure. Compiled from a full read of `src/`, `supabase/functions/`,
  > `supabase/migrations/`, the `architecture/` folder, `SESSION_FLOW.md`, and
  > `PLATFORM_OVERVIEW.md`.
  >
  > **Audience:** engineers, CTO, CEO, investors, onboarding engineers.
  > **Convention:** every claim carries a `file` or `file:line` reference where available.

  ---

  ## Table of Contents

  - **PART 0 — Orientation**
    - 0.1 What this system is
    - 0.2 Repository map
    - 0.3 Tech stack
    - 0.4 The verified numbers
    - 0.5 The master system map
    - 0.6 The four-layer mental model
  - **PART 1 — The Consciousness Model (the "What")**
    - 1.1 Bands — the 11 levels
    - 1.2 Micro-levels — 33 addressable sub-stages
    - 1.3 The six dimensions (+96 sub-dimensions)
    - 1.4 V-Level mathematics (client v1 and server v2)
    - 1.5 Calibration, caps, and time decay
    - 1.6 Speed profiles
    - 1.7 Level-up tracks and quality ranges
    - 1.8 Bypassing detection and the golden rules
    - 1.9 Anti-guilt design and regression policies
    - 1.10 The hidden stage model (8 stages)
    - 1.11 Chakras, archetypes, and states
    - 1.12 Spiritual DNA, kundli, and life stage
    - 1.13 The supporting engine file map
  - **PART 2 — The Shared Substrate: `getUserContext()`**
    - 2.1 The `UserContext` contract
    - 2.2 Gates, energy, and time budget
    - 2.3 Who consumes it
  - **PART 3 — The Engine Room (all engines, one by one)**
    - 3.1 The V-Level / consciousness engine (server-authoritative)
    - 3.2 The Practice Engine
    - 3.3 The Adaptive Engine (per-turn AI directive)
    - 3.4 The Session Engine family (four generations)
    - 3.5 The Composer Framework (deterministic) and compose-session-v3 "Sankalpa Engine"
    - 3.6 The Adaptive Journey Engine (levels, adaptation, recalibration)
    - 3.7 The Loop Detector stack (local → live → cron)
    - 3.8 Guide Modes and Master/Guru selection (4 selectors + crisis gate)
    - 3.9 The Memory System (layers, embeddings, synthesis, sacred moments)
    - 3.10 The Theme system (daily themes and living arcs)
    - 3.11 The Dimension Tracker
    - 3.12 The Retention Engine
    - 3.13 The Speed Profile Engine
    - 3.14 The Companion Engine
    - 3.15 Signal Fusion (workplace watchers, wearables, ingest)
    - 3.16 The Curiosity Engine
    - 3.17 Chakra, kosha, three-brain, and kundli engines
  - **PART 4 — The Session System (deep dive)**
    - 4.1 What a session is; the four phases
    - 4.2 The four daily gates
    - 4.3 Session lifecycle end-to-end (orb tap → spine score)
    - 4.4 The four parallel session architectures
    - 4.5 Session Flow Orchestrator: morning / evening / night scripts
    - 4.6 Chat sessions: `sessionMachine` + streaming
    - 4.7 The session-shell generative runtime
    - 4.8 Session completion, karma, and spine scoring
    - 4.9 Mid-session adaptation (`adapt-next-block`, `session-adapter`)
    - 4.10 `src/lib/session/*` — the structured session library
    - 4.11 The voice loop (STT/TTS)
    - 4.12 Cinematic practice runs
  - **PART 5 — The Backend**
    - 5.1 Supabase architecture
    - 5.2 Anatomy of an edge function
    - 5.3 The `_shared` module catalog (30 modules)
    - 5.4 Complete edge-function inventory (102 functions)
    - 5.5 The AI gateway and model routing
    - 5.6 Credits and billing
    - 5.7 Security: rate limits, sanitization, crisis gate
    - 5.8 Scheduled / cron workloads
    - 5.9 Realtime channels
  - **PART 6 — The Database**
    - 6.1 Migration history narrative
    - 6.2 Domain-by-domain schema
    - 6.3 Row-Level Security patterns
    - 6.4 ER-style relationship summary
  - **PART 7 — The Frontend Platform**
    - 7.1 Stack and build
    - 7.2 Routing and code splitting
    - 7.3 AppEntry, onboarding variants
    - 7.4 AppLayout shell
    - 7.5 The 11 XState machines
    - 7.6 Hooks and React Query layer
    - 7.7 The design system ("sacred obsidian")
    - 7.8 The cinematic system
    - 7.9 Temple mode
    - 7.10 Internationalization
    - 7.11 PWA and mobile (Capacitor)
    - 7.12 Games
  - **PART 8 — Content and Data Libraries**
    - 8.1 The Loop library
    - 8.2 Practice ladders
    - 8.3 Sensorial practices
    - 8.4 Programs and the Foundation course
    - 8.5 Masters roster detail
    - 8.6 Sacred texts and wisdom content
  - **PART 9 — Enterprise and Admin**
    - 9.1 The enterprise module
    - 9.2 The admin panel
  - **PART 10 — Infrastructure and Deployment**
  - **PART 11 — End-to-End Walkthroughs**
    - 11.1 A day in the life (full trace)
    - 11.2 One composed session, engine by engine
    - 11.3 One loop detection, end to end
    - 11.4 One memory recall, end to end
  - **PART 12 — Cross-Cutting Observations**
    - 12.1 Generational layering (architecture archaeology)
    - 12.2 Feature flags and retired-in-place code
    - 12.3 Known smells and risks
    - 12.4 What is genuinely defensible

  ---

  # PART 0 — ORIENTATION

  ## 0.1 What this system is

  **ConsciousOS** (product name **HOPE**, repo name **sat-yug**) is an AI-guided companion
  for consciousness development. Its stated thesis is the **"anti-app"**: an operating system
  for the inner life that is designed so the user needs it *less* over time, not more
  ("graceful disappearance" — see §3.3, §12.4).

  It runs a personalized daily rhythm (morning / midday / evening / night "gates") on top of a
  proprietary stack of interlocking systems:

  - A **psychometric model**: 11 consciousness Bands × 3 micro-levels (33 addressable
    sub-stages), 6 primary dimensions (+96 tracked sub-dimensions), 300–600+ named behavioral
    **loops**, 6 life domains, 7 chakras, an 8-stage hidden model, spiritual DNA, and a Vedic
    astrology (kundli) layer.
  - An **engine room**: V-Level engine, practice engine, adaptive (per-turn AI directive)
    engine, session engine, composer ("Sankalpa") engine, adaptive-journey engine, loop
    detector, memory system, theme/arc engine, dimension tracker, retention engine, speed-profile
    engine, companion engine, signal-fusion engine, curiosity engine, chakra/kosha/three-brain
    engines.
  - A **content library**: 270+ interactive games, 120+ structured programs, practice ladders
    (pranayama, neti-neti, self-inquiry), ~25 sensorial practices, an 89-entry masters roster,
    sacred texts, wisdom decks, and an auto-generating SEO blog.
  - A **platform**: React 18 + Vite SPA, PWA, Capacitor iOS/Android apps, a Supabase backend
    (Postgres + Auth + Storage + Realtime + pgvector + 102 Deno edge functions), a Razorpay
    credit-based billing system, a full B2B enterprise module, and an internal admin panel.

  Three names, one product:

  | Name | Where it appears |
  |---|---|
  | **ConsciousOS** | architecture docs, investor materials, `architecture/README.md` |
  | **HOPE** | `README.md` ("HOPE — A companion for becoming"), landing pages |
  | **sat-yug** | repo/package name (`package.json: "name": "satyug"`) — the Sat Yuga / golden-age metaphor |

  ## 0.2 Repository map

  ```text
  sat-yug/
  ├── src/                      # The React SPA (the entire consumer app)
  │   ├── components/           #  shadcn/ui base + custom feature components
  │   ├── pages/                #  52 top-level pages (Home, Guide, Temple, admin/, enterprise/…)
  │   ├── hooks/                #  105 hooks (useThemeOfDay, useGuideChat, useLiveDetection, …)
  │   ├── machines/             #  11 XState machines
  │   ├── contexts/             #  Cinematic, SessionOrchestrator, PracticeRun, Language, Sound, Theme
  │   ├── lib/                  #  27 sub-libraries — the client-side engine room (see §7.6)
  │   │   ├── consciousness/    #    V-Level calculator, practice engine, dimension tracker, …
  │   │   ├── composer/         #    deterministic 3-layer composer
  │   │   ├── session/          #    structured session library (adapters, thread, moments…)
  │   │   ├── session-shell/    #    generative-session runtime (api, context, types)
  │   │   ├── cinematic/        #    script registry + authored scripts (kriya, pranayama, witness)
  │   │   ├── sutra/            #    12-practice constellation model, mode registry, orchestrator
  │   │   ├── memory/           #    client long-term-memory bridge
  │   │   ├── director-brain/   #    prompt direction
  │   │   └── …                 #    analytics, breakthroughs, graph, journey, mirrors, …
  │   ├── data/                 #  Static content: loops, ladders, programs, sensorial practices,
  │   │                         #  foundation course, handbooks, human map, onboarding, mirrors
  │   ├── games/                #  ~30 consciousness games (WitnessRoom, RedDoor, TwoChairs, …)
  │   ├── temple/               #  Temple-mode components
  │   ├── locales/              #  ~40 UI locales
  │   └── types/                #  consciousness.ts and other canonical types
  ├── supabase/
  │   ├── functions/            #  102 edge functions + _shared/ (30 shared Deno modules)
  │   └── migrations/           #  173 SQL migrations (March 2026 → July 2026)
  ├── android/  ios/           #  Capacitor native shells
  ├── extension/                #  A browser extension (manifest.json)
  ├── architecture/             #  Curated per-topic architecture docs (engine/, platform/, ip/)
  ├── documentation/            #  Blueprints, founder-exam bible, transformation blueprint
  ├── docs/                     #  Marketing playbooks + roadmaps (+ this document)
  ├── scripts/                  #  capture-screens, emit-mirror-migrations, …
  ├── capacitor.config.ts       #  Mobile wrapper config
  ├── vercel.json               #  Deployment config (SPA fallback, headers)
  └── vite.config.ts            #  Build (React SWC, PWA plugin, chunking)
  ```

  ## 0.3 Tech stack

  | Layer | Technology |
  |---|---|
  | Frontend framework | React 18 + TypeScript + Vite 5 (`@vitejs/plugin-react-swc`) |
  | Styling | Tailwind CSS v3 + shadcn/ui (Radix primitives) + Framer Motion |
  | State | XState v5 (`setup().createMachine()`) + TanStack Query v5 (IndexedDB-persisted) |
  | 3D / visual | three.js + @react-three/drei (orb, starfield, temple visuals) |
  | Backend | Supabase: Postgres (RLS + pgvector), Auth, Storage, Realtime, Deno Edge Functions |
  | AI providers | Groq (`llama-3.1-8b-instant`, `llama-3.3-70b-versatile`), Google Gemini (`text-embedding-004`), OpenAI (premium tier), ElevenLabs (TTS), Deepgram (STT) — behind a "ConsciousOS AI Gateway" abstraction (`_shared/ai-config.ts`) |
  | Payments | Razorpay (`razorpay-order` / `razorpay-verify` edge functions, paise-denominated credits) |
  | Mobile | Capacitor 8 (iOS + Android) + Tauri CLI in devDependencies |
  | PWA | `vite-plugin-pwa` (installable, offline cache) |
  | Testing | Vitest + Testing Library + jsdom; Playwright for screen capture tooling |
  | Lint / types | ESLint 9 flat config, typescript-eslint |
  | Hosting | Vercel (`vercel.json`) for the SPA; Supabase for data/functions |

  ## 0.4 The verified numbers

  Counted directly from the tree at the time of writing (previous docs said 105/125/134 — the
  tree has grown):

  | Metric | Value | Source |
  |---|---|---|
  | Edge functions | **102** (+ `_shared/` modules) | `supabase/functions/*` directory listing |
  | Shared edge modules | **30** | `supabase/functions/_shared/*` |
  | SQL migrations | **173** | `supabase/migrations/*` |
  | XState machines | **11** (appEntry, dailyCycle, home, insights, journal, journey, notifications, practice, session, sessionPlayer, settings, voice — one is a player variant) | `src/machines/*` |
  | Top-level pages | **52** | `src/pages/*` |
  | React hooks | **105** | `src/hooks/*` |
  | Client lib sub-folders | **27** | `src/lib/*` |
  | UI locales | **~40** | `src/locales/*` |
  | Consciousness bands | 11 (0–10), 33 sub-stages | `src/types/consciousness.ts` |
  | Loop catalog | 400–600+ entries (20–27 category codes; ~100 wired into keyword detection) | `src/data/loops.ts`, `src/lib/localLoopDetector.ts` |
  | Masters/guides | **89+ entries** in `TEMPLE_GUIDES` (25 fictional, 64+ real) across 18 categories | `src/lib/temple-guides.ts` (3,564 lines) |
  | Guide chat modes | **25** | `src/lib/guideModes.ts` |
  | Games | ~30 in `src/games/games/` (product claims 270+ including micro-exercises) | `src/games/*` |
  | Cinematic scripts | 3 authored (`kriya-energetic`, `pranayama`, `witness`) | `src/lib/cinematic/scripts/*` |
  | DB tables | ~200+ distinct | migrations |
  | Programs | 120+ | `src/data/programs/*` |
  | Sensorial practices | ~25 files | `src/data/sensorialPractices/*` |

  ## 0.5 The master system map

  ```text
                          ┌──────────────────────────────────┐
                          │            USER                  │
                          │  morning · midday · evening ·    │
                          │            night                 │
                          └───────────────┬──────────────────┘
                                          │ opens app (press-and-hold orb)
                                          ▼
                          ┌────────────────────────────────┐
                          │   Home / Guide / Temple UI      │
                          │  (React + Vite + Tailwind)      │
                          │   XState machines drive flow    │
                          │   session-shell runs composed   │
                          │   step plans; sessionMachine    │
                          │   runs chat streams             │
                          └───────────────┬────────────────┘
                                          │ invoke edge fn (auth + credits)
                                          ▼
              ┌──────────────────────────────────────────────────────┐
              │  supabase/functions/_shared/user-context.ts          │
              │  getUserContext() — "The Brain"                      │
              │  → identity, band, vLevel, dimensionBands, loops,   │
              │    gate, energy, theme, engineSignals, foundation,   │
              │    program, spiritual DNA, behavior (7–30d stats)     │
              └───────────────┬───────────────────────┬──────────────┘
                              │                       │
            ┌────────────────▼────────────┐   ┌──────▼──────────────┐
            │   COMPOSER (Layer 1–3)     │   │  ADAPTIVE JOURNEY   │
            │   archetypes · ingredients │   │  ENGINE             │
            │   compose-session (thin)   │   │  V-Level v2, states, │
            │   compose-session-v3       │   │  band caps, bypass-  │
            │   → SessionPlan + spine    │   │  ing, warm-up, level │
            └────────────────┬───────────┘   └──────┬──────────────┘
                              │                       │
                              ▼                       ▼
                    ┌────────────────────────────────────────┐
                    │      SESSION RUNTIME (client)         │
                    │  practiceMachine + sessionMachine +   │
                    │  session  -shell cursor + cinematic     │
                    │  layer + voice orb + TTS/STT          │
                    └────────────────┬───────────────────────┘
                                      │ signals during & after (mood, quality,
                                      │ reflections, bio/work/device)
                                      ▼
    ┌────────────────────────┐   ┌──────────────────────┐   ┌────────────────────┐
    │  LOOP DETECTOR         │   │  MEMORY SYSTEM       │   │  GUIDE / MASTER    │
    │  local keywords +      │   │  extract · embed ·   │   │  ROSTER (89+)      │
    │  live-detect AI +      │   │  consolidate ·       │   │  4 selectors +     │
    │  pattern-window cron + │   │  recall · synthesize │   │  session-adapter   │
    │  instant-pulse cron    │   │  · sacred moments    │   │  overrides + guest │
    └────────────────────────┘   └──────────────────────┘   │  summon protocol   │
                                                              └────────────────────┘
                              │           │           │
                              └───────────┼───────────┘
                                          ▼
                      Feeds back into next getUserContext()
                      (loop closes; the app gets more accurate every day)
  ```

  The single most important property of this architecture: **everything feeds back into
  `getUserContext()`**. Sessions produce signals → signals update dimensions/loops →
  dimensions update V-Level → V-Level changes gating, archetype, and master selection →
  the next session is different. It is one closed feedback loop with many writers.

  ## 0.6 The four-layer mental model

  From `PLATFORM_OVERVIEW.md` (the investor framing):

  1. **The Consciousness Model (the "What")** — the proprietary map of human development:
    11 levels, 96 dimensions, 300+ loops, 6 life domains, 8 hidden stages. §1 of this doc.
  2. **The Engine Layer (the "How")** — six core engines (V-Level, Practice, Adaptive,
    Retention, Speed Profile, Dimension Tracker) running *both* server-side (authoritative,
    in edge functions) and client-side (instant, in `src/lib/consciousness/*`). §3.
  3. **The Content Layer (the "What You Do")** — games, programs, practices, wisdom cards,
    stage handbook; selected *for* the user by the engines. §8.
  4. **The Interface Layer (the "What You See")** — mobile app, web PWA, enterprise
    dashboard, admin panel; minimal, calming, time-appropriate. §7, §9.

  ---

  # PART 1 — THE CONSCIOUSNESS MODEL (the "What")

  **Core files:** `src/types/consciousness.ts` (canonical types), 
  `src/lib/consciousness/vLevelCalculator.ts` (client math),
  `supabase/functions/consciousness-engine/index.ts` (server math, 2,038 lines),
  `src/lib/consciousness/quickBandDetector.ts` (onboarding diagnostic).

  The consciousness model is the "theory of the user" every engine operates on. It is
  original psychometrics — not a licensed framework — and it is deliberately engineered to
  mechanically enforce the product philosophy (no comparison, no shame, no bypassing) in
  constants and formulas rather than in prompt copy alone.

  ## 1.1 Bands — the 11 levels

  A user's development is a single continuous number, the **V-Level** (`0.0–10.0`). The
  integer part is the **Band**; the fractional part is the **micro-level**. 11 bands:

  | Band | Name | Core State | Central Struggle | Engine Approach |
  |---|---|---|---|---|
  | 0 | The Sleeper | "I AM my thoughts." | Reactive, victim mindset | Stabilize nervous system (breath, mood tracking, validation) |
  | 1 | The Questioner | "Maybe I'm NOT my thoughts." | Frustration loop | Validate & label |
  | 2 | The Observer | "I CAN be the observer." | Sustainability | Micro-interventions (3-second pause) |
  | 3 | The Alchemist | "Pain is a teacher." | Purge phase | Direct guidance ("this isn't failure, this is purging") |
  | 4 | The Navigator | "I can choose." | Fear of freedom | Celebration & push |
  | 5 | The Architect | "I create my reality." | Final control struggle | Surrender nudge |
  | 6 | The Channel | "Life lives ME." | Flow-state maintenance | Silence & presence (minimal words) |
  | 7 | The Rishi | Turiya — 24/7 awareness | None — pure being | Peer-level; mutual exploration, no teaching |
  | 8 | The Jagadguru | Universal compassion | None | Silent presence |
  | 9 | The Avatar | Cosmic consciousness | None | Beyond app scope |
  | 10 | The Absolute | Shunya — only ONE exists | None | Beyond app scope |

  Bands 0–6 are flagged `isHumanJourney: true` — the bands the product actively coaches.
  Bands 7–10 are acknowledged transpersonal states the app *recognizes but does not claim
  to train*. (Product materials also use "22 bands" language in some places — that comes
  from counting the human-journey bands at finer 0.1 granularity in some engines; the
  authoritative type layer is 11×3.)

  Each band carries a **vocab/avoid word list** used to keep AI copy tonally appropriate
  (`consciousness-engine/index.ts:12-21`): Band 0 copy avoids "consciousness"/"witness"/"ego";
  Band 6 copy avoids "effort". The AI literally cannot speak out of the user's depth.

  ## 1.2 Micro-levels — 33 addressable sub-stages

  `MICRO_BANDS` defines three named sub-phases inside every band, derived from the
  fractional remainder of the V-Level:

  - **Entering** (fraction `< 0.3`) — "high support, small tasks, less freedom"
  - **Deepening** (`0.3–0.7`) — "balanced, cross-pollination starts"
  - **Mastery** (`≥ 0.7`) — "minimal guidance, user leads"

  Each band also carries three narrative micro-labels (Band 0 → "Deep Sleep / Awakening
  Spark / The Seeker"; Band 3 → "Transformer / Loop Breaker / Golden Alchemist"), turning a
  cold number into a recognizable identity ("I'm a Loop Breaker") — a distinctive piece of
  brand IP layered on top of the numeric model.

  The micro-level governs **how much the AI hand-holds**: entering → small explicit low-risk
  tasks; deepening → autonomy + cross-pollination (practices/masters outside the primary
  path); mastery → minimal scaffolding, user self-directs.

  ## 1.3 The six dimensions (+96 sub-dimensions)

  V-Level is composed from six dimensions of consciousness (`DIMENSIONS`):

  | Dimension | Label | Focus | Max Band | Role |
  |---|---|---|---|---|
  | `thought` | Thought (Mind) | Clarity, cognitive patterns, belief structures | 7 | Primary |
  | `emotion` | Emotion (Heart) | Emotional intelligence, regulation, depth of feeling | 7 | Primary |
  | `body` | Body (Gut/Instinct) | Somatic awareness, energy sensitivity | 7 | Primary |
  | `action` | Action (Karma) | Integrity, values-behavior alignment | 7 | **Integration** (multiplier) |
  | `connection` | Connection (Relational) | Relationship depth, empathy, community | 7 | **Integration** (multiplier) |
  | `spirit` | Spirit (Awareness) | Witness consciousness, non-dual perception | 10 | Primary |

  Design intent: **insight without embodied action/relationship is discounted**. The four
  primary dimensions drive the score; `action` and `connection` act as a 0.9–1.1 multiplier.
  Only `spirit` may run past Band 7 (transpersonal states exceed the human-journey map).

  Each of the six has **16 tracked sub-dimensions** (96 total, e.g. Emotion → range,
  regulation, empathy, grief, shame, compassion, vulnerability, boundaries…; Spirit →
  witness, surrender, awe, non-dual glimpses, ego loosening, inner stillness…). Engine math
  operates on the six primaries; the 96 enrich analytics surfaces ("Consciousness Loom").

  ## 1.4 V-Level mathematics — two formulas, one number

  There are **two implementations** of the V-Level math (client preview vs server
  authoritative). Both clamp, round to 1 decimal, derive `band = floor(v)` and micro-level
  from the remainder.

  ### Client v1 — `calculateVLevel()` (`src/lib/consciousness/vLevelCalculator.ts:14-53`)

  1. Floor the 4 primary dimension scores at `0.01` (a zero must not collapse the product).
  2. Compute the **geometric mean** of the 4 primaries. (Deliberate: geometric mean *punishes
    imbalance* — a user with spirit 9 and body 1 is pulled down hard. This encodes the
    anti-bypassing philosophy mathematically: no dimension can carry the others.)
  3. Compute an **integration multiplier** from the mean of `action`+`connection`, scaled to
    `0.9–1.1` (strong integration +10%, weak −10%).
  4. Multiply: `geometricMean × integrationMultiplier` = raw V-Level.
  5. **Calibration cap**: within the first 30 days, hard-cap at Band 1.0 (§1.5).
  6. Clamp `[0,10]`, round to 1dp, derive band + micro-level.

  ### Server v2 — `computeVLevel()` (`consciousness-engine/index.ts:91-129`)

  The authoritative version is a richer blend, replacing the pure geometric mean:

  ```text
  V = (0.40 × geometricMean(primaries)
    + 0.30 × harmonicMean(primaries)
    + 0.20 × min(primaries)
    + 0.10 × max(primaries))

  V = V × witnessModifier          # 0.70 + 0.30 × witnessQuality
                                  # witnessQuality = 0.40·gap + 0.35·stability + 0.25·depth
  V = V × loopPenalty              # floor 0.50: −0.05 per ACUTE loop, −0.02 per active loop
  V = V × integrationBonus         # 1 + 0.10 × integrationScore
  V = clamp(V, 0, 7.0)             # server caps at 7.0 (Bands 8–10 not computable)
  ```

  The harmonic mean and the `min` component double down on imbalance-punishment: a single
  collapsed dimension drags the whole score. Active psychological loops directly deflate
  the measured level — you cannot score high while an acute pattern is running you.

  ### Integration Score v2 (`computeIntegrationScoreV2`, `:136-176`)

  Explicitly fixes an earlier bug ("never tested" used to score a perfect 1.0). Blends:
  peak-baseline proximity (30%), **testing depth** — dark-night recovery history scores
  *higher* than never having been tested (25%), session consistency vs expected cadence
  (25%), cross-dimension balance (20%).

  ## 1.5 Calibration, caps, and time decay

  - **30-day calibration** (`CALIBRATION.durationDays`, `maxBandDuringCalibration = 1.0`):
    no user can be assessed above Band 1.0 during onboarding, regardless of self-report.
    Day 1 is literally titled "Meeting Yourself Where You Are". Prevents both inflated
    self-assessment and premature judgment.
  - **Per-dimension day-ramp** (`DIMENSION_MAX_BY_DAY`, `consciousness-engine:24-41`):
    even after calibration, each dimension's band is capped by journey day — 1.5 at day 0 →
    2.5 @7d → 3.5 @14d → 4.5 @30d → 5.5 @60d → 6.5 @90d → 7.0 @180d. Progress is *earned
    over time with practice*, not jumped to.
  - **Time decay** (`applyTimeDecay`, `:181-194`): every dimension loses
    `0.01 × min(daysSince, 50)` once a user has been away more than a day. State fades
    without practice — gently, and capped.
  - **Warm-up adjustment** (`getWarmUpAdjustment`): a 3+ day gap triggers a temporary 0.5-band
    drop with a "we'll ease in gently" message that self-corrects after one session back.

  ## 1.6 Speed profiles

  Raw session-count is an unfair comparator, so users are classified into three profiles
  (`detectSpeedProfile`, `vLevelCalculator.ts:58-69`):

  | Profile | ~% of users | Sessions/level | Risk | Protection |
  |---|---|---|---|---|
  | Fast Tracker | ~15% | 5–7 | Skipping depth, intellectualizing | "Slow down. Feel it, don't just understand it." |
  | Steady Walker | ~65% | 8–14 | Plateauing, losing motivation | Cross-pollination, new guru, variety |
  | Deep Digger | ~20% | 15–25 | Guilt, feeling "behind", quitting | Extra support, gentler practices, elder returns |

  `LIFETIME_CONVERGENCE` projects year-1/5/10 expected V-Level per profile: **all three
  profiles converge to ~6.9–7.1 by year 10.** The anti-competition philosophy is baked into
  the data model — pace differences are a texture, not a hierarchy.

  ## 1.7 Level-up tracks and quality ranges

  `shouldLevelUp()` (`vLevelCalculator.ts:74-89`) evaluates three tracks against
  `(recentQuality, consistencyStreak, sessionsAtLevel)`:

  - **Fast track**: quality ≥ 0.8, consistency ≥ 5, sessions ≥ 5 → may *skip* a level.
  - **Normal**: quality ≥ 0.6, consistency ≥ 3, sessions ≥ 8 → +1 level.
  - **Slow**: quality ≥ 0.4, consistency ≥ 1, sessions ≥ 15 → +1 level, patiently.
  - Otherwise: stay. (Effectively no automatic promotion.)

  `QUALITY_RANGES` names them: Struggling 0–0.3 ("stay, adjust approach"), Learning 0.3–0.6,
  Ready 0.6–0.8 ("level up"), Mastered 0.8–1.0 ("can skip +2"). The same three tracks are
  re-implemented server-side and DB-persisted by `evaluate-practice-level` (§3.6).

  ## 1.8 Bypassing detection and the golden rules

  The `STATE_SKILL_RULES` table encodes guard-rails preventing the system from rewarding
  intellectual/skill progress that has outpaced lived embodiment:

  1. **Spiritual Bypassing** — if `skill > state` by 2+ levels → assign a grounding
    (body/emotion) practice. Implemented as `checkBypassingRisk()` (client) and
    `computeBypassingRisk()` (server, `:234-249` — five independent risk contributions,
    including the subtle "using compassion talk to bypass one's own wound" test: an active
    worth/safety loop combined with high compassion capacity).
  2. **Foundation First** — Observation & Breath must stay within 1 level of any other
    skill; advanced practices lock until foundations catch up.
  3. **Heart > Head** — if `emotion` trails `thought` by 2+ levels → prioritize
    Bhakti/feeling practices over cognitive ones.
  4. **Integration Lock** — Kriya/Neti-Neti locked while Body or Emotion < Band 2, even if
    the user is intellectually "ready".

  The `detect-bypassing` edge function runs these as an explicit gate check (§3.7), and
  `detectState` (`:254-268`) folds risk into the user's *state*: `dark_night` (V-Level
  dropped > 0.5 below baseline), `bypassing` (risk > 0.4), `plateau` (journey day > 2×
  expected days for band with no movement), `breakthrough` (current > baseline + 0.3), else
  `normal`.

  ## 1.9 Anti-guilt design and regression policies

  - `ANTI_GUILT_MESSAGES` is a literal copy allow/blocklist in the type layer: the AI may
    never say "you're behind other users" / "you should be at Level X by now"; must instead
    reinforce "your pace is perfect for you" and the spiral metaphor ("In a spiral, you
    visit the same place twice. Depth is greater."). A guilt-detection fallback line
    ("Bro, chill. This isn't a race.") and an automatic session-duration reduction
    (5 min → 2 min) for guilt-prone users are first-class behavior, not prompt engineering.
  - `REGRESSION_POLICIES`: level drops carry **no penalty** (no streak loss, no shaming);
    **session credit is kept** (prior sessions at a level still count on return);
    **fewer sessions to return** (`sessionsToReturn()`: 3 sessions at quality ≥ 0.7, or
    `max(3, floor(previousSessions × 0.4))`); **spiral framing** (revisiting = depth);
    **warm-up after gaps** (§1.5).
  - `evaluate-practice-level` ships a server-side `getAntiGuiltMessage()` that frames low
    quality or slow pace as valid, and a rolling 3-session micro-adjustment that sets
    `harder`/`gentler`/`stabilize` difficulty independent of level-ups.

  ## 1.10 The hidden stage model (8 stages)

  `src/lib/consciousness/agents/*` (stateEngine, stageEngine, agentRouter,
  edgeCaseDetector, insightLayer, agentDefinitions) implement an **8-stage hidden model**
  that drives AI behavior but is never shown to the user:

  | Stage | Name | AI behavior |
  |---|---|---|
  | 0 | Unaware | High structure, maximum guidance |
  | 1 | Beginning to notice | Gentle introductions to awareness |
  | 2 | Observer emerging | Encourage witnessing practice |
  | 3 | Consistent witness | Deeper inquiry, less hand-holding |
  | 4 | Self-inquiry active | Non-directive, question-based |
  | 5 | Non-dual glimpses | Minimal guidance, spacious presence |
  | 6 | Stabilized awareness | Almost no intervention |
  | 7 | Turiya / 24/7 | Complete silence; no AI presence |

  The stage is smoothed per turn (70% previous + 30% current, capped at ±1) and feeds the
  Adaptive Engine's per-turn directive (§3.3): which cognitive "agents" (personas) speak,
  how much framework language to use (insight depth: micro/framework/explicit/none), and the
  "reveal level" (1–4) controlling how much Sanskrit/technical terminology appears. This is
  the mechanism behind "the AI morphs its personality without the user knowing why."

  ## 1.11 Chakras, archetypes, and states

  - **Chakras** (`computeChakras`, `consciousness-engine:199-213`): all 7 chakra scores are
    *derived* from weighted dimension-band combinations, discounted 15% when a related loop
    is active/acute. `LOOP_CLUSTER_MAP` (`:46-74`) maps ~24 loop ids to root wounds
    (separation, unworthiness, unsafety, powerlessness, abandonment, identity_fixation,
    inner_void, disconnection) and chakra lists. The `chakraEngine` shared module
    (`detectBlockedChakra`) is consumed by the composer (§3.5).
  - **Archetype** (`detectArchetype`, `:218-229`): intellectualizer / feeler / athlete /
    dissociator / sleeper / adept / balanced / seeker — from simple dimension threshold
    comparisons. Colors copy and practice suggestions.
  - **States**: `dark_night`, `bypassing`, `plateau`, `breakthrough`, `normal` (§1.8) —
    consumed everywhere (master swaps, mode overrides, pacing).
  - **Circadian profile** (`:271-317`): tracks per-time-slot session counts, infers
    `morning_person`/`evening_person`/`flexible`, a consistency score, and applies small
    chronobiology boosts per slot (thought +0.02 morning, emotion +0.02 evening).

  ## 1.12 Spiritual DNA, kundli, and life stage

  - **Spiritual DNA** (`user_spiritual_dna` + `compute` paths): a profile computed from
    onboarding assessments + ongoing behavior — current band, brain dominance, archetype,
    raw assessment payload — with a `spiritual_dna_confidence` companion table tracking how
    sure the engine is about each trait.
  - **Kundli** (`compute-kundli` edge fn, `user_kundli` table, `BirthInsightsChip` on Home):
    Vedic astrology birth-chart computation surfaced as context.
  - **Life stage** (`lifeStageDetector.ts`, `detectLifeStage` server-side): keyword-matches
    free text to life context (student/parent/retiree/elder/professional) to color content.
  - **Six life domains** (`life_domain_scores`, seeded 5.0 at onboarding): relationship,
    work, finance, health, creativity, spirituality — real-world arenas *separate* from
    consciousness dimensions; when a domain is stressed, the Practice Engine boosts
    practices that target the related dimension.

  ## 1.13 The supporting engine file map (`src/lib/consciousness/*`)

  | File | Role |
  |---|---|
  | `vLevelCalculator.ts` | client V-Level math, level-up tracks, bypassing check, warm-up, return-credit |
  | `quickBandDetector.ts` | 4-question onboarding diagnostic (belief 35% / emotion-response 30% / practice-history 20% / intent 15%; clamps self-report to 0.0–6.9 — Bands 7+ are earned by practice, not claimed) |
  | `practiceEngine.ts` | `getNextPractice()` — the 8-rule weighted practice selection (§3.2) |
  | `dimensionTracker.ts` | practice → dimension deltas via confidence-weighted EMA (§3.11) |
  | `sessionGenerator.ts` | composes session content from state |
  | `speedProfileEngine.ts` | adaptive difficulty, guilt detection, post-gap warm-up |
  | `dailyGates.ts` | time-of-day gating & greetings |
  | `assessmentDetector.ts` | parses assessments into dimension scores |
  | `dynamicGuruSelector.ts` | additive band/loop/theme guru scoring (§3.8) |
  | `masterRotation.ts` | stateful 21-day rotation policy (§3.8) |
  | `retentionEngine.ts` | churn-risk classification + graduated re-engagement (§3.12) |
  | `lifetimeSpiral.ts` | 10-phase lifetime model; long-horizon convergence |
  | `lifeStageDetector.ts` | life-context inference |
  | `relationshipDepth.ts` | user↔guide relational trust axis (separate from V-Level) |
  | `exhaustionHandler.ts` | over-practice / fatigue handling |
  | `agents/*` | the hidden-stage model + per-turn agent routing (§1.10, §3.3) |

  ---

  # PART 2 — THE SHARED SUBSTRATE: `getUserContext()`

  **File:** `supabase/functions/_shared/user-context.ts` (553 lines)

  This is the single source of truth almost every edge function calls first. It is a big
  **read-aggregator**: given `(supabase client, userId, runtime overrides)` it produces one
  `UserContext` object in parallel best-effort queries — deliberately tolerant of missing
  tables/rows so it never throws, which is why every consumer (composer, guide chat,
  adaptive engine, session adapter) can call it blindly.

  ## 2.1 The `UserContext` contract (`user-context.ts:16-164`, abridged)

  ```ts
  export type Gate = "morning" | "midday" | "evening" | "night";
  export type Energy = "low" | "medium" | "high";

  export interface UserContextRuntime {
    timeBudgetMin?: number; energy?: Energy; gate?: Gate;
    hour?: number; mood?: string; extra?: Record<string, unknown>;
  }

  export interface UserContext {
    userId: string;
    identity: { displayName, onboardingPath, lifestyle, occupation, country,
                aiMode: "fast" | "premium", preferredTheme, wakeTime, sleepTime };
    spiritual: { overallBand, vLevelCurrent, vLevelBaseline, vLevelPeak,
                dimensionBands: Record<string, number>, chittaVritti, journeyDay,
                journeyPhase, yogaPathAffinity, witnessStability, witnessDepth,
                witnessGap, integrationScore };
    practiceLevels: Record<string, { level, sessionsAtLevel, totalSessions,
                emotionalHealing, loopDissolution }>;
    activeLoops: Array<{ loopId, severity, detectedAt }>;
    recentLoopIds: string[];              // last 8 distinct, most-recent-first
    dimensionsToday: { thought, emotion, body, awareness } | null;
    behavior: { gapDays, lastSessionAt, lastSessionIntent, sessionsLast7d,
                avgQualityLast7d, avgSessionMinutesLast7d, consistencyScore,
                recentIngredientIds, morningCompletedToday, middayCompletedToday,
                eveningCompletedToday, lastJournalSnippet };
    now: { hour, gate, energy, timeBudgetMin, mood, moodScoreToday, energyScoreToday };
    theme: { id, title, description, openingPrompt };
    engineSignals: Array<{ id, type, practiceId, loopId, urgency, levelHint,
                masterId, source }>;
    foundation: { currentSession, totalSessions, completed };
    activeProgram: { id, title, masterId, templateSlug, days, currentDay, sessions } | null;
    spiritualDna: { currentBand, brainDominance, archetype, raw };
    dimensionScores: Record<string, number>;
    weakDimensions: string[];
    recentGuideTopics: string[];
    loopAttributions: Array<{ loopId, confidence }>;
    recentSignalsRaw: Array<{ sourceType, loopId, chittaVritti, bodyState, mindState, createdAt }>;
  }
  ```

  This object is called **"The Brain"** in product docs — the complete snapshot of a user's
  state that every decision-making function reads.

  ## 2.2 Gates, energy, and time budget

  `gateForHour()` derives the daily gate from wall-clock when not explicitly passed:
  **night < 5, morning < 12, midday < 17, evening < 21, else night**. `energy` and
  `timeBudgetMin` come from runtime overrides (client state) or defaults. A companion
  helper `practiceLevelsMap(ctx)` (`user-context.ts:549`) flattens `practiceLevels` to
  `{practiceId: level}` for the composer's scoring.

  ## 2.3 Who consumes it

  `compose-session`, `compose-session-v3`, `guide-chat` (via `session-adapter`),
  `session-adapter`, `generate-session-agenda`, and essentially every personalization
  function call `getUserContext()` as their first step — so everything downstream
  (archetype choice, council voices, chakra/loop signals, master selection) is derived
  from one snapshot. **This is the seam that makes the whole system coherent.**

  ---

  # PART 3 — THE ENGINE ROOM

  ## 3.1 The V-Level / consciousness engine (server-authoritative)

  **File:** `supabase/functions/consciousness-engine/index.ts` (2,038 lines) — the largest
  single decision surface in the codebase.

  Responsibilities (all authoritative, DB-persisting):

  1. **V-Level v2** — the 40/30/20/10 blend × witness modifier × loop penalty × integration
    bonus (§1.4), clamped to 7.0.
  2. **Dimension caps** — per-dimension day-ramp + 30-day calibration cap (§1.5).
  3. **Chakra computation** from dimension bands minus loop discounts (§1.11).
  4. **Archetype + state detection** (§1.8, §1.11).
  5. **Bypassing risk** — five weighted risk contributions (§1.8).
  6. **Integration Score v2** — peak-baseline proximity, testing depth (dark-night
    recovery > never-tested), cadence consistency, cross-dimension balance (§1.4).
  7. **Time decay** on dimensions after gaps (§1.5).
  8. **Circadian profiling** and per-slot dimension boosts (§1.11).
  9. **Band vocabulary gating** — per-band `vocab`/`avoid` lists that constrain AI copy.

  Client twin: `src/lib/consciousness/*` (§1.13) provides instant, offline-capable
  approximations; the server is the source of truth.

  ## 3.2 The Practice Engine

  **Files:** `src/lib/consciousness/practiceEngine.ts` (client, pure),
  `get-next-practice`, `compose-today-practice`, `for-you-practices` (edge wrappers).

  `getNextPractice(ctx)` (`practiceEngine.ts:55-141`) answers "what should the user do
  right now?" by additively scoring every candidate practice with eight weighted rules
  (weights from `dimension-matrix.ts` / `ENGINE_PRIORITY_WEIGHTS`):

  | Rule | Effect | Weight |
  |---|---|---|
  | Weakest core practice | target the dimension needing most work | +10 |
  | Anchor path | reinforce what's already working | +5 |
  | Growth path | push next level when anchor plateaus | +7 |
  | Active loops | practices mapped to dissolve each live loop | +8 per loop |
  | Life-domain stress | practices targeting the related dimension | +6 per stressed domain |
  | Cross-pollination | complementary practice for plateaued ones | +4 |
  | Weakest dimension | bonus when impact ≥ 3 in `DIMENSION_IMPACT_MATRIX` | +3 |
  | Specialty gating | locked practices excluded (see below) | — |

  `filterByActivation()` (`:185-219`) then removes specialty practices whose gating
  conditions aren't met: `kriya` needs raja L4 + body L3; `tantra` needs band ≥ 3 + jnana
  L3; `emotional-healing` needs emotion score < 3. Highest-scoring survivor wins;
  `observation` L1 is the hard fallback. `detectPlateau()` flags 5+ low-variance stalled
  (0.4–0.75 quality) sessions. `getSessionFormula()` fixes the canonical time split:
  **30% teaching / 50% practice / 20% reflection**.

  This is the personalization engine — the same 25-practice library feels bespoke because
  selection is recomputed against live state every time.

  ## 3.3 The Adaptive Engine (per-turn AI directive)

  **Files:** `supabase/functions/_shared/adaptive-engine.ts` (server),
  `src/lib/promptDirector.ts` + `src/lib/sessionFlow.ts` (client surface),
  `src/lib/consciousness/agents/*` (the hidden-stage machinery).

  The most novel engine. On **every user turn** it:

  1. **Reads state** — energy, emotion, awareness, resistance, clarity, intent, fragility
    (from `getUserContext()` + the message itself).
  2. **Detects edge cases** — spiritual bypassing, over-dependency, intellectual loop,
    crisis, dark night (crisis keywords checked *first* — §3.8.2).
  3. **Determines hidden stage** — the 0–7 stage of §1.10, smoothed 70/30 per turn,
    never shown to the user.
  4. **Routes cognitive agents** — selects 2–3 AI personas for this turn
    (companion, pattern-finder, witness-keeper, …) via `agentRouter`.
  5. **Sets insight depth** — `micro | framework | explicit | none` (how much framework
    language to use).
  6. **Sets reveal level** — 1–4 (how much Sanskrit/technical terminology).
  7. **Generates a directive** — a formatted instruction block injected into the AI system
    prompt for this turn.

  The directive changes every turn: the AI is not a static chatbot but a state-driven
  system that meets the user exactly where they are. Client-side, `sessionFlow.ts`'s
  `buildSessionSystemPrompt()` only emits a *high-level surface directive* and explicitly
  defers "the final word" to the edge function's adaptive engine (§4.5).

  **Graceful disappearance** is the policy layer on top: Band 0–2 → high AI presence;
  3–5 → moderate; 6–7 → minimal/silent tracking; 8–10 → no presence (the user has
  internalized the system). The product optimizes for liberation, not engagement.

  ## 3.4 The Session Engine family (four generations)

  The "Session Engine" is really **four parallel implementations that evolved over time**
  (see §12.1 for the archaeology). All four are documented in §4 (the session system deep
  dive); in summary:

  | Generation | Files | Nature |
  |---|---|---|
  | G1 — Orb heuristics | `src/lib/sessionEngine.ts` (master-recommendation if/else cascade), `src/lib/sessionOrchestrator.ts` (deterministic "session N of today" planner, localStorage "orb-sessions") | pure, no AI |
  | G2 — Chat sessions | `src/lib/sessionFlow.ts` → `promptDirector.ts`, `src/machines/sessionMachine.ts`, `src/hooks/useSessionFlow.ts`, `useGuideChat.ts`, `guide-chat` edge fn | streaming chat with per-turn adaptive directives |
  | G3 — Generative step sessions | `src/lib/session-shell/*`, `generate-session-agenda` (legacy), `compose-session-v3` (Sankalpa Engine), `session-complete`, `score-session-spine` | AI-composed step plans run by a cursor-based shell |
  | G4 — Cinematic runs | `src/lib/cinematic/*`, `PracticeRunControllerContext`, `sessionPlayerMachine` | level-adaptive scripted narration layers |

  ## 3.5 The Composer Framework and compose-session-v3 ("Sankalpa Engine")

  ### 3.5.1 The deterministic composer — three pure layers (`src/lib/composer/*`)

  **Layer 1 — Archetypes** (`archetypes.ts`): "Every session, regardless of ingredients,
  has one of 7 shapes. The archetype is chosen by gate + energy + gap days + band — NEVER
  by the user." Seven `ArchetypeId`s — `opening, inquiry, teaching, practice_deep,
  integration, release, micro` — each an ordered template of slots with roles
  (`settle | anchor | core | deepen | reflect | release | seal`), a `share` of total
  minutes, accepted ingredient kinds, tone words. `selectArchetype(ctx)` rules, in
  priority order: user `preferred` → `timeBudgetMin ≤ 3` forces `micro` → `gapDays ≥ 4`
  (re-entry: `release` at night else `opening`) → low energy → gate defaults
  (morning → `practice_deep` if ≥ 15 min else `opening`; midday → `inquiry` if band ≥ 3
  and ≥ 8 min else `teaching`; evening → `integration`; night → `release`). Every branch
  returns a human-readable `reason` surfaced to UI/AI.

  **Layer 2 — Ingredients** (`ingredients.ts`): the fillable units dropped into slots.
  Four `IngredientKind`s: `practice` (auto-generated by wrapping the `MODE_REGISTRY` from
  `src/lib/sutra/modeRegistry`, deriving depth from duration), `knowledge` (4 seed
  teachings, e.g. Rumi's "The Guest House"), `reflection` (5 gate-tagged prompts),
  `micro_action` (5 quotes/mantras/presence cards). Each ingredient may carry
  `loopTargets` (loop IDs it addresses, e.g. `VAL001`), `bandRange`, `energyFit`,
  `gateFit`, `depth`, a deep-link `route`, and static `body` copy.

  **Layer 3 — Composer** (`composer.ts`): `composeSession(ctx)` selects an archetype,
  filters eligible ingredients per slot, then scores every candidate with a fixed weight
  vector:

  ```ts
  const W = { loopMatch: 3, practiceLevelFit: 2, gateAlignment: 2, freshness: 1.5,
              energyFit: 1, bandFit: 1, slotBias: 2.5, repetitionPenalty: -4 };
  ```

  — rewarding overlap with `ctx.activeLoops`, level-fit between ingredient depth and the
  user's practice level, gate alignment, freshness (a −4 hammer for anything in
  `recentIngredientIds`), energy fit, band-range presence, and slot-bias matching. Picks
  the top scorer per slot, allocates `minutes = timeBudgetMin × slot.share`, then
  **renormalizes** so the total exactly equals the time budget. `composeTitle()` builds
  human titles like "Curious Opening".

  ### 3.5.2 `compose-session` (thin wrapper edge function)

  68 lines: auth → `getUserContext()` → build a back-compat `ComposerContext` (gate,
  energy, gapDays, timeBudgetMin, band rounded from V-Level, loops, practice levels,
  recent ingredient ids) → return `{ ok, ctx, userContext }`. It hands back the raw
  materials; a caller composes with them (client preview or another function).

  ### 3.5.3 `compose-session-v3` — the Sankalpa Engine (677 lines)

  By far the most complex function in the codebase — a full LLM pipeline with the shape:

  ```
  Parallel reader → 3-LLM Council (fast) → Composer (main)
                  → Safety + write session_spine
  ```

  Contract: request `{ timeBudgetMin?, energy?, gate?, intent? }` (auth required);
  response `{ ok, plan: { id, intent, intro, steps[] }, spineId, council, chakraFocus,
  whyForYouCount, novelty[], memoryCallback, whisperConsumed, nextWhisper, themeId,
  elapsedMs, aiMode }`. Honors `identity.aiMode` ('fast' Groq vs 'premium' OpenAI) for
  every call via `aiGatewayFetch`. Client wiring is behind the `sankalpaV3` feature flag
  (`localStorage.sankalpaV3 === '1'`, §4.7) with silent fallback to
  `generate-session-agenda` — "zero breakage".

  **Step model:**

  ```ts
  type StepKind = "wisdom-read" | "breathwork" | "journal" | "micro-act"
                | "reflection" | "guide-chat" | "practice" | "temple-chat" | "witness";
  interface Step { kind: StepKind; title: string; prompt?: string;
                  params?: Record<string, unknown>; est_minutes: number;
                  whyForYou?: string; signalRef?: string; }
  interface Plan { id: string; intent: string; intro: string; steps: Step[]; }
  ```

  **14 archetypes** (`ARCHETYPE_SPEC`, a superset of the client's 7): Settling,
  Confrontation, Reconciliation, Shadow Mirror, Stuck-Loop Break, Lineage Initiation,
  Re-entry, Celebration, Dissolution, Witness Deepening, Inquiry Spiral, Devotional,
  Karmic Action, Dark Night Hold — each with a tagline and an *activation condition string*
  fed to the LLM (the LLM judges which condition fires; it is not code-evaluated).

  **Voice lineage** — three inner voices mapped to yogic paths and historical masters:
  head → Jnana (Ramana, Krishnamurti, Nisargadatta, Shankara); heart → Bhakti (Rumi, Meera,
  Ramakrishna, Hafiz); gut → Karma/Raja (Adiyogi/Shiva, Patanjali, Buddha, Lao Tzu).

  **The 12-stage pipeline:**

  1. **Auth + admin clients** (user-scoped for RLS reads, service-role for writes).
  2. **Parallel READ layer** (`Promise.all`): `getUserContext()`; 
    `buildLongTermMemoryBlock()` (§3.9 — semantic memory recall); previous `session_spine`
    row (archetype/lead/loop/dimension/chakra + the user's final sentence — the
    "memory-graph callback"); unconsumed `future_self_whispers` row; latest `daily_themes`
    row (the living-theme arc); last 30 quality-scored spines (adaptive history).
  3. **Adaptive history block** — aggregate archetype and lead-master average quality from
    history into top/bottom resonance lists; folded into the prompt as *"soft bias only —
    do NOT pick a high-resonance archetype if its activation rule does not fire."*
  4. **Signal assembly** — vLevel, journeyDay, chittaVritti, dimensions, dimensionBands,
    activeLoops, yogaPathAffinity, witness stats, gate, energy, timeBudgetMin, gapDays;
    `starvedDim` (lowest dimension today); `buildPracticeMatrixSignal()` (from
    `_shared/practiceMatrix.ts`); `detectBlockedChakra()` (`_shared/chakraEngine.ts`);
    human-readable loop names (`_shared/loopMap.ts`).
  5. **COUNCIL LAYER** — three parallel fast LLM calls (`voiceCall("head"|"heart"|"gut")`),
    each constrained to **one sentence ≤ 24 words, second person**. A **synthesizer** call
    then picks exactly one `lead` voice and one `archetype` from the 14-item menu, informed
    by activation rules + adaptive history + a deepest-need tie-break ordering
    (`Dark Night > Shadow Mirror > Confrontation > … > Settling`). Falls back to
    `{lead:"gut", archetype:"Settling"}` on any failure.
  6. **COMPOSITION LAYER (main call)** — `stepBudget = clamp(3, 7, round(timeBudgetMin/3))`.
    The system prompt locks the archetype, names the lead voice's lineage, enforces
    per-archetype step-shape rules (Dark Night Hold: no "do" verbs, only
    breath/witness/soft reflection; Karmic Action: exactly one micro-act step), and a
    **practice grammar**: every step must instantiate one concrete
    `(family × focus × level)` cell from `{observation, self_inquiry, breath_awareness,
    witnessing, body_awareness, bhakti, karma, jnana, raja, kriya, tantra}`, never jumping
    more than **+1 level** above the user's current level for that family. Every step
    requires a `whyForYou` referencing a **named signal** (loop name, dimension, chakra,
    practice level, memory line, or council voice — vague reasons explicitly banned) and
    a `signalRef` id (e.g. `loop:VAL003`, `dim:emotion`, `chakra:throat`,
    `practice:witnessing:L2`, `memory:14d`).
  7. **T4 continuity block** — a `callbackBlock` referencing the previous session
    (hours-ago, archetype, loop, dimension, chakra, closing sentence), the future-self
    whisper (to be woven, not quoted), and the living theme's current sub-angle — with
    **INTRO RULES**: the intro must open with a memory-graph callback sentence if history
    exists, fold the whisper's essence into sentence 2, and close by signaling how today
    deepens the living theme; max 3 sentences.
  8. **Composer AI call** (`tier:main`, JSON mode) → parse into `Plan`; clean/clamp each
    step (title ≤ 120 chars, prompt ≤ 1200, est_minutes clamped 1–15, whyForYou ≤ 280,
    signalRef ≤ 80). Any parse failure → **hard-coded 3-step safety fallback**
    (breathwork → witness → reflection). The function never returns an empty plan.
  9. **T3 Novelty filter** — embed every step's `title+prompt` via `embedText()` and search
    `match_user_memories` restricted to `source_type = "session_step"`; any step with max
    similarity > 0.85 to a prior step is flagged and **regenerated once** (a one-shot
    `novelty-repair` call rewrites only flagged indices, preserving kind/duration/
    archetype), then re-embedded.
  10. **WRITE layer** — insert a `session_spine` row: archetype, reason, lead master,
      council voices, primary/secondary loop ids, primary dimension, chakra focus,
      `why_for_you` array, `graph_edges` (loop/dimension/chakra/master nodes), full
      `composed_signals`, `ai_mode`. Fire-and-forget: persist step embeddings into
      `user_memory_vectors` tagged `[kind, archetype, lead]` for future novelty checks.
  11. **T4 post-write side effects** (fire-and-forget) — mark the consumed whisper;
      generate a **new future-self whisper** (one sentence ≤ 22 words, tone enum
      `tender|fierce|playful|grave|grateful`) referencing what was just composed; and if a
      living theme is active, POST to `evolve-theme` with spine id + archetype + lead +
      primary loop/dimension to advance the day's theme arc.
  12. Return the full payload.

  This is the clearest example of **engine chaining**: deterministic reads → parallel
  small LLM voices → one synthesizing decision → one large generative composition →
  embedding-based novelty QA/repair → durable graph-shaped persistence → fire-and-forget
  continuity generation for the *next* session.

  ---

  ## 3.6 The Adaptive Journey Engine

  A layered stack: a pure client heuristic, a typed consciousness library, and a set of
  Deno edge functions doing the authoritative, DB-backed computation.

  ### 3.6.1 `src/lib/adaptiveJourneyEngine.ts` — the 100-day heuristic (G1, fully local)

  Pure, side-effect-free module around a `UserProfile` (`currentDay, missedDays,
  avgPracticeMinutes, avgRating, engagementLevel, preferredTime, streakDays,
  lastJournalSentiment, recentReflections`):

  - **Sentiment** (`analyzeSentiment`): bag-of-words scorer (English + Hinglish tokens like
    "nhi ho", "dar", "gussa") → negative/neutral/positive.
  - **Classifiers**: `isStruggling` = negative sentiment OR missedDays > 3 OR avgRating < 2.5
    OR low engagement OR streak 0. `isThriving` = positive AND rating ≥ 4 AND high
    engagement AND streak ≥ 7.
  - **Day-type selection**: struggling users get `reflection` (if missed > 5) or `regular`
    — testing days are *skipped* for them. Thriving users can get `testing` days every
    25th day. Otherwise fixed rhythm: every 10th day `silence`, every 20th `reflection`.
  - **Teaching/practice/duration generation** with empathetic branch copy ("away a while",
    "negative journal", "thriving — go deeper"), a 20-day rotating theme table, duration
    15/30/35 min by state, +5 min at streak ≥ 21.
  - **`updateUserProfile`** — the feedback writer: streaks/missed-day accounting from
    `lastPracticedAt` gaps, running averages, engagement from a weighted score
    (minutes/30 × 0.4 + rating/5 × 0.3 + chat/10 × 0.3, thresholds 0.7/0.4).

  Superseded by the server pair below but still present and coherent.

  ### 3.6.2 `assess-starting-levels` — onboarding → initial levels

  Not everyone starts at Level 0. Keyword detectors scan free-text onboarding answers for
  experience signals ("pranayama"/"advanced"/"retention" → breath level 4; "witness"/
  "observer"/"detached" → witnessing level 4) across seven practice families, assigning
  0–4 starting levels. `detectBrainDominance()` and `detectLifeStage()` similarly
  keyword-match decision style and life context. The handler then computes
  `anchorPath`/`growthPath` (highest/lowest of bhakti, karma, jnana, raja), an initial
  speed-profile guess, and upserts: one `user_practice_levels` row per practice,
  `user_spiritual_dna`, `user_speed_profile`, six `life_domain_scores` rows at neutral 5.0,
  and a `curiosity_queue` row — all gated by the hard 30-day calibration cap
  (`Math.min(band, 1.0)`).

  ### 3.6.3 `evaluate-practice-level` — quality-based level-up (server)

  Reads the user's practice-level row, speed profile, last 15 sessions (filtered by
  `type_payload->>practice_type`), and streak; applies the same three-track thresholds as
  the client (§1.7) but DB-persisted. Adds a rolling 3-session micro-adjustment
  (`harder`/`gentler`/`stabilize`), re-derives the fast/deep/steady speed type, and ships
  the anti-guilt message. Low quality with 3+ sessions at a level flags
  `difficultyAdjustment: "gentler"`.

  ### 3.6.4 `session-adapter` — single-shot entry-time adaptation

  Runs once when a session is entered, adapting a program-assigned
  `{master, mode, practice}` triple to the user's *right-now* state. **Master swap
  decision order:** (1) `dark_night` state forces a soft-holding master (Rumi, Anandamayi
  Ma, Milarepa); (2) an urgent (≥ 0.7) unconsumed engine signal's loop maps to a
  specialist (`spiritual_bypassing` → Kabir, `perfectionism` → Krishna, `shame`/`grief` →
  Rumi); (3) top active loop by severity (≥ 4 or unassigned); (4) dominant life-domain
  hint (money/work → Krishna; relationship/family/grief → Rumi; meaning → Vivekananda;
  health → Patanjali); (5) state-based fallback. Mode re-aligns to the new master's
  lineage affinity unless crisis forces `therapy`. **Practice substitution:** deep inquiry
  → `observation` if band < 2; breath → `therapy` in dark night (avoiding
  hyperventilation risk while fragile); rotation within a practice family if the same
  practice was used 2+ times in the last 3 sessions. **Pacing** (`short|medium|deep`)
  from state + recent-session fatigue. Every decision (original vs adapted, for all three
  fields, with reasons and the raw signal snapshot) is logged to `session_adaptations`,
  and consumed urgent signals are marked `consumed_at` — a fully auditable feedback loop.

  ### 3.6.5 `recalibration-intelligence` + `recalibrate-constellation` — drift-triggered rebalancing

  The meta-decision layer decides **when** a user's whole practice constellation needs
  recomputing, from seven weighted drift signals: dimension variance vs baseline (18%),
  witness-gap delta (14%), bypassing-risk spike (14%), regression delta (18%), plateau
  score (12%), predictive risk (12%), practice-effectiveness drop (12%). `decide()` maps
  the summed drift to `none` (<0.20), `minor` (<0.50), `major` (<0.80), or `reassess`
  (≥0.80 — a user-facing prompt, never auto-applied), with a 3-day cooldown unless drift
  ≥ 0.7 and a `dark_night` short-circuit that never auto-mutates the path. Supports
  single-user, `force:true` (user-triggered, coerces none→minor), and `all:true` (cron
  over active users). Every decision is written to `recalibration_events`.

  `recalibrate-constellation` does the actual blend: re-derive a fresh 12-practice weight
  vector from `practice_effectiveness` over the last 30 (minor) or 90 (major) days, boost
  `observe`/`witness` if loops are active, normalize (floor 0.005, sum-to-1), and blend
  with existing weights **85/15 (minor) or 60/40 (major)** — history is never wiped out in
  one shot ("Law 2 — continuous calibration"). Weights classify each practice as
  `primary` (≥0.15), `secondary` (≥0.06), or `dormant`; `observe` is protected from ever
  going fully dormant. Primary-count determines a coarse phase: `t-shape` (≤3) → `breathe`
  (≤5) → `integrate` (6+). Every run appends a `user_practice_constellation_history`
  snapshot (append-only).

  ## 3.7 The Loop Detector stack

  Three cadences layered over one shared **loop library** (§8.1): instant client-local
  matching, near-real-time server AI fallback, and scheduled cross-source cron windows.

  ### 3.7.1 Local detection — `detectLocally()` (zero cost, instant)

  `src/lib/localLoopDetector.ts` (386 lines) hard-codes `LOOP_ENTRIES` with `id` (e.g.
  `VAL001` People-Pleasing), `name`, lower-confidence `keywords[]` and higher-confidence
  `phrases[]` across ~20 category prefixes (VAL, CTL, AVD, SRV, BOD, ENR, EMO, MEN, BHV,
  HAB, SOC, REL, IDN, EGO, BLF, PUR, SPR, PRD, COG, MOT). `detectLocally()` scores the
  last 5 user messages joined into one blob; loops below confidence 0.3 drop, top 3
  survive. In parallel, 7 **speaking sources** (`mind, heart, gut, body, identity, fear,
  witness`) are scored (threshold 0.15, top 3), each carrying a canned insight line
  ("Your analytical mind is leading… some truths require feeling, not thinking"). An
  `overall_insight` is synthesized when both a top loop and top source exist. **Ambiguity
  gating** decides AI escalation: ambiguous if (a) >100 chars but zero loops matched, or
  (b) top loop matched weakly (0 < confidence < 0.4).

  ### 3.7.2 Client cadence — `useLiveDetection()`

  `trackMessage()` fires `runDetection()` **every 3rd user message** (debounced so it
  refires at messages 6, 9, 12…). `runDetection()` always runs `detectLocally()`
  synchronously (₹0) and pushes hits into `detections` immediately; only if ambiguous
  **and** the AI fallback has fired < 3 times this session does it POST to `live-detect`.
  AI-detection cost per chat session is hard-capped at 3 calls.

  ### 3.7.3 `live-detect` edge function — AI fallback + signal absorption

  Credit pre-check (25 paise minimum) → send last messages + the full `LOOP_REFERENCE` id
  catalog (`_shared/loop-library.ts`) to `tier:fast` with a strict JSON contract (loops
  ≥ 0.6 confidence, max 3; sources by strength, max 3; one `overall_insight`). Then the
  important part ("PHASE 4"): every detected loop ≥ 0.6 becomes **two `engine_signals`
  rows** — `active_loop` (for the adaptive engine) and `loop_detected` (so the client
  `ConsciousnessBusListener` can fire a toast + haptic). A 6-hour dedupe window
  (`loop_attributions` lookback) prevents re-persisting/re-notifying the same loop;
  confidence ≥ 0.7 also queues a `notifications` row ("A loop surfaced: X"). The top
  source at strength ≥ 0.7 maps to a `needs_practice`/`needs_inquiry`/`breakthrough`
  signal with a specific practice id (fear→breath, heart→emotional-healing, mind→
  self-inquiry, gut→body, identity→jnana, witness→breakthrough) — the bridge from
  detection into the Practice Engine. Flat 10-paise charge.

  **UI:** `LiveDetectionChips.tsx` renders loop chips (destructive-tinted, confidence %)
  and source chips under the chat; tapping opens a Sheet with a confidence bar, quoted
  evidence, a `why` explanation, and a fixed "What to notice" nudge or a per-source
  Socratic question.

  ### 3.7.4 Cron-cadence cross-source detectors

  Independent of chat, mining `work_signals` (Slack/Gmail/GitHub/…), `bio_signals`
  (wearables: HRV, sleep), and `device_signals`:

  - **`instant-pulse-detector`** (~15 min or triggered after `ingest-signal`/
    `signal-fusion`): trailing 15-minute window. Hard-coded acute triggers: 3+ "charged"-
    tone messages in 15 min → `nudge_queue` row suggesting a 60s Witness practice; HRV
    < 25 → 90s box-breath nudge. Nudges are `kind:"instant"`, priority 70–75, deduped via
    a window-bucketed `dedupe_key`, auto-expiring in 30–60 min.
  - **`pattern-window-detector`** (30-min cron): 3-hour and 7-day lookbacks with a fixed
    "integration → loop" ruleset. 3h: ≥5 toned work-signals with >40% charged → `VAL003`
    (validation-seeking), confidence scaled by charged ratio. 7d: ≥3 late-night commits +
    avg HRV < 35 → `REC002` (recovery debt); ≥3 short-sleep nights → `REC003`; ≥30
    meetings/week → `EGO005` (performative pattern); sustained HRV < 30 across 5+
    readings → `REC001`. Attributions dedupe per (user, loop, window) keeping highest
    confidence, written to `loop_attributions`; the top loop per user queues a
    `kind:"pattern"` nudge with 12-hour expiry.
  - **`detect-bypassing`**: the "3 Golden Rules" gate check — Foundation First, Heart >
    Head, Integration Lock (§1.8).
  - **`detect-contradictions`**: compares latest 5 utterances against stated positions
    ≥ 7 days old via pgvector similarity + a fast LLM judgment; inserts a
    `contradiction` engine signal for the Consciousness Bus to surface gently.
    Idempotent; cron-safe.
  - **`detect-cross-pollination`**: fixed `CROSS_MAP` routing plateaued practices to
    complements (observation→bhakti, self_inquiry→body, bhakti→jnana, karma→witnessing,
    breath→self_inquiry, witnessing→karma, jnana→bhakti, body→breath, raja→observation),
    with per-user effectiveness tracking.
  - **`detect-anomalies`** (admin-only): platform-health heuristics — signup-rate drop,
    AI-cost spike — not user-facing.
  - **`detect-silence`**: prolonged practice/session inactivity flagging.

  ## 3.8 Guide Modes and Master/Guru selection

  Two conflated "30+" concepts: **Guide Modes** (conversation styles) and the
  **Master/Guru roster** (whose voice speaks). A session picks one of each; master
  selection is layered across four independent implementations plus the runtime overrides.

  ### 3.8.1 Guide Modes — `src/lib/guideModes.ts` (25 modes)

  A flat user-facing array of `{id, label, emoji, description, placeholder}`; actual prompt
  style lives in the system prompts built by `promptDirector` / edge functions. The 25:
  `open`, `self_inquiry` ("Who am I?" Socratic), `pattern_finder`, `shadow_work`,
  `therapy`, `dream_analysis`, `gratitude`, `somatic`, `philosophy`, `theory`,
  `relationship`, `creative`, `decision`, `breathwork`, `inner_child`, `manifestation`,
  `anger` (anger alchemy — transform, not suppress), `death_meditation`,
  `consciousness_checkin`, `task_giver`, `future_self`, `loop_explorer`,
  `evening_intention`, `evening_reflection`, `observation`. `getModeById()` falls back to
  `open`. Mode frameworks for the meaningful subset live in
  `src/lib/guideModeFrameworks.ts` + `_shared/mode-frameworks.ts`.

  ### 3.8.2 The Master Matching Engine — crisis-first triage (`masterMatching.ts`)

  The safety gate ahead of all spiritual routing: `checkCrisis()` runs first against a
  hard-coded crisis-keyword list (English + Hinglish: "suicid", "khudkushi",
  "jaan se maaro", …) — matches route to `CRISIS_RESOURCES`, not into guide chat. Then
  `categorizeProblem()` keyword-scores free text against 14 `GuidanceCategory` values
  (heartbreak, grief, intrusive-thoughts, anxiety, depression, anger, job-crisis,
  financial-stress, family-conflict, addiction, sleep, purpose-confusion,
  spiritual-guidance, decision-making), and `matchMasters()` scores each of the scoped
  guides by expertise (0.8–1.0 in-category) to return the top 3.

  ### 3.8.3 Four master-selection implementations

  1. **`chooseMasterForSession.ts`** — small pure picker over 7 masters. Priority: exact
    mode match (self_inquiry→Ramana; shadow_work/anger/inner_child→Rumi;
    breathwork/somatic/death_meditation→Shiva; decision/task_giver/philosophy→Krishna;
    pattern_finder/loop_explorer/dream_analysis→Buddha; creative/manifestation→Lao Tzu)
    → dimension keyword match → a fixed day-based "foundation arc" for days 1–60
    (Patanjali 1–7, Buddha 8–21, Krishna 22–45, Ramana 46–60) → Shiva as lifetime
    default.
  2. **`masterMatching.ts`** — the crisis-first triage above.
  3. **`dynamicGuruSelector.ts`** — additive scoring over the full gallery blending
    band affinity (`BAND_CORE_GURUS[bandFloor]` ranked points), active-loop specialist
    boosts (`LOOP_TO_GURU`: anger→Buddha/Patanjali, grief→Rumi/Buddha/Ramana, fear→
    Krishna/Patanjali/Buddha, control→Lao Tzu/Krishna, …), and theme-keyword affinity
    (silence/surrender/devotion/inquiry/witness/…). Highest total wins, excluding
    recently-used ids for variety. Explicitly used "after the first session and on each
    session-end" to pick tomorrow's companion.
  4. **`masterRotation.ts`** — a *stateful rotation policy*: no guru → initial phase match
    (21-day duration); lifetime phase ≥ 10 → forced 365-day "silence" pseudo-guru ("the
    teacher within is enough"); loop severity ≥ 0.7 → 7-day specialist takeover
    (`LOOP_SPECIALIST_MAP`: anxiety→Thich Nhat Hanh, anger→Buddha, attachment→Ashtavakra,
    comparison→Ramana, perfectionism→Krishna, procrastination→Vivekananda,
    validation_seeking→Nisargadatta, spiritual_bypassing→Krishnamurti, ego_inflation→
    Ashtavakra, emotional_collapse→Anandamayi Ma); stalled progress ≥ 14 days → rotate
    within the phase's list; otherwise a routine 21-day rotation avoiding the 3
    most-recent gurus.

  **Runtime overrides:** `session-adapter` (§3.6.4) can swap the assigned master at
  session entry from real-time state, and the **guest-master summoning protocol**
  (§3.8.5) allows a second voice mid-conversation without changing the session's primary.

  ### 3.8.4 The roster itself

  See §8.5 for the full data model: 89+ entries in `TEMPLE_GUIDES` (25 fictional
  Sanskrit-named composites retained for backward compatibility but filtered from the
  public roster; 64+ real historical/public-domain masters), a "student-of" tier for
  living teachers (legal firewall), 18 categories, per-guide `aiPrompt` voice definitions,
  practice/program libraries, and sacred-text cross-references.

  ### 3.8.5 The Elder + guest-master summoning (`guestMasterRoster.ts`)

  The user's primary guide — "the Elder" — is always present across all modes, and can
  mid-conversation **summon** one of 30 `GUEST_MASTERS` via an inline tag protocol the
  model itself emits: `[GUEST:krishna] … [/GUEST]`, then seamlessly resume as itself.
  Each guest has a `voiceStyle` instruction (Ramana: "Devastating simplicity… almost no
  words") and `triggers[]` (Ramana: "who am i", "identity", "ego"; Rumi: "heartbreak",
  "longing", "grief"; Marcus Aurelius: "external", "out of control"). 
  `buildCouncilBriefing()` compiles all 30 into one prompt block the Elder reads to know
  who is available. The client-side tag parser strips/buffers these tags even when split
  across stream chunks (§4.6). `council-consensus` extends this to full multi-master
  council sessions (`/app/council`, Council.tsx).

  ---

  ## 3.9 The Memory System

  Two independent stacks plus a curated highlight reel, all feeding one goal: **the app
  remembers what mattered, so tomorrow's session responds to today.**

  ### 3.9.1 Layer 1 — `guru_memory`: AI-distilled, importance-scored, decaying memories

  **`memory-extract`** — entry point for raw text ≥ 30 chars (journal entry or guide
  transcript). Calls `llama-3.1-8b-instant` with a `store_memory` tool-call contract that
  forces the AI to distill: a 2–3 sentence `content` summary, `importance` 1–10 (1–3
  routine, 4–6 meaningful pattern, 7–8 significant breakthrough, 9–10 life-changing), a
  `category` (breakthrough/pattern/trigger/milestone/insight/struggle), 2–5 tags, an
  `emotional_tone` enum, a `dimension_relevant`, `linked_loops` (the 7 core loop ids:
  origin/worth/safety/power/connection/identity/compulsion), and — notably — a
  **`memory_layer`** classification into five depth tiers:

  | Layer | Meaning |
  |---|---|
  | `surface` | daily/routine |
  | `karmic` | repeating life patterns, recurring relationship cycles, déjà-vu themes |
  | `ancestral` | family-inherited / generational / parental conditioning |
  | `evolutionary` | breakthrough / before-after identity shifts |
  | `somatic` | body-stored trauma, tension, breath signatures |

  Memories scoring ≤ 2 are silently dropped — routine observations are never stored
  long-term. Every 5th stored memory fire-and-forgets a call to `memory-consolidate`.

  **`memory-consolidate`** — first applies a DB-side decay RPC (`decay_memories`) to all
  active memories, then pulls up to 100 non-consolidated memories and asks the AI (one
  `consolidate_and_detect` tool call) to do two things in one pass: (1) identify **merge
  groups** — memories saying the same insight in different words — collapsed into one
  survivor (absorbed rows marked `is_consolidated`/`consolidated_into`, never deleted);
  (2) detect **cross-session patterns** — themes recurring across 3+ memories — written to
  `memory_patterns` with `frequency`, `dimension`, `linked_loops`, `emotional_trend`
  (improving/stable/worsening/fluctuating), and `significance`
  (emerging/established/critical/resolving), with contributing memories tagged with a
  `pattern_cluster` label.

  ### 3.9.2 Layer 2 — `user_memory_vectors`: embedding-based semantic recall

  The "felt continuity" system. Every meaningful utterance (journal, chat, reflection,
  session note, observation, pulse-check, daily synthesis) is embedded via Gemini
  `text-embedding-004` and stored with `source_type`, `source_id`, `tags[]`, `loop_ids[]`.
  The client bridge (`src/lib/memory/longTermMemory.ts`) fire-and-forgets POSTs to
  `embed-memory`, which rejects content < 8 chars, validates `source_type` against a fixed
  enum, and stores even a null embedding on Gemini failure (so the row still exists for
  non-semantic lookups).

  **Retrieval** happens through two paths sharing the same Postgres RPCs
  (`match_user_memories` for pgvector similarity, `count_loop_occurrences` for
  recurrence):

  - **`recall-memory`** — directly callable by the client.
  - **`buildLongTermMemoryBlock()`** (`_shared/long-term-memory.ts`) — the sophisticated
    internal path used by `guide-chat`, `compose-session-v3`, etc. It:
    1. Embeds the current query and runs semantic search **excluding the last 24 hours**
      (`p_min_days_ago: 1`) — so recall feels like *memory*, not recency bias.
    2. For the user's most-active loop, counts occurrences over 60 days; if ≥ 3, generates
      a specific callback: "This is the Nth time the pattern X has surfaced in the last 60
      days (first noticed <date>, on N distinct days)."
    3. Pulls the 2 most recent `daily_memory_synthesis` rows for "yesterday-aware" morning
      continuity.
    4. Whenever a surfaced memory is ≥ 7 days old, logs a row to `ai_callback_log` — the
      enforcement mechanism for the product rule that **1 in 5 sessions must include a
      felt-continuity callback** referencing memory older than a week.
    5. Ends the injected markdown block with an explicit instruction: *"At most ONE
      callback per reply. Phrase it like a friend who remembers, not a system that logs"* —
      with a worked example ("Three weeks ago you wrote about your father — is this the
      same ache?").

  ### 3.9.3 Daily synthesis — `synthesize-daily-memory`

  Once per day per user (nightly cron via service-role/`x-cron-secret`, or on demand):
  gathers everything the user did that day — journal entries, session summaries, the
  evening reflection (mood/energy/gratitudes/highlights/challenges/lessons), and
  `consciousness_signals` loop touches — flattens it, and asks
  `llama-3.3-70b-versatile` (temperature 0.6, 220 max tokens) for exactly one
  **3-sentence, second-person "who you became today" reflection** — no headings, no lists,
  no platitudes; must "notice what shifted… name the emotional texture… end with one quiet
  observation, not a prescription." Idempotent per date; skip-safe when the day had no
  signal. The result is stored in `daily_memory_synthesis` (with heuristic `key_themes`
  and a `mood_signal`) **and immediately embedded** into `user_memory_vectors` with
  `source_type:"synthesis"` — so tomorrow's session can recall the AI's own end-of-day
  interpretation of the user, not just raw utterances.

  ### 3.9.4 Sacred Moments — `extract-sacred-moments`

  A highlight-reel extractor over the last 1–30 days of journal entries (default 7). Asks
  `tier:nano` to **identify — not summarize — genuine sacred moments**: breakthroughs,
  tears (deep grief/release), laughs (real joy), realizations, vows, gratitude, grief,
  first-vulnerability, milestones, life events — each returned with a direct `user_words`
  quote, `emotional_tone`, `importance` (floored at 5 — routine content is never eligible),
  and `confidence` (kept ≥ 0.6). Quality over quantity: hard cap of 5 moments per run,
  dedup by `source_id` within the window. Written to `sacred_moments` with `occurred_at`
  backdated to the source journal's `created_at` and an `auto_extracted: true` flag.
  Powers the **Memory Vault** page (`/app/memory`, `MemoryVault.tsx`) — a curated,
  human-browsable timeline of peak/trough moments, filterable and searchable.

  ### 3.9.5 Narrative memory features

  - **`inside_jokes`** — AI-detected humor/personal references it can call back.
  - **`future_self_whispers`** — sessions leave one-sentence messages (≤ 22 words, tone
    `tender|fierce|playful|grave|grateful`) for the *next* session's future self; the
    Sankalpa Engine weaves them into intros and marks them consumed (§3.5.3).
  - **`higher_self_letters`** — full generated letters from the user's higher self
    (`generate-higher-self-letter`).
  - **`dream_entries`** — dream journal decoded by `decode-dream`.
  - **`legacy_vault`, `legacy_guardians`, `life_events`** — the Life & Legacy feature: a
    long-horizon vault of reflections with named guardians (§8).

  ## 3.10 The Theme system (daily themes and living arcs)

  Two generations coexist:

  - **`daily_themes`** (v1): one row per calendar day, globally readable — title,
    description, focus areas, affirmation. Early and simple; personalization later moved
    the "theme of the day" into per-user tables.
  - **The Living Theme Engine** (v2): a theme is not static — it **evolves through arcs**
    (multi-day narrative chapters) with "echoes" (callbacks) and even "pair invites"
    (two-person theme arcs for accountability partners). Tables: `theme_arcs`,
    `arc_templates`, `arc_chapters`, `arc_echoes`, `arc_pair_invites`,
    `theme_evolution_log`, `spiral_phase_predictions`. Functions: `generate-theme`
    (create), `evolve-theme` (advance the arc after each session — called by the Sankalpa
    Engine with the completed spine), `assign-curriculum-arc`, plus the theme orchestrator
    shared module (`_shared/themeOrchestrator.ts`). Theme selection considers the active
    arc + phase, **lunar phase** (new/full/waxing/waning), season, and user state.
    `useThemeOfDay()` on Home reads the resulting plan.

  ## 3.11 The Dimension Tracker

  **Files:** `src/lib/consciousness/dimensionTracker.ts` (client), 
  `aggregate-daily-dimensions` + the consciousness engine (server).

  The feedback loop that makes the system *learn the user*:

  1. Every practice carries a pre-defined per-dimension `impact` 
    (`DIMENSION_IMPACT_MATRIX`).
  2. On completion, `generatePracticeSignals()` computes a delta per affected dimension:
    `delta = impact/4 × quality × durationFactor(capped 1.5×) × levelFactor × 0.1`.
  3. `applySignals()` folds deltas into the dimension snapshot via **confidence-weighted
    EMA** (smoothing), tracking a per-dimension `trend` (rising/stable/falling).
  4. `getWeakestPrimaryDimension()` / `getDimensionBalance()` feed the Practice Engine's
    targeting rule and "focus on X, it's N bands behind" recommendations.
  5. Updated scores flow back into the V-Level engine → gating, archetype, master
    selection all shift. Over time the system builds a map of *how this specific user
    responds to specific practices*.

  ## 3.12 The Retention Engine

  **File:** `src/lib/consciousness/retentionEngine.ts` (+ `predict-churn`,
  `predictive-insights` edge functions, `retention_signals` table).

  Blends session rate, average quality, streak days, and engagement level into a risk
  classification with **graduated, guilt-free prescriptions**:

  | Risk | Prescription | Meaning |
  |---|---|---|
  | Thriving | Silent celebration | engaged + progressing; no intervention |
  | Stable | Micro pulse | steady; tiny non-intrusive notification |
  | Drifting | Gentle nudge | slipping; soft re-engagement |
  | Disengaged | Reflect invite | absent; invite to journal/reflect |
  | Lost | Full re-onboarding | gone; the "Arya returns" experience |

  The explicit design stance: wellness apps that panic-spam on disengagement create guilt
  and churn; this engine prescribes contextually respectful gestures. `generate-journey-nudge`
  + `useIdleNudge`/`useJourneyNudge` hooks deliver them; `nudge_queue` + Realtime deliver
  live nudges (§5.9).

  ## 3.13 The Speed Profile Engine

  **Files:** `speedProfileEngine.ts` (client), `evaluate-practice-level` (server),
  `user_speed_profile` + `speed_profile_history` (tables).

  Classifies Fast/Steady/Deep (§1.6), adapts difficulty from the last 3 quality scores
  (`harder`/`gentler`/`stabilize`), detects guilt patterns (apologetic language, long
  gaps, shortened sessions) and responds with anti-guilt messaging plus a suggested
  2-minute restart practice. Server-side, `detectSpeedType()` re-derives and persists the
  profile from rolling session batches.

  ## 3.14 The Companion Engine

  **Files:** `compute-companion-state`, `companion-engine` edge functions;
  `companion_mood` table; `useCompanionEngine` hook (Home).

  Models the AI companion's own simulated **mood/presence** so it does not feel like a
  stateless chatbot — the orb on Home visibly reflects a presence with state, not just a
  button. This is part of the "living app" texture alongside the ambient background and
  the consciousness bus.

  ## 3.15 Signal Fusion (multi-modal signal ingestion)

  **Functions:** `ingest-signal`, `signal-fusion`, plus the watcher family:
  `gmail-tone-watcher`, `outlook-tone-watcher`, `slack-tone-watcher`,
  `teams-tone-watcher`, `calendar-meeting-watcher`, `github-late-night-watcher`,
  `linear-workload-watcher`, `tone-watcher`, `wearable` / `wearable-sync`.

  Signals land in three tables — `work_signals` (tone/channel), `bio_signals` (HRV,
  sleep, steps, HR), `device_signals` — and are **consent-gated** per integration by
  `signal_consents` (surfaced in `SignalConsentCenter` at `/app/integrations`). The
  fusion engine merges them into a unified user-state object feeding the Adaptive,
  Practice, and Retention engines; the cron detectors (§3.7.4) mine the same tables.
  Wearable auth runs through `wearable-oauth-start/-callback`. This is what makes the
  system multi-modal: it reads physiology, schedule, communication tone, and work habits
  — not just typed text.

  ## 3.16 The Curiosity Engine

  **Files:** `curiosity-engine` edge function; `curiosity_queue`,
  `curiosity_cooldowns` tables (seeded at onboarding by `assess-starting-levels`).

  Proactively surfaces open questions to the user — a "curiosity queue" with cooldowns so
  wonder is dosed, not dumped. Integrates with the hidden-stage reveal logic (§1.10):
  deeper stages get deeper questions.

  ## 3.17 Chakra, kosha, three-brain, and kundli engines

  - **`_shared/chakraEngine.ts`** — `detectBlockedChakra()`; consumed by the composer
    (§3.5.3) and the consciousness engine's derived chakra scores (§1.11).
  - **`kosha-scanner`** — the five kosha (sheath) model: scans across annamaya (food/
    body), pranamaya (energy), manomaya (mind), vijnanamaya (wisdom), anandamaya (bliss).
  - **`infer-three-brain`** — the "reptilian / limbic / neocortex" three-brain model;
    results in `three_brain_inferences`, feeding head/heart/gut framings used across the
    council voices (§3.5.3), the three-brains games, and `three-lens-analyzer`.
  - **`compute-kundli`** — Vedic astrology birth-chart computation (`user_kundli`),
    surfaced via `BirthInsightsChip` on Home and injected as context via
    `_shared/kundli-context.ts`.

  ---

  # PART 4 — THE SESSION SYSTEM (DEEP DIVE)

  ## 4.1 What a session is

  A session is the core user experience: a structured, time-bound practice (typically
  5–60 minutes) with four phases and a fixed time formula (`getSessionFormula()`):

  1. **Teaching (30%)** — the guide/master introduces today's theme (2–5 min, pointed,
    never a lecture).
  2. **Practice (50%)** — an interactive practice selected by the Practice Engine:
    breath, body, self-inquiry, witness, emotional, shadow, relationship, decision,
    silence, or three-brains work — always *doing*, never passive video.
  3. **Reflection (20%)** — chat ("What arose for you?"), journal prompt, and a
    self-rating ("How present were you? 0–100%").
  4. **Integration** — an action item for the day, a micro-practice for later, and a
    preview of the next session; karma/XP awarded.

  Sessions live in the `sessions` table (unified: `type` = guide/generative/…,
  `time_slot` = morning/midday/evening/night, `status` = active/completed, `summary`
  JSON), with chat transcripts in `session_messages`, and the v3 pipeline's durable record
  in `session_spine` (§4.8).

  ## 4.2 The four daily gates

  The day is organized into four time gates, each with its own character
  (`dailyGates.ts`, `dailyCycleMachine`, the `--slot-*` CSS gradients):

  | Gate | Hours | Character | Practices | AI tone |
  |---|---|---|---|---|
  | Morning | 5am–12pm | intention, new beginnings | breath, activation, energizing | fresh, encouraging, clear |
  | Midday | 12pm–5pm | awareness in action | micro-practices (60s), body awareness | light, supportive, non-intrusive |
  | Evening | 5pm–9pm | integration, reflection, release | longer sessions, emotional work, journaling | deeper, more spacious |
  | Night Sanctuary | 9pm–5am | rest, surrender, dream | body scan, yoga nidra, dream journal | minimal, soft, almost silent |

  `gateForHour()` (night < 5, morning < 12, midday < 17, evening < 21, else night) is the
  canonical mapping used by `getUserContext()`, the composer, and the session flow.

  ## 4.3 Session lifecycle end-to-end

  ```text
  Home orb (press-and-hold 1.5s ritual)
    └─ startGenerativeSession({ intent, slot, themeId, timeBudget, energy })   [session-shell/api.ts]
        ├─ ensureCreditsForSession()          # user_credits.balance_paise ≥ 50, else 402 + upsell
        ├─ [flag off] generate-session-agenda  # legacy composer (production default)
        ├─ [flag on]  compose-session-v3       # Sankalpa Engine → plan + spineId (§3.5.3)
        └─ SessionShellProvider mounts the plan; cursor = -1 (agenda card)
    └─ beginFromAgenda() → cursor 0..N-1 through steps
        ├─ each step: kind-specific UI (wisdom-read / breathwork / journal / micro-act /
        │   reflection / guide-chat / practice / temple-chat / witness)
        ├─ goToNext(payload) records duration+payload into completedSteps
        ├─ skipCurrent() records into skippedSteps
        └─ progress persisted to localStorage 'session-shell:{sessionId}' every change
            → an interrupted session resumes exactly where left off
    └─ cursor = N → completeGenerativeSession({ completedSteps, skippedSteps, totalSeconds })
        ├─ session-complete edge fn  → writes unified `sessions` row + summary
        ├─ fire-and-forget award_karma_event RPC (base score from step count + reflective bonus)
        └─ scoreSessionSpine({ spineId, finalUserSentence, stepCompletions, duration, mood })
              → score-session-spine edge fn → session_spine.quality_score
              → read back by compose-session-v3's "adaptive history" next session
  ```

  Meanwhile, the chat-flavored session path (Guide tab) runs the parallel G2 stack
  (§4.6), and practice runs can be triggered from anywhere via the cinematic provider
  (§4.12). Signals emitted during all of this (mood pulses, reflections, quality
  ratings, bio/work/device inputs) land in `consciousness_signals` /
  `engine_signals` and close the loop into tomorrow's `getUserContext()`.

  ## 4.4 The four parallel session architectures

  This is the most important thing to understand about the session system: **it is four
  generations of architecture, all still live in the tree** (see also §12.1):

  | Gen | Runtime | Composition | Persistence | Status |
  |---|---|---|---|---|
  | **G1 Orb** | `sessionOrchestrator.ts` + localStorage (`orb-sessions-YYYY-M-D`) | deterministic `orchestrateSession()` (§4.10.2) | localStorage only | legacy/parallel surface |
  | **G2 Chat** | `sessionMachine` + `useGuideChat` + `useSessionFlow` | `promptDirector` + `_shared/adaptive-engine.ts` per turn; first message scripted by session flow (§4.5) | `sessions` + `session_messages` (+ legacy `chat_sessions`/`guide_messages` tables) | production (Guide tab) |
  | **G3 Generative** | `SessionShellProvider` cursor runtime | `generate-session-agenda` (legacy) or `compose-session-v3` (flag `sankalpaV3`) | `sessions.summary` + `session_spine` + `user_memory_vectors` | production (flagged v3) |
  | **G4 Cinematic** | `CinematicSessionProvider` + `PracticeRunControllerContext` + `sessionPlayerMachine` | scripted `CinematicScript`s resolved by practice level | practice run records | production (practice runs) |

  They share the same vocabulary (gate, archetype, step, spine, karma) and the same
  `getUserContext()` substrate — but they are distinct code paths, not one pipeline.

  ## 4.5 Session Flow Orchestrator: morning / evening / night scripts

  **Files:** `src/lib/sessionFlow.ts`, `src/hooks/useSessionFlow.ts`, `src/pages/Guide.tsx`
  (documented in `SESSION_FLOW.md`).

  Historical note (in the file's own header): this system *replaced* rigid fixed scripts
  (Morning 9-step / Evening 8-step / Night 5-phase) with a **context + state driven
  directive** — the client emits a high-level surface directive and the edge function's
  `_shared/adaptive-engine.ts` has "the final word" per turn.

  **Morning Session Flow (5am–12pm)** — phases: (1) greeting (name, streak, journey day),
  (2) theme introduction ("Today's theme is {title}"), (3) why-this-theme (connected to
  band level, focus dimension, patterns), (4) how-this-helps (2–3 specific benefits tied
  to real life), (5) opening question ("How did you sleep? Any dreams?"), (6) practice
  suggestion after 2–3 exchanges, (7) integration ("What's one thing you're carrying
  forward?"). Special scenarios: **returning after 3+ days** → no guilt, 5 minutes only,
  "the path celebrates return"; **streak 7+** → challenge deeper, extend practice;
  otherwise the full structured flow.

  **Evening Session Flow (5pm–9pm)** — phases: greeting + day review ("Good evening. The
  day is settling."), reflection on specifics (references the morning session, tasks,
  practice), celebrate wins ("even ONE moment of awareness is huge"), explore struggles
  without guilt, gratitude practice (3 things), lessons extraction ("What did today teach
  you?"), connect to tomorrow (preview next theme + one commitment), closing review
  (theme, clarity moment, lesson, gratitude).

  **Night Sanctuary Flow (9pm–5am)** — hard rules: **no deep inquiry, no analysis,
  everything short and gentle, redirect to rest if the user starts analyzing.** Phases:
  wind-down greeting → quick body check-in ("How's your body? Tired? Restless?") →
  state-based practice (restless → 15 min Yoga Nidra; peaceful → 5 min gratitude; heavy →
  10 min gentle breathwork) → plant one seed (theme affirmation for sleep) → closing
  ("Sleep well. The path holds you.").

  **Context data used** (`SessionFlowContext`): user (name, streak, journey day, band
  level/name, focus dimension, language), theme (title, description, rationale,
  learning focus, intentions, action items, affirmation, focus areas), morning-session
  results (completed, summary, insights), day activity (journal entries, practice done,
  tasks completed/missed, dominant mood, energy), missed days, yesterday's summary.

  **Wiring in Guide.tsx:** the hook builds system prompt + first message; the first
  message is injected as a scripted `STREAM_DELTA` when the session starts
  (`messageCount === 0`), so even before the user types anything, the guide *opens* the
  session in its own voice; all subsequent turns stream from `guide-chat` with
  `aiContext: sessionFlow.systemPrompt`.

  ## 4.6 Chat sessions: `sessionMachine` + streaming

  **Files:** `src/machines/sessionMachine.ts` (139 lines), `src/hooks/useGuideChat.ts`,
  `supabase/functions/guide-chat/index.ts`.

  `sessionMachine` models the live Guide chat end-to-end:

  - States: `idle → starting → active → ending → completed → (RESET) idle`.
  - Context: `{ sessionId, timeSlot, themeId, themeName, messages: {role, content}[], error, isStreaming }`.
  - Events: `START_SESSION`, `SESSION_CREATED`, `ADD_USER_MESSAGE`, `START_STREAMING`,
    `STREAM_DELTA`, `STREAM_DONE`, `END_SESSION`/`SESSION_ENDED`, `ERROR`, `RESET`.
  - The canonical streaming reducer:

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

  **Typewriter smoothing** (`useGuideChat.ts`): rather than pushing raw SSE chunks into
  React (bursty), incoming text appends to a `pending` buffer and a flush timer releases
  **2 characters every 18ms (~110 chars/sec)** regardless of chunk arrival — a
  ChatGPT-like progressive reveal even when the gateway flushes large chunks at once.

  **Guest-tag parsing:** a separate parser strips/holds `[GUEST:masterId]…[/GUEST]`
  control sequences (§3.8.5), buffering partial bracket sequences in a `tagBuffer` so a
  tag split across chunks never leaks literal `[GUEST:` text on screen; fires
  `onSpeakerChange(speakerId|null)` when a guest starts/stops speaking. Only
  tag-stripped visible text feeds `onDelta` → `STREAM_DELTA`. Karma is awarded as part of
  the same hook on completion.

  **Server side (`guide-chat`)**: canonical edge-function anatomy (§5.2) — auth → atomic
  credit pre-check (50 paise) → build the system prompt from `buildElderVoice()` +
  per-master dossier (`_shared/voice-lineage.ts`) + adaptive decision
  (`_shared/adaptive-engine.ts`) + long-term-memory block (§3.9.2) + human-presence
  fragment + kundli context → stream the completion back as SSE → on first message of a
  session it also internally calls **`session-adapter`** (function-to-function over
  HTTP, forwarding the auth header) so master/mode/practice adaptation is logged and
  auditable (§3.6.4) → post-call billing via `computeChargedPaise()`.

  ## 4.7 The session-shell generative runtime

  **Files:** `src/lib/session-shell/{types.ts, api.ts, SessionShellContext.tsx}` — the
  actual UI-facing consumer of composed plans (both `generate-session-agenda` and
  `compose-session-v3`).

  - **`types.ts`** mirrors the edge payloads 1:1: `StepKind` (9-way union), `SessionStep`
    (kind, title, prompt, params, optional, est_minutes, whyForYou, signalRef),
    `SessionPlanMeta` (vLevelStart, dimensionBandsStart, composedBy, languageRefinedBy,
    archetype, archetypeReason, toneWords, whyThisSession), `SessionPlan`,
    `CompletedStepRecord`, `DimensionNudge`, `SessionCompleteResult` (ok, sessionId,
    completedStepCount, durationMs, loopsTouched, karmaEarned, shiftSummary, nextTeaser,
    vLevelDelta, dimensionNudges, qualityScore, primaryPractice).
  - **`api.ts`**:
    - `startGenerativeSession()` — credits gate → feature flag `sankalpaV3Enabled()` →
      v3 (returns `sessionId: spineId ?? plan.id`) with **silent fallback** to the legacy
      agenda function on any v3 failure ("zero breakage").
    - `loadGenerativeSession(sessionId)` — rehydrates a plan from `sessions.summary`.
    - `completeGenerativeSession()` — `session-complete` + fire-and-forget karma RPC.
    - `scoreSessionSpine()` — `score-session-spine` (safe/fire-and-forget).
  - **`SessionShellContext.tsx`** — cursor semantics: `-1` = agenda card, `0..N-1` =
    step index, `N` = ready-to-complete. Persists to localStorage
    (`session-shell:{sessionId}`) on every state change; `readPersistedShell` /
    `clearPersistedShell` are exported so other surfaces (e.g. Home) can peek at
    in-progress state. Actions: `beginFromAgenda()`, `goToNext(payload?)` (records the
    current step's duration + payload into `completedSteps`), `skipCurrent()` (records
    into `skippedSteps`). `useSessionShell()` throws outside the provider.

  ## 4.8 Session completion, karma, and spine scoring

  - **`session-complete`** — writes the unified `sessions` row with a JSON summary
    (plan, steps completed/skipped, durations), returns the completion result payload,
    and computes `loopsTouched` (which active loops this session addressed — closing the
    loop-detector → session loop).
  - **Karma** — `award_karma_event` RPC, base score from step count + a bonus for
    reflective steps; events accumulate in `karma_events` / `user_karma` /
    `xp_transactions` (the gamification layer behind `KarmaChip` and the constellation).
  - **`score-session-spine`** (Sankalpa T5) — scores the `session_spine` row for the
    session (inputs: the user's final sentence, per-step completions, duration, mood) and
    writes `quality_score`. This is the exact column compose-session-v3's **adaptive
    history** reads (§3.5.3 step 3) — archetype/master resonance statistics that bias
    (never force) future archetype selection. **The session system is a self-scoring
    feedback loop.**

  ## 4.9 Mid-session adaptation

  Two distinct adaptation moments:

  - **At entry:** `session-adapter` (§3.6.4) adapts the pre-assigned
    `{master, mode, practice}` once, at session start.
  - **Mid-session:** **`adapt-next-block`** runs between blocks. It pulls `engine_signals`
    from the last 15 minutes; if none, it fast-paths to `keep` with **zero AI cost**.
    Otherwise it hands the AI a strict tool call (`decide_adaptation`) with exactly three
    actions — `keep` (default), `replace` the next block, or `inject` a short 60–240s
    bridge step — constrained to a fixed practice vocabulary (`PRACTICE_ROUTE`:
    observation, breath, witness, body, self-inquiry, bhakti, jnana, journal) so the AI
    cannot hallucinate an unroutable practice. The system prompt biases toward `keep` and
    forbids injecting more than one extra step.

  ## 4.10 `src/lib/session/*` — the structured session library

  A 12-file typed library (with its own `IMPLEMENTATION.md`) that appears to be the
  newest consolidation layer for structured sessions:

  | File | Role |
  |---|---|
  | `types.ts` | canonical session types |
  | `orchestrator.ts` | session orchestration (successor of the G1 orb planner) |
  | `thread.ts` | session threading (continuity across days) |
  | `journey.ts` | journey-linked session progression |
  | `adapters.ts` | adapters between plan shapes and runtimes |
  | `completion.ts` | completion semantics (successor seams for `session-complete`) |
  | `events.ts` | session event emission |
  | `moments.ts` | moment extraction (sacred-moment seams) |
  | `naming.ts` | session naming |
  | `migrate.ts` + `migrate-runner.ts` | migration of legacy session shapes |
  | `index.ts` | barrel |
  | `IMPLEMENTATION.md` | the module's own design doc |

  Plus the G1-era siblings in `src/lib/`: `sessionEngine.ts` (master-recommendation
  heuristics: `detectPatterns()` keyword-scans recent reflections for
  restlessness/calm/anger/sadness/clarity; `generateSessionRecommendation()` cascades to
  gentle 10-min breathwork, "Observing Resistance" for anger, 5-min "Just Sit" after 5+
  missed days, 35-min deep inquiry when thriving, else time-of-day defaults;
  `generateMissedDayOutreach()` for 3–5 vs 5+ missed days) and `sessionOrchestrator.ts`
  (deterministic per-day planner: `pickPractice()` by gate/dimension/loop/rotation,
  `pickMode()`, `pickDuration()` with energy × gate multipliers, `buildGreeting()`,
  `buildKnowledge()`, `buildPractice()` with intention/closing prompt maps, `buildClosing()`
  with a prediction + next-session teaser; localStorage persistence under
  `orb-sessions-*` / `orb-last-theme` keys).

  ## 4.11 The voice loop (STT/TTS)

  **Files:** `src/machines/voiceMachine.ts`, `src/hooks/useVoiceChat.ts`,
  `tts-speak` / `stt-listen` edge functions.

  `voiceMachine` coordinates mic ⇄ transcription ⇄ playback independent of session state:
  states `idle ⇄ recording ⇄ transcribing → idle` and `idle ⇄ speaking → idle`, with
  `speaking → recording` a first-class transition (barge-in/interrupt-while-speaking).
  `TOGGLE_VOICE` is declared at the top level so it works from any state.

  The loop: `MediaRecorder` captures audio → POST the blob to `stt-listen` (Deepgram) →
  `TRANSCRIPTION_DONE` feeds the transcript into the chat; assistant text POSTs to
  `tts-speak` (ElevenLabs) → synthesized audio plays → `SPEAK_DONE`. Errors map to
  `MIC_ERROR`/`TRANSCRIPTION_ERROR`/`SPEAK_ERROR`. This is the "voice orb" experience on
  Home/Guide — multi-modal sessions (voice, text, generative) in the README's words.

  ## 4.12 Cinematic practice runs

  **Files:** `src/lib/cinematic/{types,registry}.ts` + `scripts/*`,
  `src/contexts/CinematicSessionContext.tsx`,
  `src/contexts/PracticeRunControllerContext.tsx`, `src/machines/sessionPlayerMachine.ts`,
  `components/cinematic/CinematicSession.tsx`, `SilentModeShell.tsx`.

  A **script-driven, level-adaptive guided-practice engine**, architecturally separate
  from chat:

  - A `CinematicScript` = `{ id, practice, label, defaultDurationSec, surface:
    "black"|"guru-bg"|"starfield", layers: CinematicLayer[] }`.
  - Each **layer (0–3)** is a depth of narration: L0 "beginner (most hand-holding)" → L3
    "subtle (least narration, most space)".
  - Each layer is an ordered list of **phases** (`arrival | deepen | checkpoint |
    integrate | close`), each phase an ordered array of **beats** — timed subtitle cards
    `{ text, holdMs, silent? }` where `silent: true` marks held-breath/stillness pauses.
  - Mid-phase **checkpoints** ask a single-tap `question` with branching beat arrays
    (`onYes` / `onNotYet`) — "no typing", max 3–4 per session.
  - `resolveLayer(script, userLevel)` maps a constellation practice level (0–7) to a
    layer: ≥ 4 → L2, ≥ 2 → L1, else L0, capped to authored layers.
  - `getUserPracticeLevel()` reads the level straight from
    `user_practice_constellation` by dynamically keying `` `${practice}_level `` — one
    query serves any practice.
  - `pickScript()` resolves by id or practice → `{ script, layerIdx }`.
  - The provider is mounted once in `AppLayout`; `play({ scriptId?, practice?, userId?,
    guruImage?, guruName?, onComplete?, onExit? })` renders the full-screen
    `CinematicSession` overlay **outside the route tree** — any surface (Guide chat,
    Practice, Witness) can trigger it and resume its own flow via callbacks.
  - **Silent mode** (`SilentModeShell.tsx`) is the opposite wrapper: strips the UI to
    essentials for practices where visuals would undermine the state (long sits, pure
    witness). Registered alongside cinematic in the `modeRegistry` (§8.2).

  The deepest product property of the cinematic system: when a user's practice level
  rises (via `evaluate-practice-level`), the *next* run of the same script silently
  promotes to a sparser narration layer — less hand-holding without any settings screen.

  ---

  # PART 5 — THE BACKEND

  ## 5.1 Supabase architecture

  The backend is **entirely serverless** on Supabase (marketing name: "ConsciousOS Cloud" /
  the AI layer behind an abstraction called the "ConsciousOS AI Gateway"):

  | Service | Usage |
  |---|---|
  | **Postgres** | ~200+ tables, RLS on virtually all of them, `pgvector` for memory embeddings, RPCs (`check_credit_balance`, `decay_memories`, `match_user_memories`, `count_loop_occurrences`, `award_karma_event`, `admin_grant_credits`, …), views, triggers (`handle_new_user`, `update_updated_at_column`, founder auto-grant) |
  | **Auth** | email/OAuth; `auth.users` → `handle_new_user()` trigger seeds `profiles`; client session via `@supabase/supabase-js` |
  | **Edge Functions** | 102 Deno functions (`serve()` from `std/http/server.ts`) — all "intelligence" lives here |
  | **Realtime** | per-user channels: `consciousness-bus:{userId}`, notifications, `nudge_queue`, temple sensor layer, admin activity feed |
  | **Storage** | media/assets (manifest-driven, `upload-all-media.mjs` / `generate-media-manifest.mjs` pipelines) |

  ## 5.2 Anatomy of an edge function (the canonical pattern)

  Every AI-calling function follows the same shape (illustrated by `guide-chat`):

  1. **CORS preflight** — `OPTIONS` → empty response with shared `corsHeaders`
    (`_shared/cors.ts`).
  2. **Auth extraction** — read `Authorization: Bearer …`; construct a **user-scoped
    client** (`createClient(url, ANON_KEY, { headers: { Authorization } })`) so RLS
    applies to reads; `supabase.auth.getUser()` resolves `user.id`; reject 401.
  3. **Admin client** — a second service-role client for privileged operations that must
    bypass RLS (credit mutations, cross-user writes).
  4. **Atomic credit pre-check** — `admin.rpc("check_credit_balance", { p_user_id,
    p_min_balance: 50 })`; return `402 insufficient_credits` if the user cannot afford
    the call. This is the de facto middleware of the whole backend.
  5. **Do the work** — `getUserContext()` read aggregation → engine logic → AI gateway
    calls (§5.5) → writes.
  6. **Function-to-function composition** — where useful, edge functions call *each
    other* over HTTP with the caller's auth header forwarded (e.g. `guide-chat` →
    `session-adapter` on a session's first message) so decisions can be logged and
    evolve on their own release cadence.
  7. **Post-call billing** — `computeChargedPaise()` (`_shared/ai-pricing.ts`) from
    token usage; ledger rows in `credit_transactions` + `ai_usage_log` (+ `ai_cost_logs`).

  ## 5.3 The `_shared` module catalog (30 Deno modules)

  | Module | Role |
  |---|---|
  | `user-context.ts` | `getUserContext()` — The Brain (§2) |
  | `adaptive-engine.ts` | per-turn AI behavior decisioning (§3.3) |
  | `ai-config.ts` | AI gateway fetch wrappers + language injection |
  | `ai-pricing.ts` / `ai-billing.ts` / `billing-from-req.ts` | per-call cost computation + charge/balance helpers |
  | `voice-lineage.ts` | `buildElderVoice` / `buildMasterVoice`, `MASTER_DOSSIERS`, `VOICE_TAIL_REMINDER` — per-master persona prompt-engineering data |
  | `guest-masters.ts` | `buildCouncilBriefing` — 30-guest summon roster for council sessions |
  | `long-term-memory.ts` | `buildLongTermMemoryBlock` + `embedUtterance` — RAG memory injection (§3.9.2) |
  | `loop-library.ts` / `loopMap.ts` | `LOOP_REFERENCE` (AI-constrained loop ids) / id→display-name lookup |
  | `practiceMatrix.ts` | `buildPracticeMatrixSignal` (family × focus × level) for the composer |
  | `chakraEngine.ts` | `detectBlockedChakra` |
  | `arcEngine.ts` / `themeOrchestrator.ts` | living-theme arc machinery (§3.10) |
  | `composer.ts` | server-side composer helpers (v3 support) |
  | `graphContext.ts` | graph-shaped context assembly (`session_spine.graph_edges`) |
  | `human-presence.ts` | `HUMAN_PRESENCE_PROMPT` — shared fragment making the AI sound human, not robotic |
  | `kundli-context.ts` | astrology context block |
  | `mirror-knowledge.ts` | Mirror-session knowledge base |
  | `mode-frameworks.ts` | guide-mode framework definitions (server twin of `guideModeFrameworks.ts`) |
  | `psychological-probes.ts` | curated inquiry probes |
  | `language.ts` | i18n for AI output (60+ languages) |
  | `crypto.ts` / `sanitize-input.ts` | crypto helpers / input sanitization |
  | `rate-limit.ts` | per-user rate limiting |
  | `supabase-client.ts` | client construction helpers |
  | `cors.ts` | shared CORS headers |
  | `payment-config.ts` | Razorpay configuration |
  | `tShapeDecider.ts` | T-shape (vs breadth) practice-phase decisions |

  ## 5.4 Complete edge-function inventory (102 functions)

  Grouped by responsibility; ★ = AI-calling (credit-gated).

  **Session composition & orchestration**
  - `compose-session` ★ — thin wrapper: full user-context + composer input (§3.5.2)
  - `compose-session-v3` ★ — the Sankalpa Engine (§3.5.3)
  - `generate-session-agenda` ★ — legacy generative composer (production default behind flag)
  - `session-adapter` ★ — entry-time {master, mode, practice} adaptation (§3.6.4)
  - `adapt-next-block` ★ — mid-session keep/replace/inject (§4.9)
  - `session-complete` — unified session persistence + completion payload (§4.8)
  - `score-session-spine` ★ — spine quality scoring (T5; feeds adaptive history) (§4.8)
  - `next-session-preview` — precomputed "what's next" card for Home
  - `compose-today-practice` ★ — today's practice composition
  - `get-next-practice` — practice-engine lookup (§3.2)
  - `for-you-practices` — personalized practice list
  - `discovery-session` ★ — discovery/exploration session
  - `generate-practice-session` / `generate-path-level-session` / `generate-program-session` /
    `guru-practice-session` ★ — per-context practice/program session generation
  - `generate-showroom-day-session` ★ — no-login showroom day generation
  - `always-open-prompts` — the always-open prompt surface
  - `pre-journey-chat` ★ — Foundation/PreJourney conversation
  - `elder-dialogue` ★ — the Elder's dedicated dialogue surface
  - `mirror-session` ★ — Mirror checkpoint sessions (PreJourney mirrors)

  **Chat & guide surfaces**
  - `guide-chat` ★ — the primary streaming chat (Elder voice + adaptive directive + memory) (§4.6)
  - `temple-chat` ★ — Temple-mode chat
  - `council-consensus` ★ — multi-master council sessions (§3.8.5)
  - `dharma-retrieval` — dharma/knowledge retrieval

  **Consciousness & journey engines**
  - `consciousness-engine` — authoritative V-Level/state/chakra computation (§3.1)
  - `evaluate-practice-level` ★ — server level-up tracks + anti-guilt (§3.6.3)
  - `assess-starting-levels` ★ — onboarding → initial levels/DNA/domains (§3.6.2)
  - `recalibration-intelligence` ★ — drift detection + decision (§3.6.5)
  - `recalibrate-constellation` ★ — the 85/15–60/40 constellation blend (§3.6.5)
  - `compute-constellation` — constellation recompute
  - `aggregate-daily-dimensions` — dimension rollups (§3.11)
  - `user-state-snapshot` — state snapshots for consumers
  - `process-journey` — journey progression processing
  - `graduation-deep-analysis` ★ — Foundation graduation analysis
  - `master-journey-review` ★ — temple-journey reviews
  - `generate-master-next-step` ★ / `generate-master-theme-teaching` ★ — per-master next-step/teaching generation
  - `activate-specialty` — specialty practice activation
  - `verify-breakthrough` ★ — breakthrough verification (drives milestone notifications)
  - `three-lens-analyzer` ★ — three-lens (head/heart/gut) analysis
  - `infer-three-brain` ★ — three-brain inference (§3.17)
  - `kosha-scanner` ★ — five-kosha scanning (§3.17)
  - `compute-kundli` — Vedic astrology computation (§3.17)
  - `companion-engine` / `compute-companion-state` ★ — companion mood/presence (§3.14)
  - `curiosity-engine` ★ — curiosity queue surfacing (§3.16)
  - `integrate-human-map` — human-map integration (life domains)
  - `analyze-assessment` ★ — generic assessment scoring

  **Themes, programs, content**
  - `generate-theme` ★ — daily theme creation (§3.10)
  - `evolve-theme` ★ — living-arc advancement (called by v3 post-write)
  - `assign-curriculum-arc` — arc assignment
  - `generate-daily-ritual` ★ — daily ritual composition
  - `generate-personal-rhythm` ★ — personal rhythm generation
  - `generate-personal-program` ★ — AI-generated personal programs
  - `suggest-next-program` ★ — next-program recommendation
  - `generate-wisdom` ★ — wisdom-card generation
  - `decode-dream` ★ — dream-entry analysis (§3.9.5)
  - `generate-journey-nudge` ★ — re-engagement nudge copy (§3.12)
  - `daily-briefing` ★ — daily briefing composition

  **Memory system**
  - `memory-extract` ★ — distill + importance-score + 5-layer classification (§3.9.1)
  - `memory-consolidate` ★ — decay + merge groups + cross-session patterns (§3.9.1)
  - `embed-memory` ★ — vector embedding writes (§3.9.2)
  - `recall-memory` ★ — client-callable semantic recall (§3.9.2)
  - `synthesize-daily-memory` ★ — nightly 3-sentence synthesis (§3.9.3)
  - `extract-sacred-moments` ★ — highlight-reel extraction (§3.9.4)
  - `extract-commitment` ★ — commitment extraction from sessions/journals

  **Loop & signal detection**
  - `live-detect` ★ — chat-time AI loop detection + signal absorption (§3.7.3)
  - `detect` — detection family dispatcher
  - `instant-pulse-detector` — 15-min acute nudges (§3.7.4)
  - `pattern-window-detector` — 30-min cross-source pattern mining (§3.7.4)
  - `detect-anomalies` — admin platform-health heuristics
  - `detect-bypassing` / `detect-contradictions` / `detect-cross-pollination` /
    `detect-silence` — (named for their rulesets; some routed via `detect`)
  - `ingest-signal` — raw work/bio/device signal ingestion
  - `signal-fusion` ★ — unified signal merging (§3.15)
  - `tone-watcher`, `gmail-tone-watcher`, `outlook-tone-watcher`, `slack-tone-watcher`,
    `teams-tone-watcher`, `calendar-meeting-watcher`, `github-late-night-watcher`,
    `linear-workload-watcher` — the consent-gated workplace watcher family (§3.15)
  - `wearable`, `wearable-sync` — wearable ingestion/sync

  **Reflection, journaling, games, tasks**
  - `journal-reflect` ★ — journal analysis (feeds patterns/loops)
  - `post-event-reflection` ★ — post-event reflection
  - `pre-event-nudge` — pre-event nudging
  - `complete-task` — task completion
  - `reflect-game` ★ — game-response scoring
  - `guide-insight` ★ — insight generation for guide surfaces

  **Voice**
  - `tts-speak` ★ — ElevenLabs text-to-speech (§4.11)
  - `stt-listen` ★ — Deepgram speech-to-text (§4.11)
  - `translate-ui` ★ — UI translation pipeline (i18n)

  **Billing & payments**
  - `razorpay-order` / `razorpay-verify` — Razorpay checkout + credit top-ups (§5.6)

  **Enterprise & org**
  - `enterprise-insights` ★, `enterprise-people-intelligence` ★, 
    `org-weekly-briefing` ★, `manager-coaching` ★, `org-program-designer` ★ —
    the enterprise analytics/coaching/reporting/program functions (§9.1)
  - `seed-demo-org` — demo org seeding

  **Admin & ops**
  - `admin-ai-insights` ★ — AI insights about user behavior for admins
  - `admin-broadcast` — broadcast messaging
  - `admin-copilot` ★ — internal AI copilot
  - `predict-churn` ★ / `predictive-insights` ★ — churn/predictive analytics
  - *(removed)* `sql-exec` was an unauthenticated arbitrary-SQL executor carrying
    `verify_jwt = false`; it has been deleted and its `config.toml` entry with it.
    Any admin SQL must run through `admin-broadcast`/`admin-copilot` or a direct
    service-role migration.

  ## 5.5 The AI gateway and model routing

  All AI calls flow through `_shared/ai-config.ts` (`aiGatewayFetch` /
  `aiGatewayFetchWithLang`) with a **tier** concept and a per-user **aiMode**:

  | Tier / mode | Providers observed | Used for |
  |---|---|---|
  | `tier:nano` / fast-small | Groq `llama-3.1-8b-instant` | cheap extraction, sacred moments, council voices, detection |
  | `tier:fast` | Groq (`llama-3.3-70b-versatile` for synthesis) | loop detection, adaptation decisions, summarization |
  | `tier:main` / premium | OpenAI (and GPT-4/Claude class per platform docs) | session composition, guide chat, teaching generation |
  | Embeddings | Google Gemini `text-embedding-004` | memory vectors, novelty checks, contradiction search |
  | TTS | ElevenLabs | master voices |
  | STT | Deepgram | voice input |

  `identity.aiMode: "fast" | "premium"` (per-user, from the profile) selects the provider
  class for every call a user triggers — cost-aware personalization at the routing layer.
  Language injection (`aiGatewayFetchWithLang`, `_shared/language.ts`) localizes AI
  output across the ~40–60 supported locales. Every call is logged to `ai_usage_log` with
  token counts and price, aggregated into `ai_cost_logs` (admin cost dashboards), and
  charged via `computeChargedPaise()`.

  ## 5.6 Credits and billing

  - **`user_credits.balance_paise`** — balance in paise (₹1 = 100 paise). Every AI call
    costs 10–50+ paise by function class.
  - **Pre-check gate**: `check_credit_balance` RPC before any AI work; `402
    insufficient_credits` + client-side `triggerInsufficientCredits()` → credits page.
  - **Ledger**: `credit_transactions` (`bonus | purchase | spend`), e.g. a migration
    backfill granting 1100 free paise to existing users; `admin_grant_credits()` RPC for
    ops grants.
  - **Top-ups**: Razorpay (India-first) — `razorpay-order` creates the order,
    `razorpay-verify` verifies the payment signature and credits the balance.
  - **Free tier**: showroom programs (no login) + seeded credits.

  ## 5.7 Security: rate limits, sanitization, crisis gate

  - `_shared/rate-limit.ts` — per-user rate limiting on hot functions.
  - `_shared/sanitize-input.ts` — input sanitization before prompts.
  - **Crisis gate** — `masterMatching.ts` `CRISIS_KEYWORDS` (English + Hinglish) checked
    *before* any spiritual routing; matches return `CRISIS_RESOURCES` (§3.8.2).
  - **Prompt-injection surface** — master dossiers + adaptive directives are assembled
    server-side; user text never enters system-prompt position (an explicit hardening
    item in the platform roadmap).
  - RLS is the final backstop for everything the client tries to touch directly (§6.3).

  ## 5.8 Scheduled / cron workloads

  Cron-invoked functions (service-role / `x-cron-secret`): `pattern-window-detector`
  (30-min), `instant-pulse-detector` (15-min windows), `synthesize-daily-memory`
  (nightly per user), `memory-consolidate` (periodic), `recalibration-intelligence`
  (`all: true` over 30-day-active users), `detect-contradictions` / `detect-cross-
  pollination` / `detect-silence` (nightly), `detect-anomalies` (admin health), 
  `daily-briefing` / `generate-journey-nudge` (re-engagement windows), `org-weekly-
  briefing` (enterprise weekly).

  ## 5.9 Realtime channels

  Used sparingly for live server-push (most data flows through React Query):

  - `useConsciousnessBus.ts` — channel `consciousness-bus:{userId}`: engine-side events
    (insight computed, theme evolved, companion noticing) → `ConsciousnessBusListener`
    mounted in `AppLayout` reacts ambiently (toasts, haptics via loop_detected signals).
  - `useNotifications.ts` — new `notifications` rows → `NEW_NOTIFICATION` into
    `notificationsMachine` (live bell).
  - `useNudgeQueue.ts` — live `nudge_queue` re-engagement nudges.
  - `PracticeInteractiveLayer` (temple sensorial room) and `AdminActivityFeed` (ops
    live tail).

  ---

  # PART 6 — THE DATABASE

  ## 6.1 Migration history narrative (173 migrations)

  `supabase/migrations/` runs from `20260307160609_*` (March 2026) through
  `20260712042158_*` (July 2026). Reading them in order tells the product's story:

  1. **March 2026 — the simple app:** `profiles`, the "core loop" migration
    (`daily_themes`, `sessions`, `session_messages`, `observation_tasks`, `daily_tasks`,
    `journal_entries`, `evening_reflections`), plus `user_consciousness_profile`.
  2. **Early April — the engine layer:** loops (`user_loops`, `user_samskaras`,
    `regression_events`), consciousness engine tables (`consciousness_signals`,
    `daily_engine_plans`, `engine_signals`), memory (`guru_memory`,
    `memory_patterns`, `user_memory_vectors`), enterprise core (organizations, teams,
    wellness challenges), billing (`user_credits`, `credit_transactions`, `ai_usage_log`).
  3. **Early April — the Temple mythos:** the self-contained
    `20260405000000_temple_schema.sql` (12 tables + 2 views), witness sessions,
    personalized programs, user journeys.
  4. **April–May — living themes, assessments, spiritual DNA, karma/XP:** theme arcs,
    assessment engine, `user_spiritual_dna`, `karma_events`/`user_karma`, wearables,
    the workplace-watcher signal layer.
  5. **May–July — constellation & gamification:** `user_practice_constellation` (+history),
    `practice_level_events`, `v_level_history`, recalibration events, `session_spine`,
    foundation/pre-journey tables, nudge queues, pair invites.

  Many tables are re-declared `IF NOT EXISTS` across files as the schema iterated — some
  names exist twice with drift later reconciled at the application layer (e.g. two
  overlapping `user_text_reads` definitions; `practice_sessions_v2` vs `practice_runs`).

  ## 6.2 Domain-by-domain schema

  ### Auth / Profile
  - **`profiles`** — `id`, `user_id → auth.users` (UNIQUE, CASCADE), `display_name`,
    `avatar_url`, `bio`, plus later `onboarded`. World-readable SELECT (community/
    leaderboards); owner-only INSERT/UPDATE. `handle_new_user()` trigger seeds from OAuth
    metadata; `update_updated_at_column()` reused by nearly every table.
  - **`user_roles`** — role rows (`admin`, `enterprise_admin`, …) consumed by the
    `has_role()` SECURITY DEFINER function, avoiding recursive-RLS.
  - **`user_consciousness_profile`** — the core personalization record:
    `overall_band`, `streak_current`, `journey_day`, `assessment_data` jsonb
    (`assigned_guru_id`, `archetype_hint`, …). The row `AppEntry`/`Home` bootstrap from.
  - **`user_psyche_profile`**, **`user_life_stage`**, **`app_relationship_depth`**,
    **`retention_signals`** (new/casual/committed/lapsing), **`feature_flags`**,
    **`data_export_requests`**, audit tables (`admin_activity_log`,
    `impersonation_logs`, `security_audit_log`).

  ### Sessions / Guide
  - **`sessions`** — unified: `user_id`, `session_date`, `time_slot`
    (morning|midday|evening|night), `type` (guide|generative|…), `status`
    (active|completed), `theme_id → daily_themes`, `started_at/ended_at`, `summary`
    (JSON — session-shell rehydrates plans from here).
  - **`session_messages`** — chat transcript; relational RLS via EXISTS-join to
    `sessions` (no direct `user_id` column).
  - **`session_spine`** — the v3 durable record: archetype, reason, lead master, council
    voices, primary/secondary loop ids, primary dimension, chakra focus, `why_for_you`
    array, `graph_edges`, `composed_signals`, `quality_score`, `final_user_sentence`.
  - **`session_adaptations`** — every session-adapter decision (original vs adapted
    master/mode/practice + reasons + raw signals).
  - `chat_sessions`/`chat_messages`/`guide_messages` — legacy chat-history tables from
    earlier Guide iterations.
  - **`session_program_enrollments`**, **`session_program_progress`**,
    **`scheduled_sessions`**, **`daily_sessions`**, **`adaptive_days`**, **`day_chains`**,
    **`day_feedback`**, `session_ingredients` — scheduling/adaptive-day planning.

  ### Journal / Memory
  - **`journal_entries`** (`session_id` nullable FK, `title`, `content`, `mood`, `tags`),
    full CRUD RLS including DELETE.
  - **`evening_reflections`** — one per `(user_id, reflection_date)`: mood, energy,
    gratitudes, highlights/challenges/lessons.
  - **`sacred_moments`** — moment_type (breakthrough|realization|tear|laugh|vow|gratitude|
    grief|first_vulnerability|milestone|life_event|other), title, user_words,
    emotional_tone, importance, occurred_at, source, metadata. → Memory Vault.
  - **`guru_memory`** — AI-distilled, importance-scored, layer-classified, decaying
    memories (§3.9.1).
  - **`memory_patterns`** — cross-session recurring themes (frequency, dimension,
    linked_loops, emotional_trend, significance).
  - **`user_memory_vectors`** — pgvector embeddings with source_type/source_id/tags/
    loop_ids; queried by `match_user_memories` / `count_loop_occurrences` RPCs.
  - **`daily_memory_synthesis`** — nightly rollups (+ `ai_callback_log` enforcing the
    1-in-5 felt-continuity rule).
  - **`inside_jokes`**, **`future_self_whispers`**, **`higher_self_letters`**,
    **`dream_entries`**, **`legacy_vault`/`legacy_guardians`/`life_events`** — narrative
    memory features (§3.9.5).

  ### Loops
  - **`user_loops`** (personal instances of catalog loops), **`user_samskaras`**,
    **`regression_events`**, **`active_loops`**, **`loop_attributions`** (evidence-based,
    6-hour dedupe windows), `cross_pollination_log`.

  ### Consciousness engine
  - **`consciousness_signals`** (raw ingestion), **`daily_engine_plans`** (computed
    plan: theme, guru, practice — what `useThemeOfDay()` reads),
    **`engine_signals`**/`engine_logs`/`fused_signals` (aggregation pipeline),
    **`three_brain_inferences`**, **`predictive_signals`**, **`churn_predictions`**,
    **`anomalies`**, **`pattern_insights`**, **`spiral_phase_predictions`**,
    **`theme_evolution_log`** + arc tables (`theme_arcs`, `arc_templates`, `arc_chapters`,
    `arc_echoes`, `arc_pair_invites`), **`fractal_patterns`**, **`curiosity_queue`**/
    `curiosity_cooldowns`, **`life_domain_scores`**/`dimension_map_scores`/
    `dimension_scores`/`human_map_dimensions` (the Human Map), **`user_daily_gates`**,
    **`daily_sankalpa`**, **`journey_harvest`**, **`companion_mood`**,
    **`user_speed_profile`**/`speed_profile_history`, **`bio_signals`**,
    **`device_signals`**, **`work_signals`**, **`workplace_loop_logs`,
    **`meeting_nudges`**, **`signal_consents`**, **`wearable_tokens`**.

  ### Constellation / practice levels
  - **`user_practice_constellation`** — one row, many `${practice}_level` columns (read
    dynamically by the cinematic picker and `getUserContext()`),
    **`user_practice_constellation_history`** (append-only), **`practice_level_events`**,
    **`v_level_history`** (view), **`practice_effectiveness`**, `practice_sessions_v2`,
    `practice_runs`, `practice_history`, `practice_insights`, `practice_teachings`.

  ### Spiritual DNA / assessments
  - **`user_spiritual_dna`** + **`spiritual_dna`** + **`spiritual_dna_assessments`** +
    **`spiritual_dna_confidence`**; **`assessment_definitions`** +
    **`user_assessment_results`** (generic assessment engine behind
    `/app/library/:slug`); **`user_kundli**`; `geo_practice_anchors`.

  ### Temple
  The single-file temple migration: **`temple_journeys`** (100-day journey with master,
  streak, engagement, sentiment, struggles/strengths), **`temple_programs`**,
  **`temple_journal`** (encrypted flag + encrypted_data for future E2E), 
  **`user_text_reads`/`user_text_bookmarks`/`user_text_annotations`** (sacred-text
  reading), **`temple_guidance`** (guidance log with `is_crisis`), 
  **`temple_presences`** (active/elder/future masters "witnessing"), 
  **`temple_calendar_events`** (full-moon/new-moon/milestone/observance/sangha),
  **`temple_downloads`** (offline packs), **`temple_mastery`** (novice→teacher tiers),
  **`temple_user_state`** (first-entry, tradition preference, reduced motion) + views
  `temple_weekly_review`, `temple_active_journeys`; plus witness_sessions,
  personalized_programs, user_journeys, practice_journal, user_programs.

  ### Community / Witness
  **`witness_circles`** + members, **`collective_meditations`** + participants,
  **`community_observations`** + reactions, **`journey_groups`** + members,
  **`peer_circles`** + members + messages (enterprise), `witness_distraction_logs`.

  ### Enterprise
  **`organizations`**, **`teams`**, **`org_members`**, **`org_invites`**,
  **`org_activity_log`**, **`enterprise_notifications`**, **`wellness_challenges`** +
  participants, **`mood_pulses`** (anonymized), **`manager_coaching_notes`**,
  **`org_quarterly_reports`**, **`org_consciousness_snapshots`**, **`org_programs`** +
  participants, **`org_members_directory`** view with explicit grant.

  ### Billing
  **`user_credits`** (paise), **`credit_transactions`**, **`ai_usage_log`**,
  **`ai_cost_logs**, Razorpay flows (§5.6).

  ### Admin / ops
  **`prompt_versions`/`prompt_evals`/`training_examples`** (prompt A/B harness),
  **`rate_limits`**, **`broadcasts`**, **`notification_logs`**, **`push_subscriptions`**,
  **`offline_sync_queue`**, **`waitlist_emails`**, **`sales_inquiries`**, founder
  auto-grant trigger.

  ### Karma / gamification
  **`karma_events`**, **`user_karma`**, **`karma_verification_log`**, 
  **`xp_transactions`**, `nudge_queue`.

  ## 6.3 Row-Level Security patterns

  Four patterns cover the whole schema:

  1. **Owner isolation (the default)** — virtually every user-owned table:
    ```sql
    ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users view own X"   ON <t> FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users insert own X" ON <t> FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users update own X" ON <t> FOR UPDATE USING (auth.uid() = user_id);
    ```
    (Deletes added selectively — journal, bookmarks, downloads.)
  2. **Relational RLS** — child tables lacking `user_id` (e.g. `session_messages`) use
    `EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_messages.session_id AND
    s.user_id = auth.uid())`.
  3. **Globally-readable reference content** — `profiles` SELECT, `daily_themes`,
    `assessment_definitions` (content, not user data).
  4. **Role-gated cross-user visibility** — admin via `has_role(auth.uid(),'admin')`
    (SECURITY DEFINER to avoid recursion); enterprise manager views via
    org-membership EXISTS predicates (`role IN ('admin','manager')`); one
    view+grant (`org_members_directory`).

  ## 6.4 ER-style relationship summary

  ```text
  auth.users (Supabase managed)
    └─1:1─ profiles, user_consciousness_profile, user_psyche_profile,
    │       user_spiritual_dna, temple_mastery, temple_user_state, user_credits,
    │       user_practice_constellation
    └─1:N─ sessions ──1:N── session_messages
    │        ├──── journal_entries (session_id nullable FK)
    │        └──── session_spine (v3: one per composed generative session)
    └─1:N─ journal_entries, evening_reflections, observation_tasks, daily_tasks
    └─1:N─ user_loops, active_loops, regression_events, loop_attributions
    └─1:N─ temple_journeys ──(master_id)── [static master catalog in src/lib]
    └─1:N─ temple_journal, temple_presences, temple_calendar_events, temple_downloads
    └─1:N─ credit_transactions ──aggregates──> user_credits.balance_paise
    └─1:N─ karma_events / xp_transactions
    └─1:N─ notifications, nudge_queue
    └─1:N─ guru_memory, user_memory_vectors, sacred_moments, dream_entries,
    │        daily_memory_synthesis, memory_patterns, future_self_whispers
    └─N:M─ org_members ──> organizations ──1:N── teams, org_invites,
    │        wellness_challenges, org_programs, org_consciousness_snapshots
    └─N:M─ witness_circle_members ──> witness_circles
    └─N:M─ journey_group_members ──> journey_groups
  daily_themes ──1:N── sessions (theme_id)
  arc_templates ──1:N── theme_arcs ──1:N── arc_chapters, arc_echoes
  assessment_definitions ──1:N── user_assessment_results
  sessions ──1:N── session_adaptations (per adaptation decision)
  session_spine ──(quality_score)── feeds compose-session-v3 adaptive history
  ```

  ---

  <!-- ===CONTINUE=== -->
