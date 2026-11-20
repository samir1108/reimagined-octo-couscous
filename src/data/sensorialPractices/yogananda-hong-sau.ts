import type { SensorialManifest } from "./types";
import yoganandaImg from "@/assets/masters/yogananda.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import settle from "@/assets/sensorial/yogananda/02-settle.jpg";
import watch from "@/assets/sensorial/yogananda/03-watch.jpg";
import mantra from "@/assets/sensorial/yogananda/04-mantra.jpg";
import pause from "@/assets/sensorial/yogananda/05-pause.jpg";
import pureAwareness from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import returnImg from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

/**
 * Paramahansa Yogananda — Hong-Sau Meditation
 * Mantra-with-breath internalization. Full sensorial: TTS guidance,
 * mic breath meter for syncing Hong/Sau, optional camera for stillness presence.
 * ~14 minutes.
 */
export const yoganandaHongSau: SensorialManifest = {
  key: "yogananda:hong-sau",
  guruId: "yogananda",
  practiceMatch: "hong-sau",
  title: "Hong-Sau Meditation",
  // ElevenLabs "Daniel" — warm, devotional, masculine.
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: yoganandaImg,
  videoUrl: (ambientEye as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 14,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Beloved one, sit upright. Spine straight as a young tree, chin parallel to the floor. Place the hands palms upward on the thighs. Close the eyes gently and lift the gaze slightly upward, toward the point between the eyebrows. We are going home.",
      caption: "Sit upright. Gaze at the third eye.",
      imageUrl: arrive,
      holdMs: 12000,
    },
    {
      id: "settle",
      modality: "breath",
      narration:
        "Take three deep breaths. Inhale slowly, tense the whole body, then exhale and let everything drop. Three times. Surrender the body to stillness.",
      caption: "Three tense-and-release breaths.",
      imageUrl: settle,
      holdMs: 30000,
    },
    {
      id: "watch-natural",
      modality: "breath",
      narration:
        "Now do not control the breath at all. Simply watch it. The breath knows how to breathe itself. Become the silent observer at the doorway of the nostrils. Feel the cool air entering, the warm air leaving.",
      caption: "Watch the breath. Do not control it.",
      imageUrl: watch,
      holdMs: 45000,
    },
    {
      id: "introduce-mantra",
      modality: "narrate",
      narration:
        "Now we add the sacred mantra. Hong — pronounced as the breath comes in. Sau — pronounced as the breath goes out. Hong… Sau. This is not chanting. It is a mental whisper, perfectly synchronized with the natural breath.",
      caption: "Hong (in) — Sau (out).",
      imageUrl: mantra,
      holdMs: 15000,
    },
    {
      id: "practice-mantra",
      modality: "mantra",
      narration:
        "Begin now. Mentally repeat Hong on the in-breath, Sau on the out-breath. Whatever the breath does — long, short, deep, shallow — Hong-Sau follows it like a faithful shadow. Continue.",
      caption: "Hong… Sau… Hong… Sau…",
      prompt: "Hong (in) — Sau (out)",
      imageUrl: mantra,
      holdMs: 240000,
    },
    {
      id: "deepen",
      modality: "silence",
      narration:
        "As the breath slows on its own — and it will — your awareness deepens. Do not push. Do not pull. Just keep the gentle Hong-Sau watch. The breath may grow so subtle it almost disappears. This is good. This is the doorway.",
      caption: "Let the breath quiet on its own.",
      imageUrl: pause,
      holdMs: 180000,
    },
    {
      id: "pause-between",
      modality: "silence",
      narration:
        "Now pay attention to the small pause between breaths — the natural stillness after the exhale, before the next inhale. That pause is your true home. Rest there as long as it lasts. Then Hong-Sau resumes, naturally.",
      caption: "Rest in the pause between breaths.",
      imageUrl: pause,
      holdMs: 120000,
    },
    {
      id: "drop-mantra",
      modality: "silence",
      narration:
        "Slowly let the mantra fade. Let even the watching fade. Sit as pure awareness at the point between the eyebrows. Bathe in the inner light, the inner peace. This is who you are beneath every thought.",
      caption: "Rest as pure awareness.",
      imageUrl: pureAwareness,
      holdMs: 90000,
    },
    {
      id: "return",
      modality: "narrate",
      narration:
        "Slowly take a deeper breath. Rub the palms together gently and place them over the closed eyes. Open the eyes into the warm darkness of the palms, then into the room. Carry this peace into every action of the day. The kingdom is within you.",
      caption: "Return slowly. Carry the peace.",
      imageUrl: returnImg,
      holdMs: 15000,
    },
  ],
  closing:
    "You watched the breath, you whispered the sacred name, you rested in the silence behind both. This is Kriya in seed form. Practice daily, beloved — the airplane route to God is the simplest one.",
};
