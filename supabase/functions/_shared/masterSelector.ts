// ============================================================
// UNIFIED MASTER SELECTOR — Single Source of Truth
// ============================================================
// Consolidates: chooseMasterForSession, masterMatching, dynamicGuruSelector, masterRotation, session-adapter
// Contexts: 'session_entry' | 'daily_planning' | 'mid_conversation' | 'crisis_triage' | 'rotation_check'
//
// Used by: edge functions (session-adapter, compose-session-v3, consciousness-engine), client (Guide, Temple)

import type { UserContext } from "./user-context.ts";

export type MasterSelectorContext =
  | { type: 'session_entry'; plannedMaster?: string; plannedMode?: string; plannedPractice?: string; timeSlot?: string; userContext: UserContext }
  | { type: 'daily_planning'; userContext: UserContext; excludeGuruIds?: string[] }
  | { type: 'mid_conversation'; userContext: UserContext; messageText: string; currentMasterId: string }
  | { type: 'crisis_triage'; userContext: UserContext; messageText: string }
  | { type: 'rotation_check'; userContext: UserContext; currentGuruId: string | null; daysSinceLastRotation: number; lifetimePhase: number; progressStalled: boolean; rotationsHistory: Array<{ guruId: string; startedAt: string; reason: string }> };

export interface MasterSelection {
  masterId: string;
  masterName: string;
  reason: string;
  confidence: number; // 0-1
  adapted?: boolean;
  mode?: string;
  practice?: string;
  pacingHint?: 'short' | 'medium' | 'deep';
  swapReason?: string;
}

// Crisis keywords (from masterMatching)
const CRISIS_KEYWORDS = [
  "suicid", "kill myself", "end it all", "hurt myself", "don't want to live",
  "want to die", "self harm", "cutting", "overdose", "harm others",
  "killing", "murder", "mujhe mar", "khudkushi", "jaan se maaro",
];

// Mode → master affinity (from session-adapter + chooseMasterForSession)
const MODE_MASTER_AFFINITY: Record<string, string[]> = {
  self_inquiry: ["ramana", "nisargadatta", "shankaracharya"],
  consciousness_checkin: ["ramana", "nisargadatta"],
  shadow_work: ["rumi", "buddha", "ramana"],
  anger: ["rumi", "buddha", "milarepa"],
  inner_child: ["rumi", "anandamayi"],
  breathwork: ["patanjali", "aarav", "shiva"],
  somatic: ["patanjali", "aarav"],
  death_meditation: ["shiva", "milarepa"],
  decision: ["krishna", "vivekananda"],
  task_giver: ["krishna", "vivekananda"],
  philosophy: ["krishna", "shankaracharya", "lao_tzu"],
  pattern_finder: ["buddha", "krishnamurti"],
  loop_explorer: ["buddha", "kabir"],
  dream_analysis: ["buddha", "milarepa"],
  creative: ["lao_tzu", "krishna"],
  manifestation: ["lao_tzu", "krishna"],
  evening_reflection: ["lao_tzu", "rumi"],
  evening_intention: ["lao_tzu", "rumi"],
  observation: ["patanjali", "buddha"],
  therapy: ["rumi", "anandamayi", "milarepa"],
  gratitude: ["rumi", "krishna"],
  future_self: ["ramana", "krishna"],
};

// Dimension → master affinity
const DIMENSION_MASTER_AFFINITY: Record<string, string[]> = {
  mind: ["buddha", "krishnamurti", "shankaracharya"],
  thought: ["buddha", "krishnamurti", "shankaracharya"],
  heart: ["rumi", "meera", "ramakrishna"],
  emotion: ["rumi", "meera", "ramakrishna"],
  body: ["patanjali", "aarav", "shiva"],
  energy: ["patanjali", "aarav", "shiva"],
  spirit: ["ramana", "nisargadatta", "shankaracharya"],
  self: ["ramana", "nisargadatta"],
  action: ["krishna", "vivekananda"],
  purpose: ["krishna", "vivekananda"],
};

