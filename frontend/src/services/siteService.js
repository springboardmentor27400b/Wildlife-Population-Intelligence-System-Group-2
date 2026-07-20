import api from './api';

const siteService = {
  getSites: async () => {
    const response = await api.get('/sites/');
    return response.data;
  },

  getSite: async (id) => {
    const response = await api.get(`/sites/${id}`);
    return response.data;
  },

  createSite: async (siteData) => {
    const response = await api.post('/sites/', siteData);
    return response.data;
  },

  updateSite: async (id, siteData) => {
    const response = await api.put(`/sites/${id}`, siteData);
    return response.data;
  },

  deleteSite: async (id) => {
    const response = await api.delete(`/sites/${id}`);
    return response.data;
  }
};

export default siteService;
