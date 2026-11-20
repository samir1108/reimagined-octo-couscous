/**
 * SESSION MOMENTS — The "magic" that makes users feel seen.
 *
 * Specific, triggered events that happen during or after sessions.
 * Each moment has:
 *   - Trigger condition
 *   - Personalized message
 *   - Visual effect
 *   - Shareability flag
 *   - Cooldown (don't repeat too often)
 */

import type { SessionMoment, UserJourney, SessionCompletion } from './types';

export interface MomentContext {
  journey: UserJourney;
  completion?: SessionCompletion;
  sessionTitle?: string;
}

export interface TriggeredMoment extends SessionMoment {
  triggeredAt: string;
  id: string;
}

/** A moment template: `message` may be static copy or a context-driven resolver. */
export type MomentTemplate = Omit<SessionMoment, 'id' | 'triggeredAt' | 'message'> & {
  message: string | ((ctx: MomentContext) => string);
};

const MOMENT_REGISTRY: MomentTemplate[] = [
  {
    type: 'return',
    message: (ctx: MomentContext) => {
      if (ctx.journey.gapDays > 30) {
        return `You're back after ${ctx.journey.gapDays} days. The path didn't go anywhere — it was waiting.`;
      }
      if (ctx.journey.gapDays > 7) {
        return "You're here. That's enough. Let's begin gently.";
      }
      return 'Welcome back. No catching up — just presence.';
    },
    visual: 'warm-glow',
    shareable: false,
    cooldownDays: 14,
  },
  {
    type: 'milestone',
    message: (ctx: MomentContext) => {
      const count = ctx.journey.totalLifetimeSessions;
      if (count === 100) {
        return `Session ${count}. You've sat with yourself ${count} times. That's a life.`;
      }
      if (count === 365) {
        return `One full year of sessions. The practice has become you.`;
      }
      return `Session ${count}. Each one a thread in the fabric of who you're becoming.`;
    },
    visual: 'fireworks',
    shareable: true,
    cooldownDays: 365,
  },
  {
    type: 'breakthrough',
    message: (ctx: MomentContext) => {
      if (ctx.completion?.completedStepCount && ctx.completion.completedStepCount >= 5) {
        return "Five steps engaged. You're not checking boxes — you're diving.";
      }
      return "You just did something differently. That's the muscle getting stronger.";
    },
    visual: 'sparkle',
    shareable: true,
    cooldownDays: 30,
  },
  {
    type: 'mirror',
    message: (ctx: MomentContext) => {
      const loop = ctx.journey.activeLoops[0];
      if (loop) {
        return `You just saw "${loop}" clearly. Naming it is the first loosening.`;
      }
      return 'You saw something true today. Let it settle.';
    },
    visual: 'mirror-shimmer',
    shareable: true,
    cooldownDays: 30,
  },
  {
    type: 'grace',
    message: (ctx: MomentContext) => {
      return "You missed yesterday. Today you're here. That's not discipline — that's devotion.";
    },
    visual: 'warm-glow',
    shareable: false,
    cooldownDays: 30,
  },
  {
    type: 'depth',
    message: (ctx: MomentContext) => {
      return 'Three sessions in one day. You\'re not checking boxes — you\'re diving.';
    },
    visual: 'depth-ripple',
    shareable: true,
    cooldownDays: 30,
  },
  {
    type: 'arc-resolved',
    message: (ctx: MomentContext) => {
      return 'An arc has resolved. The thread you\'ve been pulling has loosened. Rest here.';
    },
    visual: 'dissolve',
    shareable: true,
    cooldownDays: 60,
  },
];

/**
 * Evaluate all moment triggers and return moments that should fire.
 */
export function evaluateMoments(ctx: MomentContext): TriggeredMoment[] {
  const triggered: TriggeredMoment[] = [];

  for (const moment of MOMENT_REGISTRY) {
    if (shouldTrigger(moment, ctx)) {
      const message = typeof moment.message === 'function' ? moment.message(ctx) : moment.message;
      triggered.push({
        ...moment,
        message,
        id: `${moment.type}-${Date.now()}`,
        triggeredAt: new Date().toISOString(),
      });
    }
  }

  return triggered;
}

function shouldTrigger(moment: MomentTemplate, ctx: MomentContext): boolean {
  const { journey, completion } = ctx;

  switch (moment.type) {
    case 'return':
      return journey.isReturningAfterGap && journey.gapDays >= 3;

    case 'milestone':
      return isMilestone(journey.totalLifetimeSessions);

    case 'breakthrough':
      return completion !== undefined && completion.completedStepCount >= 3;

    case 'mirror':
      return journey.activeLoops.length > 0 && completion !== undefined;

    case 'grace':
      // This would need grace day tracking
      return false;

    case 'depth':
      return journey.todaySessions.length >= 3;

    case 'arc-resolved':
      // This would need arc tracking
      return false;

    default:
      return false;
  }
}

function isMilestone(count: number): boolean {
  const milestones = [1, 7, 30, 100, 365, 500, 1000];
  return milestones.includes(count);
}

/**
 * Get a moment by type (for displaying after completion)
 */
export function getMomentByType(type: SessionMoment['type']): MomentTemplate | undefined {
  return MOMENT_REGISTRY.find(m => m.type === type);
}
