import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { LoopDefinition } from '@/data/loops';

// ═══════════════════════════════════════════
// ENGINE V2 TYPES
// ═══════════════════════════════════════════

export interface DimensionBands {
  thought: number;
  emotion: number;
  body: number;
  awareness: number;
}

export interface ChakraScores {
  root: number;
  sacral: number;
  solar: number;
  heart: number;
  throat: number;
  third_eye: number;
  crown: number;
}

export interface GuideContext {
  preamble: string;
  tone: string;
  topics_to_explore: string[];
  topics_to_avoid: string[];
  language_level: string;
  band: number;
  bandName: string;
  dimensionLanguage: Record<string, { band: number; vocab: string[]; avoid: string[] }>;
}

export interface EngineTask {
  title: string;
  type: string;
  dimension_target: string;
  yoga_path_alignment: string;
  h_capacity_target: string;
  difficulty: string;
  estimated_minutes?: number;
  loop_relevant: string | null;
  chakra_relevant: string | null;
}

export interface PresenceCard {
  prompt: string;
  type: string;
}

export interface EveningReflection {
  focus: string;
  questions: string[];
}

export interface DimensionBandLabel {
  level: number;
  name: string;
  icon: string;
}

export interface TodayCard {
  guruName: string;
  guruVoice: string;
  teachingSource: string;
  teachingText: string;
  practiceTitle: string;
  practiceLevel: string;
  practiceMinutes: number;
  adjustedMinutes: number;
  adjustReason: string | null;
  practiceSteps: string[];
  offAppPractice: string;
  affirmation: string;
}

export interface EnginePlan {
  phase: string;
  journeyDay: number;
  vLevel: number;
  band: number;
  bandName: string;
  bandIcon: string;
  identityBand: number;
  identityBandName: string;
  identityBandIcon: string;
  dimensionBandLabels: Record<string, DimensionBandLabel>;
  state: string;
  archetype: string;
  focusDimension: string;
  guidePreamble: string;
  guideContext: GuideContext;
  tasks: EngineTask[];
  journalPrompts: string[];
  presenceCard: PresenceCard;
  eveningReflection: EveningReflection;
  guruName?: string;
  todayCard?: TodayCard;
  chakras: ChakraScores;
  dimensionBands: DimensionBands;
  integrationScore: number;
  bypassingRisk: number;
  dominantPath: string | null;
  witnessGap: number;
  witnessQuality: number;
  suggestions?: Array<{
    type: "guide_mode" | "journal" | "practice";
    title: string;
    description: string;
    emoji: string;
    action: { target: string; mode?: string; prompt?: string; context?: string };
  }>;
}

export interface ConsciousnessProfile {
  user_id: string;
  overall_band: number;
  dimension_bands: DimensionBands;
  life_domains: Record<string, number>;
  active_loops: string[];
  journey_day: number;
  journey_phase: string;
  assessment_data: Record<string, any>;
  last_assessed_at: string | null;
  v_level_baseline: number;
  v_level_peak: number;
  v_level_current: number;
  integration_score: number;
  witness_gap: number;
  witness_stability: number;
  witness_depth: number;
  chitta_vritti: string;
  yoga_path_affinity: Record<string, number>;
  dominant_path: string | null;
  h_capacities: Record<string, number>;
  loop_awareness: Record<string, number>;
  loop_severity: Record<string, string>;
  samskara_clusters: any[];
  relational: any;
  state: string;
  bypassing_risk: number;
  regression: any;
  circadian_profile: any;
  archetype: string | null;
  total_sessions: number;
  total_journal_entries: number;
  streak_current: number;
  streak_longest: number;
  last_session_at: string | null;
}

// Capability system types (matching @/types/capability)
export type CapabilityId = string;
export type CapabilityLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type TrainingModality = "game" | "practice" | "experiment" | "reflection";
export type MetricKey = 
  | "accuracy" | "reaction_time" | "consistency" | "detection_rate" 
  | "false_alarm_rate" | "sustain_minutes" | "return_count" 
  | "impulse_events" | "self_report" | "adherence";

export interface CapabilityState {
  capabilityId: CapabilityId;
  level: CapabilityLevel;
  progress: number;
  attempts: number;
  completions: number;
  evidence: DrillAttempt[];
  lastTrainedAt: string | null;
  streakDays: number;
  modalitiesUsed: TrainingModality[];
  unmetPrerequisites: CapabilityId[];
}

