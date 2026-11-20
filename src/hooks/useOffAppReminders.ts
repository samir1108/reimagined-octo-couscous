/**
 * useOffAppReminders
 * ──────────────────
 * Per-ritual opt-in for smart push reminders. Storage in localStorage so
 * we don't need a DB migration. Schedules a setTimeout while the app is
 * open; on next load, re-schedules. Notification.permission is requested
 * on first opt-in.
 *
 * Why localStorage: zero risk to existing flows, instant, per-device which
 * matches user intent (a phone reminder is device-bound). Can be migrated
 * to DB later without breaking the API of this hook.
 */
import { useCallback, useEffect, useState } from "react";
import { OFF_APP_RITUALS, type OffAppRitual, type OffAppRitualId } from "@/data/offAppRituals";
import { supabase } from "@/lib/supabase";
import { translateNotificationTexts } from "@/lib/notifyTranslation";

const STORAGE_KEY = "off_app_reminder_prefs_v1";
const FIRED_KEY = "off_app_reminder_fired_v1";
const ANCHORS_KEY = "off_app_anchors_v1";

type Anchors = Partial<Record<NonNullable<OffAppRitual["anchor"]>, string>>;

interface Prefs {
  /** ritualId → "HH:MM" override, or true for default time */
  enabled: Partial<Record<OffAppRitualId, true | string>>;
}

interface FiredMap {
  /** ritualId → "YYYY-MM-DD" of last fire */
  [k: string]: string;
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: {} };
    return JSON.parse(raw);
  } catch {
    return { enabled: {} };
  }
}

function savePrefs(p: Prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

function loadFired(): FiredMap {
  try { return JSON.parse(localStorage.getItem(FIRED_KEY) || "{}"); } catch { return {}; }
}

function saveFired(m: FiredMap) {
  try { localStorage.setItem(FIRED_KEY, JSON.stringify(m)); } catch {}
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nextFireDelayMs(timeStr: string): number {
  const [hh, mm] = timeStr.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hh || 0, mm || 0, 0, 0);
  if (target.getTime() <= now.getTime()) return -1; // already passed today
  return target.getTime() - now.getTime();
}

async function fireNotification(ritual: OffAppRitual) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const [title, body] = await translateNotificationTexts([
    `${ritual.emoji}  ${ritual.title}`,
    ritual.cue,
  ]);
  try {
    const n = new Notification(title, {
      body,
      icon: "/pwa-icon-192.png",
      badge: "/pwa-icon-192.png",
      tag: `offapp-${ritual.id}-${todayKey()}`,
      silent: false,
    });
    n.onclick = () => {
      window.focus();
      window.location.assign(`/app/practice?ritual=${ritual.id}`);
      n.close();
    };
  } catch {}
}

function loadAnchors(): Anchors {
  try { return JSON.parse(localStorage.getItem(ANCHORS_KEY) || "{}"); } catch { return {}; }
}
function saveAnchors(a: Anchors) {
  try { localStorage.setItem(ANCHORS_KEY, JSON.stringify(a)); } catch {}
}

function applyAnchorOffset(time: string, offsetMin: number): string {
  if (!time) return time;
  const [hh, mm] = time.split(":").map(Number);
  const total = (hh || 0) * 60 + (mm || 0) + offsetMin;
  const norm = ((total % 1440) + 1440) % 1440;
  const H = String(Math.floor(norm / 60)).padStart(2, "0");
  const M = String(norm % 60).padStart(2, "0");
  return `${H}:${M}`;
}

export function useOffAppReminders() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [anchors, setAnchors] = useState<Anchors>(() => loadAnchors());
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );

  // Pull onboarding daily_anchors so default reminder times match the user's
  // actual rhythm (wake/brush/bath/work/sleep) instead of generic clock times.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("spiritual_dna_assessments")
          .select("assessment_conversation")
          .eq("user_id", user.id)
          .maybeSingle();
        const conv = (data?.assessment_conversation || {}) as any;
        const da = (conv.daily_anchors || {}) as Anchors;
        if (cancelled) return;
        if (da && Object.keys(da).length) {
          setAnchors(da);
          saveAnchors(da);
        }
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const isEnabled = useCallback(
    (id: OffAppRitualId) => Boolean(prefs.enabled[id]),
    [prefs],
  );

  const getTime = useCallback(
    (id: OffAppRitualId): string => {
      const v = prefs.enabled[id];
      if (typeof v === "string") return v;
      const ritual = OFF_APP_RITUALS.find((r) => r.id === id);
      if (!ritual) return "08:00";
      if (ritual.anchor && anchors[ritual.anchor]) {
        return applyAnchorOffset(anchors[ritual.anchor]!, ritual.anchorOffsetMin || 0);
      }
      return ritual.defaultTime;
    },
    [prefs, anchors],
  );

  const requestPermissionIfNeeded = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied" as NotificationPermission;
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    const p = await Notification.requestPermission();
    setPermission(p);
    return p;
  }, []);

  const toggle = useCallback(
    async (id: OffAppRitualId) => {
      const next = { ...prefs, enabled: { ...prefs.enabled } };
      if (next.enabled[id]) {
        delete next.enabled[id];
      } else {
        await requestPermissionIfNeeded();
        next.enabled[id] = true;
      }
      setPrefs(next);
      savePrefs(next);
    },
    [prefs, requestPermissionIfNeeded],
  );

  const setTime = useCallback(
    (id: OffAppRitualId, time: string) => {
      const next = { ...prefs, enabled: { ...prefs.enabled, [id]: time } };
      setPrefs(next);
      savePrefs(next);
    },
    [prefs],
  );

  // Schedule timeouts for enabled rituals while app is open
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fired = loadFired();
    const timers: number[] = [];

    for (const ritual of OFF_APP_RITUALS) {
      if (!prefs.enabled[ritual.id]) continue;
      const time = getTime(ritual.id);
      const delay = nextFireDelayMs(time);
      if (delay < 0) continue;
      if (fired[ritual.id] === todayKey()) continue;

      const t = window.setTimeout(() => {
        void fireNotification(ritual);
        const f = loadFired();
        f[ritual.id] = todayKey();
        saveFired(f);
      }, delay);
      timers.push(t);
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [prefs, getTime]);

  return {
    isEnabled,
    getTime,
    toggle,
    setTime,
    permission,
    requestPermissionIfNeeded,
  };
}
