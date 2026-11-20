/**
 * generate.ts — deterministic library generator.
 * Composes items from authored banks + lens variants to reach exact targets.
 * Every item is a pure function of (category, index) — stable across sessions.
 */

import { CATEGORY_SPECS, type CategorySpec } from "./manifest";
import { rngFor, pad5 } from "./rng";
import * as core from "./banks/core";
import { PRACTICES_OBSERVATION, PRACTICES_SELF_INQUIRY, PRACTICES_WITNESS, PRACTICES_BREATH_AWARENESS } from "./banks/practices-a";
import { PRACTICES_PRANAYAMA, PRACTICES_DHARANA, PRACTICES_DHYANA, PRACTICES_YOGA_NIDRA, PRACTICES_BODY_AWARENESS } from "./banks/practices-b";
import { PRACTICES_CHAKRA, PRACTICES_MANTRA, PRACTICES_JAPA, PRACTICES_TRAKATA } from "./banks/practices-c";
import { PRACTICES_MINDFULNESS, PRACTICES_SHADOW, PRACTICES_EMOTIONAL_REGULATION, PRACTICES_GRATITUDE, PRACTICES_COMPASSION, PRACTICES_DETACHMENT } from "./banks/practices-d";
import { PRACTICES_SENSORY, PRACTICES_ENERGY, PRACTICES_NATURE, PRACTICES_WALKING, PRACTICES_SLEEP, PRACTICES_MORNING, PRACTICES_EVENING } from "./banks/practices-e";
import { MICRO_BREATH, MICRO_BODY, MICRO_ATTENTION } from "./banks/micro-a";
import { MICRO_EMOTION, MICRO_MIND, MICRO_GRATITUDE } from "./banks/micro-b";
import { MICRO_COMPASSION, MICRO_SENSORY, MICRO_MOVEMENT, MICRO_REFLECTION } from "./banks/micro-c";
import { WISDOM_BHAGAVAD_GITA, WISDOM_UPANISHADS, WISDOM_YOGA_SUTRAS } from "./banks/wisdom-a";
import { WISDOM_ASHTAVAKRA, WISDOM_VIVEKACHUDAMANI, WISDOM_DHAMMAPADA } from "./banks/wisdom-b";
import { WISDOM_HATHA_YOGA_PRADIPIKA, WISDOM_BHAGAVATA_PURANA } from "./banks/wisdom-c";
import { WISDOM_ADVAITA, WISDOM_SAMKHYA } from "./banks/wisdom-d";
import { WISDOM_BUDDHISM, WISDOM_ZEN } from "./banks/wisdom-e";
import { WISDOM_TAOISM, WISDOM_STOICISM } from "./banks/wisdom-f";
import { WISDOM_SUFISM } from "./banks/wisdom-g";
import { WISDOM_MYSTICISM } from "./banks/wisdom-h";
import { WISDOM_EXISTENTIAL } from "./banks/wisdom-i";
import { WISDOM_PSYCHOLOGY } from "./banks/wisdom-j";
import { WISDOM_COGNITIVE_SCIENCE } from "./banks/wisdom-k";
import { WISDOM_NEUROSCIENCE } from "./banks/wisdom-l";
import { WISDOM_BEHAVIORAL_SCIENCE } from "./banks/wisdom-m";
import { WISDOM_PHILOSOPHY_OF_MIND } from "./banks/wisdom-n";
import { WISDOM_CONSCIOUSNESS_STUDIES } from "./banks/wisdom-o";
import { WISDOM_EXTRA_GITA, WISDOM_EXTRA_UPANISHADS, WISDOM_EXTRA_YOGA_SUTRAS, WISDOM_EXTRA_DHAMMAPADA, WISDOM_EXTRA_BUDDHISM, WISDOM_EXTRA_TAOISM, WISDOM_EXTRA_STOICISM } from "./banks/wisdom-extra";
import { WISDOM_EXTRA_SUFISM, WISDOM_EXTRA_MYSTICISM, WISDOM_EXTRA_EXISTENTIAL, WISDOM_EXTRA_PSYCHOLOGY } from "./banks/wisdom-extra-2";
import { WISDOM_EXTRA_3 } from "./banks/wisdom-extra-3";
import { WISDOM_EXTRA_4 } from "./banks/wisdom-extra-4";
import { WISDOM_EXTRA_5 } from "./banks/wisdom-extra-5";
import { GAMES_AWARENESS, GAMES_PSYCHOLOGICAL, GAMES_MEMORY, GAMES_PHILOSOPHICAL, GAMES_INTERACTIVE_STORY, GAMES_ATTENTION } from "./banks/games";
import { MEDITATIONS, JOURNALING, SELF_INQUIRY, CHALLENGES, RITUALS } from "./banks/experiences";
import { BREATHWORK, SOMATIC } from "./banks/breathwork-somatic";
import { COURSES, STORIES } from "./banks/courses-stories";
import { MISSIONS, TOOLS, ASSESSMENTS } from "./banks/missions-tools-assessments";
import { PODCASTS } from "./banks/podcasts";
import { LIFE_EXPERIMENTS, PSYCHOLOGICAL_PATTERNS, EMOTIONAL_EXPERIENCES, PERSONALITY_EXPLORATION, ARCHETYPES, CHAKRA_KNOWLEDGE, DREAM_EXPLORATION, RELATIONSHIP_EXERCISES, KARMA_EXPERIMENTS, CONCENTRATION_EXERCISES, CREATIVE_AWARENESS, NATURE_EXPERIENCES, REFLECTION_QUESTIONS, WISDOM_NARRATIVES } from "./banks/additional";

// ─── Type imports ───────────────────────────────────────────────────────────

import type { PracticeArchetype } from "./banks/types";
import type { MicroArchetype } from "./banks/types";
import type { WisdomArchetype } from "./banks/types";
import type { GameArchetype } from "./banks/types";
import type { ProgramArc } from "./banks/types";
import type { PodcastSeries } from "./banks/types";

// ─── Practice banks map ──────────────────────────────────────────────────────

const PRACTICE_BANKS: Record<string, PracticeArchetype[]> = {
  observation: PRACTICES_OBSERVATION,
  self_inquiry: PRACTICES_SELF_INQUIRY,
  witness_consciousness: PRACTICES_WITNESS,
  breath_awareness: PRACTICES_BREATH_AWARENESS,
  pranayama: PRACTICES_PRANAYAMA,
  dharana: PRACTICES_DHARANA,
  dhyana: PRACTICES_DHYANA,
  yoga_nidra: PRACTICES_YOGA_NIDRA,
  body_awareness: PRACTICES_BODY_AWARENESS,
  chakra_practices: PRACTICES_CHAKRA,
  mantra: PRACTICES_MANTRA,
  japa: PRACTICES_JAPA,
  trataka: PRACTICES_TRAKATA,
  mindfulness: PRACTICES_MINDFULNESS,
  shadow_work: PRACTICES_SHADOW,
  emotional_regulation: PRACTICES_EMOTIONAL_REGULATION,
  gratitude: PRACTICES_GRATITUDE,
  compassion: PRACTICES_COMPASSION,
  detachment: PRACTICES_DETACHMENT,
  sensory_awareness: PRACTICES_SENSORY,
  energy_awareness: PRACTICES_ENERGY,
  nature_connection: PRACTICES_NATURE,
  walking_meditation: PRACTICES_WALKING,
  sleep_practices: PRACTICES_SLEEP,
  morning_practices: PRACTICES_MORNING,
  evening_practices: PRACTICES_EVENING,
};

