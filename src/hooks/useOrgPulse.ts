import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type TeamPulseRow = {
  pulse_date: string;
  cohort_size: number;
  avg_mood: number | null;
  avg_energy: number | null;
  sufficient: boolean;
};

export type OrgSnapshot = {
  cohort_size: number;
  avg_mood_7d: number | null;
  avg_energy_7d: number | null;
  pulse_participation_pct: number | null;
  total_active_members: number;
  sufficient: boolean;
};

export type MoodBand = {
  band: "thriving" | "steady" | "strained" | "struggling" | "insufficient";
  member_count: number;
  sufficient: boolean;
};

export function useTeamPulseAggregate(orgId?: string, teamId?: string | null, days = 7) {
  return useQuery({
    queryKey: ["team-pulse", orgId, teamId, days],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_team_pulse_aggregate" as any, {
        _org_id: orgId,
        _team_id: teamId ?? null,
        _days: days,
      });
      if (error) throw error;
      return (data ?? []) as TeamPulseRow[];
    },
  });
}

export function useOrgSnapshot(orgId?: string) {
  return useQuery({
    queryKey: ["org-snapshot", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_org_consciousness_snapshot" as any, {
        _org_id: orgId,
      });
      if (error) throw error;
      return ((data ?? [])[0] ?? null) as OrgSnapshot | null;
    },
  });
}

export function useMoodDistribution(orgId?: string, teamId?: string | null, days = 7) {
  return useQuery({
    queryKey: ["mood-distribution", orgId, teamId, days],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_team_mood_distribution" as any, {
        _org_id: orgId,
        _team_id: teamId ?? null,
        _days: days,
      });
      if (error) throw error;
      return (data ?? []) as MoodBand[];
    },
  });
}
