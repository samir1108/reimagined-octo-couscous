/**
 * App Guide â€” the spoken map of SATYUG.
 *
 * One entry per concept a new user actually asks about: sessions, loops,
 * V-Level, H-Level, life domains, yoga, the orb, and the four spaces.
 *
 * Copy rules (they matter for voice):
 *   â€¢ `spoken` lines are short, plain, uninterrupted prose â€” they are fed to
 *     Deepgram TTS one beat at a time. No markdown, no emoji, no parentheses.
 *   â€¢ `detail` is the on-screen long form and may use markdown.
 *   â€¢ `aliases` carry the Hinglish and English phrasings users type or say.
 */

export interface GuideTopic {
  id: string;
  title: string;
  eyebrow: string;
  /** One line shown under the title. */
  summary: string;
  /** Words and phrases the matcher listens for. */
  aliases: string[];
  /** Spoken beats, in order. Each is one TTS request. */
  spoken: string[];
  /** On-screen long form (markdown allowed). */
  detail: string;
  /** Topic ids offered as "what next". */
  followUps: string[];
  /** Optional deep link into the product. */
  action?: { label: string; to: string };
  accentHue: number;
}

export const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: "sessions",
    title: "Sessions",
    eyebrow: "The daily unit",
    summary: "A session is one guided sit, assembled for the exact state you are in.",
    aliases: [
      "session",
      "sessions",
      "daily session",
      "what is a session",
      "session kya hai",
      "session kaise kaam karta hai",
      "sitting",
      "guided session",
    ],
    spoken: [
      "A session is one guided sit. One body, one breath, one thread of attention.",
      "The app builds it live. It picks atoms, the smallest prompts and silences, and sequences them into an arc with a beginning, a middle, and a landing.",
      "The same screen serves one minute or twelve hours. Only the script changes length.",
      "When a session ends, it records what happened, and the next session starts from that, not from a template.",
    ],
    detail:
      "Every session is assembled from **atoms** â€” prompts, instruction, silence, teaching â€” sequenced into an **archetype** (morning awakening, deep inquiry, shadow integration). The **Composer** picks the sequence from your V-Level, active loops, recent history and current energy.\n\nWhat you see is one uninterrupted flow. What runs underneath is adaptive: the session shell can lengthen a silence, soften a prompt, or end early if your state drops.",
    followUps: ["orb", "practice", "v-level"],
    action: { label: "Open Practice", to: "/app/practice" },
    accentHue: 42,
  },
  {
    id: "loops",
    title: "Loops",
    eyebrow: "The pattern engine",
    summary: "A loop is a repeating pattern of thought, feeling and action that runs without permission.",
    aliases: [
      "loop",
      "loops",
      "pattern",
      "patterns",
      "repeating pattern",
      "loop kya hai",
      "loops kya hai",
      "habit loop",
      "cycle",
      "why do i repeat",
    ],
    spoken: [
      "A loop is a pattern of thought, feeling and action that repeats without your permission.",
      "It runs fast. Roughly ninety milliseconds, before deliberate thought arrives.",
      "In the old language, this is samskara. A groove cut by repetition. You are not paying for the past. You are walking in the trench it dug.",
      "The app tracks your loops and shows them back to you. You cannot fix a loop you cannot see.",
    ],
    detail:
      "Loops are the app's core literacy. Each loop has a trigger, a feeling, a routine and a payoff. The **Loop Detector** reads sessions, journal entries and check-ins for the same shape returning.\n\nA loop is not a character flaw. It is a groove. Seeing it once, without judgment, already loosens it.",
    followUps: ["life-domains", "samskara", "mirror"],
    action: { label: "Open the Loops atlas", to: "/loops" },
    accentHue: 12,
  },
  {
    id: "v-level",
    title: "V-Level",
    eyebrow: "Vertical development",
    summary: "A single number from 0 to 10 describing how consciousness is currently structured.",
    aliases: [
      "v level",
      "v-level",
      "vlevel",
      "level",
      "my level",
      "consciousness score",
      "band",
      "bands",
      "v level kya hai",
      "level kya hai",
      "how is my level calculated",
    ],
    spoken: [
      "V-Level is the vertical axis. A number from zero to ten, describing how consciousness is currently structured.",
      "It is not a score of how good you are. It predicts what you will notice and how you will respond.",
      "The integer is your band. The fraction is your micro phase: entering, deepening, or mastery.",
      "It is built from four primary dimensions, thought, emotion, body and spirit, using a geometric mean. So one strong dimension cannot carry the others.",
    ],
    detail:
      "**Range:** 0.0 â€“ 10.0. The integer part is the **Band** (11 bands, 0â€“10). The fraction places you in a micro phase: entering, deepening, mastery.\n\n**Primary dimensions:** Thought, Emotion, Body, Spirit. They combine through a geometric mean â€” imbalance is punished harder than weakness.\n\n**Integration dimensions:** Action and Connection act as a multiplier of roughly 0.9 to 1.1. Insight that never reaches behaviour or relationship is discounted.\n\n**Calibration:** your first 30 days are capped at Band 1. This prevents self-report inflation and gives the system real behavioural signal first.",
    followUps: ["h-level", "sessions", "rhythm"],
    accentHue: 265,
  },
  {
    id: "h-level",
    title: "H-Level",
    eyebrow: "Horizontal capacities",
    summary: "Twelve capacities that grow sideways across the bands, independent of your V-Level.",
    aliases: [
      "h level",
      "h-level",
      "hlevel",
      "capacities",
      "capacity",
      "horizontal",
      "h level kya hai",
      "h levels",
      "twelve capacities",
    ],
    spoken: [
      "H-Level is the horizontal axis. Twelve capacities that develop across the bands.",
      "Presence. Observation. Attention. Emotional mastery. Self inquiry depth. Release.",
      "Connection. Purpose alignment. Embodiment. Resilience. Compassion. Wisdom.",
      "You can be advanced in one and a beginner in another. That is normal. The H-Level view shows where growth is uneven instead of pretending it is a straight line.",
    ],
    detail:
      "The twelve H-Level capacities:\n\n1. Presence\n2. Observation\n3. Attention\n4. Emotional Mastery\n5. Self-Inquiry Depth\n6. Release Capacity\n7. Connection\n8. Purpose Alignment\n9. Embodiment\n10. Resilience\n11. Compassion\n12. Wisdom\n\nV-Level says *how far*. H-Level says *how wide*. Programs and practices are tagged against both, so you are not pushed into a capacity you have not built.",
    followUps: ["v-level", "practice", "life-domains"],
    accentHue: 190,
  },
  {
    id: "life-domains",
    title: "Life domains",
    eyebrow: "Where loops live",
    summary: "Twelve areas of life where patterns cluster: money, body, work, family, meaning and more.",
    aliases: [
      "life domain",
      "life domains",
      "domains",
      "domain",
      "life domain kya hai",
      "life area",
      "areas of life",
      "money loop",
      "relationship loop",
    ],
    spoken: [
      "Life domains are the twelve areas where loops cluster. Relationships, money, body, work, identity, family, sexuality, time, health, solitude, performance, meaning.",
      "Most people carry heavy loops in two or three domains. The rest are relatively clear.",
      "Knowing your hot domains tells you where to look first. The mirror then finds what connects them.",
      "Sessions are weighted toward your domains, so practice lands where life actually hurts.",
    ],
    detail:
      "The app tracks twelve loop domains: **Relationships, Money, Body, Work, Identity, Family, Sexuality, Time, Health, Solitude, Performance, Meaning.**\n\nLoops are rarely isolated. A money loop and a body loop often share one root, usually scarcity or unworthiness. The Mirror Engine looks for that shared root.\n\nSession weighting also uses six practical domains â€” relationships, work and career, finance, health, creativity, spirituality â€” so the practice you get matches the life you are living.",
    followUps: ["loops", "mirror", "sessions"],
    accentHue: 330,
  },
  {
    id: "yoga",
    title: "Yoga",
    eyebrow: "The classical map",
    summary: "Union, not flexibility. Eight limbs, four paths, and postures as one small corner.",
    aliases: [
      "yoga",
      "yoga kya hai",
      "asana",
      "eight limbs",
      "8 limbs",
      "patanjali",
      "yoga sutras",
      "karma yoga",
      "bhakti yoga",
      "jnana yoga",
      "raja yoga",
      "four yogas",
    ],
    spoken: [
      "Yoga means union. Not flexibility. The cessation of the fluctuations of the mind.",
      "Patanjali maps eight limbs. Ethics, observances, posture, breath, withdrawal of the senses, concentration, meditation, absorption.",
      "Postures are one half of one limb. The other seven are the work.",
      "The four paths are action, devotion, knowledge and the royal path. Most people are a mix, and the app watches that mix.",
    ],
    detail:
      "**Eight limbs:** Yama (ethics), Niyama (observances), Asana (posture), Pranayama (breath), Pratyahara (sense withdrawal), Dharana (concentration), Dhyana (meditation), Samadhi (absorption).\n\n**Four paths:** Karma Yoga (action without attachment), Bhakti Yoga (devotion), Jnana Yoga (knowledge), Raja Yoga (the eight-limb path).\n\nThe app sequences the limbs honestly. Advanced techniques stay locked until ethics, body and attention have something to stand on. That is not gatekeeping â€” it is safety.",
    followUps: ["practice", "v-level", "witness"],
    accentHue: 28,
  },
  {
    id: "orb",
    title: "The Orb",
    eyebrow: "The shared surface",
    summary: "One orb, everywhere. Tap to begin, hold to open, and let the breath set the pace.",
    aliases: [
      "orb",
      "the orb",
      "orb kya hai",
      "consciousness orb",
      "tap the orb",
      "orb kaise use kare",
      "breathing orb",
    ],
    spoken: [
      "The orb is the one surface that never changes shape. Home, sessions, practice, temple, all of it breathes through the same orb.",
      "Tap once to begin. Press and hold for the deeper door.",
      "Its colour tracks your band and the current line of practice, so it reads as a state, not a decoration.",
      "Follow its breath if you lose the thread. That is what it is for.",
    ],
    detail:
      "Gestures:\n\n- **Tap** â€” begin, or activate the current step.\n- **Hold** â€” open the deeper action (threshold, longer sit).\n- **Double tap** â€” repeat or re-center.\n- **Triple tap** â€” the secondary action on that screen.\n\nOn this guide screen the orb also listens. Tap to hear the tour, hold to ask a question, triple tap to stop the voice.",
    followUps: ["sessions", "practice", "temple"],
    accentHue: 44,
  },
  {
    id: "practice",
    title: "Practice",
    eyebrow: "The gym",
    summary: "The structured room. Twelve skills, levels inside each, and work that compounds.",
    aliases: [
      "practice",
      "practices",
      "practice kya hai",
      "skills",
      "12 skills",
      "twelve skills",
      "practice tab",
      "daily practice",
    ],
    spoken: [
      "Practice is the gym. Structured sessions, twelve skills, levels inside each skill.",
      "Observe, inquiry, breath, witness, body, devotion, action, knowledge, the royal path, kriya, tantra and neuro.",
      "You do not pick randomly. The engine recommends the next honest step from your current band and capacities.",
      "Transformation compounds here, not in inspiration.",
    ],
    detail:
      "The twelve skills each carry their own ladder: Observe up to level seven, Inquiry to six, the rest to five. Each level has a readiness sign â€” a behavioural proof, not a feeling.\n\nPractice sessions are where the model meets the body: structured, timed, and scored on quality rather than duration.",
    followUps: ["sessions", "yoga", "h-level"],
    action: { label: "Open Practice", to: "/app/practice" },
    accentHue: 150,
  },
  {
    id: "guide-space",
    title: "Guide",
    eyebrow: "The wise sibling",
    summary: "A companion that knows your patterns. Not a chatbot, and not a guru replacement.",
    aliases: [
      "guide",
      "guide tab",
      "the guide",
      "companion",
      "companion engine",
      "guide kya hai",
      "ai chat",
      "chat with guide",
    ],
    spoken: [
      "The Guide is the wise sibling. An always available companion that knows your patterns.",
      "It is not a chatbot and not a replacement for a teacher. Short, direct, never preachy.",
      "It has memory of your loops, your band and your recent sessions, so it does not start from zero each time.",
      "When it does not know, it should say so. That is part of the design.",
    ],
    detail:
      "The Guide runs on several engines: consciousness context, live loop detection, lineage voice, and a composer that can hand you a practice instead of a paragraph.\n\nIt is deliberately terse. Insight is cheap; the app's job is to move you into practice.",
    followUps: ["mirror", "journal", "karma"],
    action: { label: "Open Guide", to: "/app/guide" },
    accentHue: 210,
  },
  {
    id: "journal",
    title: "Journal",
    eyebrow: "The laboratory",
    summary: "Write to find out what you actually think. The AI returns the patterns you cannot see.",
    aliases: [
      "journal",
      "journaling",
      "journal kya hai",
      "writing",
      "diary",
      "journal tab",
    ],
    spoken: [
      "The journal is the laboratory. You write to discover what you actually think.",
      "The app reads your own words back and points at patterns you cannot see from inside them.",
      "It is not a diary for performance. Nobody is grading it.",
      "Two honest lines beat a polished page.",
    ],
    detail:
      "Journal entries feed the loop detector and the mirror. Over weeks, repeated phrases become visible as loops.\n\nThe journal is also where resistance shows up first: what you avoid writing about is data.",
    followUps: ["loops", "mirror", "guide-space"],
    action: { label: "Open Journal", to: "/app/journal" },
    accentHue: 96,
  },
  {
    id: "temple",
    title: "Temple",
    eyebrow: "The sanctuary",
    summary: "Sit with the masters. Unstructured presence, no agenda, no scoring.",
    aliases: [
      "temple",
      "temple kya hai",
      "masters",
      "masters room",
      "sanctuary",
      "sit with masters",
    ],
    spoken: [
      "The temple is the sanctuary. Unstructured presence with the masters.",
      "No agenda. No prompt sequence. No score.",
      "You sit, and the room holds you. Some days that is the whole practice.",
      "It exists because not every moment needs to be optimized.",
    ],
    detail:
      "The Temple hosts the master personas â€” Krishna, Buddha, Ramana and many more â€” each with a lineage voice rather than a generic assistant tone.\n\nNothing is measured here. That is deliberate: a space in the app that cannot be failed.",
    followUps: ["orb", "yoga", "guide-space"],
    accentHue: 276,
  },
  {
    id: "mirror",
    title: "The Mirror",
    eyebrow: "Reflection, not scoreboard",
    summary: "The app shows you yourself. It does not rank you against anyone.",
    aliases: [
      "mirror",
      "the mirror",
      "mirror engine",
      "mirror kya hai",
      "reflection",
      "my patterns",
    ],
    spoken: [
      "The mirror shows you yourself. It is not a scoreboard.",
      "It connects your loops, your domains and your recent sessions into one honest picture.",
      "No comparison with other users. Ever. Comparison is the fastest way to corrupt this work.",
      "You look, you see, you choose one small next step.",
    ],
    detail:
      "The Mirror Engine cross-references loops across domains to find shared roots, and surfaces them at the moment you can actually hear them.\n\nThe design rule is anti-guilt: no leaderboards, no \"users like you are ahead\", no shame copy.",
    followUps: ["loops", "life-domains", "rhythm"],
    accentHue: 300,
  },
  {
    id: "karma",
    title: "Karma",
    eyebrow: "Action and grooves",
    summary: "Action, not revenge. Every action leaves an impression that biases the next one.",
    aliases: [
      "karma",
      "karma kya hai",
      "karma engine",
      "action",
      "earned karma",
      "punya",
    ],
    spoken: [
      "Karma means action. Not cosmic revenge.",
      "Every action leaves an impression in the nervous system that biases your next response.",
      "The punishment is that you become the kind of person who acts that way again.",
      "In the app, karma points are earned by real practice, never by logging in.",
    ],
    detail:
      "The Karma Engine separates **earned** karma (real sessions, real journaling, real streaks kept honestly) from **mechanical** karma (clicks, streaks maintained by opening the app). Only the earned kind moves your progression.\n\nMechanical karma exists so the UI has something to show. It is not allowed to pretend it is growth.",
    followUps: ["loops", "v-level", "guide-space"],
    accentHue: 38,
  },
  {
    id: "rhythm",
    title: "Rhythm & grace",
    eyebrow: "No-guilt design",
    summary: "Streaks exist, but a missed day is not a debt. Pause and grace days are first-class.",
    aliases: [
      "streak",
      "streaks",
      "grace day",
      "grace days",
      "missed a day",
      "streak kya hai",
      "rhythm",
      "daily rhythm",
      "no guilt",
    ],
    spoken: [
      "There are streaks, but a missed day is not a debt.",
      "Grace days and pause are part of the system, not an exception you have to beg for.",
      "Any gap of three days or more triggers a gentle warm up instead of a punishment.",
      "Regression is framed as a spiral. You visit the same place again, deeper.",
    ],
    detail:
      "The anti-guilt rules are literal product behaviour, not copy:\n\n- Level drops carry **no penalty** and no shame message.\n- Prior sessions still count when you return.\n- A return after a gap needs only a few good sessions to re-earn the level.\n- Gaps trigger a temporary warm-up adjustment that self-corrects in one session.\n\nIf the app ever makes you feel behind, that is a bug.",
    followUps: ["v-level", "sessions", "mirror"],
    accentHue: 174,
  },
  {
    id: "samskara",
    title: "Samskara",
    eyebrow: "Why loops feel like identity",
    summary: "The groove is old enough that it feels like who you are. It is not.",
    aliases: [
      "samskara",
      "sanskar",
      "samskara kya hai",
      "impression",
      "groove",
      "why does it feel like me",
    ],
    spoken: [
      "Samskara is the groove left by repetition. The older the groove, the more it feels like identity.",
      "That is the trap. You say, this is just who I am. It is actually just the deepest trench.",
      "You do not erase a groove by fighting it. You cut a new one beside it, and walk there until it deepens.",
      "That is what daily practice is doing, mechanically.",
    ],
    detail:
      "Samskara â†’ vasana (the pull) â†’ behaviour â†’ deeper samskara. The loop feeds itself.\n\nThe intervention is boring on purpose: small, repeated, embodied sessions. Insight names the groove. Practice cuts the new one.",
    followUps: ["loops", "practice", "witness"],
    accentHue: 350,
  },
  {
    id: "witness",
    title: "The witness",
    eyebrow: "The core skill",
    summary: "The gap between you and the thought. Everything else is built on it.",
    aliases: [
      "witness",
      "sakshi",
      "observation",
      "observe",
      "witness kya hai",
      "observer",
      "the gap",
      "witness gap",
    ],
    spoken: [
      "The witness is the gap between you and the thought. The part that notices without becoming.",
      "It is not detachment. It is standing one step back while the storm still moves.",
      "Observation is the core literacy of this whole app. Everything else is built on it.",
      "Start with three seconds. Notice one thought, and do not follow it.",
    ],
    detail:
      "Observation ladder: thought â†’ emotion â†’ body â†’ breath â†’ the observer itself.\n\nThe first honest win is not silence. It is catching a thought one second earlier than last week.\n\nThis is Sakshi Bhav â€” witness consciousness â€” treated as a trainable capacity, not a mystical accident.",
    followUps: ["practice", "samskara", "v-level"],
    action: { label: "Open Observation", to: "/app/observer" },
    accentHue: 200,
  },
];

