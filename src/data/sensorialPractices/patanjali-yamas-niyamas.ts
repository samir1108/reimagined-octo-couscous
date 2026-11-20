import type { SensorialManifest } from "./types";
import patanjaliImg from "@/assets/masters/patanjali.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import inward from "@/assets/sensorial/yogananda/03-watch.jpg";
import center from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import rest from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

/**
 * Patanjali — Yamas & Niyamas Audit (limbs 1 & 2 of Ashtanga).
 * A nightly examen across the 5 restraints + 5 observances.
 * Voice replies on three picked at random by the engine. ~13 min.
 */
export const patanjaliYamasNiyamas: SensorialManifest = {
  key: "patanjali:yamas-niyamas",
  guruId: "patanjali",
  practiceMatch: "yamas",
  title: "Yamas & Niyamas Audit",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: patanjaliImg,
  videoUrl: (ambientEye as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 13,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit upright. Eyes closed. Tonight we walk the first two limbs of yoga — not on the mat, but through the day just lived. Five restraints, five observances. Not to judge. To see clearly. Where eye sees, hand corrects.",
      caption: "Five restraints. Five observances.", imageUrl: arrive, holdMs: 20000 },
    { id: "settle", modality: "breath",
      narration: "Three slow breaths. Inhale honesty. Exhale the wish to look better than I am. Three times.",
      caption: "Inhale honesty. Exhale pretense.", prompt: "Inhale honesty… exhale pretense…", imageUrl: arrive, holdMs: 36000 },
    { id: "ahimsa", modality: "voice_reply",
      narration: "Ahimsa — non-harming. Today, in word, glance or thought, where did I cause even a small harm — to another, or to myself? Speak it aloud, briefly, without defense.",
      caption: "Ahimsa — where did I harm?", prompt: "Today, the harm was…", imageUrl: inward, maxListenMs: 45000 },
    { id: "satya", modality: "voice_reply",
      narration: "Satya — truthfulness. Where did I shade the truth today — by exaggeration, by silence when I should have spoken, by half-saying? Speak it.",
      caption: "Satya — where did I shade truth?", prompt: "I shaded the truth when…", imageUrl: inward, maxListenMs: 45000 },
    { id: "asteya-brahmacharya-aparigraha", modality: "narrate",
      narration: "Now silently scan the other three restraints. Asteya — did I take what was not freely given, even time or attention? Brahmacharya — did I spend my vital energy wisely? Aparigraha — did I cling to anything I should have let pass through? Just notice. No words needed.",
      caption: "Asteya. Brahmacharya. Aparigraha.", imageUrl: inward, holdMs: 75000 },
    { id: "santosha", modality: "voice_reply",
      narration: "Now the niyamas — the inward observances. Santosha — contentment. Where today did I refuse a perfectly fine moment because it was not yet enough? Speak the moment.",
      caption: "Santosha — what was already enough?", prompt: "Already enough was…", imageUrl: center, maxListenMs: 45000 },
    { id: "remaining-niyamas", modality: "narrate",
      narration: "Silently — Saucha, cleanness of body and intention. Tapas, the willing heat of discipline. Svadhyaya, the study of self and sacred text. Ishvara pranidhana, surrender to the larger order. Notice which one calls loudest tonight. That is tomorrow's first practice.",
      caption: "Saucha. Tapas. Svadhyaya. Surrender.", imageUrl: center, holdMs: 75000 },
    { id: "rest", modality: "silence",
      narration: "Sit silently. The audit is done. The day has been received. Sleep tonight on a clean ledger.",
      caption: "Clean ledger. Rest.", imageUrl: rest, holdMs: 60000 },
  ],
  closing: "Yoga is not what you do on the mat. It is the day you just walked back through. Do this audit nightly for forty days, and the yamas begin to live themselves through you — without effort, without note-taking.",
};
