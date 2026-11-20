// ═══════════════════════════════════════════
// TASK DOMAINS — 24 Practice Domains
// Users can select which domains are active in Settings
// ═══════════════════════════════════════════

export interface TaskDomain {
  id: string;
  label: string;
  emoji: string;
  description: string;
  examples: string[];
  category: "inner" | "outer" | "relational" | "creative";
}

export const TASK_DOMAINS: TaskDomain[] = [
  // INNER domains
  { id: "observation", label: "Observation", emoji: "👁️", description: "Noticing patterns, thoughts, reactions without judgment", examples: ["Notice when you react automatically today", "Observe your first thought upon waking"], category: "inner" },
  { id: "self_inquiry", label: "Self-Inquiry", emoji: "🔍", description: "Deep questions about the self and identity", examples: ["Ask 'who is thinking this?' 3 times today", "Question one belief you hold as absolute truth"], category: "inner" },
  { id: "meditation", label: "Meditation", emoji: "🧘", description: "Seated practice, breath awareness, stillness", examples: ["10 minutes of breath awareness", "Body scan meditation before sleep"], category: "inner" },
  { id: "breathwork", label: "Breathwork", emoji: "🌬️", description: "Pranayama and conscious breathing practices", examples: ["5 minutes of box breathing", "Alternate nostril breathing before a meeting"], category: "inner" },
  { id: "shadow_work", label: "Shadow Work", emoji: "🌑", description: "Exploring hidden, denied, or projected parts", examples: ["Journal about a trait you judge in others", "Notice what you hide from different people"], category: "inner" },
  { id: "emotion_tracking", label: "Emotion Tracking", emoji: "🎭", description: "Identifying, naming, and sitting with emotions", examples: ["Name your emotion every hour", "Trace an emotion to its body location"], category: "inner" },
  { id: "dream_work", label: "Dream Work", emoji: "🌙", description: "Dream journaling, lucid dreaming, symbol exploration", examples: ["Write down your dream immediately upon waking", "Identify recurring dream themes"], category: "inner" },
  { id: "body_awareness", label: "Body Awareness", emoji: "🫀", description: "Somatic awareness, tension patterns, physical listening", examples: ["Body scan 3 times today", "Notice where stress lives in your body"], category: "inner" },

  // OUTER domains
  { id: "nature", label: "Nature Connection", emoji: "🌿", description: "Connecting with natural world, earth, elements", examples: ["Walk barefoot on earth for 5 minutes", "Sit with a tree and observe without phone"], category: "outer" },
  { id: "real_life", label: "Real Life Tasks", emoji: "🏠", description: "Bringing awareness to everyday activities", examples: ["Wash dishes with full attention", "Eat one meal in complete silence"], category: "outer" },
  { id: "digital_detox", label: "Digital Detox", emoji: "📵", description: "Conscious technology use and digital boundaries", examples: ["No phone for first 30 minutes of morning", "One hour without any screen"], category: "outer" },
  { id: "movement", label: "Conscious Movement", emoji: "🏃", description: "Yoga, walking, dance with awareness", examples: ["Walk for 15 minutes noticing every step", "5 sun salutations with full presence"], category: "outer" },
  { id: "rituals", label: "Rituals & Ceremony", emoji: "🕯️", description: "Creating sacred routines and ceremonies", examples: ["Light a candle and set an intention", "Create a gratitude ritual before meals"], category: "outer" },
  { id: "fasting", label: "Conscious Fasting", emoji: "🍃", description: "Fasting from food, stimulation, or habits", examples: ["Fast from complaining for one day", "Skip one meal mindfully, noticing hunger"], category: "outer" },
  { id: "service", label: "Service & Karma Yoga", emoji: "🙏", description: "Selfless action and conscious service to others", examples: ["Do something for someone without them knowing", "Volunteer 30 minutes of your time"], category: "outer" },

  // RELATIONAL domains
  { id: "relationship", label: "Relationship Mirror", emoji: "🪞", description: "Using relationships as mirrors for self-knowledge", examples: ["Notice what triggers you about your partner", "Express appreciation to 3 people today"], category: "relational" },
  { id: "communication", label: "Conscious Communication", emoji: "💬", description: "Honest, vulnerable, non-violent communication", examples: ["Express one feeling using 'I feel' language", "Listen to someone without planning your response"], category: "relational" },
  { id: "boundaries", label: "Boundaries", emoji: "🛑", description: "Setting, maintaining, and respecting boundaries", examples: ["Say 'no' to one request today", "Identify a boundary you need but haven't set"], category: "relational" },
  { id: "family", label: "Family Patterns", emoji: "👨‍👩‍👧", description: "Exploring inherited patterns and family dynamics", examples: ["Notice one behavior you inherited from a parent", "Journal about a family story that shaped you"], category: "relational" },
  { id: "forgiveness", label: "Forgiveness", emoji: "💚", description: "Processing resentment and practicing release", examples: ["Write a forgiveness letter (don't send)", "Release one small grudge consciously"], category: "relational" },

  // CREATIVE domains
  { id: "creative_expression", label: "Creative Expression", emoji: "🎨", description: "Art, writing, music as awareness practice", examples: ["Draw your current emotional state", "Write a poem about what you're feeling"], category: "creative" },
  { id: "journaling", label: "Deep Journaling", emoji: "📝", description: "Structured reflective writing practices", examples: ["Morning pages: 3 pages stream of consciousness", "Write a letter to your future self"], category: "creative" },
  { id: "philosophy", label: "Wisdom Study", emoji: "📚", description: "Studying and contemplating wisdom traditions", examples: ["Read one page of a wisdom text and contemplate", "Apply one Stoic principle today"], category: "creative" },
  { id: "play", label: "Conscious Play", emoji: "🎮", description: "Unstructured play, humor, and lightness", examples: ["Do something purely for fun with no purpose", "Play like a child for 15 minutes"], category: "creative" },
];

export const DOMAIN_CATEGORIES = {
  inner: { label: "Inner Work", emoji: "🧠" },
  outer: { label: "Outer Practice", emoji: "🌍" },
  relational: { label: "Relational", emoji: "💞" },
  creative: { label: "Creative & Study", emoji: "✨" },
};

export function getDomainById(id: string): TaskDomain | undefined {
  return TASK_DOMAINS.find(d => d.id === id);
}

export function getDomainsByCategory(category: string): TaskDomain[] {
  return TASK_DOMAINS.filter(d => d.category === category);
}

export const DEFAULT_ACTIVE_DOMAINS = [
  "observation", "self_inquiry", "meditation", "emotion_tracking",
  "nature", "real_life", "relationship", "journaling"
];
