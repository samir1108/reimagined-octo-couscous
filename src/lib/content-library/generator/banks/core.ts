/**
 * CORE BANKS — shared vocabularies and composition helpers.
 * Every category generator draws from these pools so items stay
 * consistent, taggable, and dimension-aligned.
 */

import type { Rng } from "../rng";

// ─── Consciousness dimensions ────────────────────────────────────────────────

export const DIMENSIONS = ["thought", "emotion", "body", "action", "connection", "spirit"] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  thought: "Thought",
  emotion: "Emotion",
  body: "Body",
  action: "Action",
  connection: "Connection",
  spirit: "Spirit",
};

// ─── Life domains ────────────────────────────────────────────────────────────

export const LIFE_DOMAINS = [
  "work", "relationships", "health", "purpose", "creativity",
  "finances", "family", "community", "learning", "rest",
  "environment", "spirituality", "self_care", "growth",
] as const;

// ─── Yoga paths ──────────────────────────────────────────────────────────────

export const YOGA_PATHS = ["raja", "bhakti", "jnana", "karma", "kriya", "tantra", "hatha"] as const;

// ─── Bands & profiles ────────────────────────────────────────────────────────

export const BANDS = ["0-2", "3-5", "6-8", "9-10", "all"] as const;
export const PROFILES = ["fast", "steady", "deep"] as const;

export const DIFFICULTY_BANDS: Record<string, string[]> = {
  beginner: ["0-2", "3-5", "all"],
  intermediate: ["3-5", "6-8", "all"],
  advanced: ["6-8", "9-10", "all"],
  all: ["0-2", "3-5", "6-8", "9-10", "all"],
};

// ─── Widgets ─────────────────────────────────────────────────────────────────

export const WIDGETS = [
  "timer", "breath_timer", "body_map", "mood_dial", "journal", "sound_bowl",
  "candle", "mantra_counter", "visualization", "progress_ring", "heart_rate",
  "posture_check", "sound_mixer", "choice_deck", "observation_log", "memory_grid",
  "attention_meter", "bias_card", "archetype_deck", "chakra_map", "dream_journal",
  "relationship_board", "karma_ledger", "focus_beam", "palette", "nature_audio",
  "reflection_prompt", "quest_board", "ritual_candle", "breath_pacer",
  "somatic_scanner", "course_map", "story_reader", "mission_card", "assessment_form",
] as const;

// ─── Contexts ────────────────────────────────────────────────────────────────

export const CONTEXTS = [
  "morning", "evening", "night", "work", "commute", "bedtime", "stress",
  "crisis", "celebration", "transition", "travel", "home", "nature",
  "solitude", "social",
] as const;

export const DURATION_TAGS = ["1min", "2min", "3min", "5min", "8min", "10min", "15min", "20min", "30min", "45min", "60min", "90min"] as const;

// ─── Objectives per dimension ────────────────────────────────────────────────

export const DIMENSION_OBJECTIVES: Record<Dimension, string[]> = {
  thought: [
    "Develop clarity of thought and metacognitive awareness.",
    "Observe thinking patterns without becoming entangled in them.",
    "Cultivate focused, single-pointed attention.",
    "Recognize cognitive distortions as they arise.",
    "Strengthen the capacity to hold questions without rushing to answers.",
  ],
  emotion: [
    "Develop emotional literacy and regulation.",
    "Allow feelings to arise and pass without suppression or amplification.",
    "Recognize emotions as bodily signals rather than commands.",
    "Cultivate equanimity in the presence of difficult feeling.",
    "Transform reactivity into responsive awareness.",
  ],
  body: [
    "Develop somatic awareness and interoception.",
    "Release accumulated physical tension and holding patterns.",
    "Restore the body's natural rhythms of tension and release.",
    "Cultivate comfort and presence in the physical vessel.",
    "Reconnect with the body as a field of intelligence.",
  ],
  action: [
    "Align action with intention and values.",
    "Cultivate integrity between what you believe and what you do.",
    "Transform habitual reaction into conscious response.",
    "Develop discipline through small, consistent commitments.",
    "Bring awareness into work, service, and everyday tasks.",
  ],
  connection: [
    "Deepen empathy and relational presence.",
    "Recognize the interdependence of all experience.",
    "Cultivate compassionate communication and listening.",
    "Heal patterns of isolation, projection, and conflict.",
    "Experience belonging without losing individuality.",
  ],
  spirit: [
    "Rest in the awareness that precedes thought.",
    "Recognize the witness that is never disturbed by experience.",
    "Taste the stillness beneath all mental activity.",
    "Loosen identification with the limited self.",
    "Open to the mystery of being itself.",
  ],
};

// ─── Expected experiences ────────────────────────────────────────────────────

