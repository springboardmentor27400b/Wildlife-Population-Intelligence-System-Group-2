import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Camera,
  AudioLines,
  PawPrint,
  BarChart3,
  Leaf,
  TreePine,
  Sparkles,
  Activity,
  Map,
  MapPin,
  Bell,
  FileText,
  ShieldCheck,
  LogOut,
  Boxes,
} from "lucide-react";

import type { Role } from "@/lib/authTypes";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/authTypes";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type NavItem = {
  title: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

/*
|--------------------------------------------------------------------------
| Monitoring
|--------------------------------------------------------------------------
*/

const monitoring: NavItem[] = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "researcher", "forest", "conservation"],
  },

  {
    title: "Surveys",
    to: "/surveys",
    icon: ClipboardList,
    roles: ["researcher", "forest"],
  },

  {
    title: "Add Observation",
    to: "/add-observation",
    icon: ClipboardList,
    roles: ["researcher", "forest"],
  },

  {
    title: "Image Analysis",
    to: "/image-analysis",
    icon: Camera,
    roles: ["researcher"],
  },

  {
    title: "Audio Analysis",
    to: "/audio-analysis",
    icon: AudioLines,
    roles: ["researcher"],
  },

  {
    title: "Species Identification",
    to: "/species-identification",
    icon: PawPrint,
    roles: ["researcher", "conservation"],
  },

  {
    title: "Maps & GIS",
    to: "/maps",
    icon: Map,
    roles: ["forest", "conservation", "admin"],
  },

  {
    title: "Protected Areas",
    to: "/protected-areas",
    icon: MapPin,
    roles: ["forest", "conservation", "admin"],
  },
];

/*
|--------------------------------------------------------------------------
| Intelligence
|--------------------------------------------------------------------------
*/

const intelligence: NavItem[] = [
  {
    title: "Species",
    to: "/species",
    icon: PawPrint,
    roles: ["researcher", "forest", "conservation", "admin"],
  },

  {
    title: "Population Intelligence",
    to: "/population-intelligence",
    icon: BarChart3,
    roles: ["researcher", "conservation", "admin"],
  },

  {
    title: "Biodiversity",
    to: "/biodiversity",
    icon: Leaf,
    roles: ["researcher", "forest", "conservation"],
  },

  {
    title: "Habitat",
    to: "/habitat",
    icon: TreePine,
    roles: ["forest", "conservation"],
  },

  {
    title: "Conservation",
    to: "/conservation-intelligence",
    icon: Sparkles,
    roles: ["conservation", "admin"],
  },

  {
    title: "Ecosystem Health",
    to: "/ecosystem-health",
    icon: Activity,
    roles: ["researcher", "forest", "conservation", "admin"],
  },

  {
    title: "Wildlife Dashboard",
    to: "/wildlife-dashboard",
    icon: LayoutDashboard,
    roles: ["researcher", "conservation", "forest", "admin"],
  },
];

/*
|--------------------------------------------------------------------------
| Operations
|--------------------------------------------------------------------------
*/

const operations: NavItem[] = [
  {
    title: "Notifications",
    to: "/notifications",
    icon: Bell,
    roles: ["researcher", "forest", "conservation", "admin"],
  },

  {
    title: "Reports",
    to: "/reports",
    icon: FileText,
    roles: ["researcher", "forest", "conservation", "admin"],
  },

  {
    title: "Admin",
    to: "/admin",
    icon: ShieldCheck,
    roles: ["admin"],
  },
];

/*
|--------------------------------------------------------------------------
| User initials
|--------------------------------------------------------------------------
*/

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/*
|--------------------------------------------------------------------------
| Sidebar
|--------------------------------------------------------------------------
*/

export function AppSidebar() {
  const { user, logout } = useAuth();

  const { state } = useSidebar();

  const collapsed = state === "collapsed";

  const pathname = useRouterState({
    select: (r) => r.location.pathname,
  });

  /*
   * Only show navigation items that belong
   * to the currently authenticated user's role.
   */
  const renderGroup = (
    label: string,
    items: NavItem[],
  ) => {
    const visible = items.filter((item) => {
      if (!user) {
        return false;
      }

      return item.roles.includes(user.role);
    });

    if (visible.length === 0) {
      return null;
    }

    return (
      <SidebarGroup key={label}>
        <SidebarGroupLabel>
          {label}
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu>
            {visible.map((item) => {
              const active =
                pathname === item.to ||
                pathname.startsWith(item.to + "/");

              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                  >
                    <Link
                      to={item.to}
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />

                      {!collapsed && (
                        <span>{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  /*
   * Debug information.
   *
   * Keep these temporarily while testing.
   */
  console.log(
    "SIDEBAR CURRENT USER:",
    user,
  );

  console.log(
    "SIDEBAR CURRENT ROLE:",
    user?.role,
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-forest">
            <Boxes className="h-5 w-5" />
          </div>

          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-base font-semibold">
                WPIS
              </div>

              <div className="text-xs text-sidebar-foreground/70">
                Wildlife Intelligence
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup(
          "Monitoring",
          monitoring,
        )}

        {renderGroup(
          "Intelligence",
          intelligence,
        )}

        {renderGroup(
          "Operations",
          operations,
        )}
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/40 p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {initials(user.full_name)}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {user.full_name}
                </div>

                <div className="truncate text-xs text-sidebar-foreground/60">
                  {ROLE_LABEL[user.role]}
                </div>
              </div>
            )}

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Log out"
                className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}