"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Brain, Waves, Sparkles, Heart, Eye, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EXPLORATIONS = [
  { label: "Thoughts", Icon: Brain, prompt: "Explore thoughts with curiosity, without assuming what I am thinking." },
  { label: "Emotions", Icon: Waves, prompt: "Help me explore emotions through direct, present-moment attention." },
  { label: "Reactions", Icon: Sparkles, prompt: "Help me notice how reactions unfold, without judging or diagnosing them." },
  { label: "Relationships", Icon: Heart, prompt: "Explore awareness in relationships, grounded in what I choose to share." },
  { label: "Attention", Icon: Eye, prompt: "Explore attention and the experience of noticing." },
  { label: "Sense of self", Icon: Compass, prompt: "Explore the sense of self through gentle inquiry, without presuming an answer." },
] as const;

interface InnerExplorerProps {
  onExplore: (prompt: string) => void;
}

export default function InnerExplorer({ onExplore }: InnerExplorerProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="explorer-title">
      <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[9px] uppercase tracking-[0.28em] text-[#D6B36A]/65">The inner explorer</p>
          <h2 id="explorer-title" className="mt-1.5 text-2xl font-light tracking-wide text-[#E9E2D3] sm:text-3xl" style={{ fontFamily: "var(--font-editorial)" }}>Where would you like to look?</h2>
          <p className="mt-3 max-w-sm text-sm leading-7 text-[#98958B]">Choose a doorway. Your guide will begin with what you want to explore, not an assumption about what you feel.</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EXPLORATIONS.map(({ label, Icon, prompt }, index) => (
            <motion.button
              key={label}
              type="button"
              onClick={() => onExplore(prompt)}
              initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: reducedMotion ? 0 : index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="group flex min-h-16 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 text-left transition hover:border-[#D6B36A]/25 hover:bg-[#D6B36A]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B36A]"
            >
              <Icon className="h-4 w-4 shrink-0 text-[#D6B36A]/65 transition group-hover:text-[#F4D99A]" aria-hidden="true" />
              <span className="text-xs text-[#D5D0C4]">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}