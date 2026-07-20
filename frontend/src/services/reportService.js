import api from './api';

const reportService = {
  getSummary: async (filters = {}) => {
    const params = buildParams(filters);
    const response = await api.get(`/reports/summary?${params}`);
    return response.data;
  },

  getSpeciesData: async (filters = {}) => {
    const params = buildParams(filters);
    const response = await api.get(`/reports/species?${params}`);
    return response.data;
  },

  getObservations: async (filters = {}, skip = 0, limit = 10, sortBy = 'observed_at', sortOrder = -1) => {
    const params = buildParams({ ...filters, skip, limit, sort_by: sortBy, sort_order: sortOrder });
    const response = await api.get(`/reports/observations?${params}`);
    return response.data;
  },

  exportPdf: async (filters = {}) => {
    const params = buildParams(filters);
    const response = await api.get(`/reports/export/pdf?${params}`, { responseType: 'blob' });
    return response.data;
  },

  exportExcel: async (filters = {}) => {
    const params = buildParams(filters);
    const response = await api.get(`/reports/export/excel?${params}`, { responseType: 'blob' });
    return response.data;
  },
};

function buildParams(obj) {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== '' && val !== null && val !== undefined) {
      params.append(key, val);
    }
  });
  return params.toString();
}

export default reportService;
