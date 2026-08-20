import api from "./api";

export interface DashboardStats {
  total_users: number;
  total_species: number;
  total_protected_areas: number;
  total_observations: number;
}

export async function getDashboardStats() {
  const response = await api.get<DashboardStats>(
    "/dashboard/stats"
  );

  return response.data;
}