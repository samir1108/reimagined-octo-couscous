"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { conscious, consciousFromError } from "@/lib/consciousToast";
import { useCredits } from "@/hooks/useCredits";
import { useThemeOfDay, useRefreshTheme, useRegenerateTheme } from "@/hooks/useThemeOfDay";
import { useThemeDeepenToast } from "@/hooks/useThemeDeepenToast";
import { themeCache, isOnline } from "@/lib/indexedDBCache";

interface EngineProfile {
  overall_band?: number;
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

interface UseHomeThemeOptions {
  profile: EngineProfile | null;
}

export function useHomeTheme({ profile }: UseHomeThemeOptions) {
  const { data, isError, isLoading, refetch } = useThemeOfDay();
  const refreshTheme = useRefreshTheme();
  const regenerateTheme = useRegenerateTheme();

  useThemeDeepenToast(); // Living Theme Engine - shows toast when theme deepens/closes

  const { data: credits } = useCredits();

  // Show toast once if credits are low - conscious voice
  const creditToastShown = useRef(false);
  useEffect(() => {
    if (creditToastShown.current) return;
    if (credits === undefined) return;
    if (credits === null || credits.balance_paise < 50) {
      creditToastShown.current = true;
      conscious("noCredits");
    }
  }, [credits]);

  const theme = data?.theme;
  const sessions = data?.sessions || [];

  // Offline-first: cache theme for offline access
  const [cachedTheme, setCachedTheme] = useState<ThemeData | null>(null);
  const [isOffline, setIsOffline] = useState(!isOnline());

  useEffect(() => {
    const unsubscribe = onOnlineChange(setIsOffline);
    return unsubscribe;
  }, []);

  // Cache theme when loaded successfully
  useEffect(() => {
    if (theme && !isLoading && !isError) {
      const dateKey = new Date().toISOString().split("T")[0];
      themeCache.set(dateKey, theme);
      setCachedTheme(theme);
    }
  }, [theme, isLoading, isError]);

  // Load cached theme on mount if offline
  useEffect(() => {
    if (isOffline) {
      const dateKey = new Date().toISOString().split("T")[0];
      themeCache.get(dateKey).then((cached) => {
        if (cached) setCachedTheme(cached);
      });
    }
  }, [isOffline]);

  const [nextThreadPending, setNextThreadPending] = useState(false);

  const beginNextThread = useCallback(async () => {
    if (nextThreadPending) return;
    setNextThreadPending(true);
    try {
      await regenerateTheme();
      refreshTheme();
    } catch (e: unknown) {
      consciousFromError(e, "somethingSlipped", { band: profile?.overall_band as number | undefined });
    } finally {
      setNextThreadPending(false);
    }
  }, [nextThreadPending, regenerateTheme, refreshTheme, profile?.overall_band]);

  // Use cached theme when offline
  const effectiveTheme = isOffline ? cachedTheme : theme;

  return {
    data,
    isError,
    isLoading,
    refetch,
    theme: effectiveTheme,
    sessions,
    refreshTheme,
    regenerateTheme,
    nextThreadPending,
    beginNextThread,
    isOffline,
    cachedTheme,
  };
}

function onOnlineChange(callback: (online: boolean) => void): () => void {
  const handler = () => callback(navigator.onLine);
  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);
  return () => {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
  };
}