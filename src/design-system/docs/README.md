# Design System

Structured, theme-aware design system for the HOPE consciousness app. Built on Tailwind CSS + shadcn/ui with a spirituality-themed aesthetic.

## One door: `import from "@/design-system"`

Every screen imports components from `@/design-system` and nothing else.

| Layer | Location | Direct import? |
|---|---|---|
| L0 tokens | `src/design-system/tokens` | Yes, via the barrel |
| L1 primitives | `src/components/ui/*` (Radix + cva) | **No** — re-exported by the barrel |
| L2 patterns | `src/design-system/components`, `src/design-system/primitives` | Yes, via the barrel |
| Legacy premium tree | `src/components/design-system` | 5 remaining consumers, pending dissolution |

`no-restricted-imports` in `eslint.config.js` blocks `@/components/ui/*` everywhere except
the system's own implementation, so new code cannot re-fragment the system.

## Structure

```
src/design-system/
  tokens/
    colors.ts      # Token type definitions
    values.ts      # Theme token values (5 themes × 2 modes)
    index.ts       # Barrel exports
  primitives/
    Surface.tsx    # Base surface primitive with glass variants
    Card.tsx       # Card composition primitive
    Button.tsx     # Action primitive with sacred/glass variants
    Typography.tsx # Heading, Eyebrow, Body, Caption primitives
    index.ts       # Barrel exports
  docs/
    README.md      # This file
  utils/
    # Helper utilities
```

## Token Layers

### Colors
- **Semantic**: background, foreground, primary, secondary, accent, muted, destructive, border, input, ring
- **Sidebar**: background, foreground, primary, accent, border, ring
- **Glass**: bg, border, highlight, navBg, subtleBg, subtleBorder, shadowColor, skeletonFrom, skeletonVia, ambientOpacity
- **Sacred**: void, voidDeep, sunrise, golden, goldenSoft, goldenDeep, goldLeaf, goldEmber, glowOrange, glowGold
- **Slots**: morningSky, middaySky, eveningSky, nightSky + accent colors

### Typography
- Font families: display (Inter), body (Inter), sacred (Cinzel/Cormorant Garamond)
- Display scale: display-2xl through display-sm with clamp-based responsive sizing
- Eyebrow: 0.75rem, 0.14em tracking

### Spacing
- Section rhythm: section-sm (4rem), section (6rem), section-lg (9rem), section-xl (12rem)
- Gutters: 1.5rem, 2rem

### Motion
- Easing: easeOut, easeInOut, spring
- Durations: fast (150ms), normal (300ms), slow (500ms), breath (4000ms)

### Elevation
- shadowGlow, shadowGlowStrong, shadowGolden, shadowGilt, shadowCard, shadowElevated

## Themes

| Theme | Label | Emoji | Primary Hue |
|-------|-------|-------|-------------|
| `cosmic` | Cosmic | ✨ | 239° indigo |
| `sacred` | Vishnu Divine | 🙏 | 38° gold (default) |
| `zen` | Zen | 🌿 | 160° emerald |
| `minimal` | Minimal | 💎 | 217° blue |
| `mystical` | Mystical | 🔮 | 271° violet |

Each theme ships with `dark` and `light` mode variants.

## Primitives

### Surface
```tsx
<Surface variant="default|glass|subtle|elevated|sacred" padding="none|sm|md|lg">
  ...
</Surface>
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>...</CardTitle>
    <CardDescription>...</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

### Button
```tsx
<Button variant="default|destructive|outline|secondary|ghost|link|sacred|glass" size="default|sm|lg|icon">
  ...
</Button>
```

### Typography
```tsx
<Heading level="h1|h2|h3|h4|h5|h6" weight="default|medium|bold" as="h1">...</Heading>
<Eyebrow color="default|primary|accent">...</Eyebrow>
<Body size="sm|md|lg" color="default|muted|primary|accent">...</Body>
<Caption weight="default|medium">...</Caption>
```

## Usage

```tsx
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { Surface, Card, Button, Heading, Body } from "@/design-system/primitives";

function App() {
  return (
    <ThemeProvider>
      <MyContent />
    </ThemeProvider>
  );
}

function MyContent() {
  const { theme, setTheme } = useTheme();
  return (
    <Surface variant="glass" padding="lg">
      <Card>
        <CardHeader>
          <Heading level="h2">Consciousness Journey</Heading>
          <Body color="muted">Track your inner growth</Body>
        </CardHeader>
        <CardContent>
          <Button variant="sacred" size="lg">Begin Session</Button>
        </CardContent>
      </Card>
    </Surface>
  );
}
```

## Migration Notes

- `ThemeContext` now sources tokens from `@/design-system/tokens/values.ts`
- All CSS custom properties are set via `applyTokens()` in `ThemeContext`
- Existing `shadcn/ui` components continue to work via CSS variable bindings
- Legacy theme names are auto-migrated in `ThemeProvider` and `syncFromProfile()`
