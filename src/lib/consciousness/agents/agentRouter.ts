/**
 * AGENT ROUTING ALGORITHM — The decision engine
 * Determines which 2-3 cognitive agents to activate per interaction.
 * Runs AFTER state computation, BEFORE response generation.
 */

import type { UserStateVector, DerivedState } from './stateEngine';
import type { CognitiveAgent } from './agentDefinitions';
import { ALL_AGENTS, getAgent } from './agentDefinitions';
import type { GateId } from '../dailyGates';
import { getEdgeCaseAgents, type EdgeCaseDetection, type EdgeCaseFlag } from './edgeCaseDetector';

// ─── Routing Output ───

export type ConversationMode =
  | 'witness'     // Calm, reflective — user overwhelmed
  | 'guide'       // Clear, structured — user seeking direction
  | 'inquiry'     // Deep questioning — user introspective
  | 'disrupt'     // Pattern break — loop detected
  | 'companion'   // Human-like presence — casual/emotional
  | 'silent'      // Minimal words — high awareness user
  | 'mirror'      // Reflects user exactly
  | 'challenger'  // Confronts illusion
  | 'grounding'   // Stabilizes
  | 'expansion'   // Opens perspective
  | 'devotion'    // Surrender-based
  | 'logic';      // Rational clarity

export type ResponseIntensity = 'minimal' | 'gentle' | 'moderate' | 'strong' | 'sharp';

export interface RoutingDecision {
  /** Selected agents (max 3, ordered by priority) */
  agents: CognitiveAgent[];
  /** Primary conversation mode */
  mode: ConversationMode;
  /** Response intensity level */
  intensity: ResponseIntensity;
  /** Max response length in sentences */
  maxSentences: number;
  /** Whether to include a question */
  includeQuestion: boolean;
  /** Whether to reference memory/patterns */
  useMemory: boolean;
  /** Reasoning for this routing (internal debug) */
  routingReason: string;
}

// ─── Router Function ───

export function routeAgents(
  state: UserStateVector,
  derivedState: DerivedState,
  gateId: GateId,
  options: {
    patternDetected?: boolean;
    patternType?: string;
    hasMemory?: boolean;
    sessionCount?: number;
    activeLoopCount?: number;
    edgeCase?: EdgeCaseDetection;
  } = {},
): RoutingDecision {
  const { patternDetected, hasMemory, sessionCount = 0, activeLoopCount = 0, edgeCase } = options;

  // ─── STEP 0: EDGE-CASE OVERRIDE (highest priority after crisis) ───
  if (edgeCase?.primary && edgeCase.confidence > 0.4) {
    const override = buildEdgeCaseRouting(edgeCase.primary, state);
    if (override) return override;
  }

  // ─── STEP 1: SAFETY FILTER ───
  if (state.fragility > 7 || derivedState === 'crisis') {
    return {
      agents: resolveAgents(['trauma-companion', 'witness', 'grounding-agent']),
      mode: 'grounding',
      intensity: 'gentle',
      maxSentences: 3,
      includeQuestion: false,
      useMemory: false,
      routingReason: 'Crisis/high fragility — safety-first agents only',
    };
  }

  if (state.fragility > 5 || derivedState === 'fragile') {
    return {
      agents: resolveAgents(['safe-space', 'witness', 'emotional-labeler']),
      mode: 'companion',
      intensity: 'gentle',
      maxSentences: 3,
      includeQuestion: true,
      useMemory: false,
      routingReason: 'Fragile state — safe companion agents',
    };
  }

  // ─── STEP 2: CELEBRATION ───
  if (derivedState === 'celebration') {
    return {
      agents: resolveAgents(['encourager', 'awareness-amplifier', 'momentum-builder']),
      mode: 'companion',
      intensity: 'moderate',
      maxSentences: 4,
      includeQuestion: true,
      useMemory: true,
      routingReason: 'Celebration — amplify and anchor the positive shift',
    };
  }

  // ─── STEP 3: PATTERN-DRIVEN ROUTING ───
  if (patternDetected && activeLoopCount > 0) {
    const primary = state.awarenessLevel > 5 ? 'pattern-disruptor' : 'pattern-finder';
    const secondary = state.awarenessLevel > 6 ? 'observer' : 'cognitive-reframer';
    return {
      agents: resolveAgents([primary, secondary]),
      mode: 'disrupt',
      intensity: state.awarenessLevel > 5 ? 'strong' : 'moderate',
      maxSentences: 3,
      includeQuestion: true,
      useMemory: true,
      routingReason: `Pattern detected — ${primary} + ${secondary}`,
    };
  }

  // ─── STEP 4: INTENT-DRIVEN ROUTING ───
  const intentRouting = routeByIntent(state, derivedState, gateId, hasMemory ?? false, sessionCount);
  if (intentRouting) return intentRouting;

  // ─── STEP 5: GATE-INFLUENCED DEFAULTS ───
  return routeByGate(state, gateId, hasMemory ?? false);
}

