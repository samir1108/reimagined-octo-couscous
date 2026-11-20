# ADR 0001: Use XState for State Management

## Status

**Accepted**

## Context

ConsciousOS is a complex application with:
- Multi-step user flows (onboarding, daily journeys, assessments)
- Async operations with loading/error states
- Real-time synchronization requirements
- Complex UI state that needs to be predictable and debuggable

We needed a state management solution that could:
1. Handle complex state transitions predictably
2. Visualize state logic for team communication
3. Support async operations with proper loading states
4. Enable time-travel debugging
5. Integrate well with React

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Redux Toolkit | Mature, good DevTools | Boilerplate, learning curve |
| Zustand | Simple, lightweight | Less structured for complex flows |
| React Context + useReducer | Built-in, no deps | Hard to debug, doesn't scale |
| XState | Visualizable, predictable | Learning curve, more verbose |
| TanStack Query | Great for server state | Not for client state |

## Decision

We will use **XState v5** for client-side state management, combined with **TanStack Query** for server state.

### Rationale

1. **Visualizable State Machines**: XState's statecharts can be visualized, making it easier to discuss complex flows with the team
2. **Predictable Transitions**: State machines enforce valid transitions, preventing impossible states
3. **Actor Model**: XState 5's actor model enables better composition of state machines
4. **Type Safety**: Excellent TypeScript support with type inference
5. **Debugging**: Time-travel debugging and state inspection via XState DevTools

## Consequences

### Positive

- **Predictable state transitions** - Impossible states are unrepresentable
- **Visual documentation** - Statecharts serve as living documentation
- **Better testing** - Test state transitions independently of UI
- **Team alignment** - Visual models help communicate complex logic
- **Refactoring confidence** - State machine structure makes changes safer

### Negative

- **Learning curve** - Team needs to learn state machine concepts
- **More verbose** - More code than simple useState for simple cases
- **Bundle size** - XState adds ~15kb gzipped
- **Migration effort** - Existing code needs gradual migration

## Implementation

### Project Structure

```
src/machines/
├── appMachine.ts       # Global app state
├── authMachine.ts      # Authentication flow
├── journeyMachine.ts   # Daily journey flow
├── guruMachine.ts      # Guru interaction state
└── shared-types.ts     # Common machine types
```

### Example Usage

```typescript
import { setup, createMachine, assign } from 'xstate';

export const journeyMachine = setup({
  types: {
    context: {} as { journeyId: string | null },
    events: {} as 
      | { type: 'START_JOURNEY' }
      | { type: 'COMPLETE_MORNING' }
      | { type: 'COMPLETE_EVENING' }
  }
}).createMachine({
  id: 'journey',
  initial: 'idle',
  context: { journeyId: null },
  states: {
    idle: {
      on: { START_JOURNEY: { target: 'morning' } }
    },
    morning: {
      on: { COMPLETE_MORNING: { target: 'daytime' } }
    },
    daytime: {
      on: { COMPLETE_EVENING: { target: 'evening' } }
    },
    evening: {
      type: 'final'
    }
  }
});
```

## Related Decisions

- [ADR 0002: Dual State Architecture](./0002-dual-state-architecture.md)
- [ADR 0003: Supabase for Backend](./0003-supabase-for-backend.md)

## References

- [XState Documentation](https://stately.ai/docs/)
- [State Machines in React](https://kentcdodds.com/blog/state-machines)
- [Our XState Migration Guide](../README_XSTATE.md)

## Date

2024-01-15

## Author

Development Team
