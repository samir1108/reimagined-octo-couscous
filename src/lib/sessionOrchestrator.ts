/**
 * SESSION ORCHESTRATOR v2 — Data-Driven Adaptive Sessions
 *
 * Consumes the FULL richness of the consciousness engine:
 *   • 300+ loops (triggers, manifestations, awareness_markers, dissolution_path, severity)
 *   • Capability map (6 domains × 6 levels × 4 modalities × 10 metrics)
 *   • Graph engine (band profiles, loop→practice dissolution, chakra/granthis/kundalini)
 *   • Sutra axes (constellation, arc, stressed domains, state, mode registry)
 *   • Daily gates (naturalEnergy, toneModifiers, maxDurationMinutes)
 *   • User profile (band, streak, journeyDay, guru, dimension bands)
 *
 * Generates 3–5 candidate plans, scores for personalization, returns the best.
 * Same SessionPlan output type → consumed by GenerativeSession runtime.
 */

import { getCurrentGate, type GateId, getGateDef } from "@/lib/consciousness/dailyGates";
import { getEngine } from "@/lib/graph/engine";
import type { LoopDefinition } from "@/data/loops";
import type { CapabilityState, CapabilityLevel, TrainingModality, MetricKey, CapabilityId } from "@/types/capability";
import type { ConstellationSnapshot, UserState } from "@/lib/sutra/orchestrator";
import { selectFramework, buildSessionBlueprint } from "@/lib/session-frameworks";
// ─── Types ────────────────────────────────────────────────────────────────

export type SessionMode =
  | "teach"        // Knowledge / wisdom delivery
  | "practice"    // Timed practice (witness, breath, body, mantra, jap)
  | "inquiry"     // Self-inquiry conversation
  | "reflect"     // Closing reflection / integration
  | "blend";       // Teach → practice → reflect in one

export type PracticeKind =
  | "witness"
  | "breath"
  | "body"
  | "mantra-jap"
  | "self-inquiry"
  | "loving-kindness"
  | "open-awareness"
  | "free-form";

export interface PracticeBlock {
  kind: PracticeKind;
  durationSec: number;
  allowMidPrompts: boolean;
  intentionPrompt: string;
  midPrompts: string[];
  closingPrompt: string;
  visual: "orb-pulse" | "orb-still" | "candle" | "horizon";
  /** Which capability this practice trains */
  targetCapability?: CapabilityId;
  /** Which modality this practice uses */
  modality?: TrainingModality;
  /** Loop this practice dissolves (if any) */
  dissolvesLoop?: string;
  /** Band-level depth marker */
  bandDepth?: string;
}

export interface SessionPlan {
  id: string;
  sessionNumber: number;
  gate: GateId;
  mode: SessionMode;
  title: string;
  rationale: string;
  greeting: string;
  theme: { title: string; intention: string };
  knowledge?: { heading: string; body: string }[];
  practice?: PracticeBlock;
  closing: {
    feedbackPrompt: string;
    prediction?: string;
    nextHint?: string;
  };
  estimatedMinutes: number;
  /** Framework library selection */
  frameworkId?: string;
  frameworkName?: string;
  frameworkStages?: string[];
  /** Debug: what data drove this plan */
  provenance?: {
    targetCapability?: CapabilityId;
    targetLoop?: string;
    modalityUsed?: TrainingModality;
    bandLevel?: number;
    score: number;
    frameworkId?: string;
  };
}

export interface OrchestratorContext {
  // Time & gate
  hour: number;
  gate: GateId;

  // Session history
  sessionsToday: number;
  lastSessionToday?: SessionPlan;
  lastTheme?: { title: string; intention: string } | null;
  daysSinceLastSession: number;

  // User identity
  userName: string;
  guruName?: string;
  guruStyle?: string;
  bandLevel?: number;           // 0–10 overall band
  journeyDay?: number;

  // Capability system
  capabilityMap: Record<CapabilityId, CapabilityState>;
  capabilityGaps: CapabilityId[];           // modalities not yet trained per capability
  weakestDimension?: "body" | "thought" | "emotion" | "awareness";
  dimensionBands?: Record<string, number>;

  // Loop system
  activeLoops: string[];                    // loop IDs
  activeLoopDetails: LoopDefinition[];      // FULL loop objects
  loopSeverity: Record<string, number>;     // 0–100 per loop

  // Sutra axes (from whatNext)
  constellation?: ConstellationSnapshot | null;
  arc?: { title: string; day: number } | null;
  stressedDomains?: string[];
  sutraState?: UserState;

  // Energy & mood
  energy?: "low" | "medium" | "high";
  mood?: string;

  // Today's theme
  todayTheme?: { title?: string | null; description?: string | null } | null;
  language?: string;
}

// ─── Capability → PracticeKind Mapping ───────────────────────────────────

