# ConsciousOS — Integral Consciousness IP: 100-Dimension Taxonomy, Sub-Ladders, Loop Genomics, and Transformational Architecture

> **Purpose:** This document defines the next layer of proprietary IP — the fine-grained structure that sits between the existing 6-dimension model and the raw 100-dimension taxonomy, the sub-ladder progression system, and the loop clustering engine. It also proposes transformational system architectures that make the platform more integral, more adaptive, and harder to replicate.

---

## 0. The Architecture of This Document

```
6 PRIMARY DIMENSIONS
    └── 100 SUB-DIMENSIONS (taxonomy/dimensions100.ts — already exists, needs expansion)
            └── SUB-DIMENSIONAL LADDERS (new — each sub-dim gets its own progressive micro-ladder)
                    └── LOOP CLUSTER MAP (new — which sub-dims co-affect, which loops cluster, how they resolve)
                            └── TRANSFORMATIONAL SYSTEM LAYER (new — integral architecture: dynamic systems, not static content)
```

The existing 100-dimension taxonomy (`src/lib/consciousness/taxonomy/dimensions100.ts`) provides the *names*. This document provides the *progression ladders*, the *clustering mathematics*, and the *integral architecture* that makes the whole thing alive.

---

## 1. The 100-Dimension Taxonomy — Expanded and Operational

### 1.1 Current State

`dimensions100.ts` already maps 6 parent dimensions to 16 sub-dimensions each (96 total). This is a solid foundation. The expansion below brings it to exactly 100 by adding 4 missing sub-dimensions and completing each sub-dimension's metadata.

### 1.2 Expanded 100-Dimension Taxonomy

Each sub-dimension now carries:

```ts
interface SubDimension {
  id: string;                    // "emotion.grief"
  label: string;                 // "Grief"
  parent: DimensionId;           // "emotion"
  description: string;           // What this dimension measures
  ladder: SubLadder;             // Progressive micro-ladder (see §2)
  loopAffinities: string[];      // Which loops cluster here
  practiceAffinities: string[];  // Which practices move this sub-dim
  signalSources: SignalSource[]; // How the engine measures it
  maxBand: number;               // Max band for this sub-dim (inherits parent by default)
}
```

### 1.3 Full Expanded Taxonomy

#### THOUGHT (16 sub-dimensions)

| # | Sub-Dimension | ID | Description |
|---|---|---|---|
| 1 | Clarity | `thought.clarity` | Precision and lucidity of thinking; absence of fog |
| 2 | Belief Patterns | `thought.belief_patterns` | Flexibility vs rigidity of held beliefs |
| 3 | Inner Critic | `thought.inner_critic` | Volume and cruelty of self-critical voice |
| 4 | Mental Loops | `thought.mental_loops` | Frequency and stickiness of ruminative thought cycles |
| 5 | Decision Style | `thought.decision_style` | Quality and speed of decision-making |
| 6 | Memory Use | `thought.memory_use` | How memory serves vs distorts present experience |
| 7 | Attention Span | `thought.attention_span` | Sustained single-pointed attention duration |
| 8 | Cognitive Bias | `thought.cognitive_bias` | Awareness of and correction for thinking distortions |
| 9 | Mind Wandering | `thought.mind_wandering` | Unbidden drift away from intended focus |
| 10 | Self-Talk | `thought.self_talk` | Quality and tone of internal monologue |
| 11 | Curiosity | `thought.curiosity` | Openness to not-knowing and new information |
| 12 | Skepticism | `thought.skepticism` | Healthy doubt vs cynical rejection |
| 13 | Worry Index | `thought.worry_index` | Frequency and vividness of future-oriented anxiety |
| 14 | Planning | `thought.planning` | Constructive vs compulsive future-building |
| 15 | Perspective-Taking | `thought.perspective_taking` | Ability to hold multiple viewpoints simultaneously |
| 16 | Meta-Cognition | `thought.meta_cognition` | Thinking about thinking; awareness of one's own thought patterns |

**Parent max band:** 7
**Primary for V-Level:** Yes

#### EMOTION (16 sub-dimensions)

| # | Sub-Dimension | ID | Description |
|---|---|---|---|
| 1 | Range | `emotion.range` | Breadth of accessible emotional experience |
| 2 | Regulation | `emotion.regulation` | Ability to modulate intensity and duration |
| 3 | Awareness | `emotion.awareness` | Recognizing emotions as they arise |
| 4 | Expression | `emotion.expression` | Authentic outward expression of feeling |
| 5 | Empathy | `emotion.empathy` | Sensing and resonating with others' emotions |
| 6 | Joy | `emotion.joy` | Capacity for unforced, present-moment delight |
| 7 | Grief | `emotion.grief` | Capacity to feel and process loss |
| 8 | Anger | `emotion.anger` | Healthy assertion vs destructive rage or suppression |
| 9 | Fear | `emotion.fear` | Relationship with uncertainty and threat |
| 10 | Shame | `emotion.shame` | Relationship with self-judgment and exposure |
| 11 | Compassion | `emotion.compassion` | Active care arising from suffering-recognition |
| 12 | Vulnerability | `emotion.vulnerability` | Willingness to be open to hurt |
| 13 | Boundaries | `emotion.boundaries` | Capacity to hold limits with kindness |
| 14 | Mood Stability | `emotion.mood_stability` | Consistency of baseline emotional tone |
| 15 | Emotional Honesty | `emotion.emotional_honesty` | Alignment between felt experience and expressed experience |
| 16 | Heart Openness | `emotion.heart_openness` | Generalized receptivity and warmth |

**Parent max band:** 7
**Primary for V-Level:** Yes

**Sub-dimensional ladder structure (example — emotion.grief):**

```
BAND 0 — "Numbed"
  x.0: Cannot name grief; body goes blank when loss approaches
  x.5: Grief surfaces as fatigue, withdrawal, or numbness
  x.9: Can identify "something is heavy" but cannot name it

BAND 1 — "Avoiding"
  x.0: Grief arrives but is immediately pushed down
  x.5: Brief acknowledgment followed by distraction
  x.9: Can sit with grief for 1-2 minutes before seeking relief

BAND 2 — "Witnessing"
  x.0: Notices grief as a passing weather system
  x.5: Can allow grief to move through without adding secondary stories
  x.9: Sustained witnessing; grief is felt but not identified as self

BAND 3 — "Processing"
  x.0: Grief is explored through body sensation first
  x.5: Narrative layer of grief is seen clearly; old losses surface
  x.9: Grief becomes a teacher; old losses are integrated

BAND 4 — "Integrating"
  x.0: Grief is no longer a disruption but a signal
  x.5: Loss is reframed within larger life narrative
  x.9: Grief and joy coexist; loss deepens capacity for love

BAND 5 — "Transcending"
  x.0: Grief is recognized as universal human experience
  x.5: Compassion for all suffering arises from personal grief
  x.9: Grief becomes a gateway to universal sorrow and universal love

BAND 6 — "Non-Dual"
  x.0: Grief and its opposite are seen as one movement
  x.5: Loss and gain are understood as the same event
  x.9: Grief is fully embraced as the price and proof of love
```

#### BODY (16 sub-dimensions)

| # | Sub-Dimension | ID |
|---|---|---|
| 1 | Energy | `body.energy` |
| 2 | Sleep | `body.sleep` |
| 3 | Tension | `body.tension` |
| 4 | Breath | `body.breath` |
| 5 | Posture | `body.posture` |
| 6 | Hunger Cues | `body.hunger_cues` |
| 7 | Movement | `body.movement` |
| 8 | Rest Quality | `body.rest_quality` |
| 9 | Sensory Awareness | `body.sensory_awareness` |
| 10 | Nervous System Tone | `body.nervous_system_tone` |
| 11 | Gut Signals | `body.gut_signals` |
| 12 | Sexual Energy | `body.sexual_energy` |
| 13 | Pain Awareness | `body.pain_awareness` |
| 14 | Vitality | `body.vitality` |
| 15 | Embodiment | `body.embodiment` |
| 16 | Somatic Memory | `body.somatic_memory` |

**Parent max band:** 7
**Primary for V-Level:** Yes

#### ACTION (16 sub-dimensions)

| # | Sub-Dimension | ID |
|---|---|---|
| 1 | Integrity | `action.integrity` |
| 2 | Discipline | `action.discipline` |
| 3 | Procrastination | `action.procrastination` |
| 4 | Follow-Through | `action.follow_through` |
| 5 | Risk | `action.risk` |
| 6 | Patience | `action.patience` |
| 7 | Service | `action.service` |
| 8 | Effort | `action.effort` |
| 9 | Habit Strength | `action.habit_strength` |
| 10 | Recovery | `action.recovery` |
| 11 | Conflict Style | `action.conflict_style` |
| 12 | Generosity | `action.generosity` |
| 13 | Reactivity | `action.reactivity` |
| 14 | Initiative | `action.initiative` |
| 15 | Courage | `action.courage` |
| 16 | Restraint | `action.restraint` |

**Parent max band:** 7
**Primary for V-Level:** No (integration multiplier)

#### CONNECTION (16 sub-dimensions)

| # | Sub-Dimension | ID |
|---|---|---|
| 1 | Intimacy | `connection.intimacy` |
| 2 | Trust | `connection.trust` |
| 3 | Listening | `connection.listening` |
| 4 | Repair | `connection.repair` |
| 5 | Belonging | `connection.belonging` |
| 6 | Solitude Tolerance | `connection.solitude_tolerance` |
| 7 | Family Bond | `connection.family_bond` |
| 8 | Friendship Depth | `connection.friendship_depth` |
| 9 | Romantic Bond | `connection.romantic_bond` |
| 10 | Community | `connection.community` |
| 11 | Conflict Repair | `connection.conflict_repair` |
| 12 | Forgiveness | `connection.forgiveness` |
| 13 | Receiving Love | `connection.receiving_love` |
| 14 | Giving Love | `connection.giving_love` |
| 15 | Witnessing Others | `connection.witnessing_others` |
| 16 | Being Seen | `connection.being_seen` |

**Parent max band:** 7
**Primary for V-Level:** No (integration multiplier)

#### SPIRIT (20 sub-dimensions — expanded from 16)

| # | Sub-Dimension | ID |
|---|---|---|
| 1 | Witness | `spirit.witness` |
| 2 | Surrender | `spirit.surrender` |
| 3 | Devotion | `spirit.devotion` |
| 4 | Awe | `spirit.awe` |
| 5 | Silence | `spirit.silence` |
| 6 | Non-Dual Glimpses | `spirit.non_dual_glimpses` |
| 7 | Faith | `spirit.faith` |
| 8 | Mystery | `spirit.mystery` |
| 9 | Death Awareness | `spirit.death_awareness` |
| 10 | Cosmic Sense | `spirit.cosmic_sense` |
| 11 | Ego Loosening | `spirit.ego_loosening` |
| 12 | Presence | `spirit.presence` |
| 13 | Meaning | `spirit.meaning` |
| 14 | Sacred Sense | `spirit.sacred_sense` |
| 15 | Inner Stillness | `spirit.inner_stillness` |
| 16 | Transcendence | `spirit.transcendence` |
| 17 | Gratitude Depth | `spirit.gratitude_depth` | *(NEW)*
| 18 | Surrender Capacity | `spirit.surrender_capacity` | *(NEW — renamed from generic surrender)*
| 19 | Paradox Tolerance | `spirit.paradox_tolerance` | *(NEW)*
| 20 | Wholeness Sense | `spirit.wholeness_sense` | *(NEW)* |

**Parent max band:** 10
**Primary for V-Level:** Yes (can exceed Band 7)

**Total: 16 + 16 + 16 + 16 + 16 + 20 = 100 exactly**

---

## 2. Sub-Dimensional Ladders — The Progression Engine

### 2.1 What a Sub-Dimensional Ladder Is

Every sub-dimension has its own 7-band progression ladder. This is NOT a content list — it is a **competency model** that defines what it means to develop in that specific sub-dimension. Each rung on the ladder is a behaviorally observable, language-detectable state.

### 2.2 Ladder Structure

```
BAND 0: "Unrecognized"     — the sub-dimension is not yet visible to the user
BAND 1: "Dormant"          — the sub-dimension exists but is suppressed/avoided
BAND 2: "Emerging"         — the sub-dimension is visible in safe conditions
BAND 3: "Active"           — the sub-dimension is actively accessible
BAND 4: "Developing"       — the sub-dimension is reliably accessible
BAND 5: "Established"      — the sub-dimension is stable across contexts
BAND 6: "Mastery"          — the sub-dimension operates autonomously, without effort
BAND 7: "Transcendent"     — the sub-dimension is no longer needed as a separate capacity
  (spirit-only: Bands 8-10 continue)
```

### 2.3 Full Ladder Specifications (Selected Examples)

#### emotion.grief

| Band | Label | Observable Behaviors | Practice Recommendation |
|---|---|---|---|
| 0 | Unrecognized | Cannot name grief; body goes blank when loss approaches | Body-based grounding; safe container |
| 1 | Suppressed | Grief arrives, is immediately pushed down; distraction patterns | Grief-allowing meditation; journal prompts |
| 2 | Witnessing | Notices grief as a passing weather; 1-2 min tolerance | Witnessing practice with grief as object |
| 3 | Processing | Explores grief through body sensation; old losses surface | Neti-neti on grief thoughts; somatic practice |
| 4 | Integrating | Grief is a signal, not a disruption; loss reframed | Narrative integration; meaning-making |
| 5 | Transcending | Grief recognized as universal; compassion deepens | Service; compassion practice |
| 6 | Embodied | Grief and joy coexist; loss deepens love capacity | Non-dual practice; being with both |
| 7 | Non-Dual | Grief and its opposite are one movement | Resting in awareness itself |

