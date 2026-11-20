# Foundation Path — Engine & Curriculum Audit

Audit date: 2026-11-18 · Scope: the proposed **ConsciousOS Foundation Path — 118 Days**
against what the repository actually implements.
Companion: `docs/FOUNDATION_PATH_118_DAYS.md` (the day-by-day plan).

---

## 1. Verdict

The app already contains most of the raw material — a complete 118-day curriculum, a
V-Level engine, a composition engine, a practice bank, evidence/completion plumbing and a
deep report generator. What it does **not** contain is the thing the spec is actually about:
**one adaptive engine that decides the day.**

Today the Foundation Path is **five disconnected fragments**:

| Fragment | Where it lives | State |
|---|---|---|
| 118-day curriculum (8 phases, 3 parts/day) | `src/data/foundation-course/**` | Complete, high quality, **not adaptive** |
| V-Level engine (0–8 value, 10 bands, 4 dimensions) | `src/lib/shared/vLevel.ts`, `vLevelCore.ts` | Strong, tested, **not used by the curriculum** |
| Adaptive day generator (100-day, sentiment keywords) | `src/lib/adaptiveJourneyEngine.ts` | Works, **used only by `temple/JourneyChat`** |
| Placement + path affinity (6 traditions) | `src/lib/onboarding/foundationAnalyzer.ts` | Produces band/brain/loops/path scores, **consumed by onboarding only** |
| Progression gate (7-day chapters, 20 gates) | `src/lib/dailyProgressionGate.ts` | Live on Home, **structurally inconsistent with 118 days** |
| Graduation report (60 sessions + 32 mirrors) | `supabase/functions/graduation-deep-analysis` | Real, **but not the Day-118 report** |

**Verdict: B — the parts are strong, the system is absent.** Three of the twelve
specified behaviours cannot be demonstrated end-to-end today: adaptive depth, adaptive
sequencing, and the Day-118 report.

---

## 2. What exists (inventory + evidence)

| Capability | Implementation | Evidence |
|---|---|---|
| 118-day curriculum, 118/118 days | `src/data/foundation-course/days/phase1..8` | 118 unique day entries, no gaps, no duplicates |
| 8 phase definitions | `src/data/foundation-course/phases.ts` | days 1–14, 15–30, 31–45, 46–60, 61–75, 76–90, 91–105, 106–118 |
| Day shape | `CourseDayCurriculum` in `types.ts` | `morningTeaching`, `dayPractice`, `eveningIntegration`, `dimension`, `relatedConcepts` |
| Enrollment + 3 completion flags | `src/hooks/useFoundationCourse.ts:67-69` | `knowledge_read`, `practice_done`, `reflection_text` |
| V-Level math (client) | `src/lib/shared/vLevel.ts:197` | clamped to 0–8.0; band = floor; micro-level entering/deepening/mastery |
| V-Level math (server parity) | `supabase/functions/_shared/vLevel.ts` + `src/lib/consciousness/vLevelCore.ts` | `vlevel-parity.test.ts` exists |
| Placement analysis | `src/lib/onboarding/foundationAnalyzer.ts` | band, brainScores, loops, loopRoot, `pathAffinity`, archetypes |
| Path catalogue (6 traditions) | `src/lib/onboarding/foundationQuestions.ts:22`, `pathDefinitions.ts` | kriya, karma, bhakti, jnana, tantra, dhyana |
| Adaptive generator | `src/lib/adaptiveJourneyEngine.ts:234` | `generateAdaptiveDay(profile, masterName)`; 20-theme rotation + sentiment keywords |
| Session composition | `src/lib/session-framework/**`, `src/lib/session-shell/**` | 21 step batches, framework selector, validation |
| Practice selection | `src/lib/practice-bank/**`, `src/lib/prescription/**` | recommendation, durations, media, STT |
| Daily wisdom / missions | `src/lib/consciousness/dailyWisdom.ts`, `dailyMissions.ts` | typed cards + missions with `adaptationReason` |
| Progression gate | `src/lib/dailyProgressionGate.ts:38` | `CHAPTER_SIZE = 7`, 20 gate names cycling |
| Evidence + completion | `src/lib/session/completion.ts`, `unifiedSessionCompletion.ts`, `offlineQueue.ts` | artifact + offline queue |
| Deep report | `supabase/functions/graduation-deep-analysis/index.ts` | fuses mirrors + sessions + journals + loops + memory |
| Routing | `src/App.tsx:487` | `/app/foundation` exists, marked legacy, **not linked in nav** |

---

## 3. Gap analysis against the spec

### P0 — blocks the promise

**P0-1. The Foundation Path is not reachable.**
`/app/foundation` is mounted at `src/App.tsx:487` under a comment calling it a "Legacy
118-day curriculum kept reachable but not linked". Home variants import
`useFoundationCourse` (`HomeV3`, `HomeV4`, `ConsciousOSHome`) but the canonical `/app`
route renders `Home`. A user cannot enroll from the product's primary surface.
→ *Spec §1 cannot be evaluated.*

