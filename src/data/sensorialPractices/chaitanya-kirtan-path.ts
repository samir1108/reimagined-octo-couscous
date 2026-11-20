import type { SensorialManifest } from "./types";
import chaitanyaImg from "@/assets/masters/chaitanya.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import flow from "@/assets/sensorial/krishnamurti/02-listen.jpg";
import center from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

export const chaitanyaKirtanPath: SensorialManifest = {
  key: "chaitanya:kirtan-path",
  guruId: "chaitanya",
  practiceMatch: "kirtan path",
  title: "Kirtan Path — Chaitanya's Dance",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientSky as { url: string }).url,
  backdropImage: chaitanyaImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 12,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Chaitanya Mahaprabhu did not sit. He danced. He sang the names of Hari in the streets of Navadvipa, pulling everyone into the current of devotion — Muslims, Hindus, outcasts, children, animals. The names were not polite. They were ecstatic. Tonight we do not sit. We let the names move the body. Kirtan is not singing. It is being sung.",
      caption: "Kirtan — not singing. Being sung.", imageUrl: arrive, holdMs: 20000 },
    { id: "name-hari", modality: "voice_reply",
      narration: "Whisper the name that your body already knows. It might be Krishna. It might be Hari. It might be Love. It might be a sound without meaning. Say it once. Let the sound land in the chest. That landing is the beginning of kirtan.",
      caption: "Name the Beloved. Let it land.", prompt: "The name my body knows is…", imageUrl: flow, maxListenMs: 30000 },
    { id: "let-it-move", modality: "narrate",
      narration: "Now let the name move you. Not a choreography. A sway. A rock. A breath that becomes a sound. Chaitanya said: 'Chant the name until the chanter disappears.' The body knows how to worship. It was doing it before you had a name for it. Let it.",
      caption: "Let the name move the body.", imageUrl: center, holdMs: 60000 },
    { id: "kirtan-breath", modality: "breath",
      narration: "Let the name ride the breath. Inhale: 'Ha-ri.' Exhale: 'Krish-na.' Or just the sound your throat makes. The breath is the drum. The name is the rhythm. You are the dancer. The dancer does not think. The dancer dances. Keep the breath slow. Keep the name soft. Let it build.",
      caption: "Hari. Krishna. Breath is the drum.", prompt: "Ha-ri… Krish-na…", imageUrl: center, holdMs: 180000 },
    { id: "surrender-intellect", modality: "narrate",
      narration: "The intellect will try to analyze. It will say: this is silly. This is not meditation. Let it. Chaitanya said: 'The Name is the only medicine for the disease of the mind.' The mind is sick with itself. The name is the cure. Do not think about the name. Be the name. It is already singing you.",
      caption: "The mind is sick. The name is the cure.", imageUrl: flow, holdMs: 90000 },
    { id: "close", modality: "narrate",
      narration: "Slow down. Let the movement settle. You are not the same person who started. The kirtan has shaken something loose. Something softer. Something older than thought. Chaitanya danced until his body could not stand. You do not need to go that far. You only need to let the name land once. That is enough for today.",
      caption: "Settle. Something softer remains.", imageUrl: rest, holdMs: 30000 },
  ],
  closing: "Chaitanya did not leave a scripture. He left a song. The Maha Mantra: Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare. Sixteen words. One lifetime. You have sung them tonight, in the only temple that matters — the body. The kirtan does not end when you stop moving. It continues in the breath. Listen. It is still singing.",
};
