import type { SensorialManifest } from "./types";
import akkamahadeviImg from "@/assets/masters/akkamahadevi.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import traceI from "@/assets/sensorial/ramana/03-trace-i.jpg";
import rest from "@/assets/sensorial/ramana/04-rest.jpg";
import dawn from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";

export const akkamahadeviVachanaSangama: SensorialManifest = {
  key: "akkamahadevi:vachana-sangama",
  guruId: "akkamahadevi",
  practiceMatch: "vachana sangama",
  title: "Vachana Sangama — Akkamahadevi's Fire",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientFlame as { url: string }).url,
  backdropImage: akkamahadeviImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 11,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Akkamahadevi was a twelfth-century Kannada poet-saint who rejected marriage, rejected social convention, rejected clothing, and walked naked through villages singing to Lord Shiva. She said: 'Take me. I am yours. I am not my body. I am not my name. I am the fire that burns them both.' Tonight we sit with that fire. Not as destruction. As purification.",
      caption: "Vachana — the fire that burns the name.", imageUrl: arrive, holdMs: 20000 },
    { id: "surrender-name", modality: "narrate",
      narration: "Begin by surrendering your name. Not legally. Energetically. The name is a costume. It carries expectations. It carries judgments. It carries the weight of who you think you must be. Put it down. You are not the name. You are the one who answers to it. The one who answers is already free.",
      caption: "Surrender the name. You are not it.", imageUrl: traceI, holdMs: 45000 },
    { id: "surrender-body", modality: "narrate",
      narration: "Now the body. Akkamahadevi walked naked because she said: the body is not mine. It is the Lord's. I am only the flame that moves it. You do not need to walk naked. You only need to recognize: this body is a gift. It was given. It will be taken back. The one who is inside it is untouched by its nakedness or its clothing. You are that one.",
      caption: "The body is the Lord's. You are the flame.", imageUrl: rest, holdMs: 90000 },
    { id: "surrender-social", modality: "voice_reply",
      narration: "What social expectation are you carrying right now? The need to be successful. To be liked. To be right. To be spiritual. Name it. Speak it. Then surrender it. Akkamahadevi did not care what the village said. She cared what Shiva said. And Shiva said nothing. That silence is the only approval you need.",
      caption: "Name the expectation. Surrender it.", prompt: "The expectation I surrender is…", imageUrl: dawn, maxListenMs: 30000 },
    { id: "be-the-fire", modality: "silence",
      narration: "Now be the fire. Not the one who burns. The fire itself. Consuming the name. Consuming the body. Consuming the expectation. What remains? Not ash. Not emptiness. Not nothing. The fire itself. Pure. Uncontained. Eternal. Akkamahadevi merged with this fire. You are already it. You only needed to stop pretending to be the wood.",
      caption: "You are the fire. Not the wood.", imageUrl: dawn, holdMs: 180000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. The world of names and clothes awaits. But you now know: you are the fire beneath them. You can wear the costume. You can answer to the name. But you know what you actually are. That knowing changes everything. It changes the way you walk. The way you speak. The way you love. Akkamahadevi walked through villages singing. You will walk through your day knowing. Both are fire.",
      caption: "Return. You are the fire beneath the costume.", imageUrl: arrive, holdMs: 25000 },
  ],
  closing: "Akkamahadevi's vachanas are still sung in Karnataka. They are short. They are fierce. They are beautiful. She did not write philosophy. She wrote fire. You have sat in that fire. It did not burn you. It burned the costume. What remains is the poet-saint. Not as a role. As your actual nature. Sing today. Even silently. The village needs your fire.",
};