**P0-2. No V-Level → depth mapping.**
Zero references to `vLevel`/`v_level` inside `src/data/foundation-course/**`,
`pages/FoundationCourse.tsx`, or `hooks/useFoundationCourse.ts`. A V0 and a V5 user receive
byte-identical Day 50 content.
→ *Spec §4 ("same theme, different depth") is unimplemented.*

**P0-3. No Day-118 report.**
`graduation-deep-analysis` is scoped to "32 mirrors + 60 sessions" and keyed to
`graduation_reports`. There is no foundation-scoped report, no start-vs-current profile, no
V-Level history, no evidence separation (participation vs self-report vs demonstrated change).
→ *Spec §8 is unimplemented.*

**P0-4. The "adaptive engine" is disconnected and not adaptive in the required sense.**
`generateAdaptiveDay` is imported only by `src/components/temple/JourneyChat.tsx:10`; it
models a 100-day journey (`UserProfile.totalDays`), rotates 20 hardcoded themes, and adapts
on keyword sentiment + streak + missed days. It never reads the 118-day curriculum, the
V-Level, the path affinity, or loop data.
→ *Spec §2 Layer B and §6 rules are not enforced anywhere.*

### P1 — breaks the specified journey

**P1-1. Path model conflates two different things.**
The spec defines four product-level adaptive paths (Observer, Inquirer, Integrator,
Devotional) and explicitly says they are **not** replacements for Raja/Jnana/Bhakti/Karma.
The code has six tradition IDs (`kriya, karma, bhakti, jnana, tantra, dhyana`) with no
product-level layer. Any UI that labels a user "Jnana" misstates both.
→ *Spec §3 needs a mapping layer, not a rename.*

**P1-2. Day model has 3 components; the spec defines 7.**
`CourseDayCurriculum` = teaching + day practice + evening integration. The spec's
Daily Wisdom / Guided Experience / Observation / Self-Inquiry / Real-Life Mission /
Night Reflection / Integration are not represented as separate, evidence-producing parts.
`dayPractice.checkpoints` is the closest thing to missions, and nothing records mission
completion.

**P1-3. Progression chapters are hardcoded to 7 days.**
`dailyProgressionGate.ts:38` (`CHAPTER_SIZE = 7`) and 20 cycling gate names produce
"Chapter XVII" on day 113, which contradicts the 12-chapter Foundation Path. Two chapter
models will diverge the moment either changes.

**P1-4. Persistence captures compliance, not learning.**
`program_day_progress` stores three booleans and a reflection string
(`useFoundationCourse.ts:67-69`). There is no record of: which component was completed,
which depth variant was served, which practice was chosen, what artifact was produced, or
what changed in the four dimensions.

**P1-5. Curriculum is indexed in four places.**
`foundation-course/index.ts`, `data/graph/nodes.ts:270`, `data/graph/edges.ts:293`,
`lib/knowledge-graph/index.ts:275`, and `lib/promptDirector.ts:175` all walk
`FOUNDATION_CURRICULUM`. Adding adaptation to one without the others creates silent drift.

**P1-6. Overlapping entry products.**
`/app/first-eleven`, `/app/awakening`, `/app/spiral`, `/app/foundation` and `/app/mirrors`
each claim to be the beginning. There is no declared contract for what a new user does on
day one, so the adaptive engine has no single owner of "day 1".

### P2 — quality and safety

**P2-1.** Chapters cannot be revisited by design; the curriculum is read-only by day.
**P2-2.** No time/energy adaptation in the Foundation Path (the only such logic lives in the
unused `adaptiveJourneyEngine`).
**P2-3.** `checkBypassingRisk` exists in the V-Level module but is not enforced before
advanced inquiry days (76–90 in the current curriculum).
**P2-4.** Guru/tradition content has no attribution or cultural-review gate.
**P2-5.** Foundation day content is bundled, not cached for offline daily use.

---

## 4. Target architecture (reuse, don't rebuild)

One new module owns the decision; everything else is reused as-is.

```text
src/lib/foundation/
  index.ts                # public API
  depth.ts                # V-Level + chapter → depth variant (0..3)
  paths.ts                # 6 traditions → 4 adaptive paths (many-to-many, weighted)
  composeDay.ts           # curriculum day + depth + path + time → DayPlan (7 components)
  evidence.ts             # component completion → evidence records
  report.ts               # Day 118 report assembly (client view model)
  rules.ts                # the 12 curriculum rules, as executable guards
  types.ts
```

### The one function everything calls

```ts
getFoundationDay(input: {
  day: number;                        // 1..118
  vLevel: VLevel;                     // from computeVLevel / profile
  pathAffinity: Record<PathId, number>;
  adaptivePath: "observer" | "inquirer" | "integrator" | "devotional";
  loops: Array<{ id: string; severity: string }>;
  minutesAvailable: 3 | 10 | 20 | 40;
  energy: "low" | "medium" | "high";
  recentEvidence: EvidenceRecord[];
}): FoundationDayPlan
```

