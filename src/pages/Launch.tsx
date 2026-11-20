import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import overtureAsset from "@/assets/films/overture.mp4.asset.json";
import mastersAsset from "@/assets/films/masters.mp4.asset.json";
import loopsAsset from "@/assets/films/loops.mp4.asset.json";
import p1 from "@/assets/founder/samir/portraits/samir-portrait-01.jpg.asset.json";
import p2 from "@/assets/founder/samir/portraits/samir-portrait-02.jpg.asset.json";
import p3 from "@/assets/founder/samir/portraits/samir-portrait-03.jpg.asset.json";
import p4 from "@/assets/founder/samir/portraits/samir-portrait-04.jpg.asset.json";
import p5 from "@/assets/founder/samir/portraits/samir-portrait-05.jpg.asset.json";
import { MASTER_IMAGES } from "@/assets/masters";

/**
 * /launch — the ConsciousOS product-launch page.
 * Apple/OpenAI-keynote pacing: cold open → founder → research → product →
 * philosophy → reveal. Scroll-driven, one story per viewport.
 */

const AMBER = "#e5b573";
const PARCHMENT = "#f4ead5";
const INK = "#0a0705";

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setShown(true),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function Chapter({
  eyebrow,
  children,
  bg = INK,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  bg?: string;
}) {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full flex items-center justify-center px-6 md:px-16 py-24 overflow-hidden"
      style={{ background: bg, color: PARCHMENT }}
    >
      <div
        className="max-w-6xl mx-auto w-full transition-all duration-[1400ms] ease-out"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(28px)",
        }}
      >
        {eyebrow && (
          <div
            className="text-[10px] md:text-xs tracking-[0.32em] uppercase mb-6 opacity-70"
            style={{ color: AMBER }}
          >
            {eyebrow}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export default function Launch() {
  return (
    <div style={{ background: INK, color: PARCHMENT }} className="antialiased">
      <Seo
        title="ConsciousOS — The Yogic Companion"
        description="Three years of research. Four yogic paths, thirteen masters, four hundred behavioral loops. Your AI-guided yogic companion for consciousness development."
        canonicalPath="/launch"
      />

      {/* 01 — COLD OPEN */}
      <Chapter>
        <div className="text-center">
          <p
            className="font-serif italic text-3xl md:text-5xl leading-snug max-w-3xl mx-auto"
            style={{ color: PARCHMENT }}
          >
            For three thousand years, one skill was passed down from
            master to student.
          </p>
          <p
            className="font-serif italic text-3xl md:text-5xl leading-snug max-w-3xl mx-auto mt-10 opacity-80"
          >
            Now it has been almost forgotten.
          </p>
          <p className="mt-16 text-xs tracking-[0.4em] uppercase opacity-50">
            Scroll
          </p>
        </div>
      </Chapter>

      {/* 02 — INTRODUCTION */}
      <Chapter eyebrow="Announcing">
        <h1
          className="font-serif text-6xl md:text-9xl leading-none tracking-tight"
          style={{ color: PARCHMENT }}
        >
          Conscious<span style={{ color: AMBER }}>OS</span>
        </h1>
        <p
          className="mt-8 text-lg md:text-2xl max-w-2xl opacity-80"
          style={{ fontFamily: "Georgia, serif" }}
        >
          The first operating system built for the inside of a human being.
        </p>
        <div className="mt-16 flex flex-wrap gap-x-10 gap-y-4 text-xs tracking-[0.28em] uppercase opacity-70">
          <span>3 LLMs + The Witness</span>
          <span>·</span>
          <span>4 Paths of Yoga</span>
          <span>·</span>
          <span>13 Masters</span>
          <span>·</span>
          <span>400 Loops</span>
          <span>·</span>
          <span>500-day journey</span>
        </div>
      </Chapter>

      {/* 03 — THE FOUNDER */}
      <Chapter bg="#0d0906">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <img
              src={p1.url}
               alt="Samir — founder of ConsciousOS"
              className="w-full h-full object-cover grayscale-[0.15]"
              style={{ filter: "contrast(1.05) brightness(0.9)" }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,7,5,0) 45%, rgba(10,7,5,0.85) 100%)",
              }}
            />
            <div className="absolute bottom-4 left-4 text-xs tracking-[0.3em] uppercase opacity-80">
              Samir · Founder
            </div>
          </div>
          <div>
            <div
              className="text-xs tracking-[0.32em] uppercase mb-6"
              style={{ color: AMBER }}
            >
              The Origin
            </div>
            <p className="font-serif text-3xl md:text-5xl leading-snug">
              One person. Three years. A thousand hours of sitting with a
              thousand people. Quietly.
            </p>
            <p className="mt-8 text-base md:text-lg opacity-75 max-w-lg leading-relaxed">
              No fundraise. No press. No product-hunt launch. Just a founder,
              a room, and the oldest question a human can ask —
              <span className="italic"> who is asking?</span>
            </p>
          </div>
        </div>
      </Chapter>

      {/* 04 — THE RESEARCH LAB */}
      <Chapter eyebrow="What we built" bg="#050403">
        <h2 className="font-serif text-4xl md:text-7xl leading-tight max-w-4xl">
          Built like a research lab. <br />
          <span style={{ color: AMBER }}>Not a wellness startup.</span>
        </h2>
        <p className="mt-8 max-w-2xl text-base md:text-lg opacity-70 leading-relaxed">
          Every layer of ConsciousOS is IP that has never existed in one
          system before. Three inner LLMs — Head, Heart, Gut — mapped to the
          three centers of intelligence the yogis mapped 3,000 years ago,
          with a fourth non-generative Witness arbitrating them. Four
          classical paths — Jnana, Bhakti, Karma, Raja — running as a live
          state machine. 400 behavioral loops, each with neuroscience
          grounding and lineage grounding, hand-curated over three years.
        </p>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="border rounded-sm p-6"
              style={{ borderColor: "rgba(229,181,115,0.2)" }}
            >
              <div
                className="text-[10px] tracking-[0.32em] uppercase mb-3"
                style={{ color: AMBER }}
              >
                {p.tag}
              </div>
              <div className="font-serif text-xl md:text-2xl mb-2">
                {p.title}
              </div>
              <p className="text-sm opacity-70 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Chapter>

      {/* 05 — MASTERS ROSTER */}
      <Chapter eyebrow="The lineage" bg="#0a0705">
        <h2 className="font-serif text-4xl md:text-6xl leading-tight max-w-4xl">
          Thirteen masters. One room. <br />
          <span style={{ color: AMBER }}>
            The system picks who speaks to you today.
          </span>
        </h2>
        <div className="mt-14 grid grid-cols-4 md:grid-cols-7 gap-3">
          {Object.entries(MASTER_IMAGES)
            .slice(0, 14)
            .map(([id, url]) => (
              <div
                key={id}
                className="aspect-square overflow-hidden rounded-full border"
                style={{ borderColor: "rgba(229,181,115,0.25)" }}
              >
                <img
                  src={url}
                  alt={id}
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.85) contrast(1.05)" }}
                />
              </div>
            ))}
        </div>
      </Chapter>

      {/* 06 — THE PRODUCT (video) */}
      <Chapter eyebrow="The product" bg="#000">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-4xl md:text-6xl leading-tight">
              A session that builds itself, in real time, for the human
              in front of it.
            </h2>
            <p className="mt-8 opacity-70 leading-relaxed max-w-lg">
              No static playlists. No fixed curriculum. The Composer Engine
              reads your state — breath, cadence, loop signature, spiral
              band — and assembles a ten-minute room made for today.
              Tomorrow's is different.
            </p>
          </div>
          <div className="aspect-video rounded-sm overflow-hidden border" style={{ borderColor: "rgba(229,181,115,0.2)" }}>
            <video
              src={overtureAsset.url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </div>
      </Chapter>

      {/* 07 — PHILOSOPHY (portrait 3) */}
      <Chapter bg="#0a0705">
        <div className="relative">
          <div
            className="absolute inset-0 -mx-6 md:-mx-16"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(10,7,5,0.7), rgba(10,7,5,0.85)), url(${p3.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(1px)",
              opacity: 0.6,
            }}
          />
          <div className="relative text-center py-24">
            <p className="font-serif italic text-3xl md:text-6xl leading-snug max-w-4xl mx-auto">
              This is not another meditation app.
            </p>
            <p
              className="font-serif italic text-3xl md:text-6xl leading-snug max-w-4xl mx-auto mt-8"
              style={{ color: AMBER }}
            >
              It is an A companion for becoming..
            </p>
          </div>
        </div>
      </Chapter>

      {/* 08 — SPLIT: The two more photos */}
      <Chapter eyebrow="Three years. In private." bg="#060403">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-[4/5] overflow-hidden rounded-sm">
            <img src={p4.url} alt="" className="w-full h-full object-cover" style={{ filter: "contrast(1.05)" }} />
          </div>
          <div className="aspect-[4/5] overflow-hidden rounded-sm">
            <img src={p5.url} alt="" className="w-full h-full object-cover" style={{ filter: "contrast(1.05)" }} />
          </div>
        </div>
        <p className="mt-12 font-serif text-2xl md:text-4xl max-w-3xl leading-snug">
          Every metric in ConsciousOS is inverted from a normal app.
          Time-in-app trending down? Good. Sessions per week down? Good.
          The success signal is the day you no longer need it.
        </p>
      </Chapter>

      {/* 09 — REVEAL */}
      <Chapter bg={INK}>
        <div className="text-center">
          <div
            className="text-xs tracking-[0.4em] uppercase mb-10"
            style={{ color: AMBER }}
          >
            Available now
          </div>
          <h2 className="font-serif text-6xl md:text-9xl tracking-tight">
            ConsciousOS
          </h2>
          <p className="mt-6 opacity-70 max-w-xl mx-auto text-base md:text-lg">
            Free to begin. No account needed to look inside.
          </p>
          <div className="mt-14 flex flex-wrap gap-4 justify-center">
            <Link
              to="/app"
              className="px-8 py-4 text-sm tracking-[0.28em] uppercase rounded-sm transition-all"
              style={{ background: AMBER, color: INK }}
            >
              Begin
            </Link>
            <Link
              to="/experience"
              className="px-8 py-4 text-sm tracking-[0.28em] uppercase rounded-sm border transition-all hover:bg-white/5"
              style={{ borderColor: "rgba(229,181,115,0.4)", color: PARCHMENT }}
            >
              See the whole depth
            </Link>
          </div>
          <p className="mt-24 text-xs tracking-[0.32em] uppercase opacity-40">
            Built by Samir · From India · With no permission
          </p>
        </div>
      </Chapter>
    </div>
  );
}

