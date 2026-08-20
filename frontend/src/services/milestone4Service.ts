import api from "./api";

export interface Milestone4Species {
  species: string;
  count: number;
  percentage: number;
}

export interface Milestone4Summary {
  total_records: number;
  species_count: number;
  total_population: number;
  top_species: string | null;
  top_species_count: number;
}

export interface Milestone4Dashboard {
  status: string;

  summary: Milestone4Summary;

  filters: {
    species: string | null;
    protected_area_id: number | null;
  };

  species_population: Milestone4Species[];
}

export async function getMilestone4Dashboard() {
  const response =
    await api.get<Milestone4Dashboard>(
      "/milestone4/dashboard"
    );

  return response.data;
}