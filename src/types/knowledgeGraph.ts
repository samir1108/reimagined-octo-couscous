// Knowledge Graph ontology for ConsciousOS
// Canonical (general) knowledge + personal (user-specific) knowledge + intelligence.

export type KnowledgeDomain =
  | 'consciousness'
  | 'mind'
  | 'psychology'
  | 'yoga'
  | 'spirituality'
  | 'neuroscience'
  | 'body'
  | 'behaviour'
  | 'life'
  | 'transformation';

export const KNOWLEDGE_DOMAINS: KnowledgeDomain[] = [
  'consciousness',
  'mind',
  'psychology',
  'yoga',
  'spirituality',
  'neuroscience',
  'body',
  'behaviour',
  'life',
  'transformation',
];

export type KnowledgeNodeType =
  | 'concept'
  | 'theory'
  | 'principle'
  | 'model'
  | 'tradition'
  | 'school'
  | 'text'
  | 'teacher'
  | 'emotion'
  | 'thought'
  | 'belief'
  | 'trait'
  | 'behaviour'
  | 'awareness'
  | 'attention'
  | 'state'
  | 'witness'
  | 'breath'
  | 'posture'
  | 'body-system'
  | 'practice'
  | 'technique'
  | 'exercise'
  | 'skill'
  | 'capability'
  | 'milestone'
  | 'user'
  | 'preference'
  | 'observation'
  | 'experience'
  | 'journey'
  | 'mission'
  | 'session'
  | 'reflection'
  | 'life-domain'
  | 'goal'
  | 'challenge'
  | 'habit'
  | 'source'
  | 'research'
  | 'claim'
  | 'assessment'
  | 'article';

export type KnowledgeEdgeType =
  | 'IS_A'
  | 'PART_OF'
  | 'HAS_PROPERTY'
  | 'ASSOCIATED_WITH'
  | 'CAUSES'
  | 'MAY_INFLUENCE'
  | 'SUPPORTS'
  | 'DEVELOPS'
  | 'REQUIRES'
  | 'PRECEDES'
  | 'FOLLOWS'
  | 'PRACTICED_THROUGH'
  | 'EXPLORED_THROUGH'
  | 'MEASURED_BY'
  | 'ASSESSED_BY'
  | 'DERIVED_FROM'
  | 'CONTRADICTS'
  | 'SIMILAR_TO'
  | 'APPLIES_TO'
  | 'RELEVANT_FOR'
  | 'OBSERVED_IN'
  | 'EXPERIENCED_BY'
  | 'PREFERRED_BY'
  | 'COMPLETED_BY'
  | 'DESCRIBED_IN'
  | 'PART_OF_TRADITION'
  | 'RELATES_TO';

export type EvidenceType =
  | 'text'
  | 'research'
  | 'clinical'
  | 'traditional'
  | 'inferred'
  | 'user-reported'
  | 'measured'
  | 'demonstrated';

export type ProvenanceKind =
  | 'reported'
  | 'measured'
  | 'inferred'
  | 'demonstrated';

export interface KnowledgeSource {
  id: string;
  title: string;
  author?: string;
  tradition?: string;
  sourceType: 'text' | 'research' | 'assessment' | 'practice' | 'framework' | 'blog';
  url?: string;
  publicationYear?: number;
}

export interface KnowledgeClaim {
  id: string;
  subjectId: string;
  predicate: KnowledgeEdgeType;
  objectId: string;
  sourceId?: string;
  evidenceType: EvidenceType;
  confidence: number;
}

export interface KnowledgeNode {
  id: string;
  slug: string;
  name: string;
  description: string;
  nodeType: KnowledgeNodeType;
  domain: KnowledgeDomain;
  aliases: string[];
  metadata: Record<string, unknown>;
  qualityScore?: number;
  version?: number;
  translations?: Record<string, { name: string; description: string }>;
  embedding?: number[];
  sourceIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: KnowledgeEdgeType;
  weight: number;
  confidence: number;
  metadata: Record<string, unknown>;
  sourceIds: string[];
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: KnowledgeEdge[];
  adjacency: Map<string, string[]>;
}

export interface PersonalNodeState {
  status?: 'active' | 'resolved' | 'exploring' | 'avoided';
  strength?: number;
  firstObservedAt?: string;
  lastObservedAt?: string;
  history?: Array<{ at: string; value: unknown; provenance: ProvenanceKind }>;
}

export interface PersonalGraphNode {
  id: string;
  userId: string;
  knowledgeNodeId?: string;
  nodeType: KnowledgeNodeType;
  label: string;
  state: PersonalNodeState;
  provenance: ProvenanceKind;
  confidence: number;
  metadata: Record<string, unknown>;
}

export interface PersonalGraphEdge {
  id: string;
  userId: string;
  sourceId: string;
  targetId: string;
  relationshipType: KnowledgeEdgeType;
  confidence: number;
  provenance: ProvenanceKind;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PersonalKnowledgeGraph {
  userId: string;
  nodes: Map<string, PersonalGraphNode>;
  edges: PersonalGraphEdge[];
}

export interface KnowledgeRetrievalResult {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  score: number;
}

export interface DevelopmentalStep {
  title: string;
  rationale: string;
  relatedConceptIds: string[];
  suggestedPracticeIds: string[];
  confidence: number;
}
