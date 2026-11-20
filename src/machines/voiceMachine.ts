import { setup, assign } from 'xstate';

// ═══════════════════════════════════════════
// VOICE MACHINE — Recording / Transcribing / Speaking
// ═══════════════════════════════════════════

export interface VoiceContext {
  voiceEnabled: boolean;
  error: string | null;
}

export type VoiceEvent =
  | { type: 'TOGGLE_VOICE' }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'TRANSCRIPTION_DONE' }
  | { type: 'TRANSCRIPTION_ERROR'; error: string }
  | { type: 'SPEAK' }
  | { type: 'SPEAK_DONE' }
  | { type: 'SPEAK_ERROR' }
  | { type: 'STOP_SPEAKING' }
  | { type: 'MIC_ERROR'; error: string };

export const voiceMachine = setup({
  types: {
    context: {} as VoiceContext,
    events: {} as VoiceEvent,
  },
}).createMachine({
  id: 'voice',
  initial: 'idle',
  context: {
    voiceEnabled: false,
    error: null,
  },
  on: {
    TOGGLE_VOICE: {
      actions: assign({
        voiceEnabled: ({ context }) => !context.voiceEnabled,
      }),
    },
  },
  states: {
    idle: {
      on: {
        START_RECORDING: 'recording',
        SPEAK: 'speaking',
      },
    },
    recording: {
      on: {
        STOP_RECORDING: 'transcribing',
        MIC_ERROR: {
          target: 'idle',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    transcribing: {
      on: {
        TRANSCRIPTION_DONE: {
          target: 'idle',
          actions: assign({ error: null }),
        },
        TRANSCRIPTION_ERROR: {
          target: 'idle',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    speaking: {
      on: {
        SPEAK_DONE: {
          target: 'idle',
          actions: assign({ error: null }),
        },
        SPEAK_ERROR: {
          target: 'idle',
          actions: assign({ error: 'TTS failed' }),
        },
        STOP_SPEAKING: 'idle',
        START_RECORDING: 'recording',
      },
    },
  },
});
