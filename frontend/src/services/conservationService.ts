import { api } from "@/lib/api";

export type ConservationRecommendation = {
  id: number | string;
  title: string;
  detail: string;
  category: string;
  priority: string;
  impact: number;
};

export async function getConservationRecommendations(): Promise<
  ConservationRecommendation[]
> {
  const response = await api.get("/analytics/conservation-recommendations");

  return response.data;
}