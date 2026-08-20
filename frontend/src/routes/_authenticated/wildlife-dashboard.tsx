import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Leaf,
  MapPin,
  PawPrint,
  ShieldCheck,
  TrendingUp,
  Trophy,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard } from "@/components/kpi-card";

import {
  getEcosystemHealth,
  getSpeciesTrends,
  getProtectedAreaAnalytics,
  type EcosystemHealth,
  type SpeciesTrend,
  type ProtectedAreaAnalytics,
} from "@/services/analyticsService";

import {
  getPopulationEstimation,
} from "@/services/populationEstimationService";

import {
  getPopulationGrowth,
} from "@/services/populationGrowthService";

import {
  getPopulationTrend,
} from "@/services/populationTrendService";

export const Route = createFileRoute(
  "/_authenticated/wildlife-dashboard"
)({
  component: WildlifeDashboard,
});

function WildlifeDashboard() {
  const [health, setHealth] = useState<EcosystemHealth | null>(null);
  const [population, setPopulation] = useState<any>(null);
  const [growth, setGrowth] = useState<any>(null);
  const [populationTrend, setPopulationTrend] = useState<any[]>([]);
  const [species, setSpecies] = useState<SpeciesTrend[]>([]);
  const [areas, setAreas] = useState<ProtectedAreaAnalytics[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const results = await Promise.allSettled([
        getEcosystemHealth(),
        getPopulationEstimation(),
        getPopulationGrowth(),
        getPopulationTrend(),
        getSpeciesTrends(),
        getProtectedAreaAnalytics(),
      ]);

      const [
        healthResult,
        populationResult,
        growthResult,
        trendResult,
        speciesResult,
        areasResult,
      ] = results;

      if (healthResult.status === "fulfilled") {
        setHealth(healthResult.value);
      } else {
        console.error("Ecosystem health failed:", healthResult.reason);
      }

      if (populationResult.status === "fulfilled") {
        setPopulation(populationResult.value);
      } else {
        console.error(
          "Population estimation failed:",
          populationResult.reason
        );
      }

      if (growthResult.status === "fulfilled") {
        setGrowth(growthResult.value);
      } else {
        console.error("Population growth failed:", growthResult.reason);
      }

      if (trendResult.status === "fulfilled") {
        setPopulationTrend(trendResult.value);
      } else {
        console.error("Population trend failed:", trendResult.reason);
      }

      if (speciesResult.status === "fulfilled") {
        setSpecies(speciesResult.value);
      } else {
        console.error("Species trends failed:", speciesResult.reason);
      }

      if (areasResult.status === "fulfilled") {
        setAreas(areasResult.value);
      } else {
        console.error(
          "Protected area analytics failed:",
          areasResult.reason
        );
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading Wildlife Intelligence Dashboard...
      </div>
    );
  }

  const topSpecies = [...species].sort(
    (a, b) => b.count - a.count
  )[0];

  const topArea = [...areas].sort(
    (a, b) => b.animals - a.animals
  )[0];

  const healthStatus = health?.status ?? "Unknown";

  const healthColor =
    healthStatus.toLowerCase() === "excellent"
      ? "text-forest"
      : healthStatus.toLowerCase() === "good"
      ? "text-ocean"
      : healthStatus.toLowerCase() === "moderate"
      ? "text-earth"
      : healthStatus.toLowerCase() === "poor"
      ? "text-danger"
      : "text-muted-foreground";

  const populationMessage =
    growth?.trend === "Declining"
      ? "Population is declining. Conservation attention is recommended."
      : growth?.trend === "Increasing"
      ? "Population is increasing. Continue current conservation efforts."
      : "Population is relatively stable.";

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="font-display text-3xl font-semibold">
          Wildlife Intelligence Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Unified overview of wildlife population, species,
          protected areas and ecosystem health.
        </p>
      </div>

      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <KpiCard
          label="Total Population"
          value={population?.total_population ?? 0}
          icon={PawPrint}
          accent="forest"
        />

        <KpiCard
          label="Species Richness"
          value={population?.species_richness ?? 0}
          icon={Leaf}
          accent="earth"
        />

        <KpiCard
          label="Protected Areas"
          value={health?.metrics.protected_area_count ?? 0}
          icon={MapPin}
          accent="ocean"
        />

        <KpiCard
          label="Threatened Species"
          value={health?.metrics.endangered_species_count ?? 0}
          icon={AlertTriangle}
          accent="danger"
        />

        <KpiCard
          label="Ecosystem Health"
          value={health?.overall ?? 0}
          icon={Activity}
          accent="forest"
        />

      </div>

      {/* HEALTH + POPULATION SUMMARY */}

      <div className="grid gap-4 lg:grid-cols-3">

        <div className="glass rounded-2xl p-5 lg:col-span-1">

          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-forest" />

            <div className="font-display text-lg font-semibold">
              Ecosystem Health
            </div>
          </div>

          <div className={`font-display text-5xl font-bold ${healthColor}`}>
            {health?.overall ?? 0}
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            Overall ecosystem health score
          </div>

          <div className={`mt-4 font-semibold ${healthColor}`}>
            {healthStatus}
          </div>

        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-2">

          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-ocean" />

            <div className="font-display text-lg font-semibold">
              Population Status
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl border bg-card/50 p-4">
              <div className="text-xs text-muted-foreground">
                Previous
              </div>

              <div className="mt-1 text-2xl font-semibold">
                {growth?.previous_population ?? 0}
              </div>
            </div>

            <div className="rounded-xl border bg-card/50 p-4">
              <div className="text-xs text-muted-foreground">
                Current
              </div>

              <div className="mt-1 text-2xl font-semibold">
                {growth?.current_population ?? 0}
              </div>
            </div>

            <div className="rounded-xl border bg-card/50 p-4">
              <div className="text-xs text-muted-foreground">
                Growth Rate
              </div>

              <div className="mt-1 text-2xl font-semibold">
                {growth?.growth_rate ?? 0}%
              </div>
            </div>

          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {populationMessage}
          </div>

        </div>

      </div>

      {/* POPULATION TREND */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4">
          <div className="font-display text-lg font-semibold">
            Wildlife Population Trend
          </div>

          <div className="text-xs text-muted-foreground">
            Population observations over time.
          </div>
        </div>

        {populationTrend.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
            No population trend data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={populationTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="month"
                fontSize={11}
              />

              <YAxis fontSize={11} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="observations"
                name="Population"
                stroke="var(--forest)"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

      </div>

      {/* SPECIES + PROTECTED AREAS */}

      <div className="grid gap-4 lg:grid-cols-2">

        <div className="glass rounded-2xl p-5">

          <div className="mb-4 flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-forest" />

            <div>
              <div className="font-display text-lg font-semibold">
                Species Population
              </div>

              <div className="text-xs text-muted-foreground">
                Population by species.
              </div>
            </div>
          </div>

          {species.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
              No species data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={species}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.2}
                />

                <XAxis
                  dataKey="species"
                  fontSize={10}
                />

                <YAxis fontSize={11} />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Population"
                  fill="var(--forest)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

        </div>

        <div className="glass rounded-2xl p-5">

          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-ocean" />

            <div>
              <div className="font-display text-lg font-semibold">
                Protected Area Population
              </div>

              <div className="text-xs text-muted-foreground">
                Population across protected areas.
              </div>
            </div>
          </div>

          {areas.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
              No protected area data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={areas}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.2}
                />

                <XAxis
                  dataKey="area"
                  fontSize={10}
                />

                <YAxis fontSize={11} />

                <Tooltip />

                <Bar
                  dataKey="animals"
                  name="Population"
                  fill="var(--ocean)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

        </div>

      </div>

      {/* TOP INTELLIGENCE */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div className="glass rounded-2xl p-5">

          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />

            <div className="font-display font-semibold">
              Highest Population Species
            </div>
          </div>

          {topSpecies ? (
            <>
              <div className="text-2xl font-semibold">
                {topSpecies.species}
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                {topSpecies.count} animals observed
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              No species data available.
            </div>
          )}

        </div>

        <div className="glass rounded-2xl p-5">

          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-ocean" />

            <div className="font-display font-semibold">
              Highest Population Area
            </div>
          </div>

          {topArea ? (
            <>
              <div className="text-2xl font-semibold">
                {topArea.area}
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                {topArea.animals} animals observed
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              No protected area data available.
            </div>
          )}

        </div>

        <div className="glass rounded-2xl p-5">

          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />

            <div className="font-display font-semibold">
              Wildlife Alert
            </div>
          </div>

          <div className="text-sm leading-6 text-muted-foreground">
            {populationMessage}
          </div>

          <div className="mt-3 text-sm font-semibold">
            Current trend: {growth?.trend ?? "Unknown"}
          </div>

        </div>

      </div>

      {/* ECOSYSTEM COMPONENTS */}

      {health?.parts && health.parts.length > 0 && (
        <div className="glass rounded-2xl p-5">

          <div className="mb-4">
            <div className="font-display text-lg font-semibold">
              Ecosystem Health Components
            </div>

            <div className="text-xs text-muted-foreground">
              Current component scores contributing to ecosystem health.
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {health.parts.map((part) => (
              <div
                key={part.label}
                className="rounded-xl border bg-card/50 p-4"
              >
                <div className="text-sm font-medium">
                  {part.label}
                </div>

                <div className="mt-2 text-2xl font-semibold">
                  {part.value}
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Weight: {part.weight}%
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-forest"
                    style={{
                      width: `${Math.min(part.value, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

export default WildlifeDashboard;