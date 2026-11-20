/**
 * ALL CLAIMS — the canonical knowledge base.
 * ─────────────────────────────────────────
 * Every statement here is used by the landing page, the session composer, and
 * the guide. If a claim has no evidence, it does not ship.
 */

import type { Claim } from "./types";

export const ALL_CLAIMS: Claim[] = [
  // ── Hero ────────────────────────────────────────────────────────────────
  {
    id: "k.hero.practice_not_philosophy",
    statement:
      "This is a practice system, not a philosophy you must believe. The test is what you notice when you sit.",
    short: "A practice system, not a belief system.",
    section: "hero",
    evidence: [{ type: "product", ref: "session-contract", note: "Every sitting ends in observation or carry." }],
    confidence: 0.95,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.hero.daily_sitting",
    statement:
      "One deliberate sitting a day is the unit of change. Depth compounds through return, not intensity.",
    short: "One sitting a day is the unit.",
    section: "hero",
    evidence: [
      { type: "psychology", ref: "habit formation literature", note: "Consistency outperforms intensity for habit retention." },
      { type: "product", ref: "retentionEngine" },
    ],
    confidence: 0.8,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Three brains ────────────────────────────────────────────────────────
  {
    id: "k.three_brains.gut",
    statement:
      "Gut signals carry information about safety and aversion. Tracking them improves interoceptive accuracy over time.",
    short: "The gut reports safety and aversion.",
    section: "three_brains",
    conceptId: "body",
    practiceId: "body",
    capabilityIds: ["cap_aw_body"],
    evidence: [
      { type: "psychology", ref: "interoception research (Craig, 2009)" },
      { type: "product", ref: "energyMarkers" },
    ],
    confidence: 0.7,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.three_brains.heart",
    statement:
      "Emotional patterns can be tracked as the relationship between breath, feeling, and attention — not as a single mood score.",
    short: "Emotion is a pattern, not a score.",
    section: "three_brains",
    conceptId: "emotion_observation",
    practiceId: "bhakti",
    capabilityIds: ["cap_em_regulation"],
    evidence: [
      { type: "psychology", ref: "emotion regulation literature" },
      { type: "product", ref: "dimensionTracker" },
    ],
    confidence: 0.7,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.three_brains.head",
    statement:
      "Cognitive loops can be observed and labelled rather than obeyed. Labelling is a trainable skill, not a personality trait.",
    short: "Thoughts can be labelled, not obeyed.",
    section: "three_brains",
    conceptId: "observation",
    practiceId: "observe",
    capabilityIds: ["cap_in_observation"],
    evidence: [
      { type: "tradition", ref: "Yoga Sutras 1.2", note: "Citta-vrtti-nirodhah: stilling the modifications of mind." },
      { type: "psychology", ref: "metacognitive awareness literature" },
    ],
    confidence: 0.75,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Consciousness model ─────────────────────────────────────────────────
  {
    id: "k.model.bands_not_score",
    statement:
      "Consciousness is modelled in bands with micro-levels, not as one flattering number. Progress can stall without the model pretending otherwise.",
    short: "Bands, not a single score.",
    section: "consciousness_model",
    evidence: [
      { type: "product", ref: "vLevelCore" },
      { type: "product", ref: "bandGuidebook" },
    ],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.model.six_dimensions",
    statement:
      "A person is tracked across body, emotion, thought, and awareness — plus relational and life-domain context — because one dimension cannot represent a life.",
    short: "A person is more than one dimension.",
    section: "consciousness_model",
    evidence: [{ type: "product", ref: "dimensionTracker" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.model.spiral_not_ladder",
    statement:
      "Progress is a spiral: the same lessons return at deeper levels. A return is not a regression.",
    short: "A spiral, never a ladder.",
    section: "consciousness_model",
    evidence: [
      { type: "tradition", ref: "lifetime spiral framing" },
      { type: "product", ref: "lifetimeSpiral" },
    ],
    confidence: 0.8,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Spiritual DNA ───────────────────────────────────────────────────────
  {
    id: "k.dna.profile_confidence",
    statement:
      "A profile is computed from assessment and behaviour, and every trait carries a confidence value rather than pretending to be certain.",
    short: "Every trait carries confidence.",
    section: "spiritual_dna",
    evidence: [{ type: "product", ref: "spiritual DNA profile" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.dna.life_stage_separate",
    statement:
      "Life stage is tracked separately from consciousness state. A difficult season is not a low spiritual score.",
    short: "Life stage is not consciousness level.",
    section: "spiritual_dna",
    evidence: [{ type: "product", ref: "lifeStageDetector" }],
    confidence: 0.85,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Engine ──────────────────────────────────────────────────────────────
  {
    id: "k.engine.adapts_to_state",
    statement:
      "Sessions adapt to state — time, energy, sleep, pain, and active loops — rather than following a fixed calendar.",
    short: "Sessions adapt to state.",
    section: "engine",
    evidence: [{ type: "product", ref: "prescription engine" }],
    confidence: 0.95,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.engine.evidence_not_time",
    statement:
      "A level changes only when evidence is present: distinct sittings, felt shift, and a transfer into daily life.",
    short: "Levels need evidence, not time served.",
    section: "engine",
    evidence: [{ type: "product", ref: "capabilityMap exit markers" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.engine.safety_first",
    statement:
      "Safety state changes what is offered today. Low sleep, acute pain, panic, or dissociation route to rest and grounding, not deep practice.",
    short: "Safety decides the dose.",
    section: "engine",
    evidence: [{ type: "product", ref: "suitability gate" }],
    confidence: 0.95,
    reviewStatus: "verified",
    language: "en",
  },

  // ── Session system ──────────────────────────────────────────────────────
  {
    id: "k.session.one_step",
    statement:
      "A sitting shows one step at a time. The plan may hold three to five steps; the screen holds one.",
    short: "One step on screen.",
    section: "session_system",
    evidence: [{ type: "product", ref: "UniversalSessionShell" }],
    confidence: 0.95,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.session.one_keystone",
    statement:
      "Every sitting has exactly one keystone practice. Supporting beats exist to serve it, not to compete with it.",
    short: "One keystone practice.",
    section: "session_system",
    evidence: [{ type: "product", ref: "session-contract" }],
    confidence: 0.95,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.session.stop_condition",
    statement:
      "Instructions are short, concrete, and end with a stop condition. A step that cannot say when to stop is not finished.",
    short: "Every step knows when to stop.",
    section: "session_system",
    evidence: [{ type: "product", ref: "session-contract" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.session.knows_arc",
    statement:
      "A sitting knows its arc, its place in the spiral, and what the next sitting will be. Context is part of the practice.",
    short: "You always know where you are.",
    section: "session_system",
    evidence: [{ type: "product", ref: "prescription arc context" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },

  // ── Practices ───────────────────────────────────────────────────────────
  {
    id: "k.practice.observation",
    statement:
      "Observation is noticing what is actually happening — sensation, breath, thought — without changing or judging it.",
    short: "Noticing without changing.",
    section: "practices",
    conceptId: "observation",
    practiceId: "observe",
    capabilityIds: ["cap_in_observation"],
    evidence: [
      { type: "tradition", ref: "Krishnamurti, choiceless awareness" },
      { type: "product", ref: "observationSessions (100 seeds)" },
    ],
    confidence: 0.85,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.practice.self_inquiry",
    statement:
      "Self-inquiry turns attention from the answer to the one who asks. 'Who am I?' is a direction of looking, not a quiz.",
    short: "Turn toward the one who asks.",
    section: "practices",
    conceptId: "self_inquiry",
    practiceId: "inquiry",
    capabilityIds: ["cap_in_self_inquiry"],
    evidence: [{ type: "tradition", ref: "Ramana Maharshi, Who Am I?" }],
    confidence: 0.8,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.practice.neti_neti",
    statement:
      "Neti-neti is discrimination, not denial: body, emotion, and thought are set aside as known objects, not rejected as enemies.",
    short: "Subtraction, not denial.",
    section: "practices",
    conceptId: "neti_neti",
    practiceId: "jnana",
    capabilityIds: ["cap_in_discrimination"],
    evidence: [{ type: "tradition", ref: "Upanishadic neti-neti" }],
    confidence: 0.8,
    caution: "Not a dissociation practice; stay embodied.",
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Home ────────────────────────────────────────────────────────────────
  {
    id: "k.home.one_honest_pick",
    statement:
      "Home offers one honest pick, not a buffet. Choice is moved from the moment of sitting to the design of the system.",
    short: "One honest pick.",
    section: "home",
    evidence: [{ type: "product", ref: "sutra whatNext" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.home.context_not_calendar",
    statement:
      "The pick uses time, energy, active loops, and domain stress — not a fixed day number.",
    short: "Context over calendar.",
    section: "home",
    evidence: [{ type: "product", ref: "sutra 5-axis" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },

  // ── Games ───────────────────────────────────────────────────────────────
  {
    id: "k.games.drills",
    statement:
      "Games are drills for a named capability. A game without a capability and a metric is entertainment, not training.",
    short: "Games are drills.",
    section: "games",
    evidence: [{ type: "product", ref: "game drill registry" }],
    confidence: 0.85,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.games.metrics",
    statement:
      "Drills produce observable metrics such as accuracy, reaction time, consistency, and return count.",
    short: "Drills produce metrics.",
    section: "games",
    evidence: [{ type: "product", ref: "MetricKey" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },

  // ── Themes & loops ──────────────────────────────────────────────────────
  {
    id: "k.loops.pattern_not_identity",
    statement:
      "A loop is a repeated pattern, not an identity. Naming it separates the pattern from the person.",
    short: "A loop is not who you are.",
    section: "themes_loops",
    evidence: [
      { type: "product", ref: "loops library" },
      { type: "psychology", ref: "cognitive behavioural framing" },
    ],
    confidence: 0.85,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.loops.theme_lens",
    statement:
      "A daily theme gives the day one lens. It focuses attention without promising that one day solves a life.",
    short: "One theme, one lens.",
    section: "themes_loops",
    evidence: [{ type: "product", ref: "generate-theme" }],
    confidence: 0.85,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.loops.dissolution_measured",
    statement:
      "Loop dissolution is measured by return rate and behaviour change, not by the intensity of an insight.",
    short: "Behaviour, not insight count.",
    section: "themes_loops",
    evidence: [{ type: "product", ref: "loopCalibration + outcomes" }],
    confidence: 0.8,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Libraries ───────────────────────────────────────────────────────────
  {
    id: "k.libraries.tagged",
    statement:
      "Content is tagged by concept, level, form, and duration so it can be composed rather than browsed.",
    short: "Content is composable.",
    section: "libraries",
    evidence: [{ type: "product", ref: "content libraries" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.libraries.lineage",
    statement:
      "Teachings carry lineage and source. A practice without a source is folklore, not tradition.",
    short: "Teachings carry lineage.",
    section: "libraries",
    evidence: [{ type: "product", ref: "lineageTree + masterPersonas" }],
    confidence: 0.85,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Cinematic ───────────────────────────────────────────────────────────
  {
    id: "k.cinematic.atmosphere",
    statement:
      "Atmosphere supports attention. It is not the practice, and it cannot substitute for one honest minute.",
    short: "Atmosphere is not practice.",
    section: "cinematic",
    evidence: [{ type: "product", ref: "ambient layer" }],
    confidence: 0.8,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Frameworks ──────────────────────────────────────────────────────────
  {
    id: "k.framework.koshas",
    statement:
      "The five sheaths — physical, energy, mental, wisdom, bliss — are used as lenses for tracking, not as a ladder of worth.",
    short: "Five sheaths as lenses.",
    section: "frameworks",
    evidence: [{ type: "tradition", ref: "Taittiriya Upanishad, Pancha Kosha" }],
    confidence: 0.7,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.framework.four_paths",
    statement:
      "Karma, Bhakti, Jnana, and Raja are four genuine routes. The engine looks for resonance rather than ranking them.",
    short: "Four paths, four routes.",
    section: "frameworks",
    evidence: [
      { type: "tradition", ref: "Vivekananda, Four Yogas" },
      { type: "product", ref: "experiencePaths (4 × 6 levels)" },
    ],
    confidence: 0.8,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.framework.chakras",
    statement:
      "The chakra system is used as an awareness lens for body and energy, not as a medical assessment of health.",
    short: "Chakras as a lens, not a verdict.",
    section: "frameworks",
    evidence: [{ type: "tradition", ref: "Tantric yogic tradition" }],
    confidence: 0.65,
    caution: "Not a medical or diagnostic framework.",
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.framework.self_inquiry",
    statement:
      "Atma Vichara is the direct route of asking 'Who am I?' until the question dissolves the questioner's assumptions.",
    short: "The direct route of asking.",
    section: "frameworks",
    evidence: [{ type: "tradition", ref: "Ramana Maharshi" }],
    confidence: 0.75,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.framework.choiceless",
    statement:
      "Choiceless observation is watching without choosing what to watch — including the watcher.",
    short: "Watching without a watcher.",
    section: "frameworks",
    evidence: [{ type: "tradition", ref: "Krishnamurti" }],
    confidence: 0.7,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.framework.witness",
    statement:
      "Witness consciousness is resting as the awareness that notices experience without becoming it.",
    short: "Rest as the one who notices.",
    section: "frameworks",
    evidence: [{ type: "tradition", ref: "Nisargadatta Maharaj, I Am That" }],
    confidence: 0.75,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Why hope ────────────────────────────────────────────────────────────
  {
    id: "k.hope.returning",
    statement:
      "Hope here is not optimism. It is the trained ability to return after falling off.",
    short: "Hope is returning.",
    section: "why_hope",
    evidence: [{ type: "product", ref: "retentionEngine" }],
    confidence: 0.85,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.hope.no_shame",
    statement:
      "Falling off is expected. Shame is a loop, not a motivator; the return is the skill being trained.",
    short: "No shame in the return.",
    section: "why_hope",
    evidence: [{ type: "psychology", ref: "self-compassion literature" }],
    confidence: 0.75,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Security ────────────────────────────────────────────────────────────
  {
    id: "k.security.consent",
    statement:
      "Sensitive signals are opt-in, and the user can see what is tracked and turn it off.",
    short: "Sensitive data is opt-in.",
    section: "security",
    evidence: [{ type: "product", ref: "signal consent center" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },
  {
    id: "k.security.export",
    statement:
      "Your model and history are yours to inspect and export; the system does not hold them hostage.",
    short: "Your data is inspectable.",
    section: "security",
    evidence: [{ type: "product", ref: "human model export" }],
    confidence: 0.85,
    reviewStatus: "reviewed",
    language: "en",
  },

  // ── Pricing ─────────────────────────────────────────────────────────────
  {
    id: "k.pricing.access_not_progress",
    statement:
      "Pricing buys access to the system, not progress. Progress is earned through sittings and evidence.",
    short: "Access, not progress.",
    section: "pricing",
    evidence: [{ type: "product", ref: "credit gate" }],
    confidence: 0.9,
    reviewStatus: "verified",
    language: "en",
  },

  // ── Vision / mission ────────────────────────────────────────────────────
  {
    id: "k.vision.long_arc",
    statement:
      "The long arc is a spiral of returning: the same lessons met with more honesty each time.",
    short: "A long spiral of returning.",
    section: "vision",
    evidence: [{ type: "product", ref: "lifetimeSpiral" }],
    confidence: 0.8,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.mission.clear_seeing",
    statement:
      "The aim is not performance or a perfect score. The aim is seeing clearly and acting from what is seen.",
    short: "Seeing clearly, acting from it.",
    section: "mission",
    evidence: [{ type: "tradition", ref: "jnana and karma yoga framing" }],
    confidence: 0.8,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.mission.not_another_tracker",
    statement:
      "This is not another habit tracker. There are no leaderboards and no one to beat; the only comparison is with your own evidence.",
    short: "No leaderboards, no one to beat.",
    section: "mission",
    evidence: [{ type: "product", ref: "retentionEngine + no social scoring" }],
    confidence: 0.85,
    reviewStatus: "reviewed",
    language: "en",
  },
  {
    id: "k.mission.eleven_sittings",
    statement:
      "The first change is framed as eleven sittings, not one breakthrough. Early sessions orient, taste, and train before depth.",
    short: "Eleven sittings to first change.",
    section: "mission",
    evidence: [{ type: "product", ref: "first eleven program" }],
    confidence: 0.8,
    reviewStatus: "reviewed",
    language: "en",
  },
];