// State → master rules (from session-adapter)
const STATE_MASTER_RULES: Record<string, string[]> = {
  dark_night: ["rumi", "anandamayi", "milarepa"],
  bypassing: ["krishna", "marcus", "bodhidharma"],
  breakthrough: ["ramana", "nisargadatta", "shankaracharya"],
  plateau: ["osho", "vivekananda", "kabir"],
  normal: [],
};

// Loop → specialist master (from session-adapter + dynamicGuruSelector + masterRotation)
const LOOP_SPECIALIST_MAP: Record<string, string> = {
  procrastination: "vivekananda",
  validation: "nisargadatta",
  comparison: "kabir",
  control: "lao_tzu",
  perfectionism: "krishna",
  overthinking: "bodhidharma",
  spiritual_bypassing: "kabir",
  shame: "rumi",
  grief: "rumi",
  resentment: "milarepa",
  anxiety: "thich_nhat_hanh",
  attachment: "ashtavakra",
  ego_inflation: "ashtavakra",
  emotional_collapse: "anandamayi",
};

// Life domain → master (from session-adapter)
const DOMAIN_MASTER_RULES: Record<string, string> = {
  money: "krishna",
  work: "krishna",
  relationship: "rumi",
  family: "rumi",
  grief: "rumi",
  meaning: "vivekananda",
  health: "patanjali",
};

// Master → preferred modes (from session-adapter)
const MASTER_MODE_AFFINITY: Record<string, string[]> = {
  ramana: ["self_inquiry", "neti_neti", "witness_meditation"],
  nisargadatta: ["self_inquiry", "neti_neti"],
  buddha: ["witness_meditation", "observation"],
  krishna: ["decision", "values_compass", "task_giver"],
  rumi: ["therapy", "forgiveness", "gratitude"],
  marcus: ["stoic", "cognitive_reframe"],
  patanjali: ["breathwork", "chakra_scan", "witness_meditation"],
  vivekananda: ["task_giver", "purpose_inquiry"],
  lao_tzu: ["observation", "philosophy"],
};

// Band floor → core gurus (from dynamicGuruSelector)
const BAND_CORE_GURUS: Record<number, string[]> = {
  0: ["aarav", "veer"],
  1: ["veer", "aarav", "patanjali"],
  2: ["patanjali", "buddha"],
  3: ["buddha", "rumi"],
  4: ["krishna", "shankaracharya"],
  5: ["shankaracharya", "lao_tzu"],
  6: ["ramana", "nisargadatta"],
  7: ["ramana", "nisargadatta"],
  8: ["nisargadatta", "ramana"],
  9: ["adiyogi", "nisargadatta"],
  10: ["adiyogi"],
};

// Phase → guru map (from masterRotation)
const PHASE_GURU_MAP: Record<number, string[]> = {
  1: ["aarav", "krishnamacharya"],
  2: ["vivekananda", "ramana"],
  3: ["patanjali", "shankaracharya"],
  4: ["buddha", "thich_nhat_hanh"],
  5: ["nisargadatta", "ramana"],
  6: ["shankaracharya", "ashtavakra"],
  7: ["lahiri_mahasaya", "yogananda"],
  8: ["babaji", "trailanga_swami"],
  9: ["ramakrishna", "anandamayi_ma"],
  10: ["silence", "self"],
};

// Practice families for rotation (from session-adapter)
const PRACTICE_FAMILIES: Record<string, string[]> = {
  somatic: ["body_scan", "somatic", "chakra_scan"],
  breath: ["breathwork", "pranayama"],
  inquiry: ["self_inquiry", "neti_neti", "witness_meditation"],
  reflection: ["journal", "evening_reflection", "gratitude"],
  emotional: ["therapy", "forgiveness", "inner_child"],
};

function familyOf(practice: string): string | null {
  for (const [fam, list] of Object.entries(PRACTICE_FAMILIES)) {
    if (list.includes(practice)) return fam;
  }
  return null;
}

