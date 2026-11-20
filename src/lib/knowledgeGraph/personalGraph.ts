import { supabase } from '@/lib/supabase';
import type {
  PersonalKnowledgeGraph,
  PersonalGraphNode,
  PersonalGraphEdge,
  ProvenanceKind,
  KnowledgeNodeType,
  KnowledgeEdgeType,
} from '@/types/knowledgeGraph';

export class PersonalKnowledgeGraphService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async load(): Promise<PersonalKnowledgeGraph> {
    const graph: PersonalKnowledgeGraph = { userId: this.userId, nodes: new Map(), edges: [] };

    const { data: nodes } = await supabase
      .from('user_knowledge_nodes')
      .select('*')
      .eq('user_id', this.userId);

    if (nodes) {
      for (const n of nodes) {
        graph.nodes.set(n.id, {
          id: n.id,
          userId: n.user_id,
          knowledgeNodeId: n.knowledge_node_id || undefined,
          nodeType: n.node_type as KnowledgeNodeType,
          label: n.label,
          state: n.state || {},
          provenance: n.provenance as ProvenanceKind,
          confidence: n.confidence,
          metadata: n.metadata || {},
        });
      }
    }

    const { data: edges } = await supabase
      .from('user_knowledge_edges')
      .select('*')
      .eq('user_id', this.userId);

    if (edges) {
      for (const e of edges) {
        graph.edges.push({
          id: e.id,
          userId: e.user_id,
          sourceId: e.source_node_id,
          targetId: e.target_node_id,
          relationshipType: e.relationship_type as KnowledgeEdgeType,
          confidence: e.confidence,
          provenance: e.provenance as ProvenanceKind,
          metadata: e.metadata || {},
          createdAt: e.created_at,
        });
      }
    }

    return graph;
  }

  async addNode(params: {
    knowledgeNodeId?: string;
    nodeType: KnowledgeNodeType;
    label: string;
    provenance: ProvenanceKind;
    confidence?: number;
    state?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_knowledge_nodes')
      .insert({
        user_id: this.userId,
        knowledge_node_id: params.knowledgeNodeId || null,
        node_type: params.nodeType,
        label: params.label,
        provenance: params.provenance,
        confidence: params.confidence ?? 0.5,
        state: params.state || {},
        metadata: params.metadata || {},
      })
      .select('id')
      .single();

    if (error || !data) return null;
    return data.id;
  }

  async addEdge(params: {
    sourceId: string;
    targetId: string;
    relationshipType: KnowledgeEdgeType;
    provenance: ProvenanceKind;
    confidence?: number;
    metadata?: Record<string, unknown>;
  }): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_knowledge_edges')
      .insert({
        user_id: this.userId,
        source_node_id: params.sourceId,
        target_node_id: params.targetId,
        relationship_type: params.relationshipType,
        provenance: params.provenance,
        confidence: params.confidence ?? 0.5,
        metadata: params.metadata || {},
      })
      .select('id')
      .single();

    if (error || !data) return null;
    return data.id;
  }

  async recordObservation(params: {
    userNodeId?: string;
    knowledgeNodeId?: string;
    observationType: string;
    value: Record<string, unknown>;
    provenance: ProvenanceKind;
    confidence?: number;
  }): Promise<void> {
    await supabase.from('user_knowledge_observations').insert({
      user_id: this.userId,
      user_node_id: params.userNodeId || null,
      knowledge_node_id: params.knowledgeNodeId || null,
      observation_type: params.observationType,
      value: params.value,
      provenance: params.provenance,
      confidence: params.confidence ?? 0.5,
    });
  }

  // In-memory helper: record a reported experience without overwriting history
  recordReportedExperience(graph: PersonalKnowledgeGraph, label: string, knowledgeNodeId?: string): PersonalGraphNode {
    const node: PersonalGraphNode = {
      id: `personal::${this.userId}::${Date.now()}`,
      userId: this.userId,
      knowledgeNodeId,
      nodeType: 'experience',
      label,
      state: { firstObservedAt: new Date().toISOString(), lastObservedAt: new Date().toISOString() },
      provenance: 'reported',
      confidence: 0.6,
      metadata: {},
    };
    graph.nodes.set(node.id, node);
    return node;
  }
}
