# V01 — FOUNDATION

Status: in progress
Owner chat: 1
Depends on: V00
Proves: master PRD §1–§10
Blocks: V02, V03, V04, V05, V06, V07, V08, V09, V10, V11

> Foundation defines **what the product is**, **who it is for**, **what they can do**, **where they do it**,
> **how it looks and behaves**, and **what "good" means numerically**. Every later volume cites an ID here.

---

## 1. DOCUMENT CONTROL

### COS-01-DOC-001 — Normative language
`MUST` = required for release. `MUST NOT` = prohibited. `SHOULD` = required unless a recorded exception exists.
`MAY` = permitted, not required. Any exception is recorded in `_progress.md` as `DEC-<NNN>`.

### COS-01-DOC-002 — Conflict resolution order
1. `docs/prd/V*.md` (this set)
2. `CREATIVEOS_MASTER_PRD.md`
3. `CREATIVEOS_PRD.md`
4. Any other project document
A conflict between (1) and (2) is resolved in favour of (1) and MUST be logged as `DEC` entry.

### COS-01-DOC-003 — Change control
- Completed blocks are append-only.
- A correction is appended as `### COS-01-DOC-003a — Correction to <ID>` with the reason.
- Requirement IDs are never renumbered, never deleted, never reused.
- A removed requirement becomes `status: withdrawn` in place, with a replacement ID if any.

### COS-01-DOC-004 — Verification obligation
Every requirement in V01–V11 MUST be satisfiable by one of:
`unit test`, `integration test`, `contract test`, `e2e test`, `RLS test`, `performance test`,
`accessibility test`, `recorded manual check` (with steps and expected observation).
A requirement with none of these is invalid.

### COS-01-DOC-005 — Numbering discipline
Numbers appear once, in the block that owns them, and are referenced elsewhere by ID.
Thresholds are integers or fixed decimals; no ranges unless explicitly a range.

---

## 2. PRODUCT THESIS

### COS-01-VIS-001 — What CreativeOS is
CreativeOS is an operating system for cinematic creation: one project graph, many disciplinary studios,
one AI workforce, and a delivery pipeline that ends in a finished film.

### COS-01-VIS-002 — What CreativeOS is not
- Not a prompt marketplace.
- Not a single-model video generator with a story tab.
- Not a NLE clone; it is a production system that produces an NLE-ready timeline.
- Not a talent marketplace.
- Not a social network.

### COS-01-VIS-003 — The unit of value
The unit of value is a **finished minute** of screen content that passes continuity and delivery QC,
not a generated clip. All metrics in V11 are expressed per finished minute where possible.

### COS-01-VIS-004 — The one-sentence promise
"Describe the film you see in your head; get a production you can finish."

### COS-01-VIS-005 — The three dimensions (must remain fused)
| Dimension | Definition | Failure if isolated |
|---|---|---|
| Creative Universe | what the user makes: worlds, characters, stories, assets | becomes a file dump with no meaning |
| Studio System | how disciplines work: tools, panels, gates | becomes a menu of disconnected generators |
| AI Workforce | who does the labour: agents, plans, critiques | becomes a chatbot bolted onto a form |

### COS-01-VIS-006 — Product identity statement
A filmmaker should never have to learn the machinery. They state intention; CreativeOS activates studios,
assembles context, runs capabilities, and surfaces only decisions that need a human.

### COS-01-VIS-007 — Scope boundary at v1
In scope: scripted narrative, documentary, animation, game cinematics, interactive story, ads,
music video, social reels, series, franchises.
Out of scope at v1: live broadcast switching, real-time multi-user timeline editing, theatrical
distribution deals, payroll/union compliance, physical production scheduling with crew call sheets.

### COS-01-VIS-008 — Definition of "complete film" for v1
A project is complete when it has: approved screenplay, approved look bible, shot list with specs,
generated or imported picture for every shot, mixed audio with dialogue/music/SFX, a locked cut,
a master export passing delivery QC, and a delivered package with subtitles.

### COS-01-VIS-009 — Non-goal: replacing craft judgement
Agents propose. Humans approve at gates (V07). The product must make approval cheap, not remove it.

### COS-01-VIS-010 — Long-term direction
Phase 5+ extends into world simulation, real-time virtual production, and multi-project canon at
franchise scale, without changing the core data model.

---

## 3. PROBLEM & MARKET FRAMING

### COS-01-MKT-001 — The fragmentation problem
A creator today uses separate tools for: ideation, outlining, screenwriting, image generation,
video generation, voice, music, editing, grading, subtitling, and delivery. Each tool has its own
project model, so continuity data is re-entered or lost at every boundary.

### COS-01-MKT-002 — Consequence 1: continuity collapse
Character faces, wardrobe, props, lighting, and geography drift across shots because no system owns
the constraints. Cost: reshoots of generated shots; measured in regenerated assets per finished minute.

### COS-01-MKT-003 — Consequence 2: no narrative memory
Generators do not know what happened in scene 12 when producing scene 40. Plot holes and contradictory
character behaviour surface only in review.

### COS-01-MKT-004 — Consequence 3: no production truth
Budgets, shot counts, schedules, and deliverables are maintained in spreadsheets disconnected from the
creative objects that generate the cost.

### COS-01-MKT-005 — Consequence 4: beginners never finish
Tool abundance without sequencing produces abandoned projects. There is no system that says
"next, do this, because your film needs it".

### COS-01-MKT-006 — Consequence 5: professionals cannot supervise AI
Without versioning, provenance, approvals, and audit, professionals cannot put AI output into a
production chain that other people depend on.

### COS-01-MKT-007 — Positioning statement
For creators who intend to finish a film, CreativeOS is the production system that keeps one creative
truth across every discipline — unlike generator suites, which produce assets without continuity, and
unlike NLEs, which assume the assets already exist.

### COS-01-MKT-008 — Competitive frame (categories, not brands)
| Category | What it does well | What it cannot do | CreativeOS response |
|---|---|---|---|
| Text-to-video suites | fast clips | no script, no continuity, no production | graph + locks + gates |
| AI screenplay tools | drafting | no visuals, no production | one graph feeds all studios |
| Storyboard tools | panels | no generation pipeline, no QC | panels are artifacts with locks |
| NLEs | precise cutting | no generation, no continuity memory | timeline consumes approved shots |
| Production management | budget/schedule | no creative objects | budget derives from breakdown |
| Voice/music services | single modality | isolated from picture | cue sheets and sync built in |

### COS-01-MKT-009 — Wedge: the golden path
The first shipped wedge is the **idea → first assembled cut** path for short film and social formats,
because it exercises every core subsystem at the smallest cost.

