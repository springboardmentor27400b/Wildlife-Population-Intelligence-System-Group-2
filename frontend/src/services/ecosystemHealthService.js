import api from './api';

const BASE_URL = '/ecosystem-health';

const ecosystemHealthService = {
  getSummary: async (filters = {}) => {
    try {
      const response = await api.get(`${BASE_URL}/summary`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching ecosystem health summary:', error);
      throw error;
    }
  },

  getSiteDetail: async (siteId) => {
    try {
      const response = await api.get(`${BASE_URL}/${encodeURIComponent(siteId)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching site ecosystem detail:', error);
      throw error;
    }
  },

  exportPdf: async (filters = {}) => {
    try {
      const response = await api.get(`${BASE_URL}/export/pdf`, {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ecosystem_health_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  },

  exportExcel: async (filters = {}) => {
    try {
      const response = await api.get(`${BASE_URL}/export/excel`, {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ecosystem_health_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      throw error;
    }
  },

  exportCsv: async (filters = {}) => {
    try {
      const response = await api.get(`${BASE_URL}/export/csv`, {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ecosystem_health_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },

  exportJson: async (filters = {}) => {
    try {
      const response = await api.get(`${BASE_URL}/export/json`, {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ecosystem_health_report_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting JSON:', error);
      throw error;
    }
  }
};

export default ecosystemHealthService;
