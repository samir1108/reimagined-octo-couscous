import type { SensorialManifest } from "./types";
import patanjaliImg from "@/assets/masters/patanjali.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import settle from "@/assets/sensorial/yogananda/02-settle.jpg";
import inward from "@/assets/sensorial/yogananda/05-pause.jpg";
import center from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import rest from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

/**
 * Patanjali — Pratyahara (5th limb, classical reading).
 * Sister to Vivekananda's Pratyahara, but presented in the dry, sutra-precise
 * voice of Patanjali himself. Different doorway, same room. ~15 min.
 */
export const patanjaliPratyahara: SensorialManifest = {
  key: "patanjali:pratyahara",
  guruId: "patanjali",
  practiceMatch: "pratyahara",
  title: "Pratyahara — The Fifth Limb",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: patanjaliImg,
  videoUrl: (ambientEye as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 15,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit upright. Hands at ease. Eyes closed. Sutra two-fifty-four: when the senses are not in contact with their objects, and they assume, as it were, the form of the mind — that is pratyahara. We do not chase this. We allow the conditions, and pratyahara arrives on its own.",
      caption: "Senses assume the form of the mind.", imageUrl: arrive, holdMs: 22000 },
    { id: "still-the-body", modality: "breath",
      narration: "First: sthira sukham asanam — the seat must be steady and easy. Make a single small adjustment so the body needs no further movement. Three breaths to seal the seat.",
      caption: "Steady and easy. Seal the seat.", prompt: "Inhale… exhale…", imageUrl: settle, holdMs: 40000 },
    { id: "still-the-breath", modality: "breath",
      narration: "Second: lengthen the exhale slightly past the inhale. Four counts in… six counts out. The senses follow the breath. As the breath lengthens, the outward pull weakens.",
      caption: "4 in / 6 out. Senses follow breath.", prompt: "4 in… 6 out…", imageUrl: settle, holdMs: 90000 },
    { id: "withdraw-eyes", modality: "silence",
      narration: "Now turn the eyes — behind closed lids — gently inward and slightly downward, as if looking at the floor of an inner room. The visual field grows soft, undefined. There is nothing to see. The eyes have come home.",
      caption: "Eyes inward. Nothing to see.", imageUrl: inward, holdMs: 90000 },
    { id: "withdraw-ears", modality: "silence",
      narration: "Listen now to the inside of the ear, not to the room. Sounds may pass; let them pass like clouds across a sky you are not looking at. The hearing is in, not out.",
      caption: "Hear the inside of the ear.", imageUrl: inward, holdMs: 90000 },
    { id: "form-of-mind", modality: "silence",
      narration: "Notice — the senses are no longer reporting from outside. They are now turned, as Patanjali says, toward the form of the mind itself. Whatever the mind does, the senses witness internally. You are watching the watcher's screen, from the watcher's seat.",
      caption: "Senses turned toward the mind.", imageUrl: center, holdMs: 240000 },
    { id: "stay", modality: "silence",
      narration: "Stay here as long as the steadiness holds. If a sense bolts outward, do not scold it. Bring it back the way you would coax a wandering child — without word, without anger.",
      caption: "Coax the wandering child home.", imageUrl: center, holdMs: 150000 },
    { id: "return", modality: "narrate",
      narration: "Slowly let the breath return to its natural length. Feel the cushion under you. Hear one specific sound in the room. Open the eyes only when you are ready. Pratyahara, once tasted, is never quite forgotten.",
      caption: "Return slowly. The taste remains.", imageUrl: rest, holdMs: 18000 },
  ],
  closing: "Patanjali calls this the great mastery of the senses. Not their suppression — their reorientation. Practice it ten minutes a day, and concentration, dharana, begins to ripen by itself, without you having to plant a separate seed.",
};