### COS-01-MKT-010 — Expansion path
Short formats → episodic → feature → franchise/universe → interactive and virtual production.

### COS-01-MKT-011 — Buyer vs user
Buyer: studio lead, producer, agency, educator. User: writer, director, artist, editor.
The product MUST satisfy the user's daily craft needs and the buyer's oversight, cost, and rights needs.

### COS-01-MKT-012 — Adoption trigger
A creator has a script or treatment and needs to see it, hear it, and cut it without assembling a crew.

### COS-01-MKT-013 — Retention thesis
Retention comes from **project gravity**: the more approved canon and assets a project accumulates,
the more expensive it is to leave. Canon and identity locks are therefore strategic, not cosmetic.

### COS-01-MKT-014 — Pricing surface (product requirement, not final price)
Metered credits per generation, seat-based collaboration, storage tiers, and a project-cap on free.
Credits MUST be visible before any spend and reconciled after (V03, V11).

### COS-01-MKT-015 — Trust requirement
Every AI output shows: what produced it, from which inputs, at what cost, and with what confidence or
warnings. No output is anonymous.

---

## 4. PERSONAS

> Each persona lists: context, goals, pains, jobs-to-be-done, success metric, default role, primary studios,
> and explicit anti-needs (things the product MUST NOT force on them).

### COS-01-PER-001 — Solo Creator (primary)
Context: one person, evenings and weekends, laptop, no crew, limited budget, strong taste, weak pipeline.
Goals:
1. Finish a 3–15 minute piece end to end.
2. Keep characters and locations visually consistent without manual bookkeeping.
3. Spend money only after seeing an estimate.
4. Learn craft while making, not before making.
Pains:
1. Abandoned projects at the "assets exist but nothing is assembled" stage.
2. Regenerating the same character until it drifts into a stranger.
3. Tool sprawl and subscription fatigue.
4. Not knowing what the next step is.
Jobs-to-be-done:
1. "When I have an idea, help me see whether it is worth 20 minutes of my life."
2. "When I have a script, help me see it as moving images I can cut."
3. "When I have a cut, help me make it sound and look finished."
Success metric: first assembled cut within 6 hours of project creation.
Default role: owner.
Primary studios: `development.idea`, `story.screenplay`, `character.appearance`, `gen.image`,
`gen.video`, `edit.timeline`, `qc.continuity`.
Anti-needs: MUST NOT require node graphs, codecs, or colour science knowledge to finish.

### COS-01-PER-002 — Independent Filmmaker
Context: has a script and a visual idea; may shoot partially practically; uses AI for previs and pickups.
Goals:
1. Translate the script into a shot list that a DP would respect.
2. Preview shots before committing money.
3. Keep screen direction and coverage coherent.
4. Produce a pitch package for financiers.
Pains:
1. Previs tools disconnected from the script.
2. Shot lists in spreadsheets with no link to generated frames.
3. Coverage gaps discovered in the edit.
Jobs-to-be-done:
1. "When I have a scene, give me the shots I need and why."
2. "When I have shots, show me what the sequence will feel like."
3. "When I pitch, give me a package that looks professional."
Success metric: shot list with <= 5% coverage gaps at first cut.
Default role: owner.
Primary studios: `story.breakdown`, `cine.*`, `sb.board`, `sb.previs`, `sb.animatic`,
`development.packaging`, `prod.budget`.

### COS-01-PER-003 — Studio Professional (department)
Context: works inside a department on someone else's project; needs depth and review discipline.
Goals:
1. Work at professional granularity (lens, LUT, cue, take).
2. Review others' work with precise notes.
3. Never accidentally overwrite approved work.
4. Export in formats their pipeline accepts.
Pains:
1. AI tools that only produce "good enough" one-click output.
2. No audit trail of who changed what.
3. Version confusion between departments.
Jobs-to-be-done:
1. "When I open a shot, show me its full spec and continuity constraints."
2. "When I review, let me annotate at timecode and region."
3. "When I deliver, give me the exact preset for my destination."
Success metric: zero unapproved overwrites per project; review turnaround under 24 h.
Default role: artist (write) or supervisor (approve).
Primary studios: all department studios; `platform.review`, `platform.jobs`.

### COS-01-PER-004 — Writer / Showrunner
Context: owns narrative across episodes and seasons; cares about canon more than pixels.
Goals:
1. Keep story logic and character arcs coherent across many scenes.
2. Track plants, payoffs, and threads.
3. Maintain canon that other departments must obey.
4. Break episodes and seasons quickly.
Pains:
1. Spreadsheet bibles that go stale.
2. Notes that contradict each other.
3. No tool that reads the whole draft and finds holes.
Jobs-to-be-done:
1. "When I finish a draft, tell me what does not hold together."
2. "When I add an episode, keep it inside canon."
3. "When I change a fact, tell me what breaks downstream."
Success metric: fewer than 2 continuity `block` findings per episode at lock.
Default role: owner or supervisor.
Primary studios: `story.*`, `world.*`, `character.architect`, `direction.director`.

### COS-01-PER-005 — Animator / VFX Artist
Context: technical craftsperson; needs planning artefacts, not magic.
Goals:
1. Plan effects before generating.
2. Compare versions precisely.
3. Integrate plates, mattes, and simulations with correct depth and light.
4. Hand off clean specs to a pipeline.
Pains:
1. Uncontrolled generation with no reproducibility.
2. Reviews by scrolling chat instead of by frame.
3. Missing technical metadata (resolution, fps, colour).
Jobs-to-be-done:
1. "When I plan a shot, give me a breakdown I can execute."
2. "When I compare versions, show me the differences at the pixel and timecode."
3. "When I hand off, give me metadata my pipeline reads."
Success metric: VFX plan coverage 100% of flagged shots before generation.
Default role: artist.
Primary studios: `vfx.*`, `animation.*`, `cinematography.shot_design`, `platform.review`.

### COS-01-PER-006 — Educator / Student
Context: teaching or learning film craft; needs structured practice and feedback.
Goals:
1. Learn by doing with scoped exercises.
2. Get specific critique with craft vocabulary.
3. Apply exercises directly into a real project.
Pains:
1. Generic AI answers with no film-specific rubric.
2. Tutorials disconnected from tools.
3. No progress record.
Jobs-to-be-done:
1. "When I learn a concept, give me an exercise I can finish in 20 minutes."
2. "When I submit work, critique it against a named rubric."
3. "When I improve, show me what changed."
Success metric: exercise completion rate above 60% per started track.
Default role: viewer (student) or owner (educator workspace).
Primary studios: `academy.*`.

