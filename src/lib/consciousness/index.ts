/**
 * CONSCIOUSNESS ENGINE INDEX — Re-exports all consciousness modules
 */

// Core types
export * from '@/types/consciousness';
export * from '@/types/practices';
export * from '@/types/dimension-matrix';

// V-Level & Progression
export { calculateVLevel, detectSpeedProfile as detectSpeedProfileFromHistory, shouldLevelUp, checkBypassingRisk, sessionsToReturn, getWarmUpAdjustment } from './vLevelCalculator';

// Practice Engine
export { getNextPractice, detectPlateau, getSessionFormula } from './practiceEngine';
export type { UserPracticeState, UserSpiritualDNA, EngineContext, PracticeRecommendation } from './practiceEngine';

// Dimension Tracker
export { generatePracticeSignals, applySignals, createInitialSnapshot, getWeakestPrimaryDimension, getDimensionBalance, createDailySummary } from './dimensionTracker';
export type { DimensionSignal, DimensionSnapshot, SignalSource } from './dimensionTracker';

// Speed Profile Engine
export { detectSpeedProfile, getAdaptiveDifficulty, handleGuiltDetection, getWarmUpAfterGap } from './speedProfileEngine';
export type { SpeedDetectionInput, SpeedDetectionResult, GuiltSignals, GuiltResponse, WarmUpConfig } from './speedProfileEngine';

// Daily Gates (Dynamic Context System)
export { 
  GATES, 
  TIME_SLOT_PATTERNS, 
  getCurrentGate, 
  getGateDef, 
  isGateActive, 
  getGateGreeting, 
  getNightGuardMessage, 
  determineEntryContext,
  getAdaptiveGateConfig,
  getLoopAntidote,
  getGateRecommendations,
  LOOP_ANTIDOTES,
  GATE_PRACTICE_MAP,
} from './dailyGates';
export type { 
  GateId, 
  GateContext, 
  TimeSlotPatternId, 
  TimeSlotPattern, 
  UserTimeProfile, 
  EntryContextType, 
  EntryContext,
  GateSessionConfig,
} from './dailyGates';

// Assessment Detector
export { detectAllLevels, detectPaths, detectBrainDominance, processAssessment } from './assessmentDetector';
export type { AssessmentAnswer, AssessmentResults } from './assessmentDetector';

// Session Generator
export { generateSessionPlan, getAdaptedDuration } from './sessionGenerator';
export type { SessionPlan, SessionContext } from './sessionGenerator';

// Cognitive Agent System
export { ALL_AGENTS, getAgent, getAgentsByGroup, getAgentsForDepth, getSafeAgents } from './agents/agentDefinitions';
export type { CognitiveAgent, AgentGroupId, InterventionType } from './agents/agentDefinitions';

// State Engine
export { computeState, deriveState } from './agents/stateEngine';
export type { UserStateVector, DerivedState, EmotionalTone, UserIntent, AwarenessDepth, StateComputeInput } from './agents/stateEngine';

// Agent Router
export { routeAgents } from './agents/agentRouter';
export type { RoutingDecision, ConversationMode, ResponseIntensity } from './agents/agentRouter';

// Edge-Case Detector (51-58)
export { detectEdgeCases, getEdgeCaseAgents } from './agents/edgeCaseDetector';
export type { EdgeCaseFlag, EdgeCaseDetection, EdgeCaseInput } from './agents/edgeCaseDetector';

// Stage Engine (8-stage hidden consciousness model)
export { detectStage, computeStage, computeStageScores, smoothStage, getNarrativeHint, STAGE_LABELS } from './agents/stageEngine';
export type { ConsciousnessStage, StageScores, StageInput, StageDetection } from './agents/stageEngine';

// Insight Layer (teachability + framework reveal)
export { buildInsightDecision, computeTeachability, detectSpiritualLean, decideInsightDepth, getRevealLevel } from './agents/insightLayer';
export type { InsightDepth, SpiritualLean, TeachabilityScores, InsightDecision } from './agents/insightLayer';

// Master Rotation (Batch 9)
export { selectMasterForRotation as decideRotation, selectMasterForRotation as resolveGuru } from './shared/masterSelector';
export type { RotationContext, RotationDecision, RotationReason } from './shared/masterSelector';

// 10-Phase Lifetime Spiral (Batch 9)
export { LIFETIME_PHASES, computeLifetimePhase, phaseProgress, shouldUseSilentMode } from './lifetimeSpiral';
export type { LifetimePhase, PhaseProfile, PhaseInput } from './lifetimeSpiral';

// Batch 13 — 100-Dimension Map
export { DIMENSIONS_100, getDimensionsByParent } from './taxonomy/dimensions100';
export type { SubDimension } from './taxonomy/dimensions100';

// Batch 14 — Life Stage / Relationship / Retention
export { detectLifeStage, getLifeStageProfile, LIFE_STAGE_DEFS } from './lifeStageDetector';
export type { LifeStage, LifeStageProfile } from './lifeStageDetector';
export { computeRelationship } from './relationshipDepth';
export type { RelationshipPhase, RelationshipState } from './relationshipDepth';
export { computeRetention } from './retentionEngine';
export type { RetentionRisk, RetentionInput, RetentionPrescription } from './retentionEngine';

// Consciousness Orchestrator — Unified Entry Point
export { ConsciousnessOrchestrator, getConsciousnessOrchestrator, orchestrateSession } from './orchestrator';
export type {
  OrchestrationRuntime,
  OrchestratedSession,
  ConsciousnessSignals,
  HardwareSignals,
  BioSignalData,
  VoicePatternData,
  MicroExpressionData,
  EnvironmentScanData,
  NoveltyReport,
  OrchestrationConfig,
} from './orchestrator';
