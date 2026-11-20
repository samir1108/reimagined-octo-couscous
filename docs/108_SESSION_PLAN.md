# 108-Session Plan — Whole-App User-Story Audit & Build

Status: v1 · Created 2026-11-18 · Owner: Product + Engineering
Inputs: `AUDIT.md`, `TECHNICAL_AUDIT_MASTER.md`, `AUDIT_1000_THINGS.md`, `docs/WORLD_CLASS_ROADMAP.md`,
`docs/QUALITY_BASELINE.md`, `src/App.tsx` (149 routes), `supabase/functions` (130+ functions),
`supabase/migrations` (206 files).

## What this plan is

108 work sessions. One session = 90–120 minutes, one surface or one cross-cutting concern,
one written verdict, one merged change (or one explicit "ship as-is" decision).

Structure: **9 phases × 12 sessions**.

| Phase | Sessions | Theme |
|---|---|---|
| 0 | 01–12 | Foundations & audit harness |
| 1 | 13–24 | Landing, showroom, public content |
| 2 | 25–36 | Auth, onboarding, personalization |
| 3 | 37–48 | Daily core loop |
| 4 | 49–60 | Guide, AI engines, safety |
| 5 | 61–72 | Content, library, games, progress |
| 6 | 73–84 | Integrations & enterprise |
| 7 | 85–96 | Admin & ops |
| 8 | 97–108 | Platform, mobile, release |

Every session follows the same ritual, below. Sessions are ordered by dependency, not by
importance: a later session may pull a P0 forward, but it must first land the harness that proves it.

---

## The session ritual

1. **Read (10 min).** Open the route(s)/file(s) in scope. Read the user story as a user, not a dev.
2. **Reproduce (15 min).** Click the flow at 390 px and 1440 px. Log every defect with a screenshot.
3. **Classify (5 min).** Every defect gets `P0` (blocks value/trust) · `P1` (breaks a story) ·
   `P2` (degrades quality) · `P3` (polish). No defect is "note for later" — it enters the ledger.
4. **Fix or decide (45–60 min).** Smallest correct change. No new `any`. No new dependency without
   a check that the repo does not already have one.
5. **Prove (10 min).** `npm run check` + the session's own exit gate. Screenshot before/after.
6. **Record (5 min).** Append to the session log: verdict, evidence, ledger deltas, follow-ups.

### Definition of Done (every session)

- [ ] Typecheck: no new errors (`npm run typecheck`).
- [ ] Lint: 0 errors (`npm run lint`).
- [ ] Unit/e2e tests for the changed surface exist or were extended.
- [ ] Verified at 390 px, 768 px, 1440 px; keyboard-only path works.
- [ ] Loading, empty, error, and offline states exist for every data surface touched.
- [ ] Copy is reviewed for the product's voice (no clinical claims, no shame mechanics).
- [ ] Event(s) fired for the story's key action, via `track()`.
- [ ] Session log row written, ledger updated, exit gate met.

### Severity / issue ledger

| Level | Meaning | SLA |
|---|---|---|
| P0 | Blocks activation, payments, safety, or data integrity | Fix inside the session |
| P1 | Story cannot be completed or silently loses data | Fix inside the phase |
| P2 | Story works but is confusing, slow, or ugly | Schedule in the next phase |
| P3 | Polish | Batch into a polish session |

---

## Phase 0 — Foundations & audit harness (01–12)

No product change ships without a way to see it. This phase builds the instruments.

