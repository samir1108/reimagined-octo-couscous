# 1. Bands & V-Level System

**Core files:** `src/types/consciousness.ts`, `src/lib/consciousness/vLevelCalculator.ts`, `src/lib/consciousness/*`

### 1.1 Overview

ConsciousOS models a user's spiritual/psychological development as a single continuous number — the **V-Level** — that ranges from `0.0` to `10.0`. The integer part is the **Band** (11 primary bands, 0–10); the fractional part places the user into one of three **micro-levels** within that band (`entering`, `deepening`, `mastery`). Practically, this gives the system **33 addressable sub-stages** (11 bands × 3 micro-levels), which is the likely source of "22 bands" language elsewhere in product materials if counting only the 6 "human journey" bands (0–6) at 3 micro-levels plus a compressed treatment of the "beyond" bands, or if two extra half-steps are tracked per band in some engines (e.g. `dailyGates.ts`/`practiceEngine.ts` use finer 0.1 increments). The authoritative type definition is the 11-band / 3-micro-level system below.

### 1.2 The 11 Bands (Band Archetypes)

Each band has a name, a core self-state ("I AM my thoughts"), a central struggle, an "engine approach" (how the AI should behave toward a user at that level), and three micro-level labels for entering/deepening/mastery sub-stages.

| Band | Name | Core State | Struggle | Engine Approach |
|---|---|---|---|---|
| 0 | The Sleeper | "I AM my thoughts." | Reactive, victim mindset | Stabilize nervous system (breath, mood tracking, validation) |
| 1 | The Questioner | "Maybe I'm NOT my thoughts." | Frustration loop | Validate & label |
| 2 | The Observer | "I CAN be the observer." | Sustainability | Micro-interventions (3-second pause) |
| 3 | The Alchemist | "Pain is a teacher." | Purge phase | Direct guidance ("This isn't failure, this is purging") |
| 4 | The Navigator | "I can choose." | Fear of freedom | Celebration & push |
| 5 | The Architect | "I create my reality." | Final control struggle | Surrender nudge |
| 6 | The Channel | "Life lives ME." | Flow state maintenance | Silence & presence (minimal words) |
| 7 | The Rishi | Turiya — 24/7 awareness | None — pure being | Peer-level, no teaching — mutual exploration |
| 8 | The Jagadguru | Universal compassion | None | Silent presence |
| 9 | The Avatar | Cosmic consciousness | None | Beyond app scope |
| 10 | The Absolute | Shunya — Only ONE exists | None | Beyond app scope |

Bands 0–6 are flagged `isHumanJourney: true` — these are the bands the product actively coaches users through. Bands 7–10 are transpersonal/mystical states the app acknowledges but does not claim to "train" (engine approach explicitly says "Beyond app scope" for 9 and 10).

Each band carries **three micro-labels**, e.g. Band 0 → `['Deep Sleep', 'Awakening Spark', 'The Seeker']`; Band 3 → `['Transformer', 'Loop Breaker', 'Golden Alchemist']`. This naming system turns a cold numeric scale into a narrative identity ladder users can recognize themselves in ("I'm a Loop Breaker") — a distinctive piece of brand IP layered on top of the numeric model.

### 1.3 Micro-Levels (x.0 / x.5 / x.9)

`MICRO_BANDS` defines three named sub-phases within any band:

- **🌱 Entering** (suffix `.0`) — "High support, small tasks, less freedom"
- **🌿 Deepening** (suffix `.5`) — "Balanced, cross-pollination starts"
- **🌳 Mastery** (suffix `.9`) — "Minimal guidance, user leads"

The calculator (`vLevelCalculator.ts`) buckets the fractional remainder of the V-Level score: `< 0.3` → entering, `0.3–0.7` → deepening, `≥ 0.7` → mastery. This isn't a literal `.0/.5/.9` snap-to-value system in the runtime math (the real math is continuous), but the three UX labels are always derived from those thresholds, letting copy and UI adapt automatically as the user's score drifts.

This 3-phase micro-model is what governs **how much the AI hand-holds**: entering-phase users get small, explicit, low-risk tasks; deepening-phase users get more autonomy and get exposed to "cross-pollination" (practices/masters outside their primary path); mastery-phase users get minimal scaffolding, because they are expected to self-direct.

### 1.4 The Six-Dimension Model

Rather than a single opaque score, V-Level is composed from **6 dimensions** of consciousness, defined in `DIMENSIONS`:

