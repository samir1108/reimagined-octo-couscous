import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTodayAnniversaries } from "@/hooks/useLifeEvents";

const TONE_BY_TYPE: Record<string, string> = {
  loss: "Aaj woh din hai. Main yaad rakhta hoon. Tu kaisa hai?",
  birthday: "Aaj koi khaas din hai — yaad?",
  anniversary: "Saal beet gaye. Aaj rukne ka din hai.",
  wedding: "Aaj ka din kuch keh raha hai.",
  diagnosis: "Aaj woh din hai jab sab kuch badal gaya tha.",
  milestone: "Aaj ek mod ka din hai.",
  default: "Aaj ka din kuch yaad dilata hai.",
};

/**
 * Pillar 3: Life Event Anniversary Card.
 * Surfaces the highest-weight recurring event from this same calendar day.
 * Quiet, sacred, never demanding — simply: "I remember."
 */
export default function LifeAnniversaryCard() {
  const { data: anniversaries } = useTodayAnniversaries();
  const top = anniversaries?.[0];
  if (!top) return null;

  const tone = TONE_BY_TYPE[top.event_type] ?? TONE_BY_TYPE.default;
  const yrs = top.years_ago;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto mb-3 px-2"
    >
      <Link
        to="/life-legacy"
        className="block rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-500/8 via-background/30 to-transparent backdrop-blur-sm px-5 py-4 hover:border-rose-400/35 transition-colors"
      >
        <p className="text-[9px] tracking-[0.3em] uppercase text-rose-400/80 mb-1.5">
          {yrs >= 1 ? `${yrs} year${yrs >= 2 ? "s" : ""} ago today` : "On this day"}
        </p>
        <p className="text-sm font-display text-foreground/90 leading-snug">{top.title}</p>
        <p className="text-xs italic text-foreground/60 mt-1.5">{tone}</p>
      </Link>
    </motion.div>
  );
}
