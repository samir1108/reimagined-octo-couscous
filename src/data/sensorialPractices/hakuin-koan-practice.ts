import type { SensorialManifest } from "./types";
import hakuinImg from "@/assets/masters/hakuin.jpg";
import arrive from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";
import sit from "@/assets/sensorial/buddha-bodyscan/05-whole.jpg";
import rest from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";

export const hakuinKoanPractice: SensorialManifest = {
  key: "hakuin:koan-practice",
  guruId: "hakuin",
  practiceMatch: "koan practice",
  title: "Koan Practice — Hakuin's Great Doubt",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: hakuinImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 15,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Hakuin Ekaku, the great revitalizer of Japanese Zen, called the koan 'the fire that burns the self.' Tonight we sit with the most ancient koan: 'What is the sound of one hand?' Not as a riddle. Not as philosophy. As a live wire applied to the mind. The question will not leave you alone. Good. That is the point.",
      caption: "One hand. The fire that burns the self.", imageUrl: arrive, holdMs: 25000 },
    { id: "present-koan", modality: "narrate",
      narration: "Hold the koan now: 'What is the sound of one hand clapping?' Do not answer with logic. Do not answer with imagination. Hold it like a hot coal. The mind will spin. The mind will try to solve it. Let it spin. You are not the solver. You are the one holding the coal.",
      caption: "Hold it like a hot coal.", imageUrl: sit, holdMs: 60000 },
    { id: "great-doubt", modality: "silence",
      narration: "Hakuin taught the Great Doubt — not the doubt that questions, but the doubt that is itself a wall. You cannot think your way through. Every thought is a failure. Every silence is a success that does not feel like success. Sit in the failure. The failure is the doorway. Push through it.",
      caption: "Great Doubt. Push through the wall.", imageUrl: sit, holdMs: 300000 },
    { id: "body-of-koan", modality: "narrate",
      narration: "Let the koan enter the body. The question is not in the head. It is in the belly. In the hands. In the breath. Every inhale: 'What...' Every exhale: '...is the sound?' You are the koan now. You do not practice the koan. The koan practices you.",
      caption: "The koan practices you.", imageUrl: rest, holdMs: 180000 },
    { id: "no-attainment", modality: "narrate",
      narration: "Do not hope for an answer. Hakuin spent years without one. The answer is the disappearance of the questioner. The one who wants to know dissolves. What remains is not an answer. It is the end of asking. Sit there. No answer. No asker. Just the silence that was there before the koan arrived.",
      caption: "No answer. No asker. Just silence.", imageUrl: rest, holdMs: 180000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. The koan goes with you. Not as a burden. As a companion. When you are washing dishes, it is there. When you are in a meeting, it is there. You do not need to solve it. You only need to keep it alive. One day, when you are not looking, it will answer itself. And the answer will be silence.",
      caption: "The koan travels with you.", imageUrl: arrive, holdMs: 30000 },
  ],
  closing:
    "Hakuin called the koan the fire that burns the self. You held the coal. The water was already there. Sit with one hand. The sound reveals itself.",
};
