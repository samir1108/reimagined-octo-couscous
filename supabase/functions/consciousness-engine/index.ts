import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  calculateVLevel,
  computeWitnessQuality,
  computeLoopPenalty,
  computeIntegrationScoreV2,
  applyTimeDecay,
  getDimensionCap,
  BANDS,
  getBandInfo,
  type ProfileForVLevel,
  type DimensionScores,
  type LoopSeverity,
} from "../_shared/vLevel.ts";

/** Coerce the stored dimension bands into plain numeric scores. */
function normalizeDimensionBands(raw: unknown): DimensionScores {
  const bands = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    thought: Number(bands.thought) || 0,
    emotion: Number(bands.emotion) || 0,
    body: Number(bands.body) || 0,
    awareness: Number(bands.awareness) || 0,
    action: Number(bands.action) || 0,
    connection: Number(bands.connection) || 0,
    spirit: Number(bands.spirit) || 0,
  };
}

/** Canonical V-Level for a stored profile row. */
function computeVLevel(profile: Record<string, any>): number {
  return calculateVLevel(
    normalizeDimensionBands(profile.dimension_bands),
    profile as ProfileForVLevel,
  ).value;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════
// LOOP → SAMSKARA CLUSTER MAPPING (EXPANDED)
// ═══════════════════════════════════════════
const LOOP_CLUSTER_MAP: Record<string, { root_wound: string; chakras: string[] }> = {
  // 7 core loops
  origin_loop: { root_wound: "separation", chakras: ["crown"] },
  worth_loop: { root_wound: "unworthiness", chakras: ["solar", "heart"] },
  safety_loop: { root_wound: "unsafety", chakras: ["root"] },
  power_loop: { root_wound: "powerlessness", chakras: ["solar"] },
  connection_loop: { root_wound: "abandonment", chakras: ["heart"] },
  identity_loop: { root_wound: "identity_fixation", chakras: ["throat", "third_eye"] },
  compulsion_loop: { root_wound: "inner_void", chakras: ["sacral"] },
  // Extended category loops
  validation_loop: { root_wound: "unworthiness", chakras: ["solar", "heart"] },
  control_loop: { root_wound: "unsafety", chakras: ["solar", "root"] },
  avoidance_loop: { root_wound: "inner_void", chakras: ["sacral", "root"] },
  attachment_loop: { root_wound: "abandonment", chakras: ["heart", "sacral"] },
  comparison_loop: { root_wound: "unworthiness", chakras: ["solar"] },
  narrative_loop: { root_wound: "identity_fixation", chakras: ["throat"] },
  survival_loop: { root_wound: "unsafety", chakras: ["root"] },
  body_loop: { root_wound: "disconnection", chakras: ["root", "sacral"] },
  energy_loop: { root_wound: "inner_void", chakras: ["sacral", "solar"] },
  emotional_loop: { root_wound: "abandonment", chakras: ["heart", "sacral"] },
  mental_loop: { root_wound: "identity_fixation", chakras: ["third_eye"] },
  behavioral_loop: { root_wound: "inner_void", chakras: ["sacral"] },
  relationship_loop: { root_wound: "abandonment", chakras: ["heart"] },
  ego_loop: { root_wound: "identity_fixation", chakras: ["solar", "third_eye"] },
  belief_loop: { root_wound: "identity_fixation", chakras: ["third_eye", "crown"] },
  cognitive_bias_loop: { root_wound: "identity_fixation", chakras: ["third_eye"] },
  spiritual_loop: { root_wound: "separation", chakras: ["crown", "third_eye"] },
  purpose_loop: { root_wound: "separation", chakras: ["crown", "solar"] },
};
// ═══════════════════════════════════════════
function computeChakras(profile: any): Record<string, number> {
  const d = profile.dimension_bands || { thought: 0, emotion: 0, body: 0, awareness: 0 };
  const severity = profile.loop_severity || {};
  const has = (loop: string) => severity[loop] === "acute" || severity[loop] === "active";

  return {
    root: ((d.body * 0.6 + d.emotion * 0.15 + d.awareness * 0.15 + d.thought * 0.1) / 7) * (has("safety_loop") || has("survival_loop") ? 0.85 : 1),
    sacral: ((d.emotion * 0.5 + d.body * 0.3 + d.awareness * 0.2) / 7) * (has("compulsion_loop") || has("attachment_loop") ? 0.85 : 1),
    solar: ((d.thought * 0.4 + d.emotion * 0.3 + d.body * 0.3) / 7) * (has("worth_loop") || has("power_loop") || has("validation_loop") ? 0.85 : 1),
    heart: ((d.emotion * 0.5 + d.awareness * 0.3 + d.body * 0.1 + d.thought * 0.1) / 7) * (has("connection_loop") || has("emotional_loop") ? 0.85 : 1),
    throat: ((d.thought * 0.4 + d.emotion * 0.3 + d.awareness * 0.3) / 7) * (has("identity_loop") || has("narrative_loop") ? 0.85 : 1),
    third_eye: ((d.awareness * 0.6 + d.thought * 0.3 + d.emotion * 0.1) / 7) * (has("cognitive_bias_loop") ? 0.85 : 1),
    crown: ((d.awareness * 0.7 + d.thought * 0.1 + d.emotion * 0.1 + d.body * 0.1) / 7) * (has("origin_loop") || has("spiritual_loop") ? 0.85 : 1),
  };
}

// ═══════════════════════════════════════════
// ARCHETYPE DETECTION (§18)
// ═══════════════════════════════════════════
function detectArchetype(dims: any): string {
  const t = dims.thought || 0, e = dims.emotion || 0, b = dims.body || 0, a = dims.awareness || 0;
  if (t >= 3 && e <= 1) return "intellectualizer";
  if (e >= 3 && t <= 1) return "feeler";
  if (b >= 3 && t <= 1 && e <= 1) return "athlete";
  if (a >= 3 && t <= 1 && e <= 1 && b <= 1) return "dissociator";
  if (t <= 1 && e <= 1 && b <= 1 && a <= 1) return "sleeper";
  if (t >= 4 && e >= 4 && b >= 4 && a >= 4) return "adept";
  const spread = Math.max(t, e, b, a) - Math.min(t, e, b, a);
  if (spread <= 1) return "balanced";
  return "seeker";
}

// ═══════════════════════════════════════════
// BYPASSING RISK DETECTION (§14 — all 5 patterns)
// ═══════════════════════════════════════════
function computeBypassingRisk(profile: any): number {
  const d = profile.dimension_bands || {};
  let risk = 0;
  if ((d.thought || 0) > (d.emotion || 0) + 2) risk += 0.3;
  if ((d.emotion || 0) < 1.5 && (profile.streak_current || 0) > 7 && (d.thought || 0) > 2) risk += 0.25;
  if ((profile.journey_day || 1) < 30 && (profile.v_level_peak || 0) > 4) risk += 0.35;
  const bodyEmotionAvg = ((d.body || 0) + (d.emotion || 0)) / 2;
  const thoughtAwarenessAvg = ((d.thought || 0) + (d.awareness || 0)) / 2;
  if (thoughtAwarenessAvg > bodyEmotionAvg + 1.5) risk += 0.2;
  const loopSev = profile.loop_severity || {};
  if ((loopSev.worth_loop === "active" || loopSev.safety_loop === "active") &&
      (profile.h_capacities?.compassion || 0) > 5) {
    risk += 0.15;
  }
  return Math.min(1, parseFloat(risk.toFixed(2)));
}

// ═══════════════════════════════════════════
// STATE DETECTION (§13)
// ═══════════════════════════════════════════
function detectState(profile: any, vLevelCurrent: number): string {
  const baseline = profile.v_level_baseline || 0;
  if (vLevelCurrent < baseline - 0.5) return "dark_night";
  if (profile.bypassing_risk > 0.4) return "bypassing";
  const journeyDay = profile.journey_day || 1;
  const currentBand = Math.floor(baseline);
  if (currentBand < 7) {
    const expectedDays = [7, 14, 30, 60, 90, 180, 365][currentBand] || 30;
    if (journeyDay > expectedDays * 2 && Math.floor(vLevelCurrent) === currentBand) {
      return "plateau";
    }
  }
  if (vLevelCurrent > baseline + 0.3) return "breakthrough";
  return "normal";
}

// ═══════════════════════════════════════════
// CIRCADIAN PROFILE UPDATE & APPLICATION
// ═══════════════════════════════════════════
function updateCircadianProfile(profile: any, timeSlot: string): any {
  const circadian = { ...(profile.circadian_profile || {}) };
  const slotCounts = circadian.slot_counts || { morning: 0, midday: 0, evening: 0, night: 0 };
  slotCounts[timeSlot] = (slotCounts[timeSlot] || 0) + 1;
  circadian.slot_counts = slotCounts;

  // Determine peak practice time
  const sorted = Object.entries(slotCounts).sort(([, a]: any, [, b]: any) => b - a);
  circadian.peak_practice_time = sorted[0]?.[0] || null;

  // Natural rhythm detection (from session patterns)
  const total = Object.values(slotCounts).reduce((a: number, b: any) => a + b, 0);
  if (total > 10) {
    const morningRatio = (slotCounts.morning || 0) / total;
    const eveningRatio = (slotCounts.evening || 0) / total;
    circadian.natural_rhythm = morningRatio > 0.5 ? "morning_person"
      : eveningRatio > 0.5 ? "evening_person"
      : "flexible";
  }

  // Consistency score: how regular is their practice timing
  if (total > 5) {
    const maxSlot = Math.max(...Object.values(slotCounts) as number[]);
    circadian.consistency_score = parseFloat((maxSlot / total).toFixed(2));
  }

  // Dimension sensitivity by time of day (emergent from data)
  // Some people process emotions better at night, think better in morning
  circadian.dimension_sensitivity = circadian.dimension_sensitivity || {};

  return circadian;
}

// Get circadian dimension boost for current time slot
function getCircadianDimensionBoost(circadian: any, timeSlot: string): Record<string, number> {
  // Default time-of-day tendencies (backed by chronobiology research)
  const defaults: Record<string, Record<string, number>> = {
    morning: { thought: 0.02, emotion: 0.0, body: 0.01, awareness: 0.01 },
    midday: { thought: 0.01, emotion: 0.0, body: 0.02, awareness: 0.0 },
    evening: { thought: 0.0, emotion: 0.02, body: 0.0, awareness: 0.01 },
    night: { thought: 0.0, emotion: 0.01, body: 0.0, awareness: 0.02 },
  };

  return defaults[timeSlot] || { thought: 0, emotion: 0, body: 0, awareness: 0 };
}

// ═══════════════════════════════════════════
// DIMENSION-SPECIFIC BAND LANGUAGE (Enhancement #6)
// ═══════════════════════════════════════════
function getDimensionBandInfo(dimensionBand: number): { vocab: string[]; avoid: string[] } {
  const band = Math.min(7, Math.max(0, Math.floor(dimensionBand)));
  return {
    vocab: BANDS[band]?.vocab || BANDS[0].vocab,
    avoid: BANDS[band]?.avoid || BANDS[0].avoid,
  };
}

// ═══════════════════════════════════════════
// GUIDE CONTEXT BUILDER (Band-appropriate per dimension)
// ═══════════════════════════════════════════
function buildGuideContext(profile: any, vLevel: number, state: string, timeSlot: string) {
  const band = Math.min(7, Math.floor(vLevel));
  const bandInfo = BANDS[band];
  const dims = profile.dimension_bands || {};
  const vals = Object.entries(dims).sort(([, a]: any, [, b]: any) => a - b);
  const weakest = vals[0]?.[0] || "awareness";
  const secondWeakest = vals[1]?.[0] || "body";
  const strongest = vals[vals.length - 1]?.[0] || "thought";

  const activeLoops = profile.active_loops || [];
  const archetype = profile.archetype || "seeker";
  const yogaPath = profile.dominant_path || "jnana";
  const journeyDay = profile.journey_day || 1;
  const vritti = profile.chitta_vritti || "vikshipta";

  // Per-dimension band info for language adaptation
  const thoughtBand = getDimensionBandInfo(dims.thought || 0);
  const emotionBand = getDimensionBandInfo(dims.emotion || 0);
  const bodyBand = getDimensionBandInfo(dims.body || 0);
  const awarenessBand = getDimensionBandInfo(dims.awareness || 0);

  const dimStr = Object.entries(dims).map(([k, v]) => `${k}: ${(v as number).toFixed(1)} (Band ${Math.floor(v as number)})`).join(", ");

  let tone = "warm";
  if (state === "dark_night") tone = "gentle, nurturing, holding space";
  else if (state === "bypassing") tone = "grounding, direct but kind";
  else if (state === "breakthrough") tone = "celebrating, spacious";
  else if (state === "plateau") tone = "curious, gently challenging";
  else if (band <= 1) tone = "warm, encouraging, accessible";
  else if (band >= 5) tone = "spacious, minimal, reverential";

  const topicsToExplore: string[] = [];
  const topicsToAvoid = [...bandInfo.avoid];

  if (weakest === "emotion") topicsToExplore.push("emotional awareness", "what feelings are present");
  if (weakest === "body") topicsToExplore.push("body sensations", "physical presence");
  if (weakest === "thought") topicsToExplore.push("thought observation", "mental patterns");
  if (weakest === "awareness") topicsToExplore.push("meta-awareness", "noticing the noticer");

  if (activeLoops.includes("worth_loop") || activeLoops.includes("validation_loop")) topicsToExplore.push("self-compassion", "inherent worth");
  if (activeLoops.includes("safety_loop") || activeLoops.includes("survival_loop")) topicsToExplore.push("grounding", "safety in the present");
  if (activeLoops.includes("connection_loop") || activeLoops.includes("relationship_loop")) topicsToExplore.push("connection", "belonging");
  if (activeLoops.includes("avoidance_loop")) topicsToExplore.push("facing what's being avoided", "gentle confrontation");
  if (activeLoops.includes("control_loop")) topicsToExplore.push("surrendering control", "trusting the process");

  // Circadian context
  const circadian = profile.circadian_profile || {};
  const circadianNote = circadian.peak_practice_time
    ? `User's peak practice time: ${circadian.peak_practice_time}. Current slot: ${timeSlot}.`
    : "";

  const preamble = `--- CONSCIOUSNESS ENGINE V2.1 CONTEXT ---
User Profile:
  Journey Day: ${journeyDay} | Overall Band: ${band} (${bandInfo.name}) | V-Level: ${vLevel.toFixed(2)}
  State: ${state} | Archetype: ${archetype}
  Dimensions: ${dimStr}
  Weakest: ${weakest} | Strongest: ${strongest}
  Active Loops: ${activeLoops.length > 0 ? activeLoops.join(", ") : "none detected"}
  Chitta Vritti: ${vritti}
  Yoga Path Affinity: ${yogaPath}
  Witness Quality: gap=${(profile.witness_gap || 0).toFixed(2)} stability=${(profile.witness_stability || 0).toFixed(2)} depth=${(profile.witness_depth || 0).toFixed(2)}
  Integration Score: ${(profile.integration_score || 0).toFixed(2)}
  ${circadianNote}

CRITICAL — DIMENSION-SPECIFIC LANGUAGE RULES:
  When discussing THOUGHT topics (thinking, beliefs, analysis):
    - User is at Band ${Math.floor(dims.thought || 0)} for thought
    - Use vocabulary: ${thoughtBand.vocab.join(", ")}
    - Avoid: ${thoughtBand.avoid.join(", ")}
  When discussing EMOTION topics (feelings, relationships, heart):
    - User is at Band ${Math.floor(dims.emotion || 0)} for emotion
    - Use vocabulary: ${emotionBand.vocab.join(", ")}
    - Avoid: ${emotionBand.avoid.join(", ")}
  When discussing BODY topics (sensations, energy, physical):
    - User is at Band ${Math.floor(dims.body || 0)} for body
    - Use vocabulary: ${bodyBand.vocab.join(", ")}
    - Avoid: ${bodyBand.avoid.join(", ")}
  When discussing AWARENESS topics (observation, witness, meta):
    - User is at Band ${Math.floor(dims.awareness || 0)} for awareness
    - Use vocabulary: ${awarenessBand.vocab.join(", ")}
    - Avoid: ${awarenessBand.avoid.join(", ")}

Overall Tone: ${tone}
Topics to explore: ${topicsToExplore.join(", ")}

${state === "dark_night" ? `
⚠️ USER IS IN DARK NIGHT STATE
- Do NOT push growth. Hold space.
- Reduce complexity. Be simple and present.
- Acknowledge difficulty without fixing.
- Say things like "This is part of the journey" and "You're not going backward."
- Maximum gentleness.` : ""}

${state === "bypassing" ? `
⚠️ SPIRITUAL BYPASSING RISK DETECTED
- Gently redirect to avoided dimensions (likely emotion/body).
- Don't accuse — explore with curiosity.
- Ask questions like "When was the last time something really moved you emotionally?"
- Ground the conversation in lived experience, not concepts.` : ""}

${state === "plateau" ? `
📊 USER IS ON A PLATEAU
- Introduce gentle challenges.
- Try a different approach than usual.
- If they usually do Jnana tasks, suggest Karma/Bhakti.
- "Sometimes growth happens when we try something unfamiliar."` : ""}

${timeSlot === "morning" ? `Morning session: Set intention, explore ${weakest} awareness, introduce today's focus.` : ""}
${timeSlot === "midday" ? `Midday check-in: Brief, grounding. How is ${weakest} dimension showing up today?` : ""}
${timeSlot === "evening" ? `Evening reflection: Harvest the day's insights. What did they notice about ${weakest}?` : ""}
${timeSlot === "night" ? `Night session: Gentle wind-down. No pushing. Prepare for rest.` : ""}
--- END ENGINE CONTEXT ---`;

  return {
    preamble,
    tone,
    topics_to_explore: topicsToExplore,
    topics_to_avoid: topicsToAvoid,
    language_level: `band_${band}`,
    band,
    bandName: bandInfo.name,
    dimensionLanguage: {
      thought: { band: Math.floor(dims.thought || 0), ...thoughtBand },
      emotion: { band: Math.floor(dims.emotion || 0), ...emotionBand },
      body: { band: Math.floor(dims.body || 0), ...bodyBand },
      awareness: { band: Math.floor(dims.awareness || 0), ...awarenessBand },
    },
  };
}

// ═══════════════════════════════════════════
// TASK GENERATION (§19 — with yoga path ratio)
// ═══════════════════════════════════════════
function generateTasks(profile: any, vLevel: number, state: string) {
  const band = Math.floor(vLevel);
  const dims = profile.dimension_bands || {};
  const sorted = Object.entries(dims).sort(([, a]: any, [, b]: any) => a - b);
  const weakest = sorted[0]?.[0] || "awareness";
  const secondWeakest = sorted[1]?.[0] || "body";
  const strongest = sorted[sorted.length - 1]?.[0] || "thought";
  
  const yogaPaths = profile.yoga_path_affinity || { karma: 0, bhakti: 0, jnana: 0, raja: 0 };
  const sortedPaths = Object.entries(yogaPaths).sort(([, a]: any, [, b]: any) => b - a);
  const dominantPath = sortedPaths[0]?.[0] || "jnana";
  const secondaryPath = sortedPaths[1]?.[0] || "raja";
  const weakestPath = sortedPaths[3]?.[0] || "karma";

  let taskCount = Math.min(6, Math.max(1, band < 2 ? 2 : band < 4 ? 3 : band < 6 ? 4 : 2));
  if (state === "dark_night") taskCount = 1;
  if (state === "breakthrough") taskCount = 2;

  const taskTemplates: Record<string, Record<string, any[]>> = {
    thought: {
      jnana: [
        { title: "Question one belief you hold today — where did it come from?", type: "inquiry", minutes: 10 },
        { title: "Read something that challenges your worldview", type: "inquiry", minutes: 15 },
      ],
      karma: [
        { title: "Do one task mindfully, watching every thought that arises", type: "action", minutes: 15 },
        { title: "Write down 3 assumptions you made today — question each one", type: "action", minutes: 10 },
      ],
      bhakti: [
        { title: "Write a letter of gratitude to someone who challenged your thinking", type: "devotion", minutes: 10 },
      ],
      raja: [
        { title: "10-minute thought-watching meditation — count your thoughts", type: "meditation", minutes: 10 },
        { title: "Practice labeling thoughts as 'useful' or 'story' for an hour", type: "meditation", minutes: 60 },
      ],
    },
    emotion: {
      jnana: [
        { title: "Name the exact emotion you feel right now — go beyond 'fine'", type: "inquiry", minutes: 5 },
      ],
      karma: [
        { title: "Express one unexpressed emotion to someone today", type: "action", minutes: 10 },
      ],
      bhakti: [
        { title: "Let yourself fully feel gratitude for something small", type: "devotion", minutes: 5 },
        { title: "Write about someone you love — let the feeling flow", type: "devotion", minutes: 10 },
      ],
      raja: [
        { title: "Sit with an uncomfortable emotion for 5 minutes without fixing it", type: "meditation", minutes: 5 },
      ],
    },
    body: {
      jnana: [
        { title: "Scan your body — where is tension hiding? What message does it carry?", type: "inquiry", minutes: 10 },
      ],
      karma: [
        { title: "Move your body in a way that feels good — no rules", type: "action", minutes: 15 },
        { title: "Eat one meal in complete silence, tasting every bite", type: "action", minutes: 20 },
      ],
      bhakti: [
        { title: "Thank your body for carrying you through today", type: "devotion", minutes: 5 },
      ],
      raja: [
        { title: "Body scan meditation — from toes to crown", type: "meditation", minutes: 15 },
        { title: "Breathwork: 4-7-8 breathing for 5 minutes", type: "meditation", minutes: 5 },
      ],
    },
    awareness: {
      jnana: [
        { title: "Ask 'Who is the one observing right now?' — sit with the question", type: "inquiry", minutes: 10 },
        { title: "Notice what you're aware of — then notice the awareness itself", type: "inquiry", minutes: 5 },
      ],
      karma: [
        { title: "Catch yourself in autopilot 3 times today — pause and notice", type: "action", minutes: 0 },
      ],
      bhakti: [
        { title: "Sit in awe of something natural — sunset, tree, sky", type: "devotion", minutes: 10 },
      ],
      raja: [
        { title: "Open awareness meditation — no focus point, just be", type: "meditation", minutes: 15 },
        { title: "Practice the gap between two thoughts", type: "meditation", minutes: 10 },
      ],
    },
  };

  const tasks: any[] = [];

  // 60% weakest dimension tasks, split between dominant and weakest yoga path
  const weakDimTemplates = taskTemplates[weakest] || {};
  const dominantTasks = weakDimTemplates[dominantPath] || weakDimTemplates.jnana || [];
  const weakPathTasks = weakDimTemplates[weakestPath] || weakDimTemplates.karma || [];

  if (dominantTasks.length > 0) tasks.push({
    ...dominantTasks[0],
    dimension_target: weakest,
    yoga_path_alignment: dominantPath,
    h_capacity_target: weakest === "emotion" ? "compassion" : weakest === "body" ? "presence" : weakest === "awareness" ? "awareness" : "wisdom",
    difficulty: band < 2 ? "gentle" : band < 5 ? "moderate" : "deep",
    loop_relevant: null,
    chakra_relevant: null,
  });

  if (taskCount > 1 && weakPathTasks.length > 0) tasks.push({
    ...weakPathTasks[0],
    dimension_target: weakest,
    yoga_path_alignment: weakestPath,
    h_capacity_target: "courage",
    difficulty: "gentle",
    loop_relevant: null,
    chakra_relevant: null,
  });

  // 30% second-weakest dimension
  if (taskCount > 2) {
    const secondTemplates = taskTemplates[secondWeakest] || {};
    const secondTasks = secondTemplates[secondaryPath] || secondTemplates.raja || [];
    if (secondTasks.length > 0) tasks.push({
      ...secondTasks[0],
      dimension_target: secondWeakest,
      yoga_path_alignment: secondaryPath,
      h_capacity_target: "patience",
      difficulty: band < 3 ? "gentle" : "moderate",
      loop_relevant: null,
      chakra_relevant: null,
    });
  }

  // 10% strongest — to maintain
  if (taskCount > 3) {
    const strongTemplates = taskTemplates[strongest] || {};
    const strongTasks = strongTemplates[dominantPath] || strongTemplates.jnana || [];
    if (strongTasks.length > 1) tasks.push({
      ...strongTasks[1],
      dimension_target: strongest,
      yoga_path_alignment: dominantPath,
      h_capacity_target: "dedication",
      difficulty: "deep",
      loop_relevant: null,
      chakra_relevant: null,
    });
  }

  return tasks;
}

// ═══════════════════════════════════════════
// SELF-INQUIRY PROMPT BANK (100 prompts across 7 categories)
// ═══════════════════════════════════════════
const SELF_INQUIRY_PROMPTS: Record<string, string[]> = {
  thought: [
    "What thought is occupying most of your mind right now?",
    "When this thought appears, how does it affect your mood?",
    "Is this thought helpful or just habitual?",
    "What triggered this thought today?",
    "If you step back and observe this thought, what do you notice?",
    "Is this thought based on facts or assumptions?",
    "How many times has this thought appeared today?",
    "What happens if you simply watch this thought without reacting?",
    "Does this thought belong to the present moment or the past/future?",
    "What belief might be behind this thought?",
    "If this thought had a message, what would it say?",
    "Would you still believe this thought if you questioned it?",
    "What would happen if you didn't engage with this thought?",
    "Does this thought expand your awareness or limit it?",
    "Who is the one noticing this thought?",
  ],
  emotion: [
    "What emotion are you feeling right now?",
    "Where do you feel this emotion in your body?",
    "When did this emotion start today?",
    "What situation triggered this feeling?",
    "What does this emotion want you to notice?",
    "If this emotion could speak, what would it say?",
    "What usually happens after you feel this emotion?",
    "How long does this emotion typically last?",
    "What changes when you simply observe this emotion?",
    "Are you resisting this emotion or allowing it?",
    "What happens if you breathe slowly while observing this feeling?",
    "Is this emotion familiar from past experiences?",
    "Does this emotion belong to the present moment?",
    "What might this emotion be protecting you from?",
    "Who is aware of this emotion?",
  ],
  behavior: [
    "What behavior pattern keeps repeating in your life?",
    "When does this pattern usually appear?",
    "What emotion triggers this behavior?",
    "What belief might be behind this pattern?",
    "What need are you trying to fulfill through this behavior?",
    "What happens immediately after this behavior?",
    "How does this pattern affect your life?",
    "What would happen if you paused before acting on this pattern?",
    "What would a more conscious response look like?",
    "Have you seen this pattern in others too?",
    "What are you avoiding when this pattern appears?",
    "When did this pattern first start in your life?",
    "What part of you benefits from keeping this pattern?",
    "What might change if you stopped feeding this pattern?",
    "Can you observe this pattern without judging yourself?",
  ],
  identity: [
    "Who do you believe you are right now?",
    "What labels do you use to define yourself?",
    "If those labels disappeared, what would remain?",
    "What belief about yourself limits you the most?",
    "Where did that belief come from?",
    "Is this belief absolutely true?",
    "How would your life change if you stopped believing it?",
    "What belief empowers you the most?",
    "What role are you playing in your life right now?",
    "Are you living according to your values or expectations?",
    "What identity are you afraid to lose?",
    "What identity are you trying to protect?",
    "Who would you be without your past story?",
    "If no one judged you, how would you live?",
    "Are you the roles you play or the one aware of them?",
  ],
  desire: [
    "What do you want most right now?",
    "Why do you want it?",
    "What feeling do you expect it to give you?",
    "Have you felt that feeling before without this desire?",
    "Is this desire coming from fear or inspiration?",
    "What happens when you don't get what you want?",
    "How long does satisfaction last after achieving something?",
    "Are you chasing happiness or creating it?",
    "What truly fulfills you?",
    "What motivates your daily actions?",
    "What desire drives most of your decisions?",
    "Are your goals aligned with your inner values?",
    "If this desire disappeared, how would you feel?",
    "What are you really searching for beneath this desire?",
    "Is there a deeper need behind your goals?",
  ],
  presence: [
    "What can you notice in your surroundings right now?",
    "What sounds can you hear at this moment?",
    "How does your breathing feel right now?",
    "Can you observe your breath without changing it?",
    "What sensations are present in your body right now?",
    "What happens when you focus only on this moment?",
    "Are you thinking about the past or the future right now?",
    "What changes when you bring attention back to the present?",
    "Can you observe your thoughts like passing clouds?",
    "What is happening in the space between two thoughts?",
    "How does stillness feel in this moment?",
    "What do you notice when your mind becomes quiet?",
    "What is here when you stop thinking for a moment?",
    "Can awareness exist without thoughts?",
    "What remains when you simply observe?",
  ],
  deep: [
    "Who is aware of your thoughts right now?",
    "Can the observer itself be observed?",
    "What is the difference between thinking and awareness?",
    "Are you the mind or the one who sees the mind?",
    "When thoughts stop, do you still exist?",
    "What is the nature of the awareness that observes everything?",
    "Does awareness change like thoughts do?",
    "If everything you experience changes, what remains constant?",
    "What is the 'I' that says 'I am'?",
    "Who are you beyond thoughts, emotions, and identity?",
  ],
};

// Map dimension weaknesses to relevant prompt categories
const DIMENSION_TO_CATEGORIES: Record<string, string[]> = {
  thought: ["thought", "behavior", "identity"],
  emotion: ["emotion", "desire", "behavior"],
  body: ["presence", "emotion", "behavior"],
  awareness: ["deep", "presence", "thought"],
};

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateJournalPrompts(band: number, weakest: string, state: string, activeLoops?: string[]): string[] {
  if (state === "dark_night") {
    return [
      "What feels hardest right now? Just write — no need to fix anything.",
      "What emotion are you feeling right now?",
      "Where do you feel this emotion in your body?",
      "What would happen if you simply allowed this feeling to be here?",
      "What is one small thing that brought you comfort today?",
    ];
  }

  const selected: string[] = [];
  
  // 1. Pick 2 from weakest dimension's primary category
  const primaryCategories = DIMENSION_TO_CATEGORIES[weakest] || ["thought", "emotion", "presence"];
  const primaryPool = SELF_INQUIRY_PROMPTS[primaryCategories[0]] || [];
  
  // For lower bands, pick from beginning (simpler); higher bands from end (deeper)
  if (band < 2) {
    selected.push(...pickRandom(primaryPool.slice(0, 8), 2));
  } else if (band < 4) {
    selected.push(...pickRandom(primaryPool.slice(5, 15), 2));
  } else {
    selected.push(...pickRandom(primaryPool.slice(8), 2));
  }

  // 2. Pick 1 from secondary category
  const secondaryPool = SELF_INQUIRY_PROMPTS[primaryCategories[1]] || [];
  selected.push(...pickRandom(secondaryPool, 1));

  // 3. Pick 1 from presence/deep based on band
  if (band >= 3) {
    selected.push(...pickRandom(SELF_INQUIRY_PROMPTS.deep, 1));
  } else {
    selected.push(...pickRandom(SELF_INQUIRY_PROMPTS.presence, 1));
  }

  // 4. Pick 1 from identity/desire for variety
  const varietyCategory = band >= 3 ? "identity" : "desire";
  selected.push(...pickRandom(SELF_INQUIRY_PROMPTS[varietyCategory], 1));

  // If breakthrough, replace last with a breakthrough-specific prompt
  if (state === "breakthrough" && selected.length >= 5) {
    selected[4] = "What shifted in you recently? Can you describe the before and after?";
  }

  return selected.slice(0, 5);
}

// ═══════════════════════════════════════════
// EVENING REFLECTION
// ═══════════════════════════════════════════
function generateEveningReflection(band: number, weakest: string, state: string) {
  const questions = [
    state === "dark_night"
      ? "What got you through today? Name one thing."
      : band < 2
      ? `Did you notice anything about your ${weakest} today?`
      : `How did your ${weakest} show up in today's interactions?`,
    state === "breakthrough"
      ? "What feels different about you tonight compared to last week?"
      : "What's one insight you want to carry into tomorrow?",
  ];
  return { focus: weakest, questions };
}