#### emotion.joy

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Unrecognized | Cannot identify joy; confuses it with relief or distraction |
| 1 | Suppressed | Joy feels dangerous; "don't get too happy" pattern |
| 2 | Emerging | Brief moments of delight recognized in retrospect |
| 3 | Active | Can feel joy in safe conditions; shared joy available |
| 4 | Developing | Spontaneous joy arises; not dependent on external conditions |
| 5 | Established | Joy is baseline; includes difficult circumstances |
| 6 | Mastery | Joy is chosen; radical positivity without bypassing |
| 7 | Non-Dual | Joy and sorrow are equally welcome; bliss without attachment |

#### emotion.fear

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Unrecognized | Fear manifests as physical symptoms without recognition |
| 1 | Suppressed | Fear is labeled "stress" or "busyness" |
| 2 | Emerging | Fear is noticed after the fact; delayed recognition |
| 3 | Active | Fear is recognized in real-time; can name the trigger |
| 4 | Developing | Fear is held without immediately acting on it |
| 5 | Established | Fear becomes a signal system rather than a command |
| 6 | Mastery | Fear is respected but not obeyed; courage is automatic |
| 7 | Non-Dual | Fear and fearlessness are seen as the same energy |

#### thought.inner_critic

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Unrecognized | Inner critic is experienced as objective truth |
| 1 | Dominant | Self-attack is constant; cannot be questioned |
| 2 | Emerging | Critic is noticed; "I'm having a critical thought" |
| 3 | Active | Can name the critic; question its accuracy |
| 4 | Developing | Critic is seen as a pattern, not an authority |
| 5 | Established | Critic voice is recognized before it completes |
| 6 | Mastery | Critic is thanked and redirected; self-compassion is default |
| 7 | Transcended | No separate critic; only awareness of thought |

#### spirit.surrender

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Unrecognized | Surrender = giving up; synonymous with failure |
| 1 | Avoided | Control is primary strategy; surrender feels dangerous |
| 2 | Conceptual | Can talk about surrender intellectually; not lived |
| 3 | Emerging | Brief moments of "not knowing" in meditation |
| 4 | Active | Can release control in specific areas of life |
| 5 | Developing | Surrender becomes a practiced response to difficulty |
| 6 | Established | Life is met with "yes" before strategy |
| 7 | Embodied | Surrender is identity; ego is experienced as a costume |

### 2.4 Cross-Dimensional Ladder Interactions

Ladders are NOT independent. The engine models **ladder dependencies** — how progress in one sub-dimension unlocks or constrains another.

**Key dependency rules:**

| From | To | Rule |
|---|---|---|
| `body.nervous_system_tone` Band 2 | ALL emotion sub-dims | Emotion sub-dims cannot exceed body.nervous_system_tone + 1 band |
| `thought.inner_critic` Band 3 | ALL emotion sub-dims | Emotion work is unsafe if inner critic is at Band 1-2 |
| `emotion.regulation` Band 3 | `body.tension` | Body tension release requires emotional regulation at Band 3+ |
| `spirit.surrender` Band 4 | ALL action sub-dims | Action sub-dims cannot exceed Band 5 if surrender is below Band 4 |
| `connection.trust` Band 2 | ALL connection sub-dims | No connection sub-dim can exceed Band 3 if trust is at Band 1 |
| `spirit.presence` Band 3 | ALL sub-dims | Maximum across all sub-dims cannot exceed presence + 2 bands |

**Why this matters:** It prevents spiritual bypassing at the sub-dimensional level. A user cannot be at Band 5 in `emotion.joy` while at Band 1 in `body.nervous_system_tone` — the ladder dependency blocks it. This is the **fine-grained bypassing detector** that the existing 4-dimension model only approximates.

---

## 3. Loop Clustering, Co-Occurrence, and Resolution — The Loop Genome

### 3.1 Current State

The loop catalog (`src/data/loops.ts`) has 300+ loops across 26 categories. The `loopFamilies.ts` file defines 12 narrative families. But these are static taxonomies — they don't model **how loops actually cluster, co-occur, or resolve in real users over time.**

### 3.2 The Loop Genome Project

#### 3.2.1 Loop Clusters (Functional Groups)

Instead of 26 flat categories, loops are organized into **clusters** — functional groups that co-occur because they share a developmental root.

```ts
interface LoopCluster {
  id: string;
  name: string;
  root: string;              // The underlying developmental wound
  memberLoopIds: string[];   // Loops that typically co-occur
  antiCluster: string[];     // Loops that tend to RESOLVE this cluster
  signature: string;         // The "feel" of this cluster
  bandRange: [number, number]; // Which bands this cluster is most active in
}

export const LOOP_CLUSTERS: LoopCluster[] = [
  {
    id: "CLUSTER_VALIDATION_ANCHOR",
    name: "Validation Anchor Cluster",
    root: "Conditional love in early attachment; self-worth externalized",
    memberLoopIds: ["VAL001", "VAL002", "VAL003", "SOC001", "SOC002", "EGO001"],
    antiCluster: ["CLUSTER_INNER_AUTHORITY"],
    signature: "Mood depends on feedback; identity is audience-shaped",
    bandRange: [0, 3],
  },
  {
    id: "CLUSTER_CONTROL_SPASM",
    name: "Control Spasm Cluster",
    root: "Early environment where unpredictability was unsafe",
    memberLoopIds: ["CTL001", "CTL002", "WOR001", "ANX001", "EMO001"],
    antiCluster: ["CLUSTER_SURRENDER_FLOW"],
    signature: "Pre-emptive tension; future-hopping; can't let be",
    bandRange: [0, 4],
  },
  {
    id: "CLUSTER_AVOIDANCE_TIDE",
    name: "Avoidance Tide Cluster",
    root: "Task = threat; effort = danger; past punishment for trying",
    memberLoopIds: ["AVO001", "AVO002", "PRO001", "MEN001", "HAB001"],
    antiCluster: ["CLUSTER_ENGAGEMENT_RHYTHM"],
    signature: "Task migration; tab proliferation; productive procrastination",
    bandRange: [0, 3],
  },
  {
    id: "CLUSTER_PERFORMANCE_TRAP",
    name: "Performance Trap Cluster",
    root: "Love = output; worth = production; rest = guilt",
    memberLoopIds: ["PER001", "PER002", "PRO002", "WRK001", "NAR001"],
    antiCluster: ["CLUSTER_BEING_MODE"],
    signature: "Always-on; exhausted by small talk; resume-thinking during rest",
    bandRange: [1, 5],
  },
  {
    id: "CLUSTER_IDENTITY_FIXATION",
    name: "Identity Fixation Cluster",
    root: "Roles were safety; loss of role = loss of self",
    memberLoopIds: ["IDN001", "IDN002", "EGO002", "REL001", "SOC003"],
    antiCluster: ["CLUSTER_FLUID_SELF"],
    signature: "Defended roles; threat when identity is questioned",
    bandRange: [1, 4],
  },
  {
    id: "CLUSTER_RUMINATION_SPIRAL",
    name: "Rumination Spiral Cluster",
    root: "Unprocessed emotion seeking cognitive resolution; thought cannot solve felt sense",
    memberLoopIds: ["RUM001", "RUM002", "MEN002", "COG001", "EMO002"],
    antiCluster: ["CLUSTER_BODY_WISDOM"],
    signature: "Same conversation at 11 PM with better comebacks; DMN hyperactivity",
    bandRange: [1, 5],
  },
  {
    id: "CLUSTER_SPIRITUAL_BYPASS",
    name: "Spiritual Bypass Cluster",
    root: " transcendence used to avoid immanence; spiritual materialism",
    memberLoopIds: ["SPR001", "SPR002", "SPR003", "AVO003", "NAR002"],
    antiCluster: ["CLUSTER_GROUNDED_AWARENESS"],
    signature: "Noble language over felt experience; bypass disguised as growth",
    bandRange: [2, 6],
  },
  {
    id: "CLUSTER_SURVIVAL_HYPERVIGILANCE",
    name: "Survival Hypervigilance Cluster",
    root: "Chronic threat perception; nervous system stuck in fight-flight-freeze",
    memberLoopIds: ["SUR001", "SUR002", "EMO003", "BOD001", "CON001"],
    antiCluster: ["CLUSTER_SAFE_CONTAINER"],
    signature: "Body always scanning; threat detection even in safety",
    bandRange: [0, 3],
  },
  {
    id: "CLUSTER_COMPARISON_GHOST",
    name: "Comparison Ghost Cluster",
    root: "Relative worth internalized; ranking as identity structure",
    memberLoopIds: ["CMP001", "CMP002", "SOC004", "NAR003", "VAL004"],
    antiCluster: ["CLUSTER_INNER_AUTHORITY"],
    signature: "Other people's lives feel sharper; scrolling = subtle ache",
    bandRange: [0, 4],
  },
  {
    id: "CLUSTER_SHAME_CONCEALMENT",
    name: "Shame Concealment Cluster",
    root: "Exposure = danger; self is defective; hiding is survival",
    memberLoopIds: ["SHA001", "SHA002", "SOC005", "CON002", "EMO004"],
    antiCluster: ["CLUSTER_VULNERABLE_CONTACT"],
    signature: "Over-disclosure followed by withdrawal; perfectionism as shield",
    bandRange: [0, 4],
  },
  {
    id: "CLUSTER_ATTACHMENT_ANCHOR",
    name: "Attachment Anchor Cluster",
    root: "Self is relation; separation = annihilation",
    memberLoopIds: ["ATT001", "ATT002", "REL001", "REL002", "CON003"],
    antiCluster: ["CLUSTER_AUTONOMOUS_CONNECTION"],
    signature: "Clinging; merging; identity dissolves in relationship",
    bandRange: [0, 5],
  },
  {
    id: "CLUSTER_ADDICTIVE_ESCAPE",
    name: "Addictive Escape Cluster",
    root: "Altered state preferred over present state; dopamine as self-medication",
    memberLoopIds: ["ADD001", "ADD002", "HAB002", "EMO005", "BOD002"],
    antiCluster: ["CLUSTER_PRESENCE_RETURN"],
    signature: "Boom-bust; craving; post-behavior shame spiral",
    bandRange: [0, 4],
  },
];
```

**The key insight:** Clusters have `antiCluster` fields. When a cluster is detected as active, the engine prescribes practices from the anti-cluster. This is the **resolution engine** — it's not about fixing individual loops, it's about dissolving entire cluster patterns.

#### 3.2.2 Loop Co-Occurrence Matrix

The engine maintains a real-time co-occurrence matrix that learns from user data:

```ts
interface LoopCoOccurrence {
  loopA: string;
  loopB: string;
  coOccurrenceCount: number;
  typicalSequence: "A_then_B" | "B_then_A" | "simultaneous";
  averageGapDays: number;
  resolutionCorrelation: {
    practiceId: string;
    successRate: number;     // 0-1: does this practice dissolve BOTH?
    typicalSessions: number; // How many sessions until both resolve
  }[];
}
```

**How it's built:**
1. Every time a user completes a session, the edge function `detect-anomalies` runs loop detection on their journal + session data
2. When two loops are detected within 7 days of each other, the co-occurrence matrix increments
3. When a practice successfully dissolves both loops within 30 days, the `resolutionCorrelation` is updated
4. The matrix is aggregated across users (anonymized) to find population-level patterns

**Example discovered pattern:**

```
Loops: VAL001 (People-Pleasing) + CTL001 (Control Spasm)
Co-occurrence: 78% of users with VAL001 also develop CTL001 within 60 days
Typical sequence: VAL001 appears first (childhood), CTL001 emerges in adolescence
Anti-cluster: CLUSTER_INNER_AUTHORITY
Best resolution practice: witness-practice + boundary-setting micro-practices
Average sessions to resolve both: 11.3 sessions over 6 weeks
```

#### 3.2.3 Loop Resolution Pathways

Every loop has a **resolution pathway** — a multi-session trajectory that maps how the loop typically dissolves:

```ts
interface LoopResolutionPathway {
  loopId: string;
  typicalEntryBand: number;       // Which band this loop typically emerges in
  dissolutionTrigger: string;     // What practice/experience dissolves it
  minimumSessions: number;        // Minimum sessions required
  averageSessions: number;        // From aggregated data
  prerequisiteLoops: string[];    // Which loops must be addressed first
  postResolutionGift: string;     // What capacity emerges after dissolution
  regressionRisk: number;         // 0-1: probability of loop returning
  regressionPrevention: string[]; // What prevents regression
}

export const LOOP_RESOLUTION_PATHWAYS: Record<string, LoopResolutionPathway> = {
  VAL001: {
    typicalEntryBand: 0,
    dissolutionTrigger: "Consistent anonymous service (karma yoga)",
    minimumSessions: 8,
    averageSessions: 14.2,
    prerequisiteLoops: [],
    postResolutionGift: "Inner authority: 'I know my worth without mirrors'",
    regressionRisk: 0.35,
    regressionPrevention: ["Weekly self-worth check-in", "Service without audience"],
  },
  CTL001: {
    typicalEntryBand: 1,
    dissolutionTrigger: "Surrender practice + uncertainty exposure",
    minimumSessions: 12,
    averageSessions: 21.7,
    prerequisiteLoops: ["VAL001"], // Often requires self-worth first
    postResolutionGift: "Flow: ability to act without controlling outcome",
    regressionRisk: 0.42,
    regressionPrevention: ["Daily 5-minute surrender meditation", "Hand over one decision/week"],
  },
};
```

