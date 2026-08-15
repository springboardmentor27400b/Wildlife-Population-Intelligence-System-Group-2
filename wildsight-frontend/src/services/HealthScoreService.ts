import { api } from "./api";
import { WildlifeHealthScore } from "../types/health";


export const getHealthScore = async (): Promise<WildlifeHealthScore> => {

    const response = await api.get(
        "/api/wildlife-health/score"
    );

    return response.data;
};