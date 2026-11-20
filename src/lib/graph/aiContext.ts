import { getEngine } from '@/lib/graph/engine';
import type { GraphNode } from '@/types/graph';
import { buildGraphContextForQuery, type GraphContext } from '@/lib/graph/contextBuilder';
import type { GraphAnatomyReport } from '@/lib/graph/contextBuilder';
import { getSignGuidance } from '@/lib/graph/signMatcher';

// Re-exported for the graph library barrel (src/lib/graph/index.ts).
export { buildGraphContextForQuery, graphContextToPrompt, type GraphContext } from '@/lib/graph/contextBuilder';
export { buildAnatomyReport, getLoopAnatomy, type GraphAnatomyReport, type ServerGraphContext } from '@/lib/graph/contextBuilder';

const engine = getEngine();

export interface AIPracticeRecommendation {
  practiceId: string;
  practiceLabel: string;
  reason: string;
  confidence: number;
  graphPath: string;
}

export interface AILoopAnalysis {
  loopId: string;
  loopName: string;
  chakra: string;
  dimension: string;
  dissolutionPractices: AIPracticeRecommendation[];
  bandContext: string;
  relatedBridges: string[];
  suggestedGames: string[];
}

export interface AIBandProgression {
  currentBand: number;
  nextBand: number;
  criticalPractices: string[];
  likelyLoops: string[];
  estimatedSessions: number;
  graphPath: string;
}

export interface AICrossPollination {
  currentPractice: string;
  currentLevel: number;
  suggestedPractice: string;
  suggestedLevel: number;
  reason: string;
  graphBasis: string[];
}

export interface GraphGroundedAIResponse {
  analysis: AILoopAnalysis | AIBandProgression | AICrossPollination | null;
  context: GraphContext;
  suggestedPromptEnrichment: string;
}

/** Band-aware stage context: how this band behaves, and what holds it in place. */
export interface AIStageContext {
  band: number;
  archetypeLabel: string;
  coreState: string;
  engineApproach: string;
  behavioralMarkerCount: number;
  likelyLoops: string[];
  granthis: string[];
  kundaliniSigns: Array<{ label: string; safety: string; grounding: string }>;
  pathFits: Array<{ path: string; fit: string; why: string }>;
  bridge: string;
  energyImbalances: string[];
}

/**
 * Build the band-aware context the session director and guide-chat seeds from.
 * Reads stageProfile() — the graph's single answer to "how does a person at
 * this band behave, and what moves them onward."
 */
export function buildStageBandContext(band: number): AIStageContext | null {
  const profile = engine.stageProfile(band);
  if (!profile) return null;

  const archetypeData = profile.archetype.data as { coreState?: string; engineApproach?: string } | undefined;

  const imbalances: string[] = [];
  for (const marker of engine.markersForBand(band)) {
    for (const edge of engine.getEdges(marker.id, undefined, 'MARKER_INDICATES_LOOP')) {
      const loopNode = engine.getNode(edge.to);
      if (!loopNode) continue;
      // Energy markers that mimic this loop hint at an energetic reading
      for (const em of engine.incoming(loopNode.id, ['ENERGY_MARKER_MIMICS_LOOP'])) {
        imbalances.push(em.label);
      }
    }
  }

  return {
    band,
    archetypeLabel: profile.archetype.label,
    coreState: archetypeData?.coreState ?? '',
    engineApproach: archetypeData?.engineApproach ?? '',
    behavioralMarkerCount: profile.markerCount - profile.maturityCount,
    likelyLoops: profile.loops.slice(0, 8).map(l => l.loop.label),
    granthis: profile.granthis.map(g => g.label),
    kundaliniSigns: profile.kundaliniSigns.slice(0, 6).map(s => ({
      label: s.label,
      safety: (s.data as { safety?: string }).safety ?? 'normal',
      grounding: (s.data as { grounding?: string }).grounding ?? '',
    })),
    pathFits: profile.paths.map(p => ({ path: p.path.label, fit: p.fit, why: p.why })),
    bridge: profile.bridge ?? '',
    energyImbalances: Array.from(new Set(imbalances)).slice(0, 5),
  };
}

/**
 * Describe a user-reported sensation for an AI caller. Deliberately framed as
 * "the tradition names this X, here is the grounding protocol" — never a
 * diagnosis, never a diagnosis-shaped sentence.
 */
