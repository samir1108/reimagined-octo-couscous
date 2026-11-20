/**
 * Atom library expansion — adds variety so the composer has more
 * material to draw from in fillFrom categories. ~90 additional atoms.
 */
import type { Atom } from "../types";

export const EXPANSION_ATOMS: Atom[] = [
  // ─── wisdom-read ───
  { id: "wisdom.gita.6.5", category: "wisdom-read", label: "Gita 6.5 — Self-elevation", intent: "Lift yourself by yourself; do not let yourself sink",
    durationSec: { min: 60, typical: 90, max: 150 }, level: 0, modality: "read", intensity: "balanced", gates: ["any"], energy: ["low","medium","high"],
    body: "Let a man lift himself by his own Self alone; let him not lower himself, for this Self alone is the friend of oneself, and this Self alone is the enemy of oneself." },
  { id: "wisdom.dhammapada.1", category: "wisdom-read", label: "Dhammapada 1", intent: "Mind precedes all things",
    durationSec: { min: 60, typical: 90, max: 150 }, level: 0, modality: "read", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"],
    body: "All that we are is the result of what we have thought. The mind is everything. What we think, we become." },
  { id: "wisdom.ashtavakra.1.4", category: "wisdom-read", label: "Ashtavakra 1.4", intent: "You are pure awareness",
    durationSec: { min: 60, typical: 90, max: 150 }, level: 2, modality: "read", intensity: "balanced", gates: ["any"], energy: ["low","medium"],
    body: "You are not the body. You are not the mind. You are awareness — boundless, untouched, free." },

  // ─── neuroscience ───
  { id: "neuro.neuroplasticity", category: "neuroscience", label: "Neuroplasticity", intent: "Why repeated practice rewires you",
    durationSec: { min: 90, typical: 120, max: 180 }, level: 0, modality: "read", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"],
    body: "Neurons that fire together, wire together. Every repetition of a thought, feeling, or act lays down a deeper groove. Practice is literal sculpting." },
  { id: "neuro.interoception", category: "neuroscience", label: "Interoception", intent: "Your inner sense — the foundation of emotion",
    durationSec: { min: 90, typical: 120, max: 180 }, level: 1, modality: "read", intensity: "gentle", gates: ["any"], energy: ["low","medium"],
    body: "Interoception is the brain's sense of the body's inner state. Strengthening it sharpens emotional clarity and decision-making." },

  // ─── framework ───
  { id: "framework.observer-effect", category: "framework", label: "Observer Effect", intent: "What you watch, changes",
    durationSec: { min: 60, typical: 90, max: 120 }, level: 1, modality: "read", intensity: "gentle", gates: ["any"], energy: ["low","medium"],
    body: "The moment a thought is seen, its grip loosens. Observation itself is a transformation." },
  { id: "framework.window-of-tolerance", category: "framework", label: "Window of Tolerance", intent: "Hyper, hypo, and the calm middle",
    durationSec: { min: 90, typical: 120, max: 180 }, level: 1, modality: "read", intensity: "balanced", gates: ["any"], energy: ["low","medium","high"],
    body: "Above the window: panic, rage. Below: shutdown, numb. Inside: presence. Practice widens the window." },

  // ─── breathwork ───
  { id: "breath.box-4-4-4-4.v2", category: "breathwork", label: "Box Breath 4-4-4-4", intent: "Square breath for steadiness",
    durationSec: { min: 120, typical: 240, max: 360 }, level: 0, modality: "sit", intensity: "balanced", gates: ["any"], energy: ["medium","high"],
    script: ["Inhale 4","Hold 4","Exhale 4","Hold 4","Repeat for the duration"] },
  { id: "breath.4-7-8", category: "breathwork", label: "4-7-8 Breath", intent: "Long exhale for calm",
    durationSec: { min: 120, typical: 180, max: 300 }, level: 0, modality: "sit", intensity: "gentle", gates: ["evening","night"], energy: ["low","medium"],
    script: ["Inhale 4","Hold 7","Exhale 8","Repeat 4–8 cycles"] },
  { id: "breath.ujjayi", category: "breathwork", label: "Ujjayi (Ocean Breath)", intent: "Throat-narrowed warming breath",
    durationSec: { min: 180, typical: 300, max: 600 }, level: 1, modality: "sit", intensity: "balanced", gates: ["morning","midday"], energy: ["medium","high"],
    script: ["Slight throat constriction","Breathe through nose","Audible ocean sound","Match inhale/exhale length"] },

  // ─── body-scan ───
  { id: "body.full-scan-5min", category: "body-scan", label: "Full-Body Scan (5 min)", intent: "Crown to toes attention sweep",
    durationSec: { min: 240, typical: 300, max: 420 }, level: 0, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium"],
    script: ["Crown of head","Face, jaw, neck","Shoulders, arms, hands","Chest, belly","Back","Hips","Legs","Feet"] },
  { id: "body.felt-sense", category: "body-scan", label: "Felt-Sense Inquiry", intent: "Gendlin-style sensing of a topic in the body",
    durationSec: { min: 240, typical: 360, max: 600 }, level: 2, modality: "sit", intensity: "balanced", gates: ["any"], energy: ["low","medium"],
    script: ["Bring topic to mind","Notice body shift","Stay with the vague sense","Wait for a word/image that fits","Check it back against the body"] },

  // ─── kriya ───
  { id: "kriya.breath-of-fire.v2", category: "kriya", label: "Breath of Fire", intent: "Rapid belly breath to ignite energy",
    durationSec: { min: 60, typical: 90, max: 180 }, level: 2, modality: "sit", intensity: "fierce", gates: ["morning"], energy: ["medium","high"],
    script: ["Equal rapid in/out through nose","Pump belly","60–120 breaths/min","Rest after"] },
  { id: "kriya.shaking-meditation", category: "kriya", label: "Shaking Meditation", intent: "Full-body shake to discharge",
    durationSec: { min: 180, typical: 300, max: 600 }, level: 1, modality: "move", intensity: "fierce", gates: ["morning","midday"], energy: ["high"],
    script: ["Stand, soft knees","Shake from ankles up","Let arms, jaw, head loose","After: stillness, notice"] },

  // ─── movement ───
  { id: "movement.sun-salute-1", category: "movement", label: "One Sun Salutation", intent: "A single round, slow and conscious",
    durationSec: { min: 90, typical: 120, max: 180 }, level: 1, modality: "move", intensity: "balanced", gates: ["morning"], energy: ["medium","high"],
    script: ["Mountain → forward fold","Halfway lift → low push-up","Upward dog → down dog","Step forward → mountain"] },
  { id: "movement.spinal-twist", category: "movement", label: "Seated Spinal Twist", intent: "Wring out the spine",
    durationSec: { min: 60, typical: 90, max: 180 }, level: 0, modality: "move", intensity: "gentle", gates: ["any"], energy: ["low","medium"],
    script: ["Sit tall","Inhale lengthen","Exhale twist right","Hold 3 breaths","Switch sides"] },
  { id: "movement.shoulder-roll", category: "movement", label: "Shoulder Rolls", intent: "Release upper-body tension",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 0, modality: "move", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"] },

  // ─── mudra ───
  { id: "mudra.gyan.v2", category: "mudra", label: "Gyan Mudra", intent: "Thumb + index — knowledge seal",
    durationSec: { min: 120, typical: 300, max: 900 }, level: 0, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium"] },
  { id: "mudra.chin", category: "mudra", label: "Chin Mudra", intent: "Palms down — grounding",
    durationSec: { min: 120, typical: 300, max: 900 }, level: 0, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium"] },

  // ─── mantra ───
  { id: "mantra.gayatri", category: "mantra", label: "Gayatri Mantra", intent: "Solar invocation",
    durationSec: { min: 120, typical: 300, max: 900 }, level: 1, modality: "speak", intensity: "balanced", gates: ["morning"], energy: ["medium"],
    body: "Om Bhur Bhuvah Svah / Tat Savitur Varenyam / Bhargo Devasya Dhimahi / Dhiyo Yo Nah Prachodayat" },
  { id: "mantra.om-mani", category: "mantra", label: "Om Mani Padme Hum", intent: "Compassion mantra",
    durationSec: { min: 120, typical: 300, max: 900 }, level: 0, modality: "speak", intensity: "gentle", gates: ["any"], energy: ["low","medium"] },

  // ─── meditation ───
  { id: "meditation.choiceless-awareness", category: "meditation", label: "Choiceless Awareness", intent: "Krishnamurti-style watching of all",
    durationSec: { min: 300, typical: 600, max: 1800 }, level: 3, modality: "sit", intensity: "balanced", gates: ["any"], energy: ["low","medium"],
    script: ["Sit","Don't choose what to watch","Let attention go where it goes","No commentary, no fixing"] },
  { id: "meditation.body-as-anchor", category: "meditation", label: "Body as Anchor", intent: "Rest attention in whole-body sensation",
    durationSec: { min: 300, typical: 600, max: 1200 }, level: 1, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium"] },
  { id: "meditation.sky-mind", category: "meditation", label: "Sky-like Mind", intent: "Thoughts as clouds in vast sky",
    durationSec: { min: 300, typical: 600, max: 1200 }, level: 2, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium"] },

  // ─── witness ───
  { id: "witness.name-the-watcher", category: "witness", label: "Name the Watcher", intent: "Who is aware of awareness?",
    durationSec: { min: 180, typical: 300, max: 600 }, level: 2, modality: "sit", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },
  { id: "witness.thought-as-object", category: "witness", label: "Thought-as-Object", intent: "See thoughts as things, not you",
    durationSec: { min: 240, typical: 360, max: 600 }, level: 1, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium"] },

  // ─── observation ───
  { id: "observe.three-sounds", category: "observation", label: "Three Sounds", intent: "Name three sounds without judging",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 0, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"] },
  { id: "observe.faces-of-people", category: "observation", label: "Faces of People", intent: "Witness someone without story",
    durationSec: { min: 60, typical: 120, max: 240 }, level: 1, modality: "sit", intensity: "gentle", gates: ["midday","evening"], energy: ["low","medium"] },

  // ─── concentration ───
  { id: "concentration.candle-flame", category: "concentration", label: "Trataka — Candle Gaze", intent: "Single-pointed gaze",
    durationSec: { min: 180, typical: 300, max: 900 }, level: 2, modality: "sit", intensity: "balanced", gates: ["evening","night"], energy: ["low","medium"] },
  { id: "concentration.counting-breaths-10", category: "concentration", label: "Count to 10 Breaths", intent: "Restart at 10 or distraction",
    durationSec: { min: 180, typical: 300, max: 600 }, level: 0, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium"] },

  // ─── self-inquiry ───
  { id: "inquiry.what-is-aware", category: "self-inquiry", label: "What is Aware?", intent: "Turn attention back on itself",
    durationSec: { min: 240, typical: 480, max: 900 }, level: 3, modality: "sit", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },
  { id: "inquiry.before-this-thought", category: "self-inquiry", label: "Before This Thought", intent: "What was here before the thought arose?",
    durationSec: { min: 180, typical: 300, max: 600 }, level: 2, modality: "sit", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },

  // ─── contemplation ───
  { id: "contemplation.what-do-i-truly-want", category: "contemplation", label: "What do I truly want?", intent: "Sit with the question, no answer needed",
    durationSec: { min: 180, typical: 360, max: 600 }, level: 1, modality: "sit", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },
  { id: "contemplation.if-i-died-tomorrow", category: "contemplation", label: "If I died tomorrow…", intent: "Mortality as clarifier",
    durationSec: { min: 240, typical: 420, max: 600 }, level: 2, modality: "sit", intensity: "fierce", gates: ["evening","night"], energy: ["low","medium"] },

  // ─── journal ───
  { id: "journal.three-wins", category: "journal", label: "Three Wins", intent: "List three small wins from today",
    durationSec: { min: 120, typical: 180, max: 360 }, level: 0, modality: "write", intensity: "gentle", gates: ["evening","night"], energy: ["low","medium"] },
  { id: "journal.what-am-i-avoiding", category: "journal", label: "What am I avoiding?", intent: "Name one avoided thing in writing",
    durationSec: { min: 120, typical: 240, max: 480 }, level: 1, modality: "write", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },
  { id: "journal.day-in-one-sentence", category: "journal", label: "Day in One Sentence", intent: "Compress the day to a line",
    durationSec: { min: 60, typical: 120, max: 240 }, level: 0, modality: "write", intensity: "gentle", gates: ["evening","night"], energy: ["low","medium"] },

  // ─── voice-journal ───
  { id: "voice-journal.unsent-letter", category: "voice-journal", label: "Unsent Letter (spoken)", intent: "Speak what you'd never send",
    durationSec: { min: 180, typical: 300, max: 600 }, level: 1, modality: "speak", intensity: "fierce", gates: ["evening","night"], energy: ["medium"] },
  { id: "voice-journal.gratitude-3", category: "voice-journal", label: "Speak Three Gratitudes", intent: "Name three out loud",
    durationSec: { min: 60, typical: 120, max: 240 }, level: 0, modality: "speak", intensity: "gentle", gates: ["morning","evening"], energy: ["low","medium"] },

  // ─── ifs-parts ───
  { id: "ifs.exile-witness", category: "ifs-parts", label: "Exile — Just Witness", intent: "Sit beside a hidden young part",
    durationSec: { min: 300, typical: 480, max: 900 }, level: 3, modality: "sit", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },
  { id: "ifs.firefighter-dialogue", category: "ifs-parts", label: "Firefighter Dialogue", intent: "Speak with the impulsive coper",
    durationSec: { min: 240, typical: 360, max: 600 }, level: 2, modality: "sit", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },

  // ─── somatic-release ───
  { id: "somatic.shake-2min", category: "somatic-release", label: "2-Min Body Shake", intent: "Discharge stored stress",
    durationSec: { min: 90, typical: 120, max: 240 }, level: 0, modality: "move", intensity: "balanced", gates: ["morning","midday"], energy: ["medium","high"] },
  { id: "somatic.jaw-release", category: "somatic-release", label: "Jaw Release", intent: "Unclench, sigh, slack-jaw",
    durationSec: { min: 60, typical: 120, max: 240 }, level: 0, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"] },

  // ─── emotion-naming ───
  { id: "emotion.precise-name", category: "emotion-naming", label: "Precise Name", intent: "Replace 'bad' with a specific word",
    durationSec: { min: 60, typical: 120, max: 240 }, level: 1, modality: "write", intensity: "gentle", gates: ["any"], energy: ["low","medium"] },
  { id: "emotion.where-in-body", category: "emotion-naming", label: "Where in the body?", intent: "Locate the emotion physically",
    durationSec: { min: 60, typical: 120, max: 240 }, level: 0, modality: "sit", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"] },

  // ─── shadow-work ───
  { id: "shadow.what-i-hide", category: "shadow-work", label: "What I Hide", intent: "Name what you keep from others",
    durationSec: { min: 240, typical: 360, max: 600 }, level: 2, modality: "write", intensity: "fierce", gates: ["evening","night"], energy: ["medium"] },
  { id: "shadow.envy-as-mirror", category: "shadow-work", label: "Envy as Mirror", intent: "Whose life triggers envy — and why",
    durationSec: { min: 240, typical: 360, max: 600 }, level: 2, modality: "write", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },

  // ─── guru-dialogue ───
  { id: "guru-dialogue.one-question.v2", category: "guru-dialogue", label: "Ask Guru One Question", intent: "Bring one real question",
    durationSec: { min: 180, typical: 360, max: 900 }, level: 0, modality: "speak", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },
  { id: "guru-dialogue.receive-blessing", category: "guru-dialogue", label: "Receive a Blessing", intent: "Sit and receive — don't ask",
    durationSec: { min: 120, typical: 240, max: 480 }, level: 1, modality: "sit", intensity: "gentle", gates: ["evening","night"], energy: ["low","medium"] },

  // ─── council ───
  { id: "council.three-perspectives.v2", category: "council", label: "Three Gurus, One Question", intent: "Same question, three answers",
    durationSec: { min: 240, typical: 480, max: 900 }, level: 1, modality: "read", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },
  { id: "council.synthesis", category: "council", label: "Council Synthesis", intent: "Synthesize what the council said",
    durationSec: { min: 180, typical: 300, max: 600 }, level: 2, modality: "write", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },

  // ─── guide-chat ───
  { id: "guide-chat.check-in", category: "guide-chat", label: "Guide Check-in", intent: "Two-line update to your wise sibling",
    durationSec: { min: 120, typical: 240, max: 600 }, level: 0, modality: "write", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"] },
  { id: "guide-chat.go-deeper", category: "guide-chat", label: "Go Deeper", intent: "Ask the guide to reflect a pattern",
    durationSec: { min: 180, typical: 360, max: 600 }, level: 1, modality: "write", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },

  // ─── micro-act ───
  { id: "micro-act.thank-someone.v2", category: "micro-act", label: "Thank Someone", intent: "Send one real thanks now",
    durationSec: { min: 60, typical: 120, max: 240 }, level: 0, modality: "move", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"] },
  { id: "micro-act.stretch-once", category: "micro-act", label: "One Deep Stretch", intent: "Stand and stretch for 60s",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 0, modality: "move", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"] },
  { id: "micro-act.no-phone-meal", category: "micro-act", label: "Phoneless Meal", intent: "Next meal, no screen",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 0, modality: "read", intensity: "balanced", gates: ["any"], energy: ["low","medium","high"] },

  // ─── speech-vow ───
  { id: "speech-vow.no-gossip-today", category: "speech-vow", label: "No Gossip Today", intent: "Refrain from speaking about absent people",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 1, modality: "read", intensity: "balanced", gates: ["morning"], energy: ["low","medium","high"] },
  { id: "speech-vow.say-it-shorter", category: "speech-vow", label: "Say it Shorter", intent: "Today: half the words",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 1, modality: "read", intensity: "balanced", gates: ["morning"], energy: ["low","medium","high"] },

  // ─── detox ───
  { id: "detox.no-news-24h", category: "detox", label: "No News 24h", intent: "Skip news cycles for one day",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 1, modality: "read", intensity: "balanced", gates: ["morning"], energy: ["low","medium","high"] },
  { id: "detox.single-tab", category: "detox", label: "Single Tab Hour", intent: "One tab, one task, one hour",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 1, modality: "read", intensity: "balanced", gates: ["midday"], energy: ["medium","high"] },

  // ─── ai-mirror ───
  { id: "ai-mirror.weekly-pattern", category: "ai-mirror", label: "Weekly Pattern Mirror", intent: "AI reflects this week's recurring pattern",
    durationSec: { min: 120, typical: 240, max: 480 }, level: 1, modality: "read", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },
  { id: "ai-mirror.blindspot", category: "ai-mirror", label: "Blindspot Mirror", intent: "AI names what you keep missing",
    durationSec: { min: 120, typical: 240, max: 480 }, level: 2, modality: "read", intensity: "fierce", gates: ["any"], energy: ["low","medium"] },

  // ─── loop-confront ───
  { id: "loop.identify-trigger", category: "loop-confront", label: "Identify Trigger", intent: "What set this loop off?",
    durationSec: { min: 120, typical: 240, max: 480 }, level: 1, modality: "write", intensity: "balanced", gates: ["any"], energy: ["low","medium"] },
  { id: "loop.cost-ledger", category: "loop-confront", label: "Cost Ledger", intent: "What does this loop cost you?",
    durationSec: { min: 180, typical: 300, max: 600 }, level: 2, modality: "write", intensity: "fierce", gates: ["any"], energy: ["low","medium"] },

  // ─── ritual ───
  { id: "ritual.light-candle", category: "ritual", label: "Light a Candle", intent: "Mark the start of practice",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 0, modality: "move", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"] },
  { id: "ritual.three-bows", category: "ritual", label: "Three Bows", intent: "To teachers, practice, self",
    durationSec: { min: 30, typical: 60, max: 120 }, level: 0, modality: "move", intensity: "gentle", gates: ["any"], energy: ["low","medium","high"] },
];
