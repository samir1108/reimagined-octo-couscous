/**
 * FoundationIntro — replaces the old "Choose what matters most" goals picker.
 *
 * Conveys that the system has a deep foundation (80+ sessions, 33+ mirrors)
 * that will calibrate the user over time and teach them yoga — the ancient science.
 * No questions, no input. Pure cinematic reassurance.
 */
import { motion } from "framer-motion";

interface FoundationIntroProps {
  name?: string;
  onContinue: () => void;
}

const PILLARS = [
  { n: "80+", label: "Living sessions", sub: "to walk with you" },
  { n: "33+", label: "Mirrors", sub: "to reflect you back" },
  { n: "∞",   label: "Calibration",  sub: "tuned to you, daily" },
];

export default function FoundationIntro({ name, onContinue }: FoundationIntroProps) {
  return (
    <motion.div
      key="foundation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-primary/70 text-[11px] uppercase tracking-[0.4em] mb-4"
      >
        {name ? `For you, ${name}` : "For you"}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="font-display text-3xl sm:text-4xl text-foreground leading-tight tracking-tight mb-4"
      >
        A living foundation,<br />
        <span className="text-primary">tuned to you.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 px-2"
      >
        You don't need to choose what matters most today.
        We'll learn that — together — through every session and every mirror you meet.
      </motion.p>

      <div className="space-y-3 mb-8">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 + i * 0.2 }}
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-card/30 border border-border/40 text-left"
          >
            <div className="font-display text-2xl text-primary w-14 shrink-0">{p.n}</div>
            <div className="flex-1">
              <div className="text-foreground text-sm font-medium">{p.label}</div>
              <div className="text-muted-foreground/80 text-xs">{p.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}
        className="text-foreground/70 text-sm italic mb-8 px-3"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        "Yoga is the ancient science of meeting yourself.<br />
        We'll begin gently — and let the path reveal itself."
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }}
        onClick={onContinue}
        className="px-10 py-3.5 bg-primary text-primary-foreground rounded-full font-display tracking-wide hover:bg-primary/90 transition"
      >
        Begin
      </motion.button>
    </motion.div>
  );
}
