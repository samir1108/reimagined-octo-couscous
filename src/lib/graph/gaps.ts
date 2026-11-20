/**
 * Graph Gap Report — what the knowledge graph knows it does not know.
 * ──────────────────────────────────────────────────────────────────
 * A knowledge graph is only trustworthy if it can name its own holes. This
 * module audits the graph after build and reports, in priority order:
 *
 *   • bands with no behavioral markers (the 8–10 "beyond app scope" bands)
 *   • markers whose classification was too weak to link any loop
 *   • markers with low classification confidence (curation backlog)
 *   • loops no band claims, loops with no chakra/dimension/dissolution path
 *   • energy nodes (granthis, kundalini signs) missing anatomy links
 *
 * Run from tests; extend to a nightly script when the authoring backlog moves.
 */

import type { GraphNode, GraphEdge } from '@/types/graph';

export type GapKind =
  | 'band-without-markers'
  | 'marker-without-loops'
  | 'marker-low-confidence'
  | 'loop-without-band'
  | 'loop-without-dissolution'
  | 'loop-without-chakra'
  | 'loop-without-dimension'
  | 'granthi-without-practice'
  | 'sign-without-chakra';

export interface GraphGap {
  kind: GapKind;
  count: number;
  samples: string[];
  message: string;
  suggestion: string;
}

