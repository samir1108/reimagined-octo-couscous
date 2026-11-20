/**
 * NextSessionCard — Soft "Session N ready" banner shown above the orb
 * after a session completes. Theme-aware.
 */
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface NextSessionCardProps {
  sessionNumber: number;
  hint?: string;
  onStart?: () => void;
}

export default function NextSessionCard({ sessionNumber, hint, onStart }: NextSessionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onStart}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium tracking-wide hover:bg-primary/15 transition"
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>Session {sessionNumber} ready</span>
      {hint && <span className="text-muted-foreground/80 hidden sm:inline">· {hint}</span>}
    </motion.button>
  );
}
