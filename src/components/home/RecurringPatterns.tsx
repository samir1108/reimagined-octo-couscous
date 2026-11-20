import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLoopName } from "@/lib/onboarding/getLoopName";

const EASE = [0.16, 1, 0.3, 1] as const;
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface Props {
  activeLoops: string[];
  loopSeverity: Record<string, number>;
  loopAwareness: Record<string, number>;
}

export default function RecurringPatterns({ activeLoops, loopSeverity, loopAwareness }: Props) {
  const navigate = useNavigate();

  const patterns = activeLoops
    .map((loopId) => {
      const severity = loopSeverity[loopId] ?? 0;
      const awareness = loopAwareness[loopId] ?? 0;
      const name = getLoopName(loopId);
      if (!name) return null;
      return {
        id: loopId,
        name,
        severity: Math.round(severity * 100),
        awareness: Math.round(awareness * 100),
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3);

  if (patterns.length === 0) return null;

  const acutePattern = patterns.find((p) => p.severity >= 70);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.13 }}
      aria-label="Recurring patterns"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-rose-300/70 flex items-center gap-1.5">
          <RefreshCw className="h-3 w-3" aria-hidden />
          Recurring patterns
        </p>
        <button
          type="button"
          onClick={() => navigate("/app/analytics?tab=loops")}
          className="text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/45 hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-2.5 w-2.5" aria-hidden />
        </button>
      </div>

      {acutePattern && (
        <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] px-3 py-2.5">
          <AlertTriangle className="mt-0.5 flex-shrink-0 h-3.5 w-3.5 text-rose-300/70" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-rose-100/80">
              {acutePattern.name} is acute ({acutePattern.severity}%)
            </p>
            <p className="mt-0.5 text-[10.5px] text-rose-200/60">
              Today's theme is aimed at this pattern. Awareness is the lever.
            </p>
          </div>
        </div>
      )}

      <ul className="mt-3 space-y-2" role="list">
        {patterns.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.05 }}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-foreground/80 truncate">{p.name}</p>
              <div className="mt-1 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.severity}%` }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.05 }}
                  className="h-full rounded-full"
                  style={{
                    background: p.severity >= 70
                      ? "linear-gradient(90deg, hsl(0 80% 60%), hsl(30 90% 55%))"
                      : p.severity >= 40
                      ? "linear-gradient(90deg, hsl(30 90% 55%), hsl(45 95% 55%))"
                      : "linear-gradient(90deg, hsl(140 60% 50%), hsl(160 60% 45%))",
                  }}
                />
              </div>
              <p className="mt-0.5 text-[9px] font-display tracking-[0.12em] uppercase text-muted-foreground/45">
                Intensity {p.severity}% · Awareness {p.awareness}%
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}