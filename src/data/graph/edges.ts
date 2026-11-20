import type { GraphEdge, GraphNode } from '@/types/graph';
import { LOOP_FAMILIES } from '@/data/handbook/loopFamilies';
import { BAND_GUIDEBOOK } from '@/data/bandGuidebook';
import { DIMENSION_IMPACT_MATRIX, CROSS_POLLINATION_MAP } from '@/types/dimension-matrix';
import { PATHS } from '@/data/handbook/paths';
import { SKILLS } from '@/data/handbook/skills';
import { LOOP_ESSAYS } from '@/data/loopsAtlas';
import { LOOPS } from '@/data/loops';
import { FOUNDATION_CURRICULUM, COURSE_PHASES } from '@/data/foundation-course';
import { TASK_DOMAINS } from '@/data/taskDomains';
import { CHAKRA_URIS, DIMENSION_URIS, PRACTICE_URIS, PATH_URIS, BAND_URIS, TASK_DOMAIN_URIS } from './concepts';
import { MODE_REGISTRY } from '@/lib/sutra/modeRegistry';
import { ALL_PRACTICES } from '@/types/practices';
import { BAND_ARCHETYPES } from '@/types/consciousness';
import { EXPERIENCE_GAMES } from '@/data/experienceGames';
import { SHOWROOM_PROGRAMS } from '@/data/showroomPrograms';
import { OBSERVATION_LADDER } from '@/data/observationLadder';
import { BREAKTHROUGH_TYPES } from '@/data/breakthroughs';
import { SAPTARISHI } from '@/data/lineageTree';
import { WISDOM_DECK } from '@/data/wisdomDeck';
import { SIGNAL_TYPES, NADIS } from './nodes';
import { classifyStageMarkers } from './behaviorMap';
import { bandsForLoop, LOOP_BAND_OVERRIDES } from './loopBandAffinity';
import { STAGE_HANDBOOK } from '@/data/stageHandbook';
import { GRANTHIS } from '@/data/granthis';
import { KUNDALINI_SIGNS } from '@/data/kundaliniSigns';
import { ENERGY_MARKERS } from '@/data/energyMarkers';

const LOOP_CHAKRA_TO_NODE_ID: Record<string, string> = {
  root: 'muladhara',
  sacral: 'svadhisthana',
  solar: 'manipura',
  heart: 'anahata',
  throat: 'vishuddha',
  third_eye: 'ajna',
  'third eye': 'ajna',
  crown: 'sahasrara',
};

const LOOP_DIMENSION_TO_NODE_ID: Record<string, string> = {
  thought: 'thought',
  emotion: 'emotion',
  body: 'body',
  awareness: 'spirit',
};

function mapLoopChakra(loopChakra: string): string | undefined {
  return LOOP_CHAKRA_TO_NODE_ID[loopChakra.toLowerCase()];
}

function mapLoopDimension(loopDimension: string): string | undefined {
  return LOOP_DIMENSION_TO_NODE_ID[loopDimension.toLowerCase()];
}

let edgeCounter = 0;
function nextEdgeId(): string {
  return `edge::${++edgeCounter}`;
}

function getNode(nodes: Map<string, GraphNode>, id: string): GraphNode | undefined {
  return nodes.get(id);
}

function ensureEdge(edges: GraphEdge[], type: GraphEdge['type'], from: string, to: string, weight?: number, metadata?: Record<string, any>): void {
  if (from === to) return;
  const exists = edges.some(e => e.type === type && e.from === from && e.to === to);
  if (!exists) {
    edges.push({ id: nextEdgeId(), type, from, to, weight, metadata });
  }
}

