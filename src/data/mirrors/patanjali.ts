/**
 * MODULE 5 · PATAÑJALI · 8 LIMBS (mirrors 41–50)
 *
 * The eight limbs, in order. Yamas and niyamas are the two halves of the
 * ethical ground, the middle limbs are the mechanics of sitting, and vairāgya
 * is what the whole apparatus exists to make possible.
 *
 * Where a limb is a set of five rather than a continuum — yamas, niyamas —
 * the dimensions are the five items, and the questions that matter are the
 * ones about which item is actually hard.
 */

import { q3, pickOne, scale, likert5, type MirrorBank } from './types';

export const PATANJALI_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'yamas',
    title: 'Yamas',
    subtitle: 'Your relational ethics — the five restraints',
    module: 'Patanjali',
    tradition: 'yogic',
    dimensionCategory: 'ethics',
    coverEmoji: '🕊️',
    estimatedMinutes: 8,
    version: 1,
    intro:
      'The first limb is a set of five commitments made towards other people. They are called restraints because each one is a limit you agree to keep, not a quality you acquire.\n\nAlmost nobody keeps all five. Which ones are actually live for you is more useful than knowing the list.',
    dimensions: ['ahimsa', 'satya', 'asteya', 'brahmacharya', 'aparigraha'],
    engineHooks: {
      practiceAffinity: ['raja', 'karma'],
      deepensWith: ['niyamas', 'klesha-map'],
    },
    questions: [
      q3(
        'yama-hardest',
        'priority',
        'Of the five — not harming, truthfulness, not taking, restraint, and non-hoarding — which is the one you find hardest?',
        'Which of the five is actually costing you something?',
        'The five are not equal in difficulty, and the one that costs you is the one that matters. Which is it?',
        pickOne(
          [
            'Not causing harm, in a world I cannot control',
            'Telling the truth, when it would be easier not to',
            'Not taking what is not mine, including in small ways',
            'Restraint, where desire is strong and unexamined',
            'Non-hoarding, of things and of people',
          ],
          ['ahimsa', 'satya', 'asteya', 'brahmacharya', 'aparigraha'],
        ),
      ),
      q3(
        'yama-easiest',
        'effort',
        'And which one do you barely have to try at?',
        'Which of the five is simply how you already are?',
        'A yama you keep without effort is not a discipline — it is a settled part of you. Which is it?',
        pickOne(
          [
            'Not causing harm, in a world I cannot control',
            'Telling the truth, when it would be easier not to',
            'Not taking what is not mine, including in small ways',
            'Restraint, where desire is strong and unexamined',
            'Non-hoarding, of things and of people',
          ],
          ['ahimsa', 'satya', 'asteya', 'brahmacharya', 'aparigraha'],
        ),
      ),
      q3(
        'yama-truth',
        'satya',
        'How often are you completely honest with yourself?',
        'How much of what you tell yourself survives being checked?',
        'Truthfulness begins inward. Most dishonesty is done to yourself, about yourself, before anyone else is involved. How much of yours survives checking?',
        likert5('satya', [
          'I edit my own account constantly',
          'Mostly I am honest, and I soften things',
          'I am honest when it is not costing me',
          'I am honest even when it costs me',
          'I would not recognise a flattering version of myself',
        ]),
      ),
      q3(
        'yama-taking',
        'asteya',
        'How easy is it for you to take what is not yours — time, credit, ideas, attention?',
        'How much of what you use did you ask for?',
        'Most taking is invisible: an hour of someone’s attention, an idea taken as your own, credit that quietly drifts. How much of yours is like that?',
        likert5('asteya', [
          'Constantly, and I do not notice',
          'Often enough that it shows',
          'Sometimes, usually without harm',
          'Rarely — I would rather ask',
          'It is not something I do',
        ]),
      ),
      q3(
        'yama-restraint',
        'brahmacharya',
        'Where does your desire actually go when it is not managed?',
        'What does unexamined wanting look like, day to day?',
        'Restraint is not suppression. It is the difference between wanting and being run by wanting. Where is yours going?',
        scale(
          ['It is the loudest thing in the room', 'It sets the agenda more often than not', 'It is one motive among several', 'It is present and not in charge', 'It rarely decides anything for me'],
          ['rajas', 'rajas', 'balance', 'balance', 'sattva'],
        ),
      ),
      q3(
        'yama-hoarding',
        'aparigraha',
        'What are you holding onto that you would not choose to keep?',
        'What would you release today if nothing was at stake?',
        'Non-hoarding is about the accumulation you did not choose: commitments, possessions, people, options. Which of those is the pile?',
        pickOne(
          ['Possessions, more than I use', 'Commitments I said yes to', 'People I am holding on to', 'Options I keep open to avoid choosing', 'Nothing in particular'],
          ['objects', 'commitments', 'people', 'options', 'clear'],
        ),
      ),
      q3(
        'yama-set',
        'coherence',
        'Do the five feel like rules, or like a description?',
        'Are you policing these, or living them?',
        'A rule observed from outside is a rule. A description of how you already move is a practice. Which is it?',
        scale(
          ['A set of rules I break regularly', 'Rules I try to follow', 'Habits I am building', 'Mostly how I already live', 'They have become instinct'],
          ['external', 'external', 'building', 'lived', 'instinct'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'ahimsa',
        label: 'Ahiṃsā is the live one',
        short: 'Causing harm is the hard problem',
        description:
          'Your resistance is around harm. That usually means you are close enough to other people for it to matter, and you are aware that intention and consequence rarely line up. The difficulty here is not usually wanting to hurt — it is noticing, too late, when you have.',
        shadow: 'Equating non-violence with never disappointing anyone.',
        color: 'slate',
        masters: ['karma', 'witnessing'],
        calibration: {
          dimensions: { connection: 0.3, emotion: 0.25, action: 0.2 },
          practiceLevels: { karma: 1, witnessing: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['ethics', 'harm-sensitive'],
        },
      },
      {
        id: 'satya',
        label: 'Satya is the live one',
        short: 'Truth is where it gets difficult',
        description:
          'Honesty is your hard one. Most of what gets in the way is not fear of lying to others — it is the cost of the truth about yourself, and the amount of rewriting that would follow.',
        shadow: 'Confusing honesty with disclosure.',
        color: 'sky',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.35, spirit: 0.2, emotion: 0.15 },
          practiceLevels: { jnana: 1, 'self-inquiry': 1 },
          tags: ['ethics', 'self-honesty'],
        },
      },
      {
        id: 'asteya',
        label: 'Asteya is the live one',
        short: 'Taking without noticing is the pattern',
        description:
          'The hard one is not taking what is loudly yours to take — it is the small, unnoticed appropriation. Time, attention, credit, ideas. It is rarely a large theft and rarely entirely innocent.',
        shadow: 'Believing intention settles the question.',
        color: 'amber',
        masters: ['karma', 'jnana'],
        calibration: {
          dimensions: { action: 0.3, connection: 0.25, thought: 0.2 },
          practiceLevels: { karma: 1 },
          domainStress: { work: 'work-career' },
          tags: ['ethics', 'appropriation'],
        },
      },
      {
        id: 'brahmacharya',
        label: 'Brahmacarya is the live one',
        short: 'Desire is doing more steering than you signed up for',
        description:
          'Restraint is your live question. Desire here is not a problem in itself — it is that it has become the deciding force in more situations than you would choose if you looked.',
        shadow: 'Confusing restraint with suppression.',
        color: 'orange',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { body: 0.3, emotion: 0.25, action: 0.2 },
          practiceLevels: { raja: 1, witnessing: 1 },
          tags: ['ethics', 'desire'],
        },
      },
      {
        id: 'aparigraha',
        label: 'Aparigraha is the live one',
        short: 'What you keep is running your life',
        description:
          'Non-hoarding is the hard one. There is an accumulation in your life — things, commitments, people, open options — that you did not choose and have not released, and it is making decisions on your behalf.',
        shadow: 'Mistaking keeping for loyalty.',
        color: 'indigo',
        masters: ['jnana', 'karma'],
        calibration: {
          dimensions: { action: 0.3, thought: 0.25, connection: 0.2 },
          practiceLevels: { jnana: 1, karma: 1 },
          domainStress: { work: 'work-career' },
          tags: ['ethics', 'accumulation'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'niyamas',
    title: 'Niyamas',
    subtitle: 'The five self-disciplines',
    module: 'Patanjali',
    tradition: 'yogic',
    dimensionCategory: 'ethics',
    coverEmoji: '🪷',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'The second limb turns the same five-part shape inward. If the yamas are what you owe other people, the niyamas are what you owe yourself.\n\nThe second one — contentment — is the one that quietly undoes the first five if it is missing.',
    dimensions: ['sauca', 'samtosha', 'tapas', 'svadhyaya', 'ishvarapranidhana'],
    engineHooks: {
      practiceAffinity: ['raja', 'jnana'],
      deepensWith: ['yamas', 'svadhyaya'],
    },
    questions: [
      q3(
        'niyama-alive',
        'priority',
        'Of the five — cleanliness, contentment, heat, study, and surrender — which is actually alive in your life?',
        'Which of the five are you genuinely keeping?',
        'Four of the five are disciplines. One of them is a temperament. Which do you have?',
        pickOne(
          [
            'Cleanliness — of body, surroundings, or thought',
            'Contentment — being enough as you are',
            'Tapas — sustained effort toward something',
            'Study — keeping yourself in contact with yourself',
            'Surrender — orienting toward something larger',
          ],
          ['sauca', 'samtosha', 'tapas', 'svadhyaya', 'ishvarapranidhana'],
        ),
      ),
      q3(
        'niyama-neglected',
        'neglect',
        'And which one have you quietly not done at all?',
        'Which one are you avoiding?',
        'The neglected one is usually the informative one. Which is it?',
        pickOne(
          [
            'Cleanliness — of body, surroundings, or thought',
            'Contentment — being enough as you are',
            'Tapas — sustained effort toward something',
            'Study — keeping yourself in contact with yourself',
            'Surrender — orienting toward something larger',
          ],
          ['sauca', 'samtosha', 'tapas', 'svadhyaya', 'ishvarapranidhana'],
        ),
      ),
      q3(
        'niyama-content',
        'samtosha',
        'How often are you actually satisfied with what you have?',
        'When did you last feel genuinely enough?',
        'Contentment is not being unambitious. It is the capacity to be where you are without the next thing already being required. When is that?',
        likert5('samtosha', [
          'I am almost never satisfied with where I am',
          'Briefly, and rarely',
          'In short stretches, after things settle',
          'Most of the time, with some effort',
          'It is simply my default state',
        ]),
      ),
      q3(
        'niyama-effort',
        'tapas',
        'How much sustained effort is your life actually asking of you?',
        'Is the heat on, or off?',
        'Tapas is the heat that makes transformation possible. Too little and nothing changes; too much and the vessel cracks. Where is yours?',
        scale(
          ['Almost none, by design', 'Not much, and no plan to change it', 'Some, in bursts', 'A steady amount, most days', 'More than is sustainable'],
          ['low', 'low', 'moderate', 'strong', 'excess'],
        ),
      ),
      q3(
        'niyama-study',
        'svadhyaya',
        'When did you last learn something about yourself deliberately?',
        'How are you keeping yourself in contact?',
        'Svādhyāya is not reading. It is the deliberate return to your own material — the notes, the recordings, the conversation you keep returning to. When did you last do that?',
        scale(
          ['I never do', 'Rarely, and only if something forces it', 'Now and then', 'Regularly, and it helps', 'It is a fixed part of how I work'],
          ['never', 'rare', 'occasional', 'regular', 'constant'],
        ),
      ),
      q3(
        'niyama-surrender',
        'ishvarapranidhana',
        'Can you hand something over that you cannot manage?',
        'Is there anything you are carrying that is not yours to carry?',
        'Surrender is not agreement and it is not passivity. It is the admission that you are not the whole of the situation. Can you make that admission?',
        scale(
          ['I cannot, under any circumstances', 'Rarely, and it costs me', 'With a lot of difficulty', 'Fairly readily, in most things', 'It is easy — I do not have to hold everything'],
          ['closed', 'closed', 'difficult', 'available', 'open'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'sauca',
        label: 'Śauca is the live one',
        short: 'Clarity of body, surroundings, or thought',
        description:
          'Purity and clarity are where your practice is. This usually shows up as an appetite for order — in your environment, your inputs, or the way you think — and it is more demanding on you than it is on anyone else.',
        shadow: 'Cleaning the room instead of sitting in it.',
        color: 'sky',
        masters: ['body', 'observation'],
        calibration: {
          dimensions: { body: 0.3, thought: 0.25 },
          practiceLevels: { body: 1, observation: 1 },
          tags: ['niyama', 'clarity'],
        },
      },
      {
        id: 'samtosha',
        label: 'Sāntosha is the live one',
        short: 'Enough is the question you keep deferring',
        description:
          'Contentment is your live niyama. Not because you lack ambition, but because contentment is the precondition for everything else in the set — without it, the yamas become a performance and the rest becomes strain.',
        shadow: 'Using contentment to avoid the next thing.',
        color: 'emerald',
        masters: ['witnessing', 'raja'],
        calibration: {
          dimensions: { emotion: 0.3, spirit: 0.25, body: 0.15 },
          practiceLevels: { witnessing: 1 },
          tags: ['niyama', 'contentment'],
        },
      },
      {
        id: 'tapas',
        label: 'Tāpas is the live one',
        short: 'The heat is on',
        description:
          'Sustained effort is your centre. You are running hot, and the question is not whether to push harder but whether the vessel holds. Tapas without the other four becomes suffering.',
        shadow: 'Confusing endurance with progress.',
        color: 'orange',
        masters: ['raja', 'karma'],
        calibration: {
          dimensions: { action: 0.35, body: 0.25 },
          practiceLevels: { raja: 1, karma: 1 },
          domainStress: { work: 'work-career' },
          tags: ['niyama', 'high-effort'],
        },
      },
      {
        id: 'svadhyaya',
        label: 'Svādhyāya is the live one',
        short: 'Keeping yourself in contact',
        description:
          'Deliberate self-study is your live discipline. You are the kind of person who benefits from returning to the same material — your own notes, your own recordings, your own patterns.',
        shadow: 'Gathering material instead of revisiting it.',
        color: 'violet',
        masters: ['jnana', 'self-inquiry'],
        calibration: {
          dimensions: { thought: 0.35, spirit: 0.2 },
          practiceLevels: { jnana: 1, 'self-inquiry': 1 },
          tags: ['niyama', 'self-study'],
        },
      },
      {
        id: 'ishvarapranidhana',
        label: 'Īśvarapraṇidhāna is the live one',
        short: 'Something larger is available',
        description:
          'Surrender and dedication are where your practice lives. There is an orientation toward something beyond your own making, and your work is learning what it asks for without shrinking.',
        shadow: 'Surrendering to something you have not looked at.',
        color: 'indigo',
        masters: ['bhakti', 'raja'],
        calibration: {
          dimensions: { spirit: 0.4, emotion: 0.2, connection: 0.15 },
          practiceLevels: { bhakti: 1, raja: 1 },
          tags: ['niyama', 'devotion'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'pranayama-capacity',
    title: 'Prāṇāyāma capacity',
    subtitle: 'How you meet the breath',
    module: 'Patanjali',
    tradition: 'yogic',
    dimensionCategory: 'vitality',
    coverEmoji: '🌬️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Prāṇāyāma is the fourth limb and, for most people, the first real obstacle. The difficulty is rarely breathwork itself — it is what happens when you try to control the one thing that has never stopped moving on its own.\n\nThis measures what actually happens when you intervene.',
    dimensions: ['breath-only', 'retention', 'sama', 'sushumna-aware'],
    engineHooks: {
      practiceAffinity: ['breath', 'kriya'],
      deepensWith: ['breath-pattern', 'meditation-depth'],
    },
    questions: [
      q3(
        'prana-hold',
        'capacity',
        'What happens when you try to hold your breath for ten seconds?',
        'When you hold the breath, what do you notice?',
        'Retention is the first test. The body answers before the mind does. What is your answer?',
        scale(
          ['It is impossible, and uncomfortable quickly', 'I can do it, but it fights me', 'I can hold it comfortably', 'I can hold it and something interesting happens', 'The breath holds itself'],
          ['uncomfortable', 'effortful', 'steady', 'responsive', 'autonomous'],
        ),
      ),
      q3(
        'prana-lengthen',
        'exhale',
        'Can you make your exhale longer than your inhale?',
        'What happens when you lengthen the out-breath?',
        'The longer exhale is the whole mechanism — it is how the system is told that the emergency is over. Can you do it without strain?',
        likert5('retention', [
          'Not without a lot of strain',
          'For a short time, with effort',
          'Yes, fairly comfortably',
          'Yes, and it settles me noticeably',
          'Yes, and the breath starts to move itself',
        ]),
      ),
      q3(
        'prana-spine',
        'sushumna',
        'Do you feel anything along your spine when you work with the breath?',
        'Is there a sensation along the centre line?',
        'The tradition describes a central channel. Whether or not that language fits, the question is empirical: is there anything there?',
        pickOne(
          ['No, nothing at all', 'Something, but I cannot place it', 'A sensation, low down', 'A clear line, sometimes', 'A distinct current I can follow'],
          ['nothing', 'faint', 'low', 'clear', 'distinct'],
        ),
      ),
      q3(
        'prana-dizzy',
        'response',
        'Does breathwork ever make you lightheaded or anxious?',
        'What does your system do when you slow the breath too far?',
        'This is not a failure. It is information about where your limit is and what your system treats as threat.',
        scale(
          ['I have never tried', 'Only slightly, and briefly', 'Yes, fairly reliably', 'Yes, and it is uncomfortable', 'I avoid it for that reason'],
          ['untried', 'mild', 'common', 'strong', 'avoidant'],
        ),
      ),
      q3(
        'prana-after',
        'settling',
        'How do you feel in the twenty minutes after real breathwork?',
        'What does it leave behind?',
        'Prāṇāyāma is supposed to settle. Whether it does for you, and for how long, is the actual measure of whether it suits you.',
        likert5('sama', [
          'Wired, or worse than before',
          'About the same',
          'A little steadier',
          'Clearly calmer for a while',
          'Calmer for the rest of the day',
        ]),
      ),
      q3(
        'prana-effort',
        'relationship',
        'How does the practice feel — is it something you do to your breath, or with it?',
        'Who is in charge during breathwork?',
        'Patañjali puts prāṇāyāma after asana and before pratyahāra, because the breath is the bridge. Does it feel like a bridge to you?',
        scale(
          ['I force it, and it resists', 'I control it more than it moves me', 'It is somewhere in between', 'We move together', 'I am watching something that happens'],
          ['forced', 'controlled', 'mixed', 'cooperative', 'observant'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'breath-only',
        label: 'Breath only',
        short: 'You are working with the breath as breath',
        description:
          'The breath is still just air, and intervening in it is effortful. This is the completely ordinary starting point and there is nothing wrong with it — prāṇāyāma becomes useful long after the sensation changes.',
        shadow: 'Reading effort as a sign you are doing it wrong.',
        color: 'slate',
        masters: ['breath', 'body'],
        calibration: {
          dimensions: { body: 0.35, thought: 0.15 },
          practiceLevels: { breath: 1, body: 1 },
          tags: ['prana', 'beginning'],
        },
      },
      {
        id: 'retention',
        label: 'Retention is available',
        short: 'You can hold and lengthen',
        description:
          'You have real capacity with retention and the longer exhale. The breath is still something you do, rather than something that happens — but the mechanism is working.',
        shadow: 'Pushing the retention further than it needs to go.',
        color: 'amber',
        masters: ['breath', 'raja'],
        calibration: {
          dimensions: { body: 0.3, spirit: 0.2 },
          practiceLevels: { breath: 2 },
          tags: ['prana', 'retention-works'],
        },
      },
      {
        id: 'sama',
        label: 'Sāma — the steadiness',
        short: 'It works, and you can feel it working',
        description:
          'The practice does what it is supposed to do: it settles the system and the settling lasts. This is the fourth limb doing its actual job.',
        shadow: 'Using the calm to keep going rather than to rest.',
        color: 'teal',
        masters: ['breath', 'raja'],
        calibration: {
          dimensions: { body: 0.3, spirit: 0.3, emotion: 0.2 },
          practiceLevels: { breath: 2, raja: 1 },
          tags: ['prana', 'steadying'],
        },
      },
      {
        id: 'sushumna-aware',
        label: 'The central channel is available',
        short: 'There is something there, and you can follow it',
        description:
          'You have direct experience of a central current and can work with it. The tradition calls this the sushumnā. Practically, it means the breath is giving you somewhere to go, not just something to regulate.',
        shadow: 'Chasing the sensation once it has become familiar.',
        color: 'indigo',
        masters: ['kriya', 'raja'],
        calibration: {
          dimensions: { spirit: 0.4, body: 0.25 },
          practiceLevels: { kriya: 1, raja: 1 },
          tags: ['prana', 'subtle'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'dharana',
    title: 'Dhāraṇā',
    subtitle: 'Your concentration muscle',
    module: 'Patanjali',
    tradition: 'yogic',
    dimensionCategory: 'witness',
    coverEmoji: '🎯',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'The sixth limb is holding one thing. Not noticing many things, not finding a state — holding.\n\nThe interesting part of concentration is not the holding. It is what happens in the interval between losing it and noticing you lost it.',
    dimensions: ['wandering', 'returning', 'sustained', 'one-pointed'],
    engineHooks: {
      practiceAffinity: ['raja', 'witnessing'],
      deepensWith: ['dhyana', 'meditation-depth'],
    },
    questions: [
      q3(
        'dhara-object',
        'object',
        'What do you hold onto when you concentrate?',
        'What is the thing you are actually holding?',
        'Concentration needs an object. What is yours, and is it holding still?',
        pickOne(
          ['A sound, or a part of it', 'The breath', 'A single sensation in the body', 'A thought, held open', 'A name, a mantra, or a word'],
          ['sound', 'breath', 'sensation', 'thought', 'mantra'],
        ),
      ),
      q3(
        'dhara-length',
        'duration',
        'How long can you hold before the mind leaves?',
        'Before you drift, how long does it hold?',
        'The length is not a score. It is just the shape of where you actually are right now.',
        scale(
          ['A few seconds', 'Under a minute', 'A few minutes', 'Ten minutes or more', 'It holds longer than I can pay attention to'],
          ['brief', 'short', 'moderate', 'long', 'enduring'],
        ),
      ),
      q3(
        'dhara-return',
        'return',
        'When you notice you have drifted, what brings you back?',
        'What is the actual mechanism of return?',
        'Everyone returns. What yours uses is worth knowing — a jolt, a re-aiming, a fresh start, or nothing at all.',
        scale(
          ['Nothing — I usually do not notice', 'A jolt of frustration', 'A fresh start on the breath', 'A deliberate re-aiming', 'Something quite subtle'],
          ['unaware', 'forceful', 'reset', 'deliberate', 'subtle'],
        ),
      ),
      q3(
        'dhara-effort',
        'effort',
        'How hard is it to hold — gripping, or leaning?',
        'What does the attention feel like while it holds?',
        'Concentration that is clenched is a different thing from concentration that is easy. Which is yours?',
        scale(
          ['I grip, and it slips', 'It takes constant effort', 'Some effort, mostly stable', 'Relaxed and steady', 'Effortless, and the object holds itself'],
          ['gripped', 'effortful', 'moderate', 'relaxed', 'effortless'],
        ),
      ),
      q3(
        'dhara-obstacle',
        'obstacle',
        'What most reliably breaks your concentration?',
        'What is the usual thief?',
        'Each person has a characteristic thief. Knowing yours tells you what to build first.',
        pickOne(
          ['Boredom and restlessness', 'Physical discomfort', 'Emotion — something arising', 'Noise, or the people around me', 'Nothing in particular; it just goes'],
          ['boredom', 'body', 'emotion', 'environment', 'nothing'],
        ),
      ),
      q3(
        'dhara-off',
        'transfer',
        'Does that concentration follow you out of sitting?',
        'Does it transfer, or does it stay on the cushion?',
        'The point of holding one thing is being able to hold one thing anywhere. Does it transfer?',
        likert5('sustained', [
          'Not at all — it stays there',
          'Briefly, right afterwards',
          'For a while, in low-stakes situations',
          'In most situations, if I remember to use it',
          'It has become how I work, not just how I sit',
        ]),
      ),
    ],
    resultTypes: [
      {
        id: 'wandering',
        label: 'Wandering',
        short: 'Leaving before you notice',
        description:
          'Attention is not staying, and — more importantly — you often do not notice it leaving. This is the most common starting point and the most improvable one, because the noticing is what develops first.',
        shadow: 'Reading the wandering as a failure of discipline.',
        color: 'rose',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.2 },
          practiceLevels: { observation: 1, witnessing: 1 },
          tags: ['dharana', 'unstable'],
        },
      },
      {
        id: 'returning',
        label: 'Returning',
        short: 'The return is the practice',
        description:
          'You leave and you come back. The coming-back is the whole mechanism of dhāraṇā, and doing it many times is not a failure to concentrate — it is concentrating.',
        shadow: 'Judging each return by how long you were gone.',
        color: 'amber',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.25, spirit: 0.25, body: 0.1 },
          practiceLevels: { observation: 1, witnessing: 1 },
          tags: ['dharana', 'returning'],
        },
      },
      {
        id: 'sustained',
        label: 'Sustained',
        short: 'It holds, without much fight',
        description:
          'You can hold one thing for a real stretch and it is not costing you much. The next question is what happens when the object stops being pleasant.',
        shadow: 'Concentration that only works on pleasant objects.',
        color: 'teal',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.2, spirit: 0.3 },
          practiceLevels: { raja: 1, witnessing: 1 },
          tags: ['dharana', 'sustained'],
        },
      },
      {
        id: 'one-pointed',
        label: 'One-pointed',
        short: 'The object holds itself',
        description:
          'Concentration has become natural rather than applied. The interesting edge case is whether it survives contact with something unpleasant — that is where the next limb begins.',
        shadow: 'Retreat into the comfortable object.',
        color: 'indigo',
        masters: ['raja', 'kriya'],
        calibration: {
          dimensions: { spirit: 0.4, thought: 0.2 },
          practiceLevels: { raja: 2 },
          tags: ['dharana', 'one-pointed'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'dhyana',
    title: 'Dhyāna',
    subtitle: 'The flow of unbroken attention',
    module: 'Patanjali',
    tradition: 'yogic',
    dimensionCategory: 'witness',
    coverEmoji: '🌊',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Dhāraṇā is holding. Dhyāna is what holding becomes when you stop having to do it.\n\nThe distinction is not a technicality. Holding is effort; flowing is what effort was for.',
    dimensions: ['broken', 'flowing', 'continuous', 'expanded'],
    engineHooks: {
      practiceAffinity: ['raja', 'witnessing'],
      deepensWith: ['meditation-depth', 'dharana'],
    },
    questions: [
      q3(
        'dhyana-flow',
        'quality',
        'When attention settles, is it steady or does it keep breaking?',
        'How continuous is it once it has settled?',
        'Flow is a quality, not a duration. Is the current continuous or does it keep restarting?',
        scale(
          ['It breaks constantly', 'It breaks regularly', 'It holds, with gaps', 'It flows for a real stretch', 'It does not break at all'],
          ['broken', 'broken', 'gappy', 'flowing', 'continuous'],
        ),
      ),
      q3(
        'dhyana-noticed',
        'awareness',
        'Do you notice the flow while it is happening?',
        'Are you inside the flow, or watching it?',
        'These are different states that feel almost identical from the inside. Which is it?',
        pickOne(
          ['I am completely inside it', 'I am inside it, and also know I am', 'I am watching it from a slight distance', 'I am the one watching it happen', 'I can no longer tell the difference'],
          ['absorbed', 'both', 'observing', 'witnessing', 'indistinguishable'],
        ),
      ),
      q3(
        'dhyana-content',
        'content',
        'What is present during the flow — thoughts, or something else?',
        'What is actually there?',
        'Traditional description involves an inner state of clarity rather than thought-content. Is that yours, or is it the thoughts flowing more smoothly?',
        pickOne(
          ['Thoughts, flowing smoothly', 'Mostly thoughts, with gaps', 'A mix of both', 'Clarity more than content', 'Something with no content at all'],
          ['thoughts', 'thoughts', 'mixed', 'clarity', 'contentless'],
        ),
      ),
      q3(
        'dhyana-elsewhere',
        'transfer',
        'Does this happen outside formal sitting?',
        'Does the flow follow you into ordinary life?',
        'A state that only appears on the cushion has not really arrived. Does it travel?',
        scale(
          ['Never — it is a sitting-only state', 'Rarely, and briefly', 'Sometimes, in quiet moments', 'Often, in ordinary activity', 'It is more or less continuous now'],
          ['none', 'rare', 'occasional', 'frequent', 'continuous'],
        ),
      ),
      q3(
        'dhyana-after',
        'residue',
        'How do you feel for some time after a session like that?',
        'What is left afterwards?',
        'The residue is a more honest measure than the experience itself, because the experience can be remembered generously.',
        likert5('continuous', [
          'Drained, or mildly worse',
          'About the same as before',
          'Slightly clearer',
          'Clearly settled for a while',
          'Changed — and still changed later in the day',
        ]),
      ),
      q3(
        'dhyana-seek',
        'direction',
        'Do you try to reach it, or wait for it?',
        'Is it something you pursue or something that arrives?',
        'The two approaches are both legitimate and they fail differently. Which is yours?',
        scale(
          ['I chase it hard', 'I try to set it up', 'I make the conditions and wait', 'It comes and goes regardless', 'I stopped trying to produce it'],
          ['chasing', 'constructing', 'preparing', 'passive', 'released'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'broken',
        label: 'Broken',
        short: 'The flow keeps restarting',
        description:
          'Attention reaches a settled state and then returns to the surface. Dhyāna is not here yet, and the good news is that this is what dhāraṇā is for.',
        shadow: 'Reaching for a depth the foundation is not built for.',
        color: 'rose',
        masters: ['observation', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.3, spirit: 0.15 },
          practiceLevels: { observation: 1, witnessing: 1 },
          tags: ['dhyana', 'restless'],
        },
      },
      {
        id: 'flowing',
        label: 'Flowing',
        short: 'It flows, with gaps',
        description:
          'There are real stretches of unbroken attention. They are not long yet, and they are fragile, but the capacity is present and the gaps are getting shorter.',
        shadow: 'Reaching for a depth the foundation is not built for.',
        color: 'amber',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { thought: 0.2, spirit: 0.3 },
          practiceLevels: { raja: 1, witnessing: 1 },
          tags: ['dhyana', 'flowing'],
        },
      },
      {
        id: 'continuous',
        label: 'Continuous',
        short: 'Unbroken, and it leaves something behind',
        description:
          'Unbroken attention is genuinely available and it has a lasting residue. This is dhyāna proper, and it is doing real work on the rest of your life whether you notice or not.',
        shadow: 'Noticing the state more than the change it produces.',
        color: 'teal',
        masters: ['raja', 'witnessing'],
        calibration: {
          dimensions: { spirit: 0.4, thought: 0.2, emotion: 0.15 },
          practiceLevels: { raja: 2 },
          tags: ['dhyana', 'continuous'],
        },
      },
      {
        id: 'expanded',
        label: 'Expanded',
        short: 'It no longer has an inside',
        description:
          'The distinction between the one concentrating and the thing concentrated upon has become unreliable. Patañjali describes what remains as samādhi. Practically: the state travels, and it is difficult to get back to ordinary life afterwards.',
        shadow: 'Preferring the state to what it was for.',
        color: 'indigo',
        masters: ['raja', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.45, thought: 0.2 },
          practiceLevels: { raja: 2, jnana: 1 },
          tags: ['dhyana', 'wide'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'vairagya',
    title: 'Vairāgya',
    subtitle: 'Dispassion without coldness',
    module: 'Patanjali',
    tradition: 'vedic',
    dimensionCategory: 'attachment',
    coverEmoji: '🍂',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Vairāgya is the last limb and the one most often faked. It is commonly confused with indifference, with having got over something, or with simply not caring any more.\n\nIt is none of those. It is the capacity to be fully present with something without needing it to be different.',
    dimensions: ['attached', 'disenchanted', 'detached', 'dispassionate'],
    engineHooks: {
      practiceAffinity: ['witnessing', 'jnana'],
      deepensWith: ['vairagya-progress', 'detachment-grade'],
    },
    questions: [
      q3(
        'vairagya-want',
        'wanting',
        'How much do you still want, from the things that once mattered?',
        'Is the wanting still there?',
        'Vairāgya is not the absence of wanting. It is wanting that no longer decides anything. How much wanting is left?',
        scale(
          ['I want it as much as ever', 'I want it, and I know it', 'The wanting is quieter', 'I still want it, and it does not drive me', 'I have stopped wanting most of it'],
          ['high', 'high', 'moderate', 'detached', 'released'],
        ),
      ),
      q3(
        'vairagya-catch',
        'catching',
        'When wanting shows up, do you notice it, or does it just run you?',
        'What happens when the wanting arrives?',
        'The gap between wanting appearing and you acting on it is the whole of the practice. How wide is that gap?',
        scale(
          ['Zero — it runs me', 'Very narrow', 'Narrow, but present', 'Wide enough to choose', 'It arrives and I am simply not in it'],
          ['none', 'narrow', 'moderate', 'wide', 'absent'],
        ),
      ),
      q3(
        'vairagya-cold',
        'warmth',
        'Have you gone cold on people, or is it still warm?',
        'Is there warmth left in how you are with people?',
        'Cold is the common imitation of vairāgya. It feels similar and it is a withdrawal, not a release. Which is it?',
        likert5('dispassionate', [
          'I have gone cold, and I do not mind',
          'I have gone cold, and I am not sure I like it',
          'Somewhat cooler than before',
          'Cooler, but the warmth is still there',
          'Free of the wanting and just as warm',
        ]),
      ),
      q3(
        'vairagya-hard',
        'specific',
        'Is there one specific thing you cannot let go of?',
        'What is the one you are still holding?',
        'Vairāgya is general. What it is tested by is one particular thing. What is yours?',
        pickOne(
          ['A relationship', 'A possession or a place', 'A role or an identity', 'An outcome I am waiting on', 'Nothing specific — it has all loosened'],
          ['relationship', 'object', 'identity', 'outcome', 'clear'],
        ),
      ),
      q3(
        'vairagya-cost',
        'cost',
        'Has letting go cost you anything, or only gained?',
        'What did the release take?',
        'A release that costs nothing was probably not a release. What did it take?',
        scale(
          ['Nothing — it was pure gain', 'A little numbness', 'A real loss, and it was worth it', 'A real loss, and I still feel it', 'I do not know yet'],
          ['none', 'small', 'accepted', 'unresolved', 'unknown'],
        ),
      ),
      q3(
        'vairagya-still',
        'engagement',
        'Are you still fully in your life, or partly out of it?',
        'How much of you is actually here?',
        'Detachment can become a way of not being present. The test is engagement, not altitude. How engaged are you?',
        scale(
          ['Half of me is somewhere else', 'Present in body, absent in attention', 'Here when it matters', 'Fully here, most of the time', 'Committed and not detached from the outcome'],
          ['withdrawn', 'withdrawn', 'present', 'present', 'engaged'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'attached',
        label: 'Attached',
        short: 'The wanting still runs things',
        description:
          'Wanting is still the deciding force in a good number of your decisions, and it is not a flaw — it is where the work is. Notice that the wanting tends to look reasonable from the inside, which is what makes it hard to see.',
        shadow: 'Reading the intensity of the wanting as evidence you should want it.',
        color: 'orange',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { emotion: 0.3, action: 0.2, thought: 0.2 },
          practiceLevels: { witnessing: 1, jnana: 1 },
          tags: ['vairagya', 'attached'],
        },
      },
      {
        id: 'disenchanted',
        label: 'Disenchanted',
        short: 'The wanting has cooled, and so has everything else',
        description:
          'The interest has gone out of things that once held you, and it has gone out of the people involved too. This is frequently mistaken for progress. It is closer to a withdrawal, and it is reversible.',
        shadow: 'Mistaking a low mood for a freed one.',
        color: 'slate',
        masters: ['bhakti', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.3, connection: 0.2, body: 0.15 },
          practiceLevels: { bhakti: 1, witnessing: 1 },
          domainStress: { contact: 'relationship' },
          tags: ['vairagya', 'disenchanted'],
        },
      },
      {
        id: 'detached',
        label: 'Detached',
        short: 'You can step back and stay warm',
        description:
          'You are no longer driven by the outcome and the warmth is still there. This is a working vairāgya — the thing is still in your life and you are not invested in how it turns out.',
        shadow: 'Letting the detachment become a refusal to care.',
        color: 'teal',
        masters: ['karma', 'witnessing'],
        calibration: {
          dimensions: { action: 0.3, spirit: 0.25, emotion: 0.2 },
          practiceLevels: { karma: 1, witnessing: 1 },
          tags: ['vairagya', 'detached'],
        },
      },
      {
        id: 'dispassionate',
        label: 'Dispassionate',
        short: 'Free of the needing, and fully in it',
        description:
          'The wanting is no longer the operator, and neither is the absence of wanting. What is left is engagement without a stake in the outcome. The tradition treats this as a stage rather than a destination, because it can still be lost.',
        shadow: 'Confusing the state with having arrived.',
        color: 'emerald',
        masters: ['witnessing', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.4, emotion: 0.25, action: 0.15 },
          practiceLevels: { witnessing: 2, jnana: 1 },
          tags: ['vairagya', 'free'],
        },
      },
    ],
  },
];
