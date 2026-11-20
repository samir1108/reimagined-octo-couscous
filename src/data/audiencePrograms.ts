/**
 * Audience Programs — 7-day arcs designed for specific communities.
 *
 * Same shape as SHOWROOM_PROGRAMS, but tagged with an `audience` field so the
 * /experience/programs catalog can group them (Corporate, Government,
 * Healers/LOOPS, Ritual/Witchcraft, and more coming).
 */
import type { ShowroomProgram } from "./showroomPrograms";
import { AUDIENCE_PROGRAMS_EXPANSION } from "./programs/audienceProgramsExpansion";

// ============================================================================
// 1. CORPORATE — LEADERSHIP UNDER FIRE
// ============================================================================
const CORPORATE_LEADERSHIP: ShowroomProgram = {
  slug: "corporate-leadership-under-fire",
  title: "Leadership Under Fire",
  subtitle: "Seven days of nervous-system training for people who have to stay calm when everyone around them is not.",
  guru: "Krishna",
  guruRole: "the charioteer who taught a general how to fight a war without losing himself",
  theme: "⚔️",
  color: "from-slate-500/30 via-blue-500/20 to-indigo-500/10",
  category: "decision",
  audience: "corporate",
  duration: "7 days",
  promise: "By day 7 you will have a 90-second reset you can run between meetings, a decision protocol for high-stakes calls, and a clean way to end the workday inside your own body — not on your laptop.",
  days: [
    {
      day: 1,
      title: "The 90-Second Reset",
      oneLine: "Your calendar is not the problem. The lack of pauses between the items on it is.",
      reading: `Most executive burnout is not caused by workload. It is caused by the *absence of transitions* between workloads. You end one meeting still holding its charge, and walk into the next carrying it. By 4 p.m. you are carrying twelve meetings at once, inside one body.\n\nThe fix is boring and it works: 90 seconds of nothing, between each context switch. Not scrolling. Not water. Not "just one email." Nothing.\n\nThis week we will build one professional-grade nervous system tool per day. Today's is the smallest and the most important: the reset itself.`,
      practice: {
        name: "Doorway Reset",
        durationMin: 2,
        instructions: `Between your next two meetings — even if they are back-to-back on video — do this:\n\n1. Close the previous tab. Physically close it.\n2. Sit back. Feet on floor. Unclench your jaw.\n3. Four slow breaths, exhale twice as long as inhale.\n4. Ask silently: "What does the next person in front of me actually need from me?"\n\nThat's it. 90 seconds. Enter the next room as a person, not as a residue.`,
      },
      reflection: "How many context switches did you make yesterday without a single deliberate pause between them?",
    },
    {
      day: 2,
      title: "The Decider Underneath",
      oneLine: "The 'you' making a hard call at 11 p.m. is not the same 'you' who should be making it.",
      reading: `Every hard decision has two layers: the *content* (should we hire, fire, launch, cut) and the *state of the person deciding*. Corporate culture obsesses over the first and ignores the second. The result is a generation of leaders making soul-sized decisions from a caffeinated, sleep-debted, meeting-fried version of themselves — and calling the outcome "intuition."\n\nKrishna's first move with Arjuna was not to give him an answer. It was to ask *which Arjuna* was asking. Today we do the same thing.`,
      practice: {
        name: "Widen the Decider",
        durationMin: 3,
        instructions: `Pick one open work decision. Before you touch it, do this:\n\n1. Rate your current state 1-10 across: sleep, hunger, last real break, emotional charge.\n2. If any are below 5, the decision waits. Full stop.\n3. If clear, ask: "If a version of me who slept eight hours and had no meeting today looked at this — what would they see that I can't?"\n4. Write down that answer. Decide from there.`,
      },
      reflection: "Which decision in the last month would you unmake if you could rewind and make it from a rested body?",
    },
    {
      day: 3,
      title: "The Meeting Before The Meeting",
      oneLine: "You already had the meeting in your head. Notice which version of it you brought into the room.",
      reading: `Before every important conversation, your brain runs a simulation. The person you are about to speak with has already been cast — as difficult, as an ally, as a threat, as beneath you. By the time the real meeting starts, you are not talking to them. You are talking to the version of them your mind already built.\n\nThis is the single largest source of communication failure at work. Not vocabulary. Not tools. Cast lists.`,
      practice: {
        name: "Recast the Room",
        durationMin: 4,
        instructions: `Before your next real conversation:\n\n1. Name the label you have already put on this person.\n2. Ask: "What if that label is 40% wrong?"\n3. Sit with the discomfort for 30 seconds.\n4. Walk in with one honest question you don't already know the answer to.\n\nWatch what changes.`,
      },
      reflection: "Which person at work have you completely made up in your own head?",
    },
    {
      day: 4,
      title: "The Cost of the Unfinished",
      oneLine: "Open loops are more expensive than hard work.",
      reading: `The reason you are tired is not the six things you did today. It is the forty-two things you did not finish and are still tracking in the back of your mind. Cognitive science calls this the Zeigarnik effect. Yogic science calls it a leaking pot.\n\nEvery evening, most leaders carry an invisible list of unclosed loops — the reply not sent, the decision not made, the person not thanked. Sleep does not clear this list. Only a specific ritual does.`,
      practice: {
        name: "Close The Day Ledger",
        durationMin: 5,
        instructions: `At the actual end of your workday — before dinner, before family, before phone:\n\n1. Open a blank page.\n2. List every open loop you are still carrying, no editing. Aim for 15+.\n3. For each: mark D (do now, under 2 min), T (tomorrow with a time), or K (kill it — not actually mine).\n4. Do the D's. Kill the K's. Close the laptop.\n\nYou will sleep differently tonight.`,
      },
      reflection: "What is the oldest open loop you have been carrying at work?",
    },
    {
      day: 5,
      title: "Anger Without Damage",
      oneLine: "Suppressed anger runs your calendar. Expressed anger runs your team into the ground. There is a third door.",
      reading: `Leaders are told anger is unprofessional, so they swallow it. Swallowed anger becomes passive aggression, micromanagement, and 2 a.m. Slack messages that never should have been sent.\n\nThe yogic move is neither suppress nor express. It is *witness*. You notice the anger as a physical event — heat, jaw, hands — before it becomes a story about the other person. In that gap, the whole thing can be redirected as fuel for a clear, unheated request.`,
      practice: {
        name: "Anger as Data",
        durationMin: 4,
        instructions: `Next time you feel work anger rising:\n\n1. Do not send anything for 10 minutes. Non-negotiable.\n2. Locate the anger in your body. Three places. Name them.\n3. Ask: "What boundary of mine was actually crossed here?"\n4. Turn that answer into one clean sentence, no adjectives, and send only that.`,
      },
      reflection: "What is the anger at work currently pointing at that you have not yet named?",
    },
    {
      day: 6,
      title: "The End Of The Workday",
      oneLine: "You do not leave work in your office. You leave it in your body.",
      reading: `Remote work destroyed the commute. The commute had a job most people didn't know about: it was a *transition ritual* between two identities. Without it, work bleeds into dinner, into the child's bedtime, into the marriage.\n\nEvery contemplative tradition has an end-of-work ritual — the temple bell, the evening prayer, the walk. Today we install yours.`,
      practice: {
        name: "The Threshold",
        durationMin: 6,
        instructions: `Design a 6-minute ritual that will happen every workday between "last task" and "first non-work moment":\n\n1. Physical: change one item of clothing OR wash face and hands.\n2. Breath: 20 slow breaths, longer exhale.\n3. Words: say out loud, "Work stays here. I am home."\n4. Motion: walk around one full room, or outside if you can.\n\nDo it today. Do it tomorrow. Never negotiate with it.`,
      },
      reflection: "Who in your household is currently absorbing the leftover work you don't put down?",
    },
    {
      day: 7,
      title: "The Leader As Instrument",
      oneLine: "You are not the work. You are the instrument the work is played on. Instruments must be tuned.",
      reading: `Everything we did this week — the reset, the decider, the recast, the ledger, the anger, the threshold — is one idea in six clothes: **you are the instrument, and the instrument requires maintenance, or every note you play will be flat.**\n\nMost leadership training treats the leader as a machine. Yogic leadership treats the leader as a tuning fork. What passes through you is only as clean as the fork.\n\nToday you commit to a weekly practice: 20 minutes, once a week, to run the six moves and adjust. Not optional. This is the meeting with yourself.`,
      practice: {
        name: "The Weekly Tuning",
        durationMin: 20,
        instructions: `Put a recurring 20-minute meeting in your calendar. Sunday evening is ideal. Titled: "Tuning."\n\nIn that meeting, do this:\n1. Doorway reset — 2 min\n2. Rate your current state (day 2) — 2 min\n3. Which person at work have I miscast this week? (day 3) — 3 min\n4. Close the week's open loops (day 4) — 8 min\n5. Where did anger tell me the truth this week? (day 5) — 3 min\n6. End with the threshold ritual (day 6) — 2 min\n\nMiss no more than one of these per quarter.`,
      },
      reflection: "If you did this weekly for a year, what would be different about the people who work for you?",
    },
  ],
};

