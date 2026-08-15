import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface Props { title?: string; description?: string; icon?: ReactNode; action?: ReactNode; }

export function EmptyState({ title = "Nothing here yet", description = "Data will appear once available.", icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
