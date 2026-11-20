/**
 * PracticeAlarmScheduler — replaces the static "Set N alarms during your day"
 * instruction with an in-app scheduler. Schedules N pings between a chosen
 * window, fires native browser notifications + an in-app modal when each
 * alarm is due, and captures what the user noticed.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Check, Clock, Sparkles, X } from "lucide-react";
import {
  createSchedule,
  clearSchedule,
  detectCheckInCount,
  formatTime,
  getDueAlarmIndex,
  getSchedule,
  markAlarmDone,
  type PracticeAlarmSchedule,
} from "@/lib/practiceAlarms";
import { translateNotificationTexts } from "@/lib/notifyTranslation";

interface Props {
  userId: string;
  /** stable per-day key, e.g. `${todayISO}:day-${day}` */
  dayKey: string;
  instruction: string;
  checkpoints: string[];
  /** Practice title shown in the notification */
  practiceLabel?: string;
}

export default function PracticeAlarmScheduler({
  userId,
  dayKey,
  instruction,
  checkpoints,
  practiceLabel = "Mindful check-in",
}: Props) {
  const detectedCount = useMemo(() => detectCheckInCount(instruction), [instruction]);
  const [schedule, setSchedule] = useState<PracticeAlarmSchedule | null>(() =>
    userId ? getSchedule(userId, dayKey) : null
  );
  const [windowStart, setWindowStart] = useState("09:00");
  const [windowEnd, setWindowEnd] = useState("21:00");
  const [dueIdx, setDueIdx] = useState<number>(-1);
  const [noticed, setNoticed] = useState("");
  const firedRef = useRef<Set<number>>(new Set());

  // Re-load schedule when key changes
  useEffect(() => {
    if (!userId) return;
    setSchedule(getSchedule(userId, dayKey));
    firedRef.current = new Set();
  }, [userId, dayKey]);

  // Poll every 20s for due alarms
  useEffect(() => {
    if (!schedule) return;
    const tick = () => {
      const idx = getDueAlarmIndex(schedule);
      if (idx >= 0 && !firedRef.current.has(idx)) {
        firedRef.current.add(idx);
        setDueIdx(idx);
        // Native notification (best-effort)
        try {
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            void (async () => {
              const [title, body] = await translateNotificationTexts([
                `🔔 ${practiceLabel}`,
                'Pause for 30 seconds. "What was I just thinking?"',
              ]);
              const n = new Notification(title, {
                body,
                icon: "/pwa-icon-192.png",
                tag: `practice-${dayKey}-${idx}`,
              });
              n.onclick = () => {
                window.focus();
                n.close();
              };
            })();
          }
        } catch {
          // ignore
        }
        // In-app chime via Web Audio
        try {
          const ctx = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.value = 528;
          o.type = "sine";
          g.gain.value = 0.0001;
          o.connect(g).connect(ctx.destination);
          o.start();
          g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
          setTimeout(() => {
            o.stop();
            ctx.close();
          }, 1500);
        } catch {
          // ignore
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [schedule, dayKey, practiceLabel]);

  if (detectedCount === 0) return null;

  const requestNotifPermission = async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // ignore
      }
    }
  };

  const handleSchedule = async () => {
    await requestNotifPermission();
    const sch = createSchedule({
      userId,
      dayKey,
      count: detectedCount,
      windowStart,
      windowEnd,
    });
    firedRef.current = new Set();
    setSchedule(sch);
  };

  const handleReset = () => {
    clearSchedule(userId, dayKey);
    firedRef.current = new Set();
    setSchedule(null);
  };

  const handleAck = () => {
    if (dueIdx < 0 || !schedule) return;
    const updated = markAlarmDone(userId, dayKey, dueIdx, noticed.trim() || undefined);
    if (updated) setSchedule(updated);
    setNoticed("");
    setDueIdx(-1);
  };

  const doneCount = schedule?.alarms.filter((a) => a.done).length ?? 0;
  const allDone = !!schedule && doneCount === schedule.alarms.length;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <BellRing className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">
          The app will ping you — no manual alarm needed
        </p>
      </div>

      {!schedule ? (
        <>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            We'll spread{" "}
            <span className="text-foreground font-semibold">{detectedCount}</span>{" "}
            mindful pings across your day. Each ping will pause you for 30 seconds
            to ask: <em>"What was I just thinking?"</em>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                From
              </span>
              <input
                type="time"
                value={windowStart}
                onChange={(e) => setWindowStart(e.target.value)}
                className="bg-background/60 border border-border/50 rounded-lg px-2 py-1.5 text-xs text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Until
              </span>
              <input
                type="time"
                value={windowEnd}
                onChange={(e) => setWindowEnd(e.target.value)}
                className="bg-background/60 border border-border/50 rounded-lg px-2 py-1.5 text-xs text-foreground"
              />
            </label>
          </div>
          <button
            onClick={handleSchedule}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:brightness-110 transition"
          >
            <Bell className="w-3.5 h-3.5" />
            Schedule {detectedCount} mindful pings
          </button>
          <p className="text-[10px] text-muted-foreground/70 leading-snug">
            Browser notifications fire even if this tab is in the background.
            In-app pings work whenever the app is open.
          </p>
        </>
      ) : (
        <>
          <ul className="space-y-1">
            {schedule.alarms.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                {a.done ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                )}
                <span
                  className={
                    a.done
                      ? "line-through text-muted-foreground/60"
                      : "text-foreground/80"
                  }
                >
                  Ping {i + 1} · {formatTime(a.at)}
                </span>
                {a.noticed && (
                  <span className="ml-auto text-[10px] italic text-muted-foreground/70 truncate max-w-[40%]">
                    "{a.noticed}"
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {doneCount}/{schedule.alarms.length} caught
              {allDone && " ✨"}
            </span>
            <button
              onClick={handleReset}
              className="text-[10px] text-muted-foreground/70 hover:text-foreground underline"
            >
              Reset schedule
            </button>
          </div>
        </>
      )}

      {/* Due alarm modal */}
      <AnimatePresence>
        {dueIdx >= 0 && schedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="w-full max-w-md bg-card border border-primary/30 rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-display font-semibold text-foreground">
                    Pause. 30 seconds.
                  </h3>
                </div>
                <button
                  onClick={() => setDueIdx(-1)}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">
                What were you just thinking? Don't judge it. Just notice it.
              </p>
              {checkpoints.length > 0 && (
                <ul className="space-y-1.5">
                  {checkpoints.slice(0, 3).map((cp, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[12px] text-muted-foreground leading-snug"
                    >
                      <span className="text-primary/70">·</span>
                      {cp}
                    </li>
                  ))}
                </ul>
              )}
              <textarea
                value={noticed}
                onChange={(e) => setNoticed(e.target.value)}
                placeholder="The thought I caught… (optional)"
                rows={2}
                className="w-full bg-background/60 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <button
                onClick={handleAck}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition"
              >
                I caught it ✓
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
