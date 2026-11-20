/**
 * Resolve loop IDs (e.g. "VAL001") to human-readable names (e.g. "People-Pleasing").
 * Pulls names from the loop library file at module load.
 */
import rawSource from "@/lib/localLoopDetector?raw";

const NAMES: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  const re = /id:\s*"([A-Z]+[0-9]+)",\s*name:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rawSource)) !== null) out[m[1]] = m[2];
  return out;
})();

// Category prefix → friendly word, used as a fallback when the AI emits a loose
// id like "COG-over-control" or "EMO-loops" that isn't in the canonical library.
const CATEGORY_LABEL: Record<string, string> = {
  MEN: "Mind", COG: "Cognitive", ATT: "Attention", EMO: "Emotion",
  REL: "Relational", VAL: "Value", IDN: "Identity", BHV: "Behavior",
  BOD: "Body", EGO: "Ego", FEAR: "Fear", CMP: "Comparison",
  CTL: "Control", REC: "Recovery", WRK: "Work", BUR: "Burnout",
  RES: "Restlessness", BIO: "Biological", AVD: "Avoidance",
  SHM: "Shame", SLF: "Self", PRC: "Perception",
};

function titleCase(s: string): string {
  return s
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function getLoopName(id: string): string {
  if (!id) return "";
  if (NAMES[id]) return NAMES[id];

  // Strip "loop"/"loops" suffix words and a leading category prefix like "COG-".
  const trimmed = id
    .replace(/[-_\s]?loops?$/i, "")
    .replace(/^([A-Z]{2,5})[-_]/, (_m, prefix) => {
      const label = CATEGORY_LABEL[prefix.toUpperCase()];
      return label ? `${label} ` : "";
    });

  // Plain category id like "COG" → "Cognitive Patterns".
  const catOnly = id.replace(/[-_\s]?loops?$/i, "").toUpperCase();
  if (CATEGORY_LABEL[catOnly]) return `${CATEGORY_LABEL[catOnly]} Patterns`;

  // If still looks like a canonical-but-unknown id (e.g. ABC123), keep it.
  if (/^[A-Z]{2,5}\d{2,4}$/.test(trimmed)) return trimmed;

  const pretty = titleCase(trimmed);
  return pretty || id;
}

export function getLoopNames(ids: string[]): string[] {
  return ids.map(getLoopName);
}
