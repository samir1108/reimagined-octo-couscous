import type { SensorialManifest } from "./types";
import flame from "@/assets/sensorial/sadhguru-trataka/01-flame.jpg";
import setup from "@/assets/sensorial/sadhguru-trataka/02-setup.jpg";
import gaze from "@/assets/sensorial/sadhguru-trataka/03-gaze.jpg";
import afterimage from "@/assets/sensorial/sadhguru-trataka/04-afterimage.jpg";
import palming from "@/assets/sensorial/sadhguru-trataka/05-palming.jpg";

/**
 * Sadhguru — Trataka (Candle Gaze)
 * Classical yogic practice of unblinking gaze on a single flame to steady
 * the mind and awaken the third eye. ~10 minutes. Camera optional (presence
 * ring), no mic needed — pure visual sadhana.
 */
export const sadhguruTrataka: SensorialManifest = {
  key: "sadhguru:trataka",
  guruId: "sadhguru",
  practiceMatch: "trataka",
  title: "Trataka — The Steady Gaze",
  voiceId: "guru_male",
  backdropImage: flame,
  sensors: { mic: false, camera: true },
  totalMinutes: 10,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Sit in a darkened room. Place a single candle at arm's length, the flame at the level of your eyes. Spine erect. Shoulders soft. Take three slow breaths.",
      caption: "One flame. One gaze. Begin.",
      imageUrl: setup,
      holdMs: 14000,
    },
    {
      id: "soften",
      modality: "narrate",
      narration:
        "Let the eyes be soft, but steady. You are not staring — you are receiving. Allow the flame to enter you. Do not blink unless you must. When tears come, they are blessing the eyes.",
      caption: "Receive the flame. Do not chase it.",
      imageUrl: setup,
      holdMs: 14000,
    },
    {
      id: "gaze",
      modality: "gaze",
      narration:
        "Now, gaze. Only the flame. Only this moment. If thoughts arise, they pass like smoke around the still light. Stay with the flame for the next four minutes.",
      caption: "Gaze. Only the flame.",
      imageUrl: gaze,
      holdMs: 240000,
    },
    {
      id: "close",
      modality: "narrate",
      narration:
        "Now gently close your eyes. Do not open them. Watch — there, in the dark behind your eyelids, the flame still burns. This is the inner flame. Stay with it.",
      caption: "Close the eyes. The flame remains.",
      imageUrl: afterimage,
      holdMs: 12000,
    },
    {
      id: "afterimage",
      modality: "silence",
      narration:
        "Hold the inner flame at the space between your eyebrows — the third eye. As it fades, do not chase it. Rest in the darkness it leaves behind. Three minutes of inner watching.",
      caption: "Inner flame at the third eye.",
      imageUrl: afterimage,
      holdMs: 180000,
    },
    {
      id: "palm",
      modality: "narrate",
      narration:
        "Rub your palms together until they are warm. Cup them gently over your closed eyes. Feel the warmth. Slowly open your eyes into the darkness of your palms first, then into the world.",
      caption: "Palm the eyes. Return softly.",
      imageUrl: palming,
      holdMs: 14000,
    },
  ],
  closing:
    "Trataka steadies the wandering mind through a single point. Done daily, the flame you gaze on outside becomes the flame that burns within — clear, steady, undisturbed.",
};
