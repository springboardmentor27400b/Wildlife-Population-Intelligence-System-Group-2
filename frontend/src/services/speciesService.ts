import api from "./api";

export interface Species {
  id: number;
  common_name: string;
 scientific_name: string;
  category: string;
  iucn_status: string;
  description: string;
}

export async function getSpecies() {
  const response = await api.get<Species[]>("/species/");
  return response.data;
}