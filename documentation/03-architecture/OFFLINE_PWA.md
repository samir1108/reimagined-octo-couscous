# Offline-First Architecture & PWA Guide

This document describes the offline-first architecture and Progressive Web App (PWA) features of ConsciousOS.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Service Worker](#service-worker)
4. [Offline Storage](#offline-storage)
5. [Background Sync](#background-sync)
6. [API Wrappers](#api-wrappers)
7. [UI Components](#ui-components)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Overview

ConsciousOS implements a robust offline-first architecture that allows users to:

- Use the app fully without an internet connection
- Queue mutations (create/update/delete) for automatic sync when online
- View cached data when offline
- Receive visual feedback about sync status
- Get push notifications for reminders and updates

### Key Features

- ✅ **Full Offline Support**: Core functionality works without internet
- ✅ **Background Sync**: Automatic sync when connection restored
- ✅ **Optimistic Updates**: Immediate UI feedback for user actions
- ✅ **Conflict Resolution**: Smart handling of concurrent changes
- ✅ **Offline Indicators**: Clear UI feedback about network status
- ✅ **Push Notifications**: Native app-like notification experience

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ OfflineIndicator│  │   SyncButton    │  │  useOffline │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           createOfflineAwareAPI                      │  │
│  │   - Queue mutations when offline                     │  │
│  │   - Return cached/optimistic data                    │  │
│  │   - Auto-sync when online                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│  OfflineStorage  │ │  IndexedDB   │ │  Cache API   │
│  (idb wrapper)   │ │  (mutations) │ │  (responses) │
└──────────────────┘ └──────────────┘ └──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Worker                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Fetch Handler│  │ Background   │  │ Push Notification│  │
│  │ (caching)    │  │ Sync         │  │ Handler          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Service Worker

The service worker (`public/sw.js`) provides:

### Caching Strategies

1. **Cache-First**: Static assets (JS, CSS, images)
2. **Network-First**: HTML pages with offline fallback
3. **Stale-While-Revalidate**: Google Fonts and dynamic content
4. **API Cache**: Supabase API responses with background revalidation

### Background Sync

```javascript
// Register for background sync
await registration.sync.register('sync-mutations');

// Service worker handles sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(syncPendingMutations());
  }
});
```

### Push Notifications

The service worker handles push notifications for:
- Morning practice reminders
- Evening reflection prompts
- Streak warnings
- Affirmation notifications

## Offline Storage

The `OfflineStorage` class provides a typed interface to IndexedDB:

### Features

- **Mutation Queue**: Store pending create/update/delete operations
- **Data Cache**: Cache API responses with TTL
- **Sync Status**: Track last sync time and errors
- **Cleanup**: Automatic removal of expired cache entries

### Database Schema

```typescript
interface OfflineDB {
  mutations: {
    id: string;
    type: 'create' | 'update' | 'delete';
    table: string;
    data: unknown;
    timestamp: number;
    retryCount: number;
  };
  cache: {
    key: string;
    data: unknown;
    timestamp: number;
    ttl: number;
  };
  syncStatus: {
    lastSync: number;
    pendingCount: number;
    lastError?: string;
  };
}
```

### Usage

```typescript
import { offlineStorage } from '@/lib/offline/storage';

// Queue a mutation
await offlineStorage.queueMutation({
  id: 'unique-id',
  type: 'create',
  table: 'journal_entries',
  data: { title: 'My Entry', content: '...' },
});

// Get pending mutations
const pending = await offlineStorage.getPendingMutations();

// Cache data
await offlineStorage.cacheData('journal-list', data, 3600000);

// Retrieve cached data
const cached = await offlineStorage.getCachedData('journal-list');
```

## Background Sync

Background sync automatically processes queued mutations when:
1. The browser comes back online
2. A periodic sync event fires (if supported)
3. User manually triggers sync

### Retry Logic

- Failed mutations are retried up to 5 times
- Exponential backoff between retries
- Permanent failures are logged for manual review

### Conflict Resolution

When a mutation fails with a 409 (Conflict) status:
1. The mutation is considered successful (entity already exists)
2. The local mutation is removed from queue
3. UI is notified of the sync

## API Wrappers

### createOfflineAwareAPI

Wraps API functions for offline support:

```typescript
import { createOfflineAwareAPI } from '@/api/offline-wrapper';

const createJournalEntry = createOfflineAwareAPI(
  api.createJournalEntry,
  {
    cacheKey: 'journal-entries',
    mutationType: 'create',
    table: 'journal_entries',
    optimistic: true,
    optimisticGenerator: (input) => ({
      ...input,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
    }),
  }
);

// Use it - works online and offline!
const result = await createJournalEntry({ title: 'Entry', content: '...' });
console.log(result.queued); // true if offline
console.log(result.isOptimistic); // true if using optimistic data
```

### createOfflineAwareQuery

Caches query results for offline access:

```typescript
const getJournalEntries = createOfflineAwareQuery(
  api.getJournalEntries,
  'journal-entries-list',
  300000 // 5 minute TTL
);

// Returns cached data if offline
const entries = await getJournalEntries();
```

## UI Components

### OfflineIndicator

Main component showing network status and sync state:

```tsx
import { OfflineIndicator } from '@/components/offline';

function App() {
  return (
    <>
      <YourApp />
      <OfflineIndicator 
        position="bottom" 
        showSyncButton={true}
        autoHideDelay={3000}
      />
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'top' \| 'bottom'` | `'bottom'` | Indicator position |
| `showSyncButton` | `boolean` | `true` | Show manual sync button |
| `autoHideDelay` | `number` | `3000` | Auto-hide delay in ms (0 to disable) |
| `className` | `string` | - | Additional CSS classes |

### SyncButton

Standalone sync button component:

```tsx
import { SyncButton } from '@/components/offline';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <SyncButton />
    </header>
  );
}
```

### OfflineBadge

Small badge for inline use:

```tsx
import { OfflineBadge } from '@/components/offline';

function TaskList() {
  return (
    <div>
      <h2>Tasks <OfflineBadge /></h2>
      {/* ... */}
    </div>
  );
}
```

## Usage Examples

### Complete Offline-Aware Component

```tsx
import { useOffline } from '@/hooks/useOffline';
import { createOfflineAwareAPI } from '@/api/offline-wrapper';
import { OfflineBadge } from '@/components/offline';
import { useState } from 'react';

// Create offline-aware API
const saveEntry = createOfflineAwareAPI(
  api.saveJournalEntry,
  {
    cacheKey: 'journal-entries',
    mutationType: 'create',
    table: 'journal_entries',
    optimistic: true,
  }
);

function JournalEditor() {
  const [content, setContent] = useState('');
  const [savedEntry, setSavedEntry] = useState(null);
  const { isOnline, pendingMutations } = useOffline();

  const handleSave = async () => {
    try {
      const result = await saveEntry({ content });
      setSavedEntry(result.data);
      
      if (result.queued) {
        // Show "saved locally" message
        toast.success('Saved locally - will sync when online');
      } else {
        toast.success('Saved!');
      }
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>Journal</h1>
        <OfflineBadge />
      </div>
      
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      
      <button onClick={handleSave}>
        Save {isOnline ? '' : '(offline)'}
      </button>
      
      {savedEntry?._offline && (
        <span className="text-amber-500">Pending sync...</span>
      )}
    </div>
  );
}
```

### Batch Operations

```typescript
import { batchOfflineOperations } from '@/api/offline-wrapper';

// Queue multiple operations at once
const mutationIds = await batchOfflineOperations([
  { type: 'create', table: 'tasks', data: task1 },
  { type: 'create', table: 'tasks', data: task2 },
  { type: 'update', table: 'journal_entries', data: entry },
]);

console.log('Queued mutations:', mutationIds);
```

## Best Practices

### 1. Always Wrap Mutations

```typescript
// ❌ Don't call API directly
await api.createEntry(data);

// ✅ Use offline-aware wrapper
await createEntry(data);
```

### 2. Handle Optimistic States

```tsx
function EntryList() {
  const entries = useEntries();
  
  return (
    <ul>
      {entries.map(entry => (
        <li key={entry.id} className={entry._offline ? 'opacity-50' : ''}>
          {entry.title}
          {entry._offline && <span> (syncing...)</span>}
        </li>
      ))}
    </ul>
  );
}
```

### 3. Set Appropriate TTLs

```typescript
// Frequently changing data - short TTL
const getTasks = createOfflineAwareQuery(api.getTasks, 'tasks', 60000);

// Relatively static data - longer TTL
const getUserProfile = createOfflineAwareQuery(api.getProfile, 'profile', 86400000);
```

### 4. Handle Sync Errors

```tsx
const { syncStatus, syncError, sync } = useOffline();

useEffect(() => {
  if (syncStatus === 'error') {
    // Show error notification
    toast.error(`Sync failed: ${syncError}`);
  }
}, [syncStatus, syncError]);
```

### 5. Test Offline Scenarios

1. Use browser DevTools Network tab to simulate offline
2. Test on actual mobile devices in airplane mode
3. Verify data persists across page reloads
4. Check sync behavior when coming back online

## Troubleshooting

### Issue: Mutations not syncing

**Solution:**
1. Check browser console for service worker errors
2. Verify `navigator.serviceWorker.ready` resolves
3. Ensure background sync is supported and permitted
4. Check IndexedDB for stored mutations

### Issue: Cached data not updating

**Solution:**
1. Clear site data in browser settings
2. Check TTL values - may be too long
3. Use `offlineStorage.removeCachedData(key)` to force refresh
4. Verify cache key uniqueness

### Issue: Service worker not updating

**Solution:**
1. Use `?update=true` query param to force update
2. Unregister service worker in DevTools
3. Clear browser cache
4. Check for JavaScript errors in service worker

### Debug Commands

```javascript
// Check service worker status
navigator.serviceWorker.ready.then(reg => console.log('SW ready:', reg));

// View pending mutations
offlineStorage.getPendingMutations().then(console.log);

// Force sync
offlineStorage.forceSync();

// Clear all storage
offlineStorage.clearMutations();
offlineStorage.clearCache();
```

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Background Sync | ✅ | ⚠️ | ❌ | ✅ |
| Periodic Sync | ✅ | ❌ | ❌ | ✅ |
| Push Notifications | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |

*Background Sync falls back to online event listeners in unsupported browsers*

## Resources

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [idb library](https://github.com/jakearchibald/idb)
- [Workbox](https://developer.chrome.com/docs/workbox/) (if we migrate to Workbox)

## Future Enhancements

- [ ] Conflict resolution UI for manual merge
- [ ] Delta sync for large datasets
- [ ] Offline image upload queue
- [ ] Compression for large mutations
- [ ] Sync prioritization (important first)
- [ ] Export/import offline data
