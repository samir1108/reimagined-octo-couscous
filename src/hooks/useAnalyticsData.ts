import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useConsciousnessEngine } from './useConsciousnessEngine';
import { format, subDays } from 'date-fns';
import { mergeOnboardingLoops } from '@/lib/analytics/onboardingLoops';

const ANALYTICS_STALE_TIME = 24 * 60 * 60 * 1000;
const ANALYTICS_GC_TIME = 30 * 60 * 1000;

async function safeQuery<T>(label: string, fn: () => Promise<{ data: T; error: unknown }>): Promise<T> {
  try {
    const { data, error } = await fn();
    if (error) {
      console.warn(`[analytics] ${label} query failed:`, error);
      return [] as unknown as T;
    }
      return ((data ?? []) as T);
  } catch (e) {
    console.warn(`[analytics] ${label} query exception:`, e);
    return [] as unknown as T;
  }
}

export function useAnalyticsData() {
  const engine = useConsciousnessEngine();

  const { data: loops } = useQuery({
    queryKey: ['analytics-loops'],
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const [{ data: userLoops, error: loopsError }, { data: dna, error: dnaError }] = await Promise.all([
        supabase.from('user_loops').select('*').eq('user_id', user.id),
        supabase
          .from('spiritual_dna_assessments')
          .select('assessment_conversation, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (loopsError) console.warn('[analytics] user_loops query failed:', loopsError.message);
      if (dnaError) console.warn('[analytics] spiritual_dna_assessments query failed:', dnaError.message);
      return mergeOnboardingLoops((userLoops ?? []) as any[], dna as any);
    },
  });

  const { data: samskaras } = useQuery({
    queryKey: ['analytics-samskaras'],
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('user_samskaras').select('*').eq('user_id', user.id);
      if (error) { console.warn('[analytics] user_samskaras query failed:', error.message); return []; }
      return data || [];
    },
  });

  const { data: regressions } = useQuery({
    queryKey: ['analytics-regressions'],
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('regression_events').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) { console.warn('[analytics] regression_events query failed:', error.message); return []; }
      return data || [];
    },
  });

  const rangeStart = format(subDays(new Date(), 400), 'yyyy-MM-dd');

  const { data: sessions } = useQuery({
    queryKey: ['analytics-sessions'],
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('sessions').select('*')
        .eq('user_id', user.id).gte('session_date', rangeStart).order('session_date');
      if (error) { console.warn('[analytics] sessions query failed:', error.message); return []; }
      return data || [];
    },
  });

  const { data: journals } = useQuery({
    queryKey: ['analytics-journals'],
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('journal_entries').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(500);
      if (error) { console.warn('[analytics] journal_entries query failed:', error.message); return []; }
      return data || [];
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['analytics-tasks'],
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('daily_tasks').select('*')
        .eq('user_id', user.id).gte('task_date', rangeStart);
      if (error) { console.warn('[analytics] daily_tasks query failed:', error.message); return []; }
      return data || [];
    },
  });

  const { data: reflections } = useQuery({
    queryKey: ['analytics-reflections'],
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('evening_reflections').select('*')
        .eq('user_id', user.id).gte('reflection_date', rangeStart).order('reflection_date');
      if (error) { console.warn('[analytics] evening_reflections query failed:', error.message); return []; }
      return data || [];
    },
  });

  const { data: obsTask } = useQuery({
    queryKey: ['analytics-obs'],
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('observation_tasks').select('*')
        .eq('user_id', user.id);
      if (error) { console.warn('[analytics] observation_tasks query failed:', error.message); return []; }
      return data || [];
    },
  });

  const { data: psycheData } = useQuery({
    queryKey: ['analytics-psyche'],
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_psyche_profile' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) { console.warn('[analytics] user_psyche_profile query failed:', error.message); return null; }
      return data;
    },
  });

  return {
    engine,
    profile: engine.data?.profile,
    plan: engine.data?.plan,
    loops: loops || [],
    samskaras: samskaras || [],
    regressions: regressions || [],
    sessions: sessions || [],
    journals: journals || [],
    tasks: tasks || [],
    obsTask: obsTask || [],
    psycheData: psycheData || null,
    reflections: reflections || [],
    isLoading: engine.isLoading,
  };
}