### COS-01-PER-007 — Producer
Context: accountable for money, time, and deliverables; may not create content daily.
Goals:
1. Know the cost of every creative decision.
2. Track gates and approvals without chasing people.
3. Guarantee deliverables meet platform specs.
4. Protect rights and clearances.
Pains:
1. Cost discovered after spend.
2. Approvals buried in message threads.
3. Delivery rejections from spec mismatches.
Jobs-to-be-done:
1. "When scope changes, show me the cost delta."
2. "When a gate is pending, tell me who must act and by when."
3. "When we deliver, verify specs before upload."
Success metric: zero delivery rejections; budget variance under 5%.
Default role: producer.
Primary studios: `prod.*`, `qc.delivery`, `mkt.distribution`, `platform.jobs`.

### COS-01-PER-008 — Brand / Agency Operator
Context: produces many short pieces against a brand system; needs volume and consistency.
Goals:
1. Lock brand assets once, reuse everywhere.
2. Produce variants quickly (aspect ratios, languages, lengths).
3. Prove rights and approvals per asset.
Pains:
1. Brand drift across outputs.
2. Re-approval of every variant.
3. Unclear usage rights for generated assets.
Jobs-to-be-done:
1. "When I start a campaign, inherit the brand system automatically."
2. "When I produce variants, keep the approved core untouched."
3. "When I deliver, prove which assets are cleared."
Success metric: variant production time under 30 minutes per variant after the first.
Default role: producer or admin.
Primary studios: `gen.*`, `design.*`, `mkt.campaign`, `voice.dubbing`, `qc.delivery`.

### COS-01-PER-009 — Persona conflicts (must be resolved by role, not by feature flags)
| Conflict | Parties | Resolution |
|---|---|---|
| Depth vs simplicity | Studio Professional vs Solo Creator | progressive disclosure: simple default, "advanced" reveals full specs |
| Speed vs approval | Solo Creator vs Producer | gate configurable per project: solo projects default to self-approval |
| Canon strictness vs speed | Showrunner vs Agency | `canon_mode` = strict for narrative, soft for commercial |
| Cost control vs exploration | Producer vs Artist | exploration budget line separate from production budget |

---

## 5. PRIMARY JOURNEYS

> Journey steps are contracts: each step names the screen, the data written, the gate that may block,
> and the failure mode that must be handled. Journeys are the basis of the E2E tests in V09.

### COS-01-JNY-001 — Idea → First Cut (golden path)
Entry: Hub → "New project" → free-text idea.
Exit: timeline with an assembled sequence, audio beds, and a playable preview.

| # | Step | Screen | Writes | Gate | Failure mode handled |
|---|---|---|---|---|---|
| 1 | Capture idea (text/voice/link/image) | `/p/:id/development` | `creative_artifacts(idea_brief)` | — | transcription unavailable → paste text |
| 2 | Generate 3 concept directions | same | `concept_direction` v1..v3 | — | low provider confidence → ask 2 clarifying questions |
| 3 | Compare and select | same | `projects.premise` | — | user rejects all → "branch" creates v4 |
| 4 | Logline + treatment | `/development` | `logline`, `treatment` | `concept_lock` | gate pending → edit continues in draft, export blocked |
| 5 | Beat sheet | `/story` | `beat_sheet` | — | structure template conflict → keep both, mark stale |
| 6 | Scene drafting | `/screenplay` | `scene` × n | — | locked screenplay → read-only banner |
| 7 | Breakdown | `/breakdown` | `breakdown_sheet` | — | low recall warning → manual element entry |
| 8 | Characters + identity locks | `/characters` | `character_profile`, `character_reference_set` | `character_lock` | missing reference → block generation with fix action |
| 9 | World + location design | `/world`, `/design` | `world_bible`, `location` assets | — | canon conflict → block finding |
| 10 | Look bible | `/direction` | `look_bible` | `visual_direction_lock` | palette conflict with references → warn |
| 11 | Shot list | `/shots` | `shot_spec` × n | — | incomplete spec → field-level validation |
| 12 | Storyboard panels | `/storyboard` | `storyboard_panel` | — | generation failure → placeholder with retry |
| 13 | Generate picture | `/generation` | `asset_versions(video)` | — | insufficient credits → top-up sheet, job not queued |
| 14 | Voice + SFX + music | `/voice`, `/sound`, `/music` | `voice`, `sfx`, `music` assets | — | rights missing → blocked with rights form |
| 15 | Assemble cut | `/edit` | `timeline` artifact | — | missing shots → gap list with links |
| 16 | Continuity + visual QC | `/continuity` | `quality_reports` | — | block findings → fix suggestions |
| 17 | Colour + finish | `/color`, `/delivery` | `grade`, `master` | `picture_lock` | spec mismatch → preset diff |
| 18 | Export package | `/delivery` | `deliverable` | `delivery_lock` | export failure → retry with reduced settings |

Timing budget: steps 1–8 ≤ 45 min for a 3-minute short; step 13 is the dominant cost and MUST show
running cost against budget.

### COS-01-JNY-002 — Script → Production Plan
Entry: existing screenplay pasted or uploaded (Fountain/PDF text).
Exit: shot list, budget estimate, schedule skeleton, casting breakdown.

| # | Step | Screen | Writes | Notes |
|---|---|---|---|---|
| 1 | Upload/paste script | `/screenplay` | `screenplay` artifact | parse preview before commit |
| 2 | Parse scenes | `/breakdown` | `scenes` | preserve slug, time of day, page length |
| 3 | Extract elements | `/breakdown` | element candidates | dedupe against existing canon |
| 4 | Promote elements to entities | `/characters`, `/design` | `characters`, `locations`, `props` | merge or create |
| 5 | Casting requirements | `/characters/casting` | `casting_breakdown` | voice + age range required |
| 6 | Coverage plan | `/storyboard` | `coverage_plan` | master + coverage per scene |
| 7 | Shot list | `/shots` | `shot_spec` | 18 required fields |
| 8 | Budget from breakdown | `/production` | `budget` | cost lines derive from element counts and generation estimates |
| 9 | Schedule skeleton | `/production` | `schedule` | scene days derived from complexity and duration |
| 10 | Production package | `/development/packaging` | `pitch_deck` | exports PDF |

Acceptance: element extraction ≥ 90% recall; budget variance ≤ 5% against actual generation spend on a
5-minute fixture.

### COS-01-JNY-003 — Existing IP → Franchise
Entry: a universe with one finished project, or imported canon documents.
Exit: second production linked to the same universe with canon enforced.

