import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Pattern {
  id: string;
  name: string;
  category: string;
  severity: number;
  manifestations: string[];
  dissolution_path: string;
  awareness_markers: string[];
}

export function usePatterns(userId?: string) {
  return useQuery<Pattern[]>({
    queryKey: ["patterns", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data: activeLoops, error } = await supabase
        .from("active_loops")
        .select("loop_id")
        .eq("user_id", userId)
        .eq("is_active", true);
      
      if (error || !activeLoops?.length) return [];
      
      const loopIds = activeLoops.map(l => l.loop_id);
      const { data: loopDefs, error: defError } = await supabase
        .from("loop_definitions")
        .select("*")
        .in("id", loopIds);
      
      if (defError) throw defError;
      return (loopDefs || []) as Pattern[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}