// Master display names (minimal set for shared module)
const MASTER_NAMES: Record<string, string> = {
  aarav: "Aarav",
  veer: "Veer",
  dhruv: "Dhruv",
  meera: "Meera",
  arjun: "Arjun",
  aryan: "Aryan",
  mira: "Mira",
  rishi: "Rishi",
  siddh: "Siddh",
  leela: "Leela",
  tara: "Tara",
  anaya: "Anaya",
  kavya: "Kavya",
  ramana: "Ramana Maharshi",
  nisargadatta: "Nisargadatta",
  buddha: "Buddha",
  krishna: "Krishna",
  rumi: "Rumi",
  lao_tzu: "Lao Tzu",
  patanjali: "Patanjali",
  shiva: "Adiyogi Shiva",
  vivekananda: "Vivekananda",
  shankaracharya: "Shankaracharya",
  krishnamacharya: "Krishnamacharya",
  thich_nhat_hanh: "Thich Nhat Hanh",
  ashtavakra: "Ashtavakra",
  kabir: "Kabir",
  milarepa: "Milarepa",
  anandamayi: "Anandamayi Ma",
  bodhidharma: "Bodhidharma",
  marcus: "Marcus Aurelius",
  osho: "Osho",
  krishnamurti: "J. Krishnamurti",
  adiyogi: "Adiyogi",
  lahirimahasaya: "Lahiri Mahasaya",
  yogananda: "Yogananda",
  babaji: "Babaji",
  trailanga_swami: "Trailanga Swami",
  ramakrishna: "Ramakrishna",
  anandamayi_ma: "Anandamayi Ma",
};

/**
 * Main entry point — selects master based on context type
 */
export function selectMaster(ctx: MasterSelectorContext): MasterSelection {
  switch (ctx.type) {
    case 'session_entry':
      return selectMasterForSessionEntry(ctx);
    case 'daily_planning':
      return selectMasterForDailyPlanning(ctx);
    case 'mid_conversation':
      return selectMasterForMidConversation(ctx);
    case 'crisis_triage':
      return selectMasterForCrisisTriage(ctx);
    case 'rotation_check':
      return selectMasterForRotationCheck(ctx);
  }
}

/**
 * SESSION ENTRY — Adapts pre-assigned (master, mode, practice) to current state
 * Mirrors session-adapter logic
 */
