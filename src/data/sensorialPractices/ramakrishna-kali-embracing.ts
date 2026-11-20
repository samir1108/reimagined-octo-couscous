import type { SensorialManifest } from "./types";
import ramakrishnaImg from "@/assets/masters/ramakrishna.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import listen from "@/assets/sensorial/krishnamurti/02-listen.jpg";
import observer from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

export const ramakrishnaKaliEmbracing: SensorialManifest = {
  key: "ramakrishna:kali-embracing",
  guruId: "ramakrishna",
  practiceMatch: "kali embracing",
  title: "Kali Embracing — Ramakrishna's Door",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientSky as { url: string }).url,
  backdropImage: ramakrishnaImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 13,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Ramakrishna lived in the temple of Kali, not as priest, but as child. He said: 'The Mother is not far. She is closer than your own breath.' Tonight we do not worship Kali as distant. We let her come close enough to eat the fear you have been carrying. She is not outside you. She is the force that holds your hand even when you think it is empty.",
      caption: "Kali is closer than your breath.", imageUrl: arrive, holdMs: 20000 },
    { id: "name-the-fear", modality: "voice_reply",
      narration: "Whisper aloud the fear you would most like Kali to eat. Not the noble fear. The real one — the one you do not say out loud. The fear of being alone. Of being unlovable. Of being found out. Speak it. Kali does not judge fears. She devours them.",
      caption: "Name the fear. Kali devours it.", prompt: "The fear I give to Kali is…", imageUrl: listen, maxListenMs: 30000 },
    { id: "offer-body", modality: "narrate",
      narration: "Now offer your body to the Mother. Say inwardly: 'Take this body. It is yours. I have guarded it too tightly. I have made it my god. Take it back. I want you more than I want it.' The body is not the enemy. It is the first gift. The Mother receives it gently.",
      caption: "Offer the body. She receives it.", imageUrl: arrive, holdMs: 60000 },
    { id: "offer-mind", modality: "narrate",
      narration: "Offer the mind. Every plan, every defense, every clever story about why you are special or broken. She eats stories for breakfast. Say: 'Take my mind. It has been a noisy servant. Make it quiet. Or make it sing. It is yours.' The mind that is given to the Divine becomes a instrument, not a tyrant.",
      caption: "Offer the mind. It becomes an instrument.", imageUrl: observer, holdMs: 90000 },
    { id: "mantra", modality: "mantra",
      narration: "Now let the name rise. Kali. Ma. Durga. Bhavatarini. Whatever name your throat knows. Repeat it. Not as a word. As a door. Each repetition opens the door one inch more. The Mother is standing on the threshold. She is not coming in. You are going out to meet her. The distance is one repetition.",
      caption: "Kali. Ma. Durga. The door opens.", prompt: "Kali… Ma… Durga…", imageUrl: listen, holdMs: 180000 },
    { id: "embrace", modality: "silence",
      narration: "Stop the mantra. Feel the embrace. Not a metaphor. The Mother is holding you right now. The chest that rises and falls is her breath. The heart that beats is her drum. The tears that come are her language. You are not sitting in a room. You are sitting in the lap of the Divine. Let yourself be small. That is the only size that fits inside the embrace.",
      caption: "You are small. She is holding you.", imageUrl: rest, holdMs: 180000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. The world will look the same. But you are not the same. You have been held by something that does not let go. Carry that holding into your next hour. When fear rises, remember: Kali is already eating it. You do not need to fight. You only need to let her.",
      caption: "Return. Kali is already eating your fear.", imageUrl: arrive, holdMs: 25000 },
  ],
  closing: "Ramakrishna said: 'The Mother is not far. She is in your own heart.' You sat in that heart. The embrace was not a feeling. It was the truth of what is already here. Come back whenever the world feels cold. The Mother's kitchen is always open. She feeds on fear and returns courage.",
};
