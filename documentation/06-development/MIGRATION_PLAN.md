# XState + TanStack Query Architecture Migration Plan

## Executive Summary

This document outlines a comprehensive migration from the current mixed state management approach to a unified **100% TanStack Query for data fetching** + **100% XState for business logic** architecture.

---

## Current State Analysis

### Existing Infrastructure

| Component | Current State | Count |
|-----------|---------------|-------|
| XState Machines | UI state only, NO data fetching | 14 machines |
| TanStack Query Hooks | Basic data fetching | 4 hooks (useProfile, useJourney, useJournal, useAnalytics) |
| Custom Hooks | Mixed concerns | 237 hooks |
| Direct Supabase Calls | In components | Multiple locations |
| React Context | Multiple contexts | ProfileContext, ThemeContext, PreferencesContext, ZenModeContext |

### Identified Issues

1. **Direct Supabase calls in components** - Especially [`AppLayout.tsx`](src/components/layout/AppLayout.tsx:85-126)
2. **Scattered business logic** - Mixed concerns in components
3. **XState machines are UI-only** - No services connected for data fetching
4. **Multiple contexts** - Fragmented state management

---

## Target State

### Architecture Principles

```
┌─────────────────────────────────────────────────────────────────┐
│                         COMPONENTS                              │
│              (Pure UI - No business logic)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ useXState() + useQuery()
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      XSTATE MACHINES                            │
│    (Business Logic, State Transitions, UI Flow Control)        │
│            └─► Services call TanStack Query                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ queryClient.fetchQuery()
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TANSTACK QUERY HOOKS                         │
│           (Data Fetching, Caching, Mutations)                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ supabase.from().select()
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                         │
└─────────────────────────────────────────────────────────────────┘
```

### Goals

1. ✅ **100% TanStack Query for data fetching** - ALL supabase calls go through query hooks
2. ✅ **100% XState for business logic** - Machines fetch data via services, handle all state transitions
3. ✅ **No direct database calls in components** - Pure UI only
4. ✅ **Unified state management** - XState actors replace contexts

---

## Migration Phases

### PHASE 1: TanStack Query Infrastructure Enhancement

#### 1.1 Query Factory Enhancement ([`query-client.ts`](src/lib/query-client.ts:28-102))
- ✅ Already exists with comprehensive query keys
- Add missing keys as needed

#### 1.2 Generic API Hook Wrapper ([`use-api.ts`](src/hooks/use-api.ts))
```typescript
// Create src/hooks/use-api.ts
// Generic wrapper for common CRUD operations
```

#### 1.3 Missing Data Hooks

| Hook | Purpose | File |
|------|---------|------|
| `useXP` | XP and gamification data | [`use-xp.ts`](src/hooks/use-xp.ts) |
| `useAchievements` | Achievement data | [`use-achievements.ts`](src/hooks/use-achievements.ts) |
| `useNotifications` | Notification data | [`use-notifications.ts`](src/hooks/use-notifications.ts) |
| `useScheduling` | Scheduling data | [`use-scheduling.ts`](src/hooks/use-scheduling.ts) |
| `usePractices` | Practice data | [`use-practices.ts`](src/hooks/use-practices.ts) |
| `useLoops` | Loop data | [`use-loops.ts`](src/hooks/use-loops.ts) |
| `useCapacities` | Capacity data | [`use-capacities.ts`](src/hooks/use-capacities.ts) |
| `useLifeDomains` | Life domain data | [`use-life-domains.ts`](src/hooks/use-life-domains.ts) |
| `useGuruMemories` | Guru/memory data | [`use-guru-memories.ts`](src/hooks/use-guru-memories.ts) |
| `useAdaptiveDay` | Adaptive day data | [`use-adaptive-day.ts`](src/hooks/use-adaptive-day.ts) |

#### 1.4 Realtime Subscription Hooks

| Hook | Purpose | File |
|------|---------|------|
| `useRealtimeProfile` | Profile updates | [`use-realtime-profile.ts`](src/hooks/use-realtime-profile.ts) |
| `useRealtimeJourney` | Journey/task updates | [`use-realtime-journey.ts`](src/hooks/use-realtime-journey.ts) |

---

### PHASE 2: XState Machine Enhancement

Enhance all 14 machines to fetch data via services connected to TanStack Query.

#### Machine Enhancement Pattern

```typescript
// BEFORE: Machine only handles UI states
const machine = createMachine({
  id: 'journey',
  initial: 'idle',
  states: {
    idle: { on: { LOAD: 'loading' } },
    loading: { on: { SET_DATA: 'loaded' } },
    loaded: {},
  },
});

// AFTER: Machine with services connected to TanStack Query
const machine = createMachine({
  id: 'journey',
  initial: 'loading',
  context: { journey: null, error: null },
  states: {
    loading: {
      invoke: {
        src: 'fetchJourney',
        onDone: {
          target: 'loaded',
          actions: assign({ journey: ({ event }) => event.data, error: () => null }),
        },
        onError: {
          target: 'error',
          actions: assign({ error: ({ event }) => event.data }),
        },
      },
    },
    loaded: {
      on: {
        REFRESH: 'loading',
        UPDATE_TASK: 'updating',
      },
    },
    updating: {
      invoke: {
        src: 'updateTask',
        onDone: { target: 'loaded', actions: 'notifySuccess' },
        onError: { target: 'loaded', actions: 'notifyError' },
      },
    },
    error: { on: { RETRY: 'loading' } },
  },
});
```

