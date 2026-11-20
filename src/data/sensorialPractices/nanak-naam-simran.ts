import type { SensorialManifest } from "./types";
import nanakImg from "@/assets/masters/nanak.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import flow from "@/assets/sensorial/krishnamurti/02-listen.jpg";
import center from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

export const nanakNaamSimran: SensorialManifest = {
  key: "nanak:naam-simran",
  guruId: "nanak",
  practiceMatch: "naam simran",
  title: "Naam Simran — Nanak's Song",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientSky as { url: string }).url,
  backdropImage: nanakImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 11,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Guru Nanak walked thousands of miles singing one truth: there is no Hindu, no Muslim, no boundary that the Beloved cannot cross. Tonight we do not cross boundaries. We sit at the boundary between noise and silence and let the Name carry us across. Naam. The sound that is not a sound. The presence that is not a person.",
      caption: "Naam — the sound that is not a sound.", imageUrl: arrive, holdMs: 20000 },
    { id: "name-the-divine", modality: "voice_reply",
      narration: "Whisper aloud the name by which you most naturally address the Divine. It does not need to be a Sanskrit word. It can be Love, Peace, Truth, Presence, Allah, Ram, Hari, Tao. Whatever name your heart actually uses. Say it once, clearly, into the room.",
      caption: "Name the Divine. Your own name.", prompt: "The name my heart knows is…", imageUrl: flow, maxListenMs: 30000 },
    { id: "surrender-head", modality: "narrate",
      narration: "Nanak said: 'Surrender your head. Surrender your pride. Surrender the clever arguments of the mind.' The head is where you keep your certainty. Place it at the feet of the Name. You do not lose the head. You lose the need to be right. The Name does not care if you are right. It only cares if you are present.",
      caption: "Surrender the head. The Name does not care.", imageUrl: center, holdMs: 60000 },
    { id: "simran-breath", modality: "breath",
      narration: "Now let the Name ride the breath. Inhale: 'Sat.' Exhale: 'Nam.' Sat Nam. Truth is the Name. Or use whatever pair feels right. The breath becomes the loom. The Name becomes the thread. You are weaving a fabric no one can see. The Beloved sees it.",
      caption: "Sat Nam. Truth on the breath.", prompt: "Sat… Nam… Sat… Nam…", imageUrl: center, holdMs: 180000 },
    { id: "surrender-heart", modality: "narrate",
      narration: "Nanak sang Japji Sahib at dawn, sitting in the river, for hours. The heart is your river. Let the Name flow through it. Do not force the flow. The river knows the way. You only need to stay in it. If the mind wanders, it is only another wave. The river underneath does not move.",
      caption: "The river of the heart. Stay in it.", imageUrl: rest, holdMs: 120000 },
    { id: "sarbat-da-bhala", modality: "narrate",
      narration: "Nanak closed every prayer with: Sarbat da bhala — may all beings be happy. Not just me. Not just my family. All beings. Hold that wish for thirty seconds. Let it widen until it includes the difficult ones. The Name is not private. It is a broadcast. Send it out.",
      caption: "Sarbat da bhala. All beings.", imageUrl: flow, holdMs: 90000 },
    { id: "close", modality: "narrate",
      narration: "Slowly open the eyes. You are the same person. The Name is still sounding. You do not need a temple. You do not need a guru sitting in front of you. You are the temple. The Name is already there. Repeat it once, silently, before you move. That repetition is the door.",
      caption: "Open eyes. The Name remains.", imageUrl: rest, holdMs: 25000 },
  ],
  closing:
    "Nanak dissolved religion into one truth: no Hindu, no Muslim, only the One. Repeat the Name until the repeater disappears. What remains is the Beloved. Just the sound. Just you.",
};
