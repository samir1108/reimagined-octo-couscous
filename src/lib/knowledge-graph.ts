// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH — Main Export
// ─────────────────────────────────────────────────────────────────────────────

export type {
  KnowledgeNode,
  KnowledgeEdge,
  KnowledgeGraph,
  NodeType,
  EdgeType,
  GraphQuery,
  SearchResult,
  RelatedContent,
  ContentCluster,
  TraversalOptions,
} from './types';

export {
  buildContentGraph,
  getContentGraph,
  resetContentGraphCache,
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