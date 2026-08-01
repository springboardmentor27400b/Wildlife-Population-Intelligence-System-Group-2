import api from './api';

const predictionService = {
  /**
   * Upload a wildlife image and run AI species classification.
   * @param {FormData} formData - Must contain 'file' key with the image.
   */
  predictSpecies: async (formData) => {
    const response = await api.post('/predictions/species', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Fetch paginated prediction history with optional filters.
   */
  getPredictions: async (params = {}) => {
    const response = await api.get('/predictions', { params });
    return response.data;
  },

  /**
   * Fetch full details of a single prediction record.
   */
  getPredictionDetail: async (id) => {
    const response = await api.get(`/predictions/${id}`);
    return response.data;
  },

  /**
   * Save a prediction as a NEW observation record.
   * Use when no existing observation exists.
   */
  savePrediction: async (id, siteId, siteName) => {
    const response = await api.post(`/predictions/${id}/save`, {
      site_id: siteId,
      site_name: siteName,
    });
    return response.data;
  },

  /**
   * Link a prediction to an EXISTING observation record.
   * Use when you want to attach AI results to an existing sighting.
   */
  linkToObservation: async (predictionId, observationId) => {
    const response = await api.post(`/predictions/${predictionId}/link-observation`, {
      observation_id: observationId,
    });
    return response.data;
  },

  /**
   * Mark a prediction as Discarded (no observation created).
   */
  discardPrediction: async (id) => {
    const response = await api.post(`/predictions/${id}/discard`);
    return response.data;
  },
};

export default predictionService;
