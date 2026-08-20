import api from './api';

const habitatIntelligenceService = {
  async getSummary(filters = {}) {
    const response = await api.get('/habitat-intelligence/summary', { params: filters });
    return response.data;
  },

  async getDashboardSummary() {
    const response = await api.get('/habitat-intelligence/dashboard');
    return response.data;
  },

  async getSiteDetail(siteId) {
    const response = await api.get(`/habitat-intelligence/${siteId}`);
    return response.data;
  },

  async exportExcel(filters = {}) {
    try {
      const response = await api.get('/habitat-intelligence/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'habitat_intelligence.xlsx');
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
      const response = await api.get('/habitat-intelligence/export/csv', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'habitat_intelligence.csv');
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
      const response = await api.get('/habitat-intelligence/export/json', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'habitat_intelligence.json');
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
      const response = await api.get('/habitat-intelligence/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'habitat_intelligence.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting pdf', error);
      throw error;
    }
  }
};

export default habitatIntelligenceService;
