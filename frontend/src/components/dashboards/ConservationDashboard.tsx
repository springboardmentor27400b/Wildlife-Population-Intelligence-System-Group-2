import {
  AlertTriangle,
  BarChart3,
  Leaf,
  MapPin,
  ShieldAlert,
  TrendingDown,
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
import { StatusBadge } from "@/components/status-badge";

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

export default function ConservationDashboard({
  stats,
  species,
  protectedAreas,
  biodiversity,
  ecosystemHealth,
  protectedAreaAnalytics,
  threatAlerts,
}: Props) {

  const endangered = species.filter(
    (item) =>
      item.iucn_status === "Endangered" ||
      item.iucn_status === "Critically Endangered"
  ).length;

  const criticallyEndangered = species.filter(
    (item) =>
      item.iucn_status === "Critically Endangered"
  ).length;

  return (
    <div className="space-y-6">

      <PageHeader
        title="Conservation Executive Dashboard"
        description="Conservation risk, endangered species and ecosystem intelligence."
      />

      {/* KPIs */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          label="Endangered Species"
          value={endangered}
          icon={ShieldAlert}
          accent="danger"
          hint="Endangered + Critically Endangered"
        />

        <KpiCard
          label="Critically Endangered"
          value={criticallyEndangered}
          icon={AlertTriangle}
          accent="danger"
        />

        <KpiCard
          label="Protected Areas"
          value={stats?.total_protected_areas ?? 0}
          icon={MapPin}
          accent="ocean"
        />

        <KpiCard
          label="Ecosystem Score"
          value={ecosystemHealth?.overall ?? 0}
          icon={Leaf}
          accent="forest"
        />

      </div>

      {/* Threat alerts */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center gap-2">

          <AlertTriangle className="h-5 w-5" />

          <div>
            <h2 className="font-display text-lg font-semibold">
              Conservation Threat Alerts
            </h2>

            <p className="text-xs text-muted-foreground">
              Current conservation risks requiring attention
            </p>
          </div>

        </div>

        {threatAlerts.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            No active threat alerts.
          </div>
        ) : (
          <div className="space-y-3">

            {threatAlerts.map((alert, index) => (
              <div
                key={index}
                className="rounded-xl border p-4"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <div className="font-semibold">
                      {alert.title}
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      {alert.message}
                    </div>

                  </div>

                  <StatusBadge
                    value={alert.level}
                  />

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* Protected areas */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center gap-2">

          <MapPin className="h-5 w-5" />

          <div>

            <h2 className="font-display text-lg font-semibold">
              Conservation Priority Areas
            </h2>

            <p className="text-xs text-muted-foreground">
              Wildlife population across protected areas
            </p>

          </div>

        </div>

        <ResponsiveContainer width="100%" height={300}>

          <BarChart data={protectedAreaAnalytics}>

            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <XAxis
              dataKey="area"
              fontSize={10}
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="animals"
              name="Animals"
              fill="var(--danger)"
              radius={[6, 6, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* Biodiversity */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center gap-2">

          <BarChart3 className="h-5 w-5" />

          <div>

            <h2 className="font-display text-lg font-semibold">
              Biodiversity Risk Profile
            </h2>

            <p className="text-xs text-muted-foreground">
              Habitat species richness
            </p>

          </div>

        </div>

        <ResponsiveContainer width="100%" height={300}>

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
              fill="var(--forest)"
              radius={[6, 6, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* Ecosystem health */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center gap-2">

          <Leaf className="h-5 w-5" />

          <h2 className="font-display text-lg font-semibold">
            Ecosystem Health
          </h2>

        </div>

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-xl border p-5">

            <div className="text-sm text-muted-foreground">
              Overall Score
            </div>

            <div className="mt-2 text-4xl font-bold">
              {ecosystemHealth?.overall ?? 0}
            </div>

          </div>

          <div className="rounded-xl border p-5">

            <div className="text-sm text-muted-foreground">
              Status
            </div>

            <div className="mt-3">
              <StatusBadge
                value={
                  ecosystemHealth?.status ??
                  "Unknown"
                }
              />
            </div>

          </div>

          <div className="rounded-xl border p-5">

            <div className="text-sm text-muted-foreground">
              Species Monitored
            </div>

            <div className="mt-2 text-4xl font-bold">
              {species.length}
            </div>

          </div>

        </div>

      </div>

      {/* Priority species */}

      <div className="glass rounded-2xl p-5">

        <div className="mb-4 flex items-center gap-2">

          <TrendingDown className="h-5 w-5" />

          <h2 className="font-display text-lg font-semibold">
            Species Requiring Conservation Attention
          </h2>

        </div>

        <div className="grid gap-3 md:grid-cols-2">

          {species
            .filter(
              (item) =>
                item.iucn_status === "Endangered" ||
                item.iucn_status ===
                  "Critically Endangered"
            )
            .map((item) => (

              <div
                key={item.id}
                className="rounded-xl border p-4"
              >

                <div className="font-semibold">
                  {item.common_name}
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                  {item.iucn_status}
                </div>

              </div>

            ))}

        </div>

      </div>

    </div>
  );
}