type LoopLike = Record<string, any>;

function normalizeLoopId(loop: unknown): string | null {
  if (typeof loop === "string") return loop.trim() || null;
  if (!loop || typeof loop !== "object") return null;
  const raw = (loop as LoopLike).loop_id ?? (loop as LoopLike).loopId ?? (loop as LoopLike).id;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function readTopLoops(assessment: LoopLike | null | undefined): unknown[] {
  const conversation = assessment?.assessment_conversation ?? {};
  const elder = conversation?.elder_reading ?? conversation?.elderReading ?? {};
  const candidates = [
    elder?.topLoops,
    elder?.top_loops,
    elder?.loops,
    conversation?.topLoops,
    conversation?.top_loops,
    assessment?.topLoops,
    assessment?.top_loops,
  ];

  return candidates.find((value) => Array.isArray(value)) ?? [];
}

export function loopsFromOnboardingAssessment(assessment: LoopLike | null | undefined) {
  const topLoops = readTopLoops(assessment);
  const createdAt = assessment?.created_at ?? new Date().toISOString();
  const seen = new Set<string>();

  return topLoops.flatMap((loop, index) => {
    const loopId = normalizeLoopId(loop);
    if (!loopId || seen.has(loopId)) return [];
    seen.add(loopId);

    const meta = typeof loop === "object" && loop ? (loop as LoopLike) : {};
    return [{
      id: `onboarding-${loopId}`,
      loop_id: loopId,
      status: meta.status ?? "active",
      awareness_score: Number(meta.awareness_score ?? meta.awareness ?? 0.2),
      severity: meta.severity ?? (index === 0 ? "moderate" : "mild"),
      first_detected_at: meta.first_detected_at ?? createdAt,
      last_activated_at: meta.last_activated_at ?? createdAt,
      source: "onboarding",
      detection_reason: meta.reason ?? "Detected from your onboarding Elder Reading answers.",
    }];
  });
}

export function mergeOnboardingLoops(userLoops: LoopLike[] = [], assessment: LoopLike | null | undefined) {
  const existing = new Set(userLoops.map((loop) => loop.loop_id).filter(Boolean));
  const onboardingLoops = loopsFromOnboardingAssessment(assessment).filter((loop) => !existing.has(loop.loop_id));
  return [...userLoops, ...onboardingLoops];
}