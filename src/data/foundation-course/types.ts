// Foundation Course: 118-Day Transformation Journey Types

export type CoursePhase =
  | 'awakening'      // Days 1-14: What is awareness?
  | 'mind'           // Days 15-30: The Head Lens
  | 'heart'          // Days 31-45: The Heart Lens
  | 'body'           // Days 46-60: The Gut Lens
  | 'patterns'       // Days 61-75: Loops & Samskaras
  | 'inquiry'        // Days 76-90: Self-Inquiry & Neti Neti
  | 'energy'         // Days 91-105: Chakras & Energy Body
  | 'integration';   // Days 106-118: Yoga Paths & Embodiment

export type MorningTeachingType =
  | 'concept'        // New concept introduction
  | 'deepening'      // Going deeper into yesterday's concept
  | 'story'          // Teaching through parable/story
  | 'science'        // Scientific backing of the concept
  | 'practice-intro' // Introducing today's practice with context
  | 'review';        // Weekly review & integration

export type DayPracticeType =
  | 'observation'    // Watch thoughts/emotions/body during the day
  | 'body-scan'      // Somatic awareness practice
  | 'breath-watch'   // Breath observation (not control)
  | 'trigger-track'  // Notice triggers and reactions
  | 'loop-catch'     // Catch a specific loop pattern
  | 'self-inquiry'   // "Who am I?" style inquiry
  | 'neti-neti'      // "Not this, not this" practice
  | 'chakra-sense'   // Energy center awareness
  | 'witness'        // Pure witnessing
  | 'mirror'         // Relationship/projection awareness
  | 'shadow'         // Shadow integration work
  | 'gratitude'      // Conscious gratitude (not mechanical)
  | 'silence'        // Periods of intentional silence
  | 'journaling';    // Structured journaling exercise

export type EveningIntegrationType =
  | 'reflection'     // Standard day reflection
  | 'neti-neti'      // "What am I not?" inquiry
  | 'body-release'   // Somatic release of the day
  | 'gratitude-deep' // Deep gratitude beyond surface
  | 'witness-review' // Review day from witness perspective
  | 'dream-intention'// Setting intention for sleep/dream awareness
  | 'integration'    // Integrating the day's learning
  | 'letter'         // Writing a letter (to self, past self, etc.)
  | 'surrender';     // Letting go practice

export interface CourseDayCurriculum {
  day: number;
  phase: CoursePhase;
  title: string;
  subtitle: string;
  
  // What the AI teaches in morning session
  morningTeaching: {
    type: MorningTeachingType;
    concept: string;           // Core concept to teach
    keyPoints: string[];       // 3-5 key points AI must cover
    metaphor?: string;         // Optional metaphor/story to use
    scienceNote?: string;      // Optional neuroscience/psychology backing
  };
  
  // What user practices during the day (8hr real-world practice)
  dayPractice: {
    type: DayPracticeType;
    instruction: string;       // Clear, actionable instruction
    duration: string;          // e.g., "Throughout the day", "3 times today", "20 minutes"
    checkpoints: string[];     // Midday check-in prompts
  };
  
  // Evening integration session
  eveningIntegration: {
    type: EveningIntegrationType;
    prompt: string;            // Primary reflection prompt
    deeperPrompt: string;      // For users who want to go deeper
    closingWisdom: string;     // One-line wisdom to sleep on
  };
  
  // Metadata
  dimension: 'thought' | 'emotion' | 'body' | 'awareness';
  relatedConcepts: string[];   // Links to app concepts (loops, chakras, etc.)
}

export interface CoursePhaseInfo {
  id: CoursePhase;
  name: string;
  subtitle: string;
  days: [number, number];      // [startDay, endDay]
  description: string;
  icon: string;                // Lucide icon name
  gradient: string;            // Tailwind gradient classes
  keyOutcomes: string[];       // What user achieves by end of phase
}

export interface UserCourseProgress {
  currentDay: number;
  currentPhase: CoursePhase;
  morningDone: boolean;
  practiceDone: boolean;
  eveningDone: boolean;
  totalDaysCompleted: number;
  phaseProgress: number;       // 0-100 within current phase
}
