"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PersonalEvolutionProps {
  totalSessions?: number;
  recentThemes?: string[];
  activeLoops?: string[];
  journeyDay: number;
  vLevel?: number;
}

export default function PersonalEvolution({ totalSessions = 0, recentThemes = [], activeLoops = [], journeyDay, vLevel }: PersonalEvolutionProps) {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const hasData = totalSessions > 0 || recentThemes.length > 0 || activeLoops.length > 0 || (vLevel !== undefined && vLevel > 0);

  if (!hasData) return null;

  const themesText = recentThemes.length
    ? `You've explored ${recentThemes.slice(0, 3).join(", ")}`
    : "";

  const loopsText = activeLoops.length
    ? `Patterns noticed: ${activeLoops.slice(0, 2).join(", ")}`
    : "";

  return (
    <section aria-labelledby="evolution-title" className="grid gap-10 md:grid-cols-[1fr_0.85fr]">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-[9px] uppercase tracking-[0.28em] text-primary/65">Continuity, without a scorecard</p>
        <h2 id="evolution-title" className="mt-1.5 text-2xl font-light tracking-wide text-foreground sm:text-3xl" style={{ fontFamily: "var(--font-editorial)" }}>What stays with you</h2>

        {themesText && (
          <div className="mt-5 border-l border-primary/30 pl-4">
            <p className="text-sm leading-7 text-foreground/70">{themesText}</p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55">Recurring themes in recent explorations</p>
          </div>
        )}

        {loopsText && (
          <div className="mt-5 border-l border-[#8B9C80]/30 pl-4">
            <p className="text-sm leading-7 text-foreground/70">{loopsText}</p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55">Active patterns from your consciousness profile</p>
          </div>
        )}

        {totalSessions && (
          <p className="mt-5 text-[10px] text-muted-foreground/65">{totalSessions} completed session{totalSessions === 1 ? "" : "s"} recorded in your journey.</p>
        )}
        {vLevel !== undefined && vLevel > 0 && (
          <p className="mt-2 text-[10px] text-muted-foreground/65">Current V-Level: <span className="text-primary/80">{vLevel}</span></p>
        )}

        <motion.button
          type="button"
          onClick={() => navigate("/app/constellation")}
          initial={reducedMotion ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs text-primary/80 transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Visit your constellation <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.button>
      </motion.div>
    </section>
  );
}