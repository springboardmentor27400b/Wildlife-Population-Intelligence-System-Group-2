import apiClient from './axios';

export const getAudioSensors = async (params = {}) => {
  const response = await apiClient.get('/audio-sensors', { params });
  return response.data;
};

export const getAudioSensor = async (id) => {
  const response = await apiClient.get(`/audio-sensors/${id}`);
  return response.data;
};

export const createAudioSensor = async (sensorData) => {
  const response = await apiClient.post('/audio-sensors', sensorData);
  return response.data;
};

export const updateAudioSensor = async (id, sensorData) => {
  const response = await apiClient.put(`/audio-sensors/${id}`, sensorData);
  return response.data;
};

export const deleteAudioSensor = async (id) => {
  const response = await apiClient.delete(`/audio-sensors/${id}`);
  return response.data;
};
