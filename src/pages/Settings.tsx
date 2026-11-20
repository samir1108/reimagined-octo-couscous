import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pause, Play, LogOut, Moon, Sun, Volume2, VolumeX, User, Target, Trophy, Globe, Coins, BookOpen, X, Scan, Zap, Trees } from "lucide-react";
import { PRACTICE_EXTRAS_KEY, type PracticeExtras } from "@/components/onboarding/LifestylePersonalization";
import { Button } from "@/design-system";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { useSound } from "@/contexts/SoundContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { consciousFromError } from "@/lib/consciousToast";
import { playSoundEffect } from "@/lib/soundEffects";
import { useMachine } from "@xstate/react";
import { settingsMachine } from "@/machines/settingsMachine";
import TaskDomainsPicker from "@/components/settings/TaskDomainsPicker";
import DailyRhythmPicker from "@/components/settings/DailyRhythmPicker";
import BreakthroughsHistory from "@/components/settings/BreakthroughsHistory";
import LanguagePicker from "@/components/settings/LanguagePicker";
import AiModePicker from "@/components/settings/AiModePicker";
import BirthChartSettings from "@/components/settings/BirthChartSettings";
import BirthInsightsOptOut from "@/components/settings/BirthInsightsOptOut";
import DailyRhythmSettings from "@/components/settings/DailyRhythmSettings";
import DayPlanSettings from "@/components/settings/DayPlanSettings";
import RecalibrationStatus from "@/components/settings/RecalibrationStatus";
import FutureLetterRequest from "@/components/settings/FutureLetterRequest";
import NotificationHistory from "@/components/settings/NotificationHistory";
import GoalsSettingsCard from "@/components/settings/GoalsSettingsCard";
import PersonalizationSettingsSection from "@/components/settings/PersonalizationSettingsSection";
import FoundationCourseSettings from "@/components/settings/FoundationCourseSettings";
import { NudgeSettingsCard } from "@/components/settings/NudgeSettingsCard";
import { useCredits } from "@/hooks/useCredits";
import { useActiveEnrollment, useLeaveProgram } from "@/hooks/usePrograms";
import { getProgramById } from "@/data/programs";

// ═══════════════════════════════════════════
// SERVER STATE — TanStack Query
// ═══════════════════════════════════════════

function useSettingsProfile() {
  return useQuery({
    queryKey: ["settings-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [profileRes, consciousnessRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_consciousness_profile")
          .select("paused_at, pause_reason, journey_day, streak_current, streak_longest, total_sessions, total_journal_entries")
          .eq("user_id", user.id)
          .single(),
      ]);

      return {
        user,
        profile: profileRes.data,
        consciousness: consciousnessRes.data as any,
      };
    },
  });
}

function usePauseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const pausedAt = new Date().toISOString();
      const { error } = await supabase
        .from("user_consciousness_profile")
        .update({ paused_at: pausedAt, pause_reason: "Taking a break" } as any)
        .eq("user_id", user.id);
      if (error) throw error;
      return pausedAt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-profile"] });
    },
  });
}

function useResumeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_consciousness_profile")
        .update({ paused_at: null, pause_reason: null } as any)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-profile"] });
    },
  });
}

// ═══════════════════════════════════════════
// TOGGLE COMPONENT
// ═══════════════════════════════════════════

function SettingsToggle({ enabled, onToggle, icon: Icon, label }: {
  enabled: boolean;
  onToggle: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-body text-foreground">{label}</span>
      </div>
      <motion.button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-background shadow-sm absolute top-0.5"
          animate={{ left: enabled ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </motion.button>
    </div>
  );
}

function LiveDetectionToggle() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem("live-detection-enabled") !== "false");
  return (
    <SettingsToggle
      enabled={enabled}
      onToggle={() => {
        const next = !enabled;
        setEnabled(next);
        localStorage.setItem("live-detection-enabled", next ? "true" : "false");
      }}
      icon={Scan}
      label="Live Loop & Source Detection"
    />
  );
}

