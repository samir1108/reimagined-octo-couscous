import { LabGame } from "./labRegistry";
import { GameMeta } from "./gameRegistry";

// Adapt a LabGame into the GameMeta shape the shell expects.
// Also surfaces sensor needs + faculty tone for the shell's permissions
// gate and ambient backdrop.
export function labToMeta(g: LabGame): GameMeta & {
  needs?: { mic?: boolean; camera?: boolean };
  tone?: string;
} {
  return {
    id: g.id,
    number: g.number,
    name: g.name,
    category: g.tradition.split(/[—\-+()/]/)[0].trim(),
    oneLine: g.oneLine,
    signal: g.signal,
    size: "S",
    unlockLevel: 1,
    available: g.available,
    needs: {
      mic: !!g.needsMic,
      camera: !!g.needsCamera,
    },
    tone: g.faculties?.[0],
  };
}
