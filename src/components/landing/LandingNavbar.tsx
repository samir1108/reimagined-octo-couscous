import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BrandLotus from "@/components/BrandLotus";
import { BrandName } from "@/components/BrandName";
import LanguageMenuButton from "@/components/language/LanguageMenuButton";
import LandingTabBar from "@/components/landing/LandingTabBar";

const LandingNavbar = () => {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-background/70 backdrop-blur-xl border-b border-border/30"
      initial={{ y: -120 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between px-6 md:px-8 py-4">
        <div className="flex items-center gap-2.5">
          <BrandLotus size={28} />
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            <BrandName />
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <LanguageMenuButton />
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Beta</span>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-sunrise px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground hover:opacity-95 transition"
          >
            Go to App
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>

      <LandingTabBar />
    </motion.nav>
  );
};

export default LandingNavbar;
