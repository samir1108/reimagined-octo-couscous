import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play, BookOpen, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1] as const;
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface EngineSuggestion {
  type: "guide_mode" | "journal" | "practice";
  title: string;
  description: string;
  emoji?: string;
  duration?: string;
  action: { target: string; mode?: string; prompt?: string; context?: string };
}

interface Props {
  suggestion: EngineSuggestion | null;
}

const ICONS: Record<string, React.ElementType> = {
  guide_mode: Sparkles,
  journal: BookOpen,
  practice: Target,
};

export default function YourNextStep({ suggestion }: Props) {
  const navigate = useNavigate();

  if (!suggestion || !cleanText(suggestion.title)) return null;

  const Icon = ICONS[suggestion.type] || Sparkles;
  const target = suggestion.action?.target?.toLowerCase() || "guide";

  const handleClick = () => {
    if (target === "journal") {
      navigate("/app/journal");
      return;
    }
    if (target === "practice") {
      navigate("/app/practice");
      return;
    }
    // guide_mode or anything else -> guide
    const ctx = [
      `NEXT STEP: ${cleanText(suggestion.title)}`,
      cleanText(suggestion.reason) ? `Why: ${cleanText(suggestion.reason)}` : null,
      cleanText(suggestion.description) ? `Intent: ${cleanText(suggestion.description)}` : null,
      cleanText(suggestion.action.context) ? `Focus: ${cleanText(suggestion.action.context)}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    try {
      sessionStorage.setItem("journeySession:aiContext", ctx);
      sessionStorage.setItem("journeySession:ts", String(Date.now()));
    } catch { /* ignore */ }
    navigate("/app/guide?journey=1");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.09 }}
      aria-label="Your next step"
      className="w-full rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-5 py-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/80 flex items-center gap-1.5">
            <Icon className="h-3 w-3" aria-hidden />
            Your next step
          </p>
          <p className="mt-2 text-[15px] font-display font-medium leading-snug text-foreground/90">
            {cleanText(suggestion.title)}
          </p>
          {cleanText(suggestion.description) && (
            <p className="mt-1 text-[12px] leading-relaxed text-foreground/65">
              {cleanText(suggestion.description)}
            </p>
          )}
          {cleanText(suggestion.duration) && (
            <p className="mt-1.5 text-[10px] font-display tracking-[0.14em] uppercase text-primary/70">
              {cleanText(suggestion.duration)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="flex-shrink-0 group inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/20 px-4 py-2 text-[10px] font-display tracking-[0.18em] uppercase text-primary hover:bg-primary/30 transition-colors"
          aria-label={`Begin: ${cleanText(suggestion.title)}`}
        >
          <Play className="h-3 w-3" aria-hidden />
          Begin
          <ArrowRight
            className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      </div>
    </motion.section>
  );
}