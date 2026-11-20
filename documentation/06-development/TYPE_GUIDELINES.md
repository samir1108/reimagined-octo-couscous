# ConsciousOS Type Guidelines

> **Version**: 1.0.0  
> **Last Updated**: 2026-02-28  
> **Phase**: 11 - TypeScript Strict Mode Foundation

## Table of Contents

1. [Overview](#overview)
2. [Type Naming Conventions](#type-naming-conventions)
3. [Interface vs Type](#interface-vs-type)
4. [Generic Patterns](#generic-patterns)
5. [XState Machine Typing](#xstate-machine-typing)
6. [Database Type Generation](#database-type-generation)
7. [Strict Mode Compliance](#strict-mode-compliance)
8. [Common Patterns](#common-patterns)
9. [Migration Checklist](#migration-checklist)

---

## Overview

This document establishes type safety standards for the ConsciousOS codebase. With TypeScript 5.8.3 and strict mode enabled, we aim to eliminate implicit `any` types and ensure comprehensive type coverage across the application.

### Current State (Phase 11)

- **TypeScript Version**: 5.8.3
- **Strict Mode**: Infrastructure ready
- **Remaining `any` types**: 312 (to be addressed in Phase 12)
- **Configuration**: `tsconfig.strict.json` for incremental adoption

### Type Safety Goals

1. Zero implicit `any` types
2. Explicit null/undefined handling
3. Comprehensive XState machine typing
4. Generated database types from Supabase schema
5. Consistent error type handling

---

## Type Naming Conventions

### General Rules

| Pattern | Use Case | Example |
|---------|----------|---------|
| `PascalCase` | Types, Interfaces, Enums, Generics | `UserProfile`, `AuthState` |
| `camelCase` | Type aliases for primitives | `userId`, `timestamp` |
| `ALL_CAPS` | Enum values, constants | `STATUS_ACTIVE`, `ERROR_TIMEOUT` |
| `T` prefix | Generic type parameters | `TData`, `TContext` |

### Domain-Specific Suffixes

Use consistent suffixes for domain types:

```typescript
// Entity types
interface UserProfile { }
interface JourneyEntry { }
interface TaskItem { }

// State types (XState)
type AuthState = StateFrom<typeof authMachine>;
type UserContext = typeof userMachine extends Machine<infer C> ? C : never;

// Event types (XState)
type AuthEvent = { type: 'LOGIN'; payload: LoginPayload };
type UserEvent = { type: 'UPDATE_PROFILE'; data: ProfileData };

// Actor types
type AuthActor = ActorRefFrom<typeof authMachine>;
type UserActorRef = ActorRefFrom<typeof userMachine>;

// Hook return types
interface UseAuthReturn { }
interface UseQueryResult<T> { }

// Props types
interface ButtonProps { }
interface CardComponentProps { }

// Configuration types
interface QueryClientConfig { }
interface MachineConfig<TContext> { }

// API Response types
interface ApiResponse<T> { }
interface ApiErrorResponse { }

// Database row types (generated)
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type JourneyRow = Database['public']['Tables']['journeys']['Row'];
```

---

## Interface vs Type

### Use `interface` when:

1. **Defining object shapes that may be extended**
```typescript
interface User {
  id: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}
```

2. **Defining class implementations**
```typescript
interface Logger {
  log(message: string): void;
  error(error: Error): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(message); }
  error(error: Error) { console.error(error); }
}
```

3. **Public API definitions** (better error messages)
```typescript
// Interface provides clearer error messages
interface ComponentProps {
  title: string;
  onClick: () => void;
}
```

### Use `type` when:

1. **Union or intersection types**
```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';
type Response = SuccessResponse | ErrorResponse;
type PropsWithClass = BaseProps & { className?: string };
```

2. **Tuple types**
```typescript
type Point = [number, number];
type RGB = [red: number, green: number, blue: number];
```

3. **Mapped types or conditional types**
```typescript
type Optional<T> = { [K in keyof T]?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type NonNullable<T> = T extends null | undefined ? never : T;
```

4. **Function types with overloads**
```typescript
type EventHandler = {
  (event: MouseEvent): void;
  (event: KeyboardEvent): void;
};
```

5. **XState machine types** (use `type` for consistency with XState patterns)
```typescript
type AuthContext = {
  user: User | null;
  error: Error | null;
};

type AuthEvent =
  | { type: 'LOGIN'; credentials: Credentials }
  | { type: 'LOGOUT' }
  | { type: 'ERROR'; error: Error };
```

### Decision Flowchart

```
Need to extend later? → Use interface
Need union/intersection? → Use type
Defining public API? → Prefer interface
Complex mapped types? → Use type
XState machine types? → Use type
Everything else? → Default to interface
```

---

## Generic Patterns

### Standard Generic Names

| Name | Meaning | Example |
|------|---------|---------|
| `T` | Type | `function identity<T>(arg: T): T` |
| `K` | Key | `type Record<K extends string, T> = { [P in K]: T }` |
| `V` | Value | `interface Map<K, V> { }` |
| `E` | Error | `type Result<T, E = Error> = Ok<T> | Err<E>` |
| `C` | Context | XState machine context |
| `S` | State | `useState<S>(initialState: S)` |
| `P` | Props | React component props |
| `R` | Response | API response type |
| `TData` | Query data | TanStack Query data type |
| `TQueryKey` | Query key | TanStack Query key type |

### Common Generic Patterns

#### 1. API Response Wrapper

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ApiError<E = Error> {
  error: E;
  status: number;
  code: string;
}

type ApiResult<T, E = Error> = ApiResponse<T> | ApiError<E>;
```

#### 2. XState Machine Generics

```typescript
import { setup } from 'xstate';

interface MachineContext<TData = unknown> {
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
}

type MachineEvent<TPayload = unknown> =
  | { type: 'FETCH'; payload: TPayload }
  | { type: 'RESOLVE'; data: TPayload }
  | { type: 'REJECT'; error: Error };

const createMachine = <TData, TPayload>() => setup({
  types: {
    context: {} as MachineContext<TData>,
    events: {} as MachineEvent<TPayload>,
  },
  // ...
});
```

#### 3. React Component Generics

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  keyExtractor: (item: T) => string;
}

function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  // Implementation
}
```

#### 4. TanStack Query Patterns

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface UseUserOptions<TData = User> extends Omit<
  UseQueryOptions<TData, Error, TData>,
  'queryKey' | 'queryFn'
> {
  userId: string;
}

function useUser<TData = User>({ userId, ...options }: UseUserOptions<TData>) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId) as Promise<TData>,
    ...options,
  });
}
```

---

## XState Machine Typing

### Machine Setup Pattern

```typescript
import { setup, assign, fromPromise } from 'xstate';

// ============================================
// 1. Define Context Type
// ============================================
interface AuthContext {
  user: User | null;
  error: Error | null;
  isLoading: boolean;
}

// ============================================
// 2. Define Event Types (Discriminated Union)
// ============================================
type AuthEvent =
  | { type: 'LOGIN'; credentials: Credentials }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_SUCCESS'; user: User }
  | { type: 'AUTH_FAILURE'; error: Error };

// ============================================
// 3. Define Actor Logic Types
// ============================================
const authenticateActor = fromPromise<
  User,        // Return type
  Credentials  // Input type
>(async ({ input }) => {
  const response = await api.login(input);
  return response.user;
});

// ============================================
// 4. Create Machine with setup()
// ============================================
export const authMachine = setup({
  types: {
    context: {} as AuthContext,
    events: {} as AuthEvent,
  },
  actors: {
    authenticate: authenticateActor,
  },
  actions: {
    setUser: assign({
      user: (_, params: { user: User }) => params.user,
      error: null,
    }),
    setError: assign({
      error: (_, params: { error: Error }) => params.error,
    }),
    clearUser: assign({
      user: null,
      error: null,
    }),
  },
  guards: {
    isAuthenticated: ({ context }) => context.user !== null,
  },
}).createMachine({
  id: 'auth',
  initial: 'idle',
  context: {
    user: null,
    error: null,
    isLoading: false,
  },
  states: {
    idle: {
      on: {
        LOGIN: {
          target: 'authenticating',
          actions: assign({ isLoading: true }),
        },
      },
    },
    authenticating: {
      invoke: {
        src: 'authenticate',
        input: ({ event }) => {
          assertEvent(event, 'LOGIN');
          return event.credentials;
        },
        onDone: {
          target: 'authenticated',
          actions: {
            type: 'setUser',
            params: ({ event }) => ({ user: event.output }),
          },
        },
        onError: {
          target: 'error',
          actions: {
            type: 'setError',
            params: ({ event }) => ({ error: event.error as Error }),
          },
        },
      },
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: 'idle',
          actions: 'clearUser',
        },
      },
    },
    error: {
      on: {
        LOGIN: {
          target: 'authenticating',
          actions: assign({ isLoading: true }),
        },
      },
    },
  },
});

// ============================================
// 5. Export Derived Types
// ============================================
export type AuthActor = ActorRefFrom<typeof authMachine>;
export type AuthState = StateFrom<typeof authMachine>;
```

### Machine Type Exports

Always export these types from your machine file:

```typescript
// From machine file
export { authMachine };
export type { AuthContext, AuthEvent };

// Or from shared types file
export type AuthActorRef = ActorRefFrom<typeof import('./auth.machine').authMachine>;
export type AuthState = StateFrom<typeof import('./auth.machine').authMachine>;
```

### Using assertEvent for Type Safety

```typescript
import { assertEvent } from 'xstate';

// Use assertEvent to narrow event types in actions/guards
actions: {
  logLogin: ({ event }) => {
    assertEvent(event, 'LOGIN');
    // event is now narrowed to { type: 'LOGIN'; credentials: Credentials }
    console.log('Login attempt:', event.credentials.email);
  },
}
```

### Child Machine Communication

```typescript
// Parent machine
const parentMachine = setup({
  types: {
    context: {} as {
      childRef: ActorRefFrom<typeof childMachine> | null;
    },
    events: {} as { type: 'START_CHILD' } | { type: 'CHILD_DONE' },
  },
}).createMachine({
  context: { childRef: null },
  // ...
});

// Spawn child with proper typing
spawnChild('childMachine', { 
  id: 'child',
  systemId: 'childActor',
});
```

---

## Database Type Generation

### Supabase Type Generation Workflow

#### Step 1: Install Supabase CLI

```bash
npm install -g supabase
# or
npx supabase login
```

#### Step 2: Initialize Type Generation

```bash
# Generate types from your Supabase project
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > src/types/supabase.ts
```

#### Step 3: Configure TypeScript Path Alias

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/types/supabase": ["./src/types/supabase.ts"]
    }
  }
}
```

#### Step 4: Create Database Types File

```typescript
// src/types/database.ts
import type { Database } from './supabase';

// Export commonly used row types
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type JourneyRow = Database['public']['Tables']['journeys']['Row'];
export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type JournalEntryRow = Database['public']['Tables']['journal_entries']['Row'];

// Custom domain types (enriched from database types)
export interface UserProfile extends ProfileRow {
  // Add computed fields
  fullName: string;
  avatarUrl: string | null;
}

// Type helpers for Supabase queries
export type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type TableInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type TableUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];
```

### Using Database Types in Queries

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProfileRow, UserProfile } from '@/types/database';

// Typed query function
async function fetchProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  
  // Transform to domain type
  return {
    ...data,
    fullName: `${data.first_name} ${data.last_name}`,
    avatarUrl: data.avatar_url,
  };
}

// Typed React Query hook
function useProfile(userId: string) {
  return useQuery<UserProfile, Error>({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  });
}
```

---

## Strict Mode Compliance

### Enabled Strict Checks

| Check | Status | Description |
|-------|--------|-------------|
| `strict` | ✅ | Enable all strict type-checking options |
| `strictNullChecks` | ✅ | Null/undefined in separate domains |
| `noImplicitAny` | ✅ | Error on expressions with implied `any` |
| `strictFunctionTypes` | ✅ | Strict function parameter checking |
| `strictBindCallApply` | ✅ | Strict `bind`, `call`, `apply` methods |
| `strictPropertyInitialization` | ✅ | Strict class property initialization |
| `noImplicitThis` | ✅ | Error when `this` is `any` |
| `alwaysStrict` | ✅ | Parse in strict mode and emit `'use strict'` |
| `noUnusedLocals` | ✅ | Error on unused local variables |
| `noUnusedParameters` | ✅ | Error on unused parameters |
| `noImplicitReturns` | ✅ | Error when not all code paths return value |
| `noFallthroughCasesInSwitch` | ✅ | Error for fallthrough cases in switch |

### Handling Strict Null Checks

```typescript
// ❌ Bad - potential null reference
function getUserName(user: User | null): string {
  return user.name; // Error: Object is possibly 'null'
}

// ✅ Good - explicit null check
function getUserName(user: User | null): string {
  if (user === null) {
    return 'Anonymous';
  }
  return user.name;
}

// ✅ Good - optional chaining with fallback
function getUserName(user: User | null): string {
  return user?.name ?? 'Anonymous';
}

// ✅ Good - type guard
function isUser(value: User | null): value is User {
  return value !== null;
}

function getUserName(user: User | null): string {
  if (isUser(user)) {
    return user.name;
  }
  return 'Anonymous';
}
```

### Eliminating Implicit Any

```typescript
// ❌ Bad - implicit any
function processData(data) {
  return data.map(item => item.value);
}

// ✅ Good - explicit parameter types
interface DataItem {
  value: number;
}

function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}

