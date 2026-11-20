import type { SensorialManifest } from "./types";
import krishnaImg from "@/assets/masters/krishna.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import offer from "@/assets/sensorial/yogananda/04-mantra.jpg";
import center from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import rest from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

/**
 * Krishna — Karma Yoga Intent (Gita 2.47).
 * Action without attachment to fruit. A short pre-action ritual you can
 * also do at the start of a workday. Mic on for the spoken offering. ~11 min.
 */
export const krishnaKarmaYogaIntent: SensorialManifest = {
  key: "krishna:karma-yoga-intent",
  guruId: "krishna",
  practiceMatch: "karma",
  title: "Karma Yoga — Intent",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: krishnaImg,
  videoUrl: (ambientEye as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 11,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit comfortably. Eyes closed. Krishna told Arjuna in the second chapter: you have a right to action only, never to its fruits. Tonight we plant exactly that line as the seed of tomorrow's day.",
      caption: "Right to action — not to its fruit.", imageUrl: arrive, holdMs: 20000 },
    { id: "settle", modality: "breath",
      narration: "Three slow breaths. Each exhale, set down something you have been carrying as outcome — a result you wanted, a praise you hoped for, a fear of failing. Just for now, set it down at the feet of the inner Krishna.",
      caption: "Set down the outcomes.", prompt: "Inhale… exhale outcomes…", imageUrl: arrive, holdMs: 40000 },
    { id: "name-tomorrow", modality: "voice_reply",
      narration: "Name aloud, briefly, the most important action you will take tomorrow. Not what you wish would happen — what you will do. One sentence is enough.",
      caption: "Name tomorrow's main action.", prompt: "Tomorrow, my action will be…", imageUrl: offer, maxListenMs: 40000 },
    { id: "release-fruit", modality: "voice_reply",
      narration: "Now name the fruit you have secretly been attached to — the result, the recognition, the avoidance of being judged. Speak it. Naming it loosens its grip.",
      caption: "Name the fruit you secretly want.", prompt: "I have been attached to…", imageUrl: offer, maxListenMs: 40000 },
    { id: "offer", modality: "voice_reply",
      narration: "Now — out loud — offer the fruit. To the Divine, to life, to the larger order, however you understand it. The exact words matter less than the willingness. Speak the offering.",
      caption: "Offer the fruit aloud.", prompt: "I offer the fruit of this action to…", imageUrl: center, maxListenMs: 40000 },
    { id: "stand-in-it", modality: "silence",
      narration: "Sit silently with what you just spoke. Notice — the action is still yours. The energy is still yours. Only the grip on the result has been loosened. This is the entire technology of karma yoga, given in three sentences.",
      caption: "Action mine. Result released.", imageUrl: center, holdMs: 90000 },
    { id: "close", modality: "narrate",
      narration: "When you stand up, you will not be a different person. You will be the same person, holding tomorrow's task with one fewer layer of fear. That is enough. Krishna does not ask for more.",
      caption: "Same person. One fewer layer of fear.", imageUrl: rest, holdMs: 25000 },
  ],
  closing: "Yogah karmasu kaushalam — yoga is skill in action. Skill is what is left when fear of the result steps aside. You just rehearsed that stepping-aside. Repeat tomorrow morning before the first task — the day will run differently.",
};
