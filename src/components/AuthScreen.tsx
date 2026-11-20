import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import BrandLotus from "@/components/BrandLotus";
import { BrandName } from "@/components/BrandName";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useLandingVideoPlaylist } from "@/hooks/useLandingVideoPlaylist";

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { src: videoSrc, handleEnded } = useLandingVideoPlaylist();
  const navigate = useNavigate();

  useEffect(() => {
    const FOUNDER_EMAIL = "samirsourav7@gmail.com";
    const routeFor = (session: { user?: { email?: string } } | null) =>
      session?.user?.email?.toLowerCase() === FOUNDER_EMAIL ? "/admin" : "/app";

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate(routeFor(session), { replace: true });
      } else {
        setCheckingSession(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(routeFor(session), { replace: true });
      } else {
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Autoplay with sound is blocked until user interaction — fall back to muted.
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    }
  }, [muted, videoSrc]);

  if (checkingSession) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center atmosphere-amber-soft">
        <BrandLotus size={48} className="animate-pulse text-primary" />
      </div>
    );
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) setError(error.message);
      else setError("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth",
      },
    });
    if (error) {
      setError(error.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Full-screen background film — plays each film full length, then the next, then repeats */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        playsInline
        muted={muted}
        src={videoSrc}
        onEnded={handleEnded}
      />

      {/* Readability overlays */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/85" />

      {/* Mute / unmute */}
      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-colors"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
          </svg>
        )}
      </button>

      {/* Centered auth card */}
      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <BrandLotus size={40} animate />
            <span className="font-display text-2xl font-semibold tracking-tight text-white">
              <BrandName />
            </span>
          </div>

          {/* Card */}
          <div className="premium-sheen rounded-[1.75rem] border border-white/12 bg-black/45 p-8 shadow-[var(--elev-4)] backdrop-blur-2xl">
            <h2 className="font-editorial text-3xl lg:text-4xl font-medium tracking-[-0.02em] text-white text-center mb-2">
              {isSignUp ? "Begin Your Journey" : "Welcome Back"}
            </h2>
            <p className="text-sm text-white/65 text-center mb-8 font-body leading-relaxed">
              {isSignUp
                ? "Create your account to enter the experience"
                : "Sign in to continue your evolution"}
            </p>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                         border border-white/20 bg-white/10 text-white font-body text-sm
                         hover:border-white/40 hover:bg-white/15 transition-all disabled:opacity-50 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--gold-300)/0.35),transparent)]" />
              <span className="text-xs text-white/60 font-body uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--gold-300)/0.35),transparent)]" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white
                               placeholder:text-white/50 font-body text-sm
                               focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-all"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white
                             placeholder:text-white/50 font-body text-sm
                             focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white
                             placeholder:text-white/50 font-body text-sm
                             focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>

              {error && (
                <p className="text-sm font-body text-center text-amber-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-sunrise text-primary-foreground font-display font-medium
                           text-sm tracking-wide hover:scale-[1.02] transition-all glow-sunrise disabled:opacity-50"
              >
                {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>

            {/* Toggle */}
            <p className="text-sm text-white/70 text-center mt-6 font-body">
              {isSignUp ? "Already on the path?" : "New to ConsciousOS?"}{" "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                className="text-amber-300 hover:underline font-medium"
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </button>
            </p>

            {/* Back button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mt-4 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthScreen;