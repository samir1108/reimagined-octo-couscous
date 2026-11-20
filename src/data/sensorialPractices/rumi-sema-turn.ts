import type { SensorialManifest } from "./types";
import rumiImg from "@/assets/masters/rumi.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import turn from "@/assets/sensorial/krishnamurti/03-see.jpg";
import center from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

/**
 * Rumi — Sema (gentle standing turn).
 * Compressed home-friendly Sufi whirling: stand, one slow rotation per
 * 4 breaths, right palm up to receive, left palm down to give. Mic on
 * (heavy breathing → engine slows pace), camera off. ~12 min.
 */
export const rumiSemaTurn: SensorialManifest = {
  key: "rumi:sema-turn",
  guruId: "rumi",
  practiceMatch: "sema",
  title: "Sema — The Slow Turn",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: rumiImg,
  videoUrl: (ambientSky as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 12,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Stand barefoot. A clear arm's length around you in every direction. Eyes soft, half-open. The right palm faces the sky — to receive from the unseen. The left palm faces the earth — to pour what is received back into the world. Between these two hands, you become the pen that writes Love's letter.",
      caption: "Right palm up. Left palm down.", imageUrl: arrive, holdMs: 22000 },
    { id: "ground", modality: "breath",
      narration: "Three breaths to root. Inhale — feel the ground rise into the soles. Exhale — feel the crown lengthen toward the sky. Become a slow axle between earth and heaven.",
      caption: "Three rooting breaths.", prompt: "Inhale rise… exhale lengthen…", imageUrl: arrive, holdMs: 36000 },
    { id: "first-turn", modality: "mantra",
      narration: "Begin to turn — to your left, very slowly. One full rotation across four long breaths. The left foot is the pivot, steady as a candle's wick. The right foot draws the circle. Whisper inwardly: Allah… Hu… or simply, Beloved… Beloved…",
      caption: "Slow left turn. 4 breaths per rotation.", prompt: "Beloved… Beloved…", imageUrl: turn, holdMs: 240000 },
    { id: "deepen", modality: "mantra",
      narration: "If a wave of dizziness comes, do not fight it — soften the gaze further, breathe deeper. The world spins; the heart at the center does not. Find that still point inside the chest. The turn is happening around it, not to it.",
      caption: "World spins. Heart stays still.", prompt: "Beloved…", imageUrl: turn, holdMs: 240000 },
    { id: "stop", modality: "silence",
      narration: "Slowly come to rest. Hands cross gently over the chest, right over left. Eyes closed. The body still moves a little, like a ship that just dropped anchor. Stand and feel everything settle into the harbor of the heart.",
      caption: "Hands cross the heart. Stand and settle.", imageUrl: center, holdMs: 90000 },
    { id: "sit", modality: "silence",
      narration: "Now sit, however you like. The Friend you turned for is closer than your jugular vein. There is nothing left to chase. Rest in the company you just invited.",
      caption: "Sit. The Friend is here.", imageUrl: rest, holdMs: 90000 },
  ],
  closing: "You did not whirl to escape the world; you whirled to remember the still point at its center. Carry that point into one ordinary moment today — the kettle, the doorway, the first sip — and the Sema continues without your feet.",
};
