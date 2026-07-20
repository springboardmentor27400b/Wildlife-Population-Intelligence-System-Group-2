import api from './api';

const predictionService = {
  predictSpecies: async (formData) => {
    try {
      const response = await api.post('/predictions/species', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPredictions: async (params = {}) => {
    try {
      const response = await api.get('/predictions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPredictionDetail: async (id) => {
    try {
      const response = await api.get(`/predictions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  savePrediction: async (id, siteId, siteName) => {
    try {
      const response = await api.post(`/predictions/${id}/save`, {
        site_id: siteId,
        site_name: siteName
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  discardPrediction: async (id) => {
    try {
      const response = await api.post(`/predictions/${id}/discard`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default predictionService;