const MICRO_BANKS: Record<string, MicroArchetype[]> = {
  breath_micro: MICRO_BREATH,
  body_micro: MICRO_BODY,
  attention_micro: MICRO_ATTENTION,
  emotion_micro: MICRO_EMOTION,
  mind_micro: MICRO_MIND,
  gratitude_micro: MICRO_GRATITUDE,
  compassion_micro: MICRO_COMPASSION,
  sensory_micro: MICRO_SENSORY,
  movement_micro: MICRO_MOVEMENT,
  reflection_micro: MICRO_REFLECTION,
};

const WISDOM_BANKS: Record<string, WisdomArchetype[]> = {
  bhagavad_gita: WISDOM_BHAGAVAD_GITA,
  upanishads: WISDOM_UPANISHADS,
  yoga_sutras: WISDOM_YOGA_SUTRAS,
  ashtavakra_gita: WISDOM_ASHTAVAKRA,
  vivekachudamani: WISDOM_VIVEKACHUDAMANI,
  dhammapada: WISDOM_DHAMMAPADA,
  hatha_yoga_pradipika: WISDOM_HATHA_YOGA_PRADIPIKA,
  bhagavata_purana: WISDOM_BHAGAVATA_PURANA,
  advaita_vedanta: WISDOM_ADVAITA,
  samkhya: WISDOM_SAMKHYA,
  buddhism: WISDOM_BUDDHISM,
  zen: WISDOM_ZEN,
  taoism: WISDOM_TAOISM,
  stoicism: WISDOM_STOICISM,
  sufism: WISDOM_SUFISM,
  mysticism: WISDOM_MYSTICISM,
  existential_philosophy: WISDOM_EXISTENTIAL,
  psychology: WISDOM_PSYCHOLOGY,
  cognitive_science: WISDOM_COGNITIVE_SCIENCE,
  neuroscience: WISDOM_NEUROSCIENCE,
  behavioral_science: WISDOM_BEHAVIORAL_SCIENCE,
  philosophy_of_mind: WISDOM_PHILOSOPHY_OF_MIND,
  consciousness_studies: WISDOM_CONSCIOUSNESS_STUDIES,
};
WISDOM_BANKS.bhagavad_gita = [...WISDOM_BANKS.bhagavad_gita, ...WISDOM_EXTRA_GITA];
WISDOM_BANKS.upanishads = [...WISDOM_BANKS.upanishads, ...WISDOM_EXTRA_UPANISHADS];
WISDOM_BANKS.yoga_sutras = [...WISDOM_BANKS.yoga_sutras, ...WISDOM_EXTRA_YOGA_SUTRAS];
WISDOM_BANKS.dhammapada = [...WISDOM_BANKS.dhammapada, ...WISDOM_EXTRA_DHAMMAPADA];
WISDOM_BANKS.buddhism = [...WISDOM_BANKS.buddhism, ...WISDOM_EXTRA_BUDDHISM];
WISDOM_BANKS.taoism = [...WISDOM_BANKS.taoism, ...WISDOM_EXTRA_TAOISM];
WISDOM_BANKS.stoicism = [...WISDOM_BANKS.stoicism, ...WISDOM_EXTRA_STOICISM];
WISDOM_BANKS.sufism = [...WISDOM_BANKS.sufism, ...WISDOM_EXTRA_SUFISM];
WISDOM_BANKS.mysticism = [...WISDOM_BANKS.mysticism, ...WISDOM_EXTRA_MYSTICISM];
WISDOM_BANKS.existential_philosophy = [...WISDOM_BANKS.existential_philosophy, ...WISDOM_EXTRA_EXISTENTIAL];
WISDOM_BANKS.psychology = [...WISDOM_BANKS.psychology, ...WISDOM_EXTRA_PSYCHOLOGY];
for (const e of WISDOM_EXTRA_3) {
  const key = e.tradition.toLowerCase().replace(/ /g, "_");
  if (WISDOM_BANKS[key]) WISDOM_BANKS[key].push(e);
}

for (const e of WISDOM_EXTRA_4) {
  const key = e.tradition.toLowerCase().replace(/ /g, "_");
  if (WISDOM_BANKS[key]) WISDOM_BANKS[key].push(e);
}

for (const e of WISDOM_EXTRA_5) {
  const key = e.tradition.toLowerCase().replace(/ /g, "_");
  if (WISDOM_BANKS[key]) WISDOM_BANKS[key].push(e);
}




const GAME_BANKS: Record<string, GameArchetype[]> = {
  awareness_games: GAMES_AWARENESS,
  psychological_games: GAMES_PSYCHOLOGICAL,
  memory_games: GAMES_MEMORY,
  philosophical_games: GAMES_PHILOSOPHICAL,
  interactive_story_games: GAMES_INTERACTIVE_STORY,
  attention_games: GAMES_ATTENTION,
};

const MEDITATION_BANKS: Record<string, any[]> = {
  guided: MEDITATIONS.filter((m) => m.concept.includes("Guided")),
  unguided: MEDITATIONS.filter((m) => m.concept.includes("Unguided")),
  body_scan: MEDITATIONS.filter((m) => m.concept.includes("Body Scan")),
  loving_kindness: MEDITATIONS.filter((m) => m.concept.includes("Loving-Kindness")),
  sleep: MEDITATIONS.filter((m) => m.concept.includes("Sleep")),
  morning: MEDITATIONS.filter((m) => m.concept.includes("Morning")),
  evening: MEDITATIONS.filter((m) => m.concept.includes("Evening")),
  walking: MEDITATIONS.filter((m) => m.concept.includes("Walking")),
  mantra: MEDITATIONS.filter((m) => m.concept.includes("Mantra")),
  silence: MEDITATIONS.filter((m) => m.concept.includes("Silence")),
};

const JOURNALING_BANKS: Record<string, any[]> = {
  free_write: JOURNALING.filter((j) => j.concept.includes("Free Write")),
  prompted: JOURNALING.filter((j) => j.concept.includes("Prompted")),
  gratitude: JOURNALING.filter((j) => j.concept.includes("Gratitude")),
  shadow: JOURNALING.filter((j) => j.concept.includes("Shadow")),
  reflection: JOURNALING.filter((j) => j.concept.includes("Reflection") || j.concept.includes("Weekly Review")),
  dream: JOURNALING.filter((j) => j.concept.includes("Dream")),
  emotion: JOURNALING.filter((j) => j.concept.includes("Emotion")),
  decision: JOURNALING.filter((j) => j.concept.includes("Decision")),
  relationship: JOURNALING.filter((j) => j.concept.includes("Relationship")),
  growth: JOURNALING.filter((j) => j.concept.includes("Growth")),
};

