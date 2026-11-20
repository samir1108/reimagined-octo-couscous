import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { localDateKey } from "@/lib/localDate";

/*
  SPIRITUAL DNA & LIFETIME HOOKS
  
  Covers items: 2, 68-70, 76-78, 83
  - user_spiritual_dna (anchor/growth path, brain type, life stage, etc.)
  - Life-stage detection engine
  - App relationship depth tracker (7 phases)
  - Lifetime user data structure
  - 10-phase lifetime spiral
  - 4 user archetype handling
  - Lifetime retention architecture
*/

export type LifeStage = "student" | "professional" | "parent" | "retiree" | "elder" | "unknown";
export type AppRelationship = "tool" | "teacher" | "companion" | "friend" | "mirror" | "self" | "silence";
export type LifetimePhase = 
  | "awakening" | "exploration" | "deepening" | "integration"
  | "mastery" | "teaching" | "dissolution" | "freedom"
  | "compassion" | "beyond";

export interface SpiritualDNA {
  user_id: string;
  anchor_path: string;
  growth_path: string;
  brain_dominance: string;
  circadian_type: string;
  tradition_affinity: string | null;
  life_stage: LifeStage;
  life_stage_details: Record<string, any>;
  app_relationship_phase: AppRelationship;
  app_relationship_day: number;
  identity_band: number;
  identity_band_name: string;
  available_slots: string[];
  primary_slot: string;
  skipped_slots: string[];
  flexible_mode: boolean;
  weekday_duration: number;
  weekend_duration: number;
  lifetime_breakthroughs: any[];
  guru_resonance: Record<string, number>;
  total_gurus_encountered: number;
  lifetime_phase: LifetimePhase;
  lifetime_phase_day: number;
}

// Phase → Guru mapping (items 68-69)
export const PHASE_GURU_MAP: Record<LifetimePhase, string[]> = {
  awakening:    ["arya"],
  exploration:  ["krishna", "buddha"],
  deepening:    ["ramana", "patanjali"],
  integration:  ["rumi", "kabir"],
  mastery:      ["shankaracharya", "aurobindo"],
  teaching:     ["vivekananda", "guru_nanak"],
  dissolution:  ["nisargadatta", "ramakrishna"],
  freedom:      ["dogen", "lao_tzu"],
  compassion:   ["vivekananda", "guru_nanak"],
  beyond:       [],
};

// Life-stage → content adaptation (item 76)
export const LIFE_STAGE_FOCUS: Record<LifeStage, {
  domains: string[];
  practices: string[];
  guruTone: string;
  contentFocus: string;
}> = {
  student: {
    domains: ["career", "focus", "anxiety"],
    practices: ["observation", "breath", "body"],
    guruTone: "encouraging, relatable, youthful",
    contentFocus: "Exam stress, peer pressure, career confusion, purpose finding",
  },
  professional: {
    domains: ["work", "relationship", "stress"],
    practices: ["karma", "observation", "witnessing"],
    guruTone: "practical, direct, efficient",
    contentFocus: "Office politics, work-life balance, relationship consciousness",
  },
  parent: {
    domains: ["patience", "identity", "surrender"],
    practices: ["bhakti", "body", "breath"],
    guruTone: "gentle, compassionate, patient",
    contentFocus: "Presence with children, patience, sleep management, surrender",
  },
  retiree: {
    domains: ["purpose", "acceptance", "grief"],
    practices: ["self_inquiry", "jnana", "witnessing"],
    guruTone: "wise, reflective, deep",
    contentFocus: "Life review, mortality awareness, legacy, simplification",
  },
  elder: {
    domains: ["wisdom", "gratitude", "peace"],
    practices: ["witnessing", "bhakti", "self_inquiry"],
    guruTone: "silent, loving, present",
    contentFocus: "Wisdom transmission, preparing for death, gratitude, just being",
  },
  unknown: {
    domains: ["general"],
    practices: ["observation", "breath", "witnessing"],
    guruTone: "warm, curious, adaptive",
    contentFocus: "General consciousness development",
  },
};

