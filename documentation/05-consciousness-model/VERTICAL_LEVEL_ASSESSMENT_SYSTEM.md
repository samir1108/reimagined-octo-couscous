# Vertical Level Assessment & Theme of the Day System
## Comprehensive Design Document

---

## 1. EXECUTIVE SUMMARY

This document outlines a complete system for:
1. **Judging someone's vertical level (V-Level)** through their daily interactions
2. **Generating AI-driven Theme of the Day** based on their current V-Level
3. **Creating a daily flow**: Morning Check-in → Midday Presence → Evening Reflection

The core philosophy: **The theme should always meet the user at their current level and gently guide them upward.**

---

## 2. THE VERTICAL LEVEL ASSESSMENT ALGORITHM

### 2.1 How We Judge V-Level

We assess V-Level through **multi-dimensional analysis** across 5 touchpoints per day:

```
DAILY V-LEVEL ASSESSMENT TOUCHPOINTS:
│
├── MORNING CHECK-IN (Weight: 25%)
│   ├── Intentions set (level of self-awareness)
│   ├── Morning mood/state
│   └── Previous night's dream quality (if logged)
│
├── MIDDAY PRESENCE (Weight: 15%)
│   ├── Response quality to presence ping
│   ├── Energy level self-report
│   └── Brief awareness check
│
├── EVENING REFLECTION (Weight: 35%)
│   ├── Gratitude depth (surface vs. deep)
│   ├── Insight quality (patterns vs. realizations)
│   ├── Mood regulation throughout day
│   └── Day rating with reasoning
│
├── JOURNAL ENTRIES (Weight: 15%)
│   ├── Language sophistication
│   ├── Self-reflection depth
│   └── Evidence of witness awareness
│
└── GURU CONVERSATIONS (Weight: 10%)
    ├── Questions asked (seeking vs. complaining)
    ├── Integration of previous guidance
    └── Openness to perspective shifts
```

### 2.2 V-Level Scoring Formula

```typescript
interface DailyVLevelScore {
  date: string;
  userId: string;
  
  // Raw scores (0-10)
  morningScore: number;      // Morning check-in quality
  middayScore: number;       // Midday presence engagement
  eveningScore: number;      // Evening reflection depth
  journalScore: number;      // Journal entry analysis
  chatScore: number;         // Guru conversation quality
  
  // Computed scores
  rawTotal: number;           // Sum of all scores
  weightedTotal: number;      // Weighted sum
  averageScore: number;       // Normalized 0-10
  
  // Context
  themeFocus: string;         // Theme of the day
  themeAdherence: number;    // How well user engaged with theme
  streakDays: number;         // Consecutive days with engagement
}

const WEIGHTS = {
  morning: 0.25,
  midday: 0.15,
  evening: 0.35,
  journal: 0.15,
  chat: 0.10,
};

function calculateDailyScore(inputs: DailyInputs): DailyVLevelScore {
  const weightedTotal = 
    inputs.morningScore * WEIGHTS.morning +
    inputs.middayScore * WEIGHTS.midday +
    inputs.eveningScore * WEIGHTS.evening +
    inputs.journalScore * WEIGHTS.journal +
    inputs.chatScore * WEIGHTS.chat;
  
  return {
    ...inputs,
    rawTotal: inputs.morningScore + inputs.middayScore + inputs.eveningScore + inputs.journalScore + inputs.chatScore,
    weightedTotal,
    averageScore: weightedTotal / (WEIGHTS.morning + WEIGHTS.midday + WEIGHTS.evening + WEIGHTS.journal + WEIGHTS.chat),
  };
}
```

### 2.3 V-Level Progression Rules

