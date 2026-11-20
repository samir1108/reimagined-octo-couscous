import type { AppIntroProps } from "./AppScrollIntro";
import { publicAssetUrl, publicImageUrl } from "@/lib/media/publicAssets";

/**
 * Content for the scroll-driven intro at /app-intro.
 *
 * Screens: `npm run capture:login` (once) + `npm run capture` grabs every route
 * at desktop 1920×1080 and mobile 390×844 into docs/captures/, then
 * `npm run capture:publish` copies them into public/app-captures/ — which is
 * what the pairs below reference (`/app-captures/<route>-desktop.png`).
 * Until a file exists, the pair renders a labelled placeholder.
 *
 * Narration: each beat's `narration` is spoken by Deepgram (tts-speak edge
 * function) when the viewer turns voice on. Keep narration close to the body
 * copy — roughly 15–25 words reads in ~5–8 seconds.
 */
const pair = (route: string, label: string, what: string) => ({
  desktop: {
    src: publicImageUrl(`/app-captures/${route}-desktop.png`),
    kind: "image" as const,
    frame: "screen" as const,
    alt: `${what} on desktop`,
    label: `${label} · desktop`,
  },
  mobile: {
    src: publicImageUrl(`/app-captures/${route}-mobile.png`),
    kind: "image" as const,
    frame: "phone" as const,
    alt: `${what} on mobile`,
  },
});
export const SATYUG_INTRO: Omit<AppIntroProps, "onEnter" | "onExplore"> = {
  guruId: "ramana",
  brandLabel: "HOPE",
  sections: [
    {
      id: "temple",
      kicker: "The Temple",
      title: "Every session is composed for you, live.",
      beats: [
        {
          heading: "Open with a single breath",
          body: "One tap enters the Temple. Before a single word is spoken, your state is read — energy, active loops, readiness to go deeper.",
          narration:
            "One tap enters the Temple. Before a single word is spoken, your state is read — energy, active loops, readiness.",
          pair: pair("11-temple", "01 · The Temple", "The Temple home"),
        },
        {
          heading: "The orb sets the rhythm",
          body: "A breathing orb visualises the practice. Slow your breath, and the session slows with you. The room bends to the body.",
          narration:
            "A breathing orb visualises the practice. Slow your breath, and the session slows with you.",
         media: {
             src: publicAssetUrl("/orb.mp4"),
             kind: "video",
             frame: "screen",
             alt: "The breathing orb",
             label: "02 · The orb",
           },
        },
        {
          heading: "A master guides you",
          body: "Thirty-plus guide voices across traditions. The composer picks the one your stage is actually ready to hear.",
          narration:
            "Thirty guide voices across traditions. The composer picks the one your stage is ready to hear.",
          pair: pair("20-masters", "03 · Guides", "The masters gallery"),
        },
      ],
    },
    {
      id: "how-it-works",
      kicker: "How it works",
      title: "Four moments. Every single time.",
      beats: [
        {
          heading: "01 · Land",
          body: "You arrive with whatever the day left you. No forms, no mood pickers — the mirror reads the room.",
          narration:
            "You arrive with whatever the day left you. No forms. The mirror reads the room.",
          pair: pair("10-home", "04 · Land", "Your desk for the day"),
        },
        {
          heading: "02 · Mirror",
          body: "The mirror names the loop it sees, gently. Observation first — seeing the pattern is already half of freedom.",
          narration:
            "The mirror names the loop it sees, gently. Observation first. Seeing the pattern is already half of freedom.",
          pair: pair("03-loops", "05 · Loops", "The loop library"),
        },
        {
          heading: "03 · Practise",
          body: "Observation, self-inquiry, release — assembled into one sitting that fits the minutes you actually have.",
          narration:
            "Observation, self-inquiry, release — assembled into one sitting that fits the minutes you actually have.",
          media: {
            src: publicImageUrl("/app-screens/03-scene-teaching.png"),
            kind: "image",
            frame: "screen",
            alt: "A composed session, scene by scene",
            label: "06 · A sitting, scene by scene",
          },
        },
        {
          heading: "04 · Integrate",
          body: "The session closes with one line you carry into the day. The app does not chase you — it was designed to become unnecessary.",
          narration:
            "The session closes with one line you carry into the day. The app was designed to become unnecessary.",
          pair: pair("14-journal", "07 · Integrate", "The journal"),
        },
      ],
    },
    {
      id: "mirror",
      kicker: "The Mirror",
      title: "See the pattern while it is running.",
      beats: [
        {
          heading: "400+ named loops",
          body: "Worth, safety, power, connection, origin, identity, shadow. Your recurring patterns, mapped — with their trigger, their signature, their exit.",
          narration:
            "Four hundred named loops. Worth, safety, power, connection. Your recurring patterns, mapped — with their trigger, their signature, their exit.",
          pair: pair("19-mirror", "08 · The mirror", "A mirror session"),
        },
        {
          heading: "Caught in the act",
          body: "In chat, the mirror watches cadence, pauses, and language for a loop activating — then reflects it back as a question, not a verdict.",
          narration:
            "The mirror watches your cadence, pauses, and language for a loop activating — then reflects it back as a question, not a verdict.",
          pair: pair("02-loops-atlas", "09 · Atlas", "The loops atlas"),
        },
      ],
    },
    {
      id: "path",
      kicker: "Your path",
      title: "Seven stages. Twelve capacities. One map.",
      beats: [
        {
          heading: "Your stage, honestly named",
          body: "From The Crack to The Awakened — a vertical map of consciousness that tracks where you actually are, not where you perform.",
          narration:
            "From The Crack to The Awakened — a map of consciousness that tracks where you actually are, not where you perform.",
          pair: pair("15-analytics", "10 · Your stage", "Consciousness analytics"),
        },
        {
          heading: "Growth you can see",
          body: "Twelve horizontal capacities — presence, inquiry, resilience, compassion — sharpen session by session, visible only to you.",
          narration:
            "Twelve horizontal capacities — presence, inquiry, resilience, compassion — sharpen session by session, visible only to you.",
          pair: pair("21-constellation", "11 · Capacities", "Your constellation"),
        },
      ],
    },
    {
      id: "voice",
      kicker: "The master's voice",
      title: "Ask anything. Out loud, if you want.",
      beats: [
        {
          heading: "Speak, and you are heard",
          body: "Voice in, voice out. Speech is transcribed on the fly — the answer arrives the way a real conversation does, without typing.",
          narration:
            "Voice in, voice out. Speech is transcribed on the fly — the answer arrives the way a real conversation does.",
          pair: pair("13-guide", "12 · Guide chat", "A guide conversation"),
        },
        {
          heading: "Calibrated to your stage",
          body: "Early on, plain words and steady ground. Later, the subtle and direct. The same master teaches differently as you grow.",
          narration:
            "Early on, plain words and steady ground. Later, the subtle and direct. The same master teaches differently as you grow.",
          pair: pair("12-practice", "13 · Teaching", "Practices set to your stage"),
        },
      ],
    },
  ],
  outro: {
    title: "The instrument is ready.",
    body: "No feed. No streak guilt. A desk for the one piece of work that lasts — becoming who you already are.",
    cta: "Enter the Temple",
  },
};
