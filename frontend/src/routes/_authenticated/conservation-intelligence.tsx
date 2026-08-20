import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Leaf,
  PawPrint,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { KpiCard } from "@/components/kpi-card";

import {
  getConservationStatus,
  getConservationSpecies,
  getConservationRecommendations,
  type ConservationStatus,
  type ConservationSpecies,
  type ConservationRecommendation,
  type ConservationRecommendationSummary,
} from "@/services/analyticsService";

export const Route = createFileRoute(
  "/_authenticated/conservation-intelligence"
)({
  component: ConservationIntelligence,
});

const statusColors: Record<string, string> = {
  "Critically Endangered": "var(--danger)",
  Endangered: "var(--danger)",
  Vulnerable: "var(--sun)",
  "Near Threatened": "var(--earth)",
  "Least Concern": "var(--forest)",
  "Data Deficient": "var(--ocean)",
  "Not Evaluated": "var(--muted-foreground)",
  Unknown: "var(--muted-foreground)",
};

function safeStatus(value: unknown): string {
  if (typeof value !== "string") {
    return "Unknown";
  }

  const valueTrimmed = value.trim();

  if (!valueTrimmed) {
    return "Unknown";
  }

  return valueTrimmed;
}

function getStatusColor(value: unknown) {
  const status = safeStatus(value);

  return statusColors[status] ?? "var(--forest)";
}

function ConservationIntelligence() {
  const [statusData, setStatusData] =
    useState<ConservationStatus[]>([]);

  const [speciesData, setSpeciesData] =
    useState<ConservationSpecies[]>([]);
  const [recommendations, setRecommendations] =
  useState<ConservationRecommendation[]>([]);

const [recommendationSummary, setRecommendationSummary] =
  useState<ConservationRecommendationSummary | null>(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadConservationData() {
      try {
       const [
  conservationStatus,
  conservationSpecies,
  conservationRecommendations,
] = await Promise.all([
  getConservationStatus(),
  getConservationSpecies(),
  getConservationRecommendations(),
]);
setStatusData(conservationStatus);
setSpeciesData(conservationSpecies);

setRecommendationSummary(
  conservationRecommendations.summary
);

setRecommendations(
  conservationRecommendations.recommendations
);
        console.log(
          "CONSERVATION STATUS:",
          conservationStatus
        );

        console.log(
          "CONSERVATION SPECIES:",
          conservationSpecies
        );
       console.log(
  "CONSERVATION RECOMMENDATIONS:",
  conservationRecommendations
);
        setStatusData(
          Array.isArray(conservationStatus)
            ? conservationStatus
            : []
        );

        setSpeciesData(
          Array.isArray(conservationSpecies)
            ? conservationSpecies
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load conservation data:",
          error
        );

        setStatusData([]);
        setSpeciesData([]);
      } finally {
        setLoading(false);
      }
    }

    loadConservationData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading Conservation Intelligence...
      </div>
    );
  }

  // =========================================
  // KPI CALCULATIONS
  // =========================================

  const totalSpecies = speciesData.length;

  const endangeredSpecies = speciesData.filter(
    (item) => {
      const status = safeStatus(item.status).toLowerCase();

      return (
        status === "endangered" ||
        status === "critically endangered"
      );
    }
  ).length;

  const vulnerableSpecies = speciesData.filter(
    (item) => {
      const status = safeStatus(item.status).toLowerCase();

      return status === "vulnerable";
    }
  ).length;

  const threatenedSpecies =
    endangeredSpecies + vulnerableSpecies;

  const highestPriority =
    speciesData.filter((item) => {
      const status =
        safeStatus(item.status).toLowerCase();

      return (
        status === "critically endangered" ||
        status === "endangered"
      );
    });

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="font-display text-3xl font-semibold">
          Conservation Intelligence
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Wildlife conservation status, threatened
          species and IUCN population analysis.
        </p>
      </div>

      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          label="Observed Species"
          value={totalSpecies}
          icon={PawPrint}
          accent="forest"
        />

        <KpiCard
          label="Endangered Species"
          value={endangeredSpecies}
          icon={ShieldAlert}
          accent="danger"
          hint="Critically Endangered + Endangered"
        />

        <KpiCard
          label="Vulnerable Species"
          value={vulnerableSpecies}
          icon={AlertTriangle}
          accent="earth"
        />

        <KpiCard
          label="Threatened Species"
          value={threatenedSpecies}
          icon={TrendingUp}
          accent="ocean"
        />

      </div>
{/* ===================================== */}
{/* CONSERVATION RECOMMENDATION SUMMARY */}
{/* ===================================== */}

