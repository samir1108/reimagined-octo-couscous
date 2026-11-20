import type { SensorialManifest } from "./types";
import ramanaImg from "@/assets/masters/ramana.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import witness from "@/assets/sensorial/ramana/04-rest.jpg";
import rest from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";

/**
 * Witness — Sakshi Eye (cross-traditional sit).
 * Pure witnessing practice, no master persona — for users who have moved
 * past needing a guru voice and want raw sakshi-bhav training. ~13 min.
 */
export const witnessSakshiEye: SensorialManifest = {
  key: "witness:sakshi-eye",
  guruId: "witness",
  practiceMatch: "sakshi",
  title: "Sakshi Eye — Pure Witness",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: ramanaImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 13,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit upright. Eyes closed. No master tonight — only the witness inside you, the one that has been silently present in every experience you have ever had. We will simply give that witness the spotlight, for thirteen minutes.",
      caption: "No master. Only the witness.", imageUrl: arrive, holdMs: 18000 },
    { id: "first-pass", modality: "silence",
      narration: "Notice what is being witnessed right now. Sounds in the room. The weight of the body. The breath, moving on its own. Notice that all of this appears in awareness — as if on a screen. The screen does not move when the images move.",
      caption: "All appears on the screen. Screen is still.", imageUrl: witness, holdMs: 90000 },
    { id: "thoughts-as-objects", modality: "silence",
      narration: "Now notice the thoughts. They too are appearing in awareness — small objects with shape and edge. The witness does not think the thought; the witness sees the thought. There is a thin gap between the two. Live in that gap.",
      caption: "Witness sees thought. Live in the gap.", imageUrl: witness, holdMs: 120000 },
    { id: "feelings-as-objects", modality: "silence",
      narration: "Notice the feeling tone, whatever it is. It too is an object in the field of witnessing. The witness is not anxious, not calm, not bored — it simply registers whichever color is present, then registers when it changes.",
      caption: "Feeling is object. Witness is unchanged.", imageUrl: witness, holdMs: 120000 },
    { id: "turn-around", modality: "silence",
      narration: "Now turn the attention around — not to another object, but to the witnessing itself. Who is doing the noticing? Look back along the beam. Do not name it. Do not describe it. Just rest as the looking.",
      caption: "Turn the attention to the witness itself.", imageUrl: witness, holdMs: 240000 },
    { id: "no-effort", modality: "silence",
      narration: "Notice — to be the witness is not an effort. Effort would be another object the witness sees. Drop the effort. What remains, effortless and ever-present, is your true face.",
      caption: "Drop the effort. Effortless witnessing.", imageUrl: witness, holdMs: 150000 },
    { id: "return", modality: "narrate",
      narration: "Slowly let the eyelids lift. Look at the room. Notice — the witness is still here, looking out through your eyes at the room, exactly as it was looking inward a moment ago. Nothing changed. The seer is the same.",
      caption: "Eyes open. The seer is unchanged.", imageUrl: rest, holdMs: 22000 },
  ],
  closing: "Sakshi-bhav — the attitude of the witness — is not a state to enter. It is a fact to recognize. You have just recognized it. The whole rest of the path is letting that recognition settle in deeper, until even the words 'witness' and 'witnessed' fall away.",
};
