import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";

export type DailyRitual = {
  id: string;
  ritual_type: "morning_whisper" | "evening_witness" | "sunday_stillness";
  ritual_date: string;
  content: string;
  metadata: any;
  user_engaged: boolean;
};

export type AnniversaryMoment = {
  id: string;
  moment_type: string;
  title: string | null;
  user_words: string | null;
  occurred_at: string;
  years_ago: number;
  months_ago: number;
  importance: number;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isSundayLocal(d: Date = new Date()) {
  return d.getDay() === 0;
}

/** Fetch today's rituals (morning, evening, or sunday_stillness). Auto-generates if missing. */
export function useDailyRitual() {
  const { user } = useAuthReady();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["daily-ritual", user?.id, todayISO()],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const date = todayISO();
      const { data: existing } = await supabase
        .from("daily_rituals")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ritual_date", date);

      const rows = (existing ?? []) as DailyRitual[];

      // If sunday and we have any sunday_stillness row → done
      if (isSundayLocal()) {
        const sunday = rows.find((r) => r.ritual_type === "sunday_stillness");
        if (sunday) return { rows: [sunday], isSunday: true };
      }

      // If no morning whisper for today, fire generation (don't block)
      const haveMorning = rows.some((r) => r.ritual_type === "morning_whisper");
      const haveSunday = rows.some((r) => r.ritual_type === "sunday_stillness");
      if (!haveMorning && !haveSunday) {
        // fire and forget
        supabase.functions
          .invoke("generate-daily-ritual", { body: { gate: isSundayLocal() ? "auto" : "morning", date } })
          .then(() => qc.invalidateQueries({ queryKey: ["daily-ritual", user!.id, date] }))
          .catch(() => {});
      }

      return { rows, isSunday: isSundayLocal() };
    },
  });

  const markSeen = useMutation({
    mutationFn: async (ritualId: string) => {
      await supabase
        .from("daily_rituals")
        .update({ user_engaged: true, user_engaged_at: new Date().toISOString() })
        .eq("id", ritualId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-ritual", user?.id] });
    },
  });

  return { ...query, markSeen };
}

/** Fetch anniversary moments for today (Remember when…) */
export function useAnniversaryMoments() {
  const { user } = useAuthReady();
  return useQuery({
    queryKey: ["anniversary-moments", user?.id, todayISO()],
    enabled: !!user?.id,
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<AnniversaryMoment[]> => {
      const { data, error } = await supabase.rpc("find_anniversary_moments", {
        p_user_id: user!.id,
        p_date: todayISO(),
      });
      if (error) {
        console.warn("[anniversary] rpc failed", error.message);
        return [];
      }
      return (data ?? []) as AnniversaryMoment[];
    },
  });
}
