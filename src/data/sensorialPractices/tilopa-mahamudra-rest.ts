import type { SensorialManifest } from "./types";
import tilopaImg from "@/assets/masters/padmasambhava.jpg";
import arrive from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";
import open from "@/assets/sensorial/buddha-bodyscan/05-whole.jpg";
import rest from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";

/**
 * Tilopa — Mahamudra Rest (Six Words of Advice).
 * Don't recall. Don't imagine. Don't think. Don't examine. Don't control.
 * Rest. Pointing-out style — short instructions, long silences. ~14 min.
 */
export const tilopaMahamudraRest: SensorialManifest = {
  key: "tilopa:mahamudra-rest",
  guruId: "tilopa",
  practiceMatch: "mahamudra",
  title: "Mahamudra — Six Words of Rest",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: tilopaImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 14,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Eyes can stay open, gaze soft, into space. Tilopa gave Naropa six words. Each one removes a layer. Tonight we walk through them, slowly, with breath between.",
      caption: "Six words. One layer at a time.", imageUrl: arrive, holdMs: 18000 },
    { id: "dont-recall", modality: "silence",
      narration: "First word. Do not recall. Whatever already happened today — let it sleep. Do not stir the past, even the past of two minutes ago. Rest.",
      caption: "Do not recall.", imageUrl: open, holdMs: 75000 },
    { id: "dont-imagine", modality: "silence",
      narration: "Second. Do not imagine. Whatever has not yet come — let it stay uncome. Do not rehearse the next breath, the next conversation, the next life. Rest.",
      caption: "Do not imagine.", imageUrl: open, holdMs: 75000 },
    { id: "dont-think", modality: "silence",
      narration: "Third. Do not think. If a thought arises by itself, let it arise. Do not pick it up. Do not push it away. Do not add a second thought to it. Rest.",
      caption: "Do not think.", imageUrl: open, holdMs: 90000 },
    { id: "dont-examine", modality: "silence",
      narration: "Fourth. Do not examine. Do not check whether you are doing this rightly. Do not scan inside for progress. The checking is itself a movement. Rest.",
      caption: "Do not examine.", imageUrl: open, holdMs: 90000 },
    { id: "dont-control", modality: "silence",
      narration: "Fifth. Do not control. Whatever is happening — breath, thought, mood, sensation — let it move at its own speed. The hand that grips is itself the friction. Open the hand. Rest.",
      caption: "Do not control.", imageUrl: open, holdMs: 120000 },
    { id: "rest", modality: "silence",
      narration: "Sixth and last. Rest. Not the rest after a long day. The rest that was here before any day began. Recognize: this open, knowing, unfabricated wakefulness — that is your own original face. Rest in it as a child rests in its mother's arms.",
      caption: "Rest. The original face.", imageUrl: rest, holdMs: 240000 },
    { id: "close", modality: "narrate",
      narration: "Slowly bring the gaze back. Move the fingers, the toes. The six words now live in your body. When the next moment of stress comes today, whisper one of them — whichever fits — and notice: the recognition is instantaneous.",
      caption: "Six words. Always available.", imageUrl: arrive, holdMs: 22000 },
  ],
  closing: "Tilopa told Naropa: it is not the appearances that bind you, it is the clinging. Practice these six words for even a few minutes a day, and clinging itself begins to grow tired. What remains is what was always already free.",
};
