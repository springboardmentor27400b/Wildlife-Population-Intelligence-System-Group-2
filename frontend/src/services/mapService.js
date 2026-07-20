import api from './api';

const buildParams = (obj) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) params.append(k, v);
  });
  return params.toString();
};

const mapService = {
  getSites: async () => {
    const res = await api.get('/map/sites');
    return res.data;
  },
  getObservations: async (filters = {}) => {
    const res = await api.get(`/map/observations?${buildParams(filters)}`);
    return res.data;
  },
  getHeatmap: async (filters = {}) => {
    const res = await api.get(`/map/heatmap?${buildParams(filters)}`);
    return res.data;
  },
  getSpeciesDistribution: async (filters = {}) => {
    const res = await api.get(`/map/species-distribution?${buildParams(filters)}`);
    return res.data;
  }
};

export default mapService;
