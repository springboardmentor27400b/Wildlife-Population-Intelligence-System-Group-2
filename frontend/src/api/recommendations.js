import apiClient from './axios';

export const getConservationRecommendations = async () => {
  const response = await apiClient.get('/recommendations');
  return response.data;
};
