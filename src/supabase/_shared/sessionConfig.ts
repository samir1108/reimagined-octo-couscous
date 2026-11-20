/**
 * sessionConfig — shared personalization reader for the session engine.
 *
 * The Settings → Session Personalization studio writes a full
 * ExtendedSessionConfiguration into user_consciousness_profile.session_config.
 * This module turns that stored object into the small set of signals the
 * composer can actually honour, and reports "not personalized" when every
 * value still equals the engine defaults so default composition is untouched.
 */

export const SESSION_CONFIG_DEFAULTS = {
  focusType: "focus",
  timeBudgetMin: 20,
  domainWeights: {
    relationship: 0.5,
    work: 0.5,
    finance: 0.3,
    health: 0.5,
    creativity: 0.3,
    spirituality: 0.7,
  },
  speedProfile: "adaptive",
  preferredGate: "flexible",
  energyMode: "adaptive",
  guideStyle: "gentle",
  structure: "guided",
  reflectionDepth: "standard",
  difficultyOverride: "standard",
  language: "en",
} as const;

const FOCUS_TO_FAMILY: Record<string, string | null> = {
  focus: "raja",
  attention: "observation",
  self_inquiry: "self_inquiry",
  raja_yoga: "raja",
  jnana: "jnana",
  bhakti: "bhakti",
  karma: "karma",
  tantra: "tantra",
  kundalini: "kriya",
  healing: "body_awareness",
  sleep: "body_awareness",
  energy: "breath_awareness",
  relationship: null,
  work: null,
  creativity: null,
  custom: null,
};

const PRACTICE_ID_TO_FAMILY: Record<string, string> = {
  observation: "observation",
  attention: "observation",
  focus: "raja",
  self_inquiry: "self_inquiry",
  "self-inquiry": "self_inquiry",
  breath: "breath_awareness",
  breath_awareness: "breath_awareness",
  witnessing: "witnessing",
  body: "body_awareness",
  body_awareness: "body_awareness",
  bhakti: "bhakti",
  karma: "karma",
  jnana: "jnana",
  raja: "raja",
  kriya: "kriya",
  tantra: "tantra",
  health: "body_awareness",
  "emotional-healing": "body_awareness",
  "loop-dissolution": "self_inquiry",
};

const GUIDE_DIRECTIVES: Record<string, string> = {
  gentle: "Guide style gentle: warm, patient, encouraging — never push.",
  direct: "Guide style direct: terse and precise. No cushioning, no filler.",
  inquiry: "Guide style inquiry: Socratic. Ask one question at a time, state very little.",
  devotional: "Guide style devotional: heart-centred, poetic, surrender-oriented.",
  silent: "Guide style silent: minimal words, mostly space. Scripts must be shorter than usual.",
};

const DEPTH_DIRECTIVES: Record<string, string> = {
  micro: "Reflection depth micro: at most one prompt, 1–2 minutes of reflection.",
  standard: "Reflection depth standard: 3–5 minutes, 1–2 prompts.",
  deep: "Reflection depth deep: 8+ minutes, 2–3 prompts, one piercing inquiry.",
};

const STRUCTURE_DIRECTIVES: Record<string, string> = {
  guided: "Guidance level guided: explicit step-by-step instructions in every step.",
  hybrid: "Guidance level hybrid: mix explicit guidance with one user-choice moment.",
  self_directed: "Guidance level self-directed: offer choices, keep instructions lean, avoid over-teaching.",
};

const DIFFICULTY_DIRECTIVES: Record<string, string> = {
  gentler: "Difficulty gentler: easier on-ramp, more support, shorter holds.",
  harder: "Difficulty harder: less scaffolding, longer holds, more challenge.",
};

export type PersonalizationSourceKind = "settings" | "request";

export interface SessionPersonalization {
  source: PersonalizationSourceKind;
  signals: string[];
  durationMin: number | null;
  energy: string | null;
  gate: string | null;
  focusType: string | null;
  focusFamily: string | null;
  customFocus: string | null;
  guideStyle: string | null;
  structure: string | null;
  reflectionDepth: string | null;
  difficulty: string | null;
  speedProfile: string | null;
  language: string | null;
  priorityDomains: Array<{ id: string; weight: number }>;
  practiceTargets: Array<{ family: string; level: number | null; priority: string }>;
  masters: Array<{ practice: string; master: string }>;
  shadowTargets: string[];
  includedFamilies: string[];
  excludedFamilies: string[];
  includedTags: string[];
  excludedTags: string[];
  forcedArchetype: string | null;
  voiceEnabled: boolean | null;
  reducedMotion: boolean | null;
  screenReaderOptimized: boolean | null;
  targeting: string | null;
  intent: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && Boolean(v.trim())) : [];
}