```typescript
interface VLevelProgression {
  currentLevel: number;
  daysAtCurrentLevel: number;
  averageScoreThreshold: number;  // Need consistent scores to progress
  stabilityRequirement: number;   // How many days of meeting threshold
  
  // Progression logic
  canProgress(): boolean;
  shouldMaintain(): boolean;
  needsRegression(): boolean;
}

const PROGRESSION_RULES = {
  // To move up 1 level, user needs:
  minDaysAtLevel: 7,              // At least 7 days at current level
  minAverageScore: 6.5,           // Average score of 6.5 or higher
  minStreak: 5,                   // 5 consecutive days meeting threshold
  minThemeAdherence: 0.6,         // 60% engagement with theme
  
  // For regression (if scores consistently low)
  regressionThreshold: 4.0,       // Average below 4 for 7+ days
  regressionDays: 7,              // 7 days of low scores triggers regression
};

function evaluateProgression(
  history: DailyVLevelScore[], 
  currentLevel: number
): ProgressionDecision {
  const recentScores = history.slice(-14); // Last 14 days
  
  const avgScore = recentScores.reduce((sum, d) => sum + d.averageScore, 0) / recentScores.length;
  const avgThemeAdherence = recentScores.reduce((sum, d) => sum + d.themeAdherence, 0) / recentScores.length;
  
  const daysMeetingThreshold = recentScores.filter(d => d.averageScore >= PROGRESSION_RULES.minAverageScore).length;
  const consecutiveMeetingThreshold = countConsecutiveDays(recentScores, d => d.averageScore >= PROGRESSION_RULES.minAverageScore);
  
  // Check for progression
  if (
    recentScores.length >= PROGRESSION_RULES.minDaysAtLevel &&
    avgScore >= PROGRESSION_RULES.minAverageScore &&
    daysMeetingThreshold >= PROGRESSION_RULES.minStreak &&
    avgThemeAdherence >= PROGRESSION_RULES.minThemeAdherence
  ) {
    return { action: 'PROGRESS', newLevel: currentLevel + 1, reason: 'Consistent high performance' };
  }
  
  // Check for regression
  const lowScoreDays = recentScores.filter(d => d.averageScore < PROGRESSION_RULES.regressionThreshold).length;
  if (lowScoreDays >= PROGRESSION_RULES.regressionDays) {
    return { action: 'REGRESS', newLevel: Math.max(1, currentLevel - 1), reason: 'Consistent low performance' };
  }
  
  return { action: 'MAINTAIN', newLevel: currentLevel, reason: 'Steady progress' };
}
```

---

## 3. THEME OF THE DAY GENERATION

### 3.1 Theme Selection Algorithm

The AI generates a daily theme based on:

1. **User's Current V-Level** - Determines the sophistication of the theme
2. **Recent Performance** - Areas needing growth get priority
3. **Time in Journey** - Seasonal/monthly patterns
4. **Previous Theme Response** - How well user engaged with last theme

```typescript
interface DailyTheme {
  name: string;              // "Witnessing the Witness"
  focus: 'awareness' | 'clarity' | 'presence' | 'compassion' | 'wisdom' | 'peace' | 'insight' | 'courage';
  description: string;       // What to focus on today
  affirmation: string;      // Daily affirmation
  
  // V-Level specific
  levelAppropriate: number;  // Which level this theme serves
  stretchGoal: number;       // Slightly above current level
  
  // Activities
  morningPrompt: string;     // Check-in question
  middayPrompt: string;      // Presence ping question
  eveningPrompt: string;     // Reflection question
  
  // Scoring
  successIndicators: string[]; // What success looks like
}

function generateDailyTheme(
  userId: string,
  currentVLevel: number,
  recentHistory: DailyVLevelScore[],
  yesterdayTheme?: DailyTheme
): DailyTheme {
  // 1. Determine theme category based on V-Level band
  const band = getVLevelBand(currentVLevel);
  
  // 2. Analyze recent performance for growth areas
  const weakAreas = identifyWeakAreas(recentHistory);
  
  // 3. Get theme from pool appropriate for level
  const baseTheme = getThemeForLevel(band, weakAreas);
  
  // 4. Customize based on yesterday's performance
  if (yesterdayTheme && recentHistory.length > 0) {
    const yesterdayScore = recentHistory[recentHistory.length - 1];
    if (yesterdayScore.averageScore < 5) {
      // Lower the challenge if yesterday was difficult
      return adjustDifficulty(baseTheme, -1);
    }
  }
  
  return baseTheme;
}
```

