// 7-level observation ladder — from raw sensing to choiceless awareness.
export type ObservationLevel = {
  level: number;
  title: string;
  sanskrit?: string;
  oneLine: string;
  teaching: string;       // markdown
  microPractice: string;  // 60-second instruction
  signOfReadiness: string;
};

export const OBSERVATION_LADDER: ObservationLevel[] = [
  {
    level: 1,
    title: "Body Sensing",
    sanskrit: "Kāya-anupassanā",
    oneLine: "Feel the body as the body — temperature, weight, contact, breath.",
    teaching:
`Before you watch the mind, learn to feel the body. This is the soil all later watching grows from.

Most of what we call "stress" is unfelt body. When you turn attention to the body itself — not the *story* about the body — you discover something simple: the body is already here, already breathing, already in contact with the floor. The mind is somewhere else.

The first level of observation is the smallest possible move: drop attention from thought into sensation.`,
    microPractice:
`Sit comfortably. For 60 seconds, feel three things in order — 5 seconds each, looping:
1. The weight of your body on the seat.
2. The temperature of the air on your skin.
3. The breath touching the inside of your nose.
That's it. No commentary. Just feeling.`,
    signOfReadiness: "You can sit for 1 minute feeling the body without drifting more than 2-3 times.",
  },
  {
    level: 2,
    title: "Breath Watching",
    sanskrit: "Ānāpāna",
    oneLine: "Watch the breath without changing it.",
    teaching:
`Now narrow the attention. The breath becomes the home base.

The trick most people miss: do *not* control the breath. Watch it like you'd watch a sleeping animal — present, but not interfering. Long inhale, short inhale, pause, exhale — all of it is fine. Your job is to know what the breath is doing, not to make it any particular way.

This is the original meditation the Buddha taught his son. Two thousand five hundred years later it still works because the breath is the only place the body and mind always meet.`,
    microPractice:
`Close your eyes. Find the breath. Don't change it. Count ten breaths — counting silently on each exhale: "one… two… three…" up to ten. If you lose count, start at one again. No big deal.`,
    signOfReadiness: "You can complete one round of ten breaths without losing count.",
  },
  {
    level: 3,
    title: "Emotion Watching",
    sanskrit: "Vedanā-anupassanā",
    oneLine: "Notice the feeling-tone of each moment — pleasant, unpleasant, neutral.",
    teaching:
`The body is steady. The breath is the anchor. Now widen the lens slightly: notice the *feeling-tone* of whatever arises.

Every experience — a thought, a sound, a sensation — has a flavor: pleasant, unpleasant, or neutral. We usually skip over the feeling-tone and react instantly. The third level of observation is just: catch the flavor before the reaction.

When you can do this, you've gained a tiny gap between stimulus and response. That gap is the whole of freedom.`,
    microPractice:
`For 2 minutes, label the feeling-tone of each thing you notice. Quietly: "pleasant… unpleasant… neutral… neutral… pleasant…" Don't try to change anything. Just label.`,
    signOfReadiness: "You catch the feeling-tone of an emotion before you act on it, at least once per day.",
  },
  {
    level: 4,
    title: "Thought Watching",
    sanskrit: "Citta-anupassanā",
    oneLine: "See thoughts as thoughts — not facts, not commands, not you.",
    teaching:
`Most people don't *think* their thoughts. They *are* their thoughts. There's no space between "anger arose" and "I am angry."

The fourth level is the great pivot. You start to see that thoughts are events — like clouds, like sounds, like sneezes. They arise, they hang around, they pass. You don't have to believe them. You don't have to act on them. You don't have to be them.

This is what Krishnamurti called "the observer is the observed" — and then realised the deeper truth: there is only the observing.`,
    microPractice:
`Sit for 3 minutes. Each time a thought arises, silently say "thinking" and return to the breath. Don't fight the thought. Don't follow it. Just name it and let it go.`,
    signOfReadiness: "You notice a thought arising — and choose not to follow it — at least 3 times in a day.",
  },
  {
    level: 5,
    title: "Pattern Watching",
    sanskrit: "Dharma-anupassanā",
    oneLine: "See the loops — the same thought, the same reaction, again and again.",
    teaching:
`Now you start to see something disturbing and liberating at the same time: most of your mental life is on loop.

The same five worries. The same three resentments. The same self-image being defended. The same craving arising at the same time of day. Once you can watch thoughts individually, you start to see they're not random — they're patterns. The Buddhists call these *saṅkhāras*. HOPE calls them loops.

Naming a loop is half of dissolving it. The fifth level of observation is naming the pattern, not just the moment.`,
    microPractice:
`Once today, when you catch yourself in a familiar thought, name the loop out loud: "Ah — the not-enough loop again." "Ah — the rehearsing-the-argument loop." Then drop it like a hot stone.`,
    signOfReadiness: "You can name 3-5 recurring loops in your own mind by name.",
  },
  {
    level: 6,
    title: "Watcher Watching",
    sanskrit: "Sākṣī-bhāva",
    oneLine: "Notice the one who is noticing.",
    teaching:
`Here the path turns inward in a way it hasn't before.

For five levels you've been watching the contents of experience — body, breath, feeling, thought, pattern. Now turn 180 degrees: who is doing the watching?

This is the question Ramana Maharshi spent his life pointing to. Don't try to *answer* it with a concept. Just hold the question and look. The watcher cannot be found as an object — and *that* is the answer. The watcher is what you actually are: aware, present, prior to every thought about yourself.`,
    microPractice:
`Sit. Watch one breath. Then ask gently: "Who is watching?" Don't answer. Just feel where attention turns to look. Rest there for 30 seconds. That's enough.`,
    signOfReadiness: "The question 'who is aware?' stops producing a thought and starts producing a quiet.",
  },
  {
    level: 7,
    title: "Choiceless Awareness",
    sanskrit: "Sahaja-samādhi",
    oneLine: "No watcher, no watched — just awareness aware of itself.",
    teaching:
`At the seventh level, the structure collapses.

There's no longer "me watching my breath." There's just breathing-being-known. No watcher standing apart from the watched. No technique. No effort. Just open, alert, soft awareness — receiving everything, attached to nothing.

This is what Krishnamurti called *choiceless awareness*. What Zen calls *shikantaza* — just sitting. What Advaita calls *sahaja samādhi* — the natural state. It cannot be practiced because it is not a doing. It can only be *recognised* — and then trusted enough to rest in.

The last level is not an achievement. It is the discovery that this is what was here all along.`,
    microPractice:
`Sit without a technique. Don't watch the breath. Don't watch the body. Don't watch the watcher. Just sit. If you notice you're "doing" something, soften. If you notice "I'm not doing anything," soften that too. 3 minutes.`,
    signOfReadiness: "There is no readiness left to measure. You're already here.",
  },
];