// ✅ Good - generics for reusable functions
function processData<T extends { value: unknown }>(data: T[]): T['value'][] {
  return data.map(item => item.value);
}

// ❌ Bad - untyped API response
async function fetchUser() {
  const response = await fetch('/api/user');
  return response.json(); // Returns Promise<any>
}

// ✅ Good - typed API response
async function fetchUser(): Promise<User> {
  const response = await fetch('/api/user');
  const data: unknown = await response.json();
  
  // Validate with type guard or schema
  if (!isUser(data)) {
    throw new Error('Invalid user data');
  }
  
  return data;
}
```

### Strict Function Types

```typescript
// ❌ Bad - bivariant parameter checking
interface Handler {
  (event: Event): void;
}

const mouseHandler: Handler = (event: MouseEvent) => {
  // MouseEvent is more specific than Event
};

// ✅ Good - contravariant parameter checking with strictFunctionTypes
interface Handler {
  (event: MouseEvent): void;
}

const mouseHandler: Handler = (event: MouseEvent) => {
  // Exact type match required
};
```

---

## Common Patterns

### Result Type Pattern

```typescript
// Define Result type for explicit error handling
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await api.getUser(id);
    return { success: true, data: user };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

// Consumer must handle both cases
const result = await fetchUser('123');
if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error.message);
}
```

### Branded Types for Type Safety

```typescript
// Create distinct types for similar primitives
type UserId = string & { __brand: 'UserId' };
type JourneyId = string & { __brand: 'JourneyId' };
type TaskId = string & { __brand: 'TaskId' };

