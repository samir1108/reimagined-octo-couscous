// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE GRAPH — Blog/Content Types
// ─────────────────────────────────────────────────────────────────────────────

export type NodeType =
  | 'blog-post'
  | 'knowledge-essay'
  | 'loop-essay'
  | 'breakthrough-essay'
  | 'category'
  | 'pillar'
  | 'tag'
  | 'author'
  | 'concept'
  | 'practice'
  | 'loop'
  | 'band'
  | 'path'
  | 'guru'
  | 'dimension'
  | 'chakra'
  | 'wisdom-card'
  | 'program'
  | 'course-day'
  | 'skill';

export type EdgeType =
  | 'BELONGS_TO_CATEGORY'
  | 'BELONGS_TO_PILLAR'
  | 'TAGGED_WITH'
  | 'AUTHORED_BY'
  | 'MENTIONS_CONCEPT'
  | 'REFERENCES_PRACTICE'
  | 'REFERENCES_LOOP'
  | 'REFERENCES_BAND'
  | 'REFERENCES_PATH'
  | 'REFERENCES_GURU'
  | 'REFERENCES_DIMENSION'
  | 'REFERENCES_CHAKRA'
  | 'RELATED_TO'
  | 'CITES'
  | 'FOLLOWS'
  | 'PRECEDES'
  | 'CONTRASTS_WITH'
  | 'EXPANDS_ON'
  | 'APPLIES_TO_PROGRAM'
  | 'PART_OF_COURSE'
  | 'DEVELOPS_SKILL'
  | 'SHARED_KEYWORD'
  | 'SIMILAR_AUDIENCE'
  | 'CONTINUES_THREAD';

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  label: string;
  slug?: string;
  uri: string;
  data: Record<string, unknown>;
  aliases: string[];
  weight?: number;
}

export interface KnowledgeEdge {
  id: string;
  type: EdgeType;
  from: string;
  to: string;
  weight: number;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: KnowledgeEdge[];
}

export interface GraphQuery {
  nodeId?: string;
  nodeType?: NodeType;
  edgeType?: EdgeType;
  direction?: 'outgoing' | 'incoming' | 'both';
  maxDepth?: number;
  limit?: number;
}

export interface SearchResult {
  node: KnowledgeNode;
  score: number;
  matchedFields: string[];
}

export interface RelatedContent {
  node: KnowledgeNode;
  relationship: EdgeType;
  distance: number;
  path: string[];
}

export interface ContentCluster {
  id: string;
  label: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  centralNode?: KnowledgeNode;
}

export interface TraversalOptions {
  maxDepth: number;
  maxNodes: number;
  edgeTypes?: EdgeType[];
  nodeTypes?: NodeType[];
  direction: 'outgoing' | 'incoming' | 'both';
}