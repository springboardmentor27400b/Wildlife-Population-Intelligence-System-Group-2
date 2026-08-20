import api from "./api";

export interface ProtectedArea {
  id: number;
  name: string;
  state: string;
  district: string;
  area_type: string;
  latitude: number;
  longitude: number;
  total_area_sqkm: number;
  description: string;
}

export async function getProtectedAreas() {
  const response = await api.get<ProtectedArea[]>(
    "/protected-areas/"
  );

  return response.data;
}