import { cn } from "@/lib/utils";

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3 rounded-xl border border-border/60 bg-card/60 p-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className={cn("h-4 animate-pulse rounded-md bg-muted", c === 0 ? "w-2/3" : "w-full")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return <div className={cn("h-32 animate-pulse rounded-2xl bg-muted/60", className)} />;
}
