import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Leaf,
  MapPin,
  PawPrint,
  ShieldCheck,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  getEcosystemHealthHistory,
  type EcosystemHealth,
  type EcosystemHealthHistory,
} from "@/services/analyticsService";

export const Route = createFileRoute(
  "/_authenticated/ecosystem-health"
)({
  component: EcosystemHealthPage,
});

function getHealthColor(status: string) {
  switch (status.toLowerCase()) {
    case "excellent":
      return "var(--forest)";

    case "good":
      return "var(--ocean)";

    case "moderate":
      return "var(--earth)";

    case "poor":
      return "var(--danger)";

    default:
      return "var(--muted-foreground)";
  }
}

function EcosystemHealthPage() {
  const [health, setHealth] =
    useState<EcosystemHealth | null>(null);
const [history, setHistory] =
  useState<EcosystemHealthHistory[]>([]);
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadHealth() {
      try {
        const [
  healthData,
  historyData,
] = await Promise.all([
  getEcosystemHealth(),
  getEcosystemHealthHistory(),
]);

console.log(
  "ECOSYSTEM HEALTH:",
  healthData
);

console.log(
  "ECOSYSTEM HEALTH HISTORY:",
  historyData
);

setHealth(healthData);
setHistory(historyData);
      } catch (err) {
        console.error(
          "Failed to load ecosystem health:",
          err
        );

        setError(
          "Failed to load ecosystem health data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHealth();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading Ecosystem Health Analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="p-6">
        No ecosystem health data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="font-display text-3xl font-semibold">
          Ecosystem Health Analytics
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Overall ecosystem condition based on biodiversity,
          population, habitat protection and conservation status.
        </p>
      </div>

      {/* OVERALL HEALTH */}

      <div className="glass rounded-2xl p-6">

        <div className="grid gap-6 lg:grid-cols-2">

          <div>

            <div className="text-sm text-muted-foreground">
              Overall Ecosystem Health
            </div>

            <div
              className="mt-2 font-display text-6xl font-bold"
              style={{
                color: getHealthColor(
                  health.status
                ),
              }}
            >
              {health.overall}
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              Overall health score out of 100
            </div>

            <div
              className="mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                color: getHealthColor(
                  health.status
                ),
                backgroundColor:
                  `${getHealthColor(
                    health.status
                  )}20`,
              }}
            >
              {health.status}
            </div>

          </div>

          <div className="flex items-center justify-center">

            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-8 border-muted">

              <div
                className="absolute inset-0 rounded-full border-8"
                style={{
                  borderColor:
                    getHealthColor(
                      health.status
                    ),
                  clipPath: `inset(${
                    100 - health.overall
                  }% 0 0 0)`,
                }}
              />

              <div className="text-center">

                <Activity
                  className="mx-auto h-8 w-8"
                  style={{
                    color:
                      getHealthColor(
                        health.status
                      ),
                  }}
                />

                <div className="mt-1 text-xs text-muted-foreground">
                  Health Score
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          label="Species"
          value={
            health.metrics.species_count
          }
          icon={PawPrint}
          accent="forest"
        />

        <KpiCard
          label="Total Animals"
          value={
            health.metrics.total_animals
          }
          icon={Activity}
          accent="ocean"
        />

        <KpiCard
          label="Protected Areas"
          value={
            health.metrics.protected_area_count
          }
          icon={MapPin}
          accent="earth"
        />

        <KpiCard
          label="Threatened Species"
          value={
            health.metrics.endangered_species_count
          }
          icon={AlertTriangle}
          accent="danger"
        />

      </div>

      {/* COMPONENT SCORES */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4">

          <div className="font-display text-lg font-semibold">
            Ecosystem Health Components
          </div>

          <div className="text-xs text-muted-foreground">
            Individual component scores contributing to
            overall ecosystem health.
          </div>

        </div>

        {health.parts.length === 0 ? (

          <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
            No ecosystem component data available.
          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={health.parts}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="label"
                fontSize={11}
              />

              <YAxis
                domain={[0, 100]}
                fontSize={11}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                name="Score"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              >

                {health.parts.map(
                  (item, index) => (

                    <Cell
                      key={`${item.label}-${index}`}
                      fill={
                        item.value >= 80
                          ? "var(--forest)"
                          : item.value >= 60
                          ? "var(--ocean)"
                          : item.value >= 40
                          ? "var(--earth)"
                          : "var(--danger)"
                      }
                    />

                  )
                )}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        )}

      </div>
      {/* ========================================= */}
{/* ECOSYSTEM HEALTH HISTORY */}
{/* ========================================= */}

<div className="glass rounded-2xl p-5">

  <div className="mb-4">

    <div className="font-display text-lg font-semibold">
      Ecosystem Health History
    </div>

    <div className="text-xs text-muted-foreground">
      Historical ecosystem health scores over time.
    </div>

  </div>

  {history.length === 0 ? (

    <div className="flex h-[320px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
      No ecosystem health history available.
    </div>

  ) : (

    <ResponsiveContainer
      width="100%"
      height={320}
    >

      <LineChart
        data={history}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.2}
        />

        <XAxis
          dataKey="date"
          fontSize={11}
        />

        <YAxis
          domain={[0, 100]}
          allowDecimals={false}
          fontSize={11}
        />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="overall_score"
          name="Overall Health"
          stroke="var(--forest)"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />

        <Line
          type="monotone"
          dataKey="biodiversity_score"
          name="Biodiversity"
          stroke="var(--ocean)"
          strokeWidth={2}
        />

        <Line
          type="monotone"
          dataKey="population_score"
          name="Population"
          stroke="var(--earth)"
          strokeWidth={2}
        />

        <Line
          type="monotone"
          dataKey="habitat_score"
          name="Habitat"
          stroke="var(--danger)"
          strokeWidth={2}
        />

      </LineChart>

    </ResponsiveContainer>

  )}

</div>

      {/* COMPONENT DETAILS */}

      <div className="grid gap-4 md:grid-cols-2">

        {health.parts.map((part) => (

          <div
            key={part.label}
            className="glass rounded-2xl p-5"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10">

                  {part.label ===
                  "Biodiversity" ? (
                    <Leaf className="h-5 w-5 text-forest" />
                  ) : part.label ===
                    "Population" ? (
                    <PawPrint className="h-5 w-5 text-ocean" />
                  ) : part.label ===
                    "Habitat Protection" ? (
                    <MapPin className="h-5 w-5 text-earth" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-forest" />
                  )}

                </div>

                <div>

                  <div className="font-semibold">
                    {part.label}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Weight: {part.weight}%
                  </div>

                </div>

              </div>

              <div className="text-2xl font-semibold">
                {part.value}
              </div>

            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">

              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(
                    part.value,
                    100
                  )}%`,
                  backgroundColor:
                    getHealthColor(
                      part.value >= 80
                        ? "Excellent"
                        : part.value >= 60
                        ? "Good"
                        : part.value >= 40
                        ? "Moderate"
                        : "Poor"
                    ),
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default EcosystemHealthPage;
