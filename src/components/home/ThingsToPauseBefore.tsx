import { motion } from "framer-motion";
import { Pause, AlertCircle, Clock } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface Props {
  guidance: {
    resistance_warning?: string | null;
    be_mindful_of?: string | null;
    avoid_today?: string | null;
    forbidden_thing?: string | null;
  } | null;
  bypassingRisk: number;
}

const DEFAULT_PAUSES = [
  "Before you say 'I should...', pause. Feel what's actually there.",
  "Before opening social media, take 3 breaths.",
  "Before reacting to a trigger, name the sensation.",
  "Before judging the feeling, let it be felt.",
  "Before the next task, complete this breath.",
];

export default function ThingsToPauseBefore({ guidance, bypassingRisk }: Props) {
  const pauses = [
    cleanText(guidance?.resistance_warning),
    cleanText(guidance?.be_mindful_of),
    cleanText(guidance?.avoid_today),
    cleanText(guidance?.forbidden_thing),
  ].filter(Boolean);

  const allPauses = pauses.length > 0 ? pauses : DEFAULT_PAUSES.slice(0, 3);

  const hasBypassingAlert = bypassingRisk > 0.6;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
      aria-label="Things to pause before"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <p className="text-[9px] font-display tracking-[0.28em] uppercase text-rose-300/70 flex items-center gap-1.5">
        <Pause className="h-3 w-3" aria-hidden />
        Things to pause before
      </p>

      {hasBypassingAlert && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="mt-2 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2.5"
        >
          <AlertCircle className="mt-0.5 flex-shrink-0 h-3.5 w-3.5 text-amber-300/70" aria-hidden />
          <p className="text-[11px] text-amber-100/70">
            High bypassing risk ({Math.round(bypassingRisk * 100)}%). Practice becomes escape when feeling is skipped.
          </p>
        </motion.div>
      )}

      <ul className="mt-3 space-y-2" role="list">
        {allPauses.slice(0, 3).map((pause, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.05 }}
            className="flex items-start gap-3 text-[12.5px] leading-[1.6] text-foreground/75"
          >
            <Clock className="mt-1 flex-shrink-0 h-3.5 w-3.5 text-rose-300/60" aria-hidden />
            <span>{pause}</span>
          </motion.li>
        ))}
      </ul>

      <p className="mt-3 text-[10px] italic leading-relaxed text-muted-foreground/50">
        The pause is the practice. Everything follows.
      </p>
    </motion.section>
  );
}