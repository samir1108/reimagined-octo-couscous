/**
 * session-contract.ts — the single step/plan contract shared by the edge
 * composer, the local orchestrator and the client shell.
 *
 * Why this file exists:
 *   The old pipeline asked the model for `{kind,title,prompt,est_minutes}` and
 *   then trusted it. That produced one-line steps, empty widget params, fake
 *   durations and unattributable "whyForYou" text. This module makes a step a
 *   *behavioural contract*: a 3–5 beat script, a real duration, bound params
 *   that drive the widget, and a signal reference that can be resolved.
 *
 * Pure TypeScript — no Deno, no browser APIs — so it can be imported by the
 * edge functions AND by `src/` (through src/supabase/_shared/session-contract).
 */

export type StepKind =
  | "wisdom-read"
  | "breathwork"
  | "journal"
  | "micro-act"
  | "reflection"
  | "guide-chat"
  | "practice"
  | "temple-chat"
  | "witness";

export const STEP_KINDS: StepKind[] = [
  "wisdom-read",
  "breathwork",
  "journal",
  "micro-act",
  "reflection",
  "guide-chat",
  "practice",
  "temple-chat",
  "witness",
];

export interface ContractStep {
  kind: StepKind;
  title: string;
  /** 3–5 lines: setup → one concrete action → what not to do → stop condition. */
  script?: string[];
  /** Legacy single instruction. Always mirrored into `script[0]` when missing. */
  prompt?: string;
  est_minutes?: number;
  /** Authoritative duration. Widgets must obey this, not est_minutes. */
  durationSeconds?: number;
  params?: Record<string, unknown>;
  whyForYou?: string;
  signalRef?: string;
  keystone?: boolean;
  optional?: boolean;
}

export interface ContractPlan {
  id?: string;
  intent: string;
  intro: string;
  steps: ContractStep[];
}

export interface PlanIssue {
  stepIndex: number | null;
  code: string;
  message: string;
}

export interface ContractValidation {
  ok: boolean;
  plan: ContractPlan;
  errors: PlanIssue[];
  warnings: PlanIssue[];
  quality: ContentQuality;
}

export interface ContentQuality {
  /** 0..1 overall */
  score: number;
  breakdown: {
    signalFidelity: number;
    scriptDepth: number;
    paramBinding: number;
    interaction: number;
    timeFidelity: number;
    sequence: number;
    variety: number;
  };
}

// ── Per-kind rules ──────────────────────────────────────────────────────────

export interface KindRule {
  minMinutes: number;
  maxMinutes: number;
  defaultMinutes: number;
  allowedParams: string[];
  requiredParams: string[];
  /** Steps that must have a real, non-instant interaction. */
  interactive: boolean;
  /** Good titles start with one of these (or an imperative form). */
  verbs: string[];
}