| # | Session | User stories / routes | Scope | Exit gate |
|---|---|---|---|---|
| 01 | Route & surface inventory | "I can reach every part of the product" | `src/App.tsx` (149 routes), `src/pages/**` | Every route mapped to a phase and a story ID; duplicate/orphan routes listed |
| 02 | Quality gate truth | n/a (engineering) | `package.json`, `scripts/typecheck-ratchet.mjs`, `config/typecheck-baseline.json` | `npm run check` runs green from a clean clone; baseline count recorded |
| 03 | Test harness | n/a | `vitest.config.ts`, `src/test`, `tests/**` | 10 unit tests on pure libs (vLevel, localDate, safety copy); coverage reported |
| 04 | Visual regression harness | "The app looks the same after a change" | `playwright.config.ts`, `tests/visual` | 12 critical routes × 3 widths snapshotting deterministically in CI |
| 05 | Design system audit | "Everything feels like one app" | `src/design-system`, `tailwind.config.ts`, `components.json` | Token/spacing/typography gaps listed; hardcoded colors counted |
| 06 | Accessibility harness | "I can use this without a mouse or with a screen reader" | axe-core, focus order, `prefers-reduced-motion` | axe run on 12 routes; P0/P1 a11y ledger opened |
| 07 | Performance budget | "It opens fast on a mid Android" | `vite.config.ts`, route chunks, `public/` | Budgets set: landing LCP <2.5s p75, route JS <200KB gz, total deploy <60MB |
| 08 | Observability & event taxonomy | "We can see what users do" | `src/lib/observability` | Funnel events named and typed end-to-end; error sink adapter interface ready |
| 09 | Security baseline | "My data is mine" | CSP/Permissions-Policy in `vercel.json`, `.env*`, RLS across migrations | Secrets scan clean; every table's RLS policy listed as allow/deny/unknown |
| 10 | i18n harness | "The app speaks my language" | `src/locales`, `LanguageContext`, `translate-ui` | Real language coverage measured vs the 60+ claim; missing-key detector in CI |
| 11 | Data & engine map | "The numbers I see are real" | `supabase/functions/**`, `src/supabase/_shared` vs `supabase/functions/_shared` | Divergence list; decision recorded: delete browser copies or port contracts |
| 12 | Audit ledger & scorecard | n/a | `AUDIT.md`, `TECHNICAL_AUDIT_MASTER.md` | One issue register (ID, severity, surface, owner, evidence); baseline scorecard published |

---

## Phase 1 — Landing, showroom, public content (13–24)

| # | Session | User stories / routes | Scope | Exit gate |
|---|---|---|---|---|
| 13 | Landing above the fold | "In 5 seconds I know what this is and what to do" | `/` `src/pages/Index.tsx` | One primary CTA; LCP element identified and budgeted; no layout shift |
| 14 | Landing narrative sections | "I understand how it works before signing up" | `/` sections, `THE_FIRST_ELEVEN_v2.md`, `HOMEV3_SPEC.md` | Story arc: problem → method → proof → CTA; copy reviewed |
| 15 | Landing orb | "The orb is alive and I can start a session" | `src/components/orb`, `GlobalPresenceOrb`, `OversoulOrb` | R3F canvas isolated behind DOM control (per `AGENTS.md`); static fallback on low-end/reduced-motion |
| 16 | Landing conversion instrumentation | "We know where people drop" | `track()` call sites, hero CTA | Events: view → cta_click → signup_start → signup_complete; dashboard reads them |
| 17 | Landing SEO & sharing | "It looks right when shared" | `index.html`, `scripts/seo/*`, OG image | Canonical uses runtime origin; OG/Twitter cards render; JSON-LD valid |
| 18 | `/launch` and `/hope-preview` | "The preview matches the product" | `HopeLanding`, `Launch` | Parity diff written; retire or redirect one; no orphan entry points |
| 19 | `/app-intro` scroll tour | "I get a guided tour of the app" | `src/pages/AppIntro.tsx` | Tour completes on mobile + desktop; skip works; no scroll traps |
| 20 | `/experience` hub | "I can browse the whole method" | `pages/showroom/Showroom.tsx`, `ExperienceIntro` | Every card routes correctly; catalog counts match data |
| 21 | Showroom day flow | "I can open a program day and run it" | `ShowroomProgram`, `ShowroomDay`, `ShowroomDaySession` | Regression test for the 16 hook-order violations; all three routes render with 0 sessions and with N |
| 22 | Handbooks & dictionary | "Terms are explained where I meet them" | `/handbook`, `/showroom/handbooks/:slug`, `/dictionary` redirect | Redirect correct; deep links work; handbook search works |
| 23 | Signature pages | "The brand has a world" | `/temple`, `/bience`, `/inner-llms`, `/journey` | Each page has a job, a CTA, and a measured load budget |
| 24 | Public content & SEO corpus | "I find this through search" | `/blog`, `/knowledge*`, `/loops*`, sitemap | Static SEO generation covers all published docs; no 404 links; sitemap fresh |

---

## Phase 2 — Auth, onboarding, personalization (25–36)

