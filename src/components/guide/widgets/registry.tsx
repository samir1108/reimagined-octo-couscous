import type { ComponentType } from "react";
import type { WidgetKind, WidgetProps, WidgetSpec } from "./types";
import { WitnessTimerWidget } from "./WitnessTimerWidget";
import { BreathOrbWidget } from "./BreathOrbWidget";
import { SelfInquiryWidget } from "./SelfInquiryWidget";
import { JournalWidget } from "./JournalWidget";
import { MicroActWidget } from "./MicroActWidget";
import { ReflectionCardWidget } from "./ReflectionCardWidget";
import { ReadingWidget } from "./ReadingWidget";

// One source of truth — to add a new inline practice, drop a file
// and register it here. Guide's system prompt also enumerates these kinds.
export const WIDGET_REGISTRY: Record<WidgetKind, ComponentType<WidgetProps<any>>> = {
  witness_timer: WitnessTimerWidget,
  breath_orb: BreathOrbWidget,
  self_inquiry: SelfInquiryWidget,
  journal: JournalWidget,
  micro_act: MicroActWidget,
  reflection_card: ReflectionCardWidget,
  reading: ReadingWidget,
};

export function renderWidget(spec: WidgetSpec, props: Omit<WidgetProps, "spec">) {
  const Component = WIDGET_REGISTRY[spec.kind];
  if (!Component) return null;
  return <Component spec={spec as any} {...props} />;
}
