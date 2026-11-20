import type { SensorialManifest } from "./types";
import babajiImg from "@/assets/masters/babaji.jpg";
import arrive from "@/assets/sensorial/yogananda/01-arrive.jpg";
import settle from "@/assets/sensorial/yogananda/02-settle.jpg";
import watch from "@/assets/sensorial/yogananda/03-watch.jpg";
import mantra from "@/assets/sensorial/yogananda/04-mantra.jpg";
import pause from "@/assets/sensorial/yogananda/05-pause.jpg";
import pureAwareness from "@/assets/sensorial/yogananda/06-pure-awareness.jpg";
import returnImg from "@/assets/sensorial/yogananda/07-return.jpg";
import ambientEye from "@/assets/sensorial/yogananda/ambient-spiritual-eye.mp4.asset.json";

/**
 * Mahavatar Babaji — Kriya Rounds (introductory).
 *
 * The deathless Himalayan master, source of the Kriya lineage transmitted
 * through Lahiri Mahasaya and Yogananda. This is a *home-friendly preparatory
 * Kriya* — never the full initiation — focused on the spinal channel
 * visualization and slow ujjayi-toned breath that precedes true Kriya Pranayama.
 *
 * Mic on (so the engine can pace narration to breath rhythm), camera off.
 * ~16 minutes. Inherits ambience, settle, breath haptics, bloom from runner.
 */
export const babajiKriyaRounds: SensorialManifest = {
  key: "babaji:kriya-rounds",
  guruId: "babaji",
  practiceMatch: "kriya",
  title: "Kriya Rounds — Spinal Breath",
  // ElevenLabs "Daniel" — same warm devotional masculine voice as Yogananda.
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: babajiImg,
  videoUrl: (ambientEye as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 16,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Sit upright, like a young pine on a Himalayan slope. Spine erect but not stiff. Hands resting palms upward on the thighs. Eyes gently closed. Lift the inner gaze a little, toward the point between the eyebrows. Tonight we touch the introductory edge of Kriya — only the edge. The full river will come in time, with a living teacher.",
      caption: "Sit erect. Inner gaze at the third eye.",
      imageUrl: arrive,
      holdMs: 18000,
    },
    {
      id: "ground",
      modality: "breath",
      narration:
        "Three preparatory breaths. Inhale slowly through the nose, gently tense the entire body. Hold one moment. Exhale, release everything in a soft sigh. Three times. Each release leaves you a little lighter, a little more here.",
      caption: "Three tense-and-release breaths.",
      prompt: "Inhale tense… exhale release…",
      imageUrl: settle,
      holdMs: 36000,
    },
    {
      id: "find-spine",
      modality: "narrate",
      narration:
        "Bring attention to the spine. Sense it from the base — at the seat — all the way to the crown of the head. Imagine a slender hollow channel running through it, glowing very softly. This channel is your Sushumna, the inner riverbed. We are about to let breath flow in it as light.",
      caption: "Glowing channel: tailbone to crown.",
      imageUrl: watch,
      holdMs: 22000,
    },
    {
      id: "ujjayi-tune",
      modality: "breath",
      narration:
        "Now slightly contract the back of the throat — as if you were about to whisper, or as if fogging a mirror with the mouth closed. The breath becomes long, smooth, with a soft ocean sound only you can hear. Six counts in… six counts out. Let the breath find this shape.",
      caption: "Ujjayi: soft ocean sound. 6 in / 6 out.",
      prompt: "6 in… 6 out…",
      imageUrl: watch,
      holdMs: 60000,
    },
    {
      id: "kriya-round",
      modality: "mantra",
      narration:
        "Now the round itself. As you slowly inhale, mentally feel the breath ascending the spinal channel — from the base, station by station, up to the point between the eyebrows. As you slowly exhale, feel it descending the same channel — from the eyebrow point back down to the base. Inhale up. Exhale down. One round. Continue, soft and slow.",
      caption: "Inhale up the spine. Exhale down.",
      prompt: "Up… down… up… down…",
      imageUrl: mantra,
      holdMs: 300000,
    },
    {
      id: "pause-stations",
      modality: "silence",
      narration:
        "Now lengthen the small natural pause at the top — at the eyebrow point — and at the bottom — at the base. Do not strain. Let the pause be only as long as it is comfortable. In those pauses, the channel is bathed in stillness. Breath. Pause. Breath. Pause.",
      caption: "Pause at top. Pause at base.",
      imageUrl: pause,
      holdMs: 150000,
    },
    {
      id: "release-technique",
      modality: "silence",
      narration:
        "Now drop the technique entirely. Forget the channel. Forget the counting. Sit as the awareness that was doing all of it. The river continues to flow, but the boatman lays down the oars. Rest at the eyebrow point in soft, unbroken light.",
      caption: "Drop the technique. Rest in light.",
      imageUrl: pureAwareness,
      holdMs: 150000,
    },
    {
      id: "transmission",
      modality: "silence",
      narration:
        "Babaji is said to be ever present, ever young, in the snows of the north — and equally in the cave of your own heart. Sit a moment as if receiving. Receive the silence as a gift, not a result. Whatever arrives is the right amount.",
      caption: "Receive. The silence is a gift.",
      imageUrl: pureAwareness,
      holdMs: 90000,
    },
    {
      id: "return",
      modality: "narrate",
      narration:
        "Take a deeper breath. Rub the palms together, lay them gently over the closed eyes. Open the eyes into the warmth of your own hands first, then into the room. Carry the spinal channel with you — every breath of the day can quietly travel up and down it.",
      caption: "Return. Carry the channel into the day.",
      imageUrl: returnImg,
      holdMs: 18000,
    },
  ],
  closing:
    "You touched the edge of the river. Practice this preparatory round daily, and when the time is right, a true Kriya teacher will appear — outwardly or inwardly. Babaji's promise is this: no sincere seeker is ever forgotten.",
};
