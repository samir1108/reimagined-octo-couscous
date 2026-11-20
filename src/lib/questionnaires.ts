/**
 * TEMPLE QUESTIONNAIRES — EXPANDED SET
 * 10 comprehensive assessments mapping the complete inner landscape
 * Each questionnaire generates personalized guide + practice recommendations
 */

export interface Question {
  id: string;
  text: string;
  textHi?: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  value: string;
  label: string;
  labelHi?: string;
  scores: Record<string, number>;
}

export interface Questionnaire {
  id: string;
  title: string;
  titleHi?: string;
  subtitle: string;
  subtitleHi?: string;
  description: string;
  questionCount: number;
  timeEstimate: string;
  questions: Question[];
  results: Record<string, QuestionnaireResult>;
}

export interface QuestionnaireResult {
  id: string;
  title: string;
  description: string;
  recommendedGuides: string[];
  recommendedPractices: string[];
  icon: string;
}

// ─── 1. SLEEP & DREAMS ASSESSMENT ───
export const SLEEP_DREAMS_QUESTIONNAIRE: Questionnaire = {
  id: "sleep-dreams",
  title: "Sleep & Dream Mapping",
  titleHi: "नींद और सपने मानचित्र",
  subtitle: "Understand your nighttime energy",
  subtitleHi: "अपनी रात्रिकाल ऊर्जा को समझें",
  description: "20 questions that reveal your sleep quality, dream patterns, and what your nights are telling you.",
  questionCount: 20,
  timeEstimate: "5 min",
  questions: [
    {
      id: "sd-1",
      text: "How do you usually fall asleep?",
      textHi: "आप आमतौर पर कैसे सोते हैं?",
      options: [
        { value: "easy", label: "Easily — within 10 minutes", labelHi: "आसानी से — 10 मिनट के अंदर", scores: { balanced: 3, racing: 0, heavy: 0, anxious: 0 } },
        { value: "racing", label: "Mind won't stop — thoughts for hours", labelHi: "मैन बंद नहीं होता — घंटों सोचता रहता हूं", scores: { balanced: 0, racing: 3, heavy: 0, anxious: 0 } },
        { value: "heavy", label: "Exhausted — collapse from tiredness", labelHi: "थक कर — नींद से गिर पड़ता हूं", scores: { balanced: 0, racing: 0, heavy: 3, anxious: 0 } },
        { value: "anxious", label: "With worry — replaying the day", labelHi: "चिंता के साथ — पूरे दिन को replay करता हूं", scores: { balanced: 0, racing: 0, heavy: 0, anxious: 3 } },
      ],
    },
    {
      id: "sd-2",
      text: "What kind of dreams do you usually have?",
      textHi: "आपको आमतौर पर कैसे सपने आते हैं?",
      options: [
        { value: "vivid", label: "Vivid — remember them clearly", labelHi: "जीवंत — साफ याद आते हैं", scores: { intuitive: 3, restless: 0, peaceful: 0, none: 0 } },
        { value: "restless", label: "Restless — chase, fall, fight dreams", labelHi: "अशांत — दौड़ना, गिरना, लड़ने के सपने", scores: { intuitive: 0, restless: 3, peaceful: 0, none: 0 } },
        { value: "peaceful", label: "Peaceful — flying, nature, calm scenes", labelHi: "शांत — उड़ना, प्रकृति, शांत दृश्य", scores: { intuitive: 0, restless: 0, peaceful: 3, none: 0 } },
        { value: "none", label: "I don't remember any dreams", labelHi: "मुझे कोई सपना याद नहीं आता", scores: { intuitive: 0, restless: 0, peaceful: 0, none: 3 } },
      ],
    },
    {
      id: "sd-3",
      text: "When you wake up, you usually feel:",
      textHi: "जब आप उठते हैं, आमतौर पर कैसा महसूस करते हैं?",
      options: [
        { value: "fresh", label: "Fresh and ready", labelHi: "ताज़ा और तैयार", scores: { restored: 3, drained: 0, confused: 0, anxious: 0 } },
        { value: "drained", label: "More tired than when I slept", labelHi: "सोने से ज़्यादा थका हुआ", scores: { restored: 0, drained: 3, confused: 0, anxious: 0 } },
        { value: "confused", label: "Confused — can't tell dream from reality", labelHi: "कन्फ्यूज्ड — सपना और हक़ीकत में फर्क नहीं पता", scores: { restored: 0, drained: 0, confused: 3, anxious: 0 } },
        { value: "anxious", label: "Anxious — dreading the day ahead", labelHi: "चिंतित — आने वाले दिन से डर लगता है", scores: { restored: 0, drained: 0, confused: 0, anxious: 3 } },
      ],
    },
  ],
  results: {
    "restless-sleeper": {
      id: "restless-sleeper",
      title: "The Restless Sleeper",
      description: "Your nights are as busy as your days. Your mind doesn't know how to switch off. Dreams are chaotic — running, fighting, falling. Your body is sleeping but your nervous system isn't resting.",
      recommendedGuides: ["siddh", "anaya", "tara"],
      recommendedPractices: ["yoga-nidra", "breath-reset", "safe-space"],
      icon: "🌙",
    },
    "heavy-sleeper": {
      id: "heavy-sleeper",
      title: "The Heavy Sleeper",
      description: "You collapse from exhaustion, not peace. Sleep is escape, not restoration. You wake up heavier, not lighter. Your body is begging for rest but your energy is blocked.",
      recommendedGuides: ["veer", "dhruv", "anaya"],
      recommendedPractices: ["energy-activation", "body-scan", "nervous-system-calm"],
      icon: "🪨",
    },
    "dreamer": {
      id: "dreamer",
      title: "The Dreamer",
      description: "You have vivid, meaningful dreams. Your subconscious is speaking loudly — but you're not listening. Your dreams hold insights your waking mind can't access.",
      recommendedGuides: ["siddh", "aarav", "meera"],
      recommendedPractices: ["dream-journal", "open-awareness", "silent-sitting"],
      icon: "✨",
    },
    "peaceful-sleeper": {
      id: "peaceful-sleeper",
      title: "The Peaceful Sleeper",
      description: "Your sleep is balanced. You rest well and wake refreshed. This is rare. Your challenge is to bring this same peace into your waking hours.",
      recommendedGuides: ["kavya", "siddh", "aarav"],
      recommendedPractices: ["witness", "gratitude", "morning-flow"],
      icon: "🕊️",
    },
  },
};