const SELF_INQUIRY_BANKS: Record<string, any[]> = {
  who_am_i: SELF_INQUIRY.filter((s) => s.concept.includes("Who Am I")),
  neti_neti: SELF_INQUIRY.filter((s) => s.concept.includes("Neti Neti")),
  witness: SELF_INQUIRY.filter((s) => s.concept.includes("The Witness")),
  ego: SELF_INQUIRY.filter((s) => s.concept.includes("The Ego")),
  identity: SELF_INQUIRY.filter((s) => s.concept.includes("The Identity")),
  belief: SELF_INQUIRY.filter((s) => s.concept.includes("The Belief")),
  desire: SELF_INQUIRY.filter((s) => s.concept.includes("The Desire")),
  fear: SELF_INQUIRY.filter((s) => s.concept.includes("The Fear")),
  attachment: SELF_INQUIRY.filter((s) => s.concept.includes("The Attachment")),
  freedom: SELF_INQUIRY.filter((s) => s.concept.includes("The Freedom")),
};

const CHALLENGE_BANKS: Record<string, any[]> = {
  daily: CHALLENGES.filter((c) => c.concept.includes("Daily")),
  weekly: CHALLENGES.filter((c) => c.concept.includes("Weekly")),
  monthly: CHALLENGES.filter((c) => c.concept.includes("Monthly")),
  streak: CHALLENGES.filter((c) => c.concept.includes("Streak")),
  exploration: CHALLENGES.filter((c) => c.concept.includes("Exploration")),
  mastery: CHALLENGES.filter((c) => c.concept.includes("Mastery")),
  social: CHALLENGES.filter((c) => c.concept.includes("Social")),
  solo: CHALLENGES.filter((c) => c.concept.includes("Solo")),
  creative: CHALLENGES.filter((c) => c.concept.includes("Creative")),
  physical: CHALLENGES.filter((c) => c.concept.includes("Physical")),
};

const RITUAL_BANKS: Record<string, any[]> = {
  morning: RITUALS.filter((r) => r.concept.includes("Morning")),
  evening: RITUALS.filter((r) => r.concept.includes("Evening")),
  seasonal: RITUALS.filter((r) => r.concept.includes("Seasonal")),
  life_transition: RITUALS.filter((r) => r.concept.includes("Life Transition")),
  gratitude: RITUALS.filter((r) => r.concept.includes("Gratitude")),
  healing: RITUALS.filter((r) => r.concept.includes("Healing")),
  connection: RITUALS.filter((r) => r.concept.includes("Connection")),
  solitude: RITUALS.filter((r) => r.concept.includes("Solitude")),
  celebration: RITUALS.filter((r) => r.concept.includes("Celebration")),
  release: RITUALS.filter((r) => r.concept.includes("Release")),
};

const BREATHWORK_BANKS: Record<string, any[]> = {
  box: BREATHWORK.filter((b) => b.breathworkType === "box"),
  coherent: BREATHWORK.filter((b) => b.breathworkType === "coherent"),
  wim_hof: BREATHWORK.filter((b) => b.breathworkType === "wim_hof"),
  bhastrika: BREATHWORK.filter((b) => b.breathworkType === "bhastrika"),
  nadi_shodhana: BREATHWORK.filter((b) => b.breathworkType === "nadi_shodhana"),
  ujjayi: BREATHWORK.filter((b) => b.breathworkType === "ujjayi"),
  sheetali: BREATHWORK.filter((b) => b.breathworkType === "sheetali"),
  kapalabhati: BREATHWORK.filter((b) => b.breathworkType === "kapalabhati"),
  sigh: BREATHWORK.filter((b) => b.breathworkType === "sigh"),
  custom: BREATHWORK.filter((b) => b.breathworkType === "custom"),
};

const SOMATIC_BANKS: Record<string, any[]> = {
  body_scan: SOMATIC.filter((s) => s.somaticType === "body_scan"),
  tension_release: SOMATIC.filter((s) => s.somaticType === "tension_release"),
  grounding: SOMATIC.filter((s) => s.somaticType === "grounding"),
  movement: SOMATIC.filter((s) => s.somaticType === "movement"),
  touch: SOMATIC.filter((s) => s.somaticType === "touch"),
  sensation: SOMATIC.filter((s) => s.somaticType === "sensation"),
  energy: SOMATIC.filter((s) => s.somaticType === "energy"),
  posture: SOMATIC.filter((s) => s.somaticType === "posture"),
  breath_body: SOMATIC.filter((s) => s.somaticType === "breath_body"),
  trauma_informed: SOMATIC.filter((s) => s.somaticType === "trauma_informed"),
};

const COURSE_BANKS: Record<string, any[]> = {
  foundation: COURSES.filter((c) => c.courseType === "foundation"),
  advanced: COURSES.filter((c) => c.courseType === "advanced"),
  specialty: COURSES.filter((c) => c.courseType === "specialty"),
  certification: COURSES.filter((c) => c.courseType === "certification"),
  workshop: COURSES.filter((c) => c.courseType === "workshop"),
  masterclass: COURSES.filter((c) => c.courseType === "masterclass"),
  series: COURSES.filter((c) => c.courseType === "series"),
  module: COURSES.filter((c) => c.courseType === "module"),
  path: COURSES.filter((c) => c.courseType === "path"),
  elective: COURSES.filter((c) => c.courseType === "elective"),
};

const STORY_BANKS: Record<string, any[]> = {
  indian: STORIES.filter((s) => s.storyType === "indian"),
  zen: STORIES.filter((s) => s.storyType === "zen"),
  sufi: STORIES.filter((s) => s.storyType === "sufi"),
  taoist: STORIES.filter((s) => s.storyType === "taoist"),
  modern: STORIES.filter((s) => s.storyType === "modern"),
  personal: STORIES.filter((s) => s.storyType === "personal"),
  mythological: STORIES.filter((s) => s.storyType === "mythological"),
  historical: STORIES.filter((s) => s.storyType === "historical"),
  fictional: STORIES.filter((s) => s.storyType === "fictional"),
  biographical: STORIES.filter((s) => s.storyType === "biographical"),
};

const MISSION_BANKS: Record<string, any[]> = {
  awareness: MISSIONS.filter((m) => m.missionType === "awareness"),
  action: MISSIONS.filter((m) => m.missionType === "action"),
  reflection: MISSIONS.filter((m) => m.missionType === "reflection"),
  connection: MISSIONS.filter((m) => m.missionType === "connection"),
  creativity: MISSIONS.filter((m) => m.missionType === "creativity"),
  service: MISSIONS.filter((m) => m.missionType === "service"),
  learning: MISSIONS.filter((m) => m.missionType === "learning"),
  health: MISSIONS.filter((m) => m.missionType === "health"),
  rest: MISSIONS.filter((m) => m.missionType === "rest"),
  growth: MISSIONS.filter((m) => m.missionType === "growth"),
};

const TOOL_BANKS: Record<string, any[]> = {
  timer: TOOLS.filter((t) => t.toolType === "timer"),
  breath_pacer: TOOLS.filter((t) => t.toolType === "breath_pacer"),
  mood_tracker: TOOLS.filter((t) => t.toolType === "mood_tracker"),
  journal: TOOLS.filter((t) => t.toolType === "journal"),
  habit_tracker: TOOLS.filter((t) => t.toolType === "habit_tracker"),
  progress_chart: TOOLS.filter((t) => t.toolType === "progress_chart"),
  sound_mixer: TOOLS.filter((t) => t.toolType === "sound_mixer"),
  visualization: TOOLS.filter((t) => t.toolType === "visualization"),
  assessment: TOOLS.filter((t) => t.toolType === "assessment"),
  planner: TOOLS.filter((t) => t.toolType === "planner"),
};

