import { supabase } from '@/lib/supabase';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@/types/knowledgeGraph';

export class KnowledgeGraphPersistence {
  async loadGraph(): Promise<KnowledgeGraph | null> {
    const { data: nodes, error: ne } = await supabase.from('knowledge_nodes').select('*');
    if (ne || !nodes || nodes.length === 0) return null;
    const { data: edges, error: ee } = await supabase.from('knowledge_edges').select('*');
    if (ee || !edges) return null;

    const nodeMap = new Map<string, KnowledgeNode>(
      nodes.map((n: Record<string, unknown>) => [
        String(n.id),
        {
          id: String(n.id),
          slug: String(n.slug),
          name: String(n.name),
          description: String(n.description),
          nodeType: n.node_type as KnowledgeNode['nodeType'],
          domain: n.domain as KnowledgeNode['domain'],
          aliases: (n.aliases as string[]) || [],
          metadata: (n.metadata as Record<string, unknown>) || {},
          embedding: (n.embedding as number[] | undefined) || undefined,
          sourceIds: (n.source_ids as string[]) || [],
        },
      ])
    );

    const edgeList: KnowledgeEdge[] = edges.map((e: Record<string, unknown>) => ({
      id: String(e.id),
      sourceId: String(e.source_node_id),
      targetId: String(e.target_node_id),
      relationshipType: e.relationship_type as KnowledgeEdge['relationshipType'],
      weight: Number(e.weight),
      confidence: Number(e.confidence),
      metadata: (e.metadata as Record<string, unknown>) || {},
      sourceIds: (e.source_ids as string[]) || [],
    }));

    const adjacency = new Map<string, string[]>();
    for (const e of edgeList) {
      const list = adjacency.get(e.sourceId) || [];
      list.push(e.targetId);
      adjacency.set(e.sourceId, list);
    }

    return { nodes: nodeMap, edges: edgeList, adjacency };
  }

  async saveGraph(graph: KnowledgeGraph): Promise<void> {
    const nodeRows = Array.from(graph.nodes.values()).map((n) => ({
      id: n.id,
      slug: n.slug,
      name: n.name,
      description: n.description,
      node_type: n.nodeType,
      domain: n.domain,
      aliases: n.aliases,
      metadata: n.metadata,
      source_ids: n.sourceIds,
      updated_at: new Date().toISOString(),
    }));
    const { error: ne } = await supabase.from('knowledge_nodes').upsert(nodeRows, { onConflict: 'id' });
    if (ne) throw new Error(`save nodes: ${ne.message}`);

    const edgeRows = graph.edges.map((e) => ({
      id: e.id,
      source_node_id: e.sourceId,
      target_node_id: e.targetId,
      relationship_type: e.relationshipType,
      weight: e.weight,
      confidence: e.confidence,
      metadata: e.metadata,
      source_ids: e.sourceIds,
    }));
    const { error: ee } = await supabase.from('knowledge_edges').upsert(edgeRows, { onConflict: 'id' });
    if (ee) throw new Error(`save edges: ${ee.message}`);
  }
}
