# CreativeOS — PRD

**Chat 07/100 · Creative Universe Architecture** — Document: PRD · Type: Product Architecture & Functional Scope · Status: Draft v1

> Summary edition. The build-ready specification an AI agent must follow is **`CREATIVEOS_MASTER_PRD.md`** (schema, studio registry, providers, API, permissions, phases, Definition of Done).

## 1. Vision
CreativeOS is an operating system for moving images: one studio environment covering the full lifecycle of visual storytelling — from a single idea to a finished film, series, franchise, and global release. It is not a video generator with extras. It is a complete film studio in software, where every discipline has its own workspace, specialized AI workforce, workflows, and shared data.

Target user: a filmmaker with an idea, not a pipeline. Success is the moment a user types one sentence and receives a developed concept, screenplay, universe, characters, shot plans, generated footage, sound, score, cut, and deliverables — while staying in control of every creative decision that matters.

## 2. Problem
AI film tools are fragmented: image models in one tab, video models in another, scripts in a third. Assets, characters, and continuity do not survive the gaps. Professionals compensate with manual glue work; beginners never finish anything. Nothing today owns the *whole* process.

## 3. Core Principles
1. **One creative graph.** All studios read and write one project/universe graph. No department silently overwrites another's approved work.
2. **Studios, not tabs.** Each discipline gets a real environment with its own tools, agents, references, reviews, and versions.
3. **Generation is a layer, not the product.** Provider-independent generation through one unified interface.
4. **Human approval gates.** Agents propose; the filmmaker decides at defined checkpoints.
5. **Everything is an asset** with stable ID, version, provenance, rights, and dependencies.
6. **Continuity is enforced**, not hoped for — character, world, camera, sound, and narrative.

## 4. Studio Families (38)
**Development:** Idea · Research · Creative Development · Packaging
**Story:** Story Architecture · Screenplay · Narrative Intelligence · Dialogue · Script Breakdown
**World & IP:** World Architect · Universe Timeline · Lore · Franchise/IP · World Simulation
**Character:** Architect · Psychology · Appearance · Performance · Relationships · Casting · Continuity
**Direction:** Director's · Visual Direction · Scene Direction · Performance Direction
**Camera:** DP · Camera · Lens · Composition · Movement · Shot Design · Lighting
**Art:** Production Design · Set · Location · Props · Costume · Makeup/Prosthetics
**Previs:** Storyboard · Previs · Animatic · Shot Sequence
**VFX:** Development · Simulation · Compositing · Digital Environment · Advanced · VFX Review
**Animation:** 2D · 3D · Mocap · Creature · Motion Graphics
**Generation:** Image · Video · Generation Control · Generation Consistency
**Sound:** Sound Design · Foley · Ambient · Audio Editing · Spatial · Sound Continuity
**Voice:** Voice · Voice Acting · ADR · Dubbing · Subtitles
**Music:** Direction · Composition · Orchestration · Production · Sync · Rights
**Post:** Editing · AI Editing · Assistant Editor · Color · Finishing
**Quality:** Continuity · Narrative QA · Visual QA · Audio QA · Delivery QC
**Commercial:** Trailer · Poster/Key Art · Marketing · Distribution
**Non-Fiction:** Documentary · Interview · Educational · News/Reportage
**Extended:** Animated Film · Game Cinematics · Interactive Story · Virtual Production
**Operations:** Producer · Budget · Scheduling · Coordination · Asset Management
**Learning:** Film Craft Academy · AI Film Mentor · Practice Studio · Film Analysis

## 5. Universal Studio Contract
Each studio implements the same shell, enabled per discipline: `Overview · Workspace · Assets · Tools · AI Agents · Reference Library · Workflow · Tasks · Versions · Reviews · Approvals · History · Export` — discipline-specific capabilities live inside; the shell guarantees consistent permissions, versioning, and review behavior across all 38 families.

## 6. End-to-End Flow
Idea → Research → Concept → Story structure → Screenplay → Breakdown → World/Character resolution → Director intent → Camera plan → Storyboard/Previs → Shot generation → Performance/Voice → Sound/Music → Edit → VFX → Color → Continuity & QC → Deliverables → Trailer/Marketing → Distribution.
Each step emits versioned artifacts into the graph; downstream studios consume them without re-entry. Nothing advances a stage automatically past a lock — the filmmaker approves concept, script, look, cut, and master.

