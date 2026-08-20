import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  Leaf,
  MapPin,
  PawPrint,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getPopulationTrend,
  type PopulationTrend,
} from "@/services/populationTrendService";

import { KpiCard } from "@/components/kpi-card";

import {
  getPopulationEstimation,
  type PopulationEstimation,
} from "@/services/populationEstimationService";
import {
  getPopulationGrowth,
  type PopulationGrowth,
} from "@/services/populationGrowthService";
import {
  getSpeciesTrends,
  getProtectedAreaAnalytics,
  type SpeciesTrend,
  type ProtectedAreaAnalytics,
} from "@/services/analyticsService";

export const Route = createFileRoute(
  "/_authenticated/population-intelligence"
)({
  component: PopulationIntelligence,
});

function PopulationIntelligence() {
  const [population, setPopulation] =
    useState<PopulationEstimation | null>(null);
  const [growth, setGrowth] =
  useState<PopulationGrowth | null>(null);
const [populationTrend, setPopulationTrend] =
  useState<PopulationTrend[]>([]);
  const [species, setSpecies] =
    useState<SpeciesTrend[]>([]);

  const [areas, setAreas] =
    useState<ProtectedAreaAnalytics[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPopulationData() {
      try {
  const results = await Promise.allSettled([
    getPopulationEstimation(),
    getSpeciesTrends(),
    getProtectedAreaAnalytics(),
    getPopulationGrowth(),
    getPopulationTrend(),
  ]);

  const [
    populationResult,
    speciesResult,
    protectedAreaResult,
    growthResult,
    trendResult,
  ] = results;

  if (populationResult.status === "fulfilled") {
    setPopulation(populationResult.value);
  } else {
    console.error(
      "Population estimation failed:",
      populationResult.reason
    );
  }

  if (speciesResult.status === "fulfilled") {
    setSpecies(speciesResult.value);
  } else {
    console.error(
      "Species trends failed:",
      speciesResult.reason
    );
  }

  if (protectedAreaResult.status === "fulfilled") {
    setAreas(protectedAreaResult.value);
  } else {
    console.error(
      "Protected area analytics failed:",
      protectedAreaResult.reason
    );
  }

  if (growthResult.status === "fulfilled") {
    setGrowth(growthResult.value);
  } else {
    console.error(
      "Population growth failed:",
      growthResult.reason
    );
  }

  if (trendResult.status === "fulfilled") {
    setPopulationTrend(trendResult.value);
  } else {
    console.error(
      "Population trend failed:",
      trendResult.reason
    );
  }
} catch (error) {
  console.error(
    "Failed to load population intelligence:",
    error
  );
}finally {
        setLoading(false);
      }
    }

    loadPopulationData();
  }, []);
  // =========================================
  // POPULATION INTELLIGENCE INSIGHTS
  // =========================================

  const topSpecies = [...species]
    .sort((a, b) => b.count - a.count)[0];

  const topArea = [...areas]
    .sort((a, b) => b.animals - a.animals)[0];

  const populationAlert =
    growth?.trend === "Declining"
      ? "Population is declining. Conservation attention is recommended."
      : growth?.trend === "Increasing"
      ? "Population is increasing. Continue current conservation efforts."
      : "Population is relatively stable.";

  const conservationSuggestion =
    growth?.trend === "Declining"
      ? "Increase monitoring frequency and investigate possible threats."
      : growth?.trend === "Increasing"
      ? "Maintain habitat protection and continue population monitoring."
      : "Continue regular wildlife monitoring and habitat protection.";
  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading Population Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="font-display text-3xl font-semibold">
          Population Intelligence
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Wildlife population estimation, species analysis,
          protected area comparison and population insights.
        </p>
      </div>


      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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
          label="Population Density"
          value={population?.population_density ?? 0}
          icon={Activity}
          accent="ocean"
        />

        <KpiCard
          label="Growth Status"
          value={population?.growth_status ?? "-"}
          icon={TrendingUp}
          accent="forest"
        />
<KpiCard
  label="Growth Rate"
  value={`${growth?.growth_rate ?? 0}%`}
  icon={TrendingUp}
  accent="ocean"
/>
      </div>
{/* POPULATION GROWTH */}

<div className="glass rounded-2xl p-5">

  <div className="mb-4">

    <div className="font-display text-lg font-semibold">
      Population Growth
    </div>

    <div className="text-xs text-muted-foreground">
      Comparison between the previous and current population
    </div>

  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

    <div className="rounded-xl border bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">
        Previous Population
      </div>

      <div className="mt-1 font-display text-2xl font-semibold">
        {growth?.previous_population ?? 0}
      </div>
    </div>

    <div className="rounded-xl border bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">
        Current Population
      </div>

      <div className="mt-1 font-display text-2xl font-semibold">
        {growth?.current_population ?? 0}
      </div>
    </div>

    <div className="rounded-xl border bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">
        Growth Rate
      </div>

      <div className="mt-1 font-display text-2xl font-semibold">
        {growth?.growth_rate ?? 0}%
      </div>
    </div>

    <div className="rounded-xl border bg-card/50 p-4">
      <div className="text-xs text-muted-foreground">
        Trend
      </div>

      <div className="mt-1 font-display text-2xl font-semibold">
        {growth?.trend ?? "-"}
      </div>
    </div>

  </div>

