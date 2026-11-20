/**
 * Example: Migrating Showroom.tsx from Vite imports to CDN media loader
 *
 * BEFORE (bundled, increases JS bundle size):
 * -------------------------------------------
 * import observationImg from "@/assets/maps/observation.jpg";
 * import heroVideo from "@/assets/videos/hero-meditate-sage.mp4.asset.json";
 * import heroVideoAlt from "@/assets/videos/hero-temple-sunrise.mp4.asset.json";
 * ...
 * <LazyVideo src={heroVideo.url} poster={heroVideoAlt.url} />
 *
 * AFTER (CDN, lazy-loaded, small bundle):
 * ----------------------------------------
 * import { getVideoUrl, getImageUrl } from "@/lib/media";
 * import LazyVideoCDN from "@/components/LazyVideoCDN";
 *
 * const heroVideoKey = "videos/hero-meditate-sage.mp4";
 * const heroVideoAltKey = "videos/hero-temple-sunrise.mp4";
 *
 * <LazyVideoCDN videoKey={heroVideoKey} posterKey={heroVideoAltKey} />
 */

// Example usage in Showroom.tsx:

/*
// Replace all these imports:
import observationImg from "@/assets/maps/observation.jpg";
import selfInquiryImg from "@/assets/maps/self-inquiry.jpg";
import netiNetiImg from "@/assets/maps/neti-neti.jpg";
import pranayamaImg from "@/assets/maps/pranayama.jpg";
import heroVideo from "@/assets/videos/hero-meditate-sage.mp4.asset.json";
import heroVideoAlt from "@/assets/videos/hero-temple-sunrise.mp4.asset.json";
import bridgesVideo from "@/assets/videos/hero-neural-light.mp4.asset.json";
import essaysVideo from "@/assets/videos/hero-banyan-tree.mp4.asset.json";
import gamesCtaVid from "@/assets/showroom/games-cta.mp4.asset.json";
import practicesCtaVid from "@/assets/showroom/practices-cta.mp4.asset.json";
import essayReligionVid from "@/assets/showroom/essay-religion.mp4.asset.json";
import essayWitnessVid from "@/assets/showroom/essay-witness.mp4.asset.json";
import essayNinetyVid from "@/assets/showroom/essay-ninety-days.mp4.asset.json";
import wisdomDeckVid from "@/assets/showroom/wisdom-deck.mp4.asset.json";

// With:
import { getImageUrl, getVideoUrl } from "@/lib/media";
import LazyVideoCDN from "@/components/LazyVideoCDN";

const MEDIA_KEYS = {
  // Images
  observationImg: "maps/observation.jpg",
  selfInquiryImg: "maps/self-inquiry.jpg",
  netiNetiImg: "maps/neti-neti.jpg",
  pranayamaImg: "maps/pranayama.jpg",

  // Videos (from content/ directory)
  heroVideo: "content/wave0/clips/R001-hero-meditate-sage.mp4",
  heroVideoAlt: "content/wave0/clips/R001-hero-temple-sunrise.mp4",
  bridgesVideo: "content/wave0/clips/R001-bridges.mp4",
  essaysVideo: "content/wave0/clips/R001-essays.mp4",
  gamesCtaVid: "content/wave0/clips/R001-games-cta.mp4",
  practicesCtaVid: "content/wave0/clips/R001-practices-cta.mp4",
  essayReligionVid: "content/wave0/clips/R001-essay-religion.mp4",
  essayWitnessVid: "content/wave0/clips/R001-essay-witness.mp4",
  essayNinetyVid: "content/wave0/clips/R001-essay-ninety.mp4",
  wisdomDeckVid: "content/wave0/clips/R001-wisdom-deck.mp4",
} as const;

// In component:
<LazyVideoCDN
  videoKey={MEDIA_KEYS.heroVideo}
  posterKey={MEDIA_KEYS.heroVideoAlt}
  className="absolute inset-0 w-full h-full object-cover"
/>

// For static images in data objects:
const INNER_PATHS = [
  {
    image: getImageUrl(MEDIA_KEYS.observationImg, { width: 400, height: 300, quality: 80 }),
    ...
  }
]
*/

// ============================================================
// MIGRATION CHECKLIST
// ============================================================
/*
1. Run upload script:
   export SUPABASE_SERVICE_ROLE_KEY="your-key"
   node upload-all-media.mjs

2. Generate manifest:
   node generate-media-manifest.mjs

3. Deploy manifest to Supabase Storage as public/asset-manifest.json
   OR ensure public/asset-manifest.json is in your build output

4. Update components:
   - Replace Vite imports with media key constants
   - Use LazyVideoCDN for videos with intersection observer
   - Use getImageUrl() with width/height/quality for responsive images
   - Use <img loading="lazy" src={getImageUrl(key)} /> for simple images

5. Verify:
   - Check Network tab: no large media in initial JS bundle
   - Videos load only when scrolled into view
   - Images use Supabase image transformation (width/height/quality params)
   - Fallback gradients work when media fails
*/

// ============================================================
// IMAGE MIGRATION EXAMPLE (Launch.tsx)
// ============================================================
/*
// BEFORE:
import overtureAsset from "@/assets/films/overture.mp4.asset.json";
import mastersAsset from "@/assets/films/masters.mp4.asset.json";
import loopsAsset from "@/assets/films/loops.mp4.asset.json";
import p1 from "@/assets/founder/samir/portraits/samir-portrait-01.jpg.asset.json";
// ... 5 portrait imports

// AFTER:
import { getVideoUrl, getImageUrl } from "@/lib/media";

const FILM_KEYS = {
  overture: "content/wave0/clips/overture.mp4",
  masters: "content/wave0/clips/masters.mp4",
  loops: "content/wave0/clips/loops.mp4",
};

const PORTRAIT_KEYS = [
  "founder/samir/portraits/samir-portrait-01.jpg",
  "founder/samir/portraits/samir-portrait-02.jpg",
  "founder/samir/portraits/samir-portrait-03.jpg",
  "founder/samir/portraits/samir-portrait-04.jpg",
  "founder/samir/portraits/samir-portrait-05.jpg",
];

// Usage:
<video src={getVideoUrl(FILM_KEYS.overture)} poster={getImageUrl(PORTRAIT_KEYS[0])} />
<img src={getImageUrl(PORTRAIT_KEYS[0], { width: 300, quality: 85 })} loading="lazy" />
*/