// ─── 2. RELATIONSHIP PATTERN MAP ───
export const RELATIONSHIP_PATTERN_QUESTIONNAIRE: Questionnaire = {
  id: "relationship-pattern",
  title: "Relationship Pattern Map",
  titleHi: "रिश्तों का पैटर्न मानचित्र",
  subtitle: "How you connect, attach, and protect",
  subtitleHi: "आप कैसे जुड़ते हैं, जुड़ाव बनाते हैं, और खुद को बचाते हैं",
  description: "25 questions that reveal your attachment style and relationship reflexes.",
  questionCount: 25,
  timeEstimate: "6 min",
  questions: [
    {
      id: "rp-1",
      text: "When someone you love pulls away, you:",
      textHi: "जब आपका प्यारा इंसान दूर हो जाए, आप:",
      options: [
        { value: "chase", label: "Chase — try to fix it immediately", labelHi: "पीछा करता हूं — तुरंत ठीक करने की कोशिश", scores: { anxious: 3, avoidant: 0, secure: 0, fearful: 0 } },
        { value: "withdraw", label: "Withdraw — give them space, protect myself", labelHi: "खुद को समेट लेता हूं — उन्हें space देता हूं", scores: { anxious: 0, avoidant: 3, secure: 0, fearful: 0 } },
        { value: "communicate", label: "Communicate — ask what's going on", labelHi: "बात करता हूं — पूछता हूं क्या चल रहा है", scores: { anxious: 0, avoidant: 0, secure: 3, fearful: 0 } },
        { value: "panic", label: "Panic — both want them AND want to run", labelHi: "घबराता हूं — उन्हें चाहता हूं लेकिन भागना भी चाहता हूं", scores: { anxious: 0, avoidant: 0, secure: 0, fearful: 3 } },
      ],
    },
    {
      id: "rp-2",
      text: "In arguments, your default mode is:",
      textHi: "झगड़ों में, आपका default mode क्या है:",
      options: [
        { value: "fight", label: "Fight — I need to be heard and understood", labelHi: "लड़ना — मुझे सुना और समझा जाना चाहिए", scores: { anxious: 3, avoidant: 0, secure: 0, fearful: 0 } },
        { value: "shut", label: "Shut down — go silent until it passes", labelHi: "चुप हो जाना — जब तक खत्म न हो जाए", scores: { anxious: 0, avoidant: 3, secure: 0, fearful: 0 } },
        { value: "discuss", label: "Discuss — try to understand both sides", labelHi: "चर्चा करना — दोनों sides समझने की कोशिश", scores: { anxious: 0, avoidant: 0, secure: 3, fearful: 0 } },
        { value: "people-please", label: "Apologize even when not my fault — just to end it", labelHi: "माफ़ी मांग लेता हूं भले ही मेरी गलती न हो", scores: { anxious: 0, avoidant: 0, secure: 0, fearful: 3 } },
      ],
    },
    {
      id: "rp-3",
      text: "When someone gets too close emotionally, you:",
      textHi: "जब कोई emotionally बहुत करीब आ जाए, आप:",
      options: [
        { value: "lean-in", label: "Lean in — finally someone who gets me", labelHi: "और करीब आता हूं — आखिर कोई जो मुझे समझता है", scores: { anxious: 3, avoidant: 0, secure: 0, fearful: 0 } },
        { value: "pull-away", label: "Pull away — feel suffocated, need space", labelHi: "दूर हो जाता हूं — घुटन महसूस होती है, space चाहिए", scores: { anxious: 0, avoidant: 3, secure: 0, fearful: 0 } },
        { value: "comfortable", label: "Stay comfortable — closeness feels natural", labelHi: "comfortable रहता हूं — closeness natural लगती है", scores: { anxious: 0, avoidant: 0, secure: 3, fearful: 0 } },
        { value: "conflicted", label: "Want closeness but feel terrified at the same time", labelHi: "closeness चाहता हूं लेकिन साथ में डर भी लगता है", scores: { anxious: 0, avoidant: 0, secure: 0, fearful: 3 } },
      ],
    },
  ],
  results: {
    "anxious-attacher": {
      id: "anxious-attacher",
      title: "The Anxious Attacher",
      description: "You love intensely and fear abandonment. When someone pulls away, you chase. You read into every text, every pause, every silence. Your heart is big but your sense of security is small.",
      recommendedGuides: ["meera", "tara", "siddh"],
      recommendedPractices: ["self-compassion", "heart-breathing", "witness"],
      icon: "💔",
    },
    "avoidant-protector": {
      id: "avoidant-protector",
      title: "The Avoidant Protector",
      description: "You value independence above all. Closeness feels like suffocation. You've learned to self-soothe because depending on others felt unsafe. But self-reliance has become isolation.",
      recommendedGuides: ["tara", "meera", "aarav"],
      recommendedPractices: ["vulnerability-practice", "heart-opening", "loving-kindness"],
      icon: "🛡️",
    },
    "secure-connector": {
      id: "secure-connector",
      title: "The Secure Connector",
      description: "Relationships feel natural to you. You can be close without losing yourself. You can communicate needs without drama. This is rare and beautiful.",
      recommendedGuides: ["kavya", "meera", "aarav"],
      recommendedPractices: ["gratitude", "conscious-action", "witness"],
      icon: "🤝",
    },
    "fearful-avoidant": {
      id: "fearful-avoidant",
      title: "The Fearful-Avoidant",
      description: "You want closeness but it terrifies you. You pull people in then push them away. You're caught between longing and fear. This is the most painful pattern — but also the most healable.",
      recommendedGuides: ["tara", "siddh", "meera"],
      recommendedPractices: ["safe-space", "inner-child", "forgiveness"],
      icon: "🌀",
    },
  },
};