function PracticeExtrasToggles() {
  const [extras, setExtras] = useState<PracticeExtras>(() => {
    try {
      const raw = localStorage.getItem(PRACTICE_EXTRAS_KEY);
      if (raw) return { micro_practices: false, off_app_tasks: false, ...JSON.parse(raw) };
    } catch {}
    return { micro_practices: false, off_app_tasks: false };
  });
  const update = (patch: Partial<PracticeExtras>) => {
    setExtras((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(PRACTICE_EXTRAS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  return (
    <>
      <SettingsToggle
        enabled={extras.off_app_tasks}
        onToggle={() => update({ off_app_tasks: !extras.off_app_tasks })}
        icon={Trees}
        label="Off-app real-world tasks"
      />
    </>
  );
}

// SETTINGS PAGE
// ═══════════════════════════════════════════

export default function Settings() {
  const navigate = useNavigate();
  const { mode, setMode } = useTheme();
  const { soundEnabled, toggleSound } = useSound();
  const { data } = useSettingsProfile();
  const profile = (data as { profile?: { theme_preference?: string | null } } | null | undefined)?.profile;
  const queryClient = useQueryClient();
  const { data: credits } = useCredits();
  const { data: activeEnrollment } = useActiveEnrollment();
  const activeProgram = activeEnrollment ? getProgramById(activeEnrollment.program_id) : null;
  const leaveProgramMutation = useLeaveProgram();

  const [state, send] = useMachine(settingsMachine);

  const pauseMutation = usePauseMutation();
  const resumeMutation = useResumeMutation();

  // Sync server state → machine
  useEffect(() => {
    if (data?.consciousness) {
      send({
        type: "PROFILE_LOADED",
        isPaused: !!data.consciousness.paused_at,
        pausedAt: data.consciousness.paused_at || null,
        pauseReason: data.consciousness.pause_reason || null,
      });
    }
  }, [data?.consciousness, send]);

  // Handle pause via machine + mutation
  const handlePause = async () => {
    send({ type: "PAUSE" });
    try {
      const pausedAt = await pauseMutation.mutateAsync();
      send({ type: "PAUSE_SUCCESS", pausedAt });
      playSoundEffect("success");
      toast({ title: "Journey paused 🌙", description: "Your streak and progress are safe." });
    } catch (e) {
      send({ type: "MUTATION_ERROR", error: "Failed to pause" });
      consciousFromError(e, "actionMissed");
    }
  };

  // Handle resume via machine + mutation
  const handleResume = async () => {
    send({ type: "RESUME" });
    try {
      await resumeMutation.mutateAsync();
      send({ type: "RESUME_SUCCESS" });
      playSoundEffect("success");
      toast({ title: "Welcome back! 🌅", description: "Your journey continues." });
    } catch (e) {
      send({ type: "MUTATION_ERROR", error: "Failed to resume" });
      consciousFromError(e, "actionMissed");
    }
  };

  const handleSignOut = async () => {
    send({ type: "SIGN_OUT" });
    await supabase.auth.signOut();
    send({ type: "SIGN_OUT_COMPLETE" });
    navigate("/");
  };

  const { isPaused, pauseDays } = state.context;
  const isMutating = state.matches("pausing") || state.matches("resuming");

  return (
      <div className="max-w-2xl mx-auto space-y-6 lg:max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground font-body">Manage your journey preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        className="glass-card rounded-2xl p-6 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl glass-subtle flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">
              {data?.profile?.display_name || data?.user?.email || "Seeker"}
            </p>
            <p className="text-xs text-muted-foreground font-body">{data?.user?.email}</p>
          </div>
        </div>

        {data?.consciousness && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "Journey Day", value: data.consciousness.journey_day || 1 },
              { label: "Streak", value: `${data.consciousness.streak_current || 0} 🔥` },
              { label: "Sessions", value: data.consciousness.total_sessions || 0 },
            ].map((stat) => (
              <div key={stat.label} className="glass-subtle rounded-xl p-3 text-center">
                <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Foundation Course card removed — it's mandatory, no need to surface in settings */}

      {/* Goals — engine prioritization */}
      <GoalsSettingsCard />

      {/* Session personalization — studio, deep profile and AI designer */}
      <PersonalizationSettingsSection />
      <motion.div
        className="glass-card rounded-2xl p-6 cursor-pointer hover:scale-[1.01] transition-transform"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={() => navigate("/app/credits")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-sm">Credits & Payments</h3>
              <p className="text-xs text-muted-foreground font-body">
                Balance: ₹{credits ? (credits.balance_paise / 100).toFixed(0) : "0"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl font-display text-xs">
            Buy Credits
          </Button>
        </div>
      </motion.div>

      {/* Active Program */}
      {activeEnrollment && activeProgram && (
        <motion.div
          className="glass-card rounded-2xl p-6 border border-primary/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${activeProgram.coverGradient} flex items-center justify-center shrink-0`}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground text-sm">Active Program</h3>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {activeProgram.title} — Day {activeEnrollment.current_day} of {activeProgram.duration}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                sonnerToast("Leave this program?", {
                  duration: 15000,
                  description:
                    "Progress will be saved, but the program will be marked as abandoned.",
                  action: {
                    label: "Leave",
                    onClick: () => leaveProgramMutation.mutate(activeEnrollment.id),
                  },
                  cancel: { label: "Stay", onClick: () => {} },
                });
              }}
              disabled={leaveProgramMutation.isPending}
              variant="outline"
              size="sm"
              className="rounded-xl font-display text-xs text-destructive border-destructive/20 hover:bg-destructive/5 shrink-0"
            >
              <X className="w-3 h-3 mr-1" />
              Leave
            </Button>
          </div>
        </motion.div>
      )}

      {/* Preferences */}
      <motion.div
        className="glass-card rounded-2xl p-6 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-display font-semibold text-foreground text-sm">Preferences</h3>

        <SettingsToggle
          enabled={mode === "dark"}
          onToggle={() => setMode(mode === "dark" ? "light" : "dark")}
          icon={mode === "dark" ? Moon : Sun}
          label="Dark Mode"
        />

        <SettingsToggle
          enabled={soundEnabled}
          onToggle={toggleSound}
          icon={soundEnabled ? Volume2 : VolumeX}
          label="Sound Effects"
        />

        <LiveDetectionToggle />
        <PracticeExtrasToggles />
      </motion.div>

      {/* Language */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.33 }}
      >
        <LanguagePicker />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
      >
        <AiModePicker />
      </motion.div>

      {/* Birth chart — add/edit anytime; saving recalibrates engines */}
      <motion.div
        className="glass-card rounded-2xl p-6 space-y-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
      >
        <BirthChartSettings />
        <div className="border-t border-border/30 pt-4">
          <BirthInsightsOptOut />
        </div>
      </motion.div>

      {/* Daily Rhythm — wake/sleep moved out of onboarding */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
      >
        <DailyRhythmSettings />
      </motion.div>

      {/* Your Day â€” timetable blocks, items and density */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
      >
        <DayPlanSettings />
      </motion.div>

      {/* Breakthroughs */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <BreakthroughsHistory />
      </motion.div>

      {/* Future Letter */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <FutureLetterRequest />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <NotificationHistory />
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={handleSignOut}
          disabled={state.matches("signingOut")}
          variant="outline"
          className="w-full rounded-2xl font-display text-destructive border-destructive/20 hover:bg-destructive/5 h-12"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
