# Hook Patterns & Guidelines

## Overview

This document defines the patterns, conventions, and best practices for creating and using hooks in the ConsciousOS codebase.

## Hook Consolidation Summary

**Phase 14** reduced the hook count from **96** to **~45** consolidated hooks organized into logical categories:

| Category | Before | After | Consolidation |
|----------|--------|-------|---------------|
| Data Hooks | 35 | 12 | 66% reduction |
| AI Hooks | 15 | 5 | 67% reduction |
| Adaptive Hooks | 20 | 5 | 75% reduction |
| UI Hooks | 15 | 8 | 47% reduction |
| Utils | 11 | 15 | Organized expansion |

## Directory Structure

```
src/hooks/
├── index.ts              # Main barrel export
├── data/                 # Data fetching & management
│   ├── index.ts
│   ├── useProfile.ts     # User profile + preferences
│   ├── useProgress.ts    # Streaks, levels, completion
│   ├── useJourney.ts     # Journey & tasks
│   ├── useJournal.ts     # Journal entries + autosave + voice
│   ├── useLoops.ts       # Loops + shadow work
│   ├── usePractices.ts   # Practices + timer
│   ├── useCapacities.ts  # Capacities + growth
│   ├── useLifeDomains.ts # Domains + tasks
│   ├── useXP.ts          # XP + gamification
│   ├── useVLevel.ts      # V-Level progression
│   ├── useLearning.ts    # Wisdom + knowledge
│   └── useHomeData.ts    # Home dashboard data
├── ai/                   # AI & Guru functionality
│   ├── index.ts
│   ├── useGuruChat.ts    # Chat + session + intelligence
│   ├── useGuruMemory.ts  # Memory + semantic
│   ├── useGuruStream.ts  # Streaming responses
│   ├── useVoiceAI.ts     # Voice + TTS
│   └── useCrisisDetection.ts # Safety monitoring
├── adaptive/             # Adaptive daily flow
│   ├── index.ts
│   ├── useAdaptiveDay.ts # Day management + engine
│   ├── useDaily.ts       # Theme + evening + sandhya
│   ├── useEngagement.ts  # Presence + pings
│   ├── useAnalytics.ts   # All analytics
│   └── useOnboarding.ts  # Onboarding flow
├── ui/                   # UI interaction
│   ├── index.ts
│   ├── useResponsive.ts  # Mobile + device capability
│   ├── useTheme.ts       # Night + zen + modes
│   ├── useAudio.ts       # Audio + ambient + effects
│   ├── useAnimation.ts   # Animations
│   ├── useToast.ts       # Toast notifications
│   ├── useNotifications.ts # Push + notifications
│   ├── useFocusManagement.ts # Accessibility
│   └── useScroll.ts      # Scroll behavior
├── utils/                # Utility hooks
│   ├── index.ts
│   ├── useOfflineSync.ts # Offline + sync
│   ├── useRealtime.ts    # Realtime updates
│   ├── useAPI.ts         # API utilities
│   ├── useScheduling.ts  # Scheduling + rituals
│   ├── useSafety.ts      # Safety monitoring
│   ├── useTime.ts        # Timezone handling
│   ├── useForm.ts        # Form utilities
│   └── usePWA.ts         # PWA utilities
└── types/                # Shared hook types
    └── index.ts
```

## Hook Naming Conventions

### 1. use[Domain][Action] for Data Hooks

```typescript
// Good
useProfile()        // Gets user profile
useProgress()       // Gets progress data
useJourney()        // Gets journey data

// Avoid
useGetProfile()     // Redundant "Get"
useUserData()       // Too vague
useData()           // Way too vague
```

### 2. use[Feature] for Feature Hooks

```typescript
// Good
useXP()             // XP system
useLoops()          // Loop system
useJournal()        // Journal system

// Avoid
useXPHook()         // Redundant "Hook"
useTheJournal()     // Unnecessary article
```

### 3. Consolidated Hooks Pattern

When consolidating multiple related hooks:

```typescript
// Single hook returns multiple related functionalities
export function useProgress() {
  return {
    // Streak data
    streak: { current, longest, freezesAvailable },
    useFreeze: () => Promise<void>,
    awardFreeze: () => Promise<void>,
    
    // Level data
    level: { current, next, xpToNext, progress },
    checkLevelUp: () => Promise<boolean>,
    
    // Completions
    completeTask: () => Promise<void>,
    completePractice: () => Promise<void>,
    completeBlock: () => Promise<void>,
    
    // Regressions
    regression: { isActive, triggers },
    activateProtocol: () => Promise<void>,
    
    // Breakthroughs
    breakthrough: { detected, type },
    acknowledge: () => Promise<void>,
  };
}
```

