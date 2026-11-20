/**
 * CONSCIOUSOS DESIGN SYSTEM v4 — TypeScript Source of Truth
 * Single source for all tokens. Generates CSS, Tailwind, Figma, iOS, Android.
 */

export const tokens = {
  /* ============================================
     VOID — The Canvas
     ============================================ */
  void: {
    0:    '#000000',  // Pure — page background only
    50:   '#040404',  // Barely lifted
    100:  '#0a0a0a',  // Surface — cards, modals
    200:  '#111111',  // Elevated — dropdowns, popovers
    300:  '#1a1a1a',  // Overlay — input backgrounds
  } as const,

  /* ============================================
     GOLD — The Soul (Single Hue, 7 Stops)
     ============================================ */
  gold: {
    50:  '#fff8ec',   // Pearl — text on void
    100: '#ffe8a3',   // Dawn — highlights, hover
    200: '#f5d97a',   // Light
    300: '#e8c47a',   // Warm
    400: '#d9a84a',   // CORE — primary brand
    500: '#c49840',   // Muted — borders
    600: '#b8860b',   // Ember — pressed, active
    700: '#946624',   // Deep — dark mode adjustments
  } as const,

  /* ============================================
     TEXT — Warm Editorial Hierarchy
     ============================================ */
  text: {
    primary:   '#efe7d6',  // Warm ivory — headlines, primary
    secondary: '#b8afa0',  // Warm bronze — body, descriptions
    muted:     '#8d8576',  // Bronze-gray — metadata, timestamps
    faint:     '#6b685c',  // Faint — placeholders, disabled
    inverse:   '#0a0a0a',  // On gold backgrounds
    gold:      '#d9a84a',  // Gold accents in text
  } as const,

  /* ============================================
     CONSCIOUSNESS MODES — Semantic Color Systems
     ============================================ */
  mode: {
    observation: {
      core:   '#3b82f6',
      glow:   '#60a5fa',
      bg:     'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.2)',
      text:   '#93c5fd',
    },
    inquiry: {
      core:   '#8b5cf6',
      glow:   '#a78bfa',
      bg:     'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.2)',
      text:   '#c4b5fd',
    },
    meditation: {
      core:   '#d9a84a',
      glow:   '#e8c47a',
      bg:     'rgba(217,168,74,0.08)',
      border: 'rgba(217,168,74,0.2)',
      text:   '#fde68a',
    },
    healing: {
      core:   '#10b981',
      glow:   '#34d399',
      bg:     'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
      text:   '#6ee7b7',
    },
    focus: {
      core:   '#06b6d4',
      glow:   '#22d3ee',
      bg:     'rgba(6,182,212,0.08)',
      border: 'rgba(6,182,212,0.2)',
      text:   '#67e8f9',
    },
    shadow: {
      core:   '#5b21b6',
      glow:   '#7c3aed',
      bg:     'rgba(91,33,182,0.08)',
      border: 'rgba(91,33,182,0.2)',
      text:   '#a78bfa',
    },
    sleep: {
      core:   '#1e1b4b',
      glow:   '#312e81',
      bg:     'rgba(30,27,75,0.12)',
      border: 'rgba(30,27,75,0.25)',
      text:   '#818cf8',
    },
    awakening: {
      core:   '#fef3c7',
      glow:   '#fde68a',
      bg:     'rgba(254,243,199,0.1)',
      border: 'rgba(254,243,199,0.2)',
      text:   '#fcd34d',
    },
    integration: {
      core:   '#86efac',
      glow:   '#4ade80',
      bg:     'rgba(134,239,172,0.08)',
      border: 'rgba(134,239,172,0.2)',
      text:   '#bbf7d0',
    },
  } as const,

  /* ============================================
     STATE COLORS
     ============================================ */
  state: {
    success: { core: '#10b981', glow: '#34d399' },
    warning: { core: '#f59e0b', glow: '#fbbf24' },
    error:   { core: '#ef4444', glow: '#f87171' },
    info:    { core: '#3b82f6', glow: '#60a5fa' },
  } as const,

  /* ============================================
     TYPOGRAPHY
     ============================================ */
  font: {
    display: 'Fraunces, Georgia, serif',
    body:    'Instrument Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono:    'JetBrains Mono, Fira Code, monospace',
  } as const,

  /* Fluid Type Scale — clamp() values as strings */
  textSize: {
    display:      'clamp(3rem, 8vw, 7rem)',
    displaySm:    'clamp(2rem, 5vw, 4rem)',
    h1:           'clamp(2.25rem, 4vw, 3.5rem)',
    h2:           'clamp(1.75rem, 3vw, 2.5rem)',
    h3:           'clamp(1.5rem, 2.5vw, 2rem)',
    h4:           'clamp(1.25rem, 2vw, 1.5rem)',
    body:         'clamp(1rem, 1.25vw, 1.0625rem)',
    bodyLg:       'clamp(1.125rem, 1.5vw, 1.25rem)',
    sm:           'clamp(0.875rem, 1vw, 0.9375rem)',
    caption:      '0.8125rem',
    micro:        '0.75rem',
  } as const,

  lineHeight: {
    tight:   '1.1',
    snug:    '1.25',
    normal:  '1.5',
    relaxed: '1.65',
  } as const,

  letterSpacing: {
    tight:  '-0.03em',
    normal: '0',
    wide:   '0.02em',
    meta:   '0.1em',
  } as const,

  /* ============================================
     SPACING — 4px Base
     ============================================ */
  space: {
    1:  '4px',  2:  '8px',  3:  '12px',
    4:  '16px', 5:  '20px', 6:  '24px',
    8:  '32px', 10: '40px', 12: '48px',
    16: '64px', 20: '80px', 24: '96px',
    32: '128px', 40: '160px',
  } as const,

  /* ============================================
     CONTAINERS
     ============================================ */
  container: {
    sm:  '480px',
    md:  '768px',
    lg:  '1024px',
    xl:  '1240px',
    '2xl': '1440px',
  } as const,

  /* ============================================
     RADIUS
     ============================================ */
  radius: {
    none:  '0',
    xs:    '4px',
    sm:    '8px',
    md:    '12px',
    lg:    '16px',
    xl:    '24px',
    '2xl': '32px',
    pill:  '9999px',
    orb:   '50%',
    card: '16px',
    cardFeatured: '24px',
    cardImmersive: '32px',
  } as const,

  /* ============================================
     SHADOWS
     ============================================ */
  shadow: {
    xs: '0 1px 3px rgba(0,0,0,0.25)',
    sm: '0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
    md: '0 8px 24px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25)',
    lg: '0 16px 40px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.35)',
    xl: '0 24px 56px rgba(0,0,0,0.55), 0 12px 28px rgba(0,0,0,0.4)',

    glow: {
      sm: '0 0 20px rgba(217,168,74,0.15)',
      md: '0 0 40px rgba(217,168,74,0.2), 0 0 80px rgba(217,168,74,0.1)',
      lg: '0 0 60px rgba(217,168,74,0.25), 0 0 120px rgba(217,168,74,0.15)',
      xl: '0 0 80px rgba(217,168,74,0.3), 0 0 160px rgba(217,168,74,0.2)',
    },

    card: {
      default:  'inset 0 1px 0 rgba(239,231,214,0.05), 0 0 0 1px rgba(217,168,74,0.12), 0 8px 32px rgba(0,0,0,0.4)',
      featured: 'inset 0 1px 0 rgba(239,231,214,0.08), 0 0 0 1px rgba(217,168,74,0.18), 0 12px 40px rgba(0,0,0,0.45), 0 0 30px rgba(217,168,74,0.1)',
      gold:     'inset 0 1px 0 rgba(239,231,214,0.1), 0 0 0 1px rgba(217,168,74,0.25), 0 12px 40px rgba(0,0,0,0.5), 0 0 40px rgba(217,168,74,0.2)',
      glass:    'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(217,168,74,0.12), 0 8px 32px rgba(0,0,0,0.4)',
    },

    mode: {
      observation:   '0 0 30px rgba(59,130,246,0.2)',
      inquiry:       '0 0 30px rgba(139,92,246,0.2)',
      meditation:    '0 0 30px rgba(217,168,74,0.2)',
      healing:       '0 0 30px rgba(16,185,129,0.2)',
      focus:         '0 0 30px rgba(6,182,212,0.2)',
      shadow:        '0 0 30px rgba(91,33,182,0.2)',
      sleep:         '0 0 30px rgba(30,27,75,0.3)',
      awakening:     '0 0 30px rgba(254,243,199,0.2)',
      integration:   '0 0 30px rgba(134,239,172,0.2)',
    },
  } as const,

  /* ============================================
     GRADIENTS
     ============================================ */
  gradient: {
    gold: 'linear-gradient(135deg, #fff8ec 0%, #f5d97a 25%, #d9a84a 50%, #c49840 75%, #b8860b 100%)',
    goldRadial: 'radial-gradient(ellipse at center, #ffe8a3 0%, #d9a84a 50%, transparent 80%)',
    goldBorder: 'linear-gradient(135deg, rgba(255,232,163,0.4) 0%, rgba(217,168,74,0.2) 50%, rgba(184,136,11,0.3) 100%)',
    goldText: 'linear-gradient(135deg, #fff8ec 0%, #e8c47a 30%, #d9a84a 50%, #e8c47a 70%, #fff8ec 100%)',
    goldTextIntense: 'linear-gradient(135deg, #fff 0%, #fff8ec 20%, #d9a84a 45%, #fff8ec 65%, #fff 85%, #fff8ec 100%)',

    morning: 'radial-gradient(900px 600px at 76% 45%, rgba(217,168,74,0.14), transparent 70%), radial-gradient(700px 500px at 8% 100%, rgba(217,168,74,0.09), transparent 70%), #000000',
    midday:  'radial-gradient(800px 500px at 50% -10%, rgba(232,196,122,0.12), transparent 70%), radial-gradient(600px 400px at 90% 80%, rgba(6,182,212,0.06), transparent 70%), #000000',
    evening: 'radial-gradient(800px 500px at 8% 0%, rgba(139,92,246,0.18), transparent 70%), radial-gradient(700px 400px at 95% 80%, rgba(217,168,74,0.08), transparent 70%), #000000',
    night:   'radial-gradient(900px 500px at 50% 50%, rgba(30,27,75,0.35), transparent 70%), radial-gradient(600px 400px at 10% 90%, rgba(91,33,182,0.08), transparent 70%), #000000',
    deepPractice: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(217,168,74,0.15), transparent 65%), #000000',
  } as const,

  /* ============================================
     GLASS
     ============================================ */
  glass: {
    bg:            'rgba(20, 23, 32, 0.7)',
    bgSubtle:      'rgba(20, 23, 32, 0.45)',
    bgStrong:      'rgba(20, 23, 32, 0.85)',
    border:        'rgba(217,168,74,0.12)',
    borderBright:  'rgba(217,168,74,0.22)',
    borderIntense: 'rgba(217,168,74,0.35)',
    highlight:     'rgba(255, 255, 255, 0.04)',
    highlightBright: 'rgba(255, 255, 255, 0.08)',
    blur:          'blur(24px)',
    blurSubtle:    'blur(16px)',
    blurStrong:    'blur(32px)',
    saturate:      'saturate(140%)',
    saturateSubtle: 'saturate(120%)',

    gold: {
      bg:        'rgba(217,168,74,0.06)',
      border:    'rgba(217,168,74,0.18)',
      highlight: 'rgba(239,231,214,0.06)',
    },
  } as const,

  /* ============================================
     BREAKPOINTS
     ============================================ */
  breakpoint: {
    xs:  '375px',
    sm:  '480px',
    md:  '768px',
    lg:  '1024px',
    xl:  '1280px',
    '2xl': '1440px',
    '3xl': '1920px',
  } as const,

  /* ============================================
     Z-INDEX
     ============================================ */
  zIndex: {
    bg:       -1,
    base:     0,
    content:  10,
    sticky:   20,
    dropdown: 30,
    orb:      40,
    overlay:  50,
    modal:    60,
    toast:    70,
    tooltip:  80,
    max:      9999,
  } as const,

  /* ============================================
     MOTION — Breath as Primitive
     ============================================ */
  motion: {
    easing: {
      spring:  'cubic-bezier(0.16, 1, 0.3, 1)',
      gentle:  'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      smooth:  'cubic-bezier(0.4, 0, 0.2, 1)',
      expo:    'cubic-bezier(0.87, 0, 0.13, 1)',
    },
    duration: {
      instant:  '50ms',
      fast:     '150ms',
      normal:   '300ms',
      slow:     '500ms',
      slower:   '800ms',
      inhale:   '4000ms',
      holdIn:   '2000ms',
      exhale:   '4000ms',
      holdOut:  '2000ms',
      breath:   '12000ms',
      orbPulse: '4000ms',
      orbRotate:'20000ms',
      orbFloat: '6000ms',
    },
  } as const,

  /* ============================================
     ORB SPECIFIC
     ============================================ */
  orb: {
    size: {
      xs:  '200px',
      sm:  '240px',
      md:  '280px',
      lg:  '320px',
      xl:  '360px',
      '2xl': '400px',
    },
    glowRadius: {
      sm: '140px',
      md: '180px',
      lg: '220px',
      xl: '260px',
    },
    layerCount: 5,
    particleCount: 120,
  } as const,
} as const;

