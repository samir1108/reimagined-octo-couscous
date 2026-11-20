import type { SensorialManifest } from "./types";
import thichImg from "@/assets/masters/dogen.jpg";
import arrive from "@/assets/sensorial/buddha/01-arrive.jpg";
import walk from "@/assets/sensorial/buddha/04-whole-body.jpg";
import rest from "@/assets/sensorial/buddha/08-return.jpg";

/**
 * Thich Nhat Hanh — Walking Meditation.
 * Slow conscious walking, breath synced to steps. Indoors or out — even
 * 8 paces forward, 8 back is enough. Camera off, mic optional. ~13 min.
 */
export const thichNhatHanhWalking: SensorialManifest = {
  key: "thich-nhat-hanh:walking",
  guruId: "thich-nhat-hanh",
  practiceMatch: "walking",
  title: "Walking Meditation",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: thichImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 13,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Stand barefoot, or in soft shoes. Find a stretch of floor — even eight paces will do. Hands rest at the sides, or one over the other at the lower belly. Feel both feet meeting the ground completely. We are about to walk as if the earth itself were a temple — because it is.",
      caption: "Stand. Feel both feet on the ground.", imageUrl: arrive, holdMs: 22000 },
    { id: "first-breath", modality: "breath",
      narration: "Three slow breaths, standing. With each exhale, sense the body becoming a little more vertical, a little more honest. We are not going anywhere. We are simply walking — that is the entire destination.",
      caption: "Standing breaths. The walk is the destination.", prompt: "Inhale… exhale…", imageUrl: arrive, holdMs: 36000 },
    { id: "in-step-out-step", modality: "mantra",
      narration: "Begin to walk, very slowly. Two or three steps on the inhale — silently say, in. Two or three steps on the exhale — silently say, out. Feel each foot lift, move, place. Do not look ahead at anything in particular; the gaze rests a few feet in front.",
      caption: "In… in… out… out…", prompt: "In… out…", imageUrl: walk, holdMs: 180000 },
    { id: "arrived", modality: "mantra",
      narration: "Now change the words. As you step in, say: I have arrived. As you step out: I am home. Each step delivers you to the only place you can ever truly be — here. The mind protests; let the feet teach it.",
      caption: "I have arrived. I am home.", prompt: "Arrived… home…", imageUrl: walk, holdMs: 180000 },
    { id: "kissing-the-earth", modality: "mantra",
      narration: "Thich Nhat Hanh said: walk as if you were kissing the earth with your feet. Let each footfall be a small kiss — soft, grateful, complete. The ground that holds you has never once refused you. Return the courtesy.",
      caption: "Kissing the earth with each step.", prompt: "Kiss… kiss…", imageUrl: walk, holdMs: 150000 },
    { id: "stand-still", modality: "silence",
      narration: "Now come to a stop. Stand still. Notice — even though you are no longer walking, the walking continues inside. The body still hums with the rhythm. This hum is mindfulness. It is now in your legs, not just your head.",
      caption: "Stand still. The hum continues.", imageUrl: rest, holdMs: 60000 },
    { id: "close", modality: "narrate",
      narration: "Sit, if you wish, or stay standing. Tomorrow, on one ordinary walk — to the kettle, the bathroom, the door — try three steps of in, three of out. Mindfulness is the single most portable practice. It needs no cushion. It only needs feet.",
      caption: "Tomorrow: three steps to the kettle.", imageUrl: rest, holdMs: 30000 },
  ],
  closing: "There is no way to peace; peace is the way. You just walked the way for thirteen minutes. The path between your bed and the door is now a meditation hall, if you let it be.",
};