// ============================================================================
// 2. GOVERNMENT / UNIFORMED SERVICES — DUTY WITHOUT DAMAGE
// ============================================================================
const GOVERNMENT_DUTY: ShowroomProgram = {
  slug: "duty-without-damage",
  title: "Duty Without Damage",
  subtitle: "Seven days of Karma yoga for people whose job is to hold the line — police, military, medics, bureaucrats, judges.",
  guru: "Arjuna",
  guruRole: "the warrior who had to act with force and yet not become the force",
  theme: "🛡️",
  color: "from-stone-600/30 via-amber-700/20 to-orange-800/10",
  category: "purpose",
  audience: "government",
  duration: "7 days",
  promise: "By day 7 you will have a personal framework for staying human inside a uniform — how to use force without becoming it, how to carry the weight of decisions that hurt people, and how to come home without bringing the shift with you.",
  days: [
    {
      day: 1,
      title: "The Weight Of The Uniform",
      oneLine: "The uniform is not you. Take it off before you speak to the people you love.",
      reading: `Every uniformed profession has a hidden cost that nobody trains you for: *identity fusion*. After enough years, the officer, the soldier, the judge, the doctor forget where the role ends and the person begins. They speak to their children the way they speak to suspects. They interrogate their spouse. They rank their friends.\n\nThe first move in every wisdom tradition for people in duty is to install a *seam* — a visible line between the person and the function. You need to be able to take the uniform off, inside yourself, before you can take it off physically.`,
      practice: {
        name: "The Seam Ritual",
        durationMin: 3,
        instructions: `At the end of your shift, before you enter your home:\n\n1. Sit in the vehicle or on the doorstep for 60 seconds.\n2. Touch the badge, weapon, ID, or stethoscope. Say out loud: "This stays out here."\n3. Three slow breaths.\n4. Then say your own name — first name only — out loud once.\n5. Enter the house as that person.`,
      },
      reflection: "Who at home is currently being spoken to by your uniform instead of by you?",
    },
    {
      day: 2,
      title: "Force Without Hatred",
      oneLine: "You can act with total force and zero hate. The Gita is a manual for this.",
      reading: `Krishna's teaching to Arjuna is the oldest field manual for force in existence. The core: you may need to act with everything you have, but the moment your action is *powered by hatred*, it corrupts the person doing it.\n\nThis is not pacifism. It is precision. The soldier who kills without hate returns human. The one who fuels the act with hate returns with something broken.\n\nDuty is a fire. Hate is the wrong fuel.`,
      practice: {
        name: "Check The Fuel",
        durationMin: 4,
        instructions: `Before any use of force this week — verbal, physical, procedural — pause for 3 seconds and ask:\n\n1. Is this action necessary?\n2. Is the amount of force calibrated to the necessity?\n3. What is fueling me right now — duty, or hate?\n\nIf the answer to #3 is hate, and you can wait, wait. If you can't wait, do the minimum and process the rest afterward.`,
      },
      reflection: "When was the last time you used more force than the situation required? What was the extra fueled by?",
    },
    {
      day: 3,
      title: "The Decision That Hurt Someone",
      oneLine: "You will make decisions that hurt people. Carrying them well is a skill.",
      reading: `Every person in duty carries a private list of decisions that damaged someone — a call that went wrong, an arrest, a diagnosis missed, a policy enforced against a person you understood. If you are honest, you are still carrying some of them tonight.\n\nUntended, these become PTSD, cynicism, and the emotional numbness colleagues call "hardening." Tended, they become the source of your wisdom. The difference is a specific ritual, not time.`,
      practice: {
        name: "The Naming",
        durationMin: 8,
        instructions: `Sit alone with a notebook.\n\n1. Recall one decision from your work that you know hurt someone.\n2. Write the person's name (or "the man in the blue jacket" if unknown). Not the case number. The person.\n3. Write what you did.\n4. Write: "I did this. It hurt them. I did it because __."\n5. Write: "If I could speak to them now I would say __."\n6. Close the notebook. Do not share it. This is not confession. It is *placing the weight down* somewhere other than your body.`,
      },
      reflection: "How many names are you carrying that you have never let yourself say?",
    },
    {
      day: 4,
      title: "The Body Is Keeping Score",
      oneLine: "Your nervous system has been on duty for years. It needs a formal stand-down.",
      reading: `Chronic activation of the sympathetic nervous system — the "fight-or-flight" branch — is the occupational disease of uniformed work. It shows up as insomnia, back pain, hypertension, marital anger, and dependence on alcohol or screens to come down.\n\nYou cannot fix this with a vacation. You need a *daily* physiological down-regulation practice, small and non-negotiable, that tells the body: the shift is over, you can stand down.`,
      practice: {
        name: "Physiological Stand-Down",
        durationMin: 6,
        instructions: `Once per day, ideally within an hour of ending shift:\n\n1. Lie flat. Feet flopped out. Hands away from ribs.\n2. Breathe in 4 seconds, hold 2, out 8 seconds. Twelve rounds.\n3. Then this scan: crown → jaw → shoulders → chest → belly → hips → legs → feet. At each, one exhale, one silent word: "off duty."\n4. Stay flat one full minute after finishing.\n\nDo this every day for a month and measure your sleep.`,
      },
      reflection: "What has your body been trying to tell you that you have been overriding with duty?",
    },
    {
      day: 5,
      title: "The Ones Who Come Home Different",
      oneLine: "Your family is doing invisible work absorbing what you bring back. See it.",
      reading: `Spouses, children, and parents of people in duty carry a shadow shift. They read your face when you walk in. They soften their news. They absorb your silence. They wait for the good version of you to come back on Sunday.\n\nMost of them have never been thanked for this. Most do not even know they are doing it. Today you name it.`,
      practice: {
        name: "The Unspoken Thanks",
        durationMin: 5,
        instructions: `Pick one person at home who absorbs the shadow of your work.\n\n1. In person, look them in the eye.\n2. Say: "I know my work follows me home. I know you take some of it without me asking. Thank you."\n3. Do not defend. Do not qualify. Do not fix.\n4. Let them respond however they respond.`,
      },
      reflection: "Who has been quietly carrying your shift home with you?",
    },
    {
      day: 6,
      title: "The Oath Underneath The Oath",
      oneLine: "You took a formal oath. There is another one underneath it that only you can write.",
      reading: `The oath of office is written by an institution. It is necessary, but insufficient. Every person in duty needs a *private oath* — the personal line you will not cross, no matter the order, no matter the pressure, no matter the year.\n\nWithout it, you drift. With it, you have a spine that the job cannot bend.`,
      practice: {
        name: "Write The Private Oath",
        durationMin: 15,
        instructions: `Alone, in writing. No one else will read this.\n\n1. Complete: "No matter the order or the cost, I will not __."\n2. Write three versions. Keep the one that scares you the most to keep.\n3. Complete: "The person I refuse to become, even to succeed at this job, is __."\n4. Sign it with today's date.\n5. Keep it somewhere you can find at 3 a.m.`,
      },
      reflection: "What is the line you would rather resign than cross?",
    },
    {
      day: 7,
      title: "Duty As Devotion",
      oneLine: "Karma yoga: do the work with everything you have and let go of the fruit.",
      reading: `The final teaching of the Gita for people in duty is small and enormous: *do the work with total commitment, and release your grip on the outcome*. You are responsible for the quality of your action. You are not responsible for the result the world produces from it.\n\nThis is the only known cure for burnout in professions of duty. Nothing else works long-term. Not promotion. Not medals. Not the belief that the system will thank you. Only this: **the work, done well, offered to something larger than the outcome.**\n\nThat "something larger" you must name for yourself. For some it is God. For some it is the country. For some it is the child three generations from now. Name yours today.`,
      practice: {
        name: "The Offering",
        durationMin: 10,
        instructions: `Sit quietly.\n\n1. Bring to mind the hardest part of your duty this week.\n2. Say silently: "I did this the best I could."\n3. Say: "The result is not mine to carry."\n4. Name the thing larger than the outcome that this work is for. Say it out loud.\n5. Bow, physically, once.\n\nThen carry the week's tools forward: seam, fuel-check, naming, stand-down, thanks, private oath, offering. These seven are yours now.`,
      },
      reflection: "What is the 'something larger' your work has always secretly been for?",
    },
  ],
};

