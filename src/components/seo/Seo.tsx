import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const FALLBACK_SITE_URL = "https://consciousos.app";

/**
 * Canonical origin. VITE_SITE_URL wins; otherwise use the live host, except on
 * localhost and preview deployments (*.vercel.app) where the real origin would
 * poison canonicals. Those fall back to the production domain, which is also
 * what scripts/seo/generate.mjs bakes into the static HTML and sitemap.
 */
function resolveSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  if (typeof window === "undefined") return FALLBACK_SITE_URL;
  const { hostname, origin } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app")) {
    return FALLBACK_SITE_URL;
  }
  return origin;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "ConsciousOS";
export const SITE_FULL_NAME = "ConsciousOS — Yogic Companion";
export const SITE_TAGLINE = "Yogic Companion";
export const DEFAULT_OG_IMAGE = import.meta.env.VITE_OG_IMAGE || "/og-image.png";

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

interface SeoProps {
  title: string;
  description: string;
  /** Path-only canonical (e.g. "/auth"). Defaults to current location. */
  canonicalPath?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
  jsonLd?: JsonLd;
  keywords?: string;
}

/**
 * Per-route SEO head: title, description, canonical, Open Graph,
 * Twitter cards, optional JSON-LD. Mount once per page.
 */
const Seo = ({
  title,
  description,
  canonicalPath,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
  keywords,
}: SeoProps) => {
  const location = useLocation();
  const path = canonicalPath ?? location.pathname;
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;
  const fullTitle = title.length > 60 ? title.slice(0, 57) + "…" : title;
  const desc = description.length > 160 ? description.slice(0, 157) + "…" : description;

  const ldArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@consciousos" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {ldArray.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
