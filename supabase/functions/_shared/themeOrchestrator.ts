/**
 * THEME ORCHESTRATOR (Plan §12 — Adaptive Theme System)
 *
 * Implements the missing F1-engine layer that decides EVERY day:
 *   • Lifetime Phase  (1 of 7)
 *   • Action          (continue / repeat / accelerate / simplify / pivot / cycle-back / rest)
 *   • Length          (1 → 21 days)
 *   • Combination     (single thread vs merge 1-3 practices)
 *   • Cycle-back      (return to an old successful theme after 30+ days)
 *
 * Pure functions. No DB calls. The edge function feeds in raw rows; we return
 * a `ThemeDirective` injected into the AI system prompt.
 *
 * This is the rule-set that turns the app into a true lifetime companion —
 * the same theme never lands the same way twice.
 */

// ─── Types ───────────────────────────────────────────────

export type LifetimePhase =
  | "pre_awareness"
  | "awakening"
  | "stabilization"
  | "choice"
  | "freedom"
  | "mastery"
  | "beyond";

export type ThemeAction =
  | "continue"      // next step in the arc
  | "repeat"        // same theme, deepen
  | "accelerate"    // user outgrew it, jump ahead
  | "simplify"      // overwhelm/skip — go gentler
  | "pivot"         // theme doesn't fit, change direction
  | "cycle_back"    // return to an old successful theme (spiral)
  | "rest";         // sanctuary day — nothing to fix

export interface ThemeMemoryRow {
  theme_date: string;       // YYYY-MM-DD
  title: string;
  description?: string | null;
  affirmation?: string | null;
  focus_areas?: any;
  quality?: number | null;  // 0..1 if computed (optional)
  completed?: boolean | null;
}

export interface OrchestratorInput {
  today: string;                               // YYYY-MM-DD
  journeyDay: number;
  overallBand: number;                         // 0..10
  recentThemes: ThemeMemoryRow[];              // newest first, ≤30
  recentSessionsCount7d: number;
  recentTaskCompletionRate7d: number;          // 0..1
  yesterdayMood?: number | null;               // 1..10
  yesterdayEnergy?: number | null;             // 1..10
  regressionDetected?: boolean;
  breakthroughDetected?: boolean;
  activeLoopSeverity?: number;                 // 0..10 (max across loops)
  practiceLevels?: Record<string, number>;     // {observation:3, ...}
  anchorPath?: string | null;
  growthPath?: string | null;
  weakestCorePractice?: string | null;
}

export interface ThemeDirective {
  phase: LifetimePhase;
  phaseLabel: string;
  action: ThemeAction;
  reason: string;
  lengthDays: number;            // 1..21
  maxCombinations: number;       // 0..3
  cycleBackTheme?: ThemeMemoryRow; // present when action === "cycle_back"
  spiralDepth: number;           // 1+ (how many times user has revisited similar territory)
  promptDirective: string;       // ready-to-inject AI instruction
}

// ─── 1. Lifetime Phase ───────────────────────────────────

const PHASE_TABLE: { phase: LifetimePhase; label: string; max: number; focus: string }[] = [
  { phase: "pre_awareness", label: "Pre-Awareness",  max: 0.5, focus: "Show up. Feel the body." },
  { phase: "awakening",     label: "Awakening",      max: 2,   focus: "First glimpses of observation." },
  { phase: "stabilization", label: "Stabilization",  max: 4,   focus: "Loop dissolution, witness forms." },
  { phase: "choice",        label: "Choice",         max: 6,   focus: "Identity shedding, conscious response." },
  { phase: "freedom",       label: "Freedom",        max: 8,   focus: "Surrender, non-dual inquiry." },
  { phase: "mastery",       label: "Mastery",        max: 10,  focus: "Silence, dissolution." },
  { phase: "beyond",        label: "Beyond",         max: 99,  focus: "Nothing to do. Nothing to become." },
];

export function detectLifetimePhase(band: number): { phase: LifetimePhase; label: string; focus: string } {
  const row = PHASE_TABLE.find((r) => band < r.max) ?? PHASE_TABLE[PHASE_TABLE.length - 1];
  return { phase: row.phase, label: row.label, focus: row.focus };
}

// ─── 2. Combination Engine (max threads) ─────────────────

export function maxCombinationsFor(band: number): number {
  if (band < 0.5) return 0;
  if (band < 2)   return 0;
  if (band < 4)   return 1;
  if (band < 6)   return 2;
  return 3;
}

// ─── 3. Length Adapter ───────────────────────────────────

