import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import CinematicIntro from "@/components/CinematicIntro";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const LandingPage = lazy(() => import("@/pages/ConsciousOSLandingPage"));

const INTRO_SEEN_KEY = "satyug-app_intro_seen";

const Index = () => {
  const alreadySeen = localStorage.getItem(INTRO_SEEN_KEY) === "true";
  const [showIntro, setShowIntro] = useState(!alreadySeen);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  useForceDarkMode();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/app", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/app", { replace: true });
      } else {
        setChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleIntroComplete = () => {
    localStorage.setItem(INTRO_SEEN_KEY, "true");
    setShowIntro(false);
  };

  if (checking) return null;

  return (
    <div className="bg-background min-h-screen">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <CinematicIntro key="intro" onComplete={handleIntroComplete} />
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <Suspense fallback={null}>
              <LandingPage />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
