import type { SensorialManifest } from "./types";
import rest from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";
import crown from "@/assets/sensorial/buddha-bodyscan/02-crown.jpg";
import torso from "@/assets/sensorial/buddha-bodyscan/03-torso.jpg";
import feet from "@/assets/sensorial/buddha-bodyscan/04-feet.jpg";
import whole from "@/assets/sensorial/buddha-bodyscan/05-whole.jpg";

/**
 * Buddha — Body Scan (Kāyānupassanā / Vipassanā sweep)
 * Slow head-to-toe sweep of bare attention through the body. ~12 minutes.
 * No mic, no camera. Pure inner sensation observation.
 */
export const buddhaBodyScan: SensorialManifest = {
  key: "buddha:body-scan",
  guruId: "buddha",
  practiceMatch: "body scan",
  title: "Body Scan — Sweep of Awareness",
  voiceId: "guru_male",
  backdropImage: rest,
  sensors: { mic: false, camera: false },
  totalMinutes: 12,
  steps: [
    {
      id: "settle",
      modality: "narrate",
      narration:
        "Lie down on your back, or sit upright if you prefer. Let the body be still. Close the eyes. Feel the weight of the body resting on the earth. Three slow breaths.",
      caption: "Arrive. Let the body be still.",
      imageUrl: rest,
      holdMs: 18000,
    },
    {
      id: "crown",
      modality: "narrate",
      narration:
        "Bring attention to the very top of the head — the crown. Notice any sensation. Tingling. Warmth. Pressure. Or nothing at all. Whatever is there, simply observe. Do not judge.",
      caption: "The crown of the head.",
      imageUrl: crown,
      holdMs: 60000,
    },
    {
      id: "face",
      modality: "narrate",
      narration:
        "Move down through the forehead, the eyes, the cheeks, the jaw. Let each part soften as awareness touches it. The tongue rests. The throat opens.",
      caption: "Forehead. Eyes. Jaw.",
      imageUrl: crown,
      holdMs: 60000,
    },
    {
      id: "shoulders",
      modality: "narrate",
      narration:
        "Sweep down through the shoulders. Down each arm — upper arm, elbow, forearm, wrist. Through each finger to the very tips. Feel the fingertips alive.",
      caption: "Shoulders. Arms. Fingertips.",
      imageUrl: torso,
      holdMs: 90000,
    },
    {
      id: "torso",
      modality: "silence",
      narration:
        "Now the chest. The heart space. The belly rising and falling. The whole back resting. Let awareness move slowly, like warm honey, through the entire torso.",
      caption: "Chest. Belly. Back.",
      imageUrl: torso,
      holdMs: 120000,
    },
    {
      id: "legs",
      modality: "narrate",
      narration:
        "Move down through the hips. Through each thigh, knee, calf. Down to the ankles, the heels, the soles. Out through every toe.",
      caption: "Hips. Legs. Toes.",
      imageUrl: feet,
      holdMs: 90000,
    },
    {
      id: "whole",
      modality: "silence",
      narration:
        "Now feel the whole body at once. A field of sensation. Nothing to fix. Nothing to change. Just this living body, breathing itself. Rest here.",
      caption: "The whole body, alive.",
      imageUrl: whole,
      holdMs: 120000,
    },
    {
      id: "return",
      modality: "narrate",
      narration:
        "Gently wiggle the fingers and toes. Take a deeper breath. When you are ready, open the eyes — bringing this awareness with you into the next moment.",
      caption: "Return softly.",
      imageUrl: rest,
      holdMs: 16000,
    },
  ],
  closing:
    "The body is the first foundation of mindfulness. By sweeping attention through it, again and again, you train the mind to rest in direct sensation — the doorway to insight.",
};
