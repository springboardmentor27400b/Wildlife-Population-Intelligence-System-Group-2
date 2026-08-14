import apiClient from './axios';

export const uploadAndPredict = async (file, observationId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  
  if (observationId) {
    config.params = { observation_id: observationId };
  }
  
  const response = await apiClient.post('/predict', formData, config);
  return response.data;
};
