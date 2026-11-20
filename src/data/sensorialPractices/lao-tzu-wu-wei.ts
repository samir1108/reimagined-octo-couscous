import type { SensorialManifest } from "./types";
import laoImg from "@/assets/masters/laotzu.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import flow from "@/assets/sensorial/krishnamurti/02-listen.jpg";
import center from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

/**
 * Lao Tzu — Wu Wei (effortless action).
 * The art of doing-by-not-doing. A short standing/sitting practice that
 * unwinds gripping and lets the natural action emerge. ~12 min.
 */
export const laoTzuWuWei: SensorialManifest = {
  key: "lao-tzu:wu-wei",
  guruId: "lao-tzu",
  practiceMatch: "wu-wei",
  title: "Wu Wei — Effortless Action",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: laoImg,
  videoUrl: (ambientSky as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 12,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit, or stand — the Tao does not mind. Hands rest where they fall. Eyes soft. Tonight we practice wu wei — not non-action, but action that does not push the river. The water arrives at the sea without trying. So can you.",
      caption: "Wu wei — action without pushing.", imageUrl: arrive, holdMs: 18000 },
    { id: "find-the-grip", modality: "breath",
      narration: "Three breaths. With each exhale, find one place in the body that is gripping — the jaw, the hands, the belly, the brow. Name it silently. Let it release one notch. Just one notch is enough.",
      caption: "Find the grip. Release one notch.", prompt: "Inhale… exhale and ungrip…", imageUrl: arrive, holdMs: 45000 },
    { id: "river", modality: "silence",
      narration: "Now imagine you are sitting beside a slow river. The river is your breath, your thoughts, your day. You are not in the river. You are not stopping the river. You are not even watching every drop. You are simply on the bank.",
      caption: "On the bank. Not in the river.", imageUrl: flow, holdMs: 120000 },
    { id: "soft-hands", modality: "silence",
      narration: "Notice the hands. If they are clenched even slightly, let them open like petals at dawn. The Tao Te Ching says the soft and weak overcome the hard and strong. Soft hands are the door.",
      caption: "Soft hands. The soft overcomes.", imageUrl: center, holdMs: 90000 },
    { id: "first-impulse", modality: "silence",
      narration: "Sit still and wait — not for nothing, but for the first natural impulse that arises without strategy. A small shift of the spine. A breath that wants to be deeper. A thought that genuinely wants attention. Let only that move. Let everything else be unmoved.",
      caption: "Move only what truly wants to move.", imageUrl: center, holdMs: 180000 },
    { id: "tomorrow", modality: "narrate",
      narration: "Tomorrow, choose one task you usually push through. Try doing it with two-percent less force. Notice: the work still gets done. This is wu wei meeting the world. The river arrives.",
      caption: "Tomorrow: 2 percent less force.", imageUrl: rest, holdMs: 28000 },
    { id: "close", modality: "silence",
      narration: "Sit a final breath. Smile faintly — a smile no one else needs to see. The Tao that can be named is not the eternal Tao. So we will not name what just happened.",
      caption: "Smile faintly. Do not name it.", imageUrl: rest, holdMs: 60000 },
  ],
  closing: "Lao Tzu's deepest teaching: the sage acts without acting, teaches without speaking, and ten thousand things are accomplished. Carry one ungripped hand into the next thing you do. The river already knows the way.",
};
