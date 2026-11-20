# ConsciousOS Engine v2 — Complete Technical Architecture

> **Status**: Reference Document for Implementation  
> **Version**: 2.0  
> **Last Updated**: 2026-03-08  
> **Authors**: Council of Five (Systems Architect, Consciousness Researcher, ML/AI Architect, Product Designer, Scale Engineer)

---

## Table of Contents

1. [Philosophy & Core Principles](#1-philosophy--core-principles)
2. [The Unified State Vector](#2-the-unified-state-vector)
3. [V-Level Computation (Emergent)](#3-v-level-computation-emergent)
4. [4-Dimension Band System](#4-4-dimension-band-system)
5. [Witness Quality Engine](#5-witness-quality-engine)
6. [3-Lens LLM Architecture (Three Brains)](#6-3-lens-llm-architecture-three-brains)
7. [Loop Detection & Samskara Clustering](#7-loop-detection--samskara-clustering)
8. [Chakra Correlation System](#8-chakra-correlation-system)
9. [4 Yoga Paths — Affinity Detection](#9-4-yoga-paths--affinity-detection)
10. [Chitta Vritti Classification](#10-chitta-vritti-classification)
11. [12 Horizontal Capacities](#11-12-horizontal-capacities)
12. [Peak vs Baseline & Integration Score](#12-peak-vs-baseline--integration-score)
13. [Regression & Dark Night Engine](#13-regression--dark-night-engine)
14. [Spiritual Bypassing Detector](#14-spiritual-bypassing-detector)
15. [Relationship Mirror Engine](#15-relationship-mirror-engine)
16. [Circadian Consciousness Engine](#16-circadian-consciousness-engine)
17. [Cross-Dimensional Correlation Matrix](#17-cross-dimensional-correlation-matrix)
18. [User Archetype Detection](#18-user-archetype-detection)
19. [Experience Generation (Output)](#19-experience-generation-output)
20. [Memory Architecture](#20-memory-architecture)
21. [Scale & Cost Model](#21-scale--cost-model)
22. [Daily Engine Cycle](#22-daily-engine-cycle)
23. [Database Schema Requirements](#23-database-schema-requirements)
24. [Implementation Priority](#24-implementation-priority)

---

## 1. Philosophy & Core Principles

### The Engine Is NOT a Feature — It IS the Product

ConsciousOS is not a meditation app with an engine bolted on. The engine IS the product. Everything — conversations, tasks, journal prompts, Guide language — flows FROM the engine's understanding of the user.

### Core Principles

1. **All systems are projections of ONE reality**: V-Levels, Chakras, Loops, Dimensions are not separate tracking systems. They are different LENSES on the same underlying human consciousness state.

2. **V-Level is EMERGENT, never directly measured**: It computes from dimensions + witness + loops + time. No one is ever "assigned" a V-Level.

3. **Weakest dimension CAPS growth**: A person at Thought Band 4 but Emotion Band 0 cannot be V-Level 4. Consciousness is not a cherry-picked highlight reel.

4. **Numbers are NEVER shown to users**: The engine speaks in qualitative, band-appropriate language. Internally it's math. Externally it's poetry.

5. **Regression is normal and honored**: Going "backward" is part of the journey. The engine distinguishes regression from genuine band drop.

6. **The engine serves awakening, never replaces it**: AI amplifies awareness; it doesn't manufacture it. The user is always the witness.

---

## 2. The Unified State Vector

Every user has ONE state vector. All systems read from it, all inputs write to it. This is the single source of truth.

### Complete Schema

```json
{
  // ═══════════════════════════════════════════
  // CORE DIMENSIONS (Primary measurement axes)
  // ═══════════════════════════════════════════
  "dimensions": {
    "thought": 0.0,      // 0.0 - 7.0 | Can you observe your thoughts?
    "emotion": 0.0,      // 0.0 - 7.0 | Can you feel without reacting?
    "body": 0.0,         // 0.0 - 7.0 | Are you present in your body?
    "awareness": 0.0     // 0.0 - 7.0 | Meta-awareness of awareness itself
  },

  // ═══════════════════════════════════════════
  // V-LEVEL (Emergent — computed, never set directly)
  // ═══════════════════════════════════════════
  "v_level_baseline": 0.0,    // Highest sustained level (daily life)
  "v_level_peak": 0.0,        // Highest experienced in practice
  "v_level_current": 0.0,     // Real-time (may be lower during regression)
  "integration_score": 0.0,   // 0-1 | How much peak → baseline conversion

  // ═══════════════════════════════════════════
  // WITNESS QUALITY (The meta-dimension)
  // ═══════════════════════════════════════════
  "witness_gap": 0.0,         // 0.0 - 1.0 | Space between stimulus & response
  "witness_stability": 0.0,   // 0.0 - 1.0 | Consistency across situations
  "witness_depth": 0.0,       // 0.0 - 1.0 | Depth of observation capacity

  // ═══════════════════════════════════════════
  // CHITTA VRITTI (Real-time mental weather)
  // ═══════════════════════════════════════════
  "chitta_vritti": "kshipta", // kshipta|mudha|vikshipta|ekagra|niruddha
  "vritti_trend": "stable",   // improving|stable|degrading
  "vritti_history_7d": [],     // Last 7 days for pattern detection

  // ═══════════════════════════════════════════
  // CHAKRA SYSTEM (Energy correlations)
  // ═══════════════════════════════════════════
  "chakras": {
    "root": 0.0,        // Muladhara  | Survival, grounding, safety
    "sacral": 0.0,      // Svadhisthana | Creativity, emotion, pleasure
    "solar": 0.0,       // Manipura | Will, power, identity
    "heart": 0.0,       // Anahata | Love, compassion, connection
    "throat": 0.0,      // Vishuddha | Expression, truth, communication
    "third_eye": 0.0,   // Ajna | Intuition, insight, awareness
    "crown": 0.0        // Sahasrara | Transcendence, unity, source
  },

  // ═══════════════════════════════════════════
  // LOOP SYSTEM (Blind spots)
  // ═══════════════════════════════════════════
  "active_loops": [],          // Currently active loop IDs
  "loop_awareness": {},        // { "loop_id": 0.0-1.0 } awareness per loop
  "loop_severity": {},         // { "loop_id": "dormant"|"active"|"acute" }

  // ═══════════════════════════════════════════
  // SAMSKARA CLUSTERS (Root causes below loops)
  // ═══════════════════════════════════════════
  "samskara_clusters": [
    // {
    //   "root_wound": "unworthiness",
    //   "loops": ["worth_loop", "people_pleasing", "overachieving"],
    //   "depth": 0.0-1.0,
    //   "awareness": 0.0-1.0,
    //   "chakra_correlation": ["heart", "solar"]
    // }
  ],

  // ═══════════════════════════════════════════
  // YOGA PATH AFFINITY (Natural learning style)
  // ═══════════════════════════════════════════
  "yoga_path_affinity": {
    "karma": 0.0,   // Learns through action/service
    "bhakti": 0.0,  // Learns through devotion/emotion
    "jnana": 0.0,   // Learns through knowledge/inquiry
    "raja": 0.0     // Learns through meditation/discipline
  },
  "dominant_path": null,  // Computed from highest affinity

  // ═══════════════════════════════════════════
  // 12 HORIZONTAL CAPACITIES (Behavioral skills)
  // ═══════════════════════════════════════════
  "h_capacities": {
    "awareness": 0,    // 0-10 | Open, receptive attention
    "stillness": 0,    // 0-10 | Capacity for inner quiet
    "presence": 0,     // 0-10 | Being in the now
    "inquiry": 0,      // 0-10 | Questioning assumptions
    "equanimity": 0,   // 0-10 | Balance amid change
    "compassion": 0,   // 0-10 | Kindness toward self/others
    "wisdom": 0,       // 0-10 | Discerning insight
    "courage": 0,      // 0-10 | Facing what arises
    "patience": 0,     // 0-10 | Allowing natural timing
    "humility": 0,     // 0-10 | Knowing one's limits
    "generosity": 0,   // 0-10 | Giving freely
    "dedication": 0    // 0-10 | Sustained commitment
  },

  // ═══════════════════════════════════════════
  // RELATIONAL DIMENSION
  // ═══════════════════════════════════════════
  "relational": {
    "dimension_band": 0.0,   // 0-7 | Consciousness in relationship
    "trigger_map": {},        // { "authority": "power_loop", "intimacy": "safety_loop" }
    "shadow_projections": [], // What user projects onto others
    "mirror_active": []       // Current relationship mirrors
  },

  // ═══════════════════════════════════════════
  // STATE FLAGS
  // ═══════════════════════════════════════════
  "state": "normal",           // normal|dark_night|breakthrough|plateau|bypassing
  "bypassing_risk": 0.0,       // 0-1 | Spiritual bypassing probability
  
  "regression": {
    "baseline_highest": 0.0,   // Highest stable V-Level ever reached
    "current_delta": 0.0,      // Difference from baseline (negative = regressing)
    "dark_night_count": 0,     // Number of dark night episodes
    "last_regression": null,   // ISO date
    "recovery_trajectory": null // "ascending"|"flat"|"descending"|null
  },

  // ═══════════════════════════════════════════
  // CIRCADIAN PROFILE
  // ═══════════════════════════════════════════
  "circadian_profile": {
    "peak_practice_time": null,     // "brahma_muhurta"|"morning"|"afternoon"|"evening"|"night"
    "natural_rhythm": null,         // "early_bird"|"night_owl"|"irregular"
    "consistency_score": 0.0,       // 0-1 | How regular is their practice
    "moon_sensitivity": 0.0         // 0-1 | Does moon cycle affect them (detected over time)
  },

  // ═══════════════════════════════════════════
  // JOURNEY METADATA
  // ═══════════════════════════════════════════
  "journey_day": 1,
  "journey_phase": "assessment",   // assessment|foundation|exploration|integration|mastery
  "total_sessions": 0,
  "total_journal_entries": 0,
  "streak_current": 0,
  "streak_longest": 0,
  "last_session_at": null
}
```

### Size: ~2KB per user → 2GB at 1M users → Trivial

---

## 3. V-Level Computation (Emergent)

V-Level is NEVER directly set. It is always COMPUTED from other dimensions.

### The Formula

```
v_level = weighted_dimension_score × witness_modifier × loop_penalty × integration_bonus

WHERE:

  weighted_dimension_score =
    0.50 × min(thought, emotion, body, awareness)     // Weakest dominates
  + 0.30 × avg(thought, emotion, body, awareness)     // Average contributes
  + 0.20 × max(thought, emotion, body, awareness)     // Strongest adds ceiling

  witness_modifier =
    0.70 + (0.30 × witness_gap)                        // Range: 0.70 - 1.00
                                                        // Witness boosts up to 30%

  loop_penalty =
    1.0 - (0.05 × count_of_acute_loops)                // Each acute loop = -5%
    - (0.02 × count_of_active_loops)                   // Each active loop = -2%
    // Minimum: 0.50 (loops can't reduce more than 50%)

  integration_bonus =
    1.0 + (0.10 × integration_score)                   // Range: 1.00 - 1.10
                                                        // Rewarding peak→baseline conversion
```

### V-Level to Band Mapping

| V-Level Range | Band | Name | Sub-levels |
|---------------|------|------|------------|
| 0.0 - 0.99 | 0 | THE SLEEPER 🌑 | 0.1 Autopilot, 0.2 First Friction, 0.3 Readiness |
| 1.0 - 1.99 | 1 | THE QUESTIONER 🌒 | 1.1 First Doubt, 1.2 Seeking Begins, 1.3 Inner Turning |
| 2.0 - 2.99 | 2 | THE OBSERVER 🌓 | 2.1 Witness in Practice, 2.2 Witness in Life, 2.3 Witness Stabilized |
| 3.0 - 3.99 | 3 | THE ALCHEMIST 🌔 | 3.1 Pattern Recognition, 3.2 Emotional Alchemy, 3.3 Shadow Integration |
| 4.0 - 4.99 | 4 | THE NAVIGATOR 🌕 | 4.1 The Pause, 4.2 Conscious Choice, 4.3 Response Mastery |
| 5.0 - 5.99 | 5 | THE ARCHITECT 🌌 | 5.1 Internal Authority, 5.2 Reality Shaping, 5.3 Effortless Creation |
| 6.0 - 6.99 | 6 | THE CHANNEL 🌈 | 6.1 Ego Softening, 6.2 Intuitive Flow, 6.3 Selfless Action |
| 7.0 | 7 | THE SOURCE ✦ | 7.1 Recognition, 7.2 Stabilized Awakening, 7.3 Ordinary Sacredness |

### Minimum Time Requirements (Anti-Gaming)

| Band | Minimum Days at Previous | Minimum Sessions |
|------|-------------------------|-----------------|
| 0 → 1 | 7 days | 5 sessions |
| 1 → 2 | 14 days | 12 sessions |
| 2 → 3 | 30 days | 25 sessions |
| 3 → 4 | 60 days | 50 sessions |
| 4 → 5 | 90 days | 80 sessions |
| 5 → 6 | 180 days | 150 sessions |
| 6 → 7 | 365 days | 300 sessions |

Even if the formula gives Band 5, if the user hasn't spent minimum time at Band 4, the V-Level is CAPPED at 4.99.

---

## 4. 4-Dimension Band System

### Dimension Definitions

| Dimension | Measures | Band 0 | Band 3 | Band 7 |
|-----------|----------|--------|--------|--------|
| **Thought** | Relationship with mental activity | Lost in thoughts, no gap | Can observe thought patterns, some distance | Thoughts arise and pass without identification |
| **Emotion** | Relationship with feelings | Reactive, identified with emotions | Can feel without immediate reaction | Emotions flow through, no resistance or attachment |
| **Body** | Somatic awareness | Disconnected from body signals | Regular body awareness, some interoception | Full embodiment, body as continuous meditation |
| **Awareness** | Meta-cognitive capacity | No awareness of awareness | Can notice when awareness expands/contracts | Awareness resting as itself, self-luminous |

### Dimension Update Rules

Dimensions update from THREE sources:

#### Source 1: 3-Lens AI Analysis (per conversation/journal)
```
dimension_delta = ai_extracted_signal × confidence × 0.01
// Max change per analysis: ±0.05
// Prevents wild swings from single interactions
```

#### Source 2: Behavioral Signals
```
thought_signal:
  + Journal depth & complexity over time
  + Use of meta-cognitive language ("I noticed that I was thinking...")
  - Repetitive content without new insight
  - Pure venting without observation

emotion_signal:
  + Emotional vocabulary richness
  + Naming emotions accurately
  + Reporting felt-sense in body
  - Only cognitive descriptions of emotions ("I think I'm sad")
  - Consistent avoidance of emotional content

body_signal:
  + Mentions of physical sensations
  + Completing body-awareness tasks
  + Noticing body states spontaneously
  - Always "in head" during conversations
  - No somatic language

awareness_signal:
  + Meta-comments ("I just noticed I was avoiding this")
  + Spontaneous witness moments
  + Reporting the gap between stimulus and response
  - No self-referential awareness
  - Pure content, no context awareness
```

#### Source 3: Time Decay
```
// If user hasn't practiced in N days, dimensions slowly decay:
decay_rate = 0.01 × days_inactive
minimum_dimension = max(0, dimension - decay_rate)
// Caps at 0.5 decay total — you never fully lose what you've built
```

---

## 5. Witness Quality Engine

Witness is the META-DIMENSION. It enables all other growth. Without witness capacity, no dimension can sustainably increase.

### Three Components

```
witness_gap:       0.0 - 1.0
  The space between stimulus and response.
  0.0 = Pure reaction (stimulus → immediate response)
  0.5 = Sometimes catches the gap
  1.0 = Consistent space before responding

witness_stability: 0.0 - 1.0
  Consistency of witness across different situations.
  0.0 = Only witnesses in meditation
  0.5 = Witnesses in easy situations, loses it in hard ones
  1.0 = Witness maintains in all situations including conflict

witness_depth:     0.0 - 1.0
  Depth of what can be observed.
  0.0 = Can only observe obvious thoughts
  0.5 = Can observe subtle emotions, body sensations, beliefs
  1.0 = Can observe awareness itself, the witness watching the witness
```

### Composite Witness Score

```
witness_quality = 0.4 × witness_gap + 0.35 × witness_stability + 0.25 × witness_depth
```

### Detection via NLP

```
HIGH WITNESS MARKERS:
  "I noticed that..."
  "There was a moment where I could see..."
  "I caught myself..."
  "Something in me wanted to react, but..."
  "I watched the urge arise and..."
  Third-person perspective on own experience

LOW WITNESS MARKERS:
  "He made me angry" (external attribution)
  "I couldn't help it" (no agency)
  Pure content with no meta-commentary
  Identification language: "I AM angry" vs "Anger is present"
```

---

## 6. 3-Lens LLM Architecture (Three Brains)

### The Model

The landing page promises "3 LLMs for 3 Brains." Implementation:

**NOT** 3 separate LLM calls. **ONE** LLM call with a structured system prompt that analyzes through 3 lenses simultaneously.

### System Prompt Structure

```
You are the ConsciousOS Consciousness Analyzer. 

Analyze the user's input through THREE intelligence lenses simultaneously:

## GUT BRAIN LENS (Somatic/Instinctive Intelligence)
- Scan for: body references, energy language, instinct mentions, survival signals
- Track: physical sensations, gut feelings, sleep/energy patterns
- Keywords: heavy, light, tense, relaxed, gut feeling, energy, tired, alive
- Maps to: Body dimension, Root/Sacral chakra, Karma Yoga affinity

## HEART BRAIN LENS (Emotional Intelligence)  
- Scan for: emotion words, relational language, empathy, vulnerability
- Track: emotional states, relational dynamics, love/fear spectrum
- Keywords: feel, love, hurt, connected, lonely, grateful, angry, sad
- Maps to: Emotion dimension, Heart chakra, Bhakti Yoga affinity

## HEAD BRAIN LENS (Cognitive Intelligence)
- Scan for: thought patterns, beliefs, mental models, cognitive distortions
- Track: thinking style, belief systems, intellectual understanding
- Keywords: think, believe, understand, realize, analyze, figure out
- Maps to: Thought dimension, Third Eye chakra, Jnana Yoga affinity

## WITNESS META-LENS (Above all three)
- Scan for: meta-awareness, observation language, gap detection
- Track: self-referential awareness, identification level, witness stability
- Keywords: noticed, observed, watched, stepped back, space, awareness
- Maps to: Awareness dimension, Crown chakra, Raja Yoga affinity

## OUTPUT FORMAT (JSON)
{
  "gut_signals": {
    "body_awareness_level": 0.0-1.0,
    "energy_state": "low|medium|high|fluctuating",
    "somatic_markers": ["string"],
    "instinct_signals": ["string"]
  },
  "heart_signals": {
    "emotional_state": "string",
    "emotional_depth": 0.0-1.0,
    "relational_tone": "connected|neutral|isolated|conflicted",
    "empathy_markers": ["string"],
    "vulnerability_present": boolean
  },
  "head_signals": {
    "thought_pattern": "clear|rumination|catastrophizing|analytical|spacious",
    "cognitive_distortions": ["string"],
    "beliefs_surfaced": ["string"],
    "intellectual_understanding": 0.0-1.0
  },
  "witness_signals": {
    "gap_detected": boolean,
    "meta_awareness_level": 0.0-1.0,
    "identification_level": "high|medium|low|none",
    "witness_language_count": number,
    "spontaneous_insight": boolean
  },
  "chitta_vritti_classification": "kshipta|mudha|vikshipta|ekagra|niruddha",
  "active_loops_detected": ["loop_id"],
  "loop_evidence": { "loop_id": "evidence text" },
  "bypassing_signals": {
    "dimension_mismatch": boolean,
    "positivity_bypass": boolean,
    "intellectual_bypass": boolean,
    "risk_score": 0.0-1.0
  },
  "samskara_hints": ["root_wound_type"],
  "yoga_path_signals": {
    "karma": 0.0-1.0,
    "bhakti": 0.0-1.0,
    "jnana": 0.0-1.0,
    "raja": 0.0-1.0
  },
  "dimension_micro_updates": {
    "thought": -0.05 to +0.05,
    "emotion": -0.05 to +0.05,
    "body": -0.05 to +0.05,
    "awareness": -0.05 to +0.05
  },
  "confidence": 0.0-1.0
}
```

### LLM Selection Strategy

| Task | Model | Reason |
|------|-------|--------|
| 3-Lens Analysis | gemini-2.5-flash | Fast, structured output, cost-effective |
| Deep Samskara Detection | gemini-2.5-pro | Complex reasoning needed |
| Guide Conversation | gpt-5-mini | Natural conversation, good reasoning |
| Weekly Pattern Scan | gemini-2.5-pro | Large context window, pattern detection |
| Quick Classification | gemini-2.5-flash-lite | Speed, simple classification |

---

## 7. Loop Detection & Samskara Clustering

### 7 Core Loops

| # | Loop | Core Belief | Chakra | Detection Signals |
|---|------|-------------|--------|-------------------|
| 1 | **Origin Loop** | "I am separate" | Crown | Existential loneliness language, seeking belonging in external |
| 2 | **Worth Loop** | "I am not enough" | Solar Plexus | Comparison language, self-deprecation, overachieving as compensation |
| 3 | **Safety Loop** | "I am unsafe" | Root | Hypervigilance language, trust issues, control behaviors |
| 4 | **Power Loop** | "I must control" | Solar Plexus | Control language, difficulty delegating, anger at helplessness |
| 5 | **Connection Loop** | "I am alone" | Heart | Isolation language, difficulty asking for help, walls up |
| 6 | **Identity Loop** | "I am my story" | Throat/Third Eye | Strong attachment to personal narrative, resistance to change |
| 7 | **Compulsion Loop** | "I must keep looping" | Sacral | Awareness of pattern but inability to stop, addiction to drama |

### 150+ Micro Loops — Category Map

```
FEAR LOOPS (24):
├── Fear of rejection → Worth Loop cluster
├── Fear of failure → Worth + Safety cluster  
├── Fear of judgment → Identity Loop cluster
├── Imposter syndrome → Worth Loop cluster
├── Fear of abandonment → Connection Loop cluster
├── Fear of success → Worth + Power cluster
├── Fear of intimacy → Safety + Connection cluster
├── Fear of loss → Safety Loop cluster
├── Fear of change → Identity + Safety cluster
├── Fear of the unknown → Safety Loop cluster
├── Fear of being seen → Worth + Identity cluster
├── Fear of confrontation → Safety + Connection cluster
├── ... (12 more mapped to core loops)

EMOTIONAL LOOPS (28):
├── Anger cycles → Power Loop cluster
├── Anxiety spirals → Safety Loop cluster
├── Shame loops → Worth Loop cluster
├── Guilt patterns → Worth + Connection cluster
├── Jealousy patterns → Worth + Connection cluster
├── Resentment cycles → Power + Connection cluster
├── Emotional numbing → Safety Loop cluster
├── Mood dependency → Compulsion Loop cluster
├── Victim mentality → Power Loop (inverse) cluster
├── Martyrdom → Worth + Connection cluster
├── ... (18 more)

COGNITIVE LOOPS (21):
├── Rumination → Identity Loop cluster
├── Catastrophizing → Safety Loop cluster
├── Black-and-white thinking → Identity Loop cluster
├── Projection → All loops (shadow mechanism)
├── Rationalization → Identity + Worth cluster
├── Confirmation bias → Identity Loop cluster
├── Overthinking → Power + Safety cluster
├── Analysis paralysis → Power + Safety cluster
├── ... (13 more)

RELATIONAL LOOPS (15):
├── Abandonment patterns → Connection + Safety cluster
├── Trust issues → Safety Loop cluster
├── Boundary violations → Power + Safety cluster
├── Communication walls → Connection + Throat chakra
├── Codependency → Connection + Worth cluster
├── People pleasing → Worth + Connection cluster
├── Avoidant attachment → Safety + Connection cluster
├── Anxious attachment → Safety + Connection cluster
├── ... (7 more)

BEHAVIORAL LOOPS (22):
├── Procrastination → Worth + Safety cluster
├── Perfectionism → Worth Loop cluster
├── Workaholism → Worth + Identity cluster
├── Substance patterns → Compulsion + Safety cluster
├── Social media compulsion → Connection + Worth cluster
├── Shopping/consumption → Compulsion + Worth cluster
├── ... (16 more)

EXISTENTIAL LOOPS (18):
├── Meaninglessness → Origin Loop cluster
├── Death anxiety → Safety + Origin cluster
├── Purpose searching → Origin + Identity cluster
├── Nihilism → Origin Loop cluster
├── Spiritual materialism → Identity + Compulsion cluster
├── ... (13 more)

SOMATIC LOOPS (12):
├── Chronic tension patterns → Safety + Body dimension
├── Breath holding → Safety + Root chakra
├── Disconnection from body → Safety + Identity cluster
├── Pain avoidance → Safety Loop cluster
├── ... (8 more)

SHADOW LOOPS (12):
├── Projection onto others → All loops
├── Denial → Identity + Safety cluster
├── Suppression → Safety + Power cluster
├── Reaction formation → Identity + Worth cluster
├── ... (8 more)
```

### Samskara Cluster Detection Algorithm

```
STEP 1: Identify active loops (from 3-Lens analysis)
STEP 2: Map each loop to its core loop(s)
STEP 3: If 3+ micro loops map to same core loop → CLUSTER DETECTED
STEP 4: Identify the root wound

CLUSTER IDENTIFICATION:
  If loops = [fear_of_rejection, people_pleasing, overachieving, imposter_syndrome]
  → All map to Worth Loop
  → Root wound = "Unworthiness"
  → Samskara = "I am not worthy of love/success as I am"
  → Chakra correlation = Solar Plexus (primary) + Heart (secondary)

STEP 5: Once cluster identified, STOP working individual loops
         → Focus on root samskara
         → Individual loops dissolve naturally when root is addressed
```

### Loop Lifecycle States

```
DORMANT  → Loop exists but not active (no triggers)
ACTIVE   → Loop is running, user may/may not be aware
ACUTE    → Loop is in full activation, user is reactive
SEEN     → User has become aware of the loop (witness contact)
LOOSENING → Loop is losing grip, gaps appearing
DISSOLVED → Pattern no longer runs automatically
INTEGRATED → Pattern understood and transformed into wisdom
```

---

## 8. Chakra Correlation System

Chakras are NOT independently tracked. They are AUTO-COMPUTED from dimensions, loops, and behavioral signals.

### Correlation Matrix

| Chakra | Primary Dimension | Primary Loop | Secondary Connections | Behavioral Signals |
|--------|-------------------|--------------|----------------------|-------------------|
| **Root (Muladhara)** | Body 60% | Safety Loop | Survival concerns, financial stress | Sleep patterns, exercise, grounding activities |
| **Sacral (Svadhisthana)** | Emotion 50% + Body 30% | Compulsion Loop | Creativity, pleasure, sexuality | Creative expression, emotional flow |
| **Solar (Manipura)** | Thought 40% + Emotion 30% | Power + Worth Loops | Self-esteem, willpower, identity | Task completion rate, decision confidence |
| **Heart (Anahata)** | Emotion 50% + Awareness 30% | Connection Loop | Compassion, love, relationships | Relational dimension band, empathy markers |
| **Throat (Vishuddha)** | Thought 40% + Emotion 30% | Identity Loop | Expression, truth, communication | Journal depth, authentic expression |
| **Third Eye (Ajna)** | Awareness 60% + Thought 30% | Identity Loop | Intuition, insight, witness | Witness quality score, insight frequency |
| **Crown (Sahasrara)** | Awareness 70% | Origin Loop | Unity, transcendence, connection | V-Level, integration score, peak experiences |

### Auto-Computation Formula

```
chakra_score(chakra) = 
  Σ(connected_dimension × weight) / 7.0    // Normalize to 0-1
  × (1 - loop_penalty_for_chakra)           // Active related loops reduce
  + behavioral_bonus                         // Positive behaviors boost
```

Example:
```
heart_chakra = 
  (emotion × 0.50 + awareness × 0.30 + body × 0.10 + thought × 0.10) / 7.0
  × (1 - (connection_loop_active ? 0.15 : 0))
  + (relational_band > 3 ? 0.05 : 0)
```

---

## 9. 4 Yoga Paths — Affinity Detection

The engine detects which yoga path naturally resonates with the user. This determines TASK TYPE preferences, not content.

### Detection Signals

| Path | Detected Through | Task Types Generated | Language Style |
|------|-----------------|---------------------|----------------|
| **Karma Yoga** (Action) | Prefers doing over thinking, action-oriented language, service mentions | Physical tasks, acts of service, embodied practices | "What can you do differently today?" |
| **Bhakti Yoga** (Devotion) | Emotional depth in journal, relational language, gratitude, heart-centered | Emotional exercises, gratitude, heart-opening, devotional | "What are you grateful for in this moment?" |
| **Jnana Yoga** (Knowledge) | Analytical language, questions, seeks understanding, intellectual curiosity | Inquiry tasks, reading, contemplation, self-questioning | "What belief is driving this pattern?" |
| **Raja Yoga** (Meditation) | Mentions meditation, values discipline, consistency-oriented, stillness-seeking | Meditation, breathwork, stillness practices, structured discipline | "Sit with this for 5 minutes without changing anything" |

### Affinity Scoring

```
Each interaction updates yoga_path_affinity:
  If user completes a Karma task and reports satisfaction → karma += 0.02
  If user's language is emotional/devotional → bhakti += 0.01
  If user asks "why" questions → jnana += 0.01
  If user reports meditation insights → raja += 0.02

Dominant path = highest score
Secondary path = second highest

Task generation ratio:
  50% → dominant path type tasks
  30% → secondary path type tasks  
  20% → weakest path (for balance)
```

---

## 10. Chitta Vritti Classification

Real-time mental weather classification from Patanjali's Yoga Sutras.

| State | Sanskrit | Description | Detection | Engine Response |
|-------|----------|-------------|-----------|-----------------|
| **Scattered** | Kshipta | Mind jumping everywhere, restless | Short sentences, topic jumping, anxiety language | Grounding tasks, body focus, simple practices |
| **Dull** | Mudha | Foggy, unmotivated, lethargic | Low energy language, "don't know", "whatever" | Energizing tasks, movement, dynamic practices |
| **Oscillating** | Vikshipta | Moments of clarity then distraction | Mixed quality, insights followed by wandering | Gently progressive tasks, building on clarity moments |
| **One-pointed** | Ekagra | Focused, concentrated, clear | Depth in responses, sustained topic, rich detail | Advanced practices, deeper inquiry, subtle tasks |
| **Mastered** | Niruddha | Stillness, pure awareness | Minimal but profound language, spaciousness | No tasks needed, hold space, silence |

### Classification Algorithm
```
Analyzed per conversation/journal entry:
  sentence_length_variance → high = kshipta
  topic_switches_per_100_words → high = kshipta, low = ekagra
  energy_words → low = mudha
  depth_score → high = ekagra
  spaciousness_markers → high = niruddha
  clarity_consistency → mixed = vikshipta
```

---

## 11. 12 Horizontal Capacities

H-Capacities are scored 0-10 and correlate with V-Level bands.

### Expected Range by Band

| Capacity | Band 0-1 | Band 2-3 | Band 4-5 | Band 6-7 |
|----------|----------|----------|----------|----------|
| Awareness | 0-2 | 3-5 | 6-8 | 9-10 |
| Stillness | 0-1 | 2-4 | 5-7 | 8-10 |
| Presence | 0-2 | 3-5 | 6-8 | 9-10 |
| Inquiry | 0-2 | 3-6 | 6-8 | 8-10 |
| Equanimity | 0-1 | 2-4 | 5-7 | 8-10 |
| Compassion | 0-3 | 3-5 | 5-8 | 8-10 |
| Wisdom | 0-1 | 2-4 | 5-7 | 8-10 |
| Courage | 0-2 | 3-5 | 5-7 | 7-10 |
| Patience | 0-2 | 2-4 | 5-7 | 8-10 |
| Humility | 0-2 | 3-5 | 5-7 | 8-10 |
| Generosity | 0-3 | 3-5 | 5-7 | 7-10 |
| Dedication | 0-2 | 2-5 | 5-7 | 7-10 |

### Update Method
```
H-Capacities update from:
  1. Task completion (specific tasks tagged to capacities)
  2. AI conversation analysis (language markers per capacity)
  3. Behavioral signals (consistency = dedication, emotional depth = compassion)
  
Update rate: Slower than dimensions. Max ±0.5 per week.
```

---

## 12. Peak vs Baseline & Integration Score

### The Problem
A user meditates and experiences Band 5 clarity. But in daily life, they're Band 1.7. Which is their "real" level?

### The Solution: Track Both + Measure Integration

```
v_level_peak:
  Highest V-Level experienced in any single session.
  Updated when: Any session produces higher consciousness markers.
  
v_level_baseline:
  Sustained V-Level across daily life interactions.
  Updated when: Rolling 7-day average of dimension scores.
  Can only INCREASE by 0.1 per week maximum (prevents gaming).

integration_score:
  How much peak experience is converting to baseline.
  Formula: 1 - ((peak - baseline) / peak)
  Range: 0.0 (no integration) to 1.0 (peak = baseline)
  
  Example:
    Peak = 3.8, Baseline = 1.7
    Integration = 1 - ((3.8 - 1.7) / 3.8) = 1 - 0.55 = 0.45

gap = peak - baseline  
  Large gap (>2.0) → User has taste of higher states but can't maintain
  Small gap (<0.5) → User is well integrated
  Growing gap → Lots of peak experiences but no ground-level change
  Shrinking gap → TRUE PROGRESS — baseline is catching up
```

### The Integration Score is the REAL Metric of Growth

More important than V-Level itself. A user going from Integration 0.3 to 0.6 is making more meaningful progress than a user going from Band 1 to Band 2 with Integration 0.1.

---

## 13. Regression & Dark Night Engine

### What is Regression?

Current V-Level drops significantly below baseline. This can happen due to:
- Life events (loss, trauma, crisis)
- Intense shadow work surfacing buried material
- Natural growth cycles (dissolution before reconstruction)
- Burnout or exhaustion

### Detection Algorithm

```
IF v_level_current < (v_level_baseline - 0.5) FOR 3+ consecutive days:
  SET state = "dark_night"
  
IF v_level_current < (v_level_baseline - 1.0) FOR 1+ day:
  SET state = "dark_night" (immediate)
```

### Engine Behavior During Dark Night

```
1. REDUCE load:
   - Maximum 1 task per day (grounding/safety only)
   - No growth-oriented tasks
   - No challenging inquiries
   
2. CHANGE language:
   - Remove all achievement language
   - Guide speaks with extra gentleness
   - Acknowledge the difficulty
   - Normalize the experience: "This is part of the journey"
   
3. PROTECT V-Level:
   - DO NOT permanently downgrade v_level_baseline
   - Track regression as separate state
   - When recovery begins, baseline remains intact
   
4. TRACK recovery:
   recovery_trajectory = 
     "ascending"  → v_level_current increasing for 2+ days
     "flat"       → stable (±0.1) for 3+ days  
     "descending" → still dropping
     
5. EXIT dark_night:
   WHEN v_level_current > (v_level_baseline - 0.3) for 3+ days
   SET state = "recovery"
   THEN state = "normal" after 7 stable days
```

### The Breakthrough Pattern

Sometimes regression PRECEDES a breakthrough:
```
Pattern: Band 2.5 → Dark Night (Band 0.8) → Breakthrough (Band 3.5)

Detection:
  After dark_night recovery, IF v_level_current > previous_baseline:
    → SET state = "breakthrough"  
    → UPDATE v_level_baseline to new higher level
    → Log: "Breakthrough after dark night — dissolution-reconstruction cycle"
```

---

## 14. Spiritual Bypassing Detector

### Definition
Using spiritual practice/language to AVOID facing difficult emotions, shadow material, or real-world challenges.

### 5 Bypassing Patterns

#### Pattern 1: Intellectual Bypass
```
DETECTION:
  thought_band > emotion_band + 2.0
  AND journal contains spiritual concepts
  AND emotional vocabulary < 3 unique emotion words per entry
  
EXAMPLE:
  User journal: "I understand that all is one and separation is illusion"
  But: Avoids all emotion tasks, mood always "neutral"
  
RISK_SCORE += 0.3
```

#### Pattern 2: Positivity Bypass
```
DETECTION:
  mood_reported = "great"/"grateful" for 90%+ of entries
  BUT behavioral_signals show: poor sleep, stress markers, task avoidance
  
EXAMPLE:
  User always reports: "I'm grateful and at peace"
  But: Skips shadow work tasks, avoids conflict-related prompts
  
RISK_SCORE += 0.25
```

#### Pattern 3: Premature Transcendence
```
DETECTION:
  journey_day < 30
  AND user claims Band 4+ experiences
  AND dimension_spread > 2.0 (highly uneven)
  
EXAMPLE:
  Day 12: "I've transcended my ego"
  But: emotion_band = 0.5, can't handle criticism
  
RISK_SCORE += 0.35
```

#### Pattern 4: Avoidance Bypass
```
DETECTION:
  Consistently skips tasks tagged with: shadow_work, emotion, body, conflict
  AND completes 90%+ of tasks tagged with: meditation, knowledge, theory
  
RISK_SCORE += 0.2
```

#### Pattern 5: Compassion Bypass
```
DETECTION:
  High compassion_capacity for others
  BUT low self-compassion signals
  AND worth_loop or safety_loop active
  
EXAMPLE:
  "I forgive everyone" but clearly hasn't processed own pain
  
RISK_SCORE += 0.15
```

### Engine Response to Bypassing

```
bypassing_risk < 0.2  → No action
bypassing_risk 0.2-0.4 → Subtle redirect:
  "You've been working beautifully with understanding. I'm curious — 
   when was the last time something really surprised you emotionally?"

bypassing_risk 0.4-0.6 → Gentle confrontation:
  "I notice your reflections are consistently positive. That's beautiful. 
   AND — is there anything underneath that wants to be seen?"

bypassing_risk > 0.6  → Direct (but kind):
  Generate tasks that specifically target the bypassed area.
  Reduce meditation/theory tasks temporarily.
  Increase body/emotion/shadow tasks.
  Guide language becomes more grounding, less ethereal.
```

---

## 15. Relationship Mirror Engine

### Why Track Relationships?

Most people drop 1-3 consciousness bands when in conflict or triggered by specific people. Relationships are the HIGHEST-FIDELITY mirror for consciousness.

### Trigger Map Structure

```json
{
  "triggers": [
    {
      "trigger_category": "authority",        // authority|intimacy|family|peer|stranger
      "loop_activated": "power_loop",
      "dimension_most_affected": "emotion",
      "typical_band_drop": 1.5,               // How many bands they drop
      "frequency": "high",                     // How often this triggers
      "awareness_of_trigger": 0.3,            // 0-1, does user know?
      "last_triggered": "2026-03-01"
    }
  ],
  "shadow_projections": [
    {
      "projection": "controlling",             // What user sees in others
      "mirror": "own_need_for_control",        // What it reflects inside
      "loop_connection": "power_loop",
      "awareness": 0.1
    }
  ]
}
```

### Detection From Conversation

```
NLP MARKERS:
  "He/She always..." → Projection detected
  "They made me..." → External attribution → Low witness in relationship
  "I can't stand when..." → Trigger identification
  "Every time X happens, I..." → Pattern identification → GOOD (awareness)
  "I noticed that when X, I tend to..." → EXCELLENT (witness in relationship)
  
SCORING:
  relational_dimension_band = 
    individual_dimension_avg - average_band_drop_in_triggers
  // If someone is Band 3 solo but drops to Band 1 in conflict,
  // their relational band = ~1.5
```

---

## 16. Circadian Consciousness Engine

### Time-of-Day Consciousness Mapping

```
BRAHMA MUHURTA (3:30am - 6:00am)
  chitta_vritti: naturally tends toward ekagra/niruddha
  best_for: deep meditation, subtle practices
  engine: offer advanced tasks, Raja Yoga emphasis
  guide_tone: whisper-soft, spacious
  
MORNING (6:00am - 12:00pm)
  chitta_vritti: vikshipta → ekagra possible
  best_for: intention setting, Karma Yoga tasks, active practices
  engine: day planning, energy assessment, main tasks
  guide_tone: warm, directive, encouraging

SANDHYA TRANSITION (12:00pm - 2:00pm)
  chitta_vritti: transition point, mini-reset
  best_for: midday check-in, Presence Card
  engine: pause + reflect, micro-observation task
  guide_tone: grounding, brief

AFTERNOON (2:00pm - 6:00pm)
  chitta_vritti: kshipta tendency (post-lunch, activity)
  best_for: embodied tasks, body awareness, Karma Yoga
  engine: practical tasks, integration exercises
  guide_tone: practical, action-oriented

EVENING SANDHYA (6:00pm - 9:00pm)
  chitta_vritti: second transition, natural reflectiveness
  best_for: deep conversation, Jnana Yoga inquiry, review
  engine: evening reflection, day integration, deep Guide chat
  guide_tone: reflective, intimate, deep

NIGHT (9:00pm - 3:30am)
  chitta_vritti: mudha tendency, processing mode
  best_for: letting go, surrender, dream preparation
  engine: minimal tasks, grounding, Bhakti-oriented
  guide_tone: gentle, nurturing, non-demanding
```

### Moon Cycle Integration (Detected Over Time)

```
Not all users are moon-sensitive. Detection:
  Track mood/energy reports across 3+ moon cycles.
  If correlation > 0.5 with lunar phases → moon_sensitivity increases.

NEW MOON:
  Introspection peak, shadow work potent
  Engine: deeper tasks, inner inquiry
  
WAXING:
  Building energy, good for new practices
  Engine: introduce new tasks, increase difficulty slightly

FULL MOON:
  Emotional amplification, awareness heightened
  Engine: emotional processing tasks, relational awareness
  
WANING:
  Release and let go
  Engine: completion tasks, release practices, gratitude
```

---

## 17. Cross-Dimensional Correlation Matrix

### User Archetypes (Dimension Patterns)

| Pattern | Thought | Emotion | Body | Awareness | Archetype | What They Need |
|---------|---------|---------|------|-----------|-----------|----------------|
| High T, Low E | 3+ | 0-1 | Any | Any | **The Intellectualizer** | Emotional depth, heart opening, Bhakti practices |
| Low T, High E | 0-1 | 3+ | Any | Any | **The Feeler** | Cognitive structure, Jnana practices, grounding |
| High B, Low T/E | Any | 0-1 | 3+ | Any | **The Athlete** | Mental/emotional awareness, subtle body work |
| High A, Low all | 0-1 | 0-1 | 0-1 | 3+ | **The Dissociator** | Grounding, embodiment, practical engagement |
| All Low | 0-1 | 0-1 | 0-1 | 0-1 | **The Sleeper** | Start anywhere — body is easiest entry point |
| All Even | ~2 | ~2 | ~2 | ~2 | **The Balanced** | Rare and beautiful — deepen all equally |
| High all | 4+ | 4+ | 4+ | 4+ | **The Adept** | Subtle refinement, integration, service |

### Loop-Chakra-Dimension Interconnections

```
WORTH LOOP activated
  → Solar Plexus chakra drops
  → Emotion dimension drops (shame/inadequacy)
  → Thought dimension may INCREASE (overcompensation through analysis)
  → H-Capacity: Humility & Courage most affected
  → Yoga Path: Likely avoids Bhakti (vulnerability avoidance)
  → Bypassing Risk: May intellectualize worth issues (Pattern 1)

SAFETY LOOP activated  
  → Root chakra drops
  → Body dimension drops (tension, disconnection)
  → Emotion dimension drops (fear suppression)
  → Awareness dimension may be selectively high (hypervigilance ≠ witness)
  → H-Capacity: Equanimity & Courage most affected
  → Yoga Path: May overuse Raja (control through discipline)
  → Chitta Vritti: Tends toward kshipta (scattered vigilance)

CONNECTION LOOP activated
  → Heart chakra drops
  → Emotion dimension drops (walls up)
  → Relational dimension drops significantly
  → H-Capacity: Compassion & Generosity most affected
  → Yoga Path: Avoids Bhakti, may over-intellectualize (Jnana)
  → Shadow: Projects "coldness" or "selfishness" onto others
```

---

## 18. User Archetype Detection

Beyond dimension patterns, the engine detects broader user archetypes that inform the entire experience:

### Primary Archetypes

| Archetype | Detection Signals | Engine Approach |
|-----------|------------------|-----------------|
| **The Seeker** | Reads everything, tries all practices, high curiosity | Channel energy — too much seeking becomes avoidance. Introduce pausing. |
| **The Skeptic** | Questions everything, resists "spiritual" language | Respect intelligence. Use scientific framing. Evidence-based practices. |
| **The Wounded Healer** | High empathy but deep personal pain, helps others first | Redirect attention inward. Self-compassion before other-compassion. |
| **The Achiever** | Treats consciousness as another goal, wants to "level up fast" | Slow down. Emphasize being over doing. Anti-achievement tasks. |
| **The Surrendered** | Already has depth but lacks structure, drifts without direction | Provide gentle structure. Karma Yoga. Grounding. Practical tasks. |
| **The Traumatized** | High safety loop, hypervigilance disguised as awareness | Safety first. Somatic grounding. No forced vulnerability. Slow pace. |

---

## 19. Experience Generation (Output)

### What the Engine Generates Daily

```
DAILY OUTPUT = {
  tasks: [              // 1-6 tasks depending on band + state
    {
      title: string,
      type: "observe"|"practice"|"reflect"|"embody"|"inquiry"|"shadow"|"service",
      dimension_target: "thought"|"emotion"|"body"|"awareness",
      yoga_path_alignment: "karma"|"bhakti"|"jnana"|"raja",
      h_capacity_target: string,
      difficulty: "beginner"|"intermediate"|"advanced"|"subtle",
      estimated_minutes: number,
      loop_relevant: string|null,    // If targeting specific loop
      chakra_relevant: string|null,
    }
  ],
  
  guide_context: {       // Injected into Guide system prompt
    preamble: string,    // Full context about user's current state
    tone: string,        // How to speak (warm/direct/spacious/grounding)
    topics_to_explore: string[],
    topics_to_avoid: string[],
    language_level: string,  // Band-appropriate vocabulary
  },
  
  journal_prompts: string[],  // 3-4 level-appropriate prompts
  
  presence_card: {       // Midday micro-moment
    prompt: string,
    type: "body_check"|"emotion_check"|"thought_watch"|"space_notice",
  },
  
  evening_reflection: {
    focus: string,
    questions: string[],
  }
}
```

### Task Generation Rules

```
1. NEVER generate tasks above user's current band + 1
   (Don't give Band 0 user a "observe the observer" task)

2. 50% tasks → weakest dimension (growth edge)
3. 30% tasks → second weakest (supporting)
4. 20% tasks → strongest (confidence building)

5. Task TYPE matches dominant yoga path:
   Karma → action tasks ("Do X differently today")
   Bhakti → feeling tasks ("Notice what you're grateful for")
   Jnana → inquiry tasks ("Ask yourself: why do I...?")
   Raja → practice tasks ("Sit for 10 min observing breath")

6. IF dark_night: Only 1 grounding task, maximum gentleness
7. IF bypassing: Increase tasks in avoided dimension
8. IF plateau (same band for 2x minimum time): Introduce challenge tasks
9. IF breakthrough: Celebrate + consolidate (don't push further yet)
```

### Band-Appropriate Language

| Band | Guide Vocabulary | Never Uses |
|------|-----------------|------------|
| 0 | Focus, energy, clarity, habits, patterns, stress | Consciousness, witness, ego, awakening |
| 1 | Curiosity, explore, notice, interesting, discover | Levels, progress, bands, measurement |
| 2 | Watch, observe, space, distance, interesting | Advanced spiritual terms, siddhis |
| 3 | Transform, pattern, mirror, teacher, shadow | Enlightenment, transcendence |
| 4 | Choose, respond, space, freedom, conscious | Clinical terms, psychology jargon |
| 5 | Create, align, inner knowing, architect | External authority references |
| 6 | Flow, surrender, channel, grace, let go | Effort language, striving |
| 7 | Silence. Space. Being. Minimal words. | Everything — almost no language needed |

---

## 20. Memory Architecture

### 3-Tier Memory System

```
TIER 1: SHORT-TERM (Hot Memory — 7 days)
  Stored: Every conversation message, journal entry, task completion
  Used for: Immediate context in Guide conversations
  Storage: Full text in database
  
TIER 2: MEDIUM-TERM (Warm Memory — 30-90 days)
  Stored: Summarized patterns, loop activations, significant insights
  Used for: Pattern detection, weekly engine recalibration
  Storage: AI-generated summaries + tagged metadata
  
TIER 3: LONG-TERM (Cold Memory — Lifetime)
  Stored: Journey arc, major breakthroughs, dark night history, baseline progression
  Used for: Year-over-year growth tracking, deep pattern recognition
  Storage: Compressed summaries + key metrics only
```

### Memory Compression Algorithm

```
Every 7 days:
  1. Take all Tier 1 content from past week
  2. LLM summarizes into: 
     - Key patterns observed
     - Dimension changes noted
     - Loops that were active
     - Significant insights
     - Emotional tenor of the week
  3. Store summary in Tier 2
  4. Archive raw Tier 1 content (or prune)

Every 30 days:
  1. Take 4 weekly Tier 2 summaries
  2. LLM creates monthly arc summary
  3. Store in Tier 3
  4. Identify: trajectory, inflection points, stuck points
```

---

## 21. Scale & Cost Model

### Per-User Daily Cost

| Operation | LLM Model | Calls/Day | Cost/Call | Daily Cost |
|-----------|-----------|-----------|----------|------------|
| Morning 3-Lens Analysis | gemini-2.5-flash | 1 | $0.002 | $0.002 |
| Guide Conversations | gpt-5-mini | 2-5 | $0.003 | $0.009 |
| Evening Integration | gemini-2.5-flash | 1 | $0.002 | $0.002 |
| Task Generation | Rule engine | 1 | $0.000 | $0.000 |
| V-Level Computation | Rule engine | 3 | $0.000 | $0.000 |
| **Daily Total** | | | | **~$0.013** |

| Weekly Operations | Model | Cost |
|-------------------|-------|------|
| Memory Compression | gemini-2.5-flash | $0.005 |
| Pattern Detection | gemini-2.5-pro | $0.015 |
| Deep Samskara Scan | gemini-2.5-pro | $0.010 |
| **Weekly Total** | | **~$0.030** |

### Scale Projections

| Users | Monthly LLM Cost | Database | Total |
|-------|------------------|----------|-------|
| 1,000 | $520 | $50 | $570 |
| 10,000 | $5,200 | $200 | $5,400 |
| 100,000 | $52,000 | $1,000 | $53,000 |
| 1,000,000 | $520,000 | $5,000 | $525,000 |

### Optimization Strategies at Scale

```
1. CACHING: Similar profiles get similar tasks → cache task templates
2. BATCHING: Group users by band for batch LLM analysis
3. TIERING: Free users get gemini-flash-lite; Premium get gpt-5-mini
4. RULE PRIORITY: 80% of daily computation is pure rules (free)
5. ASYNC: Pattern detection, samskara scans — background jobs, not real-time
```

---

## 22. Daily Engine Cycle

### Complete Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     DAILY ENGINE CYCLE                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────┐                                 │
│  │ 1. USER OPENS APP       │                                 │
│  │    (any time of day)    │                                 │
│  └──────────┬──────────────┘                                 │
│             │                                                 │
│             ▼                                                 │
│  ┌─────────────────────────┐                                 │
│  │ 2. DETECT TIME SLOT     │                                 │
│  │    brahma_muhurta /     │                                 │
│  │    morning / sandhya /  │                                 │
│  │    afternoon / evening  │                                 │
│  │    / night              │                                 │
│  └──────────┬──────────────┘                                 │
│             │                                                 │
│             ▼                                                 │
│  ┌─────────────────────────┐    ┌────────────────────────┐   │
│  │ 3. LOAD STATE VECTOR    │───▶│ Check: Has today's     │   │
│  │    from database        │    │ plan been generated?   │   │
│  └──────────┬──────────────┘    └──────────┬─────────────┘   │
│             │                              │                  │
│             │ NO (first open today)        │ YES              │
│             ▼                              ▼                  │
│  ┌─────────────────────────┐    ┌────────────────────────┐   │
│  │ 4. COMPUTE V-LEVEL      │    │ Return cached plan     │   │
│  │    Run formula           │    │ + check for updates    │   │
│  │    Detect state flags    │    └────────────────────────┘   │
│  │    (dark_night? bypass?) │                                 │
│  └──────────┬──────────────┘                                 │
│             │                                                 │
│             ▼                                                 │
│  ┌─────────────────────────┐                                 │
│  │ 5. GENERATE DAY PLAN    │                                 │
│  │    Tasks + Prompts +    │                                 │
│  │    Guide Context +      │                                 │
│  │    Presence Card        │                                 │
│  └──────────┬──────────────┘                                 │
│             │                                                 │
│             ▼                                                 │
│  ┌─────────────────────────┐                                 │
│  │ 6. USER INTERACTS       │ ◀──── CONTINUOUS LOOP           │
│  │    Chat / Journal /     │                                 │
│  │    Complete Task        │                                 │
│  └──────────┬──────────────┘                                 │
│             │                                                 │
│             ▼                                                 │
│  ┌─────────────────────────┐                                 │
│  │ 7. 3-LENS ANALYSIS      │                                 │
│  │    (per conversation)   │                                 │
│  │    Extract signals      │                                 │
│  └──────────┬──────────────┘                                 │
│             │                                                 │
│             ▼                                                 │
│  ┌─────────────────────────┐                                 │
│  │ 8. MICRO-UPDATE STATE   │                                 │
│  │    dimensions ±0.05     │                                 │
│  │    witness quality      │                                 │
│  │    loop detection       │                                 │
│  │    chitta vritti        │                                 │
│  └──────────┬──────────────┘                                 │
│             │                                                 │
│             ▼                                                 │
│  ┌─────────────────────────┐                                 │
│  │ 9. EVENING: INTEGRATE   │                                 │
│  │    Day summary          │                                 │
│  │    Reflection prompts   │                                 │
│  │    Tomorrow preview     │                                 │
│  └──────────┬──────────────┘                                 │
│             │                                                 │
│             ▼                                                 │
│  ┌─────────────────────────┐                                 │
│  │ 10. NIGHTLY: RECALC     │                                 │
│  │    Full V-Level recomp  │                                 │
│  │    Baseline update      │                                 │
│  │    State flag check     │                                 │
│  │    Journey day advance  │                                 │
│  └─────────────────────────┘                                 │
│                                                               │
│  ┌─────────────────────────┐  (WEEKLY - ASYNC)               │
│  │ WEEKLY: DEEP SCAN       │                                 │
│  │  Memory compression     │                                 │
│  │  Pattern detection      │                                 │
│  │  Samskara clustering    │                                 │
│  │  Archetype reassessment │                                 │
│  │  Chakra recalibration   │                                 │
│  └─────────────────────────┘                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 23. Database Schema Requirements

### Tables Needed

```sql
-- Core state vector (1 per user)
user_consciousness_profile (
  user_id, 
  state_vector JSONB,           -- The complete unified state vector
  v_level_baseline, v_level_peak, v_level_current,
  integration_score,
  state,                        -- normal|dark_night|breakthrough|plateau|bypassing
  journey_day, journey_phase,
  archetype,
  dominant_yoga_path,
  created_at, updated_at
)

-- Daily plans (1 per user per day)
daily_engine_plans (
  user_id, plan_date,
  tasks JSONB,
  guide_context JSONB,
  journal_prompts JSONB,
  presence_card JSONB,
  time_slot_generated,
  created_at
)

-- Signal extraction logs (per conversation/journal)
consciousness_signals (
  user_id, source_type, source_id,
  gut_signals JSONB,
  heart_signals JSONB,
  head_signals JSONB,
  witness_signals JSONB,
  dimension_updates JSONB,
  loops_detected JSONB,
  chitta_vritti,
  confidence,
  created_at
)

-- Loop tracking
user_loops (
  user_id, loop_id,
  status,                -- dormant|active|acute|seen|loosening|dissolved|integrated
  awareness_score,
  severity,
  first_detected_at,
  last_activated_at,
  samskara_cluster_id
)

-- Samskara clusters
user_samskaras (
  user_id,
  root_wound,
  connected_loop_ids JSONB,
  depth, awareness,
  chakra_correlations JSONB,
  first_detected_at
)

-- Regression tracking
regression_events (
  user_id,
  trigger_type,
  baseline_before,
  lowest_point,
  recovery_date,
  breakthrough_after BOOLEAN,
  new_baseline_after
)

-- Memory tiers
consciousness_memory_t1 (user_id, content, source, created_at)           -- 7 days
consciousness_memory_t2 (user_id, week_summary, patterns, created_at)    -- 90 days  
consciousness_memory_t3 (user_id, month_arc, trajectory, created_at)     -- lifetime

-- Relationship mirrors
user_relational_triggers (
  user_id,
  trigger_category,
  loop_activated,
  dimension_affected,
  band_drop_typical,
  awareness_score,
  last_triggered_at
)
```

---

## 24. Implementation Priority

### Phase 1: Foundation (Weeks 1-2)
```
✅ Expand user_consciousness_profile with full state vector
✅ Implement V-Level computation formula
✅ 3-Lens LLM analysis (single call, structured output)
✅ Dimension micro-update system
✅ Band-appropriate Guide language
```

### Phase 2: Loop System (Weeks 3-4)
```
✅ 7 core loop detection from NLP
✅ Loop lifecycle tracking
✅ Loop-to-task targeting
✅ Basic samskara clustering (3+ loops → cluster)
```

### Phase 3: Safety Systems (Weeks 5-6)
```
✅ Regression detection & dark night handling
✅ Spiritual bypassing detector
✅ Peak vs baseline tracking
✅ Integration score computation
```

### Phase 4: Deep Systems (Weeks 7-8)
```
✅ Chakra auto-correlation
✅ Yoga path detection
✅ Chitta vritti classification
✅ Circadian engine
✅ Relationship mirror basics
```

### Phase 5: Memory & Scale (Weeks 9-10)
```
✅ 3-tier memory system
✅ Weekly pattern detection (async)
✅ Samskara deep clustering
✅ User archetype detection
✅ Performance optimization
```

### Phase 6: Refinement (Ongoing)
```
✅ A/B testing task effectiveness
✅ Model fine-tuning on consciousness language
✅ Moon cycle correlation detection
✅ Cross-user pattern discovery (with privacy)
✅ H-Capacity granular tracking
```

---

## Appendix A: Quick Reference Card

```
STATE VECTOR SIZE:     ~2KB per user
V-LEVEL:              EMERGENT (never directly set)
FORMULA:              weighted_min × witness × loops × integration
WEAKEST CAPS GROWTH:  YES — always
LLM CALLS/DAY:        3-6 (mostly flash-tier)
COST/USER/MONTH:      ~$0.50
NUMBERS TO USER:      NEVER
REGRESSION:           Normal, protected, honored
BYPASSING:            Detected, gently redirected
3 BRAINS:             1 LLM call, 3 lenses, structured output
DAILY COMPUTE:        80% rules, 20% LLM
WEEKLY DEEP SCAN:     Async background job
```

---

## 25. Data Flow Map — What Updates What

Every user interaction feeds the state vector. Here's EXACTLY what each data source updates:

### Guide Chat Session

```
USER SENDS MESSAGE IN GUIDE CHAT
  │
  ├──→ Message stored in session_messages table
  │
  ├──→ 3-Lens Analysis runs on ACCUMULATED conversation (not single msg)
  │    └──→ Returns structured JSON:
  │         gut_signals, heart_signals, head_signals, witness_signals
  │
  ├──→ STATE VECTOR UPDATES:
  │    ├── dimensions: ±0.05 max per session (micro-adjustments)
  │    ├── witness_gap: updated if witness markers detected
  │    ├── chitta_vritti: reclassified per conversation
  │    ├── active_loops: new loops added if detected with confidence > 0.7
  │    ├── loop_awareness: increases if user DISCUSSES a known loop
  │    ├── yoga_path_affinity: adjusted based on language patterns
  │    └── bypassing_risk: recalculated if dimension mismatch detected
  │
  └──→ GUIDE CONTEXT ADAPTS MID-CONVERSATION:
       If 3-Lens detects emotion_band is very low mid-chat:
       → Guide tone shifts to gentler
       → Next response acknowledges emotional state
       → This is INTRA-SESSION adaptation
```

### Journal Entry

```
USER WRITES JOURNAL ENTRY
  │
  ├──→ Entry stored in journal_entries table
  │
  ├──→ 3-Lens Analysis runs on entry content
  │    (Lighter analysis — journal is reflective, not conversational)
  │
  ├──→ STATE VECTOR UPDATES:
  │    ├── dimensions: ±0.03 max (journal is lower signal than live chat)
  │    ├── witness_signals: HIGH VALUE — journal = self-reflection = witness
  │    ├── chitta_vritti: strong signal (writing style reveals mental state)
  │    ├── loop detection: journal often reveals loops user doesn't voice in chat
  │    ├── samskara_hints: recurring journal themes = samskara signals
  │    └── mood/tags metadata: user-reported mood cross-checked with AI analysis
  │
  └──→ MISMATCH DETECTION:
       If user tags mood as "peaceful" but AI detects anxiety markers:
       → bypassing_risk += 0.05
       → Flag for Guide to gently explore next session
```

### Task Completion

```
USER COMPLETES A TASK
  │
  ├──→ Task status updated in daily_tasks / observation_tasks
  │
  ├──→ STATE VECTOR UPDATES:
  │    ├── h_capacities: +0.1 to capacity tagged on the task
  │    ├── dimension target: +0.02 to the dimension the task was for
  │    ├── yoga_path_affinity: +0.01 to path aligned with task type
  │    ├── streak: updated
  │    ├── consistency_score: recalculated
  │    └── IF task had reflection attached:
  │         → Run mini 3-Lens on reflection text
  │         → Additional dimension/witness updates
  │
  ├──→ TASK SKIP/AVOIDANCE TRACKING:
  │    If user consistently skips emotion tasks but completes thinking tasks:
  │    → bypassing_risk += 0.03 per skip pattern
  │    → Next day: reduce skippable tasks, make emotion task more accessible
  │
  └──→ NEXT TASK ADAPTATION:
       If observation_task has chain_order (chained tasks):
       → Completion of task N unlocks task N+1
       → Next task difficulty adjusts based on reflection quality
```

### Session End (Morning/Evening)

```
SESSION ENDS (user closes Guide chat or time slot changes)
  │
  ├──→ Session summary generated (LLM summarizes full conversation)
  │    └──→ Stored in sessions.summary
  │
  ├──→ FULL 3-Lens Analysis on entire session
  │    (More accurate than per-message — sees full arc)
  │
  ├──→ STATE VECTOR UPDATES:
  │    ├── dimensions: session-level update (±0.05 max)
  │    ├── All signals from session consolidated
  │    └── Memory Tier 1: full session stored
  │
  └──→ IF EVENING SESSION:
       ├── V-Level recomputed (nightly recalc)
       ├── baseline updated (7-day rolling average)
       ├── state flags checked (dark_night? plateau? breakthrough?)
       ├── journey_day advanced
       └── Tomorrow's plan pre-generated
```

### App Behavior (Passive Signals)

```
USER BEHAVIOR (no explicit interaction needed)
  │
  ├── Login time → circadian_profile.natural_rhythm detection
  ├── Session duration → engagement level
  ├── Time between sessions → consistency_score
  ├── Features used → which dimensions user gravitates to
  ├── Task completion rate → dedication h_capacity
  ├── Journal frequency → self-reflection tendency
  └── Guide chat length → depth of engagement
  
  These are SECONDARY signals — low weight but accumulate over time.
  Updated: nightly batch, not real-time.
```

---

## 26. Intra-Day Adaptation — How the Plan Changes

The morning plan is NOT fixed. It adapts throughout the day:

```
SCENARIO: User's day unfolds

06:00 — MORNING PLAN GENERATED
  State: emotion=1.2, thought=2.8, witness=0.3
  Tasks: [1 emotion task, 1 thought task, 1 body task]
  Guide context: "Focus on emotional awareness today"

09:00 — GUIDE SESSION
  User reveals: "I had a fight with my partner last night"
  3-Lens detects: safety_loop ACUTE, emotion drops to 0.8
  
  → STATE UPDATES IN REAL-TIME:
    emotion: 1.2 → 0.9 (acute emotional event)
    active_loops: +safety_loop (acute)
    relational.trigger_map: +intimacy → safety_loop
    chitta_vritti: vikshipta → kshipta (scattered by conflict)

  → PLAN ADAPTS:
    Remaining tasks recalculated:
    OLD: [emotion deepening, thought inquiry]  
    NEW: [grounding body task, gentle self-compassion task]
    Difficulty: intermediate → beginner (acute state)
    Guide context updated: "User in acute safety activation, be gentle"

12:00 — MIDDAY PRESENCE CARD
  Adapts to current state (not morning state):
  OLD prompt: "Notice your emotional patterns today"
  NEW prompt: "Place a hand on your heart. Take three breaths. You're safe."

18:00 — EVENING SESSION
  Guide has FULL context:
  - Morning plan + what changed
  - Guide session revelation
  - How midday went
  - Current state vs morning state
  
  Guide can say: "This morning you shared about last night. 
  How has the rest of your day been with that?"

22:00 — NIGHTLY RECALC
  Engine evaluates: Was this a regression or a normal hard day?
  If single-day event → no baseline change
  If 3+ days → regression tracking activates
```

### Adaptation Rules

```
WHEN state changes intra-day:

1. REMAINING tasks are soft-recalculated (not hard-replaced)
   - Already completed tasks stay
   - Uncompleted tasks may change type/difficulty
   - Never remove ALL tasks (always keep at least 1 gentle one)

2. Guide context updates IMMEDIATELY
   - Next Guide message uses updated state
   - No need to wait for next day

3. Presence Card adapts at next trigger
   - If already shown, stays as is
   - If not yet shown, uses updated state

4. Journal prompts adapt
   - Evening prompts reflect what happened during the day
   - Not generic — specific to the day's events
```

---

## 27. Life Domains Tracking

Life Domains track consciousness AS APPLIED to real-life areas. A person can be Band 3 in meditation but Band 0 in relationships.

### 8 Life Domains

| Domain | What It Tracks | Primary Connections |
|--------|---------------|---------------------|
| **Relationships** | Consciousness in intimate/family bonds | Emotion dim + Connection Loop + Heart chakra |
| **Work/Career** | Awareness in professional life | Thought dim + Power Loop + Solar chakra |
| **Health/Body** | Physical self-awareness & care | Body dim + Root chakra |
| **Finances** | Relationship with money/security | Root chakra + Safety Loop |
| **Creativity** | Expressive & creative flow | Sacral chakra + Emotion dim |
| **Spirituality** | Depth of inner practice | Awareness dim + Crown chakra |
| **Social/Community** | Connection to others/world | Heart chakra + Connection Loop |
| **Inner Peace** | Baseline equanimity | Witness quality + Equanimity h_cap |

### Scoring

```
Each domain: 0.0 - 7.0 (mirrors V-Level scale)

domain_score = 
  weighted_avg(connected_dimensions) 
  × (1 - related_loop_penalty)
  × connected_chakra_modifier

PLUS qualitative signals from:
  - Journal mentions of this domain
  - Guide conversations about this domain
  - Task completions in this domain
  
Updated: When domain is mentioned/engaged with (not daily for all)
```

### State Vector Addition

```json
"life_domains": {
  "relationships": 0.0,
  "work": 0.0,
  "health": 0.0,
  "finances": 0.0,
  "creativity": 0.0,
  "spirituality": 0.0,
  "social": 0.0,
  "inner_peace": 0.0
}
```

---

## 28. Onboarding → Engine Initialization

How does the engine START for a brand new user?

### Onboarding Flow (3-5 minutes)

```
STEP 1: WELCOME (30 sec)
  "Welcome to ConsciousOS. This isn't a meditation app. 
   It's a mirror. Let's understand where you are."

STEP 2: NATURAL CONVERSATION (2-3 min)
  Guide asks 5-7 questions. NOT a quiz. A conversation.
  
  Q1: "What brought you here today?"
      → Detects: motivation, yoga_path hints, current pain points
      
  Q2: "How would you describe your relationship with your thoughts?"
      → Detects: thought dimension baseline, witness indicators
      
  Q3: "When something upsets you, what happens in your body?"
      → Detects: body dimension, emotion dimension, somatic awareness
      
  Q4: "Is there a pattern in your life that keeps repeating?"
      → Detects: loop awareness, self-reflection depth
      
  Q5: "What does a typical day feel like for you — energetically?"
      → Detects: chitta_vritti baseline, circadian hints, energy patterns

  OPTIONAL (if user is engaged):
  Q6: "Have you done any inner work before? Meditation, therapy, yoga?"
      → Detects: starting band calibration, yoga_path, experience level
      
  Q7: "If you could change one thing about your inner life, what would it be?"
      → Detects: primary life domain, core loop, intention

STEP 3: AI PROCESSES (instant)
  3-Lens Analysis on full onboarding conversation
  → Initial state vector generated with CONSERVATIVE scores
  → Bands start LOW (better to underestimate and adjust up)

STEP 4: INITIAL STATE VECTOR
  All dimensions start at 0.5 - 2.0 based on conversation
  Witness quality: 0.1 - 0.4
  Loops: 1-2 initial detections (tentative)
  Yoga path: initial leanings
  Chitta vritti: classified
  V-Level: computed (likely Band 0-1 for most new users)
  
  IMPORTANT: Mark all scores as "low_confidence"
  → Engine treats first 7 days as calibration period
  → Wider update ranges (±0.1 instead of ±0.05)
  → More exploratory tasks across all dimensions
```

### First 7 Days: Calibration Period

```
journey_phase = "calibration" (before "assessment")

During calibration:
  - Engine explores ALL dimensions (not just weakest)
  - Tasks cover all 4 yoga paths (detecting preference)
  - Guide asks wider-ranging questions
  - Dimension update range: ±0.1 (double normal)
  - No loop conclusions — only "signals"
  - No archetype assignment yet
  
After Day 7:
  - Confidence scores established
  - First stable state vector
  - Archetype tentatively assigned
  - journey_phase → "foundation"
  - Update ranges normalize to ±0.05
```

---

## 29. Pancha Kosha (5 Bodies) Mapping

The landing page promises 5-body tracking. Implementation: NOT a separate system. It's a VIEW on existing dimensions.

### Mapping

| Kosha (Body) | What It Is | Mapped To (Existing Systems) |
|--------------|-----------|------------------------------|
| **Annamaya** (Physical) | Gross body, food, exercise | Body dimension + Root chakra |
| **Pranamaya** (Energy) | Breath, vitality, energy flow | avg(Body, Emotion) + Sacral/Solar chakras |
| **Manomaya** (Mental) | Thoughts, emotions, senses | avg(Thought, Emotion) + Solar/Heart chakras |
| **Vijnanamaya** (Wisdom) | Discernment, intuition, insight | Awareness dimension + Third Eye + Witness quality |
| **Anandamaya** (Bliss) | Joy, peace beyond conditions | V-Level baseline + Integration score + Crown chakra |

### Computation

```
kosha_scores = {
  annamaya:    body_dim × 0.7 + chakras.root × 0.3 × 7,
  pranamaya:   avg(body, emotion) × 0.6 + avg(chakras.sacral, chakras.solar) × 0.4 × 7,
  manomaya:    avg(thought, emotion) × 0.6 + avg(chakras.solar, chakras.heart) × 0.4 × 7,
  vijnanamaya: awareness × 0.5 + witness_quality × 0.3 × 7 + chakras.third_eye × 0.2 × 7,
  anandamaya:  v_level_baseline × 0.5 + integration_score × 0.3 × 7 + chakras.crown × 0.2 × 7
}

// All normalized to 0-7 scale
// These are DERIVED — never stored separately
// Computed on-demand when user views their Kosha profile
```

---

## 30. What We Intentionally DO NOT Track (Anti-Over-Engineering)

| Could Track | Why We Don't |
|-------------|-------------|
| Biometric data (HRV, EEG) | No hardware integration yet. Future phase. |
| Astrology/natal chart | Interesting but not evidence-based enough for v2. |
| Past life patterns | Beyond scope. Samskara layer is sufficient depth. |
| Social graph analysis | Privacy concerns. Relational tracking stays self-reported. |
| Micro-expression analysis | No camera integration. Future phase with 3D avatar. |
| Sleep stage tracking | Requires device integration. We infer from self-report. |
| Genetic predispositions | Way beyond scope. Not relevant to consciousness work. |
| Real-time brainwave states | EEG required. Future partnership opportunity. |

### The Rule: If we can't SENSE it from text/behavior, we don't track it.

Everything in Engine v2 is derivable from:
1. What user WRITES (journal, chat)
2. What user DOES (task completion, app behavior)
3. What user REPORTS (mood, energy, self-assessment)
4. What AI INFERS (3-Lens analysis, pattern detection)

No hardware. No external data. Pure text + behavior intelligence.

---

*This document is the complete technical reference for ConsciousOS Engine v2. All implementation should derive from this specification.*
