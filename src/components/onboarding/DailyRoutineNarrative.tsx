/**
 * DailyRoutineNarrative — onboarding step
 * ───────────────────────────────────────
 * 1) Five quick "anchor" time pickers (the 5 things ~90% of people do)
 *      • wake_up, brush_washroom, bath, work_start, sleep
 *    These become hard time-anchors for Off-App ritual placement.
 * 2) A 5–10 sentence narrative for tone, loops & nuance.
 *
 * Stored on `spiritual_dna_assessments.assessment_conversation`:
 *   - daily_routine_narrative: string
 *   - daily_anchors: { wake_up, brush_washroom, bath, work_start, sleep }
 */
import { useState } from "react";
import { motion } from "framer-motion";

export interface DailyAnchors {
  wake_up: string;        // "HH:MM"
  brush_washroom: string;
  bath: string;
  work_start: string;
  sleep: string;
}

interface Props {
  name: string;
  onNext: (narrative: string, anchors: DailyAnchors) => void;
  onSkip: () => void;
}

const ANCHORS: { key: keyof DailyAnchors; label: string; emoji: string; default: string; hint: string }[] = [
  { key: "wake_up",        label: "Wake up",         emoji: "🌅", default: "07:00", hint: "First eyes-open" },
  { key: "brush_washroom", label: "Brush / washroom", emoji: "🪥", default: "07:15", hint: "Morning routine" },
  { key: "bath",           label: "Bath / shower",    emoji: "🚿", default: "07:45", hint: "When you bathe" },
  { key: "work_start",     label: "Work / school",    emoji: "💼", default: "09:30", hint: "Day really begins" },
  { key: "sleep",          label: "Sleep",            emoji: "🌙", default: "23:30", hint: "Lights out" },
];

const PROMPTS = [
  "First thing after you wake — phone, breath, coffee, kids?",
  "Work / study rhythm through the day…",
  "When do you eat? Alone or with someone?",
  "Evening — who or what do you come home to?",
  "What do you do in the last hour before sleep?",
];

const MIN_CHARS = 80;
const TARGET_CHARS = 280;

export default function DailyRoutineNarrative({ name, onNext, onSkip }: Props) {
  const [text, setText] = useState("");
  const [anchors, setAnchors] = useState<DailyAnchors>(() =>
    ANCHORS.reduce((acc, a) => ({ ...acc, [a.key]: a.default }), {} as DailyAnchors)
  );
  const chars = text.trim().length;
  const ready = chars >= MIN_CHARS;
  const pct = Math.min(100, (chars / TARGET_CHARS) * 100);

  const update = (k: keyof DailyAnchors, v: string) =>
    setAnchors((prev) => ({ ...prev, [k]: v }));

  return (
    <motion.div
      key="daily_routine"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex items-center justify-center bg-black p-5 overflow-y-auto"
    >
      <div className="w-full max-w-xl mx-auto py-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <p className="text-xs font-display tracking-[0.3em] uppercase text-amber-400/70">
            Step · Daily rhythm
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-white leading-snug">
            {name ? `${name}, walk me through a normal day` : "Walk me through a normal day"}
          </h2>
          <p className="text-sm font-body text-white/60 leading-relaxed max-w-md mx-auto">
            Five anchors first — then a few sentences. This is what shapes when
            and how I show up in your day.
          </p>
        </motion.div>

        {/* 5 quick anchors — the things ~90% of people do */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
        >
          <p className="text-[11px] font-display tracking-[0.25em] uppercase text-amber-400/70">
            Your 5 anchors
          </p>
          <div className="space-y-2">
            {ANCHORS.map((a) => (
              <div
                key={a.key}
                className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/5 px-3 py-2"
              >
                <span className="text-lg leading-none">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-white/90 leading-tight">
                    {a.label}
                  </p>
                  <p className="text-[10px] font-body text-white/40 leading-tight">
                    {a.hint}
                  </p>
                </div>
                <input
                  type="time"
                  value={anchors[a.key]}
                  onChange={(e) => update(a.key, e.target.value)}
                  className="bg-transparent text-sm font-display text-amber-200 tabular-nums focus:outline-none border-b border-white/10 focus:border-amber-400/60 px-1 py-0.5"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-body text-white/30 leading-relaxed">
            We'll add more over time. These five cover what most people do every day.
          </p>
        </motion.div>

        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <p className="text-[11px] font-display tracking-[0.25em] uppercase text-amber-400/70 px-1">
            Now — a few sentences
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                "e.g. Wake up, scroll phone 20 mins, rushed breakfast. Metro by 9. " +
                "Work till 7, often skip lunch. Dinner with family if I'm home. " +
                "Scroll till midnight, sleep around 1."
              }
              rows={7}
              className="w-full bg-transparent px-4 py-4 text-sm font-body text-white placeholder:text-white/30 focus:outline-none resize-none leading-relaxed"
            />
            <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between">
              <div className="h-1 flex-1 mr-3 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[10px] font-display tracking-wider uppercase text-white/40 tabular-nums">
                {chars < MIN_CHARS ? `${MIN_CHARS - chars} more` : "ready"}
              </span>
            </div>
          </div>

          <details className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <summary className="text-[11px] font-display tracking-wider uppercase text-white/50 cursor-pointer hover:text-white/70">
              Need prompts?
            </summary>
            <ul className="mt-3 space-y-1.5">
              {PROMPTS.map((p) => (
                <li key={p} className="text-xs font-body text-white/60 leading-relaxed">
                  · {p}
                </li>
              ))}
            </ul>
          </details>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between gap-3"
        >
          <button
            onClick={onSkip}
            className="text-xs font-display tracking-wider uppercase text-white/30 hover:text-white/60 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={() => ready && onNext(text.trim(), anchors)}
            disabled={!ready}
            className={`px-6 py-3 rounded-full text-sm font-display tracking-wide transition-all ${
              ready
                ? "bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-500/20"
                : "bg-white/5 text-white/30 cursor-not-allowed"
            }`}
          >
            Continue →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
