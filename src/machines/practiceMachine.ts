import { setup, assign } from 'xstate';

export interface PracticeContext {
  activeTab: 'observation' | 'daily';
  completingTaskId: string | null;
  reflection: string;
  error: string | null;
}

type PracticeEvent =
  | { type: 'SWITCH_TAB'; tab: 'observation' | 'daily' }
  | { type: 'SET_REFLECTION'; text: string }
  | { type: 'SUBMIT_OBSERVATION'; taskId: string }
  | { type: 'COMPLETE_DAILY_TASK'; taskId: string }
  | { type: 'TASK_COMPLETED' }
  | { type: 'TASK_ERROR'; message: string }
  | { type: 'DISMISS_ERROR' };

export const practiceMachine = setup({
  types: {
    context: {} as PracticeContext,
    events: {} as PracticeEvent,
  },
  guards: {
    hasReflection: ({ context }) => context.reflection.trim().length > 0,
  },
}).createMachine({
  id: 'practice',
  initial: 'idle',
  context: {
    activeTab: 'observation',
    completingTaskId: null,
    reflection: '',
    error: null,
  },
  states: {
    idle: {
      on: {
        SWITCH_TAB: {
          actions: assign({ activeTab: ({ event }) => event.tab }),
        },
        SET_REFLECTION: {
          actions: assign({ reflection: ({ event }) => event.text }),
        },
        SUBMIT_OBSERVATION: {
          guard: 'hasReflection',
          target: 'completing',
          actions: assign({ completingTaskId: ({ event }) => event.taskId }),
        },
        COMPLETE_DAILY_TASK: {
          target: 'completing',
          actions: assign({ completingTaskId: ({ event }) => event.taskId }),
        },
      },
    },
    completing: {
      on: {
        TASK_COMPLETED: {
          target: 'idle',
          actions: assign({ completingTaskId: null, reflection: '', error: null }),
        },
        TASK_ERROR: {
          target: 'idle',
          actions: assign({
            completingTaskId: null,
            error: ({ event }) => event.message,
          }),
        },
      },
    },
  },
});
