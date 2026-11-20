import type { SensorialManifest } from "./types";
import mahaviraImg from "@/assets/masters/mahavira.jpg";
import arrive from "@/assets/sensorial/buddha/01-arrive.jpg";
import notice from "@/assets/sensorial/buddha/02-notice-breath.jpg";
import whole from "@/assets/sensorial/buddha/04-whole-body.jpg";
import calm from "@/assets/sensorial/buddha/05-calm.jpg";
import joy from "@/assets/sensorial/buddha/06-joy.jpg";
import returnImg from "@/assets/sensorial/buddha/08-return.jpg";
import ambientBodhi from "@/assets/sensorial/buddha/ambient-bodhi.mp4.asset.json";

export const mahaviraAnekantavada: SensorialManifest = {
  key: "mahavira:anekantavada",
  guruId: "mahavira",
  practiceMatch: "anekantavada",
  title: "Anekantavada — Non-Absolutism",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientBodhi as { url: string }).url,
  backdropImage: mahaviraImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 10,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Mahavira, the great Liberator, taught Anekantavada: truth is not one-sided. Every situation has multiple angles, and the wise one does not cling to a single perspective. Tonight we practice this not as philosophy, but as a release from the prison of being right.",
      caption: "Truth is not one-sided.", imageUrl: arrive, holdMs: 18000 },
    { id: "pick-view", modality: "narrate",
      narration: "Bring to mind a current tension — something you believe is absolutely true about someone, about yourself, about how things should be. Hold it lightly, like a small stone in your hand. You are about to turn it over.",
      caption: "Pick a view. Hold it lightly.", imageUrl: notice, holdMs: 25000 },
    { id: "opposite-view", modality: "voice_reply",
      narration: "Now argue the opposite side — not to win, but to see. If you believe 'they were wrong,' speak briefly from the position that 'they were right.' If you believe 'I failed,' speak from 'I succeeded.' One sentence each.",
      caption: "Argue the opposite. One sentence.", prompt: "The opposite view is…", imageUrl: whole, maxListenMs: 30000 },
    { id: "third-view", modality: "voice_reply",
      narration: "Now find the view that neither side holds. The one that includes both. Speak it. This is the Middle View — not compromise, but a higher seeing that contains both.",
      caption: "The third view that holds both.", prompt: "The view that holds both is…", imageUrl: calm, maxListenMs: 30000 },
    { id: "surrender-certainty", modality: "silence",
      narration: "Sit with the discomfort of not knowing. The mind wants certainty. It wants to be right. Let it be wrong. Mahavira sat in silence for twelve years. In that silence, the many-sided truth revealed itself. Certainty is a small room. Open the door.",
      caption: "Sit in not-knowing. Open the door.", imageUrl: calm, holdMs: 120000 },
    { id: "return", modality: "narrate",
      narration: "Return to the original situation. Look at it again. Has it changed? The facts are the same. But the grip is looser. This is the practice: not changing the world, but changing the angle from which you see it. Seven angles, said Mahavira. Tonight you have touched three.",
      caption: "Return. The grip is looser.", imageUrl: returnImg, holdMs: 20000 },
  ],
  closing: "Anekantavada is not indecision. It is the courage to hold truth as a living thing — a thing with many faces. When you stop needing to be right, you become available for what is actually true. And what is true is always larger than your opinion of it. Walk today with seven windows open.",
};
