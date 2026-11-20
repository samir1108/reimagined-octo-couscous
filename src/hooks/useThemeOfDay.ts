import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getCourseDay, getPhaseForDay } from '@/data/foundation-course';
import { GURUS } from '@/lib/guru-data';
import { getProgramById } from '@/data/programs';
import type { DailyTheme, DailyTask, ObservationTask, Session } from '@/types/database';

interface ThemeResponse {
  theme: DailyTheme & {
    theme_rationale?: string;
    daily_intentions?: string[];
    learning_focus?: string;
    action_items?: string[];
    // Living Theme Engine — deepened state from evolve-theme
    current_depth?: number;
    max_depth?: number;
    sequence_no?: number;
    sub_angle?: string | null;
    evolution_status?: 'open' | 'closed';
    deepened_wisdom?: string | null;
    deepened_reasoning?: string | null;
    deepened_explore?: { label: string; prompt: string }[] | null;
    recommended_practice?: { title: string; why: string; duration_min: number; type: string } | null;
    last_evolved_at?: string | null;
  };
  dailyTasks: DailyTask[];
  observationTasks: ObservationTask[];
  sessions: Session[];
  // Re-entry / gap context from generate-theme
  gap_days?: number;
  recalibration_note?: string | null;
  previous_focus?: string[];
  previous_title?: string | null;
}

const CACHE_KEY = 'hope-app-theme-of-day';

function getCachedTheme(): ThemeResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    // Only use cache if it's from today
    if (cached?.theme?.theme_date === today) return cached;
    return null;
  } catch {
    return null;
  }
}

function setCachedTheme(data: ThemeResponse) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded — ignore */ }
}

/** Clear localStorage theme cache — call when data should be refreshed */
export function clearThemeCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}

