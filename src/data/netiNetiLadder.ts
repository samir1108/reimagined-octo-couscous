// 5-level Neti-Neti ladder — the Upanishadic via negativa.
// "Not this, not this" — the discipline of refusing every false identification
// until what remains cannot be denied.
export type NetiLevel = {
  level: number;
  question: string;
  sanskrit?: string;
  oneLine: string;
  teaching: string;
  microPractice: string;
  commonTrap: string;
};

export const NETI_NETI_LADDER: NetiLevel[] = [
  {
    level: 1,
    question: "I am not this body.",
    sanskrit: "Nāhaṁ dehaḥ",
    oneLine: "The first 'not'. The most obvious one. And the hardest to actually feel.",
    teaching:
`The body is the first costume we mistake for ourselves. We say "I am tall," "I am tired," "I am sick" — as if the body were the I.

But look closely. The body you had at five is gone. The cells that were you a year ago are mostly replaced. The body sleeps and you are still here in the morning. The body will die and the question of *who knows the body* will remain unanswered by biology.

This is not denial of the body. The body is precious. But it is not you. It is yours.`,
    microPractice:
`Sit. Feel the body — weight, breath, temperature. Then say, slowly: "This is the body. I am the one who knows it." Notice the space between the knower and the known. Sit there for one minute.`,
    commonTrap: "Trying to dissociate or 'leave' the body. Neti-neti is not escape — it is precise discrimination. Stay fully embodied while you see clearly.",
  },
  {
    level: 2,
    question: "I am not these emotions.",
    sanskrit: "Nāhaṁ bhāvāḥ",
    oneLine: "Emotions move through you like weather. You are the sky.",
    teaching:
`Anger comes and goes. Sadness arrives and leaves. Joy peaks and fades. If you were any of these, you would disappear when they did.

Watch carefully: you say "I am angry" — but the anger has a beginning, a middle, an end. *You* were here before it. You will be here after it. The anger is something passing through the space of you.

The Upanishads called this the kosha of *prāṇamaya* and *manomaya* — the energetic and emotional sheaths. They are layers, not the core.`,
    microPractice:
`Next time a strong feeling arises, do not push it away. Instead, say silently: "Emotion is here. I am the one in whom it appears." Watch it move. It will pass. You will not.`,
    commonTrap: "Suppression disguised as inquiry. Neti-neti is not 'I am not angry, so I won't feel it.' It is 'anger is arising, and I am the awareness in which it arises.'",
  },
  {
    level: 3,
    question: "I am not these thoughts.",
    sanskrit: "Nāhaṁ cittam",
    oneLine: "Thoughts appear in awareness. The awareness is not made of thoughts.",
    teaching:
`This is the level where most spiritual seekers get stuck for years. Because we *think* about not being our thoughts — using thoughts.

Try this: watch the next thought arise. Where did it come from? Where does it go? You did not author it — it appeared. Like a bird flying across the sky, it crossed the field of awareness and was gone.

If you were the thought, you would die ten thousand times a day. But you do not. Something keeps watching. *That* is closer to who you are.`,
    microPractice:
`Sit and wait for the next thought. Do not chase it, do not push it away. Just see it arise. Ask: "Who saw that?" Don't answer with another thought. Just notice the seeing.`,
    commonTrap: "Trying to stop thoughts. Don't. Let them flow. Neti-neti at this level is about *recognizing* that thoughts are objects appearing to you, not you.",
  },
  {
    level: 4,
    question: "I am not the witness either.",
    sanskrit: "Nāhaṁ sākṣī api",
    oneLine: "The subtlest negation. The witness itself is still a position.",
    teaching:
`At level 3 you found the witness — the one who sees thoughts come and go. Most teachings stop here. But the Upanishads go one more step.

The "witness" is still a *something* — a stance, a position, a subtle "I am the one watching." It is the last and most subtle of all identifications. And it must also be released.

Ramana would point: who is the witness? When you look for the looker, you find no thing — just open knowing. The witness, when looked for, dissolves into pure awareness with no center.`,
    microPractice:
`Sit. Notice you are watching thoughts arise. Then turn around: try to *see* the watcher. Look for the one looking. Hold the question without answering. Let the witness dissolve into looking itself.`,
    commonTrap: "Believing 'I am the witness' is the final answer. It is the second-to-last answer. There is one more 'not.'",
  },
  {
    level: 5,
    question: "What cannot be negated remains.",
    sanskrit: "Neti netītyeva — Tat tvam asi",
    oneLine: "When every 'not' has been said, what remains is what you are.",
    teaching:
`The Bṛhadāraṇyaka Upaniṣad gives the full instruction: *neti, neti* — not this, not this. After every negation, what is left?

Not the body. Not the emotions. Not the thoughts. Not even the witness as a position. And yet — *something* knows that all of these have been negated. Something is the negating. Something remains.

That which cannot be negated, because it is what is doing the negating, is what you are. The Upanishads called it *Tat* — That. And then they whispered the formula every seeker has heard: *Tat tvam asi*. That, you are.

There is no further level. Only deepening recognition, again and again, that what watches everything cannot itself be watched — because it is the watching.`,
    microPractice:
`Sit. No question. No technique. Simply rest as what cannot be removed. If a "you" appears that seems to be resting — negate it too. What is left is what was always here.`,
    commonTrap: "Turning 'Tat tvam asi' into another concept to hold. It is not a belief. It is a recognition that happens when all beliefs have been let go.",
  },
];
