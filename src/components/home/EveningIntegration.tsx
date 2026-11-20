/**
 * EveningIntegration — the day's closing reflection.
 *
 * The consciousness engine computes an evening focus + questions
 * (`plan.eveningReflection`). Home shows it only while the evening or night
 * gate is open — integration belongs to the settling hours, not the morning.
 * Purely reflective: no actions, no keeps.
 */
import { motion } from "framer-motion";
import { getCurrentGate } from "@/lib/consciousness/dailyGates";

const EASE = [0.16, 1, 0.3, 1] as const;

/** The small models occasionally emit "undefined"/"null" — never speak it. */
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface EveningReflection {
  focus: string;
  questions: string[];
}

interface Props {
  reflection: EveningReflection | null;
}

export default function EveningIntegration({ reflection }: Props) {
  const gate = getCurrentGate(new Date().getHours());
  if (gate !== "evening" && gate !== "night") return null;
  if (!reflection) return null;

  const focus = cleanText(reflection.focus);
  const questions = (Array.isArray(reflection.questions) ? reflection.questions : [])
    .map(cleanText)
    .filter(Boolean)
    .slice(0, 3);

  if (!focus && questions.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
      aria-label="Evening integration"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <p className="text-[9px] font-display tracking-[0.28em] uppercase text-indigo-300/60">
        Evening integration
      </p>

      {focus && (
        <p className="mt-1.5 text-[13px] leading-snug text-foreground/85">{focus}</p>
      )}

      {questions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-2.5 text-[12px] italic leading-[1.6] text-foreground/60">
              <span aria-hidden className="mt-[2px] text-[10px] not-italic text-muted-foreground/40">
                {i + 1}.
              </span>
              <span>“{q}”</span>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
