import { useEffect, useRef, useState } from "react";
import flameVideo from "@/assets/hope-flame-void.mp4.asset.json";

/**
 * SECTION 1 — THE VOID (Hero)
 * Cinematic flame in absolute darkness. Ancient + Modern bridge.
 * Phases:
 *  0  black
 *  1  flame breathes in
 *  2  instrumentation rings + wordmark H O · P E
 *  3  tagline + live readout
 *  4  CTA + scroll hint
 */
export const HopeVoidSection = () => {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [tpm, setTpm] = useState(64);
  const [coherence, setCoherence] = useState(0.42);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => setPhase(3), 4200);
    const t4 = setTimeout(() => setPhase(4), 6200);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  // Live "instrumentation" — gentle drift to feel measured, not random
  useEffect(() => {
    if (phase < 3) return;
    const id = setInterval(() => {
      setTpm((v) => Math.max(38, Math.min(92, v + (Math.random() - 0.5) * 4)));
      setCoherence((v) => Math.max(0.18, Math.min(0.86, v + (Math.random() - 0.5) * 0.04)));
    }, 1400);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <section
      aria-label="The Void"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black"
    >
      {/* Cinematic flame video */}
      <video
        ref={videoRef}
        src={flameVideo.url}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2400ms] ease-out ${
          phase >= 1 ? "opacity-90" : "opacity-0"
        }`}
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.55)_65%,rgba(0,0,0,0.98)_100%)]"
      />

      {/* Instrumentation rings — orbital data, Patanjali meets Bloomberg */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[2200ms] ease-out ${
          phase >= 2 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="relative">
          <div
            className="absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[hsl(38_60%_60%/0.10)]"
            style={{ animation: "hopeSpin 90s linear infinite" }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[hsl(38_70%_65%/0.16)]"
            style={{ animation: "hopeSpin 60s linear infinite reverse" }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[40vmin] w-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[hsl(38_85%_70%/0.20)]"
            style={{ animation: "hopeSpin 38s linear infinite" }}
          />
          {/* tick marks */}
          <svg
            className="absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2"
            viewBox="0 0 200 200"
          >
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const r1 = 99;
              const r2 = i % 5 === 0 ? 95 : 97;
              const x1 = 100 + Math.cos(a) * r1;
              const y1 = 100 + Math.sin(a) * r1;
              const x2 = 100 + Math.cos(a) * r2;
              const y2 = 100 + Math.sin(a) * r2;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(38 70% 65%)"
                  strokeOpacity={i % 5 === 0 ? 0.35 : 0.14}
                  strokeWidth={0.3}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Top instrumentation strip — mono labels */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-24 mx-auto flex max-w-6xl items-center justify-between px-8 font-mono text-[10px] uppercase tracking-[0.32em] text-[hsl(38_45%_70%/0.55)] transition-opacity duration-[1800ms] md:top-28 md:text-[11px] ${
          phase >= 2 ? "opacity-100" : "opacity-0"
        }`}
      >
        <span>लोक · 01 — antaḥkaraṇa</span>
        <span className="hidden md:inline">samādhi pāda · sūtra 1.2</span>
        <span>v.12 · live</span>
      </div>

      {/* Bottom fade into next section */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-black/70 to-[#050402]"
      />

      {/* Foreground composition */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        {/* Eyebrow */}
        <div
          className={`mb-6 font-mono text-[10px] uppercase tracking-[0.45em] text-[hsl(38_55%_72%/0.85)] transition-all duration-[1600ms] md:mb-8 md:text-[11px] ${
            phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-3">
            <span className="h-px w-8 bg-[hsl(38_70%_65%/0.5)]" />
            The instrument for the inner world
            <span className="h-px w-8 bg-[hsl(38_70%_65%/0.5)]" />
          </span>
        </div>

        {/* Wordmark — H O · P E, monumental */}
        <h1
          className={`select-none font-serif text-[clamp(4.5rem,16vw,12rem)] font-extralight leading-[0.9] tracking-[0.04em] text-[hsl(38_88%_92%)] transition-all duration-[2400ms] ease-out ${
            phase >= 2 ? "translate-y-0 opacity-100 blur-0" : "translate-y-6 opacity-0 blur-md"
          }`}
          style={{
            textShadow:
              "0 0 80px hsl(38 90% 55% / 0.45), 0 0 160px hsl(20 95% 50% / 0.18)",
          }}
        >
          <span className="inline-block">H</span>
          <span className="inline-block px-[0.18em]">O</span>
          <span className="mx-[0.25em] inline-block translate-y-[-0.18em] text-[0.45em] font-light text-[hsl(38_70%_65%)] align-middle">
            ·
          </span>
          <span className="inline-block">P</span>
          <span className="inline-block px-[0.18em]">E</span>
        </h1>

        {/* Sublabel */}
        <p
          className={`mt-2 font-mono text-[11px] uppercase tracking-[0.5em] text-[hsl(38_45%_70%/0.85)] transition-all duration-[1800ms] md:mt-4 md:text-xs ${
            phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          a consciousness instrument
        </p>

        {/* Tagline */}
        <p
          className={`mx-auto mt-12 max-w-xl text-base font-light leading-relaxed text-[hsl(38_30%_78%)] transition-all duration-[2000ms] ease-out md:text-lg ${
            phase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="text-[hsl(38_55%_88%)]">Five thousand years of inner science.</span>
          <br className="hidden md:block" />
          Measured, in real time — for the first time.
        </p>

        {/* Live readout — instrumentation card */}
        <div
          className={`mt-10 flex items-center gap-6 rounded-full border border-[hsl(38_55%_55%/0.25)] bg-black/40 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[hsl(38_60%_82%)] backdrop-blur-md transition-all duration-[1800ms] md:gap-10 md:px-8 md:text-xs ${
            phase >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(140_70%_55%)]" />
            live
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[9px] tracking-[0.3em] text-[hsl(38_30%_60%)]">tpm</span>
            <span className="text-[hsl(38_85%_85%)]">{tpm.toFixed(0)}</span>
          </span>
          <span className="hidden h-6 w-px bg-[hsl(38_30%_50%/0.35)] md:block" />
          <span className="hidden flex-col items-start leading-tight md:flex">
            <span className="text-[9px] tracking-[0.3em] text-[hsl(38_30%_60%)]">coherence</span>
            <span className="text-[hsl(38_85%_85%)]">{(coherence * 100).toFixed(0)}%</span>
          </span>
          <span className="hidden h-6 w-px bg-[hsl(38_30%_50%/0.35)] md:block" />
          <span className="hidden flex-col items-start leading-tight md:flex">
            <span className="text-[9px] tracking-[0.3em] text-[hsl(38_30%_60%)]">band</span>
            <span className="text-[hsl(38_85%_85%)]">v3 · seeker</span>
          </span>
        </div>

        {/* CTAs */}
        <div
          className={`mt-12 flex flex-col items-center gap-4 transition-all duration-[2000ms] ease-out sm:flex-row sm:gap-6 ${
            phase >= 4 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <a
            href="#mirror"
            className="group inline-flex items-center gap-3 rounded-full border border-[hsl(38_85%_60%/0.55)] bg-[hsl(38_85%_55%/0.10)] px-9 py-4 text-[12px] uppercase tracking-[0.28em] text-[hsl(38_90%_90%)] backdrop-blur-sm transition-all duration-500 hover:border-[hsl(38_90%_75%)] hover:bg-[hsl(38_85%_55%/0.18)] hover:shadow-[0_0_80px_hsl(38_90%_55%/0.45)]"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(38_90%_75%)]" />
            Take the 60s mirror test
          </a>
          <a
            href="#offering"
            className="inline-flex items-center gap-2 px-2 py-2 text-[12px] uppercase tracking-[0.28em] text-[hsl(38_45%_75%)] transition-colors duration-300 hover:text-[hsl(38_85%_85%)]"
          >
            Or enter the temple →
          </a>
        </div>

        {/* Whisper line */}
        <p
          className={`mt-10 font-mono text-[10px] uppercase tracking-[0.4em] text-[hsl(38_30%_55%)] transition-opacity duration-[1500ms] ${
            phase >= 4 ? "opacity-90" : "opacity-0"
          }`}
        >
          one flame · carried forward
        </p>
      </div>

      {/* Scroll hint */}
      <div
        aria-hidden="true"
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${
          phase >= 4 ? "opacity-60" : "opacity-0"
        }`}
      >
        <div className="h-14 w-px animate-[hopeFall_2.6s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[hsl(38_85%_70%)] to-transparent" />
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes hopeSpin { to { transform: translate(-50%, -50%) rotate(360deg); } }
      `}</style>
    </section>
  );
};
