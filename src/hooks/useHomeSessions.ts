"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { conscious, consciousRetry } from "@/lib/consciousToast";
import { saveLastSittingEssence } from "@/lib/whisperChain";
import { orchestrateSession, loadTodaysSessions, loadLastTheme, type SessionPlan } from "@/lib/sessionOrchestrator";
import { readNeedDecision } from "@/lib/needEngine";
import { loadSuitability, prescribe } from "@/lib/prescription";
import { useNextSession } from "@/hooks/useNextSession";
import { getCurrentGateForSchedule, isGateId } from "@/lib/consciousness/dailyGates";
import type { Session } from "@/types/database";

type SessionOrchestratorDimension = "body" | "thought" | "emotion" | "awareness";

interface EngineProfile {
  dimension_bands?: Record<string, number | null>;
  active_loops?: string[];
  streak_current?: number;
  journey_day?: number;
  overall_band?: number;
  user_id?: string;
  display_name?: string;
}

interface UseHomeSessionsOptions {
  theme: { title?: string; description?: string; id?: string } | null;
  profile: EngineProfile | null;
  userTimeProfile: { wakeTime?: string; sleepTime?: string } | undefined;
  engineData: { profile?: EngineProfile; activeLoops?: string[] } | null;
  activeGuruId?: string;
  navigate: (path: string) => void;
}

