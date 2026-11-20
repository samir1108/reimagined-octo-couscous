import { setup, assign } from 'xstate';

// ═══════════════════════════════════════════
// INSIGHTS MACHINE — Timeframe + UI State
// ═══════════════════════════════════════════

export type Timeframe = 7 | 14 | 30;

export interface InsightsContext {
  timeframe: Timeframe;
  error: string | null;
}

export type InsightsEvent =
  | { type: 'SET_TIMEFRAME'; timeframe: Timeframe }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS' }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'REFRESH' };

export const insightsMachine = setup({
  types: {
    context: {} as InsightsContext,
    events: {} as InsightsEvent,
  },
}).createMachine({
  id: 'insights',
  initial: 'idle',
  context: {
    timeframe: 14,
    error: null,
  },
  on: {
    SET_TIMEFRAME: {
      actions: assign({
        timeframe: ({ event }) => event.timeframe,
        error: null,
      }),
    },
  },
  states: {
    idle: {
      on: {
        FETCH_START: 'loading',
      },
    },
    loading: {
      on: {
        FETCH_SUCCESS: 'ready',
        FETCH_ERROR: {
          target: 'error',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    ready: {
      on: {
        REFRESH: 'loading',
        FETCH_START: 'loading',
      },
    },
    error: {
      on: {
        REFRESH: {
          target: 'loading',
          actions: assign({ error: null }),
        },
        FETCH_START: 'loading',
      },
    },
  },
});
