import { useState } from "react";
import { Sparkles } from "lucide-react";

const PROMPTS = [
  "What am I avoiding right now?",
  "What is asking to be seen?",
  "Where is my energy today?",
  "What would I do if I weren't afraid?",
  "What does my body need right now?",
];

export default function SelfInquiryCard() {
  const [i, setI] = useState(0);
  return (
    <div className="mt-4 rounded-2xl border border-border/30 bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Self Inquiry</p>
      <p className="text-sm italic mb-2">{PROMPTS[i]}</p>
      <button onClick={() => setI((i + 1) % PROMPTS.length)} className="text-xs text-primary">Next prompt</button>
    </div>
  );
}