#### 3.2.4 Loop Genome — The Knowledge Graph

The Loop Genome is a directed graph where:
- **Nodes** = loops + sub-dimensions + practices + bands
- **Edges** = causal/temporal relationships

```ts
interface LoopGenomeEdge {
  from: string;           // Node ID
  to: string;             // Node ID
  relationship: "triggers" | "resolves" | "unlocks" | "blocks" | "co_occurs_with";
  strength: number;       // 0-1 edge weight
  evidence: "clinical" | "aggregated_user_data" | "expert_curated";
  confidence: number;     // 0-1
}
```

**The genome answers questions like:**
- "If a user has VAL001 at Band 2, what's the probability they develop CTL001 within 60 days?"
- "Which practice most efficiently dissolves both AVO001 and PRO001?"
- "If we resolve SHA001 first, does that accelerate CTL001 resolution?"

This is the **proprietary dataset** that grows with every user session. The more users, the richer the genome, the more accurate the recommendations.

---

## 4. Integral & Transformational System Enhancements

These are the "clever things" — architectural patterns that make the system more than the sum of its parts.

### 4.1 The Fractal Dimension Engine

**Concept:** The system is fractal. The same patterns repeat at every scale.

```
100 sub-dimensions → 6 primary dimensions → 1 V-Level
  (same structure applies in reverse)
```

A user's journey is modeled as:
1. They develop in individual sub-dimensions (ladder progression)
2. Sub-dimensions aggregate to primary dimensions (weighted average)
3. Primary dimensions aggregate to V-Level (geometric mean + integration multiplier)
4. But ALSO: V-Level patterns feedback into which sub-dimensions are emphasized

**Fractal rule:** The same 7-band ladder structure that governs sub-dimensions ALSO governs:
- Practice levels (each practice has its own 7-band ladder)
- Loop severity (dormant → mild → moderate → intense → critical = 5 of 7 bands)
- Guide/master trust depth (7 levels of trust with the AI guide)
- Relationship depth with other users (in community features)

This means the codebase has ONE ladder engine, not ten separate progression systems.

```ts
// Generic ladder engine — used for sub-dims, practices, loops, trust, etc.
interface LadderEngine<T extends { id: string; band: number }> {
  getCurrentBand(item: T): number;
  getNextMilestone(item: T): LadderMilestone;
  canAdvance(item: T, signal: DimensionSignal[]): boolean;
  getDependencies(item: T): string[];  // Which other items must advance first
  getAntiBypassingRule(item: T): BypassingRule;
}
```

### 4.2 The Integral Quadrants Integration

**Concept:** Apply Ken Wilber's AQAL framework (All Quadrants, All Levels) to the engine. Every user state is modeled across 4 quadrants simultaneously:

| Quadrant | Dimension | What the Engine Tracks |
|---|---|---|
| **I** (Interior-Individual) | Subjective experience | Journal sentiment, self-reported states, voice tone analysis |
| **We** (Interior-Collective) | Shared meaning | Community loops, cultural patterns, collective themes |
| **It** (Exterior-Individual) | Observable behavior | Session completion, practice duration, streak data, biometrics |
| **Its** (Exterior-Collective) | Systems context | Org-level loop epidemiology, environmental signals, calendar data |

**Why this is transformational:** Most consciousness apps only track "I" (subjective) and "It" (behavior). By tracking all 4 quadrants, the system can detect patterns like:

> "Your interior experience (I) reports peace, but your exterior behavior (It) shows consistent task avoidance, and the collective signal (We) from your team's loop data shows you're in a comparison cluster. The systems context (Its) is a performance-oriented workplace. The integral read: your peace is fragile; it's a Band 2 peace that will collapse under Band 4 pressure."

**Implementation:**
- `user_context.ts` already aggregates many signals — expand to include quadrant labels on every signal
- The Composer selects practices that address ALL active quadrants, not just one
- The Loop Genome maps which quadrants each loop operates in

### 4.3 The Shadow Integration Engine

**Concept:** A shadow is a loop that is active but unconscious. The engine has `detect-anomalies` and `detect-silence` edge functions — expand these into a full Shadow Integration system.

```ts
interface ShadowState {
  activeShadows: ShadowEntry[];       // Loops the user is in but doesn't see
  shadowTriggers: ShadowTrigger[];    // What triggers shadow activation
  shadowExpressions: string[];        // How shadow manifests (detected from language gaps)
  integrationPath: string[];          // Practices that integrate this shadow
  lightCounterpart: string;           // The conscious opposite of this shadow
}

interface ShadowEntry {
  loopId: string;
  confidence: number;         // 0-1: how sure are we this is a shadow?
  detectionMethod: "language_gap" | "behavior_pattern" | "cross_quadrant_mismatch" | "ai_inference";
  firstDetected: string;
  expressions: string[];      // Observable expressions of this shadow
}
```

**Shadow detection methods:**

1. **Language Gap Detection** — When a user's journal avoids certain topics that their behavior suggests are present (e.g., they write about "being busy" but never mention their partner, while their calendar shows zero partner time)
2. **Cross-Quadrant Mismatch** — When "I" and "It" disagree (user says "I'm fine" but session behavior shows high tension)
3. **AI Inference** — The guide/master detects shadow material in conversation and flags it
4. **Pattern Window** — The `pattern-window-detector` edge function looks for 48-hour windows where a pattern suddenly disappears (classic shadow suppression)

**The Shadow Integration Protocol:**

```
PHASE 1: DETECTION
  → Shadow is flagged by the engine
  → User is invited (not told) to explore: "I notice something interesting..."
  
PHASE 2: CONTAINMENT
  → Practice assigned: create a safe container before exploring shadow
  → Often: body-based practice first (nervous system must be regulated)
  
PHASE 3: EXPLORATION
  → Guided inquiry into the shadow content
  → Journal prompts specifically designed for this shadow
  → The shadow is given a voice (expressive practice)
  
PHASE 4: DIALOGUE
  → The conscious self and the shadow have a structured dialogue
  → "What does this shadow want? What is it protecting?"
  
PHASE 5: INTEGRATION
  → The shadow's gift is identified (every shadow has a positive intention)
  → The capacity is reclaimed
  → The loop dissolves or transforms into a higher-order pattern
  
PHASE 6: WITNESSING
  → Future shadow activation is recognized earlier
  → The user becomes their own shadow detector
```

### 4.4 The Dynamic Constellation Engine

**Concept:** Currently, `user_practice_constellation` stores a static weighting of 12 practices. The Dynamic Constellation makes this a **living map** that evolves daily based on signals.

```ts
interface DynamicConstellation {
  practices: ConstellationNode[];
  connections: ConstellationEdge[];
  centerOfGravity: string;        // Which practice is the user gravitating toward
  tensionLines: string[];         // Where the constellation is in tension
  evolution: ConstellationSnapshot[]; // Past snapshots for trajectory
}

interface ConstellationNode {
  practiceId: string;
  weight: number;                 // 0-1: how much this practice is weighted
  level: number;                  // Current practice level
  trend: "rising" | "stable" | "falling";
  lastPracticed: string;
  nextScheduled: string;
  loopAffinities: string[];       // Which loops this practice addresses
  dimensionImpacts: Record<DimensionId, number>;
}
```

**Dynamic rules:**
1. When a loop is detected, the constellation shifts weight toward practices that dissolve that loop
2. When a sub-dimension ladder advances, practices targeting that sub-dimension get a temporary weight boost
3. When a practice plateaus (no level-up after N sessions), weight shifts to cross-pollination practice
4. The "center of gravity" is the practice the user needs most RIGHT NOW — it's what the orb on the home screen represents

### 4.5 The Resonance Engine (Cross-User Intelligence)

**Concept:** With user consent, the system learns from the aggregate population to make better recommendations for each individual.

```ts
interface ResonancePattern {
  patternSignature: string;       // Hash of: band + active_loops + sub_dim_snapshot
  usersInPattern: number;
  averageJourney: {
    sessionsToNextBand: number;
    mostEffectivePractices: { practiceId: string; efficacy: number }[];
    commonLoopResolutions: { loopId: string; resolutionPathway: string }[];
    commonBlockages: string[];
  };
  similarUsers: string[];         // Anonymized user IDs in same pattern
}
```

**How it works:**
1. Every completed session creates a pattern signature hash (band + active loops + sub-dim snapshot)
2. The system finds all users with the same pattern signature
3. It asks: "What did those users do next? What worked?"
4. The current user gets recommendations based on what actually worked for similar users

**The Transformational Effect:** This makes the system **population-wise intelligent**. It's not just personalized to YOU — it's personalized to the millions of micro-steps that people LIKE you actually took. This is the secret behind Netflix recommendations applied to consciousness development.

### 4.6 The Temporal Weave (Multi-Scale Time Intelligence)

**Concept:** The system operates on multiple time scales simultaneously, each with its own intelligence:

| Time Scale | Engine | What It Tracks |
|---|---|---|
| **Micro** (seconds) | Session machine | Streaming state, voice tone, typing cadence, pause patterns |
| **Meso** (hours-days) | Daily cycle machine | Gate transitions, task completion, streak patterns |
| **Macro** (weeks-months) | Adaptive journey engine | Band progression, loop resolution, practice level-ups |
| **Mega** (months-years) | Lifetime spiral | Phase transitions, convergence patterns, graduation events |
| **Meta** (lifespan) | Memory consolidation | When the system should remember significant realizations |

**The Temporal Weave rule:** Actions at one scale affect predictions at another scale. A micro-level pattern (pausing 3x longer before responses in voice chat) at Band 2 predicts macro-level outcomes (will this user benefit more from silence-based practices at Band 4?).

```ts
interface TemporalSignal {
  scale: "micro" | "meso" | "macro" | "mega" | "meta";
  signal: string;
  prediction: {
    targetScale: "meso" | "macro" | "mega" | "meta";
    confidence: number;
    expectedOutcome: string;
    timeframe: string;
  };
}
```

### 4.7 The Practice Genome (Intervention Mapping)

**Concept:** Every practice has a "genome" — a complete map of what it touches, how, and at what intensity. This allows the Composer to select practices with surgical precision.

```ts
interface PracticeGenome {
  practiceId: string;
  subDimensionTargets: {
    subDimensionId: string;
    impactStrength: number;      // 0-4
    bandRange: [number, number]; // Which bands this practice is effective for
    mechanism: string;           // HOW it works (breath, inquiry, devotion, etc.)
  }[];
  loopTargets: {
    loopId: string;
    dissolutionProbability: number;  // 0-1
    minimumSessions: number;
    mechanism: string;
  }[];
  prerequisitePractices: string[];  // Must complete before this practice
  contraindicatedWith: string[];    // Should NOT pair with these practices
  integrationPractices: string[];   // What to do AFTER this practice
  modeRequirements: string[];       // Which session modes support this practice
  energyRequired: "low" | "medium" | "high";
  timeMinimum: number;              // Minimum effective duration in minutes
}
```

### 4.8 The Integral Assessment (Beyond Onboarding)

**Concept:** The current onboarding is a snapshot. The Integral Assessment is a **continuous, adaptive assessment** that runs silently in the background, updating the user's profile with every session.

```ts
interface IntegralAssessmentSignal {
  source: "session" | "journal" | "voice" | "behavior" | "external";
  signals: {
    subDimensionId: string;
    direction: "up" | "down" | "stable";
    confidence: number;
    evidence: string;              // "User paused 3x longer before answering grief question"
  }[];
  overallShift: {
    bandDelta: number;
    primaryDimensionChanges: Record<DimensionId, number>;
    newLoopsDetected: string[];
    resolvedLoops: string[];
  };
}
```

**How it works:**
1. Every session generates assessment signals (from session behavior, not just self-report)
2. Every journal entry is analyzed for sub-dimensional language markers
3. Voice tone analysis adds emotional sub-dimension signals
4. External signals (calendar, email, wearable) add behavioral sub-dimension signals
5. All signals are weighted by confidence and aggregated into a continuous V-Level estimate
6. The system never "re-tests" — it continuously assesses

This means **there is no "test day"** in ConsciousOS. The assessment is always happening. The user never has to "perform" their consciousness for a score.

### 4.9 The Emergent Curriculum

**Concept:** The user's program is not a pre-built curriculum — it is an **emergent property** of their interaction with the system. Like a riverbed shaped by water, the program is shaped by the user's actual experience.

```ts
interface EmergentCurriculum {
  userId: string;
  currentArc: CurriculumArc;
  pastArcs: CurriculumArc[];
  emergentPatterns: {
    pattern: string;               // "This user learns best through grief work before joy work"
    confidence: number;
    evidence: string[];
  }[];
  adaptiveRules: AdaptiveRule[];   // Rules the system has learned about this user
}

interface AdaptiveRule {
  condition: string;               // "When emotion.fear is above Band 3"
  action: string;                  // "Prioritize body-based practices before inquiry"
  confidence: number;              // How often this has proven true
  lastValidated: string;
}
```

