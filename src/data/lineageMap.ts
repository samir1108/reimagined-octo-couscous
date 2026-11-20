/**
 * Lineage derivation: pick 3 masters as your spiritual ancestry based on the
 * user's strongest dimension and journey phase. Pure-frontend — no DB writes.
 */
export type LineageMaster = { name: string; tradition: string; era: string };

// Each dimension has a 3-master lineage. Picked from real anchors per Band Guidebook.
const DIMENSION_LINEAGES: Record<string, LineageMaster[]> = {
  awareness: [
    { name: "Ramana Maharshi", tradition: "Advaita Vedanta", era: "1879–1950" },
    { name: "Nisargadatta Maharaj", tradition: "Advaita", era: "1897–1981" },
    { name: "Adyashanti", tradition: "Zen / Nondual", era: "Living" },
  ],
  thought: [
    { name: "J. Krishnamurti", tradition: "Choiceless Awareness", era: "1895–1986" },
    { name: "Patanjali", tradition: "Yoga Sutras", era: "~200 BCE" },
    { name: "Eckhart Tolle", tradition: "Presence", era: "Living" },
  ],
  emotion: [
    { name: "Rumi", tradition: "Sufi / Mevlevi", era: "1207–1273" },
    { name: "Mirabai", tradition: "Bhakti", era: "1498–1547" },
    { name: "Hafiz", tradition: "Sufi", era: "1325–1390" },
  ],
  body: [
    { name: "Patanjali", tradition: "Ashtanga Yoga", era: "~200 BCE" },
    { name: "Sri T. Krishnamacharya", tradition: "Hatha Yoga", era: "1888–1989" },
    { name: "Bodhidharma", tradition: "Zen / Shaolin", era: "5th c." },
  ],
};

export function deriveLineage(
  dimensionBands: Record<string, number> | undefined,
  overallBand: number,
): { masters: LineageMaster[]; rootDimension: string } {
  const dims = dimensionBands || {};
  const entries = Object.entries(dims).filter(([k]) => k in DIMENSION_LINEAGES);
  const top = entries.sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const rootDimension = top?.[0] || (overallBand >= 6 ? "awareness" : "thought");
  return {
    masters: DIMENSION_LINEAGES[rootDimension] || DIMENSION_LINEAGES.awareness,
    rootDimension,
  };
}
