import { type ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bird, ScrollText, Sparkles, Flame, BookOpen, PenLine, BarChart3, Compass, Library } from 'lucide-react';
import { OversoulOrbEmbed } from '@/components/OversoulOrb';
import DesktopHomeRails from '@/components/home/DesktopHomeRails';
import { useThemeOfDay } from '@/hooks/useThemeOfDay';
import { useKarma } from '@/hooks/useKarma';
import { useConsciousnessEngine } from '@/hooks/useConsciousnessEngine';
import { getCurrentTimeSlot } from '@/lib/timeSlots';
import type { Session } from '@/types/database';
import { cn } from '@/lib/utils';

interface SanctuaryContextValue {
  userName: string;
  journeyDay: number;
  streak: number;
  karmaPoints: number | undefined;
  karmaTier: string | undefined;
  karmaToNext: number | undefined;
  lastSummary: string;
  regenerating: boolean;
  activeSession: boolean;
  onStartSession: () => void;
  onResumeSession: () => void;
  onEnterGate: (gate: string) => void;
}

const SanctuaryContext = createContext<SanctuaryContextValue | null>(null);

function useSanctuary() {
  const context = useContext(SanctuaryContext);
  if (!context) {
    throw new Error('useSanctuary must be used within a SanctuaryProvider');
  }
  return context;
}

interface SanctuaryProviderProps {
  children: ReactNode;
  userName: string;
  journeyDay: number;
  streak: number;
  karmaPoints: number | undefined;
  karmaTier: string | undefined;
  karmaToNext: number | undefined;
  lastSummary: string;
  regenerating: boolean;
  activeSession: boolean;
  onStartSession: () => void;
  onResumeSession: () => void;
  onEnterGate: (gate: string) => void;
}

function SanctuaryProvider({
  children,
  userName,
  journeyDay,
  streak,
  karmaPoints,
  karmaTier,
  karmaToNext,
  lastSummary,
  regenerating,
  activeSession,
  onStartSession,
  onResumeSession,
  onEnterGate,
}: SanctuaryProviderProps) {
  return (
    <SanctuaryContext.Provider
      value={{
        userName,
        journeyDay,
        streak,
        karmaPoints,
        karmaTier,
        karmaToNext,
        lastSummary,
        regenerating,
        activeSession,
        onStartSession,
        onResumeSession,
        onEnterGate,
      }}
    >
      {children}
    </SanctuaryContext.Provider>
  );
}

interface OrbProps {
  currentGate: string;
  onActivate: () => void;
  onHold: () => void;
  onTriple: () => void;
}

function Orb({ currentGate, onActivate, onHold, onTriple }: OrbProps) {
  return (
    <div className="w-full flex justify-center">
      <OversoulOrbEmbed
        currentGate={currentGate}
        onActivate={onActivate}
        onHold={onHold}
        onTriple={onTriple}
      />
    </div>
  );
}

interface ThemeCardProps {
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
  journeyDay: number;
  onRetryTheme: () => void;
}

function ThemeCard({ theme, themeLoading, themeError, journeyDay, onRetryTheme }: ThemeCardProps) {
  const { data: themeData } = useThemeOfDay();

  if (themeLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-background/30 backdrop-blur-md border border-border/30 rounded-3xl p-6 md:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="animate-pulse h-6 w-32 bg-muted rounded" />
          <div className="animate-pulse h-4 w-20 bg-muted rounded ml-auto" />
        </div>
        <div className="mt-6 h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="mt-3 h-4 w-1/2 bg-muted rounded animate-pulse" />
      </motion.div>
    );
  }

  if (themeError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
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
    );
  }

  if (!theme) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl relative"
    >
      <div className="glass-1 p-6 md:p-8 relative overflow-hidden">
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
              <p className="text-sm text-muted-foreground mt-1">Day {journeyDay} · {(themeData as any)?.guruName || "Your Guide"}</p>
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
  );
}

interface SessionPlanCardProps {
  plan: {
    journeyDay?: number;
    vLevel?: number;
    title?: string;
    [key: string]: unknown;
  } | null;
}

function SessionPlanCard({ plan }: SessionPlanCardProps) {
  if (!plan) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl glass-1 p-6"
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
        {plan.title || "A personalized session awaits"}
      </p>
    </motion.div>
  );
}

interface LastSittingProps {
  lastSummary: string;
}

function LastSitting({ lastSummary }: LastSittingProps) {
  if (!lastSummary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-2xl glass-1 p-6"
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
  );
}

interface KarmaProgressProps {
  karmaPoints: number | undefined;
  karmaTier: string | undefined;
  karmaToNext: number | undefined;
}

function KarmaProgress({ karmaPoints, karmaTier, karmaToNext }: KarmaProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-2xl grid grid-cols-3 gap-4"
    >
      <div className="glass-1 p-4 text-center">
        <p className="text-2xl font-display font-bold text-foreground">{karmaPoints ?? 0}</p>
        <p className="text-xs text-muted-foreground mt-1">Karma Points</p>
      </div>
      <div className="glass-1 p-4 text-center">
        <p className="text-2xl font-display font-bold text-foreground">{karmaTier || "Seeker"}</p>
        <p className="text-xs text-muted-foreground mt-1">Tier</p>
      </div>
      <div className="glass-1 p-4 text-center">
        <p className="text-2xl font-display font-bold text-foreground">{karmaToNext ?? 0}</p>
        <p className="text-xs text-muted-foreground mt-1">To Next Tier</p>
      </div>
    </motion.div>
  );
}

interface GatesSectionProps {
  onEnterGate: (gate: string) => void;
}

