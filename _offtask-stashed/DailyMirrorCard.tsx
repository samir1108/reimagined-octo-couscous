/**
 * DailyMirrorCard — "What's my field today?"
 *
 * A compact, tappable card on the home page that reveals the user's
 * daily consciousness briefing: active chakra, watch-loop, micro-pause,
 * dimension frontier, and signal checks.
 *
 * Data flow:
 *  1. Immediately renders a client-side computed briefing from `profile`
 *     (deterministic graph lookups in-browser — instant, no network).
 *  2. Simultaneously calls the `daily-briefing` edge function for the
 *     server-side briefing (includes recent sessions, memory, synthesis).
 *  3. When the server response arrives, seamlessly upgrades the card.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, AlertTriangle, Target, Wind, Sparkles, Brain, Heart, Eye } from "lucide-react";
import { getGraph } from "@/data/graph";
import { getCurrentTimeSlot } from "@/lib/timeSlots";
import { useDailyBriefing, type DailyBriefing } from "@/hooks/useDailyBriefing";
import type { ConsciousnessProfile, DimensionBands } from "@/hooks/useConsciousnessEngine";

/* ─── helpers ─── */

const CHAKRA_COLORS: Record<string, string> = {
  muladhara: "#DC2626",
  svadhisthana: "#EA580C",
  manipura: "#EAB308",
  anahata: "#22C55E",
  vishuddha: "#3B82F6",
  ajna: "#6366F1",
  sahasrara: "#A855F7",
};

const CHAKRA_LABELS: Record<string, string> = {
  muladhara: "Muladhara — Root",
  svadhisthana: "Svadhisthana — Sacral",
  manipura: "Manipura — Solar Plexus",
  anahata: "Anahata — Heart",
  vishuddha: "Vishuddha — Throat",
  ajna: "Ajna — Third Eye",
  sahasrara: "Sahasrara — Crown",
};

const DIMENSION_LABELS: Record<string, string> = {
  thought: "Thought",
  emotion: "Emotion",
  body: "Body",
  awareness: "Spirit",
  action: "Action",
  connection: "Connection",
};

const SIGNAL_LABELS: Record<string, { icon: typeof Brain; label: string }> = {
  head: { icon: Brain, label: "Head" },
  gut: { icon: Wind, label: "Gut" },
  heart: { icon: Heart, label: "Heart" },
  witness: { icon: Eye, label: "Witness" },
};

const LOOP_JOURNAL_PROMPTS: Record<string, string> = {
  "CTL052": "When did I catastrophize today? What actually happened vs. what I imagined?",
  "CTL054": "When did I plan instead of act? What was I avoiding by preparing?",
  "CTL055": "When did I gather information instead of moving? What was I really afraid of?",
  "CTL066": "When did I forecast the future instead of being here? What moved through my body?",
  "VAL001": "When did I seek approval today? What would I have done if no one was watching?",
  "VAL038": "When did I consume inspiration instead of acting? What small step did I skip?",
  "AVO001": "When did I leave the moment? What was I not willing to feel?",
  "SPB001": "When did I use spiritual ideas to skip a feeling? What was underneath?",
};

/* ─── client-side briefing (instant fallback) ─── */

