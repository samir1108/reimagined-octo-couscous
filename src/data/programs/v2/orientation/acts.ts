import type { OrientationAct } from "./types";

export const ORIENTATION_ACTS: OrientationAct[] = [
  {
    id: 1,
    title: "Why this exists",
    subtitle: "The worldview before the work",
    sessions: [1, 6],
    milestoneCopy: {
      title: "The map is drawn.",
      body: "You see why this exists. Now we meet the one who watches.",
    },
  },
  {
    id: 2,
    title: "Who is watching?",
    subtitle: "The awareness foundation",
    sessions: [7, 12],
    milestoneCopy: {
      title: "The witness is awake.",
      body: "You can see thoughts now without becoming them. Three intelligences are next.",
    },
  },
  {
    id: 3,
    title: "Three intelligences",
    subtitle: "Head, heart, gut — and the body that holds them",
    sessions: [13, 18],
    milestoneCopy: {
      title: "Three voices known.",
      body: "You can hear each one separately now. Time to see what runs you.",
    },
  },
  {
    id: 4,
    title: "What runs you",
    subtitle: "Loops, shadow, and the path through",
    sessions: [19, 24],
    milestoneCopy: {
      title: "The patterns are visible.",
      body: "You see the machinery. Now we live it.",
    },
  },
  {
    id: 5,
    title: "Living it",
    subtitle: "From practice to a way of being",
    sessions: [25, 30],
    milestoneCopy: {
      title: "The orientation is complete.",
      body: "You know the frameworks. You've felt them. Tomorrow the real spiral begins.",
    },
  },
];

export function getActForSession(sessionIndex: number) {
  return (
    ORIENTATION_ACTS.find(
      (a) => sessionIndex >= a.sessions[0] && sessionIndex <= a.sessions[1],
    ) ?? ORIENTATION_ACTS[0]
  );
}
