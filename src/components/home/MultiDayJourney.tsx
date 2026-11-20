"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3, Calendar, Sparkles } from "lucide-react";

interface DayTheme {
  date: string;
  label: string;
  theme: {
    title?: string;
    description?: string;
    micro_practice?: { title?: string; duration_min?: number } | null;
    affirmation?: string;
    focus_areas?: string[];
  } | null;
  isComposing: boolean;
  isToday: boolean;
}

interface MultiDayJourneyProps {
  dayThemes: DayTheme[];
  onStartSession: () => void;
  onNavigateToDay: (date: string) => void;
  regenerating: boolean;
  journeyDay: number;
}

export default function MultiDayJourney({
  dayThemes,
  onStartSession,
  onNavigateToDay,
  regenerating,
  journeyDay,
}: MultiDayJourneyProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="multi-day-journey" className="space-y-6 border-t border-border/60 pt-7">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-[9px] uppercase tracking-[0.28em] text-primary/65">
          Your journey · next {dayThemes.length} days
        </p>
      </motion.div>

      <div className="space-y-4" role="list" aria-label="Upcoming journey days">
        {dayThemes.map((day, index) => (
          <motion.article
            key={day.date}
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1), ease: [0.16, 1, 0.3, 1] }}
            className={`relative group rounded-2xl border p-5 transition-all ${
              day.isToday
                ? 'border-primary/30 bg-gradient-to-br from-primary/[0.05] to-transparent'
                : 'border-border/60 bg-foreground/[0.02] hover:border-primary/15'
            }`}
            role="listitem"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-primary/65">
                    {day.label}
                  </span>
                  {day.isToday && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[8px] font-medium text-accent">
                      <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                      Active
                    </span>
                  )}
                  {day.isComposing && !day.isToday && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--gold-700))]/15 px-2 py-0.5 text-[8px] font-medium text-primary/80">
                      <span className="relative h-2.5 w-2.5" aria-hidden="true">
                        <span className="absolute inset-0 h-2.5 w-2.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      </span>
                      Preparing
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-light leading-tight text-foreground line-clamp-2" style={{ fontFamily: "var(--font-editorial)" }}>
                  {day.isComposing
                    ? day.theme?.title || `${day.label}'s journey is being composed…`
                    : day.theme?.title || 'A path waiting to unfold'}
                </h3>

                {!day.isComposing && day.theme?.description && (
                  <motion.p
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mt-2 text-sm leading-6 text-foreground/70 line-clamp-2"
                  >
                    {day.theme.description}
                  </motion.p>
                )}

                {!day.isComposing && day.theme?.micro_practice?.title && (
                  <motion.p
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground"
                  >
                    <Clock3 className="h-3.5 w-3.5 text-primary/75" aria-hidden="true" />
                    <span>{day.theme.micro_practice.title}</span>
                    {day.theme.micro_practice.duration_min && (
                      <> · {day.theme.micro_practice.duration_min} min</>
                    )}
                  </motion.p>
                )}

                {!day.isComposing && day.theme?.affirmation && (
                  <motion.p
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mt-3 text-[11px] italic text-primary/70 leading-5"
                  >
                    "{day.theme.affirmation}"
                  </motion.p>
                )}

                {!day.isComposing && day.theme?.focus_areas?.length && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="mt-3 flex flex-wrap gap-1.5"
                  >
                    {day.theme.focus_areas.slice(0, 3).map((area, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-border/70 bg-foreground/[0.03] px-2 py-0.5 text-[9px] text-muted-foreground/80"
                      >
                        {area}
                      </span>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  type="button"
                  disabled={day.isComposing || regenerating}
                  onClick={() => onNavigateToDay(day.date)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-medium transition ${
                    day.isToday
                      ? 'border-primary/30 bg-primary/[0.08] text-accent hover:bg-primary/[0.14]'
                      : 'border-border/70 bg-foreground/[0.03] text-muted-foreground hover:border-primary/25 hover:text-foreground'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-disabled={day.isComposing || regenerating}
                >
                  {day.isComposing ? (
                    <>
                      <span className="relative h-3.5 w-3.5" aria-hidden="true">
                        <span className="absolute inset-0 h-3.5 w-3.5 rounded-full border-1.5 border-primary/30 border-t-primary animate-spin" />
                      </span>
                      Preparing…
                    </>
                  ) : day.isToday ? (
                    <>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      View
                    </>
                  )}
                </button>

                {!day.isToday && !day.isComposing && (
                  <button
                    type="button"
                    onClick={() => onNavigateToDay(day.date)}
                    className="text-[10px] text-muted-foreground/60 hover:text-primary/80 transition"
                    aria-label={`View ${day.label}'s full journey`}
                  >
                    Tap to explore
                  </button>
                )}
              </div>
            </div>

            {!day.isComposing && day.isToday && (
              <motion.button
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                type="button"
                onClick={onStartSession}
                disabled={regenerating}
                className="mt-4 w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-5 text-xs text-accent transition hover:bg-primary/[0.14] disabled:cursor-wait disabled:opacity-60"
              >
                Continue your journey <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </motion.button>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}