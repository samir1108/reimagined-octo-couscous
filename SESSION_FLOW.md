# Session Flow Orchestrator

## Overview

The Session Flow Orchestrator provides structured AI prompts for **Morning**, **Evening**, and **Night** sessions. It ensures the AI interacts with users in a personalized, theme-centered way that adapts to their journey state.

## Architecture

### Files Created

1. **`src/lib/sessionFlow.ts`** — Core prompt generation logic
2. **`src/hooks/useSessionFlow.ts`** — React hook for managing session state
3. **`src/pages/Guide.tsx`** — Updated to use structured prompts

## How It Works

### 1. **Morning Session Flow** (5AM - 12PM)

**Phases:**
1. **Greeting** — Warm welcome using their name, streak, journey day
2. **Theme Introduction** — "Today's theme is {title}"
3. **Why This Theme** — Connects theme_rationale to their band level, focus dimension, patterns
4. **How This Helps** — 2-3 specific benefits tied to their real life
5. **Opening Question** — "How did you sleep? Any dreams?"
6. **Practice** — After 2-3 exchanges, suggests practice based on their state
7. **Integration** — "What's one thing you're carrying forward?"

**Special Scenarios:**
- **Returning after 3+ days**: No guilt, 5 min only, "path celebrates return"
- **Long streak (7+)**: Challenge deeper, extend practice time
- **Normal**: Full structured flow

### 2. **Evening Session Flow** (5PM - 9PM)

**Phases:**
1. **Greeting + Day Review** — "Good evening. The day is settling."
2. **Reflection on Specifics** — References morning session, tasks, practice
3. **Celebrate Wins** — Even ONE moment of awareness is huge
4. **Explore Struggles** — Without guilt, extract learning
5. **Gratitude Practice** — 3 things: grateful for, made smile, appreciate
6. **Lessons Extraction** — "What did today teach you?"
7. **Connect to Tomorrow** — Preview next theme, get one commitment
8. **Closing** — Review: theme, clarity moment, lesson, gratitude

### 3. **Night Sanctuary Flow** (9PM - 5AM)

**Phases:**
1. **Greeting + Wind Down** — Gentle, releasing tone
2. **Quick Check-in** — "How's your body? Tired? Restless?"
3. **Practice Based on State**:
   - Restless → 15 min Yoga Nidra
   - Peaceful → 5 min gratitude
   - Heavy → 10 min gentle breathwork
4. **Plant One Seed** — Theme affirmation for sleep
5. **Closing** — "Sleep well. The path holds you."

**Rules:**
- NO deep inquiry
- NO analysis
- Keep everything short, gentle
- Redirect to rest if they start analyzing

## Context Data Used

The system gathers:

```typescript
{
  user: {
    userName, streak, journeyDay, bandLevel, bandName, 
    focusDimension, language
  },
  theme: {
    title, description, theme_rationale, learning_focus,
    daily_intentions, action_items, affirmation, focus_areas
  },
  morningSession: { completed, summary, insights },
  dayActivity: {
    journalEntries, practiceDone, tasksCompleted, 
    tasksMissed, dominantMood, energyLevel
  },
  missedDays, yesterdaySummary
}
```

## Usage in Guide Page

```typescript
// Hook automatically builds system prompt + first message
const sessionFlow = useSessionFlow({
  sessionType: slot,
  userName,
  streak,
  journeyDay,
  theme: themeData?.theme,
  // ... other context
});

// First message is injected when session starts
useEffect(() => {
  if (isActive && sessionId && messageCount === 0) {
    send({ type: "STREAM_DELTA", content: sessionFlow.firstMessage });
  }
}, [isActive, sessionId]);

// System prompt is passed to AI for all subsequent messages
await streamChat({
  aiContext: sessionFlow.systemPrompt,
  // ...
});
```

## Customization

### To modify morning flow:
Edit `buildMorningSpecificPrompt()` in `sessionFlow.ts`

### To modify evening flow:
Edit `buildEveningSpecificPrompt()` in `sessionFlow.ts`

### To change first message templates:
Edit `buildMorningFirstMessage()`, `buildEveningFirstMessage()`, or `buildNightFirstMessage()`

### To add new phases:
1. Add to `SessionPhase` type
2. Update `advancePhase()` logic in hook
3. Add phase-specific instructions in system prompt

## Status (verified 2026-11-14)

`sessionFlow.ts` is now a thin delegator: `buildSessionSystemPrompt()` / `buildSessionFirstMessage()`
call `buildDirectorPrompt()` in `src/lib/promptDirector.ts`. The phase script described above is
legacy reference text; the live phase routing happens in the edge function's
`_shared/adaptive-engine.ts`. Callers still work unchanged via `useSessionFlow()`.

Resolved since this doc was written:

- [x] Guide uses the delegating prompt director instead of the hard-coded 9/8/5-step scripts
- [x] Prompt assembly lives in `promptDirector.ts` (single source of truth)
- [x] Session creation is wired through `compose-session-v3` → `ConsciousnessOrchestrator` → local fallback

Still open:

- [ ] Fetch morning session data from today's sessions
- [ ] Fetch day activity from journal/tasks/practice
- [ ] Track phase progression in persisted session state
- [ ] Add midday micro check-in flow
- [ ] Add voice tone adaptation based on session type

