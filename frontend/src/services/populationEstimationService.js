import api from './api';

export const populationEstimationService = {
  getSummary: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.species) params.append('species', filters.species);
    if (filters.siteName) params.append('site_name', filters.siteName);
    if (filters.minConfidence) params.append('min_confidence', filters.minConfidence);
    if (filters.source) params.append('source', filters.source);
    
    const response = await api.get(`/population-estimation/summary?${params.toString()}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/population-estimation/dashboard');
    return response.data;
  },

  getSpeciesDetail: async (speciesName) => {
    const response = await api.get(`/population-estimation/${encodeURIComponent(speciesName)}`);
    return response.data;
  },

  exportExcel: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.species) params.append('species', filters.species);
    if (filters.siteName) params.append('site_name', filters.siteName);
    
    try {
      const response = await api.get(`/population-estimation/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'population_estimation.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting excel', error);
      throw error;
    }
  },

  async exportCsv(filters = {}) {
    try {
      const response = await api.get('/population-estimation/export/csv', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'population_estimation.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting csv', error);
      throw error;
    }
  },

  async exportJson(filters = {}) {
    try {
      const response = await api.get('/population-estimation/export/json', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'population_estimation.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting json', error);
      throw error;
    }
  },

  async exportPdf(filters = {}) {
    try {
      const response = await api.get('/population-estimation/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'population_estimation.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting pdf', error);
      throw error;
    }
  }
};