| Dimension | Label | Focus | Max Band | Primary? |
|---|---|---|---|---|
| `thought` | Thought (Mind) | Clarity of thinking, cognitive patterns, belief structures | 7 | ✅ |
| `emotion` | Emotion (Heart) | Emotional intelligence, regulation, depth of feeling | 7 | ✅ |
| `body` | Body (Gut/Instinct) | Somatic awareness, energy sensitivity, physical intuition | 7 | ✅ |
| `action` | Action (Karma) | Integrity of action, values-behavior alignment | 7 | Integration |
| `connection` | Connection (Relational) | Depth of relationships, empathy, community | 7 | Integration |
| `spirit` | Spirit (Awareness) | Pure awareness, witness consciousness, non-dual perception | 10 | ✅ |

**Primary dimensions** (`thought`, `emotion`, `body`, `spirit`) drive the core score. **Integration dimensions** (`action`, `connection`) act as a multiplier layer, not raw score inputs — the idea being that insight without embodied action/relationship is discounted, and vice-versa. `spirit` alone is allowed to run to Band 10, reflecting that transpersonal states exceed what the "human journey" bands can describe, while the other five dimensions cap at Band 7 (roughly matching the human-journey ceiling, Band 6, plus one buffer band).

### 1.5 V-Level Calculation Algorithm

`calculateVLevel()` in `vLevelCalculator.ts`:

1. Take the 4 primary dimension scores (`thought`, `emotion`, `body`, `spirit`), floor each at `0.01` to avoid a zero collapsing the product.
2. Compute the **geometric mean** of the 4 primary scores. Geometric mean (rather than arithmetic mean) is a deliberate design choice: a user who is very high in `spirit` but near-zero in `body` gets pulled down hard, because the geometric mean punishes imbalance far more than an average would. This directly encodes the anti-bypassing philosophy: no dimension can "carry" the others.
3. Compute an **integration multiplier** from the average of `action` and `connection`, scaled into the range `0.9–1.1`. Strong integration nudges the score up to +10%; weak integration drags it down to -10%.
4. Multiply geometric mean × integration multiplier = raw V-Level.
5. **Calibration cap**: if the user is within their first 30 days (`CALIBRATION.durationDays`), the raw value is hard-capped at `1.0` — i.e. no one can be assessed above Band 1 during onboarding, regardless of what they self-report. This prevents inflated self-assessment ("I'm basically enlightened") from skipping the foundational work.
6. Clamp to `[0, 10]`, round to one decimal.
7. Derive `band = floor(value)` and `microLevel` from the fractional remainder as described above.

### 1.6 Speed Profiles

Because raw session-count isn't a fair way to compare users, the system classifies users into three **speed profiles**, each with different sessions-per-level norms, risk factors, and protective interventions:

| Profile | % of users | Sessions/Level | Risk | Protection |
|---|---|---|---|---|
| Fast Tracker | ~15% | 5–7 | Skipping depth, intellectualizing | "Slow down. Feel it, don't just understand it." |
| Steady Walker | ~65% | 8–14 | Plateauing, losing motivation | Cross-pollination, new guru, variety |
| Deep Digger | ~20% | 15–25 | Guilt, feeling "behind", quitting | Extra support, gentler practices, elder returns |

`detectSpeedProfile()` infers the profile from a rolling average of sessions-per-level and average quality score; `LIFETIME_CONVERGENCE` even models a 10-year projection (year 1 / year 5 / year 10 expected V-Level) per profile, showing that ConsciousOS is explicitly designed around the idea that **all three profiles converge to roughly the same place by year 10** (6.9–7.1) — a strong anti-competition, anti-comparison design signal baked directly into the data model.

### 1.7 Level-Up Criteria & Quality Tracks

`shouldLevelUp()` evaluates three tracks against `(recentQuality, consistency streak, sessionsAtLevel)`:

- **Fast track**: quality ≥ 0.8, consistency ≥ 5, sessions ≥ 5 → can skip a level (`canSkip: true`).
- **Normal track**: quality ≥ 0.6, consistency ≥ 3, sessions ≥ 8 → linear level-up.
- **Slow track**: quality ≥ 0.4, consistency ≥ 1, sessions ≥ 15 → linear level-up, more patient.
- **Struggling**: none of the above met → stay at current level (99 sessions "required," effectively "no automatic promotion").

`QUALITY_RANGES` gives the plain-English framing for each score band: Struggling (0–0.3, "stay, adjust approach"), Learning (0.3–0.6), Ready (0.6–0.8, "level up"), Mastered (0.8–1.0, "can skip to +2").

### 1.8 State vs. Skill Matrix — Bypassing Detection

The `STATE_SKILL_RULES` table encodes four guard-rails that prevent the AI from over-rewarding intellectual/skill progress that has outpaced lived embodiment:

