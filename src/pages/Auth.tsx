import AuthScreen from "@/components/AuthScreen";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import Seo from "@/components/seo/Seo";
import { prefetchCinematicImages } from "@/lib/prefetchImages";

// Prefetch cinematic backdrops the moment Auth module loads — by the time the user
// signs in, the prologue/intro images are already in cache.
if (typeof window !== "undefined") prefetchCinematicImages();

const Auth = () => {
  useForceDarkMode();
  return (
    <>
      <Seo
        title="Sign in to ConsciousOS — Free Account"
        description="Sign in or create your free ConsciousOS account. Talk to 60+ AI masters, journal with loop detection, and begin your 500-day journey."
        canonicalPath="/auth"
      />
      <AuthScreen />
    </>
  );
};

export default Auth;
