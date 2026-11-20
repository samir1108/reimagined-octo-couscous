import type {
  AdaptivePath,
  FoundationComponent,
  FoundationDayMeta,
  FoundationDepth,
} from "./types";

interface DayVariant {
  wisdom: string;
  guided: string;
  observation?: string;
  inquiry?: string;
  night: string;
}

/**
 * Authored overrides. These are the days where the difference between
 * registers is the whole point, so they are written, not templated.
 */
const DAY_VARIANTS: Record<number, Partial<Record<FoundationDepth, DayVariant>>> = {
  32: {
    0: {
      wisdom:
        "A recurring thought is a thought the mind keeps repeating. It is not a fact and it is not you. Today you only need to notice one.",
      guided:
        "Sit for five minutes. Each time a thought appears, silently label it: thinking. Do not push it away. When the same thought returns, label it again: same thought.",
      observation: "Write down the one thought that repeated most today.",
      night: "What was the thought that kept returning?",
    },
    1: {
      wisdom:
        "Thoughts repeat because the mind treats a familiar loop as safety. Repetition is a habit of attention, not a verdict about reality.",
      guided:
        "Sit for ten minutes and observe repeats without analysing them. When a thought returns, notice what happened just before it: a sensation, a task, a person, a time of day.",
      observation: "Identify the trigger of one loop. What came just before it?",
      night: "What set the loop off today?",
    },
    2: {
      wisdom:
        "The repeated thought is not the interesting thing. The interesting thing is the sense that it is mine.",
      guided:
        "Sit for ten minutes. When a familiar thought appears, do not follow it. Instead notice the claim underneath: this thought is mine, this thought is true, this thought is me. Stay with the claim, not the content.",
      observation: "Observe the relationship between the thought and the sense of mine.",
      inquiry: "When did this thought first become yours?",
      night: "What did the sense of mine add to the thought?",
    },
    3: {
      wisdom:
        "A thought repeats because something is identified with it. Investigate the identifier, not the thought.",
      guided:
        "Sit for fifteen minutes. Let a recurring thought arise. Ask: who is thinking this? Do not answer with a label. Stay in the looking. If an answer comes, ask again: who is aware of that answer?",
      inquiry: "Is the thinker separate from the thought, or is thinking simply happening?",
      night: "Did you find a thinker, or only more thinking?",
    },
  },
  50: {
    0: {
      wisdom:
        "An emotion is a feeling in the body with a name attached. Today you only need to name what is here.",
      guided:
        "Sit for three minutes. Name what you feel: tight, heavy, warm, restless. Use plain words. Nothing needs to change.",
      observation: "Name one emotion you felt today, in one word.",
      night: "What did you feel most today?",
    },
    1: {
      wisdom:
        "Emotions are not fixed. They begin, peak and end. Most of what we call a mood is the mind re-starting the same wave.",
      guided:
        "Sit for six minutes and watch one emotion move. Notice the moment it starts, the moment it is strongest, and the moment it fades. Do not feed it with thoughts.",
      observation: "Watch one emotion begin, peak and end today.",
      night: "How long did the emotion actually last?",
    },
    2: {
      wisdom:
        "You can be aware of an emotion without becoming it. The witness is the space in which the emotion appears.",
      guided:
        "Sit for ten minutes. Let an emotion be present. Notice the emotion, and notice the one noticing. Do not identify with either. Stay as the space between them.",
      observation: "Witness one emotion without naming it as mine.",
      inquiry: "Who is aware of this emotion?",
      night: "What changed when you stopped calling it mine?",
    },
    3: {
      wisdom:
        "Awareness is prior to experience. The emotion appears in awareness; awareness does not become the emotion.",
      guided:
        "Sit for twelve minutes. Let whatever arises arise. Ask: is awareness itself disturbed by this emotion, or is only the experience disturbed? Stay with the distinction until it is seen, not thought.",
      inquiry: "Is awareness itself affected by what appears in it?",
      night: "What is aware of the emotion, right now?",
    },
  },
};

const PATH_EMPHASIS: Record<AdaptivePath, string> = {
  observer: "Keep returning to bare attention; fewer words, more noticing.",
  inquirer: "Stay with the question longer than is comfortable; do not resolve it.",
  integrator: "End by naming one concrete action you will take today.",
  devotional: "Let the practice be an offering rather than an exercise.",
};

export function buildComponents(
  meta: FoundationDayMeta,
  depth: FoundationDepth,
  path: AdaptivePath
): FoundationComponent[] {
  const override = DAY_VARIANTS[meta.day]?.[depth];
  const theme = meta.theme.toLowerCase();
  const components: FoundationComponent[] = [];

  const wisdom = override?.wisdom ??
    (depth === 0
      ? `${meta.concept}. One idea only: ${theme}. Nothing to believe, nothing to achieve.`
      : depth === 1
        ? `${meta.concept}. Today, notice how ${theme} begins, changes and ends.`
        : depth === 2
          ? `${meta.concept}. Today, notice the one who is aware of ${theme}.`
          : `${meta.concept}. Inquire: is the observer of ${theme} separate from what is observed?`);

  const guided = override?.guided ??
    (depth === 0
      ? `${meta.practice}. Do it simply for a few minutes. Stop when the timer ends.`
      : depth === 1
        ? `${meta.practice}. Stay with the beginning, middle and end of the experience.`
        : depth === 2
          ? `${meta.practice}. Drop the commentary and observe the experience itself.`
          : `${meta.practice}. Do not improve it. Investigate what is aware of it.`);

  components.push({
    kind: "wisdom",
    minutes: depth >= 2 ? 2 : 3,
    title: meta.theme,
    prompt: wisdom,
    evidenceTarget: `day:${meta.day}:concept-read`,
  });

  components.push({
    kind: "guided",
    minutes: depth === 0 ? 4 : depth === 1 ? 6 : depth === 2 ? 10 : 15,
    title: `Practice · ${meta.practice}`,
    prompt: `${guided} ${PATH_EMPHASIS[path]}`,
    evidenceTarget: `day:${meta.day}:practice`,
  });

  if (depth >= 1) {
    components.push({
      kind: "observation",
      minutes: depth === 1 ? 2 : 3,
      title: "Notice it in your day",
      prompt: override?.observation ?? meta.mission,
      evidenceTarget: `day:${meta.day}:observation`,
      optional: true,
    });
  }

  if (depth >= 2) {
    components.push({
      kind: "inquiry",
      minutes: depth === 2 ? 2 : 4,
      title: "Stay with the question",
      prompt:
        override?.inquiry ??
        (depth === 2
          ? `Who is aware of ${theme}?`
          : `Is the one who is aware of ${theme} separate from it? Do not answer; look.`),
      evidenceTarget: `day:${meta.day}:inquiry`,
    });
  }

  components.push({
    kind: "mission",
    minutes: 0,
    title: "Live it outside the app",
    prompt: meta.mission,
    evidenceTarget: `day:${meta.day}:mission`,
    optional: true,
  });

  components.push({
    kind: "night",
    minutes: 2,
    title: "Night reflection",
    prompt: override?.night ?? meta.night,
    evidenceTarget: `day:${meta.day}:night`,
  });

  return components;
}

export function hasAuthoredVariant(day: number): boolean {
  return Boolean(DAY_VARIANTS[day]);
}
