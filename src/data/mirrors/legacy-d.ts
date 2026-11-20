/**
 * LEGACY SET D · the four banks between checkpoint 1 and the closing mirrors
 *
 * These four were, until now, only reachable as slugs: present in
 * `DB_RESIDENT_SLUGS`, absent from the registry, and therefore invisible to the
 * Library and to the coverage gate. Two of them sit at the very edges of the
 * journey — the first checkpoint and the last-but-one — and the other two
 * (`chakra-balance`, `money-psyche`) are the only places the library talks about
 * where energy sits and what it thinks money is.
 *
 *   loop-map         the first checkpoint; also routed through
 *                    `LoopMappingQuestionnaire` in the journey UI, and still
 *                    listed in the Library, so it needs a bank like the rest.
 *   chakra-balance   a working map of the seven centres, not anatomy.
 *   money-psyche     the money relationship, described without a verdict on
 *                    what the reader has.
 *   death-awareness  the most delicate subject in the library. Plain,
 *                    matter-of-fact, not frightening, not consoling, not an
 *                    instruction. The question is what your relationship to it
 *                    is like; the reading describes what that is.
 *
 * Surface tier stays external and situational. Core tier names the mechanism
 * and turns the lens back on the one asking. No end of any axis is presented as
 * the correct one to be at.
 */

import { q3, pickOne, likert5, scale, type MirrorBank } from './types';

