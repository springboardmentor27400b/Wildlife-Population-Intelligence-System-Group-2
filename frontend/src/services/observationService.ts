import api from "./api";

export interface Observation {
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
  const response = await api.get<Observation[]>("/wildlife-observations/");
  return response.data;
}

export async function addObservation(data: ObservationCreate, token: string) {
  const response = await api.post(
    "/wildlife-observations/",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}