const ASSESSMENT_BANKS: Record<string, any[]> = {
  personality: ASSESSMENTS.filter((a) => a.assessmentType === "personality"),
  consciousness: ASSESSMENTS.filter((a) => a.assessmentType === "consciousness"),
  emotion: ASSESSMENTS.filter((a) => a.assessmentType === "emotion"),
  cognition: ASSESSMENTS.filter((a) => a.assessmentType === "cognition"),
  stress: ASSESSMENTS.filter((a) => a.assessmentType === "stress"),
  wellbeing: ASSESSMENTS.filter((a) => a.assessmentType === "wellbeing"),
  relationship: ASSESSMENTS.filter((a) => a.assessmentType === "relationship"),
  purpose: ASSESSMENTS.filter((a) => a.assessmentType === "purpose"),
  values: ASSESSMENTS.filter((a) => a.assessmentType === "values"),
  growth: ASSESSMENTS.filter((a) => a.assessmentType === "growth"),
};

const PODCAST_BANKS: Record<string, any[]> = {
  guided_meditations: PODCASTS.filter((p) => p.podcastType === "guided_meditations"),
  yogic_wisdom: PODCASTS.filter((p) => p.podcastType === "yogic_wisdom"),
  philosophical_conversations: PODCASTS.filter((p) => p.podcastType === "philosophical_conversations"),
  self_inquiry_audio: PODCASTS.filter((p) => p.podcastType === "self_inquiry_audio"),
  sleep_stories: PODCASTS.filter((p) => p.podcastType === "sleep_stories"),
  morning_reflections: PODCASTS.filter((p) => p.podcastType === "morning_reflections"),
  evening_reflections: PODCASTS.filter((p) => p.podcastType === "evening_reflections"),
  spiritual_storytelling: PODCASTS.filter((p) => p.podcastType === "spiritual_storytelling"),
  psychology_explainers: PODCASTS.filter((p) => p.podcastType === "psychology_explainers"),
  breathwork_guidance: PODCASTS.filter((p) => p.podcastType === "breathwork_guidance"),
  sound_experiences: PODCASTS.filter((p) => p.podcastType === "sound_experiences"),
  silence_experiences: PODCASTS.filter((p) => p.podcastType === "silence_experiences"),
  mantra_chanting: PODCASTS.filter((p) => p.podcastType === "mantra_chanting"),
  nature_soundscapes: PODCASTS.filter((p) => p.podcastType === "nature_soundscapes"),
  guided_journeys: PODCASTS.filter((p) => p.podcastType === "guided_journeys"),
};

const ADDITIONAL_BANKS: Record<string, any[]> = {
  life_experiments: LIFE_EXPERIMENTS,
  psychological_patterns: PSYCHOLOGICAL_PATTERNS,
  emotional_experiences: EMOTIONAL_EXPERIENCES,
  personality_exploration: PERSONALITY_EXPLORATION,
  archetype_library: ARCHETYPES,
  chakra_knowledge: CHAKRA_KNOWLEDGE,
  dream_exploration: DREAM_EXPLORATION,
  relationship_exercises: RELATIONSHIP_EXERCISES,
  karma_experiments: KARMA_EXPERIMENTS,
  concentration_exercises: CONCENTRATION_EXERCISES,
  creative_awareness: CREATIVE_AWARENESS,
  nature_experiences: NATURE_EXPERIENCES,
  reflection_questions: REFLECTION_QUESTIONS,
  stories_wisdom_narratives: WISDOM_NARRATIVES,
};

// ─── Lenses for variant composition ─────────────────────────────────────────

const PRACTICE_LENSES = ["Morning", "Evening", "For Anxiety", "For Focus", "Deep", "Gentle", "Quick", "Extended", "Restorative", "Energizing"];
const MICRO_LENSES = ["When Stressed", "Before Sleep", "On Waking", "In the Queue", "At the Desk", "In Transit", "After Conflict", "Before a Meeting", "During a Break", "At Bedtime"];
const WISDOM_LENSES = ["Applied to Work", "Applied to Relationships", "Applied to Leadership", "Applied to Parenting", "Applied to Adversity", "Applied to Creativity", "Applied to Health", "Applied to Aging"];
const GAME_LENSES = ["Beginner", "Intermediate", "Advanced", "Speed Run", "Deep Dive", "Timed", "Untimed", "Solo", "Partnered", "Daily"];
const PROGRAM_THEMES = ["Witness", "Mind", "Patterns", "Emotional", "Detachment", "Inquiry", "Attention", "Relationships", "Silence", "Sleep", "Yogic Lifestyle", "Ego", "Concentration", "Discipline", "Custom"];
const PROGRAM_DURATIONS = [7, 14, 21, 30, 40, 90];
const EXPERIENCE_LENSES = ["Morning", "Evening", "For Beginners", "For Advanced", "Short", "Extended", "Guided", "Unguided", "For Sleep", "For Focus"];

// ─── Common item builder ─────────────────────────────────────────────────────

const DIMS = core.DIMENSIONS as readonly string[];
const DOMAINS = core.LIFE_DOMAINS as readonly string[];
const PATHS = core.YOGA_PATHS as readonly string[];
const BANDS = core.BANDS as readonly string[];
const PROFILES = core.PROFILES as readonly string[];
const DIFFS = ["beginner", "intermediate", "advanced", "all"] as const;

const DIFF_TO_BANDS: Record<string, string[]> = {
  beginner: ["0-2", "3-5", "all"],
  intermediate: ["3-5", "6-8", "all"],
  advanced: ["6-8", "9-10", "all"],
  all: ["0-2", "3-5", "6-8", "9-10", "all"],
};

function pickDims(rng: any, min = 1, max = 3): string[] {
  const n = rng.int(min, max);
  const pool = [...DIMS];
  const out: string[] = [];
  while (pool.length && out.length < n) {
    out.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]);
  }
  return out;
}
function pickDomains(rng: any, min = 1, max = 3): string[] {
  const n = rng.int(min, max);
  const pool = [...DOMAINS];
  const out: string[] = [];
  while (pool.length && out.length < n) {
    out.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]);
  }
  return out;
}
function pickPaths(rng: any, min = 1, max = 2): string[] {
  const n = rng.int(min, max);
  const pool = [...PATHS];
  const out: string[] = [];
  while (pool.length && out.length < n) {
    out.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]);
  }
  return out;
}
function pickTags(rng: any, pool: string[], min = 5, max = 8): string[] {
  const n = rng.int(min, max);
  const copy = [...pool];
  const out: string[] = [];
  while (copy.length && out.length < n) {
    out.push(copy.splice(rng.int(0, copy.length - 1), 1)[0]);
  }
  return [...new Set(out)];
}

const TAG_POOL = [...core.EMOTION_TAGS, ...core.PRACTICE_TYPE_TAGS, ...core.CONTEXT_TAGS, ...core.TRADITION_TAGS, ...core.FACULTY_TAGS, ...core.QUALITY_TAGS];