// ============================================================================
// 3. LOOPS — TRAUMA & THE NERVOUS SYSTEM
// ============================================================================
const LOOPS_TRAUMA: ShowroomProgram = {
  slug: "loops-trauma-and-the-nervous-system",
  title: "LOOPS — Getting Out Of The Same Room",
  subtitle: "Seven days for people who keep ending up in the same emotional room — anxiety spirals, PTSD echoes, panic that arrives on schedule.",
  guru: "The Witness",
  guruRole: "the part of you that has never been afraid, even when the rest of you was",
  theme: "🌀",
  color: "from-violet-500/30 via-fuchsia-500/20 to-rose-500/10",
  category: "nervous",
  audience: "healers",
  duration: "7 days",
  promise: "By day 7 you will understand the anatomy of your loop, have three body-based tools to interrupt it, and know the difference between processing trauma and re-traumatizing yourself.",
  days: [
    {
      day: 1,
      title: "What A Loop Actually Is",
      oneLine: "You are not broken. Your nervous system is doing a job. It just no longer knows the war is over.",
      reading: `A loop is not a thought problem. It is a *body prediction*. Your nervous system, at some point, learned that a certain situation was dangerous, and it filed a rule: "If this happens again, mobilize immediately." Years later, the trigger no longer matches the danger — but the rule fires anyway.\n\nThis week is not about analyzing why the rule was written. It is about learning to work with the nervous system that keeps enforcing it. You are not going to think your way out of a loop. Nobody has ever thought their way out of a loop. You are going to *body* your way out.`,
      practice: {
        name: "Map The Loop",
        durationMin: 5,
        instructions: `Pick one recurring loop — panic, spiral, freeze, rage. Write:\n\n1. First body sign (before the thoughts start): where in the body, what sensation.\n2. First thought that shows up.\n3. What you usually do next.\n4. How long it usually lasts.\n5. What you usually do to make it stop.\n\nThis is your map. We come back to it every day.`,
      },
      reflection: "Which room in your inner life do you keep waking up in?",
    },
    {
      day: 2,
      title: "The Body Signal You Kept Ignoring",
      oneLine: "There is always a warning signal earlier than you think. Find it.",
      reading: `Every loop has an early bell. A tightening in the throat. A specific tension behind the eyes. A held breath. Most people only notice the loop when it is already at volume 8. The bell was at volume 2, ten minutes earlier.\n\nToday's move is to catch the bell. Not to prevent the loop yet — just to see it earlier.`,
      practice: {
        name: "Earlier",
        durationMin: 5,
        instructions: `Twice today, do a 60-second body scan on the following signals: jaw, throat, chest, belly, hands.\n\nIf you notice any tension, do not try to release it. Just note: "hello, I see you." Then continue your day.\n\nAfter one week of doing this daily, you will start noticing the bell before the loop, not during it. This is the whole game.`,
      },
      reflection: "What did your body try to tell you today that you almost missed?",
    },
    {
      day: 3,
      title: "Orienting — The Oldest Safety Tool",
      oneLine: "When the loop starts, your eyes want to close. Open them wider instead.",
      reading: `When the nervous system enters loop mode, one of the first things that happens is that peripheral vision collapses. You go into tunnel vision. Somatic Experiencing calls the reverse move *orienting* — deliberately widening your visual field to signal to the nervous system: "we are not in danger; look, the room is big."\n\nIt is impossibly simple and it works better than most drugs.`,
      practice: {
        name: "Orient",
        durationMin: 3,
        instructions: `When you feel a loop starting:\n\n1. Slowly turn your head to the right, letting your eyes lead. Notice the furthest thing you can see.\n2. Slowly to the left. Same.\n3. Up. Down.\n4. Come back to center and name three colors in the room out loud.\n\nThis is one round. Do three rounds. The loop will not vanish, but the volume will drop.`,
      },
      reflection: "What does the room around you actually look like right now?",
    },
    {
      day: 4,
      title: "The Difference Between Processing And Re-Traumatizing",
      oneLine: "Talking about it is not always healing it. Sometimes it is practicing it.",
      reading: `A great deal of well-intentioned inner work is actually loop reinforcement. Re-telling the story, re-feeling the feeling, re-explaining what happened — done without a regulated body — often deepens the neural pathway rather than resolves it.\n\nThe rule is this: you can only usefully touch a hard memory *from a regulated state*. If your nervous system is already activated, the touch will hurt you, not heal you. Regulate first. Touch second. Not the other way around.`,
      practice: {
        name: "Regulate First",
        durationMin: 6,
        instructions: `Before any journaling, therapy, or hard conversation this week:\n\n1. Do the orient practice (day 3) for 2 minutes.\n2. Long slow exhale, 8 counts, six times.\n3. Only then approach the material.\n\nIf during the work you feel activation rising past a 6/10, stop. Return to breath and orient. Only re-enter when back below 4/10.`,
      },
      reflection: "What have you been 'processing' that has actually been re-injuring you?",
    },
    {
      day: 5,
      title: "The Witness Underneath",
      oneLine: "There is a part of you the trauma never reached. It has been here all along.",
      reading: `Trauma work in the West is mostly about the wounded parts. Yogic work adds a second axis: *there is a layer of consciousness the wound did not touch*. Ramana called it the Witness. Vipassana calls it awareness. Modern therapy sometimes calls it "Self."\n\nIt is not a belief. It is a location you can visit. When you sit and watch the loop — even for ten seconds — without becoming it, you are in the Witness. The more you sit there, the more the loop loses its grip. Not because it goes away, but because it is no longer the whole of you.`,
      practice: {
        name: "Ten Seconds Of Witness",
        durationMin: 10,
        instructions: `Sit. Close your eyes.\n\nFor ten minutes, whenever any thought, sensation, or feeling arises, silently name it: "thinking." "tightness." "sadness." "planning." "memory."\n\nThe naming is the Witness. You are not the thing being named. You are the one doing the naming.\n\nWhen the ten minutes end, notice: which was more real to you — the noise, or the one listening to the noise?`,
      },
      reflection: "Who is the one that has been aware of every loop you've ever had?",
    },
    {
      day: 6,
      title: "The Loop Has A Gift",
      oneLine: "Every loop is protecting something. Ask what.",
      reading: `This one is the hardest and the most freeing. Every loop, no matter how painful, is doing a job. It is *protecting* something — a boundary, a wound, a truth you weren't allowed to say, a self you weren't allowed to be.\n\nThe loop is not the enemy. It is a bodyguard that never got the memo that the danger passed. You do not fire a bodyguard by yelling at them. You thank them, tell them the war is over, and give them a new job.`,
      practice: {
        name: "The Conversation With The Bodyguard",
        durationMin: 10,
        instructions: `Sit quietly. Bring to mind your main loop.\n\n1. Ask it, gently: "What are you protecting me from?"\n2. Wait. Listen. The answer will not come from thinking.\n3. When something arises, say: "Thank you. I see now what you have been doing all these years."\n4. Ask: "What do you actually need?"\n5. Listen again.\n\nDo not fix. Do not argue. Do not analyze. Just receive.`,
      },
      reflection: "What has your loop been protecting that you have never thanked it for?",
    },
    {
      day: 7,
      title: "Living With A Nervous System, Not Against It",
      oneLine: "The goal is not to have no loops. It is to live with one gracefully.",
      reading: `You will not "cure" your nervous system in seven days, or seven years. What you can do — and what this week has built — is *befriend* it. Notice it earlier. Regulate it first. Speak to it as an ally, not a defect. Rest in the Witness that has always been underneath it.\n\nOver time, the loops shorten. The gaps between them widen. The Witness becomes the default location, and the loop becomes a weather pattern that passes through, rather than the whole sky.\n\nThis is what healing actually looks like. Not silence. Not perfection. Just a longer, kinder relationship with the animal you live in.`,
      practice: {
        name: "The Daily Six",
        durationMin: 15,
        instructions: `Design a daily 15-minute practice combining the week's tools:\n\n1. Map check (1 min) — where is my loop today?\n2. Bell scan (2 min) — early signals in jaw, throat, chest.\n3. Orient (2 min) — widen the visual field.\n4. Breath regulation (3 min) — long exhale, six rounds.\n5. Ten seconds of Witness (5 min).\n6. Bodyguard check (2 min) — thank the parts protecting you.\n\nDaily. Non-negotiable. This becomes the ground your life stands on.`,
      },
      reflection: "What is the smallest daily commitment you can actually keep?",
    },
  ],
};

// ============================================================================
// 4. WITCHCRAFT / RITUAL — SHAKTI & THE ETHICS OF POWER
// ============================================================================
const WITCHCRAFT_SHAKTI: ShowroomProgram = {
  slug: "shakti-and-the-ethics-of-power",
  title: "Shakti And The Ethics Of Power",
  subtitle: "Seven days for practitioners of ritual, magic, and devotional power traditions — where the yogic view meets the witch's craft.",
  guru: "Kali",
  guruRole: "the goddess who devours what is false, so what is real can breathe",
  theme: "🔥",
  color: "from-rose-600/30 via-red-700/20 to-purple-900/10",
  category: "shadow",
  audience: "ritual",
  duration: "7 days",
  promise: "By day 7 you will have a clear framework for working with power ethically: how to open, how to close, how to know the difference between Shakti and glamour, and how to keep your ritual life from consuming your ordinary life.",
  days: [
    {
      day: 1,
      title: "Shakti Is Not A Metaphor",
      oneLine: "Power is real. Ethics with power is a practice, not a belief.",
      reading: `In the Tantric view, Shakti is not a symbol. It is the actual living current of the universe — the force that makes seeds break, planets turn, and blood move. Every ritual tradition — Western witchcraft, Afro-diasporic religions, Tantric sadhana, Vajrayana Buddhism — is a set of techniques for making contact with this current.\n\nContact with the current is not the hard part. Living well with it afterward is. Most traditions have far more failures of ethics than failures of technique. This week is about the second problem, not the first.`,
      practice: {
        name: "The Honest Inventory",
        durationMin: 10,
        instructions: `Alone. In writing.\n\n1. List the practices you currently do that draw on power (rituals, spells, sadhanas, invocations, energy work).\n2. For each, answer: what is the *actual* effect on my life? On the lives of people around me?\n3. Notice which practices you keep doing even though the answer is "I'm not sure."\n\nNo judgment. This is the map before the journey.`,
      },
      reflection: "Which of your practices would you keep doing if nobody ever knew you did them?",
    },
    {
      day: 2,
      title: "Opening And Closing",
      oneLine: "Every ritual opens something. If you don't close it, it stays open in you.",
      reading: `The single most common mistake in personal ritual practice is failing to close what was opened. You call in a presence, do the work, and then check your phone. Weeks later you wonder why your dreams are strange, your sleep is thin, your body feels porous.\n\nEvery traditional lineage has closing protocols precisely because they know: opening is easy, closing is a skill.`,
      practice: {
        name: "The Close",
        durationMin: 5,
        instructions: `Design a personal closing protocol you will use after every practice from today forward:\n\n1. Verbal: "I thank what came. I release what stays. I close this circle."\n2. Physical: three claps, or extinguishing a flame, or splashing cold water on the face.\n3. Grounding: eat one bite of something. Feet firmly on the earth for 60 seconds.\n4. Return to ordinary: text one non-ritual person, or do one ordinary chore.\n\nAlways all four. Even if the ritual was three minutes long.`,
      },
      reflection: "Which practices in your past did you open but never truly close?",
    },
    {
      day: 3,
      title: "Glamour vs. Shakti",
      oneLine: "Real power quiets you. Glamour makes you louder.",
      reading: `There are two energies that feel very similar and are opposite in nature.\n\n**Glamour** is the feeling of being *special because of the practice*. It wants to be seen. It wants followers. It wants the aesthetic. It shrinks other people to make room for itself.\n\n**Shakti** is the feeling of being *humbled by the practice*. It wants no witness. It naturally serves. It makes other people feel bigger, not smaller, in its presence.\n\nEvery serious practitioner has to learn to tell the difference. The test is simple: after the practice, do you want to post about it, or do you want to be quiet?`,
      practice: {
        name: "The Glamour Check",
        durationMin: 5,
        instructions: `For the next seven days, after every ritual, journal, or practice, ask yourself:\n\n1. Do I want anyone to know I just did this?\n2. If yes — why? What am I trying to prove?\n3. Would this practice still feel valuable if I could never mention it to anyone?\n\nBe brutally honest. Glamour is not evil, but unnoticed glamour warps the practice.`,
      },
      reflection: "Where in your practice has glamour been dressing up as devotion?",
    },
    {
      day: 4,
      title: "Working With What Is Fierce",
      oneLine: "Kali is not a metaphor for anger. She is the mercy of what will not let you keep lying.",
      reading: `Fierce deities — Kali, the Morrigan, Sekhmet, Hekate — are commonly misunderstood as "angry goddesses." They are not. They are the *precise force in the universe that removes what is false*. Working with them is not about becoming fierce. It is about being willing to have what is inauthentic in your life burned off.\n\nThis is dangerous, useful, and cannot be faked. If you invoke Kali and you are not actually willing to let her remove things, she will remove them anyway, and you will call it bad luck.`,
      practice: {
        name: "What Am I Ready To Have Removed?",
        durationMin: 15,
        instructions: `Alone. In writing.\n\n1. Name three things in your life that are false — a relationship, an income source, a story you tell about yourself, a self-image.\n2. For each, ask: *am I actually ready for this to be removed?*\n3. For the ones where the answer is honestly yes — write a request. One sentence. "I am ready to release __."\n4. Read it aloud once.\n5. Then close the circle. (Day 2 protocol.)\n6. Watch, over the coming weeks, what actually moves.`,
      },
      reflection: "What have you been asking to be removed while still holding it with both hands?",
    },
    {
      day: 5,
      title: "The Ordinary Life Is The Altar",
      oneLine: "If your ritual life is beautiful and your ordinary life is a mess, you are doing it wrong.",
      reading: `The single sign of a mature ritual practitioner is that their ordinary life gets *better* — kinder relationships, cleaner finances, more integrity in small things — not that their altar gets more elaborate.\n\nWhen ritual becomes an escape from life rather than a deepening of it, the practice has inverted. The altar has replaced the world. This is the standard failure mode of every esoteric tradition and it is worth watching for in yourself daily.`,
      practice: {
        name: "The Ordinary Audit",
        durationMin: 10,
        instructions: `Look honestly at the ordinary parts of your life:\n\n1. Money — clean or avoided?\n2. Closest relationships — deepening or thinning?\n3. Body — well-tended or neglected?\n4. Word — do you keep your small promises?\n\nFor any category that is not thriving: your next practice this week is to fix the ordinary thing, *as your ritual*. Paying an unpaid bill is a valid sadhana. Cleaning your kitchen is a valid sadhana. The distinction between sacred and ordinary is one of the illusions Kali removes.`,
      },
      reflection: "Which part of your ordinary life is quietly begging for the attention your altar has been getting?",
    },
    {
      day: 6,
      title: "Consent, Sovereignty, And Never Working On Others Without Asking",
      oneLine: "The ethics of power start with the simplest rule: you do not do things to people without their knowing.",
      reading: `In every serious tradition — Tantric, Hermetic, Ifá, ceremonial — there is a rule that beginners often break and elders never do: *you do not work on someone without their explicit consent*. Not "for their good." Not "just a small healing." Not "just sending them love without telling them."\n\nSovereignty is sacred. Overriding another person's field, even with love, teaches your own nervous system that consent is optional. That corrupts everything downstream in your life.\n\nThe rule is simple: work on yourself as much as you like. On others, only with their knowledge and permission.`,
      practice: {
        name: "The Consent Review",
        durationMin: 10,
        instructions: `1. List anyone you have worked on energetically, ritually, or with intention *without their knowing*.\n2. For each, sit with it. Consider whether to tell them, or at minimum, to internally withdraw the working.\n3. Write your own rule going forward. Say it out loud: "I do not work on any person without their explicit knowledge and consent."\n4. Close the circle.`,
      },
      reflection: "Have you ever done magic on someone you would not have done to their face?",
    },
    {
      day: 7,
      title: "Power In Service",
      oneLine: "The final test of a practitioner is whether their power quietly serves the people around them.",
      reading: `The Tantric view and the mature witch's view converge on the same endpoint: **power is only trustworthy when it is in service**. Not service as performance. Service as a natural overflow — because the practitioner is so full, so grounded, so ethical, that being near them is medicine, whether or not they say a word.\n\nThe seven days of this program are a beginner's frame for that life. You now have: the honest inventory, the close, the glamour check, the removal of the false, the ordinary audit, the consent rule.\n\nRun this week once a year. What you become over a decade of running it is what our tradition calls a *sadhak* — a serious practitioner. Not a witch of Instagram. A witch of the village. The kind everyone quietly comes to when things are hard, because they know you will not perform, will not exploit, and will not lie.\n\nThat is Shakti in service. That is the point.`,
      practice: {
        name: "The Annual Vow",
        durationMin: 15,
        instructions: `1. Light one candle.\n2. Write down: "For the coming year, I commit to using my practice in service of __."\n3. Fill in something specific — a community, a household, a lineage, a person, an art.\n4. Add: "And I refuse to use it for __." Fill in the temptation you know is yours (attention, control, revenge, superiority, escape).\n5. Read it out loud once.\n6. Extinguish the candle. Close the circle. Do not post about it.\n7. Return to it a year from today.`,
      },
      reflection: "What would it mean to become the kind of practitioner people trust to be near a crisis?",
    },
  ],
};

