import { setup, assign } from 'xstate';

// ═══════════════════════════════════════════
// SETTINGS MACHINE — Business Logic
// ═══════════════════════════════════════════

export interface SettingsContext {
  isPaused: boolean;
  pausedAt: string | null;
  pauseReason: string | null;
  pauseDays: number;
  error: string | null;
}

export type SettingsEvent =
  | { type: 'PROFILE_LOADED'; isPaused: boolean; pausedAt: string | null; pauseReason: string | null }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'PAUSE_SUCCESS'; pausedAt: string }
  | { type: 'RESUME_SUCCESS' }
  | { type: 'MUTATION_ERROR'; error: string }
  | { type: 'SIGN_OUT' }
  | { type: 'SIGN_OUT_COMPLETE' };

function calcPauseDays(pausedAt: string | null): number {
  if (!pausedAt) return 0;
  const diff = Date.now() - new Date(pausedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export const settingsMachine = setup({
  types: {
    context: {} as SettingsContext,
    events: {} as SettingsEvent,
  },
}).createMachine({
  id: 'settings',
  initial: 'idle',
  context: {
    isPaused: false,
    pausedAt: null,
    pauseReason: null,
    pauseDays: 0,
    error: null,
  },
  states: {
    idle: {
      on: {
        PROFILE_LOADED: {
          target: 'ready',
          actions: assign({
            isPaused: ({ event }) => event.isPaused,
            pausedAt: ({ event }) => event.pausedAt,
            pauseReason: ({ event }) => event.pauseReason,
            pauseDays: ({ event }) => calcPauseDays(event.pausedAt),
            error: null,
          }),
        },
      },
    },
    ready: {
      on: {
        PROFILE_LOADED: {
          actions: assign({
            isPaused: ({ event }) => event.isPaused,
            pausedAt: ({ event }) => event.pausedAt,
            pauseReason: ({ event }) => event.pauseReason,
            pauseDays: ({ event }) => calcPauseDays(event.pausedAt),
          }),
        },
        PAUSE: 'pausing',
        RESUME: 'resuming',
        SIGN_OUT: 'signingOut',
      },
    },
    pausing: {
      on: {
        PAUSE_SUCCESS: {
          target: 'ready',
          actions: assign({
            isPaused: true,
            pausedAt: ({ event }) => event.pausedAt,
            pauseReason: 'Taking a break',
            pauseDays: 0,
            error: null,
          }),
        },
        MUTATION_ERROR: {
          target: 'ready',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    resuming: {
      on: {
        RESUME_SUCCESS: {
          target: 'ready',
          actions: assign({
            isPaused: false,
            pausedAt: null,
            pauseReason: null,
            pauseDays: 0,
            error: null,
          }),
        },
        MUTATION_ERROR: {
          target: 'ready',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    signingOut: {
      on: {
        SIGN_OUT_COMPLETE: 'idle',
      },
    },
  },
});
