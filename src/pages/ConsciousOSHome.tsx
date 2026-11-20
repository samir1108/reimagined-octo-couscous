"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sun,
  Moon,
  Brain,
  Heart,
  Activity,
  Users,
  Eye,
  User,
  Sparkles,
  Lock,
  Unlock,
  Flame,
  BookOpen,
  PenLine,
  BarChart3,
  Compass,
  Library,
  ChevronRight,
  Star,
  Zap,
  Leaf,
  Wind,
  Mountain,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/design-system";
import { Card, CardContent } from "@/components/design-system";
import { Badge } from "@/components/design-system";
import { Avatar, AvatarFallback } from "@/components/design-system";
import { ScrollArea } from "@/design-system";
import { Separator } from "@/design-system";
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
import { useTodaysWisdom, useTodaysWhisper, useTodaysIntegrationKey, useTodaysEveningMetabolization, useTodaysShadowSignal } from "@/hooks/useTodaysWisdom";
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
import ArrivalExperience from "@/components/home/ArrivalExperience";
import PresentJourney from "@/components/home/PresentJourney";
import DayArc from "@/components/home/DayArc";
import MomentEngine, { MomentRecommendation } from "@/components/home/MomentEngine";
import InnerExplorer from "@/components/home/InnerExplorer";
import WisdomUniverseV2 from "@/components/home/WisdomUniverseV2";
import PersonalEvolution from "@/components/home/PersonalEvolution";
import Constellation, { DiscoveryNode } from "@/components/home/Constellation";
import LifeMap from "@/components/home/LifeMap";
import KarmaIndicator from "@/components/home/KarmaIndicator";
import SilentSpace from "@/components/home/SilentSpace";
import EveningMetabolizationOverlay from "@/components/home/EveningMetabolizationOverlay";
import { ShadowSignalToast, WhisperUnlockToast } from "@/components/home/WisdomToasts";

type ThemeAny = {
  title?: string;
  description?: string;
  micro_practice?: { title?: string; duration_min?: number } | null;
  inner_inquiry?: string;
};

interface MomentData {
  id: GateId;
  label: string;
  icon: LucideIcon;
  description: string;
  available: boolean;
  status: "available" | "completed" | "current" | "locked";
  time?: string;
}

interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  whyNow: string;
  category: "experience" | "reflect";
  icon: LucideIcon;
  destination: { route: string; prompt?: string };
}

interface ExplorerDoorway {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  prompt: string;
}

interface PotholeItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface ChallengeItem {
  id: string;
  label: string;
  description: string;
  opportunity: string;
}

interface ObservationItem {
  id: string;
  label: string;
  prompt: string;
}

interface DiscoveryNode {
  id: string;
  label: string;
  category: "theme" | "loop" | "observation" | "practice";
  explorationStatus: "explored" | "current" | "available" | "locked";
  relationships: string[];
}

interface LifeDomain {
  key: string;
  label: string;
  score: number | null;
  hasData: boolean;
}

