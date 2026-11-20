"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PresentJourneyProps {
  theme?: { title?: string; description?: string; inner_inquiry?: string; micro_practice?: { title?: string; duration_min?: number } | null } | null;
  themeLoading: boolean;
  themeError: boolean;
  onRetryTheme: () => void;
  onStartSession: () => void;
  onResumeSession: () => void;
  activeSession: boolean;
  regenerating: boolean;
  journeyDay: number;
}

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return /^(undefined|null|n\/?a|none|nan)$/i.test(text) ? "" : text;
}

export default function PresentJourney({
  theme,
  themeLoading,
  themeError,
  onRetryTheme,
  onStartSession,
  onResumeSession,
  activeSession,
  regenerating,
  journeyDay,
}: PresentJourneyProps) {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const inquiry = cleanText(theme?.inner_inquiry);
  const practiceTitle = cleanText(theme?.micro_practice?.title);

  return (
    <section aria-labelledby="journey-title" aria-busy={themeLoading} className="grid items-end gap-6 border-t border-white/[0.07] pt-7 sm:grid-cols-[1fr_auto] sm:pt-9">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-[9px] uppercase tracking-[0.28em] text-[#D6B36A]/65">Your present journey · day {journeyDay}</p>
        <h2 id="journey-title" className="mt-2 text-3xl font-light leading-tight text-[#E9E2D3] sm:text-4xl" style={{ fontFamily: "var(--font-editorial)" }}>
          {themeLoading ? (
            <span aria-hidden="true" className="mt-2 block h-8 w-64 max-w-full rounded-md bg-white/[0.07] motion-safe:animate-pulse" />
          ) : (
            theme?.title || "A path begins with presence"
          )}
        </h2>
        {themeError ? (
          <div className="mt-3 space-y-2">
            <p className="max-w-2xl text-sm leading-7 text-[#98958B]">Today's journey could not be loaded. Your progress is safe.</p>
            <button type="button" onClick={onRetryTheme} className="text-xs text-[#D6B36A] underline decoration-[#D6B36A]/30 underline-offset-4">Try again</button>
          </div>
        ) : (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 max-w-2xl text-sm leading-7 text-[#B9B5AA]"
          >
            {themeLoading ? " " : cleanText(theme?.description) || "When today's direction is ready, it will meet you here. There is no need to rush."}
          </motion.p>
        )}
        {practiceTitle && (
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 flex items-center gap-2 text-[11px] text-[#98958B]"
          >
            <Clock3 className="h-3.5 w-3.5 text-[#D6B36A]/75" aria-hidden="true" />
            {practiceTitle}{theme?.micro_practice?.duration_min ? ` · ${theme.micro_practice.duration_min} min` : ""}
          </motion.p>
        )}
      </motion.div>

      <motion.button
        initial={reducedMotion ? false : { opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        type="button"
        disabled={regenerating}
        onClick={activeSession ? onResumeSession : onStartSession}
        className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-[#D6B36A]/30 bg-[#D6B36A]/[0.08] px-5 text-xs text-[#F4D99A] transition hover:bg-[#D6B36A]/[0.14] disabled:cursor-wait disabled:opacity-60 sm:self-auto"
      >
        {activeSession ? "Return to session" : "Continue your journey"} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </motion.button>
      {themeLoading && <span role="status" className="sr-only">Loading today's journey</span>}
    </section>
  );
}