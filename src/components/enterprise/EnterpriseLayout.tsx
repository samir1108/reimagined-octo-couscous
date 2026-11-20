import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Building2, Users, UserCog, LayoutDashboard, Settings, ChevronLeft, PlusCircle, UsersRound, FileDown, User, Trophy, MessageSquare, Brain, Crown, Sparkles, CircleDot, Search } from "lucide-react";
import BrandLotus from "@/components/BrandLotus";
import { BrandName } from "@/components/BrandName";
import EnterpriseNotificationBell from "@/components/enterprise/EnterpriseNotificationBell";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppPreloader from "@/components/AppPreloader";
import { useMyOrgMembership, useOrganization } from "@/hooks/useEnterprise";

const allNavItems = [
  { title: "Dashboard", path: "/enterprise", icon: LayoutDashboard, roles: ["admin", "manager"] },
  { title: "Org Mirror", path: "/enterprise/org-mirror", icon: Brain, roles: ["admin", "manager"] },
  { title: "Board View", path: "/enterprise/board", icon: Crown, roles: ["admin"] },
  { title: "Programs", path: "/enterprise/programs", icon: Sparkles, roles: ["admin", "manager"] },
  { title: "Peer Circles", path: "/enterprise/circles", icon: CircleDot, roles: ["admin", "manager", "employee"] },
  { title: "Employees", path: "/enterprise/employees", icon: Users, roles: ["admin", "manager"] },
  { title: "Teams", path: "/enterprise/teams", icon: UsersRound, roles: ["admin", "manager"] },
  { title: "Managers", path: "/enterprise/managers", icon: UserCog, roles: ["admin"] },
  { title: "People Intel", path: "/enterprise/people", icon: Search, roles: ["admin", "manager"] },
  { title: "Reports", path: "/enterprise/reports", icon: FileDown, roles: ["admin", "manager"] },
  { title: "Challenges", path: "/enterprise/challenges", icon: Trophy, roles: ["admin", "manager"] },
  { title: "Coaching", path: "/enterprise/coaching", icon: MessageSquare, roles: ["admin", "manager"] },
  { title: "Invite", path: "/enterprise/invite", icon: PlusCircle, roles: ["admin"] },
  { title: "Settings", path: "/enterprise/settings", icon: Settings, roles: ["admin"] },
  { title: "My Dashboard", path: "/enterprise/portal", icon: User, roles: ["employee"] },
];

export default function EnterpriseLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/enterprise/auth", { replace: true });
      } else {
        setIsAuthenticated(true);
      }
      setAuthChecked(true);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/enterprise/auth", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: membership, isLoading: memberLoading } = useMyOrgMembership();
  const { data: org } = useOrganization(membership?.org_id);

  // Filter nav by role
  const visibleNav = allNavItems.filter((item) => {
    if (!membership) return false;
    return item.roles.includes(membership.role);
  });

  if (!authChecked || !isAuthenticated || memberLoading) {
    return (
      <AppPreloader
        screen="enterprise"
        label="Opening Enterprise…"
        className="min-h-screen"
      />
    );
  }

  if (!membership) {
    navigate("/enterprise/create", { replace: true });
    return null;
  }

  // Employee: only allow portal + circles
  const employeeAllowed = ["/enterprise/portal", "/enterprise/circles"];
  if (membership.role === "employee" && !employeeAllowed.some((p) => location.pathname.startsWith(p))) {
    navigate("/enterprise/portal", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 bottom-0 z-30 w-64 glass-nav border-r border-border/20 flex flex-col"
        initial={{ x: -264 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/10">
          <Building2 className="w-6 h-6 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-display text-sm font-semibold text-foreground block truncate">
              {org?.name || "Enterprise"}
            </span>
            <span className="text-[10px] text-muted-foreground font-body capitalize">
              {membership.role} Portal
            </span>
          </div>
          {(membership.role === "admin" || membership.role === "manager") && (
            <EnterpriseNotificationBell orgId={membership.org_id} />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {visibleNav.map((item) => {
            const isActive = item.path === "/enterprise" || item.path === "/enterprise/portal"
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <motion.button
                key={item.title}
                onClick={() => navigate(item.path)}
                className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-300 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/8 border border-primary/15 rounded-xl"
                    layoutId="activeEnterpriseTab"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
                <span className="relative z-10 font-body text-sm font-medium">{item.title}</span>
                {isActive && (
                  <div className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Back to app */}
        <div className="pb-3 border-t border-border/10 pt-3 px-3">
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all text-sm font-body"
          >
            <BrandLotus size={22} className="shrink-0" />
            <span>Back to <BrandName /></span>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.main
        className="min-h-screen pt-6 p-8 ml-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Outlet context={{ membership, org }} />
      </motion.main>
    </div>
  );
}
