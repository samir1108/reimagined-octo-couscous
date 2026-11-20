import { getEngine } from '@/lib/graph/engine';

const engine = getEngine();

export interface GraphContext {
  relevantNodes: Array<{ node: any; relevance: number }>;
  edges: any[];
  anatomy?: { nodes: any[]; edges: any[] };
  suggestedPractices: any[];
  relatedBridges: any[];
  relatedLoops: any[];
  relatedChakras: any[];
  relatedDimensions: any[];
  relatedBands: any[];
  graphStats?: { nodeCount: number; edgeCount: number };
}

export interface GraphAnatomyReport {
  center: { id: string; label: string; type: string };
  neighbors: Array<{ node: any; edgeType: string; direction: string }>;
  subgraph: { nodes: any[]; edges: any[] };
  suggestions: string[];
}

/** Compact, transport-safe projection of a GraphContext for server calls. */
export interface ServerGraphContext {
  nodeIds: string[];
  edgeCount: number;
  prompt: string;
}

export function graphContextToPrompt(ctx: GraphContext): string {
  const lines: string[] = [];
  if (ctx.graphStats) {
    lines.push(`GRAPH: ${ctx.graphStats.nodeCount} nodes / ${ctx.graphStats.edgeCount} edges`);
  }
  const labels = ctx.relevantNodes
    .slice(0, 8)
    .map((n) => n.node?.label)
    .filter(Boolean);
  if (labels.length) lines.push(`RELEVANT: ${labels.join(", ")}`);
  if (ctx.relatedLoops.length) {
    const loops = ctx.relatedLoops
      .slice(0, 4)
      .map((l: any) => l.name ?? l.label ?? l.id)
      .filter(Boolean);
    if (loops.length) lines.push(`LOOPS: ${loops.join(", ")}`);
  }
  if (ctx.suggestedPractices.length) {
    const practices = ctx.suggestedPractices
      .slice(0, 4)
      .map((p: any) => p.practiceId ?? p.label ?? p.id)
      .filter(Boolean);
    if (practices.length) lines.push(`PRACTICES: ${practices.join(", ")}`);
  }
  return lines.join("\n");
}

export function buildGraphContextForQuery(query: string): GraphContext {
  const relevantNodes = engine.search(query).slice(0, 10).map(n => ({
    node: n,
    relevance: 1.0,
  }));

  const edges: any[] = [];
  const anatomyNodes = new Map<string, any>();
  const anatomyEdges: any[] = [];
  const suggestedPractices = new Map<string, any>();
  const relatedBridges = new Map<string, any>();
  const relatedLoops = new Map<string, any>();
  const relatedChakras = new Map<string, any>();
  const relatedDimensions = new Map<string, any>();
  const relatedBands = new Map<string, any>();

  for (const { node } of relevantNodes) {
    const anatomy = engine.fullAnatomy(node.id);
    anatomy.nodes.forEach(n => anatomyNodes.set(n.id, n));
    anatomyEdges.push(...anatomy.edges);

    if (node.type === 'loop') {
      const practices = engine.neighbors(node.id).filter(n => n.type === 'practice');
      practices.forEach(p => suggestedPractices.set(p.id, p));

      const chakras = engine.chakrasForLoop(node.id.replace('loop::', ''));
      chakras.forEach(c => relatedChakras.set(c.id, c));

      const bands = engine.bandsForLoop(node.id.replace('loop::', ''));
      bands.forEach(b => relatedBands.set(b.id, b));

      const dims = engine.outgoing(node.id, ['LOOP_RELATED_TO_DIMENSION']);
      dims.forEach(d => relatedDimensions.set(d.id, d));

      const domainTriggers = engine.outgoing(node.id, ['LOOP_TRIGGERS_IN_DOMAIN']);
      const domainManifests = engine.outgoing(node.id, ['LOOP_MANIFESTS_IN_SITUATION']);
      [...domainTriggers, ...domainManifests].forEach(d => {
        if (d.type === 'task-domain') relatedDimensions.set(d.id, d);
      });

      relatedLoops.set(node.id, node);
    }

    if (node.type === 'chakra' || node.type === 'dimension') {
      const bridges = engine.bridgesForNode(node.id);
      bridges.forEach(b => relatedBridges.set(b.id, b));
    }
  }

  const stats = engine.getStats();

  return {
    relevantNodes,
    edges,
    anatomy: anatomyNodes.size > 0 ? { nodes: Array.from(anatomyNodes.values()), edges: anatomyEdges } : undefined,
    suggestedPractices: Array.from(suggestedPractices.values()),
    relatedBridges: Array.from(relatedBridges.values()),
    relatedLoops: Array.from(relatedLoops.values()),
    relatedChakras: Array.from(relatedChakras.values()),
    relatedDimensions: Array.from(relatedDimensions.values()),
    relatedBands: Array.from(relatedBands.values()),
    graphStats: stats,
  };
}

export function buildAnatomyReport(nodeId: string): GraphAnatomyReport {
  const node = engine.getNode(nodeId);
  if (!node) {
    return { center: { id: nodeId, label: 'Unknown', type: 'unknown' }, neighbors: [], subgraph: { nodes: [], edges: [] }, suggestions: [] };
  }

  const neighbors: Array<{ node: any; edgeType: string; direction: string }> = [];
  for (const edge of engine.getEdges()) {
    if (edge.from === nodeId) {
      const target = engine.getNode(edge.to);
      if (target) neighbors.push({ node: target, edgeType: edge.type, direction: 'outgoing' });
    } else if (edge.to === nodeId) {
      const source = engine.getNode(edge.from);
      if (source) neighbors.push({ node: source, edgeType: edge.type, direction: 'incoming' });
    }
  }

  const subgraph = engine.subgraph(nodeId, 2);
  const suggestions: string[] = [];

  if (node.type === 'loop') {
    const practices = engine.practicesForLoop(nodeId.replace('loop::', ''));
    if (practices.length > 0) {
      suggestions.push(`Dissolution path: ${practices.map(p => p.label).join(', ')}`);
    }
    const chakras = engine.chakrasForLoop(nodeId.replace('loop::', ''));
    if (chakras.length > 0) {
      suggestions.push(`Related chakra: ${chakras.map(c => c.label).join(', ')}`);
    }
  }

  if (node.type === 'practice') {
    const dimensions = engine.practicesForDimension(node.id.replace('practice::', ''));
    if (dimensions.length > 0) {
      suggestions.push(`Develops: ${dimensions.map(d => d.label).join(', ')}`);
    }
  }

  return {
    center: { id: node.id, label: node.label, type: node.type },
    neighbors,
    subgraph: { nodes: Array.from(subgraph.nodes.values()), edges: subgraph.edges },
    suggestions,
  };
}

export function getLoopAnatomy(loopId: string): GraphAnatomyReport | null {
  const nodeId = `loop::${loopId}`;
  const node = engine.getNode(nodeId);
  if (!node) return null;
  return buildAnatomyReport(nodeId);
}
