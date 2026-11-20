// Server-side graph context builder for Supabase edge functions
// This module provides graph-grounded context for AI responses in edge functions

export interface ServerGraphContext {
  query: string;
  relevantNodes: Array<{ id: string; label: string; type: string }>;
  relevantEdges: Array<{ type: string; from: string; to: string }>;
  suggestedPractices: Array<{ id: string; label: string; confidence: number }>;
  relatedBridges: Array<{ id: string; label: string; modern: string; ancient: string }>;
  loopAnalysis: {
    loopId: string;
    loopName: string;
    chakra: string;
    dimension: string;
    dissolutionPractices: Array<{ id: string; label: string; reason: string }>;
    bandContext: string;
  } | null;
  bandProgression: {
    currentBand: number;
    nextBand: number;
    criticalPractices: string[];
    likelyLoops: string[];
    estimatedSessions: number;
  } | null;
}

export async function buildServerGraphContext(query: string): Promise<ServerGraphContext> {
  // Dynamic import to avoid loading graph in environments that don't need it
  const { getEngine } = await import('@/lib/graph/engine');
  const { analyzeLoopWithGraph, analyzeBandProgression } = await import('@/lib/graph/aiContext');

  const engine = getEngine();
  const relevantNodes = engine.search(query).slice(0, 10);
  const relevantEdges: ServerGraphContext['relevantEdges'] = [];
  const suggestedPractices: ServerGraphContext['suggestedPractices'] = [];
  const relatedBridges: ServerGraphContext['relatedBridges'] = [];
  let loopAnalysis: ServerGraphContext['loopAnalysis'] = null;
  let bandProgression: ServerGraphContext['bandProgression'] = null;

  // Build edges around relevant nodes
  for (const node of relevantNodes) {
    const outgoing = engine.getEdges(node.id);
    const incoming = engine.getEdges(undefined, node.id);
    
    for (const edge of [...outgoing, ...incoming].slice(0, 20)) {
      relevantEdges.push({
        type: edge.type,
        from: edge.from,
        to: edge.to,
      });
    }

    if (node.type === 'loop') {
      const practices = engine.outgoing(node.id, ['LOOP_DISSOLVES_VIA']);
      for (const p of practices) {
        suggestedPractices.push({
          id: p.id,
          label: p.label,
          confidence: 0.7,
        });
      }

      const bridges = engine.bridgesForNode(node.id);
      for (const b of bridges) {
        const bridgeData = b.data as { modern: string; ancient: string };
        relatedBridges.push({
          id: b.id,
          label: b.label,
          modern: bridgeData.modern,
          ancient: bridgeData.ancient,
        });
      }

      const loopId = node.id.replace('loop::', '');
      const analysis = analyzeLoopWithGraph(loopId);
      if (analysis) {
        loopAnalysis = {
          loopId: analysis.loopId,
          loopName: analysis.loopName,
          chakra: analysis.chakra,
          dimension: analysis.dimension,
          dissolutionPractices: analysis.dissolutionPractices.map(p => ({
            id: p.practiceId,
            label: p.practiceLabel,
            reason: p.reason,
          })),
          bandContext: analysis.bandContext,
        };
      }
    }
  }

  // Check if query mentions a band number
  const bandMatch = query.match(/\b(band\s*)?(\d+)\b/i);
  if (bandMatch) {
    const bandNum = parseInt(bandMatch[2]);
    if (bandNum >= 0 && bandNum <= 10) {
      bandProgression = analyzeBandProgression(bandNum);
    }
  }

  return {
    query,
    relevantNodes: relevantNodes.map(n => ({ id: n.id, label: n.label, type: n.type })),
    relevantEdges: relevantEdges.slice(0, 50),
    suggestedPractices: [...new Map(suggestedPractices.map(p => [p.id, p])).values()],
    relatedBridges: [...new Map(relatedBridges.map(b => [b.id, b])).values()],
    loopAnalysis,
    bandProgression,
  };
}

export function graphContextToPrompt(context: ServerGraphContext): string {
  const parts: string[] = [];

  parts.push('## Consciousness Graph Context');
  parts.push(`Query: "${context.query}"\n`);

  if (context.loopAnalysis) {
    parts.push('### Loop Analysis');
    parts.push(`Loop: ${context.loopAnalysis.loopName} (${context.loopAnalysis.loopId})`);
    parts.push(`Chakra: ${context.loopAnalysis.chakra}`);
    parts.push(`Dimension: ${context.loopAnalysis.dimension}`);
    parts.push(`Band Context: ${context.loopAnalysis.bandContext}`);
    parts.push('\nDissolution Paths:');
    for (const p of context.loopAnalysis.dissolutionPractices) {
      parts.push(`  - ${p.label}: ${p.reason}`);
    }
    parts.push('');
  }

  if (context.bandProgression) {
    parts.push('### Band Progression');
    parts.push(`Current Band: ${context.bandProgression.currentBand}`);
    parts.push(`Next Band: ${context.bandProgression.nextBand}`);
    parts.push(`Critical Practices: ${context.bandProgression.criticalPractices.join(', ')}`);
    parts.push(`Likely Loops: ${context.bandProgression.likelyLoops.join(', ')}`);
    parts.push(`Estimated Sessions: ${context.bandProgression.estimatedSessions}`);
    parts.push('');
  }

  if (context.suggestedPractices.length > 0) {
    parts.push('### Suggested Practices');
    for (const p of context.suggestedPractices.slice(0, 5)) {
      parts.push(`  - ${p.label} (confidence: ${p.confidence})`);
    }
    parts.push('');
  }

  if (context.relatedBridges.length > 0) {
    parts.push('### Science ↔ Ancient Wisdom Bridges');
    for (const b of context.relatedBridges.slice(0, 3)) {
      parts.push(`  - ${b.modern} ↔ ${b.ancient}`);
    }
    parts.push('');
  }

  parts.push('Use this graph context to provide precise, personalized guidance.');
  parts.push('Always explain the reasoning: which loop, which chakra, which practice, and why.');
  parts.push('Cite lineage sources when relevant (Patanjali, Buddha, Ramana, etc.).');
  parts.push('Be compassionate, non-judgmental, and precise.');

  return parts.join('\n');
}
