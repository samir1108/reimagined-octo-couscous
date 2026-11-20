import { useState } from "react";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { StepFrame } from "./StepFrame";
import { BodyMapWidget } from "../widgets";
import { Button } from "@/design-system";

export function BodyScanStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const config = (currentStep?.config ?? currentStep?.params ?? {}) as Record<string, unknown>;
  const [completedRegions, setCompletedRegions] = useState<string[]>([]);

  if (!currentStep) return null;
  const duration = (config.durationSeconds as number) ?? 120;
  const regions = (config.regions as string[]) ?? ["head", "neck", "shoulders", "chest", "abdomen", "lowerBack", "hips", "thighs", "knees", "calves", "feet"];

  return (
    <StepFrame
      kind="body_scan"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          onClick={() => goToNext({ completedRegions, durationSec: duration })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      }
    >
      <BodyMapWidget
        regions={regions}
        highlightedRegions={completedRegions}
        onSelectRegion={(r) => {
          if (!completedRegions.includes(r)) {
            setCompletedRegions((prev) => [...prev, r]);
          }
        }}
        showLabels={true}
        interactive={true}
      />
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {completedRegions.length} / {regions.length} regions visited
      </p>
    </StepFrame>
  );
}

export function BodyRegionFocusStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  const region = config.region ?? "chest";

  return (
    <StepFrame
      kind="body_region_focus"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          onClick={() => goToNext({ region, noticed: true })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      }
    >
      <BodyMapWidget
        regions={[region]}
        selectedRegion={region}
        showLabels={true}
        interactive={false}
      />
      {config.guidanceText && (
        <p className="mt-4 text-center text-sm text-muted-foreground">{config.guidanceText}</p>
      )}
    </StepFrame>
  );
}