function GatesSection({ onEnterGate }: GatesSectionProps) {
  const { data: engineData } = useConsciousnessEngine(getCurrentTimeSlot());
  const gates = ['morning', 'midday', 'evening', 'night'] as const;
  const gateLabels = {
    morning: 'Morning Gate',
    midday: 'Midday Gate',
    evening: 'Evening Gate',
    night: 'Night Gate',
  };
  const gateIcons = {
    morning: <Flame className="h-4 w-4" />,
    midday: <BookOpen className="h-4 w-4" />,
    evening: <PenLine className="h-4 w-4" />,
    night: <BarChart3 className="h-4 w-4" />,
  };

  return (
    <div className="w-full max-w-2xl">
      <h3 className="font-display font-medium text-lg text-foreground mb-4">Gates</h3>
      <div className="grid grid-cols-2 gap-3">
        {gates.map((gate) => (
          <motion.button
            key={gate}
            onClick={() => onEnterGate(gate)}
            className="glass-1 p-4 flex flex-col items-center gap-2 text-left transition-all hover:glass-2"
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              {gateIcons[gate]}
            </div>
            <span className="font-body text-sm font-medium text-foreground">{gateLabels[gate]}</span>
            <span className="text-xs text-muted-foreground">Tap to enter</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

interface QuickActionsProps {
  onStartSession: () => void;
  onResumeSession: () => void;
  activeSession: boolean;
}

function QuickActions({ onStartSession, onResumeSession, activeSession }: QuickActionsProps) {
  return (
    <div className="w-full max-w-2xl grid grid-cols-2 gap-3">
      <motion.button
        onClick={onStartSession}
        disabled={activeSession}
        className="glass-1 p-4 flex flex-col items-center gap-2 transition-all hover:glass-2 disabled:opacity-50 disabled:pointer-events-none"
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Flame className="h-4 w-4" />
        </div>
        <span className="font-body text-sm font-medium text-foreground">
          {activeSession ? 'Session Active' : 'Begin Session'}
        </span>
      </motion.button>
      <motion.button
        onClick={onResumeSession}
        disabled={!activeSession}
        className="glass-1 p-4 flex flex-col items-center gap-2 transition-all hover:glass-2 disabled:opacity-50 disabled:pointer-events-none"
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <BookOpen className="h-4 w-4" />
        </div>
        <span className="font-body text-sm font-medium text-foreground">Resume</span>
      </motion.button>
    </div>
  );
}

interface SanctuaryRootProps {
  userName: string;
  journeyDay: number;
  streak: number;
  karmaPoints: number | undefined;
  karmaTier: string | undefined;
  karmaToNext: number | undefined;
  lastSummary: string;
  regenerating: boolean;
  activeSession: boolean;
  onStartSession: () => void;
  onResumeSession: () => void;
  onEnterGate: (gate: string) => void;
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
  plan: {
    journeyDay?: number;
    vLevel?: number;
    title?: string;
    [key: string]: unknown;
  } | null;
  profile: {
    overall_band?: number;
    witness_depth?: number;
    active_loops?: string[];
    assessment_data?: any;
    streak_current?: number;
    display_name?: string;
    user_id?: string;
  } | null;
  wakeTime?: string;
  sleepTime?: string;
}

function SanctuaryRoot({
  userName,
  journeyDay,
  streak,
  karmaPoints,
  karmaTier,
  karmaToNext,
  lastSummary,
  regenerating,
  activeSession,
  onStartSession,
  onResumeSession,
  onEnterGate,
  theme,
  themeLoading,
  themeError,
  onRetryTheme,
  plan,
  profile,
  wakeTime,
  sleepTime,
}: SanctuaryRootProps) {
  const { data: engineData } = useConsciousnessEngine(getCurrentTimeSlot());
  const currentGate = (engineData as any)?.currentGate || 'morning';

  return (
    <SanctuaryProvider
      userName={userName}
      journeyDay={journeyDay}
      streak={streak}
      karmaPoints={karmaPoints}
      karmaTier={karmaTier}
      karmaToNext={karmaToNext}
      lastSummary={lastSummary}
      regenerating={regenerating}
      activeSession={activeSession}
      onStartSession={onStartSession}
      onResumeSession={onResumeSession}
      onEnterGate={onEnterGate}
    >
      <div className="relative min-h-screen flex flex-col">
        <main className="flex-1 w-full max-w-5xl mx-auto px-gutter md:px-gutter-lg py-section md:py-section-lg relative z-10">
          <div className="flex flex-col items-center gap-6 md:gap-10">
            <Orb
              currentGate={currentGate}
              onActivate={onStartSession}
              onHold={onStartSession}
              onTriple={() => {}}
            />

            <ThemeCard
              theme={theme}
              themeLoading={themeLoading}
              themeError={themeError}
              journeyDay={journeyDay}
              onRetryTheme={onRetryTheme}
            />

            <SessionPlanCard plan={plan} />

            <LastSitting lastSummary={lastSummary} />

            <KarmaProgress
              karmaPoints={karmaPoints}
              karmaTier={karmaTier}
              karmaToNext={karmaToNext}
            />

            <QuickActions
              onStartSession={onStartSession}
              onResumeSession={onResumeSession}
              activeSession={activeSession}
            />

            <GatesSection onEnterGate={onEnterGate} />

            <DesktopHomeRails
              streak={streak}
              journeyDay={journeyDay}
              profile={profile}
            />
          </div>
        </main>
      </div>
    </SanctuaryProvider>
  );
}

export const Sanctuary = Object.assign(SanctuaryRoot, {
  Orb,
  ThemeCard,
  SessionPlanCard,
  LastSitting,
  KarmaProgress,
  GatesSection,
  QuickActions,
  Provider: SanctuaryProvider,
  useSanctuary,
});