import type { SensorialManifest } from "./types";
import tukaramImg from "@/assets/masters/tukaram.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import flow from "@/assets/sensorial/krishnamurti/02-listen.jpg";
import center from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

export const tukaramAbhangSinging: SensorialManifest = {
  key: "tukaram:abhang-singing",
  guruId: "tukaram",
  practiceMatch: "abhang singing",
  title: "Abhang Singing — Tukaram's River",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientSky as { url: string }).url,
  backdropImage: tukaramImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 11,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Tukaram was a seventeenth-century poet-saint of Maharashtra who sang abhangs — unstoppable, ecstatic poems that flowed through him like the river Bhima. He said: 'Panduranga is not in the temple. Panduranga is in the song.' Tonight we do not sing to please anyone. We sing because the song is already in the throat. It wants out.",
      caption: "Abhang — the song that wants out.", imageUrl: arrive, holdMs: 20000 },
    { id: "find-the-song", modality: "narrate",
      narration: "Feel the song behind the throat. Not a melody you learned. A hum that has been there since before you had words. It is the sound of your own existence. It does not need to be pretty. It needs to be true. Open the mouth slightly. Let the sound escape. Even a sigh is an abhang.",
      caption: "Find the hum behind the throat.", imageUrl: flow, holdMs: 30000 },
    { id: "sing-one-line", modality: "mantra",
      narration: "Sing one line. Tukaram's most repeated line: 'Tuka says: the Lord is the refuge of the refuge-less.' Or in your own words: 'I am held. I am loved. I am here.' Repeat it. Let the voice break. Let it crack. The cracked voice is the most honest one. Vitthoba does not want a perfect performance. He wants a real heart.",
      caption: "Sing one line. Let the voice break.", prompt: "I am held… I am loved…", imageUrl: center, holdMs: 180000 },
    { id: "surrender-words", modality: "narrate",
      narration: "Now drop the words. Keep the sound. A hum. A moan. A cry. The Divine hears all of them equally. The meaning was only the doorway. You have passed through it. Stay in the sound. The sound is the bridge between you and the river. The river is singing you. You are not singing the river.",
      caption: "Drop the words. Keep the hum.", imageUrl: rest, holdMs: 120000 },
    { id: "close", modality: "narrate",
      narration: "Slowly return. Tukaram's abhangs were not performances. They were prayers that refused to stay inside. Let your day be the same. When you feel something real — love, grief, gratitude — do not swallow it. Sing it. Even silently. The world needs more abhangs. It needs more people who refuse to keep the song inside.",
      caption: "Return. Do not swallow the real thing.", imageUrl: arrive, holdMs: 25000 },
  ],
  closing: "Tukaram sang until his body could not hold him. The abhangs he left behind are still sung in Maharashtra, three hundred years later. The song does not die. It only waits for another throat. Yours is that throat. The river Bhima is still flowing. Step in.",
};
