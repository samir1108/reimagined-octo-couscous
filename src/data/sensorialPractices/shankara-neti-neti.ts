import type { SensorialManifest } from "./types";
import shankaraImg from "@/assets/masters/shankaracharya.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import inquire from "@/assets/sensorial/ramana/03-trace-i.jpg";
import witness from "@/assets/sensorial/ramana/04-rest.jpg";
import rest from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";

/**
 * Adi Shankaracharya — Neti Neti (not this, not this).
 * Classical Vedantic via negativa. Strip away every false identification
 * until what cannot be stripped remains. ~16 min.
 */
export const shankaraNetiNeti: SensorialManifest = {
  key: "shankara:neti-neti",
  guruId: "shankara",
  practiceMatch: "neti",
  title: "Neti Neti — Not This, Not This",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: shankaraImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 16,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit upright. Eyes closed. Tonight we use the sword of discrimination — viveka — that Shankara placed in the seeker's hand. We will say to each false self: neti — not this. Not to deny it, but to see clearly what it is not. What cannot be denied is what we are.",
      caption: "Neti neti — the sword of viveka.", imageUrl: arrive, holdMs: 22000 },
    { id: "settle", modality: "breath",
      narration: "Three slow breaths, just to gather. The mind likes to wander — give it a sword to hold and it sharpens.",
      caption: "Three gathering breaths.", prompt: "Inhale… exhale…", imageUrl: arrive, holdMs: 36000 },
    { id: "not-the-body", modality: "silence",
      narration: "Begin. Notice the body — its weight on the seat, its temperature, its slight movements with the breath. The body is changing every moment. Cells die, cells are born. You witness all of this. Therefore — neti. I am not this body. The body is in me; I am not in it.",
      caption: "Neti — I am not this body.", imageUrl: inquire, holdMs: 90000 },
    { id: "not-the-breath", modality: "silence",
      narration: "Notice the breath. It comes, it goes, in waves. Sometimes deep, sometimes shallow. You witness the breathing, you do not produce it. Neti. I am not this breath. Breath is in me; I am not in it.",
      caption: "Neti — I am not this breath.", imageUrl: inquire, holdMs: 75000 },
    { id: "not-the-emotions", modality: "silence",
      narration: "Notice the feeling tone present right now — calm, restless, heavy, light. Whatever it is, it has a shape, an edge, a duration. You witness the feeling. Neti. I am not this feeling. Feelings pass through me; they are not me.",
      caption: "Neti — I am not these feelings.", imageUrl: inquire, holdMs: 90000 },
    { id: "not-the-thoughts", modality: "silence",
      narration: "Notice the thoughts that arise. Each one is a small object in the field of awareness — it appears, lingers, dissolves. You witness them. Neti. I am not these thoughts. Thoughts are guests; I am the room.",
      caption: "Neti — I am not these thoughts.", imageUrl: inquire, holdMs: 90000 },
    { id: "not-the-witness", modality: "silence",
      narration: "Now the most subtle stroke. Even the sense of being a witness — a someone who is watching all this — that too is an idea, a slight tightening. Neti, even to that. What is left, when even the witness-idea is laid down? Not nothing. Pure, undivided knowing. That you cannot deny.",
      caption: "Even the witness — neti. What remains?", imageUrl: witness, holdMs: 180000 },
    { id: "rest-in-that", modality: "silence",
      narration: "Rest now in what cannot be denied. Shankara called it sat-chit-ananda — being, awareness, fullness. You do not have to produce it. It has been here, behind every neti, the whole time. This — and only this — is what you are.",
      caption: "Rest in what cannot be denied.", imageUrl: witness, holdMs: 180000 },
    { id: "return", modality: "narrate",
      narration: "Slowly let the body sounds return. The breath, the seat, the room. But now you know: all of this is in you. Not the other way around. Open the eyes when ready, but keep the inner ledger straight.",
      caption: "Open the eyes. Keep the ledger straight.", imageUrl: rest, holdMs: 22000 },
  ],
  closing: "Brahma satyam, jagan mithya, jivo brahmaiva na'parah — Shankara's seal. Reality is one; the world is appearance; you are not other than that One. Neti neti was the negation. The affirmation lives in the silence after every word.",
};
