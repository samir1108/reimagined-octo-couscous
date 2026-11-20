import { Bell, CheckCheck, Sparkles, AlertTriangle, Users, Trophy, TrendingUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEnterpriseNotifications } from "@/hooks/useEnterprise";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/design-system";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, typeof Sparkles> = {
  milestone: Trophy,
  burnout: AlertTriangle,
  insight: Sparkles,
  member: Users,
  growth: TrendingUp,
  system: Info,
};

const severityColors: Record<string, string> = {
  critical: "border-l-destructive bg-destructive/5",
  warning: "border-l-orange-400 bg-orange-400/5",
  positive: "border-l-chart-2 bg-chart-2/5",
  info: "border-l-primary bg-primary/5",
};

export default function EnterpriseNotificationBell({ orgId }: { orgId?: string }) {
  const { notifications, unreadCount, markRead, markAllRead } = useEnterpriseNotifications(orgId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          className="relative w-8 h-8 rounded-lg bg-muted/30 border border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          title="Enterprise Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[70vh] overflow-y-auto glass-card rounded-xl border-border/30 p-0"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
          <span className="font-display text-sm font-semibold text-foreground">Enterprise Alerts</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-body"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>
        <div className="py-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-body">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = typeIcons[n.type] || Info;
              const sevClass = !n.read && n.severity !== "info" ? severityColors[n.severity] || "" : "";
              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`w-full flex items-start gap-3 px-3.5 py-3 text-left rounded-xl transition-all ${
                    n.read ? "opacity-60" : "hover:bg-primary/10"
                  } ${!n.read ? `border-l-2 ${sevClass}` : ""}`}
                >
                  <div className="mt-0.5 shrink-0 text-muted-foreground">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-body leading-tight ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                      {n.title}
                    </p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />}
                </motion.button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
