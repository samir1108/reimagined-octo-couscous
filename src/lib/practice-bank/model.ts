/**
 * Orb practice model — the small set of axes the bank multiplies over.
 *
 * Everything here is data. No DOM, no audio, no React, so the same practice
 * resolves identically in the bank, in tests, and on the orb.
 */
import { WORLDS, type WorldId, type BienceWorld } from "@/lib/bience/model";

export type VoiceId = "guru" | "guru_male" | "elder" | "child";

export interface VoiceSpec {
  id: VoiceId;
  label: string;
  hint: string;
  /** Voice key understood by the `tts-speak` edge function. */
  voiceKey: VoiceId;
  /** Guru id used by wallet/persona-aware narration. */
  guruId: string;
}

export const VOICES: readonly VoiceSpec[] = [
  { id: "guru", label: "Guide", hint: "Warm, close, unhurried", voiceKey: "guru", guruId: "sadhguru" },
  { id: "guru_male", label: "Master", hint: "Low and steady", voiceKey: "guru_male", guruId: "ramana" },
  { id: "elder", label: "Elder", hint: "Slow, dry, kind", voiceKey: "elder", guruId: "krishnamurti" },
  { id: "child", label: "Young one", hint: "Light, curious", voiceKey: "child", guruId: "buddha" },
];

export const VOICES_BY_ID: Record<VoiceId, VoiceSpec> = VOICES.reduce(
  (acc, voice) => {
    acc[voice.id] = voice;
    return acc;
  },
  {} as Record<VoiceId, VoiceSpec>,
);

export type DeliveryModeId = "orb" | "inquiry" | "silent" | "breath" | "body" | "open-eyes";

export interface DeliveryMode {
  id: DeliveryModeId;
  label: string;
  hint: string;
  speaks: boolean;
  listens: boolean;
  /** Breath pattern id from the bience model, when the mode is breath-led. */
  breath: "settle" | "box" | "478" | null;
}

export const DELIVERY_MODES: readonly DeliveryMode[] = [
  { id: "orb", label: "Orb-led", hint: "The orb speaks, you follow", speaks: true, listens: false, breath: "settle" },
  { id: "inquiry", label: "Voice inquiry", hint: "The orb asks, you answer aloud", speaks: true, listens: true, breath: "settle" },
  { id: "silent", label: "Silent orb", hint: "No voice, only light and time", speaks: false, listens: false, breath: "settle" },
  { id: "breath", label: "Breath-synced", hint: "Every cue rides the breath", speaks: true, listens: false, breath: "box" },
  { id: "body", label: "Body-led", hint: "Attention moves through the body", speaks: true, listens: false, breath: "478" },
  { id: "open-eyes", label: "Open eyes", hint: "Soft gaze, wider field", speaks: true, listens: false, breath: "settle" },
];

export const MODES_BY_ID: Record<DeliveryModeId, DeliveryMode> = DELIVERY_MODES.reduce(
  (acc, mode) => {
    acc[mode.id] = mode;
    return acc;
  },
  {} as Record<DeliveryModeId, DeliveryMode>,
);

export interface PracticeWorld {
  id: WorldId;
  name: string;
  note: string;
  /** Hue of the world's upper palette stop, used to colour the orb. */
  hue: number;
  root: number;
  scale: readonly number[];
}

export const PRACTICE_WORLDS: readonly PracticeWorld[] = WORLDS.map((world: BienceWorld) => ({
  id: world.id,
  name: world.name,
  note: world.note,
  hue: world.palette[2][0],
  root: world.root,
  scale: world.scale,
}));

export const WORLDS_BY_PRACTICE_ID: Record<WorldId, PracticeWorld> = PRACTICE_WORLDS.reduce(
  (acc, world) => {
    acc[world.id] = world;
    return acc;
  },
  {} as Record<WorldId, PracticeWorld>,
);

/** 1–7, the same depth scale the rest of the app uses. */
export const ORB_LEVELS: readonly number[] = [1, 2, 3, 4, 5, 6, 7];

export interface PracticeSpec {
  index: number;
  atomId: string;
  durationSec: number;
  voiceId: VoiceId;
  modeId: DeliveryModeId;
  worldId: WorldId;
  level: number;
}
