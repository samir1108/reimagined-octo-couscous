# 6. Feature Inventory — Every Page, Briefly

### Consumer core
- **Home.tsx / Index.tsx** — Landing/entry surfaces introducing the product and routing new vs. returning users.
- **AppEntry.tsx** — App shell/bootstrap entry point wiring providers and routing.
- **Auth.tsx** — Sign-up/sign-in flow.
- **PreJourney.tsx** — Pre-onboarding capture (intent, context) before the main journey begins.
- **AssessmentRunner.tsx / AssessmentResult.tsx** — The initial (and likely periodic) consciousness assessment quiz and its scored results screen, feeding the dimension/V-Level engine.
- **Guide.tsx** — The primary AI chat interface with the user's assigned guide/master, including guest-master summoning (Section 4.5).
- **Practice.tsx** — The main practice hub: surfaces the practice constellation, ladders, and micro-practices for the day.
- **GenerativeSessionPage.tsx** — A dynamically-generated (adaptive) session experience assembled live from the session generator engine.
- **Journal.tsx** — Personal reflective journaling tied to practice/session history.
- **MemoryVault.tsx** — Long-term memory/insight storage — the "memory system" referenced as core IP (Section 7), likely storing significant realizations, breakthroughs, and context the AI recalls across sessions.
- **Constellation.tsx / ConstellationEvolution.tsx** — Visualization of the user's 12-practice constellation (Section 3.6) and how its weights have evolved over time.
- **Council.tsx** — Likely a multi-guide "council" experience where several masters weigh in together (an ensemble variant of the single-guide chat).
- **Masters.tsx** — The public guide/master directory (Section 4), browsing the real-master roster.
- **Library.tsx / Knowledge.tsx / KnowledgeCategory.tsx / KnowledgeEssay.tsx** — A structured knowledge base of essays/categories on consciousness topics.
- **Dictionary.tsx** — A glossary of consciousness/yogic terminology.
- **StageHandbook.tsx** — The user-facing rendering of the band/loop-family "handbook" content (Section 1–2).
- **Loops.tsx / LoopDetail.tsx** — The behavioral loop directory and individual loop deep-dive pages (Section 2).
- **Temple.tsx** — The cinematic world-hub experience (Section 5.3).
- **Explore.tsx** — A general discovery/browse surface across content types.
- **FoundationCourse.tsx** — The fixed-curriculum onboarding course (Section 3.4).
- **ProgramsV3.tsx** — The structured multi-day program catalog/player (Section 3.5).
- **Games.tsx / GameRoute.tsx / GameInsights.tsx** — A gamified practice layer (e.g. `BreathTemple`/`BreathTempleOrb` seen under `src/games/`), with post-play insight reporting.
- **Blog.tsx / BlogPost.tsx** — The public content-marketing blog, partly auto-generated from the loop library (Section 2.5).
- **LifeAndLegacy.tsx** — Likely a longer-horizon reflective feature around life purpose/legacy planning.
- **Credits.tsx** — Attribution/credits page (content sources, texts, contributors).
- **Settings.tsx** — Account/preferences management.
- **Analytics.tsx** — Personal analytics dashboard (progress, streaks, dimension trends) for the end user.
- **NotFound.tsx** — 404 page.

### Experience / live-session suite (`src/pages/experience/*`)
- **ExperienceIntro.tsx** — Entry point framing the guided "Experience" track.
- **ExperiencePaths.tsx / ExperiencePathDetail.tsx** — Browsing and drilling into curated experiential paths.
- **ExperienceObservation.tsx / ExperienceSelfInquiry.tsx / ExperienceNetiNeti.tsx / ExperiencePranayama.tsx** — Guided, explorable walkthroughs of the corresponding ladders (Section 3.1) as standalone learning experiences (distinct from the live-session players).
- **ExperiencePractices.tsx** — Overview/browser of available practices.
- **ExperiencePrerequisites.tsx** — Surfaces prerequisite chains between practices (backed by `src/data/prerequisites.ts`).
- **ExperienceLoopsAtlas.tsx** — A visual "atlas" browsing view over the loop library (backed by `src/data/loopsAtlas.ts`).
- **ExperienceBridges.tsx** — Likely visualizes "bridges" between concepts/practices/traditions (backed by `src/data/bridgesExpanded.ts`).
- **ExperienceLineage.tsx** — Visualizes lineage/tradition trees connecting masters (backed by `src/data/lineageMap.ts` / `lineageTree.ts`).
- **ExperienceGlossary.tsx** — A dedicated glossary experience (backed by `src/data/livingGlossary.ts`).
- **ExperienceWisdom.tsx** — Likely a "wisdom deck"/card-based insight browser (backed by `src/data/wisdomDeck.ts` / `wisdomArc.ts`).
- **ExperienceGames.tsx** — Entry point into the gamified practice layer from within the Experience track.
- **PranayamaLiveSession.tsx / NetiNetiLiveSession.tsx / SelfInquiryLiveSession.tsx / WitnessLiveSession.tsx / MantraLiveSession.tsx / PracticeLiveSession.tsx** — Full cinematic-mode live session players (Section 5.1) for each major practice ladder.

