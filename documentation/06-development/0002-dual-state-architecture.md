# ADR 0002: Dual State Architecture

## Status

**Accepted**

## Context

When building ConsciousOS, we needed to decide how to organize state management across the application. Two distinct types of state emerged:

1. **Server State**: Data from Supabase (profiles, journeys, journal entries)
   - Cached locally
   - Needs synchronization
   - Async operations
   - Shared across components

2. **Client State**: UI state (modals, forms, animations)
   - Ephemeral
   - Synchronous
   - Component-specific or shared
   - Complex state machines

A common anti-pattern is mixing these concerns, leading to:
- Confusion about where state lives
- Inconsistent data synchronization
- Difficult testing
- Tight coupling

## Decision

We will use a **Dual State Architecture**:

1. **TanStack Query** for all server state
2. **XState** for all client state

These two systems work together but never overlap in responsibility.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ConsciousOS State                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────┐    ┌───────────────────────────┐  │
│  │    SERVER STATE         │    │     CLIENT STATE          │  │
│  │    (TanStack Query)     │    │     (XState)              │  │
│  │                         │    │                           │  │
│  │  • Profiles             │    │  • UI mode (dark/light)   │  │
│  │  • Journeys             │    │  • Modal open/closed      │  │
│  │  • Journal entries      │◄──►│  • Form validation        │  │
│  │  • Tasks                │    │  • Animation states       │  │
│  │  • XP transactions      │    │  • Multi-step flows       │  │
│  │                         │    │  • Guru interaction       │  │
│  │  Caching, sync,         │    │  • Local only             │  │
│  │  background updates     │    │  • Predictable flows      │  │
│  └─────────────────────────┘    └───────────────────────────┘  │
│                                                                 │
│  Rule: Server state never goes in XState                       │
│  Rule: Client state never goes in TanStack Query               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Guidelines

### Server State (TanStack Query)

```typescript
// Good: Server state in TanStack Query
const { data: profile, isLoading } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => fetchProfile(userId)
});

const mutation = useMutation({
  mutationFn: updateProfile,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  }
});
```

### Client State (XState)

```typescript
// Good: Client state in XState
const [state, send] = useMachine(uiMachine);

// Current modal state
const isModalOpen = state.matches('modalOpen');

// Send event to change state
send({ type: 'OPEN_MODAL' });
```

### Integration Pattern

```typescript
// When they need to work together
const [uiState, send] = useMachine(journeyMachine);
const { data: journey } = useQuery({
  queryKey: ['journey', userId, date],
  queryFn: () => fetchJourney(userId, date)
});

// UI state triggers data fetch
useEffect(() => {
  if (uiState.matches('ready') && journey) {
    send({ type: 'JOURNEY_LOADED', journey });
  }
}, [journey, uiState, send]);
```

## Consequences

### Positive

- **Clear separation of concerns** - Easy to know where state belongs
- **Optimized caching** - TanStack Query handles server cache invalidation
- **Predictable UI flows** - XState enforces valid UI transitions
- **Easier testing** - Test server and client logic independently
- **Better performance** - Server state cached, client state lightweight

### Negative

- **Two libraries to learn** - Team needs knowledge of both
- **Integration complexity** - Sometimes need to sync between systems
- **More boilerplate** - Two state systems means more setup code

## Anti-Patterns to Avoid

### ❌ Don't put server state in XState

```typescript
// BAD: Fetching data inside machine
const badMachine = createMachine({
  states: {
    loading: {
      invoke: {
        src: 'fetchProfile', // Don't do this
        onDone: { target: 'loaded' }
      }
    }
  }
});
```

### ❌ Don't put client state in TanStack Query

```typescript
// BAD: Using TanStack Query for UI state
const { data: isModalOpen } = useQuery({
  queryKey: ['modal', 'open'],
  queryFn: () => false // This is wrong!
});
```

### ✅ Do integrate them cleanly

```typescript
// GOOD: Separate concerns, integrate where needed
const [uiState, send] = useMachine(modalMachine);
const { data: profile } = useQuery({ queryKey: ['profile'] });

// Open modal with data
const openModal = () => {
  send({ type: 'OPEN', data: profile });
};
```

## Related Decisions

- [ADR 0001: Use XState for State Management](./0001-use-xstate-for-state-management.md)
- [ADR 0003: Supabase for Backend](./0003-supabase-for-backend.md)

## Date

2024-01-20

## Author

Development Team