**How adaptive rules emerge:**
1. After each session, the system asks: "What would have been more useful?"
2. The user's response (explicit or implicit — e.g., they skipped the suggested practice) updates the rule
3. Rules with high confidence become hard-coded preferences
4. Rules with low confidence remain as suggestions

This means **the system gets smarter about each specific user over time** — not just through ML models, but through explicit, traceable rules that the user can see and modify.

### 4.10 The Consciousness Compass (Directional Intelligence)

**Concept:** In addition to tracking WHERE a user is (band, sub-dimensions, loops), the system tracks WHERE they're heading and WHY. The Consciousness Compass is the directional intelligence layer.

```ts
interface ConsciousnessCompass {
  currentHeading: {
    band: number;
    subDimensions: Record<string, number>;
    activeLoops: string[];
    energy: "low" | "medium" | "high";
  };
  trajectory: {
    direction: "ascending" | "plateau" | "regressing" | "spiraling";
    speed: number;                  // Bands per month
    acceleration: number;           // Change in speed
    predictedBandIn30Days: number;
    predictedBandIn90Days: number;
    predictedBandIn365Days: number;
  };
  bearing: {
    nextNaturalThreshold: number;   // The next natural band transition
    estimatedSessionsToThreshold: number;
    currentResistance: string[];    // What's slowing progress
    currentFacilitation: string[];  // What's accelerating progress
    suggestedPivot: string | null;  // "Consider shifting from x to y"
  };
}
```

**The compass enables:**
- "You're approaching Band 3 naturally — expect a purge phase. I'll adjust practice intensity."
- "You've been at Band 3.2 for 3 weeks. Let's try a cross-pollination practice."
- "Your speed profile is 'deep digger' — you're right on track. No pressure to accelerate."

### 4.11 The Sacred Pause (Ethical Architecture)

**Concept:** The system has built-in ethical guardrails that prevent it from being overly invasive or manipulative.

```ts
interface SacredPauseRules {
  neverDo: string[];               // Hard prohibitions
  alwaysAsk: string[];             // Mandatory consent checkpoints
  transparencyRequirements: string[]; // What must be visible to the user
  gracefulLimits: {
    feature: string;
    maxUsagePerWeek: number;
    reason: string;
  }[];
}
```

**Example rules:**

| Rule | Implementation |
|---|---|
| Never use guilt as a motivator | Anti-guilt messages are hard-coded, not prompt-engineered |
| Always explain WHY | Every recommendation includes a plain-English rationale |
| Never hide the model | User can see their own V-Level calculation, dimension scores, and ladder positions |
| Limit AI chat depth | Prevents dependency; system fades as user advances |
| Biometric data stays local | Raw biometrics never leave the device; only aggregated signals go to server |
| User owns their data | Full export/delete; no lock-in |
| No social comparison | No leaderboards, no "others at your level" features |

### 4.12 The Emergent Grammar (AI-Native Content)

**Concept:** Most content in consciousness apps is static — pre-written texts, pre-recorded meditations. ConsciousOS has an **emergent grammar** — a set of rules that generate unique, contextually-perfect content in real time.

**The grammar has three layers:**

1. **Structural Grammar** — Rules for how a session is composed (opening → core → closing; practice selection; guide voice selection)
2. **Semantic Grammar** — Rules for which words, metaphors, and teaching styles match the user's current state
3. **Aesthetic Grammar** — Rules for tone, pacing, rhythm, and sensory detail that match the user's preference profile

```ts
interface EmergentGrammar {
  structuralRules: GrammarRule[];
  semanticRules: GrammarRule[];
  aestheticRules: GrammarRule[];

  generate(input: GrammarInput): GeneratedContent;
}

interface GrammarRule {
  condition: string;           // "When user is at Band 3 AND emotion.grief is active"
  output: GrammarTemplate;
  weight: number;              // Higher weight = preferred template
}
```

**Example structural rule:**

```
IF: user.band = 3 AND activeLoop = "SPIRITUAL_BYPASS"
AND timeAvailable >= 15min AND energy = "medium"
THEN: sessionStructure = [
  { type: "grounding", duration: "3min", reason: "Body must be regulated before bypass can be addressed" },
  { type: "inquiry", duration: "7min", question: "What are you feeling right now that you don't want to feel?", reason: "Direct bypass challenge" },
  { type: "witnessing", duration: "3min", reason: "Hold the discomfort without fixing it" },
  { type: "integration", duration: "2min", reason: "Name what you avoided" }
]
guideVoice = "elder"     // Not the usual guide; an elder who calls out bypass directly
```

This means **every session is freshly generated** — not selected from a library, but composed in real time from rules that match the user's exact state. This is why the same user never gets the same session twice, and why the system feels "alive."

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- [ ] Expand `dimensions100.ts` to full 100 sub-dimensions with metadata
- [ ] Define the 7-band ladder structure for each sub-dimension (at least the 6 primary ones first)
- [ ] Implement the ladder dependency rules (fine-grained bypassing detector)
- [ ] Create the Loop Cluster taxonomy (12-15 clusters from existing loops)
- [ ] Add `antiCluster` and `resolutionPathway` fields to loop data

### Phase 2: Intelligence (Months 3-6)
- [ ] Build the Loop Co-Occurrence matrix with anonymized aggregation
- [ ] Implement the Loop Genome graph structure
- [ ] Build the Shadow Integration engine (detection + containment + exploration)
- [ ] Add sub-dimensional signals to `generatePracticeSignals` in `dimensionTracker.ts`
- [ ] Create the Dynamic Constellation engine (replaces static `user_practice_constellation`)

### Phase 3: Integral Architecture (Months 6-12)
- [ ] Implement the Fractal Dimension Engine (generic ladder engine)
- [ ] Build the Integral Quadrants tracking into `getUserContext()`
- [ ] Implement the Resonance Engine (cross-user pattern matching with consent)
- [ ] Build the Temporal Weave (multi-scale signal correlation)
- [ ] Create the Practice Genome (complete intervention mapping)

### Phase 4: Transformational (Months 12-18)
- [ ] Build the Emergent Curriculum system
- [ ] Implement the Consciousness Compass
- [ ] Deploy the Sacred Pause ethical architecture
- [ ] Complete the Emergent Grammar system for real-time session generation
- [ ] Build the Longitudinal Consciousness Biography

---

## 6. The Moat — Why This Can't Be Copied

| Competitor can build... | Only ConsciousOS can build... |
|---|---|
| Meditation timer | Fractal dimension engine with 100 sub-dimensional ladders |
| Journal app | Loop Genome with co-occurrence learning from real user data |
| AI chatbot | Emergent Grammar that generates unique sessions in real time |
| Mood tracker | Integral Quadrants tracking across subjective/objective/individual/collective |
| Habit tracker | Dynamic Constellation that reshapes itself daily based on live signals |
| Content library | Shadow Integration Engine with 6-phase protocol |
| Wellness assessment | Continuous adaptive assessment that never requires "test day" |
| Program catalog | Emergent Curriculum that adapts rules per user over time |

**The irreducible core:** The integration of all these layers into one coherent system. A competitor could build any single layer, but the Fractal Dimension Engine + Loop Genome + Integral Quadrants + Emergent Grammar + Shadow Integration + Dynamic Constellation + Resonance Engine + Temporal Weave + Practice Genome + Consciousness Compass + Sacred Pause + Emergent Curriculum is a **12-layer stack** that takes years to build, requires unique longitudinal data to train, and is held together by a shared type system and data contract that no one else has.

---

## 7. Open Questions

1. **Should the 100-dimension taxonomy be published as a research instrument?** If so, which dimensions stay proprietary (the ladders and clustering) and which become open (the names and structure)?
2. **Should the Loop Genome be user-visible?** Users could see "Here are the 3 loops that are most active in you right now" — but full disclosure of the genome graph might be overwhelming.
3. **How does the Shadow Integration Engine interact with the bypassing detector?** Shadows are, by definition, not visible to the user. How does the system surface them without creating new bypassing?
4. **What's the minimum viable version of the Loop Genome?** The co-occurrence matrix requires significant user data. Can we seed it with expert-curated relationships and let it learn from there?
5. **How does the Integral Quadrants model integrate with the existing 6-dimension model?** Are they parallel systems or does one reduce to the other?

---

*This document is a living architecture specification. Update as each layer is implemented and the data reveals new patterns.*

---

## 8. Complete Sub-Dimensional Ladder Specifications (Expanded)

Below are the full 7-band ladders for every sub-dimension. These are the behaviorally observable, language-detectable states that the engine uses to assess user position and select practices.

### 8.1 THOUGHT Sub-Dimensions

#### thought.clarity

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Unrecognized | Thinking is experienced as opaque fog; cannot distinguish clarity from confusion |
| 1 | Dimmed | Thought is sluggish; "brain feels like wet wool"; decisions feel muddy |
| 2 | Emerging | Moments of lucidity appear; can recognize when thinking is clear vs cloudy |
| 3 | Active | Can think clearly through moderate complexity; can hold multiple threads |
| 4 | Developing | Clear thinking is reliable across contexts; can self-correct muddled thinking |
| 5 | Established | Clarity is baseline even under stress; can see through cognitive distortions |
| 6 | Mastery | Thought is a tool, not a master; can choose when to think and when to rest in not-knowing |
| 7 | Transcended | Clarity and confusion are both recognized as expressions of awareness |

#### thought.belief_patterns

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Unrecognized | Beliefs are experienced as objective reality; no gap between belief and fact |
| 1 | Rigid | Beliefs are defended aggressively; contradictory evidence triggers defensiveness |
| 2 | Emerging | Notices that beliefs might be beliefs; "maybe that's just what I think" |
| 3 | Active | Can hold beliefs lightly; willing to examine them |
| 4 | Developing | Actively questions assumptions; seeks disconfirming evidence |
| 5 | Established | Beliefs are updated regularly; identity is not tied to belief system |
| 6 | Mastery | Holds multiple contradictory beliefs simultaneously; comfortable with paradox |
| 7 | Transcended | Belief is seen as a useful map, not the territory; can act without belief |

#### thought.mental_loops

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Unrecognized | Mental loops are experienced as productive thinking; no awareness of looping |
| 1 | Dominant | Loops are constant; cannot be interrupted; rumination is baseline |
| 2 | Emerging | Notices looping after it has been going on for a while |
| 3 | Active | Can notice looping in real-time; "I'm looping again" |
| 4 | Developing | Can interrupt loops with a redirect; 3-second pause is accessible |
| 5 | Established | Loops are recognized before they gain momentum; redirect is automatic |
| 6 | Mastery | Loops are seen as patterns in awareness; awareness is not pulled into them |
| 7 | Transcended | No loop can sustain itself; awareness is always prior to thought |

#### thought.cognitive_bias

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Unrecognized | Biases are experienced as correct judgment; blind to distortion |
| 1 | Strong | Biases dominate decision-making; confirmation seeking is constant |
| 2 | Emerging | Notices bias in hindsight; "I was biased there" |
| 3 | Active | Can name biases in real-time; asks "what bias might be operating?" |
| 4 | Developing | Systematically checks for common biases; seeks disconfirming data |
| 5 | Established | Bias detection is automatic; decisions are corrected before commitment |
| 6 | Mastery | Bias is seen as a feature of human cognition, not a personal failing |
| 7 | Transcended | Sees through all bias simultaneously; decisions arise from clarity |

#### thought.attention_span

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Unrecognized | Cannot sustain attention for more than 30 seconds; fragmentation is baseline |
| 1 | Fleeting | Attention jumps every 1-2 minutes; effort to focus produces anxiety |
| 2 | Emerging | Can hold attention for 5-10 minutes on engaging content |
| 3 | Active | Can sustain attention for 15-20 minutes on neutral content |
| 4 | Developing | Can hold attention for 30+ minutes; can return after distraction |
| 5 | Established | Attention is a tool; can direct it at will for hours |
| 6 | Mastery | Attention is stable even in stimulating environments; single-pointed focus is accessible |
| 7 | Transcended | Attention and awareness are unified; focused and open attention are the same |

### 8.2 BODY Sub-Dimensions

#### body.energy

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Depleted | Chronic fatigue; cannot sustain activity for more than 1 hour |
| 1 | Erratic | Boom-bust energy cycles; stimulant-dependent; crashes after effort |
| 2 | Emerging | Can identify energy patterns; notices when energy drops |
| 3 | Active | Can sustain moderate activity for 3-4 hours; rest restores energy |
| 4 | Developing | Energy is manageable; can pace activities throughout day |
| 5 | Established | Stable baseline energy; can summon extra energy when needed |
| 6 | Mastery | Energy is consciously directed; can sustain high output without depletion |
| 7 | Transcended | Energy is boundless; activity and rest are equally energizing |

