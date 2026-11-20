import type { GraphNode } from '@/types/graph';
import { LOOPS } from '@/data/loops';
import { LOOP_FAMILIES } from '@/data/handbook/loopFamilies';
import { LOOP_ESSAYS } from '@/data/loopsAtlas';
import { ALL_PRACTICES, getPracticeById } from '@/types/practices';
import { BAND_ARCHETYPES } from '@/types/consciousness';
import { BAND_GUIDEBOOK } from '@/data/bandGuidebook';
import { DIMENSIONS as CONSCIOUSNESS_DIMS } from '@/types/consciousness';
import { DIMENSIONS as HUMAN_DIMS } from '@/data/humanMap/dimensions';
import { TASK_DOMAINS } from '@/data/taskDomains';
import { BRIDGES } from '@/data/bridgesExpanded';
import { FOUNDATION_CURRICULUM, COURSE_PHASES } from '@/data/foundation-course';
import { OBSERVATION_LADDER } from '@/data/observationLadder';
import { STAGE_HANDBOOK } from '@/data/stageHandbook';
import { PATHS } from '@/data/handbook/paths';
import { SKILLS } from '@/data/handbook/skills';
import { KNOWLEDGE_CARDS } from '@/data/knowledgeCards';
import { MICRO_PRACTICES } from '@/data/microPractices';
import { MODE_REGISTRY } from '@/lib/sutra/modeRegistry';
import { PRACTICES as SUTRA_PRACTICES, PRACTICE_META } from '@/lib/sutra/practices';
import { EXPERIENCE_GAMES } from '@/data/experienceGames';
import { WISDOM_DECK } from '@/data/wisdomDeck';
import { MANIFESTS } from '@/data/sensorialPractices';
import { SHOWROOM_PROGRAMS } from '@/data/showroomPrograms';
import { BREAKTHROUGH_TYPES } from '@/data/breakthroughs';
import { SAPTARISHI } from '@/data/lineageTree';
import { classifyStageMarkers } from './behaviorMap';
import { GRANTHIS } from '@/data/granthis';
import { KUNDALINI_SIGNS } from '@/data/kundaliniSigns';
import { ENERGY_MARKERS } from '@/data/energyMarkers';

const KOSHAS = [
  { id: 'annamaya', label: 'Annamaya Kosha', description: 'The food sheath', aliases: ['physical', 'body'] },
  { id: 'pranamaya', label: 'Pranamaya Kosha', description: 'The energy sheath', aliases: ['breath', 'prana'] },
  { id: 'manomaya', label: 'Manomaya Kosha', description: 'The mental sheath', aliases: ['mind', 'thoughts'] },
  { id: 'vijnanamaya', label: 'Vijnanamaya Kosha', description: 'The wisdom sheath', aliases: ['intellect', 'discernment'] },
  { id: 'anandamaya', label: 'Anandamaya Kosha', description: 'The bliss sheath', aliases: ['joy', 'bliss'] },
];

const PRANAS = [
  { id: 'prana', label: 'Prana', description: 'Upward/forward vital breath', aliases: ['inward', 'forward', 'life force'] },
  { id: 'apana', label: 'Apana', description: 'Downward/outward elimination breath', aliases: ['outward', 'elimination', 'downward'] },
  { id: 'samana', label: 'Samana', description: 'Central digestive/metabolic breath', aliases: ['digestion', 'metabolism', 'central'] },
  { id: 'udana', label: 'Udana', description: 'Upward thrusting breath at throat', aliases: ['speech', 'upward', 'throat'] },
  { id: 'vyana', label: 'Vyana', description: 'All-pervading circulatory breath', aliases: ['circulation', 'pervading', 'all-over'] },
];

