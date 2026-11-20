# ConsciousOS API Documentation

> Complete reference for all data access functions and API endpoints

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Profiles API](#profiles-api)
- [Journeys API](#journeys-api)
- [Journal API](#journal-api)
- [XP & Achievements API](#xp--achievements-api)
- [Type Definitions](#type-definitions)

---

## Overview

ConsciousOS uses Supabase as the backend database with strongly-typed pure functions for all data operations. All API functions are located in `src/api/` and follow these principles:

- **Pure functions** - No side effects, return Promises
- **Strongly typed** - Full TypeScript support
- **Error handling** - Throws on error, caller handles with try/catch
- **XState compatible** - Designed for integration with state machines

### Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Components    │────▶│    Hooks     │────▶│   API Layer     │
│   (React)       │     │  (TanStack)  │     │  (src/api/)     │
└─────────────────┘     └──────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │    Supabase     │
                                              │   (PostgreSQL)  │
                                              └─────────────────┘
```

---

## Authentication

ConsciousOS uses Supabase Auth for authentication with JWT tokens.

### Session Management

```typescript
import { supabase } from '@/integrations/supabase/client';

// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle sign in
  }
  if (event === 'SIGNED_OUT') {
    // Handle sign out
  }
});
```

### User ID Access

All API functions require a `userId` parameter. Get the current user ID from the session:

```typescript
const userId = session?.user?.id;
if (!userId) throw new Error('User not authenticated');
```

---

## Error Handling

All API functions throw errors that should be caught by the caller. Common error patterns:

```typescript
import { fetchProfile } from '@/api/profiles';

try {
  const profile = await fetchProfile(userId);
} catch (error) {
  if (error.code === 'PGRST116') {
    // Record not found - this is handled internally in most functions
  } else {
    // Log and handle other errors
    console.error('API Error:', error);
  }
}
```

### Common Error Codes

| Code | Meaning | Handling |
|------|---------|----------|
| `PGRST116` | Record not found | Return null or default value |
| `23505` | Unique constraint violation | Handle duplicate entry |
| `42501` | RLS policy violation | Check user permissions |
| `PGRST301` | JWT expired | Refresh token or redirect to login |

---

## Profiles API

Location: `src/api/profiles.ts`

### Types

```typescript
interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  xp: number;
  level: number;
  consciousness_level: number;
  streak: number;
  longest_streak: number;
  streak_freezes: number;
  curriculum_mode: boolean;
  adaptive_mode: boolean;
  journey_path: string | null;
  current_phase: number;
  v_level: number | null;
  v_level_name: string | null;
  onboarding_completed: boolean;
  level_0_completed: boolean;
  created_at: string;
  updated_at: string;
}
```

### Functions

#### `fetchProfile(userId: string): Promise<Profile | null>`

Fetch a user's profile by their user ID.

```typescript
import { fetchProfile } from '@/api/profiles';

const profile = await fetchProfile(userId);
if (profile) {
  console.log(`Level: ${profile.level}, XP: ${profile.xp}`);
}
```

**Returns:** Profile object or null if not found

---

#### `createProfile(userId: string, initialData?: Partial<ProfileInsert>): Promise<Profile>`

Create a new profile for a user.

```typescript
import { createProfile } from '@/api/profiles';

const profile = await createProfile(userId, {
  display_name: 'Yogi User',
  journey_path: 'observation'
});
```

**Parameters:**
- `userId` - The user's Supabase auth ID
- `initialData` - Optional partial profile data

**Returns:** Newly created profile

---

#### `updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>`

Update a user's profile.

```typescript
import { updateProfile } from '@/api/profiles';

const updated = await updateProfile(userId, {
  display_name: 'New Name',
  level: 5,
  xp: 1500
});
```

**Parameters:**
- `userId` - The user's Supabase auth ID
- `updates` - Partial profile object with changes

**Returns:** Updated profile

---

## Journeys API

Location: `src/api/journeys.ts`

### Types

```typescript
type JourneyStatus = 
  | 'morning_pending' 
  | 'morning_in_progress' 
  | 'morning_completed'
  | 'daytime_pending'
  | 'daytime_in_progress'
  | 'daytime_completed'
  | 'evening_pending'
  | 'evening_in_progress'
  | 'evening_completed'
  | 'completed';

type TimeSegment = 'morning' | 'daytime' | 'evening';

interface Journey {
  id: string;
  user_id: string;
  date: string;
  status: JourneyStatus;
  morning_session_id: string | null;
  evening_session_id: string | null;
  theme: string | null;
  mood: string | null;
  analysis: string | null;
  practice_type: string | null;
  practice_duration: number | null;
  practice_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  journey_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  time_segment: TimeSegment;
  sequence_order: number;
  domains?: Domain; // Joined from domains table
}
```

### Functions

#### `fetchJourney(userId: string, date: string): Promise<Journey | null>`

Fetch a journey by user ID and date (YYYY-MM-DD format).

```typescript
import { fetchJourney } from '@/api/journeys';

const journey = await fetchJourney(userId, '2026-02-28');
```

---

#### `fetchTodayJourney(userId: string): Promise<Journey | null>`

Fetch today's journey for a user.

```typescript
import { fetchTodayJourney } from '@/api/journeys';

const todayJourney = await fetchTodayJourney(userId);
```

---

#### `fetchTasks(journeyId: string): Promise<Task[]>`

Fetch all tasks for a journey.

```typescript
import { fetchTasks } from '@/api/journeys';

const tasks = await fetchTasks(journeyId);
const completedTasks = tasks.filter(t => t.completed);
```

---

#### `createJourney(userId: string, date: string, status?: JourneyStatus): Promise<Journey>`

Create a new journey for a user on a specific date.

```typescript
import { createJourney } from '@/api/journeys';

const journey = await createJourney(userId, '2026-02-28', 'morning_pending');
```

---

#### `updateJourneyStatus(journeyId: string, status: JourneyStatus): Promise<Journey>`

Update the status of a journey.

```typescript
import { updateJourneyStatus } from '@/api/journeys';

const updated = await updateJourneyStatus(journeyId, 'morning_completed');
```

---

#### `createTask(journeyId: string, taskData: Partial<TaskInsert>): Promise<Task>`

Create a task within a journey.

```typescript
import { createTask } from '@/api/journeys';

const task = await createTask(journeyId, {
  title: 'Morning Meditation',
  description: '20 minutes of breath awareness',
  time_segment: 'morning',
  sequence_order: 1
});
```

---

#### `completeTask(taskId: string): Promise<Task>`

Mark a task as completed.

```typescript
import { completeTask } from '@/api/journeys';

const completedTask = await completeTask(taskId);
```

---

## Journal API

Location: `src/api/journal.ts`

### Types

```typescript
interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: string | null;
  word_count: number;
  journey_id: string | null;
  tags: string[];
  pillar_id: string | null;
  ai_prompts: unknown | null;
  created_at: string;
  updated_at: string;
}

