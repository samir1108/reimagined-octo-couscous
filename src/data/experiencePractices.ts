/**
 * The Daily 12 — standalone contemplative practices.
 * Different from games (no score) and programs (no arc).
 * Pure repeatable tools, no signup required.
 */
import witnessImg from "@/assets/practices/witness.jpg";
import coherentBreathImg from "@/assets/practices/coherent-breath.jpg";
import bodyScanImg from "@/assets/practices/body-scan.jpg";
import lovingKindnessImg from "@/assets/practices/loving-kindness.jpg";
import selfInquiryImg from "@/assets/practices/self-inquiry.jpg";
import yogaNidraImg from "@/assets/practices/yoga-nidra.jpg";
import tratakaImg from "@/assets/practices/trataka.jpg";
import soHumImg from "@/assets/practices/so-hum.jpg";
import threeBrainImg from "@/assets/practices/three-brain-checkin.jpg";
import boxBreathImg from "@/assets/practices/box-breath.jpg";
import gratitudePulseImg from "@/assets/practices/gratitude-pulse.jpg";
import deathContemplationImg from "@/assets/practices/death-contemplation.jpg";
import walkingMeditationImg from "@/assets/practices/walking-meditation.jpg";
import kumbhakaImg from "@/assets/practices/kumbhaka.jpg";
import theSighImg from "@/assets/practices/the-sigh.jpg";
import tratakaFlameVideo from "@/assets/practices/trataka-flame.mp4.asset.json";
import yogaNidraVideo from "@/assets/practices/yoga-nidra-cosmos.mp4.asset.json";
import coherentBreathVideo from "@/assets/practices/coherent-breath-ocean.mp4.asset.json";
import soHumVideo from "@/assets/practices/so-hum-lotus.mp4.asset.json";
import bodyScanVideo from "@/assets/practices/body-scan-light.mp4.asset.json";
import walkingVideo from "@/assets/practices/walking-meditation-forest.mp4.asset.json";
import boxBreathVideo from "@/assets/practices/box-breath-square.mp4.asset.json";
import gratitudeVideo from "@/assets/practices/gratitude-pulse-heart.mp4.asset.json";
import deathVideo from "@/assets/practices/death-contemplation-petal.mp4.asset.json";
import kumbhakaVideo from "@/assets/practices/kumbhaka-void.mp4.asset.json";
import sighVideo from "@/assets/practices/the-sigh-sky.mp4.asset.json";
import threeBrainVideo from "@/assets/practices/three-brain-spheres.mp4.asset.json";
import witnessVideo from "@/assets/practices/witness-lake.mp4.asset.json";
import lovingKindnessVideo from "@/assets/practices/loving-kindness-radiance.mp4.asset.json";
import selfInquiryVideo from "@/assets/practices/self-inquiry-source.mp4.asset.json";

const PRACTICE_IMAGES: Record<string, string> = {
  "witness": witnessImg,
  "coherent-breath": coherentBreathImg,
  "body-scan": bodyScanImg,
  "loving-kindness": lovingKindnessImg,
  "self-inquiry": selfInquiryImg,
  "yoga-nidra": yogaNidraImg,
  "trataka": tratakaImg,
  "so-hum": soHumImg,
  "three-brain-checkin": threeBrainImg,
  "box-breath": boxBreathImg,
  "gratitude-pulse": gratitudePulseImg,
  "death-contemplation": deathContemplationImg,
  "walking-meditation": walkingMeditationImg,
  "kumbhaka": kumbhakaImg,
  "the-sigh": theSighImg,
};

// Cinematic AI-generated video backdrops (looping, muted). Optional per practice.
const PRACTICE_VIDEOS: Record<string, string> = {
  "trataka": tratakaFlameVideo.url,
  "yoga-nidra": yogaNidraVideo.url,
  "coherent-breath": coherentBreathVideo.url,
  "so-hum": soHumVideo.url,
  "body-scan": bodyScanVideo.url,
  "walking-meditation": walkingVideo.url,
  "box-breath": boxBreathVideo.url,
  "gratitude-pulse": gratitudeVideo.url,
  "death-contemplation": deathVideo.url,
  "kumbhaka": kumbhakaVideo.url,
  "the-sigh": sighVideo.url,
  "three-brain-checkin": threeBrainVideo.url,
  "witness": witnessVideo.url,
  "loving-kindness": lovingKindnessVideo.url,
  "self-inquiry": selfInquiryVideo.url,
};

