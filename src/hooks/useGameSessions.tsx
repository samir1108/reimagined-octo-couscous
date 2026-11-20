import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface GameSession {
  id: string;
  game_id: string;
  phase: "intro" | "play" | "complete";
  completed_at: string | null;
  outcome: string | null;
  created_at: string;
}

interface GameSessionsContextValue {
  sessions: GameSession[];
  activeSession: GameSession | null;
  dailyGame: { game: { id: string; name: string } | null; completed_at: string | null } | null;
  startSession: (gameId: string) => Promise<GameSession | null>;
  getOrCreateDailyGame: () => Promise<{ game: { id: string; name: string } | null } | null>;
  isLoading: boolean;
}

const GameSessionsContext = createContext<GameSessionsContextValue | null>(null);

export function GameSessionsProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [dailyGame, setDailyGame] = useState<{ game: { id: string; name: string } | null; completed_at: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startSession = useCallback(async (gameId: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("game_sessions")
        .insert({
          user_id: user.id,
          game_id: gameId,
          phase: "intro",
        })
        .select()
        .single();

      if (error) throw error;
      
      const newSession: GameSession = {
        ...data,
        phase: data.phase,
        outcome: data.outcome,
        completed_at: data.completed_at,
      };
      
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      return newSession;
    } catch (e) {
      console.error("startSession error:", e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrCreateDailyGame = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { game: null };
      
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_games")
        .select("*, game:games(*)")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (data) return { game: data.game ? { id: data.game.id, name: data.game.name } : null };
      
      // Create a new daily game (pick a random unlocked game)
      const { data: games } = await supabase
        .from("games")
        .select("id, name")
        .eq("is_active", true)
        .limit(1);
      
      if (games?.[0]) {
        const { data: newDaily } = await supabase
          .from("daily_games")
          .insert({ user_id: user.id, date: today, game_id: games[0].id })
          .select("*, game:games(*)")
          .single();
        return { game: newDaily?.game ? { id: newDaily.game.id, name: newDaily.game.name } : null };
      }
      
      return { game: null };
    } catch (e) {
      console.error("getOrCreateDailyGame error:", e);
      return { game: null };
    }
  }, []);

  useEffect(() => {
    const loadSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (data) {
        setSessions(data as GameSession[]);
        const active = data.find(s => s.phase === "play" || s.phase === "intro");
        if (active) setActiveSession(active);
      }
    };
    
    loadSessions();
  }, []);

  return (
    <GameSessionsContext.Provider value={{
      sessions,
      activeSession,
      dailyGame,
      startSession,
      getOrCreateDailyGame,
      isLoading,
    }}>
      {children}
    </GameSessionsContext.Provider>
  );
}

export function useGameSessions(userId?: string) {
  const context = useContext(GameSessionsContext);
  if (!context) {
    return {
      sessions: [],
      activeSession: null,
      dailyGame: null,
      startSession: async () => null,
      getOrCreateDailyGame: async () => ({ game: null }),
      isLoading: false,
    };
  }
  return context;
}

export function useRecentGames(userId?: string, limit: number = 5) {
  return [];
}

export function useGameStats(userId?: string) {
  return { totalPlayed: 0, totalCompleted: 0, currentStreak: 0, longestStreak: 0 };
}