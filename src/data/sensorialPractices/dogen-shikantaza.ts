import type { SensorialManifest } from "./types";
import dogenImg from "@/assets/masters/dogen.jpg";
import arrive from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";
import sit from "@/assets/sensorial/buddha-bodyscan/05-whole.jpg";
import rest from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";

/**
 * Dōgen — Shikantaza (just sitting).
 * No object, no technique, no goal. The hardest practice — given last
 * because it requires the others to have softened the mind first. ~17 min.
 */
export const dogenShikantaza: SensorialManifest = {
  key: "dogen:shikantaza",
  guruId: "dogen",
  practiceMatch: "shikantaza",
  title: "Shikantaza — Just Sitting",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: dogenImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 17,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. The posture itself is the practice. Spine erect, the way a stack of coins balances. Chin slightly tucked. Hands in the cosmic mudra at the lower belly, left over right, thumbs barely touching, forming an oval. Eyes half-open, gaze resting on the floor a meter ahead. Mouth gently closed, tongue on the roof. We will not do anything else.",
      caption: "Posture is the practice.", imageUrl: arrive, holdMs: 30000 },
    { id: "settle", modality: "breath",
      narration: "Three full breaths through the nose. Long, full, ordinary. After the third, do not regulate the breath any further. Let it breathe itself, however it likes.",
      caption: "Three breaths. Then let it breathe itself.", prompt: "Inhale… exhale…", imageUrl: sit, holdMs: 36000 },
    { id: "no-object", modality: "silence",
      narration: "Now: no object. Do not follow the breath. Do not count. Do not repeat a mantra. Do not try to empty the mind, do not try to fill it. Simply sit. Whatever arises, arises in the open sky of awareness — sounds, thoughts, sensations, the whole catastrophe — and it passes by itself.",
      caption: "No object. Just sit.", imageUrl: sit, holdMs: 360000 },
    { id: "drop-effort", modality: "silence",
      narration: "Notice if a subtle effort is creeping in — even the effort of trying not to try. Let even that drop. Dōgen said: practice and enlightenment are one. Sitting like this, you are not sitting toward something. The sitting is already it.",
      caption: "Even the effort to not-try — drop.", imageUrl: sit, holdMs: 240000 },
    { id: "stay", modality: "silence",
      narration: "Stay. The mind will wander a thousand times. A thousand times, without comment, without congratulation, you simply notice and return to the upright sitting. That returning, again and again, is the whole of zazen.",
      caption: "Wander. Return. Wander. Return.", imageUrl: sit, holdMs: 240000 },
    { id: "stand-slow", modality: "narrate",
      narration: "Now slowly sway the upper body — small movements first, then larger. Bring the hands to the knees. When you stand, stand with the same care with which you sat. The cushion taught your body something. Walk so the lesson is not lost in the first three steps.",
      caption: "Stand as carefully as you sat.", imageUrl: rest, holdMs: 28000 },
  ],
  closing: "Shikantaza is not the easiest gate; it is the most direct. Sit twenty minutes a day, no more, no less, for one hundred days, and what was sought will quietly stop being sought — because it was already, all along, the one doing the sitting.",
};