const NADIS = [
  { id: 'ida', label: 'Ida Nadi', description: 'Left channel, lunar/feminine, governs rest and intuition', aliases: ['left', 'lunar', 'feminine', 'parasympathetic'] },
  { id: 'pingala', label: 'Pingala Nadi', description: 'Right channel, solar/masculine, governs action and logic', aliases: ['right', 'solar', 'masculine', 'sympathetic'] },
  { id: 'sushumna', label: 'Sushumna Nadi', description: 'Central channel, neutral, kundalini rises through this', aliases: ['central', 'neutral', 'kundalini', 'spine'] },
];

const SIGNAL_TYPES = [
  { id: 'head', label: 'Head Signal', description: 'Cognitive and mental signals', aliases: ['thought', 'mind', 'thinking'] },
  { id: 'heart', label: 'Heart Signal', description: 'Emotional and feeling signals', aliases: ['emotion', 'feeling', 'love'] },
  { id: 'gut', label: 'Gut Signal', description: 'Intuitive and somatic signals', aliases: ['intuition', 'body', 'somatic'] },
  { id: 'witness', label: 'Witness Signal', description: 'Pure awareness observing all signals', aliases: ['awareness', 'observer', 'consciousness'] },
];

const ENERGY_BODIES = [
  { id: 'sthula', label: 'Sthula Sharira', description: 'Gross physical body', aliases: ['physical body', 'gross'] },
  { id: 'sukshma', label: 'Sukshma Sharira', description: 'Subtle body of energy and mind', aliases: ['subtle body', 'energy body'] },
  { id: 'karana', label: 'Karana Sharira', description: 'Causal body of deep sleep and seed impressions', aliases: ['causal body', 'seed'] },
];

const CONCEPTS = [
  { id: 'energy-body', label: 'Energy Body', description: 'The subtle body system', aliases: ['sukshma sharira', 'subtle body'] },
  { id: 'prana', label: 'Prana', description: 'Life force energy', aliases: ['life force', 'vital breath'] },
  { id: 'nadis', label: 'Nadis', description: 'Energy channels', aliases: ['channels', 'subtle channels'] },
  { id: 'marma', label: 'Marma', description: 'Energy junction points', aliases: ['vital points', 'energy points'] },
  { id: 'chitta-vritti', label: 'Chitta Vritti', description: 'Mental modifications', aliases: ['mind waves', 'thought patterns'] },
  { id: 'neti-neti', label: 'Neti Neti', description: 'Not this, not this', aliases: ['self-inquiry', 'negation'] },
  { id: 'sankalpa', label: 'Sankalpa', description: 'Conscious intention', aliases: ['intention', 'resolve'] },
  { id: 'samskara', label: 'Samskara', description: 'Mental impression or groove', aliases: ['imprint', 'groove'] },
  { id: 'vritti', label: 'Vritti', description: 'Mental fluctuation or modification', aliases: ['modification', 'wave'] },
  { id: 'kosha', label: 'Kosha', description: 'Sheath or layer of being', aliases: ['sheath', 'layer'] },
];

const BREAKTHROUGH_CATEGORIES = [
  { id: 'awareness', label: 'Awareness', description: 'Breakthroughs in noticing and witnessing' },
  { id: 'emotional', label: 'Emotional', description: 'Breakthroughs in feeling and processing emotions' },
  { id: 'pattern', label: 'Pattern', description: 'Breakthroughs in breaking and dissolving patterns' },
  { id: 'relational', label: 'Relational', description: 'Breakthroughs in relationships and connection' },
  { id: 'somatic', label: 'Somatic', description: 'Breakthroughs in body awareness and release' },
  { id: 'existential', label: 'Existential', description: 'Breakthroughs in meaning and purpose' },
  { id: 'integration', label: 'Integration', description: 'Breakthroughs in wholeness and unification' },
];

