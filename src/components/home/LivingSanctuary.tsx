/**
 * LivingSanctuary — the living, breathing container for the daily home experience.
 * Wraps the orb, theme, sessions, and all home-page sections into one cohesive space.
 * Pure presentational — consumes props only, no data fetching.
 */
import { motion, useReducedMotion } from "framer-motion";
import { Children, type ReactNode } from "react";
import { Bird, ScrollText, Sparkles } from "lucide-react";
import { OversoulOrbEmbed } from "@/components/OversoulOrb";
import DesktopHomeRails from "./DesktopHomeRails";
import { CountUp } from "@/design-system";

interface LivingSanctuaryProps {
  orb: ReactNode;
  userName: string;
  theme: {
    title?: string;
    description?: string;
    micro_practice?: { title?: string; description?: string; duration_min?: number };
    inner_inquiry?: string;
    engagement_question?: string;
    felt_sense_opener?: string;
    resistance_warning?: string;
  } | null;
  themeLoading: boolean;
  themeError: boolean;
  onRetryTheme: () => void;
  onStartSession: () => void;
  onResumeSession: () => void;
  activeSession: boolean;
  journeyDay: number;
  streak: number;
  plan: {
    journeyDay?: number;
    vLevel?: number;
    [key: string]: unknown;
  } | null;
  profile: {
    overall_band?: number;
    witness_depth?: number;
    active_loops?: string[];
    assessment_data?: Record<string, unknown>;
    streak_current?: number;
    display_name?: string;
    user_id?: string;
  } | null;
  karmaPoints: number | undefined;
  karmaTier: string | undefined;
  karmaToNext: number | undefined;
  lastSummary: string;
  regenerating: boolean;
  wakeTime?: string;
  sleepTime?: string;
  onEnterGate: (gate: string) => void;
  guruName?: string;
  pullRef?: React.RefObject<HTMLElement>;
  isPulling?: boolean;
  isRefreshing?: boolean;
  pullProgress?: number;
}

