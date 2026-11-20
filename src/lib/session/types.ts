// Unified Session Ontology — single source of truth for all session systems

export type SessionSystem =
  | 'pre-journey'
  | 'orb'
  | 'sankalpa'
  | 'practice'
  | 'witness'
  | 'temple'
  | 'guide-chat';

export type SessionStatus = 'planned' | 'active' | 'completed' | 'skipped';

export type StepKind =
  | 'wisdom-read'
  | 'breathwork'
  | 'journal'
  | 'micro-act'
  | 'reflection'
  | 'guide-chat'
  | 'practice'
  | 'temple-chat'
  | 'witness';

export type SessionMood =
  | 'settling'
  | 'confrontation'
  | 'reconciliation'
  | 'shadow-mirror'
  | 'stuck-loop-break'
  | 'lineage-initiation'
  | 're-entry'
  | 'celebration'
  | 'dissolution'
  | 'witness-deepening'
  | 'inquiry-spiral'
  | 'devotional'
  | 'karmic-action'
  | 'dark-night-hold'
  | null;

export type GateId = 'morning' | 'midday' | 'evening' | 'night';

export interface SessionStep {
  id: string;
  kind: StepKind;
  title: string;
  prompt?: string;
  params?: Record<string, unknown>;
  estMinutes: number;
  whyForYou?: string;
  signalRef?: string;
  completed?: boolean;
  skipped?: boolean;
  durationSeconds?: number;
}

export interface SessionContext {
  energy: 'low' | 'medium' | 'high';
  mood?: string;
  daysSinceLastSession: number;
  journeyDay: number;
  activeLoops: string[];
  weakestDimension?: string;
  practiceRecommendation?: Record<string, unknown>;
  conversationContext?: Record<string, unknown>;
  vLevelStart?: number;
  dimensionBandsStart?: Record<string, number>;
  composedBy?: string;
  toneWords?: string[];
  whyThisSession?: string;
}

export interface SessionPlan {
  id: string;
  system: SessionSystem;
  userId: string;
  status: SessionStatus;
  title: string;
  subtitle?: string;
  gate: GateId;
  gateLine?: string;
  archetype?: SessionMood;
  steps: SessionStep[];
  totalEstMinutes: number;
  context: SessionContext;
  metadata: {
    vLevelStart?: number;
    dimensionBandsStart?: Record<string, number>;
    composedBy?: string;
    toneWords?: string[];
    whyThisSession?: string;
    legacySystem?: string;
    legacyId?: string;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SessionCompletion {
  sessionId: string;
  completedStepCount: number;
  skippedStepCount: number;
  totalDurationMs: number;
  loopsTouched: string[];
  karmaEarned: number;
  shiftSummary?: string;
  nextTeaser?: string;
  vLevelDelta?: number;
  dimensionNudges?: { id: string; delta: number }[];
  qualityScore?: number;
  primaryPractice?: string | null;
}

export interface UserJourney {
  totalLifetimeSessions: number;
  currentStreak: number;
  longestStreak: number;
  journeyDay: number;
  todaySessions: SessionPlan[];
  currentGate: GateId;
  sessionsUntilNextMilestone: number;
  activeLoops: string[];
  weakestDimension: string;
  energy: 'low' | 'medium' | 'high';
  mood?: string;
  lastSessionDate?: string;
  isReturningAfterGap: boolean;
  gapDays: number;
  graceDaysRemaining: number;
  isPaused: boolean;
}

export interface SessionMoment {
  type: 'breakthrough' | 'mirror' | 'grace' | 'milestone' | 'depth' | 'arc-resolved' | 'return';
  message: string;
  visual: string;
  shareable: boolean;
  cooldownDays: number;
}

export interface SessionThread {
  userId: string;
  currentArc: string | null;
  arcStartedAt: string | null;
  sessionsInArc: number;
  arcIntensity: number;
  previousArcs: Array<{
    arc: string;
    sessions: number;
    completedAt: string;
    resolution: string;
  }>;
}

export interface SessionEvent {
  id: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
