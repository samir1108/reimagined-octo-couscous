/**
 * GRAPH BUILD + WALK
 * ──────────────────
 * The graph is assembled from the catalogs that already exist. There is no
 * second content universe here — only edges between the things we already ship.
 *
 * Node ids are namespaced (`concept:observation`, `cap:cap_in_observation`,
 * `arc:observer`) because the catalogs share words: body is both a concept and
 * a practice, and self_inquiry is both a concept and an arc.
 */

import { CONCEPTS, CONCEPT_IDS } from "@/lib/needEngine";
import { CAPABILITIES } from "@/lib/capabilities/capabilityMap";
import { PRACTICES, PRACTICE_META } from "@/lib/sutra/practices";
import { ARCS } from "@/lib/arcs";
import { ALL_CLAIMS } from "@/lib/knowledge";
import type { Gap, GraphEdge, GraphNode, GraphSignals, SessionGraph } from "./types";

export const GRAPH_CONCEPTS: Array<{ id: string; label: string; practice: string; prerequisites: string[] }> = [
  ...CONCEPT_IDS.map((id) => ({
    id,
    label: CONCEPTS[id].label,
    practice: CONCEPTS[id].practice,
    prerequisites: CONCEPTS[id].prerequisites.map((p) => p.concept),
  })),
  { id: "bhakti", label: "Bhakti", practice: "bhakti", prerequisites: ["observation"] },
  { id: "jnana", label: "Jnana", practice: "jnana", prerequisites: ["observation", "self_inquiry"] },
  { id: "karma", label: "Karma", practice: "karma", prerequisites: ["observation"] },
  { id: "raja", label: "Raja", practice: "raja", prerequisites: ["body", "breath"] },
];

const CONCEPT_CAPABILITY: Record<string, string> = {
  observation: "cap_in_observation",
  witness: "cap_in_witnessing",
  self_inquiry: "cap_aw_self",
  neti_neti: "cap_aw_thought",
  breath: "cap_in_breath",
  body: "cap_aw_body",
  bhakti: "cap_in_gratitude",
  jnana: "cap_in_contemplation",
  karma: "cap_aw_impulse",
  raja: "cap_in_meditation",
};

const DOMAINS: Array<{ id: string; label: string; concept: string }> = [
  { id: "work", label: "Work", concept: "karma" },
  { id: "relationship", label: "Relationship", concept: "bhakti" },
  { id: "health", label: "Health", concept: "body" },
  { id: "money", label: "Money", concept: "karma" },
  { id: "identity", label: "Identity", concept: "self_inquiry" },
  { id: "purpose", label: "Purpose", concept: "jnana" },
];

export const LOOP_FAMILIES: Array<{ id: string; label: string; concept: string; keywords: string[] }> = [
  { id: "validation", label: "Validation seeking", concept: "self_inquiry", keywords: ["validation", "approval", "praise", "liked"] },
  { id: "control", label: "Control", concept: "raja", keywords: ["control", "certainty", "planning", "micromanage"] },
  { id: "avoidance", label: "Avoidance", concept: "karma", keywords: ["avoid", "escape", "delay", "procrast"] },
  { id: "comparison", label: "Comparison", concept: "self_inquiry", keywords: ["comparison", "compare", "jealous", "envy"] },
  { id: "rumination", label: "Rumination", concept: "observation", keywords: ["rumination", "overthink", "mental", "worry"] },
  { id: "perfectionism", label: "Perfectionism", concept: "karma", keywords: ["perfect", "not enough", "standard", "flaw"] },
  { id: "shame", label: "Shame", concept: "self_inquiry", keywords: ["shame", "worthless", "guilt", "unworthy"] },
  { id: "numbness", label: "Numbness", concept: "emotion_observation", keywords: ["numb", "blank", "disconnect", "flat"] },
];

type Prefix = "concept" | "cap" | "practice" | "loop" | "domain" | "arc" | "claim";
const N = (kind: Prefix, id: string): string => `${kind}:${id}`;
const raw = (id: string): string => id.slice(id.indexOf(":") + 1);

