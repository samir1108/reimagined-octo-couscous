/**
 * SignGuide — the kundalini sign library, with a check-in that answers safely.
 * ──────────────────────────────────────────────────────────────────────────
 * Two jobs:
 *   1. Teach the signs — every entry names the tradition's word, the body
 *      center, and the grounding protocol.
 *   2. Answer "what was that?" — a person describes a sensation and gets the
 *      named sign plus its protocol. The stop-and-support tier is loud on
 *      purpose: if the graph thinks this is beyond practice, it says so first.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { KUNDALINI_SIGNS, SAFETY_TIER_LABEL } from "@/data/kundaliniSigns";
import { matchSign } from "@/lib/graph/signMatcher";

const SAFETY_STYLES: Record<string, string> = {
  normal: "border-foreground/20 bg-foreground/5 text-foreground/80",
  "check-in": "border-amber-500/40 bg-amber-500/10 text-amber-200",
  "stop-and-support": "border-destructive/50 bg-destructive/10 text-destructive",
};

export default function SignGuide() {
  const [report, setReport] = useState("");
  const matches = useMemo(() => matchSign(report), [report]);

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-border/40 bg-foreground/[0.02] p-6 md:p-8">
        <h3 className="font-display text-2xl mb-2">"What was that?"</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-2xl leading-relaxed">
          Describe a sensation from practice, in your own words. The graph answers with the tradition's name for it,
          the grounding protocol, and how to be with it. No account, no storage — this runs entirely on your device.
        </p>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="e.g. I felt heat rising up my spine and my body started shaking on its own"
          rows={3}
          className="w-full rounded-2xl border border-border/50 bg-background/60 px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none resize-none"
        />

        {report.trim().length > 0 && matches.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            The graph does not recognise this as a known sign. That is an honest "unknown", not a dismissal.
            If the sensation is uncomfortable or persistent, ground with it — slow breathing, feet on the floor,
            name five things you can see — and treat it as new information about your practice.
          </p>
        )}

        {matches.map(({ sign, confidence, matchedTerms }) => (
          <motion.div
            key={sign.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`mt-4 rounded-2xl border px-5 py-4 ${
              sign.safety === "stop-and-support"
                ? "border-destructive/50 bg-destructive/10"
                : sign.safety === "check-in"
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-border/40 bg-background/40"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="font-display text-lg">{sign.label}</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] ${SAFETY_STYLES[sign.safety]}`}>
                {SAFETY_TIER_LABEL[sign.safety]}
              </span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed mb-3">{sign.description}</p>
            <div className="rounded-xl border border-border/30 bg-background/50 px-4 py-3 mb-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/45 mb-1">Grounding protocol</p>
              <p className="text-sm text-foreground/90 leading-relaxed">{sign.grounding}</p>
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              matched: {matchedTerms.slice(0, 4).join(", ")} · confidence {(confidence * 100).toFixed(0)}%
              {sign.safety === "stop-and-support" && " — escalated to support guidance, not practice advice"}
            </p>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="font-display text-2xl mb-1">The sign library</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-2xl leading-snug">
          Every sign the tradition names, with the neuroscience overlap noted. Signs are not goals — the corpus is
          explicit that kundalini rises through purification, not force.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {KUNDALINI_SIGNS.map((sign) => (
            <details key={sign.id} className="rounded-2xl border border-border/40 bg-foreground/[0.02] px-5 py-4">
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
                <span className="font-display text-base">{sign.label}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] ${SAFETY_STYLES[sign.safety]}`}>
                  {SAFETY_TIER_LABEL[sign.safety]}
                </span>
              </summary>
              <p className="text-sm text-foreground/80 leading-snug mt-3">{sign.description}</p>
              <p className="text-sm text-foreground/70 leading-snug mt-2"><span className="text-foreground/40">Tradition: </span>{sign.tradition}</p>
              <p className="text-sm text-foreground/85 leading-snug mt-2"><span className="text-foreground/40">Grounding: </span>{sign.grounding}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-2 italic">Source: {sign.source}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
