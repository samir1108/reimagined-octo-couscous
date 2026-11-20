// The 12 practices in the Practice Constellation.
// Each user has a weight (0.01-1.0), level (0-7), and status for each.
// No practice is ever zero — dormant ones remain at ~0.01-0.05.

export const PRACTICES = [
  "observe", "inquiry", "bhakti", "witness", "karma", "breath",
  "body", "jnana", "raja", "tantra", "neuro", "kriya",
] as const;

export type Practice = typeof PRACTICES[number];

export type PracticeStatus = "primary" | "secondary" | "dormant";

export const PRACTICE_META: Record<Practice, {
  label: string;
  sanskrit?: string;
  description: string;
  emoji: string;
  maxLevel: number;
}> = {
  observe:  { label: "Observation",  sanskrit: "Sakshi",     description: "The witness — always-on spine of every practice", emoji: "👁",  maxLevel: 7 },
  inquiry:  { label: "Self-Inquiry", sanskrit: "Atma Vichara", description: "Who am I? — the path of direct knowing",         emoji: "🔍",  maxLevel: 6 },
  bhakti:   { label: "Devotion",     sanskrit: "Bhakti",     description: "Love, surrender, gratitude as practice",          emoji: "🪔",  maxLevel: 5 },
  witness:  { label: "Witness",      sanskrit: "Drashta",    description: "Silent awareness behind all experience",          emoji: "🌌",  maxLevel: 5 },
  karma:    { label: "Action",       sanskrit: "Karma Yoga", description: "Service, work, life as practice",                  emoji: "🤲",  maxLevel: 5 },
  breath:   { label: "Breath",       sanskrit: "Pranayama",  description: "Working with life-force through breath",          emoji: "🌬",  maxLevel: 5 },
  body:     { label: "Body",         sanskrit: "Asana",      description: "Embodied presence, somatic awareness",            emoji: "🧘",  maxLevel: 5 },
  jnana:    { label: "Knowledge",    sanskrit: "Jnana",      description: "Wisdom, study, contemplation",                    emoji: "📜",  maxLevel: 5 },
  raja:     { label: "Discipline",   sanskrit: "Raja",       description: "The royal path — yamas, niyamas, structure",       emoji: "👑",  maxLevel: 5 },
  tantra:   { label: "Energy",       sanskrit: "Tantra",     description: "Embodied energy, polarity, integration",           emoji: "🌀",  maxLevel: 5 },
  neuro:    { label: "Mind Science", sanskrit: "Chitta",     description: "Modern brain & cognition work",                    emoji: "🧠",  maxLevel: 5 },
  kriya:    { label: "Purification", sanskrit: "Kriya",      description: "Cleansing actions of body and mind",               emoji: "💧",  maxLevel: 5 },
};

export function statusFromWeight(w: number): PracticeStatus {
  if (w >= 0.15) return "primary";
  if (w >= 0.06) return "secondary";
  return "dormant";
}