<div className="glass rounded-2xl p-5">

  <div className="mb-4">

    <div className="font-display text-lg font-semibold">
      Conservation Recommendation Summary
    </div>

    <div className="text-xs text-muted-foreground">
      Automatically generated conservation priorities
      from wildlife population and conservation data.
    </div>

  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

    <div className="rounded-xl border bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">
        Total Recommendations
      </div>

      <div className="mt-1 font-display text-2xl font-semibold">
        {recommendationSummary?.total_recommendations ?? 0}
      </div>
    </div>

    <div className="rounded-xl border bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">
        Critical
      </div>

      <div className="mt-1 font-display text-2xl font-semibold">
        {recommendationSummary?.critical ?? 0}
      </div>
    </div>

    <div className="rounded-xl border bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">
        High Priority
      </div>

      <div className="mt-1 font-display text-2xl font-semibold">
        {recommendationSummary?.high_priority ?? 0}
      </div>
    </div>

    <div className="rounded-xl border bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">
        Medium Priority
      </div>

      <div className="mt-1 font-display text-2xl font-semibold">
        {recommendationSummary?.medium_priority ?? 0}
      </div>
    </div>

  </div>

</div>
{/* ===================================== */}
{/* CONSERVATION RECOMMENDATIONS */}
{/* ===================================== */}

