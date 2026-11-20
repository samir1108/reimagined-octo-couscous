/**
 * SuitabilitySheet — the same four questions, asked before a sitting starts.
 * No answers means no deep practice: the default is "clear" only for a few
 * seconds, until the user either answers or skips with defaults.
 */

import type { SuitabilityInput } from "@/lib/prescription";
import { decideSuitability } from "@/lib/prescription";
import SuitabilityCard from "./SuitabilityCard";

interface SuitabilitySheetProps {
  open: boolean;
  value: SuitabilityInput;
  onChange: (value: SuitabilityInput) => void;
  onContinue: () => void;
  onClose: () => void;
}

export default function SuitabilitySheet({
  open,
  value,
  onChange,
  onContinue,
  onClose,
}: SuitabilitySheetProps) {
  if (!open) return null;
  const decision = decideSuitability(value);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-background p-4 shadow-xl">
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Before you sit
          </p>
          <h2 className="mt-1 text-lg font-medium">30 seconds of honesty</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sleep, pain, and panic change what is safe today. Rest is practice too.
          </p>
        </div>

        <SuitabilityCard value={value} decision={decision} onChange={onChange} defaultOpen />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/50 px-4 py-2 text-sm"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
