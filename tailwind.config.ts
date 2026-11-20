import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";
import tailwindTypography from "@tailwindcss/typography";

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
        display: ["'Instrument Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"],
        editorial: ["'Fraunces', Georgia, serif"],
        body: ["'Instrument Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"],
        sans: ["'Instrument Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"],
        sacred: ["'Fraunces', Georgia, serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter: "-0.035em",
        tight: "-0.022em",
        snug: "-0.011em",
      },
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.25rem" }],
        sm: ["0.9375rem", { lineHeight: "1.5rem" }],
        base: ["1rem", { lineHeight: "1.6" }],
        "display-2xl": ["clamp(3rem, 8vw, 6.25rem)", { lineHeight: "1.02", letterSpacing: "-0.04em", fontWeight: "700" }],
        "display-xl": ["clamp(2.5rem, 6.5vw, 5rem)", { lineHeight: "1.04", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display-lg": ["clamp(2rem, 5vw, 3.75rem)", { lineHeight: "1.06", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-md": ["clamp(1.75rem, 3.6vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display-sm": ["1.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.14em", fontWeight: "600" }],
      },
      spacing: {
        "section-sm": "4rem",
        "section": "6rem",
        "section-lg": "9rem",
        "section-xl": "12rem",
        "gutter": "1.5rem",
        "gutter-lg": "2rem",
      },
      transitionDuration: {
        instant: "0ms",
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
        slower: "600ms",
        breath: "4000ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.16, 1, 0.3, 1)",
        expressive: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        'out': "cubic-bezier(0.16, 1, 0.3, 1)",
        'in-out': "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      maxWidth: {
        "prose-tight": "38rem",
        "prose-wide": "48rem",
        "content": "72rem",
        "content-lg": "80rem",
      },
      colors: {
  "background": "hsl(var(--background))",
  "foreground": "hsl(var(--foreground))",
  "card": {
    "DEFAULT": "hsl(var(--card))"
  },
  "cardForeground": {
    "DEFAULT": "hsl(var(--cardForeground))"
  },
  "popover": {
    "DEFAULT": "hsl(var(--popover))"
  },
  "popoverForeground": {
    "DEFAULT": "hsl(var(--popoverForeground))"
  },
  "primary": {
    "DEFAULT": "hsl(var(--primary))",
    "foreground": "hsl(var(--primary-foreground))"
  },
  "primaryForeground": {
    "DEFAULT": "hsl(var(--primaryForeground))"
  },
  "secondary": {
    "DEFAULT": "hsl(var(--secondary))",
    "foreground": "hsl(var(--secondary-foreground))"
  },
  "secondaryForeground": {
    "DEFAULT": "hsl(var(--secondaryForeground))"
  },
  "muted": {
    "DEFAULT": "hsl(var(--muted))",
    "foreground": "hsl(var(--muted-foreground))"
  },
  "mutedForeground": {
    "DEFAULT": "hsl(var(--mutedForeground))"
  },
  "accent": {
    "DEFAULT": "hsl(var(--accent))",
    "foreground": "hsl(var(--accent-foreground))"
  },
  "accentForeground": {
    "DEFAULT": "hsl(var(--accentForeground))"
  },
  "destructive": {
    "DEFAULT": "hsl(var(--destructive))",
    "foreground": "hsl(var(--destructive-foreground))"
  },
  "destructiveForeground": {
    "DEFAULT": "hsl(var(--destructiveForeground))"
  },
  "border": "hsl(var(--border))",
  "input": "hsl(var(--input))",
  "ring": "hsl(var(--ring))",
  "brand": {
    "gold": "hsl(var(--brand-gold))",
    "orange": "hsl(var(--brand-orange))",
    "blue": "hsl(var(--brand-blue))",
    "ink": "hsl(var(--brand-ink))",
    "poppy": "hsl(var(--brand-poppy))"
  },
  "gold": {
    "50": "hsl(var(--gold-50))",
    "100": "hsl(var(--gold-100))",
    "300": "hsl(var(--gold-300))",
    "500": "hsl(var(--gold-500))",
    "600": "hsl(var(--gold-600))",
    "700": "hsl(var(--gold-700))"
  },
  "dimension": {
    "awareness": "hsl(var(--dimension-awareness))",
    "devotion": "hsl(var(--dimension-devotion))",
    "discipline": "hsl(var(--dimension-discipline))",
    "energy": "hsl(var(--dimension-energy))",
    "wisdom": "hsl(var(--dimension-wisdom))"
  },
  "surface": {
    "main": "hsl(var(--surface-main))",
    "secondary": "hsl(var(--surface-secondary))",
    "elevated": "hsl(var(--surface-elevated))",
    "raised": "hsl(var(--surface-raised))"
  },
  "success": "hsl(var(--success))",
  "warning": "hsl(var(--warning))",
  "info": "hsl(var(--info))",
  "void": {
    "DEFAULT": "hsl(var(--void))",
    "deep": "hsl(var(--void-deep))"
  },
  "sunrise": "hsl(var(--sunrise))",
  "golden": {
    "DEFAULT": "hsl(var(--golden))",
    "soft": "hsl(var(--golden-soft))",
    "deep": "hsl(var(--golden-deep))"
  },
  "gold-leaf": "hsl(var(--gold-leaf, var(--gold-300)))",
  "glass": {
    "bg": "hsl(var(--glass-2-bg))",
    "border": "hsl(var(--glass-2-border))",
    "highlight": "hsl(var(--glass-2-highlight))",
    "subtle": "hsl(var(--glass-1-bg))",
    "nav": "hsl(var(--glass-nav-bg, var(--glass-2-bg)))"
  },
  "sidebar": {
    "DEFAULT": "hsl(var(--sidebar-background))",
    "foreground": "hsl(var(--sidebar-foreground))",
    "primary": "hsl(var(--sidebar-primary))",
    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
    "accent": "hsl(var(--sidebar-accent))",
    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
    "border": "hsl(var(--sidebar-border))",
    "ring": "hsl(var(--sidebar-ring))"
  }
},
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "var(--radius-card)",
        featured: "var(--radius-featured)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        elevated: "var(--shadow-elevated)",
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
        "glow-strong": "var(--shadow-glow-strong)",
        golden: "var(--shadow-golden)",
        gilt: "var(--shadow-gilt)",
        "elev-1": "var(--elev-1)",
        "elev-2": "var(--elev-2)",
        "elev-3": "var(--elev-3)",
        "elev-4": "var(--elev-4)",
      },
      backdropBlur: {
        xs: "2px",
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
  plugins: [tailwindAnimate, tailwindTypography],
} satisfies Config;