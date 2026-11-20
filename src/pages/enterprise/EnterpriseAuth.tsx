import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Building2, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BrandName } from "@/components/BrandName";

export default function EnterpriseAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has org membership
        const { data: membership } = await supabase
          .from("org_members")
          .select("org_id, role")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .maybeSingle();

        if (membership) {
          navigate("/enterprise", { replace: true });
        } else {
          navigate("/enterprise/create", { replace: true });
        }
      }
      setCheckingSession(false);
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/enterprise/auth` },
        });
        if (error) throw error;
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check org membership
        const { data: membership } = await supabase
          .from("org_members")
          .select("org_id, role")
          .eq("user_id", data.user.id)
          .eq("status", "active")
          .maybeSingle();

        if (membership) {
          navigate("/enterprise", { replace: true });
        } else {
          navigate("/enterprise/create", { replace: true });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Building2 className="w-10 h-10 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-5">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Enterprise Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display mb-2">
            {isSignUp ? "Create Enterprise Account" : "Enterprise Login"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isSignUp
              ? "Set up your organization's consciousness platform"
              : "Access your organization's dashboard"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {isSignUp ? "Already have an account?" : "New to Enterprise?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline font-medium"
          >
            {isSignUp ? "Sign in" : "Create account"}
          </button>
        </p>

        {/* Back to main */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          <a href="/" className="hover:text-foreground transition-colors">
            ← Back to <BrandName />
          </a>
        </p>
      </motion.div>
    </div>
  );
}
