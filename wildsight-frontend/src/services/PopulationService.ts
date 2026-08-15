import { api } from "./api";

import {
    PopulationDashboard,
    PopulationTrend,
    PopulationDistribution,
    Migration
} from "../types/population";


const BASE_URL = "/api/population";


export const getPopulationDashboard = async () => {

    const response = await api.get<PopulationDashboard>(
        `${BASE_URL}/dashboard`
    );

    return response.data;

};


export const getPopulationTrend = async () => {

    const response = await api.get<PopulationTrend[]>(
        `${BASE_URL}/trends`
    );

    return response.data;

};


export const getPopulationDistribution = async () => {

    const response = await api.get<PopulationDistribution[]>(
        `${BASE_URL}/distribution`
    );

    return response.data;

};


export const getMigrationAnalysis = async () => {

    const response = await api.get<Migration[]>(
        `${BASE_URL}/migration`
    );

    return response.data;

};