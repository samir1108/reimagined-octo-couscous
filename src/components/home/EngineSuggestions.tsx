/**
 * EngineSuggestions — what the field suggests, as quiet doors.
 *
 * The consciousness engine computes up to four personalized next actions
 * (`plan.suggestions[]`), each with a reason and a semantic target
 * ("guide" | "journal" | "practice"). Home shows the top three as tappable
 * chips; guide targets reuse the existing journey-1 + sessionStorage context
 * mechanism the rest of Home already speaks.
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

interface EngineSuggestion {
  type: string;
  title: string;
  description: string;
  reason?: string;
  emoji?: string;
  duration?: string;
  action: { target: string; mode?: string; prompt?: string; context?: string };
}

interface Props {
  suggestions: EngineSuggestion[] | null;
}

const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

export default function EngineSuggestions({ suggestions }: Props) {
  const navigate = useNavigate();

  const items = (suggestions || [])
    .filter((s) => cleanText(s?.title) && s?.action?.target)
    .slice(0, 3);

  if (items.length === 0) return null;

  const open = (s: EngineSuggestion) => {
    const target = String(s.action.target).toLowerCase();
    if (target === "journal") {
      navigate("/app/journal");
      return;
    }
    if (target === "practice") {
      navigate("/app/practice");
      return;
    }
    // "guide" and anything else → the Guide journey, with the engine's
    // reasoning stashed as the opening context (same contract as Home's
    // TimeAskSheet / session intro).
    const ctx = [
      `ENGINE SUGGESTION: ${cleanText(s.title)}`,
      cleanText(s.reason) ? `Why: ${cleanText(s.reason)}` : null,
      cleanText(s.description) ? `Intent: ${cleanText(s.description)}` : null,
      cleanText(s.action.context) ? `Focus: ${cleanText(s.action.context)}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    try {
      sessionStorage.setItem("journeySession:aiContext", ctx);
      sessionStorage.setItem("journeySession:ts", String(Date.now()));
    } catch {
      /* context stays un-stashed; the guide still opens */
    }
    navigate("/app/guide?journey=1");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.28 }}
      aria-label="Suggested next"
      className="w-full"
    >
      <p className="text-center text-[9px] font-display tracking-[0.28em] uppercase text-muted-foreground/50">
        The field suggests
      </p>

      <div className="mx-auto mt-2.5 flex max-w-md flex-wrap items-center justify-center gap-2">
        {items.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => open(s)}
            title={cleanText(s.reason) || cleanText(s.description)}
            className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/30 bg-card/40 px-3.5 py-1.5 text-[10.5px] text-foreground/70 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary/90"
          >
            {cleanText(s.emoji) && (
              <span aria-hidden className="text-[11px] leading-none">{cleanText(s.emoji)}</span>
            )}
            <span className="truncate">{cleanText(s.title)}</span>
            {cleanText(s.duration) && (
              <span className="flex-shrink-0 text-[8.5px] font-display tracking-[0.12em] uppercase text-muted-foreground/45">
                {cleanText(s.duration)}
              </span>
            )}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
