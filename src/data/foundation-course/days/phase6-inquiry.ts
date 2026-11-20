import type { CourseDayCurriculum } from '../types';

// ═══════════════════════════════════════════════════════════
// PHASE 6: SELF-INQUIRY (Days 76-90)
// Who Am I?, Neti Neti, Koshas, Vivekananda, V-Levels
// Masters: Ramana Maharshi, Adi Shankara, Vivekananda, Nisargadatta
// ═══════════════════════════════════════════════════════════

export const inquiryDays: CourseDayCurriculum[] = [
  {
    day: 76, phase: 'inquiry', title: 'Who Am I?', subtitle: 'The question that ends all questions',
    morningTeaching: {
      type: 'concept', concept: 'Ramana Maharshi\'s Self-Inquiry',
      keyPoints: [
        'Ramana Maharshi, at age 16, had a spontaneous death experience. He asked: "Who dies?" and found what cannot die.',
        'His entire teaching is one question: "Who am I?" — not as philosophy, but as DIRECT INVESTIGATION.',
        'The method: whenever a thought arises, ask "To whom does this thought arise?" → "To me." → "Who am I?"',
        'The question is not meant to produce an intellectual answer. It is meant to trace attention back to its SOURCE.',
        'What you find is not a new identity. It is the absence of all identity — pure awareness, the Self.',
      ],
      metaphor: 'A man searches the whole world for a treasure, visiting every country, scaling every mountain. Exhausted, he returns home — and finds the treasure was buried under his own house. The search was necessary to exhaust all other possibilities. Now you search the only place left: within.',
    },
    dayPractice: {
      type: 'self-inquiry', instruction: 'Sit for 15 minutes. Close your eyes. Watch thoughts arise. For EACH thought, ask: "To whom does this thought arise?" The answer is always "to me." Then ask: "Who am I?" Do NOT answer with concepts ("I am consciousness," "I am awareness"). Instead, LOOK for the "I." Try to find where the sense of "I" originates. Stay with the looking, not the answering.',
      duration: '15 minutes formal + inquiry throughout the day',
      checkpoints: ['Could you trace the "I" back toward its source?', 'What happens when you look for the looker?', 'Did the mind try to answer with concepts? Could you go beyond the concepts?'],
    },
    eveningIntegration: {
      type: 'neti-neti', prompt: 'When you asked "Who am I?" — what did you find? Not as a thought, but as an experience. What is the felt sense of pure "I" before any content is added?',
      deeperPrompt: 'Ramana: "The Self is not something new to be acquired. It is always there. All that is needed is to get rid of the false notion that it is not realized." What if you are already what you seek?',
      closingWisdom: 'The answer to "Who am I?" is not a word. It is the silence that remains when all words stop.',
    },
    dimension: 'awareness', relatedConcepts: ['self-inquiry', 'ramana', 'atma-vichara'],
  },
  {
    day: 77, phase: 'inquiry', title: 'The I-Thought', subtitle: 'The root of all other thoughts',
    morningTeaching: {
      type: 'deepening', concept: 'The Root Thought',
      keyPoints: [
        'Ramana taught that the "I-thought" (Aham Vritti) is the root of ALL other thoughts.',
        '"I am hungry" — remove the I and there is just hunger. "I am afraid" — remove the I and there is just fear.',
        'The I-thought is not the Self. It is the ego\'s first movement — the identification "I am this body-mind."',
        'Every other thought hangs from this root thought like branches from a tree trunk.',
        'Cut the root, and the entire tree falls. This is self-inquiry — finding and dissolving the I-thought at its source.',
      ],
      scienceNote: 'Neuroscience: The "default mode network" (DMN) creates the narrative self — the continuous "I, me, mine" story. Meditation reduces DMN activity. Self-inquiry targets it directly.',
    },
    dayPractice: {
      type: 'self-inquiry', instruction: 'Today, practice tracing every thought back to "I": "I need to finish work" → who needs? "I am worried" → who is worried? "I should meditate better" → who should? Keep pulling the thread of "I" until you arrive at the bare sense of existence — "I am" without any predicate. Rest there.',
      duration: '15 minutes formal inquiry + daily awareness',
      checkpoints: ['Could you find a thought that doesn\'t have "I" attached to it?', 'What remains when you strip "I am ___" down to just "I am"?', 'What is the felt sense of "I" before it attaches to anything?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'The "I" that woke up this morning — is it the same "I" that is reflecting now? The body changed, thoughts changed, emotions changed. What remained constant?',
      deeperPrompt: 'Nisargadatta Maharaj: "The sense \'I am\' is the beginning of all experience. Before \'I am,\' there is only the Absolute." Can you sense the "I am" before it becomes "I am [something]"?',
      closingWisdom: 'I am. Just that. Before the body, before the name, before the story. I am.',
    },
    dimension: 'awareness', relatedConcepts: ['i-thought', 'aham-vritti', 'nisargadatta', 'dmn'],
  },
  {
    day: 78, phase: 'inquiry', title: 'Neti Neti: Not This, Not This', subtitle: 'Stripping away everything you are not',
    morningTeaching: {
      type: 'concept', concept: 'Neti Neti — The Method of Negation',
      keyPoints: [
        'Neti Neti comes from the Brihadaranyaka Upanishad — one of the oldest spiritual methods in human history.',
        'The method: systematically negate everything you can perceive. "I am not this body" (because I can observe it). "I am not these thoughts" (because I can watch them).',
        'Whatever can be observed CANNOT be the observer. The eye cannot see itself.',
        'After negating everything — body, mind, emotions, identity, memory — what remains cannot be negated. THAT is the Self.',
        'Adi Shankara formalized this into Advaita Vedanta: there is only ONE reality, appearing as many. You are THAT.',
      ],
      metaphor: 'Imagine you are wearing 100 costumes, one over another. Each costume is an identity: your job, your name, your beliefs, your memories. Neti Neti removes them one by one. When the last costume falls — you are not naked. You discover you were never the costumes. You are the space that wore them.',
    },
    dayPractice: {
      type: 'neti-neti', instruction: 'Sit for 15 minutes. Systematically inquire: "Am I this body?" → I can feel it, so I am aware OF it. Not this. "Am I these thoughts?" → I can watch them. Not this. "Am I these emotions?" → They come and go, I remain. Not this. "Am I my memories?" → They change, I persist. Not this. "Am I my identity?" → It shifts with context. Not this. What remains? REST in what remains.',
      duration: '15 minutes formal + awareness throughout the day',
      checkpoints: ['Could you genuinely feel "I am not my body" — not just think it?', 'What resisted being negated most?', 'What is left when everything is negated?'],
    },
    eveningIntegration: {
      type: 'neti-neti', prompt: 'Of everything you negated today, what did the ego cling to most tightly? That is your primary identification — the last veil.',
      deeperPrompt: 'Shankara: "Brahman is the only truth. The world is illusory. The individual self is none other than Brahman." Not as belief — as investigation. Can you verify this through direct experience?',
      closingWisdom: 'What remains when you remove everything that changes is the only thing that is real.',
    },
    dimension: 'awareness', relatedConcepts: ['neti-neti', 'shankara', 'advaita', 'upanishads'],
  },
  {
    day: 79, phase: 'inquiry', title: 'Beyond the Body', subtitle: 'I have a body — but am I the body?',
    morningTeaching: {
      type: 'deepening', concept: 'Dis-identification from the Physical',
      keyPoints: [
        'Every cell in your body replaces itself over ~7-10 years. Your body today is literally not the same body from childhood.',
        'In deep sleep, you have no awareness of the body — yet YOU persist. Something survives the body\'s absence.',
        'The body is an instrument — extraordinary, intelligent, sacred — but it is not what YOU are.',
        'This is NOT body-rejection (that is spiritual bypassing). It is body-appreciation without body-identification.',
        'Vivekananda: "The body is the name of a series of changes. The child body, the young body, the old body are three different bodies. The soul remains the same."',
      ],
    },
    dayPractice: {
      type: 'witness', instruction: 'Today, observe your body AS an object of awareness, not AS you. Feel your hands — but notice that YOU are the one feeling. Walk — but notice that YOU are the one aware of walking. Can you find the border between "body" and "the awareness of body"?',
      duration: 'Throughout the day',
      checkpoints: ['Can you sense yourself as separate from the body?', 'Not separate as in disconnected — separate as in larger than the body?', 'What knows that the body is here?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'In deep sleep tonight, your body will be there but "you" won\'t know it. Who are you in deep sleep?',
      deeperPrompt: 'If you lost an arm, would you be less "you"? If you changed your face, would the watcher behind the eyes change?',
      closingWisdom: 'You don\'t have a soul. You are a soul. You have a body.',
    },
    dimension: 'awareness', relatedConcepts: ['dis-identification', 'body', 'vivekananda'],
  },
  {
    day: 80, phase: 'inquiry', title: 'The Five Koshas: Sheaths of Being', subtitle: 'Five layers between you and You',
    morningTeaching: {
      type: 'concept', concept: 'Pancha Kosha — The Five Sheaths',
      keyPoints: [
        'The Taittiriya Upanishad describes 5 sheaths (Koshas) that cover the Self like layers of an onion:',
        '1. ANNAMAYA KOSHA — Food body (physical form, bones, organs)',
        '2. PRANAMAYA KOSHA — Energy body (breath, prana, life force)',
        '3. MANOMAYA KOSHA — Mental body (thoughts, emotions, the lower mind)',
        '4. VIJNANAMAYA KOSHA — Wisdom body (discrimination, insight, higher intellect)',
        '5. ANANDAMAYA KOSHA — Bliss body (deep joy, the thinnest veil before pure Self)',
        'Beyond all 5 koshas is ATMAN — the Self, which is identical to BRAHMAN, the universal consciousness.',
      ],
      metaphor: 'Imagine a lamp with five lampshades. The light (Atman) is always shining, but each shade filters and colors the light differently. The food body creates the densest filter. The bliss body is the finest veil — almost transparent. Self-inquiry removes the shades to see the pure light.',
    },
    dayPractice: {
      type: 'observation', instruction: 'Today, observe which kosha you are operating from in each moment: Are you in Annamaya (hungry, tired, physical focus)? Pranamaya (energized, breathing, vitality)? Manomaya (thinking, emoting, planning)? Vijnanamaya (discerning, understanding, insightful)? Anandamaya (deep peace, gratitude, joy beyond reason)? Track your kosha shifts through the day.',
      duration: 'Throughout the day — map 6+ transitions',
      checkpoints: ['Which kosha do you live in most?', 'Can you shift between koshas consciously?', 'Have you ever touched Anandamaya — joy without cause?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'If you peel back all 5 koshas through awareness — physical, energy, mental, wisdom, bliss — what is left? The Upanishad says: THAT is what you are.',
      deeperPrompt: 'The koshas are not obstacles — they are instruments. Each one is a gift. But identifying WITH any of them is like mistaking the lampshade for the light.',
      closingWisdom: 'You are not the food body, not the breath, not the mind, not even bliss. You are the light that illuminates all five.',
    },
    dimension: 'awareness', relatedConcepts: ['koshas', 'pancha-kosha', 'upanishads', 'atman'],
  },
  {
    day: 81, phase: 'inquiry', title: 'Beyond the Mind', subtitle: 'I have thoughts — but am I the thinker?',
    morningTeaching: {
      type: 'deepening', concept: 'Dis-identification from Mind',
      keyPoints: [
        'Descartes said "I think, therefore I am." Ramana said: "I am, therefore thoughts appear."',
        'Thoughts arise and dissolve. In deep sleep, there are no thoughts — but you exist. Existence precedes thought.',
        'The mind is a magnificent instrument — but you are not the instrument. You are the one using it.',
        'Nisargadatta: "I am not my thoughts. I am the one who watches the thoughts."',
        'The greatest tragedy of human life is identifying with the mind\'s content instead of the awareness that contains it.',
      ],
    },
    dayPractice: {
      type: 'self-inquiry', instruction: 'Today, treat every thought as a visitor to an empty room. You are the room. Thoughts enter and leave, but the room (you) never changes. When a thought arises, greet it: "Welcome, thought." When it leaves: "Goodbye, thought." You remain. The room remains.',
      duration: '15 minutes formal + daily practice',
      checkpoints: ['Could you experience yourself as the "room" rather than the thoughts?', 'What happens in the moment between two thoughts?', 'Is the space between thoughts the same as the space during thoughts?'],
    },
    eveningIntegration: {
      type: 'neti-neti', prompt: 'If you are not the thinker, then who has been running your life? And who just realized that?',
      deeperPrompt: 'Vivekananda: "Take up one idea. Make that one idea your life. Think of it, dream of it, live on that idea. Let the brain, muscles, nerves, every part of your body, be full of that idea." Your idea for now: I am not the mind.',
      closingWisdom: 'The mind is a wonderful servant but a terrible master. You\'ve been serving it. Time to reclaim the throne.',
    },
    dimension: 'awareness', relatedConcepts: ['dis-identification', 'mind', 'nisargadatta', 'vivekananda'],
  },
  {
    day: 82, phase: 'inquiry', title: 'Beyond Emotions & Roles', subtitle: 'Stripping every mask to find the face beneath',
    morningTeaching: {
      type: 'deepening', concept: 'Identity Dissolution',
      keyPoints: [
        'You are not your emotions — they change every hour but YOU persist. Anger visits, joy visits, sadness visits. You are the host.',
        'You are not your roles — father, daughter, worker, friend. Remove every role and something remains that was never a role.',
        'You are not your name — a sound given to you by someone else. Before the name, you existed.',
        'You are not your story — the narrative keeps changing (childhood felt different from how you see it now).',
        'What are you when you remove body, mind, emotions, roles, name, and story? THAT is the inquiry.',
      ],
    },
    dayPractice: {
      type: 'neti-neti', instruction: 'Today, practice "costume removal." In every interaction, notice which ROLE you are playing: professional you, parent you, friend you, spiritual you. After each interaction, internally remove that costume: "That was a role. I am not the role." Who remains when no costume is on?',
      duration: 'In every interaction today',
      checkpoints: ['How many different roles did you play today?', 'Which role feels most "real" — which one do you most identify with?', 'Who is the one switching between roles?'],
    },
    eveningIntegration: {
      type: 'neti-neti', prompt: 'If you are not the body, not the mind, not the emotions, not any role — and yet you EXIST — what are you?',
      deeperPrompt: 'Shankara\'s Atma Shatakam: "I am not the mind, intellect, ego, or memory. Not the ear, tongue, nose, or eyes. Not ether, earth, fire, or air. I am pure consciousness and bliss. I am Shiva. I am Shiva."',
      closingWisdom: 'Strip everything away. What you cannot remove is what you are.',
    },
    dimension: 'awareness', relatedConcepts: ['identity', 'roles', 'atma-shatakam', 'shankara'],
  },
  {
    day: 83, phase: 'inquiry', title: 'The Witness Deepens', subtitle: 'Who is watching the watcher?',
    morningTeaching: {
      type: 'deepening', concept: 'The Ultimate Witness',
      keyPoints: [
        'You learned to witness thoughts. Then emotions. Then the body. But now — who is witnessing the witness?',
        'This question collapses the observer-observed split. The witness cannot be witnessed because it IS witnessing itself.',
        'Ramana: "There are no two selves — one to know the other. The Self is self-luminous."',
        'This is not intellectual. It is experiential. The eye trying to see itself. Awareness aware of itself.',
        'When seeking stops because the seeker dissolves — THAT is recognition.',
      ],
    },
    dayPractice: {
      type: 'witness', instruction: 'Today, sit for 15 minutes and try to witness the witness. Watch thoughts — then turn attention to the one watching. You will find... nothing objectifiable. Rest there. That "nothing" is not empty — it is full awareness, unable to be seen because it IS the seeing.',
      duration: '15 minutes formal + contemplation throughout',
      checkpoints: ['What happened when you tried to witness the witness?', 'Did the mind create a "higher witness" to observe from? (That\'s just another thought!)', 'Can you rest in the impossibility of seeing the seer?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'The eye cannot see itself. Awareness cannot be made into an object of awareness. Does that frustrate you or liberate you?',
      deeperPrompt: 'Nisargadatta: "You are the space in which everything happens. You are the awareness. You are not what happens — you are the happening itself."',
      closingWisdom: 'You cannot find yourself because you are the one doing the finding. Stop seeking and you are found.',
    },
    dimension: 'awareness', relatedConcepts: ['witness-depth', 'self-luminous', 'ramana', 'nisargadatta'],
  },
  {
    day: 84, phase: 'inquiry', title: 'Silence as Answer', subtitle: 'When the mind stops asking — what remains?',
    morningTeaching: {
      type: 'concept', concept: 'The Power of Silence',
      keyPoints: [
        'Ramana Maharshi\'s highest teaching was SILENCE. He would often sit without speaking, and seekers would have their questions dissolved by his presence alone.',
        'Silence is not the absence of sound. It is the absence of the mind\'s commentary.',
        'In that silence, there is a fullness — not emptiness. It is consciousness resting in itself.',
        'Dakshinamurthy (Shiva as the silent teacher): "The teacher is young, the disciples are old. The teacher\'s teaching is silence, and the disciples\' doubts are dispelled."',
        'The greatest truths cannot be spoken. They can only be pointed at. Silence IS the pointing.',
      ],
    },
    dayPractice: {
      type: 'silence', instruction: 'Practice 30 minutes of intentional silence today. Not just outer silence — inner silence. Don\'t speak externally. Don\'t speak internally. When the mind comments, let it go. Rest in the space before and after each thought. Find the silence that is always there under the noise.',
      duration: '30 minutes of deep silence',
      checkpoints: ['Could you find inner silence even briefly?', 'What was silence like when you stopped calling it "empty"?', 'Did any insight arise FROM silence rather than from thought?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'What did silence reveal that thinking could not?',
      deeperPrompt: 'Rumi: "Silence is the language of God. All else is poor translation." What was God (consciousness, truth, reality) saying in the silence today?',
      closingWisdom: 'When the question dissolves, the answer was never needed. What remains is what you always were.',
    },
    dimension: 'awareness', relatedConcepts: ['silence', 'ramana', 'dakshinamurthy', 'mauna'],
  },
  {
    day: 85, phase: 'inquiry', title: 'The Fear of Disappearing', subtitle: 'Ego death — the mind\'s ultimate fear',
    morningTeaching: {
      type: 'concept', concept: 'Ego Dissolution Fear',
      keyPoints: [
        'As self-inquiry deepens, the ego feels threatened. It equates dissolving identity with DYING.',
        'Symptoms: panic, resistance, boredom, "this is pointless," anger at the practice, existential anxiety',
        'THIS FEAR IS THE BEST SIGN. It means the inquiry is working — it is reaching the ego\'s core.',
        'Ramana experienced literal "death" at 16. He let it happen. What survived the death of the ego was the Self — deathless, eternal.',
        'You are not being asked to die. You are being asked to discover what in you has never been born and therefore cannot die.',
      ],
      scienceNote: 'fMRI studies of deep meditators show decreased activity in the posterior cingulate cortex — the brain\'s "self-referential" center. The brain literally lets go of "me." Those meditators report not loss but liberation.',
    },
    dayPractice: {
      type: 'self-inquiry', instruction: 'Today, face the fear directly. Sit for 15 minutes and ask: "If I (the ego, the identity) completely dissolved right now — what would happen? Who would be left?" Let the fear arise. Don\'t push it away. Sit WITH the terror. Breathe. Discover: even in the presence of the fear of dissolution — YOU are still here, aware.',
      duration: '15 minutes + observation of ego resistance throughout the day',
      checkpoints: ['Did fear arise during the inquiry?', 'Could you sit with the fear without fleeing?', 'In the midst of the fear — was something still aware? Something untouched by the fear?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'The ego fears disappearing. But has the ego ever actually been REAL? Can you find the ego as a fixed entity, or is it just a stream of thoughts claiming to be a person?',
      deeperPrompt: 'What Ramana discovered: the ego was never born. It was a misidentification — consciousness identifying with body-mind. "Death" of the ego is not death at all. It is waking up from a dream.',
      closingWisdom: 'You are not dying. You are waking up. What dies is only what was never real.',
    },
    dimension: 'awareness', relatedConcepts: ['ego-death', 'dissolution', 'ramana', 'deathless'],
  },
  {
    day: 86, phase: 'inquiry', title: 'Being vs. Becoming', subtitle: 'You are already what you seek',
    morningTeaching: {
      type: 'concept', concept: 'Pure Being',
      keyPoints: [
        'The entire spiritual search is a paradox: you are searching for what you already are.',
        'The mind says: "I must BECOME enlightened." Truth says: "You are already THAT — you just don\'t see it."',
        'Seeking itself creates distance. The act of searching implies the object is elsewhere.',
        'Nisargadatta: "You are already that which you are seeking. The search is what covers it up."',
        'Sat-Chit-Ananda (Being-Consciousness-Bliss) is not a state to achieve. It is your nature, RIGHT NOW, obscured only by identification with body-mind.',
      ],
    },
    dayPractice: {
      type: 'witness', instruction: 'Today, stop seeking. Instead, REST in what is already here. Not trying to be more aware, more present, more conscious. Just BE. When the mind says "I should be more..." reply: "I already am." When it says "I\'m not there yet..." reply: "There is no \'there.\' Here is all there is."',
      duration: 'Entire day — stop seeking, start being',
      checkpoints: ['Could you rest in being without trying to become anything?', 'How does the mind react to "no more seeking"?', 'What is the quality of experience when you stop trying to improve it?'],
    },
    eveningIntegration: {
      type: 'surrender', prompt: 'What if the entire journey of 118 days is not about GETTING somewhere but about removing what covers where you already are?',
      deeperPrompt: 'Ramana: "Realization is not to be attained. It is already there. All that is needed is to remove the veil." What is your veil? And who is beneath it?',
      closingWisdom: 'You are not on a journey to somewhere. You are on a journey to here.',
    },
    dimension: 'awareness', relatedConcepts: ['being', 'sat-chit-ananda', 'nisargadatta', 'realization'],
  },
  {
    day: 87, phase: 'inquiry', title: 'Vivekananda\'s Practical Vedanta', subtitle: 'The fire of knowledge must burn in life, not in books',
    morningTeaching: {
      type: 'concept', concept: 'Vedanta in Action',
      keyPoints: [
        'Swami Vivekananda brought Vedanta out of the caves and into the streets. His teaching: "Arise, awake, and stop not till the goal is reached!"',
        'Practical Vedanta means: your realization must express in HOW YOU LIVE, not just what you experience in meditation.',
        'Vivekananda: "Each soul is potentially divine. The goal is to manifest this divinity within."',
        'He unified all four yoga paths: "Jnana is the yoga for the thinker, Bhakti for the feeler, Karma for the doer, Raja for the mystic."',
        'Your self-inquiry must NOT create a spiritual ego that "knows the truth" but lives no differently. Knowledge without transformation is entertainment.',
      ],
    },
    dayPractice: {
      type: 'observation', instruction: 'Today, bring self-inquiry into ACTIVE LIFE. At work, in relationships, while commuting — maintain the question "Who am I?" as a background hum. Not withdrawing from life but engaging MORE fully while being aware of the awareness behind it all.',
      duration: 'Entire day — inquiry in the marketplace',
      checkpoints: ['Could you maintain inquiry awareness during active tasks?', 'Did inquiry change the QUALITY of your engagement with life?', 'Is there a difference between meditation awareness and marketplace awareness?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'Vivekananda said: "The greatest religion is to be true to your own nature." What IS your true nature — not the conditioned personality, but the natural expression of your consciousness?',
      deeperPrompt: 'If every soul is divine, then the person who annoyed you today is also divine. Can you see through their conditioning to the same awareness that looks through your eyes?',
      closingWisdom: 'Enlightenment is not escape from life. It is seeing life as it truly is — sacred, whole, and already perfect.',
    },
    dimension: 'awareness', relatedConcepts: ['vivekananda', 'practical-vedanta', 'divinity', 'engagement'],
  },
  {
    day: 88, phase: 'inquiry', title: 'The V-Levels: Your Growth Map', subtitle: 'Understanding the terrain of consciousness evolution',
    morningTeaching: {
      type: 'concept', concept: 'Vertical Levels of Consciousness',
      keyPoints: [
        'Consciousness evolves through recognizable stages — not as achievement, but as deepening.',
        'Band 0 (Sleeper): Life on autopilot. No awareness of patterns. Band 1 (Questioner): Something feels off. Seeking begins.',
        'Band 2 (Observer): The witness is born. You can watch your thoughts. Band 3 (Alchemist): Patterns become teachers.',
        'Band 4 (Navigator): The gap between trigger and response opens. Band 5 (Architect): Life built from inside out.',
        'Band 6 (Channel): Ego softens. Intuition leads. Band 7 (Source): "I am what I was seeking." Search ends.',
        'You are somewhere on this map. Not as judgment — as orientation. Where you are is perfect. Where you\'re going is irrelevant — only this step matters.',
      ],
    },
    dayPractice: {
      type: 'journaling', instruction: 'Reflect honestly: which V-Level band do you live in MOST of the time? (Not your peak moments — your baseline.) Write about: (1) Your dominant state. (2) What triggers you back to lower bands. (3) What naturally lifts you to higher states. (4) What feels like your "next step" — not a year from now, but today.',
      duration: '15 minutes of honest self-assessment',
      checkpoints: ['Where is your honest baseline?', 'What is your edge — the next band you touch sometimes but can\'t sustain?', 'What would stabilizing one band higher change in your daily life?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'The V-Levels are not a ladder to climb. They are depths to discover. You don\'t "achieve" Band 7 — you realize it was always the ground you were standing on.',
      deeperPrompt: 'Nisargadatta lived at Band 7 while running a tobacco shop. Ramana lived at Band 7 while sitting on a couch. The band is not about what you DO — it is about who you ARE while doing it.',
      closingWisdom: 'You are already the highest level. You are just remembering it layer by layer.',
    },
    dimension: 'awareness', relatedConcepts: ['v-levels', 'consciousness-bands', 'growth-map', 'baseline'],
  },
  {
    day: 89, phase: 'inquiry', title: 'Self-Inquiry in Daily Life', subtitle: 'Taking the question into the marketplace',
    morningTeaching: {
      type: 'practice-intro', concept: 'Living Self-Inquiry',
      keyPoints: [
        'The real test of inquiry is not what happens on the cushion but what happens in traffic, in arguments, in boredom.',
        'Sadhguru: "Spirituality is not about looking up or looking down. It is about looking inward."',
        'Every moment of daily life is an opportunity for inquiry: Who is eating? Who is driving? Who is angry?',
        'The question "Who am I?" doesn\'t need formal practice. It becomes a lens through which you see EVERYTHING.',
        'When inquiry becomes continuous, you don\'t meditate anymore. Your entire life IS the meditation.',
      ],
    },
    dayPractice: {
      type: 'self-inquiry', instruction: 'Today, carry the question "Who am I?" into EVERY activity. Eating: who is tasting? Working: who is thinking? In conversation: who is listening? In frustration: who is frustrated? Don\'t answer. Just let the question illuminate the moment. Count how many times you remember to ask.',
      duration: 'The entire day — minimum 20 inquiry moments',
      checkpoints: ['How many times did you remember to ask "Who am I?" today?', 'What changed in the quality of experience when the question was present?', 'Did the question feel different in action vs in stillness?'],
    },
    eveningIntegration: {
      type: 'reflection', prompt: 'When inquiry was present during your day — was there a different quality to experience? More spacious? More alive? More real?',
      deeperPrompt: 'The inquiry is not separate from life. Life IS the inquiry. Every moment, existence is asking you: "Who are you?" Every moment, your response IS your answer.',
      closingWisdom: 'The market, the kitchen, the office — these are your temples now. The question is your prayer.',
    },
    dimension: 'awareness', relatedConcepts: ['daily-inquiry', 'sadhguru', 'living-meditation'],
  },
  {
    day: 90, phase: 'inquiry', title: 'Inquiry Phase Complete', subtitle: 'The question dissolved — presence remains',
    morningTeaching: {
      type: 'review', concept: 'Phase 6 Integration',
      keyPoints: [
        'In 15 days, you have practiced humanity\'s most powerful tools of self-knowledge: Ramana\'s self-inquiry, Shankara\'s neti neti, the kosha map, Vivekananda\'s practical vedanta.',
        'You have faced the ego\'s fear of dissolution and discovered that what you are cannot die because it was never born.',
        'You have learned the V-Level map — not as achievement but as orientation.',
        'The next phase moves from subtraction (removing what you\'re not) to sensing what you ARE: the energy body, the chakra system, prana, kundalini.',
        'Self-inquiry doesn\'t end. It becomes your constant companion — the silent question that illuminates everything.',
      ],
    },
    dayPractice: {
      type: 'journaling', instruction: 'Write: "Before self-inquiry, I was... During self-inquiry, I discovered... After self-inquiry, I am..." Let the words come from the deepest place you can access. Not performance — truth.',
      duration: '15 minutes',
      checkpoints: ['What was the most profound moment of this phase?', 'Has your sense of identity shifted?', 'Can you hold the question "Who am I?" lightly, like a companion rather than a task?'],
    },
    eveningIntegration: {
      type: 'integration', prompt: 'Ramana was once asked: "What is the highest truth?" He answered: "BE." Not know. Not understand. Not believe. Just BE.',
      deeperPrompt: 'You\'ve asked "Who am I?" for 15 days. The mind may still not have an answer. But something in you KNOWS — without words, without concepts. Can you feel it?',
      closingWisdom: 'The answer was never a word. It was always this — this awareness, reading these words, right now. You found it. You were it all along.',
    },
    dimension: 'awareness', relatedConcepts: ['integration', 'self-inquiry', 'being', 'ramana'],
  },
];
