import type { SensorialManifest } from "./types";
import meeraImg from "@/assets/masters/meera.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import listen from "@/assets/sensorial/krishnamurti/02-listen.jpg";
import see from "@/assets/sensorial/krishnamurti/03-see.jpg";
import observer from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

export const meeraBhaktiSurrender: SensorialManifest = {
  key: "meera:bhakti-surrender",
  guruId: "meera",
  practiceMatch: "bhakti",
  title: "Bhakti Surrender — Meera's Path",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientSky as { url: string }).url,
  backdropImage: meeraImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 11,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Tonight we walk the path of Meera — not the path of analysis, not the path of effort, but the path of surrender. Meera danced through the streets of Dwarka singing to Krishna, carrying nothing but a tambourine and a heart broken open. You do not need the tambourine. You only need the brokenness. The rest is music.",
      caption: "Surrender path. Tambourine of the heart.", imageUrl: arrive, holdMs: 20000 },
    { id: "name-the-beloved", modality: "voice_reply",
      narration: "Whisper aloud the name of that which you love more than your own opinion of yourself. It could be a person, a presence, a silence, a cause, a truth. Not the word you think you should say. The word that actually comes.",
      caption: "Name the Beloved. Whisper it.", prompt: "The Beloved I surrender to is…", imageUrl: listen, maxListenMs: 30000 },
    { id: "surrender-body", modality: "breath",
      narration: "Three breaths. On each exhale, surrender one thing the body is clinging to — a posture, a comfort, an identity as 'someone who sits well.' The body is not yours. It was lent. Return it, breath by breath, to the Beloved.",
      caption: "Surrender the body. Breath by breath.", prompt: "Exhale… return the body…", imageUrl: see, holdMs: 60000 },
    { id: "surrender-mind", modality: "narrate",
      narration: "Now the mind. Every plan, every defense, every clever thought that says 'I am in charge.' They are all offerings. Place them at the feet of the Beloved. Meera said: 'I am a slave of the Beloved.' Not a metaphor. A literal statement of the anatomy of surrender.",
      caption: "I am a slave of the Beloved.", imageUrl: observer, holdMs: 90000 },
    { id: "surrender-resistance", modality: "voice_reply",
      narration: "Where do you feel the most resistance to surrender right now? Speak it. Not the noble version. The real version — the place where you say 'no' even when you want to say yes.",
      caption: "Name the resistance. Be honest.", prompt: "My resistance is…", imageUrl: observer, maxListenMs: 45000 },
    { id: "song", modality: "mantra",
      narration: "Meera sang. The song does not need to be beautiful. It only needs to be yours. Make a sound — any sound — that says 'I yield.' It can be a hum, a sigh, a whisper, a word, a cry. The Beloved hears all of them equally.",
      caption: "Sing the song of surrender.", prompt: "I yield… I yield…", imageUrl: rest, holdMs: 120000 },
    { id: "close", modality: "narrate",
      narration: "Sit in the residue. Nothing was taken from you. Everything was given back. The Beloved does not need your surrender. You need it. Surrender is the moment the fist opens and discovers the hand was always holding nothing — and nothing was enough.",
      caption: "Open the fist. Nothing was enough.", imageUrl: rest, holdMs: 30000 },
  ],
  closing: "Meera walked through Dwarka singing, and when they locked the temple doors, she sang until the doors dissolved. Surrender is not weakness. It is the most radical force in the universe — the force that melts locks with a single note. Carry one note of it into your next hour.",
};
