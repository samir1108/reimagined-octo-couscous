// _shared/composer.ts — Deno port of src/lib/composer for edge functions.
// Lightweight: archetype selection + slot fill from an embedded ingredient bank.

export type Gate = "morning" | "midday" | "evening" | "night";
export type Energy = "low" | "medium" | "high";
export type Depth = "light" | "medium" | "deep";
export type IngredientKind = "practice" | "knowledge" | "reflection" | "micro_action";
export type SlotRole = "settle" | "anchor" | "core" | "deepen" | "reflect" | "release" | "seal";
export type ArchetypeId =
  | "opening" | "inquiry" | "teaching" | "practice_deep"
  | "integration" | "release" | "micro";

/** The four yoga paths — the user's affinity across them steers the session. */
export type YogaPath = "raja" | "jnana" | "karma" | "bhakti";
/** The four consciousness dimensions measured by the engine. */
export type ConsciousnessDimension = "body" | "emotion" | "thought" | "awareness";

export interface Ingredient {
  id: string;
  kind: IngredientKind;
  label: string;
  summary?: string;
  body?: string;
  defaultMinutes: number;
  practice?: string;
  loopTargets?: string[];
  /** Loop families this ingredient addresses (see INGREDIENT_LOOP_FAMILIES). */
  loopFamilies?: string[];
  bandRange?: [number, number];
  energyFit?: Energy[];
  gateFit?: Gate[];
  depth: Depth;
  /** Maps to session-shell StepKind for the player UI. */
  stepKind: "wisdom-read" | "breathwork" | "journal" | "micro-act" | "reflection" | "practice" | "witness";
  /** Optional params for the player (e.g. breath durationSeconds). */
  params?: Record<string, unknown>;
  icon?: string;
  /** Yoga paths this ingredient serves — scored against the user's measured affinity. */
  paths?: YogaPath[];
  /** Consciousness dimensions this ingredient trains — the weakest band is targeted. */
  dimensions?: ConsciousnessDimension[];
  /** Earliest journey day this ingredient is ready for. */
  minJourneyDay?: number;
  /** Chitta vritti (mind modes) this ingredient settles, e.g. "restless". */
  settlesChitta?: string[];
}

export interface ArchetypeSlot {
  role: SlotRole;
  share: number;
  accepts: IngredientKind[];
  practiceBias?: string[];
  depth?: Depth;
}

export interface Archetype {
  id: ArchetypeId;
  label: string;
  description: string;
  preferredGates: Gate[];
  durationRangeMin: [number, number];
  energyFit: Energy[];
  slots: ArchetypeSlot[];
  toneWords: string[];
}

