/**
 * Witness — pure presence sit. Cinematic minimal.
 */
import type { CinematicScript } from "../types";

const beat = (text: string, holdMs = 4000) => ({ text, holdMs });
const pause = (holdMs = 3000) => ({ text: "", holdMs, silent: true });

export const witness: CinematicScript = {
  id: "witness-sit",
  practice: "witness",
  label: "Silent Witness",
  defaultDurationSec: 600,
  surface: "black",
  layers: [
    {
      layer: 0,
      title: "Just Watching",
      phases: [
        {
          id: "arrival",
          kind: "arrival",
          beats: [
            beat("Sit. Be still.", 5000),
            beat("Close the eyes.", 4500),
            pause(4000),
            beat("Notice that you are aware.", 6000),
          ],
        },
        {
          id: "deepen",
          kind: "deepen",
          beats: [
            beat("Whatever arises…", 5000),
            beat("…let it arise.", 5500),
            beat("Whatever passes…", 5000),
            beat("…let it pass.", 5500),
            pause(8000),
          ],
          checkpoint: {
            id: "watching",
            question: "Are you the one watching?",
            onYes: [
              beat("Yes…", 4000),
              beat("Stay as that.", 5000),
              pause(10000),
            ],
            onNotYet: [
              beat("Notice the noticing.", 5500),
              beat("That… is you.", 5000),
              pause(8000),
            ],
          },
        },
        {
          id: "rest",
          kind: "integrate",
          beats: [
            pause(15000),
            beat("Nothing to hold.", 5000),
            pause(15000),
          ],
        },
        {
          id: "close",
          kind: "close",
          beats: [
            beat("Slowly… come back.", 5500),
            beat("Open when ready.", 5000),
          ],
        },
      ],
    },
    {
      layer: 1,
      title: "The Witness",
      phases: [
        {
          id: "arrival",
          kind: "arrival",
          beats: [beat("Sit.", 4000), pause(8000)],
        },
        {
          id: "deepen",
          kind: "deepen",
          beats: [
            beat("Watch.", 4500),
            pause(20000),
            beat("Even the watcher… is watched.", 6500),
            pause(20000),
          ],
          checkpoint: {
            id: "stillness",
            question: "Is there stillness here?",
            onYes: [beat("Rest as it.", 5000), pause(15000)],
            onNotYet: [beat("Let go of the search.", 5500), pause(10000)],
          },
        },
        {
          id: "close",
          kind: "close",
          beats: [pause(8000), beat("Open.", 4000)],
        },
      ],
    },
  ],
};
