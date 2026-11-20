/**
 * CONTENT LIBRARY — Supabase Data Layer (offline-first)
 * User progress, favorites, recommendations sync.
 * Falls back to localStorage when offline or unauthenticated.
 */

import { supabase } from "@/lib/supabase";
import type { LibraryItem } from "@/types/contentLibrary";

const LS_KEY = "consciousos.library";

interface LocalState {
  progress: Record<string, { completed: boolean; completedAt?: string; rating?: number }>;
  favorites: string[];
  recentlyViewed: string[];
}

function loadLocal(): LocalState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          progress: parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
          recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
        };
      }
    }
  } catch { /* offline */ }
  return { progress: {}, favorites: [], recentlyViewed: [] };
}

function saveLocal(state: LocalState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch { /* offline */ }
}

export async function getUserProgress(userId?: string): Promise<LocalState["progress"]> {
  const local = loadLocal().progress;
  if (!userId) return local;
  try {
    const { data } = await supabase.from("user_library_progress").select("*").eq("user_id", userId);
    if (data) {
      const merged = { ...local };
      for (const row of data as Record<string,unknown>[]) {
        merged[row.item_id] = { completed: row.completed, completedAt: row.completed_at, rating: row.rating };
      }
      return merged;
    }
  } catch { /* offline */ }
  return local;
}

export async function markComplete(userId: string | undefined, itemId: string, rating?: number): Promise<void> {
  const state = loadLocal();
  state.progress[itemId] = { completed: true, completedAt: new Date().toISOString(), rating };
  saveLocal(state);
  if (userId) {
    try {
      await supabase.from("user_library_progress").upsert({
        user_id: userId,
        item_id: itemId,
        completed: true,
        completed_at: new Date().toISOString(),
        rating,
      });
    } catch { /* offline */ }
  }
}

export async function toggleFavorite(userId: string | undefined, itemId: string): Promise<boolean> {
  const state = loadLocal();
  const idx = state.favorites.indexOf(itemId);
  const isFav = idx === -1;
  if (isFav) state.favorites.push(itemId);
  else state.favorites.splice(idx, 1);
  saveLocal(state);
  if (userId) {
    try {
      if (isFav) {
        await supabase.from("user_favorites").upsert({ user_id: userId, item_id: itemId });
      } else {
        await supabase.from("user_favorites").delete().eq("user_id", userId).eq("item_id", itemId);
      }
    } catch { /* offline */ }
  }
  return isFav;
}

export function getFavorites(): string[] {
  return loadLocal().favorites;
}

export function isFavorite(itemId: string): boolean {
  return loadLocal().favorites.includes(itemId);
}

export function recordView(itemId: string): void {
  const state = loadLocal();
  state.recentlyViewed = [itemId, ...state.recentlyViewed.filter((x) => x !== itemId)].slice(0, 20);
  saveLocal(state);
}

export function getRecentlyViewed(): string[] {
  return loadLocal().recentlyViewed;
}

export async function syncToSupabase(userId: string): Promise<void> {
  const state = loadLocal();
  try {
    // push progress
    const progressRows = Object.entries(state.progress).map(([itemId, p]) => ({
      user_id: userId,
      item_id: itemId,
      completed: p.completed,
      completed_at: p.completedAt,
      rating: p.rating,
    }));
    if (progressRows.length > 0) {
      await supabase.from("user_library_progress").upsert(progressRows);
    }
    // push favorites
    const favRows = state.favorites.map((itemId) => ({ user_id: userId, item_id: itemId }));
    if (favRows.length > 0) {
      await supabase.from("user_favorites").upsert(favRows);
    }
  } catch { /* offline */ }
}
