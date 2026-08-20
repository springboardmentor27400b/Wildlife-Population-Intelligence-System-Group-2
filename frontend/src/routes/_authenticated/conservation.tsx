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
  ShieldAlert,
  PawPrint,
  Sparkles,
} from "lucide-react";

import { KpiCard } from "@/components/kpi-card";
import {
  getConservationSpecies,
  getThreatenedSpecies,
  type ConservationSpecies,
  type ThreatenedSpecies,
} from "@/services/analyticsService";

export const Route = createFileRoute("/_authenticated/conservation")({
  head: () => ({
    meta: [{ title: "Conservation — WPIS" }],
  }),
  component: Conservation,
});

function Conservation() {
  console.log("THIS IS THE CONSERVATION.TSX PAGE");
  const [species, setSpecies] = useState<ConservationSpecies[]>([]);
  const [threatened, setThreatened] = useState<ThreatenedSpecies[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [speciesData, threatenedData] = await Promise.all([
          getConservationSpecies(),
          getThreatenedSpecies(),
        ]);

        console.log("CONSERVATION SPECIES:", speciesData);
        console.log("THREATENED SPECIES:", threatenedData);

        setSpecies(speciesData);
        setThreatened(threatenedData);
      } catch (error) {
        console.error("Failed to load conservation data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading Conservation Intelligence...
      </div>
    );
  }

  const totalSpecies = species.length;

  const totalPopulation = species.reduce(
    (sum, item) => sum + item.population,
    0
  );

  const threatenedCount = threatened.length;

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="font-display text-3xl font-semibold">
          Conservation Intelligence
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Wildlife conservation status, species populations and threatened
          species analysis.
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
          label="Total Population"
          value={totalPopulation}
          icon={Leaf}
          accent="ocean"
        />

        <KpiCard
          label="Threatened Species"
          value={threatenedCount}
          icon={ShieldAlert}
          accent="earth"
        />

        <KpiCard
          label="Conservation Status"
          value={threatenedCount > 0 ? "Attention Required" : "Good"}
          icon={Sparkles}
          accent="forest"
        />
      </div>

      {/* CONSERVATION SPECIES CHART */}

      <div className="glass rounded-2xl p-5">
        <div className="mb-4">
          <div className="font-display text-lg font-semibold">
            Conservation Species
          </div>

          <div className="text-xs text-muted-foreground">
            Population distribution across observed species
          </div>
        </div>

        {species.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
            No conservation species data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={species}>
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="species"
                fontSize={11}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={80}
              />

              <YAxis fontSize={11} />

              <Tooltip />

              <Bar
                dataKey="population"
                name="Population"
                fill="var(--forest)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* THREATENED SPECIES CHART */}

      <div className="glass rounded-2xl p-5">
        <div className="mb-4">
          <div className="font-display text-lg font-semibold">
            Threatened Species
          </div>

          <div className="text-xs text-muted-foreground">
            Species requiring conservation attention
          </div>
        </div>

        {threatened.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
            No threatened species data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={threatened}>
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="species"
                fontSize={11}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={80}
              />

              <YAxis fontSize={11} />

              <Tooltip />

              <Bar
                dataKey="population"
                name="Population"
                fill="var(--earth)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default Conservation;