// ─── Intent-Based Routing ───

function routeByIntent(
  state: UserStateVector,
  derivedState: DerivedState,
  gateId: GateId,
  hasMemory: boolean,
  sessionCount: number,
): RoutingDecision | null {
  switch (state.intent) {
    case 'fix':
      return {
        agents: resolveAgents(['micro-step-planner', state.resistanceLevel > 4 ? 'anti-procrastination' : 'executor']),
        mode: 'guide',
        intensity: 'moderate',
        maxSentences: 4,
        includeQuestion: true,
        useMemory: hasMemory,
        routingReason: 'User wants to fix — action agents',
      };

    case 'transform': {
      const transformAgent = state.awarenessLevel > 6 ? 'self-inquiry-master' : 'observer';
      return {
        agents: resolveAgents([transformAgent, 'awareness-amplifier']),
        mode: 'inquiry',
        intensity: state.awarenessLevel > 5 ? 'strong' : 'moderate',
        maxSentences: 3,
        includeQuestion: true,
        useMemory: true,
        routingReason: 'User seeks transformation — inquiry agents',
      };

    }

    case 'vent':
    case 'express':
      return {
        agents: resolveAgents(['listener', 'emotional-labeler']),
        mode: 'companion',
        intensity: 'gentle',
        maxSentences: 2,
        includeQuestion: true,
        useMemory: false,
        routingReason: 'User needs to express — listening agents',
      };

    case 'seek_validation':
      return {
        agents: resolveAgents(['friend', sessionCount > 10 ? 'reality-checker' : 'encourager']),
        mode: 'companion',
        intensity: 'gentle',
        maxSentences: 3,
        includeQuestion: true,
        useMemory: hasMemory,
        routingReason: 'User seeking validation — companion + gentle truth',
      };

    case 'seek_truth':
      return {
        agents: resolveAgents([
          state.awarenessLevel > 6 ? 'truth-mirror' : 'observer',
          state.awarenessLevel > 4 ? 'illusion-breaker' : 'cognitive-reframer',
        ]),
        mode: state.awarenessLevel > 6 ? 'challenger' : 'inquiry',
        intensity: state.awarenessLevel > 6 ? 'sharp' : 'moderate',
        maxSentences: 3,
        includeQuestion: true,
        useMemory: true,
        routingReason: 'User seeks truth — depth-appropriate truth agents',
      };

    case 'learn':
      return {
        agents: resolveAgents(['philosopher', 'awareness-amplifier']),
        mode: 'guide',
        intensity: 'moderate',
        maxSentences: 5,
        includeQuestion: true,
        useMemory: false,
        routingReason: 'User wants to learn — teaching agents',
      };

    case 'connect':
      return {
        agents: resolveAgents(['friend', 'listener']),
        mode: 'companion',
        intensity: 'gentle',
        maxSentences: 3,
        includeQuestion: true,
        useMemory: hasMemory,
        routingReason: 'User wants connection — companion agents',
      };

    case 'escape':
      return {
        agents: resolveAgents(['presence-stabilizer', state.awarenessLevel > 3 ? 'observer' : 'breath-guide']),
        mode: 'grounding',
        intensity: 'gentle',
        maxSentences: 3,
        includeQuestion: false,
        useMemory: false,
        routingReason: 'User trying to escape — grounding agents',
      };

    case 'explore':
      return {
        agents: resolveAgents([
          state.awarenessLevel > 5 ? 'paradox-generator' : 'philosopher',
          'awareness-amplifier',
        ]),
        mode: 'expansion',
        intensity: 'moderate',
        maxSentences: 4,
        includeQuestion: true,
        useMemory: hasMemory,
        routingReason: 'User exploring — expansion agents',
      };

    default:
      return null;
  }
}