// ═══════════════════════════════════════════
// SAMSKARA CLUSTERING (§7)
// ═══════════════════════════════════════════
async function updateSamskaraClusters(admin: any, userId: string, activeLoops: string[], loopSeverity: any) {
  const woundCounts: Record<string, string[]> = {};
  for (const loop of activeLoops) {
    const cluster = LOOP_CLUSTER_MAP[loop];
    if (!cluster) continue;
    if (!woundCounts[cluster.root_wound]) woundCounts[cluster.root_wound] = [];
    woundCounts[cluster.root_wound].push(loop);
  }

  for (const [wound, loops] of Object.entries(woundCounts)) {
    if (loops.length < 2) continue;
    const chakras = [...new Set(loops.flatMap(l => LOOP_CLUSTER_MAP[l]?.chakras || []))];
    const depth = Math.min(1, loops.length * 0.2);
    const avgAwareness = loops.reduce((sum, l) => {
      return sum + (loopSeverity[l] === "seen" ? 0.5 : loopSeverity[l] === "loosening" ? 0.7 : 0.2);
    }, 0) / loops.length;

    const { data: existing } = await admin
      .from("user_samskaras")
      .select("id")
      .eq("user_id", userId)
      .eq("root_wound", wound)
      .single();

    if (existing) {
      await admin.from("user_samskaras").update({
        connected_loop_ids: loops, depth, awareness: parseFloat(avgAwareness.toFixed(2)),
        chakra_correlations: chakras, updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      await admin.from("user_samskaras").insert({
        user_id: userId, root_wound: wound, connected_loop_ids: loops,
        depth, awareness: parseFloat(avgAwareness.toFixed(2)), chakra_correlations: chakras,
      });
    }
  }
}

// ═══════════════════════════════════════════
// LOOP LIFECYCLE UPDATE
// ═══════════════════════════════════════════
async function updateLoopLifecycle(admin: any, userId: string, detectedLoops: string[], loopAwareness: any) {
  for (const loopId of detectedLoops) {
    const awareness = loopAwareness[loopId] || 0;
    let status = "active";
    if (awareness > 0.7) status = "loosening";
    else if (awareness > 0.4) status = "seen";

    const { data: existing } = await admin
      .from("user_loops").select("id, status")
      .eq("user_id", userId).eq("loop_id", loopId).single();

    if (existing) {
      const statusOrder = ["dormant", "active", "acute", "seen", "loosening", "dissolved", "integrated"];
      const currentIdx = statusOrder.indexOf(existing.status);
      const newIdx = statusOrder.indexOf(status);
      if (newIdx > currentIdx) {
        await admin.from("user_loops").update({
          status, awareness_score: awareness,
          last_activated_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await admin.from("user_loops").update({
          awareness_score: awareness,
          last_activated_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      }
    } else {
      await admin.from("user_loops").insert({
        user_id: userId, loop_id: loopId, status, awareness_score: awareness,
        severity: "active", last_activated_at: new Date().toISOString(),
      });
    }
  }
}

// ═══════════════════════════════════════════
// PSYCHE PROFILE UPDATES (Enhancement #7)
// ═══════════════════════════════════════════
async function updatePsycheFromSignals(admin: any, userId: string, signalData: any, profile: any) {
  const { data: psyche } = await admin
    .from("user_psyche_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!psyche) return; // No psyche profile yet

  const updates: any = {};

  // Update emotional signatures from heart signals
  const heartSignals = signalData.heart_signals || {};
  if (heartSignals.emotional_state) {
    const sigs = { ...(psyche.emotional_signatures || {}) };
    const freq = sigs.frequency || {};
    freq[heartSignals.emotional_state] = (freq[heartSignals.emotional_state] || 0) + 1;
    sigs.frequency = freq;
    sigs.last_observed = heartSignals.emotional_state;
    if (heartSignals.relational_tone) sigs.last_relational_tone = heartSignals.relational_tone;
    updates.emotional_signatures = sigs;
  }

  // Update cognitive patterns from head signals
  const headSignals = signalData.head_signals || {};
  if (headSignals.thought_pattern) {
    const cogPatterns = { ...(psyche.cognitive_patterns || {}) };
    const freq = cogPatterns.frequency || {};
    freq[headSignals.thought_pattern] = (freq[headSignals.thought_pattern] || 0) + 1;
    cogPatterns.frequency = freq;
    if (headSignals.cognitive_distortions?.length > 0) {
      cogPatterns.recent_distortions = headSignals.cognitive_distortions;
    }
    updates.cognitive_patterns = cogPatterns;
  }

  // Update somatic map from gut signals
  const gutSignals = signalData.gut_signals || {};
  if (gutSignals.somatic_markers?.length > 0) {
    const somatic = { ...(psyche.somatic_map || {}) };
    const markers = somatic.markers || {};
    for (const marker of gutSignals.somatic_markers) {
      markers[marker] = (markers[marker] || 0) + 1;
    }
    somatic.markers = markers;
    somatic.last_energy_state = gutSignals.energy_state;
    updates.somatic_map = somatic;
  }

  // Update beliefs from head signals
  if (headSignals.beliefs_surfaced?.length > 0) {
    const beliefs = { ...(psyche.beliefs || {}) };
    const surfaced = beliefs.surfaced || [];
    for (const belief of headSignals.beliefs_surfaced) {
      if (!surfaced.includes(belief)) surfaced.push(belief);
    }
    beliefs.surfaced = surfaced.slice(-20); // Keep last 20
    updates.beliefs = beliefs;
  }

  // Update shadow from bypassing signals
  if (signalData.bypassing_signals?.positivity_bypass || signalData.bypassing_signals?.intellectual_bypass) {
    const shadow = { ...(psyche.shadow || {}) };
    const patterns = shadow.bypassing_patterns || [];
    if (signalData.bypassing_signals.positivity_bypass) {
      if (!patterns.includes("positivity_bypass")) patterns.push("positivity_bypass");
    }
    if (signalData.bypassing_signals.intellectual_bypass) {
      if (!patterns.includes("intellectual_bypass")) patterns.push("intellectual_bypass");
    }
    shadow.bypassing_patterns = patterns;
    updates.shadow = shadow;
  }

  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString();
    await admin.from("user_psyche_profile").update(updates).eq("user_id", userId);
  }
}

// ═══════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("consciousness-engine: auth error", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { timeSlot, action, signalData, assessmentResults } = body;
    const admin = createClient(supabaseUrl, serviceKey);

    // Get or create consciousness profile
    let { data: profile } = await admin
      .from("user_consciousness_profile")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      console.log("consciousness-engine: creating new profile for user", user.id);
      const { data: newProfile, error: insertErr } = await admin
        .from("user_consciousness_profile")
        .upsert({
          user_id: user.id,
          dimension_bands: { thought: 0, emotion: 0, body: 0, awareness: 0 },
          journey_phase: "assessment",
        }, { onConflict: "user_id" })
        .select()
        .single();
      if (insertErr) {
        console.error("consciousness-engine: profile upsert error", insertErr.message, insertErr.details, insertErr.hint);
      }
      profile = newProfile;
    }

    if (!profile) {
      return new Response(JSON.stringify({ error: "Failed to create profile" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── AUTO-ADVANCE DAY based on calendar date ───
    // Calculate expected journey day from profile creation date
    {
      const createdAt = new Date(profile.created_at);
      const now = new Date();
      // Calculate days elapsed (using UTC dates to avoid timezone issues)
      const createdDate = new Date(Date.UTC(createdAt.getUTCFullYear(), createdAt.getUTCMonth(), createdAt.getUTCDate()));
      const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const daysElapsed = Math.floor((todayDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const expectedDay = daysElapsed + 1; // Day 1 on creation date
      const currentDay = profile.journey_day || 1;

      if (expectedDay > currentDay) {
        let newPhase = profile.journey_phase;
        if (expectedDay >= 8 && (newPhase === "calibration" || newPhase === "assessment")) newPhase = "foundation";
        if (expectedDay >= 15 && newPhase === "foundation") newPhase = "exploration";
        if (expectedDay >= 60 && newPhase === "exploration") newPhase = "integration";
        if (expectedDay >= 180 && newPhase === "integration") newPhase = "mastery";

        const { data: updated } = await admin
          .from("user_consciousness_profile")
          .update({ journey_day: expectedDay, journey_phase: newPhase })
          .eq("user_id", user.id).select().single();
        if (updated) {
          profile = updated;
          console.log(`consciousness-engine: auto-advanced day ${currentDay} → ${expectedDay} (phase: ${newPhase})`);
        }

        // Log the day advance
        try {
          const { error: upsertErr } = await admin.from("user_journey_log").upsert({
            user_id: user.id, day_number: expectedDay, phase: newPhase,
            log_date: todayDate.toISOString().split("T")[0],
            engine_plan: {},
          }, { onConflict: "user_id,log_date" });
          if (upsertErr) {
            // upsert may fail if no unique constraint on (user_id, log_date), just insert
            await admin.from("user_journey_log").insert({
              user_id: user.id, day_number: expectedDay, phase: newPhase, engine_plan: {},
            });
          }
        } catch (_) { /* ignore logging errors */ }
      }
    }

    // ─── Apply time decay to dimensions ───
    const decayedDims = applyTimeDecay(
      normalizeDimensionBands(profile.dimension_bands),
      profile.last_session_at,
    );
    if (JSON.stringify(decayedDims) !== JSON.stringify(profile.dimension_bands)) {
      await admin.from("user_consciousness_profile")
        .update({ dimension_bands: decayedDims })
        .eq("user_id", user.id);
      profile = { ...profile, dimension_bands: decayedDims };
    }

    // ─── ACTION: Apply 3-Lens signal data ───
    if (action === "apply_signals" && signalData) {
      const dims = { ...(profile.dimension_bands || {}) };
      const updates = signalData.dimension_micro_updates || {};
      const journeyDay = profile.journey_day || 1;
      const isCalibrationPeriod = journeyDay <= 7;
      const dimCap = getDimensionCap(journeyDay, isCalibrationPeriod);

      // Apply circadian boost
      const circadianBoost = getCircadianDimensionBoost(profile.circadian_profile || {}, timeSlot || "morning");
      
      for (const [dim, delta] of Object.entries(updates)) {
        const maxDelta = profile.journey_phase === "calibration" ? 0.1 : 0.05;
        const boost = circadianBoost[dim] || 0;
        const clamped = Math.max(-maxDelta, Math.min(maxDelta, (delta as number) + boost));
        dims[dim] = Math.max(0, Math.min(dimCap, (dims[dim] || 0) + clamped));
      }

      const witnessSignals = signalData.witness_signals || {};
      const newWitnessGap = Math.max(0, Math.min(1,
        (profile.witness_gap || 0) * 0.9 + (witnessSignals.meta_awareness_level || 0) * 0.1
      ));
      const idLevel = witnessSignals.identification_level || "high";
      const idScore = idLevel === "none" ? 1.0 : idLevel === "low" ? 0.7 : idLevel === "medium" ? 0.4 : 0.1;
      const newWitnessStability = Math.max(0, Math.min(1,
        (profile.witness_stability || 0) * 0.92 + idScore * 0.08
      ));
      const depthSignal = (witnessSignals.spontaneous_insight ? 0.3 : 0) + (witnessSignals.gap_detected ? 0.3 : 0) + (witnessSignals.meta_awareness_level || 0) * 0.4;
      const newWitnessDepth = Math.max(0, Math.min(1,
        (profile.witness_depth || 0) * 0.92 + depthSignal * 0.08
      ));

      const newLoops = [...new Set([
        ...(profile.active_loops || []),
        ...(signalData.active_loops_detected || []),
      ])];

      const loopSev = { ...(profile.loop_severity || {}) };
      for (const loop of (signalData.active_loops_detected || [])) {
        if (!loopSev[loop]) loopSev[loop] = "active";
      }

      const loopAwareness = {
        ...(profile.loop_awareness || {}),
        ...Object.fromEntries(
          (signalData.active_loops_detected || []).map((l: string) => [l, Math.min(1, (profile.loop_awareness?.[l] || 0) + 0.05)])
        ),
      };

      const yogaPaths = { ...(profile.yoga_path_affinity || {}) };
      const pathSignals = signalData.yoga_path_signals || {};
      for (const [path, sig] of Object.entries(pathSignals)) {
        yogaPaths[path] = (yogaPaths[path] || 0) * 0.95 + (sig as number) * 0.05;
      }
      const dominantPath = Object.entries(yogaPaths).sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || "jnana";

      const hCaps = { ...(profile.h_capacities || {}) };
      if (witnessSignals.meta_awareness_level > 0.5) hCaps.awareness = Math.min(10, (hCaps.awareness || 0) + 0.1);
      if (witnessSignals.gap_detected) hCaps.presence = Math.min(10, (hCaps.presence || 0) + 0.1);
      if (signalData.heart_signals?.vulnerability_present) hCaps.courage = Math.min(10, (hCaps.courage || 0) + 0.1);
      if (signalData.heart_signals?.emotional_depth > 0.6) hCaps.compassion = Math.min(10, (hCaps.compassion || 0) + 0.1);

      const bypassRisk = computeBypassingRisk({ ...profile, dimension_bands: dims, v_level_peak: profile.v_level_peak, loop_severity: loopSev, h_capacities: hCaps });

      // Update circadian profile
      const updatedCircadian = updateCircadianProfile(profile, timeSlot || "morning");

      const { data: updated } = await admin
        .from("user_consciousness_profile")
        .update({
          dimension_bands: dims,
          witness_gap: parseFloat(newWitnessGap.toFixed(3)),
          witness_stability: parseFloat(newWitnessStability.toFixed(3)),
          witness_depth: parseFloat(newWitnessDepth.toFixed(3)),
          active_loops: newLoops,
          loop_severity: loopSev,
          loop_awareness: loopAwareness,
          chitta_vritti: signalData.chitta_vritti_classification || profile.chitta_vritti,
          yoga_path_affinity: yogaPaths,
          dominant_path: dominantPath,
          bypassing_risk: bypassRisk,
          h_capacities: hCaps,
          circadian_profile: updatedCircadian,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (updated) profile = updated;

      // Store signal in consciousness_signals table
      await admin.from("consciousness_signals").insert({
        user_id: user.id,
        source_type: signalData._source_type || "chat",
        source_id: signalData._source_id || null,
        gut_signals: signalData.gut_signals || {},
        heart_signals: signalData.heart_signals || {},
        head_signals: signalData.head_signals || {},
        witness_signals: signalData.witness_signals || {},
        dimension_updates: signalData.dimension_micro_updates || {},
        loops_detected: signalData.active_loops_detected || [],
        chitta_vritti: signalData.chitta_vritti_classification,
        confidence: signalData.confidence || 0,
      });

      // Update loop lifecycle
      await updateLoopLifecycle(admin, user.id, signalData.active_loops_detected || [], loopAwareness);

      // Update samskara clusters
      await updateSamskaraClusters(admin, user.id, newLoops, loopSev);

      // Update psyche profile from signals (non-blocking)
      updatePsycheFromSignals(admin, user.id, signalData, profile).catch(e => console.error("Psyche update failed:", e));
    }

    // ─── ACTION: Update assessment ───
    if (action === "update_assessment" && assessmentResults) {
      const bands = assessmentResults.dimension_bands || profile.dimension_bands;
      const initialBand = assessmentResults.initial_band ?? 0;
      const overall = Object.values(bands as Record<string, number>).reduce((a, b) => a + b, 0) / Object.keys(bands).length;
      const isCalibrated = assessmentResults.calibration_source === "onboarding_assessment";
      const nextPhase = isCalibrated ? "calibration" :
                        profile.journey_phase === "calibration" ? "foundation" :
                        profile.journey_phase === "assessment" ? "foundation" : profile.journey_phase;
      const vLevelInitial = Math.min(3.5, initialBand);

      const { data: updated } = await admin
        .from("user_consciousness_profile")
        .update({
          dimension_bands: bands, overall_band: overall,
          // identity_band is SET ONCE from onboarding and never overwritten.
          // Only set it if not already set (0 is default, meaning not yet selected).
          ...(profile.identity_band === 0 && initialBand > 0 ? { identity_band: initialBand } : {}),
          v_level_current: vLevelInitial, v_level_baseline: vLevelInitial, v_level_peak: vLevelInitial,
          archetype: assessmentResults.archetype_hint || profile.archetype,
          assessment_data: { ...profile.assessment_data, ...assessmentResults },
          journey_phase: nextPhase, last_assessed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id).select().single();
      if (updated) profile = updated;
    }

    // ─── ACTION: Advance day + CONTINUOUS CALIBRATION ───
    if (action === "advance_day") {
      const newDay = (profile.journey_day || 1) + 1;
      let newPhase = profile.journey_phase;
      if (newDay >= 8 && newPhase === "calibration") newPhase = "foundation";
      if (newDay >= 15 && newPhase === "foundation") newPhase = "exploration";
      if (newDay >= 60 && newPhase === "exploration") newPhase = "integration";
      if (newDay >= 180 && newPhase === "integration") newPhase = "mastery";

      // ── Streak logic on day advance ──
      const lastSession = profile.last_session_at;
      let streakUpdate: Record<string, any> = {};
      if (lastSession) {
        const lastDate = new Date(lastSession).toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];
        if (lastDate === yesterday || lastDate === new Date().toISOString().split("T")[0]) {
          // Active yesterday/today — streak continues
        } else if (lastDate === twoDaysAgo) {
          // Grace period — 1 missed day
        } else {
          streakUpdate = { streak_current: 0 };
        }
      }

      // ═══ CONTINUOUS CALIBRATION ENGINE ═══
      // Runs on every day advance to keep consciousness profile accurate
      // Consciousness journey has ups and downs — this tracks them faithfully

      // 1. TIME DECAY: Dimensions naturally decay without practice
      const decayedDims = applyTimeDecay(
        normalizeDimensionBands(profile.dimension_bands),
        profile.last_session_at,
      );
      const dimsChanged = JSON.stringify(decayedDims) !== JSON.stringify(profile.dimension_bands || {});

      // 2. BASELINE DRIFT: If user is consistently below baseline for 3+ days, lower baseline
      const currentVLevel = computeVLevel({ ...profile, dimension_bands: decayedDims });
      const currentBaseline = profile.v_level_baseline || 0;
      const daysBelowBaseline = profile.regression?.days_below_baseline || 0;
      let newBaseline = currentBaseline;
      if (currentVLevel < currentBaseline * 0.9) {
        // Below 90% of baseline — count days
        const updatedDaysBelow = daysBelowBaseline + 1;
        if (updatedDaysBelow >= 3) {
          // 3+ days below baseline — slowly adjust baseline down (max 5% per recalibration)
          newBaseline = Math.max(0, currentBaseline - (currentBaseline * 0.05));
        }
        streakUpdate.regression = {
          ...(profile.regression || {}),
          days_below_baseline: updatedDaysBelow,
          baseline_drift_direction: "descending",
        };
      } else if (currentVLevel > currentBaseline * 1.05) {
        // Growing — slowly raise baseline (max 3% per day, rewards consistency)
        newBaseline = currentBaseline + Math.min(0.1, (currentVLevel - currentBaseline) * 0.03);
        streakUpdate.regression = {
          ...(profile.regression || {}),
          days_below_baseline: 0,
          baseline_drift_direction: "ascending",
        };
      } else {
        // Stable zone
        streakUpdate.regression = {
          ...(profile.regression || {}),
          days_below_baseline: 0,
          baseline_drift_direction: "stable",
        };
      }

      // 3. DIMENSION CAP enforcement based on journey progress
      const isCalibration = newPhase === "calibration";
      const dimCap = getDimensionCap(newDay, isCalibration);
      for (const dim of ["thought", "emotion", "body", "awareness"]) {
        decayedDims[dim] = Math.min(decayedDims[dim] || 0, dimCap);
      }

      // 4. WITNESS DECAY: Witness quality slowly decays without practice
      let witnessDecayUpdate: Record<string, any> = {};
      if (lastSession) {
        const daysSinceSession = Math.floor((Date.now() - new Date(lastSession).getTime()) / 86400000);
        if (daysSinceSession >= 2) {
          const witnessDecay = 0.005 * Math.min(daysSinceSession, 30);
          witnessDecayUpdate = {
            witness_gap: Math.max(0, (profile.witness_gap || 0) - witnessDecay),
            witness_stability: Math.max(0, (profile.witness_stability || 0) - witnessDecay * 0.8),
            witness_depth: Math.max(0, (profile.witness_depth || 0) - witnessDecay * 0.5),
          };
        }
      }

      // 5. H-CAPACITY NATURAL DECAY (very slow — unused capacities fade slightly)
      const hCaps = { ...(profile.h_capacities || {}) };
      if (lastSession) {
        const daysSinceSession = Math.floor((Date.now() - new Date(lastSession).getTime()) / 86400000);
        if (daysSinceSession >= 3) {
          const capDecay = 0.02 * Math.min(daysSinceSession - 2, 20);
          for (const key of Object.keys(hCaps)) {
            hCaps[key] = Math.max(0, (hCaps[key] || 0) - capDecay);
          }
        }
      }

      const { data: updated } = await admin
        .from("user_consciousness_profile")
        .update({
          journey_day: newDay,
          journey_phase: newPhase,
          dimension_bands: decayedDims,
          v_level_baseline: parseFloat(newBaseline.toFixed(3)),
          h_capacities: hCaps,
          ...witnessDecayUpdate,
          ...streakUpdate,
        })
        .eq("user_id", user.id).select().single();
      if (updated) profile = updated;

      // Log the calibration event
      await admin.from("user_journey_log").insert({
        user_id: user.id,
        day_number: newDay,
        phase: newPhase,
        engine_plan: {},
        engine_notes: {
          calibration: true,
          dims_decayed: dimsChanged,
          v_level_at_calibration: currentVLevel,
          baseline_drift: streakUpdate.regression?.baseline_drift_direction || "stable",
          witness_decayed: Object.keys(witnessDecayUpdate).length > 0,
        },
      });
    }

    // ─── ACTION: Session completed ───
    if (action === "session_completed") {
      // Only increment streak once per calendar day
      const todayStr = new Date().toISOString().split("T")[0];
      const lastSessionDate = profile.last_session_at
        ? new Date(profile.last_session_at).toISOString().split("T")[0]
        : null;
      const alreadyCountedToday = lastSessionDate === todayStr;

      const newStreak = alreadyCountedToday
        ? (profile.streak_current || 0)       // Already counted today, don't double-increment
        : (profile.streak_current || 0) + 1;  // First session of the day, increment

      const { data: updated } = await admin
        .from("user_consciousness_profile")
        .update({
          total_sessions: (profile.total_sessions || 0) + 1,
          last_session_at: new Date().toISOString(),
          streak_current: newStreak,
          streak_longest: Math.max(profile.streak_longest || 0, newStreak),
        })
        .eq("user_id", user.id).select().single();
      if (updated) profile = updated;
    }

    // ─── ACTION: Journal completed ───
    if (action === "journal_completed") {
      const { data: updated } = await admin
        .from("user_consciousness_profile")
        .update({
          total_journal_entries: (profile.total_journal_entries || 0) + 1,
          last_session_at: new Date().toISOString(),
        })
        .eq("user_id", user.id).select().single();
      if (updated) profile = updated;
    }

    // ═══════════════════════════════════════════
    // COMPUTE ALL DERIVED VALUES
    // ═══════════════════════════════════════════
    const vLevelCurrent = computeVLevel(profile);
    const chakras = computeChakras(profile);
    const archetype = detectArchetype(profile.dimension_bands || {});
    const bypassingRisk = computeBypassingRisk(profile);
    const state = detectState({ ...profile, bypassing_risk: bypassingRisk }, vLevelCurrent);
    const band = Math.floor(vLevelCurrent);

    // Integration Score V2
    const vLevelPeak = Math.max(profile.v_level_peak || 0, vLevelCurrent);
    const vLevelBaseline = profile.v_level_baseline || 0;
    const newBaseline = vLevelCurrent > vLevelBaseline
      ? vLevelBaseline + Math.min(0.1, (vLevelCurrent - vLevelBaseline) * 0.1)
      : vLevelBaseline;
    const integrationScore = computeIntegrationScoreV2(profile, vLevelCurrent);

    // Regression detection
    const prevState = profile.state || "normal";
    const regressionData = {
      baseline_highest: Math.max(profile.regression?.baseline_highest || 0, newBaseline),
      current_delta: parseFloat((vLevelCurrent - newBaseline).toFixed(3)),
      dark_night_count: (profile.regression?.dark_night_count || 0) + (state === "dark_night" && prevState !== "dark_night" ? 1 : 0),
      last_regression: state === "dark_night" ? new Date().toISOString() : (profile.regression?.last_regression || null),
      recovery_trajectory: state === "dark_night"
        ? (vLevelCurrent > (profile.v_level_current || 0) ? "ascending" : "descending")
        : null,
    };

    if (state === "dark_night" && prevState !== "dark_night") {
      await admin.from("regression_events").insert({
        user_id: user.id, baseline_before: vLevelBaseline, lowest_point: vLevelCurrent, trigger_type: "detected",
      });
    }

    if (prevState === "dark_night" && state === "breakthrough") {
      const { data: lastRegression } = await admin
        .from("regression_events").select("id")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single();
      if (lastRegression) {
        await admin.from("regression_events").update({
          recovery_date: new Date().toISOString().split("T")[0],
          breakthrough_after: true, new_baseline_after: vLevelCurrent,
        }).eq("id", lastRegression.id);
      }
    }

    await admin
      .from("user_consciousness_profile")
      .update({
        v_level_current: vLevelCurrent, v_level_peak: vLevelPeak,
        v_level_baseline: parseFloat(newBaseline.toFixed(3)),
        integration_score: integrationScore,
        overall_band: vLevelCurrent, archetype, state,
        bypassing_risk: bypassingRisk, regression: regressionData,
      })
      .eq("user_id", user.id);

    // ═══════════════════════════════════════════
    // NOTIFICATION TRIGGERS
    // ═══════════════════════════════════════════
    const notifications: Array<{ user_id: string; type: string; title: string; body: string; metadata: any }> = [];

    // ── Streak milestones ──
    const streak = profile.streak_current || 0;
    if ([7, 14, 30, 50, 100, 200, 365].includes(streak)) {
      notifications.push({
        user_id: user.id, type: "streak",
        title: `🔥 ${streak}-Day Streak!`,
        body: `You've maintained your practice for ${streak} consecutive days. Keep going!`,
        metadata: { streak },
      });
    }

    // ── V-Level band change (consciousness score shift) ──
    const prevBand = Math.floor(profile.v_level_current || 0);
    const newBand = band;
    if (prevBand !== newBand && action !== "update_assessment") {
      if (newBand > prevBand) {
        notifications.push({
          user_id: user.id, type: "milestone",
          title: `🌟 Band Upgrade: ${BANDS[newBand]?.name || "NEW LEVEL"}`,
          body: `Your consciousness has risen from ${BANDS[prevBand]?.name || "previous"} to ${BANDS[newBand]?.name || "new level"}. This is real growth.`,
          metadata: { prevBand, newBand, vLevel: vLevelCurrent, bandName: BANDS[newBand]?.name },
        });
      } else {
        notifications.push({
          user_id: user.id, type: "system",
          title: `📉 Band shifted to ${BANDS[newBand]?.name || "lower"}`,
          body: `Your consciousness band shifted. This is natural — consistency will bring it back.`,
          metadata: { prevBand, newBand, vLevel: vLevelCurrent },
        });
      }
    }

    // ── V-Level significant change (>0.3 in a single update) ──
    const vLevelDelta = Math.abs(vLevelCurrent - (profile.v_level_current || 0));
    if (vLevelDelta >= 0.3 && prevBand === newBand && action === "apply_signals") {
      notifications.push({
        user_id: user.id, type: "prediction",
        title: vLevelCurrent > (profile.v_level_current || 0) ? "📈 Consciousness Rising" : "📊 Consciousness Shift",
        body: vLevelCurrent > (profile.v_level_current || 0)
          ? `Your V-level jumped by ${vLevelDelta.toFixed(1)} — something is clicking. Keep exploring.`
          : `Your V-level shifted by ${vLevelDelta.toFixed(1)} — awareness of the shift itself is progress.`,
        metadata: { prevVLevel: profile.v_level_current, newVLevel: vLevelCurrent, delta: vLevelDelta },
      });
    }

    // ── New loop/pattern detected ──
    if (action === "apply_signals") {
      const prevLoops: string[] = Array.isArray(profile.active_loops) ? profile.active_loops : [];
      const currentLoops: string[] = Array.isArray(profile.active_loops) ? profile.active_loops : [];
      const newlyDetected = currentLoops.filter((l: string) => !prevLoops.includes(l));
      // Check from the signal data for freshly detected loops
      const signalLoops: string[] = signalData?.active_loops_detected || [];
      const freshLoops = signalLoops.filter((l: string) => !prevLoops.includes(l));
      if (freshLoops.length > 0) {
        const loopNames = freshLoops.map((l: string) => l.replace(/_/g, " ").replace(/loop$/, "").trim()).join(", ");
        // Build rich context for each new loop for the Guide deep-link
        const loopDetails = freshLoops.map((loopId: string) => ({
          id: loopId,
          name: loopId.replace(/_/g, " ").replace(/loop$/, "").trim(),
        }));
        const primaryLoop = freshLoops[0];
        const primaryName = primaryLoop.replace(/_/g, " ").replace(/loop$/, "").trim();
        
        notifications.push({
          user_id: user.id, type: "loop_discovery",
          title: `🔄 New Pattern: ${primaryName}`,
          body: `A recurring pattern "${primaryName}" has been detected in your behavior. This is actually good news — awareness is the first step to freedom.\n\nThis pattern may be showing up as automatic reactions in your daily life. Understanding its triggers and mechanics can help you create space between stimulus and response.\n\nWould you like to explore this pattern with your Guide? A brief 5-10 minute session can help you understand why this loop activates, what it's protecting, and specific practices to work with it.`,
          metadata: { 
            loopIds: freshLoops,
            loopDetails,
            primaryLoop,
            primaryLoopName: primaryName,
            action: "guide_loop_session",
            guideContext: `The user has a newly detected behavioral pattern: "${primaryName}" (ID: ${primaryLoop}). This is a fresh discovery. Help them understand: 1) What this pattern is and how it manifests, 2) Why it activates — what triggers it and what it's protecting, 3) Specific awareness practices to work with it over the next few days. Keep the session 5-10 minutes. Be warm, direct, and practical. Don't overwhelm — give ONE key practice they can start today.`,
          },
        });
      }
    }

    // ── Session milestones ──
    const totalSessions = profile.total_sessions || 0;
    if ([5, 10, 25, 50, 100, 250, 500, 1000].includes(totalSessions)) {
      notifications.push({
        user_id: user.id, type: "milestone",
        title: `🎯 ${totalSessions} Sessions Completed!`,
        body: `You've completed ${totalSessions} sessions. Each one deepens your practice.`,
        metadata: { totalSessions },
      });
    }

    // ── Journal milestones ──
    const totalJournals = profile.total_journal_entries || 0;
    if ([5, 10, 25, 50, 100, 250, 500].includes(totalJournals)) {
      notifications.push({
        user_id: user.id, type: "milestone",
        title: `📝 ${totalJournals} Journal Entries!`,
        body: `You've written ${totalJournals} reflections. Your inner landscape is becoming clearer.`,
        metadata: { totalJournals },
      });
    }

    // ── Integration score milestones ──
    const prevIntegration = profile.integration_score || 0;
    if (integrationScore >= 0.5 && prevIntegration < 0.5) {
      notifications.push({
        user_id: user.id, type: "milestone",
        title: "⚡ Integration Deepening",
        body: "Your integration score crossed 50% — your growth is becoming more stable and embodied.",
        metadata: { integrationScore },
      });
    } else if (integrationScore >= 0.8 && prevIntegration < 0.8) {
      notifications.push({
        user_id: user.id, type: "milestone",
        title: "✦ Deep Integration Achieved",
        body: "Your integration score is above 80% — what you've learned is becoming who you are.",
        metadata: { integrationScore },
      });
    }

    // ── New V-level peak ──
    if (vLevelCurrent > (profile.v_level_peak || 0) && vLevelCurrent - (profile.v_level_peak || 0) >= 0.2) {
      notifications.push({
        user_id: user.id, type: "milestone",
        title: "🏔️ New Peak Reached",
        body: `You've reached a new consciousness peak of ${vLevelCurrent.toFixed(1)}. This is uncharted territory for you.`,
        metadata: { newPeak: vLevelCurrent, prevPeak: profile.v_level_peak },
      });
    }

    // ── State changes ──
    if (state !== prevState) {
      if (state === "dark_night") {
        notifications.push({
          user_id: user.id, type: "system",
          title: "🌑 A difficult phase",
          body: "You may be going through a challenging period. Remember — this is part of the journey, not a failure.",
          metadata: { state, prevState },
        });
      } else if (state === "breakthrough") {
        notifications.push({
          user_id: user.id, type: "milestone",
          title: "✦ Breakthrough detected!",
          body: "Your consciousness dimensions are showing significant growth. Beautiful progress.",
          metadata: { state, vLevel: vLevelCurrent },
        });
      } else if (state === "plateau") {
        notifications.push({
          user_id: user.id, type: "prediction",
          title: "📊 Plateau detected",
          body: "Growth has slowed — try exploring a different dimension or practice style.",
          metadata: { state, band },
        });
      }
    }

    // ── Phase milestones ──
    if (action === "advance_day") {
      const newPhase = profile.journey_phase;
      const journeyDay = profile.journey_day || 1;
      if ([8, 15, 60, 180].includes(journeyDay)) {
        notifications.push({
          user_id: user.id, type: "milestone",
          title: `🌟 New Phase: ${newPhase}`,
          body: `Day ${journeyDay} — you've entered the ${newPhase} phase of your journey.`,
          metadata: { phase: newPhase, journeyDay },
        });
      }
    }

    if (notifications.length > 0) {
      // Dedup: skip notifications whose exact title already exists for this user
      // Prevents milestone/streak/band/etc. notifications from being inserted on every engine run
      try {
        const titles = Array.from(new Set(notifications.map((n: any) => n.title)));
        const { data: existing } = await admin
          .from("notifications")
          .select("title")
          .eq("user_id", user.id)
          .in("title", titles);
        const existingTitles = new Set((existing || []).map((r: any) => r.title));
        const fresh = notifications.filter((n: any) => !existingTitles.has(n.title));
        if (fresh.length > 0) {
          admin.from("notifications").insert(fresh).then(() => {});
        }
      } catch (e) {
        console.error("Notification dedup failed, inserting anyway:", e);
        admin.from("notifications").insert(notifications).then(() => {});
      }
    }

// ═══════════════════════════════════════════
// FETCH LOOP DEFINITIONS FROM LOOP LIBRARY
// ═══════════════════════════════════════════
async function fetchLoopDefinitions(admin: any, loopIds: string[]): Promise<any[]> {
  if (!loopIds.length) return [];
  const { data } = await admin
    .from("loop_definitions")
    .select("*")
    .in("id", loopIds);
  return data || [];
}

// ═══════════════════════════════════════════
// FETCH CAPABILITY MAP FROM USER_CAPACITIES
// ═══════════════════════════════════════════
async function fetchCapabilityMap(admin: any, userId: string): Promise<Record<string, any>> {
  const { data } = await admin
    .from("user_capacities")
    .select("*")
    .eq("user_id", userId);
  
  const map: Record<string, any> = {};
  if (data) {
    for (const cap of data) {
      map[cap.capability_id] = {
        capabilityId: cap.capability_id,
        level: cap.level,
        progress: cap.progress,
        attempts: cap.attempts,
        completions: cap.completions,
        evidence: cap.evidence || [],
        lastTrainedAt: cap.last_trained_at,
        streakDays: cap.streak_days,
        modalitiesUsed: cap.modalities_used || [],
        unmetPrerequisites: cap.unmet_prerequisites || [],
      };
    }
  }
  return map;
}

// ═══════════════════════════════════════════
// FETCH SUTRA STATE FROM DB
// ═══════════════════════════════════════════
async function fetchSutraState(admin: any, userId: string): Promise<any> {
  const { data: sessions } = await admin
    .from("sessions")
    .select("started_at, completed_at, time_slot, status")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(5);
  
  const { data: loops } = await admin
    .from("active_loops")
    .select("loop_id")
    .eq("user_id", userId)
    .eq("is_active", true);
  
  const { data: domains } = await admin
    .from("life_domain_scores")
    .select("domain, score")
    .eq("user_id", userId)
    .lt("score", 5);
  
  const hour = new Date().getHours();
  const energy = hour < 7 || hour >= 22 ? "low" : hour < 11 || hour >= 18 ? "medium" : "high";
  
  return {
    energy,
    mood: loops && loops.length > 2 ? "agitated" : "neutral",
    timeAvailableSec: 600,
    activeLoops: loops?.map((l: any) => l.loop_id) || [],
    stressedDomains: domains?.map((d: any) => d.domain) || [],
  };
}

// ═══════════════════════════════════════════
// FETCH CONSTELLATION & ARC
// ═══════════════════════════════════════════
async function fetchConstellation(admin: any, userId: string): Promise<any> {
  const { data } = await admin
    .from("user_practice_constellation")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  
  if (!data) return null;
  
  const PRACTICES = ["observe", "inquiry", "bhakti", "witness", "karma", "breath", "body", "jnana", "raja", "tantra", "neuro", "kriya"];
  const weights: Record<string, number> = {};
  const levels: Record<string, number> = {};
  const statuses: Record<string, string> = {};
  
  for (const p of PRACTICES) {
    weights[p] = Number((data as any)[`${p}_weight`]) || 0.083;
    levels[p] = Number((data as any)[`${p}_level`]) || 0;
    statuses[p] = ((data as any)[`${p}_status`] as string) || "secondary";
  }
  
  return { phase: data.phase, weights, levels, statuses };
}

async function fetchArc(admin: any, userId: string): Promise<any> {
  const { data } = await admin
    .from("theme_arcs")
    .select("title, current_day")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (!data) return null;
  return { title: (data as any).title, day: (data as any).current_day || 1 };
}
    let memoryContext: any[] = [];
    try {
      const { data: memories } = await admin.rpc("search_memories", {
        p_user_id: user.id, p_query: "", p_category: null,
        p_dimension: null, p_limit: 10, p_days: 90,
      });
      if (memories) memoryContext = memories;
    } catch (e) {
      console.error("Memory fetch for engine failed:", e);
    }

    // ═══════════════════════════════════════════
    // BUILD OUTPUT
    // ═══════════════════════════════════════════
    const dims = profile.dimension_bands || {};
    const sorted = Object.entries(dims).sort(([, a]: any, [, b]: any) => a - b);
    const weakest = sorted[0]?.[0] || "awareness";
    const activeLoops = profile.active_loops || [];

    const guideContext = buildGuideContext(profile, vLevelCurrent, state, timeSlot || "morning");
    const tasks = generateTasks(profile, vLevelCurrent, state);
    const journalPrompts = generateJournalPrompts(band, weakest, state, activeLoops);
    const eveningReflection = generateEveningReflection(band, weakest, state);

    const presenceCard = {
      prompt: state === "dark_night"
        ? "Place a hand on your heart. You're here. That's enough."
        : band < 2
        ? `Pause for a moment. What is your ${weakest} doing right now?`
        : band < 4
        ? `Notice: where is your awareness right now? What is it touching?`
        : `Rest in the space between thoughts. What remains?`,
      type: weakest === "body" ? "body_check" : weakest === "emotion" ? "emotion_check" : "thought_watch",
    };

    // ═══════════════════════════════════════════
    // TODAY CARD (rich Today's Theme — engine-driven adaptive practice)
    // Surfaced in the home rich card during user's active rhythm slot.
    // ═══════════════════════════════════════════
    const guruName =
      (profile as any).current_guru_name ||
      (profile as any).assigned_guru_name ||
      (profile.dominant_path === "bhakti" ? "Krishna"
        : profile.dominant_path === "jnana" ? "Ramana"
        : profile.dominant_path === "karma" ? "Krishna"
        : profile.dominant_path === "raja" ? "Patanjali"
        : "Your Guide");

    const guruVoiceByState: Record<string, string> = {
      dark_night: "Don't run from this. Stay. What hurts is also what teaches. Sit with it — even for a moment.",
      regression: "Last session you slipped. That's the path, not a failure. This session, just be honest. Begin again.",
      bypassing: "You moved past it too quickly. This session, slow down. Feel what you skipped — gently, without fixing.",
      stable: `Last session you noticed your ${weakest}. Good. This session we go INSIDE that noticing. Don't run. Feel.`,
      growth: "Something is shifting. Don't grab it, don't name it. Just keep watching. Stay with the motion.",
      breakthrough: "Something opened. Don't chase the experience — rest in the space it left.",
    };
    const guruVoice = guruVoiceByState[state] || guruVoiceByState.stable;

    // Teaching source by dominant path / weakest dimension
    const teachingByDim: Record<string, { source: string; text: string }> = {
      body: {
        source: "Yoga Sutras 2.46 — Sthira Sukham Asanam",
        text: "Posture should be steady and comfortable. Your body is the first temple — listen to it before you ask anything of it.",
      },
      emotion: {
        source: "Bhagavad Gita 2.14",
        text: "The contact of senses with objects gives rise to cold and heat, pleasure and pain. They come and go. Bear them patiently.",
      },
      thought: {
        source: "Ashtavakra Gita 1.4",
        text: "You are not the body, not the mind. You are the witness — eternal, unchanging, free. Watch the thoughts, do not become them.",
      },
      awareness: {
        source: "Ribhu Gita 2.20",
        text: "There is only awareness. Everything that arises arises in it. Today, do not look at the objects — look at the looking.",
      },
    };
    const teaching = teachingByDim[weakest] || teachingByDim.awareness;

    // Practice — pick from generated tasks (engine already balanced) or fallback by dim
    const practicePool = (tasks || []).filter((t: any) => t.dimension_target === weakest);
    const chosenTask = practicePool[0] || tasks?.[0] || null;

    const practiceTitleByDim: Record<string, string> = {
      body: "Body Scan",
      emotion: "Emotion Observation",
      thought: "Thought Watching",
      awareness: "Witness Practice",
    };
    const practiceTitle = chosenTask?.title || practiceTitleByDim[weakest] || "Sit & Witness";

    // Practice level by band (L0..L4)
    const practiceLevel = `L${Math.max(0, Math.min(4, Math.floor(band / 2)))}`;
    const basePracticeMinutes = chosenTask?.estimated_minutes || (band < 2 ? 7 : band < 4 ? 10 : 15);

    // Adaptive duration based on state / time slot / energy proxy
    let adjustedMinutes = basePracticeMinutes;
    let adjustReason: string | null = null;
    if (state === "dark_night" || state === "regression") {
      adjustedMinutes = Math.max(3, Math.round(basePracticeMinutes * 0.6));
      adjustReason = state === "dark_night" ? "low energy" : "recent regression";
    } else if (state === "bypassing") {
      adjustedMinutes = basePracticeMinutes + 3;
      adjustReason = "extra time to actually feel";
    } else if (timeSlot === "night") {
      adjustedMinutes = Math.max(3, Math.round(basePracticeMinutes * 0.7));
      adjustReason = "winding down";
    }

    const practiceStepsByDim: Record<string, string[]> = {
      body: [
        "Close your eyes. Settle into your seat.",
        "Scan from crown to toes — slow, unhurried.",
        "Where is there holding? Soften, don't fix.",
        "Rest in whatever is most alive in the body.",
      ],
      emotion: [
        "Pick ONE emotion alive in you right now.",
        "Sit with it — don't analyze, don't fix.",
        "Where is it in the body? What does it want?",
        "Stay until it shifts on its own.",
      ],
      thought: [
        "Watch thoughts arise — like clouds in sky.",
        "Don't follow them. Don't push them away.",
        "Notice the space between two thoughts.",
        "Rest there. That space is who you are.",
      ],
      awareness: [
        "Drop attention into the back of the head.",
        "Ask silently: who is aware right now?",
        "Don't answer with thought — feel for it.",
        "Rest as the awareness itself.",
      ],
    };
    const practiceSteps = practiceStepsByDim[weakest] || practiceStepsByDim.awareness;

    const offAppByDim: Record<string, string> = {
      body: "Today, three times: pause, feel your feet on the ground for 10 seconds.",
      emotion: "Today, when reactivity arises, pause for 3 seconds. Don't react — feel.",
      thought: "Today, catch one thought-loop. Name it silently: 'thinking, thinking.' Then return.",
      awareness: "Today, three times: ask 'who is aware?' — without needing an answer.",
    };
    const offAppPractice = offAppByDim[weakest] || offAppByDim.awareness;

    const affirmationByState: Record<string, string> = {
      dark_night: "I can be with what is, without becoming it.",
      regression: "Beginning again is part of the path.",
      bypassing: "I have time to feel what I skipped.",
      stable: "I am the awareness in which all this arises.",
      growth: "Something true is moving through me.",
      breakthrough: "I rest in what opened.",
    };
    const todayAffirmation = affirmationByState[state] || affirmationByState.stable;

    const todayCard = {
      guruName,
      guruVoice,
      teachingSource: teaching.source,
      teachingText: teaching.text,
      practiceTitle,
      practiceLevel,
      practiceMinutes: basePracticeMinutes,
      adjustedMinutes,
      adjustReason,
      practiceSteps,
      offAppPractice,
      affirmation: todayAffirmation,
    };

    // Check/create today's plan
    const today = new Date().toISOString().split("T")[0];
    const { data: existingPlan } = await admin
      .from("daily_engine_plans").select("*")
      .eq("user_id", user.id).eq("plan_date", today).single();

    if (!existingPlan) {
      await admin.from("daily_engine_plans").insert({
        user_id: user.id, plan_date: today, tasks, guide_context: guideContext,
        journal_prompts: journalPrompts, presence_card: presenceCard,
        evening_reflection: eveningReflection, time_slot_generated: timeSlot || "morning",
      });
    } else if (action === "apply_signals") {
      await admin.from("daily_engine_plans")
        .update({ guide_context: guideContext, presence_card: presenceCard, evening_reflection: eveningReflection })
        .eq("id", existingPlan.id);
    }

    // Memory preamble
    let memoryPreamble = "";
    if (memoryContext.length > 0) {
      const patterns = memoryContext.filter((m: any) => m.category === "pattern" || m.category === "trigger");
      const breakthroughs = memoryContext.filter((m: any) => m.category === "breakthrough" || m.category === "milestone");
      if (patterns.length > 0) memoryPreamble += `\nRecurring patterns from memory: ${patterns.map((m: any) => m.content).join(" | ")}`;
      if (breakthroughs.length > 0) memoryPreamble += `\nPast breakthroughs: ${breakthroughs.map((m: any) => m.content).join(" | ")}`;
    }

    // ═══════════════════════════════════════════
    // AI SUGGESTIONS — Smart, Personalized, with WHY explanations
    // ═══════════════════════════════════════════
    const suggestions: Array<{
      type: "guide_mode" | "journal" | "practice";
      title: string; description: string; reason: string; emoji: string;
      action: { target: string; mode?: string; prompt?: string; context?: string };
      duration?: string;
    }> = [];

    // Pattern-based recommendations with specific WHY
    if (activeLoops.length > 0) {
      const topLoop = activeLoops[0];
      suggestions.push({
        type: "guide_mode", title: "Explore your patterns",
        description: `A 5-10 min session to map exactly how your loops work — triggers, thoughts, behaviors, and the way out`,
        reason: `I noticed ${activeLoops.length} recurring pattern${activeLoops.length > 1 ? "s" : ""} showing up in your recent sessions — especially "${topLoop}". Understanding the mechanics gives you power over them.`,
        emoji: "🔄", duration: "5-10 min",
        action: { target: "guide", mode: "pattern_finder", context: `Active patterns detected: ${activeLoops.join(", ")}. Help user see the exact loop mechanics.` },
      });
    }

    // State-based deep recommendations
    if (state === "dark_night") {
      suggestions.push({
        type: "guide_mode", title: "Emotional holding space",
        description: "A gentle session where you don't need to fix anything — just be held",
        reason: "Your recent patterns suggest you're going through a difficult phase. This is actually part of deep growth — but you don't need to navigate it alone.",
        emoji: "🤗", duration: "5-10 min",
        action: { target: "guide", mode: "therapy", context: "User is in a dark night phase. Be extra gentle and supportive. This is sacred work." },
      });
    } else if (state === "bypassing") {
      suggestions.push({
        type: "guide_mode", title: "Shadow work session",
        description: "A 7-step journey into the parts of yourself you've been avoiding",
        reason: "I've noticed a pattern of moving past difficult emotions quickly in your recent sessions. There might be something underneath worth exploring — gently.",
        emoji: "🌑", duration: "5-10 min",
        action: { target: "guide", mode: "shadow_work", context: "User shows bypassing risk. Help them feel rather than transcend. Be loving but direct." },
      });
    }

    // Dimension imbalance — specific WHY
    if (weakest === "body") {
      suggestions.push({
        type: "guide_mode", title: "Body awareness scan",
        description: "A 7-step somatic session — your body holds wisdom your mind hasn't accessed yet",
        reason: `Your body awareness is your weakest dimension right now (score: ${Math.round(dims.body || 0)}). When awareness stays in the head, growth plateaus. Your body has messages waiting.`,
        emoji: "🧘", duration: "5-10 min",
        action: { target: "guide", mode: "somatic", context: `Body dimension at ${dims.body || 0}. Focus on deep body scanning and somatic awareness.` },
      });
    } else if (weakest === "emotion") {
      suggestions.push({
        type: "guide_mode", title: "Emotional check-in",
        description: "A space to name, feel, and understand what's moving through you",
        reason: `Your emotional dimension needs attention (score: ${Math.round(dims.emotion || 0)}). Recent sessions show more thinking than feeling — let's balance that.`,
        emoji: "💜", duration: "5-10 min",
        action: { target: "guide", mode: "therapy", context: `Emotion dimension at ${dims.emotion || 0}. Help process and name specific feelings.` },
      });
    } else if (weakest === "thought") {
      suggestions.push({
        type: "guide_mode", title: "Self-inquiry session",
        description: "Question the thinker — who is the one having these thoughts?",
        reason: `Your thought dimension could use more awareness (score: ${Math.round(dims.thought || 0)}). Self-inquiry creates distance between you and your mental patterns.`,
        emoji: "🔍", duration: "5-10 min",
        action: { target: "guide", mode: "self_inquiry", context: `Thought dimension at ${dims.thought || 0}. Guide through Ramana-style inquiry.` },
      });
    }

    // Journal suggestion with WHY
    if (journalPrompts.length > 0) {
      suggestions.push({
        type: "journal", title: "Journaling prompt",
        description: journalPrompts[0],
        reason: "Writing activates different brain pathways than talking. Based on today's theme and your recent patterns, this prompt could unlock something new.",
        emoji: "📝", duration: "5 min",
        action: { target: "journal", prompt: journalPrompts[0] },
      });
    }

    // Band-appropriate deeper work
    if (band >= 2 && weakest !== "thought") {
      suggestions.push({
        type: "guide_mode", title: "Self-Inquiry — go deeper",
        description: "A 7-step live inquiry: Who am I beyond thoughts, emotions, and body?",
        reason: `At Band ${band}, you're ready for deeper self-inquiry. This isn't philosophy — it's direct experiential investigation into the nature of awareness.`,
        emoji: "🔍", duration: "5-10 min",
        action: { target: "guide", mode: "self_inquiry", context: `Band ${band}. Ready for direct inquiry. Make it experiential, not intellectual.` },
      });
    }

    // Time-contextual suggestions with WHY
    if (timeSlot === "morning" || timeSlot === "night") {
      suggestions.push({
        type: "guide_mode", title: "Dream exploration",
        description: "Decode the symbols your unconscious sent you last night",
        reason: timeSlot === "morning" 
          ? "Morning is when dreams are freshest. Your unconscious processes everything overnight — the symbols it sends carry real messages about your growth."
          : "Before sleep, your mind is more open to unconscious material. A perfect time to explore what's beneath the surface.",
        emoji: "🌙", duration: "5-10 min",
        action: { target: "guide", mode: "dream_analysis" },
      });
    }

    if (timeSlot === "evening") {
      suggestions.push({
        type: "guide_mode", title: "Gratitude & joy practice",
        description: "Find genuine appreciation in today — rewire your brain toward seeing good",
        reason: "Evening gratitude isn't just positive thinking — it literally changes neural pathways. After a full day, your brain has material to work with.",
        emoji: "✨", duration: "5 min",
        action: { target: "guide", mode: "gratitude" },
      });
    }

    // Breathwork when stress indicators present
    if (state === "dark_night" || state === "regression" || (dims.body || 0) < 3) {
      suggestions.push({
        type: "guide_mode", title: "Breathwork reset",
        description: "A live pranayama session — reset your nervous system in 5 minutes",
        reason: "Your recent data suggests elevated stress. Breathwork is the fastest way to shift your nervous system from fight-flight to calm-aware. No thinking required.",
        emoji: "🌬️", duration: "5 min",
        action: { target: "guide", mode: "breathwork", context: "User shows stress indicators. Start with calming 4-7-8 breath." },
      });
    }

    // Inner child work for deep patterns
    if (activeLoops.some((l: any) => typeof l === 'string' && (l.startsWith("VAL") || l.startsWith("ATT")))) {
      suggestions.push({
        type: "guide_mode", title: "Inner child session",
        description: "Meet the younger part of you that's still running old patterns",
        reason: "The validation and attachment patterns I'm seeing often trace back to early experiences. Inner child work can reach the root in ways analysis can't.",
        emoji: "🧸", duration: "5-10 min",
        action: { target: "guide", mode: "inner_child", context: "User has active validation/attachment loops. Guide gently to origin memories." },
      });
    }

    const topSuggestions = suggestions.slice(0, 4);

    // ═══════════════════════════════════════════
    // FETCH ADDITIONAL DATA FOR SESSION ORCHESTRATOR
    // ═══════════════════════════════════════════
    const [activeLoopDetails, loopSeverityScores, capabilityMap, sutraState, constellation, arc, stressedDomains] = await Promise.all([
      fetchLoopDefinitions(admin, activeLoops),
      (async () => {
        const severity: Record<string, number> = {};
        for (const loopId of activeLoops) {
          const loopAwareness = profile.loop_awareness?.[loopId] || 0;
          const loopSev = profile.loop_severity?.[loopId];
          let score = loopAwareness * 50;
          if (loopSev === "acute") score += 40;
          else if (loopSev === "active") score += 20;
          severity[loopId] = Math.min(100, Math.round(score));
        }
        return severity;
      })(),
      fetchCapabilityMap(admin, user.id),
      fetchSutraState(admin, user.id),
      fetchConstellation(admin, user.id),
      fetchArc(admin, user.id),
      (async () => {
        const { data } = await admin
          .from("life_domain_scores")
          .select("domain")
          .eq("user_id", user.id)
          .lt("score", 5);
        return data?.map((d: any) => d.domain) || [];
      })(),
    ]);

    // ── Identity Band: the FIXED band the user chose at onboarding ──
    const identityBand = profile.identity_band ?? 0;

    // ── Per-dimension band labels for the Morning Gate diagnosis ──
    const dimBandLabels: Record<string, { level: number; name: string; icon: string }> = {};
    for (const [dim, val] of Object.entries(dims)) {
      const lvl = Math.min(7, Math.floor((val as number)));
      dimBandLabels[dim] = {
        level: lvl,
        name: BANDS[lvl]?.name || "THE SLEEPER",
        icon: BANDS[lvl]?.icon || "🌑",
      };
    }

    const plan = {
      phase: profile.journey_phase,
      journeyDay: profile.journey_day || 1,
      vLevel: vLevelCurrent, band,
      bandName: BANDS[band]?.name || "UNKNOWN",
      bandIcon: BANDS[band]?.icon || "🌑",
      identityBand,
      identityBandName: BANDS[identityBand]?.name || BANDS[0].name,
      identityBandIcon: BANDS[identityBand]?.icon || BANDS[0].icon,
      dimensionBandLabels: dimBandLabels,
      state, archetype, focusDimension: weakest,
      guidePreamble: guideContext.preamble + memoryPreamble,
      guideContext, tasks, journalPrompts, presenceCard, eveningReflection,
      guruName: todayCard.guruName,
      todayCard,
      chakras, dimensionBands: dims,
      integrationScore,
      bypassingRisk, dominantPath: profile.dominant_path,
      witnessGap: profile.witness_gap || 0,
      witnessQuality: computeWitnessQuality(profile),
      suggestions: topSuggestions,
      memoryInsights: memoryContext.slice(0, 5).map((m: any) => ({
        content: m.content, category: m.category, importance: m.importance,
      })),
    };

    return new Response(JSON.stringify({ 
      profile, 
      plan,
      activeLoopDetails,
      loopSeverity: loopSeverityScores,
      capabilityMap,
      sutraState,
      constellation,
      arc,
      stressedDomains,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("consciousness-engine error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
