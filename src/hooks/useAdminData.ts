import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data as {
        total_users: number;
        onboarded_users: number;
        total_sessions: number;
        total_journals: number;
        total_tasks: number;
        completed_tasks: number;
        total_memories: number;
        total_orgs: number;
        active_challenges: number;
        avg_consciousness_band: number;
        sessions_today: number;
        signups_last_30_days: { signup_date: string; count: number }[];
      };
    },
    refetchInterval: 30000,
  });
}

export function useAdminUsers(search: string, page: number) {
  const limit = 50;
  return useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_users', {
        p_search: search,
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as {
        users: {
          id: string;
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          onboarded: boolean;
          created_at: string;
          overall_band: number | null;
          journey_phase: string | null;
          journey_day: number | null;
          streak_current: number | null;
          total_sessions: number | null;
          total_journal_entries: number | null;
          v_level_current: number | null;
        }[];
        total: number;
      };
    },
  });
}

export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_user_detail', {
        p_user_id: userId,
      });
      if (error) throw error;
      return data as {
        profile: any;
        consciousness: any;
        psyche: any;
        loops: any[];
        samskaras: any[];
        recent_sessions: any[];
        recent_journals: any[];
        memories_count: number;
        org_memberships: any[];
      };
    },
    enabled: !!userId,
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_analytics');
      if (error) throw error;
      return data as {
        band_distribution: { band_range: string; user_count: number }[];
        session_trends: { session_date: string; session_count: number }[];
        top_loops: { loop_id: string; user_count: number }[];
        orgs_summary: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          member_count: number;
          active_challenges: number;
        }[];
        retention_7d: number;
        retention_30d: number;
        retention_90d: number;
      };
    },
    refetchInterval: 60000,
  });
}

export function useAdminActivityFeed() {
  return useQuery({
    queryKey: ['admin-activity-feed'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_activity_feed', { p_limit: 50 });
      if (error) throw error;
      return (data || []) as {
        id: string;
        event_type: string;
        event_name: string;
        metadata: any;
        created_at: string;
        display_name: string | null;
        avatar_url: string | null;
      }[];
    },
    refetchInterval: 10000,
  });
}

export function useAdminHealthOverview() {
  return useQuery({
    queryKey: ['admin-health-overview'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_health_overview');
      if (error) throw error;
      return data as {
        total_scored: number;
        healthy: number;
        warning: number;
        at_risk: number;
        critical: number;
        avg_engagement: number;
        avg_churn_risk: number;
        at_risk_users: {
          user_id: string;
          health_score: number;
          churn_risk: number;
          risk_level: string;
          risk_factors: any[];
          last_active_at: string | null;
          display_name: string | null;
          avatar_url: string | null;
        }[];
      };
    },
    refetchInterval: 60000,
  });
}

export function useComputeHealthScores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('compute_user_health_scores');
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-health-overview'] });
    },
  });
}

export function useAdminUserTimeline(userId: string) {
  return useQuery({
    queryKey: ['admin-user-timeline', userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_user_timeline', { p_user_id: userId });
      if (error) throw error;
      return (data || []) as {
        event_type: string;
        event_name: string;
        created_at: string;
        metadata: any;
      }[];
    },
    enabled: !!userId,
  });
}

export function useAdminAIInsights(userId: string) {
  return useQuery({
    queryKey: ['admin-ai-insights', userId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-ai-insights', {
        body: { user_id: userId },
      });
      if (error) throw error;
      return data as { analysis: string };
    },
    enabled: false, // manually triggered
  });
}
