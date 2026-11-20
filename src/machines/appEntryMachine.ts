import { setup, assign } from 'xstate';

// ═══════════════════════════════════════════
// APP ENTRY MACHINE — Auth + Onboarding Flow
// ═══════════════════════════════════════════

export interface AppEntryContext {
  userId: string | null;
  onboarded: boolean;
}

export type AppEntryEvent =
  | { type: 'AUTH_FOUND'; userId: string; onboarded: boolean }
  | { type: 'AUTH_NOT_FOUND' }
  | { type: 'AUTH_LOST' }
  | { type: 'ONBOARDING_COMPLETE' };

export const appEntryMachine = setup({
  types: {
    context: {} as AppEntryContext,
    events: {} as AppEntryEvent,
  },
}).createMachine({
  id: 'appEntry',
  initial: 'checking',
  context: {
    userId: null,
    onboarded: false,
  },
  states: {
    checking: {
      on: {
        AUTH_FOUND: [
          {
            guard: ({ event }) => !event.onboarded,
            target: 'onboarding',
            actions: assign({
              userId: ({ event }) => event.userId,
              onboarded: false,
            }),
          },
          {
            target: 'ready',
            actions: assign({
              userId: ({ event }) => event.userId,
              onboarded: true,
            }),
          },
        ],
        AUTH_NOT_FOUND: 'unauthenticated',
      },
    },
    unauthenticated: {
      // Recoverable: if a session arrives late (e.g. HMR / slow getSession),
      // lift the user back into onboarding or ready instead of stranding /auth.
      on: {
        AUTH_FOUND: [
          {
            guard: ({ event }) => !event.onboarded,
            target: 'onboarding',
            actions: assign({
              userId: ({ event }) => event.userId,
              onboarded: false,
            }),
          },
          {
            target: 'ready',
            actions: assign({
              userId: ({ event }) => event.userId,
              onboarded: true,
            }),
          },
        ],
      },
    },
    onboarding: {
      on: {
        ONBOARDING_COMPLETE: {
          target: 'ready',
          actions: assign({ onboarded: true }),
        },
        AUTH_LOST: 'unauthenticated',
      },
    },
    ready: {
      on: {
        AUTH_LOST: 'unauthenticated',
        AUTH_FOUND: {
          // Stay in ready, just update context
          actions: assign({
            userId: ({ event }) => event.userId,
            onboarded: ({ event }) => event.onboarded,
          }),
        },
      },
    },
  },
});