// ─── 3. MONEY & ABUNDANCE ENERGY ───
export const MONEY_ABUNDANCE_QUESTIONNAIRE: Questionnaire = {
  id: "money-abundance",
  title: "Money & Abundance Energy",
  titleHi: "पैसा और प्रचुरता ऊर्जा",
  subtitle: "Your relationship with money and worth",
  subtitleHi: "पैसा और आपकी self-worth का रिश्ता",
  description: "20 questions that reveal your financial patterns, scarcity beliefs, and abundance blocks.",
  questionCount: 20,
  timeEstimate: "5 min",
  questions: [
    {
      id: "ma-1",
      text: "When you think about money, your body feels:",
      textHi: "जब पैसों के बारे में सोचते हैं, शरीर में कैसा लगता है:",
      options: [
        { value: "calm", label: "Calm — it's just a tool", labelHi: "शांत — यह बस एक tool है", scores: { abundant: 3, anxious: 0, avoidant: 0, guilty: 0 } },
        { value: "anxious", label: "Anxious — stomach tight, heart racing", labelHi: "चिंतित — पेट tight, दिल तेज़", scores: { abundant: 0, anxious: 3, avoidant: 0, guilty: 0 } },
        { value: "avoidant", label: "Numb — I don't want to think about it", labelHi: "सुन्न — मैं इसके बारे में सोचना नहीं चाहता", scores: { abundant: 0, anxious: 0, avoidant: 3, guilty: 0 } },
        { value: "guilty", label: "Guilty — I don't deserve more", labelHi: "गिल्टी — मैं ज़्यादा deserve नहीं करता", scores: { abundant: 0, anxious: 0, avoidant: 0, guilty: 3 } },
      ],
    },
    {
      id: "ma-2",
      text: "Your spending pattern is usually:",
      textHi: "आपका spending pattern आमतौर पर:",
      options: [
        { value: "mindful", label: "Mindful — I know where every rupee goes", labelHi: "सोच-समझ कर — मुझे पता है हर रुपया कहाँ जाता है", scores: { abundant: 3, impulsive: 0, hoarder: 0, guilty: 0 } },
        { value: "impulsive", label: "Impulsive — buy when stressed or sad", labelHi: "impulsive — stressed या sad होने पर खरीदता हूं", scores: { abundant: 0, impulsive: 3, hoarder: 0, guilty: 0 } },
        { value: "hoarder", label: "Hoarder — save everything, spend nothing", labelHi: "जमाखोर — सब बचाता हूं, कुछ खर्च नहीं करता", scores: { abundant: 0, impulsive: 0, hoarder: 3, guilty: 0 } },
        { value: "confused", label: "Confused — sometimes tight, sometimes loose", labelHi: "confused — कभी tight, कभी loose", scores: { abundant: 0, impulsive: 1, hoarder: 1, guilty: 1 } },
      ],
    },
    {
      id: "ma-3",
      text: "Your deepest belief about money is:",
      textHi: "पैसों के बारे में आपकी सबसे गहरी मान्यता:",
      options: [
        { value: "tool", label: "It's energy — flows in and out naturally", labelHi: "यह energy है — natural आती जाती है", scores: { abundant: 3, scarce: 0, unworthy: 0, evil: 0 } },
        { value: "scarce", label: "There's never enough — always worried", labelHi: "कभी काफी नहीं होता — हमेशा चिंता", scores: { abundant: 0, scarce: 3, unworthy: 0, evil: 0 } },
        { value: "unworthy", label: "I don't deserve more than I have", labelHi: "मैं जो हूं उससे ज़्यादा deserve नहीं करता", scores: { abundant: 0, scarce: 0, unworthy: 3, evil: 0 } },
        { value: "evil", label: "Money corrupts — spiritual people shouldn't want it", labelHi: "पैसा corrupt करता है — spiritual people को नहीं चाहिए", scores: { abundant: 0, scarce: 0, unworthy: 0, evil: 3 } },
      ],
    },
  ],
  results: {
    "abundant-flow": {
      id: "abundant-flow",
      title: "Abundant Flow",
      description: "You have a healthy relationship with money. You see it as energy, not security. You earn, spend, and give with awareness. Your challenge is to maintain this while others around you are in scarcity.",
      recommendedGuides: ["kavya", "arjun", "meera"],
      recommendedPractices: ["gratitude", "conscious-action", "generosity"],
      icon: "💰",
    },
    "scarcity-mindset": {
      id: "scarcity-mindset",
      title: "The Scarcity Mindset",
      description: "You live in constant financial anxiety. Even when you have enough, it doesn't feel like enough. Your nervous system is stuck in 'not enough' mode — and no amount of money will fix it until the pattern shifts.",
      recommendedGuides: ["anaya", "siddh", "kavya"],
      recommendedPractices: ["breath-reset", "witness", "life-alignment"],
      icon: "🔒",
    },
    "unworthy-earner": {
      id: "unworthy-earner",
      title: "The Unworthy Earner",
      description: "Deep down, you don't believe you deserve more. You self-sabotage opportunities, undercharge for your work, and feel guilty when money comes. This isn't about money — it's about worth.",
      recommendedGuides: ["meera", "tara", "arjun"],
      recommendedPractices: ["self-compassion", "forgiveness", "conscious-action"],
      icon: "😔",
    },
    "spiritual-avoider": {
      id: "spiritual-avoider",
      title: "The Spiritual Avoider",
      description: "You believe wanting money is 'unspiritual.' You've created a false choice between spirituality and abundance. But true spirituality includes the whole of life — including money.",
      recommendedGuides: ["aarav", "rishi", "kavya"],
      recommendedPractices: ["thought-watching", "deep-questioning", "life-alignment"],
      icon: "🕉️",
    },
  },
};

