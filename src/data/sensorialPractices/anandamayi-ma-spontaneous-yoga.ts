import type { SensorialManifest } from "./types";
import anandamayiImg from "@/assets/masters/anandamayi.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import rest from "@/assets/sensorial/ramana/04-rest.jpg";
import dawn from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";
import aham from "@/assets/sensorial/ramana/02-aham.jpg";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";

export const anandamayiMaSpontaneousYoga: SensorialManifest = {
  key: "anandamayi-ma:spontaneous-yoga",
  guruId: "anandamayi-ma",
  practiceMatch: "spontaneous yoga",
  title: "Spontaneous Yoga — Anandamayi Ma",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientFlame as { url: string }).url,
  backdropImage: anandamayiImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 12,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Anandamayi Ma moved through the world like a child — laughing, crying, dancing, without any apparent effort. She said: 'I am a body moved by the Beloved.' She did not practice yoga. Yoga happened to her, the way rain happens to a leaf. Tonight we sit not to do yoga, but to let yoga do us.",
      caption: "Yoga happens to you. Not the other way.", imageUrl: arrive, holdMs: 20000 },
    { id: "surrender-effort", modality: "narrate",
      narration: "Put down the effort to be spiritual. Anandamayi Ma never tried. She simply allowed. The body wants to sit straight. Let it. The breath wants to slow. Let it. The mind wants to quiet. Let it. You are not the doer. You are the happening. Sit as the happening.",
      caption: "Put down effort. Be the happening.", imageUrl: arrive, holdMs: 30000 },
    { id: "feel-the-grace", modality: "silence",
      narration: "Feel the grace that is already flowing. Not as a concept. As a warmth. The breath is grace. The heartbeat is grace. The fact that you are sitting here, willing to sit, is grace. Anandamayi Ma called it the Mother's hand. You can call it what you like. Just feel it. It is not outside you. It is the atmosphere of your own being.",
      caption: "Feel the grace. It is your atmosphere.", imageUrl: rest, holdMs: 180000 },
    { id: "surrender-will", modality: "narrate",
      narration: "Now surrender the will. The part of you that says 'I am doing this.' That part is a small child holding the steering wheel of a car it does not know how to drive. Hand the wheel over. The road knows where it is going. You only need to let go. Anandamayi Ma trusted so completely that she would sometimes stand in the Ganges for hours, not because she chose to, but because the current said stay.",
      caption: "Hand the wheel over. The road knows.", imageUrl: aham, holdMs: 90000 },
    { id: "no-goal", modality: "silence",
      narration: "This sitting has no goal. No attainment. No breakthrough. No nothing. It is already complete. The completeness is not in the future. It is in the sitting. You are not sitting to get somewhere. You are sitting because sitting is the only place where you already are. Rest there.",
      caption: "No goal. Already complete.", imageUrl: rest, holdMs: 180000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. Anandamayi Ma's life was a celebration without occasion. Let your day be the same. Not because everything is perfect. But because the perfection is in the allowing. The yoga is not in the posture. It is in the permission. You have given permission. Now walk as one who has.",
      caption: "Return. Walk with permission given.", imageUrl: dawn, holdMs: 25000 },
  ],
  closing: "Anandamayi Ma said: 'I am a body moved by the Beloved.' You sat as that body. The movement was small — a breath, a thought, a release. But the mover is the same. Carry the knowing that you are not the doer. You are the done. The yoga is already happening. You only needed to notice.",
};
