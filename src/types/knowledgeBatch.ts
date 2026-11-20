// Knowledge batches — the shipped, versioned unit of the knowledge graph.
// Every batch is an immutable JSON file under public/knowledge/batches/ with a
// manifest that indexes it. The app loads batches lazily, so the graph can grow
// without inflating the initial bundle.

import type {
  KnowledgeDomain,
  KnowledgeEdgeType,
  KnowledgeNodeType,
} from './knowledgeGraph';

export interface KBatchProvenance {
  /** Source document kind, e.g. "knowledge_essay", "loop", "practice". */
  source: string;
  /** Stable id of the source document inside the app data layer. */
  sourceId: string;
  /** Public URL of the source, when one exists. */
  url?: string;
  /** Who owns the text: "proprietary", "public-domain", "citation". */
  license: string;
}

export interface KBatchNode {
  id: string;
  slug: string;
  name: string;
  description: string;
  nodeType: KnowledgeNodeType;
  domain: KnowledgeDomain;
  aliases: string[];
  qualityScore: number;
  translations?: Record<string, { name: string; description: string }>;
  provenance: KBatchProvenance;
}

export interface KBatchEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: KnowledgeEdgeType;
  weight: number;
  confidence: number;
  provenance: KBatchProvenance;
}

/** A retrievable slice of source text, grounded to a node. */
export interface KBatchPassage {
  id: string;
  nodeId: string;
  heading?: string;
  text: string;
  charCount: number;
  order: number;
  provenance: KBatchProvenance;
}

export interface KBatch {
  id: string;
  version: number;
  createdAt: string;
  hash: string;
  nodes: KBatchNode[];
  edges: KBatchEdge[];
  passages: KBatchPassage[];
}

export interface KBatchManifestEntry {
  id: string;
  file: string;
  source: string;
  nodeCount: number;
  edgeCount: number;
  passageCount: number;
  domainCounts: Partial<Record<KnowledgeDomain, number>>;
  bytes: number;
  hash: string;
}

export interface KBatchManifest {
  version: number;
  generatedAt: string;
  targetNodesPerBatch: number;
  totals: {
    batches: number;
    nodes: number;
    edges: number;
    passages: number;
  };
  batches: KBatchManifestEntry[];
}

export interface KBatchStats {
  batches: number;
  nodes: number;
  edges: number;
  passages: number;
  domains: Record<string, number>;
  nodeTypes: Record<string, number>;
}
