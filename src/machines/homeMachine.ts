import { setup, assign } from 'xstate';
import type { TimeSlot } from '@/lib/timeSlots';

export type SlotStatus = 'locked' | 'available' | 'current' | 'active' | 'completed';

export interface HomeContext {
  selectedSlot: TimeSlot | null;
  navigateTo: string | null;
}

type HomeEvent =
  | { type: 'SELECT_SLOT'; slot: TimeSlot; status: SlotStatus; themeId: string }
  | { type: 'NAVIGATED' };

export const homeMachine = setup({
  types: {
    context: {} as HomeContext,
    events: {} as HomeEvent,
  },
  guards: {
    isClickable: ({ event }) => {
      if (event.type !== 'SELECT_SLOT') return false;
      return event.status !== 'locked' && event.status !== 'completed';
    },
  },
}).createMachine({
  id: 'home',
  initial: 'browsing',
  context: {
    selectedSlot: null,
    navigateTo: null,
  },
  states: {
    browsing: {
      on: {
        SELECT_SLOT: {
          guard: 'isClickable',
          target: 'navigating',
          actions: assign({
            selectedSlot: ({ event }) => event.slot,
            navigateTo: ({ event }) => `/app/guide?slot=${event.slot}&themeId=${event.themeId}`,
          }),
        },
      },
    },
    navigating: {
      on: {
        NAVIGATED: {
          target: 'browsing',
          actions: assign({ selectedSlot: null, navigateTo: null }),
        },
      },
    },
  },
});
