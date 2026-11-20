/**
 * HUMAN MODEL — the private encyclopedia.
 * ───────────────────────────────────────
 * Twelve layers, one living document per person. This is the substrate the
 * session generator and the 1/3/10-year projection both read from. It is
 * descriptive, not diagnostic: every state carries evidence and confidence.
 */

export type HumanLayerId =
  | "body"
  | "emotion"
  | "thought"
  | "identity"
  | "behavior"
  | "relational"
  | "work"
  | "time"
  | "meaning"
  | "environment"
  | "history"
  | "potential";

export type HumanTrajectory = "rising" | "stable" | "declining";

export type ObservationSource =
  | "session"
  | "journal"
  | "assessment"
  | "loop"
  | "profile"
  | "manual";

export interface HumanObservation {
  id?: string;
  layer: HumanLayerId;
  signal: string;
  /** Normalised 0..1 so every layer is comparable. */
  value: number;
  source: ObservationSource;
  at: string;
  confidence: number;
}

export interface LayerPrediction {
  low: number;
  mid: number;
  high: number;
}

export interface HumanLayer {
  id: HumanLayerId;
  /** Normalised 0..1. Display multiplies by 10. */
  state: number;
  trajectory: HumanTrajectory;
  confidence: number;
  evidence: HumanObservation[];
  /** Concepts / practices that move this layer. */
  interventions: string[];
  predicted: {
    y1: LayerPrediction;
    y3: LayerPrediction;
    y10: LayerPrediction;
  };
}

export interface HumanModel {
  userId: string;
  version: number;
  builtAt: string;
  layers: Record<HumanLayerId, HumanLayer>;
  summary: {
    weakest: HumanLayerId;
    strongest: HumanLayerId;
    readiness: number;
    /** Layers with enough evidence to act on. */
    observedLayers: HumanLayerId[];
  };
}

export interface HumanLayerMeta {
  id: HumanLayerId;
  label: string;
  question: string;
  /** Default concept/practice that trains this layer. */
  intervention: string;
  /** Signals that belong here. */
  signals: string[];
}

export const HUMAN_LAYERS: HumanLayerMeta[] = [
  {
    id: "body",
    label: "Body",
    question: "What is the body actually reporting?",
    intervention: "breath",
    signals: ["sleep", "energy", "pain", "breath", "movement", "hrv"],
  },
  {
    id: "emotion",
    label: "Emotion",
    question: "What is felt, and what is avoided?",
    intervention: "emotion_observation",
    signals: ["mood", "triggers", "anger", "fear", "shame", "grief"],
  },
  {
    id: "thought",
    label: "Thought",
    question: "What is noticed, and what is believed?",
    intervention: "observation",
    signals: ["attention", "rumination", "belief", "narrative", "doubt"],
  },
  {
    id: "identity",
    label: "Identity",
    question: "What am I defending?",
    intervention: "self_inquiry",
    signals: ["self-concept", "ego", "validation", "comparison", "mask"],
  },
  {
    id: "behavior",
    label: "Behavior",
    question: "What do I actually do under pressure?",
    intervention: "karma",
    signals: ["habit", "avoidance", "procrastination", "impulse", "control"],
  },
  {
    id: "relational",
    label: "Relational",
    question: "Who am I when I am with others?",
    intervention: "bhakti",
    signals: ["family", "partner", "friends", "conflict", "approval"],
  },
  {
    id: "work",
    label: "Work & Money",
    question: "What is my contribution costing me?",
    intervention: "karma",
    signals: ["career", "purpose", "mastery", "money", "finance"],
  },
  {
    id: "time",
    label: "Time",
    question: "Am I living in the past, future, or now?",
    intervention: "raja",
    signals: ["urgency", "procrastination", "planning", "regret", "anticipation"],
  },
  {
    id: "meaning",
    label: "Meaning",
    question: "What is this all for?",
    intervention: "bhakti",
    signals: ["faith", "doubt", "devotion", "ethics", "death", "purpose"],
  },
  {
    id: "environment",
    label: "Environment",
    question: "What is the room doing to me?",
    intervention: "body",
    signals: ["place", "noise", "light", "digital", "social context"],
  },
  {
    id: "history",
    label: "History",
    question: "What happened, and what is still happening?",
    intervention: "self_inquiry",
    signals: ["loss", "win", "turning point", "trauma", "memory"],
  },
  {
    id: "potential",
    label: "Potential",
    question: "What is actually available next?",
    intervention: "observation",
    signals: ["capability", "readiness", "edge", "ceiling"],
  },
];

export const HUMAN_LAYER_IDS: HumanLayerId[] = HUMAN_LAYERS.map((l) => l.id);

export const CONCEPT_LAYER: Record<string, HumanLayerId> = {
  observation: "thought",
  witness: "thought",
  self_inquiry: "identity",
  neti_neti: "identity",
  breath: "body",
  body: "body",
  bhakti: "meaning",
  karma: "behavior",
  jnana: "thought",
  raja: "body",
  tantra: "emotion",
  emotion_observation: "emotion",
};

export const HUMAN_MODEL_DISCLAIMER =
  "These are estimates from your own practice data — not a medical prediction, diagnosis, or fixed fate.";
