
import api from "./api";

export interface PopulationGrowth {
  previous_population: number;
  current_population: number;
  growth_rate: number;
  trend: string;
}

export async function getPopulationGrowth() {
  const response = await api.get<PopulationGrowth>(
    "/analytics/population-growth"
  );

  return response.data;
}