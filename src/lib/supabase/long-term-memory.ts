/**
 * CLIENT-SIDE LONG-TERM MEMORY — buildLongTermMemoryBlock
 * ============================================================
 * Calls the build-long-term-memory edge function.
 * Used to inject felt-continuity memory into every engine call.
 */

import { supabase } from '@/lib/supabase';

export interface MemoryBlockOptions {
  userId: string;
  queryText: string;
  activeLoops: string[];
  minDaysAgo?: number;
  matchCount?: number;
}

/**
 * Build the long-term memory block for injection into AI prompts.
 * Returns markdown-formatted memory context.
 */
export async function buildLongTermMemoryBlock(options: MemoryBlockOptions): Promise<string> {
  const { data, error } = await supabase.functions.invoke('build-long-term-memory', {
    body: options,
  });

  if (error) {
    console.warn('[buildLongTermMemoryBlock] Edge function error:', error);
    return '';
  }

  if (!data?.ok) {
    console.warn('[buildLongTermMemoryBlock] Request failed:', data?.error);
    return '';
  }

  return data.memoryBlock || '';
}

/**
 * Embed text using the embed-memory edge function.
 */
export async function embedText(text: string): Promise<number[] | null> {
  if (!text || !text.trim()) return null;
  const { data, error } = await supabase.functions.invoke('embed-memory', {
    body: { content: text, source_type: 'session_step' },
  });

  if (error || !data?.embedding) {
    console.warn('[embedText] Failed:', error);
    return null;
  }

  return data.embedding as number[];
}

/**
 * Recall memories via the recall-memory edge function.
 */
export async function recallMemory(
  userId: string,
  queryText: string,
  options: { matchCount?: number; minDaysAgo?: number; sourceTypes?: string[] } = {}
): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke('recall-memory', {
    body: { userId, queryText, ...options },
  });

  if (error || !data?.memories) {
    console.warn('[recallMemory] Failed:', error);
    return [];
  }

  return data.memories;
}