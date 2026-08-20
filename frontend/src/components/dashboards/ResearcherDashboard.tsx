import {
  Activity,
  BarChart3,
  Camera,
  Leaf,
  PawPrint,
  TrendingUp,
} from "lucide-react";

import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";

import type {
  DashboardStats,
} from "@/services/dashboardService";

import type {
  Species,
} from "@/services/speciesService";

import type {
  Observation,
} from "@/services/observationService";

import type {
  ProtectedArea,
} from "@/services/protectedAreaService";

import type {
  SpeciesDistribution,
  MonthlyObservation,
  SpeciesTrend,
  BiodiversityByHabitat,
  EcosystemHealth,
  ProtectedAreaAnalytics,
} from "@/services/analyticsService";

import type {
  PopulationEstimation,
} from "@/services/populationEstimationService";

import type {
  ThreatAlert,
} from "@/services/threatService";

import type {
  Milestone4Population,
} from "@/routes/_authenticated/dashboard";

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

  milestone4Population:
    Milestone4Population | null;
}

export default function ResearcherDashboard({
  stats,
  species,
  observations,
  speciesTrends,
  biodiversity,
  population,
  milestone4Population,
}: Props) {
  return (
    <div className="space-y-6">

      <PageHeader
        title="Researcher Executive Dashboard"
        description="Wildlife population and biodiversity intelligence for research analysis."
      />

      {/* KPI */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          label="Total Species"
          value={stats?.total_species ?? 0}
          icon={PawPrint}
          accent="forest"
        />

        <KpiCard
          label="Observations"
          value={stats?.total_observations ?? 0}
          icon={Camera}
          accent="ocean"
        />

        <KpiCard
          label="Population"
          value={population?.total_population ?? 0}
          icon={Activity}
          accent="earth"
        />

        <KpiCard
          label="Species Richness"
          value={population?.species_richness ?? 0}
          icon={Leaf}
          accent="forest"
        />

      </div>

      {/* Milestone 4 */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4">

          <h2 className="font-display text-lg font-semibold">
            Milestone 4 Population Intelligence
          </h2>

          <p className="text-xs text-muted-foreground">
            Training dataset population distribution
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl border p-4">

            <div className="text-sm text-muted-foreground">
              Dataset Records
            </div>

            <div className="mt-1 text-3xl font-semibold">
              {milestone4Population?.summary.total_records ?? 0}
            </div>

          </div>

          <div className="rounded-xl border p-4">

            <div className="text-sm text-muted-foreground">
              Species Count
            </div>

            <div className="mt-1 text-3xl font-semibold">
              {milestone4Population?.summary.species_count ?? 0}
            </div>

          </div>

        </div>

      </div>

      {/* Population trends */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="font-display text-lg font-semibold">
              Population Trends
            </h2>

            <p className="text-xs text-muted-foreground">
              Wildlife observations over time
            </p>
          </div>

          <TrendingUp className="h-5 w-5" />
        </div>

        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={speciesTrends}>

            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <XAxis
              dataKey="species"
              fontSize={11}
            />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="count"
              name="Population"
              stroke="var(--forest)"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* Species population */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center gap-2">

          <BarChart3 className="h-5 w-5" />

          <div>

            <h2 className="font-display text-lg font-semibold">
              Species Population Distribution
            </h2>

            <p className="text-xs text-muted-foreground">
              Population records by species
            </p>

          </div>

        </div>

        <ResponsiveContainer width="100%" height={320}>

          <BarChart
            data={
              milestone4Population?.species_population ?? []
            }
          >

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
              name="Records"
              fill="var(--forest)"
              radius={[6, 6, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* Biodiversity */}

      <div className="glass rounded-2xl p-5">

        <h2 className="mb-4 font-display text-lg font-semibold">
          Biodiversity by Habitat
        </h2>

        <ResponsiveContainer width="100%" height={280}>

          <BarChart data={biodiversity}>

            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <XAxis
              dataKey="habitat"
              fontSize={11}
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="richness"
              name="Species Richness"
              fill="var(--ocean)"
              radius={[6, 6, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* Research observations */}

      <div className="glass rounded-2xl p-5">

        <h2 className="mb-4 font-display text-lg font-semibold">
          Recent Research Observations
        </h2>

        <div className="space-y-2">

          {observations.slice(0, 8).map((observation) => {

            const foundSpecies =
              species.find(
                (item) =>
                  item.id === observation.species_id
              );

            return (
              <div
                key={observation.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >

                <div>
                  <div className="font-medium">
                    {foundSpecies?.common_name ??
                      "Unknown Species"}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Observation
                  </div>
                </div>

                <div className="font-semibold">
                  {observation.animal_count}
                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}