import type { CourseDayCurriculum } from '../types';

// ═══════════════════════════════════════════════════════════
// PHASE 5: LOOPS & SAMSKARAS (Days 61-75)
// Chitta Vritti, Gunas, Karma, Shadow Work, Pattern Dissolution
// Masters: Patanjali, Krishna (Gita), Jung, Viktor Frankl
// ═══════════════════════════════════════════════════════════

export const patternDays: CourseDayCurriculum[] = [
  {
    day: 61, phase: 'patterns', title: 'What is a Loop?', subtitle: 'The invisible programs running your life',
    morningTeaching: {
      type: 'concept', concept: 'Unconscious Loops',
      keyPoints: [
        'A loop is an automatic behavior pattern: Trigger → Reaction → Temporary Relief → Same Trigger returns',
        'Patanjali called these "Samskaras" — grooves carved into consciousness by repeated action',
        'You are not broken — you are programmed. Every loop served a purpose once.',
        'The loop runs in darkness. The moment you SEE it, its power begins to dissolve.',
        'Krishna in the Bhagavad Gita: "The senses are so strong that they carry away the mind even of a person of discrimination."',
      ],
      metaphor: 'Imagine a vinyl record with a scratch. The needle hits the scratch and repeats the same few seconds of music — forever. Your loops are scratches on the record of your psyche. You\'ve been hearing the same song for years and calling it "my personality."',
      scienceNote: 'Neuroscience: Repeated neural firing creates myelinated pathways — "neurons that fire together wire together." Loops become neurological highways that the brain defaults to because they require less energy than conscious choice.',
    },
    dayPractice: {
      type: 'loop-catch', instruction: 'Today, identify ONE loop you run regularly. It could be: reaching for your phone when bored, snapping when criticized, seeking validation after doing something well, or eating when stressed. Write down: (1) The trigger (2) The automatic behavior (3) What temporary relief it provides (4) How long before the trigger returns.',
      duration: 'Throughout the day — catch the loop at least 3 times',
      checkpoints: ['What loop did you identify?', 'How many times did it run today?', 'Were you aware DURING the loop or only after?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'How old is this loop? When did it start? Can you trace it back to the first time it "worked"?',
      deeperPrompt: 'Patanjali\'s Yoga Sutra 1.2: "Yoga is the cessation of the fluctuations of the mind (Chitta Vritti Nirodha)." Your loops ARE the fluctuations. Seeing them is the beginning of yoga.',
      closingWisdom: 'You don\'t break loops. You outgrow them — by seeing them so clearly they can no longer hide.',
    },
    dimension: 'awareness', relatedConcepts: ['loops', 'samskaras', 'chitta-vritti'],
  },
  {
    day: 62, phase: 'patterns', title: 'Chitta Vritti: The Five Fluctuations', subtitle: 'Patanjali mapped your mind 2,500 years ago',
    morningTeaching: {
      type: 'concept', concept: 'Patanjali\'s Chitta Vritti',
      keyPoints: [
        'Patanjali identified 5 types of mental fluctuations (Vrittis): Pramana (right knowledge), Viparyaya (misconception), Vikalpa (imagination/fantasy), Nidra (sleep), and Smriti (memory)',
        'EVERY thought you have falls into one of these 5 categories — no exceptions',
        'Most suffering comes from Viparyaya (seeing what isn\'t there) and Vikalpa (fantasy worlds)',
        'The vrittis are not enemies — they are instruments. The problem is when they control YOU instead of you using THEM.',
        'Yoga Sutra 1.5-6: "The vrittis are fivefold, painful and painless."',
      ],
      scienceNote: 'Modern cognitive psychology validates Patanjali: cognitive distortions (Beck), system 1 vs system 2 thinking (Kahneman), and memory reconsolidation all map onto the five vrittis with remarkable precision.',
    },
    dayPractice: {
      type: 'observation', instruction: 'For today, categorize EVERY notable thought into Patanjali\'s 5 categories: (1) Right Knowledge — is this based on direct experience? (2) Misconception — am I seeing what ISN\'T there? (3) Fantasy — am I creating imaginary scenarios? (4) Sleep/Dullness — am I checked out? (5) Memory — am I replaying the past? Tally them. Which dominates?',
      duration: 'Throughout the day — minimum 10 categorizations',
      checkpoints: ['Which vritti dominated your mind today?', 'How much of your thinking was Viparyaya (misconception)?', 'Could you catch fantasy (Vikalpa) before getting absorbed in it?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'Look at your vritti tally. What percentage of your mental activity was based on reality (Pramana) vs misconception and fantasy?',
      deeperPrompt: 'Patanjali says freedom comes not from destroying vrittis but from no longer being identified with them. Can you watch a vritti arise without becoming it?',
      closingWisdom: 'The mind has only five moves. Once you see them all, the magician loses power over you.',
    },
    dimension: 'thought', relatedConcepts: ['chitta-vritti', 'patanjali', 'yoga-sutras'],
  },
  {
    day: 63, phase: 'patterns', title: 'The Three Gunas', subtitle: 'Sattva, Rajas, Tamas — the three forces that compose all of existence',
    morningTeaching: {
      type: 'concept', concept: 'The Three Gunas',
      keyPoints: [
        'Ancient yogic science describes three fundamental forces (Gunas) that compose all matter, mind, and consciousness',
        'TAMAS: inertia, heaviness, darkness, ignorance, depression, laziness, resistance to change',
        'RAJAS: activity, passion, restlessness, desire, ambition, agitation, anxiety',
        'SATTVA: harmony, clarity, lightness, wisdom, peace, balance',
        'Every moment, one guna dominates. Your loops are sustained by Rajas (craving) and Tamas (ignorance). Awareness is Sattva.',
        'Krishna in Gita 14.5: "Sattva binds by attachment to happiness, Rajas by attachment to action, Tamas by negligence and delusion."',
      ],
      metaphor: 'Think of your inner world as weather. Tamas is fog — you can\'t see, you don\'t care, everything feels heavy. Rajas is a storm — intense energy, but destructive and exhausting. Sattva is clear sky — you see everything, the sun shines, but you don\'t cling to it because you know weather always changes.',
    },
    dayPractice: {
      type: 'observation', instruction: 'Every 2 hours today, check: which guna dominates RIGHT NOW? (1) Tamas: Do I feel heavy, lazy, resistant, numb? (2) Rajas: Do I feel restless, anxious, driven, craving? (3) Sattva: Do I feel clear, peaceful, balanced, aware? Track the shifts. Notice what triggers each state.',
      duration: '6 guna check-ins throughout the day',
      checkpoints: ['Which guna dominated most of your day?', 'What foods, activities, or interactions shifted your guna?', 'Can you feel the transition between gunas as it happens?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'If you could design tomorrow, which guna would you cultivate? What specific choices would shift you toward Sattva?',
      deeperPrompt: 'The ultimate teaching: even Sattva is a guna — even harmony is a state, not the Self. Beyond all three gunas is pure awareness, the Witness. Krishna: "When the seer knows the gunas as the sole agents, and knows That which is beyond the gunas — he attains My being."',
      closingWisdom: 'You are not the weather. You are the sky in which all weather appears.',
    },
    dimension: 'awareness', relatedConcepts: ['gunas', 'sattva', 'rajas', 'tamas', 'gita'],
  },
  {
    day: 64, phase: 'patterns', title: 'Karma: The Mechanism', subtitle: 'Not punishment. Not reward. A mirror.',
    morningTeaching: {
      type: 'concept', concept: 'Karma as Natural Law',
      keyPoints: [
        'Karma is NOT cosmic reward and punishment. It is the law of cause and effect applied to consciousness.',
        'Every action, thought, and emotion creates an impression (samskara) which creates a tendency (vasana) which creates a loop',
        'There are three types: Sanchita (accumulated), Prarabdha (currently unfolding), and Kriyamana (being created now)',
        'The only karma you can change is Kriyamana — the karma you create in THIS moment through conscious choice',
        'Krishna: "You have the right to action alone, never to its fruits. Let not the fruits of action be your motive." (Gita 2.47)',
      ],
      scienceNote: 'Epigenetics shows that trauma and behavior patterns can be passed through generations — a biological mechanism for karmic inheritance. Your ancestors\' unresolved patterns literally live in your DNA.',
    },
    dayPractice: {
      type: 'trigger-track', instruction: 'Today, for every significant action, ask: "What karma am I creating right now?" Not morally — mechanically. If I react with anger, what impression does that reinforce? If I respond with awareness, what new pattern does that create? Track 5 moments where you consciously chose to create different karma.',
      duration: '5 conscious karma-creation moments',
      checkpoints: ['How many actions today were reactions (old karma playing out)?', 'How many were conscious responses (new karma)?', 'Can you feel the difference between running a pattern and choosing freshly?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'What karma are you currently living out? Can you identify patterns in your life that repeat across different situations — the same lesson showing up in different clothing?',
      deeperPrompt: 'Karma is not about blame. It is about awareness. The moment you see the pattern, you have the power to respond differently. That is the entire mechanism of liberation.',
      closingWisdom: 'You cannot change what happened. You can only change what you do next. That is the whole of karma yoga.',
    },
    dimension: 'awareness', relatedConcepts: ['karma', 'samskaras', 'karma-yoga', 'gita'],
  },
  {
    day: 65, phase: 'patterns', title: 'The Shadow: What You Hide Runs You', subtitle: 'Jung meets Yoga — the darkness that is not dark',
    morningTeaching: {
      type: 'concept', concept: 'Shadow Psychology',
      keyPoints: [
        'Carl Jung: "Until you make the unconscious conscious, it will direct your life and you will call it fate."',
        'The Shadow is everything you\'ve rejected about yourself — rage, lust, power, vulnerability, selfishness',
        'Whatever you deny in yourself, you project onto others. "I hate arrogant people" = you have disowned your own assertiveness.',
        'In yogic terms, the Shadow is Avidya (ignorance) applied to self — refusing to see what is there',
        'Shadow work is not about becoming your shadow. It is about SEEING it, so it stops controlling you from the dark.',
      ],
      metaphor: 'Imagine a house where you\'ve locked certain family members in the basement. You pretend they don\'t exist. But they bang on the floor, shake the walls, and scream at night. Your "personality" is the house. Your Shadow is the basement. Today, you open the door.',
      scienceNote: 'Research on projection (Baumeister) confirms that qualities people deny in themselves are the ones they most readily attribute to others. Shadow projection is measurable and predictable.',
    },
    dayPractice: {
      type: 'shadow', instruction: 'Today, notice EVERY judgment you make about other people. Write down 5 judgments: "They are so ___." For each one, ask: "Where do I have this quality that I refuse to see?" This is uncomfortable. That discomfort IS the shadow being seen.',
      duration: '5 projection catches',
      checkpoints: ['What did you judge in others today?', 'Could you find even a trace of that quality in yourself?', 'How did it feel to acknowledge the shadow?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'What quality in others triggers you the most? What would happen if you accepted that quality exists in you too — not as a flaw, but as a disowned strength?',
      deeperPrompt: 'The Shadow contains not only your darkness but your gold — creativity, power, passion that was shamed into hiding. What golden quality did you bury to be acceptable?',
      closingWisdom: 'The cave you fear to enter holds the treasure you seek. — Joseph Campbell',
    },
    dimension: 'awareness', relatedConcepts: ['shadow', 'projection', 'jung', 'avidya'],
  },
  {
    day: 66, phase: 'patterns', title: 'Trigger → Reaction → Consequence', subtitle: 'The anatomy of every unconscious pattern dissected',
    morningTeaching: {
      type: 'concept', concept: 'Loop Anatomy',
      keyPoints: [
        'Every loop follows a precise sequence: CUE → CRAVING → RESPONSE → REWARD',
        'The craving is not for the behavior — it is for the state change. You don\'t crave food — you crave relief from discomfort.',
        'Viktor Frankl: "Between stimulus and response there is a space. In that space is our freedom."',
        'Your entire task is to LENGTHEN that space. One second of gap can save years of suffering.',
        'Patanjali calls this Pratipaksha Bhavana — cultivating the opposite when a destructive pattern arises.',
      ],
      scienceNote: 'Charles Duhigg\'s "habit loop" (cue-routine-reward) maps exactly onto yogic samskara theory. The basal ganglia automates repeated behaviors to save cognitive energy — which means your loops are neurologically efficient prisons.',
    },
    dayPractice: {
      type: 'trigger-track', instruction: 'Choose your STRONGEST loop (the one from Day 61). Today, dissect it in real-time: (1) What is the exact trigger/cue? (2) What craving arises — what state do you want to escape? (3) What is the automatic response? (4) What reward/relief does it provide? (5) How long before the cycle restarts? Draw this loop on paper.',
      duration: 'Every time the chosen loop activates',
      checkpoints: ['Could you identify the craving beneath the behavior?', 'What state are you trying to escape when the loop runs?', 'Did mapping the loop change how it feels to run it?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'Look at your loop diagram. If you could insert a 3-second pause between the trigger and the reaction — what would you choose instead?',
      deeperPrompt: 'Frankl survived the Holocaust and discovered that even in ultimate suffering, the gap between stimulus and response remains. If he could find it there, you can find it in your daily triggers.',
      closingWisdom: 'Freedom is not the absence of loops. Freedom is the gap within them.',
    },
    dimension: 'awareness', relatedConcepts: ['loops', 'witness-gap', 'frankl', 'habit-loop'],
  },
  {
    day: 67, phase: 'patterns', title: 'Validation & Control Loops', subtitle: 'The ego\'s two favorite disguises',
    morningTeaching: {
      type: 'concept', concept: 'Ego Loops',
      keyPoints: [
        'VALIDATION LOOPS: "I need to prove I\'m worthy." Overwork, people-pleasing, perfectionism — all are validation loops.',
        'CONTROL LOOPS: "I must control outcomes to feel safe." Micromanagement, anxiety, manipulation — all are control loops.',
        'Both stem from the same root: the ego\'s fundamental insecurity about its own existence.',
        'The Bhagavad Gita\'s entire teaching to Arjuna is about releasing attachment to outcomes while acting with full commitment.',
        'Krishna: "Perform your duty equipoised, abandoning all attachment to success or failure." (2.48)',
      ],
    },
    dayPractice: {
      type: 'loop-catch', instruction: 'Today, catch yourself seeking validation or trying to control outcomes. For VALIDATION: notice every time you check for approval, fish for compliments, or adjust behavior to be liked. For CONTROL: notice every time you feel anxious about uncertainty or try to manage someone else\'s choices. Tally both.',
      duration: 'Throughout the day',
      checkpoints: ['How many validation-seeking moments did you catch?', 'How many attempts to control what\'s not controllable?', 'What would you DO if you didn\'t need validation or control?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'Which loop runs stronger in you — validation or control? What childhood experience installed it?',
      deeperPrompt: 'What if your worth is not earned through performance? What if safety comes not from control but from presence? What would that change?',
      closingWisdom: 'The need for approval is the need to exist through others\' eyes. You already exist. You don\'t need permission.',
    },
    dimension: 'awareness', relatedConcepts: ['validation-loops', 'control-loops', 'ego', 'gita'],
  },
  {
    day: 68, phase: 'patterns', title: 'Avoidance & Survival Loops', subtitle: 'What you refuse to feel runs your life from the shadows',
    morningTeaching: {
      type: 'concept', concept: 'Avoidance Patterns',
      keyPoints: [
        'AVOIDANCE LOOPS: numbing, distraction, procrastination, substance use, scrolling — all exist to avoid FEELING something.',
        'SURVIVAL LOOPS: fight (aggression), flight (withdrawal), freeze (shutdown), fawn (people-please) — the nervous system\'s four fear responses.',
        'Your "personality" is largely your dominant survival strategy. "I\'m a people pleaser" = fawn. "I\'m independent" = flight.',
        'These were brilliant adaptations in childhood. In adulthood, they are prison walls you built yourself.',
        'The body keeps running the survival loop even when the original threat is 20 years gone.',
      ],
      scienceNote: 'Peter Levine\'s Somatic Experiencing shows that trauma creates "incomplete survival responses" — the body literally froze mid-action. Loops are the body trying to complete that action, over and over.',
    },
    dayPractice: {
      type: 'loop-catch', instruction: 'Today, catch every avoidance behavior: phone checking, snacking when not hungry, zoning out, keeping busy to avoid stillness. For each one, STOP. Ask: "What am I avoiding feeling right now?" Stay with the feeling for 60 seconds. Watch what happens to the avoidance urge.',
      duration: 'Every avoidance behavior',
      checkpoints: ['What did you discover you were avoiding?', 'What feeling was underneath the avoidance?', 'What is your dominant survival response: fight, flight, freeze, or fawn?'],
    },
    eveningIntegration: {
      type: 'body-release', prompt: 'Tonight, instead of any screen or distraction, sit with 5 minutes of silence. No music, no meditation app, no guidance. Just you and whatever arises. Watch what your mind does.',
      deeperPrompt: 'The thing you avoid most persistently is the door you most need to open. What have you been running from? What would happen if you stopped?',
      closingWisdom: 'Avoidance is the most expensive habit you have. Its price is your life, unlived.',
    },
    dimension: 'awareness', relatedConcepts: ['avoidance-loops', 'survival-loops', 'trauma', 'somatic'],
  },
  {
    day: 69, phase: 'patterns', title: 'Samskaras: The Ancient Grooves', subtitle: 'Your patterns didn\'t start with you',
    morningTeaching: {
      type: 'concept', concept: 'Samskaras — Deep Conditioning',
      keyPoints: [
        'Samskara literally means "impression" — like a groove worn into wood by water flowing the same path',
        'Some samskaras are personal (childhood conditioning). Some are collective (cultural programming). Some, the yogis say, are ancestral.',
        'Patanjali (Yoga Sutra 4.9): "Samskaras have no beginning in time — because the desire for life is eternal."',
        'Epigenetics validates this: trauma patterns are literally passed through DNA for at least 3 generations.',
        'Samskaras are not bad. They are the mechanism by which learning is preserved. But unexamined samskaras become prisons.',
        'Dissolution doesn\'t happen through force but through VIVEKA (discrimination) — seeing clearly what is pattern and what is reality.',
      ],
      metaphor: 'A river flowing through rock carves a canyon over millions of years. Your samskaras are canyons carved into consciousness. The water (awareness) can now only flow in these channels. But awareness itself is not the canyon — it is the water.',
    },
    dayPractice: {
      type: 'journaling', instruction: 'Write about your TOP 3 samskaras — patterns so deep they feel like "who I am." For each: (1) Name the pattern. (2) How far back can you trace it? (3) Did a parent or grandparent have this same pattern? (4) If this pattern dissolved tomorrow, who would you be?',
      duration: '20 minutes journaling',
      checkpoints: ['Which samskara is oldest?', 'Could you trace any to ancestral patterns?', 'What would remain if your deepest conditioning dissolved?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'The yogic teaching: you are not your samskaras. They run THROUGH you, but they are not you. Can you feel the difference between the pattern and the awareness watching the pattern?',
      deeperPrompt: 'If samskaras have "no beginning in time" — who installed them? And who has the power to dissolve them? Only the same awareness that witnessed their creation.',
      closingWisdom: 'You are not the groove. You are the awareness in which grooves form and dissolve.',
    },
    dimension: 'awareness', relatedConcepts: ['samskaras', 'vasanas', 'epigenetics', 'patanjali'],
  },
  {
    day: 70, phase: 'patterns', title: 'Relationship Loops', subtitle: 'The same dynamic, different faces — the mirror of relationship',
    morningTeaching: {
      type: 'concept', concept: 'Relational Patterns',
      keyPoints: [
        'You attract the same relationship dynamics repeatedly because relationships are mirrors of your internal patterns',
        'The person who triggers you most is your greatest teacher — they activate your deepest samskaras',
        'Codependency, abandonment fear, intimacy avoidance, power struggles — all are loops, not love',
        'Krishna and Arjuna\'s relationship in the Gita is the archetype: the Higher Self guiding the confused ego through its patterns',
        'Neem Karoli Baba: "Don\'t throw anyone out of your heart." Even the ones who trigger you are serving your growth.',
      ],
    },
    dayPractice: {
      type: 'mirror', instruction: 'Think of the person who triggers you most. Today, instead of reacting to them, treat every interaction as a MIRROR: What are they showing me about my own unresolved pattern? What button are they pressing — and who installed that button?',
      duration: 'Throughout the day — especially in difficult interactions',
      checkpoints: ['Who triggered you today? What was the mirror showing?', 'Do you see the same relational dynamic repeating across different relationships?', 'What would the relationship look like if you responded from awareness instead of your loop?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'What is your dominant relationship pattern? Pursuer or withdrawer? Caretaker or dependent? Controller or rebel? Where did you learn this dance?',
      deeperPrompt: 'Rumi: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it." What barriers have you built?',
      closingWisdom: 'Every relationship is a mirror. Clean the mirror, and what you see changes.',
    },
    dimension: 'awareness', relatedConcepts: ['relationship-loops', 'projection', 'mirror', 'neem-karoli-baba'],
  },
  {
    day: 71, phase: 'patterns', title: 'The Loop You Love', subtitle: 'Why you protect the pattern that hurts you most',
    morningTeaching: {
      type: 'concept', concept: 'Secondary Gains',
      keyPoints: [
        'Every loop you maintain provides a hidden benefit — a "secondary gain" — that you don\'t want to give up',
        'The victim loop provides attention and sympathy. The busyness loop provides identity. The worry loop provides the illusion of control.',
        'You fight your patterns publicly while secretly feeding them privately',
        'This is what yogis call "MAYA" — the illusion that is so comfortable you choose it over truth',
        'Shiva as Nataraja dances on the dwarf of ignorance — YOUR ignorance about your own attachment to suffering.',
      ],
    },
    dayPractice: {
      type: 'journaling', instruction: 'Pick your most persistent loop — the one you keep "trying" to break. Now answer HONESTLY: What does this loop give you? What would you LOSE if it dissolved? Identity? Sympathy? An excuse? A sense of control? Write the uncomfortable truth.',
      duration: '15 minutes of radical honesty',
      checkpoints: ['What is the secret benefit of your most persistent loop?', 'Are you actually trying to dissolve it, or just performing the attempt?', 'What identity would you lose if this pattern dissolved?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'The hardest truth in consciousness work: you keep what you want to keep. If the pattern is still there, some part of you is choosing it. Can you meet that part with compassion instead of judgment?',
      deeperPrompt: 'Maya is not deception by an external force. Maya is self-deception by choice — because truth would require you to change, and change feels like death to the ego.',
      closingWisdom: 'The chains you love are the hardest to break — because you hold the key and refuse to use it.',
    },
    dimension: 'awareness', relatedConcepts: ['secondary-gains', 'maya', 'ego-attachment', 'shiva'],
  },
  {
    day: 72, phase: 'patterns', title: 'Shadow Integration: The Golden Shadow', subtitle: 'Your greatness is hiding in the same place as your darkness',
    morningTeaching: {
      type: 'concept', concept: 'Golden Shadow & Integration',
      keyPoints: [
        'Jung\'s Golden Shadow: you suppress not only your darkness but also your light — your power, creativity, brilliance',
        'If you were shamed for being "too much," your aliveness became shadow. If praised only for compliance, your rebellion became shadow.',
        'Yogic parallel: Brahma (creation) is always active, even when suppressed. Your creative power doesn\'t die — it festers.',
        'Shadow integration is not about "fixing" — it is about welcoming ALL parts back into wholeness',
        'Sadhguru: "If you handle your mind properly, every experience can become a stepping stone, not a stumbling block."',
      ],
    },
    dayPractice: {
      type: 'shadow', instruction: 'Today, identify your GOLDEN shadow — the positive qualities you suppress: leadership, creativity, sensuality, power, vulnerability. Ask: "What would I do today if I weren\'t afraid of being too much?" Do ONE thing that your suppressed brilliance wants to do.',
      duration: 'One act of golden shadow reclamation',
      checkpoints: ['What positive quality do you suppress?', 'What did you do today from your golden shadow?', 'How did it feel to let that quality out?'],
    },
    eveningIntegration: {
      type: 'integration', prompt: 'The yogis teach that Vishnu preserves what Brahma creates and Shiva destroys. Your shadow work is all three: creating awareness, preserving insight, and destroying illusion. Which phase are you in right now?',
      deeperPrompt: 'When both the dark shadow and the golden shadow are integrated, what remains is not good or bad — it is WHOLE. And wholeness is what the word "yoga" actually means: union.',
      closingWisdom: 'Your shadow doesn\'t want to be fixed. It wants to be found.',
    },
    dimension: 'awareness', relatedConcepts: ['shadow', 'golden-shadow', 'jung', 'trimurti', 'wholeness'],
  },
  {
    day: 73, phase: 'patterns', title: 'Loop Dissolution: The Witness Method', subtitle: 'Not fighting patterns — dissolving them with the light of awareness',
    morningTeaching: {
      type: 'concept', concept: 'Dissolution Through Awareness',
      keyPoints: [
        'You cannot fight a loop. Fighting IS a loop. Resistance IS the loop recognizing itself and creating more.',
        'The yogic method: SAKSHI BHAVA — the attitude of pure witnessing. Watch the loop without engagement.',
        'Ramana Maharshi: "The moment you try to stop the mind, you have given it reality. Simply ignore it."',
        'Neem Karoli Baba dissolved patterns not through analysis but through LOVE — unconditional acceptance of what is.',
        'The loop needs your participation (identification) to survive. When you withdraw identification, it runs once more from momentum, then dies.',
      ],
    },
    dayPractice: {
      type: 'witness', instruction: 'Today, when ANY loop activates (craving, reaction, avoidance), practice the Witness Method: (1) NOTICE: "A loop is running." (2) NAME: "This is the [validation/control/avoidance] loop." (3) NEITHER: neither act on it nor suppress it. (4) WATCH: observe it like weather passing through. Time how long it lasts without your participation.',
      duration: 'Every loop activation',
      checkpoints: ['Could you witness the loop without engaging?', 'How long did the loop run when you didn\'t feed it?', 'What happened in your body when you refused to participate in the loop?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'Dissolution is not dramatic. It is quiet. A loop simply stops being interesting when you see it completely. Did any loop lose some of its charge today?',
      deeperPrompt: 'Neem Karoli Baba was asked how to dissolve anger. He said: "Love everyone, serve everyone, remember God." The simplest teachings dissolve the most complex patterns.',
      closingWisdom: 'You don\'t destroy the darkness. You turn on the light. The darkness was never real.',
    },
    dimension: 'awareness', relatedConcepts: ['sakshi-bhava', 'witness', 'loop-dissolution', 'ramana', 'neem-karoli-baba'],
  },
  {
    day: 74, phase: 'patterns', title: 'From Loop to Choice', subtitle: 'The moment reaction becomes response — this is liberation',
    morningTeaching: {
      type: 'concept', concept: 'Conscious Choice',
      keyPoints: [
        'Viktor Frankl survived Auschwitz and discovered: "The last of the human freedoms — to choose one\'s attitude in any given set of circumstances."',
        'A loop is reaction. A response is choice. The difference is ONE SECOND of awareness.',
        'Patanjali\'s Pratipaksha Bhavana (Yoga Sutra 2.33): When disturbed by negative thoughts, cultivate the opposite.',
        'This is not positive thinking. It is conscious CHOOSING — from awareness, not from suppression.',
        'Krishna to Arjuna: "Arise! Stand up and fight!" — not fighting others, but fighting unconsciousness itself.',
      ],
      scienceNote: 'Neuroplasticity research confirms: every time you choose a new response instead of the old reaction, you literally rewire the brain. The old pathway weakens and the new one strengthens. Freedom is neurological.',
    },
    dayPractice: {
      type: 'trigger-track', instruction: 'Today, attempt CONSCIOUS PATTERN INTERRUPTION. Choose one loop. When it triggers: (1) Feel the pull. (2) Take 3 breaths. (3) Choose a DIFFERENT response — any response that is not the automatic one. Walk instead of scroll. Breathe instead of snap. Sit instead of avoid. One conscious choice, repeated.',
      duration: 'Every time the chosen loop triggers',
      checkpoints: ['How many times could you successfully interrupt the pattern?', 'What new response did you choose?', 'How did it feel to respond instead of react?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'Frankl\'s gap is real. You felt it today. Every time you paused between trigger and response, you were FREE — even if only for a second. How does freedom feel?',
      deeperPrompt: 'If you could respond with awareness to EVERY trigger for one full day — who would you be? That person is not a goal. That person is who you already are, underneath the loops.',
      closingWisdom: 'You don\'t become free. You discover you always were. The loops were never you.',
    },
    dimension: 'awareness', relatedConcepts: ['frankl', 'conscious-choice', 'pratipaksha-bhavana', 'neuroplasticity'],
  },
  {
    day: 75, phase: 'patterns', title: 'Patterns Phase Complete', subtitle: 'You see the machinery — now you question the operator',
    morningTeaching: {
      type: 'review', concept: 'Phase 5 Integration',
      keyPoints: [
        'In 15 days you have mapped your inner machinery: Chitta Vritti, Gunas, Karma, Shadow, Samskaras, Loops',
        'You now carry Patanjali\'s framework (vrittis, samskaras), Krishna\'s teaching (gunas, karma), Jung\'s shadow work, and Frankl\'s gap',
        'You can identify your patterns, name them, trace their origins, and begin dissolving them through witnessing',
        'The next phase asks the ultimate question: if I am not my patterns, my thoughts, my emotions, or my body — WHO AM I?',
        'This question is the bridge between psychology and liberation.',
      ],
    },
    dayPractice: {
      type: 'journaling', instruction: 'Write a "Loop Inventory." List every loop you\'ve identified in 15 days. For each: name it, rate its strength (1-10), note if it weakened during this phase, and write one sentence about what it\'s protecting. This is your pattern map — your personal machine blueprint.',
      duration: '20 minutes',
      checkpoints: ['How many loops did you identify?', 'Which loop weakened most during this phase?', 'If all your loops dissolved, what would remain?'],
    },
    eveningIntegration: {
      type: 'integration', prompt: 'You now see the machinery. But seeing the machinery raises a question: WHO is seeing it? The machine cannot see itself. Something beyond the machine is looking. What is that?',
      deeperPrompt: 'Ramana Maharshi: "The question \'Who am I?\' is not really meant to get an answer. The question is meant to dissolve the questioner." The next 15 days take you there.',
      closingWisdom: 'You\'ve seen the prison. Now you meet the one who was never in it.',
    },
    dimension: 'awareness', relatedConcepts: ['integration', 'who-am-i', 'ramana'],
  },
];
