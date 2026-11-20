import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getUnifiedGame, UNIFIED_GAMES } from "@/lib/games/unifiedRegistry";
import { getUnifiedGame } from "@/lib/games/unifiedRegistry";

export type GameSessionPhase = "intro" | "play" | "reflect" | "completed" | "abandoned";

export interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  phase: GameSessionPhase;
  started_at: string;
  completed_at?: string;
  paused_at?: string;
  duration_ms: number;
  signals: Record<string, unknown>;
  reflection?: string;
  outcome: "completed" | "abandoned" | "interrupted";
  karma_awarded: number;
  created_at: string;
}

export interface DailyGameState {
  user_id: string;
  game_id: string;
  assigned_at: string;
  completed_at?: string;
  streak: number;
}

async function getGameSessions(userId: string): Promise<GameSession[]> {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as GameSession[]) || [];
}

async function getActiveSession(userId: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("user_id", userId)
    .in("phase", ["intro", "play", "reflect"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as GameSession | null;
}

async function getDailyGame(userId: string): Promise<DailyGameState | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("daily_game")
    .select("*")
    .eq("user_id", userId)
    .eq("assigned_at", today)
    .maybeSingle();
  if (error) throw error;
  return data as DailyGameState | null;
}

async function upsertDailyGame(userId: string, gameId: string): Promise<DailyGameState> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("daily_game")
    .upsert({
      user_id: userId,
      game_id: gameId,
      assigned_at: today,
      streak: 0,
    }, { onConflict: "user_id,assigned_at" })
    .select()
    .single();
  if (error) throw error;
  return data as DailyGameState;
}

async function completeDailyGame(userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  await supabase
    .from("daily_game")
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("assigned_at", today);
}

async function incrementDailyStreak(userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  await supabase.rpc("increment_daily_streak", { p_user_id: userId, p_date: today });
}

export function useGameSessions(userId?: string) {
  const queryClient = useQueryClient();
  
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["game-sessions", userId],
    queryFn: () => getGameSessions(userId!),
    enabled: !!userId,
    staleTime: 30000,
  });

  const { data: activeSession } = useQuery({
    queryKey: ["active-game-session", userId],
    queryFn: () => getActiveSession(userId!),
    enabled: !!userId,
    staleTime: 10000,
  });

const dailyGame = useMemo(() => {
    if (!userId) return null;
    const today = new Date().toISOString().split("T")[0];
    const hash = today.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const unlockedGames = UNIFIED_GAMES.filter(g => g.available && g.unlockLevel <= 3);
    if (unlockedGames.length === 0) return null;
    const gameIndex = hash % unlockedGames.length;
    const game = unlockedGames[gameIndex];
    return {
      user_id: userId,
      game_id: game.id,
      assigned_at: today,
      completed_at: undefined,
      streak: 0,
      game,
    };
  }, [userId]);

  const startMutation = useMutation({
    mutationFn: async ({ gameId }: { gameId: string }) => {
      const { data, error } = await supabase
        .from("game_sessions")
        .insert({
          user_id: userId,
          game_id: gameId,
          phase: "intro",
          started_at: new Date().toISOString(),
          duration_ms: 0,
          signals: {},
          outcome: "interrupted",
          karma_awarded: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data as GameSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-sessions", userId] });
      queryClient.invalidateQueries({ queryKey: ["active-game-session", userId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<GameSession> & { id: string }) => {
      const { id, ...rest } = updates;
      const { data, error } = await supabase
        .from("game_sessions")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as GameSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-sessions", userId] });
      queryClient.invalidateQueries({ queryKey: ["active-game-session", userId] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ sessionId, signals, reflection, durationMs }: { 
      sessionId: string; 
      signals: Record<string, unknown>;
      reflection?: string;
      durationMs: number;
    }) => {
      const { data, error } = await supabase
        .from("game_sessions")
        .update({
          phase: "completed",
          completed_at: new Date().toISOString(),
          duration_ms: durationMs,
          signals,
          reflection,
          outcome: "completed",
        })
        .eq("id", sessionId)
        .select()
        .single();
      if (error) throw error;
      return data as GameSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-sessions", userId] });
      queryClient.invalidateQueries({ queryKey: ["active-game-session", userId] });
    },
  });

  const abandonMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from("game_sessions")
        .update({
          phase: "abandoned",
          completed_at: new Date().toISOString(),
          outcome: "abandoned",
        })
        .eq("id", sessionId)
        .select()
        .single();
      if (error) throw error;
      return data as GameSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-sessions", userId] });
      queryClient.invalidateQueries({ queryKey: ["active-game-session", userId] });
    },
  });

  const startSession = useCallback(async (gameId: string) => {
    if (!userId) return null;
    return startMutation.mutateAsync({ gameId });
  }, [userId, startMutation]);

  const resumeSession = useCallback(async (sessionId: string) => {
    return updateMutation.mutateAsync({ id: sessionId, phase: "play" });
  }, [updateMutation]);

  const completeSession = useCallback(async (
    sessionId: string, 
    signals: Record<string, unknown>, 
    reflection: string | undefined, 
    durationMs: number
  ) => {
    return completeMutation.mutateAsync({ sessionId, signals, reflection, durationMs });
  }, [completeMutation]);

  const abandonSession = useCallback(async (sessionId: string) => {
    return abandonMutation.mutateAsync(sessionId);
  }, [abandonMutation]);

  const getOrCreateDailyGame = useCallback(async () => {
    if (!userId || !dailyGame) return null;
    if (dailyGame.completed_at) return dailyGame;
    const game = getUnifiedGame(dailyGame.game_id);
    return { ...dailyGame, game };
  }, [userId, dailyGame]);

  return {
    sessions,
    activeSession,
    dailyGame,
    isLoading,
    startSession,
    resumeSession,
    completeSession,
    abandonSession,
    getOrCreateDailyGame,
    isStarting: startMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCompleting: completeMutation.isPending,
  };
}

export function useRecentGames(userId?: string, limit: number = 5) {
  const { sessions } = useGameSessions(userId);
  return sessions
    .filter(s => s.outcome === "completed")
    .slice(0, limit)
    .map(s => ({
      ...s,
      game: getUnifiedGame(s.game_id),
    }));
}

export function useGameStats(userId?: string) {
  const { sessions } = useGameSessions(userId);
  const completed = sessions.filter(s => s.outcome === "completed");
  const totalSessions = completed.length;
  const totalMinutes = Math.round(completed.reduce((sum, s) => sum + s.duration_ms, 0) / 60000);
  const uniqueGames = new Set(completed.map(s => s.game_id)).size;
  const favoriteFaculty = getFavoriteFaculty(completed);
  
  return { totalSessions, totalMinutes, uniqueGames, favoriteFaculty };
}

function getFavoriteFaculty(sessions: GameSession[]): string | null {
  const facultyCounts: Record<string, number> = {};
  sessions.forEach(s => {
    const game = getUnifiedGame(s.game_id);
    game?.faculties.forEach(f => {
      facultyCounts[f] = (facultyCounts[f] || 0) + 1;
    });
  });
  const top = Object.entries(facultyCounts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}