### 3.2 Theme Pool by V-Level Band

```
THEME POOL BY BAND:

BAND 0: Human Survival Mode (V-Levels 1-3)
├── "Grounding in the Body" - Physical awareness basics
├── "Noticing Your Feelings" - Emotional recognition
├── "The Breath Anchor" - Basic breath awareness
└── "Simple Presence" - Beginning to notice awareness

BAND 1: The Turning Within (V-Levels 4-6)
├── "Witnessing Thoughts" - Observing mental activity
├── "The Observer Within" - Distinct from observed
├── "Awareness of Awareness" - Meta-awareness
└── "Daily Life Practice" - Bringing witness to routine

BAND 2: The Mirror Stage (V-Levels 7-9)
├── "Pattern Recognition" - Seeing repeated behaviors
├── "TheInquiry: Who Am I?" - Deep self-investigation
├── "Relationships as Mirrors" - Others reflect our stuff
└── "Shadow Work" - Meeting the hidden self

BAND 3: The Gap Stage (V-Levels 10-12)
├── "Space Between Stimulus and Response" - The pause
├── "Relaxing into Open Awareness" - No-center experience
├── "The Gap as Home" - Resting in spaciousness
└── "Integrating the Open State" - With movement/talking

BAND 4: The Dissolution Stage (V-Levels 13-15)
├── "No-Self in Motion" - Action without doer
├── "Flow State Mastery" - Effortless action
├── "Compassion Without Boundary" - Unlimited empathy
└── "Wisdom in Form" - Seeing through apparent reality

BAND 5: Embodiment (V-Levels 16-18)
├── "Sacred Daily Life" - Every moment is practice
├── "Embodied Wisdom" - Knowing through the body
├── "Human and Divine" - Fully here, fully awake
└── "Teaching by Example" - Living the truth

BAND 6: Living Realization (V-Levels 19-21)
├── "Natural Guidance" - Effortless teaching
├── "Complete Integration" - No separation
├── "Living Blessing" - Being a channel for others
└── "The End of Journey" - Nothing left to attain
```

---

## 4. DAILY FLOW: MORNING → MIDDAY → EVENING

### 4.1 Morning Check-in (5am - 12pm)

```
MORNING CHECK-IN FLOW:

┌─────────────────────────────────────────────────────────────┐
│                    MORNING SESSION                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. THEME REVEAL (Auto-generated)                          │
│     ┌─────────────────────────────────────────────────┐      │
│     │  ✦ THEME OF THE DAY ✦                          │      │
│     │  "Witnessing the Witness"                      │      │
│     │  Today: Notice the one who notices              │      │
│     └─────────────────────────────────────────────────┘      │
│                                                              │
│  2. V-LEVEL STATUS                                          │
│     ┌─────────────────────────────────────────────────┐      │
│     │  Current Level: V7 (Pattern Recognition)       │      │
│     │  Progress: ████████░░ 80% to V8                 │      │
│     │  Streak: 5 days                                 │      │
│     └─────────────────────────────────────────────────┘      │
│                                                              │
│  3. MORNING CHECK-IN QUESTIONS                              │
│     ┌─────────────────────────────────────────────────┐      │
│     │  Q1: How did you sleep?                         │      │
│     │       [Restful] [Okay] [Restless] [Poor]       │      │
│     │                                                  │      │
│     │  Q2: What's your intention for today?          │      │
│     │       [Text input - analyzed for depth]        │      │
│     │                                                  │      │
│     │  Q3: What's one thing you want to notice?      │      │
│     │       [Text input - theme-related]             │      │
│     │                                                  │      │
│     │  Q4: Current energy level (1-10)               │      │
│     │       [Slider]                                  │      │
│     └─────────────────────────────────────────────────┘      │
│                                                              │
│  4. DAILY CHALLENGE (Based on Theme)                        │
│     ┌─────────────────────────────────────────────────┐      │
│     │  Today's Micro-Practice:                        │      │
│     │  "Every time you have a thought today,          │      │
│     │   notice the space BEFORE the thought"          │      │
│     │                                                  │      │
│     │  [Start Practice] → Timer begins                │      │
│     └─────────────────────────────────────────────────┘      │
│                                                              │
│  SCORING:                                                    │
│  • Completion: +3 points                                    │
│  • Depth of intention: +2 points (AI analyzes text)        │
│  • Energy accuracy: +1 point                               │
│  • Micro-practice engagement: +4 points                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Midday Presence (12pm - 6pm)

```
MIDDAY PRESENCE PING:

