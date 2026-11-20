/**
 * TEMPLE - Complete TypeScript Data Types
 * Single source of truth for all Temple entities
 */

// ─── Master Types ───

export type MasterCategory =
  | "hindu-vedic"
  | "bhakti-saint"
  | "buddhist"
  | "sufi-islamic"
  | "christian-mystic"
  | "taoist-zen"
  | "ancient-philosopher"
  | "modern-indian"
  | "psychology-neuroscience"
  | "contemporary-teacher"
  | "living-student";

export type MasterEra = "ancient" | "medieval" | "modern" | "contemporary" | "living";

export type MasterPresenceType = "active" | "elder" | "future";

export interface MasterBiographyChapter {
  id: string;
  title: string;
  content: string;
  order: number;
  readTimeMinutes: number;
}

export interface MasterRecommendation {
  label: string; // "Start Here", "For Beginners", "Most Powerful Story", "If You Read One Thing"
  textId: string;
  title: string;
}

export interface MasterBiography {
  originStory: string;
  theSearch: string;
  theAwakening: string;
  theTeachingYears: string;
  theFinalDays: string;
  chapters: MasterBiographyChapter[];
  recommendations: MasterRecommendation[];
  sources: string[];
}

export interface MasterStory {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  readTimeMinutes: number;
  themes: string[];
  relatedPracticeId?: string;
  relatedProgramId?: string;
  moral: string;
}

export interface Master {
  id: string;
  name: string;
  title: string;
  quote: string;
  category: MasterCategory;
  era: MasterEra;
  isLiving: boolean;
  livingStudentOf?: string; // For living masters: "Teachings inspired by [Name]'s work"
  image: string;
  bgImage: string;
  accentColor: string; // HSL format
  bio: string;
  keyTeaching: string;
  biography?: MasterBiography;
  stories?: MasterStory[];
  practices: MasterPractice[];
  programs: MasterProgram[];
  journey: MasterJourney; // 100-day journey
  associatedTexts: string[]; // Text IDs
}

// ─── Yoga Categories ───

export type YogaCategory =
  | "hatha"
  | "kriya"
  | "observation-vipassana"
  | "self-inquiry-atma-vichara"
  | "neti-neti"
  | "naam-jap"
  | "sleep-yoga-nidra"
  | "bhakti"
  | "karma"
  | "jnana"
  | "raja"
  | "laya"
  | "mantra"
  | "yantra"
  | "nada"
  | "tantra"
  | "kundalini"
  | "siddha"
  | "dhyana"
  | "samadhi";

export const YOGA_CATEGORIES: { id: YogaCategory; label: string; icon: string }[] = [
  { id: "hatha", label: "Hatha Yoga", icon: "🧘" },
  { id: "kriya", label: "Kriya Yoga", icon: "⚡" },
  { id: "observation-vipassana", label: "Vipassana", icon: "👁️" },
  { id: "self-inquiry-atma-vichara", label: "Self-Inquiry", icon: "❓" },
  { id: "neti-neti", label: "Neti Neti", icon: "🚫" },
  { id: "naam-jap", label: "Naam Jap", icon: "🕉️" },
  { id: "sleep-yoga-nidra", label: "Sleep Yoga", icon: "🌙" },
  { id: "bhakti", label: "Bhakti Yoga", icon: "❤️" },
  { id: "karma", label: "Karma Yoga", icon: "🤲" },
  { id: "jnana", label: "Jnana Yoga", icon: "📖" },
  { id: "raja", label: "Raja Yoga", icon: "👑" },
  { id: "laya", label: "Laya Yoga", icon: "🌊" },
  { id: "mantra", label: "Mantra Yoga", icon: "🔔" },
  { id: "yantra", label: "Yantra Yoga", icon: "🔷" },
  { id: "nada", label: "Nada Yoga", icon: "🎵" },
  { id: "tantra", label: "Tantra", icon: "🔥" },
  { id: "kundalini", label: "Kundalini", icon: "🐍" },
  { id: "siddha", label: "Siddha", icon: "✨" },
  { id: "dhyana", label: "Dhyana", icon: "🧠" },
  { id: "samadhi", label: "Samadhi", icon: "☀️" },
];

