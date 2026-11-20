import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Sparkles, Flame, Trophy, Zap, Info, Brain, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/machines/notificationsMachine";
import ReadingCardModal from "@/components/ReadingCardModal";

const typeIcons: Record<string, typeof Sparkles> = {
  insight: Sparkles,
  streak: Flame,
  milestone: Trophy,
  prediction: Zap,
  checkin: Brain,
  task_followup: Target,
  system: Info,
};

const typeColors: Record<string, string> = {
  insight: "text-accent",
  streak: "text-orange-400",
  milestone: "text-primary",
  prediction: "text-chart-4",
  checkin: "text-purple-400",
  task_followup: "text-chart-2",
  system: "text-muted-foreground",
};

const typeSubtitles: Record<string, string> = {
  insight: "Daily Insight",
  streak: "Streak Update",
  milestone: "Journey Milestone",
  prediction: "Predictive Insight",
  checkin: "Check-in",
  task_followup: "Task Follow-up",
  system: "System",
};

export default function NotificationHistory() {
  const [userId, setUserId] = useState<string>();
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { notifications } = useNotifications(userId);

  const displayNotifs = showAll ? notifications : notifications.slice(0, 10);
  const selectedIcon = selectedNotif ? typeIcons[selectedNotif.type] : null;
  const SelectedIconComponent = selectedIcon || Sparkles;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Notification History
        </h3>
        <span className="text-[10px] text-muted-foreground font-body">
          {notifications.length} total
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-6">
          <Bell className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground font-body">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayNotifs.map((n) => {
            const Icon = typeIcons[n.type] || Info;
            const color = typeColors[n.type] || "text-muted-foreground";
            return (
              <motion.button
                key={n.id}
                onClick={() => setSelectedNotif(n)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-xl transition-all hover:bg-primary/5 ${
                  n.read ? "opacity-60" : ""
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`mt-0.5 shrink-0 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-body leading-tight ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                    {n.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
              </motion.button>
            );
          })}

          {notifications.length > 10 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-xs text-primary font-display font-medium py-2 hover:text-primary/80 transition-colors"
            >
              Show all {notifications.length} notifications
            </button>
          )}
        </div>
      )}

      {/* Reading Card Modal */}
      <ReadingCardModal
        open={!!selectedNotif}
        onClose={() => setSelectedNotif(null)}
        title={selectedNotif?.title || ""}
        body={selectedNotif?.body || ""}
        subtitle={selectedNotif ? typeSubtitles[selectedNotif.type] || "Notification" : ""}
        timestamp={selectedNotif?.created_at}
        icon={
          selectedNotif ? (
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <SelectedIconComponent className={`w-5 h-5 ${typeColors[selectedNotif.type] || "text-primary"}`} />
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