export default function LivingSanctuary({
  orb,
  userName,
  theme,
  themeLoading,
  themeError,
  onRetryTheme,
  onStartSession,
  onResumeSession,
  activeSession,
  journeyDay,
  streak,
  plan,
  profile,
  karmaPoints,
  karmaTier,
  karmaToNext,
  lastSummary,
  regenerating,
  wakeTime,
  sleepTime,
  onEnterGate,
  guruName,
  pullRef,
  isPulling,
  isRefreshing,
  pullProgress,
}: LivingSanctuaryProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen flex flex-col">

      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center h-16 pointer-events-none"
          style={{ transform: `translate(-50%, ${Math.min(pullProgress || 0, 1) * 60}px)` }}
        >
          <div className="flex items-center gap-2 text-muted-foreground/60">
            <div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
              style={{
                animationDuration: reducedMotion ? "0s" : "1s",
                opacity: isRefreshing ? 1 : pullProgress || 0,
              }}
            />
            <span className="text-xs font-medium">
              {isRefreshing ? "Refreshing…" : pullProgress && pullProgress > 0.5 ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        </div>
      )}

      <main
        ref={pullRef}
        className="flex-1 w-full max-w-5xl mx-auto px-gutter md:px-gutter-lg py-section md:py-section-lg relative z-10"
      >
        <div className="flex flex-col items-center gap-6 md:gap-10">
          {/* The Orb — central activation point */}
          <div className="w-full flex justify-center">
            {orb}
          </div>

          {/* Theme Card */}
          {themeLoading ? (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-background/30 backdrop-blur-md border border-border/30 rounded-3xl p-6 md:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="animate-pulse h-6 w-32 bg-muted rounded" />
                <div className="animate-pulse h-4 w-20 bg-muted rounded ml-auto" />
              </div>
              <div className="mt-6 h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="mt-3 h-4 w-1/2 bg-muted rounded animate-pulse" />
            </motion.div>
          ) : themeError ? (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-destructive/10 border border-destructive/30 rounded-3xl p-6 md:p-8 text-center"
            >
              <p className="text-destructive mb-4">Unable to load today's theme</p>
              <button
                onClick={onRetryTheme}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors"
              >
                Try again
              </button>
            </motion.div>
          ) : theme ? (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 20, scale: 0.98 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
              transition={reducedMotion ? {} : { duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-2xl relative"
            >
              <div className="bg-background/30 backdrop-blur-md border border-border/30 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
                <div className="relative z-10">
<div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bird className="text-primary h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-medium text-foreground">
                {theme.title || "Today's Theme"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Day {journeyDay} · {guruName || "Your Guide"}</p>
            </div>
          </div>
                  <p className="text-foreground/80 leading-relaxed">{theme.description}</p>
                  {theme.micro_practice && (
                    <div className="mt-6 pt-4 border-t border-border/30">
                      <p className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground mb-2">
                        Micro Practice
                      </p>
                      <p className="font-medium text-foreground">{theme.micro_practice.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{theme.micro_practice.description}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        ~{theme.micro_practice.duration_min} min
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}

          {/* Session Plan / Progress */}
          {plan ? (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={reducedMotion ? {} : { delay: 0.2 }}
              className="w-full max-w-2xl bg-background/30 backdrop-blur-md border border-border/30 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <ScrollText className="text-primary text-sm" aria-hidden="true" />
                </div>
                <h3 className="font-display font-medium text-lg text-foreground">
                  Today's Practice Plan
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {(plan as any)?.title || "A personalized session awaits"}
              </p>
            </motion.div>
          ) : null}

          {/* Last Session Summary */}
          {lastSummary ? (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={reducedMotion ? {} : { delay: 0.3 }}
              className="w-full max-w-2xl bg-background/30 backdrop-blur-md border border-border/30 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-amber/20 flex items-center justify-center">
                  <Sparkles className="text-amber text-sm" aria-hidden="true" />
                </div>
                <h3 className="font-display font-medium text-lg text-foreground">
                  Last Sitting
                </h3>
              </div>
              <p className="text-sm text-foreground/80 italic">"{lastSummary}"</p>
            </motion.div>
          ) : !themeLoading && !theme && !regenerating ? (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={reducedMotion ? {} : { delay: 0.3 }}
              className="w-full max-w-2xl bg-background/30 backdrop-blur-md border border-border/30 rounded-3xl p-6 text-center"
            >
              <Bird className="mx-auto text-muted-foreground/40 h-10 w-10" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">No sitting yet today</p>
              <p className="mt-1 text-xs text-muted-foreground/70">Your first session will appear here</p>
            </motion.div>
          ) : null}

          {/* Karma & Progress Indicators */}
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={reducedMotion ? {} : { delay: 0.4 }}
            className="w-full max-w-2xl grid grid-cols-3 gap-4"
          >
            <div className="bg-background/30 backdrop-blur-md border border-border/30 rounded-2xl p-4 text-center">
              <CountUp end={karmaPoints ?? 0} duration={reducedMotion ? 0 : 1.2} className="text-2xl font-display font-bold text-foreground" />
              <p className="text-xs text-muted-foreground mt-1">Karma Points</p>
            </div>
            <div className="bg-background/30 backdrop-blur-md border border-border/30 rounded-2xl p-4 text-center">
              <p className="text-2xl font-display font-bold text-foreground">{karmaTier || "Seeker"}</p>
              <p className="text-xs text-muted-foreground mt-1">Tier</p>
            </div>
            <div className="bg-background/30 backdrop-blur-md border border-border/30 rounded-2xl p-4 text-center">
              <CountUp end={karmaToNext ?? 0} duration={reducedMotion ? 0 : 1.2} className="text-2xl font-display font-bold text-foreground" />
              <p className="text-xs text-muted-foreground mt-1">To Next Tier</p>
            </div>
          </motion.div>

          {/* Desktop Rails */}
          <DesktopHomeRails
            streak={streak}
            journeyDay={journeyDay}
            profile={profile}
            guruName={guruName}
          />
        </div>
      </main>
    </div>
  );
}