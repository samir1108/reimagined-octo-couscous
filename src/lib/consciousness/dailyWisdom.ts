import { GateId, getGateDef } from "./dailyGates";
import type { ConsciousnessProfile, UserTimeProfile } from "./dailyMissions";

export type WisdomCategory =
  | "theme"
  | "inquiry"
  | "whisper"
  | "guru_insight"
  | "potholes"
  | "challenges"
  | "observations"
  | "shadow_signal"
  | "integration_key"
  | "evening_metabolization";

export interface WisdomCard {
  id: string;
  category: WisdomCategory;
  title: string;
  content: string;
  subtitle?: string;
  icon: string;
  priority: number;
  gate?: GateId;
  unlocked?: boolean;
  unlockCondition?: string;
  action?: {
    label: string;
    type: "guide" | "journal" | "practice" | "internal";
    payload?: any;
  };
  metadata?: Record<string, any>;
}

export interface TodaysWisdom {
  theme: WisdomCard;
  inquiry: WisdomCard;
  whisper: WisdomCard;
  guruInsight: WisdomCard;
  potholes: WisdomCard;
  challenges: WisdomCard;
  observations: WisdomCard;
  shadowSignal: WisdomCard | null;
  integrationKey: WisdomCard | null;
  eveningMetabolization: WisdomCard | null;
  generatedAt: Date;
}

const WISDOM_ICONS: Record<WisdomCategory, string> = {
  theme: "📿",
  inquiry: "❓",
  whisper: "✨",
  guru_insight: "🧘",
  potholes: "🕳️",
  challenges: "🌱",
  observations: "👁️",
  shadow_signal: "⚠️",
  integration_key: "🔑",
  evening_metabolization: "🌙",
};

const POTHOLE_TEMPLATES = {
  morning: [
    { loop: "performance_loop", trigger: "Early meeting", signal: "Performance Loop: 'I must prove myself first thing'" },
    { loop: "perfectionism_loop", trigger: "Morning routine", signal: "Perfectionism Loop: 'If I don't do it perfectly, why bother?'" },
    { loop: "control_loop", trigger: "Planning the day", signal: "Control Loop: Planning replaces presence" },
  ],
  midday: [
    { loop: "avoidance_loop", trigger: "Post-lunch dip", signal: "Avoidance Loop: 'I'll do it later'" },
    { loop: "comparison_loop", trigger: "Social media break", signal: "Comparison Trap activates during scroll" },
    { loop: "energy_loop", trigger: "3-4 PM circadian dip", signal: "Low energy window — loops amplify" },
  ],
  evening: [
    { loop: "rumination_loop", trigger: "Day review", signal: "Rumination Loop: Replaying conversations" },
    { loop: "comparison_loop", trigger: "Evening scroll", signal: "Comparison Trap: Others' highlight reels" },
    { loop: "not_enough_loop", trigger: "Financial check", signal: "Not-Enough Loop: Scarcity thinking" },
  ],
  night: [
    { loop: "anxiety_loop", trigger: "Bedtime", signal: "Anxiety Loop: Tomorrow's worries arrive early" },
    { loop: "rumination_loop", trigger: "Lying in bed", signal: "Rumination Loop: Mental replay prevents sleep" },
    { loop: "control_loop", trigger: "Next day planning", signal: "Control Loop: Planning replaces rest" },
  ],
};

const CHALLENGE_TEMPLATES = {
  body: [
    { challenge: "Body awareness at {score}", opportunity: "Every sensation today is a doorway to presence" },
    { challenge: "Somatic numbness", opportunity: "Your body speaks in whispers — lean in to listen" },
    { challenge: "Physical tension patterns", opportunity: "Where you hold tension is where you hold truth" },
  ],
  thought: [
    { challenge: "Mental chatter at {score}", opportunity: "Thoughts are weather; you are the sky" },
    { challenge: "Ruminative loops", opportunity: "Catch the loop. Name it. Return to now." },
    { challenge: "Planning addiction", opportunity: "Planning is not presence. One breath at a time." },
  ],
  emotion: [
    { challenge: "Emotional reactivity at {score}", opportunity: "Emotions are visitors. Welcome them. Let them leave." },
    { challenge: "Suppressed feelings", opportunity: "What you resist persists. What you feel, heals." },
    { challenge: "Emotional bypassing", opportunity: "Spiritual concepts don't replace emotional honesty." },
  ],
  awareness: [
    { challenge: "Witness instability at {score}", opportunity: "The gap between stimulus and response is your freedom" },
    { challenge: "Auto-pilot dominance", opportunity: "Every 'wake up' moment is a victory" },
    { challenge: "Attention fragmentation", opportunity: "One-pointed attention is a muscle. Exercise it." },
  ],
};

