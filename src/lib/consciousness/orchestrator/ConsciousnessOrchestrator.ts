/**
 * CONSCIOUSNESS ORCHESTRATOR — Single Entry Point for All Session Intelligence
 * =============================================================================
 * Unifies: Composer + Adaptive Journey + Session Engine + Loop Detector + Memory + Guide Selection
 * 
 * INTEGRATES _shared ENGINES:
 * - adaptive-engine.ts → per-turn intelligence (buildAdaptiveDecision)
 * - arcEngine.ts → multi-day continuity (buildArcDirective)
 * - themeOrchestrator.ts → daily theme intelligence (buildThemeDirective)
 * - composer.ts → deterministic fallback (composeSession)
 * - voice-lineage.ts → council voice mappings
 * - practiceMatrix.ts → practice constraint signals
 * - chakraEngine.ts → chakra focus signals
 * 
 * Replaces: compose-session-v3 + session-adapter + adaptive-journey-engine + sessionOrchestrator
 * 
 * One call: orchestrateSession(userId, runtimeOverrides) → Complete SessionPlan
 */

import { createClient } from '@supabase/supabase-js';
import { supabase as authSupabase } from '@/lib/supabase';
import { getUserContext, type UserContext, type Gate, type Energy, computeVLevelRpc } from '@/lib/supabase/user-context';
import { buildLongTermMemoryBlock } from '@/lib/supabase/long-term-memory';
import { calculateVLevel } from '@/lib/shared/vLevel';

type VLevelResult = ReturnType<typeof calculateVLevel>;
import { getNextPractice, type PracticeRecommendation, type EngineContext } from '@/lib/consciousness/practiceEngine';
import { detectStage, type StageInput, type StageDetection } from '@/lib/consciousness/agents/stageEngine';
import { routeAgents, type RoutingDecision } from '@/lib/consciousness/agents/agentRouter';
import { computeState, deriveState, type DerivedState, type UserStateVector } from '@/lib/consciousness/agents/stateEngine';
import { decideRotation, type RotationDecision } from '@/lib/consciousness/masterRotation';
import { selectGuruForSession, type GuruSelection } from '@/lib/consciousness/dynamicGuruSelector';
import { masterProfile } from '@/lib/consciousness/shared/masterSelector';
import type { SessionPlan } from '@/lib/session-shell/types';
import { getCrossPollinationSuggestion } from '@/types/dimension-matrix';
import { buildStepScript } from '@/supabase/_shared/stepScript';
import { computeRelationship } from '@/lib/consciousness/relationshipDepth';
import type { DimensionId } from '@/types/consciousness';
import { assessCrisis } from '@/supabase/_shared/crisis';
import { logCrisisEvent } from '@/lib/telemetry/engineTelemetry';

// ============================================================
// Import _shared engines (the TRUE brain)
// ============================================================
import {
  buildAdaptiveDecision,
  type AdaptiveContext,
  type AdaptiveDecision,
  type EntryContextType,
} from '@/supabase/_shared/adaptive-engine';

import {
  buildArcDirective,
  type ArcDirectiveInput,
  type ArcDirective,
} from '@/supabase/_shared/arcEngine';

import {
  buildThemeDirective,
  type OrchestratorInput,
  type ThemeDirective,
} from '@/supabase/_shared/themeOrchestrator';

import {
  composeSession,
  selectArchetype,
  type ComposerContext,
  type ComposedSession,
  ARCHETYPES,
  INGREDIENTS,
} from '@/supabase/_shared/composer';

const VOICE_LINEAGE: Record<"head" | "heart" | "gut", { path: string; masters: string[] }> = {
  head: { path: "Jnana", masters: ["Ramana", "Krishnamurti", "Nisargadatta", "Shankara"] },
  heart: { path: "Bhakti", masters: ["Rumi", "Meera", "Ramakrishna", "Hafiz"] },
  gut: { path: "Karma/Raja", masters: ["Adiyogi/Shiva", "Patanjali", "Buddha", "Lao Tzu"] },
};
import { buildPracticeMatrixSignal } from '@/supabase/_shared/practiceMatrix';
import { detectBlockedChakra } from '@/supabase/_shared/chakraEngine';
import { loopName } from '@/supabase/_shared/loopMap';
import { embedText } from '@/supabase/_shared/long-term-memory';

// ============================================================
// Types
// ============================================================

export interface OrchestrationRuntime {
  timeBudgetMin?: number;
  energy?: Energy;
  gate?: Gate;
  hour?: number;
  mood?: string;
  intent?: string;
  preferredArchetype?: string;
  forceRecalibration?: boolean;
}

type GuruSelectionWithLocalName = GuruSelection & { guruName: string };

export interface OrchestratedSession {
  sessionId: string;
  plan: SessionPlan;
  archetype: string;
  leadVoice: 'head' | 'heart' | 'gut';
  leadMaster: string;
  guruSelection: GuruSelection;
  rotationDecision: RotationDecision;
  vLevel: VLevelResult;
  stageDetection: StageDetection;
  practiceRecommendation: PracticeRecommendation;
  routingDecision: RoutingDecision;
  derivedState: DerivedState;
  adaptiveDecision: AdaptiveDecision;      // NEW: per-turn intelligence
  arcDirective: ArcDirective | null;       // NEW: multi-day continuity
  themeDirective: ThemeDirective | null;   // NEW: daily theme intelligence
  deterministicPlan: ComposedSession | null; // NEW: deterministic fallback
  memoryBlock: string;
  signals: ConsciousnessSignals;
  hardwareSignals: HardwareSignals;
  noveltyReport: NoveltyReport[];
  whyForYouCount: number;
  elapsedMs: number;
}

export interface ConsciousnessSignals {
  vLevel: number;
  journeyDay: number;
  chittaVritti: string | null;
  dimensions: { thought: number; emotion: number; body: number; awareness: number } | null;
  dimensionBands: Record<string, number>;
  activeLoops: string[];
  paths: Record<string, number>;
  witness: { stability: number; depth: number; gap: number };
  gate: Gate;
  energy: Energy;
  timeBudgetMin: number;
  gapDays: number;
  starvedDimension: string | null;
  chakraFocus: string;
  practiceLevels: Record<string, number>;
  namedLoops: Array<{ id: string; name: string }>;
  practiceMatrix: any;           // NEW
  chakraSignal: any;             // NEW
}

export interface HardwareSignals {
  bioSignals: BioSignalData | null;
  voicePatterns: VoicePatternData | null;
  microExpressions: MicroExpressionData | null;
  environmentScan: EnvironmentScanData | null;
}

export interface BioSignalData {
  hrv: number | null;
  eda: number | null;
  skinTemp: number | null;
  accelerometer: { x: number; y: number; z: number } | null;
  spo2: number | null;
  lastUpdated: string | null;
}

export interface VoicePatternData {
  prosody: { pitch: number; speed: number; variability: number } | null;
  wordPatterns: { shouldCount: number; cantCount: number; theyAlwaysCount: number; itsFineCount: number; noticeCount: number } | null;
  speechSilenceRatio: number | null;
  vocalBiomarkers: { cortisol: number; microTremors: number; breathPatterns: number } | null;
  conversationDynamics: { dominance: number; topicAvoidance: number; emotionalContagion: number; agreementPatterns: number } | null;
  lastUpdated: string | null;
}

export interface MicroExpressionData {
  contemptFlash: boolean;
  fearFlash: boolean;
  disgustFlash: boolean;
  eyePatterns: { rapidMovement: boolean; softGaze: boolean; downwardGaze: boolean; avoidance: boolean } | null;
  facialTension: { jawClenching: boolean; foreheadTension: boolean; eyeArea: boolean } | null;
  breathingPatterns: { shallow: boolean; deep: boolean; irregular: boolean } | null;
  stateClassification: 'kshipta' | 'mudha' | 'vikshipta' | 'ekagra' | 'niruddha' | null;
  lastUpdated: string | null;
}

export interface EnvironmentScanData {
  lightLevel: number | null;
  soundLevel: number | null;
  airQuality: number | null;
  temperature: number | null;
  locationPattern: string | null;
  screenTime: number | null;
  socialProximity: number | null;
  lastUpdated: string | null;
}

