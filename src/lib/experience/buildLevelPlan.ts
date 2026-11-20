// Client-side builder that turns an ExperiencePath level into a full
// SessionPlan runnable by the app's UniversalSessionShell — same UI paid
// users get, but with no auth, no credits, no backend composer required.

import type { PathLevel, YogicPath } from "@/data/experiencePaths";
import type { SessionPlan, SessionStep } from "@/lib/session-shell/types";

function firstSentences(txt: string, n = 2): string {
  const cleaned = txt.replace(/\s+/g, " ").trim();
  const parts = cleaned.split(/(?<=[.!?])\s+/);
  return parts.slice(0, n).join(" ");
}

export function buildLevelSessionPlan(path: YogicPath, lvl: PathLevel): {
  sessionId: string;
  plan: SessionPlan;
} {
  const sessionId = `exp:${path.slug}:l${lvl.level}`;

  const teaching = lvl.teaching ? firstSentences(lvl.teaching, 3) : lvl.promise;
  const practices = (lvl.practices ?? []).slice(0, 6);
  const [p1, p2, p3, p4] = practices;

  const steps: SessionStep[] = [];

  // 1) Wisdom read — the teaching, given as a passage to sit with.
  steps.push({
    kind: "wisdom-read",
    title: `Teaching · ${path.guru}`,
    prompt: teaching,
    est_minutes: 2,
    whyForYou: `Level ${lvl.level} of ${path.name} opens with the voice of ${path.guru}.`,
  });

  // 2) Breath — settle before the practice.
  steps.push({
    kind: "breathwork",
    title: "Arrive in the breath",
    prompt: "Six slow breaths. Let the day fall behind you.",
    params: { durationSeconds: 90 },
    est_minutes: 2,
    whyForYou: `Every session on the ${path.name} path begins with the body catching up to the mind.`,
  });

  // 3) Reflection — the level's promise as a question.
  steps.push({
    kind: "reflection",
    title: "What does this level ask of you?",
    prompt: `"${lvl.promise}" — where in your life is this asking to be lived?`,
    est_minutes: 3,
    whyForYou: `The promise of Level ${lvl.level}: ${lvl.title}.`,
  });

  // 4) Practice — the core practice of the level.
  if (p1) {
    steps.push({
      kind: "practice",
      title: `Practice · ${p1}`,
      prompt: `${p1}. Do it simply. Do not perform it. Just meet it.`,
      params: { durationSeconds: 240, practiceName: p1 },
      est_minutes: 4,
      whyForYou: `${p1} is the ground practice of ${lvl.title}.`,
      guidance: {
        summary: `${p1} is the ground practice of ${lvl.title}. Do it simply — you are not performing it, you are meeting it.`,
        effort: 3,
        beats: [
          {
            title: "Set up",
            seconds: 30,
            detail:
              "Sit with the spine upright but not rigid — as if a thread were lifting the crown of your head. Let the shoulders drop away from the ears and rest the hands where they are still. Set a timer so you never have to check the clock.",
            narration:
              "Sit with your spine upright, but not rigid. Let your shoulders fall away from your ears. There is nothing to fix.",
          },
          {
            title: "Arrive before you begin",
            seconds: 30,
            detail:
              `Close the eyes or soften the gaze to a point a metre ahead. Take three slow breaths and let each exhale be longer than the inhale. On the last exhale, let the practice of ${p1} begin on its own — do not start it with will.`,
            narration:
              "Close your eyes, or soften your gaze. Three slow breaths. Each exhale a little longer than the inhale. Let the practice begin on its own — do not start it with will.",
          },
          {
            title: "The practice itself",
            seconds: 150,
            detail:
              "Do the practice exactly as written, no better and no worse than usual. When you notice you have drifted into thinking, planning or judging, that noticing is the practice working — not failing. Return to the instruction the way you would return a hand to the breath: without commentary.",
            narration:
              "Now do the practice as written. Not better than usual, not worse. When you notice you have drifted, that noticing is the practice working. Return gently, without commentary.",
          },
          {
            title: "Stay to the end of the discomfort",
            seconds: 30,
            detail:
              "Somewhere around the middle, restlessness or boredom will arrive. This is the threshold. Do not stop here and do not push through it either — simply keep doing the practice while the restlessness is present. This is where the level is actually earned.",
            narration:
              "Somewhere around the middle, restlessness or boredom will arrive. This is the threshold. Do not stop, and do not force. Just keep going while it is here.",
          },
        ],
        cues: [
          "The instruction is the object; you are the one returning to it.",
          "Drifting and returning is one repetition, not a mistake.",
          "Quality over duration — two attentive minutes beat ten scattered ones.",
        ],
        misconception:
          "That a calm, quiet mind means it is working. Most of the value is in the return, not the calm. A session full of drift and returns is a good session.",
        whatYouMayNotice: [
          "Restlessness or an urge to stop around the two-minute mark — this is normal and expected.",
          "Sleepiness, heat, tingling, or a sense of the body being very large or very small.",
          "A sudden memory or task appearing urgently. It will still be there afterwards.",
        ],
        ifThen: [
          {
            when: "Your mind keeps racing and you cannot hold the instruction",
            then: "Drop to the smallest unit — one phrase, or just the feeling of the breath at the nostrils. Small and steady beats broad and fought.",
          },
          {
            when: "You feel strong emotion come up",
            then: "Do not analyse it. Name it once, silently, and stay with the sensation in the body. If it is too much, open your eyes and stop for today.",
          },
          {
            when: "You realise you have been thinking for the last two minutes",
            then: "Nothing is lost. Return exactly where you are. The noticing itself is the repetition.",
          },
        ],
        variations: [
          {
            label: "Easier",
            detail:
              "Halve every timer and run the practice twice. Two short, attentive rounds build the habit faster than one long, fought one.",
          },
          {
            label: "Deeper",
            detail:
              "Add a fifth beat: sit for two minutes afterwards with no instruction at all, just watching what the practice left behind.",
          },
          {
            label: "If sitting is painful",
            detail:
              "Lie down, or stand, or walk slowly while doing it. The posture serves the attention, never the reverse.",
          },
        ],
        safety: [
          "Stop if you feel dizzy, panicked, or ungrounded. Lie down and breathe through the nose until it passes.",
          "If a traumatic memory takes over completely rather than passing through, stop the practice and speak to someone you trust.",
        ],
        doneWhen: `You stayed with ${p1} for the full timer, and noticed at least once that your attention had wandered and brought it back.`,
        pitfalls: [
          "Performing the practice for an imaginary audience instead of doing it.",
          "Ending early because it felt uneventful — uneventful is often where the depth is.",
          "Adding extra effort or technique that was not asked for.",
        ],
        after: {
          carryIntoDay:
            "Before you pick up your phone or speak to anyone, take one breath with the same quality you had at the two-minute mark.",
          journalPrompt:
            `What did ${p1} feel like today — and where in your ordinary day is that same quality missing?`,
          restNote:
            "Sit for a few breaths before standing. Deep practice leaves the system soft; standing straight into a screen undoes some of it.",
        },
      },
    });
  }

  // 5) Second practice as journal prompt if present.
  if (p2) {
    steps.push({
      kind: "journal",
      title: "Write what surfaced",
      prompt: `As you did "${p2}", what surfaced — a thought, an ache, a memory, a resistance? Write it down without editing.`,
      est_minutes: 4,
    });
  }

  // 6) Witness — hold what came up.
  steps.push({
    kind: "witness",
    title: "Witness what arose",
    prompt: "Close the eyes. Watch what came up without joining it. You are the one who sees, not what is seen.",
    params: { durationSeconds: 120 },
    est_minutes: 2,
    whyForYou: `Witness is the thread that runs through all six paths.`,
  });

  // 7) Third practice → micro-act to carry into the day.
  if (p3 || p4) {
    const carry = p3 ?? p4!;
    steps.push({
      kind: "micro-act",
      title: "Carry one thing into the day",
      prompt: `Before you touch your phone or speak to anyone, do this once: ${carry}.`,
      est_minutes: 1,
      optional: true,
    });
  }

  // 8) Close — final reflection.
  steps.push({
    kind: "reflection",
    title: "Close",
    prompt: `You have tasted Level ${lvl.level} of ${path.name}. In one sentence — what shifted?`,
    est_minutes: 2,
  });

  const plan: SessionPlan = {
    id: sessionId,
    intent: `${path.name} · Level ${lvl.level} — ${lvl.title}`,
    intro: lvl.promise,
    steps,
    _meta: {
      composedBy: "experience-path-level",
      archetype: path.guru,
      toneWords: [path.name, `level-${lvl.level}`],
      whyThisSession: lvl.promise,
    },
  };

  return { sessionId, plan };
}
