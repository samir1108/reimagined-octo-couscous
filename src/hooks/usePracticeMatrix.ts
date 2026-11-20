import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/*
  PRACTICE MATRIX HOOK
  
  Covers items: 1, 10-12, 17-31, 65-67, 71-74
  - 12+ practice levels
  - 3-layer enforcement (Core/Path/Specialty)
  - 30/50/20 formula
  - Quality-based progression
  - Cross-pollination
  - Bypassing detection
  - Anti-guilt system
  - Adaptive difficulty
  - T-shaped mastery
*/

export interface PracticeLevels {
  observation: number;
  self_inquiry: number;
  breath: number;
  witnessing: number;
  body: number;
  bhakti: number;
  karma: number;
  jnana: number;
  raja: number;
  kriya: number;
  tantra: number;
  neuroscience: number;
  emotional_healing: number;
  loop_dissolution: number;
  relationship: number;
  work_career: number;
  finance: number;
  health: number;
}

export interface PracticeTask {
  practice: string;
  score: number;
  level: number;
  allocation: "fixed" | "ai_personalized" | "user_choice";
  isCore?: boolean;
  isPath?: boolean;
  isSpecialty?: boolean;
}

export interface BypassingCheck {
  isBypassing: boolean;
  warnings: string[];
  recommendation: string;
}

export interface LevelEvaluation {
  practice: string;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  levelUpReason: string;
  avgQuality: number;
  sessionsAtLevel: number;
  difficultyAdjustment: "harder" | "gentler" | "stabilize" | "none";
  speedType: string;
  antiGuiltMessage: string;
  encouragement: string;
}

export interface CrossPollinationSuggestion {
  source: string;
  target: string;
  reason: string;
  plateauAvgQuality: number;
  sessionsInPlateau: number;
  userEffectivenessScore: number;
  type: "plateau" | "stagnant";
}

export interface SpecialtyStatus {
  specialty: string;
  description: string;
  isActive: boolean;
  justActivated: boolean;
  conditionsMet: string[];
  conditionsRequired: string[];
  progress: number;
}

// ─── Fetch user practice levels (row-per-practice → aggregated object)
export function usePracticeLevels() {
  return useQuery({
    queryKey: ["practice-levels"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("user_practice_levels")
        .select("*")
        .eq("user_id", user.id);
      if (!data || data.length === 0) return null;
      // Aggregate rows into flat levels object
       const levels: PracticeLevels = {
         observation: 0, self_inquiry: 0, breath: 0, witnessing: 0, body: 0,
         bhakti: 0, karma: 0, jnana: 0, raja: 0, kriya: 0, tantra: 0, neuroscience: 0,
         emotional_healing: 0, loop_dissolution: 0, relationship: 0, work_career: 0, finance: 0, health: 0,
       };
      const sessions_at_level: Record<string, any> = {};
      for (const row of data) {
        const pt = (row as any).practice_type as string;
        if (pt && pt in levels) {
          (levels as any)[pt] = (row as any).current_level || 0;
          sessions_at_level[pt] = { level: (row as any).current_level || 0, sessions: (row as any).sessions_at_level || 0 };
        }
      }
      return { ...levels, sessions_at_level } as PracticeLevels & { sessions_at_level: Record<string, any> };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Get next practice recommendation
export function useGetNextPractice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ timeSlot, userChoice }: { timeSlot?: string; userChoice?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-next-practice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ timeSlot, userChoice }),
        }
      );
      if (!resp.ok) throw new Error("Failed to get next practice");
      return resp.json() as Promise<{
        tasks: PracticeTask[];
        allScored: PracticeTask[];
        crossPollinationSuggestion: CrossPollinationSuggestion | null;
        bypassingCheck: BypassingCheck;
        formula: string;
      }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-levels"] });
    },
  });
}

// ─── Evaluate practice level after session
export function useEvaluatePractice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      practice,
      qualityScore,
      sessionDuration,
    }: {
      practice: string;
      qualityScore: number;
      sessionDuration?: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-practice-level`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ practice, qualityScore, sessionDuration }),
        }
      );
      if (!resp.ok) throw new Error("Failed to evaluate practice");
      return resp.json() as Promise<LevelEvaluation>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-levels"] });
      queryClient.invalidateQueries({ queryKey: ["consciousness-engine"] });
      queryClient.invalidateQueries({ queryKey: ["speed-profile"] });
    },
  });
}

// ─── Detect cross-pollination opportunities
export function useDetectCrossPollination() {
  return useMutation({
    mutationFn: async (practice?: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect?action=cross-pollination`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ practice }),
        }
      );
      if (!resp.ok) throw new Error("Failed to detect cross-pollination");
      return resp.json() as Promise<{
        suggestions: CrossPollinationSuggestion[];
        hasPlateau: boolean;
      }>;
    },
  });
}

// ─── Check bypassing
export function useDetectBypassing() {
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect?action=bypassing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (!resp.ok) throw new Error("Failed to detect bypassing");
      return resp.json();
    },
  });
}

// ─── Specialty activations
export function useSpecialtyActivations() {
  return useQuery({
    queryKey: ["specialty-activations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("specialty_activations")
        .select("*")
        .eq("user_id", user.id);
      return (data || []) as unknown as SpecialtyStatus[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ─── Check & activate specialties
export function useActivateSpecialties() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-specialty`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (!resp.ok) throw new Error("Failed to check specialties");
      return resp.json() as Promise<{
        specialties: SpecialtyStatus[];
        newlyActivated: string[];
        totalActive: number;
      }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialty-activations"] });
    },
  });
}

// ─── Speed profile
export function useSpeedProfile() {
  return useQuery({
    queryKey: ["speed-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("user_speed_profile")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 15,
  });
}

// ─── Assess starting levels (from onboarding)
export function useAssessStartingLevels() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assessmentData: { answers: Record<string, any>; band?: number }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assess-starting-levels`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(assessmentData),
        }
      );
      if (!resp.ok) throw new Error("Failed to assess starting levels");
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-levels"] });
      queryClient.invalidateQueries({ queryKey: ["speed-profile"] });
      queryClient.invalidateQueries({ queryKey: ["spiritual-dna"] });
      queryClient.invalidateQueries({ queryKey: ["specialty-activations"] });
    },
  });
}