const CAPABILITY_TO_PRACTICE: Record<string, PracticeKind> = {
  sustained_attention: "witness",
  distraction_resistance: "witness",
  impulse_control: "breath",
  body_awareness: "body",
  breath_awareness: "breath",
  emotional_awareness: "loving-kindness",
  thought_awareness: "self-inquiry",
  self_awareness: "self-inquiry",
  observation: "open-awareness",
  meditation: "open-awareness",
  witnessing_thoughts: "witness",
  // ConsciousOS capabilities
  attention_stability: "witness",
  attention_control: "witness",
  interoception: "body",
  emotional_regulation: "loving-kindness",
  cognitive_flexibility: "self-inquiry",
  meta_awareness: "open-awareness",
};

const CAPABILITY_TO_MODALITY: Record<string, TrainingModality[]> = {
  sustained_attention: ["game", "practice", "experiment", "reflection"],
  distraction_resistance: ["game", "practice", "experiment"],
  impulse_control: ["practice", "experiment"],
  body_awareness: ["practice", "experiment", "reflection"],
  breath_awareness: ["practice", "game"],
  emotional_awareness: ["practice", "reflection", "experiment"],
  thought_awareness: ["inquiry", "reflection", "practice"],
  self_awareness: ["inquiry", "reflection"],
  observation: ["practice", "game"],
  meditation: ["practice", "reflection"],
  witnessing_thoughts: ["practice", "game"],
};

// ─── Loop Category → PracticeKind Affinity ──────────────────────────────

const LOOP_CATEGORY_TO_PRACTICE: Record<string, PracticeKind[]> = {
  validation: ["loving-kindness", "self-inquiry", "witness"],
  control: ["breath", "body", "open-awareness"],
  avoidance: ["witness", "body", "self-inquiry"],
  attachment: ["loving-kindness", "open-awareness", "self-inquiry"],
  comparison: ["witness", "self-inquiry", "loving-kindness"],
  narrative: ["self-inquiry", "witness", "open-awareness"],
  survival: ["breath", "body", "loving-kindness"],
  body: ["body", "breath", "open-awareness"],
  energy: ["breath", "mantra-jap", "body"],
  emotional: ["loving-kindness", "self-inquiry", "witness"],
  mental: ["witness", "self-inquiry", "open-awareness"],
  behavioral: ["body", "breath", "witness"],
  habit: ["witness", "self-inquiry"],
  social: ["loving-kindness", "self-inquiry"],
  relationship: ["loving-kindness", "self-inquiry", "witness"],
  scarcity: ["loving-kindness", "open-awareness"],
  identity: ["self-inquiry", "witness", "open-awareness"],
  ego: ["witness", "self-inquiry"],
  belief: ["self-inquiry", "open-awareness"],
  cognitive_bias: ["witness", "self-inquiry"],
  attention: ["witness", "open-awareness"],
  motivation: ["self-inquiry", "body"],
  decision: ["self-inquiry", "witness"],
  learning: ["open-awareness", "witness"],
  productivity: ["witness", "breath"],
  creativity: ["open-awareness", "self-inquiry"],
  purpose: ["self-inquiry", "open-awareness"],
  spiritual: ["open-awareness", "mantra-jap", "loving-kindness"],
};

// ─── Base Practice Templates (enriched with loop/capability data) ─────────

interface PracticeTemplate {
  kind: PracticeKind;
  baseDurationMin: number;
  defaultIntention: string;
  defaultClosing: string;
  defaultMidPrompts: string[];
  allowMid: boolean;
  visual: PracticeBlock["visual"];
  /** Capability this primarily trains */
  primaryCapability: CapabilityId;
  /** Loop categories this practice dissolves */
  dissolvesCategories: string[];
  /** Band-level depth markers (L0–L5) */
  bandMarkers: Record<number, string>;
}

