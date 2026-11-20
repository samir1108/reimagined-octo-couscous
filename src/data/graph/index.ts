import type { ConsciousnessGraph } from '@/types/graph';
import { buildNodesFromExistingData } from './nodes';
import { buildEdgesFromExistingData } from './edges';

let cachedGraph: ConsciousnessGraph | null = null;

export function buildConsciousnessGraph(): ConsciousnessGraph {
  if (cachedGraph) return cachedGraph;

  const nodes = buildNodesFromExistingData();
  const nodeMap = new Map<string, (typeof nodes)[0]>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const edges = buildEdgesFromExistingData(nodeMap);

  cachedGraph = {
    nodes: nodeMap,
    edges,
  };

  return cachedGraph;
}

export function getGraph(): ConsciousnessGraph {
  return buildConsciousnessGraph();
}

export function resetGraphCache(): void {
  cachedGraph = null;
}
