"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCredits } from "@/hooks/useCredits";
import { useKarma } from "@/hooks/useKarma";
import { conscious, consciousFromError, consciousRetry } from "@/lib/consciousToast";
import { getCurrentGateForSchedule, type GateId } from "@/lib/consciousness/dailyGates";
import { saveLastSittingEssence } from "@/lib/whisperChain";
import { useFutureWhisper } from "@/hooks/useFutureWhisper";
import { useOnboardingNotifications } from "@/hooks/useOnboardingNotifications";
import { useThemeOfDay, useRefreshTheme, useRegenerateTheme } from "@/hooks/useThemeOfDay";
import { useThemeDeepenToast } from "@/hooks/useThemeDeepenToast";
import { useConsciousnessEngine } from "@/hooks/useConsciousnessEngine";
import { useUserTimeProfile } from "@/hooks/useUserTimeProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import { getCurrentTimeSlot } from "@/lib/timeSlots";
import { logEngagement } from "@/lib/telemetry/engagementTelemetry";
import { logAppContext } from "@/lib/telemetry/appContextTelemetry";
import type { Session } from "@/types/database";
import BreakthroughCelebration from "@/components/BreakthroughCelebration";
import { useCompanionEngine } from "@/hooks/useCompanionEngine";
import { useDetectBypassing } from "@/hooks/usePracticeMatrix";
import { useActiveGuruProgram } from "@/hooks/useGuruPrograms";
import { GURUS } from "@/lib/guru-data";
import { useNextSession } from "@/hooks/useNextSession";
import { usePreJourney } from "@/hooks/usePreJourney";
import { useOrientation } from "@/hooks/useOrientation";
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
import { orchestrateSession, loadTodaysSessions, loadLastTheme, type SessionPlan } from "@/lib/sessionOrchestrator";
import { TimeAskSheet, type TimeAskChoice } from "@/components/home/TimeAskSheet";
import GuideSessionOverlay from "@/components/guide/GuideSessionOverlay";
import SessionIntroCard from "@/components/sutra/SessionIntroCard";
import TimeMomentSheet from "@/components/home/TimeMomentSheet";

type SessionOrchestratorDimension = "body" | "thought" | "emotion" | "awareness";

type ThemeAny = {
  title?: string;
  description?: string;
  micro_practice?: { title?: string; description?: string; duration_min?: number };
  inner_inquiry?: string;
  engagement_question?: string;
  felt_sense_opener?: string;
  resistance_warning?: string;
};