// Factory functions
function createUserId(id: string): UserId {
  return id as UserId;
}

function createJourneyId(id: string): JourneyId {
  return id as JourneyId;
}

// Type-safe usage
function fetchUser(id: UserId): Promise<User>;
function fetchJourney(id: JourneyId): Promise<Journey>;

// Prevents mixing up IDs
const userId = createUserId('user-123');
const journeyId = createJourneyId('journey-456');

fetchUser(userId);      // ✅ OK
fetchUser(journeyId);   // ❌ Error: Argument of type 'JourneyId' is not assignable to parameter of type 'UserId'
```

### Deep Readonly Pattern

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

interface Config {
  api: {
    url: string;
    timeout: number;
  };
  features: {
    auth: boolean;
    analytics: boolean;
  };
}

// All properties become deeply readonly
type ImmutableConfig = DeepReadonly<Config>;

const config: ImmutableConfig = {
  api: { url: 'https://api.example.com', timeout: 5000 },
  features: { auth: true, analytics: false },
};

config.api.url = 'new-url'; // ❌ Error: Cannot assign to 'url' because it is a read-only property
```

### Type-Safe Event Emitters

```typescript
interface EventMap {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'error': { message: string; code: number };
}

class TypedEmitter<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Array<(payload: Events[K]) => void> } = {};

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void {
    const listeners = this.listeners[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach(listener => listener(payload));
    }
  }
}

// Usage
const emitter = new TypedEmitter<EventMap>();

emitter.on('user:login', ({ userId, timestamp }) => {
  // Types are inferred: userId: string, timestamp: number
  console.log(`User ${userId} logged in at ${timestamp}`);
});

emitter.emit('user:login', { userId: '123', timestamp: Date.now() }); // ✅ OK
emitter.emit('user:login', { userId: '123' }); // ❌ Error: Property 'timestamp' is missing
```