export const EXPECTED_EXPERIENCES: Record<Dimension, string[]> = {
  thought: [
    "Thoughts continue but with more space around them; a sense of watching the mind rather than being swept by it.",
    "Increased noticing of mental habits — comparison, planning, rehearsing — without judgment.",
    "Moments of quiet clarity where thinking feels deliberate rather than compulsive.",
  ],
  emotion: [
    "Feelings arise and are felt fully, then soften; emotional weather is observed rather than fought.",
    "A gentler relationship with difficulty — less resistance, more allowance.",
    "Warmth or tenderness surfacing unexpectedly, with capacity to hold it.",
  ],
  body: [
    "Heightened sensitivity to subtle sensation — warmth, tingling, release, weight.",
    "Areas of chronic tension becoming visible, sometimes with spontaneous softening.",
    "A felt sense of the body as a grounded, breathing whole.",
  ],
  action: [
    "A pause between impulse and action becomes available; choices feel less automatic.",
    "Everyday tasks carry a quality of deliberate presence.",
    "Increased follow-through on small commitments.",
  ],
  connection: [
    "Others feel more vividly present; listening deepens without effort to fix.",
    "A sense of shared humanity softens judgment and defensiveness.",
    "Moments of genuine resonance — laughter, silence, tears — arrive naturally.",
  ],
  spirit: [
    "Brief glimpses of awareness prior to thought — spacious, quiet, uncaused.",
    "Ordinary moments feel luminous; the boundary between observer and observed softens.",
    "A deep, wordless recognition that presence was never absent.",
  ],
};

// ─── Safety & contraindications ──────────────────────────────────────────────

export const GENERIC_SAFETY = [
  "Safe for most people. Stop if you feel pain, dizziness, or distress, and return to normal activity.",
  "Practice in a quiet, comfortable space. If you have a medical condition, consult a professional first.",
  "This is a awareness practice, not therapy. If strong distress arises, pause and seek support if needed.",
  "Go gently. Awareness develops with consistency, not force.",
];

export const INTENSE_SAFETY = [
  "Intense practices can surface strong emotions. Go slowly, keep sessions short, and ground afterwards.",
  "Not suitable during acute crisis, severe anxiety, or psychosis. Stabilize first with gentle breath or body practices.",
  "If you feel overwhelmed, open your eyes, feel your feet, and orient to the room. Stop if needed.",
];

export const BREATH_SAFETY = [
  "Practice seated or lying down. Never force the breath. If dizziness arises, return to normal breathing immediately.",
  "Do not practice in water, while driving, or in any situation where losing control would be dangerous.",
  "Build gradually. Breath retention is optional and should never feel strained.",
];

export const CONTRAINDICATION_POOLS: Record<string, string[]> = {
  gentle: [],
  breath: ["pregnancy (retained breath)", "uncontrolled hypertension", "recent abdominal surgery", "epilepsy (hyperventilation phases)"],
  intense: ["acute trauma or PTSD without professional support", "severe anxiety or panic disorder", "psychosis or bipolar mania", "recent cardiac events"],
  physical: ["acute back or neck injury", "recent surgery", "severe osteoporosis", "acute joint inflammation"],
  inversion: ["glaucoma", "uncontrolled high blood pressure", "detached retina", "menstruation (for prolonged inversions)"],
  heat: ["pregnancy", "cardiovascular conditions", "epilepsy", "severe acid reflux"],
};

// ─── Tag pools ───────────────────────────────────────────────────────────────

export const EMOTION_TAGS = ["anxiety", "fear", "anger", "sadness", "joy", "peace", "grief", "shame", "guilt", "love", "loneliness", "frustration", "overwhelm", "calm", "contentment", "gratitude", "compassion", "hope", "despair", "excitement"];
export const PRACTICE_TYPE_TAGS = ["meditation", "breathwork", "movement", "inquiry", "reflection", "visualization", "mantra", "journaling", "contemplation", "observation", "body_scan", "walking", "sound", "silence", "ritual", "ceremony"];
export const CONTEXT_TAGS = ["morning", "evening", "night", "work", "commute", "bedtime", "stress", "crisis", "celebration", "transition", "travel", "home", "nature", "solitude", "social"];
export const TRADITION_TAGS = ["yoga", "buddhism", "zen", "taoism", "stoicism", "sufism", "advaita", "tantra", "hatha", "raja", "bhakti", "jnana", "karma", "kriya", "samkhya", "vedanta"];
export const FACULTY_TAGS = ["self_inquiry", "witness", "attention", "ego", "heart", "body", "stillness", "willpower", "voice"];
export const QUALITY_TAGS = ["beginner", "intermediate", "advanced", "quick", "deep", "gentle", "intense", "restorative", "energizing", "grounding", "opening", "closing", "solo", "guided", "interactive"];

// ─── Composition helpers ─────────────────────────────────────────────────────

export function pickDimensions(rng: Rng, min = 1, max = 3): Dimension[] {
  const n = rng.int(min, max);
  return rng.picks([...DIMENSIONS], n);
}

export function pickDomains(rng: Rng, min = 1, max = 3): string[] {
  const n = rng.int(min, max);
  return rng.picks([...LIFE_DOMAINS], n);
}

export function pickPaths(rng: Rng, min = 1, max = 2): string[] {
  const n = rng.int(min, max);
  return rng.picks([...YOGA_PATHS], n);
}

export function bandsForDifficulty(difficulty: string): string[] {
  return DIFFICULTY_BANDS[difficulty] || DIFFICULTY_BANDS.all;
}

export function durationTag(minutes: number): string {
  if (minutes <= 1) return "1min";
  if (minutes <= 2) return "2min";
  if (minutes <= 3) return "3min";
  if (minutes <= 5) return "5min";
  if (minutes <= 8) return "8min";
  if (minutes <= 10) return "10min";
  if (minutes <= 15) return "15min";
  if (minutes <= 20) return "20min";
  if (minutes <= 30) return "30min";
  if (minutes <= 45) return "45min";
  if (minutes <= 60) return "60min";
  return "90min";
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function joinNatural(arr: string[]): string {
  if (arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(", ")}, and ${arr[arr.length - 1]}`;
}