| # | Session | User stories / routes | Scope | Exit gate |
|---|---|---|---|---|
| 25 | `/auth` complete | "I can sign up, log in, recover" | `pages/Auth.tsx`, Supabase auth | Email + OAuth + reset + magic link; errors are human; rate-limit state handled |
| 26 | First-run language gate | "The app starts in my language" | `FirstRunLanguageGate`, `LanguageContext` | Gate appears once, persists, and is skippable; locale applied to dates/numbers |
| 27 | `/app/cinematic-journey` | "It learns who I am before asking for work" | `pages/journey/*` | Framing→question→processing→reveal completes with back/refresh safety |
| 28 | Personalization & metrics reveal | "I see myself reflected" | `JourneyPersonalization`, `MetricsReveal`, `types.ts` | Values persist; reveal is skippable; no dead-end state |
| 29 | Pre-journey | "I'm prepared, not dropped in" | `/app/before`, `/app/pre-journey`, `pre-journey-chat` | Chat failure degrades to static guidance; consent captured |
| 30 | First Eleven | "My first eleven sessions are chosen for me" | `/app/first-eleven`, `THE_FIRST_ELEVEN_v2.md` | Sequence loads from data, not hardcoded; resumes at correct step |
| 31 | Awakening journey | "Long-arc onboarding has a shape" | `/app/awakening` | Progress persists; stage transitions explained |
| 32 | Journey picker | "I can choose a path" | `/app/journeys`, `JourneyPickerPage` | Each journey previews cost/time/outcome; selection stored |
| 33 | Gates | "I know what unlocks next and why" | `/app/gates` | Gate reasons are explicit; no dead ends; back navigation works |
| 34 | Spiral | "My progress is visible as a whole" | `/app/spiral`, `SpiralPage` | Renders with 0/1/100 sessions; performance budget met |
| 35 | Onboarding funnel instrumentation | "We can see first-value time" | Events across 25–34 | Funnel: land → auth → language → journey → first session, with timestamps |
| 36 | Activation target | "First value in under 90 seconds" | Home + onboarding order | Experiment shipped or explicitly rejected with data; artifact produced by first session |

---

## Phase 3 — Daily core loop (37–48)

| # | Session | User stories / routes | Scope | Exit gate |
|---|---|---|---|---|
| 37 | Today home | "I open the app and know how I am and what to do" | `/app` `Home.tsx` | Answers how-am-I / what-now / what-changed; one primary CTA |
| 38 | Home consolidation | "There is one home" | `Home`, `HomeV2`, `HomeV3`, `HomeV4`, `Home_old`, `Home_780ab26` | One canonical component; others deleted or archived; no duplicate imports |
| 39 | Practice catalog | "I can find a practice that fits my day" | `/app/practices`, `/app/practice`, `Practices.tsx` vs `PracticesPage` | One catalog; filters/sorting work; 3/10/20-minute options |
| 40 | Orb practice | "The session visual responds to me" | `/app/practice/orb`, `OrbPractice`, `GlobalPresenceOrb` | Activation lives in surrounding DOM control; keyboard equivalent; fallback static |
| 41 | Session runner | "A session runs start to finish" | `/app/session/:sessionId`, `GenerativeSession` | Resume after refresh; mid-session exit is safe; artifact on completion |
| 42 | Session widgets | "Sessions contain the right instruments" | `/app/widgets`, `SessionWidgets` | Every widget has empty/loading/error; no unbounded renders |
| 43 | Journal | "I can write and it comes back to me" | `/app/journal`, `journal-reflect` | Autosave; offline write survives; reflection failure is non-blocking |
| 44 | Arcs & observer | "I run structured arcs, not random sessions" | `/app/arcs`, `/app/arcs/:arcId`, `/app/observer`, `ArcsPage`, `ArcRunPage` | Arc state machine tested; completion recorded |
| 45 | Habit mechanics | "I come back tomorrow" | Streaks, notifications, `localDate.ts`, quiet hours | Streak repair exists; timezone proven; no shame copy; notifications respect quiet hours |
| 46 | Progress & analytics | "I can see change over time" | `/app/analytics`, `Analytics.tsx` | Charts render at empty/1/1000 points; no misleading aggregation |
| 47 | Life plan & review | "I set direction and review it" | `/app/plan`, `/app/review`, `LifePlanPage`, `ContentReviewPage` | Plan persists; review surfaces deltas, not scores |
| 48 | Settings & data control | "I control my account and data" | `/app/settings`, `/app/credits` | Theme/sound/privacy/export/delete all work; destructive actions confirmed |

---

## Phase 4 — Guide, AI engines, safety (49–60)

