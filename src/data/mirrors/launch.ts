/**
 * MODULE 10 · LAUNCH, PURPOSE & ULTIMATE (mirrors 91–100)
 *
 * The closing module. These mirrors stop measuring the person and start
 * measuring the direction — work, legacy, community, the sacred rhythm of a
 * life, and finally the question the whole apparatus was assembled for.
 *
 * The last three are the hardest to answer honestly, because the honest answer
 * is often "I do not know", and that is a legitimate selection.
 */

import { q3, pickOne, scale, likert5, type MirrorBank } from './types';

export const LAUNCH_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'work-dharma',
    title: 'Work dharma',
    subtitle: 'The clarity of your calling',
    module: 'Launch',
    tradition: 'vedic',
    dimensionCategory: 'action',
    coverEmoji: '🧭',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Dharma in the Gita is not a career. It is what is yours to do — the work that arises from what you actually are, rather than from what happened to be available.\n\nThe most common confusion is between a calling and a preference.',
    dimensions: ['drifting', 'surviving', 'ambitious', 'called'],
    engineHooks: {
      practiceAffinity: ['work-career', 'karma'],
      deepensWith: ['inner-compass', 'detachment-grade'],
    },
    questions: [
      q3(
        'work-why',
        'motive',
        'Why are you doing the work you are doing?',
        'What is actually the reason?',
        'Take the honest answer, not the respectable one. There are only a few possible answers and they are not equal.',
        pickOne(
          ['I have not really chosen it', 'It pays and the options were worse', 'I am good at it and it went from there', 'I am building toward something specific', 'Because this is what I am for'],
          ['drifting', 'surviving', 'ambitious', 'ambitious', 'called'],
        ),
      ),
      q3(
        'work-if',
        'counterfactual',
        'If money were not a factor, would you do this?',
        'Strip the constraint out. What remains?',
        'This is the single most informative question about work, and it is worth answering before answering it out loud.',
        scale(
          ['Absolutely not', 'No — I would do something else entirely', 'I would do something adjacent', 'Yes, probably the same thing', 'Yes, and this is exactly it'],
          ['no', 'no', 'adjacent', 'yes', 'yes'],
        ),
      ),
      q3(
        'work-friction',
        'resistance',
        'How often do you dread going to work?',
        'What is the weekly feeling?',
        'Not a bad month — the ordinary week, averaged over a year. A high number here is more informative than any answer about meaning.',
        scale(
          ['Most weeks', 'Often', 'About half the time', 'Rarely', 'Almost never'],
          ['high', 'high', 'mixed', 'low', 'low'],
        ),
      ),
      q3(
        'work-gift',
        'signature',
        'What can you do that most people cannot?',
        'What is your particular capacity?',
        'A calling is usually found at the intersection of a real gift and an actual need. Which half are you clearer about?',
        scale(
          ['Neither, honestly', 'My gift, and I do not know the need', 'The need, and I do not know my gift', 'Both, approximately', 'Both, and they fit exactly'],
          ['neither', 'gift', 'need', 'both', 'both'],
        ),
      ),
      q3(
        'work-avoid',
        'avoidance',
        'Is there work you know you are avoiding?',
        'What are you not doing?',
        'The avoided thing is more informative than the current thing, because avoidance usually knows what it is about.',
        pickOne(
          ['Nothing in particular', 'Starting something', 'Finishing something', 'Asking for what I am owed', 'A conversation I have been putting off'],
          ['none', 'starting', 'finishing', 'asking', 'conversing'],
        ),
      ),
      q3(
        'work-scale',
        'impact',
        'Does what you do matter to anyone other than you?',
        'Who is affected?',
        'Purpose is not a private experience. It has an audience, and the size of that audience is worth being honest about.',
        scale(
          ['Only me, really', 'A very small number of people', 'A community I know', 'A lot of people I will never meet', 'I genuinely do not know'],
          ['self', 'few', 'community', 'many', 'unknown'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'drifting',
        label: 'Drifting',
        short: 'It happened rather than being chosen',
        description:
          'The work arrived rather than being chosen, and there is no particular attachment to it. This is the most common state and the one where "why am I doing this" has not been seriously asked yet.',
        shadow: 'Calling a long tenure a vocation.',
        color: 'slate',
        masters: ['work-career', 'self-inquiry'],
        calibration: {
          dimensions: { action: 0.3, thought: 0.2, spirit: 0.15 },
          practiceLevels: { 'self-inquiry': 1 },
          domainStress: { work: 'work-career', direction: 'self-inquiry' },
          tags: ['work', 'undirected'],
        },
      },
      {
        id: 'surviving',
        label: 'Surviving',
        short: 'It is the option that was least bad',
        description:
          'You are doing it because the alternatives were worse, which is a perfectly good reason and is not the same as a reason you would give if the money stopped mattering. The question is what you would build with the difference.',
        shadow: 'Confusing security with purpose.',
        color: 'amber',
        masters: ['work-career', 'karma'],
        calibration: {
          dimensions: { action: 0.3, body: 0.2, emotion: 0.2 },
          practiceLevels: { karma: 1 },
          domainStress: { work: 'work-career' },
          tags: ['work', 'pragmatic'],
        },
      },
      {
        id: 'ambitious',
        label: 'Ambitious',
        short: 'Building toward something specific',
        description:
          'There is a target and real energy behind it. The strength and the risk are the same thing: the target is doing a lot of the motivating, and it is worth noticing what happens to the motivation as it gets close.',
        shadow: 'Confusing the desire to achieve with the desire to matter.',
        color: 'sky',
        masters: ['work-career', 'karma'],
        calibration: {
          dimensions: { action: 0.4, thought: 0.2 },
          practiceLevels: { karma: 1, raja: 1 },
          domainStress: { work: 'work-career' },
          tags: ['work', 'driven'],
        },
      },
      {
        id: 'called',
        label: 'Called',
        short: 'It is what you are for',
        description:
          'The work and the capacity line up, and the reason you are doing it is not circumstantial. The remaining work is the harder half: doing it well enough to deserve it, and staying honest while it gets comfortable.',
        shadow: 'Certainty about the calling replacing attention to the doing.',
        color: 'emerald',
        masters: ['karma', 'jnana'],
        calibration: {
          dimensions: { action: 0.4, spirit: 0.3, connection: 0.2 },
          practiceLevels: { karma: 2, jnana: 1 },
          domainStress: { work: 'work-career' },
          tags: ['work', 'vocation'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'legacy-question',
    title: 'Legacy question',
    subtitle: 'What remains when you are gone',
    module: 'Launch',
    tradition: 'vedic',
    dimensionCategory: 'action',
    coverEmoji: '🕰️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'The word legacy makes people reach for being remembered, which is one of two possible readings and usually the less interesting one.\n\nThe other reading is: what is still working after you stop being the one working on it.',
    dimensions: ['unconsidered', 'performative', 'intended', 'embodied'],
    engineHooks: {
      practiceAffinity: ['karma', 'jnana'],
      deepensWith: ['work-dharma', 'liberation-aim'],
    },
    questions: [
      q3(
        'legacy-thought',
        'consideration',
        'Have you ever thought about what would be left behind?',
        'How seriously have you asked?',
        'Most people have not. That is worth knowing without it being a failing — it is a question that usually arrives uninvited at some point.',
        scale(
          ['Never, and I avoid it', 'Occasionally', 'Sometimes, briefly', 'I have thought about it properly', 'It runs in the background constantly'],
          ['never', 'rare', 'occasional', 'considered', 'constant'],
        ),
      ),
      q3(
        'legacy-frame',
        'framing',
        'Is this about being remembered, or about being useful?',
        'Which is it?',
        'Being remembered and being useful are genuinely different, and they lead to very different decisions about what to build.',
        pickOne(
          ['Being remembered', 'Being useful to people after me', 'Both, and they are the same to me', 'Neither — I have not thought in those terms', 'Something else entirely'],
          ['memory', 'utility', 'both', 'unframed', 'other'],
        ),
      ),
      q3(
        'legacy-building',
        'practice',
        'Is anything you are building going to work without you?',
        'Does what you build run without you?',
        'This is the practical version of the question, and it is a much better test than the abstract one.',
        scale(
          ['Everything stops when I stop', 'Almost everything', 'Some of it, in time', 'Most of it runs', 'I have built things specifically to outlast me'],
          ['none', 'little', 'some', 'most', 'deliberate'],
        ),
      ),
      q3(
        'legacy-obligation',
        'weight',
        'Does the question carry guilt?',
        'How heavy is it?',
        'Legacy is usually neutral. When it is heavy, it has usually become about worth rather than about what remains.',
        scale(
          ['It is not something I carry', 'It sits there quietly', 'It is a background pressure', 'It has become a responsibility', 'It is the main thing driving me'],
          ['none', 'light', 'background', 'responsibility', 'driving'],
        ),
      ),
      q3(
        'legacy-burden',
        'handover',
        'Would you be comfortable with someone else carrying this on?',
        'Could anyone else hold it?',
        'The test of whether something is truly yours is whether it can be carried by someone else. This asks whether you have let it be.',
        pickOne(
          ['No — and I would not want them to', 'No — I have not let anyone near it', 'Possibly, to one person', 'Yes, and the thought relieves me', 'I have actively handed it on'],
          ['hoarding', 'possessive', 'limited', 'open', 'handed'],
        ),
      ),
      q3(
        'legacy-scale',
        'proportion',
        'How much of your effort goes toward things that will outlast you?',
        'How much of the work is for later?',
        'Some of this is unavoidable. The question is whether it is being chosen or inherited by default.',
        scale(
          ['Almost none of it', 'A small amount', 'About a quarter', 'A substantial part', 'Most of it'],
          ['none', 'little', 'quarter', 'substantial', 'most'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'unconsidered',
        label: 'Unconsidered',
        short: 'The question has not been asked',
        description:
          'You have not seriously considered what remains, and you actively avoid the topic. This is the most common state and it carries no guilt — it is simply unexamined, and the avoidance is itself information about the relationship with mortality.',
        shadow: 'Equating not having thought about it with not caring.',
        color: 'slate',
        masters: ['jnana', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.2, spirit: 0.2 },
          practiceLevels: { jnana: 1, witnessing: 1 },
          tags: ['legacy', 'unconsidered'],
        },
      },
      {
        id: 'performative',
        label: 'Performative',
        short: 'It is about being remembered',
        description:
          'The question is framed around visibility after death, and it is doing something for how you see yourself now. That is human and normal. It is also worth noticing how little of it is actually about anyone else.',
        shadow: 'Legacy as reassurance about your own standing.',
        color: 'violet',
        masters: ['jnana', 'karma'],
        calibration: {
          dimensions: { connection: 0.25, thought: 0.2, action: 0.15 },
          practiceLevels: { jnana: 1, karma: 1 },
          tags: ['legacy', 'memory'],
        },
      },
      {
        id: 'intended',
        label: 'Intended',
        short: 'You are building something on purpose',
        description:
          'There is a real intention behind what you leave, and you are making choices with the outlasting in mind. The useful next step is the harder one: letting go of it well enough that it can actually function.',
        shadow: 'Building something you are not willing to hand on.',
        color: 'teal',
        masters: ['karma', 'work-career'],
        calibration: {
          dimensions: { action: 0.35, connection: 0.25, spirit: 0.2 },
          practiceLevels: { karma: 1, 'work-career': 1 },
          domainStress: { work: 'work-career' },
          tags: ['legacy', 'intentional'],
        },
      },
      {
        id: 'embodied',
        label: 'Embodied',
        short: 'It already runs without you',
        description:
          'What you are building works independently of you, and the thought of that is settling rather than heavy. This is the mature form of the question, and it usually arrives with a genuine engagement with your own mortality.',
        shadow: 'Equating the work outlasting you with you outlasting.',
        color: 'emerald',
        masters: ['karma', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.35, action: 0.3, connection: 0.2 },
          practiceLevels: { karma: 2, witnessing: 1 },
          tags: ['legacy', 'released'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'community-rooting',
    title: 'Community rooting',
    subtitle: 'Your sangha — the ones who see you',
    module: 'Launch',
    tradition: 'vedic',
    dimensionCategory: 'connection',
    coverEmoji: '🪷',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Sangha is not a group of like-minded people. It is the specific people who see the whole of you, including the parts you have not shown anyone.\n\nThat is a much shorter list than most people think, and the count is the finding.',
    dimensions: ['isolated', 'surface-level', 'belonging', 'rooted'],
    engineHooks: {
      loopsToCheck: ['isolation'],
      practiceAffinity: ['relationship', 'bhakti'],
      deepensWith: ['service-radius', 'trust-baseline'],
    },
    questions: [
      q3(
        'community-count',
        'depth',
        'How many people know the whole of you?',
        'The real number, not the number of people you talk to.',
        'Contacts, acquaintances, friends, confidants — the difference is the whole question. How many know the parts you have not shown?',
        scale(
          ['None', 'One, and it is not who I would choose', 'One or two', 'A few, and I would be surprised if anything changed for them', 'Enough that I am not managing how I come across'],
          ['none', 'one', 'few', 'several', 'many'],
        ),
      ),
      q3(
        'community-given',
        'generosity',
        'What do you give to them, and what do you get?',
        'Is it reciprocal, and does it need to be?',
        'Community is a practice of mutuality. Look at the exchange rather than the affection.',
        pickOne(
          ['I give more than I get', 'I get more than I give', 'It is roughly even', 'We give each other different things', 'I am not sure it works like that'],
          ['deficit', 'surplus', 'even', 'differential', 'unclear'],
        ),
      ),
      q3(
        'community-chosen',
        'formation',
        'Did you find them, or did they find you?',
        'Which way did it go?',
        'Communities formed around shared practice tend to be chosen. Ones formed around shared history are usually inherited. Both can be real.',
        scale(
          ['I have not had this', 'They arrived, and I did not choose it', 'A bit of both', 'I looked for it deliberately', 'It grew out of something I did not plan'],
          ['none', 'happened', 'mixed', 'chosen', 'emergent'],
        ),
      ),
      q3(
        'community-seen',
        'exposure',
        'How comfortable is it to be fully seen?',
        'How do you feel about being known completely?',
        'Being rooted requires being known, and being known is uncomfortable for most people for reasons that are worth looking at.',
        scale(
          ['I avoid it entirely', 'It is uncomfortable', 'I tolerate it in a few people', 'I find it mostly fine', 'I would rather be known than not'],
          ['avoidant', 'uncomfortable', 'tolerable', 'comfortable', 'preferred'],
        ),
      ),
      q3(
        'community-practice',
        'rhythm',
        'Is there anything you do together, regularly?',
        'Is there a shared rhythm?',
        'A sangha is held by what it does together, not by what it believes together. Is there anything?',
        pickOne(
          ['Nothing — it is purely social', 'Occasionally, when something comes up', 'There is a regular thing, loosely', 'Something regular and reliable', 'A real shared practice with a rhythm'],
          ['social', 'occasional', 'loose', 'regular', 'practised'],
        ),
      ),
      q3(
        'community-loss',
        'fragility',
        'What would you do if the circle dissolved?',
        'How load-bearing is it?',
        'A circle that everything rests on is fragile in a way that is invisible while it holds. What happens if it does not?',
        scale(
          ['It would be a real loss, and survivable', 'It would be very difficult', 'I do not know what I would do', 'I would be devastated', 'I have thought about this and have other footing'],
          ['moderate', 'high', 'severe', 'severe', 'grounded'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'isolated',
        label: 'Isolated',
        short: 'No one has the whole picture',
        description:
          'There is no one who sees all of you. This is the most common reading and the most uncomfortable, because it is usually disguised by a large number of contacts. The count, not the loneliness, is the finding.',
        shadow: 'Number of contacts mistaken for depth of connection.',
        color: 'rose',
        masters: ['relationship', 'bhakti'],
        calibration: {
          dimensions: { connection: 0.4, emotion: 0.2 },
          practiceLevels: { relationship: 1, bhakti: 1 },
          domainStress: { contact: 'relationship' },
          tags: ['community', 'isolated'],
        },
      },
      {
        id: 'surface-level',
        label: 'Surface level',
        short: 'Contacts, without the one who sees everything',
        description:
          'You are well-connected and reasonably known — just not all the way. There are one or two people close to it, and the gap between what they know and what they would know is where the work is.',
        shadow: 'Depth with a few people being assumed to cover the rest.',
        color: 'slate',
        masters: ['relationship', 'witnessing'],
        calibration: {
          dimensions: { connection: 0.3, emotion: 0.2 },
          practiceLevels: { relationship: 1, witnessing: 1 },
          domainStress: { contact: 'relationship' },
          tags: ['community', 'partial'],
        },
      },
      {
        id: 'belonging',
        label: 'Belonging',
        short: 'A circle that holds you',
        description:
          'There is a real circle and you are properly inside it. The next thing worth examining is fragility — how much of your own stability depends on the circle continuing to exist as it is.',
        shadow: 'Mistaking a supportive circle for a permanent one.',
        color: 'teal',
        masters: ['relationship', 'bhakti'],
        calibration: {
          dimensions: { connection: 0.35, emotion: 0.25, spirit: 0.15 },
          practiceLevels: { relationship: 2, bhakti: 1 },
          tags: ['community', 'belonging'],
        },
      },
      {
        id: 'rooted',
        label: 'Rooted',
        short: 'Rooted, and not entirely dependent on it',
        description:
          'You are rooted — genuinely known, with a shared rhythm — and the root does not depend entirely on the circle holding. This is what sangha is actually for, and it is the position the tradition treats as mature.',
        shadow: 'Assuming the circle will always be available.',
        color: 'emerald',
        masters: ['relationship', 'witnessing'],
        calibration: {
          dimensions: { connection: 0.35, spirit: 0.3, emotion: 0.2 },
          practiceLevels: { relationship: 2, witnessing: 1 },
          tags: ['community', 'rooted'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'ritual-life',
    title: 'Ritual life',
    subtitle: 'The sacred rhythms you keep',
    module: 'Launch',
    tradition: 'vedic',
    dimensionCategory: 'spirit',
    coverEmoji: '🪔',
    estimatedMinutes: 5,
    version: 1,
    intro:
      'Ritual is the one practice that requires no belief to work. You do not have to think a lamp means anything for it to change the room.\n\nWhat is worth looking at is which of your rhythms are actually sacred, as opposed to merely repeated.',
    dimensions: ['none', 'occasional', 'inherited', 'chosen-and-kept'],
    engineHooks: {
      practiceAffinity: ['raja', 'tantra'],
      deepensWith: ['awe-frequency', 'svadhyaya'],
    },
    questions: [
      q3(
        'ritual-what',
        'inventory',
        'Is there anything you do regularly that has meaning to you?',
        'What is on the list?',
        'Not routine — the things where the doing matters more than the doing-about.',
        pickOne(
          ['Nothing I would call ritual', 'One or two, occasionally', 'A few, from my family or culture', 'Several, and I keep them', 'A daily rhythm with clear anchors'],
          ['none', 'occasional', 'inherited', 'kept', 'daily'],
        ),
      ),
      q3(
        'ritual-origin',
        'source',
        'Where did it come from — you, or someone before you?',
        'Did you choose it?',
        'Inherited ritual is not worse than chosen ritual. It is only unexamined, and there is one thing worth knowing about your own relationship to it.',
        pickOne(
          ['Entirely inherited', 'Mostly inherited', 'A mix of both', 'Mostly chosen by me', 'Chosen, and I would defend it'],
          ['inherited', 'inherited', 'mixed', 'chosen', 'chosen'],
        ),
      ),
      q3(
        'ritual-effect',
        'effect',
        'Does it change anything, or is it a form?',
        'What does it do to the room you are in?',
        'The honest test is whether the state afterwards differs. A ritual with no effect is a habit, and habits are still fine — they are just not this.',
        scale(
          ['No effect that I can detect', 'A slight shift in mood', 'It does settle me', 'It changes how the rest of the day goes', 'I would not know how to start the day without it'],
          ['none', 'slight', 'settles', 'shapes', 'structural'],
        ),
      ),
      q3(
        'ritual-kept',
        'continuity',
        'Do you keep it when it is inconvenient?',
        'What happens when it gets in the way?',
        'A ritual that only survives easy weeks is a preference. The inconvenient ones are the ones that have been kept on purpose.',
        scale(
          ['I drop it without a thought', 'It slips whenever it clashes', 'I keep it most of the time', 'I keep it, and it costs me something', 'I would rearrange other things around it'],
          ['drops', 'slips', 'mostly', 'kept', 'kept-first'],
        ),
      ),
      q3(
        'ritual-alone',
        'solitary',
        'Do you do any of it alone?',
        'Is any of it only for you?',
        'Ritual done alone and unwitnessed is a much stronger indicator of it being real, because there is no audience to perform for.',
        scale(
          ['All of it is with other people', 'Mostly with others', 'Some alone, some together', 'Most of it alone', 'Entirely alone, by choice'],
          ['social', 'social', 'mixed', 'mostly-solo', 'solo'],
        ),
      ),
      q3(
        'ritual-gap',
        'break',
        'What happens to you when the rhythm breaks?',
        'What does the interruption feel like?',
        'The size of the gap is a measure of how much was actually there.',
        scale(
          ['Nothing noticeable', 'Minor irritation', 'I miss it clearly', 'It disrupts me more than I would expect', 'The break is genuinely disorienting'],
          ['none', 'minor', 'clear', 'strong', 'disorienting'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'none',
        label: 'None',
        short: 'No deliberate rhythm',
        description:
          'There is no ritual structure in your life. Nothing is wrong and there is no requirement for one. It is worth noticing, though, that this reading tends to pair with a life that is quite continuous — and that continuity is its own kind of unconscious ritual.',
        shadow: 'Mistaking consistency for intentionality.',
        color: 'slate',
        masters: ['observation', 'raja'],
        calibration: {
          dimensions: { spirit: 0.2, thought: 0.2 },
          practiceLevels: { observation: 1, raja: 1 },
          tags: ['ritual', 'none'],
        },
      },
      {
        id: 'occasional',
        label: 'Occasional',
        short: 'Something, at intervals',
        description:
          'There is something — a few times a year, perhaps — that has meaning and is not repeated. The inconsistency is the interesting part: what stops it from being regular is usually a decision, not an obstacle.',
        shadow: 'Keeping something sacred only when it is convenient.',
        color: 'amber',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.25, emotion: 0.15 },
          practiceLevels: { raja: 1, witnessing: 1 },
          tags: ['ritual', 'intermittent'],
        },
      },
      {
        id: 'inherited',
        label: 'Inherited',
        short: 'It came from someone before you',
        description:
          'You have a real rhythm and it came from your family or your culture. This is a genuine practice, and the only question is whether you have ever made it yours rather than simply continuing it.',
        shadow: 'Keeping something because stopping would mean something.',
        color: 'sky',
        masters: ['bhakti', 'raja'],
        calibration: {
          dimensions: { spirit: 0.3, connection: 0.25, emotion: 0.2 },
          practiceLevels: { bhakti: 1, raja: 1 },
          tags: ['ritual', 'inherited'],
        },
      },
      {
        id: 'chosen-and-kept',
        label: 'Chosen and kept',
        short: 'Yours, and you keep it when it costs you',
        description:
          'The rhythm is yours, you chose it, and you keep it when it is inconvenient. That last part is what separates ritual from a preference, and it is the reason the effect tends to be real.',
        shadow: 'The rhythm becoming the thing the life is organised around.',
        color: 'emerald',
        masters: ['raja', 'tantra'],
        calibration: {
          dimensions: { spirit: 0.4, body: 0.25, thought: 0.15 },
          practiceLevels: { raja: 2, tantra: 1 },
          tags: ['ritual', 'kept'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'awe-frequency',
    title: 'Awe frequency',
    subtitle: 'How often wonder finds you',
    module: 'Launch',
    dimensionCategory: 'spirit',
    coverEmoji: '✨',
    estimatedMinutes: 5,
    version: 1,
    intro:
      'Awe is the feeling that something is larger than you and you are nonetheless part of it. Most people have it as a visitor rather than a resident.\n\nThe question is not whether you feel it. It is whether you can call it.',
    dimensions: ['rare', 'occasional', 'regular', 'constant'],
    engineHooks: {
      practiceAffinity: ['witnessing', 'tantra'],
      deepensWith: ['non-dual-glimpses', 'awe-frequency'],
    },
    questions: [
      q3(
        'awe-how',
        'frequency',
        'How often do you feel genuinely awed?',
        'How often does wonder actually arrive?',
        'Not contentment, not gratitude — the thing that briefly makes everything look enormous. How often?',
        scale(
          ['Almost never', 'A few times a year', 'A few times a month', 'Most weeks, in small ways', 'It is close to the default state'],
          ['rare', 'rare', 'occasional', 'regular', 'constant'],
        ),
      ),
      q3(
        'awe-trigger',
        'source',
        'What brings it, when it comes?',
        'What is the door?',
        'Everyone has a route in — nature, music, scale, another person, silence, difficulty. Yours is worth knowing.',
        pickOne(
          ['I could not say — it just happens', 'Nature, mostly', 'Music or art', 'Other people', 'Scale — the size or the smallness of something'],
          ['unknown', 'nature', 'art', 'relational', 'sublime'],
        ),
      ),
      q3(
        'awe-call',
        'invitation',
        'Can you bring it on deliberately?',
        'Is it available on request?',
        'Awe is usually treated as uninvitable. It is partially invitable, and what makes it partially invitable is exposure rather than effort.',
        scale(
          ['Not at all', 'Rarely, and by accident', 'Sometimes, with the right setting', 'Fairly reliably', 'I can get there fairly deliberately'],
          ['no', 'accidental', 'sometimes', 'reliable', 'deliberate'],
        ),
      ),
      q3(
        'awe-disappear',
        'fading',
        'What makes it go away?',
        'What ends it?',
        'Most things that produce awe also end it, usually by becoming familiar. Knowing your own version of that is useful.',
        pickOne(
          ['Getting used to it', 'Interrupting me', 'Crowds or noise', 'My own thoughts', 'Nothing, once it is there it stays a while'],
          ['familiarity', 'interruption', 'environment', 'mind', 'persists'],
        ),
      ),
      q3(
        'awe-trend',
        'direction',
        'Is it happening more or less than it used to?',
        'Which direction?',
        'For most people this moves in one direction, and it moves with how much attention they are paying.',
        scale(
          ['Much less than it used to', 'Somewhat less', 'About the same', 'Somewhat more', 'Far more than it used to'],
          ['less', 'less', 'same', 'more', 'more'],
        ),
      ),
      q3(
        'awe-shared',
        'communication',
        'Do you say it out loud, or keep it to yourself?',
        'Does it get spoken?',
        'Awe is nearly always solitary. Whether it gets shared changes what it does — including for you.',
        pickOne(
          ['I keep it entirely to myself', 'Rarely — it feels like too much', 'Sometimes, with the right person', 'I share it fairly freely', 'It is one of the main things I talk about'],
          ['private', 'private', 'selective', 'shared', 'central'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'rare',
        label: 'Rare',
        short: 'Wonder is a visitor you do not expect',
        description:
          'Awe is genuinely rare for you, and this usually tracks with how much of your attention is taken up by the practical. It is the most fixable of the four, because the intervention is exposure rather than effort.',
        shadow: 'Reading the absence of awe as the absence of something in you.',
        color: 'slate',
        masters: ['witnessing', 'body'],
        calibration: {
          dimensions: { spirit: 0.3, body: 0.2, thought: 0.15 },
          practiceLevels: { witnessing: 1, body: 1 },
          tags: ['awe', 'rare'],
        },
      },
      {
        id: 'occasional',
        label: 'Occasional',
        short: 'It finds you, a few times a month',
        description:
          'Awe arrives on its own now and then, and you have no real control over when. The natural next step is to look at what is reliably present in those moments — there is usually a pattern.',
        shadow: 'Waiting for it instead of noticing what invites it.',
        color: 'amber',
        masters: ['witnessing', 'raja'],
        calibration: {
          dimensions: { spirit: 0.35, emotion: 0.2 },
          practiceLevels: { witnessing: 1, raja: 1 },
          tags: ['awe', 'occasional'],
        },
      },
      {
        id: 'regular',
        label: 'Regular',
        short: 'It is part of the week',
        description:
          'Awe is a regular part of your life and you have begun to recognise what invites it. The work at this stage is durability — keeping it while everything else is demanding.',
        shadow: 'Losing the edge through routine.',
        color: 'teal',
        masters: ['witnessing', 'tantra'],
        calibration: {
          dimensions: { spirit: 0.4, emotion: 0.2, body: 0.15 },
          practiceLevels: { witnessing: 2, raja: 1 },
          tags: ['awe', 'regular'],
        },
      },
      {
        id: 'constant',
        label: 'Constant',
        short: 'Close to the default state',
        description:
          'Wonder is close to continuous for you. This is worth handling carefully: a state that is always available can stop registering, and there is a version of this that is really a way of not being present to what is ordinary.',
        shadow: 'Permanence dulling the thing it was protecting.',
        color: 'indigo',
        masters: ['witnessing', 'tantra'],
        calibration: {
          dimensions: { spirit: 0.45, body: 0.2 },
          practiceLevels: { witnessing: 2, tantra: 1 },
          tags: ['awe', 'constant'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'non-dual-glimpses',
    title: 'Non-dual glimpses',
    subtitle: 'Flashes of unity',
    module: 'Launch',
    tradition: 'vedic',
    dimensionCategory: 'spirit',
    coverEmoji: '∞',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'A glimpse is a brief, unarguable experience of unity that cannot be sustained and is not always welcome afterwards.\n\nThe important distinction is between having had one, having heard about one, and being able to recognise one in the moment.',
    dimensions: ['never', 'concept-only', 'brief-glimpses', 'recurring'],
    engineHooks: {
      practiceAffinity: ['witnessing', 'jnana'],
      deepensWith: ['liberation-aim', 'meditation-depth'],
    },
    questions: [
      q3(
        'nondual-experience',
        'history',
        'Have you ever directly experienced unity — not thought about it, had it?',
        'Direct experience, not the idea. Which is it?',
        'The distinction matters more than it sounds, because the idea of unity is genuinely powerful and genuinely not the same thing.',
        scale(
          ['No, and I have not thought much about it', 'I know the idea well', 'I have had something close, but I would not call it that', 'Yes, unmistakably', 'Yes, and I have never entirely come back'],
          ['never', 'concept', 'close', 'glimpsed', 'profound'],
        ),
      ),
      q3(
        'nondual-duration',
        'duration',
        'How long did it last?',
        'How long, honestly?',
        'The duration is what makes the rest of the problem the rest of the problem.',
        scale(
          ['Not applicable', 'An instant', 'A few seconds', 'A minute or so', 'Long enough to lose the sense of a body and a self'],
          ['n/a', 'instant', 'seconds', 'minute', 'extended'],
        ),
      ),
      q3(
        'nondual-after',
        'aftermath',
        'What happened in the hours and days after?',
        'What is the after?',
        'The aftermath is more informative than the event, and it is where most people form their conclusions about whether it was real.',
        scale(
          ['Not applicable', 'A strange elevation for a day', 'A long depression', 'Clarity that stayed', 'The world looked wrong for weeks and I could not explain why'],
          ['n/a', 'elevated', 'low', 'clear', 'dislocated'],
        ),
      ),
      q3(
        'nondual-invite',
        'invitation',
        'Can you invite it deliberately?',
        'Is it reachable?',
        'The traditional answer is that it cannot be produced, only permitted. The practical answer is that conditions can be arranged.',
        scale(
          ['Not applicable', 'I have not tried', 'Rarely, and I cannot tell if I caused it', 'Sometimes, with the right conditions', 'I can get close to the threshold fairly reliably'],
          ['n/a', 'untried', 'rarely', 'sometimes', 'reliably'],
        ),
      ),
      q3(
        'nondual-language',
        'framing',
        'When you talk about it, is it an experience or a concept?',
        'How do you hold it?',
        'A great deal of what circulates as non-duality is philosophy. Philosophy about it is not nothing, but it is not the same as the event.',
        pickOne(
          ['I do not really talk about it', 'As a philosophy, and I value it', 'As something I have read about', 'As something I have had', 'As the most real thing available, and everything else is the abstraction'],
          ['silent', 'philosophy', 'secondhand', 'experienced', 'foundational'],
        ),
      ),
      q3(
        'nondual-fear',
        'relation',
        'Does the idea frighten you at all?',
        'Is there any resistance?',
        'Resistance to unity is one of the most reliable findings across traditions, and it is worth locating rather than being surprised by.',
        scale(
          ['No resistance at all', 'Slight unease', 'It makes me uneasy', 'It frightens me', 'I avoid the whole subject and prefer not to think about why'],
          ['none', 'slight', 'uneasy', 'fearful', 'avoidant'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'never',
        label: 'Never',
        short: 'The idea, and not yet the event',
        description:
          'You have no direct experience of unity, which is entirely ordinary and is not a spiritual deficiency — it is a description of a life. Most traditions treat the concept before the event, and the concept is not wasted.',
        shadow: 'Reading a description as though it were the thing.',
        color: 'slate',
        masters: ['jnana', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.2 },
          practiceLevels: { jnana: 1, witnessing: 1 },
          tags: ['non-dual', 'not-yet'],
        },
      },
      {
        id: 'concept-only',
        label: 'Concept only',
        short: 'You know it well and have not met it',
        description:
          'The philosophy is familiar and the event has not arrived. This is a normal and slightly uncomfortable position, because the concept creates an expectation that the experience then fails to meet.',
        shadow: 'Anticipating an event rather than living toward it.',
        color: 'sky',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.25 },
          practiceLevels: { jnana: 1, 'self-inquiry': 1 },
          tags: ['non-dual', 'conceptual'],
        },
      },
      {
        id: 'brief-glimpses',
        label: 'Brief glimpses',
        short: 'You have met it, briefly',
        description:
          'There have been real, unarguable flashes and they were short. The aftermath is the live question — what follows one determines whether there will be another.',
        shadow: 'Wanting the next one before the last one has been understood.',
        color: 'teal',
        masters: ['witnessing', 'raja'],
        calibration: {
          dimensions: { spirit: 0.4, emotion: 0.2 },
          practiceLevels: { witnessing: 2 },
          tags: ['non-dual', 'glimpsed'],
        },
      },
      {
        id: 'recurring',
        label: 'Recurring',
        short: 'It keeps coming back, and it takes something with it',
        description:
          'The glimpses recur and something is different afterwards each time. The difficulty has shifted from whether this is real to what a life organised around it actually looks like.',
        shadow: 'Building a life around an experience rather than in it.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.45, thought: 0.2, body: 0.15 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          tags: ['non-dual', 'recurring'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'liberation-aim',
    title: 'Liberation aim',
    subtitle: 'Mokṣa — your orientation to freedom',
    module: 'Launch',
    tradition: 'vedic',
    dimensionCategory: 'spirit',
    coverEmoji: '🕉️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Mokṣa means release. The tradition is precise that liberation is not a better life, a better body, or a better set of circumstances — it is release from the assumption that you are any of those things.\n\nWhich is exactly why the last question is what freedom means to you, specifically.',
    dimensions: ['comfort', 'improvement', 'release-from-samsara', 'moksha-as-inquiry'],
    engineHooks: {
      practiceAffinity: ['jnana', 'witnessing'],
      deepensWith: ['non-dual-glimpses', 'vairagya'],
    },
    questions: [
      q3(
        'liberation-meaning',
        'definition',
        'When you hear "freedom", what do you picture?',
        'What does freedom mean to you, concretely?',
        'Not in the abstract. Picture the actual state of affairs you would be free in.',
        pickOne(
          ['Not having to worry about money or obligations', 'Being well and unimpeded', 'Free of this cycle of wanting and being disappointed', 'Free of the sense of being a separate self at all', 'I do not have a picture, and I am not sure I want one'],
          ['comfort', 'health', 'release', 'non-dual', 'open'],
        ),
      ),
      q3(
        'liberation-fear',
        'cost',
        'What would you have to give up to get it?',
        'What is on the bill?',
        'Every conception of freedom has a price. What does yours?',
        pickOne(
          ['Nothing — it is a gain', 'Certain attachments', 'Certain relationships', 'The whole identity built around it', 'I have not thought that far'],
          ['free', 'attachments', 'relationships', 'identity', 'unexamined'],
        ),
      ),
      q3(
        'liberation-escape',
        'distinction',
        'Is this freedom from something, or freedom to do something?',
        'From, or to?',
        'These are different projects with different methods, and the tradition is mostly interested in the first.',
        pickOne(
          ['Freedom from — getting out of something', 'Freedom to — being able to do or have something', 'Both, roughly equally', 'Neither framing quite fits', 'I have never separated the two'],
          ['from', 'to', 'both', 'neither', 'unexamined'],
        ),
      ),
      q3(
        'liberation-life',
        'priority',
        'How much of your actual life is aimed at this?',
        'What is the actual priority?',
        'Not what you would like it to be. What it actually is, when the practical decisions get made.',
        scale(
          ['None of it', 'Occasionally, in principle', 'As a background intention', 'It shapes most of my decisions', 'It is essentially the only thing I am doing'],
          ['none', 'occasional', 'background', 'driving', 'total'],
        ),
      ),
      q3(
        'liberation-body',
        'identity',
        'What do you think you would be, without the body and history?',
        'What remains?',
        'The question is unanswerable and asking it honestly is the point. What is your answer, such as it is?',
        pickOne(
          ['Nothing — I would not be anything', 'The same person, without the body', 'Some kind of awareness, but not a person', 'I cannot even pose it without flinching', 'I do not know, and I have stopped needing to'],
          ['nothing', 'same', 'awareness', 'resistant', 'open'],
        ),
      ),
      q3(
        'liberation-competing',
        'comparison',
        'Do you actually want it, or do you want to be the kind of person who has it?',
        'Which is it?',
        'The tradition is unusually direct that the second is the more common motive and the more difficult one to work with.',
        scale(
          ['I want it', 'I want it, and I also want to be seen wanting it', 'Honestly, the second is stronger', 'I do not know any more', 'I am fairly sure the second has been running it'],
          ['genuine', 'mixed', 'second', 'uncertain', 'second-dominant'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'comfort',
        label: 'Comfort',
        short: 'Freedom as the absence of difficulty',
        description:
          'Freedom here means life being easier. That is a real and legitimate aim and it is worth noticing that it is a different project from mokṣa, which is why relief practices help and liberation practices may not land.',
        shadow: 'Reading relief as release.',
        color: 'slate',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.3, emotion: 0.2, spirit: 0.1 },
          practiceLevels: { body: 1, breath: 1 },
          domainStress: { health: 'health' },
          tags: ['moksha', 'comfort'],
        },
      },
      {
        id: 'improvement',
        label: 'Improvement',
        short: 'Freedom as a better version of this',
        description:
          'You want a life that is better rather than a self that is released. The tradition treats this as an entirely natural stage and warns only against mistaking progress for arrival.',
        shadow: 'Mistaking the better life for the freed one.',
        color: 'amber',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { action: 0.3, emotion: 0.2, thought: 0.2 },
          practiceLevels: { raja: 1, karma: 1 },
          domainStress: { work: 'work-career' },
          tags: ['moksha', 'improvement'],
        },
      },
      {
        id: 'release-from-samsara',
        label: 'Release',
        short: 'Free of the wanting-and-being-disappointed cycle',
        description:
          'You have identified the actual loop, which is the wanting followed by the disappointment followed by the wanting. That identification is most of what any path asks for, and it is not a small thing.',
        shadow: 'Confusing the end of wanting with the absence of everything.',
        color: 'teal',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.35, emotion: 0.25, thought: 0.15 },
          practiceLevels: { witnessing: 1 },
          tags: ['moksha', 'release'],
        },
      },
      {
        id: 'moksha-as-inquiry',
        label: 'The inquiry itself',
        short: 'Not a destination — the question, kept open',
        description:
          'The aim has stopped being a state to reach and become the question being held. The tradition treats this as the most honest available position, and as the one least likely to produce either satisfaction or despair.',
        shadow: 'An inquiry that has become an identity of its own.',
        color: 'emerald',
        masters: ['jnana', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.45, thought: 0.25 },
          practiceLevels: { jnana: 2, witnessing: 1 },
          tags: ['moksha', 'inquiry'],
        },
      },
    ],
  },
];
