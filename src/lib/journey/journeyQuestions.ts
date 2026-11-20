/**
 * Cinematic Journey — Question Bank
 * ─────────────────────────────────
 * 50-100 dynamic questions organized by the app's metric categories.
 * Each question carries scoring tags consumed by the journey engine and
 * persisted to Supabase at journey completion.
 *
 * Categories:
 *   1.  Consciousness & Band
 *   2.  Dimensions (Head / Heart / Gut / Body)
 *   3.  V-Level & Emergence
 *   4.  Active Loops
 *   5.  Witness Quality
 *   6.  Integration Score
 *   7.  Path Affinity (Bhakti / Karma / Jnana / Raja / Tantra / Kriya)
 *   8.  Archetype
 *   9.  Brain Dominance (Head / Heart / Gut)
 *  10.  Emotional Maturity
 *  11.  Somatic & Body
 *  12.  Life Domains
 *  13.  Circadian & Energy
 *  14.  Practice History
 *  15.  Beliefs & Worldview
 *  16.  Shadow & Defenses
 *  17.  Purpose & Direction
 *  18.  Attachment Style
 *  19.  Cognitive Style
 *  20.  Inner Critic
 *  21.  Psyche Values
 *  22.  Consciousness Domains
 *  23.  App Relationship
 *  24.  Chitta-Vritti
 *  25.  H-Capacities
 */

// ─── Scoring primitives ──────────────────────────────────────────────────────

export type Brain = "head" | "heart" | "gut";

export type PathId = "bhakti" | "karma" | "jnana" | "raja" | "tantra" | "kriya";

export type DimensionId = "thought" | "emotion" | "body" | "awareness";

export type DomainId =
  | "career"
  | "relationships"
  | "health"
  | "finance"
  | "creativity"
  | "spirituality"
  | "family"
  | "community"
  | "learning"
  | "leisure";

export type ArchetypeSlug =
  | "seeker"
  | "devotee"
  | "warrior"
  | "sage"
  | "mystic"
  | "healer"
  | "lover"
  | "creator"
  | "ruler"
  | "rebel"
  | "hermit"
  | "servant";

export type LoopFamilyCode =
  | "VAL"   // Validation / self-worth
  | "CTL"   // Control / surrender
  | "AVD"   // Avoidance / numbing
  | "SRV"   // Service / over-giving
  | "SOC"   // Social / belonging
  | "IDN"   // Identity / self-concept
  | "EMO"   // Emotional regulation
  | "HAB"   // Habit / addiction
  | "KAR"   // Karma / patterns
  | "BHA"   // Bhakti / attachment
  | "GYA"   // Jnana / knowing
  | "KRI"   // Kriya / energy
  ;

export type ScoreTag =
  | { band?: number }
  | { vLevelDelta?: number }
  | { dimension?: Partial<Record<DimensionId, number>> }
  | { brain?: Brain }
  | { paths?: Partial<Record<PathId, number>> }
  | { archetype?: ArchetypeSlug }
  | { loops?: LoopFamilyCode[] }
  | { domain?: Partial<Record<DomainId, number>> }
  | { integrationDelta?: number }
  | { witnessDelta?: number }
  | { emotionDelta?: number }
  | { somaticDelta?: number }
  | { circadian?: "morning" | "midday" | "evening" | "night" }
  | { belief?: "external" | "mixed" | "internal" | "nondual" }
  | { attachment?: "secure" | "anxious" | "avoidant" | "disorganized" }
  | { cognitive?: "analytical" | "intuitive" | "concrete" | "abstract" }
  | { criticVolume?: number }
  | { shadowProjection?: number }
  | { somaticAwareness?: number }
  | { purposeClarity?: number }
  | { hCapacity?: Partial<Record<string, number>> }
  | { appRelationship?: "new" | "casual" | "committed" | "deep" }
  | { chittaVritti?: number }
  ;

export interface JourneyOption {
  id: string;
  label: string;
  hint?: string;
  scoreTags: ScoreTag[];
}

export interface JourneyQuestion {
  id: string;
  category: string;
  categoryLabel: string;
  cinematicLabel: string;      // Dramatic question text shown to user
  cinematicSubtitle?: string;
  kind: "choice" | "scale" | "multi" | "text";
  multi?: boolean;
  maxSelect?: number;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  options?: JourneyOption[];
  placeholder?: string;
  maxLength?: number;
  scoreAs?: string;
}

// ─── Question bank (75 questions) ───────────────────────────────────────────

