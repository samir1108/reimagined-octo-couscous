import { THEME_TOKEN_MAP } from "../src/design-system/tokens/values";
import { THEME_METADATA } from "../src/design-system/tokens/colors";
import type { ThemeName, ThemeMode } from "../src/design-system/tokens/colors";

const REQUIRED_COLOR_KEYS = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "destructive",
  "destructiveForeground",
  "border",
  "input",
  "ring",
  "sidebarBackground",
  "sidebarForeground",
  "sidebarPrimary",
  "sidebarPrimaryForeground",
  "sidebarAccent",
  "sidebarAccentForeground",
  "sidebarBorder",
  "sidebarRing",
];

const REQUIRED_GLASS_KEYS = [
  "bg",
  "border",
  "highlight",
  "navBg",
  "subtleBg",
  "subtleBorder",
  "shadowColor",
  "skeletonFrom",
  "skeletonVia",
  "ambientOpacity",
];

const REQUIRED_SLOT_KEYS = [
  "morningSky",
  "middaySky",
  "eveningSky",
  "nightSky",
  "morningAccent",
  "middayAccent",
  "eveningAccent",
  "nightAccent",
];

const REQUIRED_SACRED_KEYS = [
  "void",
  "voidDeep",
  "sunrise",
  "golden",
  "goldenSoft",
  "goldenDeep",
  "goldLeaf",
  "goldEmber",
  "glowOrange",
  "glowGold",
];

const REQUIRED_ELEVATION_KEYS = [
  "shadowGlow",
  "shadowGlowStrong",
  "shadowGolden",
  "shadowGilt",
  "shadowCard",
  "shadowElevated",
];

const REQUIRED_GRADIENT_KEYS = [
  "sunrise",
  "void",
  "horizon",
  "goldLeaf",
  "gilt",
  "altar",
];

const REQUIRED_TYPOGRAPHY_KEYS = [
  "fontDisplay",
  "fontBody",
  "fontSacred",
  "display2xl",
  "displayXl",
  "displayLg",
  "displayMd",
  "displaySm",
  "eyebrow",
];

const REQUIRED_SPACING_KEYS = [
  "sectionSm",
  "section",
  "sectionLg",
  "sectionXl",
  "gutter",
  "gutterLg",
];

const REQUIRED_MOTION_KEYS = [
  "easeOut",
  "easeInOut",
  "spring",
  "durationFast",
  "durationNormal",
  "durationSlow",
  "durationBreath",
];

let failed = false;

for (const themeName of Object.keys(THEME_TOKEN_MAP) as ThemeName[]) {
  for (const mode of ["dark", "light"] as ThemeMode[]) {
    const tokens = THEME_TOKEN_MAP[themeName][mode];

    const checkKeys = (keys: string[], category: string, obj: Record<string, unknown>) => {
      for (const key of keys) {
        if (!(key in obj) || obj[key] === undefined || obj[key] === null || obj[key] === "") {
          console.error(`MISSING: ${themeName}.${mode}.${category}.${key}`);
          failed = true;
        }
      }
    };

    checkKeys(REQUIRED_COLOR_KEYS, "colors", tokens.colors);
    checkKeys(REQUIRED_GLASS_KEYS, "glass", tokens.glass);
    checkKeys(REQUIRED_SLOT_KEYS, "slots", tokens.slots);
    checkKeys(REQUIRED_SACRED_KEYS, "sacred", tokens.sacred);
    checkKeys(REQUIRED_ELEVATION_KEYS, "elevation", tokens.elevation);
    checkKeys(REQUIRED_GRADIENT_KEYS, "gradients", tokens.gradients);
    checkKeys(REQUIRED_TYPOGRAPHY_KEYS, "typography", tokens.typography);
    checkKeys(REQUIRED_SPACING_KEYS, "spacing", tokens.spacing);
    checkKeys(REQUIRED_MOTION_KEYS, "motion", tokens.motion);

    if (!tokens.radius || tokens.radius === "") {
      console.error(`MISSING: ${themeName}.${mode}.radius`);
      failed = true;
    }
  }
}

for (const themeName of Object.keys(THEME_METADATA) as ThemeName[]) {
  const meta = THEME_METADATA[themeName];
  if (!meta.label || !meta.emoji || !meta.color) {
    console.error(`MISSING METADATA: ${themeName}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nToken validation FAILED. See missing keys above.");
  process.exit(1);
} else {
  console.log(`Token validation PASSED: ${Object.keys(THEME_TOKEN_MAP).length} themes × 2 modes`);
  process.exit(0);
}