| # | Step | Screen | Writes | Notes |
|---|---|---|---|---|
| 1 | Create universe | `/u/:universeId` | `universes` | title, premise, genre, tone |
| 2 | Import canon | `/u/:id/lore` | `lore_entry`, `glossary` | source doc → structured entries |
| 3 | Register characters | `/characters` | `character_profile` | mark `canonical = true` |
| 4 | Register world rules | `/world` | `world_rules` | machine-checkable statements |
| 5 | Lock canon | same | `approvals(canon_lock)` | locked entries block conflicts |
| 6 | Create linked project | `/u/:id` → new | `projects(universe_id, franchise_id)` | inherits canon read-only |
| 7 | Write new story | `/screenplay` | `scenes` | canon violations surface inline |
| 8 | Continuity audit across works | `/continuity` | `quality_reports` | cross-project checks |

Acceptance: a canon violation in project 2 is reported with the canon ID that forbids it.

### COS-01-JNY-004 — Shot Repair
Entry: a shot fails continuity or visual QC.
Exit: corrected shot version approved; downstream timeline updated.

| # | Step | Screen | Writes | Notes |
|---|---|---|---|---|
| 1 | View findings | `/continuity` | — | each finding links to shot and evidence |
| 2 | Open shot | `/shots/:id` | — | spec, locks, versions side by side |
| 3 | Diagnose | same | `quality_reports` note | identity score, lighting mismatch, artefact list |
| 4 | Adjust spec or locks | same | `shot_spec` v+1 | change only the failing dimension |
| 5 | Regenerate | `/generation` | `asset_versions` | cost estimate shown |
| 6 | Compare | `/platform/review` | — | A/B scrub, overlay diff |
| 7 | Approve | same | `approvals` | replaces timeline clip |
| 8 | Re-run QC | `/continuity` | `quality_reports` | must clear the block finding |

Acceptance: median repair cycle under 12 minutes with ≤ 2 regeneration attempts.

### COS-01-JNY-005 — Learn → Practice
Entry: Academy track selected.
Exit: exercise submitted, critiqued, and optionally applied to a project.

| # | Step | Screen | Writes | Notes |
|---|---|---|---|---|
| 1 | Pick track | `/academy` | `lesson_progress` | 12 tracks |
| 2 | Lesson | `/academy/:courseId/:lessonId` | progress | concept + example frames |
| 3 | Exercise | `/academy/practice` | exercise artifact | scoped, 20-minute target |
| 4 | Submit | same | `lesson_progress(score)` | rubric-based |
| 5 | Critique | same | mentor artifact | cites timestamps and craft terms |
| 6 | Apply | — | adds to project | creates draft artifact, never overwrites |

Acceptance: critique references at least 2 specific craft terms and 1 timestamp.

### COS-01-JNY-006 — Deliver
Entry: picture lock approved.
Exit: signed-off deliverable package.

| # | Step | Screen | Writes | Notes |
|---|---|---|---|---|
| 1 | Choose destination | `/delivery` | `deliverable(preset)` | platform spec table |
| 2 | Conform | same | `master` job | resolution, fps, aspect, audio |
| 3 | Titles + credits | `/edit/finishing` | `title_cards` | safe-area validation |
| 4 | Subtitles | `/voice/subtitle` | `subtitle` asset | timing drift check |
| 5 | QC | `/continuity/delivery` | `quality_reports(delivery)` | field-level pass/fail |
| 6 | Package | `/delivery` | `deliverable` files | master + subs + report + stills |
| 7 | Sign-off | same | `approvals(delivery_lock)` | who, when, hash |

Acceptance: zero delivery-QC failures on export of a fixture master at 1080p24.

---

## 6. CAPABILITY SURFACE (WHAT THE USER CAN DO)

### COS-01-CAP-001 — Surface principle
The product surface is the union of 111 studios. A user never sees a flat list of 960 capabilities;
they see a studio with 6–12 primary actions and a secondary "all tools" list.

### COS-01-CAP-002 — Primary actions per studio
Each studio MUST nominate ≤ 3 primary actions that appear as buttons, the rest in an overflow menu.

### COS-01-CAP-003 — Universal actions available everywhere
| Action | Shortcut | Where | Notes |
|---|---|---|---|
| Command palette | `Ctrl/Cmd+K` | global | navigation, agents, assets, actions |
| Save | auto | all editors | 2 s debounce, explicit save optional |
| Version history | `Ctrl/Cmd+Shift+H` | artifacts | list, diff, restore |
| Request approval | `Ctrl/Cmd+Shift+A` | artifacts | opens gate sheet |
| Ask agent | `Ctrl/Cmd+J` | global | scoped to current studio |
| Search all | `/` | global | FTS across artifacts/assets |
| Toggle panel | `Ctrl/Cmd+B` | studio shell | left rail |
| Shortcut help | `?` | global | overlay |

### COS-01-CAP-004 — Progressive disclosure levels
| Level | Audience | What is shown |
|---|---|---|
| Simple | Solo Creator, student | primary actions, plain-language fields, defaults |
| Standard | Independent filmmaker | full forms, estimates, versions |
| Expert | Studio professional | every parameter, raw spec JSON, provider choice |

### COS-01-CAP-005 — Empty-state requirement
Every studio's first visit shows: one sentence purpose, one primary action, one worked example,
and a link to the relevant Academy lesson.

### COS-01-CAP-006 — Intelligence entry
The global "Ask" bar accepts natural language, routes to a studio capability, shows the plan,
and requires confirmation before any spend above 5 credits.

---

## 7. INFORMATION ARCHITECTURE & ROUTING

### COS-01-IA-001 — Routing rules
1. Every route is deep-linkable with `?artifactId=` and `?panel=` state.
2. Unknown IDs render `NotFound` with a link to the nearest valid parent, never a blank screen.
3. Routes with gates show a banner, not a redirect.
4. Route changes preserve scroll position per project.

### COS-01-IA-002 — Route table

