/**
 * Scaffolded atom categories.
 * Expanded library: 3–6 atoms per category for richer composer variety.
 * Atom IDs use category-prefix.short-name convention.
 */
import type { Atom } from "../types";

export const WISDOM_READ_ATOMS: Atom[] = [
  {
    id: "wisdom.gita.2.47",
    category: "wisdom-read",
    label: "Bhagavad Gita 2.47",
    intent: "On action without attachment to fruit",
    durationSec: { min: 60, typical: 90, max: 180 },
    level: 0, modality: "read", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
    body: "You have a right to perform action, but never to its fruits. Let not the fruit be your motive — nor let your attachment be to inaction.",
    tags: ["karma-yoga"],
  },
  {
    id: "wisdom.upanishad.tat-tvam-asi",
    category: "wisdom-read",
    label: "Tat Tvam Asi",
    intent: "Chandogya Upanishad: 'You are That'",
    durationSec: { min: 60, typical: 90, max: 180 },
    level: 1, modality: "read", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
    body: "That which is the subtle essence — in it all that exists has its self. That is the True. That is the Self. Tat tvam asi — you are That.",
    tags: ["vedanta","non-dual"],
  },
  {
    id: "wisdom.tao.11",
    category: "wisdom-read",
    label: "Tao Te Ching 11",
    intent: "On the use of emptiness",
    durationSec: { min: 60, typical: 90, max: 150 },
    level: 0, modality: "read", intensity: "gentle",
    gates: ["any"], energy: ["low","medium"],
    body: "Thirty spokes share one hub. The cup is shaped from clay, but its emptiness makes it useful. We work with being, but non-being is what we use.",
    tags: ["tao"],
  },
  {
    id: "wisdom.rumi.guest-house",
    category: "wisdom-read",
    label: "Rumi — The Guest House",
    intent: "On welcoming every emotion",
    durationSec: { min: 60, typical: 90, max: 180 },
    level: 0, modality: "read", intensity: "gentle",
    gates: ["any"], energy: ["low","medium"],
    body: "This being human is a guest house. Every morning a new arrival — a joy, a depression, a meanness. Welcome and entertain them all.",
    tags: ["sufi"],
  },
];

export const NEUROSCIENCE_ATOMS: Atom[] = [
  {
    id: "neuro.default-mode-network",
    category: "neuroscience",
    label: "The Default Mode Network",
    intent: "Why the mind wanders — and what meditation does to it",
    durationSec: { min: 90, typical: 120, max: 180 },
    level: 0, modality: "read", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    body: "When you're not doing anything, a brain network called the DMN lights up — running stories about yourself, the past, the future. Most suffering happens here. Meditation quiets it.",
  },
  {
    id: "neuro.vagus-nerve",
    category: "neuroscience",
    label: "The Vagus Nerve",
    intent: "Why slow breath calms you",
    durationSec: { min: 90, typical: 120, max: 180 },
    level: 0, modality: "read", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    body: "The vagus nerve runs from brainstem to gut. Slow, long exhales stimulate it — flipping the body from fight-or-flight to rest-and-digest. Your breath is a switch.",
  },
  {
    id: "neuro.amygdala-hijack",
    category: "neuroscience",
    label: "Amygdala Hijack",
    intent: "Why you snap before you think",
    durationSec: { min: 90, typical: 120, max: 180 },
    level: 0, modality: "read", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
    body: "Threat signals reach the amygdala 80ms before the thinking brain. Naming the emotion ('this is anger') reconnects the prefrontal cortex — and the hijack ends.",
  },
];

