import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type LegacyEntry = {
  id: string;
  entry_type: string;
  recipient_name: string | null;
  recipient_relationship: string | null;
  recipient_email: string | null;
  title: string;
  content: string;
  release_condition: string;
  release_date: string | null;
  is_released: boolean;
  created_at: string;
};

export type Guardian = {
  id: string;
  guardian_name: string;
  guardian_email: string;
  relationship: string | null;
  trust_phrase: string | null;
  notify_on: string;
  active: boolean;
};

export const ENTRY_TYPES = [
  { key: "letter", label: "Letter to someone" },
  { key: "wisdom", label: "Wisdom for the future" },
  { key: "memory", label: "A memory to keep" },
  { key: "blessing", label: "Blessing" },
  { key: "apology", label: "Apology" },
  { key: "gratitude", label: "Gratitude" },
];

export const RELEASE_CONDITIONS = [
  { key: "on_request", label: "Only when I ask" },
  { key: "scheduled", label: "On a specific date" },
  { key: "posthumous", label: "After I'm gone (via guardian)" },
];

export function useLegacyEntries() {
  return useQuery({
    queryKey: ["legacy-entries"],
    queryFn: async (): Promise<LegacyEntry[]> => {
      const { data, error } = await supabase
        .from("legacy_vault")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LegacyEntry[];
    },
  });
}

export function useGuardians() {
  return useQuery({
    queryKey: ["legacy-guardians"],
    queryFn: async (): Promise<Guardian[]> => {
      const { data, error } = await supabase
        .from("legacy_guardians")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Guardian[];
    },
  });
}

export function useUpsertLegacy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: Partial<LegacyEntry> & { id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("not_authenticated");
      const payload: any = {
        user_id: user.id,
        entry_type: e.entry_type ?? "letter",
        recipient_name: e.recipient_name ?? null,
        recipient_relationship: e.recipient_relationship ?? null,
        recipient_email: e.recipient_email ?? null,
        title: e.title ?? "",
        content: e.content ?? "",
        release_condition: e.release_condition ?? "on_request",
        release_date: e.release_date ?? null,
      };
      if (e.id) {
        const { error } = await supabase.from("legacy_vault").update(payload).eq("id", e.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("legacy_vault").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["legacy-entries"] }),
  });
}

export function useUpsertGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (g: Partial<Guardian> & { id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("not_authenticated");
      const payload: any = {
        user_id: user.id,
        guardian_name: g.guardian_name ?? "",
        guardian_email: g.guardian_email ?? "",
        relationship: g.relationship ?? null,
        trust_phrase: g.trust_phrase ?? null,
        notify_on: g.notify_on ?? "manual",
        active: g.active ?? true,
      };
      if (g.id) {
        const { error } = await supabase.from("legacy_guardians").update(payload).eq("id", g.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("legacy_guardians").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["legacy-guardians"] }),
  });
}

export function useDeleteGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("legacy_guardians")
        .update({ active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["legacy-guardians"] }),
  });
}