const PRACTICE_TEMPLATES: PracticeTemplate[] = [
  {
    kind: "witness",
    baseDurationMin: 5,
    defaultIntention: "Sit. Watch thoughts pass — don't follow, don't fight.",
    defaultClosing: "What did you notice — without judging it?",
    defaultMidPrompts: ["What's the very first thing arising?", "Notice without naming it. Stay."],
    allowMid: true,
    visual: "orb-pulse",
    primaryCapability: "sustained_attention",
    dissolvesCategories: ["mental", "cognitive_bias", "attention", "validation", "narrative"],
    bandMarkers: {
      0: "Notice thoughts come and go",
      1: "Label thinking as 'thinking'",
      2: "Stay with the gap between thoughts",
      3: "Watch the watcher watching",
      4: "Rest as the awareness itself",
      5: "No separation between witness and witnessed",
    },
  },
  {
    kind: "breath",
    baseDurationMin: 3,
    defaultIntention: "Eyes soft. Feel breath at the nostrils. Count if it helps.",
    defaultClosing: "Where is the breath now compared to when you started?",
    defaultMidPrompts: ["Feel the breath at the nostrils.", "Notice the pause between breaths."],
    allowMid: false,
    visual: "orb-pulse",
    primaryCapability: "breath_awareness",
    dissolvesCategories: ["control", "survival", "energy", "anxiety"],
    bandMarkers: {
      0: "Feel one breath fully",
      1: "Count 10 breaths without losing track",
      2: "Notice breath quality changing",
      3: "Breath breathes itself",
      4: "Breath as anchor in daily life",
      5: "Breath and awareness indistinguishable",
    },
  },
  {
    kind: "body",
    baseDurationMin: 7,
    defaultIntention: "Scan from crown to feet. No fixing. Just feeling.",
    defaultClosing: "Which part of the body feels most awake?",
    defaultMidPrompts: ["What sensation is strongest right now?", "Breathe into that area."],
    allowMid: false,
    visual: "orb-pulse",
    primaryCapability: "body_awareness",
    dissolvesCategories: ["body", "avoidance", "control", "survival"],
    bandMarkers: {
      0: "Notice gross sensations",
      1: "Scan systematically without rushing",
      2: "Feel subtle vibration/tingling",
      3: "Hold whole-body awareness",
      4: "Body as continuous sensation field",
      5: "No inside/outside — just sensation",
    },
  },
  {
    kind: "mantra-jap",
    baseDurationMin: 8,
    defaultIntention: "Choose one word. Repeat silently with each breath.",
    defaultClosing: "Did the mantra carry you, or did you carry it?",
    defaultMidPrompts: ["Return to the sound.", "Let the sound do the work."],
    allowMid: false,
    visual: "candle",
    primaryCapability: "attention_stability",
    dissolvesCategories: ["mental", "narrative", "cognitive_bias", "spiritual"],
    bandMarkers: {
      0: "Repeat a word for 1 minute",
      1: "Mantra with breath for 5 minutes",
      2: "Mantra continues during activity",
      3: "Mantra arises spontaneously",
      4: "Sound dissolves into silence",
      5: "The repeater is also the sound",
    },
  },
  {
    kind: "self-inquiry",
    baseDurationMin: 6,
    defaultIntention: "Hold this question: 'Who is aware right now?' Don't answer. Stay with it.",
    defaultClosing: "What stayed when the question dissolved?",
    defaultMidPrompts: ["Step 1 — what's the very first thing arising?", "Step 2 — go beneath that. What's underneath?"],
    allowMid: true,
    visual: "orb-still",
    primaryCapability: "self_awareness",
    dissolvesCategories: ["identity", "ego", "belief", "narrative", "comparison", "validation"],
    bandMarkers: {
      0: "Ask 'who am I?' once",
      1: "Hold the question for 3 minutes",
      2: "Notice the gap before answer arises",
      3: "Question dissolves into direct knowing",
      4: "Inquiry becomes background radiation",
      5: "No question, no answer — just this",
    },
  },
  {
    kind: "loving-kindness",
    baseDurationMin: 5,
    defaultIntention: "May I be safe. May I be at ease. Then expand outward.",
    defaultClosing: "Where in the body did the kindness land?",
    defaultMidPrompts: ["Feel the warmth in the chest.", "Extend to someone difficult."],
    allowMid: false,
    visual: "orb-pulse",
    primaryCapability: "emotional_awareness",
    dissolvesCategories: ["validation", "attachment", "comparison", "relationship", "scarcity"],
    bandMarkers: {
      0: "Generate warmth toward self",
      1: "Extend to a loved one",
      2: "Extend to neutral person",
      3: "Extend to difficult person",
      4: "Boundless in all directions",
      5: "Kindness is what remains when self drops",
    },
  },
  {
    kind: "open-awareness",
    baseDurationMin: 6,
    defaultIntention: "Eyes soft. Awareness wide. Notice everything at once.",
    defaultClosing: "What was the difference between watching and being?",
    defaultMidPrompts: ["Widen to include sounds.", "Include the watcher in the watched."],
    allowMid: true,
    visual: "horizon",
    primaryCapability: "meta_awareness",
    dissolvesCategories: ["control", "mental", "spiritual", "cognitive_bias"],
    bandMarkers: {
      0: "Rest in panoramic awareness for 1 minute",
      1: "Include thoughts without contracting",
      2: "Awareness knows itself",
      3: "No center, no periphery",
      4: "Awareness is the condition for all experience",
      5: "Awareness recognizing itself — no object",
    },
  },
  {
    kind: "free-form",
    baseDurationMin: 5,
    defaultIntention: "Sit and notice. Whatever arises is the practice.",
    defaultClosing: "What did this sitting reveal?",
    defaultMidPrompts: ["What are you feeling right now?", "Notice without naming it. Stay."],
    allowMid: true,
    visual: "orb-pulse",
    primaryCapability: "observation",
    dissolvesCategories: ["avoidance", "control", "spiritual"],
    bandMarkers: {
      0: "Sit without agenda for 2 minutes",
      1: "Allow whatever comes",
      2: "No meditation, just sitting",
      3: "Sitting is the teacher",
      4: "Life is the practice",
      5: "No practice, no practitioner",
    },
  },
];

// ─── Knowledge Teachings (band-aware) ────────────────────────────────────

