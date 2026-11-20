import type { RestProtocol } from "./types";

export const REST_PROTOCOLS: RestProtocol[] = [
  {
    id: "sleep-debt",
    title: "Sleep debt",
    forState: "less than five hours last night",
    minutes: 10,
    instruction:
      "Lie down, eyes closed, and let the body be heavy. Do not try to watch the breath. If sleep comes, sleep.",
    avoid: "Do not sit up to meditate. Do not count breaths to stay awake.",
    carry: "Tonight, go to bed thirty minutes earlier than usual.",
  },
  {
    id: "wired-tired",
    title: "Wired and tired",
    forState: "exhausted but unable to settle",
    minutes: 8,
    instruction:
      "Lie down and lengthen the exhale. Let the body sink on each out-breath. No effort to concentrate.",
    avoid: "Do not chase stillness. Do not add a second practice.",
    carry: "Dim the screen ten minutes before bed.",
  },
  {
    id: "acute-pain",
    title: "Acute pain",
    forState: "pain six or higher",
    minutes: 6,
    instruction:
      "Find a position where the pain is lowest. Feel one neutral place — the hand, the foot — and stay there for three breaths.",
    avoid: "Do not sit through pain. Do not use pain as a measure of progress.",
    carry: "Change position freely and note what helped.",
  },
  {
    id: "panic",
    title: "Panic",
    forState: "heart racing, fear rising",
    minutes: 5,
    instruction:
      "Keep the eyes open. Put both feet on the floor. Name five things you see, three you hear, one you touch.",
    avoid: "No closed eyes. No breath retention. No silence.",
    carry: "Text or call one person and say: 'I am grounding.'",
  },
  {
    id: "post-session",
    title: "After a deep sit",
    forState: "spacious, sensitive, unsteady",
    minutes: 6,
    instruction:
      "Move slowly. Feel the floor. Drink water. Let the room be ordinary before you do anything else.",
    avoid: "Do not drive immediately. Do not chase the state.",
    carry: "Write one line about what changed, then close the notebook.",
  },
  {
    id: "travel",
    title: "Travel",
    forState: "jet lag or disrupted rhythm",
    minutes: 8,
    instruction:
      "Lie down and feel the contact of the body with the bed or seat. Let the breath be natural. Rest is the practice.",
    avoid: "Do not force a schedule. Do not add a new technique.",
    carry: "Get daylight within an hour of waking.",
  },
  {
    id: "screen-fatigue",
    title: "Screen fatigue",
    forState: "eyes burning, mind buzzing",
    minutes: 7,
    instruction:
      "Close the eyes and rest the palms over them. Feel the warmth. Let the jaw unclench.",
    avoid: "Do not scroll in the recovery. Do not substitute a podcast for rest.",
    carry: "Look at something far away for twenty seconds.",
  },
  {
    id: "grief",
    title: "Grief",
    forState: "loss, heaviness, tears near the surface",
    minutes: 9,
    instruction:
      "Sit or lie down and let the feeling be there without narrating it. If tears come, let them. Breathe naturally.",
    avoid: "Do not suppress. Do not force a positive frame.",
    carry: "Tell one safe person one true sentence.",
  },
  {
    id: "illness",
    title: "Illness",
    forState: "body fighting something",
    minutes: 6,
    instruction:
      "Rest flat. Feel the weight of the body. Let the breath be whatever it is. Sleep if it comes.",
    avoid: "No breath retention. No long sitting. No strong body work.",
    carry: "Drink water and cancel one non-essential thing.",
  },
  {
    id: "pregnancy",
    title: "Pregnancy",
    forState: "carrying a child",
    minutes: 8,
    instruction:
      "Lie on the left side or sit supported. Natural breath only. Feel the contact of the body with the surface.",
    avoid: "No breath retention. No intense abdominal work.",
    carry: "Take three natural breaths before each meal.",
  },
  {
    id: "night-waking",
    title: "Night waking",
    forState: "awake at 3 a.m.",
    minutes: 5,
    instruction:
      "Do not check the time. Lie still and feel the bed. Let the exhale be slightly longer. Rest is enough.",
    avoid: "Do not start a practice. Do not open the phone.",
    carry: "Keep the room dark and cool.",
  },
  {
    id: "morning-heaviness",
    title: "Morning heaviness",
    forState: "waking up flat and slow",
    minutes: 7,
    instruction:
      "Sit on the edge of the bed. Feel the feet. Take five natural breaths. Then decide if the body wants movement or rest.",
    avoid: "Do not force a morning practice. Do not judge the heaviness.",
    carry: "Get two minutes of daylight before the first screen.",
  },
];

export const REST_PHRASINGS = [
  "Today, rest first: {text}",
  "The body is asking for this: {text}",
  "Do this and nothing more: {text}",
  "Keep it horizontal: {text}",
  "No technique today: {text}",
  "The whole practice: {text}",
  "If you only do one thing: {text}",
  "For the next few minutes: {text}",
  "Let this be enough: {text}",
  "Rest is the practice: {text}",
  "Skip the sitting and do this: {text}",
  "A smaller ask: {text}",
  "When the body is depleted: {text}",
  "Do not push past this: {text}",
  "Come back to this: {text}",
];

export const REST_LEVELS = [1, 2];
export const REST_DOSES = ["", "For five minutes: ", "For ten minutes: "];
export const REST_AUDIENCES = ["", "If today is heavy: "];
export const REST_TAILS = [
  "",
  " Nothing else is required.",
  " Stop when it stops helping.",
  " Sleep if sleep comes.",
  " Do not add a second practice.",
];

/** 12 × 15 × 2 × 3 × 2 × 5 */
export const REST_CAPACITY =
  REST_PROTOCOLS.length *
  REST_PHRASINGS.length *
  REST_LEVELS.length *
  REST_DOSES.length *
  REST_AUDIENCES.length *
  REST_TAILS.length;
