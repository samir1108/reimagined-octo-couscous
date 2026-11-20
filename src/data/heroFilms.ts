import overtureAsset from "@/assets/films/overture.mp4.asset.json";
import loopsAsset from "@/assets/films/loops.mp4.asset.json";
import sessionAsset from "@/assets/films/session.mp4.asset.json";
import mastersAsset from "@/assets/films/masters.mp4.asset.json";
import flowAsset from "@/assets/films/flow.mp4.asset.json";
import tenxAsset from "@/assets/films/tenx.mp4.asset.json";
import rareBirthAsset from "@/assets/films/rare-birth.mp4.asset.json";
import overtureVo from "@/assets/films/voice/overture.mp3.asset.json";
import loopsVo from "@/assets/films/voice/loops.mp3.asset.json";
import sessionVo from "@/assets/films/voice/session.mp3.asset.json";
import mastersVo from "@/assets/films/voice/masters.mp3.asset.json";
import flowVo from "@/assets/films/voice/flow.mp3.asset.json";
import tenxVo from "@/assets/films/voice/tenx.mp3.asset.json";
import rareBirthVo from "@/assets/films/voice/rare-birth.mp3.asset.json";

export type HeroFilm = {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  hue: string; // tailwind class for chapter card accent
  videoUrl: string | null; // null = coming soon
  voiceUrl: string | null; // pre-rendered narration mp3 (already muxed into videoUrl too)
  deepLink: string; // where the chapter card leads
};

export const HERO_FILMS: HeroFilm[] = [
  {
    id: "overture",
    index: 1,
    title: "The Overture",
    subtitle: "This is not another wellness app.",
    hue: "text-amber-300",
    videoUrl: overtureAsset.url,
    voiceUrl: overtureVo.url,
    deepLink: "/app",
  },
  {
    id: "loops",
    index: 2,
    title: "The Loops",
    subtitle: "Your life is running patterns you did not choose.",
    hue: "text-emerald-300",
    videoUrl: loopsAsset.url,
    voiceUrl: loopsVo.url,
    deepLink: "/loops",
  },
  {
    id: "session",
    index: 3,
    title: "The Session",
    subtitle: "A ten-minute room, made for you today.",
    hue: "text-rose-300",
    videoUrl: sessionAsset.url,
    voiceUrl: sessionVo.url,
    deepLink: "/app",
  },
  {
    id: "masters",
    index: 4,
    title: "The Masters",
    subtitle: "Twenty-five teachers. One room.",
    hue: "text-yellow-200",
    videoUrl: mastersAsset.url,
    voiceUrl: mastersVo.url,
    deepLink: "/experience/lineage",
  },
  {
    id: "flow-engine",
    index: 5,
    title: "The Flow Engine",
    subtitle: "The app you open tomorrow is not the app you opened today.",
    hue: "text-indigo-300",
    videoUrl: flowAsset.url,
    voiceUrl: flowVo.url,
    deepLink: "/experience/paths",
  },
  {
    id: "tenx",
    index: 6,
    title: "The 10x",
    subtitle: "Not a productivity system. A silence underneath one.",
    hue: "text-violet-300",
    videoUrl: tenxAsset.url,
    voiceUrl: tenxVo.url,
    deepLink: "/app",
  },
  {
    id: "rare-birth",
    index: 7,
    title: "The Rare Birth",
    subtitle: "Manushya yoni. Every faith points at one door.",
    hue: "text-orange-300",
    videoUrl: rareBirthAsset.url,
    voiceUrl: rareBirthVo.url,
    deepLink: "/app",
  },
];

export const HERO_MEDITATION_VIDEOS = HERO_FILMS;