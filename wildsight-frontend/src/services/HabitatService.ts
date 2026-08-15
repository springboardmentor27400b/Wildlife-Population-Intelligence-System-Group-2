import { api } from "./api";

export const getHabitatDashboard = async()=>{

    const response = await api.get(
        "/api/habitats/dashboard"
    );

    return response.data;

};

export const getHabitatClassification = async()=>{

    const response = await api.get(
        "/api/habitats/classification"
    );

    return response.data;

};

export const getHabitatDegradation = async()=>{

    const response = await api.get(
        "/api/habitats/degradation"
    );

    return response.data;

};

export const getVegetationAnalysis = async()=>{

    const response = await api.get(
        "/api/habitats/vegetation-analysis"
    );

    return response.data;

};

export const getEnvironmentalMonitoring = async()=>{

    const response = await api.get(
        "/api/habitats/environment-monitoring"
    );

    return response.data;

};

export const getHabitatSuitability = async()=>{

    const response = await api.get(
        "/api/habitats/suitability"
    );

    return response.data;

};