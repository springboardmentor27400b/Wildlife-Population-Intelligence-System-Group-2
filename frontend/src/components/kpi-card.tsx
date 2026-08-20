import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: number;
  accent?: "forest" | "ocean" | "earth" | "sun" | "danger";
  delay?: number;
}

const accentClass: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  forest: "text-forest",
  ocean: "text-ocean",
  earth: "text-earth",
  sun: "text-sun-foreground",
  danger: "text-danger",
};

export function KpiCard({ label, value, hint, icon: Icon, trend, accent = "forest", delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="glass relative overflow-hidden rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted",
              accentClass[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {typeof trend === "number" && (
        <div
          className={cn(
            "mt-4 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            trend >= 0 ? "bg-forest/10 text-forest" : "bg-danger/10 text-danger",
          )}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          <span className="text-muted-foreground">vs prev</span>
        </div>
      )}
    </motion.div>
  );
}