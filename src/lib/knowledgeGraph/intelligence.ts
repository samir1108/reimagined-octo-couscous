import type { PersonalKnowledgeGraph, DevelopmentalStep, KnowledgeNode } from '@/types/knowledgeGraph';
import { getKnowledgeEngine } from './engine';
import { PersonalKnowledgeGraphService } from './personalGraph';

export async function buildKnowledgeContextForSession(userId: string): Promise<string> {
  const personalService = new PersonalKnowledgeGraphService(userId);
  const personal = await personalService.load();
  const engine = getKnowledgeEngine();
  const reported = Array.from(personal.nodes.values()).filter((n) => n.provenance === 'reported');
  const lines: string[] = [];
  lines.push(`Personal graph: ${personal.nodes.size} nodes, ${reported.length} reported.`);
  for (const n of reported.slice(0, 8)) {
    lines.push(`- ${n.label} (${n.provenance})`);
    if (n.knowledgeNodeId) {
      const k = engine.getNode(n.knowledgeNodeId);
      if (k) lines.push(`  related knowledge: ${k.name} [${k.domain}]`);
    }
  }
  return lines.join('\n');
}

export function suggestNextDevelopmentalStep(
  personal: PersonalKnowledgeGraph,
  context: { reportedStruggles?: string[]; preferredTradition?: string } = {}
): DevelopmentalStep {
  const engine = getKnowledgeEngine();
  const struggles = context.reportedStruggles || [];
  const relatedConceptIds: string[] = [];
  const suggestedPracticeIds: string[] = [];

  // Map struggle keywords to concepts
  const keywordMap: Record<string, string[]> = {
    focus: ['concept::consciousness::focused-attention', 'concept::transformation::focused-attention-practice'],
    stress: ['concept::psychology::emotional-regulation', 'concept::transformation::breathwork'],
    thoughts: ['concept::consciousness::thought-observation', 'concept::transformation::witness-meditation'],
    work: ['concept::life::work-stress', 'concept::transformation::evening-reflection'],
  };

  for (const s of struggles) {
    const key = s.toLowerCase();
    for (const [k, ids] of Object.entries(keywordMap)) {
      if (key.includes(k)) {
        relatedConceptIds.push(...ids);
        // find practices connected
        for (const id of ids) {
          const node = engine.getNode(id);
          if (node) {
            const practices = engine.neighbors(id, ['PRACTICED_THROUGH', 'SUPPORTS'], 'both');
            suggestedPracticeIds.push(...practices.map((p) => p.id));
          }
        }
      }
    }
  }

  // Tradition preference
  if (context.preferredTradition === 'jnana') {
    relatedConceptIds.push('concept::yoga::jnana-yoga', 'concept::yoga::atma-vichara');
    suggestedPracticeIds.push('concept::transformation::self-inquiry-practice');
  }

  const uniqueConcepts = Array.from(new Set(relatedConceptIds));
  const uniquePractices = Array.from(new Set(suggestedPracticeIds));

  const title = uniqueConcepts.length
    ? `Explore ${uniqueConcepts.map((id) => engine.getNode(id)?.name || id).slice(0, 3).join(', ')}`
    : 'Continue daily practice';

  const rationale = struggles.length
    ? `Based on reported struggles (${struggles.join(', ')}), relevant concepts and practices were selected from the knowledge graph.`
    : 'No specific struggles reported; maintain consistent practice.';

  return {
    title,
    rationale,
    relatedConceptIds: uniqueConcepts,
    suggestedPracticeIds: uniquePractices,
    confidence: struggles.length ? 0.7 : 0.4,
  };
}

export function buildPersonalContextSummary(personal: PersonalKnowledgeGraph): string {
  const nodes = Array.from(personal.nodes.values());
  const reported = nodes.filter((n) => n.provenance === 'reported');
  return `Personal graph: ${nodes.length} nodes (${reported.length} reported).`;
}
