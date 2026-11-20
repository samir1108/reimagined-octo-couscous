import type { SensorialManifest } from "./types";
import vivekanandaImg from "@/assets/masters/vivekananda.jpg";
import arrive from "@/assets/sensorial/krishnamurti/01-arrive.jpg";
import listen from "@/assets/sensorial/krishnamurti/02-listen.jpg";
import see from "@/assets/sensorial/krishnamurti/03-see.jpg";
import inward from "@/assets/sensorial/krishnamurti/05-observer.jpg";
import rest from "@/assets/sensorial/krishnamurti/07-return.jpg";
import ambientSky from "@/assets/sensorial/krishnamurti/ambient-sky.mp4.asset.json";

/**
 * Swami Vivekananda — Pratyahara (Withdrawal of the Senses).
 *
 * Raja Yoga, 5th limb. The senses are reined in from their objects, the way
 * a tortoise withdraws its limbs into the shell. Mic stays on (so the engine
 * can detect ambient sound and lengthen silence if the room is quiet);
 * camera off — this is an inward turn, not a watched one.
 *
 * Compressed home-friendly variant (~17 min). Inherits ambience bed,
 * settle pre-roll, breath haptics and closure bloom from the runner.
 */
export const vivekanandaPratyahara: SensorialManifest = {
  key: "vivekananda:pratyahara",
  guruId: "vivekananda",
  practiceMatch: "pratyahara",
  title: "Pratyahara — Withdrawal",
  // ElevenLabs "Adam" — clear, lion-roar masculine. Falls back to default if absent.
  voiceId: "pNInz6obpgDQGcFmaJgB",
  backdropImage: vivekanandaImg,
  videoUrl: (ambientSky as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 17,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Sit upright. The spine, the neck, the head — in one straight line. Hands resting easy on the knees. Close the eyes. Tonight we shall do what Patanjali calls Pratyahara — the drawing in of the senses. Not killing them. Not fighting them. Simply calling them home, as a tortoise draws its limbs into the shell.",
      caption: "Sit straight. Spine, neck, head — one line.",
      imageUrl: arrive,
      holdMs: 18000,
    },
    {
      id: "name-the-five",
      modality: "narrate",
      narration:
        "First, recognize the five horses that pull this chariot of the body. Eyes — racing after every form. Ears — chasing every sound. Nose, tongue, skin — each running outward. They are not your enemies. They are servants who have forgotten their master. We are about to remind them.",
      caption: "Five senses. Five servants. One master.",
      imageUrl: arrive,
      holdMs: 22000,
    },
    {
      id: "release-eyes",
      modality: "silence",
      narration:
        "Begin with the eyes. Behind the closed lids, let the eyeballs become soft, heavy, sinking back into the skull. There is nothing to look at, even inwardly. Let the seeing rest. Let the eyes become like two still pools.",
      caption: "Eyes — soft, heavy, sinking back.",
      imageUrl: see,
      holdMs: 60000,
    },
    {
      id: "release-ears",
      modality: "silence",
      narration:
        "Now the ears. Sounds will come — a vehicle, a voice, a creak of the house. Do not push them away, do not chase them. Hear them as if from the bottom of a well — distant, harmless, already passing. The hearing rests behind the sound.",
      caption: "Ears open. Hearing rests behind the sound.",
      imageUrl: listen,
      holdMs: 75000,
    },
    {
      id: "release-tongue-nose-skin",
      modality: "silence",
      narration:
        "Now the tongue, the nose, the skin. Whatever taste lingers in the mouth — let it be. Whatever scent is in the air — let it be. Whatever the skin touches — the cloth, the seat, the breath of air — let it be. Three more horses are returning to the stable.",
      caption: "Tongue, nose, skin — let them all rest.",
      imageUrl: inward,
      holdMs: 90000,
    },
    {
      id: "tortoise",
      modality: "breath",
      narration:
        "Now the long inward gathering. With each slow inhale, feel the senses being drawn one inch further inside. With each slow exhale, feel them settling like petals folding at dusk. Inhale — gather. Exhale — fold. The tortoise withdraws.",
      caption: "Inhale — gather. Exhale — fold.",
      prompt: "Inhale gather… exhale fold…",
      imageUrl: inward,
      holdMs: 180000,
    },
    {
      id: "inner-room",
      modality: "silence",
      narration:
        "The horses are home. The chariot stands still. You are now inside a room you rarely visit — the room behind the senses. There is no picture on its walls, no sound in its air. Only a quiet, awake presence. Sit here. Get acquainted with this room. It has always been yours.",
      caption: "Sit in the room behind the senses.",
      imageUrl: rest,
      holdMs: 240000,
    },
    {
      id: "stay",
      modality: "silence",
      narration:
        "Do not try to think anything. Do not try to stop thinking. The senses will try, once or twice, to wander out again. Each time, gently — without scolding — call them back. This calling back, this turning in, again and again, is itself the practice.",
      caption: "Whenever a sense wanders — gently call it home.",
      imageUrl: rest,
      holdMs: 180000,
    },
    {
      id: "return",
      modality: "narrate",
      narration:
        "Now, slowly, allow the senses to step outside again — but this time as servants who know their master. Hear one sound in the room. Feel the air on the skin. Take a deeper breath. Open the eyes only when ready. You leave the room behind the senses, but you take the key with you.",
      caption: "Open the eyes. Keep the key.",
      imageUrl: arrive,
      holdMs: 18000,
    },
  ],
  closing:
    "Strength, my friend — that is the one word. You have just shown the senses who is master. Do this even five minutes a day, and the whole of life begins to obey a quieter command. Arise, awake, and stop not till the goal is reached.",
};
