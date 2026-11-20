import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface HumanMapDim {
  dimension_id: string;
  category: string;
  score: number;
  confidence: number;
  discovered: boolean;
  evidence: string | null;
  last_updated_at: string;
}

export interface MirrorProgress {
  master_mirror_index: number;
  master_mirror_completed: boolean;
  sessions_since_integration: number;
  last_integration_at: string | null;
}

const empty: MirrorProgress = {
  master_mirror_index: 0,
  master_mirror_completed: false,
  sessions_since_integration: 0,
  last_integration_at: null,
};

export function useHumanMapDims() {
  return useQuery({
    queryKey: ["human_map_dims"],
    queryFn: async (): Promise<HumanMapDim[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("human_map_dimensions" as any)
        .select("dimension_id,category,score,confidence,discovered,evidence,last_updated_at")
        .eq("user_id", u.user.id);
      if (error) throw error;
      return (data || []) as any;
    },
  });
}

export function useMirrorProgress() {
  return useQuery({
    queryKey: ["mirror_progress"],
    queryFn: async (): Promise<MirrorProgress> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return empty;
      const { data } = await supabase
        .from("mirror_progress" as any)
        .select("master_mirror_index,master_mirror_completed,sessions_since_integration,last_integration_at")
        .eq("user_id", u.user.id)
        .maybeSingle();
      return ((data as any) ?? empty);
    },
  });
}

export function useSaveMirrorAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      dimension_id: string;
      question_id: string;
      question_type: string;
      answer_value: any;
      source?: "master_mirror" | "in_session";
      session_id?: string | null;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("not signed in");
      const row = {
        user_id: u.user.id,
        dimension_id: input.dimension_id,
        question_id: input.question_id,
        question_type: input.question_type,
        answer_value: input.answer_value,
        source: input.source ?? "master_mirror",
        session_id: input.session_id ?? null,
      };
      const { error } = await supabase.from("mirror_answers" as any).insert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["human_map_dims"] }),
  });
}

export function useAdvanceMirror() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { index: number; completed?: boolean }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { error } = await supabase
        .from("mirror_progress" as any)
        .upsert(
          {
            user_id: u.user.id,
            master_mirror_index: input.index,
            master_mirror_completed: input.completed ?? false,
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mirror_progress"] }),
  });
}

export async function triggerHumanMapIntegration(): Promise<{ updated: number } | null> {
  try {
    const { data, error } = await supabase.functions.invoke("integrate-human-map", {
      body: {},
    });
    if (error) throw error;
    return data as any;
  } catch (e) {
    console.warn("[human-map] integration call failed", e);
    return null;
  }
}