/* ============================================
   TYPE EXPORTS — For TypeScript consumers
   ============================================ */

export type VoidScale = keyof typeof tokens.void;
export type GoldScale = keyof typeof tokens.gold;
export type TextColor = keyof typeof tokens.text;
export type ModeName = keyof typeof tokens.mode;
export type ModeToken = typeof tokens.mode.observation;
export type StateName = keyof typeof tokens.state;
export type FontName = keyof typeof tokens.font;
export type TextSize = keyof typeof tokens.textSize;
export type SpaceScale = keyof typeof tokens.space;
export type ContainerSize = keyof typeof tokens.container;
export type RadiusSize = keyof typeof tokens.radius;
export type ShadowName = keyof typeof tokens.shadow;
export type GradientName = keyof typeof tokens.gradient;
export type GlassToken = keyof typeof tokens.glass;
export type Breakpoint = keyof typeof tokens.breakpoint;
export type ZIndexName = keyof typeof tokens.zIndex;
export type EasingName = keyof typeof tokens.motion.easing;
export type DurationName = keyof typeof tokens.motion.duration;
export type OrbSize = keyof typeof tokens.orb.size;

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

export function getModeTokens(mode: ModeName) {
  return tokens.mode[mode];
}

export function getVoidToken(scale: VoidScale) {
  return tokens.void[scale];
}

