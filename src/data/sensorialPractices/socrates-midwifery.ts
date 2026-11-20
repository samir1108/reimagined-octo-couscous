import type { SensorialManifest } from "./types";
import socratesImg from "@/assets/masters/socrates.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import see from "@/assets/sensorial/krishnamurti/03-see.jpg";
import observer from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

export const socratesMidwifery: SensorialManifest = {
  key: "socrates:midwifery",
  guruId: "socrates",
  practiceMatch: "midwifery",
  title: "Midwifery — Socratic Questioning",
  voiceId: "JBFqnCBsd6RMkjVDRZzb",
  videoUrl: (ambientSky as { url: string }).url,
  backdropImage: socratesImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 10,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Socrates said he was a midwife — not because he gave birth to truth, but because he helped others give birth to the truth they already carried. Tonight we practice midwifery on your own mind. Pick a belief you hold tightly. We will not destroy it. We will ask it to show its face.",
      caption: "Midwifery. The truth is already pregnant.", imageUrl: arrive, holdMs: 20000 },
    { id: "pick-belief", modality: "narrate",
      narration: "Find a belief. Something you say is true about yourself, about another person, about how the world works. Hold it gently. You are about to examine it — not to kill it, but to see if it is alive or a dried shell. A belief that cannot withstand questioning is not a truth. It is a habit.",
      caption: "Pick a belief. Is it alive?", imageUrl: see, holdMs: 30000 },
    { id: "first-question", modality: "narrate",
      narration: "Ask the first Socratic question: 'What do you mean?' Define your terms. If you believe 'I am not good enough,' what does 'good enough' mean? Who set the standard? Is the standard yours, or did you inherit it? The definition is the first crack in the shell.",
      caption: "What do you mean? Define the terms.", imageUrl: observer, holdMs: 45000 },
    { id: "second-question", modality: "narrate",
      narration: "Second question: 'Is this always true?' Name the exceptions. If you believe 'no one listens to me,' find one time when someone did. One exception is enough to break the absoluteness of the belief. Socrates did not seek proof. He sought exception. The exception is the door.",
      caption: "Is this always true? Find the exception.", imageUrl: observer, holdMs: 45000 },
    { id: "third-question", modality: "narrate",
      narration: "Third question: 'What if the opposite were true?' Imagine the belief reversed. Not to adopt it. To see the world from its window. The mind resists this. Let it resist. The resistance is the shell cracking. On the other side of the resistance is something you have not seen because the belief was in the way.",
      caption: "What if the opposite were true?", imageUrl: see, holdMs: 60000 },
    { id: "silence", modality: "silence",
      narration: "Now put down the questions. The belief is lighter. The mind is quieter. What remains is not a new belief. It is the space in which beliefs arise and pass. Socrates called this the examined life. Not a life of correct answers. A life that does not let its furniture settle permanently in one arrangement.",
      caption: "The examined life. Furniture rearranged.", imageUrl: rest, holdMs: 120000 },
    { id: "return", modality: "narrate",
      narration: "Slowly return. The belief you picked may still be there. But now you know it is a belief, not a law. Tomorrow, when it speaks, you can say: 'I hear you. Let me ask you a question.' That one sentence is the beginning of freedom. The unexamined belief is not true or false. It is simply unexamined. And the unexamined life, Socrates said, is not worth living.",
      caption: "I hear you. Let me ask you a question.", imageUrl: arrive, holdMs: 20000 },
  ],
  closing:
    "Socrates chose questioning over safety. The unexamined belief is not true or false. It is simply unexamined. Ask one question. That is the beginning.",
};