| # | Session | User stories / routes | Scope | Exit gate |
|---|---|---|---|---|
| 49 | Guide chat | "I can talk to a guide that knows me" | `/app/guide`, `guide-chat`, `Guide.tsx` | Streaming, cancel, retry, empty, quota states; history persists |
| 50 | Voice guide | "I can speak instead of typing" | `/app/guide/voice`, `stt-listen`, `tts-speak`, ElevenLabs/Deepgram | Mic permission flow with graceful denial; barge-in works; cost logged |
| 51 | Master voices | "I can choose a teacher's voice" | `/app/masters`, `Masters.tsx`, voice prompts | 60+ voices load from data; preview works; no cultural misrepresentation |
| 52 | Council | "I can see a decision from several perspectives" | `/app/council`, `council-consensus` | Multi-perspective output is attributed; failure degrades to single voice |
| 53 | Dharma oracle | "My choice gets a considered answer" | `/app/dharma-oracle` | Input validation; disclaimers; deterministic fallback |
| 54 | Kosha scanner | "I get a structured self-reading" | `/app/kosha-scanner`, `kosha-scanner` fn | Result is explainable; save/share; re-run bounded |
| 55 | Mirror sessions | "I can see my loops" | `/app/mirror`, `mirror-session`, `TheMirrorPage` | Loop detection explained; user can accept/reject a loop; stored |
| 56 | Self-model | "The app's model of me is inspectable" | `/app/self-model`, `HumanModelPage`, `compute-consciousness-fingerprint` | Every inferred trait is editable with provenance |
| 57 | Crisis safety | "If I'm in danger, I get help" | `EmergencySanctuary`, region resources, safety copy | Region detection covers IN/US/GB/CA/AU/EU + global; copy clinically reviewed; tested |
| 58 | Cost & latency | "AI answers fast and cheaply" | `compose-session*`, `consciousness-engine` | p95 latency and cost/session measured; hard caps and fallbacks in place |
| 59 | AI contracts | "Bad model output cannot break the UI" | zod schemas around all AI responses | Every AI response validated; retries/timeouts bounded; no unhandled stream errors |
| 60 | Engine parity | "Browser and server compute the same thing" | `src/supabase/_shared` vs `supabase/functions/_shared` | Parity confirmed or browser copies deleted; orchestrator type errors reduced |

---

## Phase 5 — Content, library, games, progress (61–72)

| # | Session | User stories / routes | Scope | Exit gate |
|---|---|---|---|---|
| 61 | Library | "I can browse and open any item" | `/app/library`, `/app/library/item/:id` | Search, filter, sort, deep link, back state |
| 62 | Explore library | "I can explore by theme" | `/app/library/explore`, `ExploreCategory` | Category counts correct; empty category handled |
| 63 | Explore consolidation | "Explore means one thing" | `/app/explore`, `Explore.tsx`, `ExploreLibrary` | Duplicate resolved; one entry point; redirects preserved |
| 64 | Assessments | "I take a test and get a real result" | `/app/library/:slug`, `AssessmentRunner`, `AssessmentResult` | Resume, scoring explanation, shareable result |
| 65 | Memory vault | "What I told the app comes back" | `/app/memory`, `MemoryVault`, `recall-memory`, `build-long-term-memory` | Recall is attributable; user can delete a memory |
| 66 | Life & legacy | "I think beyond the week" | `/app/life-legacy`, `LifeAndLegacy` | Saves; exports; no dead ends |
| 67 | Programs | "I can start and finish a program" | `/app/programs`, `/app/programs/:slug` | Day locking, resume, completion artifact |
| 68 | Programs v3 | "One programs experience" | `/app/programs-v3`, `ProgramsV3`, `docs/PROGRAMS_ROADMAP.md` | Merge or retire; no duplicated nav entries |
| 69 | Frameworks | "I can practice a named framework" | `/app/frameworks`, `FrameworkSession` | Framework data-driven; session completes |
| 70 | Practices & experiments | "I can test what works for me" | `/app/practices`, `/app/experiments`, `manage-experiment` | Experiment lifecycle: hypothesis → run → result |
| 71 | Games | "Practice can feel like play" | `/app/games`, `/app/games/:gameId`, `/app/games-insights`, `audit_games.json` | Every game reachable, completes, scores; insights correct |
| 72 | Constellation | "I see my inner system as a whole" | `/app/constellation`, `/app/constellation/evolution`, `compute-constellation` | Renders at all sizes; evolution explains changes |

---

## Phase 6 — Integrations & enterprise (73–84)