const TEACHINGS: Record<PracticeKind, { heading: string; body: string; bandNuance: Record<number, string> }> = {
  witness: {
    heading: "The Witness",
    body: "Behind every thought, there is the one who notices it. That noticing — quiet, unmoving — is what we're practicing today.",
    bandNuance: {
      0: "Thoughts are like clouds. You are the sky.",
      1: "Label each thought: 'planning', 'worrying', 'remembering'.",
      2: "Notice the space between thoughts. That space is you.",
      3: "The witness doesn't need to try. It's already watching.",
      4: "Even the sense of 'I am watching' is a thought.",
      5: "There is no witness. There is only witnessing.",
    },
  },
  breath: {
    heading: "The Anchor",
    body: "Breath is the thread between body and mind. When the mind drifts, the breath is here. Always here.",
    bandNuance: {
      0: "Count breaths: 1 on inhale, 2 on exhale... up to 10.",
      1: "Feel the cool air in, warm air out. No counting needed.",
      2: "Notice the pause. That stillness is your home.",
      3: "You don't breathe. Breath happens. You are the space it happens in.",
      4: "Breath is the body's prayer. The body prays without you.",
      5: "No breather. No breath. Only breathing.",
    },
  },
  body: {
    heading: "The Body Knows",
    body: "The body holds what the mind hides. Today we listen — not to fix, but to feel.",
    bandNuance: {
      0: "Scan slowly. Name what you feel: 'tingling', 'tightness', 'warmth'.",
      1: "Don't skip the numb places. Numbness is a sensation too.",
      2: "Emotions live in the body. Find where this feeling lives.",
      3: "The body is not yours. It's nature expressing itself.",
      4: "Sensation arises and passes. You are the field it arises in.",
      5: "No body. No feeler. Only sensation knowing itself.",
    },
  },
  "mantra-jap": {
    heading: "Sound as Anchor",
    body: "A repeated sound clears the static. Let the mantra do the work — your job is just to return to it.",
    bandNuance: {
      0: "Pick 'Om' or 'So Hum'. Repeat with each breath.",
      1: "Let the sound become smoother, more continuous.",
      2: "The mantra repeats itself. You just listen.",
      3: "Sound dissolves into the silence it arises from.",
      4: "The mantra is not separate from the one repeating.",
      5: "No sound. No silence. Only the hum of being.",
    },
  },
  "self-inquiry": {
    heading: "Who Is Asking?",
    body: "Every belief, every reaction — trace it back. Underneath, find the one who asks. That one is closer than the question.",
    bandNuance: {
      0: "Ask 'Who is aware?' Don't answer. Feel the question.",
      1: "Notice what looks. It has no shape, no location.",
      2: "The question burns away the questioner.",
      3: "What remains when 'I' is seen through?",
      4: "The answer is the end of the asker.",
      5: "No one to ask. No one to answer. Only this.",
    },
  },
  "loving-kindness": {
    heading: "Soft Heart",
    body: "Kindness is not a mood. It's a muscle. We strengthen it by aiming it — first at ourselves, then outward.",
    bandNuance: {
      0: "Say silently: 'May I be safe. May I be at ease.' Feel the words.",
      1: "If resistance comes, include it: 'May this resistance be at ease.'",
      2: "Expand: loved one → neutral → difficult → all beings.",
      3: "The categories dissolve. Only kindness remains.",
      4: "You don't generate kindness. You uncover it.",
      5: "Kindness is what's left when armor falls.",
    },
  },
  "open-awareness": {
    heading: "Spacious Mind",
    body: "Stop tracking individual thoughts. Widen. Let everything arise and pass like weather.",
    bandNuance: {
      0: "Imagine the mind as open sky. Thoughts are clouds.",
      1: "Don't follow clouds. Don't push them away. Just sky.",
      2: "Notice the sky doesn't care about clouds.",
      3: "The sky and clouds are not two.",
      4: "Awareness is not a thing. It's the space things appear in.",
      5: "No awareness. No objects. Only luminous emptiness.",
    },
  },
  "free-form": {
    heading: "Today's Practice",
    body: "Show up. Notice. Return. That's the whole instruction.",
    bandNuance: {
      0: "Just sit. No technique. See what happens.",
      1: "Boredom is a teacher. Restlessness is a teacher.",
      2: "The sitting sits you.",
      3: "No method. No goal. No meditator.",
      4: "Practice and life are not separate.",
      5: "This ordinary moment — complete, lacking nothing.",
    },
  },
};

// ─── Provenance / Scoring ────────────────────────────────────────────────

interface CandidatePlan extends SessionPlan {
  _score: number;
  _provenance: {
    targetCapability?: CapabilityId;
    targetLoop?: string;
    modalityUsed?: TrainingModality;
    bandLevel?: number;
    matchedLoopCategory?: string;
    matchedDimension?: string;
    capabilityGapFilled?: boolean;
  };
}

