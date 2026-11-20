/**
 * Upcoming/recent meeting nudges from calendar-meeting-watcher.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface MeetingNudge {
  id: string;
  event_id: string;
  title: string | null;
  starts_at: string;
  ends_at: string | null;
  nudge_type: "pre" | "post" | string;
  status: string;
  meta: any;
}

export function useMeetingNudges() {
  const [nudges, setNudges] = useState<MeetingNudge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setLoading(false);
      return;
    }
    const since = new Date(Date.now() - 6 * 3600_000).toISOString();
    const { data } = await supabase
      .from("meeting_nudges" as any)
      .select("*")
      .eq("user_id", u.user.id)
      .gte("starts_at", since)
      .order("starts_at", { ascending: true })
      .limit(20);
    setNudges((data as any) ?? []);
    setLoading(false);
  }, []);

  const dismiss = useCallback(async (id: string) => {
    await supabase
      .from("meeting_nudges" as any)
      .update({ status: "dismissed" })
      .eq("id", id);
    setNudges((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { nudges, loading, dismiss, reload: load };
}
