import { setup, assign } from 'xstate';
import { getCurrentTimeSlot, type TimeSlot } from '@/lib/timeSlots';

export type GatePhase = 'morning_gate' | 'midday_pulse' | 'evening_sandhya' | 'night_sanctuary';

export interface DailyCycleContext {
  currentGate: GatePhase;
  morningCompleted: boolean;
  middayCheckedIn: boolean;
  eveningReflected: boolean;
  nightClosed: boolean;
  tasksCompleted: number;
  totalTasks: number;
  streak: number;
}

type DailyCycleEvent =
  | { type: 'TIME_CHECK' }
  | { type: 'MORNING_DONE' }
  | { type: 'MIDDAY_CHECKIN' }
  | { type: 'EVENING_REFLECTED' }
  | { type: 'NIGHT_CLOSED' }
  | { type: 'TASK_COMPLETED' }
  | { type: 'SET_DATA'; streak: number; tasksCompleted: number; totalTasks: number; morningDone: boolean; eveningDone: boolean };

function getGateFromTimeSlot(slot: TimeSlot): GatePhase {
  switch (slot) {
    case 'morning': return 'morning_gate';
    case 'midday': return 'midday_pulse';
    case 'evening': return 'evening_sandhya';
    case 'night': return 'night_sanctuary';
  }
}

export const dailyCycleMachine = setup({
  types: {
    context: {} as DailyCycleContext,
    events: {} as DailyCycleEvent,
  },
}).createMachine({
  id: 'dailyCycle',
  initial: 'active',
  context: {
    currentGate: getGateFromTimeSlot(getCurrentTimeSlot()),
    morningCompleted: false,
    middayCheckedIn: false,
    eveningReflected: false,
    nightClosed: false,
    tasksCompleted: 0,
    totalTasks: 0,
    streak: 0,
  },
  states: {
    active: {
      on: {
        TIME_CHECK: {
          actions: assign({
            currentGate: () => getGateFromTimeSlot(getCurrentTimeSlot()),
          }),
        },
        MORNING_DONE: {
          actions: assign({ morningCompleted: true }),
        },
        MIDDAY_CHECKIN: {
          actions: assign({ middayCheckedIn: true }),
        },
        EVENING_REFLECTED: {
          actions: assign({ eveningReflected: true }),
        },
        NIGHT_CLOSED: {
          actions: assign({ nightClosed: true }),
        },
        TASK_COMPLETED: {
          actions: assign({
            tasksCompleted: ({ context }) => context.tasksCompleted + 1,
          }),
        },
        SET_DATA: {
          actions: assign({
            streak: ({ event }) => event.streak,
            tasksCompleted: ({ event }) => event.tasksCompleted,
            totalTasks: ({ event }) => event.totalTasks,
            morningCompleted: ({ event }) => event.morningDone,
            eveningReflected: ({ event }) => event.eveningDone,
          }),
        },
      },
    },
  },
});
