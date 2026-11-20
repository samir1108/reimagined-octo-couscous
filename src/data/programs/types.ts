// Program data types — all program content lives in frontend code

export type ProgramCategory =
  | 'awareness'
  | 'mind'
  | 'emotional'
  | 'body'
  | 'meditation'
  | 'loops'
  | 'yoga-paths'
  | 'habits'
  | 'purpose'
  | 'relationships'
  | 'shadow'
  | 'chakras'
  | 'enterprise';

export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProgramDuration = 7 | 14 | 21 | 30 | 40 | 90;
export type PracticeType = 'observation' | 'meditation' | 'breathwork' | 'body-scan' | 'journaling' | 'contemplation' | 'movement' | 'mantra';

export interface ProgramPractice {
  title: string;
  description: string;
  durationMinutes: number;
  type: PracticeType;
  guidedScript?: string; // Detailed guided meditation/practice script (markdown)
}

export interface ProgramKnowledge {
  title: string;
  content: string; // markdown
  readingTime: number; // minutes
}

export interface ProgramDay {
  day: number;
  title: string;
  theme: string;
  knowledge: ProgramKnowledge;
  practice: ProgramPractice;
  reflectionPrompt: string;
}

export interface Program {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: ProgramDuration;
  category: ProgramCategory;
  difficulty: ProgramDifficulty;
  coverGradient: string;
  icon: string; // lucide icon name
  tags: string[];
  curriculum: ProgramDay[];
}

export interface CategoryMeta {
  id: ProgramCategory;
  label: string;
  description: string;
  icon: string;
  gradient: string;
}

// Enrollment types (matches database)
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface ProgramEnrollment {
  id: string;
  user_id: string;
  program_id: string;
  started_at: string;
  current_day: number;
  status: EnrollmentStatus;
  completed_at: string | null;
  grace_days_used: number;
  last_completed_day_at: string | null;
  created_at: string;
}

export interface ProgramDayProgress {
  id: string;
  enrollment_id: string;
  user_id: string;
  day_number: number;
  knowledge_read: boolean;
  practice_done: boolean;
  reflection_text: string | null;
  completed_at: string | null;
  created_at: string;
}