export const LEGACY_D_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'loop-map',
    title: 'Loop map',
    subtitle: 'The patterns that actually run you',
    module: 'Welcome',
    tradition: 'vedic',
    dimensionCategory: 'shadow',
    coverEmoji: '🔁',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'A loop is a sequence that has been walked often enough to be easy — easy to enter, hard to see while you are in it. Most of what runs a life was never chosen; it was installed by repetition, one ordinary repetition at a time.\n\nThis does not ask you to name anything. It asks how much of your own pattern is legible to you right now, because that is the variable that decides what can be worked with and what cannot yet be reached.',
    dimensions: ['none', 'hinted', 'named', 'mapped'],
    engineHooks: {
      loopsToCheck: ['reactivity', 'avoidance', 'approval-seeking'],
      practiceAffinity: ['loop-dissolution', 'witnessing'],
      deepensWith: ['reactivity-score', 'inherited-loops'],
    },
    questions: [
      q3(
        'loop-notice',
        'in the moment',
        'While you are in it, how clearly do you see what you are doing?',
        'How much of the pattern is visible to you while it is running, rather than afterwards?',
        'The distance between being inside a sequence and seeing it is where most of a life gets spent. How wide is that distance for you?',
        scale(
          [
            'I do not notice it until it has finished',
            'I notice something is happening but not what',
            'I can name what is happening as it happens',
            'I can see the whole sequence while I am in it',
          ],
          ['none', 'hinted', 'named', 'mapped'],
        ),
      ),
      q3(
        'loop-words',
        'language',
        'If someone asked you what your worst habit is, what could you say?',
        'How readily can you put your own pattern into words?',
        'A pattern you can say in one sentence is a different thing from a pattern you can only feel. Where is yours?',
        likert5('named', [
          'I would not know where to start',
          'Something vague, if pressed',
          'I could name it roughly',
          'I can describe it accurately',
          'I can say it in a single sentence, and someone would recognise it',
        ]),
      ),
      q3(
        'loop-start',
        'onset',
        'Can you tell where a pattern begins, or only how it ends?',
        'How much of the sequence is in front of you when it starts?',
        'Every loop has a point of no return a short way in, where continuing becomes easier than stopping. Can you see that point while it is still ahead of you?',
        scale(
          [
            'I only ever see it afterwards',
            'I can tell it has started, but not what it is',
            'I can see it starting and know roughly what follows',
            'I can see the start and most of what comes after',
            'I can see the start, the turn, and the place where it stops being able to stop',
          ],
          ['none', 'hinted', 'named', 'mapped'],
        ),
      ),
      q3(
        'loop-others',
        'in others',
        'Do you recognise the same pattern in people around you?',
        'When someone else is inside one of your loops, do you see it?',
        'A pattern you can only recognise in yourself stays private, and a private pattern has no counter-example. How far does yours carry?',
        scale(
          [
            'Not at all — that only happens to me',
            'Occasionally, once it is under way',
            'I recognise it early, most times',
            'I see it in people I have only just met',
          ],
          ['none', 'hinted', 'named', 'mapped'],
        ),
      ),
      q3(
        'loop-interrupt',
        'interruption',
        'When a pattern is running, what can actually interrupt it?',
        'What has ever broken the sequence?',
        'Interruption is only possible from somewhere you can see. Which points in the sequence can you actually see?',
        scale(
          [
            'Nothing does, and I have stopped expecting anything to',
            'Things mostly carry me past it',
            'I can find something that works if I get there first',
            'I can see the exact moment it turns, and I am usually there in time',
          ],
          ['none', 'hinted', 'named', 'mapped'],
        ),
      ),
      q3(
        'loop-say',
        'out loud',
        'Would you say it out loud, if it came up?',
        'What does saying a pattern out loud cost you?',
        'There is a difference between knowing a pattern and being willing to have it in the open. Where does yours sit?',
        scale(
          [
            'I would rather it stayed unsaid',
            'I would only say it to one person, carefully',
            'I would say it if it came up naturally',
            'I can say it plainly to almost anyone',
          ],
          ['none', 'hinted', 'named', 'mapped'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'none',
        label: 'Unmapped',
        short: 'It runs, and it is not visible',
        description:
          'Nothing is being read as a pattern yet. What happens arrives as mood, as a difficult month, as a difficulty with one particular person, and it is answered with whatever the moment offers. This is not a position arrived at by choice — a sequence that has never been seen cannot be reported on, so there is nothing here to report.',
        shadow: 'Reading the absence of a map as the absence of a pattern.',
        color: 'slate',
        masters: ['observation', 'loop-dissolution'],
        calibration: {
          dimensions: { thought: 0.25, emotion: 0.2, spirit: 0.1 },
          practiceLevels: { observation: 1, 'loop-dissolution': 1 },
          tags: ['unmapped', 'unstructured'],
        },
      },
      {
        id: 'hinted',
        label: 'Felt, not named',
        short: 'There is a shape, and no word for it',
        description:
          'Something is recognisable but not yet referable. The pattern shows up as a texture — the same kind of week, the same kind of person, the same feeling on the way out of something — and it returns without being accounted for. Recognition without a name is where most of the cost sits, because there is nothing to work on yet.',
        shadow: 'Naming it early, and stopping there.',
        color: 'orange',
        masters: ['witnessing', 'loop-dissolution'],
        calibration: {
          dimensions: { thought: 0.3, emotion: 0.25, body: 0.15 },
          practiceLevels: { witnessing: 1, 'loop-dissolution': 1 },
          domainStress: { pattern: 'observation' },
          tags: ['hinted', 'unreferenced'],
        },
      },
      {
        id: 'named',
        label: 'Named',
        short: 'It can be said in a sentence',
        description:
          'The pattern can be referred to precisely enough to be discussed: where it starts, what it wants, what it costs by the end of it. This is the point at which it stops being a mood and becomes material — the first moment it can be worked with rather than only endured.',
        shadow: 'The name becoming a place to live.',
        color: 'amber',
        masters: ['loop-dissolution', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.25, action: 0.15 },
          practiceLevels: { 'loop-dissolution': 2, 'self-inquiry': 1 },
          tags: ['named', 'articulated'],
        },
      },
      {
        id: 'mapped',
        label: 'Mapped',
        short: 'You can see it from the outside',
        description:
          'The pattern is legible enough to be watched while it runs — the onset, the turn, the point where it becomes its own momentum, and the fact that it is recognisable in other people too. From here it is less a thing that happens to you than a sequence with a known shape and known handovers.',
        shadow: 'Mapping the pattern and leaving the map there.',
        color: 'emerald',
        masters: ['self-inquiry', 'loop-dissolution'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.2, action: 0.15 },
          practiceLevels: { 'loop-dissolution': 2, witnessing: 1 },
          domainStress: { pattern: 'loop-dissolution' },
          tags: ['mapped', 'sequenced'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'chakra-balance',
    title: 'Cakra balance',
    subtitle: 'Where your energy actually sits',
    module: 'Engines',
    tradition: 'yogic',
    dimensionCategory: 'vitality',
    coverEmoji: '🌈',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Seven centres, seven places where a life is felt rather than thought about. The model is a working map — a way of describing where energy moves, gathers, and stops, not a claim about the structure of a body.\n\nRead it by feel. Nothing here depends on being able to locate anything in yourself, and none of the seven is the correct one to be centred in.',
    dimensions: ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown'],
    engineHooks: {
      practiceAffinity: ['body', 'raja'],
      deepensWith: ['energy-baseline', 'pranayama-capacity'],
    },
    questions: [
      q3(
        'cakra-alive',
        'most alive',
        'Which of the seven is most alive in you?',
        'Which centre does most of your energy actually pass through?',
        'One of these is doing most of the work in your life. Which is it, and what would you lose without it?',
        pickOne(
          [
            'Rooted — steady, physical, hard to knock over',
            'Alive with wanting — drive, appetite, creative motion',
            'Warm — recognised, energised, willing to show up',
            'Tender — connected, open to others, easily moved',
            'Expressive — able to say it and be heard',
            'Perceptive — able to see what is underneath the surface',
            'Spacious — something wider than the personal, at rest',
          ],
          ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown'],
        ),
      ),
      q3(
        'cakra-blocked',
        'least available',
        'Which of the seven is least available to you?',
        'Where does energy stop, when it stops?',
        'For everyone there is a level where the movement does not arrive. It is not the weakest part of you — it is the part currently least invited. Which is it?',
        pickOne(
          [
            'Safety and footing — being steady is hard to reach for',
            'Appetite — wanting does not come easily any more',
            'Will — taking up room does not feel available',
            'Openness — letting someone close in is difficult',
            'Expression — the true thing does not reach anyone',
            'Perception — the pattern underneath is not visible',
            'Spaciousness — everything stays inside my own edges',
          ],
          ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown'],
        ),
      ),
      q3(
        'cakra-root',
        'footing',
        'How steady do you feel in your body when things are uncertain?',
        'How much of the time is there a floor to stand on?',
        'The lowest centre is about whether you can stand here without bracing. How much bracing is there in an ordinary day?',
        likert5('root', [
          'I am rarely sure where I stand',
          'I steady myself constantly without noticing',
          'I am mostly steady, and wobble occasionally',
          'I am steady in most situations',
          'I am at home in my body, and it stays that way under pressure',
        ]),
      ),
      q3(
        'cakra-solar',
        'warmth',
        'How readily do you take up space when you want something?',
        'How much of your own presence is actually available to you?',
        'This centre asks one question in several forms: are you allowed to want it. How settled is that question, most days?',
        likert5('solar', [
          'I take up no space at all',
          'Only when I cannot help it',
          'Some, when I am reasonably sure of the ground',
          'Reliably, without apologising for it',
          'I take up space with no sense of it being a risk',
        ]),
      ),
      q3(
        'cakra-throat',
        'expression',
        'When you need to ask for something, what happens?',
        'How much of what you would say actually gets said?',
        'This is the meeting point of what is true in you and what reaches anyone else. How much of it gets through?',
        likert5('throat', [
          'I say almost nothing',
          'I say things, but not the important ones',
          'I say what I mean when I have to',
          'I ask for what I need most of the time',
          'I say the true thing as soon as I know it',
        ]),
      ),
      q3(
        'cakra-crown',
        'openness',
        'How often do you feel part of something larger than yourself?',
        'How much of your life is spent inside your own edges?',
        'The top of the map is not a reward for the ones beneath it. It is only the question of how wide the edges are. How wide are yours?',
        likert5('crown', [
          'My edges are the whole of what there is',
          'Mostly I stay inside myself',
          'Sometimes I feel something beyond the personal',
          'Often, and without having to arrange it',
          'It is an ordinary condition, and rarely absent',
        ]),
      ),
      q3(
        'cakra-flow',
        'movement',
        'Where does your energy settle when you are not doing anything?',
        'Which part of you do you return to when you are tired?',
        'Energy has a habitual altitude. Where does yours sit most of the time, and can it move when something asks it to?',
        scale(
          [
            'It pools low and stays there',
            'It sits low, with some heat above it',
            'It comes up to the middle of me',
            'It rises through the throat and the head',
            'It is everywhere at once, and hard to locate',
          ],
          ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'root',
        label: 'Root',
        short: 'You can stand here',
        description:
          'There is a floor under you that does not move with the week. Stability is not stillness — it is being able to take a knock, recover, and stay in the body while it happens. From here, most of the other centres become reachable rather than aspirational.',
        shadow: 'Stability hardened into never changing.',
        color: 'slate',
        masters: ['body', 'breath'],
        calibration: {
          dimensions: { body: 0.4, thought: 0.15, emotion: 0.1 },
          practiceLevels: { body: 2, breath: 1 },
          domainStress: { ground: 'health' },
          tags: ['grounded', 'stable'],
        },
      },
      {
        id: 'sacral',
        label: 'Sacral',
        short: 'Wanting, appetite, creative motion',
        description:
          'The middle-lower centre, where wanting lives. Drive, appetite, the pull towards making something — including the desire to make a life rather than to keep one running. Its characteristic problem is not the absence of desire but directing it well.',
        shadow: 'Wanting turned entirely into consumption.',
        color: 'orange',
        masters: ['body', 'kriya'],
        calibration: {
          dimensions: { body: 0.3, emotion: 0.2, action: 0.15 },
          practiceLevels: { body: 1, kriya: 1 },
          domainStress: { drive: 'work-career' },
          tags: ['desire', 'creative'],
        },
      },
      {
        id: 'solar',
        label: 'Solar',
        short: 'Will, warmth, and room for yourself',
        description:
          'The centre of confidence and self-respect. Here the question is whether you take up the space you occupy — whether wanting something lets you go after it, and whether you can be visible while doing it. This is the centre most often arranged around other people’s permission.',
        shadow: 'Confidence that has become identity, and has to be defended.',
        color: 'amber',
        masters: ['raja', 'body'],
        calibration: {
          dimensions: { emotion: 0.3, body: 0.2, action: 0.15 },
          practiceLevels: { raja: 1, body: 1 },
          domainStress: { confidence: 'work-career' },
          tags: ['confident', 'will'],
        },
      },
      {
        id: 'heart',
        label: 'Heart',
        short: 'Openness, and the cost of it',
        description:
          'The centre where care becomes visible — in both directions. It holds love, grief, loyalty, and the willingness to be affected by another person, which is what makes it generous and what makes it expensive. Its characteristic difficulty is not coldness but the cost of staying open.',
        shadow: 'Staying open until there is nothing left to feel with.',
        color: 'rose',
        masters: ['bhakti', 'relationship'],
        calibration: {
          dimensions: { connection: 0.4, emotion: 0.2, spirit: 0.1 },
          practiceLevels: { bhakti: 1, relationship: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['tender', 'connected'],
        },
      },
      {
        id: 'throat',
        label: 'Throat',
        short: 'What is true, reaching someone',
        description:
          'The centre of expression and truthfulness. What is known inwardly has to travel a short distance to become real between people, and this is where that journey happens or fails. Work here tends to show up as a change in what can be asked for, and then in what can be refused.',
        shadow: 'Truth told accurately and used as a weapon.',
        color: 'sky',
        masters: ['bhakti', 'jnana'],
        calibration: {
          dimensions: { connection: 0.3, action: 0.2, emotion: 0.15 },
          practiceLevels: { bhakti: 1, jnana: 1 },
          domainStress: { expression: 'relationship' },
          tags: ['expressive', 'clear-voice'],
        },
      },
      {
        id: 'third-eye',
        label: 'Third eye',
        short: 'Seeing what is underneath',
        description:
          'The centre of perception and discrimination. Its work is seeing clearly enough to tell a true pattern from a story about one — which requires as much interest as it does scepticism. Practised well it sharpens judgment; overused it can become the habit of watching instead of living.',
        shadow: 'Seeing so much that nothing is taken part in.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.4, thought: 0.2 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          tags: ['perceptive', 'discerning'],
        },
      },
      {
        id: 'crown',
        label: 'Crown',
        short: 'Something wider than the personal',
        description:
          'The top of the map: a sense of belonging to something that includes more than this particular life. It is not reached by the others and it does not replace them — a person can be entirely grounded and entirely ordinary about it. What it changes is the size of the thing being asked about.',
        shadow: 'Wide open, and indistinguishable from nowhere to stand.',
        color: 'violet',
        masters: ['witnessing', 'raja'],
        calibration: {
          dimensions: { spirit: 0.45, connection: 0.1 },
          practiceLevels: { witnessing: 2, raja: 1 },
          tags: ['spacious', 'unbounded'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'money-psyche',
    title: 'Money psyche',
    subtitle: 'Your relationship with money',
    module: 'Heart',
    tradition: 'yogic',
    dimensionCategory: 'attachment',
    coverEmoji: '💰',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Money is the one thing in a life that arrives as a scoreboard for every other thing — safety, freedom, worth, comparison, generosity. Most people have had it longer than they have had time to notice the arrangement.\n\nThis describes the shape of that relationship as it actually runs, with no opinion about how much of it there is or what it should be. Having little and having much are both facts about a situation. What tends to be inherited is the conclusion drawn from it.',
    dimensions: ['scarcity', 'abundance-neutral', 'stewardship', 'generosity'],
    engineHooks: {
      loopsToCheck: ['scarcity-drift', 'comparison'],
      practiceAffinity: ['finance', 'observation'],
      deepensWith: ['work-dharma'],
    },
    questions: [
      q3(
        'money-first-thought',
        'first reaction',
        'What is the first thought that arrives when money comes up?',
        'What goes through you first when a price, a bill, or a balance appears?',
        'The first thought was written long before the current situation was. What is it?',
        scale(
          [
            'Whether there is enough, and whether it will last',
            'Where things stand — the figures, plainly',
            'Whether it is being looked after',
            'What I am doing with it, and how well',
            'Where it goes, and who it reaches',
          ],
          ['scarcity', 'abundance-neutral', 'stewardship', 'generosity'],
        ),
      ),
      q3(
        'money-checking',
        'checking',
        'How often do you look at what you have?',
        'How often does the checking itself tell you where you stand?',
        'Looking is not neutral. What does the number do to you when you open the account?',
        likert5('scarcity', [
          'I genuinely do not look',
          'Rarely, and usually only when I have to',
          'Now and then, before something specific',
          'Often, without a particular reason',
          'Most days — and not until I have, the day has not properly started',
        ]),
      ),
      q3(
        'money-enough',
        'enough',
        'Do you know what enough would look like for you?',
        'Is there a figure, and does anything in your life actually arrive at it?',
        'Most people move the target without noticing. Where is yours, and when did it last move?',
        likert5('abundance-neutral', [
          'No idea, and I would not want one',
          'Vaguely — I would know if I was near it',
          'Roughly, though the number keeps changing',
          'Yes, and I am usually in that region',
          'Yes, precisely, and it has not moved in years',
        ]),
      ),
      q3(
        'money-care',
        'the resource',
        'How well is the money you are responsible for looked after?',
        'How much attention does the money in your hands actually receive?',
        'Stewardship is a relationship to a resource, not a verdict on the person holding it. How is yours held?',
        likert5('stewardship', [
          'It leaks, and I let it',
          'Some leaks that I do not notice',
          'I keep it roughly straight',
          'I know exactly where it is and where it is going',
          'It is looked after deliberately, and I can see the whole picture',
        ]),
      ),
      q3(
        'money-giving',
        'movement out',
        'How does money move out of your hands?',
        'What share of what comes in leaves again, and by whose choice?',
        'Money that only ever arrives and accumulates is serving a different function from money that moves. What is yours doing?',
        likert5('generosity', [
          'It does not',
          'Rarely, and reluctantly',
          'When something obliges me to',
          'Regularly, to people who ask',
          'Regularly, to people and purposes I have chosen',
        ]),
      ),
      q3(
        'money-learned',
        'where it came from',
        'What did you grow up hearing about money?',
        'What was said about it, and what was simply never mentioned?',
        'Whatever was taught about money is still being run as a rule, usually without being quoted. What was the rule?',
        scale(
          [
            'That there might not be enough',
            'That it comes and goes, and you cannot lean on it',
            'That it is a matter of fact — neither good nor bad',
            'That it is a tool, and tools are looked after',
            'That it is meant to move, and to reach other people',
          ],
          ['scarcity', 'abundance-neutral', 'stewardship', 'generosity'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'scarcity',
        label: 'Scarcity',
        short: 'Organised around not running short',
        description:
          'Your relationship to money is built on a working assumption that it will run out, so most of your attention goes on prevention — checking, keeping, holding on. That arithmetic is not a character flaw and rarely a personal invention: it is usually something learned accurately at a time when it was accurate. What is harder to see from inside is how much of the day the guard occupies, and how much attention is therefore available for anything that does not involve counting.',
        shadow: 'Reading the constant arithmetic as evidence about you.',
        color: 'amber',
        masters: ['finance', 'observation'],
        calibration: {
          dimensions: { action: 0.3, emotion: 0.25, thought: 0.15 },
          practiceLevels: { finance: 2, observation: 1 },
          domainStress: { security: 'finance' },
          tags: ['scarcity', 'guarded'],
        },
      },
      {
        id: 'abundance-neutral',
        label: 'Even',
        short: 'A matter of fact, not a verdict',
        description:
          'Money has no particular charge in your system. It is a thing that exists with a shape and a size, and you can read the shape without it telling you anything about your worth. This is the middle of the range, not a lukewarm version of either end of it — it is a genuinely easier place to stand, and the number is only rarely where the attention is.',
        shadow: 'Neutrality mistaken for indifference to what it does.',
        color: 'slate',
        masters: ['observation', 'jnana'],
        calibration: {
          dimensions: { thought: 0.25, action: 0.2, emotion: 0.1 },
          practiceLevels: { observation: 1, finance: 1 },
          tags: ['even', 'uncharged'],
        },
      },
      {
        id: 'stewardship',
        label: 'Stewardship',
        short: 'A resource with a job, being looked after',
        description:
          'Money is treated as a resource rather than as a score. It is held, counted, directed, and kept in a shape you chose, and the shape was chosen on purpose. The part that is easy to miss is that this is a practice rather than a possession — it has to be done again deliberately, and what makes it durable is the doing.',
        shadow: 'The care taken over the resource replacing the resource itself.',
        color: 'teal',
        masters: ['finance', 'raja'],
        calibration: {
          dimensions: { action: 0.35, thought: 0.2, connection: 0.1 },
          practiceLevels: { finance: 2, raja: 1 },
          domainStress: { resource: 'finance' },
          tags: ['stewardship', 'managed'],
        },
      },
      {
        id: 'generosity',
        label: 'Generosity',
        short: 'Money that is meant to move',
        description:
          'Money leaves your hands by design, and where it goes is largely yours to have chosen. This is a description of the function money is serving for you — not a claim about how much, and not a claim about virtue, which is a separate question and a less interesting one. The question this opens is what the giving is for, and what would happen to it if no one knew.',
        shadow: 'The movement of money beginning to substitute for your own.',
        color: 'emerald',
        masters: ['karma', 'finance'],
        calibration: {
          dimensions: { connection: 0.35, action: 0.2, spirit: 0.1 },
          practiceLevels: { finance: 1, karma: 1 },
          domainStress: { giving: 'finance' },
          tags: ['generosity', 'circulating'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'death-awareness',
    title: 'Death awareness',
    subtitle: 'Your relationship to your own ending',
    module: 'Launch',
    tradition: 'vedic',
    dimensionCategory: 'spirit',
    coverEmoji: '🕯️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Every ending is described to us by people who are not going through one, which gives the subject a permanent second-hand quality. That is a large part of why it is easier to put down than to look at.\n\nThis asks a narrower thing: what your current relationship to your own ending is like, described in terms you would actually use for it. It is not an exercise, and nothing here asks you to sit with anything.',
    dimensions: ['avoided', 'acknowledged', 'contemplated', 'familiar'],
    engineHooks: {
      loopsToCheck: ['grief-avoidance', 'distraction'],
      practiceAffinity: ['witnessing', 'self-inquiry'],
      deepensWith: ['non-dual-glimpses', 'grief-reservoir'],
    },
    questions: [
      q3(
        'death-arrival',
        'how often it arrives',
        'How often does the fact that you will die come up for you?',
        'How much of the week is it simply there, without being brought up?',
        'It is usually a background fact rather than a subject, which is the ordinary human arrangement. How present is it for you?',
        scale(
          [
            'It does not come up for me',
            'It comes up now and then, and passes',
            'It comes up fairly often, usually without anything having happened',
            'It is usually in the background of an ordinary day',
            'It is one of the facts I hold, alongside the others',
          ],
          ['avoided', 'acknowledged', 'contemplated', 'familiar'],
        ),
      ),
      q3(
        'death-conversation',
        'in conversation',
        'When it comes up with other people, what do you do?',
        'How does the subject behave in an actual conversation?',
        'There is a difference between hearing about someone else’s death and hearing your own mentioned. How does yours get handled?',
        scale(
          [
            'I move away from it as soon as I can',
            'I steer the conversation somewhere else',
            'I can stay in it for a while without it becoming difficult',
            'I have had a real conversation about it with someone',
            'It is ordinary talk — I have discussed it plainly, and often',
          ],
          ['avoided', 'acknowledged', 'contemplated', 'familiar'],
        ),
      ),
      q3(
        'death-arrangements',
        'the practical part',
        'How much of what would need arranging have you actually arranged?',
        'How much of the paperwork exists, and who knows about it?',
        'Almost every death is preceded by a set of administrative facts. Where do yours stand?',
        scale(
          [
            'I have never thought about any of it',
            'It has occurred to me and I have not acted on it',
            'Some of it is in order',
            'Most of it is arranged and written down',
            'It is all arranged, and the people who need to know have been told',
          ],
          ['avoided', 'acknowledged', 'contemplated', 'familiar'],
        ),
      ),
      q3(
        'death-language',
        'the words for it',
        'Which words do you use for it?',
        'How direct is the vocabulary you have for this?',
        'The words available to a person are set early and rarely revisited. How direct are yours?',
        pickOne(
          [
            'I avoid the subject, so I have no words for it',
            'I use the softened ones — passing on, losing someone',
            'I use the plain words, when they come up',
            'The plain words are ordinary vocabulary to me',
          ],
          ['avoided', 'acknowledged', 'contemplated', 'familiar'],
        ),
      ),
      q3(
        'death-in-the-body',
        'what happens in you',
        'What happens in your body when you think about it?',
        'What does the thought actually do, physically?',
        'The response is smaller and more ordinary than the subject. What is yours?',
        scale(
          [
            'It tightens, and I look away',
            'Something in me closes and the subject changes',
            'It is uncomfortable, and I stay with it',
            'It is quiet, and I am still here afterwards',
            'There is very little happening in me at all',
          ],
          ['avoided', 'acknowledged', 'contemplated', 'familiar'],
        ),
      ),
      q3(
        'death-others',
        'the people close to you',
        'How much do you know about how the people nearest you would want it to go?',
        'How much of that has actually been said out loud?',
        'Most people have not had this conversation with the people it concerns most. Where do you stand with yours?',
        scale(
          [
            'No idea, and I have not wanted to',
            'We have never spoken about it',
            'They have told me some of it',
            'We have talked it through',
            'It is settled between us — we have both said what we want',
          ],
          ['avoided', 'acknowledged', 'contemplated', 'familiar'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'avoided',
        label: 'Not in view',
        short: 'The subject is somewhere else at the moment',
        description:
          'It is not present in your thinking, and there is no particular charge attached to it. That is not a fear of it and not a decision against it — most people have simply not arrived at it, and their attention has gone somewhere else entirely. Nothing here needs to change. It is worth knowing where your attention actually is.',
        shadow: 'Reading a subject you have not reached as one you failed at.',
        color: 'slate',
        masters: ['witnessing', 'observation'],
        calibration: {
          dimensions: { thought: 0.2, emotion: 0.2, spirit: 0.1 },
          practiceLevels: { witnessing: 1, observation: 1 },
          tags: ['not-present', 'out-of-view'],
        },
      },
      {
        id: 'acknowledged',
        label: 'Present',
        short: 'A background fact, not a special event',
        description:
          'It arrives and goes without being chased away and without asking for attention. Most of your life is organised as though this were certain for everyone else and only eventually for you, which is the ordinary arrangement rather than a stage to be got past. From here the subject is held without being worked on.',
        shadow: 'Assuming it is settled because it is quiet.',
        color: 'sky',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.25, emotion: 0.1 },
          practiceLevels: { witnessing: 1, jnana: 1 },
          tags: ['background', 'acknowledged'],
        },
      },
      {
        id: 'contemplated',
        label: 'Looked at directly',
        short: 'You have been here before, more than once',
        description:
          'You have gone into it deliberately, on more than one occasion, and can describe what that is like without the description turning into advice for anyone else. It is not comfortable and it is not meant to be — it is a subject you have been present for rather than one you keep at a distance, and what you make of it afterwards is your own business.',
        shadow: 'The directness of the experience turning into a position on it.',
        color: 'indigo',
        masters: ['self-inquiry', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.35, thought: 0.25, emotion: 0.15 },
          practiceLevels: { 'self-inquiry': 1, witnessing: 2 },
          tags: ['contemplated', 'been-here'],
        },
      },
      {
        id: 'familiar',
        label: 'Ordinary company',
        short: 'A fact you keep company with',
        description:
          'It sits with you as part of the shape of a life, alongside weather, age, and the deaths of other people, and asks for no special handling. Worth stating plainly, because this reading can be misread as an achievement: it is not the correct answer, and it does not make the other three wrong. Four people reading this will find four different places, and each of them is simply where they are.',
        shadow: 'Familiarity assumed to be a conclusion rather than a location.',
        color: 'violet',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.4, thought: 0.15, emotion: 0.1 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          tags: ['familiar', 'undramatic'],
        },
      },
    ],
  },
];
