/**
 * MODULE 4 · 12 SKILLS (mirrors 37–40)
 *
 * Four capacities that decide whether practice actually takes hold: how much
 * can be handed over, how sharp the question is, how naturally the help
 * arrives, and how far sitting goes before it stops being sitting.
 *
 * These are capacities, not achievements. Every question is written so that
 * the least-developed answer is still a truthful one — nothing here asks you
 * to have arrived somewhere first.
 */

import { q3, likert5, pickOne, scale, type MirrorBank } from './types';

export const SKILLS_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'devotion-capacity',
    title: 'Devotion capacity',
    subtitle: 'Your ability to surrender to something bigger',
    module: '12 Skills',
    tradition: 'vedic',
    dimensionCategory: 'path',
    coverEmoji: '🙏',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Devotion is usually described as surrender. Very few people meet it that way. Most meet it first as a duty, a longing, or a set of words that have outlived their meaning.\n\nThis asks what actually happens when you pray, what you are handing over, and what stands in the way of handing it over.',
    dimensions: ['practical', 'devotional', 'surrendering', 'absolute'],
    engineHooks: {
      practiceAffinity: ['bhakti', 'witnessing'],
      deepensWith: ['devotional-object', 'vairagya'],
    },
    questions: [
      q3(
        'devotion-texture',
        'texture',
        'On an ordinary weekday, which of these comes closest to what praying feels like?',
        'Set the belief aside for a moment. Which of these is the actual texture of the practice for you?',
        'Devotion takes a handful of shapes — a duty kept, a movement felt, a hand opened, something total faced. Strip the story out of it and name which one is yours.',
        pickOne(
          [
            'A responsibility I keep',
            'Something that moves me whether I ask or not',
            'A willingness to hand over what I was managing',
            'A sense of standing in front of something total',
          ],
          ['practical', 'devotional', 'surrendering', 'absolute'],
        ),
      ),
      q3(
        'devotion-day',
        'texture',
        'After you have prayed or practised, what happens to the rest of the day?',
        'Does the practice leave anything behind in the hours that follow?',
        'The measure of devotion is not in the prayer but in what the prayer has rearranged afterwards. What is it that you carry out of the room?',
        likert5('devotional', [
          'Nothing carries over at all',
          'A slightly better mood, briefly',
          'I am steadier for a while',
          'Something of it stays with me all day',
          'The day arranges itself differently afterwards',
        ]),
      ),
      q3(
        'devotion-act',
        'practice',
        'When you sit down to pray, what are you actually doing?',
        'Strip away the form. What is the action underneath the words?',
        'Every practice contains the same handful of moves: ask, repeat, release, and be unable to name what you are doing. Which one is actually happening in yours?',
        pickOne(
          [
            'Asking for something specific',
            'Repeating words until something seems to answer',
            'Letting the outcome go, even for a moment',
            'Not knowing what I am doing, and doing it anyway',
          ],
          ['practical', 'devotional', 'surrendering', 'absolute'],
        ),
      ),
      q3(
        'devotion-block',
        'block',
        'What gets in the way when you try to let something go?',
        'Which obstacle actually shows up at the moment of release?',
        'The thing that blocks surrender is almost never the thing it appears to be. It is usually one of these four. Find yours.',
        pickOne(
          [
            'I have never seriously tried to let go of anything',
            'I need some sign that letting go worked before I can do it again',
            'I am responsible for the outcome, and I cannot stop being responsible',
            'I cannot tell whether there is anything there to surrender to',
          ],
          ['practical', 'devotional', 'surrendering', 'absolute'],
        ),
      ),
      q3(
        'devotion-in-life',
        'practice',
        'How much of what you would call spiritual is part of ordinary life rather than set aside for it?',
        'Is the practice contained in a corner of the week, or does it run through the rest?',
        'A practice kept in its own room stays a department of your life. How much of your actual day is being run by the one you set aside?',
        likert5('practical', [
          'None of it — it is completely separate',
          'Occasional moments, and nothing more',
          'Some of it, in places',
          'Most days carry some of it',
          'It runs through nearly everything I do',
        ]),
      ),
      q3(
        'devotion-given',
        'release',
        'Think of the hardest thing in your life. How much of it have you actually handed over?',
        'Of what you carry, how much is genuinely not in your hands any more?',
        'Surrender is measured by what has actually been given up, not by how much you feel about giving it up. Where is yours?',
        scale(
          [
            'I hold on to nearly everything',
            'I hand over the small things',
            'It depends entirely on the situation',
            'I hand over what I genuinely cannot control',
            'I hand over the outcome itself',
          ],
          ['practical', 'practical', 'devotional', 'surrendering', 'surrendering'],
        ),
      ),
      q3(
        'devotion-larger',
        'object',
        'When you pray, how often is there a sense of something larger on the other side?',
        'How often is anything actually there to answer?',
        'Most devotional life is conducted without that presence ever appearing. Look honestly at how often it does.',
        likert5('absolute', [
          'Never — it is words into a quiet room',
          'Rarely',
          'Sometimes',
          'Often',
          'Almost always, and it changes what I say',
        ]),
      ),
      q3(
        'devotion-moment',
        'release',
        'Recall the last time you truly let go of something. What happened next?',
        'What actually occurred in the instant of release?',
        'There is a difference between releasing an idea and releasing the one holding it. Which of these did you do?',
        pickOne(
          [
            'Nothing happened, and I went back to what I was doing',
            'I felt lighter for a while',
            'I let go of a decision I had already made',
            'The question of who was doing the letting stopped mattering',
          ],
          ['practical', 'devotional', 'surrendering', 'absolute'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'practical',
        label: 'Kept as a duty',
        short: 'The practice is maintained, not entered',
        description:
          'The form is intact and something real is inside it, held at arm’s length. Nothing has gone wrong here — the practice simply has not yet become somewhere you go rather than something you complete.',
        shadow: 'Mistaking consistency for closeness.',
        color: 'slate',
        masters: ['bhakti', 'observation'],
        calibration: {
          dimensions: { action: 0.25, thought: 0.15, spirit: 0.1 },
          practiceLevels: { bhakti: 1, observation: 1 },
          tags: ['kept-as-duty', 'formal'],
        },
      },
      {
        id: 'devotional',
        label: 'Felt as longing',
        short: 'It moves you more than you direct it',
        description:
          'There is genuine feeling here, and it arrives on its own schedule rather than on command. The edge to watch is making the feeling the measure of the practice — days without it can be mistaken for days without progress.',
        shadow: 'Measuring practice by whether it felt like something.',
        color: 'rose',
        masters: ['bhakti', 'emotional-healing'],
        calibration: {
          dimensions: { emotion: 0.35, connection: 0.25, spirit: 0.15 },
          practiceLevels: { bhakti: 1, 'emotional-healing': 1 },
          domainStress: { heart: 'emotional-healing' },
          tags: ['longing', 'felt'],
        },
      },
      {
        id: 'surrendering',
        label: 'Open hand',
        short: 'Something can genuinely be handed over',
        description:
          'Release is available to you, at least in part. The work now is not learning to let go but noticing how much of what you carry you chose to pick up in the first place.',
        shadow: 'Using surrender as a way of avoiding a decision.',
        color: 'teal',
        masters: ['bhakti', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.3, action: 0.2, emotion: 0.15 },
          practiceLevels: { bhakti: 2, witnessing: 1 },
          tags: ['releasing', 'willing'],
        },
      },
      {
        id: 'absolute',
        label: 'Facing the total',
        short: 'There is something larger on the other side',
        description:
          'What you bow to is not a figure or an idea but the whole of it, and the practice has started to reorganise the rest of your life around that. This is worth handling carefully — a sense of the total can also become an excellent way of not looking at what is in front of you.',
        shadow: 'Seeking the infinite in order to avoid the immediate.',
        color: 'indigo',
        masters: ['bhakti', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.45, connection: 0.2 },
          practiceLevels: { bhakti: 2, witnessing: 2 },
          domainStress: { contact: 'relationship' },
          tags: ['total', 'formless'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'inquiry-sharpness',
    title: 'Inquiry sharpness',
    subtitle: 'The edge of your Jnana blade',
    module: '12 Skills',
    tradition: 'vedic',
    dimensionCategory: 'path',
    coverEmoji: '🗡️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Inquiry is not the amount of thinking you do. It is what happens when a question gets past the explanation and reaches the thing that was being explained.\n\nThis measures the sharpness of the blade — whether a belief can be examined without being defended, and whether an answer you have arrived at belongs to you.',
    dimensions: ['intellectual', 'discriminating', 'penetrating', 'razor-sharp'],
    engineHooks: {
      practiceAffinity: ['jnana', 'self-inquiry'],
      deepensWith: ['meta-cognition', 'jnana-aptitude'],
    },
    questions: [
      q3(
        'inquiry-wobble',
        'defence',
        'When somebody questions a belief of yours, how much does it wobble?',
        'How much of what you hold survives being questioned?',
        'A belief that cannot be questioned has stopped being a belief and become an organ. How much of yours still moves when touched?',
        likert5('discriminating', [
          'Not at all — it is simply true',
          'A little, then I argue',
          'Some, and I take a while to come back to it',
          'Most of it goes',
          'It does not survive the question at all',
        ]),
      ),
      q3(
        'inquiry-borrowed',
        'ownership',
        'Before you state something as true, do you know where you got it from?',
        'How much of what you hold is actually yours, as opposed to absorbed?',
        'Most of what anyone believes was received rather than found. The work is noticing which parts you have examined yourself. Which of these describes yours?',
        pickOne(
          [
            'I mostly repeat what I was taught',
            'I can hear when I am quoting someone',
            'I have to test it before I will call it mine',
            'I know which thoughts are mine before I have had them',
          ],
          ['intellectual', 'discriminating', 'penetrating', 'razor-sharp'],
        ),
      ),
      q3(
        'inquiry-language',
        'precision',
        'How accurately can you describe what is happening inside you right now?',
        'How close does your language get to the actual experience?',
        'Vague language about inner states is not a reporting failure — it is the mind protecting itself from what the words would make accurate. Where does yours sit?',
        scale(
          [
            'I use the same few words for everything',
            'Some of my words land accurately',
            'I can be exact about feelings',
            'I can be exact about feelings and thoughts both',
            'The words match the experience exactly',
          ],
          ['intellectual', 'intellectual', 'discriminating', 'penetrating', 'razor-sharp'],
        ),
      ),
      q3(
        'inquiry-follow',
        'reach',
        'When a question really matters, how far do you take it?',
        'Do you go all the way down, or stop when it gets uncomfortable?',
        'A question that is followed to its end stops being a question about the world and becomes a question about the one asking. How far do you take yours?',
        likert5('penetrating', [
          'I drop it quickly',
          'A little way, then I move on',
          'Quite far, if I have the time',
          'All the way, however long it takes',
          'It answers itself before I reach the end of it',
        ]),
      ),
      q3(
        'inquiry-block',
        'block',
        'What most often stops a question from being finished?',
        'What is actually in the way when the question gets difficult?',
        'The obstacle is rarely lack of intelligence. It is one of these four, and only one of them is really blocking you.',
        pickOne(
          [
            'No time for questions like that',
            'Asking it makes me look foolish',
            'The answer would change what I have to do next',
            'I am not sure I could live with not finding out',
          ],
          ['intellectual', 'discriminating', 'penetrating', 'razor-sharp'],
        ),
      ),
      q3(
        'inquiry-defence',
        'defence',
        'How do you react to being shown that you are wrong about something?',
        'How much pleasure is there in being corrected?',
        'Curiosity and defensiveness use the same equipment. The difference is whether the answer is wanted or survived. Which is it?',
        likert5('razor-sharp', [
          'I argue straight away',
          'I usually push back',
          'I ask questions before I answer',
          'I stay curious past the discomfort',
          'I am genuinely glad to be shown wrong',
        ]),
      ),
      q3(
        'inquiry-unbidden',
        'arrival',
        'Has understanding ever arrived without you working for it?',
        'Do insights come to you, or only when you go looking?',
        'Some people have a question that keeps surfacing uninvited. It is worth knowing whether yours does, because a question you cannot stop asking is already further along than it feels.',
        pickOne(
          [
            'Never — everything I know, I looked up',
            'Once or twice, and I dismissed it',
            'It happens, usually once I stop working on it',
            'It arrives and I recognise it immediately',
          ],
          ['intellectual', 'discriminating', 'penetrating', 'razor-sharp'],
        ),
      ),
      q3(
        'inquiry-answer',
        'reach',
        'How often does a question end in something you could actually act on?',
        'Do the answers you find survive contact with a real decision?',
        'Knowing and doing are different muscles, and the second one is the harder test. How much of your inquiry arrives in the place it is needed?',
        likert5('penetrating', [
          'Almost never — I know more, and do not change',
          'Rarely',
          'Sometimes',
          'Often',
          'It cuts straight through and I act on it',
        ]),
      ),
    ],
    resultTypes: [
      {
        id: 'intellectual',
        label: 'Working in concepts',
        short: 'Clear about the map, not yet the territory',
        description:
          'You think well in frameworks and gain real fluency in them. What is being described has not yet been separated from the description, which makes this a generous place to begin — the vocabulary is already there.',
        shadow: 'Collecting explanations instead of meeting the thing.',
        color: 'sky',
        masters: ['jnana', 'neuroscience'],
        calibration: {
          dimensions: { thought: 0.35, spirit: 0.15 },
          practiceLevels: { jnana: 1, neuroscience: 1 },
          tags: ['conceptual', 'fluent'],
        },
      },
      {
        id: 'discriminating',
        label: 'Discriminating',
        short: 'You can tell one thing from another',
        description:
          'The capacity to separate what is actually there from what has been added to it is already working. Most of what remains is not the absence of the ability but the places where it is not yet pointed at itself.',
        shadow: 'Using precision on others rather than on the mind.',
        color: 'teal',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.2, emotion: 0.1 },
          practiceLevels: { jnana: 2, 'self-inquiry': 1 },
          tags: ['discerning', 'accurate'],
        },
      },
      {
        id: 'penetrating',
        label: 'Penetrating',
        short: 'Questions reach past the explanation',
        description:
          'You follow things further than most people do, and the mechanism underneath is genuinely available to you. The next edge is usually not another layer of understanding — it is asking the question of the one asking.',
        shadow: 'Reading your own layers without ever arriving.',
        color: 'violet',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.35, emotion: 0.1 },
          practiceLevels: { jnana: 2, 'self-inquiry': 2 },
          tags: ['reaching', 'unfinished-by-nature'],
        },
      },
      {
        id: 'razor-sharp',
        label: 'Razor edge',
        short: 'The question cuts, and something answers',
        description:
          'Inquiry is close to automatic here: the belief is held loosely enough to be tested, the answer arrives without being summoned, and it usually makes a difference. The remaining risk is the confidence that comes with a blade this well-honed.',
        shadow: 'Certainty sharpening into something harder to argue with.',
        color: 'indigo',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.45, thought: 0.25 },
          practiceLevels: { witnessing: 2, jnana: 2 },
          tags: ['sharp', 'unborrowed'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'service-instinct',
    title: 'Service instinct',
    subtitle: 'Your natural Karma flavor',
    module: '12 Skills',
    tradition: 'vedic',
    dimensionCategory: 'path',
    coverEmoji: '🤲',
    estimatedMinutes: 5,
    version: 1,
    intro:
      'Service is usually presented as a decision. For some people it arrives long before the decision — the need is seen, the hand moves, and the reasoning catches up afterwards.\n\nThis looks at that reflex: whether it runs on exchange, whether it is chosen or reactive, and what happens to it when it is refused.',
    dimensions: ['self-directed', 'responsive', 'proactive', 'spontaneous-service'],
    engineHooks: {
      practiceAffinity: ['karma', 'relationship'],
      deepensWith: ['service-radius', 'karma-signature'],
    },
    questions: [
      q3(
        'service-notice',
        'awareness',
        'How often do you notice that someone needs something before they say so?',
        'Do you see the need arriving, or only the request?',
        'Noticing a need without being told requires that you are already looking. How often are you looking?',
        likert5('responsive', [
          'Almost never — I wait to be asked',
          'Rarely',
          'Sometimes',
          'Often',
          'I usually see it before it is said',
        ]),
      ),
      q3(
        'service-useful',
        'ease',
        'How easy is it for you to be useful to other people?',
        'Is being needed a natural act for you, or a project?',
        'Ease and effort are different things here, and only one of them changes with practice. Which is carrying your helping?',
        scale(
          [
            'I would rather not be asked',
            'I help when it is clear what is wanted',
            'It depends entirely on who is asking',
            'I am genuinely useful to the people around me',
            'Being useful is the easiest thing I do',
          ],
          ['self-directed', 'self-directed', 'responsive', 'proactive', 'spontaneous-service'],
        ),
      ),
      q3(
        'service-exchange',
        'exchange',
        'When you help someone, is there something coming back to you?',
        'How much of the help is also a transaction?',
        'Every act of service has a hidden account attached to it. Where is yours kept, and who keeps it?',
        pickOne(
          [
            'Help usually comes back to me somehow',
            'I keep an honest mental tally of it',
            'I help because it is the right thing, whatever it returns',
            'I help before I have decided to help',
          ],
          ['self-directed', 'responsive', 'proactive', 'spontaneous-service'],
        ),
      ),
      q3(
        'service-avoided',
        'shadow',
        'What is being avoided in your service?',
        'Which part of helping costs you the most?',
        'Whatever a person consistently cannot do in service is usually the part that matters most. Which of these is yours?',
        pickOne(
          [
            'Being needed',
            'Being thanked, or not being thanked',
            'The limits of what I can actually do for someone',
            'Nothing — I have not found the edge of it',
          ],
          ['self-directed', 'responsive', 'proactive', 'spontaneous-service'],
        ),
      ),
      q3(
        'service-chosen',
        'choice',
        'Do you choose your helping, or does it arrive as a reaction to the moment?',
        'How much of your service is a decision rather than a reflex?',
        'A reflex is fast, reliable and impersonal. A choice is slower and includes you. The difference matters in situations nobody planned for.',
        likert5('proactive', [
          'Pure reaction — it happens and then I am in it',
          'Mostly reaction',
          'Half chosen, half reaction',
          'Mostly chosen before the moment arrives',
          'I choose it long before anyone has asked',
        ]),
      ),
      q3(
        'service-refused',
        'shadow',
        'What happens inside you when someone refuses your help?',
        'Why does a refusal land — what does it reach?',
        'What a refusal reaches is the truest thing about your service. Look at what is actually there when the offer is turned down.',
        pickOne(
          [
            'I feel rejected',
            'I take it as a sign they did not really need me',
            'I accept it and let it go',
            'I keep offering until I understand why',
          ],
          ['self-directed', 'responsive', 'proactive', 'spontaneous-service'],
        ),
      ),
      q3(
        'service-after',
        'ease',
        'After a day of helping people, how do you feel?',
        'What is the residue of a day spent being useful?',
        'Service can be the most nourishing thing a person does, and it can also be the most depleting. The difference is not in the act.',
        likert5('spontaneous-service', [
          'Completely drained',
          'Tired, but glad it was useful',
          'About the same as any other day',
          'Lighter than I was before',
          'Genuinely restored by it',
        ]),
      ),
      q3(
        'service-impulse',
        'choice',
        'How much do you act on an impulse to help, rather than waiting to be sure?',
        'How quickly do you move when you see a need?',
        'Impulse without deliberation is fast, and it is also the version that cannot consult the ego first. How much of your helping begins that way?',
        likert5('spontaneous-service', [
          'I almost never act on the first impulse',
          'Rarely',
          'About half the time',
          'Often',
          'The impulse and the act are the same thing',
        ]),
      ),
    ],
    resultTypes: [
      {
        id: 'self-directed',
        label: 'Help with a return expected',
        short: 'Service that runs in both directions',
        description:
          'The helping is real and it is also largely managed. There is usually an account running underneath — proof of goodness, a place kept warm, a role to occupy. None of that makes the help less useful to the person receiving it.',
        shadow: 'Needing to be needed in order to keep giving.',
        color: 'amber',
        masters: ['karma', 'relationship'],
        calibration: {
          dimensions: { connection: 0.3, action: 0.25, emotion: 0.2 },
          practiceLevels: { karma: 1, relationship: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['accounted', 'role-bound'],
        },
      },
      {
        id: 'responsive',
        label: 'Responsive',
        short: 'You see the need and you meet it',
        description:
          'You notice what is missing and act on it. What tends to go untested here is the source of the noticing — how much of the seeing comes from genuinely attending, and how much from scanning for a role you can take.',
        shadow: 'Attending to others as a way of avoiding your own.',
        color: 'teal',
        masters: ['karma', 'observation'],
        calibration: {
          dimensions: { connection: 0.3, action: 0.2, thought: 0.1 },
          practiceLevels: { karma: 1, observation: 1 },
          tags: ['attentive', 'useful'],
        },
      },
      {
        id: 'proactive',
        label: 'Proactive',
        short: 'You move before being asked',
        description:
          'The help arrives ahead of the request, and you generally know when it is real. The remaining question is a quiet one — whether the initiative is yours, or a need of your own being met in someone else’s situation.',
        shadow: 'Moving first to be the one who arrived.',
        color: 'sky',
        masters: ['karma', 'witnessing'],
        calibration: {
          dimensions: { action: 0.35, connection: 0.25, spirit: 0.1 },
          practiceLevels: { karma: 2, witnessing: 1 },
          tags: ['initiative', 'chosen'],
        },
      },
      {
        id: 'spontaneous-service',
        label: 'Spontaneous service',
        short: 'It moves in you before it is a decision',
        description:
          'The impulse to help arrives whole and does not wait for consultation. It is the rarest of the four and the one most easily mistaken for a strength of character — it is better understood as a capacity that can be spent, or exhausted.',
        shadow: 'Service that cannot be set down when it is not wanted.',
        color: 'indigo',
        masters: ['karma', 'witnessing'],
        calibration: {
          dimensions: { connection: 0.25, spirit: 0.35, action: 0.2 },
          practiceLevels: { karma: 2, witnessing: 2 },
          domainStress: { contact: 'relationship' },
          tags: ['immediate', 'non-negotiable'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'meditation-depth',
    title: 'Meditation depth',
    subtitle: 'How far Raja takes you',
    module: '12 Skills',
    tradition: 'yogic',
    dimensionCategory: 'witness',
    coverEmoji: '👑',
    estimatedMinutes: 8,
    version: 1,
    intro:
      'Depth is not duration. Twenty minutes where the body disappears and the sense of time goes is deeper than an hour of holding a thought in place.\n\nThis looks at what actually happens when you sit — where the attention rests, what the body does, what is at the bottom, and how the session ends.',
    dimensions: ['resting', 'settled', 'absorbed', 'merged'],
    engineHooks: {
      practiceAffinity: ['raja', 'witnessing'],
      deepensWith: ['dhyana', 'samadhi'],
    },
    questions: [
      q3(
        'meditation-resting',
        'posture',
        'Where does your attention actually rest when you meditate?',
        'Look at a recent sitting. What was the object, honestly?',
        'Attention rests on one of these four things, and the difference between them is the whole of the practice. Which one holds yours?',
        pickOne(
          [
            'Mostly on the breath, and only reluctantly',
            'On the breath, without much argument',
            'On whatever the practice was actually set on',
            'I cannot locate where it rests at all',
          ],
          ['resting', 'settled', 'absorbed', 'merged'],
        ),
      ),
      q3(
        'meditation-body',
        'body',
        'During a good sit, does your body disappear?',
        'What happens to the body once you are properly in?',
        'The body usually fades before it is gone. Knowing which of those two is happening to you changes what you are actually training.',
        likert5('merged', [
          'I am more aware of my body than ever',
          'I notice it more than usual',
          'It is there, but quiet',
          'Only sometimes does it drop away',
          'It is usually not there at all',
        ]),
      ),
      q3(
        'meditation-thoughts',
        'thoughts',
        'What happens to your thoughts while you sit?',
        'Do they stop, or do you hold them at a distance?',
        'Stopping and ignoring feel similar from inside and are entirely different states. Which one is being described here?',
        pickOne(
          [
            'They are ignored, loudly, for the whole sitting',
            'They thin out and come back',
            'They come and go and the attention does not follow',
            'They stop',
          ],
          ['resting', 'settled', 'absorbed', 'merged'],
        ),
      ),
      q3(
        'meditation-deepest',
        'depth',
        'How deep does your sitting actually get?',
        'When you go as far as you can go, where do you arrive?',
        'There are four depths, and they are not a ladder of effort — they are four different places to be standing. Which one is yours?',
        scale(
          [
            'I get restless and stop',
            'I settle, but stay aware of myself settling',
            'I lose the sense of time',
            'The observer and the observed get hard to tell apart',
            'There is nothing left to tell them apart',
          ],
          ['resting', 'resting', 'settled', 'absorbed', 'merged'],
        ),
      ),
      q3(
        'meditation-bottom',
        'depth',
        'When you go as deep as you can reach, what is there?',
        'Take the deepest point you know. What is in it?',
        'Everyone arrives somewhere. What you find at the bottom is often the thing you have been protecting yourself from finding.',
        likert5('merged', [
          'Not much, honestly',
          'A kind of quiet',
          'Something I cannot put into words',
          'Something obviously alive and aware',
          'Something clearly aware, and not me',
        ]),
      ),
      q3(
        'meditation-ending',
        'exit',
        'How does a sitting usually end?',
        'What happens in the last minute of the practice?',
        'The ending is often the most informative part of a sitting. It shows what the practice was actually doing to you.',
        pickOne(
          [
            'I get up as soon as it gets difficult',
            'I come back slowly and start the day',
            'I sit until something moves me',
            'I do not really come back',
          ],
          ['resting', 'settled', 'absorbed', 'merged'],
        ),
      ),
      q3(
        'meditation-change',
        'trajectory',
        'Has the depth of your sitting changed over the past year?',
        'Compare now with a year ago. Is it deeper, or has it just become familiar?',
        'Familiar and deep are easy to confuse from the inside. Which of the two has actually happened?',
        likert5('absorbed', [
          'It has not changed',
          'Very slightly',
          'Somewhat',
          'Noticeably',
          'It has changed completely',
        ]),
      ),
      q3(
        'meditation-effort',
        'effort',
        'How much of your sitting is effort?',
        'How much work is it to get in, and how much is arriving on its own?',
        'Effort and absorption use the same posture. The only reliable test is what happens when you stop trying.',
        scale(
          [
            'I force it every single time',
            'I hold myself to it',
            'It takes some settling in',
            'It comes fairly naturally now',
            'I do not have to start it',
          ],
          ['resting', 'resting', 'settled', 'absorbed', 'merged'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'resting',
        label: 'Resting',
        short: 'Attention sits on the breath',
        description:
          'Sitting means going somewhere rather than being somewhere, and the breath is the place you keep returning to. This is the base of the practice, not a preliminary to it — everything else in Raja is built on being able to stay here.',
        shadow: 'Mistaking the position of the attention for the attention itself.',
        color: 'sky',
        masters: ['breath', 'raja'],
        calibration: {
          dimensions: { body: 0.25, thought: 0.2, spirit: 0.15 },
          practiceLevels: { breath: 1, raja: 1 },
          domainStress: { attention: 'observation' },
          tags: ['on-the-breath', 'effortful'],
        },
      },
      {
        id: 'settled',
        label: 'Settled',
        short: 'The mind stops arguing',
        description:
          'The noise drops and the attention stops being managed. Most of what remains is not the depth but the body, which tends to hold the last of the tension — and which is usually what stops the session going further.',
        shadow: 'Comfortable enough to sit, not yet settled enough to be still.',
        color: 'teal',
        masters: ['raja', 'body'],
        calibration: {
          dimensions: { body: 0.2, spirit: 0.3, thought: 0.15 },
          practiceLevels: { raja: 1, body: 1 },
          tags: ['settled', 'tension-held'],
        },
      },
      {
        id: 'absorbed',
        label: 'Absorbed',
        short: 'The chosen object holds you',
        description:
          'The object of meditation carries the attention by itself, which is a genuine stage rather than a trick. What often comes next is not more effort but less attachment to what the absorption is for.',
        shadow: 'Confusing the depth with what you are getting from it.',
        color: 'violet',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.35, body: 0.2, emotion: 0.1 },
          practiceLevels: { raja: 2, witnessing: 2 },
          tags: ['absorbed', 'flowing'],
        },
      },
      {
        id: 'merged',
        label: 'Merged',
        short: 'The distinction thins',
        description:
          'The boundary between the one observing and what is observed becomes difficult to locate. It is worth holding with care: a state this complete can be a real opening, and it can also be a place where practice stops being done and starts being lived in.',
        shadow: 'Staying in a state that cannot be carried into the day.',
        color: 'indigo',
        masters: ['witnessing', 'raja'],
        calibration: {
          dimensions: { spirit: 0.45, body: 0.15, connection: 0.1 },
          practiceLevels: { witnessing: 2, raja: 2 },
          domainStress: { contact: 'relationship' },
          tags: ['merged', 'boundary-thin'],
        },
      },
    ],
  },
];
