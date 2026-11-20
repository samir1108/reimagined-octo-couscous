// Faculty → painterly cover image. Used as the card hero when a game
// doesn't have its own bespoke art yet, so every flagship card has rich visuals.
import body from "@/games/assets/cover-body.jpg";
import heart from "@/games/assets/cover-heart.jpg";
import witness from "@/games/assets/cover-witness.jpg";
import ego from "@/games/assets/cover-ego.jpg";
import attention from "@/games/assets/cover-attention.jpg";
import inquiry from "@/games/assets/cover-inquiry.jpg";
import willpower from "@/games/assets/cover-willpower.jpg";
import voice from "@/games/assets/cover-voice.jpg";
import brain from "@/games/assets/cover-brain.jpg";
import stillness from "@/games/assets/cover-stillness.jpg";
import liminal from "@/games/assets/cover-liminal.jpg";
import featured from "@/games/assets/cover-featured.jpg";

import type { Faculty } from "@/games/shell/labRegistry";

export const FACULTY_COVER: Record<Faculty, string> = {
  body,
  heart,
  witness,
  ego,
  attention,
  self_inquiry: inquiry,
  willpower,
  stillness,
  voice,
  brain_head: brain,
  brain_heart: brain,
  brain_gut: brain,
  karma: liminal,
  liminal,
};

export const FEATURED_COVER = featured;

export function coverFor(faculties: Faculty[] | undefined): string {
  const f = faculties?.[0];
  return (f && FACULTY_COVER[f]) || featured;
}
