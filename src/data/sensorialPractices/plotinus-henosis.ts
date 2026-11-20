import type { SensorialManifest } from "./types";
import plotinusImg from "@/assets/masters/plotinus.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import traceI from "@/assets/sensorial/ramana/03-trace-i.jpg";
import rest from "@/assets/sensorial/ramana/04-rest.jpg";
import dawn from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";
import aham from "@/assets/sensorial/ramana/02-aham.jpg";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";

export const plotinusHenosis: SensorialManifest = {
  key: "plotinus:henosis",
  guruId: "plotinus",
  practiceMatch: "henosis",
  title: "Henosis — Return to the One",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientFlame as { url: string }).url,
  backdropImage: plotinusImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 12,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Plotinus, the founder of Neoplatonism, taught henosis: the mystical union with the One. Not a god. Not a person. The source before all sources. The light before all light. You are not separate from it. The separation is a forgetting. Tonight we remember. Not by thinking. By undoing.",
      caption: "Henosis. Return to the One.", imageUrl: arrive, holdMs: 20000 },
    { id: "ascent", modality: "narrate",
      narration: "Plotinus described an ascent through the levels of being. From the body — up through the soul — up through the intellect — to the One. Do not imagine it. Feel it. Let attention rise from the feet, through the legs, the belly, the chest, the throat, the head, beyond. You are climbing the inside of yourself.",
      caption: "Ascent: body → soul → intellect → One.", imageUrl: traceI, holdMs: 45000 },
    { id: "beyond-being", modality: "silence",
      narration: "Stop at no level. Even the intellect is a veil. Even the soul is a garment. The One is beyond being. Not nothing. Beyond the distinction between something and nothing. Sit there. No concept. No image. No sound. No silence. Just the prior to all of it. You are already there.",
      caption: "Beyond being. Prior to all.", imageUrl: rest, holdMs: 240000 },
    { id: "no-multiplicity", modality: "narrate",
      narration: "Plotinus said: 'The One is all, and all is the One.' Not as philosophy. As experience. The wall, the chair, the breath, the thought — all the same substance, wearing different masks. Look at the room. See the One wearing many costumes. You are not a costume. You are the wearer. The wearer is the One.",
      caption: "All is the One. Wearing costumes.", imageUrl: dawn, holdMs: 60000 },
    { id: "ecstasy", modality: "narrate",
      narration: "Plotinus claimed to have touched the One four times in his life. He called it ecstasy — not excitement, but a standing outside the self. You do not need four times. You need once. This sitting is that once. Do not expect lightning. The One does not announce itself. It is the silence after the announcement. You are already in it.",
      caption: "Ecstasy. Standing outside the self.", imageUrl: aham, holdMs: 90000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. The world of multiplicity awaits. But you now know it is a surface. Beneath it, everything is one. You can touch the world with this knowledge. It changes the weight of every object. The cup is still a cup. But the hand that holds it is the hand of the One. Drink from it with that knowledge.",
      caption: "Return. The world is a surface.", imageUrl: rest, holdMs: 25000 },
  ],
  closing:
    "Plotinus taught henosis: the return to the One. You remembered. The world is a surface. Beneath it, everything is one. Walk as one who remembers.",
};
