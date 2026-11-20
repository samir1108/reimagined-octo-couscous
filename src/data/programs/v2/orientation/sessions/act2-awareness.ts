import type { OrientationSession } from "../types";

export const act2Sessions: OrientationSession[] = [
  {
    index: 7, act: 2, frameworkId: "witness",
    title: "The Witness",
    subtitle: "You are not your thoughts",
    teach: {
      hook: "There's a thinker, and there's a watcher of the thinker. They're not the same.",
      body: "Right now, notice: a thought just appeared. Then notice — who noticed? That noticer is older than the thought. It was here before this thought, it'll be here after. The Vedas call it Sakshi. The witness. Most people live their whole lives without meeting it. Today you meet it.",
      whyItMatters: "Every other practice rests on this one. Without the witness, you're inside the thought, not above it.",
    },
    practice: {
      title: "60-second witness sit",
      steps: [
        "Close your eyes. Let thoughts come.",
        "Each time a thought arrives, silently say: 'thought.'",
        "Don't push it away. Don't follow it. Just label and return to the watching.",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "Did you catch the gap between thoughts — even for a second?" },
    integrate: { cue: "Today, when I'm spinning — I pause and ask: who is watching this?" },
    unlocks: ["The Witness practice in your daily tools"],
  },
  {
    index: 8, act: 2, frameworkId: "session-anatomy",
    title: "Session Anatomy",
    subtitle: "Every session is four moves",
    teach: {
      hook: "Teach. Practice. Reflect. Integrate. That's it. Every session, every time.",
      body: "Teach: a 60–90 second concept. Practice: the actual doing — 2 to 5 minutes. Reflect: one question to crystallize what just happened. Integrate: one line to carry into your day. This shape isn't decoration. It's how the brain converts an idea into an embodied capacity. Skip integrate and the session evaporates by lunch.",
      whyItMatters: "When you see the shape, you stop waiting for 'the real teaching.' Every part is the teaching.",
    },
    practice: {
      title: "Walk the shape",
      steps: [
        "You just got the Teach.",
        "Now: take 3 conscious breaths — that's the Practice.",
        "Reflect: how do those breaths feel different from automatic ones?",
        "Integrate: pick one moment today where you'll take 3 conscious breaths again.",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "Which of the four parts do you usually skip in life?" },
    integrate: { cue: "Today, I close one loop properly — teach, practice, reflect, integrate." },
  },
  {
    index: 9, act: 2, frameworkId: "practice-levels",
    title: "Practice Levels — L0 to L6",
    subtitle: "You start where you start",
    teach: {
      hook: "Observation is not one skill. It's seven, stacked.",
      body: "L0: notice one thought, once. L1: notice 3 thoughts in a row. L2: name the type (judgement, worry, fantasy). L3: feel where it lands in the body. L4: catch it as it arises, not after. L5: rest as the watcher between thoughts. L6: open eyes, in life, continuously. Most apps treat meditation as binary — you do it or you don't. This app meets you at L0 if that's where you are, and walks you up.",
      whyItMatters: "You can't skip levels. Trying L4 from L0 is why most people quit and call themselves bad at meditation.",
    },
    practice: {
      title: "L0 then L1",
      steps: [
        "L0: notice one thought in your head right now. Just one. Done.",
        "L1: now wait, and count three thoughts in a row.",
        "Notice — L1 already felt different from L0. That's the engine.",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "Which level felt natural? Which one was a stretch?" },
    integrate: { cue: "I don't have to be good. I have to be at my level." },
  },
  {
    index: 10, act: 2, frameworkId: "eleven-bands",
    title: "The 11 Bands",
    subtitle: "Consciousness is a spiral, not a ladder",
    teach: {
      hook: "There are 11 bands of consciousness — and you'll spiral through them, not climb them.",
      body: "Band 0: reactive, mostly asleep. Band 3: noticing. Band 5: practicing. Band 7: living the practice. Band 10: it lives you. But here's the secret — you don't go up like stairs. You spiral. You hit band 5, drop to band 3 in a hard week, climb back to band 6. The drop is part of the climb. Apps that promise a straight line are lying.",
      whyItMatters: "When you understand the spiral, regression stops being failure. It becomes data.",
    },
    practice: {
      title: "Find your band",
      steps: [
        "Read the bands again slowly: reactive → noticing → practicing → living → embodied.",
        "Without overthinking, pick the one where you mostly live this week.",
        "That's your starting band. Not your final one. Just where the path picks you up.",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "What's one thing that would have to shift for you to move up one band?" },
    integrate: { cue: "Today, when I slip — I remember: this is the spiral, not the fall." },
  },
  {
    index: 11, act: 2, frameworkId: "six-dimensions",
    title: "The 6 Dimensions",
    subtitle: "Your shape across the inner world",
    teach: {
      hook: "You're not one number. You're six.",
      body: "Awareness (can you watch?). Emotion (can you feel without drowning?). Body (do you live in it?). Mind (do you use it or does it use you?). Energy (do you have prana, or are you depleted?). Purpose (do you know what you're here for?). Most people are strong in 2, weak in 4. The work is not to max all six — it's to know your shape.",
      whyItMatters: "Without dimensions, you'll work on what you're already strong at. The whole app pushes you toward your weak edges.",
    },
    practice: {
      title: "Rate your six",
      steps: [
        "Score 0–10 on each, gut answer, no thinking:",
        "Awareness · Emotion · Body · Mind · Energy · Purpose.",
        "Notice the two lowest. That's where the next year of work probably is.",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "Which dimension surprised you with how low it was?" },
    integrate: { cue: "I'll feed my weakest dimension once today — even one minute counts." },
  },
  {
    index: 12, act: 2, frameworkId: "calibration",
    title: "Calibration",
    subtitle: "How the engine learns you",
    teach: {
      hook: "This app is not a content library. It's a mirror that gets sharper every session.",
      body: "Every tap, every reflection, every breath you take in a practice — the engine watches. Not to judge you. To learn your shape, your rhythm, your edges. By session 30, the app will know things about you that you don't know about yourself yet. By month 6, it will catch a loop before you do. Today's job: give it three honest signals.",
      whyItMatters: "If you fake your way through, the engine learns a false version of you and serves false practice.",
    },
    practice: {
      title: "Three somatic checks",
      steps: [
        "Where in your body is there tension right now? Name it.",
        "What's your energy — battery 0 to 10?",
        "What's the dominant feeling — one word.",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "What did the three checks reveal that you'd been ignoring?" },
    integrate: { cue: "Today I check in with my body once — without trying to fix anything." },
  },
];
