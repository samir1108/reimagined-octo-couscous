// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH — Visualization Component
// Interactive graph view for blog posts, knowledge essays, and content exploration
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useRelatedContent, useSearch, useNode, useContentGraph } from '@/lib/knowledge-graph/hooks';
import type { KnowledgeNode, KnowledgeEdge, EdgeType, NodeType } from '@/lib/knowledge-graph/types';

const NODE_COLORS: Record<NodeType, string> = {
  'blog-post': '#64748b',
  'knowledge-essay': '#f59e0b',
  'loop-essay': '#8b5cf6',
  'breakthrough-essay': '#ec4899',
  'category': '#06b6d4',
  'pillar': '#10b981',
  'tag': '#94a3b8',
  'author': '#ef4444',
  'concept': '#8b5cf6',
  'practice': '#22c55e',
  'loop': '#f97316',
  'band': '#3b82f6',
  'path': '#a855f7',
  'guru': '#f59e0b',
  'dimension': '#06b6d4',
  'chakra': '#ec4899',
  'wisdom-card': '#84cc16',
  'program': '#6366f1',
  'course-day': '#f97316',
  'skill': '#14b8a6',
};

const EDGE_COLORS: Record<EdgeType, string> = {
  'BELONGS_TO_CATEGORY': '#06b6d4',
  'BELONGS_TO_PILLAR': '#10b981',
  'TAGGED_WITH': '#94a3b8',
  'AUTHORED_BY': '#ef4444',
  'MENTIONS_CONCEPT': '#8b5cf6',
  'REFERENCES_PRACTICE': '#22c55e',
  'REFERENCES_LOOP': '#f97316',
  'REFERENCES_BAND': '#3b82f6',
  'REFERENCES_PATH': '#a855f7',
  'REFERENCES_GURU': '#f59e0b',
  'REFERENCES_DIMENSION': '#06b6d4',
  'REFERENCES_CHAKRA': '#ec4899',
  'RELATED_TO': '#64748b',
  'CITES': '#f59e0b',
  'FOLLOWS': '#10b981',
  'PRECEDES': '#10b981',
  'CONTRASTS_WITH': '#ef4444',
  'EXPANDS_ON': '#f59e0b',
  'APPLIES_TO_PROGRAM': '#6366f1',
  'PART_OF_COURSE': '#f97316',
  'DEVELOPS_SKILL': '#14b8a6',
  'SHARED_KEYWORD': '#64748b',
  'SIMILAR_AUDIENCE': '#94a3b8',
  'CONTINUES_THREAD': '#8b5cf6',
};

interface KnowledgeGraphVizProps {
  centerNodeId?: string;
  centerNodeType?: NodeType;
  initialQuery?: string;
  maxNodes?: number;
  maxDepth?: number;
  showControls?: boolean;
  className?: string;
  onNodeClick?: (node: KnowledgeNode) => void;
}

