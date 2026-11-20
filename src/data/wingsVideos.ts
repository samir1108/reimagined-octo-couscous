/**
 * Registry for Wave 4 videos: handbooks, inner paths, and deeper wings.
 */
import onion from "@/assets/handbooks/videos/the-onion.mp4.asset.json";
import bands from "@/assets/handbooks/videos/the-11-bands.mp4.asset.json";
import thoughtWorld from "@/assets/handbooks/videos/the-thought-world.mp4.asset.json";
import threeBrains from "@/assets/handbooks/videos/the-three-brains.mp4.asset.json";
import fourPaths from "@/assets/handbooks/videos/the-four-paths-of-yoga.mp4.asset.json";
import nervousSystem from "@/assets/handbooks/videos/the-nervous-system.mp4.asset.json";
import scienceMeetsYoga from "@/assets/handbooks/videos/science-meets-yoga.mp4.asset.json";

import observation from "@/assets/inner-paths/videos/observation.mp4.asset.json";
import selfInquiry from "@/assets/inner-paths/videos/self-inquiry.mp4.asset.json";
import netiNeti from "@/assets/inner-paths/videos/neti-neti.mp4.asset.json";
import pranayama from "@/assets/inner-paths/videos/pranayama.mp4.asset.json";

import lineage from "@/assets/wings/videos/lineage-tree.mp4.asset.json";
import glossary from "@/assets/wings/videos/living-glossary.mp4.asset.json";
import prereqs from "@/assets/wings/videos/prerequisites-map.mp4.asset.json";
import loopsAtlas from "@/assets/wings/videos/loops-atlas.mp4.asset.json";
import bridges from "@/assets/wings/videos/bridges.mp4.asset.json";

export const HANDBOOK_VIDEO_BY_SLUG: Record<string, string> = {
  "the-onion": onion.url,
  "the-11-bands": bands.url,
  "the-thought-world": thoughtWorld.url,
  "the-three-brains": threeBrains.url,
  "the-four-paths-of-yoga": fourPaths.url,
  "the-nervous-system": nervousSystem.url,
  "science-meets-yoga": scienceMeetsYoga.url,
};

export const INNER_PATH_VIDEO_BY_SLUG: Record<string, string> = {
  observation: observation.url,
  "self-inquiry": selfInquiry.url,
  "neti-neti": netiNeti.url,
  pranayama: pranayama.url,
};

export const WING_VIDEO_BY_HREF: Record<string, string> = {
  "/experience/lineage": lineage.url,
  "/experience/glossary": glossary.url,
  "/experience/prerequisites": prereqs.url,
  "/experience/loops-atlas": loopsAtlas.url,
  "/experience/bridges": bridges.url,
};

export const getHandbookVideo = (slug: string) => HANDBOOK_VIDEO_BY_SLUG[slug];
export const getInnerPathVideo = (slug: string) => INNER_PATH_VIDEO_BY_SLUG[slug];
export const getWingVideo = (href: string) => WING_VIDEO_BY_HREF[href];