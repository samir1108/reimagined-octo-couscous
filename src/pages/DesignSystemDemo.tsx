"use client";

import { Button, Card, CardContent, Text, Badge, Orb, HeroOrb, Progress, CircularProgress, ArcProgress } from "@/components/design-system";
import { motion } from "framer-motion";

export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-gradient-morning noise-texture py-20 px-4">
      <div className="container mx-auto space-y-20">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <Text variant="display" gold weight="bold" className="mb-6">
            ConsciousOS Design System v4
          </Text>
          <Text variant="body-lg" color="secondary" className="max-w-2xl mx-auto">
            Gold emerges from void. Motion breathes. Type speaks. Every token serves the inner journey.
          </Text>
        </motion.section>

        {/* Hero Orb */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <HeroOrb />
          <Text variant="micro" color="muted" className="mt-6">
            The signature breathing orb — hold to activate
          </Text>
        </motion.section>

        {/* Buttons */}
        <section className="space-y-8">
          <Text variant="h3" color="primary" className="mb-6">Buttons</Text>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="primary" size="lg" motion="spring">Primary</Button>
            <Button variant="secondary" size="lg" motion="spring">Secondary</Button>
            <Button variant="ghost" size="lg" motion="spring">Ghost</Button>
            <Button variant="glass" size="lg" motion="spring">Glass</Button>
            <Button variant="gold" size="lg" motion="spring">Gold</Button>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="primary" size="sm" motion="spring">Small</Button>
            <Button variant="primary" size="md" motion="spring">Medium</Button>
            <Button variant="primary" size="lg" motion="spring">Large</Button>
            <Button variant="primary" size="xl" motion="spring">XLarge</Button>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="primary" loading motion="spring">Loading</Button>
            <Button variant="primary" disabled motion="spring">Disabled</Button>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-8">
          <Text variant="h3" color="primary" className="mb-6">Cards</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default" hover padding="lg">
              <CardContent className="space-y-4">
                <Text variant="h4" color="primary">Default</Text>
                <Text variant="body" color="secondary">
                  Standard card with gold hairline border and subtle glow on hover.
                </Text>
                <Badge variant="default">Default</Badge>
              </CardContent>
            </Card>

            <Card variant="featured" hover padding="lg">
              <CardContent className="space-y-4">
                <Text variant="h4" color="primary">Featured</Text>
                <Text variant="body" color="secondary">
                  Radial gold gradient background with stronger border and glow.
                </Text>
                <Badge variant="gold">Featured</Badge>
              </CardContent>
            </Card>

            <Card variant="gold" hover padding="lg">
              <CardContent className="space-y-4">
                <Text variant="h4" color="primary">Gold</Text>
                <Text variant="body" color="secondary">
                  Gradient border with gold-tinted background and intense glow.
                </Text>
                <Badge variant="gold" pulse>Gold</Badge>
              </CardContent>
            </Card>

            <Card variant="glass" hover padding="lg">
              <CardContent className="space-y-4">
                <Text variant="h4" color="primary">Glass</Text>
                <Text variant="body" color="secondary">
                  Frosted glass with gold border and ambient glow.
                </Text>
                <Badge variant="outline">Glass</Badge>
              </CardContent>
            </Card>

            <Card variant="mode" mode="meditation" hover padding="lg">
              <CardContent className="space-y-4">
                <Text variant="h4" color="primary">Mode: Meditation</Text>
                <Text variant="body" color="secondary">
                  Semantic color system — gold core, warm glow, meditation tones.
                </Text>
                <Badge variant="mode" mode="meditation" dot>Meditation</Badge>
              </CardContent>
            </Card>

            <Card variant="mode" mode="inquiry" hover padding="lg">
              <CardContent className="space-y-4">
                <Text variant="h4" color="primary">Mode: Inquiry</Text>
                <Text variant="body" color="secondary">
                  Violet system for deep questioning and self-inquiry.
                </Text>
                <Badge variant="mode" mode="inquiry" dot>Inquiry</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-8">
          <Text variant="h3" color="primary" className="mb-6">Typography</Text>
          <div className="space-y-4 max-w-3xl">
            <Text variant="display" gold>Display</Text>
            <Text variant="display-sm" color="primary">Display Small</Text>
            <Text variant="h1" color="primary">H1 Heading</Text>
            <Text variant="h2" color="primary">H2 Heading</Text>
            <Text variant="h3" color="primary">H3 Heading</Text>
            <Text variant="h4" color="primary">H4 Heading</Text>
            <Text variant="body-lg" color="secondary">Body Large — The teacher that fades. Gold emerges from void. Motion breathes.</Text>
            <Text variant="body" color="secondary">Body — Every token serves the inner journey. Type speaks with editorial warmth.</Text>
            <Text variant="sm" color="muted">Small — Metadata and supporting text</Text>
            <Text variant="caption" color="muted">Caption — Timestamps, labels</Text>
            <Text variant="micro" color="faint">Micro — Uppercase labels and metadata</Text>
          </div>
          <div className="space-y-2">
            <Text variant="h4" color="primary">Gold Text Effects</Text>
            <Text variant="h2" gold>Gold Shimmer</Text>
            <Text variant="h2" goldIntense>Gold Shimmer Intense</Text>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-8">
          <Text variant="h3" color="primary" className="mb-6">Badges</Text>
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="default" size="md">Default</Badge>
            <Badge variant="gold" size="md">Gold</Badge>
            <Badge variant="outline" size="md">Outline</Badge>
            <Badge variant="mode" mode="observation" size="md" dot>Observation</Badge>
            <Badge variant="mode" mode="inquiry" size="md" dot>Inquiry</Badge>
            <Badge variant="mode" mode="meditation" size="md" dot>Meditation</Badge>
            <Badge variant="mode" mode="healing" size="md" dot>Healing</Badge>
            <Badge variant="mode" mode="focus" size="md" dot>Focus</Badge>
            <Badge variant="mode" mode="shadow" size="md" dot>Shadow</Badge>
            <Badge variant="mode" mode="sleep" size="md" dot>Sleep</Badge>
            <Badge variant="mode" mode="awakening" size="md" dot>Awakening</Badge>
            <Badge variant="mode" mode="integration" size="md" dot>Integration</Badge>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="gold" size="xs" pulse>Pulse XS</Badge>
            <Badge variant="gold" size="sm" pulse>Pulse SM</Badge>
            <Badge variant="gold" size="md" pulse>Pulse MD</Badge>
            <Badge variant="gold" size="lg" pulse>Pulse LG</Badge>
          </div>
        </section>

        {/* Progress */}
        <section className="space-y-8">
          <Text variant="h3" color="primary" className="mb-6">Progress</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <Text variant="h4" color="primary">Linear</Text>
              <Progress value={65} variant="default" size="md" showLabel label="Default" />
              <Progress value={80} variant="gold" size="lg" showLabel label="Gold" />
              <Progress value={45} variant="mode" mode="healing" size="md" showLabel label="Healing Mode" />
            </div>
            <div className="space-y-4">
              <Text variant="h4" color="primary">Circular</Text>
              <div className="flex justify-center gap-8">
                <CircularProgress value={65} size="lg" showLabel label="65%" />
                <CircularProgress value={90} variant="gold" size="lg" showLabel label="90%" />
              </div>
            </div>
            <div className="space-y-4">
              <Text variant="h4" color="primary">Arc</Text>
              <div className="flex justify-center gap-8">
                <ArcProgress value={70} size="lg" showLabel label="70%" />
                <ArcProgress value={100} variant="gold" size="lg" showLabel label="Complete" />
              </div>
            </div>
          </div>
        </section>

        {/* Orb States */}
        <section className="space-y-8">
          <Text variant="h3" color="primary" className="mb-6">Orb States</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <Orb size="md" state="dormant" particles={false} glow={false} />
              <Text variant="micro" color="muted">Dormant</Text>
            </div>
            <div className="text-center space-y-3">
              <Orb size="md" state="breathing" />
              <Text variant="micro" color="muted">Breathing</Text>
            </div>
            <div className="text-center space-y-3">
              <Orb size="md" state="held" intensity={0.7} />
              <Text variant="micro" color="muted">Held (70%)</Text>
            </div>
            <div className="text-center space-y-3">
              <Orb size="md" state="shocked" intensity={1} />
              <Text variant="micro" color="muted">Shocked</Text>
            </div>
            <div className="text-center space-y-3">
              <Orb size="md" state="active" />
              <Text variant="micro" color="muted">Active</Text>
            </div>
          </div>
        </section>

        {/* Color Palettes */}
        <section className="space-y-8">
          <Text variant="h3" color="primary" className="mb-6">Color Palettes</Text>
          
          <div className="space-y-6">
            <Text variant="h4" color="primary">Void Scale</Text>
            <div className="flex gap-2 flex-wrap">
              {["0", "50", "100", "200", "300"].map((step) => (
                <div key={step} className="flex flex-col items-center gap-2 w-20">
                  <div className="w-full h-20 rounded-lg" style={{ backgroundColor: `var(--void-${step})` }} />
                  <Text variant="micro" color="muted">void-{step}</Text>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Text variant="h4" color="primary">Gold Scale</Text>
            <div className="flex gap-2 flex-wrap">
              {["50", "100", "200", "300", "400", "500", "600", "700"].map((step) => (
                <div key={step} className="flex flex-col items-center gap-2 w-20">
                  <div className="w-full h-20 rounded-lg" style={{ backgroundColor: `var(--gold-${step})` }} />
                  <Text variant="micro" color="muted">gold-{step}</Text>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Text variant="h4" color="primary">Consciousness Modes</Text>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {([
                "observation", "inquiry", "meditation", "healing", "focus",
                "shadow", "sleep", "awakening", "integration"
              ] as const).map((mode) => (
                <Card key={mode} variant="mode" mode={mode} padding="md" className="text-center">
                  <CardContent className="space-y-2">
                    <div className="w-12 h-12 rounded-full mx-auto" style={{ backgroundColor: `var(--mode-${mode}-core)` }} />
                    <Text variant="h4" color="primary" className="capitalize">{mode}</Text>
                    <Text variant="micro" color="muted">Core color</Text>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Gradients */}
        <section className="space-y-8">
          <Text variant="h3" color="primary" className="mb-6">Atmospheric Gradients</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(["morning", "midday", "evening", "night"] as const).map((time) => (
              <Card key={time} variant="default" padding="lg" className="h-64">
                <CardContent className="flex flex-col justify-between h-full">
                  <div className="rounded-lg" style={{ backgroundImage: `var(--grad-${time})`, height: "120px" }} />
                  <Text variant="h4" color="primary" className="capitalize">{time}</Text>
                  <Text variant="micro" color="muted">Time-of-day atmosphere</Text>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center py-12 border-t border-gold-500/10"
        >
          <Text variant="body" color="muted">
            Built with the ConsciousOS Design System v4
          </Text>
          <Text variant="micro" color="faint" className="mt-2">
            The teacher that fades. Gold emerges from void.
          </Text>
        </motion.footer>
      </div>
    </div>
  );
}