// ─── Practice Types ───

export type PracticeMode = "chat" | "timer";

export interface MasterPractice {
  id: string;
  name: string;
  duration: string; // e.g. "5-30 min"
  description: string;
  steps: string[];
  yogaCategory?: YogaCategory;
  modes: PracticeMode[];
  difficulty: "beginner" | "intermediate" | "advanced";
  chatScript?: string[]; // For chat mode
  ambientSounds?: string[]; // For timer mode
}

// ─── Program Types ───

export type ProgramCategory =
  | "spiritual-mastery"
  | "inner-llms"
  | "body-healing"
  | "mind-focus"
  | "work-life"
  | "relationships-emotions"
  | "tech-modern-life"
  | "personal-growth";

export type ProgramDifficulty = "beginner" | "intermediate" | "advanced";

export interface MasterProgram {
  id: string;
  title: string;
  description: string;
  category: ProgramCategory;
  durationDays: number;
  dailyTimeMinutes: number;
  difficulty: ProgramDifficulty;
  focus: string;
  prerequisites?: string[]; // Program IDs that must be completed first
  hasLegalDisclaimer: boolean;
  legalDisclaimerText?: string;
  dailySessions: ProgramDay[];
}

export interface ProgramDay {
  day: number;
  teaching: string;
  practice: string;
  practiceDurationMinutes: number;
  practiceMode: PracticeMode;
  isSilenceDay: boolean; // Every 10th day
  isTestingDay: boolean;
  isReflectionDay: boolean;
  chatPrompt?: string;
}

// ─── 100-Day Journey Types ───

export type JourneyDayType = "regular" | "silence" | "testing" | "reflection";

export interface JourneyDay {
  day: number;
  type: JourneyDayType;
  teaching: string;
  practice: string;
  practiceDurationMinutes: number;
  chatPrompt?: string;
  isUnlocked: boolean;
}

export interface MasterJourney {
  masterId: string;
  totalDays: number;
  dailyTimeMinutes: number;
  days: JourneyDay[];
}

// ─── Sacred Library Types ───

export type TextCategory =
  | "vedas"
  | "upanishads"
  | "shastras"
  | "itihasas"
  | "puranas"
  | "agamas-tantras"
  | "brahmanas-aranyakas-sutras-smritis"
  | "buddhist"
  | "taoist"
  | "christian-mystical"
  | "islamic-sufi"
  | "modern"
  | "psychology";

export interface SacredVerse {
  id: string;
  number: string; // e.g. "2.47"
  sanskrit?: string;
  translation: string;
  context?: string;
  commentary?: string;
  crossReferences: string[]; // Verse IDs
}

export interface SacredTextChapter {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  verses: SacredVerse[];
  introduction?: string;
  summary?: string;
}

export interface SacredText {
  id: string;
  title: string;
  category: TextCategory;
  subtitle?: string;
  description: string;
  totalVerses?: number;
  totalChapters?: number;
  chapters: SacredTextChapter[];
  isPublicDomain: boolean;
  source?: string;
  downloadSizeMB?: number;
}

// ─── Chat Message Types ───

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  masterId?: string;
  context?: string; // journey, program, guidance, practice
}

// ─── Guidance Types ───

export type GuidanceCategory =
  | "heartbreak"
  | "grief"
  | "intrusive-thoughts"
  | "anxiety"
  | "depression"
  | "anger"
  | "job-crisis"
  | "financial-stress"
  | "family-conflict"
  | "addiction"
  | "sleep"
  | "purpose-confusion"
  | "spiritual-guidance"
  | "decision-making"
  | "other";

