import type { SensorialManifest } from "./types";
import aurobindoImg from "@/assets/masters/aurobindo.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import settle from "@/assets/sensorial/yogananda/02-settle.jpg";
import watch from "@/assets/sensorial/yogananda/03-watch.jpg";
import mantra from "@/assets/sensorial/yogananda/04-mantra.jpg";
import pureAwareness from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import returnImg from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

export const aurobindoIntegralYoga: SensorialManifest = {
  key: "aurobindo:integral-yoga",
  guruId: "aurobindo",
  practiceMatch: "integral yoga",
  title: "Integral Yoga — Aurobindo's Open Door",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientEye as { url: string }).url,
  backdropImage: aurobindoImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 14,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Sri Aurobindo did not teach withdrawal. He taught the opposite: that all of life is yoga. The body, the emotions, the mind, the work, the relationships — none of it is outside the practice. Tonight we practice not by leaving the world, but by opening every door of the house at once. The Divine is not hiding. The Divine is in every room.",
      caption: "All of life is yoga.", imageUrl: arrive, holdMs: 20000 },
    { id: "invite-all-parts", modality: "narrate",
      narration: "Aurobindo insisted on the integral path: do not ignore any part of yourself. The thinking mind. The feeling heart. The acting body. The restless will. Each one is a door. Invite them all. Say inwardly: 'I open the door of thought. I open the door of feeling. I open the door of action. I open the door of will. All are welcome here.'",
      caption: "Open every door. All are welcome.", imageUrl: settle, holdMs: 30000 },
    { id: "surrender-effort", modality: "silence",
      narration: "Now surrender the effort to perfect yourself. Aurobindo called this psychic surrender — not giving up, but handing the instrument to the Divine. You are the flute. The breath is not yours. The music is not yours. The listener is not yours. Hand the flute. The music plays itself.",
      caption: "Surrender the flute. The music plays itself.", imageUrl: watch, holdMs: 180000 },
    { id: "light-from-above", modality: "narrate",
      narration: "Aurobindo spoke of a descent of light from above — not a metaphor. In this sitting, imagine a light entering the crown, filling the head, the throat, the heart, the belly, the legs, the feet. Not a visualization. A permission. The light is already there. You are only letting it enter.",
      caption: "Let the light enter. Top to toe.", imageUrl: mantra, holdMs: 90000 },
    { id: "no-rejection", modality: "narrate",
      narration: "Here is the hardest part: do not reject anything in yourself. The ugly thought. The petty jealousy. The resistance. They are also doors. The light does not choose. It enters every room. Aurobindo did not teach purity. He taught completeness. You are incomplete without your shadow. Invite it in.",
      caption: "Invite the shadow. Light enters there too.", imageUrl: pureAwareness, holdMs: 90000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. This sitting was not a vacation from your life. It was a rehearsal. The same openness you felt here — open it at your desk, in your kitchen, in your conversation. Integral yoga does not end when you stand up. It begins when you stand up. Carry every open door with you.",
      caption: "Rehearsal over. Carry the open doors.", imageUrl: returnImg, holdMs: 25000 },
  ],
  closing:
    "Aurobindo taught that all of life is yoga. You opened every door. The Divine walks the whole house. Carry that openness into the day.",
};