function scoreCandidate(plan: CandidatePlan, ctx: OrchestratorContext): number {
  let score = 0;
  const prov = plan._provenance;

  // 1. Fills a capability modality gap (highest value)
  if (prov.capabilityGapFilled) score += 50;

  // 2. Targets active loop's dissolution path
  if (prov.targetLoop && ctx.activeLoops.includes(prov.targetLoop)) score += 40;

  // 3. Targets weakest dimension
  if (prov.matchedDimension && prov.matchedDimension === ctx.weakestDimension) score += 30;

  // 4. Matches loop category affinity
  if (prov.matchedLoopCategory) {
    const loop = ctx.activeLoopDetails.find(l => l.category === prov.matchedLoopCategory);
    if (loop) score += 20;
  }

  // 5. Uses untrained modality for target capability
  if (prov.modalityUsed && prov.targetCapability) {
    const capState = ctx.capabilityMap[prov.targetCapability];
    if (capState && !capState.modalitiesUsed.includes(prov.modalityUsed)) score += 25;
  }

  // 6. Band-appropriate depth
  if (prov.bandLevel !== undefined && ctx.bandLevel !== undefined) {
    const diff = Math.abs(prov.bandLevel - ctx.bandLevel);
    score += Math.max(0, 15 - diff * 3);
  }

  // 7. Guru style resonance
  if (ctx.guruStyle && plan.knowledge?.some(k => k.body.includes(ctx.guruStyle!))) score += 10;

  // 8. Session number variety (avoid repetition)
  if (ctx.lastSessionToday && plan.practice?.kind !== ctx.lastSessionToday.practice?.kind) score += 10;

  // 9. Energy-appropriate duration
  if (plan.practice) {
    const expectedMin = ctx.energy === "low" ? 3 : ctx.energy === "high" ? 8 : 5;
    const actualMin = plan.practice.durationSec / 60;
    if (Math.abs(actualMin - expectedMin) <= 2) score += 10;
  }

  plan._score = score;
  return score;
}

// ─── Main Orchestration ──────────────────────────────────────────────────

function pickPracticeKind(ctx: OrchestratorContext, candidateLoops: LoopDefinition[]): PracticeKind {
  // Priority 1: Weakest dimension's untrained modality
  if (ctx.weakestDimension && ctx.capabilityMap) {
    for (const [capId, state] of Object.entries(ctx.capabilityMap)) {
      if (CAPABILITY_TO_PRACTICE[capId]) {
        const untrained = (CAPABILITY_TO_MODALITY[capId] || []).filter(m => !state.modalitiesUsed.includes(m));
        if (untrained.length > 0 && state.level < 3) {
          return CAPABILITY_TO_PRACTICE[capId];
        }
      }
    }
  }

  // Priority 2: Active loop's dissolution path
  for (const loop of candidateLoops) {
    const practices = LOOP_CATEGORY_TO_PRACTICE[loop.category] || [];
    if (practices.length > 0) {
      // Check if we have capability gap for this practice
      const capId = PRACTICE_TEMPLATES.find(t => t.kind === practices[0])?.primaryCapability;
      if (capId && ctx.capabilityMap[capId]?.modalitiesUsed.length < 4) {
        return practices[0];
      }
    }
  }

  // Priority 3: Stressed domain → practice
  if (ctx.stressedDomains?.[0]) {
    const domainMap: Record<string, PracticeKind> = {
      work: "witness",
      relationships: "loving-kindness",
      health: "body",
      finances: "breath",
      purpose: "self-inquiry",
      creativity: "open-awareness",
    };
    if (domainMap[ctx.stressedDomains[0]]) return domainMap[ctx.stressedDomains[0]];
  }

  // Priority 4: Energy + gate defaults
  const gate = getGateDef(ctx.gate);
  if (ctx.gate === "night") return ctx.energy === "low" ? "breath" : "loving-kindness";
  if (ctx.gate === "midday") return "breath";
  if (ctx.energy === "low") return "breath";
  if (ctx.energy === "high") return "self-inquiry";

  // Priority 5: Rotate for variety
  const rotation: PracticeKind[] = ["witness", "breath", "mantra-jap", "self-inquiry", "open-awareness", "body", "loving-kindness"];
  return rotation[(ctx.sessionsToday) % rotation.length];
}

function pickMode(ctx: OrchestratorContext, practiceKind: PracticeKind, sessionNumber: number): SessionMode {
  const gate = getGateDef(ctx.gate);

  // Night → always reflect
  if (ctx.gate === "night") return "reflect";

  // Midday → practice only (brief)
  if (ctx.gate === "midday") return "practice";

  // First session of day → blend
  if (sessionNumber === 1) return "blend";

  // Low energy → practice only
  if (ctx.energy === "low") return "practice";

  // High energy + active loops → inquiry
  if (ctx.energy === "high" && ctx.activeLoops.length > 0) return "inquiry";

  // Band level deepens → more teach/reflect
  if (ctx.bandLevel && ctx.bandLevel >= 4) {
    return sessionNumber % 2 === 0 ? "teach" : "blend";
  }

  // Constellation phase
  if (ctx.constellation?.phase === "integrate") return "reflect";
  if (ctx.constellation?.phase === "t-shape") return "teach";

  // Rotate
  const rotation: SessionMode[] = ["practice", "inquiry", "blend", "practice", "teach", "blend"];
  return rotation[(sessionNumber - 2) % rotation.length];
}

