import { type ReactNode, useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Trees,
  Rabbit,
  ClipboardList,
  Images,
  AudioLines,
  Radar,
  HeartPulse,
  FileText,
  Bell,
  Users,
  UserCircle,
  LogOut,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  section: "operations" | "intelligence" | "admin";
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Global Overview", icon: LayoutDashboard, section: "operations" },
  { to: "/protected-areas", label: "Protected Areas", icon: Trees, section: "operations" },
  { to: "/species", label: "Species Inventory", icon: Rabbit, section: "operations" },
  { to: "/surveys", label: "Field Surveys", icon: ClipboardList, section: "operations" },
  { to: "/images", label: "Image Library", icon: Images, section: "intelligence" },
  { to: "/audio", label: "Acoustic Logs", icon: AudioLines, section: "intelligence" },
  { to: "/ai-detections", label: "AI Telemetry", icon: Radar, section: "intelligence" },
  { to: "/habitat-health", label: "Habitat Health", icon: HeartPulse, section: "intelligence" },
  { to: "/reports", label: "Reports", icon: FileText, section: "admin" },
  { to: "/notifications", label: "Notifications", icon: Bell, section: "admin" },
  { to: "/users", label: "User Directory", icon: Users, section: "admin", adminOnly: true },
];

export function AppShell({ children, title, subtitle, actions }: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { session, loading, roles, user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  const isAdmin = roles.includes("administrator");
  const groups: Record<string, NavItem[]> = { operations: [], intelligence: [], admin: [] };
  NAV.forEach((n) => {
    if (n.adminOnly && !isAdmin) return;
    groups[n.section].push(n);
  });

  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "?")
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase())
    .join("");

  const primaryRole = roles[0] ?? "researcher";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 shrink-0 surface-deep flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/10">
          <Link to="/dashboard" className="block">
            <h1 className="font-display text-lg font-bold tracking-tight uppercase">Vanguard Wilds</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mt-1">Intelligence Systems</p>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {(["operations", "intelligence", "admin"] as const).map((sec) => (
            <div key={sec}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">{sec}</p>
              <ul className="space-y-0.5">
                {groups[sec].map((item) => {
                  const active = pathname.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 bg-black/20">
          <Link to="/profile" className="flex items-center gap-3 group">
            <div className="size-9 rounded bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent font-bold text-xs">
              {initials || "FR"}
            </div>
            <div className="text-xs flex-1 min-w-0">
              <p className="font-semibold truncate text-white">{user?.user_metadata?.full_name ?? user?.email}</p>
              <p className="text-white/50 capitalize truncate">{primaryRole}</p>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); void handleSignOut(); }}
              className="text-white/40 hover:text-white transition-colors p-1"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="flex flex-wrap gap-4 justify-between items-end p-8 pb-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-brand-deep dark:text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search sightings…"
                className="pl-8 pr-3 py-2 h-9 rounded-md border border-border bg-card text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {actions}
          </div>
        </header>
        <div className="px-8 pb-12">{children}</div>
      </main>
    </div>
  );
}

export function StatCard({ label, value, delta, tone }: {
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: "positive" | "warn" | "neutral";
}) {
  const toneClass =
    tone === "warn" ? "text-brand-accent" : tone === "neutral" ? "text-muted-foreground" : "text-emerald-600";
  return (
    <div className="card-tactical p-5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-display font-bold text-foreground">{value}</span>
        {delta && <span className={`text-xs font-bold mb-1 ${toneClass}`}>{delta}</span>}
      </div>
    </div>
  );
}

export function SignOutButton() {
  const navigate = useNavigate();
  return (
    <Button variant="outline" size="sm" onClick={async () => {
      await supabase.auth.signOut();
      navigate({ to: "/auth", replace: true });
    }}>
      <LogOut className="h-4 w-4 mr-2" /> Sign out
    </Button>
  );
}