export function familyForPracticeId(id: string): string | null {
  return PRACTICE_ID_TO_FAMILY[id] ?? null;
}

export function familyForFocusType(focusType: string | null | undefined): string | null {
  if (!focusType) return null;
  return FOCUS_TO_FAMILY[focusType] ?? null;
}

export function deriveSessionPersonalization(
  raw: unknown,
  source: PersonalizationSourceKind = "settings",
): SessionPersonalization | null {
  if (!isRecord(raw)) return null;

  const signals: string[] = [];
  const add = (label: string) => signals.push(label);

  const focusType = asString(raw.focusType);
  const changedFocus = focusType && focusType !== SESSION_CONFIG_DEFAULTS.focusType ? focusType : null;
  if (changedFocus) add(`focus=${changedFocus}`);

  const focusFamily = familyForFocusType(changedFocus);
  if (focusFamily) add(`focus-family=${focusFamily}`);

  const customFocus = asString(raw.customFocusName);
  if (customFocus) add("custom-focus");

  const guideStyle =
    asString(raw.guideStyle) && raw.guideStyle !== SESSION_CONFIG_DEFAULTS.guideStyle
      ? (raw.guideStyle as string)
      : null;
  if (guideStyle) add(`guide=${guideStyle}`);

  const structure =
    asString(raw.structure) && raw.structure !== SESSION_CONFIG_DEFAULTS.structure
      ? (raw.structure as string)
      : null;
  if (structure) add(`structure=${structure}`);

  const reflectionDepth =
    asString(raw.reflectionDepth) && raw.reflectionDepth !== SESSION_CONFIG_DEFAULTS.reflectionDepth
      ? (raw.reflectionDepth as string)
      : null;
  if (reflectionDepth) add(`reflection=${reflectionDepth}`);

  const difficulty =
    asString(raw.difficultyOverride) && raw.difficultyOverride !== SESSION_CONFIG_DEFAULTS.difficultyOverride
      ? (raw.difficultyOverride as string)
      : null;
  if (difficulty) add(`difficulty=${difficulty}`);

  const speedProfile =
    asString(raw.speedProfile) && raw.speedProfile !== SESSION_CONFIG_DEFAULTS.speedProfile
      ? (raw.speedProfile as string)
      : null;
  if (speedProfile) add(`pace=${speedProfile}`);

  const language =
    asString(raw.language) && raw.language !== SESSION_CONFIG_DEFAULTS.language
      ? (raw.language as string)
      : null;
  if (language) add(`language=${language}`);

  const energyMode = asString(raw.energyMode);
  const energy = energyMode && energyMode !== "adaptive" ? energyMode : null;
  if (energy) add(`energy=${energy}`);

  const preferredGate = asString(raw.preferredGate);
  const gate = preferredGate && preferredGate !== "flexible" ? preferredGate : null;
  if (gate) add(`gate=${gate}`);

  const durationMin = asNumber(raw.timeBudgetMin);

  const rawDomains = isRecord(raw.domainWeights) ? raw.domainWeights : {};
  const priorityDomains = Object.entries(SESSION_CONFIG_DEFAULTS.domainWeights)
    .map(([id, fallback]) => ({ id, weight: asNumber(rawDomains[id]) ?? fallback }))
    .filter((entry) => {
      const fallback = SESSION_CONFIG_DEFAULTS.domainWeights[entry.id as keyof typeof SESSION_CONFIG_DEFAULTS.domainWeights];
      return Math.abs(entry.weight - fallback) > 0.05;
    })
    .sort((a, b) => b.weight - a.weight);
  if (priorityDomains.length) add("life-priorities");

  const practiceTargets: SessionPersonalization["practiceTargets"] = [];
  if (isRecord(raw.practiceLevelTargets)) {
    for (const [practiceId, target] of Object.entries(raw.practiceLevelTargets)) {
      if (!isRecord(target)) continue;
      const level = asNumber(target.targetLevel);
      const priority = asString(target.priority) ?? "medium";
      if (level == null && priority === "medium") continue;
      practiceTargets.push({
        family: familyForPracticeId(practiceId) ?? practiceId,
        level,
        priority,
      });
    }
  }
  if (practiceTargets.length) add("practice-targets");

  const masters: SessionPersonalization["masters"] = [];
  if (isRecord(raw.masterPersonas)) {
    for (const [practice, master] of Object.entries(raw.masterPersonas)) {
      if (typeof master === "string" && master.trim()) masters.push({ practice, master: master.trim() });
    }
  }
  if (masters.length) add("masters");

  const shadowActive = isRecord(raw.shadowTargets) ? raw.shadowTargets.active : undefined;
  const shadowTargets = Array.isArray(shadowActive)
    ? shadowActive
        .map((entry) => (isRecord(entry) ? asString(entry.name) : asString(entry)))
        .filter((entry): entry is string => Boolean(entry))
    : [];
  if (shadowTargets.length) add("shadow");

  const includedIds = asStringArray(raw.includedPracticeIds);
  const excludedIds = asStringArray(raw.excludedPracticeIds);
  const includedFamilies = [...new Set(includedIds.map(familyForPracticeId).filter((v): v is string => Boolean(v)))];
  const excludedFamilies = [...new Set(excludedIds.map(familyForPracticeId).filter((v): v is string => Boolean(v)))];
  if (includedIds.length) add("included-practices");
  if (excludedIds.length) add("excluded-practices");

  const includedTags = asStringArray(raw.includedTags);
  const excludedTags = asStringArray(raw.excludedTags);
  if (includedTags.length) add("included-tags");
  if (excludedTags.length) add("excluded-tags");

  const forcedArchetype = asString(raw.forcedArchetype);
  if (forcedArchetype) add("forced-archetype");

  const voiceEnabled = typeof raw.voiceEnabled === "boolean" && raw.voiceEnabled === false ? false : null;
  if (voiceEnabled === false) add("voice-off");

  const reducedMotion = raw.reducedMotion === true ? true : null;
  if (reducedMotion) add("reduced-motion");

  const screenReaderOptimized = raw.screenReaderOptimized === true ? true : null;
  if (screenReaderOptimized) add("screen-reader");

  const targeting = [
    asNumber(raw.targetVLevel) != null ? `v${asNumber(raw.targetVLevel)}` : null,
    asNumber(raw.targetBand) != null ? `band${asNumber(raw.targetBand)}` : null,
    asString(raw.targetMicroLevel),
  ]
    .filter(Boolean)
    .join("/") || null;
  if (targeting) add("targeting");

  const intent = asString(raw.intent);
  if (intent) add("intent");

  return {
    source,
    signals,
    durationMin,
    energy,
    gate,
    focusType: changedFocus ?? (focusType && focusType !== "focus" ? focusType : null),
    focusFamily,
    customFocus,
    guideStyle,
    structure,
    reflectionDepth,
    difficulty,
    speedProfile,
    language,
    priorityDomains,
    practiceTargets,
    masters,
    shadowTargets,
    includedFamilies,
    excludedFamilies,
    includedTags,
    excludedTags,
    forcedArchetype,
    voiceEnabled,
    reducedMotion,
    screenReaderOptimized,
    targeting,
    intent,
  };
}

