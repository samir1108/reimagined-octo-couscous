import type { SensorialManifest } from "./types";
import buddhaImg from "@/assets/masters/buddha.jpg";
import arrive from "@/assets/sensorial/buddha/01-arrive.jpg";
import noticeBreath from "@/assets/sensorial/buddha/02-notice-breath.jpg";
import longBreath from "@/assets/sensorial/buddha/03-long-breath.jpg";
import wholeBody from "@/assets/sensorial/buddha/04-whole-body.jpg";
import calm from "@/assets/sensorial/buddha/05-calm.jpg";
import joy from "@/assets/sensorial/buddha/06-joy.jpg";
import impermanence from "@/assets/sensorial/buddha/07-impermanence.jpg";
import returnImg from "@/assets/sensorial/buddha/08-return.jpg";
import ambientBodhi from "@/assets/sensorial/buddha/ambient-bodhi.mp4.asset.json";

/**
 * Gautama Buddha — Anapanasati (Mindfulness of Breathing)
 * Full sensorial: TTS narration + mic breath meter + breathing orb.
 * Camera optional for posture presence. ~12 minutes.
 */
export const buddhaAnapanasati: SensorialManifest = {
  key: "buddha:anapanasati",
  guruId: "buddha",
  practiceMatch: "anapanasati",
  title: "Anapanasati — Mindfulness of Breathing",
  // ElevenLabs "George" — calm, grounded, masculine.
  voiceId: "JBFqnCBsd6RMkjVDRZzb",
  backdropImage: buddhaImg,
  videoUrl: (ambientBodhi as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 12,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Sit comfortably. Spine upright but not rigid, like a tree growing toward the sky. Let the hands rest. Let the eyes close softly, or lower the gaze. We are simply going to watch the breath. Nothing more.",
      caption: "Sit. Spine soft and upright.",
      imageUrl: arrive,
      holdMs: 8000,
    },
    {
      id: "first-noticing",
      modality: "narrate",
      narration:
        "Do not try to change the breath. Just notice — is it long, or is it short? Coarse, or fine? Whatever it is, that is what we work with.",
      caption: "Notice the breath as it is.",
      imageUrl: noticeBreath,
      holdMs: 10000,
    },
    {
      id: "long-breath",
      modality: "breath",
      narration:
        "Now, breathing in long, know: I am breathing in long. Breathing out long, know: I am breathing out long. Stay with three full long breaths.",
      caption: "Long in. Long out.",
      imageUrl: longBreath,
      holdMs: 30000,
    },
    {
      id: "short-breath",
      modality: "breath",
      narration:
        "Now let the breath become short and natural. Breathing in short, know: I am breathing in short. Breathing out short, know: I am breathing out short.",
      caption: "Short in. Short out.",
      holdMs: 30000,
    },
    {
      id: "whole-body",
      modality: "breath",
      narration:
        "Breathe in, sensitive to the whole body. Breathe out, sensitive to the whole body. The breath is not only at the nose — it ripples through every cell.",
      caption: "Whole body breathing.",
      imageUrl: wholeBody,
      holdMs: 45000,
    },
    {
      id: "calm-body",
      modality: "breath",
      narration:
        "Breathe in, calming the bodily formation. Breathe out, calming the bodily formation. With each out-breath, soften one layer.",
      caption: "Calming the body.",
      imageUrl: calm,
      holdMs: 60000,
    },
    {
      id: "joy",
      modality: "narrate",
      narration:
        "Breathe in, sensitive to joy. Breathe out, sensitive to joy. Even a small smile at the edge of the mouth — let it arise. Joy is not an achievement; it is what surfaces when the mind stops fighting.",
      caption: "Sensitive to joy.",
      imageUrl: joy,
      holdMs: 30000,
    },
    {
      id: "rest-mind",
      modality: "silence",
      narration:
        "Now stop directing. Simply sit with the breath as your friend. If the mind wanders, gently — without blame — return. The breath is always here, waiting.",
      caption: "Rest with the breath.",
      holdMs: 90000,
    },
    {
      id: "impermanence",
      modality: "narrate",
      narration:
        "Notice: this breath, the one happening right now, will never come again. Each breath arises and passes. Watching this is watching the truth of all things.",
      caption: "Each breath arises and passes.",
      imageUrl: impermanence,
      holdMs: 20000,
    },
    {
      id: "return",
      modality: "narrate",
      narration:
        "Slowly widen your awareness. Hear the sounds around you. Feel the body sitting. When you are ready, open the eyes. Carry this gentle attention with you. The breath will be there whenever you wish to return.",
      caption: "Return softly.",
      imageUrl: returnImg,
      holdMs: 10000,
    },
  ],
  closing:
    "You watched the breath. You watched the watcher. That is the whole path, in miniature. Walk in mindfulness.",
};
