export interface TodaysGuidance {
  today_intention?: string | null;
  today_mission?: string | null;
  approach_today?: string | null;
  today_priority?: string | null;
  today_reminder?: string | null;
  do_more_of?: string[] | null;
  be_mindful_of?: string | null;
  avoid_today?: string | null;
  replace_with?: string | null;
  one_small_win?: string | null;
  observe_today?: string | null;
  mind_check?: string | null;
  emotional_check?: string | null;
  body_check?: string | null;
  self_inquiry?: string | null;
  todays_practice?: string | null;
  japa_repetition?: string | null;
  pause_reset?: string | null;
  challenge_yourself?: string | null;
  bring_into_action?: string | null;
  how_to_respond?: string | null;
  connection_practice?: string | null;
  decision_to_examine?: string | null;
  life_domain_focus?: string | null;
  act_with_intention?: string | null;
  question_to_carry?: string | null;
  discovery_to_look_for?: string | null;
  capture_moment?: string | null;
  evening_reflection?: string | null;
  end_with_gratitude?: string | null;
}

export interface DailyTheme {
  id: string;
  theme_date: string;
  title: string;
  description: string;
  focus_areas: string[];
  affirmation: string | null;
  created_at: string;
  guidance?: TodaysGuidance | null;
}

export interface Session {
  id: string;
  user_id: string;
  session_date: string;
  time_slot: string;
  type: string;
  status: string;
  theme_id: string | null;
  started_at: string;
  completed_at: string | null;
  ended_at: string | null;
  summary: string | null;
  created_at: string;
}

export interface SessionMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ObservationTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  domain: string;
  chain_order: number;
  parent_task_id: string | null;
  status: 'locked' | 'active' | 'completed';
  reflection: string | null;
  completed_at: string | null;
  task_date: string;
  theme_id: string | null;
  user_topic: string | null;
  created_at: string;
}

export interface DailyTask {
  id: string;
  user_id: string;
  task_date: string;
  time_slot: string;
  title: string;
  description: string;
  domain: string;
  status: 'pending' | 'completed';
  completed_at: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  session_id: string | null;
  title: string | null;
  content: string;
  mood: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface EveningReflection {
  id: string;
  user_id: string;
  reflection_date: string;
  mood: number | null;
  energy: number | null;
  gratitudes: string[];
  highlights: string | null;
  challenges: string | null;
  lessons: string | null;
  created_at: string;
}

export interface UserConsciousnessProfile {
  id: string;
  user_id: string;
  overall_band: number;
  dimension_bands: Record<string, number>;
  life_domains: Record<string, number>;
  active_loops: any[];
  journey_day: number;
  journey_phase: string;
  assessment_data: Record<string, any>;
  last_assessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserJourneyLog {
  id: string;
  user_id: string;
  day_number: number;
  log_date: string;
  phase: string;
  engine_plan: Record<string, any>;
  engine_notes: Record<string, any>;
  created_at: string;
}
