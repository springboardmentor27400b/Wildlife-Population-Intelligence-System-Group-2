import { api } from "@/services/api";
import type { WildlifeLocation } from "@/types/wildlife";

export const getWildlifeLocations = async (): Promise<WildlifeLocation[]> => {
  const response = await api.get<WildlifeLocation[]>(
    "/api/dashboard/map"
  );

  return response.data;
};