export function findGraphGaps(nodes: Map<string, GraphNode>, edges: GraphEdge[]): GraphGap[] {
  const gaps: GraphGap[] = [];

  const markers = Array.from(nodes.values()).filter(n => n.type === 'behavior-marker');
  const bands = Array.from(nodes.values()).filter(n => n.type === 'band' && n.id.startsWith('band::'));
  const loops = Array.from(nodes.values()).filter(n => n.type === 'loop');

  const edgesFrom = (id: string, type: string) => edges.filter(e => e.from === id && e.type === type);

  // 1. Bands with zero markers (bands 8–10 are "beyond app scope" by design)
  const bandsWithoutMarkers = bands.filter(b => edgesFrom(b.id, 'BAND_EXHIBITS_MARKER').length === 0);
  if (bandsWithoutMarkers.length > 0) {
    gaps.push({
      kind: 'band-without-markers',
      count: bandsWithoutMarkers.length,
      samples: bandsWithoutMarkers.map(b => `${b.label} (${b.id})`),
      message: `${bandsWithoutMarkers.length} bands have no behavioral markers in the graph.`,
      suggestion:
        'Bands 8–10 are beyond app scope per consciousness.ts — but if content is ever authored for them, extend stageHandbook.ts and everything below wires automatically.',
    });
  }

  // 2. Behavioral markers the classifier could not attach to any loop
  // (maturity markers intentionally carry no loop edges — they are capacity
  // signatures, not dysfunction signatures)
  const markersWithoutLoops = markers.filter(
    m => m.data?.polarity !== 'maturity' && edgesFrom(m.id, 'MARKER_INDICATES_LOOP').length === 0
  );
  if (markersWithoutLoops.length > 0) {
    gaps.push({
      kind: 'marker-without-loops',
      count: markersWithoutLoops.length,
      samples: markersWithoutLoops.slice(0, 8).map(m => `"${m.label}"`),
      message: `${markersWithoutLoops.length} behavioral stage markers have no loop candidates.`,
      suggestion: 'Add MARKER_OVERRIDES entries in src/data/graph/behaviorMap.ts or author new loops for the uncovered behaviors.',
    });
  }

  // 3. Low-confidence classifications (curation backlog, weakest first)
  const lowConfidence = markers
    .filter(m => m.data?.polarity !== 'maturity' && (m.data?.confidence ?? 1) < 0.4)
    .sort((a, b) => (a.data?.confidence ?? 0) - (b.data?.confidence ?? 0));
  if (lowConfidence.length > 0) {
    gaps.push({
      kind: 'marker-low-confidence',
      count: lowConfidence.length,
      samples: lowConfidence.slice(0, 8).map(m => `"${m.label}" (${(m.data?.confidence ?? 0).toFixed(2)})`),
      message: `${lowConfidence.length} behavioral markers classified with confidence < 0.40.`,
      suggestion: 'Hand-verify these into MARKER_OVERRIDES so their dimension/chakra/loop edges carry curated provenance.',
    });
  }

  // 4. Loops no band claims
  const claimedLoops = new Set(edges.filter(e => e.type === 'BAND_COMMON_LOOP' || e.type === 'MARKER_INDICATES_LOOP').map(e => e.to));
  const orphanLoops = loops.filter(l => !claimedLoops.has(l.id));
  if (orphanLoops.length > 0) {
    gaps.push({
      kind: 'loop-without-band',
      count: orphanLoops.length,
      samples: orphanLoops.slice(0, 5).map(l => `${l.label} (${l.id})`),
      message: `${orphanLoops.length} of ${loops.length} loops are not claimed by any band or marker.`,
      suggestion: 'Extend BAND_GUIDEBOOK.commonLoops or add marker overrides so band→loop coverage grows.',
    });
  }

  // 5. Loops with no dissolution practice wired
  const loopsWithoutDissolution = loops.filter(l => edgesFrom(l.id, 'LOOP_DISSOLVES_VIA').length === 0);
  if (loopsWithoutDissolution.length > 0) {
    gaps.push({
      kind: 'loop-without-dissolution',
      count: loopsWithoutDissolution.length,
      samples: loopsWithoutDissolution.slice(0, 5).map(l => `${l.label} (${l.id})`),
      message: `${loopsWithoutDissolution.length} loops have no dissolution practice edge.`,
      suggestion: 'A loop without a way out is a dead end for the user — map each to a practice in edges.ts.',
    });
  }

  // 6. Loops with no chakra / dimension attribution
  const loopsWithoutChakra = loops.filter(l => edgesFrom(l.id, 'LOOP_RELATED_TO_CHAKRA').length === 0);
  if (loopsWithoutChakra.length > 0) {
    gaps.push({
      kind: 'loop-without-chakra',
      count: loopsWithoutChakra.length,
      samples: loopsWithoutChakra.slice(0, 5).map(l => `${l.label} (${l.id})`),
      message: `${loopsWithoutChakra.length} loops have no chakra attribution.`,
      suggestion: 'Set related_chakra in src/data/loops.ts — the ki/energy layer keys off it.',
    });
  }

  const loopsWithoutDimension = loops.filter(l => edgesFrom(l.id, 'LOOP_RELATED_TO_DIMENSION').length === 0);
  if (loopsWithoutDimension.length > 0) {
    gaps.push({
      kind: 'loop-without-dimension',
      count: loopsWithoutDimension.length,
      samples: loopsWithoutDimension.slice(0, 5).map(l => `${l.label} (${l.id})`),
      message: `${loopsWithoutDimension.length} loops have no dimension attribution.`,
      suggestion: 'Set related_dimension in src/data/loops.ts.',
    });
  }

  // 7. Energy nodes missing anatomy links
  const granthis = Array.from(nodes.values()).filter(n => n.type === 'granthi');
  const granthisWithoutPractice = granthis.filter(g => edgesFrom(g.id, 'GRANTHI_DISSOLVED_BY_PRACTICE').length === 0);
  if (granthisWithoutPractice.length > 0) {
    gaps.push({
      kind: 'granthi-without-practice',
      count: granthisWithoutPractice.length,
      samples: granthisWithoutPractice.map(g => g.label),
      message: `${granthisWithoutPractice.length} granthis have no dissolution practice wired.`,
      suggestion: 'Every knot needs a way out — extend dissolvedBy in src/data/granthis.ts.',
    });
  }

  const signs = Array.from(nodes.values()).filter(n => n.type === 'kundalini-sign');
  const signsWithoutChakra = signs.filter(s => edgesFrom(s.id, 'KUNDALINI_SIGN_AT_CHAKRA').length === 0);
  if (signsWithoutChakra.length > 0) {
    gaps.push({
      kind: 'sign-without-chakra',
      count: signsWithoutChakra.length,
      samples: signsWithoutChakra.map(s => s.label),
      message: `${signsWithoutChakra.length} kundalini signs have no body-center link.`,
      suggestion: 'Set chakra to a valid chakra/nadi/kosha id in src/data/kundaliniSigns.ts.',
    });
  }

  return gaps;
}
