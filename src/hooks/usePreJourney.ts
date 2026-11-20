import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  PRE_JOURNEY_SESSIONS,
  PRE_JOURNEY_TOTAL,
  getPreJourneySession,
  type PreJourneyModule,
} from '@/data/pre-journey/sessions';
import {
  MIRROR_CHECKPOINTS,
  MIRROR_TOTAL,
  getMirrorAfterSession,
  getMirrorByNumber,
  type MirrorCheckpoint,
} from '@/data/pre-journey/mirrors';

export type PreJourneyPace = 'slow' | 'balanced' | 'intense';

export const PACE_TARGET: Record<PreJourneyPace, number> = {
  slow: 1,
  balanced: 3,
  intense: 10,
};

export interface PreJourneyState {
  enrolled: boolean;
  pace: PreJourneyPace;
  dailyMinutes: number;
  notifyTime: string;
  completedIds: string[];
  currentSessionId: string;
  graduated: boolean;
  /** User chose to skip Foundation and continue it in parallel from Settings */
  skipped: boolean;
  /** User paused the Foundation — Home reverts to normal daily flow until resumed */
  paused: boolean;
  todayCount: number;
  todayTarget: number;
  todayDate: string;
  reflections: Record<string, string>;
  totalSessions: number;
  progressPct: number;
  currentSession: ReturnType<typeof getPreJourneySession>;
  // Mirror state
  completedMirrorNumbers: number[];
  totalMirrors: number;
  pendingMirrorNumber: number | null;
  pendingMirror: MirrorCheckpoint | null;
  mirrorsCompleted: number;
  // Reveal
  revealReady: boolean;
  revealSeen: boolean;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export function usePreJourney() {
  const qc = useQueryClient();

  const query = useQuery<PreJourneyState>({
    queryKey: ['pre-journey'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pre_journey_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('[pre-journey] pre_journey_progress query failed:', error.message);
        return {
          enrolled: false,
          pace: 'balanced',
          dailyMinutes: 30,
          notifyTime: '08:00',
          completedIds: [],
          currentSessionId: 'pj-001',
          graduated: false,
          skipped: false,
          paused: false,
          todayCount: 0,
          todayTarget: PACE_TARGET.balanced,
          todayDate: todayStr(),
          reflections: {},
          totalSessions: PRE_JOURNEY_TOTAL,
          progressPct: 0,
          currentSession: getPreJourneySession('pj-001'),
          completedMirrorNumbers: [],
          totalMirrors: MIRROR_TOTAL,
          pendingMirrorNumber: null,
          pendingMirror: null,
          mirrorsCompleted: 0,
          revealReady: false,
          revealSeen: false,
        };
      }

      if (!data) {
        return {
          enrolled: false,
          pace: 'balanced',
          dailyMinutes: 30,
          notifyTime: '08:00',
          completedIds: [],
          currentSessionId: 'pj-001',
          graduated: false,
          skipped: false,
          paused: false,
          todayCount: 0,
          todayTarget: PACE_TARGET.balanced,
          todayDate: todayStr(),
          reflections: {},
          totalSessions: PRE_JOURNEY_TOTAL,
          progressPct: 0,
          currentSession: getPreJourneySession('pj-001'),
          completedMirrorNumbers: [],
          totalMirrors: MIRROR_TOTAL,
          pendingMirrorNumber: null,
          pendingMirror: null,
          mirrorsCompleted: 0,
          revealReady: false,
          revealSeen: false,
        };
      }

      const today = todayStr();
      const todayCount = data.today_date === today ? data.today_count : 0;
      const pace = (data.pace || 'balanced') as PreJourneyPace;
      let completedMirrors: number[] = (data as { completed_mirror_numbers?: number[] }).completed_mirror_numbers || [];
      let pendingNum: number | null = (data as { pending_mirror_number?: number | null }).pending_mirror_number ?? null;
      const completedSessions: string[] = data.completed_session_ids || [];

      // Sync mirrors against actual completions.
      // Two sources, because mirrors now complete two ways:
      //   1. `user_assessment_results` — a Library assessment run through the
      //      normal runner, where the bank exists in `assessment_definitions`.
      //   2. `mirror_readings`        — a mirror taken from the journey, which
      //      is the path the adaptive runner writes. Registry-authored banks
      //      never reach `user_assessment_results` (assessment_id is a
      //      required FK), so this source is the only completion signal for
      //      them. Reading only the first would leave 61 mirrors unsealed.
      try {
        const slugs = MIRROR_CHECKPOINTS
          .filter(m => !m.kind || m.kind === 'assessment')
          .map(m => m.assessmentSlug);
        const assessmentMirrors = MIRROR_CHECKPOINTS
          .filter(m => (!m.kind || m.kind === 'assessment'))
          .map(m => m.number);

        const { data: results } = await supabase
          .from('user_assessment_results')
          .select('assessment_slug')
          .eq('user_id', user.id)
          .in('assessment_slug', slugs);
        const doneSlugs = new Set((results || []).map(r => r.assessment_slug as string));
        const newlyDone = MIRROR_CHECKPOINTS
          .filter(m => (!m.kind || m.kind === 'assessment') && doneSlugs.has(m.assessmentSlug) && !completedMirrors.includes(m.number))
          .map(m => m.number);

        // Journeys taken as mirrors — these carry their own reading row.
        // `mirror_readings` gained columns in 20260930000001 that are not in the
        // generated Supabase types yet; the cast is scoped to the one table.
        const { data: readings } = await (
          supabase.from('mirror_readings' as never) as unknown as {
            select(cols: string): {
              eq(col: string, value: string): {
                in(col: string, values: readonly number[]): {
                  not(col: string, op: string, value: null): {
                    then<R>(onfulfilled: (v: { data: R[] | null }) => R): Promise<R>;
                  };
                };
              };
            };
          }
        )
          .select('mirror_number')
          .eq('user_id', user.id)
          .in('mirror_number', assessmentMirrors)
          .not('band', 'is', null);
        for (const row of (readings as { mirror_number: number }[]) ?? []) {
          if (!completedMirrors.includes(row.mirror_number)) {
            newlyDone.push(row.mirror_number);
          }
        }

        // Loop-map mirror: sealed when user has any user_loops row recorded
        const loopMapMirrors = MIRROR_CHECKPOINTS.filter(m => m.kind === 'loop-map');
        if (loopMapMirrors.length > 0) {
          const { count } = await supabase
            .from('user_loops')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if ((count ?? 0) > 0) {
            for (const lm of loopMapMirrors) {
              if (!completedMirrors.includes(lm.number)) newlyDone.push(lm.number);
            }
          }
        }

        if (newlyDone.length > 0) {
          completedMirrors = Array.from(new Set([...completedMirrors, ...newlyDone]));
          if (pendingNum && completedMirrors.includes(pendingNum)) pendingNum = null;
          await supabase
            .from('pre_journey_progress')
            .update({
              completed_mirror_numbers: completedMirrors,
              pending_mirror_number: pendingNum,
            } as never)
            .eq('user_id', user.id);
        }
      } catch {
        /* non-fatal */
      }

      const allSessionsDone = completedSessions.length >= PRE_JOURNEY_TOTAL;
      const allMirrorsDone = completedMirrors.length >= MIRROR_TOTAL;

      return {
        enrolled: true,
        pace,
        dailyMinutes: (data as { daily_minutes?: number }).daily_minutes ?? 30,
        notifyTime: (data as { notify_time?: string }).notify_time ?? '08:00',
        completedIds: completedSessions,
        currentSessionId: data.current_session_id || 'pj-001',
        graduated: !!data.graduated_at,
        skipped: !!(data as { skipped_at?: string | null }).skipped_at,
        paused: !!(data as { paused_at?: string | null }).paused_at,
        todayCount,
        todayTarget: PACE_TARGET[pace],
        todayDate: today,
        reflections: (data.reflections as Record<string, string>) || {},
        totalSessions: PRE_JOURNEY_TOTAL,
        progressPct: Math.round((completedSessions.length / PRE_JOURNEY_TOTAL) * 100),
        currentSession: getPreJourneySession(data.current_session_id || 'pj-001'),
        completedMirrorNumbers: completedMirrors,
        totalMirrors: MIRROR_TOTAL,
        pendingMirrorNumber: pendingNum,
        pendingMirror: pendingNum ? getMirrorByNumber(pendingNum) ?? null : null,
        mirrorsCompleted: completedMirrors.length,
        revealReady: allSessionsDone && allMirrorsDone,
        revealSeen: !!(data as { reveal_seen_at?: string }).reveal_seen_at,
      };
    },
  });

