/**
 * PRACTICE OUTCOME TRACKING — Closes the practice→dimension feedback loop
 * Tracks predicted vs actual dimension deltas, personalizes impact matrix per user
 */

import { supabase } from '@/lib/supabase';
import type { DimensionId } from '@/types/consciousness';
import type { PracticeId } from '@/types/practices';
import { DIMENSION_IMPACT_MATRIX } from '@/types/dimension-matrix';

export interface PracticeOutcome {
  id: string;
  user_id: string;
  practice_id: PracticeId;
  practice_level: number;
  session_id: string | null;
  predicted_deltas: Record<DimensionId, number>;
  actual_deltas: Record<DimensionId, number>;
  quality_score: number;           // 0-1 user-rated or inferred quality
  duration_minutes: number;
  completed: boolean;
  completed_at: string;
  created_at: string;
}

export interface PersonalizedImpactMatrix {
  user_id: string;
  practice_id: PracticeId;
  dimension_impacts: Record<DimensionId, number>;  // Learned impact per dimension
  sample_count: number;
  last_updated: string;
  confidence: number;  // 0-1 based on sample_count
}

/** Record a practice outcome after session completion */
export async function recordPracticeOutcome(input: {
  practiceId: PracticeId;
  practiceLevel: number;
  sessionId: string | null;
  qualityScore: number;
  durationMinutes: number;
  completed: boolean;
  predictedDeltas: Record<DimensionId, number>;
  actualDeltas: Record<DimensionId, number>;
}): Promise<PracticeOutcome> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const outcome = {
    id: crypto.randomUUID(),
    user_id: user.id,
    practice_id: input.practiceId,
    practice_level: input.practiceLevel,
    session_id: input.sessionId,
    predicted_deltas: input.predictedDeltas,
    actual_deltas: input.actualDeltas,
    quality_score: input.qualityScore,
    duration_minutes: input.durationMinutes,
    completed: input.completed,
    completed_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('practice_outcomes')
    .insert(outcome)
    .select()
    .single();

  if (error || !data) throw new Error('Failed to record practice outcome');

  // Update personalized impact matrix asynchronously
  updatePersonalizedImpactMatrix(user.id, input.practiceId, input.predictedDeltas, input.actualDeltas, input.qualityScore).catch(console.warn);

  return data as PracticeOutcome;
}

/** Update personalized impact matrix based on outcome */
async function updatePersonalizedImpactMatrix(
  userId: string,
  practiceId: PracticeId,
  predicted: Record<DimensionId, number>,
  actual: Record<DimensionId, number>,
  qualityScore: number
): Promise<void> {
  // Get current matrix
  const { data: existing } = await supabase
    .from('personalized_impact_matrix')
    .select('*')
    .eq('user_id', userId)
    .eq('practice_id', practiceId)
    .maybeSingle();

  const currentImpacts = existing?.dimension_impacts || DIMENSION_IMPACT_MATRIX[practiceId] || {};
  const sampleCount = (existing?.sample_count || 0) + 1;
  
  // Weight new observation by quality score
  const weight = qualityScore * 0.3 + 0.1; // 0.1-0.4 weight for new data
  const oldWeight = 1 - weight;

  const updatedImpacts: Record<DimensionId, number> = {};
  for (const dim of ['thought', 'emotion', 'body', 'awareness', 'action', 'connection'] as DimensionId[]) {
    const predictedVal = predicted[dim] || 0;
    const actualVal = actual[dim] || 0;
    const baseImpact = currentImpacts[dim] || DIMENSION_IMPACT_MATRIX[practiceId]?.[dim] || 0;
    
    // If actual > predicted, increase impact; if less, decrease
    const ratio = predictedVal > 0 ? actualVal / predictedVal : 1;
    updatedImpacts[dim] = baseImpact * oldWeight + (baseImpact * ratio) * weight;
    
    // Clamp to reasonable bounds
    updatedImpacts[dim] = Math.max(0, Math.min(4, updatedImpacts[dim]));
  }

  const confidence = Math.min(1, sampleCount / 20); // Full confidence at 20 samples

  await supabase
    .from('personalized_impact_matrix')
    .upsert({
      user_id: userId,
      practice_id: practiceId,
      dimension_impacts: updatedImpacts,
      sample_count: sampleCount,
      last_updated: new Date().toISOString(),
      confidence,
    }, { onConflict: 'user_id,practice_id' });
}

