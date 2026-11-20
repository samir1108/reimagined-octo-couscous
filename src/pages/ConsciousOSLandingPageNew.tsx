"use client";

import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardContent, Text, Badge, Progress, CircularProgress } from "@/components/design-system";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const PricingSection = lazy(() => import("@/components/landing/PricingSection"));
const JoinSection = lazy(() => import("@/components/landing/JoinSection"));
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));
const LandingNavbar = lazy(() => import("@/components/landing/LandingNavbar"));
import Seo from "@/components/seo/Seo";

const HowItWorksSection = () => (
  <section className="py-20 md:py-28" aria-labelledby="how-it-works">
    <div className="container-ultra-narrow mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <Badge variant="gold" size="md" className="mb-4">How it works</Badge>
        <Text variant="display-sm" color="primary" weight="medium" className="mb-6">
          Three steps from opening the app to your first session
        </Text>
        <Text variant="body-lg" color="secondary">
          Nothing to set up, nothing to get right. Just arrive as you are.
        </Text>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            number: "01",
            title: "Answer six light questions",
            description: "Pick what feels true today. A notification pops mid-conversation, ten minutes alone with no phone: how is it? No wrong answers, and nothing is graded.",
            icon: "HelpCircle",
          },
          {
            number: "02",
            title: "Get a first photograph, not a verdict",
            description: "You see a starting band, your dominant centre and the loops most active right now. It will shift as you practise, and that is the point.",
            icon: "Camera",
          },
          {
            number: "03",
            title: "Hold the orb each day",
            description: "A session is composed for you from your state, your energy and the time of day. Cross a step when you are ready, or say not now.",
            icon: "Circle",
          },
        ].map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card variant="featured" hover padding="lg" className="h-full">
              <CardContent className="flex flex-col h-full space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-400 font-display text-xl">
                    {step.number}
                  </div>
                  <Text variant="h3" color="primary">{step.title}</Text>
                </div>
                <Text variant="body" color="secondary" className="flex-1">{step.description}</Text>
              </CardContent>
            </Card>
          </motion.div>
        ))}

      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mt-12"
      >
        <Button variant="primary" size="lg" className="w-full md:w-auto">
          Begin with six questions
        </Button>
        <Text variant="micro" color="muted" className="mt-4 block">No wrong answers. Skip anything.</Text>
      </motion.div>
    </div>
  </section>
);