`FoundationDayPlan` returns:

```ts
{
  day, chapter, theme, outcome,
  depth: 0 | 1 | 2 | 3,
  components: Array<{
    kind: "wisdom" | "guided" | "observation" | "inquiry" | "mission" | "night" | "integration";
    minutes: number;
    payload: unknown;             // resolved from existing catalogs
    evidenceTarget: string;
  }>,
  exploration?: {                 // Layer C, optional, never blocking
    kind: "neti-neti" | "guru" | "civilization" | "text" | "v-level";
    ref: string;
  },
  gate: ProgressionGate,          // from dailyProgressionGate, fed 12-chapter context
  sessionPlan: SessionPlan,       // from session-shell, ready to run
}
```

### Depth rule (spec §4, made executable)

| V band | Depth | Behaviour on the same day |
|---|---|---|
| 0–1 | 0 | Name the experience. 3–8 min. One instruction. No philosophy. |
| 2 | 1 | Describe transitions. 10 min. Two instructions + one checkpoint. |
| 3–4 | 2 | Observe the observer. 15–20 min. Inquiry prompt + mission. |
| 5–6 | 3 | Philosophical inquiry. 20–30 min. Text, contradiction, Neti-Neti. |
| 7+ | 3 | Same content, greater silence and less scaffolding. |

### Adaptive path mapping (spec §3, without erasing traditions)

| Product path | Weighted traditions (`pathAffinity`) | Emphasis |
|---|---|---|
| Observer | dhyana, raja (via `kriya`/`dhyana`) | attention, witness, stillness |
| Inquirer | jnana | discrimination, self-inquiry, texts |
| Integrator | karma | behaviour, missions, repair |
| Devotional | bhakti | remembrance, surrender, gratitude |

Mapping is a *recommendation layer*: it changes which optional exploration is offered and
which examples are used. It never removes a foundational outcome.

### Data model delta (additive, no rewrite)

`program_day_progress` already exists. Add:

```sql
alter table program_day_progress
  add column if not exists depth_variant smallint default 0,
  add column if not exists adaptive_path text,
  add column if not exists components jsonb default '{}'::jsonb,
  add column if not exists evidence jsonb default '[]'::jsonb,
  add column if not exists artifact_url text;
```

Day 118 report reads from `program_enrollments`, `program_day_progress`, `sessions`,
`journal_entries`, `loop_*`, and the V-Level history — the same sources
`graduation-deep-analysis` already joins.

---

## 5. Remediation order

| Step | Work | Closes |
|---|---|---|
| 1 | Mount the Foundation Path as the canonical first-run destination; keep `/foundation` as an alias | P0-1, P1-6 |
| 2 | Add `src/lib/foundation/depth.ts` + wire V-Level into day selection | P0-2 |
| 3 | Replace `CHAPTER_SIZE = 7` with a 12-chapter source of truth shared by gate + curriculum | P1-3 |
| 4 | Add the 7-component composer and evidence records | P1-2, P1-4 |
| 5 | Add `paths.ts` as a mapping layer; never rename traditions in UI | P1-1 |
| 6 | Retire or wrap `adaptiveJourneyEngine` so only one adaptive engine exists | P0-4 |
| 7 | Build the Day-118 report from evidence, separating the three evidence classes | P0-3 |
| 8 | Enforce `checkBypassingRisk` before inquiry days | P2-3 |
| 9 | Single curriculum index; delete the duplicate walkers | P1-5 |
| 10 | Chapter revisit + offline day cache | P2-1, P2-5 |

---

## 6. Acceptance tests (must exist before calling this done)

1. **Depth differentiation** — same day + two V-Levels produces different `minutes`,
   `depth`, and inquiry text; identical foundational outcomes.
2. **Path differentiation** — two adaptive paths on the same day differ only in examples
   and optional exploration, never in required concepts.
3. **Rule guard** — completing a session does not advance the day unless the evidence
   threshold for that chapter is met (`rules.ts`).
4. **Struggle loop** — a failed/abandoned session re-serves the concept with a shorter
   variant before advancing.
5. **Gate parity** — chapter/phase labels come from the same 12-chapter table everywhere.
6. **Evidence integrity** — participation, self-report, and demonstrated behaviour are
   stored and reported separately.
7. **Safety** — advanced inquiry cannot be served when `checkBypassingRisk` is true.
8. **Day 118** — report generates from real data with no AI dependency for its numbers.
9. **Offline** — today's plan is available with no network.
10. **No orphan entry** — exactly one route starts a new user's foundation day.

---

## 7. What not to rebuild

- `session-shell` / `session-framework` (step catalog, validation, transitions)
- `vLevelCore` / `shared/vLevel` math and the parity test
- `practice-bank` and `prescription` selection
- `session/completion` + `offlineQueue` evidence plumbing
- `dailyWisdom`, `dailyMissions`, `dailyGates` card/mission types
- `graduation-deep-analysis` prompt and caching pattern (reuse for the 118-day report)