export default function ConsciousOSHome() {
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
  const [eveningMetabolizationOpen, setEveningMetabolizationOpen] = useState(false);
  const [shadowSignal, setShadowSignal] = useState<{ title: string; content: string; subtitle?: string; action?: any } | null>(null);
  const [whisperUnlocked, setWhisperUnlocked] = useState(false);
  const [showFullConstellation, setShowFullConstellation] = useState(false);
  const [activeTab, setActiveTab] = useState<"experience" | "reflect" | "explore">("experience");

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

  const { wisdom, currentGate: wisdomGate } = useTodaysWisdom();
  const { card: whisperCard } = useTodaysWhisper();
  const { card: integrationCard } = useTodaysIntegrationKey();
  const { card: eveningCard } = useTodaysEveningMetabolization();
  const { card: shadowCard } = useTodaysShadowSignal();

  useEffect(() => {
    if (whisperCard?.unlocked && completedToday >= 3 && !whisperUnlocked) {
      setWhisperUnlocked(true);
      setTimeout(() => setWhisperUnlocked(false), 10000);
    }
  }, [whisperCard?.unlocked, completedToday, whisperUnlocked]);

  useEffect(() => {
    if (shadowCard && !shadowSignal) {
      setShadowSignal({
        title: shadowCard.title,
        content: shadowCard.content,
        subtitle: shadowCard.subtitle,
        action: shadowCard.action,
      });
    }
  }, [shadowCard, shadowSignal]);

  const eveningMetabolizationShownRef = useRef(false);
  useEffect(() => {
    if (eveningCard && currentGate === "night" && !eveningMetabolizationOpen && !eveningMetabolizationShownRef.current) {
      eveningMetabolizationShownRef.current = true;
      setEveningMetabolizationOpen(true);
    }
  }, [eveningCard, currentGate, eveningMetabolizationOpen]);

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

  const moments = useMemo((): MomentData[] => {
    const now = new Date();
    const hour = now.getHours();
    return [
      {
        id: "morning",
        label: "Morning",
        icon: Sun,
        description: "Awakening · arrive in the day",
        available: true,
        status: hour < 12 ? "current" : hour < 18 ? "completed" : "completed",
        time: userTimeProfile?.wakeTime ? new Date(`1970-01-01T${userTimeProfile.wakeTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "6:00 AM",
      },
      {
        id: "midday",
        label: "Afternoon",
        icon: Mountain,
        description: "Presence · meet the moment",
        available: true,
        status: hour >= 12 && hour < 18 ? "current" : hour < 12 ? "locked" : "completed",
        time: userTimeProfile?.lunchTime ? new Date(`1970-01-01T${userTimeProfile.lunchTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "12:00 PM",
      },
{
        id: "evening",
        label: "Integration",
        icon: Waves,
        description: "Gather what the day held",
        available: true,
        status: hour >= 18 && hour < 22 ? "current" : hour < 18 ? "locked" : "completed",
        time: userTimeProfile?.workEnd ? new Date(`1970-01-01T${userTimeProfile.workEnd}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "6:00 PM",
      },
      {
        id: "night",
        label: "Sanctuary",
        icon: Moon,
        description: "Let the day settle",
        available: true,
        status: hour >= 22 || hour < 6 ? "current" : "locked",
        time: userTimeProfile?.sleepTime ? new Date(`1970-01-01T${userTimeProfile.sleepTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "10:00 PM",
      },
    ];
  }, [userTimeProfile]);

  const experienceItems = useMemo((): ExperienceItem[] => [
    {
      id: "body-scan",
      title: "Body awareness scan",
      description: "A 7-step somatic session — your body holds wisdom your mind hasn't accessed yet",
      whyNow: "Body dimension at 0. Focus on deep body scanning and somatic awareness.",
      category: "experience",
      icon: Activity,
      destination: { route: "/app/practice?type=body-scan" },
    },
    {
      id: "journaling",
      title: "Journaling prompt",
      description: "What sounds can you hear at this moment?",
      whyNow: "Selected from your current journey",
      category: "reflect",
      icon: BookOpen,
      destination: { route: "/app/journal", prompt: "What sounds can you hear at this moment?" },
    },
    {
      id: "dream-exploration",
      title: "Dream exploration",
      description: "Decode the symbols your unconscious sent you last night",
      whyNow: "Selected from your current journey",
      category: "experience",
      icon: Wind,
      destination: { route: "/app/guide?journey=1", prompt: "Help me explore my dreams from last night and decode the symbols my unconscious sent me." },
    },
  ], []);

  const explorerDoorways = useMemo((): ExplorerDoorway[] => [
    { id: "mind", label: "Mind", icon: Brain, description: "Thoughts, patterns, clarity", prompt: "I want to explore my mind — thoughts, patterns, and mental clarity." },
    { id: "emotions", label: "Emotions", icon: Heart, description: "Feelings, moods, resonance", prompt: "I want to explore my emotional landscape — what I'm feeling and why." },
    { id: "body", label: "Body", icon: Activity, description: "Sensation, energy, tension", prompt: "I want to explore my body — sensations, energy, and where I hold tension." },
    { id: "relationships", label: "Relationships", icon: Users, description: "Connection, boundaries, intimacy", prompt: "I want to explore my relationships — connection, boundaries, and intimacy." },
    { id: "attention", label: "Attention", icon: Eye, description: "Focus, distraction, presence", prompt: "I want to explore my attention — where it goes, what pulls it, and how to anchor it." },
    { id: "self", label: "Sense of self", icon: User, description: "Identity, narrative, witness", prompt: "I want to explore my sense of self — identity, the stories I tell, and the witness within." },
  ], []);

  const potholes = useMemo((): PotholeItem[] => [
    { id: "bedtime-anxiety", label: "Bedtime → Anxiety Loop", icon: Moon, description: "Tomorrow's worries arrive early" },
    { id: "rumination", label: "Lying in bed → Rumination Loop", icon: Wind, description: "Mental replay prevents sleep" },
    { id: "control", label: "Next day planning → Control Loop", icon: Brain, description: "Planning replaces rest" },
  ], []);

  const challenges = useMemo((): ChallengeItem[] => [
    { id: "body-awareness", label: "Body awareness at 0", description: "Body awareness at 0", opportunity: "Every sensation today is a doorway to presence" },
    { id: "somatic-numbness", label: "Somatic numbness", description: "Somatic numbness", opportunity: "Your body speaks in whispers — lean in to listen" },
    { id: "physical-tension", label: "Physical tension patterns", description: "Physical tension patterns", opportunity: "Where you hold tension is where you hold truth" },
  ], []);

  const observations = useMemo((): ObservationItem[] => [
    { id: "identity", label: "Lay down today's identity", prompt: "Who remains?" },
    { id: "exhale", label: "Long exhale", prompt: "What releases without effort?" },
    { id: "dreams", label: "Tonight, let the body speak in dreams", prompt: "Listen." },
  ], []);

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

  const lifeDomains = useMemo((): LifeDomain[] => {
    const domains = [
      { key: "awareness", label: "Awareness", score: profile?.dimension_bands?.awareness ?? null },
      { key: "body", label: "Body", score: profile?.dimension_bands?.body ?? null },
      { key: "social", label: "Social", score: profile?.dimension_bands?.social ?? null },
      { key: "finances", label: "Finances", score: profile?.dimension_bands?.finances ?? null },
      { key: "creativity", label: "Creativity", score: profile?.dimension_bands?.creativity ?? null },
      { key: "innerPeace", label: "Inner Peace", score: profile?.dimension_bands?.innerPeace ?? null },
    ];
    return domains.map(d => ({
      ...d,
      hasData: d.score !== null,
    }));
  }, [profile?.dimension_bands]);

  const initialLoading = isLoading && !data && !engineData;

  if (initialLoading) {
    return (
      <>
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
      </>
    );
  }

  const handleExploreDoorway = (doorway: ExplorerDoorway) => {
    try {
      sessionStorage.setItem("journeySession:aiContext", doorway.prompt);
      sessionStorage.setItem("journeySession:ts", String(Date.now()));
    } catch (error) {
      console.warn("[ConsciousOSHome] Could not preserve exploration context for the Guide.", error);
    }
    navigate("/app/guide?journey=1");
  };

  const handleExperienceClick = (item: ExperienceItem) => {
    if (item.destination.prompt) {
      try {
        sessionStorage.setItem("journeySession:aiContext", item.destination.prompt);
        sessionStorage.setItem("journeySession:ts", String(Date.now()));
      } catch (error) {
        console.warn("[ConsciousOSHome] Could not preserve context.", error);
      }
    }
    navigate(item.destination.route + (item.destination.prompt ? "?journey=1" : ""));
  };

  return (
    <>
      {celebrationNode}

      <main className="relative min-h-screen overflow-hidden text-foreground">
        <header className="sticky top-0 z-40">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-primary/80">ConsciousOS</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.19em] text-muted-foreground/65">
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
                  <Moon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/app/settings")}
                  aria-label="Open your profile and settings"
                  className="grid h-10 w-10 place-items-center rounded-full border border-primary/15 bg-card/60 text-primary/80 transition hover:border-primary/35 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Star className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pt-8 lg:px-12">
          <ScrollArea className="h-[calc(100vh-5.5rem)]">
            <div className="space-y-16 sm:space-y-24">
              {/* Arrival & Orb Section */}
              <section className="relative" aria-label="Arrival and Orb">
                <div className="mx-auto mt-8 grid max-w-5xl items-center gap-3 sm:mt-12 lg:grid-cols-[1fr_0.92fr] lg:gap-10">
                  <ArrivalExperience
                    userName={profile?.display_name || "friend"}
                    theme={theme ?? null}
                    themeLoading={isLoading}
                  />

                  <div className="relative mx-auto w-full max-w-[min(78vw,390px)] lg:max-w-[430px] aspect-square rounded-full" style={{ background: "#0D0A08" }}>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-[5%] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.17), hsl(var(--gold-700) / 0.07) 48%, transparent 74%)" }} />
                    <div className="relative w-full h-full">
                      <iframe
                        src="/oversoul-orb.html?embed=1"
                        title="Oversoul — living consciousness orb"
                        sandbox="allow-scripts allow-same-origin allow-camera allow-microphone allow-accelerometer allow-gyroscope allow-fullscreen"
                        allow="camera; microphone; accelerometer; gyroscope; fullscreen; autoplay"
                        className="w-full h-full border-0 rounded-full"
                        style={{ background: "transparent" }}
                        loading="eager"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Present Journey - Theme & Day */}
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

              {/* The Day in Four Moments */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="moments-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 id="moments-heading" className="text-section-heading text-primary font-display font-medium">
                      The day, in four moments
                    </h2>
                    <p className="text-micro text-muted/70 tracking-metadata uppercase">
                      Choose a moment to find a practice or reflection
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {moments.map((moment, index) => (
                      <motion.div
                        key={moment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <MomentCard
                          moment={moment}
                          onClick={() => moment.available && setSelectedMoment(moment.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Your Daily Intelligence */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="intelligence-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 id="intelligence-heading" className="text-section-heading text-primary font-display font-medium">
                      Your daily intelligence
                    </h2>
                    <p className="text-micro text-muted/70 tracking-metadata uppercase">
                      These are suggestions from your plan, not observations about your feelings or patterns.
                    </p>
                  </div>
                  <div className="flex gap-3 mb-6" role="tablist" aria-label="Intelligence categories">
                    {(["experience", "reflect", "explore"] as const).map((tab) => (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        aria-controls={`intelligence-${tab}`}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          activeTab === tab
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {experienceItems
                      .filter(item => activeTab === "explore" || item.category === activeTab)
                      .map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <ExperienceCard
                            item={item}
                            onClick={() => handleExperienceClick(item)}
                          />
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              </section>

              {/* The Inner Explorer */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="explorer-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-6">
                    <h2 id="explorer-heading" className="text-section-heading text-primary font-display font-medium mb-2">
                      The inner explorer
                    </h2>
                    <p className="text-secondary text-muted leading-relaxed max-w-xl">
                      Where would you like to look? Choose a doorway. Your guide will begin with what you want to explore, not an assumption about what you feel.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {explorerDoorways.map((doorway, index) => (
                      <motion.div
                        key={doorway.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.7 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <ExplorerDoorwayCard
                          doorway={doorway}
                          onClick={() => handleExploreDoorway(doorway)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Wisdom Universe */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="wisdom-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 id="wisdom-heading" className="text-section-heading text-primary font-display font-medium">
                      Wisdom Universe
                    </h2>
                    <Badge variant="gold" size="sm">7 / 8 unlocked</Badge>
                  </div>
                  <WisdomUniverseV2 />
                </motion.div>
              </section>

              {/* Evening Metabolization */}
              {currentGate === "night" && (
                <section className="w-full max-w-5xl mx-auto" aria-labelledby="metabolization-heading">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="mb-6">
                      <h2 id="metabolization-heading" className="text-section-heading text-primary font-display font-medium mb-2">
                        Evening Metabolization
                      </h2>
                      <p className="text-secondary text-muted leading-relaxed">Night Sanctuary exclusive — complete before sleep</p>
                    </div>
                    <EveningMetabolizationCard
                      onBegin={() => setEveningMetabolizationOpen(true)}
                    />
                  </motion.div>
                </section>
              )}

              {/* Future Whisper */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="whisper-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-6">
                    <h2 id="whisper-heading" className="text-section-heading text-primary font-display font-medium mb-2">
                      Future Whisper
                    </h2>
                    <p className="text-secondary text-muted leading-relaxed">3 missions to unlock</p>
                  </div>
                  <FutureWhisperCard
                    completedToday={completedToday}
                    whisper={whisperCard}
                    onCompleteMission={completeMission}
                  />
                </motion.div>
              </section>

              {/* Theme */}
              {theme && (
                <section className="w-full max-w-5xl mx-auto" aria-labelledby="theme-heading">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="mb-6">
                      <h2 id="theme-heading" className="text-section-heading text-primary font-display font-medium mb-2">
                        Theme
                      </h2>
                      <p className="text-secondary text-muted leading-relaxed">Today's Theme</p>
                    </div>
                    <ThemeCard theme={theme} />
                  </motion.div>
                </section>
              )}

              {/* Sanctuary Inquiry */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="sanctuary-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-6">
                    <h2 id="sanctuary-heading" className="text-section-heading text-primary font-display font-medium mb-2">
                      Sanctuary
                    </h2>
                    <p className="text-secondary text-muted leading-relaxed">Inquiry</p>
                  </div>
                  <SanctuaryInquiryCard
                    question={theme?.inner_inquiry || "What does sanctuary feel like in the body right now?"}
                    onExplore={() => handleExploreDoorway({ 
                      id: "body", 
                      label: "Body", 
                      icon: Activity, 
                      description: "Sensation, energy, tension", 
                      prompt: "I want to explore my body — sensations, energy, and where I hold tension." 
                    })}
                  />
                </motion.div>
              </section>

              {/* Guru Insight */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="guru-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-6">
                    <h2 id="guru-heading" className="text-section-heading text-primary font-display font-medium mb-2">
                      Guru Insight
                    </h2>
                    <p className="text-secondary text-muted leading-relaxed">{activeGuru?.name || "Rumi"} · {activeGuru?.path || "Sufism"}</p>
                  </div>
                  <GuruInsightCard
                    quote={activeGuru?.bio || "The wound is the place where the Light enters you. Don't turn away. Keep your gaze there."}
                    guru={activeGuru}
                    onListen={() => navigate("/app/guide?journey=1")}
                  />
                </motion.div>
              </section>

              {/* Potholes */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="potholes-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 id="potholes-heading" className="text-section-heading text-primary font-display font-medium">
                      Potholes
                    </h2>
                    <p className="text-micro text-muted/70 tracking-metadata uppercase">Predictive — based on your active loops & calendar</p>
                  </div>
                  <div className="space-y-3">
                    {potholes.map((pothole, index) => (
                      <motion.div
                        key={pothole.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.5 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <PotholeCard pothole={pothole} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Challenges */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="challenges-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 id="challenges-heading" className="text-section-heading text-primary font-display font-medium">
                      Challenges
                    </h2>
                    <p className="text-micro text-muted/70 tracking-metadata uppercase">Growth opportunities from your body dimension (0) & loops</p>
                  </div>
                  <div className="space-y-3">
                    {challenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.6 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <ChallengeCard challenge={challenge} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Observations */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="observations-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 id="observations-heading" className="text-section-heading text-primary font-display font-medium">
                      Observations
                    </h2>
                    <p className="text-micro text-muted/70 tracking-metadata uppercase">Micro-awareness prompts for Sanctuary gate</p>
                  </div>
                  <div className="space-y-3">
                    {observations.map((observation, index) => (
                      <motion.div
                        key={observation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.7 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <ObservationCard observation={observation} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Discovery Universe */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="constellation-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 id="constellation-heading" className="text-section-heading text-primary font-display font-medium">
                      Your discovery universe
                    </h2>
                    <p className="text-secondary text-muted leading-relaxed">The constellation of your explorations</p>
                  </div>
                  <Constellation nodes={constellationNodes} />
                  <div className="mt-6 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullConstellation(true)}
                      className="text-micro tracking-metadata uppercase"
                    >
                      Explore full constellation
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              </section>

              {/* Life Map */}
              <section className="w-full max-w-5xl mx-auto" aria-labelledby="lifemap-heading">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-6">
                    <h2 id="lifemap-heading" className="text-section-heading text-primary font-display font-medium mb-2">
                      Your life map
                    </h2>
                    <p className="text-secondary text-muted leading-relaxed">Awareness, lived</p>
                    <p className="text-micro text-muted/70 tracking-metadata uppercase mt-1">Profile estimates for reflection, not validated measures of consciousness.</p>
                  </div>
                  <LifeMapCard domains={lifeDomains} />
                </motion.div>
              </section>
            </div>
          </ScrollArea>
        </div>

        <SilentSpace
          isOpen={silentSpaceOpen}
          onClose={() => setSilentSpaceOpen(false)}
          orb={
            <div className="relative aspect-square w-full max-w-[390px] rounded-full" style={{ background: "#0D0A08" }}>
              <iframe
                src="/oversoul-orb.html?embed=1"
                title="Oversoul — living consciousness orb"
                sandbox="allow-scripts allow-same-origin allow-camera allow-microphone allow-accelerometer allow-gyroscope allow-fullscreen"
                allow="camera; microphone; accelerometer; gyroscope; fullscreen; autoplay"
                className="w-full h-full border-0 rounded-full"
                style={{ background: "transparent" }}
                loading="eager"
              />
            </div>
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

        <EveningMetabolizationOverlay
          isOpen={eveningMetabolizationOpen}
          onClose={() => setEveningMetabolizationOpen(false)}
          onComplete={async (data) => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from("journal_entries").insert({
                  user_id: user.id,
                  content: data.line,
                  tags: ["evening_metabolization", "night"],
                  metadata: { gratitudes: data.gratitudes, scan_notes: data.scanNotes },
                });
              }
            } catch (e) {
              console.error("Failed to save evening metabolization:", e);
            }
          }}
          prompt={eveningCard?.metadata?.prompt}
        />

        <ShadowSignalToast
          isOpen={!!shadowSignal}
          onClose={() => setShadowSignal(null)}
          signal={shadowSignal}
        />

        <WhisperUnlockToast
          isOpen={whisperUnlocked}
          onClose={() => setWhisperUnlocked(false)}
          whisper={whisperCard ? { content: whisperCard.content } : undefined}
        />
      </main>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

function MomentCard({ moment, onClick }: { moment: MomentData; onClick: () => void }) {
  const Icon = moment.icon;
  const statusClasses = {
    current: "glass-gold-card gilt-border-intense animate-breathe-gold",
    completed: "glass-card glass-card-hover",
    locked: "glass-card-subtle opacity-60 pointer-events-none",
    available: "glass-card glass-card-hover",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={moment.status === "locked"}
      className={`relative group rounded-2xl p-5 transition-all ${statusClasses[moment.status]} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
      aria-disabled={moment.status === "locked"}
    >
      <div className="absolute top-3 right-3">
        <Badge
          variant={
            moment.status === "current" ? "gold-intense" :
            moment.status === "completed" ? "success" :
            moment.status === "locked" ? "default" : "glass-gold"
          }
          size="xs"
          className="font-display tracking-wider"
        >
          {moment.status === "current" ? "Now" : moment.status === "completed" ? "Done" : moment.status === "locked" ? "Locked" : "Available"}
        </Badge>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          moment.status === "current" ? "bg-gold-primary/20 text-gold-primary" :
          moment.status === "completed" ? "bg-green-500/20 text-green-400" :
          "bg-muted/30 text-muted"
        }`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-card-heading text-primary font-medium">{moment.label}</h3>
          <p className="text-micro text-muted/60 tracking-metadata uppercase">{moment.time}</p>
        </div>
      </div>
      <p className="text-secondary text-muted leading-relaxed mb-4">{moment.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-micro text-gold-primary/70 font-medium">
          {moment.status === "locked" ? "Unlocks later" : "Tap to enter"}
        </span>
        <ChevronRight className="w-4 h-4 text-gold-primary/50 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
      </div>
    </button>
  );
}

function ExperienceCard({ item, onClick }: { item: ExperienceItem; onClick: () => void }) {
  const Icon = item.icon;
  const categoryColors = {
    experience: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    reflect: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    practice: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  return (
    <Card variant="glass" hover className="gilt-border overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${categoryColors[item.category]}`}>
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="glass-gold"
                  size="xs"
                  className="font-display tracking-wider"
                >
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </Badge>
                <h4 className="text-card-heading text-primary font-medium">{item.title}</h4>
              </div>
            </div>
            <p className="text-secondary text-muted leading-relaxed mb-2">{item.description}</p>
            <p className="text-micro text-muted/60 tracking-metadata uppercase">Why now · {item.whyNow}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gold-primary/50 group-hover:translate-x-1 transition-transform flex-shrink-0" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}

function ExplorerDoorwayCard({ doorway, onClick }: { doorway: ExplorerDoorway; onClick: () => void }) {
  const Icon = doorway.icon;

  return (
    <Card variant="glass-gold" hover className="gilt-border overflow-hidden text-center">
      <CardContent className="p-5">
        <div className="w-12 h-12 rounded-xl bg-gold-primary/15 flex items-center justify-center text-gold-primary mx-auto mb-4">
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-card-heading text-primary font-medium mb-2">{doorway.label}</h3>
        <p className="text-secondary text-muted leading-relaxed mb-4">{doorway.description}</p>
        <div className="h-px bg-gradient-to-r from-transparent via-gold-primary/40 to-transparent mb-4" />
        <span className="text-micro text-gold-primary/80 font-medium tracking-metadata uppercase block">
          Explore {doorway.label.toLowerCase()}
          <ChevronRight className="w-3 h-3 inline ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function EveningMetabolizationCard({ onBegin }: { onBegin: () => void }) {
  return (
    <Card variant="glass-gold-intense" className="gilt-border-intense overflow-hidden animate-breathe-gold">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-primary/20 flex items-center justify-center text-gold-primary glow-ambient-gold">
            <Moon className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-card-heading text-primary font-medium mb-2 text-gold-leaf">Evening Metabolization</h3>
            <p className="text-secondary text-muted leading-relaxed mb-4">
              "The pattern I saw today was ____. It lives in my ____ (body part). I witness it."
            </p>
            <p className="text-micro text-muted/60 tracking-metadata uppercase mb-4">
              Three moments you caught yourself — that's the victory.
            </p>
            <p className="text-secondary text-muted leading-relaxed mb-6">
              Body scan for sleep: toes to crown. Tense 3s. Release completely. Feel surrender.
            </p>
            <Button variant="gold" onClick={onBegin} className="w-full sm:w-auto glow-ambient-gold">
              Begin Metabolization
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FutureWhisperCard({ completedToday, whisper, onCompleteMission }: { completedToday: number; whisper: any; onCompleteMission: any }) {
  const missionsRemaining = Math.max(0, 3 - completedToday);
  const unlocked = completedToday >= 3;

  return (
    <Card variant="glass-gold" className="gilt-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-primary/15 flex items-center justify-center text-gold-primary">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-card-heading text-primary font-medium mb-2 text-gold-shimmer">Future Whisper</h3>
            <p className="text-secondary text-muted leading-relaxed mb-4">
              Complete 3 missions today to unlock a whisper from your future self.
            </p>
            <div className="flex items-center gap-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      i <= completedToday
                        ? "border-gold-primary bg-gold-primary text-bg-deep-obsidian shadow-[0_0_20px_rgba(198,161,91,0.4)]"
                        : "border-border/30 text-muted-foreground/40 bg-muted/30"
                    }`}
                  >
                    {i <= completedToday ? (
                      <span className="text-sm font-bold">✓</span>
                    ) : (
                      <span className="text-micro font-display text-gold-primary">{i}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {unlocked && whisper?.content && (
              <div className="p-4 rounded-xl bg-gold-primary/5 border border-gold-primary/30 mb-4 glass-gold">
                <p className="text-body text-gold-champagne leading-relaxed font-editorial italic text-glow-gold">
                  "{whisper.content}"
                </p>
              </div>
            )}
            {!unlocked && (
              <Button
                variant="gold-ghost"
                onClick={() => startDailySession()}
                disabled={completedToday >= 3}
                className="w-full sm:w-auto"
              >
                Complete Mission ({missionsRemaining} remaining)
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeCard({ theme }: { theme: ThemeAny }) {
  return (
    <Card variant="glass-gold" hover className="gilt-border overflow-hidden">
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-micro text-gold-primary/70 mb-2 tracking-metadata uppercase">Today's Theme</p>
          <h2 className="text-page-heading text-primary font-display font-medium leading-tight tracking-tight mb-3 text-gold-leaf">
            {(theme as any).title || "stillness"}
          </h2>
          {(theme as any).description && (
            <p className="text-secondary text-muted max-w-md mx-auto leading-relaxed mb-4">
              {(theme as any).description}
            </p>
          )}
          <p className="text-micro text-muted/70 tracking-metadata uppercase">
            Integration · This thread · layer {(theme as any).current_depth ?? 0} of {(theme as any).max_depth ?? 5} · {(theme as any).evolution_status ?? 'open'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SanctuaryInquiryCard({ question, onExplore }: { question: string; onExplore: () => void }) {
  return (
    <Card variant="glass-gold-intense" className="gilt-border-intense overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-primary/15 flex items-center justify-center text-gold-primary">
            <Leaf className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-card-heading text-primary font-medium mb-2 text-gold-leaf">Inner Inquiry</h3>
            <p className="text-secondary text-muted leading-relaxed mb-4">Hold the question. Don't answer.</p>
            <p className="text-body text-gold-champagne leading-relaxed font-editorial italic mb-6 text-glow-gold">
              "{question}"
            </p>
            <Button variant="gold-ghost" onClick={onExplore} className="w-full sm:w-auto">
              Explore in Guide
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GuruInsightCard({ quote, guru, onListen }: { quote: string; guru: any; onListen: () => void }) {
  return (
    <Card variant="glass-gold" className="gilt-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar size="lg" shape="circle" className="bg-gold-primary/15 ring-2 ring-gold-primary/30">
            <AvatarFallback className="text-gold-primary font-display text-card-heading">
              {guru?.name?.charAt(0) || "R"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-body text-gold-champagne leading-relaxed font-editorial italic mb-4 text-glow-gold">
              "{quote}"
            </p>
            <Button variant="ghost" size="sm" onClick={onListen} className="text-micro tracking-metadata uppercase">
              Listen in Guide
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PotholeCard({ pothole }: { pothole: PotholeItem }) {
  const Icon = pothole.icon;
  return (
    <Card variant="glass" hover className="gilt-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h4 className="text-card-heading text-primary font-medium">{pothole.label}</h4>
            <p className="text-secondary text-muted">{pothole.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChallengeCard({ challenge }: { challenge: ChallengeItem }) {
  return (
    <Card variant="glass" hover className="gilt-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gold-primary/15 flex items-center justify-center text-gold-primary">
            <Zap className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h4 className="text-card-heading text-primary font-medium">{challenge.label}</h4>
            <p className="text-secondary text-muted mb-2">{challenge.description}</p>
            <p className="text-secondary text-gold-primary/90 leading-relaxed text-sm text-glow-gold">
              Opportunity: {challenge.opportunity}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ObservationCard({ observation }: { observation: ObservationItem }) {
  return (
    <Card variant="glass-gold" hover className="gilt-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-secondary text-muted leading-relaxed">
              <span className="text-gold-primary font-medium">👁️ {observation.label}. </span>
              {observation.prompt}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LifeMapCard({ domains }: { domains: LifeDomain[] }) {
  return (
    <Card variant="glass-gold" hover className="gilt-border overflow-hidden">
      <CardContent className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {domains.map((domain) => (
            <div key={domain.key} className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke="rgba(130, 123, 109, 0.2)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 36}
                    strokeDashoffset={2 * Math.PI * 36 * (1 - (domain.score ?? 0) / 100)}
                    className="transition-all duration-1000 group-hover:stroke-primary/80"
                    style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-card-heading text-primary font-mono tabular-nums">
                    {domain.score !== null ? domain.score : "—"}
                  </span>
                </div>
              </div>
              <p className="text-micro text-muted tracking-metadata uppercase">{domain.label}</p>
              {!domain.hasData && (
                <p className="text-[9px] text-muted/50 mt-1">No estimate yet</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}