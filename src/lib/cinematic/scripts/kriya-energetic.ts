/**
 * Energetic Kriya — authored cinematic script.
 * Three fractal layers (L0..L2). Engine picks based on user kriya-level.
 */
import type { CinematicScript } from "../types";

const beat = (text: string, holdMs = 4000) => ({ text, holdMs });
const pause = (holdMs = 3000) => ({ text: "", holdMs, silent: true });

export const kriyaEnergetic: CinematicScript = {
  id: "kriya-energetic",
  practice: "kriya",
  label: "Energetic Kriya",
  defaultDurationSec: 600,
  surface: "guru-bg",
  layers: [
    // ─── L0 — full hand-holding ───────────────────────────────
    {
      layer: 0,
      title: "First Touch",
      phases: [
        {
          id: "arrival",
          kind: "arrival",
          beats: [
            beat("Sit upright…", 4500),
            beat("Spine tall. Shoulders soft.", 5000),
            pause(3000),
            beat("Close your eyes…", 4000),
            beat("Let the breath find its own rhythm.", 6000),
          ],
        },
        {
          id: "deepen-1",
          kind: "deepen",
          beats: [
            beat("Notice the breath at the nose…", 5500),
            beat("Cool on the way in…", 4500),
            beat("Warm on the way out…", 5000),
            pause(3500),
          ],
          checkpoint: {
            id: "feel-breath",
            question: "Can you feel the breath at the nose?",
            onYes: [beat("Good… Stay with that.", 4500)],
            onNotYet: [
              beat("That's okay…", 3500),
              beat("Place a finger just below the nose…", 5000),
              beat("Feel the air pass.", 5000),
            ],
          },
        },
        {
          id: "kriya-core",
          kind: "deepen",
          beats: [
            beat("Now, breathe in slowly through the nose…", 6000),
            beat("Fill the belly… then the chest.", 6000),
            beat("Hold… gently.", 5000),
            beat("Release through the mouth, slow.", 6000),
            pause(2500),
            beat("Again.", 3500),
            beat("In through the nose…", 6000),
            beat("Hold…", 4000),
            beat("Out through the mouth.", 6000),
            pause(4000),
            beat("Continue this cycle…", 5000),
            beat("Your own pace.", 5000),
          ],
          checkpoint: {
            id: "settling",
            question: "Is the body beginning to settle?",
            onYes: [
              beat("Good…", 3500),
              beat("Now let the breath quieten on its own.", 5500),
            ],
            onNotYet: [
              beat("That's okay…", 3500),
              beat("Soften the jaw…", 4500),
              beat("Let the shoulders drop.", 5000),
            ],
          },
        },
        {
          id: "integrate",
          kind: "integrate",
          beats: [
            pause(4000),
            beat("Sit in what remains.", 5000),
            beat("Nothing to do.", 5000),
            pause(5000),
          ],
        },
        {
          id: "close",
          kind: "close",
          beats: [
            beat("Slowly… bring awareness back.", 5500),
            beat("Notice the body sitting here.", 5000),
            beat("When you are ready… open the eyes.", 6000),
            pause(3000),
            beat("Carry this stillness with you.", 5000),
          ],
        },
      ],
    },
    // ─── L1 — less narration, more space ──────────────────────
    {
      layer: 1,
      title: "Settling In",
      phases: [
        {
          id: "arrival",
          kind: "arrival",
          beats: [
            beat("Sit. Spine tall.", 4500),
            pause(4000),
            beat("Eyes close.", 4000),
            beat("Breath… as it is.", 5500),
            pause(5000),
          ],
        },
        {
          id: "kriya-core",
          kind: "deepen",
          beats: [
            beat("In through the nose… deep.", 6000),
            beat("Hold.", 4000),
            beat("Out through the mouth… slow.", 6000),
            pause(4000),
            beat("Continue.", 4000),
            pause(8000),
            beat("Let the rhythm carry you.", 5000),
            pause(10000),
          ],
          checkpoint: {
            id: "presence",
            question: "Are you present with the breath?",
            onYes: [beat("Then let the breath dissolve into space.", 6000)],
            onNotYet: [
              beat("Return…", 3500),
              beat("To the next inhale.", 5000),
            ],
          },
        },
        {
          id: "integrate",
          kind: "integrate",
          beats: [
            pause(6000),
            beat("Witness what remains.", 5500),
            pause(8000),
          ],
        },
        {
          id: "close",
          kind: "close",
          beats: [
            beat("Slowly return.", 5000),
            beat("When ready… open.", 5500),
          ],
        },
      ],
    },
    // ─── L2 — minimalist, mostly silence ──────────────────────
    {
      layer: 2,
      title: "The Subtle",
      phases: [
        {
          id: "arrival",
          kind: "arrival",
          beats: [
            beat("Sit.", 4000),
            pause(6000),
            beat("Breathe.", 4000),
            pause(8000),
          ],
        },
        {
          id: "kriya-core",
          kind: "deepen",
          beats: [
            beat("In… hold… out.", 7000),
            pause(10000),
            beat("Again.", 4000),
            pause(12000),
            beat("Notice the space between breaths.", 6000),
            pause(15000),
          ],
          checkpoint: {
            id: "space",
            question: "Can you feel the space?",
            onYes: [
              beat("Rest there.", 4500),
              pause(8000),
            ],
            onNotYet: [
              beat("Return to the breath.", 5000),
              pause(6000),
            ],
          },
        },
        {
          id: "integrate",
          kind: "integrate",
          beats: [pause(15000), beat("Just this.", 5000), pause(10000)],
        },
        {
          id: "close",
          kind: "close",
          beats: [
            beat("…", 4000),
            beat("Open.", 4000),
          ],
        },
      ],
    },
  ],
};
