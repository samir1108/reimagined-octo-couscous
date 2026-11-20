/**
 * DailyRhythmSettings
 * ────────────────────
 * All time-of-day questions live here, not in onboarding.
 * Saving updates profiles + lifestyle + daily_anchors so reminders, slot UI,
 * morning ritual, mid-day reset, evening close-out and Brahma muhurta all
 * recalibrate against the user's real clock.
 */
import { useEffect, useState, useCallback } from "react";
import { Sunrise, Moon, Briefcase, Utensils, LogOut, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Times {
  wake_time: string;
  sleep_time: string;
  work_start?: string;
  lunch_time?: string;
  work_end?: string;
}

const FIELDS: Array<{
  key: keyof Times;
  label: string;
  hint: string;
  Icon: typeof Sunrise;
  fallback: string;
  required?: boolean;
}> = [
  { key: "wake_time",  label: "Wake time",      hint: "Morning ritual lands here.",     Icon: Sunrise,   fallback: "06:30", required: true },
  { key: "work_start", label: "Work begins",    hint: "Centering pause before this.",   Icon: Briefcase, fallback: "09:30" },
  { key: "lunch_time", label: "Lunch",          hint: "Mid-day reset anchors here.",    Icon: Utensils,  fallback: "13:00" },
  { key: "work_end",   label: "Work winds down", hint: "Clean break to mark transition.", Icon: LogOut,    fallback: "18:30" },
  { key: "sleep_time", label: "Sleep time",     hint: "Evening close-out drifts here.", Icon: Moon,      fallback: "22:30", required: true },
];

export default function DailyRhythmSettings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [times, setTimes] = useState<Times>({ wake_time: "06:30", sleep_time: "22:30" });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("wake_time, sleep_time, lifestyle")
        .eq("user_id", user.id)
        .maybeSingle();
      const ls = (data?.lifestyle as any) || {};
      setTimes({
        wake_time: (data?.wake_time as string) || ls.wake_time || "06:30",
        sleep_time: (data?.sleep_time as string) || ls.sleep_time || "22:30",
        work_start: ls.work_start,
        lunch_time: ls.lunch_time,
        work_end: ls.work_end,
      });
    })();
  }, []);

  const setField = (k: keyof Times, v: string) =>
    setTimes((p) => ({ ...p, [k]: v }));

  const handleSave = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    try {
      // Read existing lifestyle so we don't blow other keys away.
      const { data } = await supabase
        .from("profiles")
        .select("lifestyle, display_name")
        .eq("user_id", userId)
        .maybeSingle();
      const lifestyle = (data?.lifestyle as Record<string, unknown>) || {};

      await supabase.from("profiles").upsert(
        {
          user_id: userId,
          display_name: data?.display_name || "Friend",
          wake_time: times.wake_time,
          sleep_time: times.sleep_time,
          lifestyle: {
            ...lifestyle,
            wake_time: times.wake_time,
            sleep_time: times.sleep_time,
            work_start: times.work_start,
            lunch_time: times.lunch_time,
            work_end: times.work_end,
          } as any,
        } as any,
        { onConflict: "user_id" },
      );

      // Mirror anchors into spiritual_dna_assessments so reminder scheduler picks them up.
      const { data: existing } = await supabase
        .from("spiritual_dna_assessments")
        .select("assessment_conversation")
        .eq("user_id", userId)
        .maybeSingle();
      const conv = (existing?.assessment_conversation as Record<string, unknown>) || {};
      const anchors: Record<string, string> = {
        wake: times.wake_time,
        sleep: times.sleep_time,
      };
      if (times.work_start) anchors.work_start = times.work_start;
      if (times.work_end) anchors.work_end = times.work_end;
      if (times.lunch_time) anchors.lunch = times.lunch_time;

      await supabase.from("spiritual_dna_assessments").upsert(
        {
          user_id: userId,
          assessment_conversation: { ...conv, daily_anchors: anchors } as any,
        } as any,
        { onConflict: "user_id" },
      );

      try {
        localStorage.setItem(`daily_rhythm_${userId}`, JSON.stringify({ ...times, updatedAt: Date.now() }));
      } catch {}

      setSavedAt(Date.now());
      toast.success("Rhythm saved — your day will retime around this");
    } catch (e) {
      console.warn("Daily rhythm save failed", e);
      toast.error("Couldn't save rhythm. Try again.");
    } finally {
      setSaving(false);
    }
  }, [userId, times]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Sunrise className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base text-foreground">Daily Rhythm</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Your real clock. Wake, work, lunch, wind-down, sleep — practice times
        itself around these. Skip what doesn't apply.
      </p>

      <div className="space-y-3">
        {FIELDS.map(({ key, label, hint, Icon, fallback, required }) => (
          <label key={key} className="block">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
              <Icon className="h-3 w-3" /> {label}
              {!required && <span className="opacity-50 normal-case tracking-normal text-[10px]">· optional</span>}
            </span>
            <input
              type="time"
              value={(times[key] as string) || ""}
              placeholder={fallback}
              onChange={(e) => setField(key, e.target.value)}
              className="w-full px-4 py-2.5 bg-card/40 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/60"
            />
            <span className="block text-[10px] text-muted-foreground/70 mt-1">{hint}</span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-display text-sm tracking-wide flex items-center gap-2 disabled:opacity-30 hover:bg-primary/90 transition"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : savedAt ? <Check className="h-4 w-4" /> : null}
          {saving ? "Saving…" : savedAt ? "Saved" : "Save & retime"}
        </button>
      </div>
    </div>
  );
}
