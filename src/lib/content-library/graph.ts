/**
 * CONTENT LIBRARY — Knowledge Graph Integration
 * Connects library items into the existing ConsciousOS knowledge graph.
 */

import type { LibraryItem, ContentRelationship, RelationshipType } from '@/types/contentLibrary';
import type { KnowledgeNode, KnowledgeEdge, KnowledgeGraph, KnowledgeNodeType, KnowledgeDomain, KnowledgeEdgeType } from '@/types/knowledgeGraph';

export function libraryItemToKnowledgeNode(item: LibraryItem): KnowledgeNode {
  return {
    id: `library::${item.id}`,
    slug: item.id,
    name: item.title,
    description: item.description,
    nodeType: mapItemTypeToNodeType(item.type),
    domain: mapCategoryToDomain(item.category),
    aliases: [item.title, ...item.tags],
    metadata: {
      type: item.type,
      category: item.category,
      subcategory: item.subcategory,
      duration_minutes: item.duration_minutes,
      difficulty: item.difficulty,
      consciousness_dimensions: item.consciousness_dimensions,
      life_domains: item.life_domains,
      yoga_paths: item.yoga_paths,
      suitable_bands: item.suitable_bands,
      tags: item.tags,
      source: item.source,
      quality_score: item.quality_score,
    },
    qualityScore: item.quality_score,
    version: item.version,
    sourceIds: item.provenance ? [item.provenance] : [],
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapItemTypeToNodeType(type: string): KnowledgeNodeType {
  const map: Record<string, KnowledgeNodeType> = {
    practice: 'practice', micro_practice: 'exercise', wisdom: 'concept',
    game: 'exercise', program: 'journey', podcast: 'article', meditation: 'practice',
    challenge: 'challenge', ritual: 'practice', course: 'journey', story: 'article',
    tool: 'capability', journaling: 'reflection', self_inquiry: 'practice',
    breathwork: 'technique', somatic: 'technique', assessment: 'assessment',
    life_experiment: 'exercise', psychological_pattern: 'concept', emotional_experience: 'concept',
    personality_exploration: 'concept', archetype: 'concept', chakra_knowledge: 'concept',
    dream_exploration: 'concept', relationship_exercise: 'exercise', karma_experiment: 'exercise',
    concentration_exercise: 'exercise', creative_awareness: 'exercise', nature_experience: 'exercise',
    reflection_question: 'concept', daily_mission: 'challenge',
  };
  return map[type] || 'concept';
}

function mapCategoryToDomain(category: string): KnowledgeDomain {
  const map: Record<string, KnowledgeDomain> = { wisdom_teachings: 'spirituality', guided_programs: 'transformation',
    games_interactive: 'mind', podcasts_audio: 'consciousness', meditations: 'consciousness',
    journaling: 'mind', self_inquiry: 'consciousness', challenges_quests: 'transformation',
    rituals_ceremonies: 'spirituality', breathwork: 'body', somatic: 'body',
    courses_learning: 'mind', stories_parables: 'spirituality',
  };
  return (map[category] || 'consciousness') as KnowledgeDomain;
}

export function relationshipToKnowledgeEdge(rel: ContentRelationship): KnowledgeEdge {
  return {
    id: rel.id,
    sourceId: `library::${rel.from_item_id}`,
    targetId: `library::${rel.to_item_id}`,
    relationshipType: mapRelationshipType(rel.relationship_type),
    weight: rel.weight,
    confidence: rel.confidence,
    metadata: rel.metadata || {},
    sourceIds: [],
  };
}

function mapRelationshipType(type: RelationshipType): KnowledgeEdgeType {
  const map: Record<string, KnowledgeEdgeType> = {
    related_to: 'RELATES_TO', prerequisite_of: 'REQUIRES', part_of_program: 'PART_OF',
    part_of_course: 'PART_OF', teaches_concept: 'DEVELOPS', dissolves_loop: 'MAY_INFLUENCE',
    develops_skill: 'DEVELOPS', references_wisdom: 'DERIVED_FROM', pairs_with: 'SIMILAR_TO',
    alternative_to: 'SIMILAR_TO', deepens: 'SUPPORTS', simplifies: 'SIMILAR_TO',
    follows: 'FOLLOWS', precedes: 'PRECEDES',
  };
  return (map[type] || 'RELATES_TO') as KnowledgeEdgeType;
}

export function buildLibrarySubgraph(items: LibraryItem[], relationships: ContentRelationship[]): KnowledgeGraph {
  const nodes = new Map<string, KnowledgeNode>();
  const edges: KnowledgeEdge[] = [];

  for (const item of items) {
    const node = libraryItemToKnowledgeNode(item);
    nodes.set(node.id, node);
  }

  for (const rel of relationships) {
    const edge = relationshipToKnowledgeEdge(rel);
    if (nodes.has(edge.sourceId) && nodes.has(edge.targetId)) {
      edges.push(edge);
    }
  }

  const dimGroups = new Map<string, string[]>();
  for (const item of items) {
    for (const dim of (item.consciousness_dimensions || [])) {
      const group = dimGroups.get(dim) || [];
      group.push(item.id);
      dimGroups.set(dim, group);
    }
  }

  for (const [dim, ids] of dimGroups) {
    for (let i = 0; i < Math.min(ids.length, 5); i++) {
      for (let j = i + 1; j < Math.min(ids.length, 5); j++) {
        const fromId = `library::${ids[i]}`;
        const toId = `library::${ids[j]}`;
        if (nodes.has(fromId) && nodes.has(toId) && fromId !== toId) {
          const exists = edges.some((e) => e.sourceId === fromId && e.targetId === toId);
          if (!exists) {
            edges.push({
              id: `auto-dim-${dim}-${i}-${j}`,
              sourceId: fromId,
              targetId: toId,
              relationshipType: 'RELATES_TO',
              weight: 0.3,
              confidence: 0.5,
              metadata: { auto: true, dimension: dim },
              sourceIds: [],
            });
          }
        }
      }
    }
  }

  const adjacency = new Map<string, string[]>();
  for (const e of edges) {
    const list = adjacency.get(e.sourceId) || [];
    list.push(e.targetId);
    adjacency.set(e.sourceId, list);
  }

  return { nodes, edges, adjacency } as KnowledgeGraph;
}

export interface ConceptLink {
  conceptId: string;
  libraryItemId: string;
  strength: number;
}

export function linkConceptsToLibraryItems(conceptIds: string[], items: LibraryItem[]): ConceptLink[] {
  const links: ConceptLink[] = [];
  for (const conceptId of conceptIds) {
    const conceptLower = conceptId.toLowerCase();
    for (const item of items) {
      const hay = `${item.title} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase();
      if (hay.includes(conceptLower)) {
        links.push({ conceptId, libraryItemId: item.id, strength: 0.6 });
      }
    }
  }
  return links;
}

export function getGraphNeighbors(graph: KnowledgeGraph, nodeId: string, maxDepth: number = 2): string[] {
  const visited = new Set<string>();
  const queue: { id: string; depth: number }[] = [{ id: nodeId, depth: 0 }];
  const result: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    if (current.depth > 0 && current.depth <= maxDepth) {
      result.push(current.id);
    }

    if (current.depth < maxDepth) {
      const neighbors = graph.adjacency.get(current.id) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          queue.push({ id: n, depth: current.depth + 1 });
        }
      }
    }
  }

  return result;
}

// ─── Cached Subgraph Helper ──────────────────────────────────────────────────

let _cachedGraph: KnowledgeGraph | null = null;
let _cachedItemCount = 0;

export function getCachedLibrarySubgraph(items: LibraryItem[], relationships: ContentRelationship[]): KnowledgeGraph {
  if (_cachedGraph && _cachedItemCount === items.length) return _cachedGraph;
  _cachedGraph = buildLibrarySubgraph(items, relationships);
  _cachedItemCount = items.length;
  return _cachedGraph;
}

export function invalidateCachedSubgraph(): void {
  _cachedGraph = null;
  _cachedItemCount = 0;
}
