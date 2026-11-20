import { getEngine } from '@/lib/graph/engine';
import { PRACTICES, type Practice } from './practices';

const engine = getEngine();

export interface GraphPracticeScore {
  practice: Practice;
  score: number;
  reasons: string[];
  graphPath?: string;
}

export function scorePracticesWithGraph(params: {
  activeLoops: string[];
  stressedDomains: string[];
  userBand?: number;
  constellationWeights: Record<Practice, number>;
}): GraphPracticeScore[] {
  const { activeLoops, stressedDomains, userBand, constellationWeights } = params;
  const scores = new Map<Practice, { score: number; reasons: string[]; paths: string[] }>();

  for (const p of PRACTICES) {
    scores.set(p, { score: constellationWeights[p] || 0.08, reasons: [], paths: [] });
  }

  // 1. Loop dissolution boost
  for (const loopId of activeLoops) {
    const loopNode = engine.getNode(`loop::${loopId}`);
    if (!loopNode) continue;

    const dissolutionPractices = engine.outgoing(`loop::${loopId}`, ['LOOP_DISSOLVES_VIA']);
    for (const pNode of dissolutionPractices) {
      const p = pNode.id.replace('practice::', '') as Practice;
      if (!scores.has(p)) continue;
      const entry = scores.get(p)!;
      entry.score += 0.35;
      entry.reasons.push(`Dissolves ${loopNode.label}`);
      entry.paths.push(`loop::${loopId} → ${pNode.id}`);
    }

    const relatedChakras = engine.outgoing(`loop::${loopId}`, ['LOOP_RELATED_TO_CHAKRA']);
    const relatedDims = engine.outgoing(`loop::${loopId}`, ['LOOP_RELATED_TO_DIMENSION']);
    if (relatedChakras.length > 0 || relatedDims.length > 0) {
      const chakraLabel = relatedChakras[0]?.label || 'unknown';
      const dimLabel = relatedDims[0]?.label || 'unknown';
      for (const pNode of dissolutionPractices) {
        const p = pNode.id.replace('practice::', '') as Practice;
        if (!scores.has(p)) continue;
        const entry = scores.get(p)!;
        entry.reasons.push(`Related to ${chakraLabel} chakra, ${dimLabel} dimension`);
      }
    }
  }

  // 2. Stressed domain boost
  for (const domain of stressedDomains) {
    const domainNode = engine.getNode(`task-domain::${domain}`);
    if (!domainNode) continue;

    const domainLoops = engine.incoming(domainNode.id, ['LOOP_TRIGGERS_IN_DOMAIN', 'LOOP_MANIFESTS_IN_SITUATION']);
    for (const loopNode of domainLoops) {
      const dissolutionPractices = engine.outgoing(loopNode.id, ['LOOP_DISSOLVES_VIA']);
      for (const pNode of dissolutionPractices) {
        const p = pNode.id.replace('practice::', '') as Practice;
        if (!scores.has(p)) continue;
        const entry = scores.get(p)!;
        entry.score += 0.2;
        entry.reasons.push(`Helps with ${domainNode.label} stress via ${loopNode.label}`);
      }
    }

    const domainPractices = engine.incoming(domainNode.id, ['SUTRA_MODE_USES_PRACTICE']);
    for (const pNode of domainPractices) {
      const p = pNode.id.replace('practice::', '') as Practice;
      if (!scores.has(p)) continue;
      const entry = scores.get(p)!;
      entry.score += 0.15;
      entry.reasons.push(`Serves ${domainNode.label} domain`);
    }
  }

  // 3. Band-specific boost
  if (userBand !== undefined) {
    const bandNode = engine.getNode(`band::${userBand}`);
    if (bandNode) {
      const bandLoops = engine.outgoing(bandNode.id, ['BAND_COMMON_LOOP']);
      for (const loopNode of bandLoops) {
        const dissolutionPractices = engine.outgoing(loopNode.id, ['LOOP_DISSOLVES_VIA']);
        for (const pNode of dissolutionPractices) {
          const p = pNode.id.replace('practice::', '') as Practice;
          if (!scores.has(p)) continue;
          const entry = scores.get(p)!;
          entry.score += 0.1;
          entry.reasons.push(`Common at ${bandNode.label}`);
        }
      }
    }
  }

  // 4. Cross-pollination boost (when a practice is already strong, suggest complementary)
  const topPractice = Array.from(scores.entries()).sort((a, b) => b[1].score - a[1].score)[0];
  if (topPractice && topPractice[1].score > 0.5) {
    const crossPollinationEdges = engine.getEdges(undefined, undefined, 'CROSS_POLLINATION_ROUTE');
    const relevantEdges = crossPollinationEdges.filter(e => e.from === `practice::${topPractice[0]}`);
    for (const edge of relevantEdges) {
      const targetId = edge.to.replace('practice::', '');
      const targetPractice = PRACTICES.find(p => p === targetId);
      if (targetPractice && scores.has(targetPractice)) {
        const entry = scores.get(targetPractice)!;
        entry.score += 0.15;
        entry.reasons.push(`Cross-pollination from ${topPractice[0]}: ${edge.metadata?.reason || 'complementary practice'}`);
      }
    }
  }

  return Array.from(scores.entries())
    .map(([practice, data]) => ({
      practice,
      score: data.score,
      reasons: data.reasons,
      graphPath: data.paths[0],
    }))
    .sort((a, b) => b.score - a.score);
}

export function pickPracticeWithGraph(params: {
  activeLoops: string[];
  stressedDomains: string[];
  userBand?: number;
  constellationWeights: Record<Practice, number>;
}): { practice: Practice; reason: string; graphPath: string } | null {
  const scored = scorePracticesWithGraph(params);
  if (scored.length === 0) return null;

  const top = scored[0];
  return {
    practice: top.practice,
    reason: top.reasons.length > 0 ? top.reasons[0] : 'Highest graph score',
    graphPath: top.graphPath || '',
  };
}

export function getObservationTailForPractice(practice: Practice): string {
  const tails: Partial<Record<Practice, string>> = {
    observe: "Notice what shifted in the last minute.",
    inquiry: "Who was asking that question?",
    bhakti: "What remains in the heart now?",
    witness: "Stay with the silence a moment longer.",
    karma: "Notice the doer — and what is beyond them.",
    breath: "Feel the breath that came uninvited.",
    body: "Where in the body is the practice still living?",
    jnana: "What understood that teaching?",
    raja: "Notice the discipline holding itself.",
    tantra: "Where is the energy now resting?",
    neuro: "Watch the next thought arise.",
    kriya: "Feel the cleared space.",
  };
  return tails[practice] || "Notice what is here, just now.";
}
