import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Users, TrendingUp, Compass, Sprout } from "lucide-react";
import { populationTrend, species } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/population")({
  head: () => ({ meta: [{ title: "Population — WPIS" }] }),
  component: PopulationPage,
});

const distribution = species.slice(0, 8).map((s) => ({ name: s.name.split(" ")[0], count: s.population }));

function PopulationPage() {
  return (
    <div>
      <PageHeader title="Population Estimation" description="Counts, density, distribution, migration, and growth." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Individuals" value={species.reduce((n, s) => n + s.population, 0).toLocaleString()} icon={Users} trend={3} />
        <KpiCard label="Avg Density" value="4.2 /km²" icon={Compass} accent="ocean" />
        <KpiCard label="Growth Rate" value="+2.4%" icon={TrendingUp} accent="forest" trend={2} />
        <KpiCard label="Migratory Species" value={4} icon={Sprout} accent="earth" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="mb-2 font-display text-lg font-semibold">Trend over time</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={populationTrend}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--forest)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--forest)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Legend />
              <Area type="monotone" dataKey="tiger" stroke="var(--forest)" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="rhino" stroke="var(--ocean)" fill="var(--ocean)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="mb-2 font-display text-lg font-semibold">Species distribution</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Bar dataKey="count" fill="var(--ocean)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass mt-4 rounded-2xl p-5">
        <div className="mb-3 font-display text-lg font-semibold">Density heatmap (mock)</div>
        <div className="grid grid-cols-16 gap-[3px]" style={{ gridTemplateColumns: "repeat(16, 1fr)" }}>
          {Array.from({ length: 16 * 8 }).map((_, i) => {
            const v = Math.abs(Math.sin(i / 5) * Math.cos(i / 9)) * 0.85 + 0.1;
            return (
              <div key={i} className="aspect-square rounded-sm" style={{ background: `color-mix(in oklab, var(--forest) ${v * 100}%, var(--muted))` }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}