| ID | Path | Shell | Auth | Primary element |
|---|---|---|---|---|
| COS-01-IA-R01 | `/` | Hub | required | project grid + recent + credits |
| COS-01-IA-R02 | `/login` | Bare | none | email + magic link |
| COS-01-IA-R03 | `/onboarding` | Bare | required | workspace + first project |
| COS-01-IA-R04 | `/u/:universeId` | Universe | required | universe header + franchise tree |
| COS-01-IA-R05 | `/u/:universeId/timeline` | Universe | required | timeline canvas |
| COS-01-IA-R06 | `/u/:universeId/lore` | Universe | required | lore index + glossary |
| COS-01-IA-R07 | `/p/:projectId` | Project | required | stage checklist + gate readiness |
| COS-01-IA-R08 | `/p/:projectId/development` | Studio | required | idea list + concept compare |
| COS-01-IA-R09 | `/p/:projectId/research` | Studio | required | dossier + references |
| COS-01-IA-R10 | `/p/:projectId/story` | Studio | required | beat sheet + structure map |
| COS-01-IA-R11 | `/p/:projectId/screenplay` | Studio | required | editor + scene navigator |
| COS-01-IA-R12 | `/p/:projectId/breakdown` | Studio | required | scene sheet + element matrix |
| COS-01-IA-R13 | `/p/:projectId/world` | Studio | required | world bible sections |
| COS-01-IA-R14 | `/p/:projectId/characters` | Studio | required | character grid |
| COS-01-IA-R15 | `/p/:projectId/characters/:characterId` | Studio | required | profile + refs + continuity |
| COS-01-IA-R16 | `/p/:projectId/direction` | Studio | required | treatment + scene direction |
| COS-01-IA-R17 | `/p/:projectId/cinematography` | Studio | required | shot spec editor |
| COS-01-IA-R18 | `/p/:projectId/design` | Studio | required | design bible + element sets |
| COS-01-IA-R19 | `/p/:projectId/storyboard` | Studio | required | panel grid + animatic player |
| COS-01-IA-R20 | `/p/:projectId/shots` | Studio | required | shot board + coverage |
| COS-01-IA-R21 | `/p/:projectId/generation` | Studio | required | generation queue + gallery |
| COS-01-IA-R22 | `/p/:projectId/vfx` | Studio | required | VFX plan + review |
| COS-01-IA-R23 | `/p/:projectId/animation` | Studio | required | takes + rigs |
| COS-01-IA-R24 | `/p/:projectId/sound` | Studio | required | sound plan + layers |
| COS-01-IA-R25 | `/p/:projectId/voice` | Studio | required | voice profiles + takes |
| COS-01-IA-R26 | `/p/:projectId/music` | Studio | required | cues + sync |
| COS-01-IA-R27 | `/p/:projectId/edit` | Studio | required | timeline |
| COS-01-IA-R28 | `/p/:projectId/color` | Studio | required | grade + scopes |
| COS-01-IA-R29 | `/p/:projectId/continuity` | Studio | required | findings + reports |
| COS-01-IA-R30 | `/p/:projectId/delivery` | Studio | required | presets + packages |
| COS-01-IA-R31 | `/p/:projectId/marketing` | Studio | required | trailer + poster + campaign |
| COS-01-IA-R32 | `/p/:projectId/production` | Studio | required | budget + schedule + tasks |
| COS-01-IA-R33 | `/p/:projectId/academy` | Studio | required | project-scoped learning |
| COS-01-IA-R34 | `/a/:projectId/:artifactId` | Artifact | required | universal viewer |
| COS-01-IA-R35 | `/jobs` | Job center | required | queue + costs |
| COS-01-IA-R36 | `/agents` | Agent console | required | chat + plans + traces |
| COS-01-IA-R37 | `/settings/workspace` | Settings | admin | members, roles |
| COS-01-IA-R38 | `/settings/providers` | Settings | admin | connections, defaults |
| COS-01-IA-R39 | `/settings/billing` | Settings | admin | plan, credits, usage |
| COS-01-IA-R40 | `/settings/profile` | Settings | required | identity, locale |

### COS-01-IA-003 — Navigation hierarchy depth
Hub → Universe → Project → Studio → Artifact → Version. Never deeper than 6 levels; a deeper need
opens a panel, not a route.

### COS-01-IA-004 — Breadcrumbs
Every studio route shows: Workspace / Universe / Project / Studio, with the studio name last and current.

### COS-01-IA-005 — Back behaviour
Browser back MUST restore the previous panel state including scroll and selected artifact.

### COS-01-IA-006 — 404 rule
A 404 for an entity inside a valid project shows the project header and a "return to studio" action.

### COS-01-IA-007 — Route-level permissions
Routes requiring producer or admin render a permission notice with a request-access action, not a crash.

---

## 8. DESIGN SYSTEM

### COS-01-DS-001 — Colour tokens
| Token | Value | Use |
|---|---|---|
| `bg/base` | `#07080B` | app background |
| `bg/raised` | `#0D0F14` | panels |
| `bg/overlay` | `#12151C` | modals, popovers |
| `bg/hover` | `#171B24` | hover states |
| `border/subtle` | `#1E232D` | dividers |
| `border/strong` | `#2B323F` | inputs, focus rings base |
| `text/primary` | `#EDF0F5` | body |
| `text/secondary` | `#A2ABBA` | labels |
| `text/tertiary` | `#6B7484` | hints |
| `accent` | `#7C5CFF` | primary action |
| `accent/soft` | `#2A2350` | selected rows |
| `success` | `#3DDC97` | approved |
| `warning` | `#F5B544` | in review, stale |
| `danger` | `#FF5D5D` | failed, destructive |
| `info` | `#59A6FF` | locked, informational |
| `gen` | `#FF7AD9` | generating pulse |

Light theme maps the same semantic names with inverted base values; components reference semantic names only.

### COS-01-DS-002 — Type scale
| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `display` | 46 / 52 | 600 | studio title |
| `h1` | 34 / 40 | 600 | section |
| `h2` | 26 / 32 | 600 | panel title |
| `h3` | 20 / 26 | 550 | card title |
| `body` | 15 / 22 | 400 | default |
| `body/strong` | 15 / 22 | 550 | emphasis |
| `small` | 13 / 18 | 400 | metadata |
| `micro` | 11 / 14 | 500 | badges, uppercase tracking 0.04em |
| `mono` | 13 / 20 | 400 | timecode, IDs, JSON |

### COS-01-DS-003 — Spacing scale
`2, 4, 8, 12, 16, 20, 24, 32, 40, 56, 72`. Layout gutters: 24 desktop, 16 tablet, 12 mobile.

### COS-01-DS-004 — Radius and elevation
Radius: `6` inputs, `10` cards, `14` panels, `999` pills. Elevation: `0` flat, `1` panel shadow 0 1 2,
`2` popover 0 8 24, `3` modal 0 24 64. No blur except modal backdrop (8 px).

### COS-01-DS-005 — Motion
| Token | Duration | Easing | Use |
|---|---|---|---|
| `micro` | 120 ms | ease-out | hover, toggle |
| `panel` | 180 ms | cubic-bezier(.2,.7,.3,1) | panels, sheets |
| `page` | 240 ms | cubic-bezier(.2,.7,.3,1) | route transitions |
| `pulse` | 1600 ms loop | ease-in-out | generating state |
| `reveal` | 320 ms | ease-out | first-load canvas |

