import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types/database";

export function useSessionHistory(userId?: string) {
  return useQuery<Session[]>({
    queryKey: ["session-history", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("started_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as Session[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}