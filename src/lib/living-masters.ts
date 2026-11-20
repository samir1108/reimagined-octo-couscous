/**
 * LIVING MASTERS - "Student of" naming convention
 * Per temple.md Section 7, 18: Living masters use "Student of" naming
 * to respect their work and avoid commercialization
 */

import type { Guru, GuruPractice } from "@/lib/guru-data";

// Living masters with real names
export const LIVING_MASTERS: Guru[] = [
  {
    id: "arjun-mehta",
    name: "Arjun Mehta",
    title: "The Inner Engineer",
    quote: "The most beautiful moments in life are moments when you are expressing your joy, not when you are seeking it.",
    image: "",
    bgImage: "",
    accentColor: "180 30% 50%",
    bio: "A direct student of Sadhguru Jaggi Vasudev. Teaches Inner Engineering as passed down through the tradition.",
    keyTeaching: "Inner Engineering, Conscious Living",
    livingStudentOf: "Sadhguru Jaggi Vasudev",
    practices: [
      {
        name: "Surya Kriya",
        duration: "15-30 min",
        description: "A complete yogic practice for body, mind, and energy. 12 postures coordinated with breath.",
        steps: ["Stand tall. Fold forward. Step back. Lower. Lift. Push back."],
        modes: ["timer"],
        difficulty: "intermediate",
      },
    ],
    programs: [],
    journey: { masterId: "arjun-mehta", totalDays: 100, dailyTimeMinutes: 30, days: [] },
    associatedTexts: [],
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    title: "The Presence Teacher",
    quote: "Realize deeply that the present moment is all you ever have.",
    image: "",
    bgImage: "",
    accentColor: "200 40% 50%",
    bio: "A student of Eckhart Tolle's teachings on presence and the power of now.",
    keyTeaching: "Presence, Stillness, Acceptance",
    livingStudentOf: "Eckhart Tolle",
    practices: [
      {
        name: "Presence Meditation",
        duration: "10-30 min",
        description: "Feel the inner body. Be present. No thought, just being.",
        steps: ["Close your eyes. Feel the aliveness in your hands. Now your feet. Now your whole body."],
        modes: ["timer", "chat"],
        difficulty: "beginner",
      },
    ],
    programs: [],
    journey: { masterId: "priya-sharma", totalDays: 100, dailyTimeMinutes: 30, days: [] },
    associatedTexts: [],
  },
  {
    id: "dev-anand",
    name: "Dev Anand",
    title: "The Mind-Body Healer",
    quote: "In the midst of movement and chaos, keep stillness inside you.",
    image: "",
    bgImage: "",
    accentColor: "280 30% 55%",
    bio: "Teaches the mind-body connection as shared by Deepak Chopra.",
    keyTeaching: "Mind-Body Healing, Primordial Sound",
    livingStudentOf: "Deepak Chopra",
    practices: [
      {
        name: "Primordial Sound Meditation",
        duration: "20-30 min",
        description: "Use a personal mantra to transcend thought and access pure awareness.",
        steps: ["Sit comfortably. Close your eyes. Silently repeat your mantra. Let it become softer."],
        modes: ["timer"],
        difficulty: "beginner",
      },
    ],
    programs: [],
    journey: { masterId: "dev-anand", totalDays: 100, dailyTimeMinutes: 30, days: [] },
    associatedTexts: [],
  },
  {
    id: "ananya-desai",
    name: "Ananya Desai",
    title: "The Compassionate Healer",
    quote: "The attempt to escape from pain is what creates more pain.",
    image: "",
    bgImage: "",
    accentColor: "160 30% 50%",
    bio: "Studies trauma and healing through the lens of Gabor Maté's compassionate approach.",
    keyTeaching: "Trauma, Compassion, Authenticity",
    livingStudentOf: "Gabor Maté",
    practices: [
      {
        name: "Compassionate Inquiry",
        duration: "15-30 min",
        description: "Gently ask: 'What's happening inside me right now?' Don't answer. Just notice.",
        steps: ["Sit. Ask: 'What am I feeling right now?' Don't analyze. Just feel."],
        modes: ["chat"],
        difficulty: "intermediate",
      },
    ],
    programs: [],
    journey: { masterId: "ananya-desai", totalDays: 100, dailyTimeMinutes: 30, days: [] },
    associatedTexts: [],
  },
  {
    id: "rohan-kapoor",
    name: "Rohan Kapoor",
    title: "The Neuroscience Guide",
    quote: "Your nervous system determines your perception of reality. Train it well.",
    image: "",
    bgImage: "",
    accentColor: "210 40% 50%",
    bio: "Applies neuroscience research to practical daily protocols.",
    keyTeaching: "Neuroplasticity, Breath Protocols, Focus",
    livingStudentOf: "Andrew Huberman",
    practices: [
      {
        name: "Physiological Sigh Protocol",
        duration: "5-10 min",
        description: "Double inhale through nose, long exhale through mouth. Resets nervous system in real-time.",
        steps: ["Inhale deeply through nose. Inhale again (short). Exhale slowly through mouth. Repeat 10-30 times."],
        modes: ["timer"],
        difficulty: "beginner",
      },
    ],
    programs: [],
    journey: { masterId: "rohan-kapoor", totalDays: 100, dailyTimeMinutes: 30, days: [] },
    associatedTexts: [],
  },
  {
    id: "maya-patel",
    name: "Maya Patel",
    title: "The Compassionate Warrior",
    quote: "You are the sky. Everything else is just the weather.",
    image: "",
    bgImage: "",
    accentColor: "260 30% 55%",
    bio: "Practices and teaches compassion and fearlessness in the tradition of Pema Chödrön.",
    keyTeaching: "Compassion, Fearlessness, Groundlessness",
    livingStudentOf: "Pema Chödrön",
    practices: [
      {
        name: "Tonglen (Giving and Taking)",
        duration: "10-20 min",
        description: "Breathe in others' suffering. Breathe out compassion. The most radical practice of all.",
        steps: ["Rest in openness. Breathe in pain (yours or others'). Breathe out relief and light."],
        modes: ["timer", "chat"],
        difficulty: "advanced",
      },
    ],
    programs: [],
    journey: { masterId: "maya-patel", totalDays: 100, dailyTimeMinutes: 30, days: [] },
    associatedTexts: [],
  },
  {
    id: "kiran-rao",
    name: "Kiran Rao",
    title: "The Inquirer",
    quote: "When I argue with reality, I lose — but only 100% of the time.",
    image: "",
    bgImage: "",
    accentColor: "30 50% 55%",
    bio: "Facilitates The Work — four questions that change everything.",
    keyTeaching: "The Work, Self-Inquiry, Freedom",
    livingStudentOf: "Byron Katie",
    practices: [
      {
        name: "The Work",
        duration: "15-30 min",
        description: "Take a stressful thought. Ask: Is it true? Can I know it's true? How do I react? Who would I be without it?",
        steps: ["Write a judgmental thought. Ask: Is it true? Can I absolutely know it's true? How do I react when I believe it? Who would I be without this thought?"],
        modes: ["chat"],
        difficulty: "beginner",
      },
    ],
    programs: [],
    journey: { masterId: "kiran-rao", totalDays: 100, dailyTimeMinutes: 30, days: [] },
    associatedTexts: [],
  },
];

/**
 * Helper: Get display name for living master
 * Returns: "Sadhguru's Student" with subtitle "Teachings inspired by Sadhguru's work"
 */
export function getLivingMasterDisplayName(master: Guru): { name: string; subtitle: string } {
  if (master.livingStudentOf) {
    return {
      name: master.name,
      subtitle: `Teachings inspired by ${master.livingStudentOf}'s work`,
    };
  }
  return { name: master.name, subtitle: master.title };
}

/**
 * Helper: Check if master is a living "Student of"
 */
export function isLivingMaster(master: Guru): boolean {
  return !!master.livingStudentOf;
}
