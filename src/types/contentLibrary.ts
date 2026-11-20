/**
 * CONTENT LIBRARY TYPES — ConsciousOS 10,000+ Content Library
 * Common schema, categories, relationships, progress, recommendations.
 */

// ─── Content Types ───────────────────────────────────────────────────────────

export type LibraryItemType =
  | "practice"
  | "game"
  | "program"
  | "wisdom"
  | "podcast"
  | "meditation"
  | "challenge"
  | "ritual"
  | "course"
  | "story"
  | "tool"
  | "micro_practice"
  | "journaling"
  | "self_inquiry"
  | "breathwork"
  | "somatic"
  | "assessment"
  | "life_experiment"
  | "psychological_pattern"
  | "emotional_experience"
  | "personality_exploration"
  | "archetype"
  | "chakra_knowledge"
  | "dream_exploration"
  | "relationship_exercise"
  | "karma_experiment"
  | "concentration_exercise"
  | "creative_awareness"
  | "nature_experience"
  | "reflection_question";

export type LibraryItemStatus = "draft" | "review" | "published" | "archived";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "all";

export type ContentSource =
  | "original"
  | "licensed"
  | "public_domain"
  | "curated"
  | "ai_generated_reviewed";

// ─── Common Library Item Schema ──────────────────────────────────────────────

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  short_description?: string;

  type: LibraryItemType;
  category: string;          // main category slug
  subcategory: string;       // nested subcategory slug

  duration_minutes?: number;
  difficulty: DifficultyLevel;

  consciousness_dimensions: string[];   // e.g. ['thought','emotion','body','spirit']
  life_domains: string[];              // e.g. ['work','relationships','health']
  yoga_paths: string[];                // e.g. ['raja','bhakti','jnana','karma']

  suitable_bands: string[];           // e.g. ['0-2','3-5','6-10']
  suitable_profiles: string[];         // e.g. ['fast','steady','deep']
  prerequisites: string[];            // item ids

  tags: string[];
  related_items: string[];             // item ids

  content: Record<string, unknown>;    // type-specific payload

  source: ContentSource;
  provenance?: string;                 // original source / citation
  quality_score?: number;              // 0-1
  review_status: LibraryItemStatus;

  version: number;
  created_at: string;
  updated_at: string;
  published_at?: string;

  // Optional media
  cover_image_url?: string;
  audio_url?: string;
  video_url?: string;

  // Discovery signals
  popularity_score?: number;
  completion_count?: number;
  average_rating?: number;
}

// ─── Category Taxonomy ───────────────────────────────────────────────────────

export interface LibraryCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  target_count: number;
  current_count: number;
  order: number;
  item_count?: number;
  parent_id?: string;
}

export interface LibrarySubcategory {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string;
  target_count: number;
  current_count: number;
  order: number;
}

// ─── Category Slugs (from spec) ──────────────────────────────────────────────

export const LIBRARY_CATEGORIES = [
  { slug: "yogic_practices", name: "Yogic Practices", target: 1800 },
  { slug: "micro_practices", name: "Micro Practices", target: 1200 },
  { slug: "wisdom_teachings", name: "Wisdom & Teachings", target: 1200 },
  { slug: "guided_programs", name: "Guided Programs", target: 700 },
  { slug: "games_interactive", name: "Games & Interactive Experiences", target: 600 },
  { slug: "podcasts_audio", name: "Podcasts & Audio Experiences", target: 600 },
  { slug: "meditations", name: "Meditations", target: 500 },
  { slug: "journaling", name: "Journaling Experiences", target: 500 },
  { slug: "self_inquiry", name: "Self-Inquiry Experiences", target: 450 },
  { slug: "challenges_quests", name: "Challenges & Quests", target: 400 },
  { slug: "rituals_ceremonies", name: "Rituals & Ceremonies", target: 400 },
  { slug: "breathwork", name: "Breathwork", target: 350 },
  { slug: "somatic", name: "Somatic Experiences", target: 350 },
  { slug: "courses_learning", name: "Courses & Learning Paths", target: 300 },
  { slug: "stories_parables", name: "Stories & Parables", target: 300 },
  { slug: "daily_missions", name: "Daily Missions", target: 300 },
  { slug: "tools_widgets", name: "Tools & Interactive Widgets", target: 250 },
  { slug: "assessments", name: "Assessments", target: 150 },
] as const;

