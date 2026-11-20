import type { SensorialManifest } from "./types";
import advaitaImg from "@/assets/masters/advaita.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import traceI from "@/assets/sensorial/ramana/03-trace-i.jpg";
import rest from "@/assets/sensorial/ramana/04-rest.jpg";
import dawn from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";

export const advaitaNetiNetiRecognition: SensorialManifest = {
  key: "advaita:neti-neti-recognition",
  guruId: "advaita",
  practiceMatch: "neti neti recognition",
  title: "Neti Neti — Advaita Recognition",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientFlame as { url: string }).url,
  backdropImage: advaitaImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 12,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. The Upanishads gave the method: Neti Neti — not this, not this. Not the body. Not the mind. Not the personality. Not the world. Whatever you point to is not you. Keep negating until there is nothing left to negate. What remains is you. Not as a thing. As the space in which all things appear.",
      caption: "Neti Neti — not this. Not this.", imageUrl: arrive, holdMs: 20000 },
    { id: "negate-body", modality: "narrate",
      narration: "Say inwardly: I am not the body. The body is born. The body will die. The body changes. You do not change. You are the witness of the body. The body is a vehicle. You are the driver. Not the driver. The one who knows there is a driver. Negate the body. It is not you.",
      caption: "I am not the body. Negate it.", imageUrl: traceI, holdMs: 30000 },
    { id: "negate-mind", modality: "narrate",
      narration: "Say: I am not the mind. The thoughts come and go. The mind is a factory. You are not the factory. You are the one who watches the factory. The thoughts are not yours. They are visitors. Let them visit. Do not claim them. Negate the mind. It is not you.",
      caption: "I am not the mind. Negate it.", imageUrl: traceI, holdMs: 30000 },
    { id: "negate-world", modality: "narrate",
      narration: "Say: I am not the world. The world appears in consciousness. It is a dream. You are the dreamer. The dream has storms. The dream has joys. The dreamer is untouched. Negate the world. It is not you. It is an appearance in you. You are the screen. The movie is not the screen.",
      caption: "I am not the world. Negate it.", imageUrl: dawn, holdMs: 45000 },
    { id: "what-remains", modality: "silence",
      narration: "Now stop negating. What remains? Not a thing. Not a thought. Not a presence. Not an absence. Just the prior to all of it. The screen before the movie. The space before the object. You are that. You cannot point to it. You cannot think it. You can only be it. Sit as that being. No adjective. No description. Just the 'I am' without 'this.'",
      caption: "What remains? Just I am. Without this.", imageUrl: rest, holdMs: 240000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. The world of 'this' awaits. But you know now: you are not any 'this.' You are the 'I am' that was there before any 'this' was added. You can live in the world of 'this' without being fooled by it. The body is yours to use. The mind is yours to enjoy. But they are not you. You are the one who knows they are yours. Carry that knowing.",
      caption: "Return. You are the I am. Not any this.", imageUrl: arrive, holdMs: 25000 },
  ],
  closing: "The Upanishads said: Neti Neti. Not this. Not this. The Buddha said: Anatman. No self. Nagarjuna said: Shunyata. Emptiness. They were all pointing to the same nothing that is actually everything. You sat in that nothing. It is not empty. It is full of everything. You are that fullness. Negate everything else. Keep that.",
};
