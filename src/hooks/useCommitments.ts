import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface GuideCommitment {
  id: string;
  user_id: string;
  session_id: string | null;
  mode: string | null;
  master_id: string | null;
  summary: string;
  source_message: string | null;
  check_back_at: string;
  status: "open" | "done" | "skipped" | "dismissed";
  outcome_note: string | null;
  chain_parent_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Commitments due to ping (open + check_back_at <= now). */
export function useDueCommitments() {
  return useQuery({
    queryKey: ["guide_commitments", "due"],
    queryFn: async (): Promise<GuideCommitment[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("guide_commitments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open")
        .lte("check_back_at", new Date().toISOString())
        .order("check_back_at", { ascending: true })
        .limit(5);
      if (error) throw error;
      return (data || []) as GuideCommitment[];
    },
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

/** Recent commitments (for personalization context in the Guide). */
export function useRecentCommitments(limit = 20) {
  return useQuery({
    queryKey: ["guide_commitments", "recent", limit],
    queryFn: async (): Promise<GuideCommitment[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("guide_commitments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as GuideCommitment[];
    },
    staleTime: 60_000,
  });
}

export function useCommitmentActions() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["guide_commitments"] });
  };

  const create = useMutation({
    mutationFn: async (args: {
      assistantMessage: string;
      userReply?: string;
      mode?: string | null;
      masterId?: string | null;
      sessionId?: string | null;
      chainParentId?: string | null;
      force?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke("extract-commitment", {
        body: {
          assistantMessage: args.assistantMessage,
          userReply: args.userReply,
          mode: args.mode ?? undefined,
          masterId: args.masterId ?? undefined,
          sessionId: args.sessionId ?? undefined,
          chainParentId: args.chainParentId ?? undefined,
          force: args.force ?? true,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const setStatus = useMutation({
    mutationFn: async (args: {
      id: string;
      status: GuideCommitment["status"];
      outcome_note?: string;
      snooze_hours?: number;
    }) => {
      const patch: Record<string, unknown> = { status: args.status };
      if (args.outcome_note !== undefined) patch.outcome_note = args.outcome_note;
      if (args.snooze_hours && args.status === "open") {
        patch.check_back_at = new Date(
          Date.now() + args.snooze_hours * 3600 * 1000,
        ).toISOString();
      }
      const { error } = await supabase
        .from("guide_commitments")
        .update(patch)
        .eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const snooze = (id: string, hours = 24) =>
    setStatus.mutate({ id, status: "open", snooze_hours: hours });

  return { create, setStatus, snooze };
}
