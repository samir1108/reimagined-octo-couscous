/**
 * RESISTANCE & CRISIS RULES — If-then engine rules
 * ────────────────────────────────────────────────
 * Pre-built rules for common resistance patterns.
 * Users can enable/disable and customize.
 */

import type { ResistanceRule, CrisisProtocol } from '@/types/session-config';

export const DEFAULT_RESISTANCE_RULES: ResistanceRule[] = [
  {
    id: 'res:resistance-felt',
    trigger: 'resistance_felt',
    action: 'insert_grounding',
    params: { durationMin: 3, practice: 'body', technique: 'body:scan' },
    priority: 10,
    enabled: true,
  },
  {
    id: 'res:bypassing',
    trigger: 'bypassing_detected',
    action: 'insert_grounding',
    params: { durationMin: 5, practice: 'body', technique: 'body:sensation' },
    priority: 9,
    enabled: true,
  },
  {
    id: 'res:dark-night',
    trigger: 'dark_night',
    action: 'switch_focus',
    params: { focus: 'healing', practices: ['witnessing', 'breath'], exclude: ['self-inquiry', 'jnana'] },
    priority: 10,
    enabled: true,
  },
  {
    id: 'res:low-energy',
    trigger: 'low_energy',
    action: 'reduce_intensity',
    params: { maxDepth: 'light', maxDuration: 15, prefer: ['breath', 'body', 'witnessing'] },
    priority: 7,
    enabled: true,
  },
  {
    id: 'res:high-stress',
    trigger: 'high_stress',
    action: 'add_compassion',
    params: { practice: 'bhakti', technique: 'bhakti:gratitude', durationMin: 2 },
    priority: 8,
    enabled: true,
  },
  {
    id: 'res:loop-activated',
    trigger: 'loop_activated',
    action: 'insert_grounding',
    params: { durationMin: 2, practice: 'loop-dissolution', technique: 'loop:id' },
    priority: 6,
    enabled: true,
  },
  {
    id: 'res:quality-drop',
    trigger: 'quality_drop',
    action: 'reduce_intensity',
    params: { reason: 'quality < 0.4 for 3 sessions', action: 'gentler', reduceDepth: true },
    priority: 5,
    enabled: true,
  },
  {
    id: 'res:missed-sessions',
    trigger: 'missed_sessions',
    action: 'shorten_duration',
    params: { reason: '3+ day gap', durationMin: 10, focus: 're-entry', practices: ['breath', 'witnessing'] },
    priority: 8,
    enabled: true,
  },
];

export const DEFAULT_CRISIS_PROTOCOLS: CrisisProtocol[] = [
  {
    id: 'crisis:panic',
    name: 'Panic Attack',
    trigger: 'panic_attack',
    immediatePractice: 'breath',
    immediateTechnique: 'breath:box',
    durationMin: 5,
    followupPractice: 'body',
    followupDurationMin: 5,
    guideStyleOverride: 'gentle',
    enabled: true,
  },
  {
    id: 'crisis:grief',
    name: 'Grief Wave',
    trigger: 'grief_wave',
    immediatePractice: 'witnessing',
    immediateTechnique: 'witness:event',
    durationMin: 10,
    followupPractice: 'bhakti',
    followupDurationMin: 5,
    guideStyleOverride: 'devotional',
    enabled: true,
  },
  {
    id: 'crisis:rage',
    name: 'Rage',
    trigger: 'rage',
    immediatePractice: 'body',
    immediateTechnique: 'body:scan',
    durationMin: 3,
    followupPractice: 'karma',
    followupDurationMin: 5,
    guideStyleOverride: 'direct',
    enabled: true,
  },
  {
    id: 'crisis:dissociation',
    name: 'Dissociation',
    trigger: 'dissociation',
    immediatePractice: 'observation',
    immediateTechnique: 'obs:sensory',
    durationMin: 2,
    followupPractice: 'breath',
    followupDurationMin: 3,
    guideStyleOverride: 'gentle',
    enabled: true,
  },
  {
    id: 'crisis:overwhelm',
    name: 'Overwhelm',
    trigger: 'overwhelm',
    immediatePractice: 'breath',
    immediateTechnique: 'breath:extended',
    durationMin: 3,
    followupPractice: 'body',
    followupDurationMin: 5,
    guideStyleOverride: 'gentle',
    enabled: true,
  },
  {
    id: 'crisis:insomnia',
    name: 'Insomnia',
    trigger: 'insomnia',
    immediatePractice: 'body',
    immediateTechnique: 'body:scan',
    durationMin: 10,
    followupPractice: 'breath',
    followupDurationMin: 5,
    guideStyleOverride: 'silent',
    enabled: true,
  },
];

export function getResistanceRulesByTrigger(trigger: string): ResistanceRule[] {
  return DEFAULT_RESISTANCE_RULES.filter(r => r.trigger === trigger && r.enabled);
}

export function getCrisisProtocol(trigger: string): CrisisProtocol | undefined {
  return DEFAULT_CRISIS_PROTOCOLS.find(p => p.trigger === trigger && p.enabled);
}

export function getEnabledCrisisProtocols(): CrisisProtocol[] {
  return DEFAULT_CRISIS_PROTOCOLS.filter(p => p.enabled);
}