function addNode(nodes: Map<string, GraphNode>, id: string, kind: GraphNode["kind"], label: string): void {
  if (!nodes.has(id)) nodes.set(id, { id, kind, label });
}

function addEdge(edges: GraphEdge[], edge: GraphEdge): void {
  const exists = edges.some(
    (e) => e.from === edge.from && e.to === edge.to && e.relation === edge.relation,
  );
  if (!exists) edges.push(edge);
}

export function buildSessionGraph(): SessionGraph {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  for (const concept of GRAPH_CONCEPTS) {
    addNode(nodes, N("concept", concept.id), "concept", concept.label);
    for (const prereq of concept.prerequisites) {
      addEdge(edges, {
        from: N("concept", prereq),
        to: N("concept", concept.id),
        relation: "prerequisite",
      });
    }
  }

  for (const capability of CAPABILITIES) {
    addNode(nodes, N("cap", capability.id), "capability", capability.name);
    for (const dep of capability.dependsOn ?? []) {
      addEdge(edges, {
        from: N("cap", dep),
        to: N("cap", capability.id),
        relation: "prerequisite",
      });
    }
  }

  for (const [concept, capabilityId] of Object.entries(CONCEPT_CAPABILITY)) {
    addEdge(edges, {
      from: N("concept", concept),
      to: N("cap", capabilityId),
      relation: "trains",
    });
  }

  for (const practice of PRACTICES) {
    addNode(nodes, N("practice", practice), "practice", PRACTICE_META[practice].label);
  }
  for (const concept of GRAPH_CONCEPTS) {
    addEdge(edges, {
      from: N("practice", concept.practice),
      to: N("concept", concept.id),
      relation: "trains",
    });
  }

  for (const loop of LOOP_FAMILIES) {
    addNode(nodes, N("loop", loop.id), "loop_family", loop.label);
    addEdge(edges, {
      from: N("loop", loop.id),
      to: N("concept", loop.concept),
      relation: "dissolves",
    });
  }

  for (const domain of DOMAINS) {
    addNode(nodes, N("domain", domain.id), "domain", domain.label);
    addEdge(edges, {
      from: N("domain", domain.id),
      to: N("concept", domain.concept),
      relation: "applies_to",
    });
  }

  for (const arc of ARCS) {
    addNode(nodes, N("arc", arc.id), "arc", arc.title);
    for (const concept of new Set(arc.sits.map((sit) => sit.concept))) {
      addEdge(edges, {
        from: N("arc", arc.id),
        to: N("concept", concept),
        relation: "covers",
      });
    }
  }

  for (const claim of ALL_CLAIMS) {
    addNode(nodes, N("claim", claim.id), "claim", claim.short);
    if (claim.conceptId) {
      addEdge(edges, {
        from: N("claim", claim.id),
        to: N("concept", claim.conceptId),
        relation: "covers",
      });
    }
  }

  return { nodes: Array.from(nodes.values()), edges };
}

export function prerequisitePath(graph: SessionGraph, target: string): string[] {
  const conceptIds = new Set(
    graph.nodes.filter((n) => n.kind === "concept").map((n) => raw(n.id)),
  );
  const visited = new Set<string>();
  const ordered: string[] = [];

  const walk = (id: string): void => {
    const nodeId = N("concept", id);
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const prereqs = graph.edges
      .filter((e) => e.to === nodeId && e.relation === "prerequisite")
      .map((e) => raw(e.from))
      .filter((from) => conceptIds.has(from));
    for (const prereq of prereqs) walk(prereq);
    if (conceptIds.has(id)) ordered.push(id);
  };

  walk(target);
  return ordered;
}

function loopFamiliesFor(loop: string): string[] {
  const lower = loop.toLowerCase();
  const hits = LOOP_FAMILIES.filter((family) =>
    family.keywords.some((keyword) => lower.includes(keyword)),
  ).map((family) => family.id);
  return hits.length ? hits : ["rumination"];
}

