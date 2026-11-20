import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import AppScrollIntro from "@/components/app-intro/AppScrollIntro";
import { SATYUG_INTRO } from "@/components/app-intro/satyugSections";
import Seo from "@/components/seo/Seo";

export default function AppIntro() {
  useForceDarkMode();
  const navigate = useNavigate();
  const enter = useCallback(() => navigate("/auth"), [navigate]);
  const explore = useCallback(() => navigate("/experience"), [navigate]);

  return (
    <>
      <Seo
        title="How HOPE works — a scroll through the app"
        description="Scroll through the screens of HOPE: the Temple, the mirror, the loops, the masters' voices. A scroll-driven tour of how every session is composed live."
        noindex
      />
      <AppScrollIntro
        {...SATYUG_INTRO}
        onEnter={enter}
        onExplore={explore}
        exploreLabel="Look around first"
      />
    </>
  );
}
