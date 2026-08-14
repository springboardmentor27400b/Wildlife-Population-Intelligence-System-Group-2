import apiClient from './axios';

export const getPdfReportDownloadUrl = (predictionId) => {
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');
  return `${BASE_URL}/reports/${predictionId}/download?token=${token}`;
};

export const downloadPdfReport = async (reportType, filters = {}) => {
  const response = await apiClient.get(`/reports/${reportType}/download`, {
    params: filters,
    responseType: 'blob'
  });
  return response.data;
};

export const downloadExcelReport = async (reportType, filters = {}) => {
  const response = await apiClient.get(`/reports/${reportType}/export-excel`, {
    params: filters,
    responseType: 'blob'
  });
  return response.data;
};