// ─────────────────────────────────────────────────────────────────────
export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  opening: {
    id: "opening", label: "Opening",
    description: "Wake the system: breath → anchor → intention.",
    preferredGates: ["morning"], durationRangeMin: [3, 20],
    energyFit: ["low", "medium", "high"], toneWords: ["gentle", "grounded", "clear"],
    slots: [
      { role: "settle", share: 0.25, accepts: ["practice", "micro_action"], practiceBias: ["breath", "body"], depth: "light" },
      { role: "anchor", share: 0.20, accepts: ["knowledge", "micro_action"], depth: "light" },
      { role: "seal",   share: 0.55, accepts: ["reflection", "micro_action"], depth: "light" },
    ],
  },
  inquiry: {
    id: "inquiry", label: "Inquiry",
    description: "Sit with a question.",
    preferredGates: ["midday", "evening"], durationRangeMin: [8, 45],
    energyFit: ["medium", "high"], toneWords: ["curious", "spacious", "honest"],
    slots: [
      { role: "settle", share: 0.15, accepts: ["practice"], practiceBias: ["witness", "breath"], depth: "light" },
      { role: "core",   share: 0.50, accepts: ["practice"], practiceBias: ["inquiry", "jnana", "witness"], depth: "deep" },
      { role: "reflect",share: 0.35, accepts: ["reflection"], depth: "medium" },
    ],
  },
  teaching: {
    id: "teaching", label: "Teaching",
    description: "Learn + integrate.",
    preferredGates: ["morning", "midday", "evening"], durationRangeMin: [5, 25],
    energyFit: ["medium", "high"], toneWords: ["clear", "illuminating", "practical"],
    slots: [
      { role: "anchor", share: 0.40, accepts: ["knowledge"], depth: "medium" },
      { role: "reflect",share: 0.25, accepts: ["reflection"], depth: "medium" },
      { role: "core",   share: 0.35, accepts: ["practice", "micro_action"], depth: "light" },
    ],
  },
  practice_deep: {
    id: "practice_deep", label: "Deep Practice",
    description: "One practice, gone deep.",
    preferredGates: ["morning", "midday", "evening"], durationRangeMin: [12, 90],
    energyFit: ["medium", "high"], toneWords: ["focused", "deep", "still"],
    slots: [
      { role: "settle", share: 0.10, accepts: ["practice"], practiceBias: ["breath", "body"], depth: "light" },
      { role: "core",   share: 0.65, accepts: ["practice"], depth: "deep" },
      { role: "deepen", share: 0.15, accepts: ["practice"], depth: "deep" },
      { role: "seal",   share: 0.10, accepts: ["reflection", "micro_action"], depth: "light" },
    ],
  },
  integration: {
    id: "integration", label: "Integration",
    description: "Process the day.",
    preferredGates: ["evening"], durationRangeMin: [5, 25],
    energyFit: ["low", "medium"], toneWords: ["soft", "honest", "settling"],
    slots: [
      { role: "settle", share: 0.20, accepts: ["practice"], practiceBias: ["breath", "body"], depth: "light" },
      { role: "reflect",share: 0.50, accepts: ["reflection", "knowledge"], depth: "medium" },
      { role: "release",share: 0.30, accepts: ["practice", "micro_action"], practiceBias: ["witness", "breath"], depth: "light" },
    ],
  },
  release: {
    id: "release", label: "Release",
    description: "Let go.",
    preferredGates: ["night"], durationRangeMin: [3, 20],
    energyFit: ["low", "medium"], toneWords: ["soft", "dim", "letting go"],
    slots: [
      { role: "settle", share: 0.30, accepts: ["practice"], practiceBias: ["body", "breath"], depth: "light" },
      { role: "release",share: 0.50, accepts: ["practice"], practiceBias: ["witness", "breath"], depth: "medium" },
      { role: "seal",   share: 0.20, accepts: ["reflection", "micro_action"], depth: "light" },
    ],
  },
  micro: {
    id: "micro", label: "Micro Pause",
    description: "60–180s of presence.",
    preferredGates: ["morning", "midday", "evening", "night"], durationRangeMin: [1, 3],
    energyFit: ["low", "medium", "high"], toneWords: ["instant", "alive", "present"],
    slots: [
      { role: "core", share: 1.0, accepts: ["practice", "micro_action"], practiceBias: ["breath", "witness"], depth: "light" },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────
// INGREDIENT BANK — server-side authoritative library (expandable)
// ─────────────────────────────────────────────────────────────────────
export const INGREDIENTS: Ingredient[] = [
  // ── Breath practices
  { id: "p:breath-box-1m", kind: "practice", label: "60 Seconds of Box Breath", defaultMinutes: 1,
    summary: "Four counts in, hold, four out, hold — a square that steadies a scattered mind.",
    practice: "breath", depth: "light", stepKind: "breathwork",
    params: { durationSeconds: 60, pattern: "box" }, icon: "🌬",
    paths: ["raja"], dimensions: ["body"], settlesChitta: ["restless", "dull"] },
  { id: "p:breath-446-3m", kind: "practice", label: "Calming Breath", defaultMinutes: 3,
    summary: "Slow 4-4-6 breath to settle the nervous system.",
    practice: "breath", depth: "light", stepKind: "breathwork",
    params: { durationSeconds: 180, pattern: "4-4-6" }, icon: "🌬",
    gateFit: ["morning", "midday", "evening"],
    paths: ["raja"], dimensions: ["body", "emotion"], settlesChitta: ["restless", "dull", "distracted"] },
  { id: "p:breath-478-4m", kind: "practice", label: "Wind-Down Breath", defaultMinutes: 4,
    summary: "4-7-8 breath — slows the heart, prepares for rest.",
    practice: "breath", depth: "medium", stepKind: "breathwork",
    params: { durationSeconds: 240, pattern: "4-7-8" }, icon: "🌙",
    gateFit: ["evening", "night"],
    paths: ["raja"], dimensions: ["body", "emotion"], settlesChitta: ["restless", "distracted"] },
  { id: "p:breath-fire-3m", kind: "practice", label: "Breath of Fire", defaultMinutes: 3,
    summary: "Energising pranayama that clears a dull mind — sharp exhales, passive inhales, straight spine.",
    practice: "breath", depth: "deep", stepKind: "breathwork",
    params: { durationSeconds: 180, pattern: "fire" }, icon: "🔥",
    gateFit: ["morning", "midday"], energyFit: ["medium", "high"],
    paths: ["raja"], dimensions: ["body"], settlesChitta: ["dull"] },
  { id: "p:breath-count-5m", kind: "practice", label: "Counting the Breath", defaultMinutes: 5,
    summary: "Count each breath to ten. Lose the count, begin again — that noticing IS the practice.",
    practice: "breath", depth: "medium", stepKind: "breathwork",
    params: { durationSeconds: 300, pattern: "count" }, icon: "🔟",
    paths: ["raja", "jnana"], dimensions: ["awareness", "thought"], settlesChitta: ["restless", "distracted"] },

  // ── Body / movement practices
  { id: "p:body-scan-5m", kind: "practice", label: "Body Scan", defaultMinutes: 5,
    summary: "Trace attention through the body, head to toe.",
    practice: "body", depth: "medium", stepKind: "practice", icon: "🧘",
    gateFit: ["evening", "night"],
    paths: ["raja"], dimensions: ["body", "emotion"], settlesChitta: ["restless", "distracted"] },
  { id: "p:yoga-nidra-8m", kind: "practice", label: "Yoga Nidra", defaultMinutes: 8,
    summary: "The sleep of the yogis — systematic rotation of consciousness through the body.",
    practice: "body", depth: "medium", stepKind: "practice", icon: "🌊",
    gateFit: ["evening", "night"], bandRange: [0, 6],
    paths: ["raja"], dimensions: ["body", "emotion"], settlesChitta: ["restless", "dull"] },
  { id: "p:stretch-release-4m", kind: "practice", label: "Release the Holding", defaultMinutes: 4,
    summary: "Neck, jaw, shoulders. Where does the day live in you?",
    practice: "movement", depth: "light", stepKind: "practice", icon: "🤸",
    paths: ["raja"], dimensions: ["body"], settlesChitta: ["restless", "dull"] },
  { id: "p:walking-6m", kind: "practice", label: "Walking Meditation", defaultMinutes: 6,
    summary: "Walk slowly. Feel the lift, the step, the landing.",
    practice: "movement", depth: "light", stepKind: "practice", icon: "🚶",
    gateFit: ["morning", "midday"],
    paths: ["raja", "karma"], dimensions: ["body", "awareness"], settlesChitta: ["restless", "dull"] },

  // ── Witness / awareness practices
  { id: "p:witness-sit-5m", kind: "practice", label: "Witness Sit", defaultMinutes: 5,
    summary: "Sit still and let thoughts pass without following them — five minutes of watching, not managing.",
    practice: "witness", depth: "medium", stepKind: "witness", icon: "👁",
    loopTargets: ["OVT001", "OVT003"],
    paths: ["jnana", "raja"], dimensions: ["awareness", "thought"], settlesChitta: ["distracted"] },
  { id: "p:witness-sit-10m", kind: "practice", label: "Long Witness", defaultMinutes: 10,
    summary: "A longer sit that turns attention back on itself: who is watching the watcher? Stay with the question.",
    practice: "witness", depth: "deep", stepKind: "witness", icon: "👁",
    bandRange: [2, 10], minJourneyDay: 4,
    paths: ["jnana", "raja"], dimensions: ["awareness", "thought"], settlesChitta: ["distracted", "restrained"] },
  { id: "p:noticing-3m", kind: "practice", label: "Name What Arises", defaultMinutes: 3,
    summary: "Thought. Feeling. Sensation. Name it, don't argue with it.",
    practice: "witness", depth: "light", stepKind: "witness", icon: "🏷",
    paths: ["jnana", "raja"], dimensions: ["awareness"], settlesChitta: ["distracted"] },
  { id: "p:mantra-5m", kind: "practice", label: "Mantra Repetition", defaultMinutes: 5,
    summary: "One word, repeated. Let the sound become the mind.",
    practice: "mantra", depth: "medium", stepKind: "practice", icon: "📿",
    params: { durationSeconds: 300 }, 
    paths: ["bhakti", "raja"], dimensions: ["thought", "awareness"], settlesChitta: ["restless", "distracted"] },

  // ── Inquiry practices
  { id: "p:inquiry-whoami-6m", kind: "practice", label: "Who Am I?", defaultMinutes: 6,
    summary: "Ramana's self-inquiry. Trace every thought to its source.",
    practice: "inquiry", depth: "deep", stepKind: "practice", icon: "🔍",
    bandRange: [1, 10], minJourneyDay: 3,
    paths: ["jnana"], dimensions: ["thought", "awareness"], settlesChitta: ["focused", "distracted"] },
  { id: "p:inquiry-feeling-4m", kind: "practice", label: "Who Is Feeling This?", defaultMinutes: 4,
    summary: "Catch an emotion. Ask who it belongs to.",
    practice: "inquiry", depth: "medium", stepKind: "practice", icon: "🔍",
    loopTargets: ["VAL001", "EMO002"],
    paths: ["jnana"], dimensions: ["emotion", "thought"], settlesChitta: ["distracted"] },
  { id: "p:contemplation-6m", kind: "practice", label: "Contemplation", defaultMinutes: 6,
    summary: "One question, held gently. The question is the practice.",
    practice: "contemplation", depth: "medium", stepKind: "reflection", icon: "🕯",
    minJourneyDay: 5, bandRange: [1, 10],
    paths: ["jnana", "bhakti"], dimensions: ["thought", "awareness"], settlesChitta: ["distracted", "focused"] },

  // ── Devotion / heart practices
  { id: "p:metta-5m", kind: "practice", label: "Loving Kindness", defaultMinutes: 5,
    summary: "May you be well. Begin with yourself, then widen the circle.",
    practice: "loving_kindness", depth: "medium", stepKind: "practice", icon: "💗",
    paths: ["bhakti"], dimensions: ["emotion"], settlesChitta: ["dull", "distracted"] },
  { id: "p:gratitude-3m", kind: "practice", label: "Three Gratitudes", defaultMinutes: 3,
    summary: "Name three things. Small counts. Tiny counts most.",
    practice: "gratitude", depth: "light", stepKind: "journal", icon: "🙏",
    paths: ["bhakti"], dimensions: ["emotion"], settlesChitta: ["dull"] },
  { id: "p:trataka-4m", kind: "practice", label: "Candle Gaze", defaultMinutes: 4,
    summary: "Soft gaze at one point. When it blurs, keep looking anyway.",
    practice: "trataka", depth: "medium", stepKind: "practice", icon: "🕯",
    gateFit: ["evening", "night"], bandRange: [0, 5],
    paths: ["raja"], dimensions: ["awareness", "thought"], settlesChitta: ["distracted", "restless"] },

  // ── Devotion / offering practices
  { id: "p:chant-5m", kind: "practice", label: "One Syllable, Repeated", defaultMinutes: 5,
    summary: "Chant one syllable aloud until the sound belongs to the room, not to you.",
    practice: "mantra", depth: "medium", stepKind: "practice", icon: "🎶",
    params: { durationSeconds: 300 },
    paths: ["bhakti", "raja"], dimensions: ["emotion", "thought"], settlesChitta: ["restless", "dull"] },
  { id: "p:prayer-3m", kind: "practice", label: "Unspoken Prayer", defaultMinutes: 3,
    summary: "Say the one thing you would say if someone were listening — then sit with it.",
    practice: "devotion", depth: "light", stepKind: "reflection", icon: "🙌",
    paths: ["bhakti"], dimensions: ["emotion"], settlesChitta: ["dull", "distracted"] },
  { id: "p:hands-open-2m", kind: "practice", label: "Open Palms", defaultMinutes: 2,
    summary: "Turn your palms up on your knees. Let the hands finish what the mouth cannot.",
    practice: "devotion", depth: "light", stepKind: "practice", icon: "🤲",
    paths: ["bhakti"], dimensions: ["emotion", "body"], settlesChitta: ["restless", "dull"] },
  { id: "p:serving-4m", kind: "practice", label: "Act Without the Fruit", defaultMinutes: 4,
    summary: "Pick one small task. Do it fully for its own sake — not for how it lands.",
    practice: "selfless_action", depth: "light", stepKind: "journal", icon: "🍲",
    paths: ["karma"], dimensions: ["awareness", "emotion"], settlesChitta: ["restless"] },

  // ── Knowledge units
  { id: "k:rumi-guesthouse", kind: "knowledge", label: "The Guest House", defaultMinutes: 2,
    summary: "Rumi — every emotion is a guest.",
    body: "This being human is a guest house. Every morning a new arrival. Welcome and entertain them all.",
    depth: "light", stepKind: "wisdom-read", icon: "📖",
    paths: ["bhakti"], dimensions: ["emotion"] },
  { id: "k:witness-vs-thinker", kind: "knowledge", label: "Witness vs Thinker", defaultMinutes: 3,
    summary: "You are not your thoughts — you are the one who notices them.",
    loopTargets: ["OVT001", "OVT003"], bandRange: [0, 5], depth: "medium",
    paths: ["jnana"], dimensions: ["thought", "awareness"],
    stepKind: "wisdom-read", icon: "👁" },
  { id: "k:nothing-to-fix", kind: "knowledge", label: "Nothing to Fix", defaultMinutes: 3,
    summary: "What changes when you stop trying to fix yourself — and why the effort to improve is itself the tension.",
    bandRange: [2, 10], gateFit: ["evening", "night"], depth: "medium",
    paths: ["jnana", "raja"], dimensions: ["awareness"],
    stepKind: "wisdom-read", icon: "🌙" },
  { id: "k:inspiring-quote", kind: "knowledge", label: "Inspiring Quote", defaultMinutes: 2,
    summary: "A single line to carry with you through the day, read slowly enough to be heard twice.", depth: "light",
    paths: ["bhakti", "jnana"], dimensions: ["awareness"],
    stepKind: "wisdom-read", icon: "📜" },
  { id: "k:breath-as-anchor", kind: "knowledge", label: "Breath as Anchor", defaultMinutes: 2,
    summary: "Why every tradition returns to the breath — the one object that is always present and never needs believing.",
    gateFit: ["morning", "midday"], depth: "light",
    paths: ["raja"], dimensions: ["body"],
    stepKind: "wisdom-read", icon: "🌬" },
  { id: "k:karma-yoga", kind: "knowledge", label: "Action as Offering", defaultMinutes: 3,
    summary: "Krishna to Arjuna — do the work fully, release the fruit, and let the result stop being your business.",
    bandRange: [1, 10], depth: "medium",
    paths: ["karma"], dimensions: ["awareness"],
    stepKind: "wisdom-read", icon: "🤲" },
  { id: "k:bhakti-surrender", kind: "knowledge", label: "The Hands Open", defaultMinutes: 2,
    summary: "Meera — devotion as the shortest road through the self, and what surrender costs before it gives.",
    depth: "light", bandRange: [0, 10],
    paths: ["bhakti"], dimensions: ["emotion"],
    stepKind: "wisdom-read", icon: "🪷" },
  { id: "k:jnana-neti", kind: "knowledge", label: "Not This, Not This", defaultMinutes: 2,
    summary: "Neti neti — not this, not this — what remains when every label, role and story has been removed.",
    depth: "medium", bandRange: [2, 10], minJourneyDay: 4,
    paths: ["jnana"], dimensions: ["thought", "awareness"],
    stepKind: "wisdom-read", icon: "🪞" },

  // ── Reflections
  { id: "r:morning-intent", kind: "reflection", label: "One Word Intention", defaultMinutes: 2,
    body: "One word for today. Just one. Write it before the day decides for you.",
    gateFit: ["morning"], depth: "light",
    paths: ["karma"], dimensions: ["awareness"],
    stepKind: "journal", icon: "✨" },
  { id: "r:noticed-shift", kind: "reflection", label: "What Shifted?", defaultMinutes: 3,
    body: "What have you noticed since this morning?",
    gateFit: ["midday", "evening"], depth: "medium",
    paths: ["jnana"], dimensions: ["awareness"],
    stepKind: "journal", icon: "💭" },
  { id: "r:pattern-seen", kind: "reflection", label: "Evening Reflection", defaultMinutes: 4,
    body: "What pattern did you see today? No judgment — just notice.",
    gateFit: ["evening"], depth: "medium",
    paths: ["jnana"], dimensions: ["thought", "awareness"],
    stepKind: "journal", icon: "🔁" },
  { id: "r:let-go", kind: "reflection", label: "Let It Go", defaultMinutes: 3,
    body: "Let everything go. What remains when nothing is being held or fixed?",
    gateFit: ["night"], depth: "light",
    paths: ["jnana", "raja"], dimensions: ["awareness"],
    stepKind: "journal", icon: "🌌" },
  { id: "r:who-feels", kind: "reflection", label: "Who Is Feeling This?", defaultMinutes: 4,
    body: "When emotion arose today — who was feeling it?",
    bandRange: [2, 10], depth: "deep", minJourneyDay: 5,
    paths: ["jnana"], dimensions: ["emotion", "awareness"],
    stepKind: "journal", icon: "🔍" },
  { id: "r:one-truth", kind: "reflection", label: "One Honest Sentence", defaultMinutes: 3,
    body: "Write one sentence you would normally not say out loud.",
    depth: "medium",
    paths: ["jnana"], dimensions: ["emotion", "awareness"],
    stepKind: "journal", icon: "🪞" },
  { id: "r:free-write-5m", kind: "reflection", label: "Free Write", defaultMinutes: 5,
    body: "No editing, no censoring. Keep the pen moving for five minutes.",
    depth: "medium", minJourneyDay: 6,
    paths: ["jnana", "bhakti"], dimensions: ["emotion", "thought"],
    stepKind: "journal", icon: "✍️" },
  { id: "r:karma-offer", kind: "reflection", label: "Offer the Work", defaultMinutes: 3,
    body: "Which one task today could you do as an offering, instead of for the result?",
    depth: "light",
    paths: ["karma"], dimensions: ["awareness", "emotion"],
    stepKind: "journal", icon: "🪷" },
  { id: "r:bhakti-tender", kind: "reflection", label: "What Asked for Love", defaultMinutes: 3,
    body: "Where did something ask for your care today — a person, a room, a task?",
    depth: "light",
    paths: ["bhakti", "karma"], dimensions: ["emotion"],
    stepKind: "journal", icon: "🫱" },
  { id: "r:body-thanks", kind: "reflection", label: "Thank the Body", defaultMinutes: 2,
    body: "Name one thing your body did for you today that you never thanked it for.",
    depth: "light",
    paths: ["bhakti", "raja"], dimensions: ["body", "emotion"],
    stepKind: "journal", icon: "🫀" },

  // ── Micro actions
  { id: "m:three-breaths", kind: "micro_action", label: "Three Conscious Breaths", defaultMinutes: 1,
    body: "Before your next task — three slow breaths.",
    depth: "light",
    paths: ["raja"], dimensions: ["body"],
    stepKind: "micro-act", icon: "🌬" },
  { id: "m:off-app-notice", kind: "micro_action", label: "Catch Yourself on Autopilot", defaultMinutes: 1,
    body: "Notice 3 moments today where you catch yourself on autopilot.",
    gateFit: ["morning"], depth: "light",
    paths: ["jnana"], dimensions: ["awareness"],
    stepKind: "micro-act", icon: "🌅" },
  { id: "m:gratitude-one", kind: "micro_action", label: "One Gratitude", defaultMinutes: 1,
    body: "Thank one person today — genuinely, for one specific thing.",
    depth: "light",
    paths: ["bhakti"], dimensions: ["emotion"],
    stepKind: "micro-act", icon: "🙏" },
  { id: "m:presence-card", kind: "micro_action", label: "Presence Card", defaultMinutes: 1,
    body: "Right now, this moment is complete.",
    depth: "light",
    paths: ["jnana", "raja"], dimensions: ["awareness"],
    stepKind: "micro-act", icon: "🪔" },
  { id: "m:hand-on-heart", kind: "micro_action", label: "Hand on Heart", defaultMinutes: 1,
    body: "Place your hand on your heart. Three breaths. Feel the warmth.",
    depth: "light",
    paths: ["bhakti"], dimensions: ["emotion"],
    stepKind: "micro-act", icon: "💛" },
  { id: "m:one-seen-kindness", kind: "micro_action", label: "One Unseen Kindness", defaultMinutes: 1,
    body: "Do one small thing today that no one will ever know about.",
    depth: "light",
    paths: ["karma", "bhakti"], dimensions: ["emotion"],
    stepKind: "micro-act", icon: "🤫" },
  { id: "m:one-task-fully", kind: "micro_action", label: "One Task, Fully", defaultMinutes: 1,
    body: "Pick the next small task. Do only that. Nothing else exists until it's done.",
    depth: "light",
    paths: ["karma", "raja"], dimensions: ["awareness"],
    stepKind: "micro-act", icon: "🎯" },
];

// ─────────────────────────────────────────────────────────────────────
export interface ComposerContext {
  gate: Gate;
  energy: Energy;
  gapDays: number;
  timeBudgetMin: number;
  band: number;
  activeLoops: string[];
  practiceLevels: Record<string, number>;
  recentIngredientIds: string[];
  /** Archetype ids used by the most recent sessions (newest first) — rotated out. */
  recentArchetypeIds?: string[];
  /** Yoga-path affinity (0-10 each). The dominant path steers the session. */
  pathAffinity?: Partial<Record<YogaPath, number>>;
  /** Journey day (1-based) and phase — early journeys stay foundational. */
  journeyDay?: number | null;
  journeyPhase?: string | null;
  /** Chitta vritti — the mind's current mode from yoga psychology. */
  chittaVritti?: string | null;
  /** Consciousness dimension bands (0-10). The weakest band gets worked. */
  dimensionBands?: Partial<Record<ConsciousnessDimension, number>> | null;
  /** Witness stability 0-1 — gates deep witness/inquiry practices. */
  witnessStability?: number | null;
  /**
   * Learned per-ingredient behaviour from the user's own completions — the
   * engine's feedback loop. Needs a couple of attempts before it counts.
   */
  ingredientPerformance?: Record<string, {
    attempts: number;
    completions: number;
    completionRate: number;
    avgQuality: number;
    avgSeconds: number;
  }>;
  /**
   * Deterministic seed. Same seed + same context = byte-identical plan, which
   * is what makes replay, golden tests and prompt caching possible. When
   * omitted the seed is derived from the scored context itself.
   */
  seed?: number | string;
  preferred?: ArchetypeId;
}

/**
 * Shapes that fight the time of day — "wake the system" at 2am, or "let go" at
 * sunrise. Everything else is allowed anywhere; the gate only weights the pick.
 */
const GATE_CONFLICTS: Partial<Record<ArchetypeId, Gate[]>> = {
  opening: ["night"],
  release: ["morning"],
};

/** Which archetypes each yoga path naturally serves — a bonus, never a lock. */
const PATH_ARCHETYPE_BIAS: Record<YogaPath, ArchetypeId[]> = {
  raja: ["practice_deep", "micro", "release"],
  jnana: ["inquiry", "teaching", "practice_deep"],
  karma: ["teaching", "integration", "micro"],
  bhakti: ["integration", "teaching", "opening"],
};

/** Chitta vritti (mind modes) → practice categories that settle that mode. */
const CHITTA_PRACTICES: Record<string, string[]> = {
  restless: ["breath", "body"],
  distracted: ["witness", "breath", "mantra"],
  dull: ["breath", "movement"],
  focused: ["inquiry", "witness"],
  restrained: ["witness", "contemplation"],
};

/** The user's strongest yoga path, once one has actually been measured. */
function dominantPath(ctx: ComposerContext): YogaPath | null {
  const aff = ctx.pathAffinity;
  if (!aff) return null;
  let best: YogaPath | null = null;
  let bestScore = 0;
  for (const p of ["raja", "jnana", "karma", "bhakti"] as YogaPath[]) {
    const s = Number(aff[p] ?? 0);
    if (s > bestScore) { bestScore = s; best = p; }
  }
  return bestScore > 0 ? best : null;
}

/** Affinity 0-10 → a 0-1 weight, so path bonuses scale with the strength of the signal. */
function pathStrength(ctx: ComposerContext, p: YogaPath): number {
  return Math.min(1, Math.max(0, Number(ctx.pathAffinity?.[p] ?? 0) / 6));
}

/** The user's weakest measured dimension — the session should work it. */
function weakestDimension(ctx: ComposerContext): ConsciousnessDimension | null {
  const bands = ctx.dimensionBands;
  if (!bands) return null;
  let weak: ConsciousnessDimension | null = null;
  let weakScore = Infinity;
  for (const d of ["body", "emotion", "thought", "awareness"] as ConsciousnessDimension[]) {
    const s = Number(bands[d]);
    if (!Number.isFinite(s)) continue;
    // Only target dimensions the engine has actually measured (> 0).
    if (s > 0 && s < weakScore) { weakScore = s; weak = d; }
  }
  return weak;
}

function archetypeFit(a: Archetype, ctx: ComposerContext): number {
  let fit = 0;
  if (a.preferredGates.includes(ctx.gate)) fit += 3;
  if (a.energyFit.includes(ctx.energy)) fit += 2;
  const [lo, hi] = a.durationRangeMin;
  if (ctx.timeBudgetMin >= lo && ctx.timeBudgetMin <= hi) fit += 2;
  else if (ctx.timeBudgetMin >= Math.max(1, lo - 2) && ctx.timeBudgetMin <= hi + 5) fit += 1;
  // Yoga-path bias: the dominant path nudges the shape it naturally serves.
  const path = dominantPath(ctx);
  if (path && PATH_ARCHETYPE_BIAS[path].includes(a.id)) fit += 2;
  return fit;
}

/** Weighted pick — real variety between sessions, without losing the engine's intent. */
function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(ctx: ComposerContext): () => number {
  if (typeof ctx.seed === "number") return makeRng(ctx.seed);
  const source = typeof ctx.seed === "string"
    ? ctx.seed
    : JSON.stringify({
        gate: ctx.gate,
        band: ctx.band,
        energy: ctx.energy,
        budget: ctx.timeBudgetMin,
        day: ctx.journeyDay ?? 1,
        loops: [...(ctx.activeLoops ?? [])].sort(),
        chitta: ctx.chittaVritti ?? "",
        witness: ctx.witnessStability ?? 0,
        recent: ctx.recentIngredientIds ?? [],
        recentArchetypes: ctx.recentArchetypeIds ?? [],
      });
  return makeRng(seedFromString(source));
}

function pickWeighted<T>(items: T[], weight: (item: T) => number, rng: () => number): T {
  const weights = items.map((i) => Math.max(0.05, weight(i)));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

function archetypeReason(a: Archetype, ctx: ComposerContext): string {
  const gateWord = ctx.gate === "midday" ? "Midday" : ctx.gate[0].toUpperCase() + ctx.gate.slice(1);
  const path = dominantPath(ctx);
  const pathWord = path ? ` · ${path} yoga` : "";
  return `${gateWord} ${a.label.toLowerCase()}${pathWord}`;
}

export function selectArchetype(ctx: ComposerContext, rng: () => number = rngFor(ctx)): { archetype: Archetype; reason: string } {
  if (ctx.preferred && ARCHETYPES[ctx.preferred]) {
    return { archetype: ARCHETYPES[ctx.preferred], reason: "User preference" };
  }
  if (ctx.timeBudgetMin <= 3) return { archetype: ARCHETYPES.micro, reason: "Time budget ≤ 3 min" };

  // Everything that fits this moment: right energy, sensible duration, not
  // fighting the gate. The gate only weights the pick — it never pins it.
  const recent = ctx.recentArchetypeIds ?? [];
  const fitting = (Object.keys(ARCHETYPES) as ArchetypeId[])
    .map((id) => ARCHETYPES[id])
    .filter((a) => !(GATE_CONFLICTS[a.id] ?? []).includes(ctx.gate))
    .filter((a) => a.energyFit.includes(ctx.energy))
    .filter((a) => archetypeFit(a, ctx) > 0);

  // Hold out the shapes the last sessions already used, so consecutive
  // sessions never come out identical.
  const rotated = fitting.filter((a) => !recent.includes(a.id));
  const pool = rotated.length ? rotated : fitting;
  if (!pool.length) return { archetype: ARCHETYPES.integration, reason: "Integration — default" };

  // Re-entry after a gap, or low energy: stay gentle, but still rotate
  // between the gentle shapes instead of always returning the same one.
  if (ctx.gapDays >= 4 || ctx.energy === "low") {
    const gentle = pool.filter((a) =>
      a.id === "opening" || a.id === "integration" || a.id === "release" || a.id === "micro");
    const gentlePool = gentle.length ? gentle : pool;
    const chosen = pickWeighted(gentlePool, (a) => archetypeFit(a, ctx), rng);
    const why = ctx.gapDays >= 4
      ? `Re-entry after ${ctx.gapDays}d gap`
      : `Low energy + ${ctx.gate}`;
    return { archetype: chosen, reason: why };
  }

  const chosen = pickWeighted(pool, (a) => archetypeFit(a, ctx), rng);
  return { archetype: chosen, reason: archetypeReason(chosen, ctx) };
}

/**
 * Loop families each ingredient works on.
 *
 * The library catalogues ~650 loops in 22 families, but only a handful had an
 * explicit `loopTargets` entry, so 99% of active loops never influenced the
 * pick. This table maps every ingredient to families, which is what makes the
 * loop layer reachable. Exact ids still score higher than a family match.
 */
export const INGREDIENT_LOOP_FAMILIES: Record<string, string[]> = {
  // ── breath
  "p:breath-box-1m": ["ENR", "BOD", "EMO"],
  "p:breath-446-3m": ["EMO", "ENR", "BOD"],
  "p:breath-478-4m": ["EMO", "ENR", "BOD"],
  "p:breath-fire-3m": ["ENR", "BOD", "MEN"],
  "p:breath-count-5m": ["MEN", "COG", "ATT"],
  // ── body
  "p:body-scan-5m": ["BOD", "EMO", "ENR"],
  "p:yoga-nidra-8m": ["BOD", "EMO", "ENR", "CTL"],
  "p:stretch-release-4m": ["BOD", "CTL", "ENR"],
  "p:walking-6m": ["BOD", "MEN", "PRD", "AVD"],
  // ── witness / attention
  "p:witness-sit-5m": ["NAR", "MEN", "COG", "ATT"],
  "p:witness-sit-10m": ["NAR", "MEN", "ATT"],
  "p:noticing-3m": ["MEN", "COG", "NAR"],
  "p:mantra-5m": ["MEN", "ATT", "CTL"],
  "p:trataka-4m": ["MEN", "CTL", "ENR"],
  // ── inquiry / contemplation
  "p:inquiry-whoami-6m": ["IDN", "EGO", "ATT"],
  "p:inquiry-feeling-4m": ["EMO", "VAL", "REL"],
  "p:contemplation-6m": ["COG", "BLF", "IDN"],
  // ── heart
  "p:metta-5m": ["REL", "VAL", "EMO"],
  "p:gratitude-3m": ["EMO", "REL", "VAL"],
  "p:chant-5m": ["MEN", "EMO", "CTL"],
  "p:prayer-3m": ["SPR", "EMO", "REL"],
  "p:hands-open-2m": ["CTL", "SPR", "EMO"],
  // ── action
  "p:serving-4m": ["SRV", "PUR", "REL", "AVD"],
  // ── knowledge
  "k:rumi-guesthouse": ["EMO", "BLF", "REL", "CRE"],
  "k:witness-vs-thinker": ["NAR", "MEN", "IDN"],
  "k:nothing-to-fix": ["CMP", "IDN", "EGO"],
  "k:inspiring-quote": ["MOT", "BLF", "SPR"],
  "k:breath-as-anchor": ["ENR", "BOD", "MEN"],
  "k:karma-yoga": ["SRV", "PUR", "MOT", "AVD"],
  "k:bhakti-surrender": ["SPR", "CTL", "REL"],
  "k:jnana-neti": ["IDN", "EGO", "BLF"],
  // ── reflection
  "r:morning-intent": ["PUR", "MOT", "DEC"],
  "r:noticed-shift": ["LRN", "COG", "MEN"],
  "r:pattern-seen": ["BHV", "HAB", "NAR"],
  "r:let-go": ["CTL", "ATT", "EMO"],
  "r:who-feels": ["IDN", "EGO", "EMO"],
  "r:one-truth": ["VAL", "BLF", "REL"],
  "r:free-write-5m": ["NAR", "EMO", "COG", "CRE"],
  "r:karma-offer": ["SRV", "PUR", "MOT"],
  "r:bhakti-tender": ["REL", "SPR", "EMO"],
  "r:body-thanks": ["BOD", "ENR", "EMO"],
  // ── micro
  "m:three-breaths": ["ENR", "EMO", "BOD"],
  "m:off-app-notice": ["HAB", "BHV", "MEN"],
  "m:gratitude-one": ["EMO", "REL", "VAL"],
  "m:presence-card": ["MEN", "HAB", "COG", "CRE"],
  "m:hand-on-heart": ["EMO", "VAL", "REL"],
  "m:one-seen-kindness": ["SRV", "REL", "SOC"],
  "m:one-task-fully": ["PRD", "COG", "HAB", "AVD"],
};

/** "ATT001" -> "ATT". */
export function loopFamilyOf(loopId: string): string {
  const m = String(loopId).toUpperCase().match(/^([A-Z]{2,4})/);
  return m ? m[1] : "";
}

function familiesFor(ing: Ingredient): string[] {
  return ing.loopFamilies ?? INGREDIENT_LOOP_FAMILIES[ing.id] ?? [];
}

/**
 * Journey ladder. Deep or destabilising practices open in tiers instead of
 * all at day 6 (the previous ceiling). `minJourneyDay` on the ingredient still
 * wins when it is higher; the ladder only raises the floor.
 */
export const INGREDIENT_JOURNEY_LADDER: Record<string, number> = {
  "p:breath-fire-3m": 7,
  "p:yoga-nidra-8m": 7,
  "r:free-write-5m": 7,
  "m:one-task-fully": 7,
  "p:witness-sit-10m": 14,
  "p:contemplation-6m": 14,
  "p:metta-5m": 14,
  "p:inquiry-feeling-4m": 14,
  "k:witness-vs-thinker": 14,
  "p:chant-5m": 14,
  "p:inquiry-whoami-6m": 21,
  "r:who-feels": 21,
  "k:jnana-neti": 21,
  "k:karma-yoga": 21,
  "p:serving-4m": 21,
  "k:nothing-to-fix": 30,
  "k:bhakti-surrender": 30,
  "r:pattern-seen": 30,
};

function minJourneyDayFor(ing: Ingredient): number {
  return Math.max(ing.minJourneyDay ?? 0, INGREDIENT_JOURNEY_LADDER[ing.id] ?? 0);
}

/** Readiness of a ladder-gated ingredient on a given journey day. */
export function journeyGateFor(
  ingredientId: string,
  journeyDay: number,
): { minDay: number; ready: boolean } {
  const minDay = INGREDIENT_JOURNEY_LADDER[ingredientId] ?? 0;
  return { minDay, ready: minDay === 0 || journeyDay >= minDay };
}

/**
 * Published content from `content_ingredients`, merged into the compile-time
 * bank. The in-file bank stays the offline fallback and the authoring seed.
 */
let EXTRA_INGREDIENTS: Ingredient[] = [];

export function setExtraIngredients(list: Ingredient[] | null | undefined): void {
  const seen = new Set(INGREDIENTS.map((i) => i.id));
  const clean: Ingredient[] = [];
  for (const ing of list ?? []) {
    if (!ing || typeof ing.id !== "string" || !ing.id) continue;
    if (seen.has(ing.id)) continue;
    seen.add(ing.id);
    clean.push(ing);
  }
  EXTRA_INGREDIENTS = clean;
}

export function getIngredientBank(): Ingredient[] {
  return EXTRA_INGREDIENTS.length ? [...INGREDIENTS, ...EXTRA_INGREDIENTS] : INGREDIENTS;
}

export interface IngredientIssue {
  id: string;
  field: string;
  message: string;
}

const VALID_KINDS = new Set(["practice", "knowledge", "reflection", "micro_action"]);
const VALID_DEPTHS = new Set(["light", "medium", "deep"]);
const VALID_STEPS = new Set([
  "wisdom-read", "breathwork", "journal", "micro-act", "reflection", "practice", "witness",
]);

/**
 * The bar an authored ingredient must clear before it can ship. Used by the
 * loader and by tests, so bad content cannot enter the bank silently.
 */
export function validateIngredients(list: Ingredient[]): IngredientIssue[] {
  const issues: IngredientIssue[] = [];
  const seen = new Set<string>();

  for (const ing of list) {
    const id = String(ing?.id ?? "(missing)");
    const push = (field: string, message: string) => issues.push({ id, field, message });

    if (!ing || typeof ing.id !== "string" || !ing.id.trim()) {
      push("id", "id is required");
      continue;
    }
    if (seen.has(ing.id)) push("id", "duplicate id");
    seen.add(ing.id);

    if (!ing.label || ing.label.length > 40) push("label", "label must be 1..40 chars");
    if (!VALID_KINDS.has(String(ing.kind))) push("kind", `unknown kind ${ing.kind}`);
    if (!VALID_DEPTHS.has(String(ing.depth))) push("depth", `unknown depth ${ing.depth}`);
    if (ing.stepKind && !VALID_STEPS.has(String(ing.stepKind))) {
      push("stepKind", `unrenderable step kind ${ing.stepKind}`);
    }

    const text = String(ing.body ?? ing.summary ?? "");
    // Practices carry a short caption; their depth comes from the step-script
    // contract. Reads are the instruction itself, so they need more.
    const minChars = ing.kind === "knowledge"
      ? 60
      : ing.kind === "practice" ? 40
      : ing.kind === "reflection" ? 40 : 25;
    if (text.length < minChars) {
      push("summary", `needs at least ${minChars} characters for ${ing.kind}`);
    }

    if (!Array.isArray(ing.dimensions) || ing.dimensions.length === 0) {
      push("dimensions", "at least one dimension");
    }
    const mappedFamilies = INGREDIENT_LOOP_FAMILIES[ing.id] ?? [];
    const familyCount = Array.isArray(ing.loopFamilies) && ing.loopFamilies.length > 0
      ? ing.loopFamilies.length
      : mappedFamilies.length;
    if (familyCount < 2 && !(ing.loopTargets && ing.loopTargets.length > 0)) {
      push("loopFamilies", "needs 2+ loop families or an explicit loop target");
    }
    if (ing.params && typeof ing.params !== "object") {
      push("params", "params must be an object");
    }
  }

  return issues;
}

const W = {
  loopMatch: 3, practiceLevelFit: 2, gateAlignment: 2, freshness: 1.5,
  energyFit: 1, bandFit: 1, slotBias: 2.5, repetitionPenalty: -4,
  // The user's own path is the top-tier signal: a session that ignores where
  // the user actually is has failed to personalize.
  pathMatch: 6, dimensionNeed: 4, journeyFit: 2, chittaFit: 3, journeyTooEarly: -8,
  witnessStabilityNeed: -4,
  // Learned fit — what this user actually finishes. Only as strong as the evidence.
  learnedBehavior: 5, learnedQuality: 3,
};

function eligibleFor(slot: ArchetypeSlot, ing: Ingredient, ctx: ComposerContext): boolean {
  if (!slot.accepts.includes(ing.kind)) return false;
  if (ing.bandRange) { const [lo, hi] = ing.bandRange; if (ctx.band < lo || ctx.band > hi) return false; }
  if (ing.energyFit && !ing.energyFit.includes(ctx.energy)) return false;
  if (ing.gateFit && !ing.gateFit.includes(ctx.gate)) return false;
  // Journey readiness is a soft gate, not an exclusion. Hard-excluding
  // `minJourneyDay` here made every later-journey ingredient unreachable
  // forever, because `witnessStability` was never supplied. The penalty in
  // `scoreIngredient` (W.journeyTooEarly / W.witnessStabilityNeed) does the
  // holding back, so the library stays reachable when nothing else fits.
  return true;
}

function scoreIngredient(ing: Ingredient, slot: ArchetypeSlot, ctx: ComposerContext, rng: () => number = rngFor(ctx)): { score: number; reasons: string[] } {
  let score = 0; const reasons: string[] = [];
  if (ctx.activeLoops.length) {
    const exact = (ing.loopTargets ?? []).filter((l) => ctx.activeLoops.includes(l)).length;
    const families = familiesFor(ing);
    const familyHits = families.length
      ? ctx.activeLoops.filter((l) => families.includes(loopFamilyOf(l))).length
      : 0;
    if (exact > 0) { score += W.loopMatch * exact; reasons.push(`loop match ×${exact}`); }
    if (familyHits > 0) {
      score += W.loopMatch * 0.75 * Math.min(2, familyHits);
      reasons.push(`loop family ×${familyHits}`);
    }
  }
  if (ing.practice) {
    const lvl = ctx.practiceLevels[ing.practice] ?? 0;
    const want = ing.depth === "deep" ? 3 : ing.depth === "medium" ? 1 : 0;
    const fit = Math.max(0, 2 - Math.abs(lvl - want));
    if (fit > 0) { score += W.practiceLevelFit * fit; reasons.push(`practice fit ${fit}`); }
  }
  if (ing.gateFit?.includes(ctx.gate)) { score += W.gateAlignment; reasons.push("gate aligned"); }
  if (!ctx.recentIngredientIds.includes(ing.id)) { score += W.freshness; reasons.push("fresh"); }
  else { score += W.repetitionPenalty; reasons.push("repeat"); }
  if (ing.energyFit?.includes(ctx.energy)) { score += W.energyFit; reasons.push("energy fit"); }
  if (ing.bandRange) { score += W.bandFit; reasons.push("band fit"); }
  if (slot.practiceBias && ing.practice && slot.practiceBias.includes(ing.practice)) {
    score += W.slotBias; reasons.push(`slot prefers ${ing.practice}`);
  }
  if (slot.depth && ing.depth === slot.depth) { score += W.slotBias * 0.5; reasons.push("depth match"); }

  // ── The user's yoga path — the strongest personal signal there is ──
  if (ing.paths?.length) {
    let pathScore = 0;
    for (const p of ing.paths) {
      if (pathStrength(ctx, p) > 0) { pathScore += pathStrength(ctx, p); }
    }
    if (pathScore > 0) {
      score += W.pathMatch * Math.min(1.5, pathScore);
      reasons.push(`serves ${ing.paths.join("/")} yoga`);
    }
  }

  // ── The user's weakest consciousness dimension gets worked ──
  const weak = weakestDimension(ctx);
  if (weak && ing.dimensions?.includes(weak)) {
    const band = Number(ctx.dimensionBands?.[weak] ?? 0);
    // Weaker band → stronger pull (0-10 band → 0.25-1.0 multiplier).
    score += W.dimensionNeed * (1.25 - Math.min(1, band / 10));
    reasons.push(`works your ${weak} band`);
  }

  // ── Journey readiness: not-yet-due practices are held back, phase-fitting ones nudged ──
  const journeyDay = ctx.journeyDay ?? 1;
  const minDay = minJourneyDayFor(ing);
  if (minDay > 0 && journeyDay >= minDay) {
    score += W.journeyFit; reasons.push(`journey day ${journeyDay} is ready`);
  }
  if (minDay > 0 && journeyDay < minDay) {
    // Not due yet. This is the soft version of the readiness gate: the
    // ingredient can still win when nothing else fits, but it has to earn it.
    score += W.journeyTooEarly;
    reasons.push(`not due until day ${minDay}`);
    if ((ctx.witnessStability ?? 0) < 0.5) {
      score += W.witnessStabilityNeed;
      reasons.push("witness not yet stable");
    }
  }
  const early = ctx.journeyPhase === "assessment" || journeyDay <= 7;
  if (early && ing.depth === "light") { score += W.journeyFit * 0.5; reasons.push("early journey — gentle"); }

  // 11. Chitta vritti — the mind's current mode asks for a matching practice
  if (ctx.chittaVritti && ing.settlesChitta?.includes(ctx.chittaVritti)) {
    score += W.chittaFit;
    reasons.push(`settles ${ctx.chittaVritti}`);
  } else if (ctx.chittaVritti && ing.practice && CHITTA_PRACTICES[ctx.chittaVritti]?.includes(ing.practice)) {
    score += W.chittaFit * 0.6;
    reasons.push(`fits ${ctx.chittaVritti}`);
  }

  // 12. LEARNED FIT — what this user actually finishes and rates well. The
  // engine's only feedback term: every completed session teaches it.
  const perf = ctx.ingredientPerformance?.[ing.id];
  if (perf && perf.attempts >= 2) {
    const confidence = Math.min(1, perf.attempts / 4);
    // Completion behaviour: -1 (always abandoned) … +1 (always finished).
    score += W.learnedBehavior * (perf.completionRate - 0.5) * 2 * confidence;
    if (perf.avgQuality > 0) {
      score += W.learnedQuality * (perf.avgQuality - 0.5) * 2 * confidence;
    }
    if (perf.completionRate >= 0.7) reasons.push("learned: this works for you");
    else if (perf.completionRate <= 0.3) reasons.push("learned: usually abandoned");
  }

  // 13. EXPLORATION — UCB bonus. Thin evidence gets a small lift so the engine
  // keeps testing ingredients instead of locking onto an early favourite.
  const performance = ctx.ingredientPerformance ?? {};
  let totalAttempts = 0;
  for (const p of Object.values(performance)) totalAttempts += p?.attempts ?? 0;
  const attempts = perf?.attempts ?? 0;
  const explore = Math.min(1.8, 1.2 * Math.sqrt(Math.log(totalAttempts + 2) / (attempts + 1)));
  score += explore;
  if (explore > 1.4) reasons.push("exploring");

  score += rng() * 1.5;
  return { score, reasons };
}

export interface ComposedSlot {
  role: SlotRole;
  ingredient: Ingredient;
  minutes: number;
  score: number;
  reason: string;
}

export interface ComposedSession {
  archetypeId: ArchetypeId;
  archetypeLabel: string;
  archetypeReason: string;
  toneWords: string[];
  totalMinutes: number;
  slots: ComposedSlot[];
}

export function composeSession(ctx: ComposerContext): ComposedSession {
  const rng = rngFor(ctx);
  const { archetype, reason: archetypeReason } = selectArchetype(ctx, rng);
  const used = new Set<string>();
  const slots: ComposedSlot[] = [];
  for (const slot of archetype.slots) {
    const cands = getIngredientBank().filter((i) => eligibleFor(slot, i, ctx) && !used.has(i.id));
    if (!cands.length) continue;
    const ranked = cands
      .map((ing) => ({ ing, ...scoreIngredient(ing, slot, ctx, rng) }))
      .sort((a, b) => b.score - a.score);
    // Weighted pick among the top few — the engine's ranking still decides,
    // but the same stack of scores doesn't have to win the same way twice.
    const best = pickWeighted(ranked.slice(0, Math.min(3, ranked.length)), (c) => c.score, rng);
    used.add(best.ing.id);
    const minutes = Math.max(1, Math.round(ctx.timeBudgetMin * slot.share));
    slots.push({ role: slot.role, ingredient: best.ing, minutes, score: best.score, reason: best.reasons.join(", ") });
  }
  // Normalize minutes to fit budget
  const raw = slots.reduce((s, x) => s + x.minutes, 0);
  if (raw !== ctx.timeBudgetMin && slots.length) {
    const factor = ctx.timeBudgetMin / raw;
    let running = 0;
    slots.forEach((s, i) => {
      if (i === slots.length - 1) s.minutes = Math.max(1, ctx.timeBudgetMin - running);
      else { s.minutes = Math.max(1, Math.round(s.minutes * factor)); running += s.minutes; }
    });
  }
  return {
    archetypeId: archetype.id, archetypeLabel: archetype.label,
    archetypeReason, toneWords: archetype.toneWords,
    totalMinutes: slots.reduce((s, x) => s + x.minutes, 0),
    slots,
  };
}

export function composeTitle(session: ComposedSession, gate: Gate): string {
  const tone = session.toneWords[0] ?? "";
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const suffix = gate === "morning" ? "Opening"
              : gate === "evening" ? "Settling"
              : gate === "night"   ? "Release"
              : "Pause";
  return `${cap(tone)} ${suffix}`.trim();
}
