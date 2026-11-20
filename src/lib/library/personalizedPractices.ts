import type { SensorialManifest } from "@/data/sensorialPractices/types";

const DIMENSION_KEYWORDS: Record<string, string[]> = {
  thought: ["inquiry", "mind", "neti", "koan", "emptiness"],
  emotion: ["heart", "emotion", "tonglen", "bhakti", "devotion", "compassion"],
  body: ["body", "breath", "kriya", "walking", "somatic", "pranayama"],
  awareness: ["witness", "awareness", "gazing", "meditation", "silence", "observation"],
};

export function getPracticesForDimension(
  dimension: string,
  manifests: SensorialManifest[],
): SensorialManifest[] {
  const keywords = DIMENSION_KEYWORDS[dimension];
  if (!keywords) return [];
  return manifests.filter((manifest) => {
    const searchable = `${manifest.key} ${manifest.title} ${manifest.practiceMatch}`.toLowerCase();
    return keywords.some((keyword) => searchable.includes(keyword));
  });
}
