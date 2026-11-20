import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface Props {
  theme: {
    theme_rationale?: string | { whyToday?: string; summary?: string; reason?: string } | null;
    sub_angle?: string | null;
    felt_sense_opener?: string | null;
  } | null;
}

export default function WhyThisMatters({ theme }: Props) {
  const [expanded, setExpanded] = useState(false);

  const rationale = theme?.theme_rationale;
  let whyText = "";
  if (typeof rationale === "string") {
    whyText = cleanText(rationale);
  } else if (rationale && typeof rationale === "object") {
    whyText = cleanText(rationale.whyToday) || cleanText(rationale.summary) || cleanText(rationale.reason);
  }
  const essence = cleanText(theme?.sub_angle) || cleanText(theme?.felt_sense_opener);

  const fullText = [essence, whyText].filter(Boolean).join(" ");

  if (!fullText) return null;

  const isLong = fullText.length > 280;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
      aria-label="Why this matters"
      className="w-full rounded-2xl border border-border/30 bg-gradient-to-br from-primary/5 to-transparent px-5 py-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/80 flex items-center gap-1.5">
          <span className="text-[11px]" aria-hidden>💡</span>
          Why this matters
        </p>
      </div>

      <div className="mt-3">
        <p
          className={`text-[13px] leading-[1.65] text-foreground/80 ${!expanded && isLong ? "line-clamp-3" : ""}`}
          style={{
            display: !expanded && isLong ? "-webkit-box" : "block",
            WebkitLineClamp: !expanded && isLong ? 3 : "unset",
            WebkitBoxOrient: "vertical",
            overflow: !expanded && isLong ? "hidden" : "visible",
          }}
        >
          {fullText}
        </p>

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-display tracking-[0.22em] uppercase text-primary/70 hover:text-primary transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Read more"}
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        )}
      </div>
    </motion.section>
  );
}