export type GraphNodeId = string;

export type NodeType =
  | 'loop'
  | 'loop-family'
  | 'loop-essay'
  | 'practice'
  | 'practice-level'
  | 'band'
  | 'band-stage'
  | 'dimension'
  | 'chakra'
  | 'kosha'
  | 'prana'
  | 'nadi'
  | 'skill'
  | 'skill-level'
  | 'path'
  | 'path-level'
  | 'bridge'
  | 'task-domain'
  | 'course-day'
  | 'course-phase'
  | 'observation-level'
  | 'energy-body'
  | 'game'
  | 'program'
  | 'knowledge-card'
  | 'wisdom-card'
  | 'micro-practice'
  | 'sensorial-practice'
  | 'sutra-mode'
  | 'sutra-practice'
  | 'concept'
  | 'breakthrough'
  | 'guru'
  | 'lineage'
  | 'signal'
  | 'behavior-marker'
  | 'granthi'
  | 'kundalini-sign'
  | 'energy-marker';

export type EdgeType =
  | 'LOOP_BELONGS_TO_FAMILY'
  | 'LOOP_RELATED_TO_CHAKRA'
  | 'LOOP_RELATED_TO_DIMENSION'
  | 'LOOP_DISSOLVES_VIA'
  | 'LOOP_MANIFESTS_IN_SITUATION'
  | 'LOOP_TRIGGERS_IN_DOMAIN'
  | 'LOOP_HAS_ESSAY'
  | 'LOOP_COMMON_IN_BAND'
  | 'LOOP_RELATED_TO_PRACTICE'
  | 'PRACTICE_IMPACTS_DIMENSION'
  | 'PRACTICE_PAIRS_WITH'
  | 'PRACTICE_HAS_LEVEL'
  | 'PRACTICE_BELONGS_TO_PATH'
  | 'PRACTICE_TARGETS_CHAKRA'
  | 'PRACTICE_DEVELOPS_OBSERVATION'
  | 'BAND_HAS_STAGE'
  | 'BAND_COMMON_LOOP'
  | 'BAND_ADVANCES_TO'
  | 'DIMENSION_MOVED_BY_SKILL'
  | 'DIMENSION_CATEGORY_OF'
  | 'DIMENSION_IMPACTED_BY_PRACTICE'
  | 'CHAKRA_HAS_KOSHA'
  | 'CHAKRA_GOVERS_PRANA'
  | 'CHAKRA_RELATED_TO_DIMENSION'
  | 'CONCEPT_MENTIONED_IN_DAY'
  | 'CONCEPT_APPEARS_IN_BRIDGE'
  | 'GAME_TEACHES_CONCEPT'
  | 'PROGRAM_CONTAINS_DAY'
  | 'OBSERVATION_REVEALS_LOOP'
  | 'ENERGY_BODY_COMPONENT_OF'
  | 'SUTRA_MODE_USES_PRACTICE'
  | 'CROSS_POLLINATION_ROUTE'
  | 'DOMAIN_STRESSED_BY_LOOP'
  | 'LOOP_DISSOLVED_BY_GAME'
  | 'KOSHA_LAYER_OF'
  | 'PRANA_FLOWS_THROUGH'
  | 'NADI_BALANCES_PRANA'
  | 'GURU_TEACHES_PRACTICE'
  | 'GURU_IN_LINEAGE'
  | 'GURU_CONNECTED_TO_LOOP'
  | 'BREAKTHROUGH_TRIGGERS_LOOP'
  | 'BREAKTHROUGH_CATEGORY_OF'
  | 'WISDOM_CARD_THEME'
  | 'SIGNAL_INDICATES_LOOP'
  | 'SIGNAL_TYPE_OF'
  | 'ENERGY_BODY_LAYER_OF'
  // ─── Stage-behavior knowledge graph ───
  | 'BAND_EXHIBITS_MARKER'
  | 'MARKER_IN_DIMENSION'
  | 'MARKER_IN_CHAKRA'
  | 'MARKER_INDICATES_LOOP'
  | 'BAND_FITS_PATH'
  | 'BAND_ADVANCES_TO'
  // ─── Granthis (psychic knots) ───
  | 'BAND_BLOCKED_BY_GRANTHI'
  | 'GRANTHI_AT_CHAKRA'
  | 'GRANTHI_TIGHTENS_LOOP_FAMILY'
  | 'GRANTHI_DISSOLVED_BY_PRACTICE'
  // ─── Kundalini signs ───
  | 'BAND_MAY_SHOW_SIGN'
  | 'KUNDALINI_SIGN_AT_CHAKRA'
  | 'KUNDALINI_SIGN_IN_DIMENSION'
  | 'KUNDALINI_SIGN_MIMICS_LOOP'
  // ─── Energy markers (prana / nadi dominance) ───
  | 'ENERGY_CHANNEL_EXHIBITS_MARKER'
  | 'ENERGY_MARKER_IN_DIMENSION'
  | 'ENERGY_MARKER_MIMICS_LOOP'
  | 'ENERGY_MARKER_BALANCED_BY_PRACTICE';

export interface GraphNode {
  id: GraphNodeId;
  type: NodeType;
  label: string;
  uri: string;
  data: Record<string, any>;
  aliases: string[];
}

export interface GraphEdge {
  id: string;
  type: EdgeType;
  from: GraphNodeId;
  to: GraphNodeId;
  weight?: number;
  metadata?: Record<string, any>;
}

export interface ConsciousnessGraph {
  nodes: Map<GraphNodeId, GraphNode>;
  edges: GraphEdge[];
  /** Optional id -> neighbor-id index used by persistence loaders. */
  adjacency?: Map<GraphNodeId, GraphNodeId[]>;
}

export type GraphTraversalDirection = 'outgoing' | 'incoming' | 'both';
