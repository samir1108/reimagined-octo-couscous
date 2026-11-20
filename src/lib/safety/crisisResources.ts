/**
 * Region-aware crisis resources.
 *
 * The Emergency Sanctuary must never show a US-only hotline to a user in India
 * or the EU. Detection uses the browser locale first (most reliable for the
 * user's own choice of language) and falls back to the IANA timezone country.
 */

export interface CrisisResource {
  name: string;
  contact: string;
  description: string;
  href?: string;
}

export interface CrisisRegion {
  id: string;
  label: string;
  emergency: string;
  resources: CrisisResource[];
}

export const CRISIS_REGIONS: CrisisRegion[] = [
  {
    id: "IN",
    label: "India",
    emergency: "112",
    resources: [
      {
        name: "Tele-MANAS",
        contact: "14416",
        description: "24/7 national mental health helpline, 20+ languages",
        href: "https://telemanas.mohfw.gov.in",
      },
      {
        name: "KIRAN Helpline",
        contact: "1800-599-0019",
        description: "24/7 toll-free mental health support",
        href: "https://www.mohfw.gov.in",
      },
    ],
  },
  {
    id: "US",
    label: "United States",
    emergency: "911",
    resources: [
      {
        name: "988 Suicide & Crisis Lifeline",
        contact: "Call or text 988",
        description: "24/7, free, confidential support",
        href: "https://988lifeline.org",
      },
      {
        name: "Crisis Text Line",
        contact: "Text HOME to 741741",
        description: "Free crisis counseling via text",
        href: "https://www.crisistextline.org",
      },
    ],
  },
  {
    id: "GB",
    label: "United Kingdom",
    emergency: "999",
    resources: [
      {
        name: "Samaritans",
        contact: "116 123",
        description: "24/7, free, confidential listening",
        href: "https://www.samaritans.org",
      },
      {
        name: "Shout",
        contact: "Text SHOUT to 85258",
        description: "24/7 text support for anyone in crisis",
        href: "https://giveusashout.org",
      },
    ],
  },
  {
    id: "CA",
    label: "Canada",
    emergency: "911",
    resources: [
      {
        name: "9-8-8 Suicide Crisis Helpline",
        contact: "Call or text 988",
        description: "24/7, bilingual support",
        href: "https://988.ca",
      },
    ],
  },
  {
    id: "AU",
    label: "Australia",
    emergency: "000",
    resources: [
      {
        name: "Lifeline Australia",
        contact: "13 11 14",
        description: "24/7 crisis support and suicide prevention",
        href: "https://www.lifeline.org.au",
      },
      {
        name: "Beyond Blue",
        contact: "1300 22 4636",
        description: "24/7 mental health support",
        href: "https://www.beyondblue.org.au",
      },
    ],
  },
  {
    id: "EU",
    label: "Europe",
    emergency: "112",
    resources: [
      {
        name: "EU Emergency Number",
        contact: "112",
        description: "Immediate danger, any EU country",
      },
      {
        name: "Telefonseelsorge (DE)",
        contact: "0800 111 0 111",
        description: "24/7 German-language listening",
        href: "https://www.telefonseelsorge.de",
      },
      {
        name: "3114 (FR)",
        contact: "3114",
        description: "24/7 French national suicide prevention line",
        href: "https://3114.fr",
      },
    ],
  },
];

const GLOBAL_FALLBACK: CrisisResource[] = [
  {
    name: "Find A Helpline",
    contact: "findahelpline.com",
    description: "Free, confidential crisis lines in 130+ countries",
    href: "https://findahelpline.com",
  },
  {
    name: "Befrienders Worldwide",
    contact: "befrienders.org",
    description: "Emotional support centres worldwide",
    href: "https://www.befrienders.org",
  },
];

const COUNTRY_TO_REGION: Record<string, string> = {
  IN: "IN",
  US: "US",
  GB: "GB",
  UK: "GB",
  CA: "CA",
  AU: "AU",
  NZ: "AU",
  IE: "GB",
  DE: "EU",
  FR: "EU",
  ES: "EU",
  IT: "EU",
  NL: "EU",
  BE: "EU",
  AT: "EU",
  CH: "EU",
  PT: "EU",
  SE: "EU",
  NO: "EU",
  DK: "EU",
  FI: "EU",
  PL: "EU",
};

/** Maps an IANA timezone to a region id when the locale is unavailable. */
const TIMEZONE_PREFIX_TO_REGION: Array<[string, string]> = [
  ["Asia/Kolkata", "IN"],
  ["Asia/Calcutta", "IN"],
  ["America/", "US"],
  ["US/", "US"],
  ["Europe/London", "GB"],
  ["Europe/", "EU"],
  ["Australia/", "AU"],
  ["Pacific/Auckland", "AU"],
  ["Canada/", "CA"],
];

function regionFromLocale(locale: string): string | null {
  const match = /^[a-z]{2,3}[-_]([A-Z]{2})$/i.exec(locale);
  if (!match) return null;
  return COUNTRY_TO_REGION[match[1].toUpperCase()] ?? null;
}

function regionFromTimeZone(timeZone: string): string | null {
  for (const [prefix, region] of TIMEZONE_PREFIX_TO_REGION) {
    if (timeZone.startsWith(prefix)) return region;
  }
  return null;
}

export function detectCrisisRegion(
  locale?: string,
  timeZone?: string,
): CrisisRegion | null {
  const resolvedLocale =
    locale ||
    (typeof navigator !== "undefined" ? navigator.language : "") ||
    "";
  const resolvedZone =
    timeZone ||
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "");

  const regionId =
    regionFromLocale(resolvedLocale) || regionFromTimeZone(resolvedZone);

  return regionId
    ? CRISIS_REGIONS.find((r) => r.id === regionId) ?? null
    : null;
}

export interface CrisisResourceBundle {
  region: CrisisRegion | null;
  emergency: string;
  resources: CrisisResource[];
  global: CrisisResource[];
}

/**
 * Returns the regional hotlines plus a global fallback. When no region can be
 * detected the bundle still contains usable worldwide resources.
 */
export function getCrisisResources(
  locale?: string,
  timeZone?: string,
): CrisisResourceBundle {
  const region = detectCrisisRegion(locale, timeZone);
  return {
    region,
    emergency: region?.emergency ?? "112",
    resources: region?.resources ?? [],
    global: GLOBAL_FALLBACK,
  };
}