## Hook Structure Pattern

### Standard Hook Template

```typescript
/**
 * use[Name] - Brief description
 * Combines: useX + useY + useZ
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { queryKeys } from '@/lib/query-client';
import { toast } from '@/hooks/use-toast';

// ============================================================================
// Types
// ============================================================================

export interface Use[Name]Return {
  // Data
  data: DataType;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  action: () => Promise<void>;
  isPending: boolean;
  
  // Refetch
  refetch: () => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_VALUE = {};

// ============================================================================
// Helper Functions
// ============================================================================

async function fetchData(userId: string): Promise<DataType> {
  // Implementation
}

// ============================================================================
// Hook
// ============================================================================

export function use[Name](): Use[Name]Return {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || '';
  
  // Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.key(userId),
    queryFn: () => fetchData(userId),
    enabled: !!userId,
  });
  
  // Mutation
  const mutation = useMutation({
    mutationFn: async () => { /* impl */ },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.key(userId) });
      toast({ title: 'Success', description: 'Action completed' });
    },
  });
  
  return {
    data: data || DEFAULT_VALUE,
    isLoading,
    error: error as Error | null,
    action: mutation.mutateAsync,
    isPending: mutation.isPending,
    refetch: async () => { await refetch(); },
  };
}

export default use[Name];
```

## Data Fetching Patterns

### 1. Use TanStack Query for Server State

```typescript
// ✅ Good - Uses TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.profile(userId),
  queryFn: () => fetchProfile(userId),
  staleTime: 5 * 60 * 1000,
});

// ❌ Bad - Manual fetching
const [data, setData] = useState(null);
useEffect(() => {
  fetchProfile(userId).then(setData);
}, [userId]);
```

### 2. Use Mutations for Updates

```typescript
// ✅ Good - Uses mutation with optimistic updates
const updateMutation = useMutation({
  mutationFn: updateProfile,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
  },
});

// ❌ Bad - Direct state manipulation
const handleUpdate = async (data) => {
  await updateProfile(data);
  setProfile(data); // Don't do this
};
```

### 3. Query Key Organization

```typescript
// In lib/query-client.ts
export const queryKeys = {
  // Domain-based grouping
  profile: (userId: string) => ['profile', userId] as const,
  progress: (userId: string) => ['progress', userId] as const,
  journey: (date: string) => ['journey', date] as const,
  
  // List queries
  journalEntries: (filters?: object) => ['journal', 'entries', filters] as const,
  
  // Related data
  tasks: (journeyId: string) => ['tasks', journeyId] as const,
};
```

## State Management Patterns

### 1. Local State for UI Only

```typescript
// ✅ Good - Local state for UI state only
const [isOpen, setIsOpen] = useState(false);
const [activeTab, setActiveTab] = useState('profile');

// ❌ Bad - Don't cache server data locally
const [profile, setProfile] = useState(null); // Use useQuery instead
```

### 2. URL State for Shareable State

```typescript
// ✅ Good - URL state for filters
const [filters, setFilters] = useSearchParams();

// ❌ Bad - Local state for shareable filters
const [filters, setFilters] = useState({ date: new Date() });
```

### 3. localStorage for Persistence

```typescript
// ✅ Good - Persist user preferences
const [preferences, setPreferences] = useState(() => {
  const stored = localStorage.getItem('prefs');
  return stored ? JSON.parse(stored) : DEFAULT_PREFS;
});

useEffect(() => {
  localStorage.setItem('prefs', JSON.stringify(preferences));
}, [preferences]);
```

## Hook Composition Patterns

### 1. Composing Hooks

```typescript
// Higher-level hook composed from lower-level hooks
export function useAdaptiveDay() {
  const { profile } = useProfile();
  const { journey } = useJourney();
  const { xp } = useXP();
  
  // Combine and enhance
  return {
    isAdaptive: profile.adaptive_mode,
    currentDay: journey,
    progress: xp,
    // ... derived state
  };
}
```

### 2. Avoid Prop Drilling with Context

