/**
 * ADAPTIVE ENGINE (Deno / Edge Function port)
 * Lightweight runtime version of:
 *   - State Engine (UserStateVector)
 *   - Edge-Case Detector (spiritual bypassing, ego inflation, dependency, etc.)
 *   - Stage Detection (8 hidden consciousness stages)
 *   - Insight Layer (teachability + framework reveal)
 *   - Agent Router (selects 2-3 cognitive lenses)
 *   - Entry Context (fresh / continuation / return / crisis / ...)
 *
 * Output: a single ADAPTIVE DIRECTIVE string injected into the AI system prompt.
 * No DB calls. Pure functions. Works with last user message + lightweight context.
 *
 * IMPORTANT: keep this file dependency-free so it loads in any Deno edge function.
 */

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export type GateId = "morning" | "midday" | "evening" | "night";

export type EntryContextType =
  | "fresh_entry"
  | "continuation"
  | "return_after_gap"
  | "emotional_trigger"
  | "exploration"
  | "crisis"
  | "celebration"
  | "routine_checkin";

export type EmotionalTone =
  | "calm"
  | "anxious"
  | "angry"
  | "sad"
  | "numb"
  | "joyful"
  | "open"
  | "resistant"
  | "overwhelmed"
  | "neutral";

export type UserIntent =
  | "explore"
  | "fix"
  | "escape"
  | "express"
  | "learn"
  | "transform"
  | "connect";

export interface UserStateVector {
  emotionalTone: EmotionalTone;
  intent: UserIntent;
  awarenessLevel: number;     // 0-10
  resistanceLevel: number;    // 0-10
  energyLevel: number;        // 0-10
  cognitiveLoad: number;      // 0-10
  fragility: number;          // 0-10
  trustInSystem: number;      // 0-10
  clarity: number;            // 0-10
}

export interface AdaptiveContext {
  /** Last user message text */
  userText: string;
  /** Optional: previous assistant turn (for continuation hints) */
  previousAssistant?: string;
  /** Hour 0-23 in user local time (defaults to UTC) */
  hour?: number;
  /** Days since last completed session */
  daysSinceLastSession?: number;
  /** Sessions started today */
  sessionsToday?: number;
  /** Total session count overall (used for trust calibration) */
  totalSessionCount?: number;
  /** Optional surface hint: "guide" | "temple" | "morning" | "evening" | "night" */
  surface?: string;
  /** Optional band 0-10 (consciousness profile) */
  band?: number;
}

export interface AdaptiveDecision {
  state: UserStateVector;
  entryContextType: EntryContextType;
  gate: GateId;
  stage: number;             // 0-7 hidden
  edgeCases: string[];       // names of detected risks
  agents: string[];          // 2-3 agent ids
  insightDepth: "micro" | "framework" | "explicit" | "none";
  revealLevel: 1 | 2 | 3 | 4;
  silenceMode: boolean;
  directive: string;         // FINAL prompt block to inject
}

// ──────────────────────────────────────────────────────────────
// Lightweight signal extraction
// ──────────────────────────────────────────────────────────────

