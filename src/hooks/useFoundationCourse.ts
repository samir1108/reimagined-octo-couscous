import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getCourseDay, getPhaseForDay, getPhaseProgress, getOverallProgress, COURSE_PHASES } from '@/data/foundation-course';
import type { CourseDayCurriculum } from '@/data/foundation-course/types';

const FOUNDATION_PROGRAM_ID = 'foundation-118';

export interface FoundationCourseState {
  enrolled: boolean;
  enrollmentId: string | null;
  currentDay: number;
  status: 'active' | 'paused' | 'completed' | 'not_enrolled';
  phase: ReturnType<typeof getPhaseForDay>;
  phaseProgress: number;
  overallProgress: number;
  todayCurriculum: CourseDayCurriculum | undefined;
  morningDone: boolean;
  practiceDone: boolean;
  eveningDone: boolean;
  dayFullyComplete: boolean;
}

export function useFoundationCourse() {
  const qc = useQueryClient();

  const query = useQuery<FoundationCourseState>({
    queryKey: ['foundation-course'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get enrollment
      const { data: enrollment } = await supabase
        .from('program_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', FOUNDATION_PROGRAM_ID)
        .maybeSingle();

      if (!enrollment) {
        return {
          enrolled: false,
          enrollmentId: null,
          currentDay: 1,
          status: 'not_enrolled' as const,
          phase: COURSE_PHASES[0],
          phaseProgress: 0,
          overallProgress: 0,
          todayCurriculum: getCourseDay(1),
          morningDone: false,
          practiceDone: false,
          eveningDone: false,
          dayFullyComplete: false,
        };
      }

      const currentDay = enrollment.current_day;

      // Get today's day progress
      const { data: dayProgress } = await supabase
        .from('program_day_progress')
        .select('*')
        .eq('enrollment_id', enrollment.id)
        .eq('day_number', currentDay)
        .maybeSingle();

      const morningDone = dayProgress?.knowledge_read ?? false;
      const practiceDone = dayProgress?.practice_done ?? false;
      const eveningDone = !!dayProgress?.reflection_text;

      return {
        enrolled: true,
        enrollmentId: enrollment.id,
        currentDay,
        status: enrollment.status as FoundationCourseState['status'],
        phase: getPhaseForDay(currentDay),
        phaseProgress: getPhaseProgress(currentDay),
        overallProgress: getOverallProgress(currentDay),
        todayCurriculum: getCourseDay(currentDay),
        morningDone,
        practiceDone,
        eveningDone,
        dayFullyComplete: morningDone && practiceDone && eveningDone,
      };
    },
  });

  const enroll = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('program_enrollments').insert({
        user_id: user.id,
        program_id: FOUNDATION_PROGRAM_ID,
        current_day: 1,
        status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foundation-course'] }),
  });

  const completeMorning = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const state = query.data;
      if (!state?.enrollmentId) throw new Error('Not enrolled');

      await supabase.from('program_day_progress').upsert({
        enrollment_id: state.enrollmentId,
        user_id: user.id,
        day_number: state.currentDay,
        knowledge_read: true,
      }, { onConflict: 'enrollment_id,day_number' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foundation-course'] }),
  });

  const completePractice = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const state = query.data;
      if (!state?.enrollmentId) throw new Error('Not enrolled');

      await supabase.from('program_day_progress').upsert({
        enrollment_id: state.enrollmentId,
        user_id: user.id,
        day_number: state.currentDay,
        practice_done: true,
      }, { onConflict: 'enrollment_id,day_number' });

      // Karma: foundation practice completion (throttled 5 min).
      try {
        await (supabase.rpc as any)('award_karma_event', {
          p_source: 'practice_complete',
          p_base: 8,
          p_weight: 1.0,
          p_metadata: { surface: 'foundation_course', day: state.currentDay },
        });
      } catch (e) { /* silent */ }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foundation-course'] }),
  });

  const completeEvening = useMutation({
    mutationFn: async (reflectionText: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const state = query.data;
      if (!state?.enrollmentId) throw new Error('Not enrolled');

      // Save reflection
      await supabase.from('program_day_progress').upsert({
        enrollment_id: state.enrollmentId,
        user_id: user.id,
        day_number: state.currentDay,
        reflection_text: reflectionText,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'enrollment_id,day_number' });

      // Advance to next day
      const nextDay = Math.min(state.currentDay + 1, 118);
      await supabase.from('program_enrollments').update({
        current_day: nextDay,
        last_completed_day_at: new Date().toISOString(),
        status: nextDay > 118 ? 'completed' : 'active',
      }).eq('id', state.enrollmentId);

      // Karma: evening reflection (throttled 4 hours).
      try {
        await (supabase.rpc as any)('award_karma_event', {
          p_source: 'evening_reflection',
          p_base: 10,
          p_weight: 1.0,
          p_metadata: { surface: 'foundation_course', day: state.currentDay },
        });
      } catch (e) { /* silent */ }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foundation-course'] }),
  });

  return {
    ...query,
    state: query.data,
    enroll,
    completeMorning,
    completePractice,
    completeEvening,
  };
}

export function useCourseDayHistory(enrollmentId: string | null) {
  return useQuery({
    queryKey: ['foundation-course-history', enrollmentId],
    enabled: !!enrollmentId,
    queryFn: async () => {
      if (!enrollmentId) return [];
      const { data, error } = await supabase
        .from('program_day_progress')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .order('day_number', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });
}