function makeCommon(rng: any, type: string, category: string, subcategory: string, title: string, description: string, difficulty: string, dims: string[], domains: string[], paths: string[], duration?: number | null, tags?: string[]): any {
  return {
    id: "", // filled later
    title,
    description,
    short_description: description.slice(0, 60),
    type,
    category,
    subcategory,
    duration_minutes: duration === undefined ? null : duration,
    difficulty,
    consciousness_dimensions: dims,
    life_domains: domains,
    yoga_paths: paths,
    suitable_bands: DIFF_TO_BANDS[difficulty] || DIFF_TO_BANDS.all,
    suitable_profiles: rng.picks([...PROFILES], rng.int(1, 3)),
    prerequisites: [],
    tags: tags && tags.length >= 5 ? tags : pickTags(rng, TAG_POOL, 5, 8),
    related_items: [],
    source: "original",
    provenance: "ConsciousOS original",
    quality_score: rng.float(0.75, 0.95),
    review_status: "published",
    version: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    published_at: "2026-01-01T00:00:00.000Z",
  };
}

// ─── Practice generator ──────────────────────────────────────────────────────

function genPractices(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  const subSpecs = spec.subcategories;
  for (const sub of subSpecs) {
    const bank = PRACTICE_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) {
      // fallback: generate from a generic template
      for (let i = 0; i < target; i++) {
        const rng = rngFor(`practice-${sub.slug}-${i}`);
        const id = `practice-${pad5(idx++)}`;
        const diff = rng.pick(DIFFS as any);
        const dims = pickDims(rng, 2, 3);
        const domains = pickDomains(rng, 1, 3);
        const paths = pickPaths(rng, 1, 2);
        const dur = rng.int(3, 30);
        const item = makeCommon(rng, "practice", spec.slug, sub.slug, `${sub.name} Practice ${i + 1}`, `A ${diff} practice focusing on ${sub.slug.replace(/_/g, " ")} for ${dur} minutes.`, diff, dims, domains, paths, dur, pickTags(rng, TAG_POOL, 5, 8));
        item.id = id;
        item.content = {
          objective: `Develop ${sub.slug.replace(/_/g, " ")} awareness and capacity.`,
          instructions: ["Find a comfortable position and close your eyes.", "Notice what is present in your awareness right now.", "Do not try to change anything — simply observe.", "When you notice the mind judging, return to neutral observation.", "Continue for the full duration.", "End by taking three deep breaths."],
          session_steps: [
            { order: 1, type: "instruction", title: "Step 1", content: "Find a comfortable position and close your eyes.", duration_seconds: Math.round(dur * 60 / 6) },
            { order: 2, type: "practice", title: "Step 2", content: "Notice what is present in your awareness right now.", duration_seconds: Math.round(dur * 60 / 6) },
            { order: 3, type: "practice", title: "Step 3", content: "Do not try to change anything — simply observe.", duration_seconds: Math.round(dur * 60 / 6) },
            { order: 4, type: "practice", title: "Step 4", content: "When you notice the mind judging, return to neutral observation.", duration_seconds: Math.round(dur * 60 / 6) },
            { order: 5, type: "practice", title: "Step 5", content: "Continue for the full duration.", duration_seconds: Math.round(dur * 60 / 6) },
            { order: 6, type: "reflection", title: "Step 6", content: "End by taking three deep breaths.", duration_seconds: Math.round(dur * 60 / 6) },
          ],
          required_widgets: ["timer"],
          expected_experience: `A sense of deeper ${sub.slug.replace(/_/g, " ")} awareness.`,
          contraindications: [],
          safety_notes: "Safe for all. Stop if uncomfortable.",
        };
        items.push(item);
      }
      continue;
    }
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    outer: for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`practice-${sub.slug}-${ai}-${v}`);
        const lens = PRACTICE_LENSES[v % PRACTICE_LENSES.length];
        const id = `practice-${pad5(idx++)}`;
        const diff = v % 3 === 0 ? arch.difficulty : rng.pick(DIFFS as any);
        const dims = v % 2 === 0 ? [...arch.dimensions] : pickDims(rng, 2, 3);
        const domains = v % 2 === 0 ? [...arch.domains] : pickDomains(rng, 1, 3);
        const paths = v % 2 === 0 ? [...arch.paths] : pickPaths(rng, 1, 2);
        const dur = Math.max(3, Math.min(30, arch.baseDuration + rng.int(-3, 5)));
        const title = v === 0 ? arch.name : `${arch.name} — ${lens}`;
        const item = makeCommon(rng, "practice", spec.slug, sub.slug, title, arch.objective.slice(0, 200), diff, dims, domains, paths, dur, [...arch.tags, lens.toLowerCase().replace(/\s+/g, "_")]);
        item.id = id;
        item.content = {
          objective: v === 0 ? arch.objective : `${arch.objective} (${lens} variation.)`,
          instructions: arch.instructions,
          session_steps: arch.steps.map((s, i) => ({
            order: i + 1,
            type: s.type,
            title: s.title,
            content: s.content,
            duration_seconds: Math.round(dur * 60 / arch.steps.length),
            widget_id: arch.widgets[i % arch.widgets.length],
          })),
          required_widgets: arch.widgets,
          expected_experience: arch.experience,
          contraindications: arch.contraindications,
          safety_notes: arch.safety,
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Micro practice generator ────────────────────────────────────────────────

function genMicro(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = MICRO_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`micro-${sub.slug}-${ai}-${v}`);
        const lens = MICRO_LENSES[v % MICRO_LENSES.length];
        const id = `micro_practice-${pad5(idx++)}`;
        const durSec = Math.max(10, Math.min(180, arch.durationSeconds + rng.int(-10, 20)));
        const item = makeCommon(rng, "micro_practice", spec.slug, sub.slug, v === 0 ? arch.name : `${arch.name} — ${lens}`, arch.objective.slice(0, 200), "beginner", [...arch.dimensions], [...arch.domains], [...arch.paths], Math.round(durSec / 60) || 1, [...arch.tags, lens.toLowerCase().replace(/\s+/g, "_")]);
        item.id = id;
        item.duration_minutes = undefined;
        item.content = {
          objective: arch.objective,
          instruction: arch.instruction,
          duration_seconds: durSec,
          trigger_context: arch.trigger,
          expected_experience: arch.experience,
          widget_id: arch.widgets[0],
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Wisdom generator ────────────────────────────────────────────────────────

function genWisdom(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = WISDOM_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`wisdom-${sub.slug}-${ai}-${v}`);
        const lens = WISDOM_LENSES[v % WISDOM_LENSES.length];
        const id = `wisdom-${pad5(idx++)}`;
        const diff = v % 4 === 0 ? arch.difficulty : rng.pick(DIFFS as any);
        const item = makeCommon(rng, "wisdom", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — ${lens}`, arch.explanation.slice(0, 200), diff, [...arch.dimensions], [...arch.domains], [...arch.paths], arch.minutes, [...arch.tags, lens.toLowerCase().replace(/\s+/g, "_")]);
        item.id = id;
        item.content = {
          concept: arch.concept,
          explanation: arch.explanation,
          practical_application: v === 0 ? arch.application : `${arch.application} (${lens} lens.)`,
          reflection_questions: arch.questions,
          references: arch.references,
          original_text_excerpt: arch.excerpt,
          evidence_type: arch.evidence,
          modern_interpretation: v % 3 === 0 ? `Modern interpretation: ${arch.explanation.slice(0, 100)}` : undefined,
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Game generator ─────────────────────────────────────────────────────────

function genGames(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = GAME_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`game-${sub.slug}-${ai}-${v}`);
        const lens = GAME_LENSES[v % GAME_LENSES.length];
        const id = `game-${pad5(idx++)}`;
        const diff = v % 3 === 0 ? arch.difficulty : rng.pick(DIFFS as any);
        const item = makeCommon(rng, "game", spec.slug, sub.slug, v === 0 ? arch.name : `${arch.name} — ${lens}`, arch.description.slice(0, 200), diff, [...arch.dimensions], [...arch.domains], [...arch.paths], arch.rounds * arch.secondsPerRound / 60 || 3, [...arch.tags, lens.toLowerCase().replace(/\s+/g, "_")]);
        item.id = id;
        item.content = {
          game_type: arch.gameType,
          objective: arch.objective,
          mechanics: { ...arch.mechanics, difficulty_levels: arch.mechanics.difficulty_levels || ["beginner", "intermediate", "advanced"] },
          scoring_rules: arch.scoring,
          observation_outputs: arch.observations,
          estimated_minutes: Math.max(1, Math.round(arch.rounds * arch.secondsPerRound / 60)),
          replayable: true,
          levels: arch.levels,
          achievements: [{ id: `ach-${ai}-${v}`, name: `${arch.name} Master`, description: `Complete ${arch.name} with 90%+ score` }],
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Program generator ───────────────────────────────────────────────────────

function genPrograms(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  const themeNames = ["Witness Training", "Mind Understanding", "Pattern Breaking", "Emotional Mastery", "Detachment Art", "Deep Self-Inquiry", "Attention Mastery", "Conscious Relationships", "Inner Pattern Discovery", "Silence and Stillness", "Sleep Transformation", "Yogic Lifestyle", "Ego Understanding", "Concentration Development", "Inner Discipline"];
  for (const sub of spec.subcategories) {
    const target = sub.count;
    const theme = sub.name;
    for (let i = 0; i < target; i++) {
      const rng = rngFor(`program-${sub.slug}-${i}`);
      const id = `program-${pad5(idx++)}`;
      const dur = rng.pick(PROGRAM_DURATIONS as any);
      const dailyMin = rng.int(5, 30);
      const diff = rng.pick(DIFFS as any);
      const dims = pickDims(rng, 3, 4);
      const domains = pickDomains(rng, 2, 4);
      const paths = pickPaths(rng, 2, 3);
      const title = `${theme} Program ${i + 1}`;
      const item = makeCommon(rng, "program", spec.slug, sub.slug, title, `A ${dur}-day structured transformation journey: ${theme.toLowerCase()}.`, diff, dims, domains, paths, null, pickTags(rng, TAG_POOL, 5, 8));
      item.id = id;
      // generate days
      const days: any[] = [];
      for (let d = 1; d <= dur; d++) {
        days.push({
          day_number: d,
          title: `Day ${d}: ${theme} Practice`,
          description: `Daily session for day ${d} of the ${theme.toLowerCase()} program.`,
          practice_ids: [`practice-${pad5(rng.int(1, 1800))}`],
          wisdom_ids: [`wisdom-${pad5(rng.int(1, 1200))}`],
          reflection_prompt: `What did you notice on day ${d}?`,
          mission: `Complete the day ${d} practice and reflect.`,
          assessment_id: d % 7 === 0 ? `assessment-${pad5(rng.int(1, 150))}` : undefined,
        });
      }
      item.content = {
        duration_days: dur,
        daily_time_minutes: dailyMin,
        completion_criteria: `Complete all ${dur} days`,
        has_certificate: dur >= 21,
        target_audience: diff === "beginner" ? "Beginners" : diff === "advanced" ? "Advanced practitioners" : "All levels",
        days,
      };
      items.push(item);
    }
  }
  return items;
}

// ─── Podcast generator ───────────────────────────────────────────────────────

function genPodcasts(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = PODCAST_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`podcast-${sub.slug}-${ai}-${v}`);
        const id = `podcast-${pad5(idx++)}`;
        const item = makeCommon(rng, "podcast", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Episode ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], arch.minutes, [...arch.tags]);
        item.id = id;
        item.content = {
          podcast_type: sub.slug,
          audio_url: `https://cdn.consciousos.app/audio/podcast-${pad5(idx)}.mp3`,
          host: "ConsciousOS",
          duration_minutes: arch.minutes,
          episode_number: v + 1,
          series_name: arch.concept,
          show_notes: arch.application,
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Meditation generator ───────────────────────────────────────────────────

function genMeditations(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  const medTypes = ["guided", "unguided", "body_scan", "loving_kindness", "sleep", "morning", "evening", "walking", "mantra", "silence"];
  for (const sub of spec.subcategories) {
    const bank = MEDITATION_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`meditation-${sub.slug}-${ai}-${v}`);
        const lens = EXPERIENCE_LENSES[v % EXPERIENCE_LENSES.length];
        const id = `meditation-${pad5(idx++)}`;
        const dur = Math.max(3, Math.min(30, arch.minutes + rng.int(-3, 5)));
        const item = makeCommon(rng, "meditation", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — ${lens}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], dur, [...arch.tags, lens.toLowerCase().replace(/\s+/g, "_")]);
        item.id = id;
        item.content = {
          meditation_type: sub.slug,
          guidance_style: sub.slug === "unguided" || sub.slug === "silence" ? "none" : "voice",
          focus_object: arch.concept,
          posture: "Comfortable seated position",
          steps: [
            { order: 1, instruction: "Settle into a comfortable position.", duration_seconds: 30 },
            { order: 2, instruction: arch.explanation.slice(0, 100), duration_seconds: Math.round(dur * 60 * 0.8) },
            { order: 3, instruction: "Rest and notice what is present.", duration_seconds: 30 },
          ],
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Journaling generator ────────────────────────────────────────────────────

function genJournaling(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  const jTypes = ["free_write", "prompted", "gratitude", "shadow", "reflection", "dream", "emotion", "decision", "relationship", "growth"];
  for (const sub of spec.subcategories) {
    const bank = JOURNALING_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`journaling-${sub.slug}-${ai}-${v}`);
        const lens = EXPERIENCE_LENSES[v % EXPERIENCE_LENSES.length];
        const id = `journaling-${pad5(idx++)}`;
        const item = makeCommon(rng, "journaling", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — ${lens}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], rng.int(5, 20), [...arch.tags, lens.toLowerCase().replace(/\s+/g, "_")]);
        item.id = id;
        item.content = {
          journal_type: sub.slug,
          prompts: [arch.application, `Reflect on: ${arch.concept}`, `What did you notice?`],
          structure: { sections: ["Opening", "Body", "Closing"], time_limit_minutes: rng.int(5, 20) },
          follow_up_questions: arch.questions,
          reflection_guidance: arch.application,
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Self-inquiry generator ──────────────────────────────────────────────────

function genSelfInquiry(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = SELF_INQUIRY_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`self_inquiry-${sub.slug}-${ai}-${v}`);
        const lens = EXPERIENCE_LENSES[v % EXPERIENCE_LENSES.length];
        const id = `self_inquiry-${pad5(idx++)}`;
        const item = makeCommon(rng, "self_inquiry", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — ${lens}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], rng.int(5, 20), [...arch.tags, lens.toLowerCase().replace(/\s+/g, "_")]);
        item.id = id;
        item.content = {
          inquiry_type: sub.slug,
          core_question: arch.concept.includes("?") ? arch.concept : `What is ${sub.slug.replace(/_/g, " ")}?`,
          inquiry_steps: [
            { step: 1, instruction: "Sit in a quiet place with spine erect.", duration_seconds: 60 },
            { step: 2, instruction: arch.explanation.slice(0, 100), duration_seconds: 120 },
            { step: 3, instruction: "Rest in the space between question and answer.", duration_seconds: 60 },
          ],
          deepening_questions: arch.questions,
          common_responses: ["I don't know", "Silence", "A feeling", "An image"],
          guidance_notes: arch.application,
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Challenge generator ────────────────────────────────────────────────────

function genChallenges(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = CHALLENGE_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`challenge-${sub.slug}-${ai}-${v}`);
        const id = `challenge-${pad5(idx++)}`;
        const dur = rng.int(1, 30);
        const item = makeCommon(rng, "challenge", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Level ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], null, [...arch.tags]);
        item.id = id;
        item.content = {
          challenge_type: sub.slug,
          duration_days: dur,
          daily_task: arch.application,
          completion_criteria: `Complete all ${dur} days`,
          difficulty_progression: "Gradual increase",
          rewards: { xp: rng.int(50, 200), badge: `${sub.slug}_badge`, unlock: `unlock_${sub.slug}` },
          community: rng.chance(0.3),
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Ritual generator ───────────────────────────────────────────────────────

function genRituals(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = RITUAL_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`ritual-${sub.slug}-${ai}-${v}`);
        const id = `ritual-${pad5(idx++)}`;
        const dur = rng.int(5, 30);
        const item = makeCommon(rng, "ritual", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Variation ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], dur, [...arch.tags]);
        item.id = id;
        item.content = {
          ritual_type: sub.slug,
          occasion: sub.slug === "morning" ? "Dawn" : sub.slug === "evening" ? "Dusk" : "As needed",
          duration_minutes: dur,
          steps: [
            { order: 1, action: "Settle and center.", duration_seconds: 30, materials: [] },
            { order: 2, action: arch.application, duration_seconds: dur * 60 - 60, materials: [] },
            { order: 3, action: "Close with gratitude.", duration_seconds: 30, materials: [] },
          ],
          materials_needed: [],
          intention: arch.concept,
          closing: "Rest in the ritual's residue.",
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Breathwork generator ───────────────────────────────────────────────────

function genBreathwork(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = BREATHWORK_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`breathwork-${sub.slug}-${ai}-${v}`);
        const id = `breathwork-${pad5(idx++)}`;
        const item = makeCommon(rng, "breathwork", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Variation ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], arch.minutes, [...arch.tags]);
        item.id = id;
        item.content = {
          breathwork_type: sub.slug,
          pattern: { inhale_seconds: rng.int(3, 6), hold_seconds: rng.int(0, 4), exhale_seconds: rng.int(3, 8), hold_empty_seconds: rng.int(0, 3), rounds: rng.int(4, 12) },
          instructions: [arch.explanation, arch.application],
          safety_notes: "Practice seated. Never force the breath. Stop on dizziness.",
          contraindications: ["pregnancy (retained breath)", "uncontrolled hypertension", "recent abdominal surgery"],
          expected_effects: [arch.application],
          difficulty_level: arch.difficulty,
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Somatic generator ──────────────────────────────────────────────────────

function genSomatic(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = SOMATIC_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`somatic-${sub.slug}-${ai}-${v}`);
        const id = `somatic-${pad5(idx++)}`;
        const item = makeCommon(rng, "somatic", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Variation ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], arch.minutes, [...arch.tags]);
        item.id = id;
        item.content = {
          somatic_type: sub.slug,
          body_focus: ["whole body"],
          instructions: [arch.explanation, arch.application],
          expected_sensations: ["warmth", "tingling", "release"],
          safety_notes: "Go gently. Stop if uncomfortable.",
          trauma_sensitive: sub.slug === "trauma_informed",
          modifications: ["Shorter duration", "Eyes open", "Seated instead of lying"],
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Course generator ────────────────────────────────────────────────────────

function genCourses(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = COURSE_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`course-${sub.slug}-${ai}-${v}`);
        const id = `course-${pad5(idx++)}`;
        const dur = rng.int(2, 12);
        const item = makeCommon(rng, "course", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Level ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], null, [...arch.tags]);
        item.id = id;
        item.content = {
          course_type: sub.slug,
          duration_weeks: dur,
          modules: [
            { module_number: 1, title: "Foundation", description: "Introduction to the topic.", lessons: rng.int(3, 8), practices: [`practice-${pad5(rng.int(1, 1800))}`], assessments: [`assessment-${pad5(rng.int(1, 150))}`] },
            { module_number: 2, title: "Deepening", description: "Advanced study.", lessons: rng.int(3, 8), practices: [`practice-${pad5(rng.int(1, 1800))}`], assessments: [`assessment-${pad5(rng.int(1, 150))}`] },
          ],
          learning_objectives: [arch.application],
          prerequisites: [],
          certificate: dur >= 8,
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Story generator ────────────────────────────────────────────────────────

function genStories(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = STORY_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`story-${sub.slug}-${ai}-${v}`);
        const id = `story-${pad5(idx++)}`;
        const item = makeCommon(rng, "story", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Tale ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], rng.int(5, 15), [...arch.tags]);
        item.id = id;
        item.content = {
          story_type: sub.slug,
          narrative: arch.explanation,
          moral: arch.application,
          characters: ["The Seeker", "The Master"],
          setting: "Ancient times",
          tradition: sub.slug,
          reflection_questions: arch.questions,
          related_concepts: [arch.concept],
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Mission generator ──────────────────────────────────────────────────────

function genMissions(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = MISSION_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`mission-${sub.slug}-${ai}-${v}`);
        const id = `daily_mission-${pad5(idx++)}`;
        const item = makeCommon(rng, "daily_mission", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Variation ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], rng.int(3, 15), [...arch.tags]);
        item.id = id;
        item.content = {
          mission_type: sub.slug,
          task: arch.application,
          duration_minutes: rng.int(3, 15),
          completion_criteria: "Complete the task and reflect.",
          reflection_prompt: arch.questions[0],
          difficulty: arch.difficulty,
          context: "Any time of day",
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Tool generator ─────────────────────────────────────────────────────────

function genTools(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = TOOL_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`tool-${sub.slug}-${ai}-${v}`);
        const id = `tool-${pad5(idx++)}`;
        const item = makeCommon(rng, "tool", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Variation ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], null, [...arch.tags]);
        item.id = id;
        item.content = {
          tool_type: sub.slug,
          features: [arch.application],
          inputs: ["User input"],
          outputs: ["Result"],
          usage_instructions: [arch.explanation],
          widget_id: `widget_${sub.slug}`,
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Assessment generator ───────────────────────────────────────────────────

function genAssessments(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  for (const sub of spec.subcategories) {
    const bank = ASSESSMENT_BANKS[sub.slug] || [];
    const target = sub.count;
    if (bank.length === 0) continue;
    const perArch = Math.ceil(target / bank.length);
    let produced = 0;
    for (let ai = 0; ai < bank.length; ai++) {
      const arch = bank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`assessment-${sub.slug}-${ai}-${v}`);
        const id = `assessment-${pad5(idx++)}`;
        const item = makeCommon(rng, "assessment", spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — Form ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], rng.int(10, 30), [...arch.tags]);
        item.id = id;
        item.content = {
          assessment_type: sub.slug,
          questions: [
            { id: `q1`, type: "scale", prompt: "How do you feel right now?", options: [{ label: "1", value: "1" }, { label: "5", value: "5" }] },
            { id: `q2`, type: "choice", prompt: "What is your primary focus?", options: [{ label: "Work", value: "work" }, { label: "Rest", value: "rest" }] },
          ],
          scoring_logic: { method: "weighted_sum_percentage", dimensions: arch.dimensions, primary_rule: "highest dimension wins" },
          result_types: [
            { id: "r1", label: "Balanced", short: "Balanced", description: "You show balanced awareness across dimensions." },
            { id: "r2", label: "Focused", short: "Focused", description: "You show focused awareness in one dimension." },
          ],
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Additional libraries generator ─────────────────────────────────────────

function genAdditional(spec: CategorySpec): any[] {
  const items: any[] = [];
  let idx = 1;
  const bank = ADDITIONAL_BANKS[spec.slug.replace(/_/g, "_")] || ADDITIONAL_BANKS[spec.slug] || [];
  // map slug to bank key
  const bankKey = spec.slug === "life_experiments" ? "life_experiments"
    : spec.slug === "psychological_patterns" ? "psychological_patterns"
    : spec.slug === "emotional_experiences" ? "emotional_experiences"
    : spec.slug === "personality_exploration" ? "personality_exploration"
    : spec.slug === "archetype_library" ? "archetype_library"
    : spec.slug === "chakra_knowledge" ? "chakra_knowledge"
    : spec.slug === "dream_exploration" ? "dream_exploration"
    : spec.slug === "relationship_exercises" ? "relationship_exercises"
    : spec.slug === "karma_experiments" ? "karma_experiments"
    : spec.slug === "concentration_exercises" ? "concentration_exercises"
    : spec.slug === "creative_awareness" ? "creative_awareness"
    : spec.slug === "nature_experiences" ? "nature_experiences"
    : spec.slug === "reflection_questions" ? "reflection_questions"
    : spec.slug === "stories_wisdom_narratives" ? "stories_wisdom_narratives"
    : spec.slug;
  const actualBank = ADDITIONAL_BANKS[bankKey] || [];
  for (const sub of spec.subcategories) {
    const target = sub.count;
    if (actualBank.length === 0) continue;
    const perArch = Math.ceil(target / actualBank.length);
    let produced = 0;
    for (let ai = 0; ai < actualBank.length; ai++) {
      const arch = actualBank[ai];
      for (let v = 0; v < perArch && produced < target; v++) {
        const rng = rngFor(`additional-${spec.slug}-${sub.slug}-${ai}-${v}`);
        const idPrefix = spec.idPrefix;
        const id = `${idPrefix}-${pad5(idx++)}`;
        const item = makeCommon(rng, spec.type as any, spec.slug, sub.slug, v === 0 ? arch.concept : `${arch.concept} — ${sub.name} ${v + 1}`, arch.explanation.slice(0, 200), arch.difficulty, [...arch.dimensions], [...arch.domains], [...arch.paths], arch.minutes, [...arch.tags]);
        item.id = id;
        item.content = {
          concept: arch.concept,
          description: arch.explanation,
          type_specific: arch.application,
          reflection_questions: arch.questions,
        };
        items.push(item);
        produced++;
      }
      if (produced >= target) break;
    }
  }
  return items;
}

// ─── Main generator ─────────────────────────────────────────────────────────

export interface GeneratedLibrary {
  items: any[];
  byCategory: Record<string, any[]>;
  byId: Map<string, any>;
}

export function generateLibrary(): GeneratedLibrary {
  const byCategory: Record<string, any[]> = {};
  const allItems: any[] = [];
  const generators: Record<string, (spec: CategorySpec) => any[]> = {
    yogic_practices: genPractices,
    micro_practices: genMicro,
    wisdom_teachings: genWisdom,
    guided_programs: genPrograms,
    games_interactive: genGames,
    podcasts_audio: genPodcasts,
    meditations: genMeditations,
    journaling: genJournaling,
    self_inquiry: genSelfInquiry,
    challenges_quests: genChallenges,
    rituals_ceremonies: genRituals,
    breathwork: genBreathwork,
    somatic: genSomatic,
    courses_learning: genCourses,
    stories_parables: genStories,
    daily_missions: genMissions,
    tools_widgets: genTools,
    assessments: genAssessments,
  };
  // additional libraries
  const additionalSlugs = ["life_experiments", "psychological_patterns", "emotional_experiences", "personality_exploration", "archetype_library", "chakra_knowledge", "dream_exploration", "relationship_exercises", "karma_experiments", "concentration_exercises", "creative_awareness", "nature_experiences", "reflection_questions", "stories_wisdom_narratives"];
  for (const slug of additionalSlugs) generators[slug] = genAdditional;

  for (const spec of CATEGORY_SPECS) {
    const gen = generators[spec.slug];
    if (!gen) continue;
    const items = gen(spec);
    byCategory[spec.slug] = items;
    allItems.push(...items);
  }

  // assign related_items (knowledge graph edges) — simple heuristic
  assignRelatedItems(allItems);

  const byId = new Map<string, any>();
  for (const item of allItems) byId.set(item.id, item);

  return { items: allItems, byCategory, byId };
}

function assignRelatedItems(items: any[]): void {
  // Group by category for fast lookup
  const byCat: Record<string, any[]> = {};
  for (const it of items) {
    if (!byCat[it.category]) byCat[it.category] = [];
    byCat[it.category].push(it);
  }
  const cats = Object.keys(byCat);
  for (const item of items) {
    const rng = rngFor(`related-${item.id}`);
    const related: string[] = [];
    // same subcategory siblings
    const sameSub = (byCat[item.category] || []).filter((x) => x.subcategory === item.subcategory && x.id !== item.id);
    for (const s of rng.picks(sameSub, Math.min(2, sameSub.length))) related.push(s.id);
    // same dimension items in other categories
    const dim = item.consciousness_dimensions?.[0];
    if (dim) {
      const crossCat = cats.filter((c) => c !== item.category);
      if (crossCat.length) {
        const otherCat = rng.pick(crossCat);
        const candidates = (byCat[otherCat] || []).filter((x) => (x.consciousness_dimensions || []).includes(dim));
        for (const c of rng.picks(candidates, Math.min(2, candidates.length))) related.push(c.id);
      }
    }
    // random from same category
    const sameCat = (byCat[item.category] || []).filter((x) => x.id !== item.id);
    for (const c of rng.picks(sameCat, Math.min(2, sameCat.length))) {
      if (!related.includes(c.id)) related.push(c.id);
    }
    item.related_items = [...new Set(related)].slice(0, 8);
    if (item.related_items.length < 3 && sameCat.length >= 3) {
      // pad
      for (const c of sameCat) {
        if (related.length >= 3) break;
        if (!related.includes(c.id)) related.push(c.id);
      }
      item.related_items = [...new Set(related)].slice(0, 8);
    }
  }
}

// expose for index.ts
export { makeCommon };
export function makeCommonExport(...args: any[]): any { return makeCommon(...args); }
