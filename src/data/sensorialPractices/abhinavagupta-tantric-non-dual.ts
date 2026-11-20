import type { SensorialManifest } from "./types";
import abhinavaguptaImg from "@/assets/masters/abhinavagupta.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import traceI from "@/assets/sensorial/ramana/03-trace-i.jpg";
import rest from "@/assets/sensorial/ramana/04-rest.jpg";
import dawn from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";

export const abhinavaguptaTantricNonDual: SensorialManifest = {
  key: "abhinavagupta:tantric-non-dual",
  guruId: "abhinavagupta",
  practiceMatch: "tantric non-dual",
  title: "Tantric Non-Dual — Abhinavagupta's Recognition",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientFlame as { url: string }).url,
  backdropImage: abhinavaguptaImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 14,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Abhinavagupta, the great tenth-century master of Kashmir Shaivism, taught that everything is Shiva. Not as a metaphor. As a literal anatomy of reality. The body, the breath, the thought, the emotion — all are modalities of the one Consciousness. There is nothing to reject. Nothing to transcend. Everything is already the Divine, wearing a costume. Tonight we recognize the costume.",
      caption: "Everything is Shiva. Wearing costumes.", imageUrl: arrive, holdMs: 20000 },
    { id: "recognize-thoughts", modality: "narrate",
      narration: "Watch the next thought. Do not push it away. Recognize it as Shiva. The thought is not an interruption. It is the Divine thinking itself. The mind is not the enemy. The mind is the dance of Consciousness. You are not the thinker. You are the awareness in which the thought dances. The dancer and the dance are the same.",
      caption: "The thought is Shiva thinking itself.", imageUrl: traceI, holdMs: 60000 },
    { id: "recognize-body", modality: "narrate",
      narration: "Feel the body. Every sensation is a frequency of the one vibration. The ache in the back. The warmth in the chest. The hum in the ears. All are Shiva vibrating at different speeds. You do not need to change the body. You need to recognize it. The body is not a trap. It is the temple that built itself.",
      caption: "The body is Shiva vibrating.", imageUrl: rest, holdMs: 90000 },
    { id: "recognize-emotion", modality: "narrate",
      narration: "Feel the emotion that is present — even if it is numbness. That too is Shiva. The Divine is not only peace. The Divine is also the anxiety, the grief, the restlessness. Abhinavagupta said: 'The highest worship is to recognize the Divine in the most painful place.' Find that place. Bow to it. It is not an enemy. It is the face of God you have been avoiding.",
      caption: "The pain is Shiva's face. Bow to it.", imageUrl: traceI, holdMs: 120000 },
    { id: "no-rejection", modality: "silence",
      narration: "Sit in total acceptance. No part of yourself is excluded. The holy thought and the unholy thought. The peace and the noise. The love and the fear. All are invited. This is the Tantric non-dual recognition: there is no separate self to be liberated. There is only Consciousness, recognizing itself through every experience. You are that recognition.",
      caption: "No part excluded. All is Consciousness.", imageUrl: rest, holdMs: 180000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. The world of forms awaits. But you now know: every form is Shiva wearing a mask. The table. The phone. The face in the mirror. All are the same light, refracted. You can touch the world with this knowledge. It changes nothing. And it changes everything. That is the paradox Abhinavagupta lived. Walk it today.",
      caption: "Return. Every form is Shiva.", imageUrl: dawn, holdMs: 25000 },
  ],
  closing: "Abhinavagupta wrote the Tantraloka — a thirty-seven-chapter masterpiece that says: everything is the Divine. You do not need to leave the world. You need to see it correctly. The practice is simple: recognize. Not as a thought. As a vibration. The world is vibrating with one name: Shiva. Listen. It is humming everywhere.",
};
