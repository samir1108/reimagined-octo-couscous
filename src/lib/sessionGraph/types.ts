/**
 * SESSION GRAPH — the bridge between knowledge and a sitting.
 * ───────────────────────────────────────────────────────────
 * Nodes: concepts, capabilities, practices, loop families, domains, arcs,
 * claims. Edges: prerequisite, trains, dissolves, applies_to, covers.
 *
 * The generator walks the graph to answer one question: what is the next
 * honest step, and what must come before it?
 */

export type NodeKind =
  | "concept"
  | "capability"
  | "practice"
  | "loop_family"
  | "domain"
  | "arc"
  | "claim";

export type EdgeRelation =
  | "prerequisite"
  | "trains"
  | "dissolves"
  | "applies_to"
  | "covers";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: EdgeRelation;
  weight?: number;
}

export interface SessionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphSignals {
  /** concept id or capability id -> 0..5 */
  capabilityLevels?: Record<string, number>;
  /** concept id -> 0..1 */
  familiarity?: Record<string, number>;
  activeLoops?: string[];
  /** domain id -> 0..10 */
  domainScores?: Record<string, number>;
  stressedDomains?: string[];
}

export interface Gap {
  kind: Exclude<NodeKind, "arc" | "claim">;
  id: string;
  label: string;
  severity: number;
  evidence: string[];
}

export type SessionIntent = "orient" | "first_contact" | "train";

export interface SpecStep {
  title: string;
  body: string;
  kind: "teach" | "taste" | "question" | "carry";
  minutes: number;
}

export interface SessionSpec {
  concept: string;
  label: string;
  intent: SessionIntent;
  minutes: number;
  level: number;
  practice: string;
  arcId: string | null;
  claimIds: string[];
  steps: SpecStep[];
  path: string[];
  gap: Gap;
  why: string;
  evidence: string[];
}