export function buildEdgesFromExistingData(nodes: Map<string, GraphNode>): GraphEdge[] {
  const edges: GraphEdge[] = [];

  const get = (id: string): GraphNode | undefined => nodes.get(id);

  // ─── LOOP_BELONGS_TO_FAMILY ───
  for (const family of LOOP_FAMILIES) {
    const familyNode = get(`loop-family::${family.slug}`);
    if (!familyNode) continue;
    for (const loopId of family.exampleIds) {
      const loopNode = get(`loop::${loopId}`);
      if (loopNode) {
        ensureEdge(edges, 'LOOP_BELONGS_TO_FAMILY', loopNode.id, familyNode.id);
      }
    }
  }

  // ─── LOOP_RELATED_TO_CHAKRA + LOOP_RELATED_TO_DIMENSION ───
  for (const loop of LOOPS) {
    const loopNode = get(`loop::${loop.id}`);
    if (!loopNode) continue;

    const chakraKey = mapLoopChakra(loop.related_chakra);
    if (chakraKey) {
      const chakraNode = get(`chakra::${chakraKey}`);
      if (chakraNode) {
        ensureEdge(edges, 'LOOP_RELATED_TO_CHAKRA', loopNode.id, chakraNode.id, 0.8);
      }
    }

    const dimKey = mapLoopDimension(loop.related_dimension);
    if (dimKey) {
      const dimNode = get(`dimension::consciousness::${dimKey}`);
      if (dimNode) {
        ensureEdge(edges, 'LOOP_RELATED_TO_DIMENSION', loopNode.id, dimNode.id, 0.9);
      }
    }
  }

  // ─── LOOP_HAS_ESSAY ───
  for (const essay of LOOP_ESSAYS) {
    if (!essay.loopId) continue;
    const loopNode = get(`loop::${essay.loopId}`);
    const essayNode = get(`loop-essay::${essay.slug}`);
    if (loopNode && essayNode) {
      ensureEdge(edges, 'LOOP_HAS_ESSAY', loopNode.id, essayNode.id);
    }
  }

  // ─── LOOP_DISSOLVES_VIA (heuristic parsing of dissolution_path) ───
  const dissolutionPracticeKeywords: Record<string, string[]> = {
    'karma': ['karma', 'service', 'selfless', 'anonymous', 'help someone'],
    'bhakti': ['bhakti', 'devotion', 'gratitude', 'grateful', 'surrender', 'love'],
    'observation': ['observation', 'observe', 'notice', 'witness', 'watch'],
    'breath': ['breath', 'breathing', 'pranayama', 'box breath'],
    'body': ['body', 'somatic', 'walk', 'movement'],
    'jnana': ['jnana', 'inquiry', 'question', 'who am i', 'discrimination'],
    'raja': ['raja', 'discipline', 'structure', 'routine', 'meditation'],
    'kriya': ['kriya', 'cleansing', 'purification'],
    'tantra': ['tantra', 'energy', 'presence', 'embodied'],
    'neuroscience': ['neuroscience', 'brain', 'neuro', 'cognitive'],
    'emotional-healing': ['emotional', 'emotion', 'feeling', 'healing'],
    'loop-dissolution': ['dissolve', 'dissolution', 'break the loop'],
  };

  for (const loop of LOOPS) {
    const loopNode = get(`loop::${loop.id}`);
    if (!loopNode) continue;
    const text = `${loop.dissolution_path} ${loop.name} ${loop.category}`.toLowerCase();

    for (const [practiceId, keywords] of Object.entries(dissolutionPracticeKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        const practiceNode = get(`practice::${practiceId}`);
        if (practiceNode) {
          ensureEdge(edges, 'LOOP_DISSOLVES_VIA', loopNode.id, practiceNode.id, 0.6);
        }
      }
    }
  }

  // ─── LOOP_TRIGGERS_IN_DOMAIN + LOOP_MANIFESTS_IN_SITUATION ───
  for (const loop of LOOPS) {
    const loopNode = get(`loop::${loop.id}`);
    if (!loopNode) continue;

    for (const trigger of loop.triggers) {
      const t = trigger.toLowerCase();
      for (const domain of TASK_DOMAINS) {
        const domainNode = get(`task-domain::${domain.id}`);
        if (!domainNode) continue;
        const haystack = `${domain.label} ${domain.description} ${domain.examples.join(' ')}`.toLowerCase();
        if (haystack.includes(t) || t.includes(domain.label.toLowerCase().split(' ')[0])) {
          ensureEdge(edges, 'LOOP_TRIGGERS_IN_DOMAIN', loopNode.id, domainNode.id, 0.5);
        }
      }
    }

    for (const manifestation of loop.manifestations) {
      const m = manifestation.toLowerCase();
      for (const domain of TASK_DOMAINS) {
        const domainNode = get(`task-domain::${domain.id}`);
        if (!domainNode) continue;
        const haystack = `${domain.label} ${domain.description} ${domain.examples.join(' ')}`.toLowerCase();
        const words = m.split(' ');
        const overlap = words.some(w => w.length > 3 && haystack.includes(w));
        if (overlap) {
          ensureEdge(edges, 'LOOP_MANIFESTS_IN_SITUATION', loopNode.id, domainNode.id, 0.4);
        }
      }
    }
  }

  // ─── PRACTICE_IMPACTS_DIMENSION ───
  for (const [practiceId, impacts] of Object.entries(DIMENSION_IMPACT_MATRIX)) {
    const practiceNode = get(`practice::${practiceId}`);
    if (!practiceNode) continue;
    for (const [dimId, score] of Object.entries(impacts)) {
      if (score === 0) continue;
      const dimNode = get(`dimension::consciousness::${dimId}`);
      if (dimNode) {
        ensureEdge(edges, 'PRACTICE_IMPACTS_DIMENSION', practiceNode.id, dimNode.id, score / 4, { rawScore: score });
      }
    }
  }

  // ─── CROSS_POLLINATION_ROUTE ───
  for (const route of CROSS_POLLINATION_MAP) {
    const fromNode = get(`practice::${route.from}`);
    const toNode = get(`practice::${route.to}`);
    if (fromNode && toNode) {
      ensureEdge(edges, 'CROSS_POLLINATION_ROUTE', fromNode.id, toNode.id, 0.7, {
        fromLevel: route.fromLevel,
        toLevel: route.toLevel,
        reason: route.reason,
      });
    }
  }

  // ─── BAND_COMMON_LOOP ───
  for (const entry of BAND_GUIDEBOOK) {
    const bandNode = get(`band::${entry.band}`);
    if (!bandNode) continue;
    for (const loopId of entry.commonLoops) {
      const loopNode = get(`loop::${loopId}`);
      if (loopNode) {
        ensureEdge(edges, 'BAND_COMMON_LOOP', bandNode.id, loopNode.id, 0.7);
      }
    }
  }

  // ─── BAND_COMMON_LOOP (category affinity + hand-narrowed overrides) ───
  for (const loop of LOOPS) {
    const loopNode = get(`loop::${loop.id}`);
    if (!loopNode) continue;
    const overridden = LOOP_BAND_OVERRIDES[loop.id] !== undefined;
    const bands = bandsForLoop(loop.id, loop.category);
    for (const band of bands) {
      const bandNode = get(`band::${band}`);
      if (bandNode) {
        ensureEdge(edges, 'BAND_COMMON_LOOP', bandNode.id, loopNode.id, overridden ? 0.5 : 0.4, {
          source: overridden ? 'curated-override' : 'category-affinity',
        });
      }
    }
  }

  // ─── PRACTICE_PAIRS_WITH (from PATHS) ───
  for (const path of PATHS) {
    const pathNode = get(`path::${path.slug}`);
    if (!pathNode) continue;
    for (const pairedSlug of path.pairsWellWith) {
      const pairedNode = get(`path::${pairedSlug}`);
      if (pairedNode) {
        ensureEdge(edges, 'PRACTICE_PAIRS_WITH', pathNode.id, pairedNode.id, 0.8);
      }
    }
  }

  // ─── DIMENSION_MOVED_BY_SKILL (from SKILLS) ───
  for (const skill of SKILLS) {
    const skillNode = get(`skill::${skill.slug}`);
    if (!skillNode) continue;
    const dimNode = get(`dimension::consciousness::${skill.dimension.toLowerCase()}`);
    if (dimNode) {
      ensureEdge(edges, 'DIMENSION_MOVED_BY_SKILL', dimNode.id, skillNode.id, 0.8);
    }
  }

  // ─── CONCEPT_MENTIONED_IN_DAY (from relatedConcepts) ───
  const conceptKeywordMap: Record<string, string> = {
    'energy-body': 'concept::energy-body',
    'prana': 'concept::prana',
    'sukshma-sharira': 'concept::energy-body',
    'pranayama': 'concept::pranayama',
    'breath': 'concept::breath',
    'patanjali': 'concept::patanjali',
    'muladhara': 'chakra::muladhara',
    'root-chakra': 'chakra::muladhara',
    'safety': 'concept::safety',
    'grounding': 'concept::grounding',
    'svadhisthana': 'chakra::svadhisthana',
    'sacral': 'chakra::svadhisthana',
    'yoga-paths': 'path::yoga',
    'jnana': 'path::jnana',
    'bhakti': 'path::bhakti',
    'karma': 'path::karma',
    'raja': 'path::raja',
    'loops': 'concept::loops',
    'samskaras': 'concept::samskaras',
    'chitta-vritti': 'concept::chitta-vritti',
    'self-inquiry': 'practice::self-inquiry',
    'ramana': 'concept::ramana',
    'atma-vichara': 'concept::atma-vichara',
    'i-thought': 'concept::i-thought',
    'aham-vritti': 'concept::aham-vritti',
    'neti-neti': 'concept::neti-neti',
    'viveka': 'concept::viveka',
    'shankara': 'concept::shankara',
    'advaita': 'concept::advaita',
  };

  for (const day of FOUNDATION_CURRICULUM) {
    const dayNode = get(`course-day::${day.day}`);
    if (!dayNode) continue;
    for (const concept of day.relatedConcepts) {
      const targetId = conceptKeywordMap[concept];
      if (targetId) {
        const targetNode = get(targetId);
        if (targetNode) {
          ensureEdge(edges, 'CONCEPT_MENTIONED_IN_DAY', targetNode.id, dayNode.id, 0.6);
        }
      }
    }
  }

  // ─── COURSE_PHASE contains COURSE_DAY ───
  for (const phase of COURSE_PHASES) {
    const phaseNode = get(`course-phase::${phase.id}`);
    if (!phaseNode) continue;
    const [startDay, endDay] = phase.days;
    for (let d = startDay; d <= endDay; d++) {
      const dayNode = get(`course-day::${d}`);
      if (dayNode) {
        ensureEdge(edges, 'PROGRAM_CONTAINS_DAY', phaseNode.id, dayNode.id, 1.0);
      }
    }
  }

  // ─── CHAKRA_RELATED_TO_DIMENSION ───
  const chakraDimensionMap: Record<string, string[]> = {
    muladhara: ['body', 'spirit'],
    svadhisthana: ['emotion', 'body'],
    manipura: ['action', 'thought'],
    anahata: ['emotion', 'connection', 'spirit'],
    vishuddha: ['connection', 'spirit'],
    ajna: ['thought', 'spirit'],
    sahasrara: ['spirit'],
  };
  for (const [chakraId, dims] of Object.entries(chakraDimensionMap)) {
    const chakraNode = get(`chakra::${chakraId}`);
    if (!chakraNode) continue;
    for (const dimId of dims) {
      const dimNode = get(`dimension::consciousness::${dimId}`);
      if (dimNode) {
        ensureEdge(edges, 'CHAKRA_RELATED_TO_DIMENSION', chakraNode.id, dimNode.id, 0.7);
      }
    }
  }

  // ─── SUTRA_MODE_USES_PRACTICE ───
  for (const mode of MODE_REGISTRY) {
    const modeNode = get(`sutra-mode::${mode.id}`);
    if (!modeNode) continue;
    const practiceNode = get(`practice::${mode.practice}`);
    if (practiceNode) {
      ensureEdge(edges, 'SUTRA_MODE_USES_PRACTICE', modeNode.id, practiceNode.id, 0.9);
    }
  }

  // ─── GAME_TEACHES_CONCEPT ───
  for (const game of EXPERIENCE_GAMES) {
    const gameNode = get(`game::${game.id}`);
    if (!gameNode) continue;
    const keywords = `${game.trains} ${game.why} ${game.oneLine}`.toLowerCase();
    for (const [keyword, targetId] of Object.entries(conceptKeywordMap)) {
      if (keywords.includes(keyword)) {
        const targetNode = get(targetId);
        if (targetNode) {
          ensureEdge(edges, 'GAME_TEACHES_CONCEPT', gameNode.id, targetNode.id, 0.7);
        }
      }
    }
    // Link game -> practice if it trains a known practice
    for (const practice of ALL_PRACTICES) {
      if (keywords.includes(practice.id) || keywords.includes(practice.label.toLowerCase())) {
        const practiceNode = get(`practice::${practice.id}`);
        if (practiceNode) {
          ensureEdge(edges, 'GAME_TEACHES_CONCEPT', gameNode.id, practiceNode.id, 0.8);
        }
      }
    }
  }

  // ─── PROGRAM_CONTAINS_DAY / PROGRAM_CONTAINS_CONCEPT ───
  for (const program of SHOWROOM_PROGRAMS) {
    const programNode = get(`program::${program.slug}`);
    if (!programNode) continue;
    for (const day of program.days) {
      const dayNode = get(`course-day::${day.day}`);
      if (dayNode) {
        ensureEdge(edges, 'PROGRAM_CONTAINS_DAY', programNode.id, dayNode.id, 0.9);
      }
    }
    const programText = `${program.title} ${program.subtitle} ${program.promise} ${program.theme}`.toLowerCase();
    for (const [keyword, targetId] of Object.entries(conceptKeywordMap)) {
      if (programText.includes(keyword)) {
        const targetNode = get(targetId);
        if (targetNode) {
          ensureEdge(edges, 'PROGRAM_CONTAINS_DAY', programNode.id, targetNode.id, 0.5);
        }
      }
    }
  }

  // ─── OBSERVATION_REVEALS_LOOP (from observation ladder descriptions) ───
  for (const level of OBSERVATION_LADDER) {
    const levelNode = get(`observation-level::${level.level}`);
    if (!levelNode) continue;
    const text = `${level.title} ${level.sanskrit || ''} ${(level as any).description || ''}`.toLowerCase();
    for (const loop of LOOPS) {
      const loopNode = get(`loop::${loop.id}`);
      if (!loopNode) continue;
      const loopText = `${loop.name} ${loop.category} ${loop.triggers.join(' ')}`.toLowerCase();
      if (text.includes(loop.name.toLowerCase()) || loopText.includes(level.title.toLowerCase())) {
        ensureEdge(edges, 'OBSERVATION_REVEALS_LOOP', levelNode.id, loopNode.id, 0.5);
      }
    }
  }

  // ─── LOOP_RELATED_TO_PRACTICE (from loop category heuristic) ───
  for (const loop of LOOPS) {
    const loopNode = get(`loop::${loop.id}`);
    if (!loopNode) continue;
    const text = `${loop.category} ${loop.dissolution_path}`.toLowerCase();
    for (const practice of ALL_PRACTICES) {
      if (text.includes(practice.id) || text.includes(practice.label.toLowerCase())) {
        const practiceNode = get(`practice::${practice.id}`);
        if (practiceNode) {
          ensureEdge(edges, 'LOOP_RELATED_TO_PRACTICE', loopNode.id, practiceNode.id, 0.4);
        }
      }
    }
  }

  // ─── BAND_HAS_STAGE (from BAND_ARCHETYPES + STAGE_HANDBOOK) ───
  for (const band of BAND_ARCHETYPES) {
    const bandNode = get(`band::${band.band}`);
    if (!bandNode) continue;
    const stageNode = get(`band-stage::${band.band}`);
    if (stageNode) {
      ensureEdge(edges, 'BAND_HAS_STAGE', bandNode.id, stageNode.id, 1.0);
    }
  }

  // ─── KOSHA_LAYER_OF ───
  const koshaToEnergyBody: Record<string, string> = {
    annamaya: 'sthula',
    pranamaya: 'sukshma',
    manomaya: 'sukshma',
    vijnanamaya: 'sukshma',
    anandamaya: 'karana',
  };
  for (const [koshaId, bodyId] of Object.entries(koshaToEnergyBody)) {
    const koshaNode = get(`kosha::${koshaId}`);
    const bodyNode = get(`energy-body::${bodyId}`);
    if (koshaNode && bodyNode) {
      ensureEdge(edges, 'KOSHA_LAYER_OF', koshaNode.id, bodyNode.id, 0.9);
    }
  }

  // ─── CHAKRA_HAS_KOSHA ───
  const chakraKoshaMap: Record<string, string[]> = {
    muladhara: ['annamaya'],
    svadhisthana: ['pranamaya', 'annamaya'],
    manipura: ['pranamaya', 'manomaya'],
    anahata: ['manomaya', 'vijnanamaya'],
    vishuddha: ['vijnanamaya'],
    ajna: ['vijnanamaya'],
    sahasrara: ['anandamaya'],
  };
  for (const [chakraId, koshaIds] of Object.entries(chakraKoshaMap)) {
    const chakraNode = get(`chakra::${chakraId}`);
    if (!chakraNode) continue;
    for (const koshaId of koshaIds) {
      const koshaNode = get(`kosha::${koshaId}`);
      if (koshaNode) {
        ensureEdge(edges, 'CHAKRA_HAS_KOSHA', chakraNode.id, koshaNode.id, 0.8);
      }
    }
  }

  // ─── CHAKRA_GOVERS_PRANA ───
  const chakraPranaMap: Record<string, string[]> = {
    muladhara: ['apana'],
    svadhisthana: ['prana', 'samana'],
    manipura: ['samana', 'udana'],
    anahata: ['prana', 'vyana'],
    vishuddha: ['udana', 'prana'],
    ajna: ['prana', 'vyana'],
    sahasrara: ['vyana'],
  };
  for (const [chakraId, pranaIds] of Object.entries(chakraPranaMap)) {
    const chakraNode = get(`chakra::${chakraId}`);
    if (!chakraNode) continue;
    for (const pranaId of pranaIds) {
      const pranaNode = get(`prana::${pranaId}`);
      if (pranaNode) {
        ensureEdge(edges, 'CHAKRA_GOVERS_PRANA', chakraNode.id, pranaNode.id, 0.7);
      }
    }
  }

  // ─── PRANA_FLOWS_THROUGH + NADI_BALANCES_PRANA ───
  const nadiPranaMap: Record<string, string[]> = {
    ida: ['prana', 'apana'],
    pingala: ['prana', 'udana'],
    sushumna: ['vyana', 'samana'],
  };
  for (const [nadiId, pranaIds] of Object.entries(nadiPranaMap)) {
    const nadiNode = get(`nadi::${nadiId}`);
    if (!nadiNode) continue;
    for (const pranaId of pranaIds) {
      const pranaNode = get(`prana::${pranaId}`);
      if (pranaNode) {
        ensureEdge(edges, 'PRANA_FLOWS_THROUGH', pranaNode.id, nadiNode.id, 0.7);
        ensureEdge(edges, 'NADI_BALANCES_PRANA', nadiNode.id, pranaNode.id, 0.6);
      }
    }
  }

  // ─── ENERGY_BODY_LAYER_OF ───
  const energyBodyLayers: Record<string, string[]> = {
    sthula: ['annamaya'],
    sukshma: ['pranamaya', 'manomaya', 'vijnanamaya'],
    karana: ['anandamaya'],
  };
  for (const [bodyId, koshaIds] of Object.entries(energyBodyLayers)) {
    const bodyNode = get(`energy-body::${bodyId}`);
    if (!bodyNode) continue;
    for (const koshaId of koshaIds) {
      const koshaNode = get(`kosha::${koshaId}`);
      if (koshaNode) {
        ensureEdge(edges, 'ENERGY_BODY_LAYER_OF', bodyNode.id, koshaNode.id, 0.9);
      }
    }
  }

  // ─── GURU_IN_LINEAGE ───
  for (const branch of SAPTARISHI) {
    const lineageNode = get(`lineage::${branch.rishi.toLowerCase()}`);
    if (!lineageNode) continue;
    for (const master of branch.masters) {
      const guruId = `guru::${master.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const guruNode = get(guruId);
      if (guruNode) {
        ensureEdge(edges, 'GURU_IN_LINEAGE', guruNode.id, lineageNode.id, 0.9);
      }
    }
  }

  // ─── GURU_TEACHES_PRACTICE + GURU_CONNECTED_TO_LOOP ───
  const guruPracticeMap: Record<string, string[]> = {
    'ramana-maharshi': ['self-inquiry', 'witnessing'],
    'patanjali': ['breath', 'observation', 'raja'],
    'sadhguru': ['breath', 'body', 'kriya'],
    'yogananda': ['breath', 'bhakti', 'kriya'],
    'krishnamurti': ['observation', 'jnana'],
    'osho': ['body', 'tantra', 'breath'],
    'buddha': ['observation', 'breath', 'body'],
    'vivekananda': ['jnana', 'raja', 'karma'],
    'padmasambhava': ['tantra', 'kriya'],
    'milarepa': ['kriya', 'body'],
    'dogen': ['observation', 'body', 'raja'],
    'rumi': ['bhakti', 'breath'],
    'lao-tzu': ['raja', 'observation'],
    'tilopa': ['kriya', 'observation'],
    'maharishi-mahesh-yogi': ['breath', 'raja'],
  };

  const loopGuruMap: Record<string, string[]> = {
    'validation': ['ramana-maharshi', 'vivekananda'],
    'avoidance': ['sadhguru', 'patanjali'],
    'control': ['krishnamurti', 'ramana-maharshi'],
    'performance': ['ramana-maharshi', 'vivekananda'],
    'comparison': ['rumi', 'krishnamurti'],
    'rumination': ['patanjali', 'krishnamurti'],
    'spiritual-bypass': ['ramana-maharshi', 'krishnamurti'],
    'scarcity': ['vivekananda', 'sadhguru'],
    'savior': ['vivekananda', 'rumi'],
    'victim': ['krishnamurti', 'vivekananda'],
    'addictive': ['patanjali', 'sadhguru'],
    'perfectionism': ['ramana-maharshi', 'krishnamurti'],
  };

  for (const [guruName, practiceIds] of Object.entries(guruPracticeMap)) {
    const guruNode = get(`guru::${guruName}`);
    if (!guruNode) continue;
    for (const practiceId of practiceIds) {
      const practiceNode = get(`practice::${practiceId}`);
      if (practiceNode) {
        ensureEdge(edges, 'GURU_TEACHES_PRACTICE', guruNode.id, practiceNode.id, 0.8);
      }
    }
  }

  for (const [category, guruNames] of Object.entries(loopGuruMap)) {
    for (const loop of LOOPS) {
      if (loop.category !== category) continue;
      const loopNode = get(`loop::${loop.id}`);
      if (!loopNode) continue;
      for (const guruName of guruNames) {
        const guruNode = get(`guru::${guruName}`);
        if (guruNode) {
          ensureEdge(edges, 'GURU_CONNECTED_TO_LOOP', guruNode.id, loopNode.id, 0.6);
        }
      }
    }
  }

  // ─── BREAKTHROUGH_TRIGGERS_LOOP + BREAKTHROUGH_CATEGORY_OF ───
  const breakthroughLoopMap: Record<string, string[]> = {
    'BT003': ['VAL001', 'RUM001'],
    'BT021': ['VAL001', 'CTL001', 'AVO001'],
    'BT022': ['VCT001', 'SPB001'],
    'BT023': ['CTL001', 'AVO001'],
    'BT024': ['SRV330', 'VCT001'],
    'BT031': ['THR033', 'VAL001'],
    'BT032': ['REL001', 'CMP001'],
    'BT033': ['REL001', 'SRV331'],
    'BT034': ['VAL001', 'REL001'],
    'BT040': ['SRV334', 'BOD001'],
    'BT041': ['SRV334', 'EMO001'],
    'BT042': ['STR001', 'AVO001'],
    'BT043': ['SRV330', 'EMO001'],
    'BT050': ['SRV334', 'VCT001'],
    'BT051': ['SRV330', 'AVO001'],
    'BT052': ['VCT001', 'VAL001'],
    'BT053': ['SPB001', 'VCT001'],
    'BT054': ['VCT001', 'CTL001'],
    'BT060': ['EMO001', 'VAL001'],
    'BT061': ['SRV331', 'SPB001'],
    'BT062': ['OBS001', 'WIT001'],
    'BT063': ['VCT001', 'CTL001'],
    'BT064': ['SPB001', 'VCT001'],
  };

  for (const [btId, loopIds] of Object.entries(breakthroughLoopMap)) {
    const btNode = get(`breakthrough::${btId}`);
    if (!btNode) continue;
    for (const loopId of loopIds) {
      const loopNode = get(`loop::${loopId}`);
      if (loopNode) {
        ensureEdge(edges, 'BREAKTHROUGH_TRIGGERS_LOOP', btNode.id, loopNode.id, 0.7);
      }
    }
  }

  for (const bt of BREAKTHROUGH_TYPES) {
    const btNode = get(`breakthrough::${bt.id}`);
    if (!btNode) continue;
    const categoryNode = get(`breakthrough-category::${bt.category}`);
    if (categoryNode) {
      ensureEdge(edges, 'BREAKTHROUGH_CATEGORY_OF', btNode.id, categoryNode.id, 0.8);
    }
  }

  // ─── WISDOM_CARD_THEME ───
  const wisdomThemeMap: Record<number, string[]> = {
    1: ['witness', 'self-inquiry'],
    2: ['mind', 'observation'],
    3: ['witness', 'raja'],
    4: ['chitta-vritti', 'raja'],
    5: ['samskara', 'thought'],
    6: ['wound', 'healing'],
    7: ['self-inquiry', 'witness'],
    8: ['impermanence', 'change'],
    9: ['tao', 'neti-neti'],
    10: ['thought', 'mind'],
    11: ['silence', 'witness'],
    12: ['suffering', 'impermanence'],
    13: ['cave', 'shadow'],
    14: ['thought', 'speech'],
    15: ['witness', 'self-inquiry'],
    16: ['self-inquiry', 'jnana'],
    17: ['silence', 'witness'],
    18: ['sky', 'witness'],
    19: ['sufi', 'bhakti'],
    20: ['tao', 'surrender'],
    21: ['freedom', 'action'],
    22: ['surrender', 'emptiness'],
    23: ['truth', 'surrender'],
    24: ['karma', 'action'],
    25: ['sufi', 'surrender'],
    26: ['time', 'change'],
    27: ['happiness', 'present'],
    28: ['self', 'authenticity'],
    29: ['present', 'acceptance'],
    30: ['time', 'anxiety'],
    31: ['body', 'trauma'],
    32: ['present', 'mindfulness'],
    33: ['meaning', 'existential'],
    34: ['truth', 'neti-neti'],
    35: ['anxiety', 'emotion'],
    36: ['mind', 'thought'],
    37: ['action', 'karma'],
    38: ['thought', 'samskara'],
    39: ['love', 'bhakti'],
    40: ['sufi', 'love'],
    41: ['perception', 'mind'],
    42: ['peace', 'bhakti'],
    43: ['purpose', 'meaning'],
    44: ['comparison', 'mind'],
    45: ['perception', 'mind'],
    46: ['sufi', 'unity'],
    47: ['thought', 'suffering'],
    48: ['resentment', 'forgiveness'],
    49: ['love', 'bhakti'],
    50: ['self', 'self-inquiry'],
  };

  for (const [cardId, themeIds] of Object.entries(wisdomThemeMap)) {
    const cardNode = get(`wisdom-card::${cardId}`);
    if (!cardNode) continue;
    for (const themeId of themeIds) {
      const themeNode = get(`concept::${themeId}`);
      if (themeNode) {
        ensureEdge(edges, 'WISDOM_CARD_THEME', cardNode.id, themeNode.id, 0.6);
      }
    }
  }

  // ─── SIGNAL_INDICATES_LOOP + SIGNAL_TYPE_OF ───
  const signalLoopMap: Record<string, string[]> = {
    head: ['RUM001', 'CTL001', 'NAR001', 'SRV330'],
    heart: ['VAL001', 'ATT001', 'EMO001', 'REL001'],
    gut: ['AVO001', 'SRV334', 'FEA001', 'ANX001'],
    witness: ['OBS001', 'WIT001', 'ATT001', 'VCT001'],
  };

  for (const [signalId, loopIds] of Object.entries(signalLoopMap)) {
    const signalNode = get(`signal::${signalId}`);
    if (!signalNode) continue;
    for (const loopId of loopIds) {
      const loopNode = get(`loop::${loopId}`);
      if (loopNode) {
        ensureEdge(edges, 'SIGNAL_INDICATES_LOOP', signalNode.id, loopNode.id, 0.6);
      }
    }
  }

  for (const signal of SIGNAL_TYPES) {
    const signalNode = get(`signal::${signal.id}`);
    if (!signalNode) continue;
    const dimensionMap: Record<string, string> = {
      head: 'thought',
      heart: 'emotion',
      gut: 'body',
      witness: 'awareness',
    };
    const dimId = dimensionMap[signal.id];
    if (dimId) {
      const dimNode = get(`dimension::consciousness::${dimId}`);
      if (dimNode) {
        ensureEdge(edges, 'SIGNAL_TYPE_OF', signalNode.id, dimNode.id, 0.8);
      }
    }
  }

  // ─── LOOP_DISSOLVED_BY_GAME ───
  const gameLoopMap: Record<string, string[]> = {
    'the-pause': ['AVO001', 'CTL001', 'ADD001'],
    'breath-temple': ['STR001', 'ANX001', 'SRV334'],
    'thought-watcher': ['RUM001', 'OBS001', 'WIT001'],
    'who-is-thinking': ['VCT001', 'NAR001', 'CTL001'],
    'karma-coin': ['VAL001', 'AVO001', 'PER001'],
    'three-brains-speak': ['VAL001', 'REL001', 'EMO001'],
    'mirror-realm': ['SPB001', 'VCT001', 'CMP001'],
    'body-scanner': ['SRV334', 'BOD001', 'EMO001'],
    'name-the-emotion': ['EMO001', 'SRV331', 'FEA001'],
    'neti-neti': ['NAR001', 'VCT001', 'SPB001'],
    'tonglen': ['VCT001', 'REL001', 'EMO001'],
    'the-sigh': ['ANX001', 'STR001', 'EMO001'],
    'ninth-dharana': ['RUM001', 'AVO001', 'CTL001'],
    'last-breath': ['VCT001', 'PER001', 'SRV330'],
    'silent-mountain': ['RUM001', 'CTL001', 'OBS001'],
  };

  for (const [gameId, loopIds] of Object.entries(gameLoopMap)) {
    const gameNode = get(`game::${gameId}`);
    if (!gameNode) continue;
    for (const loopId of loopIds) {
      const loopNode = get(`loop::${loopId}`);
      if (loopNode) {
        ensureEdge(edges, 'LOOP_DISSOLVED_BY_GAME', gameNode.id, loopNode.id, 0.7);
      }
    }
  }

  // ─── Stage-behavior knowledge graph ───
  // Resolves an anatomy id to whichever subtle-body node family owns it:
  // a chakra, a nadi, or a kosha (signs may be felt in any of the three).
  const resolveAnatomyNode = (id: string): GraphNode | undefined =>
    get(`chakra::${id}`) ?? get(`nadi::${id}`) ?? get(`kosha::${id}`);

  for (const marker of classifyStageMarkers()) {
    const bandNode = get(`band::${marker.band}`);
    if (bandNode) {
      ensureEdge(edges, 'BAND_EXHIBITS_MARKER', bandNode.id, marker.id, 1.0);
    }

    const dimNode = get(`dimension::consciousness::${marker.dimension}`);
    if (dimNode) {
      const score = Math.max(0.5, Math.min(1, 0.4 + (marker.dimensionScores[marker.dimension] ?? 0) * 0.12));
      ensureEdge(edges, 'MARKER_IN_DIMENSION', marker.id, dimNode.id, score);
    }

    if (marker.chakra) {
      const chakraNode = resolveAnatomyNode(marker.chakra);
      if (chakraNode) {
        ensureEdge(edges, 'MARKER_IN_CHAKRA', marker.id, chakraNode.id, 0.8);
      }
    }

    for (const loop of marker.loops) {
      const loopNode = get(`loop::${loop.loopId}`);
      if (loopNode) {
        ensureEdge(edges, 'MARKER_INDICATES_LOOP', marker.id, loopNode.id, loop.score, {
          classified: !marker.curated,
          confidence: marker.confidence,
        });
      }
    }
  }

  // ─── BAND_FITS_PATH (which yoga path actually fits each band) ───
  for (const stage of STAGE_HANDBOOK) {
    const bandNode = get(`band::${stage.band}`);
    if (!bandNode) continue;
    for (const fit of stage.paths) {
      const pathNode = get(`path::${fit.path.toLowerCase()}`);
      if (pathNode) {
        const weight = fit.fit === 'primary' ? 0.9 : fit.fit === 'supporting' ? 0.5 : 0.1;
        ensureEdge(edges, 'BAND_FITS_PATH', bandNode.id, pathNode.id, weight, { fit: fit.fit, why: fit.why });
      }
    }
  }

  // ─── BAND_ADVANCES_TO (the spiral: band N → band N+1) ───
  for (let band = 0; band < 10; band++) {
    const from = get(`band::${band}`);
    const to = get(`band::${band + 1}`);
    if (!from || !to) continue;
    const stage = STAGE_HANDBOOK.find(s => s.band === band);
    ensureEdge(edges, 'BAND_ADVANCES_TO', from.id, to.id, 1.0, {
      bridge: stage?.bridge,
      isHumanJourney: band < 7,
    });
  }

  // ─── GRANTHIS: knots that hold each band in place ───
  for (const granthi of GRANTHIS) {
    const granthiNode = get(`granthi::${granthi.id}`);
    if (!granthiNode) continue;

    const chakraNode = get(`chakra::${granthi.chakra}`);
    if (chakraNode) {
      ensureEdge(edges, 'GRANTHI_AT_CHAKRA', granthiNode.id, chakraNode.id, 0.9);
    }

    for (const band of granthi.dominantAtBands) {
      const bandNode = get(`band::${band}`);
      if (bandNode) {
        ensureEdge(edges, 'BAND_BLOCKED_BY_GRANTHI', bandNode.id, granthiNode.id, 0.85);
      }
    }

    for (const familySlug of granthi.tightensFamilies) {
      const familyNode = get(`loop-family::${familySlug}`);
      if (familyNode) {
        ensureEdge(edges, 'GRANTHI_TIGHTENS_LOOP_FAMILY', granthiNode.id, familyNode.id, 0.8);
      }
    }

    for (const practiceId of granthi.dissolvedBy) {
      const practiceNode = get(`practice::${practiceId}`);
      if (practiceNode) {
        ensureEdge(edges, 'GRANTHI_DISSOLVED_BY_PRACTICE', granthiNode.id, practiceNode.id, 0.9);
      }
    }
  }

  // ─── KUNDALINI SIGNS: the behavioral signature of stirring ki ───
  for (const sign of KUNDALINI_SIGNS) {
    const signNode = get(`kundalini-sign::${sign.id}`);
    if (!signNode) continue;

    const anatomyNode = resolveAnatomyNode(sign.chakra);
    if (anatomyNode) {
      ensureEdge(edges, 'KUNDALINI_SIGN_AT_CHAKRA', signNode.id, anatomyNode.id, 0.9);
    }

    const dimNode = get(`dimension::consciousness::${sign.dimension}`);
    if (dimNode) {
      ensureEdge(edges, 'KUNDALINI_SIGN_IN_DIMENSION', signNode.id, dimNode.id, 0.8);
    }

    for (const loopId of sign.mimicsLoops) {
      const loopNode = get(`loop::${loopId}`);
      if (loopNode) {
        ensureEdge(edges, 'KUNDALINI_SIGN_MIMICS_LOOP', signNode.id, loopNode.id, 0.7, {
          note: 'Energetic sign commonly mistaken for this behavioral loop',
        });
      }
    }

    for (const band of sign.surfacesInBands) {
      const bandNode = get(`band::${band}`);
      if (bandNode) {
        ensureEdge(edges, 'BAND_MAY_SHOW_SIGN', bandNode.id, signNode.id, 0.75, {
          safety: sign.safety,
        });
      }
    }
  }

  // ─── ENERGY MARKERS: prana and nadi dominance, behaviorally ───
  for (const marker of ENERGY_MARKERS) {
    const markerNode = get(`energy-marker::${marker.id}`);
    if (!markerNode) continue;

    const channelNode = marker.family === 'prana' ? get(`prana::${marker.channel}`) : get(`nadi::${marker.channel}`);
    if (channelNode) {
      ensureEdge(edges, 'ENERGY_CHANNEL_EXHIBITS_MARKER', channelNode.id, markerNode.id, 0.9);
    }

    const dimNode = get(`dimension::consciousness::${marker.dimension}`);
    if (dimNode) {
      ensureEdge(edges, 'ENERGY_MARKER_IN_DIMENSION', markerNode.id, dimNode.id, 0.8);
    }

    for (const loopId of marker.misreadAsLoops) {
      const loopNode = get(`loop::${loopId}`);
      if (loopNode) {
        ensureEdge(edges, 'ENERGY_MARKER_MIMICS_LOOP', markerNode.id, loopNode.id, 0.6, {
          note: 'Energy imbalance commonly mistaken for this behavioral loop',
        });
      }
    }

    for (const practiceId of marker.balancedBy) {
      const practiceNode = get(`practice::${practiceId}`);
      if (practiceNode) {
        ensureEdge(edges, 'ENERGY_MARKER_BALANCED_BY_PRACTICE', markerNode.id, practiceNode.id, 0.85);
      }
    }
  }

  return edges;
}
