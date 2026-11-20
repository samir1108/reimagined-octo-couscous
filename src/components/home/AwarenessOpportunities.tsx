import { motion } from "framer-motion";
import { Eye, Target } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface Props {
  theme: {
    guidance?: {
      observe_today?: string | null;
      micro_prompt?: string | null;
      felt_sense_opener?: string | null;
    } | null;
  } | null;
  observationTasks: Array<{
    title: string;
    description: string;
    status: string;
  }>;
  engineTasks?: Array<{
    title: string;
    dimension_target: string;
  }>;
}

export default function AwarenessOpportunities({ theme, observationTasks, engineTasks = [] }: Props) {
  const guidance = theme?.guidance || {};

  const opportunities = [
    cleanText(guidance.observe_today),
    cleanText(guidance.micro_prompt),
    cleanText(guidance.felt_sense_opener),
    ...observationTasks
      .filter((t) => t.status === "active")
      .map((t) => cleanText(t.title))
      .filter(Boolean),
    ...engineTasks
      .map((t) => cleanText(t.title))
      .filter(Boolean),
  ].filter(Boolean);

  const uniqueOpportunities = [...new Set(opportunities)].slice(0, 5);

  if (uniqueOpportunities.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
      aria-label="Awareness opportunities"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/70 flex items-center gap-1.5">
        <Eye className="h-3 w-3" aria-hidden />
        Awareness opportunities
      </p>

      <ul className="mt-3 space-y-2.5" role="list">
        {uniqueOpportunities.map((opp, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.05 }}
            className="flex items-start gap-3 text-[12.5px] leading-[1.6] text-foreground/75"
          >
            <Target className="mt-1 flex-shrink-0 h-3.5 w-3.5 text-primary/50" aria-hidden />
            <span>{opp}</span>
          </motion.li>
        ))}
      </ul>

      <p className="mt-3 text-[10px] italic leading-relaxed text-muted-foreground/50">
        Each is a door. Knock gently.
      </p>
    </motion.section>
  );
}