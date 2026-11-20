import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface EvolutionData {
  sessionsCompleted: number;
  personalDiscoveries: number;
  consistency: string;
  practicesExplored: number;
  reflectionHistory: number;
  journeyMilestones: Array<{ day: number; label: string }>;
  dimensionChanges: any[];
}

export function useEvolution(userId?: string) {
  return useQuery<EvolutionData>({
    queryKey: ["evolution", userId],
    queryFn: async () => {
      if (!userId) {
        return {
          sessionsCompleted: 0,
          personalDiscoveries: 0,
          consistency: "Building",
          practicesExplored: 0,
          reflectionHistory: 0,
          journeyMilestones: [],
          dimensionChanges: [],
        };
      }
      
      const [{ data: sessions }, { data: profile }, { data: journals }] = await Promise.all([
        supabase.from("sessions").select("*").eq("user_id", userId).eq("status", "completed"),
        supabase.from("user_consciousness_profile").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("journal_entries").select("id").eq("user_id", userId),
      ]);
      
      const completedSessions = (sessions || []) as any[];
      const userProfile = profile as any;
      const journeyDay = userProfile?.journey_day || 1;
      
      return {
        sessionsCompleted: completedSessions.length,
        personalDiscoveries: completedSessions.filter(s => s.summary).length,
        consistency: userProfile?.streak_current > 0 ? "Active" : "Building",
        practicesExplored: new Set(completedSessions.map(s => s.type).filter(Boolean)).size,
        reflectionHistory: (journals || []).length,
        journeyMilestones: [
          { day: 1, label: "First Session" },
          { day: 7, label: "First Week" },
          { day: 21, label: "Three Weeks" },
          { day: 60, label: "Two Months" },
          { day: 100, label: "100 Days" },
        ].filter(m => m.day <= journeyDay),
        dimensionChanges: [],
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 15,
  });
}