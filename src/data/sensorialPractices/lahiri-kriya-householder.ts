import type { SensorialManifest } from "./types";
import lahiriImg from "@/assets/masters/lahiri.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import settle from "@/assets/sensorial/yogananda/02-settle.jpg";
import watch from "@/assets/sensorial/yogananda/03-watch.jpg";
import pause from "@/assets/sensorial/yogananda/05-pause.jpg";
import pureAwareness from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import returnImg from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

export const lahiriKriyaHouseholder: SensorialManifest = {
  key: "lahiri:kriya-householder",
  guruId: "lahiri",
  practiceMatch: "kriya householder",
  title: "Kriya for the Householder — Lahiri Mahasaya",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientEye as { url: string }).url,
  backdropImage: lahiriImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 15,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Lahiri Mahasaya was not a monk. He was a government clerk, married, with children. He received Kriya initiation from Mahavatar Babaji in the Himalayas and brought it back to the householder life. Babaji told him: 'Kriya is not for renunciates only. It is for those who live in the world but are not of it.' You do not need to leave anything. You only need to sit.",
      caption: "Kriya for the householder.", imageUrl: arrive, holdMs: 20000 },
    { id: "ikkings", modality: "breath",
      narration: "Three breaths. With each inhale, mentally feel the breath ascending the spine — from the base, through the sacrum, the lumbar, the dorsal, the cervical, to the point between the eyebrows. With each exhale, feel it descending the same channel. Not physically. Mentally. The spine is the ladder. The breath is the climber.",
      caption: "Inhale up the spine. Exhale down.", prompt: "Up… down… up… down…", imageUrl: settle, holdMs: 60000 },
    { id: "kumbhaka", modality: "silence",
      narration: "Now add the pause. At the top of the inhale, hold. Not tight. Soft. In that pause, feel the channel bathed in stillness. At the bottom of the exhale, hold again. The pause is the most important part. It is where Kriya actually happens. The breath is only the vehicle. The stillness is the destination.",
      caption: "Pause at top. Pause at bottom. Stillness.", imageUrl: watch, holdMs: 180000 },
    { id: "sushumna", modality: "narrate",
      narration: "Lahiri called the central channel Sushumna — the river of light that runs through the spine. Most people live in the two side channels: the sun and the moon. Kriya brings the breath into the central channel. You are not imagining this. You are remembering it. The channel was always there. The breath was always flowing in it. You only needed to notice.",
      caption: "Sushumna — the river of light.", imageUrl: pureAwareness, holdMs: 90000 },
    { id: "surrender-outcome", modality: "narrate",
      narration: "Lahiri taught: do not practice Kriya for powers. Do not practice for bliss. Practice for the love of the practice. The outcome is not yours. Babaji said: 'Kriya is the airplane route to God.' You are on the plane. You do not need to know the destination. The pilot does. Trust the pilot. Trust the breath.",
      caption: "Practice for the love. Not the outcome.", imageUrl: pause, holdMs: 60000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. Lahiri Mahasaya sat for forty minutes every morning before his family woke. You have sat for less. But the channel is open now. It stays open. Every breath of the day can flow in it. You do not need to be in the Himalayas. You do not need to be a monk. You only need to be a householder who remembers the ladder.",
      caption: "Return. The ladder is always there.", imageUrl: returnImg, holdMs: 25000 },
  ],
  closing: "Lahiri Mahasaya wrote: 'Kriya Yoga is the science of realizing God.' He did not mean a distant God. He meant the God who is already breathing you. The Kriya you just practiced was not a technique. It was a reunion. The breath, the spine, the pause — all were always here. You only needed to sit long enough to notice. Come back tomorrow. The ladder is waiting.",
};
