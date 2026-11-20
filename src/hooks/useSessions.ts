import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { playSoundEffect } from '@/lib/soundEffects';
import { clearThemeCache } from '@/hooks/useThemeOfDay';
import type { Session } from '@/types/database';

/** Always compute fresh date — never cache at module level */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function useTodaySessions() {
  return useQuery<Session[]>({
    queryKey: ['sessions', today()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_date', today())
        .order('started_at', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Session[];
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { timeSlot: string; themeId: string; type?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if an active session for this slot already exists today
      const { data: existing } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_date', today())
        .eq('time_slot', params.timeSlot)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        return existing as unknown as Session;
      }

      const themeIdToUse = params.themeId && params.themeId.length > 0 ? params.themeId : null;
      
      let { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          session_date: today(),
          time_slot: params.timeSlot,
          type: params.type || 'guide',
          theme_id: themeIdToUse,
          status: 'active',
        })
        .select()
        .single();
      
      // If FK constraint fails (invalid theme_id), retry without it
      if (error && error.code === '23503') {
        const retry = await supabase
          .from('sessions')
          .insert({
            user_id: user.id,
            session_date: today(),
            time_slot: params.timeSlot,
            type: params.type || 'guide',
            theme_id: null,
            status: 'active',
          })
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }
      if (error) throw error;
      return data as unknown as Session;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}

export function useEndSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) throw error;

      // Human Map: bump counter & integrate every 2 sessions (fire-and-forget).
      (async () => {
        try {
          const { data: u } = await supabase.auth.getUser();
          if (!u.user) return;
          const { data: prog } = await supabase
            .from('mirror_progress' as any)
            .select('sessions_since_integration')
            .eq('user_id', u.user.id)
            .maybeSingle();
          const next = ((prog as any)?.sessions_since_integration ?? 0) + 1;
          await supabase
            .from('mirror_progress' as any)
            .upsert(
              { user_id: u.user.id, sessions_since_integration: next },
              { onConflict: 'user_id' }
            );
          if (next >= 2) {
            await supabase.functions.invoke('integrate-human-map', { body: {} });
          }
        } catch (e) {
          console.warn('[human-map] post-session integration skipped', e);
        }
      })();

      // NOTE: 3-Lens analysis + memory extraction are now LAZY — they only
      // run when the user opens this session in History (see lazyAnalysis.ts).
      // We still kick off engine tick + master next-step here because those
      // affect the NEXT session's experience, not the history view.
      const { data: messages } = await supabase
        .from('session_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messages && messages.length > 2) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/consciousness-engine`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ action: 'session_completed' }),
            }
          ).catch(() => { /* fire-and-forget */ });

          // Master's next micro-step — stored as notification for later
          fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-master-next-step`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ sessionId, sessionType: 'guide' }),
            }
          ).catch(() => { /* fire-and-forget */ });

          // Living Theme Engine — deepen / hold / close today's theme.
          // Awaited so the cache invalidation below picks up the new fields.
          try {
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evolve-theme`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ sessionId }),
              }
            );
          } catch { /* non-fatal */ }
        }
      }
    },
    onSuccess: () => {
      playSoundEffect('success');
      // Clear localStorage theme cache so Practice tab gets fresh data
      clearThemeCache();
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['theme-of-day'] });
      qc.invalidateQueries({ queryKey: ['observation-tasks'] });
      qc.invalidateQueries({ queryKey: ['daily-tasks'] });
      qc.invalidateQueries({ queryKey: ['consciousness-engine'] });
      qc.invalidateQueries({ queryKey: ['guide-history-sessions'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSaveMessage() {
  return useMutation({
    mutationFn: async (params: { sessionId: string; role: string; content: string }) => {
      const { error } = await supabase
        .from('session_messages')
        .insert({
          session_id: params.sessionId,
          role: params.role,
          content: params.content,
        });
      if (error) throw error;
    },
  });
}

export function useSessionMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['session-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!sessionId,
  });
}