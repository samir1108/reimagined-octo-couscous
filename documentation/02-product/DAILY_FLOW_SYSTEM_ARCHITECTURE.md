# Daily User Flow Architecture - System Logic

## Core Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DAILY FLOW SYSTEM ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                         ENTRY LAYER                                   │ │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐               │ │
│   │  │ Scheduled│  │ User    │  │ Push    │  │ Voice   │               │ │
│   │  │ Ping    │  │ Opens   │  │ Opens   │  │ Command │               │ │
│   │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘               │ │
│   │       └─────────────┴─────────────┴─────────────┘                   │ │
│   │                               │                                       │ │
│   └───────────────────────────────┼───────────────────────────────────────┘ │
│                                   ▼                                         │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                    STATE ASSESSMENT ENGINE                           │ │
│   │  ┌─────────────────────────────────────────────────────────────┐   │ │
│   │  │ INPUT SOURCES:                                               │   │ │
│   │  │ ├── Current time of day                                     │   │ │
│   │  │ ├── Last interaction timestamp                             │   │ │
│   │  │ ├── User's last reported state (mood/energy)              │   │ │
│   │  │ ├── Day of week / Life events (if known)                   │   │ │
│   │  │ └── Historical patterns (same time → similar state)       │   │ │
│   │  └─────────────────────────────────────────────────────────────┘   │ │
│   │                               │                                       │ │
│   │                               ▼                                       │ │
│   │  ┌─────────────────────────────────────────────────────────────┐   │ │
│   │  │ STATE CLASSIFICATION:                                        │   │ │
│   │  │ ├── READY         │ Session available                       │   │ │
│   │  │ │ LIKELY         │ High probability user wants session      │   │ │
│   │  │ │ UNLIKELY      │ User probably busy                        │   │ │
│   │  │ │ IN_CRISIS      │ Immediate safety check                   │   │ │
│   │  │ │ ALREADY_DONE   │ Skip, show summary                       │   │ │
│   │  └─────────────────────────────────────────────────────────────┘   │ │
│   │                                                                       │ │
│   └─────────────────────────────────────┬───────────────────────────────┘ │
│                                         ▼                                   │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                    CONTENT SELECTION ENGINE                          │ │
│   │  ┌─────────────────────────────────────────────────────────────┐   │ │
│   │  │ PERSONALIZATION FACTORS:                                   │   │ │
│   │  │ ├── Persona cluster (from onboarding + behavior)          │   │ │
│   │  │ ├── Current V-Level (invisible)                           │   │ │
│   │  │ ├── Active loops (what's been showing up)                 │   │ │
│   │  │ ├── H-Level capacities (what needs development)           │   │ │
│   │  │ ├── Life domains in focus                                  │   │ │
│   │  │ ├── Energy level (from last session or default)           │   │ │
│   │  │ └── Time available (user input or historical average)      │   │ │
│   │  └─────────────────────────────────────────────────────────────┘   │ │
│   │                               │                                       │ │
│   │                               ▼                                       │ │
│   │  ┌─────────────────────────────────────────────────────────────┐   │ │
│   │  │ CONTENT RECOMMENDATION:                                     │   │ │
│   │  │ ├── PRIMARY: One practice/reflection matched to state      │   │ │
│   │  │ ├── ALTERNATIVE: 2-3 options if user declines              │   │ │
│   │  │ ├── OPTIONAL: Extra content if user wants more            │   │ │
│   │  │ └── DEEP: Available if something is alive                   │   │ │
│   │  └─────────────────────────────────────────────────────────────┘   │ │
│   │                                                                       │ │
│   └─────────────────────────────────────┬───────────────────────────────┘ │
│                                         ▼                                   │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                       SESSION FLOW LAYER                              │ │
│   │                                                                       │ │
│   │   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐        │ │
│   │   │ CHECK-  │────▶│ PRACTICE│────▶│ REFLECT │────▶│ CLOSE   │        │ │
│   │   │ IN      │     │ /LEARN  │     │ /JOURNAL│     │ /LOG    │        │ │
│   │   └─────────┘     └─────────┘     └─────────┘     └─────────┘        │ │
│   │                                                                       │ │
│   │   EACH STEP HAS:                                                       │ │
│   │   ├── Skip option (records as "skipped", no penalty)                │ │
│   │   ├── Deep work option ("something is alive, go deeper")            │ │
│   │   ├── Exit option (return anytime)                                  │ │
│   │   └── Data capture (what user did, how long, state changes)         │ │
│   │                                                                       │ │
│   └─────────────────────────────────────┬───────────────────────────────┘ │
│                                         ▼                                   │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                    ADAPTATION & LEARNING ENGINE                      │ │
│   │  ┌─────────────────────────────────────────────────────────────┐   │ │
│   │  │ POST-SESSION UPDATES:                                        │   │ │
│   │  │ ├── XP awarded (if applicable)                              │   │ │
│   │  │ ├── State recorded (mood before/after)                     │   │ │
│   │  │ ├── Loop activation marked (if any)                         │   │ │
│   │  │ ├── Capacity marker updated (if growth observed)            │   │ │
│   │  │ └── Tomorrow's recommendations adjusted                       │   │ │
│   │  └─────────────────────────────────────────────────────────────┘   │ │
│   │                               │                                       │ │
│   │                               ▼                                       │ │
│   │  ┌─────────────────────────────────────────────────────────────┐   │ │
│   │  │ LONG-TERM LEARNING:                                         │   │ │
│   │  │ ├── Pattern recognition across sessions                     │   │
│   │  │ ├── What content resonates (personal + aggregate)          │   │ │
│   │  │ ├── Optimal timing for this user                           │   │ │
│   │  │ └── V-Level indicators (readiness for deeper work)          │   │ │
│   │  └─────────────────────────────────────────────────────────────┘   │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Flow Logic

### 1. Entry Decision Tree

```
                    USER OPENS APP
                          │
                          ▼
            ┌─────────────────────────────┐
            │ Is this a scheduled time?  │
            │ (morning/afternoon/evening) │
            └─────────────┬───────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
           YES                          NO
            │                           │
            ▼                           ▼
    ┌───────────────┐          ┌─────────────────┐
    │ Has user      │          │ Check last      │
    │ completed     │          │ session state   │
    │ today?        │          └────────┬────────┘
    └───────┬───────┘                   │
            │                   ┌───────┴───────┐
            │                   ▼               ▼
            │              RECENT             STALE
            │              (<2 hours)         (>2 hours)
            │                  │                   │
            ▼                   ▼                   ▼
    ┌───────────────┐    ┌─────────────┐    ┌─────────────────┐
    │ Show summary  │    │ Quick check │    │ Show "Welcome   │
    │ + options     │    │ "Ready for  │    │ back" + "What's │
    │              │    │ today's     │    │ alive?"         │
    │              │    │ journey?"   │    │                 │
    └───────────────┘    └──────┬──────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Proceed with    │
                       │ session flow    │
                       └─────────────────┘
```

### 2. State Assessment Logic

```typescript
interface UserStateAssessment {
  // Computed values
  readinessLevel: 'high' | 'medium' | 'low' | 'crisis';
  optimalSessionLength: number; // minutes
  preferredContentType: 'practice' | 'learn' | 'reflect' | 'guru';
  energyAdjustment: number; // 0.5 to 2.0 multiplier
  urgencyLevel: 'routine' | 'recommended' | 'important';
  
  // Context flags
  isFirstSessionToday: boolean;
  wasYesterdayComplete: boolean;
  daysSinceLastDeepWork: number;
  currentLoopActivations: string[];
  recentCapacityGrowth: string[];
}

function assessState(user: User, now: Date): UserStateAssessment {
  // Calculate readiness based on:
  // 1. Time since last session
  // 2. Historical engagement patterns
  // 3. Reported mood/energy trends
  // 4. Current time of day (morning/afternoon/evening)
  
  // Detect crisis indicators
  if (detectCrisisIndicators(user)) {
    return { readinessLevel: 'crisis', ... };
  }
  
  // Calculate optimal length based on:
  // - User's typical session length
  // - Current energy level
  // - Available time (from user preference or calendar)
  
  // Determine content type based on:
  // - What domains are in focus
  // - What loops need work
  // - What capacities are developing
  
  return { ... };
}
```

### 3. Content Selection Algorithm

```typescript
interface ContentRecommendation {
  primary: {
    type: 'practice' | 'learn' | 'reflect' | 'guru';
    id: string;
    title: string;
    duration: number;
    matchScore: number; // 0-100
    targeting: {
      loops: string[];
      capacities: string[];
      domains: string[];
    };
  };
  alternatives: ContentRecommendation['primary'][];
  deepOption?: {
    available: boolean;
    trigger: string; // "When something is alive"
    contentType: 'deep_inquiry' | 'shadow_work' | 'extended_practice';
  };
}

function selectContent(state: UserStateAssessment): ContentRecommendation {
  // Step 1: Filter content pool by:
  // - User's persona cluster
  // - Current V-Level
  // - Active loops
  // - Energy level (adjust difficulty)
  
  // Step 2: Score each content item:
  // baseScore = 50
  // + loopMatch * 20
  // + capacityGrowth * 15
  // + domainFocus * 10
  // + timeAppropriateness * 5
  
  // Step 3: Select top match as primary
  // Select next 2-3 as alternatives
  
  // Step 4: Check if deep work is warranted:
  // - Something is alive (loop activation detected)
  // - User has capacity for depth
  // - Time allows
  
  return { primary, alternatives, deepOption };
}
```

### 4. Session Flow State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SESSION STATE MACHINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐              │
│  │  IDLE   │─────▶│ CHECKIN │─────▶│ CONTENT │─────▶│REFLECT │              │
│  │         │      │         │      │         │      │        │              │
│  └─────────┘      └────┬────┘      └────┬────┘      └────┬────┘              │
│         ▲             │               │               │                    │
│         │             │               │               │                    │
│         │             │               │               │                    │
│         │      ┌──────┴──────┐        │               │                    │
│         │      │             │        │               │                    │
│         │      ▼             │        │               │                    │
│         │   ┌──────┐         │        │               │                    │
│         │   │SKIP  │─────────▶│ DEEP   │──────────────┤                    │
│         │   │      │   work   │        │               │                    │
│         │   └──────┘         │        │               │                    │
│         │      │             │        │               │                    │
│         │      ▼             │        │               │                    │
│         │   ┌──────┐         │        │               │                    │
│         │   │EXIT  │◀───────┼────────┼───────────────┤                    │
│         │   │      │        │        │               │                    │
│         │   └──────┘        │        │               │                    │
│         │                    │        │               │                    │
│         │                    ▼        ▼               ▼                    │
│         │              ┌─────────┐ ┌─────────┐ ┌─────────────┐              │
│         └──────────────│  DONE   │ │ COMPLETE│ │ INTEGRATION │              │
│                        └─────────┘ └─────────┘ └─────────────┘              │
│                                                                              │
│  STATES:                                                                     │
│  IDLE: Waiting for user input                                               │
│  CHECKIN: Quick mood/energy/intention check                                  │
│  CONTENT: Practice, learning, or guru session                               │
│  REFLECT: Journaling or integration                                         │
│  DEEP WORK: Extended session when something is alive                        │
│  SKIP: User declined this step                                               │
│  EXIT: User left the session                                                 │
│  DONE: Session completed normally                                            │
│  COMPLETE: Full flow done                                                     │
│  INTEGRATION: Aftermath tracking                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5. Skip Logic

```typescript
function handleSkip(session: Session, step: string): void {
  // Record the skip
  recordSkip(user.id, step, session.timestamp);
  
  // Check if this is a pattern
  if (isRecurringSkip(user.id, step)) {
    // Flag for AI review
    flagForAI(user.id, `User consistently skips ${step}`);
    
    // Maybe offer different approach
    suggestAlternative(step);
  }
  
  // Update session state
  session.stepsCompleted.push({ step, action: 'skipped' });
  
  // Continue or wrap up
  if (hasMoreSteps(session)) {
    moveToNextStep(session);
  } else {
    transitionTo(session, 'DONE');
  }
  
  // Never penalize - respect user autonomy
  // Just learn and adapt
}
```

### 6. Deep Work Trigger Logic

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DEEP WORK TRIGGER LOGIC                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   TRIGGERS:                                                                  │
│   ─────────                                                                   │
│   1. USER EXPLICIT: "I want to go deeper" / "Something is alive"            │
│   2. BEHAVIORAL: Repeated engagement with similar content                   │
│   3. PATTERN: Loop activation detected during session                       │
│   4. TIMING: User has extended time available                               │
│   5. AI RECOMMENDATION: System detects readiness                             │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    DEEP WORK OFFER FLOW                             │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                      │   │
│   │   TRIGGER DETECTED                                                   │   │
│   │          │                                                           │   │
│   │          ▼                                                           │   │
│   │   ┌───────────────────┐                                              │   │
│   │   │ Show deep work    │                                              │   │
│   │   │ option with        │                                              │   │
│   │   │ context:           │                                              │   │
│   │   │ "I notice something│                                              │   │
│   │   │  is alive. Would    │                                              │   │
│   │   │  you like to go    │                                              │   │
│   │   │  deeper?"           │                                              │   │
│   │   └─────────┬─────────┘                                              │   │
│   │             │                                                         │   │
│   ┌─────────────┴─────────────┐                                           │   │
│   ▼                           ▼                                           │
│  ACCEPT                        DECLINE                                      │
│    │                             │                                         │
│    ▼                             ▼                                         │
│ ┌────────────┐            ┌─────────────┐                                  │
│ │ Deep work  │            │ Record skip │                                  │
│ │ session    │            │ Continue    │                                  │
│ │ continues  │            │ normal flow │                                  │
│ └────────────┘            └─────────────┘                                  │
│                                                                              │
│   DEEP WORK TYPES:                                                           │
│   ├─ DEEP INQUIRY: Guru dialogue, Socratic questioning                     │
│   ├─ SHADOW WORK: Loop exploration, pattern work                           │
│   ├─ EXTENDED PRACTICE: Longer meditation/inquiry                         │
│   └─ JOURNALING: Free writing, structured inquiry                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7. Data Capture Points

```typescript
interface SessionData {
  // Timing
  sessionStart: timestamp;
  sessionEnd: timestamp;
  stepDurations: Map<string, number>; // ms
  
  // Content consumed
  contentIds: string[];
  contentTypes: string[];
  completionStatus: 'complete' | 'partial' | 'skipped';
  
  // State changes
  moodBefore: number; // 1-5
  moodAfter: number;
  energyBefore: number;
  energyAfter: number;
  
  // Pattern detection
  loopsActivated: string[];
  insights: string[];
  resistancePoints: string[];
  
  // Learning
  aiObservations: string[];
  recommendationsGenerated: boolean;
}
```

---

## System Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DAILY FLOW - USER EXPERIENCE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. USER OPENS APP                                                      │
│     └─▶ Entry layer detects how user arrived                           │
│                                                                         │
│  2. STATE ASSESSMENT                                                    │
│     └─▶ System computes: readiness, energy, optimal content            │
│                                                                         │
│  3. OFFER PRESENTATION                                                  │
│     └─▶ Show personalized option with skip/deep options                │
│                                                                         │
│  4A. USER SKIPS                                                         │
│     └─▶ Record skip, learn, respect autonomy                            │
│                                                                         │
│  4B. USER ACCEPTS                                                       │
│     └─▶ Enter session flow                                              │
│                                                                         │
│  5. SESSION PROGRESS                                                    │
│     └─▶ Check-in → Practice → Reflect → Complete                       │
│                                                                         │
│  6A. USER WANTS DEEPER                                                  │
│     └─▶ Transition to deep work mode                                   │
│                                                                         │
│  6B. USER WANTS TO EXIT                                                 │
│     └─▶ Save progress, open door to return                              │
│                                                                         │
│  7. SESSION COMPLETE                                                    │
│     └─▶ Update V/H levels, track loops, adjust tomorrow                │
│                                                                         │
│  8. LONGITUDINAL LEARNING                                               │
│     └─▶ Patterns recognized, personalization improves over time        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key System Principles

1. **User Sovereignty**: Every step is skippable, no pressure
2. **Deep Work Ready**: Always available when something is alive
3. **Continuous Learning**: System gets smarter with each interaction
4. **State-Aware**: Adapts to user's current energy, mood, context
5. **Persona-Adaptive**: Different paths for different people
6. **Safety First**: Crisis detection overrides everything
7. **Respectful**: Skips are honored, not punished

---

## 11 Persona-Specific "What's Alive" Questions

| Persona | Entry Question | Deep Follow-up |
|---------|---------------|----------------|
| **Corporate Burnout** | "What's your top stressor right now?" | "Where does this show up in your body?" |
| **Spiritual Seeker** | "What inquiry wants attention?" | "What dissolves when you look directly?" |
| **Trauma Survivor** | "How does your body feel right now?" | "Is there anything that needs extra gentleness today?" |
| **Curious Skeptic** | "What would you like to test/explore today?" | "What evidence would convince you?" |
| **Parent with Kids** | "How's the chaos level?" | "What's one micro-moment you could claim?" |
| **Retired Explorer** | "Take your time. What's on your mind?" | "What would make today meaningful?" |
| **Creative Blocked Artist** | "What wants to be created?" | "What block is really about?" |
| **College Student** | "What's your biggest academic pressure?" | "What's one thing you CAN control?" |
| **Chronic Pain Sufferer** | "Gentle check-in: how's your body today?" | "Where can you offer yourself compassion?" |
| **Social Justice Activist** | "What's weighing on you about the world?" | "How can you hold hope and grief together?" |
| **Tech Entrepreneur** | "Decision clarity or stress relief?" | "What's the one decision that matters most?" |

---

## Edge Cases That Break Typical Apps

```yaml
EDGE_CASES:
  
  # User states that require special handling
  CRISIS_STATE:
    detection: "Language indicating self-harm, severe depression, panic"
    response: "Immediate safety protocol, crisis resources, human handoff"
    priority: "CRITICAL - overrides all other logic"
    
  SPIRITUAL_EMERGENCY:
    detection: "User reports dissociation,桃花 experiences, ego death without preparation"
    response: "Grounding protocol, normalize experience, recommend professional support"
    priority: "HIGH - can be destabilizing"
    
  LOOP_AMPLIFICATION:
    detection: "User going in circles, same pattern repeated 5+ times"
    response: "Gentle interruption, offer different approach, check safety"
    priority: "MEDIUM - reduces effectiveness"
    
  PLATEAU:
    detection: "No progress in 30+ days, same V-level, low engagement"
    response: "Offer new perspective, challenge gently, check for avoidance"
    priority: "MEDIUM - affects retention"
    
  REGRESSION:
    detection: "User reports increased distress, worse than baseline"
    response: "Check for life events, reduce intensity, offer safety"
    priority: "HIGH - may need professional support"
    
  OVERIDENTIFICATION:
    detection: "User overly attached to spiritual experiences or V-level"
    response: "Point to non-attachment, redirect to presence, catch ego games"
    priority: "MEDIUM - spiritual bypassing"
    
  PHYSICAL_PAIN_SPIKE:
    detection: "Chronic pain user reports sudden increase"
    response: "Offer pain management, check for grounding, reduce physical practices"
    priority: "MEDIUM - comfort issue"
    
  RESISTANCE:
    detection: "Consistent skipping, negative language, avoidance patterns"
    response: "Explore gently, offer different approach, never force"
    priority: "LOW-MEDIUM - natural part of process"
```

---

## Crisis Protocol Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CRISIS PROTOCOL FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   DETECTION TRIGGERS:                                                        │
│   ├── "I want to hurt myself"                                               │
│   ├── "I can't go on anymore"                                               │
│   ├── Severe dissociation                                                    │
│   ├── Panic attack indicators                                               │
│   └── Trauma flashback signals                                               │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                    IMMEDIATE RESPONSE                           │       │
│   ├─────────────────────────────────────────────────────────────────┤       │
│   │                                                                  │       │
│   │  STEP 1: Pause all AI content                                   │       │
│   │  STEP 2: Show crisis resources (988, international options)     │       │
│   │  STEP 3: Offer human connection (crisis counselor callback)     │       │
│   │  STEP 4: Grounding exercise (5-4-3-2-1)                        │       │
│   │  STEP 5: Follow-up check-in (24h, 48h, 1 week)                 │       │
│   │                                                                  │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   ESCALATION PATH:                                                           │
│   AI → Trained counselor (if available) → Professional referral           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Transformation Tracking Metrics

```yaml
TRANSFORMATION_METRICS:
  
  SHORT_TERM (0-30 days):
    engagement_metrics:
      - Sessions completed
      - Time in app
      - Streak maintenance
      
    immediate_relief:
      - Stress reduction (pre/post)
      - Mood improvement
      - Sleep quality
      
  MEDIUM_TERM (30-180 days):
    capacity_growth:
      - H-Level increases
      - Self-reported presence
      - Observer perspective
      
    pattern_recognition:
      - Loop identification accuracy
      - Moment-of-choice awareness
      - Response vs reaction
      
  LONG_TERM (180+ days):
    life_integration:
      - Domain health improvements
      - Relationship quality
      - Work/life balance
      
    identity_shift:
      - Self-concept changes
      - Values clarification
      - Purpose alignment
      
    integration_indicators:
      - Less reactivity
      - More equanimity
      - Deeper contentment
```
