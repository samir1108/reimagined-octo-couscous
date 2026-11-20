import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { WORKPLACE_LOOPS } from "@/data/workplaceLoops";

export interface LoopEpidemiologyRow {
  loop_id: string;
  loop_name: string;
  user_count: number;
  occurrences: number;
  avg_intensity: number;
}

export interface DepartmentPulseRow {
  department: string;
  user_count: number;
  avg_mood: number | null;
  avg_energy: number | null;
  sufficient: boolean;
}

export interface ConsciousnessHistoryRow {
  snapshot_month: string;
  consciousness_index: number;
  active_members: number;
  avg_band: number;
  burnout_risk_pct: number;
}

export function useLogWorkplaceLoop(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { loopId: string; intensity?: number; teamId?: string; department?: string }) => {
      if (!orgId) throw new Error("No org");
      const loop = WORKPLACE_LOOPS.find((l) => l.id === input.loopId);
      if (!loop) throw new Error("Unknown loop");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("workplace_loop_logs").insert({
        user_id: user.id, org_id: orgId, team_id: input.teamId ?? null,
        department: input.department ?? null, loop_id: loop.id, loop_name: loop.name,
        intensity: input.intensity ?? 3, context: "work",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loop-epidemiology", orgId] }),
  });
}

export function useLoopEpidemiology(orgId: string | undefined, days = 30) {
  return useQuery({
    queryKey: ["loop-epidemiology", orgId, days],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_org_loop_epidemiology", { _org_id: orgId, _days: days });
      if (error) throw error;
      return (data as LoopEpidemiologyRow[]) ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useDepartmentPulse(orgId: string | undefined, days = 7) {
  return useQuery({
    queryKey: ["dept-pulse", orgId, days],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_org_department_pulse", { _org_id: orgId, _days: days });
      if (error) throw error;
      return (data as DepartmentPulseRow[]) ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useConsciousnessHistory(orgId: string | undefined) {
  return useQuery({
    queryKey: ["consciousness-history", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_org_consciousness_history", { _org_id: orgId });
      if (error) throw error;
      return (data as ConsciousnessHistoryRow[]) ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
}
