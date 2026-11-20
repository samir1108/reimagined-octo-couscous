"use client";

/**
 * IndexedDB wrapper for offline-first caching
 * Caches theme data, session plans, and user progress
 */

const DB_NAME = "satyug-cache";
const DB_VERSION = 1;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

type StoreName = "themes" | "sessions" | "userProgress" | "assets";

const STORES: Record<StoreName, { keyPath: string; indexes?: string[] }> = {
  themes: { keyPath: "date" },
  sessions: { keyPath: "id" },
  userProgress: { keyPath: "userId" },
  assets: { keyPath: "url" },
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      Object.entries(STORES).forEach(([name, config]) => {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: config.keyPath });
          config.indexes?.forEach((index) => {
            store.createIndex(index, index, { unique: false });
          });
        }
      });
    };
  });

  return dbPromise;
}

export async function cacheGet<T>(store: StoreName, key: IDBValidKey): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, "readonly");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        if (!entry) {
          resolve(null);
          return;
        }
        // Check expiration
        if (Date.now() > entry.expiresAt) {
          // Expired, delete it
          cacheDelete(store, key);
          resolve(null);
          return;
        }
        resolve(entry.data);
      };
    });
  } catch {
    return null;
  }
}

export async function cacheSet<T>(store: StoreName, key: IDBValidKey, data: T, ttlMs = 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const db = await openDB();
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put({ ...entry, [STORES[store].keyPath]: key });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    // Silently fail if IndexedDB unavailable
  }
}

export async function cacheDelete(store: StoreName, key: IDBValidKey): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    // Silently fail
  }
}

export async function cacheClear(store: StoreName): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    // Silently fail
  }
}

interface ThemeData {
  title?: string;
  description?: string;
  micro_practice?: { title?: string; description?: string; duration_min?: number };
  inner_inquiry?: string;
  engagement_question?: string;
  felt_sense_opener?: string;
  resistance_warning?: string;
  id?: string;
}

interface SessionData {
  id: string;
  user_id: string;
  type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  summary?: string;
  title?: string;
  sessionNumber?: number;
  closing?: { nextHint?: string };
}

interface UserProgressData {
  userId: string;
  streak_current?: number;
  journey_day?: number;
  overall_band?: number;
  [key: string]: unknown;
}

// High-level helpers for common cache operations
export const themeCache = {
  get: (date: string) => cacheGet<ThemeData>("themes", date),
  set: (date: string, theme: ThemeData) => cacheSet("themes", date, theme, 48 * 60 * 60 * 1000), // 48 hours
};

export const sessionCache = {
  get: (id: string) => cacheGet<SessionData>("sessions", id),
  set: (session: SessionData) => cacheSet("sessions", session.id, session, 7 * 24 * 60 * 60 * 1000), // 7 days
  getAll: async (): Promise<SessionData[]> => {
    try {
      const db = await openDB();
      return new Promise<SessionData[]>((resolve, reject) => {
        const transaction = db.transaction("sessions", "readonly");
        const objectStore = transaction.objectStore("sessions");
        const request = objectStore.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as SessionData[]);
      });
    } catch {
      return [];
    }
  },
};

export const userProgressCache = {
  get: (userId: string) => cacheGet<UserProgressData>("userProgress", userId),
  set: (userId: string, progress: UserProgressData) => cacheSet("userProgress", userId, progress, 30 * 24 * 60 * 60 * 1000), // 30 days
};

export const assetCache = {
  get: (url: string) => cacheGet<Blob>("assets", url),
  set: (url: string, blob: Blob) => cacheSet("assets", url, blob, 30 * 24 * 60 * 60 * 1000), // 30 days
};

// Check if we're online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen for online/offline events
export function onOnlineChange(callback: (online: boolean) => void): () => void {
  const handler = () => callback(navigator.onLine);
  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);
  return () => {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
  };
}