export interface NoveltyReport {
  index: number;
  maxSim: number;
  matched?: string;
  flagged: boolean;
  repaired: boolean;
}

export interface OrchestrationConfig {
  supabaseUrl: string;
  serviceRoleKey: string;
  anonKey: string;
  aiMode: 'fast' | 'premium';
  enableNoveltyFilter: boolean;
  enableHardwareSignals: boolean;
  enableMemoryInjection: boolean;
  maxSteps: number;
  minSteps: number;
  timeoutMs: number;
}

// ============================================================
// ConsciousnessOrchestrator Class
// ============================================================

export class ConsciousnessOrchestrator {
  private config: OrchestrationConfig;
  private supabase: ReturnType<typeof createClient>;
  private adminClient: ReturnType<typeof createClient>;

  constructor(config: OrchestrationConfig) {
    this.config = config;
    // Use the app's authenticated client so RLS sees the signed-in user.
    // The browser never holds a service-role key: privileged writes belong
    // to edge functions.
    this.supabase = authSupabase as unknown as ReturnType<typeof createClient>;
    this.adminClient = this.supabase;
  }

  /**
   * MAIN ENTRY POINT — Orchestrate a complete session
   * 
   * Pipeline:
   * 1. Get full user context (parallel reads)
   * 2. Fetch hardware signals (watch, voice, camera, environment)
   * 3. Compute V-Level (server-authoritative via RPC)
   * 4. Build practice matrix + chakra signals
   * 5. Detect consciousness stage (8-stage model)
   * 6. Route cognitive agents
   * 7. Compute derived state (3-brain + witness)
   * 8. BUILD ADAPTIVE DECISION (per-turn intelligence)
   * 9. BUILD ARC DIRECTIVE (multi-day continuity)
   * 10. BUILD THEME DIRECTIVE (daily theme intelligence)
   * 11. Select guru/master (dynamic + rotation)
   * 12. Get practice recommendation
   * 13. Build memory block
   * 14. COMPOSE DETERMINISTIC SESSION (server composer fallback)
   * 15. Council layer (3 voices + synthesizer) with all directives
   * 16. AI Composer (enhances deterministic base)
   * 17. Novelty filter + repair
   * 18. Persist session_spine + embeddings
   * 19. Generate next whisper + evolve theme
   */
  async orchestrateSession(
    userId: string,
    runtime: OrchestrationRuntime = {}
  ): Promise<OrchestratedSession> {
    const t0 = Date.now();
    const requestId = `orch_${userId}_${t0}`;

    // ─── Crisis gate (HIGHEST priority) — no composition for acute risk ───
    const crisis = assessCrisis(runtime.intent);
    if (crisis.isCrisis) {
      void logCrisisEvent({
        userId,
        surface: 'orchestrator',
        severity: 'acute',
        matched: crisis.matched,
        action: 'short_circuit',
      });
      return this.getCrisisSession(runtime, Date.now() - t0);
    }

    try {
      // ─── 1. PARALLEL READ LAYER ───
      const [
        userCtx,
        memBlock,
        hardwareSignals,
        prevSpine,
        whisper,
        theme,
        history,
        activeArc,
        recentThemes,
      ] = await Promise.all([
        this.getUserContextWithTimeout(userId, runtime),
        this.getMemoryBlock(userId, runtime),
        this.config.enableHardwareSignals ? this.fetchHardwareSignals(userId) : Promise.resolve(this.getEmptyHardwareSignals()),
        this.getPreviousSpine(userId),
        this.getUnconsumedWhisper(userId),
        this.getCurrentTheme(userId),
        this.getAdaptiveHistory(userId),
        this.getActiveArc(userId),
        this.getRecentThemes(userId),
      ]);

      // ─── 2. COMPUTE CORE SIGNALS ───
      const signals = this.buildSignals(userCtx, hardwareSignals);
      const starvedDim = this.findStarvedDimension(signals.dimensions);
      const chakra = this.detectChakra(starvedDim, signals.activeLoops, hardwareSignals);
      const practiceLevelsCompact = this.compactPracticeLevels(userCtx.practiceLevels);
      const namedLoops = this.resolveNamedLoops(signals.activeLoops);

      // ─── 3. PRACTICE MATRIX + CHAKRA (from _shared) ───
      const practiceRows = Object.entries(userCtx.practiceLevels || {}).map(
        ([practice_type, v]: [string, any]) => ({
          practice_type,
          current_level: v?.level ?? 0,
          sessions_at_level: v?.sessionsAtLevel ?? 0,
          emotional_healing: v?.emotionalHealing ?? 0,
          loop_dissolution: v?.loopDissolution ?? 0,
        }),
      );
      const practiceMatrix = buildPracticeMatrixSignal(practiceRows);
      const chakraSignal = detectBlockedChakra({
        weakestDimension: starvedDim,
        topLoopId: signals.activeLoops[0] ?? null,
        stressedDomain: practiceMatrix.mostStressedDomain ?? null,
        samskaraChakras: null,
        bypassingRisk: 0,
      });

      // Add to signals
      signals.practiceMatrix = practiceMatrix;
      signals.chakraSignal = chakraSignal;
      signals.chakraFocus = chakraSignal.primary.id;
      signals.starvedDimension = starvedDim;
      signals.namedLoops = namedLoops;

      // ─── 4. V-LEVEL (SERVER-AUTHORITATIVE VIA RPC) ───
      const vLevelRpc = await computeVLevelRpc(
        signals.dimensions || { thought: 0, emotion: 0, body: 0, awareness: 0 },
        {
          dimension_bands: signals.dimensionBands,
          witness_gap: signals.witness.gap,
          witness_stability: signals.witness.stability,
          witness_depth: signals.witness.depth,
          loop_severity: this.buildLoopSeverity(userCtx.activeLoops),
          integration_score: signals.witness.stability,
          v_level_baseline: userCtx.spiritual.vLevelBaseline,
          v_level_peak: userCtx.spiritual.vLevelPeak,
          journey_day: userCtx.spiritual.journeyDay,
          total_sessions: userCtx.behavior.sessionsLast7d * 4,
          last_session_at: userCtx.behavior.lastSessionAt,
        }
      );
      
      const vLevel: VLevelResult = (vLevelRpc || calculateVLevel(signals.dimensions || {}, {
        dimension_bands: signals.dimensionBands,
        witness_gap: signals.witness.gap,
        witness_stability: signals.witness.stability,
        witness_depth: signals.witness.depth,
        loop_severity: this.buildLoopSeverity(userCtx.activeLoops),
        integration_score: signals.witness.stability,
        v_level_baseline: userCtx.spiritual.vLevelBaseline,
        v_level_peak: userCtx.spiritual.vLevelPeak,
        journey_day: userCtx.spiritual.journeyDay,
        total_sessions: userCtx.behavior.sessionsLast7d * 4,
        last_session_at: userCtx.behavior.lastSessionAt,
      })) as VLevelResult;

      // ─── 5. CONSCIOUSNESS STAGE (8-STAGE MODEL) ───
      const stageInput: StageInput = {
        message: runtime.intent || '',
        consistencyScore: userCtx.behavior.consistencyScore ?? undefined,
      };
      const stageDetection = detectStage(stageInput);
      const stageScores = stageDetection.scores;

      // ─── 6. DERIVED STATE (3-BRAIN + WITNESS) ───
      const userState = computeState({
        message: runtime.intent || '',
        hour: runtime.hour ?? new Date().getHours(),
        daysSinceLastSession: userCtx.behavior.gapDays,
        sessionsToday: (userCtx.behavior.morningCompletedToday ? 1 : 0) + (userCtx.behavior.middayCompletedToday ? 1 : 0) + (userCtx.behavior.eveningCompletedToday ? 1 : 0),
        currentBand: vLevel.value,
        activeLoopIds: signals.activeLoops,
        journeyDay: userCtx.spiritual.journeyDay,
      });
      // Silence is not calm. Without text the affect defaults are meaningless,
      // so the derived state stays neutral instead of claiming stability.
      const derivedStateLabel = userState.affectUnknown ? 'neutral' : deriveState(userState);

      // ─── 7. COGNITIVE AGENT ROUTING ───
      const routingDecision = routeAgents(userState, derivedStateLabel, signals.gate, {
        activeLoopCount: signals.activeLoops.length,
        hasMemory: !!memBlock,
        sessionCount: userCtx.behavior.sessionsLast7d,
      });


      // ─── 8. ADAPTIVE DECISION (per-turn intelligence from _shared/adaptive-engine) ───
      const adaptiveContext: AdaptiveContext = {
        userText: runtime.intent || '',
        hour: runtime.hour ?? new Date().getHours(),
        daysSinceLastSession: userCtx.behavior.gapDays,
        sessionsToday: (userCtx.behavior.morningCompletedToday ? 1 : 0) + (userCtx.behavior.middayCompletedToday ? 1 : 0) + (userCtx.behavior.eveningCompletedToday ? 1 : 0),
        totalSessionCount: userCtx.behavior.sessionsLast7d * 4,
        band: vLevel.band,
        surface: 'session',
      };
      const adaptiveDecision = buildAdaptiveDecision(adaptiveContext);
      if (userState.affectUnknown) {
        adaptiveDecision.directive = `${adaptiveDecision.directive}

AFFECT UNKNOWN — the user has not said anything. Do not assert calm, do not read a mood, and do not treat silence as settled.`;
      }

      // ─── 9. ARC DIRECTIVE (multi-day continuity from _shared/arcEngine) ───
      let arcDirective: ArcDirective | null = null;
      if (activeArc) {
        const arcInput: ArcDirectiveInput = {
          arc: activeArc,
          recentChapters: await this.getRecentChapters(userId),
          yesterdayMood: userCtx.now.moodScoreToday ?? undefined,
          yesterdayEnergy: userCtx.now.energyScoreToday ?? undefined,
          breakthroughDetected: vLevel.value > (userCtx.spiritual.vLevelPeak || 0) + 0.3,
          regressionDetected: vLevel.value < (userCtx.spiritual.vLevelBaseline || 0) - 0.3,
          todayISO: new Date().toISOString().slice(0, 10),
          spiritualDnaPaths: Object.keys(userCtx.spiritual.yogaPathAffinity).filter(k => userCtx.spiritual.yogaPathAffinity[k] > 5),
        };
        arcDirective = buildArcDirective(arcInput);
      }

      // ─── 10. THEME DIRECTIVE (daily theme intelligence from _shared/themeOrchestrator) ───
      const themeInput: OrchestratorInput = {
        today: new Date().toISOString().slice(0, 10),
        journeyDay: userCtx.spiritual.journeyDay,
        overallBand: vLevel.band,
        recentThemes: recentThemes.map(t => ({
          theme_date: t.theme_date || t.created_at?.slice(0, 10) || '',
          title: t.title || '',
          description: t.description || '',
          affirmation: t.affirmation || '',
          focus_areas: t.focus_areas,
          quality: t.quality_score ?? undefined,
          completed: t.completed ?? undefined,
        })),
        recentSessionsCount7d: userCtx.behavior.sessionsLast7d,
        recentTaskCompletionRate7d: await this.getTaskCompletionRate(userId),
        yesterdayMood: userCtx.now.moodScoreToday ?? undefined,
        yesterdayEnergy: userCtx.now.energyScoreToday ?? undefined,
        regressionDetected: vLevel.value < (userCtx.spiritual.vLevelBaseline || 0) - 0.5,
        breakthroughDetected: vLevel.value > (userCtx.spiritual.vLevelPeak || 0) + 0.3,
        activeLoopSeverity: Math.max(...userCtx.activeLoops.map(l => l.severity), 0),
        practiceLevels: practiceLevelsCompact,
        anchorPath: this.getAnchorPath(userCtx.spiritual.yogaPathAffinity),
        growthPath: this.getGrowthPath(userCtx.spiritual.yogaPathAffinity),
        weakestCorePractice: this.findWeakestCore(practiceLevelsCompact),
      };
      const themeDirective = buildThemeDirective(themeInput);

      // ─── 11. GURU/MASTER SELECTION (DYNAMIC + ROTATION) ───
      const guruSelectionBase = selectGuruForSession({
        band: vLevel.band,
        activeLoops: signals.activeLoops,
        themeFocusAreas: themeDirective ? [themeDirective.reason] : [],
        themeTitle: theme?.title ?? undefined,
        excludeGuruIds: [],
      });
      const guruSelection: GuruSelectionWithLocalName = {
        ...guruSelectionBase,
        guruName: this.masterName(guruSelectionBase.guruId),
      };

      const rotationDecision = decideRotation({
        userId,
        currentGuruId: guruSelection.guruId,
        daysSinceLastRotation: this.getDaysSinceRotation(userId),
        lifetimePhase: this.getLifetimePhase(userCtx.spiritual.journeyDay),
        dominantLoop: signals.activeLoops[0] || null,
        loopSeverity: this.getLoopSeverity(userCtx.activeLoops[0]),
        avgQualityLast7Days: userCtx.behavior.avgQualityLast7d,
        progressStalled: this.isProgressStalled(userCtx),
        rotationsHistory: await this.getRotationHistory(userId),
      });

      // ─── 12. PRACTICE RECOMMENDATION ───
      const practiceRecommendation = getNextPractice({
        dimensionScores: this.resolveDimensionScores(userCtx, signals),
        practiceState: {
          levels: practiceLevelsCompact,
          sessionsAtLevel: this.extractSessionsAtLevel(userCtx.practiceLevels),
          qualityHistory: this.extractQualityHistory(userCtx.practiceLevels),
          plateauDetected: this.extractPlateaus(userCtx.practiceLevels) as any,
        },
        spiritualDNA: {
          anchorPath: this.getAnchorPath(userCtx.spiritual.yogaPathAffinity),
          growthPath: this.getGrowthPath(userCtx.spiritual.yogaPathAffinity),
          brainDominance: userCtx.spiritualDna.brainDominance as 'head' | 'heart' | 'gut' || 'head',
          circadianType: this.getCircadianType(userCtx.identity.wakeTime),
          traditionAffinity: userCtx.identity.lifestyle.tradition as string || 'universal',
        },
        activeLoops: signals.activeLoops.map(id => ({ loopId: id, practiceId: this.mapLoopToPractice(id) })) as any,
        lifeDomainStress: this.getLifeDomainStress(userId) as any,
        currentBand: vLevel.band,
        energy: signals.energy,
        timeAvailableMinutes: signals.timeBudgetMin,
      });

      // ─── 13. DETERMINISTIC COMPOSER (server composer fallback from _shared/composer) ───
      const recentSalt = [
        ...(userCtx.behavior.recentIngredientIds ?? []),
        ...history.map((h: { archetype?: string | null }) => h.archetype ?? ""),
      ].filter(Boolean).sort().join(",").slice(0, 240);
      const composerContext: ComposerContext = {
        gate: signals.gate,
        energy: signals.energy,
        gapDays: signals.gapDays,
        timeBudgetMin: signals.timeBudgetMin,
        band: vLevel.band,
        // Same user, same day, same gate → same plan; rotation comes from what
        // was actually served (recent ingredients + archetypes). The salt keeps
        // the RNG stream moving once those lists change, instead of pinning the
        // same three steps for the whole day.
        seed: `${userId}:${signals.gate}:${signals.journeyDay ?? userCtx.spiritual.journeyDay ?? 1}:${vLevel.band}:${recentSalt}`,
        activeLoops: signals.activeLoops,
        practiceLevels: practiceLevelsCompact,
        recentIngredientIds: userCtx.behavior.recentIngredientIds,
        // ── Personalization inputs the composer scores on. Without these the
        // engine silently falls back to a gate/energy/freshness picker.
        recentArchetypeIds: history
          .map((h: { archetype?: string | null }) => h.archetype)
          .filter((a): a is string => Boolean(a)),
        pathAffinity: userCtx.spiritual.yogaPathAffinity,
        journeyDay: userCtx.spiritual.journeyDay,
        journeyPhase: userCtx.spiritual.journeyPhase,
        chittaVritti: userCtx.spiritual.chittaVritti ?? signals.chittaVritti,
        dimensionBands: signals.dimensionBands ?? userCtx.spiritual.dimensionBands,
        witnessStability: signals.witness?.stability ?? userCtx.spiritual.witnessStability,
        ingredientPerformance: userCtx.behavior.ingredientPerformance,
        preferred: runtime.preferredArchetype as any,
      };
      const deterministicPlan = composeSession(composerContext);

      // ─── 14. COUNCIL LAYER (3 VOICES + SYNTHESIZER) with all directives ───
      const council = await this.runCouncil(
        signals,
        starvedDim,
        memBlock,
        userState,
        routingDecision,
        vLevel,
        stageDetection,
        hardwareSignals,
        userCtx,
        theme,
        adaptiveDecision,
        arcDirective,
        themeDirective,
        deterministicPlan,
      );

      // ─── 15. AI COMPOSER (enhances deterministic base) ───
      const plan = await this.composeSession(
        council,
        signals,
        starvedDim,
        namedLoops,
        practiceRecommendation,
        memBlock,
        prevSpine,
        whisper,
        theme,
        runtime,
        vLevel,
        stageDetection,
        userState,
        routingDecision,
        guruSelection,
        rotationDecision,
        hardwareSignals,
        adaptiveDecision,
        arcDirective,
        themeDirective,
        deterministicPlan,
      );

      // ─── 16. NOVELTY FILTER ───
      let noveltyReport: NoveltyReport[] = [];
      if (this.config.enableNoveltyFilter && plan.steps.length > 0) {
        noveltyReport = await this.runNoveltyFilter(userId, plan, council, starvedDim, namedLoops);
      }

      // ─── 17. PERSIST SESSION_SPINE ───
      const spineId = await this.persistSessionSpine(
        userId,
        plan,
        council,
        signals,
        starvedDim,
        chakra,
        vLevel,
        guruSelection,
        rotationDecision,
        noveltyReport,
      );

      // ─── 18. FIRE-AND-FORGET: WHISPER + THEME EVOLUTION ───
      const nextWhisper = this.generateNextWhisper(
        userId,
        spineId,
        plan,
        council,
        signals,
        starvedDim,
        chakra,
      );

      if (theme?.id) {
        this.evolveTheme(theme.id, spineId, council.archetype, council.lead, signals.activeLoops[0], starvedDim);
      }

      // ─── 19. MARK WHISPER CONSUMED ───
      if (whisper?.id) {
        this.markWhisperConsumed(whisper.id);
      }

      return {
        sessionId: spineId,
        plan,
        archetype: council.archetype,
        leadVoice: council.lead,
        leadMaster: guruSelection.guruName,
        guruSelection,
        rotationDecision,
        vLevel,
        stageDetection,
        practiceRecommendation,
        routingDecision,
        derivedState: derivedStateLabel,
        adaptiveDecision,
        arcDirective,
        themeDirective,
        deterministicPlan,
        memoryBlock: memBlock,
        signals,
        hardwareSignals,
        noveltyReport,
        whyForYouCount: plan.steps.filter(s => s.whyForYou).length,
        elapsedMs: Date.now() - t0,
      };

    } catch (error) {
      console.error(`[ConsciousnessOrchestrator] ${requestId} failed:`, error);
      return this.getFallbackSession(userId, runtime, Date.now() - t0);
    }
  }

