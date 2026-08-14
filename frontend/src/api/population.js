import apiClient from './axios';

export const getPopulationTrends = async (speciesName = null) => {
  const params = speciesName ? { species_name: speciesName } : {};
  const response = await apiClient.get('/population', { params });
  return response.data;
};