#### body.sleep

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Dysregulated | Sleep is chaotic; cannot fall asleep or stay asleep; exhaustion is constant |
| 1 | Disrupted | Sleep is 4-5 hours with frequent waking; daytime functioning impaired |
| 2 | Emerging | Sleep is 6+ hours but quality is poor; can identify some disruptors |
| 3 | Active | Sleep is 7+ hours with 1-2 wake cycles; can return to sleep |
| 4 | Developing | Sleep is 7-8 hours with brief wake cycles; morning restfulness is common |
| 5 | Established | Sleep is reliably restorative; can adjust schedule for quality |
| 6 | Mastery | Sleep is a practice; can fall asleep quickly; wake at desired time without alarm |
| 7 | Transcended | Sleep and wakefulness are permeable; rest is available in brief moments |

#### body.tension

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Frozen | Chronic tension is not felt; body is experienced as tight but normal |
| 1 | Dominant | Tension is constant; pain is frequent; body is a problem to manage |
| 2 | Emerging | Notices tension in specific areas; can identify "I'm tense right now" |
| 3 | Active | Can release tension consciously; breath helps; body scans are useful |
| 4 | Developing | Tension is recognized early; release is quick; body is a communication channel |
| 5 | Established | Tension is rare; when it appears, it is a signal, not a state |
| 6 | Mastery | Body is relaxed by default; tension is released without conscious effort |
| 7 | Transcended | Tension and relaxation are recognized as the same energy in different forms |

#### body.nervous_system_tone

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Dysregulated | Nervous system is chronically activated or collapsed; no middle ground |
| 1 | Hyper/Hypo | Either fight-flight or freeze; cannot self-regulate |
| 2 | Emerging | Notices activation; can sometimes down-regulate with support |
| 3 | Active | Can self-regulate with conscious effort; breath is a tool |
| 4 | Developing | Returns to baseline within minutes of stressor; window of tolerance is widening |
| 5 | Established | Nervous system is resilient; stress is processed without dysregulation |
| 6 | Mastery | Can hold activation AND stillness; co-regulation with others is natural |
| 7 | Transcended | Nervous system is a instrument of awareness; regulation is automatic |

### 8.3 ACTION Sub-Dimensions

#### action.integrity

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Fragmented | Promises to self are routinely broken; values and actions are unrelated |
| 1 | Aspirational | Wants integrity but cannot sustain it; inconsistency is painful |
| 2 | Emerging | Notices misalignment; "I said I would but I didn't" |
| 3 | Active | Can align actions with values in clear situations; guilt when misaligned |
| 4 | Developing | Integrity is a practice; catches misalignment before acting |
| 5 | Established | Values and actions are consistently aligned; no internal negotiation needed |
| 6 | Mastery | Integrity is identity; action IS the value |
| 7 | Transcended | Integrity is unnecessary; action and awareness are one |

#### action.discipline

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Undeveloped | Cannot sustain any practice beyond a few days; start/stop is constant |
| 1 | Willpower-based | Uses force to maintain discipline; burnout is frequent |
| 2 | Emerging | Can sustain simple practices for 2-3 weeks |
| 3 | Active | Can maintain daily practices with moderate effort; structure helps |
| 4 | Developing | Discipline is a rhythm, not a struggle; misses occasionally without collapse |
| 5 | Established | Practices are self-sustaining; discipline is a form of self-care |
| 6 | Mastery | Discipline is effortless; practice is as natural as breathing |
| 7 | Transcended | Discipline and spontaneity are the same; structure serves freedom |

#### action.courage

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Avoidant | Cannot act in face of fear; avoidance is default |
| 1 | Reluctant | Acts only when forced; fear is overwhelming |
| 2 | Emerging | Can act despite fear with support; takes small risks |
| 3 | Active | Can act in face of moderate fear; fear is recognized but not obeyed |
| 4 | Developing | Courage is a practice; risk-taking is calculated and intentional |
| 5 | Established | Acts from values despite fear; fear is a companion, not a commander |
| 6 | Mastery | Courage is automatic; fear is present but irrelevant to action |
| 7 | Transcended | Fear and courage are one; action arises from being, not deciding |

### 8.4 CONNECTION Sub-Dimensions

#### connection.intimacy

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Closed | Intimacy is experienced as threat; vulnerability is impossible |
| 1 | Guarded | Allows surface closeness but no depth; walls are maintained |
| 2 | Emerging | Moments of real connection occur; can recognize when walls come down |
| 3 | Active | Can be intentionally intimate; vulnerability is possible with safe others |
| 4 | Developing | Intimacy is a value; can initiate vulnerability; reciprocity is expected |
| 5 | Established | Deep intimacy is accessible; can hold connection through conflict |
| 6 | Mastery | Intimacy is effortless; boundaries and closeness are balanced |
| 7 | Transcended | Intimacy and solitude are the same; connection is the ground of being |

#### connection.trust

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Absent | Trust is impossible; everyone is a potential threat |
| 1 | Conditional | Trust must be earned and is easily revoked; hypervigilant for betrayal |
| 2 | Emerging | Can trust in specific contexts; "I trust you with this" |
| 3 | Active | Trust is given freely to safe others; betrayal is processed, not stored |
| 4 | Developing | Trust is a baseline stance; assumes goodwill unless proven otherwise |
| 5 | Established | Trust is resilient; can trust after betrayal; forgiveness is part of trust |
| 6 | Mastery | Trust is unconditional; sees the trustworthy in everyone |
| 7 | Transcended | Trust and distrust are recognized as mental positions; being is beyond both |

#### connection.forgiveness

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Absent | Grudges are permanent; revenge is fantasized; "they will pay" |
| 1 | Reluctant | Forgiveness is seen as weakness; "they don't deserve it" |
| 2 | Emerging | Can imagine forgiveness; sees that holding grudges is painful |
| 3 | Active | Can forgive small offenses; forgiveness is a choice made repeatedly |
| 4 | Developing | Forgiveness is a practice; can forgive larger transgressions over time |
| 5 | Established | Forgiveness is automatic; resentment is recognized and released |
| 6 | Mastery | Forgiveness is identity; sees the offender's suffering; compassion arises naturally |
| 7 | Transcended | Forgiveness is unnecessary; no one to forgive, no offense sustained |

### 8.5 SPIRIT Sub-Dimensions

#### spirit.witness

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Merged | No gap between awareness and content; fully identified with experience |
| 1 | Glimpsed | Brief moments of "I am not this thought" that pass quickly |
| 2 | Emerging | Can step back and observe thoughts/emotions; witness is accessible in meditation |
| 3 | Active | Witness is available throughout the day; can observe without reacting |
| 4 | Developing | Witness is a practice; returns to it when triggered; self-correction is quick |
| 5 | Established | Witness is the default stance; identification is the exception |
| 6 | Mastery | Witness is continuous; 24/7 awareness of awareness |
| 7 | Transcended | Witness and witnessed are one; awareness is aware of itself |

#### spirit.devotion

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Absent | Devotion is experienced as superstition or weakness; cynicism is default |
| 1 | Conceptual | Can talk about devotion; intellectually attracted to bhakti but not lived |
| 2 | Emerging | Moments of being moved; tears at beauty; "something bigger than me" |
| 3 | Active | Regular devotional practice; feels connection to something sacred |
| 4 | Developing | Devotion deepens; surrender becomes a practice; "not my will but thine" |
| 5 | Established | Devotion is the ground; life is offered; self is in service to something larger |
| 6 | Mastery | Devotion is identity; ego is experienced as offering; love is the default |
| 7 | Transcended | Devotion and devotee are one; love is the only reality |

#### spirit.non_dual_glimpses

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Absent | Non-duality is a concept; no direct experience; "I don't know what that means" |
| 1 | Intellectual | Can discuss non-duality; attracted to teachings but no direct experience |
| 2 | Emerging | Brief glimpses of "no boundary"; "I felt like I was everything" |
| 3 | Active | Glimpses are more frequent; can recognize the state when it arises |
| 4 | Developing | Can rest in non-dual awareness for extended periods; meditation deepens |
| 5 | Established | Non-dual awareness is accessible; can hold it while acting in the world |
| 6 | Mastery | Non-dual awareness is the default; self is experienced as a costume |
| 7 | Transcended | Non-dual awareness is the only reality; separate self is recognized as a thought |

#### spirit.paradox_tolerance

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Absent | Paradox is experienced as confusion or contradiction; must resolve to one side |
| 1 | Intolerant | "It can't be both"; insists on logical consistency; paradox feels like error |
| 2 | Emerging | Can hold two contradictory ideas; "both are true in some sense" |
| 3 | Active | Paradox is a curiosity; "how can both be true?" becomes a practice question |
| 4 | Developing | Paradox is a gateway; can rest in not-knowing; answers are not required |
| 5 | Established | Paradox is the nature of reality; "both/and" is the default reasoning mode |
| 6 | Mastery | Paradox is a doorway; holds contradictions without tension |
| 7 | Transcended | All paradox resolves; truth is beyond both/and |

#### spirit.wholeness_sense

| Band | Label | Observable Behaviors |
|---|---|---|
| 0 | Fragmented | Experience is of separate parts; wholeness is a concept, not a feeling |
| 1 | Yearning | Feels that something is missing; seeks wholeness through acquisition |
| 2 | Emerging | Moments of "this is enough"; glimpses of completeness |
| 3 | Active | Can recognize wholeness in specific contexts; nature, art, connection |
| 4 | Developing | Wholeness is a practice; can access it through inquiry or meditation |
| 5 | Established | Wholeness is the baseline; "enough" is a felt sense |
| 6 | Mastery | Wholeness is identity; nothing is missing; lack is recognized as a thought |
| 7 | Transcended | Wholeness is the only reality; separation is the illusion |

---

## 9. Complete Loop Cluster Resolution Pathways

Each Loop Cluster has a complete resolution pathway — the multi-session trajectory that dissolves the entire cluster, not just individual loops.

### 9.1 CLUSTER_VALIDATION_ANCHOR

```ts
const VALIDATION_ANCHOR_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_VALIDATION_ANCHOR",
  rootLoop: "VAL001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice the pattern: mood depends on feedback",
      practices: ["mirror-session", "self-inquiry-l1"],
      marker: "User can say 'I'm seeking approval' without shame"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 5],
      focus: "Create inner authority separate from external mirrors",
      practices: ["witness-l2", "bhakti-foundation"],
      marker: "User can complete a small task without sharing it"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [6, 10],
      focus: "Worth is internalized; service becomes offering, not performance",
      practices: ["karma-anonymous-service", "self-inquiry-l3"],
      marker: "User reports 'I did it because it mattered, not because anyone saw'"
    },
    {
      phase: "INTEGRATION",
      sessions: [11, 14],
      focus: "Inner authority is stable; feedback is information, not identity",
      practices: ["jnana-discrimination", "witness-l4"],
      marker: "User can receive criticism without collapse or defense"
    }
  ],
  minimumSessions: 8,
  averageSessions: 14.2,
  regressionRisk: 0.35,
  regressionPrevention: ["Weekly anonymous service practice", "Monthly mirror check-in"],
  postResolutionGift: "Inner authority: 'I know my worth without mirrors'",
};
```

### 9.2 CLUSTER_CONTROL_SPASM

```ts
const CONTROL_SPASM_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_CONTROL_SPASM",
  rootLoop: "CTL001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice the pre-emptive tension; future-hopping is the pattern",
      practices: ["body-scan", "breath-anchoring"],
      marker: "User can name 'I'm trying to control the future'"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 6],
      focus: "Create a small practice of surrendering one thing per day",
      practices: ["surrender-micro", "raja-pratyahara"],
      marker: "User can let one decision be made by someone else without reviewing"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [7, 12],
      focus: "Control is recognized as fear; uncertainty is tolerated",
      practices: ["tantra-yes-practice", "witness-l3"],
      marker: "User reports 'I can sit with not knowing' for extended periods"
    },
    {
      phase: "INTEGRATION",
      sessions: [13, 21],
      focus: "Flow becomes the default; action arises from clarity, not anxiety",
      practices: ["karma-yoga", "witness-l4"],
      marker: "User acts decisively without pre-planning every outcome"
    }
  ],
  minimumSessions: 12,
  averageSessions: 21.7,
  regressionRisk: 0.42,
  regressionPrevention: ["Daily 5-minute surrender meditation", "Weekly uncertainty exposure"],
  postResolutionGift: "Flow: ability to act without controlling outcome",
};
```

### 9.3 CLUSTER_SPIRITUAL_BYPASS

```ts
const SPIRITUAL_BYPASS_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_SPIRITUAL_BYPASS",
  rootLoop: "SPR001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice noble language covering unprocessed feeling",
      practices: ["body-grounding", "emotional-honesty-check"],
      marker: "User can say 'I'm using spiritual language to avoid feeling this'"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 6],
      focus: "Ground in body before any spiritual practice",
      practices: ["kriya-grounding", "breath-body-link"],
      marker: "User reports body sensation before interpretation"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [7, 12],
      focus: "Immanence before transcendence; feeling before knowing",
      practices: ["tantra-embodiment", "emotional-healing-deep"],
      marker: "User can feel grief/anger without escaping into spiritual concepts"
    },
    {
      phase: "INTEGRATION",
      sessions: [13, 18],
      focus: "Transcendence is grounded; spirit and matter are one",
      practices: ["advaita-lived", "witness-l4"],
      marker: "User reports 'I can be spiritual AND angry/sad/afraid'"
    }
  ],
  minimumSessions: 10,
  averageSessions: 18.4,
  regressionRisk: 0.38,
  regressionPrevention: ["Monthly body-first practice check", "Guide check-ins on bypass language"],
  postResolutionGift: "Grounded awareness: transcendence that includes the body",
};
```

