import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type CompanionState = {
  mood: {
    mood: string;
    intensity: number;
    language_register: string;
    push_or_hold: "push" | "hold";
  } | null;
  phase: "stranger" | "acquaintance" | "friend" | "confidant" | "long_companion" | "soul_companion";
  days_known: number;
  trust_score: number;
  unread_letter: {
    id: string;
    milestone_key: string;
    milestone_label: string;
    letter_content: string;
    reached_at: string;
  } | null;
  new_milestone: { id: string; milestone_label: string } | null;
  joke: { id: string; phrase: string; joke_key: string; origin_context: string | null } | null;
};

export function useCompanionState() {
  return useQuery({
    queryKey: ["companion-state"],
    queryFn: async (): Promise<CompanionState | null> => {
      const { data, error } = await supabase.functions.invoke("compute-companion-state");
      if (error) {
        console.warn("[companion-state] failed", error);
        return null;
      }
      return data as CompanionState;
    },
    staleTime: 1000 * 60 * 30, // 30 min
    retry: 1,
  });
}

export function useMarkLetterRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (letterId: string) => {
      const { error } = await supabase
        .from("trust_milestones")
        .update({ user_read: true, user_read_at: new Date().toISOString() })
        .eq("id", letterId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companion-state"] }),
  });
}
