/**
 * DayCompleteCard — Shown when user has completed all their selected slots for the day.
 * Adapts messaging per time pattern (Night Only, Morning Only, etc.)
 */
import { motion } from "framer-motion";
import { Check, Moon, BookOpen, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UserTimeProfile } from "@/hooks/useUserTimeProfile";
import type { TimeSlot } from "@/lib/timeSlots";
import { getCurrentTimeSlot } from "@/lib/timeSlots";
import AlwaysAvailableActions from "./AlwaysAvailableActions";

interface DayCompleteCardProps {
  userName: string;
  profile: UserTimeProfile;
  offAppPractice?: string;
  themeName?: string;
  completedSlots: TimeSlot[];
}

export default function DayCompleteCard({
  userName,
  profile,
  offAppPractice,
  themeName,
  completedSlots,
}: DayCompleteCardProps) {
  const navigate = useNavigate();
  const current = getCurrentTimeSlot();
  const totalDone = completedSlots.length;

  // Determine messaging based on pattern
  const getMessage = () => {
    if (profile.pattern === 'night_only') {
      if (current !== 'night') {
        return {
          icon: <Moon className="w-6 h-6 text-primary/60" />,
          title: "Last night's session complete",
          subtitle: `Good that you made time, ${userName}.`,
          nextTime: "See you tonight. 🙏",
        };
      }
      return {
        icon: <Check className="w-6 h-6 text-primary" />,
        title: "Tonight's practice complete",
        subtitle: "Rest well. The seeds are planted for tomorrow.",
        nextTime: "See you tomorrow night. 🙏",
      };
    }

    if (profile.pattern === 'morning_only') {
      return {
        icon: <Check className="w-6 h-6 text-primary" />,
        title: "Morning session complete",
        subtitle: `Well done, ${userName}. Today's off-app practice:`,
        nextTime: "See you tomorrow morning. 🙏",
      };
    }

    if (profile.pattern === 'morning_evening') {
      return {
        icon: <Check className="w-6 h-6 text-primary" />,
        title: "Today's practice complete",
        subtitle: `Both sessions done. Beautiful, ${userName}.`,
        nextTime: "Rest well. See you tomorrow. 🙏",
      };
    }

    if (profile.pattern === 'irregular' || profile.flexibleMode) {
      return {
        icon: <Check className="w-6 h-6 text-primary" />,
        title: "Today's session complete",
        subtitle: `You showed up, ${userName}. That's what matters.`,
        nextTime: "Come back whenever you can. 🙏",
      };
    }

    // All slots / default
    return {
      icon: <Check className="w-6 h-6 text-primary" />,
      title: `${totalDone} sessions complete today`,
      subtitle: `Incredible dedication, ${userName}.`,
      nextTime: "Rest well. See you tomorrow. 🙏",
    };
  };

  const msg = getMessage();

  return (
    <motion.div
      className="glass-card rounded-2xl p-6 border-primary/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {/* Success Icon */}
      <div className="flex justify-center mb-5">
        <motion.div
          className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          {msg.icon}
        </motion.div>
      </div>

      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-display font-bold text-foreground">{msg.title}</h2>
        <p className="text-sm font-body text-muted-foreground">{msg.subtitle}</p>

        {/* Off-app practice */}
        {offAppPractice && (
          <motion.div
            className="glass-subtle rounded-xl p-4 mt-4 text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/70 mb-2">
              Off-app practice
            </p>
            <p className="text-sm font-body text-foreground leading-relaxed">
              "{offAppPractice}"
            </p>
          </motion.div>
        )}

        {/* Today's theme reminder */}
        {themeName && (
          <p className="text-xs text-muted-foreground/60 font-display italic mt-3">
            Today's theme: "{themeName}"
          </p>
        )}

        {/* Next session time */}
        <motion.p
          className="text-sm font-display text-primary/80 mt-4 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {msg.nextTime}
        </motion.p>
      </motion.div>

      {/* Optional actions */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={() => navigate("/app/journal")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-subtle text-foreground/60 font-display text-xs hover:bg-primary/5 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Journal
        </button>
        <button
          onClick={() => navigate("/app/masters")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-subtle text-foreground/60 font-display text-xs hover:bg-primary/5 transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chat with Guru
        </button>
      </motion.div>

      {/* Always-open doors — even after day is complete */}
      <div className="mt-6 pt-6 border-t border-border/30">
        <AlwaysAvailableActions heading="Always open" />
      </div>
    </motion.div>
  );
}
