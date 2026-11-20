import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';
import {
  LayoutDashboard, Users, BarChart3, Building2, LogOut, Shield,
  Activity, Bot, HeartPulse, MessageSquare, IndianRupee, Mail,
  GraduationCap, Wrench, AlertTriangle, Globe, Search,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  useSidebar,
} from "@/design-system";
import AppPreloader from '@/components/AppPreloader';
import { Badge } from "@/design-system";

const navItems = [
  { title: 'Command Center', url: '/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Sessions & AI Training', url: '/admin/sessions', icon: MessageSquare },
  { title: 'Health Scores', url: '/admin/health', icon: HeartPulse },
  { title: 'Activity Feed', url: '/admin/activity', icon: Activity },
  { title: 'AI Copilot', url: '/admin/copilot', icon: Bot },
  { title: 'AI Training Studio', url: '/admin/training', icon: GraduationCap },
  { title: 'Predictive', url: '/admin/predictive', icon: AlertTriangle },
  { title: 'Power Tools', url: '/admin/power', icon: Wrench },
  { title: 'Business Intel', url: '/admin/bi', icon: Globe },
  { title: 'SEO Diagnostic', url: '/admin/seo', icon: Search },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Enterprise', url: '/admin/enterprise', icon: Building2 },
  { title: 'Cost Dashboard', url: '/admin/costs', icon: IndianRupee },
  { title: 'Waitlist', url: '/admin/waitlist', icon: Mail },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {!collapsed && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Conscious<span className="text-primary">OS</span></span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">ADMIN</Badge>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/app" className="hover:bg-muted/50 text-muted-foreground">
                    <LogOut className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Back to App</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const { isAdmin, isLoading } = useAdminRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/app', { replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <AppPreloader
        screen="admin"
        label="Verifying admin access…"
        className="min-h-screen"
      />
    );
  }

  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-muted-foreground">System Online</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