┌─────────────────────────────────────────────────────────────┐
│                    MIDDAY PRESENCE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Automatic ping at user's preferred time]                  │
│  Default: 2pm (configurable)                               │
│                                                              │
│  NOTIFICATION:                                              │
│  🌤️ "A moment to pause..."                                 │
│                                                              │
│  QUICK CHECK-IN:                                            │
│  ┌─────────────────────────────────────────────────┐       │
│  │  Q1: How's your energy?                         │       │
│  │       [High] [Steady] [Low] [Dipping]          │       │
│  │                                                  │       │
│  │  Q2: Have you noticed [theme focus] today?      │       │
│  │       [Yes - here's what I noticed]             │       │
│  │       [A little]                                │       │
│  │       [Not yet - remind me]                     │       │
│  │                                                  │       │
│  │  Q3: One word for your current state?          │       │
│  │       [Input]                                    │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  OPTIONAL: 2-minute guided presence                         │
│  ┌─────────────────────────────────────────────────┐       │
│  │  [2:00] ░░░░░░░░░░░░░░░░░░ Breathing...        │       │
│  │                                                  │       │
│  │  "Notice the space between breaths..."         │       │
│  │  "Feel the body as a whole..."                 │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  SCORING:                                                    │
│  • Response within 1 hour: +2 points                        │
│  • Engagement with presence exercise: +3 points           │
│  • Theme awareness noted: +2 points                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Evening Reflection (6pm - 10pm)

```
EVENING REFLECTION FLOW:

┌─────────────────────────────────────────────────────────────┐
│                  EVENING REFLECTION                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DAY RATING                                              │
│     ┌─────────────────────────────────────────────────┐      │
│     │  How would you rate today?                     │      │
│     │                                                  │      │
│     │      ☆ ☆ ☆ ☆ ☆                                 │      │
│     │      1   2   3   4   5                          │      │
│     │                                                  │      │
│     │  [Difficult] [Okay] [Good] [Great] [Amazing] │      │
│     └─────────────────────────────────────────────────┘      │
│                                                              │
│  2. MOOD SELECTION                                           │
│     ┌─────────────────────────────────────────────────┐      │
│     │  What was your dominant mood today?            │      │
│     │                                                  │      │
│     │  [Peaceful] [Content] [Energized] [Tired]      │      │
│     │  [Anxious] [Reflective] [Struggling] [Joyful] │      │
│     │                                                  │      │
│     └─────────────────────────────────────────────────┘      │
│                                                              │
│  3. GRATITUDE DEEP DIVE                                      │
│     ┌─────────────────────────────────────────────────┐      │
│     │  What are you grateful for today?              │      │
│     │                                                  │      │
│     │  [Text input - analyzed for depth]            │      │
│     │                                                  │      │
│     │  AI Analysis (hidden):                         │      │
│     │  • Surface (people/things): +1                 │      │
│     │  • Process (experiences): +2                    │      │
│     │  • Abstract (qualities/realizations): +3       │      │
│     │                                                  │      │
│     └─────────────────────────────────────────────────┘      │
│                                                              │
│  4. INSIGHTS HARVEST                                         │
│     ┌─────────────────────────────────────────────────┐      │
│     │  What did you learn or realize today?          │      │
│     │                                                  │      │
│     │  [Text input - analyzed for depth]            │      │
│     │                                                  │      │
│     │  Theme Check: Did you practice [theme]?        │      │
│     │  [Yes - here's how it went]                    │      │
│     │  [I tried but struggled]                       │      │
│     │  [I forgot - will try tomorrow]                │      │
│     │                                                  │      │
│     │  AI Analysis (hidden):                         │      │
│     │  • Behavioral (what happened): +1             │      │
│     │  • Pattern (what recurs): +2                   │      │
│     │  • Insight (what I see now): +3                │      │
│     │  • Witness (observing the observer): +4       │      │
│     │                                                  │      │
│     └─────────────────────────────────────────────────┘      │
│                                                              │
│  5. TOMORROW GLIMPSE                                         │
│     ┌─────────────────────────────────────────────────┐      │
│     │  Preview of tomorrow's theme:                   │      │
│     │                                                  │      │
│     │  🌟 "Inquiry Deepening"                         │      │
│     │                                                  │      │
│     │  Based on today, tomorrow invites you to:      │      │
│     │  "Go deeper into the question: Who am I?"      │      │
│     │                                                  │      │
│     └─────────────────────────────────────────────────┘      │
│                                                              │
│  SCORING:                                                    │
│  • Day rating completion: +2 points                         │
│  • Mood selection: +1 point                                 │
│  • Gratitude depth (AI-analyzed): +1-3 points              │
│  • Insight depth (AI-analyzed): +1-4 points                │
│  • Theme adherence: +3 points                              │
│                                                              │
│  V-LEVEL CHECK:                                              │
│  After submission, AI analyzes for V-Level markers:        │
│  • Growth indicators → Update progress %                   │
│  • Regression indicators → Note concern                     │
│  • Breakthrough moments → Celebrate & flag                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. V-LEVEL MARKER DETECTION

### 5.1 Growth Markers by Band

```
V-LEVEL GROWTH MARKERS:

BAND 0 (Levels 1-3): Human Survival
├── "I noticed I was upset before reacting"
├── "I felt my body breathing"
├── "I was aware of being aware"
└── "I caught myself in a loop"

BAND 1 (Levels 4-6): Witness Stage
├── "I watched my thoughts like clouds"
├── "I was the observer, not the observed"
├── "I brought awareness to brushing teeth"
└── "I noticed的情绪 without being"

BAND 2 (Levels 7-9): Mirror Stage
├── "I saw my pattern with [specific issue]"
├── "My partner reflected my unprocessed stuff"
├── "I asked 'who is the one who thinks?'"
└── "I saw through my justification"

BAND 3 (Levels 10-12): Gap Stage
├── "I paused before responding"
├── "I rested in the space between"
├── "There was no 'me' making decisions"
└── "The gap was there even while talking"

BAND 4 (Levels 13-15): Dissolution
├── "Action happened without a doer"
├── "I saw no boundary between me and [experience]"
├── "Compassion arose without trying"
└── "Form dissolved into flow"

BAND 5 (Levels 16-18): Embodiment
├── "Every moment was practice"
├── "Wisdom came through my body"
├── "I was fully human and fully awake"
└── "Teaching happened naturally"

BAND 6 (Levels 19-21): Living Realization
├── "Life lived itself through me"
├── "No separation, no problem"
├── "Everything was already complete"
└── "No need for anything to change"
```

### 5.2 AI Marker Detection Algorithm

```typescript
interface MarkerDetectionResult {
  markersFound: VLevelMarker[];
  levelIndicator: number;
  confidence: number;
  recommendation: string;
}

const MARKER_PATTERNS: Record<string, RegExp[]> = {
  // Band 0 markers
  'body_awareness': [
    /I felt (my body|my breath|my heartbeat)/i,
    /body sensation/i,
    /felt (grounded|centered)/i,
  ],
  'first_glimpse': [
    /I noticed (I was aware|awareness|myself noticing)/i,
    /there was a part of me that observed/i,
  ],
  
  // Band 1 markers
  'witness_emergence': [
    /I watched my (thoughts|mind|emotions)/i,
    /thoughts came and went/i,
    /I was the (observer|witness)/i,
  ],
  'daily_life_practice': [
    /(brushing teeth|walking|eating|driving) with awareness/i,
    /brought (meditation|awareness) to daily/i,
    /ordinary (moments|activities).*practice/i,
  ],
  
  // Band 2 markers
  'pattern_recognition': [
    /I saw my (pattern|loop|cycle)/i,
    /this keeps (happening|repeating)/i,
    /I noticed (this|it) before/i,
  ],
  'inquiry_deepening': [
    /who am I/i,
    /what is (the self|the I|awareness)/i,
    /I investigated (myself|my mind)/i,
  ],
  
  // Band 3 markers
  'gap_experience': [
    /space between (stimulus and response|thoughts)/i,
    /I paused.*before (reacting|responding)/i,
    /there was a gap/i,
  ],
  'no_self_glimpse': [
    /no (self|I|me) (was|is) there/i,
    /identification (loosened|dropped)/i,
    /no one (doing|being|experiencing)/i,
  ],
  
  // Band 4+ markers
  'no_doer': [
    /action happened.*without.*(me|doer)/i,
    /(effortless|spontaneous) action/i,
    /no one (chose|decided|did)/i,
  ],
  'unity_awareness': [
    /no boundary/i,
    /everything (is|was) (one|connected)/i,
    /(me|self).*(and|vs).*(universe|everything)/i,
  ],
};

function detectMarkers(text: string): MarkerDetectionResult {
  const foundMarkers: VLevelMarker[] = [];
  
  for (const [markerType, patterns] of Object.entries(MARKER_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        foundMarkers.push({
          type: markerType,
          band: getBandForMarker(markerType),
          text: text.match(pattern)?.[0] || '',
        });
      }
    }
  }
  
  // Calculate level indicator based on highest band marker found
  const highestBand = foundMarkers.reduce(
    (max, m) => Math.max(max, m.band), 
    0
  );
  
  return {
    markersFound: foundMarkers,
    levelIndicator: highestBand + 1, // Base level for this band
    confidence: foundMarkers.length > 0 ? foundMarkers.length * 0.2 : 0,
    recommendation: getRecommendation(highestBand),
  };
}
```

---

## 6. SCORING SUMMARY & PROGRESS

### 6.1 Daily Score Breakdown

```
DAILY SCORE SHEET (Example for V7 User):

