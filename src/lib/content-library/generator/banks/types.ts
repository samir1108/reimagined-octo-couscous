/**
 * Shared archetype interfaces for the content generator.
 * Banks define archetypes with real, authored content; the generator
 * composes deterministic variants (duration / depth / context) from them.
 */

export interface PracticeArchetype {
  name: string;
  objective: string;
  instructions: string[];
  steps: { title: string; content: string; type: "instruction" | "practice" | "reflection" }[];
  widgets: string[];
  experience: string;
  contraindications: string[];
  safety: string;
  dimensions: string[];
  paths: string[];
  domains: string[];
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  baseDuration: number;
}

export interface MicroArchetype {
  name: string;
  objective: string;
  instruction: string;
  trigger: string;
  experience: string;
  widgets: string[];
  dimensions: string[];
  paths: string[];
  domains: string[];
  tags: string[];
  durationSeconds: number;
}

export interface WisdomArchetype {
  concept: string;
  tradition: string;
  source: string;
  explanation: string;
  application: string;
  questions: string[];
  references: string[];
  excerpt?: string;
  evidence: "traditional" | "research" | "clinical" | "inferred" | "user_reported";
  dimensions: string[];
  paths: string[];
  domains: string[];
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  minutes: number;
}

export interface GameArchetype {
  name: string;
  gameType: string;
  objective: string;
  description: string;
  mechanics: Record<string, unknown>;
  scoring: Record<string, unknown>;
  observations: string[];
  rounds: number;
  secondsPerRound: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  dimensions: string[];
  paths: string[];
  domains: string[];
  tags: string[];
  widgets: string[];
  levels: { level: number; name: string; unlock: string }[];
}

export interface ProgramArc {
  name: string;
  theme: string;
  durationDays: number;
  dailyMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  dimensions: string[];
  paths: string[];
  domains: string[];
  tags: string[];
  outcome: string;
  phases: { name: string; days: string; focus: string }[];
  dayTemplates: { title: string; focus: string; practiceKind: string; wisdomKind: string; mission: string }[];
}

export interface PodcastSeries {
  name: string;
  host: string;
  subcategory: string;
  description: string;
  episodeTitlePatterns: string[];
  episodeOutlines: string[][];
  dimensions: string[];
  paths: string[];
  domains: string[];
  tags: string[];
  minutes: number;
}
