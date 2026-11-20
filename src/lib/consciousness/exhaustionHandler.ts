/**
 * Exhaustion handler — decides whether to cool down or offer a new theme
 * after all sessions in the day's arc are complete.
 *
 * Decision tree:
 * - time > 9pm → cool down
 * - sessions > 8 → cool down
 * - energy = low → cool down
 * - bypassingRisk > 0.6 → cool down
 * - loop severity > 7 → new theme (loop needs fresh material)
 * - user explicitly requests → new theme
 * - orchestrator says rest → cool down
 * - default → cool down
 */

export type ExhaustionAction = 'cool-down' | 'new-theme';

export interface ExhaustionContext {
  currentHour: number;
  sessionCount: number;
  energyLevel: 'low' | 'medium' | 'high';
  bypassingRisk: number;
  maxLoopSeverity: number;
  orchestratorAction?: string;
  userRequestedNewTheme?: boolean;
}

export interface ExhaustionResult {
  action: ExhaustionAction;
  reason: string;
}

export function decideExhaustion(ctx: ExhaustionContext): ExhaustionResult {
  const { currentHour, sessionCount, energyLevel, bypassingRisk, maxLoopSeverity, orchestratorAction, userRequestedNewTheme } = ctx;

  if (userRequestedNewTheme) {
    return { action: 'new-theme', reason: 'You asked for a new thread.' };
  }

  if (orchestratorAction === 'rest' || orchestratorAction === 'simplify') {
    return { action: 'cool-down', reason: 'Your guide suggests rest today.' };
  }

  if (maxLoopSeverity >= 7) {
    return { action: 'new-theme', reason: 'The loop needs fresh material.' };
  }

  if (currentHour >= 21) {
    return { action: 'cool-down', reason: 'The day is done.' };
  }

  if (sessionCount >= 8) {
    return { action: 'cool-down', reason: 'Enough for today.' };
  }

  if (energyLevel === 'low') {
    return { action: 'cool-down', reason: 'Rest is the practice now.' };
  }

  if (bypassingRisk > 0.6) {
    return { action: 'cool-down', reason: 'Pause. The pattern is looping.' };
  }

  return { action: 'cool-down', reason: 'The day is complete.' };
}

export function getCoolDownMessage(reason: string): string {
  return reason;
}

export function getNewThemePrompt(): string {
  return `Your day has more to give. A new thread is forming around what called to you today.`;
}
