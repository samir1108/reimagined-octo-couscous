import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ThreeBrain {
  head_score: number;
  heart_score: number;
  gut_score: number;
  dominant: string;
  imbalance_score: number;
  computed_for_week?: string;
  evidence?: Record<string, string[]>;
}

export function useThreeBrain() {
  return useQuery<ThreeBrain | null>({
    queryKey: ["three-brain"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("three_brain_inferences" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("computed_for_week", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data as any) ?? null;
    },
    staleTime: 1000 * 60 * 60 * 6,
  });
}

export function useRefreshThreeBrain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("infer-three-brain");
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["three-brain"] }),
  });
}