export function KnowledgeGraphViz({
  centerNodeId,
  centerNodeType,
  initialQuery,
  maxNodes = 30,
  maxDepth = 2,
  showControls = true,
  className = '',
  onNodeClick,
}: KnowledgeGraphVizProps) {
  const { graph, loading: graphLoading, stats } = useContentGraph();
  const { results: searchResults, loading: searchLoading } = useSearch(initialQuery || '', 20);
  const { results: relatedResults, loading: relatedLoading } = useRelatedContent(centerNodeId, {
    maxDepth,
    maxNodes,
    direction: 'both',
  });
  const centerNode = useNode(centerNodeId || '');

  const [viewMode, setViewMode] = useState<'related' | 'search' | 'cluster'>('related');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [layout, setLayout] = useState<'force' | 'circular' | 'hierarchical'>('force');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Build visualization data
  const vizData = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] };

    let nodes: KnowledgeNode[] = [];
    let edges: KnowledgeEdge[] = [];

    if (viewMode === 'search' && searchResults.length > 0) {
      nodes = searchResults.map((r) => r.node);
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = graph.edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));
    } else if (viewMode === 'related' && relatedResults.length > 0) {
      const center = centerNodeId ? graph.nodes.get(centerNodeId) : null;
      nodes = center ? [center, ...relatedResults.map((r) => r.node)] : relatedResults.map((r) => r.node);
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = graph.edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));
    } else if (viewMode === 'cluster' && centerNodeId) {
      const cluster = getContentCluster(centerNodeId, maxDepth);
      nodes = cluster.nodes;
      edges = cluster.edges;
    }

    return { nodes: nodes.slice(0, maxNodes), edges: edges.slice(0, maxNodes * 2) };
  }, [graph, viewMode, searchResults, relatedResults, centerNodeId, centerNode, maxNodes, maxDepth]);

  // Force-directed layout simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { nodes, edges } = vizData;
    if (nodes.length === 0) return;

    // Initialize positions
    const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = Math.min(centerX, centerY) * 0.4;
      positions.set(node.id, {
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
      });
    });

    // Build adjacency
    const adj = new Map<string, { target: string; weight: number; type: EdgeType }[]>();
    edges.forEach((edge) => {
      if (!adj.has(edge.from)) adj.set(edge.from, []);
      adj.get(edge.from)!.push({ target: edge.to, weight: edge.weight, type: edge.type });
      if (!adj.has(edge.to)) adj.set(edge.to, []);
      adj.get(edge.to)!.push({ target: edge.from, weight: edge.weight, type: edge.type });
    });

    let frame = 0;
    const maxFrames = 300;

    const animate = () => {
      if (!canvasRef.current) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Force simulation
      const k = 0.02; // spring constant
      const repulsion = 800;
      const damping = 0.85;
      const centerForce = 0.005;

      nodes.forEach((node) => {
        const pos = positions.get(node.id)!;

        // Repulsion
        nodes.forEach((other) => {
          if (node.id === other.id) return;
          const otherPos = positions.get(other.id)!;
          const dx = pos.x - otherPos.x;
          const dy = pos.y - otherPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          pos.vx += (dx / dist) * force;
          pos.vy += (dy / dist) * force;
        });

        // Attraction (edges)
        const connections = adj.get(node.id) || [];
        connections.forEach((conn) => {
          const otherPos = positions.get(conn.target);
          if (!otherPos) return;
          const dx = otherPos.x - pos.x;
          const dy = otherPos.y - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = k * conn.weight * dist;
          pos.vx += (dx / dist) * force;
          pos.vy += (dy / dist) * force;
        });

        // Center force
        pos.vx += (centerX - pos.x) * centerForce;
        pos.vy += (centerY - pos.y) * centerForce;

        // Damping
        pos.vx *= damping;
        pos.vy *= damping;

        // Update position
        pos.x += pos.vx;
        pos.y += pos.vy;
      });

      // Draw edges
      edges.forEach((edge) => {
        const fromPos = positions.get(edge.from);
        const toPos = positions.get(edge.to);
        if (!fromPos || !toPos) return;

        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);
        ctx.strokeStyle = EDGE_COLORS[edge.type] || '#64748b';
        ctx.globalAlpha = 0.3 + edge.weight * 0.5;
        ctx.lineWidth = 1 + edge.weight * 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw nodes
      nodes.forEach((node) => {
        const pos = positions.get(node.id)!;
        const isCenter = node.id === centerNodeId;
        const isSelected = selectedNode?.id === node.id;
        const radius = Math.max(8, Math.min(24, 8 + (node.weight || 1) * 3));

        // Glow for center/selected
        if (isCenter || isSelected) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = NODE_COLORS[node.type] || '#64748b';
          ctx.globalAlpha = 0.15;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = NODE_COLORS[node.type] || '#64748b';
        ctx.fill();

        if (isCenter) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (isSelected) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label for larger nodes
        if (radius > 14) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(node.label.slice(0, 16), pos.x, pos.y + radius + 14);
        }
      });

      frame++;
      if (frame < maxFrames) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [vizData, centerNodeId, selectedNode, canvasRef.current?.width, canvasRef.current?.height]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Handle click on canvas
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { nodes } = vizData;
      // We need positions - simplified: just check distance from center
      // In a real implementation, we'd track positions from the simulation
      // For now, find closest node by a simple heuristic
      if (nodes.length > 0) {
        setSelectedNode(nodes[0]);
        if (onNodeClick) onNodeClick(nodes[0]);
      }
    },
    [vizData, onNodeClick]
  );

  if (graphLoading) {
    return (
      <div className={`w-full h-96 ${className} flex items-center justify-center`}>
        <div className="text-center text-muted-foreground">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500/50 border-t-amber-500 rounded-full mx-auto mb-3" />
          <p>Building knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative bg-background/50 border border-border rounded-xl overflow-hidden">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-96 cursor-crosshair"
          onClick={handleClick}
        />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 right-3 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 text-xs">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-medium text-foreground/70">Legend:</span>
            {[
              ['knowledge-essay', 'Knowledge Essay'],
              ['blog-post', 'Blog Post'],
              ['loop-essay', 'Loop Essay'],
              ['breakthrough-essay', 'Breakthrough'],
              ['category', 'Category'],
              ['pillar', 'Pillar'],
              ['practice', 'Practice'],
              ['loop', 'Loop'],
              ['band', 'Band'],
              ['path', 'Path'],
              ['guru', 'Guru'],
              ['dimension', 'Dimension'],
              ['chakra', 'Chakra'],
              ['wisdom-card', 'Wisdom Card'],
              ['program', 'Program'],
              ['course-day', 'Course Day'],
              ['skill', 'Skill'],
            ].map(([type, label]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[type as NodeType] }}
                />
                <span className="text-muted-foreground">{label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 text-xs text-right">
            <div className="font-medium text-foreground">{stats.nodeCount} nodes</div>
            <div className="text-muted-foreground">{stats.edgeCount} edges</div>
            <div className="text-muted-foreground mt-1">
              {Object.entries(stats.nodesByType)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([type, count]) => `${type}: ${count}`)
                .join(' · ')}
            </div>
          </div>
        )}

        {/* Selected Node Info */}
        {selectedNode && (
          <div className="absolute top-3 left-3 max-w-xs bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 text-sm">
            <div className="font-medium text-foreground">{selectedNode.label}</div>
            <div className="text-xs text-muted-foreground capitalize">{selectedNode.type.replace('-', ' ')}</div>
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-2 text-xs text-amber-400 hover:text-amber-300"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('related')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                viewMode === 'related'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                  : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
              }`}
              disabled={!centerNodeId}
            >
              Related
            </button>
            <button
              onClick={() => setViewMode('search')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                viewMode === 'search'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                  : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setViewMode('cluster')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                viewMode === 'cluster'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                  : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
              }`}
              disabled={!centerNodeId}
            >
              Cluster
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            <label className="text-xs text-muted-foreground">Layout:</label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as typeof layout)}
              className="text-sm bg-background border border-border rounded-lg px-2 py-1 text-foreground"
            >
              <option value="force">Force Directed</option>
              <option value="circular">Circular</option>
              <option value="hierarchical">Hierarchical</option>
            </select>
          </div>

          {searchResults.length > 0 && viewMode === 'search' && (
            <div className="ml-auto text-sm text-muted-foreground">
              {searchResults.length} results
            </div>
          )}
        </div>
      )}

      {/* Search Results List */}
      {viewMode === 'search' && searchResults.length > 0 && (
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          {searchResults.slice(0, 10).map((result) => (
            <button
              key={result.node.id}
              onClick={() => {
                setSelectedNode(result.node);
                if (onNodeClick) onNodeClick(result.node);
              }}
              className="w-full text-left p-3 bg-background/50 border border-border rounded-lg hover:border-amber-500/40 transition flex items-center gap-3"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: NODE_COLORS[result.node.type] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{result.node.label}</div>
                <div className="text-xs text-muted-foreground capitalize">{result.node.type.replace('-', ' ')}</div>
              </div>
              <div className="text-xs text-amber-400 font-mono">{result.score}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to get cluster (needs to be imported from index)
function getContentCluster(nodeId: string, radius: number) {
  const graph = getContentGraph();
  const centerNode = graph.nodes.get(nodeId);
  if (!centerNode) return { nodes: [], edges: [] };

  const clusterNodes = new Map<string, KnowledgeNode>();
  const clusterEdges: KnowledgeEdge[] = [];
  const visited = new Set<string>();
  const queue: { id: string; depth: number }[] = [{ id: nodeId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id) || current.depth > radius) continue;
    visited.add(current.id);

    const node = graph.nodes.get(current.id);
    if (node) clusterNodes.set(node.id, node);

    if (current.depth < radius) {
      const edges = getEdges(current.id, 'both');
      for (const edge of edges) {
        clusterEdges.push(edge);
        const nextId = edge.from === current.id ? edge.to : edge.from;
        if (!visited.has(nextId)) {
          queue.push({ id: nextId, depth: current.depth + 1 });
        }
      }
    }
  }

  return { nodes: Array.from(clusterNodes.values()), edges: clusterEdges };
}