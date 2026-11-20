/**
 * PresenceMoment — the gate's presence card, made tappable.
 *
 * The consciousness engine already computes a per-state presence prompt
 * (`plan.presenceCard`) — this surfaces it as the day's "right now" moment.
 * Taking the moment is a local, honest ritual (no karma, no ledger): it is
 * kept for the current gate in localStorage and resets when the gate turns.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Hand } from "lucide-react";
import { getCurrentGate, getGateDef } from "@/lib/consciousness/dailyGates";
import { hapticBreath } from "@/lib/haptics";
import { playSoundEffect } from "@/lib/soundEffects";

const EASE = [0.16, 1, 0.3, 1] as const;

const todayKey = () => new Date().toISOString().split("T")[0];

function readKeptGate(): string | null {
  try {
    return localStorage.getItem(`presence-kept-${todayKey()}`);
  } catch {
    return null;
  }
}

interface PresenceCard {
  prompt: string;
  type: string;
}

interface Props {
  card: PresenceCard | null;
}

export default function PresenceMoment({ card }: Props) {
  const gate = getCurrentGate(new Date().getHours());
  const gateDef = getGateDef(gate);
  const [keptGate, setKeptGate] = useState<string | null>(readKeptGate);

  if (!card?.prompt) return null;

  const kept = keptGate === gate;

  const takeMoment = () => {
    if (kept) return;
    hapticBreath();
    playSoundEffect("threshold");
    try {
      localStorage.setItem(`presence-kept-${todayKey()}`, gate);
    } catch {
      /* storage unavailable — the moment is kept in memory only */
    }
    setKeptGate(gate);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
      aria-label="Presence"
      className="w-full max-w-md mx-auto rounded-2xl border border-border/30 bg-card/40 px-5 py-4 text-center"
    >
      <p
        className="text-[9px] font-display tracking-[0.28em] uppercase"
        style={{ color: `hsl(${gateDef.accentColor} / 0.8)` }}
      >
        The moment · {gateDef.theme}
      </p>

      <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-[1.65] text-foreground/85">
        {card.prompt}
      </p>

      <div className="mt-3">
        {kept ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-1 text-[9px] font-display tracking-[0.18em] uppercase text-emerald-200/80">
            <Check className="h-2.5 w-2.5" aria-hidden />
            Moment taken
          </span>
        ) : (
          <button
            type="button"
            onClick={takeMoment}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-[9px] font-display tracking-[0.2em] uppercase text-primary/90 hover:bg-primary/20 transition-colors"
          >
            <Hand className="h-2.5 w-2.5" aria-hidden />
            I took this moment
          </button>
        )}
      </div>
    </motion.section>
  );
}
