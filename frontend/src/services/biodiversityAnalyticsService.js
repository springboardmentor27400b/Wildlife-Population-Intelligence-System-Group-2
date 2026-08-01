import api from './api';

const biodiversityAnalyticsService = {
  /**
   * Fetch biodiversity analytics summary and distributions
   */
  getSummary: async (params = {}) => {
    const response = await api.get('/biodiversity-analytics/summary', { params });
    return response.data;
  },

  /**
   * Export to PDF
   */
  exportPdf: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    // Assuming api.defaults.baseURL gives the base URL
    const url = `${api.defaults.baseURL || 'http://localhost:8000/api/v1'}/biodiversity-analytics/export/pdf?${queryString}`;
    window.open(url, '_blank');
  },

  /**
   * Export to Excel
   */
  exportExcel: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${api.defaults.baseURL || 'http://localhost:8000/api/v1'}/biodiversity-analytics/export/excel?${queryString}`;
    window.open(url, '_blank');
  },

  /**
   * Export to JSON
   */
  exportJson: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${api.defaults.baseURL || 'http://localhost:8000/api/v1'}/biodiversity-analytics/export/json?${queryString}`;
    window.open(url, '_blank');
  }
};

export default biodiversityAnalyticsService;