function selectMasterForSessionEntry(ctx: MasterSelectorContext & { type: 'session_entry' }): MasterSelection {
  const { userContext, plannedMaster, plannedMode, plannedPractice, timeSlot } = ctx;
  const originalMaster = plannedMaster || null;
  const originalMode = plannedMode || null;
  const originalPractice = plannedPractice || null;

  // Get consciousness state (band, state)
  const band = userContext.spiritual?.overallBand || 0;
  const state = userContext.spiritual?.journeyPhase || "normal";
  // We'd ideally call consciousness-engine here, but for shared module
  // we derive from userContext
  const derivedState = deriveState(userContext);

  // Get active loops
  const topLoopIds = userContext.activeLoops
    ?.sort((a, b) => b.severity - a.severity)
    .slice(0, 3)
    .map(l => l.loopId.toLowerCase()) || [];

  // Get urgent engine signals
  const urgentSignal = userContext.engineSignals?.find(s => (s.urgency || 0) >= 0.7) || null;
  const dominantDomain = userContext.engineSignals?.find(s => s.type === 'domain')?.type || null;

  // Check recent session fatigue
  const recentSessionCount = (userContext.behavior?.sessionsLast7d || 0) > 3 ? 3 : 0;

  // ── DECISION: master ──
  let adaptedMaster = originalMaster;
  let masterReason = "";
  let masterConfidence = 0.5;

  // Priority 1: dark_night state → soft master
  if (derivedState === "dark_night" && !STATE_MASTER_RULES.dark_night.includes(originalMaster || "")) {
    adaptedMaster = STATE_MASTER_RULES.dark_night[0];
    masterReason = "User in dark_night state — swapped to a softer holding voice.";
    masterConfidence = 0.95;
  }
  // Priority 2: urgent loop signal
  else if (urgentSignal?.loopId && LOOP_SPECIALIST_MAP[urgentSignal.loopId.toLowerCase()]) {
    const swap = LOOP_SPECIALIST_MAP[urgentSignal.loopId.toLowerCase()];
    if (swap !== originalMaster) {
      adaptedMaster = swap;
      masterReason = `Active loop "${urgentSignal.loopId}" calls for ${swap}.`;
      masterConfidence = 0.9;
    }
  }
  // Priority 3: top active loop
  else if (topLoopIds[0] && LOOP_SPECIALIST_MAP[topLoopIds[0]] && LOOP_SPECIALIST_MAP[topLoopIds[0]] !== originalMaster) {
    const sev = userContext.activeLoops?.[0]?.severity || 0;
    if (!originalMaster || sev >= 4) {
      adaptedMaster = LOOP_SPECIALIST_MAP[topLoopIds[0]];
      masterReason = `Top active loop "${topLoopIds[0]}" (severity ${sev}) calls for ${adaptedMaster}.`;
      masterConfidence = 0.8;
    }
  }
  // Priority 4: dominant life domain
  else if (dominantDomain && DOMAIN_MASTER_RULES[dominantDomain] && !originalMaster) {
    adaptedMaster = DOMAIN_MASTER_RULES[dominantDomain];
    masterReason = `Life-domain "${dominantDomain}" pulled in ${adaptedMaster}.`;
    masterConfidence = 0.7;
  }
  // Priority 5: state-based deepen/disrupt
  else if (derivedState !== "normal" && STATE_MASTER_RULES[derivedState]?.length && !STATE_MASTER_RULES[derivedState].includes(originalMaster || "")) {
    if (!originalMaster) {
      adaptedMaster = STATE_MASTER_RULES[derivedState][0];
      masterReason = `State "${derivedState}" — selected ${adaptedMaster}.`;
      masterConfidence = 0.6;
    }
  }
  // Priority 6: mode-driven (if no master assigned)
  else if (!adaptedMaster && originalMode && MODE_MASTER_AFFINITY[originalMode]?.length) {
    adaptedMaster = MODE_MASTER_AFFINITY[originalMode][0];
    masterReason = `Mode "${originalMode}" → ${adaptedMaster}.`;
    masterConfidence = 0.5;
  }
  // Priority 7: dimension-driven
  else if (!adaptedMaster) {
    const weakDim = userContext.weakDimensions?.[0];
    if (weakDim && DIMENSION_MASTER_AFFINITY[weakDim]?.length) {
      adaptedMaster = DIMENSION_MASTER_AFFINITY[weakDim][0];
      masterReason = `Weakest dimension "${weakDim}" → ${adaptedMaster}.`;
      masterConfidence = 0.4;
    }
  }
  // Priority 8: band affinity (from dynamicGuruSelector)
  else if (!adaptedMaster) {
    const bandFloor = Math.max(0, Math.min(10, Math.floor(band)));
    const bandGurus = BAND_CORE_GURUS[bandFloor] || BAND_CORE_GURUS[0];
    adaptedMaster = bandGurus[0];
    masterReason = `Band ${band.toFixed(1)} affinity → ${adaptedMaster}.`;
    masterConfidence = 0.3;
  }

  // ── DECISION: mode ──
  let adaptedMode = originalMode;
  let modeReason = "";

  if (urgentSignal?.type === "crisis" || derivedState === "dark_night") {
    adaptedMode = "therapy";
    modeReason = "Crisis/dark_night → emotional support takes priority.";
  } else if (adaptedMaster && adaptedMaster !== originalMaster) {
    const aff = MASTER_MODE_AFFINITY[adaptedMaster] || [];
    if (aff.length && !aff.includes(originalMode || "")) {
      adaptedMode = aff[0];
      modeReason = `Mode aligned to ${adaptedMaster}'s lineage.`;
    }
  }

  // ── DECISION: practice ──
  let adaptedPractice = originalPractice;
  let practiceReason = "";

  if (originalPractice) {
    const fam = familyOf(originalPractice);
    if (derivedState === "dark_night" && fam === "breath") {
      adaptedPractice = "therapy";
      practiceReason = "Skipped intense breath in dark_night; shifted to holding.";
    } else if (band < 2 && (originalPractice === "neti_neti" || originalPractice === "self_inquiry")) {
      adaptedPractice = "observation";
      practiceReason = `Band ${band} too early for deep inquiry — substituted observation.`;
    } else if (fam) {
      // Check recent practice repetition (would need session history)
      // For now, skip rotation logic here
    }
  }

  // ── DECISION: pacing ──
  let pacingHint: 'short' | 'medium' | 'deep' = "medium";
  if (derivedState === "dark_night" || recentSessionCount >= 3) pacingHint = "short";
  else if (derivedState === "breakthrough" || band >= 6) pacingHint = "deep";

  const adapted = adaptedMaster !== originalMaster || adaptedMode !== originalMode || adaptedPractice !== originalPractice;
  const swapReason = [masterReason, modeReason, practiceReason].filter(Boolean).join(" ") || (adapted ? "Adapted to current state." : "Plan still fits — no adaptation needed.");

  return {
    masterId: adaptedMaster,
    masterName: MASTER_NAMES[adaptedMaster] || adaptedMaster,
    reason: masterReason || "Default assignment",
    confidence: masterConfidence,
    adapted,
    mode: adaptedMode || undefined,
    practice: adaptedPractice || undefined,
    pacingHint,
    swapReason,
  };
}

