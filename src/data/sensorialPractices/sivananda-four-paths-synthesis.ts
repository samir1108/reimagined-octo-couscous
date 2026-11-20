import type { SensorialManifest } from "./types";
import sivanandaImg from "@/assets/masters/sivananda.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import settle from "@/assets/sensorial/yogananda/02-settle.jpg";
import watch from "@/assets/sensorial/yogananda/03-watch.jpg";
import mantra from "@/assets/sensorial/yogananda/04-mantra.jpg";
import pureAwareness from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import returnImg from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

export const sivanandaSynthesisFourPaths: SensorialManifest = {
  key: "sivananda:four-paths-synthesis",
  guruId: "sivananda",
  practiceMatch: "four paths synthesis",
  title: "Synthesis of the Four Paths",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientEye as { url: string }).url,
  backdropImage: sivanandaImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 13,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Swami Sivananda taught the Yoga of Synthesis: all four paths are one path. Karma — selfless action. Bhakti — devotion. Raja — meditation. Jnana — wisdom. You do not choose one. You stand at the center where they meet. Tonight we walk that center. Not as theory. As a single breath that contains all four movements.",
      caption: "Four paths. One breath. Stand at the center.", imageUrl: arrive, holdMs: 20000 },
    { id: "karma", modality: "narrate",
      narration: "Karma Yoga: action without attachment to fruit. Sit. Place your hands palms up on the thighs. This is the gesture of offering. Every thought that arises in the next minute is an action. Offer it. Do not keep the fruit. The fruit is not yours. The action is yours. The offering is yours. The result belongs to the whole.",
      caption: "Karma: offer the fruit. Keep only the action.", imageUrl: settle, holdMs: 60000 },
    { id: "bhakti", modality: "mantra",
      narration: "Bhakti Yoga: surrender through love. Let the hands come to the heart. Not as a gesture. As a door. Behind the heart is the Beloved — not a person. A presence that loves you without condition. Say the name that opens that door. Om. Ram. Hari. Allah. Love. Repeat it. The name is not the Beloved. The name is the key.",
      caption: "Bhakti: hand on heart. The name is the key.", prompt: "Om… Ram… Hari… Love…", imageUrl: mantra, holdMs: 120000 },
    { id: "raja", modality: "breath",
      narration: "Raja Yoga: meditation. The royal path. Now become still. The breath is the king. Watch it. Do not regulate it. The breath governs itself. You only watch. The watcher is the Raja. The watched is the kingdom. The kingdom is vast. The Raja is still.",
      caption: "Raja: the watcher watches the kingdom.", prompt: "Watch the breath. The king sits still.", imageUrl: pureAwareness, holdMs: 120000 },
    { id: "jnana", modality: "narrate",
      narration: "Jnana Yoga: wisdom. Ask, as Sivananda asked: 'Who am I?' Not as repetition. As a knife. Cut through every answer. You are not the body. You are not the mind. You are not the personality. You are the awareness in which all of these appear. The awareness does not come and go. It is here now. You are it.",
      caption: "Jnana: you are the awareness. Not its contents.", imageUrl: watch, holdMs: 90000 },
    { id: "synthesis", modality: "silence",
      narration: "Now hold all four at once. Action without attachment. Love without condition. Stillness without effort. Knowing without thought. They are not four. They are the same movement seen from four angles. Sit as that movement. You are the yoga. You do not do yoga. You are it.",
      caption: "All four at once. You are the yoga.", imageUrl: pureAwareness, holdMs: 180000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. Sivananda's five points: proper exercise, proper breathing, proper relaxation, proper diet, positive thinking. You have practiced three of them tonight. The other two will meet you at the door. Walk them all day. The synthesis is not a weekend practice. It is the practice of every choice.",
      caption: "Walk the synthesis. Every choice.", imageUrl: returnImg, holdMs: 25000 },
  ],
  closing:
    "Sivananda said: Serve. Love. Give. Meditate. Realize. Five words. One life. You are one being. One path. One yoga. Live it.",
};
