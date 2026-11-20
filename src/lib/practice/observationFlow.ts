/**
 * Observation Flow
 * ────────────────
 * Turns a seed + its form into an ordered beat list.
 *
 * There is no universal session skeleton here. A seed's form decides which
 * stages exist and in what order — a `vigil` has no journal, a `threshold`
 * opens with a question, a `return` goes into the object twice.
 */
import { obsFormDef, resolveObsForm, type ObsSeed, type ObsStage } from "@/data/observationSessions";

export type ObsFlowTone = "anchor" | "instruction" | "reflection";

export interface ObsFlowBeat {
  title: string;
  body: string;
  tone: ObsFlowTone;
  /** Relative length in timed layouts (1 = normal, 2 = long). */
  weight: number;
}

const ARRIVAL_LINES: Record<string, string> = {
  scattered: "Sit down and let the body be heavy for a moment. The mind can keep moving; you do not have to follow it.",
  tired: "Sit back. Let the seat take your weight. This sitting does not need energy — only attention.",
  tense: "Sit tall and let the jaw loosen. Feel where the body is bracing, without asking it to stop.",
  okay: "Sit comfortably. Nothing to fix before we begin.",
  open: "Sit as you are. Whatever is already awake in you can lead.",
};

const DEFAULT_ARRIVAL =
  "Sit comfortably. Let the spine be tall, the shoulders soft. Close the eyes if it helps.";

export function buildObservationFlow(
  seed: ObsSeed,
  opts: { arrivalState?: string | null } = {},
): ObsFlowBeat[] {
  const form = resolveObsForm(seed);
  const flow = obsFormDef(seed).flow;
  const beats: ObsFlowBeat[] = [];
  let exploreRound = 0;

  const stageBeat = (stage: ObsStage): void => {
    switch (stage) {
      case "arrival":
        beats.push({
          title: "Arrive",
          body: ARRIVAL_LINES[opts.arrivalState ?? ""] ?? DEFAULT_ARRIVAL,
          tone: "instruction",
          weight: 1,
        });
        break;

      case "land":
        beats.push({
          title: "Land in the body",
          body: "Feel the weight of the body on the seat, the air on the skin, the floor pressing back.",
          tone: "anchor",
          weight: 1,
        });
        break;

      case "anchor":
        beats.push({
          title: "Anchor",
          body: "Three slow breaths at the nostrils. Do not change them — just know them.",
          tone: "anchor",
          weight: 1,
        });
        break;

      case "question":
        beats.push({
          title: "Hold the Question",
          body: `Do not answer this. ${seed.exploration[0]?.body ?? "Stay with the question itself."}`,
          tone: "instruction",
          weight: 1,
        });
        break;

      case "gaze":
        beats.push({
          title: "Gaze",
          body: `Open the eyes softly. Rest them on one thing ahead and let it be exactly as it is. ${seed.exploration[0]?.body ?? ""}`.trim(),
          tone: "instruction",
          weight: 2,
        });
        break;

      case "explore": {
        exploreRound += 1;
        const round = exploreRound;
        const source = round === 1 ? seed.exploration : seed.exploration.slice(0, 1);
        for (const beat of source) {
          beats.push({
            title: round === 1 ? beat.title : `Return: ${beat.title}`,
            body: round === 1 ? beat.body : `Come back to it. ${beat.body}`,
            tone: "instruction",
            weight: 1,
          });
        }
        break;
      }

      case "silence":
        beats.push({
          title: "Silence",
          body: "Let the instruction go. For a few breaths, only what is actually here.",
          tone: "anchor",
          weight: form === "vigil" ? 3 : 1.6,
        });
        break;

      case "rest":
        beats.push({
          title: "Rest",
          body: "Rest without a task. Nothing to add, nothing to finish.",
          tone: "anchor",
          weight: form === "vigil" ? 2.5 : 1.5,
        });
        break;

      case "integrate":
        beats.push({ title: "Integrate", body: seed.integration, tone: "reflection", weight: 1 });
        break;

      case "journal":
        beats.push({ title: "One Line", body: seed.journalPrompt, tone: "reflection", weight: 1 });
        break;

      case "carry":
        beats.push({ title: "Carry It", body: seed.carryTask, tone: "instruction", weight: 1 });
        break;
    }
  };

  for (const stage of flow) stageBeat(stage);
  return beats;
}

/**
 * Give each beat a duration, weighted by the form. Short forms move fast;
 * a vigil's silence gets most of the sitting.
 */
export function layoutObservationBeats(
  beats: ObsFlowBeat[],
  totalSec: number,
): Array<ObsFlowBeat & { seconds: number }> {
  const minSec = 12;
  const totalWeight = beats.reduce((sum, b) => sum + b.weight, 0) || 1;
  const perWeight = totalSec / totalWeight;

  return beats.map((beat) => ({
    ...beat,
    seconds: Math.max(minSec, Math.round(perWeight * beat.weight)),
  }));
}

/** Named stages in the form — useful for the UI ("Spiral · 2 rounds"). */
export function observationFormLabel(seed: ObsSeed): string {
  return obsFormDef(seed).label;
}
