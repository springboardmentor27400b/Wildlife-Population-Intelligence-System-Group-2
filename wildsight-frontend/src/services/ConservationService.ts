import { api } from "./api";

export const getConservationDashboard = async()=>{

    const response =
        await api.get(
            "/api/conservation-recommendations/dashboard"
        );

    return response.data;

};

export const getConservationPriority = async()=>{

    const response =
        await api.get(
            "/api/conservation-recommendations/priority"
        );

    return response.data;

};

export const getHabitatRestoration = async()=>{

    const response =
        await api.get(
            "/api/conservation-recommendations/restoration"
        );

    return response.data;

};

export const getProtectionStrategy = async()=>{

    const response =
        await api.get(
            "/api/conservation-recommendations/protection"
        );

    return response.data;

};

export const getMonitoringOptimization = async()=>{

    const response =
        await api.get(
            "/api/conservation-recommendations/monitoring"
        );

    return response.data;

};

export const getResourceAllocation = async()=>{

    const response =
        await api.get(
            "/api/conservation-recommendations/resource-allocation"
        );

    return response.data;

};