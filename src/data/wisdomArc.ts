/**
 * First-7-Days Wisdom Arc
 * ───────────────────────
 * One cinematic mini-lesson per day for a new user's first week.
 * Each entry: a single concept, decoded in 30–45 seconds of reading.
 * Source = ancient root + modern decode + one micro-instruction.
 */
export interface WisdomArcDay {
  day: number;
  title: string;
  subtitle: string;
  ancient: string;
  modern: string;
  practice: string;
  closing: string;
}

export const WISDOM_ARC: WisdomArcDay[] = [
  {
    day: 1,
    title: "What is consciousness?",
    subtitle: "Day 1 of 13 · The opening",
    ancient:
      "The Upanishads call it Chit — pure awareness. Not a thought. Not a feeling. The space in which both arise.",
    modern:
      "Neuroscience calls it the 'observer process' — the background field that registers what your brain is doing, without being the doing.",
    practice:
      "Right now: notice that you are reading. Then notice the one who is noticing. That second noticer is you.",
    closing: "You are not your thoughts. You are what watches them.",
  },
  {
    day: 2,
    title: "What is a loop?",
    subtitle: "Day 2 of 13 · The mechanics",
    ancient:
      "The yogis called it samskara — a groove cut into the mind by repetition. Each time you run it, the groove deepens.",
    modern:
      "Behavioral science calls it a habit loop: trigger → craving → response → reward. Runs in 90 ms, faster than thought.",
    practice:
      "Today, catch one loop. Any small one. Reaching for the phone. Refreshing email. The catch itself is the work.",
    closing: "You cannot break a loop you cannot see. Seeing is half the freedom.",
  },
  {
    day: 3,
    title: "Your three brains",
    subtitle: "Day 3 of 13 · The architecture",
    ancient:
      "Tantra mapped three centers: Manas (head), Hridaya (heart), Manipura (gut). Three intelligences. Three loops.",
    modern:
      "Modern research confirms it: head brain (cortex), heart brain (40,000 neurons), gut brain (500 million). All three think.",
    practice:
      "Ask each one: What does my head want? What does my heart want? What does my gut want? Notice they often disagree.",
    closing: "Wisdom is not in one brain. It is in the conversation between three.",
  },
  {
    day: 4,
    title: "What is a V-Level?",
    subtitle: "Day 4 of 13 · The map",
    ancient:
      "The traditions mapped consciousness in bands — from tamas (heaviness) to sattva (clarity) to turiya (pure witness).",
    modern:
      "We translated this into 11 measurable bands (0–10). Your current band shapes what you see, feel, and choose.",
    practice:
      "Open Analytics. Tap your band. Read who lives there. This is not a grade. It is a compass.",
    closing: "You are not climbing a ladder. You are remembering you were always the sky.",
  },
  {
    day: 5,
    title: "Sakshi — the witness",
    subtitle: "Day 5 of 13 · The discovery",
    ancient:
      "Sakshi Bhav — the witness state. To watch your mind as if it belonged to someone else. The oldest practice.",
    modern:
      "Default mode network quiets. Salience network sharpens. You stop being the storm and start being the sky around it.",
    practice:
      "For 60 seconds, watch one thought arise and dissolve. Do not push. Do not grab. Just witness.",
    closing: "The witness is never anxious. The witness is never sad. The witness only sees.",
  },
  {
    day: 6,
    title: "Your lineage",
    subtitle: "Day 6 of 13 · The thread",
    ancient:
      "Parampara — the unbroken thread of teachers. Each generation hands the flame to the next. You stand in that line.",
    modern:
      "Your strongest dimension reveals the path your mind already walks. Three masters across centuries walked it before you.",
    practice:
      "In Analytics, find your Lineage card. Read the three names. One of them is closer to you than your last therapist.",
    closing: "You are not alone. You are the latest verse of a very old poem.",
  },
  {
    day: 7,
    title: "Monkey to man — and stuck",
    subtitle: "Day 7 of 13 · The inheritance",
    ancient:
      "The yogis called the inherited animal nature pashu-bhava. Useful in the jungle. Tragic in the cubicle.",
    modern:
      "Millions of years of evolution wired you for survival — eat, defend, mate, repeat. Now the same wiring chases monthly salaries and dopamine hits from a glowing rectangle.",
    practice:
      "Today, notice one moment where survival-mode took over. Rushing. Defending. Hoarding. Just see — 'that was the animal, not me.'",
    closing: "You evolved a witness on top of the animal. Most humans never use it. You are about to.",
  },
  {
    day: 8,
    title: "Maun — the original language",
    subtitle: "Day 8 of 13 · The silence",
    ancient:
      "Ramana Maharshi taught primarily in maun. Mahavir held silence for 12 years. Across every tradition, silence was the highest teaching.",
    modern:
      "Two minutes of silence lowers cortisol more than 'relaxing' music. Sustained silence regenerates hippocampal neurons (Kirste et al., 2013).",
    practice:
      "Sit for 2 minutes. Don't fix posture. Don't follow breath. Just stop talking to yourself. Notice what remains.",
    closing: "Silence is not empty. It is the room in which the self can finally hear itself.",
  },
  {
    day: 9,
    title: "I am not the body. I am not the mind.",
    subtitle: "Day 9 of 13 · The dis-identification",
    ancient:
      "Sadhguru repeats it daily: 'I am not my body, I am not even my mind.' Adi Shankara mapped five sheaths — each finer than the last. You are none of them.",
    modern:
      "The felt sense of 'I' is constructed by the default mode network. When the DMN quiets — in deep meditation, in flow — the 'I' loosens. Awareness remains.",
    practice:
      "Say slowly: 'I have a body, but I am not my body. I have thoughts, but I am not my thoughts.' Notice the small space that opens.",
    closing: "You are not the vehicle. You are the one looking through the windshield.",
  },
  {
    day: 10,
    title: "Observation dissolves thought",
    subtitle: "Day 10 of 13 · The method",
    ancient:
      "Vipassana's core method. Krishnamurti called it 'choiceless awareness.' Zen calls it shikantaza — just sitting, just seeing.",
    modern:
      "Labeling an emotion ('this is anger') drops amygdala activation by ~50% and recruits the right ventrolateral prefrontal cortex (Lieberman, 2007). Naming defangs.",
    practice:
      "Next thought that arises, name it: 'thinking.' Don't argue with it. Don't believe it. Just name and watch. By the third watching, it loses half its weight.",
    closing: "A thought watched is a thought weakened. A thought believed is a thought obeyed.",
  },
  {
    day: 11,
    title: "Your three inner LLMs",
    subtitle: "Day 11 of 13 · The hidden authors",
    ancient:
      "Tantra mapped three sovereign intelligences — head, heart, gut. Modern framing: each runs its own internal language model, narrating your life without your permission.",
    modern:
      "Head LLM trained on cultural conditioning. Heart LLM on attachment patterns. Gut LLM on primal threat memory. All three speak in 'I.' None of them is you.",
    practice:
      "Next decision today, ask: which LLM is talking right now? The head's logic? The heart's longing? The gut's fear? You are the one who hears all three.",
    closing: "You are not any voice in your head. You are the one who chooses which voice to follow.",
  },
  {
    day: 12,
    title: "The evolution trap",
    subtitle: "Day 12 of 13 · The mismatch",
    ancient:
      "Krishna in the Gita: 'The senses are turbulent, they violently snatch away the mind.' The trap was visible 5,000 years ago.",
    modern:
      "Stone-age nervous system. Screen-age life. Dopamine circuits built for calorie discovery now fire for likes, scrolls, shopping carts. The trap is biochemical, not moral.",
    practice:
      "Notice one trap today — the urge to check, refresh, scroll. Don't shame it. Just see the wiring. Seeing is the first crack in it.",
    closing: "The wiring is old. But the awareness watching it is older. And the awareness is updatable.",
  },
  {
    day: 13,
    title: "Your map",
    subtitle: "Day 13 of 13 · The integration",
    ancient:
      "The Bhagavad Gita: 'Yoga is skill in action.' Not escape. Not avoidance. Skill — in the middle of the mess.",
    modern:
      "You now have: a witness, three brains, three LLMs, a band, a lineage, a loop library, and the silence beneath all of it. This is your operating system.",
    practice:
      "Today, run one full cycle — morning practice, one loop caught, one moment of maun, one evening reflection. The system is now yours.",
    closing: "Week two is over. The path begins. Walk it in your own time.",
  },
];
