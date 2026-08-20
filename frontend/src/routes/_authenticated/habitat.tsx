import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Leaf,
  TreePine,
  PawPrint,
  TrendingUp,
} from "lucide-react";

import { KpiCard } from "@/components/kpi-card";

import {
  getBiodiversityByHabitat,
  getPopulationByHabitat,
  type BiodiversityByHabitat,
  type PopulationByHabitat,
} from "@/services/analyticsService";

export const Route = createFileRoute(
  "/_authenticated/habitat"
)({
  component: HabitatIntelligence,
});

function HabitatIntelligence() {
  const [habitatData, setHabitatData] =
    useState<BiodiversityByHabitat[]>([]);

  const [populationByHabitat, setPopulationByHabitat] =
    useState<PopulationByHabitat[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================
  // LOAD HABITAT DATA
  // ==========================================

  useEffect(() => {
    async function loadHabitatData() {
      try {
        setError(null);

        const [
          biodiversity,
          population,
        ] = await Promise.all([
          getBiodiversityByHabitat(),
          getPopulationByHabitat(),
        ]);

        console.log(
          "BIODIVERSITY BY HABITAT:",
          biodiversity
        );

        console.log(
          "POPULATION BY HABITAT:",
          population
        );

        setHabitatData(biodiversity);

        setPopulationByHabitat(
          population
        );
      } catch (error) {
        console.error(
          "Failed to load habitat data:",
          error
        );

        setError(
          "Failed to load habitat analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHabitatData();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading Habitat Intelligence...
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  // ==========================================
  // KPI CALCULATIONS
  // ==========================================

  const totalHabitats =
    habitatData.length;

  const totalSpecies =
    habitatData.reduce(
      (sum, item) =>
        sum + item.richness,
      0
    );

  const highestRichness =
    habitatData.length > 0
      ? Math.max(
          ...habitatData.map(
            (item) => item.richness
          )
        )
      : 0;

  const mostBiodiverse =
    habitatData.length > 0
      ? habitatData.reduce(
          (previous, current) =>
            current.richness >
            previous.richness
              ? current
              : previous
        )
      : null;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="space-y-6">

      {/* ====================================== */}
      {/* PAGE HEADER */}
      {/* ====================================== */}

      <div>
        <h1 className="font-display text-3xl font-semibold">
          Habitat Intelligence
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Habitat biodiversity, species richness
          and ecosystem analysis across
          protected areas.
        </p>
      </div>

      {/* ====================================== */}
      {/* KPI CARDS */}
      {/* ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          label="Total Habitats"
          value={totalHabitats}
          icon={TreePine}
          accent="forest"
        />

        <KpiCard
          label="Total Species"
          value={totalSpecies}
          icon={PawPrint}
          accent="ocean"
        />

        <KpiCard
          label="Highest Richness"
          value={highestRichness}
          icon={Leaf}
          accent="earth"
        />

        <KpiCard
          label="Most Biodiverse"
          value={
            mostBiodiverse?.habitat ?? "-"
          }
          icon={TrendingUp}
          accent="forest"
        />

      </div>

      {/* ====================================== */}
      {/* SPECIES RICHNESS BY HABITAT */}
      {/* ====================================== */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <div className="font-display text-lg font-semibold">
              Species Richness by Habitat
            </div>

            <div className="text-xs text-muted-foreground">
              Number of unique species observed
              across habitat types
            </div>
          </div>

          <Leaf className="h-4 w-4 text-muted-foreground" />

        </div>

        {habitatData.length === 0 ? (

          <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
            No habitat data available.
          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={habitatData}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="habitat"
                fontSize={11}
              />

              <YAxis
                fontSize={11}
                allowDecimals={false}
              />

              <Tooltip />

              <Bar
                dataKey="richness"
                name="Species Richness"
                fill="var(--forest)"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        )}

      </div>

      {/* ====================================== */}
      {/* POPULATION BY HABITAT */}
      {/* ====================================== */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <div className="font-display text-lg font-semibold">
              Population by Habitat
            </div>

            <div className="text-xs text-muted-foreground">
              Total animals observed across
              habitat types
            </div>
          </div>

          <PawPrint className="h-4 w-4 text-muted-foreground" />

        </div>

        {populationByHabitat.length === 0 ? (

          <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
            No population data available.
          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={populationByHabitat}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="habitat"
                fontSize={11}
              />

              <YAxis
                fontSize={11}
                allowDecimals={false}
              />

              <Tooltip />

              <Bar
                dataKey="population"
                name="Population"
                fill="var(--ocean)"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        )}

      </div>

      {/* ====================================== */}
      {/* HABITAT TABLE */}
      {/* ====================================== */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4">

          <div className="font-display text-lg font-semibold">
            Habitat Analysis
          </div>

          <div className="text-xs text-muted-foreground">
            Biodiversity summary by habitat type
          </div>

        </div>

        {habitatData.length === 0 ? (

          <div className="text-sm text-muted-foreground">
            No habitat data available.
          </div>

        ) : (

          <div className="space-y-2">

            {[...habitatData]
              .sort(
                (a, b) =>
                  b.richness -
                  a.richness
              )
              .map(
                (item, index) => (

                  <div
                    key={item.habitat}
                    className="flex items-center justify-between rounded-lg border bg-card/50 p-3"
                  >

                    <div className="flex items-center gap-3">

                      <span className="text-sm font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>

                      <div>

                        <div className="text-sm font-medium">
                          {item.habitat}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Habitat type
                        </div>

                      </div>

                    </div>

                    <div className="text-right">

                      <div className="font-semibold">
                        {item.richness}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        species
                      </div>

                    </div>

                  </div>

                )
              )}

          </div>

        )}

      </div>

    </div>
  );
}

export default HabitatIntelligence;