export function isPersonalized(p: SessionPersonalization | null): p is SessionPersonalization {
  return Boolean(p && p.signals.length > 0);
}

/** Hard rules appended to the composer system prompt (these win over soft bias). */
export function personalizationDirectives(p: SessionPersonalization): string[] {
  const out: string[] = [
    "USER PERSONALIZATION (explicit Settings choices — honour these unless a SAFETY/NEED lock above forbids it).",
  ];

  if (p.focusFamily) {
    out.push(
      `FOCUS LOCK: the core practice of this sitting must be family "${p.focusFamily}". Other families may support it but not replace it.`,
    );
  }
  if (p.customFocus) {
    out.push(`CUSTOM FOCUS: "${p.customFocus}". Shape the sitting around this theme.`);
  }
  if (p.excludedFamilies.length) {
    out.push(`EXCLUDE: never compose a practice step in family ${p.excludedFamilies.map((f) => `"${f}"`).join(", ")}. Substitute a compatible family.`);
  }
  if (p.includedFamilies.length) {
    out.push(`INCLUDE: at least one step must instantiate family ${p.includedFamilies.map((f) => `"${f}"`).join(", ")}.`);
  }
  if (p.excludedTags.length) out.push(`EXCLUDE TAGS: ${p.excludedTags.join(", ")}.`);
  if (p.includedTags.length) out.push(`PREFER TAGS: ${p.includedTags.join(", ")}.`);
  if (p.guideStyle && GUIDE_DIRECTIVES[p.guideStyle]) out.push(GUIDE_DIRECTIVES[p.guideStyle]);
  if (p.structure && STRUCTURE_DIRECTIVES[p.structure]) out.push(STRUCTURE_DIRECTIVES[p.structure]);
  if (p.reflectionDepth && DEPTH_DIRECTIVES[p.reflectionDepth]) out.push(DEPTH_DIRECTIVES[p.reflectionDepth]);
  if (p.difficulty && DIFFICULTY_DIRECTIVES[p.difficulty]) out.push(DIFFICULTY_DIRECTIVES[p.difficulty]);

  if (p.practiceTargets.length) {
    out.push(
      `PRACTICE TARGETS: ${p.practiceTargets
        .map((t) => `${t.family}${t.level != null ? ` → L${t.level}` : ""}${t.priority !== "medium" ? ` (${t.priority})` : ""}`)
        .join("; ")}. Aim one level above the user's current level, never invent a level beyond the target.`,
    );
  }
  if (p.masters.length) {
    out.push(`MASTER PERSONAS: ${p.masters.map((m) => `${m.practice} → ${m.master}`).join("; ")}. Use these for temple-chat / wisdom-read when the kind allows.`);
  }
  if (p.shadowTargets.length) {
    out.push(`SHADOW FOCUS: ${p.shadowTargets.join(", ")}. Weave into inquiry or journal when it fits the archetype.`);
  }
  if (p.priorityDomains.length) {
    out.push(
      `LIFE PRIORITIES (frame whyForYou here): ${p.priorityDomains
        .slice(0, 3)
        .map((d) => `${d.id} ${Math.round(d.weight * 100)}%`)
        .join(", ")}.`,
    );
  }
  if (p.energy) out.push(`ENERGY PREFERENCE: ${p.energy}.`);
  if (p.gate) out.push(`PREFERRED GATE: ${p.gate} — match the sitting's tone to this part of the day.`);
  if (p.speedProfile) {
    out.push(
      p.speedProfile === "fast"
        ? "PACE: fast tracker — keep steps brisk."
        : p.speedProfile === "deep"
          ? "PACE: deep digger — slow the sitting, fewer steps, more depth."
          : "PACE: steady walker — balanced pacing.",
    );
  }
  if (p.voiceEnabled === false) out.push("VOICE OFF: avoid instructions that assume spoken guidance.");
  if (p.reducedMotion) out.push("REDUCED MOTION: avoid visual-motion-dependent steps.");
  if (p.screenReaderOptimized) out.push("SCREEN-READER PACING: keep scripts short and linear.");
  if (p.intent) out.push(`USER STATED INTENT: "${p.intent}".`);

  return out;
}

