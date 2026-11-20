// 7-level Pranayama ladder — from feeling the breath to kevala kumbhaka.
export type PranayamaLevel = {
  level: number;
  title: string;
  sanskrit?: string;
  oneLine: string;
  teaching: string;
  microPractice: string;
  signOfReadiness: string;
};

export const PRANAYAMA_LADDER: PranayamaLevel[] = [
  {
    level: 1,
    title: "Natural Breath Awareness",
    sanskrit: "Sahaja śvāsa",
    oneLine: "Before you change the breath, feel the breath that is already happening.",
    teaching:
`Every yogic breath practice begins here — and the masters return here every morning. The breath is breathing you. It has been since the first second of your life. Most people have never actually felt it.

Sit. Don't fix anything. Just feel: where is the breath now? Nose? Throat? Chest? Belly? Let the breath be exactly as it is. Notice that it has texture, rhythm, temperature.

This is not preparation. This *is* the practice. Everything else is built on this foundation.`,
    microPractice:
`Sit. For 60 seconds, feel the breath touching the inside of your nose. Cool on the in-breath, warm on the out-breath. Don't control. Just feel.`,
    signOfReadiness: "You can feel the breath without forcing it for 2 minutes straight.",
  },
  {
    level: 2,
    title: "Three-Part Breath",
    sanskrit: "Dīrgha prāṇāyāma",
    oneLine: "Breathe into the belly, then ribs, then chest. The full architecture of breath.",
    teaching:
`Most adults breathe with only the upper chest — a stress pattern that keeps the nervous system mildly alarmed all day. The three-part breath restores the full range.

In: belly expands first, then ribs widen sideways, then upper chest lifts. Out: chest releases, ribs soften, belly draws in. Smooth, like a wave.

This single shift, practiced for two weeks, can lower resting heart rate, improve sleep, and end shallow panic-style breathing for life.`,
    microPractice:
`5 rounds. Inhale slowly — belly, ribs, chest. Pause one second. Exhale slowly — chest, ribs, belly. Don't strain. Smoothness over depth.`,
    signOfReadiness: "Three-part breath feels natural and effortless, not mechanical.",
  },
  {
    level: 3,
    title: "Equal Breath",
    sanskrit: "Sama vṛtti",
    oneLine: "Inhale and exhale matched, count for count. The mind settles when the breath becomes symmetrical.",
    teaching:
`The breath is a window to the nervous system. Quick, shallow, irregular breath = scattered mind. Slow, even, rhythmic breath = settled mind.

Sama vṛtti makes the in-breath and out-breath exactly equal in length. Start with a 4-count. Inhale 4, exhale 4. After a week, try 5. After two, try 6. The body teaches its own timing — never force.

Patanjali's *Yoga Sūtras* (2.50) describe pranayama as the regulation of the inflow, outflow, and pause — measured by place, time, and number. This is that.`,
    microPractice:
`Inhale 4 counts. Exhale 4 counts. Repeat 10 rounds. If 4 feels easy, try 5 next session. Never sacrifice smoothness for length.`,
    signOfReadiness: "You can hold a 6-count equal breath for 10 rounds without strain.",
  },
  {
    level: 4,
    title: "Alternate Nostril Breath",
    sanskrit: "Nāḍī śodhana",
    oneLine: "Breathe through one nostril, then the other. Brain hemispheres balance. Mind clarifies.",
    teaching:
`The Hatha Yoga Pradīpikā calls nāḍī śodhana the purifier of the channels. Modern neuroscience finds it shifts hemispheric dominance and lowers stress markers within minutes.

Right thumb closes the right nostril, inhale left. Ring finger closes the left nostril, exhale right. Inhale right. Close right, exhale left. That is one round.

Five minutes a day for two weeks changes the texture of the mind. Not a metaphor. Measurable.`,
    microPractice:
`5 rounds. Inhale left (4 counts), exhale right (4). Inhale right (4), exhale left (4). That is one round. Smooth, silent, even.`,
    signOfReadiness: "10 minutes daily for two weeks. Mind feels markedly clearer.",
  },
  {
    level: 5,
    title: "Retention",
    sanskrit: "Kumbhaka",
    oneLine: "The pause between breaths is where the prāṇa concentrates.",
    teaching:
`Kumbhaka — the held breath — is the heart of pranayama. The Hatha Yoga Pradīpikā says: *"As long as the breath is restrained in the body, mind is steady; as long as the gaze is steady, where can death come from?"*

Begin gently. After a smooth inhale, hold for 2 counts. Exhale slowly. After exhale, hold empty for 2 counts. Over months, the count can grow — but only if the practice stays effortless. Strain is the enemy.

This is where pranayama stops being a calming technique and becomes a doorway to deeper states.`,
    microPractice:
`5 rounds. Inhale 4, hold 4, exhale 8, hold 2. If any count strains, shorten. Quality over duration.`,
    signOfReadiness: "1:2 ratio (inhale:exhale) with comfortable retention, no strain after.",
  },
  {
    level: 6,
    title: "Mantra-Bound Breath",
    sanskrit: "Ajapā japa",
    oneLine: "So-ham. The breath itself becomes the mantra. Effortless, ceaseless.",
    teaching:
`*So-ham* — "I am That." The Upanishads observed that every breath naturally sounds it: *So* on the inhale, *Ham* on the exhale. Twenty-one thousand six hundred times a day, your body recites it.

Ajapā japa means "unrepeated repetition" — the mantra that does not require you to chant it. You simply *notice* it. The breath is already saying it.

This is the bridge between pranayama and meditation. The breath continues, the mantra rides on it, and you become the one who knows both.`,
    microPractice:
`Sit. With each natural inhale, hear "So." With each exhale, hear "Ham." Don't add anything. Just listen for what is already there.`,
    signOfReadiness: "The mantra continues on its own for 5 minutes without effort.",
  },
  {
    level: 7,
    title: "Spontaneous Retention",
    sanskrit: "Kevala kumbhaka",
    oneLine: "The breath stops on its own. There is no breather. There is only this.",
    teaching:
`This is the rarest fruit of pranayama. The Hatha Yoga Pradīpikā says: *"When the breath stops without any effort, by itself — that is called kevala kumbhaka."*

It happens spontaneously after years of practice. In a deep meditation, the breath gets finer and finer until it almost disappears. The body is still oxygenated. The mind is luminous. There is no "I doing pranayama" left. There is just stillness, breathing itself, or not.

You do not pursue this. You prepare the ground — through the six levels above — and one day the flower opens.`,
    microPractice:
`No practice. Sit at level 6. If the breath ever pauses on its own — do not grab it, do not analyse it. Let it pause. Let it return. That is all.`,
    signOfReadiness: "There is no readiness. There is only continued practice. The fruit ripens when it ripens.",
  },
];
