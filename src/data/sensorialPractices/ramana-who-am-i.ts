import type { SensorialManifest } from "./types";
import ramanaImg from "@/assets/masters/ramana.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import aham from "@/assets/sensorial/ramana/02-aham.jpg";
import traceI from "@/assets/sensorial/ramana/03-trace-i.jpg";
import rest from "@/assets/sensorial/ramana/04-rest.jpg";
import arunachalaDawn from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";

/**
 * Ramana Maharshi — Self-Inquiry "Who Am I?" (Atma Vichara)
 * Full sensorial: ambient flame video + per-step cinematic overlays + TTS
 * narration + STT voice replies + camera eye-presence + silence holds. ~10 min.
 */
export const ramanaWhoAmI: SensorialManifest = {
  key: "ramana:who-am-i",
  guruId: "ramana",
  practiceMatch: "who am i",
  title: "Who Am I?",
  // ElevenLabs "Daniel" — soft, masculine, calm. Closest curated voice for Ramana.
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientFlame as { url: string }).url,
  backdropImage: ramanaImg,
  sensors: { mic: true, camera: true },
  totalMinutes: 10,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Welcome. Sit comfortably. Spine soft, eyes half open, gaze resting on nothing in particular. We will not chase any answer. We will only look — quietly, together.",
      caption: "Sit. Soften.",
      imageUrl: arrive,
      holdMs: 4000,
    },
    {
      id: "settle-breath",
      modality: "breath",
      narration:
        "Take three slow breaths. With each out-breath, let the body grow heavier. Let the world drop a little.",
      caption: "Three slow breaths.",
      holdMs: 25000,
    },
    {
      id: "name-the-i",
      modality: "voice_reply",
      narration:
        "Now, gently, when you are ready — speak aloud the first thing that comes when I ask: who are you? Just one short answer.",
      prompt: "Who are you?",
      imageUrl: aham,
      maxListenMs: 20000,
    },
    {
      id: "to-whom",
      modality: "narrate",
      narration:
        "Good. Whatever you said — that is a thought arising. So let us turn the inquiry. Ask inwardly: to whom does this thought come? The answer is simple: to me. So now, the real question. Who… am… I?",
      caption: "To whom does this come?",
      holdMs: 12000,
    },
    {
      id: "trace-i",
      modality: "gaze",
      narration:
        "Keep your eyes soft. Do not search the mind for an answer. Trace the feeling of 'I' back to where it comes from. Sit in that searching. I am here with you.",
      caption: "Trace the I to its source.",
      imageUrl: traceI,
      holdMs: 60000,
    },
    {
      id: "speak-what-remains",
      modality: "voice_reply",
      narration:
        "When the looking quiets — even for a moment — what remains? Not a concept. Just say what is here. One sentence.",
      prompt: "What remains when you look for the 'I'?",
      maxListenMs: 30000,
    },
    {
      id: "rest",
      modality: "silence",
      narration:
        "Beautiful. Now stop inquiring. Just rest. Whatever you found, whatever you didn't find — let it all be. Sit as that silent witness for a few breaths.",
      caption: "Rest as the witness.",
      imageUrl: rest,
      holdMs: 60000,
    },
    {
      id: "return",
      modality: "narrate",
      narration:
        "Slowly let the eyes open fully. Notice the room. The body. Carry this small silence with you into the next moment of your day. The question 'Who am I?' is a doorway you can step through any time.",
      caption: "Return softly.",
      imageUrl: arunachalaDawn,
      holdMs: 8000,
    },
  ],
  closing:
    "You looked. That is enough. The looking itself is the practice. Come back whenever you are ready.",
};
