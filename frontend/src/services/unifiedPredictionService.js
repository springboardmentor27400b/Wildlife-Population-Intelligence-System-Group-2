import api from './api';

const unifiedPredictionService = {
  /**
   * Upload an image or audio file and run unified AI species classification.
   * @param {FormData} formData - Must contain 'file' key.
   */
  predictUnified: async (formData) => {
    const response = await api.post('/unified-predictions/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Fetch paginated unified prediction history with optional filters.
   */
  getUnifiedPredictions: async (params = {}) => {
    const response = await api.get('/unified-predictions', { params });
    return response.data;
  },

  /**
   * Link a unified prediction to an EXISTING observation record.
   */
  linkToObservation: async (unifiedId, observationId) => {
    const response = await api.post(`/unified-predictions/${unifiedId}/link-observation`, {
      observation_id: observationId,
    });
    return response.data;
  },
};

export default unifiedPredictionService;