interface JournalFilters {
  mood?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  pillarId?: string;
}

interface JournalEntriesResponse {
  data: JournalEntry[];
  total: number;
  hasMore: boolean;
}
```

### Functions

#### `fetchJournalEntries(userId: string, filters?: JournalFilters, page?: number, pageSize?: number): Promise<JournalEntriesResponse>`

Fetch paginated journal entries with optional filters.

```typescript
import { fetchJournalEntries } from '@/api/journal';

// Get first page
const { data, total, hasMore } = await fetchJournalEntries(userId);

// With filters
const result = await fetchJournalEntries(userId, {
  mood: 'peaceful',
  startDate: '2026-02-01',
  search: 'meditation'
}, 0, 20);
```

---

#### `fetchJournalEntry(entryId: string): Promise<JournalEntry | null>`

Fetch a single journal entry by ID.

```typescript
import { fetchJournalEntry } from '@/api/journal';

const entry = await fetchJournalEntry(entryId);
```

---

#### `createJournalEntry(userId: string, content: string, mood?: string, journeyId?: string): Promise<JournalEntry>`

Create a new journal entry.

```typescript
import { createJournalEntry } from '@/api/journal';

const entry = await createJournalEntry(
  userId,
  'Today I noticed a deep sense of calm during meditation...',
  'peaceful',
  journeyId
);
```

---

#### `updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<JournalEntry>`

Update an existing journal entry.

```typescript
import { updateJournalEntry } from '@/api/journal';