### 9.4 CLUSTER_RUMINATION_SPIRAL

```ts
const RUMINATION_SPIRAL_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_RUMINATION_SPIRAL",
  rootLoop: "RUM001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice thought trying to solve feeling; DMN hyperactivity",
      practices: ["thought-observation", "breath-anchor"],
      marker: "User can say 'I'm trying to think my way out of a feeling'"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 6],
      focus: "Body-first interrupt: when rumination starts, move the body",
      practices: ["walking-meditation", "body-shake-release"],
      marker: "User takes a 10-minute walk when rumination starts"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [7, 12],
      focus: "Thought is a servant, not a master; feeling is the data",
      practices: ["emotion-naming", "self-inquiry-l2"],
      marker: "User can name the underlying emotion in 3 words or less"
    },
    {
      phase: "INTEGRATION",
      sessions: [13, 18],
      focus: "Rumination becomes reflection; thinking serves feeling",
      practices: ["journal-structured", "witness-l3"],
      marker: "User reports 'I think about it when I choose to, not when it chooses me'"
    }
  ],
  minimumSessions: 10,
  averageSessions: 16.8,
  regressionRisk: 0.31,
  regressionPrevention: ["Daily body-first morning practice", "Evening thought download journal"],
  postResolutionGift: "Reflective mind: thinking serves feeling, not the reverse",
};
```

### 9.5 CLUSTER_AVOIDANCE_TIDE

```ts
const AVOIDANCE_TIDE_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_AVOIDANCE_TIDE",
  rootLoop: "AVO001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice task migration; opening 8 tabs to avoid the one that matters",
      practices: ["task-acknowledgment", "self-compassion-pause"],
      marker: "User can name 'I'm avoiding this' without self-judgment"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 6],
      focus: "Two-minute rule: open the document. Don't write. Just open.",
      practices: ["micro-task-start", "body-grounding"],
      marker: "User opens the avoided task daily without completing it"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [7, 12],
      focus: "Task is no longer threat; effort is safe; failure is information",
      practices: ["karma-skill-in-action", "witness-l2"],
      marker: "User works on avoided task for 10+ minutes without escaping"
    },
    {
      phase: "INTEGRATION",
      sessions: [13, 18],
      focus: "Effort is natural; difficult tasks are approached with curiosity",
      practices: ["raja-tapas", "self-inquiry-l3"],
      marker: "User reports 'I can do hard things; they're not threats'"
    }
  ],
  minimumSessions: 10,
  averageSessions: 15.3,
  regressionRisk: 0.28,
  regressionPrevention: ["Daily 2-minute task opening ritual", "Weekly effort-reflection"],
  postResolutionGift: "Skill in action: effort is natural and rewarding",
};
```

### 9.6 CLUSTER_SURVIVAL_HYPERVIGILANCE

```ts
const SURVIVAL_HYPERVIGILANCE_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_SURVIVAL_HYPERVIGILANCE",
  rootLoop: "SUR001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice body always scanning; threat detection in safety",
      practices: ["body-safety-scan", "breath-coherence"],
      marker: "User can name 'my body is scanning for danger right now'"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 8],
      focus: "Create a felt sense of safety; nervous system must be regulated first",
      practices: ["safety-anchor", "vagal-toning", "progressive-rest"],
      marker: "User can feel safe in their body for 10+ minutes"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [9, 16],
      focus: "Safety is internal; the present is not the past",
      practices: ["trauma-informed-witness", "inner-child-safety"],
      marker: "User reports 'I can be in the present without waiting for the other shoe'"
    },
    {
      phase: "INTEGRATION",
      sessions: [17, 24],
      focus: "Hypervigilance is a gift repurposed; sensitivity becomes discernment",
      practices: ["discernment-practice", "witness-l3"],
      marker: "User uses sensitivity as a tool, not a threat detector"
    }
  ],
  minimumSessions: 15,
  averageSessions: 24.1,
  regressionRisk: 0.45,
  regressionPrevention: ["Daily safety anchor practice", "Therapeutic support recommended"],
  postResolutionGift: "Discernment: sensitivity without threat projection",
};
```

### 9.7 CLUSTER_PERFORMANCE_TRAP

```ts
const PERFORMANCE_TRAP_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_PERFORMANCE_TRAP",
  rootLoop: "PER001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice always-on; exhausted by small talk; resume-thinking during rest",
      practices: ["unproductive-time", "self-compassion-pause"],
      marker: "User can name 'I can't rest without guilt'"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 6],
      focus: "Schedule 10 unproductive minutes daily; stare, wander, don't justify",
      practices: ["being-mode", "witness-l2"],
      marker: "User completes 10 minutes of unstructured time without checking phone"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [7, 12],
      focus: "Rest is not reward for work; being is sufficient",
      practices: ["being-deep", "surrender-micro"],
      marker: "User reports 'I can rest without earning it'"
    },
    {
      phase: "INTEGRATION",
      sessions: [13, 18],
      focus: "Worth is not output; presence is the gift",
      practices: ["bhakti-offering", "karma-fruit-renunciation"],
      marker: "User can be present without producing anything"
    }
  ],
  minimumSessions: 10,
  averageSessions: 17.6,
  regressionRisk: 0.39,
  regressionPrevention: ["Daily being-mode practice", "Weekly unproductive time audit"],
  postResolutionGift: "Being mode: presence without production",
};
```

### 9.8 CLUSTER_IDENTITY_FIXATION

```ts
const IDENTITY_FIXATION_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_IDENTITY_FIXATION",
  rootLoop: "IDN001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice defended roles; threat when identity is questioned",
      practices: ["self-inquiry-l1", "role-observation"],
      marker: "User can name 'I'm defending this role/identity'"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 7],
      focus: "Explore identity as costume; question 'who am I without this role?'",
      practices: ["neti-neti", "witness-l2"],
      marker: "User can imagine a day without their primary identity role"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [8, 14],
      focus: "Identity is light, useful, not ultimate; self-concept loosens",
      practices: ["self-inquiry-l3", "advaita-intro"],
      marker: "User reports 'I can be multiple versions of myself'"
    },
    {
      phase: "INTEGRATION",
      sessions: [15, 20],
      focus: "Fluid self; identity serves, not rules; roles are chosen, not given",
      practices: ["witness-l4", "jnana-discrimination"],
      marker: "User can shift roles without loss of self"
    }
  ],
  minimumSessions: 12,
  averageSessions: 19.5,
  regressionRisk: 0.33,
  regressionPrevention: ["Monthly identity fluidity check-in", "Role-experimentation practice"],
  postResolutionGift: "Fluid self: identity as tool, not truth",
};
```

### 9.9 CLUSTER_SHAME_CONCEALMENT

```ts
const SHAME_CONCEALMENT_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_SHAME_CONCEALMENT",
  rootLoop: "SHA001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice over-disclosure followed by withdrawal; perfectionism as shield",
      practices: ["shame-acknowledgment", "self-compassion-micro"],
      marker: "User can say 'I'm ashamed of this' without collapse"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 6],
      focus: "Create safety for imperfection; one small imperfection shared daily",
      practices: ["vulnerability-micro", "compassion-self"],
      marker: "User shares one imperfection with safe other without withdrawing"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [7, 12],
      focus: "Shame is universal; exposure is not danger; perfection is a myth",
      practices: ["grief-processing", "witness-l2"],
      marker: "User reports 'I can be imperfect and still belong'"
    },
    {
      phase: "INTEGRATION",
      sessions: [13, 18],
      focus: "Vulnerability is strength; shame is a visitor, not a resident",
      practices: ["vulnerability-deep", "bhakti-surrender"],
      marker: "User can be seen without shame; authenticity is baseline"
    }
  ],
  minimumSessions: 10,
  averageSessions: 16.2,
  regressionRisk: 0.36,
  regressionPrevention: ["Weekly vulnerability practice", "Shame-bravery ritual"],
  postResolutionGift: "Authentic presence: vulnerability without collapse",
};
```

### 9.10 CLUSTER_ATTACHMENT_ANCHOR

```ts
const ATTACHMENT_ANCHOR_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_ATTACHMENT_ANCHOR",
  rootLoop: "ATT001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice clinging; identity dissolves in relationship; separation = annihilation",
      practices: ["solitude-tolerance", "self-inquiry-l1"],
      marker: "User can name 'I'm afraid of being alone'"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 8],
      focus: "Build capacity for solitude; self is not relation",
      practices: ["solitude-practice", "inner-child-reparenting"],
      marker: "User can spend 2 hours alone without anxiety"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [9, 16],
      focus: "Autonomous connection: together and separate simultaneously",
      practices: ["attachment-repair", "witness-l3"],
      marker: "User reports 'I can be close AND independent'"
    },
    {
      phase: "INTEGRATION",
      sessions: [17, 24],
      focus: "Connection is choice, not need; love is free",
      practices: ["relationship-witness", "bhakti-pure"],
      marker: "User can let go without fear; relationship is nourishment, not survival"
    }
  ],
  minimumSessions: 15,
  averageSessions: 23.8,
  regressionRisk: 0.41,
  regressionPrevention: ["Weekly solitude practice", "Relationship autonomy check-in"],
  postResolutionGift: "Autonomous connection: love without merging",
};
```

### 9.11 CLUSTER_ADDICTIVE_ESCAPE

```ts
const ADDICTIVE_ESCAPE_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_ADDICTIVE_ESCAPE",
  rootLoop: "ADD001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice altered state preferred over present state; dopamine as self-medication",
      practices: ["craving-acknowledgment", "body-awareness"],
      marker: "User can name 'I'm using this to escape how I feel'"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 8],
      focus: "Create presence as alternative; 5-minute sitting before reaching for escape",
      practices: ["presence-micro", "urge-surfing"],
      marker: "User can sit with craving for 5 minutes without acting"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [9, 16],
      focus: "Present state is tolerable; boredom is not threat; discomfort is information",
      practices: ["equanimity-practice", "witness-l2"],
      marker: "User reports 'I can be bored/uncomfortable without escaping'"
    },
    {
      phase: "INTEGRATION",
      sessions: [17, 24],
      focus: "Presence is chosen; pleasure is savored, not consumed",
      practices: ["mindful-enjoyment", "bhakti-presence"],
      marker: "User can enjoy without compulsion; moderation is natural"
    }
  ],
  minimumSessions: 15,
  averageSessions: 22.4,
  regressionRisk: 0.47,
  regressionPrevention: ["Daily presence anchor", "Urge surfing protocol"],
  postResolutionGift: "Conscious presence: pleasure without compulsion",
};
```

### 9.12 CLUSTER_COMPARISON_GHOST

```ts
const COMPARISON_GHOST_PATHWAY: LoopResolutionPathway = {
  clusterId: "CLUSTER_COMPARISON_GHOST",
  rootLoop: "CMP001",
  dissolutionSequence: [
    {
      phase: "DETECTION",
      sessions: [1, 2],
      focus: "Notice other people's lives feel sharper; scrolling = subtle ache",
      practices: ["comparison-awareness", "self-worth-micro"],
      marker: "User can name 'I'm comparing myself to someone right now'"
    },
    {
      phase: "CONTAINMENT",
      sessions: [3, 6],
      focus: "30-day fast from one comparison surface; notice what fills the silence",
      practices: ["comparison-fast", "inner-authority"],
      marker: "User completes 7 days without comparison surface without relapse"
    },
    {
      phase: "TRANSFORMATION",
      sessions: [7, 12],
      focus: "Comparison is a measure of distance from self, not from others",
      practices: ["self-inquiry-l2", "witness-l3"],
      marker: "User reports 'I notice comparison but it doesn't stick'"
    },
    {
      phase: "INTEGRATION",
      sessions: [13, 18],
      focus: "Others' success is inspiration, not threat; journey is unique",
      practices: ["jnana-discrimination", "gratitude-practice"],
      marker: "User can celebrate others without diminishing self"
    }
  ],
  minimumSessions: 10,
  averageSessions: 14.9,
  regressionRisk: 0.32,
  regressionPrevention: ["Monthly comparison fast", "Inner authority check-in"],
  postResolutionGift: "Inner authority: comparison is recognized but not believed",
};
```

---

## 10. Database Schema Extensions

### 10.1 New Tables for Sub-Dimensional Tracking