export const JOURNEY_QUESTIONS: JourneyQuestion[] = [
  // ══ 1. CONSCIOUSNESS & BAND (5) ══════════════════════════════════════════

  {
    id: "q_band_feeling",
    category: "consciousness",
    categoryLabel: "Consciousness & Band",
    cinematicLabel: "Right now, if your awareness had a colour, what shade is it?",
    cinematicSubtitle: "Not what you wish it was. What it actually is.",
    kind: "choice",
    options: [
      { id: "deep_sleep", label: "Deep sleep — numb, not even aware I'm not aware", scoreTags: [{ band: 0.5 }] },
      { id: "drowsy", label: "Drowsy — half-present, drifting", scoreTags: [{ band: 1.5 }] },
      { id: "restless", label: "Restless — aware but scattered", scoreTags: [{ band: 2.5 }] },
      { id: "present", label: "Present — here, mostly", scoreTags: [{ band: 3.5 }] },
      { id: "awake", label: "Awake — genuinely aware of what's happening inside", scoreTags: [{ band: 4.5 }] },
      { id: "clear", label: "Clear — space around everything, including this question", scoreTags: [{ band: 5.5 }] },
      { id: "witness", label: "Witness — I'm watching myself answer this", scoreTags: [{ band: 6.5 }] },
      { id: "luminous", label: "Luminous — even the watcher feels radiant", scoreTags: [{ band: 7.5 }] },
    ],
  },
  {
    id: "q_band_sustain",
    category: "consciousness",
    categoryLabel: "Consciousness & Band",
    cinematicLabel: "How long can you stay genuinely present before life pulls you back?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Moments",
    maxLabel: "Hours",
    scoreAs: "band_sustain",
  },
  {
    id: "q_identity_stability",
    category: "consciousness",
    categoryLabel: "Consciousness & Band",
    cinematicLabel: "When the world shakes, how solid is your sense of who you are?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Dissolves",
    maxLabel: "Unshakable",
    scoreAs: "identity_stability",
  },
  {
    id: "q_awakening_moment",
    category: "consciousness",
    categoryLabel: "Consciousness & Band",
    cinematicLabel: "Have you ever touched something deeper than thought — even for a second?",
    kind: "choice",
    options: [
      { id: "never", label: "Never felt anything like it", scoreTags: [{ band: 1 }] },
      { id: "hint", label: "A hint — during meditation, music, or nature", scoreTags: [{ band: 3 }] },
      { id: "glimpse", label: "A genuine glimpse — it changed something permanently", scoreTags: [{ band: 5 }] },
      { id: "frequent", label: "It happens frequently — I live differently now", scoreTags: [{ band: 7 }] },
      { id: "abiding", label: "Abiding — the glimpse doesn't leave", scoreTags: [{ band: 9 }] },
    ],
  },
  {
    id: "q_metaphor_house",
    category: "consciousness",
    categoryLabel: "Consciousness & Band",
    cinematicLabel: "If your mind were a house, how many rooms are actually lit?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "One dark room",
    maxLabel: "Every corner",
    scoreAs: "band_rooms_lit",
  },

  // ══ 2. DIMENSIONS — HEAD / HEART / GUT / BODY (8) ════════════════════════

  {
    id: "q_dim_thought",
    category: "dimensions",
    categoryLabel: "Dimensions",
    cinematicLabel: "When faced with uncertainty, where does your mind go first?",
    kind: "choice",
    options: [
      { id: "analyze", label: "Into analysis — I map every possibility", scoreTags: [{ dimension: { thought: 3 } }] },
      { id: "trust", label: "Into feeling — I ask my gut", scoreTags: [{ dimension: { emotion: 3 } }] },
      { id: "act", label: "Into action — thinking happens while doing", scoreTags: [{ dimension: { body: 3 } }] },
      { id: "still", label: "Into stillness — I wait for clarity", scoreTags: [{ dimension: { awareness: 3 } }] },
      { id: "all", label: "It depends on the situation", scoreTags: [{ dimension: { thought: 1, emotion: 1, body: 1, awareness: 1 } }] },
    ],
  },
  {
    id: "q_dim_thought_score",
    category: "dimensions",
    categoryLabel: "Dimensions",
    cinematicLabel: "On a typical day, how much of your energy lives in thinking?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "None",
    maxLabel: "All day",
    scoreAs: "dimension_thought",
  },
  {
    id: "q_dim_emotion_score",
    category: "dimensions",
    categoryLabel: "Dimensions",
    cinematicLabel: "How present are you to what your body is actually feeling right now?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Nothing",
    maxLabel: "Fully present",
    scoreAs: "dimension_emotion",
  },
  {
    id: "q_dim_body_score",
    category: "dimensions",
    categoryLabel: "Dimensions",
    cinematicLabel: "When was the last time you moved your body just for the joy of it?",
    kind: "choice",
    options: [
      { id: "cant_remember", label: "I can't remember", scoreTags: [{ dimension: { body: 0.5 } }] },
      { id: "weeks", label: "Weeks ago", scoreTags: [{ dimension: { body: 2 } }] },
      { id: "days", label: "A few days ago", scoreTags: [{ dimension: { body: 4 } }] },
      { id: "yesterday", label: "Yesterday", scoreTags: [{ dimension: { body: 6 } }] },
      { id: "today", label: "Today — movement is already part of me", scoreTags: [{ dimension: { body: 8 } }] },
    ],
  },
  {
    id: "q_dim_awareness_score",
    category: "dimensions",
    categoryLabel: "Dimensions",
    cinematicLabel: "Can you feel your own heartbeat without touching your chest?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "No idea",
    maxLabel: "Strong and clear",
    scoreAs: "dimension_awareness",
  },
  {
    id: "q_dim_head_heart_gut",
    category: "dimensions",
    categoryLabel: "Dimensions",
    cinematicLabel: "Which faculty is strongest right now — head, heart, or gut?",
    kind: "choice",
    options: [
      { id: "head", label: "Head — clarity and analysis", scoreTags: [{ brain: "head" }, { dimension: { thought: 3 } }] },
      { id: "heart", label: "Heart — feeling and connection", scoreTags: [{ brain: "heart" }, { dimension: { emotion: 3 } }] },
      { id: "gut", label: "Gut — instinct and action", scoreTags: [{ brain: "gut" }, { dimension: { body: 3 } }] },
    ],
  },
  {
    id: "q_dim_integration_self",
    category: "dimensions",
    categoryLabel: "Dimensions",
    cinematicLabel: "When your mind, heart, and body want different things, how do you respond?",
    kind: "choice",
    options: [
      { id: "confused", label: "Confused — I don't know whose voice to trust", scoreTags: [{ integrationDelta: -2 }] },
      { id: "one_wins", label: "One wins — I override the others", scoreTags: [{ integrationDelta: -1 }] },
      { id: "negotiate", label: "I try to negotiate between them", scoreTags: [{ integrationDelta: 2 }] },
      { id: "listen", label: "I listen — they usually agree if given space", scoreTags: [{ integrationDelta: 4 }] },
      { id: "aligned", label: "They're already aligned — no conflict, just flow", scoreTags: [{ integrationDelta: 6 }] },
    ],
  },
  {
    id: "q_dim_sensory_grounding",
    category: "dimensions",
    categoryLabel: "Dimensions",
    cinematicLabel: "Right now, without touching anything — can you feel your feet on the ground?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Nothing",
    maxLabel: "Strongly",
    scoreAs: "sensory_grounding",
  },

  // ══ 3. V-LEVEL & EMERGENCE (5) ═══════════════════════════════════════════

  {
    id: "q_vlevel_self",
    category: "vlevel",
    categoryLabel: "V-Level & Emergence",
    cinematicLabel: "When you're truly honest with yourself, what level of inner freedom do you experience?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Totally trapped",
    maxLabel: "Completely free",
    scoreAs: "v_level_self",
  },
  {
    id: "q_vlevel_suffering",
    category: "vlevel",
    categoryLabel: "V-Level & Emergence",
    cinematicLabel: "How much of your daily suffering feels self-created vs. real?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Mostly real",
    maxLabel: "Mostly self-created",
    scoreAs: "v_level_suffering_perception",
  },
  {
    id: "q_vlevel_pattern_break",
    category: "vlevel",
    categoryLabel: "V-Level & Emergence",
    cinematicLabel: "How often do you catch yourself in a pattern before you act on it?",
    kind: "choice",
    options: [
      { id: "never", label: "Never — I only notice after", scoreTags: [{ vLevelDelta: -1 }] },
      { id: "sometimes", label: "Sometimes — the noticing comes late", scoreTags: [{ vLevelDelta: 1 }] },
      { id: "often", label: "Often — I catch it mid-action", scoreTags: [{ vLevelDelta: 3 }] },
      { id: "always", label: "Always — the pattern can't run without me", scoreTags: [{ vLevelDelta: 5 }] },
    ],
  },
  {
    id: "q_vlevel_craving",
    category: "vlevel",
    categoryLabel: "V-Level & Emergence",
    cinematicLabel: "When a strong wanting rises in you, how long does it take to see it for what it is?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "I act before I notice",
    maxLabel: "I see it dissolve before it takes root",
    scoreAs: "v_level_craving_gap",
  },
  {
    id: "q_vlevel_effort",
    category: "vlevel",
    categoryLabel: "V-Level & Emergence",
    cinematicLabel: "How much effort does it take to be your best self right now?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Impossible — I can't even try",
    maxLabel: "Zero — it flows naturally",
    scoreAs: "v_level_effort",
  },

  // ══ 4. ACTIVE LOOPS (6) ═══════════════════════════════════════════════════

  {
    id: "q_loops_primary",
    category: "loops",
    categoryLabel: "Active Loops",
    cinematicLabel: "Which of these patterns runs loudest in your mind right now?",
    cinematicSubtitle: "Be honest — the engine can only fix what it sees.",
    kind: "multi",
    maxSelect: 3,
    options: [
      { id: "loop_never_enough", label: "Never enough — I'm not doing enough", scoreTags: [{ loops: ["VAL001", "BLF001"] }] },
      { id: "loop_control", label: "Control — if I let go, it all falls apart", scoreTags: [{ loops: ["CTL003", "CTL001"] }] },
      { id: "loop_avoidance", label: "Avoidance — distraction, scrolling, numbing", scoreTags: [{ loops: ["AVD001", "HAB001"] }] },
      { id: "loop_worry", label: "Worry — same fear, same story, same knot", scoreTags: [{ loops: ["SRV001", "CTL002"] }] },
      { id: "loop_people_pleasing", label: "People-pleasing — I can't say no", scoreTags: [{ loops: ["SOC001", "VAL002"] }] },
      { id: "loop_identity", label: "Identity — 'who am I really?' won't leave", scoreTags: [{ loops: ["IDN001", "IDN002"] }] },
      { id: "loop_rage", label: "Rage / anger — it rises fast", scoreTags: [{ loops: ["EMO001", "SRV002"] }] },
      { id: "loop_comparison", label: "Comparison — their life, my lack", scoreTags: [{ loops: ["VAL025", "SOC002"] }] },
      { id: "loop_guilt", label: "Guilt — something is always wrong", scoreTags: [{ loops: ["VAL003", "EMO003"] }] },
      { id: "loop_perfectionism", label: "Perfectionism — if it's not perfect, it's worthless", scoreTags: [{ loops: ["CTL002", "VAL004"] }] },
    ],
  },
  {
    id: "q_loops_trigger",
    category: "loops",
    categoryLabel: "Active Loops",
    cinematicLabel: "What usually triggers your worst pattern?",
    kind: "choice",
    options: [
      { id: "rejection", label: "Rejection — being left out or abandoned", scoreTags: [{ loops: ["SOC001"] }] },
      { id: "failure", label: "Failure — not being good enough", scoreTags: [{ loops: ["VAL001"] }] },
      { id: "conflict", label: "Conflict — someone pushing against me", scoreTags: [{ loops: ["CTL001"] }] },
      { id: "boredom", label: "Boredom — the emptiness drives me to numb", scoreTags: [{ loops: ["AVD001"] }] },
      { id: "success", label: "Success — it makes me anxious that I'll lose it", scoreTags: [{ loops: ["CTL003"] }] },
      { id: "silence", label: "Silence — alone with my thoughts", scoreTags: [{ loops: ["AVD002"] }] },
    ],
  },
  {
    id: "q_loops_duration",
    category: "loops",
    categoryLabel: "Active Loops",
    cinematicLabel: "On average, how long does a difficult spiral last before you catch yourself?",
    kind: "choice",
    options: [
      { id: "hours", label: "Hours — I lose most of the day", scoreTags: [{ loops: ["AVD001", "EMO001"] }] },
      { id: "tens_minutes", label: "10-30 minutes", scoreTags: [{ loops: ["CTL001"] }] },
      { id: "few_minutes", label: "A few minutes — I'm getting better", scoreTags: [{ loops: [] }] },
      { id: "moments", label: "Moments — I see it before it takes hold", scoreTags: [{ loops: [] }] },
    ],
  },
  {
    id: "q_loops_oldest",
    category: "loops",
    categoryLabel: "Active Loops",
    cinematicLabel: "How far back does your oldest pattern go — childhood, or something earlier?",
    kind: "choice",
    options: [
      { id: "adult", label: "Adult life — it appeared later", scoreTags: [{ loops: ["KAR001"] }] },
      { id: "teen", label: "Teen years — it started with identity", scoreTags: [{ loops: ["IDN001"] }] },
      { id: "child", label: "Childhood — I can remember the first moment", scoreTags: [{ loops: ["VAL001", "EMO001"] }] },
      { id: "dont_know", label: "I don't know — it's always been there", scoreTags: [{ loops: ["SAM001"] }] },
    ],
  },
  {
    id: "q_loops_cost",
    category: "loops",
    categoryLabel: "Active Loops",
    cinematicLabel: "What has this pattern cost you — relationships, opportunities, inner peace?",
    kind: "choice",
    options: [
      { id: "inner_peace", label: "Inner peace — I'm at war with myself", scoreTags: [{ loops: ["EMO001", "CTL001"] }] },
      { id: "relationships", label: "Relationships — I push people away", scoreTags: [{ loops: ["SOC001", "AVD001"] }] },
      { id: "opportunities", label: "Opportunities — I don't go for what I want", scoreTags: [{ loops: ["VAL001", "CTL002"] }] },
      { id: "health", label: "Health — body carries what mind won't process", scoreTags: [{ loops: ["HAB001", "EMO002"] }] },
      { id: "multiple", label: "All of the above", scoreTags: [{ loops: ["VAL001", "SOC001", "CTL001", "EMO001", "HAB001"] }] },
    ],
  },
  {
    id: "q_loops_exit",
    category: "loops",
    categoryLabel: "Active Loops",
    cinematicLabel: "If this pattern had a door marked EXIT, would you open it today?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "It's who I am",
    maxLabel: "I'm through it now",
    scoreAs: "loop_exit_readiness",
  },

  // ══ 5. WITNESS QUALITY (5) ═══════════════════════════════════════════════

  {
    id: "q_witness_self",
    category: "witness",
    categoryLabel: "Witness Quality",
    cinematicLabel: "Can you watch your own thoughts without getting swept into them?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Never — I'm the thought",
    maxLabel: "Always — pure witnessing",
    scoreAs: "witness_self",
  },
  {
    id: "q_witness_gap",
    category: "witness",
    categoryLabel: "Witness Quality",
    cinematicLabel: "How big is the gap between stimulus and your reaction?",
    kind: "choice",
    options: [
      { id: "none", label: "None — I react before I think", scoreTags: [{ witnessDelta: -3 }] },
      { id: "small", label: "Small — sometimes I catch it", scoreTags: [{ witnessDelta: 0 }] },
      { id: "medium", label: "Medium — a pause has appeared", scoreTags: [{ witnessDelta: 3 }] },
      { id: "large", label: "Large — I choose my response", scoreTags: [{ witnessDelta: 5 }] },
      { id: "vast", label: "Vast — the stimulus barely touches", scoreTags: [{ witnessDelta: 7 }] },
    ],
  },
  {
    id: "q_witness_others",
    category: "witness",
    categoryLabel: "Witness Quality",
    cinematicLabel: "When someone accuses or attacks you, how much of their energy sticks to you?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "It haunts me for days",
    maxLabel: "I see it pass like weather",
    scoreAs: "witness_other_projection",
  },
  {
    id: "q_witness_depth",
    category: "witness",
    categoryLabel: "Witness Quality",
    cinematicLabel: "When you sit quietly, how deep does the silence go?",
    kind: "choice",
    options: [
      { id: "surface", label: "Surface — mind keeps talking", scoreTags: [{ witnessDelta: 0 }] },
      { id: "medium", label: "Medium — thoughts thin out", scoreTags: [{ witnessDelta: 3 }] },
      { id: "deep", label: "Deep — I feel spacious inside", scoreTags: [{ witnessDelta: 5 }] },
      { id: "vast", label: "Vast — there is no 'I' in the silence", scoreTags: [{ witnessDelta: 7 }] },
      { id: "abiding", label: "Abiding — silence is my natural state", scoreTags: [{ witnessDelta: 9 }] },
    ],
  },
  {
    id: "q_witness_daily",
    category: "witness",
    categoryLabel: "Witness Quality",
    cinematicLabel: "How often do you deliberately step back and observe your own reactions?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Never",
    maxLabel: "Constantly",
    scoreAs: "witness_daily_practice",
  },

  // ══ 6. INTEGRATION SCORE (4) ══════════════════════════════════════════════

  {
    id: "q_integration_conflict",
    category: "integration",
    categoryLabel: "Integration",
    cinematicLabel: "When your thoughts, feelings, and desires pull in different directions, how do you navigate?",
    kind: "choice",
    options: [
      { id: "override", label: "I override — one part wins by force", scoreTags: [{ integrationDelta: -2 }] },
      { id: "suppress", label: "I suppress the parts I don't want", scoreTags: [{ integrationDelta: -3 }] },
      { id: "confused", label: "I'm confused — I don't know whose voice to listen to", scoreTags: [{ integrationDelta: -1 }] },
      { id: "negotiate", label: "I try to find a middle path", scoreTags: [{ integrationDelta: 2 }] },
      { id: "dialogue", label: "I dialogue — each part has a voice", scoreTags: [{ integrationDelta: 4 }] },
      { id: "harmony", label: "They're usually in harmony now", scoreTags: [{ integrationDelta: 6 }] },
    ],
  },
  {
    id: "q_integration_wholeness",
    category: "integration",
    categoryLabel: "Integration",
    cinematicLabel: "On a typical day, how whole do you feel as a person?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Fragmented",
    maxLabel: "Wholeness",
    scoreAs: "integration_wholeness",
  },
  {
    id: "q_integration_body_mind",
    category: "integration",
    categoryLabel: "Integration",
    cinematicLabel: "How much does your body speak the same language as your mind?",
    kind: "choice",
    options: [
      { id: "at_war", label: "At war — body rebels against what mind wants", scoreTags: [{ integrationDelta: -2 }] },
      { id: "ignored", label: "Ignored — mind doesn't listen to body", scoreTags: [{ integrationDelta: -1 }] },
      { id: "sometimes", label: "Sometimes — they agree", scoreTags: [{ integrationDelta: 2 }] },
      { id: "mostly", label: "Mostly — they work together", scoreTags: [{ integrationDelta: 4 }] },
      { id: "unified", label: "Unified — one movement, one being", scoreTags: [{ integrationDelta: 6 }] },
    ],
  },
  {
    id: "q_integration_shadow",
    category: "integration",
    categoryLabel: "Integration",
    cinematicLabel: "How much of yourself do you hide from the world — and from yourself?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Almost everything hidden",
    maxLabel: "Almost nothing hidden",
    scoreAs: "integration_shadow_owned",
  },

  // ══ 7. PATH AFFINITY (6) ═════════════════════════════════════════════════

  {
    id: "q_path_attraction",
    category: "paths",
    categoryLabel: "Path Affinity",
    cinematicLabel: "Which doorway calls to you most right now?",
    kind: "choice",
    options: [
      { id: "bhakti", label: "Devotion — music, tears, surrender", scoreTags: [{ paths: { bhakti: 3, shakti: 1 } }] },
      { id: "jnana", label: "Knowing — inquiry, clarity, truth", scoreTags: [{ paths: { jnana: 3, raja: 1 } }] },
      { id: "karma", label: "Action — service, doing, results", scoreTags: [{ paths: { karma: 3 } }] },
      { id: "dhyana", label: "Stillness — silent sitting, depth", scoreTags: [{ paths: { dhyana: 3, raja: 1 } }] },
      { id: "tantra", label: "Sacred body — breath, energy, weaving", scoreTags: [{ paths: { tantra: 3, shakti: 1 } }] },
      { id: "kriya", label: "Energy work — breath, inner technique, aliveness", scoreTags: [{ paths: { kriya: 3, shakti: 1 } }] },
    ],
  },
  {
    id: "q_path_tempo",
    category: "paths",
    categoryLabel: "Path Affinity",
    cinematicLabel: "What practice tempo can your current life actually sustain?",
    kind: "choice",
    options: [
      { id: "gentle", label: "Gentle — one small ritual, forever", scoreTags: [{ paths: { dhyana: 2, bhakti: 1 } }] },
      { id: "moderate", label: "Moderate — daily practice, moderate intensity", scoreTags: [{ paths: { karma: 2, raja: 1 } }] },
      { id: "fierce", label: "Fierce — I want tapas, I want it to burn", scoreTags: [{ paths: { kriya: 2, tantra: 1 } }] },
      { id: "monastic", label: "Monastic — most of my day inside this", scoreTags: [{ paths: { jnana: 2, dhyana: 1 } }] },
    ],
  },
  {
    id: "q_path_resistance",
    category: "paths",
    categoryLabel: "Path Affinity",
    cinematicLabel: "Which practice do you most resist — and resist because it would actually help?",
    kind: "choice",
    options: [
      { id: "silence", label: "Silence — sitting still makes me anxious", scoreTags: [{ paths: { dhyana: 3, raja: 1 } }] },
      { id: "devotion", label: "Devotion — letting go feels unsafe", scoreTags: [{ paths: { bhakti: 3, shakti: 1 } }] },
      { id: "service", label: "Service — I'd rather work on myself", scoreTags: [{ paths: { karma: 3 } }] },
      { id: "inquiry", label: "Inquiry — facing truth is terrifying", scoreTags: [{ paths: { jnana: 3 } }] },
      { id: "body", label: "Body work — it feels vulnerable", scoreTags: [{ paths: { tantra: 3, kriya: 1 } }] },
    ],
  },
  {
    id: "q_path_secondary",
    category: "paths",
    categoryLabel: "Path Affinity",
    cinematicLabel: "Which second path would you like to explore alongside your first?",
    kind: "choice",
    options: [
      { id: "bhakti", label: "Bhakti — add devotion", scoreTags: [{ paths: { bhakti: 2 } }] },
      { id: "jnana", label: "Jnana — add knowing", scoreTags: [{ paths: { jnana: 2 } }] },
      { id: "karma", label: "Karma — add service", scoreTags: [{ paths: { karma: 2 } }] },
      { id: "dhyana", label: "Dhyana — add stillness", scoreTags: [{ paths: { dhyana: 2 } }] },
      { id: "tantra", label: "Tantra — add sacred body", scoreTags: [{ paths: { tantra: 2 } }] },
      { id: "kriya", label: "Kriya — add energy", scoreTags: [{ paths: { kriya: 2 } }] },
      { id: "none", label: "One path is enough for now", scoreTags: [] },
    ],
  },
  {
    id: "q_path_daily_moment",
    category: "paths",
    categoryLabel: "Path Affinity",
    cinematicLabel: "When in your day do you most long for something deeper?",
    kind: "choice",
    options: [
      { id: "morning", label: "Morning — before the world rushes in", scoreTags: [{ circadian: "morning" }] },
      { id: "midday", label: "Midday — in the middle of effort", scoreTags: [{ circadian: "midday" }] },
      { id: "evening", label: "Evening — when the day falls away", scoreTags: [{ circadian: "evening" }] },
      { id: "night", label: "Night — before sleep, in the quiet", scoreTags: [{ circadian: "night" }] },
      { id: "random", label: "Random — it comes uninvited", scoreTags: [] },
    ],
  },
  {
    id: "q_path_longing",
    category: "paths",
    categoryLabel: "Path Affinity",
    cinematicLabel: "What is the deepest thing you're secretly longing for?",
    kind: "text",
    placeholder: "Write as freely as you can — there are no wrong answers...",
    maxLength: 500,
    scoreAs: "path_longing",
  },

  // ══ 8. ARCHETYPE (5) ═════════════════════════════════════════════════════

  {
    id: "q_archetype_best_self",
    category: "archetype",
    categoryLabel: "Archetype",
    cinematicLabel: "When you daydream about your best self, they are...",
    kind: "choice",
    options: [
      { id: "free", label: "Free — always learning, always moving", scoreTags: [{ archetype: "seeker" }] },
      { id: "love", label: "In love — dissolved into something larger", scoreTags: [{ archetype: "devotee" }] },
      { id: "unshakable", label: "Unshakeable — cutting through anything", scoreTags: [{ archetype: "warrior" }] },
      { id: "wise", label: "Wise — quiet, clear, others come to them", scoreTags: [{ archetype: "sage" }] },
      { id: "between", label: "Between worlds — seeing what others can't", scoreTags: [{ archetype: "mystic" }] },
      { id: "healer", label: "A quiet presence people heal near", scoreTags: [{ archetype: "healer" }] },
      { id: "alive", label: "Fully alive — sensual, intimate, here", scoreTags: [{ archetype: "lover" }] },
      { id: "making", label: "Making something the world hasn't seen", scoreTags: [{ archetype: "creator" }] },
      { id: "holding", label: "Holding a house / kingdom / team well", scoreTags: [{ archetype: "ruler" }] },
      { id: "refusing", label: "Refusing the false — even alone", scoreTags: [{ archetype: "rebel" }] },
      { id: "alone", label: "Alone in the mountain, undistracted", scoreTags: [{ archetype: "hermit" }] },
      { id: "useful", label: "Useful — small acts, done well", scoreTags: [{ archetype: "servant" }] },
    ],
  },
  {
    id: "q_archetype_shadow",
    category: "archetype",
    categoryLabel: "Archetype",
    cinematicLabel: "Which version of yourself emerges when you're stressed, afraid, or triggered?",
    kind: "choice",
    options: [
      { id: "shadow_seeker", label: "Restless seeker — running from the present moment", scoreTags: [{ archetype: "seeker" }] },
      { id: "shadow_devotee", label: "Possessive devotee — need others to validate me", scoreTags: [{ archetype: "devotee" }] },
      { id: "shadow_warrior", label: "Aggressive warrior — lashing out", scoreTags: [{ archetype: "warrior" }] },
      { id: "shadow_sage", label: "Cold sage — detached, superior, cruel", scoreTags: [{ archetype: "sage" }] },
      { id: "shadow_mystic", label: "Escapist mystic — floating away from life", scoreTags: [{ archetype: "mystic" }] },
      { id: "shadow_healer", label: "Martyr healer — suffering so others don't have to", scoreTags: [{ archetype: "healer" }] },
      { id: "shadow_lover", label: "Possessive lover — engulfing what I love", scoreTags: [{ archetype: "lover" }] },
      { id: "shadow_creator", label: "Perfectionist creator — nothing is ever done", scoreTags: [{ archetype: "creator" }] },
    ],
  },
  {
    id: "q_archetype_fear",
    category: "archetype",
    categoryLabel: "Archetype",
    cinematicLabel: "What is your archetype most afraid of?",
    kind: "choice",
    options: [
      { id: "fear_stagnation", label: "Stagnation — being stuck, not growing", scoreTags: [{ archetype: "seeker" }] },
      { id: "fear_abandonment", label: "Abandonment — being left by the divine / beloved", scoreTags: [{ archetype: "devotee" }] },
      { id: "fear_vulnerability", label: "Vulnerability — being seen as weak", scoreTags: [{ archetype: "warrior" }] },
      { id: "fear_ignorance", label: "Ignorance — not knowing the truth", scoreTags: [{ archetype: "sage" }] },
      { id: "fear_ordinary", label: "Ordinary — being like everyone else", scoreTags: [{ archetype: "mystic" }] },
    ],
  },
  {
    id: "q_archetype_gift",
    category: "archetype",
    categoryLabel: "Archetype",
    cinematicLabel: "What is the gift your archetype brings to the world?",
    kind: "text",
    placeholder: "Describe the gift — not what you do, but what you give...",
    maxLength: 400,
    scoreAs: "archetype_gift",
  },
  {
    id: "q_archetype_aspirational",
    category: "archetype",
    categoryLabel: "Archetype",
    cinematicLabel: "Which archetype do you secretly wish you could embody more fully?",
    kind: "choice",
    options: [
      { id: "asp_seeker", label: "Seeker — freedom and growth", scoreTags: [{ archetype: "seeker" }] },
      { id: "asp_devotee", label: "Devotee — surrender and love", scoreTags: [{ archetype: "devotee" }] },
      { id: "asp_warrior", label: "Warrior — courage and discipline", scoreTags: [{ archetype: "warrior" }] },
      { id: "asp_sage", label: "Sage — wisdom and stillness", scoreTags: [{ archetype: "sage" }] },
      { id: "asp_mystic", label: "Mystic — vision and depth", scoreTags: [{ archetype: "mystic" }] },
      { id: "asp_healer", label: "Healer — compassion and presence", scoreTags: [{ archetype: "healer" }] },
    ],
  },

  // ══ 9. BRAIN DOMINANCE (4) ═══════════════════════════════════════════════

  {
    id: "q_brain_first_move",
    category: "brain",
    categoryLabel: "Brain Dominance",
    cinematicLabel: "When something difficult happens, where do you go first?",
    kind: "choice",
    options: [
      { id: "head", label: "Into my head — analyze, plan, replay", scoreTags: [{ brain: "head" }] },
      { id: "heart", label: "Into my heart — feel, reach for someone", scoreTags: [{ brain: "heart" }] },
      { id: "gut", label: "Into action — move, fix, do something", scoreTags: [{ brain: "gut" }] },
    ],
  },
  {
    id: "q_brain_under_pressure",
    category: "brain",
    categoryLabel: "Brain Dominance",
    cinematicLabel: "Under extreme pressure, what does your nervous system do?",
    kind: "choice",
    options: [
      { id: "freeze", label: "Freeze — I can't think or move", scoreTags: [{ brain: "gut" }] },
      { id: "overthink", label: "Overthink — I can't stop analyzing", scoreTags: [{ brain: "head" }] },
      { id: "overfeel", label: "Overfeel — I'm flooded with emotion", scoreTags: [{ brain: "heart" }] },
      { id: "fight", label: "Fight — I act before I think", scoreTags: [{ brain: "gut" }] },
      { id: "flee", label: "Flee — I leave, physically or mentally", scoreTags: [{ brain: "heart" }] },
      { id: "calm", label: "Calm — pressure brings clarity", scoreTags: [{ brain: "head" }] },
    ],
  },
  {
    id: "q_brain_decision",
    category: "brain",
    categoryLabel: "Brain Dominance",
    cinematicLabel: "When you make big decisions, which voice do you trust most?",
    kind: "choice",
    options: [
      { id: "logic", label: "Logic — facts, data, reasoning", scoreTags: [{ brain: "head" }] },
      { id: "feeling", label: "Feeling — what my heart says", scoreTags: [{ brain: "heart" }] },
      { id: "instinct", label: "Instinct — my gut before I think", scoreTags: [{ brain: "gut" }] },
      { id: "combination", label: "I combine all three", scoreTags: [{ brain: "head" }] },
    ],
  },
  {
    id: "q_brain_neglect",
    category: "brain",
    categoryLabel: "Brain Dominance",
    cinematicLabel: "Which part of yourself have you most neglected?",
    kind: "choice",
    options: [
      { id: "head", label: "My mind — I don't think enough", scoreTags: [{ brain: "head" }] },
      { id: "heart", label: "My heart — I don't feel enough", scoreTags: [{ brain: "heart" }] },
      { id: "gut", label: "My body — I live in my head", scoreTags: [{ brain: "gut" }] },
      { id: "none", label: "None — I'm balanced enough", scoreTags: [] },
    ],
  },

  // ══ 10. EMOTIONAL MATURITY (5) ════════════════════════════════════════════

  {
    id: "q_emo_reaction_speed",
    category: "emotion",
    categoryLabel: "Emotional Maturity",
    cinematicLabel: "How long does it take for a strong emotion to pass through you?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Hours or days",
    maxLabel: "Seconds",
    scoreAs: "emotion_reaction_speed",
  },
  {
    id: "q_emo_identification",
    category: "emotion",
    categoryLabel: "Emotional Maturity",
    cinematicLabel: "When you feel angry, sad, or jealous — how quickly do you name it?",
    kind: "choice",
    options: [
      { id: "cant_name", label: "I can't name it — I just feel awful", scoreTags: [{ emotionDelta: 1 }] },
      { id: "late", label: "Late — I figure it out after the damage", scoreTags: [{ emotionDelta: 3 }] },
      { id: "medium", label: "Medium — I name it in the moment", scoreTags: [{ emotionDelta: 5 }] },
      { id: "immediate", label: "Immediate — I feel it before I act", scoreTags: [{ emotionDelta: 7 }] },
      { id: "spacious", label: "Spacious — I feel it without becoming it", scoreTags: [{ emotionDelta: 9 }] },
    ],
  },
  {
    id: "q_emo_express",
    category: "emotion",
    categoryLabel: "Emotional Maturity",
    cinematicLabel: "How safe do you feel expressing your full range of emotions to others?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Completely unsafe",
    maxLabel: "Completely safe",
    scoreAs: "emotion_express_safety",
  },
  {
    id: "q_emo_regulation",
    category: "emotion",
    categoryLabel: "Emotional Maturity",
    cinematicLabel: "How often do your emotions control your actions instead of informing them?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Always — I'm a slave to them",
    maxLabel: "Never — I guide them",
    scoreAs: "emotion_regulation",
  },
  {
    id: "q_emo_joy",
    category: "emotion",
    categoryLabel: "Emotional Maturity",
    cinematicLabel: "How deeply can you feel joy — or grief — without running away?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "I numb both",
    maxLabel: "I feel all of it",
    scoreAs: "emotion_depth",
  },

  // ══ 11. SOMATIC & BODY (5) ════════════════════════════════════════════════

  {
    id: "q_somatic_awareness",
    category: "somatic",
    categoryLabel: "Somatic & Body",
    cinematicLabel: "How aware are you of the physical sensations in your body right now?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Blind",
    maxLabel: "Fully aware",
    scoreAs: "somatic_awareness",
  },
  {
    id: "q_somatic_tension",
    category: "somatic",
    categoryLabel: "Somatic & Body",
    cinematicLabel: "Where does your body hold the most tension when you're stressed?",
    kind: "choice",
    options: [
      { id: "jaw", label: "Jaw / face", scoreTags: [{ somaticDelta: 2 }] },
      { id: "chest", label: "Chest / heart", scoreTags: [{ somaticDelta: 2 }] },
      { id: "stomach", label: "Stomach / gut", scoreTags: [{ somaticDelta: 2 }] },
      { id: "shoulders", label: "Shoulders / neck", scoreTags: [{ somaticDelta: 2 }] },
      { id: "lower_back", label: "Lower back", scoreTags: [{ somaticDelta: 2 }] },
      { id: "everywhere", label: "Everywhere at once", scoreTags: [{ somaticDelta: 4 }] },
      { id: "nowhere", label: "Nowhere — my body stays relaxed", scoreTags: [{ somaticDelta: 0 }] },
    ],
  },
  {
    id: "q_somatic_breath",
    category: "somatic",
    categoryLabel: "Somatic & Body",
    cinematicLabel: "If you take one conscious breath right now, what happens?",
    kind: "choice",
    options: [
      { id: "nothing", label: "Nothing — I barely notice", scoreTags: [{ somaticDelta: 0 }] },
      { id: "calm", label: "A small wave of calm", scoreTags: [{ somaticDelta: 2 }] },
      { id: "release", label: "A physical release — tension lets go", scoreTags: [{ somaticDelta: 4 }] },
      { id: "spacious", label: "Spacious — the breath opens me", scoreTags: [{ somaticDelta: 6 }] },
    ],
  },
  {
    id: "q_somatic_sleep",
    category: "somatic",
    categoryLabel: "Somatic & Body",
    cinematicLabel: "How does your body feel when you first wake up?",
    kind: "choice",
    options: [
      { id: "exhausted", label: "Exhausted — I never really rested", scoreTags: [{ somaticDelta: -2 }] },
      { id: "heavy", label: "Heavy — like I'm dragging yesterday", scoreTags: [{ somaticDelta: 0 }] },
      { id: "neutral", label: "Neutral — functional, nothing special", scoreTags: [{ somaticDelta: 2 }] },
      { id: "refreshed", label: "Refreshed — body actually rested", scoreTags: [{ somaticDelta: 4 }] },
      { id: "alive", label: "Alive — I want to move before I even think", scoreTags: [{ somaticDelta: 6 }] },
    ],
  },
  {
    id: "q_somatic_food",
    category: "somatic",
    categoryLabel: "Somatic & Body",
    cinematicLabel: "How much does what you eat change how you feel — physically and emotionally?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "No connection",
    maxLabel: "Extremely sensitive",
    scoreAs: "somatic_food_awareness",
  },

  // ══ 12. LIFE DOMAINS (5) ══════════════════════════════════════════════════

  {
    id: "q_domain_career",
    category: "domains",
    categoryLabel: "Life Domains",
    cinematicLabel: "How fulfilled do you feel in your work or primary occupation?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Empty",
    maxLabel: "Deeply fulfilled",
    scoreAs: "domain_career",
  },
  {
    id: "q_domain_relationships",
    category: "domains",
    categoryLabel: "Life Domains",
    cinematicLabel: "How nourished do you feel by your closest relationships?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Starved",
    maxLabel: "Deeply nourished",
    scoreAs: "domain_relationships",
  },
  {
    id: "q_domain_health",
    category: "domains",
    categoryLabel: "Life Domains",
    cinematicLabel: "How much does your current physical health support the life you want?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Holds me back",
    maxLabel: "Fuels everything",
    scoreAs: "domain_health",
  },
  {
    id: "q_domain_finance",
    category: "domains",
    categoryLabel: "Life Domains",
    cinematicLabel: "How much does financial stress dominate your inner landscape?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "It controls everything",
    maxLabel: "It doesn't touch me",
    scoreAs: "domain_finance",
  },
  {
    id: "q_domain_creativity",
    category: "domains",
    categoryLabel: "Life Domains",
    cinematicLabel: "How much of your life makes something new in the world?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Nothing new",
    maxLabel: "Creates constantly",
    scoreAs: "domain_creativity",
  },

  // ══ 13. CIRCADIAN & ENERGY (4) ════════════════════════════════════════════

  {
    id: "q_circadian_peak",
    category: "circadian",
    categoryLabel: "Circadian & Energy",
    cinematicLabel: "At what time of day do you feel most alive?",
    kind: "choice",
    options: [
      { id: "dawn", label: "Dawn — the first light is mine", scoreTags: [{ circadian: "morning" }] },
      { id: "midday", label: "Midday — energy peaks at full sun", scoreTags: [{ circadian: "midday" }] },
      { id: "dusk", label: "Dusk — golden hour belongs to me", scoreTags: [{ circadian: "evening" }] },
      { id: "night", label: "Night — the dark opens me up", scoreTags: [{ circadian: "night" }] },
    ],
  },
  {
    id: "q_circadian_crash",
    category: "circadian",
    categoryLabel: "Circadian & Energy",
    cinematicLabel: "When does your energy most often crash?",
    kind: "choice",
    options: [
      { id: "afternoon", label: "Afternoon slump — 2-4pm", scoreTags: [{ circadian: "midday" }] },
      { id: "evening", label: "Evening — after work, I collapse", scoreTags: [{ circadian: "evening" }] },
      { id: "night", label: "Night — I can't wind down", scoreTags: [{ circadian: "night" }] },
      { id: "morning", label: "Morning — waking up is the hardest part", scoreTags: [{ circadian: "morning" }] },
      { id: "none", label: "No crash — my energy is stable", scoreTags: [{ circadian: "midday" }] },
    ],
  },
  {
    id: "q_circadian_sleep",
    category: "circadian",
    categoryLabel: "Circadian & Energy",
    cinematicLabel: "What time do you usually fall asleep — and is it yours, or exhaustion's?",
    kind: "choice",
    options: [
      { id: "early", label: "Early — before 10pm, by choice", scoreTags: [{ circadian: "morning" }] },
      { id: "moderate", label: "Moderate — 10-12am", scoreTags: [{ circadian: "evening" }] },
      { id: "late", label: "Late — after midnight", scoreTags: [{ circadian: "night" }] },
      { id: "chaotic", label: "Chaotic — no schedule", scoreTags: [{ circadian: "night" }] },
    ],
  },
  {
    id: "q_circadian_focus",
    category: "circadian",
    categoryLabel: "Circadian & Energy",
    cinematicLabel: "When do you do your deepest thinking or most creative work?",
    kind: "choice",
    options: [
      { id: "early", label: "First thing — before the noise", scoreTags: [{ circadian: "morning" }] },
      { id: "midday", label: "Midday — after the morning settles", scoreTags: [{ circadian: "midday" }] },
      { id: "evening", label: "Evening — when the world quiets", scoreTags: [{ circadian: "evening" }] },
      { id: "night", label: "Night — after everyone sleeps", scoreTags: [{ circadian: "night" }] },
    ],
  },

  // ══ 14. PRACTICE HISTORY (4) ══════════════════════════════════════════════

  {
    id: "q_practice_history",
    category: "practice",
    categoryLabel: "Practice History",
    cinematicLabel: "How familiar are you with the art of watching your own thoughts?",
    kind: "choice",
    options: [
      { id: "brand_new", label: "Brand new to this", scoreTags: [{ vLevelDelta: 0 }] },
      { id: "tried_on_off", label: "I've tried, on and off", scoreTags: [{ vLevelDelta: 1 }] },
      { id: "practice_regularly", label: "I practice regularly", scoreTags: [{ vLevelDelta: 2 }] },
      { id: "steady_part", label: "It's a steady part of my life", scoreTags: [{ vLevelDelta: 3 }] },
    ],
  },
  {
    id: "q_practice_obstacle",
    category: "practice",
    categoryLabel: "Practice History",
    cinematicLabel: "What is the biggest reason you've ever stopped a practice?",
    kind: "choice",
    options: [
      { id: "time", label: "Time — life got too busy", scoreTags: [{ loops: ["CTL001", "KAR001"] }] },
      { id: "boredom", label: "Boredom — it stopped feeling meaningful", scoreTags: [{ loops: ["AVD001", "VAL001"] }] },
      { id: "resistance", label: "Resistance — something in me refused", scoreTags: [{ loops: ["CTL003", "IDN001"] }] },
      { id: "results", label: "Results — I didn't see change fast enough", scoreTags: [{ loops: ["VAL001"] }] },
      { id: "forget", label: "I forgot — life just pulled me away", scoreTags: [{ loops: ["HAB001"] }] },
      { id: "never_stopped", label: "I never stopped — practice is non-negotiable", scoreTags: [] },
    ],
  },
  {
    id: "q_practice_longing",
    category: "practice",
    categoryLabel: "Practice History",
    cinematicLabel: "If you had 30 minutes of complete freedom, what would you do with it?",
    kind: "choice",
    options: [
      { id: "meditate", label: "Meditate or sit in silence", scoreTags: [{ paths: { dhyana: 3, raja: 1 } }] },
      { id: "read", label: "Read — spiritual or philosophical text", scoreTags: [{ paths: { jnana: 3 } }] },
      { id: "serve", label: "Serve someone who needs help", scoreTags: [{ paths: { karma: 3 } }] },
      { id: "music", label: "Listen to or create music", scoreTags: [{ paths: { bhakti: 3, shakti: 1 } }] },
      { id: "move", label: "Move — walk, stretch, dance, breathe", scoreTags: [{ paths: { kriya: 2, tantra: 2 } }] },
      { id: "rest", label: "Rest — I need it too much to spend it", scoreTags: [] },
      { id: "connect", label: "Connect with someone I love", scoreTags: [{ paths: { bhakti: 2 } }] },
    ],
  },
  {
    id: "q_practice_surrender",
    category: "practice",
    categoryLabel: "Practice History",
    cinematicLabel: "When was the last time you truly surrendered — to anything?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Never — I fight everything",
    maxLabel: "Yesterday — I know how",
    scoreAs: "practice_surrender_capacity",
  },

  // ══ 15. BELIEFS & WORLDVIEW (5) ══════════════════════════════════════════

  {
    id: "q_belief_control",
    category: "beliefs",
    categoryLabel: "Beliefs & Worldview",
    cinematicLabel: "Which of these feels most true about how life works?",
    kind: "choice",
    options: [
      { id: "life_happens", label: "Life happens to me — I'm mostly at its mercy", scoreTags: [{ belief: "external" }] },
      { id: "some_choice", label: "I have some choice in how I respond", scoreTags: [{ belief: "mixed" }] },
      { id: "awareness_shapes", label: "Awareness shapes my reality", scoreTags: [{ belief: "internal" }] },
      { id: "only_awareness", label: "There is only awareness — I am not separate from it", scoreTags: [{ belief: "nondual" }] },
    ],
  },
  {
    id: "q_belief_suffering",
    category: "beliefs",
    categoryLabel: "Beliefs & Worldview",
    cinematicLabel: "What do you believe causes most human suffering?",
    kind: "choice",
    options: [
      { id: "circumstance", label: "Circumstances — bad things happen to good people", scoreTags: [{ belief: "external" }] },
      { id: "mind", label: "Mind — our thinking creates our pain", scoreTags: [{ belief: "internal" }] },
      { id: "attachment", label: "Attachment — we suffer because we want things to be different", scoreTags: [{ belief: "internal" }] },
      { id: "ignorance", label: "Ignorance — we suffer because we don't see clearly", scoreTags: [{ belief: "nondual" }] },
      { id: "evolution", label: "Evolution — suffering is how consciousness grows", scoreTags: [{ belief: "mixed" }] },
    ],
  },
  {
    id: "q_belief_death",
    category: "beliefs",
    categoryLabel: "Beliefs & Worldview",
    cinematicLabel: "What do you believe happens when we die?",
    kind: "choice",
    options: [
      { id: "nothing", label: "Nothing — consciousness ends", scoreTags: [{ belief: "external" }] },
      { id: "dont_know", label: "I don't know — and I'm okay with that", scoreTags: [{ belief: "mixed" }] },
      { id: "continuation", label: "It continues — in some form", scoreTags: [{ belief: "internal" }] },
      { id: "return", label: "Return — to source, to the whole", scoreTags: [{ belief: "nondual" }] },
      { id: "rebirth", label: "Rebirth — we come back until we're free", scoreTags: [{ belief: "internal" }] },
    ],
  },
  {
    id: "q_belief_god",
    category: "beliefs",
    categoryLabel: "Beliefs & Worldview",
    cinematicLabel: "Where do you stand with the word 'God'?",
    kind: "choice",
    options: [
      { id: "reject", label: "I reject it — it's a human invention", scoreTags: [{ belief: "external" }] },
      { id: "uncomfortable", label: "Uncomfortable — I prefer 'universe'", scoreTags: [{ belief: "mixed" }] },
      { id: "agnostic", label: "I don't know", scoreTags: [{ belief: "mixed" }] },
      { id: "higher_power", label: "Higher power — something larger than me", scoreTags: [{ belief: "internal" }] },
      { id: "devotion", label: "Devotion — I feel it every day", scoreTags: [{ belief: "nondual" }] },
      { id: "immanent", label: "It's in everything — including me", scoreTags: [{ belief: "nondual" }] },
    ],
  },
  {
    id: "q_belief_free_will",
    category: "beliefs",
    categoryLabel: "Beliefs & Worldview",
    cinematicLabel: "Do you believe you have free will — or is everything already decided?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Everything is decided",
    maxLabel: "Complete free will",
    scoreAs: "belief_free_will",
  },

  // ══ 16. SHADOW & DEFENSES (5) ════════════════════════════════════════════

  {
    id: "q_shadow_projection",
    category: "shadow",
    categoryLabel: "Shadow & Defences",
    cinematicLabel: "What trait in others irritates you most — and might it be yours?",
    kind: "choice",
    options: [
      { id: "arrogance", label: "Arrogance — people who think they're better", scoreTags: [{ shadowProjection: 5 }] },
      { id: "neediness", label: "Neediness — people who can't be alone", scoreTags: [{ shadowProjection: 5 }] },
      { id: "indifference", label: "Indifference — people who don't care", scoreTags: [{ shadowProjection: 5 }] },
      { id: "control", label: "Control — people who manipulate", scoreTags: [{ shadowProjection: 5 }] },
      { id: "weakness", label: "Weakness — people who give up easily", scoreTags: [{ shadowProjection: 5 }] },
      { id: "dont_know", label: "I don't know — or I won't admit it", scoreTags: [{ shadowProjection: 2 }] },
    ],
  },
  {
    id: "q_shadow_denial",
    category: "shadow",
    categoryLabel: "Shadow & Defences",
    cinematicLabel: "Which of these feelings do you most try to hide from others?",
    kind: "multi",
    maxSelect: 3,
    options: [
      { id: "hide_fear", label: "Fear — I pretend I'm brave", scoreTags: [{ shadowProjection: 3 }] },
      { id: "hide_need", label: "Need — I pretend I don't need anyone", scoreTags: [{ shadowProjection: 3 }] },
      { id: "hide_anger", label: "Anger — I pretend I'm always fine", scoreTags: [{ shadowProjection: 3 }] },
      { id: "hide_jealousy", label: "Jealousy — I pretend I don't care", scoreTags: [{ shadowProjection: 3 }] },
      { id: "hide_sadness", label: "Sadness — I pretend I'm strong", scoreTags: [{ shadowProjection: 3 }] },
      { id: "hide_shame", label: "Shame — I pretend I'm not affected", scoreTags: [{ shadowProjection: 3 }] },
    ],
  },
  {
    id: "q_shadow_defense",
    category: "shadow",
    categoryLabel: "Shadow & Defences",
    cinematicLabel: "When criticised, what is your first defence?",
    kind: "choice",
    options: [
      { id: "fight", label: "Fight — counter-attack immediately", scoreTags: [{ shadowProjection: 4 }] },
      { id: "flight", label: "Flight — withdraw, avoid, shut down", scoreTags: [{ shadowProjection: 4 }] },
      { id: "fawn", label: "Fawn — apologize, please, fix it", scoreTags: [{ shadowProjection: 4 }] },
      { id: "freeze", label: "Freeze — go numb, can't respond", scoreTags: [{ shadowProjection: 4 }] },
      { id: "reflect", label: "Reflect — listen before responding", scoreTags: [{ shadowProjection: -2 }] },
    ],
  },
  {
    id: "q_shadow_secret",
    category: "shadow",
    categoryLabel: "Shadow & Defences",
    cinematicLabel: "What is the secret you're most afraid someone will discover about you?",
    kind: "text",
    placeholder: "This stays between you and the engine — be honest...",
    maxLength: 500,
    scoreAs: "shadow_secret",
  },
  {
    id: "q_shadow_owned",
    category: "shadow",
    categoryLabel: "Shadow & Defences",
    cinematicLabel: "How much of your shadow have you actually owned — not just intellectually?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "None — I deny it all",
    maxLabel: "All — it's integrated",
    scoreAs: "shadow_owned",
  },

  // ══ 17. PURPOSE & DIRECTION (5) ══════════════════════════════════════════

  {
    id: "q_purpose_meaning",
    category: "purpose",
    categoryLabel: "Purpose & Direction",
    cinematicLabel: "When you imagine your life looking back on it, what makes it feel meaningful?",
    kind: "choice",
    options: [
      { id: "love", label: "Love — how deeply I loved and was loved", scoreTags: [{ purposeClarity: 4 }] },
      { id: "impact", label: "Impact — what I created or changed", scoreTags: [{ purposeClarity: 4 }] },
      { id: "wisdom", label: "Wisdom — how clearly I saw", scoreTags: [{ purposeClarity: 4 }] },
      { id: "joy", label: "Joy — how much I truly enjoyed it", scoreTags: [{ purposeClarity: 4 }] },
      { id: "freedom", label: "Freedom — how authentically I lived", scoreTags: [{ purposeClarity: 4 }] },
      { id: "service", label: "Service — how I showed up for others", scoreTags: [{ purposeClarity: 4 }] },
      { id: "dont_know", label: "I don't know — that's part of the problem", scoreTags: [{ purposeClarity: -2 }] },
    ],
  },
  {
    id: "q_purpose_contribution",
    category: "purpose",
    categoryLabel: "Purpose & Direction",
    cinematicLabel: "If you knew you couldn't fail, what would you contribute to the world?",
    kind: "text",
    placeholder: "Let it be as grand or as small as it actually is...",
    maxLength: 500,
    scoreAs: "purpose_contribution",
  },
  {
    id: "q_purpose_legacy",
    category: "purpose",
    categoryLabel: "Purpose & Direction",
    cinematicLabel: "What do you want to be remembered for?",
    kind: "text",
    placeholder: "One sentence — the essence of your legacy...",
    maxLength: 300,
    scoreAs: "purpose_legacy",
  },
  {
    id: "q_purpose_morning",
    category: "purpose",
    categoryLabel: "Purpose & Direction",
    cinematicLabel: "When you wake up tomorrow, what is the first thing that gives your day meaning?",
    kind: "choice",
    options: [
      { id: "people", label: "People — someone needs me", scoreTags: [{ purposeClarity: 3 }] },
      { id: "work", label: "Work — there's something I'm building", scoreTags: [{ purposeClarity: 3 }] },
      { id: "practice", label: "Practice — the sacred part of my day", scoreTags: [{ purposeClarity: 4 }] },
      { id: "beauty", label: "Beauty — something beautiful to witness", scoreTags: [{ purposeClarity: 3 }] },
      { id: "nothing", label: "Nothing — days blur into each other", scoreTags: [{ purposeClarity: -2 }] },
    ],
  },
  {
    id: "q_purpose_ikigai",
    category: "purpose",
    categoryLabel: "Purpose & Direction",
    cinematicLabel: "Where do the four circles of Ikigai overlap in your life right now?",
    cinematicSubtitle: "What you love × What you're good at × What the world needs × What you can be paid for",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "No overlap",
    maxLabel: "Perfect Ikigai",
    scoreAs: "purpose_ikigai",
  },

  // ══ 18. ATTACHMENT STYLE (3) ══════════════════════════════════════════════

  {
    id: "q_attachment_closest",
    category: "attachment",
    categoryLabel: "Attachment Style",
    cinematicLabel: "When someone you love pulls away, what happens inside you?",
    kind: "choice",
    options: [
      { id: "chase", label: "I chase — I need to fix it now", scoreTags: [{ attachment: "anxious" }] },
      { id: "withdraw", label: "I withdraw — I protect myself by pulling back", scoreTags: [{ attachment: "avoidant" }] },
      { id: "panic", label: "I panic — the relationship feels like it's ending", scoreTags: [{ attachment: "anxious" }] },
      { id: "shut_down", label: "I shut down — I can't reach them anyway", scoreTags: [{ attachment: "avoidant" }] },
      { id: "stable", label: "I stay steady — I trust the connection", scoreTags: [{ attachment: "secure" }] },
      { id: "confused", label: "I don't know — I swing between chasing and withdrawing", scoreTags: [{ attachment: "disorganized" }] },
    ],
  },
  {
    id: "q_attachment_trust",
    category: "attachment",
    categoryLabel: "Attachment Style",
    cinematicLabel: "How easy is it for you to fully trust someone?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Almost impossible",
    maxLabel: "Completely natural",
    scoreAs: "attachment_trust",
  },
  {
    id: "q_attachment_independence",
    category: "attachment",
    categoryLabel: "Attachment Style",
    cinematicLabel: "How comfortable are you being completely alone — no messages, no contact, no noise?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "I panic without contact",
    maxLabel: "I thrive in solitude",
    scoreAs: "attachment_independence",
  },

  // ══ 19. COGNITIVE STYLE (3) ══════════════════════════════════════════════

  {
    id: "q_cognitive_style",
    category: "cognitive",
    categoryLabel: "Cognitive Style",
    cinematicLabel: "When you try to understand something new, how does your mind prefer to work?",
    kind: "choice",
    options: [
      { id: "analytical", label: "Analytical — I break it into parts", scoreTags: [{ cognitive: "analytical" }] },
      { id: "intuitive", label: "Intuitive — I feel the pattern before I see it", scoreTags: [{ cognitive: "intuitive" }] },
      { id: "concrete", label: "Concrete — I need real examples", scoreTags: [{ cognitive: "concrete" }] },
      { id: "abstract", label: "Abstract — I think in symbols and metaphors", scoreTags: [{ cognitive: "abstract" }] },
      { id: "dialectic", label: "Dialectic — I need both sides", scoreTags: [{ cognitive: "analytical" }] },
    ],
  },
  {
    id: "q_cognitive_truth",
    category: "cognitive",
    categoryLabel: "Cognitive Style",
    cinematicLabel: "How do you know if something is true?",
    kind: "choice",
    options: [
      { id: "evidence", label: "Evidence — proof, data, facts", scoreTags: [{ cognitive: "analytical" }] },
      { id: "experience", label: "Experience — it must be true if I feel it", scoreTags: [{ cognitive: "intuitive" }] },
      { id: "consensus", label: "Consensus — others agreeing makes it true", scoreTags: [{ cognitive: "concrete" }] },
      { id: "inner", label: "Inner knowing — truth is inside, not outside", scoreTags: [{ cognitive: "abstract" }] },
    ],
  },
  {
    id: "q_cognitive_learning",
    category: "cognitive",
    categoryLabel: "Cognitive Style",
    cinematicLabel: "How do you learn best?",
    kind: "choice",
    options: [
      { id: "reading", label: "Reading — text and theory", scoreTags: [{ cognitive: "analytical" }] },
      { id: "watching", label: "Watching — demonstration and observation", scoreTags: [{ cognitive: "concrete" }] },
      { id: "doing", label: "Doing — hands-on, trial and error", scoreTags: [{ cognitive: "concrete" }] },
      { id: "feeling", label: "Feeling — it must resonate inside", scoreTags: [{ cognitive: "intuitive" }] },
      { id: "reflecting", label: "Reflecting — sitting with it until it clicks", scoreTags: [{ cognitive: "abstract" }] },
    ],
  },

  // ══ 20. INNER CRITIC (3) ══════════════════════════════════════════════════

  {
    id: "q_critic_volume",
    category: "critic",
    categoryLabel: "Inner Critic",
    cinematicLabel: "How loud is the voice in your head that judges everything you do?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Silent — I barely hear it",
    maxLabel: "Deafening — it never stops",
    scoreAs: "critic_volume",
  },
  {
    id: "q_critic_content",
    category: "critic",
    categoryLabel: "Inner Critic",
    cinematicLabel: "What does that voice say most often?",
    kind: "choice",
    options: [
      { id: "not_enough", label: "Not enough — you're not good enough", scoreTags: [{ criticVolume: 3 }] },
      { id: "failure", label: "Failure — you're going to mess this up", scoreTags: [{ criticVolume: 3 }] },
      { id: "embarrassment", label: "Embarrassment — people are judging you", scoreTags: [{ criticVolume: 3 }] },
      { id: "unworthy", label: "Unworthy — you don't deserve this", scoreTags: [{ criticVolume: 3 }] },
      { id: "lazy", label: "Lazy — you should be doing more", scoreTags: [{ criticVolume: 3 }] },
      { id: "kind", label: "Mostly kind — it pushes me to be better", scoreTags: [{ criticVolume: -2 }] },
      { id: "silent", label: "It's mostly quiet", scoreTags: [{ criticVolume: -3 }] },
    ],
  },
  {
    id: "q_critic_origin",
    category: "critic",
    categoryLabel: "Inner Critic",
    cinematicLabel: "Whose voice is that in your head?",
    kind: "choice",
    options: [
      { id: "parent", label: "A parent or authority figure from childhood", scoreTags: [{ criticVolume: 3 }] },
      { id: "teacher", label: "A teacher or mentor", scoreTags: [{ criticVolume: 2 }] },
      { id: "peer", label: "Peers — the voice of comparison", scoreTags: [{ criticVolume: 2 }] },
      { id: "society", label: "Society — culture, media, the world", scoreTags: [{ criticVolume: 2 }] },
      { id: "self_generated", label: "Self-generated — it grew inside me", scoreTags: [{ criticVolume: 2 }] },
      { id: "dont_know", label: "I don't know whose voice it is", scoreTags: [{ criticVolume: 1 }] },
    ],
  },

  // ══ 21. PSYCHE VALUES (4) ═════════════════════════════════════════════════

  {
    id: "q_values_core",
    category: "values",
    categoryLabel: "Psyche Values",
    cinematicLabel: "What matters most to you — even when it's hard?",
    kind: "multi",
    maxSelect: 3,
    options: [
      { id: "val_honesty", label: "Honesty — above all", scoreTags: [] },
      { id: "val_freedom", label: "Freedom — autonomy and choice", scoreTags: [] },
      { id: "val_connection", label: "Connection — being in genuine relationship", scoreTags: [] },
      { id: "val_growth", label: "Growth — becoming more than I was", scoreTags: [] },
      { id: "val_peace", label: "Peace — inner stillness and calm", scoreTags: [] },
      { id: "val_impact", label: "Impact — making a real difference", scoreTags: [] },
      { id: "val_beauty", label: "Beauty — creating and appreciating it", scoreTags: [] },
      { id: "val_kindness", label: "Kindness — treating others with care", scoreTags: [] },
      { id: "val_courage", label: "Courage — doing what's right when it's hard", scoreTags: [] },
      { id: "val_truth", label: "Truth — seeing things as they are", scoreTags: [] },
    ],
  },
  {
    id: "q_values_conflict",
    category: "values",
    categoryLabel: "Psyche Values",
    cinematicLabel: "When your values conflict — e.g. honesty vs kindness — which wins?",
    kind: "choice",
    options: [
      { id: "honesty_wins", label: "Honesty always wins", scoreTags: [] },
      { id: "kindness_wins", label: "Kindness always wins", scoreTags: [] },
      { id: "context", label: "It depends on the situation", scoreTags: [] },
      { id: "pain", label: "It causes me real pain either way", scoreTags: [] },
      { id: "dont_know", label: "I don't know — this is a real problem for me", scoreTags: [] },
    ],
  },
  {
    id: "q_values_life_direction",
    category: "values",
    categoryLabel: "Psyche Values",
    cinematicLabel: "If you had to describe your life's direction in one word, what would it be?",
    kind: "text",
    placeholder: "One word — then expand if you want...",
    maxLength: 200,
    scoreAs: "values_life_direction",
  },
  {
    id: "q_values_guiding",
    category: "values",
    categoryLabel: "Psyche Values",
    cinematicLabel: "What guiding principle do you most want to live by?",
    kind: "choice",
    options: [
      { id: "principle_love", label: "Love everything into being", scoreTags: [{ paths: { bhakti: 2 } }] },
      { id: "principle_truth", label: "See and speak the truth always", scoreTags: [{ paths: { jnana: 2 } }] },
      { id: "principle_service", label: "Serve without expectation", scoreTags: [{ paths: { karma: 2 } }] },
      { id: "principle_courage", label: "Face everything with courage", scoreTags: [{ archetype: "warrior" }] },
      { id: "principle_presence", label: "Be fully present in every moment", scoreTags: [{ paths: { dhyana: 2, raja: 1 } }] },
      { id: "principle_wholeness", label: "Integrate every part of myself", scoreTags: [{ integrationDelta: 2 }] },
    ],
  },

  // ══ 22. CONSCIOUSNESS DOMAINS (4) ════════════════════════════════════════

  {
    id: "q_consciousness_loops_active",
    category: "consciousness_domains",
    categoryLabel: "Consciousness Domains",
    cinematicLabel: "How many different loops do you notice running in parallel?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "One — at most",
    maxLabel: "A symphony of patterns",
    scoreAs: "consciousness_loop_count",
  },
  {
    id: "q_consciousness_domain_scores",
    category: "consciousness_domains",
    categoryLabel: "Consciousness Domains",
    cinematicLabel: "Rate how developed you feel across these five inner domains:",
    cinematicSubtitle: "Rate each from 0 (undeveloped) to 10 (fully realised)",
    kind: "multi",
    maxSelect: 5,
    options: [
      { id: "domain_thought_dev", label: "Thought — clarity and focus", scoreTags: [{ dimension: { thought: 3 } }] },
      { id: "domain_emotion_dev", label: "Emotion — depth and regulation", scoreTags: [{ dimension: { emotion: 3 } }] },
      { id: "domain_body_dev", label: "Body — aliveness and presence", scoreTags: [{ dimension: { body: 3 } }] },
      { id: "domain_awareness_dev", label: "Awareness — the witness inside", scoreTags: [{ dimension: { awareness: 3 } }] },
      { id: "domain_will_dev", label: "Will — capacity to choose and persist", scoreTags: [{ vLevelDelta: 2 }] },
      { id: "domain_heart_dev", label: "Heart — capacity to love and be loved", scoreTags: [{ dimension: { emotion: 2 } }] },
      { id: "domain_intuition_dev", label: "Intuition — knowing without thinking", scoreTags: [{ dimension: { awareness: 2 } }] },
      { id: "domain_creativity_dev", label: "Creativity — making something from nothing", scoreTags: [] },
      { id: "domain_strength_dev", label: "Inner strength — endurance under pressure", scoreTags: [{ dimension: { body: 2 } }] },
      { id: "domain_surrender_dev", label: "Surrender — letting go of control", scoreTags: [{ paths: { bhakti: 1, dhyana: 1 } }] },
    ],
  },
  {
    id: "q_consciousness_peak_experience",
    category: "consciousness_domains",
    categoryLabel: "Consciousness Domains",
    cinematicLabel: "Describe a moment when you felt most fully alive and aware.",
    kind: "text",
    placeholder: "Where were you? Who were you with? What did it feel like?",
    maxLength: 600,
    scoreAs: "consciousness_peak_experience",
  },
  {
    id: "q_consciousness_resistance",
    category: "consciousness_domains",
    categoryLabel: "Consciousness Domains",
    cinematicLabel: "Which domain of your consciousness is hardest to access?",
    kind: "choice",
    options: [
      { id: "res_thought", label: "Thought — I can't think clearly", scoreTags: [{ dimension: { thought: -1 } }] },
      { id: "res_emotion", label: "Emotion — I can't feel what's real", scoreTags: [{ dimension: { emotion: -1 } }] },
      { id: "res_body", label: "Body — I don't know what it's telling me", scoreTags: [{ dimension: { body: -1 } }] },
      { id: "res_awareness", label: "Awareness — I can't step back and observe", scoreTags: [{ dimension: { awareness: -1 } }] },
      { id: "res_surrender", label: "Surrender — control is my default", scoreTags: [{ paths: { bhakti: -1 } }] },
      { id: "res_presence", label: "Presence — I'm never fully here", scoreTags: [{ dimension: { awareness: -1 } }] },
    ],
  },

  // ══ 23. APP RELATIONSHIP (3) ═════════════════════════════════════════════

  {
    id: "q_app_relationship",
    category: "app_relationship",
    categoryLabel: "App Relationship",
    cinematicLabel: "How would you describe your current relationship with this practice?",
    kind: "choice",
    options: [
      { id: "curious", label: "Curious — just exploring", scoreTags: [{ appRelationship: "new" }] },
      { id: "casual", label: "Casual — I come and go", scoreTags: [{ appRelationship: "casual" }] },
      { id: "committed", label: "Committed — it's part of my routine", scoreTags: [{ appRelationship: "committed" }] },
      { id: "deep", label: "Deep — this has changed something permanent", scoreTags: [{ appRelationship: "deep" }] },
    ],
  },
  {
    id: "q_app_motivation",
    category: "app_relationship",
    categoryLabel: "App Relationship",
    cinematicLabel: "What is your primary motivation for being here?",
    kind: "choice",
    options: [
      { id: "reduce_suffering", label: "Reduce suffering — I want to suffer less", scoreTags: [{ vLevelDelta: 1 }] },
      { id: "understand", label: "Understand — I want to know how the mind works", scoreTags: [{ paths: { jnana: 2 } }] },
      { id: "freedom", label: "Freedom — I want inner liberation", scoreTags: [{ paths: { dhyana: 2, raja: 1 } }] },
      { id: "connection", label: "Connection — I want to relate better", scoreTags: [{ paths: { bhakti: 1, karma: 1 } }] },
      { id: "energy", label: "Energy — I want to feel more alive", scoreTags: [{ paths: { kriya: 2, tantra: 1 } }] },
      { id: "service", label: "Service — I want to be more useful", scoreTags: [{ paths: { karma: 3 } }] },
    ],
  },
  {
    id: "q_app_expectation",
    category: "app_relationship",
    categoryLabel: "App Relationship",
    cinematicLabel: "What are you secretly hoping this journey will give you?",
    kind: "text",
    placeholder: "The real answer — not the polite one...",
    maxLength: 500,
    scoreAs: "app_expectation",
  },

  // ══ 24. CHITTA-VRITTI (3) ════════════════════════════════════════════════

  {
    id: "q_chitta_stillness",
    category: "chitta_vritti",
    categoryLabel: "Chitta-Vritti",
    cinematicLabel: "How often is your mind truly still — no thought, no image, just awareness?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Never",
    maxLabel: "Constantly",
    scoreAs: "chitta_vritti_stillness",
  },
  {
    id: "q_chitta_patterns",
    category: "chitta_vritti",
    categoryLabel: "Chitta-Vritti",
    cinematicLabel: "What is the most persistent mental pattern you can't seem to quiet?",
    kind: "choice",
    options: [
      { id: "worry_pattern", label: "Worry — imagining worst-case futures", scoreTags: [{ chittaVritti: 4 }] },
      { id: "replay_pattern", label: "Replay — reliving the past", scoreTags: [{ chittaVritti: 4 }] },
      { id: "planning_pattern", label: "Planning — always thinking ahead", scoreTags: [{ chittaVritti: 3 }] },
      { id: "comparing_pattern", label: "Comparing — measuring against others", scoreTags: [{ chittaVritti: 4 }] },
      { id: "fantasy_pattern", label: "Fantasy — escaping into imagination", scoreTags: [{ chittaVritti: 3 }] },
      { id: "self_criticism_pattern", label: "Self-criticism — the inner judge", scoreTags: [{ chittaVritti: 4 }] },
      { id: "none_pattern", label: "None — my mind is mostly quiet", scoreTags: [{ chittaVritti: 0 }] },
    ],
  },
  {
    id: "q_chitta_suppression",
    category: "chitta_vritti",
    categoryLabel: "Chitta-Vritti",
    cinematicLabel: "When a thought arises, how quickly does it pass — or does it stick?",
    kind: "choice",
    options: [
      { id: "sticks_hours", label: "Sticks for hours or days", scoreTags: [{ chittaVritti: 7 }] },
      { id: "sticks_minutes", label: "Sticks for minutes", scoreTags: [{ chittaVritti: 4 }] },
      { id: "sticks_seconds", label: "Sticks for seconds", scoreTags: [{ chittaVritti: 2 }] },
      { id: "passes_immediately", label: "Passes immediately — I don't grab it", scoreTags: [{ chittaVritti: 0 }] },
    ],
  },

  // ══ 25. H-CAPACITIES (5) ══════════════════════════════════════════════════

  {
    id: "q_h_focus",
    category: "h_capacities",
    categoryLabel: "H-Capacities",
    cinematicLabel: "How long can you hold your attention on one thing without distraction?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Seconds",
    maxLabel: "Hours",
    scoreAs: "h_capacity_focus",
  },
  {
    id: "q_h_endurance",
    category: "h_capacities",
    categoryLabel: "H-Capacities",
    cinematicLabel: "How long can you persist at something difficult without giving up?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "I give up fast",
    maxLabel: "I never give up",
    scoreAs: "h_capacity_endurance",
  },
  {
    id: "q_h_surrender",
    category: "h_capacities",
    categoryLabel: "H-Capacities",
    cinematicLabel: "How easily can you let go of something you desperately want?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Impossible — I grasp everything",
    maxLabel: "Effortless — I release before I hold",
    scoreAs: "h_capacity_surrender",
  },
  {
    id: "q_h_presence",
    category: "h_capacities",
    categoryLabel: "H-Capacities",
    cinematicLabel: "How available is your full presence — not distracted, not thinking, just here?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Rarely available",
    maxLabel: "Constantly available",
    scoreAs: "h_capacity_presence",
  },
  {
    id: "q_h_compassion",
    category: "h_capacities",
    categoryLabel: "H-Capacities",
    cinematicLabel: "How quickly does your heart open to someone who has hurt you?",
    kind: "scale",
    min: 0,
    max: 10,
    minLabel: "Never — I hold grudges",
    maxLabel: "Instantly — forgiveness is natural",
    scoreAs: "h_capacity_compassion",
  },
];

// ─── Total count ─────────────────────────────────────────────────────────────

export const JOURNEY_QUESTION_COUNT = JOURNEY_QUESTIONS.length;
export const JOURNEY_ESTIMATED_MINUTES = Math.round(JOURNEY_QUESTION_COUNT * 0.5); // ~30s per question

console.log(`[journey] Loaded ${JOURNEY_QUESTION_COUNT} cinematic questions across ${new Set(JOURNEY_QUESTIONS.map(q => q.category)).size} categories`);