export default function Home() {
  const navigate = useNavigate();
  const { data, isError, isLoading, refetch } = useThemeOfDay();
  const [regenerating, setRegenerating] = useState(false);
  const [timeAskOpen, setTimeAskOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<GateId | null>(null);
  const [sessionGate, setSessionGate] = useState<GateId | null>(null);
  const [activeGenSessionId, setActiveGenSessionId] = useState<string | null>(null);
  const [silentSpaceOpen, setSilentSpaceOpen] = useState(false);

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
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useThemeDeepenToast();
  const { data: credits } = useCredits();
  const { data: karmaState } = useKarma();
  const currentSlot = getCurrentTimeSlot();
  const { data: engineData } = useConsciousnessEngine(currentSlot);
  const { data: activeGuruProgram } = useActiveGuruProgram();

  const activeGuru = useMemo(() => {
    const themeGuruName = (engineData as unknown)?.guruName || (engineData as unknown)?.todayCard?.guruName;
    if (themeGuruName) {
      const byName = GURUS.find(
        (g) => g.name.toLowerCase() === String(themeGuruName).toLowerCase()
      );
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

  const creditToastShown = useRef(false);
  useEffect(() => {
    if (creditToastShown.current) return;
    if (credits === undefined) return;
    if (credits === null || credits.balance_paise < 50) {
      creditToastShown.current = true;
      conscious("noCredits");
    }
  }, [credits]);

  const refreshTheme = useRefreshTheme();
  const regenerateTheme = useRegenerateTheme();

  const profile = engineData?.profile;
  const { data: userTimeProfile } = useUserTimeProfile(profile?.user_id as string | undefined);
  useOrientation(profile?.user_id as string | undefined);

  const bypassingDetector = useDetectBypassing();
  const bypassingRan = useRef(false);
  useEffect(() => {
    if (!bypassingRan.current && profile?.user_id) {
      bypassingRan.current = true;
      bypassingDetector.mutate();
    }
  }, [profile?.user_id, bypassingDetector]);

  const plan = engineData?.plan;
  const theme = data?.theme;
  const sessions = useMemo(() => (data?.sessions || []) as Session[], [data?.sessions]);
  const { state: preJourneyState } = usePreJourney();

  const userName = useMemo(() => {
    if (profile && "display_name" in profile) return (profile as unknown).display_name || "friend";
    return "friend";
  }, [profile]);

  const lastSummary = useMemo(() => {
    const done = sessions
      .filter((s) => s.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.completed_at || b.started_at).getTime() -
          new Date(a.completed_at || a.started_at).getTime(),
      );
    const raw = String(done[0]?.summary ?? "").trim();
    return raw && !/^(undefined|null|n\/?a|none|nan)$/i.test(raw) ? raw : "";
  }, [sessions]);

  const streak = profile?.streak_current || 0;
  const journeyDay = plan?.journeyDay || profile?.journey_day || 1;

  // Engagement: one home_view per mount, so return visits are measurable.
  useEffect(() => {
    void logEngagement({ type: "home_view", surface: "home" });
    void logAppContext({ surface: "home" });
  }, []);

  const activeLoopIds = useMemo(() => {
    if (engineData?.activeLoopDetails?.length) {
      return engineData.activeLoopDetails.map((loop) => loop.id);
    }
    return profile?.active_loops ?? [];
  }, [engineData?.activeLoopDetails, profile?.active_loops]);

  // The orb is a readout: band sets colour, depth sets glow, the weakest
  // dimension accents it, and active loops pull the glow down.
  const orbState = useMemo(() => {
    const bands = (profile as unknown as { dimension_bands?: Record<string, number | null> } | null)
      ?.dimension_bands;
    let weakestDimension: "thought" | "emotion" | "body" | "awareness" | undefined;
    if (bands) {
      const entries = Object.entries(bands).filter(([k]) => k !== "total");
      if (entries.length > 0) {
        entries.sort((a, b) => Number(a[1] ?? 0) - Number(b[1] ?? 0));
        const key = entries[0]?.[0];
        if (key === "thought" || key === "emotion" || key === "body" || key === "awareness") {
          weakestDimension = key;
        }
      }
    }
    return {
      band: typeof profile?.overall_band === "number" ? profile.overall_band : undefined,
      vLevel: typeof profile?.v_level_current === "number" ? profile.v_level_current : undefined,
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
      const meta = (n.metadata || {}) as unknown;
      const looksLikeBreakthrough = typeof meta.breakthroughId === "string" || /breakthrough/i.test(n.title);
      if (!looksLikeBreakthrough) return false;
      const createdAt = new Date(n.created_at).getTime();
      return now - createdAt < 60 * 60 * 1000;
    });

    if (!candidate) return;
    if (lastCelebratedRef.current === candidate.id) return;

    const meta = (candidate.metadata || {}) as unknown;
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

  const [activePlan, setActivePlan] = useState<SessionPlan | null>(null);
  const [sessionsToday, setSessionsToday] = useState<SessionPlan[]>(() => loadTodaysSessions());
  const [introOpen, setIntroOpen] = useState(false);
  const [sutraOpen, setSutraOpen] = useState(false);
  const [pendingSutraOpen, setPendingSutraOpen] = useState(false);
  const [guideOverlayOpen, setGuideOverlayOpen] = useState(false);
  const [mirrorSeedMessage, setMirrorSeedMessage] = useState<string | undefined>(undefined);
  const [mirrorSeedContext, setMirrorSeedContext] = useState<string | undefined>(undefined);

  const { plan: sutraPlan, refresh: refreshSutra } = useNextSession();

  useEffect(() => {
    if (pendingSutraOpen && sutraPlan) {
      setSutraOpen(true);
      setPendingSutraOpen(false);
    }
  }, [pendingSutraOpen, sutraPlan]);

  const buildSessionPlan = () => {
    const prior = loadTodaysSessions();
    const bands = (engineData as unknown)?.profile?.dimension_bands;
    let weakestDimension: SessionOrchestratorDimension | undefined;
    if (bands) {
      const entries = Object.entries(bands as Record<string, number | null>).filter(([k]) => k !== "total");
      if (entries.length) {
        entries.sort((a, b) => (Number(a[1] ?? 0)) - (Number(b[1] ?? 0)));
        weakestDimension = entries[0]?.[0] as SessionOrchestratorDimension | undefined;
      }
    }
    return orchestrateSession({
      hour: new Date().getHours(),
      sessionsToday: prior.length,
      lastSessionToday: prior[prior.length - 1],
      lastTheme: loadLastTheme(),
      daysSinceLastSession: 0,
      userName,
      bandLevel: profile?.overall_band as number | undefined,
      activeLoops: activeLoopIds,
      energy: "medium",
      todayTheme: theme ? { title: theme.title, description: theme.description } : null,
      weakestDimension,
    });
  };

  const [nextThreadPending, setNextThreadPending] = useState(false);
  const beginNextThread = async () => {
    if (nextThreadPending || regenerating) return;
    setNextThreadPending(true);
    try {
      await regenerateTheme();
      refreshTheme();
    } catch (e: unknown) {
      consciousFromError(e, "somethingSlipped", { band: profile?.overall_band as number | undefined });
    } finally {
      setNextThreadPending(false);
    }
  };

  const startDailySession = (requestedGate?: GateId) => {
    if (regenerating) return;
    if (preJourneyState?.pendingMirror) {
      navigate('/app/before');
      return;
    }
    setSessionGate(requestedGate ?? null);
    setTimeAskOpen(true);
  };

  const startPracticeNow = () => {
    if (regenerating) return;
    if (preJourneyState?.pendingMirror) {
      navigate('/app/before');
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
    } catch { /* ignore */ }
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
        themeId: (theme as unknown)?.id || null,
        timeBudgetMin: choice.minutes,
        energy: choice.energy,
        gate: sessionGate ?? getCurrentGateForSchedule(new Date(), userTimeProfile?.wakeTime, userTimeProfile?.sleepTime),
        depth: "deep",
      });
      conscious("noted", { band: profile?.overall_band as number | undefined, kind: "success" });
      navigate(`/app/session/${sessionId}`);
    } catch (e: unknown) {
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
  const { whisper } = useFutureWhisper();

  // Build moment recommendations from engine data
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

  // Build constellation nodes from actual data
  const constellationNodes = useMemo((): DiscoveryNode[] => {
    const nodes: DiscoveryNode[] = [];
    const recentThemes = sessions
      .filter(s => s.status === "completed" && s.summary)
      .slice(0, 5)
      .map((s, i) => ({
        id: `theme-${i}`,
        label: s.summary?.slice(0, 30) + "â€¦" || "Recent exploration",
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
      const aiContext = `JOURNEY_SESSION: Begin a guided session with continuity. Greet warmly as ${activeGuru?.name || "the guide"} and propose what to explore today. Context â€” ${ctx}`;
      try {
        sessionStorage.setItem("journeySession:aiContext", aiContext);
        sessionStorage.setItem("journeySession:ts", String(Date.now()));
      } catch { /* ignore */ }
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
    saveLastSittingEssence(fb || plan.title);
    // Toast handled by the session runtime
    refreshTheme();
  };

  return (
    <>
      {celebrationNode}

      <main className="relative min-h-screen overflow-hidden text-foreground">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pt-8 lg:px-12">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-primary/80">ConsciousOS</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.19em] text-muted-foreground/65">
                {new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date())}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSilentSpaceOpen(true)}
                aria-label="Enter silent space"
                className="grid h-10 w-10 place-items-center rounded-full border border-border/70 text-muted-foreground/80 transition hover:border-primary/25 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => navigate("/app/settings")}
                aria-label="Open your profile and settings"
                className="grid h-10 w-10 place-items-center rounded-full border border-primary/15 bg-card/60 text-primary/80 transition hover:border-primary/35 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
          </header>

          {/* First viewport: Arrival + Orb */}
          <section className="mx-auto mt-8 grid max-w-5xl items-center gap-3 sm:mt-12 lg:grid-cols-[1fr_0.92fr] lg:gap-10">
            <ArrivalExperience
              userName={userName}
              theme={theme ?? null}
              themeLoading={isLoading}
            />

            <div className="relative mx-auto w-full max-w-[min(78vw,390px)] lg:max-w-[430px]">
              <div aria-hidden="true" className="pointer-events-none absolute inset-[5%] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.17), hsl(var(--gold-700) / 0.07) 48%, transparent 74%)" }} />
              <div className="relative">
                <OversoulOrbEmbed
                  currentGate={gate}
                  orbState={orbState}
                  onActivate={() => { void logEngagement({ type: "orb_activate", surface: "orb", source: "tap" }); startDailySession(); }}
                  onHold={() => { void logEngagement({ type: "orb_activate", surface: "orb", source: "hold" }); startDailySession(); }}
                  onTriple={() => navigate("/app/practice")}
                />
              </div>
              <p className="pointer-events-none -mt-2 text-center text-[9px] uppercase tracking-[0.25em] text-primary/65">Hold or tap to begin</p>
            </div>
          </section>

          {/* Scrollable sections */}
          <div className="mx-auto mt-14 max-w-5xl space-y-16 sm:mt-20 sm:space-y-24">
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

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-5">
              <p className="text-[10px] leading-relaxed text-muted-foreground/55">A companion for the life you are already living.</p>
              <div className="flex flex-wrap items-center gap-4">
                <KarmaIndicator
                  karmaPoints={karmaState?.points ?? 0}
                  karmaTier={karmaState?.current_tier}
                  karmaToNext={karmaState?.to_next ?? null}
                />
                <button type="button" onClick={() => navigate("/app/practice")} className="inline-flex min-h-10 items-center gap-1 text-[10px] text-muted-foreground/65 transition hover:text-foreground">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg> Explore
                </button>
                <button type="button" onClick={() => navigate("/app/settings")} aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground/55 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              </div>
            </footer>
          </div>
        </div>

        {/* Silent Space Overlay */}
        <SilentSpace
          isOpen={silentSpaceOpen}
          onClose={() => setSilentSpaceOpen(false)}
          orb={
            <OversoulOrbEmbed
              currentGate={gate}
              orbState={orbState}
              onActivate={() => { void logEngagement({ type: "orb_activate", surface: "orb", source: "tap" }); startDailySession(); }}
              onHold={() => { void logEngagement({ type: "orb_activate", surface: "orb", source: "hold" }); startDailySession(); }}
              onTriple={() => navigate("/app/practice")}
            />
          }
          onStartSession={startDailySession}
          activeSession={Boolean(activeGenSessionId)}
          onResumeSession={() => { if (activeGenSessionId) navigate(`/app/session/${activeGenSessionId}`); }}
          regenerating={regenerating}
        />

        {/* Overlays (preserved) */}
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
              } catch { /* ignore */ }
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
      </main>
    </>
  );
}
