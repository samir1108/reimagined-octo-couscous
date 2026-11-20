import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const outputCssPath = path.join(projectRoot, 'src/design-system/tokens/generated.css');
const tailwindConfigPath = path.join(projectRoot, 'tailwind.config.ts');

function hslToString(h, s, l) {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

const themes = {
  cosmic: {
    dark: {
      background: { h: 222, s: 47, l: 4 },
      foreground: { h: 214, s: 32, l: 91 },
      card: { h: 222, s: 44, l: 7 },
      cardForeground: { h: 214, s: 32, l: 91 },
      popover: { h: 222, s: 44, l: 7 },
      popoverForeground: { h: 214, s: 32, l: 91 },
      primary: { h: 239, s: 84, l: 67 },
      primaryForeground: { h: 0, s: 0, l: 100 },
      secondary: { h: 263, s: 90, l: 76 },
      secondaryForeground: { h: 222, s: 47, l: 4 },
      muted: { h: 222, s: 30, l: 13 },
      mutedForeground: { h: 220, s: 20, l: 52 },
      accent: { h: 263, s: 90, l: 76 },
      accentForeground: { h: 222, s: 47, l: 4 },
      destructive: { h: 0, s: 85, l: 55 },
      destructiveForeground: { h: 0, s: 0, l: 98 },
      border: { h: 222, s: 25, l: 16 },
      input: { h: 222, s: 25, l: 16 },
      ring: { h: 239, s: 84, l: 67 },
    },
    light: {
      background: { h: 230, s: 30, l: 97 },
      foreground: { h: 222, s: 47, l: 11 },
      card: { h: 230, s: 25, l: 95 },
      cardForeground: { h: 222, s: 47, l: 11 },
      popover: { h: 230, s: 25, l: 95 },
      popoverForeground: { h: 222, s: 47, l: 11 },
      primary: { h: 239, s: 75, l: 55 },
      primaryForeground: { h: 0, s: 0, l: 100 },
      secondary: { h: 263, s: 80, l: 65 },
      secondaryForeground: { h: 0, s: 0, l: 100 },
      muted: { h: 230, s: 18, l: 91 },
      mutedForeground: { h: 222, s: 30, l: 38 },
      accent: { h: 263, s: 80, l: 65 },
      accentForeground: { h: 0, s: 0, l: 100 },
      destructive: { h: 0, s: 85, l: 50 },
      destructiveForeground: { h: 0, s: 0, l: 98 },
      border: { h: 230, s: 15, l: 83 },
      input: { h: 230, s: 15, l: 83 },
      ring: { h: 239, s: 75, l: 55 },
    },
  },
  sacred: {
    dark: {
      background: { h: 30, s: 25, l: 4 },
      foreground: { h: 40, s: 28, l: 95 },
      card: { h: 30, s: 22, l: 6 },
      cardForeground: { h: 40, s: 28, l: 95 },
      popover: { h: 30, s: 22, l: 6 },
      popoverForeground: { h: 40, s: 28, l: 95 },
      primary: { h: 38, s: 64, l: 56 },
      primaryForeground: { h: 30, s: 40, l: 5 },
      secondary: { h: 36, s: 59, l: 48 },
      secondaryForeground: { h: 30, s: 40, l: 5 },
      muted: { h: 30, s: 12, l: 12 },
      mutedForeground: { h: 35, s: 18, l: 52 },
      accent: { h: 41, s: 73, l: 66 },
      accentForeground: { h: 30, s: 40, l: 5 },
      destructive: { h: 0, s: 85, l: 55 },
      destructiveForeground: { h: 0, s: 0, l: 98 },
      border: { h: 38, s: 40, l: 18 },
      input: { h: 38, s: 40, l: 18 },
      ring: { h: 38, s: 64, l: 56 },
    },
    light: {
      background: { h: 42, s: 25, l: 97 },
      foreground: { h: 30, s: 20, l: 12 },
      card: { h: 42, s: 20, l: 95 },
      cardForeground: { h: 30, s: 20, l: 12 },
      popover: { h: 42, s: 20, l: 95 },
      popoverForeground: { h: 30, s: 20, l: 12 },
      primary: { h: 38, s: 60, l: 48 },
      primaryForeground: { h: 0, s: 0, l: 100 },
      secondary: { h: 36, s: 55, l: 42 },
      secondaryForeground: { h: 0, s: 0, l: 100 },
      muted: { h: 42, s: 15, l: 91 },
      mutedForeground: { h: 30, s: 15, l: 38 },
      accent: { h: 41, s: 68, l: 63 },
      accentForeground: { h: 30, s: 20, l: 12 },
      destructive: { h: 0, s: 85, l: 50 },
      destructiveForeground: { h: 0, s: 0, l: 98 },
      border: { h: 42, s: 12, l: 83 },
      input: { h: 42, s: 12, l: 83 },
      ring: { h: 38, s: 60, l: 48 },
    },
  },
};

const radius = {
  base: '0.875rem',
  card: '1.125rem',
  featured: '1.375rem',
  pill: '9999px',
};

const spacing = {
  'section-sm': '4rem',
  section: '6rem',
  'section-lg': '9rem',
  'section-xl': '12rem',
  gutter: '1.5rem',
  'gutter-lg': '2rem',
};

const motion = {
  // Durations
  'duration-instant': '0ms',
  'duration-fast': '150ms',
  'duration-normal': '250ms',
  'duration-slow': '400ms',
  'duration-slower': '600ms',
  'duration-breath': '4000ms',
  // Easings
  'ease-standard': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'ease-expressive': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
};

const fontFamilies = {
  display: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  editorial: "'Cormorant Garamond', Georgia, serif",
  body: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  sans: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  sacred: "'Cormorant Garamond', Georgia, serif",
};

const fontSizes = {
  'display-2xl': { size: 'clamp(3rem, 8vw, 6.25rem)', lineHeight: '1.02', letterSpacing: '-0.04em', fontWeight: '700' },
  'display-xl': { size: 'clamp(2.5rem, 6.5vw, 5rem)', lineHeight: '1.04', letterSpacing: '-0.035em', fontWeight: '700' },
  'display-lg': { size: 'clamp(2rem, 5vw, 3.75rem)', lineHeight: '1.06', letterSpacing: '-0.03em', fontWeight: '700' },
  'display-md': { size: 'clamp(1.75rem, 3.6vw, 2.75rem)', lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '600' },
  'display-sm': { size: '1.5rem', lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' },
  eyebrow: { size: '0.75rem', lineHeight: '1', letterSpacing: '0.14em', fontWeight: '600' },
};

const brandColors = {
  gold: { h: 40, s: 75, l: 58 },
  orange: { h: 42, s: 100, l: 78 },
  blue: { h: 211, s: 78, l: 57 },
  ink: { h: 240, s: 15, l: 12 },
  poppy: { h: 350, s: 76, l: 60 },
};

const dimensionColors = {
  awareness: { h: 230, s: 64, l: 73 },
  devotion: { h: 316, s: 33, l: 66 },
  discipline: { h: 160, s: 59, l: 52 },
  energy: { h: 41, s: 73, l: 66 },
  wisdom: { h: 260, s: 64, l: 76 },
};

const surfaceColors = {
  main: { h: 240, s: 15, l: 6 },
  secondary: { h: 240, s: 18, l: 5 },
  elevated: { h: 240, s: 16, l: 6 },
  raised: { h: 240, s: 16, l: 6 },
};

const goldScale = {
  50: { h: 43, s: 100, l: 93 },
  100: { h: 41, s: 100, l: 84 },
  300: { h: 43, s: 100, l: 74 },
  500: { h: 40, s: 75, l: 58 },
  600: { h: 38, s: 68, l: 51 },
  700: { h: 36, s: 59, l: 48 },
};

const semanticColors = {
  success: dimensionColors.discipline,
  warning: brandColors.gold,
  info: dimensionColors.awareness,
};

const voidColors = {
  DEFAULT: { h: 240, s: 15, l: 2 },
  deep: { h: 240, s: 15, l: 2 },
};

const sunriseColor = brandColors.gold;
const golden = { DEFAULT: brandColors.gold, soft: brandColors.orange };

const sidebar = {
  DEFAULT: { h: 240, s: 15, l: 6 },
  foreground: { h: 40, s: 28, l: 95 },
  primary: brandColors.gold,
  'primary-foreground': { h: 30, s: 40, l: 5 },
  accent: { h: 240, s: 16, l: 6 },
  'accent-foreground': { h: 40, s: 28, l: 95 },
  border: { h: 35, s: 12, l: 14 },
  ring: brandColors.gold,
};

// Glass system — 3 levels (dark mode values)
const glassDark = {
  // Level 1: Cards, sheets — subtle
  'glass-1-bg': { h: 240, s: 10, l: 8, a: 0.35 },
  'glass-1-border': { h: 38, s: 20, l: 30, a: 0.12 },
  'glass-1-highlight': { h: 0, s: 0, l: 100, a: 0.04 },
  // Level 2: Nav, modals — elevated
  'glass-2-bg': { h: 240, s: 10, l: 6, a: 0.55 },
  'glass-2-border': { h: 38, s: 20, l: 30, a: 0.2 },
  'glass-2-highlight': { h: 0, s: 0, l: 100, a: 0.06 },
  // Level 3: Orb container, hero — strong
  'glass-3-bg': { h: 240, s: 10, l: 5, a: 0.7 },
  'glass-3-border': { h: 38, s: 64, l: 56, a: 0.25 },
  'glass-3-highlight': { h: 0, s: 0, l: 100, a: 0.08 },
};

// Glass system — 3 levels (light mode values)
const glassLight = {
  // Level 1: Cards, sheets — subtle
  'glass-1-bg': { h: 240, s: 10, l: 96, a: 0.7 },
  'glass-1-border': { h: 38, s: 15, l: 70, a: 0.15 },
  'glass-1-highlight': { h: 0, s: 0, l: 100, a: 0.5 },
  // Level 2: Nav, modals — elevated
  'glass-2-bg': { h: 240, s: 10, l: 98, a: 0.85 },
  'glass-2-border': { h: 38, s: 15, l: 70, a: 0.25 },
  'glass-2-highlight': { h: 0, s: 0, l: 100, a: 0.7 },
  // Level 3: Orb container, hero — strong
  'glass-3-bg': { h: 240, s: 10, l: 99, a: 0.95 },
  'glass-3-border': { h: 38, s: 60, l: 48, a: 0.35 },
  'glass-3-highlight': { h: 0, s: 0, l: 100, a: 0.9 },
};

function hslToStringWithAlpha(h, s, l, a) {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}% / ${a}`;
}

function generateCSSVariables(themeName = 'sacred') {
  const theme = themes[themeName];
  let css = '';

  css += `/* Generated design tokens for ${themeName} theme */\n`;
  css += `:root {\n`;

  const dark = theme.dark;
  const light = theme.light;

  Object.entries(dark).forEach(([key, value]) => {
    css += `  --${key}: ${hslToString(value.h, value.s, value.l)};\n`;
  });

  Object.entries(radius).forEach(([key, value]) => {
    css += `  --radius-${key}: ${value};\n`;
  });

  Object.entries(spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`;
  });

  Object.entries(motion).forEach(([key, value]) => {
    css += `  --motion-${key}: ${value};\n`;
  });

  Object.entries(fontFamilies).forEach(([key, value]) => {
    css += `  --font-${key}: ${value};\n`;
  });

  Object.entries(brandColors).forEach(([key, value]) => {
    css += `  --brand-${key}: ${hslToString(value.h, value.s, value.l)};\n`;
  });

  Object.entries(dimensionColors).forEach(([key, value]) => {
    css += `  --dimension-${key}: ${hslToString(value.h, value.s, value.l)};\n`;
  });

  Object.entries(surfaceColors).forEach(([key, value]) => {
    css += `  --surface-${key}: ${hslToString(value.h, value.s, value.l)};\n`;
  });

  Object.entries(goldScale).forEach(([key, value]) => {
    css += `  --gold-${key}: ${hslToString(value.h, value.s, value.l)};\n`;
  });

  Object.entries(semanticColors).forEach(([key, value]) => {
    css += `  --${key}: ${hslToString(value.h, value.s, value.l)};\n`;
  });

  Object.entries(voidColors).forEach(([key, value]) => {
    if (key === 'DEFAULT') {
      css += `  --void: ${hslToString(value.h, value.s, value.l)};\n`;
    } else {
      css += `  --void-${key}: ${hslToString(value.h, value.s, value.l)};\n`;
    }
  });

  css += `  --sunrise: ${hslToString(sunriseColor.h, sunriseColor.s, sunriseColor.l)};\n`;
  css += `  --golden: ${hslToString(golden.DEFAULT.h, golden.DEFAULT.s, golden.DEFAULT.l)};\n`;
  css += `  --golden-soft: ${hslToString(golden.soft.h, golden.soft.s, golden.soft.l)};\n`;

  Object.entries(sidebar).forEach(([key, value]) => {
    if (key === 'DEFAULT') {
      css += `  --sidebar-background: ${hslToString(value.h, value.s, value.l)};\n`;
    } else {
      css += `  --sidebar-${key}: ${hslToString(value.h, value.s, value.l)};\n`;
    }
  });

  // Glass tokens (dark mode)
  Object.entries(glassDark).forEach(([key, value]) => {
    css += `  --${key}: ${hslToStringWithAlpha(value.h, value.s, value.l, value.a)};\n`;
  });

  css += `}\n\n`;

  css += `.light {\n`;
  Object.entries(light).forEach(([key, value]) => {
    css += `  --${key}: ${hslToString(value.h, value.s, value.l)};\n`;
  });

  // Glass tokens (light mode)
  Object.entries(glassLight).forEach(([key, value]) => {
    css += `  --${key}: ${hslToStringWithAlpha(value.h, value.s, value.l, value.a)};\n`;
  });

  css += `}\n\n`;

  css += `.dark {\n`;
  Object.entries(dark).forEach(([key, value]) => {
    css += `  --${key}: ${hslToString(value.h, value.s, value.l)};\n`;
  });

  // Glass tokens (dark mode - explicit for .dark)
  Object.entries(glassDark).forEach(([key, value]) => {
    css += `  --${key}: ${hslToStringWithAlpha(value.h, value.s, value.l, value.a)};\n`;
  });

  css += `}\n`;

  return css;
}