  // ============================================================
  // Private Methods — Read Layer
  // ============================================================

  private async getUserContextWithTimeout(
    userId: string,
    runtime: OrchestrationRuntime
  ): Promise<UserContext> {
    const hour = runtime.hour ?? new Date().getHours();
    const gate: Gate = runtime.gate ?? this.gateForHour(hour);
    const timeBudgetMin = Number(runtime.timeBudgetMin ?? 8);

    return getUserContext(userId, {
      timeBudgetMin,
      energy: runtime.energy,
      hour,
      gate,
      mood: runtime.mood,
    });
  }

  private async getMemoryBlock(userId: string, runtime: OrchestrationRuntime): Promise<string> {
    try {
      return await buildLongTermMemoryBlock({
        userId,
        queryText: runtime.intent || `gate=${runtime.gate ?? '?'} budget=${runtime.timeBudgetMin ?? 8}m`,
        activeLoops: [],
      });
    } catch {
      return '';
    }
  }

  private async fetchHardwareSignals(userId: string): Promise<HardwareSignals> {
    const [bio, voice, camera, env] = await Promise.all([
      this.getBioSignals(userId),
      this.getVoicePatterns(userId),
      this.getMicroExpressions(userId),
      this.getEnvironmentScan(userId),
    ]);
    return { bioSignals: bio, voicePatterns: voice, microExpressions: camera, environmentScan: env };
  }

