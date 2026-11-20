import type { SensorialManifest } from "./types";
import marcusImg from "@/assets/masters/marcus.jpg";
import arrive from "@/assets/sensorial/ramana/01-arrive.jpg";
import dawn from "@/assets/sensorial/ramana/05-arunachala-dawn.jpg";
import rest from "@/assets/sensorial/ramana/04-rest.jpg";
import aham from "@/assets/sensorial/ramana/02-aham.jpg";
import traceI from "@/assets/sensorial/ramana/03-trace-i.jpg";
import ambientFlame from "@/assets/sensorial/ramana/ambient-flame.mp4.asset.json";

export const marcusAureliusMorningExamen: SensorialManifest = {
  key: "marcus:aurelius-morning-examen",
  guruId: "marcus",
  practiceMatch: "morning examen",
  title: "Morning Examen — Marcus Aurelius",
  voiceId: "JBFqnCBsd6RMkjVDRZzb",
  videoUrl: (ambientFlame as { url: string }).url,
  backdropImage: marcusImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 10,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit. Marcus Aurelius rose before dawn, not to conquer the world, but to remind himself: today you will meet difficult people. Today you will be tested. The test is not outside you. It is in how you meet what comes. We begin there.",
      caption: "Before dawn. Remind yourself.", imageUrl: arrive, holdMs: 20000 },
    { id: "premeditatio-malorum", modality: "narrate",
      narration: "Marcus practiced premeditatio malorum — the pre-rehearsal of difficulty. Not as pessimism. As inoculation. Imagine today: someone is rude. Traffic is bad. A plan fails. You are not surprised. You prepared. The obstacle is not the event. The event is fuel.",
      caption: "Pre-rehears the difficulty. Inoculate.", imageUrl: dawn, holdMs: 30000 },
    { id: "inner-citadel", modality: "silence",
      narration: "Now locate the inner citadel. The part of you that no event can touch. It is not the body. It is not the reputation. It is not the outcome. It is the willingness to act well regardless. Sit there. That citadel is already built. You only need to enter it.",
      caption: "The inner citadel. Enter.", imageUrl: rest, holdMs: 180000 },
    { id: "what-is-yours", modality: "narrate",
      narration: "Marcus wrote: 'You have power over your mind — not outside events. Realize this, and you will find strength.' What belongs to you today? Your response. Your effort. Your integrity. Nothing else. Claim it now. Set down everything that is not yours.",
      caption: "Power over mind. Nothing else.", imageUrl: traceI, holdMs: 60000 },
    { id: "act-as-if", modality: "voice_reply",
      narration: "Speak one sentence aloud: the kind of person you will be today. Not a wish. A declaration. 'Today I will be patient when...' 'Today I will act with dignity even if...' The Stoic does not hope. The Stoic decides.",
      caption: "Declare who you will be today.", prompt: "Today I will be…", imageUrl: aham, maxListenMs: 30000 },
    { id: "return", modality: "narrate",
      narration: "Close this examen. The day awaits. You are not the same person who sat down — because you are now armed with clarity, not hope. Hope is passive. Clarity is a weapon. Marcus carried this weapon for forty years of rule. You carry it for the next ten hours. That is enough.",
      caption: "Armed with clarity. The day begins.", imageUrl: dawn, holdMs: 20000 },
  ],
  closing: "Marcus wrote his Meditations in the noise of war, never intending them to be published. They are private notes from a man who chose character over comfort every single morning. You have just made the same choice. The day will test it. Let it come.",
};