export const GUIDANCE_CATEGORIES: { id: GuidanceCategory; label: string; icon: string }[] = [
  { id: "heartbreak", label: "Heartbreak", icon: "💔" },
  { id: "grief", label: "Grief", icon: "🕯️" },
  { id: "intrusive-thoughts", label: "Intrusive Thoughts", icon: "🌑" },
  { id: "anxiety", label: "Anxiety", icon: "🌀" },
  { id: "depression", label: "Depression", icon: "🌧️" },
  { id: "anger", label: "Anger", icon: "🔥" },
  { id: "job-crisis", label: "Job Crisis", icon: "💼" },
  { id: "financial-stress", label: "Financial Stress", icon: "💰" },
  { id: "family-conflict", label: "Family Conflict", icon: "👨‍👩‍👧" },
  { id: "addiction", label: "Addiction", icon: "⛓️" },
  { id: "sleep", label: "Sleep Issues", icon: "🌙" },
  { id: "purpose-confusion", label: "Purpose Confusion", icon: "❓" },
  { id: "spiritual-guidance", label: "Spiritual Guidance", icon: "🕉️" },
  { id: "decision-making", label: "Decision Making", icon: "⚖️" },
  { id: "other", label: "Other", icon: "🙏" },
];

export interface GuidanceRequest {
  id: string;
  text: string;
  category?: GuidanceCategory;
  timestamp: string;
  isCrisis: boolean;
}

export interface MasterMatchResult {
  masterId: string;
  confidence: number;
  reason: string;
}

export interface GuidanceResponse {
  requestId: string;
  masterId: string;
  validation: string; // First: validate the user's feeling
  wisdom: string;
  programOffer?: string; // Program ID
  quickPractice?: string; // Practice ID
  crisisResources?: CrisisResource[];
}

// ─── Crisis Resources ───

export interface CrisisResource {
  name: string;
  phone: string;
  website?: string;
  description: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    website: "https://988lifeline.org",
    description: "24/7, free, confidential support",
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    website: "https://www.crisistextline.org",
    description: "Free crisis counseling via text",
  },
  {
    name: "Emergency Services",
    phone: "911",
    description: "For immediate danger or life-threatening situations",
  },
];

// ─── User State Types ───

export interface Presence {
  masterId: string;
  type: MasterPresenceType;
  currentDay?: number;
  totalDays?: number;
  lastInteraction?: string;
  quote?: string;
}

export interface UserJourneyState {
  masterId: string;
  currentDay: number;
  totalDays: number;
  startedAt: string;
  lastPracticedAt?: string;
  missedDays: number;
  completedDays: number;
  isComplete: boolean;
  completedAt?: string;
  // Adaptive fields
  streakDays: number;
  avgPracticeMinutes: number;
  avgRating: number;
  engagementLevel: "low" | "medium" | "high";
  preferredTime: "morning" | "afternoon" | "evening" | "night";
  recentReflections: string[];
  lastJournalSentiment: "negative" | "neutral" | "positive";
  struggles: string[];
  strengths: string[];
}

// Alias for UserProfile (used by session engine)
export interface UserProfile extends UserJourneyState { }

export interface UserProgramState {
  programId: string;
  masterId: string;
  currentDay: number;
  startedAt: string;
  lastPracticedAt?: string;
  missedDays: number;
  isActive: boolean;
  isComplete: boolean;
  completedAt?: string;
}

export interface TempleVows {
  taken: boolean;
  takenAt?: string;
  vows: {
    dailyPractice: boolean;
    honesty: boolean;
    noJudgment: boolean;
    returnWhenFall: boolean;
    respectTradition: boolean;
    stayOpen: boolean;
  };
}

// ─── Practice Journal Types ───

export interface PracticeJournalEntry {
  id: string;
  sessionId: string;
  masterId?: string;
  programId?: string;
  journeyId?: string;
  timestamp: string;
  rating: number; // 1-5
  reflection?: string; // What arose during practice
  insight?: string; // One insight from today
  isEncrypted: boolean;
}

export interface WeeklyReview {
  weekStart: string;
  weekEnd: string;
  daysPracticed: number;
  totalDays: number;
  totalTimeMinutes: number;
  masterQuote: string;
  masterName: string;
  commonTheme?: string;
  entries: PracticeJournalEntry[];
}

// ─── Temple Calendar Types ───

export type CalendarEventType =
  | "full-moon"
  | "new-moon"
  | "personal-milestone"
  | "traditional-observance"
  | "global-sangha";

export interface TempleCalendarEvent {
  id: string;
  date: string; // ISO date
  type: CalendarEventType;
  title: string;
  description: string;
  masterId?: string;
  isGlobal: boolean;
  participantCount?: number;
}

