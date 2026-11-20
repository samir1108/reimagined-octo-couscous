import { KNOWLEDGE_ESSAYS } from '@/data/knowledgeEssays';
import type { KnowledgeConceptSpec } from './concepts';

export const ESSAY_CONCEPTS: KnowledgeConceptSpec[] = KNOWLEDGE_ESSAYS.map((e) => ({
  id: `concept::essay::${e.slug}`,
  name: e.title,
  domain: 'transformation',
  nodeType: 'article',
  description: e.metaDescription || e.subtitle,
  aliases: e.keywords ? e.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
}));

export const ESSAY_EDGES = KNOWLEDGE_ESSAYS.flatMap((e) =>
  (e.related || []).map((r, i) => ({
    id: `edge::essay::${e.slug}::${r}::${i}`,
    sourceId: `concept::essay::${e.slug}`,
    targetId: `concept::essay::${r}`,
    relationshipType: 'RELATES_TO' as const,
    weight: 1.0,
    confidence: 1.0,
    sourceIds: [],
  }))
);