export function describeReportedSign(report: string): string {
  const guidance = getSignGuidance(report);

  if (!guidance.match) {
    return `The user reports: "${report}". The knowledge graph does not recognise this as a known kundalini sign. Respond with grounding care and do not label it as a spiritual attainment.`;
  }

  const { sign } = guidance.match;
  return [
    `The user reports a sensation the graph recognises as "${sign.label}" (${sign.tradition}).`,
    `Body center: ${sign.chakra}. Common at bands ${sign.surfacesInBands.join(', ')}.`,
    `Safety tier: ${sign.safety}.`,
    `Grounding protocol to offer: ${sign.grounding}.`,
    guidance.escalate
      ? 'This is a stop-and-support case: advise stopping the practice and seeking support outside the app.'
      : 'Frame it as a known, survivable sign — never as progress to chase.',
  ].join(' ');
}

function formatGraphPath(path: string[]): string {
  if (path.length === 0) return '';
  const labels = path.map(id => {
    const node = engine.getNode(id);
    return node?.label || id.split('::').pop() || id;
  });
  return labels.join(' → ');
}

export function analyzeLoopWithGraph(loopId: string): AILoopAnalysis | null {
  const report = engine.fullAnatomy(`loop::${loopId}`);
  const loopNode = engine.getNode(`loop::${loopId}`);
  if (!loopNode) return null;

  const chakras = engine.outgoing(`loop::${loopId}`, ['LOOP_RELATED_TO_CHAKRA']);
  const dimensions = engine.outgoing(`loop::${loopId}`, ['LOOP_RELATED_TO_DIMENSION']);
  const dissolutionPractices = engine.outgoing(`loop::${loopId}`, ['LOOP_DISSOLVES_VIA']);
  const bands = engine.incoming(`loop::${loopId}`, ['BAND_COMMON_LOOP']);
  const bridges = engine.bridgesForNode(`loop::${loopId}`);

  const dissolutionRecs: AIPracticeRecommendation[] = dissolutionPractices.map(p => {
    const path = engine.path(`loop::${loopId}`, p.id);
    return {
      practiceId: p.id,
      practiceLabel: p.label,
      reason: `Dissolves ${loopNode.label} via ${p.label}`,
      confidence: p.id.includes('observation') ? 0.9 : 0.7,
      graphPath: formatGraphPath(path[0] ?? []),
    };
  });

  return {
    loopId,
    loopName: loopNode.label,
    chakra: chakras[0]?.label || 'Unknown',
    dimension: dimensions[0]?.label || 'Unknown',
    dissolutionPractices: dissolutionRecs,
    bandContext: bands.length > 0 ? `Common at ${bands.map(b => b.label).join(', ')}` : 'Not tied to specific band',
    relatedBridges: bridges.map(b => b.label),
    suggestedGames: [],
  };
}

