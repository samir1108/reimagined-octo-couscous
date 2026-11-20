import type { VLevel } from "@/types/consciousness";
import type { SessionPlan } from "@/lib/session-shell/types";

export type FoundationDepth = 0 | 1 | 2 | 3;

export type AdaptivePath = "observer" | "inquirer" | "integrator" | "devotional";

export type TraditionId = "kriya" | "karma" | "bhakti" | "jnana" | "tantra" | "dhyana";

export type ComponentKind =
  | "wisdom"
  | "guided"
  | "observation"
  | "inquiry"
  | "mission"
  | "night"
  | "integration";

export type AvailableMinutes = 3 | 10 | 20 | 40;

export type FoundationPace = "gentle" | "steady" | "deep";
export type FoundationTone = "plain" | "warm" | "philosophical";

export interface FoundationTuning {
  minutes: AvailableMinutes;
  pace: FoundationPace;
  path?: AdaptivePath;
  inquiry: boolean;
  tone: FoundationTone;
  voice: boolean;
}

export interface FoundationComponent {
  kind: ComponentKind;
  minutes: number;
  title: string;
  prompt: string;
  evidenceTarget: string;
  optional?: boolean;
}

export interface FoundationDayMeta {
  day: number;
  chapter: number;
  chapterTitle: string;
  theme: string;
  concept: string;
  practice: string;
  mission: string;
  night: string;
  outcome: string;
}

export interface FoundationDayInput {
  day: number;
  vLevel: Pick<VLevel, "value" | "band" | "microLevel"> &
    Partial<Pick<VLevel, "witnessQuality">>;
  pathAffinity?: Partial<Record<TraditionId, number>>;
  adaptivePath?: AdaptivePath;
  minutesAvailable?: AvailableMinutes;
  energy?: "low" | "medium" | "high";
  stateBand?: number;
  bypassRisk?: boolean;
  loops?: Array<{ id: string; severity: string }>;
  tuning?: Partial<FoundationTuning>;
}

export interface FoundationExploration {
  kind: "neti-neti" | "guru" | "civilization" | "text" | "v-level";
  ref: string;
  label: string;
}

export interface FoundationDayPlan {
  day: number;
  chapter: number;
  chapterTitle: string;
  theme: string;
  concept: string;
  outcome: string;
  depth: FoundationDepth;
  path: AdaptivePath;
  minutes: number;
  components: FoundationComponent[];
  exploration?: FoundationExploration;
  evidenceTargets: string[];
  vLevelValue: number;
  sessionPlan: SessionPlan;
}
