/**
 * PersonalRhythmCard
 * ──────────────────
 * Compact card showing the user's next kundli-aware practice and today's full
 * rhythm. Off-app practices are clearly marked. One tap requests notification
 * permission so reminders fire on time.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, Clock, ExternalLink, Sparkles, Sun, Moon } from "lucide-react";
import { usePersonalRhythm, type RhythmEntry } from "@/hooks/usePersonalRhythm";

interface Props { userId: string | undefined; }

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const CATEGORY_ICON: Record<string, string> = {
  mantra: "🕉",
  breath: "🌬",
  walk: "🚶",
  gratitude: "🙏",
  water: "💧",
  gaze: "👁",
  observation: "🪷",
  rest: "🌙",
};

export default function PersonalRhythmCard({ userId }: Props) {
  const { entries, nextEntry, loading, regenerate, markComplete, ensurePermission } = usePersonalRhythm(userId);
  const [open, setOpen] = useState(false);
  const [notifyOk, setNotifyOk] = useState<boolean | null>(null);

  if (!userId) return null;

  const handleEnableNotifications = async () => {
    const ok = await ensurePermission();
    setNotifyOk(ok);
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur p-5 space-y-4 max-h-[calc(100dvh-4rem)] overflow-hidden flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Your rhythm today
          </p>
          <h3 className="font-display text-lg text-foreground mt-1">
            {nextEntry ? "Next: " + nextEntry.title : loading ? "Tuning to your chart…" : "Today complete 🌿"}
          </h3>
          {nextEntry && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {fmt(nextEntry.scheduled_at)}
              {nextEntry.location === "off_app" && (
                <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                  <ExternalLink className="h-2.5 w-2.5" /> Off-app
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={handleEnableNotifications}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg border border-border/40"
          title="Enable reminders"
        >
          {notifyOk === false ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          {notifyOk === null ? "Enable" : notifyOk ? "On" : "Blocked"}
        </button>
      </div>

      {nextEntry && (
        <div className="text-sm text-foreground/80 leading-relaxed">
          {nextEntry.description}
        </div>
      )}

      {nextEntry && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => markComplete(nextEntry.id)}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-display tracking-wide flex items-center gap-1.5 hover:bg-primary/90"
          >
            <Check className="h-3.5 w-3.5" /> Done
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="px-4 py-2 rounded-full border border-border/40 text-xs text-muted-foreground hover:text-foreground"
          >
            {open ? "Hide day" : `See day (${entries.filter((e) => !e.completed_at).length})`}
          </button>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-y-auto overscroll-contain border-t border-border/30 pt-3 pr-1 max-h-[55vh] [scrollbar-gutter:stable]"
          >
            {entries.map((e) => (
              <RhythmRow key={e.id} entry={e} onDone={() => markComplete(e.id)} />
            ))}
            <li className="pt-2">
              <button
                onClick={regenerate}
                className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
              >
                Regenerate for today
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function RhythmRow({ entry, onDone }: { entry: RhythmEntry; onDone: () => void }) {
  const past = new Date(entry.scheduled_at).getTime() < Date.now();
  return (
    <li
      className={`flex items-start gap-3 p-2 rounded-lg ${
        entry.completed_at ? "opacity-50" : past ? "bg-primary/5" : ""
      }`}
    >
      <div className="text-lg leading-none mt-0.5">{CATEGORY_ICON[entry.category] || "•"}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{fmt(entry.scheduled_at)}</span>
          <span>·</span>
          <span className="uppercase tracking-wider text-[10px]">
            {entry.location === "off_app" ? "Off-app" : "In-app"}
          </span>
          {entry.source && <span className="text-[10px]">· {entry.source.replace(/_/g, " ")}</span>}
        </div>
        <p className={`text-sm ${entry.completed_at ? "line-through" : "text-foreground"}`}>{entry.title}</p>
        {entry.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.description}</p>
        )}
      </div>
      {!entry.completed_at && (
        <button onClick={onDone} className="text-muted-foreground hover:text-primary p-1" title="Mark done">
          <Check className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}