// ─── Time of Day Types ───

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface SessionRecommendation {
  masterId: string;
  practiceId?: string;
  programId?: string;
  journeyDay?: number;
  reason: string;
  timeOfDay: TimeOfDay;
  durationMinutes: number;
}

// ─── Temple State (Full) ───

export interface TempleState {
  // User's temple journey
  activeJourneys: UserJourneyState[];
  completedJourneys: UserJourneyState[];
  activePrograms: UserProgramState[];
  completedPrograms: UserProgramState[];

  // Presence
  presences: Presence[];

  // Journal
  journalEntries: PracticeJournalEntry[];

  // Library
  recentlyReadTexts: { textId: string; lastReadAt: string; lastVerse: string }[];
  bookmarks: { verseId: string; textId: string; note?: string }[];
  annotations: { verseId: string; textId: string; annotation: string }[];

  // Vows
  vows: TempleVows;

  // Offline
  offlineContent: string[]; // IDs of downloaded content
  isOffline: boolean;

  // Settings
  preferredPracticeTime?: string; // HH:MM
  traditionPreference?: "hindu" | "buddhist" | "universal" | "all";
  reducedMotion: boolean;
}

// ─── Inner LLMs Types ───

export type BrainType = "gut" | "heart" | "head";

export interface InnerLLMInfo {
  type: BrainType;
  name: string;
  neurons: string;
  speed: string;
  function: string;
  description: string;
}

export const INNER_LLMS: InnerLLMInfo[] = [
  {
    type: "gut",
    name: "Gut Brain",
    neurons: "500 Million",
    speed: "Fastest (milliseconds)",
    function: "Intuition, survival, boundaries",
    description: "Your second brain. The enteric nervous system knows what's right before your head figures it out. Trust the gut feeling — it's biological intelligence.",
  },
  {
    type: "heart",
    name: "Heart Brain",
    neurons: "40,000",
    speed: "Fast (seconds)",
    function: "Emotion, values, connection",
    description: "The heart has its own nervous system. It feels right/wrong before the mind knows. It connects to others through coherence. Love is literally electromagnetic.",
  },
  {
    type: "head",
    name: "Head Brain",
    neurons: "86 Billion",
    speed: "Slower (minutes to hours)",
    function: "Logic, analysis, planning",
    description: "The CEO. Powerful but slow. Makes sense of what gut and heart already know. Essential for execution, terrible for intuition.",
  },
];

// ─── Mastery Levels ───

export type MasteryLevel = "novice" | "initiate" | "practitioner" | "teacher";

export interface MasteryProgress {
  level: MasteryLevel;
  totalPracticeDays: number;
  completedJourneys: number;
  completedPrograms: number;
  nextLevelAt: number; // days required
}

// ─── Error Messages (Temple-appropriate) ───

export const TEMPLE_ERRORS: Record<string, { title: string; message: string; action: string }> = {
  networkLost: {
    title: "📴 The signal fades.",
    message: "Timer practices and reading still work. Chat with masters requires connection. Reconnecting...",
    action: "Continue Practice",
  },
  serverError: {
    title: "🕯️ The temple is resting.",
    message: "Please try again in a moment.",
    action: "Try Again",
  },
  sessionExpired: {
    title: "Your practice paused.",
    message: "Welcome back. The masters await.",
    action: "Enter Temple",
  },
  cantLoadMaster: {
    title: "The presence is clouded.",
    message: "Try refreshing the page.",
    action: "Refresh",
  },
  failedSave: {
    title: "Your effort wasn't lost.",
    message: "We're retrying the save...",
    action: "Retry",
  },
  lowStorage: {
    title: "The temple needs space.",
    message: "Consider clearing cache in Settings.",
    action: "Open Settings",
  },
  contentNotFound: {
    title: "This teaching is temporarily unavailable.",
    message: "Explore other masters in the meantime.",
    action: "Browse Masters",
  },
  searchNoResults: {
    title: "No matches found.",
    message: "Try different keywords or browse categories.",
    action: "Browse",
  },
  chatAIError: {
    title: "The master's voice is clouded.",
    message: "Please try again in a moment.",
    action: "Try Again",
  },
  timerError: {
    title: "The bell is silent.",
    message: "Please restart the timer.",
    action: "Restart",
  },
};
