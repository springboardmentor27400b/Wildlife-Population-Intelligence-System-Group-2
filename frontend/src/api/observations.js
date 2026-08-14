import apiClient from './axios';

export const getObservations = async (params = {}) => {
  const response = await apiClient.get('/observations', { params });
  return response.data;
};

export const getObservation = async (id) => {
  const response = await apiClient.get(`/observations/${id}`);
  return response.data;
};

export const createObservation = async (obsData) => {
  const response = await apiClient.post('/observations', obsData);
  return response.data;
};

export const updateObservation = async (id, obsData) => {
  const response = await apiClient.put(`/observations/${id}`, obsData);
  return response.data;
};

export const deleteObservation = async (id) => {
  const response = await apiClient.delete(`/observations/${id}`);
  return response.data;
};

export const analyzeObservation = async (id) => {
  const response = await apiClient.post(`/observations/${id}/analyze`);
  return response.data;
};
