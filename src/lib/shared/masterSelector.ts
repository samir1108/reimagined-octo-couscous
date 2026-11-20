// ============================================================
// CLIENT-SIDE MASTER SELECTOR — Mirrors server unified selector
// ============================================================
// Re-exports types and logic for client use
// The canonical implementation lives in supabase/functions/_shared/masterSelector.ts

export type {
  MasterSelectorContext,
  MasterSelection,
} from '../../../supabase/functions/_shared/masterSelector';

// Re-export the main function (client can't import directly from supabase/functions)
// So we provide a compatible interface here
export interface MasterChoiceContext {
  mode?: string;
  dimension?: string;
  sessionType?: "morning" | "evening" | "night";
  journeyDay?: number;
  bandLevel?: number;
}

export interface MasterChoice {
  id: string;
  name: string;
  tradition?: string;
  keyTeaching?: string;
  quote?: string;
  reason: string;
}

// Client-side simplified version for backward compatibility
export function selectMasterForSession(ctx: MasterChoiceContext): MasterChoice {
  const mode = ctx.mode || "open";
  const dim = (ctx.dimension || "").toLowerCase();
  const day = ctx.journeyDay ?? 1;

  const MASTERS: Record<string, Omit<MasterChoice, "reason">> = {
    krishna: { id: "krishna", name: "Krishna", tradition: "Bhagavad Gita", keyTeaching: "Action without attachment — do your duty, release the fruit.", quote: "You have a right to perform your prescribed duty, but never to its fruits." },
    buddha: { id: "buddha", name: "Buddha", tradition: "Theravada / Mindfulness", keyTeaching: "Notice clearly. Suffering ends where clinging ends.", quote: "All that we are is the result of what we have thought." },
    ramana: { id: "ramana", name: "Ramana Maharshi", tradition: "Advaita Vedanta", keyTeaching: "Self-inquiry: 'Who am I?' is the only real question.", quote: "Your own Self-Realization is the greatest service you can render the world." },
    patanjali: { id: "patanjali", name: "Patanjali", tradition: "Yoga Sutras", keyTeaching: "Yoga is the stilling of the fluctuations of the mind.", quote: "Yogaś-citta-vṛtti-nirodhaḥ." },
    rumi: { id: "rumi", name: "Rumi", tradition: "Sufi", keyTeaching: "The wound is the place where the Light enters you.", quote: "What you seek is seeking you." },
    lao_tzu: { id: "lao_tzu", name: "Lao Tzu", tradition: "Tao Te Ching", keyTeaching: "Wu wei — effortless action, flow with the Tao.", quote: "Nature does not hurry, yet everything is accomplished." },
    shiva: { id: "shiva", name: "Adiyogi Shiva", tradition: "Source of Yoga", keyTeaching: "Awareness is the first and final teaching.", quote: "The greatest gift you can give yourself is a few moments of silence." },
  };

  // Mode-driven
  if (mode === "self_inquiry" || mode === "consciousness_checkin") return { ...MASTERS.ramana, reason: "Self-inquiry is Ramana's heart-domain." };
  if (mode === "shadow_work" || mode === "anger" || mode === "inner_child") return { ...MASTERS.rumi, reason: "Rumi meets the wound with love, not bypass." };
  if (mode === "breathwork" || mode === "somatic" || mode === "death_meditation") return { ...MASTERS.shiva, reason: "Shiva is the source of breath and dissolution." };
  if (mode === "decision" || mode === "task_giver" || mode === "philosophy") return { ...MASTERS.krishna, reason: "Krishna teaches right action under pressure." };
  if (mode === "pattern_finder" || mode === "loop_explorer" || mode === "dream_analysis") return { ...MASTERS.buddha, reason: "Buddha sees clearly into the chains of mind." };
  if (mode === "creative" || mode === "manifestation") return { ...MASTERS.lao_tzu, reason: "Lao Tzu trusts the unforced flow." };
  if (mode === "evening_reflection" || mode === "evening_intention" || ctx.sessionType === "evening" || ctx.sessionType === "night") return { ...MASTERS.lao_tzu, reason: "Evening softness — Tao energy." };

  // Dimension-driven
  if (dim.includes("mind")) return { ...MASTERS.buddha, reason: "Mind dimension → Buddha's clarity." };
  if (dim.includes("heart") || dim.includes("emotion")) return { ...MASTERS.rumi, reason: "Heart dimension → Rumi's love." };
  if (dim.includes("body") || dim.includes("energy")) return { ...MASTERS.shiva, reason: "Body/energy → Shiva's yoga." };
  if (dim.includes("spirit") || dim.includes("self")) return { ...MASTERS.ramana, reason: "Spirit/Self → Ramana." };
  if (dim.includes("action") || dim.includes("purpose")) return { ...MASTERS.krishna, reason: "Action → Krishna." };

  // Foundation arc
  if (day <= 7) return { ...MASTERS.patanjali, reason: "Foundation week — Patanjali's framework." };
  if (day <= 21) return { ...MASTERS.buddha, reason: "Building awareness — Buddha." };
  if (day <= 45) return { ...MASTERS.krishna, reason: "Practice in life — Krishna." };
  if (day <= 60) return { ...MASTERS.ramana, reason: "Deepening into Self — Ramana." };

  return { ...MASTERS.shiva, reason: "Adiyogi presence — the default master." };
}