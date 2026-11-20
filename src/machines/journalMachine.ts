import { setup, assign } from 'xstate';

export interface JournalContext {
  title: string;
  content: string;
  mood: string;
  deletingId: string | null;
  error: string | null;
}

type JournalEvent =
  | { type: 'OPEN_FORM' }
  | { type: 'CLOSE_FORM' }
  | { type: 'SET_TITLE'; text: string }
  | { type: 'SET_CONTENT'; text: string }
  | { type: 'TOGGLE_MOOD'; mood: string }
  | { type: 'SUBMIT' }
  | { type: 'ENTRY_SAVED' }
  | { type: 'DELETE_ENTRY'; id: string }
  | { type: 'ENTRY_DELETED' }
  | { type: 'ERROR'; message: string };

export const journalMachine = setup({
  types: {
    context: {} as JournalContext,
    events: {} as JournalEvent,
  },
  guards: {
    hasContent: ({ context }) => context.content.trim().length > 0,
  },
}).createMachine({
  id: 'journal',
  initial: 'viewing',
  context: {
    title: '',
    content: '',
    mood: '',
    deletingId: null,
    error: null,
  },
  states: {
    viewing: {
      on: {
        OPEN_FORM: 'composing',
        DELETE_ENTRY: {
          target: 'deleting',
          actions: assign({ deletingId: ({ event }) => event.id }),
        },
      },
    },
    composing: {
      on: {
        CLOSE_FORM: {
          target: 'viewing',
          actions: assign({ title: '', content: '', mood: '' }),
        },
        SET_TITLE: { actions: assign({ title: ({ event }) => event.text }) },
        SET_CONTENT: { actions: assign({ content: ({ event }) => event.text }) },
        TOGGLE_MOOD: {
          actions: assign({
            mood: ({ context, event }) => context.mood === event.mood ? '' : event.mood,
          }),
        },
        SUBMIT: {
          guard: 'hasContent',
          target: 'saving',
        },
      },
    },
    saving: {
      on: {
        ENTRY_SAVED: {
          target: 'viewing',
          actions: assign({ title: '', content: '', mood: '', error: null }),
        },
        ERROR: {
          target: 'composing',
          actions: assign({ error: ({ event }) => event.message }),
        },
      },
    },
    deleting: {
      on: {
        ENTRY_DELETED: {
          target: 'viewing',
          actions: assign({ deletingId: null }),
        },
        ERROR: {
          target: 'viewing',
          actions: assign({ deletingId: null, error: ({ event }) => event.message }),
        },
      },
    },
  },
});