export function getGoldToken(scale: GoldScale) {
  return tokens.gold[scale];
}

export function getSpaceToken(scale: SpaceScale) {
  return tokens.space[scale];
}

export function getTextSize(size: TextSize) {
  return tokens.textSize[size];
}

export function getRadius(size: RadiusSize) {
  return tokens.radius[size];
}

export function getShadow(name: ShadowName) {
  return tokens.shadow[name];
}

export function getGradient(name: GradientName) {
  return tokens.gradient[name];
}

export function getGlassToken(token: GlassToken) {
  return tokens.glass[token];
}

export function getBreakpoint(bp: Breakpoint) {
  return tokens.breakpoint[bp];
}

export function getZIndex(name: ZIndexName) {
  return tokens.zIndex[name];
}

export function getEasing(name: EasingName) {
  return tokens.motion.easing[name];
}

export function getDuration(name: DurationName) {
  return tokens.motion.duration[name];
}

export function getOrbSize(size: OrbSize) {
  return tokens.orb.size[size];
}

/* ============================================
   CSS VARIABLE GENERATOR (for Style Dictionary)
   ============================================ */

export function generateCSSVariables(): string {
  const lines: string[] = [':root {'];

  // Void
  Object.entries(tokens.void).forEach(([key, value]) => {
    lines.push(`  --void-${key}: ${value};`);
  });

  // Gold
  Object.entries(tokens.gold).forEach(([key, value]) => {
    lines.push(`  --gold-${key}: ${value};`);
  });

  // Text
  Object.entries(tokens.text).forEach(([key, value]) => {
    lines.push(`  --text-${key}: ${value};`);
  });

  // Modes
  Object.entries(tokens.mode).forEach(([mode, modeTokens]) => {
    Object.entries(modeTokens).forEach(([key, value]) => {
      lines.push(`  --mode-${mode}-${key}: ${value};`);
    });
  });

  // State
  Object.entries(tokens.state).forEach(([state, stateTokens]) => {
    Object.entries(stateTokens).forEach(([key, value]) => {
      lines.push(`  --${state}-${key}: ${value};`);
    });
  });

  // Font
  Object.entries(tokens.font).forEach(([key, value]) => {
    lines.push(`  --font-${key}: ${value};`);
  });

  // Text sizes
  Object.entries(tokens.textSize).forEach(([key, value]) => {
    lines.push(`  --text-${key}: ${value};`);
  });

  // Line heights
  Object.entries(tokens.lineHeight).forEach(([key, value]) => {
    lines.push(`  --leading-${key}: ${value};`);
  });

  // Letter spacing
  Object.entries(tokens.letterSpacing).forEach(([key, value]) => {
    lines.push(`  --tracking-${key}: ${value};`);
  });

  // Space
  Object.entries(tokens.space).forEach(([key, value]) => {
    lines.push(`  --space-${key}: ${value};`);
  });

  // Containers
  Object.entries(tokens.container).forEach(([key, value]) => {
    lines.push(`  --container-${key}: ${value};`);
  });

  // Radius
  Object.entries(tokens.radius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });

  // Shadows (simplified)
  Object.entries(tokens.shadow).forEach(([key, value]) => {
    if (typeof value === 'string') {
      lines.push(`  --shadow-${key}: ${value};`);
    }
  });

  // Gradients
  Object.entries(tokens.gradient).forEach(([key, value]) => {
    lines.push(`  --grad-${key}: ${value};`);
  });

  // Glass
  Object.entries(tokens.glass).forEach(([key, value]) => {
    if (typeof value === 'string') {
      lines.push(`  --glass-${key}: ${value};`);
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        lines.push(`  --glass-gold-${subKey}: ${subValue};`);
      });
    }
  });

  // Breakpoints
  Object.entries(tokens.breakpoint).forEach(([key, value]) => {
    lines.push(`  --bp-${key}: ${value};`);
  });

  // Z-index
  Object.entries(tokens.zIndex).forEach(([key, value]) => {
    lines.push(`  --z-${key}: ${value};`);
  });

  // Motion
  Object.entries(tokens.motion.easing).forEach(([key, value]) => {
    lines.push(`  --ease-${key}: ${value};`);
  });
  Object.entries(tokens.motion.duration).forEach(([key, value]) => {
    lines.push(`  --dur-${key}: ${value};`);
  });

  // Orb
  Object.entries(tokens.orb.size).forEach(([key, value]) => {
    lines.push(`  --orb-size-${key}: ${value};`);
  });
  Object.entries(tokens.orb.glowRadius).forEach(([key, value]) => {
    lines.push(`  --orb-glow-radius-${key}: ${value};`);
  });
  lines.push(`  --orb-layer-count: ${tokens.orb.layerCount};`);
  lines.push(`  --orb-particle-count: ${tokens.orb.particleCount};`);

  lines.push('}');
  return lines.join('\n');
}

export default tokens;