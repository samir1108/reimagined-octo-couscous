export type Faculty = 
  | "attention" 
  | "body" 
  | "witness" 
  | "ego" 
  | "heart" 
  | "self_inquiry" 
  | "willpower" 
  | "stillness" 
  | "voice" 
  | "brain_head" 
  | "brain_heart" 
  | "brain_gut" 
  | "karma" 
  | "liminal";

export type FacultyLabel = "attention" | "body" | "witness" | "ego" | "heart" | "self_inquiry" | "willpower" | "stillness" | "voice" | "brain_head" | "brain_heart" | "brain_gut" | "karma" | "liminal";

export interface UnifiedGame {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  faculties: Faculty[];
  primaryFaculty: Faculty;
  unlockLevel: number;
  durationMin: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  icon: string;
  gradient: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  available: boolean;
  component: string;
  timeOfDay?: ("morning" | "afternoon" | "evening" | "night")[];
  prerequisites?: string[];
  xpReward: number;
  streakBonus?: number;
}

export const FACULTY_LABELS: Record<Faculty, string> = {
  attention: "Attention",
  body: "Body",
  witness: "Witness",
  ego: "Ego",
  heart: "Heart",
  self_inquiry: "Self-Inquiry",
  willpower: "Willpower",
  stillness: "Stillness",
  voice: "Voice",
  brain_head: "Head Brain",
  brain_heart: "Heart Brain",
  brain_gut: "Gut Brain",
  karma: "Karma",
  liminal: "Liminal",
};

export const FACULTY_ICONS: Record<Faculty, string> = {
  attention: "🎯",
  body: "🧘",
  witness: "👁️",
  ego: "🎭",
  heart: "💚",
  self_inquiry: "🔍",
  willpower: "⚡",
  stillness: "🌙",
  voice: "🗣️",
  brain_head: "🧠",
  brain_heart: "💓",
  brain_gut: "🦋",
  karma: "🤲",
  liminal: "✨",
};

export const FACULTY_GRADIENTS: Record<Faculty, string> = {
  attention: "from-blue-500 to-indigo-600",
  body: "from-green-500 to-teal-600",
  witness: "from-purple-500 to-violet-600",
  ego: "from-orange-500 to-red-600",
  heart: "from-pink-500 to-rose-600",
  self_inquiry: "from-indigo-500 to-purple-600",
  willpower: "from-yellow-500 to-orange-600",
  stillness: "from-slate-500 to-gray-600",
  voice: "from-cyan-500 to-blue-600",
  brain_head: "from-blue-500 to-cyan-600",
  brain_heart: "from-pink-500 to-red-600",
  brain_gut: "from-amber-500 to-yellow-600",
  karma: "from-emerald-500 to-teal-600",
  liminal: "from-violet-500 to-purple-600",
};

