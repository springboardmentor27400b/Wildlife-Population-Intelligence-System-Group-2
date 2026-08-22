import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatCard } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Download, Plus, Timer } from "lucide-react";
import { CONSERVATION_TONE, HABITAT_TONE, type ConservationStatus, type HabitatStatus } from "@/lib/wildlife-types";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import tigerImg from "@/assets/tiger-detection.jpg";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Overview — Vanguard Wilds" }, { name: "description", content: "Real-time population dynamics and threat assessment." }] }),
  component: DashboardPage,
});

const CHART_COLORS = ["hsl(160 70% 20%)", "hsl(45 95% 55%)", "hsl(150 40% 45%)", "hsl(200 25% 45%)", "hsl(25 60% 45%)"];

function DashboardPage() {
  const stats = useQuery({
    queryKey: ["dash-stats"],
    queryFn: async () => {
      const [sp, su, pa, hh] = await Promise.all([
        supabase.from("species").select("id", { count: "exact", head: true }),
        supabase.from("surveys").select("id", { count: "exact", head: true }),
        supabase.from("protected_areas").select("area_hectares"),
        supabase.from("habitat_health").select("conservation_score,status,protected_area_id"),
      ]);
      const totalArea = (pa.data ?? []).reduce((s, r) => s + Number(r.area_hectares ?? 0), 0);
      const avgScore = (hh.data ?? []).reduce((s, r) => s + r.conservation_score, 0) / Math.max(1, (hh.data ?? []).length);
      return {
        species: sp.count ?? 0,
        surveys: su.count ?? 0,
        areaHectares: totalArea,
        areasCount: (pa.data ?? []).length,
        avgScore: Math.round(avgScore),
      };
    },
  });

  const population = useQuery({
    queryKey: ["dash-population"],
    queryFn: async () => {
      const { data } = await supabase
        .from("population_statistics")
        .select("observation_month, estimated_count, species_id, species(common_name)")
        .eq("observation_year", 2024)
        .order("observation_month");
      const byMonth: Record<number, number> = {};
      (data ?? []).forEach((r) => {
        byMonth[r.observation_month] = (byMonth[r.observation_month] ?? 0) + Number(r.estimated_count);
      });
      return Array.from({ length: 6 }, (_, i) => ({
        month: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"][i],
        estimated: byMonth[i + 1] ?? 0,
      }));
    },
  });

  const distribution = useQuery({
    queryKey: ["dash-distribution"],
    queryFn: async () => {
      const { data } = await supabase
        .from("population_statistics")
        .select("estimated_count, species(common_name, conservation_status)");
      const map: Record<string, { name: string; value: number; status: ConservationStatus }> = {};
      (data ?? []).forEach((r) => {
        const name = (r.species as { common_name?: string } | null)?.common_name ?? "Unknown";
        const status = ((r.species as { conservation_status?: string } | null)?.conservation_status ?? "LC") as ConservationStatus;
        if (!map[name]) map[name] = { name, value: 0, status };
        map[name].value += Number(r.estimated_count);
      });
      return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 5);
    },
  });

  const activity = useQuery({
    queryKey: ["dash-activity"],
    queryFn: async () => {
      const [surveys, detections] = await Promise.all([
        supabase.from("surveys").select("id,title,created_at,status").order("created_at", { ascending: false }).limit(3),
        supabase.from("image_detections").select("id,species_label,confidence,detected_at").order("detected_at", { ascending: false }).limit(3),
      ]);
      const items: { id: string; label: string; sub: string; when: string; tone: string }[] = [];
      (surveys.data ?? []).forEach((s) => items.push({ id: `s${s.id}`, label: `Survey filed: ${s.title}`, sub: s.status, when: s.created_at, tone: "bg-emerald-500" }));
      (detections.data ?? []).forEach((d) => items.push({ id: `d${d.id}`, label: `AI detected ${d.species_label}`, sub: `${Math.round(Number(d.confidence) * 100)}% confidence`, when: d.detected_at, tone: "bg-brand-accent" }));
      return items.sort((a, b) => b.when.localeCompare(a.when)).slice(0, 6);
    },
  });

  const health = useQuery({
    queryKey: ["dash-health"],
    queryFn: async () => {
      const { data } = await supabase.from("habitat_health")
        .select("protected_area_id, status, conservation_score, protected_areas(name)")
        .order("recorded_at", { ascending: false })
        .limit(4);
      return (data ?? []).map((r) => ({
        name: (r.protected_areas as { name?: string } | null)?.name ?? "—",
        score: r.conservation_score,
        status: r.status as HabitatStatus,
      }));
    },
  });

  return (
    <AppShell
      title="Sector-7 Intelligence"
      subtitle="Real-time population dynamics and threat assessment"
      actions={
        <>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export</Button>
          <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90"><Plus className="h-4 w-4 mr-2" /> New Survey</Button>
        </>
      }
    >
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Species" value={stats.data?.species ?? "—"} delta="+4.2%" />
        <StatCard label="Active Surveys" value={stats.data?.surveys ?? "—"} delta="12 dep." tone="neutral" />
        <StatCard label="Protected Coverage" value={`${((stats.data?.areaHectares ?? 0) / 1000).toFixed(0)}k ha`} delta={`${stats.data?.areasCount ?? 0} reserves`} tone="neutral" />
        <StatCard label="Habitat Score" value={`${stats.data?.avgScore ?? "—"}/100`} delta="Elevated risk" tone="warn" />
      </section>

      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 lg:col-span-8 card-tactical p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-sm uppercase tracking-wide">Population Growth Trend — 2024</h3>
            <span className="text-[10px] font-mono text-muted-foreground">est. individuals</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={population.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="estimated" stroke="hsl(160 70% 20%)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 card-tactical p-6">
          <h3 className="font-display font-bold text-sm uppercase tracking-wide mb-4">Species Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={distribution.data ?? []} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {(distribution.data ?? []).map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 card-tactical overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
            <h3 className="font-display font-bold text-sm uppercase tracking-wide">Recent AI Detection · Panthera tigris</h3>
            <span className="text-[10px] font-mono bg-brand-deep text-white px-2 py-0.5 rounded">CAM-ID: 08-ALPHA</span>
          </div>
          <div className="relative">
            <img src={tigerImg} alt="Bengal tiger camera trap" width={1600} height={900} className="w-full aspect-[2/1] object-cover" />
            <div className="absolute top-[28%] left-[38%] w-[28%] h-[52%] border-2 border-brand-accent shadow-[0_0_20px_rgba(251,191,36,0.35)]">
              <div className="absolute -top-6 left-0 bg-brand-accent text-brand-deep text-[10px] font-bold px-1.5 py-0.5">98.4% CONFIDENCE</div>
            </div>
            <div className="absolute bottom-4 left-4 flex gap-3">
              <div className="bg-black/70 backdrop-blur px-3 py-2 rounded border border-white/20 text-white">
                <p className="text-[10px] uppercase text-white/60">Timestamp</p>
                <p className="text-xs font-mono">2024-11-24 02:14:58</p>
              </div>
              <div className="bg-black/70 backdrop-blur px-3 py-2 rounded border border-white/20 text-white">
                <p className="text-[10px] uppercase text-white/60">Coordinates</p>
                <p className="text-xs font-mono">24.12°N, 78.43°E</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="card-tactical p-5">
            <h3 className="font-display font-bold text-sm uppercase mb-4">Sector Health</h3>
            <div className="space-y-4">
              {(health.data ?? []).map((h) => (
                <div key={h.name}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">{h.name}</span>
                    <span className={`font-bold capitalize ${HABITAT_TONE[h.status]}`}>{h.status}</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full mt-1.5">
                    <div className={`h-full rounded-full ${h.status === "optimal" ? "bg-emerald-500" : h.status === "stable" ? "bg-emerald-600" : h.status === "caution" ? "bg-amber-500" : h.status === "degraded" ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${h.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl surface-deep p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-display font-bold text-sm uppercase">Recent Activity</h3>
              <span className="size-2 rounded-full bg-brand-accent animate-pulse" />
            </div>
            <ul className="space-y-3">
              {(activity.data ?? []).map((a) => (
                <li key={a.id} className="flex gap-3 items-start">
                  <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${a.tone}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/90 truncate">{a.label}</p>
                    <p className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5">
                      <Timer className="h-3 w-3" /> {new Date(a.when).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
              {(activity.data ?? []).length === 0 && <li className="text-xs text-white/50">No activity yet. File a survey to begin.</li>}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
