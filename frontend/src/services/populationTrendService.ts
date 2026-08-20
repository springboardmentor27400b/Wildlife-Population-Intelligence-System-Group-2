import api from "./api";

export interface PopulationTrend {
  month: string;
  observations: number;
}

export async function getPopulationTrend() {
  const response = await api.get<PopulationTrend[]>(
    "/analytics/monthly-observations"
  );

  return response.data;
}