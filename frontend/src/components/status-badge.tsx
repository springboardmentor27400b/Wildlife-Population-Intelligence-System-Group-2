import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  "Least Concern": "bg-forest/15 text-forest",
  "Near Threatened": "bg-sun/25 text-earth",
  Vulnerable: "bg-sun/40 text-earth",
  Endangered: "bg-danger/20 text-danger",
  "Critically Endangered": "bg-danger text-danger-foreground",
  Rising: "bg-forest/15 text-forest",
  Stable: "bg-ocean/15 text-ocean",
  Declining: "bg-danger/15 text-danger",
  Active: "bg-forest/15 text-forest",
  Completed: "bg-ocean/15 text-ocean",
  Planned: "bg-muted text-muted-foreground",
  Online: "bg-forest/15 text-forest",
  Offline: "bg-danger/15 text-danger",
  Idle: "bg-muted text-muted-foreground",
  Deployed: "bg-forest/15 text-forest",
  Training: "bg-sun/30 text-earth",
  Urgent: "bg-danger text-danger-foreground",
  High: "bg-danger/20 text-danger",
  Medium: "bg-sun/30 text-earth",
  Low: "bg-muted text-muted-foreground",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[value] ?? "bg-muted text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}