import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types/database";

export interface TimelineEvent {
  date: string;
  type: "session" | "discovery" | "milestone" | "reflection";
  title: string;
  description: string;
  milestone: boolean;
}

export function usePersonalTimeline(userId?: string) {
  return useQuery<TimelineEvent[]>({
    queryKey: ["personal-timeline", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const [{ data: sessions }, { data: journals }, { data: reflections }] = await Promise.all([
        supabase.from("sessions").select("*").eq("user_id", userId).eq("status", "completed").order("started_at", { ascending: true }),
        supabase.from("journal_entries").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("evening_reflections").select("*").eq("user_id", userId).order("reflection_date", { ascending: true }),
      ]);
      
      const sessionEvents = ((sessions || []) as Session[]).map((s, i) => ({
        date: s.started_at,
        type: "session" as const,
        title: `Session ${i + 1}: ${s.time_slot}`,
        description: s.summary || "A sitting with awareness",
        milestone: i === 0 || i === 6 || i === 20 || i === 59,
      }));
      
      const journalEvents = ((journals || []) as any[]).map(j => ({
        date: j.created_at,
        type: "reflection" as const,
        title: j.title || "Journal Entry",
        description: j.content?.slice(0, 100) + "..." || "A reflection",
        milestone: false,
      }));
      
      const reflectionEvents = ((reflections || []) as any[]).map(r => ({
        date: r.reflection_date,
        type: "reflection" as const,
        title: "Evening Reflection",
        description: r.lessons || r.highlights || "A day's reflection",
        milestone: false,
      }));
      
      const allEvents = [...sessionEvents, ...journalEvents, ...reflectionEvents]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return allEvents;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 15,
  });
}