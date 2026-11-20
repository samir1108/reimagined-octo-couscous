/**
 * ConsciousOS Session Player Machine
 * ──────────────────────────────
 * XState v5 machine that orchestrates a single training session:
 *
 *   arrive → baseline → train → [challenge] → reflect → integrate → checkin → progress → complete
 */

import { setup, assign, fromPromise } from "xstate";
import type { SessionDefinition, SessionPhaseId } from "../sessions/sessionEngine";
import type { GameResult } from "../games/games";

// ─── Context ─────────────────────────────────────────────────────────────────

export interface SessionPlayerContext {
  session: SessionDefinition | null;
  currentPhaseIndex: number;
  currentPhase: SessionPhase | null;
  phaseStartTime: number | null;
  phaseEvents: GameEvent[];
  gameResult: GameResult | null;
  checkin: { mood: number; energy: number; focus: number } | null;
  error: string | null;
}

export interface GameEvent {
  timestamp: number;
  type: "action" | "distraction" | "success" | "fail" | "resume";
  data?: Record<string, unknown>;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export type SessionPlayerEvent =
  | { type: "START_SESSION"; session: SessionDefinition }
  | { type: "NEXT_PHASE" }
  | { type: "PREV_PHASE" }
  | { type: "PHASE_COMPLETE"; result?: GameResult }
  | { type: "GAME_EVENT"; event: GameEvent }
  | { type: "CHECKIN"; mood: number; energy: number; focus: number }
  | { type: "SKIP_PHASE" }
  | { type: "END_SESSION" }
  | { type: "ERROR"; error: string };

// ─── Machine ─────────────────────────────────────────────────────────────────

export const sessionPlayerMachine = setup({
  types: {
    context: {} as SessionPlayerContext,
    events: {} as SessionPlayerEvent,
  },
  actions: {
    setSession: assign({
      session: ({ event }) => (event.type === "START_SESSION" ? event.session : null),
      currentPhaseIndex: 0,
      currentPhase: ({ event }) =>
        event.type === "START_SESSION" ? event.session.phases[0] : null,
      phaseStartTime: ({ event }) =>
        event.type === "START_SESSION" ? Date.now() : null,
      phaseEvents: [],
      gameResult: null,
      checkin: null,
      error: null,
    }),
    advancePhase: assign({
      currentPhaseIndex: ({ context }) => Math.min(context.currentPhaseIndex + 1, context.session!.phases.length - 1),
      currentPhase: ({ context }) =>
        context.session!.phases[Math.min(context.currentPhaseIndex + 1, context.session!.phases.length - 1)],
      phaseStartTime: () => Date.now(),
      phaseEvents: [],
      gameResult: null,
    }),
    setGameResult: assign({
      gameResult: ({ event }) => (event.type === "PHASE_COMPLETE" ? event.result ?? null : null),
    }),
    setCheckin: assign({
      checkin: ({ event }) =>
        event.type === "CHECKIN" ? { mood: event.mood, energy: event.energy, focus: event.focus } : null,
    }),
    recordGameEvent: assign({
      phaseEvents: ({ context, event }) =>
        event.type === "GAME_EVENT"
          ? [...context.phaseEvents, event.event]
          : context.phaseEvents,
    }),
    setError: assign({
      error: ({ event }) => (event.type === "ERROR" ? event.error : null),
    }),
    clearError: assign({
      error: null,
    }),
    endSession: assign({
      session: null,
      currentPhaseIndex: 0,
      currentPhase: null,
      phaseStartTime: null,
      phaseEvents: [],
      gameResult: null,
      checkin: null,
    }),
  },
  guards: {
    hasMorePhases: ({ context }) =>
      context.currentPhaseIndex < (context.session?.phases.length ?? 0) - 1,
    isLastPhase: ({ context }) =>
      context.currentPhaseIndex === (context.session?.phases.length ?? 0) - 1,
    hasGameResult: ({ context }) => context.gameResult !== null,
  },
}).createMachine({
  id: "sessionPlayer",
  initial: "idle",
  context: {
    session: null,
    currentPhaseIndex: 0,
    currentPhase: null,
    phaseStartTime: null,
    phaseEvents: [],
    gameResult: null,
    checkin: null,
    error: null,
  },
  states: {
    idle: {
      on: {
        START_SESSION: {
          target: "active",
          actions: ["setSession"],
        },
      },
    },
    active: {
      initial: "playing",
      states: {
        playing: {
          on: {
            NEXT_PHASE: {
              guard: "hasMorePhases",
              target: "transitioning",
              actions: ["advancePhase"],
            },
            END_SESSION: {
              target: "#sessionPlayer.complete",
              actions: ["endSession"],
            },
            PHASE_COMPLETE: {
              actions: ["setGameResult"],
            },
            GAME_EVENT: {
              actions: ["recordGameEvent"],
            },
            SKIP_PHASE: {
              guard: "hasMorePhases",
              target: "transitioning",
              actions: ["advancePhase"],
            },
            ERROR: {
              actions: ["setError"],
            },
          },
        },
        transitioning: {
          after: {
            300: {
              target: "playing",
            },
          },
        },
      },
      on: {
        CHECKIN: {
          actions: ["setCheckin"],
        },
      },
    },
    complete: {
      type: "final",
    },
  },
  on: {
    ERROR: {
      actions: ["setError"],
    },
    CLEAR_ERROR: {
      actions: ["clearError"],
    },
  },
});
