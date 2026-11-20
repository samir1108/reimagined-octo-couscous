/**
 * useUserGoals
 * ────────────
 * Reads & writes the current user's goals (1 priority + up to 2 secondary)
 * to the `user_goals` table. Used by:
 *   • Onboarding (initial save)
 *   • Settings → My Goals (edit anytime)
 *   • Engine helpers (theme/practice weighting)
 */
import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface UserGoals {
  priority_goal: string;
  secondary_goals: string[];
  why_now: string | null;
  set_at: string;
  next_review_at: string;
}

export interface SaveGoalsArgs {
  priorityGoal: string;
  secondaryGoals: string[];
  whyNow?: string | null;
}

const KEY = ["user-goals"];

export function useUserGoals() {
  const qc = useQueryClient();

  const query = useQuery<UserGoals | null>({
    queryKey: KEY,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("user_goals")
        .select("priority_goal, secondary_goals, why_now, set_at, next_review_at")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return (data as UserGoals | null) ?? null;
    },
  });

  const save = useMutation({
    mutationFn: async (args: SaveGoalsArgs) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not authenticated");
      const payload = {
        user_id: auth.user.id,
        priority_goal: args.priorityGoal,
        secondary_goals: args.secondaryGoals,
        why_now: args.whyNow ?? null,
        set_at: new Date().toISOString(),
        next_review_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      const { error } = await supabase
        .from("user_goals")
        .upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const reset = useCallback(() => qc.invalidateQueries({ queryKey: KEY }), [qc]);

  return { ...query, save, reset };
}
