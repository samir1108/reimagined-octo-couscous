import { motion } from "framer-motion";
import { FlaskConical, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1] as const;
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface Props {
  guidance: {
    one_small_win?: string | null;
    challenge_yourself?: string | null;
    micro_practice?: string | { title?: string; why?: string } | null;
    integration?: string | null;
    bring_into_action?: string | null;
  } | null;
  activeGuru?: { name: string } | null;
}

const DEFAULT_EXPERIMENTS = [
  "Speak 10% slower in your next conversation",
  "Leave your phone in another room during meals",
  "Take 3 conscious breaths before every transition",
  "Notice one thing you'd usually criticize — and don't",
  "Do one task with full attention, no multitasking",
];

export default function ThingsToExperimentWith({ guidance, activeGuru }: Props) {
  const navigate = useNavigate();

  const experiments = [
    cleanText(guidance?.one_small_win),
    cleanText(guidance?.challenge_yourself),
    cleanText(typeof guidance?.micro_practice === "string" ? guidance.micro_practice : guidance?.micro_practice?.title),
    cleanText(guidance?.bring_into_action),
    cleanText(guidance?.integration),
  ].filter(Boolean);

  const allExperiments = experiments.length > 0 ? experiments : DEFAULT_EXPERIMENTS.slice(0, 3);

  const handleExperimentClick = (experiment: string) => {
    navigate("/app/journal", {
      state: { experimentPrompt: experiment },
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
      aria-label="Things to experiment with"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-amber-300/70 flex items-center gap-1.5">
          <FlaskConical className="h-3 w-3" aria-hidden />
          Things to experiment with
        </p>
        {activeGuru && (
          <span className="text-[9px] font-display tracking-[0.14em] uppercase text-muted-foreground/40">
            Via {activeGuru.name}
          </span>
        )}
      </div>

      <ul className="mt-3 space-y-2" role="list">
        {allExperiments.slice(0, 3).map((exp, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.05 }}
            className="group flex items-start gap-3"
          >
            <Zap className="mt-1 flex-shrink-0 h-3.5 w-3.5 text-amber-300/70" aria-hidden />
            <button
              type="button"
              onClick={() => handleExperimentClick(exp)}
              className="flex-1 text-left text-[12.5px] leading-[1.6] text-foreground/80 hover:text-primary transition-colors pr-6"
            >
              {exp}
            </button>
            <ArrowRight className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" aria-hidden />
          </motion.li>
        ))}
      </ul>

      <p className="mt-3 text-[10px] italic leading-relaxed text-muted-foreground/50">
        Treat each as a hypothesis. Observe the result.
      </p>
    </motion.section>
  );
}