#### Machine-by-Machine Implementation

| Machine | Services to Add | Priority |
|---------|-----------------|----------|
| [`authMachine`](src/machines/authMachine.ts) | login, logout, signup, forgotPassword | HIGH |
| [`profileMachine`](src/machines/profileMachine.ts) | fetchProfile, updateProfile | HIGH |
| [`journeyMachine`](src/machines/journeyMachine.ts) | fetchJourney, createJourney, fetchTasks, updateTask | HIGH |
| [`journalMachine`](src/machines/journalMachine.ts) | fetchEntries, createEntry, updateEntry, deleteEntry | HIGH |
| [`xpMachine`](src/machines/xpMachine.ts) | fetchXP, awardXP, fetchAchievements, unlockAchievement | MEDIUM |
| [`adaptiveDayMachine`](src/machines/adaptiveDayMachine.ts) | fetchAdaptiveDay, updateCheckIn, updateReflection | MEDIUM |
| [`practicesMachine`](src/machines/practicesMachine.ts) | fetchPractices, completePractice | MEDIUM |
| [`loopsMachine`](src/machines/loopsMachine.ts) | fetchLoops, updateLoopProgress | MEDIUM |
| [`capacitiesMachine`](src/machines/capacitiesMachine.ts) | fetchCapacities, updateCapacity | MEDIUM |
| [`lifeDomainsMachine`](src/machines/lifeDomainsMachine.ts) | fetchDomains, updateDomainProgress | MEDIUM |
| [`notificationsMachine`](src/machines/notificationsMachine.ts) | fetchNotifications, markAsRead | LOW |
| [`guruMachine`](src/machines/guruMachine.ts) | fetchMemories, createSession | LOW |
| [`schedulingMachine`](src/machines/schedulingMachine.ts) | fetchScheduled, createSchedule | LOW |
| [`analyticsMachine`](src/machines/analyticsMachine.ts) | fetchAnalytics, generateReport | LOW |

---

### PHASE 3: Component Cleanup

Remove all direct Supabase calls from components.

#### Critical Files to Fix

| File | Issue | Action |
|------|-------|--------|
| [`AppLayout.tsx`](src/components/layout/AppLayout.tsx:85-126) | Direct supabase.from().select() | Replace with useQuery() |
| [Other files] | Search for `supabase.from(` | Replace with hooks |

#### Search Pattern
```bash
# Find all direct Supabase calls in components
grep -r "supabase.from" src/components/
grep -r "supabase.insert" src/components/
grep -r "supabase.update" src/components/
grep -r "supabase.delete" src/components/
```

---

### PHASE 4: Context Consolidation

Replace React Contexts with XState machines + TanStack Query.

| Context | Current Usage | Target Solution |
|---------|---------------|-----------------|
| ProfileContext | User profile state | useProfile() + profileMachine |
| ThemeContext | Theme preferences | Keep minimal (Theme only) |
| PreferencesContext | User preferences | usePreferences() hook |
| ZenModeContext | UI state | Use ZenMode XState machine |

---

### PHASE 5: Code Cleanup

#### Remove Unused Hooks
- Analyze 237 custom hooks
- Identify duplicates
- Remove dead code

#### Expected Hook Reduction
- Target: ~50-80 essential hooks
- Remove: 150+ unused/duplicate hooks

---

## Implementation Order

### Week 1: Infrastructure
1. Day 1-2: Create query factory and use-api wrapper
2. Day 3-4: Create missing data hooks (5-6 hooks)
3. Day 5: Create realtime subscription hooks

### Week 2: Machine Enhancement
1. Day 1-2: authMachine, profileMachine, journeyMachine
2. Day 3-4: journalMachine, xpMachine, adaptiveDayMachine
3. Day 5: Remaining machines

### Week 3: Component Cleanup & Contexts
1. Day 1-2: Fix AppLayout.tsx and critical components
2. Day 3-4: Replace contexts with hooks
3. Day 5: Search and destroy remaining direct DB calls

### Week 4: Cleanup
1. Day 1-2: Remove unused hooks
2. Day 3-4: Final integration testing
3. Day 5: Documentation update

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Direct DB calls in components | Multiple | 0 |
| XState machines with services | 0 | 14 |
| TanStack Query hooks | 4 | 20+ |
| React Contexts | 4+ | 1 (Theme only) |
| Custom hooks | 237 | ~60 |

---

## Rollback Plan

If issues arise:
1. Keep backup of original files
2. Implement incrementally with feature flags
3. Test each machine enhancement before proceeding
4. Maintain backward compatibility during transition

---

## Notes

- All new hooks should follow the pattern in [`useProfile.ts`](src/hooks/useProfile.ts)
- Query keys are already defined in [`query-client.ts`](src/lib/query-client.ts)
- Use the same error handling and toast patterns
- Ensure TypeScript types are shared between hooks and machines