```sql
-- Sub-dimensional snapshots: stores the 100-dimension state at a point in time
CREATE TABLE sub_dimension_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scores JSONB NOT NULL,  -- { "emotion.grief": 2.3, "thought.inner_critic": 1.8, ... }
  signals JSONB,          -- Raw signals that contributed to this snapshot
  confidence_avg NUMERIC(3,2),  -- Average confidence of contributing signals
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- Sub-dimensional ladder progression: tracks band level per sub-dimension
CREATE TABLE sub_dimension_ladders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sub_dimension_id TEXT NOT NULL,  -- e.g. "emotion.grief"
  current_band NUMERIC(3,1) NOT NULL DEFAULT 0.0,
  micro_level TEXT NOT NULL DEFAULT 'entering',  -- entering | deepening | mastery
  milestones JSONB,  -- Array of achieved milestones
  last_advanced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, sub_dimension_id)
);

-- Ladder dependency tracking: which sub-dims are blocked by which
CREATE TABLE ladder_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prerequisite_sub_dim TEXT NOT NULL,  -- e.g. "body.nervous_system_tone"
  dependent_sub_dim TEXT NOT NULL,      -- e.g. "emotion.grief"
  prerequisite_band NUMERIC(3,1) NOT NULL,  -- Required band
  current_prereq_band NUMERIC(3,1) NOT NULL,  -- Actual current band
  is_satisfied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loop co-occurrence matrix (aggregated across users)
CREATE TABLE loop_co_occurrence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_a TEXT NOT NULL,
  loop_b TEXT NOT NULL,
  co_occurrence_count INT NOT NULL DEFAULT 0,
  typical_sequence TEXT NOT NULL,  -- A_then_B | B_then_A | simultaneous
  average_gap_days NUMERIC(4,1),
  resolution_correlation JSONB,  -- [{ practiceId, successRate, typicalSessions }]
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(loop_a, loop_b)
);

-- Loop Genome edges: the knowledge graph
CREATE TABLE loop_genome_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node TEXT NOT NULL,
  to_node TEXT NOT NULL,
  relationship TEXT NOT NULL,  -- triggers | resolves | unlocks | blocks | co_occurs_with
  strength NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  evidence TEXT NOT NULL,  -- clinical | aggregated_user_data | expert_curated
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  source_references JSONB,  -- Research citations, user data sources
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shadow entries: detected but not yet conscious loops
CREATE TABLE shadow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loop_id TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,  -- 0-1: how sure are we?
  detection_method TEXT NOT NULL,  -- language_gap | behavior_pattern | cross_quadrant_mismatch | ai_inference
  expressions JSONB,  -- Observable expressions
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  integrated_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',  -- active | invited | explored | integrated | dissolved
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dynamic constellation snapshots: daily practice weight map
CREATE TABLE constellation_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  practices JSONB NOT NULL,  -- [{ practiceId, weight, level, trend, lastPracticed, loopAffinities }]
  center_of_gravity TEXT NOT NULL,  -- practiceId
  tension_lines JSONB,  -- [{ practiceA, practiceB, tensionType }]
  evolution JSONB,  -- Past 7 snapshots for trajectory
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- Resonance patterns: cross-user intelligence (anonymized)
CREATE TABLE resonance_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_signature TEXT NOT NULL,  -- Hash of: band + active_loops + sub_dim_snapshot
  users_in_pattern INT NOT NULL DEFAULT 0,
  average_journey JSONB NOT NULL,  -- sessionsToNextBand, mostEffectivePractices, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pattern_signature)
);

-- Temporal signals: cross-scale correlations
CREATE TABLE temporal_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scale TEXT NOT NULL,  -- micro | meso | macro | mega | meta
  signal_type TEXT NOT NULL,
  signal_data JSONB NOT NULL,
  prediction JSONB,  -- { targetScale, confidence, expectedOutcome, timeframe }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Practice genome: complete intervention mapping per practice
CREATE TABLE practice_genome (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id TEXT NOT NULL UNIQUE,
  sub_dimension_targets JSONB NOT NULL,  -- [{ subDimensionId, impactStrength, bandRange, mechanism }]
  loop_targets JSONB NOT NULL,  -- [{ loopId, dissolutionProbability, minimumSessions, mechanism }]
  prerequisite_practices JSONB NOT NULL,  -- [practiceId, ...]
  contraindicated_with JSONB NOT NULL,  -- [practiceId, ...]
  integration_practices JSONB NOT NULL,  -- [practiceId, ...]
  mode_requirements JSONB NOT NULL,  -- [modeId, ...]
  energy_required TEXT NOT NULL,  -- low | medium | high
  time_minimum_minutes INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Emergent curriculum: per-user adaptive rules
CREATE TABLE emergent_curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_arc JSONB NOT NULL,
  past_arcs JSONB,
  emergent_patterns JSONB,  -- [{ pattern, confidence, evidence }]
  adaptive_rules JSONB,  -- [{ condition, action, confidence, lastValidated }]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Consciousness compass: directional intelligence
CREATE TABLE consciousness_compasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_heading JSONB NOT NULL,
  trajectory JSONB NOT NULL,
  bearing JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Sacred pause audit log: ethical architecture compliance
CREATE TABLE sacred_pause_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,  -- recommendation | nudge | intervention | insight
  action_data JSONB NOT NULL,
  ethical_checks JSONB NOT NULL,  -- [{ rule, passed, reason }]
  user_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integral quadrant signals: tracks I/We/It/Its per signal
CREATE TABLE integral_quadrant_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quadrant TEXT NOT NULL,  -- I | We | It | Its
  signal_type TEXT NOT NULL,
  signal_data JSONB NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,
  source_session_id UUID,
  source_journal_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shadow integration protocol tracking
CREATE TABLE shadow_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shadow_entry_id UUID NOT NULL REFERENCES shadow_entries(id),
  phase TEXT NOT NULL,  -- detection | containment | exploration | dialogue | integration | witnessing
  practices_assigned JSONB,
  user_response JSONB,  -- explicit feedback or implicit signal
  next_phase_trigger TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 10.2 RLS Policies

```sql
-- All new tables have the same RLS pattern: users can read/write their own data
-- Admins can read anonymized aggregates for research

-- Example for sub_dimension_snapshots
ALTER TABLE sub_dimension_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sub-dimension snapshots"
  ON sub_dimension_snapshots FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anonymized read for research
CREATE POLICY "Admins read anonymized sub-dimension aggregates"
  ON sub_dimension_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### 10.3 Edge Functions for New Systems

#### `sub-dimension-tracker`

```ts
// supabase/functions/sub-dimension-tracker/index.ts
// Aggregates signals and updates 100-dimension snapshot + ladders
import { createClient } from '@supabase/supabase-js';
import { getDimensionSignals } from '../_shared/dimension-signals.ts';
import { applyLadderDependencies } from '../_shared/ladder-dependencies.ts';

export default async function handler(req: Request) {
  const supabase = createClient(req);
  const { userId, sessionId, signals } = await req.json();

  // 1. Aggregate sub-dimensional signals from all sources
  const dimensionSignals = await getDimensionSignals(supabase, userId, signals);

  // 2. Check ladder dependencies (bypassing detector)
  const blockedDims = await applyLadderDependencies(supabase, userId, dimensionSignals);

  // 3. Update sub-dimension snapshots
  const { error } = await supabase
    .from('sub_dimension_snapshots')
    .upsert({
      user_id: userId,
      snapshot_date: new Date().toISOString().split('T')[0],
      scores: aggregateScores(dimensionSignals),
      signals: dimensionSignals,
      confidence_avg: avgConfidence(dimensionSignals),
    });

  // 4. Update ladder positions
  for (const [subDim, delta] of Object.entries(scoreDeltas)) {
    if (blockedDims.has(subDim)) continue;  // Bypassing guard
    await updateLadderPosition(supabase, userId, subDim, delta);
  }

  return new Response(JSON.stringify({ success: true, blocked: Array.from(blockedDims) }));
}
```

#### `loop-cluster-detector`

```ts
// supabase/functions/loop-cluster-detector/index.ts
// Detects active loop clusters from journal + session data
export default async function handler(req: Request) {
  const { userId, journalId, sessionId } = await req.json();

  // 1. Detect active loops using existing detect-anomalies logic
  const activeLoops = await detectActiveLoops(userId, journalId, sessionId);

  // 2. Map loops to clusters
  const activeClusters = mapToClusters(activeLoops);

  // 3. Find anti-cluster practices
  const prescriptions = activeClusters.map(cluster => ({
    clusterId: cluster.id,
    antiClusterPractices: getAntiClusterPractices(cluster.antiCluster),
    resolutionSequence: getResolutionSequence(cluster.id),
  }));

  // 4. Update co-occurrence matrix
  await updateCoOccurrence(activeLoops);

  // 5. Feed into Composer
  await supabase.from('engine_signals').insert({
    user_id: userId,
    type: 'loop_cluster',
    data: { clusters: activeClusters, prescriptions },
  });

  return new Response(JSON.stringify({ clusters: activeClusters, prescriptions }));
}
```

#### `shadow-integration-engine`

```ts
// supabase/functions/shadow-integration-engine/index.ts
// Manages the 6-phase shadow integration protocol
export default async function handler(req: Request) {
  const { userId, shadowId, phase, userResponse } = await req.json();

  const shadow = await supabase
    .from('shadow_entries')
    .select('*')
    .eq('id', shadowId)
    .single();

  const protocol = SHADOW_INTEGRATION_PROTOCOLS[shadow.loop_id];

  switch (phase) {
    case 'detection':
      // Shadow is flagged; user is invited, not told
      await inviteExploration(userId, shadow, protocol);
      break;
    case 'containment':
      // Body-based practice first; nervous system regulation
      await assignContainmentPractice(userId, shadow);
      break;
    case 'exploration':
      // Guided inquiry; shadow given voice
      await assignExplorationPractice(userId, shadow, protocol);
      break;
    case 'dialogue':
      // Structured dialogue between conscious self and shadow
      await facilitateDialogue(userId, shadow);
      break;
    case 'integration':
      // Shadow's gift identified; capacity reclaimed
      await completeIntegration(userId, shadow, protocol);
      break;
    case 'witnessing':
      // Future shadow activation recognized earlier
      await establishWitnessingPractice(userId, shadow);
      break;
  }

  await supabase.from('shadow_integrations').insert({
    user_id: userId,
    shadow_entry_id: shadowId,
    phase,
    practices_assigned: protocol.practices[phase],
  });

  return new Response(JSON.stringify({ success: true, nextPhase: getNextPhase(phase) }));
}
```

---

## 11. Frontend Integration Patterns

### 11.1 Sub-Dimension Radial UI

The existing `DimensionHumanMap.tsx` component is extended to show the 100 sub-dimensions in a radial layout. Each sub-dimension is a node on the wheel, colored by its current band:

```tsx
// components/humanMap/SubDimensionRadial.tsx
interface SubDimensionRadialProps {
  userId: string;
  dimensionId: DimensionId;
}

export function SubDimensionRadial({ userId, dimensionId }: SubDimensionRadialProps) {
  const { data: subDims } = useQuery({
    queryKey: ['sub-dimensions', userId, dimensionId],
    queryFn: () => fetchSubDimensions(userId, dimensionId),
  });

  const anglePerSubDim = (2 * Math.PI) / subDims.length;

  return (
    <div className="relative w-80 h-80">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {subDims.map((subDim, i) => {
          const angle = i * anglePerSubDim - Math.PI / 2;
          const x = 100 + 70 * Math.cos(angle);
          const y = 100 + 70 * Math.sin(angle);
          const bandColor = BAND_COLORS[Math.floor(subDim.currentBand)];

          return (
            <g key={subDim.id}>
              <circle
                cx={x} cy={y} r={8}
                fill={bandColor}
                className="cursor-pointer hover:r-10 transition-all"
                onClick={() => openSubDimensionDetail(subDim)}
              />
              <text
                x={x} y={y - 12}
                textAnchor="middle"
                className="text-xs fill-current"
              >
                {subDim.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

### 11.2 Loop Cluster Visualization

```tsx
// components/loops/LoopClusterMap.tsx
interface LoopClusterMapProps {
  userId: string;
}

export function LoopClusterMap({ userId }: LoopClusterMapProps) {
  const { data: activeClusters } = useQuery({
    queryKey: ['loop-clusters', userId],
    queryFn: () => fetchActiveClusters(userId),
  });

  return (
    <div className="space-y-4">
      {activeClusters?.map(cluster => (
        <LoopClusterCard
          key={cluster.id}
          cluster={cluster}
          resolutionPathway={getResolutionPathway(cluster.id)}
          onStartResolution={() => startResolutionProtocol(userId, cluster.id)}
        />
      ))}
    </div>
  );
}
```

### 11.3 Shadow Integration UX

```tsx
// components/shadows/ShadowIntegrationFlow.tsx
// The shadow is NEVER directly shown to the user.
// Instead, the system uses invitation language.

