# Unified Session System — Implementation Complete

## What Was Built

A complete rewrite of the session architecture from 5+ parallel systems into a single, unified system.

### Core Files Created

```
src/lib/session/
├── types.ts          # Unified Session, Step, Journey, Moment, Thread types
├── orchestrator.ts   # Central session creation service
├── naming.ts         # Magical, progression-aware session naming
├── journey.ts        # getUserJourney() — single source of truth for user state
├── moments.ts        # Triggered "magic moments" that make users feel seen
├── thread.ts         # Narrative arc tracking across sessions
├── events.ts         # Event bus for cross-system communication
├── completion.ts     # Unified session completion handler
├── migrate.ts        # localStorage → Postgres migration
├── migrate-runner.ts # One-click migration runner
├── adapters.ts       # Bridges for existing session systems
└── index.ts          # Barrel export
```

### Database Migration

```
supabase/migrations/
└── 20260923000000_unified_session_system.sql
    ├── session_states (replaces localStorage cursor)
    ├── daily_session_logs (replaces localStorage orb-sessions-*)
    ├── user_session_streaks (centralized streak tracking)
    ├── session_threads (narrative arcs)
    ├── session_events (event bus)
    └── RLS policies + triggers
```

## How to Use

### 1. Run the Migration

```typescript
import { runMigration } from '@/lib/session/migrate-runner';

// Run once per user (e.g., on first login after update)
const result = await runMigration();
console.log(`Migrated ${result.migratedSessions} sessions`);
```

### 2. Create a Session

```typescript
import { createSession } from '@/lib/session';

// Orb session (replaces sessionOrchestrator.ts)
const session = await createSession({
  userId: user.id,
  system: 'orb',
  trigger: 'manual',
  energy: 'medium',
  daysSinceLastSession: 1,
  journeyDay: 47,
  activeLoops: ['self-criticism'],
  weakestDimension: 'thought',
  sessionsToday: 2,
});

console.log(session.title);
// "The Third Descent: Untangling the Inner Critic"
```

### 3. Get User Journey

```typescript
import { getUserJourney } from '@/lib/session';

const journey = await getUserJourney(user.id);
console.log(journey);
// {
//   totalLifetimeSessions: 47,
//   currentStreak: 12,
//   journeyDay: 47,
//   todaySessions: [...],
//   activeLoops: ['self-criticism'],
//   weakestDimension: 'thought',
//   energy: 'medium',
//   isReturningAfterGap: false,
//   gapDays: 1,
// }
```

### 4. Complete a Session

```typescript
import { completeSession } from '@/lib/session';

const result = await completeSession({
  plan: session,
  completedSteps: [
    { kind: 'wisdom-read', durationSeconds: 120 },
    { kind: 'practice', durationSeconds: 300 },
    { kind: 'reflection', durationSeconds: 60 },
  ],
  skippedSteps: [],
  totalDurationMs: 480000,
  userId: user.id,
});

console.log(result.completion);
// {
//   sessionId: "orb-...",
//   completedStepCount: 3,
//   skippedStepCount: 0,
//   totalDurationMs: 480000,
//   loopsTouched: ['self-criticism'],
//   karmaEarned: 7,
//   qualityScore: 0.85,
// }

console.log(result.moments);
// [{ type: 'breakthrough', message: '...', visual: 'sparkle', ... }]
```

### 5. Get Session Thread

```typescript
import { getSessionThread } from '@/lib/session';

const thread = await getSessionThread(user.id);
console.log(thread);
// {
//   currentArc: 'Untangling "Self-Criticism"',
//   arcStartedAt: '2026-09-20T...',
//   sessionsInArc: 3,
//   arcIntensity: 0.3,
//   previousArcs: [...],
// }
```

### 6. Fire Events

```typescript
import { fireEvent, getEventsByType } from '@/lib/session';

await fireEvent(user.id, 'milestone_reached', {
  milestone: 100,
  totalSessions: 100,
});

const milestones = await getEventsByType(user.id, 'milestone_reached');
```

## Session Naming Examples

The naming engine creates personalized, progression-aware names:

```typescript
import { getSessionInvocation } from '@/lib/session/naming';

// First session ever
getSessionInvocation({ sessionCount: 1, hour: 8 })
// "The Arrival: Your Feet Remember the Path"

// Session 7, evening, active "self-criticism" loop
getSessionInvocation({
  sessionCount: 7,
  hour: 19,
  archetype: 'confrontation',
  activeLoopNames: ['self-criticism'],
  weakestDimension: 'thought',
})
// "The Seventh Descent: Untangling \"Self-Criticism\""

// Session 100 (milestone)
getSessionInvocation({ sessionCount: 100, hour: 13 })
// "The Century Session: The Still Point of the Day"

// Returning after 10-day gap
getSessionInvocation({
  sessionCount: 47,
  hour: 8,
  daysSinceLastSession: 10,
})
// "The Forty-Seventh Rising: Welcome Home, Wanderer"
```

## Magical Moments

Moments are triggered automatically during session completion:

| Moment Type | Trigger | Example Message |
|------------|---------|-----------------|
| `return` | Returning after 3+ days | "You're here. That's enough." |
| `milestone` | Session 1, 7, 30, 100, 365 | "Session 100. That's a life." |
| `breakthrough` | 3+ steps completed | "You're not checking boxes — you're diving." |
| `mirror` | Active loop identified | "You just saw 'self-criticism' clearly." |
| `depth` | 3+ sessions in one day | "Three sessions in one day." |
| `arc-resolved` | Arc reaches 8 sessions | "An arc has resolved." |

## Adapters for Existing Systems

### Orb Sessions
```typescript
import { createOrbSession } from '@/lib/session';

const session = await createOrbSession({
  userId: user.id,
  hour: 19,
  sessionsToday: 2,
  daysSinceLastSession: 1,
  userName: 'Samir',
  energy: 'medium',
  activeLoops: ['self-criticism'],
});
```

### Pre-Journey Sessions
```typescript
import { adaptPreJourneySession } from '@/lib/session';

const preJourneySession = PRE_JOURNEY_SESSIONS[0];
const unified = adaptPreJourneySession(preJourneySession, user.id);
```

### Sankalpa v3 Sessions
```typescript
import { adaptSankalpaSession } from '@/lib/session';

const sankalpaSession = await composeSessionV3(); // From edge function
const unified = adaptSankalpaSession(sankalpaSession, user.id);
```

## Migration Strategy

1. **Week 1**: Deploy migration + new types. Run `runMigration()` for all active users.
2. **Week 2**: Wire up `completeSession()` in session-shell completion.
3. **Week 3**: Add adapters to orb/sessionOrchestrator.ts.
4. **Week 4**: Enable unified naming across all systems.
5. **Week 5**: Add moments to completion screen.
6. **Week 6+**: Gradually deprecate old systems.

## Key Architectural Improvements

### Before
- 5 incompatible `SessionPlan` types
- localStorage for critical state
- No unified progress query
- Fragmented session naming
- No narrative arc tracking

### After
- Single `SessionPlan` type for all systems
- Postgres-backed state (no localStorage)
- `getUserJourney()` answers everything in one query
- Progression-aware, personalized naming
- Thread tracking shows user's story

## Next Steps

1. Apply the database migration: `supabase migration up`
2. Run `runMigration()` for existing users
3. Update session creation points to use `createSession()`
4. Update completion handlers to use `completeSession()`
5. Add moments UI to completion screen
6. Add journey dashboard to show arcs, streaks, milestones
