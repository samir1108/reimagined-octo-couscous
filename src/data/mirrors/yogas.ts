/**
 * MODULE 6 · VIVEKANANDA · 4 YOGAS (mirrors 51–60)
 *
 * Vivekananda's four yogas, treated as four ways of working rather than four
 * personalities. Most people are genuinely lopsided here, and the lopsidedness
 * is usually more informative than the favourite.
 */

import { q3, pickOne, scale, likert5, type MirrorBank } from './types';

export const YOGAS_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'jnana-aptitude',
    title: 'Jnana aptitude',
    subtitle: 'Your capacity to discriminate real from unreal',
    module: '4 Yogas',
    tradition: 'vedic',
    dimensionCategory: 'path',
    coverEmoji: '📖',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Jnāna is not knowing things. It is the capacity to tell the real from the plausible — and the tradition is blunt that this takes longer than any other path.\n\nWhat matters here is not how much you know. It is what happens when an idea you have held for years stops holding.',
    dimensions: ['abstract', 'analytical', 'discriminating', 'seeing'],
    engineHooks: {
      practiceAffinity: ['jnana', 'self-inquiry'],
      deepensWith: ['inquiry-sharpness', 'non-dual-glimpses'],
    },
    questions: [
      q3(
        'jnana-abstraction',
        'comfort',
        'Do you prefer things that are concrete or things that are abstract?',
        'Where are you more comfortable — in the concrete, or in the general?',
        'Some minds are built for precision and some for pattern. Which is yours, and what does it cost?',
        scale(
          ['Only concrete things', 'Concrete, with occasional abstract stretches', 'Either, depending on the subject', 'Abstract, comfortably', 'I live in the abstract by default'],
          ['concrete', 'concrete', 'mixed', 'abstract', 'abstract'],
        ),
      ),
      q3(
        'jnana-moment',
        'recognition',
        'Has there ever been a moment you suddenly saw through something you had believed?',
        'Has a belief of yours collapsed from the inside?',
        'Jnāna is described as a recognition, not an argument. Has that happened to you?',
        scale(
          ['Never', 'Once, a long time ago', 'A few times', 'More than once, and recently', 'It happens regularly'],
          ['never', 'rare', 'occasional', 'recurring', 'frequent'],
        ),
      ),
      q3(
        'jnana-level',
        'depth',
        'When you understand something, do you go further than the explanation?',
        'Does understanding end at the explanation, or continue past it?',
        'The distinction the tradition draws is between understanding a thing and recognising what it is. Which do you usually stop at?',
        pickOne(
          ['At the explanation — that is enough', 'A little past it, into the implications', 'Further, into how it fits other things', 'All the way down to what it actually is', 'I rarely go past the explanation'],
          ['concept', 'implications', 'fit', 'direct', 'concept'],
        ),
      ),
      q3(
        'jnana-defence',
        'resistance',
        'What happens to your analysis when it turns on you?',
        'How do you handle an idea that implicates you?',
        'Every insight eventually points at the one doing the understanding. Most analysis turns away from exactly there. Yours?',
        likert5('discriminating', [
          'I stop analysing immediately',
          'I notice and redirect',
          'I push through, mostly',
          'I go straight at it',
          'I do not notice that it applies to me',
        ]),
      ),
      q3(
        'jnana-concept',
        'holding',
        'When someone gives you a beautiful idea, do you use it or collect it?',
        'Do ideas pass through you, or accumulate?',
        'There is a kind of person who recognises a true idea and one who recognises a good idea. Which do you have?',
        scale(
          ['I gather them', 'I gather quite a lot of them', 'Some pass through, some stay', 'Most change how I see something', 'They change me immediately and I cannot hold them lightly'],
          ['collecting', 'collecting', 'mixed', 'passing', 'passing'],
        ),
      ),
      q3(
        'jnana-block',
        'obstruction',
        'What stops the analysis from going further?',
        'What is in the way?',
        'There is always something at the end of the analysis, and it is rarely intellectual. What is yours?',
        pickOne(
          ['Lack of knowledge', 'Lack of time or energy', 'Fear of what I would find', 'Attachment to the conclusion', 'I have not hit a wall yet'],
          ['knowledge', 'capacity', 'fear', 'attachment', 'clear'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'abstract',
        label: 'Abstract comfort',
        short: 'You think in shapes rather than instances',
        description:
          'Your mind works naturally in the general. This makes pattern-spotting easy and precision hard — you will grasp the architecture of a situation before its particulars, and occasionally get burned by the particulars.',
        shadow: 'Preferring the model to the thing it describes.',
        color: 'sky',
        masters: ['jnana', 'observation'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.2 },
          practiceLevels: { jnana: 1, observation: 1 },
          tags: ['jnana', 'abstract'],
        },
      },
      {
        id: 'analytical',
        label: 'Analytical',
        short: 'You go deep on the explanation',
        description:
          'You analyse well and thoroughly. What is harder is the step from understanding to recognising, because analysis can satisfy the appetite for clarity without ever asking what is actually true.',
        shadow: 'Mistaking a complete explanation for a direct one.',
        color: 'amber',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.35, spirit: 0.15 },
          practiceLevels: { jnana: 1, 'self-inquiry': 1 },
          tags: ['jnana', 'analytical'],
        },
      },
      {
        id: 'discriminating',
        label: 'Discriminating',
        short: 'You can tell what is real from what is borrowed',
        description:
          'You have real discrimination — the ability to sort the genuine from the plausible, the felt from the assumed. The next edge is that discrimination applied to your own conclusions, which is where most jnāna practitioners stall.',
        shadow: 'Using the tool on others and not on the conclusions.',
        color: 'teal',
        masters: ['jnana', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.3 },
          practiceLevels: { jnana: 2, witnessing: 1 },
          tags: ['jnana', 'discriminating'],
        },
      },
      {
        id: 'seeing',
        label: 'Seeing',
        short: 'The explanation has stopped being the point',
        description:
          'You are past the analysis and the analysis no longer feels necessary. What is left is direct recognition, and the practical difficulty is that it cannot be held in place for long once attention turns back to ordinary life.',
        shadow: 'Preferring the seeing to what was being seen.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.45, thought: 0.2 },
          practiceLevels: { jnana: 2, witnessing: 1 },
          tags: ['jnana', 'direct'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'raja-access',
    title: 'Raja access',
    subtitle: 'Your inner control room',
    module: '4 Yogas',
    tradition: 'yogic',
    dimensionCategory: 'path',
    coverEmoji: '👑',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Rāja yoga is the discipline of the mind itself — of governing the machinery rather than being carried by it.\n\nThe question is not whether you are in control. It is whether you are in control of the thing you think you are controlling.',
    dimensions: ['unregulated', 'partly-governed', 'mostly-governed', 'free-running'],
    engineHooks: {
      practiceAffinity: ['raja', 'breath'],
      deepensWith: ['reactivity-score', 'meditation-depth'],
    },
    questions: [
      q3(
        'raja-decider',
        'authority',
        'In a moment of real pressure, who decides?',
        'When it counts, who is actually in charge?',
        'There is usually a gap between the decision-maker you believe you are and the one who actually acts. How wide is that gap?',
        pickOne(
          ['I do not know until after', 'Something in me reacts first, and I follow it', 'I catch myself, but not always', 'I catch myself, and I choose', 'I choose without having to catch myself'],
          ['reactive', 'impulsive', 'catching', 'choosing', 'natural'],
        ),
      ),
      q3(
        'raja-disrupt',
        'disruption',
        'What most reliably takes the controls off you?',
        'What is your override?',
        'Everyone has a state they cannot govern from inside. Knowing yours is most of what is needed.',
        pickOne(
          ['Hunger or poor sleep', 'A specific person', 'Being rushed or judged', 'Unexpected news', 'Nothing — it is genuinely stable'],
          ['body', 'relational', 'pressure', 'external', 'clear'],
        ),
      ),
      q3(
        'raja-effort',
        'effort',
        'Does steering feel like effort, or like driving?',
        'Is it work, or is it how you are?',
        'Governance that is effortful is fragile. Governance that is ambient is what the tradition means by rāja.',
        scale(
          ['Constantly effortful', 'Usually effortful', 'Effortful, then it settles', 'Fairly easy', 'It is simply how I operate'],
          ['effortful', 'effortful', 'settled', 'easy', 'ambient'],
        ),
      ),
      q3(
        'raja-release',
        'surrender',
        'What happens if you deliberately let go of control for an hour?',
        'What is the actual experience of stopping steering?',
        'The edge case for anyone with real capacity is not whether they can hold the controls, but whether they can put them down.',
        scale(
          ['It is frightening, and I do not do it', 'It is uncomfortable, so I avoid it', 'It is neutral, and mildly interesting', 'It is genuinely restful', 'I do it regularly and it is where I am most myself'],
          ['fearful', 'avoidant', 'neutral', 'restful', 'preferred'],
        ),
      ),
      q3(
        'raja-return',
        'recovery',
        'After the controls have been off, how long to get them back?',
        'How quickly do you reassert?',
        'Some people reassert instantly and it is a sign of health. Some cannot, and that is worth knowing about.',
        scale(
          ['Immediately, automatically', 'Within a few minutes', 'Within an hour', 'It takes most of the day', 'I do not always get them back'],
          ['instant', 'fast', 'slow', 'very slow', 'lost'],
        ),
      ),
      q3(
        'raja-trust',
        'reliance',
        'How much do you trust your own judgement under pressure?',
        'Do you believe the one steering?',
        'This is a strange question, and it separates a person who governs from one who simply approves of what already happened.',
        scale(
          ['I do not trust it at all', 'Not very much', 'Generally', 'Quite a lot', 'Completely, which is its own risk'],
          ['none', 'low', 'medium', 'high', 'absolute'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'unregulated',
        label: 'Unregulated',
        short: 'The mind drives, and you are along for it',
        description:
          'There is more steering happening than actual steering. This is worth naming without judgement: the system you are hoping to control is the same one doing the hoping.',
        shadow: 'Believing the intention to govern is the governing.',
        color: 'rose',
        masters: ['breath', 'observation'],
        calibration: {
          dimensions: { thought: 0.3, emotion: 0.25, spirit: 0.15 },
          practiceLevels: { breath: 1, observation: 1 },
          tags: ['raja', 'reactive'],
        },
      },
      {
        id: 'partly-governed',
        label: 'Partly governed',
        short: 'You catch it, more often than not',
        description:
          'You intervene. It works often enough to be encouraging and unreliably enough to be frustrating, and the catching is effortful rather than automatic.',
        shadow: 'Catching the reaction instead of the condition that produces it.',
        color: 'amber',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.2, body: 0.15 },
          practiceLevels: { raja: 1, witnessing: 1 },
          tags: ['raja', 'governing'],
        },
      },
      {
        id: 'mostly-governed',
        label: 'Mostly governed',
        short: 'You steer, and the steering holds',
        description:
          'Real governance, and it is reliable enough that you trust it. The remaining question is the harder one: what is the point of steering this particular vehicle?',
        shadow: 'Governing without ever having asked what for.',
        color: 'teal',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { thought: 0.2, action: 0.3, spirit: 0.25 },
          practiceLevels: { raja: 2, karma: 1 },
          tags: ['raja', 'steady'],
        },
      },
      {
        id: 'free-running',
        label: 'Free-running',
        short: 'Governing without gripping',
        description:
          'The controls are there when needed and not in your hands the rest of the time. This is the mature form — the risk here is not loss of control but subtle pride in holding it.',
        shadow: 'Identifiying with the one who steers.',
        color: 'emerald',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.4, thought: 0.2, action: 0.15 },
          practiceLevels: { raja: 2, witnessing: 1 },
          tags: ['raja', 'free'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'devotional-object',
    title: 'Devotional object',
    subtitle: 'To what — or whom — do you bow?',
    module: '4 Yogas',
    tradition: 'vedic',
    dimensionCategory: 'path',
    coverEmoji: '🕉️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Most devotion has an address. Something is being addressed, and the address shapes the experience entirely — a personal god and a universal one are not the same practice.\n\nThis asks what yours is, and whether you chose it.',
    dimensions: ['none', 'external-figure', 'universal', 'formless'],
    engineHooks: {
      practiceAffinity: ['bhakti', 'raja'],
      deepensWith: ['devotion-capacity', 'non-dual-glimpse'],
    },
    questions: [
      q3(
        'devotion-object',
        'address',
        'When you pray, who or what is being addressed?',
        'What is the address?',
        'Say it plainly. What is on the other end?',
        pickOne(
          ['Nothing — I do not pray',
          'Someone specific: a person, a deity, a teacher',
          'Something larger and impersonal: the universe, existence, the source',
          'It has no form at all — just a direction of attention',
          'I have never framed it, I just do it'],
          ['none', 'personal', 'universal', 'formless', 'unframed'],
        ),
      ),
      q3(
        'devotion-chosen',
        'inheritance',
        'Did you choose that, or did you inherit it?',
        'Is the object yours, or your family’s?',
        'Most devotional objects are inherited and never examined. Yours is no exception unless it is.',
        scale(
          ['Inherited, and I have never questioned it', 'Inherited, and I have accepted it', 'Inherited, but I have softened it', 'Chosen for myself, deliberately', 'It keeps changing as I do'],
          ['inherited', 'inherited', 'adapted', 'chosen', 'evolving'],
        ),
      ),
      q3(
        'devotion-answered',
        'response',
        'Does anything answer?',
        'Is there a response, or only the asking?',
        'Most practitioners report the response as subtle rather than absent. What is yours?',
        scale(
          ['I do not expect a response', 'Occasionally, and I cannot be sure', 'At certain times, fairly clearly', 'Regularly, and specifically', 'I have stopped distinguishing asking from being answered'],
          ['none', 'rare', 'occasional', 'regular', 'continuous'],
        ),
      ),
      q3(
        'devotion-need',
        'need',
        'What do you actually want from it?',
        'What is the prayer for?',
        'Take the most devotional part of your life and state its function plainly. What is it doing for you?',
        pickOne(
          ['Comfort in difficulty', 'Absolution from wrongdoing', 'A better outcome', 'To not be alone', 'To be shown what is true'],
          ['comfort', 'forgiveness', 'outcome', 'presence', 'truth'],
        ),
      ),
      q3(
        'devotion-without',
        'objectless',
        'Could you do it with nothing to bow to?',
        'Does it survive the removal of the object?',
        'Take the figure, the form, the address — remove all of it. Does the practice survive?',
        scale(
          ['No — without it there is nothing', 'It feels thin and slightly wrong', 'Something remains but weaker', 'Yes, largely unchanged', 'That is closer to how it already is'],
          ['dependent', 'dependent', 'partial', 'intact', 'inherent'],
        ),
      ),
      q3(
        'devotion-quality',
        'quality',
        'When devotion is strong, how does it feel from the inside?',
        'What is the texture of it?',
        'Devotion is described as a narrowing of the self into something larger. Is that what it is like?',
        scale(
          ['Relief, mostly', 'Comfort and closeness', 'A settling, and being held', 'An intensity, and a narrowing', 'A dissolving, and a great lightness'],
          ['relief', 'comfort', 'held', 'narrowing', 'dissolving'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'none',
        label: 'No object',
        short: 'Practice without an address',
        description:
          'There is no devotional structure in your life. This is common and not a deficiency. What tends to fill the space is usually a practice that asks the same question by a different route.',
        shadow: 'Assuming the missing piece is the problem.',
        color: 'slate',
        masters: ['observation', 'raja'],
        calibration: {
          dimensions: { spirit: 0.2, thought: 0.2, connection: 0.15 },
          practiceLevels: { observation: 1 },
          tags: ['devotion', 'unaddressed'],
        },
      },
      {
        id: 'external-figure',
        label: 'An external figure',
        short: 'Someone, and you know who',
        description:
          'Your devotion has a personal address, usually inherited. That is a real and functional relationship rather than a weakness, and the thing worth examining is whether you ever chose the address or simply inherited it.',
        shadow: 'Inheriting a relationship and treating it as a discovery.',
        color: 'amber',
        masters: ['bhakti', 'karma'],
        calibration: {
          dimensions: { emotion: 0.3, connection: 0.3, spirit: 0.2 },
          practiceLevels: { bhakti: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['devotion', 'personal'],
        },
      },
      {
        id: 'universal',
        label: 'Something larger',
        short: 'Personal, but not particular',
        description:
          'Your devotion is directed at something larger than any individual, and it is usually paired with a real sense that something is listening. This is where most of the tradition lives.',
        shadow: 'Abstraction standing in for intimacy.',
        color: 'teal',
        masters: ['bhakti', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.35, emotion: 0.25, connection: 0.2 },
          practiceLevels: { bhakti: 2, witnessing: 1 },
          tags: ['devotion', 'universal'],
        },
      },
      {
        id: 'formless',
        label: 'Formless',
        short: 'The address is the direction of attention',
        description:
          'The practice has no object and does not need one. What remains is an orientation, and it holds up under examination in a way that most devotional structures do not.',
        shadow: 'Adding an object back the moment it gets uncomfortable.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.45, emotion: 0.15 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          tags: ['devotion', 'formless'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'detachment-grade',
    title: 'Detachment grade',
    subtitle: 'Free, not cold',
    module: '4 Yogas',
    tradition: 'vedic',
    dimensionCategory: 'attachment',
    coverEmoji: '⚖️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Karma yoga asks for action without attachment to the result. The requirement is specific: not caring less about the outcome, but needing it less in order to act.\n\nMost people who claim detachment have actually achieved indifference, which is a different thing.',
    dimensions: ['reactive', 'distancing', 'detached', 'free'],
    engineHooks: {
      practiceAffinity: ['karma', 'witnessing'],
      deepensWith: ['vairagya', 'service-instinct'],
    },
    questions: [
      q3(
        'detach-outcome',
        'outcome',
        'How much does the result matter to you when you have done the work?',
        'How much does the outcome matter, once the work is done?',
        'The test is not whether you care about the result. It is whether you could act well without it.',
        likert5('detached', [
          'Enormously — it is most of what I am working for',
          'A great deal',
          'Quite a lot, honestly',
          'Some, but not so much that it changes what I do',
          'Much less than most people would expect',
        ]),
      ),
      q3(
        'detach-effort',
        'effort',
        'If the result were guaranteed, would you work as hard?',
        'Does certainty change your effort?',
        'This is the cleanest single test of detachment. If the outcome stopped mattering entirely, would your effort stop too?',
        scale(
          ['Yes — I would stop almost immediately', 'Yes, considerably', 'Less, but I would still do it', 'A little less', 'No — the work is the point anyway'],
          ['motive', 'motive', 'partial', 'minimal', 'none'],
        ),
      ),
      q3(
        'detach-warmth',
        'warmth',
        'Do you still enjoy the people involved, or only the work?',
        'Is the warmth still there?',
        'This is where detachment and indifference are told apart. The work can be fully invested while the people have gone cold, and that combination needs watching.',
        likert5('free', [
          'The people have become part of the problem',
          'I am cooler with them than I used to be',
          'It depends on the person',
          'Yes, I still enjoy them',
          'I enjoy them more, now that I am not managing them'],
          ['cold', 'cooler', 'mixed', 'warm', 'warm'],
        ),
      ),
      q3(
        'detach-defence',
        'defence',
        'Does it protect you from disappointment?',
        'What is the detachment doing?',
        'Detachment as a shield looks like detachment and functions as armour. It is worth checking which one you have.',
        pickOne(
          ['It genuinely does not protect me', 'A little — it lowers the stakes', 'Quite a lot', 'Most of the reason I do it this way', 'That is exactly what it is for'],
          ['not-defensive', 'light', 'moderate', 'heavy', 'armour'],
        ),
      ),
      q3(
        'detach-difficulty',
        'difficulty',
        'Does the freedom include the hard days?',
        'Does it hold when things are going badly?',
        'Detachment that only works when things are going well is preference, not freedom.',
        scale(
          ['I only feel it when things are going well', 'Mostly, but not when it goes wrong', 'Yes, reasonably', 'Yes, even then', 'Especially then'],
          ['conditional', 'mostly', 'reliable', 'reliable', 'strongest'],
        ),
      ),
      q3(
        'detach-joy',
        'quality',
        'Do you enjoy what you are doing?',
        'Is there any pleasure in the action itself?',
        'Nishkāma karma is not grim. Work done without needing the fruit can be thoroughly enjoyable. Is yours?',
        likert5('distancing', [
          'No — it is obligation',
          'Only occasionally',
          'Some of the time',
          'Most of the time',
          'Yes — I would do it even unwatched and unpaid',
        ]),
      ),
    ],
    resultTypes: [
      {
        id: 'reactive',
        label: 'Reactive',
        short: 'The outcome is doing the driving',
        description:
          'The result genuinely matters and your effort is organised around it. Nothing wrong with this — it is where most of the world operates, and it is only a problem because you are looking at it.',
        shadow: 'Calling the stake in the result a motivation problem.',
        color: 'rose',
        masters: ['karma', 'observation'],
        calibration: {
          dimensions: { action: 0.25, thought: 0.2, emotion: 0.2 },
          practiceLevels: { karma: 1, observation: 1 },
          domainStress: { work: 'work-career' },
          tags: ['detachment', 'outcome-led'],
        },
      },
      {
        id: 'distancing',
        label: 'Distancing',
        short: 'You have stepped back, and it went cold',
        description:
          'You have reduced your investment and something cooled along with it. Distancing is a real stage and it is often mistaken for the thing after it, which is not.',
        shadow: 'Cool being mistaken for free.',
        color: 'slate',
        masters: ['witnessing', 'karma'],
        calibration: {
          dimensions: { emotion: 0.25, connection: 0.2, action: 0.2 },
          practiceLevels: { witnessing: 1, karma: 1 },
          tags: ['detachment', 'cool'],
        },
      },
      {
        id: 'detached',
        label: 'Detached',
        short: 'Free of the need, still in it',
        description:
          'You can act fully and need the result less in order to do it. The warmth is largely intact and the work is still enjoyable, which makes this a working rather than a theoretical detachment.',
        shadow: 'Relaxing into work that no longer asks anything of you.',
        color: 'teal',
        masters: ['karma', 'raja'],
        calibration: {
          dimensions: { action: 0.3, spirit: 0.25, emotion: 0.2 },
          practiceLevels: { karma: 2, raja: 1 },
          tags: ['detachment', 'free'],
        },
      },
      {
        id: 'free',
        label: 'Free',
        short: 'The action is the whole of it',
        description:
          'The need for the outcome is not driving anything, the warmth is intact, and the work is enjoyable on its own terms. Nishkāma karma, in the description rather than the aspiration.',
        shadow: 'Becoming attached to being detached.',
        color: 'emerald',
        masters: ['karma', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.4, action: 0.25, emotion: 0.2 },
          practiceLevels: { karma: 2, witnessing: 1 },
          tags: ['detachment', 'nishkama'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'svadhyaya',
    title: 'Svādhyāya · study habit',
    subtitle: 'How you keep learning yourself',
    module: '4 Yogas',
    tradition: 'vedic',
    dimensionCategory: 'thought',
    coverEmoji: '📚',
    estimatedMinutes: 5,
    version: 1,
    intro:
      'The fourth niyama, and the one most often reduced to reading. The tradition is specific: the study is of yourself, and the same material is meant to be returned to rather than consumed.\n\nThis is about the habit, not the book list.',
    dimensions: ['none', 'occasional', 'regular', 'relentless'],
    engineHooks: {
      practiceAffinity: ['jnana', 'self-inquiry'],
      deepensWith: ['niyamas', 'inquiry-sharpness'],
    },
    questions: [
      q3(
        'study-what',
        'subject',
        'When you learn something, is it about the world or about you?',
        'Is the study outward or inward?',
        'The subject matters less than the direction. Most study is about the world because the world is safer to study.',
        scale(
          ['Entirely about the world', 'Mostly about the world', 'Both, and I move between them', 'Mostly about me', 'Almost entirely about me'],
          ['outward', 'outward', 'mixed', 'inward', 'inward'],
        ),
      ),
      q3(
        'study-return',
        'return',
        'Do you go back to things you have already read?',
        'Do you return, or do you move on?',
        'Returning is the distinguishing behaviour. A shelf of unopened material is the opposite of svādhyāya.',
        scale(
          ['I never do — I move on', 'Rarely', 'Occasionally, on the same things', 'Regularly, on a small body of material', 'I am going through the same material for the third time'],
          ['never', 'rare', 'occasional', 'regular', 'deep'],
        ),
      ),
      q3(
        'study-record',
        'recording',
        'Do you keep any record of your own material?',
        'Is there any trace of your own thinking?',
        'Notes, recordings, written questions — anything that lets you meet your earlier self. Do you keep any?',
        pickOne(
          ['No, and I would not think to', 'Only occasionally', 'Some things, but scattered', 'Yes, fairly systematically', 'Yes — it is the main thing I work with'],
          ['none', 'occasional', 'scattered', 'systematic', 'central'],
        ),
      ),
      q3(
        'study-enjoyment',
        'quality',
        'Is learning enjoyable, or is it maintenance?',
        'Does it feel like a practice or like a chore?',
        'If the only thing keeping the habit alive is a sense that you should, the habit will not survive a hard month.',
        scale(
          ['Purely obligation', 'Mostly obligation', 'Both, depending on the material', 'Mostly a pleasure', 'The pleasure is most of why I do it'],
          ['obligation', 'obligation', 'mixed', 'pleasant', 'joyful'],
        ),
      ),
      q3(
        'study-browse',
        'appetite',
        'How much of what you take in is chosen, and how much finds you?',
        'How much of your intake is deliberate?',
        'The appetite for material is easy to confuse with the practice of studying. They are not the same and only one of them examines you.',
        scale(
          ['Nearly all of it finds me', 'Most of it finds me', 'About half', 'Mostly chosen', 'Nearly everything I read I chose deliberately'],
          ['passive', 'passive', 'mixed', 'active', 'active'],
        ),
      ),
      q3(
        'study-change',
        'effect',
        'Has your study changed how you actually behave?',
        'What did any of it change?',
        'The only honest measure. Not how much you have read — whether any of it has shown up in what you do.',
        scale(
          ['Not once', 'Once, a long time ago', 'A few times', 'Often enough that people can see it', 'It is the main thing that has shaped how I live'],
          ['never', 'rare', 'occasional', 'consistent', 'total'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'none',
        label: 'None',
        short: 'No deliberate self-study',
        description:
          'There is no self-study habit. This is common and unremarkable. It is also, of the five niyamas, the one with the least self-reinforcement — nothing else here makes it more likely to start.',
        shadow: 'Reading as a substitute for being read.',
        color: 'slate',
        masters: ['jnana', 'observation'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.15 },
          practiceLevels: { jnana: 1, observation: 1 },
          tags: ['svadhyaya', 'none'],
        },
      },
      {
        id: 'occasional',
        label: 'Occasional',
        short: 'It happens, without a shape',
        description:
          'You read things that are relevant to you from time to time, but there is no return to the same material and no record. The subject is usually yourself; the method is consumption rather than study.',
        shadow: 'Collecting material instead of revisiting it.',
        color: 'amber',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.15 },
          practiceLevels: { jnana: 1, 'self-inquiry': 1 },
          tags: ['svadhyaya', 'consuming'],
        },
      },
      {
        id: 'regular',
        label: 'Regular',
        short: 'A practice with a shape',
        description:
          'You keep a real habit and you return to the same material. The subject is increasingly yourself. The discipline is holding because the material is small enough to hold.',
        shadow: 'Outgrowing the small library you built the habit with.',
        color: 'teal',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.25 },
          practiceLevels: { jnana: 2, 'self-inquiry': 1 },
          tags: ['svadhyaya', 'practised'],
        },
      },
      {
        id: 'relentless',
        label: 'Relentless',
        short: 'The same material, for years',
        description:
          'You return to the same body of material repeatedly and it keeps yielding. The material is small, the returning is deep, and something has usually changed about what you are willing to look at.',
        shadow: 'Knowing the material so well it stops asking anything.',
        color: 'indigo',
        masters: ['jnana', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.45 },
          practiceLevels: { jnana: 2, witnessing: 1 },
          tags: ['svadhyaya', 'deep'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'service-radius',
    title: 'Service radius',
    subtitle: 'Who your circle of care includes',
    module: '4 Yogas',
    tradition: 'vedic',
    dimensionCategory: 'connection',
    coverEmoji: '🫂',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Karma yoga has a scope question attached to it, and it is a harder one than it looks. Care that reliably stops at a familiar radius is real care, but it is not the same thing as the tradition is pointing at.\n\nThis asks where your radius is, and what sets it.',
    dimensions: ['self', 'household', 'community', 'all-sentient'],
    engineHooks: {
      loopsToCheck: ['isolation', 'over-giving'],
      practiceAffinity: ['karma', 'relationship'],
      deepensWith: ['service-instinct', 'community-rooting'],
    },
    questions: [
      q3(
        'service-radius',
        'scope',
        'How far does your care naturally reach?',
        'Where does the circle stop?',
        'Most people have a radius and it is smaller than they think. Where is yours?',
        pickOne(
          ['Mostly myself', 'Myself and the people closest to me', 'Wider — a network, a community, work colleagues',
            'A great many people, and I still know their names',
            'Whoever is in front of me, without a boundary'],
          ['self', 'household', 'community', 'wide', 'open'],
        ),
      ),
      q3(
        'service-widen',
        'growth',
        'Has that ever widened, and what happened?',
        'Has the radius moved?',
        'Raridges do widen. What is required is usually not generosity but contact.',
        scale(
          ['It has never changed', 'It has narrowed, mostly by circumstance', 'It has stayed about the same', 'It has widened a little', 'It has widened substantially and I know why'],
          ['fixed', 'narrowed', 'static', 'widened', 'wide'],
        ),
      ),
      q3(
        'service-difficulty',
        'boundary',
        'Does difficulty of any kind widen your care or narrow it?',
        'What happens when someone is hard?',
        'This is the real test of the radius. Difficulty is the thing that reveals whether the care was ever about the person.',
        pickOne(
          ['It narrows sharply', 'It narrows a little', 'It makes no difference', 'It widens — they need more', 'It is when I find out what I actually feel'],
          ['narrows', 'narrows', 'neutral', 'widens', 'revealing'],
        ),
      ),
      q3(
        'service-cost',
        'cost',
        'What does your care cost you, honestly?',
        'What is the bill?',
        'Every radius has a bill. What is yours, and are you paying it willingly?',
        scale(
          ['Nothing — it costs me nothing', 'A little, and it is fine', 'Real time I do not have', 'Real energy, and I am running low', 'More than I can sustain'],
          ['none', 'low', 'moderate', 'high', 'exhausting'],
        ),
      ),
      q3(
        'service-reciprocity',
        'direction',
        'Does it need to be mutual?',
        'Do you need something back?',
        'Unreciprocated care is a different practice from care that expects to be returned. Both can work. Only one is detachment.',
        pickOne(
          ['It has to be mutual, or it is not worth it', 'Some reciprocity is expected', 'I do not track it', 'I do not need it back', 'I actively prefer it not to be returned'],
          ['required', 'expected', 'untracked', 'not-needed', 'asymmetric'],
        ),
      ),
      q3(
        'service-visibility',
        'recognition',
        'Do you need anyone to know that you are doing it?',
        'Does it have to be seen?',
        'Most people need a small amount of visibility, and the tradition flags it as the thing that quietly corrupts the practice.',
        scale(
          ['No — it would be worse if they did', 'No, not really', 'Some is nice', 'Quite a lot', 'It would be hard to keep doing it unseen'],
          ['none', 'none', 'some', 'much', 'essential'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'self',
        label: 'Self',
        short: 'The circle has not widened yet',
        description:
          'Care is essentially self-directed. This is the honest starting point and it is where most people are, whatever the stated intentions. It requires no apology — it requires contact, which is a different kind of work entirely.',
        shadow: 'Service that has not left the house being read as service.',
        color: 'slate',
        masters: ['karma', 'body'],
        calibration: {
          dimensions: { action: 0.2, connection: 0.25, body: 0.15 },
          practiceLevels: { karma: 1, body: 1 },
          tags: ['service', 'self'],
        },
      },
      {
        id: 'household',
        label: 'Household',
        short: 'A real circle, and a fixed one',
        description:
          'Your care reaches the people you are already close to, which is where most people live. The radius is not unnaturally small — it is simply unstretched, and the question is what would widen it.',
        shadow: 'Depth mistaken for breadth.',
        color: 'amber',
        masters: ['karma', 'relationship'],
        calibration: {
          dimensions: { connection: 0.3, action: 0.2 },
          practiceLevels: { karma: 1, relationship: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['service', 'household'],
        },
      },
      {
        id: 'community',
        label: 'Community',
        short: 'A network, and reciprocity',
        description:
          'Your circle extends beyond the household and there is a normal expectation that it runs both ways. This is the shape of most long friendships and communities, and it works — until the reciprocity becomes the point.',
        shadow: 'Keeping score inside the circle of care.',
        color: 'teal',
        masters: ['karma', 'relationship'],
        calibration: {
          dimensions: { connection: 0.35, action: 0.25 },
          practiceLevels: { karma: 1, relationship: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['service', 'community'],
        },
      },
      {
        id: 'all-sentient',
        label: 'Open',
        short: 'No boundary, and not much visibility needed',
        description:
          'The circle is not organised by closeness. What is unusual about this reading is not the size of the radius but the absence of a need for it to be seen — which is the part most people get wrong.',
        shadow: 'Diffuse care, which can also mean no actual care.',
        color: 'emerald',
        masters: ['karma', 'bhakti'],
        calibration: {
          dimensions: { connection: 0.4, spirit: 0.3, action: 0.2 },
          practiceLevels: { karma: 2, bhakti: 1 },
          tags: ['service', 'open'],
        },
      },
    ],
  },
];
