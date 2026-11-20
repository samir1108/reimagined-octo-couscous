# Real-time Features Documentation

## Overview

ConsciousOS implements comprehensive real-time features using Supabase Realtime for live collaboration, presence indicators, and instant data synchronization. This document describes the architecture, usage, and best practices.

## Table of Contents

1. [Architecture](#architecture)
2. [Core Services](#core-services)
3. [React Hooks](#react-hooks)
4. [UI Components](#ui-components)
5. [Machine Integration](#machine-integration)
6. [Optimistic Updates](#optimistic-updates)
7. [Best Practices](#best-practices)
8. [Security Considerations](#security-considerations)

---

## Architecture

### Real-time Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Presence   │  │   Updates    │  │    Broadcast    │   │
│  │    Hook      │  │    Hook      │  │     Service     │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘   │
│         │                  │                    │            │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌────────▼────────┐   │
│  │ PresenceIndicator │ │  RealtimeService  │   │   │
│  │ TypingIndicator   │ │                   │   │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
            ┌──────────────────┐
            │   Supabase SDK   │
            │   Realtime API   │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │  Supabase Server │
            │  Realtime Engine │
            └──────────────────┘
```

### Key Features

1. **Presence Tracking**: Know who is online and their current status
2. **Broadcast Messages**: Send real-time messages between clients
3. **Database Changes**: Subscribe to table changes (INSERT, UPDATE, DELETE)
4. **Optimistic Updates**: Immediate UI feedback with conflict resolution
5. **Offline Support**: Graceful handling of connection drops

---

## Core Services

### RealtimeService

The central service for managing real-time connections:

```typescript
import { realtime, PresenceData } from '@/lib/realtime/service';

// Subscribe to a channel
const unsubscribe = realtime.subscribe(
  'channel-name',
  {
    onPresenceSync: (state) => console.log('Presence:', state),
    onBroadcast: (payload) => console.log('Broadcast:', payload),
    onStatusChange: (status) => console.log('Status:', status),
  },
  { presence: true, broadcast: true }
);

// Track presence
await realtime.trackPresence('channel-name', {
  user_id: 'user-123',
  status: 'online',
  last_seen: new Date().toISOString(),
});

// Broadcast message
await realtime.broadcast('channel-name', 'custom-event', { data: 'value' });

// Cleanup
unsubscribe();
```

### Features

- **Channel Management**: Automatic cleanup and reconnection
- **Presence Tracking**: Track online users with status (online/away/busy)
- **Rate Limiting**: Built-in broadcast rate limiting (100ms)
- **Offline Detection**: Automatic reconnection when network returns
- **Error Recovery**: Exponential backoff for failed connections

---

## React Hooks

### usePresence

Track online users and presence status:

```typescript
import { usePresence, useTypingIndicator } from '@/hooks/usePresence';

function MyComponent() {
  const { 
    onlineUsers, 
    count, 
    users, 
    updateStatus,
    sendTyping,
    othersTyping 
  } = usePresence('room-123', currentUser.id, {
    enableTyping: true,
    initialPresence: { activity: 'viewing dashboard' },
  });

  return (
    <div>
      <p>{count} users online</p>
      <button onClick={() => updateStatus('busy')}>
        Set Busy
      </button>
    </div>
  );
}
```

### useTypingIndicator

Show typing indicators in collaborative contexts:

```typescript
function ChatInput() {
  const { sendTyping, othersTyping } = useTypingIndicator(
    'chat-room-123',
    currentUser.id,
    'chat'
  );

  return (
    <div>
      {othersTyping.length > 0 && (
        <span>Someone is typing...</span>
      )}
      <input 
        onChange={() => sendTyping(true)}
        onBlur={() => sendTyping(false)}
      />
    </div>
  );
}
```

### useRealtimeUpdates

Subscribe to database changes:

```typescript
import { useRealtimeUpdates, useRealtimeList } from '@/hooks/useRealtimeUpdates';

function TaskList() {
  // Basic subscription
  useRealtimeUpdates({
    table: 'tasks',
    queryKey: ['tasks'],
    onChange: (payload) => {
      console.log('Task changed:', payload);
    },
  });

  // List synchronization
  const { unsubscribe } = useRealtimeList('tasks', {
    onItemChange: (item, event) => {
      console.log(`Task ${item.id} ${event}`);
    },
  });

  return <TaskListView />;
}
```

---

## UI Components

### PresenceIndicator

Show online users with status indicators:

```tsx
import { PresenceIndicator, OnlineStatusDot } from '@/components/realtime';

function Header() {
  return (
    <header>
      <PresenceIndicator
        channelName="dashboard-room"
        userId={currentUser.id}
        maxAvatars={3}
        showCount
        size="md"
      />
      <OnlineStatusDot isOnline={isConnected} />
    </header>
  );
}
```

### TypingIndicator

Show when others are typing:

```tsx
import { 
  TypingIndicator, 
  ChatTypingIndicator,
  CollaborativeTypingBadge 
} from '@/components/realtime';

function Chat() {
  return (
    <div>
      <ChatTypingIndicator 
        channelName="chat-room-123" 
        userId={currentUser.id}
      />
      
      <CollaborativeTypingBadge
        channelName="editor-room"
        userId={currentUser.id}
      />
      
      <TypingIndicator
        channelName="custom-room"
        userId={currentUser.id}
        typingText="working on this"
      />
    </div>
  );
}
```

---

## Machine Integration

### Realtime Machine

Spawn a realtime machine from your feature machines:

```typescript
import { realtimeMachine } from '@/machines/realtime.machine';

// In your feature machine
const myMachine = setup({
  actors: {
    realtimeSubscription: realtimeMachine,
  },
}).createMachine({
  // ...
  states: {
    active: {
      invoke: {
        src: 'realtimeSubscription',
        input: ({ context }) => ({
          channelName: `room-${context.roomId}`,
          userId: context.userId,
          presenceData: {
            user_id: context.userId,
            status: 'online',
            last_seen: new Date().toISOString(),
          },
        }),
      },
      on: {
        // Handle events from realtime machine
        PRESENCE_SYNC: {
          actions: assign({
            onlineUsers: ({ event }) => event.state,
          }),
        },
        DATA_CHANGE: {
          actions: 'handleRealtimeUpdate',
        },
      },
    },
  },
});
```

### Best Practices for Machines

1. **Spawn on Active State**: Only spawn realtime subscriptions when needed
2. **Forward Events**: Use event forwarding to parent machines
3. **Cleanup**: Ensure proper cleanup when leaving states
4. **Error Handling**: Handle connection errors gracefully

---

## Optimistic Updates

### useOptimisticUpdate Hook

Apply immediate UI updates with automatic rollback:

```typescript
import { useOptimisticUpdate } from '@/lib/realtime/optimistic';

function TaskManager() {
  const { update, pending, hasPending } = useOptimisticUpdate<Task>({
    queryKey: ['tasks'],
    timeoutMs: 5000,
  });

  const handleAddTask = async (newTask: Task) => {
    try {
      await update(
        newTask,
        api.createTask(newTask) // Actual API call
      );
    } catch (error) {
      // Automatic rollback happens on error
      toast.error('Failed to create task');
    }
  };

  return (
    <div>
      {hasPending && <span>Saving...</span>}
      <TaskList tasks={tasks} pendingTasks={pending} />
    </div>
  );
}
```

### useOptimisticList

For list operations:

```typescript
const { addItem, updateItem, removeItem, pendingIds } = useOptimisticList<Task>(
  ['tasks']
);

// Add with optimistic update
await addItem(newTask, api.createTask(newTask));

// Update with optimistic update
await updateItem(taskId, updates, api.updateTask(taskId, updates));

// Remove with optimistic update
await removeItem(taskId, api.deleteTask(taskId));
```

### Conflict Resolution

Handle concurrent updates:

```typescript
import { ConflictResolver } from '@/lib/realtime/optimistic';

const resolver = new ConflictResolver<Task>();

// Register conflict
resolver.registerConflict(taskId, localVersion, serverVersion);

// Resolve with last-write-wins
const resolved = resolver.resolveLastWriteWins(taskId);

// Or custom merge
const merged = resolver.resolveMerge(taskId, (versions) => {
  // Custom merge logic
  return mergeVersions(versions);
});
```

---

## Best Practices

### 1. Channel Naming

Use consistent, descriptive channel names:

```typescript
// Good
`journey-${journeyId}`
`chat-${conversationId}`
`presence-${userId}`

// Avoid
`channel-1`
`realtime`
```

### 2. Presence Data

Limit presence data to essentials (no PII):

```typescript
// Good
{
  user_id: 'uuid',
  status: 'online',
  last_seen: '2024-01-01T00:00:00Z',
  activity: 'viewing dashboard',
}

// Avoid
{
  user_id: 'uuid',
  email: 'user@example.com', // PII
  full_name: 'John Doe', // PII
  // ... too much data
}
```

### 3. Cleanup

Always cleanup subscriptions:

```typescript
useEffect(() => {
  const unsubscribe = realtime.subscribe(...);
  return () => unsubscribe();
}, []);
```

### 4. Rate Limiting

Don't broadcast too frequently:

```typescript
// Debounce typing indicators
const debouncedSendTyping = useCallback(
  debounce((typing) => sendTyping(typing), 100),
  [sendTyping]
);
```

### 5. Error Handling

Handle connection errors gracefully:

```typescript
const { status } = usePresence('room', userId);

if (status === 'CHANNEL_ERROR') {
  return <OfflineIndicator />;
}
```

---

## Security Considerations

### Row Level Security (RLS)

Ensure RLS policies are configured for real-time tables:

```sql
-- Example policy for tasks table
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);
```

### Broadcast Security

Broadcast events are not subject to RLS. Validate on receiver:

```typescript
realtime.subscribe('channel', {
  onBroadcast: (payload) => {
    // Validate sender
    if (!isValidSender(payload.payload.user_id)) {
      return;
    }
    // Handle broadcast
  },
});
```

### Data Privacy

- Never include PII in presence data
- Use user IDs (UUIDs) instead of emails/names
- Sanitize broadcast payloads
- Log security events

---

## Troubleshooting

### Common Issues

1. **Connection Drops**
   - Check network connectivity
   - Verify Supabase URL and key
   - Check browser console for errors

2. **Missing Updates**
   - Ensure RLS policies allow reads
   - Verify table has realtime enabled
   - Check filter syntax

3. **High Memory Usage**
   - Limit number of active subscriptions
   - Clean up subscriptions properly
   - Use debouncing for frequent updates

### Debug Mode

Enable debug logging:

```typescript
// In RealtimeService
console.log('[RealtimeService]', message);
```

---

## API Reference

See inline JSDoc comments in:
- `src/lib/realtime/service.ts`
- `src/hooks/usePresence.ts`
- `src/hooks/useRealtimeUpdates.ts`
- `src/lib/realtime/optimistic.ts`
- `src/components/realtime/PresenceIndicator.tsx`
- `src/components/realtime/TypingIndicator.tsx`
- `src/machines/realtime.machine.ts`