export const KIND_RULES: Record<StepKind, KindRule> = {
  breathwork: {
    minMinutes: 1, maxMinutes: 10, defaultMinutes: 3,
    allowedParams: ["pattern", "durationSeconds", "cycles", "description", "why"],
    requiredParams: ["pattern"],
    interactive: true,
    verbs: ["breathe", "drop", "let", "sit", "close", "settle"],
  },
  witness: {
    minMinutes: 3, maxMinutes: 20, defaultMinutes: 5,
    allowedParams: ["durationSeconds", "object", "level"],
    requiredParams: ["durationSeconds"],
    interactive: true,
    verbs: ["sit", "watch", "notice", "stay", "observe", "let"],
  },
  journal: {
    minMinutes: 2, maxMinutes: 8, defaultMinutes: 3,
    allowedParams: ["minChars", "questions", "maxChars"],
    requiredParams: ["questions"],
    interactive: true,
    verbs: ["write", "name", "say", "tell", "put"],
  },
  reflection: {
    minMinutes: 1, maxMinutes: 3, defaultMinutes: 2,
    allowedParams: ["maxChars", "summary"],
    requiredParams: [],
    interactive: true,
    verbs: ["close", "seal", "carry", "name", "say", "keep"],
  },
  "micro-act": {
    minMinutes: 1, maxMinutes: 2, defaultMinutes: 2,
    allowedParams: ["act", "window", "reminder"],
    requiredParams: ["act"],
    interactive: true,
    verbs: ["do", "give", "send", "stand", "pause", "touch"],
  },
  practice: {
    minMinutes: 3, maxMinutes: 20, defaultMinutes: 6,
    allowedParams: ["family", "level", "exercise", "durationSeconds", "object"],
    requiredParams: ["family", "exercise"],
    interactive: true,
    verbs: ["begin", "sit", "stay", "practise", "practice", "hold"],
  },
  "wisdom-read": {
    minMinutes: 2, maxMinutes: 6, defaultMinutes: 3,
    allowedParams: ["passage", "source", "maxWords", "highlightPrompt"],
    requiredParams: ["passage"],
    interactive: true,
    verbs: ["read", "receive", "open", "hold"],
  },
  "guide-chat": {
    minMinutes: 2, maxMinutes: 8, defaultMinutes: 4,
    allowedParams: ["openingQuestion", "maxTurns"],
    requiredParams: ["openingQuestion"],
    interactive: true,
    verbs: ["speak", "say", "tell", "answer", "ask"],
  },
  "temple-chat": {
    minMinutes: 2, maxMinutes: 8, defaultMinutes: 4,
    allowedParams: ["masterId", "question", "maxTurns"],
    requiredParams: ["question"],
    interactive: true,
    verbs: ["sit", "ask", "enter", "wait", "speak"],
  },
};

const SIGNAL_RE = /^(closure|(loop|dim|dimension|chakra|practice|memory|gate|theme|session):[a-z0-9_\-:.]+)$/i;

// ── Normalisation ───────────────────────────────────────────────────────────

function clampMinutes(kind: StepKind, minutes: number): number {
  const rule = KIND_RULES[kind];
  const n = Number.isFinite(minutes) ? minutes : rule.defaultMinutes;
  return Math.max(rule.minMinutes, Math.min(rule.maxMinutes, n));
}

