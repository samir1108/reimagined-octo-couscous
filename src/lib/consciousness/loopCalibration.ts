/**
 * LOOP DETECTION CALIBRATION — Per-user keyword/phrase weight learning
 * Learns from user confirmations/denials to improve local detection accuracy
 */

import { supabase } from '@/lib/supabase';

export interface LoopCalibration {
  id: string;
  user_id: string;
  loop_id: string;
  keyword_weights: Record<string, number>;    // keyword -> weight (0-1)
  phrase_weights: Record<string, number>;     // phrase -> weight (0-1)
  false_positive_rate: number;                // 0-1
  false_negative_rate: number;                // 0-1
  total_confirmations: number;
  total_denials: number;
  last_updated: string;
  created_at: string;
}

export interface CalibrationInput {
  loopId: string;
  keyword: string;
  wasCorrect: boolean;      // true if user confirmed, false if denied
  source: 'local' | 'ai' | 'manual';
}

/** Initialize calibration for a loop if not exists */
export async function ensureLoopCalibration(userId: string, loopId: string): Promise<LoopCalibration> {
  const { data: existing } = await supabase
    .from('loop_calibrations')
    .select('*')
    .eq('user_id', userId)
    .eq('loop_id', loopId)
    .maybeSingle();

  if (existing) return existing as LoopCalibration;

  // Start with default weights from loop library
  const { data: loopDef } = await supabase
    .from('loop_definitions')
    .select('keywords, phrases')
    .eq('id', loopId)
    .maybeSingle();

  const defaultKeywordWeights: Record<string, number> = {};
  const defaultPhraseWeights: Record<string, number> = {};

  if (loopDef) {
    for (const kw of loopDef.keywords || []) defaultKeywordWeights[kw] = 0.5;
    for (const ph of loopDef.phrases || []) defaultPhraseWeights[ph] = 0.7;
  }

  const { data: created, error } = await supabase
    .from('loop_calibrations')
    .insert({
      user_id: userId,
      loop_id: loopId,
      keyword_weights: defaultKeywordWeights,
      phrase_weights: defaultPhraseWeights,
      false_positive_rate: 0,
      false_negative_rate: 0,
      total_confirmations: 0,
      total_denials: 0,
    })
    .select()
    .single();

  if (error || !created) throw new Error('Failed to create loop calibration');
  return created as LoopCalibration;
}

/** Update calibration based on user feedback */
export async function updateLoopCalibration(input: CalibrationInput): Promise<LoopCalibration> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const calibration = await ensureLoopCalibration(user.id, input.loopId);

  const keywordWeights = { ...calibration.keyword_weights };
  const phraseWeights = { ...calibration.phrase_weights };

  const LEARNING_RATE = 0.1;
  const DECAY_RATE = 0.01;

  // Decay all weights slightly (forgetting)
  for (const k of Object.keys(keywordWeights)) {
    keywordWeights[k] = Math.max(0.1, keywordWeights[k] - DECAY_RATE);
  }
  for (const p of Object.keys(phraseWeights)) {
    phraseWeights[p] = Math.max(0.1, phraseWeights[p] - DECAY_RATE);
  }

  // Update the specific keyword/phrase
  const targetWeights = input.keyword.includes(' ') ? phraseWeights : keywordWeights;
  const currentWeight = targetWeights[input.keyword] || 0.5;

  if (input.wasCorrect) {
    targetWeights[input.keyword] = Math.min(1, currentWeight + LEARNING_RATE);
  } else {
    targetWeights[input.keyword] = Math.max(0.1, currentWeight - LEARNING_RATE * 2);
  }

  const updates: Partial<LoopCalibration> = {
    keyword_weights: keywordWeights,
    phrase_weights: phraseWeights,
    last_updated: new Date().toISOString(),
  };

  if (input.wasCorrect) {
    updates.total_confirmations = calibration.total_confirmations + 1;
  } else {
    updates.total_denials = calibration.total_denials + 1;
  }

  // Recalculate rates
  const total = updates.total_confirmations! + updates.total_denials!;
  if (total > 0) {
    updates.false_positive_rate = updates.total_denials! / total;
    // False negative rate would need tracking of missed detections
    updates.false_negative_rate = Math.max(0, calibration.false_negative_rate - (input.wasCorrect ? 0.01 : 0));
  }

  const { data, error } = await supabase
    .from('loop_calibrations')
    .update(updates)
    .eq('id', calibration.id)
    .select()
    .single();

  if (error || !data) throw new Error('Failed to update loop calibration');
  return data as LoopCalibration;
}

/** Get calibrated weights for local detection */
export async function getCalibratedWeights(userId: string, loopId: string): Promise<{
  keywordWeights: Record<string, number>;
  phraseWeights: Record<string, number>;
}> {
  const { data } = await supabase
    .from('loop_calibrations')
    .select('keyword_weights, phrase_weights')
    .eq('user_id', userId)
    .eq('loop_id', loopId)
    .maybeSingle();

  return {
    keywordWeights: (data as any)?.keyword_weights || {},
    phraseWeights: (data as any)?.phrase_weights || {},
  };
}

/** Apply calibrated weights to local detection scores */
export function applyCalibrationToScores(
  baseScores: Map<string, number>,  // loopId -> base confidence
  calibrations: Record<string, { keywordWeights: Record<string, number>; phraseWeights: Record<string, number> }>
): Map<string, number> {
  const adjusted = new Map<string, number>();

  for (const [loopId, baseScore] of baseScores) {
    const cal = calibrations[loopId];
    if (!cal) {
      adjusted.set(loopId, baseScore);
      continue;
    }

    // Average weight across all keywords/phrases for this loop
    const kwValues = Object.values(cal.keywordWeights);
    const phValues = Object.values(cal.phraseWeights);
    const allValues = [...kwValues, ...phValues];
    
    if (allValues.length === 0) {
      adjusted.set(loopId, baseScore);
      continue;
    }

    const avgWeight = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    // Blend base score with calibration weight
    adjusted.set(loopId, baseScore * 0.7 + avgWeight * 0.3);
  }

  return adjusted;
}

/** Record a detection outcome for calibration learning */
export async function recordDetectionOutcome(
  loopId: string,
  detected: boolean,
  userConfirmed?: boolean  // undefined = not yet reviewed
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('loop_detection_log').insert({
    user_id: user.id,
    loop_id: loopId,
    detected,
    user_confirmed: userConfirmed,
    created_at: new Date().toISOString(),
  });
}

/** Get calibration stats for a user */
export async function getUserCalibrationStats(userId: string): Promise<{
  totalLoopsCalibrated: number;
  avgFalsePositiveRate: number;
  totalConfirmations: number;
  totalDenials: number;
}> {
  const { data } = await supabase
    .from('loop_calibrations')
    .select('false_positive_rate, total_confirmations, total_denials')
    .eq('user_id', userId);

  if (!data || data.length === 0) {
    return { totalLoopsCalibrated: 0, avgFalsePositiveRate: 0, totalConfirmations: 0, totalDenials: 0 };
  }

  return {
    totalLoopsCalibrated: data.length,
    avgFalsePositiveRate: data.reduce((sum, d) => sum + d.false_positive_rate, 0) / data.length,
    totalConfirmations: data.reduce((sum, d) => sum + d.total_confirmations, 0),
    totalDenials: data.reduce((sum, d) => sum + d.total_denials, 0),
  };
}