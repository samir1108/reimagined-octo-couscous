import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { playSoundEffect } from '@/lib/soundEffects';
import type { ObservationTask, DailyTask } from '@/types/database';

/** Always compute fresh date */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function useObservationTasks() {
  return useQuery<ObservationTask[]>({
    queryKey: ['observation-tasks', today()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('observation_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today())
        .order('chain_order', { ascending: true });
      if (error) {
        console.warn('[tasks] observation_tasks query failed:', error.message);
        return [];
      }
      return (data || []) as unknown as ObservationTask[];
    },
  });
}

export function useCompleteObservationTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { taskId: string; reflection: string }) => {
      const { error } = await supabase
        .from('observation_tasks')
        .update({
          status: 'completed',
          reflection: params.reflection,
          completed_at: new Date().toISOString(),
        })
        .eq('id', params.taskId);
      if (error) throw error;

      // Generate next task via edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complete-task`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ taskId: params.taskId }),
          }
        );
      }
    },
    onSuccess: () => {
      playSoundEffect('success');
      qc.invalidateQueries({ queryKey: ['observation-tasks'] });
      qc.invalidateQueries({ queryKey: ['theme-of-day'] });
    },
  });
}

export function useDailyTasks() {
  return useQuery<DailyTask[]>({
    queryKey: ['daily-tasks', today()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today())
        .order('time_slot');
      if (error) {
        console.warn('[tasks] daily_tasks query failed:', error.message);
        return [];
      }
      return (data || []) as unknown as DailyTask[];
    },
  });
}

export function useCompleteDailyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('daily_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      playSoundEffect('success');
      qc.invalidateQueries({ queryKey: ['daily-tasks'] });
      qc.invalidateQueries({ queryKey: ['theme-of-day'] });
    },
  });
}