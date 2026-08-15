import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { modulesForRole } from "@/config/modules";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Leaf, FolderTree, ClipboardList, Trees, MapPin, Cpu, Eye,
  ImagePlus, Mic, AudioLines, AlertTriangle, BarChart3, LineChart, Gauge,
  Sparkles, FileText, Download, Bell, User, Settings as SettingsIcon,
  ChevronLeft, ChevronRight, X, Feather,
  HeartPulse,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: Record<string, any> = {
  LayoutDashboard, Leaf, FolderTree, ClipboardList, Trees, MapPin, Cpu, Eye,
  ImagePlus, Mic, AudioLines, AlertTriangle, BarChart3, LineChart, Gauge,
  Sparkles, FileText, Download, Bell, User, SettingsIcon,HeartPulse,
};

interface Item { path: string; title: string; icon: string; }

const alwaysTop: Item = { path: "/dashboard", title: "Dashboard", icon: "LayoutDashboard" };

const roleExtras: Record<string, Item[]> = {
  ADMIN: [],
  RESEARCHER: [{ path: "/upload-images", title: "Upload Images", icon: "ImagePlus" }, { path: "/upload-audio", title: "Upload Audio", icon: "Mic" }],
  FOREST_OFFICER: [{ path: "/upload-images", title: "Upload Images", icon: "ImagePlus" }, { path: "/upload-audio", title: "Upload Audio", icon: "Mic" }],
  VOLUNTEER: [{ path: "/upload-images", title: "Upload Images", icon: "ImagePlus" }, { path: "/upload-audio", title: "Upload Audio", icon: "Mic" }],
};

const reportItems: Item[] = [
  {
    path: "/analytics",
    title: "Analytics Dashboard",
    icon: "BarChart3",
  },
  {
    path: "/population",
    title: "Population Intelligence",
    icon: "LineChart",
  },
   {
    path: "/biodiversity-intelligence",
    title: "Biodiversity Intelligence",
    icon: "Leaf",
  },
  {
    path: "/habitat-intelligence",
    title: "Habitat Intelligence",
    icon: "Trees",
},
{
    path: "/conservation-intelligence",
    title: "Conservation Intelligence",
    icon: "ShieldCheck",
},
{
 path:"/survey-intelligence",
 title:"Survey Intelligence",
 icon:"ClipboardList"
},
{
    path:"/health-score",
    title:"Wildlife Health Score",
    icon:"HeartPulse",
},
  {
    path: "/reports",
    title: "Reports",
    icon: "FileText",
  },
  {
    path: "/report-exports",
    title: "Report Exports",
    icon: "Download",
  },
];

const bottomItems: Item[] = [
  { path: "/notifications", title: "Notifications", icon: "Bell" },
  { path: "/profile", title: "Profile", icon: "User" },
  { path: "/settings", title: "Settings", icon: "SettingsIcon" },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const { user } = useAuth();
  const role = user?.role || "VOLUNTEER";
  const modItems = modulesForRole(role).map((m) => ({ path: m.path, title: m.title, icon: m.icon }));
  const extras = roleExtras[role] || [];
  const showReports =
  role === "ADMIN" ||
  role === "RESEARCHER" ||
  role === "FOREST_OFFICER";
  const showSettings = role === "ADMIN";
  const filteredBottom = bottomItems.filter((b) => (b.path === "/settings" ? showSettings : true));

  const groups: { label?: string; items: Item[] }[] = [
    { items: [alwaysTop] },
    { label: "Workspace", items: modItems },
    ...(extras.length ? [{ label: "Uploads", items: extras }] : []),
    ...(showReports ? [{ label: "Insights", items: reportItems }] : []),
    { label: "Account", items: filteredBottom },
  ];

  return (
    <>
      {/* mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "z-50 flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          "fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:h-screen",
          collapsed ? "w-[76px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary shadow-glow">
              <Feather className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate font-display text-[15px] font-bold leading-tight">WildSight</div>
                <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">Biodiversity OS</div>
              </div>
            )}
          </div>
          <button onClick={onMobileClose} className="rounded-md p-1.5 hover:bg-muted lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((g, gi) => (
            <div key={gi} className="mb-4">
              {g.label && !collapsed && (
                <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {g.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const Icon = iconMap[it.icon] || LayoutDashboard;
                  return (
                    <li key={it.path}>
                      <NavLink
                        to={it.path}
                        onClick={onMobileClose}
                        className={({ isActive }) => cn(
                          "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                          isActive
                            ? "gradient-primary text-primary-foreground shadow-soft"
                            : "text-sidebar-foreground/80 hover:bg-muted/60 hover:text-sidebar-foreground",
                        )}
                        title={collapsed ? it.title : undefined}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span className="truncate">{it.title}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <button
          onClick={onToggle}
          className="hidden items-center justify-center gap-2 border-t border-sidebar-border py-3 text-xs text-muted-foreground hover:bg-muted lg:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}
        </button>
      </aside>
    </>
  );
}
