import type { SensorialManifest } from "./types";
import saradaImg from "@/assets/masters/sarada.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import see from "@/assets/sensorial/krishnamurti/03-see.jpg";
import observer from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

export const saradaDeviMotherWay: SensorialManifest = {
  key: "sarada-devi:mother-way",
  guruId: "sarada-devi",
  practiceMatch: "mother way",
  title: "The Mother Way — Sarada Devi's Gaze",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientSky as { url: string }).url,
  backdropImage: saradaImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 11,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Sarada Devi, the Holy Mother, wife of Ramakrishna, never gave lectures. She sat. She looked. She said: 'I am the mother of all. You are my children.' Her teaching was not words. It was a gaze that made everyone feel seen, forgiven, and home. Tonight we sit with that gaze. Not as an image. As a way of seeing yourself.",
      caption: "The Mother's gaze. Seen. Forgiven. Home.", imageUrl: arrive, holdMs: 20000 },
    { id: "see-yourself-as-child", modality: "narrate",
      narration: "See yourself as the Mother sees you. Not as the person who succeeded or failed. Not as the one who knows or does not know. As the child who is tired. The child who is scared. The child who wants to be held. Sarada Devi said: 'I see only the divine in you.' Try to see that now. Not as affirmation. As fact.",
      caption: "See yourself as the Mother sees you.", imageUrl: see, holdMs: 60000 },
    { id: "forgive-yourself", modality: "narrate",
      narration: "The Mother forgives without condition. She does not need you to be good. She does not need you to improve. She only needs you to come home. Forgive yourself for every time you were not kind. For every time you were afraid. For every time you tried to be someone else. The Mother does not keep score. She only keeps the door open.",
      caption: "Forgive yourself. The Mother keeps no score.", imageUrl: observer, holdMs: 90000 },
    { id: "be-the-mother", modality: "silence",
      narration: "Now become the Mother. Not the child who needs care. The one who offers it. Look at your own life with her eyes. The same tenderness. The same patience. The same refusal to judge. You are both. The child and the mother. The seeker and the sage. In this sitting, let the mother gaze at the child. That is enough.",
      caption: "Be the Mother. Gaze at your own child.", imageUrl: rest, holdMs: 120000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. Sarada Devi lived in a small room in Dakshineswar, cooking, cleaning, sitting. Her greatness was not in what she did. It was in how she saw. Carry that seeing into your next interaction. The person you will meet — see them as the Mother sees them. Tired. Scared. Wanted. That seeing changes everything. It costs nothing. It heals everything.",
      caption: "Return. See others as the Mother sees them.", imageUrl: arrive, holdMs: 25000 },
  ],
  closing: "Sarada Devi said: 'I am the mother of all. You are my children.' You sat in that motherhood. The gaze was not external. It was your own. You have always been both the child and the mother. The seeker and the sage. Tonight, let the mother lead. The child will follow. That is the only guidance you will ever need.",
};
