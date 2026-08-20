import api from "./api";

export interface PopulationEstimation {
  total_population: number;
  species_richness: number;
  protected_areas: number;
  population_density: number;
  growth_status: string;
}

export async function getPopulationEstimation() {
  const response = await api.get<PopulationEstimation>(
    "/analytics/population-estimation"
  );

  return response.data;
}