Rule: no animation over 400 ms except explicit cinematic previews; respect `prefers-reduced-motion`
by replacing all transitions with opacity-only 80 ms.

### COS-01-DS-006 — Status semantics (single source)
| Status | Colour | Badge text | Allowed transitions |
|---|---|---|---|
| draft | text/tertiary | Draft | → in_review |
| in_review | warning | In review | → approved, changes_requested |
| changes_requested | warning | Changes | → in_review |
| approved | success | Approved | → locked, in_review |
| locked | info | Locked | → approved (by admin only) |
| archived | text/tertiary | Archived | → draft |

### COS-01-DS-007 — Component inventory (must exist before Phase 1 ends)
| Component | Variants | Required states |
|---|---|---|
| `Button` | primary, secondary, ghost, danger, icon | default, hover, focus, active, disabled, loading |
| `Input` | text, textarea, number, timecode | default, focus, error, disabled, read-only |
| `Select` | single, multi, searchable | default, open, empty, error |
| `Slider` | single, range | default, dragging, disabled |
| `Tabs` | underline, pill | default, active, overflow |
| `Table` | dense, comfortable | loading, empty, error, selected, sorted |
| `Card` | asset, artifact, character, shot | default, hover, selected, stale |
| `Badge` | status, tag, count | — |
| `Dialog` | confirm, form, media | default, busy |
| `Sheet` | right, bottom | default, busy |
| `Toast` | info, success, warn, error | auto-dismiss 5 s, undo action |
| `Banner` | gate, stale, warning, error | dismissible or fixed |
| `EmptyState` | studio, list, search | — |
| `Skeleton` | line, card, canvas | — |
| `Timeline` | tracks, clips, playhead | idle, dragging, snapping, locked |
| `MediaPlayer` | video, audio, frame-step | buffering, error, captions |
| `CompareSlider` | image, video | idle, dragging |
| `Graph` | nodes, edges, minimap | loading, focused, filtered |
| `ArtifactViewer` | text, deck, spec, storyboard | loading, stale, locked |
| `VersionBar` | list, diff toggle | — |
| `CostMeter` | inline, panel | estimate, running, exceeded |
| `GateBanner` | pending, approved, rejected | — |
| `AgentMessage` | proposal, plan, result, error | streaming |
| `SpecForm` | grouped, collapsible | valid, invalid, dirty |

### COS-01-DS-008 — Focus and keyboard rules
1. Focus ring: 2 px `accent` offset 2 px, always visible for keyboard users.
2. All dialogs trap focus and restore on close.
3. `Esc` closes the topmost overlay only.
4. `Tab` order follows visual order; no positive `tabindex`.
5. Destructive dialogs focus the cancel action by default.

### COS-01-DS-009 — Iconography
24 px grid, 1.5 px stroke, rounded caps. Icons always paired with text except in the left rail,
where `aria-label` is mandatory.

### COS-01-DS-010 — Dense data surfaces
Tables and timelines use 32 px rows; hover reveals row actions; selection supports shift-range and
`Ctrl/Cmd` toggle; bulk actions appear in a sticky bar with a count.

### COS-01-DS-011 — Content voice
Plain, technical, respectful. No exclamation marks in product copy. No anthropomorphising agents
(no "I think", use "Proposed"), except in the Agent Console where first person is allowed.

### COS-01-DS-012 — Error copy formula
`What happened` + `what it means` + `the exact next action`. Never only "Something went wrong".

### COS-01-DS-013 — Loading copy
Under 1 s: no text. 1–5 s: skeleton. Over 5 s: progress + cancel. Long jobs: estimated time and
job center link.

---

## 9. PLATFORM ARCHITECTURE

### COS-01-ARC-001 — Service map
```
[Web client SPA]
  |-- auth (Supabase Auth / JWT)
  |-- data reads (PostgREST, RLS-scoped)
  |-- writes (Edge/Node API /api/v1, service role after authz)
  |-- realtime (WS channels: workspace, project, job)
  |-- storage (signed URLs)
[API layer]
  |-- authz + rate limit + envelope
  |-- capability router -> studio capability modules
  |-- agent runtime -> planner, executor, critic
  |-- job enqueue -> worker pool
[Worker pool]
  |-- job runner (provider adapters, retries, progress, cost)
  |-- QC runners (continuity, visual, audio, delivery)
  |-- export/conform workers
[Data]
  Postgres (graph, artifacts, assets metadata, jobs, audit)
  Object storage (media, masters, exports)
  Secret store (provider credentials)
```

### COS-01-ARC-002 — Trust boundaries
1. Client is untrusted: all authorization server-side.
2. Provider credentials never cross the API boundary toward the client.
3. Generated media is untrusted input: scanned, policy-checked, and metadata-verified before approval.
4. Object URLs are signed and short-lived.
5. Worker has service role but only for the workspace encoded in the job.

### COS-01-ARC-003 — Request path (capability call)
```
client -> POST /capabilities/:key
  -> authz (role matrix)
  -> input validation (schema)
  -> gate check (blocked if gate pending)
  -> cost estimate (credits)
  -> if async: job row + 202 { jobId }
  -> if sync: execute -> artifact version + cost record -> 200
  -> event emit (artifact.created | job.queued)
  -> audit
```

### COS-01-ARC-004 — Read path
Lists use paginated reads with `limit ≤ 100` and keyset cursors on `(updated_at, id)`.
Detail views use a single aggregate query per route to avoid waterfall loads.

### COS-01-ARC-005 — Realtime policy
Only job progress, approval changes, and comments are pushed. Artifact bodies are refetched on event,
never streamed, to avoid stale merges.

### COS-01-ARC-006 — Offline behaviour
Edits while offline are queued in IndexedDB with an optimistic version; on reconnect the client
submits a version with `baseVersionId`. Conflict → server returns `CONFLICT` with both bodies and a
merge view. Silent overwrite is prohibited.

### COS-01-ARC-007 — Idempotency
Every mutating endpoint accepts `Idempotency-Key`. Replays return the original result for 24 h.

### COS-01-ARC-008 — Background job capacity
Worker concurrency per capability class: llm 20, image 8, video 3, voice 8, music 4, export 2.
Queue is fair-share per workspace to prevent one project starving others.

### COS-01-ARC-009 — Failure isolation
A failing provider MUST NOT fail the studio. The capability returns a degraded result (spec saved,
render deferred) with a banner and a retry action.

### COS-01-ARC-010 — Versioning strategy
Schema migrations forward-only; every migration reversible in comment form; no destructive column drops
without a two-release deprecation.

### COS-01-ARC-011 — Environment parity
Local, preview, production share the same migration set and seed; provider mocks in local/preview by default.