```typescript
// Create context for deeply shared state
const ThemeContext = createContext<ThemeState>(defaultTheme);

// Hook to access context
export function useTheme() {
  return useContext(ThemeContext);
}

// Provider wraps app
export function ThemeProvider({ children }) {
  const theme = useThemeState();
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## Error Handling Patterns

### 1. Hook-Level Error Handling

```typescript
export function useData() {
  const { data, error, isError } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });
  
  // Transform error for component
  const formattedError = useMemo(() => {
    if (!error) return null;
    return {
      message: error.message,
      code: (error as ApiError).code,
      retry: () => refetch(),
    };
  }, [error]);
  
  return { data, error: formattedError, isError };
}
```

### 2. Global Error Handling

```typescript
// In query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
    mutations: {
      onError: (error) => {
        // Global error reporting
        reportError(error);
      },
    },
  },
});
```

## Performance Patterns

### 1. Memoize Expensive Calculations

```typescript
export function useProgress() {
  const { data } = useQuery({ queryKey: ['progress'] });
  
  // ✅ Memoize expensive calculation
  const stats = useMemo(() => {
    return data?.items.reduce((acc, item) => {
      // Expensive aggregation
      return acc;
    }, {});
  }, [data?.items]);
  
  return { stats };
}
```

### 2. Stabilize Callbacks

```typescript
export function useActions() {
  const queryClient = useQueryClient();
  
  // ✅ Stabilize callback
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['data'] });
  }, [queryClient]);
  
  return { invalidate };
}
```

### 3. Lazy Loading

```typescript
// Only load when needed
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Hook for code splitting
export function useLazyData() {
  const [shouldLoad, setShouldLoad] = useState(false);
  
  const { data } = useQuery({
    queryKey: ['heavy-data'],
    queryFn: fetchHeavyData,
    enabled: shouldLoad, // Only fetch when enabled
  });
  
  return { data, load: () => setShouldLoad(true) };
}
```

## Testing Patterns

### 1. Mock TanStack Query

```typescript
// Test setup
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

// Wrapper for tests
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

// Test
test('useProfile fetches data', async () => {
  const { result } = renderHook(() => useProfile(), { wrapper });
  
  await waitFor(() => {
    expect(result.current.profile).toBeDefined();
  });
});
```

### 2. Test Hook Logic

```typescript
test('useProgress calculates streak correctly', () => {
  const { result } = renderHook(() => useProgress());
  
  act(() => {
    // Trigger action
    result.current.completeTask('task-1');
  });
  
  expect(result.current.streak.current).toBe(1);
});
```

## Migration Guide

### From Old Hooks to New Consolidated Hooks

| Old Hook(s) | New Hook | Notes |
|-------------|----------|-------|
| useProfile, usePreferences | useProfile | Preferences merged into profile |
| useXP, useGamification | useXP | Gamification in XP hook |
| useStreakManager, useCompletionTracking, useLevelProgression | useProgress | All progress consolidated |
| useJourney, useDayChain, useDayGate | useJourney | Day features in journey |
| useJournal, useJournalAutosave, useJournalPrompt | useJournal | All journal features |
| useLoops, useLoopDissolution, useShadowWork | useLoops | Shadow work in loops |
| useIsMobile, useDeviceCapability | useResponsive | All device detection |
| useNightMode, useZenMode | useTheme | Theme modes consolidated |
| useAudio, useAmbientMixer, useSoundEffects | useAudio | All audio features |

### Deprecation Pattern

```typescript
/**
 * @deprecated Use useProgress from '@/hooks/data' instead
 * This hook will be removed in v2.0
 */
export function useStreakManager() {
  // Re-export from new location for backwards compatibility
  const { streak, useFreeze, awardFreeze } = useProgress();
  return { 
    getStreakStatus: async () => streak,
    useStreakFreeze: useFreeze,
    awardStreakFreeze: awardFreeze,
  };
}
```

## Best Practices Checklist

- [ ] Use TanStack Query for all server state
- [ ] Use queryKeys for cache management
- [ ] Memoize expensive calculations
- [ ] Stabilize callbacks with useCallback
- [ ] Handle errors gracefully
- [ ] Add JSDoc comments
- [ ] Export types from barrel files
- [ ] Keep hooks focused and single-purpose
- [ ] Use TypeScript strictly
- [ ] Test hooks in isolation

## Anti-Patterns to Avoid

1. **Don't use useEffect for data fetching** - Use TanStack Query
2. **Don't duplicate state** - Single source of truth
3. **Don't ignore errors** - Always handle error states
4. **Don't over-fetch** - Use staleTime and caching
5. **Don't create too many small hooks** - Consolidate related functionality
6. **Don't ignore cleanup** - Clear timeouts, subscriptions
7. **Don't mutate state directly** - Always use setters
8. **Don't use any** - Type everything properly

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Custom Hooks Pattern](https://react.dev/learn/reusing-logic-with-custom-hooks)