| # | Session | User stories / routes | Scope | Exit gate |
|---|---|---|---|---|
| 73 | Signal consent | "I choose what the app senses" | `/app/integrations`, `SignalConsentCenter`, `SentientDashboard` | Per-signal consent, revocation, audit trail |
| 74 | Enterprise entry | "An org can start with us" | `/enterprise/auth`, `/create`, `/contact`, `/privacy` | Each path ends in a real next step; no dead forms |
| 75 | Enterprise dashboard & reports | "Leadership sees adoption, not private content" | `/enterprise`, `/enterprise/reports` | Aggregate-only data proven; export works |
| 76 | Employees & portal | "An employee has a private space" | `/enterprise/employees*`, `/enterprise/portal` | Employee data isolation verified with two accounts |
| 77 | Teams, managers, people | "Managers get the right view" | `/enterprise/teams`, `/managers`, `/people` | Role-based visibility proven; no cross-team leakage |
| 78 | Invite, settings, roles | "Access is controlled" | `/enterprise/invite`, `/enterprise/settings` | Invite expiry/revocation; role matrix documented and tested |
| 79 | Challenges & coaching | "Teams can grow together" | `/enterprise/challenges`, `/enterprise/coaching`, `manager-coaching` | Challenge lifecycle; coaching never exposes private sessions |
| 80 | Org mirror, board, circles | "The org can see itself" | `/enterprise/org-mirror`, `/board`, `/circles` | Minimum-cohort suppression; no re-identification |
| 81 | Program designer | "An org can design its own program" | `/enterprise/programs`, `org-program-designer` | Draft → publish → assign works; validation |
| 82 | Enterprise intelligence | "Insights are useful and safe" | `enterprise-insights`, `enterprise-people-intelligence`, `org-weekly-briefing` | Insight provenance; no individual attribution below threshold |
| 83 | Enterprise privacy | "Compliance is real, not a page" | `/enterprise/privacy`, data retention, export/delete | Retention policy enforced; DSAR export/delete works |
| 84 | Admin ↔ enterprise bridge | "Ops can support an org" | `/admin/enterprise` | Support actions audited; least privilege |

---

## Phase 7 — Admin & ops (85–96)

| # | Session | User stories / routes | Scope | Exit gate |
|---|---|---|---|---|
| 85 | Admin dashboard | "I know the state of the system in 10 seconds" | `/admin` | Real data; no placeholders; refresh safe |
| 86 | Users | "I can support a user without breaking privacy" | `/admin/users`, `/admin/users/:userId` | Search, pagination, least-privilege detail, audited access |
| 87 | Sessions | "I can inspect a session that failed" | `/admin/sessions` | Filters, trace, no raw private content by default |
| 88 | Health | "I know what is down" | `/admin/health`, `orchestrator-health` | Dependency status real; alert thresholds |
| 89 | Activity & copilot | "I can see what happened and ask why" | `/admin/activity`, `/admin/copilot`, `admin-copilot` | Feed is append-only; copilot cannot mutate without confirmation |
| 90 | Analytics & BI | "Metrics are trustworthy" | `/admin/analytics`, `/admin/bi` | Definitions documented; numbers match source tables |
| 91 | Costs | "We know unit economics" | `/admin/costs`, `razorpay-*` | Cost per session/user/org computed; anomaly visible |
| 92 | Waitlist | "Growth ops works" | `/admin/waitlist` | Import/export; dedupe; status transitions |
| 93 | Training | "We can improve prompts safely" | `/admin/training` | Versioning; rollback; eval set |
| 94 | Power tools | "Dangerous actions are guarded" | `/admin/power` | Confirmation + audit + dry-run for every destructive action |
| 95 | Predictive | "Churn and risk are actionable" | `/admin/predictive`, `predict-churn` | Explainable score; no automatic punitive action |
| 96 | SEO admin & ops dashboard | "Search and uptime are managed" | `/admin/seo`, `/app/ops`, `OpsDashboard` | Index coverage; sitemap health; incident runbook linked |

---

## Phase 8 — Platform, mobile, release (97–108)

