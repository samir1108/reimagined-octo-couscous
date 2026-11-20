"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GURUS } from "@/lib/guru-data";
import { useNotifications } from "@/hooks/useNotifications";
import BreakthroughCelebration from "@/components/BreakthroughCelebration";
import { useOnboardingNotifications } from "@/hooks/useOnboardingNotifications";
import { useCompanionEngine } from "@/hooks/useCompanionEngine";
import { useDetectBypassing } from "@/hooks/usePracticeMatrix";
import { useOrientation } from "@/hooks/useOrientation";
import { usePreJourney } from "@/hooks/usePreJourney";

interface NotificationMetadata {
  breakthroughId?: string;
}

interface Notification {
  read: boolean;
  type: string;
  title: string;
  metadata: NotificationMetadata | null;
  created_at: string;
}

interface Guru {
  id: string;
  name: string;
}

interface EngineData {
  profile?: {
    dimension_bands?: Record<string, number | null>;
    active_loops?: string[];
    streak_current?: number;
    journey_day?: number;
    overall_band?: number;
    user_id?: string;
    display_name?: string;
  };
  activeLoops?: string[];
  guruName?: string;
  todayCard?: { guruName?: string };
  activeGuruProgram?: { guru_id?: string };
  plan?: { journeyDay?: number; vLevel?: number };
}

interface TimeAskChoice {
  minutes: number;
  energy: "low" | "medium" | "high" | "adaptive";
  guruId?: string;
  intent?: string;
}

interface UseHomeOverlaysOptions {
  profile: { user_id?: string; active_loops?: string[] } | null;
  journeyDay: number;
  theme: { title?: string; description?: string } | null;
  activeGuru: { id?: string; name?: string } | null;
  engineData: EngineData | null;
  userTimeProfile: { wakeTime?: string; sleepTime?: string } | undefined;
  navigate: (path: string) => void;
  onTimeAskConfirm: (choice: TimeAskChoice) => void;
}

export function useHomeOverlays({
  profile,
  journeyDay,
  theme,
  activeGuru,
  engineData,
  userTimeProfile,
  navigate,
  onTimeAskConfirm,
}: UseHomeOverlaysOptions) {
  // Full-screen cinematic Guide chat overlay (replaces navigate to /guide)
  const [guideOverlayOpen, setGuideOverlayOpen] = useState(false);
  // Daily Mirror - Guide handoff. When set, the overlay's opening AI turn
  // replies to this check-in instead of running the generic daily greeting.
  const [mirrorSeedMessage, setMirrorSeedMessage] = useState<string | undefined>(undefined);
  const [mirrorSeedContext, setMirrorSeedContext] = useState<string | undefined>(undefined);

  // Gate Entry Sheet
  const [gateSheetOpen, setGateSheetOpen] = useState(false);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);

  // TimeAskSheet
  const [timeAskOpen, setTimeAskOpen] = useState(false);

  // Breakthrough celebrations
  const { notifications, markRead } = useNotifications(profile?.user_id);
  const lastCelebratedRef = useRef<string | null>(null);
  const [celebrationState, setCelebrationState] = useState<{ breakthroughId: string; notificationId: string } | null>(null);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const now = Date.now();
    const candidate = notifications.find((n) => {
      if (n.read) return false;
      if (n.type !== "milestone") return false;
      const meta = (n.metadata || {}) as NotificationMetadata;
      const looksLikeBreakthrough = typeof meta.breakthroughId === "string" || /breakthrough/i.test(n.title);
      if (!looksLikeBreakthrough) return false;
      const createdAt = new Date(n.created_at).getTime();
      return now - createdAt < 60 * 60 * 1000;
    });

    if (!candidate) return;
    if (lastCelebratedRef.current === candidate.id) return;

    const meta = (candidate.metadata || {}) as NotificationMetadata;
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

  // Seed onboarding notifications for days 1-7
  useOnboardingNotifications(profile?.user_id, journeyDay);

  // Trigger companion engine on app open
  useCompanionEngine(profile?.user_id);

  // Silent background: bypassing detection on mount
  const bypassingDetector = useDetectBypassing();
  const bypassingRan = useRef(false);
  useEffect(() => {
    if (!bypassingRan.current && profile?.user_id) {
      bypassingRan.current = true;
      bypassingDetector.mutate();
    }
  }, [profile?.user_id, bypassingDetector]);

  // Orientation row is loaded (and created on first run) here so the
  // orientation system always has its progress record - same as before.
  useOrientation(profile?.user_id as string | undefined);

  const closeGuide = useCallback(() => {
    setGuideOverlayOpen(false);
    setMirrorSeedMessage(undefined);
    setMirrorSeedContext(undefined);
  }, []);

  // PreJourney/Mirror handoff - when a mirror is pending, the orb hands off
  // to it before unknown sitting can begin (same contract as before).
  const { state: preJourneyState } = usePreJourney();

  // Gate Entry Sheet handlers
  const handleEnterGate = useCallback((gate: string) => {
    setSelectedGate(gate);
    setGateSheetOpen(true);
  }, []);

  const handleGateSheetClose = useCallback(() => {
    setGateSheetOpen(false);
    setSelectedGate(null);
  }, []);

  const handleGateStartSession = useCallback((config: {
    gate: string;
    focusType: string;
    durationMin: number;
    energy: "low" | "medium" | "high" | "adaptive";
    guideStyle: "gentle" | "direct" | "inquiry" | "devotional" | "silent";
    intent?: string;
  }) => {
    handleGateSheetClose();
    setTimeAskOpen(true);
    // Pre-fill the time ask sheet with gate-specific config
    setTimeout(() => {
      const choice: TimeAskChoice = {
        minutes: config.durationMin,
        energy: config.energy,
        guruId: activeGuru?.id,
        intent: config.intent,
      };
      localStorage.setItem("time-ask:last", JSON.stringify(choice));
    }, 0);
  }, [activeGuru?.id, handleGateSheetClose]);

  // TimeAskSheet onTalkFirst handler
  const handleTimeAskTalkFirst = useCallback((choice: TimeAskChoice) => {
    const selectedGuru = choice.guruId
      ? (GURUS.find((g) => g.id === choice.guruId) || activeGuru)
      : activeGuru;
    const params = new URLSearchParams();
    params.set("presession", "1");
    params.set("minutes", String(choice.minutes));
    params.set("energy", choice.energy);
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
  }, [theme, activeGuru, navigate]);

  return {
    celebrationNode,
    preJourneyState,
    guideOverlayOpen,
    setGuideOverlayOpen,
    mirrorSeedMessage,
    setMirrorSeedMessage,
    mirrorSeedContext,
    setMirrorSeedContext,
    gateSheetOpen,
    setGateSheetOpen,
    selectedGate,
    setSelectedGate,
    timeAskOpen,
    setTimeAskOpen,
    closeGuide,
    handleEnterGate,
    handleGateSheetClose,
    handleGateStartSession,
    handleTimeAskTalkFirst,
  };
}