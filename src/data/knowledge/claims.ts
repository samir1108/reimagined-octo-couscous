import { KNOWLEDGE_EDGES } from './edges';
import type { KnowledgeClaim } from '@/types/knowledgeGraph';

export const KNOWLEDGE_CLAIMS: KnowledgeClaim[] = KNOWLEDGE_EDGES.slice(0, 50).map((e, i) => ({
  id: `claim::${i}`,
  subjectId: e.sourceId,
  predicate: e.relationshipType,
  objectId: e.targetId,
  sourceId: e.sourceIds[0],
  evidenceType: 'traditional',
  confidence: e.confidence,
}));