  private getEmptyHardwareSignals(): HardwareSignals {
    return {
      bioSignals: null,
      voicePatterns: null,
      microExpressions: null,
      environmentScan: null,
    };
  }

  /**
   * Tables/columns that this deployment has not migrated yet. Remembering the
   * miss avoids re-requesting a table on every session start (each failed
   * request shows up as a failed network call in the browser console).
   */
  private unavailableSignals = new Set<string>();

  private isMissingRelation(error: { code?: string } | null): boolean {
    const code = String(error?.code ?? "");
    return code === "PGRST205" || code === "42P01" || code === "42703";
  }

  private async getBioSignals(userId: string): Promise<BioSignalData | null> {
    if (this.unavailableSignals.has("bio_signals")) return null;
    try {
      const { data, error } = await this.adminClient
        .from('bio_signals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        if (this.isMissingRelation(error)) this.unavailableSignals.add("bio_signals");
        return null;
      }
      const row: any = data;
      return row ? {
        hrv: row.hrv,
        eda: row.eda,
        skinTemp: row.skin_temp,
        accelerometer: row.accelerometer,
        spo2: row.spo2,
        lastUpdated: row.created_at,
      } : null;;
    } catch { return null; }
  }

  private async getVoicePatterns(userId: string): Promise<VoicePatternData | null> {
    if (this.unavailableSignals.has("voice_patterns")) return null;
    try {
      const { data, error } = await this.adminClient
        .from('voice_patterns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        if (this.isMissingRelation(error)) this.unavailableSignals.add("voice_patterns");
        return null;
      }
      return data || null;
    } catch { return null; }
  }

  private async getMicroExpressions(userId: string): Promise<MicroExpressionData | null> {
    if (this.unavailableSignals.has("micro_expressions")) return null;
    try {
      const { data, error } = await this.adminClient
        .from('micro_expressions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        if (this.isMissingRelation(error)) this.unavailableSignals.add("micro_expressions");
        return null;
      }
      return data || null;
    } catch { return null; }
  }

  private async getEnvironmentScan(userId: string): Promise<EnvironmentScanData | null> {
    if (this.unavailableSignals.has("environment_scans")) return null;
    try {
      const { data, error } = await this.adminClient
        .from('environment_scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        if (this.isMissingRelation(error)) this.unavailableSignals.add("environment_scans");
        return null;
      }
      return data || null;
    } catch { return null; }
  }