// ─── 4. PURPOSE & DIRECTION FINDER ───
export const PURPOSE_DIRECTION_QUESTIONNAIRE: Questionnaire = {
  id: "purpose-direction",
  title: "Purpose & Direction Finder",
  titleHi: "उद्देश्य और दिशा खोज",
  subtitle: "Where is your life pointing?",
  subtitleHi: "आपकी ज़िंदगी किस दिशा में जा रही है?",
  description: "25 questions that reveal whether you're aligned with your purpose — or living someone else's life.",
  questionCount: 25,
  timeEstimate: "6 min",
  questions: [
    {
      id: "pd-1",
      text: "When you wake up on a free day, you feel:",
      textHi: "जब छुट्टी के दिन उठते हैं, कैसा महसूस करते हैं:",
      options: [
        { value: "excited", label: "Excited — so many things I want to do", labelHi: "excited — बहुत कुछ करना है", scores: { aligned: 3, lost: 0, numb: 0, anxious: 0 } },
        { value: "lost", label: "Lost — don't know what to do with free time", labelHi: "lost — पता नहीं free time में क्या करूं", scores: { aligned: 0, lost: 3, numb: 0, anxious: 0 } },
        { value: "numb", label: "Nothing — just scroll and sleep", labelHi: "कुछ नहीं — बस scroll और sleep", scores: { aligned: 0, lost: 0, numb: 3, anxious: 0 } },
        { value: "anxious", label: "Anxious — guilt for not being productive", labelHi: "चिंतित — productive नहीं होने का guilt", scores: { aligned: 0, lost: 0, numb: 0, anxious: 3 } },
      ],
    },
    {
      id: "pd-2",
      text: "If money wasn't a factor, you would:",
      textHi: "अगर पैसा factor न होता, आप क्या करते:",
      options: [
        { value: "know", label: "Know exactly what I'd do", labelHi: "बिल्कुल पता है क्या करता", scores: { aligned: 3, lost: 0, numb: 0, anxious: 0 } },
        { value: "blank", label: "Have no idea — honestly", labelHi: "कोई idea नहीं — honestly", scores: { aligned: 0, lost: 3, numb: 0, anxious: 0 } },
        { value: "nothing", label: "Probably nothing — just rest forever", labelHi: "शायद कुछ नहीं — बस हमेशा rest करता", scores: { aligned: 0, lost: 0, numb: 3, anxious: 0 } },
        { value: "guilty", label: "Feel guilty for not knowing", labelHi: "न पता होने पर guilty महसूस होता", scores: { aligned: 0, lost: 0, numb: 0, anxious: 3 } },
      ],
    },
    {
      id: "pd-3",
      text: "Your current work/career feels:",
      textHi: "आपका current work/career कैसा लगता है:",
      options: [
        { value: "calling", label: "Like a calling — this is what I'm meant to do", labelHi: "calling की तरह — यही करना है मुझे", scores: { aligned: 3, trapped: 0, numb: 0, resentful: 0 } },
        { value: "trapped", label: "Like a trap — I need to escape but can't", labelHi: "trap की तरह — भागना है लेकिन नहीं सकता", scores: { aligned: 0, trapped: 3, numb: 0, resentful: 0 } },
        { value: "numb", label: "Like nothing — just going through motions", labelHi: "कुछ नहीं — बस motions follow कर रहा हूं", scores: { aligned: 0, trapped: 0, numb: 3, resentful: 0 } },
        { value: "resentful", label: "Like a burden — someone else's dream", labelHi: "burden की तरह — किसी और का सपना", scores: { aligned: 0, trapped: 0, numb: 0, resentful: 3 } },
      ],
    },
  ],
  results: {
    "aligned-living": {
      id: "aligned-living",
      title: "Aligned Living",
      description: "You're doing what feels meaningful. Your days have direction. This is rare and precious. Your challenge is to deepen — not just maintain — this alignment.",
      recommendedGuides: ["kavya", "arjun", "siddh"],
      recommendedPractices: ["life-alignment", "conscious-action", "witness"],
      icon: "🎯",
    },
    "lost-seeker": {
      id: "lost-seeker",
      title: "The Lost Seeker",
      description: "You don't know what you want — and that's honest. Most people pretend they know. You don't. That honesty is the beginning of real seeking.",
      recommendedGuides: ["rishi", "aarav", "siddh"],
      recommendedPractices: ["deep-questioning", "open-awareness", "witness"],
      icon: "🔍",
    },
    "trapped-soul": {
      id: "trapped-soul",
      title: "The Trapped Soul",
      description: "You know what you want but feel stuck. Fear, responsibility, or guilt keeps you in a life that isn't yours. The prison door is unlocked — you just haven't tried pushing it.",
      recommendedGuides: ["arjun", "veer", "tara"],
      recommendedPractices: ["conscious-action", "discipline", "boundary-setting"],
      icon: "🔗",
    },
    "numb-drifter": {
      id: "numb-drifter",
      title: "The Numb Drifter",
      description: "You've disconnected from desire itself. It's safer to want nothing than to want and be disappointed. But numbness isn't peace — it's frozen feeling.",
      recommendedGuides: ["tara", "siddh", "meera"],
      recommendedPractices: ["safe-space", "body-awareness", "emotional-release"],
      icon: "🌫️",
    },
  },
};

