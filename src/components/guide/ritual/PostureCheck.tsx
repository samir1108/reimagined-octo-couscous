import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Props {
  onReady: () => void;
}

const ITEMS = [
  { id: "spine", label: "Spine straight" },
  { id: "phone", label: "Phone silent" },
  { id: "eyes", label: "Eyes soft" },
];

/** 3-tap check before any seated practice begins. */
export default function PostureCheck({ onReady }: Props) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const allDone = ITEMS.every((i) => done[i.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-[85%] rounded-2xl bg-card/40 border border-border/50 px-4 py-4"
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-3">
        Ready the body
      </p>
      <div className="space-y-2 mb-3">
        {ITEMS.map((item) => {
          const isOn = !!done[item.id];
          return (
            <button
              key={item.id}
              onClick={() => setDone((d) => ({ ...d, [item.id]: !d[item.id] }))}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition ${
                isOn
                  ? "bg-primary/15 border-primary/50 text-foreground"
                  : "bg-card/30 border-border/40 text-foreground/75 hover:border-primary/30"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                  isOn ? "bg-primary border-primary" : "border-border/60"
                }`}
              >
                {isOn && <Check className="w-3 h-3 text-primary-foreground" />}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={onReady}
        disabled={!allDone}
        className="w-full rounded-full px-4 py-2.5 text-sm font-display bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        I'm ready
      </button>
    </motion.div>
  );
}
