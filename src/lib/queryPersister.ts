import { get, set, del } from 'idb-keyval';
import type { PersistedClient } from '@tanstack/react-query-persist-client';

const IDB_KEY = 'hope-app-query-cache';

/**
 * IndexedDB-based persister for TanStack Query.
 * Stores the full query cache in IndexedDB for instant loads on return visits.
 * Much better than localStorage: no 5MB limit, non-blocking async I/O.
 */
export const indexedDBPersister = {
  persistClient: async (client: PersistedClient) => {
    try {
      await set(IDB_KEY, client);
    } catch {
      // Silently fail — cache is a nice-to-have
    }
  },
  restoreClient: async (): Promise<PersistedClient | undefined> => {
    try {
      return await get<PersistedClient>(IDB_KEY);
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      await del(IDB_KEY);
    } catch {
      // Silently fail
    }
  },
};