## 7. Asset Universe
Categories: Ideas, Stories, Scripts, Characters, Worlds, Environments, Props, Images, Videos, Audio, Music, Storyboards, Camera plans, VFX, Animation, Edits, Documents, Delivery masters.
Every asset: `asset_id, project_id, type, name, description, department, created_by, created_at, version, status, parent_asset, dependencies, source_refs, rights, approval_status, usage_locations, file_locations, metadata`. Assets are reusable across films, episodes, seasons, and universes.

## 8. Project Types
One engine, many configurations: Social Reel · Short Video · Short Film · Medium Film · Feature · Documentary · Music Video · Ad · Animated Short/Feature · Web Series · TV Series · Mini-Series · Franchise · Game Cinematic · Interactive Film · Experimental. Hierarchy: `UNIVERSE → FRANCHISE → [FILM | SERIES → SEASON → EPISODE] → scenes → shots → assets`.

## 9. Intelligence Layer
A central Intelligence Engine routes intent to studios and agents. Context is scoped: the screenwriter sees structure and character history; the DP sees director vision and scene needs; the editor sees only approved footage and the story spine. Agents are specialists (researcher, story editor, continuity supervisor, QC reviewer) with explicit tool scopes, budgets, and approval requirements.
Routing rule: a request names an intent, not a tool. The engine resolves which studios must be activated, which agents own each task, and what dependencies must resolve first — then reports the plan back in plain language before spending credits.

## 10. Engineering Requirements
Modular studio registration · shared project/universe data · reusable asset store · version-controlled artifacts · cross-studio dependency graph · agent-to-studio routing · provider abstraction (model + tool) · background job queue · real-time status · workflow orchestration · approval gates · cost/credit accounting · storage lifecycle · global search · RBAC · audit trail · project-level config · export/delivery pipelines · multi-provider fallback.

## 11. Core Data Entities
`projects, universes, franchises, seasons, episodes, scenes, shots, studios, studio_capabilities, agents, creative_artifacts, assets, asset_versions, asset_dependencies, references, workflows, workflow_tasks, approvals, generation_jobs, provider_connections, model_runs, cost_records, quality_reports, audit_events`

## 12. Non-Functional Targets
- Deterministic re-runs: same inputs + seed + provider version → reproducible asset lineage.
- Continuity checks run automatically at every scene lock.
- Any asset reachable in <2 clicks / one search query from anywhere.
- Generation jobs survive session loss and resume.
- Per-project cost ceiling with hard stop and forecast.
- Export specs validated against a delivery profile before release.
- Consent-aware likeness and voice handling; authorized assets only.

## 13. Roadmap
**P1 Creative Foundation:** Project, Idea, Research, Story, Screenplay, Character, World, Director.
**P2 Visual Development:** Production Design, Cinematography, Camera, Storyboard, Previs, Image Gen, Video Gen.
**P3 Production:** Production Mgmt, Shot Mgmt, Asset Mgmt, Animation, VFX, Virtual Production.
**P4 Audio & Post:** Sound, Voice, Music, Editing, Color, Finishing, Continuity, QC.
**P5 Commercial & Expansion:** Trailer, Poster, Marketing, Distribution, Localization, Documentary, Game Cinematics, Interactive Story, Film Academy.

## 14. Success Metrics
Time from idea → first watchable cut (target: days, not months) · % projects reaching completion · continuity defect rate per 100 shots · human approval turnaround · generation cost per finished minute · asset reuse rate across a franchise · weekly active studios per project · retention of projects past Phase 4 (the real proof).

## 15. Non-Goals (v1)
No theatrical distribution deals · no real-time multiplayer editing · no clinical/psychological diagnosis tooling · no training on user IP without consent · no single-provider lock-in · no attempt to replace final human craft decisions.

## 16. Risks & Mitigations
- **Scope explosion (38 studios):** gate every studio behind the Phase plan and a measurable usage threshold before build.
- **Provider churn / model drift:** freeze provider versions per approved asset so lineage and re-runs stay reproducible.
- **Continuity collapse at scale:** run automated continuity and identity-drift checks at every scene lock, not at delivery.
- **Cost runaway:** per-project credit ceiling, forecast warnings, and hard stop with human override only.
- **User trust in AI creativity:** every agent output is a proposal with visible rationale, provenance, and a one-click reject.

## 17. Final Principle
Three dimensions must stay fused: **the Creative Universe** (what the user makes), **the Studio System** (how disciplines work), and **the AI Workforce** (who does the labor). The filmmaker should never need to understand the machinery — only the intention. CreativeOS's job is to understand the intention, activate the right studios, coordinate the agents, and surface only the creative decisions that matter.
