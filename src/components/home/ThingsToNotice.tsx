import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

interface Props {
  guidance: {
    observe_today?: string | null;
    mind_check?: string | null;
    emotional_check?: string | null;
    body_check?: string | null;
    micro_prompt?: string | null;
    felt_sense_opener?: string | null;
    self_inquiry?: string | null;
  } | null;
}

const DEFAULT_NOTICES = [
  "Notice the quality of your breath right now",
  "Notice when you reach for distraction",
  "Notice the tone of your inner voice",
  "Notice how your body feels in this moment",
  "Notice what you're avoiding",
];

export default function ThingsToNotice({ guidance }: Props) {
  const notices = [
    cleanText(guidance?.observe_today),
    cleanText(guidance?.mind_check),
    cleanText(guidance?.emotional_check),
    cleanText(guidance?.body_check),
    cleanText(guidance?.micro_prompt),
    cleanText(guidance?.felt_sense_opener),
    cleanText(guidance?.self_inquiry),
  ].filter(Boolean);

  const allNotices = notices.length > 0 ? notices : DEFAULT_NOTICES.slice(0, 4);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.14 }}
      aria-label="Things to notice"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/70 flex items-center gap-1.5">
        <Search className="h-3 w-3" aria-hidden />
        Things to notice
      </p>

      <ul className="mt-3 space-y-2" role="list">
        {allNotices.slice(0, 4).map((notice, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.05 }}
            className="flex items-start gap-3 text-[12.5px] leading-[1.6] text-foreground/75"
          >
            <Sparkles className="mt-1 flex-shrink-0 h-3.5 w-3.5 text-primary/40" aria-hidden />
            <span>{notice}</span>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}