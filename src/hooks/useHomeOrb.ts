"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { conscious, consciousFromError } from "@/lib/consciousToast";
import { getCurrentGateForSchedule, type GateId } from "@/lib/consciousness/dailyGates";
import { useFutureWhisper } from "@/hooks/useFutureWhisper";
import { supabase } from "@/lib/supabase";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface SessionPlan {
  sessionNumber: number;
  title: string;
  closing: { nextHint?: string };
}

interface EngineProfile {
  overall_band?: number;
  user_id?: string;
}

interface UseHomeOrbOptions {
  regenerating: boolean;
  preJourneyPendingMirror: boolean;
  theme: { title?: string; id?: string } | null;
  profile: EngineProfile | null;
  userTimeProfile: { wakeTime?: string; sleepTime?: string } | undefined;
  sutraPlan: SessionPlan | null;
  refreshSutra: () => void;
  navigate: (path: string) => void;
  setRegenerating: (v: boolean) => void;
  setTimeAskOpen: (v: boolean) => void;
  setPendingSutraOpen: (v: boolean) => void;
  setSutraOpen: (v: boolean) => void;
  setActivePlan: (plan: SessionPlan | null) => void;
  onTimeAskConfirm: (choice: TimeAskChoice) => void;
  buildSessionPlan: () => SessionPlan | null;
  /** Real refresh work — Home wires this to query invalidation. */
  onRefresh?: () => Promise<void> | void;
}

interface TimeAskChoice {
  minutes: number;
  energy: "low" | "medium" | "high" | "adaptive";
  guruId?: string;
  intent?: string;
}

export function useHomeOrb({
  regenerating,
  preJourneyPendingMirror,
  theme,
  profile,
  userTimeProfile,
  sutraPlan,
  refreshSutra,
  navigate,
  setRegenerating,
  setTimeAskOpen,
  setPendingSutraOpen,
  setSutraOpen,
  setActivePlan,
  onTimeAskConfirm,
  buildSessionPlan,
  onRefresh,
}: UseHomeOrbOptions) {
  const { whisper } = useFutureWhisper();

  // Phase 10 - auto-resume: if there's an active generative session, offer to
  // return to it rather than composing another one.
  const [activeGenSessionId, setActiveGenSessionId] = useState<string | null>(null);

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

  // Pull to refresh
  const { ref: pullRef, isPulling, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh: async () => {
      if (navigator.vibrate) navigator.vibrate(50);
      if (onRefresh) await onRefresh();
    },
    enabled: !regenerating,
  });

  // Haptic feedback helper
  const haptic = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const startDailySession = useCallback(() => {
    if (regenerating) return;
    if (preJourneyPendingMirror) {
      navigate('/app/before');
      return;
    }
    setTimeAskOpen(true);
  }, [regenerating, preJourneyPendingMirror, navigate, setTimeAskOpen]);

  const startPracticeNow = useCallback(() => {
    if (regenerating) return;
    if (preJourneyPendingMirror) {
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
    onTimeAskConfirm(choice);
  }, [regenerating, preJourneyPendingMirror, navigate, onTimeAskConfirm]);

  const recoverFromObserveWait = useCallback(() => {
    setRegenerating(false);
    setPendingSutraOpen(false);
    if (sutraPlan) {
      setSutraOpen(true);
      return;
    }
    startPracticeNow();
    refreshSutra();
  }, [setRegenerating, setPendingSutraOpen, sutraPlan, setSutraOpen, startPracticeNow, refreshSutra]);

  return {
    pullRef,
    isPulling,
    isRefreshing,
    pullProgress,
    haptic,
    startDailySession,
    startPracticeNow,
    recoverFromObserveWait,
    activeGenSessionId,
    setActiveGenSessionId,
    whisper,
  };
}

export default useHomeOrb;