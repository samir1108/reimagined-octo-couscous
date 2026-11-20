import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { loadNudgePrefs } from "./useNudgePrefs";

export type NudgeKind = "instant" | "pre_event" | "post_event" | "pattern";

export interface Nudge {
  id: string;
  kind: NudgeKind;
  priority: number;
  fire_at: string;
  expires_at: string | null;
  status: string;
  title: string;
  body: string | null;
  cta_label: string | null;
  cta_action: string | null;
  cta_payload: any;
  attribution: any;
  source: any;
  created_at: string;
}

export function useNudgeQueue() {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);
  const channelNameRef = useRef(`nudge-queue-changes-${Math.random().toString(36).slice(2)}`);
  const userIdRef = useRef<string | null>(null);

  const fetchNudges = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNudges([]);
        setLoading(false);
        return;
      }
      userIdRef.current = user.id;
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("nudge_queue")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .lte("fire_at", nowIso)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order("priority", { ascending: false })
        .order("fire_at", { ascending: false })
        .limit(10);
      if (error) {
        console.warn("[useNudgeQueue] fetch failed:", error.message);
        setNudges([]);
        setLoading(false);
        return;
      }
      const prefs = loadNudgePrefs();
      const filtered = ((data ?? []) as Nudge[]).filter(n => prefs[n.kind] !== false);
      setNudges(filtered);
    } catch (e) {
      console.warn("[useNudgeQueue] fetch exception:", e);
      setNudges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNudges();
    const channel = supabase
      .channel(channelNameRef.current)
      .on("postgres_changes", { event: "*", schema: "public", table: "nudge_queue" }, () => fetchNudges())
      .subscribe();
    const interval = setInterval(fetchNudges, 60_000);
    const onPrefs = () => fetchNudges();
    window.addEventListener("nudge-prefs-changed", onPrefs);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      userIdRef.current = uid;
      if (!uid) {
        setNudges([]);
        setLoading(false);
      } else {
        fetchNudges();
      }
    });

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      window.removeEventListener("nudge-prefs-changed", onPrefs);
      subscription.unsubscribe();
    };
  }, [fetchNudges]);

  const dismiss = useCallback(async (id: string) => {
    try {
      await supabase.from("nudge_queue")
        .update({ status: "dismissed", dismissed_at: new Date().toISOString() })
        .eq("id", id);
    } catch (e) {
      console.warn("[useNudgeQueue] dismiss failed:", e);
    } finally {
      setNudges(prev => prev.filter(n => n.id !== id));
    }
  }, []);

  const act = useCallback(async (id: string) => {
    try {
      await supabase.from("nudge_queue")
        .update({ status: "acted", acted_at: new Date().toISOString() })
        .eq("id", id);
    } catch (e) {
      console.warn("[useNudgeQueue] act failed:", e);
    } finally {
      setNudges(prev => prev.filter(n => n.id !== id));
    }
  }, []);

  const top = nudges[0] ?? null;

  return { nudges, top, loading, dismiss, act, refresh: fetchNudges };
}
