import { api } from "./api";


export const getBiodiversityDashboard = async () => {

    const response = await api.get(
        "/api/biodiversity-scores/dashboard"
    );

    return response.data;

};



export const getSpeciesDiversity = async () => {

    const response = await api.get(
        "/api/biodiversity-scores/species-chart"
    );

    return response.data;

};



export const getHabitatHealth = async () => {

    const response = await api.get(
        "/api/biodiversity-scores/habitat-health"
    );

    return response.data;

};



export const getEcosystemHealth = async () => {

    const response = await api.get(
        "/api/biodiversity-scores/ecosystem-monitoring"
    );

    return response.data;

};