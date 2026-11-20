import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ObservationTask } from "@/types/database";

export function useObservationTasks(userId?: string, date?: string) {
  const targetDate = date || new Date().toISOString().split("T")[0];
  
  return useQuery<ObservationTask[]>({
    queryKey: ["observation-tasks", userId, targetDate],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("observation_tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("task_date", targetDate)
        .order("chain_order", { ascending: true });
      if (error) throw error;
      return (data || []) as ObservationTask[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}