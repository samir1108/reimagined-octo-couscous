import type { StepKind } from "./types";
import type { SessionStep } from "./types";

export interface CompletionPayload {
  [key: string]: unknown;
}

export interface CompletionContract {
  canAutoComplete: boolean;
  validateCompletion: (step: SessionStep, payload: unknown) => boolean;
  getDefaultPayload: () => CompletionPayload;
  minDurationSeconds?: number;
  requiresUserAction: boolean;
}

export const completionContracts: Record<StepKind, CompletionContract> = {
  "breathwork": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completedSeconds?: number };
      const total = Number((step.params as Record<string, unknown>)?.durationSeconds) || 60;
      return (p?.completedSeconds ?? 0) >= Math.min(total, 10);
    },
    getDefaultPayload: () => ({ completedSeconds: 0 }),
    requiresUserAction: true,
  },
  "witness": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { thoughts?: number; durationSec?: number };
      return (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ thoughts: 0, durationSec: 0 }),
    requiresUserAction: true,
  },
  "silent_sit": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { durationSec?: number };
      return (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ durationSec: 0 }),
    requiresUserAction: true,
  },
  "body_scan": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completedRegions?: string[] };
      return Array.isArray(p?.completedRegions);
    },
    getDefaultPayload: () => ({ completedRegions: [] }),
    requiresUserAction: true,
  },
  "body_region_focus": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { noticed?: boolean };
      return p?.noticed === true || p?.noticed === undefined;
    },
    getDefaultPayload: () => ({ noticed: false }),
    requiresUserAction: true,
  },
  "self_inquiry": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { reflected?: boolean; response?: string };
      return p?.reflected === true || (p?.response?.length ?? 0) > 0;
    },
    getDefaultPayload: () => ({ reflected: false, response: "" }),
    requiresUserAction: true,
  },
  "selection": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { selection?: string | string[] };
      return p?.selection !== undefined && (Array.isArray(p.selection) ? p.selection.length > 0 : true);
    },
    getDefaultPayload: () => ({ selection: undefined }),
    requiresUserAction: true,
  },
  "rating": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { value?: number };
      return typeof p?.value === "number";
    },
    getDefaultPayload: () => ({ value: 5 }),
    requiresUserAction: true,
  },
  "journal": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { length?: number };
      return (p?.length ?? 0) > 0;
    },
    getDefaultPayload: () => ({ length: 0 }),
    requiresUserAction: true,
  },
  "free_write": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { length?: number };
      return (p?.length ?? 0) > 0;
    },
    getDefaultPayload: () => ({ length: 0 }),
    requiresUserAction: true,
  },
  "timer": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { elapsedSeconds?: number };
      return (p?.elapsedSeconds ?? 0) > 0;
    },
    getDefaultPayload: () => ({ elapsedSeconds: 0 }),
    requiresUserAction: true,
  },
  "mantra": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { count?: number };
      return (p?.count ?? 0) > 0;
    },
    getDefaultPayload: () => ({ count: 0 }),
    requiresUserAction: true,
  },
  "visualization": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "audio": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { listenedSeconds?: number };
      return (p?.listenedSeconds ?? 0) > 0;
    },
    getDefaultPayload: () => ({ listenedSeconds: 0 }),
    requiresUserAction: true,
  },
  "sound_bath": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { listenedSeconds?: number };
      return (p?.listenedSeconds ?? 0) > 0;
    },
    getDefaultPayload: () => ({ listenedSeconds: 0 }),
    requiresUserAction: true,
  },
  "experiment": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completedSteps?: number };
      return (p?.completedSteps ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completedSteps: 0 }),
    requiresUserAction: true,
  },
  "reflection": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { reflected?: boolean };
      return p?.reflected !== false;
    },
    getDefaultPayload: () => ({ reflected: true }),
    requiresUserAction: true,
  },
  "wisdom-read": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { read?: boolean; durationSec?: number };
      return p?.read === true || (p?.durationSec ?? 0) >= 5;
    },
    getDefaultPayload: () => ({ read: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "scripture": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { read?: boolean; durationSec?: number };
      return p?.read === true || (p?.durationSec ?? 0) >= 5;
    },
    getDefaultPayload: () => ({ read: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "micro-act": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean };
      return p?.completed !== false;
    },
    getDefaultPayload: () => ({ completed: true }),
    requiresUserAction: true,
  },
  "guide-chat": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { hadReply?: boolean };
      return p?.hadReply !== false;
    },
    getDefaultPayload: () => ({ hadReply: false }),
    requiresUserAction: true,
  },
  "temple-chat": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { hadReply?: boolean };
      return p?.hadReply !== false;
    },
    getDefaultPayload: () => ({ hadReply: false }),
    requiresUserAction: true,
  },
  "practice": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "movement": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "walking": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "yoga_asana": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "stretching": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "tai_chi": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "balance": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "gratitude": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { count?: number };
      return (p?.count ?? 0) > 0;
    },
    getDefaultPayload: () => ({ count: 0 }),
    requiresUserAction: true,
  },
  "loving_kindness": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "forgiveness": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; durationSec?: number };
      return p?.completed === true || (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, durationSec: 0 }),
    requiresUserAction: true,
  },
  "affirmation": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completed?: boolean; repetitions?: number };
      return p?.completed === true || (p?.repetitions ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completed: false, repetitions: 0 }),
    requiresUserAction: true,
  },
  "contemplation": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { durationSec?: number };
      return (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ durationSec: 0 }),
    requiresUserAction: true,
  },
  "noticing": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { count?: number; durationSec?: number };
      return (p?.durationSec ?? 0) > 0;
    },
    getDefaultPayload: () => ({ count: 0, durationSec: 0 }),
    requiresUserAction: true,
  },
  "plan": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { accepted?: boolean };
      return p?.accepted !== false;
    },
    getDefaultPayload: () => ({ accepted: false }),
    requiresUserAction: true,
  },
  "data-step": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { viewed?: boolean };
      return p?.viewed !== false;
    },
    getDefaultPayload: () => ({ viewed: false }),
    requiresUserAction: true,
  },
  "emotion_check": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { emotion?: string };
      return !!p?.emotion;
    },
    getDefaultPayload: () => ({ emotion: "", intensity: 5 }),
    requiresUserAction: true,
  },
  "breath_hold": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { completedRounds?: number };
      return (p?.completedRounds ?? 0) > 0;
    },
    getDefaultPayload: () => ({ completedRounds: 0 }),
    requiresUserAction: true,
  },
  "intention_set": {
    canAutoComplete: true,
    validateCompletion: (step, payload) => {
      const p = payload as { text?: string };
      return (p?.text?.length ?? 0) > 0;
    },
    getDefaultPayload: () => ({ text: "" }),
    requiresUserAction: true,
  },
} as Record<StepKind, CompletionContract>;

export function getCompletionContract(kind: StepKind): CompletionContract {
  return completionContracts[kind] ?? {
    canAutoComplete: true,
    validateCompletion: () => true,
    getDefaultPayload: () => ({}),
    requiresUserAction: true,
  };
}
