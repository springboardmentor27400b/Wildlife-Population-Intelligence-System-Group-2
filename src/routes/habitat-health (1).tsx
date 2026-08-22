import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { HABITAT_TONE, type HabitatStatus } from "@/lib/wildlife-types";

export const Route = createFileRoute("/habitat-health")({
  head: () => ({ meta: [{ title: "Habitat Health — Vanguard Wilds" }, { name: "description", content: "Vegetation indices and conservation scores for protected areas." }] }),
  component: HabitatPage,
});

function HabitatPage() {
  const rows = useQuery({
    queryKey: ["habitat-all"],
    queryFn: async () => (await supabase.from("habitat_health").select("*, protected_areas(name, region)").order("recorded_at", { ascending: false })).data ?? [],
  });

  return (
    <AppShell title="Habitat Health" subtitle="Latest remote-sensing snapshots and field assessments">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(rows.data ?? []).map((h) => (
          <div key={h.id} className="card-tactical p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{(h.protected_areas as { region?: string } | null)?.region}</p>
                <h3 className="font-display font-bold">{(h.protected_areas as { name?: string } | null)?.name}</h3>
              </div>
              <span className={`text-sm font-bold capitalize ${HABITAT_TONE[h.status as HabitatStatus]}`}>{h.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div><p className="text-muted-foreground">Score</p><p className="font-display font-bold text-lg">{h.conservation_score}</p></div>
              <div><p className="text-muted-foreground">Vegetation</p><p className="font-display font-bold text-lg">{Number(h.vegetation_index).toFixed(1)}</p></div>
              <div><p className="text-muted-foreground">Rainfall</p><p className="font-display font-bold text-lg">{Number(h.rainfall_mm ?? 0).toFixed(0)}mm</p></div>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full mt-4">
              <div className={`h-full rounded-full ${h.status === "optimal" ? "bg-emerald-500" : h.status === "stable" ? "bg-emerald-600" : h.status === "caution" ? "bg-amber-500" : h.status === "degraded" ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${h.conservation_score}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-mono">Recorded {new Date(h.recorded_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