function buildPracticeBlock(
  ctx: OrchestratorContext,
  kind: PracticeKind,
  targetLoop?: LoopDefinition,
  targetCapability?: CapabilityId,
  modality?: TrainingModality
): PracticeBlock {
  const template = PRACTICE_TEMPLATES.find(t => t.kind === kind)!;
  const gate = getGateDef(ctx.gate);
  const energy = ctx.energy ?? "medium";
  const energyMult = energy === "low" ? 0.5 : energy === "high" ? 1.2 : 1;
  const gateMult: Record<GateId, number> = { morning: 1.0, midday: 0.4, evening: 0.85, night: 0.6 };
  const bandLevel = ctx.bandLevel ?? 0;

  // Duration scaled by energy, gate, band (deeper = longer)
  const bandMult = 1 + bandLevel * 0.08;
  const durationSec = Math.max(120, Math.round(template.baseDurationMin * 60 * energyMult * gateMult[ctx.gate] * bandMult));

  // Intention: loop's dissolution_path > template default
  let intentionPrompt = template.defaultIntention;
  if (targetLoop?.dissolution_path) {
    intentionPrompt = targetLoop.dissolution_path;
  } else if (targetCapability && ctx.capabilityMap[targetCapability]) {
    const level = ctx.capabilityMap[targetCapability].level;
    // Use band marker for this capability's level
    const capTemplate = PRACTICE_TEMPLATES.find(t => t.primaryCapability === targetCapability);
    if (capTemplate?.bandMarkers[level]) {
      intentionPrompt = capTemplate.bandMarkers[level];
    }
  }

  // Mid-prompts: loop's awareness_markers > template defaults
  let midPrompts = template.defaultMidPrompts;
  if (targetLoop?.awareness_markers?.length) {
    midPrompts = targetLoop.awareness_markers.slice(0, 2);
  } else if (targetCapability) {
    const capState = ctx.capabilityMap[targetCapability];
    if (capState?.signals?.length) {
      midPrompts = capState.signals.slice(0, 2).map(s => `Notice: ${s}`);
    }
  }

  // Closing: loop-aware or band-aware
  let closingPrompt = template.defaultClosing;
  if (targetLoop?.manifestations?.[0]) {
    closingPrompt = `You noticed: ${targetLoop.manifestations[0]}. What shifted?`;
  } else if (targetCapability) {
    const level = ctx.capabilityMap[targetCapability]?.level ?? 0;
    const capTemplate = PRACTICE_TEMPLATES.find(t => t.primaryCapability === targetCapability);
    if (capTemplate?.bandMarkers[level]) {
      closingPrompt = `At this depth: ${capTemplate.bandMarkers[level]}. What did you notice?`;
    }
  }

  return {
    kind,
    durationSec,
    allowMidPrompts: template.allowMid,
    intentionPrompt,
    midPrompts,
    closingPrompt,
    visual: template.visual,
    targetCapability,
    modality,
    dissolvesLoop: targetLoop?.id,
    bandDepth: targetCapability ? template.bandMarkers[ctx.capabilityMap[targetCapability]?.level ?? 0] : undefined,
  };
}

function buildKnowledgeBlocks(
  ctx: OrchestratorContext,
  kind: PracticeKind,
  mode: SessionMode,
  targetLoop?: LoopDefinition,
  targetCapability?: CapabilityId
): { heading: string; body: string }[] | undefined {
  if (mode === "practice" || mode === "reflect") return undefined;

  const teaching = TEACHINGS[kind];
  const bandLevel = ctx.bandLevel ?? 0;
  const blocks: { heading: string; body: string }[] = [];

  // Band-aware teaching body
  const nuance = teaching.bandNuance[bandLevel] || teaching.bandNuance[0];
  const body = `${teaching.body} ${nuance}`;

  blocks.push({ heading: teaching.heading, body });

  // Loop-specific insight
  if (targetLoop) {
    blocks.push({
      heading: `Working with ${targetLoop.name}`,
      body: `${targetLoop.description} It manifests as: ${targetLoop.manifestations.slice(0, 2).join(", ")}. The path: ${targetLoop.dissolution_path}.`,
    });
  }

  // Capability-level marker
  if (targetCapability && ctx.capabilityMap[targetCapability]) {
    const level = ctx.capabilityMap[targetCapability].level;
    const capTemplate = PRACTICE_TEMPLATES.find(t => t.primaryCapability === targetCapability);
    if (capTemplate?.bandMarkers[level + 1]) {
      blocks.push({
        heading: "Next Depth",
        body: capTemplate.bandMarkers[level + 1],
      });
    }
  }

  // Today's theme
  const theme = ctx.todayTheme?.title ?? ctx.lastTheme?.title;
  if (theme) {
    blocks.unshift({
      heading: "Today's Thread",
      body: ctx.todayTheme?.description || ctx.lastTheme?.intention || theme,
    });
  }

  return blocks;
}