export function findGaps(graph: SessionGraph, signals: GraphSignals): Gap[] {
  const gaps = new Map<string, Gap>();
  const push = (gap: Gap): void => {
    const key = `${gap.kind}:${gap.id}`;
    const existing = gaps.get(key);
    if (!existing || gap.severity > existing.severity) gaps.set(key, gap);
  };

  for (const concept of GRAPH_CONCEPTS) {
    const familiarity = signals.familiarity?.[concept.id] ?? 0;
    if (familiarity < 0.5) {
      push({
        kind: "concept",
        id: concept.id,
        label: concept.label,
        severity: Number((1 - familiarity).toFixed(2)),
        evidence: [`familiarity ${Math.round(familiarity * 100)}%`],
      });
    }
  }

  for (const [id, level] of Object.entries(signals.capabilityLevels ?? {})) {
    if (!Number.isFinite(level) || level >= 4) continue;
    const concept = GRAPH_CONCEPTS.some((c) => c.id === id);
    const capability = graph.nodes.find((n) => n.id === N("cap", id));
    if (!concept && !capability) continue;
    push({
      kind: concept ? "concept" : "capability",
      id,
      label: concept
        ? GRAPH_CONCEPTS.find((c) => c.id === id)!.label
        : capability!.label,
      severity: Number((1 - Math.max(0, Math.min(5, level)) / 5).toFixed(2)),
      evidence: [`capability L${level}`],
    });
  }

  for (const loop of signals.activeLoops ?? []) {
    for (const familyId of loopFamiliesFor(loop)) {
      const family = LOOP_FAMILIES.find((f) => f.id === familyId);
      if (!family) continue;
      push({
        kind: "loop_family",
        id: familyId,
        label: family.label,
        severity: 0.85,
        evidence: [`active loop: ${loop}`],
      });
    }
  }

  for (const domain of signals.stressedDomains ?? []) {
    const node = DOMAINS.find((d) => d.id === domain);
    if (!node) continue;
    push({
      kind: "domain",
      id: node.id,
      label: node.label,
      severity: 0.75,
      evidence: [`domain stressed: ${node.label}`],
    });
  }

  for (const [domainId, score] of Object.entries(signals.domainScores ?? {})) {
    if (!Number.isFinite(score) || score >= 6) continue;
    const node = DOMAINS.find((d) => d.id === domainId);
    if (!node) continue;
    push({
      kind: "domain",
      id: node.id,
      label: node.label,
      severity: Number(Math.max(0, Math.min(1, (10 - score) / 10)).toFixed(2)),
      evidence: [`domain score ${score}/10`],
    });
  }

  const order = new Map(GRAPH_CONCEPTS.map((concept, index) => [concept.id, index]));
  return Array.from(gaps.values()).sort(
    (a, b) =>
      b.severity - a.severity ||
      (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99) ||
      a.id.localeCompare(b.id),
  );
}

export function conceptForGap(graph: SessionGraph, gap: Gap): string {
  if (gap.kind === "concept") return gap.id;

  if (gap.kind === "capability") {
    const edge = graph.edges.find(
      (e) => e.to === N("cap", gap.id) && e.relation === "trains",
    );
    if (edge) return raw(edge.from);
  }

  if (gap.kind === "loop_family") {
    const edge = graph.edges.find(
      (e) => e.from === N("loop", gap.id) && e.relation === "dissolves",
    );
    if (edge) return raw(edge.to);
  }

  if (gap.kind === "domain") {
    const edge = graph.edges.find(
      (e) => e.from === N("domain", gap.id) && e.relation === "applies_to",
    );
    if (edge) return raw(edge.to);
  }

  return "observation";
}

export function graphStats(graph: SessionGraph): { nodes: number; edges: number; byKind: Record<string, number> } {
  const byKind = graph.nodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.kind] = (acc[node.kind] ?? 0) + 1;
    return acc;
  }, {});
  return { nodes: graph.nodes.length, edges: graph.edges.length, byKind };
}