  const enroll = useMutation({
    mutationFn: async (input: PreJourneyPace | { pace: PreJourneyPace; dailyMinutes?: number; notifyTime?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const cfg = typeof input === 'string'
        ? { pace: input, dailyMinutes: 30, notifyTime: '08:00' }
        : { pace: input.pace, dailyMinutes: input.dailyMinutes ?? 30, notifyTime: input.notifyTime ?? '08:00' };

      const { error } = await supabase.from('pre_journey_progress').insert({
        user_id: user.id,
        pace: cfg.pace,
        daily_minutes: cfg.dailyMinutes,
        notify_time: cfg.notifyTime,
        current_session_id: 'pj-001',
        today_date: todayStr(),
      } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pre-journey'] }),
  });

  const setCommitment = useMutation({
    mutationFn: async ({ dailyMinutes, notifyTime }: { dailyMinutes: number; notifyTime: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('pre_journey_progress')
        .update({ daily_minutes: dailyMinutes, notify_time: notifyTime } as never)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pre-journey'] }),
  });

  const setPace = useMutation({
    mutationFn: async (pace: PreJourneyPace) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('pre_journey_progress')
        .update({ pace })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pre-journey'] }),
  });

  const completeSession = useMutation({
    mutationFn: async ({ sessionId, reflection }: { sessionId: string; reflection?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const state = query.data;
      if (!state) throw new Error('Not loaded');

      const completed = Array.from(new Set([...state.completedIds, sessionId]));
      const session = getPreJourneySession(sessionId);
      const nextNumber = (session?.number ?? 0) + 1;
      const nextSession = PRE_JOURNEY_SESSIONS.find(s => s.number === nextNumber);
      const nextId = nextSession?.id || sessionId;
      const allDone = completed.length >= PRE_JOURNEY_TOTAL;
      const today = todayStr();
      const todayCount = state.todayDate === today ? state.todayCount + 1 : 1;

      const reflections = reflection
        ? { ...state.reflections, [sessionId]: reflection }
        : state.reflections;

      // Module progress
      const moduleProgress: Record<string, string> = {};
      for (let m = 1 as PreJourneyModule; m <= 10; m++) {
        const moduleSessions = PRE_JOURNEY_SESSIONS.filter(s => s.module === m);
        const doneInModule = moduleSessions.filter(s => completed.includes(s.id)).length;
        if (doneInModule === moduleSessions.length) moduleProgress[m] = 'done';
        else if (doneInModule > 0) moduleProgress[m] = 'in_progress';
        else moduleProgress[m] = 'todo';
      }

      // After every 2nd session, queue the corresponding mirror checkpoint.
      const mirrorAfter = getMirrorAfterSession(session?.number ?? 0);
      const alreadyDoneMirror = state.completedMirrorNumbers.includes(mirrorAfter?.number ?? -1);
      const pendingMirrorNumber = mirrorAfter && !alreadyDoneMirror
        ? mirrorAfter.number
        : (state.pendingMirrorNumber ?? null);

      const { error } = await supabase.from('pre_journey_progress').update({
        completed_session_ids: completed,
        current_session_id: nextId,
        reflections,
        module_progress: moduleProgress,
        last_session_at: new Date().toISOString(),
        today_count: todayCount,
        today_date: today,
        graduated_at: allDone ? new Date().toISOString() : null,
        pending_mirror_number: pendingMirrorNumber,
      } as never).eq('user_id', user.id);
      if (error) throw error;

      // Fire-and-forget: emit to consciousness engine + extract memory from reflection
      // so the Mirror starts learning from Foundation session 1.
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (authSession) {
          const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authSession.access_token}`,
          };
          const base = import.meta.env.VITE_SUPABASE_URL;

          // Always tell engine a session was completed
          fetch(`${base}/functions/v1/consciousness-engine`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              action: 'session_completed',
              source: 'pre_journey',
              sessionId,
              metadata: {
                module: session?.module,
                title: session?.title,
                graduated: allDone,
              },
            }),
          }).catch(() => {});

          // If user wrote a reflection, run it through 3-lens + memory extract
          if (reflection && reflection.trim().length > 20) {
            const text = `Q: ${session?.reflectionPrompt}\nA: ${reflection}`;
            fetch(`${base}/functions/v1/three-lens-analyzer`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                text,
                sourceType: 'pre_journey_reflection',
                sourceId: sessionId,
              }),
            }).catch(() => {});
            fetch(`${base}/functions/v1/memory-extract`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                text,
                sourceType: 'pre_journey_reflection',
                sourceId: sessionId,
              }),
            }).catch(() => {});
          }
        }
      } catch {
        // non-fatal — completion already saved to DB
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pre-journey'] });
      qc.invalidateQueries({ queryKey: ['consciousness-engine'] });
    },
  });

  const jumpToSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('pre_journey_progress')
        .update({ current_session_id: sessionId })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pre-journey'] }),
  });

  /**
   * Skip the Foundation Course on the Home page. The user can still continue
   * the 60 sessions + 100 mirrors in parallel from Settings — we just hide the
   * prominent Home card and stop blocking the main daily flow.
   */
  const skip = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      // Ensure a row exists so we can mark it skipped
      await supabase.from('pre_journey_progress').upsert({
        user_id: user.id,
        skipped_at: new Date().toISOString(),
      } as never, { onConflict: 'user_id' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pre-journey'] }),
  });

  /**
   * Pause the Foundation Course. Home reverts to the normal daily flow
   * (theme, orb, whisper, ritual) until the user resumes. Progress is preserved.
   */
  const pause = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      await supabase.from('pre_journey_progress').upsert({
        user_id: user.id,
        paused_at: new Date().toISOString(),
      } as never, { onConflict: 'user_id' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pre-journey'] }),
  });

  const resume = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('pre_journey_progress')
        .update({ paused_at: null } as never)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pre-journey'] }),
  });

  const unskip = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('pre_journey_progress')
        .update({ skipped_at: null } as never)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pre-journey'] }),
  });

  return {
    ...query,
    state: query.data,
    enroll,
    setPace,
    setCommitment,
    completeSession,
    jumpToSession,
    skip,
    unskip,
    pause,
    resume,
  };
}
