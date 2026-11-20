import { describe, it, expect } from "vitest";
import { resolveStepWidget } from "@/lib/session-shell/stepWidgets";
import { getStepWidget, STEP_WIDGETS } from "@/lib/session-shell/widgets/catalog";
import type { SessionStep, StepKind } from "@/lib/session-shell/types";

function step(partial: Partial<SessionStep> & { kind: StepKind }): SessionStep {
  return {
    title: "Test step",
    est_minutes: 3,
    ...partial,
  };
}

describe("resolveStepWidget", () => {
  it("honours an explicit widgetId", () => {
    const resolved = resolveStepWidget(
      step({ kind: "practice", params: { widgetId: "yoga_nidra", durationSeconds: 600 } }),
    );
    expect(resolved?.definition.id).toBe("yoga_nidra");
    expect(resolved?.source).toBe("explicit");
    expect(resolved?.overrides.durationSeconds).toBe(600);
  });

  it("falls back to the kind default when widgetId is unknown", () => {
    const resolved = resolveStepWidget(
      step({ kind: "gratitude", params: { widgetId: "not_a_widget" } }),
    );
    expect(resolved?.definition.id).toBe("gratitude_three");
    expect(resolved?.source).toBe("kind");
  });

  it("resolves practice steps by family", () => {
    expect(resolveStepWidget(step({ kind: "practice", params: { family: "bhakti" } }))?.definition.id).toBe("japa_108");
    expect(resolveStepWidget(step({ kind: "practice", params: { family: "tantra" } }))?.definition.id).toBe("chakra_scan");
  });

  it("leaves bespoke kinds to the guide widgets", () => {
    for (const kind of ["journal", "breathwork", "witness", "micro-act", "reflection", "wisdom-read", "guide-chat"] as StepKind[]) {
      expect(resolveStepWidget(step({ kind }))).toBeNull();
    }
  });

  it("carries step params into the widget config", () => {
    const resolved = resolveStepWidget(
      step({
        kind: "free_write",
        script: ["Say it plainly."],
        params: { durationSeconds: 240, prompts: ["What I cannot say out loud"], minChars: 40 },
      }),
    );
    expect(resolved?.definition.id).toBe("free_page");
    expect(resolved?.overrides.durationSeconds).toBe(240);
    expect(resolved?.overrides.prompts).toEqual(["What I cannot say out loud"]);
    expect(resolved?.overrides.minChars).toBe(40);
  });

  it("maps every wired kind to a widget that exists in the catalog", () => {
    const kinds: StepKind[] = [
      "silent_sit", "body_scan", "gratitude", "loving_kindness", "forgiveness",
      "movement", "walking", "yoga_asana", "stretching", "tai_chi", "balance",
      "sound_bath", "mantra", "affirmation", "visualization", "scripture",
      "contemplation", "noticing", "free_write", "plan",
    ];
    for (const kind of kinds) {
      const resolved = resolveStepWidget(step({ kind }));
      expect(resolved, kind).not.toBeNull();
      expect(getStepWidget(resolved!.definition.id), kind).toBeDefined();
    }
  });

  it("keeps widget ids unique", () => {
    const ids = STEP_WIDGETS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