  private masterName(guruId: string): string {
    const known = masterProfile(guruId);
    if (known) return known.name;
    const names: Record<string, string> = {
      krishna: 'Krishna',
      buddha: 'Buddha',
      ramana: 'Ramana Maharshi',
      patanjali: 'Patanjali',
      rumi: 'Rumi',
      lao_tzu: 'Lao Tzu',
      shiva: 'Adiyogi / Shiva',
      nisargadatta: 'Nisargadatta',
      shankaracharya: 'Shankaracharya',
    };
    return names[guruId] ?? guruId.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private async getPreviousSpine(userId: string) {
    const { data } = await this.adminClient
      .from('session_spine')
      .select('id, archetype, lead_master, primary_loop_id, primary_dimension, chakra_focus, final_user_sentence, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data as any;
  }

  private async getUnconsumedWhisper(userId: string) {
    const { data } = await this.adminClient
      .from('future_self_whispers')
      .select('id, whisper, tone, created_at')
      .eq('user_id', userId)
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data as any;
  }

  private async getCurrentTheme(userId: string) {
    if (this.unavailableSignals.has("daily_themes")) return null;
    const { data, error } = await this.adminClient
      .from('daily_themes')
      .select('*')
      .eq('user_id', userId)
      .order('theme_date', { ascending: false })
      .order('sequence_no', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      if (this.isMissingRelation(error)) this.unavailableSignals.add("daily_themes");
      return null;
    }
    return data as any;
  }

  private async getActiveArc(userId: string) {
    const { data } = await this.adminClient
      .from('theme_arcs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data as any;
  }

  private async getRecentThemes(userId: string) {
    if (this.unavailableSignals.has("daily_themes")) return [];
    const { data, error } = await this.adminClient
      .from('daily_themes')
      .select('*')
      .eq('user_id', userId)
      .order('theme_date', { ascending: false })
      .limit(30);
    if (error) {
      if (this.isMissingRelation(error)) this.unavailableSignals.add("daily_themes");
      return [];
    }
    return (data || []) as any[];
  }

  private async getRecentChapters(userId: string) {
    const { data } = await this.adminClient
      .from('arc_chapters')
      .select('day_number, phase, marker, user_reflection, quality_score, chapter_summary')
      .eq('user_id', userId)
      .order('day_number', { ascending: false })
      .limit(7);
    return (data || []) as any[];
  }

  private async getTaskCompletionRate(userId: string): Promise<number> {
    const { data } = await this.adminClient
      .from('daily_tasks')
      .select('status')
      .eq('user_id', userId)
      .gte('task_date', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
    const rows = (data ?? []) as any[];
    if (!rows.length) return 0;
    const completed = rows.filter((d: any) => d.status === 'completed').length;
    return completed / rows.length;
  }

  private async getAdaptiveHistory(userId: string) {
    const { data } = await this.adminClient
      .from('session_spine')
      .select('archetype, lead_master, quality_score, created_at')
      .eq('user_id', userId)
      .not('quality_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30);
    return (data || []) as any[];
  }

  // ============================================================
  // Signal Building
  // ============================================================

  /**
   * Real per-dimension scores for the practice engine.
   *
   * The old call site fabricated `spirit/action/connection: 0`, which made
   * `findWeakestDimension` return `spirit` on every sitting and target a
   * dimension the user was never measured on. Only measured dimensions are
   * passed; missing ones stay absent rather than becoming zeros.
   */
  private resolveDimensionScores(
    userCtx: UserContext,
    signals: ConsciousnessSignals,
  ): Partial<Record<DimensionId, number>> {
    const out: Partial<Record<DimensionId, number>> = {};
    for (const [key, value] of Object.entries(userCtx.dimensionScores ?? {})) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) out[key as DimensionId] = n;
    }
    if (Object.keys(out).length > 0) return out;

    // Fallback: today's rollup, which only carries the four V-Level dimensions.
    const dims = signals.dimensions;
    if (dims) {
      out.thought = dims.thought;
      out.emotion = dims.emotion;
      out.body = dims.body;
      out.spirit = dims.awareness;
    }
    return out;
  }

  private buildSignals(userCtx: UserContext, hardware: HardwareSignals): ConsciousnessSignals {
    const gate = userCtx.now.gate;
    const energy = userCtx.now.energy;
    const timeBudgetMin = userCtx.now.timeBudgetMin;
    const gapDays = userCtx.behavior.gapDays;

    // Hardware signal integration
    let hardwareBoost = 0;
    const hrv = hardware.bioSignals?.hrv;
    if (typeof hrv === "number" && hrv < 30) {
      hardwareBoost += 0.1;
    }
    const voicePitch = hardware.voicePatterns?.prosody?.pitch;
    if (typeof voicePitch === "number" && voicePitch > 1.2) {
      hardwareBoost += 0.05;
    }
    if (hardware.microExpressions?.stateClassification === 'kshipta') {
      hardwareBoost += 0.1;
    }

    return {
      vLevel: userCtx.spiritual.vLevelCurrent + hardwareBoost,
      journeyDay: userCtx.spiritual.journeyDay,
      chittaVritti: userCtx.spiritual.chittaVritti,
      dimensions: userCtx.dimensionsToday,
      dimensionBands: userCtx.spiritual.dimensionBands,
      activeLoops: userCtx.recentLoopIds.slice(0, 5),
      paths: userCtx.spiritual.yogaPathAffinity,
      witness: {
        stability: userCtx.spiritual.witnessStability,
        depth: userCtx.spiritual.witnessDepth,
        gap: userCtx.spiritual.witnessGap,
      },
      gate,
      energy,
      timeBudgetMin,
      gapDays,
      starvedDimension: null,
      chakraFocus: 'heart',
      practiceLevels: Object.fromEntries(
        Object.entries(userCtx.practiceLevels).map(([k, v]) => [k, v.level])
      ),
      namedLoops: [],
      practiceMatrix: null,
      chakraSignal: null,
    };
  }

  private findStarvedDimension(dimensions: ConsciousnessSignals['dimensions']): string | null {
    if (!dimensions) return null;
    const entries = Object.entries(dimensions).filter(([k]) => k !== 'total');
    if (!entries.length) return null;
    entries.sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0));
    return entries[0]?.[0] ?? null;
  }

  private detectChakra(starvedDim: string | null, activeLoops: string[], hardware: HardwareSignals): { primary: { id: string } } {
    const chakraMap: Record<string, string> = {
      thought: 'crown',
      emotion: 'heart',
      body: 'root',
      awareness: 'third_eye',
    };
    return { primary: { id: starvedDim ? chakraMap[starvedDim] || 'heart' : 'heart' } };
  }

  private compactPracticeLevels(practiceLevels: UserContext['practiceLevels']): Record<string, number> {
    return Object.fromEntries(
      Object.entries(practiceLevels).map(([k, v]) => [k, v.level])
    );
  }

  private resolveNamedLoops(loopIds: string[]): Array<{ id: string; name: string }> {
    const loopNames: Record<string, string> = {
      'VAL001': 'People-Pleasing',
      'CTL001': 'Perfectionism',
      'AVD001': 'Procrastination',
      'SRV001': 'Fight/Flight',
      'MEN001': 'Overthinking',
    };
    return loopIds.map(id => ({ id, name: loopNames[id] || id }));
  }

  private buildLoopSeverity(activeLoops: UserContext['activeLoops']): Record<string, 'none' | 'active' | 'acute'> {
    const severity: Record<string, 'none' | 'active' | 'acute'> = {};
    for (const loop of activeLoops) {
      severity[loop.loopId] = loop.severity >= 4 ? 'acute' : 'active';
    }
    return severity;
  }

  // ============================================================
  // Council Layer (enhanced with all directives)
  // ============================================================

  private async runCouncil(
    signals: ConsciousnessSignals,
    starvedDim: string | null,
    memBlock: string,
    state: UserStateVector,
    routingDecision: RoutingDecision,
    vLevel: VLevelResult,
    stageDetection: StageDetection,
    hardware: HardwareSignals,
    userCtx: UserContext,
    theme: any,
    adaptiveDecision: AdaptiveDecision,
    arcDirective: ArcDirective | null,
    themeDirective: ThemeDirective | null,
    deterministicPlan: any,
  ): Promise<{
    head: string;
    heart: string;
    gut: string;
    lead: 'head' | 'heart' | 'gut';
    archetype: string;
    reason: string;
  }> {
    const sharedSignalsBlock = [
      `SIGNALS: ${JSON.stringify(signals)}`,
      `STARVED DIMENSION: ${starvedDim ?? '(none)'}`,
      `STAGE: ${stageDetection.stage} (${stageDetection.confidence.toFixed(2)})`,
      `DERIVED STATE: ${state.emotionalTone}, ${state.intent}, ${state.awarenessDepth}`,
      `ROUTING: ${routingDecision.agents[0]} (${routingDecision.mode})`,
      `V-LEVEL: ${vLevel.value} (Band ${vLevel.band}, ${vLevel.microLevel})`,
      `ADAPTIVE: ${adaptiveDecision.entryContextType} | ${adaptiveDecision.agents.join(', ')} | ${adaptiveDecision.insightDepth}`,
      `ARC: ${arcDirective ? `${arcDirective.phaseLabel} Day ${arcDirective.effectiveDay}/${arcDirective.totalDays} (${arcDirective.voiceMode})` : 'none'}`,
      `THEME: ${themeDirective ? `${themeDirective.action.toUpperCase()} (${themeDirective.lengthDays}d)` : 'none'}`,
      `DETERMINISTIC: ${deterministicPlan.archetypeId} (${deterministicPlan.slots.length} slots)`,
      `MEMORY:${memBlock || '(none)'}`,
      `HARDWARE: ${JSON.stringify({ hrv: hardware.bioSignals?.hrv, voicePitch: hardware.voicePatterns?.prosody?.pitch, faceState: hardware.microExpressions?.stateClassification })}`,
      `USER INTENT: ${theme?.title || '(open)'}`,
    ].join('\n');

    async function voiceCall(voice: 'head' | 'heart' | 'gut'): Promise<string> {
      const lin = VOICE_LINEAGE[voice];
      const sys = [
        `You are the ${voice.toUpperCase()} voice of an inner council for one user, right now.`,
        `Path: ${lin.path}. Lineage: ${lin.masters.join(', ')}.`,
        voice === 'head' ? 'Cut through seeking. Name the thought-pattern. Be precise, dry, brief.' :
        voice === 'heart' ? 'Name the wound or longing. Be tender.' :
        'Name what the body/action wants. Stay concrete and grounded.',
        'Reply in ONE sentence, ≤24 words, second person. No greeting. No advice list.',
      ].join('\n');

      // In production, this would call aiGatewayFetch
      return `Mock ${voice} voice response for ${signals.gate} gate`;
    }

    const [headSay, heartSay, gutSay] = await Promise.all([
      voiceCall('head'),
      voiceCall('heart'),
      voiceCall('gut'),
    ]);

    // Synthesizer uses adaptive decision + arc + theme directives
    const archetype = deterministicPlan.archetypeId; // Use deterministic archetype as base

    return {
      head: headSay,
      heart: heartSay,
      gut: gutSay,
      lead: this.selectLeadVoice(signals, stageDetection),
      archetype,
      reason: `Selected ${archetype} for ${signals.gate} gate, ${signals.energy} energy, V-Level ${signals.vLevel}. Adaptive: ${adaptiveDecision.entryContextType}. Arc: ${arcDirective?.phaseLabel || 'none'}. Theme: ${themeDirective?.action || 'none'}.`,
    };
  }

  private selectLeadVoice(signals: ConsciousnessSignals, stage: StageDetection): 'head' | 'heart' | 'gut' {
    const { activeLoops, paths } = signals;
    if (activeLoops.some(l => l.includes('VAL') || l.includes('CTL'))) return 'head';
    if (activeLoops.some(l => l.includes('REL') || l.includes('ATT') || l.includes('SHD'))) return 'heart';
    if (paths.karma > paths.jnana && paths.karma > paths.bhakti) return 'gut';
    return 'heart';
  }

  // ============================================================
  // AI Composer (enhances deterministic base)
  // ============================================================

  private async composeSession(
    council: any,
    signals: ConsciousnessSignals,
    starvedDim: string | null,
    namedLoops: Array<{ id: string; name: string }>,
    practiceRecommendation: PracticeRecommendation,
    memBlock: string,
    prevSpine: any,
    whisper: any,
    theme: any,
    runtime: OrchestrationRuntime,
    vLevel: VLevelResult,
    stageDetection: StageDetection,
    state: UserStateVector,
    routingDecision: RoutingDecision,
    guruSelection: GuruSelectionWithLocalName,
    rotationDecision: RotationDecision,
    hardware: HardwareSignals,
    adaptiveDecision: AdaptiveDecision,
    arcDirective: ArcDirective | null,
    themeDirective: ThemeDirective | null,
    deterministicPlan: any,
  ): Promise<SessionPlan> {
    const stepBudget = Math.max(
      this.config.minSteps,
      Math.min(this.config.maxSteps, Math.round(signals.timeBudgetMin / 3))
    );

    // This tier is deliberately deterministic: the edge composer owns AI. The
    // old prompt assembly here was never sent anywhere — it only made the
    // fallback look intelligent while shipping ingredient labels.
    const plan = this.convertDeterministicToSessionPlan(deterministicPlan, council, signals, stepBudget);

    return plan;
  }

  private convertDeterministicToSessionPlan(
    detPlan: any,
    council: any,
    signals: ConsciousnessSignals,
    stepBudget: number
  ): SessionPlan {
    const primaryLoopId = signals.activeLoops[0] || null;
    const primaryLoopName = primaryLoopId
      ? this.resolveNamedLoops([primaryLoopId])[0]?.name || primaryLoopId
      : 'current state';
    const anchor = (signals as { practiceMatrix?: { microAnchor?: { practice: string; nextLevel: number; hint: string } | null } })
      .practiceMatrix?.microAnchor ?? null;

    const paramsFor = (kind: string, ing: any, seconds: number): Record<string, unknown> => {
      const base = ing.body || ing.summary || '';
      switch (kind) {
        case 'breathwork':
          return { pattern: (ing.params?.pattern as string) || 'natural', durationSeconds: seconds };
        case 'witness':
          return { durationSeconds: seconds, object: ing.object || 'thoughts' };
        case 'practice': {
          // The family and the instruction belong to THIS ingredient. Reusing
          // the anchor's exercise for every practice slot collapsed a sitting
          // into the same exercise repeated two or three times.
          const family = String(ing.practice || anchor?.practice || 'observation');
          const level = Number((signals.practiceLevels as Record<string, number> | undefined)?.[family])
            || Number(anchor?.nextLevel)
            || 1;
          return {
            family,
            level,
            exercise: base || anchor?.hint || ing.label,
            durationSeconds: seconds,
          };
        }
        case 'journal':
          return { questions: [base || ing.label], minChars: 40 };
        case 'reflection':
          return { maxChars: 280 };
        case 'micro-act':
          return { act: base || ing.label, window: 'today' };
        case 'wisdom-read':
          return { passage: base || 'Read slowly. Stop at the line that catches you.', source: '' };
        case 'guide-chat':
          return { openingQuestion: base || 'What is true right now?', maxTurns: 3 };
        case 'temple-chat':
          return { masterId: council.lead, question: base || 'What am I avoiding?' };
        default:
          return {};
      }
    };

    // A step's "why" has to name the ingredient that was actually picked, not
    // one template sentence shared by every step in the sitting.
    const whyFor = (ing: any, slot: any): string => {
      const reasons = String(slot?.reason || '')
        .split(',')
        .map((r: string) => r.trim())
        .filter(Boolean)
        .slice(0, 2);
      const fallback = primaryLoopName !== 'current state'
        ? `${primaryLoopName} is active`
        : `the ${signals.gate} gate needs it`;
      return `${ing.label} — chosen for you because ${reasons.length ? reasons.join(' + ') : fallback}.`;
    };

    const signalRefFor = (kind: string, ing: any): string => {
      if (kind === 'practice') {
        const family = String(ing.practice || anchor?.practice || 'observation');
        const level = Number((signals.practiceLevels as Record<string, number> | undefined)?.[family])
          || Number(anchor?.nextLevel)
          || 1;
        return `practice:${family}:L${level}`;
      }
      if (ing.loopTargets?.[0]) return `loop:${ing.loopTargets[0]}`;
      const weakDim = signals.starvedDimension;
      if (weakDim && Array.isArray(ing.dimensions) && ing.dimensions.includes(weakDim)) {
        return `dim:${weakDim}`;
      }
      if (kind === 'reflection' || kind === 'journal' || kind === 'micro-act') return 'closure';
      return `gate:${signals.gate}`;
    };

    const steps = detPlan.slots.map((slot: any, index: number) => {
      const ing = slot.ingredient;
      const kind = String(ing.stepKind || (ing.kind === 'practice' ? 'practice' : ing.kind));
      const minutes = Math.max(1, Math.round(Number(slot.minutes) || 3));
      const seconds = Math.max(60, minutes * 60);
      const base = ing.body || ing.summary || '';
      const script = buildStepScript({
        kind,
        label: ing.label,
        body: base,
        minutes,
        loopName: primaryLoopName,
        gate: signals.gate,
        level: anchor?.nextLevel ?? 1,
        variantSeed: `${detPlan.archetypeId}:${signals.gate}:${index}:${ing.id}`,
      });

      return {
        kind,
        title: ing.label,
        script,
        prompt: base || `Practice ${ing.label}`,
        est_minutes: minutes,
        durationSeconds: seconds,
        whyForYou: whyFor(ing, slot),
        signalRef: signalRefFor(kind, ing),
        params: {
          ...paramsFor(kind, ing, seconds),
          // Provenance for the learning loop: outcome rows are keyed by these.
          ingredientId: ing.id,
          slotRole: slot.role,
          archetypeId: detPlan.archetypeId,
          plannedMinutes: minutes,
        },
      };
    }).slice(0, stepBudget);

    // Chakra opening: when a primary chakra is detected, its opening practice
    // becomes the first beat of the sitting instead of sitting unused in the
    // prompt. Two minutes are taken from the last step so the budget holds.
    let finalSteps = steps;
    const chakraPrimary = (signals.chakraSignal as
      | { primary?: { id?: string; name?: string; openingPractice?: string } }
      | null)?.primary;

    if (chakraPrimary?.openingPractice && steps.length > 0) {
      const openingMinutes = Math.min(2, Math.max(1, Math.floor(signals.timeBudgetMin / 4)));
      const last = steps[steps.length - 1];
      if ((last.est_minutes ?? 0) - openingMinutes >= 1) {
        last.est_minutes = (last.est_minutes ?? 0) - openingMinutes;
        last.durationSeconds = Math.max(60, last.est_minutes * 60);
        if (last.params && typeof last.params === 'object') {
          last.params = { ...last.params, durationSeconds: last.durationSeconds };
        }
        const chakraName = chakraPrimary.name ?? 'Chakra';
        const opening = {
          kind: 'breathwork',
          title: `${chakraName} opening`,
          script: buildStepScript({
            kind: 'breathwork',
            label: `${chakraName} opening`,
            body: chakraPrimary.openingPractice,
            minutes: openingMinutes,
            openingPractice: chakraPrimary.openingPractice,
            gate: signals.gate,
            variantSeed: `chakra:${chakraPrimary.id ?? 'unknown'}`,
          }),
          prompt: chakraPrimary.openingPractice,
          est_minutes: openingMinutes,
          durationSeconds: openingMinutes * 60,
          whyForYou: `Your ${chakraName} chakra is the current gate — this opens it before anything else is asked.`,
          signalRef: `chakra:${chakraPrimary.id ?? 'unknown'}`,
          params: {
            durationSeconds: openingMinutes * 60,
            pattern: 'natural',
            openingChakra: chakraPrimary.id ?? null,
          },
        };
        finalSteps = [opening, ...steps];
      }
    }

    const introBits = [
      `A ${detPlan.archetypeLabel} sitting for the ${signals.gate} gate.`,
      primaryLoopName !== 'current state' ? `Your "${primaryLoopName}" loop is the live thread.` : null,
      signals.starvedDimension ? `It works the ${signals.starvedDimension} band.` : null,
    ].filter(Boolean);

    return {
      id: crypto.randomUUID(),
      intent: `${detPlan.archetypeId} session`,
      intro: introBits.join(' '),
      steps: finalSteps,
    };
  }

  // ============================================================
  // Novelty Filter
  // ============================================================

  private async runNoveltyFilter(
    userId: string,
    plan: SessionPlan,
    council: any,
    starvedDim: string | null,
    namedLoops: Array<{ id: string; name: string }>,
  ): Promise<NoveltyReport[]> {
    const noveltyReport: NoveltyReport[] = [];
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      const text = `${step.title}\n${(step.script ?? []).join("\n") || step.prompt || ""}`;
      try {
        const emb = await embedText(text);
        if (!emb) {
          noveltyReport.push({ index: i, maxSim: 0, flagged: false, repaired: false });
          continue;
        }
        const { data } = await (this.adminClient.rpc as any)("match_user_memories", {
          p_user_id: userId,
          p_query_embedding: emb as any,
          p_match_count: 8,
          p_min_days_ago: 0,
        });
        const stepMatches = (data ?? []).filter((m: any) => m.source_type === "session_step");
        const top = stepMatches[0];
        const maxSim = Number(top?.similarity ?? 0);
        const flagged = maxSim > 0.85;
        let repaired = false;

        // Deterministic repair: re-compose the step's fixed lines from a new
        // variant seed and give this sitting a different entry point, instead
        // of reporting the duplicate and shipping it unchanged.
        if (flagged) {
          const minutes = Math.max(1, Math.round(Number(step.est_minutes) || 3));
          step.script = buildStepScript({
            kind: step.kind,
            label: step.title,
            body: `${step.prompt || step.title} This time begin from the body, not from the story.`,
            minutes,
            loopName: namedLoops[0]?.name ?? null,
            variantSeed: `${plan.id}:${i}:repair`,
          });
          repaired = true;
        }
        noveltyReport.push({
          index: i,
          maxSim,
          matched: top?.content?.slice(0, 80),
          flagged,
          repaired,
        });
      } catch {
        noveltyReport.push({ index: i, maxSim: 0, flagged: false, repaired: false });
      }
    }
    return noveltyReport;
  }