function sentenceSplit(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Provenance keys are not widget params — they tell the learning loop which
 * ingredient/archetype/slot produced this step. They must survive
 * normalization, otherwise `session_ingredients` rows are written under a
 * `kind:title` id that never matches the composer's ingredient bank, and both
 * the freshness penalty and the learned-fit term die silently.
 */
export const PROVENANCE_PARAMS = [
  "ingredientId",
  "slotRole",
  "archetypeId",
  "plannedMinutes",
  "widgetId",
] as const;

const PROVENANCE_KEYS = new Set<string>(PROVENANCE_PARAMS);

function sanitizeParams(kind: StepKind, raw: unknown): Record<string, unknown> {
  const allowed = new Set(KIND_RULES[kind].allowedParams);
  const out: Record<string, unknown> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!allowed.has(key) && !PROVENANCE_KEYS.has(key)) continue;
    if (value == null) continue;
    if (typeof value === "object") {
      out[key] = value;
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function normalizeContractStep(raw: Partial<ContractStep> | null | undefined): ContractStep {
  const kind = (STEP_KINDS.includes(raw?.kind as StepKind) ? raw?.kind : "reflection") as StepKind;
  const rule = KIND_RULES[kind];

  const params = sanitizeParams(kind, raw?.params);
  const minutes = clampMinutes(
    kind,
    Number(raw?.est_minutes ?? (Number(params.durationSeconds) ? Number(params.durationSeconds) / 60 : rule.defaultMinutes)),
  );

  const durationSeconds = Math.max(
    rule.minMinutes * 60,
    Math.min(
      rule.maxMinutes * 60,
      Number(raw?.durationSeconds ?? params.durationSeconds ?? minutes * 60) || minutes * 60,
    ),
  );
  if (kind === "witness" || kind === "practice" || kind === "breathwork" || kind === "wisdom-read" || kind === "temple-chat" || kind === "guide-chat") {
    // The widget reads duration from params — keep them in sync.
    params.durationSeconds = durationSeconds;
  }

  const prompt = typeof raw?.prompt === "string" ? raw.prompt.slice(0, 1200) : undefined;
  let script = Array.isArray(raw?.script)
    ? raw!.script.filter((line) => typeof line === "string" && line.trim().length > 0).map((line) => line.trim().slice(0, 320))
    : [];
  if (script.length === 0) {
    const candidate = prompt && prompt.trim().length > 0 ? sentenceSplit(prompt) : [];
    script = candidate.length >= 2 ? candidate.slice(0, 5) : candidate;
  }
  if (script.length > 0) script = script.slice(0, 5);

  const whyForYou = typeof raw?.whyForYou === "string" ? raw.whyForYou.trim().slice(0, 280) : undefined;
  const signalRef = typeof raw?.signalRef === "string" ? raw.signalRef.trim().slice(0, 80) : undefined;

  return {
    kind,
    title: String(raw?.title || `One ${kind.replace("-", " ")}`).slice(0, 120),
    script,
    prompt: prompt ?? script[0],
    est_minutes: Math.round(durationSeconds / 60),
    durationSeconds,
    params,
    whyForYou,
    signalRef,
    optional: raw?.optional === true,
    keystone: raw?.keystone === true,
  };
}

export function normalizePlan(raw: Partial<ContractPlan> | null | undefined): ContractPlan {
  const steps = Array.isArray(raw?.steps) ? raw!.steps.map((s) => normalizeContractStep(s)) : [];
  return {
    id: raw?.id,
    intent: String(raw?.intent || "A sitting shaped for right now").slice(0, 200),
    intro: String(raw?.intro || "").slice(0, 500),
    steps,
  };
}

// ── Duration fitting ────────────────────────────────────────────────────────

/**
 * Fit the plan to the time budget in BOTH directions. The old code only shrank
 * plans, which is how a 10-minute practice quietly became one minute.
 */
export function fitPlanToBudget(plan: ContractPlan, budgetMin: number): ContractPlan {
  let steps = plan.steps.map((s) => normalizeContractStep(s));
  if (!steps.length) return plan;
  const target = Math.max(60, Math.round((Number(budgetMin) || 8) * 60));

  const scaleStep = (step: ContractStep, factor: number) => {
    const rule = KIND_RULES[step.kind];
    const next = Math.round((step.durationSeconds || rule.defaultMinutes * 60) * factor);
    step.durationSeconds = Math.max(rule.minMinutes * 60, Math.min(rule.maxMinutes * 60, next));
    step.est_minutes = Math.max(1, Math.round((step.durationSeconds || 0) / 60));
    if (step.params && typeof step.params === "object") {
      if ("durationSeconds" in step.params || step.kind !== "journal") {
        step.params.durationSeconds = step.durationSeconds;
      }
    }
  };

  let total = steps.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  if (total <= 0) return plan;

  if (total !== target) scaleStepAll(steps, target / total, scaleStep);
  total = steps.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

  // Per-kind minimums can keep a plan above its budget. Drop the tail steps
  // (never below two) until it fits instead of shipping a sitting that runs
  // 40% long.
  while (total > target * 1.05 && steps.length > 2) {
    steps = steps.slice(0, -1);
    total = steps.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    if (total > target) scaleStepAll(steps, target / total, scaleStep);
    total = steps.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  }

  return { ...plan, steps };
}

function scaleStepAll(
  steps: ContractStep[],
  factor: number,
  scaleStep: (step: ContractStep, factor: number) => void,
): void {
  for (const step of steps) scaleStep(step, factor);
}

// ── Variety: duplicate/stale steps ──────────────────────────────────────────

function titleKey(step: ContractStep): string {
  return String(step.title || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scriptKey(step: ContractStep): string {
  return (step.script || [])
    .map((line) => String(line || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim())
    .join("|");
}

/**
 * Removes steps the user would experience as the same step twice.
 *
 * Two rules, both deterministic:
 *   1. Same kind + same normalized title → keep the first only.
 *   2. Identical script text (regardless of title) → keep the first only.
 *
 * A kind may appear twice only when the content genuinely differs (write at
 * the open and the close). Beyond two, the extras are dropped.
 */
export function dedupePlanSteps(plan: ContractPlan): ContractPlan {
  const kept: ContractStep[] = [];
  const seenTitle = new Set<string>();
  const seenScript = new Set<string>();
  const perKind = new Map<string, number>();

  for (const step of plan.steps) {
    const tKey = `${step.kind}:${titleKey(step)}`;
    const sKey = scriptKey(step);
    if (seenTitle.has(tKey)) continue;
    if (sKey.length > 0 && seenScript.has(sKey)) continue;
    const count = perKind.get(step.kind) ?? 0;
    if (count >= 2) continue;
    seenTitle.add(tKey);
    if (sKey.length > 0) seenScript.add(sKey);
    perKind.set(step.kind, count + 1);
    kept.push(step);
  }

  return kept.length === plan.steps.length ? plan : { ...plan, steps: kept };
}

/** Stable identity of what the user will actually experience. */
export function planSignature(plan: ContractPlan): string {
  return plan.steps.map((s) => `${s.kind}:${titleKey(s)}`).join(" > ");
}


// ── Keystone + validation ───────────────────────────────────────────────────

const KEYSTONE_PREFERENCE: StepKind[] = ["practice", "witness", "journal", "micro-act", "reflection"];

export function assignKeystone(plan: ContractPlan): ContractPlan {
  const steps = plan.steps.map((s) => ({ ...s, keystone: false }));
  if (!steps.length) return { ...plan, steps };
  let idx = -1;
  for (const kind of KEYSTONE_PREFERENCE) {
    const found = steps.findIndex((s) => s.kind === kind && !s.optional);
    if (found >= 0) {
      idx = found;
      break;
    }
  }
  if (idx < 0) {
    idx = steps.reduce((best, s, i) => ((s.durationSeconds || 0) > (steps[best].durationSeconds || 0) ? i : best), 0);
  }
  steps[idx].keystone = true;
  return { ...plan, steps };
}

function words(text: string | undefined): number {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function hasInteraction(step: ContractStep): boolean {
  const rule = KIND_RULES[step.kind];
  if (!rule.interactive) return true;
  const params = step.params || {};
  return rule.requiredParams.every((key) => {
    const value = params[key];
    if (Array.isArray(value)) return value.length > 0;
    return value != null && String(value).trim().length > 0;
  });
}

/**
 * Hard gate. Returns the normalised plan plus every issue. `ok` means the plan
 * is shippable at >= 85 content quality.
 */
export function validateContractPlan(
  raw: ContractPlan,
  opts: { budgetMin?: number; requireScript?: boolean } = {},
): ContractValidation {
  const budgetMin = Number(opts.budgetMin) || 8;
  let plan = dedupePlanSteps(normalizePlan(raw));
  const errors: PlanIssue[] = [];
  const warnings: PlanIssue[] = [];

  if (!plan.steps.length) {
    errors.push({ stepIndex: null, code: "empty", message: "Plan has no steps." });
  }

  plan.steps.forEach((step, i) => {
    const rule = KIND_RULES[step.kind];
    const scriptWords = (step.script || []).reduce((sum, line) => sum + words(line), 0);

    if (!step.title || words(step.title) < 2) {
      warnings.push({ stepIndex: i, code: "title", message: "Title is too short to be imperative." });
    }
    const first = (step.title || "").toLowerCase();
    if (!rule.verbs.some((verb) => first.startsWith(verb))) {
      warnings.push({ stepIndex: i, code: "title-verb", message: `"${step.title}" does not open with an action verb.` });
    }

    const needsScript = opts.requireScript !== false;
    if (needsScript) {
      if ((step.script || []).length < 3) {
        errors.push({ stepIndex: i, code: "script-short", message: "Step needs a 3–5 beat script." });
      }
      if (scriptWords < 40) {
        errors.push({ stepIndex: i, code: "script-thin", message: `Script is only ${scriptWords} words (min 40).` });
      }
      if (scriptWords > 200) {
        warnings.push({ stepIndex: i, code: "script-long", message: "Script runs long; users will skim it." });
      }
    }

    if (!step.whyForYou || step.whyForYou.length < 12) {
      errors.push({ stepIndex: i, code: "why-missing", message: "whyForYou must name a specific signal." });
    }
    if (!step.signalRef || !SIGNAL_RE.test(step.signalRef)) {
      errors.push({ stepIndex: i, code: "signal-ref", message: "signalRef is missing or malformed." });
    }

    if (!hasInteraction(step)) {
      errors.push({
        stepIndex: i,
        code: "no-interaction",
        message: `Step ${step.kind} is missing required params: ${rule.requiredParams.join(", ")}.`,
      });
    }

    const minutes = (step.durationSeconds || 0) / 60;
    if (minutes < rule.minMinutes - 0.01 || minutes > rule.maxMinutes + 0.01) {
      errors.push({ stepIndex: i, code: "duration", message: `Duration ${minutes.toFixed(1)}m outside ${rule.minMinutes}–${rule.maxMinutes}m.` });
    }
  });

  if (plan.steps.length > 7) {
    warnings.push({ stepIndex: null, code: "too-many", message: "More than 7 steps dilutes depth." });
  }

  plan = fitPlanToBudget(plan, budgetMin);
  plan = assignKeystone(plan);

  const quality = scoreContentQuality(plan, budgetMin);
  if (quality.score < 0.85) {
    errors.push({ stepIndex: null, code: "quality", message: `Content quality ${(quality.score * 100).toFixed(0)} is below 85.` });
  }

  return { ok: errors.length === 0, plan, errors, warnings, quality };
}

// ── Content quality score (deterministic) ───────────────────────────────────

function ratio(part: number, total: number): number {
  if (total <= 0) return 1;
  return Math.max(0, Math.min(1, part / total));
}

export function scoreContentQuality(plan: ContractPlan, budgetMin: number): ContentQuality {
  const steps = plan.steps || [];
  const n = steps.length || 1;

  const signalFidelity = ratio(
    steps.filter((s) => (s.whyForYou || "").length >= 12 && SIGNAL_RE.test(s.signalRef || "")).length,
    n,
  );

  const scriptDepth = ratio(
    steps.filter((s) => {
      const count = (s.script || []).length;
      const total = (s.script || []).reduce((sum, line) => sum + words(line), 0);
      return count >= 3 && total >= 40;
    }).length,
    n,
  );

  const paramBinding = ratio(steps.filter((s) => hasInteraction(s) && Object.keys(s.params || {}).length > 0).length, n);

  const interaction = ratio(steps.filter((s) => hasInteraction(s)).length, n);

  const target = Math.max(60, Math.round((Number(budgetMin) || 8) * 60));
  const totalSec = steps.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const timeFidelity = totalSec > 0 ? Math.max(0, 1 - Math.abs(totalSec - target) / target) : 0;

  const keystone = steps.find((s) => s.keystone);
  const keystoneShare = keystone && totalSec > 0 ? (keystone.durationSeconds || 0) / totalSec : 0;
  const sequence = Math.max(0, Math.min(1, 0.5 + keystoneShare)) * (keystone ? 1 : 0.5);

  const uniqueTitles = new Set(steps.map((s) => (s.title || "").toLowerCase().trim())).size;
  const uniqueScripts = new Set(steps.map((s) => (s.script || []).join(" ").toLowerCase().trim())).size;
  const variety = ratio(uniqueTitles + uniqueScripts, n * 2);

  const breakdown = {
    signalFidelity,
    scriptDepth,
    paramBinding,
    interaction,
    timeFidelity,
    sequence: Math.min(1, sequence),
    variety,
  };

  const score =
    breakdown.signalFidelity * 0.2 +
    breakdown.scriptDepth * 0.2 +
    breakdown.paramBinding * 0.15 +
    breakdown.interaction * 0.15 +
    breakdown.timeFidelity * 0.1 +
    breakdown.sequence * 0.1 +
    breakdown.variety * 0.1;

  return { score: Math.max(0, Math.min(1, score)), breakdown };
}

// ── Deterministic banker plan (never ship a broken sitting) ─────────────────
/**
 * Used when the composer fails validation twice. Content is authored here, not
 * generated, so this floor is intentionally high quality.
 */
export function buildBankerPlan(opts: {
  budgetMin?: number;
  gate?: string;
  reason?: string;
  level?: number;
  headline?: string;
} = {}): ContractPlan {
  const gate = (opts.gate || "morning").toLowerCase();
  const level = Math.max(1, Math.min(5, Math.round(Number(opts.level) || 1)));
  const budgetSec = Math.max(120, Math.round((Number(opts.budgetMin) || 8) * 60));
  const isNight = gate === "night" || gate === "evening";
  const settlePattern = isNight ? "4-7-8" : "4-4-6";

  const stepsAll: ContractStep[] = [
    normalizeContractStep({
      kind: "breathwork",
      title: "Drop your shoulders. Breathe out longer than in.",
      script: [
        "Sit or lie down. Let the body take its full weight.",
        `Breathe in for 4, hold for ${isNight ? 7 : 4}, out for ${isNight ? 8 : 6}. Five rounds.`,
        "Do not deepen it. The exhale does the work, not effort.",
        "Stop when the breath feels slower than it did when you sat down.",
      ],
      est_minutes: 2,
      durationSeconds: 120,
      params: { pattern: settlePattern, durationSeconds: 120 },
      whyForYou: `${gate} gate: the body needs a runway before anything is asked of it.`,
      signalRef: `gate:${gate}`,
    }),
    normalizeContractStep({
      kind: "witness",
      title: "Sit still. Watch what arises without naming it.",
      script: [
        "Keep the eyes soft or closed. Do not fix the posture again.",
        "Wait for the next thought to appear on its own.",
        "When you notice it, do not label it and do not push it — just see it.",
        "If you drift into the thought, that noticing is the practice. Return once.",
      ],
      est_minutes: Math.min(6, Math.max(3, Math.round((opts.budgetMin || 8) / 2))),
      params: { object: "thoughts" },
      whyForYou: "Witnessing is the practice every other step depends on.",
      signalRef: `practice:witnessing:L${level}`,
    }),
    normalizeContractStep({
      kind: "practice",
      title: "Stay one breath longer than you want to.",
      script: [
        "Choose one object: the breath at the nostrils, or the feeling of sitting.",
        `Hold attention there at level ${level} — no harder than yesterday.`,
        "When attention leaves, return without commentary. That return is the rep.",
        "End on your own signal, not on a timer running out.",
      ],
      est_minutes: 5,
      params: {
        family: "observation",
        level,
        exercise: level >= 3 ? "Notice the gap between two thoughts — once." : "Name what is here: seeing, hearing, feeling.",
      },
      whyForYou: `Your observation practice is at L${level} — this sits exactly one step above it.`,
      signalRef: `practice:observation:L${level}`,
    }),
    normalizeContractStep({
      kind: "reflection",
      title: "Name one thing that is still here.",
      script: [
        "Do not summarise the session and do not write a report on it. One line only.",
        "Write what is true right now, even if it is unimpressive or inconvenient.",
        "If nothing is here, write that. Honesty is the closure, not insight.",
        "Stop writing while the sentence is still alive rather than explaining it.",
      ],
      est_minutes: 2,
      params: { maxChars: 280 },
      whyForYou: "An unclosed sitting leaks; one true line seals it.",
      signalRef: "closure",
    }),
  ];

  // Keep the sitting inside its budget instead of stretching it: a 3-minute
  // request gets breath + close, not four steps compressed into one minute.
  const steps = stepsAll.filter((step) => {
    if (step.kind === "practice") return budgetSec >= 480;
    if (step.kind === "witness") return budgetSec >= 300;
    return true;
  });

  const plan = assignKeystone(fitPlanToBudget({ intent: "A banker sitting", intro: "", steps }, opts.budgetMin || 8));
  plan.intent = `A ${opts.budgetMin || 8}-minute ${gate} sitting`;
  plan.intro = opts.headline || "A short, complete sitting — built by hand, not by a model.";
  return plan;
}

export function stepText(step: ContractStep): string {
  return `${step.title}\n${(step.script || []).join("\n") || step.prompt || ""}`.trim();
}