export function useThemeOfDay() {
  const queryClient = useQueryClient();

  // Listen for theme composition completion and invalidate to refetch fresh data
  useEffect(() => {
    function handleThemeComposed() {
      queryClient.invalidateQueries({ queryKey: ['theme-of-day'] });
    }
    window.addEventListener('theme:composed', handleThemeComposed);
    return () => window.removeEventListener('theme:composed', handleThemeComposed);
  }, [queryClient]);

  return useQuery<ThemeResponse>({
    queryKey: ['theme-of-day', new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      const todayDate = new Date().toISOString().split('T')[0];

      // Always fetch fresh sessions & tasks from DB (they go stale fast)
      const { data: { session: authSession } } = await supabase.auth.getSession();

      // Check localStorage for cached theme (not sessions)
      const cached = getCachedTheme();
      if (cached && authSession) {
        // Fetch ALL live data: theme (deepened fields, latest sequence), sessions, daily tasks, observation tasks
        const [
          ,
          { data: freshSessions, error: sessionsError },
          { data: freshDailyTasks, error: dailyTasksError },
          { data: freshObsTasks, error: obsTasksError },
        ] = await Promise.all([
          supabase
            .from('daily_themes')
            .select('*')
            .eq('user_id', authSession.user.id)
            .eq('theme_date', todayDate)
            .order('sequence_no', { ascending: false })
            .limit(1),
          supabase
            .from('sessions')
            .select('*')
            .eq('session_date', todayDate)
            .order('started_at', { ascending: true }),
          supabase
            .from('daily_tasks')
            .select('*')
            .eq('user_id', authSession.user.id)
            .eq('task_date', todayDate)
            .order('time_slot'),
          supabase
            .from('observation_tasks')
            .select('*')
            .eq('user_id', authSession.user.id)
            .eq('task_date', todayDate)
            .order('chain_order', { ascending: true }),
        ]);
        if (sessionsError) console.warn('[theme-of-day] sessions fetch failed:', sessionsError.message);
        if (dailyTasksError) console.warn('[theme-of-day] daily tasks fetch failed:', dailyTasksError.message);
        if (obsTasksError) console.warn('[theme-of-day] observation tasks fetch failed:', obsTasksError.message);

        const liveTheme = null;

      // A cached id that no longer resolves in the DB (theme table wiped or
      // row replaced) would violate sessions_theme_id_fkey on every insert.
      // Keep the cached copy for display, but drop the dead/placeholder id —
      // the composer still themes the session via the day's latest theme row.
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let theme = cached.theme;
      if (!theme.id || !UUID_RE.test(String(theme.id))) {
        theme = { ...theme, id: null } as typeof theme;
      }

      return {
        ...cached,
        theme,
        sessions: (freshSessions || []) as unknown as Session[],
        dailyTasks: (freshDailyTasks || cached.dailyTasks) as DailyTask[],
        observationTasks: (freshObsTasks || cached.observationTasks) as ObservationTask[],
      };
      }
      if (cached && !authSession) return cached;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Check foundation enrollment to pass curriculum context
      let foundationContext: Record<string, any> | undefined;
      const { data: enrollment } = await supabase
        .from('program_enrollments')
        .select('current_day, status')
        .eq('user_id', session.user.id)
        .eq('program_id', 'foundation-118')
        .eq('status', 'active')
        .maybeSingle();

      if (enrollment) {
        const curriculum = getCourseDay(enrollment.current_day);
        const phase = getPhaseForDay(enrollment.current_day);
        if (curriculum) {
          foundationContext = {
            day: enrollment.current_day,
            phase: phase.name,
            phaseSubtitle: phase.subtitle,
            title: curriculum.title,
            subtitle: curriculum.subtitle,
            dimension: curriculum.dimension,
            relatedConcepts: curriculum.relatedConcepts,
            morningTeaching: curriculum.morningTeaching,
            dayPractice: curriculum.dayPractice,
            eveningIntegration: curriculum.eveningIntegration,
          };
        }
      }

      // Check for active guru program (takes priority over foundation)
      let guruProgramContext: Record<string, any> | undefined;
      if (!foundationContext) {
        const { data: guruEnrollment } = await (supabase as any)
          .from('guru_program_enrollments')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (guruEnrollment) {
          const guru = GURUS.find(g => g.id === guruEnrollment.guru_id);
          const curriculum = guruEnrollment.program_curriculum || {};
          guruProgramContext = {
            day: guruEnrollment.current_day,
            totalDays: guruEnrollment.duration_days,
            guruId: guruEnrollment.guru_id,
            guruName: guru?.name || guruEnrollment.guru_id,
            guruQuote: guru?.quote || '',
            programTitle: guruEnrollment.program_title,
            programDescription: guruEnrollment.program_description,
            programFocus: curriculum.focus || 'awareness',
            dailyOverview: curriculum.daily_overview || '',
          };
        }
      }

      // Check for active personalized program (program_enrollments) — only if neither
      // foundation nor guru program is active. Maps the program's current day into the
      // same `guruProgramCurriculum` shape so generate-theme can drive the daily theme,
      // master, and rhythm from the active program instead of falling back to calibration.
      if (!foundationContext && !guruProgramContext) {
        const { data: progEnrollment } = await (supabase as any)
          .from('program_enrollments')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (progEnrollment) {
          const program = getProgramById(progEnrollment.program_id);
          if (program) {
            const dayNum = Math.max(1, Math.min(progEnrollment.current_day || 1, program.duration));
            const today = program.curriculum?.find((d: any) => d.day === dayNum) || program.curriculum?.[0];
            guruProgramContext = {
              day: dayNum,
              totalDays: program.duration,
              guruId: 'program',
              guruName: 'Your Guide',
              guruQuote: '',
              programTitle: program.title,
              programDescription: program.description,
              programFocus: today?.theme || program.subtitle || program.category || 'awareness',
              dailyOverview: today
                ? `Day ${dayNum} — ${today.title}. ${today.knowledge?.title ? 'Teaching: ' + today.knowledge.title + '. ' : ''}Practice: ${today.practice?.title || ''}.`
                : program.description,
            };
          }
        }
      }

      // ── Pre-composed day read ──────────────────────────────────────────────
      // If today's theme already exists in the DB, the day was composed
      // in advance (session-end tail or nightly cron). Read it directly —
      // no generation, no delay. The day is already waiting.
      const { data: precomposedTheme, error: precomposedError } = await supabase
        .from('daily_themes')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('theme_date', todayDate)
        .order('sequence_no', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (precomposedTheme && !precomposedError) {
        // Day exists — read it with live sessions and tasks
        const [
          { data: freshSessions, error: sessionsError },
          { data: freshDailyTasks, error: dailyTasksError },
          { data: freshObsTasks, error: obsTasksError },
        ] = await Promise.all([
          supabase
            .from('sessions')
            .select('*')
            .eq('session_date', todayDate)
            .order('started_at', { ascending: true }),
          supabase
            .from('daily_tasks')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('task_date', todayDate)
            .order('time_slot'),
          supabase
            .from('observation_tasks')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('task_date', todayDate)
            .order('chain_order', { ascending: true }),
        ]);

        const result: ThemeResponse = {
          theme: precomposedTheme as any,
          dailyTasks: (freshDailyTasks || []) as DailyTask[],
          observationTasks: (freshObsTasks || []) as ObservationTask[],
          sessions: (freshSessions || []) as unknown as Session[],
        };

        // Cache the pre-composed day
        setCachedTheme(result);
        return result;
      }

      // ── No pre-composed day — trigger composition in background ─────────────
      // This path only hits on first-ever visit to a day before composition
      // has run. Trigger generate-theme asynchronously and return a minimal
      // composing state. The theme will be ready by the time the user interacts.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('theme:composing', { detail: { active: true } }));
      }

      // Fire-and-forget composition (don't block the UI)
      const composePromise = fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-theme`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            foundationCurriculum: foundationContext,
            guruProgramCurriculum: guruProgramContext,
          }),
        }
      ).then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setCachedTheme(data);
          // Notify UI that theme is ready
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('theme:composed', { detail: data }));
          }
          return data;
        }
        return null;
      }).catch(() => null);

      // Return minimal composing state while background composition runs
      const composingResult: ThemeResponse = {
        theme: {
          id: 'composing',
          title: 'Composing your day…',
          description: 'Your guide is preparing today\'s experience.',
          theme_date: todayDate,
          created_at: new Date().toISOString(),
          affirmation: 'I am present.',
          focus_areas: ['presence'],
          user_id: session.user.id,
          _composing: true,
        } as any,
        dailyTasks: [],
        observationTasks: [],
        sessions: [],
      };

      // Don't await — let the UI render immediately with the composing state
      composePromise.then(() => {
        clearThemeCache();
      });

      return composingResult;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes — allows refetch after session completion
    gcTime: 1000 * 60 * 60 * 24, // keep in memory for 24h
    retry: 2,
  });
}

/**
 * Hook to force-refresh theme data (call after morning session, etc.)
 */
export function useRefreshTheme() {
  const qc = useQueryClient();
  return () => {
    clearThemeCache();
    qc.invalidateQueries({ queryKey: ['theme-of-day'] });
    qc.invalidateQueries({ queryKey: ['observation-tasks'] });
    qc.invalidateQueries({ queryKey: ['daily-tasks'] });
  };
}

/**
 * Force-generate a brand new theme right now (replaces today's theme).
 * Used when the user holds the orb to "call the next theme."
 */
export function useRegenerateTheme() {
  const qc = useQueryClient();
  return async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Signal Home (and any other listener) that theme is being recomposed
    // so they can show the "Master is composing…" placeholder.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('theme:regenerating', { detail: { active: true } }));
    }

    // Clear local cache so the new theme is what shows
    clearThemeCache();

    // Pull foundation context (same shape as useThemeOfDay) so the new theme is grounded
    let foundationContext: Record<string, any> | undefined;
    const { data: enrollment } = await supabase
      .from('program_enrollments')
      .select('current_day, status')
      .eq('user_id', session.user.id)
      .eq('program_id', 'foundation-118')
      .eq('status', 'active')
      .maybeSingle();

    if (enrollment) {
      const curriculum = getCourseDay(enrollment.current_day);
      const phase = getPhaseForDay(enrollment.current_day);
      if (curriculum) {
        foundationContext = {
          day: enrollment.current_day,
          phase: phase.name,
          phaseSubtitle: phase.subtitle,
          title: curriculum.title,
          subtitle: curriculum.subtitle,
          dimension: curriculum.dimension,
          relatedConcepts: curriculum.relatedConcepts,
          morningTeaching: curriculum.morningTeaching,
          dayPractice: curriculum.dayPractice,
          eveningIntegration: curriculum.eveningIntegration,
        };
      }
    }

    // Personalized program context (mirrors useThemeOfDay so regen reflects it)
    let guruProgramContext: Record<string, any> | undefined;
    if (!foundationContext) {
      const { data: progEnrollment } = await (supabase as any)
        .from('program_enrollments')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .neq('program_id', 'foundation-118')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (progEnrollment) {
        const program = getProgramById(progEnrollment.program_id);
        if (program) {
          const dayNum = Math.max(1, Math.min(progEnrollment.current_day || 1, program.duration));
          const today = program.curriculum?.find((d: any) => d.day === dayNum) || program.curriculum?.[0];
          guruProgramContext = {
            day: dayNum,
            totalDays: program.duration,
            guruId: 'program',
            guruName: 'Your Guide',
            guruQuote: '',
            programTitle: program.title,
            programDescription: program.description,
            programFocus: today?.theme || program.subtitle || program.category || 'awareness',
            dailyOverview: today
              ? `Day ${dayNum} — ${today.title}. ${today.knowledge?.title ? 'Teaching: ' + today.knowledge.title + '. ' : ''}Practice: ${today.practice?.title || ''}.`
              : program.description,
          };
        }
      }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-theme`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            forceRegenerate: true,
            foundationCurriculum: foundationContext,
            guruProgramCurriculum: guruProgramContext,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate next theme');
      }

      const data = await response.json();
      setCachedTheme(data);
      qc.setQueryData(['theme-of-day', new Date().toISOString().split('T')[0]], data);
      qc.invalidateQueries({ queryKey: ['theme-of-day'] });
      qc.invalidateQueries({ queryKey: ['observation-tasks'] });
      qc.invalidateQueries({ queryKey: ['daily-tasks'] });
      qc.invalidateQueries({ queryKey: ['consciousness-engine'] });
      return data;
    } finally {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('theme:regenerating', { detail: { active: false } }));
      }
    }
  };
}

/**
 * Soft refresh — keeps the cached theme (so we don't trigger a fresh
 * generate-theme call that would overwrite deepened wisdom/reasoning),
 * but invalidates the query so it re-runs the cache-merge path and pulls
 * the latest `daily_themes` row (with deepened fields) from the DB.
 *
 * Use this AFTER a session completes and `next-session-preview` has
 * persisted new wisdom/reasoning/explore into daily_themes.
 */
export function useSoftRefreshTheme() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['theme-of-day'] });
    qc.invalidateQueries({ queryKey: ['observation-tasks'] });
    qc.invalidateQueries({ queryKey: ['daily-tasks'] });
  };
}
