import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useEffect, useState } from "react";

import {
  getEcosystemHealth,
  getPopulationStability,
  type EcosystemHealth,
  type PopulationStability,
} from "@/services/analyticsService";
import { toast } from "sonner";
export const Route = createFileRoute("/_authenticated/health")({
  head: () => ({ meta: [{ title: "Ecosystem Health — WPIS" }] }),
  component: Health,
});
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function Health() {

  const [health, setHealth] =
    useState<EcosystemHealth | null>(null);
  
  const [population, setPopulation] =
  useState<PopulationStability | null>(null);

  const [loading, setLoading] =
    useState(true);


 useEffect(() => {

  async function loadData() {

    try {

      setLoading(true);

      const [
        healthData,
        populationData,
      ] = await Promise.all([

        getEcosystemHealth(),

        getPopulationStability(),

      ]);

      console.log(
        "Ecosystem Health:",
        healthData
      );

      console.log(
        "Population Stability:",
        populationData
      );

      setHealth(healthData);

      setPopulation(
        populationData
      );

    } catch (error) {

      console.error(
        "Failed to load health data:",
        error
      );

      toast.error(
        "Failed to load ecosystem health data"
      );

    } finally {

      setLoading(false);

    }

  }

  loadData();

}, []);

  if (loading) {

    return (

      <div>

        <PageHeader
          title="Ecosystem Health Score"
          description="Composite indicator across biodiversity, populations, habitats and endangered species."
        />

        <div className="glass rounded-2xl p-6">

          <div className="text-sm text-muted-foreground">

            Loading ecosystem health data...

          </div>

        </div>

      </div>

    );

  }


  if (!health) {

    return (

      <div>

        <PageHeader
          title="Ecosystem Health Score"
          description="Unable to load ecosystem health data."
        />

      </div>

    );

  }


  const {
    overall,
    status,
    parts,
    metrics,
  } = health;


  return (

    <div>

      <PageHeader
        title="Ecosystem Health Score"
        description="Composite indicator across biodiversity, populations and habitat protection."
      />


      {/* HEALTH SCORE */}

      <div className="grid gap-4 lg:grid-cols-3">


        <motion.div
          initial={{
            opacity: 0,
            y: 12
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="glass flex flex-col items-center justify-center rounded-2xl p-6"
        >

          <div className="relative h-48 w-48">

            <svg
              viewBox="0 0 120 120"
              className="h-full w-full -rotate-90"
            >

              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="12"
              />


              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="var(--forest)"
                strokeWidth="12"
                strokeLinecap="round"
                initial={{
                  strokeDasharray: "0 327"
                }}
                animate={{
                  strokeDasharray:
                    `${(overall / 100) * 327} 327`
                }}
                transition={{
                  duration: 1.1,
                  ease: "easeOut"
                }}
              />

            </svg>


            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <div className="font-display text-5xl font-semibold">

                {overall}

              </div>

              <div className="text-xs uppercase tracking-wide text-muted-foreground">

                Ecosystem

              </div>

            </div>

          </div>


          <div className="mt-4">

            <StatusBadge
              value={status}
            />

          </div>

        </motion.div>


        {/* SCORE COMPOSITION */}

        <div className="glass rounded-2xl p-5 lg:col-span-2">

          <div className="mb-3 font-display text-lg font-semibold">

            Score Composition

          </div>


          <ul className="space-y-3">

            {parts.map((part) => (

              <li key={part.label}>

                <div className="mb-1 flex items-center justify-between text-sm">

                  <span className="font-medium">

                    {part.label}

                  </span>

                  <span className="text-muted-foreground">

                    {part.weight}% ·{" "}

                    <span className="text-foreground">

                      {part.value}

                    </span>

                  </span>

                </div>


                <div className="h-2 overflow-hidden rounded-full bg-muted">

                  <div
                    className="h-full gradient-forest"
                    style={{
                      width:
                        `${part.value}%`
                    }}
                  />

                </div>

              </li>

            ))}

          </ul>

        </div>

      </div>
  
      {/* DATABASE METRICS */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

         <div className="glass rounded-2xl p-5">

  <div className="text-sm text-muted-foreground">
    At-Risk Species
  </div>

  <div className="mt-2 text-3xl font-semibold">
    {metrics.endangered_species_count}
  </div>

</div>
        <div className="glass rounded-2xl p-5">

          <div className="text-sm text-muted-foreground">

            Unique Species

          </div>

          <div className="mt-2 text-3xl font-semibold">

            {metrics.species_count}

          </div>

        </div>


        <div className="glass rounded-2xl p-5">

          <div className="text-sm text-muted-foreground">

            Animals Observed

          </div>

          <div className="mt-2 text-3xl font-semibold">

            {metrics.total_animals}

          </div>

        </div>


        <div className="glass rounded-2xl p-5">

          <div className="text-sm text-muted-foreground">

            Protected Areas

          </div>

          <div className="mt-2 text-3xl font-semibold">

            {metrics.protected_area_count}

          </div>

        </div>

      </div>


      {/* TREND PLACEHOLDER */}

      <div className="glass mt-4 rounded-2xl p-5">

        <div className="mb-2 font-display text-lg font-semibold">

          Historical Trend

        </div>

        <div className="flex h-[180px] items-center justify-center rounded-xl bg-muted/30">

          <div className="text-center text-sm text-muted-foreground">

            Historical ecosystem health trends will appear here once historical health records are available.

          </div>

        </div>

      </div>

{ population && (
  <div className="glass mt-4 rounded-2xl p-5">

    <div className="mb-4 font-display text-lg font-semibold">
      Population Stability
    </div>

    <div className="grid gap-4 sm:grid-cols-3">

      <div>
        <div className="text-sm text-muted-foreground">
          Population Trend
        </div>

        <div className="mt-2 text-2xl font-semibold">
          {population.trend}
        </div>
      </div>


      <div>
        <div className="text-sm text-muted-foreground">
          Population Change
        </div>

        <div className="mt-2 text-2xl font-semibold">
          {population.change_percent > 0
            ? `+${population.change_percent}%`
            : `${population.change_percent}%`}
        </div>
      </div>


      <div>
        <div className="text-sm text-muted-foreground">
          Stability Score
        </div>

        <div className="mt-2 text-2xl font-semibold">
          {population.stability_score}/100
        </div>
      </div>

    </div>

  </div>
)}
{population && (
  <div className="glass mt-4 rounded-2xl p-5">

    <div className="mb-2 font-display text-lg font-semibold">
      Wildlife Population Trend
    </div>

    <ResponsiveContainer
      width="100%"
      height={260}
    >

      <LineChart
        data={population.observations}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.2}
        />

        <XAxis
          dataKey="date"
          fontSize={12}
        />

        <YAxis
          fontSize={12}
        />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="total_animals"
          stroke="var(--forest)"
          strokeWidth={3}
          dot
        />

      </LineChart>

    </ResponsiveContainer>

  </div>
)}

</div>

);

}
  