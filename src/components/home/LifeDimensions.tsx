import { motion } from "framer-motion";
import { BarChart2, ArrowRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1] as const;

const DOMAIN_LABELS: Record<string, string> = {
  work: "Work & Purpose",
  relationships: "Relationships",
  health: "Health & Body",
  purpose: "Purpose & Meaning",
  creativity: "Creativity",
  community: "Community",
  finance: "Finance",
  home: "Home Environment",
  learning: "Learning & Growth",
  spirituality: "Spirituality",
};

interface Props {
  lifeDomains: Record<string, number>;
  stressedDomain?: string | null;
}

export default function LifeDimensions({ lifeDomains, stressedDomain }: Props) {
  const navigate = useNavigate();

  const entries = Object.entries(lifeDomains)
    .filter(([, score]) => typeof score === "number")
    .map(([domain, score]) => ({
      domain,
      label: DOMAIN_LABELS[domain] || domain,
      score: Math.round(score * 10) / 10,
      isStressed: domain === stressedDomain,
    }))
    .sort((a, b) => a.score - b.score);

  if (entries.length === 0) return null;

  const lowest = entries[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.17 }}
      aria-label="Life dimensions"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/70 flex items-center gap-1.5">
          <BarChart2 className="h-3 w-3" aria-hidden />
          Life dimensions
        </p>
        <button
          type="button"
          onClick={() => navigate("/app/analytics?tab=domains")}
          className="text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/45 hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Explore
          <ArrowRight className="h-2.5 w-2.5" aria-hidden />
        </button>
      </div>

      {lowest && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="mt-3 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5"
        >
          <Target className="mt-0.5 flex-shrink-0 h-3.5 w-3.5 text-primary/70" aria-hidden />
          <p className="text-[11px] text-foreground/75">
            <span className="font-medium">{lowest.label}</span>{" "}
            ({lowest.score}/10) is asking for attention.
          </p>
        </motion.div>
      )}

      <div className="mt-3 space-y-2.5" role="list">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.domain}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.04 }}
            className="group"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-medium text-foreground/80 truncate pr-2">
                {entry.label}
              </span>
              <span className="flex-shrink-0 text-[10px] font-display tabular-nums text-muted-foreground/50">
                {entry.score.toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, entry.score * 10))}%` }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.04 }}
                className="h-full rounded-full transition-colors"
                style={{
                  background: entry.isStressed
                    ? "linear-gradient(90deg, hsl(0 80% 60%), hsl(30 90% 55%))"
                    : entry.score < 4
                    ? "linear-gradient(90deg, hsl(30 90% 55%), hsl(45 95% 55%))"
                    : entry.score < 7
                    ? "linear-gradient(90deg, hsl(160 60% 45%), hsl(140 60% 50%))"
                    : "linear-gradient(90deg, hsl(200 70% 50%), hsl(220 70% 55%))",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}