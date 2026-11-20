import HeroSection from "@/components/landing/HeroSection";
import EmbeddedLandingHtml from "@/components/landing/EmbeddedLandingHtml";
import JoinSection from "@/components/landing/JoinSection";
import PricingSection from "@/components/landing/PricingSection";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingNavbar from "@/components/landing/LandingNavbar";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

export default function ConsciousOSLandingPage() {
  useForceDarkMode();
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Seo
        title="ConsciousOS Beta — A companion for becoming"
        description="ConsciousOS Beta — an AI companion for consciousness. Enter the app, observe, understand, and transform with 11 bands, 600+ loops, 89 masters, and four paths of yoga."
        canonicalPath="/"
        keywords="consciousness beta, meditation, AI guide, journaling, self-awareness, yoga, inner work, mental loops, spiritual practice"
      />
      <LandingNavbar />
      <main>
        <HeroSection />
        <EmbeddedLandingHtml />
        <PricingSection />
        <JoinSection />
      </main>
      <LandingFooter />
    </div>
  );
}