// ─── 5. INNER CHILD ASSESSMENT ───
export const INNER_CHILD_QUESTIONNAIRE: Questionnaire = {
  id: "inner-child",
  title: "Inner Child State",
  titleHi: "आंतरिक बच्चे की स्थिति",
  subtitle: "How old are you inside?",
  subtitleHi: "अंदर से आप कितने साल के हैं?",
  description: "20 questions that reveal the age and state of your inner child — and what they need from you.",
  questionCount: 20,
  timeEstimate: "5 min",
  questions: [
    {
      id: "ic-1",
      text: "When you make a mistake, your inner voice says:",
      textHi: "जब आप गलती करते हैं, आपकी inner voice क्या कहती है:",
      options: [
        { value: "kind", label: "It's okay — everyone makes mistakes", labelHi: "कोई बात नहीं — सबसे गलती होती है", scores: { nurtured: 3, abandoned: 0, criticized: 0, parentified: 0 } },
        { value: "alone", label: "No one's there — I handle it alone", labelHi: "कोई नहीं है — अकेले handle करता हूं", scores: { nurtured: 0, abandoned: 3, criticized: 0, parentified: 0 } },
        { value: "harsh", label: "You're so stupid — how could you?", labelHi: "तुम इतने stupid हो — ये कैसे कर दिया?", scores: { nurtured: 0, abandoned: 0, criticized: 3, parentified: 0 } },
        { value: "responsible", label: "Fix it. Now. Don't burden anyone else.", labelHi: "ठीक करो। अभी। किसी और को burden मत दो।", scores: { nurtured: 0, abandoned: 0, criticized: 0, parentified: 3 } },
      ],
    },
    {
      id: "ic-2",
      text: "When you feel sad as an adult, you:",
      textHi: "जब adult होकर उदास महसूस करते हैं, आप:",
      options: [
        { value: "comfort", label: "Comfort myself like I would a child", labelHi: "खुद को comfort करता हूं जैसे बच्चे को करता", scores: { nurtured: 3, abandoned: 0, criticized: 0, parentified: 0 } },
        { value: "ignore", label: "Ignore it — feelings don't help anything", labelHi: "ignore करता हूं — feelings से कुछ help नहीं होता", scores: { nurtured: 0, abandoned: 3, criticized: 0, parentified: 0 } },
        { value: "ashamed", label: "Feel ashamed for having feelings", labelHi: "feelings आने पर शर्मिंदा महसूस करता हूं", scores: { nurtured: 0, abandoned: 0, criticized: 3, parentified: 0 } },
        { value: "caretaker", label: "Make sure no one else notices", labelHi: "सुनिश्चित करता हूं कि किसी को पता न चले", scores: { nurtured: 0, abandoned: 0, criticized: 0, parentified: 3 } },
      ],
    },
    {
      id: "ic-3",
      text: "As a child, you learned that:",
      textHi: "बचपन में आपने क्या सीखा:",
      options: [
        { value: "safe", label: "It's safe to be myself", labelHi: "खुद होना safe है", scores: { nurtured: 3, abandoned: 0, criticized: 0, parentified: 0 } },
        { value: "alone", label: "No one will come — I'm on my own", labelHi: "कोई नहीं आएगा — मैं अकेला हूं", scores: { nurtured: 0, abandoned: 3, criticized: 0, parentified: 0 } },
        { value: "wrong", label: "Something is wrong with me", labelHi: "मुझमें कुछ गड़बड़ है", scores: { nurtured: 0, abandoned: 0, criticized: 3, parentified: 0 } },
        { value: "responsible", label: "I need to take care of others before myself", labelHi: "मुझे खुद से पहले दूसरों का ख्याल रखना है", scores: { nurtured: 0, abandoned: 0, criticized: 0, parentified: 3 } },
      ],
    },
  ],
  results: {
    "nurtured-child": {
      id: "nurtured-child",
      title: "The Nurtured Child",
      description: "Your inner child feels safe and loved. You treat yourself with kindness. This usually means you had at least one safe adult in childhood. Your challenge is to stay connected to this warmth when life gets hard.",
      recommendedGuides: ["meera", "kavya", "siddh"],
      recommendedPractices: ["gratitude", "self-compassion", "witness"],
      icon: "🧒",
    },
    "abandoned-child": {
      id: "abandoned-child",
      title: "The Abandoned Child",
      description: "Your inner child learned early: no one is coming. You became fiercely independent because depending felt dangerous. But independence has become isolation.",
      recommendedGuides: ["tara", "meera", "siddh"],
      recommendedPractices: ["inner-child", "safe-space", "forgiveness"],
      icon: "👶",
    },
    "criticized-child": {
      id: "criticized-child",
      title: "The Criticized Child",
      description: "Your inner voice is your childhood critic — internalized. You judge yourself before anyone else can. You've become your own worst parent.",
      recommendedGuides: ["tara", "meera", "aarav"],
      recommendedPractices: ["self-compassion", "inner-child", "forgiveness"],
      icon: "😢",
    },
    "parentified-child": {
      id: "parentified-child",
      title: "The Parentified Child",
      description: "You became the adult in the room before you were ready. You took care of others' emotions while your own went unnoticed. Now you can't ask for help — because you were never allowed to need it.",
      recommendedGuides: ["tara", "meera", "anaya"],
      recommendedPractices: ["inner-child", "vulnerability", "boundary-setting"],
      icon: "🧑‍🍼",
    },
  },
};