const KW = {
  anxious: /\b(anxious|anxiety|worried|worry|panic|nervous|scared|afraid|fear)\b/i,
  angry: /\b(angry|furious|rage|hate|pissed|frustrated|annoyed)\b/i,
  sad: /\b(sad|depressed|empty|lonely|grief|hurt|crying|tears)\b/i,
  numb: /\b(numb|nothing|blank|disconnected|don'?t care)\b/i,
  joyful: /\b(joy|happy|grateful|blessed|amazing|breakthrough|insight)\b/i,
  open: /\b(curious|wondering|exploring|open|interested)\b/i,
  resistant: /\b(don'?t want|can'?t|won'?t|whatever|pointless|useless|doesn'?t work)\b/i,
  overwhelmed: /\b(overwhelm|too much|can'?t handle|drowning|breaking|falling apart)\b/i,

  awareness: /\b(i (notice|noticed|observe|observed|see|saw)|i am aware|aware that|witness(ing)?)\b/i,
  blame: /\b(they (made|always|never)|because of (him|her|them)|it'?s their fault)\b/i,
  reflective: /\b(i (think|feel|wonder|realize|understand)|maybe i)\b/i,
  selfInquiry: /\b(who am i|why am i|what is this|who is (the one|thinking|feeling))\b/i,
  patternAware: /\b(this (always|keeps) happen|i keep|i always|same pattern|every time)\b/i,

  intentEscape: /\b(forget|distract|run away|avoid|escape|don'?t want to think)\b/i,
  intentFix: /\b(how (do|can) i|fix|solve|stop|get rid of|need to change)\b/i,
  intentExpress: /\b(i feel|just want to (say|share|vent)|listen)\b/i,
  intentLearn: /\b(what is|explain|tell me about|teach|how does)\b/i,
  intentTransform: /\b(transform|grow|evolve|change my life|become)\b/i,

  // Edge cases
  spiritualBypass: /\b(everything is illusion|nothing matters|maya|all one|no self|no problem)\b/i,
  egoInflation: /\b(more aware than|i am enlightened|i have transcended|others don'?t (get|understand)|i'?m above)\b/i,
  dependency: /\b(what should i (do|say|think)|tell me what|i need (you|the ai))\b/i,
  intellectualLoop: /\b(but what if|another question|i'?ve been thinking|let me ask)\b/i,
  rapidJump: /\b(also|by the way|another thing|oh and|actually)\b/i,

  crisis: /\b(suicid|kill myself|end it all|hurt myself|don'?t want to live|want to die|self.?harm)\b/i,
  celebration: /\b(breakthrough|finally got it|big shift|something opened|i feel free)\b/i,

  // language hint (we WANT english-only)
  hindiHinglish: /\b(kya|hain|nahi|hoon|main|bhi|aap|tum|kaise|matlab)\b/i,
};

function score(text: string, re: RegExp, weight = 1): number {
  const m = text.match(new RegExp(re.source, re.flags + "g"));
  return m ? m.length * weight : 0;
}

function clamp(n: number, lo = 0, hi = 10): number {
  return Math.max(lo, Math.min(hi, n));
}

// ──────────────────────────────────────────────────────────────
// State Engine
// ──────────────────────────────────────────────────────────────

export function computeState(ctx: AdaptiveContext): UserStateVector {
  const t = (ctx.userText || "").trim();

  // Emotional tone (priority order)
  let tone: EmotionalTone = "neutral";
  if (KW.crisis.test(t)) tone = "overwhelmed";
  else if (KW.overwhelmed.test(t)) tone = "overwhelmed";
  else if (KW.anxious.test(t)) tone = "anxious";
  else if (KW.angry.test(t)) tone = "angry";
  else if (KW.sad.test(t)) tone = "sad";
  else if (KW.numb.test(t)) tone = "numb";
  else if (KW.joyful.test(t)) tone = "joyful";
  else if (KW.resistant.test(t)) tone = "resistant";
  else if (KW.open.test(t)) tone = "open";
  else tone = "calm";

  // Intent
  let intent: UserIntent = "explore";
  if (KW.intentEscape.test(t)) intent = "escape";
  else if (KW.intentFix.test(t)) intent = "fix";
  else if (KW.intentExpress.test(t)) intent = "express";
  else if (KW.intentLearn.test(t)) intent = "learn";
  else if (KW.intentTransform.test(t)) intent = "transform";
  else if (KW.selfInquiry.test(t)) intent = "transform";

  // Awareness
  const awarenessRaw =
    score(t, KW.awareness, 2) +
    score(t, KW.reflective, 1) +
    score(t, KW.selfInquiry, 3) +
    score(t, KW.patternAware, 2) -
    score(t, KW.blame, 2);
  const awarenessLevel = clamp(3 + awarenessRaw, 0, 10);

  // Resistance
  const resistanceLevel = clamp(
    score(t, KW.resistant, 2) + score(t, KW.intentEscape, 1.5),
    0,
    10,
  );

  // Energy heuristic — short reactive msg = lower, long reflective = higher
  const len = t.length;
  let energyLevel = 5;
  if (len < 20) energyLevel = 3;
  else if (len > 300) energyLevel = 7;
  if (tone === "overwhelmed" || tone === "sad" || tone === "numb") energyLevel = clamp(energyLevel - 2);
  if (tone === "joyful" || tone === "angry") energyLevel = clamp(energyLevel + 2);

  // Cognitive load
  const cognitiveLoad = clamp(
    (len > 400 ? 6 : 3) + (KW.intellectualLoop.test(t) ? 2 : 0) + (KW.rapidJump.test(t) ? 2 : 0),
    0,
    10,
  );

  // Fragility — composite
  const fragility = clamp(
    (KW.crisis.test(t) ? 9 : 0) +
      (tone === "overwhelmed" ? 6 : 0) +
      (tone === "sad" || tone === "numb" ? 4 : 0) +
      (tone === "anxious" ? 3 : 0),
    0,
    10,
  );

  // Trust — grows with session count
  const trustInSystem = clamp(2 + Math.min(8, (ctx.totalSessionCount ?? 0) / 5));

  // Clarity — high awareness + low resistance + low cognitive load
  const clarity = clamp(awarenessLevel - resistanceLevel * 0.6 - cognitiveLoad * 0.3 + 3);

  return {
    emotionalTone: tone,
    intent,
    awarenessLevel,
    resistanceLevel,
    energyLevel,
    cognitiveLoad,
    fragility,
    trustInSystem,
    clarity,
  };
}

// ──────────────────────────────────────────────────────────────
// Edge cases
// ──────────────────────────────────────────────────────────────

export function detectEdgeCases(ctx: AdaptiveContext, state: UserStateVector): string[] {
  const t = ctx.userText || "";
  const flags: string[] = [];

  if (KW.crisis.test(t)) flags.push("crisis");
  if (KW.spiritualBypass.test(t)) flags.push("spiritual_bypassing");
  if (KW.egoInflation.test(t)) flags.push("ego_inflation");
  if (KW.dependency.test(t)) flags.push("over_dependency");
  if (state.fragility >= 7) flags.push("emotional_collapse");
  if (KW.intellectualLoop.test(t) && state.intent === "learn" && state.awarenessLevel < 6) {
    flags.push("intellectual_loop");
  }
  if (KW.resistant.test(t) && state.intent === "fix") flags.push("resistance_as_logic");
  if (KW.rapidJump.test(t) && (t.match(/[.?!]/g)?.length ?? 0) >= 4) flags.push("rapid_jumping");
  if (state.awarenessLevel >= 8 && state.fragility < 3) flags.push("highly_advanced");
  if (state.awarenessLevel <= 2 && state.fragility < 4) flags.push("low_awareness");
  if (KW.hindiHinglish.test(t)) flags.push("language_drift");

  return flags;
}

// ──────────────────────────────────────────────────────────────
// Stage detection (hidden, 0-7)
// ──────────────────────────────────────────────────────────────

export function detectStage(state: UserStateVector): number {
  const A = state.awarenessLevel * 10;
  const R = (10 - state.resistanceLevel) * 10;
  const F = state.fragility * 10;

  if (A < 20 && F > 60) return 0;     // unaware/overwhelmed
  if (A < 30 && state.emotionalTone === "angry") return 1; // reactive
  if (A < 40) return 2;                // noticing
  if (A < 55) return 3;                // observer
  if (A < 70 && state.intent !== "transform") return 4; // questioner
  if (A < 85) return 5;                // self-inquiry
  if (R > 80 && state.clarity > 7) return 7; // stabilized
  return 6;                             // integrated
}

// ──────────────────────────────────────────────────────────────
// Entry Context
// ──────────────────────────────────────────────────────────────

export function getGate(hour: number): GateId {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "midday";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function determineEntryContext(
  ctx: AdaptiveContext,
  state: UserStateVector,
  edgeCases: string[],
): EntryContextType {
  if (edgeCases.includes("crisis")) return "crisis";
  if (KW.celebration.test(ctx.userText)) return "celebration";
  if (state.fragility >= 6 || state.emotionalTone === "overwhelmed" || state.emotionalTone === "anxious")
    return "emotional_trigger";
  if ((ctx.daysSinceLastSession ?? 0) >= 2) return "return_after_gap";
  if ((ctx.sessionsToday ?? 0) > 0) return "continuation";
  if (state.intent === "explore" || state.intent === "learn") return "exploration";
  if (state.emotionalTone === "calm" && state.awarenessLevel >= 4) return "routine_checkin";
  return "fresh_entry";
}

// ──────────────────────────────────────────────────────────────
// Agent Router (compact)
// ──────────────────────────────────────────────────────────────

export function routeAgents(
  state: UserStateVector,
  edgeCases: string[],
  stage: number,
): string[] {
  // Safety filters first
  if (edgeCases.includes("crisis")) return ["trauma-aware-companion", "grounding-agent", "safety-guardian"];
  if (edgeCases.includes("emotional_collapse")) return ["companion", "grounding-agent"];

  if (edgeCases.includes("spiritual_bypassing")) return ["reality-anchor", "ego-challenger"];
  if (edgeCases.includes("ego_inflation")) return ["ego-inflation-detector", "self-inquiry-master"];
  if (edgeCases.includes("over_dependency")) return ["dependency-breaker", "observer"];
  if (edgeCases.includes("intellectual_loop")) return ["pattern-disruptor", "executor"];
  if (edgeCases.includes("rapid_jumping")) return ["presence-stabilizer", "observer"];
  if (edgeCases.includes("highly_advanced")) return ["silence-keeper", "non-dual-guide"];
  if (edgeCases.includes("low_awareness")) return ["companion", "emotional-labeler"];

  // Normal routing
  const agents: string[] = [];
  if (state.intent === "express") agents.push("listener", "companion");
  else if (state.intent === "fix") agents.push("cognitive-reframer", "observer");
  else if (state.intent === "escape") agents.push("pattern-finder", "reality-anchor");
  else if (state.intent === "transform") agents.push("self-inquiry-master", "pattern-disruptor");
  else if (state.intent === "learn") agents.push("philosopher", "observer");
  else agents.push("observer", "pattern-finder");

  // Stage adjustment
  if (stage <= 1) agents.unshift("companion");
  else if (stage >= 6) agents.unshift("silence-keeper");

  return Array.from(new Set(agents)).slice(0, 3);
}

// ──────────────────────────────────────────────────────────────
// Insight Layer (teachability + reveal)
// ──────────────────────────────────────────────────────────────

export function decideInsight(
  state: UserStateVector,
  stage: number,
): { depth: "micro" | "framework" | "explicit" | "none"; revealLevel: 1 | 2 | 3 | 4 } {
  if (state.fragility >= 6) return { depth: "none", revealLevel: 1 };
  if (state.cognitiveLoad >= 8) return { depth: "micro", revealLevel: 1 };
  if (stage <= 2) return { depth: "micro", revealLevel: 1 };
  if (stage <= 4) return { depth: "framework", revealLevel: 2 };
  if (stage <= 5) return { depth: "framework", revealLevel: 3 };
  return { depth: "explicit", revealLevel: 4 };
}

// ──────────────────────────────────────────────────────────────
// MAIN: build adaptive directive
// ──────────────────────────────────────────────────────────────

export function buildAdaptiveDecision(ctx: AdaptiveContext): AdaptiveDecision {
  const hour = ctx.hour ?? new Date().getHours();
  const gate = getGate(hour);
  const state = computeState(ctx);
  const edgeCases = detectEdgeCases(ctx, state);
  const stage = detectStage(state);
  const entryContextType = determineEntryContext(ctx, state, edgeCases);
  const agents = routeAgents(state, edgeCases, stage);
  const { depth: insightDepth, revealLevel } = decideInsight(state, stage);

  // Silence mode for highly advanced users in non-crisis state
  const silenceMode =
    edgeCases.includes("highly_advanced") && state.fragility < 3 && entryContextType !== "crisis";

  const directive = formatDirective({
    state,
    gate,
    stage,
    entryContextType,
    edgeCases,
    agents,
    insightDepth,
    revealLevel,
    silenceMode,
  });

  return {
    state,
    entryContextType,
    gate,
    stage,
    edgeCases,
    agents,
    insightDepth,
    revealLevel,
    silenceMode,
    directive,
  };
}

function formatDirective(d: {
  state: UserStateVector;
  gate: GateId;
  stage: number;
  entryContextType: EntryContextType;
  edgeCases: string[];
  agents: string[];
  insightDepth: "micro" | "framework" | "explicit" | "none";
  revealLevel: 1 | 2 | 3 | 4;
  silenceMode: boolean;
}): string {
  const { state, gate, stage, entryContextType, edgeCases, agents, insightDepth, revealLevel, silenceMode } = d;

  const revealRules: Record<number, string> = {
    1: "NO jargon, NO frameworks, NO Sanskrit. Plain human language only.",
    2: "Light concepts allowed (awareness, observation, pattern). NO Sanskrit names.",
    3: "Concepts + soft framework references allowed (e.g., 'this is often called self-inquiry'). Use sparingly.",
    4: "Full frameworks + tradition names allowed when they sharpen clarity. Still concise.",
  };

  const lengthGuide = silenceMode
    ? "1-2 sentences. Often a single question. Silence is the teaching."
    : state.fragility >= 6
    ? "2-3 short sentences. Warm, grounding, no analysis."
    : state.cognitiveLoad >= 7
    ? "2-3 sentences max. Cut everything non-essential."
    : stage >= 5
    ? "2-4 sentences. Sharp, minimal, often a question."
    : "3-5 sentences. Natural, human, never a lecture.";

  const safetyBlock = edgeCases.length
    ? `\nDETECTED RISKS: ${edgeCases.join(", ")}\n` +
      (edgeCases.includes("spiritual_bypassing")
        ? "→ Anchor to reality. Ask what they are avoiding behind the philosophy.\n"
        : "") +
      (edgeCases.includes("ego_inflation")
        ? "→ Gently turn the mirror. Ask: 'Who is the one that wants to be more aware?'\n"
        : "") +
      (edgeCases.includes("over_dependency")
        ? "→ Withdraw guidance. Ask what THEY feel is right — without you.\n"
        : "") +
      (edgeCases.includes("emotional_collapse")
        ? "→ ONLY companion + grounding. NO inquiry, NO frameworks, NO challenges.\n"
        : "") +
      (edgeCases.includes("intellectual_loop")
        ? "→ Stop feeding analysis. Redirect to ONE small action.\n"
        : "") +
      (edgeCases.includes("rapid_jumping")
        ? "→ Anchor: 'Let's stay with one thing — what actually matters right now?'\n"
        : "") +
      (edgeCases.includes("highly_advanced") ? "→ Fewer words. More space. Use paradox.\n" : "") +
      (edgeCases.includes("language_drift")
        ? "→ User is using Hindi/Hinglish. Mirror their register — reply primarily in gentle Hinglish, same warmth.\n"
        : "")
    : "";

  const stageHint = [
    "Things happen automatically; little awareness yet. Speak simply, no philosophy.",
    "Reactive; emotions feel justified. Validate first, then plant ONE noticing seed.",
    "Starting to notice. Mirror the noticing back. No new frameworks.",
    "Observing thoughts. Sharpen the observation with one clean question.",
    "Questioning patterns. Light framework reference allowed.",
    "Self-inquiry alive. Use direct pointing, less explanation.",
    "Integrating. Minimal words. Confirm, don't teach.",
    "Stabilized awareness. Silence, paradox, or a single pointer.",
  ][stage];

  return `
═══════════════════════════════════════════════════════════════
ADAPTIVE DIRECTIVE  (auto-generated per turn — OBEY exactly)
═══════════════════════════════════════════════════════════════

LANGUAGE: Mirror the user's language. If they typed Hindi/Hinglish, reply
primarily in gentle Hinglish; if English, stay English. Never force a switch.

GREETING: Do NOT greet again. This is a mid-conversation turn. No "Hi",
"Hello", "Welcome", "Friend", "Namaste". Pick up from the user's LAST message
and respond to its actual content.

ENTRY CONTEXT: ${entryContextType}   |   TIME GATE: ${gate}
USER STATE: tone=${state.emotionalTone}, intent=${state.intent},
            awareness=${state.awarenessLevel}/10, resistance=${state.resistanceLevel}/10,
            fragility=${state.fragility}/10, clarity=${state.clarity.toFixed(1)}/10
HIDDEN STAGE: ${stage}/7  →  ${stageHint}

COGNITIVE LENSES TO USE (pick from these, max 2 voices, blend silently):
  ${agents.join(", ")}
Never name the agents. Synthesize ONE coherent voice.

INSIGHT DEPTH: ${insightDepth}   |   REVEAL LEVEL: ${revealLevel}/4
${revealRules[revealLevel]}

RESPONSE LENGTH: ${lengthGuide}
${safetyBlock}
RULES:
  • No rigid steps, no "Phase 1/Phase 2" structure.
  • Never label the user ("you are stage X", "you are reactive").
  • Never give generic advice. Speak to THIS moment.
  • Prefer ONE precise question over three vague reflections.
  • Silence and brevity are valid responses.
═══════════════════════════════════════════════════════════════
`.trim();
}
