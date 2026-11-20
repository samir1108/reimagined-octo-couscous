import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "./Seo";

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ConsciousOS",
  alternateName: ["ConsciousOS", "ConsciousOS App"],
  url: SITE_URL,
  logo: `${SITE_URL}/pwa-icon-512.png`,
  sameAs: ["https://twitter.com/consciousos"],
  description:
    "ConsciousOS is an AI-powered companion for becoming — it maps your consciousness journey and guides you through sessions, practices, programs, journaling, and self-inquiry.",
};

export const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ConsciousOS",
  url: SITE_URL,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web, iOS, Android",
  image: DEFAULT_OG_IMAGE,
  description:
    "A companion for becoming. ConsciousOS maps your consciousness journey and guides you through sessions, practices, programs, journaling, and self-inquiry.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is ConsciousOS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ConsciousOS is an AI-powered companion for becoming — it maps your consciousness journey and guides you through sessions, practices, programs, journaling, and self-inquiry.",
      },
    },
    {
      "@type": "Question",
      name: "How does ConsciousOS detect mental loops?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our Consciousness Engine analyzes your journals, conversations and check-ins against a library of 400+ behavioral loops across 20 categories, surfacing recurring patterns and offering tailored practices to break them.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All journal entries, sessions and reflections are encrypted in transit and at rest, scoped to your account with row-level security, and never used to train external models.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to pay to start?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. You can start with a free Mirror Session and a generous free tier. Paid credits unlock deeper AI conversations, longer journeys and advanced analytics.",
      },
    },
    {
      "@type": "Question",
      name: "Which masters can I talk to?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "60+ AI guides modeled on traditions including Classical Yoga, Kriya, Vedanta, Zen, Sufism, Stoicism, modern psychology and contemporary teachers.",
      },
    },
  ],
};

export const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to start your consciousness journey on ConsciousOS",
  description:
    "A simple onboarding flow to begin daily practice, journaling and loop detection inside ConsciousOS.",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Create your account",
      text: "Sign up free with email or Google to unlock your personal space and AI guides.",
      url: `${SITE_URL}/auth`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Take the Mirror Session",
      text: "A short cinematic AI assessment maps your starting Identity Band and active loops.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Choose your master",
      text: "Pick a guide from 60+ traditions; they'll lead daily 30-minute sessions tailored to you.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Practice daily across 4 gates",
      text: "Morning awakening, midday practice, evening reflection and night integration build your spiral journey.",
    },
  ],
};

export const breadcrumbLd = (items: Array<{ name: string; path: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: `${SITE_URL}${it.path}`,
  })),
});
