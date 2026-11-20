import type { OrientationSession } from "../types";

export const act4Sessions: OrientationSession[] = [
  {
    index: 19, act: 4, frameworkId: "loops",
    title: "Loops",
    subtitle: "Trigger → sensation → reaction → consequence",
    teach: {
      hook: "You don't have problems. You have loops.",
      body: "A loop is a complete circuit: something triggers you (a ping, a tone, a face), it lands as sensation (tight chest, hot face), you react automatically (check phone, snap back, withdraw), and consequence follows (more anxiety, broken trust, exhaustion). The app has 300+ named loops. Catching just one in motion gives you the only thing that matters: the gap between sensation and reaction.",
      whyItMatters: "When you see your behavior as 'who I am', nothing changes. When you see it as a loop, it can be interrupted.",
    },
    practice: {
      title: "Map one loop from the last 24 hours",
      steps: [
        "Pick one reactive moment from yesterday — even a small one.",
        "Trigger: what landed? Sensation: where did it hit the body? Reaction: what did you do? Consequence: what came after?",
        "Write or say all four parts. Just naming the loop weakens it.",
      ],
      durationMinutes: 5,
    },
    reflect: { prompt: "Which of the four parts of the loop were you least aware of?" },
    integrate: { cue: "Today, when I catch myself reacting, I silently name: trigger, sensation, reaction." },
  },
  {
    index: 20, act: 4, frameworkId: "samskaras",
    title: "Samskaras",
    subtitle: "The old grooves of the mind",
    teach: {
      hook: "Every loop has an origin. Most are decades old.",
      body: "Samskara = groove. Cut the same path in your mind a thousand times — through childhood, trauma, repetition, culture — and water flows there automatically. You're not weak. You're well-worn. The good news: new grooves can be cut. The bad news: it takes thousands of repetitions of the new pattern to outweigh the old one. There is no shortcut — only sustained, gentle attention.",
      whyItMatters: "When you know the groove is old, you stop being ashamed of it. Shame doesn't cut new grooves. Practice does.",
    },
    practice: {
      title: "Find your oldest loop",
      steps: [
        "Of your top patterns, which one has been with you the longest?",
        "Can you remember when it started? Childhood? A specific event?",
        "Don't analyze. Just acknowledge: this is an old friend. It was trying to protect me.",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "What was the old groove originally protecting you from?" },
    integrate: { cue: "Today, when the old pattern fires, I greet it: 'I see you. Thank you. Not today.'" },
  },
  {
    index: 21, act: 4, frameworkId: "three-second-gap",
    title: "The 3-Second Gap",
    subtitle: "Where freedom lives",
    teach: {
      hook: "Between trigger and reaction, there's a gap. It's exactly long enough to choose.",
      body: "Viktor Frankl said it from the camps: between stimulus and response there is a space. In that space is our freedom. The Buddhists call it the gap. The yogis call it pratyahara. Untrained, the gap is zero — you react before you know you reacted. Trained, the gap grows. First to half a second. Then one. Then three. Three seconds is enough to choose differently.",
      whyItMatters: "Without the gap, you're not living a life. You're running a program.",
    },
    practice: {
      title: "Practice the gap",
      steps: [
        "Pick a small recurring trigger today (notification, email open, a name on caller ID).",
        "When it fires, before reacting — take one slow breath.",
        "That's the gap. That breath. Today, just feel it once.",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "What would change if your gap grew from 0 to 3 seconds, on every trigger?" },
    integrate: { cue: "Today, one trigger gets one breath before I respond." },
  },
  {
    index: 22, act: 4, frameworkId: "four-gates",
    title: "The 4 Gates",
    subtitle: "A day is four rebirths, not one",
    teach: {
      hook: "You don't have one day. You have four.",
      body: "Morning gate (5–10am): how you cross into the day determines its shape. Midday gate (12–2pm): reset before the afternoon rolls you. Evening gate (6–9pm): close the day deliberately or it haunts your sleep. Night gate (before bed): plant tomorrow's seed. Most people sleepwalk through all four. The 4 gates practice — which you'll meet for real after orientation — is the spine of the lifetime path.",
      whyItMatters: "You can't change your whole life. You can change one gate. That's enough to start.",
    },
    practice: {
      title: "Picture your four",
      steps: [
        "In your head, walk through your typical day.",
        "Mark the four gates: morning, midday, evening, night.",
        "Which gate do you currently sleepwalk through the most?",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "If you could only be awake for one of the four gates this week, which would you pick?" },
    integrate: { cue: "Today, I cross one gate consciously — even with a 30-second pause." },
  },
  {
    index: 23, act: 4, frameworkId: "shadow",
    title: "Shadow",
    subtitle: "What you've disowned runs you from the dark",
    teach: {
      hook: "Whatever you reject in yourself, you'll meet in your life. Repeatedly.",
      body: "Jung called it the shadow — the parts of you you've decided aren't 'you.' Anger, neediness, ambition, weakness, jealousy. They don't disappear when you reject them. They just go underground and run you from there. Shadow work isn't morbid. It's reclaiming. Every disowned part wants to come home.",
      whyItMatters: "The unowned shadow is the single largest source of repeated suffering you'll find.",
    },
    practice: {
      title: "Name one disowned part (safely)",
      steps: [
        "What's one quality you're proud you're 'not' — selfish, lazy, needy, angry, weak?",
        "Where in your life does that quality keep showing up anyway, in others or in events?",
        "Say silently: 'this is also in me. And it's okay.' That's the beginning.",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "What does it cost you to keep this part of you in the dark?" },
    integrate: { cue: "Today, when I judge someone harshly — I check if it's actually a mirror." },
  },
  {
    index: 24, act: 4, frameworkId: "self-inquiry",
    title: "Self-Inquiry — Who is thinking this?",
    subtitle: "Ramana's direct path, modernized",
    teach: {
      hook: "Every thought has a thinker. Trace the thinker to its source and the source disappears.",
      body: "Ramana Maharshi's whole teaching, distilled: when a thought arises, instead of following it, ask — to whom does this thought arise? Answer: to me. Then ask: who is this 'me'? Don't accept an answer. Sit with the question. Done seriously, the questioner dissolves into the awareness behind it. That awareness has no problem. It is what you are.",
      whyItMatters: "Self-inquiry isn't philosophy. It's a tool to cut at the root of every other problem at once.",
    },
    practice: {
      title: "One inquiry cycle",
      steps: [
        "Notice a thought. Any thought.",
        "Ask: to whom is this thought arising?",
        "Answer: to me.",
        "Ask: who is this 'me'? Don't answer. Just sit with the question for 60 seconds.",
        "Notice what's there when the answer doesn't come.",
      ],
      durationMinutes: 5,
    },
    reflect: { prompt: "What was there when the 'me' couldn't be found?" },
    integrate: { cue: "Today, once, I'll ask: who is having this experience?" },
  },
];
