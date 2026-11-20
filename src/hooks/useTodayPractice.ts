import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface TodayPracticeItem {
  practice: string;
  level: number;
  allocation: "fixed" | "ai_personalized" | "user_choice";
  title: string;
  why: string;
  duration: number;
  emoji: string;
  teaching?: string | null;
  instruction?: string | null;
  off_app_cue?: string | null;
  loop_tag?: string | null;
  effectiveness?: number;
}

export interface TodayPracticePack {
  id: string;
  user_id: string;
  pack_date: string;
  theme_id: string | null;
  arc_id: string | null;
  practices: TodayPracticeItem[];
  formula: string;
  band_level: number | null;
  arc_phase: string | null;
  bypassing_check: { isBypassing: boolean; warnings: string[] } | null;
  cross_pollination: any;
  rationale: string | null;
  completed_practices: string[];
  is_completed: boolean;
  completed_at: string | null;
}

export interface BandAnchor {
  id: string;
  band_level: number;
  practice_type: string;
  practice_level: number;
  title: string;
  description: string;
  duration_minutes: number;
  rationale: string | null;
  curriculum: Array<{ week: number; focus: string; practice?: string }>;
  toolkit: Array<{ practice: string; label: string; duration: number }>;
  current_week: number;
  total_sessions: number;
  is_active: boolean;
}

const today = () => new Date().toISOString().split("T")[0];

export function useTodayPracticePack() {
  return useQuery<TodayPracticePack | null>({
    queryKey: ["today-practice-pack", today()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("today_practice_packs")
        .select("*")
        .eq("user_id", user.id)
        .eq("pack_date", today())
        .maybeSingle();
      return data as unknown as TodayPracticePack | null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export interface ArrivalState {
  body_state: "tight" | "neutral" | "open" | "heavy";
  mind_state: "racing" | "foggy" | "calm" | "scattered";
  intention: "ground" | "clarity" | "release" | "energy" | "ai_decide";
}

export function useComposeTodayPractice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (opts?: boolean | { force?: boolean; arrival?: ArrivalState }) => {
      const force = typeof opts === "boolean" ? opts : !!opts?.force;
      const arrival = typeof opts === "object" ? opts?.arrival : undefined;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compose-today-practice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ force, arrival }),
        },
      );
      if (!resp.ok) throw new Error("Failed to compose practice");
      return resp.json() as Promise<{ pack: TodayPracticePack; cached: boolean }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["today-practice-pack"] });
    },
  });
}

export function useLogArrivalState() {
  return useMutation({
    mutationFn: async (arrival: ArrivalState & { time_slot?: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase.from as any)("arrival_states").insert({
        user_id: user.id,
        pack_date: today(),
        time_slot: arrival.time_slot ?? "morning",
        body_state: arrival.body_state,
        mind_state: arrival.mind_state,
        intention: arrival.intention,
        notes: arrival.notes ?? null,
      });
      if (error) throw error;
    },
  });
}

export function useMarkPracticeComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ packId, practice, quality, loopTag, crossFrom }: {
      packId: string; practice: string; quality?: number; loopTag?: string | null; crossFrom?: string | null;
    }) => {
      const { data: pack } = await supabase
        .from("today_practice_packs")
        .select("completed_practices, practices")
        .eq("id", packId)
        .single();
      const completed = Array.isArray(pack?.completed_practices)
        ? (pack.completed_practices as string[])
        : [];
      if (!completed.includes(practice)) completed.push(practice);
      const totalCount = Array.isArray(pack?.practices) ? (pack.practices as any[]).length : 0;
      const isAll = completed.length >= totalCount;
      const { error } = await supabase
        .from("today_practice_packs")
        .update({
          completed_practices: completed,
          is_completed: isAll,
          completed_at: isAll ? new Date().toISOString() : null,
        })
        .eq("id", packId);
      if (error) throw error;

      // Record effectiveness — closes the learning loop
      if (practice && practice !== "user_choice") {
        try {
          await (supabase.rpc as any)("record_practice_outcome", {
            p_practice: practice,
            p_loop_tag: loopTag ?? null,
            p_quality: quality ?? 0.7,
            p_loop_resolved: false,
            p_cross_from: crossFrom ?? null,
          });
        } catch (e) {
          console.warn("record_practice_outcome failed", e);
        }
      }
      // Karma: award for completing a practice (throttled server-side to 5 min).
      try {
        await (supabase.rpc as any)("award_karma_event", {
          p_source: "practice_complete",
          p_base: 6,
          p_weight: quality ?? 1.0,
          p_metadata: { practice, loop_tag: loopTag ?? null },
        });
      } catch (e) {
        // silent
      }
      return { completed, isAll };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["today-practice-pack"] });
    },
  });
}

export function useBandAnchor() {
  return useQuery<BandAnchor | null>({
    queryKey: ["band-practice-anchor"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("band_practice_anchors")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as unknown as BandAnchor | null;
    },
    staleTime: 1000 * 60 * 10,
  });
}
