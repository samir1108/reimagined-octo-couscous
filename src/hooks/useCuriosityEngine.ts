import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/*
  CURIOUS ENGINE HOOK
  
  Covers items: 79-82
  - Confidence scores per data point
  - 4-step curiosity loop
  - Cooldown enforcement (3 days)
  - Progressive profiling
  - Immediate integration on answer
*/

export interface CuriosityQuestion {
  key: string;
  question: string;
  context: string;
  benefit: string;
  impact: "high" | "medium" | "low";
  uiPlacement: string;
}

export interface CuriosityState {
  status: "has_question" | "cooling_down" | "no_gaps" | "new_question";
  activeQuestion: CuriosityQuestion | null;
  nextQuestionAt?: string;
}

export function useCuriosityEngine() {
  return useQuery<CuriosityState>({
    queryKey: ["curiosity-engine"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { status: "no_gaps", activeQuestion: null } as CuriosityState;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/curiosity-engine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: "check" }),
        }
      );
      if (!resp.ok) return { status: "no_gaps", activeQuestion: null } as CuriosityState;
      return resp.json();
    },
    staleTime: 1000 * 60 * 30, // Check every 30 min
    retry: 1,
  });
}

export function useAnswerCuriosity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, answer }: { key: string; answer: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/curiosity-engine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: "answer", key, answer }),
        }
      );
      if (!resp.ok) throw new Error("Failed to submit answer");
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curiosity-engine"] });
      queryClient.invalidateQueries({ queryKey: ["spiritual-dna"] });
      queryClient.invalidateQueries({ queryKey: ["consciousness-engine"] });
    },
  });
}

export function useSkipCuriosity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/curiosity-engine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: "skip" }),
        }
      );
      if (!resp.ok) throw new Error("Failed to skip");
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curiosity-engine"] });
    },
  });
}
