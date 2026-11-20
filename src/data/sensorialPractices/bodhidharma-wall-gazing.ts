import type { SensorialManifest } from "./types";
import bodhidharmaImg from "@/assets/masters/bodhidharma.jpg";
import arrive from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";
import sit from "@/assets/sensorial/buddha-bodyscan/05-whole.jpg";
import rest from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

export const bodhidharmaWallGazing: SensorialManifest = {
  key: "bodhidharma:wall-gazing",
  guruId: "bodhidharma",
  practiceMatch: "wall-gazing",
  title: "Wall-Gazing — Bodhidharma's Origin",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientSky as { url: string }).url,
  backdropImage: bodhidharmaImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 15,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Face a blank wall. No decoration, no phone, no window if possible. Bodhidharma sat facing a wall for nine years. Not as punishment. As the most direct possible question: who is sitting here? The wall does not answer. The mind does not answer. The body does not answer. Only the sitting remains.",
      caption: "Face the wall. Nine years. One question.", imageUrl: arrive, holdMs: 25000 },
    { id: "no-thought", modality: "silence",
      narration: "Do not try to stop thought. Do not try to produce thought. Sit as if the wall is the only thing that exists, and you are the only thing that notices the wall. Thought will come. Thought will go. You are not the thought. You are not even the thinker. You are the noticing.",
      caption: "Not thought. Not thinker. Noticing.", imageUrl: sit, holdMs: 300000 },
    { id: "cold-limbs", modality: "narrate",
      narration: "The legs will go numb. The back will ache. The mind will invent a hundred reasons to stand up. This is the monastery of the body. You are a guest. Do not rearrange the furniture. The discomfort is not an obstacle. It is the curriculum. Stay until the discomfort changes into something else — or until it disappears.",
      caption: "Numbness. Ache. Stay.", imageUrl: sit, holdMs: 240000 },
    { id: "no-window", modality: "silence",
      narration: "Bodhidharma is said to have cut off his own eyelids to stay awake. We will not do that. But we will close the window of sensory input. Behind the closed eyes, behind the wall, behind the breath, there is a space that does not move. Sit there. Do not improve it. Do not decorate it. It is already the sanctuary.",
      caption: "Close every window. Sit in the sanctuary.", imageUrl: rest, holdMs: 300000 },
    { id: "transmission", modality: "narrate",
      narration: "Bodhidharma said: 'I do not know. I do not know.' This was his entire transmission. Not a doctrine. Not a technique. The honest confession that the wall does not yield answers — only the sitting does. And the sitting yields nothing either. It simply is. That is enough.",
      caption: "I do not know. That is the transmission.", imageUrl: rest, holdMs: 120000 },
    { id: "return", modality: "narrate",
      narration: "Now slowly return. Move the fingers. Move the toes. Do not rush. The wall will still be there tomorrow. You do not need to dissolve it. You only need to sit with it long enough to realize: the separation between you and the wall was a thought. It never existed.",
      caption: "Return slowly. The separation was a thought.", imageUrl: arrive, holdMs: 30000 },
  ],
  closing: "Bodhidharma came from India to China, sat facing a wall, and transmitted Zen with a single soundless gesture: he did not move. You have done the same, for a fraction of the time, in a fraction of the cold. The wall does not care how long you sit. It is the sitting that cares. Keep sitting.",
};