export interface DrillAttempt {
  drillId: string;
  capabilityId: CapabilityId;
  modality: TrainingModality;
  outcome: "completed" | "abandoned" | "skipped";
  metrics: Partial<Record<MetricKey, number>>;
  note?: string | null;
  durationSeconds?: number;
  at: string;
}

export interface ConstellationSnapshot {
  phase: "diverge" | "t-shape" | "breathe" | "integrate";
  weights: Record<string, number>;
  levels: Record<string, number>;
  statuses: Record<string, string>;
}

export interface SutraState {
  energy: "low" | "medium" | "high";
  mood: string;
  timeAvailableSec: number;
  activeLoops: string[];
  stressedDomains: string[];
}

// NEW: Extended response with full loop details and capability data
export interface EngineResponse {
  profile: ConsciousnessProfile;
  plan: EnginePlan;
  // Full loop definitions for active loops
  activeLoopDetails: LoopDefinition[];
  // Loop severity as 0-100 scores
  loopSeverity: Record<string, number>;
  // Capability map from user_capacities table
  capabilityMap: Record<string, CapabilityState>;
  // Sutra orchestrator state
  sutraState: SutraState;
  // Constellation snapshot
  constellation: ConstellationSnapshot | null;
  // Active arc
  arc: { title: string; day: number } | null;
  // Stressed domains
  stressedDomains: string[];
}

// ═══════════════════════════════════════════
// ENGINE API CALL
// ═══════════════════════════════════════════

async function callEngine(body: Record<string, any>): Promise<EngineResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const resp = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/consciousness-engine`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Engine error' }));
    throw new Error(err.error || `Error ${resp.status}`);
  }

  return resp.json();
}

// ═══════════════════════════════════════════
// 3-LENS ANALYZER API
// ═══════════════════════════════════════════

interface ThreeLensResult {
  signals: any;
  engineResult: EngineResponse | null;
}

async function callThreeLensAnalyzer(text: string, sourceType: string, sourceId?: string): Promise<ThreeLensResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const resp = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/three-lens-analyzer`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ text, sourceType, sourceId }),
    }
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Analysis error' }));
    throw new Error(err.error || `Error ${resp.status}`);
  }

  return resp.json();
}

// ═══════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════

/** Main engine hook — fetches profile + plan for current time slot */
export function useConsciousnessEngine(timeSlot?: string) {
  const dateKey = new Date().toISOString().split('T')[0];

  return useQuery<EngineResponse>({
    queryKey: ['consciousness-engine', timeSlot || 'default', dateKey],
    queryFn: () => callEngine({ timeSlot: timeSlot || 'morning' }),
    staleTime: 1000 * 60 * 15,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/** Run 3-Lens analysis on text (after guide chat or journal entry) */
export function useThreeLensAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ text, sourceType, sourceId }: { text: string; sourceType: string; sourceId?: string }) =>
      callThreeLensAnalyzer(text, sourceType, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consciousness-engine'] });
      queryClient.invalidateQueries({ queryKey: ['theme-of-day'] });
    },
  });
}

/** Update assessment results (from onboarding) */
export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentResults: Record<string, any>) =>
      callEngine({ action: 'update_assessment', assessmentResults }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consciousness-engine'] });
      queryClient.invalidateQueries({ queryKey: ['theme-of-day'] });
    },
  });
}

/** Advance journey day (also advances guru program if active) */
export function useAdvanceDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = await callEngine({ action: 'advance_day' });

      // Also advance guru program if active
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: guruEnrollment } = await (supabase as any)
            .from('guru_program_enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (guruEnrollment) {
            const nextDay = guruEnrollment.current_day + 1;
            if (nextDay > guruEnrollment.duration_days) {
              await (supabase as any)
                .from('guru_program_enrollments')
                .update({ status: 'completed', completed_at: new Date().toISOString() })
                .eq('id', guruEnrollment.id);
            } else {
              await (supabase as any)
                .from('guru_program_enrollments')
                .update({ current_day: nextDay })
                .eq('id', guruEnrollment.id);
            }
          }
        }
      } catch (e) {
        console.error('guru program advance error:', e);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consciousness-engine'] });
      queryClient.invalidateQueries({ queryKey: ['theme-of-day'] });
      queryClient.invalidateQueries({ queryKey: ['active-guru-program'] });
    },
  });
}

/** Mark a session as completed (increments total_sessions, streak) */
export function useSessionCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => callEngine({ action: 'session_completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consciousness-engine'] });
    },
  });
}