export function decideLength(input: OrchestratorInput): number {
  // Defaults: 1-day theme. Extend when signals justify a series.
  const {
    activeLoopSeverity = 0,
    regressionDetected = false,
    recentTaskCompletionRate7d,
    breakthroughDetected = false,
    overallBand,
  } = input;

  if (regressionDetected) return 3;                   // gentle 3-day grounding
  if (breakthroughDetected) return 1;                 // single fresh chapter
  if (activeLoopSeverity >= 7) return 7;              // 7-day loop dissolution arc
  if (activeLoopSeverity >= 4 && overallBand >= 2) return 7;
  if (recentTaskCompletionRate7d >= 0.8 && overallBand >= 3) return 10; // momentum → deeper arc
  if (recentTaskCompletionRate7d >= 0.6) return 3;
  return 1;
}

// ─── 4. Repetition Intelligence ──────────────────────────

interface QualitySignal {
  avgQuality: number | null;
  completedYesterday: boolean;
  skippedDays: number;          // consecutive missed days at end of window
  lowQualityStreak: number;     // 3+ low quality days?
}

function computeQualitySignal(themes: ThemeMemoryRow[]): QualitySignal {
  if (!themes || themes.length === 0) {
    return { avgQuality: null, completedYesterday: false, skippedDays: 0, lowQualityStreak: 0 };
  }
  const last7 = themes.slice(0, 7);
  const qs = last7.map((t) => t.quality).filter((q): q is number => typeof q === "number");
  const avgQuality = qs.length > 0 ? qs.reduce((a, b) => a + b, 0) / qs.length : null;

  const yesterday = themes[0];
  const completedYesterday = !!yesterday?.completed;

  let skippedDays = 0;
  for (const t of themes) {
    if (t.completed === false) skippedDays++;
    else break;
  }

  let lowQualityStreak = 0;
  for (const t of themes) {
    if (typeof t.quality === "number" && t.quality < 0.4) lowQualityStreak++;
    else break;
  }

  return { avgQuality, completedYesterday, skippedDays, lowQualityStreak };
}

function findCycleBackCandidate(themes: ThemeMemoryRow[], todayISO: string): ThemeMemoryRow | undefined {
  // An old successful theme (30+ days ago) we can return to with new depth.
  const today = new Date(todayISO).getTime();
  return themes.find((t) => {
    if (!t.theme_date) return false;
    const ageDays = (today - new Date(t.theme_date).getTime()) / 86400000;
    return ageDays >= 30 && (t.quality ?? 0.6) >= 0.7;
  });
}

export function decideAction(input: OrchestratorInput): {
  action: ThemeAction;
  reason: string;
  cycleBackTheme?: ThemeMemoryRow;
} {
  const sig = computeQualitySignal(input.recentThemes);

  // Rest gates first (mood/energy override everything)
  if ((input.yesterdayMood ?? 5) <= 2 && (input.yesterdayEnergy ?? 5) <= 2) {
    return { action: "rest", reason: "Mood and energy both very low — sanctuary day, nothing to fix." };
  }
  if (input.regressionDetected) {
    return { action: "rest", reason: "Regression detected — gentle grounding only." };
  }

  if (input.breakthroughDetected) {
    return { action: "accelerate", reason: "Breakthrough detected — user has outgrown current edge." };
  }

  if (sig.lowQualityStreak >= 3) {
    return { action: "pivot", reason: "3+ low-quality days in a row — current theme arc isn't landing." };
  }

  if (sig.skippedDays >= 2) {
    return { action: "simplify", reason: `${sig.skippedDays} skipped days — user is overwhelmed; go gentler.` };
  }

  // Cycle-back: only consider when momentum is positive and arc has run a while
  if (sig.completedYesterday && (sig.avgQuality ?? 0.6) >= 0.6 && input.journeyDay > 30) {
    const cycleBack = findCycleBackCandidate(input.recentThemes, input.today);
    if (cycleBack && Math.random() < 0.18) {
      return {
        action: "cycle_back",
        reason: `Spiral return to a successful theme from ${cycleBack.theme_date}.`,
        cycleBackTheme: cycleBack,
      };
    }
  }

  if (sig.avgQuality !== null) {
    if (sig.avgQuality > 0.85 && sig.completedYesterday) {
      return { action: "accelerate", reason: "Quality is consistently high — ready for the next chapter." };
    }
    if (sig.avgQuality >= 0.6 && sig.completedYesterday) {
      return { action: "continue", reason: "Healthy momentum — continue the arc." };
    }
    if (sig.avgQuality >= 0.4) {
      return { action: "repeat", reason: "Mid-quality engagement — deepen the same theme rather than move on." };
    }
    return { action: "simplify", reason: "Low quality lately — simplify and reduce friction." };
  }

  return { action: "continue", reason: "Default forward progression." };
}