function buildGreeting(ctx: OrchestratorContext, sessionNumber: number): string {
  const guru = ctx.guruName ?? "I";
  const name = ctx.userName || "friend";
  const isGuru = !!ctx.guruName;
  const gate = getGateDef(ctx.gate);

  if (sessionNumber === 1) {
    if (ctx.daysSinceLastSession > 7) return `${name}. You're here. That's enough. Let's begin gently.`;
    if (ctx.daysSinceLastSession > 2) return `Welcome back, ${name}. No catching up — just presence.`;
    if (ctx.gate === "morning") return isGuru ? `Good morning, ${name}. ${guru} here. Let's open the day together.` : `Good morning, ${name}. Let's begin.`;
    if (ctx.gate === "midday") return `${name}, a small pause. One breath at a time.`;
    if (ctx.gate === "evening") return `Evening, ${name}. The day is settling. Let's settle with it.`;
    return `Sanctuary, ${name}. Soft and quiet.`;
  }

  const last = ctx.lastSessionToday;
  if (last) {
    return isGuru
      ? `Back again, ${name}. We just sat with ${last.title.toLowerCase()}. Let's go one layer deeper.`
      : `Welcome back. Last time was ${last.title.toLowerCase()}. Let's continue.`;
  }
  return `Round ${sessionNumber}, ${name}. Let's keep the thread alive.`;
}

function buildClosing(ctx: OrchestratorContext, plan: Omit<SessionPlan, "closing">): SessionPlan["closing"] {
  const gate = getGateDef(ctx.gate);
  const mode = plan.mode;

  const prediction =
    mode === "practice"
      ? "You may notice subtle settling for the next 30–60 minutes."
      : mode === "inquiry"
      ? "Insights from inquiry often surface hours later. Watch for them."
      : mode === "teach"
      ? "A teaching lands when the mind is quiet enough to receive it."
      : undefined;

  const nextHint =
    ctx.gate === "morning"
      ? "Midday: a 2-minute presence anchor."
      : ctx.gate === "midday"
      ? "Evening: integration and reflection."
      : ctx.gate === "evening"
      ? "Night: a soft sanctuary practice before sleep."
      : "Tomorrow: we begin again with fresh awareness.";

  return {
    feedbackPrompt: "In one word — what shifted?",
    prediction,
    nextHint,
  };
}

