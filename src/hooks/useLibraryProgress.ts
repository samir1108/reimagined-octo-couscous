import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ProgressStatus = "not_started" | "in_progress" | "completed" | "favorited" | "skipped";

export interface LibraryProgress {
  id: string;
  user_id: string;
  item_id: string;
  status: ProgressStatus;
  started_at?: string;
  completed_at?: string;
  progress_percent: number;
  time_spent_seconds: number;
  rating?: number;
  notes?: string;
  last_accessed_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

async function getUserProgress(userId: string): Promise<Record<string, LibraryProgress>> {
  const { data } = await supabase
    .from("user_library_progress")
    .select("*")
    .eq("user_id", userId);
  
  const map: Record<string, LibraryProgress> = {};
  (data || []).forEach((p) => {
    map[p.item_id] = p;
  });
  return map;
}

async function getUserFavorites(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("user_favorites")
    .select("item_id")
    .eq("user_id", userId);
  return (data || []).map((d) => d.item_id);
}

async function upsertProgress(progress: Partial<LibraryProgress> & { user_id: string; item_id: string }): Promise<LibraryProgress> {
  const { data, error } = await supabase
    .from("user_library_progress")
    .upsert(progress, { onConflict: "user_id,item_id" })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function toggleFavorite(userId: string, itemId: string, isFavorited: boolean): Promise<void> {
  if (isFavorited) {
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("item_id", itemId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_favorites")
      .insert({ user_id: userId, item_id: itemId });
    if (error) throw error;
  }
}

export function useLibraryProgress(userId?: string) {
  const queryClient = useQueryClient();
  const [localProgress, setLocalProgress] = useState<Record<string, LibraryProgress>>({});
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);

  const { data: serverProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["library-progress", userId],
    queryFn: () => getUserProgress(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: serverFavorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ["library-favorites", userId],
    queryFn: () => getUserFavorites(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (serverProgress) {
      setLocalProgress(serverProgress);
    }
  }, [serverProgress]);

  useEffect(() => {
    if (serverFavorites) {
      setLocalFavorites(serverFavorites);
    }
  }, [serverFavorites]);

  const updateProgressMutation = useMutation({
    mutationFn: upsertProgress,
    onSuccess: (data) => {
      setLocalProgress((prev) => ({ ...prev, [data.item_id]: data }));
      queryClient.invalidateQueries({ queryKey: ["library-progress", userId] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ itemId, isFavorited }: { itemId: string; isFavorited: boolean }) => 
      toggleFavorite(userId!, itemId, isFavorited),
    onSuccess: (_data, { itemId, isFavorited }) => {
      setLocalFavorites((prev) => 
        isFavorited ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
      queryClient.invalidateQueries({ queryKey: ["library-favorites", userId] });
    },
  });

  const getProgress = useCallback((itemId: string): LibraryProgress | undefined => {
    return localProgress[itemId];
  }, [localProgress]);

  const isFavorited = useCallback((itemId: string): boolean => {
    return localFavorites.includes(itemId);
  }, [localFavorites]);

  const setProgress = useCallback(async (
    itemId: string,
    status: ProgressStatus,
    options?: { progressPercent?: number; timeSpentSeconds?: number; rating?: number }
  ) => {
    if (!userId) return;
    
    const existing = localProgress[itemId];
    const now = new Date().toISOString();
    
    const progress: Partial<LibraryProgress> & { user_id: string; item_id: string } = {
      user_id: userId,
      item_id: itemId,
      status,
      progress_percent: options?.progressPercent ?? existing?.progress_percent ?? (status === "completed" ? 100 : status === "in_progress" ? 10 : 0),
      time_spent_seconds: options?.timeSpentSeconds ?? existing?.time_spent_seconds ?? 0,
      rating: options?.rating ?? existing?.rating,
      last_accessed_at: now,
    };

    if (status === "in_progress" && !existing?.started_at) {
      progress.started_at = now;
    }
    if (status === "completed" && !existing?.completed_at) {
      progress.completed_at = now;
    }

    await updateProgressMutation.mutateAsync(progress);
  }, [userId, localProgress, updateProgressMutation]);

  const toggleFavoriteStatus = useCallback(async (itemId: string) => {
    if (!userId) return;
    const favorited = localFavorites.includes(itemId);
    await toggleFavoriteMutation.mutateAsync({ itemId, isFavorited: favorited });
  }, [userId, localFavorites, toggleFavoriteMutation]);

  const startItem = useCallback((itemId: string) => setProgress(itemId, "in_progress"), [setProgress]);
  const completeItem = useCallback((itemId: string, rating?: number) => setProgress(itemId, "completed", { rating }), [setProgress]);
  const skipItem = useCallback((itemId: string) => setProgress(itemId, "skipped"), [setProgress]);

  return {
    progress: localProgress,
    favorites: localFavorites,
    isLoading: progressLoading || favoritesLoading,
    getProgress,
    isFavorited,
    setProgress,
    toggleFavorite: toggleFavoriteStatus,
    startItem,
    completeItem,
    skipItem,
  };
}