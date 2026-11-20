/**
 * ConsciousOS Universal Session Engine
 * ────────────────────────────────
 * Every training session follows the same architecture:
 *
 *   ARRIVE → BASELINE → TRAIN → CHALLENGE → REFLECT → INTEGRATE → CHECK-IN → PROGRESS
 *
 * This module:
 *   - defines the session data model
 *   - assembles a session from program + day + user state
 *   - computes scores and progression
 */

import type { ProgramDefinition, ProgramPhase, getProgramPhase } from "./programs";
import type { CapabilityState, CapabilityLevel } from "./capabilityMap";

// ─── Session types ───────────────────────────────────────────────────────────

export type SessionPhaseId =
  | "arrive"
  | "baseline"
  | "train"
  | "challenge"
  | "reflect"
  | "integrate"
  | "checkin"
  | "progress";

export interface SessionPhase {
  id: SessionPhaseId;
  label: string;
  description: string;
  durationSec: number;
  type: "practice" | "game" | "challenge" | "reflection" | "integration" | "checkin" | "progress";
  gameId?: string;
  practiceId?: string;
  experimentId?: string;
  prompt?: string;
  instructions: string[];
}

export interface SessionDefinition {
  id: string;
  programId: string;
  day: number;
  phaseLabel: string;
  capabilitySlugs: string[];
  totalDurationSec: number;
  phases: SessionPhase[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  xpReward: number;
  checkIns: string[];
}

// ─── Session assembly ────────────────────────────────────────────────────────

export function buildSessionForDay(
  program: ProgramDefinition,
  day: number,
  userStates: CapabilityState[]
): SessionDefinition {
  const phase = program.phases.find((p) => day >= p.days[0] && day <= p.days[1]);
  if (!phase) {
    throw new Error(`No phase found for day ${day} in program ${program.slug}`);
  }

  const difficulty = Math.min(5, 1 + Math.floor((day - 1) / 6));
  const xpReward = difficulty * 10 + phase.capabilities.length * 5;

  const phases: SessionPhase[] = [];

  // 01 · Arrive
  phases.push({
    id: "arrive",
    label: "Arrive",
    description: "Arrive fully in this moment.",
    durationSec: 30,
    type: "practice",
    practiceId: "prac_breath_awareness",
    instructions: [
      "Sit comfortably.",
      "Close your eyes or soften your gaze.",
      "Take three conscious breaths.",
      "Arrive here, now.",
    ],
  });

  // 02 · Baseline
  phases.push({
    id: "baseline",
    label: "Baseline",
    description: "Quick check of your current state.",
    durationSec: 60,
    type: "practice",
    practiceId: "prac_baseline_check",
    instructions: [
      "Notice your current mental state.",
      "Rate your focus, energy, and mood.",
      "No judgment — just observe.",
    ],
  });

  // 03 · Train (game)
  const trainGameId = phase.gameIds[0] || "game_signal";
  phases.push({
    id: "train",
    label: "Train",
    description: `Train: ${trainGameId}`,
    durationSec: 120 + difficulty * 30,
    type: "game",
    gameId: trainGameId,
    instructions: [
      `Play ${trainGameId} for this session.`,
      "Focus fully on the task.",
      "Notice when your mind wants to leave.",
      "Return gently.",
    ],
  });

  // 04 · Challenge (if phase has experiment)
  if (phase.experimentIds.length > 0 && day % 3 === 0) {
    phases.push({
      id: "challenge",
      label: "Challenge",
      description: "Real-world test.",
      durationSec: 300,
      type: "challenge",
      experimentId: phase.experimentIds[0],
      instructions: [
        `Today's challenge: ${phase.experimentIds[0]}`,
        "Set a timer.",
        "Complete the challenge.",
        "Notice resistance, stay with it.",
      ],
    });
  }

  // 05 · Reflect
  phases.push({
    id: "reflect",
    label: "Reflect",
    description: "What did you notice?",
    durationSec: 120,
    type: "reflection",
    prompt: getReflectionPrompt(phase.capabilities[0]),
    instructions: [
      "Take a moment to look back.",
      "What pulled your attention away?",
      "What surprised you?",
      "Write or speak your reflection.",
    ],
  });

  // 06 · Integrate
  phases.push({
    id: "integrate",
    label: "Integrate",
    description: "Connect to real life.",
    durationSec: 60,
    type: "integration",
    instructions: [
      "Tomorrow, notice the first moment...",
      getIntegrationPrompt(phase.capabilities[0]),
      "Write it down.",
      "Set an intention.",
    ],
  });

  // 07 · Check-in
  phases.push({
    id: "checkin",
    label: "Check-in",
    description: "How are you feeling now?",
    durationSec: 30,
    type: "checkin",
    instructions: [
      "Rate your current state.",
      "Any shifts from the beginning?",
      "Note any physical sensations.",
    ],
  });

  // 08 · Progress
  phases.push({
    id: "progress",
    label: "Progress",
    description: "Your training data.",
    durationSec: 30,
    type: "progress",
    instructions: [
      "Here's your progress.",
      "Keep showing up.",
      "Every session counts.",
    ],
  });

  const totalDurationSec = phases.reduce((sum, p) => sum + p.durationSec, 0);

  return {
    id: `sess_${program.slug}_d${day}`,
    programId: program.id,
    day,
    phaseLabel: phase.label,
    capabilitySlugs: phase.capabilities,
    totalDurationSec,
    phases,
    difficulty,
    xpReward,
    checkIns: [],
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getReflectionPrompt(capabilitySlug: string): string {
  const prompts: Record<string, string> = {
    sustained_attention: "How many times did you notice your attention leaving the task?",
    distraction_resistance: "What pulled at you the hardest? How did you respond?",
    impulse_control: "What impulse did you notice today? What happened?",
    body_awareness: "What did you notice in your body that you hadn't noticed before?",
    breath_awareness: "How did your breath change during the session?",
    emotional_awareness: "What emotion was most present today?",
    thought_awareness: "What thought pattern kept recurring?",
    self_awareness: "What did you learn about yourself today?",
    observation: "What did you see that you usually miss?",
    meditation: "What was the quality of your stillness today?",
    witnessing_thoughts: "Were you able to watch thoughts without engaging?",
  };
  return prompts[capabilitySlug] || "What did you notice during this session?";
}

function getIntegrationPrompt(capabilitySlug: string): string {
  const prompts: Record<string, string> = {
    sustained_attention: "Notice the first moment your mind leaves a task tomorrow.",
    distraction_resistance: "Notice the first moment you reach for your phone.",
    impulse_control: "Notice the first urge you feel today.",
    body_awareness: "Notice your posture when you sit down to work.",
    breath_awareness: "Take one conscious breath before every meeting.",
    emotional_awareness: "Name every emotion you feel today.",
    thought_awareness: "Write down every repetitive thought.",
    self_awareness: "Check in with yourself every 2 hours.",
    observation: "Notice one thing you usually overlook today.",
    meditation: "Take 3 conscious breaths before responding to anything.",
    witnessing_thoughts: "Notice the thought, don't become it.",
  };
  return prompts[capabilitySlug] || "Apply this awareness in your daily life.";
}

// ─── Progression ─────────────────────────────────────────────────────────────

export function computeXpForLevel(level: CapabilityLevel): number {
  return level * 100;
}

export function computeLevelFromXp(totalXp: number): CapabilityLevel {
  if (totalXp < 100) return 0;
  if (totalXp < 300) return 1;
  if (totalXp < 600) return 2;
  if (totalXp < 1000) return 3;
  if (totalXp < 1500) return 4;
  return 5;
}

export function computeNextLevelXp(level: CapabilityLevel): number {
  const thresholds = [0, 100, 300, 600, 1000, 1500];
  return thresholds[Math.min(level + 1, 5)];
}

export function updateCapabilityState(
  current: CapabilityState,
  xpGained: number,
  score: number
): CapabilityState {
  const newXp = current.xp + xpGained;
  const newLevel = computeLevelFromXp(newXp);
  const leveledUp = newLevel > current.level;

  return {
    ...current,
    level: newLevel,
    xp: newXp,
    xpToNext: computeNextLevelXp(newLevel) - newXp,
    lastTrainedAt: new Date().toISOString(),
    totalSessions: current.totalSessions + 1,
    bestScore: current.bestScore === null ? score : Math.max(current.bestScore, score),
    trend: leveledUp ? "up" : score > (current.bestScore || 0) * 0.8 ? "up" : "stable",
  };
}