┌─────────────────────────────────────────────────────────────┐
│  DAILY SCORE: V7 - Pattern Recognition                      │
│  Date: February 20, 2026                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MORNING CHECK-IN                         [25% weight]     │
│  ├── Intentions depth:           +2.5 / 3                  │
│  ├── Micro-practice completion:  +4.0 / 4                  │
│  └── Energy accuracy:           +1.0 / 1                  │
│      SUBTOTAL:                   7.5 / 8    →  2.5 × 0.25 │
│                                                             │
│  MIDDAY PRESENCE                          [15% weight]    │
│  ├── Response time:             +2.0 / 2                  │
│  ├── Presence exercise:         +3.0 / 3                  │
│  └── Theme awareness:           +1.5 / 2                  │
│      SUBTOTAL:                   6.5 / 7    →  1.0 × 0.15  │
│                                                             │
│  EVENING REFLECTION                        [35% weight]   │
│  ├── Day rating:                +2.0 / 2                  │
│  ├── Gratitude depth:           +2.0 / 3                  │
│  ├── Insight depth:             +3.0 / 4                  │
│  └── Theme adherence:           +2.0 / 3                  │
│      SUBTOTAL:                   9.0 / 12   →  3.15 × 0.35 │
│                                                             │
│  JOURNAL ENTRIES                          [15% weight]    │
│  ├── Entry completion:         +2.0 / 2                  │
│  ├── Language sophistication:   +2.0 / 3                  │
│  └── Self-reflection depth:    +3.0 / 4                  │
│      SUBTOTAL:                   7.0 / 9    →  1.05 × 0.15 │
│                                                             │
│  GURU CONVERSATION                         [10% weight]   │
│  ├── Questions asked:           +1.0 / 2                  │
│  ├── Guidance integration:     +2.0 / 2                  │
│  └── Openness shown:           +2.0 / 2                  │
│      SUBTOTAL:                   5.0 / 6    →  0.5 × 0.10  │
│                                                             │
│  ═══════════════════════════════════════════════════════════ │
│  WEIGHTED TOTAL:                    8.2 / 10               │
│                                                             │
│  V-LEVEL MARKERS DETECTED:                                  │
│  ✓ "I saw my pattern with work" (Pattern Recognition)     │
│  ✓ "I brought awareness to my breathing" (Daily Life)     │
│                                                             │
│  PROGRESS UPDATE:                                           │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  68% to V8     │
│  (Need 2 more days with 6.5+ average to progress)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Progress Dashboard

