import type { ConsciousnessGraph, GraphNode, GraphEdge, EdgeType, GraphTraversalDirection } from '@/types/graph';
import { getGraph, resetGraphCache } from '@/data/graph';

/** Shape of the classified marker payload carried on marker node `data`. */
interface ClassifiedMarkerData {
  dimension?: string;
  chakra?: string;
  confidence?: number;
}

export interface StageProfile {
  band: number;
  archetype: GraphNode;
  stage: GraphNode | null;
  nextBand: GraphNode | null;
  bridge?: string;
  markerCount: number;
  maturityCount: number;
  topDimensions: Array<{ dimension: GraphNode; count: number }>;
  topChakras: Array<{ chakra: GraphNode; count: number }>;
  loops: Array<{ loop: GraphNode; weight: number }>;
  paths: Array<{ path: GraphNode; fit: string; why: string }>;
  granthis: GraphNode[];
  kundaliniSigns: GraphNode[];
  avgConfidence: number;
}

export class GraphEngine {
  private graph: ConsciousnessGraph;

  constructor() {
    this.graph = getGraph();
  }

  refresh(): void {
    resetGraphCache();
    this.graph = getGraph();
  }

  getNode(id: string): GraphNode | undefined {
    return this.graph.nodes.get(id);
  }

  getEdges(from?: string, to?: string, type?: EdgeType): GraphEdge[] {
    return this.graph.edges.filter(e => {
      if (from && e.from !== from) return false;
      if (to && e.to !== to) return false;
      if (type && e.type !== type) return false;
      return true;
    });
  }

  neighbors(id: string, types?: EdgeType[], direction: GraphTraversalDirection = 'outgoing'): GraphNode[] {
    const edgeTypes = new Set(types || []);
    const result: GraphNode[] = [];

    for (const edge of this.graph.edges) {
      const matchesType = edgeTypes.size === 0 || edgeTypes.has(edge.type);
      const isOutgoing = edge.from === id;
      const isIncoming = edge.to === id;
      const matchesDirection = direction === 'outgoing' ? isOutgoing : direction === 'incoming' ? isIncoming : isOutgoing || isIncoming;

      if (matchesType && matchesDirection) {
        const neighborId = direction === 'incoming' ? edge.from : edge.to;
        const node = this.graph.nodes.get(neighborId);
        if (node && !result.some(r => r.id === node.id)) {
          result.push(node);
        }
      }
    }

    return result;
  }

  incoming(id: string, types?: EdgeType[]): GraphNode[] {
    return this.neighbors(id, types, 'incoming');
  }

  outgoing(id: string, types?: EdgeType[]): GraphNode[] {
    return this.neighbors(id, types, 'outgoing');
  }