// ─── 6. CREATIVE FLOW ASSESSMENT ───
export const CREATIVE_FLOW_QUESTIONNAIRE: Questionnaire = {
  id: "creative-flow",
  title: "Creative Flow State",
  titleHi: "रचनात्मक प्रवाह स्थिति",
  subtitle: "Where is your creativity blocked or flowing?",
  subtitleHi: "आपकी creativity कहाँ blocked है और कहाँ flow कर रही है?",
  description: "20 questions mapping your creative energy, flow access, and artistic expression.",
  questionCount: 20,
  timeEstimate: "5 min",
  questions: [
    {
      id: "cf-1",
      text: "When you're deeply engaged in something you love, time:",
      textHi: "जब आप किसी पसंदीदा काम में गहरे डूबे हों, समय:",
      options: [
        { value: "disappears", label: "Disappears — hours feel like minutes", labelHi: "गायब हो जाता है — घंटे मिनट जैसे लगते हैं", scores: { flowing: 3, blocked: 0, scattered: 0, fearful: 0 } },
        { value: "drags", label: "Drags — I'm forcing myself", labelHi: "खिंचता है — मैं खुद को force कर रहा हूं", scores: { flowing: 0, blocked: 3, scattered: 0, fearful: 0 } },
        { value: "jumps", label: "Jumps — I start many things, finish none", labelHi: "कूदता है — बहुत कुछ शुरू करता हूं, कुछ खत्म नहीं", scores: { flowing: 0, blocked: 0, scattered: 3, fearful: 0 } },
        { value: "judged", label: "I'm worried about whether it's good enough", labelHi: "चिंता — क्या ये काफी अच्छा है?", scores: { flowing: 0, blocked: 0, scattered: 0, fearful: 3 } },
      ],
    },
    {
      id: "cf-2",
      text: "Your creative blocks usually come from:",
      textHi: "आपके creative blocks आमतौर पर कहाँ से आते हैं:",
      options: [
        { value: "none", label: "I rarely feel blocked", labelHi: "मुझे शायद ही कभी block महसूस हो", scores: { flowing: 3, blocked: 0, scattered: 0, fearful: 0 } },
        { value: "empty", label: "Emptiness — nothing comes out", labelHi: "खालीपन — कुछ नहीं निकलता", scores: { flowing: 0, blocked: 3, scattered: 0, fearful: 0 } },
        { value: "distracted", label: "Distraction — too many tabs open", labelHi: "distraction — बहुत सारे tabs खुले हैं", scores: { flowing: 0, blocked: 0, scattered: 3, fearful: 0 } },
        { value: "perfection", label: "Perfectionism — nothing is good enough", labelHi: "perfectionism — कुछ भी काफी अच्छा नहीं लगता", scores: { flowing: 0, blocked: 0, scattered: 0, fearful: 3 } },
      ],
    },
  ],
  results: {
    "flowing-creator": {
      id: "flowing-creator",
      title: "The Flowing Creator",
      description: "Creativity flows through you naturally. You enter flow states easily. Your challenge is not finding creativity — it's channeling it without burning out.",
      recommendedGuides: ["leela", "veer", "kavya"],
      recommendedPractices: ["playfulness", "discipline", "life-alignment"],
      icon: "🎨",
    },
    "blocked-creator": {
      id: "blocked-creator",
      title: "The Blocked Creator",
      description: "Something is stuck. You feel the urge to create but nothing comes. This isn't a talent issue — it's an energy block. Your creative channel is clogged with old emotions.",
      recommendedGuides: ["tara", "veer", "anaya"],
      recommendedPractices: ["emotional-release", "energy-activation", "inner-child"],
      icon: "🧱",
    },
    "scattered-creator": {
      id: "scattered-creator",
      title: "The Scattered Creator",
      description: "You start everything and finish nothing. Your creativity is real but undisciplined. You have 100 half-finished projects and zero completed ones.",
      recommendedGuides: ["kavya", "arjun", "veer"],
      recommendedPractices: ["discipline", "conscious-action", "focus-sprints"],
      icon: "🌀",
    },
    "fearful-creator": {
      id: "fearful-creator",
      title: "The Fearful Creator",
      description: "You create — but only in secret. You're terrified of being seen. Perfectionism is your excuse for never finishing. But the real fear is: what if I show up and they don't like it?",
      recommendedGuides: ["meera", "tara", "aarav"],
      recommendedPractices: ["self-compassion", "vulnerability", "witness"],
      icon: "😰",
    },
  },
};