---

## Migration Checklist

### Phase 11: Foundation (Current)

- [x] Create `tsconfig.strict.json` with incremental strict settings
- [x] Add type-check scripts to `package.json`
- [x] Create type guidelines documentation
- [x] Create strict type check progress tracking script
- [x] Fix critical path files (main.tsx, App.tsx, query-client.ts)
- [ ] Test regular build still works
- [ ] Document progress

### Phase 12: Any Type Elimination

Priority order for fixing `any` types:

#### High Priority (Core Infrastructure)
- [ ] XState machine context types
- [ ] Supabase query return types
- [ ] API client response types
- [ ] React Query hook return types

#### Medium Priority (Feature Modules)
- [ ] Auth module types
- [ ] Journey module types
- [ ] Task module types
- [ ] Journal module types
- [ ] Profile module types

#### Lower Priority (UI Components)
- [ ] Component prop types
- [ ] Event handler types
- [ ] Animation/transition types
- [ ] Third-party library wrappers

### Type Safety Metrics

Track these metrics over time:

| Metric | Phase 11 | Phase 12 Target |
|--------|----------|-----------------|
| `any` count | 312 | 0 |
| `@ts-expect-error` count | ? | < 10 |
| `@ts-ignore` count | ? | 0 |
| Type coverage | ?% | > 95% |
| Strict mode errors | ? | 0 |

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [XState TypeScript Docs](https://stately.ai/docs/typescript)
- [TanStack Query TypeScript](https://tanstack.com/query/latest/docs/framework/react/typescript)
- [Supabase Type Generation](https://supabase.com/docs/guides/api/rest/generating-types)
- [Total TypeScript](https://www.totaltypescript.com/)