// App relationship phases (item 77)
export const APP_RELATIONSHIP_PHASES: Record<AppRelationship, {
  label: string;
  description: string;
  dayThreshold: number;
  uiDepth: "minimal" | "moderate" | "deep" | "silent";
}> = {
  tool:       { label: "Tool",      description: "I use the app for meditation",        dayThreshold: 0,    uiDepth: "minimal" },
  teacher:    { label: "Teacher",   description: "The app teaches me",                  dayThreshold: 365,  uiDepth: "moderate" },
  companion:  { label: "Companion", description: "The app is with me",                  dayThreshold: 730,  uiDepth: "moderate" },
  friend:     { label: "Friend",    description: "The app knows me",                    dayThreshold: 1825, uiDepth: "deep" },
  mirror:     { label: "Mirror",    description: "The app shows me what I cannot see",  dayThreshold: 3650, uiDepth: "deep" },
  self:       { label: "Self",      description: "The app and I are not separate",      dayThreshold: 7300, uiDepth: "deep" },
  silence:    { label: "Silence",   description: "No need for the app. But I still open it.", dayThreshold: 10950, uiDepth: "silent" },
};

// ─── Fetch spiritual DNA
export function useSpiritualDNA() {
  return useQuery<SpiritualDNA | null>({
    queryKey: ["spiritual-dna"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_spiritual_dna")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.warn("[spiritual-dna] query failed:", error.message);
        return null;
      }
      return data as SpiritualDNA | null;
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ─── Update spiritual DNA
export function useUpdateSpiritualDNA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<SpiritualDNA>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_spiritual_dna")
        .upsert({ user_id: user.id, ...updates }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spiritual-dna"] });
    },
  });
}

// ─── Life domain scores
export function useLifeDomainScores() {
  return useQuery({
    queryKey: ["life-domain-scores"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("life_domain_scores")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        console.warn("[life-domain-scores] query failed:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: 1000 * 60 * 15,
  });
}

// ─── Daily gates
export function useDailyGates(date?: string) {
  const dateKey = date || localDateKey();
  return useQuery({
    queryKey: ["daily-gates", dateKey],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("user_daily_gates")
        .select("*")
        .eq("user_id", user.id)
        .eq("gate_date", dateKey)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Complete a gate
export function useCompleteGate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gate, quality }: { gate: "morning" | "midday" | "evening" | "night"; quality?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = localDateKey();
      const updates: Record<string, any> = {
        [`${gate}_done`]: true,
        [`${gate}_at`]: new Date().toISOString(),
      };
      if (quality !== undefined) updates[`${gate}_quality`] = quality;
      if (gate === "night") {
        const hour = new Date().getHours();
        updates.night_adapted = hour >= 21 || hour < 5;
      }

      const { data, error } = await supabase
        .from("user_daily_gates")
        .upsert({
          user_id: user.id,
          gate_date: today,
          ...updates,
        }, { onConflict: "user_id,gate_date" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-gates"] });
    },
  });
}

// ─── Detect life stage from context (item 76)
export function detectLifeStageFromContext(
  age?: number,
  journeyDay?: number,
  stressors?: string[],
  context?: string,
): LifeStage {
  if (age) {
    if (age < 23) return "student";
    if (age > 75) return "elder";
    if (age > 60) return "retiree";
  }
  
  if (stressors?.some(s => s.includes("child") || s.includes("parent") || s.includes("baby"))) return "parent";
  if (stressors?.some(s => s.includes("retire") || s.includes("pension"))) return "retiree";
  if (stressors?.some(s => s.includes("exam") || s.includes("study") || s.includes("college"))) return "student";
  
  if (context) {
    const c = context.toLowerCase();
    if (c.includes("student")) return "student";
    if (c.includes("parent")) return "parent";
    if (c.includes("retire")) return "retiree";
  }
  
  return "professional"; // default
}

// ─── Calculate app relationship phase (item 77)
export function calculateAppRelationship(journeyDay: number): AppRelationship {
  if (journeyDay >= 10950) return "silence";
  if (journeyDay >= 7300) return "self";
  if (journeyDay >= 3650) return "mirror";
  if (journeyDay >= 1825) return "friend";
  if (journeyDay >= 730) return "companion";
  if (journeyDay >= 365) return "teacher";
  return "tool";
}

// ─── Get lifetime phase (item 68)
export function getLifetimePhase(journeyDay: number): LifetimePhase {
  if (journeyDay <= 30) return "awakening";
  if (journeyDay <= 120) return "exploration";
  if (journeyDay <= 365) return "deepening";
  if (journeyDay <= 730) return "integration";
  if (journeyDay <= 1460) return "mastery";
  if (journeyDay <= 2920) return "teaching";
  if (journeyDay <= 4380) return "dissolution";
  if (journeyDay <= 5840) return "freedom";
  if (journeyDay <= 8000) return "compassion";
  return "beyond";
}

// ─── Get recommended guru for current phase (item 69)
export function getPhaseGurus(phase: LifetimePhase): string[] {
  return PHASE_GURU_MAP[phase] || ["arya"];
}
