# ConsciousOS — Master Documentation Outline (10 Docs)

**Status:** Outline for approval. Each doc targets ~10–12k words (exhaustive depth).
**Folder:** `docs-final/` (clean rewrite reflecting the CURRENT shipped code, not aspirational).
**Source of truth:** Codebase (`src/`, `supabase/functions/`, `src/lib/consciousness/`, blueprint memory files) + existing `docs2/` where still accurate.

---

## 01 — PRODUCT.md  *(What the user experiences)*
The complete product surface, walked top-to-bottom as a real user would meet it.

**Sections**
1. One-line pitch + the "yogic OS" mental model
2. First-run experience — Landing → Mirror Session → Auth → 6-step cinematic onboarding → Spiritual DNA reveal
3. The 4 Daily Gates (Morning / Midday / Evening / Night) — what each gate actually does
4. Home — Slot-aware UI, SlotHeroCard, Master-of-Masters program card, suggestions reasoning
5. Temple — 118 masters, Guru-Shishya chat, Witness practice, Programs catalog, exit flow
6. Guide — "Wise Sibling" persona, continuity engine, evening reflection
7. Journal — interaction model, "Go deeper", history parity with Guide
8. Practice & Programs — micro-practices, observation chains, 80+ ProgramTemplates, 42+ session-based programs
9. Games — sensorial practices, sound-reactive Witness, faculty covers
10. Analytics ("The Mirror") — 11 layers, Consciousness Score (0–1000), dimension trajectories
11. Settings, language, voice, notifications, pause mode
12. Enterprise surface (brief — full doc in 09)
13. Admin Command Center (brief — admin section in 09)
14. Cross-cutting UX laws — Satyayuga UX, no-guilt, navigation (🪔 floating exit)

---

## 02 — ARCHITECTURE.md  *(The shape of the code)*
How the codebase is organized and why each layer exists.

**Sections**
1. Stack — React 18, Vite 5, Tailwind v3, TS 5, ConsciousOS Cloud (Supabase), Capacitor
2. Repo map — `src/pages`, `src/components`, `src/lib`, `src/machines`, `src/hooks`, `src/data`, `supabase/functions`
3. Dual-state architecture — XState (client flow) + TanStack Query (server cache) + IndexedDB persistence
4. State machines — appEntry, dailyCycle, home, session, practice, journal, voice, insights, notifications, settings
5. Routing & navigation — AppEntry guard, suppressed nav in Temple, floating 🪔 exit
6. Database schema — profiles, sessions, session_messages, daily_themes, journal_entries, observation_tasks, daily_tasks, user_consciousness_profile, user_journey_log, user_kundli, consciousness_signals, engine_signals, personalized_programs, arc_intelligence_*, user_roles
7. RLS model — user-scoped policies, `has_role()` security-definer, n≥5 enterprise aggregators
8. Edge functions inventory (~30+) — chat, session-flow, compose-session, evolve-theme, suggest-next-program, embed-memory, recall-memory, synthesize-daily-memory, tts, razorpay-order/verify, weekly-brief, etc.
9. Auth resilience — `useAuthReady`, 6s timeout, INITIAL_SESSION handling
10. Caching strategy — IndexedDB persistence, dateKey invalidation, service workers, PWA manifest
11. Performance — code splitting, lazy routes, image asset pipeline (`.asset.json`)
12. Build & deploy — ConsciousOS build, Capacitor mobile, custom domain readiness
13. File-level conventions — 'S' / 'session' helpers, semantic Tailwind tokens, no raw color classes

---

## 03 — ENGINES.md  *(The brain — the framework)*
Every adaptive engine, what it reads, what it writes, where it lives in code. **This is the doc you said you most need.**

**Sections** (one per engine, ~600–900 words each)
1. **UserStateSnapshot** — the canonical mainspring every engine reads from
2. **Consciousness Engine V2** — V-Levels (0–10, 11 bands), dimension bands, continuous calibration
3. **Practice Engine** — 3-layer Core/Path/Specialty matrix, 9 skills × 5–7 levels, 30/50/20 formula, cross-pollination
4. **Speed Profile Engine** — Fast / Steady / Deep detection, adaptive difficulty
5. **Daily Gates Engine** — 4-gate flow, 6 time-slot patterns, entry context
6. **Living Theme Engine** — one daily theme, evolve-theme edge fn, deepen/hold/close
7. **Session Composer** — `composeSession()`, ingredient picker, time-budget/energy fit
8. **Master Rotation Engine** — guru rotation formula, loop-driven swaps
9. **Lifetime Spiral (10 Phases)** — Day 1 → 10,000+, phase-aware guru assignments
10. **Regression Engine** — 6-step protocol, dark-night support, session credits
11. **Loop Detection Engine** — 400+ library loops, exact-ID mapping, live detection
12. **Long-Term Memory** — vector embeddings, recall, daily synthesis
13. **Curious Engine** — 4-step confidence loop, progressive profiling
14. **Predictive Engine** — burnout risk, dimension trajectories
15. **Three-Brain Engine** — head/heart/gut dominance, V-Level mapping
16. **Cognitive Agent Router** — agent definitions, state vector, edge-case detector, stage engine, insight layer
17. **Generative Session Engine** — sensorial manifests, multimodal (TTS/STT/camera/mic)
18. **Council of Yogis** — multi-master synthesis
19. **Fractal Integration Engine** — micro→macro pattern lift
20. Engine call graph — diagram of which engine calls which

