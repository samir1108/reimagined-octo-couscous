import type { SensorialManifest } from "./types";
import kabirImg from "@/assets/masters/kabir.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import settle from "@/assets/sensorial/yogananda/02-settle.jpg";
import mantra from "@/assets/sensorial/yogananda/04-mantra.jpg";
import pause from "@/assets/sensorial/yogananda/05-pause.jpg";
import pureAwareness from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import returnImg from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

export const kabirSuratShabd: SensorialManifest = {
  key: "kabir:surat-shabd",
  guruId: "kabir",
  practiceMatch: "surat shabd",
  title: "Surat Shabd — Sound Current",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientEye as { url: string }).url,
  backdropImage: kabirImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 12,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Kabir sang: 'The fragrance of the Beloved is in the air, but the moth does not know the way to the lamp.' Tonight we learn the way. Not through books, not through rituals, but through the inner sound — the Anahata, the unstruck sound that is already playing in the silence behind your ears.",
      caption: "The inner sound is already playing.", imageUrl: arrive, holdMs: 20000 },
    { id: "listen-outer", modality: "silence",
      narration: "First, listen to the farthest sound you can hear. A vehicle, a bird, a hum in the walls. Let the outer sounds enter without naming them. The ears are open. Sound is arriving. You are not doing anything. Sound is doing itself. You are the space in which it happens.",
      caption: "Listen to the farthest sound.", imageUrl: settle, holdMs: 45000 },
    { id: "listen-inner", modality: "silence",
      narration: "Now let the outer sounds fade. Behind them, there is another sound — not a noise, but a hum. Like a tuning fork that was struck years ago and never stopped. It is high, thin, constant. It is the sound of your own attention listening to itself. Listen to that.",
      caption: "Behind the noise — the inner hum.", imageUrl: settle, holdMs: 120000 },
    { id: "follow-sound", modality: "narrate",
      narration: "Kabir said: 'Listen to the unstruck sound, and you will never die.' The sound is not something you hear with the ears. It is something you hear with the attention. Follow it. It leads inward, away from the body, away from thought, toward the center from which all sounds arise.",
      caption: "Follow the sound inward.", imageUrl: mantra, holdMs: 120000 },
    { id: "the-pause", modality: "silence",
      narration: "Between two thoughts, there is a pause. Between two breaths, there is a pause. Between two heartbeats, there is a pause. In that pause, the sound is loudest. Not louder in volume — louder in presence. Rest in the pause. The sound does not leave. You are simply close enough to hear it clearly.",
      caption: "Rest in the pause between breaths.", imageUrl: pause, holdMs: 150000 },
    { id: "the-current", modality: "breath",
      narration: "Now feel the breath as sound. Inhale — the sound rises. Exhale — the sound falls. You are riding the sound current. It is carrying you. You are not breathing. The breath is breathing you. Kabir calls this the 'current of the Beloved.' Let it pull.",
      caption: "Ride the current. Let it pull.", prompt: "Sound rises… sound falls…", imageUrl: pureAwareness, holdMs: 180000 },
    { id: "no-more-seeking", modality: "narrate",
      narration: "Kabir's final teaching: stop seeking. You have been seeking the Beloved everywhere except where the Beloved actually lives — in the center of your own chest, behind the sound, in the pause. You are not far. You have never been far. The lamp was always right here.",
      caption: "Stop seeking. The lamp is here.", imageUrl: pureAwareness, holdMs: 60000 },
    { id: "return", modality: "narrate",
      narration: "Slowly open the ears to the outer world again. But keep one ear turned inward. The sound does not stop when you open your eyes. It continues. Kabir says: 'Wherever you go, the Beloved goes.' The sound is the signature of that presence. Listen as you walk.",
      caption: "Keep one ear turned inward.", imageUrl: returnImg, holdMs: 25000 },
  ],
  closing: "Kabir wove his songs on a loom and sang them in the marketplace. The unstruck sound is not hidden in a cave. It is in the noise of the world, underneath everything. Tune to it once, and you will never be lonely again. The Beloved is always humming. You just needed to stop long enough to hear.",
};