export function useHomeSessions({
  theme,
  profile,
  userTimeProfile,
  engineData,
  activeGuruId,
  navigate,
}: UseHomeSessionsOptions) {
  const { plan: sutraPlan, refresh: refreshSutra } = useNextSession();

  // --- OrbSession runtime ---
  const [activePlan, setActivePlan] = useState<SessionPlan | null>(null);
  const [sessionsToday, setSessionsToday] = useState<SessionPlan[]>(() => loadTodaysSessions());
  // Cinematic intro shown when user holds the orb - before chat starts
  const [introOpen, setIntroOpen] = useState(false);
  const [sutraOpen, setSutraOpen] = useState(false);
  // When user taps the orb but sutraPlan isn't ready yet, remember the intent
  // and open SessionIntroCard automatically as soon as the plan arrives.
  const [pendingSutraOpen, setPendingSutraOpen] = useState(false);

  // If the user requested to open the session card before the plan was ready,
  // open it as soon as the plan arrives.
  useEffect(() => {
    if (pendingSutraOpen && sutraPlan) {
      setSutraOpen(true);
      setPendingSutraOpen(false);
    }
  }, [pendingSutraOpen, sutraPlan]);

  const buildSessionPlan = useCallback(() => {
    const prior = loadTodaysSessions();
    const bands = engineData?.profile?.dimension_bands;
    let weakestDimension: SessionOrchestratorDimension | undefined;
    if (bands) {
      const entries = Object.entries(bands as Record<string, number | null>).filter(([k]) => k !== "total");
      if (entries.length) {
        entries.sort((a, b) => (Number(a[1] ?? 0)) - (Number(b[1] ?? 0)));
        weakestDimension = entries[0]?.[0] as SessionOrchestratorDimension | undefined;
      }
    }
    const userName = profile && "display_name" in profile ? (profile as EngineProfile).display_name || "friend" : "friend";
    return orchestrateSession({
      hour: new Date().getHours(),
      sessionsToday: prior.length,
      lastSessionToday: prior[prior.length - 1],
      lastTheme: loadLastTheme(),
      daysSinceLastSession: 0,
      userName,
      bandLevel: profile?.overall_band as number | undefined,
      activeLoops: (engineData?.activeLoops?.map((l: string) => l) || []),
      energy: "medium",
      todayTheme: theme ? { title: theme.title, description: theme.description } : null,
      weakestDimension,
    });
  }, [engineData, profile, theme]);

  const handleTimeAskConfirm = useCallback(async (choice: {
    minutes: number;
    energy: string;
    guruId?: string;
    intent?: string;
    /** Gate chosen by the surface that started the sitting (e.g. a rhythm card). */
    gate?: string;
  }) => {
    conscious("unfolding", { band: profile?.overall_band as number | undefined });
    const requestedGate = choice.gate ?? null;
    const gate = isGateId(requestedGate)
      ? requestedGate
      : getCurrentGateForSchedule(new Date(), userTimeProfile?.wakeTime, userTimeProfile?.sleepTime);
    const themeTag = theme?.title ? `[Day thread: ${theme.title}] ` : "";
    const intent = choice.intent
      ? choice.gate
        ? `${themeTag}${choice.intent}`
        : `${themeTag}User asked: ${choice.intent}`
      : undefined;

    const need = await readNeedDecision(profile?.user_id ?? null, {
      energy: choice.energy as "low" | "medium" | "high",
      timeBudgetMin: choice.minutes,
    }).catch(() => null);
    const suitability = loadSuitability();
    const prescription = need
      ? prescribe({
          need,
          suitability,
          energy: choice.energy as "low" | "medium" | "high",
          timeBudgetMin: choice.minutes,
        })
      : undefined;
    const effectiveMinutes = prescription
      ? Math.min(choice.minutes, Math.max(3, prescription.dose.minutes))
      : choice.minutes;

    try {
      const { startGenerativeSession } = await import("@/lib/session-shell/api");
      const { sessionId } = await startGenerativeSession({
        intent,
        themeId: theme?.id || null,
        timeBudgetMin: effectiveMinutes,
        energy: choice.energy as "low" | "medium" | "high",
        gate,
        depth: "deep",
        prescription,
        suitability,
        need: need
          ? {
              concept: need.concept,
              label: need.label,
              intent: need.intent,
              familiarity: need.familiarity,
              minutes: need.shape.minutes,
              why: need.why,
              evidence: need.evidence,
            }
          : undefined,
      });
      conscious("noted", { band: profile?.overall_band as number | undefined, kind: "success" });
      navigate(`/app/session/${sessionId}`);
      return;
    } catch (e: unknown) {
      // Credits redirects are handled by triggerInsufficientCredits â€” don't
      // bypass them with a local session.
      if ((e as Error)?.message === "insufficient_credits") throw e;
      console.warn("[useHomeSessions] session composition failed:", e);
    }

    // Composition failed on the server. No session was created — the only
    // honest next step is a retry, never a locally invented sitting.
    consciousRetry({
      title: "Session could not be composed",
      description: "Nothing was started. Please retry in a moment.",
      band: profile?.overall_band as number | undefined,
    });
    // Soft fallback: keep the legacy SessionIntroCard path so user is never stuck
    if (sutraPlan) setSutraOpen(true);
    else { setPendingSutraOpen(true); refreshSutra(); }
  }, [theme, profile?.overall_band, profile?.user_id, userTimeProfile, sutraPlan, refreshSutra, navigate]);

  const handleIntroBegin = useCallback(() => {
    setIntroOpen(false);
    const params = new URLSearchParams();
    if (activeGuruId) params.set("guruId", activeGuruId);
    if (theme?.title) {
      const ctx = [
        `Today's theme: ${theme.title}`,
        theme.description ? `Theme description: ${theme.description}` : null,
        activeGuruId ? `Master for today: ${activeGuruId}` : null,
      ].filter(Boolean).join(" | ");
      const aiContext = `JOURNEY_SESSION: Begin a guided session with continuity. Greet warmly as ${activeGuruId || "the guide"} and propose what to explore today. Context - ${ctx}`;
      try {
        sessionStorage.setItem("journeySession:aiContext", aiContext);
        sessionStorage.setItem("journeySession:ts", String(Date.now()));
      } catch { /* ignore */ }
      params.set("journey", "1");
    }
    const qs = params.toString();
    navigate(`/app/guide${qs ? `?${qs}` : ""}`);
  }, [theme, activeGuruId, navigate]);

  const handleIntroSkip = useCallback(() => {
    setSutraOpen(false);
    setActivePlan(buildSessionPlan());
    refreshSutra();
  }, [buildSessionPlan, refreshSutra]);

  const handleSessionComplete = useCallback((plan: SessionPlan, fb: string) => {
    setSessionsToday(loadTodaysSessions());
    saveLastSittingEssence(fb || plan.title);
    toast({ title: `Session ${plan.sessionNumber} complete`, description: fb ? `You noted: "${fb}"` : plan.closing.nextHint || "Well done." });
  }, []);

  return {
    sutraPlan,
    refreshSutra,
    activePlan,
    setActivePlan,
    sessionsToday,
    setSessionsToday,
    introOpen,
    setIntroOpen,
    sutraOpen,
    setSutraOpen,
    pendingSutraOpen,
    setPendingSutraOpen,
    buildSessionPlan,
    handleTimeAskConfirm,
    handleIntroBegin,
    handleIntroSkip,
    handleSessionComplete,
  };
}
