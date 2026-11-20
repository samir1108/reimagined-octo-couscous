/**
 * PathPicker — two onboarding paths.
 *
 * Quick: 4 questions → band → start journey, with mirrors available on Home.
 * Deep:  no questions, the 80+ session Foundation course + 100 mirrors calibrate.
 */
import { motion } from "framer-motion";
import { Sparkles, Mountain } from "lucide-react";

interface Props {
  name: string;
  onPick: (path: "quick" | "deep") => void;
}

export default function PathPicker({ name, onPick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] mb-3">
        {name ? `${name}, choose your beginning` : "Choose your beginning"}
      </p>
      <h2 className="font-display text-2xl text-foreground mb-8 leading-snug">
        Two ways to start.<br />Both lead inward.
      </h2>

      <div className="grid gap-4">
        <button
          onClick={() => onPick("quick")}
          className="group text-left p-5 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-primary/50 transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-display text-base text-foreground">Quick start</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Answer 4 questions. We estimate your starting band and begin.
            You can deepen anytime through the Mirrors on your home.
          </p>
        </button>

        <button
          onClick={() => onPick("deep")}
          className="group text-left p-5 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-primary/50 transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <Mountain className="w-4 h-4 text-primary" />
            <h3 className="font-display text-base text-foreground">Deep calibration</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No self-assessment. Walk through 80+ guided sessions and 100 mirrors —
            the engine learns who you are as you go.
          </p>
        </button>
      </div>
    </motion.div>
  );
}
