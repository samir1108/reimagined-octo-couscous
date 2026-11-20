import type { SensorialManifest } from "./types";
import ramakrishnaImg from "@/assets/masters/ramakrishna.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import heart from "@/assets/sensorial/yogananda/04-mantra.jpg";
import rest from "@/assets/sensorial/yogananda/07-return.jpg";

/**
 * Heart — Coherence Breath 5/5 (HRV-friendly resonance breathing).
 * Six breaths per minute, one hand on the heart, gentle gratitude focus.
 * Mic on so the engine can verify pacing. ~10 min.
 */
export const heartCoherence: SensorialManifest = {
  key: "heart:coherence-5-5",
  guruId: "heart",
  practiceMatch: "coherence",
  title: "Heart Coherence — 5/5",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: ramakrishnaImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 10,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit comfortably. Place one hand gently over the center of the chest, where the breastbone meets the heart. The other hand rests in the lap. Eyes closed, or gazing softly down. Tonight we breathe at exactly six breaths a minute — the rhythm at which the heart and breath naturally align.",
      caption: "Hand on heart. 6 breaths per minute.", imageUrl: arrive, holdMs: 22000 },
    { id: "find-pace", modality: "breath",
      narration: "Begin to lengthen the breath. Five slow counts in through the nose. Five slow counts out through the nose, or softly through the mouth. Do not force the volume — just the timing. Five in… five out.",
      caption: "5 in. 5 out. Through the nose.", prompt: "5 in… 5 out…", imageUrl: heart, holdMs: 90000 },
    { id: "into-the-heart", modality: "breath",
      narration: "Now imagine the breath moving in and out through the area under your hand. Inhale, the heart fills with breath. Exhale, the heart releases breath. The breath has changed address from the nose to the chest.",
      caption: "Breathe in and out through the heart.", prompt: "Heart in… heart out…", imageUrl: heart, holdMs: 150000 },
    { id: "add-feeling", modality: "breath",
      narration: "Now add a single feeling on the inhale — a quiet sense of gratitude, appreciation, or care for someone you love. On the exhale, let it radiate out from the chest. The feeling does not have to be large. Even a faint one shifts the whole rhythm.",
      caption: "Inhale care. Exhale radiate.", prompt: "Inhale care… exhale radiate…", imageUrl: heart, holdMs: 240000 },
    { id: "rest-coherent", modality: "silence",
      narration: "Now drop the counting. The body has learned the rhythm. Sit silently and feel the chest rising and falling at its new, slower pace. The heart is now coherent — beating in steady waves, not jagged spikes.",
      caption: "Drop the count. Rest in the rhythm.", imageUrl: heart, holdMs: 90000 },
    { id: "close", modality: "narrate",
      narration: "Slowly let the hand drop. Open the eyes. The vagus nerve has been gently massaged from the inside for ten minutes. The body chemistry is now different from when you sat down. Notice it before the mind covers it over with the next thought.",
      caption: "Notice the chemistry shift.", imageUrl: rest, holdMs: 22000 },
  ],
  closing: "Six breaths per minute is not mystical — it is mechanical. But what the mechanism unlocks is mystical: a steadier heart, a quieter mind, and a measurable drop in the stress signal you broadcast to every cell. Five minutes a day is enough. Ten is luxury.",
};