/**
 * DAILY PLANNING — Selects master for the day's sessions
 * Mirrors dynamicGuruSelector logic
 */
function selectMasterForDailyPlanning(ctx: MasterSelectorContext & { type: 'daily_planning' }): MasterSelection {
  const { userContext, excludeGuruIds = [] } = ctx;
  const band = userContext.spiritual?.overallBand || 0;
  const activeLoops = userContext.activeLoops?.map(l => l.loopId.toLowerCase()) || [];
  const themeFocusAreas = userContext.theme?.title ? [userContext.theme.title] : [];
  const themeTitle = userContext.theme?.title || "";

  const bandFloor = Math.max(0, Math.min(10, Math.floor(band)));
  const scores = new Map<string, number>();
  const reasons = new Map<string, string[]>();

  const bump = (guruId: string, points: number, reason: string) => {
    if (excludeGuruIds.includes(guruId)) return;
    scores.set(guruId, (scores.get(guruId) || 0) + points);
    const list = reasons.get(guruId) || [];
    list.push(reason);
    reasons.set(guruId, list);
  };

  // 1) Band-affinity baseline
  const bandGurus = BAND_CORE_GURUS[bandFloor] || BAND_CORE_GURUS[0];
  bandGurus.forEach((id, idx) => bump(id, 4 - idx, `matched to Band ${band.toFixed(1)}`));

  // 2) Active loops (specialist boost)
  for (const loop of activeLoops) {
    const candidates = LOOP_SPECIALIST_MAP[loop] ? [LOOP_SPECIALIST_MAP[loop]] : [];
    candidates.forEach((id, idx) => bump(id, 5 - idx, `specialist for "${loop}"`));
  }

  // 3) Theme focus areas
  const allKeywords = [...themeFocusAreas.map(s => s.toLowerCase()), ...themeTitle.toLowerCase().split(/\s+/)];
  for (const kw of allKeywords) {
    for (const [keyword, gurus] of Object.entries(THEME_KEYWORD_TO_GURU)) {
      if (kw.includes(keyword)) {
        gurus.forEach((id, idx) => bump(id, 3 - idx, `today's theme touches "${keyword}"`));
      }
    }
  }

  // Pick highest scorer
  let best: { id: string; score: number } | null = null;
  for (const [id, score] of scores) {
    if (!best || score > best.score) best = { id, score };
  }

  if (!best) {
    const fallback = bandGurus.find(id => !excludeGuruIds.includes(id)) || bandGurus[0];
    best = { id: fallback, score: 0 };
  }

  const reasonList = reasons.get(best.id) || ["matched to your current state"];
  const reason = reasonList.slice(0, 2).join(" · ");

  return {
    masterId: best.id,
    masterName: MASTER_NAMES[best.id] || best.id,
    reason,
    confidence: Math.min(1, best.score / 10),
  };
}

/**
 * MID-CONVERSATION — Guest master summoning (from guestMasterRoster)
 * Returns null if no guest master should be summoned
 */
