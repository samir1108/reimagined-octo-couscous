/**
 * MODULE 9 · HEART, BONDS & SHADOW (mirrors 81–90)
 *
 * The heart module. These go to what is hardest to look at directly and
 * easiest to manage from a distance: desire, grief, anger, the accounts kept
 * against people, the setting trust starts at, and the way love is actually
 * given.
 *
 * Tone rule for this file: matter and plain. No salacious framing, no
 * consolation, no diagnosis, no promises. These are the questions people avoid,
 * and the avoidance is the only thing keeping them expensive.
 *
 * Surface tier stays situational. Core tier names the mechanism and turns the
 * lens back on the one asking.
 */

import { q3, likert5, pickOne, scale, type MirrorBank } from './types';

export const HEART_BANKS: MirrorBank[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'sexuality-eros',
    title: 'Sexuality & eros',
    subtitle: 'Kāma — met honestly',
    module: 'Heart',
    tradition: 'vedic',
    dimensionCategory: 'attachment',
    coverEmoji: '🕯️',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Kāma is the tradition’s word for desire in the widest sense — attraction, wanting, and the pull that something has on you. It is not a moral category. It is what a body does when it reaches for something, and it does not stop because it has been told to.\n\nThis asks how that is handled in your life: whether it is shameful or ordinary, whether it is said or swallowed, and whether it is bound up with love or kept somewhere separate. It is not asking how much of it you have. It is asking what you do with it.',
    dimensions: ['suppressed', 'obligated', 'expressive', 'integrated'],
    engineHooks: {
      loopsToCheck: ['shame', 'avoidance'],
      practiceAffinity: ['bhakti', 'relationship'],
    },
    questions: [
      q3(
        'eros-place',
        'desire',
        'Where does wanting sit in your daily life?',
        'How much of your attention goes to what you want, and how much to managing the wanting?',
        'Desire is the one part of you that never takes a holiday. Do you meet it as a fact, a problem, or a duty?',
        scale(
          [
            'It is not something I look at',
            'I keep it out of sight',
            'I allow it in the forms I am allowed to allow it',
            'I say what I want, plainly',
            'I want what I want, and it needs no separate category',
          ],
          ['suppressed', 'suppressed', 'obligated', 'expressive', 'integrated'],
        ),
      ),
      q3(
        'eros-shame',
        'shame',
        'Growing up, was desire treated as something to be embarrassed about?',
        'What message did you receive about wanting things, and about being wanted?',
        'Shame about desire is not in the body. It is in what you were handed, and then maintained by hand. How much of it are you still maintaining?',
        likert5('shame', ['Heavily', 'Fairly', 'Some of it', 'Mostly not', 'Not at all, and it was spoken of plainly']),
      ),
      q3(
        'eros-said',
        'expression',
        'How much of what you actually want do you say out loud?',
        'When you want something, how often do you name it?',
        'Every unsaid want becomes an unspoken expectation, and those are the ones that later turn into resentment. How large is the pile?',
        scale(
          ['Almost none of it', 'Very little of it', 'Some of it', 'Most of it', 'All of it, and early'],
          ['none', 'none', 'partial', 'stated', 'stated'],
        ),
      ),
      q3(
        'eros-for',
        'function',
        'What is desire mostly for, as far as you can tell?',
        'What does wanting actually get you?',
        'Desire serves something, whether or not you chose the something. What is it serving?',
        pickOne(
          [
            'Pleasure, mostly',
            'Connection, mostly',
            'Something to want while I get on with the rest of it',
            'A sense of being desirable, or worth something',
            'I have not honestly worked this out',
          ],
          ['pleasure', 'connection', 'distraction', 'validation', 'unclear'],
        ),
      ),
      q3(
        'eros-split',
        'love',
        'Can you be in love with someone and want them at the same time?',
        'Have affection and desire ever been handed to you as two separate things?',
        'Desire that is not allowed to join love gets sent somewhere else — usually into power, or into being looked at. Where has yours gone?',
        scale(
          [
            'They have nothing to do with each other for me',
            'They are separate, and I keep them separate',
            'They are joined, but awkward',
            'They are joined and mostly easy',
            'I have never had to separate them',
          ],
          ['split', 'split', 'partial', 'joined', 'joined'],
        ),
      ),
      q3(
        'eros-body',
        'body',
        'How do you treat your own body in relation to all this?',
        'Where does your body sit in relation to this part of your life?',
        'A body can be a place you live, a thing you maintain, or a thing you cover. Which one is yours?',
        scale(
          ['Something to manage and cover', 'Something to manage', 'Mine, without much thought either way', 'A place I enjoy being in', 'The place I actually live'],
          ['managed', 'managed', 'neutral', 'inhabited', 'inhabited'],
        ),
      ),
      q3(
        'eros-integration',
        'integration',
        'If this part of your life were properly sorted, what would change?',
        'What would be different if you were not managing this any more?',
        'Integration is not more desire. It is desire no longer needing a separate file. What would that free?',
        scale(
          ['I genuinely cannot name it', 'A little less tension', 'I would be less hard on myself', 'I would be more available to the people close to me', 'The whole area would stop being a subject'],
          ['unknown', 'tension', 'self', 'available', 'whole'],
        ),
      ),
      q3(
        'eros-restraint',
        'boundary',
        'Is there restraint around any of this, and where does that restraint come from?',
        'How much rule is there here, and whose rule is it?',
        'Rule in this area is almost never personal. It was assigned, usually early, by someone with an interest in it. Have you ever looked at the assignment?',
        pickOne(
          [
            'Not much of it',
            'A fair amount, and I set it myself',
            'It comes from my family',
            'It comes from religion, or from my values',
            'It comes from somewhere I have never examined',
          ],
          ['none', 'self', 'family', 'values', 'unexamined'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'suppressed',
        label: 'Suppressed',
        short: 'Desire is not being looked at',
        description:
          'The wanting is there and the looking is not. What has been shut down is not the capacity — it is the relationship to it, and that relationship was set by someone else a long time ago. This resolves with contact, not with decisions.',
        shadow: 'Reading the absence of desire as the absence of a life.',
        color: 'rose',
        masters: ['bhakti', 'emotional-healing'],
        calibration: {
          dimensions: { emotion: 0.35, connection: 0.25, body: 0.15 },
          practiceLevels: { bhakti: 1, 'emotional-healing': 1 },
          domainStress: { relation: 'relationship' },
          tags: ['desire-disowned', 'shame-carrying'],
        },
      },
      {
        id: 'obligated',
        label: 'Obligated',
        short: 'Only permitted in certain forms',
        description:
          'Wanting has been given a narrow channel and a set of conditions. Inside those conditions it is expressed; outside them it goes quiet. The result is a life where intimacy has a job description attached to it.',
        shadow: 'Confusing the role with the person in it.',
        color: 'amber',
        masters: ['relationship', 'karma'],
        calibration: {
          dimensions: { connection: 0.3, emotion: 0.25, action: 0.15 },
          practiceLevels: { relationship: 1, karma: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['duty-shaped', 'role-bound'],
        },
      },
      {
        id: 'expressive',
        label: 'Expressive',
        short: 'Wanting is alive and said plainly',
        description:
          'Desire is available to you and it is named when it appears. That makes it workable — the costs of this shape are honesty and some exposure, and both are cheaper than the alternative.',
        shadow: 'Offering what is wanted instead of what is wanted by you.',
        color: 'teal',
        masters: ['bhakti', 'relationship'],
        calibration: {
          dimensions: { emotion: 0.25, connection: 0.3, body: 0.2 },
          practiceLevels: { bhakti: 1, relationship: 1 },
          tags: ['desire-alive', 'direct'],
        },
      },
      {
        id: 'integrated',
        label: 'Integrated',
        short: 'Wanting and loving are one movement',
        description:
          'Desire no longer has to be exiled for love to be serious, and it no longer has to be exaggerated for it to be felt. This is the shape where the eros stops being a separate department of the life.',
        shadow: 'Integration used as a reason to stop looking.',
        color: 'violet',
        masters: ['bhakti', 'tantra'],
        calibration: {
          dimensions: { spirit: 0.3, connection: 0.25, emotion: 0.2 },
          practiceLevels: { bhakti: 2, tantra: 1 },
          tags: ['desire-integrated', 'no-split'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'grief-reservoir',
    title: 'Grief reservoir',
    subtitle: 'The tears not yet wept',
    module: 'Heart',
    tradition: 'yogic',
    dimensionCategory: 'emotion',
    coverEmoji: '🌧️',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Grief is not one event. It is a long process, and most people lose it somewhere — usually by carrying on before it has finished.\n\nThis looks at what is still in the reservoir: what has not been grieved, what is being carried on other people’s behalf, and what the withholding is actually doing. It does not ask you to open anything. It asks you to read the level.',
    dimensions: ['unfelt', 'held', 'surfacing', 'moved-through'],
    engineHooks: {
      loopsToCheck: ['grief-avoidance', 'holding-space'],
      practiceAffinity: ['emotional-healing', 'bhakti'],
    },
    questions: [
      q3(
        'grief-what',
        'inventory',
        'Is there something you have not properly grieved?',
        'Name the thing you keep circling without ever finishing.',
        'Setting aside the large losses — something smaller that you tidied away the day after. What is still unprocessed?',
        pickOne(
          [
            'Something recent and specific',
            'A person who died',
            'A relationship or a friendship that ended',
            'A version of my life that did not happen',
            'Nothing in particular — it is everywhere at once',
          ],
          ['recent', 'death', 'ending', 'unlived', 'diffuse'],
        ),
      ),
      q3(
        'grief-tears',
        'body',
        'When something touches you, do the tears actually come?',
        'How available is weeping to you?',
        'Tears move things that talking does not. How much access do you have to that channel?',
        scale(
          ['I do not seem to produce them', 'Only rarely, and I stop them', 'They come and I let them finish', 'Quite easily', 'Very easily — it is the only thing that helps'],
          ['blocked', 'blocked', 'available', 'easy', 'easy'],
        ),
      ),
      q3(
        'grief-carrying',
        'carrying',
        'Are you carrying anything on behalf of other people?',
        'How much of what you hold actually belongs to someone else?',
        'Grief is contagious and it is carried silently, by whoever is nearest. How much of your load is not yours to carry?',
        scale(
          ['None of it', 'One person’s', 'A few people’s', 'A great deal of it', 'Almost everything I carry is other people’s'],
          ['none', 'one', 'several', 'much', 'others'],
        ),
      ),
      q3(
        'grief-obstacle',
        'block',
        'What is stopping the grieving?',
        'If it has not moved, what has it hit against?',
        'Not starting is a decision, even when it was never consciously made. What is that decision protecting?',
        pickOne(
          [
            'I do not know how to',
            'It feels like weakness, or self-indulgence',
            'I believe I would not come back from it',
            'I would not know what to do with what came out',
            'I suspect there is nothing on the other side',
          ],
          ['unclear', 'shame', 'collapse', 'unsure', 'empty'],
        ),
      ),
      q3(
        'grief-volume',
        'volume',
        'If it moved, how much do you think would come out?',
        'Take the measure of what is in there.',
        'You have been containing this for some time. Nobody knows the size of it better than you. How big is it?',
        scale(
          ['I would rather not find out', 'A little', 'A lot of years', 'Everything from one year onwards', 'I have no idea how much is in there'],
          ['unknown', 'small', 'large', 'vast', 'unknown'],
        ),
      ),
      q3(
        'grief-function',
        'function',
        'Is there a reason the grief is still where it is?',
        'What does holding on to it do for you?',
        'Grief that is never allowed to move becomes identity. Has this one become that?',
        pickOne(
          [
            'No reason — it is simply still there',
            'It keeps something else in place',
            'It explains my life to me',
            'It keeps that period from being over',
            'It has become who I am',
          ],
          ['none', 'function', 'explanation', 'past', 'identity'],
        ),
      ),
      q3(
        'grief-witnessed',
        'witness',
        'Has anyone ever actually seen you grieve?',
        'Has this ever been in front of another person, or only in private?',
        'Grief that has not been witnessed is not half-grieved. It is stored rather than processed. Which is this?',
        scale(
          ['No one has', 'Once, briefly', 'In a room full of people, but not really', 'A few times, with someone safe', 'Yes, and it changed something'],
          ['unwitnessed', 'brief', 'grouped', 'held', 'held'],
        ),
      ),
      q3(
        'grief-deliberate',
        'containment',
        'How much of the withholding is on purpose?',
        'How deliberate is the holding?',
        'There is a difference between grief you cannot reach and grief you are not going to reach. How much of yours is the second?',
        scale(
          ['None of it is deliberate', 'A little', 'A fair amount', 'Most of it', 'All of it, and I know exactly where I hold it'],
          ['none', 'little', 'some', 'most', 'deliberate'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'unfelt',
        label: 'Unfelt',
        short: 'Still in there, untouched',
        description:
          'The loss has been filed rather than processed, and it is stored with the accuracy it was given. Nothing has been avoided on purpose, which is what makes it hard to find from the inside. Contact is the route, not resolution.',
        shadow: 'Believing time alone was the treatment.',
        color: 'rose',
        masters: ['emotional-healing', 'bhakti'],
        calibration: {
          dimensions: { emotion: 0.4, body: 0.25, thought: 0.1 },
          practiceLevels: { 'emotional-healing': 2, bhakti: 1 },
          domainStress: { state: 'emotional-healing' },
          tags: ['grief-unprocessed', 'filed'],
        },
      },
      {
        id: 'held',
        label: 'Held',
        short: 'Carried rather than felt',
        description:
          'You are holding a considerable amount — often on behalf of other people, often without being asked. It is being carried competently. The cost is that carrying is not the same as moving, and the weight does not get lighter while it is held.',
        shadow: 'Mistaking strength for having processed it.',
        color: 'amber',
        masters: ['emotional-healing', 'relationship'],
        calibration: {
          dimensions: { emotion: 0.35, connection: 0.25, action: 0.15 },
          practiceLevels: { 'emotional-healing': 1, relationship: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['carrying-others', 'contained'],
        },
      },
      {
        id: 'surfacing',
        label: 'Surfacing',
        short: 'It is starting to move on its own',
        description:
          'The process is under way, sometimes deliberately and sometimes without your permission. Waves are arriving, and the experience is not always comfortable. What surfaces now does not have to be the biggest thing — it is the next thing.',
        shadow: 'Rushing the whole reservoir at once.',
        color: 'orange',
        masters: ['emotional-healing', 'body'],
        calibration: {
          dimensions: { emotion: 0.35, body: 0.3, spirit: 0.15 },
          practiceLevels: { 'emotional-healing': 2, body: 1 },
          domainStress: { state: 'emotional-healing' },
          tags: ['grief-moving', 'active-process'],
        },
      },
      {
        id: 'moved-through',
        label: 'Moved through',
        short: 'You have been through it and come out',
        description:
          'The work has been done, and the capacity to feel it is intact — which is why this can be lost again later and felt honestly. Having moved through grief once does not immunise you from it. It does tell you that you can.',
        shadow: 'Staying on the far side of it, out of reach.',
        color: 'emerald',
        masters: ['bhakti', 'emotional-healing'],
        calibration: {
          dimensions: { emotion: 0.2, spirit: 0.3, connection: 0.2 },
          practiceLevels: { bhakti: 1, 'emotional-healing': 1 },
          tags: ['grieved', 'capacity-intact'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'anger-signature',
    title: 'Anger signature',
    subtitle: 'The shape of your fire',
    module: 'Heart',
    tradition: 'yogic',
    dimensionCategory: 'emotion',
    coverEmoji: '🔥',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Anger is not the problem. It is a signal with a job, and it arrives for reasons that usually predate the occasion.\n\nThis maps where yours goes: whether it is swallowed, withdrawn into coldness, leaked sideways, said plainly, or turned back at yourself — and what it is actually saying when it shows up. The aim is not to become calmer. It is to find out what the fire is for.',
    dimensions: ['suppressed', 'leaked', 'expressed', 'transmuted'],
    engineHooks: {
      loopsToCheck: ['anger', 'resentment'],
      practiceAffinity: ['emotional-healing', 'body'],
    },
    questions: [
      q3(
        'anger-for',
        'function',
        'What is your anger for, when it turns up?',
        'What job is your anger actually doing?',
        'Every anger is an instruction. Read the instruction, not the reaction. What is yours saying?',
        pickOne(
          [
            'To keep me safe',
            'To get a result',
            'To mark a limit I never set out loud',
            'I do not really know',
            'I have never let myself find out',
          ],
          ['protection', 'result', 'boundary', 'unclear', 'unexamined'],
        ),
      ),
      q3(
        'anger-exit',
        'expression',
        'How does anger usually get out of you?',
        'Which route does it take?',
        'Four routes: held in, withdrawn into coldness, leaked into small things, or said. Which one is your default?',
        pickOne(
          [
            'It does not get out — I swallow it',
            'It goes cold — I go quiet and distant',
            'It leaks into the small things I say to people',
            'It comes out loudly and directly',
            'It comes out when it is meant to, and no more than that',
          ],
          ['swallowed', 'withdrawn', 'leaked', 'direct', 'regulated'],
        ),
      ),
      q3(
        'anger-body',
        'body',
        'Where do you feel it in the body?',
        'Trace it. Where does it actually live?',
        'Emotion is bodily before it is mental. If you cannot locate yours, that is the first thing worth knowing.',
        scale(
          ['I do not feel it in my body at all', 'Jaw and face', 'Chest and throat', 'Stomach and gut', 'Everywhere, with nowhere to put it'],
          ['absent', 'jaw', 'chest', 'gut', 'diffuse'],
        ),
      ),
      q3(
        'anger-protects',
        'protection',
        'What is it protecting?',
        'Underneath the anger, what is being guarded?',
        'Anger is a wall with something behind it. If the wall came down, what would be standing there?',
        scale(
          ['Nothing in particular', 'My pride', 'My limits', 'My people', 'My sense of what is fair'],
          ['nothing', 'pride', 'limits', 'others', 'fairness'],
        ),
      ),
      q3(
        'anger-after',
        'aftermath',
        'What is left an hour after it has gone?',
        'What does the rest of the day feel like?',
        'The reaction is short. Look at the invoice, which arrives later and never mentions the reaction. What does it say?',
        scale(
          ['Shame, and I apologise for having been there at all', 'A long sulk, mostly at myself', 'Nothing much — it passes', 'Relief', 'I feel closer to the person than before'],
          ['shame', 'sulking', 'flat', 'relief', 'closeness'],
        ),
      ),
      q3(
        'anger-inward',
        'direction',
        'How much of your anger is aimed at yourself?',
        'Which way does most of the fire actually point?',
        'Anger turned inward does not stay quiet. It becomes the voice you use on yourself all day. Whose voice is it?',
        scale(
          ['Not at all', 'A little self-criticism', 'Regularly, and not gently', 'Most of it is aimed at me', 'I am my own harshest critic'],
          ['none', 'some', 'regular', 'mostly', 'total'],
        ),
      ),
      q3(
        'anger-says',
        'content',
        'What is it actually saying when it appears?',
        'Strip the stated reason off it. What claim is being made?',
        'The claim is usually old, and usually about a limit. Read it plainly. What is it asking for?',
        scale(
          ['I have never asked', 'I have a rough idea', 'It is a limit I never set out loud', 'It is a grief I did not finish', 'It is old, and it is not really about now'],
          ['unasked', 'rough', 'boundary', 'grief', 'old'],
        ),
      ),
      q3(
        'anger-speed',
        'intensity',
        'How quickly does it escalate?',
        'How fast does it go from nothing to a lot?',
        'The rate of escalation tells you how much stored energy is behind it. Where is yours?',
        scale(
          ['It hardly rises at all', 'Mild irritation', 'Real heat', 'A great deal of heat', 'It can go from nothing to a great deal in a second'],
          ['low', 'low', 'medium', 'high', 'volatile'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'suppressed',
        label: 'Suppressed',
        short: 'It goes in and does not come out',
        description:
          'The fire is fully functional and has nowhere to go, which means it is being converted into something else — usually control, fatigue, or a body that is permanently braced. Swallowed anger does not disappear. It changes address.',
        shadow: 'Reading the absence of conflict for peace.',
        color: 'rose',
        masters: ['emotional-healing', 'body'],
        calibration: {
          dimensions: { emotion: 0.4, body: 0.3, thought: 0.15 },
          practiceLevels: { 'emotional-healing': 2, body: 1 },
          domainStress: { state: 'emotional-healing' },
          tags: ['anger-swallowed', 'inward'],
        },
      },
      {
        id: 'leaked',
        label: 'Leaked',
        short: 'It comes out sideways and small',
        description:
          'The anger is not addressed, so it distributes. It turns up as irritation with people who did not cause it, as short temper, and as a general lowering of the tone of a relationship. The people who receive it are almost never the right recipients.',
        shadow: 'Mistaking the target for the source.',
        color: 'orange',
        masters: ['emotional-healing', 'relationship'],
        calibration: {
          dimensions: { emotion: 0.35, connection: 0.3, action: 0.15 },
          practiceLevels: { 'emotional-healing': 1, relationship: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['anger-leaked', 'displaced'],
        },
      },
      {
        id: 'expressed',
        label: 'Expressed',
        short: 'It comes out, and it is said',
        description:
          'The signal gets delivered rather than stored. There is a cost in the room while it is happening, and a real reduction in what has to be carried afterwards. This is workable ground for a practice.',
        shadow: 'Volume mistaken for honesty.',
        color: 'teal',
        masters: ['emotional-healing', 'karma'],
        calibration: {
          dimensions: { emotion: 0.3, action: 0.25, connection: 0.2 },
          practiceLevels: { 'emotional-healing': 1, karma: 1 },
          tags: ['anger-expressed', 'direct'],
        },
      },
      {
        id: 'transmuted',
        label: 'Transmuted',
        short: 'It has become fuel',
        description:
          'The heat is available to you and it is no longer only a thing that happens to you. It shows up as capacity, as boundary, and as the energy for the work itself. Most people who get here report that the thing they feared turned out to be the thing they were short of.',
        shadow: 'Righteous heat used to settle arguments rather than end them.',
        color: 'amber',
        masters: ['body', 'witnessing'],
        calibration: {
          dimensions: { body: 0.3, emotion: 0.25, spirit: 0.25 },
          practiceLevels: { body: 1, witnessing: 1 },
          tags: ['anger-transmuted', 'fuel'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'forgiveness-capacity',
    title: 'Forgiveness capacity',
    subtitle: 'Your ability to release the debt',
    module: 'Heart',
    tradition: 'vedic',
    dimensionCategory: 'emotion',
    coverEmoji: '🕊️',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Forgiveness is usually taught as a decision. It behaves more like a capacity — and a capacity can be strained, measured, and trained.\n\nThis asks what you are holding against people, what the holding is doing, and what would actually have to be given up for it to be released. Nothing here asks you to forgive anyone, or to hurry.',
    dimensions: ['stored', 'grudging', 'releasing', 'freeing'],
    engineHooks: {
      loopsToCheck: ['grudge', 'debt-keeping'],
      practiceAffinity: ['emotional-healing', 'bhakti'],
    },
    questions: [
      q3(
        'forgive-who',
        'account',
        'Who are you currently holding something against?',
        'Name the outstanding accounts. How many are there?',
        'Count them honestly. Most people are surprised, because the holding is not kept in one place — it is in a hundred small places. Where is yours?',
        pickOne(
          ['No one', 'One person, and it is old', 'A handful of people', 'My family, in general', 'Mostly myself'],
          ['none', 'one', 'several', 'family', 'self'],
        ),
      ),
      q3(
        'forgive-recurrence',
        'frequency',
        'How often does the old thing come back to you?',
        'How often do you revisit it?',
        'How often it returns tells you how much is in the account. How often does it arrive?',
        scale(
          ['It has gone quiet — barely ever', 'Now and then', 'Often', 'Most days', 'It runs underneath most of my days'],
          ['dormant', 'occasional', 'often', 'daily', 'constant'],
        ),
      ),
      q3(
        'forgive-purpose',
        'function',
        'Is there a reason you keep holding on to it?',
        'What does the holding do for you?',
        'A debt you never collect is still a debt. What is it keeping you from having to admit?',
        pickOne(
          [
            'No reason — it is just there',
            'It keeps that relationship defined',
            'It keeps the other person in their place',
            'It keeps me from being the one who has to admit things',
            'I have never looked at it',
          ],
          ['none', 'defined', 'placed', 'responsibility', 'unexamined'],
        ),
      ),
      q3(
        'forgive-cost',
        'cost',
        'If you let it go, what would it actually cost you?',
        'What would releasing it take?',
        'Release is not free, and pretending otherwise is most of the reason it has not happened. What exactly would you have to give up?',
        scale(
          ['Nothing I can see', 'The story I have told everyone', 'The distance it has kept for me', 'My leverage with them', 'More than I want to go and find out'],
          ['none', 'story', 'distance', 'leverage', 'unknown'],
        ),
      ),
      q3(
        'forgive-performance',
        'sincerity',
        'When you have said you have forgiven someone, what actually happened?',
        'Look back at the last time. What occurred?',
        'Forgiveness performed and forgiveness felt look identical from outside. Inside, one is a decision and the other is a release. Which have you done?',
        scale(
          ['I have not forgiven anyone', 'I have said it, and not done it', 'Partly — the rest is still there', 'Yes, and something loosened', 'Yes, and it is genuinely finished'],
          ['never', 'performed', 'partial', 'loosened', 'finished'],
        ),
      ),
      q3(
        'forgive-body',
        'somatic',
        'What happens physically when it comes up?',
        'Where in the body do you feel the old account?',
        'The body keeps the ledger the mind has agreed to stop reading. What does yours do?',
        scale(
          ['It tightens straight away', 'My chest narrows', 'I feel heavy and slow', 'A wave, and then it passes', 'Almost nothing at all'],
          ['tension', 'chest', 'heavy', 'wave', 'quiet'],
        ),
      ),
      q3(
        'forgive-received',
        'reception',
        'Can you take forgiveness for what you have done?',
        'When someone forgives you, what happens?',
        'Keeping the accounts against others and refusing the same grace for yourself are one movement, not two. Where does yours stop?',
        scale(
          ['Not at all', 'It bounces off me', 'I hear it, but I do not take it', 'I take it, slowly', 'Yes — I let it land'],
          ['none', 'rejected', 'heard', 'slowly', 'landed'],
        ),
      ),
      q3(
        'forgive-beyond',
        'freedom',
        'What would be different if it were genuinely released?',
        'What is on the other side of it?',
        'Look forward rather than back. If the account closed tonight, what would your week look like?',
        scale(
          ['I do not know', 'A little less heaviness', 'More room in the day', 'A relationship I could actually have', 'A version of me I would recognise'],
          ['unknown', 'lighter', 'space', 'relation', 'self'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'stored',
        label: 'Stored',
        short: 'The account is open and unexamined',
        description:
          'There is a considerable amount held, and much of it has not been looked at directly. It is not being used for anything, which usually means it is simply occupying space. Nothing has to be resolved for this to shift — only seen.',
        shadow: 'Believing the grudge is justified, and therefore finished.',
        color: 'rose',
        masters: ['emotional-healing', 'witnessing'],
        calibration: {
          dimensions: { emotion: 0.4, connection: 0.25, thought: 0.15 },
          practiceLevels: { 'emotional-healing': 2, witnessing: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['debt-stored', 'unexamined'],
        },
      },
      {
        id: 'grudging',
        label: 'Grudging',
        short: 'It is being used',
        description:
          'The holding has become a position — the other person is kept in their place, and the story is told. This is functional in the short term, because it reliably produces distance. In the long term it is the main thing holding the relationship in the shape it already is.',
        shadow: 'Confusing distance with peace.',
        color: 'amber',
        masters: ['emotional-healing', 'relationship'],
        calibration: {
          dimensions: { connection: 0.3, emotion: 0.3, action: 0.15 },
          practiceLevels: { 'emotional-healing': 1, relationship: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['grudge-maintained', 'debt-serving'],
        },
      },
      {
        id: 'releasing',
        label: 'Releasing',
        short: 'It is genuinely moving, unevenly',
        description:
          'The account is being worked on rather than merely held. Some of it has already loosened and some of it is still in place, and the two can be lived with in the same person on the same day. This is the middle of the work rather than its end.',
        shadow: 'Measuring progress instead of doing it.',
        color: 'sky',
        masters: ['emotional-healing', 'bhakti'],
        calibration: {
          dimensions: { emotion: 0.3, spirit: 0.25, connection: 0.2 },
          practiceLevels: { 'emotional-healing': 1, bhakti: 1 },
          tags: ['releasing', 'uneven'],
        },
      },
      {
        id: 'freeing',
        label: 'Freeing',
        short: 'You can let accounts close',
        description:
          'Something has been given that was not owed and did not have to be returned. The capacity is real and repeatable, which means it can be used on the next thing rather than spent on the last.',
        shadow: 'Compassion performed, for people who did not ask for it.',
        color: 'emerald',
        masters: ['bhakti', 'jnana'],
        calibration: {
          dimensions: { spirit: 0.3, emotion: 0.25, connection: 0.2 },
          practiceLevels: { bhakti: 2, jnana: 1 },
          tags: ['releasing-cleanly', 'unburdened'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'trust-baseline',
    title: 'Trust baseline',
    subtitle: 'How open you begin',
    module: 'Heart',
    tradition: 'yogic',
    dimensionCategory: 'connection',
    coverEmoji: '🔓',
    estimatedMinutes: 7,
    version: 1,
    intro:
      'Trust has a starting setting. Whatever it is set to, you tend to begin every new person there, before you know anything about them.\n\nThis looks at that setting: how a stranger is treated in the first minutes, what has to be earned, what a betrayal did to it, whether it has been put back up, and how visible the guard is. It is a description of a starting point, not a verdict on the destination.',
    dimensions: ['guarded', 'conditional', 'open', 'naive-closed'],
    engineHooks: {
      loopsToCheck: ['hypervigilance', 'avoidant-attachment'],
      practiceAffinity: ['relationship', 'bhakti'],
    },
    questions: [
      q3(
        'trust-first',
        'opening',
        'In the first ten minutes with someone new, what happens?',
        'What do you actually do in the first ten minutes?',
        'Everyone begins at the same setting with a stranger. What is yours set to, and who set it?',
        pickOne(
          [
            'I assess, and disclose almost nothing',
            'I am warm, but I am watching',
            'I open up fairly quickly',
            'I open up immediately, before I know anything',
            'I decide within a minute how far this is going to go',
          ],
          ['assessing', 'warm', 'quick', 'immediate', 'decided'],
        ),
      ),
      q3(
        'trust-earn',
        'conditions',
        'What has to happen before you relax with someone?',
        'What earns the turn?',
        'Trust can be tested or it can be built. Which one has this system been trained on, and how long does the build take?',
        pickOne(
          ['A long time — years, sometimes', 'Sustained consistency', 'One good conversation', 'Very little', 'Nothing. I decide in advance'],
          ['long', 'consistency', 'conversation', 'little', 'nothing'],
        ),
      ),
      q3(
        'trust-betrayal',
        'wound',
        'What did a betrayal do to that starting setting?',
        'Has the setting been lowered?',
        'Betrayal does not only cost you the person. It rewrites the default for everyone who arrives afterwards. What did it rewrite?',
        scale(
          ['Nothing I still notice', 'It is in the past and it is still in there', 'It lowered the setting for everyone', 'It shut me down almost completely', 'I cannot trace it to one event — it is simply how I am'],
          ['none', 'present', 'lowered', 'shutdown', 'untraced'],
        ),
      ),
      q3(
        'trust-rebuilt',
        'repair',
        'Has the setting been put back up since?',
        'Has anything been rebuilt on top of it?',
        'A baseline can be repaired, and very few people try, because a moved baseline is invisible from inside. Has it been raised?',
        scale(
          ['I have not tried', 'I have tried, and it did not hold', 'Partly', 'Mostly', 'It is back, and it is better than it was'],
          ['unattempted', 'fragile', 'partial', 'mostly', 'rebuilt'],
        ),
      ),
      q3(
        'trust-disclosure',
        'disclosure',
        'How much do you put out there at the start?',
        'How much goes out before anything comes back?',
        'Disclosure is the only way to test a setting, and it is the exact thing the setting is built to prevent. How much goes out?',
        scale(
          ['Almost nothing', 'Only what is needed to function', 'A fair amount, fairly quickly', 'A great deal, early', 'More than is wise'],
          ['nothing', 'minimal', 'fair', 'large', 'excessive'],
        ),
      ),
      q3(
        'trust-visible',
        'legibility',
        'Can other people see the guard?',
        'Is the guard legible to anyone else?',
        'A guard nobody can see produces a particular kind of loneliness, because people keep trying and keep being told they have misread it. Is yours visible?',
        scale(
          ['Completely invisible', 'Only to people very close to me', 'It shows sometimes', 'It is plainly visible to anyone', 'I have told people it is there'],
          ['invisible', 'selective', 'intermittent', 'visible', 'declared'],
        ),
      ),
      q3(
        'trust-testing',
        'testing',
        'Do you test people?',
        'Do you run small tests to see what happens?',
        'A test is trust in the form of a demand. How often are you running them?',
        scale(['Never', 'Rarely', 'Sometimes', 'Often', 'Most of the time'], ['never', 'rare', 'sometimes', 'often', 'constant']),
      ),
      q3(
        'trust-body',
        'somatic',
        'How quickly does your body settle around a new person?',
        'How long before your body relaxes near them?',
        'The body keeps its own record and does not consult the mind. How long does yours take to sign off?',
        scale(
          ['It does not settle at all', 'Slowly', 'Within an hour or so', 'Quite quickly', 'Immediately, before I know anything'],
          ['none', 'slow', 'hour', 'quick', 'immediate'],
        ),
      ),
      q3(
        'trust-ask',
        'asking',
        'Can you ask someone for what you need?',
        'How easily do you make a request?',
        'A guard that also stops you asking is not protection. It is a locked room. Can you knock?',
        scale(
          ['I do not', 'Only at breaking point', 'With real difficulty', 'Fairly easily', 'Yes, plainly, and early'],
          ['never', 'extreme', 'difficult', 'fairly', 'plainly'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'guarded',
        label: 'Guarded',
        short: 'The door is shut before anyone arrives',
        description:
          'The starting setting is closed, and the closing was installed by a specific event. It is doing its job and it is also the reason nothing new gets in. The good news is that a setting is a setting — it can be moved, and it is often faster to move than people expect.',
        shadow: 'Reading the guard as the whole of what you are.',
        color: 'rose',
        masters: ['relationship', 'witnessing'],
        calibration: {
          dimensions: { connection: 0.4, emotion: 0.3, thought: 0.15 },
          practiceLevels: { relationship: 2, witnessing: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['guarded', 'closed-by-default'],
        },
      },
      {
        id: 'conditional',
        label: 'Conditional',
        short: 'It opens, on evidence',
        description:
          'Warmth is available and it is earned over time by consistency. This works, and it is slow, and it means the first meeting is not representative of what you would become. The settings being tested are usually about reliability rather than character.',
        shadow: 'Making the evidence impossible to produce.',
        color: 'amber',
        masters: ['relationship', 'bhakti'],
        calibration: {
          dimensions: { connection: 0.3, emotion: 0.25, action: 0.15 },
          practiceLevels: { relationship: 1, bhakti: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['trust-conditional', 'evidence-based'],
        },
      },
      {
        id: 'open',
        label: 'Open',
        short: 'The door is genuinely open',
        description:
          'People get access relatively early, and the experience of most of them is that it holds. This is a real result, not naivety, and it is maintained by the same things that built it: saying what is true, early and often.',
        shadow: 'Openness that has stopped being chosen.',
        color: 'emerald',
        masters: ['relationship', 'bhakti'],
        calibration: {
          dimensions: { connection: 0.35, spirit: 0.2, emotion: 0.2 },
          practiceLevels: { relationship: 1, bhakti: 1 },
          tags: ['open', 'consistent'],
        },
      },
      {
        id: 'naive-closed',
        label: 'Naive-closed',
        short: 'Wide open, then shut — with nothing in between',
        description:
          'There is no reliable setting here. Some people get the full thing immediately, and the next betrayal closes the door entirely, and the two states alternate without anything being built in between. Neither one is a decision, so neither one can be revised by argument.',
        shadow: 'Deciding after the fact that the person was the problem, rather than the pattern.',
        color: 'violet',
        masters: ['loop-dissolution', 'witnessing'],
        calibration: {
          dimensions: { connection: 0.35, emotion: 0.35, thought: 0.2 },
          practiceLevels: { 'loop-dissolution': 1, witnessing: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['trust-volatile', 'unbuilt-baseline'],
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  {
    slug: 'love-language',
    title: 'Love language',
    subtitle: 'How you give and receive love',
    module: 'Heart',
    tradition: 'yogic',
    dimensionCategory: 'connection',
    coverEmoji: '❤️',
    estimatedMinutes: 6,
    version: 1,
    intro:
      'Most friction inside a close relationship is two people offering different things, each one quite certain the other is offering nothing at all.\n\nThis asks which of the five forms come most easily to you, which are hardest to take, what is actually being handed to you, and whether love is being offered at all. It is a map of wiring, not a scorecard to be graded on.',
    dimensions: ['words', 'touch', 'time', 'acts', 'understanding'],
    engineHooks: {
      practiceAffinity: ['relationship', 'bhakti'],
    },
    questions: [
      q3(
        'love-give',
        'giving',
        'Of the five ways people show love, which comes most easily to you?',
        'Which one is your default way of offering?',
        'Five channels, and most people run on one or two. Which is yours?',
        pickOne(
          ['Being told it matters', 'Physical closeness', 'Undistracted time', 'Doing something practical for them', 'Being understood'],
          ['words', 'touch', 'time', 'acts', 'understanding'],
        ),
      ),
      q3(
        'love-receive',
        'receiving',
        'Which of the five is hardest for you to take?',
        'Which one does the least for you, and which one costs the most to accept?',
        'Giving and receiving run on different wiring. The form you find hardest to take is usually the one you most need. Which is it?',
        pickOne(
          ['Physical closeness', 'Being told it matters', 'Doing something practical for them', 'Being understood', 'Undistracted time'],
          ['touch', 'words', 'acts', 'understanding', 'time'],
        ),
      ),
      q3(
        'love-asked',
        'offering',
        'When someone close to you loves you, what are they mostly giving?',
        'What is actually being handed to you?',
        'Look at the care arriving rather than the care you return. What is it made of?',
        pickOne(
          ['Mostly reassurance and words', 'Mostly closeness and touch', 'Mostly time and presence', 'Mostly practical things being done', 'Mostly being taken seriously'],
          ['words', 'touch', 'time', 'acts', 'understanding'],
        ),
      ),
      q3(
        'love-variable',
        'variation',
        'Does the way you show love change from one relationship to another?',
        'Is your way of loving fixed, or does it adapt?',
        'A fixed way is reliable and narrow. An adaptive way is generous and inconsistent. Which is yours?',
        scale(
          ['One fixed way, with everyone', 'It changes a little with closeness', 'It changes with what the other person needs', 'It changes a lot, relationship to relationship', 'I have no consistent way of showing it at all'],
          ['fixed', 'slight', 'adaptive', 'variable', 'inconsistent'],
        ),
      ),
      q3(
        'love-offered',
        'supply',
        'Is love actually being offered to you, at the rate you need?',
        'How much of it is arriving, and how much are you producing?',
        'Separate what you generate from what arrives. Where is the shortfall?',
        scale(
          ['Rarely, from anyone', 'Occasionally', 'Sometimes', 'Usually', 'It is there most of the time'],
          ['rare', 'occasional', 'sometimes', 'usually', 'constant'],
        ),
      ),
      q3(
        'love-land',
        'reception',
        'When love is offered to you, do you let it in?',
        'What happens to it when it arrives?',
        'Some people generate love easily and cannot receive any. If the offer keeps landing badly, the problem is not the offer. Where is the difficulty?',
        scale(
          ['I deflect it', 'I take it politely and move on', 'I take it and stay at arm’s length', 'I let it land', 'I let it land, and I ask for more'],
          ['deflect', 'polite', 'distance', 'land', 'receive'],
        ),
      ),
      q3(
        'love-ask',
        'asking',
        'Have you ever plainly asked someone for what you need?',
        'Have you ever made the request out loud?',
        'Five channels, one narrow line. Asking is the only way to find out whether anyone else has one too. Have you asked?',
        scale(
          ['Never', 'Once or twice', 'With a great deal of difficulty', 'Rarely, but I can', 'Regularly, and easily'],
          ['never', 'rare', 'difficult', 'capable', 'regular'],
        ),
      ),
      q3(
        'love-beyond',
        'scope',
        'Does the way you love reach beyond romantic relationships?',
        'Is this only how you relate to a partner?',
        'Ask the same question of a close friend, and of a parent. If the answer is different, the channel is not the whole story. Where does it reach?',
        scale(
          ['It is tied to romantic love', 'Mostly that', 'Family too, with some effort', 'Close friends as well as family', 'Almost everyone I am close to'],
          ['romantic', 'mostly-romantic', 'family', 'friends', 'broad'],
        ),
      ),
    ],
    resultTypes: [
      {
        id: 'words',
        label: 'Words',
        short: 'It is said, and it has to be said',
        description:
          'Language is the channel that carries everything else. Naming is easy here, and being unnamed is hard — a silence in this wiring is not neutral, it registers as absence. The work is usually asking for the sentence out loud rather than waiting to be given it.',
        shadow: 'Saying the thing instead of letting it be felt.',
        color: 'rose',
        masters: ['bhakti', 'relationship'],
        calibration: {
          dimensions: { connection: 0.3, emotion: 0.25, thought: 0.15 },
          practiceLevels: { relationship: 1, bhakti: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['love-words', 'needs-naming'],
        },
      },
      {
        id: 'touch',
        label: 'Touch',
        short: 'Contact is the language',
        description:
          'Presence is registered through the body rather than through what is said about it. This is the channel that cannot be faked convincingly, and its absence is felt before it is noticed. The work is usually in saying that something is missing, out loud.',
        shadow: 'Touch used in place of being known.',
        color: 'orange',
        masters: ['bhakti', 'body'],
        calibration: {
          dimensions: { connection: 0.3, body: 0.3, emotion: 0.2 },
          practiceLevels: { bhakti: 1, body: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['love-touch', 'somatic-bond'],
        },
      },
      {
        id: 'time',
        label: 'Time',
        short: 'Attention is the thing being given',
        description:
          'What registers as love is undivided presence, and it is a genuinely scarce resource rather than a polite gesture. The signal is not the quantity of hours but whether the hours were actually yours. Notice that this is the channel most often supplied in quantity and refused in substance.',
        shadow: 'Quantity of time offered in place of quality of attention.',
        color: 'teal',
        masters: ['bhakti', 'witnessing'],
        calibration: {
          dimensions: { connection: 0.3, spirit: 0.2, emotion: 0.2 },
          practiceLevels: { bhakti: 1, witnessing: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['love-time', 'attention-led'],
        },
      },
      {
        id: 'acts',
        label: 'Acts',
        short: 'It is done, not said',
        description:
          'Care arrives as something completed rather than something discussed. This is reliable and it is hard to read from the outside, because the person receiving it is busy and the person giving it is not looking for thanks. The work is in making it visible.',
        shadow: 'Doing the work instead of saying what it is for.',
        color: 'amber',
        masters: ['karma', 'relationship'],
        calibration: {
          dimensions: { action: 0.3, connection: 0.25, body: 0.15 },
          practiceLevels: { karma: 1, relationship: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['love-acts', 'service-led'],
        },
      },
      {
        id: 'understanding',
        label: 'Understanding',
        short: 'It has to be understood before it counts',
        description:
          'Being known is the requirement, and partial knowledge does not register as care. This is the most demanding of the five to give and the easiest to withhold by accident, because people are usually doing both at once without noticing the half that is missing.',
        shadow: 'Being right about them instead of with them.',
        color: 'violet',
        masters: ['jnana', 'relationship'],
        calibration: {
          dimensions: { connection: 0.25, thought: 0.25, emotion: 0.2 },
          practiceLevels: { relationship: 1, jnana: 1 },
          domainStress: { relation: 'relationship' },
          tags: ['love-understanding', 'known-first'],
        },
      },
    ],
  },
];
