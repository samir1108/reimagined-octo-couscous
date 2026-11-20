// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH — React Hooks
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useMemo } from 'react';
import type {
  KnowledgeNode,
  KnowledgeEdge,
  KnowledgeGraph,
  NodeType,
  EdgeType,
  SearchResult,
  RelatedContent,
  ContentCluster,
} from './types';
import {
  buildContentGraph,
  getContentGraph,
  getNodeById,
  getNodesByType,
  getEdges,
  getNeighbors,
  findPath,
  searchContent,
  getRelatedContent,
  getContentCluster,
  getStats,
} from './index';

let globalGraph: KnowledgeGraph | null = null;
let graphPromise: Promise<KnowledgeGraph> | null = null;

export function useContentGraph() {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(globalGraph);
  const [loading, setLoading] = useState(!globalGraph);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);

  useEffect(() => {
    if (globalGraph) {
      setGraph(globalGraph);
      setLoading(false);
      setStats(getStats());
      return;
    }

    if (!graphPromise) {
      graphPromise = buildContentGraph();
    }

    graphPromise
      .then((g) => {
        globalGraph = g;
        setGraph(g);
        setStats(getStats());
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { graph, loading, error, stats };
}

export function useNode(nodeId: string | null) {
  const { graph } = useContentGraph();
  return useMemo(() => {
    if (!graph || !nodeId) return null;
    return getNodeById(nodeId);
  }, [graph, nodeId]);
}

export function useNodesByType(type: NodeType) {
  const { graph } = useContentGraph();
  return useMemo(() => {
    if (!graph) return [];
    return getNodesByType(type);
  }, [graph, type]);
}

export function useEdges(
  nodeId: string | null,
  direction: 'outgoing' | 'incoming' | 'both' = 'both',
  edgeTypes?: EdgeType[]
) {
  const { graph } = useContentGraph();
  return useMemo(() => {
    if (!graph || !nodeId) return [];
    return getEdges(nodeId, direction, edgeTypes);
  }, [graph, nodeId, direction, edgeTypes]);
}

export function useNeighbors(nodeId: string | null, edgeTypes?: EdgeType[]) {
  const { graph } = useContentGraph();
  return useMemo(() => {
    if (!graph || !nodeId) return [];
    return getNeighbors(nodeId, edgeTypes);
  }, [graph, nodeId, edgeTypes]);
}

export function useSearch(query: string, limit: number = 20) {
  const { graph } = useContentGraph();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!graph || !query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    // Debounce
    const timeout = setTimeout(() => {
      const res = searchContent(query, limit);
      setResults(res);
      setLoading(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [graph, query, limit]);

  return { results, loading };
}

export function useRelatedContent(
  nodeId: string | null,
  options?: {
    maxDepth?: number;
    maxNodes?: number;
    edgeTypes?: EdgeType[];
    nodeTypes?: NodeType[];
    direction?: 'outgoing' | 'incoming' | 'both';
  }
) {
  const { graph } = useContentGraph();
  const [results, setResults] = useState<RelatedContent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!graph || !nodeId) {
      setResults([]);
      return;
    }

    setLoading(true);
    const res = getRelatedContent(nodeId, options);
    setResults(res);
    setLoading(false);
  }, [graph, nodeId, options?.maxDepth, options?.maxNodes, options?.direction]);

  return { results, loading };
}

export function useContentCluster(nodeId: string | null, radius: number = 2) {
  const { graph } = useContentGraph();
  const [cluster, setCluster] = useState<ContentCluster | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!graph || !nodeId) {
      setCluster(null);
      return;
    }

    setLoading(true);
    const c = getContentCluster(nodeId, radius);
    setCluster(c);
    setLoading(false);
  }, [graph, nodeId, radius]);

  return { cluster, loading };
}

export function useFindPath(fromId: string | null, toId: string | null, maxDepth: number = 5) {
  const { graph } = useContentGraph();
  const [path, setPath] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!graph || !fromId || !toId) {
      setPath([]);
      return;
    }

    setLoading(true);
    const p = findPath(fromId, toId, maxDepth);
    setPath(p);
    setLoading(false);
  }, [graph, fromId, toId, maxDepth]);

  return { path, loading };
}