<div className="glass rounded-2xl p-5">

  <div className="mb-5">

    <div className="font-display text-xl font-semibold">
      Conservation Recommendations
    </div>

    <div className="text-sm text-muted-foreground">
      Data-driven recommendations for wildlife
      protection, habitat restoration, monitoring,
      and resource allocation.
    </div>

  </div>

  {recommendations.length === 0 ? (

    <div className="flex h-[200px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
      No conservation recommendations available.
    </div>

  ) : (

    <div className="grid gap-4 md:grid-cols-2">

      {recommendations.map((recommendation) => (

        <div
          key={recommendation.id}
          className="rounded-2xl border bg-card/50 p-5"
        >

          {/* HEADER */}

          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="text-xs font-medium text-muted-foreground">
                {recommendation.category}
              </div>

              <div className="mt-1 font-display text-lg font-semibold">
                {recommendation.title}
              </div>

            </div>

            <span
              className={`
                rounded-full px-3 py-1 text-xs font-semibold
                ${
                  recommendation.priority === "High"
                    ? "bg-red-500/10 text-red-600"
                    : recommendation.priority === "Medium"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-muted text-muted-foreground"
                }
              `}
            >
              {recommendation.priority}
            </span>

          </div>


          {/* DETAIL */}

          <div className="mt-3 text-sm leading-6 text-muted-foreground">
            {recommendation.detail}
          </div>


          {/* SPECIES */}

          {recommendation.species && (

            <div className="mt-4 rounded-lg border bg-background/40 p-3">

              <div className="text-xs text-muted-foreground">
                Species
              </div>

              <div className="mt-1 text-sm font-semibold">
                {recommendation.species}
              </div>

              {recommendation.scientific_name && (
                <div className="text-xs italic text-muted-foreground">
                  {recommendation.scientific_name}
                </div>
              )}

            </div>

          )}


          {/* PROTECTED AREA */}

          {recommendation.protected_area && (

            <div className="mt-3 rounded-lg border bg-background/40 p-3">

              <div className="text-xs text-muted-foreground">
                Protected Area
              </div>

              <div className="mt-1 text-sm font-semibold">
                {recommendation.protected_area}
              </div>

              {recommendation.habitat && (
                <div className="text-xs text-muted-foreground">
                  Habitat: {recommendation.habitat}
                </div>
              )}

            </div>

          )}


          {/* STATUS / TREND */}

          {(recommendation.status ||
            recommendation.trend) && (

            <div className="mt-4 flex flex-wrap gap-2">

              {recommendation.status && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs">
                  Status: {recommendation.status}
                </span>
              )}

              {recommendation.trend && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs">
                  Trend: {recommendation.trend}
                </span>
              )}

            </div>

          )}


          {/* ACTION */}

          {recommendation.recommended_action && (

            <div className="mt-4">

              <div className="text-xs text-muted-foreground">
                Recommended Action
              </div>

              <div className="mt-1 text-sm font-semibold">
                {recommendation.recommended_action}
              </div>

            </div>

          )}


          {/* IMPACT */}

          <div className="mt-5">

            <div className="mb-1 flex items-center justify-between">

              <span className="text-xs text-muted-foreground">
                Impact Score
              </span>

              <span className="text-sm font-semibold">
                {recommendation.impact}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">

              <div
                className="h-full rounded-full bg-forest transition-all"
                style={{
                  width: `${Math.min(
                    Math.max(recommendation.impact, 0),
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

        </div>

      ))}

    </div>

  )}

</div>
      {/* ========================================= */}
      {/* IUCN STATUS DISTRIBUTION */}
      {/* ========================================= */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <div className="font-display text-lg font-semibold">
              Conservation Status Distribution
            </div>

            <div className="text-xs text-muted-foreground">
              Observed species grouped by IUCN
              conservation status
            </div>
          </div>

          <Leaf className="h-4 w-4 text-muted-foreground" />

        </div>

        {statusData.length === 0 ? (

          <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
            No conservation status data available.
          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >

                {statusData.map(
                  (item, index) => {

                    const status =
                      safeStatus(item.status);

                    return (
                      <Cell
                        key={`${status}-${index}`}
                        fill={getStatusColor(status)}
                      />
                    );
                  }
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        )}

        {/* STATUS LEGEND */}

        {statusData.length > 0 && (

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

            {statusData.map((item, index) => {

              const status =
                safeStatus(item.status);

              return (
                <div
                  key={`${status}-${index}`}
                  className="flex items-center justify-between rounded-lg border bg-card/50 p-3"
                >

                  <div className="flex items-center gap-2">

                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          getStatusColor(status),
                      }}
                    />

                    <span className="text-sm">
                      {status}
                    </span>

                  </div>

                  <span className="font-semibold">
                    {item.count ?? 0}
                  </span>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* ========================================= */}
      {/* SPECIES BY CONSERVATION STATUS */}
      {/* ========================================= */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <div className="font-display text-lg font-semibold">
              Species Conservation Status
            </div>

            <div className="text-xs text-muted-foreground">
              Number of observed species in each
              conservation category
            </div>
          </div>

          <ShieldAlert className="h-4 w-4 text-muted-foreground" />

        </div>

        {statusData.length === 0 ? (

          <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
            No conservation data available.
          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart data={statusData}>

              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="status"
                fontSize={11}
              />

              <YAxis
                fontSize={11}
                allowDecimals={false}
              />

              <Tooltip />

              <Bar
                dataKey="count"
                name="Species"
                radius={[6, 6, 0, 0]}
              >

                {statusData.map(
                  (item, index) => {

                    const status =
                      safeStatus(item.status);

                    return (
                      <Cell
                        key={`${status}-${index}`}
                        fill={getStatusColor(status)}
                      />
                    );
                  }
                )}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        )}

      </div>

      {/* ========================================= */}
      {/* PRIORITY SPECIES */}
      {/* ========================================= */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4">

          <div className="font-display text-lg font-semibold">
            Priority Conservation Species
          </div>

          <div className="text-xs text-muted-foreground">
            Species classified as Critically
            Endangered or Endangered
          </div>

        </div>

        {highestPriority.length === 0 ? (

          <div className="text-sm text-muted-foreground">
            No priority species found.
          </div>

        ) : (

          <div className="space-y-2">

            {highestPriority.map(
              (item, index) => {

                const status =
                  safeStatus(item.status);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border bg-card/50 p-3"
                  >

                    <div className="flex items-center gap-3">

                      <span className="text-sm font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>

                      <div>

                        <div className="text-sm font-medium">
                          {item.species}
                        </div>

                        <div className="text-xs italic text-muted-foreground">
                          {item.scientific_name}
                        </div>

                      </div>

                    </div>

                    <div className="text-right">

                      <div
                        className="font-semibold"
                        style={{
                          color:
                            getStatusColor(status),
                        }}
                      >
                        {status}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Population: {item.population ?? 0}
                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

      {/* ========================================= */}
      {/* ALL SPECIES TABLE */}
      {/* ========================================= */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4">

          <div className="font-display text-lg font-semibold">
            Conservation Species Analysis
          </div>

          <div className="text-xs text-muted-foreground">
            Conservation status and observed population
            for all species
          </div>

        </div>

        {speciesData.length === 0 ? (

          <div className="text-sm text-muted-foreground">
            No species conservation data available.
          </div>

        ) : (

          <div className="space-y-2">

            {speciesData.map((item) => {

              const status =
                safeStatus(item.status);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border bg-card/50 p-3"
                >

                  <div className="flex items-center gap-3">

                    <PawPrint className="h-4 w-4 text-muted-foreground" />

                    <div>

                      <div className="text-sm font-medium">
                        {item.species}
                      </div>

                      <div className="text-xs italic text-muted-foreground">
                        {item.scientific_name}
                      </div>

                    </div>

                  </div>

                  <div className="text-right">

                    <div
                      className="text-sm font-semibold"
                      style={{
                        color:
                          getStatusColor(status),
                      }}
                    >
                      {status}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Population: {item.population ?? 0}
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default ConservationIntelligence;