export function buildNodesFromExistingData(): GraphNode[] {
  const nodes: GraphNode[] = [];

  // 300+ loops
  for (const loop of LOOPS) {
    nodes.push({
      id: `loop::${loop.id}`,
      type: 'loop',
      label: loop.name,
      uri: `concept::loop::${loop.id.toLowerCase()}`,
      data: loop,
      aliases: [loop.name, ...loop.keywords, ...loop.triggers],
    });
  }

  // 12 loop families
  for (const family of LOOP_FAMILIES) {
    nodes.push({
      id: `loop-family::${family.slug}`,
      type: 'loop-family',
      label: family.name,
      uri: `concept::loop-family::${family.slug}`,
      data: family,
      aliases: [family.name, family.slug],
    });
  }

  // Loop essays
  for (const essay of LOOP_ESSAYS) {
    nodes.push({
      id: `loop-essay::${essay.slug}`,
      type: 'loop-essay',
      label: essay.name,
      uri: `concept::loop-essay::${essay.slug}`,
      data: essay,
      aliases: [essay.name, essay.ancientName, essay.slug],
    });
  }

  // 18 practices (from src/types/practices.ts)
  for (const practice of ALL_PRACTICES) {
    nodes.push({
      id: `practice::${practice.id}`,
      type: 'practice',
      label: practice.label,
      uri: `concept::practice::${practice.id}`,
      data: practice,
      aliases: [practice.label, practice.id],
    });
    for (const level of practice.levels) {
      nodes.push({
        id: `practice-level::${practice.id}::L${level.level}`,
        type: 'practice-level',
        label: `${practice.label} L${level.level}`,
        uri: `concept::practice-level::${practice.id}::${level.level}`,
        data: { practiceId: practice.id, ...level },
        aliases: [`${practice.label} L${level.level}`, level.name],
      });
    }
  }

  // Sutra practices (12)
  for (const p of SUTRA_PRACTICES) {
    const meta = PRACTICE_META[p];
    nodes.push({
      id: `sutra-practice::${p}`,
      type: 'sutra-practice',
      label: meta.label,
      uri: `concept::sutra-practice::${p}`,
      data: { id: p, ...meta },
      aliases: [meta.label, meta.sanskrit || '', p],
    });
  }

  // 11 bands
  for (const band of BAND_ARCHETYPES) {
    nodes.push({
      id: `band::${band.band}`,
      type: 'band',
      label: band.name,
      uri: `concept::band::${band.band}`,
      data: band,
      aliases: [band.name, band.title],
    });
  }

  // Band guidebook entries
  for (const entry of BAND_GUIDEBOOK) {
    nodes.push({
      id: `band-guide::${entry.band}`,
      type: 'band',
      label: entry.title,
      uri: `concept::band-guide::${entry.band}`,
      data: entry,
      aliases: [entry.title],
    });
  }

  // Stage handbook (8 bands with stages)
  for (const stage of STAGE_HANDBOOK) {
    nodes.push({
      id: `band-stage::${stage.band}`,
      type: 'band-stage',
      label: `${stage.name} — ${stage.tagline}`,
      uri: `concept::band-stage::${stage.band}`,
      data: stage,
      aliases: [stage.name, stage.slug],
    });
  }

  // 6 consciousness dimensions
  for (const dim of CONSCIOUSNESS_DIMS) {
    nodes.push({
      id: `dimension::consciousness::${dim.id}`,
      type: 'dimension',
      label: dim.label,
      uri: `concept::dimension::consciousness::${dim.id}`,
      data: dim,
      aliases: [dim.label, dim.id],
    });
  }

  // 99 human dimensions
  for (const dim of HUMAN_DIMS) {
    nodes.push({
      id: `dimension::human::${dim.id}`,
      type: 'dimension',
      label: dim.label,
      uri: `concept::dimension::human::${dim.id}`,
      data: dim,
      aliases: [dim.label, dim.raw],
    });
  }

  // 7 chakras
  const chakras = [
    { id: 'muladhara', name: 'Muladhara', sanskrit: 'Root', color: 'Red', location: 'Base of spine', element: 'Earth', mantra: 'LAM' },
    { id: 'svadhisthana', name: 'Svadhisthana', sanskrit: 'Sacral', color: 'Orange', location: 'Below navel', element: 'Water', mantra: 'VAM' },
    { id: 'manipura', name: 'Manipura', sanskrit: 'Solar Plexus', color: 'Yellow', location: 'Upper abdomen', element: 'Fire', mantra: 'RAM' },
    { id: 'anahata', name: 'Anahata', sanskrit: 'Heart', color: 'Green', location: 'Center of chest', element: 'Air', mantra: 'YAM' },
    { id: 'vishuddha', name: 'Vishuddha', sanskrit: 'Throat', color: 'Blue', location: 'Throat', element: 'Ether', mantra: 'HAM' },
    { id: 'ajna', name: 'Ajna', sanskrit: 'Third Eye', color: 'Indigo', location: 'Between eyebrows', element: 'Mind', mantra: 'OM' },
    { id: 'sahasrara', name: 'Sahasrara', sanskrit: 'Crown', color: 'Violet', location: 'Top of head', element: 'Consciousness', mantra: 'Silence' },
  ];
  for (const chakra of chakras) {
    nodes.push({
      id: `chakra::${chakra.id}`,
      type: 'chakra',
      label: chakra.name,
      uri: `concept::chakra::${chakra.id}`,
      data: chakra,
      aliases: [chakra.name, chakra.sanskrit, chakra.id],
    });
  }

  // 24 task domains
  for (const domain of TASK_DOMAINS) {
    nodes.push({
      id: `task-domain::${domain.id}`,
      type: 'task-domain',
      label: domain.label,
      uri: `concept::task-domain::${domain.id}`,
      data: domain,
      aliases: [domain.label, domain.id, ...domain.examples],
    });
  }

  // 8 bridges
  for (const bridge of BRIDGES) {
    nodes.push({
      id: `bridge::${bridge.slug}`,
      type: 'bridge',
      label: `${bridge.modern} ↔ ${bridge.ancient}`,
      uri: `concept::bridge::${bridge.slug}`,
      data: bridge,
      aliases: [bridge.modern, bridge.ancient, bridge.slug],
    });
  }

  // 118 course days
  for (const day of FOUNDATION_CURRICULUM) {
    nodes.push({
      id: `course-day::${day.day}`,
      type: 'course-day',
      label: `Day ${day.day}: ${day.title}`,
      uri: `concept::course-day::${day.day}`,
      data: day,
      aliases: [day.title, `day ${day.day}`],
    });
  }

  // 8 course phases
  for (const phase of COURSE_PHASES) {
    nodes.push({
      id: `course-phase::${phase.id}`,
      type: 'course-phase',
      label: phase.name,
      uri: `concept::course-phase::${phase.id}`,
      data: phase,
      aliases: [phase.name, phase.id],
    });
  }

  // 7 observation levels
  for (const level of OBSERVATION_LADDER) {
    nodes.push({
      id: `observation-level::${level.level}`,
      type: 'observation-level',
      label: level.title,
      uri: `concept::observation-level::${level.level}`,
      data: level,
      aliases: [level.title, level.sanskrit || ''],
    });
  }

  // 6 paths
  for (const path of PATHS) {
    nodes.push({
      id: `path::${path.slug}`,
      type: 'path',
      label: path.name,
      uri: `concept::path::${path.slug}`,
      data: path,
      aliases: [path.name, path.slug],
    });
    for (const level of path.levels) {
      nodes.push({
        id: `path-level::${path.slug}::L${level.level}`,
        type: 'path-level',
        label: `${path.name} L${level.level}`,
        uri: `concept::path-level::${path.slug}::${level.level}`,
        data: { pathSlug: path.slug, ...level },
        aliases: [level.name],
      });
    }
  }

  // 9 skills
  for (const skill of SKILLS) {
    nodes.push({
      id: `skill::${skill.slug}`,
      type: 'skill',
      label: skill.name,
      uri: `concept::skill::${skill.slug}`,
      data: skill,
      aliases: [skill.name, skill.slug],
    });
    for (const level of skill.levels) {
      nodes.push({
        id: `skill-level::${skill.slug}::L${level.level}`,
        type: 'skill-level',
        label: `${skill.name} L${level.level}`,
        uri: `concept::skill-level::${skill.slug}::${level.level}`,
        data: { skillSlug: skill.slug, ...level },
        aliases: [level.name],
      });
    }
  }

  // 50+ knowledge cards
  for (const card of KNOWLEDGE_CARDS) {
    nodes.push({
      id: `knowledge-card::${card.id}`,
      type: 'knowledge-card',
      label: card.title,
      uri: `concept::knowledge-card::${card.id}`,
      data: card,
      aliases: [card.title, card.category],
    });
  }

  // 8+ micro practices
  for (const mp of MICRO_PRACTICES) {
    nodes.push({
      id: `micro-practice::${mp.id}`,
      type: 'micro-practice',
      label: mp.title,
      uri: `concept::micro-practice::${mp.id}`,
      data: mp,
      aliases: [mp.title, mp.id],
    });
  }

  // 50+ sutra modes
  for (const mode of MODE_REGISTRY) {
    nodes.push({
      id: `sutra-mode::${mode.id}`,
      type: 'sutra-mode',
      label: mode.label,
      uri: `concept::sutra-mode::${mode.id}`,
      data: mode,
      aliases: [mode.label, mode.id],
    });
  }

  // Games
  for (const game of EXPERIENCE_GAMES) {
    nodes.push({
      id: `game::${game.id}`,
      type: 'game',
      label: game.name,
      uri: `concept::game::${game.id}`,
      data: game,
      aliases: [game.name, game.symbol, game.tradition],
    });
  }

  // Programs
  for (const program of SHOWROOM_PROGRAMS) {
    nodes.push({
      id: `program::${program.slug}`,
      type: 'program',
      label: program.title,
      uri: `concept::program::${program.slug}`,
      data: program,
      aliases: [program.title, program.guru, program.theme],
    });
  }

  // Wisdom cards
  for (const card of WISDOM_DECK) {
    nodes.push({
      id: `wisdom-card::${card.id}`,
      type: 'wisdom-card',
      label: `${card.source}: ${card.text.slice(0, 40)}...`,
      uri: `concept::wisdom-card::${card.id}`,
      data: card,
      aliases: [card.source, card.tradition, card.text.slice(0, 30)],
    });
  }

  // Sensorial practices
  for (const manifest of MANIFESTS) {
    nodes.push({
      id: `sensorial-practice::${manifest.key}`,
      type: 'sensorial-practice',
      label: manifest.title,
      uri: `concept::sensorial-practice::${manifest.key}`,
      data: manifest,
      aliases: [manifest.title, manifest.guruId, manifest.practiceMatch],
    });
  }

  // Koshas
  for (const kosha of KOSHAS) {
    nodes.push({
      id: `kosha::${kosha.id}`,
      type: 'kosha',
      label: kosha.label,
      uri: `concept::kosha::${kosha.id}`,
      data: kosha,
      aliases: kosha.aliases,
    });
  }

  // Pranas
  for (const prana of PRANAS) {
    nodes.push({
      id: `prana::${prana.id}`,
      type: 'prana',
      label: prana.label,
      uri: `concept::prana::${prana.id}`,
      data: prana,
      aliases: prana.aliases,
    });
  }

  // Energy bodies
  for (const eb of ENERGY_BODIES) {
    nodes.push({
      id: `energy-body::${eb.id}`,
      type: 'energy-body',
      label: eb.label,
      uri: `concept::energy-body::${eb.id}`,
      data: eb,
      aliases: eb.aliases,
    });
  }

  // Concepts
  for (const concept of CONCEPTS) {
    nodes.push({
      id: `concept::${concept.id}`,
      type: 'concept',
      label: concept.label,
      uri: `concept::concept::${concept.id}`,
      data: concept,
      aliases: concept.aliases,
    });
  }

  // Breakthrough categories
  for (const cat of BREAKTHROUGH_CATEGORIES) {
    nodes.push({
      id: `breakthrough-category::${cat.id}`,
      type: 'breakthrough',
      label: cat.label,
      uri: `concept::breakthrough-category::${cat.id}`,
      data: cat,
      aliases: [cat.label, cat.id],
    });
  }

  // Nadis
  for (const nadi of NADIS) {
    nodes.push({
      id: `nadi::${nadi.id}`,
      type: 'nadi',
      label: nadi.label,
      uri: `concept::nadi::${nadi.id}`,
      data: nadi,
      aliases: nadi.aliases,
    });
  }

  // Signal types
  for (const signal of SIGNAL_TYPES) {
    nodes.push({
      id: `signal::${signal.id}`,
      type: 'signal',
      label: signal.label,
      uri: `concept::signal::${signal.id}`,
      data: signal,
      aliases: signal.aliases,
    });
  }

  // Breakthroughs
  for (const bt of BREAKTHROUGH_TYPES) {
    nodes.push({
      id: `breakthrough::${bt.id}`,
      type: 'breakthrough',
      label: bt.name,
      uri: `concept::breakthrough::${bt.id}`,
      data: bt,
      aliases: [bt.name, bt.category, bt.rarity, ...bt.keywords],
    });
  }

  // Gurus / lineage masters
  for (const branch of SAPTARISHI) {
    const branchNodeId = `lineage::${branch.rishi.toLowerCase()}`;
    nodes.push({
      id: branchNodeId,
      type: 'lineage',
      label: `${branch.rishi} — ${branch.stream}`,
      uri: `concept::lineage::${branch.rishi.toLowerCase()}`,
      data: branch,
      aliases: [branch.rishi, branch.stream, branch.oneLine],
    });

    for (const master of branch.masters) {
      nodes.push({
        id: `guru::${master.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        type: 'guru',
        label: master.name,
        uri: `concept::guru::${master.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        data: { ...master, lineage: branch.rishi, stream: branch.stream },
        aliases: [master.name, master.era, branch.rishi],
      });
    }
  }

  // Behavior markers (Stage Handbook, classified into dimension/chakra/loops)
  for (const marker of classifyStageMarkers()) {
    nodes.push({
      id: marker.id,
      type: 'behavior-marker',
      label: marker.text,
      uri: `concept::behavior-marker::${marker.band}::${marker.index}`,
      data: marker,
      aliases: [marker.stageName, marker.stageSlug, `band ${marker.band}`],
    });
  }

  // Granthis — the three psychic knots of the subtle body
  for (const granthi of GRANTHIS) {
    nodes.push({
      id: `granthi::${granthi.id}`,
      type: 'granthi',
      label: granthi.name,
      uri: `concept::granthi::${granthi.id}`,
      data: granthi,
      aliases: [granthi.name, granthi.knotOf, `granthi ${granthi.id}`],
    });
  }

  // Kundalini signs — the behavioral/somatic signature of stirring ki
  for (const sign of KUNDALINI_SIGNS) {
    nodes.push({
      id: `kundalini-sign::${sign.id}`,
      type: 'kundalini-sign',
      label: sign.label,
      uri: `concept::kundalini-sign::${sign.id}`,
      data: sign,
      aliases: [sign.label, sign.tradition, sign.id],
    });
  }

  // Energy markers — behavioral signatures of prana/nadi dominance
  for (const marker of ENERGY_MARKERS) {
    nodes.push({
      id: `energy-marker::${marker.id}`,
      type: 'energy-marker',
      label: marker.label,
      uri: `concept::energy-marker::${marker.id}`,
      data: marker,
      aliases: [marker.label, marker.channel, marker.dominance, marker.id],
    });
  }

  return nodes;
}

export { KOSHAS, PRANAS, NADIS, SIGNAL_TYPES, ENERGY_BODIES, CONCEPTS, BREAKTHROUGH_CATEGORIES };
