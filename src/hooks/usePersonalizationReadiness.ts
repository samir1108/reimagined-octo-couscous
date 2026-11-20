/**
 * usePersonalizationReadiness
 * ───────────────────────────
 * Gates personalized surfaces (For You, Off-App, Rituals) behind real
 * user data. We only show these tabs once the user has produced enough
 * signal for personalization to be meaningful:
 *
 *   • at least 1 completed session  → we know how they actually practice
 *   • at least 1 completed mirror   → we know their inner landscape
 *
 * Until then, the tabs render a "Not yet" card explaining what's needed.
 * This protects users from generic recommendations on day 1.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";
import { usePreJourney } from "@/hooks/usePreJourney";

export interface PersonalizationReadiness {
  ready: boolean;
  sessionsCompleted: number;
  mirrorsCompleted: number;
  needsSession: boolean;
  needsMirror: boolean;
}

export function usePersonalizationReadiness(): {
  data: PersonalizationReadiness;
  isLoading: boolean;
} {
  const { user } = useAuthReady();
  const { data: pj } = usePreJourney();

  const sessionsQuery = useQuery({
    queryKey: ["personalization-sessions-count", user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", "completed");
      if (error) return 0;
      return count ?? 0;
    },
  });

  const sessionsCompleted = sessionsQuery.data ?? 0;
  const mirrorsCompleted = pj?.mirrorsCompleted ?? 0;

  const needsSession = sessionsCompleted < 1;
  const needsMirror = mirrorsCompleted < 1;

  return {
    data: {
      ready: !needsSession && !needsMirror,
      sessionsCompleted,
      mirrorsCompleted,
      needsSession,
      needsMirror,
    },
    isLoading: sessionsQuery.isLoading,
  };
}
