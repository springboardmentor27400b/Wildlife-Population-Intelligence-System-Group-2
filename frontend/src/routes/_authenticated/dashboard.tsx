import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";

import {
  getDashboardStats,
  type DashboardStats,
} from "@/services/dashboardService";

import {
  getSpecies,
  type Species,
} from "@/services/speciesService";

import {
  getObservations,
  type Observation,
} from "@/services/observationService";

import {
  getProtectedAreas,
  type ProtectedArea,
} from "@/services/protectedAreaService";

import {
  getSpeciesDistribution,
  getMonthlyObservationTrends,
  getSpeciesTrends,
  getBiodiversityByHabitat,
  getEcosystemHealth,
  getProtectedAreaAnalytics,
  type SpeciesDistribution,
  type MonthlyObservation,
  type SpeciesTrend,
  type BiodiversityByHabitat,
  type EcosystemHealth,
  type ProtectedAreaAnalytics,
} from "@/services/analyticsService";

import {
  getPopulationEstimation,
  type PopulationEstimation,
} from "@/services/populationEstimationService";

import {
  getThreatAlerts,
  type ThreatAlert,
} from "@/services/threatService";

import ResearcherDashboard from "@/components/dashboards/ResearcherDashboard";
import ConservationDashboard from "@/components/dashboards/ConservationDashboard";
import ForestDashboard from "@/components/dashboards/ForestDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      {
        title: "Executive Dashboard — WPIS",
      },
    ],
  }),

  component: Dashboard,
});

export interface Milestone4Population {
  status: string;
  summary: {
    total_records: number;
    species_count: number;
  };
  species_population: {
    species: string;
    count: number;
    percentage: number;
  }[];
}

function Dashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [species, setSpecies] =
    useState<Species[]>([]);

  const [observations, setObservations] =
    useState<Observation[]>([]);

  const [protectedAreas, setProtectedAreas] =
    useState<ProtectedArea[]>([]);

  const [speciesDistribution, setSpeciesDistribution] =
    useState<SpeciesDistribution[]>([]);

  const [monthlyTrends, setMonthlyTrends] =
    useState<MonthlyObservation[]>([]);

  const [speciesTrends, setSpeciesTrends] =
    useState<SpeciesTrend[]>([]);

  const [biodiversity, setBiodiversity] =
    useState<BiodiversityByHabitat[]>([]);

  const [ecosystemHealth, setEcosystemHealth] =
    useState<EcosystemHealth | null>(null);

  const [protectedAreaAnalytics, setProtectedAreaAnalytics] =
    useState<ProtectedAreaAnalytics[]>([]);

  const [population, setPopulation] =
    useState<PopulationEstimation | null>(null);

  const [threatAlerts, setThreatAlerts] =
    useState<ThreatAlert[]>([]);

  const [milestone4Population, setMilestone4Population] =
    useState<Milestone4Population | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          dashboardStats,
          speciesData,
          observationData,
          protectedAreaData,
          distributionData,
          monthlyData,
          trendsData,
          biodiversityData,
          ecosystemData,
          protectedAnalyticsData,
          populationData,
          alertsData,
        ] = await Promise.all([
          getDashboardStats(),
          getSpecies(),
          getObservations(),
          getProtectedAreas(),

          getSpeciesDistribution(),
          getMonthlyObservationTrends(),
          getSpeciesTrends(),
          getBiodiversityByHabitat(),
          getEcosystemHealth(),
          getProtectedAreaAnalytics(),

          getPopulationEstimation(),
          getThreatAlerts(),
        ]);

        setStats(dashboardStats);
        setSpecies(speciesData);
        setObservations(observationData);
        setProtectedAreas(protectedAreaData);

        setSpeciesDistribution(distributionData);
        setMonthlyTrends(monthlyData);
        setSpeciesTrends(trendsData);
        setBiodiversity(biodiversityData);
        setEcosystemHealth(ecosystemData);
        setProtectedAreaAnalytics(protectedAnalyticsData);

        setPopulation(populationData);
        setThreatAlerts(alertsData);

        // Milestone 4 population intelligence API
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/api/milestone4/dashboard"
          );

          if (response.ok) {
            const data =
              (await response.json()) as Milestone4Population;

            setMilestone4Population(data);
          }
        } catch (error) {
          console.error(
            "Milestone 4 population API failed:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Failed to load executive dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (!user) {
    return (
      <div className="p-6">
        User information is unavailable.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="font-display text-xl font-semibold">
            Loading Executive Dashboard
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            Preparing Milestone 4 intelligence...
          </div>
        </div>
      </div>
    );
  }

  const commonProps = {
    stats,
    species,
    observations,
    protectedAreas,
    speciesDistribution,
    monthlyTrends,
    speciesTrends,
    biodiversity,
    ecosystemHealth,
    protectedAreaAnalytics,
    population,
    threatAlerts,
    milestone4Population,
  };

  switch (user.role) {
    case "researcher":
      return (
        <ResearcherDashboard
          {...commonProps}
        />
      );

    case "conservation":
      return (
        <ConservationDashboard
          {...commonProps}
        />
      );

    case "forest":
      return (
        <ForestDashboard
          {...commonProps}
        />
      );

    case "admin":
      return (
        <AdminDashboard
          {...commonProps}
        />
      );

    default:
      return (
        <div className="p-6">
          <h1 className="text-xl font-semibold">
            Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            No dashboard has been configured for this role.
          </p>
        </div>
      );
  }
}

export default Dashboard;