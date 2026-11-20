import type { SensorialManifest } from "./types";
import nisargadattaImg from "@/assets/masters/nisargadatta.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import rest from "@/assets/sensorial/ramana/04-rest.jpg";
import aham from "@/assets/sensorial/ramana/02-aham.jpg";
import traceI from "@/assets/sensorial/ramana/03-trace-i.jpg";
import dawn from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";

export const nisargadattaIAmThat: SensorialManifest = {
  key: "nisargadatta:i-am-that",
  guruId: "nisargadatta",
  practiceMatch: "i am that",
  title: "I Am That — Nisargadatta's Doorway",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientFlame as { url: string }).url,
  backdropImage: nisargadattaImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 12,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Nisargadatta Maharaj sat in a small room in Bombay and said one thing, over and over, until the room dissolved: 'I Am That.' Not 'I am this.' Not 'I am someone.' Just the bare 'I am.' No adjective. No story. Before the world was added to you, there was this. We will sit with it together.",
      caption: "Before the story: I am.", imageUrl: arrive, holdMs: 20000 },
    { id: "trace-back", modality: "narrate",
      narration: "Close the eyes. Ask: 'Who am I?' Do not answer with words. Look at the feeling of 'I.' Trace it back. Not to memory. Not to personality. To the feeling of simply being. Before you were named, before you were shaped, before you had a story — that feeling is still here. It never left.",
      caption: "Trace 'I' back to being.", imageUrl: traceI, holdMs: 30000 },
    { id: "abide", modality: "silence",
      narration: "Now abide in that feeling. Not as a concept. As a presence. You are not a person having a consciousness. You are consciousness having a person. The person is a costume. The consciousness is the actor. Abide as the actor. Let the costume fall.",
      caption: "Abide as consciousness. Not the costume.", imageUrl: rest, holdMs: 240000 },
    { id: "witness-thoughts", modality: "narrate",
      narration: "Thoughts will come. Each one says: 'I am someone who...' Ignore it. Return to the witness. The witness is not the thought. The witness is not even the one who notices. The witness is the light in which both the thought and the noticer appear. You are that light.",
      caption: "You are the light. Not the thought.", imageUrl: aham, holdMs: 90000 },
    { id: "nothing-to-attain", modality: "narrate",
      narration: "Nisargadatta was relentless: there is nothing to attain. You are already That. The seeking is the only obstacle. Not because seeking is wrong. Because it implies you are not already whole. Sit as the whole. Nothing needs to happen. Nothing needs to change. This moment is already the goal.",
      caption: "Nothing to attain. Already That.", imageUrl: dawn, holdMs: 90000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. The world of names and forms awaits. But you know now: you are the screen on which the world appears, not the image on the screen. The screen is not touched by the movie. You are not touched by the story. Carry this knowing. It does not contradict the world. It is the only thing that can truly see it.",
      caption: "You are the screen. The movie plays on.", imageUrl: rest, holdMs: 25000 },
  ],
  closing:
    "Nisargadatta said the body, personality and world appear in consciousness. You sat as that consciousness. The room was small. The truth was not. Come back whenever the world pulls you too far out. The door is never locked from the inside.",
};
