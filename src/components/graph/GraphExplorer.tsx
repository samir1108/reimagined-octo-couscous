import { useMemo } from 'react';
import { getEngine } from '@/lib/graph/engine';

export interface GraphExplorerProps {
  centerId?: string;
  depth?: number;
  maxNodes?: number;
}

export function GraphExplorer({ centerId, depth = 2, maxNodes = 50 }: GraphExplorerProps) {
  const engine = useMemo(() => getEngine(), []);
  const subgraph = useMemo(() => {
    if (!centerId) return null;
    return engine.subgraph(centerId, depth);
  }, [engine, centerId, depth]);

  const nodeCount = subgraph ? subgraph.nodes.size : 0;
  const edgeCount = subgraph ? subgraph.edges.length : 0;

  if (!centerId) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        Enter a node ID to explore the graph. Examples: <code className="font-mono">loop::VAL001</code>, <code className="font-mono">practice::observation</code>, <code className="font-mono">band::2</code>
      </div>
    );
  }

  if (!subgraph || nodeCount === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        No graph data found for <code className="font-mono">{centerId}</code>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-white/60">
        <span>Nodes: {nodeCount}</span>
        <span>Edges: {edgeCount}</span>
        <span>Depth: {depth}</span>
      </div>
      <div className="max-h-96 space-y-1 overflow-y-auto">
        {Array.from(subgraph.nodes.values())
          .slice(0, maxNodes)
          .map((node) => {
            const edges = subgraph.edges.filter(e => e.from === node.id || e.to === node.id);
            return (
              <div
                key={node.id}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/40">{node.type}</span>
                  <span className="text-sm font-medium text-white">{node.label}</span>
                </div>
                <div className="mt-1 text-xs text-white/50">
                  {node.id} · {edges.length} edges
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
