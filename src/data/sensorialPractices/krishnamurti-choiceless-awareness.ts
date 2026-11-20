import type { SensorialManifest } from "./types";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import listen from "@/assets/sensorial/krishnamurti/02-listen.jpg";
import see from "@/assets/sensorial/krishnamurti/03-see.jpg";
import thought from "@/assets/sensorial/krishnamurti/04-thought.jpg";
import observer from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import choiceless from "@/assets/sensorial/krishnamurti/06-choiceless.jpg";
import returnImg from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

/**
 * J. Krishnamurti — Choiceless Awareness
 * Pure passive observation. No technique, no chooser, no goal.
 * Just listening and seeing without naming, without preference.
 * Mic on (ambient room sounds become the practice). Camera optional.
 * ~13 minutes.
 */
export const krishnamurtiChoicelessAwareness: SensorialManifest = {
  key: "krishnamurti:choiceless-awareness",
  guruId: "krishnamurti",
  practiceMatch: "choiceless-awareness",
  title: "Choiceless Awareness",
  // ElevenLabs "George" — clear, mature, English, with quiet authority.
  voiceId: "JBFqnCBsd6RMkjVDRZzb",
  backdropImage: choiceless,
  videoUrl: (ambientSky as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 13,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Sit comfortably. Not stiffly, not slumped. Simply at ease. There is no method here, no system, no goal. We are not trying to become anything. We are only going to look — to listen — to be aware. That is all.",
      caption: "Sit at ease. No method. No goal.",
      imageUrl: arrive,
      holdMs: 15000,
    },
    {
      id: "listen-to-sound",
      modality: "silence",
      narration:
        "First, listen. Listen to every sound around you — near sounds, far sounds. The sound of a vehicle, a bird, your own breath, the silence underneath. Do not name them. Do not say 'this is good, this is irritating'. Just listen. Let every sound enter you completely.",
      caption: "Listen to every sound. Do not name.",
      imageUrl: listen,
      holdMs: 90000,
    },
    {
      id: "see-without-naming",
      modality: "silence",
      narration:
        "Now, with eyes softly open or closed, look at whatever is in front of you — or in your mind's eye. A leaf, a wall, a spot of light. Look at it without the word. Without saying 'leaf', 'wall', 'light'. Pure seeing, before the word comes in.",
      caption: "See without the word.",
      imageUrl: see,
      holdMs: 90000,
    },
    {
      id: "watch-thought",
      modality: "silence",
      narration:
        "A thought will arise. It always does. Watch it as you would watch a cloud crossing a wide sky. Do not push it away. Do not follow it. Do not call it good or bad. Just watch — with the same quiet attention you gave the sounds.",
      caption: "Watch thought like a passing cloud.",
      imageUrl: thought,
      holdMs: 120000,
    },
    {
      id: "no-chooser",
      modality: "narrate",
      narration:
        "Notice — when you are simply aware, there is no one choosing 'I will look at this, I will not look at that'. There is only awareness, in which everything is allowed. This is choiceless awareness. Not the awareness of a watcher. Just awareness itself.",
      caption: "No chooser. Only awareness.",
      imageUrl: choiceless,
      holdMs: 30000,
    },
    {
      id: "observer-is-observed",
      modality: "silence",
      narration:
        "Now look closely. Is there a 'you' watching the thought? Or is the watcher itself another thought? Stay with this question — gently, without forcing an answer. The observer and the observed — see if they are two, or one movement.",
      caption: "Is the watcher separate from the watched?",
      imageUrl: observer,
      holdMs: 150000,
    },
    {
      id: "rest-in-awareness",
      modality: "silence",
      narration:
        "Now let even the question dissolve. Sit in the open field of pure awareness. Sound, sight, thought, sensation — all moving freely through it. Nothing rejected. Nothing held. This is not a technique. This is your natural state.",
      caption: "Rest as awareness itself.",
      imageUrl: choiceless,
      holdMs: 180000,
    },
    {
      id: "return",
      modality: "narrate",
      narration:
        "When you are ready, take a breath. Let the eyes open softly. Carry this quality of looking into the next moment of your day — at a face, at a tree, at your own reaction. Look without the word. That is meditation. It does not end when you stand up.",
      caption: "Carry the looking into the day.",
      imageUrl: returnImg,
      holdMs: 15000,
    },
  ],
  closing:
    "You did not 'do' anything today. You only allowed awareness to be what it already is. The truth is a pathless land — and you walked it for thirteen minutes. Walk it again whenever you remember.",
};