export function analyzeBandProgression(currentBand: number): AIBandProgression | null {
  const bandNode = engine.getNode(`band::${currentBand}`);
  if (!bandNode) return null;

  const loops = engine.outgoing(`band::${currentBand}`, ['BAND_COMMON_LOOP']);
  const practices = new Map<string, { node: GraphNode; count: number }>();

  for (const loop of loops) {
    const dissolutions = engine.outgoing(loop.id, ['LOOP_DISSOLVES_VIA']);
    for (const p of dissolutions) {
      practices.set(p.id, { node: p, count: (practices.get(p.id)?.count || 0) + 1 });
    }
  }

  const criticalPractices = Array.from(practices.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(p => p.node.label);

  const likelyLoops = loops.slice(0, 5).map(l => l.label);
  const estimatedSessions = Math.max(3, loops.length * 2);

  const nextBand = Math.min(currentBand + 1, 10);
  const path = engine.path(`band::${currentBand}`, `band::${nextBand}`);

  return {
    currentBand,
    nextBand,
    criticalPractices,
    likelyLoops,
    estimatedSessions,
    graphPath: formatGraphPath(path[0] ?? []),
  };
}

export function suggestCrossPollination(practiceId: string, currentLevel: number): AICrossPollination | null {
  const practiceNode = engine.getNode(`practice::${practiceId}`);
  if (!practiceNode) return null;

  const crossPollinationEdges = engine.getEdges(undefined, undefined, 'CROSS_POLLINATION_ROUTE');
  const relevantEdges = crossPollinationEdges.filter(
    e => e.from === `practice::${practiceId}` && e.metadata?.fromLevel && currentLevel >= e.metadata.fromLevel
  );

  if (relevantEdges.length === 0) return null;

  const bestEdge = relevantEdges[0];
  const targetNode = engine.getNode(bestEdge.to);
  if (!targetNode) return null;

  const path = engine.path(`practice::${practiceId}`, targetNode.id);

  return {
    currentPractice: practiceId,
    currentLevel,
    suggestedPractice: targetNode.id,
    suggestedLevel: bestEdge.metadata?.toLevel || 1,
    reason: bestEdge.metadata?.reason || 'Cross-pollination route',
    graphBasis: path[0] ?? [],
  };
}

export function buildEnrichedAIPrompt(userQuery: string, band?: number): {
  systemPrompt: string;
  context: GraphContext;
  analysis: Record<string, AILoopAnalysis | null>;
  stageContext: AIStageContext | null;
  signGuidance?: string;
} {
  const context = buildGraphContextForQuery(userQuery);

  const relevantNodes = engine.search(userQuery).slice(0, 5);
  const analysis: Record<string, AILoopAnalysis | null> = {};

  for (const node of relevantNodes) {
    if (node.type === 'loop') {
      const loopId = node.id.replace('loop::', '');
      analysis[loopId] = analyzeLoopWithGraph(loopId);
    }
  }

  const stageContext = band !== undefined ? buildStageBandContext(band) : null;
  // If the user is describing a sensation, attach the safe-sign framing.
  const sensationHint = /feel|felt|sensat|heat|tingl|movement|shak|tremor|pressure|cried|bliss|unreal|breath/i.test(userQuery)
    ? describeReportedSign(userQuery)
    : undefined;

  const systemPrompt = buildSystemPrompt(context, analysis, stageContext, sensationHint);

  return { systemPrompt, context, analysis, stageContext, signGuidance: sensationHint };
}

function buildSystemPrompt(
  context: GraphContext,
  analysis: Record<string, AILoopAnalysis | null>,
  stageContext?: AIStageContext | null,
  sensationHint?: string
): string {
  const parts: string[] = [];

  parts.push('You are a consciousness guide with access to a comprehensive knowledge graph of human development.');
  parts.push('Your responses should be grounded in the following graph context:\n');

  if (context.relevantNodes.length > 0) {
    parts.push(`RELEVANT CONCEPTS (${context.relevantNodes.length}):`);
    for (const { node } of context.relevantNodes.slice(0, 5)) {
      parts.push(`  - ${node.label} (${node.type}): ${node.uri}`);
    }
  }

  if (stageContext) {
    parts.push(`\nUSER STAGE CONTEXT (band ${stageContext.band} — ${stageContext.archetypeLabel}):`);
    parts.push(`  Core state: "${stageContext.coreState}"`);
    parts.push(`  Engine approach: ${stageContext.engineApproach}`);
    if (stageContext.likelyLoops.length > 0) {
      parts.push(`  Loops this band typically runs: ${stageContext.likelyLoops.join(', ')}`);
    }
    if (stageContext.granthis.length > 0) {
      parts.push(`  Psychic knots holding this band: ${stageContext.granthis.join(', ')}`);
    }
    if (stageContext.pathFits.length > 0) {
      parts.push(`  Yoga paths that fit: ${stageContext.pathFits.map(p => `${p.path} (${p.fit})`).join(', ')}`);
    }
    if (stageContext.energyImbalances.length > 0) {
      parts.push(`  Possible energy readings (prana/nadi): ${stageContext.energyImbalances.join(', ')}`);
    }
    parts.push('  NEVER cite the band number to the user; speak to the experience it names.');
  }

  if (context.suggestedPractices.length > 0) {
    parts.push('\nSUGGESTED PRACTICES:');
    for (const p of context.suggestedPractices.slice(0, 3)) {
      parts.push(`  - ${p.label}`);
    }
  }

  if (context.relatedBridges.length > 0) {
    parts.push('\nSCIENCE↔ANCIENT BRIDGES:');
    for (const b of context.relatedBridges.slice(0, 2)) {
      parts.push(`  - ${b.label}`);
    }
  }

  if (sensationHint) {
    parts.push('\nREPORTED SENSATION (safety layer):');
    parts.push(`  ${sensationHint}`);
  }

  parts.push('\nUse this graph context to provide precise, personalized guidance.');
  parts.push('Always explain the reasoning: which loop, which chakra, which practice, and why.');
  parts.push('Cite lineage sources when relevant (Patanjali, Buddha, Ramana, etc.).');
  parts.push('Be compassionate, non-judgmental, and precise.');

  return parts.join('\n');
}

export function getGraphStatsForUI() {
  return engine.getStats();
}
