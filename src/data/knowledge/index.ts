import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@/types/knowledgeGraph';
import { KNOWLEDGE_DOMAIN_SPECS } from './domains';
import { KNOWLEDGE_CONCEPTS } from './concepts';
import { CURATED_CONCEPTS } from './curatedConcepts';
import { ESSAY_CONCEPTS, ESSAY_EDGES } from './essaysToKnowledge';
import { LOOP_CONCEPTS } from './loopsToKnowledge';
import { PRACTICE_CONCEPTS } from './practicesToKnowledge';
import { GLOSSARY_CONCEPTS } from './glossaryToKnowledge';
import { KNOWLEDGE_EDGES } from './edges';
import { KNOWLEDGE_SOURCES } from './sources';

import { generateKnowledgeConcepts } from './generated';

let cached: KnowledgeGraph | null = null;

export function getKnowledgeGraph(): KnowledgeGraph {
  if (cached) return cached;

  const nodes = new Map<string, KnowledgeNode>();
  const allConcepts = [...KNOWLEDGE_CONCEPTS, ...CURATED_CONCEPTS, ...ESSAY_CONCEPTS, ...LOOP_CONCEPTS, ...PRACTICE_CONCEPTS, ...GLOSSARY_CONCEPTS, ...generateKnowledgeConcepts()];
  for (const c of allConcepts) {
    nodes.set(c.id, {
      id: c.id,
      slug: c.id.replace(/::/g, '-'),
      name: c.name,
      description: c.description,
      nodeType: c.nodeType,
      domain: c.domain,
      aliases: c.aliases || [],
      metadata: {},
      sourceIds: [],
    });
  }

  // Domain nodes as concepts? optional; skip to keep graph concept-focused

  const edges: KnowledgeEdge[] = [...KNOWLEDGE_EDGES, ...ESSAY_EDGES].map((e) => ({
    id: e.id,
    sourceId: e.sourceId,
    targetId: e.targetId,
    relationshipType: e.relationshipType,
    weight: e.weight ?? 1.0,
    confidence: e.confidence ?? 1.0,
    metadata: {},
    sourceIds: e.sourceIds || [],
  })).filter((e) => nodes.has(e.sourceId) && nodes.has(e.targetId));

  const adjacency = new Map<string, string[]>();
  for (const e of edges) {
    const list = adjacency.get(e.sourceId) || [];
    list.push(e.targetId);
    adjacency.set(e.sourceId, list);
  }

  cached = { nodes, edges, adjacency };
  return cached;
}

export function resetKnowledgeGraphCache(): void {
  cached = null;
}

export { KNOWLEDGE_DOMAIN_SPECS, KNOWLEDGE_CONCEPTS, KNOWLEDGE_EDGES, KNOWLEDGE_SOURCES };