export const FRAMEWORK_ATOMS: Atom[] = [
  {
    id: "framework.three-brains-diagram",
    category: "framework",
    label: "Head / Heart / Gut Diagram",
    intent: "Visual model of the three intelligences",
    durationSec: { min: 60, typical: 90, max: 120 },
    level: 0, modality: "read", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    body: "Three centers, three jobs. Head: thinking, planning. Heart: relating, valuing. Gut: knowing, deciding. All three are needed. None should rule alone.",
  },
  {
    id: "framework.loop-anatomy",
    category: "framework",
    label: "Anatomy of a Loop",
    intent: "Trigger → thought → feeling → action → reinforcement",
    durationSec: { min: 90, typical: 120, max: 180 },
    level: 1, modality: "read", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
    body: "Every loop has 5 parts: a trigger, an automatic thought, a body feeling, a reactive action, and a reward that reinforces the cycle. Break any link — the loop weakens.",
  },
  {
    id: "framework.witness-vs-thinker",
    category: "framework",
    label: "Witness vs Thinker",
    intent: "The one who watches thought is not thought",
    durationSec: { min: 60, typical: 90, max: 150 },
    level: 1, modality: "read", intensity: "gentle",
    gates: ["any"], energy: ["low","medium"],
    body: "Thoughts arise. Someone notices them. That noticer — sakshi — is what you are. The thoughts are just weather passing through.",
  },
];

