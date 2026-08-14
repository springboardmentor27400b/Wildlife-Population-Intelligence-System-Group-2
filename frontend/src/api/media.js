import apiClient from './axios';

export const createMediaLog = async (mediaData) => {
  const response = await apiClient.post('/media', mediaData);
  return response.data;
};

export const getObservationMedia = async (observationId) => {
  const response = await apiClient.get(`/media/observation/${observationId}`);
  return response.data;
};

export const deleteMediaLog = async (id) => {
  const response = await apiClient.delete(`/media/${id}`);
  return response.data;
};
