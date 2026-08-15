import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  hint?: string;
  trend?: number;
  gradient?: boolean;
  delay?: number;
}

export function StatCard({ title, value, icon, hint, trend, gradient, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 p-5 shadow-soft transition-all hover:shadow-elegant",
        gradient ? "gradient-primary text-primary-foreground" : "glass",
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-70" />
      <div className="relative flex items-start justify-between">
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", gradient ? "bg-white/20" : "bg-primary/10 text-primary")}>
          {icon}
        </div>
        {typeof trend === "number" && (
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            gradient ? "bg-white/20" : trend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="relative mt-5">
        <div className={cn("text-xs font-medium uppercase tracking-wider", gradient ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {title}
        </div>
        <div className="mt-1 font-display text-3xl font-bold tracking-tight">
          {value}
        </div>
        {hint && <div className={cn("mt-1 text-xs", gradient ? "text-primary-foreground/70" : "text-muted-foreground")}>{hint}</div>}
      </div>
    </motion.div>
  );
}
