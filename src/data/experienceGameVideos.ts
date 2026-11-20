/**
 * Registry of unique cinematic 5s loops per Experience game.
 * Cards on /experience/games look up their hero video here.
 */
import breathTemple from "@/assets/games/videos/breath-temple.mp4.asset.json";
import witness from "@/assets/games/videos/witness.mp4.asset.json";
import thePause from "@/assets/games/videos/the-pause.mp4.asset.json";
import theSigh from "@/assets/games/videos/the-sigh.mp4.asset.json";
import threeBrains from "@/assets/games/videos/three-brains.mp4.asset.json";
import whoIsThinking from "@/assets/games/videos/who-is-thinking.mp4.asset.json";
import karmaCoin from "@/assets/games/videos/karma-coin.mp4.asset.json";
import ninthDharana from "@/assets/games/videos/ninth-dharana.mp4.asset.json";
import lastBreath from "@/assets/games/videos/last-breath.mp4.asset.json";
import mirrorRealm from "@/assets/games/videos/mirror-realm.mp4.asset.json";
import bodyScanner from "@/assets/games/videos/body-scanner.mp4.asset.json";
import silentMountain from "@/assets/games/videos/silent-mountain.mp4.asset.json";
import nameTheStorm from "@/assets/games/videos/name-the-storm.mp4.asset.json";
import netiNeti from "@/assets/games/videos/neti-neti.mp4.asset.json";
import tonglen from "@/assets/games/videos/tonglen.mp4.asset.json";

export const EXPERIENCE_GAME_VIDEO_BY_ID: Record<string, string> = {
  "breath-temple": breathTemple.url,
  "thought-watcher": witness.url,
  "the-pause": thePause.url,
  "the-sigh": theSigh.url,
  "three-brains-speak": threeBrains.url,
  "who-is-thinking": whoIsThinking.url,
  "karma-coin": karmaCoin.url,
  "ninth-dharana": ninthDharana.url,
  "last-breath": lastBreath.url,
  "mirror-realm": mirrorRealm.url,
  "body-scanner": bodyScanner.url,
  "silent-mountain": silentMountain.url,
  "name-the-emotion": nameTheStorm.url,
  "neti-neti": netiNeti.url,
  "tonglen": tonglen.url,
};

export const getExperienceGameVideo = (id: string): string | undefined =>
  EXPERIENCE_GAME_VIDEO_BY_ID[id];