// ─── ALL QUESTIONNAIRES ───
export const ALL_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: "energy-body",
    title: "Energy Body Assessment",
    titleHi: "ऊर्जा शरीर मूल्यांकन",
    subtitle: "Map your mind-body-energy pattern",
    subtitleHi: "अपने मन-शरीर-ऊर्जा पैटर्न को जानें",
    description: "50 questions that reveal whether you lead with head, heart, or gut — and where your energy is blocked or flowing.",
    questionCount: 50,
    timeEstimate: "10 min",
    questions: [
      {
        id: "eb-1",
        text: "When you face a difficult decision, what do you trust first?",
        textHi: "जब आपको मुश्किल फैसला लेना हो, सबसे पहले किस पर भरोसा करते हैं?",
        options: [
          { value: "logic", label: "I analyze all the options", labelHi: "सभी विकल्पों का विश्लेषण करता हूं", scores: { head: 3, heart: 0, gut: 0 } },
          { value: "feeling", label: "I go with what feels right", labelHi: "जो सही लगता है उसी के साथ जाता हूं", scores: { head: 0, heart: 3, gut: 0 } },
          { value: "instinct", label: "I have a gut feeling and follow it", labelHi: "अंतर्ज्ञान आता है और उसी को फॉलो करता हूं", scores: { head: 0, heart: 0, gut: 3 } },
          { value: "confused", label: "I get stuck and can't decide", labelHi: "फंस जाता हूं, फैसला नहीं हो पाता", scores: { head: 1, heart: 1, gut: 1 } },
        ],
      },
      {
        id: "eb-2",
        text: "Where do you feel stress in your body?",
        textHi: "तनाव शरीर में कहाँ महसूस होता है?",
        options: [
          { value: "head", label: "Head — headaches, overthinking", labelHi: "सिर — सिरदर्द, ज़्यादा सोचना", scores: { head: 3, heart: 0, gut: 0 } },
          { value: "chest", label: "Chest — tightness, heaviness", labelHi: "छाती — कसाव, भारीपन", scores: { head: 0, heart: 3, gut: 0 } },
          { value: "stomach", label: "Stomach — knots, nausea", labelHi: "पेट — ऐंठन, मतली", scores: { head: 0, heart: 0, gut: 3 } },
          { value: "everywhere", label: "Everywhere — whole body tenses", labelHi: "सभी जगह — पूरा शरीर tense हो जाता है", scores: { head: 1, heart: 1, gut: 1 } },
        ],
      },
      {
        id: "eb-3",
        text: "When someone criticizes you, your first reaction is:",
        textHi: "जब कोई आपकी आलोचना करे, आपकी पहली प्रतिक्रिया क्या होती है?",
        options: [
          { value: "defend", label: "I defend myself with logic", labelHi: "तर्क से खुद को defend करता हूं", scores: { head: 3, heart: 0, gut: 0 } },
          { value: "hurt", label: "I feel hurt and withdraw", labelHi: "दिल दुखता है और अलग हो जाता हूं", scores: { head: 0, heart: 3, gut: 0 } },
          { value: "angry", label: "I get angry immediately", labelHi: "तुरंत गुस्सा आ जाता है", scores: { head: 0, heart: 0, gut: 3 } },
          { value: "freeze", label: "I freeze and can't respond", labelHi: "फ्रीज़ हो जाता हूं, कुछ बोल नहीं पाता", scores: { head: 1, heart: 1, gut: 1 } },
        ],
      },
      {
        id: "eb-4",
        text: "Your mind is usually:",
        textHi: "आपका मन ज़्यादातर कैसा रहता है?",
        options: [
          { value: "busy", label: "Busy — always thinking, planning", labelHi: "व्यस्त — हमेशा सोचना, प्लान बनाना", scores: { head: 3, heart: 0, gut: 0 } },
          { value: "emotional", label: "Emotional — feeling things deeply", labelHi: "भावुक — चीज़ों को गहराई से महसूस करना", scores: { head: 0, heart: 3, gut: 0 } },
          { value: "restless", label: "Restless — can't sit still", labelHi: "बेचैन — एक जगह बैठ नहीं सकता", scores: { head: 0, heart: 0, gut: 3 } },
          { value: "numb", label: "Numb — disconnected from everything", labelHi: "सुन्न — सब कुछ से कटा हुआ", scores: { head: 1, heart: 1, gut: 1 } },
        ],
      },
      {
        id: "eb-5",
        text: "When you meet someone new, you first notice:",
        textHi: "जब किसी नए इंसान से मिलते हैं, सबसे पहले क्या notice करते हैं?",
        options: [
          { value: "words", label: "Their words and intelligence", labelHi: "उनके शब्द और समझदारी", scores: { head: 3, heart: 0, gut: 0 } },
          { value: "vibe", label: "Their warmth and energy", labelHi: "उनकी गर्माहट और ऊर्जा", scores: { head: 0, heart: 3, gut: 0 } },
          { value: "danger", label: "Whether they feel safe or threatening", labelHi: "वे सुरक्षित लगते हैं या खतरनाक", scores: { head: 0, heart: 0, gut: 3 } },
          { value: "nothing", label: "I don't really notice anything specific", labelHi: "मैं कुछ खास notice नहीं करता", scores: { head: 1, heart: 1, gut: 1 } },
        ],
      },
    ],
    results: {
      "head-dominant": {
        id: "head-dominant",
        title: "The Thinker",
        description: "You lead with your head. Your mind is always running — analyzing, planning, questioning. This is your superpower AND your trap.",
        recommendedGuides: ["aarav", "rishi", "siddh"],
        recommendedPractices: ["thought-watching", "body-scan", "silent-sitting"],
        icon: "🧠",
      },
      "heart-dominant": {
        id: "heart-dominant",
        title: "The Feeler",
        description: "You lead with your heart. You feel everything deeply. Your empathy is extraordinary but you absorb others' emotions.",
        recommendedGuides: ["meera", "tara", "leela"],
        recommendedPractices: ["loving-kindness", "emotional-release", "heart-breathing"],
        icon: "❤️",
      },
      "gut-dominant": {
        id: "gut-dominant",
        title: "The Instinctive",
        description: "You lead with your gut. You know things before you can explain them. Your instincts are sharp but you react before thinking.",
        recommendedGuides: ["veer", "arjun", "anaya"],
        recommendedPractices: ["breath-of-fire", "kriya", "nervous-system-calm"],
        icon: "🫁",
      },
      "balanced": {
        id: "balanced",
        title: "The Balanced",
        description: "You have relatively balanced energy. Your challenge is that when all three are active, it can feel like inner conflict.",
        recommendedGuides: ["kavya", "siddh", "aarav"],
        recommendedPractices: ["witness", "open-awareness", "integration"],
        icon: "⚖️",
      },
      "blocked": {
        id: "blocked",
        title: "The Blocked",
        description: "Your energy is blocked everywhere. You feel numb, disconnected. This isn't your nature — it's a protective response.",
        recommendedGuides: ["tara", "siddh", "anaya"],
        recommendedPractices: ["safe-space", "gentle-breath", "body-awareness"],
        icon: "🔒",
      },
    },
  },
  SLEEP_DREAMS_QUESTIONNAIRE,
  RELATIONSHIP_PATTERN_QUESTIONNAIRE,
  MONEY_ABUNDANCE_QUESTIONNAIRE,
  PURPOSE_DIRECTION_QUESTIONNAIRE,
  INNER_CHILD_QUESTIONNAIRE,
  CREATIVE_FLOW_QUESTIONNAIRE,
];

export default ALL_QUESTIONNAIRES;
