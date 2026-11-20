"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3, Moon, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/design-system";
import { Card, CardContent } from "@/components/design-system";
import { Badge } from "@/components/design-system";
import { Avatar, AvatarFallback } from "@/components/design-system";
import { ScrollArea } from "@/design-system";
import { conscious, consciousFromError, consciousRetry } from "@/lib/consciousToast";
import { getCurrentGateForSchedule, type GateId } from "@/lib/consciousness/dailyGates";
import { getCurrentTimeSlot, type TimeSlot } from "@/lib/timeSlots";
import { useThemeOfDay, useRefreshTheme } from "@/hooks/useThemeOfDay";
import { useThemeDeepenToast } from "@/hooks/useThemeDeepenToast";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { useStreakGrace } from "@/hooks/useStreakGrace";
import { useNotifications } from "@/hooks/useNotifications";
import { useUserTimeProfile } from "@/hooks/useUserTimeProfile";
import { useActiveGuruProgram } from "@/hooks/useGuruPrograms";
import { useFutureWhisper } from "@/hooks/useFutureWhisper";
import { useOnboardingNotifications } from "@/hooks/useOnboardingNotifications";
import { useCompanionEngine } from "@/hooks/useCompanionEngine";
import { useDetectBypassing } from "@/hooks/usePracticeMatrix";
import { useNextSession } from "@/hooks/useNextSession";
import { useFoundationCourse } from "@/hooks/useFoundationCourse";
import { usePreJourney } from "@/hooks/usePreJourney";
import { useOrientation } from "@/hooks/useOrientation";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { useKarma } from "@/hooks/useKarma";
import { supabase } from "@/lib/supabase";
import { decideExhaustion, getCoolDownMessage } from "@/lib/consciousness/exhaustionHandler";
import { GURUS } from "@/lib/guru-data";
import { orchestrateSession, loadTodaysSessions, loadLastTheme, type SessionPlan } from "@/lib/sessionOrchestrator";
import { TimeAskSheet, type TimeAskChoice } from "@/components/home/TimeAskSheet";
import GuideSessionOverlay from "@/components/guide/GuideSessionOverlay";
import SessionIntroCard from "@/components/sutra/SessionIntroCard";
import TimeMomentSheet from "@/components/home/TimeMomentSheet";
import OrbSession from "@/components/home/OrbSession";
import ObserveOrbScreen from "@/components/home/ObserveOrbScreen";
import BreakthroughCelebration from "@/components/BreakthroughCelebration";
import OversoulOrbEmbed from "@/components/orb/OversoulOrbEmbed";
import ArrivalExperience from "@/components/home/ArrivalExperience";
import PresentJourney from "@/components/home/PresentJourney";
import DayArc from "@/components/home/DayArc";
import MomentEngine, { MomentRecommendation } from "@/components/home/MomentEngine";
import InnerExplorer from "@/components/home/InnerExplorer";
import WisdomUniverse from "@/components/home/WisdomUniverse";
import PersonalEvolution from "@/components/home/PersonalEvolution";
import Constellation, { DiscoveryNode } from "@/components/home/Constellation";
import LifeMap from "@/components/home/LifeMap";
import KarmaIndicator from "@/components/home/KarmaIndicator";
import SilentSpace from "@/components/home/SilentSpace";

type ThemeAny = {
  title?: string;
  description?: string;
  micro_practice?: { title?: string; duration_min?: number } | null;
  inner_inquiry?: string;
};

