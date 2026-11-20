import type { SensorialManifest } from "./types";
import arrive from "@/assets/sensorial/sadhguru/01-arrive.jpg";
import mudra from "@/assets/sensorial/sadhguru/02-mudra.jpg";
import aaaSound from "@/assets/sensorial/sadhguru/03-aaa-sound.jpg";
import notBodyNotMind from "@/assets/sensorial/sadhguru/04-not-body-not-mind.jpg";
import stillness from "@/assets/sensorial/sadhguru/05-stillness.jpg";
import returnImg from "@/assets/sensorial/sadhguru/06-return.jpg";
import ambientCosmic from "@/assets/sensorial/sadhguru/ambient-cosmic.mp4.asset.json";

/**
 * Sadhguru — Isha Kriya
 * 12-minute simple kriya: chin mudra + 3 inhale/exhale "I am not the body /
 * not even the mind" + 7 "AAA" exhales + stillness. TTS narration over a
 * cosmic ambient backdrop, with optional mic for the AAA sound stage.
 */
export const sadhguruIshaKriya: SensorialManifest = {
  key: "sadhguru:isha-kriya",
  guruId: "sadhguru",
  practiceMatch: "isha kriya",
  title: "Isha Kriya — A Simple Way",
  voiceId: "guru_male",
  backdropImage: arrive,
  videoUrl: (ambientCosmic as { url: string }).url,
  sensors: { mic: true, camera: false },
  totalMinutes: 12,
  steps: [
    {
      id: "arrive",
      modality: "narrate",
      narration:
        "Sit with your spine erect, head and neck in line. Close your eyes gently. A small smile on your face. Place your hands one on top of the other, or rest them upturned on your knees in chin mudra — thumb meeting index finger, the other three fingers extended.",
      caption: "Spine erect. Soft smile.",
      imageUrl: mudra,
      holdMs: 12000,
    },
    {
      id: "mudra-set",
      modality: "narrate",
      narration:
        "Face turned slightly upward, about thirty degrees from the horizon. Eyes closed, but the awareness is gently focused at the space between the eyebrows.",
      caption: "Awareness between the eyebrows.",
      imageUrl: notBodyNotMind,
      holdMs: 10000,
    },
    {
      id: "stage-1-not-body",
      modality: "narrate",
      narration:
        "Stage one. As you inhale, in your mind, gently say: I am not the body. As you exhale, say: I am not even the mind. Continue this for the next few minutes. Inhale: I am not the body. Exhale: I am not even the mind.",
      caption: "Inhale: not the body. Exhale: not even the mind.",
      imageUrl: notBodyNotMind,
      holdMs: 240000, // ~4 minutes
    },
    {
      id: "stage-2-aaa",
      modality: "mantra",
      narration:
        "Stage two. Now, take a deep breath in. As you exhale, make the sound A — a soft, sustained AAAAA — felt at the navel center. Do this seven times. Each exhale: AAAAA. Begin when ready.",
      caption: "Seven long AAAAA exhales.",
      imageUrl: aaaSound,
      holdMs: 90000, // ~1.5 minutes for 7 long exhales
    },
    {
      id: "stage-3-stillness",
      modality: "silence",
      narration:
        "Stage three. Now simply sit. Do nothing. No mantra, no breath instruction. Just be — for the next five to seven minutes. If thoughts come, let them come. If they go, let them go. You are not the thoughts. You are the space in which they appear.",
      caption: "Sit. Do nothing. Just be.",
      imageUrl: stillness,
      holdMs: 360000, // 6 minutes
    },
    {
      id: "return",
      modality: "narrate",
      narration:
        "Slowly, gently, bring your awareness back. Cup your palms, place them over your closed eyes. Feel the warmth. Open your eyes into your palms first. Then into the world.",
      caption: "Palms over eyes. Return softly.",
      imageUrl: returnImg,
      holdMs: 12000,
    },
  ],
  closing:
    "Isha means 'that which is the source of creation.' Kriya means 'inner action.' You have just performed a simple inner action that, repeated daily, dissolves the false identification with body and mind. Twice a day for forty-eight days transforms the system.",
};