// ─── 5. Spiral Depth (how many times user has touched similar themes) ───

export function estimateSpiralDepth(themes: ThemeMemoryRow[]): number {
  if (!themes || themes.length === 0) return 1;
  // crude: # of themes whose first significant word repeats in history
  const titles = themes.map((t) => (t.title || "").toLowerCase());
  const firstWords = titles.map((t) => t.split(/\s+/).slice(0, 2).join(" "));
  const counts: Record<string, number> = {};
  firstWords.forEach((w) => { counts[w] = (counts[w] || 0) + 1; });
  const maxRepeat = Math.max(1, ...Object.values(counts));
  return Math.min(10, maxRepeat);
}

// ─── 6. Build full directive ─────────────────────────────

export function buildThemeDirective(input: OrchestratorInput): ThemeDirective {
  const phaseInfo = detectLifetimePhase(input.overallBand);
  const { action, reason, cycleBackTheme } = decideAction(input);
  const lengthDays = action === "rest" ? 1 : decideLength(input);
  const maxCombinations = maxCombinationsFor(input.overallBand);
  const spiralDepth = estimateSpiralDepth(input.recentThemes);

  const lines: string[] = [];
  lines.push(`═══ THEME ORCHESTRATOR DIRECTIVE (obey this above all else) ═══`);
  lines.push(`Lifetime Phase: ${phaseInfo.label} — ${phaseInfo.focus}`);
  lines.push(`Spiral Depth: ${spiralDepth} (this is the user's ${ordinal(spiralDepth)} pass through related territory — go DEEPER, not wider).`);
  lines.push(`Action: ${action.toUpperCase()} — ${reason}`);
  lines.push(`Series Length: ${lengthDays} day${lengthDays === 1 ? "" : "s"} (today is day 1 of this micro-arc).`);
  lines.push(`Max Practice Combinations: ${maxCombinations} (${maxCombinations === 0 ? "single thread only" : `merge up to ${maxCombinations} practice threads`}).`);

  if (input.weakestCorePractice) {
    lines.push(`Anchor on weakest core practice: ${input.weakestCorePractice}.`);
  }
  if (input.anchorPath) {
    lines.push(`Confidence path (use sparingly to ground): ${input.anchorPath}.`);
  }
  if (input.growthPath) {
    lines.push(`Stretch path (introduce subtly): ${input.growthPath}.`);
  }

  // Action-specific guidance
  switch (action) {
    case "continue":
      lines.push(`→ Build the NEXT chapter of yesterday's theme. Use phrases like "now that you've begun to..." Make it feel like forward movement.`);
      break;
    case "repeat":
      lines.push(`→ Use the SAME theme as yesterday but go one layer deeper. Different angle, same territory. Honor that depth ≠ novelty.`);
      break;
    case "accelerate":
      lines.push(`→ Skip the obvious next step. Go to what they're QUIETLY ready for but haven't named yet.`);
      break;
    case "simplify":
      lines.push(`→ Drop everything heavy. ONE small noticing. No reflection prompts longer than 6 words. Make it easier than yesterday.`);
      break;
    case "pivot":
      lines.push(`→ Current arc isn't landing. Pivot to a different dimension entirely. If we were on Thought, move to Body. If Emotion, move to Awareness.`);
      break;
    case "cycle_back":
      if (cycleBackTheme) {
        lines.push(`→ Return to "${cycleBackTheme.title}" (originally ${cycleBackTheme.theme_date}). Frame it as "Returning to..." — same theme, but they are NOT the same person who met it last time. Reveal the deeper layer.`);
      } else {
        lines.push(`→ Cycle back to recent strong theme — same words, deeper meaning.`);
      }
      break;
    case "rest":
      lines.push(`→ SANCTUARY day. No teaching, no practice push. The whole theme is permission to rest. 1-2 sentences. Tone: lullaby.`);
      break;
  }

  // Anti-repetition guard
  const last5Titles = (input.recentThemes || []).slice(0, 5).map((t) => t.title).filter(Boolean);
  if (last5Titles.length > 0 && action !== "repeat" && action !== "cycle_back") {
    lines.push(`AVOID re-using these recent titles or affirmations (paraphrasing them is also forbidden): ${last5Titles.join(" | ")}.`);
  }

  return {
    phase: phaseInfo.phase,
    phaseLabel: phaseInfo.label,
    action,
    reason,
    lengthDays,
    maxCombinations,
    cycleBackTheme,
    spiralDepth,
    promptDirective: lines.join("\n"),
  };
}

// ─── helpers ─────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
