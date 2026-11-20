import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { MirrorBand, MirrorHistoryEntry } from '@/lib/mirrors/adaptiveEngine';
import type { MirrorTier } from '@/data/mirrors/types';
import { getBank } from '@/data/mirrors/registry';

/**
 * The user's mirror history, shaped for the adaptive engine.
 *
 * This is the read side of the depth loop. planMirror() uses it to decide
 * which tier to ask at, which dimensions are already covered, and whether a
 * repeated mirror has earned an escalation.
 *
 * `primary_id` is not stored — it is derived from the highest sub-score
 * percentage, which is exactly how the scoring engine picked it in the first
 * place. Deriving it means a re-score after a question-bank revision can never
 * disagree with the headline.
 */

interface MirrorReadingRecord {
  mirror_number: number;
  mirror_slug: string;
  sub_scores: Record<string, number> | null;
  confidence: number | null;
  band: string | null;
  tags: string[] | null;
  updated_at: string;
}

const VALID_BANDS: readonly MirrorBand[] = ['preliminary', 'inferred', 'read', 'locked'];

/**
 * `mirror_readings` gained columns in 20260930000001_mirror_readings_to_100.sql
 * that are not in the generated Supabase types yet. This narrows the client to
 * exactly the shape this hook uses rather than casting the whole client to
 * `any`, so a column rename still surfaces as a type error here.
 */
function mirrorReadings() {
  return supabase.from('mirror_readings' as never) as unknown as {
    select(columns: string): {
      eq(column: string, value: string): {
        in(column: string, values: readonly string[]): {
          order(column: string, opts: { ascending: boolean }): {
            then<R>(
              onfulfilled: (value: { data: R[] | null; error: unknown }) => R,
            ): Promise<R>;
          };
        };
      };
    };
    upsert(
      values: Record<string, unknown>,
      opts: { onConflict: string },
    ): Promise<{ error: unknown }>;
  };
}

function derivePrimary(slug: string, subScores: Record<string, number>): string {
  const entries = Object.entries(subScores).filter(([, v]) => Number.isFinite(v));
  if (entries.length === 0) {
    // No sub-scores recorded (a reading written before this column existed).
    // Fall back to the bank's first result type so the entry is still usable.
    return getBank(slug)?.resultTypes[0]?.id ?? slug;
  }
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function toHistoryEntry(row: MirrorReadingRecord): MirrorHistoryEntry {
  const subScores = row.sub_scores ?? {};
  return {
    slug: row.mirror_slug,
    mirrorNumber: row.mirror_number,
    completedAt: row.updated_at,
    primaryId: derivePrimary(row.mirror_slug, subScores),
    percentages: subScores,
    confidence: Number(row.confidence ?? 0),
    band: (VALID_BANDS as readonly string[]).includes(row.band ?? '')
      ? (row.band as MirrorBand)
      : 'preliminary',
    tags: row.tags ?? [],
  };
}

export function useMirrorHistory() {
  return useQuery({
    queryKey: ['mirror-history'],
    queryFn: async (): Promise<MirrorHistoryEntry[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await mirrorReadings()
        .select('mirror_number,mirror_slug,sub_scores,confidence,band,tags,updated_at')
        .eq('user_id', user.id)
        .in('band', ['preliminary', 'inferred', 'read'])
        .order('mirror_number', { ascending: true });

      if (error) throw error;
      return ((data as MirrorReadingRecord[] | null) ?? []).map(toHistoryEntry);
    },
    staleTime: 60_000,
  });
}

export interface MirrorReadingWrite {
  mirrorNumber: number;
  slug: string;
  title: string;
  module: string;
  /** Headline score, 0..100 — the primary sub-score. */
  score: number;
  confidence: number;
  band: MirrorBand;
  /** Per-dimension percentages, 0..100. */
  subScores: Record<string, number>;
  tags: string[];
  tier: MirrorTier;
  prunedCount: number;
  evidence: string;
  readingNote: string;
  dayZero: boolean;
  source: 'user_mirror' | 'elder_onboarding' | 'engine_inferred';
}

/**
 * Persist a completed mirror reading.
 *
 * Upserts on (user_id, mirror_number) so re-taking a mirror deepens the same
 * row rather than accumulating duplicates — the adaptive engine reads history
 * as one entry per checkpoint.
 */
export function useWriteMirrorReading() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: MirrorReadingWrite) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await mirrorReadings().upsert(
        {
          user_id: user.id,
          mirror_number: input.mirrorNumber,
          mirror_slug: input.slug,
          title: input.title,
          module: input.module,
          score: Math.max(0, Math.min(100, Math.round(input.score))),
          confidence: input.confidence,
          band: input.band,
          sub_scores: input.subScores,
          tags: input.tags,
          tier: input.tier,
          pruned_count: input.prunedCount,
          evidence: input.evidence,
          reading_note: input.readingNote,
          day_zero: input.dayZero,
          source: input.source,
        },
        { onConflict: 'user_id,mirror_number' },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mirror-history'] });
      qc.invalidateQueries({ queryKey: ['mirror-readings'] });
      qc.invalidateQueries({ queryKey: ['pre-journey'] });
      qc.invalidateQueries({ queryKey: ['consciousness-engine'] });
    },
  });
}