export const ADDITIONAL_LIBRARIES = [
  { slug: "life_experiments", name: "Life Experiments", target: 300 },
  { slug: "psychological_patterns", name: "Psychological Patterns", target: 200 },
  { slug: "emotional_experiences", name: "Emotional Experiences", target: 200 },
  { slug: "personality_exploration", name: "Personality Exploration", target: 100 },
  { slug: "archetype_library", name: "Archetype Library", target: 108 },
  { slug: "chakra_knowledge", name: "Chakra Knowledge", target: 300 },
  { slug: "dream_exploration", name: "Dream Exploration", target: 200 },
  { slug: "relationship_exercises", name: "Relationship Exercises", target: 250 },
  { slug: "karma_experiments", name: "Karma & Action Experiments", target: 150 },
  { slug: "concentration_exercises", name: "Concentration Exercises", target: 200 },
  { slug: "creative_awareness", name: "Creative Awareness", target: 150 },
  { slug: "nature_experiences", name: "Nature Experiences", target: 150 },
  { slug: "reflection_questions", name: "Reflection Questions", target: 1000 },
  { slug: "stories_wisdom_narratives", name: "Stories & Wisdom Narratives", target: 300 },
] as const;

// ─── Practice Subcategories (26) ─────────────────────────────────────────────

export const PRACTICE_SUBCATEGORIES = [
  "observation", "self_inquiry", "witness_consciousness", "breath_awareness",
  "pranayama", "dharana", "dhyana", "yoga_nidra", "body_awareness",
  "chakra_practices", "mantra", "japa", "trataka", "mindfulness",
  "shadow_work", "emotional_regulation", "gratitude", "compassion",
  "detachment", "sensory_awareness", "energy_awareness", "nature_connection",
  "walking_meditation", "sleep_practices", "morning_practices", "evening_practices",
] as const;

// ─── Game Subcategories (6) ──────────────────────────────────────────────────

export const GAME_SUBCATEGORIES = [
  "awareness_games", "psychological_games", "memory_games",
  "philosophical_games", "interactive_story_games", "attention_games",
] as const;

// ─── Wisdom Traditions ───────────────────────────────────────────────────────

export const WISDOM_TRADITIONS = {
  indian: [
    "bhagavad_gita", "upanishads", "yoga_sutras", "ashtavakra_gita",
    "vivekachudamani", "dhammapada", "hatha_yoga_pradipika", "bhagavata_purana",
    "advaita_vedanta", "samkhya",
  ],
  other: ["buddhism", "zen", "taoism", "stoicism", "sufism", "mysticism", "existential_philosophy"],
  modern: ["psychology", "cognitive_science", "neuroscience", "behavioral_science", "philosophy_of_mind", "consciousness_studies"],
} as const;

// ─── Podcast Categories (15) ─────────────────────────────────────────────────

export const PODCAST_CATEGORIES = [
  "guided_meditations", "yogic_wisdom", "philosophical_conversations",
  "self_inquiry_audio", "sleep_stories", "morning_reflections", "evening_reflections",
  "spiritual_storytelling", "psychology_explainers", "breathwork_guidance",
  "sound_experiences", "silence_experiences", "mantra_chanting",
  "nature_soundscapes", "guided_journeys",
] as const;

// ─── Consciousness Dimensions ────────────────────────────────────────────────

export const CONSCIOUSNESS_DIMENSIONS = [
  "thought", "emotion", "body", "action", "connection", "spirit",
] as const;

// ─── Yoga Paths ──────────────────────────────────────────────────────────────

export const YOGA_PATHS = ["raja", "bhakti", "jnana", "karma", "kriya", "tantra", "hatha"] as const;

// ─── Content Relationships ───────────────────────────────────────────────────

export type RelationshipType =
  | "related_to"
  | "prerequisite_of"
  | "part_of_program"
  | "part_of_course"
  | "teaches_concept"
  | "dissolves_loop"
  | "develops_skill"
  | "references_wisdom"
  | "pairs_with"
  | "alternative_to"
  | "deepens"
  | "simplifies"
  | "follows"
  | "precedes";