---

## 04 — SESSION-FLOW.md  *(How a session actually runs)*
End-to-end trace of a single session, from gate entry to integration.

**Sections**
1. Session taxonomy — Morning / Midday / Evening / Night / Witness / Master-led / Program-step / Generative
2. The orchestrator — `useSessionFlow` hook + `sessionFlow.ts` prompt builder
3. Morning flow — 9 steps, first-message templates, returning-after-3-days variant, long-streak variant
4. Evening flow — 8 steps, Yoga-Nidra-style closing, gratitude/lessons/tomorrow
5. Night flow — sanctuary rules, no inquiry, sleep-seed
6. Midday micro check-in (planned)
7. System-prompt assembly — context shape (user, theme, morningSession, dayActivity, missedDays)
8. Streaming protocol — STREAM_DELTA events, message persistence, sessionId lifecycle
9. Session structure inside a 30-min block — AI teaching / knowledge / active practice split
10. Sensorial practice manifests — step modalities (narrate, breath, gaze, voice_reply, silence, mantra, reflect_text)
11. Practice Run Controller context — pause/resume, exit flow
12. Session completion → exit screen → consciousness signal write-back
13. How a session feeds back into engines (signals, dimension deltas, plateau detection, theme evolution)
14. Failure modes & resilience — TTS fallback, voice silent failure, mid-session disconnect

---

## 05 — GUIDE-JOURNAL-ANALYTICS.md  *(The reflective loop)*
The three surfaces that turn raw sessions into self-knowledge.

**Sections**
1. **Guide**
   - Persona — Wise Sibling, language mirroring, safety layer
   - System architecture — `guide-chat` edge fn, Kundli context injection
   - Hybrid live loop detection
   - Continuity engine — N-day follow-up, active patterns
   - Evening reflection session (8 steps, adaptive styles)
   - Periodic 3–5 day check-ins
   - Future-Self mode
2. **Journal**
   - Interaction model — manual "Go deeper" after typing pause
   - History parity with Guide (consciousness_signals source)
   - Mood, tags, session linking
   - How entries become embeddings → long-term memory
3. **Analytics — "The Mirror"**
   - 11 layers (V-Level, dimensions, loops, life domains, chitta vritti, streaks, samskaras, witness time, breakthrough markers, regression flags, identity band)
   - Consciousness Score 0–1000 — exact algorithm
   - Dimension trajectory charts
   - Loop occurrence + first/last seen + distinct days
   - Predictive insights — burnout risk, dark night flags
   - Master Journey Review (credit-gated AI report)
4. The reflective loop diagram — session → signals → analytics → next session

---

## 06 — MASTERS-TEMPLE-PROGRAMS.md  *(The content layer)*
The cinematic interior and everything you can do inside it.

**Sections**
1. Temple architecture — top-to-bottom sanctuary, single-master environment, 🪔 exit
2. Master roster — 118 masters across 11 thematic sections, 36 high-fidelity portraits
3. Guru-Shishya Chat V2 — persistent, progress-aware, language mirroring
4. Guru Presence — 24/7 autonomous list, who's "active"
5. Modern Guru — 26-year-old bridge persona
6. Master Journey Review — credit-gated deep analysis
7. Witness practice — Thought Counter, Somatic Heat Map, sound-reactive training
8. Programs catalog — 80+ ProgramTemplates, lotus entry points, 42+ session-based programs
9. Adaptive Program Surface — `suggest-next-program`, engine_signals, personalized_programs
10. Sensorial practices — manifests, multimodal sensors, key cinematic flows (Ramana Who-Am-I, etc.)
11. Council of Yogis — multi-master composition
12. Voice & audio — ElevenLabs TTS, cloned master voices, silent fallback rules
13. Lineage map, dimension taxonomy (100 sub-dimensions), foundation course

---

## 07 — IP-AND-INVENTIONS.md  *(What's patentable / defensible)*
The 47 inventions inventory + patent strategy.

**Sections**
1. Inventory of 47 inventions (one-line each, grouped)
2. Deep-tech modules A–J overview
3. Detailed write-ups (algorithm + claim language) for each:
   - Sound-reactive Witness training
   - Three-Brain inference from typing biometrics + voice prosody
   - Loop Detection via behavioral library (400+ loops, exact-ID mapping)
   - Witness Measurement & Breakthrough Prediction
   - Memory Consolidation (vector + daily synthesis + loop occurrence)
   - Collective Resonance (enterprise n≥5 aggregator)
   - Geo-anchored practice
   - Curious Engine confidence loop
   - Council of Yogis multi-master synthesis
   - Fractal Integration Engine
   - Lifetime Spiral Predictor (10-phase)
   - Adaptive Speed Profile + No-Guilt System
   - Living Theme evolution
   - Generative Session Engine (manifest-driven multimodal)
   - Cognitive Agent Router + Hidden 8-Stage model
   - Identity Band archetype detection
