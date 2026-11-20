import type { SensorialManifest } from "./types";
import jnaneshwarImg from "@/assets/masters/jnaneshwar.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import settle from "@/assets/sensorial/yogananda/02-settle.jpg";
import watch from "@/assets/sensorial/yogananda/03-watch.jpg";
import pureAwareness from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import returnImg from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

export const jnaneshwarPasayadan: SensorialManifest = {
  key: "jnaneshwar:pasayadan",
  guruId: "jnaneshwar",
  practiceMatch: "pasayadan",
  title: "Pasayadan — Jnaneshwar's Gift",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientEye as { url: string }).url,
  backdropImage: jnaneshwarImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 11,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Jnaneshwar, the twelve-year-old saint of Maharashtra, wrote the Pasayadan — the world's only wish-granting prayer that asks for nothing. He said: may the whole world be blessed, not just me. May everyone see the Divine, not just the sage. Tonight we sit with that impossible generosity. It is not impossible. It is the natural state of the realized heart.",
      caption: "Pasayadan — wish for nothing. Bless everything.", imageUrl: arrive, holdMs: 20000 },
    { id: "feel-the-wish", modality: "narrate",
      narration: "Read these words inwardly, slowly: 'May the whole world be happy. May the whole world be free from disease. May the whole world see the auspicious. May no one be afflicted.' This was Jnaneshwar's wish. He asked for nothing for himself. Feel that. Not as sentiment. As a taste. The taste of a heart that has stopped wanting.",
      caption: "May the whole world be happy.", imageUrl: settle, holdMs: 60000 },
    { id: "surrender-wanting", modality: "breath",
      narration: "Three breaths. On each exhale, surrender one thing you want. Not the noble things. The real ones — the praise, the success, the relief, the recognition. Let them go. You do not need them. The heart that is full of wishing cannot receive the blessing that is already here. Empty the cup. It is the only way to fill it.",
      caption: "Surrender one want with each exhale.", prompt: "Exhale… let it go…", imageUrl: settle, holdMs: 90000 },
    { id: "bless-one-person", modality: "voice_reply",
      narration: "Choose one person. Not the easiest one. The one you find hardest to bless. Now bless them. Out loud, briefly. Not 'I hope they change.' Just: 'May you be happy. May you be free.' Say it. The blessing is not for them. It is for you. The heart that blesses the enemy cannot hold a grudge.",
      caption: "Bless the hardest person. Out loud.", prompt: "I bless you with…", imageUrl: watch, maxListenMs: 30000 },
    { id: "bless-the-world", modality: "narrate",
      narration: "Now widen. Bless the room. Bless the street. Bless the city. Bless the country. Bless the ones who agree with you. Bless the ones who do not. Bless the ones who will never know your name. Jnaneshwar blessed the whole world without leaving his village. You can do the same without leaving this chair. The blessing does not travel. It is already everywhere.",
      caption: "Bless the whole world. It is already everywhere.", imageUrl: pureAwareness, holdMs: 120000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. You have just practiced the highest yoga. Not the yoga of posture. Not the yoga of breath. The yoga of wishing well. Jnaneshwar said: 'The one who sees all beings in the Self, and the Self in all beings, never hates.' You have seen. You cannot unsee. Walk today as one who wishes well.",
      caption: "Return. Walk as one who wishes well.", imageUrl: returnImg, holdMs: 25000 },
  ],
  closing: "Jnaneshwar wrote the Pasayadan when he was sixteen. It is the shortest, most powerful prayer in the Marathi language. It asks for nothing. It gives everything. You have just joined that giving. The world is already blessed. You only needed to say amen.",
};
