import type { SensorialManifest } from "./types";
import franklImg from "@/assets/masters/shankaracharya.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import inward from "@/assets/sensorial/krishnamurti/04-thought.jpg";
import witness from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

/**
 * Viktor Frankl — Meaning Logbook (logotherapy in 3 questions).
 * Not a meditation in the Eastern sense — a precise inner audit. Mic on
 * for spoken-aloud answers (voice_reply), camera off. ~14 min.
 */
export const franklMeaningLogbook: SensorialManifest = {
  key: "frankl:meaning-logbook",
  guruId: "frankl",
  practiceMatch: "meaning",
  title: "Meaning Logbook",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: franklImg,
  videoUrl: (ambientSky as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 14,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit upright at a table or with a notebook on your lap, if you wish. We will not silence the mind tonight — we will interrogate it, kindly. Between stimulus and response there is a space. In that space lies our freedom. We are going to walk into that space, deliberately.",
      caption: "Sit upright. Between stimulus and response.", imageUrl: arrive, holdMs: 22000 },
    { id: "settle", modality: "breath",
      narration: "Three slow breaths. Not to relax — to arrive. Inhale: I am here. Exhale: I am responsible. Three times.",
      caption: "I am here. I am responsible.", prompt: "Inhale here… exhale responsible…", imageUrl: arrive, holdMs: 36000 },
    { id: "q1-creating", modality: "voice_reply",
      narration: "First question. Meaning is found in three places — what we create, what we experience, and the stand we take. We begin with creating. What did I bring into being today, however small — a sentence, a meal, a kind sentence in someone else's day? Speak it aloud.",
      caption: "What did I create today?", prompt: "Today, I brought into being…", imageUrl: inward, maxListenMs: 60000 },
    { id: "q2-experiencing", modality: "voice_reply",
      narration: "Second. What did I truly experience today — a person, a beauty, a piece of work that asked for my full presence? Not what passed in front of me — what I let in. Speak it aloud.",
      caption: "What did I truly experience?", prompt: "Today, I let in…", imageUrl: witness, maxListenMs: 60000 },
    { id: "q3-stand", modality: "voice_reply",
      narration: "Third — the deepest. What suffering or limitation did I face today, and what stand did I take toward it? You cannot always change the situation. You can always choose your stance. Speak the stance.",
      caption: "What stand did I take?", prompt: "Toward what hurt me, I chose…", imageUrl: witness, maxListenMs: 75000 },
    { id: "tomorrow", modality: "voice_reply",
      narration: "One last sentence. Imagine yourself, one year from now, looking back at this week. What single act of meaning would make that future self proud? Speak it as an intention for tomorrow.",
      caption: "One act of meaning for tomorrow.", prompt: "Tomorrow, I will…", imageUrl: rest, maxListenMs: 45000 },
    { id: "close", modality: "silence",
      narration: "Sit a moment with what you just spoke. These are not promises. They are coordinates. The compass needle of meaning has been wiped clean. Tomorrow's first step is already known.",
      caption: "The compass is clean.", imageUrl: rest, holdMs: 60000 },
  ],
  closing: "He who has a why to live for can bear almost any how. You just spoke your why — three times. Write it down within the hour, or the mind will quietly overwrite it. The logbook is the practice.",
};
