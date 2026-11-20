import type { SensorialManifest } from "./types";
import padmaImg from "@/assets/masters/padmasambhava.jpg";
import arrive from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";
import heart from "@/assets/sensorial/buddha-bodyscan/03-torso.jpg";
import open from "@/assets/sensorial/buddha-bodyscan/05-whole.jpg";

/**
 * Padmasambhava lineage — Tonglen (giving and taking on the breath).
 * The reverse of self-protection: breathe in another's pain, breathe out
 * your own ease. Compassion training — gentle dose for home use. ~15 min.
 */
export const padmasambhavaTonglen: SensorialManifest = {
  key: "padmasambhava:tonglen",
  guruId: "padmasambhava",
  practiceMatch: "tonglen",
  title: "Tonglen — Giving and Taking",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: padmaImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 15,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Sit comfortably. Hands resting easy. Eyes closed or gazing softly down. Tonglen reverses our habitual movement — instead of breathing in pleasure and breathing out discomfort, we will do the opposite. This is not self-punishment. It is the strongest medicine for fear the lineage has ever offered.",
      caption: "Reverse the habitual breath.", imageUrl: arrive, holdMs: 22000 },
    { id: "flash-rest", modality: "breath",
      narration: "Begin with a flash of openness. Three breaths in which you do nothing — no agenda, no method. Just spacious sitting. This is the ground from which tonglen is offered.",
      caption: "Flash of open rest.", prompt: "Inhale open… exhale open…", imageUrl: open, holdMs: 36000 },
    { id: "self-first", modality: "silence",
      narration: "We begin with ourselves. Bring to mind a place inside you that is hurting tonight — a worry, a fatigue, a fear. Breathe it in as warm dark smoke into the heart. Hold it there a moment, where it dissolves in the openness. Breathe out cool, bright relief into that same place inside you. Repeat. Take in the dark, give back the light — to yourself first.",
      caption: "For yourself: in dark, out light.", imageUrl: heart, holdMs: 150000 },
    { id: "loved-one", modality: "silence",
      narration: "Now bring to mind one person you love who is suffering. See them clearly. Breathe in their dark smoke — their fear, their tiredness, their hurt — into your own heart, where it dissolves. Breathe out into them everything you would wish for them — ease, warmth, courage. Continue gently.",
      caption: "For someone you love.", imageUrl: heart, holdMs: 150000 },
    { id: "neutral", modality: "silence",
      narration: "Now someone you barely know — a stranger from today, a face on a screen, a name you heard in passing. Breathe in whatever shadow they may carry. Breathe out the same warmth. They do not need to know. The exchange happens in you.",
      caption: "For a stranger.", imageUrl: heart, holdMs: 120000 },
    { id: "difficult", modality: "silence",
      narration: "Now — and only as far as you can — someone difficult. Someone who has hurt you, or hurts you still. Breathe in their pain, which is the very thing that made them act that way. Breathe out, toward them, the freedom from that pain. If this is too much, return to yourself. The medicine works either way.",
      caption: "For someone difficult.", imageUrl: heart, holdMs: 120000 },
    { id: "all", modality: "silence",
      narration: "Finally, expand. All beings, everywhere, who carry the same kind of suffering you just touched — breathe in their dark, breathe out their light. The heart becomes a great furnace that transmutes whatever enters it.",
      caption: "For all who carry this.", imageUrl: open, holdMs: 120000 },
    { id: "close", modality: "narrate",
      narration: "Let the practice dissolve. Sit quietly. Notice — your own heart did not break under what you took in. It opened. This is the secret tonglen reveals: the heart cannot be wounded by another's pain. Only by closing.",
      caption: "The heart was not broken. It opened.", imageUrl: open, holdMs: 30000 },
  ],
  closing: "When you walk into the next conversation today, you will carry an invisible exchange already going on inside you. This is the beginning of bodhichitta — the awakened heart. Practice once a day, even briefly. The world quietly grows kinder around such a person.",
};