const updated = await updateJournalEntry(entryId, {
  content: 'Updated content...',
  mood: 'joyful'
});
```

---

#### `deleteJournalEntry(entryId: string): Promise<void>`

Delete a journal entry.

```typescript
import { deleteJournalEntry } from '@/api/journal';

await deleteJournalEntry(entryId);
```

---

## XP & Achievements API

Location: `src/api/xp.ts`

### Types

```typescript
interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  multiplier: number | null;
  created_at: string;
}

interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_freezes: number;
  last_activity_date: string | null;
}
```

### Functions

#### `fetchXPTransactions(userId: string, limit?: number): Promise<XPTransaction[]>`

Fetch XP transaction history for a user.

```typescript
import { fetchXPTransactions } from '@/api/xp';

const transactions = await fetchXPTransactions(userId, 20);
const totalXP = transactions.reduce((sum, tx) => sum + tx.amount, 0);
```

---

#### `addXP(userId: string, amount: number, source: string, multiplier?: number): Promise<{ transaction: XPTransaction; newTotal: number }>`

Add XP to a user.

```typescript
import { addXP } from '@/api/xp';

const { transaction, newTotal } = await addXP(
  userId,
  100,
  'complete_morning_practice',
  1.5 // 50% bonus
);

console.log(`Gained ${transaction.amount} XP! Total: ${newTotal}`);
```

---

#### `fetchAchievements(userId: string): Promise<Achievement[]>`

Fetch all unlocked achievements for a user.

```typescript
import { fetchAchievements } from '@/api/xp';

const achievements = await fetchAchievements(userId);
console.log(`Unlocked ${achievements.length} achievements`);
```

---

#### `unlockAchievement(userId: string, achievementId: string): Promise<Achievement>`

Unlock an achievement for a user.

```typescript
import { unlockAchievement } from '@/api/xp';

const achievement = await unlockAchievement(userId, 'first_meditation');
```

---

#### `fetchStreakData(userId: string): Promise<StreakData>`

Fetch streak information for a user.

```typescript
import { fetchStreakData } from '@/api/xp';

const { current_streak, longest_streak, streak_freezes } = await fetchStreakData(userId);
```

---

#### `updateStreak(userId: string, activityDate: string): Promise<StreakData>`

Update the streak for a user based on activity.

```typescript
import { updateStreak } from '@/api/xp';

const streakData = await updateStreak(userId, new Date().toISOString());
```

---

## Type Definitions

All types are auto-generated from the Supabase database schema and located in `src/types/`.

### Import Patterns

```typescript
// Import from types barrel
import type { ProfileRow, JourneyRow, TaskRow } from '@/types';

// Re-export from API modules
import type { Profile, Journey, Task } from '@/api/profiles';
// or
import type { Journey, Task } from '@/api/journeys';
```

### Key Type Categories

| Category | Location | Description |
|----------|----------|-------------|
| Database Row Types | `src/types/database.ts` | Raw Supabase table types |
| Insert Types | `src/types/database.ts` | Types for creating records |
| Update Types | `src/types/database.ts` | Types for updating records |
| API Types | `src/api/*.ts` | Domain-specific exports |

---

## Best Practices

### 1. Use TanStack Query for Data Fetching

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updateProfile } from '@/api/profiles';

// Fetch data
const { data: profile, isLoading } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => fetchProfile(userId),
  enabled: !!userId
});

// Mutate data
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (updates) => updateProfile(userId, updates),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
  }
});
```

### 2. Handle Loading States

Always handle loading and error states:

```typescript
if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
```

### 3. Use XState for Complex Flows

For multi-step operations, use XState actors:

```typescript
const machine = setup({
  actors: {
    fetchProfile: fromPromise(({ input }) => fetchProfile(input.userId))
  }
}).createMachine({
  // Machine definition
});
```

---

## Related Documentation

- [Database Schema](./DATABASE_SCHEMA.sql) - Complete SQL schema
- [Database Types](./DATABASE_TYPES.md) - Type generation guide
- [Testing Guide](./TESTING.md) - API testing patterns
- [XState Integration](../README_XSTATE.md) - State machine patterns