const OBSERVATION_TEMPLATES = {
  morning: [
    "First sensation upon waking — where is it? What's its texture?",
    "Notice the transition: sleep → wake. Where does 'you' appear?",
    "Before checking phone: three breaths. Feel the body arrive.",
    "Morning light on skin — temperature, quality, direction.",
  ],
  midday: [
    "Between each task: 3 sounds, feet on floor, one conscious breath.",
    "When urgency arises — is it real or a loop?",
    "Lunch: first three bites with no screen. Taste. Texture. Gratitude.",
    "Notice posture right now. What does it say about your state?",
  ],
  evening: [
    "One reactive moment today — trace it to body sensation.",
    "What did you defend today? What were you protecting?",
    "Where did attention collapse? Where did it hold?",
    "The day's weight in your body — locate it. Breathe there.",
  ],
  night: [
    "Lay down today's identity. Who remains?",
    "Long exhale — what releases without effort?",
    "Tonight, let the body speak in dreams. Listen.",
    "Tomorrow is not yet. This breath is.",
  ],
};

const GURU_INSIGHTS = [
  { guru: "Ramana Maharshi", insight: "The mind is a bundle of thoughts. The root of all thoughts is the 'I' thought. Who am I? This inquiry alone dissolves the false.", tradition: "Advaita Vedanta" },
  { guru: "Patañjali", insight: "Yoga is the cessation of the fluctuations of consciousness. Then the seer rests in its true nature.", tradition: "Yoga Sutras" },
  { guru: "Buddha", insight: "All conditioned things are impermanent. When one sees this with wisdom, one turns away from suffering.", tradition: "Dhammapada" },
  { guru: "Lao Tzu", insight: "The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name.", tradition: "Tao Te Ching" },
  { guru: "Rumi", insight: "The wound is the place where the Light enters you. Don't turn away. Keep your gaze there.", tradition: "Sufism" },
  { guru: "Nisargadatta Maharaj", insight: "Wisdom says: I am nothing. Love says: I am everything. Between the two, my life flows.", tradition: "Advaita Vedanta" },
  { guru: "Thich Nhat Hanh", insight: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", tradition: "Plum Village" },
  { guru: "Adi Shankara", insight: "Brahman is real. The world is appearance. The individual self is none other than Brahman.", tradition: "Advaita Vedanta" },
  { guru: "Kabir", insight: "The musk deer searches the world for fragrance, not knowing it comes from its own navel.", tradition: "Bhakti" },
  { guru: "Mooji", insight: "You don't need to get rid of thoughts. You just need to stop believing them.", tradition: "Advaita Vedanta" },
];

function getDayOfYear(): number {
  return Math.floor(Date.now() / 86400000);
}

function getWeakestDimension(profile: ConsciousnessProfile): string {
  const bands = profile.dimensionBands;
  if (!bands) return "body";
  const entries = Object.entries(bands).filter(([k]) => k !== "total");
  if (!entries.length) return "body";
  entries.sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0));
  return entries[0]?.[0] ?? "body";
}

function getActiveLoops(profile: ConsciousnessProfile): string[] {
  return profile.activeLoops ?? [];
}

function getBypassingRisk(profile: ConsciousnessProfile): number {
  return profile.bypassingRisk ?? 0;
}

function getCircadianType(profile: ConsciousnessProfile, userTimeProfile?: UserTimeProfile): string {
  return profile.circadianType ?? userTimeProfile?.circadianType ?? "normal";
}

