/**
 * RitualsTab — fixed daily bookends
 * ──────────────────────────────────
 * Three slots that never change → muscle memory:
 *   • Wake ritual (2 min)
 *   • Mid-day reset (1 min, post-lunch)
 *   • Sleep ritual (3 min)
 *
 * Each ritual is composed from the OFF_APP_RITUALS catalog so reminders +
 * notification scheduling are handled by the same useOffAppReminders hook.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Sparkles, Sunrise, Sun, Moon, BellRing } from "lucide-react";
import { OFF_APP_RITUALS, type OffAppRitualId } from "@/data/offAppRituals";
import { useOffAppReminders } from "@/hooks/useOffAppReminders";
import { supabase } from "@/lib/supabase";

interface Bookend {
  key: "wake" | "midday" | "sleep";
  label: string;
  emoji: string;
  durationLabel: string;
  intro: string;
  ritualIds: OffAppRitualId[];
}

const BOOKENDS: Bookend[] = [
  {
    key: "wake",
    label: "Wake ritual",
    emoji: "🌅",
    durationLabel: "2 min · daily",
    intro: "Before the day reaches you, return to yourself.",
    ritualIds: ["wake_breath", "first_sip"],
  },
  {
    key: "midday",
    label: "Mid-day reset",
    emoji: "🌤️",
    durationLabel: "1 min · post-lunch",
    intro: "One conscious pause to break the autopilot of the day.",
    ritualIds: ["lunch_pause", "every_90_min"],
  },
  {
    key: "sleep",
    label: "Sleep ritual",
    emoji: "🌙",
    durationLabel: "3 min · before sleep",
    intro: "Close the day cleanly so the body knows to rest.",
    ritualIds: ["bedtime_gift", "lights_out_scan"],
  },
];

export default function RitualsTab() {
  const { isEnabled, getTime, toggle, permission, requestPermissionIfNeeded } = useOffAppReminders();
  const [openKey, setOpenKey] = useState<Bookend["key"] | null>("wake");
  const [anchors, setAnchors] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("off_app_anchors_v1") || "{}"); } catch { return {}; }
  });
  const [lifestyle, setLifestyle] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("lifestyle, wake_time, sleep_time, occupation")
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (data?.lifestyle) setLifestyle(data.lifestyle as any);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const hasPersonalRhythm = Boolean(anchors.wake || anchors.sleep || anchors.lunch);

  return (
    <div className="space-y-3">
      {hasPersonalRhythm && (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-display tracking-[0.25em] text-primary/80 uppercase">
                Your Rhythm
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reminders are tuned to your day{lifestyle?.occupation ? ` as ${String(lifestyle.occupation).replace("_", " ")}` : ""}.
              </p>
            </div>
            {permission !== "granted" && (
              <button
                onClick={() => requestPermissionIfNeeded()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-display tracking-wide hover:bg-primary/90 transition"
              >
                <BellRing className="h-3 w-3" />
                Allow nudges
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <RhythmChip Icon={Sunrise} label="Wake" time={anchors.wake} />
            <RhythmChip Icon={Sun}     label="Lunch" time={anchors.lunch} />
            <RhythmChip Icon={Moon}    label="Sleep" time={anchors.sleep} />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/30 bg-card/30 px-4 py-3">
        <p className="text-xs font-body text-muted-foreground leading-relaxed">
          Three fixed bookends. Same time, every day. The repetition is the practice —
          the body learns the shape of a conscious day.
          {permission !== "granted" && !hasPersonalRhythm && (
            <span className="block mt-1 text-[11px] text-primary/80">
              Turn on a ritual below for a gentle nudge at its time.
            </span>
          )}
        </p>
      </div>

      {BOOKENDS.map((b) => {
        const open = openKey === b.key;
        const ritualsInBookend = b.ritualIds
          .map((id) => OFF_APP_RITUALS.find((r) => r.id === id))
          .filter(Boolean) as typeof OFF_APP_RITUALS;
        const enabledCount = ritualsInBookend.filter((r) => isEnabled(r.id)).length;

        return (
          <motion.div
            key={b.key}
            layout
            className="rounded-2xl border border-border/30 bg-card/30 overflow-hidden"
          >
            <button
              onClick={() => setOpenKey(open ? null : b.key)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-card/50 transition-colors text-left"
            >
              <div className="text-2xl shrink-0">{b.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm text-foreground">
                  {b.label}
                </div>
                <div className="text-[11px] font-body text-muted-foreground">
                  {b.durationLabel}
                </div>
              </div>
              {enabledCount > 0 && (
                <span className="text-[10px] font-display tracking-wider uppercase text-primary/80 px-2 py-0.5 rounded-full bg-primary/10">
                  {enabledCount} on
                </span>
              )}
              <Sparkles
                className={`h-4 w-4 transition-colors ${open ? "text-primary" : "text-muted-foreground"}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/20">
                    <p className="text-sm font-body text-foreground/85 italic">
                      {b.intro}
                    </p>

                    <div className="space-y-2 pt-1">
                      {ritualsInBookend.map((r) => {
                        const on = isEnabled(r.id);
                        const time = getTime(r.id);
                        return (
                          <div
                            key={r.id}
                            className="flex items-start gap-3 rounded-xl bg-background/40 border border-border/20 px-3 py-2.5"
                          >
                            <span className="text-lg shrink-0">{r.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-display text-sm text-foreground">
                                {r.title}
                              </div>
                              <div className="text-[11px] font-body text-muted-foreground leading-relaxed mt-0.5">
                                {r.instruction}
                              </div>
                            </div>
                            <button
                              onClick={() => toggle(r.id)}
                              className={`shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-display tracking-wide transition-colors ${
                                on
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {on ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                              {on ? time : "On"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function RhythmChip({ Icon, label, time }: { Icon: any; label: string; time?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-background/40 border border-border/20 py-2.5">
      <Icon className="h-4 w-4 text-primary/80" />
      <span className="text-[9px] font-display tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-sm font-display text-foreground">
        {time || "—"}
      </span>
    </div>
  );
}