4. Data moat — 400+ behavioral loops, 5 memory layers, 24 task domains, 100-dimension map
5. Trade secrets vs filed patents — recommended split
6. Prior-art landscape (Calm/Headspace/Insight Timer/Waking Up — what we do differently)
7. Filing roadmap — provisional → PCT timeline
8. Defensive publication candidates

---

## 08 — MARKETING-AND-GTM.md  *(How we acquire and convert)*
Brand, content engine, funnel, channels.

**Sections**
1. Market sizing — meditation + mental wellness + spiritual tech TAM/SAM/SOM
2. Positioning — "yogic OS built with AI" vs meditation apps vs therapy apps vs LLM chatbots
3. Brand strategy — voice, visual universe (Satyayuga UX), Ayu character, founder voice
4. The Depth Funnel — Awareness → Mirror → Onboarding → Daily Habit → Mastery → Advocacy
5. Content engine
   - 10 pillars (already in `content/pillar-01..10`)
   - Instagram V2 — Voice posts, Reels, Carousels, MANIFEST workflow
   - LinkedIn MIRROR framework
   - Blog/SEO — `src/data/blogPosts.ts`, sitemap, `llms.txt`
6. Landing page strategy — Mirror Session, social proof, rotating hero videos
7. SEO — Seo.tsx, jsonld, sitemap, llms-full.txt
8. GTM phases — 4 phases with milestones
9. Channel strategy — organic IG/LinkedIn, founder voice, partnerships, influencers, paid
10. Pricing & credit economy — Razorpay, 75/25 split, atomic deductions
11. Growth loops & viral mechanics — sharing, Mirror invites, community circles
12. Enterprise GTM & sales playbook (paired with doc 09)
13. Geographic expansion — India-first, US/EU next
14. Metrics & KPIs — activation, D1/D7/D30, paid conversion, NPS
15. Budget allocation model

---

## 09 — ENTERPRISE-COMMUNITY-ADMIN.md  *(B2B + collective + ops)*
The standalone enterprise platform, community features, and admin command center.

**Sections**
1. Enterprise — org-centric standalone surface
   - Auth, Board, Managers, Reports, Privacy, Program Designer, Contact, Invite, Manager Coaching
   - Heat maps, team metrics
   - Privacy floor — n≥5 SECURITY DEFINER aggregators, dual-context pulses
   - Weekly AI briefing edge fn
   - Pricing & sales playbook
2. Community
   - Awareness Wall
   - Collective meditations
   - Witness circles
   - Journey groups
   - Consciousness map
3. Admin Command Center
   - Role-based oversight (`user_roles` + `has_role()`)
   - User health scoring
   - Admin Copilot
   - Analytics, Activity Feed, Predictive, Power Tools, Training, Users, Waitlist
4. Operations
   - Deployment pipeline
   - Incident response
   - Monitoring (phase 28)
   - Security memory + scan workflow
   - GDPR / data export / deletion

---

## 10 — VISION-MOAT-ROADMAP.md  *(Where this is going)*
The 5-year arc, the seven-layer moat, and the business model that funds it.

**Sections**
1. Grand vision — 5 / 10 / 25 / 50 year horizons
2. Year 1–5 roadmap with quarterly milestones
3. Technology evolution — AI capabilities, on-device models, AR/VR, biometrics
4. Research agenda & academic partnerships
5. Theory of change — measurable impact on consciousness, mental health, collective wellbeing
6. Seven-layer moat
   - Algorithms (engines doc)
   - Data (400+ loops, 100-dim map, longitudinal user data)
   - Network effects (collective resonance, community)
   - Switching costs (multi-year journey, memory, master relationships)
   - Brand (Satyayuga, founder voice)
   - Collective Intelligence (aggregated patterns)
   - Ecosystem (masters, programs, enterprise, community)
7. Business model canvas
8. Revenue architecture — 5 streams (consumer credits, consumer subscription, enterprise seats, master-led cohorts, content licensing)
9. Unit economics — consumer & enterprise
10. 5-year financial projections — bull / base / conservative / downside
11. Competitive defense playbook — threat scenarios + counter-strategies
12. Risk register (top 10) + mitigations
13. Moonshot projects — Dream Weaver, Digital Ashram, Geo-anchors, Council of Yogis at scale

---

## Cross-doc rules
- Every doc links to relevant `mem://` blueprint files and concrete code paths (`src/...`, `supabase/functions/...`).
- Every engine/feature claim must point at the file that implements it (or be marked "planned" / "blueprint-only").
- No marketing fluff in 01–07; no internal jargon in 08.
- Diagrams via Mermaid in `/mnt/documents/` when useful.
- All docs target ~10–12k words.

---

## Approve to proceed
Reply with one of:
- **"go all"** — I write all 10 docs in parallel batches.
- **"go 1,3,4"** (etc.) — I write only those docs first.
- **"tweak: ..."** — change titles, sections, scope, or order before writing.
