import api from "./api";

export interface WildlifeObservation {
  id: number;
  species_id: number;
  protected_area_id: number;
  observer_id: number;
  observation_date: string;
  latitude: number;
  longitude: number;
  animal_count: number;
  observation_type: string;
  image_path: string;
  notes: string;
}

export interface ObservationCreate {
  species_id: number;
  protected_area_id: number;
  latitude: number;
  longitude: number;
  animal_count: number;
  observation_type: string;
  image_path: string;
  notes: string;
}

export async function getObservations() {
  const response = await api.get<WildlifeObservation[]>("/wildlife-observations/");
  return response.data;
}

export async function addObservation(data: ObservationCreate) {
  const response = await api.post("/wildlife-observations/", data);
  return response.data;
}