| # | Session | User stories / routes | Scope | Exit gate |
|---|---|---|---|---|
| 97 | PWA | "I can install and reopen fast" | `manifest`, `vite-plugin-pwa`, `InstallPWA` | Install works on Android/iOS Safari; update flow is explicit |
| 98 | Offline & cache | "It works on a bad train" | `queryPersister`, IndexedDB, service worker | Offline read of last sessions; writes queue; no cross-account leakage |
| 99 | Mobile shells | "It feels native enough" | `android/`, `ios/`, `capacitor.config.ts`, `capacitor-health` | Builds run; permissions correct; safe areas respected |
| 100 | Performance | "Every route is fast" | Route chunks, media, fonts | Route budgets met; no route >300KB gz; images optimized |
| 101 | Accessibility | "Everyone can use it" | Focus, contrast, targets, orb alternative | axe: 0 P0/P1 on 20 routes; 44px targets; full keyboard path |
| 102 | Language breadth | "60+ languages is a fact, not a claim" | `src/locales`, `translate-ui`, RTL | Coverage table published; top 10 languages complete; RTL verified |
| 103 | Security & privacy | "Trust is earned" | RLS sweep, CSP, secrets, DSAR | Every table has a policy and a test; secrets rotated; CSP tight |
| 104 | Data integrity | "Migrations are reproducible" | `supabase/migrations` (206), `emit-mirror-migrations`, generated types | Fresh DB builds from migrations; drift check green; backups verified |
| 105 | Observability end-to-end | "We see failures before users report them" | error sink, `track()`, funnel | Crash-free sessions >99.5%; funnel readable end-to-end |
| 106 | E2E regression suite | "We can ship on Friday" | Playwright, 20 critical journeys | Suite green in CI in <10 min; flake rate <2% |
| 107 | Store & release | "We can ship to stores" | `dist`, assets, privacy labels, review notes | Submission checklist complete; rollback plan written |
| 108 | Launch gate & re-baseline | "We know if this worked" | All KPIs, ledger, roadmap | KPI dashboard live; ledger burned to zero P0/P1; next 108 planned |

---

## Traceability — every route group has a home

| Route group | Routes | Sessions |
|---|---|---|
| Public landing | `/`, `/launch`, `/hope-preview` | 13–18 |
| Tour & showroom | `/app-intro`, `/experience/*`, `/showroom/*` | 19–23 |
| Public content | `/blog*`, `/knowledge*`, `/loops*`, `/handbook`, `/temple`, `/bience`, `/inner-llms`, `/journey` | 17, 22–24 |
| Auth | `/auth`, `/enterprise/auth` | 25, 74 |
| Onboarding | `/app/cinematic-journey`, `/app/before`, `/pre-journey`, `/first-eleven`, `/awakening`, `/journeys`, `/gates`, `/spiral` | 26–36 |
| Core loop | `/app`, `/app/practice*`, `/app/session/*`, `/app/widgets`, `/app/journal`, `/app/arcs*`, `/app/observer`, `/app/analytics`, `/app/plan`, `/app/review`, `/app/settings`, `/app/credits` | 37–48 |
| Guide & AI | `/app/guide*`, `/app/masters`, `/app/council`, `/app/dharma-oracle`, `/app/kosha-scanner`, `/app/mirror`, `/app/self-model` | 49–60 |
| Content surfaces | `/app/library*`, `/app/explore`, `/app/memory`, `/app/life-legacy`, `/app/programs*`, `/app/frameworks*`, `/app/practices`, `/app/experiments`, `/app/games*`, `/app/constellation*` | 61–72 |
| Integrations | `/app/integrations`, `/app/sentient` | 73 |
| Enterprise | `/enterprise/**` (19 routes) | 74–84 |
| Admin | `/admin/**` (17 routes) + `/app/ops` | 85–96 |
| Platform | all routes, system-level | 97–108 |

---

## KPIs the plan is judged on

| Funnel stage | Metric | Target |
|---|---|---|
| Activation | First session completed <24h | >60% |
| Time to value | Land → first artifact | <90s |
| Habit | Sessions / week | 3–5 |
| Quality | Session completion | >70% |
| Retention | D1 / D7 / D30 | 60 / 40 / 25% |
| Love | NPS | >50 |
| Trust | Crash-free sessions | >99.5% |
| Unit economics | LLM cost / session | <$0.50 |
| Performance | p75 LCP (mid Android) | <2.5s |
| Accessibility | axe P0/P1 on critical routes | 0 |
| Engineering | New type errors / lint errors | 0 / 0 |

---

## Session log template

Copy one row per session into `docs/108_SESSION_LOG.md`.

| # | Date | Verdict | P0 found | P1 found | Fixed | Deferred | Evidence |
|---|---|---|---|---|---|---|---|
| 01 | | ship / fix / block | 0 | 0 | 0 | 0 | link to screenshot/PR |

---

## Anti-goals (keep the plan honest)

- No new feature work before its surface has empty/error/offline states.
- No visual redesign without a measured problem it solves.
- No new dependency when the repo already has the capability.
- No "later" in the ledger — every defect gets a session number.
- No lowering the typecheck baseline to make a gate green.
- No aggregate enterprise insight that can re-identify an individual.
