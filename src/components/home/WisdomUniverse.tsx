"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface WisdomUniverseProps {
  question?: string;
  perspectives?: { label: string; source: string; perspective: string }[];
}

const DEFAULT_QUESTION = "Who is the one noticing the thought?";

const DEFAULT_PERSPECTIVES = [
  { label: "Yoga philosophy", source: "Patañjali, Yoga Sūtra 1.2–1.3", perspective: "Explore the distinction between mental activity and the seer." },
  { label: "Buddhist philosophy", source: "Satipaṭṭhāna Sutta, contemplation of mind", perspective: "Explore observing states of mind as experiences that arise and pass." },
];

export default function WisdomUniverse({ question, perspectives }: WisdomUniverseProps) {
  const reducedMotion = useReducedMotion();
  const q = question || DEFAULT_QUESTION;
  const items = perspectives?.length ? perspectives : DEFAULT_PERSPECTIVES;

  return (
    <section aria-labelledby="wisdom-title" className="relative overflow-hidden border-y border-[#D6B36A]/10 py-8 sm:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-5 w-5 text-[#D6B36A]/65" aria-hidden="true" />
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#98958B]/65">A question to sit with</p>
        </div>
        <motion.h2
          id="wisdom-title"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl font-light leading-snug text-[#E9E2D3] sm:text-4xl"
          style={{ fontFamily: "var(--font-editorial)" }}
        >
          {q}
        </motion.h2>
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex flex-wrap gap-2"
          role="list"
          aria-label="Perspectives on this question"
        >
          {items.map((p, i) => (
            <motion.span
              key={p.label}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: reducedMotion ? 0 : 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.015] px-3 py-1.5 text-[10px] text-[#98958B] transition hover:border-[#D6B36A]/25 hover:bg-[#D6B36A]/[0.04] hover:text-[#D5D0C4]"
              role="listitem"
            >
              <BookOpen className="h-3 w-3 text-[#D6B36A]/50" aria-hidden="true" />
              <span className="text-[#D6B36A]/70 font-medium">{p.label}</span>
              <span className="text-[#98958B]/40">—</span>
              <span className="max-w-[240px]">{p.perspective}</span>
              <span className="text-[#98958B]/40">·</span>
              <span className="max-w-[200px] truncate">{p.source}</span>
            </motion.span>
          ))}
        </motion.div>
        <motion.p
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 text-[10px] text-[#98958B]/60"
        >
          These are brief paraphrases for reflection, not direct quotations.
        </motion.p>
      </div>
    </section>
  );
}