/**
 * HOME — "The Daily Mission Control"
 * ============================================
 *
 * Karma (count) → Today's Theme (tap → full briefing) → Orb
 *
 * Orb gestures:
 *   Tap / multi-tap → the orb opens itself full screen, expanding from the
 *                     tapped circle into the pure-consciousness meditation
 *   Hold            → time-ask sheet (old system) — choose time & energy
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle, RefreshCw, Play, Moon,
} from "lucide-react";
import { useAuthReady } from "@/hooks/useAuthReady";
import { useKarma } from "@/hooks/useKarma";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { useUserTimeProfile } from "@/hooks/useUserTimeProfile";
import { getCurrentGateForSchedule, getCurrentTimeSlot } from "@/lib/timeSlots";
import { OversoulOrbEmbed } from "@/components/OversoulOrb";
import { GURUS } from "@/lib/guru-data";
import { useHomeOrb } from "@/hooks/useHomeOrb";
import { useHomeTheme } from "@/hooks/useHomeTheme";
import { useHomeSessions } from "@/hooks/useHomeSessions";
import { useHomeOverlays } from "@/hooks/useHomeOverlays";
import ThemeReasoning from "@/components/home/ThemeReasoning";
import { GateEntrySheet } from "@/components/home/GateEntrySheet";
import { TimeAskSheet } from "@/components/home/TimeAskSheet";
import GuideSessionOverlay from "@/components/guide/GuideSessionOverlay";
import SessionIntroCard from "@/components/sutra/SessionIntroCard";
import DesktopHomeRails from "@/components/home/DesktopHomeRails";
import TodaysPractice from "@/components/home/TodaysPractice";
import DailyTimetable from "@/components/home/DailyTimetable";
import TodayPack from "@/components/home/TodayPack";
import HomeLedger from "@/components/home/HomeLedger";
import TodayThemeSheet from "@/components/home/TodayThemeSheet";
import TodayThemeCard from "@/components/home/TodayThemeCard";
import PureConsciousnessMeditation from "@/components/home/PureConsciousnessMeditation";
import SessionOrbStage from "@/components/home/SessionOrbStage";
import LastSessionResultCard from "@/components/home/LastSessionResultCard";
import { clearLastSessionResult, loadTodaysSessionResult } from "@/lib/lastSessionResult";
import type { DayItemStartRequest } from "@/lib/dayPlan";
import { CountUp } from "@/design-system";
import { useDailyGates } from "@/hooks/useSpiritualDNA";
import { getSlotConfig } from "@/lib/timeSlots";

const ORB_COACH_KEY = "satyug-orb-coached-v1";

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();
  const { user, isReady } = useAuthReady();
  const firstRunIntroChecked = useRef(false);

  // First landing in the app: hand the user to the orb voice guide for the
  // three-stop introduction, once per account.
  useEffect(() => {
    if (!isReady || !user || firstRunIntroChecked.current) return;
    firstRunIntroChecked.current = true;
    const key = `consciousos-voice-intro-seen-${user.id}`;
    let seen = true;
    try {
      seen = localStorage.getItem(key) === "1";
    } catch {
      seen = true;
    }
    if (seen) return;
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* storage unavailable */
    }
    const timer = window.setTimeout(() => navigate("/app/guide/voice?intro=1"), 600);
    return () => window.clearTimeout(timer);
  }, [isReady, navigate, user]);

  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [meditationOpen, setMeditationOpen] = useState(false);
  // First-run affordance: the orb is the product's primary gesture, so it is
  // taught once, visibly, then gets out of the way for good.
  const [showOrbCoach, setShowOrbCoach] = useState(() => {
    try {
      return localStorage.getItem(ORB_COACH_KEY) !== "true";
    } catch {
      return false;
    }
  });
  const dismissOrbCoach = useCallback(() => {
    setShowOrbCoach(false);
    try {
      localStorage.setItem(ORB_COACH_KEY, "true");
    } catch {
      /* storage unavailable */
    }
  }, []);
  // Full-screen orb beat while the session is being composed.
  const [composing, setComposing] = useState(false);
  const [composingMinutes, setComposingMinutes] = useState(12);
  // Yesterday's receipt dissolves; only today's sitting is reflected back.
  const [lastResult, setLastResult] = useState(() => loadTodaysSessionResult());

  // Pull-to-refresh now actually refreshes every surface Home reads.
  const refreshAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["consciousness-engine"] }),
      queryClient.invalidateQueries({ queryKey: ["user-karma"] }),
      queryClient.invalidateQueries({ queryKey: ["user-credits"] }),
      queryClient.invalidateQueries({ queryKey: ["daily-gates"] }),
      queryClient.invalidateQueries({ queryKey: ["today-practice-pack"] }),
      queryClient.invalidateQueries({ queryKey: ["theme-of-day"] }),
    ]);
  }, [queryClient]);

  // Core Data
  const {
    data: engineData,
    isError: engineError,
    isFetching: engineFetching,
    refetch: refetchEngine,
  } = useConsciousnessEngine(getCurrentTimeSlot());
  const { data: karmaState, isLoading: karmaLoading } = useKarma();
  const profile = engineData?.profile;
  const { data: userTimeProfile } = useUserTimeProfile(profile?.user_id as string | undefined);

  // Active Guru
  const activeGuru = useMemo(() => {
    const themeGuruName = (engineData as any)?.guruName || (engineData as any)?.plan?.todayCard?.guruName;
    if (themeGuruName) {
      const byName = GURUS.find(g => g.name.toLowerCase() === String(themeGuruName).toLowerCase());
      if (byName) return byName;
    }
    const id = (engineData as any)?.activeGuruProgram?.guru_id;
    if (id) {
      const found = GURUS.find(g => g.id === id);
      if (found) return found;
    }
    if (!GURUS.length) return null;
    const dayIdx = Math.floor(Date.now() / 86400000) % GURUS.length;
    return GURUS[dayIdx] || GURUS[0];
  }, [engineData]);

  const plan = engineData?.plan;
  const journeyDay = plan?.journeyDay || profile?.journey_day || 1;
  const streak = profile?.streak_current || 0;
  const activeLoops = profile?.active_loops || [];

  // Compose Hooks
  const homeTheme = useHomeTheme({ profile: profile as any });
  const homeSessions = useHomeSessions({
    theme: homeTheme.theme,
    profile: profile as any,
    userTimeProfile,
    engineData: engineData as any,
    activeGuruId: activeGuru?.id,
    navigate,
  });

  // Time-ask → full-screen orb beat while the session is composed, so the
  // hand-off never lands on a dead screen.
  const confirmSessionStart = homeSessions.handleTimeAskConfirm;
  const handleTimeAskConfirm = useCallback(
    async (choice: { minutes: number; energy: string; guruId?: string; intent?: string }) => {
      setComposingMinutes(Math.round(choice.minutes || 12));
      setComposing(true);
      try {
        await confirmSessionStart(choice);
      } finally {
        setComposing(false);
      }
    },
    [confirmSessionStart],
  );

  const homeOverlays = useHomeOverlays({
    profile: profile as any,
    journeyDay,
    theme: homeTheme.theme,
    activeGuru,
    engineData: engineData as any,
    userTimeProfile,
    navigate,
    onTimeAskConfirm: handleTimeAskConfirm,
  });

  // Tapping a Daily Rhythm card enters the session flow directly with that
  // item as the opening step — no time/energy ask in between.
  const handleStartDayItem = useCallback(
    async (request: DayItemStartRequest) => {
      dismissOrbCoach();
      if (homeOverlays.preJourneyState?.pendingMirror) {
        navigate("/app/before");
        return;
      }
      setComposingMinutes(request.minutes);
      setComposing(true);
      try {
        await confirmSessionStart({
          minutes: request.minutes,
          energy: "medium",
          intent: request.intent,
          gate: request.slot,
        });
      } catch {
        // Credits redirects are handled globally; compose failures are toasted
        // by the session hook. Nothing was started, so just settle the stage.
      } finally {
        setComposing(false);
      }
    },
    [confirmSessionStart, dismissOrbCoach, homeOverlays.preJourneyState?.pendingMirror, navigate],
  );
  const homeOrb = useHomeOrb({
    regenerating: homeSessions.sutraOpen,
    preJourneyPendingMirror: Boolean(homeOverlays.preJourneyState?.pendingMirror),
    theme: homeTheme.theme,
    profile,
    userTimeProfile,
    sutraPlan: homeSessions.sutraPlan as any,
    refreshSutra: homeSessions.refreshSutra,
    navigate,
    setRegenerating: () => {},
    setTimeAskOpen: homeOverlays.setTimeAskOpen,
    setPendingSutraOpen: homeSessions.setPendingSutraOpen,
    setSutraOpen: homeSessions.setSutraOpen,
    setActivePlan: homeSessions.setActivePlan as any,
    onTimeAskConfirm: handleTimeAskConfirm,
    buildSessionPlan: homeSessions.buildSessionPlan,
    onRefresh: refreshAll,
  });

  // Extract Orb Values
  const {
    pullRef, isPulling, isRefreshing, pullProgress, haptic,
    startDailySession, whisper: orbWhisper, activeGenSessionId,
  } = homeOrb;

  // ─── Orb gestures ───
  // Hold → time-ask sheet (old system)
  const handleOrbHold = useCallback(() => {
    dismissOrbCoach();
    startDailySession();
  }, [dismissOrbCoach, startDailySession]);

  // Tap (or multi-tap) → the orb opens itself full screen with the same WebGL
  // orb, grown large, so the gesture reads as the orb expanding rather than a
  // new screen arriving.
  const openOrbFullscreen = useCallback(() => {
    dismissOrbCoach();
    setMeditationOpen(true);
  }, [dismissOrbCoach]);

  const handleOrbMultiTap = openOrbFullscreen;

  // ─── Day gates (mission) ───
  const { data: gates } = useDailyGates();
  const currentSlot = getCurrentTimeSlot();
  const currentSlotConfig = getSlotConfig(currentSlot);
  const currentSlotDone = Boolean(gates?.[`${currentSlot}_done`]);

  const themeTitle =
    homeTheme.theme?.title ||
    plan?.todayCard?.practiceTitle ||
    plan?.state ||
    "Presence";

  // Today's practice — engine todayCard first, theme micro-practice as fallback
  const todayCard = plan?.todayCard;
  const themePractice = (
    homeTheme.theme as
      | { micro_practice?: { title?: string; description?: string; duration_min?: number } }
      | null
      | undefined
  )?.micro_practice;
  const practiceTitle = todayCard?.practiceTitle || themePractice?.title || themeTitle;
  const practiceMinutes =
    todayCard?.adjustedMinutes ??
    todayCard?.practiceMinutes ??
    themePractice?.duration_min;
  const practiceSteps = todayCard?.practiceSteps ?? [];
  const practiceDescription =
    themePractice?.description ||
    (todayCard?.teachingText ? String(todayCard.teachingText).slice(0, 180) : undefined);

  const karmaPoints = karmaState?.points ?? 0;
  const karmaTier = karmaState?.current_tier ? String(karmaState.current_tier) : "";
  const karmaProgress =
    karmaState?.next_threshold && karmaState.next_threshold > 0
      ? Math.min(100, (karmaPoints / karmaState.next_threshold) * 100)
      : 0;

  // Render
  return (
    <>
      {homeOverlays.celebrationNode}

      <main
        ref={pullRef}
        className="relative min-h-screen flex flex-col"
      >
        {(isPulling || isRefreshing) && (
          <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center h-16 pointer-events-none"
            style={{ transform: `translate(-50%, ${Math.min(pullProgress || 0, 1) * 60}px)` }}>
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">
                {isRefreshing ? "Refreshing…" : pullProgress && pullProgress > 0.5 ? "Release to refresh" : "Pull to refresh"}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 relative z-10">
          <div className="flex flex-col items-center gap-8 md:gap-10">

            {/* ─── KARMA ─── */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <p className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/60">
                Karma
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                {karmaLoading ? (
                  <span
                    className="inline-block h-10 w-24 rounded-lg bg-muted/25 animate-pulse"
                    aria-label="Loading karma"
                  />
                ) : (
                  <span className="font-display text-4xl font-semibold text-foreground tabular-nums">
                    <CountUp end={karmaPoints} />
                  </span>
                )}
                {karmaTier && !karmaLoading && (
                  <span className="rounded-full border border-primary/30 bg-[linear-gradient(160deg,hsl(var(--primary)/0.18),hsl(var(--primary)/0.05))] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-primary font-medium shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.12)]">
                    {karmaTier}
                  </span>
                )}
              </div>
              {karmaState?.next_threshold ? (
                <div className="mt-2 flex flex-col items-center gap-1">
                  <div className="w-36 h-[2px] rounded-full bg-muted/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${karmaProgress}%` }}
                      transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-primary/60"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                    {karmaState.to_next ?? 0} to next
                  </span>
                </div>
              ) : null}

              {engineError && (
                <button
                  onClick={() => void refetchEngine()}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-[10px] text-destructive/90 hover:bg-destructive/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <AlertCircle className="w-3 h-3" aria-hidden="true" />
                  Couldn't sync your progress · Retry
                  <RefreshCw
                    className={engineFetching ? "w-3 h-3 animate-spin" : "w-3 h-3"}
                    aria-hidden="true"
                  />
                </button>
              )}
            </motion.div>

            {/* ─── TODAY'S THEME (tap → full briefing) ─── */}
            <TodayThemeCard
              theme={homeTheme.theme}
              plan={plan}
              profile={profile}
              guru={activeGuru}
              journeyDay={journeyDay}
              slotLabel={currentSlotConfig.label}
              practiceTitle={practiceTitle}
              practiceMinutes={practiceMinutes}
              vLevel={engineData?.plan?.vLevel}
              onOpen={() => setThemeSheetOpen(true)}
            />

            {/* ─── RESUME STRIP (unfinished generated session) ─── */}
            {activeGenSessionId && (
              <motion.button
                initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                onClick={() => navigate(`/app/session/${activeGenSessionId}`)}
                className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-[linear-gradient(160deg,hsl(var(--primary)/0.16),hsl(var(--primary)/0.05))] px-4 py-2 text-xs font-semibold text-primary shadow-[0_0_18px_hsl(var(--primary)/0.12)] hover:border-primary/55 hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                Continue your session
              </motion.button>
            )}

            {/* ─── THE ORB ─── */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <div className="flex w-full flex-col items-center">
                <div className="relative aspect-square w-full max-w-[34rem] overflow-hidden rounded-full [&>div]:h-full [&>div]:w-full [&>div>div]:h-full [&>div>div]:w-full [&>div]:!bg-transparent [&_canvas]:!bg-transparent">
                  {/* One WebGL orb at a time: the full-screen orb takes over
                      while the overlay is open, so the canvas budget is never
                      spent on a hidden second instance. */}
                  {!meditationOpen && (
                    <OversoulOrbEmbed
                      currentGate={getCurrentGateForSchedule(new Date())}
                      onActivate={openOrbFullscreen}
                      onHold={handleOrbHold}
                      onTriple={handleOrbMultiTap}
                      onHaptic={haptic}
                    />
                  )}
                </div>

                {/* Orb affordances: one taught gesture, one visible second door */}
                <motion.div
                  initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-2 flex flex-col items-center gap-2 text-center"
                >
                  <p
                    className={
                      showOrbCoach
                        ? "text-sm font-medium text-foreground/90"
                        : "text-[0.8125rem] font-medium text-muted-foreground"
                    }
                    style={{ textShadow: "0 0 18px hsl(var(--orb-hue) 90% 62% / 0.28)" }}
                  >
                    Hold the orb to begin
                  </p>
                  {showOrbCoach && (
                    <button
                      type="button"
                      onClick={dismissOrbCoach}
                      className="min-h-[24px] px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-primary/80 transition-colors hover:text-primary"
                    >
                      Got it
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOrbMultiTap}
                    style={{ borderColor: "hsl(var(--orb-hue) 90% 62% / 0.35)" }}
                    className="orb-accent-breathe inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                    Meditate
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* ─── TODAY'S PRACTICE · PACK · MISSION ─── */}
            <div className="w-full max-w-sm lg:max-w-2xl mt-36 flex flex-col gap-4">
              {lastResult && (
                <LastSessionResultCard
                  result={lastResult}
                  onDismiss={() => {
                    clearLastSessionResult();
                    setLastResult(null);
                  }}
                  onOpenRecords={() => navigate("/app/analytics?tab=practices")}
                />
              )}

              <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                <TodaysPractice
                  title={practiceTitle}
                  description={practiceDescription}
                  minutes={practiceMinutes}
                  steps={practiceSteps}
                  guruName={activeGuru?.name}
                  slotLabel={currentSlotConfig.label}
                  done={currentSlotDone}
                  onBegin={handleOrbHold}
                  onDetails={() => setThemeSheetOpen(true)}
                />

                <TodayPack onOpen={() => navigate("/app/practice")} />
              </div>

              <DailyTimetable onStartSession={handleStartDayItem} />

              {/* ─── KARMA · CREDITS · RECORDS ─── */}
              <HomeLedger
                karma={karmaPoints}
                toNext={karmaState?.to_next ?? null}
                onOpenRecords={() => navigate("/app/analytics?tab=practices")}
                onOpenCredits={() => navigate("/app/credits")}
              />
            </div>

            {/* ─── DESKTOP RAILS ─── */}
            <div className="mt-10 md:mt-14">
              <DesktopHomeRails
                streak={streak}
                journeyDay={journeyDay}
                profile={profile}
                guruName={activeGuru?.name}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ─── TODAY'S THEME BRIEFING (full screen) ─── */}
      <TodayThemeSheet
        open={themeSheetOpen}
        onClose={() => setThemeSheetOpen(false)}
        theme={homeTheme.theme}
        plan={plan}
        profile={profile}
        guru={activeGuru}
        vLevel={engineData?.plan?.vLevel}
        streak={streak}
        practiceMinutes={practiceMinutes}
        lastResult={lastResult}
        onBeginPractice={() => {
          setThemeSheetOpen(false);
          handleOrbHold();
        }}
        onStartDayItem={(request) => {
          setThemeSheetOpen(false);
          void handleStartDayItem(request);
        }}
        onQuickPractice={() => {
          setThemeSheetOpen(false);
          setMeditationOpen(true);
        }}
      />

      {/* ─── MEDITATION (full screen) ─── */}
      <PureConsciousnessMeditation
        open={meditationOpen}
        onClose={() => setMeditationOpen(false)}
      />

      {/* ─── OVERLAYS ─── */}
      <ThemeReasoning
        theme={homeTheme.theme}
        journeyDay={journeyDay}
        vLevel={engineData?.plan?.vLevel}
        activeLoops={activeLoops}
      />

      <GuideSessionOverlay
        open={homeOverlays.guideOverlayOpen}
        guru={activeGuru}
        onClose={homeOverlays.closeGuide}
        seedContext={homeOverlays.mirrorSeedContext}
        seedUserMessage={homeOverlays.mirrorSeedMessage}
      />

      <SessionIntroCard
        open={homeSessions.sutraOpen}
        plan={homeSessions.sutraPlan as any}
        guruId={activeGuru?.id}
        onClose={() => homeSessions.setSutraOpen(false)}
        onSkip={() => {
          homeSessions.setSutraOpen(false);
          homeSessions.setActivePlan(homeSessions.buildSessionPlan() as any);
          homeSessions.refreshSutra();
        }}
        onSurprise={() => {
          homeSessions.refreshSutra();
        }}
      />

      <TimeAskSheet
        open={homeOverlays.timeAskOpen}
        onOpenChange={homeOverlays.setTimeAskOpen}
        onConfirm={handleTimeAskConfirm}
        whisper={orbWhisper}
        onTalkFirst={homeOverlays.handleTimeAskTalkFirst}
        loading={homeSessions.sutraOpen}
      />

      {/* ─── FULL-SCREEN ORB while the session is composed ─── */}
      <SessionOrbStage
        open={composing}
        title={`Preparing your ${composingMinutes} min sitting…`}
        subtitle="Breathe with the orb"
      />

      <GateEntrySheet
        open={homeOverlays.gateSheetOpen}
        gate={homeOverlays.selectedGate as any}
        onClose={homeOverlays.handleGateSheetClose}
        onStartSession={homeOverlays.handleGateStartSession}
        engineData={engineData as any}
        userTimeProfile={userTimeProfile as any}
      />
    </>
  );
}

