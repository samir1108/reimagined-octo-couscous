export interface PersonalizationThread {
  id: string;
  question: string;
  status: string;
  depthMode: string;
  sessionsCount: number;
  source: string;
  confidence: number;
  lastExploredAt: string | null;
}

export interface PersonalizationGoal {
  id: string;
  goal: string;
  lifeDomain: string | null;
  status: string;
  source: string;
  confidence: number;
}

export interface PersonalizationPattern {
  id: string;
  trigger: string;
  reaction: string;
  underlyingConcern: string | null;
  typicalResponse: string | null;
  desiredResponse: string | null;
  evidenceCount: number;
  confidence: number;
  source: string;
}

export interface PersonalizationObservation {
  id: string;
  sessionId: string | null;
  threadId: string | null;
  observation: string;
  confirmed: boolean;
  confidence: number;
  createdAt: string;
}

export interface PersonalizationExperiment {
  id: string;
  threadId: string | null;
  sessionId: string | null;
  action: string;
  observationPrompt: string;
  outcome: string;
  createdAt: string;
}

export interface UserPersonalization {
  primaryThread: PersonalizationThread | null;
  openThreads: PersonalizationThread[];
  goals: PersonalizationGoal[];
  patterns: PersonalizationPattern[];
  confirmedObservations: PersonalizationObservation[];
  activeExperiment: PersonalizationExperiment | null;
}