export const BODY_SCAN_ATOMS: Atom[] = [
  {
    id: "body.head-to-toe",
    category: "body-scan",
    label: "Head-to-Toe Scan",
    intent: "Sweep attention through the body",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium"],
    script: [
      "Lie down or sit. Eyes closed.",
      "Bring attention to the crown of your head.",
      "Slowly sweep down — face, neck, shoulders, arms, chest, belly, hips, legs, feet.",
      "At each part, notice without changing.",
    ],
  },
  {
    id: "body.tension-map",
    category: "body-scan",
    label: "Tension Map",
    intent: "Find the 3 tightest places in the body right now",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: [
      "Close eyes. Scan slowly.",
      "Find the 3 tightest spots.",
      "Breathe into each. Don't fix. Just feel.",
    ],
  },
  {
    id: "body.micro-scan-60s",
    category: "body-scan",
    label: "60-Second Body Check",
    intent: "Quick somatic re-entry",
    durationSec: { min: 45, typical: 60, max: 90 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: ["Feet — what's here?", "Belly — what's here?", "Face — what's here?"],
  },
];

export const KRIYA_ATOMS: Atom[] = [
  {
    id: "kriya.spinal-flex",
    category: "kriya",
    label: "Spinal Flex",
    intent: "Energise the spine",
    durationSec: { min: 120, typical: 180, max: 300 },
    level: 1, modality: "move", intensity: "balanced",
    gates: ["morning"], energy: ["medium","high"],
    script: [
      "Sit cross-legged. Hands on knees.",
      "Inhale — arch spine forward, chest up.",
      "Exhale — round spine back.",
      "Continue smoothly for 1–3 minutes.",
    ],
  },
  {
    id: "kriya.breath-of-fire",
    category: "kriya",
    label: "Breath of Fire",
    intent: "Rapid diaphragmatic breath to ignite energy",
    durationSec: { min: 60, typical: 120, max: 180 },
    level: 2, modality: "sit", intensity: "fierce",
    gates: ["morning"], energy: ["medium","high"],
    script: [
      "Sit tall. Hands on knees.",
      "Sharp exhales through nose — belly snaps in.",
      "Inhale happens automatically.",
      "Equal in/out. 2–3 per second.",
    ],
  },
  {
    id: "kriya.sat-kriya",
    category: "kriya",
    label: "Sat Kriya",
    intent: "Energy-clearing chant with breath",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 2, modality: "sit", intensity: "balanced",
    gates: ["morning","evening"], energy: ["medium","high"],
    script: [
      "Sit on heels. Arms overhead, palms together.",
      "Chant 'Sat' — pull navel in.",
      "Chant 'Nam' — release.",
      "Continue rhythmically.",
    ],
  },
];

export const MOVEMENT_ATOMS: Atom[] = [
  {
    id: "movement.shake-it-off",
    category: "movement",
    label: "Shake It Off",
    intent: "Discharge stored stress through shaking",
    durationSec: { min: 60, typical: 120, max: 300 },
    level: 0, modality: "move", intensity: "balanced",
    gates: ["morning","midday"], energy: ["low","medium","high"],
    script: [
      "Stand. Soft knees.",
      "Start shaking — arms, hands, hips, legs.",
      "Let it become whatever it wants.",
      "After, stand still. Feel.",
    ],
  },
  {
    id: "movement.cat-cow",
    category: "movement",
    label: "Cat-Cow",
    intent: "Spine warm-up",
    durationSec: { min: 60, typical: 120, max: 240 },
    level: 0, modality: "move", intensity: "gentle",
    gates: ["morning"], energy: ["low","medium","high"],
    script: [
      "On hands and knees.",
      "Inhale — drop belly, lift chest.",
      "Exhale — round spine, tuck chin.",
      "Slow and breath-led.",
    ],
  },
  {
    id: "movement.standup-stretch",
    category: "movement",
    label: "Stand-Up Reset",
    intent: "Mid-day desk break",
    durationSec: { min: 60, typical: 120, max: 180 },
    level: 0, modality: "move", intensity: "gentle",
    gates: ["midday"], energy: ["low","medium","high"],
    script: [
      "Stand. Reach arms overhead.",
      "Side bend left, then right.",
      "Forward fold, hang for 5 breaths.",
      "Roll up slowly.",
    ],
  },
];

export const MUDRA_ATOMS: Atom[] = [
  {
    id: "mudra.gyan",
    category: "mudra",
    label: "Gyan Mudra",
    intent: "Index finger to thumb — wisdom gesture",
    durationSec: { min: 60, typical: 180, max: 600 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium"],
    script: [
      "Touch tip of index finger to tip of thumb.",
      "Other three fingers extended.",
      "Hands rest on knees, palms up.",
    ],
  },
  {
    id: "mudra.anjali",
    category: "mudra",
    label: "Anjali Mudra",
    intent: "Hands at heart — unity",
    durationSec: { min: 30, typical: 90, max: 180 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: ["Palms together at heart center.", "Thumbs touch sternum.", "Breathe."],
  },
  {
    id: "mudra.dhyana",
    category: "mudra",
    label: "Dhyana Mudra",
    intent: "Meditation gesture — right hand on left, thumbs touching",
    durationSec: { min: 60, typical: 180, max: 600 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium"],
    script: ["Cup hands in lap.", "Right rests on left.", "Thumb tips lightly touch."],
  },
];

export const MANTRA_ATOMS: Atom[] = [
  {
    id: "mantra.so-hum",
    category: "mantra",
    label: "So-Hum",
    intent: "Breath-mantra: 'I am that'",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium"],
    script: [
      "On inhale, mentally hear 'So'.",
      "On exhale, mentally hear 'Hum'.",
      "Continue silently.",
    ],
  },
  {
    id: "mantra.om",
    category: "mantra",
    label: "Om Chanting",
    intent: "Primordial sound — vocal vibration",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 0, modality: "sit", intensity: "balanced",
    gates: ["morning","evening"], energy: ["medium","high"],
    script: [
      "Inhale deeply.",
      "Long Aaa — Ooo — Mmm on exhale.",
      "Feel the vibration in chest, throat, head.",
      "Repeat 7–21 times.",
    ],
  },
  {
    id: "mantra.aham-brahmasmi",
    category: "mantra",
    label: "Aham Brahmasmi",
    intent: "'I am the universe' — silent repetition",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 2, modality: "sit", intensity: "balanced",
    gates: ["any"], energy: ["low","medium"],
    script: ["Sit. Eyes closed.", "Silently repeat 'Aham Brahmasmi'.", "Let it dissolve into silence."],
  },
];

export const MEDITATION_ATOMS: Atom[] = [
  {
    id: "meditation.anchor-breath",
    category: "meditation",
    label: "Breath as Anchor",
    intent: "Classic anapanasati — return to breath",
    durationSec: { min: 300, typical: 600, max: 1800 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: [
      "Sit. Close eyes.",
      "Feel the breath at the nostrils.",
      "When mind wanders, gently return.",
      "No judgment. Only return.",
    ],
  },
  {
    id: "meditation.loving-kindness",
    category: "meditation",
    label: "Metta — Loving Kindness",
    intent: "Send goodwill in widening circles",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 1, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium"],
    script: [
      "May I be happy. May I be safe. May I be free.",
      "Now a loved one. Same phrases.",
      "Now a neutral person.",
      "Now someone difficult.",
      "Finally — all beings everywhere.",
    ],
  },
  {
    id: "meditation.open-awareness",
    category: "meditation",
    label: "Open Awareness",
    intent: "No anchor — just notice what arises",
    durationSec: { min: 300, typical: 600, max: 1800 },
    level: 3, modality: "sit", intensity: "balanced",
    gates: ["any"], energy: ["low","medium"],
    script: [
      "Sit. No object of focus.",
      "Whatever arises — sound, thought, sensation — notice it.",
      "Let it pass. Don't grab. Don't push.",
    ],
  },
];

export const OBSERVATION_ATOMS: Atom[] = [
  {
    id: "observe.5-senses",
    category: "observation",
    label: "5-4-3-2-1 Senses",
    intent: "Ground in the present through the senses",
    durationSec: { min: 60, typical: 120, max: 240 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: [
      "Name 5 things you can see.",
      "4 you can touch.",
      "3 you can hear.",
      "2 you can smell.",
      "1 you can taste.",
    ],
  },
  {
    id: "observe.thought-count",
    category: "observation",
    label: "Count the Thoughts",
    intent: "Tally thoughts for 2 minutes — no judgment",
    durationSec: { min: 120, typical: 180, max: 300 },
    level: 1, modality: "sit", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
    script: ["Sit. Eyes closed.", "Every time a thought arises, mentally tick.", "After 2 min, open eyes. Just notice the count."],
  },
  {
    id: "observe.one-object",
    category: "observation",
    label: "One Object, Five Minutes",
    intent: "Look at a single object as if you'd never seen it",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 1, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: ["Pick any object near you.", "Study it as if alien.", "Color, texture, edges, weight.", "Notice when mind labels — return to seeing."],
  },
];

export const CONCENTRATION_ATOMS: Atom[] = [
  {
    id: "concentration.candle-trataka",
    category: "concentration",
    label: "Candle Gaze (Trataka)",
    intent: "Single-point focus on a flame",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 2, modality: "sit", intensity: "balanced",
    gates: ["evening","night"], energy: ["medium","high"],
    script: [
      "Light a candle. Sit 2 feet away.",
      "Gaze without blinking as long as comfortable.",
      "When eyes water, close them. See the after-image.",
      "Open. Repeat.",
    ],
  },
  {
    id: "concentration.count-breath-21",
    category: "concentration",
    label: "Count Breaths to 21",
    intent: "Build single-point focus through counting",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 1, modality: "sit", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
    script: ["Inhale-exhale = 1.", "Continue to 21.", "If you lose count — restart at 1. No frustration."],
  },
];

export const CONTEMPLATION_ATOMS: Atom[] = [
  {
    id: "contemplation.sit-with-question",
    category: "contemplation",
    label: "Sit With the Question",
    intent: "Hold one question without trying to solve it",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 1, modality: "sit", intensity: "balanced",
    gates: ["any"], energy: ["low","medium"],
    script: [
      "Pick a question that matters to you.",
      "Sit with it — don't think it through.",
      "Let it work on you.",
    ],
  },
  {
    id: "contemplation.death-meditation",
    category: "contemplation",
    label: "Maranasati",
    intent: "Contemplate the certainty of death — to live awake",
    durationSec: { min: 300, typical: 600, max: 900 },
    level: 3, modality: "sit", intensity: "fierce",
    gates: ["evening","night"], energy: ["low","medium"],
    script: ["Sit. Eyes closed.", "Reflect: this body will die.", "This breath could be the last.", "What matters now?"],
  },
];

export const VOICE_JOURNAL_ATOMS: Atom[] = [
  {
    id: "voice-journal.speak-it-out",
    category: "voice-journal",
    label: "Speak It Out",
    intent: "Voice-record what's alive right now",
    durationSec: { min: 120, typical: 300, max: 600 },
    level: 0, modality: "speak", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
    script: [
      "Tap record.",
      "Speak whatever is on your mind — no script.",
      "Let it pour out.",
    ],
  },
  {
    id: "voice-journal.future-self",
    category: "voice-journal",
    label: "Letter to Future Self",
    intent: "Speak a message to yourself one year out",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 1, modality: "speak", intensity: "balanced",
    gates: ["evening","night"], energy: ["low","medium"],
    script: ["Imagine yourself, 1 year from now.", "Tell them what you want them to remember.", "Record and save."],
  },
];

export const IFS_PARTS_ATOMS: Atom[] = [
  {
    id: "ifs.meet-a-part",
    category: "ifs-parts",
    label: "Meet a Part",
    intent: "Internal-family-systems: dialogue with one inner part",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 2, modality: "write", intensity: "balanced",
    gates: ["evening","night"], energy: ["low","medium"],
    script: [
      "Pick a part of you (the critic, the worrier, the achiever).",
      "Ask: what are you trying to do for me?",
      "Listen. Write what you hear.",
      "Thank the part.",
    ],
  },
  {
    id: "ifs.unburden-protector",
    category: "ifs-parts",
    label: "Unburden the Protector",
    intent: "Ask a protective part what it fears would happen if it stopped",
    durationSec: { min: 300, typical: 600, max: 900 },
    level: 3, modality: "write", intensity: "balanced",
    gates: ["evening","night"], energy: ["low","medium"],
    script: ["Identify a protector part (controller, perfectionist…).", "Ask: what are you afraid of?", "Listen. Reassure: I'm here now."],
  },
];

export const SOMATIC_RELEASE_ATOMS: Atom[] = [
  {
    id: "somatic.tense-release",
    category: "somatic-release",
    label: "Tense and Release",
    intent: "Discharge stored tension by exaggerating it first",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 0, modality: "sit", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
    script: [
      "Tense fists, arms, shoulders, face — hold 5 seconds.",
      "Release fully. Notice the wave of relief.",
      "Repeat through legs, belly, chest.",
    ],
  },
  {
    id: "somatic.tre-tremor",
    category: "somatic-release",
    label: "TRE — Neurogenic Tremor",
    intent: "Allow the body to shake out stored trauma energy",
    durationSec: { min: 300, typical: 600, max: 900 },
    level: 2, modality: "move", intensity: "balanced",
    gates: ["evening"], energy: ["low","medium"],
    script: ["Lie on back, knees bent, feet flat.", "Let knees fall slowly open.", "Tremors arise — don't stop them.", "Allow for 5–10 min."],
  },
  {
    id: "somatic.sigh-3x",
    category: "somatic-release",
    label: "Three Big Sighs",
    intent: "Reset the nervous system in 60 seconds",
    durationSec: { min: 30, typical: 60, max: 90 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: ["Inhale deep through nose.", "Sigh loud through mouth.", "Repeat 3 times."],
  },
];

export const EMOTION_NAMING_ATOMS: Atom[] = [
  {
    id: "emotion.rain",
    category: "emotion-naming",
    label: "RAIN",
    intent: "Recognise, Allow, Investigate, Nurture",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 1, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium"],
    script: [
      "R — Recognise: what is here?",
      "A — Allow: let it be here.",
      "I — Investigate: where in the body? what does it want?",
      "N — Nurture: place a hand on the place. Offer kindness.",
    ],
  },
  {
    id: "emotion.label-to-tame",
    category: "emotion-naming",
    label: "Name It to Tame It",
    intent: "Specific labels reduce amygdala activation",
    durationSec: { min: 60, typical: 120, max: 180 },
    level: 0, modality: "write", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: ["What am I feeling — exactly?", "Not 'bad'. Try: disappointed, restless, jealous, ashamed.", "Name 3 specific words."],
  },
];

export const SHADOW_WORK_ATOMS: Atom[] = [
  {
    id: "shadow.who-triggers-me",
    category: "shadow-work",
    label: "Who Triggers Me?",
    intent: "Find the disowned part the trigger mirrors",
    durationSec: { min: 300, typical: 600, max: 900 },
    level: 2, modality: "write", intensity: "fierce",
    gates: ["evening","night"], energy: ["low","medium"],
    script: [
      "Name a person who triggers you.",
      "List 3 traits you can't stand in them.",
      "Ask: where do I do this myself — even subtly?",
    ],
  },
  {
    id: "shadow.gold-projection",
    category: "shadow-work",
    label: "Gold Shadow",
    intent: "Find disowned greatness projected onto heroes",
    durationSec: { min: 300, typical: 600, max: 900 },
    level: 2, modality: "write", intensity: "balanced",
    gates: ["evening"], energy: ["low","medium"],
    script: ["Name 3 people you idolise.", "List the qualities you envy.", "Ask: where might these qualities live in me — unowned?"],
  },
];

export const GURU_DIALOGUE_ATOMS: Atom[] = [
  {
    id: "guru-dialogue.open",
    category: "guru-dialogue",
    label: "Open Dialogue with Master",
    intent: "Chat with the program's assigned guru",
    durationSec: { min: 180, typical: 420, max: 900 },
    level: 0, modality: "speak", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
  },
  {
    id: "guru-dialogue.ask-one-question",
    category: "guru-dialogue",
    label: "One Question to the Master",
    intent: "Bring a single burning question",
    durationSec: { min: 120, typical: 240, max: 480 },
    level: 0, modality: "speak", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
  },
];

export const COUNCIL_ATOMS: Atom[] = [
  {
    id: "council.three-perspectives",
    category: "council",
    label: "Three-Master Council",
    intent: "Ask one question to three masters; hear three angles",
    durationSec: { min: 300, typical: 600, max: 900 },
    level: 1, modality: "read", intensity: "balanced",
    gates: ["midday","evening"], energy: ["medium","high"],
  },
];

export const GUIDE_CHAT_ATOMS: Atom[] = [
  {
    id: "guide-chat.wise-sibling",
    category: "guide-chat",
    label: "Talk to the Guide",
    intent: "Warm wise-sibling AI check-in",
    durationSec: { min: 120, typical: 300, max: 600 },
    level: 0, modality: "speak", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
  },
  {
    id: "guide-chat.pulse-check",
    category: "guide-chat",
    label: "Pulse Check",
    intent: "60-second 'how are you, really?'",
    durationSec: { min: 60, typical: 120, max: 240 },
    level: 0, modality: "speak", intensity: "gentle",
    gates: ["midday","evening"], energy: ["low","medium","high"],
  },
];

export const MICRO_ACT_ATOMS: Atom[] = [
  {
    id: "micro-act.drink-water",
    category: "micro-act",
    label: "Drink a Full Glass of Water",
    intent: "Tangible body-care action",
    durationSec: { min: 30, typical: 60, max: 120 },
    level: 0, modality: "move", intensity: "gentle",
    gates: ["morning","midday"], energy: ["low","medium","high"],
  },
  {
    id: "micro-act.call-someone",
    category: "micro-act",
    label: "Send a Voice Note",
    intent: "Reach out to one person you've been meaning to",
    durationSec: { min: 60, typical: 180, max: 300 },
    level: 0, modality: "speak", intensity: "balanced",
    gates: ["midday","evening"], energy: ["medium","high"],
  },
  {
    id: "micro-act.thank-someone",
    category: "micro-act",
    label: "Thank Someone",
    intent: "Send one genuine thank-you message",
    durationSec: { min: 60, typical: 120, max: 240 },
    level: 0, modality: "write", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
  },
  {
    id: "micro-act.tidy-one-thing",
    category: "micro-act",
    label: "Tidy One Thing",
    intent: "Outer order — inner order",
    durationSec: { min: 120, typical: 300, max: 600 },
    level: 0, modality: "move", intensity: "gentle",
    gates: ["morning","evening"], energy: ["low","medium","high"],
  },
];

export const SPEECH_VOW_ATOMS: Atom[] = [
  {
    id: "speech-vow.no-complaint-1h",
    category: "speech-vow",
    label: "No Complaining for 1 Hour",
    intent: "Watch what you say for 60 minutes",
    durationSec: { min: 60, typical: 60, max: 60 },
    level: 1, modality: "speak", intensity: "balanced",
    gates: ["midday"], energy: ["medium","high"],
  },
  {
    id: "speech-vow.one-honest-thing",
    category: "speech-vow",
    label: "Say One Honest Thing",
    intent: "Speak one truth you've been holding back",
    durationSec: { min: 120, typical: 240, max: 600 },
    level: 2, modality: "speak", intensity: "fierce",
    gates: ["midday","evening"], energy: ["medium","high"],
  },
  {
    id: "speech-vow.pause-before-reply",
    category: "speech-vow",
    label: "3-Breath Pause Before Replying",
    intent: "Insert space between trigger and speech",
    durationSec: { min: 60, typical: 60, max: 60 },
    level: 1, modality: "speak", intensity: "balanced",
    gates: ["midday"], energy: ["medium","high"],
  },
];

export const DETOX_ATOMS: Atom[] = [
  {
    id: "detox.no-phone-30min",
    category: "detox",
    label: "Phone in Another Room — 30 min",
    intent: "Short digital-detox window",
    durationSec: { min: 1800, typical: 1800, max: 3600 },
    level: 0, modality: "sit", intensity: "balanced",
    gates: ["evening","night"], energy: ["low","medium"],
  },
  {
    id: "detox.no-screen-1h-morning",
    category: "detox",
    label: "First Hour Screen-Free",
    intent: "Protect the first hour after waking",
    durationSec: { min: 3600, typical: 3600, max: 3600 },
    level: 1, modality: "sit", intensity: "balanced",
    gates: ["morning"], energy: ["low","medium","high"],
  },
  {
    id: "detox.silence-1h",
    category: "detox",
    label: "One Hour of Silence",
    intent: "No speech for 60 minutes",
    durationSec: { min: 3600, typical: 3600, max: 3600 },
    level: 2, modality: "sit", intensity: "balanced",
    gates: ["any"], energy: ["low","medium"],
  },
];

export const AI_MIRROR_ATOMS: Atom[] = [
  {
    id: "ai-mirror.pattern-reflect",
    category: "ai-mirror",
    label: "Show Me My Pattern",
    intent: "AI reflects a recurring loop back to user",
    durationSec: { min: 120, typical: 240, max: 480 },
    level: 0, modality: "read", intensity: "balanced",
    gates: ["any"], energy: ["low","medium","high"],
  },
  {
    id: "ai-mirror.weekly-summary",
    category: "ai-mirror",
    label: "Week-in-Review Mirror",
    intent: "AI summarises themes from the last 7 days",
    durationSec: { min: 180, typical: 300, max: 480 },
    level: 0, modality: "read", intensity: "gentle",
    gates: ["evening","night"], energy: ["low","medium"],
  },
];

export const LOOP_CONFRONT_ATOMS: Atom[] = [
  {
    id: "loop-confront.name-and-face",
    category: "loop-confront",
    label: "Name the Loop, Face It",
    intent: "Engage a detected loop directly with guided steps",
    durationSec: { min: 300, typical: 600, max: 900 },
    level: 2, modality: "write", intensity: "fierce",
    gates: ["midday","evening"], energy: ["medium","high"],
  },
  {
    id: "loop-confront.interrupt-now",
    category: "loop-confront",
    label: "Interrupt the Loop — Now",
    intent: "60-second pattern interrupt in the moment",
    durationSec: { min: 60, typical: 120, max: 180 },
    level: 1, modality: "move", intensity: "balanced",
    gates: ["any"], energy: ["medium","high"],
  },
];

export const RITUAL_ATOMS: Atom[] = [
  {
    id: "ritual.opening-bow",
    category: "ritual",
    label: "Opening Bow",
    intent: "Ceremonial start to the session",
    durationSec: { min: 30, typical: 60, max: 90 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: [
      "Sit tall. Hands at heart.",
      "Take 3 slow breaths.",
      "Set an intention for this session.",
    ],
  },
  {
    id: "ritual.closing-thanks",
    category: "ritual",
    label: "Closing Thanks",
    intent: "Ceremonial close — gratitude",
    durationSec: { min: 30, typical: 60, max: 120 },
    level: 0, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: [
      "Hands at heart.",
      "Silently thank yourself for showing up.",
      "Bow.",
    ],
  },
  {
    id: "ritual.dedicate-merit",
    category: "ritual",
    label: "Dedicate the Merit",
    intent: "Offer the fruits of practice to all beings",
    durationSec: { min: 30, typical: 60, max: 120 },
    level: 1, modality: "sit", intensity: "gentle",
    gates: ["any"], energy: ["low","medium","high"],
    script: ["Hands at heart.", "Whatever good came from this — may it benefit all beings.", "Bow."],
  },
];
