import axios from "axios";
import api from "./api";

const API_URL = "http://127.0.0.1:8000";


export interface SpeciesDistribution {
  species: string;
  count: number;
}
export interface PopulationByHabitat {
  habitat: string;
  population: number;
}

export interface BiodiversityByHabitat {
  habitat: string;
  richness: number;
}

export interface EcosystemHealthMetrics {
  species_count: number;
  total_animals: number;
  protected_area_count: number;
  endangered_species_count: number;
}

export interface PopulationObservation {
  date: string;
  total_animals: number;
}

export type PopulationStability = {
  trend: string;
  change_percent: number;
  stability_score: number;
  observations: {
    date: string;
    total_animals: number;
  }[];
};
export interface HealthHistory {
  date: string;
  overall: number;
  biodiversity: number;
  population: number;
  habitat: number;
  status: string;
}
export type ProtectedAreaAnalytics = {
  id: number;
  area: string;
  observations: number;
  animals: number;
  species: number;
  health: string;
};
export interface MonthlyObservation {
  month: string;
  observations: number;
}

export type SpeciesTrend = {
  species: string;
  count: number;
};

export type ThreatenedSpecies = {
  species: string;
  status: string;
  population: number;
};

export async function getThreatenedSpecies(): Promise<
  ThreatenedSpecies[]
> {
  const response = await api.get("/analytics/threatened-species");
  return response.data;
}

export async function getSpeciesDistribution(): Promise<
  SpeciesDistribution[]
> {

  const response = await axios.get(
    `${API_URL}/analytics/species-distribution`
  );

  return response.data;
}


export async function getBiodiversityByHabitat(): Promise<
  BiodiversityByHabitat[]
> {

  const response = await api.get(
    `${API_URL}/analytics/biodiversity-by-habitat`
  );

  return response.data;
}
export async function getPopulationStability(): Promise<PopulationStability> {
  const response = await fetch("/api/analytics/population-stability");

  if (!response.ok) {
    throw new Error("Failed to load population stability");
  }

  return response.json();
}
export async function getHealthHistory(): Promise<HealthHistory[]> {
  const response = await axios.get(
    `${API_URL}/analytics/ecosystem-health-history`
  );

  return response.data;
}
export async function getProtectedAreaAnalytics(): Promise<
  ProtectedAreaAnalytics[]
> {
  const response = await api.get<ProtectedAreaAnalytics[]>(
    "/analytics/protected-area"
  );

  return response.data;
}
export async function getMonthlyObservationTrends(): Promise<MonthlyObservation[]> {
  const response = await axios.get(
    `${API_URL}/analytics/monthly-observations`
  );

  return response.data;
}

export async function getSpeciesTrends(): Promise<SpeciesTrend[]> {
  const response = await api.get<SpeciesTrend[]>(
    "/analytics/species-trends"
  );

  return response.data;
}
export async function getPopulationByHabitat() {
  const response = await api.get<PopulationByHabitat[]>(
    "/analytics/population-by-habitat"
  );

  return response.data;
}

export async function getConservationStatus() {
  const response = await api.get<ConservationStatus[]>(
    "/analytics/conservation-status"
  );

  return response.data;
}

export type ConservationStatus = {
  status: string;
  count: number;
};

export type ConservationSpecies = {
  id: number;
  species: string;
  scientific_name: string;
  status: string;
  population: number;
};

export async function getConservationSpecies(): Promise<
  ConservationSpecies[]
> {
  const response = await api.get("/analytics/species-distribution");

  console.log("species-distribution API:", response.data);

  return response.data.map((item: any) => ({
    species: item.species,
    population: Number(item.count ?? 0),
  }));
}
export type ConservationRecommendationSummary = {
  total_recommendations: number;
  critical: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
};

export type ConservationRecommendation = {
  id: string;
  category: string;
  priority: string;
  title: string;
  detail: string;

  species?: string;
  scientific_name?: string;
  status?: string;
  trend?: string;

  protected_area?: string;
  habitat?: string;

  species_count?: number;
  population?: number;
  change_percent?: number;

  recommended_action?: string;

  impact: number;
};

export type ConservationRecommendationsResponse = {
  summary: ConservationRecommendationSummary;
  recommendations: ConservationRecommendation[];
};

export async function getConservationRecommendations(): Promise<
  ConservationRecommendationsResponse
> {
  const response = await fetch(
    "http://127.0.0.1:8000/analytics/conservation-recommendations"
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch conservation recommendations: ${response.status}`
    );
  }

  return response.json();
}
export type EcosystemHealthPart = {
  label: string;
  weight: number;
  value: number;
};

export type EcosystemHealth = {
  overall: number;
  status: string;
  parts: EcosystemHealthPart[];
  metrics: {
    species_count: number;
    total_animals: number;
    protected_area_count: number;
    endangered_species_count: number;
  };
};

export async function getEcosystemHealth(): Promise<EcosystemHealth> {
  const response = await fetch(
    "http://localhost:8000/analytics/ecosystem-health"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch ecosystem health");
  }

  return response.json();
}
export type EcosystemHealthHistory = {
  date: string;
  overall_score: number;
  biodiversity_score: number;
  population_score: number;
  habitat_score: number;
  status: string;
};
export async function getEcosystemHealthHistory(): Promise<
  EcosystemHealthHistory[]
> {
  const response = await fetch(
    "http://localhost:8000/analytics/ecosystem-health-history"
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch ecosystem health history"
    );
  }

  return response.json();
}