// ─── Gate-Based Default Routing ───

function routeByGate(state: UserStateVector, gateId: GateId, hasMemory: boolean): RoutingDecision {
  switch (gateId) {
    case 'morning':
      return {
        agents: resolveAgents(['presence-stabilizer', 'encourager']),
        mode: 'guide',
        intensity: 'moderate',
        maxSentences: 4,
        includeQuestion: true,
        useMemory: hasMemory,
        routingReason: 'Morning default — grounding + gentle direction',
      };

    case 'midday':
      return {
        agents: resolveAgents(['presence-stabilizer']),
        mode: 'grounding',
        intensity: 'minimal',
        maxSentences: 2,
        includeQuestion: false,
        useMemory: false,
        routingReason: 'Midday default — brief presence anchor',
      };

    case 'evening':
      return {
        agents: resolveAgents(['awareness-amplifier', hasMemory ? 'pattern-finder' : 'observer']),
        mode: 'inquiry',
        intensity: 'moderate',
        maxSentences: 4,
        includeQuestion: true,
        useMemory: true,
        routingReason: 'Evening default — reflection + pattern awareness',
      };

    case 'night':
      return {
        agents: resolveAgents(['breath-guide', 'silence-keeper']),
        mode: 'silent',
        intensity: 'minimal',
        maxSentences: 2,
        includeQuestion: false,
        useMemory: false,
        routingReason: 'Night default — minimal, settling',
      };
  }
}

// ─── Helper ───

function resolveAgents(ids: string[]): CognitiveAgent[] {
  return ids
    .map(id => getAgent(id))
    .filter((a): a is CognitiveAgent => a !== undefined)
    .slice(0, 3); // Hard limit: max 3 agents
}

// ─── Edge-case routing override ───

function buildEdgeCaseRouting(flag: EdgeCaseFlag, state: UserStateVector): RoutingDecision | null {
  const agentIds = getEdgeCaseAgents(flag);
  const agents = resolveAgents(agentIds);
  if (agents.length === 0) return null;

  const profiles: Record<EdgeCaseFlag, Omit<RoutingDecision, 'agents' | 'routingReason'>> = {
    spiritual_bypassing:  { mode: 'challenger',  intensity: 'strong',   maxSentences: 3, includeQuestion: true,  useMemory: true  },
    ego_inflation:        { mode: 'challenger',  intensity: 'sharp',    maxSentences: 2, includeQuestion: true,  useMemory: false },
    over_dependency:      { mode: 'inquiry',     intensity: 'gentle',   maxSentences: 2, includeQuestion: true,  useMemory: false },
    emotional_collapse:   { mode: 'grounding',   intensity: 'gentle',   maxSentences: 3, includeQuestion: false, useMemory: false },
    intellectual_loop:    { mode: 'guide',       intensity: 'moderate', maxSentences: 3, includeQuestion: true,  useMemory: true  },
    masked_resistance:    { mode: 'disrupt',     intensity: 'moderate', maxSentences: 3, includeQuestion: true,  useMemory: true  },
    silent_user:          { mode: 'companion',   intensity: 'gentle',   maxSentences: 1, includeQuestion: true,  useMemory: false },
    topic_jumping:        { mode: 'grounding',   intensity: 'gentle',   maxSentences: 2, includeQuestion: true,  useMemory: false },
    highly_advanced:      { mode: 'silent',      intensity: 'minimal',  maxSentences: 1, includeQuestion: false, useMemory: false },
    low_awareness:        { mode: 'companion',   intensity: 'gentle',   maxSentences: 3, includeQuestion: true,  useMemory: false },
    rapid_depth_risk:     { mode: 'grounding',   intensity: 'gentle',   maxSentences: 3, includeQuestion: false, useMemory: false },
  };

  const profile = profiles[flag];
  return {
    agents,
    ...profile,
    routingReason: `Edge case: ${flag} → ${agents.map(a => a.id).join(' + ')}`,
  };
}