function buildClientBriefing(profile: ConsciousnessProfile): DailyBriefing {
  const graph = getGraph();
  const nodes = graph.nodes;
  const edges = graph.edges;

  const dimBands = profile.dimension_bands;
  const primaryDims: (keyof DimensionBands)[] = ["thought", "emotion", "body", "awareness"];
  let weakestDim = primaryDims[0];
  let weakestBand = dimBands[weakestDim] ?? profile.overall_band;
  for (const d of primaryDims) {
    const b = dimBands[d] ?? profile.overall_band;
    if (b < weakestBand) {
      weakestBand = b;
      weakestDim = d;
    }
  }

  const dimNodeId = `dimension::consciousness::${weakestDim}`;
  const chakraEdge = edges.find((e) => e.type === "CHAKRA_RELATED_TO_DIMENSION" && e.from === dimNodeId);
  const chakraNode = chakraEdge ? nodes.get(chakraEdge.to) : null;
  const chakraId = chakraNode?.id ? chakraNode.id.replace("chakra::", "") : "manipura";
  const chakraColor = CHAKRA_COLORS[chakraId] ?? "#EAB308";
  const chakraLabel = CHAKRA_LABELS[chakraId] ?? chakraId;

  const activeLoopIds = profile.active_loops ?? [];
  const bandNodeId = `band::${Math.floor(profile.overall_band)}`;
  const bandLoopEdges = edges.filter((e) => e.type === "BAND_COMMON_LOOP" && e.from === bandNodeId);
  const overlap = bandLoopEdges.filter((e) => activeLoopIds.includes(e.to.replace("loop::", "")));
  const chosenLoopEdge = overlap[0] ?? bandLoopEdges[0] ?? null;

  let watchLoop: DailyBriefing["watchLoop"] = null;
  if (chosenLoopEdge) {
    const loopNode = nodes.get(chosenLoopEdge.to);
    if (loopNode) {
      const loopId = loopNode.id.replace("loop::", "");
      const loopData = loopNode.data;
      const dissolution = String(loopData.dissolution_path ?? "").trim();
      const microPause =
        dissolution.split("\n")[0]?.slice(0, 100) ??
        "One slow breath. Name what's true right now.";

      const signalEdges = edges.filter(
        (e) => e.type === "SIGNAL_INDICATES_LOOP" && e.to === loopNode.id
      );
      const signalNodes = signalEdges.map((s) => nodes.get(s.from)).filter(Boolean);
      const awarenessMarker =
        signalNodes.map((n) => n!.label).slice(0, 2).join(" + ") ||
        "the body runs the script before the mind notices";

      const practiceEdge = edges.find(
        (e) => e.type === "LOOP_DISSOLVES_VIA" && e.from === loopNode.id
      );
      const practiceNode = practiceEdge ? nodes.get(practiceEdge.to) : null;
      const practiceName =
        practiceNode?.type === "practice"
          ? practiceNode.data.microPractice ?? practiceNode.label
          : null;

      watchLoop = {
        id: loopId,
        name: loopNode.label,
        trigger: String(loopData.triggers?.[0] ?? "when patterns repeat unconsciously"),
        awarenessMarker,
        microPause: practiceName ?? microPause,
        occurrenceCount: 0,
      };
    }
  }

  const rawNext = Math.ceil(weakestBand) + (weakestBand % 1 >= 0.5 ? 0 : 0.5);
  const nextThreshold = Math.ceil(rawNext * 2) / 2;

  const dimNodeForPractice = `dimension::consciousness::${weakestDim}`;
  const practiceImpactEdge = edges.find(
    (e) => e.type === "PRACTICE_IMPACTS_DIMENSION" && e.to === dimNodeForPractice
  );
  const practiceNode = practiceImpactEdge ? nodes.get(practiceImpactEdge.from) : null;
  const practice =
    practiceNode?.type === "practice"
      ? {
          id: practiceNode.id.replace("practice::", ""),
          name: practiceNode.label,
          duration: Number(practiceNode.data.durationMin ?? 3),
        }
      : null;

  const journalPrompt =
    watchLoop?.id && LOOP_JOURNAL_PROMPTS[watchLoop.id]
      ? LOOP_JOURNAL_PROMPTS[watchLoop.id]
      : "When did I act today before I felt ready? What moved through me?";

  const isNewUser = profile.journey_day < 7;
  const confidence: "high" | "medium" | "low" =
    activeLoopIds.length > 0 && !isNewUser
      ? "high"
      : activeLoopIds.length > 0
        ? "medium"
        : "low";

  return {
    headline: `Today's field: ${chakraLabel}`,
    chakra: { id: chakraId, label: chakraLabel, color: chakraColor },
    watchLoop,
    dimensionFocus: { dimension: weakestDim, currentBand: weakestBand, nextThreshold },
    practice,
    journalPrompt,
    signals: {
      head: "Is my mind racing ahead of what's happening?",
      gut: "Is there a clench or flutter in my solar plexus?",
      heart: "Am I bracing for an outcome rather than being with this moment?",
      witness: "Can I step back and watch this without becoming it?",
    },
    confidence,
    flavored: false,
    context: {
      journeyDay: profile.journey_day,
      journeyPhase: profile.journey_phase,
      dominantPath: String(profile.dominant_path ?? "path forming"),
      synthesisNote: null,
      recentMemorySnippets: [],
      recentSessionSummaries: [],
      freeIntent: null,
    },
  };
}