### COS-01-ARC-012 — Observability hooks
Every request emits: trace id, workspace, project, route, capability, latency, status, cost.
Every job emits: queue wait, run time, provider, retries, outcome.
Every agent run emits: steps, tokens, tools, cost, outcome.

### COS-01-ARC-013 — Data flow for a generated shot (canonical example)
```
shot_spec (artifact) + continuity locks (shot_continuity)
  -> prompt builder
  -> job (image|video)
  -> provider
  -> asset_version (+technical metadata)
  -> QC (identity score, artifact scan)
  -> review
  -> approval
  -> timeline clip reference
```

### COS-01-ARC-014 — Module boundaries
`src/studios/*` may import from `src/lib/*` and `src/features/shared/*`, never from another studio's
internals. Cross-studio interaction goes through capability calls and graph queries.

### COS-01-ARC-015 — Generated code rule
Registry files and API type files are generated; hand edits are overwritten and are treated as defects.

---

## 10. NON-FUNCTIONAL REQUIREMENTS

### COS-01-NFR-001 — Latency budgets
| Interaction | p50 | p95 | Hard timeout |
|---|---|---|---|
| Route transition (warm) | 120 ms | 250 ms | 3 s |
| List query (100 rows) | 150 ms | 400 ms | 5 s |
| Project graph (depth 2) | 250 ms | 700 ms | 8 s |
| Artifact open | 200 ms | 600 ms | 8 s |
| Capability sync (llm) | 4 s | 12 s | 60 s |
| Autosave | 200 ms | 600 ms | 5 s |
| Search (FTS) | 120 ms | 350 ms | 3 s |

### COS-01-NFR-002 — Scale targets (design capacity)
| Entity | Per workspace | Global |
|---|---|---|
| Projects | 500 | 1,000,000 |
| Artifacts | 50,000 | 50,000,000 |
| Asset versions | 500,000 | 500,000,000 |
| Jobs per day | 20,000 | 20,000,000 |
| Concurrent editors | 25 | 20,000 |

### COS-01-NFR-003 — Availability
API 99.9% monthly; worker 99.5%; degraded mode allowed when providers fail, but the app MUST remain
usable for writing, planning, and review.

### COS-01-NFR-004 — Durability
Approved artifacts and locked canon MUST NOT be lost. Storage versioning on; daily DB backups with
point-in-time recovery to 7 days; restore drill quarterly with documented RTO 4 h, RPO 15 min.

### COS-01-NFR-005 — Data integrity
All writes transactional per artifact version. No partial artifact writes. Foreign keys enforced;
orphan assets flagged by a nightly job.

### COS-01-NFR-006 — Cost ceilings
- Per job default max: 40 credits (configurable per project).
- Per project monthly soft cap: workspace-defined; warn at 80%, block at 100% unless owner overrides.
- Cost MUST be recorded for 100% of provider calls; unrecorded calls are a defect.

### COS-01-NFR-007 — Backpressure
When queue depth exceeds 5× worker concurrency, new jobs are queued with an estimated wait shown,
not rejected, unless the workspace exceeds its monthly cap.

### COS-01-NFR-008 — Security baselines
OWASP ASVS level 2; CSP with no `unsafe-inline` in production; HttpOnly, Secure, SameSite=Lax cookies
for session; signed URLs only; dependency scanning in CI; secrets never in client bundles or logs.

### COS-01-NFR-009 — Privacy
No third-party model training on user content without explicit opt-in recorded in `workspaces.settings`.
Export and delete within 30 days of request. Logs redact free text beyond 200 characters.

### COS-01-NFR-010 — Content and rights safety
Real-person likeness or voice requires an active rights record. Policy-violating generations are blocked
and logged. Fiction is permitted; operational harm content is not.

### COS-01-NFR-011 — Accessibility
WCAG 2.2 AA. Keyboard-complete golden path. Captions on all previews with dialogue. Reduced motion
respected. Screen-reader names on every icon-only control.

### COS-01-NFR-012 — Internationalisation performance
Adding a locale MUST NOT increase base bundle by more than 8 KB gzipped (locales are lazy-loaded).

### COS-01-NFR-013 — Browser support
Latest two versions of Chrome, Edge, Safari, Firefox; iOS Safari 16+; no IE. WebGL2 required only for
3D previs and orb surfaces, with a non-WebGL fallback image.

### COS-01-NFR-014 — Mobile
Read, review, approve, comment, and job monitoring are supported at 390 px. Timeline editing and
spec authoring are desktop-only with an explicit notice.

### COS-01-NFR-015 — Determinism requirements
Same inputs + same seed + same provider version produce identical output for deterministic capabilities.
Provider non-determinism is disclosed in provenance with model version and any seed used.

### COS-01-NFR-016 — Test performance budgets
Full unit suite under 90 s; integration under 6 min; e2e smoke under 5 min; CI total under 15 min.

### COS-01-NFR-017 — Accessibility of motion
Any pulse or particle effect must have a static alternative. Generating states may pulse, but MUST NOT
flash faster than 3 Hz.

### COS-01-NFR-018 — Data residency
Workspace may select a region; assets stay in region; cross-region processing requires consent flag.

---

## 11. I18N, LOCALISATION, AND COPY

### COS-01-I18N-001 — Key format
`{area}.{component}.{element}` e.g. `studio.screenplay.empty.title`. No string concatenation for sentences.

### COS-01-I18N-002 — Pluralisation and gender
Use ICU message format; never build plurals with string suffix logic.

### COS-01-I18N-003 — Locale launch set
`en` at launch; `hi`, `es`, `fr`, `de`, `ja`, `pt-BR`, `ar` are required by Phase 5.
`ar` requires RTL layout support: mirrored rails, mirrored timeline, logical CSS properties only.

### COS-01-I18N-004 — Content language vs UI language
A project has its own `language` (dialogue language). UI locale is per user. Both are shown distinctly.

### COS-01-I18N-005 — Number, date, timecode formatting
Timecode `HH:MM:SS:FF` with project fps. Dates via `Intl.DateTimeFormat` in user timezone. Credits with
two decimals in workspace currency display, ledger in exact units internally.

### COS-01-I18N-006 — Dubbing and subtitle parity
Any dialogue artifact must be localisable without regenerating picture; the system stores per-language
dialogue and timing variants linked to the same scene.

---

## 12. ANALYTICS & TELEMETRY

### COS-01-ANA-001 — Event schema
```
{ event, ts, workspaceId, projectId?, userId, sessionId, props, v }
```
Client events are batched every 5 s or 20 events; failures drop silently with a counter.

