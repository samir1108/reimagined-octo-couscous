/**
 * CinematicJourney page
 * ─────────────────────
 * Full-screen immersive 30-60 min question experience.
 * Mounted at /app/cinematic-journey
 *
 * Phases:
 *  1. framing  — cinematic intro with countdown + atmospheric text
 *  2. questions — one question at a time, full-screen transitions
 *  3. processing — animated processing screen
 *  4. metricsReveal — animated reveal of computed metrics
 *  5. personalization — optional metric fine-tuning
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMachine } from "@xstate/react";
import { ArrowLeft, X } from "lucide-react";
import { journeyMachine, type JourneyContext, type ComputedMetrics } from "@/machines/journeyMachine";
import { JOURNEY_QUESTIONS, JOURNEY_QUESTION_COUNT } from "@/lib/journey/journeyQuestions";
import type { JourneyAnswer } from "./types";
import CinematicFraming from "./CinematicFraming";
import CinematicQuestion from "./CinematicQuestion";
import CinematicProcessing from "./CinematicProcessing";
import MetricsReveal from "./MetricsReveal";
import JourneyPersonalization from "./JourneyPersonalization";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

const LAYERS = [
  {
    id: "origin",
    title: "ORIGIN",
    subtitle: "Where awareness begins",
    gradient: "from-slate-900 via-indigo-950 to-slate-900",
    accent: "text-indigo-300",
  },
  {
    id: "depths",
    title: "DEPTHS",
    subtitle: "What the mind keeps hidden",
    gradient: "from-indigo-950 via-purple-950 to-slate-900",
    accent: "text-purple-300",
  },
  {
    id: "emergence",
    title: "EMERGENCE",
    subtitle: "What rises when patterns break",
    gradient: "from-purple-950 via-fuchsia-950 to-indigo-900",
    accent: "text-fuchsia-300",
  },
  {
    id: "luminous",
    title: "LUMINOUS",
    subtitle: "The one who is asking",
    gradient: "from-fuchsia-950 via-amber-950 to-indigo-900",
    accent: "text-amber-200",
  },
];

export default function CinematicJourney() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, send] = useMachine(journeyMachine);
  const { context } = state;
  const [metrics, setMetrics] = useState<ComputedMetrics | null>(null);
  const [processingDone, setProcessingDone] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<JourneyAnswer | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentQuestion = useMemo(() => {
    if (context.currentQuestionIndex >= JOURNEY_QUESTIONS.length) return null;
    return JOURNEY_QUESTIONS[context.currentQuestionIndex];
  }, [context.currentQuestionIndex]);

  const progress = useMemo(() => {
    if (context.currentQuestionIndex === 0 && !currentAnswer) return 0;
    return Math.min(100, (context.currentQuestionIndex / JOURNEY_QUESTION_COUNT) * 100);
  }, [context.currentQuestionIndex, currentAnswer]);

  const layer = useMemo(() => {
    const idx = context.cinematicLayer || 0;
    return LAYERS[Math.min(idx, LAYERS.length - 1)];
  }, [context.cinematicLayer]);

  // Persist answers to localStorage as we go (survives accidental refresh)
  useEffect(() => {
    if (context.answers.size === 0) return;
    try {
      const arr = Array.from(context.answers.values());
      localStorage.setItem("cinematic_journey_answers", JSON.stringify(arr));
    } catch {}
  }, [context.answers]);

  // Load saved answers on mount (refresh recovery)
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("cinematic_journey_answers");
        if (raw && context.answers.size === 0 && context.journeyStartedAt === null) {
          const saved = JSON.parse(raw) as JourneyAnswer[];
          if (saved.length > 0) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.id) {
              send({ type: "START", userId: user.id });
            }
          }
        }
      } catch {}
    })();
  }, []);

  const handleStart = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    send({ type: "START", userId: user.id });
  }, [send, navigate]);

  const handleAnswer = useCallback(
    (questionIndex: number, answer: JourneyAnswer) => {
      setCurrentAnswer(answer);
      send({ type: "ANSWER", questionIndex, answer });
    },
    [send],
  );

  const handleSkip = useCallback(
    (questionIndex: number) => {
      send({ type: "SKIP_QUESTION" });
    },
    [send],
  );

  // Transition: questions → processing when all questions answered
  useEffect(() => {
    if (state.matches("questions") && context.currentQuestionIndex >= JOURNEY_QUESTION_COUNT) {
      send({ type: "NEXT_QUESTION" });
    }
  }, [state.value, context.currentQuestionIndex, send]);

  // Transition: processing → metricsReveal
  useEffect(() => {
    if (state.matches("processing") && !processingDone) {
      // Process data client-side
      setTimeout(() => {
        const computed = (journeyMachine as any).resolveState(state).context;
        const m = computed.scoreAccumulator
          ? computeMetricsClient(computed)
          : fallbackMetrics();
        setMetrics(m);
        setProcessingDone(true);
        send({ type: "PROCESSING_COMPLETE", metrics: m });
      }, 2500);
    }
  }, [state.matches("processing"), processingDone, send, state]);

  const handlePersonalizationDone = useCallback(() => {
    send({ type: "PERSONALIZATION_CONFIRMED" });
    // Persist to Supabase and update the consciousness profile
    void persistJourneyToSupabase(context, metrics);
    // Refresh all cached data so the engine + analytics pick up new metrics
    void queryClient.invalidateQueries({ queryKey: ["consciousness-engine"] });
    void queryClient.invalidateQueries({ queryKey: ["analytics"] });
    void queryClient.invalidateQueries({ queryKey: ["settings-profile"] });
    // Navigate to Analytics with a journey-specific welcome banner
    setTimeout(() => navigate("/app/analytics?welcome=1&journey=1"), 1200);
  }, [send, context, metrics, navigate, queryClient]);

  const handleExit = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const confirmExit = useCallback(() => {
    send({ type: "ABORT" });
    navigate("/app");
  }, [send, navigate]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={`fixed inset-0 z-[100] min-h-[100dvh] bg-gradient-to-br ${layer.gradient} transition-all duration-[2000ms] overflow-y-auto`}
      style={{
        paddingTop: "calc(3.25rem + env(safe-area-inset-top))",
        paddingBottom: "calc(4.75rem + env(safe-area-inset-bottom))",
      }}
    >
      {/* Cinematic grain overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Exit button */}
      {!state.matches("idle") && !state.matches("framing") && (
        <button
          onClick={handleExit}
          className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/90 text-xs backdrop-blur-sm transition-all"
        >
          <X className="w-3 h-3" />
          Exit
        </button>
      )}

      {/* Layer label */}
      <div className="fixed top-4 left-4 z-40 flex items-center gap-2">
        <span className={`text-[10px] font-body tracking-[0.3em] uppercase ${layer.accent} opacity-70`}>
          {layer.title}
        </span>
        <span className="text-white/20 text-[10px]">—</span>
        <span className="text-white/40 text-[10px] font-body">{layer.subtitle}</span>
      </div>

      {/* Progress bar — questions phase only */}
      {state.matches("questions") && (
        <div className="fixed top-0 left-0 right-0 z-40 h-[2px] bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Question counter — questions phase only */}
      {state.matches("questions") && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <span className="text-white/30 text-xs font-body">
            {Math.min(context.currentQuestionIndex + 1, JOURNEY_QUESTION_COUNT)} / {JOURNEY_QUESTION_COUNT}
          </span>
        </div>
      )}

      {/* Main content */}
      <AnimatePresence mode="wait">
        {state.matches("idle") && (
          <CinematicFraming key="framing" onStart={handleStart} />
        )}

        {state.matches("questions") && currentQuestion && (
          <CinematicQuestion
            key={currentQuestion.id}
            question={currentQuestion}
            questionIndex={context.currentQuestionIndex}
            totalQuestions={JOURNEY_QUESTION_COUNT}
            gradient={layer.gradient}
            onAnswer={handleAnswer}
            onSkip={() => handleSkip(context.currentQuestionIndex)}
          />
        )}

        {state.matches("processing") && (
          <CinematicProcessing key="processing" />
        )}

        {state.matches("metricsReveal") && metrics && (
          <MetricsReveal
            key="metrics"
            metrics={metrics}
            onContinue={() => send({ type: "NEXT_QUESTION" })}
          />
        )}

        {(state.matches("personalization")) && metrics && (
          <JourneyPersonalization
            key="personalization"
            metrics={metrics}
            onConfirm={handlePersonalizationDone}
          />
        )}

        {state.matches("complete") && (
          <motion.div
            key="complete"
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-center space-y-6 p-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">Journey Complete</h2>
              <p className="text-white/60 font-body max-w-md">
                Your metrics have been saved. The engine will now work with your data to personalise your experience.
              </p>
              <button
                onClick={() => navigate("/app")}
                className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-display text-sm transition-all"
              >
                Enter Your App
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button — questions phase only */}
      {state.matches("questions") && (
        <button
          onClick={() => navigate("/app")}
          className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/90 text-xs backdrop-blur-sm transition-all"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
      )}

      {/* Exit confirmation */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm mx-4 text-center space-y-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="font-display font-bold text-white text-lg">Leave the Journey?</h3>
              <p className="text-white/60 font-body text-sm">
                Your progress will be saved. You can return anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-all"
                >
                  Stay
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-all"
                >
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Client-side metric computation (mirrors journeyMachine actor) ─────────────

function computeMetricsClient(ctx: any): ComputedMetrics {
  const s = ctx.scoreAccumulator || {};
  const totalAnswers = ctx.answers?.size || 0;

  const overallBand = s.bandCount > 0 ? Math.round((s.bandTotal / s.bandCount) * 10) / 10 : 3;
  const dimensionBands: Record<string, number> = {};
  for (const [dim, total] of Object.entries(s.dimensionTotals || {})) {
    const count = s.dimensionCounts?.[dim] || 1;
    dimensionBands[dim] = Math.round((total / count) * 10) / 10;
  }
  const vLevelBaseline = Math.max(0, Math.min(10, overallBand + (s.vLevelDeltaTotal || 0)));
  const vLevelCurrent = Math.max(0, Math.min(10, vLevelBaseline + (totalAnswers > 30 ? 0.5 : 0)));
  const integrationScore = Math.max(0, Math.min(10, 5 + (s.integrationDeltaTotal || 0)));
  const witnessGap = Math.max(0, 10 - (s.witnessDeltaTotal || 0));
  const witnessStability = Math.max(0, Math.min(10, 3 + (s.witnessDeltaTotal || 0)));
  const witnessDepth = Math.max(0, Math.min(10, 2 + (s.witnessDeltaTotal || 0)));
  const sortedPaths = Object.entries(s.pathScores || {}).sort(([, a], [, b]) => b - a).slice(0, 2).map(([k]) => k);
  const primaryPath = sortedPaths[0] || "dhyana";
  const secondaryPath = sortedPaths[1] || "bhakti";
  const sortedArchetypes = Object.entries(s.archetypeScores || {}).sort(([, a], [, b]) => b - a).slice(0, 2).map(([k]) => k);
  const archetypePrimary = sortedArchetypes[0] || "seeker";
  const archetypeShadow = sortedArchetypes[1] || "warrior";
  const sortedBrains = Object.entries(s.brainScores || {}).sort(([, a], [, b]) => b - a);
  const dominantBrain = sortedBrains[0]?.[0] || "head";
  const sortedAttachment = Object.entries(s.attachmentScores || {}).sort(([, a], [, b]) => b - a);
  const attachmentStyle = sortedAttachment[0]?.[0] || "mixed";
  const sortedBeliefs = Object.entries(s.beliefScores || {}).sort(([, a], [, b]) => b - a);
  const beliefLevel = sortedBeliefs[0]?.[0] || "mixed";
  const sortedCircadian = Object.entries(s.circadianScores || {}).sort(([, a], [, b]) => b - a);
  const circadianPeak = sortedCircadian[0]?.[0] || "evening";
  const hCapacities: Record<string, number> = {};
  for (const [k, total] of Object.entries(s.hCapacityTotals || {})) hCapacities[k] = Math.round(Math.max(0, Math.min(10, total)));

  return {
    overallBand: Math.round(overallBand * 10) / 10,
    dimensionBands,
    vLevelBaseline: Math.round(vLevelBaseline * 10) / 10,
    vLevelCurrent: Math.round(vLevelCurrent * 10) / 10,
    vLevelDelta: Math.round((vLevelCurrent - vLevelBaseline) * 10) / 10,
    integrationScore: Math.round(integrationScore * 10) / 10,
    witnessGap: Math.round(witnessGap * 10) / 10,
    witnessStability: Math.round(witnessStability * 10) / 10,
    witnessDepth: Math.round(witnessDepth * 10) / 10,
    dominantBrain,
    pathScores: { ...(s.pathScores || {}) },
    primaryPath,
    secondaryPath,
    archetypePrimary,
    archetypeShadow,
    topLoops: (s.loopFamilies || []).slice(0, 5),
    loopFamilies: [...(s.loopFamilies || [])],
    beliefLevel,
    attachmentStyle,
    cognitiveStyle: "analytical",
    circadianPeak,
    emotionMaturity: Math.round(Math.max(0, Math.min(10, 5 + (s.emotionDeltaTotal || 0))) * 10) / 10,
    somaticAwareness: Math.round(Math.max(0, Math.min(10, 5 + (s.somaticDeltaTotal || 0))) * 10) / 10,
    purposeClarity: Math.round(Math.max(0, Math.min(10, 5 + (s.purposeClarityTotal || 0))) * 10) / 10,
    criticVolume: Math.round(Math.max(0, Math.min(10, s.criticVolumeRaw || s.criticVolumeTotal || 0)) * 10) / 10,
    shadowOwned: Math.round(Math.max(0, Math.min(10, s.shadowOwned || 0)) * 10) / 10,
    chittaVritti: Math.round(Math.max(0, Math.min(10, s.chittaVrittiTotal || 0)) * 10) / 10,
    appRelationship: s.appRelationship || "new",
    hCapacities,
    lifeDomains: {},
    journeyDay: 1,
  } as ComputedMetrics;
}

function fallbackMetrics(): ComputedMetrics {
  return {
    overallBand: 3, dimensionBands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
    vLevelBaseline: 3, vLevelCurrent: 3, vLevelDelta: 0,
    integrationScore: 5, witnessGap: 7, witnessStability: 3, witnessDepth: 3,
    dominantBrain: "head",
    pathScores: {}, primaryPath: "dhyana", secondaryPath: "bhakti",
    archetypePrimary: "seeker", archetypeShadow: "warrior",
    topLoops: [], loopFamilies: [],
    beliefLevel: "mixed", attachmentStyle: "mixed", cognitiveStyle: "analytical", circadianPeak: "evening",
    emotionMaturity: 5, somaticAwareness: 5, purposeClarity: 5,
    criticVolume: 5, shadowOwned: 3, chittaVritti: 4,
    appRelationship: "new", hCapacities: {}, lifeDomains: {}, journeyDay: 1,
  };
}

async function persistJourneyToSupabase(ctx: JourneyContext, m: ComputedMetrics | null) {
  if (!ctx.userId || !m) return;
  try {
    const answers = Array.from(ctx.answers.values());

    // 1. Store the raw journey assessment
    const { error: journeyErr } = await supabase.from("journey_assessments").insert({
      user_id: ctx.userId,
      completed_at: ctx.journeyCompletedAt,
      overall_band: m.overallBand,
      dimension_bands: m.dimensionBands,
      v_level_baseline: m.vLevelBaseline,
      v_level_current: m.vLevelCurrent,
      v_level_delta: m.vLevelDelta,
      integration_score: m.integrationScore,
      witness_gap: m.witnessGap,
      witness_stability: m.witnessStability,
      witness_depth: m.witnessDepth,
      dominant_brain: m.dominantBrain,
      path_scores: m.pathScores,
      primary_path: m.primaryPath,
      secondary_path: m.secondaryPath,
      archetype_primary: m.archetypePrimary,
      archetype_shadow: m.archetypeShadow,
      top_loops: m.topLoops,
      loop_families: m.loopFamilies,
      belief_level: m.beliefLevel,
      attachment_style: m.attachmentStyle,
      circadian_peak: m.circadianPeak,
      emotion_maturity: m.emotionMaturity,
      somatic_awareness: m.somaticAwareness,
      purpose_clarity: m.purposeClarity,
      critic_volume: m.criticVolume,
      shadow_owned: m.shadowOwned,
      chitta_vritti: m.chittaVritti,
      h_capacities: m.hCapacities,
      raw_answers: answers,
      question_count: answers.length,
    }).select("id").maybeSingle();
    if (journeyErr) console.error("[journey] persist journey_assessments failed", journeyErr);

    // 2. Update the consciousness profile so the engine picks up new metrics immediately
    const { error: profileErr } = await supabase
      .from("user_consciousness_profile")
      .update({
        overall_band: m.overallBand,
        dimension_bands: m.dimensionBands,
        v_level_baseline: m.vLevelBaseline,
        v_level_current: m.vLevelCurrent,
        integration_score: m.integrationScore,
        witness_gap: m.witnessGap,
        witness_stability: m.witnessStability,
        witness_depth: m.witnessDepth,
        dominant_path: m.primaryPath,
        yoga_path_affinity: { primary: m.primaryPath, secondary: m.secondaryPath },
        archetype: m.archetypePrimary,
        shadow_archetype: m.archetypeShadow,
        active_loops: m.topLoops,
        loop_awareness: Math.max(0, 10 - m.topLoops.length),
        belief_level: m.beliefLevel,
        attachment_style: m.attachmentStyle,
        circadian_profile: { peak: m.circadianPeak },
        emotion_maturity: m.emotionMaturity,
        somatic_awareness: m.somaticAwareness,
        purpose_clarity: m.purposeClarity,
        critic_volume: m.criticVolume,
        shadow_owned: m.shadowOwned,
        chitta_vritti: m.chittaVritti,
        h_capacities: m.hCapacities,
        assessment_data: {
          ...(ctx.answers.size > 0 && { journey_completed_at: ctx.journeyCompletedAt }),
          journey_question_count: answers.length,
          journey_primary_path: m.primaryPath,
          journey_archetype: m.archetypePrimary,
        },
      } as any)
      .eq("user_id", ctx.userId);
    if (profileErr) console.error("[journey] update consciousness profile failed", profileErr);
  } catch (e) {
    console.error("[journey] persist error", e);
  }
}
