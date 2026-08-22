import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/AppShell";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Vanguard Wilds" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const notifs = useQuery({
    queryKey: ["notifs", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifs"] });
  };

  const sendDemo = async () => {
    if (!user) return;
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Habitat health alert",
      body: "Vegetation index dropped in Nagarhole Sector B.",
      severity: "warning",
    } as never);
    qc.invalidateQueries({ queryKey: ["notifs"] });
  };

  return (
    <AppShell title="Notifications" subtitle="Alerts, survey confirmations, and habitat warnings" actions={<Button size="sm" variant="outline" onClick={sendDemo}>Send test alert</Button>}>
      <div className="space-y-3">
        {(notifs.data ?? []).map((n) => (
          <div key={n.id} className={`card-tactical p-4 flex items-start gap-3 ${n.read ? "opacity-60" : ""}`}>
            <div className={`size-9 rounded-md flex items-center justify-center ${n.severity === "warning" ? "bg-amber-100 text-amber-700" : n.severity === "critical" ? "bg-red-100 text-red-700" : "bg-brand-primary/10 text-brand-primary"}`}>
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{n.title}</p>
              {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
            {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}><Check className="h-4 w-4" /></Button>}
          </div>
        ))}
        {notifs.data?.length === 0 && (
          <div className="card-tactical p-10 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All quiet on the reserve.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