export function getPracticeVideo(slug: string): string | undefined {
  return PRACTICE_VIDEOS[slug];
}

export interface ExperiencePractice {
  slug: string;
  name: string;
  sanskrit?: string;
  symbol: string;
  tradition: string;
  durationMin: number;
  oneLine: string;
  whenToUse: string;          // "anytime", "morning", "before sleep", "in conflict", etc.
  instructions: string[];     // step-by-step, plain words
  accent: string;
  image?: string;
  video?: string;
}

export function getPracticeImage(slug: string): string | undefined {
  return PRACTICE_IMAGES[slug];
}

export const EXPERIENCE_PRACTICES: ExperiencePractice[] = [
  {
    slug: "witness",
    name: "The Witness",
    sanskrit: "Sākṣī Bhāva",
    symbol: "👁",
    tradition: "Upanishads",
    durationMin: 10,
    oneLine: "Watch thoughts pass without grabbing them.",
    whenToUse: "Daily. The foundational practice of all yogic paths.",
    instructions: [
      "Sit comfortably. Eyes soft, half-open or closed.",
      "Do not try to stop thoughts. Let them arrive.",
      "Notice each thought as it appears. Do not engage with the content.",
      "Silently label: 'thinking,' 'feeling,' 'planning,' 'remembering.'",
      "Return to the noticing, not to a mantra.",
      "When you notice you've been carried away, that noticing is the practice. Begin again.",
    ],
    accent: "amber",
  },
  {
    slug: "coherent-breath",
    name: "Coherent Breathing 5-5",
    symbol: "🌬",
    tradition: "Pranayama + HeartMath",
    durationMin: 5,
    oneLine: "Inhale 5, exhale 5. Heart rhythm settles.",
    whenToUse: "Anytime you feel scattered, anxious, or before any other practice.",
    instructions: [
      "Sit upright. Hands resting.",
      "Inhale through the nose for 5 slow counts.",
      "Exhale through the nose for 5 slow counts.",
      "No pause. Smooth continuous flow.",
      "Aim for ~6 breaths per minute. That is the resonance frequency of the heart.",
      "Continue for 5 minutes. The shift in your nervous system is measurable.",
    ],
    accent: "sky",
  },
  {
    slug: "body-scan",
    name: "Body Scan",
    sanskrit: "Anupassanā",
    symbol: "🫀",
    tradition: "Vipassanā (Goenka)",
    durationMin: 15,
    oneLine: "Sweep attention head-to-toe with no agenda.",
    whenToUse: "Morning or evening. Especially when disconnected from the body.",
    instructions: [
      "Lie down or sit. Eyes closed.",
      "Start at the crown of the head. Rest attention there for ~10 seconds.",
      "Slowly move attention down: forehead, eyes, jaw, throat, shoulders, arms, hands, chest, belly, hips, legs, feet.",
      "At each region, just feel what is there. Do not change it. Do not interpret it.",
      "If a region has no sensation, that absence is also a sensation. Notice and move on.",
      "Complete the sweep. Then reverse from feet to head once.",
    ],
    accent: "emerald",
  },
  {
    slug: "loving-kindness",
    name: "Loving-Kindness",
    sanskrit: "Mettā",
    symbol: "💗",
    tradition: "Buddhist",
    durationMin: 10,
    oneLine: "Wish well to five people, including yourself.",
    whenToUse: "When the heart feels closed. After conflict.",
    instructions: [
      "Sit. Hand on heart.",
      "Self: 'May I be happy. May I be safe. May I be free from suffering.' Repeat 5 times, slowly.",
      "A loved one: same phrases, picture them clearly.",
      "A neutral person (the barista, a stranger on the bus): same phrases.",
      "A difficult person: same phrases. Notice resistance. Continue anyway.",
      "All beings: same phrases. Let the circle widen as far as it can.",
    ],
    accent: "rose",
  },
  {
    slug: "self-inquiry",
    name: "Self-Inquiry",
    sanskrit: "Ātma Vichāra",
    symbol: "🌀",
    tradition: "Ramana Maharshi",
    durationMin: 5,
    oneLine: "Ask 'Who am I?' and stay with the gap.",
    whenToUse: "When identified with a strong emotion or role.",
    instructions: [
      "Sit. Eyes closed.",
      "Bring up the current strong feeling or thought. 'I am angry.' 'I am tired.'",
      "Ask: 'To whom does this arise?' Answer: 'To me.'",
      "Ask: 'Who am I?' Do not answer with words. Look toward where 'I' would be.",
      "Stay in the not-knowing for as long as possible.",
      "When a thought arises, ask again: 'Who is having this thought?'",
    ],
    accent: "stone",
  },
  {
    slug: "yoga-nidra",
    name: "Yoga Nidra Drop",
    symbol: "🌙",
    tradition: "Tantric",
    durationMin: 20,
    oneLine: "Conscious sleep. The body rests, awareness stays.",
    whenToUse: "Afternoon slump, before sleep, after exhaustion.",
    instructions: [
      "Lie on your back. Bolster under knees if helpful.",
      "Set an intention (sankalpa) in one sentence. State it three times.",
      "Rotate awareness through the body: right thumb, second finger, third, fourth, fifth, palm, wrist, elbow, shoulder. Repeat on left side.",
      "Notice the breath without changing it.",
      "Welcome any image, sensation, emotion. Stay aware. Do not fall asleep.",
      "Return to the sankalpa. Stretch slowly.",
    ],
    accent: "indigo",
  },
  {
    slug: "trataka",
    name: "Trāṭaka",
    sanskrit: "त्राटक",
    symbol: "🕯",
    tradition: "Hatha Yoga",
    durationMin: 7,
    oneLine: "Steady gaze on a flame. Do not blink.",
    whenToUse: "When the mind is scattered. To build concentration.",
    instructions: [
      "Light a candle in a dim room. Place it at eye level, an arm's length away.",
      "Sit upright. Gaze at the flame without blinking.",
      "Let tears come if they do. Do not look away.",
      "When you must blink, close eyes and hold the after-image of the flame in your inner vision.",
      "When the after-image fades, open eyes and gaze again.",
      "Continue for 5-7 minutes. End by rubbing palms together and pressing them over closed eyes.",
    ],
    accent: "amber",
  },
  {
    slug: "so-hum",
    name: "So-Hum Mantra",
    sanskrit: "सो ऽहम्",
    symbol: "🕉",
    tradition: "Vedic",
    durationMin: 10,
    oneLine: "'I am That.' On the breath itself.",
    whenToUse: "Daily. The breath already says this — you only listen.",
    instructions: [
      "Sit comfortably. Eyes closed.",
      "Listen to the breath. The inhale naturally makes a 'So' sound. The exhale, 'Hum.'",
      "Do not force the sound. Just notice it is already there.",
      "Mentally say 'So' on the inhale, 'Hum' on the exhale.",
      "When the mind drifts, return to listening.",
      "After 10 minutes, sit in silence for one more minute.",
    ],
    accent: "violet",
  },
  {
    slug: "three-brain-checkin",
    name: "3-Brain Check-in",
    symbol: "🧠",
    tradition: "HOPE",
    durationMin: 2,
    oneLine: "What does the head say? The heart? The gut?",
    whenToUse: "Before any decision. Anytime you feel torn.",
    instructions: [
      "Hand on forehead. 'Head, what do you think?' Listen for the answer in words.",
      "Hand on heart. 'Heart, what do you feel?' Listen for the answer in sensation.",
      "Hand on belly. 'Gut, what do you know?' Listen for the answer in instinct.",
      "Notice which two agree. Notice which one objects.",
      "Do not decide yet. Just listen.",
    ],
    accent: "violet",
  },
  {
    slug: "box-breath",
    name: "Box Breath 4-4-4-4",
    symbol: "⬛",
    tradition: "Pranayama (Sama Vritti)",
    durationMin: 4,
    oneLine: "In 4, hold 4, out 4, hold 4. Repeat.",
    whenToUse: "Before a difficult conversation, performance, or moment of stress.",
    instructions: [
      "Sit upright. Hands resting.",
      "Inhale through the nose for 4 counts.",
      "Hold the breath for 4 counts. Soft, not tight.",
      "Exhale through the nose for 4 counts.",
      "Hold empty for 4 counts.",
      "Repeat for 4 minutes. The mind will steady within 90 seconds.",
    ],
    accent: "slate",
  },
  {
    slug: "gratitude-pulse",
    name: "Gratitude Pulse",
    symbol: "🌅",
    tradition: "Bhakti",
    durationMin: 3,
    oneLine: "Three things. Feel each one in the body.",
    whenToUse: "Morning, or anytime the world feels gray.",
    instructions: [
      "Sit. Hand on heart.",
      "Name one thing already given. Out loud or silent.",
      "Pause. Feel where in the body the gratitude lands. Chest? Throat? Belly?",
      "Name a second. Feel it.",
      "Name a third. Feel it.",
      "Sit for 30 more seconds in the residue.",
    ],
    accent: "amber",
  },
  {
    slug: "death-contemplation",
    name: "Death Contemplation",
    sanskrit: "Maraṇasati",
    symbol: "🕊",
    tradition: "Buddhist / Stoic",
    durationMin: 5,
    oneLine: "Sit with the certainty of your end.",
    whenToUse: "When small problems feel large. Weekly is enough.",
    instructions: [
      "Sit. Eyes closed.",
      "Slowly say: 'This body will die. Everyone I love will die. The day is unknown.'",
      "Do not rush past the feeling. Let the discomfort arise.",
      "Now ask: 'If this were my last week, what would matter?'",
      "Sit with whatever answer arrives. Do not write it yet.",
      "End by opening eyes slowly. The world looks different for a few hours.",
    ],
    accent: "stone",
  },
  {
    slug: "walking-meditation",
    name: "Walking Meditation",
    sanskrit: "Caṅkamana",
    symbol: "👣",
    tradition: "Theravāda / Thich Nhat Hanh",
    durationMin: 10,
    oneLine: "One step. One breath. Arrive where you already are.",
    whenToUse: "When sitting feels stuck. Outdoors, or back-and-forth in a hallway.",
    instructions: [
      "Stand at one end of a quiet space — 10 to 20 steps long.",
      "Hands lightly clasped at the navel or behind the back.",
      "Breathe in as you lift one foot. Breathe out as you place it.",
      "Step at half the speed you'd normally walk. Maybe slower.",
      "At the end of the path, pause, turn, breathe, walk back.",
      "If the mind wanders, return to the felt sense of the sole meeting the ground.",
    ],
    accent: "emerald",
  },
  {
    slug: "kumbhaka",
    name: "The Pause at the Top",
    sanskrit: "Kumbhaka",
    symbol: "༄",
    tradition: "Vigyan Bhairav Tantra",
    durationMin: 7,
    oneLine: "Inhale fully. Hold. There is a doorway in the pause.",
    whenToUse: "Morning or whenever the mind feels noisy. One of the oldest practices in this app.",
    instructions: [
      "Sit upright. Eyes closed.",
      "Inhale slowly through the nose, all the way full.",
      "At the top of the inhale, hold the breath — soft, not tight — for as long as is comfortable.",
      "In that pause, look for the silence between thoughts. Just notice.",
      "Exhale slowly. Pause again at the bottom. Same noticing.",
      "Continue for 5-7 minutes. The pauses get longer on their own.",
    ],
    accent: "indigo",
  },
  {
    slug: "the-sigh",
    name: "Physiological Sigh",
    symbol: "🌬",
    tradition: "Stanford (Huberman) / Pranayama",
    durationMin: 1,
    oneLine: "Two short inhales, one long exhale. Fastest known nervous-system reset.",
    whenToUse: "Acute stress, before a difficult conversation, anywhere, anytime.",
    instructions: [
      "Stand or sit. Eyes open is fine.",
      "Take one full inhale through the nose.",
      "Without exhaling, sip in a short top-up inhale through the nose.",
      "Now exhale slowly and completely through the mouth — long, soft.",
      "Repeat 2-5 times.",
      "Stanford research: this resets the sympathetic nervous system in under 60 seconds.",
    ],
    accent: "sky",
  },
].map(p => ({ ...p, image: PRACTICE_IMAGES[p.slug], video: PRACTICE_VIDEOS[p.slug] }));

export function getPracticeBySlug(slug: string) {
  return EXPERIENCE_PRACTICES.find(p => p.slug === slug);
}
