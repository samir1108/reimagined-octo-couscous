import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type LifeEvent = {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  is_recurring: boolean;
  emotional_weight: number;
  related_people: string[] | null;
};

export type LifeEventAnniversary = LifeEvent & { years_ago: number };

export const EVENT_TYPES = [
  { key: "birthday", label: "Birthday" },
  { key: "anniversary", label: "Anniversary" },
  { key: "loss", label: "Loss · Death" },
  { key: "milestone", label: "Milestone" },
  { key: "wedding", label: "Wedding" },
  { key: "first_meeting", label: "First meeting" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "move", label: "Move · New home" },
  { key: "other", label: "Other" },
];

export function useLifeEvents() {
  return useQuery({
    queryKey: ["life-events"],
    queryFn: async (): Promise<LifeEvent[]> => {
      const { data, error } = await supabase
        .from("life_events")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LifeEvent[];
    },
  });
}

export function useTodayAnniversaries() {
  return useQuery({
    queryKey: ["life-event-anniversaries", new Date().toISOString().slice(0, 10)],
    queryFn: async (): Promise<LifeEventAnniversary[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.rpc("find_life_event_anniversaries", {
        _user_id: user.id,
      });
      if (error) {
        console.warn("[anniversaries] failed", error);
        return [];
      }
      return (data ?? []) as LifeEventAnniversary[];
    },
    staleTime: 1000 * 60 * 60 * 6,
  });
}

export function useUpsertLifeEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: Partial<LifeEvent> & { id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("not_authenticated");
      const payload: any = {
        user_id: user.id,
        event_type: e.event_type ?? "other",
        title: e.title ?? "",
        description: e.description ?? null,
        event_date: e.event_date,
        is_recurring: e.is_recurring ?? true,
        emotional_weight: e.emotional_weight ?? 5,
        related_people: e.related_people ?? null,
      };
      if (e.id) {
        const { error } = await supabase.from("life_events").update(payload).eq("id", e.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("life_events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life-events"] });
      qc.invalidateQueries({ queryKey: ["life-event-anniversaries"] });
    },
  });
}

export function useDeleteLifeEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("life_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life-events"] });
      qc.invalidateQueries({ queryKey: ["life-event-anniversaries"] });
    },
  });
}