export default function HomeV3() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { data, isLoading, isError, isFetching, refetch } = useThemeOfDay();
  const [regenerating, setRegenerating] = useState(false);
  const [timeAskOpen, setTimeAskOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<GateId | null>(null);
  const [sessionGate, setSessionGate] = useState<GateId | null>(null);
  const [activeGenSessionId, setActiveGenSessionId] = useState<string | null>(null);
  const [silentSpaceOpen, setSilentSpaceOpen] = useState(false);
  const [guideOverlayOpen, setGuideOverlayOpen] = useState(false);
  const [mirrorSeedMessage, setMirrorSeedMessage] = useState<string | undefined>(undefined);
  const [mirrorSeedContext, setMirrorSeedContext] = useState<string | undefined>(undefined);
  const [sutraOpen, setSutraOpen] = useState(false);
  const [pendingSutraOpen, setPendingSutraOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("sessions")
          .select("id, started_at")
          .eq("user_id", user.id)
          .eq("type", "generative")
          .eq("status", "active")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!cancelled && data?.id) setActiveGenSessionId(data.id);
      } catch { }
    })();
    return () => { cancelled = true; };
  }, []);

  useThemeDeepenToast();
  const refreshTheme = useRefreshTheme();
  const currentSlot = getCurrentTimeSlot();
  const { data: engineData } = useConsciousnessEngine(currentSlot);
  const { data: activeGuruProgram } = useActiveGuruProgram();
  const { data: userTimeProfile } = useUserTimeProfile(engineData?.profile?.user_id);
  const { data: karmaState } = useKarma();

  const activeGuru = useMemo(() => {
    const themeGuruName = (engineData as any)?.guruName || (engineData as any)?.todayCard?.guruName;
    if (themeGuruName) {
      const byName = GURUS.find((g) => g.name.toLowerCase() === String(themeGuruName).toLowerCase());
      if (byName) return byName;
    }
    const id = activeGuruProgram?.guru_id;
    if (id) {
      const found = GURUS.find((g) => g.id === id);
      if (found) return found;
    }
    if (!GURUS.length) return null;
    const dayIdx = Math.floor(Date.now() / 86400000) % GURUS.length;
    return GURUS[dayIdx] || GURUS[0];
  }, [activeGuruProgram?.guru_id, engineData]);

  const profile = engineData?.profile;
  const theme = data?.theme;
  const sessions = (data?.sessions || []) as any[];
  const plan = engineData?.plan;
  const streak = profile?.streak_current || 0;
  const journeyDay = plan?.journeyDay || profile?.journey_day || 1;

  const { missions, currentGateMission, currentGate, completedToday, startMission, completeMission, isLoading: missionsLoading } =
    useDailyMissions(profile?.user_id);

  const activeLoopIds = useMemo(() => {
    if (engineData?.activeLoopDetails?.length) {
      return engineData.activeLoopDetails.map((loop) => loop.id);
    }
    return profile?.active_loops ?? [];
  }, [engineData?.activeLoopDetails, profile?.active_loops]);

  const orbState = useMemo(() => {
    const bands = (profile as unknown as { dimension_bands?: Record<string, number | null> } | null)?.dimension_bands;
    let weakestDimension: "thought" | "emotion" | "body" | "awareness" | undefined;
    if (bands) {
      const entries = Object.entries(bands).filter(([k]) => k !== "total");
      if (entries.length > 0) {
        entries.sort((a, b) => Number(a[1] ?? 0) - Number(b[1] ?? 0));
        const key = entries[0]?.[0];
        if (key === "thought" || key === "emotion" || key === "body" || key === "awareness") weakestDimension = key;
      }
    }
    const vLevel = (profile as unknown as { v_level_current?: number } | null)?.v_level_current;
    return {
      band: typeof profile?.overall_band === "number" ? profile.overall_band : undefined,
      vLevel: typeof vLevel === "number" ? vLevel : undefined,
      weakestDimension,
      activeLoopCount: activeLoopIds.length,
      streak,
    };
  }, [profile, activeLoopIds, streak]);

  const { notifications, markRead } = useNotifications(profile?.user_id);
  const lastCelebratedRef = useRef<string | null>(null);
  const [celebrationState, setCelebrationState] = useState<{ breakthroughId: string; notificationId: string } | null>(null);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const now = Date.now();
    const candidate = notifications.find((n) => {
      if (n.read) return false;
      if (n.type !== "milestone") return false;
      const meta = (n.metadata || {}) as any;
      const looksLikeBreakthrough = typeof meta.breakthroughId === "string" || /breakthrough/i.test(n.title);
      if (!looksLikeBreakthrough) return false;
      const createdAt = new Date(n.created_at).getTime();
      return now - createdAt < 60 * 60 * 1000;
    });
    if (!candidate) return;
    if (lastCelebratedRef.current === candidate.id) return;
    const meta = (candidate.metadata || {}) as any;
    const breakthroughId = (typeof meta.breakthroughId === "string" ? meta.breakthroughId : "BT063") as string;
    lastCelebratedRef.current = candidate.id;
    setCelebrationState({ breakthroughId, notificationId: candidate.id });
  }, [notifications, markRead]);

  const celebrationNode = (
    <BreakthroughCelebration
      breakthroughId={celebrationState?.breakthroughId ?? null}
      onClose={() => {
        if (celebrationState?.notificationId) markRead(celebrationState.notificationId);
        setCelebrationState(null);
      }}
    />
  );

  useOnboardingNotifications(profile?.user_id, journeyDay);
  useCompanionEngine(profile?.user_id);

  const bypassingDetector = useDetectBypassing();
  const bypassingRan = useRef(false);
  useEffect(() => {
    if (!bypassingRan.current && profile?.user_id) {
      bypassingRan.current = true;
      bypassingDetector.mutate();
    }
  }, [profile?.user_id, bypassingDetector]);

  const { state: preJourneyState } = usePreJourney();
  const { state: foundationState, enroll: enrollFoundation } = useFoundationCourse();
  const foundationActive = false;
  const foundationLoading = !preJourneyState || (preJourneyState.enrolled === false && !preJourneyState.skipped && !preJourneyState.graduated);
  const hideDailyHomeUI = false;

  const { plan: sutraPlan, refresh: refreshSutra } = useNextSession();
  const { whisper } = useFutureWhisper();

  useEffect(() => {
    if (pendingSutraOpen && sutraPlan) {
      setSutraOpen(true);
      setPendingSutraOpen(false);
    }
  }, [pendingSutraOpen, sutraPlan]);

  const buildSessionPlan = () => {
    const prior = loadTodaysSessions();
    const bands = (engineData as any)?.profile?.dimension_bands;
    let weakestDimension: string | undefined;
    if (bands) {
      const entries = Object.entries(bands).filter(([k]) => k !== "total");
      if (entries.length) {
        entries.sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0));
        weakestDimension = entries[0]?.[0] as string | undefined;
      }
    }
    return orchestrateSession({
      hour: new Date().getHours(),
      sessionsToday: prior.length,
      lastSessionToday: prior[prior.length - 1],
      lastTheme: loadLastTheme(),
      daysSinceLastSession: 0,
      userName: profile?.display_name || "friend",
      bandLevel: profile?.overall_band as number | undefined,
      activeLoops: activeLoopIds,
      energy: "medium",
      todayTheme: theme ? { title: theme.title, description: theme.description } : null,
      weakestDimension,
    });
  };

  const [activePlan, setActivePlan] = useState<SessionPlan | null>(null);
  const [sessionsToday, setSessionsToday] = useState<SessionPlan[]>(() => loadTodaysSessions());
  const [lastCompleted, setLastCompleted] = useState<SessionPlan | null>(null);

  const closeGuide = useCallback(() => {
    setGuideOverlayOpen(false);
    setMirrorSeedMessage(undefined);
    setMirrorSeedContext(undefined);
  }, []);

  const handleIntroBegin = () => {
    setIntroOpen(false);
    const params = new URLSearchParams();
    if (activeGuru?.id) params.set("guruId", activeGuru.id);
    if (theme?.title) {
      const ctx = [
        `Today's theme: ${theme.title}`,
        theme.description ? `Theme description: ${theme.description}` : null,
        activeGuru?.name ? `Master for today: ${activeGuru.name}` : null,
        activeGuru?.path ? `Path: ${activeGuru.path}` : null,
      ].filter(Boolean).join(" | ");
      const aiContext = `JOURNEY_SESSION: Begin a guided session with continuity. Greet warmly as ${activeGuru?.name || "the guide"} and propose what to explore today. Context — ${ctx}`;
      try {
        sessionStorage.setItem("journeySession:aiContext", aiContext);
        sessionStorage.setItem("journeySession:ts", String(Date.now()));
      } catch { }
      params.set("journey", "1");
    }
    const qs = params.toString();
    navigate(`/app/guide${qs ? `?${qs}` : ""}`);
  };

  const handleIntroSkip = () => {
    setSutraOpen(false);
    setActivePlan(buildSessionPlan());
    refreshSutra();
  };

  const handleSessionComplete = (plan: SessionPlan, fb: string) => {
    setSessionsToday(loadTodaysSessions());
    setLastCompleted(plan);
    refreshTheme();
  };

  const [nextThreadPending, setNextThreadPending] = useState(false);
  const beginNextThread = async () => {
    if (nextThreadPending || regenerating) return;
    setNextThreadPending(true);
    try {
      const { regenerateTheme } = await import("@/hooks/useThemeOfDay");
      const regenerate = regenerateTheme();
      await regenerate();
      refreshTheme();
    } catch (e: any) {
      consciousFromError(e, "somethingSlipped", { band: profile?.overall_band as number | undefined });
    } finally {
      setNextThreadPending(false);
    }
  };

  const startDailySession = (requestedGate?: GateId) => {
    if (regenerating) return;
    if (preJourneyState?.pendingMirror) {
      navigate("/app/before");
      return;
    }
    setSessionGate(requestedGate ?? null);
    setTimeAskOpen(true);
  };

  const startPracticeNow = () => {
    if (regenerating) return;
    if (preJourneyState?.pendingMirror) {
      navigate("/app/before");
      return;
    }
    const choice: TimeAskChoice = { minutes: 12, energy: "medium" };
    try {
      const raw = localStorage.getItem("time-ask:last");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TimeAskChoice>;
        if (parsed.minutes) choice.minutes = parsed.minutes;
        if (parsed.energy) choice.energy = parsed.energy;
        if (parsed.guruId) choice.guruId = parsed.guruId;
        if (parsed.intent) choice.intent = parsed.intent;
      }
    } catch { }
    handleTimeAskConfirm(choice);
  };

  const handleTimeAskConfirm = async (choice: TimeAskChoice) => {
    setTimeAskOpen(false);
    if (regenerating) return;
    setRegenerating(true);
    conscious("unfolding", { band: profile?.overall_band as number | undefined });
    try {
      const { startGenerativeSession } = await import("@/lib/session-shell/api");
      const { sessionId } = await startGenerativeSession({
        intent: choice.intent
          ? `${theme?.title ? `[Day thread: ${theme.title}] ` : ""}User asked: ${choice.intent}`
          : undefined,
        themeId: (theme as any)?.id || null,
        timeBudgetMin: choice.minutes,
        energy: choice.energy,
        gate: sessionGate ?? getCurrentGateForSchedule(new Date(), userTimeProfile?.wakeTime, userTimeProfile?.sleepTime),
        depth: "deep",
      });
      conscious("noted", { band: profile?.overall_band as number | undefined, kind: "success" });
      navigate(`/app/session/${sessionId}`);
    } catch (e: any) {
      console.warn("[home] session composition failed:", e);
      consciousRetry({
        title: "Session could not be composed",
        description: "Nothing was started. Please retry in a moment.",
        band: profile?.overall_band as number | undefined,
      });
      if (sutraPlan) setSutraOpen(true);
      else { setPendingSutraOpen(true); refreshSutra(); }
    } finally {
      setRegenerating(false);
    }
  };

  const recoverFromObserveWait = useCallback(() => {
    setRegenerating(false);
    setPendingSutraOpen(false);
    if (sutraPlan) {
      setSutraOpen(true);
      return;
    }
    startPracticeNow();
    refreshSutra();
  }, [refreshSutra, sutraPlan]);

  const gate = getCurrentGateForSchedule(new Date(), userTimeProfile?.wakeTime, userTimeProfile?.sleepTime);

  const momentRecommendations = useMemo((): MomentRecommendation[] => {
    const recs: MomentRecommendation[] = [];
    const suggestions = (plan?.suggestions ?? [])
      .filter((item) => item.title && item.action?.target)
      .slice(0, 3);

    suggestions.forEach((s, i) => {
      const target = s.action.target.toLowerCase();
      let destination: MomentRecommendation["destination"] = { route: "/app/guide" };
      let category: MomentRecommendation["category"] = "experience";

      if (target === "journal") {
        destination = { route: "/app/journal" };
        category = "reflect";
      } else if (target === "practice") {
        destination = { route: "/app/practice" };
        category = "practice";
      } else if (s.action.prompt) {
        destination = { route: "/app/guide", prompt: s.action.prompt };
        category = "experience";
      }

      recs.push({
        id: `suggestion-${i}`,
        category,
        title: s.title,
        description: s.description || "",
        whyNow: s.action.context || "Selected from your current journey",
        destination,
      });
    });
    return recs.slice(0, 3);
  }, [plan?.suggestions]);

  const constellationNodes = useMemo((): DiscoveryNode[] => {
    const nodes: DiscoveryNode[] = [];
    const recentThemes = sessions
      .filter(s => s.status === "completed" && s.summary)
      .slice(0, 5)
      .map((s, i) => ({
        id: `theme-${i}`,
        label: s.summary?.slice(0, 30) + "…" || "Recent exploration",
        category: "theme" as const,
        explorationStatus: "explored" as const,
        relationships: [],
      }));
    nodes.push(...recentThemes);

    if (plan?.focusDimension) {
      nodes.push({
        id: "current-focus",
        label: plan.focusDimension,
        category: "observation",
        explorationStatus: "current",
        relationships: recentThemes.slice(0, 2).map(t => t.id),
      });
    }

    activeLoopIds.slice(0, 3).forEach((loopId, i) => {
      nodes.push({
        id: `loop-${i}`,
        label: loopId.replace(/_/g, " "),
        category: "loop",
        explorationStatus: "available",
        relationships: ["current-focus"],
      });
    });

    return nodes.slice(0, 10);
  }, [sessions, plan?.focusDimension, activeLoopIds]);

  const initialLoading = isLoading && !data && !engineData;

  if (initialLoading) {
    return (
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 -mt-12">
        <div className="h-7 w-28 rounded-full bg-muted/15 animate-pulse mb-3" />
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-3 w-24 rounded-full bg-muted/15 animate-pulse" />
          <div className="h-7 w-56 rounded-md bg-muted/20 animate-pulse" />
          <div className="h-3 w-32 rounded-full bg-muted/15 animate-pulse" />
        </div>
        <div className="relative w-[260px] h-[260px] flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/5 border border-primary/15"
            animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="w-44 h-44 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20"
            animate={{ scale: [1, 1.03, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-xs leading-relaxed">
          Preparing your day… your theme and practice are being woven for you.
        </p>
      </div>
    );
  }

  return (
    <>
      {celebrationNode}

      <div className="relative z-10">
        <ScrollArea className="h-full">
          <div className="space-y-16 sm:space-y-24 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-6">
            <section className="relative" aria-label="Arrival and Orb">
              <div className="mx-auto mt-8 grid max-w-5xl items-center gap-3 sm:mt-12 lg:grid-cols-[1fr_0.92fr] lg:gap-10">
                <ArrivalExperience
                  userName={profile?.display_name || "friend"}
                  theme={theme ?? null}
                  themeLoading={isLoading}
                />

                <div className="relative mx-auto w-full max-w-[min(78vw,390px)] lg:max-w-[430px]">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-[5%] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.17), hsl(var(--gold-700) / 0.07) 48%, transparent 74%)" }} />
                  <div className="relative">
                    <OversoulOrbEmbed currentGate={gate} orbState={orbState}
                      onActivate={startDailySession}
                      onHold={startDailySession}
                      onTriple={() => navigate("/app/practice")}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </section>

            <PresentJourney
              theme={theme ?? null}
              themeLoading={isLoading}
              themeError={isError}
              onRetryTheme={() => { void refetch(); }}
              onStartSession={startDailySession}
              onResumeSession={() => { if (activeGenSessionId) navigate(`/app/session/${activeGenSessionId}`); }}
              activeSession={Boolean(activeGenSessionId)}
              regenerating={regenerating}
              journeyDay={journeyDay}
            />

            <DayArc
              currentGate={gate}
              onEnterGate={setSelectedMoment}
            />

            <MomentEngine recommendations={momentRecommendations} />

            <InnerExplorer
              onExplore={(prompt) => {
                try {
                  sessionStorage.setItem("journeySession:aiContext", prompt);
                  sessionStorage.setItem("journeySession:ts", String(Date.now()));
                } catch (error) {
                  console.warn("[Home] Could not preserve exploration context for the Guide.", error);
                }
                navigate("/app/guide?journey=1");
              }}
            />

            <WisdomUniverse
              question={theme?.inner_inquiry}
            />

            <PersonalEvolution
              totalSessions={profile?.total_sessions}
              recentThemes={sessions.filter(s => s.status === "completed").slice(0, 3).map(s => s.summary || "").filter(Boolean)}
              activeLoops={activeLoopIds}
              journeyDay={journeyDay}
            />

            <Constellation nodes={constellationNodes} />

            <LifeMap lifeDomains={profile?.life_domains ?? {}} />
          </div>
        </ScrollArea>
      </div>

      <SilentSpace
        isOpen={silentSpaceOpen}
        onClose={() => setSilentSpaceOpen(false)}
        orb={
          <OversoulOrbEmbed currentGate={gate} orbState={orbState}
            onActivate={startDailySession}
            onHold={startDailySession}
            onTriple={() => navigate("/app/practice")}
          />
        }
        onStartSession={startDailySession}
        activeSession={Boolean(activeGenSessionId)}
        onResumeSession={() => { if (activeGenSessionId) navigate(`/app/session/${activeGenSessionId}`); }}
        regenerating={regenerating}
      />

      <GuideSessionOverlay
        open={guideOverlayOpen}
        guru={activeGuru}
        onClose={closeGuide}
        seedContext={mirrorSeedContext}
        seedUserMessage={mirrorSeedMessage}
      />

      <SessionIntroCard
        open={sutraOpen}
        plan={sutraPlan}
        guruId={activeGuru?.id}
        onClose={() => setSutraOpen(false)}
        onSkip={handleIntroSkip}
        onSurprise={() => { refreshSutra(); }}
      />

      <TimeAskSheet
        open={timeAskOpen}
        onOpenChange={(open) => {
          setTimeAskOpen(open);
          if (!open) setSessionGate(null);
        }}
        onConfirm={handleTimeAskConfirm}
        whisper={whisper}
        onTalkFirst={(choice) => {
          const selectedGuru = choice.guruId
            ? (GURUS.find((g) => g.id === choice.guruId) || activeGuru)
            : activeGuru;
          const params = new URLSearchParams();
          params.set("presession", "1");
          params.set("minutes", String(choice.minutes));
          params.set("energy", choice.energy);
          if (sessionGate) params.set("slot", sessionGate);
          if (selectedGuru?.id) params.set("guruId", selectedGuru.id);
          if (theme?.title) {
            const ctx = [
              `PRE-SESSION CHECK-IN: The user has ${choice.minutes} minutes and feels ${choice.energy} energy.`,
              `Today's theme: ${theme.title}`,
              theme.description ? `Theme: ${theme.description}` : null,
              selectedGuru?.name ? `You are ${selectedGuru?.name}.` : null,
              `Greet them warmly in 1-2 sentences. Ask ONE small question about how they're arriving right now (what's alive, what's heavy). After their reply, reflect briefly and suggest what to explore in today's ${choice.minutes}-min session. Then say: "When you're ready, tap Begin Session below."`,
            ].filter(Boolean).join(" ");
            try {
              sessionStorage.setItem("journeySession:aiContext", ctx);
              sessionStorage.setItem("journeySession:ts", String(Date.now()));
              sessionStorage.setItem("preSession:choice", JSON.stringify(choice));
            } catch { }
            params.set("journey", "1");
          }
          navigate(`/app/guide?${params.toString()}`);
        }}
        loading={regenerating}
      />

      <TimeMomentSheet
        gate={selectedMoment}
        anchorTime={selectedMoment ? ({
          morning: userTimeProfile?.wakeTime,
          midday: userTimeProfile?.lunchTime,
          evening: userTimeProfile?.workEnd,
          night: userTimeProfile?.sleepTime,
        }[selectedMoment] ?? null) : null}
        theme={theme}
        onOpenChange={(open) => {
          if (!open) setSelectedMoment(null);
        }}
        onBeginSession={(moment) => {
          setSelectedMoment(null);
          startDailySession(moment);
        }}
        onOpenPractice={(moment) => {
          setSelectedMoment(null);
          navigate(`/app/practice?gate=${moment}`);
        }}
        onOpenJournal={(prompt) => {
          const params = new URLSearchParams({ prompt });
          if (selectedMoment) params.set("gate", selectedMoment);
          setSelectedMoment(null);
          navigate(`/app/journal?${params.toString()}`);
        }}
      />

      <OrbSession
        open={!!activePlan}
        plan={activePlan}
        onClose={() => setActivePlan(null)}
        onComplete={handleSessionComplete}
      />

      <ObserveOrbScreen
        open={!foundationActive && pendingSutraOpen && !introOpen && !sutraOpen && !activePlan}
        generating={isFetching || pendingSutraOpen}
        ready={!!sutraPlan}
        pollIntervalMs={1000}
        onHoldComplete={() => {
          if (sutraPlan) setSutraOpen(true);
          else recoverFromObserveWait();
        }}
        onTimeout={recoverFromObserveWait}
      />

      <ObserveOrbScreen
        open={regenerating}
        generating={regenerating}
        ready={false}
        onHoldComplete={() => { }}
        onTimeout={recoverFromObserveWait}
        maxWaitMs={20000}
      />
    </>
  );
}