import api from './api';

const audioPredictionService = {
  /**
   * Upload an audio file and run AI species classification.
   * @param {FormData} formData - Must contain 'file' key with the audio.
   */
  predictAudioSpecies: async (formData) => {
    const response = await api.post('/audio-predictions/species', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Fetch paginated audio prediction history with optional filters.
   */
  getAudioPredictions: async (params = {}) => {
    const response = await api.get('/audio-predictions', { params });
    return response.data;
  },

  /**
   * Link an audio prediction to an EXISTING observation record.
   */
  linkToObservation: async (predictionId, observationId) => {
    const response = await api.post(`/audio-predictions/${predictionId}/link-observation`, {
      observation_id: observationId,
    });
    return response.data;
  },
};

export default audioPredictionService;
