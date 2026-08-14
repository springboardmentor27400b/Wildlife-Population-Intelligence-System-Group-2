import apiClient from './axios';

export const getCameraTraps = async (params = {}) => {
  const response = await apiClient.get('/camera-traps', { params });
  return response.data;
};

export const getCameraTrap = async (id) => {
  const response = await apiClient.get(`/camera-traps/${id}`);
  return response.data;
};

export const createCameraTrap = async (trapData) => {
  const response = await apiClient.post('/camera-traps', trapData);
  return response.data;
};

export const updateCameraTrap = async (id, trapData) => {
  const response = await apiClient.put(`/camera-traps/${id}`, trapData);
  return response.data;
};

export const deleteCameraTrap = async (id) => {
  const response = await apiClient.delete(`/camera-traps/${id}`);
  return response.data;
};