export function generateTodaysWisdom(
  profile: ConsciousnessProfile,
  currentGate: GateId,
  userTimeProfile?: UserTimeProfile,
  completedMissionsCount: number = 0,
  activeSessionCount: number = 0
): TodaysWisdom {
  const dayOfYear = getDayOfYear();
  const weakestDim = getWeakestDimension(profile);
  const activeLoops = getActiveLoops(profile);
  const primaryLoop = activeLoops[0];
  const bypassingRisk = getBypassingRisk(profile);
  const circadianType = getCircadianType(profile, userTimeProfile);
  const gateDef = getGateDef(currentGate);
  const dimScore = profile.dimensionBands?.[weakestDim] ?? 50;
  const vLevel = profile.vLevel ?? 0;
  const journeyDay = profile.journeyDay ?? 1;

  const createCard = (overrides: Partial<WisdomCard>): WisdomCard => ({
    id: `wisdom-${overrides.category}-${dayOfYear}`,
    icon: WISDOM_ICONS[overrides.category] ?? "🎯",
    priority: 5,
    unlocked: true,
    ...overrides,
  });

  // 1. THEME
  const themeCard = createCard({
    category: "theme",
    title: "Today's Theme",
    content: gateDef.theme,
    subtitle: gateDef.naturalEnergy,
    gate: currentGate,
    metadata: { gateTheme: gateDef.theme, gateEnergy: gateDef.naturalEnergy },
  });

  // 2. INQUIRY
  const inquiryCard = createCard({
    category: "inquiry",
    title: "Inner Inquiry",
    content: gateDef.theme === "Architecture of Attention"
      ? "Where does attention go when you're not watching it?"
      : `What does ${gateDef.theme.toLowerCase()} feel like in the body right now?`,
    subtitle: "Hold the question. Don't answer.",
    gate: currentGate,
    action: { label: "Explore in Guide", type: "guide", payload: { mode: "inquiry" } },
  });

  // 3. WHISPER (unlocked at 3 missions)
  const whisperUnlocked = completedMissionsCount >= 3;
  const whisperCard = createCard({
    category: "whisper",
    title: "Future Whisper",
    content: whisperUnlocked
      ? "In 6 months you'll look back and see this pause changed everything. The days you didn't skip. The moments you caught the loop. The breaths you took on purpose. They compound."
      : "Complete 3 missions today to unlock a whisper from your future self.",
    subtitle: whisperUnlocked ? "Unlocked ✨" : `${3 - completedMissionsCount} missions to unlock`,
    unlocked: whisperUnlocked,
    unlockCondition: "Complete 3 daily missions",
    metadata: { missionsCompleted: completedMissionsCount, required: 3 },
  });

  // 4. GURU INSIGHT
  const guruIndex = dayOfYear % GURU_INSIGHTS.length;
  const guru = GURU_INSIGHTS[guruIndex];
  const guruCard = createCard({
    category: "guru_insight",
    title: "Guru Insight",
    content: guru.insight,
    subtitle: `${guru.guru} · ${guru.tradition}`,
    action: { label: "Listen in Guide", type: "guide", payload: { mode: "inquiry", guru: guru.guru } },
    metadata: { guru: guru.guru, tradition: guru.tradition },
  });

  // 5. POTHOLES (predictive challenges)
  const potholeTemplates = POTHOLE_TEMPLATES[currentGate] || POTHOLE_TEMPLATES.midday;
  const relevantPotholes = activeLoops.length > 0
    ? potholeTemplates.filter(p => activeLoops.some(l => p.loop.includes(l.replace("_loop", ""))))
    : potholeTemplates.slice(0, 3);
  const potholesCard = createCard({
    category: "potholes",
    title: "Today's Potholes",
    content: relevantPotholes.map(p => `🕳️ ${p.trigger} → ${p.signal}`).join("\n"),
    subtitle: "Predictive — based on your active loops & calendar",
    gate: currentGate,
    metadata: { potholes: relevantPotholes, activeLoops },
    action: { label: "View All Potholes", type: "guide", payload: { mode: "loop_work" } },
  });

  // 6. CHALLENGES (growth opportunities)
  const challengeTemplates = CHALLENGE_TEMPLATES[weakestDim as keyof typeof CHALLENGE_TEMPLATES] || CHALLENGE_TEMPLATES.body;
  const challenges = challengeTemplates.map(t => ({
    challenge: t.challenge.replace("{score}", dimScore.toString()),
    opportunity: t.opportunity,
  }));
  if (primaryLoop) {
    challenges.unshift({
      challenge: `${primaryLoop.replace(/_/g, " ")} (${profile.loopSeverity?.[primaryLoop] ?? 7}/10)`,
      opportunity: `This loop's antidote at ${currentGate} gate: ${gateDef.theme.toLowerCase()} energy naturally dissolves it`
    });
  }
  const challengesCard = createCard({
    category: "challenges",
    title: "Today's Challenges",
    content: challenges.slice(0, 3).map(c => `🌱 Challenge: ${c.challenge} → Opportunity: ${c.opportunity}`).join("\n"),
    subtitle: `Growth opportunities from your ${weakestDim} dimension (${dimScore}) & loops`,
    gate: currentGate,
    metadata: { challenges, weakestDimension: weakestDim, primaryLoop },
    action: { label: "Reframe All", type: "guide", payload: { mode: "inquiry", focus: weakestDim } },
  });

  // 7. OBSERVATIONS (micro-awareness prompts)
  const observationTemplates = OBSERVATION_TEMPLATES[currentGate] || OBSERVATION_TEMPLATES.midday;
  const observations = observationTemplates.slice(0, 3);
  const observationsCard = createCard({
    category: "observations",
    title: "Today's Observations",
    content: observations.map((o, i) => `👁️ ${o}`).join("\n"),
    subtitle: `Micro-awareness prompts for ${gateDef.theme} gate`,
    gate: currentGate,
    metadata: { observations, gate: currentGate },
    action: { label: "Explore in Guide", type: "guide", payload: { mode: "somatic", prompt: observations[0] } },
  });

  // 8. SHADOW SIGNAL
  let shadowCard: WisdomCard | null = null;
  if (bypassingRisk > 0.5) {
    shadowCard = createCard({
      category: "shadow_signal",
      title: "Shadow Signal",
      content: bypassingRisk > 0.7
        ? "Spiritual bypassing detected — using practice to avoid feeling. The practice becomes the escape."
        : "High bypassing risk — practice may be masking what needs to be felt.",
      subtitle: `Bypassing risk: ${Math.round(bypassingRisk * 100)}%`,
      priority: 10,
      action: { label: "Explore in Guide", type: "guide", payload: { mode: "shadow_work" } },
      metadata: { bypassingRisk, type: "bypassing" },
    });
  } else if (vLevel > 3 && Math.random() < 0.15) {
    // Occasional regression signal for advanced users
    shadowCard = createCard({
      category: "shadow_signal",
      title: "Shadow Signal",
      content: "Regression pattern — an old loop is resurfacing. This is normal. It's not backsliding; it's deepening.",
      subtitle: "Old pattern returning for final release",
      priority: 9,
      action: { label: "Explore in Guide", type: "guide", payload: { mode: "loop_work" } },
      metadata: { type: "regression", vLevel },
    });
  }

  // 9. INTEGRATION KEY (available after midday + session)
  let integrationCard: WisdomCard | null = null;
  if (["evening", "night"].includes(currentGate) && activeSessionCount > 0) {
    const integrationKeys = [
      `Today's theme was '${gateDef.theme}'. Integration: Before sleep, review — where did attention collapse? Where did it hold?`,
      `You completed ${activeSessionCount} session(s) and ${completedMissionsCount} mission(s). Integration: Journal — 'What shifted in my witness capacity today?'`,
      `${primaryLoop ? `${primaryLoop} interrupted ${profile.loopAntidoteProgress?.[primaryLoop] ?? "several"}x` : "Loops observed today"}. Integration: Celebrate the catches. Each one weakens the pattern.`,
      `Energy today: ${gateDef.naturalEnergy}. Integration: How did this energy move through you? Where did it get stuck?`,
    ];
    integrationCard = createCard({
      category: "integration_key",
      title: "Integration Key",
      content: integrationKeys[dayOfYear % integrationKeys.length],
      subtitle: "Evening metabolization — available after midday gate",
      gate: currentGate,
      priority: 8,
      action: { label: "Journal Now", type: "journal", payload: { prompt: integrationKeys[dayOfYear % integrationKeys.length] } },
      metadata: { sessionsToday: activeSessionCount, missionsToday: completedMissionsCount },
    });
  }

  // 10. EVENING METABOLIZATION (Night gate only)
  let eveningMetabolizationCard: WisdomCard | null = null;
  if (currentGate === "night") {
    const metabolizationPrompts = [
      { line: "Today I reacted when ____. The sensation was ____. I release it.", gratitudes: "Not for what happened, but for what you noticed.", scan: "Where does the day live in your body? Breathe there. Exhale = release." },
      { line: "The pattern I saw today was ____. It lives in my ____ (body part). I witness it.", gratitudes: "Three moments you caught yourself — that's the victory.", scan: "Body scan for sleep: toes to crown. Tense 3s. Release completely. Feel surrender." },
      { line: "If today had one word, it would be ____. Tomorrow, I bring ____.", gratitudes: "One person. One sensation. One insight.", scan: "Long exhales only. No count. No technique. Just release." },
    ];
    const prompt = metabolizationPrompts[dayOfYear % metabolizationPrompts.length];
    eveningMetabolizationCard = createCard({
      category: "evening_metabolization",
      title: "Evening Metabolization",
      content: `"${prompt.line}"\n\n${prompt.gratitudes}\n\n${prompt.scan}`,
      subtitle: "Night Sanctuary exclusive — complete before sleep",
      gate: "night",
      priority: 10,
      action: { label: "Begin Metabolization", type: "journal", payload: { prompt: prompt.line, type: "evening_metabolization" } },
      metadata: { prompt, type: "evening_metabolization" },
    });
  }

  return {
    theme: themeCard,
    inquiry: inquiryCard,
    whisper: whisperCard,
    guruInsight: guruCard,
    potholes: potholesCard,
    challenges: challengesCard,
    observations: observationsCard,
    shadowSignal: shadowCard,
    integrationKey: integrationCard,
    eveningMetabolization: eveningMetabolizationCard,
    generatedAt: new Date(),
  };
}