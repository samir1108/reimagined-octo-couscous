/**
 * awakeningSessions — the eleven sessions of THE AWAKENING JOURNEY.
 * ─────────────────────────────────
 * A closed, authored spine: eleven sessions from automatic living to
 * conscious action. The spine of each session is fixed (the beats below);
 * the `question` beats are filled adaptively at runtime from the bank in
 * `awakeningQuestions.ts`, so no two users walk the same eleven sessions.
 *
 * The arc:
 *   Phase 1 — Discover Yourself      (1–3)   what is happening inside you
 *   Phase 2 — Understand What Drives You (4–6) why it keeps happening
 *   Phase 3 — Develop Your Capabilities (7–9) train what you can change
 *   Phase 4 — Integrate             (10–11) what you will do differently
 *
 * Every session produces something useful: an observation, a practiced
 * skill, a personal insight, or a deliberate action.
 */
import type { AwakeningSession } from "./types";

export const AWAKENING_SESSIONS: AwakeningSession[] = [
  // ── 1. MEET THE ONE WHO OBSERVES ─────────────────────────────────────
  {
    id: "meet_the_observer",
    n: 1,
    title: "Meet the One Who Observes",
    question: "Who are you beyond your thoughts?",
    essence: "A thought is something you have. It is not something you are.",
    phase: "discover",
    capabilities: ["awareness", "reflection"],
    master: "Ramana Maharshi",
    estMinutes: 8,
    discovery:
      "You can observe an experience without immediately becoming absorbed in it.",
    outcome: "The beginning of self-observation — the skill every later session depends on.",
    carrySeed: "I can watch the thought without being the thought.",
    experiment: {
      title: "What am I noticing right now?",
      body: "Today, whenever a strong thought or feeling arrives, pause for three seconds and ask: what am I noticing right now? Do not answer with a story. Name the noticing itself — a thought, a tightening, a pull.",
      vowLabel: "I'll pause and ask what I'm noticing",
    },
    practice: {
      kind: "game",
      title: "Thought Watcher",
      instruction:
        "Words will drift up on the screen. Tap the moment you notice one. Do not chase it, do not finish it — just notice that you noticed.",
      note: "The gap between the thought appearing and your tap is the measurement we care about. It is not a score; it is the shape of your attention.",
      gameId: "thought-watcher",
      trains: ["awareness", "attention"],
    },
    threads: ["Who Am I? — the self-inquiry journey, when the observer becomes the question"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 2. DISCOVER YOUR AUTOMATIC PATTERNS ──────────────────────────────
  {
    id: "automatic_patterns",
    n: 2,
    title: "Discover Your Automatic Patterns",
    question: "How much of your day do you actually choose?",
    essence: "Most of yesterday was not decided. It was executed.",
    phase: "discover",
    capabilities: ["behavioral_patterns", "awareness"],
    master: "Krishnamurti",
    estMinutes: 8,
    discovery: "Your behaviour follows recognizable patterns — and a pattern you can see is a pattern you can interrupt.",
    outcome: "A personal map of automatic behaviours and the triggers that start them.",
    carrySeed: "Between the trigger and the action there is a gap, and the gap is mine.",
    experiment: {
      title: "Catch three automatic moments",
      body: "Today, observe three moments when you act automatically — the phone reach, the reflex reply, the familiar avoidance. Do not change them. Just write down what happened right before each one.",
      vowLabel: "I'll catch three automatic moments",
    },
    practice: {
      kind: "game",
      title: "Distraction Cost",
      instruction:
        "A tempting offer will appear on screen. Each time you take it, the cost is counted. Your job is not to resist everything — it is to notice the exact moment the hand moves before the mind decides.",
      note: "The count is not the point. The noticing is the point.",
      gameId: "distraction-cost",
      trains: ["behavioral_patterns", "discipline"],
    },
    threads: ["Pattern finder — the guide mode that maps your loops over weeks, not minutes"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 3. UNDERSTAND YOUR INNER WORLD ───────────────────────────────────
  {
    id: "inner_world",
    n: 3,
    title: "Understand Your Inner World",
    question: "What is actually happening inside you when you feel something?",
    essence: "An experience is not one feeling. It has parts, and the parts can be examined.",
    phase: "discover",
    capabilities: ["emotional_regulation", "reflection"],
    master: "Patanjali",
    estMinutes: 9,
    discovery:
      "What you call 'bad' is usually four separate things at once: a thought, an emotion, a sensation, and an impulse.",
    outcome: "A more detailed reading of your own inner state — the first skill of regulation.",
    carrySeed: "Four things were happening, not one. I can name them one at a time.",
    experiment: {
      title: "Name it in four parts",
      body: "The next time you feel disturbed, describe it in four categories: the thought, the emotion, the sensation, and the impulse. One line each. No fixing — just naming.",
      vowLabel: "I'll name the four parts",
    },
    practice: {
      kind: "game",
      title: "Body Scanner",
      instruction:
        "Tap only where you actually feel something — not where you think you should. Let the scan be slow and honest. Vague is a finding too.",
      note: "Most people discover their 'feelings' have an address in the body before they have a name in the mind.",
      gameId: "body-scanner",
      trains: ["emotional_regulation", "awareness"],
    },
    threads: ["Read the Emotional Weather — the emotion-mapping journey"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 4. MEET YOUR TRIGGERS ────────────────────────────────────────────
  {
    id: "meet_your_triggers",
    n: 4,
    title: "Meet Your Triggers",
    question: "Why do certain situations affect you more than others?",
    essence: "The situation is the match. What it lights was already there.",
    phase: "drivers",
    capabilities: ["behavioral_patterns", "emotional_regulation"],
    master: "Carl Jung",
    estMinutes: 9,
    discovery:
      "Your strongest reactions are not about the moment that caused them. They are about what the moment meant.",
    outcome: "A personal trigger map — situation, interpretation, and the need underneath.",
    carrySeed: "Until it is made conscious, it will direct my life and I will call it fate.",
    experiment: {
      title: "Investigate one charged moment",
      body: "Today, take one moment that stirred you and ask three questions: what happened, what I made it mean, and what I needed from it. Write the answers where only you will read them.",
      vowLabel: "I'll investigate one charged moment",
    },
    practice: {
      kind: "game",
      title: "Mirror Realm",
      instruction:
        "You will be praised, then criticised, by voices that are not real. Notice the pull — toward or away. Neither is wrong. The noticing is the practice.",
      note: "Your typing pattern between the praise and the insult is the most honest reading in this session.",
      gameId: "mirror-realm",
      trains: ["emotional_regulation", "behavioral_patterns"],
    },
    threads: ["Befriend the Shadow — meeting what you usually push away"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 5. DISCOVER YOUR HIDDEN MOTIVATIONS ──────────────────────────────
  {
    id: "hidden_motivations",
    n: 5,
    title: "Discover Your Hidden Motivations",
    question: "Why do you want what you want?",
    essence: "Two people can want the same thing for opposite reasons.",
    phase: "drivers",
    capabilities: ["intention", "reflection"],
    master: "Krishna",
    estMinutes: 9,
    discovery:
      "The goal may be security, recognition, belonging, mastery, or freedom — and the wanting changes depending on which one is driving.",
    outcome: "Clarity about what is actually behind one of your real goals.",
    carrySeed: "I asked why I want it, and the answer was not the one I expected.",
    experiment: {
      title: "Ask one goal why",
      body: "Today, take one goal you are actively pursuing and ask it, three times: what would achieving this give me? Keep asking until the answer stops being about the thing itself.",
      vowLabel: "I'll ask my goal why",
    },
    practice: {
      kind: "game",
      title: "Council of Three",
      instruction:
        "Three voices will answer your question — the head, the heart, and the gut. Give each one a fair hearing before you decide which one is actually yours.",
      note: "The disagreement between the three is your motivation, showing itself.",
      gameId: "council-of-three",
      trains: ["intention", "reflection"],
    },
    threads: ["Decision clarity — the guide mode for values-based choices"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 6. UNDERSTAND YOUR KARMA ─────────────────────────────────────────
  {
    id: "understand_your_karma",
    n: 6,
    title: "Understand Your Karma",
    question: "What are your actions creating in your life?",
    essence: "Intention becomes action, action becomes consequence, consequence becomes pattern.",
    phase: "drivers",
    capabilities: ["intention", "behavioral_patterns", "discipline"],
    master: "Krishna",
    estMinutes: 10,
    discovery:
      "Repeated actions reinforce the pattern that produces the situation you keep finding yourself in.",
    outcome: "A personal action-pattern map: one recurring situation, traced from intention to consequence.",
    carrySeed: "I changed one action inside the pattern, and the pattern moved.",
    experiment: {
      title: "Change one action inside the pattern",
      body: "Pick one recurring situation — the criticism you brace against, the message you delay. Inside it, change exactly one action: pause, clarify, or choose a response instead of reacting. Watch what the change creates.",
      vowLabel: "I'll change one action in the pattern",
    },
    practice: {
      kind: "game",
      title: "Karma Coin",
      instruction:
        "Declare one small action you will complete today. Tonight, report honestly what happened. The game keeps the ledger — declared versus done.",
      note: "This is the oldest practice in the journey: say what you will do, then look at what you did.",
      gameId: "karma-coin",
      trains: ["discipline", "intention"],
    },
    threads: ["Work Without Wearing Out — the karma yoga journey; Karma yoga as a daily mode"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 7. TRAIN YOUR ATTENTION ──────────────────────────────────────────
  {
    id: "train_your_attention",
    n: 7,
    title: "Train Your Attention",
    question: "Can you choose what deserves your attention?",
    essence: "Attention is the narrow beam that decides what becomes real for you.",
    phase: "capabilities",
    capabilities: ["attention", "awareness"],
    master: "Patanjali",
    estMinutes: 10,
    discovery:
      "The mind wanders, returns, wanders, returns — and the returning is the trainable part, exactly like a muscle.",
    outcome: "A baseline reading of your attention and a repeatable practice for training it.",
    carrySeed: "The wandering was not the failure. The returning was the training.",
    experiment: {
      title: "One task, ten minutes",
      body: "Today, do one task for ten minutes without switching to anything else. When the mind leaves, note it and come back. The task can be small. The not-switching is the practice.",
      vowLabel: "I'll give one task ten whole minutes",
    },
    practice: {
      kind: "game",
      title: "Bell in the Wind",
      instruction:
        "A bell sits in a dark space. Hold your attention on it and do not look away — not at the screen edge, not at a thought. When you do, notice that you did, and return.",
      note: "Every moment you notice you left is a repetition. There is no way to fail this practice.",
      gameId: "bell-in-the-wind",
      trains: ["attention"],
    },
    threads: ["Decondition the Mind — the attention journey; focus practices in the Temple"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 8. CREATE SPACE BEFORE YOU REACT ─────────────────────────────────
  {
    id: "space_before_reacting",
    n: 8,
    title: "Create Space Before You React",
    question: "Can you feel an emotion without letting it dictate your next action?",
    essence: "The goal is not to feel less. It is to choose what you do with what you feel.",
    phase: "capabilities",
    capabilities: ["emotional_regulation", "awareness"],
    master: "Krishnamurti",
    estMinutes: 9,
    discovery:
      "Between the feeling and the action there is a gap — and the gap can be widened, deliberately, on purpose.",
    outcome: "A practical regulation skill: catch the early sign, pause, then choose.",
    carrySeed: "I felt it fully and still chose. Both mattered.",
    experiment: {
      title: "One deliberate pause",
      body: "Today, in one frustrating moment, take a single breath before you respond. Not silence forever — one breath. Notice what wants to come out, then choose what actually does.",
      vowLabel: "I'll take one breath before I respond",
    },
    practice: {
      kind: "breath",
      title: "The long exhale",
      instruction:
        "Inhale for four, hold for four, exhale for six — the exhale longer than the inhale. Six rounds. The long exhale is a signal to the body: the emergency is over.",
      pattern: "4·4·6",
      rounds: 6,
      note: "Then, if you want the harder version: sit with one feeling for sixty seconds without expressing or suppressing it.",
      trains: ["emotional_regulation"],
    },
    threads: ["Stop the Reactor — the pranayama journey; anger alchemy in the Guide"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 9. BUILD THE POWER TO FOLLOW THROUGH ─────────────────────────────
  {
    id: "follow_through",
    n: 9,
    title: "Build the Power to Follow Through",
    question: "Why do you repeatedly fail to do things you genuinely want to do?",
    essence: "Knowing what matters and doing what matters are two different abilities.",
    phase: "capabilities",
    capabilities: ["discipline", "intention"],
    master: "Vivekananda",
    estMinutes: 9,
    discovery:
      "Follow-through fails at the start, not the middle — the effort to begin is the part you can redesign.",
    outcome: "A repeatable system for turning intention into action, tested small.",
    carrySeed: "I made the beginning so small it was harder to skip than to do.",
    experiment: {
      title: "One action, three days",
      body: "Choose one action you genuinely want to do — small enough to be almost embarrassing. Do it once a day for the next three days. Motivation may not arrive. Do it anyway, and watch what arrives instead.",
      vowLabel: "I'll do one small action for three days",
    },
    practice: {
      kind: "game",
      title: "Finish Line",
      instruction:
        "Start something on screen and finish it — completely, with the small closing act done, not abandoned. Notice where the urge to abandon appears, and continue past it.",
      note: "The midway abandonment urge is the exact muscle this session trains.",
      gameId: "finish-line",
      trains: ["discipline"],
    },
    threads: ["Raja yoga discipline in the Profile; habit programs in the library"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 10. DISCOVER WHAT MATTERS TO YOU ─────────────────────────────────
  {
    id: "what_matters",
    n: 10,
    title: "Discover What Matters to You",
    question: "Are you living according to your values, or following expectations?",
    essence: "An inherited goal, examined honestly, is sometimes not yours at all.",
    phase: "integrate",
    capabilities: ["values", "reflection"],
    master: "Rumi",
    estMinutes: 9,
    discovery:
      "Some of your goals were chosen by you. Others were installed — by family, culture, or the quiet arithmetic of comparison.",
    outcome: "A personal values map and one area of misalignment you are ready to change.",
    carrySeed: "This decision was mine. That is how I could tell.",
    experiment: {
      title: "One decision from your own value",
      body: "This week, make one decision from a value you consciously chose — not from an expectation you inherited. It can be small: what you say yes to, what you decline, what you stop apologising for.",
      vowLabel: "I'll make one decision from my own value",
    },
    practice: {
      kind: "game",
      title: "Dharma Yuddha",
      instruction:
        "A dilemma will be put to you with no clean answer. Choose — and then look at what your choice reveals about what you actually value, which is not always what you would have said.",
      note: "Values are read from choices, not from statements. This session reads one.",
      gameId: "dharma-yuddha",
      trains: ["values", "intention"],
    },
    threads: ["Values-based decision making; purpose programs in the library"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },

  // ── 11. DESIGN YOUR CONSCIOUS LIFE ───────────────────────────────────
  {
    id: "design_conscious_life",
    n: 11,
    title: "Design Your Conscious Life",
    question: "Now that you understand yourself better, what will you do differently?",
    essence: "Everything you observed in ten sessions now becomes one decision.",
    phase: "integrate",
    capabilities: ["awareness", "reflection", "values", "discipline"],
    master: "Ramana Maharshi",
    estMinutes: 12,
    discovery:
      "The map you built is not the point. The one pattern you choose to work on is.",
    outcome:
      "A personal development map, one chosen pattern, one chosen capability — and the next journey recommended for both.",
    carrySeed: "I know what I see, what drives me, and what I will train next.",
    experiment: {
      title: "The first week of the rest",
      body: "From tomorrow, run the system you just learned: notice (awareness), map (pattern), pause (space), act (choice). Once a day is enough. The system is now yours to run.",
      vowLabel: "I'll run the system once a day",
    },
    practice: {
      kind: "silence",
      title: "The question, held",
      instruction:
        "Hold the question without words: who is aware right now? When an answer arrives, do not fight it — ask again, of the one it appeared to. Three rounds. Then rest in whatever remains.",
      seconds: 120,
      speakInto: "What remains?",
      trains: ["awareness", "attention"],
    },
    threads: ["The full library — journeys, programs, and guides, all keyed to your map"],
    steps: [
      { kind: "question", beat: "arrival" },
      { kind: "question", beat: "observation" },
      { kind: "question", beat: "investigation" },
      { kind: "question", beat: "investigation" },
      { kind: "practice" },
      { kind: "experiment" },
      { kind: "question", beat: "reflection" },
    ],
  },
];

export const AWAKENING_TOTAL = AWAKENING_SESSIONS.length;

export const AWAKENING_SESSION_BY_ID = (id: string): AwakeningSession | undefined =>
  AWAKENING_SESSIONS.find((s) => s.id === id);

export const AWAKENING_SESSION_BY_N = (n: number): AwakeningSession | undefined =>
  AWAKENING_SESSIONS.find((s) => s.n === n);

/** Canonical order, by spine position. */
export const AWAKENING_CANONICAL_ORDER: string[] = AWAKENING_SESSIONS.map((s) => s.id);
