import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { notifications as seed } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — WPIS" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [items, setItems] = useState(seed);

  const markAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const sevLabel = (s: string) =>
    s === "critical" ? "Urgent" : s === "high" ? "High" : s === "medium" ? "Medium" : "Low";

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Real-time alerts about endangered species, habitat, monitoring devices, and completed surveys."
        actions={<Button variant="outline" onClick={markAll}><CheckCheck className="mr-1 h-4 w-4" /> Mark all read</Button>}
      />
      <ul className="space-y-3">
        {items.map((n) => (
          <li key={n.id} className={`glass flex items-start gap-3 rounded-2xl p-4 ${!n.read ? "border-l-4 border-forest" : ""}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
              <Bell className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">{n.title}</div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={sevLabel(n.severity)} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{n.message}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}