  // ============================================================
  // Persistence
  // ============================================================

  private async persistSessionSpine(
    userId: string,
    plan: SessionPlan,
    council: any,
    signals: ConsciousnessSignals,
    starvedDim: string | null,
    chakra: { primary: { id: string } },
    vLevel: VLevelResult,
    guruSelection: GuruSelectionWithLocalName,
    rotationDecision: RotationDecision,
    noveltyReport: NoveltyReport[],
  ): Promise<string> {
    const whyForYouArr = plan.steps.map((s, i) => ({
      stepIndex: i, kind: s.kind, why: s.whyForYou, signalRef: s.signalRef,
    }));
    const graphEdges = [
      ...signals.activeLoops.map(id => ({ type: 'loop', id, name: this.resolveNamedLoops([id])[0]?.name || id })),
      starvedDim ? { type: 'dimension', id: starvedDim } : null,
      { type: 'chakra', id: chakra.primary.id },
      { type: 'master', id: guruSelection.guruId },
    ].filter(Boolean);

    const spineId = crypto.randomUUID();

    const { data, error } = await (this.supabase.from('session_spine') as any).insert({
      // The client persists `sessions` with this same id, so completion can
      // find the spine by session_id. Without it, quality scoring never ran
      // and the learning loop stayed empty forever.
      id: spineId,
      session_id: spineId,
      user_id: userId,
      archetype: council.archetype,
      archetype_reason: council.reason,
      lead_master: guruSelection.guruName,
      council_voices: { head: council.head, heart: council.heart, gut: council.gut },
      primary_loop_id: signals.activeLoops[0] ?? null,
      secondary_loop_ids: signals.activeLoops.slice(1, 5),
      primary_dimension: starvedDim,
      chakra_focus: chakra.primary.id,
      quality_score: null,
      final_user_sentence: null,
      why_for_you: whyForYouArr,
      graph_edges: graphEdges,
      composed_signals: signals,
      ai_mode: this.config.aiMode,
    }).select('id').single();

    if (error) {
      // Spine persistence is server-owned. Losing it must not collapse the
      // whole composition into the static fallback session.
      console.warn('[orchestrator] session_spine persist skipped:', error.message);
      return spineId;
    }
    return data?.id ?? spineId;
  }

