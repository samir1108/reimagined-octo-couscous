import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { playSoundEffect } from '@/lib/soundEffects';
import { toast } from 'sonner';
import type { JournalEntry } from '@/types/database';

export function useJournalEntries(userId?: string, limit = 50) {
  return useQuery<JournalEntry[]>({
    queryKey: ['journal-entries', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as JournalEntry[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { title?: string; content: string; mood?: string; sessionId?: string; threadId?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: params.title || null,
          content: params.content,
          mood: params.mood || null,
          session_id: params.sessionId || null,
          thread_id: params.threadId || null,
        } as any)
        .select()
        .single();
      if (error) throw error;

      // Award karma for journaling (throttled server-side to 15 min)
      if (params.content && params.content.length >= 20) {
        try {
          await (supabase.rpc as any)('award_karma_event', {
            p_source: 'journal_entry',
            p_base: 5,
            p_weight: 1.0,
            p_metadata: { length: params.content.length, sessionId: params.sessionId ?? null },
          });
        } catch { /* non-fatal */ }
      }

      // NOTE: 3-Lens analysis, memory extraction, and embedding are now LAZY —
      // they only run when the user opens this entry in Journal History
      // (see lazyAnalysis.ts). We still tick the consciousness engine here
      // because it affects the next session's experience.
      if (params.content && params.content.length > 20) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          };
          const baseUrl = import.meta.env.VITE_SUPABASE_URL;

          fetch(`${baseUrl}/functions/v1/consciousness-engine`, {
            method: 'POST', headers,
            body: JSON.stringify({ action: 'journal_completed' }),
          }).catch(() => {});
        }
      }

      // Sacred Karma — server-side AI verification (capped, cooldowns enforced).
      // No karma is awarded for the act of journaling itself anymore.
      if (params.content && params.content.length >= 60) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const baseUrl = import.meta.env.VITE_SUPABASE_URL;
          fetch(`${baseUrl}/functions/v1/verify-breakthrough`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              text: params.content,
              sourceType: 'journal',
              sourceId: data.id,
            }),
          })
            .then(r => r.ok ? r.json() : null)
            .then(res => {
              if (res?.verified && res?.awarded > 0) {
                toast.success(`✨ Breakthrough verified: +${res.awarded} karma`, {
                  description: res.breakthrough_name ?? undefined,
                  duration: 6000,
                });
              }
            })
            .catch(() => {});
        }
      }

      return data as unknown as JournalEntry;
    },
    onSuccess: () => {
      playSoundEffect('success');
      qc.invalidateQueries({ queryKey: ['journal-entries'] });
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['consciousness-engine'] });
        qc.invalidateQueries({ queryKey: ['theme-of-day'] });
      }, 3000);
    },
  });
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal-entries'] }),
  });
}