const ForWhomSection = () => (
  <section className="py-20 md:py-28 bg-gradient-midday/50" aria-labelledby="for-whom">
    <div className="container-ultra-narrow mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <Badge variant="gold" size="md" className="mb-4">Who it's for</Badge>
        <Text variant="display-sm" color="primary" weight="medium" className="mb-6">
          The people who carry other people, and rarely get a teacher of their own
        </Text>
        <Text variant="body-lg" color="secondary">
          The app's library already has a program set for each.
        </Text>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: "Target",
            label: "Founders & Entrepreneurs",
            description: "The loneliness of the top seat. Every decision lands on you.",
            solution: "Names the control and worth loops running your day, and gives you a short reset between decisions.",
            patterns: ["Control", "Worth & validation", "Recovery debt"],
            mode: "focus",
          },
          {
            icon: "Users",
            label: "Corporate & Leadership",
            description: "For people who have to stay calm when their team is not.",
            solution: "Spots tone and load patterns early, and coaches you before a hard week turns into a hard quarter.",
            patterns: ["Validation-seeking", "Performative busyness", "Meeting overload"],
            mode: "observation",
          },
          {
            icon: "HeartPulse",
            label: "Doctors & Healthcare",
            description: "Compassion without collapse. You care for others all day.",
            solution: "Short, shift-friendly practices, and a night sanctuary that helps you actually switch off.",
            patterns: ["Recovery debt", "Over-giving", "Compassion fatigue"],
            mode: "healing",
          },
          {
            icon: "Shield",
            label: "Government & Uniformed",
            description: "Calm under pressure is expected. Recovery rarely is.",
            solution: "Breath and attention practices for high-stakes moments, and private, consent-based support.",
            patterns: ["Hypervigilance", "Recovery debt", "Calm under command"],
            mode: "meditation",
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card variant="mode" mode={item.mode as any} hover padding="lg" className="h-full">
              <CardContent className="flex flex-col h-full space-y-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--mode-core)] to-[var(--mode-glow)] flex items-center justify-center" style={{ background: `linear-gradient(135deg, var(--mode-${item.mode}-core), var(--mode-${item.mode}-glow))` }}>
                  <span className="text-2xl">{["🎯", "👥", "💚", "🛡"][index]}</span>
                </div>
                <div className="space-y-3">
                  <Badge variant="mode" mode={item.mode as any} dot size="sm">{item.label}</Badge>
                  <Text variant="h4" color="primary">{item.description}</Text>
                  <Text variant="body" color="secondary">{item.solution}</Text>
                  <div className="flex flex-wrap gap-2">
                    {item.patterns.map((p) => (
                      <Badge key={p} variant="outline" size="xs">{p}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const SpiralJourneySection = () => (
  <section className="py-20 md:py-28" aria-labelledby="spiral-journey">
    <div className="container-ultra-narrow mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <Badge variant="gold" size="md" className="mb-4">The Spiral Path</Badge>
        <Text variant="display-sm" color="primary" weight="medium" className="mb-6">
          A companion that meets you wherever you are
        </Text>
        <Text variant="body-lg" color="secondary">
          You do not climb a ladder here. You walk a spiral, passing familiar ground with more depth each time.
        </Text>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative aspect-square max-w-lg mx-auto">
            <svg viewBox="0 0 400 400" className="w-full h-full" aria-label="Spiral path with six milestones">
              <defs>
                <radialGradient id="spiralGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#9b8cff" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="200" cy="200" r="180" fill="url(#spiralGrad)" />
              <path
                d="M200,200 C200,200 250,150 300,180 C350,210 320,280 280,320 C240,360 180,340 150,290 C120,240 150,180 180,160 C210,140 250,140 280,170 C310,200 300,250 260,280 C220,310 180,300 160,260"
                fill="none"
                stroke="rgba(217,168,74,0.2)"
                strokeWidth="1.5"
              />
              <path
                d="M200,200 C200,200 250,150 300,180 C350,210 320,280 280,320 C240,360 180,340 150,290 C120,240 150,180 180,160 C210,140 250,140 280,170 C310,200 300,250 260,280 C220,310 180,300 160,260"
                fill="none"
                stroke="#d9a84a"
                strokeWidth="2.5"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                style={{ animation: "draw 3s ease forwards" }}
              />
              {[
                { x: 200, y: 200, label: "Day 1", desc: "Meeting yourself where you are" },
                { x: 260, y: 170, label: "Day 30", desc: "Calibration ends" },
                { x: 300, y: 200, label: "Foundation", desc: "First patterns emerge" },
                { x: 280, y: 280, label: "Four Paths", desc: "In balance" },
                { x: 160, y: 260, label: "Return", desc: "Deeper each time" },
                { x: 150, y: 180, label: "Teacher Within", desc: "App speaks less" },
              ].map((point, i) => (
                <g key={i} className="milestone">
                  <circle cx={point.x} cy={point.y} r="14" fill="#0a0a0a" stroke="#d9a84a" strokeWidth="2" />
                  <text x={point.x} y={point.y + 4} textAnchor="middle" fontSize="10" fill="#efe7d6" fontFamily="Fraunces, Georgia, serif" fontWeight="600">{i + 1}</text>
                </g>
              ))}
              <circle r="6" fill="#efe7d6">
                <animateMotion dur="14s" repeatCount="indefinite" path="M200,200 C200,200 250,150 300,180 C350,210 320,280 280,320 C240,360 180,340 150,290 C120,240 150,180 180,160 C210,140 250,140 280,170 C310,200 300,250 260,280 C220,310 180,300 160,260" />
              </circle>
              <text x="200" y="206" textAnchor="middle" fontSize="10" fill="#8d8576">you</text>
              <style>{`
                @keyframes draw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
              `}</style>
            </svg>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="space-y-6">
            {[
              "Day 1: Meeting yourself where you are — No test to pass. We start from your own words and experience, not from zero.",
              "Day 30: Calibration ends — For the first 30 days nothing is scored above Band 1, so no one is judged early.",
              "Foundation: The first patterns — Observation and breath come first. Advanced practices wait until the base is steady.",
              "The four paths, in balance — Inquiry, devotion, action and meditation are weighted and cross-pollinated.",
              "Return, deeper — A spiral revisits the same place with more depth. A setback is never a failure.",
              "The teacher within — Over the years the app speaks less. At the far end, the teacher within is enough.",
            ].map((milestone, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-void-100/50 border border-gold-500/10 hover:border-gold-400/30 transition-all">
                <div className="w-10 h-10 rounded-full border border-gold-400/30 flex items-center justify-center text-gold-400 font-display font-medium flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <Text variant="h4" color="primary" className="mb-1">{milestone.split("—")[0]}</Text>
                  <Text variant="body" color="secondary">{milestone.split("—")[1]?.trim()}</Text>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { title: "Starts anywhere", desc: "Your starting level is read from your own words and experience. Not everyone begins at zero.", icon: "Zap" },
          { title: "Presence that fades", desc: "High support in the early bands, minimal in the later ones. The app is built to be needed less.", icon: "Sun" },
          { title: "Returns without guilt", desc: "Come back after a gap and you get a gentle warm-up, not a catch-up. Earlier progress still counts.", icon: "RotateCcw" },
          { title: "Rotates its voice", desc: "A new guide about every three weeks, and a specialist who steps in for a week when a strong pattern appears.", icon: "Users" },
        ].map((item, i) => (
          <Card key={item.title} variant="default" hover padding="lg" className="text-center">
            <CardContent className="space-y-3">
              <div className="w-14 h-14 rounded-full bg-gold-500/15 flex items-center justify-center mx-auto text-gold-400">
                <span className="text-2xl">{["⚡", "☀️", "🔄", "👥"][i]}</span>
              </div>
              <Text variant="h4" color="primary">{item.title}</Text>
              <Text variant="body" color="secondary">{item.desc}</Text>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  </section>
);

const TrustSection = () => (
  <section className="py-20 md:py-28 bg-gradient-evening/50" aria-labelledby="trust">
    <div className="container-ultra-narrow mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <Badge variant="gold" size="md" className="mb-4">Safety & Research</Badge>
        <Text variant="display-sm" color="primary" weight="medium" className="mb-6">
          Built like a research lab. Designed for trust.
        </Text>
        <Text variant="body-lg" color="secondary">
          ConsciousOS is a practice companion, not medical or mental-health treatment, and it does not replace professional care.
        </Text>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Privacy First",
            desc: "Your data never leaves your device without explicit consent. No tracking, no ads, no data selling.",
            icon: "Lock",
            mode: "observation",
          },
          {
            title: "Clinical Rigour",
            desc: "Built on 600+ validated loops, 11 bands, 33 stages, and four classical yoga paths — not generic wellness content.",
            icon: "BookOpen",
            mode: "inquiry",
          },
          {
            title: "Consent-Based",
            desc: "Every insight, every nudge, every session requires your active choice. The app proposes, you decide.",
            icon: "Shield",
            mode: "healing",
          },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card variant="mode" mode={item.mode as any} hover padding="lg" className="h-full text-center">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--mode-core)] to-[var(--mode-glow)] flex items-center justify-center mx-auto">
                  <span className="text-3xl">{["🔒", "📚", "✋"][index]}</span>
                </div>
                <Text variant="h3" color="primary">{item.title}</Text>
                <Text variant="body" color="secondary">{item.desc}</Text>
                <Badge variant="mode" mode={item.mode as any} dot>{item.mode}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTASection = () => (
  <section className="py-20 md:py-28 bg-gradient-night/50" aria-labelledby="final-cta">
    <div className="container mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto"
      >
        <Text variant="display-sm" color="primary" weight="medium" className="mb-6">
          Ready to meet yourself?
        </Text>
        <Text variant="body-lg" color="secondary" className="mb-8">
          No credit card. No commitment. Just six questions and your first session.
        </Text>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="xl" className="w-full sm:w-auto">
            Go to App (Beta)
          </Button>
          <Button variant="glass" size="xl" className="w-full sm:w-auto">
            See How It Works
          </Button>
        </div>
        <Text variant="micro" color="muted" className="mt-6">
          ConsciousOS is a practice companion, not medical or mental-health treatment.
        </Text>
      </motion.div>
    </div>
  </section>
);

export default function ConsciousOSLandingPageNew() {
  useForceDarkMode();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-morning noise-texture">
      <Seo
        title="ConsciousOS Beta — A companion for becoming"
        description="ConsciousOS Beta — an AI companion for consciousness. Enter the app, observe, understand, and transform with 11 bands, 600+ loops, 89 masters, and four paths of yoga."
        canonicalPath="/"
        keywords="consciousness beta, meditation, AI guide, journaling, self-awareness, yoga, inner work, mental loops, spiritual practice"
      />
      <LandingNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative z-10 text-center max-w-4xl px-6 pt-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-8"
            >
              <Badge variant="gold" size="md" className="mb-6">
                Beta  ·  AI-guided  ·  Built on the four paths of yoga
              </Badge>
              <Text variant="display" gold weight="bold" className="mb-6 leading-[0.95]">
                A teacher for the inner life, <br /><span className="text-gold-300">in your pocket.</span>
              </Text>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-10"
            >
              ConsciousOS is a daily companion that meets you where you are, learns what actually moves you, and is built so that one day you need it less.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Button variant="primary" size="xl" className="w-full sm:w-auto">
                Go to App (Beta)
              </Button>
              <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                See how it works
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-text-muted"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <Text variant="body" color="primary" weight="medium">600+ mental loops</Text>
              </div>
              <span className="w-px h-6 bg-gold-500/20" />
              <div className="flex items-center gap-2">
                <Text variant="body" color="primary" weight="medium">89 guides & masters</Text>
              </div>
              <span className="w-px h-6 bg-gold-500/20" />
              <div className="flex items-center gap-2">
                <Text variant="body" color="primary" weight="medium">11 bands, 33 stages</Text>
              </div>
              <span className="w-px h-6 bg-gold-500/20" />
              <div className="flex items-center gap-2">
                <Text variant="body" color="primary" weight="medium">4 daily gates</Text>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Sections */}
        <HowItWorksSection />
        <ForWhomSection />
        <SpiralJourneySection />
        <TrustSection />
        
        {/* Screenshots/App Walkthrough */}
        <section className="py-20 md:py-28" aria-labelledby="app-walkthrough">
          <div className="container-ultra-narrow mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <Badge variant="gold" size="md" className="mb-4">Inside the App</Badge>
              <Text variant="display-sm" color="primary" weight="medium" className="mb-6">
                See how ConsciousOS meets you, from first question to daily practice
              </Text>
              <Text variant="body-lg" color="secondary">
                A walk through the app: how it reads where you are, what it asks of you each day, and how it shows you what is changing.
              </Text>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-4">
                {[
                  { name: "Begin", desc: "Six light questions and a first reading of where you stand." },
                  { name: "Today", desc: "A daily mission, a clear direction, and a quiet orb that opens your session." },
                  { name: "Practice", desc: "Short guided sessions chosen for your theme and your recent days." },
                  { name: "Guide & Journal", desc: "Ask anything, or write freely and let patterns surface." },
                  { name: "The Mirror", desc: "Weekly reflections, energy maps and scores that show what is shifting." },
                  { name: "Library", desc: "Programs, practices, mirrors and games for every kind of life." },
                ].map((chapter, i) => (
                  <motion.div
                    key={chapter.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-void-100/50 border border-gold-500/10 hover:border-gold-400/30 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-400 font-display font-medium flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <Text variant="h4" color="primary">{chapter.name}</Text>
                      <Text variant="body" color="secondary">{chapter.desc}</Text>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[9/16] max-w-md mx-auto rounded-2xl overflow-hidden border border-gold-500/20 bg-void-0 shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_120px_rgba(217,168,74,0.08)]"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Text variant="h3" color="primary" className="mb-2">App Preview</Text>
                    <Text variant="body" color="secondary">Interactive screenshots would go here</Text>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <PricingSection />
        <JoinSection />
        <FinalCTASection />
      </main>

      <LandingFooter />
    </div>
  );
}