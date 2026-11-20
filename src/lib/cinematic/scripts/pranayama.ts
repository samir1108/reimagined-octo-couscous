/**
 * Pranayama — authored cinematic script (box breath / nadi shodhana style).
 */
import type { CinematicScript } from "../types";

const beat = (text: string, holdMs = 4000) => ({ text, holdMs });
const pause = (holdMs = 3000) => ({ text: "", holdMs, silent: true });

export const pranayama: CinematicScript = {
  id: "pranayama",
  practice: "breath",
  label: "Pranayama",
  defaultDurationSec: 480,
  surface: "guru-bg",
  layers: [
    {
      layer: 0,
      title: "Conscious Breath",
      phases: [
        {
          id: "arrival",
          kind: "arrival",
          beats: [
            beat("Sit comfortably…", 4500),
            beat("Spine tall, shoulders relaxed.", 5500),
            beat("Close your eyes.", 4000),
            pause(4000),
          ],
        },
        {
          id: "boxbreath",
          kind: "deepen",
          beats: [
            beat("We will breathe in a square…", 5000),
            beat("Inhale… 1, 2, 3, 4.", 6000),
            beat("Hold… 1, 2, 3, 4.", 5500),
            beat("Exhale… 1, 2, 3, 4.", 6000),
            beat("Hold empty… 1, 2, 3, 4.", 5500),
            pause(2500),
            beat("Continue this rhythm.", 5000),
            pause(8000),
            beat("Inhale.", 5000),
            beat("Hold.", 5000),
            beat("Exhale.", 5000),
            beat("Hold.", 5000),
          ],
          checkpoint: {
            id: "comfortable",
            question: "Is the rhythm comfortable?",
            onYes: [beat("Good. Let it deepen, gently.", 5500)],
            onNotYet: [
              beat("That's okay…", 3500),
              beat("Shorten the count to three.", 5500),
              beat("In, three. Hold, three. Out, three.", 6000),
            ],
          },
        },
        {
          id: "rest",
          kind: "integrate",
          beats: [
            beat("Now release the count.", 5000),
            beat("Let the breath return to its own way.", 6000),
            pause(8000),
          ],
        },
        {
          id: "close",
          kind: "close",
          beats: [
            beat("Slowly… open the eyes.", 5500),
            beat("Notice the calm beneath.", 5000),
          ],
        },
      ],
    },
    {
      layer: 1,
      title: "Wave Breath",
      phases: [
        {
          id: "arrival",
          kind: "arrival",
          beats: [beat("Sit. Eyes close.", 4500), pause(5000)],
        },
        {
          id: "wave",
          kind: "deepen",
          beats: [
            beat("Inhale long… exhale longer.", 6000),
            pause(6000),
            beat("Make the exhale twice the inhale.", 6000),
            pause(8000),
            beat("Continue.", 4000),
            pause(12000),
          ],
          checkpoint: {
            id: "calm",
            question: "Is the body softening?",
            onYes: [beat("Stay there.", 4500), pause(6000)],
            onNotYet: [
              beat("Slow the exhale further…", 5500),
              pause(5000),
            ],
          },
        },
        {
          id: "close",
          kind: "close",
          beats: [
            pause(6000),
            beat("Return.", 4500),
            beat("Open when ready.", 5000),
          ],
        },
      ],
    },
  ],
};
