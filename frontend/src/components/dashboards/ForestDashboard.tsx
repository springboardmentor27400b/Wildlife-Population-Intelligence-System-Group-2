import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Camera,
  MapPin,
  ShieldCheck,
  TreePine,
} from "lucide-react";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";

const API_URL = "http://127.0.0.1:8000";

type SpeciesPopulation = {
  species: string;
  count: number;
  percentage: number;
};

type DashboardData = {
  summary: {
    total_records: number;
    species_count: number;
  };
  species_population: SpeciesPopulation[];
};

export default function ForestDashboard() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          `${API_URL}/api/milestone4/dashboard`
        );

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error(
          "Failed to load forest dashboard",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Loading forest operations dashboard...
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Forest Operations Dashboard"
        description="Wildlife monitoring, protected-area operations and field intelligence."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          label="Protected Areas"
          value={0}
          icon={MapPin}
          accent="earth"
          hint="Connect protected-area analytics"
        />

        <KpiCard
          label="Wildlife Records"
          value={data.summary.total_records}
          icon={Camera}
          accent="forest"
        />

        <KpiCard
          label="Species Detected"
          value={data.summary.species_count}
          icon={TreePine}
          accent="ocean"
        />

        <KpiCard
          label="Monitoring Status"
          value="Active"
          icon={Activity}
          accent="forest"
        />

      </div>

      <div className="grid gap-4 lg:grid-cols-2">

        <div className="glass rounded-2xl p-5">

          <div className="mb-4 flex items-center gap-2">

            <Camera className="h-5 w-5" />

            <div>

              <h2 className="font-display text-lg font-semibold">
                Wildlife Monitoring
              </h2>

              <p className="text-xs text-muted-foreground">
                Species observations available to field teams
              </p>

            </div>

          </div>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart
              data={data.species_population}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.2}
              />

              <XAxis
                dataKey="species"
                angle={-25}
                textAnchor="end"
                height={70}
                fontSize={11}
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
                name="Observations"
                fill="var(--ocean)"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="glass rounded-2xl p-5">

          <h2 className="font-display text-lg font-semibold">
            Field Operations
          </h2>

          <div className="mt-5 space-y-4">

            <div className="flex items-center gap-4 rounded-xl border p-4">

              <ShieldCheck className="h-6 w-6" />

              <div>

                <div className="font-semibold">
                  Monitoring
                </div>

                <div className="text-sm text-muted-foreground">
                  Wildlife monitoring systems are active.
                </div>

              </div>

            </div>

            <div className="flex items-center gap-4 rounded-xl border p-4">

              <AlertTriangle className="h-6 w-6" />

              <div>

                <div className="font-semibold">
                  Field Alerts
                </div>

                <div className="text-sm text-muted-foreground">
                  Review threat and incident data from
                  connected monitoring modules.
                </div>

              </div>

            </div>

            <div className="flex items-center gap-4 rounded-xl border p-4">

              <MapPin className="h-6 w-6" />

              <div>

                <div className="font-semibold">
                  Protected Area Operations
                </div>

                <div className="text-sm text-muted-foreground">
                  Use the Maps & GIS and Protected Areas
                  modules for spatial operations.
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}