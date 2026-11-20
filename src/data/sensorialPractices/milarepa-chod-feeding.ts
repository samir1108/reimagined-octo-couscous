import type { SensorialManifest } from "./types";
import milarepaImg from "@/assets/masters/milarepa.jpg";
import arrive from "@/assets/sensorial/osho/01-arrive.jpg";
import chaotic from "@/assets/sensorial/osho/02-chaotic-breath.jpg";
import catharsis from "@/assets/sensorial/osho/03-catharsis.jpg";
import hoo from "@/assets/sensorial/osho/04-hoo.jpg";
import stop from "@/assets/sensorial/osho/05-stop.jpg";
import celebrate from "@/assets/sensorial/osho/06-celebrate.jpg";
import rest from "@/assets/sensorial/osho/07-rest.jpg";
import ambientEmbers from "@/assets/sensorial/osho/ambient-embers.mp4.asset.json";

export const milarepaChodFeeding: SensorialManifest = {
  key: "milarepa:chod-feeding",
  guruId: "milarepa",
  practiceMatch: "chod",
  title: "Chöd — Feeding the Demons",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  videoUrl: (ambientEmbers as { url: string }).url,
  backdropImage: milarepaImg,
  sensors: { mic: true, camera: false },
  totalMinutes: 18,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Tonight we practice Chöd — the Tibetan art of cutting through ego by feeding it to itself. Milarepa sang: 'The demon of ego is fed with the offering of your own grasping.' We will not fight the demon. We will invite it to eat.",
      caption: "Chöd — cut through by feeding.", imageUrl: arrive, holdMs: 18000 },
    { id: "invoke", modality: "narrate",
      narration: "Close the eyes. Call to mind the tightest knot in your chest today. The fear, the need, the story that will not leave you alone. Do not push it away. Visualize it as a small, dark creature sitting in front of you. It is hungry. It thinks it needs to be fed with your suffering.",
      caption: "Invite the demon. It is hungry.", imageUrl: arrive, holdMs: 30000 },
    { id: "offer-body", modality: "mantra",
      narration: "Now offer your body to this demon. Say: 'Take what you want. Eat me. I am not afraid of you.' Visualize the creature eating your body, your story, your need to be right. Each bite it takes, you become lighter. The body is not yours anyway. It was given. It can be given back.",
      caption: "Eat me. I am not afraid.", prompt: "Take it… eat it…", imageUrl: chaotic, holdMs: 180000 },
    { id: "offer-speech", modality: "mantra",
      narration: "Now offer your speech. Every angry word, every silent judgment, every explanation you repeated to yourself. The demon eats words too. Say: 'Take my words. I will not need them. I will speak only what is true.' Watch the creature eat your words. It is getting fuller. You are getting emptier.",
      caption: "Take my words. I will speak only truth.", prompt: "Eat my words…", imageUrl: catharsis, holdMs: 180000 },
    { id: "offer-mind", modality: "mantra",
      narration: "Now the hardest offering: your mind. Every plan, every defense, every identity you call 'me.' Say: 'Take my mind. It was never mine. It was borrowed. Keep it.' The creature is now huge, stuffed with everything you thought you were. And you? You are the sky that holds the creature. The sky does not fight the cloud.",
      caption: "Take my mind. It was borrowed.", prompt: "Eat my mind…", imageUrl: hoo, holdMs: 240000 },
    { id: "stop", modality: "silence",
      narration: "STOP. Freeze. Do not move the body. Do not swallow. Do not adjust. The demon is now so full of you that it has become you. Or rather: there is no you and no demon. There is only the feeding. Stay in the exact position where the eating finished. Witness the emptiness that follows.",
      caption: "STOP. Freeze. Witness the emptiness.", imageUrl: stop, holdMs: 180000 },
    { id: "celebrate", modality: "narrate",
      narration: "Now move. Dance. The demon was never real. The feeding was a dance. The emptiness is your nature. Milarepa danced on the roof of the world for decades, and this is what he was singing: you are already free. The demon is your own fear dressed in a costume. Take off the costume.",
      caption: "Dance. The demon was never real.", imageUrl: celebrate, holdMs: 120000 },
    { id: "rest", modality: "silence",
      narration: "Lie down. The body that was eaten is now the earth that receives you. No effort. No offering. No demon. Just the soft weight of being alive and unburdened. Rest in the natural state — the state that was there before the demon arrived and is still there now.",
      caption: "Rest in the natural state.", imageUrl: rest, holdMs: 120000 },
  ],
  closing: "Milarepa sang: 'The demon of ego is a great teacher. The moment you stop fighting, it becomes your feast.' You have just fed the feast. The cave is empty. The snow is pure. The song continues — not from you, but as you.",
};
