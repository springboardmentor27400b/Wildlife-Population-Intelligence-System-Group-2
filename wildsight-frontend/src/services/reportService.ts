import { api } from "./api";
import { Report } from "../types/report";


// ============================================================
// GET ALL REPORTS
// ============================================================

export const getReports = async (): Promise<Report[]> => {

    const response =
        await api.get("/api/reports");

    return response.data;
};


// ============================================================
// CREATE MANUAL REPORT
// ============================================================

export const createReport = async (data: any) => {

    const response =
        await api.post(
            "/api/reports",
            data
        );

    return response.data;
};


// ============================================================
// GET REPORT BY ID
// ============================================================

export const getReportById = async (
    id: number
) => {

    const response =
        await api.get(
            `/api/reports/${id}`
        );

    return response.data;
};


// ============================================================
// DELETE REPORT
// ============================================================

export const deleteReport = async (
    id: number
) => {

    await api.delete(
        `/api/reports/${id}`
    );

};


// ============================================================
// GENERATE SYSTEM REPORT
// ============================================================

export const generateReport = async (
    type: string,
    surveyId: number,
    userId: number
) => {

    const response =
        await api.post(
            "/api/reports/generate",
            null,
            {
                params: {
                    type,
                    surveyId,
                    userId
                }
            }
        );

    return response.data;
};