  private async generateNextWhisper(
    userId: string,
    spineId: string,
    plan: SessionPlan,
    council: any,
    signals: ConsciousnessSignals,
    starvedDim: string | null,
    chakra: { primary: { id: string } },
  ): Promise<string | null> {
    return null;
  }

  private async evolveTheme(
    themeId: string,
    spineId: string,
    archetype: string,
    leadMaster: string,
    primaryLoopId: string | null,
    primaryDimension: string | null,
  ): Promise<void> {
    // Fire-and-forget
  }

  private async markWhisperConsumed(whisperId: string): Promise<void> {
    await (this.adminClient.from('future_self_whispers') as any)
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', whisperId);
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  private extractSessionsAtLevel(practiceLevels: UserContext['practiceLevels']): Partial<Record<string, number>> {
    return Object.fromEntries(
      Object.entries(practiceLevels).map(([k, v]) => [k, v.sessionsAtLevel])
    );
  }

  private extractQualityHistory(practiceLevels: UserContext['practiceLevels']): Partial<Record<string, number[]>> {
    return {};
  }

  private extractPlateaus(practiceLevels: UserContext['practiceLevels']): string[] {
    return [];
  }

  private getAnchorPath(yogaPathAffinity: Record<string, number>): 'bhakti' | 'karma' | 'jnana' | 'raja' {
    let max = 0;
    let anchor: 'bhakti' | 'karma' | 'jnana' | 'raja' = 'bhakti';
    for (const [path, score] of Object.entries(yogaPathAffinity)) {
      if (score > max && ['bhakti', 'karma', 'jnana', 'raja'].includes(path)) {
        max = score;
        anchor = path as any;
      }
    }
    return anchor;
  }

  private getGrowthPath(yogaPathAffinity: Record<string, number>): 'bhakti' | 'karma' | 'jnana' | 'raja' {
    let min = Infinity;
    let growth: 'bhakti' | 'karma' | 'jnana' | 'raja' = 'karma';
    for (const [path, score] of Object.entries(yogaPathAffinity)) {
      if (score < min && ['bhakti', 'karma', 'jnana', 'raja'].includes(path)) {
        min = score;
        growth = path as any;
      }
    }
    return growth;
  }

  private findWeakestCore(practiceLevels: Record<string, number>): string | null {
    const corePractices = ['observation', 'breath', 'body', 'witness'];
    let weakest: string | null = null;
    let minLevel = Infinity;
    for (const p of corePractices) {
      const level = practiceLevels[p] ?? 0;
      if (level < minLevel) {
        minLevel = level;
        weakest = p;
      }
    }
    return weakest;
  }

  private getCircadianType(wakeTime: string | null): string {
    if (!wakeTime) return 'flexible';
    const hour = parseInt(wakeTime.split(':')[0]);
    if (hour <= 6) return 'morning_person';
    if (hour >= 9) return 'evening_person';
    return 'flexible';
  }

  private mapLoopToPractice(loopId: string): string {
    const loopToPractice: Record<string, string> = {
      'VAL': 'bhakti', 'CTL': 'raja', 'AVD': 'witness',
      'SRV': 'breath', 'MEN': 'jnana', 'EMO': 'bhakti',
      'BOD': 'body', 'ENR': 'breath',
    };
    const prefix = loopId.slice(0, 3);
    return loopToPractice[prefix] || 'observation';
  }

  private getLifeDomainStress(userId: string): Array<{ domain: string; practiceId: string }> {
    return [];
  }

  private getDaysSinceRotation(userId: string): number { return 21; }

  private getLifetimePhase(journeyDay: number): number {
    if (journeyDay < 21) return 1;
    if (journeyDay < 90) return 2;
    if (journeyDay < 180) return 3;
    if (journeyDay < 365) return 4;
    if (journeyDay < 730) return 5;
    if (journeyDay < 1095) return 6;
    return 7;
  }

  private getLoopSeverity(loop: UserContext['activeLoops'][0]): number {
    return loop?.severity || 0;
  }

  private isProgressStalled(userCtx: UserContext): boolean {
    return userCtx.behavior.avgQualityLast7d < 0.5 && userCtx.behavior.sessionsLast7d > 5;
  }

  private async getRotationHistory(userId: string): Promise<Array<{ guruId: string; startedAt: string; reason: string }>> {
    return [];
  }

  private gateForHour(h: number): Gate {
    if (h < 5) return 'night';
    if (h < 12) return 'morning';
    if (h < 17) return 'midday';
    if (h < 21) return 'evening';
    return 'night';
  }

  // ============================================================
  // Fallback
  // ============================================================

  /**
   * Acute crisis: a sitting is the wrong response. One short "reach a human"
   * step, no deepening, no inquiry, archetype locked to the holding one.
   */
  private getCrisisSession(runtime: OrchestrationRuntime, elapsedMs: number): OrchestratedSession {
    const base = this.getFallbackSession('crisis', runtime, elapsedMs);
    base.archetype = 'Dark Night Hold';
    base.plan.intent = 'Stay safe right now';
    base.plan.intro =
      'We are not practising right now. What you said needs a person, not a session.';
    base.plan.steps = [
      {
        kind: 'reflection',
        title: 'Reach a human now',
        est_minutes: 2,
        whyForYou: 'You named something no practice should try to hold.',
        signalRef: 'gate:crisis',
      },
    ];
    return base;
  }

  private getFallbackSession(
    userId: string,
    runtime: OrchestrationRuntime,
    elapsedMs: number
  ): OrchestratedSession {
    const gate = runtime.gate ?? this.gateForHour(new Date().getHours());
    const id = crypto.randomUUID();
    return {
      sessionId: id,
      plan: {
        id,
        intent: `Fallback ${gate} session`,
        intro: 'Engine is calibrating — gentle default session.',
        steps: [
          { kind: 'breathwork', title: 'Settle the breath', est_minutes: 3, whyForYou: 'Your body needs a runway before depth.', signalRef: 'gate:' + gate },
          { kind: 'witness', title: 'Notice what arises', est_minutes: 4, whyForYou: 'Witness is the safest entry.', signalRef: 'dimension:awareness' },
          { kind: 'reflection', title: 'One sentence of truth', est_minutes: 2, whyForYou: 'Close the loop by naming it.', signalRef: 'closure' },
        ],
      },
      archetype: 'Settling',
      leadVoice: 'gut',
      leadMaster: 'Adiyogi/Shiva',
      guruSelection: { guruId: 'shiva', guruName: 'Adiyogi/Shiva', score: 0, reason: 'fallback' },
      rotationDecision: { shouldRotate: false, reason: 'fallback', newGuruId: null, durationDays: 0 },
      vLevel: { value: 0, band: 0, microLevel: 'entering', dimensionScores: { thought: 0, emotion: 0, body: 0, awareness: 0, action: 0, connection: 0, spirit: 0 }, calculatedAt: new Date().toISOString() },
      stageDetection: { stage: 'sleeping', confidence: 0, scores: {} },
      practiceRecommendation: { practiceId: 'observation', level: 1, score: 0, reason: 'fallback', durationMinutes: 5, isCrossPollination: false, layer: 'core' },
      routingDecision: { primaryAgent: 'grounding', conversationMode: 'gentle', responseIntensity: 'low', reasoning: 'fallback' },
      derivedState: { emotionalTone: 'neutral', userIntent: 'presence', awarenessDepth: 'surface', chittaVritti: 'mudha', teachabilityScore: 0.5 },
      adaptiveDecision: { state: { emotionalTone: 'neutral', intent: 'explore', awarenessLevel: 0, resistanceLevel: 0, energyLevel: 0, cognitiveLoad: 0, fragility: 0, trustInSystem: 0, clarity: 0 }, entryContextType: 'fresh_entry', gate: 'morning', stage: 0, edgeCases: [], agents: ['companion'], insightDepth: 'micro', revealLevel: 1, silenceMode: false, directive: '' },
      arcDirective: null,
      themeDirective: null,
      deterministicPlan: null,
      memoryBlock: '',
      signals: { vLevel: 0, journeyDay: 1, chittaVritti: 'mudha', dimensions: { thought: 0, emotion: 0, body: 0, awareness: 0 }, dimensionBands: { thought: 0, emotion: 0, body: 0, awareness: 0 }, activeLoops: [], paths: {}, witness: { stability: 0, depth: 0, gap: 0 }, gate, energy: runtime.energy ?? 'medium', timeBudgetMin: runtime.timeBudgetMin ?? 8, gapDays: 0, starvedDimension: 'awareness', chakraFocus: 'heart', practiceLevels: {}, namedLoops: [], practiceMatrix: null, chakraSignal: null },
      hardwareSignals: this.getEmptyHardwareSignals(),
      noveltyReport: [],
      whyForYouCount: 0,
      elapsedMs,
    } as unknown as OrchestratedSession;
  }
}

// ============================================================
// Factory Function
// ============================================================

let orchestratorInstance: ConsciousnessOrchestrator | null = null;

export function getConsciousnessOrchestrator(): ConsciousnessOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new ConsciousnessOrchestrator({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      serviceRoleKey: '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      aiMode: 'fast',
      enableNoveltyFilter: true,
      enableHardwareSignals: true,
      enableMemoryInjection: true,
      maxSteps: 7,
      minSteps: 3,
      timeoutMs: 30000,
    });
  }
  return orchestratorInstance;
}

export async function orchestrateSession(
  userId: string,
  runtime: OrchestrationRuntime = {}
): Promise<OrchestratedSession> {
  return getConsciousnessOrchestrator().orchestrateSession(userId, runtime);
}