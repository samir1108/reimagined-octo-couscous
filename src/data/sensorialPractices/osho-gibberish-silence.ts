import type { SensorialManifest } from "./types";
import arrive from "@/assets/sensorial/osho/01-arrive.jpg";
import gibberish from "@/assets/sensorial/osho/03-catharsis.jpg";
import stop from "@/assets/sensorial/osho/05-stop.jpg";
import rest from "@/assets/sensorial/osho/07-rest.jpg";
import ambientEmbers from "@/assets/sensorial/osho/ambient-embers.mp4.asset.json";

/**
 * Osho — Gibberish → Silence (Mandali technique).
 * Two complementary halves: total verbal catharsis (gibberish) followed by
 * total inner silence. Microphone tracks vocal intensity in stage 2 so the
 * engine can extend silence if the user is still settling.
 *
 * Compressed home-friendly variant (~18 min). Stand or sit — no posture rules.
 * Inherits ambience bed, settle pre-roll, breath haptics and closure bloom
 * automatically from SensorialPracticeSession.
 */
export const oshoGibberishSilence: SensorialManifest = {
  key: "osho:gibberish-silence",
  guruId: "osho",
  practiceMatch: "gibberish",
  title: "Gibberish → Silence",
  // ElevenLabs "Brian" — same warm, mischievous masculine timbre as Dynamic.
  voiceId: "nPczCjzI2devNBz1zQrb",
  backdropImage: arrive,
  videoUrl: (ambientEmbers as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 18,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Eyes closed. Stand or sit — it does not matter. We are going to do two things only: first, throw out the mind through the mouth. Then, fall into the silence that is left behind. The mind is a chatterbox. Tonight, we let it have its full say — in a language that means nothing.",
      caption: "Eyes closed. Two halves. Nothing to remember.",
      imageUrl: arrive,
      holdMs: 22000,
    },
    {
      id: "warm-tongue",
      modality: "breath",
      narration:
        "Loosen the jaw. Let the tongue hang loose for a moment. Take three slow breaths — in through the nose, out through the mouth with a sigh. Feel the throat open. The voice is about to become wild.",
      caption: "Loose jaw. Three sighing breaths.",
      prompt: "Inhale… long sigh out…",
      imageUrl: arrive,
      holdMs: 30000,
    },
    {
      id: "gibberish",
      modality: "mantra",
      narration:
        "Stage one — gibberish. Make any sounds you like, in any language you do not know. Talk in a tongue no one understands. Argue, sing, shout, mumble, complain, plead — but in pure nonsense. Let the body move with the sounds. Throw the mind out through the mouth. Eight minutes. Be total.",
      caption: "Gibberish. Total. No real words.",
      prompt: "Speak the unspeakable.",
      imageUrl: gibberish,
      holdMs: 480000,
    },
    {
      id: "stop",
      modality: "silence",
      narration:
        "Stop. Mouth closed. Spine straight. Just like that — stop. Whatever was about to come out, swallow it. Become a witness to the silence that the gibberish has carved out of you. Do not chase a thought. Do not push one away. Sit at the door of your own quiet for seven minutes.",
      caption: "Stop. Witness the silence inside.",
      imageUrl: stop,
      holdMs: 420000,
    },
    {
      id: "settle-back",
      modality: "silence",
      narration:
        "Now lie down or recline. Let the body soften completely. The noise has been spent. The silence remains. Let it touch the corners of you that words could never reach.",
      caption: "Lie back. Let silence hold you.",
      imageUrl: rest,
      holdMs: 120000,
    },
  ],
  closing:
    "You shouted out the mind, and what was left behind was always there — a silence older than your name. Carry one drop of it into the next conversation. That single drop will make your words real.",
};