function buildCandidatePlans(ctx: OrchestratorContext): CandidatePlan[] {
  const candidates: CandidatePlan[] = [];
  const gate = getGateDef(ctx.gate);
  const sessionNumber = ctx.sessionsToday + 1;

  // Get active loop details
  const candidateLoops = ctx.activeLoopDetails.filter(l => ctx.activeLoops.includes(l.id));
  const primaryLoop = candidateLoops.sort((a, b) => (ctx.loopSeverity[b.id] || 0) - (ctx.loopSeverity[a.id] || 0))[0];

  // Determine target capability from loop or dimension
  let targetCapability: CapabilityId | undefined;
  let targetModality: TrainingModality | undefined;

  if (primaryLoop) {
    const engine = getEngine();
    const practicesForLoop = engine.practicesForLoop(primaryLoop.id);
    if (practicesForLoop.length > 0) {
      targetCapability = practicesForLoop[0].id.replace("practice::", "") as CapabilityId;
    }
  }

  if (!targetCapability && ctx.weakestDimension) {
    // Find lowest capability in weakest dimension
    let lowest: CapabilityId | null = null;
    let lowestLevel = 99;
    for (const [capId, state] of Object.entries(ctx.capabilityMap)) {
      // Simple heuristic: capability ID contains dimension
      if (capId.includes(ctx.weakestDimension!) && state.level < lowestLevel) {
        lowestLevel = state.level;
        lowest = capId;
      }
    }
    targetCapability = lowest || undefined;
  }

  // Find untrained modality for target capability
  if (targetCapability && ctx.capabilityMap[targetCapability]) {
    const used = ctx.capabilityMap[targetCapability].modalitiesUsed;
    const allModalities: TrainingModality[] = ["game", "practice", "experiment", "reflection"];
    targetModality = allModalities.find(m => !used.includes(m));
  }

  // Generate 3-5 practice kind variants around the primary pick
  const primaryKind = pickPracticeKind(ctx, candidateLoops);
  const variantKinds: PracticeKind[] = [primaryKind];

  // Add loop-category variants
  if (primaryLoop) {
    const loopPractices = LOOP_CATEGORY_TO_PRACTICE[primaryLoop.category] || [];
    for (const k of loopPractices) if (!variantKinds.includes(k)) variantKinds.push(k);
  }

  // Add dimension variants
  if (ctx.weakestDimension) {
    const dimMap: Record<string, PracticeKind[]> = {
      body: ["body", "breath", "loving-kindness"],
      thought: ["witness", "self-inquiry", "open-awareness"],
      emotion: ["loving-kindness", "self-inquiry", "witness"],
      awareness: ["open-awareness", "witness", "mantra-jap"],
    };
    for (const k of dimMap[ctx.weakestDimension] || []) if (!variantKinds.includes(k)) variantKinds.push(k);
  }

  // Cap at 5 variants
  const kindsToTry = variantKinds.slice(0, 5);

  for (const kind of kindsToTry) {
    const mode = pickMode(ctx, kind, sessionNumber);
    const practice = buildPracticeBlock(ctx, kind, primaryLoop, targetCapability, targetModality);
    const knowledge = buildKnowledgeBlocks(ctx, kind, mode, primaryLoop, targetCapability);
    const greeting = buildGreeting(ctx, sessionNumber);

    const titleByMode: Record<SessionMode, string> = {
      teach: "A Short Teaching",
      practice: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} Practice`,
      inquiry: "Self-Inquiry",
      reflect: "Evening Integration",
      blend: sessionNumber === 1 ? "Today's First Sitting" : `Session ${sessionNumber}: ${kind}`,
    };

    const rationale =
      sessionNumber === 1
        ? `${gate.label} opening — ${kind} fits your current state.`
        : `Building on session ${sessionNumber - 1}. ${primaryLoop ? `Loop: ${primaryLoop.name}. ` : ""}Energy ${ctx.energy ?? "medium"}, gate ${ctx.gate}.`;

    const partial: Omit<SessionPlan, "closing"> = {
      id: `orb-${Date.now()}-${kind}`,
      sessionNumber,
      gate: ctx.gate,
      mode,
      title: titleByMode[mode],
      rationale,
      greeting,
      theme: {
        title: ctx.todayTheme?.title || ctx.lastTheme?.title || "Conscious Living",
        intention: ctx.todayTheme?.description || ctx.lastTheme?.intention || "Be where you are. Notice what is.",
      },
      knowledge,
      practice,
      estimatedMinutes: 0,
    };

    const closing = buildClosing(ctx, partial);
    const practiceMin = practice ? Math.ceil(practice.durationSec / 60) : 0;
    const teachMin = knowledge ? knowledge.length * 1 : 0;
    const estimatedMinutes = Math.max(2, practiceMin + teachMin + 1);

    const capabilityGapFilled = targetCapability &&
      ctx.capabilityMap[targetCapability] &&
      targetModality &&
      !ctx.capabilityMap[targetCapability].modalitiesUsed.includes(targetModality);

    candidates.push({
      ...partial,
      closing,
      estimatedMinutes,
      _score: 0,
      _provenance: {
        targetCapability,
        targetLoop: primaryLoop?.id,
        modalityUsed: targetModality,
        bandLevel: ctx.bandLevel,
        matchedLoopCategory: primaryLoop?.category,
        matchedDimension: ctx.weakestDimension,
        capabilityGapFilled,
      },
    });
  }

  return candidates;
}

// ─── Public API ──────────────────────────────────────────────────────────

export function orchestrateSession(ctx: OrchestratorContext): SessionPlan {
  const candidates = buildCandidatePlans(ctx);

  // Score all candidates
  for (const c of candidates) scoreCandidate(c, ctx);

  // Pick highest scored
  const best = candidates.reduce((a, b) => (b._score > a._score ? b : a));

  // Attach provenance for debugging
  const { _score, _provenance, ...plan } = best;

  const frameworkSelection = selectFramework({
    timeBudgetMin: (best.estimatedMinutes || 10),
    energy: ctx.sutraState?.energy === "low" ? "low" : ctx.sutraState?.energy === "high" ? "high" : "medium",
    goal: ctx.weakestDimension ? `${ctx.weakestDimension} awareness` : best.title,
    preferredModalities: best.practice?.modality ? [best.practice.modality === "voice" ? "conversational_ai" : "guided_audio"] : undefined,
  });
  const frameworkBlueprint = buildSessionBlueprint(frameworkSelection.selected, best.estimatedMinutes || 10);

  return {
    ...plan,
    frameworkId: frameworkSelection.selected.id,
    frameworkName: frameworkSelection.selected.name,
    frameworkStages: frameworkBlueprint.stages.map((stage) => stage.stageId),
    provenance: {
      targetCapability: _provenance.targetCapability,
      targetLoop: _provenance.targetLoop,
      modalityUsed: _provenance.modalityUsed,
      bandLevel: _provenance.bandLevel,
      score: _score,
      frameworkId: frameworkSelection.selected.id,
    },
  };
}

// ─── Persistence helpers (unchanged) ────────────────────────────────────

const KEY_PREFIX = "orb-sessions-";

function todayKey() {
  const d = new Date();
  return `${KEY_PREFIX}${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function loadTodaysSessions(): SessionPlan[] {
  try {
    const raw = localStorage.getItem(todayKey());
    if (!raw) return [];
    return JSON.parse(raw) as SessionPlan[];
  } catch {
    return [];
  }
}

export function appendTodaysSession(plan: SessionPlan) {
  const existing = loadTodaysSessions();
  existing.push(plan);
  try {
    localStorage.setItem(todayKey(), JSON.stringify(existing));
  } catch {
    /* quota — ignore */
  }
}

const LAST_THEME_KEY = "orb-last-theme";
export function rememberLastTheme(theme: { title: string; intention: string }) {
  try { localStorage.setItem(LAST_THEME_KEY, JSON.stringify(theme)); } catch { /* ignore */ }
}
export function loadLastTheme(): { title: string; intention: string } | null {
  try {
    const raw = localStorage.getItem(LAST_THEME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}



