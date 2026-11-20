/**
 * DYNAMIC SESSION ENGINE — Builds personalized sessions
 * No rigid flows — uses state engine + agent routing to adapt dynamically.
 * Replaces fixed 30/50/20 formula with context-driven conversation.
 */

import type { DimensionId } from '@/types/consciousness';
import type { PracticeId } from '@/types/practices';
import type { GateId } from './dailyGates';
import { getGateDef, getCurrentGate } from './dailyGates';
import { getSessionFormula } from './practiceEngine';
import type { PracticeRecommendation } from './practiceEngine';

// ─── Session Types ───

export interface SessionPlan {
  id: string;
  gateId: GateId;
  guruId: string;
  practiceRecommendation: PracticeRecommendation;
  formula: { teachingMinutes: number; practiceMinutes: number; reflectionMinutes: number };
  totalDurationMinutes: number;
  /** Dynamic conversation context for AI — replaces rigid steps */
  conversationContext: {
    entryType: string;
    suggestedTone: string[];
    suggestedDepth: string;
    avoidHeavyPractice: boolean;
  };
  teachingTopic: string;
  practiceInstructions: string;
  reflectionPrompt: string;
  offAppTask?: string;
  presenceCard?: string;
  isAdapted: boolean;
  adaptationReason?: string;
}

export interface SessionContext {
  userId: string;
  currentHour: number;
  currentBand: number;
  guruId: string;
  guruName: string;
  practiceRecommendation: PracticeRecommendation;
  energy: 'low' | 'medium' | 'high';
  mood: string;
  daysSinceLastSession: number;
  journeyDay: number;
  activeLoopIds: string[];
  dimensionScores: Record<DimensionId, number>;
  yesterdayIntention?: string;
  timeAvailableMinutes: number;
}

// ─── Session Generation ───

export function generateSessionPlan(ctx: SessionContext): SessionPlan {
  const gateId = getCurrentGate(ctx.currentHour);
  const gate = getGateDef(gateId);
  const formula = getSessionFormula(ctx.timeAvailableMinutes);

  let totalDuration = ctx.timeAvailableMinutes;
  let isAdapted = false;
  let adaptationReason: string | undefined;

  if (ctx.energy === 'low') {
    totalDuration = Math.min(totalDuration, 10);
    isAdapted = true;
    adaptationReason = 'Energy is low — shortened session';
  }

  if (ctx.daysSinceLastSession > 3) {
    isAdapted = true;
    adaptationReason = `Welcome back after ${ctx.daysSinceLastSession} days — gentle re-entry`;
  }

  return {
    id: `session-${Date.now()}`,
    gateId,
    guruId: ctx.guruId,
    practiceRecommendation: ctx.practiceRecommendation,
    formula,
    totalDurationMinutes: totalDuration,
    conversationContext: {
      entryType: ctx.daysSinceLastSession > 2 ? 'return_after_gap' : ctx.daysSinceLastSession === 0 ? 'fresh_entry' : 'continuation',
      suggestedTone: gate.toneModifiers,
      suggestedDepth: gate.defaultDepth,
      avoidHeavyPractice: gate.avoidHeavyPractice,
    },
    teachingTopic: generateTeachingTopic(ctx),
    practiceInstructions: generatePracticeInstructions(ctx),
    reflectionPrompt: generateReflectionPrompt(ctx, gateId),
    offAppTask: gateId === 'morning' ? generateOffAppTask(ctx) : undefined,
    presenceCard: gateId === 'midday' ? generatePresenceCard(ctx) : undefined,
    isAdapted,
    adaptationReason,
  };
}

function generateTeachingTopic(ctx: SessionContext): string {
  const { practiceRecommendation, currentBand } = ctx;
  const practice = practiceRecommendation.practiceId;
  const level = practiceRecommendation.level;

  if (currentBand < 1) return `Introduction to ${practice} — Why this practice matters for your journey`;
  if (currentBand < 3) return `Deepening ${practice} Level ${level} — Common obstacles and how to work with them`;
  if (currentBand < 5) return `${practice} as transformation — Moving from technique to direct experience`;
  return `${practice} in silence — Beyond the practice, into being`;
}

function generatePracticeInstructions(ctx: SessionContext): string {
  const { practiceRecommendation, energy } = ctx;
  const energyModifier = energy === 'low' ? 'gentle' : energy === 'high' ? 'deep' : 'steady';
  return `${energyModifier} ${practiceRecommendation.practiceId} practice at Level ${practiceRecommendation.level} for ${practiceRecommendation.durationMinutes} minutes`;
}

function generateReflectionPrompt(ctx: SessionContext, gateId: GateId): string {
  switch (gateId) {
    case 'morning': return 'Set one intention for today. Just one word.';
    case 'midday': return 'What have you noticed since this morning?';
    case 'evening': return 'What pattern did you see today? No judgment — just notice.';
    case 'night': return 'Let everything go. What remains?';
  }
}

function generateOffAppTask(ctx: SessionContext): string {
  const practice = ctx.practiceRecommendation.practiceId;
  const offAppTasks: Partial<Record<PracticeId, string>> = {
    'observation': 'Notice 3 moments today where you catch yourself on autopilot.',
    'self-inquiry': 'When a strong emotion comes, pause and ask: "Who is feeling this?"',
    'breath': 'Before every meal, take 3 conscious breaths.',
    'witnessing': 'Watch one conversation today without forming a response in your head.',
    'body': 'Place your hand on your heart 3 times today. Feel the warmth.',
    'bhakti': 'Find one thing to genuinely thank someone for today.',
    'karma': 'Do one task today purely as an offering — no expectation.',
    'jnana': 'When a belief arises, ask: "Is this actually true?"',
    'raja': 'Maintain a steady, upright posture for 5 minutes during work.',
  };
  return offAppTasks[practice] ?? 'Notice one moment of awareness today.';
}

function generatePresenceCard(ctx: SessionContext): string {
  const cards = [
    'Right now, this moment is complete.',
    'You are not your thoughts. You are the one who notices them.',
    'This breath is the only thing that is real right now.',
    'What would change if you stopped trying to fix anything?',
    'The gap between two thoughts — that is you.',
    'Feel your feet on the ground. You are here.',
    'Nothing needs to be different for peace to be present.',
  ];
  return cards[ctx.journeyDay % cards.length];
}

export function getAdaptedDuration(
  baseDuration: number,
  gateId: GateId,
  energy: 'low' | 'medium' | 'high'
): number {
  const gateMultiplier: Record<GateId, number> = {
    morning: 1.0, midday: 0.3, evening: 0.8, night: 0.5,
  };
  const energyMultiplier = energy === 'low' ? 0.5 : energy === 'medium' ? 0.8 : 1.0;
  return Math.max(2, Math.round(baseDuration * gateMultiplier[gateId] * energyMultiplier));
}
