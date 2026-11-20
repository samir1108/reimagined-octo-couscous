/**
 * usePersonalRhythm
 * ──────────────────
 * - Fetches today's kundli-aware practice schedule.
 * - Auto-generates if missing.
 * - Polls every 30s and fires browser notifications for due, un-notified entries.
 * - Exposes markComplete + nextEntry for UI cards.
 *
 * Notifications: requestPermission lazily (idempotent) and degrade silently.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { translateNotificationTexts } from "@/lib/notifyTranslation";

export interface RhythmEntry {
  id: string;
  scheduled_at: string;
  title: string;
  description: string | null;
  category: string;
  location: "in_app" | "off_app";
  source: string | null;
  duration_min: number | null;
  notify: boolean;
  completed_at: string | null;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

async function generate(): Promise<void> {
  await supabase.functions.invoke("generate-personal-rhythm", { body: { replace: false } });
}

async function fetchToday(userId: string): Promise<RhythmEntry[]> {
  const { data } = await supabase
    .from("personal_practice_schedule")
    .select("*")
    .eq("user_id", userId)
    .eq("day_date", todayKey())
    .order("scheduled_at", { ascending: true });
  return (data as unknown as RhythmEntry[]) || [];
}

async function ensurePermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try { return (await Notification.requestPermission()) === "granted"; } catch { return false; }
}

export function usePersonalRhythm(userId: string | undefined) {
  const [entries, setEntries] = useState<RhythmEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFiredRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    let rows = await fetchToday(userId);
    if (!rows.length) {
      try { await generate(); rows = await fetchToday(userId); } catch {}
    }
    setEntries(rows);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Poll due entries every 30s & fire notifications
  useEffect(() => {
    if (!userId || !entries.length) return;
    let alive = true;

    const tick = async () => {
      const now = Date.now();
      const due = entries.filter(
        (e) => !e.completed_at && new Date(e.scheduled_at).getTime() <= now &&
               !lastFiredRef.current.has(e.id),
      );
      if (!due.length) return;

      const granted = await ensurePermission();
      for (const e of due) {
        lastFiredRef.current.add(e.id);
        if (granted) {
          try {
            const [title, body] = await translateNotificationTexts([
              e.title,
              (e.description || "").slice(0, 140),
            ]);
            new Notification(title, {
              body,
              tag: `rhythm-${e.id}`,
              icon: "/favicon.ico",
            });
          } catch {}
        }
        // mark notified
        supabase.from("personal_practice_schedule")
          .update({ notify: false })
          .eq("id", e.id).then(() => {});
      }
      if (alive) {
        setEntries((prev) =>
          prev.map((x) => (lastFiredRef.current.has(x.id) ? { ...x, notify: false } : x)),
        );
      }
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => { alive = false; window.clearInterval(id); };
  }, [userId, entries]);

  const markComplete = useCallback(async (id: string) => {
    await supabase.from("personal_practice_schedule")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", id);
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, completed_at: new Date().toISOString() } : e)));
  }, []);

  const regenerate = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    await supabase.functions.invoke("generate-personal-rhythm", { body: { replace: true } });
    setEntries(await fetchToday(userId));
    setLoading(false);
  }, [userId]);

  const nextEntry = useMemo(() => {
    const now = Date.now();
    return entries.find((e) => !e.completed_at && new Date(e.scheduled_at).getTime() >= now - 30 * 60_000);
  }, [entries]);

  return { entries, nextEntry, loading, refresh, regenerate, markComplete, ensurePermission };
}
