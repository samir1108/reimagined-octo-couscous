import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { EveningReflection } from "@/types/database";

export function useEveningReflections(userId?: string, limit = 30) {
  return useQuery<EveningReflection[]>({
    queryKey: ["evening-reflections", userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("evening_reflections")
        .select("*")
        .eq("user_id", userId)
        .order("reflection_date", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as EveningReflection[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}