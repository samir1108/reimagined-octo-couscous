import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Memory {
  id: string;
  content: string;
  importance: number;
  category: string;
  tags: string[];
  emotional_tone: string;
  dimension_relevant: string;
  linked_loops: string[];
  created_at: string;
  decay_factor: number;
  pattern_cluster: string | null;
  access_count: number;
  is_consolidated: boolean;
}

export interface MemoryPattern {
  id: string;
  pattern_name: string;
  description: string;
  frequency: number;
  first_seen_at: string;
  last_seen_at: string;
  dimension: string | null;
  linked_loops: string[];
  emotional_trend: string | null;
  significance: string;
  is_active: boolean;
}

export function useMemories(category?: string) {
  return useQuery<Memory[]>({
    queryKey: ['guru-memories', category],
    queryFn: async () => {
      let query = (supabase
        .from('guru_memory') as any)
        .select('*')
        .eq('is_consolidated', false)
        .is('consolidated_into', null)
        .order('importance', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (category) query = query.eq('category', category);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Memory[];
    },
  });
}

export function useMemoryPatterns() {
  return useQuery<MemoryPattern[]>({
    queryKey: ['memory-patterns'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('memory_patterns') as any)
        .select('*')
        .eq('is_active', true)
        .order('frequency', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as MemoryPattern[];
    },
  });
}

export function useDeleteMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('guru_memory') as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guru-memories'] }),
  });
}

export function useConsolidateMemories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/memory-consolidate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || 'Consolidation failed');
      }

      return resp.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guru-memories'] });
      qc.invalidateQueries({ queryKey: ['memory-patterns'] });
    },
  });
}
