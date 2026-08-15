import { api } from "./api";

import { ReportExport } from "../types/reportExport";


// ============================================================
// GET ALL REPORT EXPORTS
// ============================================================

export const getAllReportExports =
  async (): Promise<ReportExport[]> => {

    const response =
      await api.get<ReportExport[]>(
        "/api/report-exports"
      );

    return response.data;
  };


// ============================================================
// GET REPORT EXPORT BY ID
// ============================================================

export const getReportExport =
  async (
    id: number
  ): Promise<ReportExport> => {

    const response =
      await api.get<ReportExport>(
        `/api/report-exports/${id}`
      );

    return response.data;
  };


// ============================================================
// CREATE REPORT EXPORT
// ============================================================

export const createReportExport =
  async (
    payload: any
  ) => {

    const response =
      await api.post(
        "/api/report-exports",
        payload
      );

    return response.data;
  };


// ============================================================
// UPDATE REPORT EXPORT
// ============================================================

export const updateReportExport =
  async (
    id: number,
    payload: any
  ) => {

    const response =
      await api.put(
        `/api/report-exports/${id}`,
        payload
      );

    return response.data;
  };


// ============================================================
// DELETE REPORT EXPORT
// ============================================================

export const deleteReportExport =
  async (
    id: number
  ) => {

    const response =
      await api.delete(
        `/api/report-exports/${id}`
      );

    return response.data;
  };


// ============================================================
// DOWNLOAD REPORT EXPORT
// ============================================================

export const downloadReportExport =
  async (
    id: number
  ) => {

    const response =
      await api.get(
        `/api/report-exports/${id}/download`,
        {
          responseType: "blob",
        }
      );

    return response;
  };