function generateTailwindConfig(themeName = 'sacred') {
  const theme = themes[themeName];
  const dark = theme.dark;
  const light = theme.light;

  const colors = {};
  Object.entries(dark).forEach(([key, value]) => {
    colors[key] = {
      DEFAULT: `hsl(var(--${key}))`,
    };
    if (key === 'primary' || key === 'secondary' || key === 'accent' || key === 'destructive' || key === 'muted') {
      colors[key].foreground = `hsl(var(--${key}-foreground))`;
    }
  });

  colors.border = `hsl(var(--border))`;
  colors.input = `hsl(var(--input))`;
  colors.ring = `hsl(var(--ring))`;
  colors.background = `hsl(var(--background))`;
  colors.foreground = `hsl(var(--foreground))`;

  const brand = {};
  Object.entries(brandColors).forEach(([key, value]) => {
    brand[key] = `hsl(var(--brand-${key}))`;
  });

  const gold = {};
  Object.entries(goldScale).forEach(([key, value]) => {
    gold[key] = `hsl(var(--gold-${key}))`;
  });

  const dimension = {};
  Object.entries(dimensionColors).forEach(([key, value]) => {
    dimension[key] = `hsl(var(--dimension-${key}))`;
  });

  const surface = {};
  Object.entries(surfaceColors).forEach(([key, value]) => {
    surface[key] = `hsl(var(--surface-${key}))`;
  });

  const semantic = {};
  Object.entries(semanticColors).forEach(([key, value]) => {
    semantic[key] = `hsl(var(--${key}))`;
  });

  const voidObj = {
    DEFAULT: `hsl(var(--void))`,
    deep: `hsl(var(--void-deep))`,
  };

  const sidebarObj = {
    DEFAULT: `hsl(var(--sidebar-background))`,
    foreground: `hsl(var(--sidebar-foreground))`,
    primary: `hsl(var(--sidebar-primary))`,
    'primary-foreground': `hsl(var(--sidebar-primary-foreground))`,
    accent: `hsl(var(--sidebar-accent))`,
    'accent-foreground': `hsl(var(--sidebar-accent-foreground))`,
    border: `hsl(var(--sidebar-border))`,
    ring: `hsl(var(--sidebar-ring))`,
  };

  // Glass system — 3 levels only
  const glass = {
    1: `hsl(var(--glass-1-bg))`,
    2: `hsl(var(--glass-2-bg))`,
    3: `hsl(var(--glass-3-bg))`,
    border1: `hsl(var(--glass-1-border))`,
    border2: `hsl(var(--glass-2-border))`,
    border3: `hsl(var(--glass-3-border))`,
    highlight1: `hsl(var(--glass-1-highlight))`,
    highlight2: `hsl(var(--glass-2-highlight))`,
    highlight3: `hsl(var(--glass-3-highlight))`,
  };

  const config = `import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["${fontFamilies.display}"],
        editorial: ["${fontFamilies.editorial}"],
        body: ["${fontFamilies.body}"],
        sans: ["${fontFamilies.sans}"],
        sacred: ["${fontFamilies.sacred}"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter: "-0.035em",
        tight: "-0.022em",
        snug: "-0.011em",
      },
      fontSize: {
        "display-2xl": ["${fontSizes['display-2xl'].size}", { lineHeight: "${fontSizes['display-2xl'].lineHeight}", letterSpacing: "${fontSizes['display-2xl'].letterSpacing}", fontWeight: "${fontSizes['display-2xl'].fontWeight}" }],
        "display-xl": ["${fontSizes['display-xl'].size}", { lineHeight: "${fontSizes['display-xl'].lineHeight}", letterSpacing: "${fontSizes['display-xl'].letterSpacing}", fontWeight: "${fontSizes['display-xl'].fontWeight}" }],
        "display-lg": ["${fontSizes['display-lg'].size}", { lineHeight: "${fontSizes['display-lg'].lineHeight}", letterSpacing: "${fontSizes['display-lg'].letterSpacing}", fontWeight: "${fontSizes['display-lg'].fontWeight}" }],
        "display-md": ["${fontSizes['display-md'].size}", { lineHeight: "${fontSizes['display-md'].lineHeight}", letterSpacing: "${fontSizes['display-md'].letterSpacing}", fontWeight: "${fontSizes['display-md'].fontWeight}" }],
        "display-sm": ["${fontSizes['display-sm'].size}", { lineHeight: "${fontSizes['display-sm'].lineHeight}", letterSpacing: "${fontSizes['display-sm'].letterSpacing}", fontWeight: "${fontSizes['display-sm'].fontWeight}" }],
        eyebrow: ["${fontSizes.eyebrow.size}", { lineHeight: "${fontSizes.eyebrow.lineHeight}", letterSpacing: "${fontSizes.eyebrow.letterSpacing}", fontWeight: "${fontSizes.eyebrow.fontWeight}" }],
      },
      spacing: {
        "section-sm": "${spacing['section-sm']}",
        "section": "${spacing.section}",
        "section-lg": "${spacing['section-lg']}",
        "section-xl": "${spacing['section-xl']}",
        "gutter": "${spacing.gutter}",
        "gutter-lg": "${spacing['gutter-lg']}",
      },
      transitionDuration: {
        instant: "${motion['duration-instant']}",
        fast: "${motion['duration-fast']}",
        normal: "${motion['duration-normal']}",
        slow: "${motion['duration-slow']}",
        slower: "${motion['duration-slower']}",
        breath: "${motion['duration-breath']}",
      },
      transitionTimingFunction: {
        standard: "${motion['ease-standard']}",
        expressive: "${motion['ease-expressive']}",
        spring: "${motion['ease-spring']}",
        'out': "${motion['ease-out']}",
        'in-out': "${motion['ease-in-out']}",
      },
      maxWidth: {
        "prose-tight": "38rem",
        "prose-wide": "48rem",
        "content": "72rem",
        "content-lg": "80rem",
      },
      colors: ${JSON.stringify({ ...colors, brand, gold, dimension, surface, success: semantic.success, warning: semantic.warning, info: semantic.info, void: voidObj, sunrise: `hsl(var(--sunrise))`, golden: { DEFAULT: `hsl(var(--golden))`, soft: `hsl(var(--golden-soft))` }, sidebar: sidebarObj }, null, 2)},
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "var(--radius-card)",
        featured: "var(--radius-featured)",
        pill: "var(--radius-pill)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "ticker-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ticker-scroll": "ticker-scroll 45s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;`;

  return config;
}

const cssOutput = generateCSSVariables('sacred');
fs.writeFileSync(outputCssPath, cssOutput);
console.log(`Generated CSS variables at ${outputCssPath}`);

const tailwindOutput = generateTailwindConfig('sacred');
fs.writeFileSync(tailwindConfigPath, tailwindOutput);
console.log(`Generated tailwind.config.ts at ${tailwindConfigPath}`);

console.log('Token generation complete!');