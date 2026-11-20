import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface LifeDomain {
  domain: string;
  score: number;
  updated_at: string;
}

export function useLifeDomains(userId?: string) {
  return useQuery<LifeDomain[]>({
    queryKey: ["life-domains", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("life_domain_scores")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return (data || []) as LifeDomain[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}