### Showroom (demo/preview surfaces)
- **Showroom.tsx / ShowroomDay.tsx / ShowroomHandbook.tsx / ShowroomProgram.tsx** — A demo/preview environment for showcasing a sample day, handbook, and program without requiring full onboarding — likely used for marketing, sales demos, or investor/partner walkthroughs (backed by `showroomHandbooks.ts`, `showroomPrograms.ts`, `showroomProgramsExtra.ts`).

### Hope (landing variant)
- **HopeLanding.tsx** — A distinct landing page variant, likely an A/B or campaign-specific alternative to `Home.tsx`.

### Admin (internal operations)
- **AdminDashboard.tsx** — Top-level admin overview.
- **AdminUsers.tsx / AdminUserDetail.tsx** — User management and per-user deep-dive (session history, band/dimension trajectory, etc.).
- **AdminSessions.tsx** — Session-level browsing/inspection across all users.
- **AdminAnalytics.tsx / AdminBI.tsx / AdminPredictive.tsx** — Aggregate analytics, business-intelligence reporting, and predictive modeling (e.g. churn, level-up forecasting) dashboards.
- **AdminActivityFeed.tsx** — Real-time/recent activity stream across the platform.
- **AdminHealth.tsx** — System/infrastructure health monitoring.
- **AdminCosts.tsx** — Cost tracking (likely LLM/API spend monitoring given the heavy AI-chat surface area).
- **AdminCopilot.tsx** — An internal AI copilot tool for admins/ops.
- **AdminPowerTools.tsx** — Miscellaneous internal utility tools.
- **AdminSEO.tsx** — SEO management/monitoring dashboard (relevant given the loop-driven blog auto-generation).
- **AdminTraining.tsx** — Likely management of AI training data/prompt tuning.
- **AdminEnterprise.tsx** — Admin-side management of enterprise customers.
- **AdminWaitlist.tsx** — Waitlist management for gated features/launches.

### Enterprise (B2B product line)
- **EnterpriseAuth.tsx / CreateOrganization.tsx** — Org signup/authentication flow.
- **EnterpriseDashboard.tsx** — Top-level org admin overview.
- **EnterpriseEmployees.tsx / EnterprisePeople.tsx / EmployeeDetail.tsx** — Employee roster management and individual employee drill-down.
- **EmployeePortal.tsx** — The employee-facing (non-admin) entry point into the enterprise product.
- **EnterpriseTeams.tsx / EnterpriseManagers.tsx / ManagerCoaching.tsx** — Team structuring and manager-specific coaching tools.
- **EnterpriseInvite.tsx** — Invitation flow for onboarding employees.
- **EnterpriseBoard.tsx** — Likely an executive/board-level rollup view.
- **EnterpriseChallenges.tsx** — Org-wide wellbeing challenges/campaigns.
- **EnterprisePeerCircles.tsx** — Peer support group functionality within an org.
- **EnterpriseOrgMirror.tsx** — An aggregate "mirror" of organizational patterns — very likely surfacing workplace-loop epidemiology (Section 2.4) at the org level.
- **EnterpriseReports.tsx** — Formal reporting exports for org stakeholders.
- **EnterpriseProgramDesigner.tsx** — A tool for org admins to compose custom programs from the practice/program library.
- **EnterprisePrivacy.tsx / EnterpriseSettings.tsx** — Privacy controls and configuration.
- **EnterpriseContact.tsx** — Sales/contact surface for prospective enterprise customers.

---
