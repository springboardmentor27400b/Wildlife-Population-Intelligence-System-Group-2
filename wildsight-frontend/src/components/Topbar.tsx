import { Bell, Menu, Moon, Search, Sun, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/services/api";

interface Props { onMenuClick: () => void; }

function useBreadcrumb() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((p, i) => ({
    label: p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    to: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

export function Topbar({ onMenuClick }: Props) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const crumbs = useBreadcrumb();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get("/api/notifications").then((r) => {
      const list = Array.isArray(r.data) ? r.data : r.data?.content || [];
      setUnread(list.filter((n: any) => !n.read && !n.isRead).length);
    }).catch(() => {});
  }, []);

  const initials = (user?.fullName || user?.email || "U")
    .split(/[\s@]/).filter(Boolean).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-muted lg:hidden">
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden min-w-0 items-center gap-1.5 text-sm text-muted-foreground md:flex">
          <Link to="/dashboard" className="hover:text-foreground">Home</Link>
          {crumbs.map((c, i) => (
            <span key={c.to} className="flex items-center gap-1.5">
              <span className="text-muted-foreground/50">/</span>
              <Link to={c.to} className={i === crumbs.length - 1 ? "font-medium text-foreground" : "hover:text-foreground"}>
                {c.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search species, surveys..."
              className="h-10 w-64 rounded-xl border border-border/60 bg-background/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <button onClick={toggle} className="rounded-xl border border-border/60 bg-background/60 p-2.5 transition hover:bg-muted" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button onClick={() => navigate("/notifications")} className="relative rounded-xl border border-border/60 bg-background/60 p-2.5 hover:bg-muted">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 py-1.5 pl-1.5 pr-3 hover:bg-muted">
                <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-xs font-bold text-primary-foreground">{initials}</div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-semibold leading-tight">{user?.fullName || "User"}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{user?.role}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}><UserIcon className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
