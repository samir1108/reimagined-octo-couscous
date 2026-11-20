import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";
import { Loader2 } from "lucide-react";

/**
 * One-tap Google sign-in for the landing page.
 * - If already logged in → "Open App" (routes to /app).
 * - Else → Continue with Google. On success the auth listener in /auth (or
 *   the global session state) handles redirect; we send users to /app right
 *   after sign-in for a one-step flow.
 */
const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.1z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C41.1 35.9 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"/>
  </svg>
);

interface Props {
  variant?: "pill" | "block";
  className?: string;
}

const GoogleQuickAuth = ({ variant = "pill", className = "" }: Props) => {
  const navigate = useNavigate();
  const { user, isReady } = useAuthReady();
  const [loading, setLoading] = useState(false);

  if (!isReady) return null;

  if (user) {
    return (
      <button
        onClick={() => navigate("/app")}
        className={`${
          variant === "block"
            ? "w-full py-3 rounded-xl"
            : "px-5 py-2 rounded-full"
        } bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition ${className}`}
      >
        Open App →
      </button>
    );
  }

  const onGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/app",
      },
    });
    if (error) setLoading(false);
  };

  return (
    <button
      onClick={onGoogle}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 ${
        variant === "block"
          ? "w-full py-3 rounded-xl"
          : "px-4 py-2 rounded-full"
      } bg-white text-gray-800 text-sm font-medium hover:bg-white/90 transition disabled:opacity-60 shadow-sm ${className}`}
      aria-label="Continue with Google"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleQuickAuth;
