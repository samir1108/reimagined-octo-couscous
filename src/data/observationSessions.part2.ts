/**
 * Observation Sessions — L4–L5 seeds (28 of 100).
 * L4 · Thought Watching. L5 · Pattern Watching.
 */
import type { ObsSeed } from "./observationSessions";

type Beat = [title: string, body: string];

const s = (
  id: string,
  level: ObsSeed["level"],
  lens: ObsSeed["lens"],
  method: ObsSeed["method"],
  slot: ObsSeed["slot"],
  minutes: number[],
  visual: ObsSeed["visual"],
  voice: string,
  beats: Beat[],
  integration: string,
  journalPrompt: string,
  carryTask: string,
  source?: string,
): ObsSeed => ({
  id,
  level,
  lens,
  method,
  slot,
  minutes,
  visual,
  voice,
  source,
  exploration: beats.map(([title, body]) => ({ title, body })),
  integration,
  journalPrompt,
  carryTask,
});

export const OBS_SEEDS_L4_L5: ObsSeed[] = [
  // ───────────────────────── L4 · THOUGHT WATCHING (14) ─────────────────────
  s(
    "obs-l4-01", 4, "thought", "labeling", "any", [10, 15, 20], "orb-pulse", "buddha",
    [
      ["Anchor", "Rest attention at the breath."],
      ["Label", "Each time a thought arises, say silently: thinking."],
      ["Return", "No fight, no follow. Label, then return to the breath."],
    ],
    "A labelled thought is already one step away from you.",
    "Which word did you label most often?",
    "Three times today, say thinking before following a thought.",
    "buddha:anapanasati",
  ),
  s(
    "obs-l4-02", 4, "thought", "noting", "any", [10, 15, 20], "horizon", "krishnamurti",
    [
      ["Sound", "Notice a thought as if it were a sound arriving."],
      ["Tone", "Hear its tone — urgent, quiet, familiar, rehearsed."],
      ["Listen", "Listen to the next thought before believing it."],
    ],
    "A thought you hear is different from a thought you are.",
    "What did your thoughts sound like today?",
    "Once today, hear one thought before obeying it.",
  ),
  s(
    "obs-l4-03", 4, "thought", "noting", "evening", [10, 15, 20], "horizon", "krishnamurti",
    [
      ["Image", "Notice a thought as an image or a short film."],
      ["Frame", "See the frame before the story takes over."],
      ["Release", "Let the image dissolve without finishing it."],
    ],
    "Thought is often cinema. You are allowed to leave the theatre.",
    "What image kept returning?",
    "Once tonight, notice one image before it becomes a story.",
  ),
  s(
    "obs-l4-04", 4, "thought", "neti-neti", "any", [10, 15, 20], "orb-still", "ramana",
    [
      ["Question", "Ask gently: who is thinking this?"],
      ["Not It", "Whatever answers, say: not this."],
      ["Stay", "Stay with the one who cannot be found."],
    ],
    "The thinker is not another thought.",
    "What answered when you asked who is thinking?",
    "Once today, ask who is thinking and do not answer.",
    "ramana:who-am-i",
  ),
  s(
    "obs-l4-05", 4, "thought", "rest", "night", [10, 15, 20], "orb-still", "buddha",
    [
      ["Gap", "Wait for the space between two thoughts."],
      ["Notice", "Do not create it. Just catch it."],
      ["Rest", "Rest in the gap for as long as it stays."],
    ],
    "The gap does not need to be long to be real.",
    "How long did the gap last?",
    "Once tonight, rest in one gap between thoughts.",
  ),
  s(
    "obs-l4-06", 4, "thought", "labeling", "midday", [10, 15, 20], "orb-pulse", "buddha",
    [
      ["Planning", "Notice the next plan your mind starts making."],
      ["Label", "Say: planning. Do not finish the plan."],
      ["Return", "Return to the breath, plan unfinished."],
    ],
    "Not every plan needs to be completed today.",
    "What were you planning that could wait?",
    "Once today, stop one plan mid-sentence.",
  ),
  s(
    "obs-l4-07", 4, "thought", "labeling", "evening", [10, 15, 20], "orb-still", "krishnamurti",
    [
      ["Memory", "Notice the mind replaying something from today."],
      ["Label", "Say: remembering. Let the replay run out."],
      ["Now", "Return to what is actually in front of you."],
    ],
    "The past is not a place you can finish visiting.",
    "What was the mind replaying?",
    "Once tonight, label one replay as remembering and stop.",
  ),
  s(
    "obs-l4-08", 4, "thought", "noting", "any", [10, 15, 20], "horizon", "krishnamurti",
    [
      ["Judge", "Notice the next judgement — of yourself or someone else."],
      ["Name", "Name it plainly: judging."],
      ["Soften", "Let the judgement pass without adding another."],
    ],
    "Judging the judging is just more judging.",
    "Who were you judging today?",
    "Once today, catch one judgement without adding a second.",
  ),
  s(
    "obs-l4-09", 4, "thought", "noting", "any", [10, 15, 20], "orb-pulse", "buddha",
    [
      ["Not Now", "Notice the thought that says not now, later."],
      ["See", "See it as a postponement, not a truth."],
      ["Stay", "Stay with what the thought was avoiding."],
    ],
    "Not now is usually a fear wearing a schedule.",
    "What were you postponing?",
    "Once today, stay with one thing you wanted to postpone.",
  ),
  s(
    "obs-l4-10", 4, "thought", "open", "any", [15, 20, 30], "horizon", "krishnamurti",
    [
      ["Commentary", "Hear the quiet commentary running under everything."],
      ["No Need", "You do not need to reply to it."],
      ["Space", "Leave the commentary unanswered for three minutes."],
    ],
    "The commentary has been talking for years. It can wait.",
    "What did the commentary keep insisting on?",
    "Once today, let one comment go unanswered.",
  ),
  s(
    "obs-l4-11", 4, "thought", "counting", "morning", [10, 15, 20], "orb-pulse", "buddha",
    [
      ["One", "Notice exactly one thought. Let it finish."],
      ["Two", "Then the next one. Do not return to the first."],
      ["Slow", "Let thoughts pass in single file instead of a crowd."],
    ],
    "Thoughts are sequential. The crowd is an illusion.",
    "What was the second thought after the first?",
    "Once today, let one thought finish before starting the next.",
  ),
  s(
    "obs-l4-12", 4, "thought", "rest", "night", [10, 15, 20], "orb-still", "buddha",
    [
      ["Watch", "Watch a thought without believing or disbelieving it."],
      ["Neither", "Do not take it as fact. Do not push it away."],
      ["Neutral", "Rest as a neutral observer of the thought."],
    ],
    "Not believing is not the same as denying.",
    "What did it feel like to not believe a thought?",
    "Once tonight, hold one belief loosely for a minute.",
  ),
  s(
    "obs-l4-13", 4, "thought", "open", "any", [10, 15, 20], "horizon", "krishnamurti",
    [
      ["Space", "Notice the space around a thought rather than the thought."],
      ["Widen", "Let attention take in the whole room, thought included."],
      ["Rest", "Stay wide. The thought is a small thing in a big space."],
    ],
    "Attention on the space shrinks the thought.",
    "Did the thought get smaller when you widened attention?",
    "Once today, widen your attention when a thought grips you.",
  ),
  s(
    "obs-l4-14", 4, "thought", "noting", "any", [10, 15, 20], "orb-pulse", "buddha",
    [
      ["Event", "See a thought as an event — it appears, stays, leaves."],
      ["Clock", "Notice how long it actually stayed."],
      ["Pass", "Let the next one arrive and leave the same way."],
    ],
    "A thought has a lifespan when you do not feed it.",
    "How long did the thought stay when you did not touch it?",
    "Once today, time one thought without feeding it.",
  ),

  // ───────────────────────── L5 · PATTERN WATCHING (14) ─────────────────────
  s(
    "obs-l5-01", 5, "pattern", "noting", "any", [10, 20, 30], "horizon", "krishnamurti",
    [
      ["Catch", "Wait for a familiar thought — one you have had before."],
      ["Name", "Name the loop: not enough, not safe, not seen, not done."],
      ["Drop", "Drop it like a hot stone. It will come back. That is fine."],
    ],
    "Naming a loop is half of dissolving it.",
    "What did you name the loop?",
    "Once today, name a loop out loud when it appears.",
  ),
  s(
    "obs-l5-02", 5, "pattern", "labeling", "midday", [10, 20, 30], "orb-pulse", "krishnamurti",
    [
      ["Worry", "Notice the worry your mind returns to most often."],
      ["Shape", "See its shape: a question, a scene, a sentence."],
      ["Outside", "Observe it as if it belonged to someone else."],
    ],
    "The same worry is a habit, not an emergency.",
    "What worry returned today?",
    "Once today, name the worry and postpone it by five minutes.",
  ),
  s(
    "obs-l5-03", 5, "pattern", "noting", "evening", [10, 20, 30], "orb-still", "buddha",
    [
      ["Story", "Find the story you told about today more than once."],
      ["Version", "Notice how the version changed each time."],
      ["Loose", "Hold the story loosely. It is a draft, not a record."],
    ],
    "You have told yourself the same story in many versions.",
    "Which story did you repeat today?",
    "Once tonight, catch yourself retelling a story and stop.",
  ),
  s(
    "obs-l5-04", 5, "pattern", "neti-neti", "any", [10, 20, 30], "orb-still", "ramana",
    [
      ["Image", "Notice the self-image you are defending right now."],
      ["Not It", "Say: I am not this image."],
      ["Defend", "Watch how quickly the mind wants to defend it anyway."],
    ],
    "The image is not you. The defending is the loop.",
    "What image were you defending?",
    "Once today, notice one defence of an image.",
  ),
  s(
    "obs-l5-05", 5, "pattern", "noting", "any", [10, 20, 30], "horizon", "buddha",
    [
      ["Trigger", "Recall today's trigger. The small thing that set it off."],
      ["Chain", "Trace what happened next: thought, feeling, action."],
      ["Early", "Find the step where the chain could have stopped."],
    ],
    "A loop is a chain. Every link is a choice you did not see.",
    "Where could the chain have stopped?",
    "Once today, catch one link in a chain before the action.",
  ),
  s(
    "obs-l5-06", 5, "pattern", "labeling", "evening", [15, 20, 30], "orb-still", "krishnamurti",
    [
      ["Payoff", "Ask: what does this loop give me?"],
      ["Honest", "Be honest — comfort, identity, safety, revenge."],
      ["See", "See the trade the loop is making for you."],
    ],
    "Every loop pays something. That is why it survives.",
    "What was the loop paying you?",
    "Once today, ask what a habit is paying you.",
  ),
  s(
    "obs-l5-07", 5, "pattern", "noting", "any", [10, 20, 30], "horizon", "buddha",
    [
      ["Hour", "Notice the time of day this thought usually arrives."],
      ["Body", "Check what the body was doing just before it."],
      ["Pattern", "See the loop as a schedule, not a surprise."],
    ],
    "The loop keeps an appointment you never made.",
    "What time did the loop arrive today?",
    "Once today, notice the hour before a familiar mood arrives.",
  ),
  s(
    "obs-l5-08", 5, "pattern", "open", "night", [15, 20, 30], "orb-pulse", "krishnamurti",
    [
      ["Person", "Bring to mind a relationship that repeats a pattern."],
      ["Role", "Notice the role you play — rescuer, victim, judge, ghost."],
      ["See", "See the role without stepping into it."],
    ],
    "The role is not the relationship.",
    "Which role did you notice?",
    "Once today, notice a role before playing it.",
  ),
  s(
    "obs-l5-09", 5, "pattern", "neti-neti", "any", [10, 20, 30], "orb-pulse", "ramana",
    [
      ["Enough", "Hear the not-enough thought in whatever form it takes today."],
      ["Question", "Ask: enough for what, and according to whom?"],
      ["Not It", "Say: this measuring is not me."],
    ],
    "The not-enough loop needs a ruler you never agreed to.",
    "What was being measured today?",
    "Once today, notice one measurement of yourself.",
  ),
  s(
    "obs-l5-10", 5, "pattern", "labeling", "midday", [10, 20, 30], "horizon", "krishnamurti",
    [
      ["Rehearse", "Catch the mind rehearsing an argument."],
      ["Label", "Say: rehearsing. You are not in the room yet."],
      ["Drop", "Let the rehearsal go. It will not make you safer."],
    ],
    "Rehearsal is preparation for a conversation that may never happen.",
    "What argument were you rehearsing?",
    "Once today, stop one rehearsal and return to now.",
  ),
  s(
    "obs-l5-11", 5, "pattern", "noting", "morning", [10, 20, 30], "horizon", "buddha",
    [
      ["Compare", "Notice the mind comparing you to someone today."],
      ["Measure", "See that comparison needs a missing piece to work."],
      ["Whole", "Return to what is complete without the comparison."],
    ],
    "Comparison requires you to forget half of yourself.",
    "Who were you compared to in your mind?",
    "Once today, notice one comparison without finishing it.",
  ),
  s(
    "obs-l5-12", 5, "pattern", "noting", "any", [15, 20, 30], "orb-still", "krishnamurti",
    [
      ["Control", "Notice where you are trying to control an outcome."],
      ["Grip", "Feel the grip in the body."],
      ["Open", "Open the grip by one finger, not the whole hand."],
    ],
    "Control is a grip. You can loosen it without letting go.",
    "What were you gripping today?",
    "Once today, loosen one grip by one percent.",
  ),
  s(
    "obs-l5-13", 5, "pattern", "neti-neti", "night", [15, 20, 30], "orb-still", "ramana",
    [
      ["Surface", "Name the surface loop — the one you can see."],
      ["Under", "Ask what loop it is protecting underneath."],
      ["Deeper", "Do not force an answer. Let it surface."],
    ],
    "Every surface loop is guarding a deeper one.",
    "What did you sense underneath?",
    "Once tonight, ask what a habit is protecting.",
  ),
  s(
    "obs-l5-14", 5, "pattern", "rest", "evening", [15, 20, 30], "orb-pulse", "krishnamurti",
    [
      ["Watch", "Watch the loop appear one more time."],
      ["Name", "Name it, once, without blame."],
      ["Space", "Notice that naming created a small space around it."],
    ],
    "The named loop has less room to run.",
    "What space appeared when you named it?",
    "Once today, name one loop and feel the space.",
  ),
];
