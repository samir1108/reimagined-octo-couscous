import type { SensorialManifest } from "./types";
import nagarjunaImg from "@/assets/masters/nagarjuna.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import rest from "@/assets/sensorial/ramana/04-rest.jpg";
import dawn from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";
import traceI from "@/assets/sensorial/ramana/03-trace-i.jpg";
import aham from "@/assets/sensorial/ramana/02-aham.jpg";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";

export const nagarjunaEmptinessGazing: SensorialManifest = {
  key: "nagarjuna:emptiness-gazing",
  guruId: "nagarjuna",
  practiceMatch: "emptiness",
  title: "Emptiness Gazing — Middle Way",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientFlame as { url: string }).url,
  backdropImage: nagarjunaImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 14,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Spine upright. Tonight we sit with Nagarjuna's most radical gift: the insight that nothing has intrinsic existence. Not the thought, not the body, not the 'I' that is sitting here. All is dependently arisen. All is empty of self-nature. We will not think this. We will sit it.",
      caption: "Sit. Everything is dependently arisen.", imageUrl: arrive, holdMs: 20000 },
    { id: "deconstruct-thought", modality: "narrate",
      narration: "Watch the next thought that arises. Notice: it has no substance. It is a cluster of prior causes and conditions — a sound heard, a sensation felt, a memory touched. The thought is not a thing. It is an event. Like a wave, it has no separate existence from the water.",
      caption: "Thought is an event, not a thing.", imageUrl: traceI, holdMs: 30000 },
    { id: "deconstruct-body", modality: "silence",
      narration: "Now turn to the body. Scan it once. Notice: every sensation is a process, not an object. Heat is arising. Pressure is arising. Tingling is arising. No sensation has a permanent owner. The body is a river of sensations. You are not the river. You are the awareness in which the river flows.",
      caption: "Body is a river of sensations.", imageUrl: rest, holdMs: 120000 },
    { id: "deconstruct-self", modality: "narrate",
      narration: "Now the most dangerous turn. Look for the 'I' that is aware. Is it in the head? In the chest? Behind the eyes? Look carefully. What you find is another sensation, another thought, another silence. The seer is not separate from the seen. The awareness and its contents are not two.",
      caption: "Seek the seer. Find no separation.", imageUrl: aham, holdMs: 90000 },
    { id: "middle-way", modality: "silence",
      narration: "Nagarjuna taught two extremes to avoid: eternalism — that things permanently exist — and nihilism — that nothing matters. The Middle Way is this: things neither exist nor non-exist. They are like a dream. In the dream, the horse is real enough. But you do not pick up the horse when you wake. Sit in that knowing.",
      caption: "Neither exist nor non-exist. Like a dream.", imageUrl: dawn, holdMs: 180000 },
    { id: "compassion", modality: "narrate",
      narration: "Emptiness is not cold. Because nothing has a fixed self, everything is free to change. Because nothing is separate, everything is connected. Emptiness is the womb of compassion. When you stop defending a solid self, the heart opens naturally. Not as effort. As relief.",
      caption: "Emptiness is the womb of compassion.", imageUrl: rest, holdMs: 60000 },
    { id: "return", modality: "narrate",
      narration: "Now slowly return. The world of solid things awaits you — tables, people, tasks. But you know now: they are all dependently arisen. You can touch them, love them, work with them, without being fooled by their apparent solidity. The Middle Way is not halfway. It is the only way that does not collapse.",
      caption: "Return. The world is a dream you can love.", imageUrl: dawn, holdMs: 20000 },
  ],
  closing: "You sat with emptiness and it did not eat you. It fed you. This is the paradox Nagarjuna offered: the more you see the void, the fuller the world becomes. Practice this for forty days, and the one who practices will quietly disappear — and what remains is the world, finally seen as it is.",
};