```
PROGRESS DASHBOARD:

┌─────────────────────────────────────────────────────────────┐
│  YOUR JOURNEY: V7 - Pattern Recognition                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LEVEL PROGRESS                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ V6 ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ V8    │  │
│  │     Completed    ▓▓▓▓▓▓ 68% current ░░ remaining  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  THIS WEEK                              [7-day rolling]    │
│  ├── Average Score:        7.4 / 10  ↑ (6.8 last week)   │
│  ├── Theme Adherence:     72%        ↑ (65% last week)   │
│  ├── Streak:              5 days     ↑ (new record!)      │
│  └── Markers Detected:    8          ↑ (5 last week)      │
│                                                             │
│  STRENGTHS                                                 │
│  ├── ✓ Pattern Recognition (current band)                  │
│  ├── ✓ Daily Life Integration                             │
│  └── ✓ Insight Depth                                      │
│                                                             │
│  GROWTH AREAS                                              │
│  ├── → Inquiry Practice (try Who Am I daily)              │
│  ├── → Relationship Reflection                            │
│  └── → Evening completion consistency                     │
│                                                             │
│  NEXT THEME UNLOCKS                                        │
│  ├── V8: "Inquiry Deepening"                               │
│  └── Requires: 2 more days of 6.5+ average                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Core Infrastructure
1. Create `useVLevelAssessment` hook for daily scoring
2. Create `useDailyTheme` hook for theme generation
3. Build Morning Check-in component
4. Build Midday Presence component
5. Build Evening Reflection component

### Phase 2: AI Integration
1. Implement marker detection in Edge Function
2. Build theme generation AI prompt
3. Create scoring algorithm
4. Add V-Level progression logic

### Phase 3: UI/UX Polish
1. Add progress visualizations
2. Create celebration moments for level-ups
3. Add streak tracking
4. Build weekly/monthly reports

### Phase 4: Advanced Features
1. Predictive V-Level trajectory
2. Personalized theme recommendations
3. Social features (optional)
4. Advanced analytics dashboard

---

## 8. CONCLUSION

This system creates a **continuous feedback loop** where:

1. **Theme meets user at their level** - AI generates appropriate daily focus
2. **Daily interactions are scored** - Morning/Midday/Evening all contribute
3. **Progress is tracked** - Clear visualization of journey
4. **V-Level adjusts organically** - Based on consistent performance
5. **User feels supported** - Each day has clear purpose and guidance

The key insight: **Vertical growth happens through consistent daily practice, not dramatic breakthroughs.** By tracking small indicators daily and aggregating over time, we can accurately judge where someone is on their journey and provide exactly what they need to take the next step.
ca