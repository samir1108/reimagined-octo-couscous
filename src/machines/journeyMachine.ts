/**
 * Cinematic Journey Machine — XState v5
 * ────────────────────────────────────────
 * Orchestrates the full 30-60 min cinematic personalisation journey.
 *
 * Flow:
 *   idle
 *   → framing (cinematic intro with countdown + tone)
 *   → questions [×N] (one question per transition)
 *   → processing (cinematic pause while engine processes)
 *   → metricsReveal (animated reveal of all metrics)
 *   → personalization (adjust / confirm metrics)
 *   → complete
 *   → exit (any time — returns to app)
 */

import { setup, assign, fromPromise } from "xstate";
import { JOURNEY_QUESTION_COUNT } from "@/lib/journey/journeyQuestions";
import type { JourneyAnswer } from "@/lib/journey/journeyQuestions";

// ─── Context ─────────────────────────────────────────────────────────────────

export interface JourneyContext {
  userId: string | null;
  currentQuestionIndex: number;
  answers: Map<number, JourneyAnswer>;
  scoreAccumulator: ScoreAccumulator;
  journeyStartedAt: string | null;
  journeyCompletedAt: string | null;
  aborted: boolean;
  error: string | null;
  cinematicLayer: number;          // 0..max — progress within cinematic layer
}

export interface ScoreAccumulator {
  bandTotal: number;
  bandCount: number;
  dimensionTotals: Record<string, number>;
  dimensionCounts: Record<string, number>;
  vLevelDeltaTotal: number;
  witnessDeltaTotal: number;
  integrationDeltaTotal: number;
  emotionDeltaTotal: number;
  somaticDeltaTotal: number;
  purposeClarityTotal: number;
  criticVolumeTotal: number;
  shadowProjectionTotal: number;
  chittaVrittiTotal: number;
  hCapacityTotals: Record<string, number>;
  pathScores: Record<string, number>;
  archetypeScores: Record<string, number>;
  brainScores: Record<string, number>;
  attachmentScores: Record<string, number>;
  beliefScores: Record<string, number>;
  circadianScores: Record<string, number>;
  loopCount: number;
  loopFamilies: string[];
  appRelationship: string | null;
  criticVolumeRaw: number;
  shadowOwned: number;
  integrationShadowsOwned: number;
}

export type JourneyEvent =
  | { type: "START"; userId: string }
  | { type: "ANSWER"; questionIndex: number; answer: JourneyAnswer }
  | { type: "NEXT_QUESTION" }
  | { type: "SKIP_QUESTION" }
  | { type: "PROCESSING_COMPLETE"; metrics: ComputedMetrics }
  | { type: "PERSONALIZATION_CONFIRMED" }
  | { type: "ABORT" }
  | { type: "ERROR"; error: string }
  | { type: "RETRY" }
  | { type: "RESET" };

// ─── Computed Metrics (output of processing) ────────────────────────────────

