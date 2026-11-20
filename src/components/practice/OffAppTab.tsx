/**
 * Off-App Tab — life-as-practice (grouped, full-day)
 *
 * Cards are grouped by daily moment (Morning, Meals, Work, Relating,
 * Transitions, Evening). Each card opts-in to a smart push reminder via
 * `useOffAppReminders` (anchor-aware default times pulled from onboarding).
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, ChevronDown, Play } from "lucide-react";
import {
  OFF_APP_GROUPS,
  OFF_APP_RITUALS,
  getRitualsByGroup,
  type OffAppRitualId,
  type OffAppGroup,
  type OffAppRitual,
} from "@/data/offAppRituals";
import { useOffAppReminders } from "@/hooks/useOffAppReminders";
import { useRitualProgress } from "@/hooks/useRitualProgress";
import RitualRunner from "./RitualRunner";

export default function OffAppTab() {
  const { isEnabled, getTime, toggle, setTime, permission } = useOffAppReminders();
  const { getInfo } = useRitualProgress();
  const [openId, setOpenId] = useState<OffAppRitualId | null>(null);
  const [openGroup, setOpenGroup] = useState<OffAppGroup>("morning");
  const [runningRitual, setRunningRitual] = useState<OffAppRitual | null>(null);

  // Deep-link: notification → /app/practice?ritual=ID auto-opens the runner.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rid = params.get("ritual") as OffAppRitualId | null;
    if (!rid) return;
    const r = OFF_APP_RITUALS.find((x) => x.id === rid);
    if (r) setRunningRitual(r);
    // Clean URL so refresh doesn't re-open
    const url = new URL(window.location.href);
    url.searchParams.delete("ritual");
    window.history.replaceState({}, "", url.toString());
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/30 bg-card/30 px-4 py-3">
        <p className="text-xs font-body text-muted-foreground leading-relaxed">
          Practice doesn't only live in the app. Tiny anchors let real life become
          the cushion — brushing, eating, talking, walking, sleeping.
          {permission !== "granted" && (
            <span className="block mt-1 text-[11px] text-primary/80">
              Turn on any ritual to receive a gentle reminder at its natural time.
            </span>
          )}
        </p>
      </div>

      {OFF_APP_GROUPS.map((g) => {
        const rituals = getRitualsByGroup(g.id).filter((r) => r.id !== "first_bites");
        if (!rituals.length) return null;
        const groupOpen = openGroup === g.id;
        const enabledCount = rituals.filter((r) => isEnabled(r.id)).length;

        return (
          <div key={g.id} className="space-y-2">
            <button
              onClick={() => setOpenGroup(groupOpen ? ("" as OffAppGroup) : g.id)}
              className="w-full flex items-center gap-2 px-1 py-1 text-left"
            >
              <span className="text-base">{g.emoji}</span>
              <span className="font-display text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
                {g.label}
              </span>
              {enabledCount > 0 && (
                <span className="text-[10px] font-display text-primary/80">
                  · {enabledCount} on
                </span>
              )}
              <ChevronDown
                className={`ml-auto h-3.5 w-3.5 text-muted-foreground/60 transition-transform ${groupOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {groupOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-2"
                >
                  {rituals.map((r) => {
                    const enabled = isEnabled(r.id);
                    const time = getTime(r.id);
                    const open = openId === r.id;
                    const info = getInfo(r.id);
                    const depthLabel = info.depth === "subtle" ? "Subtle" : info.depth === "deepen" ? "Deepen" : "Base";

                    return (
                      <motion.div
                        key={r.id}
                        layout
                        className="rounded-2xl border border-border/30 bg-card/30 overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenId(open ? null : r.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-card/50 transition-colors text-left"
                        >
                          <div className="text-2xl shrink-0">{r.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-display text-sm text-foreground truncate">
                              {r.title}
                            </div>
                            <div className="text-[11px] font-body text-muted-foreground truncate">
                              {r.whenLabel} · {Math.round(r.durationSec / 60) || "<1"} min
                              {info.completionCount > 0 && (
                                <span className="ml-1.5 text-primary/70">· {info.completionCount}×</span>
                              )}
                            </div>
                          </div>
                          {info.completionCount > 0 && (
                            <span className="hidden sm:inline text-[10px] font-display tracking-wider uppercase text-foreground/60 px-2 py-0.5 rounded-full bg-muted/30">
                              {depthLabel}
                            </span>
                          )}
                          {enabled && (
                            <span className="text-[10px] font-display tracking-wider uppercase text-primary/80 px-2 py-0.5 rounded-full bg-primary/10">
                              {time}
                            </span>
                          )}
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
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
                                <div className="text-[11px] font-display tracking-wider uppercase text-muted-foreground">
                                  Cue
                                </div>
                                <div className="text-sm font-body text-foreground/90 italic">
                                  {r.cue}
                                </div>

                                <div className="text-[11px] font-display tracking-wider uppercase text-muted-foreground pt-1">
                                  Practice
                                </div>
                                <div className="text-sm font-body text-foreground leading-relaxed">
                                  {r.instruction}
                                </div>

                                <div className="text-[11px] font-body text-muted-foreground/80 pt-1">
                                  — {r.closing}
                                </div>

                                {info.nextDepth && (
                                  <div className="text-[10px] font-body text-primary/70 pt-1">
                                    {info.daysToNext > 0
                                      ? `Day ${info.daysSinceEnrolled + 1} · "${info.nextDepth}" layer in ${info.daysToNext} day${info.daysToNext === 1 ? "" : "s"}`
                                      : `"${info.nextDepth}" layer unlocks next session`}
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/20">
                                  <button
                                    onClick={() => setRunningRitual(r)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display tracking-wide bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                  >
                                    <Play className="h-3.5 w-3.5" /> Begin now
                                  </button>
                                  <button
                                    onClick={() => toggle(r.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display tracking-wide transition-colors ${
                                      enabled
                                        ? "bg-primary/15 text-primary"
                                        : "bg-muted/30 text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {enabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                                    {enabled ? "Reminder on" : "Remind me"}
                                  </button>
                                  {enabled && (
                                    <input
                                      type="time"
                                      value={time}
                                      onChange={(e) => setTime(r.id, e.target.value)}
                                      className="bg-background/50 border border-border/30 rounded-lg px-2 py-1 text-xs font-body text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <AnimatePresence>
        {runningRitual && (
          <RitualRunner ritual={runningRitual} onClose={() => setRunningRitual(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
