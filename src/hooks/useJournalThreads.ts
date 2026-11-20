import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface JournalThread {
  id: string;
  user_id: string;
  title: string;
  intention: string | null;
  status: "active" | "closed" | string;
  entry_count: number;
  last_entry_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useJournalThreads(status: "active" | "all" = "active") {
  return useQuery<JournalThread[]>({
    queryKey: ["journal-threads", status],
    queryFn: async () => {
      let q = supabase.from("journal_threads").select("*").order("last_entry_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
      if (status === "active") q = q.eq("status", "active");
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as JournalThread[];
    },
  });
}

export function useCreateJournalThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { title: string; intention?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("journal_threads")
        .insert({ user_id: user.id, title: params.title.trim(), intention: params.intention?.trim() || null })
        .select()
        .single();
      if (error) throw error;
      return data as JournalThread;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal-threads"] }),
  });
}

export function useCloseJournalThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journal_threads").update({ status: "closed" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal-threads"] }),
  });
}