### COS-01-ANA-002 — Required events (minimum)
| Event | Props |
|---|---|
| `project_created` | type, source (template|scratch|import) |
| `capability_invoked` | studioKey, capability, async, estimatedCost |
| `capability_succeeded` | capability, durationMs, actualCost, artifactId |
| `capability_failed` | capability, errorCode, providerKey |
| `artifact_approved` | artifactType, studioKey, gate |
| `gate_requested` / `gate_decided` | gate, waitingHours |
| `job_retried` | capability, attempt, errorCode |
| `generation_cost_recorded` | capability, credits, usd |
| `search_performed` | scope, queryLength, resultCount |
| `agent_run` | agentKey, steps, tokens, cost, outcome |
| `studio_opened` | studioKey, entryPoint |
| `export_completed` | preset, durationSec, qcResult |
| `lesson_completed` | courseKey, lessonKey, score |

### COS-01-ANA-003 — Funnel definitions
| Funnel | Steps |
|---|---|
| Activation | project_created → idea_promoted → beat_sheet_approved → first_scene_written |
| Visual | look_bible_approved → first_shot_spec → first_generated_shot → first_approved_shot |
| Completion | first_cut → picture_lock → export_completed |

### COS-01-ANA-004 — Dashboards required
Cost per finished minute, generation success rate by capability, gate latency, studio adoption,
continuity findings per project, capability latency p95.

### COS-01-ANA-005 — Privacy in telemetry
No artifact text, no prompts, no asset filenames. Only IDs, counts, durations, costs, enum values.

---

## 13. CONTENT POLICY (PRODUCT-LEVEL SUMMARY)

### COS-01-POL-001 — Allowed
Fictional narrative of any genre including violence, horror, and mature themes when the project carries
an appropriate content rating; documentary treatment of real events; satire; education.

### COS-01-POL-002 — Blocked
Sexual content involving minors; non-consensual intimate imagery; real-person likeness or voice without an
active consent record; operational instructions for mass harm; content that targets protected groups.

### COS-01-POL-003 — Restricted with controls
Graphic violence requires a project rating above the default; real-person documentary likeness requires
consent documentation; medical/legal/financial claims require an "unverified" flag.

### COS-01-POL-004 — Enforcement flow
Input moderation → block with explainable reason and appeal path; output moderation → discard asset,
write `quality_reports(policy)`, notify; repeated blocks escalate to workspace review.

### COS-01-POL-005 — Appeal
A blocked user sees the reason category, not the internal classifier detail, and can request human review.
Review SLA: 72 h.

---

## 14. GLOSSARY (EXTENDED)

### COS-01-GLO-001 — Core terms
| Term | Definition |
|---|---|
| Artifact | versioned creative object (JSON body) produced by a studio capability |
| Asset | binary or generated media with metadata, versions, and rights |
| Canon | approved, locked truth for a universe; other works must comply |
| Capability | atomic action exposed by a studio |
| Continuity lock | constraints (identity, wardrobe, location, lighting, direction) that must hold across shots |
| Cost hold | credits reserved at queue time, settled when the job terminates |
| Deliverable | packaged output for a destination preset |
| Gate | human approval checkpoint blocking dependent work |
| Identity descriptor | numeric or embedding representation of a character's appearance used for drift scoring |
| Job | a unit of asynchronous work calling a provider |
| Look bible | the project's visual grammar: palette, texture, light, composition, movement |
| Provenance | record of who/what produced an artifact and from which inputs |
| Run | one model invocation with payloads, tokens, latency, cost |
| Shot spec | 18-field structured definition of a shot including generation prompt |
| Stale | downstream artifact whose upstream dependency changed since it was produced |
| Studio | disciplinary workspace module registered by key |
| Universe | top-level container of canon and franchises |
| Workspace | tenant boundary containing members, projects, providers, and billing |

### COS-01-GLO-002 — Craft terms used in the product
| Term | Definition |
|---|---|
| Beat | smallest unit of story change |
| Coverage | the set of shot sizes and angles that allow a scene to be cut |
| Eighths | page fractions used for screen time estimation |
| Motivated light | light justified by an in-world source |
| Screen direction | the consistent left/right orientation of subjects across cuts |
| Subtext | meaning conveyed under the literal dialogue |
| Plant / payoff | setup and its later resolution |
| Tension curve | numeric series of dramatic pressure per scene |

### COS-01-GLO-003 — Technical terms used in the product
| Term | Definition |
|---|---|
| Idempotency key | hash that collapses duplicate job submissions |
| Keyset cursor | pagination token based on last sort key |
| RLS | row-level security policy enforced by the database |
| Signed URL | time-limited URL granting object access |
| Soft delete | marking a row deleted while retaining data for restore |
| Stem | isolated audio component of a mix |
| Stripe (of a job) | one provider call inside a compound job |

---

## 15. DECISION LOG (V01)

### COS-01-DEC-001 — Simple default, expert optional
Every form ships at "standard" depth with an "advanced" toggle; experts are never blocked, beginners are
never confronted. Rationale: resolves persona conflict COS-01-PER-009.

### COS-01-DEC-002 — Studio-first navigation over capability-first
Users navigate by discipline, not by action list. Rationale: professionals search by department.

### COS-01-DEC-003 — Cost visibility is not optional
Estimate before, actual after, always. Rationale: trust and adoption (COS-01-MKT-015).

### COS-01-DEC-004 — Gates default to self-approval for solo projects
A single-member workspace approves its own gates with one click; the audit trail still records it.

### COS-01-DEC-005 — No autoplay with sound
Video previews start muted with controls; sound requires explicit play. Rationale: accessibility and
professional review etiquette.

### COS-01-DEC-006 — Mobile is review-first
Timeline editing and spec authoring are desktop-only at v1 to avoid a compromised craft experience.

### COS-01-DEC-007 — Progressive generation warnings
If a shot lacks a required lock, the UI offers "create lock" inline rather than a dead end. Rationale:
converts a block into a next step.

---

## 16. V01 COMPLETION CHECKLIST

| # | Requirement | Status |
|---|---|---|
| 1 | 9 personas with goals, pains, JTBD, metrics, anti-needs | complete |
| 2 | 6 journeys with steps, writes, gates, failure modes | complete |
| 3 | 40 routes with shell, auth, primary element | complete |
| 4 | Design tokens, motion, status semantics, 24-component inventory | complete |
| 5 | Service map, trust boundaries, request/read/realtime/offline rules | complete |
| 6 | 18 NFRs with numeric thresholds | complete |
| 7 | i18n, analytics events, policy, glossary, decision log | complete |
| 8 | Every requirement has a verification path | complete |


