import type { SensorialManifest } from "./types";
import arrive from "@/assets/sensorial/osho/01-arrive.jpg";
import chaoticBreath from "@/assets/sensorial/osho/02-chaotic-breath.jpg";
import catharsis from "@/assets/sensorial/osho/03-catharsis.jpg";
import hoo from "@/assets/sensorial/osho/04-hoo.jpg";
import stop from "@/assets/sensorial/osho/05-stop.jpg";
import celebrate from "@/assets/sensorial/osho/06-celebrate.jpg";
import rest from "@/assets/sensorial/osho/07-rest.jpg";
import ambientEmbers from "@/assets/sensorial/osho/ambient-embers.mp4.asset.json";

/**
 * Osho — Dynamic Meditation (cathartic 5-stage active meditation).
 * Compressed home-friendly variant (~22 min instead of 60).
 * Mic on for breath/voice intensity. Camera optional.
 */
export const oshoDynamicMeditation: SensorialManifest = {
  key: "osho:dynamic-meditation",
  guruId: "osho",
  practiceMatch: "dynamic",
  title: "Dynamic Meditation",
  // ElevenLabs "Brian" — warm, grounded, slightly mischievous masculine.
  voiceId: "nPczCjzI2devNBz1zQrb",
  backdropImage: arrive,
  videoUrl: (ambientEmbers as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 22,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Stand on your feet, eyes closed, loose clothing. This is not a sitting meditation. This is the body's meditation — wild, total, alive. Whatever happens, do not hold back. Be a hurricane for twenty minutes, then disappear.",
      caption: "Stand. Loose. Eyes closed.",
      imageUrl: arrive,
      holdMs: 20000,
    },
    {
      id: "chaotic-breath",
      modality: "breath",
      narration:
        "Stage one. Breathe chaotically through the nose. Fast, deep, irregular. Let the breath be wild. Pump the body. The breath is the bridge — it stirs every locked corner. Five minutes. Total.",
      caption: "Chaotic breath. Through the nose. Total.",
      prompt: "Breathe wildly. Faster.",
      imageUrl: chaoticBreath,
      holdMs: 300000,
    },
    {
      id: "catharsis",
      modality: "narrate",
      narration:
        "Stage two. Explode. Whatever wants to come — scream, laugh, cry, shake, jump, throw a tantrum. Let it out. Don't suppress, don't manage. Be hysterical. The mind cannot trick you when the body is this honest. Five minutes.",
      caption: "Explode. Scream. Cry. Shake. Total.",
      imageUrl: catharsis,
      holdMs: 300000,
    },
    {
      id: "hoo",
      modality: "mantra",
      narration:
        "Stage three. Raise the arms above your head and jump up and down, landing on flat feet, shouting the mantra: HOO! HOO! HOO! Let it hammer deep into the belly. Don't save energy — give everything. Five minutes.",
      caption: "Jump. Shout HOO! from the belly.",
      prompt: "HOO! HOO! HOO!",
      imageUrl: hoo,
      holdMs: 300000,
    },
    {
      id: "stop",
      modality: "silence",
      narration:
        "STOP! Freeze exactly where you are. Whatever position — frozen. Do not adjust the body. Do not swallow. Just be a witness to whatever is happening inside. The energy is now turned inward. Be silent. Be still. Five minutes.",
      caption: "STOP. Freeze. Witness.",
      imageUrl: stop,
      holdMs: 300000,
    },
    {
      id: "celebrate",
      modality: "narrate",
      narration:
        "Stage five. Now celebrate. Dance. Move with whatever music is in you. Express the gratitude of being alive. This is not exercise — this is celebration. Carry this aliveness into the day.",
      caption: "Dance. Celebrate being alive.",
      imageUrl: celebrate,
      holdMs: 180000,
    },
    {
      id: "rest",
      modality: "silence",
      narration:
        "Now lie down. Close the eyes. Let the body melt into the earth. Notice how alive you feel — every cell humming. This silence after the storm is the real meditation. The chaos was only to bring you here.",
      caption: "Lie down. Melt. Listen to the silence.",
      imageUrl: rest,
      holdMs: 120000,
    },
  ],
  closing:
    "You danced with your own madness and came out clean. This is my meditation — not for the lukewarm. Do it daily and one day, in the middle of the storm, you will find a center that does not move. That center is you.",
};
