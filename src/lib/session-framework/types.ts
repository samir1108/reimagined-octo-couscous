// Session Framework Type System
// Canonical types for Session Steps, Frameworks, and the Composer.
// Supports 400+ steps, 300 frameworks, millions of compositions.

export type SessionStepCategory =
  | "opening" | "question" | "observation" | "instruction" | "teaching"
  | "inquiry" | "reflection" | "dialogue" | "silence" | "journaling"
  | "somatic" | "breath" | "mantra" | "visualization"
  | "pattern-investigation" | "emotional-processing" | "wisdom"
  | "decision" | "transition" | "closing";

export type StepInteraction =
  | "display" | "question" | "choice" | "text-input" | "voice-input"
  | "guided-practice" | "timer" | "silence" | "audio"
  | "inquiry" | "reflection" | "dialogue" | "visualization"
  | "creative-canvas" | "visual-contemplation" | "memory-recall"
  | "sound-listening" | "body-map-selection" | "emotion-selection"
  | "free-text-reflection" | "multiple-choice-check-in" | "mantra-counter"
  | "real-world-mission" | "walking-guidance";

export type InteractionKind =
  | "guided-audio" | "silent-practice" | "single-question" | "multi-turn-dialogue"
  | "voice-reflection" | "free-text-reflection" | "multiple-choice-check-in"
  | "confidence-rating" | "emotion-selection" | "body-map-selection" | "attention-tap"
  | "breath-synchronized-animation" | "timed-observation" | "thought-counter"
  | "mantra-counter" | "walking-guidance" | "eyes-open-practice" | "eyes-closed-practice"
  | "visual-contemplation" | "sound-listening" | "creative-canvas" | "memory-recall"
  | "real-world-mission" | "conversation-rehearsal" | "post-practice-integration";

export interface SessionStepDefinition {
  id: string;
  category: SessionStepCategory;
  title: string;
  purpose: string;
  interaction: StepInteraction;
  defaultDurationSeconds?: number;
  requiresUserResponse: boolean;
  optional: boolean;
  canRepeat: boolean;
  canSkip: boolean;
  personalizationTags: string[];
  prerequisites?: string[];
  excludes?: string[];
  mustFollow?: string[];
  safetyProfile?: {
    intensity: "low" | "moderate" | "high";
    groundingAvailable: boolean;
    canSkip: boolean;
  };
  guidance?: string;
  prompt?: string;
}

export interface StepTransitionRule {
  condition: "always" | "on-response" | "on-skip" | "on-timeout" | "on-choice";
  nextStepId: string;
  choiceValue?: string;
  minDurationSeconds?: number;
}

export interface FrameworkStep {
  id: string;
  stepId: string;
  purpose: string;
  instructions?: string;
  durationSeconds?: number;
  interaction: StepInteraction;
  optional: boolean;
  transitions: StepTransitionRule[];
}

export interface AdaptationRule {
  id: string;
  trigger: string;
  condition?: string;
  action: "simplify" | "deepen" | "skip" | "pause" | "switch" | "shorten" | "extend" | "ground";
  params?: Record<string, unknown>;
  priority: number;
}

export interface CompletionCriteria {
  minStepsCompleted: number;
  requiredSteps?: string[];
  maxDurationMinutes?: number;
  userConfirmRequired: boolean;
}

export interface SessionFramework {
  id: string;
  name: string;
  family: string;
  purpose: string;
  suitableIntentions: string[];
  preferredDurations: number[];
  steps: FrameworkStep[];
  adaptationRules: AdaptationRule[];
  completionCriteria: CompletionCriteria;
  suitableGates?: string[];
  suitableEnergy?: string[];
  minJourneyDay?: number;
  maxJourneyDay?: number;
}

export interface FrameworkContext {
  userId: string;
  gate: string;
  energy: "low" | "medium" | "high";
  timeBudgetMin: number;
  journeyDay: number;
  activeLoops: string[];
  weakestDimension?: string;
  recentFrameworkIds: string[];
  recentStepIds: string[];
  preferences: Record<string, unknown>;
  mood?: string;
  daysSinceLastSession: number;
}

export interface ComposedStep {
  id: string;
  stepDefId: string;
  title: string;
  purpose: string;
  interaction: StepInteraction;
  durationSeconds: number;
  optional: boolean;
  canSkip: boolean;
  prompt?: string;
  guidance?: string;
  safetyProfile?: SessionStepDefinition["safetyProfile"];
}

export interface ComposedSession {
  id: string;
  frameworkId: string;
  frameworkName: string;
  purpose: string;
  steps: ComposedStep[];
  totalDurationSeconds: number;
  adaptationRules: AdaptationRule[];
  metadata: Record<string, unknown>;
}

export interface StepRegistry {
  steps: Map<string, SessionStepDefinition>;
  byCategory: Map<SessionStepCategory, SessionStepDefinition[]>;
  byTag: Map<string, SessionStepDefinition[]>;
}

export interface FrameworkRegistry {
  frameworks: Map<string, SessionFramework>;
  byFamily: Map<string, SessionFramework[]>;
  byIntention: Map<string, SessionFramework[]>;
  byGate: Map<string, SessionFramework[]>;
}