export interface ContentRelationship {
  id: string;
  from_item_id: string;
  to_item_id: string;
  relationship_type: RelationshipType;
  weight: number;           // 0-1
  confidence: number;       // 0-1
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ─── User Progress ───────────────────────────────────────────────────────────

export interface UserLibraryProgress {
  id: string;
  user_id: string;
  item_id: string;
  status: "not_started" | "in_progress" | "completed" | "favorited" | "skipped";
  started_at?: string;
  completed_at?: string;
  progress_percent: number;      // 0-100
  time_spent_seconds: number;
  rating?: number;               // 1-5
  notes?: string;
  last_accessed_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export interface RecommendationContext {
  user_id: string;
  time_of_day: "morning" | "afternoon" | "evening" | "night";
  day_of_week: number;
  available_minutes: number;
  energy_level?: "low" | "medium" | "high";
  recent_emotions?: string[];
  current_program_id?: string;
  current_band?: number;
  completed_item_ids: string[];
  favorited_item_ids: string[];
  weak_dimensions: string[];
  current_journey_day?: number;
}

export interface Recommendation {
  id: string;
  user_id: string;
  item_id: string;
  score: number;                // 0-1
  reason: string;
  context: RecommendationContext;
  created_at: string;
  expires_at?: string;
  dismissed: boolean;
  clicked: boolean;
}

// ─── Content Versioning ───────────────────────────────────────────────────────

export interface ContentVersion {
  id: string;
  item_id: string;
  version: number;
  content: Record<string, unknown>;
  changed_by: string;
  change_notes?: string;
  created_at: string;
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export interface ContentTag {
  id: string;
  slug: string;
  name: string;
  description?: string;
  item_count: number;
}

// ─── Wisdom-Specific ─────────────────────────────────────────────────────────

export interface WisdomSource {
  id: string;
  title: string;
  author?: string;
  tradition: string;
  source_type: "text" | "research" | "assessment" | "practice" | "framework" | "blog";
  url?: string;
  publication_year?: number;
  license?: string;
}

export interface WisdomConcept {
  id: string;
  item_id: string;            // links to library_items
  source_id: string;
  concept: string;
  explanation: string;
  practical_application: string;
  reflection_questions: string[];
  related_practice_ids: string[];
  related_program_ids: string[];
  evidence_type: "traditional" | "research" | "clinical" | "inferred" | "user_reported";
  confidence: number;
}

// ─── Program-Specific ────────────────────────────────────────────────────────

export interface ProgramDay {
  id: string;
  program_id: string;
  day_number: number;
  title: string;
  description: string;
  practice_ids: string[];
  wisdom_ids: string[];
  reflection_prompt: string;
  mission: string;
  assessment_id?: string;
}

export interface GuidedProgram {
  id: string;
  item_id: string;            // links to library_items
  duration_days: number;
  daily_time_minutes: number;
  days: ProgramDay[];
  completion_criteria: string;
  certificate?: boolean;
}

// ─── Game-Specific ───────────────────────────────────────────────────────────

export interface GameMechanics {
  id: string;
  item_id: string;            // links to library_items
  game_type: string;
  mechanics: Record<string, unknown>;
  scoring_rules: Record<string, unknown>;
  observation_outputs: string[];   // what meaningful observations it generates
  estimated_minutes: number;
  replayable: boolean;
}

// ─── Session Templates ───────────────────────────────────────────────────────

export interface SessionTemplate {
  id: string;
  item_id: string;            // links to library_items
  steps: SessionStep[];
  total_duration_minutes: number;
  required_widgets: string[];
}

export interface SessionStep {
  id: string;
  order: number;
  type: "instruction" | "practice" | "reflection" | "game" | "wisdom" | "assessment" | "meditation";
  title: string;
  content: string;
  duration_seconds: number;
  widget_id?: string;
  item_id?: string;           // linked library item
}

// ─── Discovery Engine Types ──────────────────────────────────────────────────

export interface DiscoverySection {
  id: string;
  title: string;
  type: "continue_journey" | "explore_worlds" | "for_your_state" | "discover" | "popular" | "recent" | "random";
  items: LibraryItem[];
  order: number;
}

export interface ExplorePageData {
  search_placeholder: string;
  sections: DiscoverySection[];
  worlds: { slug: string; name: string; icon: string; count: number }[];
  current_state_recommendations: LibraryItem[];
}

// ─── Ingestion Pipeline Types ────────────────────────────────────────────────

export interface IngestionBatch {
  id: string;
  source: string;
  category: string;
  item_count: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  error_log?: string[];
}

export interface ContentQualityReport {
  item_id: string;
  has_source: boolean;
  has_practical_application: boolean;
  has_safety_notes: boolean;
  has_consciousness_dimensions: boolean;
  has_related_items: boolean;
  quality_score: number;
  issues: string[];
}