/* ─── component ─── */

interface DailyMirrorCardProps {
  profile: ConsciousnessProfile | null;
  /** Opens the guide in a mirror-chat seeded with this check-in question. */
  onSignalTap?: (question: string, seedContext: string) => void;
  /** Opens the guide seeded with tonight's reflection question for the watch-loop. */
  onReflect?: (journalPrompt: string, seedContext: string) => void;
}

export default function DailyMirrorCard({ profile, onSignalTap, onReflect }: DailyMirrorCardProps) {
  const [expanded, setExpanded] = useState(false);

  const {
    briefing: serverBriefing,
    isLoading: briefingLoading,
    isFetching,
    invalidateBriefing,
  } = useDailyBriefing({
    timeSlot: getCurrentTimeSlot(),
    enabled: !!profile,
  });

  const clientBriefing = useMemo(() => {
    if (!profile) return null;
    return buildClientBriefing(profile);
  }, [profile]);

  // Prefer server briefing when available, fall back to client-side
  const briefing = serverBriefing ?? clientBriefing;
  const isLoading = briefingLoading && !clientBriefing;

  /** Compact system-prompt grounding so the guide speaks to this exact field. */
  const seedContext = useMemo(() => {
    const b = serverBriefing ?? clientBriefing;
    if (!b) return "";
    const parts = [
      `Active energy body: ${b.chakra.label}`,
      b.watchLoop
        ? `Loop on watch: ${b.watchLoop.name} (${b.watchLoop.id}) — fires when: ${b.watchLoop.trigger}. Body signal: ${b.watchLoop.awarenessMarker}. Micro-pause: ${b.watchLoop.microPause}`
        : null,
      b.dimensionFocus
        ? `Dimension frontier: ${b.dimensionFocus.dimension} at band ${b.dimensionFocus.currentBand}, next threshold ${b.dimensionFocus.nextThreshold}`
        : null,
      b.practice
        ? `Today's suggested practice: ${b.practice.name} (~${b.practice.duration} min)`
        : null,
      b.context?.synthesisNote ? `Yesterday: ${b.context.synthesisNote}` : null,
      `Journey day ${b.context?.journeyDay ?? 0} · ${b.context?.journeyPhase ?? ""}`,
    ];
    return parts.filter(Boolean).join("\n");
  }, [serverBriefing, clientBriefing]);

  if (!briefing || !profile) return null;

  const { headline, chakra, watchLoop, dimensionFocus, practice, journalPrompt, signals, confidence, context } =
    briefing;

  const confidenceLabel =
    confidence === "high"
      ? "Based on your patterns"
      : confidence === "medium"
        ? "Emerging picture"
        : "New field — gathering your signals";

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto mb-3 px-2"
    >
      <div
        className="w-full rounded-2xl border overflow-hidden transition-colors"
        style={{
          borderColor: `${chakra.color}25`,
          background: `linear-gradient(135deg, ${chakra.color}10 0%, ${chakra.color}05 50%, transparent 100%)`,
        }}
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60"
        >
          {/* ─── compact row (always visible) ─── */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: chakra.color, boxShadow: `0 0 8px ${chakra.color}60` }}
            />

            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium"
                style={{ color: `${chakra.color}cc` }}
              >
                {isLoading ? "Reading your field" : confidenceLabel}
              </p>
              <p className="text-sm font-display text-foreground/90 leading-snug mt-0.5 line-clamp-1">
                {headline}
              </p>
              {watchLoop && (
                <p className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-1">
                  Watch for{" "}
                  <span className="text-foreground/80 font-medium">{watchLoop.name}</span>
                  {" "}· {watchLoop.trigger}
                </p>
              )}
            </div>

            <div className="shrink-0 text-muted-foreground/60">
              {isLoading ? (
                <motion.span
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="block"
                >
                  <Eye className="h-4 w-4" />
                </motion.span>
              ) : expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </button>

        {/* ─── expanded briefing ─── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-1 space-y-4">
                <div className="h-px w-full" style={{ backgroundColor: `${chakra.color}20` }} />

                {/* watch-loop */}
                {watchLoop && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5" style={{ color: chakra.color }} />
                      <span
                        className="text-[10px] tracking-[0.2em] uppercase font-medium"
                        style={{ color: `${chakra.color}aa` }}
                      >
                        Loop to watch
                      </span>
                    </div>
                    <p className="text-sm font-display text-foreground/90">
                      {watchLoop.name}
                      {watchLoop.occurrenceCount > 0 && (
                        <span className="ml-2 text-[10px] text-muted-foreground/60">
                          ({watchLoop.occurrenceCount}x recently)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      Fires when: {watchLoop.trigger}
                    </p>
                    <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-primary/80 font-medium mb-1">
                        When you feel it
                      </p>
                      <p className="text-xs text-foreground/80 italic">{watchLoop.awarenessMarker}</p>
                      <p className="text-xs text-foreground/70 mt-1.5">
                        <span className="text-primary/90 font-medium">Micro-pause: </span>
                        {watchLoop.microPause}
                      </p>
                    </div>
                  </div>
                )}

                {/* dimension frontier */}
                {dimensionFocus && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3.5 w-3.5" style={{ color: chakra.color }} />
                      <span
                        className="text-[10px] tracking-[0.2em] uppercase font-medium"
                        style={{ color: `${chakra.color}aa` }}
                      >
                        Dimension frontier
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/80">
                      {DIMENSION_LABELS[dimensionFocus.dimension] ?? dimensionFocus.dimension} is your
                      frontier · band {dimensionFocus.currentBand} → {dimensionFocus.nextThreshold}
                    </p>
                  </div>
                )}

                {/* practice suggestion */}
                {practice && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Wind className="h-3.5 w-3.5" style={{ color: chakra.color }} />
                      <span
                        className="text-[10px] tracking-[0.2em] uppercase font-medium"
                        style={{ color: `${chakra.color}aa` }}
                      >
                        Suggested practice
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">
                      {practice.name}{" "}
                      <span className="text-xs text-muted-foreground/60">(~{practice.duration} min)</span>
                    </p>
                  </div>
                )}

                {/* journal prompt */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-3.5 w-3.5" style={{ color: chakra.color }} />
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase font-medium"
                      style={{ color: `${chakra.color}aa` }}
                    >
                      Evening reflection
                    </span>
                  </div>
                  <p className="text-xs text-foreground/70 italic leading-relaxed">{journalPrompt}</p>
                  {onReflect && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReflect(journalPrompt, seedContext);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      style={{
                        borderColor: `${chakra.color}40`,
                        color: `${chakra.color}dd`,
                        background: `${chakra.color}12`,
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      Reflect on this now
                    </button>
                  )}
                </div>

                {/* synthesis note (from server) */}
                {context.synthesisNote && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 font-medium mb-1">
                      Yesterday
                    </p>
                    <p className="text-xs text-foreground/60 italic">{context.synthesisNote}</p>
                  </div>
                )}

                {/* signal checks — tapping one opens a seeded mirror chat */}
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-medium mb-2">
                    Signal checks
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(signals).map(([key, question]) => {
                      const sig = SIGNAL_LABELS[key];
                      if (!sig) return null;
                      const Icon = sig.icon;
                      const body = (
                        <>
                          <Icon className="h-3 w-3 text-primary/70 shrink-0" />
                          <span className="text-[11px] text-foreground/70">{question}</span>
                        </>
                      );
                      if (!onSignalTap) {
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1"
                          >
                            {body}
                          </div>
                        );
                      }
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSignalTap(question, seedContext);
                          }}
                          className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-left hover:border-primary/35 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition-colors"
                        >
                          {body}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* journey context */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] text-muted-foreground/50 italic">
                    Day {context.journeyDay} · {context.journeyPhase} · {context.dominantPath}
                    {context.freeIntent && ` · "${context.freeIntent}"`}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      invalidateBriefing();
                    }}
                    disabled={isFetching}
                    className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45 hover:text-primary/80 disabled:opacity-40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
                    title="Re-read today's field against your latest sessions and memories"
                  >
                    {isFetching ? "Reading…" : "Refresh"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
