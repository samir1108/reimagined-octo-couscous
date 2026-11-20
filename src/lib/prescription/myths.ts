/**
 * MYTH CARDS + OBSERVER ARC
 * ─────────────────────────
 * The app corrects expectations before it teaches technique. Meditation is
 * not mind-holding, not sleep, and pain is not progress.
 */

import type { MythCard, ObserverSession } from "./types";

export const MYTH_CARDS: MythCard[] = [
  {
    myth: "Meditation means stopping your thoughts.",
    fact: "Thoughts continue. Meditation is noticing them without following them. Trying to stop thought is more thinking.",
  },
  {
    myth: "You meditate by holding the brain still.",
    fact: "Holding creates tension. Meditation is relaxed attention — not a grip. Effort is used to return, not to freeze.",
  },
  {
    myth: "Meditation is the same as sleep.",
    fact: "Sleep is unconscious rest. Meditation is alert rest. If you are sleepy, sleep first — rest is the practice today.",
  },
  {
    myth: "Pain means the practice is working.",
    fact: "Pain is information. Change posture, shorten the sit, or stop. Discomfort is not a badge.",
  },
];

export const OBSERVER_ARC: ObserverSession[] = [
  {
    title: "You are not what you notice",
    teaching:
      "Sensation, breath, and thought all appear and change. Something in you knows they are changing. That knowing is what we are looking at.",
    practice:
      "Notice three things in order: weight on the seat, air at the nostrils, one thought. Do not change any of them.",
    question: "Who noticed all three?",
    trap: "Do not answer with a concept. The question is a direction, not a quiz.",
    carry: "Once today, say silently: 'thinking' when you catch a thought.",
  },
  {
    title: "Feel the emotion, don't run",
    teaching:
      "An emotion is a sensation plus a story. Feeling it without following the story is the whole practice.",
    practice:
      "Bring to mind one mild irritation. Find where it lives in the body — throat, chest, stomach. Stay with the sensation for one minute.",
    question: "Did the emotion change when you stopped narrating it?",
    trap: "Numbness is not witnessing. If you go blank, open your eyes and feel your feet.",
    carry: "Once today, name one emotion in the body before acting on it.",
  },
  {
    title: "The mind is an object too",
    teaching:
      "A thought has a beginning, middle, and end. You were there before it and after it. So the thought is something you notice — not the whole of you.",
    practice:
      "Sit one minute. When a thought appears, label it 'thinking'. Do not follow it. Return to the next breath.",
    question: "What stayed while the thought came and went?",
    trap: "This is not dissociation. Keep your eyes open if you feel far away, and feel your feet.",
    carry: "Three times today, pause for one breath and ask: 'What is aware right now?'",
  },
  {
    title: "Who is the one who asks?",
    teaching:
      "Self-inquiry turns attention from the answer to the one who asks. 'Who am I?' is a direction of looking, not a quiz.",
    practice:
      "Ask once, softly: 'Who am I?' Do not answer. Notice the direction attention turns when no answer is given.",
    question: "What happened when you did not answer?",
    trap: "Do not replace one concept with another. Stay with the looking.",
    carry: "Once today, ask 'To whom does this come?' at one reaction.",
  },
  {
    title: "Not this, not this",
    teaching:
      "Not this body, not this emotion, not this thought — each 'not this' removes a costume, not the wearer. What remains cannot be named, only noticed.",
    practice:
      "Say slowly: 'This body is known by me. This emotion is known by me. This thought is known by me.' Feel the gap between knower and known.",
    question: "What is left when the known is set aside?",
    trap: "This is discrimination, not denial. Stay embodied; do not float away.",
    carry: "Once today, when you say 'I am tired' or 'I am angry', add silently: 'this is known by me.'",
  },
];
