import type { OrientationSession } from "../types";

export const act3Sessions: OrientationSession[] = [
  {
    index: 13, act: 3, frameworkId: "three-llms",
    title: "The 3 Inner LLMs",
    subtitle: "Head, Heart, Gut — you have three intelligences, not one",
    teach: {
      hook: "You're not one mind. You're three.",
      body: "The Head: analyzes, plans, judges. The Heart: senses meaning, connection, value. The Gut: knows truth before words — yes or no, safe or not. Modern life trains you to live in the Head and ignore the other two. The ancient teachers knew differently: real intelligence is all three in conversation. When they disagree, that's data — not noise.",
      whyItMatters: "Decisions made by only the Head are why you're tired, stuck, and unsure.",
    },
    practice: {
      title: "Three answers to one question",
      steps: [
        "Pick a real question facing you right now.",
        "Ask the Head: what does it think? Listen.",
        "Ask the Heart: what does it want? Listen.",
        "Ask the Gut: what does it know? Listen.",
        "Notice — do they agree, or are they fighting?",
      ],
      durationMinutes: 5,
    },
    reflect: { prompt: "Which of the three did you have the hardest time hearing?" },
    integrate: { cue: "Today, before one decision, I check all three." },
  },
  {
    index: 14, act: 3, frameworkId: "head-lens",
    title: "Head Lens",
    subtitle: "Thought patterns & cognitive bias",
    teach: {
      hook: "The Head's superpower is also its trap: it loves a pattern, even a wrong one.",
      body: "Catastrophizing (worst case becomes the case). Mind-reading (you 'know' what they're thinking). All-or-nothing (perfect or worthless). Should-ing (the relentless 'I should'). These aren't moral failures — they're software bugs in old code. Catching one in real time disarms it.",
      whyItMatters: "Untrained, the Head will rehearse the same disaster 40 times before lunch.",
    },
    practice: {
      title: "Catch one distortion",
      steps: [
        "Think of one stressful thought from today.",
        "Match it to one of the four: catastrophizing / mind-reading / all-or-nothing / should-ing.",
        "Say out loud: 'That was [name of distortion].'",
        "Notice — the thought softens the moment it's named.",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "Which distortion is your most frequent guest?" },
    integrate: { cue: "Today, when a hard thought lands, I name its type before believing it." },
  },
  {
    index: 15, act: 3, frameworkId: "heart-lens",
    title: "Heart Lens",
    subtitle: "Felt-sense — emotions live in the body, not the mind",
    teach: {
      hook: "Emotions aren't thoughts about feelings. They're felt — somewhere, specifically.",
      body: "Sadness has a location. Anger has a temperature. Anxiety has a texture. When you can name the feeling AND locate it AND describe its quality, you're working with it. When you only think 'I feel bad', you're stuck. The Heart Lens is the practice of getting precise.",
      whyItMatters: "Vague feelings stay forever. Precise feelings move.",
    },
    practice: {
      title: "Name, locate, describe",
      steps: [
        "Close eyes. What feeling is here right now? Name it.",
        "Where in your body is it? Chest, throat, stomach, jaw?",
        "What's it like — heavy, sharp, tight, fluttery, hot, cold?",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "What did precision reveal that vagueness was hiding?" },
    integrate: { cue: "Today, one feeling gets named, located, and described — instead of suppressed." },
  },
  {
    index: 16, act: 3, frameworkId: "gut-lens",
    title: "Gut Lens",
    subtitle: "Somatic intelligence — the body knows what the mind hides",
    teach: {
      hook: "Your body has been keeping score since you were two. It knows things your mind has forgotten.",
      body: "The vagus nerve carries more signals up to the brain than down to the body. Your gut has its own neural network. Trauma stores in tissue. Truth shows up as a 'yes' in the chest before the words form. When you learn to listen, the body becomes the most honest instrument you have.",
      whyItMatters: "If you only consult the mind, you'll keep walking past your own warnings.",
    },
    practice: {
      title: "Body scan + heat map",
      steps: [
        "Close eyes. Scan slowly: scalp, face, throat, chest, belly, hips, legs, feet.",
        "Mark where there's tension — even small.",
        "Place a hand on the loudest spot for 30 seconds. Just listen.",
      ],
      durationMinutes: 5,
    },
    reflect: { prompt: "What was your body trying to tell you?" },
    integrate: { cue: "Today, before deciding anything important, I check the chest and the gut." },
  },
  {
    index: 17, act: 3, frameworkId: "breath-bridge",
    title: "Breath as Bridge",
    subtitle: "Pranayama basics — the only voluntary nervous system input",
    teach: {
      hook: "You can't will your heart to slow. You can will your breath to slow. And the heart follows.",
      body: "Breath is the bridge between voluntary and involuntary. Slow exhale → parasympathetic activation → calm. Fast inhale → sympathetic → alert. The yogis figured this out 3000 years before vagal-tone research. Pranayama isn't mystical — it's the most direct nervous-system control you have.",
      whyItMatters: "When everything else is too far gone to fix, you can always change the breath.",
    },
    practice: {
      title: "Three-part breath",
      steps: [
        "Inhale into the belly (2 sec). Then into the ribs (2 sec). Then into the chest (2 sec).",
        "Exhale top down, slowly, twice as long as the inhale.",
        "Six rounds. Notice the nervous system shift.",
      ],
      durationMinutes: 4,
    },
    reflect: { prompt: "How different are you from when you started this session?" },
    integrate: { cue: "Today, before one stressful moment, I take three long exhales." },
  },
  {
    index: 18, act: 3, frameworkId: "voice-prosody",
    title: "Voice & Prosody",
    subtitle: "Your voice tells the truth before your words do",
    teach: {
      hook: "You can lie with your words. You can't lie with your voice.",
      body: "Pitch, pace, tremor, breathiness — your voice broadcasts your nervous system state in real time. Other people hear it before they hear your words. Awake people learn to hear it in themselves too. A voice that's too fast or too tight is data — about you, from you.",
      whyItMatters: "Voice is the cheapest, most honest biofeedback you'll ever have.",
    },
    practice: {
      title: "30-second spoken check-in",
      steps: [
        "Speak aloud for 30 seconds — just describe how today has been.",
        "Don't edit. Don't perform.",
        "Then listen back in your head: was your voice tight, fast, flat, or open?",
      ],
      durationMinutes: 3,
    },
    reflect: { prompt: "What did your voice tell you that you hadn't said?" },
    integrate: { cue: "Today, once, I listen to my voice the way someone else would." },
  },
];
