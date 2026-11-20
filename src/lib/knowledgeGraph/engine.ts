import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge, KnowledgeEdgeType, KnowledgeRetrievalResult } from '@/types/knowledgeGraph';
import { getKnowledgeGraph, resetKnowledgeGraphCache } from '@/data/knowledge';

export class KnowledgeGraphEngine {
  private graph: KnowledgeGraph;

  constructor() {
    this.graph = getKnowledgeGraph();
  }

  refresh(): void {
    resetKnowledgeGraphCache();
    this.graph = getKnowledgeGraph();
  }

  getNode(id: string): KnowledgeNode | undefined {
    return this.graph.nodes.get(id);
  }

  getEdges(sourceId?: string, targetId?: string, type?: KnowledgeEdgeType): KnowledgeEdge[] {
    return this.graph.edges.filter((e) => {
      if (sourceId && e.sourceId !== sourceId) return false;
      if (targetId && e.targetId !== targetId) return false;
      if (type && e.relationshipType !== type) return false;
      return true;
    });
  }

  neighbors(id: string, types?: KnowledgeEdgeType[], direction: 'outgoing' | 'incoming' | 'both' = 'outgoing'): KnowledgeNode[] {
    const typeSet = new Set(types || []);
    const result: KnowledgeNode[] = [];
    for (const edge of this.graph.edges) {
      const matchesType = typeSet.size === 0 || typeSet.has(edge.relationshipType);
      const isOut = edge.sourceId === id;
      const isIn = edge.targetId === id;
      const matchesDir = direction === 'outgoing' ? isOut : direction === 'incoming' ? isIn : isOut || isIn;
      if (!matchesType || !matchesDir) continue;
      const neighborId = direction === 'incoming' ? edge.sourceId : isOut ? edge.targetId : edge.sourceId;
      const node = this.graph.nodes.get(neighborId);
      if (node && !result.some((r) => r.id === node.id)) result.push(node);
    }
    return result;
  }

  search(query: string, limit = 20): KnowledgeNode[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const scored = new Map<KnowledgeNode, number>();
    for (const node of this.graph.nodes.values()) {
      let score = 0;
      if (node.name.toLowerCase().includes(q)) score += 10;
      if (node.id.toLowerCase().includes(q)) score += 6;
      for (const alias of node.aliases) if (alias.toLowerCase().includes(q)) score += 4;
      if (node.description.toLowerCase().includes(q)) score += 2;
      if (score > 0) scored.set(node, score);
    }
    return Array.from(scored.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([n]) => n);
  }

  subgraph(centerId: string, depth = 2): KnowledgeGraph {
    const nodeIds = new Set<string>([centerId]);
    let frontier = [centerId];
    for (let d = 0; d < depth; d++) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const e of this.graph.edges) {
          if (e.sourceId === id && !nodeIds.has(e.targetId)) { nodeIds.add(e.targetId); next.push(e.targetId); }
          if (e.targetId === id && !nodeIds.has(e.sourceId)) { nodeIds.add(e.sourceId); next.push(e.sourceId); }
        }
      }
      frontier = next;
    }
    const nodes = new Map(Array.from(nodeIds).map((id) => [id, this.graph.nodes.get(id)!]).filter(([, n]) => !!n));
    const edges = this.graph.edges.filter((e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId));
    const adjacency = new Map<string, string[]>();
    for (const e of edges) {
      const list = adjacency.get(e.sourceId) || [];
      list.push(e.targetId);
      adjacency.set(e.sourceId, list);
    }
    return { nodes, edges, adjacency };
  }

  // Retrieve relevant concepts for a query with edges
  retrieve(query: string, limit = 10): KnowledgeRetrievalResult {
    const nodes = this.search(query, limit);
    const ids = new Set(nodes.map((n) => n.id));
    const edges = this.graph.edges.filter((e) => ids.has(e.sourceId) || ids.has(e.targetId));
    const score = nodes.length;
    return { nodes, edges, score };
  }

  semanticSearch(queryEmbedding: number[], limit = 10): KnowledgeNode[] {
    const scored: Array<{ node: KnowledgeNode; score: number }> = [];
    for (const node of this.graph.nodes.values()) {
      if (!node.embedding || node.embedding.length !== queryEmbedding.length) continue;
      let dot = 0;
      let na = 0;
      let nb = 0;
      for (let i = 0; i < queryEmbedding.length; i++) {
        dot += node.embedding[i] * queryEmbedding[i];
        na += node.embedding[i] * node.embedding[i];
        nb += queryEmbedding[i] * queryEmbedding[i];
      }
      const denom = Math.sqrt(na) * Math.sqrt(nb);
      const score = denom === 0 ? 0 : dot / denom;
      scored.push({ node, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.node);
  }
  byDomain(domain: string): KnowledgeNode[] {
    return Array.from(this.graph.nodes.values()).filter((n) => n.domain === domain);
  }

  stats(): { nodeCount: number; edgeCount: number; domains: Record<string, number> } {
    const domains: Record<string, number> = {};
    for (const n of this.graph.nodes.values()) domains[n.domain] = (domains[n.domain] || 0) + 1;
    return { nodeCount: this.graph.nodes.size, edgeCount: this.graph.edges.length, domains };
  }
}

let instance: KnowledgeGraphEngine | null = null;
export function getKnowledgeEngine(): KnowledgeGraphEngine {
  if (!instance) instance = new KnowledgeGraphEngine();
  return instance;
}
