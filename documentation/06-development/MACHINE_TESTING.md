# Machine Testing Guide

## Overview

This guide documents the testing patterns and strategies for XState v5 machines in the ConsciousOS codebase.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [XState v5 Testing Patterns](#xstate-v5-testing-patterns)
3. [Test Utilities](#test-utilities)
4. [Writing Machine Tests](#writing-machine-tests)
5. [Common Patterns](#common-patterns)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Testing Philosophy

### Test Behavior, Not Implementation

XState machines define behavior through states, transitions, and effects. Tests should verify:

- **State coverage**: All states can be reached
- **Transitions**: Events cause the right state changes
- **Context updates**: State changes modify context correctly
- **Side effects**: Actions and actors are invoked appropriately
- **Error handling**: Error paths work correctly

### Mock External Dependencies

All external services (Supabase, API calls) should be mocked using:

```typescript
actors: {
  fetchData: fromPromise(() => Promise.resolve(mockData)),
}
```

## XState v5 Testing Patterns

### Basic Test Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fromPromise } from 'xstate';
import { myMachine } from '@/machines/my.machine';
import { startTestActor, assertState, waitForState } from '@/test/utils/machines';

describe('myMachine', () => {
  let actor: TestActor;

  afterEach(() => {
    if (actor) {
      actor.stop();
    }
  });

  it('should start in initial state', () => {
    actor = startTestActor(myMachine);
    assertState(actor, 'idle');
  });
});
```

### Testing Async Transitions

```typescript
it('should transition after async operation', async () => {
  actor = startTestActor(myMachine, {
    actors: {
      fetchData: fromPromise(() => Promise.resolve({ data: 'result' })),
    },
  });

  actor.send({ type: 'FETCH' });
  
  await waitForState(actor, 'success');
  assertState(actor, 'success');
});
```

### Testing Error Paths

```typescript
it('should handle errors gracefully', async () => {
  actor = startTestActor(myMachine, {
    actors: {
      fetchData: fromPromise(() => Promise.reject(new Error('Network error'))),
    },
  });

  actor.send({ type: 'FETCH' });
  
  await waitForState(actor, 'error');
  
  const snapshot = actor.getSnapshot();
  expect(snapshot.context.error).toBe('Network error');
});
```

### Testing Context Updates

```typescript
it('should update context on event', async () => {
  actor = startTestActor(myMachine);
  
  actor.send({ type: 'SET_VALUE', value: 42 } as any);
  
  const snapshot = actor.getSnapshot();
  expect(snapshot.context.value).toBe(42);
});
```

## Test Utilities

### `createTestActor(machine, options?)`

Creates a test actor with optional mocks:

```typescript
const actor = createTestActor(myMachine, {
  actors: {
    serviceName: fromPromise(() => Promise.resolve(data)),
  },
  actions: {
    actionName: mockAction,
  },
  guards: {
    guardName: () => true,
  },
});
actor.start();
```

### `startTestActor(machine, options?)`

Creates and starts a test actor in one call:

```typescript
const actor = startTestActor(myMachine, {
  actors: {
    serviceName: fromPromise(() => Promise.resolve(data)),
  },
});
```

### `assertState(actor, expectedState)`

Asserts the actor is in a specific state:

```typescript
assertState(actor, 'loading');
assertState(actor, ['idle', 'ready']); // Either state acceptable
```

### `assertContext(actor, expectedContext)`

Asserts context contains expected values:

```typescript
assertContext(actor, {
  user: mockUser,
  isLoading: false,
});
```

### `waitForState(actor, targetState, options?)`

Waits for an actor to reach a specific state:

```typescript
await waitForState(actor, 'authenticated', { timeout: 5000 });
await waitForState(actor, ['loaded', 'error']); // Wait for either state
```

### Mock Factories

```typescript
// Create mock actor that resolves
const mockService = createMockActor({ data: 'result' });

// Create mock actor that rejects
const mockErrorService = createMockErrorActor(new Error('Failed'));

// Create mock action
const mockAction = createMockAction('myAction');
```

## Writing Machine Tests

### Test Organization

Organize tests by:

1. **Initial State**: Verify initial state and context
2. **Happy Paths**: Successful flows through the machine
3. **Error Paths**: Error handling and recovery
4. **Edge Cases**: Boundary conditions and unusual inputs
5. **State Coverage**: Ensure all states are tested

### Example Test Suite Structure

```typescript
describe('myMachine', () => {
  describe('Initial State', () => {
    it('should start in idle state', () => {});
    it('should have correct initial context', () => {});
  });

  describe('Loading Flow', () => {
    it('should transition to loading on FETCH', () => {});
    it('should transition to loaded on success', () => {});
    it('should transition to error on failure', () => {});
  });

  describe('Error Handling', () => {
    it('should retry on RETRY event', () => {});
    it('should clear error on CLEAR_ERROR', () => {});
  });
});
```

## Common Patterns

### Testing Loading States

```typescript
it('should track loading state', async () => {
  let resolveLoad: (value: Data) => void;
  const loadPromise = new Promise<Data>((resolve) => {
    resolveLoad = resolve;
  });

  actor = startTestActor(myMachine, {
    actors: {
      fetchData: fromPromise(() => loadPromise),
    },
  });

  actor.send({ type: 'FETCH' });

  // Check loading immediately
  expect(actor.getSnapshot().context.isLoading).toBe(true);

  // Resolve and check completion
  resolveLoad!(mockData);
  await waitForState(actor, 'loaded');
  expect(actor.getSnapshot().context.isLoading).toBe(false);
});
```

### Testing Sequential Events

```typescript
it('should handle event sequence', async () => {
  actor = startTestActor(myMachine);

  actor.send({ type: 'STEP_1' } as any);
  assertState(actor, 'step1');

  actor.send({ type: 'STEP_2' } as any);
  assertState(actor, 'step2');

  actor.send({ type: 'COMPLETE' } as any);
  assertState(actor, 'completed');
});
```

### Testing Context Accumulation

```typescript
it('should accumulate context through transitions', async () => {
  actor = startTestActor(myMachine);

  actor.send({ type: 'SET_USER', user: mockUser } as any);
  expect(actor.getSnapshot().context.user).toEqual(mockUser);

  actor.send({ type: 'SET_DATA', data: mockData } as any);
  expect(actor.getSnapshot().context.data).toEqual(mockData);

  // Both values should be present
  const context = actor.getSnapshot().context;
  expect(context.user).toEqual(mockUser);
  expect(context.data).toEqual(mockData);
});
```

## Best Practices

### 1. Always Stop Actors

```typescript
afterEach(() => {
  if (actor) {
    actor.stop();
  }
});
```

### 2. Use Type Assertions for Events

Since XState v5 has strict typing, use `as any` for test events:

```typescript
actor.send({ type: 'LOGIN', email: 'test@test.com' } as any);
```

### 3. Mock All External Services

Never make real API calls in tests:

```typescript
actors: {
  login: fromPromise(() => Promise.resolve({ user: mockUser })),
  supabaseQuery: fromPromise(() => Promise.resolve({ data: [] })),
}
```

### 4. Test Both Success and Error Cases

Every async operation should have both success and error tests.

### 5. Keep Tests Fast

- Use short timeouts for `waitForState`
- Don't use real delays unless necessary
- Mock all async operations

### 6. Test State Coverage

Ensure all states in your machine are reachable in tests:

```typescript
const statePaths = getStatePaths(myMachine);
// Verify each path is tested
```

## Troubleshooting

### Tests Timeout Waiting for State

**Problem**: `waitForState` times out

**Solution**: 
- Check the machine actually transitions to that state
- Verify mocked services resolve/reject correctly
- Add logging to see actual state: `console.log(actor.getSnapshot().value)`

### Type Errors with Events

**Problem**: TypeScript errors when sending events

**Solution**: Use `as any` for event objects in tests:

```typescript
actor.send({ type: 'CUSTOM_EVENT', data: value } as any);
```

### Actor Not Stopping

**Problem**: Tests interfere with each other

**Solution**: Always stop actors in `afterEach`:

```typescript
afterEach(() => {
  actor?.stop();
});
```

### Context Not Updating

**Problem**: Context assertions fail

**Solution**: 
- Ensure you're waiting for async transitions
- Check that actions are correctly updating context
- Verify the state transition actually occurred

## Running Tests

```bash
# Run all machine tests
npm run test -- machines/__tests__

# Run specific test file
npm run test -- auth.machine.test.ts

# Run with coverage
npm run test:coverage -- machines/__tests__

# Run in watch mode
npm run test:watch -- machines/__tests__
```

## Resources

- [XState v5 Documentation](https://stately.ai/docs/xstate)
- [XState Testing Guide](https://stately.ai/docs/testing)
- [Vitest Documentation](https://vitest.dev/)
