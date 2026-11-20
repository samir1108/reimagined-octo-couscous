import type { OrientationSession } from "../types";

export const act1Sessions: OrientationSession[] = [
  {
    index: 1, act: 1, frameworkId: "simulation",
    title: "You're in a simulation",
    subtitle: "Maya, the dream, the matrix — same insight, 4000 years apart",
    teach: {
      hook: "Your mind is not showing you reality. It's showing you a model of reality.",
      body: "The Vedas called it Maya — the cosmic illusion. The Buddha called it the dream. The Sufis called it the veil. Today we call it the simulation. The shape changes, the insight does not: what you experience as 'the world' is generated inside your head, from electrical signals interpreted by old patterns. Color, sound, even time — all modeled. The good news: if it's a simulation, there's a way to see it as one. That's what this app is.",
      whyItMatters: "Until you see the model as a model, you're stuck inside it.",
    },
    practice: {
      title: "Spot one fiction",
      steps: [
        "Look around the room for 60 seconds.",
        "Find one thing your mind added that isn't actually 'out there' — a judgement, a story, a feeling colored by memory.",
        "Just notice it. Don't fix it.",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "What did your mind add that wasn't really there?" },
    integrate: { cue: "Today, when I react — pause once and ask: is this real, or rendered?" },
  },
  {
    index: 2, act: 1, frameworkId: "ancient-india",
    title: "Where this began",
    subtitle: "10,000 years of laboratory work on consciousness",
    teach: {
      hook: "Long before MRI machines, the rishis were mapping the inside of the mind.",
      body: "Vedas (oral wisdom, ~3000 BCE). Upanishads (the inquiry — 'who am I?'). Patanjali's Yoga Sutras (the eight-limb engineering manual). Tantra (every sensation as a doorway). Bhakti (love as the shortest path). This wasn't religion — it was the world's longest-running experiment on what a human being actually is.",
      whyItMatters: "You're not starting from zero. You're inheriting a 10,000-year lab.",
    },
    practice: {
      title: "Pick your pull",
      steps: [
        "Read the five names again slowly: Vedas, Upanishads, Patanjali, Tantra, Bhakti.",
        "One of them will pull you more than the others.",
        "Sit with it for 60 seconds and ask: why this one?",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "Which tradition pulled you, and what does that say about you?" },
    integrate: { cue: "I am not the first to ask these questions. I'm the next." },
  },
  {
    index: 3, act: 1, frameworkId: "world-traditions",
    title: "The world also knew",
    subtitle: "Same map, different vocabulary",
    teach: {
      hook: "Yoga's insight isn't Indian. It's human.",
      body: "Sufism: fana — the dissolving of the self in the Beloved. Zen: satori — the sudden seeing. Kabbalah: ein sof — the formless ground. Christian mystics (Meister Eckhart, Teresa of Ávila): the soul's union with God. Indigenous shamans across continents: the spirit-world behind the visible. Every awake culture mapped the same territory. The vocabulary changes; the experience does not.",
      whyItMatters: "If a hundred cultures found the same exit, the door is probably real.",
    },
    practice: {
      title: "Name your lineage",
      steps: [
        "Think of your own culture, family, or background.",
        "Find one mystical tradition or wisdom figure from it.",
        "Notice: you're not as far from this as you thought.",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "Which tradition from your own world surprised you to remember?" },
    integrate: { cue: "This path is mine too. It always was." },
  },
  {
    index: 4, act: 1, frameworkId: "yoga-is-exit",
    title: "Why yoga is the exit",
    subtitle: "Not stretching. Not vibes. The exit.",
    teach: {
      hook: "Yoga means yoke. Re-union. The end of separation.",
      body: "Modern yoga got reduced to flexibility. The original yoga is the technology for exiting the simulation — while still living inside it. Asana (posture) was one of eight limbs, mostly a setup for sitting still. The real work: pratyahara (withdraw the senses), dharana (focus), dhyana (absorption), samadhi (re-union). The point was never bendiness. It was the dissolving of the line between you and everything.",
      whyItMatters: "If you only know yoga as exercise, you've been handed the box and told it's the gift.",
    },
    practice: {
      title: "Sit with 'yoke'",
      steps: [
        "Close your eyes for 60 seconds.",
        "Repeat slowly: 'yoga = yoke = union.'",
        "Notice what feels separated in you right now. Don't fix it. Just see.",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "What in you is asking to be re-united with what?" },
    integrate: { cue: "Today, every practice is one small yoke — re-joining what got split." },
  },
  {
    index: 5, act: 1, frameworkId: "four-goals",
    title: "The four goals of life",
    subtitle: "Dharma, Artha, Kama, Moksha",
    teach: {
      hook: "You're not here just to chase or just to suffer. The Vedas mapped four legitimate aims.",
      body: "Dharma — your purpose, your alignment with what's right. Artha — material security, resources to live well. Kama — pleasure, beauty, desire fulfilled. Moksha — liberation, the final waking up. All four are real. Western life over-feeds Artha and Kama, starves Dharma, ignores Moksha. The collapse you feel is structural — not personal.",
      whyItMatters: "When you see the four aims, you stop blaming yourself for what is actually a missing leg of the stool.",
    },
    practice: {
      title: "Rate your four",
      steps: [
        "Score yourself 0–10 on each — quick, honest, gut answer.",
        "Dharma (purpose). Artha (security). Kama (pleasure). Moksha (liberation).",
        "Notice which two are loud and which two are quiet.",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "Which aim has been starved the longest in your life?" },
    integrate: { cue: "Today I notice which of the four I'm feeding — and which I keep skipping." },
  },
  {
    index: 6, act: 1, frameworkId: "awakening-meaning",
    title: "What awakening actually means",
    subtitle: "Not bliss. Not bypass. Just seeing.",
    teach: {
      hook: "Awakening is not feeling good. It's seeing clearly.",
      body: "The Instagram version says enlightenment = constant joy, no problems, no anger. The real teachers all say the opposite: awake people still feel everything — they just don't get fooled by it anymore. The grief is still grief. The joy is still joy. What changes is the one who's there for it. Bypassing (skipping feelings to look spiritual) is the enemy of awakening, not the path to it.",
      whyItMatters: "If you chase bliss, you'll miss the door. The door looks like ordinary presence.",
    },
    practice: {
      title: "One honest sentence",
      steps: [
        "Finish this sentence out loud or in your head: 'I want to wake up because...'",
        "Don't sanitize it. The real reason — even if it's selfish, lonely, or angry.",
        "Sit with the honesty for 60 seconds.",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "What's the most honest reason you're here?" },
    integrate: { cue: "I don't need to be peaceful to be awake. I just need to be present." },
  },
];