const PILLARS = [
  {
    tag: "The Orchestration Layer",
    title: "The Composer Engine",
    body: "Multi-engine runtime that composes your session in real time from live signals. No static playlists, no fixed curriculum.",
  },
  {
    tag: "The Intelligence Layer",
    title: "3 LLMs + The Witness",
    body: "Head, Heart, and Gut LLMs run in parallel — mirroring the three centers of intelligence yogis mapped 3,000 years ago. A fourth non-generative Witness arbitrates.",
  },
  {
    tag: "The Path Layer",
    title: "Jnana · Bhakti · Karma · Raja",
    body: "All four classical paths of yoga running as a live state machine. Every practice you touch is tagged, ladder-ed, and mapped back to lineage.",
  },
  {
    tag: "The Memory Layer",
    title: "The 400-Loop Library",
    body: "Hand-curated behavioral loops with neuroscience grounding and ancient-text grounding. The moat that took three years and cannot be cloned in a weekend.",
  },
  {
    tag: "The Sensory Layer",
    title: "Cinematic Practice Rooms",
    body: "Breath, gaze, and heart coherence. Faculty covers, ambient backdrops, haptic + audio + voice design. Practice becomes felt experience.",
  },
  {
    tag: "The Longitudinal Layer",
    title: "Memory Vault",
    body: "Tracks maturity across the 11-band spiral. The only software product whose success metric is its own irrelevance.",
  },
];