export interface ComputedMetrics {
  overallBand: number;
  dimensionBands: Record<string, number>;
  vLevelBaseline: number;
  vLevelCurrent: number;
  vLevelDelta: number;
  integrationScore: number;
  witnessGap: number;
  witnessStability: number;
  witnessDepth: number;
  dominantBrain: string;
  pathScores: Record<string, number>;
  primaryPath: string;
  secondaryPath: string;
  archetypePrimary: string;
  archetypeShadow: string;
  topLoops: string[];
  loopFamilies: string[];
  beliefLevel: string;
  attachmentStyle: string;
  cognitiveStyle: string;
  circadianPeak: string;
  emotionMaturity: number;
  somaticAwareness: number;
  purposeClarity: number;
  criticVolume: number;
  shadowOwned: number;
  chittaVritti: number;
  appRelationship: string;
  hCapacities: Record<string, number>;
  lifeDomains: Record<string, number>;
  journeyDay: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createScoreAccumulator(): ScoreAccumulator {
  return {
    bandTotal: 0,
    bandCount: 0,
    dimensionTotals: {},
    dimensionCounts: {},
    vLevelDeltaTotal: 0,
    witnessDeltaTotal: 0,
    integrationDeltaTotal: 0,
    emotionDeltaTotal: 0,
    somaticDeltaTotal: 0,
    purposeClarityTotal: 0,
    criticVolumeTotal: 0,
    shadowProjectionTotal: 0,
    chittaVrittiTotal: 0,
    hCapacityTotals: {},
    pathScores: {},
    archetypeScores: {},
    brainScores: {},
    attachmentScores: {},
    beliefScores: {},
    circadianScores: {},
    loopCount: 0,
    loopFamilies: [],
    appRelationship: null,
    criticVolumeRaw: 0,
    shadowOwned: 0,
    integrationShadowsOwned: 0,
  };
}

function createContext(partial?: Partial<JourneyContext>): JourneyContext {
  return {
    userId: null,
    currentQuestionIndex: 0,
    answers: new Map(),
    scoreAccumulator: createScoreAccumulator(),
    journeyStartedAt: null,
    journeyCompletedAt: null,
    aborted: false,
    error: null,
    cinematicLayer: 0,
    ...partial,
  };
}

// ─── Processing actor ────────────────────────────────────────────────────────

const processJourneyData = fromPromise(async ({ input }: { input: JourneyContext }) => {
  // Simulate processing delay (would call Supabase Edge Function in production)
  await new Promise((r) => setTimeout(r, 2000));
  return computeMetrics(input);
});

function computeMetrics(ctx: JourneyContext): ComputedMetrics {
  const { scoreAccumulator: s } = ctx;
  const totalAnswers = ctx.answers.size;

  // Band
  const overallBand = s.bandCount > 0 ? Math.round((s.bandTotal / s.bandCount) * 10) / 10 : 3;

  // Dimensions
  const dimensionBands: Record<string, number> = {};
  for (const [dim, total] of Object.entries(s.dimensionTotals)) {
    const count = s.dimensionCounts[dim] || 1;
    dimensionBands[dim] = Math.round((total / count) * 10) / 10;
  }

  // V-Level
  const vLevelBaseline = Math.max(0, Math.min(10, overallBand + s.vLevelDeltaTotal));
  const vLevelCurrent = Math.max(0, Math.min(10, vLevelBaseline + (totalAnswers > 30 ? 0.5 : 0)));

  // Integration
  const integrationScore = Math.max(0, Math.min(10, 5 + s.integrationDeltaTotal));

  // Witness
  const witnessGap = Math.max(0, 10 - s.witnessDeltaTotal);
  const witnessStability = Math.max(0, Math.min(10, 3 + s.witnessDeltaTotal));
  const witnessDepth = Math.max(0, Math.min(10, 2 + s.witnessDeltaTotal));

  // Paths
  const sortedPaths = Object.entries(s.pathScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k);
  const primaryPath = sortedPaths[0] || "dhyana";
  const secondaryPath = sortedPaths[1] || "bhakti";

  // Archetype
  const sortedArchetypes = Object.entries(s.archetypeScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k);
  const archetypePrimary = sortedArchetypes[0] || "seeker";
  const archetypeShadow = sortedArchetypes[1] || "warrior";

  // Brain
  const sortedBrains = Object.entries(s.brainScores).sort(([, a], [, b]) => b - a);
  const dominantBrain = sortedBrains[0]?.[0] || "head";

  // Attachment
  const sortedAttachment = Object.entries(s.attachmentScores).sort(([, a], [, b]) => b - a);
  const attachmentStyle = sortedAttachment[0]?.[0] || "mixed";

  // Belief
  const sortedBeliefs = Object.entries(s.beliefScores).sort(([, a], [, b]) => b - a);
  const beliefLevel = sortedBeliefs[0]?.[0] || "mixed";

  // Circadian
  const sortedCircadian = Object.entries(s.circadianScores).sort(([, a], [, b]) => b - a);
  const circadianPeak = sortedCircadian[0]?.[0] || "evening";

  // H-Capacities
  const hCapacities: Record<string, number> = {};
  for (const [k, total] of Object.entries(s.hCapacityTotals)) {
    hCapacities[k] = Math.round(Math.max(0, Math.min(10, total)));
  }

  // Life domains
  const lifeDomains: Record<string, number> = {};

  return {
    overallBand,
    dimensionBands,
    vLevelBaseline: Math.round(vLevelBaseline * 10) / 10,
    vLevelCurrent: Math.round(vLevelCurrent * 10) / 10,
    vLevelDelta: Math.round((vLevelCurrent - vLevelBaseline) * 10) / 10,
    integrationScore: Math.round(integrationScore * 10) / 10,
    witnessGap: Math.round(witnessGap * 10) / 10,
    witnessStability: Math.round(witnessStability * 10) / 10,
    witnessDepth: Math.round(witnessDepth * 10) / 10,
    dominantBrain,
    pathScores: { ...s.pathScores },
    primaryPath,
    secondaryPath,
    archetypePrimary,
    archetypeShadow,
    topLoops: s.loopFamilies.slice(0, 5),
    loopFamilies: [...s.loopFamilies],
    beliefLevel,
    attachmentStyle,
    cognitiveStyle: "analytical",
    circadianPeak,
    emotionMaturity: Math.round(Math.max(0, Math.min(10, 5 + s.emotionDeltaTotal)) * 10) / 10,
    somaticAwareness: Math.round(Math.max(0, Math.min(10, 5 + s.somaticDeltaTotal)) * 10) / 10,
    purposeClarity: Math.round(Math.max(0, Math.min(10, 5 + s.purposeClarityTotal)) * 10) / 10,
    criticVolume: Math.round(Math.max(0, Math.min(10, s.criticVolumeRaw || s.criticVolumeTotal)) * 10) / 10,
    shadowOwned: Math.round(Math.max(0, Math.min(10, s.shadowOwned)) * 10) / 10,
    chittaVritti: Math.round(Math.max(0, Math.min(10, s.chittaVrittiTotal)) * 10) / 10,
    appRelationship: s.appRelationship || "new",
    hCapacities,
    lifeDomains,
    journeyDay: 1,
  };
}

// ─── Machine ─────────────────────────────────────────────────────────────────

export const journeyMachine = setup({
  types: {
    context: {} as JourneyContext,
    events: {} as JourneyEvent,
  },
  actors: {
    processJourneyData,
  },
}).createMachine({
  id: "cinematicJourney",
  initial: "idle",
  context: createContext(),
  states: {
    idle: {
      on: {
        START: {
          target: "questions",
          actions: assign({
            userId: ({ event }) => event.userId,
            journeyStartedAt: () => new Date().toISOString(),
            currentQuestionIndex: 0,
            answers: () => new Map(),
            scoreAccumulator: () => createScoreAccumulator(),
            cinematicLayer: 0,
            aborted: () => false,
            error: () => null,
          }),
        },
        ABORT: "exiting",
      },
    },

    questions: {
      on: {
        ANSWER: [
          {
            guard: ({ context }) => context.currentQuestionIndex >= JOURNEY_QUESTION_COUNT,
            target: "processing",
          },
          {
            actions: assign({
              currentQuestionIndex: ({ context, event }) => {
                const next = context.currentQuestionIndex + 1;
                const newAnswers = new Map(context.answers);
                newAnswers.set(context.currentQuestionIndex, event.answer);
                return next;
              },
              answers: ({ context, event }) => {
                const newAnswers = new Map(context.answers);
                newAnswers.set(context.currentQuestionIndex, event.answer);
                return newAnswers;
              },
              scoreAccumulator: ({ context, event }) => {
                const acc = { ...context.scoreAccumulator };
                accumulateScore(acc, event.answer.scoreTags);
                return acc;
              },
              cinematicLayer: ({ event }) => {
                const qIndex = event.questionIndex;
                if (qIndex < 15) return 0;
                if (qIndex < 35) return 1;
                if (qIndex < 55) return 2;
                return 3;
              },
            }),
          },
        ],
        SKIP_QUESTION: [
          {
            guard: ({ context }) => context.currentQuestionIndex >= JOURNEY_QUESTION_COUNT,
            target: "processing",
          },
          {
            actions: assign({
              currentQuestionIndex: ({ context }) => context.currentQuestionIndex + 1,
            }),
          },
        ],
        NEXT_QUESTION: [
          {
            guard: ({ context }) => context.currentQuestionIndex >= JOURNEY_QUESTION_COUNT,
            target: "processing",
          },
          {
            actions: assign({
              currentQuestionIndex: ({ context }) => context.currentQuestionIndex + 1,
            }),
          },
        ],
        ABORT: "exiting",
      },
    },

    processing: {
      invoke: {
        src: "processJourneyData",
        input: ({ context }) => context,
        onDone: {
          target: "metricsReveal",
          actions: assign({
            journeyCompletedAt: () => new Date().toISOString(),
          }),
        },
        onError: {
          target: "error",
          actions: assign({ error: ({ event }) => (event.error as Error).message }),
        },
      },
    },

    metricsReveal: {
      on: {
        PERSONALIZATION_CONFIRMED: "complete",
        ABORT: "exiting",
      },
    },

    personalization: {
      on: {
        PERSONALIZATION_CONFIRMED: "complete",
        ABORT: "exiting",
      },
    },

    complete: {
      on: {
        ABORT: "exiting",
        RESET: {
          target: "idle",
          actions: assign({
            currentQuestionIndex: 0,
            answers: () => new Map(),
            scoreAccumulator: () => createScoreAccumulator(),
            journeyStartedAt: null,
            journeyCompletedAt: null,
            aborted: () => false,
            error: null,
            cinematicLayer: 0,
          }),
        },
      },
    },

    error: {
      on: {
        RETRY: "processing",
        ABORT: "exiting",
      },
    },

    exiting: {
      type: "final",
    },
  },
});

// ─── Score accumulation ───────────────────────────────────────────────────────

function accumulateScore(acc: ScoreAccumulator, tags: ScoreTag[]): void {
  for (const tag of tags) {
    if ("band" in tag && tag.band !== undefined) {
      acc.bandTotal += tag.band;
      acc.bandCount++;
    }
    if ("vLevelDelta" in tag && tag.vLevelDelta !== undefined) {
      acc.vLevelDeltaTotal += tag.vLevelDelta;
    }
    if ("dimension" in tag && tag.dimension) {
      for (const [k, v] of Object.entries(tag.dimension)) {
        acc.dimensionTotals[k] = (acc.dimensionTotals[k] || 0) + v;
        acc.dimensionCounts[k] = (acc.dimensionCounts[k] || 0) + 1;
      }
    }
    if ("brain" in tag && tag.brain) {
      acc.brainScores[tag.brain] = (acc.brainScores[tag.brain] || 0) + 1;
    }
    if ("paths" in tag && tag.paths) {
      for (const [k, v] of Object.entries(tag.paths)) {
        acc.pathScores[k] = (acc.pathScores[k] || 0) + v;
      }
    }
    if ("archetype" in tag && tag.archetype) {
      acc.archetypeScores[tag.archetype] = (acc.archetypeScores[tag.archetype] || 0) + 1;
    }
    if ("loops" in tag && tag.loops) {
      acc.loopFamilies.push(...tag.loops);
      acc.loopCount += tag.loops.length;
    }
    if ("integrationDelta" in tag && tag.integrationDelta !== undefined) {
      acc.integrationDeltaTotal += tag.integrationDelta;
    }
    if ("witnessDelta" in tag && tag.witnessDelta !== undefined) {
      acc.witnessDeltaTotal += tag.witnessDelta;
    }
    if ("emotionDelta" in tag && tag.emotionDelta !== undefined) {
      acc.emotionDeltaTotal += tag.emotionDelta;
    }
    if ("somaticDelta" in tag && tag.somaticDelta !== undefined) {
      acc.somaticDeltaTotal += tag.somaticDelta;
    }
    if ("purposeClarity" in tag && tag.purposeClarity !== undefined) {
      acc.purposeClarityTotal += tag.purposeClarity;
    }
    if ("criticVolume" in tag && tag.criticVolume !== undefined) {
      acc.criticVolumeTotal += tag.criticVolume;
      acc.criticVolumeRaw += tag.criticVolume;
    }
    if ("shadowProjection" in tag && tag.shadowProjection !== undefined) {
      acc.shadowProjectionTotal += tag.shadowProjection;
    }
    if ("chittaVritti" in tag && tag.chittaVritti !== undefined) {
      acc.chittaVrittiTotal += tag.chittaVritti;
    }
    if ("somaticAwareness" in tag && tag.somaticAwareness !== undefined) {
      acc.somaticAwareness += tag.somaticAwareness;
    }
    if ("circadian" in tag && tag.circadian) {
      acc.circadianScores[tag.circadian] = (acc.circadianScores[tag.circadian] || 0) + 1;
    }
    if ("belief" in tag && tag.belief) {
      acc.beliefScores[tag.belief] = (acc.beliefScores[tag.belief] || 0) + 1;
    }
    if ("attachment" in tag && tag.attachment) {
      acc.attachmentScores[tag.attachment] = (acc.attachmentScores[tag.attachment] || 0) + 1;
    }
    if ("cognitive" in tag && tag.cognitive) {
      acc.beliefScores[tag.cognitive] = (acc.beliefScores[tag.cognitive] || 0) + 1;
    }
    if ("appRelationship" in tag && tag.appRelationship) {
      acc.appRelationship = tag.appRelationship;
    }
    if ("hCapacity" in tag && tag.hCapacity) {
      for (const [k, v] of Object.entries(tag.hCapacity)) {
        acc.hCapacityTotals[k] = (acc.hCapacityTotals[k] || 0) + v;
      }
    }
  }
}
