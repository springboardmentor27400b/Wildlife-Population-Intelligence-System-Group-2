import apiClient from './axios';

export const getSpeciesList = async (params = {}) => {
  const response = await apiClient.get('/species', { params });
  return response.data;
};

export const getSpeciesDetail = async (id) => {
  const response = await apiClient.get(`/species/${id}`);
  return response.data;
};

export const createSpecies = async (data) => {
  const response = await apiClient.post('/species', data);
  return response.data;
};

export const updateSpecies = async (id, data) => {
  const response = await apiClient.put(`/species/${id}`, data);
  return response.data;
};

export const deleteSpecies = async (id) => {
  const response = await apiClient.delete(`/species/${id}`);
  return response.data;
};
