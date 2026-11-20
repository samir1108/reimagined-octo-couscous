import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";

interface Props {
  prompt: string;
  disabled?: boolean;
  onCommit: (intention: string) => void;
}

const SUGGESTIONS = [
  "I will pause before reacting today.",
  "I will breathe before I speak.",
  "I will meet today with softness.",
];

/** Seed-intention input for Act 5. Saved as today's sankalpa. */
export default function SankalpaInput({ prompt, disabled, onCommit }: Props) {
  const [text, setText] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-[85%] rounded-2xl bg-gradient-to-b from-primary/15 to-card/30 border border-primary/40 px-4 py-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sprout className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary/80">
          Today's seed
        </p>
      </div>
      <p className="text-foreground/85 text-sm leading-relaxed mb-3">{prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Plant your intention…"
        rows={2}
        disabled={disabled}
        className="w-full bg-card/50 border border-border/40 rounded-xl px-3 py-2 text-foreground/90 placeholder:text-muted-foreground/50 text-[14px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 mb-2"
      />
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setText(s)}
            disabled={disabled}
            className="text-[11px] px-2.5 py-1 rounded-full bg-card/40 border border-border/40 text-muted-foreground/85 hover:text-foreground hover:border-primary/40 transition disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
      <button
        onClick={() => text.trim() && onCommit(text.trim())}
        disabled={!text.trim() || disabled}
        className="w-full rounded-full px-4 py-2.5 text-sm font-display bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Plant the seed
      </button>
    </motion.div>
  );
}