function selectMasterForMidConversation(ctx: MasterSelectorContext & { type: 'mid_conversation' }): MasterSelection | null {
  const { messageText, currentMasterId } = ctx;
  const lower = messageText.toLowerCase();

  // Guest master triggers (simplified from guestMasterRoster)
  const GUEST_TRIGGERS: Record<string, string[]> = {
    ramana: ["who am i", "identity", "self", "ego", "self-inquiry"],
    rumi: ["heartbreak", "longing", "love", "loss", "grief", "wound"],
    krishna: ["decision", "action", "duty", "karma", "choice"],
    buddha: ["suffering", "mind", "thoughts", "mindfulness", "awareness"],
    lao_tzu: ["flow", "surrender", "effortless", "wu wei", "nature"],
    patanjali: ["breath", "body", "asana", "yoga", "practice"],
    shiva: ["silence", "dissolution", "destruction", "transformation"],
    vivekananda: ["will", "strength", "courage", "service", "action"],
  };

  for (const [masterId, triggers] of Object.entries(GUEST_TRIGGERS)) {
    if (masterId === currentMasterId) continue; // Don't summon self
    for (const trigger of triggers) {
      if (lower.includes(trigger)) {
        return {
          masterId,
          masterName: MASTER_NAMES[masterId] || masterId,
          reason: `Guest summoned: ${trigger} detected`,
          confidence: 0.8,
          adapted: true,
        };
      }
    }
  }

  return null;
}

/**
 * CRISIS TRIAGE — Returns crisis resources and recommended master
 */
function selectMasterForCrisisTriage(ctx: MasterSelectorContext & { type: 'crisis_triage' }): MasterSelection {
  const { messageText } = ctx;
  const lower = messageText.toLowerCase();

  const isCrisis = CRISIS_KEYWORDS.some(kw => lower.includes(kw));
  if (isCrisis) {
    return {
      masterId: "rumi",
      masterName: "Rumi",
      reason: "Crisis detected — Rumi for compassionate holding",
      confidence: 1.0,
      mode: "therapy",
    };
  }

  // Non-crisis: fall back to daily planning logic
  return selectMasterForDailyPlanning({ type: 'daily_planning', userContext: ctx.userContext });
}

/**
 * ROTATION CHECK — Determines if rotation should occur
 * Mirrors masterRotation logic
 */
function selectMasterForRotationCheck(ctx: MasterSelectorContext & { type: 'rotation_check' }): MasterSelection {
  const { userContext, currentGuruId, daysSinceLastRotation, lifetimePhase, progressStalled, rotationsHistory } = ctx;
  const dominantLoop = userContext.activeLoops?.[0]?.loopId?.toLowerCase() || null;
  const loopSeverity = userContext.activeLoops?.[0]?.severity || 0;

  const phaseGurus = PHASE_GURU_MAP[lifetimePhase] || PHASE_GURU_MAP[1];

  // 1. Initial match
  if (!currentGuruId) {
    return {
      masterId: phaseGurus[0],
      masterName: MASTER_NAMES[phaseGurus[0]] || phaseGurus[0],
      reason: "initial_match",
      confidence: 1.0,
    };
  }

  // 2. Phase 10 — silent mode
  if (lifetimePhase >= 10) {
    if (currentGuruId !== "silence") {
      return {
        masterId: "silence",
        masterName: "Silence",
        reason: "phase_transition",
        confidence: 1.0,
      };
    }
    return { masterId: currentGuruId, masterName: MASTER_NAMES[currentGuruId] || currentGuruId, reason: "silence_phase", confidence: 1.0 };
  }

  // 3. Severe loop → specialist takeover
  if (dominantLoop && loopSeverity >= 0.7) {
    const specialist = LOOP_SPECIALIST_MAP[dominantLoop];
    if (specialist && specialist !== currentGuruId) {
      return {
        masterId: specialist,
        masterName: MASTER_NAMES[specialist] || specialist,
        reason: "loop_specialist",
        confidence: 0.95,
      };
    }
  }

  // 4. Stagnation → rotate within phase
  if (progressStalled && daysSinceLastRotation >= 14) {
    const next = phaseGurus.find(g => g !== currentGuruId) || phaseGurus[0];
    return {
      masterId: next,
      masterName: MASTER_NAMES[next] || next,
      reason: "stagnation",
      confidence: 0.7,
    };
  }

  // 5. Scheduled rotation
  if (daysSinceLastRotation >= 21) {
    const recentIds = rotationsHistory.slice(-3).map(r => r.guruId);
    const fresh = phaseGurus.find(g => !recentIds.includes(g)) || phaseGurus[0];
return {
    masterId: fresh,
    masterName: MASTER_NAMES[fresh] || fresh,
    reason: "scheduled",
    confidence: 0.6,
  };
}

  // No rotation
  return {
    masterId: currentGuruId,
    masterName: MASTER_NAMES[currentGuruId] || currentGuruId,
    reason: "no_rotation_needed",
    confidence: 1.0,
  };
}

