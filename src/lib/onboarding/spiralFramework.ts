/**
 * spiralFramework — the 11-band spiral as taught in The Eleven (Gate 5).
 * ─────────────────────────────────
 * Content for the explainer the user sees after their mapping: what each
 * band is, its core fear, how it feels to a 2026 human, and what actually
 * moves a person through it. Plus the four framework principles that keep
 * the map honest.
 */

export interface SpiralBand {
  band: number;
  name: string;
  fear: string;
  /** How this band feels from the inside, in 2026 terms. */
  in2026: string;
  /** The micro-level read: e.g. band 3.2 vs 3.8 — 720p vs 4K. */
  micro: string;
  /** What moves a person through this band. */
  through: string;
}

export const SPIRAL_FRAMEWORK: SpiralBand[] = [
  {
    band: 0,
    name: "Survival",
    fear: "Death",
    in2026:
      "Rent is due and the body is a problem to be solved. Health is a quiet dread; every other question is decoration. Sleep is the battlefield.",
    micro:
      "Micro 0.2 lives one missed invoice from catastrophe. Micro 0.8 has a floor under the floor — the fear is remembered, not occupied.",
    through: "Safety made concrete: one stable rhythm, one reliable person, one body that is fed and moved.",
  },
  {
    band: 1,
    name: "Reactivity",
    fear: "Pain",
    in2026:
      "Inbox rage. The notification that ruins an hour. Cortisol mistaken for ambition. Everything happens TO you, immediately, at volume.",
    micro:
      "Micro 1.2 is pure reflex — reply, eat, scroll, defend. Micro 1.7 watches the reflex happen and still obeys it, which is its own kind of progress.",
    through: "Interruption practices: the three-second gap between stimulus and response, walked through daily.",
  },
  {
    band: 2,
    name: "Identity",
    fear: "Insignificance",
    in2026:
      "The profile is the nervous system. LinkedIn is a diary you perform. Journaling is a press release. Being seen is a survival strategy.",
    micro:
      "Micro 2.2 performs for an empty room. Micro 2.8 suspects the performance is the problem — and keeps performing anyway.",
    through: "Honesty experiments: saying one true sentence where a polished one was expected.",
  },
  {
    band: 3,
    name: "Achievement",
    fear: "Uselessness",
    in2026:
      "Optimization as spirituality. Meditation itself must be tracked, scored, improved. Rest feels like a bug in the system.",
    micro:
      "Micro 3.2 is the discipline machine — streaks, metrics, output. Micro 3.8 has glimpsed that the scale is the trap, and can't stop optimizing the escape.",
    through: "Deliberate uselessness: unearned rest, unpracticed practice, work nobody will grade.",
  },
  {
    band: 4,
    name: "Belonging",
    fear: "Rejection",
    in2026:
      "The nice one. Can't say no, can't leave the group chat, can't hold a boundary without apologizing for it. Harmony at any price.",
    micro:
      "Micro 4.2 is people-pleasing as personality. Micro 4.7 has started saying no — and surprised everyone, including itself.",
    through: "One small, clean no per day. Then one direct ask, without the apology garnish.",
  },
  {
    band: 5,
    name: "Meaning",
    fear: "Meaninglessness",
    in2026:
      "Legacy mode: what am I building, who does it serve, what story does it tell. The trap is real — and so is the slide back to Band 2 when the applause stops.",
    micro:
      "Micro 5.2 builds meaning from external validation. Micro 5.8 builds it from something that survives silence.",
    through: "The unseen-work test: would this still matter if nobody ever saw you do it?",
  },
  {
    band: 6,
    name: "Awareness",
    fear: "Fear becomes observable sensation",
    in2026:
      "The mind goes quiet mid-scroll. You notice the noticing. Meditation is no longer a technique; it's a place you can actually be.",
    micro:
      "Micro 6.2 catches the loop two minutes in. Micro 6.8 catches it forming, while it's still a sensation.",
    through: "Sitting, daily, without a scoreboard. Watching become more interesting than achieving.",
  },
  {
    band: 7,
    name: "Witness",
    fear: "You are the space thoughts occur in",
    in2026:
      "The I-story loosens. Emotions are weather passing through a house, not the house. People find your attention unusually restful to be around.",
    micro:
      "Micro 7.2 rests as the witness. Micro 7.8 even self-consciousness is watched from somewhere.",
    through: "Self-inquiry kept honest: who is aware? — asked until the question exhausts itself.",
  },
  {
    band: 8,
    name: "Surrender",
    fear: "Moving with the current of reality",
    in2026:
      "Effort stops being violence. Plans still exist but don't grip. Life is met as it arrives rather than negotiated with.",
    micro:
      "Micro 8.2 surrenders outcomes but not preferences. Micro 8.8 has stopped arguing with what is, without going limp.",
    through: "Practice without target. Walking, breathing, working — no arrival to reach.",
  },
  {
    band: 9,
    name: "Unity",
    fear: "Fear is impossible",
    in2026:
      "Separation thins. You would not harm another the way you would not harm your own hand. Compassion is geometry, not virtue.",
    micro:
      "Micro 9.2 unifies in stillness. Micro 9.8 unifies in traffic, in conflict, in the feed.",
    through: "Nothing to practice. Only barriers left to notice — and they thin on their own.",
  },
  {
    band: 10,
    name: "Source",
    fear: "Absorption without construction",
    in2026:
      "Construction stops — no seeker, no path, no better self in progress. Band 0 is finally rediscovered: survival, now without fear.",
    micro:
      "Micro 10 is not a level to hold. It is the background in which all levels appear — and the returning is always available.",
    through: "This is not the end of the spiral. It is what the spiral was always inside.",
  },
];

export interface SpiralPrinciple {
  id: string;
  title: string;
  body: string;
}

export const SPIRAL_PRINCIPLES: SpiralPrinciple[] = [
  {
    id: "not-a-ladder",
    title: "A spiral, not a ladder",
    body:
      "You do not graduate from money, sex, or power. You revisit each of them at every band — survival-money, status-money, meaning-money. The same desire, met at a different level of awareness, is a different desire.",
  },
  {
    id: "micro-levels",
    title: "Micro-levels: 720p vs 4K",
    body:
      "Each band has ten micro-levels. Band 3.2 and Band 3.8 look identical on a quiz — one is the discipline machine, the other has seen through it. Your micro-level is where the real precision lives, and it moves in weeks, not years.",
  },
  {
    id: "regression-is-data",
    title: "Regression is data",
    body:
      "Dropping from Band 6 to Band 2 under stress is not failure — it is the stress revealing which band was never actually integrated. The metric is not how high you sit, it is how quickly you return to your centre.",
  },
  {
    id: "no-skipping",
    title: "No skipping bands",
    body:
      "You cannot meditate your way past survival, out-manage your way past grief, or love your way past identity. Spiritual bypassing is just Band 3 wearing Band 8's clothes. The bands that get skipped come back as loops.",
  },
];

export const SPIRAL_BAND_BY_NUMBER = (band: number): SpiralBand | undefined =>
  SPIRAL_FRAMEWORK.find((b) => b.band === band);
