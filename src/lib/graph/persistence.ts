import { supabase } from '@/lib/supabase';
import type { GraphNode, GraphEdge, ConsciousnessGraph } from '@/types/graph';

export interface GraphPersistenceOptions {
  userId?: string;
}

export class GraphPersistence {
  private userId?: string;

  constructor(opts: GraphPersistenceOptions = {}) {
    this.userId = opts.userId;
  }

  async loadGraph(): Promise<ConsciousnessGraph | null> {
    const { data: nodes, error: nodeError } = await supabase
      .from('graph_nodes')
      .select('*');

    if (nodeError || !nodes || nodes.length === 0) {
      return null;
    }

    const { data: edges, error: edgeError } = await supabase
      .from('graph_edges')
      .select('*');

    if (edgeError || !edges) {
      return null;
    }

    const graph: ConsciousnessGraph = {
      nodes: new Map(
        nodes.map((n) => [
          n.id,
          {
            id: n.id,
            type: n.type as GraphNode['type'],
            label: n.label,
            uri: n.uri,
            data: n.data,
            aliases: n.aliases || [],
          },
        ])
      ),
      edges: edges.map((e) => ({
        id: e.id,
        type: e.type as GraphEdge['type'],
        from: e.from,
        to: e.to,
        weight: e.weight,
        metadata: e.metadata || {},
      })),
      adjacency: new Map(),
    };

    for (const edge of graph.edges) {
      const list = graph.adjacency!.get(edge.from) || [];
      list.push(edge.to);
      graph.adjacency!.set(edge.from, list);
    }

    return graph;
  }

  async saveGraph(graph: ConsciousnessGraph): Promise<void> {
    const nodeRows = Array.from(graph.nodes.values()).map((n) => ({
      id: n.id,
      type: n.type,
      label: n.label,
      uri: n.uri,
      data: n.data,
      aliases: n.aliases,
      updated_at: new Date().toISOString(),
    }));

    const { error: nodeError } = await supabase
      .from('graph_nodes')
      .upsert(nodeRows, { onConflict: 'id' });

    if (nodeError) {
      throw new Error(`Failed to save graph nodes: ${nodeError.message}`);
    }

    const edgeRows = graph.edges.map((e) => ({
      id: e.id,
      type: e.type,
      from: e.from,
      to: e.to,
      weight: e.weight,
      metadata: e.metadata || {},
    }));

    const { error: edgeError } = await supabase
      .from('graph_edges')
      .upsert(edgeRows, { onConflict: 'id' });

    if (edgeError) {
      throw new Error(`Failed to save graph edges: ${edgeError.message}`);
    }
  }

  async addUserOverlay(params: {
    overlayType: string;
    nodeId?: string;
    edgeId?: string;
    weight?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    if (!this.userId) return;

    const { error } = await supabase
      .from('user_graph_overlay')
      .insert({
        user_id: this.userId,
        overlay_type: params.overlayType,
        node_id: params.nodeId,
        edge_id: params.edgeId,
        weight: params.weight ?? 1.0,
        metadata: params.metadata || {},
      });

    if (error) {
      throw new Error(`Failed to add user overlay: ${error.message}`);
    }
  }

  async loadUserOverlay(): Promise<
    Array<{
      id: string;
      overlayType: string;
      nodeId?: string;
      edgeId?: string;
      weight: number;
      metadata: Record<string, any>;
    }>
  > {
    if (!this.userId) return [];

    const { data, error } = await supabase
      .from('user_graph_overlay')
      .select('*')
      .eq('user_id', this.userId);

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      overlayType: row.overlay_type,
      nodeId: row.node_id,
      edgeId: row.edge_id,
      weight: row.weight,
      metadata: row.metadata || {},
    }));
  }

  async recordLoopDissolution(params: {
    loopId: string;
    practiceId: string;
    confidence: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.addUserOverlay({
      overlayType: 'LOOP_DISSOLVED_BY_PRACTICE',
      nodeId: params.loopId,
      weight: params.confidence,
      metadata: {
        practiceId: params.practiceId,
        dissolvedAt: new Date().toISOString(),
        ...params.metadata,
      },
    });
  }

  async recordPracticeCompletion(params: {
    practiceId: string;
    quality: number;
    durationSec: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.addUserOverlay({
      overlayType: 'USER_COMPLETED_PRACTICE',
      nodeId: params.practiceId,
      weight: params.quality,
      metadata: {
        durationSec: params.durationSec,
        completedAt: new Date().toISOString(),
        ...params.metadata,
      },
    });
  }
}
