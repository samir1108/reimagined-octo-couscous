import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type KarmaSource =
  | "practice_complete"
  | "observation_task"
  | "daily_task"
  | "ai_chat"
  | "session_complete"
  | "path_begin"
  | "journal_entry"
  | "gratitude_logged"
  | "presence_reflection"
  | "evening_reflection"
  | "guru_session"
  | "witness_session"
  | "breakthrough_detected"
  | "mood_pulse"
  | "dream_logged"
  | "sankalpa_set";

export interface KarmaState {
  points: number;
  lifetime_points: number;
  current_tier: string;
  breakthroughs: Record<string, { at: string; points: number }>;
  next_threshold: number | null;
  to_next: number | null;
}

const THRESHOLDS = [300, 1000, 2500, 5000];

function computeNext(points: number) {
  const next = THRESHOLDS.find((t) => t > points) ?? null;
  return {
    next_threshold: next,
    to_next: next ? next - points : null,
  };
}

function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { status, code, message } = error as {
    status?: number;
    code?: string;
    message?: string;
  };
  if (status === 401) return true;
  if (code === "PGRST301") return true;
  return /jwt|token|authenticat/i.test(String(message ?? ""));
}

export function useKarma() {
  return useQuery<KarmaState>({
    queryKey: ["user-karma"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { points: 0, lifetime_points: 0, current_tier: "seeker", breakthroughs: {}, next_threshold: 300, to_next: 300 };
      }
      const { data, error } = await supabase
        .from("user_karma" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error || !data) {
        return { points: 0, lifetime_points: 0, current_tier: "seeker", breakthroughs: {}, next_threshold: 300, to_next: 300 };
      }
      const row: any = data || { points: 0, lifetime_points: 0, current_tier: "seeker", breakthroughs: {} };
      const points = Number(row.points || 0);
      return {
        points,
        lifetime_points: Number(row.lifetime_points || 0),
        current_tier: row.current_tier || "seeker",
        breakthroughs: row.breakthroughs || {},
        ...computeNext(points),
      };
    },
    staleTime: 30 * 1000,
  });
}

// Default base points per source — weighted system
const BASE_POINTS: Record<KarmaSource, number> = {
  practice_complete: 15,
  observation_task: 20,
  daily_task: 10,
  ai_chat: 5,
  session_complete: 25,
  path_begin: 8,
  journal_entry: 12,
  gratitude_logged: 10,
  presence_reflection: 8,
  evening_reflection: 18,
  guru_session: 25,
  witness_session: 20,
  breakthrough_detected: 50,
  mood_pulse: 4,
  dream_logged: 12,
  sankalpa_set: 8,
};

export function useAwardKarma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      source: KarmaSource;
      base?: number;
      weight?: number; // e.g. 1.0 default; quality * difficulty
      metadata?: Record<string, any>;
      silent?: boolean;
    }) => {
      const base = params.base ?? BASE_POINTS[params.source] ?? 5;
      const { data, error } = await (supabase.rpc as any)("award_karma", {
        p_source: params.source,
        p_base: base,
        p_weight: params.weight ?? 1.0,
        p_metadata: params.metadata ?? {},
      });
      if (error) throw error;
      return { ...(data as any), silent: params.silent };
    },
    onSuccess: (result: any) => {
      qc.invalidateQueries({ queryKey: ["user-karma"] });
      if (result?.new_breakthrough) {
        const isMajor = result.new_breakthrough === "major_1000";
        qc.invalidateQueries({ queryKey: ["credits"] });
        toast.success(
          isMajor ? "🌟 Major Breakthrough!" : "✨ Minor Breakthrough!",
          {
            description: isMajor
              ? `1000 karma reached. +20 bonus credits. A master is composing your insight letter.`
              : `300 karma reached. +5 bonus credits unlocked.`,
            duration: 6000,
          }
        );
      } else if (!result?.silent && result?.awarded) {
        toast(`+${result.awarded} karma`, { duration: 1600 });
      }
    },
    onError: (err: any) => {
      console.warn("award_karma failed", err?.message);
    },
  });
}

/**
 * Lightweight, throttled karma events (app_open, ai_chat, mood_pulse, ...).
 * Calls the `award_karma_event` RPC which has anti-spam windows built in.
 * Silent by default — no toasts; pure gamification background pulse.
 */
export type KarmaEvent =
  | "app_open"
  | "ai_chat"
  | "mood_pulse"
  | "journal_open"
  | "journal_entry"
  | "temple_enter"
  | "practice_start"
  | "practice_complete"
  | "session_complete"
  | "guru_session"
  | "witness_session"
  | "observation_task"
  | "daily_task"
  | "evening_reflection"
  | "gratitude_logged"
  | "sankalpa_set"
  | "dream_logged";

export function useAwardKarmaEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      event: KarmaEvent;
      points?: number;
      metadata?: Record<string, any>;
    }) => {
      const callRpc = () =>
        (supabase.rpc as any)("award_karma_event", {
          p_source: params.event,
          p_base: params.points ?? 3,
          p_weight: 1.0,
          p_metadata: params.metadata ?? {},
        });

      let { data, error } = await callRpc();

      // A stored session can expire between page load and this call.
      // Refresh once, then retry instead of dropping the event.
      if (error && isAuthError(error)) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) {
          ({ data, error } = await callRpc());
        }
      }

      if (error) {
        // Throttling / unknown event / no session → soft fail
        return { awarded: 0, throttled: true };
      }
      return data as any;
    },
    onSuccess: (result: any) => {
      if (result?.awarded > 0) {
        qc.invalidateQueries({ queryKey: ["user-karma"] });
      }
    },
    onError: (err: any) => {
      console.warn("award_karma_event failed", err?.message);
    },
  });
}