</div>
{/* POPULATION TREND */}

<div className="glass rounded-2xl p-5">

  <div className="mb-4">

    <div className="font-display text-lg font-semibold">
      Population Trend
    </div>

    <div className="text-xs text-muted-foreground">
      Monthly wildlife population observations
    </div>

  </div>

  {populationTrend.length === 0 ? (

    <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
      No population trend data available.
    </div>

  ) : (

    <ResponsiveContainer
      width="100%"
      height={300}
    >

      <LineChart
        data={populationTrend}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.2}
        />

        <XAxis
          dataKey="month"
          fontSize={12}
        />

        <YAxis
          fontSize={12}
        />

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

      {/* SPECIES POPULATION */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <div className="font-display text-lg font-semibold">
              Species Population
            </div>

            <div className="text-xs text-muted-foreground">
              Population ranking by species
            </div>
          </div>

          <PawPrint className="h-4 w-4 text-muted-foreground" />

        </div>

        {species.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No species population data available.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart data={species}>

              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="species"
                fontSize={11}
              />

              <YAxis
                fontSize={11}
              />

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


      {/* PROTECTED AREA POPULATION */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <div className="font-display text-lg font-semibold">
              Protected Area Population
            </div>

            <div className="text-xs text-muted-foreground">
              Population comparison across protected areas
            </div>
          </div>

          <MapPin className="h-4 w-4 text-muted-foreground" />

        </div>

        {areas.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No protected area population data available.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart data={areas}>

              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="area"
                fontSize={11}
              />

              <YAxis
                fontSize={11}
              />

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


      {/* RANKING TABLES */}

      <div className="grid gap-4 lg:grid-cols-2">

        {/* SPECIES RANKING */}

        <div className="glass rounded-2xl p-5">

          <div className="mb-4 font-display text-lg font-semibold">
            Species Ranking
          </div>

          <div className="space-y-2">

            {species.slice(0, 10).map((item, index) => (

              <div
                key={item.species}
                className="flex items-center justify-between rounded-lg border bg-card/50 p-3"
              >

                <div className="flex items-center gap-3">

                  <span className="text-sm font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>

                  <span className="text-sm font-medium">
                    {item.species}
                  </span>

                </div>

                <span className="font-semibold">
                  {item.count}
                </span>

              </div>

            ))}

          </div>

        </div>


        {/* PROTECTED AREA RANKING */}

        <div className="glass rounded-2xl p-5">

          <div className="mb-4 font-display text-lg font-semibold">
            Protected Area Ranking
          </div>

          <div className="space-y-2">

            {[...areas]
              .sort((a, b) => b.animals - a.animals)
              .slice(0, 10)
              .map((item, index) => (

                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border bg-card/50 p-3"
                >

                  <div className="flex items-center gap-3">

                    <span className="text-sm font-semibold text-muted-foreground">
                      #{index + 1}
                    </span>

                    <span className="text-sm font-medium">
                      {item.area}
                    </span>

                  </div>

                  <span className="font-semibold">
                    {item.animals}
                  </span>

                </div>

              ))}

          </div>

               </div>

      </div>


      {/* ========================================= */}
      {/* POPULATION INTELLIGENCE INSIGHTS */}
      {/* ========================================= */}

      <div>

        <div className="mb-4">

          <div className="font-display text-xl font-semibold">
            Population Intelligence Insights
          </div>

          <div className="text-sm text-muted-foreground">
            Automatically generated insights from wildlife population data.
          </div>

        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">


          {/* FASTEST / HIGHEST POPULATION SPECIES */}

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


          {/* HIGHEST POPULATION AREA */}

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


          {/* POPULATION ALERT */}

          <div className="glass rounded-2xl p-5">

            <div className="mb-3 flex items-center gap-2">

              <AlertTriangle className="h-5 w-5 text-amber-500" />

              <div className="font-display font-semibold">
                Population Alert
              </div>

            </div>

            <div className="text-sm leading-6 text-muted-foreground">
              {populationAlert}
            </div>

            <div className="mt-3 text-sm font-semibold">
              Current trend: {growth?.trend ?? "Unknown"}
            </div>

          </div>


          {/* CONSERVATION SUGGESTION */}

          <div className="glass rounded-2xl p-5">

            <div className="mb-3 flex items-center gap-2">

              <Lightbulb className="h-5 w-5 text-forest" />

              <div className="font-display font-semibold">
                Conservation Suggestion
              </div>

            </div>

            <div className="text-sm leading-6 text-muted-foreground">
              {conservationSuggestion}
            </div>

          </div>


        </div>

      </div>


    </div>
  );
}

export default PopulationIntelligence;