export const GUIDE_TOPIC_IDS = GUIDE_TOPICS.map((topic) => topic.id);

const BY_ID = new Map(GUIDE_TOPICS.map((topic) => [topic.id, topic]));

export function getGuideTopic(id: string): GuideTopic | undefined {
  return BY_ID.get(id);
}

/** The order the voice tour follows. Deliberately starts with the map, not the model. */
export const GUIDE_TOUR: string[] = [
  "sessions",
  "orb",
  "loops",
  "v-level",
  "h-level",
  "life-domains",
  "yoga",
  "practice",
  "guide-space",
  "journal",
  "temple",
  "mirror",
  "karma",
  "rhythm",
  "witness",
];

/** First-run intro: three stops, spoken automatically the first time a user lands in the app. */
export const GUIDE_INTRO: string[] = ["loops", "life-domains", "yoga"];

export const GUIDE_INTRO_WELCOME = {
  spoken: [
    "Welcome. Let me show you what this app is for before you tap anything.",
    "It is a daily practice app. You meet your patterns, understand where they live, and loosen them with practice.",
    "Three ideas, about a minute each. You can stop me at any time.",
  ],
  detail:
    "This is the short first-run tour. It covers **loops**, **life domains** and **yoga**, then hands the app over to you.",
  summary: "A three-stop introduction to the app.",
};

export const GUIDE_WELCOME = {
  spoken: [
    "You are in the voice guide. I will explain this app the way I would explain it to a friend.",
    "Tap the orb to hear the tour. Hold it, or press the mic, to ask about anything: sessions, loops, levels, domains, yoga.",
    "Say next to continue, repeat to hear that again, or stop to end the voice.",
  ],
  detail:
    "Ask by voice or by text. Try: **what is a session**, **loops kya hai**, **v-level ka matlab**, **life domain**, **yoga**.\n\nAsk for **next**, **repeat** or **stop** at any time.",
  summary: "Ask anything about the app, out loud.",
};

/** Spoken when the tour reaches its last stop. */
export const GUIDE_TOUR_END_SPOKEN =
  "That is the map. Ask about any concept, or open the full Guide chat when you want to go deeper.";

/** Shown when a question matches nothing confidently. */
export const GUIDE_FALLBACK_SPOKEN =
  "I did not match that to a concept I know well. Try asking about sessions, loops, V level, H level, life domains, yoga, practice, journal, temple, the mirror, karma, or rhythm.";