/** Get personalized impact matrix for a user (falls back to global) */
export async function getPersonalizedImpactMatrix(userId: string): Promise<Record<PracticeId, Record<DimensionId, number>>> {
  const { data } = await supabase
    .from('personalized_impact_matrix')
    .select('practice_id, dimension_impacts, confidence')
    .eq('user_id', userId);

  const result: Record<PracticeId, Record<DimensionId, number>> = {};
  
  if (data) {
    for (const row of data) {
      if (row.confidence > 0.3) { // Only use if confident enough
        result[row.practice_id as PracticeId] = row.dimension_impacts;
      }
    }
  }

  // Merge with global matrix for practices without personalization
  for (const [practiceId, impacts] of Object.entries(DIMENSION_IMPACT_MATRIX)) {
    if (!result[practiceId]) {
      result[practiceId as PracticeId] = impacts;
    }
  }

  return result;
}

/** Get prediction accuracy stats for a user */
export async function getPredictionAccuracy(userId: string): Promise<{
  overallAccuracy: number;
  perPractice: Record<PracticeId, { accuracy: number; samples: number }>;
  perDimension: Record<DimensionId, { accuracy: number; samples: number }>;
}> {
  const { data } = await supabase
    .from('practice_outcomes')
    .select('practice_id, predicted_deltas, actual_deltas, quality_score')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('created_at', { ascending: false })
    .limit(200);

  if (!data || data.length === 0) {
    return { overallAccuracy: 0, perPractice: {}, perDimension: {} };
  }

  let totalError = 0;
  let totalPredictions = 0;
  const perPractice: Record<PracticeId, { error: number; count: number }> = {};
  const perDimension: Record<DimensionId, { error: number; count: number }> = {};

  for (const row of data) {
    const predicted = row.predicted_deltas as Record<DimensionId, number>;
    const actual = row.actual_deltas as Record<DimensionId, number>;
    
    for (const dim of ['thought', 'emotion', 'body', 'awareness', 'action', 'connection'] as DimensionId[]) {
      const pred = predicted[dim] || 0;
      const act = actual[dim] || 0;
      if (pred > 0 || act > 0) {
        const error = Math.abs(pred - act);
        totalError += error;
        totalPredictions++;

        // Per practice
        const pid = row.practice_id as PracticeId;
        if (!perPractice[pid]) perPractice[pid] = { error: 0, count: 0 };
        perPractice[pid].error += error;
        perPractice[pid].count++;

        // Per dimension
        if (!perDimension[dim]) perDimension[dim] = { error: 0, count: 0 };
        perDimension[dim].error += error;
        perDimension[dim].count++;
      }
    }
  }

  const overallAccuracy = totalPredictions > 0 ? 1 - (totalError / totalPredictions) : 0;

  const perPracticeResult: Record<PracticeId, { accuracy: number; samples: number }> = {};
  for (const [pid, stats] of Object.entries(perPractice)) {
    perPracticeResult[pid as PracticeId] = {
      accuracy: Math.max(0, 1 - stats.error / stats.count),
      samples: stats.count,
    };
  }

  const perDimensionResult: Record<DimensionId, { accuracy: number; samples: number }> = {};
  for (const [dim, stats] of Object.entries(perDimension)) {
    perDimensionResult[dim as DimensionId] = {
      accuracy: Math.max(0, 1 - stats.error / stats.count),
      samples: stats.count,
    };
  }

  return { overallAccuracy: Math.max(0, overallAccuracy), perPractice: perPracticeResult, perDimension: perDimensionResult };
}

/** Feed prediction accuracy into recalibration intelligence */
export async function feedRecalibrationSignals(userId: string): Promise<void> {
  const accuracy = await getPredictionAccuracy(userId);
  
  // If overall accuracy drops below threshold, trigger recalibration
  if (accuracy.overallAccuracy < 0.6) {
    await supabase.from('recalibration_signals').insert({
      user_id: userId,
      signal_type: 'practice_effectiveness_drop',
      severity: accuracy.overallAccuracy < 0.4 ? 'high' : 'medium',
      payload: { overallAccuracy: accuracy.overallAccuracy, perPractice: accuracy.perPractice },
      created_at: new Date().toISOString(),
    });
  }
}