1. **Spiritual Bypassing** — if `skill > state` by 2+ levels, assign a grounding practice (body/emotion work). Implemented programmatically as `checkBypassingRisk(skillLevel, stateBand)` in `vLevelCalculator.ts`, which returns `{ isBypassing, gap, recommendation }`.
2. **Foundation First** — Observation & Breath skills must stay within 1 level of any other skill; advanced practices lock until foundational ones catch up.
3. **Heart > Head** — if `emotion` trails `thought` by 2+ levels, the system prioritizes Bhakti/feeling-based practices over cognitive ones.
4. **Integration Lock** — advanced techniques (Kriya, Neti-Neti) are locked if `body` or `emotion` scores are below Band 2, even if the user is intellectually "ready."

### 1.9 Anti-Guilt Design & Regression Handling

`ANTI_GUILT_MESSAGES` is a literal blocklist/allowlist of copy: the AI is never allowed to say "you're behind other users" or "you should be at Level X by now," and must instead reinforce "your pace is perfect for you" and the spiral metaphor ("In a spiral, you visit the same place twice. Depth is greater."). A "guilt detected" fallback line ("Bro, chill. This isn't a race.") and an automatic session-duration reduction (5 min → 2 min) for guilt-prone users are both defined as first-class product behavior in the type layer, not just prompt engineering.

`REGRESSION_POLICIES` governs what happens when a user's score drops (after a bad week, a relapse into an old loop, etc.):

- **No penalty** — level drops are allowed with no streak loss and no shaming copy.
- **Session credit kept** — prior sessions at that level still count toward requirements if the user returns.
- **Fewer sessions to return** — only 3 sessions at quality ≥ 0.7 are needed to re-earn a level, vs. the full original requirement (implemented via `sessionsToReturn()`, which returns `3` for high-quality returns or `max(3, floor(previousSessions * 0.4))` otherwise).
- **Spiral framing** — copy reinforces that revisiting a level is depth, not failure.
- **Warm-up after a gap** — `getWarmUpAdjustment(daysSinceLastSession)`: any gap of 3+ days triggers a temporary 0.5-level drop with a "we'll ease in gently" message, which self-corrects after just one session back.

### 1.10 Calibration Period

`CALIBRATION` defines a **30-day universal onboarding window** during which every user is capped at Band 1.0 regardless of computed score. The day-1 framing is literally titled "Meeting Yourself Where You Are." This exists to prevent both over-claiming (new user says they're "already awakened") and premature judgment, giving the system a month of real behavioral signal before it commits to a band assignment.

### 1.11 Supporting Consciousness Engines (`src/lib/consciousness/*`)

Beyond the core calculator, a family of specialized engines operationalizes the band model:

- **`quickBandDetector.ts`** — fast heuristic band estimation from a short onboarding quiz or early signals, used before enough session history exists for the full calculator.
- **`assessmentDetector.ts`** — parses assessment/quiz responses into dimension scores.
- **`dimensionTracker.ts`** — maintains and updates the 6-dimension score vector over time from session activity.
- **`dailyGates.ts`** — daily-practice gating logic (which practices/content a user is allowed to see today based on band, micro-level, and recent behavior).
- **`practiceEngine.ts`** — selects/sequences practices given the user's current state.
- **`sessionGenerator.ts`** — composes a session's content (script, practice, guide) from state.
- **`speedProfileEngine.ts`** — the runtime engine backing the `SpeedProfileType` classification and its adaptive interventions.
- **`retentionEngine.ts`** — models churn risk / re-engagement nudges tied to band and profile.
- **`lifeStageDetector.ts`** — infers life-stage context (career, relationship, health, etc.) to color content selection.
- **`lifetimeSpiral.ts`** — the long-horizon (multi-year) visualization/convergence model referenced by `LIFETIME_CONVERGENCE`.
- **`relationshipDepth.ts`** — tracks the user's relational/trust depth with their guide (separate axis from V-Level).
- **`dynamicGuruSelector.ts`** and **`masterRotation.ts`** — decide which guide/master to surface next based on band, dimension gaps, and variety needs.
- **`agents/`** and **`taxonomy/`** subfolders — presumably house LLM agent orchestration and the canonical taxonomy definitions referenced by the loop/practice systems (see Section 2–3).

Together, these files form a genuine **psychometric + behavioral engine**, not just a static content tree: dimension scores flow in from session/assessment data, get reduced to a single V-Level via the geometric-mean formula, gate which content is unlocked, and feed back into engagement/retention logic — all wrapped in an explicit "no shame, no race" ethical framing baked into constants rather than left to prompt discipline alone.

---
