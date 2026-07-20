import api from './api';

const observationService = {
  getObservations: async () => {
    try {
      const response = await api.get('/observations/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getObservation: async (observationId) => {
    try {
      const response = await api.get(`/observations/${observationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createObservation: async (observationData) => {
    try {
      const response = await api.post('/observations/', observationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateObservation: async (observationId, observationData) => {
    try {
      const response = await api.put(`/observations/${observationId}`, observationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteObservation: async (observationId) => {
    try {
      const response = await api.delete(`/observations/${observationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyObservation: async (observationId, status) => {
    try {
      const response = await api.patch(`/observations/${observationId}/verify`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default observationService;
