# Structured Journey - Complete Daily Flow

## Overview

The Structured Journey provides a **21-level curriculum-based path** to consciousness development. Unlike the Adaptive system (which generates fresh daily content), the Structured Journey follows a **progressive curriculum** where:

- Tasks are **level-based** (tied to 16 lessons per level × 21 levels)
- Progression is **visible** (Level 1 → 2 → 3... up to 21)
- The Guru uses **curriculum context** in all conversations
- Task chains support **lesson integration** (30% of tasks aligned to current lesson)

---

## Daily Rhythm

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STRUCTURED JOURNEY DAILY FLOW                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  5am ─────────────── MORNING SESSION ─────────────── 12pm           │
│  │                                                                   │
│  │  1. Guru Conversation (replaces wizard)                          │
│  │     • Personalized greeting based on level                       │
│  │     • "What we'll do today" explanation                          │
│  │     • Mood/energy collection via dialogue                        │
│  │     • Intention setting with curriculum context                  │
│  │                                                                   │
│  │  2. Background Processing                                        │
│  │     • extract-morning-data parses conversation                   │
│  │     • generate-structured-tasks creates level-based tasks        │
│  │     • daily_journey record created                               │
│  │                                                                   │
├──┼───────────────────────────────────────────────────────────────────┤
│                                                                      │
│  All Day ──────────── CHAINED TASKS ────────────── All Day          │
│  │                                                                   │
│  │  Level-Based Task Generation:                                    │
│  │  • Level 1-3:  3 tasks/day (Stage 1: The Crack)                  │
│  │  • Level 4-6:  4 tasks/day (Stage 2: The Witness)                │
│  │  • Level 7-9:  5 tasks/day (Stage 3: The Mirror)                 │
│  │  • Level 10-12: 6 tasks/day (Stage 4: The Gap)                   │
│  │  • Level 13-15: 5 tasks/day (Stage 5: The Space)                 │
│  │  • Level 16-18: 4 tasks/day (Stage 6: Dissolution)               │
│  │  • Level 19-20: 3 tasks/day (Stage 7: Embodiment)                │
│  │  • Level 21:    0 tasks/day (No structure needed)                │
│  │                                                                   │
│  │  Domain Distribution (16 Consciousness Domains):                 │
│  │  • Morning:    Ritual, Breath, Stillness, Values                 │
│  │  • Midday:     Work, Mental Clarity, Habit, Social               │
│  │  • Evening:    Integration, Emotional, Self-Inquiry, Body        │
│  │  • Night:      Stillness, Gratitude, Sleep Prep                  │
│  │                                                                   │
├──┼───────────────────────────────────────────────────────────────────┤
│                                                                      │
│  12pm ────────────── MIDDAY PRESENCE ──────────────── 6pm           │
│  │                                                                   │
│  │  1. Presence Card appears on Home                                │
│  │     • Shows if morning complete + at least 1 task done           │
│  │     • Displays current lesson theme reminder                     │
│  │                                                                   │
│  │  2. Presence Overlay (on tap)                                    │
│  │     • 3-4 AI-generated journal prompts                           │
│  │     • Level-appropriate inquiry depth                            │
│  │     • Prompts themed by current lesson                           │
│  │                                                                   │
│  │  3. Journal Integration                                          │
│  │     • Selected prompt → Navigate to Journal                      │
│  │     • +15-25 XP awarded on completion                            │
│  │     • Stored in guru_memory for context                          │
│  │                                                                   │
├──┼───────────────────────────────────────────────────────────────────┤
│                                                                      │
│  6pm ────────────── EVENING SANDHYA ───────────────── 10pm          │
│  │                                                                   │
│  │  1. Deep Guru Conversation                                       │
│  │     • Reviews full day with context                              │
│  │     • Level-specific reflective questions                        │
│  │     • Capacity markers updated                                   │
│  │                                                                   │
│  │  2. Tomorrow Glimpse                                             │
│  │     • Preview of tomorrow's theme                                │
│  │     • Level progress update                                      │
│  │     • Suggested night practices                                  │
│  │                                                                   │
├──┼───────────────────────────────────────────────────────────────────┤
│                                                                      │
│  10pm ────────────── NIGHT REST ───────────────────── 5am           │
│  │                                                                   │
│  │  1. Night Mode Card                                              │
│  │     • Level-appropriate grounding exercises                      │
│  │     • Breath, body, sense, release practices                     │
│  │                                                                   │
│  │  2. Dream Journal (5am-9am)                                      │
│  │     • "Did you dream last night?" prompt                         │
│  │     • Quick capture interface                                    │
│  │     • Feeds into morning context                                 │
│  │                                                                   │
└──┴───────────────────────────────────────────────────────────────────┘
```

---

## Components

### Phase 1: Morning Session

| Component | Path | Description |
|-----------|------|-------------|
| `StructuredMorningSession` | `src/components/session/StructuredMorningSession.tsx` | Conversational Guru morning dialogue |
| `morning-context` | `supabase/functions/morning-context/index.ts` | Aggregates user context for morning session |

**Morning Session Flow:**
1. Fetch morning context (yesterday's data, patterns, loops, capacities)
2. Guru delivers personalized greeting based on level and history
3. Conversational exchange about mood, energy, intention
4. AI parses conversation to extract structured data
5. Background task generation triggered
6. User returns to Home with tasks ready

**First-Day Edge Case:**
- Detected via empty `daily_journeys` + `level === 1`
- Special onboarding greeting explaining 21-level system
- Introduction to Level 1: "Sleeper Awakening"
- Gentler mood/energy collection
- Guided first intention setting

---

### Phase 2: Task System

| Component | Path | Description |
|-----------|------|-------------|
| `generate-structured-tasks` | `supabase/functions/generate-structured-tasks/index.ts` | Level-based task generation |
| `generate-next-task` | `supabase/functions/generate-next-task/index.ts` | Chained task generation (modified) |

**Task Generation Rules:**

```typescript
// Tasks per day based on level
function getTasksPerDayForLevel(level: number): number {
  if (level <= 2) return 3;
  if (level <= 3) return 4;
  if (level <= 6) return 4;
  if (level <= 9) return 5;
  if (level <= 12) return 6;
  if (level <= 15) return 5;
  if (level <= 18) return 4;
  if (level === 19) return 3;
  if (level === 20) return 2;
  return 0; // Level 21 - no tasks
}
```

**Domain Distribution by Time:**

| Time Segment | Hours | Primary Domains |
|--------------|-------|-----------------|
| Morning | 5am-12pm | Ritual & Sacred, Breath & Prana, Stillness, Values |
| Midday | 12pm-6pm | Work, Mental Clarity, Habit, Relationship |
| Evening | 6pm-10pm | Integration, Emotional, Self-Inquiry, Body |
| Night | 10pm-5am | Stillness, Gratitude, Sleep Preparation |

**Task-Curriculum Integration:**
- 30% of tasks aligned to current lesson
- Task AI prompt includes lesson title, teaching content, reflection prompts
- `lesson_id` and `pillar_id` stored on curriculum-aligned tasks

---

### Phase 3: Midday Presence

| Component | Path | Description |
|-----------|------|-------------|
| `MiddayPresenceCard` | `src/components/home/MiddayPresenceCard.tsx` | Trigger card for presence overlay |
| `structured-presence-prompts` | `supabase/functions/structured-presence-prompts/index.ts` | Level-aware prompt generation |

**Visibility Conditions:**
- Time is between 12pm-6pm
- Morning session complete
- At least 1 task completed
- User hasn't done midday presence today

**Prompt Types (Level-Scaled):**
- **Observation**: "What are you noticing right now in your body?"
- **Self-Inquiry**: "Who is the one doing these tasks?"
- **Somatic Check-in**: "Where is your attention resting?"
- **Gratitude**: "What small thing can you appreciate in this moment?"

**Level Scaling:**
- Level 1-6: Simple, concrete prompts
- Level 7-12: More abstract, pattern-focused
- Level 13-18: Deep inquiry, witness-oriented
- Level 19-21: Minimal prompts, maximum space

---

### Phase 4: Evening Sandhya

| Component | Path | Description |
|-----------|------|-------------|
| `EveningSession` | `src/components/session/EveningSession.tsx` | Deep evening Guru conversation (modified) |
| `evening-sandhya-context` | `supabase/functions/evening-sandhya-context/index.ts` | Full day aggregation |

**Evening Context Aggregation:**
```typescript
interface EveningSandhyaContext {
  morning_data: {
    mood: string;
    energy: number;
    intention: string;
  };
  tasks: {
    completed: Task[];
    skipped: Task[];
    total_xp: number;
  };
  midday_presence: {
    prompt_selected: string;
    response: string;
  } | null;
  journal_entries: JournalEntry[];
  current_level: {
    id: number;
    name: string;
    key_insight: string;
  };
  current_lesson: {
    title: string;
    reflection_prompts: string[];
  };
  capacity_growth: {
    areas_touched: string[];
    increments: Record<string, number>;
  };
}
```

**Level-Specific Reflection Questions:**
- Level 1-3: "What patterns did you notice today?"
- Level 4-6: "Where did you find the witness?"
- Level 7-9: "What loop showed up? How did you meet it?"
- Level 10-12: "Where was the gap between stimulus and response?"
- Level 13-15: "What dissolved today? What remains?"
- Level 16+: Deep non-dual inquiry

---

### Phase 5: Night Mode

| Component | Path | Description |
|-----------|------|-------------|
| `NightModeCard` | `src/components/home/NightModeCard.tsx` | Night grounding exercises (modified) |
| `DreamJournalPrompt` | `src/components/home/DreamJournalPrompt.tsx` | Dream capture interface |

**Night Mode Visibility:** 10pm-5am

**Dream Journal Visibility:** 5am-9am

**Dream Journal Flow:**
1. "Did you dream last night?" prompt appears
2. User can tap to open quick capture
3. Entry tagged as `dream_journal`
4. Stored in `journal_entries` table
5. +10 XP awarded
6. Morning Guru can reference dream content

---

## XP Rewards

| Action | Base XP | Streak Multiplier |
|--------|---------|-------------------|
| Morning session complete | +15 XP | ×1.0-1.5 |
| Each chained task | +20-35 XP | ×1.0-1.5 |
| Midday presence | +15-25 XP | ×1.0-1.5 |
| Evening session | +20 XP | ×1.0-1.5 |
| Dream journal | +10 XP | ×1.0-1.5 |

**Streak Multipliers:**
- 3+ days: ×1.1
- 7+ days: ×1.2
- 14+ days: ×1.3
- 30+ days: ×1.5

---

## Edge Cases

### First-Time User
- No previous `daily_journeys` records
- Special onboarding greeting
- Level 1 introduction
- Guided task explanation

### Late Start (after 12pm)
- Morning session still available
- Compressed task list (fewer tasks)
- Midday presence immediately available after morning

### Missed Day Return
- Guru acknowledges absence without judgment
- Fresh start approach
- Streak may be affected (or freeze used)

### Level-Up During Day
- Celebration popup
- Tasks continue as normal
- Next day reflects new level

### Night-Time First Visit
- NightWelcomeCard shows
- Option to skip to tomorrow
- Minimal grounding exercises available

---

## File Structure

```
src/
├── components/
│   ├── session/
│   │   ├── StructuredMorningSession.tsx  # New
│   │   └── EveningSession.tsx            # Modified
│   └── home/
│       ├── MiddayPresenceCard.tsx        # New
│       ├── DreamJournalPrompt.tsx        # New
│       ├── DayGuide.tsx                  # Modified
│       └── NightModeCard.tsx             # Modified
├── hooks/
│   └── useStructuredFlow.ts              # New (optional)
└── pages/
    └── Home.tsx                          # Modified

supabase/functions/
├── generate-structured-tasks/index.ts    # New
├── structured-presence-prompts/index.ts  # New
├── evening-sandhya-context/index.ts      # New
└── morning-context/index.ts              # Modified
```

---

## Implementation Priority

1. **Week 1**: Morning Session + First Day Flow
2. **Week 2**: Level-Based Task System + Domains
3. **Week 3**: Midday Presence System
4. **Week 4**: Evening Sandhya + Tomorrow Glimpse
5. **Week 5**: Night Mode + Dream Journaling
6. **Week 6**: Integration, Polish, Testing

---

## Success Metrics

- **Engagement**: Morning session completion rate >70%
- **Retention**: Week 2 return rate >60%
- **Progression**: Average time to Level 3 = 14 days
- **Depth**: Midday presence completion rate >40%
- **Integration**: Evening session completion rate >50%