/** Compact context block for the user message (readable reasons, no locking). */
export function personalizationContextBlock(p: SessionPersonalization): string {
  const lines = [
    `SOURCE: ${p.source === "request" ? "live studio settings" : "saved Settings"}`,
    `SIGNALS: ${p.signals.join(", ")}`,
  ];
  if (p.durationMin) lines.push(`DURATION: ${p.durationMin} min`);
  if (p.focusType) lines.push(`FOCUS: ${p.focusType}${p.focusFamily ? ` (family ${p.focusFamily})` : ""}`);
  if (p.masters.length) lines.push(`MASTERS: ${p.masters.map((m) => `${m.practice}→${m.master}`).join(", ")}`);
  if (p.shadowTargets.length) lines.push(`SHADOW: ${p.shadowTargets.join(", ")}`);
  return lines.join("\n");
}

type AdminClient = { from: (table: string) => any };

export async function loadSessionPersonalization(
  admin: AdminClient,
  userId: string,
): Promise<SessionPersonalization | null> {
  try {
    const { data } = await admin
      .from("user_consciousness_profile")
      .select("session_config")
      .eq("user_id", userId)
      .maybeSingle();
    const derived = deriveSessionPersonalization(data?.session_config, "settings");
    return isPersonalized(derived) ? derived : null;
  } catch {
    return null;
  }
}

/** Drops practice steps the user excluded. Non-practice steps are kept. */
export function filterExcludedPractices<T extends { kind?: string; params?: Record<string, unknown> }>(
  steps: T[],
  p: SessionPersonalization,
): T[] {
  if (!p.excludedFamilies.length) return steps;
  const blocked = new Set(p.excludedFamilies);
  return steps.filter((step) => {
    if (step.kind !== "practice") return true;
    const family = typeof step.params?.family === "string" ? step.params.family : null;
    return !family || !blocked.has(family);
  });
}
