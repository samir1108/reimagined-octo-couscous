// Practice Taxonomy — 30 practice families + intentions + domains

export const PRACTICE_FAMILIES = [
  "Pure Witnessing", "Self-Inquiry", "Concentration", "Open Awareness",
  "Breath & Pranayama", "Somatic Awareness", "Emotional Intelligence",
  "Shadow Exploration", "Cognitive Awareness", "Yogic Wisdom", "Japa & Mantra",
  "Karma Yoga", "Bhakti", "Jnana Yoga", "Raja Yoga", "Relationship Awareness",
  "Communication", "Dream Integration", "Memory & Personal History", "Creativity",
  "Nature Awareness", "Sleep & Rest", "Daily-Life Practice", "Digital Awareness",
  "Purpose & Dharma", "Habit & Behavior", "Resilience", "Five Koshas",
  "Chakra Contemplation", "Integration & Embodiment",
] as const;

export type PracticeFamily = (typeof PRACTICE_FAMILIES)[number];

export const INTENTION_TAGS = [
  "observe", "witness", "awareness", "inquiry", "focus", "concentration",
  "breath", "somatic", "emotion", "shadow", "cognitive", "wisdom", "mantra",
  "karma", "bhakti", "jnana", "raja", "relationship", "communication",
  "dream", "memory", "creativity", "nature", "sleep", "daily-life", "digital",
  "purpose", "habit", "resilience", "koshas", "chakra", "integration",
] as const;

export type IntentionTag = (typeof INTENTION_TAGS)[number];

export const LIFE_DOMAINS = [
  "relationship", "work", "finance", "health", "creativity", "spirituality",
] as const;

export type LifeDomain = (typeof LIFE_DOMAINS)[number];

export const GUIDE_STYLES = ["socratic", "gentle", "contemplative", "instructional", "philosophical", "devotional", "practical", "minimal"] as const;
export type GuideStyle = (typeof GUIDE_STYLES)[number];

export function familyForCategory(category: string): PracticeFamily {
  const map: Record<string, PracticeFamily> = {
    opening: "Integration & Embodiment",
    observation: "Pure Witnessing",
    inquiry: "Self-Inquiry",
    instruction: "Concentration",
    teaching: "Yogic Wisdom",
    dialogue: "Self-Inquiry",
    reflection: "Integration & Embodiment",
    journaling: "Memory & Personal History",
    somatic: "Somatic Awareness",
    breath: "Breath & Pranayama",
    mantra: "Japa & Mantra",
    "pattern-investigation": "Shadow Exploration",
    "emotional-processing": "Emotional Intelligence",
    decision: "Purpose & Dharma",
    transition: "Daily-Life Practice",
    closing: "Integration & Embodiment",
    visualization: "Creativity",
    silence: "Pure Witnessing",
  };
  return map[category] ?? "Integration & Embodiment";
}

export default { PRACTICE_FAMILIES, INTENTION_TAGS, LIFE_DOMAINS, GUIDE_STYLES, familyForCategory };
