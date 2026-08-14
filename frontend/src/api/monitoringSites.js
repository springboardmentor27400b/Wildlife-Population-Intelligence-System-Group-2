import apiClient from './axios';

export const getMonitoringSites = async (params = {}) => {
  const response = await apiClient.get('/monitoring-sites', { params });
  return response.data;
};

export const getMonitoringSite = async (id) => {
  const response = await apiClient.get(`/monitoring-sites/${id}`);
  return response.data;
};

export const createMonitoringSite = async (siteData) => {
  const response = await apiClient.post('/monitoring-sites', siteData);
  return response.data;
};

export const updateMonitoringSite = async (id, siteData) => {
  const response = await apiClient.put(`/monitoring-sites/${id}`, siteData);
  return response.data;
};

export const deleteMonitoringSite = async (id) => {
  const response = await apiClient.delete(`/monitoring-sites/${id}`);
  return response.data;
};
