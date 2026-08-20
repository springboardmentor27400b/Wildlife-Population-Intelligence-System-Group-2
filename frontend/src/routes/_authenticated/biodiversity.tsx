import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Leaf, Sprout, Sparkles, Activity } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getBiodiversityByHabitat,
  getSpeciesDistribution,
  type BiodiversityByHabitat,
  type SpeciesDistribution,
} from "@/services/analyticsService";

import { toast } from "sonner";
export const Route = createFileRoute("/_authenticated/biodiversity")({
  head: () => ({ meta: [{ title: "Biodiversity — WPIS" }] }),
  component: Biodiversity,
});

const colors = ["var(--forest)", "var(--ocean)", "var(--sun)", "var(--earth)", "var(--danger)", "var(--accent)"];

function Biodiversity() {

  const [
    biodiversityData,
    setBiodiversityData
  ] = useState<BiodiversityByHabitat[]>([]);

  const [
    speciesData,
    setSpeciesData
  ] = useState<SpeciesDistribution[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);


  useEffect(() => {

    async function loadAnalytics() {

      try {

        setLoading(true);

        const [
          habitatData,
          distributionData
        ] = await Promise.all([

          getBiodiversityByHabitat(),

          getSpeciesDistribution(),

        ]);

        setBiodiversityData(
          habitatData
        );

        setSpeciesData(
          distributionData
        );

      } catch (error) {

        console.error(
          "Failed to load biodiversity analytics:",
          error
        );

        toast.error(
          "Failed to load biodiversity analytics"
        );

      } finally {

        setLoading(false);

      }

    }

    loadAnalytics();

  }, []);


  // Calculate total unique species
  const speciesRichness =
    speciesData.length;


  // Calculate total animal observations
  const totalAnimals =
    speciesData.reduce(
      (total, item) =>
        total + item.count,
      0
    );


  // Convert species distribution
  // into PieChart format
  const groupPie =
    speciesData.map(
      (item) => ({
        name: item.species,
        value: item.count,
      })
    );


  return (

    <div>

      <PageHeader
        title="Biodiversity Intelligence"
        description="Richness, diversity scores, and habitat-level ecosystem health."
      />


      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          label="Biodiversity Index"
          value={
            loading
              ? "..."
              : biodiversityData.length
          }
          icon={Leaf}
          accent="forest"
        />


        <KpiCard
          label="Species Richness"
          value={
            loading
              ? "..."
              : speciesRichness
          }
          icon={Sprout}
          accent="ocean"
        />


        <KpiCard
          label="Total Animals Observed"
          value={
            loading
              ? "..."
              : totalAnimals
          }
          icon={Sparkles}
          accent="earth"
        />


        <KpiCard
          label="Habitat Types"
          value={
            loading
              ? "..."
              : biodiversityData.length
          }
          icon={Activity}
          accent="forest"
        />

      </div>


      {/* CHARTS */}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">


        {/* BIODIVERSITY BY HABITAT */}

        <div className="glass rounded-2xl p-5 lg:col-span-2">

          <div className="mb-2 font-display text-lg font-semibold">

            Species Richness by Habitat

          </div>


          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <BarChart
              data={biodiversityData}
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
              />

              <Tooltip
                contentStyle={{
                  background:
                    "var(--card)",
                  border:
                    "1px solid var(--border)",
                  borderRadius: 12,
                }}
              />

              <Bar
                dataKey="richness"
                name="Species Richness"
                fill="var(--forest)"
                radius={[
                  6,
                  6,
                  0,
                  0
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* SPECIES DISTRIBUTION */}

        <div className="glass rounded-2xl p-5">

          <div className="mb-2 font-display text-lg font-semibold">

            Species Distribution

          </div>


          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <PieChart>

              <Pie
                data={groupPie}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
              >

                {groupPie.map(
                  (_, i) => (

                    <Cell
                      key={i}
                      fill={
                        colors[
                          i %
                          colors.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>


              <Tooltip
                contentStyle={{
                  background:
                    "var(--card)",
                  border:
                    "1px solid var(--border)",
                  borderRadius: 12,
                }}
              />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* INFORMATION */}

      <div className="glass mt-4 rounded-2xl p-5">

        <div className="mb-2 font-display text-lg font-semibold">

          Biodiversity Analytics Summary

        </div>


        {loading ? (

          <div className="text-sm text-muted-foreground">

            Loading biodiversity analytics...

          </div>

        ) : biodiversityData.length === 0 ? (

          <div className="text-sm text-muted-foreground">

            No biodiversity data available.

          </div>

        ) : (

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {biodiversityData.map(
              (item) => (

                <div
                  key={item.habitat}
                  className="rounded-xl border bg-card/60 p-4"
                >

                  <div className="text-sm font-medium">

                    {item.habitat}

                  </div>

                  <div className="mt-1 text-2xl font-bold">

                    {item.richness}

                  </div>

                  <div className="text-xs text-muted-foreground">

                    Unique species observed

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

  