export const UNIFIED_GAMES: UnifiedGame[] = [
  {
    id: "single_point_focus",
    title: "Single Point Focus",
    subtitle: "Train unwavering attention on one object",
    description: "Place full attention on the breath at the nostrils. When mind wanders, gently return. Builds concentration (samatha) and stabilizes the witness.",
    faculties: ["attention", "witness"],
    primaryFaculty: "attention",
    unlockLevel: 1,
    durationMin: 10,
    difficulty: 2,
    icon: "🎯",
    gradient: "from-blue-500 to-indigo-600",
    tags: ["concentration", "samatha", "beginner"],
    available: true,
    component: "SinglePointFocus",
    timeOfDay: ["morning", "afternoon"],
    xpReward: 50,
  },
  {
    id: "body_scan",
    title: "Body Scan",
    subtitle: "Systematic awareness through the body",
    description: "Move attention slowly from toes to crown, noticing sensations without judgment. Grounds attention in the body and develops somatic sensitivity.",
    faculties: ["body", "witness"],
    primaryFaculty: "body",
    unlockLevel: 1,
    durationMin: 12,
    difficulty: 2,
    icon: "🧘",
    gradient: "from-green-500 to-teal-600",
    tags: ["embodiment", "grounding", "beginner"],
    available: true,
    component: "BodyScan",
    timeOfDay: ["morning", "evening"],
    xpReward: 50,
  },
  {
    id: "witness_awareness",
    title: "Witness Awareness",
    subtitle: "Rest as the one who notices",
    description: "Shift from being the thinker to being the awareness in which thoughts appear. The foundational practice for developing the witness.",
    faculties: ["witness", "attention"],
    primaryFaculty: "witness",
    unlockLevel: 2,
    durationMin: 15,
    difficulty: 3,
    icon: "👁️",
    gradient: "from-purple-500 to-violet-600",
    tags: ["witness", "non-dual", "intermediate"],
    available: true,
    component: "WitnessAwareness",
    timeOfDay: ["morning", "afternoon"],
    xpReward: 75,
  },
  {
    id: "ego_observation",
    title: "Ego Observation",
    subtitle: "Watch the self-story without becoming it",
    description: "Notice how the 'I' constructs narratives, defends positions, and seeks validation. See the ego as a process, not an identity.",
    faculties: ["ego", "witness", "self_inquiry"],
    primaryFaculty: "ego",
    unlockLevel: 3,
    durationMin: 12,
    difficulty: 3,
    icon: "🎭",
    gradient: "from-orange-500 to-red-600",
    tags: ["ego", "self-inquiry", "intermediate"],
    available: true,
    component: "EgoObservation",
    timeOfDay: ["afternoon"],
    xpReward: 75,
  },
  {
    id: "heart_opening",
    title: "Heart Opening",
    subtitle: "Soften the armor around the heart",
    description: "Bring warm attention to the chest. With each breath, let the heart soften a fraction. Cultivates compassion and emotional availability.",
    faculties: ["heart", "body"],
    primaryFaculty: "heart",
    unlockLevel: 2,
    durationMin: 10,
    difficulty: 2,
    icon: "💚",
    gradient: "from-pink-500 to-rose-600",
    tags: ["compassion", "bhakti", "beginner"],
    available: true,
    component: "HeartOpening",
    timeOfDay: ["morning", "evening"],
    xpReward: 50,
  },
  {
    id: "self_inquiry_who_am_i",
    title: "Who Am I?",
    subtitle: "The direct path of self-inquiry",
    description: "Ask 'Who is aware?' or 'Who am I?' and trace attention back to its source. The classic jnana yoga practice for recognizing true nature.",
    faculties: ["self_inquiry", "witness", "attention"],
    primaryFaculty: "self_inquiry",
    unlockLevel: 4,
    durationMin: 20,
    difficulty: 4,
    icon: "🔍",
    gradient: "from-indigo-500 to-purple-600",
    tags: ["jnana", "non-dual", "advanced"],
    available: true,
    component: "SelfInquiryWhoAmI",
    timeOfDay: ["morning"],
    xpReward: 100,
  },
  {
    id: "willpower_cultivation",
    title: "Willpower Cultivation",
    subtitle: "Strengthen the capacity for conscious choice",
    description: "Set a micro-intention and follow through completely. Notice the gap between impulse and action. Builds the 'response over reaction' muscle.",
    faculties: ["willpower", "attention", "ego"],
    primaryFaculty: "willpower",
    unlockLevel: 2,
    durationMin: 8,
    difficulty: 3,
    icon: "⚡",
    gradient: "from-yellow-500 to-orange-600",
    tags: ["discipline", "choice", "intermediate"],
    available: true,
    component: "WillpowerCultivation",
    timeOfDay: ["morning", "afternoon"],
    xpReward: 60,
  },
  {
    id: "stillness_practice",
    title: "Deep Stillness",
    subtitle: "Rest in the silence between thoughts",
    description: "Allow mental activity to settle without suppression. Rest as the background silence. Develops access to the stillness that underlies all experience.",
    faculties: ["stillness", "witness", "attention"],
    primaryFaculty: "stillness",
    unlockLevel: 3,
    durationMin: 15,
    difficulty: 3,
    icon: "🌙",
    gradient: "from-slate-500 to-gray-600",
    tags: ["silence", "meditation", "intermediate"],
    available: true,
    component: "StillnessPractice",
    timeOfDay: ["evening", "night"],
    xpReward: 75,
  },
  {
    id: "voice_dialogue",
    title: "Voice Dialogue",
    subtitle: "Speak with and listen to inner parts",
    description: "Give voice to different sub-personalities (critic, protector, child, etc.). Let each speak fully while you witness. Integrates fragmented psyche.",
    faculties: ["voice", "ego", "heart"],
    primaryFaculty: "voice",
    unlockLevel: 4,
    durationMin: 20,
    difficulty: 4,
    icon: "🗣️",
    gradient: "from-cyan-500 to-blue-600",
    tags: ["parts-work", "integration", "advanced"],
    available: true,
    component: "VoiceDialogue",
    timeOfDay: ["afternoon"],
    xpReward: 100,
  },
  {
    id: "head_brain_clarity",
    title: "Head Brain Clarity",
    subtitle: "Cognitive clarity and discernment",
    description: "Observe thoughts as mental events. Distinguish knowing from thinking. Develops the head brain's capacity for clear seeing.",
    faculties: ["brain_head", "attention", "self_inquiry"],
    primaryFaculty: "brain_head",
    unlockLevel: 3,
    durationMin: 12,
    difficulty: 3,
    icon: "🧠",
    gradient: "from-blue-500 to-cyan-600",
    tags: ["cognitive", "clarity", "intermediate"],
    available: true,
    component: "HeadBrainClarity",
    timeOfDay: ["morning", "afternoon"],
    xpReward: 75,
  },
  {
    id: "heart_brain_wisdom",
    title: "Heart Brain Wisdom",
    subtitle: "Emotional intelligence and relational knowing",
    description: "Drop attention into the heart center. Ask 'What does the heart know here?' Distinguishes emotional reactivity from heart wisdom.",
    faculties: ["brain_heart", "heart", "witness"],
    primaryFaculty: "brain_heart",
    unlockLevel: 3,
    durationMin: 12,
    difficulty: 3,
    icon: "💓",
    gradient: "from-pink-500 to-red-600",
    tags: ["emotional", "relational", "intermediate"],
    available: true,
    component: "HeartBrainWisdom",
    timeOfDay: ["afternoon", "evening"],
    xpReward: 75,
  },
  {
    id: "gut_brain_intuition",
    title: "Gut Brain Intuition",
    subtitle: "Instinctual knowing and somatic intelligence",
    description: "Bring awareness to the belly. Notice gut feelings as bodily signals. Develops the enteric brain's capacity for rapid, embodied knowing.",
    faculties: ["brain_gut", "body", "witness"],
    primaryFaculty: "brain_gut",
    unlockLevel: 3,
    durationMin: 10,
    difficulty: 3,
    icon: "🦋",
    gradient: "from-amber-500 to-yellow-600",
    tags: ["intuition", "somatic", "intermediate"],
    available: true,
    component: "GutBrainIntuition",
    timeOfDay: ["morning", "afternoon"],
    xpReward: 75,
  },
  {
    id: "karma_yoga_action",
    title: "Karma Yoga in Action",
    subtitle: "Selfless action as spiritual practice",
    description: "Perform one action today as an offering — without attachment to outcome. Notice the quality when ego steps aside. Action becomes worship.",
    faculties: ["karma", "heart", "willpower"],
    primaryFaculty: "karma",
    unlockLevel: 2,
    durationMin: 15,
    difficulty: 2,
    icon: "🤲",
    gradient: "from-emerald-500 to-teal-600",
    tags: ["service", "bhakti", "beginner"],
    available: true,
    component: "KarmaYogaAction",
    timeOfDay: ["morning", "afternoon"],
    xpReward: 60,
  },
  {
    id: "liminal_threshold",
    title: "Liminal Threshold",
    subtitle: "Rest in the between-spaces",
    description: "Notice transitions: waking/sleeping, inhale/exhale, thought/silence. The liminal is where transformation lives. Rest in the gap.",
    faculties: ["liminal", "witness", "stillness"],
    primaryFaculty: "liminal",
    unlockLevel: 5,
    durationMin: 20,
    difficulty: 5,
    icon: "✨",
    gradient: "from-violet-500 to-purple-600",
    tags: ["transformation", "non-dual", "advanced"],
    available: true,
    component: "LiminalThreshold",
    timeOfDay: ["night"],
    xpReward: 150,
  },
];

export function getGamesByFaculty(faculty: Faculty): UnifiedGame[] {
  return UNIFIED_GAMES.filter(game => game.faculties.includes(faculty) && game.available);
}

export function getQuickGames(maxDuration: number = 10): UnifiedGame[] {
  return UNIFIED_GAMES.filter(game => game.durationMin <= maxDuration && game.available);
}

export function getGamesForTimeOfDay(timeOfDay: "morning" | "afternoon" | "evening" | "night"): UnifiedGame[] {
  return UNIFIED_GAMES.filter(game => game.timeOfDay?.includes(timeOfDay) && game.available);
}

export function getUnifiedGame(id: string): UnifiedGame | undefined {
  return UNIFIED_GAMES.find(game => game.id === id);
}