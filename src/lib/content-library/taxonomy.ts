/**
 * CONTENT LIBRARY TAXONOMY
 * Master taxonomy definitions for the 10,000+ Consciousness Content Library.
 * Used by ingestion pipeline, UI filters, and recommendation engine.
 */

import { LIBRARY_CATEGORIES, ADDITIONAL_LIBRARIES, PRACTICE_SUBCATEGORIES, GAME_SUBCATEGORIES, WISDOM_TRADITIONS, PODCAST_CATEGORIES, CONSCIOUSNESS_DIMENSIONS, YOGA_PATHS } from '@/types/contentLibrary';

// ─── Category → Subcategory Mapping ──────────────────────────────────────────

export const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  yogic_practices: [...PRACTICE_SUBCATEGORIES],
  micro_practices: ["breath_micro", "body_micro", "attention_micro", "emotion_micro", "mind_micro", "gratitude_micro", "compassion_micro", "sensory_micro", "movement_micro", "reflection_micro"],
  wisdom_teachings: [...WISDOM_TRADITIONS.indian, ...WISDOM_TRADITIONS.other, ...WISDOM_TRADITIONS.modern],
  guided_programs: ["witness", "mind", "patterns", "emotional", "detachment", "inquiry", "attention", "relationships", "silence", "sleep", "yogic_lifestyle", "ego", "concentration", "discipline", "custom"],
  games_interactive: [...GAME_SUBCATEGORIES],
  podcasts_audio: [...PODCAST_CATEGORIES],
  meditations: ["guided", "unguided", "body_scan", "loving_kindness", "sleep", "morning", "evening", "walking", "mantra", "silence"],
  journaling: ["free_write", "prompted", "gratitude", "shadow", "reflection", "dream", "emotion", "decision", "relationship", "growth"],
  self_inquiry: ["who_am_i", "neti_neti", "witness", "ego", "identity", "belief", "desire", "fear", "attachment", "freedom"],
  challenges_quests: ["daily", "weekly", "monthly", "streak", "exploration", "mastery", "social", "solo", "creative", "physical"],
  rituals_ceremonies: ["morning", "evening", "seasonal", "life_transition", "gratitude", "healing", "connection", "solitude", "celebration", "release"],
  breathwork: ["box", "coherent", "wim_hof", "bhastrika", "nadi_shodhana", "ujjayi", "sheetali", "kapalabhati", "sigh", "custom"],
  somatic: ["body_scan", "tension_release", "grounding", "movement", "touch", "sensation", "energy", "posture", "breath_body", "trauma_informed"],
  courses_learning: ["foundation", "advanced", "specialty", "certification", "workshop", "masterclass", "series", "module", "path", "elective"],
  stories_parables: ["indian", "zen", "sufi", "taoist", "modern", "personal", "mythological", "historical", "fictional", "biographical"],
  daily_missions: ["awareness", "action", "reflection", "connection", "creativity", "service", "learning", "health", "rest", "growth"],
  tools_widgets: ["timer", "breath_pacer", "mood_tracker", "journal", "habit_tracker", "progress_chart", "sound_mixer", "visualization", "assessment", "planner"],
  assessments: ["personality", "consciousness", "emotion", "cognition", "stress", "wellbeing", "relationship", "purpose", "values", "growth"],
};

// ─── Life Domain Definitions ─────────────────────────────────────────────────

export const LIFE_DOMAINS = [
  "work", "relationships", "health", "purpose", "creativity",
  "finances", "family", "community", "learning", "rest",
  "environment", "spirituality", "self_care", "growth",
] as const;

// ─── Suitable Band Ranges ────────────────────────────────────────────────────

export const BAND_RANGES = [
  "0-2", "3-5", "6-8", "9-10", "all",
] as const;

// ─── Difficulty by Band Mapping ──────────────────────────────────────────────

export const DIFFICULTY_BAND_MAP: Record<string, string[]> = {
  beginner: ["0-2", "3-5"],
  intermediate: ["3-5", "6-8"],
  advanced: ["6-8", "9-10"],
  all: ["0-2", "3-5", "6-8", "9-10"],
};

// ─── Tag Taxonomy (Top-level tags) ──────────────────────────────────────────

export const TAG_CATEGORIES = {
  emotion: ["anxiety", "fear", "anger", "sadness", "joy", "peace", "grief", "shame", "guilt", "love"],
  practice_type: ["meditation", "breathwork", "movement", "inquiry", "reflection", "visualization", "mantra", "journaling"],
  context: ["morning", "evening", "night", "work", "commute", "bedtime", "stress", "crisis", "celebration"],
  duration: ["1min", "3min", "5min", "10min", "15min", "20min", "30min", "60min+"],
  tradition: ["yoga", "buddhism", "zen", "taoism", "stoicism", "sufism", "advaita", "tantra"],
  faculty: ["self_inquiry", "witness", "attention", "ego", "heart", "body", "stillness", "willpower", "voice"],
};

// ─── Content Quality Criteria ────────────────────────────────────────────────

export const QUALITY_CRITERIA = {
  minimumRequired: [
    "title", "description", "type", "category", "subcategory",
    "difficulty", "consciousness_dimensions", "tags", "source",
  ],
  recommended: [
    "duration_minutes", "life_domains", "yoga_paths", "suitable_bands",
    "prerequisites", "related_items", "cover_image_url",
  ],
  practiceSpecific: [
    "instructions", "session_steps", "required_widgets",
    "expected_experience", "contraindications", "safety_notes",
  ],
  wisdomSpecific: [
    "original_source", "author_tradition", "concept", "explanation",
    "practical_application", "reflection_questions", "references",
  ],
};

// ─── Total Target Counts ─────────────────────────────────────────────────────

export function getTotalTargetCount(): number {
  const main = LIBRARY_CATEGORIES.reduce((sum, c) => sum + c.target, 0);
  const additional = ADDITIONAL_LIBRARIES.reduce((sum, c) => sum + c.target, 0);
  return main + additional;
}

export const MAIN_LIBRARY_TOTAL = LIBRARY_CATEGORIES.reduce((sum, c) => sum + c.target, 0); // 10350
export const ADDITIONAL_LIBRARY_TOTAL = ADDITIONAL_LIBRARIES.reduce((sum, c) => sum + c.target, 0); // 3558
export const GRAND_TOTAL = MAIN_LIBRARY_TOTAL + ADDITIONAL_LIBRARY_TOTAL; // 13908
