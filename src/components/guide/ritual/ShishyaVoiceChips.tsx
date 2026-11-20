import { motion } from "framer-motion";

interface Props {
  disabled?: boolean;
  onPick: (text: string) => void;
}

const REPLIES = [
  { label: "I feel this", emoji: "🌿" },
  { label: "I resist this", emoji: "🪨" },
  { label: "Tell me more", emoji: "🪔" },
];

/** Quick-reply chips for Act 3 — gives the shishya their voice mid-teaching. */
export default function ShishyaVoiceChips({ disabled, onPick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="mt-3 flex flex-wrap gap-2 max-w-[85%]"
    >
      {REPLIES.map((r) => (
        <button
          key={r.label}
          onClick={() => onPick(r.label)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card/50 border border-border/50 text-foreground/85 text-[13px] hover:bg-primary/15 hover:border-primary/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{r.emoji}</span>
          <span>{r.label}</span>
        </button>
      ))}
    </motion.div>
  );
}
