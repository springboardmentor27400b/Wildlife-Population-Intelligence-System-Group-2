import {
  Activity,
  BarChart3,
  Database,
  PawPrint,
  ShieldCheck,
  Users,
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

import type { DashboardStats } from "@/services/dashboardService";
import type { Species } from "@/services/speciesService";
import type { Observation } from "@/services/observationService";
import type { ProtectedArea } from "@/services/protectedAreaService";

import type {
  SpeciesDistribution,
  MonthlyObservation,
  SpeciesTrend,
  BiodiversityByHabitat,
  EcosystemHealth,
  ProtectedAreaAnalytics,
} from "@/services/analyticsService";

import type { PopulationEstimation } from "@/services/populationEstimationService";
import type { ThreatAlert } from "@/services/threatService";

import type { Milestone4Population } from "@/routes/_authenticated/dashboard";

interface Props {
  stats: DashboardStats | null;
  species: Species[];
  observations: Observation[];
  protectedAreas: ProtectedArea[];

  speciesDistribution: SpeciesDistribution[];
  monthlyTrends: MonthlyObservation[];
  speciesTrends: SpeciesTrend[];
  biodiversity: BiodiversityByHabitat[];
  ecosystemHealth: EcosystemHealth | null;
  protectedAreaAnalytics: ProtectedAreaAnalytics[];

  population: PopulationEstimation | null;
  threatAlerts: ThreatAlert[];

  milestone4Population: Milestone4Population | null;
}

export default function AdminDashboard({
  stats,
  species,
  observations,
  speciesTrends,
  protectedAreas,
  ecosystemHealth,
  threatAlerts,
  milestone4Population,
}: Props) {

  const systemActivity = [
    {
      name: "Users",
      value: stats?.total_users ?? 0,
    },
    {
      name: "Species",
      value: stats?.total_species ?? 0,
    },
    {
      name: "Observations",
      value: stats?.total_observations ?? 0,
    },
    {
      name: "Protected Areas",
      value: stats?.total_protected_areas ?? 0,
    },
  ];

  return (
    <div className="space-y-6">

      <PageHeader
        title="Administrator Executive Dashboard"
        description="Overall WPIS platform, data and intelligence system monitoring."
      />

      {/* KPIs */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          label="Total Users"
          value={stats?.total_users ?? 0}
          icon={Users}
          accent="forest"
        />

        <KpiCard
          label="Species"
          value={stats?.total_species ?? 0}
          icon={PawPrint}
          accent="ocean"
        />

        <KpiCard
          label="Observations"
          value={stats?.total_observations ?? 0}
          icon={Database}
          accent="earth"
        />

        <KpiCard
          label="System Health"
          value="Operational"
          icon={Activity}
          accent="forest"
        />

      </div>

      {/* System activity */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center gap-2">

          <BarChart3 className="h-5 w-5" />

          <div>

            <h2 className="font-display text-lg font-semibold">
              Platform Data Overview
            </h2>

            <p className="text-xs text-muted-foreground">
              Current WPIS database statistics
            </p>

          </div>

        </div>

        <ResponsiveContainer width="100%" height={320}>

          <BarChart data={systemActivity}>

            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="value"
              name="Records"
              fill="var(--forest)"
              radius={[6, 6, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* AI / Milestone 4 */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center gap-2">

          <ShieldCheck className="h-5 w-5" />

          <div>

            <h2 className="font-display text-lg font-semibold">
              AI & Population Intelligence
            </h2>

            <p className="text-xs text-muted-foreground">
              Milestone 4 intelligence system status
            </p>

          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-xl border p-5">

            <div className="text-sm text-muted-foreground">
              Population Records
            </div>

            <div className="mt-2 text-3xl font-bold">
              {milestone4Population?.summary.total_records ?? 0}
            </div>

          </div>

          <div className="rounded-xl border p-5">

            <div className="text-sm text-muted-foreground">
              Population Species
            </div>

            <div className="mt-2 text-3xl font-bold">
              {milestone4Population?.summary.species_count ?? 0}
            </div>

          </div>

          <div className="rounded-xl border p-5">

            <div className="text-sm text-muted-foreground">
              Threat Alerts
            </div>

            <div className="mt-2 text-3xl font-bold">
              {threatAlerts.length}
            </div>

          </div>

        </div>

      </div>

      {/* Species activity */}

      <div className="glass rounded-2xl p-5">

        <h2 className="mb-4 font-display text-lg font-semibold">
          Species Intelligence
        </h2>

        <ResponsiveContainer width="100%" height={320}>

          <BarChart data={speciesTrends}>

            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <XAxis
              dataKey="species"
              fontSize={10}
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

      {/* Platform summary */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="glass rounded-2xl p-5">

          <div className="text-sm text-muted-foreground">
            Protected Areas
          </div>

          <div className="mt-2 text-3xl font-bold">
            {protectedAreas.length}
          </div>

        </div>

        <div className="glass rounded-2xl p-5">

          <div className="text-sm text-muted-foreground">
            Species
          </div>

          <div className="mt-2 text-3xl font-bold">
            {species.length}
          </div>

        </div>

        <div className="glass rounded-2xl p-5">

          <div className="text-sm text-muted-foreground">
            Ecosystem Score
          </div>

          <div className="mt-2 text-3xl font-bold">
            {ecosystemHealth?.overall ?? 0}
          </div>

        </div>

      </div>

      {/* Database activity */}

      <div className="glass rounded-2xl p-5">

        <h2 className="mb-4 font-display text-lg font-semibold">
          Latest System Observations
        </h2>

        <div className="space-y-2">

          {observations
            .slice(0, 8)
            .map((observation) => (

              <div
                key={observation.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >

                <span className="text-sm">
                  Observation #{observation.id}
                </span>

                <span className="font-semibold">
                  {observation.animal_count}
                </span>

              </div>

            ))}

        </div>

      </div>

    </div>
  );
}