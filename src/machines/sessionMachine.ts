import { setup, assign } from 'xstate';
import type { TimeSlot } from '@/lib/timeSlots';

export interface SessionContext {
  sessionId: string | null;
  timeSlot: TimeSlot | null;
  themeId: string | null;
  themeName: string | null;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  error: string | null;
  isStreaming: boolean;
}

type SessionEvent =
  | { type: 'START_SESSION'; timeSlot: TimeSlot; themeId: string; themeName: string }
  | { type: 'SESSION_CREATED'; sessionId: string }
  | { type: 'ADD_USER_MESSAGE'; content: string }
  | { type: 'START_STREAMING' }
  | { type: 'STREAM_DELTA'; content: string }
  | { type: 'STREAM_DONE' }
  | { type: 'END_SESSION' }
  | { type: 'SESSION_ENDED' }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

export const sessionMachine = setup({
  types: {
    context: {} as SessionContext,
    events: {} as SessionEvent,
  },
}).createMachine({
  id: 'session',
  initial: 'idle',
  context: {
    sessionId: null,
    timeSlot: null,
    themeId: null,
    themeName: null,
    messages: [],
    error: null,
    isStreaming: false,
  },
  states: {
    idle: {
      on: {
        START_SESSION: {
          target: 'starting',
          actions: assign({
            timeSlot: ({ event }) => event.timeSlot,
            themeId: ({ event }) => event.themeId,
            themeName: ({ event }) => event.themeName,
            error: null,
            messages: [],
          }),
        },
      },
    },
    starting: {
      on: {
        SESSION_CREATED: {
          target: 'active',
          actions: assign({ sessionId: ({ event }) => event.sessionId }),
        },
        ERROR: {
          target: 'idle',
          actions: assign({ error: ({ event }) => event.message }),
        },
      },
    },
    active: {
      on: {
        ADD_USER_MESSAGE: {
          actions: assign({
            messages: ({ context, event }) => [
              ...context.messages,
              { role: 'user' as const, content: event.content },
            ],
          }),
        },
        START_STREAMING: {
          actions: assign({
            isStreaming: true,
            messages: ({ context }) => [
              ...context.messages,
              { role: 'assistant' as const, content: '' },
            ],
          }),
        },
        STREAM_DELTA: {
          actions: assign({
            messages: ({ context, event }) => {
              const msgs = [...context.messages];
              const last = msgs[msgs.length - 1];
              if (last?.role === 'assistant') {
                msgs[msgs.length - 1] = { ...last, content: last.content + event.content };
              }
              return msgs;
            },
          }),
        },
        STREAM_DONE: {
          actions: assign({ isStreaming: false }),
        },
        END_SESSION: 'ending',
        ERROR: {
          actions: assign({
            error: ({ event }) => event.message,
            isStreaming: false,
          }),
        },
      },
    },
    ending: {
      on: {
        SESSION_ENDED: 'completed',
        ERROR: {
          target: 'active',
          actions: assign({ error: ({ event }) => event.message }),
        },
      },
    },
    completed: {
      on: {
        RESET: {
          target: 'idle',
          actions: assign({
            sessionId: null,
            timeSlot: null,
            themeId: null,
            themeName: null,
            messages: [],
            error: null,
            isStreaming: false,
          }),
        },
      },
    },
  },
});
