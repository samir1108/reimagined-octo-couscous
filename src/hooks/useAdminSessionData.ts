import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAdminSessions(search: string, type: string | null, page: number) {
  const limit = 30;
  return useQuery({
    queryKey: ['admin-sessions', search, type, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_sessions', {
        p_search: search,
        p_type: type || undefined,
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as {
        sessions: {
          id: string;
          user_id: string;
          session_date: string;
          time_slot: string;
          type: string;
          status: string;
          started_at: string;
          completed_at: string | null;
          ended_at: string | null;
          summary: string | null;
          created_at: string;
          display_name: string | null;
          avatar_url: string | null;
          message_count: number;
          duration_minutes: number;
        }[];
        total: number;
      };
    },
    refetchInterval: 30000,
  });
}

export function useAdminSessionMessages(sessionId: string) {
  return useQuery({
    queryKey: ['admin-session-messages', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_session_messages', {
        p_session_id: sessionId,
      });
      if (error) throw error;
      return (data || []) as {
        id: string;
        role: string;
        content: string;
        created_at: string;
      }[];
    },
    enabled: !!sessionId,
  });
}

export function useAdminFunnel() {
  return useQuery({
    queryKey: ['admin-funnel'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_funnel');
      if (error) throw error;
      return data as {
        total_signups: number;
        onboarded: number;
        had_first_session: number;
        had_3_sessions: number;
        had_journal: number;
        active_7d: number;
        active_30d: number;
        streak_3plus: number;
        completed_task: number;
        band_above_3: number;
        top_session_types: { type: string; cnt: number }[];
        avg_session_duration_min: number;
        sessions_per_user_avg: number;
      };
    },
    refetchInterval: 60000,
  });
}
