import { useMemo, useState, useCallback } from "react";
import {
  type SessionFlowContext,
  type SessionType,
  type SessionPhase,
  type MasterContext,
  getSessionTypeFromTime,
  generateSystemPrompt,
  generateFirstMessage,
} from "@/lib/sessionFlow";
import type { ThemeContext } from "@/lib/sessionFlow";

interface UseSessionFlowInput {
  sessionType?: SessionType;
  userName: string;
  streak: number;
  journeyDay: number;
  bandLevel?: number;
  bandName?: string;
  focusDimension?: string;
  language?: string;
  theme: ThemeContext | null;
  master?: MasterContext | null;
  morningSession?: {
    completed: boolean;
    summary?: string;
    insights?: string;
  };
  dayActivity?: {
    journalEntries: { count: number; themes?: string[] };
    practiceDone: boolean;
    practiceType?: string;
    practiceDuration?: number;
    tasksCompleted: number;
    tasksMissed: number;
    dominantMood?: string;
    energyLevel?: number;
  };
  yesterdaySummary?: string;
  missedDays?: number;
  unknownConcepts?: string[];
}

interface UseSessionFlowOutput {
  sessionType: SessionType;
  phase: SessionPhase;
  systemPrompt: string | null;
  firstMessage: string | null;
  context: SessionFlowContext | null;
  advancePhase: () => void;
  resetPhases: () => void;
}

/**
 * Hook to manage session flow state and generate AI prompts
 * Used by Guide page for morning, evening, and night sessions
 */
export function useSessionFlow(input: UseSessionFlowInput): UseSessionFlowOutput {
  const {
    sessionType: explicitSessionType,
    userName,
    streak,
    journeyDay,
    bandLevel,
    bandName,
    focusDimension,
    language = "en",
    theme,
    master,
    morningSession,
    dayActivity,
    yesterdaySummary,
    missedDays,
    unknownConcepts,
  } = input;

  // Determine session type from prop or time
  const sessionType = explicitSessionType || getSessionTypeFromTime();

  // Track phase locally
  const [phase, setPhase] = useState<SessionPhase>("greeting");

  // Build context object
  const context = useMemo<SessionFlowContext | null>(() => {
    if (!theme) return null;

    return {
      sessionType,
      phase,
      user: {
        userName,
        streak,
        journeyDay,
        bandLevel,
        bandName,
        focusDimension,
        language,
      },
      theme,
      master,
      morningSession,
      dayActivity,
      yesterdaySummary,
      missedDays,
      unknownConcepts,
    };
  }, [
    sessionType,
    phase,
    userName,
    streak,
    journeyDay,
    bandLevel,
    bandName,
    focusDimension,
    language,
    theme,
    master,
    morningSession,
    dayActivity,
    yesterdaySummary,
    missedDays,
    unknownConcepts,
  ]);

  // Generate system prompt
  const systemPrompt = useMemo(() => {
    if (!context) return null;
    return generateSystemPrompt(context);
  }, [context]);

  // Generate first message
  const firstMessage = useMemo(() => {
    if (!context) return null;
    return generateFirstMessage(context);
  }, [context]);

  // Advance to next phase
  const advancePhase = useCallback(() => {
    setPhase((prev) => {
      const phaseOrder: SessionPhase[] = [
        "greeting",
        "theme_introduction",
        "exploration",
        "practice",
        "integration",
        "closing",
      ];
      const idx = phaseOrder.indexOf(prev);
      if (idx < phaseOrder.length - 1) {
        return phaseOrder[idx + 1];
      }
      return prev;
    });
  }, []);

  // Reset phases
  const resetPhases = useCallback(() => {
    setPhase("greeting");
  }, []);

  return {
    sessionType,
    phase,
    systemPrompt,
    firstMessage,
    context,
    advancePhase,
    resetPhases,
  };
}