// ============================================================================
// COMING SOON — additional audience programs (metadata only, full content in progress)
// These render on the catalog with a "next release" label.
// ============================================================================
export interface AudienceProgramStub {
  slug: string;
  title: string;
  subtitle: string;
  guru: string;
  theme: string;
  color: string;
  audience: NonNullable<ShowroomProgram["audience"]>;
  status: "coming-soon";
}

// All previous stubs are now full programs — see AUDIENCE_PROGRAMS_EXPANSION.
export const AUDIENCE_PROGRAM_STUBS: AudienceProgramStub[] = [];

import { AUDIENCE_PROGRAMS_BATCH2 } from "./programs/audienceProgramsBatch2";
import { MEGA_CATALOG_PROGRAMS } from "./programs/megaCatalog";

export const AUDIENCE_PROGRAMS: ShowroomProgram[] = [
  CORPORATE_LEADERSHIP,
  GOVERNMENT_DUTY,
  LOOPS_TRAUMA,
  WITCHCRAFT_SHAKTI,
  ...AUDIENCE_PROGRAMS_EXPANSION,
  ...AUDIENCE_PROGRAMS_BATCH2,
  ...MEGA_CATALOG_PROGRAMS,
];

// Audience metadata for the catalog UI
export const AUDIENCES: {
  id: NonNullable<ShowroomProgram["audience"]>;
  label: string;
  tagline: string;
  color: string;
}[] = [
  { id: "corporate", label: "Corporate & Leadership", tagline: "For people who have to stay calm when their team is not.", color: "from-slate-500/20 to-blue-500/10" },
  { id: "government", label: "Government & Uniformed Services", tagline: "For police, military, medics, bureaucrats, judges.", color: "from-stone-600/20 to-amber-700/10" },
  { id: "healers", label: "Healers & Trauma", tagline: "For those working with their own nervous system, and others'.", color: "from-violet-500/20 to-fuchsia-500/10" },
  { id: "ritual", label: "Ritual & Witchcraft", tagline: "For practitioners of Shakti, magic, and devotional power.", color: "from-rose-600/20 to-purple-800/10" },
  { id: "creators", label: "Creators & Artists", tagline: "For writers, designers, musicians in flow and in block.", color: "from-teal-500/20 to-sky-500/10" },
  { id: "parents", label: "Parents & Family", tagline: "For the hardest job on earth.", color: "from-emerald-500/20 to-lime-500/10" },
  { id: "students", label: "Students & Youth", tagline: "Attention, exams, phones, meaning.", color: "from-yellow-500/20 to-orange-500/10" },
  { id: "athletes", label: "Athletes", tagline: "Pre-performance regulation and in-game focus.", color: "from-orange-600/20 to-rose-600/10" },
  { id: "founders", label: "Founders & Entrepreneurs", tagline: "The loneliness of the top seat.", color: "from-slate-600/20 to-stone-500/10" },
  { id: "healthcare", label: "Doctors & Healthcare", tagline: "Compassion without collapse.", color: "from-sky-500/20 to-indigo-500/10" },
  { id: "teachers", label: "Teachers", tagline: "Holding a room without losing yourself.", color: "from-pink-500/20 to-red-400/10" },
  { id: "grief", label: "Grief & Loss", tagline: "A companion, not a cure.", color: "from-indigo-700/20 to-purple-800/10" },
  { id: "nurses", label: "Nurses & Night-Shift", tagline: "Compassion that doesn't burn out at 4am.", color: "from-rose-500/20 to-red-500/10" },
  { id: "lawyers", label: "Lawyers & Judges", tagline: "The mind of the advocate, off the record.", color: "from-slate-600/20 to-zinc-500/10" },
  { id: "monks", label: "Monks & Renunciates", tagline: "For the long path, past year seven.", color: "from-stone-500/20 to-slate-500/10" },
  { id: "refugees", label: "Refugees & Displaced", tagline: "The home you carry across every border.", color: "from-blue-500/20 to-teal-500/10" },
  { id: "recovery", label: "Recovery & Addiction", tagline: "The other 23 hours between meetings.", color: "from-cyan-500/20 to-indigo-500/10" },
  { id: "caregivers", label: "Caregivers Of The Sick", tagline: "For the invisible shift with no clock.", color: "from-amber-400/20 to-orange-400/10" },
  { id: "lgbtq", label: "LGBTQ+ & Identity", tagline: "The self underneath the label.", color: "from-fuchsia-500/20 to-pink-500/10" },
  { id: "prisoners", label: "Prisoners & Re-Entry", tagline: "The freedom you can build inside a cell.", color: "from-zinc-500/20 to-stone-500/10" },
  { id: "journalists", label: "Journalists & Witnesses", tagline: "The camera that does not break.", color: "from-neutral-500/20 to-stone-500/10" },
  { id: "sexworkers", label: "Body-Labor & Sex Workers", tagline: "The interior is not for sale.", color: "from-rose-500/20 to-red-400/10" },
  { id: "widows", label: "Widows & Solitude", tagline: "For the other side of the bed.", color: "from-indigo-700/20 to-slate-800/10" },
  { id: "musicians", label: "Musicians & Performers", tagline: "Pre-stage physiology to post-show comedown.", color: "from-purple-500/20 to-pink-500/10" },
];