// Export individual functions for client compatibility
export function selectMasterForSession(ctx: MasterChoiceContext): MasterChoice {
  // This is a stub - the real client implementation is in src/lib/shared/masterSelector.ts
  return { id: 'ramana', name: 'Ramana Maharshi', reason: 'Server-side function', confidence: 0 };
}

export function selectMasterForRotation(ctx: {
  userId: string;
  currentGuruId: string | null;
  daysSinceLastRotation: number;
  lifetimePhase: number;
  dominantLoop: string | null;
  loopSeverity: number;
  avgQualityLast7Days: number;
  progressStalled: boolean;
  rotationsHistory: Array<{ guruId: string; startedAt: string; reason: string }>;
}): { shouldRotate: boolean; newGuruId: string; reason: string; durationDays: number; message: string } {
  // Convert to rotation_check context and call selectMaster
  // Simplified - real implementation would need full userContext
  return { shouldRotate: false, newGuruId: ctx.currentGuruId || 'ramana', reason: 'no_rotation_needed', durationDays: 0, message: '' };
}

// Type exports for client
export interface MasterChoiceContext {
  mode?: string;
  dimension?: string;
  sessionType?: "morning" | "evening" | "night";
  journeyDay?: number;
  bandLevel?: number;
}

export interface MasterChoice {
  id: string;
  name: string;
  tradition?: string;
  keyTeaching?: string;
  quote?: string;
  reason: string;
  confidence?: number;
}

/**
 * Derive state from userContext (simplified from consciousness-engine)
 */
function deriveState(userContext: UserContext): string {
  const baseline = userContext.spiritual?.vLevelBaseline || 0;
  const current = userContext.spiritual?.vLevelCurrent || 0;
  const journeyDay = userContext.spiritual?.journeyDay || 1;
  const band = Math.floor(baseline);

  if (current < baseline - 0.5) return "dark_night";

  // Bypassing risk (simplified)
  const dims = userContext.spiritual?.dimensionBands || {};
  let bypassingRisk = 0;
  if ((dims.thought || 0) > (dims.emotion || 0) + 2) bypassingRisk += 0.3;
  if ((dims.emotion || 0) < 1.5 && ((userContext.behavior as any)?.streakCurrent || 0) > 7 && (dims.thought || 0) > 2) bypassingRisk += 0.25;
  if (journeyDay < 30 && (userContext.spiritual?.vLevelPeak || 0) > 4) bypassingRisk += 0.35;
  if (bypassingRisk > 0.4) return "bypassing";

  if (band < 7) {
    const expectedDays = [7, 14, 30, 60, 90, 180, 365][band] || 30;
    if (journeyDay > expectedDays * 2 && Math.floor(current) === band) return "plateau";
  }

  if (current > baseline + 0.3) return "breakthrough";

  return "normal";
}

// Theme keyword → guru affinity (from dynamicGuruSelector)
const THEME_KEYWORD_TO_GURU: Record<string, string[]> = {
  silence: ["ramana", "nisargadatta"],
  surrender: ["krishna", "rumi"],
  devotion: ["rumi", "krishna"],
  inquiry: ["ramana", "shankaracharya"],
  witness: ["patanjali", "ramana"],
  compassion: ["buddha", "rumi"],
  presence: ["ramana", "buddha"],
  flow: ["lao_tzu", "krishna"],
  action: ["krishna", "vivekananda"],
  body: ["patanjali", "aarav"],
  breath: ["patanjali", "aarav"],
};