export function ShadowIntegrationFlow({ userId }: { userId: string }) {
  const [phase, setPhase] = useState<ShadowPhase>('detection');
  const [activeShadow, setActiveShadow] = useState<ShadowEntry | null>(null);

  const invitationCopy = {
    detection: "I notice something interesting in your recent sessions. Would you like to explore it?",
    containment: "Let's create a safe space before we go deeper. I have a practice for that.",
    exploration: "There's a part of you that has something to say. Let's give it a voice.",
    dialogue: "What if the part you've been avoiding is actually trying to help?",
    integration: "I see what this has been protecting. Let's honor that.",
    witnessing: "You're becoming your own detector. Here's how to continue.",
  };

  return (
    <div className="shadow-integration-flow">
      {activeShadow && (
        <div className="invitation-card">
          <p className="invitation-copy">{invitationCopy[phase]}</p>
          <div className="actions">
            <button onClick={() => acceptInvitation(userId, activeShadow.id)}>
              Yes, let's explore
            </button>
            <button onClick={() => declineInvitation(userId, activeShadow.id)}>
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 11.4 Consciousness Compass Widget

```tsx
// components/compass/ConsciousnessCompass.tsx
export function ConsciousnessCompass({ userId }: { userId: string }) {
  const { data: compass } = useQuery({
    queryKey: ['consciousness-compass', userId],
    queryFn: () => fetchConsciousnessCompass(userId),
  });

  if (!compass) return null;

  return (
    <div className="compass-widget">
      <div className="heading">
        <h3>Your Journey</h3>
        <CompassVisual direction={compass.trajectory.direction} />
      </div>
      <div className="trajectory">
        <Stat label="Current Band" value={compass.currentHeading.band.toFixed(1)} />
        <Stat label="Direction" value={compass.trajectory.direction} />
        <Stat label="30-Day Prediction" value={`Band ${compass.trajectory.predictedBandIn30Days.toFixed(1)}`} />
      </div>
      {compass.bearing.suggestedPivot && (
        <div className="pivot-suggestion">
          <LightbulbIcon />
          <p>{compass.bearing.suggestedPivot}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 12. Edge Function Registry for New Systems

| Function | Purpose | Trigger | Output |
|---|---|---|---|
| `sub-dimension-tracker` | Aggregate signals → update 100-dim snapshot + ladders | Every session complete, journal entry, external signal | Updated sub_dimension_snapshots + sub_dimension_ladders |
| `sub-dimension-assessment` | Continuous assessment from multi-source signals | Background (every 6 hours) | IntegralAssessmentSignal |
| `loop-cluster-detector` | Detect active loop clusters from user data | Every session complete, journal entry | Active clusters + anti-cluster prescriptions |
| `loop-co-occurrence-updater` | Update population-level co-occurrence matrix | When two loops detected within 7 days | Updated loop_co_occurrence row |
| `loop-genome-query` | Answer graph queries (A→B probability, best practice for pair) | Composer request | LoopGenomePath |
| `shadow-integration-engine` | Manage 6-phase shadow integration protocol | Shadow detected, user response | Next phase + practices |
| `shadow-detection` | Detect shadows via language gap, quadrant mismatch, pattern window | Every journal entry, session | ShadowEntry candidates |
| `dynamic-constellation` | Recompute daily practice weights from live signals | Daily (at gate transition) | Updated constellation_snapshots |
| `resonance-matcher` | Find similar users and their effective practices | After session complete | ResonancePattern |
| `practice-genome-updater` | Update practice genome from session outcomes | After session complete | Updated practice_genome |
| `emergent-rule-generator` | Generate/update adaptive rules per user | After each session (implicit + explicit feedback) | Updated adaptive_rules |
| `consciousness-compass` | Compute trajectory, bearing, predictions | Daily | consciousness_compasses row |
| `temporal-weave-analyzer` | Correlate signals across time scales | Weekly | TemporalSignal predictions |
| `sacred-pause-audit` | Log all AI actions for ethical compliance | Every AI-generated recommendation | sacred_pause_audit row |
| `integral-quadrant-classifier` | Tag every signal with I/We/It/Its quadrant | Every signal ingestion | Updated integral_quadrant_signals |

---

## 13. Type System Extensions

```ts
// src/types/integral.ts
// New types that extend the existing consciousness type system

export type Quadrant = 'I' | 'We' | 'It' | 'Its';
export type ShadowPhase = 'detection' | 'containment' | 'exploration' | 'dialogue' | 'integration' | 'witnessing';
export type TimeScale = 'micro' | 'meso' | 'macro' | 'mega' | 'meta';
export type LoopRelationship = 'triggers' | 'resolves' | 'unlocks' | 'blocks' | 'co_occurs_with';
export type EvidenceType = 'clinical' | 'aggregated_user_data' | 'expert_curated';
export type DetectionMethod = 'language_gap' | 'behavior_pattern' | 'cross_quadrant_mismatch' | 'ai_inference';

// Extend existing DimensionSignal with quadrant
export interface IntegralDimensionSignal extends DimensionSignal {
  quadrant: Quadrant;
  crossQuadrantMismatch?: boolean;  // True when I and It disagree
}

// Extend UserContext with new fields
export interface ExtendedUserContext extends UserContext {
  subDimensionSnapshot: Record<string, number>;  // 100-dim scores
  ladderDependencies: LadderDependency[];
  activeClusters: LoopCluster[];
  activeShadows: ShadowEntry[];
  dynamicConstellation: DynamicConstellation;
  consciousnessCompass: ConsciousnessCompass;
  integralQuadrants: {
    I: QuadrantSignal[];
    We: QuadrantSignal[];
    It: QuadrantSignal[];
    Its: QuadrantSignal[];
  };
  temporalSignals: TemporalSignal[];
  adaptiveRules: AdaptiveRule[];
  resonancePattern?: ResonancePattern;
}
```

---

## 14. Testing Strategy for New Systems

### 14.1 Sub-Dimensional Ladder Tests

```ts
// src/test/ladderEngine.test.ts
describe('Sub-Dimensional Ladder Engine', () => {
  it('should advance emotion.grief from Band 1 to Band 2 with sufficient signals', () => {
    const signals: DimensionSignal[] = [
      { dimension: 'emotion.grief', delta: 0.15, confidence: 0.8, source: 'practice', timestamp: '...' },
      { dimension: 'emotion.grief', delta: 0.12, confidence: 0.7, source: 'journal', timestamp: '...' },
      { dimension: 'emotion.grief', delta: 0.10, confidence: 0.9, source: 'reflection', timestamp: '...' },
    ];
    const newBand = applySignalsAndCalculateBand('emotion.grief', 1.0, signals);
    expect(newBand).toBeGreaterThanOrEqual(2.0);
  });

  it('should NOT advance emotion.grief if body.nervous_system_tone is below Band 2', () => {
    // Ladder dependency: emotion sub-dims cannot exceed nervous_system_tone + 1
    const blocked = checkLadderDependencies('emotion.grief', 3.0, {
      'body.nervous_system_tone': 1.0,
    });
    expect(blocked).toBe(true);
  });

  it('should block advancement when bypassing risk is detected', () => {
    const risk = checkBypassingRisk({
      skillLevel: 4.0,  // User is at Band 4 in emotion.joy
      stateBand: 1.5,   // But body.nervous_system_tone is at Band 1.5
    });
    expect(risk.isBypassing).toBe(true);
  });
});
```

### 14.2 Loop Cluster Tests

```ts
// src/test/loopClusters.test.ts
describe('Loop Cluster Detection', () => {
  it('should map VAL001 + SOC001 to CLUSTER_VALIDATION_ANCHOR', () => {
    const clusters = detectClusters(['VAL001', 'SOC001', 'EGO001']);
    expect(clusters).toContainEqual({
      id: 'CLUSTER_VALIDATION_ANCHOR',
      memberLoopIds: expect.arrayContaining(['VAL001', 'SOC001']),
    });
  });

  it('should suggest anti-cluster practices for active cluster', () => {
    const prescriptions = getPrescriptionsForCluster('CLUSTER_VALIDATION_ANCHOR');
    expect(prescriptions.practices).toContain('witness-l2');
    expect(prescriptions.practices).toContain('bhakti-foundation');
  });

  it('should update co-occurrence when two loops are detected within 7 days', () => {
    const matrix = updateCoOccurrence('VAL001', 'CTL001', 5); // 5 days apart
    expect(matrix.coOccurrenceCount).toBeGreaterThan(0);
    expect(matrix.typicalSequence).toBe('A_then_B');
  });
});
```

### 14.3 Shadow Integration Tests

```ts
// src/test/shadowIntegration.test.ts
describe('Shadow Integration Engine', () => {
  it('should detect shadow via language gap', () => {
    const journals = [
      { text: "I'm so busy with work", partnerMentions: 0 },
      { text: "Work is all I think about", partnerMentions: 0 },
    ];
    const calendar = { partnerEventsLast30Days: 0 };
    const shadows = detectShadowsByLanguageGap(journals, calendar);
    expect(shadows).toContainEqual(expect.objectContaining({
      loopId: expect.stringMatching(/REL|ATT/),
      detectionMethod: 'language_gap',
    }));
  });

  it('should surface shadow via invitation, not diagnosis', () => {
    const invitation = generateShadowInvitation(shadows[0]);
    expect(invitation).not.toContain('you have a shadow');
    expect(invitation).toContain('I notice something interesting');
  });

  it('should progress through phases correctly', () => {
    const integration = createShadowIntegration(shadowId, 'detection');
    expect(integration.phase).toBe('detection');
    expect(integration.nextPhase).toBe('containment');

    advancePhase(integration, 'containment');
    expect(integration.phase).toBe('containment');
    expect(integration.practicesAssigned).toContain('safety-anchor');
  });
});
```

---

## 15. Migration Strategy from Existing System

### 15.1 Data Migration

```ts
// scripts/migrate-to-100-dimensions.ts
// Migrates existing 6-dimension data to 100-dimension structure

import { DIMENSIONS_100 } from '../src/lib/consciousness/taxonomy/dimensions100.ts';
import { DIMENSION_IMPACT_MATRIX } from '../src/types/dimension-matrix.ts';

async function migrateTo100Dimensions(userId: string) {
  // 1. Fetch existing 6-dimension scores
  const profile = await fetchUserConsciousnessProfile(userId);
  const sixDimScores = profile.dimension_bands;

  // 2. Derive initial 100-dimension scores via impact matrix
  const hundredDimScores: Record<string, number> = {};
  for (const subDim of DIMENSIONS_100) {
    const parentScore = sixDimScores[subDim.parent] ?? 0;
    const practiceImpacts = getPracticeImpactsForSubDim(subDim.id);
    const derivedScore = parentScore * (0.7 + 0.3 * average(practiceImpacts));
    hundredDimScores[subDim.id] = derivedScore;
  }

  // 3. Insert initial snapshot
  await supabase.from('sub_dimension_snapshots').insert({
    user_id: userId,
    scores: hundredDimScores,
    confidence_avg: 0.3,  // Low confidence — derived, not measured
    signals: [{ source: 'migration', note: 'Initial 100-dim derivation from 6-dim profile' }],
  });

  // 4. Initialize ladder positions from existing band
  const ladderInitializations = DIMENSIONS_100.map(subDim => ({
    user_id: userId,
    sub_dimension_id: subDim.id,
    current_band: Math.floor(hundredDimScores[subDim.id]),
    micro_level: 'entering',
  }));

  await supabase.from('sub_dimension_ladders').insert(ladderInitializations);

  // 5. Seed loop clusters from existing loop data
  const existingLoops = await fetchActiveLoops(userId);
  const activeClusters = detectClusters(existingLoops.map(l => l.id));
  await supabase.from('user_loop_clusters').insert({
    user_id: userId,
    active_clusters: activeClusters,
  });
}
```

### 15.2 Feature Flag Strategy

```ts
// src/lib/featureFlags.ts
export const FEATURE_FLAGS = {
  SUB_DIMENSION_TRACKING: 'sub_dimension_tracking',
  LOOP_CLUSTERS: 'loop_clusters',
  SHADOW_INTEGRATION: 'shadow_integration',
  DYNAMIC_CONSTELLATION: 'dynamic_constellation',
  RESONANCE_ENGINE: 'resonance_engine',
  CONSCIOUSNESS_COMPASS: 'consciousness_compass',
  SACRED_PAUSE: 'sacred_pause',
  EMERGENT_CURRICULUM: 'emergent_curriculum',
} as const;

export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS, userId: string): boolean {
  // Check user's feature flags in database
  // Roll out progressively: 5% → 25% → 50% → 100%
  const rolloutPercentage = FEATURE_ROLLOUT[flag];
  const userBucket = hashCode(userId) % 100;
  return userBucket < rolloutPercentage;
}
```

---

## 16. Open Questions (Expanded)

1. **Should the 100-dimension taxonomy be published as a research instrument?** If so, which dimensions stay proprietary (the ladders and clustering) and which become open (the names and structure)?
2. **Should the Loop Genome be user-visible?** Users could see "Here are the 3 loops that are most active in you right now" — but full disclosure of the genome graph might be overwhelming.
3. **How does the Shadow Integration Engine interact with the bypassing detector?** Shadows are, by definition, not visible to the user. How does the system surface them without creating new bypassing?
4. **What's the minimum viable version of the Loop Genome?** The co-occurrence matrix requires significant user data. Can we seed it with expert-curated relationships and let it learn from there?
5. **How does the Integral Quadrants model integrate with the existing 6-dimension model?** Are they parallel systems or does one reduce to the other?
6. **What is the right balance between rule-based ladder logic and ML-based trajectory prediction?** The ladders are deterministic; the compass predictions are statistical. How do we blend them without creating conflicting guidance?
7. **How do we handle cross-cultural validity of the 100-dimension taxonomy?** The current taxonomy is heavily informed by Western psychology + Indian spirituality. How do we validate it across cultures without losing specificity?
8. **What's the data storage cost of tracking 100 sub-dimensions × 10,000 users × 365 days?** Is this feasible at scale, or do we need a sampling strategy?
9. **How does the Emergent Curriculum interact with the existing program library?** Do programs become templates that the emergent system personalizes, or do they get replaced entirely?
10. **What's the ethical boundary for the Shadow Integration Engine?** Detecting a user's shadow and then surfacing it is a powerful intervention. How do we ensure consent, safety, and appropriate escalation to human support?

---

*This document is a living architecture specification. Update as each layer is implemented and the data reveals new patterns.*