  path(from: string, to: string, maxDepth = 6): string[][] {
    if (from === to) return [[from]];
    const visited = new Set<string>([from]);
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: from, path: [from] }];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      if (path.length > maxDepth) continue;

      const outEdges = this.graph.edges.filter(e => e.from === nodeId);
      for (const edge of outEdges) {
        if (edge.to === to) {
          return [[...path, edge.to]];
        }
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.push({ nodeId: edge.to, path: [...path, edge.to] });
        }
      }
    }
    return [];
  }

  subgraph(centerId: string, depth = 2): ConsciousnessGraph {
    const visited = new Set<string>([centerId]);
    const nodeIds = new Set<string>([centerId]);

    for (let d = 0; d < depth; d++) {
      const currentLevel = Array.from(nodeIds);
      for (const nodeId of currentLevel) {
        const outEdges = this.graph.edges.filter(e => e.from === nodeId);
        const inEdges = this.graph.edges.filter(e => e.to === nodeId);
        for (const e of [...outEdges, ...inEdges]) {
          if (!visited.has(e.from)) { visited.add(e.from); nodeIds.add(e.from); }
          if (!visited.has(e.to)) { visited.add(e.to); nodeIds.add(e.to); }
        }
      }
    }

    const nodes = new Map<string, GraphNode>();
    for (const id of nodeIds) {
      const n = this.graph.nodes.get(id);
      if (n) nodes.set(id, n);
    }
    const edges = this.graph.edges.filter(e => nodeIds.has(e.from) && nodeIds.has(e.to));

    return { nodes, edges };
  }

  search(query: string): GraphNode[] {
    const q = query.toLowerCase();
    const scored = new Map<GraphNode, number>();

    for (const node of this.graph.nodes.values()) {
      let score = 0;
      if (node.label.toLowerCase().includes(q)) score += 10;
      if (node.id.toLowerCase().includes(q)) score += 8;
      for (const alias of node.aliases) {
        if (alias.toLowerCase().includes(q)) score += 5;
      }
      if (score > 0) scored.set(node, score);
    }

    return Array.from(scored.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([node]) => node);
  }

  // ─── Domain-specific queries ───

  loopsForBand(band: number): GraphNode[] {
    const bandNode = this.getNode(`band::${band}`);
    if (!bandNode) return [];
    return this.outgoing(bandNode.id, ['BAND_COMMON_LOOP']);
  }

  practicesForLoop(loopId: string): GraphNode[] {
    const loopNode = this.getNode(`loop::${loopId}`);
    if (!loopNode) return [];
    const edges = this.graph.edges.filter(
      e => e.type === 'LOOP_DISSOLVES_VIA' && e.from === loopNode.id
    );
    return edges.map(e => this.graph.nodes.get(e.to)).filter((n): n is GraphNode => !!n);
  }

  practicesForDimension(dimId: string): GraphNode[] {
    const dimNode = this.getNode(`dimension::consciousness::${dimId}`);
    if (!dimNode) return [];
    const edges = this.graph.edges.filter(
      e => e.type === 'PRACTICE_IMPACTS_DIMENSION' && e.to === dimNode.id
    );
    return edges.map(e => this.graph.nodes.get(e.from)).filter((n): n is GraphNode => !!n);
  }

  chakrasForLoop(loopId: string): GraphNode[] {
    const loopNode = this.getNode(`loop::${loopId}`);
    if (!loopNode) return [];
    return this.outgoing(loopNode.id, ['LOOP_RELATED_TO_CHAKRA']);
  }

  bandsForLoop(loopId: string): GraphNode[] {
    const loopNode = this.getNode(`loop::${loopId}`);
    if (!loopNode) return [];
    const edges = this.graph.edges.filter(
      e => e.type === 'BAND_COMMON_LOOP' && e.to === loopNode.id
    );
    return edges.map(e => this.graph.nodes.get(e.from)).filter((n): n is GraphNode => !!n);
  }

  domainsForLoop(loopId: string): GraphNode[] {
    const loopNode = this.getNode(`loop::${loopId}`);
    if (!loopNode) return [];
    const triggers = this.outgoing(loopNode.id, ['LOOP_TRIGGERS_IN_DOMAIN']);
    const manifests = this.outgoing(loopNode.id, ['LOOP_MANIFESTS_IN_SITUATION']);
    const combined = new Map<string, GraphNode>();
    for (const n of [...triggers, ...manifests]) combined.set(n.id, n);
    return Array.from(combined.values());
  }

  gamesForLoop(loopId: string): GraphNode[] {
    const loopNode = this.getNode(`loop::${loopId}`);
    if (!loopNode) return [];
    return this.incoming(loopNode.id, ['LOOP_DISSOLVED_BY_GAME']);
  }

  breakthroughsForLoop(loopId: string): GraphNode[] {
    const loopNode = this.getNode(`loop::${loopId}`);
    if (!loopNode) return [];
    return this.incoming(loopNode.id, ['BREAKTHROUGH_TRIGGERS_LOOP']);
  }

  gurusForLoop(loopId: string): GraphNode[] {
    const loopNode = this.getNode(`loop::${loopId}`);
    if (!loopNode) return [];
    return this.incoming(loopNode.id, ['GURU_CONNECTED_TO_LOOP']);
  }

  practicesForGuru(guruId: string): GraphNode[] {
    const guruNode = this.getNode(`guru::${guruId}`);
    if (!guruNode) return [];
    return this.outgoing(guruNode.id, ['GURU_TEACHES_PRACTICE']);
  }

  energyBodyForLoop(loopId: string): GraphNode[] {
    const loopNode = this.getNode(`loop::${loopId}`);
    if (!loopNode) return [];
    const chakras = this.outgoing(loopNode.id, ['LOOP_RELATED_TO_CHAKRA']);
    const bodies = new Map<string, GraphNode>();
    for (const chakra of chakras) {
      const koshas = this.outgoing(chakra.id, ['CHAKRA_HAS_KOSHA']);
      for (const kosha of koshas) {
        const energyBodies = this.outgoing(kosha.id, ['KOSHA_LAYER_OF']);
        for (const eb of energyBodies) bodies.set(eb.id, eb);
      }
    }
    return Array.from(bodies.values());
  }

  nadiForPrana(pranaId: string): GraphNode[] {
    const pranaNode = this.getNode(`prana::${pranaId}`);
    if (!pranaNode) return [];
    return this.outgoing(pranaNode.id, ['PRANA_FLOWS_THROUGH']);
  }

  signalForLoop(loopId: string): GraphNode[] {
    const loopNode = this.getNode(`loop::${loopId}`);
    if (!loopNode) return [];
    return this.incoming(loopNode.id, ['SIGNAL_INDICATES_LOOP']);
  }

  fullAnatomy(nodeId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const subgraph = this.subgraph(nodeId, 3);
    return { nodes: Array.from(subgraph.nodes.values()), edges: subgraph.edges };
  }

  // ─── Stage-behavior queries ───

  /** Every classified behavioral marker exhibited at a band. */
  markersForBand(band: number): GraphNode[] {
    const bandNode = this.getNode(`band::${band}`);
    if (!bandNode) return [];
    return this.outgoing(bandNode.id, ['BAND_EXHIBITS_MARKER']);
  }

  /** Loops indicated by a band's markers, aggregated by strongest marker weight. */
  loopsIndicatedByStage(band: number): Array<{ loop: GraphNode; weight: number }> {
    const weights = new Map<string, number>();
    for (const marker of this.markersForBand(band)) {
      for (const edge of this.getEdges(marker.id, undefined, 'MARKER_INDICATES_LOOP')) {
        const current = weights.get(edge.to) ?? 0;
        weights.set(edge.to, Math.max(current, edge.weight ?? 0.5));
      }
    }
    return Array.from(weights.entries())
      .map(([id, weight]) => ({ loop: this.getNode(id)!, weight }))
      .filter(entry => !!entry.loop)
      .sort((a, b) => b.weight - a.weight);
  }

  /** Markers that describe dysfunction (behavioral) vs capacity (maturity). */
  markersForBandByPolarity(band: number, polarity: 'behavioral' | 'maturity'): GraphNode[] {
    return this.markersForBand(band).filter(m => (m.data as { polarity?: string }).polarity === polarity);
  }

  // ─── Energy (prana / nadi) queries ───

  /** The behavioral markers attached to a prana or nadi channel. */
  energyMarkersForChannel(channel: string): GraphNode[] {
    const channelNode = this.getNode(`prana::${channel}`) ?? this.getNode(`nadi::${channel}`);
    if (!channelNode) return [];
    return this.outgoing(channelNode.id, ['ENERGY_CHANNEL_EXHIBITS_MARKER']);
  }

  /** Practices that re-balance an energy marker, with the one-line method. */
  balancingForEnergyMarker(markerId: string): Array<{ practice: GraphNode; balancing: string }> {
    const markerNode = this.getNode(`energy-marker::${markerId}`);
    if (!markerNode) return [];
    const balancing = (markerNode.data as { balancing?: string }).balancing ?? '';
    return this.outgoing(markerNode.id, ['ENERGY_MARKER_BALANCED_BY_PRACTICE']).map(practice => ({ practice, balancing }));
  }

  /** Every energy marker, grouped by family — powers the ki/energy layer UI. */
  energyProfile(): { prana: GraphNode[]; nadi: GraphNode[]; sushumna: GraphNode | null } {
    const all = Array.from(this.graph.nodes.values()).filter(n => n.type === 'energy-marker');
    return {
      prana: all.filter(m => (m.data as { family?: string }).family === 'prana'),
      nadi: all.filter(m => (m.data as { family?: string }).family === 'nadi' && (m.data as { channel?: string }).channel !== 'sushumna'),
      sushumna: all.find(m => (m.data as { channel?: string }).channel === 'sushumna') ?? null,
    };
  }

  /** Yoga paths that fit a band, with the handbook's reasoning. */
  pathsForBand(band: number): Array<{ path: GraphNode; fit: string; why: string }> {
    const bandNode = this.getNode(`band::${band}`);
    if (!bandNode) return [];
    return this.getEdges(bandNode.id, undefined, 'BAND_FITS_PATH')
      .map(edge => ({
        path: this.getNode(edge.to)!,
        fit: (edge.metadata?.fit as string) ?? 'supporting',
        why: (edge.metadata?.why as string) ?? '',
      }))
      .filter(entry => !!entry.path)
      .sort((a, b) => (a.fit === 'primary' ? -1 : b.fit === 'primary' ? 1 : 0));
  }

  /** Granthis — the psychic knots that hold this band in place. */
  granthisForBand(band: number): GraphNode[] {
    const bandNode = this.getNode(`band::${band}`);
    if (!bandNode) return [];
    return this.outgoing(bandNode.id, ['BAND_BLOCKED_BY_GRANTHI']);
  }

  /** Kundalini signs that may surface at this band, with safety tier preserved. */
  signsForBand(band: number): Array<{ sign: GraphNode; safety: string }> {
    const bandNode = this.getNode(`band::${band}`);
    if (!bandNode) return [];
    return this.getEdges(bandNode.id, undefined, 'BAND_MAY_SHOW_SIGN').map(edge => ({
      sign: this.getNode(edge.to)!,
      safety: (edge.metadata?.safety as string) ?? 'normal',
    })).filter(entry => !!entry.sign);
  }

  /** The next band on the spiral, with the bridge text that gets you there. */
  nextBand(band: number): { band: GraphNode; bridge?: string } | null {
    const bandNode = this.getNode(`band::${band}`);
    if (!bandNode) return null;
    const edge = this.graph.edges.find(e => e.type === 'BAND_ADVANCES_TO' && e.from === bandNode.id);
    if (!edge) return null;
    const next = this.getNode(edge.to);
    return next ? { band: next, bridge: edge.metadata?.bridge as string | undefined } : null;
  }

  /**
   * The full stage profile: one call answers "how does a person at this band
   * behave, and what moves them onward." Powers Directory, StageHandbook, and
   * the session director's band-aware seeding.
   */
  stageProfile(band: number): StageProfile | null {
    const archetype = this.getNode(`band::${band}`);
    if (!archetype) return null;
    const stage = this.getNode(`band-stage::${band}`) ?? null;
    const markers = this.markersForBand(band);
    const next = this.nextBand(band);

    const dimCounts = new Map<string, number>();
    const chakraCounts = new Map<string, number>();
    let confidenceSum = 0;
    for (const marker of markers) {
      const data = marker.data as ClassifiedMarkerData;
      confidenceSum += data.confidence ?? 0;
      if (data.dimension) dimCounts.set(data.dimension, (dimCounts.get(data.dimension) ?? 0) + 1);
      if (data.chakra) chakraCounts.set(data.chakra, (chakraCounts.get(data.chakra) ?? 0) + 1);
    }

    return {
      band,
      archetype,
      stage,
      nextBand: next?.band ?? null,
      bridge: next?.bridge,
      markerCount: markers.length,
      maturityCount: markers.filter(m => (m.data as { polarity?: string }).polarity === 'maturity').length,
      topDimensions: Array.from(dimCounts.entries())
        .map(([id, count]) => ({ dimension: this.getNode(`dimension::consciousness::${id}`)!, count }))
        .filter(entry => !!entry.dimension)
        .sort((a, b) => b.count - a.count),
      topChakras: Array.from(chakraCounts.entries())
        .map(([id, count]) => ({ chakra: this.getNode(`chakra::${id}`)!, count }))
        .filter(entry => !!entry.chakra)
        .sort((a, b) => b.count - a.count),
      loops: this.loopsIndicatedByStage(band),
      paths: this.pathsForBand(band),
      granthis: this.granthisForBand(band),
      kundaliniSigns: this.signsForBand(band).map(s => s.sign),
      avgConfidence: markers.length > 0 ? confidenceSum / markers.length : 0,
    };
  }

  bridgesForNode(nodeId: string): GraphNode[] {
    const subgraph = this.subgraph(nodeId, 2);
    return Array.from(subgraph.nodes.values()).filter(n => n.type === 'bridge');
  }

  getStats(): { nodeCount: number; edgeCount: number; nodeTypes: Record<string, number>; edgeTypes: Record<string, number> } {
    const nodeTypes: Record<string, number> = {};
    for (const node of this.graph.nodes.values()) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    }

    const edgeTypes: Record<string, number> = {};
    for (const edge of this.graph.edges) {
      edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
    }

    return {
      nodeCount: this.graph.nodes.size,
      edgeCount: this.graph.edges.length,
      nodeTypes,
      edgeTypes,
    };
  }

  multiHopInference(startId: string, steps: Array<{ type: EdgeType; direction: 'incoming' | 'outgoing' }>): GraphNode[] {
    let currentIds = [startId];
    const result: GraphNode[] = [];

    for (const step of steps) {
      const nextIds = new Set<string>();
      for (const currentId of currentIds) {
        const neighbors = this.neighbors(currentId, [step.type], step.direction);
        for (const n of neighbors) {
          if (!result.some(r => r.id === n.id)) {
            result.push(n);
          }
          nextIds.add(n.id);
        }
      }
      currentIds = Array.from(nextIds);
      if (currentIds.length === 0) break;
    }

    return result;
  }

  weightedRandomWalk(startId: string, maxSteps = 4): GraphNode[] {
    const visited = new Set<string>([startId]);
    const path: GraphNode[] = [];
    let currentId = startId;

    for (let i = 0; i < maxSteps; i++) {
      const outEdges = this.graph.edges.filter(e => e.from === currentId);
      if (outEdges.length === 0) break;

      const totalWeight = outEdges.reduce((sum, e) => sum + (e.weight || 0.5), 0);
      let r = Math.random() * totalWeight;
      let chosenEdge = outEdges[0];

      for (const edge of outEdges) {
        r -= edge.weight || 0.5;
        if (r <= 0) {
          chosenEdge = edge;
          break;
        }
      }

      const nextNode = this.graph.nodes.get(chosenEdge.to);
      if (!nextNode || visited.has(nextNode.id)) break;

      visited.add(nextNode.id);
      path.push(nextNode);
      currentId = nextNode.id;
    }

    return path;
  }

  async recordLoopDissolution(loopId: string, practiceId: string, confidence: number): Promise<void> {
    const { GraphPersistence } = await import('./persistence');
    const persistence = new GraphPersistence();
    await persistence.recordLoopDissolution({ loopId, practiceId, confidence });
  }
}

let engineInstance: GraphEngine | null = null;

export function getEngine(): GraphEngine {
  if (!engineInstance) {
    engineInstance = new GraphEngine();
  }
  return engineInstance;
}
