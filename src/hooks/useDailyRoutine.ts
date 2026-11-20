/**
 * useDailyRoutine — user's day timetable (wake → sleep, slot activities)
 * Used as context for AI-led practice sessions so guidance is personalized.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DailyRoutine {
  wake_time?: string | null;
  sleep_time?: string | null;
  morning_activities?: string | null;
  midday_activities?: string | null;
  evening_activities?: string | null;
  night_activities?: string | null;
  weekend_pattern?: string | null;
  notes?: string | null;
}

export function useDailyRoutine() {
  return useQuery<DailyRoutine | null>({
    queryKey: ["daily-routine"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("user_daily_routine")
        .select("wake_time, sleep_time, morning_activities, midday_activities, evening_activities, night_activities, weekend_pattern, notes")
        .eq("user_id", user.id)
        .maybeSingle();
      return (data as DailyRoutine) ?? null;
    },
  });
}

export function useSaveDailyRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (routine: DailyRoutine) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("not authenticated");
      const { error } = await supabase
        .from("user_daily_routine")
        .upsert({ user_id: user.id, ...routine }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily-routine"] }),
  });
}

/** Compact one-line context string for AI prompts. */
export function routineToPromptContext(r: DailyRoutine | null | undefined): string {
  if (!r) return "";
  const bits: string[] = [];
  if (r.wake_time) bits.push(`wakes ${r.wake_time}`);
  if (r.sleep_time) bits.push(`sleeps ${r.sleep_time}`);
  if (r.morning_activities) bits.push(`morning: ${r.morning_activities}`);
  if (r.midday_activities) bits.push(`midday: ${r.midday_activities}`);
  if (r.evening_activities) bits.push(`evening: ${r.evening_activities}`);
  if (r.night_activities) bits.push(`night: ${r.night_activities}`);
  if (r.weekend_pattern) bits.push(`weekends: ${r.weekend_pattern}`);
  if (r.notes) bits.push(`notes: ${r.notes}`);
  return bits.length ? `Seeker's daily rhythm — ${bits.join("; ")}.` : "";
}
