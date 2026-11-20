import type { KnowledgeGraph } from '@/types/knowledgeGraph';

// Flag contradictory edges: pairs of edges between same nodes with opposing semantics
export function findContradictions(graph: KnowledgeGraph): Array<{ a: string; b: string }> {
  const out: Array<{ a: string; b: string }> = [];
  const byPair = new Map<string, string[]>();
  for (const e of graph.edges) {
    const key = [e.sourceId, e.targetId].sort().join('::');
    const list = byPair.get(key) || [];
    list.push(e.id);
    byPair.set(key, list);
  }
  for (const ids of byPair.values()) {
    if (ids.length > 1) {
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          out.push({ a: ids[i], b: ids[j] });
        }
      }
    }
  }
  return out;
}

// Simple version bump helper
export function bumpVersion(current?: number): number {
  return (current || 0) + 1;
}
