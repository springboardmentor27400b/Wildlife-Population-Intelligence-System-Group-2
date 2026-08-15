import {
    DashboardSummary,
    SpeciesDistribution,
    CategoryDistribution
} from "../types/analytics";

import { api } from "@/services/api";

const API = "/api/analytics";

export const getDashboardSummary = () =>
    api.get<DashboardSummary>(
        `${API}/dashboard`
    );

export const getSpeciesDistribution = () =>
    api.get<SpeciesDistribution[]>(
        `${API}/species-distribution`
    );

export const getCategoryDistribution = () =>
    api.get<CategoryDistribution[]>(
        `${API}/category-distribution`
    );

export const getConservationStatus = () =>
    api.get("/api/analytics/conservation-status");